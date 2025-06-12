-- Script para limpiar tests de MOSS con tokens problemáticos
DELETE FROM moss_tests WHERE test_token LIKE '%=%' OR test_token LIKE '%/%' OR test_token LIKE '%+%';

-- También limpiar audit logs relacionados
DELETE FROM moss_audit_logs WHERE test_id NOT IN (SELECT id FROM moss_tests);

-- Verificar que se limpiaron
SELECT COUNT(*) as remaining_tests FROM moss_tests; 