import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const Dashboard = () => {

  const { axios, isOwner } = useAppContext()

  const [carPredictions, setCarPredictions] = useState([]);
  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  // Dashboard Cards
  const dashboardCards = [
    { title: "Total Cars", value: data.totalCars, icon: assets.carIconColored },
    { title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored },
    { title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored },
  ]

  // Fetch dashboard
  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/owner/dashboard')
      if (data.success) setData(data.dashboardData)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Fetch ML prediction
  const fetchPrediction = async () => {
    try {
      const { data } = await axios.get("/api/owner/prediction")
      console.log("Predictions:", carPredictions)
      if (data.success) setCarPredictions(data.predictions)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData()
      fetchPrediction()
    }
  }, [isOwner])

  // 🔥 Combine all predictions
  const allPredictions = carPredictions.flatMap(c => c.prediction || [])

  const maxDemand = allPredictions.length ? Math.max(...allPredictions) : 0
  const minDemand = allPredictions.length ? Math.min(...allPredictions) : 0

  // 🔥 Dynamic pricing (based on average demand)
  const basePrice = 1000

  const pricingData = allPredictions.slice(0, 7).map((p, i) => {
    let multiplier = 1

    if (p > 1900) multiplier = 1.3
    else if (p > 1800) multiplier = 1.15
    else if (p < 1700) multiplier = 0.85

    return {
      day: i + 1,
      demand: Math.round(p),
      price: Math.round(basePrice * multiplier)
    }
  })

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>

      <Title
        title="Admin Dashboard"
        subTitle="Monitor cars, bookings, revenue, and AI demand predictions"
      />

      {/* Cards */}
      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8'>
        {dashboardCards.map((card, index) => (
          <div key={index} className='flex justify-between items-center p-4 rounded-xl border shadow-sm bg-white'>
            <div>
              <p className='text-sm text-gray-500'>{card.title}</p>
              <h2 className='text-xl font-semibold'>{card.value}</h2>
            </div>
            <div className='w-10 h-10 flex items-center justify-center rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-5 w-5' />
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap gap-6'>

        {/* Recent Bookings */}
        <div className='p-5 border rounded-xl bg-white w-full md:max-w-lg shadow-sm'>
          <h1 className='text-lg font-semibold'>Recent Bookings</h1>

          {data.recentBookings.map((booking, index) => (
            <div key={index} className='mt-4 flex justify-between'>
              <div>
                <p>{booking.car?.brand || "Unknown"} {booking.car.model}</p>
                <p className='text-xs text-gray-500'>{booking.createdAt.split('T')[0]}</p>
              </div>
              <div>
                <p>₹{booking.price}</p>
                <span className='text-xs border px-2 rounded'>{booking.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className='p-5 border rounded-xl bg-white w-full md:max-w-xs shadow-sm'>
          <h1>Monthly Revenue</h1>
          <h2 className='text-3xl font-bold mt-6'>₹{data.monthlyRevenue}</h2>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="p-4 bg-green-50 rounded-xl">
            <p>Peak Demand</p>
            <h2 className="text-xl font-bold">{Math.round(maxDemand)}</h2>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p>Lowest Demand</p>
            <h2 className="text-xl font-bold">{Math.round(minDemand)}</h2>
          </div>
        </div>

        {/* Dynamic Pricing */}
        <div className="p-5 border rounded-xl bg-white w-full">
          <h1>Dynamic Pricing</h1>

          {pricingData.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b text-sm">
              <span>Day {i + 1}</span>
              <span>Demand: {item.demand}</span>
              <span>₹{item.price}</span>
            </div>
          ))}
        </div>

        {/* Car-wise Charts */}
        <div className="w-full mt-6">
          <h1 className="text-xl font-semibold mb-4"> Demand Prediction</h1>

          {carPredictions.length === 0 ? (
            <p className="text-gray-400">Loading prediction...</p>
          ) : (
            carPredictions.map((carData, index) => {

              const chartData = carData.prediction.map((p, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i + 1);

                return {
                  date: date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short"
                  }),
                  demand: Math.round(p)
                };
              });

              return (
                <div key={index} className="bg-white shadow-md rounded-xl p-4 mb-6">
                  <h2 className="text-lg font-semibold mb-2">{carData.car}</h2>

                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="demand" stroke="#10B981" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard