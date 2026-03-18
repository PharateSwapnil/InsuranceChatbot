# GitHub Actions Deployment Guide

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that:

1. installs dependencies,
2. runs `npm run check`,
3. runs `npm run build`,
4. uploads the build to your server over SSH, and
5. restarts the app with PM2.

## Required GitHub Actions secrets

Save these in **GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret**.

### Required secrets

- `VPS_HOST` - Your server public IP or DNS name.
- `VPS_USERNAME` - SSH username for the server, for example `ubuntu` or `ec2-user`.
- `VPS_SSH_KEY` - Private SSH key contents used by GitHub Actions to log into the server.

### Optional secrets

- `VPS_PORT` - SSH port. Defaults to `22` if omitted.
- `APP_DIR` - Deployment directory on the server. Defaults to `/opt/insurance-chatbot`.

## Credentials that should stay on the server

Your application runtime secrets should normally live in a `.env` file on the server inside the deployed app directory, not in the workflow file.

Typical values include:

- `NODE_ENV=production`
- `PORT=5000`
- `HOST=0.0.0.0`
- `GROQ_API_KEY=...`
- `VITE_GROQ_API_KEY=...`
- `SESSION_SECRET=...`
- `DATABASE_URL=...`

## Server prerequisites

Before the workflow can deploy successfully, your server should already have:

- Node.js 20+
- npm
- PM2 installed globally (`npm install -g pm2`)
- a writable deployment directory such as `/opt/insurance-chatbot`
- a `.env` file in that directory with your production settings

## Recommended first-time server setup

```bash
sudo mkdir -p /opt/insurance-chatbot
sudo chown -R $USER:$USER /opt/insurance-chatbot
npm install -g pm2
```

Then create `/opt/insurance-chatbot/.env`.

## How deployment works

On every push to `main` or when manually triggered:

- GitHub Actions builds the project
- uploads `dist`, `package.json`, and `package-lock.json`
- runs `npm ci --omit=dev` on the server
- restarts the app as `insurance-chatbot` using PM2

## If you want to host by public IP

Set the following in your server `.env`:

```env
HOST=0.0.0.0
PORT=5000
```

Then expose port `5000` directly, or place Nginx in front of it and proxy from port `80`/`443`.
