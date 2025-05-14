# Telegram Login Implementation

A simple implementation of Telegram Login for web applications. This project demonstrates how to integrate the Telegram Login Widget into a web page and display the authenticated user's information.

## Features

- Telegram Login Widget integration
- Client-side authentication handling
- Display of user profile and authentication data
- Responsive design

## Prerequisites

- A Telegram bot created via [@BotFather](https://t.me/BotFather)
- A domain configured for your bot (can be localhost for development, or a Vercel/ngrok domain for production)

## Setup Instructions

### 1. Create and Configure a Telegram Bot

1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the instructions to create a new bot
3. Note the **bot token** provided by BotFather
4. Still in BotFather, run `/setdomain` and set your domain:
   ```
   /setdomain
   ```
   Then enter your domain (e.g., `https://your-project.vercel.app` or `https://xxxx-xxx-xxx-xx.ngrok-free.app`)

### 2. Configure the Application

1. Open `app/public/index.html`
2. Replace `eric_spider_bot` in the script tag with your bot's username (without the @ symbol)

### 3. Local Development

For local development, you can use a static file server or the included Express server:

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Then visit `http://localhost:3000` in your browser.

For local testing, you'll need to use a service like ngrok to expose your local server to the internet:

```bash
ngrok http 3000
```

Then configure your bot's domain with the ngrok URL.

### 4. Deploying to Vercel

This project is configured for easy deployment to Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

6. Click "Deploy"

After deployment, you'll get a Vercel domain (e.g., `your-project.vercel.app`). Configure this domain with BotFather:

1. Talk to [@BotFather](https://t.me/BotFather) on Telegram
2. Run `/setdomain` and select your bot
3. Enter your Vercel domain (e.g., `https://your-project.vercel.app`)

## How It Works

### Frontend

The Telegram Login Widget is embedded in the HTML page. When a user clicks the login button:

1. Telegram shows a native approval dialog
2. Upon approval, Telegram calls the `onTelegramAuth()` function with a signed payload
3. The frontend stores this payload in localStorage
4. The user is redirected to the app page, which displays their profile and authentication data

## Customization

- Modify the widget appearance by changing the data attributes in `index.html`
- Customize the app page layout and design in `app.html`
- Add additional functionality as needed

## References

- [Telegram Login Widget Documentation](https://core.telegram.org/widgets/login)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Vercel Documentation](https://vercel.com/docs)