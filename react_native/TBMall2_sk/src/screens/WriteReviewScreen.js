import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useReview } from '../context/ReviewContext';
import Icon from 'react-native-vector-icons/Ionicons';

const WriteReviewScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addReview } = useReview();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    const review = {
      rating,
      content,
      userName: '사용자',  // 실제 구현시 로그인된 사용자 정보 사용
      createdAt: new Date().toISOString(),
    };

    addReview(product.id, review);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>별점</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
            >
              <Icon
                name={star <= rating ? 'star' : 'star-outline'}
                size={30}
                color="#FFD700"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.label}>리뷰 작성</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="상품에 대한 평가를 작성해주세요."
          value={content}
          onChangeText={setContent}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>리뷰 등록</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  contentContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#5f0080',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WriteReviewScreen; 