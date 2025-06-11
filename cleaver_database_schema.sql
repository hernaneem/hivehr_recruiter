-- Esquema de base de datos para Sistema de Tests Cleaver
-- Compatible con Supabase/PostgreSQL

-- 1. Tabla principal de tests Cleaver
CREATE TABLE cleaver_tests (
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
    
    -- Datos del test
    time_spent_minutes INTEGER,
    test_url TEXT,
    invitation_email_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadatos
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de respuestas del test Cleaver (una fila por grupo de preguntas)
CREATE TABLE cleaver_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES cleaver_tests(id) ON DELETE CASCADE,
    
    -- Respuestas por grupo (24 grupos en total)
    group_number INTEGER NOT NULL CHECK (group_number BETWEEN 1 AND 24),
    most_selected INTEGER NOT NULL CHECK (most_selected BETWEEN 1 AND 4),
    least_selected INTEGER NOT NULL CHECK (least_selected BETWEEN 1 AND 4),
    
    -- Validación de que most y least sean diferentes
    CONSTRAINT different_selections CHECK (most_selected != least_selected),
    
    -- Un registro por grupo por test
    UNIQUE(test_id, group_number),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de puntuaciones DISC calculadas
CREATE TABLE cleaver_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES cleaver_tests(id) ON DELETE CASCADE,
    
    -- Puntuaciones DISC (M = Más, L = Menos, T = Total)
    d_most INTEGER DEFAULT 0,
    d_least INTEGER DEFAULT 0,
    d_total INTEGER DEFAULT 0,
    
    i_most INTEGER DEFAULT 0,
    i_least INTEGER DEFAULT 0,
    i_total INTEGER DEFAULT 0,
    
    s_most INTEGER DEFAULT 0,
    s_least INTEGER DEFAULT 0,
    s_total INTEGER DEFAULT 0,
    
    c_most INTEGER DEFAULT 0,
    c_least INTEGER DEFAULT 0,
    c_total INTEGER DEFAULT 0,
    
    -- Percentiles
    d_percentile INTEGER CHECK (d_percentile BETWEEN 1 AND 99),
    i_percentile INTEGER CHECK (i_percentile BETWEEN 1 AND 99),
    s_percentile INTEGER CHECK (s_percentile BETWEEN 1 AND 99),
    c_percentile INTEGER CHECK (c_percentile BETWEEN 1 AND 99),
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de interpretaciones y análisis
CREATE TABLE cleaver_interpretations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES cleaver_tests(id) ON DELETE CASCADE,
    
    -- Perfil dominante
    dominant_profile VARCHAR(10), -- D, I, S, C, DI, DC, etc.
    profile_description TEXT,
    
    -- Análisis detallado
    strengths TEXT[],
    development_areas TEXT[],
    work_style_description TEXT,
    leadership_style TEXT,
    communication_preferences TEXT,
    stress_behaviors TEXT,
    
    -- Recomendaciones
    job_fit_score INTEGER CHECK (job_fit_score BETWEEN 1 AND 10),
    recommendations TEXT[],
    interviewer_notes TEXT,
    
    -- Metadatos
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES auth.users(id),
    review_notes TEXT
);

-- 5. Tabla de logs/historial de acciones
CREATE TABLE cleaver_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id UUID REFERENCES cleaver_tests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    
    action VARCHAR(50) NOT NULL, -- 'invitation_sent', 'test_started', 'test_completed', 'results_viewed', etc.
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de configuración del test (para almacenar preguntas y configuraciones)
CREATE TABLE cleaver_test_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version VARCHAR(10) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Configuración de tiempo
    time_limit_minutes INTEGER DEFAULT 30,
    warning_time_minutes INTEGER DEFAULT 25,
    
    -- Configuración de grupos y mapeo DISC
    disc_mapping JSONB NOT NULL, -- Mapeo de cada grupo a factores DISC
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES para optimizar consultas
CREATE INDEX idx_cleaver_tests_candidate_id ON cleaver_tests(candidate_id);
CREATE INDEX idx_cleaver_tests_job_id ON cleaver_tests(job_id);
CREATE INDEX idx_cleaver_tests_recruiter_id ON cleaver_tests(recruiter_id);
CREATE INDEX idx_cleaver_tests_status ON cleaver_tests(status);
CREATE INDEX idx_cleaver_tests_token ON cleaver_tests(test_token);
CREATE INDEX idx_cleaver_tests_expires_at ON cleaver_tests(expires_at);

CREATE INDEX idx_cleaver_responses_test_id ON cleaver_responses(test_id);
CREATE INDEX idx_cleaver_scores_test_id ON cleaver_scores(test_id);
CREATE INDEX idx_cleaver_interpretations_test_id ON cleaver_interpretations(test_id);
CREATE INDEX idx_cleaver_audit_logs_test_id ON cleaver_audit_logs(test_id);
CREATE INDEX idx_cleaver_audit_logs_created_at ON cleaver_audit_logs(created_at);

-- TRIGGERS para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cleaver_tests_updated_at 
    BEFORE UPDATE ON cleaver_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCIONES auxiliares

