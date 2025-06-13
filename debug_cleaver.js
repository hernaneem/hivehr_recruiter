// DEBUG SCRIPT PARA TEST CLEAVER
// Ejecutar en la consola del navegador o Node.js

console.log('🔍 DEBUGGING TEST CLEAVER - CÁLCULOS DISC');
console.log('='.repeat(50));

// Mapeo DISC exacto del código actual
const discMapping = {
  1: ["I", "S", "C", "D"],
  2: ["D", "I", "S", "C"],
  3: ["S", "C", "D", "I"],
  4: ["C", "D", "I", "S"],
  5: ["D", "S", "I", "C"],
  6: ["I", "C", "S", "D"],
  7: ["S", "D", "C", "I"],
  8: ["C", "I", "D", "S"],
  9: ["I", "D", "S", "C"],
  10: ["S", "I", "C", "D"],
  11: ["C", "S", "D", "I"],
  12: ["D", "C", "I", "S"],
  13: ["S", "C", "I", "D"],
  14: ["D", "I", "C", "S"],
  15: ["I", "S", "D", "C"],
  16: ["C", "D", "S", "I"],
  17: ["D", "S", "C", "I"],
  18: ["I", "C", "D", "S"],
  19: ["S", "I", "C", "D"],
  20: ["C", "D", "I", "S"],
  21: ["I", "D", "S", "C"],
  22: ["S", "C", "I", "D"],
  23: ["C", "I", "S", "D"],
  24: ["D", "S", "I", "C"]
};

// Función de cálculo de percentiles
const calculatePercentile = (score) => {
  if (score <= -21) return 1;
  if (score <= -12) return 5;
  if (score <= -9) return 10;
  if (score <= -6) return 20;
  if (score <= -4) return 30;
  if (score <= -2) return 40;
  if (score === 0) return 50;
  if (score <= 2) return 60;
  if (score <= 4) return 70;
  if (score <= 6) return 80;
  if (score <= 8) return 90;
  if (score <= 10) return 95;
  return 99;
};

// Función para debuggear respuestas específicas
function debugCleaverTest(responses) {
  console.log('\n📊 ANÁLISIS DE RESPUESTAS:');
  console.log('Respuestas recibidas:', responses.length);
  
  const scores = {
    d_most: 0, d_least: 0, d_total: 0,
    i_most: 0, i_least: 0, i_total: 0,
    s_most: 0, s_least: 0, s_total: 0,
    c_most: 0, c_least: 0, c_total: 0
  };

  console.log('\n🔍 PROCESANDO RESPUESTA POR RESPUESTA:');
  
  responses.forEach((response, index) => {
    const factors = discMapping[response.group_number];
    
    if (!factors) {
      console.log(`❌ Grupo ${response.group_number} no encontrado en mapeo`);
      return;
    }
    
    const mostFactor = factors[response.most_selected - 1];
    const leastFactor = factors[response.least_selected - 1];
    
    console.log(`\n--- Respuesta ${index + 1} ---`);
    console.log(`Grupo ${response.group_number}: [${factors.join(', ')}]`);
    console.log(`Más seleccionado: posición ${response.most_selected} = ${mostFactor}`);
    console.log(`Menos seleccionado: posición ${response.least_selected} = ${leastFactor}`);
    
    // Incrementar puntuaciones "Más"
    if (mostFactor === 'D') {
      scores.d_most++;
      console.log(`  ✅ D_most: ${scores.d_most}`);
    } else if (mostFactor === 'I') {
      scores.i_most++;
      console.log(`  ✅ I_most: ${scores.i_most}`);
    } else if (mostFactor === 'S') {
      scores.s_most++;
      console.log(`  ✅ S_most: ${scores.s_most}`);
    } else if (mostFactor === 'C') {
      scores.c_most++;
      console.log(`  ✅ C_most: ${scores.c_most}`);
    }

    // Incrementar puntuaciones "Menos"
    if (leastFactor === 'D') {
      scores.d_least++;
      console.log(`  ❌ D_least: ${scores.d_least}`);
    } else if (leastFactor === 'I') {
      scores.i_least++;
      console.log(`  ❌ I_least: ${scores.i_least}`);
    } else if (leastFactor === 'S') {
      scores.s_least++;
      console.log(`  ❌ S_least: ${scores.s_least}`);
    } else if (leastFactor === 'C') {
      scores.c_least++;
      console.log(`  ❌ C_least: ${scores.c_least}`);
    }
  });

  // Calcular totales
  scores.d_total = scores.d_most - scores.d_least;
  scores.i_total = scores.i_most - scores.i_least;
  scores.s_total = scores.s_most - scores.s_least;
  scores.c_total = scores.c_most - scores.c_least;

  console.log('\n📈 PUNTUACIONES FINALES:');
  console.log('='.repeat(30));
  console.log(`D: ${scores.d_most} (más) - ${scores.d_least} (menos) = ${scores.d_total} (total)`);
  console.log(`I: ${scores.i_most} (más) - ${scores.i_least} (menos) = ${scores.i_total} (total)`);
  console.log(`S: ${scores.s_most} (más) - ${scores.s_least} (menos) = ${scores.s_total} (total)`);
  console.log(`C: ${scores.c_most} (más) - ${scores.c_least} (menos) = ${scores.c_total} (total)`);

  // Calcular percentiles
  const percentiles = {
    d_percentile: calculatePercentile(scores.d_total),
    i_percentile: calculatePercentile(scores.i_total),
    s_percentile: calculatePercentile(scores.s_total),
    c_percentile: calculatePercentile(scores.c_total)
  };

  console.log('\n📊 PERCENTILES:');
  console.log('='.repeat(30));
  console.log(`D: ${scores.d_total} → ${percentiles.d_percentile}%`);
  console.log(`I: ${scores.i_total} → ${percentiles.i_percentile}%`);
  console.log(`S: ${scores.s_total} → ${percentiles.s_percentile}%`);
  console.log(`C: ${scores.c_total} → ${percentiles.c_percentile}%`);

  return { scores, percentiles };
}

