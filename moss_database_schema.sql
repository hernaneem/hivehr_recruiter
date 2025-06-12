-- Esquema de base de datos para Sistema de Tests MOSS
-- Compatible con Supabase/PostgreSQL
-- Ajustado para ser consistente con el proyecto RecruitAgent

-- 1. Tabla principal de tests MOSS
CREATE TABLE moss_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información del test
    test_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'not-started' CHECK (status IN ('not-started', 'pending', 'in-progress', 'completed', 'expired')),
    
    -- Fechas importantes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Duración del test
    time_spent_minutes INTEGER,
    
    -- Puntuaciones por área (Habilidad en Supervisión)
    hs_score INTEGER,
    hs_percentage INTEGER,
    hs_level VARCHAR(50),
    
    -- Capacidad de Decisiones en Relaciones Humanas
    cdrh_score INTEGER,
    cdrh_percentage INTEGER,
    cdrh_level VARCHAR(50),
    
    -- Capacidad de Evaluación de Problemas Interpersonales
    cepi_score INTEGER,
    cepi_percentage INTEGER,
    cepi_level VARCHAR(50),
    
    -- Habilidad para Establecer Relaciones Interpersonales
    heri_score INTEGER,
    heri_percentage INTEGER,
    heri_level VARCHAR(50),
    
    -- Sentido Común y Tacto en Relaciones Interpersonales
    sctri_score INTEGER,
    sctri_percentage INTEGER,
    sctri_level VARCHAR(50),
    
    -- Puntuación general
    total_score INTEGER,
    total_percentage INTEGER,
    
    -- Metadatos
    invitation_email_sent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de respuestas individuales del test MOSS
CREATE TABLE moss_test_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES moss_tests(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL CHECK (question_id BETWEEN 1 AND 30),
    selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de logs/historial de acciones para MOSS
CREATE TABLE moss_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES moss_tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    action VARCHAR(50) NOT NULL, -- 'invitation_sent', 'test_started', 'test_completed', 'results_viewed', etc.
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES para optimizar consultas
CREATE INDEX idx_moss_tests_candidate_id ON moss_tests(candidate_id);
CREATE INDEX idx_moss_tests_job_id ON moss_tests(job_id);
CREATE INDEX idx_moss_tests_recruiter_id ON moss_tests(recruiter_id);
CREATE INDEX idx_moss_tests_status ON moss_tests(status);
CREATE INDEX idx_moss_tests_token ON moss_tests(test_token);
CREATE INDEX idx_moss_tests_expires_at ON moss_tests(expires_at);

CREATE INDEX idx_moss_test_answers_test_id ON moss_test_answers(test_id);
CREATE INDEX idx_moss_test_answers_question_id ON moss_test_answers(question_id);
CREATE INDEX idx_moss_audit_logs_test_id ON moss_audit_logs(test_id);
CREATE INDEX idx_moss_audit_logs_created_at ON moss_audit_logs(created_at);

-- TRIGGERS para actualizar timestamps
CREATE TRIGGER update_moss_tests_updated_at 
    BEFORE UPDATE ON moss_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE moss_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE moss_test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE moss_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para moss_tests
CREATE POLICY "Recruiters can view their own MOSS tests" ON moss_tests
    FOR SELECT USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can insert their own MOSS tests" ON moss_tests
    FOR INSERT WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update their own MOSS tests" ON moss_tests
    FOR UPDATE USING (recruiter_id = auth.uid());

-- Políticas de seguridad para moss_test_answers
CREATE POLICY "Recruiters can view answers for their tests" ON moss_test_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM moss_tests 
            WHERE moss_tests.id = moss_test_answers.test_id 
            AND moss_tests.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can insert answers for their tests" ON moss_test_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM moss_tests 
            WHERE moss_tests.id = moss_test_answers.test_id 
            AND moss_tests.recruiter_id = auth.uid()
        )
    );

-- Políticas de seguridad para moss_audit_logs
CREATE POLICY "Recruiters can view their own MOSS audit logs" ON moss_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM moss_tests 
            WHERE moss_tests.id = moss_audit_logs.test_id 
            AND moss_tests.recruiter_id = auth.uid()
        )
    );

CREATE POLICY "System can insert MOSS audit logs" ON moss_audit_logs
    FOR INSERT WITH CHECK (true);

-- FUNCIONES auxiliares

