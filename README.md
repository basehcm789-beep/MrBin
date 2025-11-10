# Aviation AI Manpower Calculator

This is a web application built with React, TypeScript, and Vite that uses the Google Gemini API to analyze aviation maintenance task lists from Excel files and calculate the required manpower.

## Features

-   **Excel File Upload**: Users can upload `.xlsx` or `.xls` files containing maintenance tasks.
-   **AI-Powered Analysis**: Leverages the Gemini Pro model to parse tasks, group them by zone, and summarize the work package.
-   **Manpower Calculation**: Calculates the required number of personnel for different roles (B1, B2, MEC, etc.) based on man-hours and predefined rules.
-   **Zone-Based Breakdown**: Displays a clear, detailed breakdown of required personnel for each maintenance zone.

---

## Local Development Setup

Follow these steps to run the application on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   `npm` (comes with Node.js)
-   A Google Gemini API Key.

### Installation & Running

1.  **Clone the repository or download the code:**
    ```bash
    git clone <your-repository-url>
    cd aviation-ai-app
    ```

2.  **Install dependencies:**
    Run this command in the project's root directory. It will download all the necessary packages defined in `package.json`.
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the root of the project. Copy the contents of `.env.example` into it and add your Gemini API key.
    ```
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Open your web browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

---

## Deployment to Vercel

This project is configured for easy deployment on Vercel.

1.  **Push to GitHub:**
    Create a new repository on GitHub and push your project code to it. The `.gitignore` file will ensure that `node_modules` and your local `.env` file are not committed.

2.  **Import Project on Vercel:**
    -   Log in to your Vercel account.
    -   Click "Add New..." -> "Project".
    -   Import the GitHub repository you just created.

3.  **Configure Project:**
    -   Vercel will automatically detect that this is a Vite project and set the build settings correctly. You shouldn't need to change anything.

4.  **Add Environment Variable:**
    -   Before deploying, navigate to the project's **Settings** -> **Environment Variables**.
    -   Add a new variable:
        -   **Name**: `VITE_API_KEY`
        -   **Value**: Paste your Gemini API key here.
    -   Ensure the variable is available for all environments (Production, Preview, Development).

5.  **Deploy:**
    -   Go back to the project dashboard and trigger a deployment (or re-deploy if one already ran). Vercel will build the project and deploy it. You will be provided with a public URL once it's complete.
