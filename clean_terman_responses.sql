-- Script para limpiar la tabla terman_test_responses
-- Ejecutar este script en Supabase SQL Editor para limpiar respuestas de prueba

-- Eliminar todas las respuestas de tests en tiempo real
DELETE FROM terman_test_responses;

-- Resetear la secuencia del ID si es necesario (opcional)
-- ALTER SEQUENCE terman_test_responses_id_seq RESTART WITH 1;

-- Verificar que la tabla esté vacía
SELECT COUNT(*) as total_responses FROM terman_test_responses;

-- Opcional: También limpiar las tablas relacionadas si es necesario
-- DELETE FROM terman_answers;
-- DELETE FROM terman_results;

-- Mostrar información de las tablas después de la limpieza
SELECT
    'terman_test_responses' as tabla,
    COUNT(*) as registros
FROM terman_test_responses
UNION ALL
SELECT
    'terman_answers' as tabla,
    COUNT(*) as registros
FROM terman_answers
UNION ALL
SELECT
    'terman_results' as tabla,
    COUNT(*) as registros
FROM terman_results;
