import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRY = '24h';

// Check if bot token is configured
if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in environment variables');
  console.error('Please create a .env file with your bot token');
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.post('/auth/telegram', (req, res) => {
  console.log('Received Telegram auth request:', req.body);
  const data = req.body;
  const { hash, ...fields } = data;

  // Validate required fields
  if (!hash || !fields.auth_date || !fields.id) {
    console.error('Invalid auth data: missing required fields');
    return res.status(400).json({ 
      ok: false, 
      error: 'Invalid auth data: missing required fields' 
    });
  }

  // 1. Build the data-check string
  const dataCheckString = Object.keys(fields)
    .sort()
    .map(k => `${k}=${fields[k]}`)
    .join('\n');
  console.log('Data check string:', dataCheckString);

  // 2. Compute the HMAC-SHA-256 with the bot token
  const secret = crypto
    .createHash('sha256')
    .update(BOT_TOKEN)
    .digest();
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');
  console.log('Computed HMAC:', hmac);
  console.log('Received hash:', hash);

  // 3. Compare (constant-time)
  if (hmac !== hash) {
    console.error('Invalid Telegram signature');
    return res.status(401).json({ 
      ok: false, 
      error: 'Invalid Telegram signature' 
    });
  }

  // 4. Optional extra: expire after 1 day
  const now = Math.floor(Date.now() / 1000);
  if (now - Number(fields.auth_date) > 86400) {
    console.error('Login too old');
    return res.status(401).json({ 
      ok: false, 
      error: 'Login too old' 
    });
  }

  // 5. All good – issue JWT
  // Store both user data and original Telegram callback data
  const token = jwt.sign(
    { 
      user_id: fields.id,
      username: fields.username,
      first_name: fields.first_name,
      last_name: fields.last_name,
      photo_url: fields.photo_url,
      // Store the original Telegram callback data
      telegram_data: {
        ...fields,
        hash
      }
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRY }
  );

  // Log successful authentication
  console.log(`User authenticated: ${fields.username || fields.first_name} (ID: ${fields.id})`);
  console.log('JWT token issued:', token.substring(0, 20) + '...');
  
  return res.json({ ok: true, jwt: token });
});

// Simple protected route example
app.get('/app', (req, res) => {
  console.log('Accessed /app route');
  res.send(`
    <html>
      <head>
        <title>Protected Page</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
          }
          .card {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            text-align: left;
            overflow-x: auto;
          }
          .tabs {
            display: flex;
            margin-bottom: 10px;
          }
          .tab {
            padding: 10px 20px;
            cursor: pointer;
            border: 1px solid #ddd;
            background-color: #f1f1f1;
            border-radius: 4px 4px 0 0;
            margin-right: 5px;
          }
          .tab.active {
            background-color: #0088cc;
            color: white;
            border-color: #0088cc;
          }
          .tab-content {
            display: none;
          }
          .tab-content.active {
            display: block;
          }
          .button {
            display: inline-block;
            background-color: #0088cc;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
            margin-top: 20px;
            cursor: pointer;
          }
          .button:hover {
            background-color: #006699;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Authentication Successful! 🎉</h1>
          <p>You've successfully logged in with Telegram.</p>
          
          <div class="tabs">
            <div class="tab active" onclick="showTab('jwt-tab')">JWT Token</div>
            <div class="tab" onclick="showTab('telegram-tab')">Telegram Callback</div>
          </div>
          
          <div id="jwt-tab" class="tab-content active">
            <h3>JWT Token Contents:</h3>
            <pre id="token-data">Loading...</pre>
          </div>
          
          <div id="telegram-tab" class="tab-content">
            <h3>Original Telegram Callback Data:</h3>
            <pre id="telegram-data">Loading...</pre>
          </div>
          
          <a href="/" class="button" id="logout">Logout</a>
        </div>
        
        <script>
          // Get and display token data
          const token = localStorage.getItem('auth_token');
          if (!token) {
            document.body.innerHTML = '<div class="card"><h1>Authentication Error</h1><p>No authentication token found. Please <a href="/">login</a> first.</p><pre>Debug: localStorage.auth_token is ' + (localStorage.getItem('auth_token') || 'null') + '</pre></div>';
          } else {
            // Decode JWT payload (middle part between dots)
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              
              // Display JWT token data
              document.getElementById('token-data').textContent = 
                JSON.stringify(payload, null, 2);
              
              // Display original Telegram callback data
              if (payload.telegram_data) {
                document.getElementById('telegram-data').textContent = 
                  JSON.stringify(payload.telegram_data, null, 2);
              } else {
                document.getElementById('telegram-data').textContent = 
                  'No Telegram callback data found in token';
              }
            } catch (e) {
              document.getElementById('token-data').textContent = 
                'Error decoding token: ' + e.message;
              document.getElementById('telegram-data').textContent = 
                'Error decoding token: ' + e.message;
            }
          }
          
          // Tab functionality
          function showTab(tabId) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Deactivate all tabs
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Activate the selected tab
            document.getElementById(tabId).classList.add('active');
            
            // Activate the clicked tab button
            if (tabId === 'jwt-tab') {
              document.querySelectorAll('.tab')[0].classList.add('active');
            } else {
              document.querySelectorAll('.tab')[1].classList.add('active');
            }
          }
          
          // Logout functionality
          document.getElementById('logout').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('auth_token');
            window.location.href = '/';
          });
        </script>
      </body>
    </html>
  `);
});

// Fallback route
app.get('*', (req, res) => {
  console.log('Accessed fallback route:', req.url);
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`- Login page: http://localhost:${PORT}`);
  console.log(`- Protected page: http://localhost:${PORT}/app`);
});