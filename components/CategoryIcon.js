import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Default categories
const DEFAULT_CATEGORIES = [
  { name: 'Groceries', icon: 'shopping-bag', color: '#22c55e', library: 'FontAwesome5', type: 'expense' },
  { name: 'Travel', icon: 'airplane', color: '#3b82f6', library: 'Ionicons', type: 'expense' },
  { name: 'Car', icon: 'car', color: '#3b82f6', library: 'Ionicons', type: 'expense' },
  { name: 'Home', icon: 'home', color: '#a855f7', library: 'Ionicons', type: 'expense' },
  { name: 'Insurances', icon: 'shield-checkmark', color: '#06b6d4', library: 'Ionicons', type: 'expense' },
  { name: 'Education', icon: 'book', color: '#a855f7', library: 'Ionicons', type: 'expense' },
  { name: 'Marketing', icon: 'megaphone', color: '#f97316', library: 'Ionicons', type: 'expense' },
  { name: 'Shopping', icon: 'bag-handle', color: '#22c55e', library: 'Ionicons', type: 'expense' },
  { name: 'Internet', icon: 'wifi', color: '#8b5cf6', library: 'Ionicons', type: 'expense' },
  { name: 'Water', icon: 'water', color: '#3b82f6', library: 'Ionicons', type: 'expense' },
  { name: 'Rent', icon: 'key', color: '#f97316', library: 'Ionicons', type: 'expense' },
  { name: 'Gym', icon: 'dumbbell', color: '#f97316', library: 'MaterialCommunityIcons', type: 'expense' },
  { name: 'Subscription', icon: 'notifications', color: '#8b5cf6', library: 'Ionicons', type: 'expense' },
  { name: 'Vacation', icon: 'umbrella', color: '#22c55e', library: 'Ionicons', type: 'expense' },
  { name: 'Salary', icon: 'cash', color: '#16a34a', library: 'Ionicons', type: 'income' },
  { name: 'Freelance', icon: 'briefcase', color: '#16a34a', library: 'Ionicons', type: 'income' },
  { name: 'Investment', icon: 'trending-up', color: '#16a34a', library: 'Ionicons', type: 'income' },
  { name: 'Gift', icon: 'gift', color: '#ec4899', library: 'Ionicons', type: 'income' },
  { name: 'Refund', icon: 'arrow-undo', color: '#16a34a', library: 'Ionicons', type: 'income' },
  { name: 'Other', icon: 'apps', color: '#8b5cf6', library: 'Ionicons', type: 'both' },
];

// For backward compatibility
const CATEGORIES = DEFAULT_CATEGORIES;

export default function CategoryIcon({ category, selected, onPress, showLabel = true, categoryData: customCategoryData }) {
  // Use custom category data if provided, otherwise look up from defaults
  const categoryData = customCategoryData ||
    DEFAULT_CATEGORIES.find(cat => cat.name === category) ||
    DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];

  const IconComponent =
    categoryData.library === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
    categoryData.library === 'FontAwesome5' ? FontAwesome5 :
    Ionicons;

  return (
    <TouchableOpacity
      style={styles.categoryContainer}
      onPress={() => onPress(category)}
    >
      <View style={[
        styles.iconCircle,
        { backgroundColor: selected ? categoryData.color : '#f0f0f0' }
      ]}>
        <IconComponent
          name={categoryData.icon}
          size={24}
          color={selected ? '#fff' : categoryData.color}
        />
      </View>
      {showLabel && <Text style={styles.categoryLabel} numberOfLines={1}>{category}</Text>}
    </TouchableOpacity>
  );
}

// Add New Category Button Component
export function AddCategoryButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.categoryContainer} onPress={onPress}>
      <View style={[styles.iconCircle, styles.addButtonCircle]}>
        <Ionicons name="add" size={28} color={colors.primary} />
      </View>
      <Text style={[styles.categoryLabel, styles.addButtonLabel]}>Add New</Text>
    </TouchableOpacity>
  );
}

// Helper to get category data by name (including custom categories)
export function getCategoryData(categoryName, customCategories = []) {
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
  return allCategories.find(cat => cat.name === categoryName) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}

// Filter categories by type
export function getCategoriesByType(type, customCategories = []) {
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
  return allCategories.filter(cat => cat.type === type || cat.type === 'both');
}

export { CATEGORIES, DEFAULT_CATEGORIES };

const styles = StyleSheet.create({
  categoryContainer: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  addButtonCircle: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
