# Smart Learning Management System (Physics LMS) ⚛️
> **MERN Stack University Mini-Project & Tuition Management System**  
> Computer Engineering Undergraduate &bull; Academic Year 2026

---

## 📖 Project Overview

The **Smart Learning Management System (Physics LMS)** is a comprehensive, production-ready MERN stack web application engineered specifically for Advanced Level Physics education and tuition class management. 

Designed with a concept-first pedagogical approach, it bridges structured academic content delivery with interactive student assessments, automated grading, homework tracking, and role-based administrative workflows.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js 18 + Vite** | Fast, responsive single-page application with modern UI |
| **Styling** | **Custom CSS / SaaS Theme** | Dark navy (`#0B132B`), electric blue (`#3B82F6`), clean typography & badges |
| **Icons** | **Lucide React** | Consistent, professional vector iconography |
| **Backend** | **Node.js + Express.js 5** | RESTful API architecture following the MVC design pattern |
| **Database** | **MongoDB Atlas + Mongoose** | Cloud NoSQL persistence with schemas, validation, and auto-seeding |
| **Security** | **JWT & Bcrypt.js** | Stateless authentication, salted password hashing, and role authorization |

---

## ✨ Features Implemented

### 1. 🎓 Physics Lesson Management (Full CRUD)
- **Create, Read, Update, Delete** lessons connected to MongoDB Atlas.
- Topic classification: **Mechanics**, **Electricity & Magnetism**, **Waves & Optics**, **Thermal Physics**, **Modern Physics**, **General Physics**.
- Metadata tracking: Difficulty levels (*Beginner, Intermediate, Advanced*), estimated duration, publication status (*Published / Draft*).
- **Integrated Video Player**: Direct embedding of YouTube video lectures with modal previews.
- Instant client-side search and topic filtering.

### 2. 🔐 Authentication & Role-Based Authorization
- **Student Registration & Login**: Creates secure hashed credentials using `bcryptjs`.
- **Teacher Account Protection**: Requires a verified `TEACHER_REGISTRATION_SECRET` to prevent students from elevating their privileges.
- **JWT (JSON Web Token)**: Bearer token exchange protecting teacher-only operations (creating lessons, publishing quizzes, viewing student directory).
- **1-Click University Demo Logins**: Pre-configured evaluator access for immediate demonstration without typing credentials.

### 3. 📚 Physics Study Materials & Resource Hub
- Central repository for curated lecture notes, formula sheets, derivation guides, and syllabus slides.
- Direct links and open/download action buttons.
- Teacher upload and management controls.

### 4. 📝 Homework & Problem Sets (with Submissions Management)
- Weekly problem set tracker with real-time due date countdowns (*"3 days left"*, *"Due soon"*, *"Past Due"*).
- Clear problem statements, maximum marks, and submission mode indicators (*Handwritten / In-Class*, *Online Submission*, *Worksheet*).
- **Student Solution Submission**: Online text entry with automatic Google Drive solution link detection and MongoDB persistence.
- **Teacher Submission Management**: Dedicated "View Submissions" dashboard modal with enrolled roster status, completion rates, and direct links to review students' worked answers.
- Attached downloadable problem sheet links.

### 5. ⏱️ Interactive MCQ Quizzes & Real-Time Scoring Engine
- Timed student assessments with dynamic live countdown clocks.
- **Automated Real Score Calculation**: The backend evaluates submitted answers against question keys, computes total marks, percentage, and pass/fail thresholds.
- **Concept Feedback Explanations**: Instant post-submission breakdown displaying correct answers, student choices, and scientific explanations.
- **Persistent Quiz Results**: History recorded in MongoDB for both students (personal test history) and teachers (class performance table).
- **Teacher Quiz Builder**: Dynamic interface to create multi-question assessments with custom marks and explanation notes.

### 6. 👥 Student Directory & Analytics (Teacher Dashboard)
- Complete student registry with enrolled batches (*e.g., A/L Physics 2026*), phone numbers, and emails.
- Calculated academic metrics: quizzes attempted, average quiz performance percentage.
- High-level metric cards: Total Lessons, Enrolled Students, Available Materials, Active Quizzes, Class Average.

