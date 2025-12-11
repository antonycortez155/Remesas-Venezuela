import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Logo from '../components/Logo';
import Layout from '../components/Layout';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    // Supabase maneja la sesión automáticamente después de la redirección del email
    // No necesitamos verificar el token aquí, solo asegurarnos de que el usuario esté logueado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('No se pudo verificar la sesión. Por favor, intenta el proceso de recuperación de contraseña de nuevo.');
        setMessageType('error');
      }
    };
    checkUser();
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!password) {
      newErrors.password = 'La nueva contraseña es obligatoria.';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    if (validateForm()) {
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage('¡Contraseña actualizada exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        setMessage(error.message || 'Error al actualizar la contraseña. Inténtalo de nuevo.');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen px-6 py-8">
        <motion.div 
          className="flex items-center mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => navigate('/login')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 ml-4">Actualizar Contraseña</h1>
        </motion.div>

        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Logo size="medium" className="mb-8" />

          {message && (
            <motion.div 
              className={`p-4 rounded-xl mb-4 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Nueva Contraseña"
                value={password}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 ring-red-100' : 'border-gray-200 ring-blue-100 focus:border-blue-500'} transition-all`}
                disabled={loading}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar Nueva Contraseña"
                value={confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 ring-red-100' : 'border-gray-200 ring-blue-100 focus:border-blue-500'} transition-all`}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-900 text-white py-4 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default UpdatePassword;