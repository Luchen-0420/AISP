CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20) DEFAULT 'student',
  full_name VARCHAR(100),
  student_number VARCHAR(50),
  job_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 病例模板表（教师创建）
CREATE TABLE IF NOT EXISTS case_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by INT NOT NULL REFERENCES users(id), -- Changed UUID to INT to match users.id

    -- 病例基础信息
    disease_name VARCHAR(200) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,

    -- 病例模板核心内容
    patient_info JSONB NOT NULL,
    medical_info JSONB NOT NULL,
    history_elements JSONB NOT NULL,

    -- 元数据
    status VARCHAR(20) DEFAULT 'draft',
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 病例变体表（Agent生成）
CREATE TABLE IF NOT EXISTS case_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES case_templates(id),

    -- 患者信息（扩写生成）
    patient_info JSONB NOT NULL,
    personality JSONB NOT NULL,
    medical_info JSONB NOT NULL,

    -- 变体元数据
    difficulty_level VARCHAR(20) NOT NULL,
    estimated_duration INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES case_templates(id)
);

-- 班级表
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id INT NOT NULL REFERENCES users(id),

    name VARCHAR(200) NOT NULL,
    description TEXT,
    student_count INT DEFAULT 0,
    invite_code VARCHAR(10) UNIQUE,

    created_at TIMESTAMP DEFAULT NOW()
);

-- 学生-班级关联表
CREATE TABLE IF NOT EXISTS class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id),
    student_id INT NOT NULL REFERENCES users(id),

    joined_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(class_id, student_id)
);

-- 训练任务表 (Training Tasks)
CREATE TABLE IF NOT EXISTS training_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by INT NOT NULL REFERENCES users(id),

    title VARCHAR(200) NOT NULL,
    description TEXT,
    deadline TIMESTAMP NOT NULL,

    template_id UUID NOT NULL REFERENCES case_templates(id),
    use_random_variant BOOLEAN DEFAULT true,

    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 任务分配表
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES training_tasks(id),
    class_id UUID NOT NULL REFERENCES classes(id),

    assigned_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP NOT NULL,

    UNIQUE(task_id, class_id)
);

-- 学生作业完成记录
CREATE TABLE IF NOT EXISTS student_task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES training_tasks(id), -- Nullable for Free Practice
    student_id INT NOT NULL REFERENCES users(id),
    variant_id UUID REFERENCES case_variants(id),

    -- 训练记录 (关联到具体的 session_id，这里简化处理)
    session_id VARCHAR(100), 
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- 评分
    final_score JSONB,
    feedback TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);
