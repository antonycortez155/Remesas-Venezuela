import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const { resetPhone } = useApp();

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(300);
  const timerRef = useRef(null);

  const [fadeOut, setFadeOut] = useState(false);

  // Mensaje verde al entrar
  useEffect(() => {
    setMessage("El código de seguridad fue enviado exitosamente.");
    setMessageType("success");

    const t = setTimeout(() => setFadeOut(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Contador regresivo ⏳
  useEffect(() => {
    if (secondsLeft > 0) {
      timerRef.current = setTimeout(
        () => setSecondsLeft(secondsLeft - 1),
        1000
      );
    }
    return () => clearTimeout(timerRef.current);
  }, [secondsLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Reenviar código 🔄
  const handleResend = async () => {
    setLoading(true);

    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000);

      const { error } = await supabase
        .from("pending_codes")
        .update({
          code: newCode,
          expires_at: expires,
          sent: false
        })
        .eq("phone", resetPhone);

      if (error) throw error;

      setSecondsLeft(300);
      setFadeOut(false);
      setMessage("Se ha reenviado un nuevo código.");
      setMessageType("success");

      const t = setTimeout(() => setFadeOut(true), 2500);
      setTimeout(() => clearTimeout(t), 2600);

    } catch (err) {
      console.error(err);
      setMessage("No se pudo reenviar el código.");
      setMessageType("error");
      setFadeOut(false);
    }

    setLoading(false);
  };

  // Verificar código
  const handleVerify = async () => {
    if (!code.trim()) {
      setMessage("El código es obligatorio.");
      setMessageType("error");
      setFadeOut(false);
      return;
    }

    const { data: pending, error } = await supabase
      .from("pending_codes")
      .select("*")
      .eq("phone", resetPhone)
      .single();

    if (error || !pending) {
      setMessage("Error: No hay un proceso activo.");
      setMessageType("error");
      setFadeOut(false);
      return;
    }

    // Si expiró → no redirige, solo muestra error
    const now = new Date();
    const expires = new Date(pending.expires_at);

    if (now > expires) {
      setMessage("El código ha expirado. Reenviarlo para continuar.");
      setMessageType("error");
      setFadeOut(false);
      return;
    }

    if (pending.code !== code.trim()) {
      setMessage("Código incorrecto.");
      setMessageType("error");
      setFadeOut(false);
      return;
    }

    navigate("/reset-password");
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center mb-8"
      >
        <button
          onClick={() => navigate('/forgot-password')}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold ml-4">Confirmar Código</h1>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeOut ? 0 : 1 }}
          transition={{ duration: 0.8 }}
          className={`p-4 rounded-xl mb-4 ${
            messageType === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </motion.div>
      )}

      <input
        type="text"
        maxLength={6}
        className="w-full text-center border rounded-xl py-3 text-xl tracking-widest"
        placeholder="______"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-blue-900 text-white py-4 rounded-2xl mt-6"
      >
        {loading ? "Verificando..." : "Verificar"}
      </button>

      {/* Contador */}
      <div className="text-center mt-4 text-gray-700 font-semibold">
        Tiempo restante: {formatTime(secondsLeft)}
      </div>

      {/* Botón disponible cuando el tiempo llega a 0 */}
      {secondsLeft === 0 && (
        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-3 rounded-xl mt-4"
        >
          {loading ? "Enviando..." : "Reenviar Código"}
        </button>
      )}
    </div>
  );
};

export default VerifyResetCode;
