import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import CarCard from './CarCard'

const SmartRecommendations = () => {
  const { axios, token } = useAppContext()

  const [trending, setTrending] = useState([])
  const [recommended, setRecommended] = useState([])

  const fetchData = async () => {
    try {
      // 🔥 Trending Cars
      const trendingRes = await axios.get('/api/cars/trending')
      console.log("Trending API:", trendingRes.data) // ✅ HERE
      if (trendingRes.data.success) {
        setTrending(trendingRes.data.cars)
      }

      // 🔥 Personalized (only if logged in)
      if (token) {
        const recRes = await axios.get('/api/cars/recommended')
        if (recRes.data.success) {
          setRecommended(recRes.data.cars)
        }
      }

    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-20 space-y-12'>

      {/* 🔥 Personalized */}
      {recommended.length > 0 && (
        <div>
          <h2 className='text-2xl font-semibold mb-4'>
            Recommended For You 🧠
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {recommended.map(car => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        </div>
      )}

      {/* 🔥 Trending */}
      <div>
        <h2 className='text-2xl font-semibold mb-4'>
          Most Booked Cars 🔥
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {trending.map(car => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default SmartRecommendations