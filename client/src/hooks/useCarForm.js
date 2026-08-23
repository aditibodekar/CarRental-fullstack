import { useState } from 'react'
import toast from 'react-hot-toast'

export const useCarForm = () => {

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

  const resetForm = () => {
  setCar({
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: '',
    location: '',
    description: '',
  })
}

 const handleNumberChange = (field, value) => {

  // Allow empty (so user can type/delete)
  if (value === '') {
    setCar(prev => ({ ...prev, [field]: '' }))
    return
  }

  // Block negative numbers
  if (Number(value) < 0) return

  setCar(prev => ({ ...prev, [field]: value }))
}



  const handleChange = (field, value) => {
    setCar(prev => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const year = Number(car.year)
    const price = Number(car.pricePerDay)
    const seats = Number(car.seating_capacity)

    if (!car.brand || !car.model) {
      return toast.error("Brand and Model are required")
    }

    if (year < 2000) {
      return toast.error("Enter valid year")
    }

    if (price <= 0) {
      return toast.error("Enter valid price")
    }

    if (!car.category) return toast.error("Select category")
    if (!car.transmission) return toast.error("Select transmission")
    if (!car.fuel_type) return toast.error("Select fuel type")

    if (seats < 2) {
      return toast.error("Invalid seating capacity")
    }

    if (!car.location) return toast.error("Select location")

    if (!car.description || car.description.length < 10) {
      return toast.error("Description too short")
    }

    return true
  }

  return { car, handleChange, handleNumberChange, validate, resetForm }
}