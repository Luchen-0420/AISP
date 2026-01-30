import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrainingStore } from '../../store/trainingStore';
import { StatusPanel } from '../../components/training/StatusPanel';
import { ChatInterface } from '../../components/training/ChatInterface';
import { SoapContainer } from '../../components/training/SoapContainer';
import { caseService } from '../../services/case.service';

export const TrainingPage: React.FC = () => {
    const { id } = useParams();
    const { startSession, setVariant } = useTrainingStore();

    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        if (id) {
            startSession(id);
            // Fetch variant details
            caseService.getVariantById(id).then(data => {
                if (!data) {
                    setError(`No data found for ID: ${id}`);
                    setVariant(null);
                } else {
                    setVariant(data);
                    setError(null);
                }
            }).catch((err: any) => {
                console.error("Failed to load variant details", err);
                const errMsg = typeof err === 'object' && err !== null ? (err.message || JSON.stringify(err)) : String(err);
                setError(`Failed to load: ${errMsg}`);
            });
        }
    }, [id]);


    return (
        <div className="h-[calc(100vh-64px)] grid grid-cols-12 overflow-hidden">
            {error && (
                <div className="absolute top-0 left-0 w-full bg-red-100 text-red-700 p-2 z-50 text-center text-sm font-bold">
                    DEBUG: Page ID is "{id}" | Error: {error}
                </div>
            )}
            {/* Left: Status Panel (3 cols) */}
            <div className="col-span-3 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
                <StatusPanel />
            </div>

            {/* Center: Chat Interface (5 cols) */}
            <div className="col-span-5 border-r border-slate-200 bg-slate-50 relative overflow-hidden flex flex-col">
                <ChatInterface />
            </div>

            {/* Right: SOAP Container (4 cols) */}
            <div className="col-span-4 bg-white overflow-hidden flex flex-col">
                <SoapContainer />
            </div>
        </div>
    );
};
