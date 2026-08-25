import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import Typography from '../../../../components/ui/Typography';
import { Colors } from '../../../../constant/colors';
import { Review } from '../../../../types/properties';
import { ReviewsAPI } from '../../../../api/reviews';

const ACCENT = '#FF6A39';
const BORDER = '#E5E7EB';

type ReviewsSectionProps = {
  propertyId: string;
  bookingId?: string; // only present if this tenant has a qualifying booking
  reviews: Review[];
  onReviewSubmitted: () => void;
};

const StarPicker = ({ rating, onChange }: { rating: number; onChange: (r: number) => void }) => (
  <View style={{ flexDirection: 'row', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity key={n} onPress={() => onChange(n)}>
        <Star
          size={28}
          color={ACCENT}
          fill={n <= rating ? ACCENT : 'transparent'}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const ReviewsSection = ({ propertyId, bookingId, reviews, onReviewSubmitted }: ReviewsSectionProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!bookingId) return;
    if (rating < 1) {
      Alert.alert('Pick a rating', 'Tap a star to rate your stay.');
      return;
    }
    setSubmitting(true);
    try {
      await ReviewsAPI.createReview({ propertyId, bookingId, rating, comment: comment || undefined });
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (err: any) {
      const message = err?.response?.data?.error?.message ?? 'Could not submit your review.';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Typography variant="h2">Reviews</Typography>

      {bookingId && (
        <View style={styles.form}>
          <Typography variant="subtitle" style={{ marginBottom: 8 }}>
            Rate your stay
          </Typography>
          <StarPicker rating={rating} onChange={setRating} />
          <TextInput
            style={styles.input}
            placeholder="Share your experience (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Typography variant="button">Submit Review</Typography>
            )}
          </TouchableOpacity>
        </View>
      )}

      {reviews.length === 0 ? (
        <Typography variant="caption" style={{ marginTop: 12 }}>
          No reviews yet.
        </Typography>
      ) : (
        reviews.map((review) => (
          <View key={`${review.userId}-${review.propertyId}`} style={styles.reviewCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typography variant="h3">{review.user.displayName}</Typography>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={14}
                    color={ACCENT}
                    fill={n <= review.rating ? ACCENT : 'transparent'}
                  />
                ))}
              </View>
            </View>
            {review.comment && (
              <Typography variant="body" style={{ marginTop: 4 }}>
                {review.comment}
              </Typography>
            )}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  form: { marginTop: 12, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  reviewCard: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 12,
  },
});

export default ReviewsSection;