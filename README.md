My Health Coach 🩺

My Health Coach is an AI-powered health assistant web application developed as a Computer Science graduation project. It helps users organize their health information, track daily wellness activities, and access personalized health guidance through a web-based platform.

✨ Features
AI Symptom Checker: Explore possible explanations for reported symptoms and receive general health guidance.
Maya AI Assistant: Interact with an AI-powered assistant for health and wellness support.
Medication Reminders: Manage medications and keep track of medication schedules.
Nutrition Tracking: Record and monitor nutrition-related information.
Fitness Tracking: Track fitness activities and receive personalized activity suggestions.
Mental Health Support: Access general mental wellness guidance.
Health Record Management: Organize personal health records.
User Authentication: Registration and login functionality.
Responsive Interface: A user-friendly interface designed for convenient access across screen sizes.
🛠️ Technologies Used

Frontend

React.js
JavaScript
Tailwind CSS
React Router
Lucide React

Backend

Node.js
Express.js
REST APIs

Database

MongoDB
Mongoose

AI Integration

Ollama
Gemma 3 1B (gemma3:1b)
📂 Project Structure
my-health-coach/
├── backend/       # Backend server, API routes, and models
├── components/    # Shared UI components
├── public/        # Public assets and PWA files
├── src/           # React application source code
├── package.json   # Frontend dependencies and scripts
└── README.md      # Project documentation
🚀 Getting Started
Prerequisites

Install or prepare the following:

Node.js and npm
MongoDB Atlas or a compatible MongoDB instance
Ollama for local AI integration
1. Clone the Repository
git clone https://github.com/rao463/my-health-coach-.git
cd my-health-coach-
2. Install Frontend Dependencies

From the project root directory, run:

npm install
3. Install Backend Dependencies
cd backend
npm install
4. Configure Environment Variables

Create or update backend/.env using the environment variable names expected by the backend code.

Configure the MongoDB connection string and any other required settings. Keep passwords, API keys, tokens, and other secrets private. Never commit your .env file to GitHub.

5. Start the Backend

From the backend directory, run:

npm start

Keep the terminal open while the backend is running.

6. Start the Frontend

Open a second terminal in the project root directory and run:

npm start

The React development server normally opens at:

http://localhost:3000

7. Configure Ollama

Start Ollama and ensure the required model is available:

ollama pull gemma3:1b
ollama run gemma3:1b

The backend must be configured to connect to the local Ollama service. AI features may not work until the backend connection, model configuration, and required services are available.

🔒 Privacy and Medical Disclaimer

My Health Coach is an educational graduation project intended to support personal health organization and general wellness awareness. Its AI-generated information is not a medical diagnosis and does not replace advice from qualified healthcare professionals.

Users should avoid entering sensitive personal health information into an environment that is not appropriately secured.

🎓 Project Information

Developed as a Computer Science graduation project at Arab Open University (AOU), Lebanon.

📌 Future Improvements
Improve AI responses and personalization.
Enhance notifications and reminders.
Expand multilingual support.
Improve data security and user experience.
Explore additional health tracking and analytics features.

My Health Coach — Supporting healthier habits through technology.
