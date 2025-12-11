import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getCountryCodeFromPhone } from '../utils/phoneUtils';
import bcrypt from 'bcryptjs';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // 📌 NUEVO (para reset password)
  const [resetPhone, setResetPhone] = useState(null);

  // ======== Login personalizado ========
  const login = async (identifier, password) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},phone.eq.${identifier}`)
        .single();

      if (error || !users) throw new Error('Correo o teléfono incorrecto.');

      const isValid = bcrypt.compareSync(password, users.password);
      if (!isValid) throw new Error('Contraseña incorrecta.');

      setUser(users);
      setIsAuthenticated(true);
      await fetchTransactions(users.id);

      return users;
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      throw err;
    }
  };

  // ======== Registro de usuario ========
  const register = async (userData, password) => {
    setLoading(true);
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const countryCode = getCountryCodeFromPhone(userData.phone);

      const { data: userProfile, error } = await supabase
        .from('users')
        .insert({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email,
          phone: userData.phone,
          country_code: countryCode,
          password: hashedPassword,
          is_verified: false
        })
        .select()
        .single();

      if (error) throw error;

      setUser(userProfile);
      setIsAuthenticated(true);
      return userProfile;
    } finally {
      setLoading(false);
    }
  };

  // ======== Cerrar sesión ========
  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setTransactions([]);
  };

  // ======== Transacciones ========
  const fetchTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) setTransactions(data);
    else if (error) console.error('Error obteniendo transacciones:', error);
  };

  const addTransaction = async (transactionData) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: transactionData.amount,
        received_amount: transactionData.receivedAmount,
        exchange_rate: transactionData.rate,
        origin_country_code: transactionData.originCountry,
        destination_country_code: transactionData.destinationCountry,
        payment_method_origin: transactionData.paymentMethodOrigin,
        payment_method_destination: transactionData.paymentMethodDestination,
        recipient_first_name: transactionData.recipient.firstName,
        recipient_last_name: transactionData.recipient.lastName,
        recipient_phone: transactionData.recipient.phone,
        recipient_email: transactionData.recipient.email,
        recipient_bank_name: transactionData.recipient.bankName,
        recipient_account_number: transactionData.recipient.accountNumber,
        recipient_id_number: transactionData.recipient.idNumber,
        payment_details_destination: transactionData.paymentDetailsDestination,
        client_reference_number: transactionData.clientReferenceNumber,
        status: 'Procesando'
      })
      .select();

    if (error) throw error;
    if (data && data.length > 0) {
      setTransactions(prev => [data[0], ...prev]);
      return data[0].id;
    }
    return null;
  };

  const updateTransactionStatus = async (id, status, adminReferenceNumber = null) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status, admin_reference_number: adminReferenceNumber, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (data && data.length > 0) {
      setTransactions(prev =>
        prev.map(tx => tx.id === id ? data[0] : tx)
      );
      return data[0];
    }
    return null;
  };

  const completeProfile = async (userId, firstName, lastName) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // 📌 NUEVO: Iniciar proceso de recuperación de contraseña
  // ====================================================
  const startPasswordReset = async (phone) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

    const { data: existing } = await supabase
      .from("pending_codes")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (existing) {
      await supabase.from("pending_codes").delete().eq("phone", phone);
    }

    const { error } = await supabase
      .from("pending_codes")
      .insert({
        phone,
        code,
        expires_at: expiresAt,
        password_hash: "RESET",
        country_code: getCountryCodeFromPhone(phone),
        country_name: "N/A",
        sent: true
      });

    if (error) throw error;

    setResetPhone(phone);
    return code;
  };

  // ====================================================
  // 📌 NUEVO: Verificar código desde BD
  // ====================================================
  const verifyResetCode = async (phone, code) => {
    const { data, error } = await supabase
      .from("pending_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .maybeSingle();

    if (error || !data) return false;

    if (new Date(data.expires_at) < new Date()) {
      await supabase.from("pending_codes").delete().eq("phone", phone);
      return false;
    }

    setResetPhone(phone);
    return true;
  };

  // ====================================================
  // 📌 NUEVO: Limpiar el proceso de reset
  // ====================================================
  const clearReset = async (phone) => {
    await supabase.from("pending_codes").delete().eq("phone", phone);
    setResetPhone(null);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    transactions,
    login,
    register,
    logout,
    addTransaction,
    updateTransactionStatus,
    fetchTransactions,
    completeProfile,

    // 🔥 NUEVO para reset password:
    resetPhone,
    setResetPhone, // 🔥 AGREGADO AQUÍ (ÚNICO CAMBIO)
    startPasswordReset,
    verifyResetCode,
    clearReset
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
