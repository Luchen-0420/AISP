import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, getProfile } from './controllers/user.controller';
import { authMiddleware } from './middleware/auth.middleware';
import { ClassController } from './controllers/class.controller';
import { CaseController } from './controllers/case.controller';
dotenv.config();
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
import { chat, testConnection } from './controllers/ai.controller';
app.post('/api/ai/chat', authMiddleware, chat);
app.post('/api/ai/test', authMiddleware, testConnection);
// Class Routes
app.get('/api/classes', authMiddleware, ClassController.getClasses);
app.post('/api/classes', authMiddleware, ClassController.createClass);
app.get('/api/classes/:id', authMiddleware, ClassController.getClassDetail);
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
app.get('/', (req, res) => {
    res.send('Server is running');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
