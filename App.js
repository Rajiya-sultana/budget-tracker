import React, { createContext, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TabNavigator from "./navigation/TabNavigator";
import AddExpenseScreen from "./screens/AddExpenseScreen";

const Stack = createNativeStackNavigator();

// Storage key for AsyncStorage
const STORAGE_KEY = "@budget_tracker_expenses";

// Create Context
export const ExpenseContext = createContext();

// Sample data for first-time users
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

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from AsyncStorage on app start
  useEffect(() => {
    loadExpenses();
  }, []);

  // Save expenses to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveExpenses(expenses);
    }
  }, [expenses, isLoading]);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedExpenses !== null) {
        setExpenses(JSON.parse(storedExpenses));
      } else {
        // First time user - load sample data
        setExpenses(sampleExpenses);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
      setExpenses(sampleExpenses);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExpenses = async (expensesToSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expensesToSave));
    } catch (error) {
      console.error("Error saving expenses:", error);
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

  return (
    <ExpenseContext.Provider
      value={{ expenses, addExpense, updateExpense, deleteExpense, isLoading }}
    >
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{
              presentation: "modal",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ExpenseContext.Provider>
  );
}
