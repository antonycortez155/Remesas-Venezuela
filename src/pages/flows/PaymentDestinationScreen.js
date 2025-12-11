
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../supabaseClient";
import Layout from "../../components/Layout";
import { motion } from "framer-motion";

/* ====== Listas de bancos por país ====== */
const BANKS_BY_COUNTRY = {
  VE: [
    "Banco de Venezuela",
    "Banesco",
    "Provincial",
    "Mercantil",
    "BOD",
    "Banco Nacional de Crédito (BNC)",
    "Bicentenario",
    "Banco del Tesoro"
  ],
  CO: [
    "Bancolombia",
    "Davivienda",
    "BBVA",
    "Banco de Bogotá",
    "Banco de Occidente",
    "Banco Popular"
  ],
  PE: ["BCP", "Interbank", "BBVA", "Scotiabank"],
  US: ["Wells Fargo", "Bank of America", "Chase", "Citibank", "PNC Bank"],
  PA: ["Banco General", "Banistmo", "Global Bank", "BAC Credomatic"],
  EC: ["Banco Pichincha", "Banco de Guayaquil", "Produbanco", "Banco Internacional"]
};

/* ====== Métodos por país ====== */
const METHODS_BY_COUNTRY = (countryCode) => {
  const baseTransfer = ["Transferencia bancaria"];
  switch ((countryCode || "").toUpperCase()) {
    case "VE":
      return ["Pago móvil", ...baseTransfer];
    case "CO":
      return ["Bancolombia", "Nequi", "Daviplata", ...baseTransfer];
    case "PE":
      return ["Yape", "Plin", ...baseTransfer];
    case "US":
      return ["Zelle", "Western Union", ...baseTransfer];
    case "PA":
      return ["Zelle", "Western Union", ...baseTransfer];
    case "EC":
      return ["Banco Pichincha", ...baseTransfer];
    default:
      return [...baseTransfer];
  }
};

/* ====== Helpers ====== */
const isBankTransfer = (methodName) => {
  if (!methodName) return false;
  const name = methodName.toLowerCase();
  return (
    name.includes("transferencia") ||
    name.includes("banco") ||
    name.includes("bancolombia") ||
    name.includes("bank")
  );
};

const PaymentDestinationScreen = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const { transactionId } = location.state || {};
  const [transaction, setTransaction] = useState(null);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [Loading, setLoading] = useState(true);

  // Modal
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [selectedMethodType, setSelectedMethodType] = useState("");

  // Datos del formulario
  const [newMethodData, setNewMethodData] = useState({
    holder_name: "",
    account_number: "",
    bank: "",
    platform: "",
    account_type: "",
    document_type: "",
    document_number: ""
  });

  /* ==== Cargar transacción ==== */
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) return;

      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (data) setTransaction(data);
    };

    fetchTransaction();
  }, [transactionId]);

  /* ==== Cargar métodos según país destino ==== */
  useEffect(() => {
    const fetchMethods = async () => {
      if (!transaction || !user) return;

      const { data } = await supabase
        .from("user_payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .eq("country_code", transaction.destination_country);

      if (data) setMethods(data);
      setLoading(false);
    };

    fetchMethods();
  }, [transaction, user]);

  /* ==== Abrir modal ==== */
  const openAddMethodModal = () => {
    setSelectedMethodType("");
    setNewMethodData({
      holder_name: "",
      account_number: "",
      bank: "",
      platform: "",
      account_type: "",
      document_type: "",
      document_number: ""
    });
    setShowMethodModal(true);
  };

  const cancelAddMethod = () => {
    setShowMethodModal(false);
    setSelectedMethodType("");
  };

  const chooseMethodType = (method) => {
    setSelectedMethodType(method);

    if (!isBankTransfer(method)) {
      setNewMethodData((p) => ({
        ...p,
        bank: method.includes("Banco") || method === "Bancolombia" ? method : p.bank
      }));
    }
  };

/* ==== Guardar nuevo método ==== */
  const handleAddNewMethod = async () => {
    if (!transaction || !user || !selectedMethodType) return;

    // Validar campos esenciales
    if (!newMethodData.holder_name) {
      alert("Ingresa el titular.");
      return;
    }

    if (isBankTransfer(selectedMethodType) && !newMethodData.account_number) {
      alert("Ingresa número de cuenta.");
      return;
    }

    if (selectedMethodType === "Pago móvil" && !newMethodData.account_number) {
      alert("Ingresa número telefónico para pago móvil.");
      return;
    }

    if (!newMethodData.document_type) {
      alert("Selecciona tipo de documento.");
      return;
    }

    if (!newMethodData.document_number) {
      alert("Ingresa número de documento.");
      return;
    }

    const insertData = {
      user_id: user.id,
      country_code: transaction.destination_country,
      method: selectedMethodType,
      account_type: isBankTransfer(selectedMethodType) ? newMethodData.account_type : null,
      data: {
        holder_name: newMethodData.holder_name,
        account_number: newMethodData.account_number || null,
        bank: newMethodData.bank || null,
        platform: newMethodData.platform || null,
        document_type: newMethodData.document_type,
        document_number: newMethodData.document_number
      }
    };

    const { data, error } = await supabase
      .from("user_payment_methods")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      alert("Error guardando el método.");
      return;
    }

    setMethods((prev) => [...prev, data]);
    setShowMethodModal(false);
    setSelectedMethodType("");
  };

  /* ======= Continuar ======= */
  const handleContinue = async () => {
    if (!selectedMethod || !transaction) return;

    await supabase
      .from("transactions")
      .update({ payment_method_destination_id: selectedMethod.id })
      .eq("id", transaction.id);

    navigate("/send/step4", { state: { transactionId: transaction.id } });
  };

  if (Loading)
    return (
      <Layout>
        <p className="text-center mt-10">Cargando métodos...</p>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen p-5 bg-gradient-to-b from-blue-50 to-yellow-50">
        <h1 className="text-xl font-bold text-blue-900 mb-6 text-center">
          Selecciona método de pago para {transaction?.destination_country}
        </h1>

        {/* Lista de métodos guardados */}
        {methods.length > 0 ? (
          <div className="mb-4">
            {methods.map((m) => (
              <motion.div
                key={m.id}
                onClick={() => setSelectedMethod(m)}
                className={`p-4 mb-2 border rounded-xl cursor-pointer ${
                  selectedMethod?.id === m.id
                    ? "border-blue-900 bg-blue-100"
                    : "border-gray-300 bg-white"
                }`}
              >
                <p><strong>{m.method}</strong></p>
                <p>Titular: {m.data?.holder_name}</p>
                <p>Número / Cuenta: {m.data?.account_number}</p>
                <p>Banco / Plataforma: {m.data?.bank || m.data?.platform}</p>
                <p>Documento: {m.data?.document_type} {m.data?.document_number}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mb-4">
            No hay métodos registrados.
          </p>
        )}

        <button
          className="w-full py-2 mb-4 bg-green-600 text-white rounded-xl"
          onClick={openAddMethodModal}
        >
          Agregar método de pago
        </button>
{/* ===== MODAL OPTIMIZADO CON REGLAS DE BANCO Y MÓVIL ===== */}
{showMethodModal && (
  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4 pt-6 pb-20">
    {/* Contenedor del modal */}
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-center">Selecciona método de pago</h2>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
        {/* pb-32 deja espacio para los botones */}

        {/* Métodos en 2 columnas */}
        <div className="grid grid-cols-2 gap-3">
          {METHODS_BY_COUNTRY(transaction?.destination_country).map((method) => (
            <button
              key={method}
              onClick={() => chooseMethodType(method)}
              className={`p-3 rounded-xl border text-center ${
                selectedMethodType === method
                  ? "border-blue-900 bg-blue-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-semibold">
                {method.slice(0, 2).toUpperCase()}
              </div>
              <div className="font-medium">{method}</div>
            </button>
          ))}
        </div>

        {/* Formulario */}
        {selectedMethodType && (
          <div className="space-y-2">
            <h3 className="font-medium">Datos — {selectedMethodType}</h3>

            <input
              type="text"
              placeholder="Titular"
              className="w-full p-2 border rounded"
              value={newMethodData.holder_name}
              onChange={(e) =>
                setNewMethodData({ ...newMethodData, holder_name: e.target.value })
              }
            />

            <select
              className="w-full p-2 border rounded"
              value={newMethodData.document_type}
              onChange={(e) =>
                setNewMethodData({ ...newMethodData, document_type: e.target.value })
              }
            >
              <option value="">Tipo de documento</option>
              <option value="CC">Cédula</option>
              <option value="CE">Cédula extranjera</option>
              <option value="PAS">Pasaporte</option>
            </select>

            <input
              type="text"
              placeholder="Número de documento"
              className="w-full p-2 border rounded"
              value={newMethodData.document_number}
              onChange={(e) =>
                setNewMethodData({ ...newMethodData, document_number: e.target.value })
              }
            />

            <input
              type="text"
              placeholder={
                selectedMethodType === "Pago móvil"
                  ? "Teléfono"
                  : isBankTransfer(selectedMethodType)
                  ? "Número de cuenta"
                  : "Identificador / correo"
              }
              className="w-full p-2 border rounded"
              value={newMethodData.account_number}
              onChange={(e) =>
                setNewMethodData({ ...newMethodData, account_number: e.target.value })
              }
            />

            {/* Selecciona banco */}
            {((isBankTransfer(selectedMethodType) || selectedMethodType === "Pago móvil") &&
              !(transaction.destination_country === "CO" && selectedMethodType === "Bancolombia")) && (
              <select
                className="w-full p-2 border rounded"
                value={newMethodData.bank}
                onChange={(e) =>
                  setNewMethodData({ ...newMethodData, bank: e.target.value })
                }
              >
                <option value="">Selecciona banco</option>
                {(BANKS_BY_COUNTRY[transaction?.destination_country] || []).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            )}

            {/* Tipo de cuenta */}
            {(isBankTransfer(selectedMethodType) || 
              (transaction.destination_country === "CO" && selectedMethodType === "Bancolombia")) && (
              <select
                className="w-full p-2 border rounded"
                value={newMethodData.account_type}
                onChange={(e) =>
                  setNewMethodData({ ...newMethodData, account_type: e.target.value })
                }
              >
                <option value="">Tipo de cuenta</option>
                <option value="ahorro">Ahorro</option>
                <option value="corriente">Corriente</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* Botones fijos al final */}
      <div className="px-6 py-4 border-t bg-white flex gap-3">
        <button
          className="flex-1 py-2 bg-gray-200 rounded-xl"
          onClick={cancelAddMethod}
        >
          Cancelar
        </button>
        <button
          className="flex-1 py-2 bg-blue-900 text-white rounded-xl"
          onClick={handleAddNewMethod}
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
)}




<button
          className="w-full py-3 bg-blue-700 text-white rounded-xl mt-4 font-semibold"
          onClick={handleContinue}
          disabled={!selectedMethod}
        >
          Continuar
        </button>
      </div>
    </Layout>
  );
};

export default PaymentDestinationScreen;
