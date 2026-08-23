import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
import RecommendedCars from '../components/RecommendedCars'
import SmartRecommendations from '../components/SmartRecommendations'

const Home = () => {
  return (
  <>
  <Hero />
  <SmartRecommendations />   {/* 🔥 ADD THIS */}
  <FeaturedSection />
  <Testimonial />
  <Newsletter />
</>
  )
}

export default Home
