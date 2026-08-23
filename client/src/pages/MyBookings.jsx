import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, user } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);  // Add loading state

  const fetchMyBookings = async () => {
    console.log("User in context:", user);  // Debug: Check user
    console.log("Attempting to fetch bookings...");  // Debug: Fetch start
    try {
      const { data } = await axios.get("/api/bookings/user");
      console.log("API response:", data);  // Debug: Full response
      if (data.success) {
        setBookings(data.bookings);
        console.log("Fetched bookings:", data.bookings);  // Debug: Success
      } else {
        console.error("API error:", data.message);  // Debug: API failure
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);  // Debug: Catch error
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Temporarily remove user check to force fetch
    fetchMyBookings();
    // Re-add after testing: if (user) fetchMyBookings();
  }, []);

  console.log("Rendering MyBookings, bookings length:", bookings.length);  // Debug: Render check

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl">
      <Title
        title="My Bookings"
        subTitle="View and manage all your car bookings"
        align="left"
      />

      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading bookings...</p>  // Show loading
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No bookings found yet.
        </p>
      ) : (
        <div>
          {bookings.map((booking, index) => {
            console.log("Rendering booking:", booking._id);  // Debug: Each booking
            const car = booking.car || {};
            return (
              <div
                key={booking._id}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
              >
                {/* Car Info */}
                <div className="md:col-span-1">
                  <div className="rounded-md overflow-hidden mb-3">
                    <img
                      src={car.image || assets.placeholder_car}
                      alt=""
                      className="w-full h-auto aspect-video object-cover"
                    />
                  </div>
                  <p className="text-lg font-medium mt-2">
                    {car.brand} {car.model}
                  </p>
                  <p className="text-gray-500">
                    {car.year} • {car.category} • {car.location}
                  </p>
                </div>

                {/* Booking Info */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <p className="px-3 py-1.5 bg-light rounded">
                      Booking #{index + 1}
                    </p>
                    <p
                      className={`px-3 py-1 text-xs rounded-full ${
                        booking.status === "confirmed"
                          ? "bg-green-400/15 text-green-600"
                          : "bg-red-400/15 text-red-600"
                      }`}
                    >
                      {booking.status}
                    </p>
                  </div>

                  {/* Rental Period */}
                  <div className="flex items-start gap-2 mt-3">
                    <img
                      src={assets.calendar_icon_colored}
                      alt=""
                      className="w-4 h-4 mt-1"
                    />
                    <div>
                      <p className="text-gray-500">Rental Period</p>
                      <p>
                        {booking.pickupDate?.split("T")[0]} to{" "}
                        {booking.returnDate?.split("T")[0]}
                      </p>
                    </div>
                  </div>

                  {/* Pickup Location */}
                  <div className="flex items-start gap-2 mt-3">
                    <img
                      src={assets.location_icon_colored}
                      alt=""
                      className="w-4 h-4 mt-1"
                    />
                    <div>
                      <p className="text-gray-500">Pick-up Location</p>
                      <p>{booking.pickupLocation?.address || "Location not specified"}</p>
                    </div>
                  </div>

                  {/* Drop Location */}
                  <div className="flex items-start gap-2 mt-3">
                    <img
                      src={assets.location_icon_colored}
                      alt=""
                      className="w-4 h-4 mt-1"
                    />
                    <div>
                      <p className="text-gray-500">Drop Location</p>
                      <p>{booking.dropLocation?.address || "Location not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Price Info */}
                <div className="md:col-span-1 flex flex-col justify-between gap-6">
                  <div className="text-sm text-gray-500 text-right">
                    <p>Total Price</p>
                    <h1 className="text-2xl font-semibold text-primary">
                      ₹{booking.price}
                    </h1>
                    <p>Booked on {booking.createdAt?.split("T")[0]}</p>
                  </div>
                </div>
              </div>
            ); 
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;