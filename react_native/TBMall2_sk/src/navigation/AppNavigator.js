import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SearchScreen from '../screens/SearchScreen';
import MyKurlyScreen from '../screens/MyKurlyScreen';
import CartScreen from '../screens/CartScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import { useCart } from '../context/CartContext';
import WriteReviewScreen from '../screens/WriteReviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

const TabNavigator = () => {
  const { cartItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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

export default TabNavigator; 