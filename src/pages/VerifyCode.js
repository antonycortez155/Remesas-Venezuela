import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';
import Logo from '../components/Logo';

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneFromState = location.state?.phone || localStorage.getItem('pendingPhone');
  const [phone] = useState(phoneFromState);

  const [codeInput, setCodeInput] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const timerRef = useRef(null);
  const [codeVerified, setCodeVerified] = useState(false);

  // Si no hay número guardado → redirigir a /register
  useEffect(() => {
    if (!phone) {
      navigate('/register');
      return;
    }
    localStorage.setItem('pendingPhone', phone);
  }, [phone, navigate]);

  // Temporizador
  useEffect(() => {
    if (secondsLeft > 0) {
      timerRef.current = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [secondsLeft]);

  const detectCountryFromPhone = (phone) => {
    if (phone.startsWith('+57')) return 'Colombia';
    if (phone.startsWith('+58')) return 'Venezuela';
    if (phone.startsWith('+1')) return 'Estados Unidos';
    if (phone.startsWith('+507')) return 'Panamá';
    return 'Desconocido';
  };

  const handleVerifyCode = async () => {
    if (!codeInput.trim()) {
      setMessage('Ingresa el código recibido.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const { data: pending, error } = await supabase
        .from('pending_codes')
        .select('*')
        .eq('phone', phone)
        .maybeSingle(); // evita romper si no hay registros

      if (error) throw error;

      if (!pending) {
        setMessage('No se encontró un código para este número.');
        setMessageType('error');
        return;
      }

      const now = new Date();
      const expiresAt = pending.expires_at ? new Date(pending.expires_at) : null;

      if (!expiresAt || expiresAt < now) {
        setMessage('El código ha expirado. Reenvía uno nuevo.');
        setMessageType('error');
        return;
      }

      if (pending.code !== codeInput) {
        setMessage('Código incorrecto.');
        setMessageType('error');
        return;
      }

      setMessage('');
      setMessageType('');
      setCodeVerified(true);
      clearTimeout(timerRef.current);
    } catch (error) {
      console.error('Error al verificar código:', error);
      setMessage('Error al verificar código. Intenta de nuevo.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      const { error } = await supabase
        .from('pending_codes')
        .upsert([{ phone, code: newCode, expires_at: expires }]);

      if (error) throw error;

      setSecondsLeft(300);
      setMessage('Se ha reenviado un nuevo código.');
      setMessageType('success');
    } catch (error) {
      console.error('Error al reenviar código:', error);
      setMessage('No se pudo reenviar el código. Intenta nuevamente.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setMessage('Nombre y apellido son obligatorios.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const hashedPassword = localStorage.getItem('pendingPassword');
      if (!hashedPassword) {
        setMessage('Error: No se encontró contraseña temporal.');
        setMessageType('error');
        return;
      }

      const country = detectCountryFromPhone(phone);

      const { error } = await supabase
        .from('users')
        .insert([{
          phone,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          country
        }]);

      if (error) throw error;

      await supabase.from('pending_codes').delete().eq('phone', phone);
      localStorage.removeItem('pendingPassword');
      localStorage.removeItem('pendingPhone');

      setMessage('Registro completado con éxito. Redirigiendo...');
      setMessageType('success');

      setTimeout(() => navigate('/home'), 2000); // ← aquí ya redirige al home
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setMessage('Error al guardar usuario. Intenta de nuevo.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen px-6 py-8">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Logo size="medium" className="mb-8" />

          {message && (
            <motion.div
              className={`p-4 rounded-xl mb-4 ${
                messageType === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message}
            </motion.div>
          )}

          {!codeVerified ? (
            <>
              <input
                type="text"
                placeholder="Código recibido"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="w-full mb-4 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
                disabled={loading}
              />
              <button
                onClick={handleVerifyCode}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold mb-2"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>

              <div className="flex justify-between items-center mt-2">
                <span>Tiempo restante: {formatTime(secondsLeft)}</span>
                <button
                  onClick={handleResendCode}
                  disabled={secondsLeft > 0 || loading}
                  className={`text-blue-900 font-semibold ${
                    secondsLeft > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:underline'
                  }`}
                >
                  Reenviar Código
                </button>
              </div>

              <button
                onClick={() => navigate('/register')}
                className="w-full mt-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
                disabled={loading}
              >
                Volver a número de teléfono
              </button>
            </>
          ) : (
            <div className="space-y-4 mt-4">
              <input
                type="text"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Correo (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2"
                disabled={loading}
              />
              <button
                onClick={handleCompleteRegistration}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Completar Registro'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default VerifyCode;