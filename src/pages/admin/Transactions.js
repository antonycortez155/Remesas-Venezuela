// src/pages/admin/Transactions.js
import React, { useEffect, useState } from 'react';
import {
  Search,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

/* eslint-disable react-hooks/exhaustive-deps */

// Mapa simple de banderas por código
const countryFlags = {
  CO: '🇨🇴',
  VE: '🇻🇪',
  US: '🇺🇸',
  PE: '🇵🇪',
  PA: '🇵🇦',
  EC: '🇪🇨'
};

const STATUS_COLORS = {
  Procesando: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Completado: 'bg-green-50 text-green-700 border-green-200',
  Cancelada: 'bg-red-50 text-red-700 border-red-200',
  Creando: 'bg-gray-50 text-gray-700 border-gray-200',
  'En pago': 'bg-blue-50 text-blue-700 border-blue-200'
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userPaymentMethods, setUserPaymentMethods] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // ===========================
  // Utilidades
  // ===========================
  const formatCurrency = (value, locale = 'es-CO', currency = 'USD') => {
    if (value == null) return '-';
    try {
      return Number(value).toLocaleString(locale, { style: 'currency', currency });
    } catch {
      return Number(value).toLocaleString();
    }
  };

  const getFlag = (code) => {
    if (!code) return '🌍';
    const c = code.toUpperCase();
    return countryFlags[c] || '🌍';
  };

  // ===========================
  // Cargar transacciones
  // ===========================
  const fetchTransactions = async () => {
    console.log("🔵 [Admin/Transactions] fetchTransactions: iniciando");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ [Admin/Transactions] fetchTransactions error:", error);
        setTransactions([]);
        setFiltered([]);
      } else {
        console.log("🟩 [Admin/Transactions] transacciones cargadas:", Array.isArray(data) ? data.length : data);
        setTransactions(data || []);
        setFiltered(data || []);
      }
    } catch (err) {
      console.error("🔥 [Admin/Transactions] fetchTransactions catch:", err);
      setTransactions([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);


// ===========================
  // Realtime listener
  // ===========================
  useEffect(() => {
    const channel = supabase
      .channel('transactions_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          const evt = payload.type;

          if (evt === 'INSERT') {
            setTransactions(prev => [payload.new, ...prev]);
            setFiltered(prev => [payload.new, ...prev]);
          }

          if (evt === 'UPDATE') {
            setTransactions(prev =>
              prev.map(t => (t.id === payload.new.id ? payload.new : t))
            );
            setFiltered(prev =>
              prev.map(t => (t.id === payload.new.id ? payload.new : t))
            );
          }

          if (evt === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
            setFiltered(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ===========================
  // Búsqueda
  // ===========================
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(transactions);
      setPage(1);
      return;
    }

    const q = search.toLowerCase();
    const result = transactions.filter(t => {
      const matchesId = String(t.id).includes(q);
      const matchesStatus = String(t.status || '').toLowerCase().includes(q);
      const matchesOrigin = String(t.origin_country || '').toLowerCase().includes(q);
      const matchesDest = String(t.destination_country || '').toLowerCase().includes(q);
      const matchesAmount = String(t.amount || '').includes(q);
      const matchesRef =
        String(t.payment_reference || '').toLowerCase().includes(q) ||
        String(t.admin_reference_number || '').toLowerCase().includes(q);

      return (
        matchesId ||
        matchesStatus ||
        matchesOrigin ||
        matchesDest ||
        matchesAmount ||
        matchesRef
      );
    });

    setFiltered(result);
    setPage(1);
  }, [search, transactions]);


// ===========================
  // Abrir detalles (cargar usuario y método de pago)
  // ===========================
  const openDetails = async (trx) => {
    console.log("🔵 openDetails() id=", trx?.id);
    setSelected(null);
    setDetailLoading(true);
    setUserInfo(null);
    setUserLoading(true);

    try {
      const { data: fresh, error: trxErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', trx.id)
        .single();

      if (trxErr || !fresh) {
        console.error("❌ openDetails: error cargando transacción:", trxErr);
        setSelected(null);
        setUserInfo(null);
        setUserLoading(false);
        setDetailLoading(false);
        return;
      }

      setSelected(fresh);

      if (fresh?.user_id) {
        try {
          const { data: usr, error: usrErr } = await supabase
            .from('users')
            .select('id, first_name, last_name, phone, email, country, created_at, role')
            .eq('id', fresh.user_id)
            .single();

          if (usrErr || !usr) {
            console.warn("⚠ openDetails: usuario no encontrado o error:", usrErr);
            setUserInfo(null);
          } else {
            setUserInfo(usr);
          }
        } catch (uErr) {
          console.error("🔥 openDetails fetch user catch:", uErr);
          setUserInfo(null);
        }
      } else {
        setUserInfo(null);
      }

      const { data: pay, error: payErr } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('id', fresh.payment_method_destination_id)
        .single();

      setUserPaymentMethods(payErr ? [] : [pay]);

    } catch (err) {
      console.error("🔥 openDetails catch:", err);
    } finally {
      setDetailLoading(false);
      setUserLoading(false);
    }
  };


// ===========================
  // Actualizar estado (con auditoría)
  // ===========================
  const updateStatus = async (id, newStatus, adminRef = null) => {
  setUpdating(true);
  try {
    const updatedAt = new Date().toISOString();

    const updateData = {
      status: newStatus,
      updated_at: updatedAt,
    };

    if (adminRef !== null) updateData.destination_reference_number = adminRef;

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

      if (error) {
        alert("Ocurrió un error al actualizar el estado. Revisa la consola.");
        setUpdating(false);
        return;
      }

      try {
        await supabase
          .from('transactions_audit')
          .insert({
            transaction_id: id,
            action: `Estado cambiado a "${newStatus}"`,
            admin: 'admin_panel',
            created_at: new Date().toISOString(),
          });
      } catch (auditErr) {
        console.error("❌ updateStatus auditoría error:", auditErr);
      }

      setTransactions(prev => prev.map(t => (t.id === id ? data : t)));
      setFiltered(prev => prev.map(t => (t.id === id ? data : t)));
      setSelected(prev => (prev && prev.id === id ? data : prev));

      alert(`✔ Estado actualizado a "${newStatus}"`);
    } catch (err) {
      console.error("🔥 updateStatus catch:", err);
    } finally {
      setUpdating(false);
    }
  };

  // ===========================
  // Paginación
  // ===========================
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));


return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <button
          className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          onClick={() => fetchTransactions()}
        >
          <RefreshCw className="w-4 h-4" /> Refrescar
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="flex items-center gap-2 mb-4 bg-white p-2 rounded-xl shadow">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por id, país, estado, referencia..."
          className="outline-none w-full"
        />
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Envío</th>
                  <th className="p-3 text-left">Usuario</th>
                  <th className="p-3 text-left">Monto → Recibe</th>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{t.id}</td>
                    <td className="p-3 flex items-center gap-2">
                      <span className="text-2xl">{getFlag(t.origin_country)}</span>
                      {t.origin_country}
                      <span className="text-gray-400">→</span>
                      <span className="text-2xl">{getFlag(t.destination_country)}</span>
                      {t.destination_country}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">{t.user_name || t.user_id}</div>
                      <div className="text-sm text-gray-600">{t.user_phone || '-'}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold">
                        {formatCurrency(t.amount, 'es-CO', t.origin_currency)} →{' '}
                        {formatCurrency(t.received_amount, 'es-CO', t.destination_currency)}
                      </div>
                      <div className="text-sm text-gray-600">Tasa: {t.rate}</div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{new Date(t.created_at).toLocaleString()}</td>
                    <td className="p-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${STATUS_COLORS[t.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {t.status === 'Completado' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : t.status === 'Procesando' ? (
                          <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm">{t.status}</span>
                      </div>
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg" onClick={() => openDetails(t)}>
                        <Eye className="w-4 h-4" /> Ver
                      </button>
                      <button className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg" onClick={() => updateStatus(t.id, 'Procesando')} disabled={updating}>
                        <CheckCircle className="w-4 h-4" /> Procesando
                      </button>
                      <button className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg" onClick={() => {
                        const phone = t.phone || null;
                        if (phone) window.open(`https://wa.me/${phone.replace(/\D/g, '')}`);
                        else alert('No hay teléfono disponible');
                      }}>
                        <MessageSquare className="w-4 h-4" /> WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">{filtered.length} resultados</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded">Anterior</button>
              <div className="px-3 py-1 bg-white border rounded">{page} / {totalPages}</div>
              <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-100 rounded">Siguiente</button>
            </div>
          </div>
        </>
      )}


