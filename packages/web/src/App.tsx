import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthLayout } from './layouts/AuthLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { TrainingPage } from './pages/training/TrainingPage';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { useUserStore } from './store/userStore';
import { TrainingResultPage } from './pages/training/TrainingResultPage';
import { TrainingHistoryPage } from './pages/student/TrainingHistoryPage';
import { TrainingReplayPage } from './pages/student/TrainingReplayPage';
import { Settings } from './pages/Settings';
import { TeacherLayout } from './layouts/TeacherLayout';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ClassList } from './pages/teacher/ClassList';
import { ClassDetail } from './pages/teacher/ClassDetail';
import { ClassAnalyticsPage } from './pages/teacher/ClassAnalyticsPage';
import { CaseLibrary } from './pages/teacher/CaseLibrary';

import { StudentDashboard } from './pages/student/StudentDashboard';

function App() {
    const { userInfo } = useUserStore();

    // Redirect root based on role
    const RootRedirect = () => {
        if (!userInfo) return <Navigate to="/login" replace />;
        if (userInfo.role === 'teacher') return <Navigate to="/teacher" replace />;
        return <Navigate to="/student" replace />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes with AuthLayout */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<RoleBasedRoute />}>
                    {/* Student Routes */}
                    <Route path="/student" element={<StudentLayout />}>
                        <Route index element={<StudentDashboard />} />
                        <Route path="training/:id" element={<TrainingPage />} />
                        <Route path="training/:id/result" element={<TrainingResultPage />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="history" element={<TrainingHistoryPage />} />
                        <Route path="replay/:id" element={<TrainingReplayPage />} />
                    </Route>

                    {/* Redirect root to appropriate dashboard */}
                    <Route path="/" element={<RootRedirect />} />
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
                    <Route path="/teacher" element={<TeacherLayout />}>

                        <Route index element={<TeacherDashboard />} />
                        <Route path="classes" element={<ClassList />} />
                        <Route path="classes/:id" element={<ClassDetail />} />
                        <Route path="classes/:id/analytics" element={<ClassAnalyticsPage />} />
                        <Route path="cases" element={<CaseLibrary />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
