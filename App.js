import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransactionProvider } from "./context/TransactionContext";
import TabNavigator from "./navigation/TabNavigator";
import AddTransactionScreen from "./screens/AddTransactionScreen";


const Stack = createNativeStackNavigator();

export default function App() {
  
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