{/* MODAL DETALLES */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl border border-gray-100
                       transform transition-all duration-300 scale-100 opacity-100 animate-fadeIn
                       max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ENCABEZADO */}
            <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-100 text-blue-700">#{selected.id}</span>
                  Detalles de la Transacción
                </h2>
                <p className="text-sm text-gray-500 mt-1">{new Date(selected.created_at).toLocaleString()}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

              {/* ORIGEN */}
              <div className="p-6 rounded-2xl shadow-inner bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Origen</p>
                <div className="mt-2 font-semibold text-xl flex items-center gap-2">
                  <span className="text-3xl">{getFlag(selected.origin_country)}</span>
                  {selected.origin_country}
                </div>
                <div className="mt-4 space-y-2 text-gray-700">
                  <p><strong>Monto:</strong> {formatCurrency(selected.amount, 'es-CO', selected.origin_currency)}</p>
                  <p><strong>Tasa:</strong> {selected.rate}</p>
                  <p><strong>Recibe:</strong> {formatCurrency(selected.received_amount, 'es-CO', selected.destination_currency)}</p>
                </div>
              </div>

              {/* DESTINO */}
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Destino</p>
                <div className="mt-1 font-semibold text-xl flex items-center gap-2">
                  <span className="text-3xl">{getFlag(selected.destination_country)}</span>
                  {selected.destination_country}
                </div>
                <div className="mt-4 space-y-1 text-gray-700">
                  <p><strong>Estado:</strong> {selected.status}</p>
                  <p><strong>Referencia Pago:</strong> {selected.payment_reference || '-'}</p>
                  <div className="mt-2">
                    <label className="text-sm font-medium">Ref. Admin:</label>
                    <input
                      type="text"
                      value={selected.destination_reference_number || ''}
                      onChange={(e) =>
                        setSelected((prev) => ({
                          ...prev,
                          destination_reference_number: e.target.value,
                        }))
                      }
                      className="mt-1 w-full px-3 py-2 border rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      placeholder="Ingrese referencia admin"
                    />
                  </div>
                  <p><strong>Moneda Origen:</strong> {selected.origin_currency}</p>
                  <p><strong>Moneda Destino:</strong> {selected.destination_currency}</p>
                  <p><strong>Notas:</strong> {selected.notes || '-'}</p>
                </div>
              </div>

              {/* USUARIO */}
              <div className="p-6 bg-gray-50 border rounded-2xl shadow-inner mt-4 mb-4 w-full">
                <h3 className="text-xl font-bold text-gray-800 mb-3">👤 Usuario</h3>
                {userLoading ? (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    Cargando información del usuario...
                  </div>
                ) : userInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                    <p><strong>Nombre:</strong> {userInfo.first_name} {userInfo.last_name}</p>
                    <p><strong>Teléfono:</strong> {userInfo.phone}</p>
                    <p><strong>Email:</strong> {userInfo.email || 'No registrado'}</p>
                    <p><strong>País:</strong> {userInfo.country}</p>
                    <p><strong>Registrado:</strong> {userInfo.created_at ? new Date(userInfo.created_at).toLocaleString() : '-'}</p>
                    <p><strong>Rol:</strong> {userInfo.role || 'Usuario'}</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No se encontró información del usuario.</div>
                )}
              </div>

              {/* MÉTODO DE PAGO */}
              <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-inner border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Método de pago de la transacción</h3>
                {detailLoading ? (
                  <div className="py-6 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : userPaymentMethods.length === 0 ? (
                  <div className="p-4 text-gray-600">No se encontró el método de pago.</div>
                ) : (
                  <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow space-y-4">
                    {(() => {
                      const trxMethod = userPaymentMethods[0];
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-blue-800 text-lg">{trxMethod.method} — {trxMethod.country_code}</p>
                              {trxMethod.instructions && (
                                <p className="text-sm text-gray-600">Instrucciones: {trxMethod.instructions}</p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{new Date(trxMethod.created_at).toLocaleString()}</div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {trxMethod.data &&
                              Object.entries(trxMethod.data)
                                .filter(([_, v]) => v)
                                .map(([k, v]) => {
                                  let label = k;
                                  if (k.toLowerCase().includes('phone')) label = 'Número de Cuenta';
                                  else if (k.toLowerCase().includes('titular')) label = 'Titular';
                                  else if (k.toLowerCase().includes('instructions')) label = 'Instrucciones';
                                  return <p key={k} className="text-gray-700"><strong>{label}:</strong> {v}</p>;
                                })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* BOTONES */}
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setSelected(null)} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl transition">Cerrar</button>
               <button
  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
  onClick={() => {
    updateStatus(selected.id, 'Completado', selected.destination_reference_number);
    setSelected(null);
  }}
  disabled={updating}
>
  Marcar Completado
</button>

<button
  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
  onClick={() => {
    updateStatus(selected.id, 'Cancelada', selected.destination_reference_number);
    setSelected(null);
  }}
  disabled={updating}
>
  Marcar Cancelada
</button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