-- Función para generar token único
CREATE OR REPLACE FUNCTION generate_cleaver_token()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN encode(
        digest(
            'cleaver_' || extract(epoch from now()) || '_' || gen_random_uuid()::text,
            'sha256'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para calcular percentiles
CREATE OR REPLACE FUNCTION calculate_disc_percentile(score INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN CASE 
        WHEN score <= -21 THEN 1
        WHEN score <= -16 THEN 1  
        WHEN score <= -15 THEN 1
        WHEN score <= -14 THEN 1
        WHEN score <= -13 THEN 1
        WHEN score <= -12 THEN 5
        WHEN score <= -11 THEN 5
        WHEN score <= -10 THEN 5
        WHEN score <= -9 THEN 10
        WHEN score <= -8 THEN 10
        WHEN score <= -7 THEN 10
        WHEN score <= -6 THEN 20
        WHEN score <= -5 THEN 20
        WHEN score <= -4 THEN 30
        WHEN score <= -3 THEN 30
        WHEN score <= -2 THEN 40
        WHEN score <= -1 THEN 40
        WHEN score = 0 THEN 50
        WHEN score = 1 THEN 60
        WHEN score = 2 THEN 60
        WHEN score = 3 THEN 70
        WHEN score = 4 THEN 70
        WHEN score = 5 THEN 80
        WHEN score = 6 THEN 80
        WHEN score = 7 THEN 90
        WHEN score = 8 THEN 90
        WHEN score = 9 THEN 95
        WHEN score = 10 THEN 95
        WHEN score = 11 THEN 99
        WHEN score >= 12 THEN 99
        ELSE 50
    END;
END;
$$ LANGUAGE plpgsql;

-- POLÍTICAS RLS (Row Level Security) para Supabase
ALTER TABLE cleaver_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaver_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaver_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaver_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaver_audit_logs ENABLE ROW LEVEL SECURITY;

-- Los reclutadores solo ven sus propios tests
CREATE POLICY "Recruiters can view their own tests" ON cleaver_tests
    FOR SELECT USING (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can create tests" ON cleaver_tests
    FOR INSERT WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update their own tests" ON cleaver_tests
    FOR UPDATE USING (recruiter_id = auth.uid());

-- Los candidatos pueden ver tests asignados a ellos (solo por token)
CREATE POLICY "Candidates can view tests by token" ON cleaver_tests
    FOR SELECT USING (TRUE); -- Se controlará por token en la aplicación

-- Políticas para respuestas
CREATE POLICY "View responses for accessible tests" ON cleaver_responses
    FOR SELECT USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Insert responses for valid tests" ON cleaver_responses
    FOR INSERT WITH CHECK (TRUE); -- Se validará por token en la aplicación

-- Políticas similares para scores e interpretaciones
CREATE POLICY "View scores for accessible tests" ON cleaver_scores
    FOR SELECT USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

CREATE POLICY "View interpretations for accessible tests" ON cleaver_interpretations
    FOR SELECT USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

-- Insertar configuración inicial del test
INSERT INTO cleaver_test_config (version, disc_mapping) VALUES 
('1.0', '{
    "1": ["I", "S", "C", "D"],
    "2": ["D", "I", "S", "C"],
    "3": ["S", "C", "D", "I"],
    "4": ["C", "D", "I", "S"],
    "5": ["D", "S", "I", "C"],
    "6": ["I", "C", "S", "D"],
    "7": ["S", "D", "C", "I"],
    "8": ["C", "I", "D", "S"],
    "9": ["I", "D", "S", "C"],
    "10": ["S", "I", "C", "D"],
    "11": ["C", "S", "D", "I"],
    "12": ["D", "C", "I", "S"],
    "13": ["S", "C", "I", "D"],
    "14": ["D", "I", "C", "S"],
    "15": ["I", "S", "D", "C"],
    "16": ["C", "D", "S", "I"],
    "17": ["D", "S", "C", "I"],
    "18": ["I", "C", "D", "S"],
    "19": ["S", "I", "C", "D"],
    "20": ["C", "D", "I", "S"],
    "21": ["I", "D", "S", "C"],
    "22": ["S", "C", "I", "D"],
    "23": ["C", "I", "S", "D"],
    "24": ["D", "S", "I", "C"]
}');

-- COMENTARIOS finales
COMMENT ON TABLE cleaver_tests IS 'Tabla principal para gestionar tests Cleaver asignados a candidatos';
COMMENT ON TABLE cleaver_responses IS 'Respuestas de candidatos a cada grupo de preguntas del test';
COMMENT ON TABLE cleaver_scores IS 'Puntuaciones DISC calculadas automáticamente';
COMMENT ON TABLE cleaver_interpretations IS 'Interpretaciones y análisis generados por el sistema';
COMMENT ON TABLE cleaver_audit_logs IS 'Log de auditoría para todas las acciones relacionadas con tests';
COMMENT ON TABLE cleaver_test_config IS 'Configuración y mapeo DISC para el test Cleaver'; 