import { pool } from '../db/client';

async function debugStudentView() {
    try {
        console.log('--- Debugging Student View ---');

        // 1. Get latest student
        const studentRes = await pool.query("SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC LIMIT 1");
        const student = studentRes.rows[0];
        if (!student) {
            console.log('No student users found.');
            return;
        }
        console.log(`Checking student: ${student.username} (ID: ${student.id})`);

        // 2. Check Enrollment
        const enrollmentRes = await pool.query("SELECT * FROM class_students WHERE student_id = $1", [student.id]);
        if (enrollmentRes.rows.length === 0) {
            console.log('❌ Student is NOT enrolled in any class.');
            console.log('   -> This is why the dashboard is empty.');

            // Check available classes
            const classesRes = await pool.query("SELECT * FROM classes");
            console.log(`   -> Total classes available in system: ${classesRes.rowCount}`);
            if (classesRes.rowCount > 0) {
                console.log(`   -> Suggestion: Add student ${student.username} to class '${classesRes.rows[0].name}' (ID: ${classesRes.rows[0].id})`);
            } else {
                console.log('   -> No classes exist. Teacher needs to create a class first.');
            }
            return;
        }

        console.log(`✅ Student is enrolled in ${enrollmentRes.rowCount} class(es).`);
        const classId = enrollmentRes.rows[0].class_id;

        // 3. Check Teacher of that class
        const classRes = await pool.query("SELECT * FROM classes WHERE id = $1", [classId]);
        const teacherId = classRes.rows[0].teacher_id;
        console.log(`   -> Class is taught by Teacher ID: ${teacherId}`);

        // 5. Test the EXACT query from CaseService
        console.log('--- Testing Service Query ---');
        const serviceQuery = `
            SELECT DISTINCT v.id, v.variant_name, v.difficulty_level, t.disease_name 
            FROM case_variants v
            JOIN case_templates t ON v.template_id = t.id
            JOIN classes c ON c.teacher_id = t.created_by
            JOIN class_students cs ON cs.class_id = c.id
            WHERE cs.student_id = $1
            ORDER BY v.created_at DESC
        `;
        const serviceRes = await pool.query(serviceQuery, [student.id]);
        console.log(`Service Query returned ${serviceRes.rowCount} rows.`);

        if (serviceRes.rowCount === 0) {
            console.log('❌ Service query failed to return data. diagnosing JOINs...');

            // Diagnosis 1: Check if there are ANY templates for this teacher
            const temRes = await pool.query("SELECT id, created_by FROM case_templates WHERE created_by = $1", [teacherId]);
            console.log(`   -> Templates by Teacher ${teacherId}: ${temRes.rowCount}`);

            if (temRes.rowCount > 0) {
                // Diagnosis 2: Check variants for these templates
                const firstTemplateId = temRes.rows[0].id;
                const varRes = await pool.query("SELECT id FROM case_variants WHERE template_id = $1", [firstTemplateId]);
                console.log(`   -> Variants for Template ${firstTemplateId}: ${varRes.rowCount}`);
            }

            // Diagnosis 3: Check Class-Teacher-Template Link
            // Does the class found actually point to the same teacher?
            console.log(`   -> Student's Class ID: ${classId}`);
            console.log(`   -> Teacher of that Class: ${teacherId}`);

            // Check if t.created_by matches c.teacher_id type-wise
            const typeCheck = await pool.query(`
                SELECT c.id as class_id, c.teacher_id, t.id as temp_id, t.created_by 
                FROM classes c, case_templates t 
                WHERE c.id = $1 AND t.created_by = c.teacher_id
                LIMIT 1
            `, [classId]);
            console.log(`   -> Join Check (Class <-> Template on teacher): ${typeCheck.rowCount > 0 ? 'MATCH' : 'NO MATCH'}`);
        } else {
            console.log('✅ Service query SUCCEEDED! The frontend should show these rows.');
            console.log('Sample Data:', serviceRes.rows[0]);
        }

        // 4. Check Variants from that teacher
        const variantsRes = await pool.query("SELECT COUNT(*) FROM case_variants Cv JOIN case_templates Ct ON Cv.template_id = Ct.id WHERE Ct.created_by = $1", [teacherId]);
        console.log(`   -> Teacher has created ${variantsRes.rows[0].count} variants.`);

        if (parseInt(variantsRes.rows[0].count) === 0) {
            console.log('❌ Teacher has not generated any variants yet.');
        } else {
            console.log('✅ Variants exist. The query should return results.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

debugStudentView();
