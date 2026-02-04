import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ExpenseProvider } from "./context/ExpenseContext";
import TabNavigator from "./navigation/TabNavigator";
import AddExpenseScreen from "./screens/AddExpenseScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ExpenseProvider>
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
    </ExpenseProvider>
  );
}
