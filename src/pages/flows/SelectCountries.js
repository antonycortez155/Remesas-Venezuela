import React, { useState, useEffect } from "react";
import { countries } from "../../data/countries";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../supabaseClient";

export default function SelectCountries() {
  console.log("📌 Componente SelectCountries MONTADO");

  const navigate = useNavigate();
  const { user } = useApp();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [rate, setRate] = useState(null);
  const [operation, setOperation] = useState(null);
  const [currency, setCurrency] = useState(null); // 👈 moneda real desde DB
  const [receivedAmount, setReceivedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbRates, setDbRates] = useState([]);

  // ============================
  // 🔥 1. Cargar tasas desde Supabase
  // ============================
  useEffect(() => {
    console.log("📌 useEffect → Cargando tasas de Supabase…");

    const loadRates = async () => {
      const { data, error } = await supabase.from("rates").select("*");

      console.log("📥 Respuesta Supabase (rates):", data);
      console.log("❌ Error Supabase:", error);

      if (error) return;

      setDbRates(data);
    };
    loadRates();
  }, []);

  // ============================
  // 🔥 2. Formateo del monto
  // ============================
  const handleAmountChange = (value) => {
    console.log("⌨️ Monto escrito:", value);

    const raw = value.replace(/\D/g, "");
    console.log("➡️ Monto sin formato:", raw);

    setAmount(raw);

    if (!raw) {
      console.log("⚠️ Monto vacío → limpiando");
      setFormattedAmount("");
      setReceivedAmount(null);
      return;
    }

    const formatted = new Intl.NumberFormat("de-DE").format(raw);
    console.log("🧮 Monto formateado:", formatted);

    setFormattedAmount(formatted);
  };

  // ============================
  // 🔥 3. Cálculo con tasas
  // ============================
  useEffect(() => {
    console.log("🔄 useEffect CALCULATING...");
    console.log("🌍 Origen:", origin);
    console.log("🎯 Destino:", destination);
    console.log("💵 Amount:", amount);
    console.log("📊 dbRates:", dbRates);

    if (!origin || !destination || !amount || dbRates.length === 0) {
      console.log("⚠️ Datos insuficientes para calcular");
      setRate(null);
      setReceivedAmount(null);
      return;
    }

    const match = dbRates.find(
      (r) => r.origin_country === origin && r.destination_country === destination
    );

    console.log("🔍 Resultado búsqueda tasa:", match);

    if (!match) {
      console.log("❌ NO SE ENCONTRÓ TASA PARA:", origin, "→", destination);
      setRate(null);
      setReceivedAmount(null);
      return;
    }

    setRate(match.rate);
    setOperation(match.operation);
    setCurrency(match.currency); // 👈 CARGAMOS moneda de la tabla

    let calculated = 0;

    console.log("🧮 Operación:", match.operation);
    console.log("📈 Rate:", match.rate);

    if (match.operation === "multiply") {
      calculated = parseFloat(amount) * match.rate;
      console.log("✖️ Multiplicando:", amount, "*", match.rate, "=", calculated);
    } else {
      calculated = parseFloat(amount) / match.rate;
      console.log("➗ Dividiendo:", amount, "/", match.rate, "=", calculated);
    }

    console.log("💰 Resultado redondeado:", Math.round(calculated));
    setReceivedAmount(Math.round(calculated));
  }, [origin, destination, amount, dbRates]);

  const originCountry =
    countries.find((c) => c.code === origin) || { flag: "🌍", name: "" };

  const destinationCountry =
    countries.find((c) => c.code === destination) || { flag: "🌍", name: "" };

  const canContinue = origin && destination && amount && receivedAmount;

  // ============================
  // 🔥 4. Crear transacción en Supabase
  // ============================
  const goNext = async () => {
    console.log("➡️ goNext PRESSED");
    console.log("🧾 Datos enviados:", {
      origin,
      destination,
      amount: parseFloat(amount),
      rate,
      operation,
      currency,
      received_amount: receivedAmount,
    });

    if (!user) {
      console.log("❌ No hay user en contexto");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            origin_country: origin,
            destination_country: destination,
            amount: parseFloat(amount),
            rate,
            operation,
            currency,
            received_amount: receivedAmount,
            status: "Creando",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      console.log("📥 Respuesta INSERT:", data);
      console.log("❌ Error INSERT:", error);

      if (error) throw error;

      navigate("/send/step2", {
        state: {
          origin,
          destination,
          amount: parseFloat(amount),
          rate,
          receivedAmount,
          operation,
          currency, // 👈 moneda desde DB
          transactionId: data.id,
        },
      });
    } catch (err) {
      console.log("🔥 Error creando transacción:", err);
      alert("Ocurrió un error al crear la transacción.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-auto scroll-pb-40 p-5 bg-gradient-to-b from-blue-50 to-yellow-50">
      <motion.h1
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-blue-900 mb-6 text-center"
      >
        Selecciona los datos del envío
      </motion.h1>

      {/* País Origen */}
      <div className="mb-4">
        <label className="font-semibold text-blue-900">País de envío</label>
        <select
          className="w-full p-3 rounded-xl border"
          value={origin}
          onChange={(e) => {
            console.log("🇦🇺 Cambio país origen →", e.target.value);
            setOrigin(e.target.value);
            setDestination("");
          }}
        >
          <option value="">Selecciona un país</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* País Destino */}
      <div className="mb-4">
        <label className="font-semibold text-blue-900">País destino</label>
        <select
          className="w-full p-3 rounded-xl border"
          value={destination}
          onChange={(e) => {
            console.log("🎯 Cambio país destino →", e.target.value);
            setDestination(e.target.value);
          }}
        >
          <option value="">Selecciona un país</option>
          {countries
            .filter((c) => c.code !== origin)
            .map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
        </select>
      </div>

      {/* Monto */}
      <div className="mb-4">
        <label className="font-semibold text-blue-900">Monto a enviar</label>
        <input
          type="text"
          className="w-full p-3 rounded-xl border"
          placeholder="0"
          value={formattedAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
        />
      </div>

      {/* Resumen */}
      {rate && receivedAmount && (
        <motion.div
          key={`${origin}-${destination}-${rate}-${receivedAmount}`}
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 mt-4 bg-white shadow-md rounded-2xl border"
        >
          <h2 className="font-bold text-blue-900 text-center mb-3">
            Resumen del envío
          </h2>

          <div className="text-center text-lg">
            <span className="font-semibold">
              {originCountry.flag} {originCountry.name}
            </span>{" "}
            →{" "}
            <span className="font-semibold">
              {destinationCountry.flag} {destinationCountry.name}
            </span>
          </div>

          <p className="text-center mt-3 text-blue-800">
            <strong>Tasa:</strong> {rate}
          </p>

          <p className="text-center text-blue-800">
            <strong>Operación:</strong>{" "}
            {operation === "multiply" ? "Multiplica" : "Divide"}
          </p>

          <p className="text-center text-blue-800">
            <strong>Monto enviado:</strong> {formattedAmount}
          </p>

          <p className="text-center text-green-700 font-bold text-xl mt-2">
            Recibe:{" "}
            {new Intl.NumberFormat("de-DE").format(receivedAmount)}{" "}
            {currency} {/* 👈 MONEDA REAL DESDE LA BASE */}
          </p>
        </motion.div>
      )}

      {/* Botón continuar */}
      {canContinue && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full mt-6 bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold shadow-md"
          onClick={goNext}
          disabled={loading}
        >
          {loading ? "Creando transacción..." : "Continuar"}
        </motion.button>
      )}
    </div>
  );
}
