import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ReviewProvider } from './src/context/ReviewContext';
import { EmailVerificationProvider } from './src/context/EmailVerificationContext';
import { SocialAuthProvider } from './src/context/SocialAuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <SocialAuthProvider>
          <EmailVerificationProvider>
            <WishlistProvider>
              <ReviewProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </ReviewProvider>
            </WishlistProvider>
          </EmailVerificationProvider>
        </SocialAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
