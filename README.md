# VedaAI - AI Assessment Creator for Teachers

VedaAI is a premium, AI-powered platform designed to help teachers create, manage, and deliver high-quality assessments in seconds. By leveraging advanced generative AI models, VedaAI transforms uploaded PDFs or text into structured question papers with diverse question types and difficulty levels.

## ✨ Features

- **AI Question Generation**: Create Multiple Choice, Short Answer, Long Answer, and Numerical problems from any context.
- **Smart PDF Processing**: Extracts text from lesson plans, chapters, or notes to ensure contextually relevant questions.
- **Teacher's Toolkit**: Built-in tools for Rubric building, Bloom's Taxonomy mapping, and performance analysis.
- **Student Group Management**: Organize your students into groups and track their assignment progress.
- **My Library**: A centralized hub for all your generated resources and past assessments.
- **Fully Responsive**: Premium UI/UX designed for both desktop productivity and mobile convenience.

## 🚀 Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Lucide Icons, Zustand (State Management)
- **Backend**: Node.js, Express, Socket.IO (Real-time updates), MongoDB (Mongoose)
- **AI Engine**: Google Gemini API
- **Queueing Engine**: BullMQ with Redis (for handling background generation tasks)

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Running locally or a cloud URI)
- Redis server (required for the BullMQ backend workers)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/VedaAI.git
   cd VedaAI
   ```

2. Setup Backend:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. Setup Frontend:
   ```bash
   cd ../frontend
   npm install
   # Create a .env.local file with NEXT_PUBLIC_API_URL
   npm run dev
   ```

## 🌐 Deployment on Vercel

VedaAI is pre-configured for **Vercel** monorepo deployment.

1. Push your code to a GitHub repository.
2. Link the repository to your Vercel account.
3. Vercel will automatically detect the root `vercel.json` and route `/api` requests to the Express server while serving the Next.js frontend.
4. Add the following **Environment Variables** in the Vercel project settings:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `MONGODB_URI`: Your MongoDB connection string.
   - `REDIS_URL`: URL for your Redis instance (e.g., from Upstash).

## 📄 License

This project is licensed under the MIT License.
