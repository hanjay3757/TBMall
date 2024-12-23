import React from 'react';
import { Modal as RNModal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

function Modal({ isVisible, onClose, children }) {
  if (!isVisible) return null;

  return (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxHeight: '80%'
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 10
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000'
  }
});

export default Modal; 