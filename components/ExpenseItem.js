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
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textLight,
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
