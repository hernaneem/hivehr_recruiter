import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { X, Mail, Lock, User, Building, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('¡Login exitoso!');
          setTimeout(() => onClose(), 1000);
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.name, formData.company);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('¡Cuenta creada exitosamente!');
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ email: '', password: '', name: '', company: '' });
          }, 1500);
        }
      }
    } catch {
      setError('Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 w-full max-w-md p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-white/70">
            {isLogin 
              ? 'Accede a tu panel de reclutamiento' 
              : 'Únete a RecruitAgent AI hoy'
            }
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        {/* Form Container */}
        <div className="space-y-4">
          {/* Name field (only for signup) */}
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>
          )}

          {/* Company field (only for signup) */}
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Empresa (opcional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre de tu empresa"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="tu@empresa.com"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-white/50 text-xs mt-1">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
            )}
          </button>
        </div>

        {/* Toggle between login/signup */}
        <div className="mt-6 text-center">
          <p className="text-white/70">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setFormData({ email: '', password: '', name: '', company: '' });
              }}
              className="ml-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        {/* Terms (only for signup) */}
        {!isLogin && (
          <div className="mt-4 text-center">
            <p className="text-white/50 text-xs">
              Al crear una cuenta, aceptas nuestros{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Política de Privacidad
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;