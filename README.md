# ✂ SplitByKittu

A production-ready, PWA expense-splitting app for travel and work groups — built with React + Firebase.

---

## ✨ Features

- **Auth** — Google Sign-In + Email/Password registration
- **Groups** — Create travel or industry/work groups
- **Invite via Token** — 6-character tokens, no link needed
- **Smart Splits** — Equal split among selected members, any payer
- **Balance Engine** — Greedy minimisation of transactions (fewest payments)
- **Category Tags** — Travel: ✈️ Transport, 🏨 Stay, 🍽️ Food, 🎭 Activities… · Industry: 📦 Supplies, 💻 Software, 🤝 Client Entertainment…
- **Settle Groups** — Admin can mark a group as settled
- **Profile** — Edit display name, view auth info
- **PWA** — Installable on iOS & Android home screen, offline shell
- **Multi-Currency** — INR (default), USD, EUR, GBP, SGD, AED

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd splitbykittu
npm install
```

### 2. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `splitbykittu`)
3. Enable **Authentication** → Sign-in methods:
   - Email/Password ✓
   - Google ✓
4. Enable **Firestore Database** (start in production mode)
5. Go to **Project Settings → General → Your apps → Web** and copy the config

### 3. Add Firebase Config

Edit `src/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "splitbykittu.firebaseapp.com",
  projectId: "splitbykittu",
  storageBucket: "splitbykittu.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...",
};
```

### 4. Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # select your project
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` manually in the Firebase console under **Firestore → Rules**.

### 5. Run Locally

```bash
npm run dev
# App at http://localhost:3000
```

### 6. Build & Deploy

```bash
npm run build
# Deploy dist/ to Firebase Hosting, Vercel, Netlify, etc.
```

#### Deploy to Firebase Hosting (recommended):
```bash
firebase init hosting   # set public dir to "dist", SPA: yes
npm run build
firebase deploy
```

---

## 📱 Install as PWA

- **Android**: Open in Chrome → menu → "Add to Home Screen"
- **iOS**: Open in Safari → Share → "Add to Home Screen"

---

## 🗂 Project Structure

```
splitbykittu/
├── src/
│   ├── firebase.js              # Firebase init (edit this!)
│   ├── App.jsx                  # Router
│   ├── main.jsx                 # Entry point
│   ├── contexts/
│   │   └── AuthContext.jsx      # Auth state + helpers
│   ├── hooks/
│   │   └── useFirestore.js      # Firestore CRUD + real-time listeners
│   ├── pages/
│   │   ├── AuthPage.jsx         # Login / Register
│   │   ├── Dashboard.jsx        # Group list, create, join
│   │   ├── GroupPage.jsx        # Expenses, Balances, Info tabs
│   │   └── ProfilePage.jsx      # Edit profile, sign out
│   ├── utils/
│   │   └── helpers.js           # Split math, categories, formatters
│   └── styles/
│       └── global.css           # All styles (dark theme)
├── public/
│   └── manifest.json            # PWA manifest
├── index.html
├── vite.config.js               # Vite + PWA plugin
├── firestore.rules              # Security rules
└── package.json
```

---

## 🔒 Security

- Firestore rules ensure only group members can read/write group data
- Expenses can only be deleted by the payer or group admin
- Tokens are case-insensitive 6-character alphanumeric strings

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| UI | React 18 |
| Styling | Pure CSS (custom design system) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| PWA | Vite PWA Plugin + Workbox |
| Build | Vite 5 |

---

Made with ❤️ by Kittu
