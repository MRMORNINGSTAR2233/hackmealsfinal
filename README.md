# Hackathon Feast Tracker

A modern meal tracking system for hackathon events with real-time QR code scanning and database persistence.

## 🚀 Quick Start

### Prerequisites
- Node.js & npm installed
- Supabase account and project

### Setup

1. **Clone and install dependencies:**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

2. **Configure Supabase:**
```bash
# Run the setup helper
node setup-supabase.js
```

Follow the instructions to:
- Get your Supabase anon key
- Set up the database schema
- Update your `.env` file

3. **Start development server:**
```bash
npm run dev
```

4. **Access the application:**
- Open http://localhost:8080
- Admin login: `admin` / `admin123`

## 🏗️ Architecture

**Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
**Backend:** Supabase (PostgreSQL + Auth + Real-time)
**State:** Zustand with Supabase integration

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Detailed integration instructions
- [Original Lovable README](./README-LOVABLE.md) - Development environment options

## 🔧 Development

This project supports multiple development approaches:

**Use Lovable (Recommended for UI changes)**

Simply visit the [Lovable Project](https://lovable.dev/projects/58dcc266-a10b-4ffb-82ac-4baed82d9adc) and start prompting.

**Local Development**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/58dcc266-a10b-4ffb-82ac-4baed82d9adc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
