import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';
import { useApp } from '../context/AppContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPhone, clearReset } = useApp();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [verifiedMsg, setVerifiedMsg] = useState(true);

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // 🔥 Forzar botón desactivado
  const passwordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;

  // Vibración en error
  const vibrate = (ms = 100) => {
    if (navigator?.vibrate) navigator.vibrate(ms);
  };

  // Barra de fuerza contraseña
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const strength = getPasswordStrength();

  // Mensaje temporal "código verificado"
  useEffect(() => {
    const t = setTimeout(() => setVerifiedMsg(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleReset = async () => {
    if (!passwordsMatch) {
      vibrate();
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      vibrate();
      setMessage("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .update({ password: hashed })
      .eq("phone", resetPhone);

    if (error) {
      vibrate();
      setMessage("Error al actualizar la contraseña.");
      return;
    }

    await clearReset(resetPhone);

    setMessage("¡Contraseña actualizada con éxito!");
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="min-h-screen px-6 py-8">

      {/* ✔️ Mensaje temporal */}
      {verifiedMsg && (
        <p className="text-green-600 mb-4 text-center font-medium">
          Código verificado correctamente ✔️
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center mb-8"
      >
        <button
          onClick={() => navigate('/verify-reset-code')}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold ml-4">Nueva Contraseña</h1>
      </motion.div>

      {message && <p className="text-red-500 mb-3">{message}</p>}

      {/* Campo contraseña */}
      <div className="relative mb-4">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type={showPass1 ? "text" : "password"}
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-white border rounded-2xl"
        />

        <button
          type="button"
          onClick={() => setShowPass1(!showPass1)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPass1 ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* Barra de fuerza */}
      <div className="h-2 w-full bg-gray-200 rounded-xl mb-4 overflow-hidden">
        <div
          className={`h-full transition-all`}
          style={{
            width: `${(strength / 4) * 100}%`,
            backgroundColor:
              strength <= 1 ? "red" :
              strength === 2 ? "orange" :
              strength === 3 ? "gold" :
              "green"
          }}
        />
      </div>

      {/* Campo confirmar contraseña */}
      <div className="relative mb-2">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type={showPass2 ? "text" : "password"}
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-white border rounded-2xl"
        />

        <button
          type="button"
          onClick={() => setShowPass2(!showPass2)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPass2 ? <EyeOff /> : <Eye />}
        </button>
      </div>

      {/* ✔️ ❌ Indicador */}
      {confirm.length > 0 && (
        <div className="flex items-center mb-4">
          {passwordsMatch ? (
            <CheckCircle className="text-green-600 mr-2" />
          ) : (
            <XCircle className="text-red-600 mr-2" />
          )}
          <span className={passwordsMatch ? "text-green-600" : "text-red-600"}>
            {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
          </span>
        </div>
      )}

      <button
        onClick={handleReset}
        disabled={!passwordsMatch}
        className={`w-full py-4 rounded-2xl text-white transition-all ${
          passwordsMatch
            ? "bg-blue-900"
            : "bg-gray-400"
        }`}
      >
        Guardar contraseña
      </button>
    </div>
  );
};

export default ResetPassword;