// Función para verificar mapeo DISC
function verifyDISCMapping() {
  console.log('\n🔍 VERIFICANDO MAPEO DISC:');
  console.log('='.repeat(30));
  
  for (let group = 1; group <= 24; group++) {
    const factors = discMapping[group];
    console.log(`Grupo ${group.toString().padStart(2)}: [${factors.join(', ')}]`);
  }
  
  // Verificar que todos los grupos tengan exactamente 4 factores
  const allValid = Object.values(discMapping).every(factors => 
    factors.length === 4 && 
    factors.every(f => ['D', 'I', 'S', 'C'].includes(f))
  );
  
  console.log(`\n✅ Mapeo válido: ${allValid}`);
  return allValid;
}

// Función para probar con datos de ejemplo
function testWithSampleData() {
  console.log('\n🧪 PRUEBA CON DATOS DE EJEMPLO:');
  console.log('='.repeat(30));
  
  // Ejemplo: todas las respuestas favorecen D
  const sampleResponses = [
    { group_number: 1, most_selected: 4, least_selected: 1 }, // D más, I menos
    { group_number: 2, most_selected: 1, least_selected: 2 }, // D más, I menos
    { group_number: 3, most_selected: 3, least_selected: 1 }, // D más, S menos
  ];
  
  console.log('Respuestas de ejemplo (favoreciendo D):');
  sampleResponses.forEach((resp, i) => {
    console.log(`  ${i+1}. Grupo ${resp.group_number}: más=${resp.most_selected}, menos=${resp.least_selected}`);
  });
  
  return debugCleaverTest(sampleResponses);
}

// Exportar funciones para uso
if (typeof window !== 'undefined') {
  window.debugCleaverTest = debugCleaverTest;
  window.verifyDISCMapping = verifyDISCMapping;
  window.testWithSampleData = testWithSampleData;
}

// Ejecutar verificaciones automáticas
console.log('\n🚀 EJECUTANDO VERIFICACIONES AUTOMÁTICAS:');
verifyDISCMapping();
testWithSampleData();

console.log('\n📝 INSTRUCCIONES:');
console.log('1. Para debuggear un test específico: debugCleaverTest(responses)');
console.log('2. Para verificar mapeo: verifyDISCMapping()');
console.log('3. Para prueba de ejemplo: testWithSampleData()'); 