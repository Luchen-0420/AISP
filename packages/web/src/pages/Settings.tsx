import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Settings: React.FC = () => {
    const { apiKey, apiBaseUrl, modelName, setSettings } = useUserStore();
    const [key, setKey] = useState(apiKey);
    const [url, setUrl] = useState(apiBaseUrl);
    const [model, setModel] = useState(modelName);
    const [saved, setSaved] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        setKey(apiKey);
        setUrl(apiBaseUrl);
        setModel(modelName);
    }, [apiKey, apiBaseUrl, modelName]);

    const handleSave = () => {
        setSettings(key, url, model);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleTest = async () => {
        if (!key) {
            alert("请先填写 API Key");
            return;
        }
        setTesting(true);
        try {
            // Import request dynamically or use fetch to avoid circular deps if any, 
            // but we usually import `request` from `../api/request`.
            // However, `request` interceptor automatically reads from store. 
            // Here we want to test the *current input*, not necessarily what's in store (user might not have saved yet).
            // So we should construct headers manually using Axios or fetch.

            // Actually, if we use the `request` instance, it reads from STORE.
            // If user typed new key but didn't save, `request` uses OLD key.
            // So we must manually pass headers.

            // Let's rely on `request` but we need to pass config override.
            // But `request` interceptor might OVERWRITE.
            // Let's use `fetch` or a raw axios call here for simplicity to test *uncommitted* values.

            const token = useUserStore.getState().token;

            const headers: any = {
                'Content-Type': 'application/json',
                'x-api-key': key,
                'x-base-url': url,
                'x-model-name': model
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/ai/test', {
                method: 'POST',
                headers,
                body: JSON.stringify({})
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`✅ 连接成功！\nAI 回复: ${data.response}`);
            } else {
                alert(`❌ 连接失败: ${data.message}`);
            }
        } catch (e: any) {
            alert(`❌ 请求失败: ${e.message}`);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">系统设置</h1>

            <Card title="AI 模型接入配置">
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                        <p className="text-sm text-blue-800">
                            您可以配置自己的大模型 API 以获得真实且个性化的训练体验。
                            支持 OpenAI、通义千问 (DashScope)、DeepSeek 等兼容 OpenAI 协议的接口。
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            您的 Key 仅存储在本地浏览器，不会上传至服务器后台数据库。
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            API Base URL (可选)
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://api.openai.com/v1"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            如果您使用代理或兼容接口（如 DeepSeek），请在此填写 Base URL。
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Model Name (可选)
                        </label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="gpt-3.5-turbo"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            指定要使用的模型名称（如 gpt-4, deepseek-chat 等）。留空则使用默认值。
                        </p>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <Button variant="secondary" onClick={handleTest} disabled={testing}>
                            {testing ? '测试中...' : '🔌 测试连接'}
                        </Button>
                        <Button onClick={handleSave} isLoading={false}>
                            保存配置
                        </Button>
                        {saved && (
                            <span className="text-green-600 text-sm font-medium flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                保存成功
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
