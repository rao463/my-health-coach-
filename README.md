# My Health Coach

**An AI-Powered Personal Health Assistant**

My Health Coach is a full-stack web application developed as a Computer Science graduation project at Arab Open University (AOU), Lebanon. The platform aims to help users manage their health information, monitor daily wellness habits, and access AI-assisted health and lifestyle guidance through a centralized, user-friendly interface.

## Overview

Managing personal health information across different tools can be challenging. My Health Coach brings essential health and wellness features together in one platform, supporting users in organizing health records, tracking daily habits, and receiving general guidance.

## Key Features

* **AI Symptom Checker** — Explore possible explanations for reported symptoms and receive general health information.
* **Maya AI Assistant** — An AI-powered assistant designed to provide general health and wellness guidance.
* **Medication Management** — Organize medication information and reminders.
* **Nutrition Tracking** — Record and monitor nutrition-related information.
* **Fitness Tracking** — Track fitness activities and receive activity suggestions.
* **Mental Wellness Support** — Access general mental wellness guidance.
* **Health Record Management** — Organize personal health information and records.
* **User Authentication** — Registration and login functionality.
* **Responsive User Interface** — A clean interface designed for convenient use across different screen sizes.

## Technology Stack

| Area              | Technologies                       |
| ----------------- | ---------------------------------- |
| Frontend          | React.js, JavaScript, Tailwind CSS |
| Navigation and UI | React Router, Lucide React         |
| Backend           | Node.js, Express.js                |
| Database          | MongoDB, Mongoose                  |
| AI Integration    | Ollama, Gemma 3 1B                 |
| Development Tools | Visual Studio Code, npm, Postman   |

## Project Structure

```text
my-health-coach/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
├── components/
├── public/
├── src/
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

* [Node.js](https://nodejs.org/)
* npm, included with Node.js
* [MongoDB Atlas](https://www.mongodb.com/atlas) or a compatible MongoDB deployment
* [Ollama](https://ollama.com/) for local AI functionality

### 1. Clone the Repository

```bash
git clone https://github.com/rao463/my-health-coach-.git
cd my-health-coach-
```

### 2. Install Frontend Dependencies

From the project root directory, run:

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create or configure the `backend/.env` file using the variable names required by the backend code.

Configure the MongoDB connection string and any other required environment variables. Keep credentials and API keys private, and never commit the `.env` file to GitHub.

### 5. Start the Backend

From the `backend` directory, run:

```bash
npm start
```

Keep the terminal open while the backend is running.

### 6. Start the Frontend

Open a separate terminal in the project root directory and run:

```bash
npm start
```

The React development server is normally available at:

http://localhost:3000

### 7. Set Up the AI Model

Ensure Ollama is installed and the required model is available:

```bash
ollama pull gemma3:1b
```

Test the model with:

```bash
ollama run gemma3:1b
```

The backend must also be configured to communicate with the local Ollama service. AI functionality depends on the backend configuration and the availability of the required services.

## Security and Medical Disclaimer

My Health Coach is an educational software project intended to support health information organization and general wellness awareness. AI-generated responses are informational only and do not constitute medical diagnosis or treatment. The application does not replace professional medical advice.

Do not enter sensitive health information into an environment unless it is appropriately secured.

## Future Enhancements

* Improve AI response quality and personalization.
* Expand language support.
* Enhance medication reminders and notifications.
* Strengthen security and privacy protections.
* Introduce additional wellness analytics and tracking capabilities.
* Evaluate usability and accessibility through user testing.

## Academic Project

**Project:** My Health Coach
**Institution:** Arab Open University (AOU), Lebanon
**Program:** Bachelor of Science in Computer Science

---

*My Health Coach — Bringing health information and wellness guidance together in one platform.*

