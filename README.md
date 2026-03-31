# Volunteer Management System (VMS) 🌍

![Build Status](https://img.shields.io/github/actions/workflow/status/Princeverma3502/VMS/playwright.yml?branch=main)
![License](https://img.shields.io/badge/License-ISC-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Powered-brightgreen)

The **Volunteer Management System (VMS)** is a comprehensive, full-stack web application designed to solve the core administrative and engagement challenges faced by volunteer-driven organizations, particularly college NSS (National Service Scheme) units and NGOs. 

VMS replaces cumbersome manual processes with a central, integrated, and intelligent platform for managing users, tracking events, gamifying participation, and analyzing large-scale impact securely.

---

## 🚀 Key Features

### 🛡️ Secure, Multi-Tenant Architecture
- **Strict Role-Based Access Control (RBAC):** Features dedicated interfaces and permissions for **Volunteers, Associate Heads, Domain Heads, and Secretaries**.
- **College/Tenant Isolation:** Backend middleware natively isolates all task, event, and user data to the specific `collegeId`, strictly preventing cross-tenant data leakage.

### 📊 Admin Analytics & Reporting Engine
- **Live Dashboards:** Secretaries and Domain Heads can monitor volunteer demographics (Branch, Year, Blood Group), task completion rates, and event attendance natively within the app.
- **CSV Data Export:** One-click generation of fully formatted `.csv` reports containing active volunteer rosters and lifetime XP/gamification metrics.

### 🎖️ Gamification & Digital Identity
- **Dynamic Digital ID Cards:** Verifiable IDs generated for volunteers containing QR validation and dynamic validity tracking.
- **Automated Resume Builder:** Compiles completed tasks, event attendance, and endorsed skills into a professional resume format.
- **Impact Tracking & Streaks:** Volunteers earn XP, level up, and maintain login streaks to encourage consistent participation.

### 📅 Event & Task Management
- **Geofence-Based Attendance:** Prevents fraudulent check-ins by verifying a volunteer's GPS coordinates against the event perimeter.
- **Activity Hub:** Built-in tools for global announcements, targeted notices, and community polling.

---

## 💻 Tech Stack

**Frontend:**
*   **React (v19+)** & **Vite** for blazing fast HMR and optimized builds.
*   **Tailwind CSS (v4)** for a premium, responsive, and utility-first design system.
*   **Context API** for robust global state management (Auth, Themes).

**Backend:**
*   **Node.js / Express.js** for handling robust RESTful APIs.
*   **MongoDB & Mongoose (v9.0)** for flexible, document-based NoSQL storage.
*   **JSON Web Tokens (JWT) & bcryptjs** for secure, stateless authentication.

**Quality Assurance / CI:**
*   **Playwright:** Comprehensive End-to-End (E2E) testing suite validating all 4 user roles.
*   **GitHub Actions:** Automated CI pipeline that runs Playwright tests against an isolated Render staging environment on every push to `main`.

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB instance (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Princeverma3502/VMS.git
cd VMS
```

### 2. Install dependencies
Install dependencies for both the frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
You will need to set up `.env` files in both the `backend` and `frontend` directories. Use the provided `.env.example` files as a reference.

**`backend/.env` Requirements:**
*   `MONGO_URI`
*   `JWT_SECRET`
*   `ADMIN_SECRET`
*   `PORT` (defaults to 5000)

**`frontend/.env` Requirements:**
*   `VITE_API_URL` (Point to your local or remote backend, e.g., `http://localhost:5000`)

### 4. Seed the Database (Optional but Recommended)
To quickly start testing roles, you can seed the database with predefined test accounts:
```bash
cd backend
node scripts/seedTestUsers.js
```
*(This will generate accounts for `test_sec@...`, `test_vol@...`, `test_dh@...`, and `test_ah@...` with the password `Password123!`)*

### 5. Start the Development Servers
Open two terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🧪 Testing

The project uses **Playwright** for robust End-to-End (E2E) testing across all major application workflows.

To run the automated test suite locally:
```bash
cd frontend
# Ensure your backend dev server is running, or point .env.test to a live staging URL
npx playwright test
```

To view the HTML report of the test run:
```bash
npx playwright show-report
```

---

## 📄 License
This project is licensed under the ISC License.
