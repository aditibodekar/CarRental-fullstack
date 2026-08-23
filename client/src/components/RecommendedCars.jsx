import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import CarCard from './CarCard'
import toast from 'react-hot-toast'

const RecommendedCars = () => {
  const { axios } = useAppContext()

  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRecommendedCars = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/cars')

      if (data.success) {
        // ✅ Only available cars
        let availableCars = data.cars.filter(car => car.isAvailable)

        // ✅ Sort by price (balanced mix)
        availableCars.sort((a, b) => a.pricePerDay - b.pricePerDay)

        // ✅ Take top 6
        setCars(availableCars.slice(0, 6))
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load recommendations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendedCars()
  }, [])

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-20'>
      
      <h2 className='text-2xl font-semibold mb-2 text-gray-900'>
        Recommended Cars 🚗
      </h2>
      <p className='text-gray-500 mb-6'>
        Handpicked vehicles based on availability and pricing
      </p>

      {loading ? (
        <p className='text-gray-500'>Loading...</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendedCars