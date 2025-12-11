import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const countryFlags = {
  CO: '🇨🇴',
  VE: '🇻🇪',
  US: '🇺🇸',
  PE: '🇵🇪',
  PA: '🇵🇦',
  EC: '🇪🇨',
};

const History = () => {
  const { transactions, user, fetchTransactions } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTransactions(user.id);
    }
  }, [user]);

  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '🌍';
    const upperCode = countryCode.toUpperCase();
    return countryFlags[upperCode] || '🌍';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Procesando':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Cancelada':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Procesando':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Cancelada':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleStatusClick = (transaction) => {
    switch (transaction.status) {
      case 'Procesando':
        navigate('/resumen-final', { state: { transactionId: transaction.id } });
        break;
      case 'Completado':
        navigate('/resumen-final', { state: { transactionId: transaction.id } });
        break;
      case 'Cancelada':
        window.open('https://wa.me/573025878591', '_blank');
        break;
      default:
        navigate(`/enviar-dinero/${transaction.id}`);
        break;
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Layout>
        <div className="px-6 py-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Historial</h1>
            <p className="text-gray-600">Tus transacciones aparecerán aquí</p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No hay transacciones
            </h3>
            <p className="text-gray-600">
              Cuando realices tu primer envío, aparecerá aquí
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 py-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Historial</h1>
          <p className="text-gray-600">{transactions.length} transacciones</p>
        </motion.div>

        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-2xl sm:text-3xl">
                    <span>{getCountryFlag(transaction.origin_country)}</span>
                    <span className="text-gray-400 text-xl">→</span>
                    <span>{getCountryFlag(transaction.destination_country)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 truncate max-w-[160px] sm:max-w-none">
                      {transaction.amount.toLocaleString()} → {transaction.received_amount.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString()} • {new Date(transaction.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  className={`flex flex-nowrap items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(transaction.status)} max-w-[120px] sm:max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap`}
                  onClick={() => handleStatusClick(transaction)}
                >
                  {getStatusIcon(transaction.status)}
                  <span className="text-xs sm:text-sm font-medium truncate">{transaction.status}</span>
                </button>
              </div>

              {/* 🔹 NUEVO: Mostrar referencia destino si existe */}
              {transaction.destination_reference_number && (
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-blue-50 rounded-xl mb-2">
                  <Hash className="w-4 h-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-blue-700">
                    Número de referencia:{" "}
                    <span className="font-mono font-medium">
                      {transaction.destination_reference_number}
                    </span>
                  </span>
                </div>
              )}

              {transaction.admin_reference_number && (
                <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    Referencia:{" "}
                    <span className="font-mono font-medium">
                      {transaction.admin_reference_number}
                    </span>
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default History;
