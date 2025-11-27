# Penny Count Backend

This is the backend API for the Penny Count micro-lending management application.

## Tech Stack
- Node.js
- Express
- MongoDB (via Mongoose)
- dotenv for configuration
- CORS and body-parser middleware

## Getting Started

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Set up your `.env` file (see `.env` for example).
3. Start MongoDB locally (or update `MONGO_URI` in `.env` for remote DB).
4. Run the server:
   ```powershell
   node index.js
   ```

## API Endpoints
- Health check: `GET /`
- (To be implemented) Users, Loans, Borrowers, Payments, Lines, Collections, Commissions, Analytics, Settings, Auth

## Folder Structure
- `index.js` - Main server file
- `.env` - Environment variables
- `package.json` - Project config
- `.github/copilot-instructions.md` - Copilot custom instructions

---

This backend is designed to connect with the Penny Count React frontend and provide all necessary data and business logic via RESTful APIs.
