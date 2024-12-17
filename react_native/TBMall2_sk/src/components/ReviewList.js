import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useReview } from '../context/ReviewContext';

const ReviewItem = ({ review }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Icon
        key={i}
        name={i < review.rating ? 'star' : 'star-outline'}
        size={16}
        color="#FFD700"
      />
    );
  }

  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.userName}>{review.userName}</Text>
        <View style={styles.stars}>{stars}</View>
      </View>
      <Text style={styles.content}>{review.content}</Text>
      <Text style={styles.date}>
        {new Date(review.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
};

const ReviewList = ({ productId, navigation }) => {
  const { getProductReviews } = useReview();
  const reviews = getProductReviews(productId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>상품 리뷰</Text>
        <TouchableOpacity
          style={styles.writeButton}
          onPress={() => navigation.navigate('리뷰작성', { productId })}
        >
          <Text style={styles.writeButtonText}>리뷰 작성</Text>
        </TouchableOpacity>
      </View>

      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>아직 리뷰가 없습니다.</Text>
      ) : (
        <FlatList
          data={reviews}
          renderItem={({ item }) => <ReviewItem review={item} />}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  writeButton: {
    backgroundColor: '#5f0080',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontWeight: 'bold',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  content: {
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
});

export default ReviewList; 