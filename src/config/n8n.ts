// Configuración para integración con n8n workflows
export const N8N_CONFIG = {
  // URL base del webhook de n8n (PRODUCCIÓN)
  WEBHOOK_BASE_URL: 'https://hernaneem.app.n8n.cloud/webhook',
  
  // URLs alternativas para testing
  ALTERNATIVE_WEBHOOKS: [
    'https://hernaneem.app.n8n.cloud/webhook/recruit-ai',
    'https://hernaneem.app.n8n.cloud/webhook-test/recruit-ai',
    'https://hernaneem.app.n8n.cloud/webhook/process-cv',
    'https://hernaneem.app.n8n.cloud/webhook-test/process-cv',
    'https://hernaneem.app.n8n.cloud/webhook/cv-analysis',
    'https://hernaneem.app.n8n.cloud/webhook-test/cv-analysis'
  ],
  
  // Endpoints específicos
  ENDPOINTS: {
    PROCESS_CV: '/process-cv',
  },
  
  // Configuraciones de archivos
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
    MAX_FILENAME_LENGTH: 100,
  },
  
  // Configuraciones de procesamiento
  PROCESSING: {
    BATCH_SIZE: 3, // Archivos procesados en paralelo
    BATCH_DELAY: 1500, // ms entre batches
    WEBHOOK_TIMEOUT: 120000, // 2 minutos
    RELOAD_DELAY: 4000, // ms para recargar candidatos después del procesamiento
  },
  
  // Configuraciones de UI
  UI: {
    PROGRESS_CLEANUP_DELAY: 8000, // ms para limpiar progreso
    PROGRESS_STATES: {
      UPLOADING: 10,
      UPLOADED: 40,
      WEBHOOK_CALLED: 60,
      COMPLETED: 100,
      ERROR: -1,
    }
  }
} as const;

// Helper para construir URLs completas
export const getWebhookUrl = (endpoint: keyof typeof N8N_CONFIG.ENDPOINTS): string => {
  return `${N8N_CONFIG.WEBHOOK_BASE_URL}${N8N_CONFIG.ENDPOINTS[endpoint]}`;
};

// Helper para validar tipos de archivo
export const isValidFileType = (file: File): boolean => {
  return N8N_CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any);
};

// Helper para validar tamaño de archivo
export const isValidFileSize = (file: File): boolean => {
  return file.size <= N8N_CONFIG.FILE_UPLOAD.MAX_SIZE;
};

// Helper para validar nombre de archivo
export const isValidFileName = (fileName: string): boolean => {
  return fileName.length <= N8N_CONFIG.FILE_UPLOAD.MAX_FILENAME_LENGTH;
};

// Helper para formatear tamaño de archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper para limpiar nombres de archivo
export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}; 