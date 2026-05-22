🐝 HabitHive

### *Build Better Habits. Together.*

HabitHive is a **group-based habit tracking platform** that transforms personal goals into a **social and competitive experience**. Instead of struggling alone, users stay consistent by collaborating, competing, and motivating each other within groups.

---

## 🌐 Live Demo
👉 https://habithive-mu.vercel.app

---

## 🚀 Features

### 👥 Group-Based Habit Tracking

* Create or join habit groups via invite links
* Track daily progress alongside friends
* Stay accountable with shared goals

### 🔥 Streak & Score System

* Maintain **daily streaks** and **lifetime streaks**
* Weekly score tracking for performance comparison
* Automatic streak updates based on check-ins

### 🏆 Competitive Motivation

* Group leaderboards
* Friendly competition to boost consistency
* Encouraging environment for habit building

### 📅 Smart Check-in System

* Daily check-in tracking
* Prevents duplicate entries
* Stores last activity date for streak calculation

### 🔐 Authentication System

* Secure user login & signup
* Session handling and protected routes

---

## 🛠️ Tech Stack

### 💻 Frontend

* React / React Native (Expo)
* Modern UI with animations (Lottie)
* Responsive and clean design

### ⚙️ Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### 🧩 Key Concepts Used

* REST APIs
* Schema Design (Users, Groups, Members)
* State Management
* Authentication Flow
* Git & Version Control

---

## 🗂️ Project Structure

```
HabitHive/
│── frontend/        # UI (React / React Native)
│── backend/         # Server (Node + Express)
│── models/          # MongoDB schemas
│── routes/          # API endpoints
│── controllers/     # Business logic
│── utils/           # Helper functions
```

---

## 📊 Database Design (Core Idea)

### Member Schema Example

* `user` → Reference to User
* `weeklyScore` → Tracks weekly performance
* `lifestreak` → Total streak count
* `lastCheckin` → Last active date

---

## 🎯 Problem It Solves

Most habit trackers fail because:

* No accountability
* No motivation
* No consistency

👉 HabitHive solves this by adding:

* **Social pressure**
* **Gamification**
* **Competition**

---

## 🌟 Future Improvements

* 📱 Push notifications for reminders
* 🏅 Badges & achievements
* 🤝 Group vs Group competitions
* 📊 Advanced analytics dashboard
* ☁️ Deployment & real-time sync

---

## 🧠 What I Learned

* Designing scalable backend systems
* Handling real-world user flows
* Managing authentication & protected routes
* Structuring full-stack applications
* Building engaging user experiences

---

## 📌 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/your-username/habithive.git

# Go into project folder
cd habithive

# Install dependencies
npm install

# Run backend
npm run server

# Run frontend
npm start
```

---

## 🤝 Contribution

Feel free to fork the project and improve it. Suggestions and contributions are always welcome!

---

## 📬 Contact

If you’d like to collaborate or discuss ideas:

* GitHub: https://github.com/neola-dev
* Email: neolapeter895@gmail.com

---

## ⭐ Final Note

HabitHive is more than just a tracker —
it’s a **community-driven habit building system** designed to make consistency fun and addictive.
