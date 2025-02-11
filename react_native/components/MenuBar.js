import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

function MenuBar({ isLoggedIn, isAdmin }) {
  const navigation = useNavigation();

  return (
    <View style={styles.menuBar}>
      <View style={styles.menuLeft}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => navigation.navigate('ItemList')}
        >
          <Text style={styles.buttonText}>물건 목록</Text>
        </TouchableOpacity>
        {isLoggedIn && (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.buttonText}>🛒 장바구니</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAdmin && (
        <View style={styles.menuCenter}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('ItemRegister')}
          >
            <Text style={styles.buttonText}>물건 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('StaffRegister')}
          >
            <Text style={styles.buttonText}>사원 등록</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('DeletedItems')}
          >
            <Text style={styles.buttonText}>삭제된 물건</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('DeletedStaff')}
          >
            <Text style={styles.buttonText}>삭제된 직원</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuBar: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  menuLeft: {
    flexDirection: 'row',
  },
  menuCenter: {
    flexDirection: 'row',
  },
  menuButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MenuBar; 