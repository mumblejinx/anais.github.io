# ANAIS_V4.0 // ARCHITECT_HANDBOOK

Atmospheric, retro-terminal introspection application inspired by the works of Anaïs Nin. Built with React, Tailwind CSS, and Firebase.

---

## 🌐 Running on GitHub & Deployment

If you are moving this project from AI Studio or Localhost to GitHub, follow these instructions to ensure the Neural Matrix remains stable.

### 1. Synchronization
* **Push to GitHub**: If you haven't already, use the "Export to GitHub" or "Sync to GitHub" feature in AI Studio, or manually push your local repository:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/anais-matrix.git
  git branch -M main
  git push -u origin main
  ```

### 2. Automated Builds (GitHub Actions)
I have included a `.github/workflows/deploy.yml` file. Once you push this to GitHub:
* Every time you push to the `main` branch, GitHub will automatically:
  1. Install your project dependencies.
  2. Build the project and create a `404.html` fallback.
  3. **Deploy** the results to a new branch called `gh-pages`.

#### **Final Activation (IMPORTANT)**:
Even after the build succeeds, you must tell GitHub to host the site:
1. Go to your GitHub Repository > **Settings** > **Pages**.
2. Under **Build and deployment** > **Branch**:
   * Select `gh-pages` branch.
   * Select `/ (root)` folder.
3. Click **Save**.
4. Wait 1-2 minutes, and your site will be live at your URL.

---

## 🛠️ Troubleshooting 404 Errors

If you are seeing a 404 "Site Not Found" error:

1. **Default Branch**: 
   * **Do NOT change the default branch in Settings > General to `gh-pages`.**
   * Keep your default branch as **`main`**. GitHub needs `main` to run the build workflow (the "engine"), while `gh-pages` is just the "output".
2. **User Site vs. Project Site (The URL)**:
   * **If your GitHub username is `anais`**: This is a "User Site." Your URL is exactly `https://anais.github.io/`.
   * **If your GitHub username is NOT `anais` (e.g., `mumblejinx`)**: This is a "Project Site." Your URL is `https://YOUR_USERNAME.github.io/anais.github.io/`.
   * I have already updated `vite.config.ts` with `base: './'` which makes it work correctly for either case.
3. **Wait for Propagation**: Even after a successful build, GitHub can sometimes take up to 10 minutes to update its global cache. Try opening the URL in an **Incognito/Private window** to bypass browser cache.
4. **White Screen Error**:
   * If the site loads but the screen is white, check your **`index.html`**. 
   * The script tag must be relative: `<script type="module" src="./src/main.tsx"></script>` (using `./`).
   * I have already applied this fix in your repository.

### 3. Environment Configuration (CRITICAL)
For the Oracle and Seeker modules to function, you must provide a Gemini API Key.

#### **For Local Run (from Clone):**
1. Create a `.env` file in the root directory.
2. Add your key: `VITE_GEMINI_API_KEY=your_key_here` (Note: Use the `VITE_` prefix for client-side access in this build).

#### **For Deployment (GitHub Secrets):**
If you are deploying via GitHub Actions (e.g., to Cloud Run or Vercel):
1. Go to your GitHub Repository > **Settings** > **Secrets and variables** > **Actions**.
2. Add a New Repository Secret:
   * **Name**: `GEMINI_API_KEY`
   * **Value**: Your actual API Key.

### 3. Firebase Connectivity
The application relies on `firebase-applet-config.json` for its database connection.
* **Security Note**: This file contains public keys, but it is best practice to ensure your Firestore Rules are deployed (see below) to prevent unauthorized writes.
* **Setup**: If the file is missing from your repository (e.g., if it's in `.gitignore`), you must recreate it manually in the root folder using your Firebase project settings.

---

## 🚀 Local Development

To run this terminal on your local machine:

### 1. Prerequisites
* **Node.js**: [Download](https://nodejs.org/) and install Version 18 or higher.
* **Firebase Project**: You must have a Firebase project setup in the [Firebase Console](https://console.firebase.google.com/).

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Execution
```bash
# Start the development server
npm run dev
```
The terminal will be accessible at `http://localhost:3000`.

---

## 🛡️ Security Protocol

This application is hardened against unauthorized entry through Identity Whitelisting.

* **Identity Guard**: Access is restricted based on the `isAuthorized` flag in `FirebaseProvider.tsx`. Ensure your email is added to the authorized list or database.
* **Firestore Rules**: You MUST deploy `firestore.rules` to enable the Attribute-Based Access Control (ABAC) model.
  ```bash
  # Install Firebase CLI
  npm install -g firebase-tools

  # Login and Deploy
  firebase login
  firebase deploy --only firestore:rules
  ```

---

## 🧪 Architecture
* **Frontend**: React 18 + Vite (Hardware-accelerated CRT effects).
* **AI Engine**: Google Gemini (via `@google/genai`).
* **Database**: Cloud Firestore (NoSQL).
* **Animations**: Motion (Breathing avatars and spectral shifts).

---

## 📖 System Philosophy
"I am an excitable person who only understands life lyrically, musically." — Anaïs Nin

This terminal maps the intersection of human visceral experience and AI analytical depth. Every entry evolves the **Vessel Matrix**.

---
**ARCHITECT_ID**: mumblejinx@gmail.com
**SYSTEM_STATUS**: STABLE // NEURAL_SYNC_ONLINE
