"use client";
import { getDistance } from "@/lib/distance";
import { PaymentMethod } from "@/lib/stripe";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const StepFour = ({ form }) => {
  const router = useRouter();
  const [price, setPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state

  const {
    imgUrl,
    transfertype,
    title,
    firstname,
    lastname,
    email,
    phoneNumber,
    comment,
    source,
    destination,
  } = form.getValues();

  useEffect(() => {
    if (source?.length && destination?.length) {
      const sourceVal = source?.split(",");
      const destinationVal = destination?.split(",");
      const distanceInKM = getDistance(
        parseFloat(sourceVal[0]),
        parseFloat(sourceVal[1]),
        parseFloat(destinationVal[0]),
        parseFloat(destinationVal[1])
      );
      const finalPrice =
        transfertype == "one way"
          ? parseInt(distanceInKM)
          : 2 * parseInt(distanceInKM);
      setPrice(finalPrice);
    }
  }, [source, destination, transfertype]);

  const Submit = async () => {
    setIsSubmitting(true); // Disable button while loading
    try {
      // 1. Call the Server Action
      const url = await PaymentMethod({ ...form.getValues(), price });
      
      // 2. Safe Routing: Only push if a valid URL string is returned
      if (url && typeof url === 'string') {
        router.push(url);
      } else {
        // 3. Fallback: If it returns null (because DB or Stripe failed)
        alert("Payment initialization failed. Please check your database connection and try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className="max-w-[1150px] mx-auto">
      <div className="grid grid-cols-1 p-4 mt-10">
        <div className="relative w-full mb-4 rounded overflow-hidden">
          {/* Added fallback to prevent broken images */}
          {imgUrl && <img src={imgUrl} className="object-cover" alt="Car" />}
        </div>
        <div className="pt-8">
          <div className="flex justify-between items-center border-b mb-5 pb-5">
            <h3 className="text-3xl font-bold ">{title}</h3>
            <p className="text-lg font-bold">
              Price: <span className="text-2xl">${price}</span>
            </p>
          </div>
          <h3 className="text-2xl font-bold mb-5">Order Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-50 p-5 rounded-lg mb-8">
            <div className="flex justify-between p-2">
              <span className="font-bold">First Name:</span>
              <span>{firstname}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold">Last Name:</span>
              <span>{lastname}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold">Email:</span>
              <span>{email}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold">Phone Number:</span>
              <span>{phoneNumber}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold">Comment:</span>
              <span>{comment}</span>
            </div>
          </div>

          <button
            className={`font-bold w-full py-2.5 px-4 rounded-md transition-colors ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
            }`}
            onClick={Submit}
            disabled={isSubmitting} // Prevent double-clicks
          >
            {isSubmitting ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepFour;