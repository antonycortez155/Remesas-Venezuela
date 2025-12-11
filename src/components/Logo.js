import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 'large', className = '' }) => {
  const sizes = {
    small: 'w-32',
    medium: 'w-48',
    large: 'w-64',
    xlarge: 'w-80'
  };

  return (
    <motion.div 
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-6 rounded-3xl shadow-2xl mb-4 flex flex-col items-center"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >

        {/* Texto REMESAS */}
        <div className="text-center font-extrabold">
          <div className={`text-white leading-tight text-6xl`}>
            REMESAS
          </div>
        </div>

        {/* Logo de VENEZUELA como imagen */}
        <img 
  src="/assets/VenezuelaLogo.png"
  alt="Venezuela Logo"
  className="mt-2 select-none"
  style={{
    width: "90%",      // Ajusta entre 60% - 90% según tu gusto
    maxWidth: "360px", // Tamaño máximo del logo
    height: "auto"
  }}
/>

      </motion.div>

      {/* Barras inferiores */}
      <motion.div 
        className="flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-8 h-2 bg-yellow-400 rounded-full"></div>
        <div className="w-8 h-2 bg-blue-900 rounded-full"></div>
        <div className="w-8 h-2 bg-red-600 rounded-full"></div>
      </motion.div>
    </motion.div>
  );
};

export default Logo;
