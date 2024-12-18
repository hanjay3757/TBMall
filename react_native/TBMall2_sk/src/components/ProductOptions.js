import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

const ProductOptions = ({ options, selectedOptions, onSelectOption }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOptionType, setCurrentOptionType] = useState(null);

  const handleOptionPress = (type) => {
    setCurrentOptionType(type);
    setModalVisible(true);
  };

  const handleSelectValue = (value) => {
    onSelectOption(currentOptionType, value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <View key={option.type} style={styles.optionContainer}>
          <Text style={styles.optionLabel}>{option.type}</Text>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOptionPress(option.type)}
          >
            <Text style={styles.optionValue}>
              {selectedOptions[option.type] || '선택하세요'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentOptionType} 선택</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {currentOptionType &&
                options
                  .find((opt) => opt.type === currentOptionType)
                  ?.values.map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.optionItem}
                      onPress={() => handleSelectValue(value)}
                    >
                      <Text style={styles.optionItemText}>{value}</Text>
                    </TouchableOpacity>
                  ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  optionContainer: {
    marginBottom: 15,
  },
  optionLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 5,
  },
  optionValue: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionItemText: {
    fontSize: 14,
  },
});

export default ProductOptions; 