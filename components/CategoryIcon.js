import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

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

export default function CategoryIcon({ category, selected, onPress, showLabel = true }) {
  const categoryData = CATEGORIES.find(cat => cat.name === category) || CATEGORIES[CATEGORIES.length - 1];
  
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
      {showLabel && <Text style={styles.categoryLabel}>{category}</Text>}
    </TouchableOpacity>
  );
}

export { CATEGORIES };

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
});