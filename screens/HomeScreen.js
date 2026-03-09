import React, { useContext, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, subYears, addYears } from "date-fns";
import TransactionItem from "../components/TransactionItem";
import TransactionModal from "../components/TransactionModal";
import { colors } from "../constants/colors";
import { TransactionContext } from "../context/TransactionContext";

export default function HomeScreen({ navigation }) {
  const { transactions, deleteTransaction, isLoading, refresh } = useContext(TransactionContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter transactions for selected month
  // monthStart/monthEnd are derived inside useMemo from selectedDate to ensure
  // comparisons use consistent local-time boundaries (avoids stale Date references)
  const filteredTransactions = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });
  }, [transactions, selectedDate]);

  // Calculate totals for filtered transactions
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    const income = filteredTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = filteredTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
    };
  }, [filteredTransactions]);

  // Allow going back and forward up to 12 months (1 year each way)
  const minDate = subYears(new Date(), 1);
  const maxDate = addYears(new Date(), 1);
  const canGoPrevious = selectedDate > minDate;
  const canGoNext = !isSameMonth(selectedDate, maxDate);

  const handlePreviousMonth = () => {
    if (canGoPrevious) {
      setSelectedDate(subMonths(selectedDate, 1));
    }
  };

  const handleNextMonth = () => {
    if (canGoNext) {
      setSelectedDate(addMonths(selectedDate, 1));
    }
  };

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
      deleteTransaction(selectedTransaction.id);
      handleCloseModal();
    }
  };

  const handleEditFromModal = () => {
    handleCloseModal();
    navigation.navigate("AddTransaction", {
      editMode: true,
      transaction: selectedTransaction,
    });
  };

  const SummaryCard = ({ label, amount, isIncome }) => (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryAmount}>
        {isIncome ? "+" : "-"}₹{amount.toLocaleString()}
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
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        {/* Header with App Name */}
        <Text style={styles.header}>Budget Tracker</Text>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={[styles.monthArrow, !canGoPrevious && styles.monthArrowDisabled]}
            onPress={handlePreviousMonth}
            disabled={!canGoPrevious}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={canGoPrevious ? colors.primary : colors.textLight}
            />
          </TouchableOpacity>

          <View style={styles.monthDisplay}>
            <Text style={styles.monthText}>
              {format(selectedDate, "MMMM, yyyy")}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.monthArrow, !canGoNext && styles.monthArrowDisabled]}
            onPress={handleNextMonth}
            disabled={!canGoNext}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={canGoNext ? colors.primary : colors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primary]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.totalCard}
        >
          <Text style={styles.totalAmount}>
            ₹{netBalance.toLocaleString()}
          </Text>
          <Text style={styles.totalLabel}>Net Balance</Text>
          <View style={styles.summaryRow}>
            <SummaryCard label="Income" amount={totalIncome} isIncome />
            <SummaryCard label="Expenses" amount={totalExpense} />
          </View>
        </LinearGradient>

        {/* Transactions Section */}
        <Text style={styles.sectionTitle}>Transactions</Text>

        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              {...transaction}
              onPress={handleTransactionPress}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
            <Text style={styles.noTransactions}>
              No transactions in {format(selectedDate, "MMMM yyyy")}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddTransaction")}
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
    marginBottom: 16,
    textAlign: "center",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  monthArrowDisabled: {
    opacity: 0.5,
  },
  monthDisplay: {
    flex: 1,
    alignItems: "center",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  totalCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.textOnPurple,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textOnPurple,
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
    color: colors.textOnPurple,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textOnPurple,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noTransactions: {
    textAlign: "center",
    fontSize: 16,
    color: colors.textLight,
    marginTop: 12,
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
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.textOnPurple,
    fontWeight: "300",
  },
});
