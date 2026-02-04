import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getCategoryData } from "./CategoryIcon";
import { ExpenseContext } from "../context/ExpenseContext";

export default function ExpenseItem({
  id,
  title,
  date,
  amount,
  type,
  category,
  onPress,
}) {
  const { customCategories } = useContext(ExpenseContext);

  const categoryData = getCategoryData(category, customCategories);

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
    color: colors.expense,
  },
  incomeAmount: {
    color: colors.income,
  },
});
