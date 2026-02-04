import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ExpenseItem from "../components/ExpenseItem";
import TransactionModal from "../components/TransactionModal";
import { colors } from "../constants/colors";
import { ExpenseContext } from "../App";

export default function HomeScreen({ navigation }) {
  const { expenses, deleteExpense } = useContext(ExpenseContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Calculate totals using useMemo for better performance
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    const income = expenses
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = expenses
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
    };
  }, [expenses]);

  const handleTransactionPress = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  const handleDeleteFromModal = () => {
    if (selectedTransaction) {
      deleteExpense(selectedTransaction.id);
      handleCloseModal();
    }
  };

  const handleEditFromModal = () => {
    handleCloseModal();
    // Navigate to AddExpense screen with transaction data for editing
    navigation.navigate("AddExpense", { 
      editMode: true, 
      transaction: selectedTransaction 
    });
  };

  const SummaryCard = ({ label, amount, isIncome }) => (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryAmount}>
        {isIncome ? "+" : "-"}₹{amount}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Simple Budget Tracker</Text>

        <LinearGradient
          colors={["#d8b4fe", "#c4b5fd"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.totalCard}
        >
          <Text style={styles.totalAmount}>₹{netBalance}</Text>
          <Text style={styles.totalLabel}>Net Balance</Text>
          <View style={styles.summaryRow}>
            <SummaryCard label="Income" amount={totalIncome} isIncome />
            <SummaryCard label="Expenses" amount={totalExpense} />
          </View>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Transactions</Text>

        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              {...expense}
              onPress={handleTransactionPress}
            />
          ))
        ) : (
          <Text style={styles.noExpenses}>No transactions yet. Add one!</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddExpense")}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Transaction Modal */}
      <TransactionModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
        onDelete={handleDeleteFromModal}
        onEdit={handleEditFromModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginTop: 60,
    marginBottom: 24,
    textAlign: "center",
  },
  totalCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  noExpenses: {
    textAlign: "center",
    fontSize: 16,
    color: colors.textLight,
    marginTop: 40,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
  },
});