-- ACTUALIZACIÓN PARA CORREGIR CÁLCULOS MOSS
-- Ejecutar en Supabase para arreglar los porcentajes incorrectos

-- Función mejorada que calcula correctamente los porcentajes MOSS
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
    
    -- Definir las áreas y sus preguntas
    v_hs_questions INTEGER[] := ARRAY[2, 3, 16, 18, 24, 30];
    v_cdrh_questions INTEGER[] := ARRAY[4, 6, 20, 23, 29];
    v_cepi_questions INTEGER[] := ARRAY[7, 9, 12, 14, 19, 21, 26, 27];
    v_heri_questions INTEGER[] := ARRAY[1, 10, 11, 13, 25];
    v_sctri_questions INTEGER[] := ARRAY[5, 8, 15, 17, 22, 28];
    
    -- Respuestas correctas
    v_answer_key JSONB := '{
        "1": "c", "2": "b", "3": "d", "4": "b", "5": "b",
        "6": "b", "7": "b", "8": "b", "9": "c", "10": "c",
        "11": "a", "12": "c", "13": "d", "14": "d", "15": "d",
        "16": "d", "17": "b", "18": "d", "19": "c", "20": "b",
        "21": "a", "22": "a", "23": "a", "24": "d", "25": "b",
        "26": "c", "27": "a", "28": "c", "29": "a", "30": "d"
    }'::JSONB;
    
    -- Variables para calcular puntuaciones
    v_hs_score INTEGER := 0;
    v_cdrh_score INTEGER := 0;
    v_cepi_score INTEGER := 0;
    v_heri_score INTEGER := 0;
    v_sctri_score INTEGER := 0;
    
    v_hs_percentage INTEGER;
    v_cdrh_percentage INTEGER;
    v_cepi_percentage INTEGER;
    v_heri_percentage INTEGER;
    v_sctri_percentage INTEGER;
    v_total_percentage INTEGER;
    
    v_hs_level TEXT;
    v_cdrh_level TEXT;
    v_cepi_level TEXT;
    v_heri_level TEXT;
    v_sctri_level TEXT;
    
    -- Función para determinar nivel
    v_level_function TEXT := '
        CASE 
            WHEN percentage >= 83 THEN ''Superior''
            WHEN percentage >= 64 THEN ''Medio Superior''
            WHEN percentage >= 42 THEN ''Medio''
            WHEN percentage >= 27 THEN ''Medio Inferior''
            WHEN percentage >= 7 THEN ''Inferior''
            ELSE ''Deficiente''
        END
    ';
    
    v_question_id INTEGER;
    v_user_answer TEXT;
    v_correct_answer TEXT;
