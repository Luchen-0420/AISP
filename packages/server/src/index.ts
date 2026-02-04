import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, getProfile } from './controllers/user.controller';
import { authMiddleware } from './middleware/auth.middleware';
import { ClassController } from './controllers/class.controller';
import { CaseController } from './controllers/case.controller';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // In production, replace with specific domain
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-base-url', 'x-model-name']
}));
app.use(express.json());

// Auth Routes
app.post('/api/users/register', register);
app.post('/api/users/login', login);
app.get('/api/users/profile', authMiddleware, getProfile);

// AI Routes
import { chat, testConnection, generateExamResult, analyzeDialogue, generateFeedback, extractSOAP, analyzeMood } from './controllers/ai.controller';
app.post('/api/ai/chat', authMiddleware, chat);
app.post('/api/ai/test', authMiddleware, testConnection);
app.post('/api/ai/exam', authMiddleware, generateExamResult);
app.post('/api/ai/analyze', authMiddleware, analyzeDialogue);
app.post('/api/ai/feedback', authMiddleware, generateFeedback);
app.post('/api/ai/extract-soap', authMiddleware, extractSOAP);
app.post('/api/ai/mood', authMiddleware, analyzeMood);

// Class Routes
app.get('/api/classes', authMiddleware, ClassController.getClasses);
app.post('/api/classes', authMiddleware, ClassController.createClass);
app.get('/api/classes/:id', authMiddleware, ClassController.getClassDetail);
app.get('/api/classes/:id/analytics', authMiddleware, ClassController.getAnalytics);
app.delete('/api/classes/:id', authMiddleware, ClassController.deleteClass);

// Case Routes
app.get('/api/cases', authMiddleware, CaseController.getCases);
app.post('/api/cases', authMiddleware, CaseController.createCase);
app.delete('/api/cases/:id', authMiddleware, CaseController.deleteCase); // New
app.post('/api/cases/:id/generate', authMiddleware, CaseController.generateVariant);
app.post('/api/cases/:id/save-variant', authMiddleware, CaseController.saveVariant);
app.get('/api/cases/:id/variants', authMiddleware, CaseController.getVariants);
app.delete('/api/variants/:id', authMiddleware, CaseController.deleteVariant); // New variant delete
app.get('/api/daily-variants', authMiddleware, CaseController.getAllVariants); // Student endpoint
app.get('/api/variants/:id', authMiddleware, CaseController.getVariant); // Get specific variant details

// Training Routes
import { TrainingController } from './controllers/training.controller';
app.post('/api/training/submit', authMiddleware, TrainingController.submitSession);
app.get('/api/training/history', authMiddleware, TrainingController.getStudentHistory);
app.get('/api/training/session/:id', authMiddleware, TrainingController.getSessionById);
app.get('/api/training/session/:id/export', authMiddleware, TrainingController.exportOSCE);
app.get('/api/training/recommendations', authMiddleware, TrainingController.getRecommendations);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
