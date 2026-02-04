import React, { useState, useContext, useEffect } from 'react';
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
} from 'react-native';
import Button from '../components/Button';
import CategoryIcon, { CATEGORIES } from '../components/CategoryIcon';
import { colors } from '../constants/colors';
import { ExpenseContext } from '../App';

export default function AddExpenseScreen({ navigation, route }) {
  const { addExpense, updateExpense } = useContext(ExpenseContext);
  
  // Check if we're in edit mode
  const editMode = route.params?.editMode || false;
  const transaction = route.params?.transaction || null;

  const [amount, setAmount] = useState(editMode ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(editMode ? transaction.title : '');
  const [selectedType, setSelectedType] = useState(editMode ? transaction.type : 'expense');
  const [selectedCategory, setSelectedCategory] = useState(editMode ? transaction.category : '');

  const handleSubmit = () => {
    if (!amount || amount.trim() === '') {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    if (!description || description.trim() === '') {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (editMode) {
      // Update existing transaction
      updateExpense(transaction.id, description.trim(), amount, selectedType, selectedCategory);
      Alert.alert('Success', 'Transaction updated successfully!');
    } else {
      // Add new transaction
      addExpense(description.trim(), amount, selectedType, selectedCategory);
      Alert.alert('Success', `${selectedType === 'income' ? 'Income' : 'Expense'} added successfully!`);
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editMode ? 'Edit Transaction' : 'Add Transaction'}
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
                selectedType === 'expense' && styles.toggleActive,
              ]}
              onPress={() => setSelectedType('expense')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedType === 'expense' && styles.toggleTextActive,
                ]}
              >
                Expenses
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleRight,
                selectedType === 'income' && styles.toggleActive,
              ]}
              onPress={() => setSelectedType('income')}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedType === 'income' && styles.toggleTextActive,
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
              placeholder="Amount spent"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Category Selection */}
          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
              <CategoryIcon
                key={cat.name}
                category={cat.name}
                selected={selectedCategory === cat.name}
                onPress={setSelectedCategory}
              />
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button 
          title={editMode ? 'Update Transaction' : (selectedType === 'income' ? 'Add Income' : 'Add Expense')} 
          onPress={handleSubmit} 
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  toggleLeft: {
    marginRight: 2,
  },
  toggleRight: {
    marginLeft: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});