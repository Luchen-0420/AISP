import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { caseService } from '../../services/case.service';

interface CreateCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        disease_name: '',
        department: '内科',
        description: ''
    });

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                disease_name: '',
                department: '内科',
                description: ''
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await caseService.createCase(formData);
            alert('病例模版创建成功！');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create case:', error);
            alert('创建失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">新建标准病例模版</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">疾病名称</label>
                        <input
                            type="text"
                            required
                            className="w-full border border-slate-300 rounded-md p-2"
                            placeholder="例如：2型糖尿病"
                            value={formData.disease_name}
                            onChange={(e) => setFormData({ ...formData, disease_name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">所属科室</label>
                        <select
                            className="w-full border border-slate-300 rounded-md p-2"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                            <option value="内科">内科</option>
                            <option value="外科">外科</option>
                            <option value="妇产科">妇产科</option>
                            <option value="儿科">儿科</option>
                            <option value="全科">全科</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">简要描述</label>
                        <textarea
                            className="w-full border border-slate-300 rounded-md p-2"
                            rows={3}
                            placeholder="简要描述该病例的教学目标或标准表现"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            取消
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? '创建中...' : '确认创建'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
