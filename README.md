# Course Enrollment System (MERN) 🎓

> **PESUIO Capstone Project** > Developed during 3rd Semester | Full-Stack Web Development Course

## 📖 Project Description
The **Course Enrollment System** is a full-stack MERN application designed to automate and simplify the academic registration process. It provides a centralized platform for students to manage their course loads and for university staff to maintain the curriculum.

### 🧠 How the Project Works (Logic)
* **Authentication & Security:** The system uses **JSON Web Tokens (JWT)** for secure sessions. When a user logs in, the server generates a token that determines their access level (Student, Staff, or Admin).
* **Database Architecture:** Using **MongoDB and Mongoose**, the system manages relationships between Users, Programs (degrees), Courses, and Enrollments.
* **Role-Based Access Control (RBAC):** * **Students:** Can browse active courses and enroll/drop based on availability.
    * **Staff:** Can manage course details and view enrollments.
    * **Admins:** Have full control, including **Bulk Data Upload** to prepare for new semesters quickly.
* **State Management:** The frontend uses **React Context API** to keep user authentication data consistent across all pages without needing to refresh.



---

## 🛠️ Tech Stack
- **Frontend:** React.js (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Security:** Bcrypt (Password Hashing) & JWT Authorization

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)

### 2. Backend Setup
1. Open terminal in the `backend` folder:
   ```bash
   cd backend
   npm install