-- Función para generar token único para MOSS
CREATE OR REPLACE FUNCTION generate_moss_token()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN encode(
        digest(
            'moss_' || extract(epoch from now()) || '_' || gen_random_uuid()::text,
            'sha256'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para crear un nuevo test MOSS
CREATE OR REPLACE FUNCTION create_moss_test(
    p_candidate_id UUID,
    p_job_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_test_id UUID;
    v_token VARCHAR(255);
BEGIN
    -- Generar token único
    v_token := generate_moss_token();
    
    -- Insertar el test
    INSERT INTO moss_tests (
        candidate_id, 
        recruiter_id, 
        job_id, 
        test_token,
        status
    )
    VALUES (
        p_candidate_id, 
        auth.uid(), 
        p_job_id, 
        v_token,
        'pending'
    )
    RETURNING id INTO v_test_id;
    
    -- Registrar en audit log
    INSERT INTO moss_audit_logs (test_id, user_id, action, details)
    VALUES (v_test_id, auth.uid(), 'test_created', jsonb_build_object('candidate_id', p_candidate_id, 'job_id', p_job_id));
    
    RETURN v_test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para guardar los resultados del test MOSS
CREATE OR REPLACE FUNCTION save_moss_test_results(
    p_test_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_answers JSONB,
    p_results JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_answer JSONB;
    v_duration_minutes INTEGER;
BEGIN
    -- Calcular duración
    v_duration_minutes := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
    
    -- Actualizar información del test
    UPDATE moss_tests SET
        started_at = p_start_time,
        completed_at = p_end_time,
        time_spent_minutes = v_duration_minutes,
        status = 'completed',
        -- Área HS (Habilidad en Supervisión)
        hs_score = (p_results->0->>'score')::INTEGER,
        hs_percentage = (p_results->0->>'percentage')::INTEGER,
        hs_level = p_results->0->>'level',
        -- Área CDRH (Capacidad de Decisiones en RR.HH.)
        cdrh_score = (p_results->1->>'score')::INTEGER,
        cdrh_percentage = (p_results->1->>'percentage')::INTEGER,
        cdrh_level = p_results->1->>'level',
        -- Área CEPI (Capacidad de Evaluación de Problemas Interpersonales)
        cepi_score = (p_results->2->>'score')::INTEGER,
        cepi_percentage = (p_results->2->>'percentage')::INTEGER,
        cepi_level = p_results->2->>'level',
        -- Área HERI (Habilidad para Establecer Relaciones Interpersonales)
        heri_score = (p_results->3->>'score')::INTEGER,
        heri_percentage = (p_results->3->>'percentage')::INTEGER,
        heri_level = p_results->3->>'level',
        -- Área SCTRI (Sentido Común y Tacto en Relaciones Interpersonales)
        sctri_score = (p_results->4->>'score')::INTEGER,
        sctri_percentage = (p_results->4->>'percentage')::INTEGER,
        sctri_level = p_results->4->>'level',
        -- Totales
        total_score = (
            (p_results->0->>'score')::INTEGER +
            (p_results->1->>'score')::INTEGER +
            (p_results->2->>'score')::INTEGER +
            (p_results->3->>'score')::INTEGER +
            (p_results->4->>'score')::INTEGER
        ),
        total_percentage = (
            (p_results->0->>'percentage')::INTEGER +
            (p_results->1->>'percentage')::INTEGER +
            (p_results->2->>'percentage')::INTEGER +
            (p_results->3->>'percentage')::INTEGER +
            (p_results->4->>'percentage')::INTEGER
        ) / 5,
        updated_at = NOW()
    WHERE id = p_test_id;
    
    -- Guardar respuestas individuales
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        INSERT INTO moss_test_answers (test_id, question_id, selected_answer, is_correct)
        VALUES (
            p_test_id,
            (v_answer->>'questionId')::INTEGER,
            v_answer->>'answer',
            (v_answer->>'isCorrect')::BOOLEAN
        );
    END LOOP;
    
    -- Registrar en audit log
    INSERT INTO moss_audit_logs (test_id, user_id, action, details)
    VALUES (p_test_id, auth.uid(), 'test_completed', jsonb_build_object('duration_minutes', v_duration_minutes));
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista para obtener resumen de tests MOSS por candidato
CREATE OR REPLACE VIEW moss_test_summary AS
SELECT 
    c.id as candidate_id,
    c.name as candidate_name,
    c.email as candidate_email,
    j.title as job_title,
    j.company as job_company,
    mt.id as test_id,
    mt.status,
    mt.created_at as test_date,
    mt.completed_at,
    mt.time_spent_minutes,
    mt.total_percentage,
    mt.hs_level,
    mt.cdrh_level,
    mt.cepi_level,
    mt.heri_level,
    mt.sctri_level,
    CASE 
        WHEN mt.total_percentage >= 83 THEN 'Altamente Recomendado'
        WHEN mt.total_percentage >= 64 THEN 'Recomendado'
        WHEN mt.total_percentage >= 42 THEN 'Aceptable'
        ELSE 'No Recomendado'
    END as recommendation,
    mt.recruiter_id
FROM moss_tests mt
JOIN candidates c ON c.id = mt.candidate_id
LEFT JOIN jobs j ON j.id = mt.job_id
WHERE mt.status IN ('completed', 'in-progress', 'pending');

-- Función para obtener estadísticas de MOSS
CREATE OR REPLACE FUNCTION get_moss_stats(p_recruiter_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_tests', COUNT(*),
        'completed_tests', COUNT(*) FILTER (WHERE status = 'completed'),
        'pending_tests', COUNT(*) FILTER (WHERE status = 'pending'),
        'in_progress_tests', COUNT(*) FILTER (WHERE status = 'in-progress'),
        'expired_tests', COUNT(*) FILTER (WHERE status = 'expired'),
        'avg_completion_time', AVG(time_spent_minutes) FILTER (WHERE status = 'completed'),
        'avg_score', AVG(total_percentage) FILTER (WHERE status = 'completed')
    ) INTO v_stats
    FROM moss_tests
    WHERE recruiter_id = p_recruiter_id;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar tests expirados
CREATE OR REPLACE FUNCTION cleanup_expired_moss_tests()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Marcar como expirados los tests que han pasado su fecha de expiración
    UPDATE moss_tests 
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('not-started', 'pending', 'in-progress') 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Crear un job para limpiar tests expirados (ejecutar diariamente)
-- Nota: Esto requiere la extensión pg_cron en Supabase
-- SELECT cron.schedule('cleanup-expired-moss-tests', '0 2 * * *', 'SELECT cleanup_expired_moss_tests();'); 