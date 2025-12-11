import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Globe } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import { useApp } from '../context/AppContext';
import { countries } from '../data/countries';
import Logo from '../components/Logo';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: appLoading, fetchUser } = useApp();

  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    country: user?.country_code || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Redirigir si el usuario no está autenticado o la app sigue cargando
  if (!isAuthenticated || appLoading) {
    return (
      <Layout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center">Cargando...</div>
      </Layout>
    );
  }

  // Si el usuario ya tiene nombre y apellido, redirigir al home
  if (user?.first_name && user?.last_name) {
    navigate('/home');
    return null;
  }

  const validateForm = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es obligatorio.';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es obligatorio.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw new Error('Error al actualizar el perfil.');

      setMessage('¡Perfil completado exitosamente! Redirigiendo...');
      setMessageType('success');

      // Recargar el usuario desde Supabase sin necesidad de contraseña
      await fetchUser();

      setTimeout(() => {
        navigate('/home');
      }, 1500);

    } catch (err) {
      console.error('Error al completar perfil:', err);
      setMessage(err.message || 'Error al completar el perfil. Inténtalo de nuevo.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const userCountry = countries.find(c => c.code === formData.country);

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Logo size="medium" className="mb-8" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Completa tu perfil</h1>
          <p className="text-gray-600 mb-6">
            Necesitamos algunos datos más para que puedas usar todas las funciones.
          </p>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 ${errors.firstName ? 'border-red-500 ring-red-100' : 'border-gray-200 ring-blue-100 focus:border-blue-500'} transition-all`}
                  disabled={loading}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 ${errors.lastName ? 'border-red-500 ring-red-100' : 'border-gray-200 ring-blue-100 focus:border-blue-500'} transition-all`}
                  disabled={loading}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <div className="flex items-center pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-2xl cursor-not-allowed">
                {userCountry?.code && (
                  <ReactCountryFlag
                    countryCode={userCountry.code}
                    svg
                    style={{ width: '1.5em', height: '1.5em', marginRight: '0.5em' }}
                  />
                )}
                <span className="text-gray-600">{userCountry?.name || 'País no detectado'}</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Tu país se detectó automáticamente por tu número de teléfono y no puede ser cambiado.
              </p>
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-900 text-white py-4 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Completar Perfil'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
