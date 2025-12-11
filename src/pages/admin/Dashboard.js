import React, { useEffect, useState } from 'react';
import { Activity, Users, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, transactions: 0, pending: 0, completed: 0 });
  const [recent, setRecent] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Métricas rápidas
      const usersRes = await supabase.from('users').select('id', { count: 'exact', head: true });
      const txRes = await supabase.from('transactions').select('id', { count: 'exact', head: true });
      const pendRes = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'Procesando');
      const completedRes = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'Completado');

      // Transacciones recientes
      const recentTx = await supabase
        .from('transactions')
        .select('id, user_id, origin_country, destination_country, amount, received_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(6);

      // Datos para gráfico de transacciones completadas últimos 7 días
      const chartTx = await supabase
        .from('transactions')
        .select('created_at')
        .eq('status', 'Completado')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Agrupar por día
      const counts = {};
      chartTx.data.forEach(tx => {
        const day = new Date(tx.created_at).toLocaleDateString();
        counts[day] = (counts[day] || 0) + 1;
      });
      const chartArray = Object.entries(counts).map(([day, count]) => ({ day, count }));

      setStats({
        users: usersRes.count || 0,
        transactions: txRes.count || 0,
        pending: pendRes.count || 0,
        completed: completedRes.count || 0
      });
      setRecent(recentTx.data || []);
      setChartData(chartArray);
    } catch (err) {
      console.error('Error cargando métricas del dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // carga inicial

    // Actualización en tiempo real cada 10 segundos
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-gray-600">Resumen rápido de la actividad</p>
      </header>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Usuarios</p>
            <p className="text-xl font-semibold">{loading ? '...' : stats.users.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-xl font-semibold">{loading ? '...' : stats.pending.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Transacciones</p>
            <p className="text-xl font-semibold">{loading ? '...' : stats.transactions.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Activity className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Completadas</p>
            <p className="text-xl font-semibold">{loading ? '...' : stats.completed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Gráfico de transacciones completadas */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="font-semibold mb-3">Transacciones completadas últimos 7 días</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transacciones recientes */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Transacciones recientes</h3>
          <button className="text-sm text-blue-700 hover:underline">Ver todo</button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="p-2">ID</th>
                  <th className="p-2">Usuario</th>
                  <th className="p-2">Ruta</th>
                  <th className="p-2">Monto</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-sm text-gray-500">No hay transacciones recientes</td></tr>
                )}
                {recent.map(tx => (
                  <tr key={tx.id} className="border-t">
                    <td className="p-2 text-sm text-gray-700">{tx.id}</td>
                    <td className="p-2 text-sm text-gray-700">{tx.user_id}</td>
                    <td className="p-2 text-sm text-gray-700">{tx.origin_country} → {tx.destination_country}</td>
                    <td className="p-2 text-sm text-gray-700">{Number(tx.amount).toLocaleString()}</td>
                    <td className="p-2 text-sm text-gray-700">{tx.status}</td>
                    <td className="p-2 text-sm text-gray-700">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
