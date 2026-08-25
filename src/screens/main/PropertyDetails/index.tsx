import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import ScreenWrapper from './components/ScreenWrapper'
import PropertyDetailsScreen from './components/PropertyDetailsScreen'
import ReviewsSection from './components/ReviewsSection'
import { PropertyAPI } from '../../../api/properties'
import { BookingAPI } from '../../../api/bookings'
import { ReviewsAPI } from '../../../api/reviews'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import Skeleton from '../../../components/ui/Skeleton'
import { SCREEN_HEIGHT } from '../../../constant/dimentions'
import { saveProperty, saveRoomTypes } from '../../../store/propertySlice'
import { Review } from '../../../types/properties'

const PropertyDetails = () => {
  const route: any = useRoute();
  const nav: any = useNavigation()
  const dispatch = useDispatch();
  const currentProperty = useSelector((state: RootState) => state.property.currentProperty)
  const roomTypes = useSelector((state: RootState) => state.property.roomType)
  const [reviews, setReviews] = useState<Review[]>([])
  const [qualifyingBookingId, setQualifyingBookingId] = useState<string | undefined>(undefined)

  const loadReviews = useCallback(() => {
    ReviewsAPI.getPropertyReviews(route.params.pid).then(setReviews)
  }, [route.params.pid])

  useEffect(() => {
    PropertyAPI.getSingleProperty(route.params.pid).then(d => {
      dispatch(saveProperty(d))
    })
    PropertyAPI.getPropertyRoomTypes(route.params.pid).then(d => {
      dispatch(saveRoomTypes(d))
    })
    loadReviews()
    BookingAPI.getMyBookings().then((bookings) => {
      const match = bookings.find(
        (b) => b.bookingStatus === 'CONFIRMED' && b.room.roomType.propertyId === route.params.pid,
      )
      if (match) setQualifyingBookingId(match.id)
    })
  }, [])

  return (
    <ScreenWrapper>
      {
        currentProperty ?
          <>
            <PropertyDetailsScreen
              title={currentProperty.title}
              address={currentProperty.address}
              badges={[...currentProperty.amenities]}
              stats={{ seatsAvailable: 10, minStayMonths: currentProperty.minStay, priceFrom: 'LKR 15K' }}
              rooms={roomTypes ?? []}
              onViewRooms={(id, name) => {
                nav.navigate('RoomTypeDetails', {
                  roomTypeId: id,
                  roomTypeName: name,
                  location: currentProperty.address
                })
              }}
            />
            <ReviewsSection
              propertyId={route.params.pid}
              bookingId={qualifyingBookingId}
              reviews={reviews}
              onReviewSubmitted={loadReviews}
            />
          </>
          :
          <Skeleton height={SCREEN_HEIGHT * 0.55} style={{ marginTop: '90%' }} width={'100%'} />
      }
    </ScreenWrapper>
  )
}
export default PropertyDetails