import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { useJobs, type Job, type JobSkill } from '../contexts/JobsContext';

const JobsList = () => {
  const { 
    jobs, 
    loading, 
    error: globalError, 
    deleteJob: deleteJobFromContext, 
    toggleJobStatus: toggleJobStatusFromContext, 
    updateJob 
  } = useJobs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estados para modales
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showEditJob, setShowEditJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Estados para edición
  const [editJobData, setEditJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    company: '',
    location: '',
    salary_range: '',
    experience_level: '',
    job_type: 'full-time',
    status: 'draft'
  });
  const [editSkills, setEditSkills] = useState<(JobSkill & { id: number })[]>([]);

  // Estados para agregar nuevas skills en edición
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    skill_category: '',
    importance_level: 3,
    min_years: 1,
    is_mandatory: false
  });

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este trabajo?')) return;

    try {
      await deleteJobFromContext(jobId);
    } catch (err) {
      console.error('Error eliminando trabajo:', err);
    }
  };

  const handleToggleJobStatus = async (job: Job) => {
    try {
      await toggleJobStatusFromContext(job.id);
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  // Funciones para modales
  const viewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const editJob = (job: Job) => {
    setSelectedJob(job);
    setEditJobData({
      title: job.title,
      description: job.description || '',
      requirements: job.requirements || '',
      company: job.company || '',
      location: job.location || '',
      salary_range: job.salary_range || '',
      experience_level: job.experience_level || '',
      job_type: job.job_type,
      status: job.status
    });
    setEditSkills(job.job_required_skills?.map((skill, index) => ({ ...skill, id: index })) || []);
    
    // Reset formulario de nueva skill
    setShowAddSkill(false);
    setNewSkill({
      skill_name: '',
      skill_category: '',
      importance_level: 3,
      min_years: 1,
      is_mandatory: false
    });
    
    setShowEditJob(true);
    setEditError('');
    setEditSuccess('');
  };

  const handleEditJobDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditJobData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const removeEditSkill = (skillId: number) => {
    setEditSkills(prev => prev.filter(skill => skill.id !== skillId));
  };

  // Funciones para agregar nuevas skills en edición
  const handleNewSkillChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              (name === 'importance_level' || name === 'min_years') ? parseInt(value) : value
    }));
  };

  const addNewSkill = () => {
    if (!newSkill.skill_name.trim()) return;

    const skillWithId = {
      ...newSkill,
      id: Date.now() // ID temporal único
    };

    setEditSkills(prev => [...prev, skillWithId]);
    
    // Reset formulario
    setNewSkill({
      skill_name: '',
      skill_category: '',
      importance_level: 3,
      min_years: 1,
      is_mandatory: false
    });
    setShowAddSkill(false);
  };

  const cancelAddSkill = () => {
    setNewSkill({
      skill_name: '',
      skill_category: '',
      importance_level: 3,
      min_years: 1,
      is_mandatory: false
    });
    setShowAddSkill(false);
  };

  const saveEditJob = async () => {
    if (!selectedJob) return;

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      // Preparar skills sin el id temporal
      const skillsToSave = editSkills.map(skill => ({
        skill_name: skill.skill_name,
        skill_category: skill.skill_category,
        importance_level: skill.importance_level,
        min_years: skill.min_years,
        is_mandatory: skill.is_mandatory
      }));

      await updateJob(selectedJob.id, editJobData, skillsToSave);

      setEditSuccess('¡Trabajo actualizado exitosamente!');
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        setShowEditJob(false);
        setEditSuccess('');
      }, 1500);

    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Activo',
          color: 'bg-green-500/20 text-green-300 border-green-500/30',
          icon: CheckCircle
        };
      case 'draft':
        return {
          label: 'Borrador',
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
          icon: Clock
        };
      case 'paused':
        return {
          label: 'Pausado',
          color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          icon: AlertCircle
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
          icon: Clock
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 años)' },
    { value: 'mid', label: 'Mid Level (2-5 años)' },
    { value: 'senior', label: 'Senior (5-8 años)' },
    { value: 'lead', label: 'Lead/Principal (8+ años)' }
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Medio Tiempo' },
    { value: 'contract', label: 'Contrato' },
    { value: 'internship', label: 'Prácticas' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            <span className="text-white">Cargando trabajos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Mis Trabajos</h2>
              <p className="text-white/70">Gestiona tus oportunidades laborales</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{jobs.length}</div>
            <div className="text-white/60 text-sm">Trabajos Totales</div>
          </div>
        </div>

        {/* Error Message */}
        {(globalError || editError) && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{globalError || editError}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por título, empresa o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none min-w-[150px]"
            >
              <option value="all" className="bg-slate-800">Todos los estados</option>
              <option value="active" className="bg-slate-800">Activos</option>
              <option value="draft" className="bg-slate-800">Borradores</option>
              <option value="paused" className="bg-slate-800">Pausados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
          <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-10 w-10 text-white/40" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No se encontraron trabajos' : 'No hay trabajos creados'}
          </h3>
          <p className="text-white/60 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta cambiar los filtros de búsqueda' 
              : '¡Crea tu primer trabajo para empezar a encontrar candidatos increíbles!'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2 mx-auto">
              <Plus className="h-5 w-5" />
              <span>Crear Primer Trabajo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map(job => {
            const statusConfig = getStatusConfig(job.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={job.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white truncate">{job.title}</h3>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded border text-xs ${statusConfig.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70 mb-4">
                          {job.company && (
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{job.company}</span>
                            </div>
                          )}
                          
                          {job.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          
                          {job.salary_range && (
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salary_range}</span>
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {job.job_required_skills && job.job_required_skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Tag className="h-4 w-4 text-white/60" />
                              <span className="text-white/60 text-sm">Skills requeridas ({job.job_required_skills.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {job.job_required_skills.slice(0, 5).map((skill: JobSkill, index: number) => (
                                <span key={index} className={`px-2 py-1 rounded text-xs ${
                                  skill.is_mandatory 
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                }`}>
                                  {skill.skill_name}
                                </span>
                              ))}
                              {job.job_required_skills.length > 5 && (
                                <span className="px-2 py-1 rounded text-xs bg-white/10 text-white/60">
                                  +{job.job_required_skills.length - 5} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-white/50">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Creado {formatDate(job.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{job.candidates_count || 0} candidatos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleJobStatus(job)}
                      className={`p-2 rounded-lg transition-all ${
                        job.status === 'active' 
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300' 
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                      }`}
                      title={job.status === 'active' ? 'Pausar trabajo' : 'Activar trabajo'}
                    >
                      {job.status === 'active' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    
                    <button 
                      onClick={() => viewJobDetails(job)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all" 
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button 
                      onClick={() => editJob(job)}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all" 
                      title="Editar"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all" 
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalles del Trabajo */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowJobDetails(false)} />
          
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{selectedJob.title}</h2>
                    <p className="text-white/70">Detalles completos del trabajo</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Contenido */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Información Básica</h3>
                    <div className="space-y-3">
                      {selectedJob.company && (
                        <div className="flex items-center space-x-2 text-white/80">
                          <Users className="h-4 w-4" />
                          <span>Empresa: {selectedJob.company}</span>
                        </div>
                      )}
                      {selectedJob.location && (
                        <div className="flex items-center space-x-2 text-white/80">
                          <MapPin className="h-4 w-4" />
                          <span>Ubicación: {selectedJob.location}</span>
                        </div>
                      )}
                      {selectedJob.salary_range && (
                        <div className="flex items-center space-x-2 text-white/80">
                          <DollarSign className="h-4 w-4" />
                          <span>Salario: {selectedJob.salary_range}</span>
                        </div>
                      )}
                      {selectedJob.experience_level && (
                        <div className="flex items-center space-x-2 text-white/80">
                          <Clock className="h-4 w-4" />
                          <span>Experiencia: {experienceLevels.find(l => l.value === selectedJob.experience_level)?.label || selectedJob.experience_level}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2 text-white/80">
                        <Briefcase className="h-4 w-4" />
                        <span>Tipo: {jobTypes.find(t => t.value === selectedJob.job_type)?.label || selectedJob.job_type}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/80">
                        <Calendar className="h-4 w-4" />
                        <span>Creado: {formatDate(selectedJob.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedJob.description && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Descripción</h4>
                      <p className="text-white/70 whitespace-pre-wrap">{selectedJob.description}</p>
                    </div>
                  )}

                  {selectedJob.requirements && (
                    <div>
                      <h4 className="text-white font-medium mb-2">Requisitos</h4>
                      <p className="text-white/70 whitespace-pre-wrap">{selectedJob.requirements}</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Skills Requeridas</h3>
                  {selectedJob.job_required_skills && selectedJob.job_required_skills.length > 0 ? (
                    <div className="space-y-3">
                      {selectedJob.job_required_skills.map((skill, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{skill.skill_name}</span>
                            {skill.is_mandatory && (
                              <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                                Obligatoria
                              </span>
                            )}
                          </div>
                          <div className="text-white/60 text-sm space-y-1">
                            {skill.skill_category && <div>Categoría: {skill.skill_category}</div>}
                            <div>Importancia: {skill.importance_level}/5</div>
                            <div>Experiencia mínima: {skill.min_years} años</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60">No hay skills especificadas para este trabajo.</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowJobDetails(false);
                    editJob(selectedJob);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transition-all flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición del Trabajo */}
      {showEditJob && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditJob(false)} />
          
          <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                    <Edit3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Editar Trabajo</h2>
                    <p className="text-white/70">Modifica la información del trabajo</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowEditJob(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Messages */}
              {editError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{editError}</span>
                </div>
              )}
              
              {editSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {/* Formulario */}
              <div className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Título del Puesto *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editJobData.title}
                        onChange={handleEditJobDataChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={editJobData.company}
                        onChange={handleEditJobDataChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editJobData.location}
                        onChange={handleEditJobDataChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Rango Salarial
                      </label>
                      <input
                        type="text"
                        name="salary_range"
                        value={editJobData.salary_range}
                        onChange={handleEditJobDataChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Nivel de Experiencia
                      </label>
                      <select
                        name="experience_level"
                        value={editJobData.experience_level}
                        onChange={handleEditJobDataChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Seleccionar nivel</option>
                        {experienceLevels.map(level => (
                          <option key={level.value} value={level.value} className="bg-slate-800">
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Tipo de Empleo
                      </label>
                      <select
                        name="job_type"
                        value={editJobData.job_type}
                        onChange={handleEditJobDataChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {jobTypes.map(type => (
                          <option key={type.value} value={type.value} className="bg-slate-800">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Estado
                      </label>
                      <select
                        name="status"
                        value={editJobData.status}
                        onChange={handleEditJobDataChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="draft" className="bg-slate-800">Borrador</option>
                        <option value="active" className="bg-slate-800">Activo</option>
                        <option value="paused" className="bg-slate-800">Pausado</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Descripción del Puesto
                    </label>
                    <textarea
                      name="description"
                      value={editJobData.description}
                      onChange={handleEditJobDataChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Requisitos Adicionales
                    </label>
                    <textarea
                      name="requirements"
                      value={editJobData.requirements}
                      onChange={handleEditJobDataChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Skills Requeridas</h3>
                    <button
                      onClick={() => setShowAddSkill(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar Skill</span>
                    </button>
                  </div>
                  
                  {editSkills.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-white font-medium">Skills Actuales ({editSkills.length})</h4>
                      {editSkills.map(skill => (
                        <div key={skill.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded">
                              <Tag className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">{skill.skill_name}</span>
                                {skill.is_mandatory && (
                                  <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                                    Obligatoria
                                  </span>
                                )}
                              </div>
                              <div className="text-white/60 text-sm">
                                {skill.skill_category} • Importancia: {skill.importance_level}/5 • {skill.min_years} años mín.
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeEditSkill(skill.id)}
                            className="text-white/60 hover:text-red-400 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario para agregar nueva skill */}
                  {showAddSkill && (
                    <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/20">
                      <h4 className="text-white font-medium mb-3">Agregar Nueva Skill</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Nombre de la Skill *
                          </label>
                          <input
                            type="text"
                            name="skill_name"
                            value={newSkill.skill_name}
                            onChange={handleNewSkillChange}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="ej. React, Python, SQL..."
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Categoría
                          </label>
                          <input
                            type="text"
                            name="skill_category"
                            value={newSkill.skill_category}
                            onChange={handleNewSkillChange}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="ej. Frontend, Backend, Database..."
                          />
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Nivel de Importancia (1-5)
                          </label>
                          <select
                            name="importance_level"
                            value={newSkill.importance_level}
                            onChange={handleNewSkillChange}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value={1} className="bg-slate-800">1 - Deseable</option>
                            <option value={2} className="bg-slate-800">2 - Útil</option>
                            <option value={3} className="bg-slate-800">3 - Importante</option>
                            <option value={4} className="bg-slate-800">4 - Muy Importante</option>
                            <option value={5} className="bg-slate-800">5 - Crítica</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Años Mínimos de Experiencia
                          </label>
                          <select
                            name="min_years"
                            value={newSkill.min_years}
                            onChange={handleNewSkillChange}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                              <option key={year} value={year} className="bg-slate-800">
                                {year} año{year > 1 ? 's' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="is_mandatory"
                            checked={newSkill.is_mandatory}
                            onChange={handleNewSkillChange}
                            className="rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-white/80 text-sm">Esta skill es obligatoria</span>
                        </label>
                      </div>

                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          onClick={cancelAddSkill}
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={addNewSkill}
                          disabled={!newSkill.skill_name.trim()}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all"
                        >
                          Agregar Skill
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {editSkills.length === 0 && !showAddSkill && (
                    <div className="text-center py-8">
                      <Tag className="h-12 w-12 text-white/40 mx-auto mb-3" />
                      <p className="text-white/60 mb-4">No hay skills agregadas aún</p>
                      <button
                        onClick={() => setShowAddSkill(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Agregar Primera Skill</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={() => setShowEditJob(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={saveEditJob}
                  disabled={editLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;