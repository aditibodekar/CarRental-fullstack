import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import MapComponent from "../components/MapComponent";
import FakePaymentModal from "../components/FakePaymentModal";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CarDetails = () => {
  const { id } = useParams()
  const { axios } = useAppContext()
  const navigate = useNavigate()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [pickupLocation, setPickupLocation] = useState(null)
  const [dropLocation, setDropLocation] = useState(null)

  const [pickupDate, setPickupDate] = useState(null)
  const [returnDate, setReturnDate] = useState(null)

  const [bookedDates, setBookedDates] = useState([])
  const [showPayment, setShowPayment] = useState(false)

  const currency = import.meta.env.VITE_CURRENCY || '₹'

  // ✅ ADD THIS (same as backend)
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;

    const s = new Date(start);
    const e = new Date(end);

    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays(pickupDate, returnDate);
  const totalPrice = totalDays * (car?.pricePerDay || 0);
  // ================= FETCH CAR =================
  const fetchCarDetails = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/cars/${id}`)
      if (data.success) setCar(data.car)
      else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ================= FETCH BOOKINGS =================
  const fetchBookedDates = async () => {
    try {
      const { data } = await axios.get(`/api/bookings/car/${id}`)
      if (data.success) setBookedDates(data.bookings)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCarDetails()
      fetchBookedDates()
    }
  }, [id])

  // ================= DATE BLOCK =================
  const isDateBooked = (date) => {
    return bookedDates.some((b) => {
      const start = new Date(b.pickupDate)
      const end = new Date(b.returnDate)
      return date >= start && date <= end
    })
  }

  // 🎨 Highlight booked dates
  const getDayClassName = (date) => {
    const isBooked = bookedDates.some((b) => {
      const start = new Date(b.pickupDate)
      const end = new Date(b.returnDate)
      return date >= start && date <= end
    })
    return isBooked ? "booked-date" : undefined
  }

  const isRangeBooked = () => {
    if (!pickupDate || !returnDate) return false

    return bookedDates.some((b) => {
      const start = new Date(b.pickupDate)
      const end = new Date(b.returnDate)
      return pickupDate <= end && returnDate >= start
    })
  }

  // ================= PAYMENT =================
  const handlePaymentSuccess = async () => {
    try {
      const { data } = await axios.post('/api/bookings/create', {
        car: id,
        pickupDate,
        returnDate,
        pickupLocation,
        dropLocation
      })

      if (data.success) {
        toast.success("Booking Confirmed ✅")
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error("Something went wrong")
    }
  }

  // ================= SUBMIT =================
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!pickupDate || !returnDate) {
      return toast.error('Please select both pickup and return dates')
    }

    if (pickupDate >= returnDate) {
      return toast.error('Return date must be after pickup date')
    }

    if (!pickupLocation?.lat || !dropLocation?.lat) {
      return toast.error('Please select pickup and drop location')
    }

    if (isRangeBooked()) {
      return toast.error('Selected dates are already booked')
    }

    setShowPayment(true)
  }

  // ================= UI =================
  if (loading) return <Loader />

  if (error) {
    return (
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16 text-center'>
        <p className='text-red-500 text-lg mb-4'>Error: {error}</p>
        <button 
          onClick={() => navigate('/cars')} 
          className='mt-4 bg-primary text-white px-6 py-2 rounded-lg'
        >
          Back to Cars
        </button>
      </div>
    )
  }

  if (!car) return null

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>

      <button 
        onClick={() => navigate(-1)} 
        className='flex items-center gap-2 mb-6 text-gray-500'
      >
        <img src={assets.arrow_icon} className='rotate-180 w-4' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

        {/* LEFT SIDE */}
        <div className='lg:col-span-2'>

          <img
            src={car.image || assets.main_car}
            className='w-full h-64 md:h-96 object-cover rounded-xl mb-6'
          />

          <h1 className='text-3xl font-bold'>
            {car.brand} {car.model}
          </h1>

          <p className='text-gray-500 mt-2'>
            {car.category} • {car.year}
          </p>

          <p className={`mt-2 ${
            car.isAvailable ? "text-green-600" : "text-red-500"
          }`}>
            {car.isAvailable ? "Available" : "Unavailable"}
          </p>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6'>
            {[
              { icon: assets.users_icon, text: `${car.seating_capacity || 4} Seats` },
              { icon: assets.fuel_icon, text: car.fuel_type },
              { icon: assets.car_icon, text: car.transmission },
              { icon: assets.location_icon, text: car.location }
            ].map((item, i) => (
              <div key={i} className='bg-gray-50 p-4 rounded-lg text-center'>
                <img src={item.icon} className='h-5 mx-auto mb-2' />
                <span className='text-sm'>{item.text}</span>
              </div>
            ))}
          </div>

          <div className='mt-6'>
            <h2 className='text-xl font-semibold mb-2'>Description</h2>
            <p className='text-gray-600'>
              {car.description}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <form onSubmit={handleSubmit} className='shadow-lg p-6 rounded-xl space-y-6'>

          <p className='text-2xl font-semibold'>
            {currency}{car.pricePerDay}/day
          </p>

          <div>
            <label>Pickup Location</label>
            <MapComponent setLocation={setPickupLocation} />
            {pickupLocation && <p className='text-sm mt-2'>📍 {pickupLocation.address}</p>}
          </div>

          <div>
            <label>Drop Location</label>
            <MapComponent setLocation={setDropLocation} />
            {dropLocation && <p className='text-sm mt-2'>📍 {dropLocation.address}</p>}
          </div>

          <div>
            <label>Pickup Date</label>
            <DatePicker
              selected={pickupDate}
              onChange={(date) => setPickupDate(date)}
              filterDate={(date) => !isDateBooked(date)}
              dayClassName={getDayClassName}
              minDate={new Date()}
              className='border px-4 py-3 w-full rounded-lg'
            />
          </div>

          <div>
            <label>Return Date</label>
            <DatePicker
              selected={returnDate}
              onChange={(date) => setReturnDate(date)}
              filterDate={(date) => !isDateBooked(date)}
              dayClassName={getDayClassName}
              minDate={pickupDate || new Date()}
              className='border px-4 py-3 w-full rounded-lg'
            />

            {isRangeBooked() && (
              <p className='text-red-500 text-sm mt-2'>
                Selected dates not available
              </p>
            )}

            <p className="text-sm text-gray-500 mt-2">
              🔴 Booked dates are unavailable
            </p>
          </div>

          <button
            type="submit"
            disabled={isRangeBooked()}
            className='w-full py-3 bg-primary text-white rounded-lg'
          >
            Book Now
          </button>

          {/* ✅ ONLY CHANGE HERE */}
          <FakePaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
            amount={totalPrice}
          />
        </form>

      </div>
    </div>
  )
}

export default CarDetails