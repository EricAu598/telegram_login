# Telegram Login Implementation

This is a minimal implementation of Telegram Login for web applications. It provides both frontend and backend components for authenticating users via Telegram.

## Features

- Telegram Login Widget integration
- Server-side verification of Telegram authentication data
- JWT token generation for authenticated users
- Simple protected route example

## Prerequisites

- Node.js (v14+)
- A Telegram bot created via [@BotFather](https://t.me/BotFather)
- A domain configured for your bot (can be localhost for development)

## Setup Instructions

### 1. Create and Configure a Telegram Bot

1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the instructions to create a new bot
3. Note the **bot token** provided by BotFather
4. Still in BotFather, run `/setdomain` and set your domain:
   ```
   /setdomain
   ```
   Then enter your domain (e.g., `https://example.com` or `http://localhost:3000` for local development)

### 2. Configure the Application

1. Clone this repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your bot token and a secure JWT secret:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   JWT_SECRET=your_secure_random_string
   ```

### 3. Update the Frontend

1. Open `app/public/index.html`
2. Replace `YourBotUserName` in the script tag with your bot's username (without the @ symbol)

### 4. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Start the server
npm start

# For development with auto-restart
npm run dev
```

5. Visit `http://localhost:3000` in your browser

## How It Works

### Frontend

The Telegram Login Widget is embedded in the HTML page. When a user clicks the login button:

1. Telegram shows a native approval dialog
2. Upon approval, Telegram calls the `onTelegramAuth()` function with a signed payload
3. The frontend sends this payload to the backend for verification

### Backend

The server verifies the authentication data:

1. Builds a data-check string from the payload
2. Computes an HMAC-SHA-256 signature using the bot token
3. Compares the computed signature with the one provided by Telegram
4. Checks that the authentication is not too old (optional)
5. If verification passes, issues a JWT token for the user

## Security Considerations

- The bot token must be kept secret
- Always verify the authentication data on the server side
- Check that the authentication is not too old to prevent replay attacks
- Use HTTPS in production to protect data in transit

## Customization

- Modify the widget appearance by changing the data attributes in `index.html`
- Customize the JWT payload and expiration in `server.js`
- Add additional protected routes as needed

## References

- [Telegram Login Widget Documentation](https://core.telegram.org/widgets/login)
- [Telegram Bot API](https://core.telegram.org/bots/api)