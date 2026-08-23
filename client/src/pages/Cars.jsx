import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import CarCard from '../components/CarCard';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { assets } from '../assets/assets';

const Cars = () => {

  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const search = query.get("search") || ""

  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  const { axios } = useAppContext();
  const [cars, setCars] = useState([]);
  const [input, setInput] = useState(search);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSearchData = pickupLocation && pickupDate && returnDate;

  const fetchCars = async () => {
    setLoading(true);
    try {
      console.log('Fetching all cars...');
      const { data } = await axios.get('/api/cars');
      console.log('API Response:', data);
      if (data.success) {
        setCars(data.cars || []);
        setFilteredCars(data.cars || []);
      } else {
        toast.error('Failed to fetch cars');
        setCars([]);
        setFilteredCars([]);
      }
    } catch (error) {
      console.error('Error in fetchCars:', error);
      toast.error('Error fetching cars from server');
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCarAvailability = async () => {
    setLoading(true);
    try {
      console.log('Checking availability for:', { pickupLocation, pickupDate, returnDate });
      const { data } = await axios.post('/api/bookings/check-availability', {
        location: pickupLocation,
        pickupDate,
        returnDate,
      });
      console.log('Availability API Response:', data);
      
      if (data.success) {
        const availableCars = data.availableCars || [];
        setCars(availableCars);
        setFilteredCars(availableCars);
        if (availableCars.length === 0) {
          toast('No cars available for selected dates');
        }
      } else {
        toast.error(data.message || 'Failed to fetch available cars');
        setCars([]);
        setFilteredCars([]);
      }
    } catch (error) {
      console.error('Error in searchCarAvailability:', error);
      toast.error('Error checking car availability');
      setCars([]);
      setFilteredCars([]);s
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter cars locally by user input
  const applyFilter = () => {
    if (!input) {
      setFilteredCars(cars);
      return;
    }
    const filtered = cars.filter(
      (car) =>
        car?.brand?.toLowerCase().includes(input.toLowerCase()) ||
        car?.model?.toLowerCase().includes(input.toLowerCase()) ||
        car?.category?.toLowerCase().includes(input.toLowerCase()) ||
        car?.transmission?.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCars(filtered);
  };

  // 🔹 Initial fetch
useEffect(() => {
  if (isSearchData) {
    searchCarAvailability();
  } else {
    fetchCars();
  }
}, [pickupLocation, pickupDate, returnDate]);

  // 🔹 Reapply filters when user types or cars update
useEffect(() => {
  applyFilter();
}, [input, cars, search]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center py-20 bg-light max-md:px-4"
      >
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles available for your next adventure"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow"
        >
          <img src={assets.search_icon} alt="" className="w-4.5 h-4.5 mr-2" />
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Search by make, model, or features"
            className="w-full h-full outline-none text-gray-500"
          />
          <img src={assets.filter_icon} alt="" className="w-4.5 h-4.5 ml-2" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="px-6 md:px-16 lg:px-24 xl:px-32 mt-10"
      >
        {loading ? (
          <p className="text-center text-gray-500">Loading cars...</p>
        ) : (
          <>
            <p className="text-gray-500 xl:px-20 max-w-7xl mx-auto">
              Showing {filteredCars?.length || 0} Cars
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto">
              {filteredCars?.map((car, index) => (
                <motion.div
                  key={car._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <CarCard car={car} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Cars;