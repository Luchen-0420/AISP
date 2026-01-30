import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

import { ClassService } from '../services/class.service';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, password, role, fullName, studentNumber, jobNumber, inviteCode } = req.body;

        const existingUser = await UserService.findByUsername(username);
        if (existingUser) return errorResponse(res, '用户名已存在', 400);

        // Validation based on role
        if (role === 'student') {
            if (!inviteCode) return errorResponse(res, '学生注册必须提供邀请码', 400);
            if (!studentNumber) return errorResponse(res, '学生注册必须提供学号', 400);
        } else if (role === 'teacher') {
            if (!jobNumber) return errorResponse(res, '教师注册必须提供工号', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const userRole = role === 'teacher' ? 'teacher' : 'student';

        // Create user
        const user = await UserService.createUser(username, passwordHash, userRole, {
            fullName,
            studentNumber,
            jobNumber
        });

        // If student, join class
        if (userRole === 'student' && inviteCode) {
            try {
                await ClassService.joinClassByInviteCode(user.id, inviteCode);
            } catch (err: any) {
                // If invite code fails, we might want to warn but not fail registration? 
                // Or fail transaction? For now, we return error but user is created.
                // Ideal: Transactional registration. But for simplicity, we return warning.
                console.error('Failed to join class:', err);
                return successResponse(res, user, '注册成功，但在加入班级时遇到问题，请联系老师。');
            }
        }

        return successResponse(res, user, '注册成功');
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await UserService.findByUsername(username);
        if (!user) return errorResponse(res, '用户不存在', 404);

        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) return errorResponse(res, '密码错误', 400);

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return successResponse(res, {
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        }, '登录成功');
    } catch (err: any) {
        return errorResponse(res, err.message);
    }
};

export const getProfile = async (req: any, res: Response) => {
    const user = await UserService.findById(req.user.id);
    return successResponse(res, user);
};
