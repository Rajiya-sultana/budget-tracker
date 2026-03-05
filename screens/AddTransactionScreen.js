import React, { useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import Button from "../components/Button";
import CategoryIcon, {
  AddCategoryButton,
  getCategoriesByType,
} from "../components/CategoryIcon";
import AddCategoryModal from "../components/AddCategoryModal";
import { colors } from "../constants/colors";
import { TransactionContext } from "../context/TransactionContext";
import { Ionicons } from "@expo/vector-icons";

export default function AddTransactionScreen({ navigation, route }) {
  const { addTransaction, updateTransaction, customCategories, addCategory } =
    useContext(TransactionContext);

  // Check if we're in edit mode
  const editMode = route.params?.editMode || false;
  const transaction = route.params?.transaction || null;

  const [amount, setAmount] = useState(
    editMode ? transaction.amount.toString() : "",
  );
  const [description, setDescription] = useState(
    editMode ? transaction.title : "",
  );
  const [selectedType, setSelectedType] = useState(
    editMode ? transaction.type : "expense",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    editMode ? transaction.category : "",
  );
  const [selectedDate, setSelectedDate] = useState(
    editMode && transaction.timestamp ? new Date(transaction.timestamp) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Get filtered categories based on selected type
  const filteredCategories = useMemo(() => {
    return getCategoriesByType(selectedType, customCategories);
  }, [selectedType, customCategories]);

  // Reset selected category when switching types if current category is not valid for new type
  const handleTypeChange = (newType) => {
    setSelectedType(newType);
    const validCategories = getCategoriesByType(newType, customCategories);
    const isCurrentCategoryValid = validCategories.some(
      (cat) => cat.name === selectedCategory,
    );
    if (!isCurrentCategoryValid) {
      setSelectedCategory("");
    }
  };

  const handleAddCategory = (newCategory) => {
    const success = addCategory(newCategory);
    if (success) {
      // Auto-select the newly added category
      setSelectedCategory(newCategory.name);
      Alert.alert(
        "Success",
        `Category "${newCategory.name}" added successfully!`,
      );
    } else {
      Alert.alert("Error", "A category with this name already exists.");
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = () => {
    if (!amount || amount.trim() === "") {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    if (!description || description.trim() === "") {
      Alert.alert("Error", "Please enter a description");
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (editMode) {
      // Update existing transaction
      updateTransaction(
        transaction.id,
        description.trim(),
        amount,
        selectedType,
        selectedCategory,
        selectedDate,
      );
      Alert.alert("Success", "Transaction updated successfully!");
    } else {
      // Add new transaction
      addTransaction(
        description.trim(),
        amount,
        selectedType,
        selectedCategory,
        selectedDate,
      );
      Alert.alert(
        "Success",
        `${selectedType === "income" ? "Income" : "Expense"} added successfully!`,
      );
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editMode ? "Edit Transaction" : "Add Transaction"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Toggle Switch */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleLeft,
                selectedType === "expense" && styles.toggleActiveExpense,
              ]}
              onPress={() => handleTypeChange("expense")}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedType === "expense" && styles.toggleTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleRight,
                selectedType === "income" && styles.toggleActiveIncome,
              ]}
              onPress={() => handleTypeChange("income")}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedType === "income" && styles.toggleTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Description"
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Date Picker */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.datePickerLeft}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              <View style={styles.datePickerTextContainer}>
                <Text style={styles.datePickerLabel}>Date</Text>
                <Text style={styles.datePickerValue}>
                  {format(selectedDate, "EEEE, d MMMM yyyy")}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}

          {/* Category Selection */}
          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.categoriesContainer}>
            {filteredCategories.map((cat) => (
              <CategoryIcon
                key={cat.name}
                category={cat.name}
                categoryData={cat}
                selected={selectedCategory === cat.name}
                onPress={setSelectedCategory}
              />
            ))}
            <AddCategoryButton onPress={() => setShowAddCategoryModal(true)} />
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={
            editMode
              ? "Update Transaction"
              : selectedType === "income"
                ? "Add Income"
                : "Add Expense"
          }
          onPress={handleSubmit}
        />
      </View>

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSave={handleAddCategory}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
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
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  toggleLeft: {
    marginRight: 2,
  },
  toggleRight: {
    marginLeft: 2,
  },
  toggleActiveExpense: {
    backgroundColor: colors.expense,
  },
  toggleActiveIncome: {
    backgroundColor: colors.income,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
  toggleTextActive: {
    color: colors.textOnPurple,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  descriptionInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: "top",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  datePickerTextContainer: {
    marginLeft: 12,
  },
  datePickerLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  datePickerValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
