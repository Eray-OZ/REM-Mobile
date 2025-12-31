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
      <View style={styles.deleteContainer}>
        <TouchableOpacity onPress={onDelete} activeOpacity={0.6}>
          <View style={styles.deleteButton}>
            <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
              🗑️
            </Animated.Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 12,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
  },
  deleteText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});
