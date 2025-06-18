import { useState } from 'react';
import CreateJobForm from './CreateJobForm';
import { useAuth } from '../hooks/useAuth';
import { useJobs } from '../contexts/JobsContext';
import JobsList from './JobsList';
import CVAnalysis from './CVAnalysis';
import Tests from './Tests';
import { 
  Brain, 
  Plus, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  User,
  Briefcase,
  Upload,
  Clock,
  Target,
  ClipboardList
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { stats, recentJobs, loading: jobsLoading } = useJobs();
  const [activeTab, setActiveTab] = useState('overview');

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'create-job', label: 'Crear Trabajo', icon: Plus },
    { id: 'jobs', label: 'Mis Trabajos', icon: Briefcase },
    { id: 'analysis', label: 'Análisis CVs', icon: FileText },
    { id: 'tests', label: 'Tests', icon: ClipboardList },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const statsDisplay = [
    { 
      label: 'Trabajos Activos', 
      value: jobsLoading ? '-' : stats.activeJobs.toString(), 
      icon: Briefcase, 
      color: 'from-amber-500 to-amber-600' 
    },
    { 
      label: 'CVs Analizados', 
      value: jobsLoading ? '-' : stats.analyzedCVs.toString(), 
      icon: FileText, 
      color: 'from-brown-500 to-brown-600' 
    },
    { 
      label: 'Match Promedio', 
      value: jobsLoading ? '-' : `${stats.averageMatch}%`, 
      icon: Target, 
      color: 'from-amber-600 to-amber-700' 
    },
    { 
      label: 'Trabajos Creados', 
      value: jobsLoading ? '-' : stats.totalJobs.toString(), 
      icon: Clock, 
      color: 'from-brown-600 to-brown-700' 
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('create-job')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white p-4 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-3"
                >
                  <Plus className="h-5 w-5" />
                  <span>Crear Nuevo Trabajo</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('analysis')}
                  className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-all border border-white/20 flex items-center space-x-3"
                >
                  <Upload className="h-5 w-5" />
                  <span>Subir CVs</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-all border border-white/20 flex items-center space-x-3"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Ver Análisis</span>
                </button>
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Trabajos Recientes</h3>
                <button 
                  onClick={() => setActiveTab('jobs')}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Ver todos
                </button>
              </div>
              
              <div className="space-y-3">
                {jobsLoading ? (
                  <div className="text-white/60 text-center py-4">
                    Cargando trabajos...
                  </div>
                ) : recentJobs.length > 0 ? (
                  recentJobs.map(job => (
                    <div key={job.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg">
                          <Briefcase className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{job.title}</h4>
                          <p className="text-white/60 text-sm">{job.candidates} candidatos</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-white/80 text-sm">Match: {job.match}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          job.status === 'active' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {job.status === 'active' ? 'Activo' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-white/60 text-center py-4">
                    No hay trabajos creados aún. ¡Crea tu primer trabajo!
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'create-job':
        return <CreateJobForm />;

      case 'jobs':
        return <JobsList />;

      case 'analysis':
        return <CVAnalysis />;

      case 'tests':
        return <Tests />;

      case 'settings':
        return (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-6">Configuración</h3>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Información de Cuenta</h4>
                <p className="text-white/70 text-sm">Email: {user?.email}</p>
                <p className="text-white/70 text-sm">Nombre: {user?.user_metadata?.name || 'No especificado'}</p>
                <p className="text-white/70 text-sm">Empresa: {user?.user_metadata?.company || 'No especificada'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-white">Contenido no encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">RecruitAgent AI</h1>
                <p className="text-white/60 text-sm">Panel de Control</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar trabajos, candidatos..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-white/60 hover:text-white transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-full">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium text-sm">
                    {user?.user_metadata?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-white/60 text-xs">{user?.user_metadata?.company || 'Usuario'}</p>
                </div>
              </div>

              <button
                onClick={signOut}
                className="text-white/60 hover:text-white transition-colors p-2"
                title="Cerrar Sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 min-h-screen">
          <nav className="p-6">
            <ul className="space-y-2">
              {sidebarItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;