---

## 📂 Project Architecture

```
Smart-Learning-Management-System/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection with Mongoose
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and JWT issuing
│   │   ├── lessonController.js   # Physics lesson CRUD operations
│   │   ├── materialController.js # Study materials management
│   │   ├── homeworkController.js # Homework assignments
│   │   ├── quizController.js     # Quizzes, submissions, and scoring logic
│   │   └── studentController.js  # Student directory & dashboard statistics
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification & role guards (Teacher / Student)
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing
│   │   ├── Lesson.js             # Physics lesson schema
│   │   ├── StudyMaterial.js      # Study resource schema
│   │   ├── Homework.js           # Homework assignment schema
│   │   ├── Quiz.js               # MCQ Quiz schema with question sets
│   │   └── QuizResult.js         # Persistent student quiz attempts & scores
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── homeworkRoutes.js
│   │   ├── quizRoutes.js
│   │   └── studentRoutes.js
│   ├── .env.example              # Template environment variables (no secrets)
│   ├── index.js                  # Express entry point & middleware mounting
│   ├── package.json              # Backend dependencies & scripts
│   └── test_suite.js             # Automated verification test suite (30/30 PASS)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Navigation bar & authentication status
│   │   │   ├── LandingHero.jsx          # Public landing page & syllabus overview
│   │   │   ├── LessonCard.jsx           # Lesson display card with topic badges
│   │   │   ├── LessonDetailModal.jsx    # Lecture video embed & syllabus breakdown
│   │   │   ├── LessonFormModal.jsx      # Create / Edit lesson modal
│   │   │   ├── StudyMaterialsView.jsx   # Resource download & filter hub
│   │   │   ├── HomeworkView.jsx         # Assignment problem sets & due dates
│   │   │   ├── QuizView.jsx             # Quiz catalogue & submission records
│   │   │   ├── ActiveQuizModal.jsx      # Interactive live MCQ quiz runner
│   │   │   ├── CreateQuizModal.jsx      # Teacher question builder interface
│   │   │   ├── StudentManagementView.jsx# Student directory & performance records
│   │   │   └── AuthModal.jsx            # Sign In / Register dialog with demo shortcuts
│   │   ├── services/
│   │   │   └── api.js                   # Fetch API wrapper with JWT headers
│   │   ├── App.jsx                      # Main application state & tab coordinator
│   │   ├── index.css                    # Professional dark navy SaaS design system
│   │   └── main.jsx                     # React root mount
│   ├── index.html                       # HTML template with Google Fonts
│   ├── vite.config.js                   # Vite config with backend proxy
│   ├── package.json                     # Frontend dependencies & scripts
│   └── .env.example
│
├── package.json                         # Workspace-level convenience run scripts
├── .gitignore                           # Excludes node_modules, .env, and build artifacts
└── README.md                            # Comprehensive project documentation
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **npm**: v9.0.0 or higher
- **MongoDB Atlas**: Cluster URI string (or runs with graceful in-memory fallback for offline testing)

---

### Step 1: Clone and Configure Environment

1. Navigate to the `backend/` folder and create a `.env` file based on `.env.example`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Open `backend/.env` and insert your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/physics_lms?retryWrites=true&w=majority
   JWT_SECRET=super_secret_jwt_key_physics_lms_2026
   TEACHER_REGISTRATION_SECRET=PHYSICS_TEACHER_2026
   ```

---

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 3: Run the Application

You can launch both services using separate terminals:

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm run dev
```
*Backend runs at: `http://localhost:5000`*

#### Terminal 2 — Start Frontend Application:
```bash
cd frontend
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

*(Or from workspace root: `npm run backend` and `npm run frontend`)*

---

### Step 4: Run Automated Tests
```bash
npm test --prefix backend
```
*Executes the automated verification suite validating 30 critical API endpoints, auth guards, scoring algorithms, and assignment submissions.*

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/lessons` | Public | List all physics lessons (supports `?topic=` and `?search=`) |
| `GET` | `/api/lessons/:id` | Public | Retrieve single lesson details |
| `POST` | `/api/lessons` | Teacher | Create a new lesson |
| `PUT` | `/api/lessons/:id` | Teacher | Update lesson details |
| `DELETE` | `/api/lessons/:id` | Teacher | Delete a lesson |
| `POST` | `/api/auth/register` | Public | Register student or teacher (requires teacher secret) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in profile |
| `GET` | `/api/materials` | Public | Retrieve study materials and formula sheets |
| `POST` | `/api/materials` | Teacher | Add new study resource |
| `DELETE` | `/api/materials/:id` | Teacher | Remove study resource |
| `GET` | `/api/homework` | Public | Retrieve assignments and problem sets |
| `POST` | `/api/homework` | Teacher | Create homework with due date |
| `GET` | `/api/quizzes` | Public | List available MCQ quizzes |
| `POST` | `/api/quizzes` | Teacher | Create quiz with questions and answer key |
| `POST` | `/api/quizzes/:id/submit` | Public/Student | Submit answers, calculate score & return explanations |
| `GET` | `/api/quizzes/results` | Teacher | View all student quiz submission records |
| `GET` | `/api/students` | Teacher | View enrolled students and their performance stats |
| `GET` | `/api/students/stats` | Protected | Fetch aggregated LMS overview statistics |

---

## 🎓 University Demonstration Guide

During your project viva or demonstration, follow this recommended walkthrough:

1. **System Introduction & Landing Page**:
   - Show the responsive landing page with curriculum pillars (*Mechanics, Waves, Electricity, Thermal, Modern*).
   - Point out the metrics counters dynamically computed from the database.

2. **1-Click Evaluation Login**:
   - Click the **"Demo Teacher"** button on the banner or login modal (`teacher@physicslms.edu` / `Password123!`).
   - Notice the amber **Teacher Badge** appearing in the navigation bar.

3. **Demonstrate Full Lesson CRUD**:
   - Go to the **Lessons** tab.
   - Click **"Create New Lesson"**, fill in a new Physics lesson (*e.g., "Angular Momentum & Rotational Dynamics"*), assign a YouTube URL, and save.
   - Confirm it immediately appears in the grid.
   - Click **"View Lesson"** to demonstrate the embedded video player and theory outline modal.
   - Edit the title, verify the update, and test the search bar filter.

4. **Demonstrate Study Materials & Homework**:
   - Switch to the **Study Materials** tab. Filter by *"Mechanics"* or *"Electricity"* to show formula sheets.
   - Switch to the **Assignments** tab. Show problem set instructions and due date countdown badges.

5. **Demonstrate Interactive MCQ Quiz & Real Scoring Engine**:
   - Switch to the **Quizzes & MCQs** tab.
   - Click **"Start Quiz Assessment"** on the *Mechanics & Kinematics Mastery Quiz*.
   - Demonstrate the **live countdown timer**.
   - Select answers and click **"Submit Answers"**.
   - Show the computed percentage, pass/fail badge, and **concept explanations** for every question.
   - Switch to the **"Student Submissions"** sub-tab to verify that the score was recorded in MongoDB.

6. **Demonstrate Student Directory & Role Security**:
   - Switch to the **Students** tab (visible only to Teachers).
   - Show enrolled student contact records, batches, and average quiz scores.
   - Log out, log in as **"Demo Student"**, and observe that administrative buttons (Create Lesson, Student Directory) are securely hidden and restricted.

---

## ⚖️ Known Limitations & Future Enhancements
- **Direct PDF File Uploads**: Currently uses resource URLs (Google Drive, university file links, web sheets). Future versions can integrate AWS S3 or Cloudinary storage.
- **Real-Time Websockets**: Live classroom chat or push notifications for upcoming deadlines can be added in version 2.1 using Socket.io.

---

## 👨‍💻 Author
- **Computer Engineering Undergraduate**
- Department of Computer Engineering
- Mini-Project Submission Deadline: **October 31, 2026**
