import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, subDays, subMonths } from "date-fns";

const TRANSACTIONS_STORAGE_KEY = "@budget_tracker_transactions";
const CATEGORIES_STORAGE_KEY = "@budget_tracker_categories";

export const TransactionContext = createContext();

// Generate sample transactions across multiple months for demo
const generateSampleTransactions = () => {
  const now = new Date();

  return [
    // Current month
    {
      id: "1",
      title: "Groceries",
      date: format(now, "d MMM, h:mm a"),
      timestamp: now.getTime(),
      amount: 200,
      type: "expense",
      category: "Groceries",
    },
    {
      id: "2",
      title: "Taxi",
      date: format(subDays(now, 1), "d MMM, h:mm a"),
      timestamp: subDays(now, 1).getTime(),
      amount: 150,
      type: "expense",
      category: "Travel",
    },
    {
      id: "3",
      title: "Salary",
      date: format(subDays(now, 3), "d MMM, h:mm a"),
      timestamp: subDays(now, 3).getTime(),
      amount: 50000,
      type: "income",
      category: "Salary",
    },
    // Last month
    {
      id: "4",
      title: "Rent",
      date: format(subMonths(now, 1), "d MMM, h:mm a"),
      timestamp: subMonths(now, 1).getTime(),
      amount: 15000,
      type: "expense",
      category: "Rent",
    },
    {
      id: "5",
      title: "Electricity Bill",
      date: format(subMonths(now, 1), "d MMM, h:mm a"),
      timestamp: subMonths(now, 1).getTime(),
      amount: 2500,
      type: "expense",
      category: "Home",
    },
    {
      id: "6",
      title: "Last Month Salary",
      date: format(subMonths(now, 1), "d MMM, h:mm a"),
      timestamp: subMonths(now, 1).getTime(),
      amount: 50000,
      type: "income",
      category: "Salary",
    },
    // 2 months ago
    {
      id: "7",
      title: "Shopping",
      date: format(subMonths(now, 2), "d MMM, h:mm a"),
      timestamp: subMonths(now, 2).getTime(),
      amount: 5000,
      type: "expense",
      category: "Shopping",
    },
    {
      id: "8",
      title: "Freelance Project",
      date: format(subMonths(now, 2), "d MMM, h:mm a"),
      timestamp: subMonths(now, 2).getTime(),
      amount: 25000,
      type: "income",
      category: "Freelance",
    },
  ];
};

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveCategories(customCategories);
    }
  }, [customCategories, isLoading]);

  const loadData = async () => {
    try {
      const [storedTransactions, storedCategories] = await Promise.all([
        AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY),
        AsyncStorage.getItem(CATEGORIES_STORAGE_KEY),
      ]);

      if (storedTransactions !== null) {
        const parsed = JSON.parse(storedTransactions);
        // Add timestamp to old transactions that don't have it
        const withTimestamps = parsed.map((transaction) => ({
          ...transaction,
          timestamp: transaction.timestamp || Date.now(),
        }));
        setTransactions(withTimestamps);
      } else {
        // First time user - load sample data
        setTransactions(generateSampleTransactions());
      }

      if (storedCategories !== null) {
        setCustomCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setTransactions(generateSampleTransactions());
    } finally {
      setIsLoading(false);
    }
  };

  const saveTransactions = async (transactionsToSave) => {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactionsToSave));
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  };

  const saveCategories = async (categoriesToSave) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToSave));
    } catch (error) {
      console.error("Error saving categories:", error);
    }
  };

  const addTransaction = (title, amount, type, category, selectedDate = null) => {
    const transactionDate = selectedDate || new Date();
    const newTransaction = {
      id: Date.now().toString(),
      title: title,
      date: format(transactionDate, "d MMM, h:mm a"),
      timestamp: transactionDate.getTime(),
      amount: parseFloat(amount),
      type: type,
      category: category,
    };
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
  };

  const updateTransaction = (id, title, amount, type, category, selectedDate = null) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) => {
        if (transaction.id === id) {
          const transactionDate = selectedDate || new Date(transaction.timestamp);
          return {
            ...transaction,
            title,
            amount: parseFloat(amount),
            type,
            category,
            date: format(transactionDate, "d MMM, h:mm a"),
            timestamp: transactionDate.getTime(),
          };
        }
        return transaction;
      })
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== id)
    );
  };

  const addCategory = (newCategory) => {
    const exists = customCategories.some(
      (cat) => cat.name.toLowerCase() === newCategory.name.toLowerCase()
    );
    if (!exists) {
      setCustomCategories((prevCategories) => [...prevCategories, newCategory]);
      return true;
    }
    return false;
  };

  const deleteCategory = (categoryName) => {
    setCustomCategories((prevCategories) =>
      prevCategories.filter((cat) => cat.name !== categoryName)
    );
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
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
