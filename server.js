const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Trust the first proxy (needed on most PaaS hosts so rate-limiting sees the
// real client IP instead of the proxy's IP).
app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true
}));

app.use(express.json({ limit: '20kb' }));

// --- Email transport -------------------------------------------------------

function buildTransporter() {
  const service = process.env.EMAIL_SERVICE;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Missing EMAIL_USER/EMAIL_PASS configuration.');
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass }
    });
  }

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);

  if (!host) {
    throw new Error('Missing EMAIL_HOST configuration.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

let transporterPromise = null;

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(buildTransporter());
  }
  return transporterPromise;
}

// --- Rate limiting -----------------------------------------------------------
// Generous enough for real visitors, tight enough to blunt scripted abuse.

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many inquiries from this address. Please try again later.' }
});

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

// --- Validation helpers ------------------------------------------------------

const MAX_LENGTHS = {
  name: 120,
  email: 254,
  phone: 40,
  destination: 120,
  dates: 120,
  guests: 40,
  budget: 60,
  style: 60,
  message: 2000
};

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function tooLong(value, field) {
  return value.length > MAX_LENGTHS[field];
}

// Deliberately lenient: real phone numbers come in every shape (spaces,
// dashes, parentheses, extensions, local formats without a country code).
// This just rejects obvious junk (too short, letters, no digits at all)
// rather than trying to strictly validate an international format.
function isPlausiblePhone(value) {
  const digitCount = (value.match(/\d/g) || []).length;
  if (digitCount < 6 || digitCount > 15) return false;
  return /^[\d\s()+\-.ext]+$/i.test(value);
}

function validateBooking(body) {
  const errors = [];
  const data = {
    name: clean(body.name),
    email: clean(body.email),
    phone: clean(body.phone),
    destination: clean(body.destination),
    dates: clean(body.dates),
    guests: clean(body.guests),
    budget: clean(body.budget),
    style: clean(body.style),
    message: clean(body.message)
  };

  if (!data.name || tooLong(data.name, 'name')) errors.push('A valid name is required.');
  if (!data.email || !validator.isEmail(data.email) || tooLong(data.email, 'email')) {
    errors.push('A valid email address is required.');
  }
  if (data.phone && (tooLong(data.phone, 'phone') || !isPlausiblePhone(data.phone))) {
    errors.push('Phone number looks invalid.');
  }
  if (!data.destination || tooLong(data.destination, 'destination')) errors.push('Destination is required.');
  if (!data.dates || tooLong(data.dates, 'dates')) errors.push('Travel window is required.');
  if (!data.guests || tooLong(data.guests, 'guests')) errors.push('Number of guests is required.');
  if (data.budget && tooLong(data.budget, 'budget')) errors.push('Budget value is too long.');
  if (data.style && tooLong(data.style, 'style')) errors.push('Style value is too long.');
  if (data.message && tooLong(data.message, 'message')) errors.push('Message is too long (max 2000 characters).');

  return { data, errors };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- Routes --------------------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'Booking mail service is running.' });
});

