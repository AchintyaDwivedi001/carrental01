import connect from "@/lib/database";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
  try {
    const body = await req.json();

    await connect();
    body.comment = body.comment || "No comment provided"; 
    const newOrder = await Order.create(body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: body.title || "Car Rental Booking",
            },
            unit_amount: Math.round(Number(body.price || 0) * 100), 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/success/${newOrder._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });

  } catch (error) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};