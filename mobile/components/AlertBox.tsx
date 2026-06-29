import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { AlertCircle, CheckCircle, Info } from 'lucide-react-native';

type AlertBoxProps = {
  visible: boolean;
  message: string;
  type?: 'error' | 'success' | 'info';
};

export const AlertBox: React.FC<AlertBoxProps> = ({ visible, message, type = 'error' }) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle color="#E11D48" size={20} />;
      case 'success': return <CheckCircle color="#10B981" size={20} />;
      case 'info': return <Info color="#3B82F6" size={20} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#FFE4E6'; // Rose 100
      case 'success': return '#D1FAE5'; // Emerald 100
      case 'info': return '#DBEAFE'; // Blue 100
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error': return '#E11D48'; // Rose 600
      case 'success': return '#059669'; // Emerald 600
      case 'info': return '#2563EB'; // Blue 600
    }
  };

  return (
    <Animated.View 
      entering={FadeInUp.springify().damping(15)} 
      exiting={FadeOutUp}
      style={[styles.container, { backgroundColor: getBackgroundColor() }]}
    >
      {getIcon()}
      <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 45,
    left: 24,
    right: 24,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    fontFamily: 'Bein',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    textAlign: 'left',
  }
});
