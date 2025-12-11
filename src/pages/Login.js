import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import Layout from '../components/Layout';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactCountryFlag from 'react-country-flag';

const prefixToCountry = {
  "+57": { code: "CO", name: "Colombia" },
  "+58": { code: "VE", name: "Venezuela" },
  "+507": { code: "PA", name: "Panamá" },
  "+1": { code: "US", name: "Estados Unidos" },
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useEmail, setUseEmail] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.identifier.trim()) newErrors.identifier = useEmail ? 'Correo es obligatorio.' : 'Teléfono es obligatorio.';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
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
      const loggedUser = await login(formData.identifier, formData.password);
      if (!loggedUser) {
        setMessage('Credenciales incorrectas.');
        setMessageType('error');
        setLoading(false);
        return;
      }
      setMessage(`¡Bienvenido, ${loggedUser.first_name}!`);
      setMessageType('success');
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setMessage(err.message || 'Error al iniciar sesión.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen px-6 py-8">
        <motion.div className="flex items-center mb-8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 ml-4">Iniciar Sesión</h1>
        </motion.div>

        <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Logo size="medium" className="mb-8" />
          {message && (
            <motion.div className={`p-4 rounded-xl mb-4 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative w-full">
              <AnimatePresence mode="wait">
                {!useEmail ? (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative"
                  >
                    <PhoneInput
                      country="co"
                      value={formData.identifier}
                      onChange={(phone) => setFormData({ ...formData, identifier: phone.startsWith('+') ? phone : `+${phone}` })}
                      inputStyle={{ width: '100%', borderRadius: '12px', height: '55px', paddingLeft: '60px' }}
                      buttonStyle={{ borderRadius: '12px' }}
                      enableSearch
                      placeholder="Teléfono"
                      disabled={loading}
                      renderButton={(country) => (
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
                          <ReactCountryFlag countryCode={country.countryCode.toUpperCase()} svg style={{ width: '24px', height: '24px' }} title={country.name} />
                          <span className="ml-2 text-gray-600">+{country.dialCode}</span>
                        </div>
                      )}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                      onClick={() => setUseEmail(true)}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
                  </motion.div>
                ) : (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative"
                  >
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="identifier"
                      placeholder="Correo electrónico"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                      onClick={() => setUseEmail(false)}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Contraseña"
                className={`w-full pl-12 pr-12 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 ring-red-100' : 'border-gray-200 ring-blue-100 focus:border-blue-500'}`}
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-900 text-white py-4 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
