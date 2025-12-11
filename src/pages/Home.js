import React from 'react';
import { motion } from 'framer-motion';
import { Send, Shield, Clock, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import Layout from '../components/Layout';

const Home = () => {
  const { user } = useApp();

  const features = [
    {
      icon: Send,
      title: 'Envíos Rápidos',
      description: 'Transfiere dinero en minutos a cualquier país'
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Tus transacciones están protegidas'
    },
    {
      icon: Clock,
      title: '24/7 Disponible',
      description: 'Envía dinero cuando lo necesites'
    },
    {
      icon: Globe,
      title: 'Cobertura Global',
      description: 'Conectamos países de América Latina'
    }
  ];

  return (
    <Layout>
      <div className="px-6 py-8">
        {/* Bienvenida */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Logo size="medium" className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {user ? `¡Bienvenido, ${user.first_name || 'Usuario'}!` : 'Cargando...'}
          </h1>
          <p className="text-gray-600">
            Tu plataforma confiable para envíos de dinero
          </p>
        </motion.div>

        {/* Banner */}
        <motion.div 
          className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-3xl p-6 mb-8 text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-2">Envía dinero hoy</h2>
          <p className="text-blue-100 mb-4">
            Las mejores tasas de cambio del mercado
          </p>
          <div className="flex gap-2">
            <div className="w-6 h-1 bg-yellow-400 rounded-full"></div>
            <div className="w-6 h-1 bg-blue-300 rounded-full"></div>
            <div className="w-6 h-1 bg-red-400 rounded-full"></div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-blue-900" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Sobre nosotros */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="font-bold text-gray-800 mb-4">Sobre Cambios A&V</h3>
          <p className="text-gray-600 leading-relaxed text-sm mb-4">
            Somos una casa de cambios especializada en remesas internacionales, 
            ofreciendo las mejores tasas y el servicio más confiable para conectar 
            a las familias latinoamericanas.
          </p>
          <div className="flex items-center gap-2 text-blue-900">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Licenciados y regulados</span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;