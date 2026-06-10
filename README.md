# Employee Attendance Management System

A robust MERN stack application designed for real-time employee attendance tracking, break management, and administrative oversight.

##  Features
- **Secure Authentication:** JWT-based auth with password hashing.
- **Attendance Tracking:** Real-time Check-in, Check-out, and Break/Resume functionality.
- **Admin Dashboard:** Role-based access to view real-time attendance analytics and manage employee account status.
- **History Logs:** Dynamic calculation of net working hours per shift.

##  Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JSON Web Tokens (JWT), Bcrypt

##  Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/aliahmad2k5/employee-attendance-system.git](https://github.com/aliahmad2k5/employee-attendance-system.git)
   cd employee-attendance-system

2. Backend Setup:

Bash
cd backend
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
npm run dev

3. Frontend Setup:

Bash
cd ../frontend
npm install
npm run dev

API Documentation

Route,Method,Access,Description
/api/auth/register,POST,Public,Register a new user
/api/auth/login,POST,Public,Authenticate and return JWT
/api/attendance/checkin,POST,Private,Start daily shift
/api/attendance/checkout,POST,Private,End daily shift
/api/attendance/history,GET,Private,Get personal attendance logs
/api/attendance/admin/overview,GET,Admin,View company-wide stats

Database Schema & Architecture
The system uses a relational approach in MongoDB to ensure data integrity.

User Schema: Stores name, email, password, role, and isActive status.

Attendance Schema: References the User ID. It enforces a unique constraint on the combination of user and date to ensure no two records exist for a single employee in one day.

Assumptions Made
Account Status: All users are set to isActive: true by default upon registration.

Security: JWT tokens are used for stateless authentication. Frontend handles token storage, and the backend validates tokens via protect middleware.

Role Management: Admin routes are protected via the restrictTo('Admin') middleware, ensuring non-admin users cannot toggle account statuses.

Project Understanding (Demo Guide)
Auth Flow: Frontend sends credentials -> Backend validates via bcrypt -> Backend issues JWT -> Frontend stores token -> Token used in headers for protected API calls.

RBAC Implementation: We use specific middleware (protect to verify tokens, restrictTo to verify roles) to gatekeep sensitive routes.

Integrity: By using MongoDB compound indexes, we ensure that attendance records remain clean and free from duplicate entries, solving a common data-quality issue in attendance systems.
