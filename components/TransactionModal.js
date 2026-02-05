import React, { useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getCategoryData } from './CategoryIcon';
import { ExpenseContext } from '../context/ExpenseContext';

export default function TransactionModal({ visible, transaction, onClose, onDelete, onEdit }) {
  const { customCategories } = useContext(ExpenseContext);

  if (!transaction) return null;

  const categoryData = getCategoryData(transaction.category, customCategories);
  
  const IconComponent = 
    categoryData.library === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
    categoryData.library === 'FontAwesome5' ? FontAwesome5 :
    Ionicons;

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header with Close, Edit, Delete */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton} onPress={onEdit}>
                <Ionicons name="pencil" size={22} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Type Badge */}
          <View style={[
            styles.typeBadge,
            transaction.type === 'income' ? styles.incomeBadge : styles.expenseBadge
          ]}>
            <Text style={[
              styles.typeBadgeText,
              transaction.type === 'income' ? styles.incomeText : styles.expenseText
            ]}>
              {transaction.type === 'income' ? 'Income' : 'Expense'}
            </Text>
          </View>

          {/* Amount */}
          <Text style={[
            styles.amount,
            transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
          ]}>
            {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
          </Text>

          {/* Title */}
          <Text style={styles.title}>{transaction.title}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Category with Icon */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              <View style={[styles.categoryIconSmall, { backgroundColor: categoryData.color + '20' }]}>
                <IconComponent name={categoryData.icon} size={18} color={categoryData.color} />
              </View>
              <Text style={styles.infoValue}>{transaction.category}</Text>
            </View>
          </View>

          {/* Date */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{transaction.date}</Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  incomeBadge: {
    backgroundColor: colors.incomeLight,
  },
  expenseBadge: {
    backgroundColor: colors.expenseLight,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeText: {
    color: colors.income,
  },
  expenseText: {
    color: colors.expense,
  },
  amount: {
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  incomeAmount: {
    color: colors.income,
  },
  expenseAmount: {
    color: colors.expense,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});