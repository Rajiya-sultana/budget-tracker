import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, subDays, subMonths } from "date-fns";

const EXPENSES_STORAGE_KEY = "@budget_tracker_expenses";
const CATEGORIES_STORAGE_KEY = "@budget_tracker_categories";

export const ExpenseContext = createContext();

// Generate sample expenses across multiple months for demo
const generateSampleExpenses = () => {
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

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveExpenses(expenses);
    }
  }, [expenses, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveCategories(customCategories);
    }
  }, [customCategories, isLoading]);

  const loadData = async () => {
    try {
      const [storedExpenses, storedCategories] = await Promise.all([
        AsyncStorage.getItem(EXPENSES_STORAGE_KEY),
        AsyncStorage.getItem(CATEGORIES_STORAGE_KEY),
      ]);

      if (storedExpenses !== null) {
        const parsed = JSON.parse(storedExpenses);
        // Add timestamp to old transactions that don't have it
        const withTimestamps = parsed.map((expense) => ({
          ...expense,
          timestamp: expense.timestamp || Date.now(),
        }));
        setExpenses(withTimestamps);
      } else {
        // First time user - load sample data
        setExpenses(generateSampleExpenses());
      }

      if (storedCategories !== null) {
        setCustomCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setExpenses(generateSampleExpenses());
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async (expensesToSave) => {
    try {
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expensesToSave));
    } catch (error) {
      console.error("Error saving expenses:", error);
    }
  };

  const saveCategories = async (categoriesToSave) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categoriesToSave));
    } catch (error) {
      console.error("Error saving categories:", error);
    }
  };

  const addExpense = (title, amount, type, category) => {
    const now = new Date();
    const newExpense = {
      id: Date.now().toString(),
      title: title,
      date: format(now, "d MMM, h:mm a"),
      timestamp: now.getTime(),
      amount: parseFloat(amount),
      type: type,
      category: category,
    };
    setExpenses((prevExpenses) => [newExpense, ...prevExpenses]);
  };

  const updateExpense = (id, title, amount, type, category) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === id
          ? {
              ...expense,
              title,
              amount: parseFloat(amount),
              type,
              category,
              date: format(new Date(), "d MMM, h:mm a"),
            }
          : expense
      )
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prevExpenses) =>
      prevExpenses.filter((expense) => expense.id !== id)
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
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        customCategories,
        addCategory,
        deleteCategory,
        isLoading,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}
