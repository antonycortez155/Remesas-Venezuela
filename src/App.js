import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import VerifyCode from './pages/VerifyCode';
import Login from './pages/Login';
import UpdatePassword from './pages/UpdatePassword';
import CompleteProfile from './pages/CompleteProfile';
import Home from './pages/Home';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminPanel from './pages/admin/AdminPanel';
import { motion } from 'framer-motion';

// --- Paso 1 a 5 del flujo de envíos ---
import Step1 from './pages/flows/SelectCountries';
import Step2 from './pages/flows/PaymentStep';
import Step3 from './pages/flows/PaymentDestinationScreen';
import Step4 from './pages/flows/PaymentSummaryStep';
import Step5 from './pages/flows/PantallaMetodoPago';
import ResumenFinal from './pages/ResumenFinal';

import ForgotPassword from './pages/ForgotPassword';
import VerifyResetCode from './pages/VerifyResetCode';
import ResetPassword from './pages/ResetPassword';

// Simulador de notificaciones push
const PushNotificationSimulator = () => {
  const { transactions } = useApp();

  useEffect(() => {
    if (transactions.length > 0) {
      const latestTransaction = transactions[0];
      if (latestTransaction.status === 'Procesando') {
        console.log(`[ADMIN NOTIFICATION] Nueva orden de ${latestTransaction.amount} ${latestTransaction.origin_country_code} a ${latestTransaction.destination_country_code}.`);
      } else if (latestTransaction.status === 'Completado') {
        if (Notification.permission === 'granted') {
          new Notification('¡Transacción Completada!', {
            body: `Tu envío de ${latestTransaction.amount} ha sido completado. Ref: ${latestTransaction.admin_reference_number || 'N/A'}`,
            icon: '/logo192.png'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('¡Transacción Completada!', {
                body: `Tu envío de ${latestTransaction.amount} ha sido completado. Ref: ${latestTransaction.admin_reference_number || 'N/A'}`,
                icon: '/logo192.png'
              });
            }
          });
        }
      }
    }
  }, [transactions]);

  return null;
};

// Ruta protegida para usuarios normales
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-blue-900 text-2xl font-bold"
        >
          Cargando...
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" />;
  if (user && (!user.first_name || !user.last_name)) return <Navigate to="/complete-profile" />;

  return children;
};

// Ruta protegida solo para administradores
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-blue-900 text-2xl font-bold"
        >
          Cargando...
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" />;

  if (!user) return null;

  console.log('Role del usuario:', user.role); // Depuración
  if (user.role?.toLowerCase().trim() !== 'administrador') {
    return <Navigate to="/home" />; // Redirige si no es admin
  }

  return children;
};

// Rutas principales
const AppRoutes = () => {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Welcome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/login" element={<Login />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />


      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-code" element={<VerifyResetCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* --- Flujo de envíos paso a paso --- */}
      <Route path="/send/step1" element={<ProtectedRoute><Step1 /></ProtectedRoute>} />
      <Route path="/send/step2" element={<ProtectedRoute><Step2 /></ProtectedRoute>} />
      <Route path="/send/step3" element={<ProtectedRoute><Step3 /></ProtectedRoute>} />
      <Route path="/send/step4" element={<ProtectedRoute><Step4 /></ProtectedRoute>} />
      <Route path="/send/step5" element={<ProtectedRoute><Step5 /></ProtectedRoute>} />

      <Route path="/resumen-final" element={<ProtectedRoute><ResumenFinal /></ProtectedRoute>} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    if ('Notification' in window) Notification.requestPermission();
  }, []);

  return (
    <AppProvider>
      <Router>
        <PushNotificationSimulator />
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
