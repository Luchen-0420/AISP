# Database Schema Documentation

## 📊 Tables

### `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK | User ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| password | TEXT | NOT NULL | Hashed password |
| email | VARCHAR(100) | UNIQUE | Contact email |
| role | VARCHAR(20) | DEFAULT 'student' | User role (student, teacher, admin) |
| full_name | VARCHAR(100) | | Real Name |
| student_number | VARCHAR(50) | | Student ID |
| job_number | VARCHAR(50) | | Teacher Job ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

## 🏥 Phase 6 Tables

### `case_templates` (教师创建的病例模板)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| created_by | INT | FK -> users.id |
| disease_name | VARCHAR | 疾病名称 |
| status | VARCHAR | draft, published |
| patient_info | JSONB | 患者基础信息 (含 description) |
| medical_info | JSONB | 医疗信息 (现病史等) |
| history_elements | JSONB | 历史记录 |
| scenario_type | VARCHAR | standard / other |

### `case_variants` (AI 生成的病例变体)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| template_id | UUID | FK -> case_templates.id |
| variant_name | VARCHAR | 变体名称 (AI 生成或自动命名) |
| difficulty_level | VARCHAR | 难度 |
| estimated_duration | INT | 预计时长 (分钟) |

### `classes` (班级)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| teacher_id | INT | FK -> users.id |
| name | VARCHAR | 班级名称 |
| invite_code | VARCHAR(10) | UNIQUE | 6-digit Invite Code |

### `class_students` (班级学生关联)
| Column | Type | Description |
|--------|------|-------------|
| class_id | UUID | FK -> classes.id |
| student_id | INT | FK -> users.id |

### `training_tasks` (作业/任务)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| template_id | UUID | FK -> case_templates.id |
| deadline | TIMESTAMP | 截止时间 |

### `student_task_completions` (作业完成记录)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK (Auto-generated) |
| task_id | UUID | FK -> training_tasks.id (Nullable for free practice) |
| student_id | INT | FK -> users.id |
| variant_id | UUID | FK -> case_variants.id |
| session_id | VARCHAR | Unique session identifier |
| final_score | JSONB | 最终得分 (含各维度评分) |
| session_data | JSONB | 会话数据 (messages, soapData) 用于回放 |
| opqrst_coverage | JSONB | OPQRST覆盖率 { covered: [], percentage: number, details: {} } |
| ai_feedback | JSONB | AI反馈 { highlights, improvements, resources: [{ type, title, reason }] } |
| created_at | TIMESTAMP | 记录创建时间 |
| started_at | TIMESTAMP | 训练开始时间 |
| completed_at | TIMESTAMP | 训练完成时间 |

## 🔗 Relations
*None*
