import React, { useState, useEffect } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddCar = () => {

  const { axios, currency } = useAppContext()

  const [image, setImage] = useState(null)
  const [insurance, setInsurance] = useState(null)

  const [car, setCar] = useState({
    brand: '',
    model: '',
    year: 0,
    pricePerDay: 0,
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: 0,
    location: '',
    description: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  // ✅ cleanup preview memory
  useEffect(() => {
    return () => {
      if (insurance && insurance.type?.startsWith("image/")) {
        URL.revokeObjectURL(insurance)
      }
    }
  }, [insurance])

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // ✅ VALIDATION
    if (!car.brand || !car.model) {
      return toast.error("Brand and Model are required");
    }

    if (!car.year || car.year < 2000) {
      return toast.error("Enter valid year");
    }

    if (!car.pricePerDay || car.pricePerDay <= 0) {
      return toast.error("Enter valid price");
    }

    if (!car.category) return toast.error("Select category");
    if (!car.transmission) return toast.error("Select transmission");
    if (!car.fuel_type) return toast.error("Select fuel type");

    if (!car.seating_capacity || car.seating_capacity < 2) {
      return toast.error("Invalid seating capacity");
    }

    if (!car.location) return toast.error("Select location");

    if (!car.description || car.description.length < 10) {
      return toast.error("Description too short");
    }

    if (!image) return toast.error("Please upload a car image.");
    if (!insurance) return toast.error("Please upload car insurance document.");

    // ✅ FILE TYPE VALIDATION
    const validImageTypes = ["image/jpeg", "image/png"];
    const validDocTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!validImageTypes.includes(image.type)) {
      return toast.error("Only JPG/PNG images allowed");
    }

    if (!validDocTypes.includes(insurance.type)) {
      return toast.error("Insurance must be PDF/JPG/PNG");
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('insurance', insurance);
      formData.append('carData', JSON.stringify(car));

      const { data } = await axios.post('/api/owner/add-car', formData);

      if (data.success) {
        toast.success(data.message);

        setImage(null);
        setInsurance(null);
        setCar({
          brand: '',
          model: '',
          year: 0,
          pricePerDay: 0,
          category: '',
          transmission: '',
          fuel_type: '',
          seating_capacity: 0,
          location: '',
          description: '',
        });
      } else {
        toast.error(data.message || "Failed to add car.");
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding car");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>
      <Title
        title="Add New Car"
        subTitle="Fill in details to list a new car for booking, including pricing, availability, and car specifications."
      />

      <form
        onSubmit={onSubmitHandler}
        className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'
      >

        {/* Car Image Upload */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor="car-image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              alt=""
              className='h-14 rounded cursor-pointer'
            />
            <input
              type="file"
              id="car-image"
              accept="image/*"
              hidden
              onChange={e => setImage(e.target.files[0])}
            />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car</p>
        </div>

        {/* Insurance Upload */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor="insurance-file" className='cursor-pointer flex items-center gap-2'>

            {/* ✅ PREVIEW */}
            {insurance ? (
              insurance.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(insurance)}
                  alt="insurance preview"
                  className='h-14 w-14 object-cover rounded border'
                />
              ) : (
                <div className='flex flex-col items-center'>
                  <img src={assets.file_icon} className='h-10' />
                  <p className='text-xs'>{insurance.name}</p>
                </div>
              )
            ) : (
              <img
                src={assets.upload_icon}
                alt=""
                className='h-14 rounded'
              />
            )}

            <input
              type="file"
              id="insurance-file"
              accept=".pdf, image/*"
              hidden
              onChange={e => setInsurance(e.target.files[0])}
            />
          </label>

          <p className='text-sm text-gray-500'>
            Upload car insurance (PDF, JPG, PNG)
          </p>
        </div>

        {/* ✅ REMOVE BUTTON */}
        {insurance && (
          <button
            type="button"
            onClick={() => setInsurance(null)}
            className="text-red-500 text-xs w-fit"
          >
            Remove Insurance
          </button>
        )}

        {/* Car Brand & Model */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Brand</label>
            <input
              type="text"
              placeholder="e.g. BMW, Mercedes, Audi..."
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.brand}
              onChange={e => setCar({ ...car, brand: e.target.value })}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label>Model</label>
            <input
              type="text"
              placeholder="e.g. X5, E-Class, M4..."
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.model}
              onChange={e => setCar({ ...car, model: e.target.value })}
            />
          </div>
        </div>

        {/* REST SAME (UNCHANGED UI) */}
        {/* Car Year, Price, Category */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Year</label>
            <input
              type="number"
              placeholder="2025"
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.year}
              onChange={(e) => {
  const value = e.target.value;

  // allow empty input
  if (value === '') {
    setCar({ ...car, year: '' });
    return;
  }

  const parsed = parseInt(value);

  // block negative numbers
  if (parsed < 0) return;

  setCar({ ...car, year: parsed });
}}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label>Daily Price (₹)</label>
            <input
              type="number"
              placeholder="100"
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.pricePerDay}
              onChange={(e) => {
  const value = e.target.value;

  // allow empty input
  if (value === '') {
    setCar({ ...car, pricePerDay: '' });
    return;
  }

  const parsed = parseInt(value);

  // block negative numbers
  if (parsed < 0) return;

  setCar({ ...car, pricePerDay: parsed });
}}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label>Category</label>
            <select
              onChange={e => setCar({ ...car, category: e.target.value })}
              value={car.category}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            >
              <option value="">Select a category</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Van">Van</option>
              <option value="Sports Car">Sports Car</option>
              <option value="Hatchback">Hatchback</option>
            </select>
          </div>
        </div>

        {/* Transmission, Fuel, Seating */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label>Transmission</label>
            <select
              onChange={e => setCar({ ...car, transmission: e.target.value })}
              value={car.transmission}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            >
              <option value="">Select a transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Fuel Type</label>
            <select
              onChange={e => setCar({ ...car, fuel_type: e.target.value })}
              value={car.fuel_type}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            >
              <option value="">Select a fuel type</option>
              <option value="Gas">Gas</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label>Seating Capacity</label>
            <input
              type="number"
              placeholder="4"
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              value={car.seating_capacity}
              onChange={(e) => {
  const value = e.target.value;

  // allow empty input
  if (value === '') {
    setCar({ ...car, seating_capacity: '' });
    return;
  }

  const parsed = parseInt(value);

  // block negative numbers
  if (parsed < 0) return;

  setCar({ ...car, seating_capacity: parsed });
}}
            />
          </div>
        </div>

        {/* Location */}
        <div className='flex flex-col w-full'>
          <label>Location</label>
          <select
            onChange={e => setCar({ ...car, location: e.target.value })}
            value={car.location}
            className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
          >
            <option value="">Select a location</option>
            <option value="Badlapur">Badlapur</option>
            <option value="Andheri">Andheri</option>
            <option value="Thane">Thane</option>
            <option value="Pune">Pune</option>
          </select>
        </div>

        {/* Description */}
        <div className='flex flex-col w-full'>
          <label>Description</label>
          <textarea
            rows={5}
            placeholder="e.g. A luxurious SUV with a spacious interior and a powerful engine."
            required
            className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            value={car.description}
            onChange={e => setCar({ ...car, description: e.target.value })}
          ></textarea>
        </div>


        {/* Submit Button */}
        <button
          className='flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer'
        >
          <img src={assets.tick_icon} alt="" />
          {isLoading ? 'Listing...' : 'List Your Car'}
        </button>

      </form>
    </div>
  )
}

export default AddCar      