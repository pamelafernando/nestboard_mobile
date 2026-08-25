import { Property, PropertyItem, PropertyListResponse, RoomType } from "../types/properties";
import { apiClient } from "./apiClient"

export type MyBooking = {
  id: string;
  bookingStatus: string;
  room: {
    roomType: {
      propertyId: string;
    };
  };
};

export const BookingAPI = {
  bookProperty: async (
    roomId: string,
    seatIndex: number,
    date: string,
    period: number,
    total: string
  ) => {
    await apiClient.put<PropertyListResponse>('bookings', {
      roomId,
      seatIndex,
      date,
      period,
      total: parseFloat(total)
    })
  },
  getMyBookings: async () => {
    const d = await apiClient.get<MyBooking[]>('bookings/my');
    return d.data;
  },
}