import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useApp } from '../context/AppContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReactCountryFlag from 'react-country-flag';

const prefixToCountry = {
  "+57": { code: "CO", name: "Colombia" },
  "+58": { code: "VE", name: "Venezuela" },
  "+507": { code: "PA", name: "Panamá" },
  "+1": { code: "US", name: "Estados Unidos" },
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { setResetPhone } = useApp();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [countryName, setCountryName] = useState('Colombia');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setMessage("El número de teléfono es obligatorio.");
      return;
    }

    setLoading(true);
    setMessage("");

    // Verificar si el usuario existe
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone.trim())
      .maybeSingle();

    if (!user) {
      setMessage("Este número no está registrado.");
      setLoading(false);
      return;
    }

    // Generar código
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Guardar en pending_codes (sin contraseña porque NO se cambia aquí)
    const { error: upsertError } = await supabase
      .from("pending_codes")
      .upsert(
        {
          phone: phone.trim(),
          code: code,
          expires_at: expiresAt,
          // la contraseña se enviará en la pantalla de confirmación
          password_hash: "",
          country_code: countryCode,
          country_name: countryName,
          sent: false
        },
        { onConflict: "phone" }
      );

    if (upsertError) {
      console.error(upsertError);
      setMessage("Hubo un error guardando el código.");
      setLoading(false);
      return;
    }

    // Guardamos el teléfono en contexto
    setResetPhone(phone.trim());

    console.log("Código enviado:", code);

    // Marcar como enviado
    await supabase
      .from("pending_codes")
      .update({ sent: true })
      .eq("phone", phone.trim());

    setTimeout(() => {
      navigate("/verify-reset-code");
    }, 600);

    setLoading(false);
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center mb-8"
      >
        <button
          onClick={() => navigate('/login')}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold ml-4">Recuperar Contraseña</h1>
      </motion.div>

      <div className="max-w-md mx-auto mt-10">
        {message && <p className="text-red-500 mb-3">{message}</p>}

        {/* TELÉFONO CON SELECTOR DE PAÍS */}
        <div className="mb-6 relative">
          <PhoneInput
            country="co"
            value={phone}
            onChange={(value, data) => {
              const formatted = value.startsWith('+') ? value : `+${value}`;
              setPhone(formatted);

              const prefix = `+${data.dialCode}`;
              const country = prefixToCountry[prefix] || {
                code: data.countryCode.toUpperCase(),
                name: data.name,
              };

              setCountryCode(prefix);
              setCountryName(country.name);
            }}
            inputStyle={{
              width: '100%',
              borderRadius: '12px',
              height: '55px',
              paddingLeft: '60px'
            }}
            buttonStyle={{ borderRadius: '12px' }}
            enableSearch
            placeholder="Selecciona tu país y escribe tu número"
            disabled={loading}
            renderButton={(country) => (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
                <ReactCountryFlag
                  countryCode={country.countryCode.toUpperCase()}
                  svg
                  style={{ width: '24px', height: '24px' }}
                />
                <span className="ml-2 text-gray-600">+{country.dialCode}</span>
              </div>
            )}
          />
        </div>

        <button
          onClick={handleSendCode}
          disabled={loading}
          className="w-full bg-blue-900 text-white py-4 rounded-2xl"
        >
          {loading ? "Enviando..." : "Enviar código"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
