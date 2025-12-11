import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const countryFlags = {
  CO: "🇨🇴",
  VE: "🇻🇪",
  US: "🇺🇸",
  PE: "🇵🇪",
  PA: "🇵🇦",
  EC: "🇪🇨",
};

const countryNames = {
  CO: "Colombia",
  VE: "Venezuela",
  US: "Estados Unidos",
  PE: "Perú",
  PA: "Panamá",
  EC: "Ecuador",
};

const METHOD_NAMES = {
  pagomovil: "Pago móvil",
  bank_transfer: "Transferencia bancaria",
  western: "Western",
  zelle: "Zelle",
  bancolombia: "Bancolombia",
  nequi: "Nequi",
};

const FIELD_LABELS = {
  holder_name: "Titular",
  document_type: "Tipo de documento",
  document_number: "Número de documento",
  account_number: "Número de cuenta",
  bank: "Banco",
  account_type: "Tipo de cuenta",
  phone: "Número de cuenta",
};

const formatCurrency = (amount, countryCode) => {
  if (!amount) return "";
  switch (countryCode) {
    case "VE":
      return `Bs ${Number(amount).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "CO":
      return `Pesos ${Number(amount).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "PE":
      return `S/ ${Number(amount).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "US":
    case "PA":
      return `USD ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "EC":
      return `USD ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

export default function ResumenFinal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId } = location.state;

  const [transaction, setTransaction] = useState(null);
  const [originMethod, setOriginMethod] = useState(null);
  const [destinationMethod, setDestinationMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);

      // Traer transacción
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

      // Método de origen
      if (trx.payment_method_origin_id) {
        const { data: origin, error: originError } = await supabase
          .from("payment_methods_origin")
          .select("*")
          .eq("id", trx.payment_method_origin_id)
          .single();

        if (!originError) setOriginMethod(origin);
      }

      // Método de destino
      if (trx.payment_method_destination_id) {
        const { data: dest, error: destError } = await supabase
          .from("user_payment_methods")
          .select("*")
          .eq("id", trx.payment_method_destination_id)
          .single();

        if (!destError) setDestinationMethod(dest);
      }

      setLoading(false);
    };

    fetchTransaction();
  }, [transactionId]);

  const handleBack = () => {
    navigate(-1);
  };

  const renderFields = (data) => {
    if (!data) return null;
    return Object.entries(data).map(([key, value]) => {
      if (!value) return null;

      let label = FIELD_LABELS[key] || key.replace("_", " ").toUpperCase();

      // No mostrar Banco si es igual al método de pago
      if (key === "bank" && value === (data.method || "")) return null;

      // Cambiar phone a Número de cuenta
      if (key.toLowerCase() === "phone") label = "Número de cuenta";

      return (
        <p key={key}>
          <strong>{label}:</strong> {value}
        </p>
      );
    });
  };

  if (loading) return <p className="text-center mt-20">Cargando...</p>;

  return (
    <div className="min-h-screen p-5 bg-gradient-to-b from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">
        Resumen Final
      </h1>

      {transaction && (
        <div className="p-6 bg-white shadow-md rounded-2xl border max-w-xl mx-auto space-y-4">

          {/* Transacción exitosa */}
          {transaction.destination_reference_number && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 font-semibold text-lg">
                ✅ ¡Transacción exitosa!
              </p>
              <p className="text-green-800 mt-1">
                <strong>Número de referencia:</strong>{" "}
                {transaction.destination_reference_number}
              </p>
            </div>
          )}

          <p>
            <strong>País de origen:</strong>{" "}
            {countryFlags[transaction.origin_country]} {countryNames[transaction.origin_country]}
          </p>

          <p>
            <strong>País destino:</strong>{" "}
            {countryFlags[transaction.destination_country]} {countryNames[transaction.destination_country]}
          </p>

          <p>
            <strong>Monto enviado:</strong>{" "}
            {formatCurrency(transaction.amount, transaction.origin_country)}
          </p>

          <p>
            <strong>Tasa:</strong> {transaction.rate}
          </p>

          <p>
            <strong>Recibe:</strong>{" "}
            {formatCurrency(transaction.received_amount, transaction.destination_country)}
          </p>

          {/* Método de pago origen */}
          {originMethod && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
              <p className="font-semibold text-blue-700 mb-2">Método de Pago Origen</p>
              <p><strong>Método de Pago:</strong> {METHOD_NAMES[originMethod.method] || originMethod.method}</p>
              {originMethod.instructions && (
                <p><strong>Instrucciones:</strong> {originMethod.instructions}</p>
              )}
              {renderFields(originMethod.data)}
            </div>
          )}

          {/* Método de pago destino */}
          {destinationMethod && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
              <p className="font-semibold text-blue-700 mb-2">Método de Pago Destino</p>
              <p><strong>Método de Pago:</strong> {METHOD_NAMES[destinationMethod.method] || destinationMethod.method}</p>
              {destinationMethod.instructions && (
                <p><strong>Instrucciones:</strong> {destinationMethod.instructions}</p>
              )}
              {renderFields(destinationMethod.data)}
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              className="bg-gray-300 text-black py-2 px-6 rounded-xl hover:bg-gray-400 transition"
              onClick={handleBack}
            >
              Atrás
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
