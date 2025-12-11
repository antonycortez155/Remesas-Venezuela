// src/pages/admin/Users.js
import React, { useEffect, useState } from 'react';
import { Search, Loader2, X, Phone, ClipboardList } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    handleSearch(search);
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, phone, role, created_at')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error cargando usuarios:', error);
      setLoading(false);
      return;
    }

    setUsers(data);
    setFiltered(data);
    setLoading(false);
  };

  const fetchUserTransactions = async (userId) => {
    setLoadingTx(true);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });

    if (error) {
      console.error("Error cargando envíos:", error);
      setLoadingTx(false);
      return;
    }

    setTransactions(data);
    setLoadingTx(false);
  };

  const openModal = (user) => {
    setSelectedUser(user);
    fetchUserTransactions(user.id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setTransactions([]);
  };

  const handleSearch = (text) => {
    setSearch(text);

    if (!text.trim()) {
      setFiltered(users);
      return;
    }

    const filteredResults = users.filter(u =>
      (u.first_name + ' ' + u.last_name).toLowerCase().includes(text.toLowerCase()) ||
      u.phone.includes(text)
    );

    setFiltered(filteredResults);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      {/* Buscador */}
      <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-xl shadow">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          className="flex-1 outline-none"
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* Cargando */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Tabla */}
      {!loading && (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Teléfono</th>
                <th className="p-3 text-left">Rol</th>
                <th className="p-3 text-left">Registro</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(user => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openModal(user)}
                >
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.first_name} {user.last_name}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3 font-semibold">
  <select
    value={user.role}
    onChange={async (e) => {
      const newRole = e.target.value;

      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) {
        alert("Error actualizando el rol");
        console.error(error);
        return;
      }

      // Actualizar en frontend sin recargar
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u))
      );

      setFiltered(prev =>
        prev.map(u => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    }}
    className={`border p-2 rounded-lg ${
      user.role === "administrador"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    <option value="usuario">Usuario</option>
    <option value="administrador">Administrador</option>
  </select>
</td>
                  <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-lg flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/${user.phone}`, "_blank");
                      }}
                    >
                      <Phone className="w-4 h-4" /> WhatsApp
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-5 text-center text-gray-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
            {/* Cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Info */}
            <h2 className="text-xl font-bold mb-2">
              {selectedUser.first_name} {selectedUser.last_name}
            </h2>

            <p className="text-gray-600 mb-1">
              <b>Teléfono:</b> {selectedUser.phone}
            </p>

            <p className="text-gray-600 mb-1">
              <b>Rol:</b> {selectedUser.role}
            </p>

            <p className="text-gray-600 mb-4">
              <b>Registrado:</b> {new Date(selectedUser.created_at).toLocaleDateString()}
            </p>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${selectedUser.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg w-full justify-center mb-4"
            >
              <Phone className="w-5 h-5" /> Enviar WhatsApp
            </a>

            {/* Envíos */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Envíos del usuario
              </h3>

              {loadingTx ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : transactions.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {transactions.map(tx => (
                    <li key={tx.id} className="bg-gray-100 p-3 rounded-lg">
                      <p><b>ID:</b> {tx.id}</p>
                      <p><b>Monto:</b> {tx.amount}</p>
                      <p><b>País:</b> {tx.origin_country} → {tx.destination_country}</p>
                      <p><b>Fecha:</b> {new Date(tx.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No tiene envíos registrados.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
