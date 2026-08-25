# 📱 ReelVault

> **Save it. Organize it. Find it.**

ReelVault is a mobile application designed to help you **save, organize, and access Instagram Reels more easily**.

Have you ever saved an Instagram Reel and later struggled to find it again?

ReelVault was created to solve exactly that problem. Instead of keeping all your saved Reels mixed together, ReelVault lets you save a Reel's metadata and organize it into **custom folders**.

---

## 💡 Why ReelVault?

I came up with the idea after repeatedly saving Instagram Reels that I wanted to revisit later.

I used to save Reels directly on Instagram or send them to my second account. But when I wanted to find a particular Reel again, searching through hundreds of saved Reels took a lot of time.

So I thought:

> **What if I could save Reels and organize them into folders from the beginning?**

That's how ReelVault started.

---

## ✨ Features

* 🔗 **Save Instagram Reels**

  * Share a Reel directly from Instagram to ReelVault.
  * Alternatively, copy the Reel URL and paste it into the app.

* 📥 **Fetch Reel Metadata**

  * Retrieves available Reel information such as:

    * Thumbnail
    * Caption
    * Tags
    * Reel URL

* 📁 **Custom Folders**

  * Create your own folders.
  * Categorize Reels based on topics, interests, or use cases.

* 💾 **Local Storage**

  * Save Reel information locally on your device.

* 🔎 **Easy Access**

  * Browse your categorized Reels instead of searching through a large Instagram saved collection.

* ⚙️ **Configurable Backend**

  * Connect the application to your own deployed ReelVault backend.

---

## 🛠️ Tech Stack

### Mobile Application

* **React Native**
* **Expo**
* **Expo Router**
* **TypeScript**
* **SQLite / Local Storage**

### Backend

* **Python**
* **FastAPI**
* **Uvicorn**

### Deployment

* **Expo EAS** — Android application builds
* **Render** — Backend deployment
* **GitHub** — Source code and releases

---

## 🏗️ How ReelVault Works

```text
                Instagram Reel
                       │
                       ▼
              Share / Copy Link
                       │
                       ▼
                  ReelVault
                       │
                       ▼
               Backend API
                       │
                       ▼
             Fetch Reel Metadata
                       │
              ┌────────┴────────┐
              ▼                 ▼
          Thumbnail          Caption
              │                 │
              └────────┬────────┘
                       ▼
                Choose Folder
                       │
                       ▼
                 Save Locally
                       │
                       ▼
              Access It Later
```

---

# 🚀 Installation

## Option 1 — Download the Android App

Download the latest ReelVault APK from the **GitHub Releases** section.

👉 **[Download the Latest Release](https://github.com/Ashwin-Pillai-22/ReelVault/releases)**

Download the `.apk` file and install it on your Android device.

> **Note:** Android may ask you to allow installation from unknown sources when installing an APK downloaded outside the Google Play Store.

---

# ⚙️ Backend Setup

ReelVault requires a backend API to fetch Reel metadata.

You have to deploy your own backend.

## 1. Clone/Fork the Backend

The backend repository contains the Python/FastAPI code responsible for fetching Reel metadata.

👉 **[ReelVault Backend](https://github.com/Ashwin-Pillai-22/ReelVault-backend)**

You can either:

* Fork the repository to your GitHub account, or
* Clone it and push it to your own repository.

---

## 2. Deploy the Backend on Render

Create an account on **Render** and create a new **Web Service**.

Connect your GitHub account and select the backend repository.

Use the following start command:

```bash
uvicorn FetchData:app --host 0.0.0.0 --port $PORT
```

Select the appropriate plan for your project and deploy the service.

After deployment, Render will provide a URL similar to:

```text
https://your-project-name.onrender.com
```

Copy this URL.

---

## 3. Configure ReelVault

Open the ReelVault application:

```text
Settings
   ↓
Backend URL
   ↓
Paste your Render URL
   ↓
Save
```

For example:

```text
https://reelvault-backend-ficu.onrender.com
```

Once the backend URL is configured, ReelVault can communicate with your FastAPI server. <br>

ReelVault Setup Guide: [guide](https://docs.google.com/document/d/1Ihrzl4s1tIViWjaq6u7V5RI_F6L5ufA_v877jCRb36s/edit?usp=sharing)

---

# 📖 How to Use

### 1. Share a Reel

Open Instagram and find a Reel you want to save.

Tap:

```text
Share → ReelVault
```

ReelVault will receive the Reel URL.

### 2. Or Paste the Link

You can also copy the Reel URL from Instagram and paste it directly into ReelVault.

### 3. Fetch Metadata

ReelVault sends the URL to the backend, which attempts to retrieve the available Reel metadata.

### 4. Choose a Folder

Select an existing folder or create a new one.

For example:

```text
📁 Coding
📁 Music
📁 Fitness
📁 Recipes
📁 Project Ideas
```

### 5. Save

Save the Reel and access it later from its folder.

---

# 📂 Example Organization

Instead of having hundreds of unorganized saved Reels:

```text
Instagram Saved
├── Reel
├── Reel
├── Reel
├── Reel
├── Reel
└── ...
```

ReelVault lets you organize them:

```text
ReelVault
├── 📁 Coding
│   ├── React Reel
│   └── Python Reel
│
├── 📁 Music
│   ├── Guitar Reel
│   └── Production Reel
│
├── 📁 Fitness
│   ├── Workout Reel
│   └── Calisthenics Reel
│
└── 📁 Recipes
    ├── Pasta Reel
    └── Dessert Reel
```

---

# 🔐 Privacy

ReelVault is designed primarily around **local organization of saved Reel metadata**.

The application communicates with the configured backend when it needs to process a Reel URL and retrieve metadata.

Do not configure the application with backend URLs containing private credentials or secrets.

---

# ⚠️ Limitations

* Metadata availability depends on what can be retrieved from the Reel.
* Instagram may change its website structure or access behavior, which can affect metadata extraction.
* ReelVault does not download and permanently host Instagram video content.
* The backend may experience slower responses after periods of inactivity depending on the hosting configuration.

---

# 🗺️ Roadmap

Potential future improvements include:

* [ ] 🔍 Search Reels
* [ ] 🏷️ Advanced tagging
* [ ] 🔎 Filter and sort saved Reels
* [ ] 📊 Usage statistics
* [ ] ☁️ Optional cloud backup
* [ ] 🔄 Import/export saved Reel collections
* [ ] 🎨 UI/UX improvements
* [ ] 📱 Google Play Store release

---

# 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

1. Fork the repository.
2. Create a new branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Commit your changes:

```bash
git commit -m "Add your feature"
```

5. Push the branch:

```bash
git push origin feature/your-feature
```

6. Open a Pull Request.

---

# 📄 License

This project is currently available for educational and personal use.

See the repository for the complete license information.

---

# 👨‍💻 Author

**Ashwin Pillai**

Built as a project to solve a simple problem:

> **Don't just save Reels. Save them in a way that makes them easy to find later.**

---

## ⭐ Support

If you find ReelVault useful, consider giving the repository a ⭐ on GitHub!

**ReelVault — Save it. Organize it. Find it.**
