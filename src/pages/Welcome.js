import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Layout from '../components/Layout';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Logo size="xlarge" className="mb-8" />
          
          <motion.h1 
            className="text-2xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Envía dinero de forma segura
          </motion.h1>
          
          <motion.p 
            className="text-gray-600 mb-12 max-w-sm mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            La forma más rápida y confiable de enviar dinero a tus seres queridos en toda América Latina
          </motion.p>

          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button
              onClick={() => navigate('/register')}
              className="w-full bg-blue-900 text-white py-4 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Crear mi Cuenta
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/login')}
              className="w-full bg-white text-blue-900 py-4 px-8 rounded-2xl font-semibold border-2 border-blue-900 hover:bg-blue-50 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ya tengo Cuenta
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Welcome;