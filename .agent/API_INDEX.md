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
