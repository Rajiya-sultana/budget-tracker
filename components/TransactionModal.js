import React from 'react';
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

const CATEGORIES = [
  { name: 'Groceries', icon: 'shopping-bag', color: '#22c55e', library: 'FontAwesome5' },
  { name: 'Travel', icon: 'airplane', color: '#3b82f6', library: 'Ionicons' },
  { name: 'Car', icon: 'car', color: '#3b82f6', library: 'Ionicons' },
  { name: 'Home', icon: 'home', color: '#a855f7', library: 'Ionicons' },
  { name: 'Insurances', icon: 'shield-checkmark', color: '#06b6d4', library: 'Ionicons' },
  { name: 'Education', icon: 'book', color: '#a855f7', library: 'Ionicons' },
  { name: 'Marketing', icon: 'megaphone', color: '#f97316', library: 'Ionicons' },
  { name: 'Shopping', icon: 'bag-handle', color: '#22c55e', library: 'Ionicons' },
  { name: 'Internet', icon: 'wifi', color: '#8b5cf6', library: 'Ionicons' },
  { name: 'Water', icon: 'water', color: '#3b82f6', library: 'Ionicons' },
  { name: 'Rent', icon: 'key', color: '#f97316', library: 'Ionicons' },
  { name: 'Gym', icon: 'dumbbell', color: '#f97316', library: 'MaterialCommunityIcons' },
  { name: 'Subscription', icon: 'notifications', color: '#8b5cf6', library: 'Ionicons' },
  { name: 'Vacation', icon: 'beach', color: '#22c55e', library: 'Ionicons' },
  { name: 'Other', icon: 'apps', color: '#8b5cf6', library: 'Ionicons' },
];

export default function TransactionModal({ visible, transaction, onClose, onDelete, onEdit }) {
  if (!transaction) return null;

  const categoryData = CATEGORIES.find(cat => cat.name === transaction.category) || CATEGORIES[CATEGORIES.length - 1];
  
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
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
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
    backgroundColor: '#f3f4f6',
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
    backgroundColor: '#dcfce7',
  },
  expenseBadge: {
    backgroundColor: '#fee2e2',
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  amount: {
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  incomeAmount: {
    color: '#16a34a',
  },
  expenseAmount: {
    color: '#dc2626',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
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
    color: '#999',
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
    color: '#1a1a1a',
  },
});