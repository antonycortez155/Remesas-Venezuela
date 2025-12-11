import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const METHOD_NAMES = {
  pagomovil: "Pago móvil",
  bank_transfer: "Transferencia bancaria",
  western: "Western",
  zelle: "Zelle",
  bancolombia: "Bancolombia",
  // agrega otros métodos que uses
};

const FIELD_LABELS = {
  holder_name: "Titular",
  document_type: "Tipo de documento",
  document_number: "Número de documento",
  account_number: "Número de cuenta / Teléfono / Identificador",
  bank: "Banco",
  account_type: "Tipo de cuenta",
  instructions: "Instrucciones",
};

export default function Step5() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId } = location.state;

  const [transaction, setTransaction] = useState(null);
  const [originMethod, setOriginMethod] = useState(null);
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);

      const { data: trx, error: trxError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (trxError) {
        console.error("Error cargando transacción:", trxError);
        setLoading(false);
        return;
      }

      setTransaction(trx);

      if (trx.payment_method_origin_id) {
        const { data: origin, error: originError } = await supabase
          .from("payment_methods_origin")
          .select("*")
          .eq("id", trx.payment_method_origin_id)
          .single();

        if (!originError) setOriginMethod(origin);
      }

      setLoading(false);
    };

    fetchTransaction();
  }, [transactionId]);

  const handlePaymentDone = async () => {
    if (!transaction) return;
    if (!reference.trim()) {
      alert("Debes ingresar la referencia de pago");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("transactions")
      .update({
        status: "Procesando",
        payment_reference: reference
      })
      .eq("id", transaction.id);

    setSubmitting(false);

    if (error) {
      console.error("Error actualizando transacción:", error);
      alert("Error al registrar la referencia de pago");
      return;
    }

    setShowBanner(true);

    setTimeout(() => {
      navigate("/history");
    }, 1500);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <p>Cargando...</p>;

  const renderField = (label, value) => {
    if (!value) return null;
    return (
      <p className="mb-2">
        <strong>{label}:</strong> {value}
      </p>
    );
  };

  const renderOriginFields = (data) => {
    if (!data) return null;

    const methodName = METHOD_NAMES[data.method] || data.method;

    return (
      <>
        {renderField("Método de Pago", methodName)}
        {renderField("Instrucciones", data.instructions)}
        {Object.entries(data.data || {}).map(([key, value]) => {
          if (!value) return null;

          // No mostrar banco si es igual a método de pago
          if (key === "bank" && value === methodName) return null;

          const label = FIELD_LABELS[key] || key.replace("_", " ").toUpperCase();
          return renderField(label, value);
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen p-5 bg-gradient-to-b from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Realiza la transacción 💳
      </h1>

      {showBanner && (
        <div className="mb-6 p-4 bg-green-200 border-l-4 border-green-500 text-green-800 rounded-xl shadow-md">
          ¡Pago registrado correctamente! ✅
        </div>
      )}

      {originMethod && (
        <div className="p-6 bg-white shadow-lg rounded-2xl border border-blue-200 mb-6">
          <p className="font-semibold text-blue-700 mb-2">Método de Pago Origen</p>
          {renderOriginFields(originMethod)}
        </div>
      )}

      <div className="mb-6">
        <label className="block font-semibold text-blue-700 mb-2">Referencia de pago</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full p-3 rounded-2xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ingresa la referencia de pago"
        />
      </div>

      <div className="flex justify-between">
        <button
          className="bg-gray-300 text-black py-2 px-5 rounded-2xl hover:bg-gray-400"
          onClick={handleBack}
        >
          Atrás
        </button>
        <button
          className={`bg-blue-700 text-white py-2 px-5 rounded-2xl hover:bg-blue-800 ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
          onClick={handlePaymentDone}
          disabled={submitting}
        >
          {submitting ? "Registrando..." : "Pago realizado"}
        </button>
      </div>
    </div>
  );
}
