import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./components/pages/LoginPage";
import Home from "./components/pages/Home";
import Enrollment from "./components/pages/Enrollment";
import CourseFeed from "./components/pages/CourseFeed";
import ResultFeed from "./components/pages/ResultFeed";
import StudentInsights from "./components/pages/StudentInsights";
import Admin from "./components/pages/Admin";
import Attendance from "./components/pages/Attendance";
import PromoteStudent from "./components/pages/PromoteStudent";
import PaymentInitiatePage from "./components/pages/PaymentInitiatePage"
import Student from "./components/pages/Student";
import AddTeacher from "./components/pages/AddTeacher";
import ManageTeacher from "./components/pages/ManageTeacher";
import EnrollmentUpdate from "./components/pages/EnrollmentUpdate";
import VedioCall from "./components/pages/VedioCall";
import Homework from "./components/pages/Homework";
import Notice from "./components/pages/Notice";
import Notification from "./components/pages/Notification";
import ResultReportPDF from "./components/pages/ResultReportPDF";
import ManageAcademics from "./components/pages/ManageAcademics";
import FeesAnalytic from "./components/pages/FeesAnalytic";
import GenerateReport from "./components/pages/GenerateReport";
import GenerateID from "./components/pages/GenerateID";

/* Dummy Pages */
const ExportStudent = () => <div className="p-2">Student Data Export Page</div>;

const FeesCollection = () => <div className="p-2">Fees Collection Page</div>;

const AdminSettings = () => <div className="p-2">Admin Settings Page</div>;

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        <Route path="/teacher/addteacher" element={<AddTeacher />} />
        <Route path="/teacher/manageteacher" element={<ManageTeacher />} />

        {/* STUDENT */}
        <Route path="/student/enrollment" element={<Enrollment />} />
        <Route
          path="/student/enrollment-update"
          element={<EnrollmentUpdate />}
        />
        <Route path="/student/promote" element={<PromoteStudent />} />
        {/* <Route path="/student/promotetest" element={<PromoteTest />} /> */}
        <Route path="/student/export" element={<ExportStudent />} />
        <Route path="/student/insight" element={<StudentInsights />} />

        {/* EMPLOYEES */}
        <Route path="/employees/add-teacher" element={<AddTeacher />} />
        <Route path="/employees/manage" element={<ManageTeacher />} />

        {/* ACADEMICS */}
        <Route path="/academics/course-feed" element={<CourseFeed />} />
        <Route path="/academics/result-feed" element={<ResultFeed />} />
        <Route path="/academics/attendance" element={<Attendance />} />
        <Route path="/academics/vedio-call" element={<VedioCall />} />
        <Route path="/academics/homework" element={<Homework />} />
        <Route path="academics/notice-class" element={<Notice />} />

        {/* FEES */}
        <Route path="/fees/assignment" element={<PaymentInitiatePage />} />
        <Route path="/fees/analysis" element={<Student />} />
        <Route path="/fees/analytic" element={<FeesAnalytic />} />

        {/* ADMIN */}
        <Route path="/admin/trigger" element={<Admin />} />
        <Route path="/admin/notification" element={<Notification />} />
        <Route path="/admin/result-report" element={<ResultReportPDF />} />
        <Route path="/admin/manage-academics" element={<ManageAcademics />} />
        <Route path="/student/insight" element={<StudentInsights />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/printreport" element={<GenerateReport />} />
                <Route path="/admin/printID" element={<GenerateID />} />
        
      </Route>

      

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
