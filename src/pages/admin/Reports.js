// src/pages/admin/Reports.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    start: '',
    end: '',
    origin: '',
    destination: '',
  });

  const fetchTransactions = async () => {
    setLoading(true);

    let query = supabase.from('transactions').select('*');

    if (filters.start)
      query = query.gte('created_at', filters.start);
    if (filters.end)
      query = query.lte('created_at', filters.end);
    if (filters.origin)
      query = query.eq('origin_country', filters.origin);
    if (filters.destination)
      query = query.eq('destination_country', filters.destination);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo transacciones:', error);
      setLoading(false);
      return;
    }

    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ============================
  // EXPORTAR A CSV
  // ============================
  const exportCSV = () => {
    if (transactions.length === 0) return alert("No hay datos para exportar.");

    const header = Object.keys(transactions[0]).join(",");
    const rows = transactions.map(t =>
      Object.values(t).map(v => `"${v}"`).join(",")
    );

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "reporte_transacciones.csv";
    link.click();
  };

  // ============================
  // EXPORTAR A EXCEL
  // ============================
  const exportExcel = () => {
    if (transactions.length === 0) return alert("No hay datos para exportar.");

    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Transacciones");

    XLSX.writeFile(workbook, "reporte_transacciones.xlsx");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>

      {/* FILTROS */}
      <div className="bg-white shadow p-4 rounded-xl mb-5">
        <h2 className="text-lg font-semibold mb-3">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600">Desde</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={filters.start}
              onChange={(e) =>
                setFilters({ ...filters, start: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Hasta</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={filters.end}
              onChange={(e) =>
                setFilters({ ...filters, end: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">País origen</label>
            <input
              type="text"
              placeholder="Ej: Colombia"
              className="w-full p-2 border rounded"
              value={filters.origin}
              onChange={(e) =>
                setFilters({ ...filters, origin: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">País destino</label>
            <input
              type="text"
              placeholder="Ej: Venezuela"
              className="w-full p-2 border rounded"
              value={filters.destination}
              onChange={(e) =>
                setFilters({ ...filters, destination: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={fetchTransactions}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Aplicar filtros
        </button>
      </div>

      {/* BOTONES EXPORTAR */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Exportar CSV
        </button>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <FileSpreadsheet className="w-5 h-5" />
          Exportar Excel
        </button>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto bg-white shadow rounded-xl">
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Cliente</th>
                <th className="p-3 text-left">Origen</th>
                <th className="p-3 text-left">Destino</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{t.id}</td>
                  <td className="p-3">{t.user_name}</td>
                  <td className="p-3">{t.origin_country}</td>
                  <td className="p-3">{t.destination_country}</td>
                  <td className="p-3">{t.amount}</td>
                  <td className="p-3">{t.total}</td>
                  <td className="p-3">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-gray-500">
                    No hay resultados con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
