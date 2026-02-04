import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { colors } from "../constants/colors";

const CATEGORIES = [
  {
    name: "Groceries",
    icon: "shopping-bag",
    color: "#22c55e",
    library: "FontAwesome5",
  },
  { name: "Travel", icon: "airplane", color: "#3b82f6", library: "Ionicons" },
  { name: "Car", icon: "car", color: "#3b82f6", library: "Ionicons" },
  { name: "Home", icon: "home", color: "#a855f7", library: "Ionicons" },
  {
    name: "Insurances",
    icon: "shield-checkmark",
    color: "#06b6d4",
    library: "Ionicons",
  },
  { name: "Education", icon: "book", color: "#a855f7", library: "Ionicons" },
  {
    name: "Marketing",
    icon: "megaphone",
    color: "#f97316",
    library: "Ionicons",
  },
  {
    name: "Shopping",
    icon: "bag-handle",
    color: "#22c55e",
    library: "Ionicons",
  },
  { name: "Internet", icon: "wifi", color: "#8b5cf6", library: "Ionicons" },
  { name: "Water", icon: "water", color: "#3b82f6", library: "Ionicons" },
  { name: "Rent", icon: "key", color: "#f97316", library: "Ionicons" },
  {
    name: "Gym",
    icon: "dumbbell",
    color: "#f97316",
    library: "MaterialCommunityIcons",
  },
  {
    name: "Subscription",
    icon: "notifications",
    color: "#8b5cf6",
    library: "Ionicons",
  },
  { name: "Vacation", icon: "beach", color: "#22c55e", library: "Ionicons" },
  { name: "Other", icon: "apps", color: "#8b5cf6", library: "Ionicons" },
];

export default function ExpenseItem({
  id,
  title,
  date,
  amount,
  type,
  category,
  onPress,
}) {
  const categoryData =
    CATEGORIES.find((cat) => cat.name === category) ||
    CATEGORIES[CATEGORIES.length - 1];

  const IconComponent =
    categoryData.library === "MaterialCommunityIcons"
      ? MaterialCommunityIcons
      : categoryData.library === "FontAwesome5"
        ? FontAwesome5
        : Ionicons;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress({ id, title, date, amount, type, category })}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: categoryData.color + "20" },
        ]}
      >
        <IconComponent
          name={categoryData.icon}
          size={24}
          color={categoryData.color}
        />
      </View>
      <View style={styles.leftContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.amount,
            type === "income" ? styles.incomeAmount : styles.expenseAmount,
          ]}
        >
          {type === "income" ? "+" : "-"}₹{amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  leftContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#999",
  },
  rightContent: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
  },
  expenseAmount: {
    color: "#dc2626",
  },
  incomeAmount: {
    color: "#16a34a",
  },
});
