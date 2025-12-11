// src/pages/admin/Settings.js
import React from "react";

const Settings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Preferencias generales */}
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Preferencias generales</h2>
          <p className="text-gray-600 text-sm mb-4">
            Configuración básica del panel de administración.
          </p>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Nombre de la empresa</label>
            <input
              type="text"
              placeholder="Cambios A&V"
              className="border p-2 rounded-lg w-full"
            />

            <label className="text-sm font-medium">Correo de soporte</label>
            <input
              type="email"
              placeholder="soporte@cambiosayv.com"
              className="border p-2 rounded-lg w-full"
            />
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Seguridad</h2>
          <p className="text-gray-600 text-sm mb-4">
            Opciones para cambiar contraseña y manejar accesos.
          </p>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Nueva contraseña</label>
            <input
              type="password"
              className="border p-2 rounded-lg w-full"
              placeholder="••••••••"
            />

            <label className="text-sm font-medium">Confirmar contraseña</label>
            <input
              type="password"
              className="border p-2 rounded-lg w-full"
              placeholder="••••••••"
            />

            <button className="mt-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      {/* Sección avanzada */}
      <div className="mt-6 bg-white p-6 shadow rounded-xl">
        <h2 className="text-lg font-semibold mb-2">Opciones avanzadas</h2>
        <p className="text-gray-600 text-sm mb-4">
          Configuraciones técnicas del sistema.
        </p>

        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Reiniciar sistema
        </button>
      </div>
    </div>
  );
};

export default Settings;
