# Application Navigation & Component Map

## 📦 Project Structure
- `packages/web`: React Frontend (Vite)
- `packages/server`: Express Backend (Node.js)

## 🌐 Web Frontend Map (`packages/web`)

### 🔑 Authentication
- **Login Page**: `src/pages/Login.tsx` (Route: `/login`)
- **Register Page**: `src/pages/Register.tsx` (Route: `/register`)
- **Settings Page**: `src/pages/Settings.tsx` (Route: `/student/settings` & `/teacher/settings`, Linked in Header/Sidebar)
- **User Store**: `src/store/userStore.ts` (Zustand: Auth state, Roles, API Keys, Model Name)

### 📡 Frontend Services
- **Auth**: `src/api/request.ts` (Axios instance with Interceptors)
- **Class**: `src/services/class.service.ts` (Class CRUD)
- **Case**: `src/services/case.service.ts` (Case Fetching)
- **Training**: `src/services/training.service.ts` (Session Submission, History, Replay)

### 🔧 Shared Utilities
- **OPQRST**: `src/utils/opqrst.ts` (OPQRST definitions, keyword detection, coverage calculation)

### 🏥 Clinical Training
- **Training Store**: `src/store/trainingStore.ts` (Session, Timer, SOAP State, Messages)
- **Data Types**: `src/types/soap.ts` (Exam, Diagnosis, Plan interfaces)
- **Student Dashboard**: `src/pages/student/StudentDashboard.tsx` (Protected Root, Personal Recommendations)
- **Training Console**: `src/pages/training/TrainingPage.tsx` (Route: `/student/training/:id`)
  - **Status Panel**: `src/components/training/StatusPanel.tsx` (Left: Timer, Patient Mood, Score, End Session, AI SOAP Auto-fill)
  - **Chat Interface**: `src/components/training/ChatInterface.tsx` (Center: Real-time AI Chat, Collapsible OPQRST Tracker, Quick Buttons)
  - **SOAP Container**: `src/components/training/SoapContainer.tsx` (Right: Clinical Tools)
- **Analysis & Result**: `src/pages/training/TrainingResultPage.tsx` (Route: `/student/training/:id/result`)
  - **Chart**: `src/components/analysis/AbilityRadar.tsx` (Recharts Visualization)
  - **Score**: `src/components/analysis/ScoreCard.tsx` (Metric Display)
- **Training History**: `src/pages/student/TrainingHistoryPage.tsx` (Route: `/student/history`)
- **Training Replay**: `src/pages/student/TrainingReplayPage.tsx` (Route: `/student/replay/:id`)

### 🎓 Teacher Portal
- **Teacher Dashboard**: `src/pages/teacher/TeacherDashboard.tsx` (Route: `/teacher`)
- **Teacher Layout**: `src/layouts/TeacherLayout.tsx` (Sidebar Navigation)
- **Module Structure**:
  - **Dashboard**: `src/pages/teacher/TeacherDashboard.tsx`
  - **Classes**: 
    - `src/pages/teacher/ClassList.tsx` (List)
    - `src/pages/teacher/ClassDetail.tsx` (Detail)
    - `src/pages/teacher/ClassAnalyticsPage.tsx` (Analytics & Charts)
  - **Cases**: `src/pages/teacher/CaseLibrary.tsx`
  - **Components**: 
    - `src/components/teacher/VariantDetailModal.tsx` (Variant Detail View)
    - `src/components/teacher/VariantGenerationModal.tsx` (AI Generation Dialog)
    - `src/components/teacher/CreateCaseModal.tsx` (Create Standard Case)
    - `src/components/teacher/CreateClassModal.tsx` (Create New Class)
    - `src/pages/teacher/CaseLibrary.tsx` -> `CaseVariantsList` (Internal Component)

### 📐 Layouts
- **AuthLayout**: `src/layouts/AuthLayout.tsx` (Login/Register wrapper)
- **StudentLayout**: `src/layouts/StudentLayout.tsx` (Main Student Interface)
- **TeacherLayout**: `src/layouts/TeacherLayout.tsx` (Teacher Admin Interface)

### 🧱 Components
- **RoleBasedRoute**: `src/components/RoleBasedRoute.tsx` (Route Guard)
- **UI Library**: `src/components/ui/`
    - `Button.tsx`: Standardized buttons
    - `Card.tsx`: Content containers
    - `Badge.tsx`: Status labels

### 🛣️ Routing
- **Main Router**: `src/App.tsx`
    - `/` -> Redirects based on role
    - `/student` -> Student Dashboard
    - `/student/training/:id` -> Clinical Console
    - `/student/training/:id/result` -> Training Result
    - `/student/history` -> Training History
    - `/student/replay/:id` -> Training Replay
    - `/student/settings` -> Settings
    - `/teacher*` -> Teacher Portal (Role Guarded)

---

## 🖥️ Server Backend Map (`packages/server`)

### 🎮 Controllers
- **User**: `src/controllers/user.controller.ts` (Auth logic)
- **AI**: `src/controllers/ai.controller.ts` (Chat, Analyze, Feedback, SOAP Extract)
- **Class**: `src/controllers/class.controller.ts` (Class Mgmt)
- **Case**: `src/controllers/case.controller.ts` (Case Mgmt)
- **Training**: `src/controllers/training.controller.ts` (Session Submission, History, Replay)

### 🛠️ Services
- **User**: `src/services/user.service.ts` (DB interactions)
- **AI**: `src/services/ai.service.ts` (LangChain Integration, SOAP Extraction)
- **Class**: `src/services/class.service.ts` (Classes & Students)
- **Case**: `src/services/case.service.ts` (Case Templates)
- **Generation**: `src/services/case-generation.service.ts` (AI Case Variant Generation)

### 🧱 Models
- **User**: `src/models/user.model.ts`

