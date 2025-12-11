// src/pages/admin/AdminPanel.js
import React, { useState } from 'react';
import { Users, Activity, DollarSign, BarChart2, LogOut, Settings as SettingsIcon } from 'lucide-react';

// Importación de las secciones reales
import Dashboard from "./Dashboard";
import UsersSection from "./Users";
import TransactionsSection from "./Transactions";
import RatesSection from "./Rates";
import ReportsSection from "./Reports";
import Settings from "./Settings";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const sections = [
    { key: 'dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
    { key: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5" /> },
    { key: 'transactions', label: 'Transacciones', icon: <DollarSign className="w-5 h-5" /> },
    { key: 'rates', label: 'Tasas', icon: <BarChart2 className="w-5 h-5" /> },
    { key: 'reports', label: 'Reportes', icon: <BarChart2 className="w-5 h-5" /> },
    { key: 'settings', label: 'Configuración', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;

      case 'users':
        return <UsersSection />;

      case 'transactions':
        return <TransactionsSection />;

      case 'rates':
        return <RatesSection />;

      case 'reports':
        return <ReportsSection />;

      case 'settings':
        return <Settings />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 font-bold text-xl border-b">Admin Panel</div>

        <nav className="flex-1 p-4 space-y-2">
          {sections.map(sec => (
            <button
              key={sec.key}
              className={`flex items-center gap-2 w-full p-2 rounded-lg text-left transition-all ${
                activeSection === sec.key
                  ? 'bg-blue-100 text-blue-900 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveSection(sec.key)}
            >
              {sec.icon} {sec.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="flex items-center gap-2 p-4 text-red-600 hover:bg-red-50 border-t">
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminPanel;
