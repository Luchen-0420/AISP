import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../../services/case.service';
import request from '../../api/request';

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [variants, setVariants] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch
                const [allVariants, recs] = await Promise.all([
                    caseService.getAllVariants(),
                    request.get('/training/recommendations').then(res => res.data).catch(() => [])
                ]);

                setVariants(allVariants);
                setRecommendations(recs);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to render card
    const renderCard = (v: any, isRecommended = false) => (
        <div key={v.id}
            className={`p-6 rounded-lg shadow border transition cursor-pointer relative overflow-hidden ${isRecommended
                    ? 'bg-blue-50 border-blue-200 hover:border-blue-400'
                    : 'bg-white border-slate-200 hover:border-primary'
                }`}
            onClick={() => navigate(`/student/training/${v.id}`)}>

            {isRecommended && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">
                    推荐练习
                </div>
            )}

            <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-slate-800">{v.disease_name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${v.difficulty_level === 'Hard' ? 'bg-red-100 text-red-700' :
                        v.difficulty_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                    }`}>{v.difficulty_level || 'Easy'}</span>
            </div>
            <p className="text-slate-600 mt-2 text-sm font-medium">{v.variant_name}</p>
            {isRecommended && v.reason && (
                <p className="text-xs text-blue-600 mt-2 italic">💡 {v.reason}</p>
            )}
            <button
                className={`mt-4 w-full py-2 rounded transition ${isRecommended
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
            >
                开始训练
            </button>
        </div>
    );

    if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-4">我的问诊训练</h1>
                {recommendations.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-1 rounded-full"><span className="text-blue-600">🎯</span></div>
                            <h2 className="text-lg font-semibold text-slate-800">个性化推荐</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendations.map(r => renderCard(r, true))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                        ⭐ 完成更多训练后，系统将为您生成个性化推荐。
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">全部病例库</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {variants.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            暂无可用病例，请联系老师发布。
                        </div>
                    ) : (
                        variants.map(v => renderCard(v))
                    )}
                </div>
            </div>
        </div>
    );
};
