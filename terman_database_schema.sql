-- Esquema de base de datos para Sistema de Tests Terman-Merrill
-- Compatible con Supabase/PostgreSQL
-- Ajustado para ser consistente con el proyecto RecruitAgent

-- 1. Tabla principal de tests Terman-Merrill
CREATE TABLE terman_tests (
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
    
    -- Resultados generales del Terman-Merrill
    total_score INTEGER,           -- Puntuación total bruta
    ci INTEGER,                    -- Coeficiente Intelectual
    mental_age DECIMAL(4,2),       -- Edad mental (ej: 15.5 años)
    
    -- Puntuaciones por serie (10 series)
    serie_i_score INTEGER,         -- Información General
    serie_ii_score INTEGER,        -- Juicio Lógico
    serie_iii_score INTEGER,       -- Vocabulario
    serie_iv_score INTEGER,        -- Selección Lógica
    serie_v_score INTEGER,         -- Aritmética
    serie_vi_score INTEGER,        -- Construcción de Oraciones
    serie_vii_score INTEGER,       -- Analogías
    serie_viii_score INTEGER,      -- Memoria Ordenada
    serie_ix_score INTEGER,        -- Clasificación
    serie_x_score INTEGER,         -- Ordenamiento
    
    -- Interpretación cualitativa
    ci_classification VARCHAR(50), -- Clasificación del CI (Superior, Normal Alto, etc.)
    strengths TEXT[],              -- Fortalezas identificadas
    development_areas TEXT[],      -- Áreas de desarrollo
    
    -- Metadatos
    invitation_email_sent BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para guardar respuestas individuales en tiempo real
CREATE TABLE IF NOT EXISTS terman_test_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_token VARCHAR(255) NOT NULL,
    question_id VARCHAR(10) NOT NULL, -- Ejemplo: 'I-1', 'IV-5'
    serie VARCHAR(5) NOT NULL,
    question_number INTEGER NOT NULL,
    user_answer TEXT, -- La respuesta del usuario (puede ser texto, letra, o JSON para múltiples)
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(test_token, question_id),
    FOREIGN KEY (test_token) REFERENCES terman_tests(test_token) ON DELETE CASCADE
);

-- 2. Tabla de respuestas individuales del test Terman-Merrill
CREATE TABLE terman_test_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES terman_tests(id) ON DELETE CASCADE,
    
    -- Identificación de la pregunta
    serie VARCHAR(5) NOT NULL,                    -- 'I', 'II', 'III', etc.
    question_number INTEGER NOT NULL,             -- Número de pregunta dentro de la serie
    
    -- Respuesta del candidato
    selected_answer TEXT,                         -- Respuesta seleccionada o escrita
    is_correct BOOLEAN,                          -- Si la respuesta es correcta
    time_taken_seconds INTEGER,                  -- Tiempo tomado para responder
    
    -- Metadatos
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de resultados detallados por serie
CREATE TABLE terman_serie_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES terman_tests(id) ON DELETE CASCADE,
    
    -- Información de la serie
    serie VARCHAR(5) NOT NULL,                    -- 'I', 'II', 'III', etc.
    serie_name VARCHAR(100) NOT NULL,             -- Nombre completo de la serie
    
    -- Resultados de la serie
    total_questions INTEGER NOT NULL,             -- Total de preguntas en la serie
    correct_answers INTEGER NOT NULL,             -- Respuestas correctas
    incorrect_answers INTEGER NOT NULL,           -- Respuestas incorrectas
    skipped_answers INTEGER DEFAULT 0,            -- Respuestas omitidas
    
    -- Puntuación
    raw_score INTEGER NOT NULL,                   -- Puntuación bruta
    weighted_score DECIMAL(5,2),                  -- Puntuación ponderada si aplica
    
    -- Tiempo
    time_spent_seconds INTEGER,                   -- Tiempo total en la serie
    time_limit_seconds INTEGER DEFAULT 240,       -- Límite de tiempo (4 minutos por defecto)
    
    -- Análisis
    difficulty_level VARCHAR(20),                 -- Fácil, Medio, Difícil
    percentile DECIMAL(5,2),                      -- Percentil comparativo
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de logs/historial de acciones para Terman-Merrill
CREATE TABLE terman_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES terman_tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    action VARCHAR(50) NOT NULL, -- 'invitation_sent', 'test_started', 'serie_completed', 'test_completed', 'results_viewed', etc.
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES para optimizar consultas
CREATE INDEX idx_terman_tests_candidate_id ON terman_tests(candidate_id);
CREATE INDEX idx_terman_tests_job_id ON terman_tests(job_id);
CREATE INDEX idx_terman_tests_recruiter_id ON terman_tests(recruiter_id);
CREATE INDEX idx_terman_tests_status ON terman_tests(status);
CREATE INDEX idx_terman_tests_token ON terman_tests(test_token);
CREATE INDEX idx_terman_tests_expires_at ON terman_tests(expires_at);
CREATE INDEX idx_terman_tests_ci ON terman_tests(ci);

