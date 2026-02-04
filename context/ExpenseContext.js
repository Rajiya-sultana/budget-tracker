
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPENSES_STORAGE_KEY = "@budget_tracker_expenses";
const CATEGORIES_STORAGE_KEY = "@budget_tracker_categories";

export const ExpenseContext = createContext();

const sampleExpenses = [
  {
    id: "1",
    title: "Groceries",
    date: "Today, 3:45 PM",
    amount: 200,
    type: "expense",
    category: "Groceries",
  },
  {
    id: "2",
    title: "Taxi",
    date: "Yesterday, 11:00 AM",
    amount: 150,
    type: "expense",
    category: "Travel",
  },
  {
    id: "3",
    title: "Dinner",
    date: "Yesterday, 11:00 AM",
    amount: 550,
    type: "expense",
    category: "Home",
  },
  {
    id: "4",
    title: "Coffee",
    date: "Yesterday, 11:00 AM",
    amount: 100,
    type: "expense",
    category: "Shopping",
  },
  {
    id: "5",
    title: "Movies",
    date: "Today, 2:00 PM",
    amount: 400,
    type: "expense",
    category: "Other",
  },
];

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
        setExpenses(JSON.parse(storedExpenses));
      } else {
        setExpenses(sampleExpenses);
      }

      if (storedCategories !== null) {
        setCustomCategories(JSON.parse(storedCategories));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setExpenses(sampleExpenses);
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
    const newExpense = {
      id: Date.now().toString(),
      title: title,
      date: new Date().toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
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
              date: new Date().toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
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
