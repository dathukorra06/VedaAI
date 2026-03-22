# VedaAI - AI Assessment Creator for Teachers demo vedio link:- https://drive.google.com/file/d/18EDeGrexPBHQDLPfdM2iK3t4we13myfm/view?usp=sharing

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

## 🌐 Security & Environment setup

To protect your API keys and database credentials, **never commit your `.env` file to version control.** Your project is pre-configured with a `.gitignore` that keeps these files private.

### Local Settings
Create a `.env` file in the `backend/` directory using the provided template:
1. `cp backend/.env.example backend/.env`
2. Fill in your `GEMINI_API_KEY`, `MONGODB_URI`, etc.

### Vercel Deployment
When deploying to Vercel, you must manually add these keys in the **Vercel Dashboard**:
1. Navigate to **Project Settings** > **Environment Variables**.
2. Add the following keys:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `MONGODB_URI`: Your MongoDB connection URL.
   - `REDIS_URL`: Your Redis instance URL (required for candidate generation queues).
   - `NEXT_PUBLIC_API_URL`: Set this to your production backend URL (e.g., `https://your-api.vercel.app`).

## 🌐 Deployment on Render (Recommended)
VedaAI includes a `render.yaml` Blueprint which tells Render exactly how to deploy both the Express API and Next.js frontend automatically.

1. Create an account on [Render.com](https://render.com/).
2. From the Render Dashboard, click **New +** and select **Blueprint**.
3. Connect your GitHub account and select this repository.
4. Render will automatically detect the two services (`veda-ai-backend` and `veda-ai-frontend`). Provide your private environment variables (`GEMINI_API_KEY` and `MONGODB_URI`) when prompted.
5. Click **Apply** to deploy the full stack!

*Note: The frontend and backend are configured to communicate perfectly out of the box using their generated `.onrender.com` URLs.*

## 📄 License
This project is licensed under the MIT License.
