"use server";

import Order from "@/models/Order";
import connect from "./database";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const PaymentMethod = async (body) => {
  try {
    // 1. Connect to DB
    await connect();
    
    // --- THE FIX ---
    // MongoDB requires a comment. If the user left it blank, this provides a default value.
    body.comment = body.comment || "No comment provided"; 

    // 2. Create order in MongoDB
    const newOrder = await Order.create(body);

    // 3. Setup Stripe Amount (guarantees integer in cents)
    const unitAmount = Math.round(Number(body.price || 0) * 100);

    // 4. Setup line items
    const transformedItem = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: body.title || "Car Rental Booking", 
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ];

    // 5. Setup URLs 
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

    // 6. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: transformedItem,
      mode: "payment",
      success_url: `${baseUrl}/success/${newOrder._id}`,
      cancel_url: `${baseUrl}/cancel`,
    });

    // 7. Return the URL string back to StepFour.jsx
    if (session && session.url) {
      return session.url;
    } else {
      throw new Error("Session created but no URL found.");
    }

  } catch (error) {
    console.error("Stripe Server Action Error:", error.message || error);
    return null; 
  }
};