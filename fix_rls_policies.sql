-- Agregar políticas RLS faltantes para cleaver_scores, cleaver_interpretations y cleaver_audit_logs

-- Políticas para cleaver_scores
CREATE POLICY "Insert scores for valid tests" ON cleaver_scores
    FOR INSERT WITH CHECK (TRUE); -- Se validará por la lógica de la aplicación

CREATE POLICY "Update scores for accessible tests" ON cleaver_scores
    FOR UPDATE USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Delete scores for accessible tests" ON cleaver_scores
    FOR DELETE USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

-- Políticas para cleaver_interpretations
CREATE POLICY "Insert interpretations for valid tests" ON cleaver_interpretations
    FOR INSERT WITH CHECK (TRUE); -- Se validará por la lógica de la aplicación

CREATE POLICY "Update interpretations for accessible tests" ON cleaver_interpretations
    FOR UPDATE USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Delete interpretations for accessible tests" ON cleaver_interpretations
    FOR DELETE USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

-- Políticas para cleaver_responses (agregar UPDATE y DELETE que faltan)
CREATE POLICY "Update responses for valid tests" ON cleaver_responses
    FOR UPDATE USING (TRUE); -- Se validará por la lógica de la aplicación

CREATE POLICY "Delete responses for valid tests" ON cleaver_responses
    FOR DELETE USING (TRUE); -- Se validará por la lógica de la aplicación

-- Políticas para cleaver_audit_logs
CREATE POLICY "View audit logs for accessible tests" ON cleaver_audit_logs
    FOR SELECT USING (
        test_id IN (
            SELECT id FROM cleaver_tests 
            WHERE recruiter_id = auth.uid()
        )
    );

CREATE POLICY "Insert audit logs" ON cleaver_audit_logs
    FOR INSERT WITH CHECK (TRUE); -- Los logs se pueden insertar libremente

-- Comentario sobre las políticas
COMMENT ON POLICY "Insert scores for valid tests" ON cleaver_scores IS 
'Permite insertar scores - la validación se hace a nivel de aplicación';

COMMENT ON POLICY "Insert interpretations for valid tests" ON cleaver_interpretations IS 
'Permite insertar interpretaciones - la validación se hace a nivel de aplicación';

COMMENT ON POLICY "Insert audit logs" ON cleaver_audit_logs IS 
'Permite insertar logs de auditoría sin restricciones adicionales'; 