import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet 
} from 'react-native';

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>© 2024 TBMALL. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  text: {
    color: '#6c757d',
    fontSize: 14,
  },
});

export default Footer; 