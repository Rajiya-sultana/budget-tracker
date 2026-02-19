import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Icon mapping based on keywords in category name
const ICON_KEYWORDS = [
  { keywords: ['grocery', 'groceries', 'food', 'meal', 'eat'], icon: 'shopping-bag', color: '#22c55e', library: 'FontAwesome5' },
  { keywords: ['travel', 'trip', 'flight', 'airplane', 'plane'], icon: 'airplane', color: '#3b82f6', library: 'Ionicons' },
  { keywords: ['car', 'vehicle', 'auto', 'petrol', 'gas', 'fuel'], icon: 'car', color: '#3b82f6', library: 'Ionicons' },
  { keywords: ['home', 'house', 'apartment', 'flat'], icon: 'home', color: '#a855f7', library: 'Ionicons' },
  { keywords: ['insurance', 'policy', 'cover'], icon: 'shield-checkmark', color: '#06b6d4', library: 'Ionicons' },
  { keywords: ['education', 'school', 'college', 'study', 'book', 'course', 'class'], icon: 'book', color: '#a855f7', library: 'Ionicons' },
  { keywords: ['marketing', 'ads', 'advertising', 'promotion'], icon: 'megaphone', color: '#f97316', library: 'Ionicons' },
  { keywords: ['shop', 'shopping', 'buy', 'purchase', 'store'], icon: 'bag-handle', color: '#22c55e', library: 'Ionicons' },
  { keywords: ['internet', 'wifi', 'broadband', 'data'], icon: 'wifi', color: '#8b5cf6', library: 'Ionicons' },
  { keywords: ['water', 'utility', 'bill'], icon: 'water', color: '#3b82f6', library: 'Ionicons' },
  { keywords: ['rent', 'lease', 'housing'], icon: 'key', color: '#f97316', library: 'Ionicons' },
  { keywords: ['gym', 'fitness', 'workout', 'exercise', 'health'], icon: 'dumbbell', color: '#f97316', library: 'MaterialCommunityIcons' },
  { keywords: ['subscription', 'subscribe', 'membership', 'netflix', 'spotify'], icon: 'notifications', color: '#8b5cf6', library: 'Ionicons' },
  { keywords: ['vacation', 'holiday', 'beach', 'resort'], icon: 'umbrella', color: '#22c55e', library: 'Ionicons' },
  { keywords: ['salary', 'wage', 'pay', 'income'], icon: 'cash', color: '#16a34a', library: 'Ionicons' },
  { keywords: ['bonus', 'reward', 'prize'], icon: 'gift', color: '#16a34a', library: 'Ionicons' },
  { keywords: ['freelance', 'gig', 'side'], icon: 'briefcase', color: '#16a34a', library: 'Ionicons' },
  { keywords: ['investment', 'invest', 'stock', 'dividend', 'return'], icon: 'trending-up', color: '#16a34a', library: 'Ionicons' },
  { keywords: ['refund', 'cashback', 'return'], icon: 'arrow-undo', color: '#16a34a', library: 'Ionicons' },
  { keywords: ['gift', 'present'], icon: 'gift', color: '#ec4899', library: 'Ionicons' },
  { keywords: ['medical', 'doctor', 'hospital', 'medicine', 'health', 'pharmacy'], icon: 'medical', color: '#ef4444', library: 'Ionicons' },
  { keywords: ['phone', 'mobile', 'cell', 'recharge'], icon: 'phone-portrait', color: '#6366f1', library: 'Ionicons' },
  { keywords: ['electric', 'electricity', 'power'], icon: 'flash', color: '#eab308', library: 'Ionicons' },
  { keywords: ['entertainment', 'movie', 'cinema', 'fun', 'party'], icon: 'film', color: '#ec4899', library: 'Ionicons' },
  { keywords: ['restaurant', 'dining', 'dinner', 'lunch', 'breakfast', 'cafe', 'coffee'], icon: 'restaurant', color: '#f97316', library: 'Ionicons' },
  { keywords: ['taxi', 'uber', 'cab', 'ride', 'transport'], icon: 'car-sport', color: '#3b82f6', library: 'Ionicons' },
  { keywords: ['clothes', 'clothing', 'fashion', 'dress', 'wear'], icon: 'shirt', color: '#ec4899', library: 'Ionicons' },
  { keywords: ['pet', 'dog', 'cat', 'animal'], icon: 'paw', color: '#f97316', library: 'Ionicons' },
  { keywords: ['baby', 'child', 'kid', 'children'], icon: 'happy', color: '#ec4899', library: 'Ionicons' },
  { keywords: ['beauty', 'salon', 'spa', 'haircut'], icon: 'cut', color: '#ec4899', library: 'Ionicons' },
  { keywords: ['bank', 'transfer', 'transaction'], icon: 'card', color: '#6366f1', library: 'Ionicons' },
  { keywords: ['tax', 'taxes'], icon: 'document-text', color: '#6366f1', library: 'Ionicons' },
  { keywords: ['loan', 'emi', 'debt'], icon: 'wallet', color: '#ef4444', library: 'Ionicons' },
  { keywords: ['savings', 'save'], icon: 'wallet', color: '#16a34a', library: 'Ionicons' },
];

// Default icon when no match found
const DEFAULT_ICON = { icon: 'apps', color: '#8b5cf6', library: 'Ionicons' };

// Function to auto-pick icon based on category name
export const getIconForCategory = (categoryName) => {
  const lowerName = categoryName.toLowerCase();

  for (const mapping of ICON_KEYWORDS) {
    for (const keyword of mapping.keywords) {
      if (lowerName.includes(keyword)) {
        return {
          icon: mapping.icon,
          color: mapping.color,
          library: mapping.library,
        };
      }
    }
  }

  return DEFAULT_ICON;
};

export default function AddCategoryModal({ visible, onClose, onSave }) {
  const [type, setType] = useState('expense');
  const [name, setName] = useState('');
  const [iconData, setIconData] = useState(DEFAULT_ICON);

  // Auto-update icon when name changes
  useEffect(() => {
    if (name.trim()) {
      setIconData(getIconForCategory(name));
    } else {
      setIconData(DEFAULT_ICON);
    }
  }, [name]);

  const handleSave = () => {
    if (!name.trim()) return;

    const newCategory = {
      name: name.trim(),
      icon: iconData.icon,
      color: iconData.color,
      library: iconData.library,
      type: type,
      isCustom: true,
    };

    onSave(newCategory);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setType('expense');
    setIconData(DEFAULT_ICON);
    onClose();
  };

  const IconComponent =
    iconData.library === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
    iconData.library === 'FontAwesome5' ? FontAwesome5 :
    Ionicons;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Category</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Type Selection */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.typeButtonActiveExpense,
              ]}
              onPress={() => setType('expense')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.typeButtonTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.typeButtonActiveIncome,
              ]}
              onPress={() => setType('income')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'income' && styles.typeButtonTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Name Input */}
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter category name"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          {/* Icon Preview */}
          <Text style={styles.label}>Auto-selected Icon</Text>
          <View style={styles.iconPreviewContainer}>
            <View style={[styles.iconPreview, { backgroundColor: iconData.color + '20' }]}>
              <IconComponent name={iconData.icon} size={32} color={iconData.color} />
            </View>
            <Text style={styles.iconHint}>
              Icon is automatically selected based on category name
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeButtonActiveExpense: {
    backgroundColor: colors.expense,
  },
  typeButtonActiveIncome: {
    backgroundColor: colors.income,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.textOnPurple,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconPreview: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconHint: {
    flex: 1,
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPurple,
  },
});
