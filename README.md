# JustPost

JustPost is a modern minimalist blog platform with a Node.js and Express API plus a Vite React web app.

## Project Structure

- `server` - Express API intended for Railway deployment.
- `client` - React web app intended for Vercel deployment.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `server/.env` from `server/.env.example`.
3. Create `client/.env` from `client/.env.example`.
4. Run both apps:

   ```bash
   npm run dev
   ```

## Deployment

### API on Railway

1. Create a Railway project and connect this repository.
2. Set the service root directory to `server`.
3. Add the environment variables from `server/.env.example`.
4. Set `CLIENT_URL` to your Vercel app URL.
5. Deploy. Railway will run `npm start`.

### Web App on Vercel

1. Create a Vercel project and connect this repository.
2. Set the root directory to `client`.
3. Add `VITE_API_URL` with your Railway API URL.
4. Deploy. Vercel will run `npm run build`.