BEGIN
    -- Calcular duración
    v_duration_minutes := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;
    
    -- Calcular puntuaciones por área basándose en las respuestas reales
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_question_id := (v_answer->>'questionId')::INTEGER;
        v_user_answer := v_answer->>'answer';
        v_correct_answer := v_answer_key->>v_question_id::TEXT;
        
        -- Solo contar si la respuesta es correcta
        IF v_user_answer = v_correct_answer THEN
            -- HS: Habilidad en Supervisión
            IF v_question_id = ANY(v_hs_questions) THEN
                v_hs_score := v_hs_score + 1;
            END IF;
            
            -- CDRH: Capacidad de Decisiones en RR.HH.
            IF v_question_id = ANY(v_cdrh_questions) THEN
                v_cdrh_score := v_cdrh_score + 1;
            END IF;
            
            -- CEPI: Capacidad de Evaluación de Problemas Interpersonales
            IF v_question_id = ANY(v_cepi_questions) THEN
                v_cepi_score := v_cepi_score + 1;
            END IF;
            
            -- HERI: Habilidad para Establecer Relaciones Interpersonales
            IF v_question_id = ANY(v_heri_questions) THEN
                v_heri_score := v_heri_score + 1;
            END IF;
            
            -- SCTRI: Sentido Común y Tacto en Relaciones Interpersonales
            IF v_question_id = ANY(v_sctri_questions) THEN
                v_sctri_score := v_sctri_score + 1;
            END IF;
        END IF;
    END LOOP;
    
    -- Calcular porcentajes
    v_hs_percentage := ROUND((v_hs_score::DECIMAL / array_length(v_hs_questions, 1)) * 100);
    v_cdrh_percentage := ROUND((v_cdrh_score::DECIMAL / array_length(v_cdrh_questions, 1)) * 100);
    v_cepi_percentage := ROUND((v_cepi_score::DECIMAL / array_length(v_cepi_questions, 1)) * 100);
    v_heri_percentage := ROUND((v_heri_score::DECIMAL / array_length(v_heri_questions, 1)) * 100);
    v_sctri_percentage := ROUND((v_sctri_score::DECIMAL / array_length(v_sctri_questions, 1)) * 100);
    
    -- Calcular porcentaje total (promedio de todas las áreas)
    v_total_percentage := ROUND((v_hs_percentage + v_cdrh_percentage + v_cepi_percentage + v_heri_percentage + v_sctri_percentage) / 5.0);
    
    -- Determinar niveles
    v_hs_level := CASE 
        WHEN v_hs_percentage >= 83 THEN 'Superior'
        WHEN v_hs_percentage >= 64 THEN 'Medio Superior'
        WHEN v_hs_percentage >= 42 THEN 'Medio'
        WHEN v_hs_percentage >= 27 THEN 'Medio Inferior'
        WHEN v_hs_percentage >= 7 THEN 'Inferior'
        ELSE 'Deficiente'
    END;
    
    v_cdrh_level := CASE 
        WHEN v_cdrh_percentage >= 83 THEN 'Superior'
        WHEN v_cdrh_percentage >= 64 THEN 'Medio Superior'
        WHEN v_cdrh_percentage >= 42 THEN 'Medio'
        WHEN v_cdrh_percentage >= 27 THEN 'Medio Inferior'
        WHEN v_cdrh_percentage >= 7 THEN 'Inferior'
        ELSE 'Deficiente'
    END;
    
    v_cepi_level := CASE 
        WHEN v_cepi_percentage >= 83 THEN 'Superior'
        WHEN v_cepi_percentage >= 64 THEN 'Medio Superior'
        WHEN v_cepi_percentage >= 42 THEN 'Medio'
        WHEN v_cepi_percentage >= 27 THEN 'Medio Inferior'
        WHEN v_cepi_percentage >= 7 THEN 'Inferior'
        ELSE 'Deficiente'
    END;
    
    v_heri_level := CASE 
        WHEN v_heri_percentage >= 83 THEN 'Superior'
        WHEN v_heri_percentage >= 64 THEN 'Medio Superior'
        WHEN v_heri_percentage >= 42 THEN 'Medio'
        WHEN v_heri_percentage >= 27 THEN 'Medio Inferior'
        WHEN v_heri_percentage >= 7 THEN 'Inferior'
        ELSE 'Deficiente'
    END;
    
    v_sctri_level := CASE 
        WHEN v_sctri_percentage >= 83 THEN 'Superior'
        WHEN v_sctri_percentage >= 64 THEN 'Medio Superior'
        WHEN v_sctri_percentage >= 42 THEN 'Medio'
        WHEN v_sctri_percentage >= 27 THEN 'Medio Inferior'
        WHEN v_sctri_percentage >= 7 THEN 'Inferior'
        ELSE 'Deficiente'
    END;
    
    -- Actualizar información del test con los cálculos correctos
    UPDATE moss_tests SET
        started_at = p_start_time,
        completed_at = p_end_time,
        time_spent_minutes = v_duration_minutes,
        status = 'completed',
        -- Área HS (Habilidad en Supervisión)
        hs_score = v_hs_score,
        hs_percentage = v_hs_percentage,
        hs_level = v_hs_level,
        -- Área CDRH (Capacidad de Decisiones en RR.HH.)
        cdrh_score = v_cdrh_score,
        cdrh_percentage = v_cdrh_percentage,
        cdrh_level = v_cdrh_level,
        -- Área CEPI (Capacidad de Evaluación de Problemas Interpersonales)
        cepi_score = v_cepi_score,
        cepi_percentage = v_cepi_percentage,
        cepi_level = v_cepi_level,
        -- Área HERI (Habilidad para Establecer Relaciones Interpersonales)
        heri_score = v_heri_score,
        heri_percentage = v_heri_percentage,
        heri_level = v_heri_level,
        -- Área SCTRI (Sentido Común y Tacto en Relaciones Interpersonales)
        sctri_score = v_sctri_score,
        sctri_percentage = v_sctri_percentage,
        sctri_level = v_sctri_level,
        -- Totales
        total_score = v_hs_score + v_cdrh_score + v_cepi_score + v_heri_score + v_sctri_score,
        total_percentage = v_total_percentage,
        updated_at = NOW()
    WHERE id = p_test_id;
    
    -- Limpiar respuestas anteriores
    DELETE FROM moss_test_answers WHERE test_id = p_test_id;
    
    -- Guardar respuestas individuales con información de corrección
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        v_question_id := (v_answer->>'questionId')::INTEGER;
        v_user_answer := v_answer->>'answer';
        v_correct_answer := v_answer_key->>v_question_id::TEXT;
        
        INSERT INTO moss_test_answers (test_id, question_id, selected_answer, is_correct)
        VALUES (
            p_test_id,
            v_question_id,
            v_user_answer,
            v_user_answer = v_correct_answer
        );
    END LOOP;
    
    -- Registrar en audit log
    INSERT INTO moss_audit_logs (test_id, user_id, action, details)
    VALUES (p_test_id, auth.uid(), 'test_completed', jsonb_build_object(
        'duration_minutes', v_duration_minutes,
        'total_score', v_hs_score + v_cdrh_score + v_cepi_score + v_heri_score + v_sctri_score,
        'total_percentage', v_total_percentage,
        'area_scores', jsonb_build_object(
            'hs', jsonb_build_object('score', v_hs_score, 'percentage', v_hs_percentage, 'level', v_hs_level),
            'cdrh', jsonb_build_object('score', v_cdrh_score, 'percentage', v_cdrh_percentage, 'level', v_cdrh_level),
            'cepi', jsonb_build_object('score', v_cepi_score, 'percentage', v_cepi_percentage, 'level', v_cepi_level),
            'heri', jsonb_build_object('score', v_heri_score, 'percentage', v_heri_percentage, 'level', v_heri_level),
            'sctri', jsonb_build_object('score', v_sctri_score, 'percentage', v_sctri_percentage, 'level', v_sctri_level)
        )
    ));
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 