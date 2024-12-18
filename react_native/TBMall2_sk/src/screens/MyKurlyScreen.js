import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

const MyKurlyScreen = ({ navigation }) => {
  const { wishlist } = useWishlist();
  const { logout, userInfo } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => logout(),
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {userInfo ? `${userInfo.name}님` : '로그인이 필요합니다'}
        </Text>
        {userInfo ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>로그인/회원가입</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>적립금</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text>0원</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>쿠폰</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text>0개</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주문 내역</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text>주문 내역 조회</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>찜한 상품</Text>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('찜한상품')}
        >
          <Text>찜한 상품 {wishlist.length}개</Text>
          <Icon name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#5f0080',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#5f0080',
    fontWeight: 'bold',
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuItem: {
    padding: 10,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default MyKurlyScreen; 