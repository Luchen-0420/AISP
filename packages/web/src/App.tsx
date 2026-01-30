import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthLayout } from './layouts/AuthLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { TrainingPage } from './pages/training/TrainingPage';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { useUserStore } from './store/userStore';
import { TrainingResultPage } from './pages/training/TrainingResultPage';
import { TrainingHistoryPage } from './pages/student/TrainingHistoryPage';
import { Settings } from './pages/Settings';
import { TeacherLayout } from './layouts/TeacherLayout';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ClassList } from './pages/teacher/ClassList';
import { ClassDetail } from './pages/teacher/ClassDetail';
import { CaseLibrary } from './pages/teacher/CaseLibrary';

import { caseService } from './services/case.service';
import { useState, useEffect } from 'react';

// Temporary Home Component for Student Dashboard
const StudentDashboard = () => {
    const navigate = useNavigate();
    const [variants, setVariants] = useState<any[]>([]);

    useEffect(() => {
        caseService.getAllVariants().then(setVariants).catch(console.error);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">我的问诊训练</h1>
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                ⭐ 今日推荐练习：请从下方选择一个病例开始问诊。
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {variants.length === 0 ? (
                    <div className="col-span-full py-16 text-center">
                        <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <span className="text-4xl">👋</span>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">欢迎加入班级！</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            您的老师暂未发布训练任务。请稍作等待，或联系老师确认。
                        </p>
                    </div>
                ) : (
                    variants.map(v => (
                        <div key={v.id} className="bg-white p-6 rounded-lg shadow border border-slate-200 hover:border-primary transition cursor-pointer" onClick={() => navigate(`/student/training/${v.id}`)}>
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-slate-800">{v.disease_name}</h3>
                                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">{v.difficulty_level}</span>
                            </div>
                            <p className="text-slate-600 mt-2 text-sm font-medium">{v.variant_name}</p>
                            <p className="text-slate-400 mt-1 text-xs">生成时间: {new Date().toLocaleDateString()}</p>
                            <button
                                className="mt-4 w-full bg-primary text-white py-2 rounded hover:bg-blue-600 transition"
                            >
                                开始训练
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

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
                    </Route>

                    {/* Redirect root to appropriate dashboard */}
                    <Route path="/" element={<RootRedirect />} />
                </Route>

                <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
                    <Route path="/teacher" element={<TeacherLayout />}>
                        <Route index element={<TeacherDashboard />} />
                        <Route path="classes" element={<ClassList />} />
                        <Route path="classes/:id" element={<ClassDetail />} />
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
