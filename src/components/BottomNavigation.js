import React from 'react';
import { motion } from 'framer-motion';
import { Home, History, Send, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/home' },
    { icon: History, label: 'Historial', path: '/history' },

    { icon: Send, label: 'Enviar', path: '/send/step1', primary: true },

    { icon: MessageCircle, label: 'Soporte', path: '/support' },
    { icon: User, label: 'Perfil', path: '/profile' }
  ];

  const handleNavigation = (path, label) => {
    if (label === 'Soporte') {
      window.open('https://wa.me/573025878591', '_blank');
      return;
    }
    navigate(path);
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path) && item.path !== '/send' || location.pathname === '/send' && item.path === '/send';
          const isPrimary = item.primary;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigation(item.path, item.label)}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                isPrimary
                  ? 'bg-blue-900 text-white shadow-lg'
                  : isActive
                  ? 'bg-blue-50 text-blue-900'
                  : 'text-gray-500 hover:text-blue-900 hover:bg-blue-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Icon className={`w-5 h-5 mb-1 ${isPrimary ? 'text-white' : ''}`} />
              <span className={`text-xs font-medium ${isPrimary ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNavigation;