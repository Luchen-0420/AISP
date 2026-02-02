# API Index

## 👤 User / Auth
| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| POST | `/api/users/register` | `user.controller.ts` -> `register` | Register new user (Supports optional: `fullName`, `studentNumber`, `inviteCode`, `jobNumber`) |
| POST | `/api/users/login` | `user.controller.ts` -> `login` | Login user & get JWT |
| GET | `/api/users/profile` | `user.controller.ts` -> `getProfile` | Get current user info (Protected) |

## 🤖 AI / Agent
| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| POST | `/api/ai/chat` | `ai.controller.ts` -> `chat` | Chat with AI (Headers: `x-api-key` etc. Body: `message`, `history`, `variantId`) |
| POST | `/api/ai/test` | `ai.controller.ts` -> `testConnection` | Verify API connection and credentials |
| POST | `/api/ai/exam` | `ai.controller.ts` -> `generateExamResult` | Generate exam result from AI |
| POST | `/api/ai/analyze` | `ai.controller.ts` -> `analyzeDialogue` | Analyze dialogue for scoring |
| POST | `/api/ai/feedback` | `ai.controller.ts` -> `generateFeedback` | 生成训练点评与分类学习资源推荐 |
| POST | `/api/ai/extract-soap` | `ai.controller.ts` -> `extractSOAP` | Extract SOAP data from chat history |
| POST | `/api/ai/mood` | `ai.controller.ts` -> `analyzeMood` | 分析医生消息对患者情绪/信任度的影响 |

## 🏫 Class Management
| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/classes` | `class.controller.ts` -> `getClasses` | Get all classes for teacher |
| POST | `/api/classes` | `class.controller.ts` -> `createClass` | Create new class |
| GET | `/api/classes/:id` | `class.controller.ts` -> `getClassDetail` | Get class detail with students |
| DELETE | `/api/classes/:id` | `class.controller.ts` -> `deleteClass` | Delete class and student relations |

## 📋 Case Management
| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/cases` | `case.controller.ts` -> `getCases` | Get all case templates |
| POST | `/api/cases` | `case.controller.ts` -> `createCase` | Create new standard case template |
| POST | `/api/cases/:id/generate` | `case.controller.ts` -> `generateVariant` | Generate variant using AI |
| POST | `/api/cases/:id/save-variant` | `case.controller.ts` -> `saveVariant` | Save generated variant |
| GET | `/api/cases/:id/variants` | `case.controller.ts` -> `getVariants` | Get variants for a specific template |
| DELETE | `/api/cases/:id` | `case.controller.ts` -> `deleteCase` | Delete case template and associated variants |
| DELETE | `/api/variants/:id` | `case.controller.ts` -> `deleteVariant` | Delete specific case variant |
| GET | `/api/daily-variants` | `case.controller.ts` -> `getAllVariants` | Get variants for student (Filtered by Class/Teacher) |
| GET | `/api/variants/:id` | `case.controller.ts` -> `getVariant` | Get specific variant details |

## 🏋️ Training
| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| POST | `/api/training/submit` | `training.controller.ts` -> `submitSession` | Submit training session (scores, history, SOAP) |
| GET | `/api/training/history` | `training.controller.ts` -> `getStudentHistory` | Get student's training history |
| GET | `/api/training/session/:id` | `training.controller.ts` -> `getSessionById` | Get specific session for replay |
| GET | `/api/training/recommendations` | `training.controller.ts` -> `getRecommendations` | Get personalized training recommendations |
| GET | `/api/training/session/:id/export` | `training.controller.ts` -> `exportOSCE` | Export session score as CSV |

## 📊 Analytics
| Method | Endpoint | Handler | Description |
|--------|----------|---------|-------------|
| GET | `/api/classes/:id/analytics` | `class.controller.ts` -> `getClassAnalytics` | Get class performance analytics |

