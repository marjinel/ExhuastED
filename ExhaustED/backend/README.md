# MBalance — Your Academic Wellness Companion

> A production-quality full-stack mobile application for student burnout detection and wellness tracking.

![MBalance Banner](./assets/banner.png)

---

## Overview

MBalance is an AI-inspired student burnout detection and wellness tracking platform. It helps students monitor burnout risk, emotional wellness, stress levels, and academic balance through real-time analytics, multi-factor assessments, and a conversational wellness chatbot named **Mira**.

---

## Features

- **Authentication** — Register/Login/Logout with JWT, session persistence, profile management
- **Burnout Assessment** — Multi-category assessment engine (sleep, academic load, emotion, physical, productivity)
- **Burnout Detection Engine** — Rule-based scoring with personalized recommendations
- **Mira Chatbot** — Rule-based emotional wellness companion with keyword detection
- **Daily Check-in** — 60-second mood, sleep, stress, and motivation tracker
- **Analytics Dashboard** — Charts, trends, insights, motivational content
- **History Tracking** — Weekly/monthly/all-time wellness logs
- **Push Notifications** — Daily reminders (check-in, sleep, hydration, breaks)
- **Settings** — Profile editing, notification preferences, dark mode

---

## Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React Native + Expo | Mobile framework |
| Expo Router | File-based navigation |
| TypeScript | Type safety |
| NativeWind | TailwindCSS for RN |
| React Native Paper | UI components |
| Zustand | State management |
| Axios | HTTP client |
| React Hook Form + Zod | Forms & validation |
| React Native Reanimated | Animations |
| React Native Chart Kit | Charts |
| AsyncStorage | Local persistence |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Expo Notifications | Push notifications |

---

## Project Structure

```
mbalance/
├── frontend/                  # React Native / Expo app
│   ├── app/                   # Expo Router screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Splash screen
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx      # Dashboard
│   │       ├── assessment.tsx
│   │       ├── checkin.tsx
│   │       ├── chatbot.tsx
│   │       └── profile.tsx
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── charts/            # Chart components
│   │   ├── assessment/        # Assessment form components
│   │   └── chatbot/           # Chat components
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   ├── services/              # API services
│   ├── constants/             # App constants
│   ├── utils/                 # Utility functions
│   ├── types/                 # TypeScript interfaces
│   └── theme/                 # Color palette & typography
│
└── backend/                   # Express API server
    └── src/
        ├── controllers/       # Route handlers
        ├── routes/            # Express routers
        ├── middleware/        # Auth, validation, error handlers
        ├── models/            # Mongoose schemas
        ├── services/          # Business logic
        ├── validators/        # Zod schemas
        ├── config/            # DB & env config
        └── utils/             # Helpers
```

---

## Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone the repo
```bash
git clone https://github.com/yourname/mbalance.git
cd mbalance
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT secret in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your backend URL
npx expo start
```

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mbalance
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend `.env`
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |
| DELETE | `/api/auth/delete-account` | Delete account |

### Assessment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assessment/create` | Submit assessment |
| GET | `/api/assessment/history` | Get assessment history |
| GET | `/api/assessment/latest` | Get latest assessment |

### Check-in
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkin/create` | Submit daily check-in |
| GET | `/api/checkin/history` | Get check-in history |
| GET | `/api/checkin/today` | Get today's check-in |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/weekly` | Weekly wellness data |
| GET | `/api/analytics/monthly` | Monthly trends |
| GET | `/api/analytics/insights` | AI-generated insights |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/message` | Send/receive Mira message |
| GET | `/api/chat/history` | Get chat history |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/notifications` | Update notification prefs |

---

## Running in VS Code

1. Install the **Expo Tools** VS Code extension
2. Open `frontend/` and `backend/` in split terminals
3. Run `npm run dev` in backend, `npx expo start` in frontend
4. Scan QR code with Expo Go app on your phone

---

## Screenshots

| Dashboard | Assessment | Chatbot | Check-in |
|-----------|------------|---------|---------|
| ![](./assets/screens/dashboard.png) | ![](./assets/screens/assessment.png) | ![](./assets/screens/chatbot.png) | ![](./assets/screens/checkin.png) |

---

## Academic Context

This project demonstrates:
- **OOP** — TypeScript classes, interfaces, Mongoose models
- **Modular programming** — Feature-based folder structure
- **Exception handling** — Centralized error middleware, Zod validation
- **Data structures** — MongoDB schemas, Zustand state trees
- **CRUD operations** — Full Create/Read/Update/Delete via REST API
- **Authentication systems** — JWT with bcrypt, session persistence
- **API integration** — Axios services with interceptors

---

## License

MIT — for academic and portfolio use.