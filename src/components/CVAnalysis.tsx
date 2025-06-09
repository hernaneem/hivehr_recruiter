import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Users, 
  Eye, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  User,
  Briefcase,
  Target,
  AlertTriangle,
  Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useJobs, type Job as JobsContextJob } from '../contexts/JobsContext';
import { 
  N8N_CONFIG, 
  getWebhookUrl, 
  isValidFileType, 
  isValidFileSize, 
  isValidFileName, 
  formatFileSize, 
  sanitizeFileName 
} from '../config/n8n';

// Usar las interfaces del contexto para mantener consistencia
type Job = JobsContextJob;

interface CandidateAnalysis {
  id: number;
  overall_score: number;
  match_percentage: number;
  technical_score: number;
  experience_score: number;
  education_score: number;
  strengths: string[];
  improvement_areas: string[];
  missing_skills: string[];
  exceeded_requirements: string[];
  recommendation: string;
  recommendation_reason: string;
  ai_analysis: string | object;
  criteria_scores: object;
  processed_at: string;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  cv_file_path?: string;
  cv_text?: string;
  linkedin_url?: string;
  years_experience?: string;
  availability?: string;
  salary_expectation?: string;
  motivation?: string;
  score: number;
  match_percentage: number;
  status: 'viable' | 'no_viable' | 'analyzing';
  analyzed_at: string;
  cv_filename: string;
  analysis?: CandidateAnalysis;
}

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const CVAnalysis = () => {
  const { jobs, loading: jobsLoading, error: jobsError } = useJobs();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState('');
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadResults, setUploadResults] = useState<{success: number, failed: number}>({success: 0, failed: 0});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // URL del webhook usando configuración centralizada
  const WEBHOOK_URL = getWebhookUrl('PROCESS_CV');

  // Filtrar solo trabajos activos usando useMemo para optimizar
  const activeJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'active');
  }, [jobs]);

  // Funciones para manejar notificaciones
  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove después de 3 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccessNotification = (title: string, message: string) => {
    showNotification({
      type: 'success',
      title,
      message,
      icon: CheckCircle
    });
  };

  const showErrorNotification = (title: string, message: string) => {
    showNotification({
      type: 'error',
      title,
      message,
      icon: XCircle
    });
  };

  const loadCandidates = async (jobId: string) => {
    try {
      // Obtener candidatos reales de la base de datos con JOIN correcto
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select(`
          id,
          name,
          email,
          phone,
          location,
          cv_file_path,
          cv_text,
          linkedin_url,
          years_experience,
          availability,
          salary_expectation,
          motivation,
          created_at,
          updated_at,
          candidate_analyses!inner (
            id,
            job_id,
            overall_score,
            match_percentage,
            technical_score,
            experience_score,
            education_score,
            strengths,
            improvement_areas,
            missing_skills,
            exceeded_requirements,
            recommendation,
            recommendation_reason,
            ai_analysis,
            criteria_scores,
            processed_at
          )
        `)
        .eq('candidate_analyses.job_id', jobId)
        .order('created_at', { ascending: false });

      if (candidatesError) throw candidatesError;

      // Formatear datos para el componente
      const formattedCandidates: Candidate[] = candidatesData.map(candidate => {
        const analysis = candidate.candidate_analyses?.[0]; // Tomar el análisis más reciente
        
        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          location: candidate.location,
          cv_file_path: candidate.cv_file_path,
          linkedin_url: candidate.linkedin_url,
          years_experience: candidate.years_experience,
          availability: candidate.availability,
          salary_expectation: candidate.salary_expectation,
          motivation: candidate.motivation,
          score: analysis?.overall_score || 0,
          match_percentage: analysis?.match_percentage || 0,
          status: analysis ? (analysis.overall_score >= 70 ? 'viable' : 'no_viable') : 'analyzing',
          analyzed_at: analysis?.processed_at || candidate.created_at,
          cv_filename: candidate.cv_file_path ? candidate.cv_file_path.split('/').pop() || 'CV' : 'CV',
          // Datos del análisis completo para la vista detalle
          analysis: analysis ? {
            id: analysis.id,
            overall_score: analysis.overall_score,
            match_percentage: analysis.match_percentage,
            technical_score: analysis.technical_score,
            experience_score: analysis.experience_score,
            education_score: analysis.education_score,
            strengths: analysis.strengths,
            improvement_areas: analysis.improvement_areas,
            missing_skills: analysis.missing_skills,
            exceeded_requirements: analysis.exceeded_requirements,
            recommendation: analysis.recommendation,
            recommendation_reason: analysis.recommendation_reason,
            ai_analysis: analysis.ai_analysis,
            criteria_scores: analysis.criteria_scores,
            processed_at: analysis.processed_at
          } : undefined
        };
      });
      
      setCandidates(formattedCandidates);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error cargando candidatos: ' + errorMessage);
      console.error('Error loading candidates:', err);
    }
  };

  const selectJob = (job: Job) => {
    setSelectedJob(job);
    loadCandidates(job.id.toString());
  };

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!isValidFileType(file)) {
      return `Tipo de archivo no válido: ${file.name}. Solo se permiten PDF, DOC y DOCX.`;
    }

    // Validar tamaño
    if (!isValidFileSize(file)) {
      return `Archivo muy grande: ${file.name}. Máximo ${formatFileSize(N8N_CONFIG.FILE_UPLOAD.MAX_SIZE)} permitido.`;
    }

    // Validar nombre
    if (!isValidFileName(file.name)) {
      return `Nombre muy largo: ${file.name}. Máximo ${N8N_CONFIG.FILE_UPLOAD.MAX_FILENAME_LENGTH} caracteres.`;
    }

    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedJob) return;

    // Verificar que el job existe antes de procesar
    console.log(`🔍 Verificando job_id: ${selectedJob.id}`);
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', selectedJob.id)
      .single();

    if (jobError || !jobData) {
      console.error('❌ Error: El trabajo no existe en la base de datos', jobError);
      showErrorNotification(
        'Error de Datos',
        'El trabajo seleccionado no existe en la base de datos. Por favor, recarga la página.'
      );
      return;
    }

    console.log('✅ Job verificado:', jobData.title);

    // Validar archivos antes de procesar
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setError(`Errores de validación:\n${validationErrors.join('\n')}`);
      return;
    }

    if (validFiles.length === 0) {
      setError('No hay archivos válidos para procesar');
      return;
    }

    setUploadingCV(true);
    setUploadProgress({});
    setUploadResults({success: 0, failed: 0});
    setError('');

    try {
      const totalFiles = validFiles.length;
      let successCount = 0;
      let failedCount = 0;

      console.log(`🚀 Iniciando procesamiento de ${totalFiles} CV(s) para trabajo: ${selectedJob.title}`);

      // Procesar archivos en paralelo usando configuración
      const batchSize = N8N_CONFIG.PROCESSING.BATCH_SIZE;
      for (let i = 0; i < totalFiles; i += batchSize) {
        const batch = validFiles.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (file, batchIndex) => {
            const fileIndex = i + batchIndex;
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            const sanitizedBaseName = sanitizeFileName(baseName); // Import this function
            const fileName = `${timestamp}_${fileIndex}_${sanitizedBaseName}.${fileExtension}`;
            
            try {
              console.log(`📄 Procesando: ${file.name} (${formatFileSize(file.size)})`);
              
              // 1. Subir archivo a Supabase Storage
              setUploadProgress(prev => ({...prev, [fileName]: N8N_CONFIG.UI.PROGRESS_STATES.UPLOADING}));
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('candidate-cvs')
                .upload(fileName, file, {
                  cacheControl: '3600',
                  upsert: false,
                  contentType: file.type
                });

              if (uploadError) {
                throw new Error(`Error subiendo archivo: ${uploadError.message}`);
              }

              console.log(`☁️ Archivo subido a storage: ${uploadData.path}`);
              setUploadProgress(prev => ({...prev, [fileName]: N8N_CONFIG.UI.PROGRESS_STATES.UPLOADED}));

              // Verificar que el archivo realmente existe
              const { data: fileList, error: listError } = await supabase.storage
                .from('candidate-cvs')
                .list('', { 
                  limit: 100,
                  search: fileName 
                });

              if (listError) {
                console.error('Error verificando archivo:', listError);
              } else {
                const fileExists = fileList?.some(f => f.name === fileName);
                console.log(`🔍 Verificación de archivo: ${fileName} ${fileExists ? '✅ existe' : '❌ NO existe'} en storage`);
                
                if (!fileExists) {
                  throw new Error('El archivo se subió pero no se puede verificar en storage');
                }
              }

              // Diagnóstico completo de acceso al archivo
              console.log('🔍 === DIAGNÓSTICO DE ACCESO AL ARCHIVO ===');
              
              // 1. URL pública
              const { data: publicUrlData } = supabase.storage
                .from('candidate-cvs')
                .getPublicUrl(fileName);
              console.log(`📍 URL pública: ${publicUrlData.publicUrl}`);
              
              // 2. Test de acceso público
              try {
                const publicResponse = await fetch(publicUrlData.publicUrl, { method: 'HEAD' });
                console.log(`🌐 Acceso público: ${publicResponse.status} ${publicResponse.ok ? '✅ OK' : '❌ FALLÓ'}`);
              } catch (publicError) {
                console.error('❌ Error en acceso público:', publicError);
              }
              
              // 3. URL firmada
              const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from('candidate-cvs')
                .createSignedUrl(fileName, 3600);
              
              if (!signedUrlError && signedUrlData) {
                console.log(`🔒 URL firmada: ${signedUrlData.signedUrl}`);
                
                // 4. Test de acceso firmado
                try {
                  const signedResponse = await fetch(signedUrlData.signedUrl, { method: 'HEAD' });
                  console.log(`🔐 Acceso firmado: ${signedResponse.status} ${signedResponse.ok ? '✅ OK' : '❌ FALLÓ'}`);
                } catch (signedError) {
                  console.error('❌ Error en acceso firmado:', signedError);
                }
              } else {
                console.error('❌ Error creando URL firmada:', signedUrlError);
              }
              
              console.log('🔍 === FIN DIAGNÓSTICO ===');

              // 2. Llamar al webhook de n8n para procesar el CV
              const webhookPayload = {
                job_id: selectedJob.id,
                cv_file_path: uploadData.path,
                original_filename: file.name,
                file_size: file.size,
                uploaded_at: new Date().toISOString()
              };

              console.log(`🔗 Llamando webhook para: ${file.name}`, webhookPayload);
              setUploadProgress(prev => ({...prev, [fileName]: N8N_CONFIG.UI.PROGRESS_STATES.WEBHOOK_CALLED}));

              // Log adicional para debugging
              console.log('🔍 DEBUG - URL del webhook:', WEBHOOK_URL);
              console.log('🔍 DEBUG - Headers:', {
                'Content-Type': 'application/json',
              });
              console.log('🔍 DEBUG - Payload completo:', JSON.stringify(webhookPayload, null, 2));

              const webhookResponse = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookPayload),
                signal: AbortSignal.timeout(N8N_CONFIG.PROCESSING.WEBHOOK_TIMEOUT)
              });

              console.log('🧪 Status de respuesta del test:', webhookResponse.status);
              console.log('🧪 Headers de respuesta del test:', Object.fromEntries(webhookResponse.headers.entries()));

              if (!webhookResponse.ok) {
                const errorText = await webhookResponse.text();
                console.error('🔍 DEBUG - Error response body:', errorText);
                
                // Intentar parsear como JSON para obtener más detalles
                try {
                  const errorJson = JSON.parse(errorText);
                  console.error('🔍 DEBUG - Error JSON parsed:', errorJson);
                } catch (parseError) {
                  console.error('🔍 DEBUG - Error text no es JSON válido');
                }
                
                throw new Error(`Webhook error ${webhookResponse.status}: ${errorText}`);
              }

              const webhookResult = await webhookResponse.json();
              console.log('🔍 DEBUG - Respuesta exitosa del webhook:', webhookResult);
              
              setUploadProgress(prev => ({...prev, [fileName]: N8N_CONFIG.UI.PROGRESS_STATES.COMPLETED}));
              successCount++;

              console.log(`✅ CV procesado exitosamente: ${file.name}`, {
                candidate_id: webhookResult.data?.candidate_id,
                overall_score: webhookResult.data?.overall_score,
                recommendation: webhookResult.data?.recommendation
              });
            } catch (fileError) {
              const errorMessage = fileError instanceof Error ? fileError.message : 'Error desconocido';
              console.error(`❌ Error procesando ${file.name}:`, fileError);
              setUploadProgress(prev => ({...prev, [fileName]: N8N_CONFIG.UI.PROGRESS_STATES.ERROR}));
              failedCount++;
              
              // Si falló después de subir, intentar limpiar el archivo
              if (fileName && errorMessage.includes('Webhook')) {
                try {
                  await supabase.storage.from('candidate-cvs').remove([fileName]);
                  console.log(`🧹 Archivo limpiado del storage: ${fileName}`);
                } catch (cleanupError) {
                  console.warn('Error limpiando archivo fallido:', cleanupError);
                }
              }
            }
          })
        );

        // Pequeña pausa entre batches para no sobrecargar
        if (i + batchSize < totalFiles) {
          await new Promise(resolve => setTimeout(resolve, N8N_CONFIG.PROCESSING.BATCH_DELAY));
        }
      }

      setUploadResults({success: successCount, failed: failedCount});

      // Mostrar resultado final
      if (successCount > 0) {
        console.log(`📊 Procesamiento completado: ${successCount} exitosos, ${failedCount} fallidos`);
        
        if (failedCount > 0) {
          showNotification({
            type: 'warning',
            title: 'Procesamiento Parcial',
            message: `${successCount} CV(s) procesados exitosamente, ${failedCount} fallaron. Los análisis aparecerán en la tabla en breve.`,
            icon: AlertTriangle
          });
        } else {
          showSuccessNotification(
            'CVs Procesados',
            `${successCount} CV(s) procesados exitosamente! Los análisis aparecerán en la tabla en breve.`
          );
        }
        
        // Recargar candidatos después de un breve delay para que el webhook termine
        setTimeout(() => {
          console.log('🔄 Recargando lista de candidatos...');
          loadCandidates(selectedJob.id.toString());
        }, N8N_CONFIG.PROCESSING.RELOAD_DELAY);
      } else {
        showErrorNotification(
          'Error en Procesamiento',
          `No se pudo procesar ningún CV de ${totalFiles} archivo(s). Revisa la consola para más detalles.`
        );
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error general procesando CVs: ' + errorMessage);
      console.error('Error en handleFileUpload:', err);
    } finally {
      setUploadingCV(false);
      // Limpiar input file
      event.target.value = '';
      // Limpiar progreso usando configuración
      setTimeout(() => {
        setUploadProgress({});
        setUploadResults({success: 0, failed: 0});
      }, N8N_CONFIG.UI.PROGRESS_CLEANUP_DELAY);
    }
  };

  const viewCandidateDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const getStatusConfig = (status: string, score: number): StatusConfig => {
    // Usar score para determinar configuración más precisa en el futuro
    if (status === 'viable' && score >= 80) {
      return {
        label: 'Excelente',
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: CheckCircle,
        bgColor: 'bg-green-500/10'
      };
    } else if (status === 'viable') {
      return {
        label: 'Viable',
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: CheckCircle,
        bgColor: 'bg-green-500/10'
      };
    } else if (status === 'no_viable') {
      return {
        label: 'No Viable',
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: XCircle,
        bgColor: 'bg-red-500/10'
      };
    } else {
      return {
        label: 'Analizando',
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: Clock,
        bgColor: 'bg-yellow-500/10'
      };
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Componente de notificaciones
  const NotificationContainer = () => {
    if (notifications.length === 0) return null;

    return (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => {
          const Icon = notification.icon || CheckCircle;
          
          const getNotificationStyles = (type: string) => {
            switch (type) {
              case 'success':
                return 'bg-green-500/90 border-green-400 text-white';
              case 'error':
                return 'bg-red-500/90 border-red-400 text-white';
              case 'warning':
                return 'bg-yellow-500/90 border-yellow-400 text-white';
              case 'info':
                return 'bg-blue-500/90 border-blue-400 text-white';
              default:
                return 'bg-gray-500/90 border-gray-400 text-white';
            }
          };

          return (
            <div
              key={notification.id}
              className={`
                max-w-sm p-4 rounded-lg border backdrop-blur-md shadow-lg
                transform transition-all duration-300 ease-in-out
                animate-in slide-in-from-right-full
                ${getNotificationStyles(notification.type)}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{notification.title}</p>
                  <p className="text-xs opacity-90 mt-1">{notification.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            <span className="text-white">Cargando análisis...</span>
          </div>
        </div>
      </div>
    );
  }

  // Vista detalle del candidato
  if (selectedCandidate) {
    const analysis = selectedCandidate.analysis;
    
    return (
      <div className="space-y-6">
        {/* Header con botón volver */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a candidatos</span>
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{selectedCandidate.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/70">
                  <p><strong>Email:</strong> {selectedCandidate.email}</p>
                  {selectedCandidate.phone && <p><strong>Teléfono:</strong> {selectedCandidate.phone}</p>}
                  {selectedCandidate.location && <p><strong>Ubicación:</strong> {selectedCandidate.location}</p>}
                  {selectedCandidate.years_experience && <p><strong>Experiencia:</strong> {selectedCandidate.years_experience}</p>}
                  {selectedCandidate.availability && <p><strong>Disponibilidad:</strong> {selectedCandidate.availability}</p>}
                  {selectedCandidate.salary_expectation && <p><strong>Expectativa salarial:</strong> {selectedCandidate.salary_expectation}</p>}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-white/60 text-sm">Score General</div>
              <div className="text-3xl font-bold text-white">{selectedCandidate.score}%</div>
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-sm mt-2 ${
                selectedCandidate.status === 'viable' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {selectedCandidate.status === 'viable' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>{selectedCandidate.status === 'viable' ? 'Candidato Viable' : 'No Viable'}</span>
              </div>
            </div>
          </div>
        </div>

        {analysis ? (
          <>
            {/* Scores detallados */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Target className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-xl font-bold text-white">{analysis.match_percentage || 'N/A'}%</p>
                    <p className="text-white/60 text-sm">Match Porcentaje</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-xl font-bold text-white">{analysis.technical_score || 'N/A'}%</p>
                    <p className="text-white/60 text-sm">Score Técnico</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-xl font-bold text-white">{analysis.experience_score || 'N/A'}%</p>
                    <p className="text-white/60 text-sm">Score Experiencia</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-orange-400" />
                  <div>
                    <p className="text-xl font-bold text-white">{analysis.education_score || 'N/A'}%</p>
                    <p className="text-white/60 text-sm">Score Educación</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Análisis AI */}
            {analysis.ai_analysis && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Resumen del Análisis IA</span>
                </h3>
                <div className="text-white/80 bg-white/5 rounded-lg p-4">
                  {typeof analysis.ai_analysis === 'string' 
                    ? analysis.ai_analysis 
                    : JSON.stringify(analysis.ai_analysis, null, 2)
                  }
                </div>
              </div>
            )}

            {/* Fortalezas y áreas de mejora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fortalezas */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Fortalezas</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start space-x-2 text-white/80">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Áreas de mejora */}
              {analysis.improvement_areas && analysis.improvement_areas.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <span>Áreas de Mejora</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysis.improvement_areas.map((area, index) => (
                      <li key={index} className="flex items-start space-x-2 text-white/80">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Skills faltantes y destacadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills faltantes */}
              {analysis.missing_skills && analysis.missing_skills.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <span>Skills Faltantes</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements superados */}
              {analysis.exceeded_requirements && analysis.exceeded_requirements.length > 0 && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Supera Expectativas</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.exceeded_requirements.map((requirement, index) => (
                      <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-sm">
                        {requirement}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recomendación */}
            {analysis.recommendation && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Recomendación</span>
                </h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/80 mb-2"><strong>Decisión:</strong> {analysis.recommendation}</p>
                  {analysis.recommendation_reason && (
                    <p className="text-white/70"><strong>Razón:</strong> {analysis.recommendation_reason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/70">
                <p><strong>Análisis procesado:</strong> {formatDate(analysis.processed_at)}</p>
                <p><strong>Archivo CV:</strong> {selectedCandidate.cv_filename}</p>
                {selectedCandidate.linkedin_url && (
                  <p><strong>LinkedIn:</strong> 
                    <a href={selectedCandidate.linkedin_url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-400 hover:text-blue-300 ml-1">
                      Ver perfil
                    </a>
                  </p>
                )}
                {selectedCandidate.motivation && (
                  <div className="md:col-span-2">
                    <p><strong>Motivación:</strong></p>
                    <p className="text-white/60 bg-white/5 rounded p-2 mt-1">{selectedCandidate.motivation}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
            <Clock className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Análisis en Proceso</h3>
            <p className="text-white/60">El análisis de este candidato aún está siendo procesado.</p>
          </div>
        )}
        
        {/* Contenedor de notificaciones */}
        <NotificationContainer />
      </div>
    );
  }

  if (selectedJob) {
    const viableCandidates = candidates.filter(c => c.status === 'viable').length;
    const totalCandidates = candidates.length;
    const averageScore = candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
      : 0;

    return (
      <div className="space-y-6">
        {/* Header con botón volver */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedJob(null)}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a trabajos activos</span>
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">{selectedJob.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/70">
                  {selectedJob.company && <p><strong>Empresa:</strong> {selectedJob.company}</p>}
                  {selectedJob.location && <p><strong>Ubicación:</strong> {selectedJob.location}</p>}
                  {selectedJob.experience_level && <p><strong>Experiencia:</strong> {selectedJob.experience_level}</p>}
                  {selectedJob.salary_range && <p><strong>Salario:</strong> {selectedJob.salary_range}</p>}
                </div>
              </div>
            </div>

            {/* Botón subir CVs */}
            <div className="text-right">
              <div className="flex space-x-3 mb-2">
                <input
                  type="file"
                  id="cv-upload"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingCV}
                />
                <label
                  htmlFor="cv-upload"
                  className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                    uploadingCV
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white cursor-pointer'
                  }`}
                >
                  {uploadingCV ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      <span>Procesando CVs...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Subir CVs</span>
                    </>
                  )}
                </label>
              </div>
              <p className="text-white/60 text-sm">PDF, DOC, DOCX (máx. 10MB c/u)</p>
              
              {/* Progreso de subida */}
              {uploadingCV && Object.keys(uploadProgress).length > 0 && (
                <div className="mt-4 space-y-2 max-w-sm">
                  <div className="text-white/80 text-sm font-medium">
                    Procesando {Object.keys(uploadProgress).length} archivo(s):
                  </div>
                  {Object.entries(uploadProgress).map(([fileName, progress]) => {
                    const displayName = fileName.split('_').slice(2).join('_'); // Remover timestamp y índice
                    return (
                      <div key={fileName} className="bg-white/10 rounded-lg p-2">
                        <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                          <span className="truncate max-w-[150px]" title={displayName}>
                            {displayName}
                          </span>
                          <span>
                            {progress === N8N_CONFIG.UI.PROGRESS_STATES.ERROR ? '❌' : 
                             progress === N8N_CONFIG.UI.PROGRESS_STATES.COMPLETED ? '✅' : `${progress}%`}
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              progress === N8N_CONFIG.UI.PROGRESS_STATES.ERROR
                                ? 'bg-red-400' 
                                : progress === N8N_CONFIG.UI.PROGRESS_STATES.COMPLETED
                                  ? 'bg-green-400' 
                                  : 'bg-blue-400'
                            }`}
                            style={{ width: `${progress === N8N_CONFIG.UI.PROGRESS_STATES.ERROR ? 100 : progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Resumen de resultados */}
                  {(uploadResults.success > 0 || uploadResults.failed > 0) && (
                    <div className="mt-3 p-2 bg-white/10 rounded-lg text-xs">
                      <div className="text-white/80">
                        ✅ Exitosos: {uploadResults.success} | ❌ Fallidos: {uploadResults.failed}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Skills requeridas */}
          {selectedJob.job_required_skills && selectedJob.job_required_skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-medium mb-3">Skills Requeridas ({selectedJob.job_required_skills.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.job_required_skills.map((skill, index) => (
                  <span key={index} className={`px-3 py-1 rounded-lg text-sm ${
                    skill.is_mandatory 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {skill.skill_name} 
                    {skill.is_mandatory && ' *'}
                    <span className="text-xs opacity-70"> ({skill.importance_level}/10)</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats de candidatos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{totalCandidates}</p>
                <p className="text-white/60">Candidatos Analizados</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{viableCandidates}</p>
                <p className="text-white/60">Candidatos Viables</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{averageScore}%</p>
                <p className="text-white/60">Score Promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de candidatos */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <h3 className="text-xl font-semibold text-white">Candidatos Analizados</h3>
          </div>

          {candidates.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No hay candidatos analizados</h4>
              <p className="text-white/60">Sube CVs para comenzar el análisis automático</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 text-white/80 font-medium">Candidato</th>
                    <th className="text-left p-4 text-white/80 font-medium">Email</th>
                    <th className="text-left p-4 text-white/80 font-medium">Score</th>
                    <th className="text-left p-4 text-white/80 font-medium">Estado</th>
                    <th className="text-left p-4 text-white/80 font-medium">Fecha Análisis</th>
                    <th className="text-left p-4 text-white/80 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(candidate => {
                    const statusConfig = getStatusConfig(candidate.status, candidate.score);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={candidate.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-medium">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-white/60" />
                            <span className="text-white/80">{candidate.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-white/20 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${candidate.score >= 70 ? 'bg-green-400' : candidate.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                style={{ width: `${candidate.score}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-medium">{candidate.score}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded border text-xs ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white/70 text-sm">
                          {formatDate(candidate.analyzed_at)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => viewCandidateDetail(candidate)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all" 
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-all" title="Descargar CV">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Contenedor de notificaciones */}
        <NotificationContainer />
      </div>
    );
  }

  // Vista principal - Lista de trabajos activos
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Análisis de CVs</h2>
            <p className="text-white/70">Sube y analiza candidatos para tus trabajos activos</p>
          </div>
        </div>

        {(error || jobsError) && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error || jobsError}</span>
          </div>
        )}
      </div>

      {/* Lista de trabajos activos */}
      {activeJobs.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
          <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-10 w-10 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No hay trabajos activos</h3>
          <p className="text-white/60 mb-6">Activa algunos trabajos para poder analizar CVs</p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all">
            Ir a Mis Trabajos
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Trabajos Activos ({activeJobs.length})
            </h3>
            <p className="text-white/60 mb-6">Selecciona un trabajo para subir y analizar CVs</p>
          </div>

          {activeJobs.map(job => (
            <div key={job.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                 onClick={() => selectJob(job)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">{job.title}</h4>
                    <div className="flex items-center space-x-4 text-white/60 text-sm">
                      {job.company && <span>{job.company}</span>}
                      {job.location && <span>• {job.location}</span>}
                      {job.job_required_skills && (
                        <span>• {job.job_required_skills.length} skills requeridas</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-white/60 text-sm">Candidatos analizados</div>
                    <div className="text-xl font-bold text-white">{job.candidates_count || 0}</div>
                  </div>
                  <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Analizar CVs</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Contenedor de notificaciones */}
      <NotificationContainer />
    </div>
  );
};

export default CVAnalysis;