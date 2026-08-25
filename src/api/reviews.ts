import { Review, CreateReviewPayload } from "../types/properties";
import { apiClient } from "./apiClient";

export const ReviewsAPI = {
  getPropertyReviews: async (propertyId: string) => {
    const d = await apiClient.get<Review[]>(`reviews/property/${propertyId}`);
    return d.data;
  },
  createReview: async (payload: CreateReviewPayload) => {
    const d = await apiClient.post<Review>('reviews', payload);
    return d.data;
  },
};