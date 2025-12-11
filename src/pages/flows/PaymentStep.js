import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Layout from '../../components/Layout';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const PaymentStep = () => {
  const { updateTransactionStatus } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { transactionId } = location.state || {};

  const [transaction, setTransaction] = useState(null);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Cargar transacción ---
  useEffect(() => {
    if (!transactionId) return;

    const fetchTransaction = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (!error) setTransaction(data);
      setLoading(false);
    };

    fetchTransaction();
  }, [transactionId]);

  // --- Cargar métodos de pago según país origen ---
  useEffect(() => {
    if (!transaction?.origin_country) return;

    const fetchMethods = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods_origin')
        .select('*')
        .eq('country_code', transaction.origin_country);

      if (!error) setMethods(data);
      else setMethods([]);
      setLoading(false);
    };

    fetchMethods();
  }, [transaction]);

  const handleContinue = async () => {
    if (!selectedMethod) return alert('Selecciona un método de pago');

    setLoading(true);

    const { error } = await supabase
      .from('transactions')
      .update({ payment_method_origin_id: selectedMethod.id, status: 'Método seleccionado' })
      .eq('id', transactionId);

    if (!error) navigate('/send/step3', { state: { transactionId } });
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen text-blue-900 font-bold">
          Cargando...
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">
          No se pudo cargar la transacción.
        </div>
      </Layout>
    );
  }

  if (methods.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen text-red-500 font-bold">
          No hay métodos de pago disponibles para tu país de origen.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-8 max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-800 mb-8 text-center"
        >
          Selecciona un método de pago
        </motion.h2>

        <div className="space-y-4">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMethod(method)}
              className={`p-5 rounded-2xl border shadow-md text-center font-semibold text-lg cursor-pointer transition-all duration-200 ${
                selectedMethod?.id === method.id
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:shadow-lg'
              }`}
            >
              {method.method}
            </motion.div>
          ))}
        </div>

        <button
          className="w-full mt-8 bg-blue-900 text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-800 transition-colors"
          onClick={handleContinue}
        >
          Continuar
        </button>
      </div>
    </Layout>
  );
};

export default PaymentStep;
