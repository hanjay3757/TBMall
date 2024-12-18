import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';
import HamburgerMenu from '../components/HamburgerMenu';

import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SearchScreen from '../screens/SearchScreen';
import MyKurlyScreen from '../screens/MyKurlyScreen';
import CartScreen from '../screens/CartScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import { useCart } from '../context/CartContext';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import FindPasswordScreen from '../screens/auth/FindPasswordScreen';
import AddProductScreen from '../screens/admin/AddProductScreen';
import EmployeeManagementScreen from '../screens/admin/EmployeeManagementScreen';
import EmployeeDetailScreen from '../screens/admin/EmployeeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="홈메인" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="상품상세" 
        component={ProductDetailScreen}
        options={{
          headerTitle: '상품 정보',
          headerTintColor: '#000',
          headerStyle: {
            backgroundColor: '#fff',
          },
        }}
      />
      <Stack.Screen
        name="리뷰작성"
        component={WriteReviewScreen}
        options={{
          headerTitle: '리뷰 작성',
        }}
      />
    </Stack.Navigator>
  );
};

const MyPageStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="마이컬리메인" component={MyKurlyScreen} options={{ headerShown: false }} />
      <Stack.Screen 
        name="찜한상품" 
        component={WishlistScreen}
        options={{
          headerTitle: '찜한 상품',
        }}
      />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="로그인" 
        component={LoginScreen} 
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen name="회원가입" component={SignupScreen} />
      <Stack.Screen 
        name="이메일인증" 
        component={EmailVerificationScreen}
        options={{
          headerTitle: '이메일 인증',
        }}
      />
      <Stack.Screen 
        name="비밀번호찾기" 
        component={FindPasswordScreen}
        options={{
          headerTitle: '비밀번호 찾기',
        }}
      />
    </Stack.Navigator>
  );
};

const AdminStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="직원관리메인" 
        component={EmployeeManagementScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="직원상세" 
        component={EmployeeDetailScreen}
        options={({ route }) => ({
          title: route.params?.employee ? '직원 정보 수정' : '신규 직원 등록',
        })}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  const { cartItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerTitle: 'TBMall',
        headerTitleStyle: {
          color: '#5f0080',
          fontWeight: 'bold',
        },
        headerRight: () => (
          <HamburgerMenu navigation={navigation} />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case '홈':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case '카테고리':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case '검색':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case '마이컬리':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case '장바구니':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case '상품등록':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case '직원관리':
              iconName = focused ? 'people' : 'people-outline';
              break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5f0080',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="홈" component={HomeStack} />
      <Tab.Screen name="카테고리" component={CategoryScreen} />
      <Tab.Screen name="검색" component={SearchScreen} />
      <Tab.Screen name="마이컬리" component={MyPageStack} />
      <Tab.Screen 
        name="장바구니" 
        component={CartScreen}
        options={{
          tabBarBadge: cartItems.length || null,
        }}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { isLoading, userToken } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RootStack.Navigator>
      {userToken ? (
        <RootStack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <RootStack.Screen 
          name="Auth" 
          component={AuthStack}
          options={{ headerShown: false }}
        />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator; 