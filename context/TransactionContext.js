import React, { createContext, useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";

export const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Track current user and reload data on auth change
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadData(uid);
      else {
        setTransactions([]);
        setCustomCategories([]);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadData(uid);
      else {
        setTransactions([]);
        setCustomCategories([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async (uid) => {
    setIsLoading(true);
    try {
      const [{ data: txData, error: txError }, { data: catData, error: catError }] =
        await Promise.all([
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", uid)
            .order("timestamp", { ascending: false }),
          supabase
            .from("categories")
            .select("*")
            .eq("user_id", uid),
        ]);

      if (txError) throw txError;
      if (catError) throw catError;

      setTransactions(txData ?? []);
      setCustomCategories(
        (catData ?? []).map((c) => ({ name: c.name, icon: c.icon, color: c.color }))
      );
    } catch (error) {
      console.error("Error loading data:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (title, amount, type, category, selectedDate = null) => {
    if (!userId) return;
    const transactionDate = selectedDate || new Date();
    const newTransaction = {
      user_id: userId,
      title,
      amount: parseFloat(amount),
      type,
      category,
      timestamp: transactionDate.getTime(),
      date: format(transactionDate, "d MMM, h:mm a"),
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert(newTransaction)
      .select()
      .single();

    if (error) { console.error("Error adding transaction:", error.message); return; }
    setTransactions((prev) => [data, ...prev]);
  };

  const updateTransaction = async (id, title, amount, type, category, selectedDate = null) => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return;

    const transactionDate = selectedDate || new Date(existing.timestamp);
    const updated = {
      title,
      amount: parseFloat(amount),
      type,
      category,
      timestamp: transactionDate.getTime(),
      date: format(transactionDate, "d MMM, h:mm a"),
    };

    const { data, error } = await supabase
      .from("transactions")
      .update(updated)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) { console.error("Error updating transaction:", error.message); return; }
    setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) { console.error("Error deleting transaction:", error.message); return; }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addCategory = async (newCategory) => {
    const exists = customCategories.some(
      (cat) => cat.name.toLowerCase() === newCategory.name.toLowerCase()
    );
    if (exists) return false;

    const { error } = await supabase
      .from("categories")
      .insert({ user_id: userId, name: newCategory.name, icon: newCategory.icon, color: newCategory.color, type: newCategory.type });

    if (error) { console.error("Error adding category:", error.message); return false; }
    setCustomCategories((prev) => [...prev, newCategory]);
    return true;
  };

  const deleteCategory = async (categoryName) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("user_id", userId)
      .eq("name", categoryName);

    if (error) { console.error("Error deleting category:", error.message); return; }
    setCustomCategories((prev) => prev.filter((cat) => cat.name !== categoryName));
  };

  const refresh = () => {
    if (userId) loadData(userId);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        customCategories,
        addCategory,
        deleteCategory,
        isLoading,
        refresh,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
