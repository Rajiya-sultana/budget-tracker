import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransactionProvider } from "./context/TransactionContext";
import TabNavigator from "./navigation/TabNavigator";
import AddTransactionScreen from "./screens/AddTransactionScreen";
import LoginScreen from "./screens/LoginScreen";
import SplashScreen from "./screens/SplashScreen";
import { supabase } from "./lib/supabase";

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [showSplash, setShowSplash] = useState(true); // always show splash on open

  useEffect(() => {
    // Minimum splash duration: 2 seconds
    const timer = setTimeout(() => setShowSplash(false), 2000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // Show splash again on logout before landing on login screen
      if (event === "SIGNED_OUT") {
        setShowSplash(true);
        setTimeout(() => setShowSplash(false), 2000);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  // Show splash if minimum duration hasn't passed OR auth is still loading
  if (showSplash || session === undefined) return <SplashScreen />;

  // Not logged in
  if (!session) return <LoginScreen />;

  return (
    <TransactionProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{
              presentation: "modal",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TransactionProvider>
  );
}
