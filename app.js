// Import Express.js
const express = require('express');
const path = require('path');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static assets (e.g., privacy policy text)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
let privacyPolicyUrl = process.env.PRIVACY_POLICY_URL || null;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

// Route to set the privacy policy URL for WhatsApp tests
app.post('/privacy-policy', (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'Missing url' });
  }

  try {
    const parsed = new URL(url);
    privacyPolicyUrl = parsed.toString();
    console.log(`Privacy policy URL set to ${privacyPolicyUrl}`);
    return res.status(200).json({ privacyPolicyUrl });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid url' });
  }
});

// Route to retrieve the current privacy policy URL
app.get('/privacy-policy', (req, res) => {
  if (!privacyPolicyUrl) {
    return res.status(404).json({ error: 'Privacy policy URL not set' });
  }
  res.status(200).json({ privacyPolicyUrl });
});

// Route to serve the privacy policy text file
app.get('/privacy-policy/text', (req, res) => {
  const privacyPolicyPath = path.join(__dirname, 'public', 'privacy-policy.txt');
  res.sendFile(privacyPolicyPath);
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
