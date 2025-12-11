import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Globe, FileText, Shield, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const profileItems = [
    { icon: User, label: 'Nombre completo', value: `${user?.first_name} ${user?.last_name}` },
    { icon: Mail, label: 'Correo electrónico', value: user?.email },
    { icon: Phone, label: 'Teléfono', value: user?.phone },
    { icon: Globe, label: 'País', value: user?.country || 'No registrado' }
  ];

  const menuItems = [
    { icon: FileText, label: 'Términos y Condiciones', action: () => {} },
    { icon: Shield, label: 'Políticas de Seguridad', action: () => {} },
    // Botón de administrador solo si el rol es administrador
    ...(user?.role?.toLowerCase() === 'administrador'
      ? [{ icon: Settings, label: 'Modo Administrador', action: handleAdminPanel, blue: true }]
      : []),
    { icon: LogOut, label: 'Cerrar Sesión', action: handleLogout, danger: true }
  ];

  return (
    <Layout>
      <div className="px-6 py-8">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {user?.first_name} {user?.last_name}
          </h1>
          <p className="text-gray-600">Miembro verificado</p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold text-gray-800 mb-4">Información Personal</h2>
          <div className="space-y-4">
            {profileItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-900" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <p className="font-medium text-gray-800">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="font-semibold text-gray-800 mb-4">Configuración</h2>
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    item.danger
                      ? 'hover:bg-red-50 text-red-600'
                      : item.blue
                      ? 'hover:bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Icon className={`w-5 h-5 ${item.danger ? 'text-red-500' : item.blue ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;