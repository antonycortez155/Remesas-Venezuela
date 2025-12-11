import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";

// Map de nombres amigables de métodos
const METHOD_NAMES = {
  pagomovil: "Pago móvil",
  bank_transfer: "Transferencia bancaria",
  western: "Western",
  zelle: "Zelle",
  bancolombia: "Bancolombia",
  // agrega otros métodos que uses
};

// Map de etiquetas de campos
const FIELD_LABELS = {
  holder_name: "Titular",
  document_type: "Tipo de documento",
  document_number: "Número de documento",
  account_number: "Número de cuenta / Teléfono / Identificador",
  bank: "Banco",
  account_type: "Tipo de cuenta",
};

// Símbolos de moneda por país
const CURRENCY_BY_COUNTRY = {
  VE: "Bs",
  CO: "Pesos",
  PE: "S/.",
  US: "USD",
  PA: "USD",
  EC: "USD",
  // agrega otros países que uses
};

// Map de código país a nombre y bandera
const COUNTRY_INFO = {
  VE: { name: "Venezuela", flag: "🇻🇪" },
  CO: { name: "Colombia", flag: "🇨🇴" },
  PE: { name: "Perú", flag: "🇵🇪" },
  US: { name: "Estados Unidos", flag: "🇺🇸" },
  PA: { name: "Panamá", flag: "🇵🇦" },
  EC: { name: "Ecuador", flag: "🇪🇨" },
  // agrega otros países que uses
};

// Función para formatear montos según país
const formatCurrency = (amount, countryCode) => {
  if (!amount) return "";
  const symbol = CURRENCY_BY_COUNTRY[countryCode] || "$";

  // Formato de número con separador de miles y 2 decimales
  const formattedNumber = Number(amount).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol} ${formattedNumber}`;
};

// Función para mostrar nombre + bandera
const renderCountry = (countryCode) => {
  const info = COUNTRY_INFO[countryCode];
  if (!info) return countryCode;
  return (
    <span>
      {info.flag} {info.name}
    </span>
  );
};

export default function PaymentSummaryStep() {
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

  const handleContinue = async () => {
    if (!transaction) return;

    const { error } = await supabase
      .from("transactions")
      .update({ status: "en pago" })
      .eq("id", transaction.id);

    if (error) {
      console.error("Error actualizando status:", error);
      return;
    }

    navigate("/send/step5", { state: { transactionId: transaction.id } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <p>Cargando...</p>;

  const renderField = (label, value, country = null) => {
    if (!value) return null;
    const formatted = country ? formatCurrency(value, country) : value;
    return (
      <p className="mb-2">
        <strong>{label}:</strong> {formatted}
      </p>
    );
  };

  const renderDestinationFields = (data) => {
    if (!data) return null;

    return Object.entries(data).map(([key, value]) => {
      if (!value || key === "method") return null;

      const label = FIELD_LABELS[key] || key.replace("_", " ").toUpperCase();
      const formatted =
        typeof value === "number"
          ? formatCurrency(value, transaction.destination_country)
          : value;

      return (
        <p key={key}>
          <strong>{label}:</strong> {formatted}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen p-5 bg-gradient-to-b from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Resumen del Envío 💸
      </h1>

      {transaction && (
        <div className="p-6 bg-white shadow-lg rounded-2xl border border-blue-200">
          {transaction.origin_country && (
            <p className="mb-2">
              <strong>País de origen:</strong> {renderCountry(transaction.origin_country)}
            </p>
          )}
          {transaction.destination_country && (
            <p className="mb-2">
              <strong>País destino:</strong> {renderCountry(transaction.destination_country)}
            </p>
          )}
          {renderField("Monto enviado", transaction.amount, transaction.origin_country)}
          {renderField("Tasa", transaction.rate)}
          {renderField("Recibe", transaction.received_amount, transaction.destination_country)}

          {originMethod && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="font-semibold text-blue-700">Método de Pago Origen</p>
              {renderField("Método de Pago", METHOD_NAMES[originMethod.method] || originMethod.method)}
              {renderField("Titular", originMethod.holder_name)}
              {renderField("Número de documento", originMethod.document_number)}
              {renderField("Tipo de documento", originMethod.document_type)}
            </div>
          )}

          {destinationMethod && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="font-semibold text-blue-700">Método de Pago Destino</p>
              {renderField("Método de Pago", METHOD_NAMES[destinationMethod.method] || destinationMethod.method)}
              {renderDestinationFields(destinationMethod.data)}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              className="bg-gray-300 text-black py-2 px-5 rounded-xl hover:bg-gray-400"
              onClick={handleBack}
            >
              Atrás
            </button>
            <button
              className="bg-blue-700 text-white py-2 px-5 rounded-xl hover:bg-blue-800"
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
