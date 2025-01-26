# NavigAIt
> Accelerated intelligent onboarding for company success

[![Imgur](https://i.imgur.com/w6ldwPf.png)](https://www.youtube.com/watch?v=XZEQY9k4qhI)

## 💡 Inspiration

Getting started in a new internship or job is never easy. Navigating a new physical environment, codebase, and tech stack often means spending the first few weeks learning how to download dependencies and navigate documentation instead of contributing meaningfully. Many onboarding processes rely on outdated, hard-to-find documentation, and even mentors struggle to help due to the passage of time since their own onboarding.

We saw an opportunity to address these inefficiencies using AI-driven technologies inspired by tools like GitHub CoPilot. This led to **NavigAIt**: an AI assistant designed to streamline onboarding, providing live, personalized support for new employees while enabling a seamless start to their journey.

## 🚀 What It Does

**NavigAIt** provides real-time, hands-on assistance to users during the onboarding process by analyzing their screens and responding to their questions. Key features include:

- **Live Feedback:** Continuous audio and display input are analyzed to guide users through tasks.
- **Error Detection:** Identifies mistakes (e.g., downloading the wrong version of a tool) and provides corrections.
- **Multimodal Assistance:** Combines **Text-to-Speech (TTS)**, **Speech-to-Text (STT)**, and display analysis for a highly interactive experience.
- **24/7 Support:** Employees can get instant help without waiting for mentor availability.
- **Consistent Training:** Ensures that all employees receive uniform onboarding, improving team cohesion.

## 🛠 How We Built It

1. **Frontend:**
   - Built using **Next.js** and **React** for a seamless user interface.
   - Live user input and screen capture modules for real-time interaction.

2. **Backend:**
   - **Node.js** and **Express.js** for the RESTful server.
   - Integration with **Google Cloud Platform (GCP)** for:
     - **Vertex AI/Gemini** for multimodal AI support.
     - **Text-to-Speech (TTS)** and **Speech-to-Text (STT)** for voice interactions.

3. **LLM System:**
   - Developed a Retrieval-Augmented Generation (RAG) system using Gemini.
   - Optimized the LLM with context-specific prompts and conversation memory using a **Queue data structure**.

## 🚀 What's Next for NavigAIt

1. **Data-Driven Feedback:** Enable continuous improvement of onboarding modules based on user interaction data.
2. **Memory Summarization:** Introduce summarization modules to improve LLM memory management.
3. **Direct Audio Input:** Extend Gemini's capabilities to accept live audio as input.
4. **Additional Use Cases:** Expand to general coding assistance, IT support, and beyond.

## 🛠 Installation and Usage

### Prerequisites
1. **Node.js** (v18 or later).
2. **Google Cloud SDK** with Vertex AI and TTS APIs enabled.
3. **Sox and FFmpeg** for audio playback.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/fuselierr/navigAIt.git
   cd navigait
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a .env file:
   ```makefile
   GCLOUD_PROJECT=
   GCLOUD_CREDENTIALS=
   GOOGLE_APPLICATION_CREDENTIALS=
   BUCKET_NAME=
   KEY_PATH=
   ```
4. Start the frontend server:
   ```bash
   npm run dev
   ```
5. Start the backend server:
   ```bash
   cd src/backend
   node server.js
   ```
6. Access the frontend, open http://localhost:3000 in your browser.
