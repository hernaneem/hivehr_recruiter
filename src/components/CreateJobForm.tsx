import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Save, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useJobs } from '../contexts/JobsContext';

interface Skill {
  id: number;
  skill_name: string;
  skill_category: string;
  importance_level: number;
  min_years: number;
  is_mandatory: boolean;
}

interface ExistingSkill {
  skill_name: string;
  skill_category: string;
}

const CreateJobForm = () => {
  const { createJob } = useJobs();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [jobData, setJobData] = useState({
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

  const [skills, setSkills] = useState<Skill[]>([]);
  const [existingSkills, setExistingSkills] = useState<ExistingSkill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<ExistingSkill[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    skill_category: '',
    importance_level: 3,
    min_years: 1,
    is_mandatory: true
  });

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

  const skillCategories = [
    'Frontend', 'Backend', 'Mobile', 'DevOps', 'Data Science', 
    'UI/UX', 'Project Management', 'Soft Skills', 'Databases'
  ];

  // Cargar skills existentes al montar el componente
  useEffect(() => {
    const loadExistingSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('job_required_skills')
          .select('skill_name, skill_category')
          .order('skill_name');

        if (error) throw error;

        // Obtener skills únicos
        const uniqueSkills = data.reduce((acc: ExistingSkill[], curr) => {
          const existing = acc.find(skill => skill.skill_name === curr.skill_name);
          if (!existing) {
            acc.push(curr);
          }
          return acc;
        }, []);

        setExistingSkills(uniqueSkills);
      } catch (err) {
        console.error('Error cargando skills existentes:', err);
      }
    };

    loadExistingSkills();
  }, []);

  // Filtrar skills basado en texto ingresado
  useEffect(() => {
    if (newSkill.skill_name.length > 0) {
      const filtered = existingSkills.filter(skill =>
        skill.skill_name.toLowerCase().includes(newSkill.skill_name.toLowerCase())
      );
      setFilteredSkills(filtered);
      setShowSkillSuggestions(true);
    } else {
      setFilteredSkills([]);
      setShowSkillSuggestions(false);
    }
  }, [newSkill.skill_name, existingSkills]);

  const handleJobDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setJobData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSkillChange = (field: string, value: string | number | boolean) => {
    if (field === 'importance_level' && typeof value === 'string') {
      const numValue = parseInt(value);
      // Validar que sea un número válido y esté en el rango permitido
      if (isNaN(numValue) || numValue < 1 || numValue > 5) {
        return; // No actualizar si el valor no es válido
      }
      setNewSkill(prev => ({
        ...prev,
        [field]: numValue
      }));
    } else if (field === 'min_years' && typeof value === 'string') {
      const numValue = parseInt(value);
      // Validar que sea un número válido
      if (isNaN(numValue) || numValue < 0) {
        return; // No actualizar si el valor no es válido
      }
      setNewSkill(prev => ({
        ...prev,
        [field]: numValue
      }));
    } else {
      setNewSkill(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const selectExistingSkill = (skill: ExistingSkill) => {
    setNewSkill(prev => ({
      ...prev,
      skill_name: skill.skill_name,
      skill_category: skill.skill_category
    }));
    setShowSkillSuggestions(false);
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSkill.skill_name.trim()) {
      setError('El nombre de la skill es obligatorio');
      return;
    }
    
    // Verificar que la skill no esté ya agregada
    const skillExists = skills.some(skill => 
      skill.skill_name.toLowerCase() === newSkill.skill_name.toLowerCase()
    );
    
    if (skillExists) {
      setError('Esta skill ya fue agregada');
      return;
    }
    
    setSkills(prev => [...prev, { ...newSkill, id: Date.now() }]);
    setNewSkill({
      skill_name: '',
      skill_category: '',
      importance_level: 3,
      min_years: 1,
      is_mandatory: true
    });
    setError('');
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skillId: number) => {
    setSkills(prev => prev.filter(skill => skill.id !== skillId));
  };

  const saveJob = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Preparar skills para envío (sin el id temporal)
      const skillsToSave = skills.map(skill => ({
        skill_name: skill.skill_name,
        skill_category: skill.skill_category,
        importance_level: skill.importance_level,
        min_years: skill.min_years,
        is_mandatory: skill.is_mandatory
      }));

      await createJob(jobData, skillsToSave);

      setSuccess('¡Trabajo creado exitosamente!');
      
      // Resetear formulario
      setTimeout(() => {
        setJobData({
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
        setSkills([]);
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Crear Nuevo Trabajo</h2>
            <p className="text-white/70">Define los requisitos para tu próxima contratación</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Título del Puesto *
            </label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleJobDataChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="ej. Senior React Developer"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Empresa
            </label>
            <input
              type="text"
              name="company"
              value={jobData.company}
              onChange={handleJobDataChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nombre de la empresa"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Ubicación
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                name="location"
                value={jobData.location}
                onChange={handleJobDataChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ciudad, País o Remoto"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Rango Salarial
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                name="salary_range"
                value={jobData.salary_range}
                onChange={handleJobDataChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="$80,000 - $120,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Nivel de Experiencia
            </label>
            <select
              name="experience_level"
              value={jobData.experience_level}
              onChange={handleJobDataChange}
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
              value={jobData.job_type}
              onChange={handleJobDataChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {jobTypes.map(type => (
                <option key={type.value} value={type.value} className="bg-slate-800">
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Descripción del Puesto
          </label>
          <textarea
            name="description"
            value={jobData.description}
            onChange={handleJobDataChange}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Describe las responsabilidades principales y el perfil que buscas..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-white/80 text-sm font-medium mb-2">
            Requisitos Adicionales
          </label>
          <textarea
            name="requirements"
            value={jobData.requirements}
            onChange={handleJobDataChange}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Requisitos específicos, certificaciones, idiomas, etc."
          />
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Skills Requeridas</h3>
        
        {/* Add Skill Form */}
        <div className="bg-white/5 rounded-lg p-4 mb-4">
          <h4 className="text-white font-medium mb-3">Agregar Nueva Skill</h4>
          
          <form onSubmit={addSkill}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={newSkill.skill_name}
                    onChange={(e) => handleSkillChange('skill_name', e.target.value)}
                    onFocus={() => newSkill.skill_name.length > 0 && setShowSkillSuggestions(true)}
                    className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Nombre skill"
                  />
                </div>
                
                {/* Sugerencias de skills existentes */}
                {showSkillSuggestions && filteredSkills.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSkills.slice(0, 5).map((skill, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectExistingSkill(skill)}
                        className="w-full text-left px-3 py-2 hover:bg-white/10 text-white text-sm border-b border-white/10 last:border-b-0"
                      >
                        <div className="font-medium">{skill.skill_name}</div>
                        {skill.skill_category && (
                          <div className="text-white/60 text-xs">{skill.skill_category}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <select
                  value={newSkill.skill_category}
                  onChange={(e) => handleSkillChange('skill_category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Categoría</option>
                  {skillCategories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newSkill.importance_level}
                  onChange={(e) => handleSkillChange('importance_level', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Importancia (1-5)"
                />
              </div>

              <div>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={newSkill.min_years}
                  onChange={(e) => handleSkillChange('min_years', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Años mín."
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-white/80 text-sm">
                  <input
                    type="checkbox"
                    checked={newSkill.is_mandatory}
                    onChange={(e) => handleSkillChange('is_mandatory', e.target.checked)}
                    className="rounded"
                  />
                  <span>Obligatoria</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Skill</span>
            </button>
          </form>
        </div>

        {/* Skills List */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-medium">Skills Agregadas ({skills.length})</h4>
            {skills.map(skill => (
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
                  onClick={() => removeSkill(skill.id)}
                  className="text-white/60 hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setJobData(prev => ({ ...prev, status: 'draft' }))}
          className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all border border-white/20"
        >
          Guardar como Borrador
        </button>
        
        <button
          onClick={saveJob}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Crear Trabajo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateJobForm;