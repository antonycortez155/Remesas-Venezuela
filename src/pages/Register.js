import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Logo from '../components/Logo';
import Layout from '../components/Layout';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactCountryFlag from 'react-country-flag';
import bcrypt from 'bcryptjs';

const prefixToCountry = {
  "+57": { code: "CO", name: "Colombia" },
  "+58": { code: "VE", name: "Venezuela" },
  "+507": { code: "PA", name: "Panamá" },
  "+1": { code: "US", name: "Estados Unidos" },
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.phone.trim()) newErrors.phone = 'El número es obligatorio.';
    else if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) newErrors.phone = 'Formato inválido.';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria.';
    else if (formData.password.length < 6) newErrors.password = 'Debe tener al menos 6 caracteres.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden.';
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
      // Verificar si el teléfono ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', formData.phone)
        .maybeSingle();

      if (existingUser) {
        setMessage('Ya tienes una cuenta registrada. Inicia sesión.');
        setMessageType('success');
        setLoading(false);
        navigate('/login', { state: { phone: formData.phone } });
        return;
      }

      const hashedPassword = bcrypt.hashSync(formData.password, 10);
      localStorage.setItem('pendingPassword', hashedPassword);

      // Detectar país según prefijo
      const prefix = Object.keys(prefixToCountry).find(p => formData.phone.startsWith(p));
      const country = prefixToCountry[prefix] || { code: "XX", name: "Desconocido" };

      // Generar código temporal
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Guardar en pending_codes
      await supabase.from('pending_codes').upsert([{
        phone: formData.phone,
        code,
        expires_at: expires,
        password_hash: hashedPassword,
        country_code: country.code,
        country_name: country.name
      }]);

      setMessage(`¡Registro exitoso! Te hemos enviado un código a WhatsApp.`);
      setMessageType('success');
      navigate('/verify-code', { state: { phone: formData.phone } });

    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al generar código. Intenta nuevamente.');
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
          <h1 className="text-2xl font-bold text-gray-800 ml-4">Crear Cuenta</h1>
        </motion.div>

        <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Logo size="medium" className="mb-8" />
          {message && (
            <motion.div className={`p-4 rounded-xl mb-4 ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <PhoneInput
                country="co"
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone: phone.startsWith('+') ? phone : `+${phone}` })}
                inputStyle={{ width: '100%', borderRadius: '12px', height: '55px', paddingLeft: '60px' }}
                buttonStyle={{ borderRadius: '12px' }}
                enableSearch
                placeholder="Selecciona tu país y escribe tu número"
                disabled={loading}
                renderButton={(country) => (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
                    <ReactCountryFlag countryCode={country.countryCode.toUpperCase()} svg style={{ width: '24px', height: '24px' }} title={country.name} />
                    <span className="ml-2 text-gray-600">+{country.dialCode}</span>
                  </div>
                )}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirmar Contraseña"
                className={`w-full pl-12 pr-12 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 ring-red-100' : 'border-gray-200 ring-blue-100 focus:border-blue-500'}`}
                disabled={loading}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-900 text-white py-4 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Register;