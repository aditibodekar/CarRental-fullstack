import React, { useState } from "react";
import { motion } from "framer-motion";

export default function FakePaymentModal({ isOpen, onClose, onSuccess, amount }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>

        <div className="border p-4 rounded-lg mb-4">
          <p className="text-gray-600">Amount</p>
          <p className="text-2xl font-bold">₹{amount}</p>
        </div>

        <input
          type="text"
          placeholder="Card Number"
          className="w-full border p-2 rounded mb-3"
        />

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="MM/YY"
            className="w-1/2 border p-2 rounded"
          />
          <input
            type="text"
            placeholder="CVV"
            className="w-1/2 border p-2 rounded"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-sm text-gray-500"
        >
          Cancel
        </button>

        <p className="text-xs text-center text-gray-400 mt-3">
          Test Mode - No real payment
        </p>
      </motion.div>
    </div>
  );
}