CREATE INDEX idx_terman_test_answers_test_id ON terman_test_answers(test_id);
CREATE INDEX idx_terman_test_answers_serie ON terman_test_answers(serie);
CREATE INDEX idx_terman_test_answers_question_number ON terman_test_answers(question_number);

CREATE INDEX idx_terman_serie_results_test_id ON terman_serie_results(test_id);
CREATE INDEX idx_terman_serie_results_serie ON terman_serie_results(serie);

CREATE INDEX idx_terman_audit_logs_test_id ON terman_audit_logs(test_id);
CREATE INDEX idx_terman_audit_logs_created_at ON terman_audit_logs(created_at);

CREATE INDEX idx_terman_responses_token ON terman_test_responses(test_token);
CREATE INDEX idx_terman_responses_serie ON terman_test_responses(serie);

-- TRIGGERS para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_terman_tests_updated_at 
    BEFORE UPDATE ON terman_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terman_response_timestamp
    BEFORE UPDATE ON terman_test_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_terman_response_timestamp();

-- RLS (Row Level Security)
ALTER TABLE terman_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE terman_test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE terman_serie_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE terman_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE terman_test_responses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para terman_tests
CREATE POLICY "Recruiters can manage their own Terman tests" ON terman_tests
    FOR ALL USING (recruiter_id = auth.uid());

CREATE POLICY "Candidates can view their own tests via token" ON terman_tests
    FOR SELECT USING (true);

-- Políticas de seguridad para terman_test_answers
CREATE POLICY "Only test owners can manage answers" ON terman_test_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM terman_tests 
            WHERE terman_tests.id = terman_test_answers.test_id 
            AND (terman_tests.recruiter_id = auth.uid() OR terman_tests.candidate_id = auth.uid())
        )
    );

-- Políticas de seguridad para terman_serie_results
CREATE POLICY "Only test owners can view serie results" ON terman_serie_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM terman_tests 
            WHERE terman_tests.id = terman_serie_results.test_id 
            AND (terman_tests.recruiter_id = auth.uid() OR terman_tests.candidate_id = auth.uid())
        )
    );

-- Políticas de seguridad para terman_audit_logs
CREATE POLICY "Only recruiters can view audit logs" ON terman_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM terman_tests 
            WHERE terman_tests.id = terman_audit_logs.test_id 
            AND terman_tests.recruiter_id = auth.uid()
        )
    );

