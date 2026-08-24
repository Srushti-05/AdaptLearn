# AdaptLearn - Intelligent Adaptive Coding Platform

AdaptLearn is a full-stack platform built with the MERN stack and Vite, featuring user authentication, code execution, and an adaptive learning engine that tracks progress and suggests problems based on your weak topics.

## Prerequisites
- Node.js (v16+)
- MongoDB Atlas cluster URL

## Getting Started

### 1. Database Configuration
1. Navigate to the `backend` directory.
2. Rename `.env.example` to `.env` (or create a new `.env` file).
3. Insert your actual MongoDB connection string into `MONGO_URI`.

### 2. Seeding the Database
Before running the app, populate it with some sample Python problems we've provided:
```bash
cd backend
npm install
npm run seed
```

### 3. Running the Backend
In the `backend` directory, start the server (runs on port 5000):
```bash
npm run dev
```

### 4. Running the Frontend
Open a new terminal pane, navigate to the `frontend` directory, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

Now open the provided local URL (usually `http://localhost:5173`) in your browser to start using AdaptLearn!

## Features
- **Piston API Integration:** Execute Python code securely and freely, right in the browser.
- **Monaco Editor:** Beautiful, VSCode-like editor experience.
- **Adaptive Engine:** Analyzes failed submissions to map weak topics and intelligently suggest subsequent problems.
- **Progress Tracking:** Beautiful analytics using Recharts.
