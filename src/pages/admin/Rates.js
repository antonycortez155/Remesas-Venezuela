// src/pages/admin/Rates.js

import React, { useEffect, useState } from 'react';
import { Loader2, Pencil, Save, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { countries } from '../../data/countries';

// Función para mostrar bandera + nombre
const getCountryInfo = (code) => {
  const c = countries.find(ct => ct.code === code);
  return c ? `${c.flag} ${c.name}` : code;
};

const Rates = () => {
  const [rates, setRates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [Loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    console.log('[Rates] fetchRates: iniciando');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('rates')
        .select('*')
        .order('origin_country', { ascending: true });

      if (error) {
        console.error('[Rates] fetchRates error:', error);
        setRates([]);
      } else {
        console.log('[Rates] fetchRates OK, filas:', data?.length);
        setRates(data || []);
      }
    } catch (err) {
      console.error('[Rates] fetchRates excepción:', err);
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    console.log('[Rates] startEdit:', item);
    setEditingId(item.id);
    setEditingData({
      rate: item.rate,
      operation: item.operation || 'multiply',
      currency: item.currency || ''
    });
  };

  const cancelEdit = () => {
    console.log('[Rates] cancelEdit editingId:', editingId);
    setEditingId(null);
    setEditingData({});
  };

  const onChangeEditing = (field, value) => {
    console.log('[Rates] onChangeEditing', field, value);
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  const saveRate = async () => {
    if (!editingId) return;

    const { rate, operation, currency } = editingData;

    if (rate === '' || rate === null || isNaN(Number(rate))) {
      alert('La tasa debe ser un número válido.');
      return;
    }

    if (!operation) {
      alert('Selecciona la operación.');
      return;
    }

    setSaving(true);
    console.log('[Rates] saveRate: guardando', { id: editingId, rate, operation, currency });

    try {
      const { error } = await supabase
        .from('rates')
        .update({
          rate: Number(rate),
          operation,
          currency: currency || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) {
        console.error('[Rates] saveRate error:', error);
        alert('Error guardando tasa. Revisa la consola.');
        return;
      }

      setRates(prev =>
        prev.map(r =>
          r.id === editingId ? { ...r, rate: Number(rate), operation, currency } : r
        )
      );

      console.log('[Rates] saveRate OK — fila actualizada');

      setEditingId(null);
      setEditingData({});
    } catch (err) {
      console.error('[Rates] saveRate excepción:', err);
      alert('Error guardando tasa (excepción). Revisa la consola.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Tasas</h1>

      {Loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!Loading && (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">País Origen</th>
                <th className="p-3 text-left">País Destino</th>
                <th className="p-3 text-left">Tasa</th>
                <th className="p-3 text-left">Operación</th>
                <th className="p-3 text-left">Moneda</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {rates.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  
                  {/* PAÍS ORIGEN */}
                  <td className="p-3 font-semibold">
                    {getCountryInfo(item.origin_country)}
                  </td>

                  {/* PAÍS DESTINO */}
                  <td className="p-3 font-semibold">
                    {getCountryInfo(item.destination_country)}
                  </td>

                  {/* TASA */}
                  <td className="p-3">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        step="any"
                        className="border p-2 rounded w-28"
                        value={editingData.rate}
                        onChange={(e) => onChangeEditing('rate', e.target.value)}
                      />
                    ) : (
                      <span className="font-semibold">{item.rate}</span>
                    )}
                  </td>

                  {/* OPERACIÓN */}
                  <td className="p-3">
                    {editingId === item.id ? (
                      <select
                        className="border p-2 rounded"
                        value={editingData.operation}
                        onChange={(e) => onChangeEditing('operation', e.target.value)}
                      >
                        <option value="multiply">Multiplica</option>
                        <option value="divide">Divide</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-xl text-sm font-semibold ${
                          item.operation === 'multiply'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.operation === 'multiply' ? 'Multiplica' : 'Divide'}
                      </span>
                    )}
                  </td>

                  {/* CURRENCY */}
                  <td className="p-3">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        className="border p-2 rounded w-28"
                        value={editingData.currency || ''}
                        onChange={(e) => onChangeEditing('currency', e.target.value)}
                      />
                    ) : (
                      <span className="text-sm">{item.currency || '-'}</span>
                    )}
                  </td>

                  {/* ACCIONES */}
                  <td className="p-3">
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <button
                          className={`flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 ${
                            saving ? 'opacity-60' : ''
                          }`}
                          onClick={saveRate}
                          disabled={saving}
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>

                        <button
                          className="flex items-center gap-1 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4" /> Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        className="flex items-center gap-1 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300"
                        onClick={() => startEdit(item)}
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {rates.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-5 text-center text-gray-500">
                    No hay tasas registradas.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default Rates;
