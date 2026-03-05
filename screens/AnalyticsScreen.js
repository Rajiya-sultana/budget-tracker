import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  format,
  subMonths,
  addMonths,
  subWeeks,
  addWeeks,
  subYears,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  differenceInDays,
} from "date-fns";
import { TransactionContext } from "../context/TransactionContext";
import { colors } from "../constants/colors";

const { width: screenWidth } = Dimensions.get("window");

// Chart colors
const CHART_COLORS = {
  income: "#10B981",
  expense: "#EF4444",
  purple: "#7C3AED",
  background: "#F5F7FA",
};

const PERIODS = [
  { label: "1W", value: "1W", months: 0, weeks: 1 },
  { label: "1M", value: "1M", months: 1, weeks: 0 },
  { label: "3M", value: "3M", months: 3, weeks: 0 },
  { label: "6M", value: "6M", months: 6, weeks: 0 },
  { label: "1Y", value: "1Y", months: 12, weeks: 0 },
];

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const { transactions } = useContext(TransactionContext);
  const [selectedPeriod, setSelectedPeriod] = useState("6M");
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calculate date range based on selected period (symmetric: same duration back and forward)
  const dateRange = useMemo(() => {
    const now = new Date();
    const period = PERIODS.find((p) => p.value === selectedPeriod);
    let startDate, endDate;

    if (period.weeks > 0) {
      startDate = subWeeks(now, period.weeks);
      endDate = addWeeks(now, period.weeks);
    } else if (period.months > 0) {
      startDate = subMonths(now, period.months);
      endDate = addMonths(now, period.months);
    } else {
      startDate = subYears(now, 1);
      endDate = addMonths(now, 12);
    }

    return { startDate, endDate };
  }, [selectedPeriod]);

  // Filter transactions by selected period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.timestamp);
      return d >= dateRange.startDate && d <= dateRange.endDate;
    });
  }, [transactions, dateRange]);

  // Calculate totals for current period
  const currentTotals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // Calculate totals for previous period (for percentage change)
  const previousTotals = useMemo(() => {
    const now = new Date();
    const periodDays = differenceInDays(now, dateRange.startDate);
    const prevStart = subMonths(dateRange.startDate, Math.ceil(periodDays / 30));
    const prevEnd = dateRange.startDate;

    const prevTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.timestamp);
      return isWithinInterval(transactionDate, {
        start: prevStart,
        end: prevEnd,
      });
    });

    const income = prevTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = prevTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions, dateRange]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      income: calcChange(currentTotals.income, previousTotals.income),
      expense: calcChange(currentTotals.expense, previousTotals.expense),
      balance: calcChange(currentTotals.balance, previousTotals.balance),
    };
  }, [currentTotals, previousTotals]);

  // Generate chart data for months (includes future months within dateRange)
  const chartData = useMemo(() => {
    const now = new Date();
    const numPastMonths = selectedPeriod === "1W" ? 1 : selectedPeriod === "1M" ? 1 : selectedPeriod === "3M" ? 3 : selectedPeriod === "6M" ? 6 : 12;

    // Collect all month keys within the dateRange that have transactions
    const currentMonthKey = format(now, "yyyy-MM");
    const monthKeys = new Set();

    // Always include past/current months
    for (let i = numPastMonths - 1; i >= 0; i--) {
      monthKeys.add(format(subMonths(now, i), "yyyy-MM"));
    }

    // Add future months within dateRange.endDate that have transactions
    transactions.forEach((t) => {
      const d = new Date(t.timestamp);
      if (d > now && d <= dateRange.endDate) {
        monthKeys.add(format(d, "yyyy-MM"));
      }
    });

    return [...monthKeys].sort().map((key) => {
      const monthDate = new Date(key + "-01");
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthTransactions = transactions.filter((t) =>
        isWithinInterval(new Date(t.timestamp), { start: monthStart, end: monthEnd })
      );
      const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      return { month: format(monthDate, "MMM"), income, expense };
    });
  }, [transactions, selectedPeriod, dateRange]);

  // Get max value for chart scaling
  const maxChartValue = useMemo(() => {
    let max = 0;
    chartData.forEach((d) => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max || 1;
  }, [chartData]);

  // Generate insights
  const insights = useMemo(() => {
    const insightsList = [];

    // Insight 1: Spending trend
    if (chartData.length >= 2) {
      const lastMonth = chartData[chartData.length - 1];
      const prevMonth = chartData[chartData.length - 2];
      const expenseChange = lastMonth.expense - prevMonth.expense;

      if (expenseChange > 0) {
        insightsList.push({
          icon: "trending-up",
          color: CHART_COLORS.expense,
          title: "Spending Increased",
          description: `Your expenses went up by ₹${Math.abs(expenseChange).toLocaleString()} compared to last month.`,
        });
      } else if (expenseChange < 0) {
        insightsList.push({
          icon: "trending-down",
          color: CHART_COLORS.income,
          title: "Great Savings!",
          description: `You spent ₹${Math.abs(expenseChange).toLocaleString()} less than last month. Keep it up!`,
        });
      }
    }

    // Insight 2: Top spending category
    const categoryExpenses = {};
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });

    const topCategory = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insightsList.push({
        icon: "pie-chart",
        color: CHART_COLORS.purple,
        title: `Top Expense: ${topCategory[0]}`,
        description: `${topCategory[0]} accounts for ₹${topCategory[1].toLocaleString()} of your spending.`,
      });
    }

    // Insight 3: Savings rate
    if (currentTotals.income > 0) {
      const savingsRate = ((currentTotals.income - currentTotals.expense) / currentTotals.income) * 100;
      insightsList.push({
        icon: savingsRate >= 20 ? "checkmark-circle" : "alert-circle",
        color: savingsRate >= 20 ? CHART_COLORS.income : CHART_COLORS.expense,
        title: `Savings Rate: ${savingsRate.toFixed(1)}%`,
        description: savingsRate >= 20
          ? "Excellent! You're saving more than 20% of your income."
          : "Try to save at least 20% of your income for financial health.",
      });
    }

    // Fallback insight
    if (insightsList.length < 3) {
      insightsList.push({
        icon: "bulb",
        color: CHART_COLORS.purple,
        title: "Track More",
        description: "Add more transactions to get personalized insights about your spending habits.",
      });
    }

    return insightsList.slice(0, 3);
  }, [chartData, filteredTransactions, currentTotals]);

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const SummaryCard = ({ title, amount, change, color, icon }) => {
    const isPositive = change >= 0;
    const changeColor = title === "Total Expense"
      ? (isPositive ? CHART_COLORS.expense : CHART_COLORS.income)
      : (isPositive ? CHART_COLORS.income : CHART_COLORS.expense);

    return (
      <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
        <View style={styles.summaryCardHeader}>
          <View style={[styles.summaryIconContainer, { backgroundColor: color + "20" }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={[styles.changeContainer, { backgroundColor: changeColor + "15" }]}>
            <Ionicons
              name={isPositive ? "arrow-up" : "arrow-down"}
              size={12}
              color={changeColor}
            />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {Math.abs(change).toFixed(1)}%
            </Text>
          </View>
        </View>
        <Text style={styles.summaryAmount}>{formatCurrency(amount)}</Text>
        <Text style={styles.summaryTitle}>{title}</Text>
      </Animated.View>
    );
  };

  const SimpleBarChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <View style={styles.barsContainer}>
              <View
                style={[
                  styles.bar,
                  styles.incomeBar,
                  { height: Math.max((item.income / maxChartValue) * 120, 4) },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  styles.expenseBar,
                  { height: Math.max((item.expense / maxChartValue) * 120, 4) },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{item.month}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.income }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.expense }]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>
    </View>
  );

  const InsightCard = ({ insight }) => (
    <Animated.View
      style={[
        styles.insightCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.insightIcon, { backgroundColor: insight.color + "15" }]}>
        <Ionicons name={insight.icon} size={24} color={insight.color} />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={styles.insightDescription}>{insight.description}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <SummaryCard
            title="Total Income"
            amount={currentTotals.income}
            change={percentageChanges.income}
            color={CHART_COLORS.income}
            icon="arrow-down-circle"
          />
          <SummaryCard
            title="Total Expense"
            amount={currentTotals.expense}
            change={percentageChanges.expense}
            color={CHART_COLORS.expense}
            icon="arrow-up-circle"
          />
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Net Balance</Text>
            <View
              style={[
                styles.changeContainer,
                {
                  backgroundColor:
                    percentageChanges.balance >= 0
                      ? CHART_COLORS.income + "15"
                      : CHART_COLORS.expense + "15",
                },
              ]}
            >
              <Ionicons
                name={percentageChanges.balance >= 0 ? "arrow-up" : "arrow-down"}
                size={12}
                color={
                  percentageChanges.balance >= 0
                    ? CHART_COLORS.income
                    : CHART_COLORS.expense
                }
              />
              <Text
                style={[
                  styles.changeText,
                  {
                    color:
                      percentageChanges.balance >= 0
                        ? CHART_COLORS.income
                        : CHART_COLORS.expense,
                  },
                ]}
              >
                {Math.abs(percentageChanges.balance).toFixed(1)}%
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.balanceAmount,
              {
                color:
                  currentTotals.balance >= 0
                    ? CHART_COLORS.income
                    : CHART_COLORS.expense,
              },
            ]}
          >
            {currentTotals.balance >= 0 ? "+" : ""}
            {formatCurrency(Math.abs(currentTotals.balance))}
          </Text>
        </View>

        {/* Chart Section */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Income vs Expense</Text>
          <Text style={styles.chartSubtitle}>Monthly comparison</Text>
          <SimpleBarChart />
        </View>

        {/* Key Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHART_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: CHART_COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: CHART_COLORS.purple,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 2,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 13,
    color: colors.textLight,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: "center",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    width: "100%",
    height: 150,
    paddingBottom: 10,
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  bar: {
    width: 16,
    borderRadius: 4,
    minHeight: 4,
  },
  incomeBar: {
    backgroundColor: CHART_COLORS.income,
  },
  expenseBar: {
    backgroundColor: CHART_COLORS.expense,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    color: colors.textLight,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  insightsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
