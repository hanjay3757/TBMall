import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const { height } = Dimensions.get('window');

const HamburgerMenu = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));
  const { logout } = useAuth();

  const showMenu = () => {
    setIsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsVisible(false));
  };

  const handleLogout = () => {
    hideMenu();
    logout();
  };

  const menuItems = [
    { title: '홈', icon: 'home-outline', onPress: () => navigation.navigate('홈') },
    { title: '직원관리', icon: 'people-outline', onPress: () => navigation.navigate('직원관리') },
    { title: '물품등록', icon: 'add-circle-outline', onPress: () => navigation.navigate('상품등록') },
    { title: '공지사항', icon: 'megaphone-outline', onPress: () => {} },
    { title: '설정', icon: 'settings-outline', onPress: () => {} },
    { title: '고객센터', icon: 'help-circle-outline', onPress: () => {} },
    { title: '로그아웃', icon: 'log-out-outline', onPress: handleLogout },
  ];

  return (
    <View>
      <TouchableOpacity onPress={showMenu} style={styles.menuButton}>
        <Icon name="menu" size={24} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        onRequestClose={hideMenu}
        animationType="none"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            onPress={hideMenu}
            activeOpacity={1}
          >
            <Animated.View 
              style={[
                styles.menuContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>메뉴</Text>
                <TouchableOpacity onPress={hideMenu}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => {
                    hideMenu();
                    item.onPress();
                  }}
                >
                  <Icon name={item.icon} size={20} color="#333" />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    width: 280,
    height: height,
    backgroundColor: '#fff',
    paddingTop: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default HamburgerMenu; 