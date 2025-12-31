import React from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors, borderRadius } from '../constants/theme';

export const SwipeableDreamItem = ({ children, onDelete }) => {
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity onPress={onDelete} activeOpacity={0.6}>
        <View style={styles.deleteButton}>
          <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
            🗑️
          </Animated.Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%', // Match height of children
    borderRadius: borderRadius.xl, // Match card radius if possible, or just look good
    marginLeft: 16, // Spacing from card? No, usually flush.
    // For list items with spacing, we might need to adjust.
    // Let's assume the child has margin, so the swipeable container might need to match.
  },
  deleteText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});