app.post('/api/book-journey', bookingLimiter, async (req, res) => {
  try {
    const body = req.body || {};

    // Honeypot: real visitors never fill this hidden field.
    if (clean(body.website)) {
      return res.status(400).json({ error: 'Spam detected.' });
    }

    const { data, errors } = validateBooking(body);
    if (errors.length) {
      return res.status(400).json({ error: errors[0], errors });
    }

    const toEmail = process.env.TO_EMAIL || process.env.EMAIL_USER;
    if (!toEmail) {
      return res.status(500).json({
        error: 'No destination email is configured. Set TO_EMAIL or EMAIL_USER in your environment.'
      });
    }

    const transporter = await getTransporter();
    const { name, email, phone, destination, dates, guests, budget, style, message } = data;
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      destination: escapeHtml(destination),
      dates: escapeHtml(dates),
      guests: escapeHtml(guests),
      budget: escapeHtml(budget),
      style: escapeHtml(style),
      message: escapeHtml(message)
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Journey Inquiry – Aurelia Journeys</title>
  <style>
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f1ed; }
    .container { max-width: 600px; margin: 0 auto; background: #fdfbf6; }
    .header { background: linear-gradient(135deg, #152a3a 0%, #1f3a4d 100%); padding: 40px 24px; text-align: center; }
    .logo { font-size: 24px; font-weight: 700; color: #fdfbf6; letter-spacing: 1px; margin: 0; font-family: 'Bodoni Moda', Georgia, serif; }
    .logo-sub { font-size: 10px; letter-spacing: 2px; color: #d9794b; margin-top: 4px; }
    .content { padding: 48px 32px; }
    .greeting { font-size: 18px; color: #0d1b2e; margin: 0 0 8px; font-weight: 600; }
    .intro { font-size: 14px; color: #545c68; line-height: 1.6; margin: 0 0 32px; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .detail-item { background: #f5f1ed; padding: 16px; border-radius: 8px; }
    .detail-label { font-size: 11px; color: #04837c; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 6px; }
    .detail-value { font-size: 15px; color: #0d1b2e; font-weight: 500; }
    .message-section { background: linear-gradient(135deg, rgba(255, 122, 82, 0.08) 0%, rgba(208, 67, 42, 0.06) 100%); padding: 20px; border-left: 4px solid #d0432a; border-radius: 4px; margin-top: 32px; }
    .message-label { font-size: 11px; color: #d0432a; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 10px; }
    .message-text { font-size: 14px; color: #0d1b2e; line-height: 1.7; margin: 0; }
    .cta-section { margin-top: 40px; text-align: center; }
    .cta-button { display: inline-block; background: #d0432a; color: #fdfbf6; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; }
    .cta-button:hover { background: #ff7a52; }
    .footer { background: #0d1b2e; color: #cfd6d1; padding: 32px; text-align: center; font-size: 12px; }
    .footer-brand { font-size: 14px; font-weight: 600; color: #fdfbf6; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">AURELIA<div class="logo-sub">JOURNEYS</div></h1>
    </div>
    <div class="content">
      <p class="greeting">Hello Aurelia Team,</p>
      <p class="intro">A new traveler has expressed interest in planning their next journey with us. Here are their details:</p>
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">✈ Destination</div>
          <div class="detail-value">${safe.destination}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📅 Travel Window</div>
          <div class="detail-value">${safe.dates}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">👥 Guests</div>
          <div class="detail-value">${safe.guests}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">💰 Budget</div>
          <div class="detail-value">${safe.budget || 'Not specified'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">🎨 Travel Style</div>
          <div class="detail-value">${safe.style || 'Not specified'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">📧 Email</div>
          <div class="detail-value"><a href="mailto:${safe.email}" style="color: #d0432a; text-decoration: none;">${safe.email}</a></div>
        </div>
      </div>
      <div style="background: #f5f1ed; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
        <div class="detail-label">Traveler Information</div>
        <p style="margin: 12px 0 0; font-size: 15px; color: #0d1b2e;">
          <strong>${safe.name}</strong><br>
          ${safe.phone ? `Phone: ${safe.phone}` : 'Phone: Not provided'}
        </p>
      </div>
      ${message ? `
      <div class="message-section">
        <div class="message-label">💭 Their Message</div>
        <p class="message-text">"${safe.message}"</p>
      </div>
      ` : ''}
      <div class="cta-section">
        <a href="mailto:${safe.email}" class="cta-button">Reply to ${safe.name.split(' ')[0]}</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">Aurelia Journeys</div>
      <p style="margin: 8px 0; font-size: 11px; color: #7c8682;">Bespoke luxury travel for people who'd rather feel a place than tick it off a list.</p>
      <p style="margin: 12px 0 0; font-size: 10px; color: #545c68;">© 2026 Aurelia Journeys. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We've received your inquiry — Aurelia Journeys</title>
  <style>
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f1ed; }
    .container { max-width: 560px; margin: 0 auto; background: #fdfbf6; }
    .header { background: linear-gradient(135deg, #152a3a 0%, #1f3a4d 100%); padding: 40px 24px; text-align: center; }
    .logo { font-size: 22px; font-weight: 700; color: #fdfbf6; letter-spacing: 1px; margin: 0; font-family: 'Bodoni Moda', Georgia, serif; }
    .logo-sub { font-size: 10px; letter-spacing: 2px; color: #d9794b; margin-top: 4px; }
    .content { padding: 40px 32px; }
    h2 { font-family: 'Bodoni Moda', Georgia, serif; color: #0d1b2e; font-size: 22px; margin: 0 0 16px; }
    p { color: #545c68; font-size: 14px; line-height: 1.7; }
    .footer { background: #0d1b2e; color: #cfd6d1; padding: 28px; text-align: center; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1 class="logo">AURELIA<div class="logo-sub">JOURNEYS</div></h1></div>
    <div class="content">
      <h2>Thank you, ${safe.name.split(' ')[0]}.</h2>
      <p>We've received your inquiry about ${safe.destination} and a travel designer will be in touch within 24 hours to start shaping your journey.</p>
      <p>In the meantime, feel free to reply to this email with anything else we should know.</p>
    </div>
    <div class="footer">© 2026 Aurelia Journeys. All rights reserved.</div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"Aurelia Journeys" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      replyTo: email,
      subject: `New journey inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nDestination: ${destination}\nTravel window: ${dates}\nGuests: ${guests}\nBudget: ${budget || 'Not provided'}\nStyle: ${style || 'Not provided'}\nMessage: ${message || 'No message provided'}`,
      html
    });

    // Best-effort auto-responder — don't fail the request if this errors.
    try {
      await transporter.sendMail({
        from: `"Aurelia Journeys" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'We\u2019ve received your inquiry — Aurelia Journeys',
        text: `Thank you, ${name}. We've received your inquiry about ${destination} and a travel designer will be in touch within 24 hours.`,
        html: confirmationHtml
      });
    } catch (autoResponderError) {
      console.error('Auto-responder failed:', autoResponderError);
    }

    res.json({ ok: true, message: 'Your inquiry was sent successfully.' });
  } catch (error) {
    console.error('Booking mail failed:', error);
    res.status(500).json({ error: 'Unable to send inquiry right now. Please try again shortly.' });
  }
});

app.post('/api/subscribe', newsletterLimiter, async (req, res) => {
  try {
    const email = clean((req.body || {}).email);
    if (!email || !validator.isEmail(email) || email.length > MAX_LENGTHS.email) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const toEmail = process.env.TO_EMAIL || process.env.EMAIL_USER;
    if (!toEmail) {
      return res.status(500).json({ error: 'Newsletter is not configured yet.' });
    }

    const transporter = await getTransporter();
    await transporter.sendMail({
      from: `"Aurelia Journeys" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      replyTo: email,
      subject: 'New newsletter signup',
      text: `New newsletter subscriber: ${email}`
    });

    res.json({ ok: true, message: 'Thank you — you are on the list.' });
  } catch (error) {
    console.error('Newsletter signup failed:', error);
    res.status(500).json({ error: 'Unable to subscribe right now. Please try again shortly.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Booking mail server listening on port ${port}`);
});