-- Política: Los usuarios solo pueden ver/editar sus propias respuestas de tests
CREATE POLICY "Users can manage their own test responses" ON terman_test_responses
    FOR ALL USING (
        test_token IN (
            SELECT test_token FROM terman_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

-- FUNCIONES ÚTILES

-- Función para generar token único para Terman-Merrill
CREATE OR REPLACE FUNCTION generate_terman_token()
RETURNS VARCHAR(255) AS $$
DECLARE
    v_token VARCHAR(255);
    v_exists BOOLEAN := TRUE;
BEGIN
    WHILE v_exists LOOP
        -- Generar token usando timestamp + random + prefijo
        v_token := 'TM_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || 
                   LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Verificar si ya existe
        SELECT EXISTS(SELECT 1 FROM terman_tests WHERE test_token = v_token) INTO v_exists;
    END LOOP;
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Función para crear un test Terman-Merrill
CREATE OR REPLACE FUNCTION create_terman_test(
    p_candidate_id UUID,
    p_job_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_test_id UUID;
    v_token VARCHAR(255);
BEGIN
    -- Generar token único
    v_token := generate_terman_token();
    
    -- Insertar el test
    INSERT INTO terman_tests (
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
    INSERT INTO terman_audit_logs (test_id, user_id, action, details)
    VALUES (v_test_id, auth.uid(), 'test_created', jsonb_build_object('candidate_id', p_candidate_id, 'job_id', p_job_id));
    
    RETURN v_test_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para calcular el CI basado en puntuación total y edad
CREATE OR REPLACE FUNCTION calculate_ci(
    p_total_score INTEGER,
    p_chronological_age DECIMAL DEFAULT 25.0  -- Edad cronológica por defecto
)
RETURNS INTEGER AS $$
DECLARE
    v_mental_age DECIMAL;
    v_ci INTEGER;
BEGIN
    -- Tabla de conversión simplificada (esto se debería ajustar con baremos reales)
    v_mental_age := CASE
        WHEN p_total_score >= 140 THEN 30.0
        WHEN p_total_score >= 130 THEN 28.0
        WHEN p_total_score >= 120 THEN 26.0
        WHEN p_total_score >= 110 THEN 24.0
        WHEN p_total_score >= 100 THEN 22.0
        WHEN p_total_score >= 90 THEN 20.0
        WHEN p_total_score >= 80 THEN 18.0
        WHEN p_total_score >= 70 THEN 16.0
        WHEN p_total_score >= 60 THEN 14.0
        WHEN p_total_score >= 50 THEN 12.0
        ELSE 10.0
    END;
    
    -- Calcular CI: (Edad Mental / Edad Cronológica) * 100
    v_ci := ROUND((v_mental_age / p_chronological_age) * 100);
    
    RETURN v_ci;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener clasificación del CI
CREATE OR REPLACE FUNCTION get_ci_classification(p_ci INTEGER)
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN CASE
        WHEN p_ci >= 140 THEN 'Muy Superior'
        WHEN p_ci >= 120 THEN 'Superior'
        WHEN p_ci >= 110 THEN 'Normal Alto'
        WHEN p_ci >= 90 THEN 'Normal'
        WHEN p_ci >= 80 THEN 'Normal Bajo'
        WHEN p_ci >= 70 THEN 'Límite'
        ELSE 'Deficiente'
    END;
END;
$$ LANGUAGE plpgsql;

-- Función para guardar los resultados del test Terman-Merrill
CREATE OR REPLACE FUNCTION save_terman_test_results(
    p_test_id UUID,
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_end_time TIMESTAMP WITH TIME ZONE,
    p_answers JSONB,
    p_serie_results JSONB,
    p_total_score INTEGER,
    p_chronological_age DECIMAL DEFAULT 25.0
)
RETURNS BOOLEAN AS $$
DECLARE
    v_duration_minutes INTEGER;
    v_ci INTEGER;
    v_mental_age DECIMAL;
    v_classification VARCHAR(50);
    v_answer JSONB;
    v_serie JSONB;
BEGIN
    -- Calcular duración
    v_duration_minutes := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
    
    -- Calcular CI y edad mental
    v_ci := calculate_ci(p_total_score, p_chronological_age);
    v_mental_age := (v_ci::DECIMAL / 100.0) * p_chronological_age;
    v_classification := get_ci_classification(v_ci);
    
    -- Actualizar el test principal
    UPDATE terman_tests SET
        status = 'completed',
        completed_at = p_end_time,
        time_spent_minutes = v_duration_minutes,
        total_score = p_total_score,
        ci = v_ci,
        mental_age = v_mental_age,
        ci_classification = v_classification,
        updated_at = NOW()
    WHERE id = p_test_id;
    
    -- Guardar respuestas individuales
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        INSERT INTO terman_test_answers (
            test_id,
            serie,
            question_number,
            selected_answer,
            is_correct,
            time_taken_seconds
        ) VALUES (
            p_test_id,
            v_answer->>'serie',
            (v_answer->>'question_number')::INTEGER,
            v_answer->>'selected_answer',
            (v_answer->>'is_correct')::BOOLEAN,
            (v_answer->>'time_taken_seconds')::INTEGER
        );
    END LOOP;
    
    -- Guardar resultados por serie
    FOR v_serie IN SELECT * FROM jsonb_array_elements(p_serie_results)
    LOOP
        INSERT INTO terman_serie_results (
            test_id,
            serie,
            serie_name,
            total_questions,
            correct_answers,
            incorrect_answers,
            skipped_answers,
            raw_score,
            time_spent_seconds
        ) VALUES (
            p_test_id,
            v_serie->>'serie',
            v_serie->>'serie_name',
            (v_serie->>'total_questions')::INTEGER,
            (v_serie->>'correct_answers')::INTEGER,
            (v_serie->>'incorrect_answers')::INTEGER,
            (v_serie->>'skipped_answers')::INTEGER,
            (v_serie->>'raw_score')::INTEGER,
            (v_serie->>'time_spent_seconds')::INTEGER
        );
    END LOOP;
    
    -- Registrar en audit log
    INSERT INTO terman_audit_logs (test_id, action, details)
    VALUES (p_test_id, 'test_completed', jsonb_build_object(
        'total_score', p_total_score,
        'ci', v_ci,
        'mental_age', v_mental_age,
        'classification', v_classification,
        'duration_minutes', v_duration_minutes
    ));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de tests Terman-Merrill para un reclutador
CREATE OR REPLACE FUNCTION get_terman_stats_for_recruiter(p_recruiter_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_tests', COUNT(*),
        'pending_tests', COUNT(*) FILTER (WHERE status = 'pending'),
        'completed_tests', COUNT(*) FILTER (WHERE status = 'completed'),
        'in_progress_tests', COUNT(*) FILTER (WHERE status = 'in-progress'),
        'expired_tests', COUNT(*) FILTER (WHERE status = 'expired'),
        'average_ci', ROUND(AVG(ci), 2) FILTER (WHERE ci IS NOT NULL),
        'average_completion_time', ROUND(AVG(time_spent_minutes), 2) FILTER (WHERE time_spent_minutes IS NOT NULL),
        'ci_distribution', jsonb_build_object(
            'muy_superior', COUNT(*) FILTER (WHERE ci >= 140),
            'superior', COUNT(*) FILTER (WHERE ci >= 120 AND ci < 140),
            'normal_alto', COUNT(*) FILTER (WHERE ci >= 110 AND ci < 120),
            'normal', COUNT(*) FILTER (WHERE ci >= 90 AND ci < 110),
            'normal_bajo', COUNT(*) FILTER (WHERE ci >= 80 AND ci < 90),
            'limite', COUNT(*) FILTER (WHERE ci >= 70 AND ci < 80),
            'deficiente', COUNT(*) FILTER (WHERE ci < 70)
        )
    ) INTO v_stats
    FROM terman_tests 
    WHERE recruiter_id = p_recruiter_id;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_terman_response_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 