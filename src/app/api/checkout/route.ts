import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodopayments";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    // Dodo Payments Checkout Session
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ 
        product_id: productId || process.env.DODO_PRODUCT_ID || "p_123", 
        quantity: 1 
      }],
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/roast?success=true`,
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    console.error("Dodo Checkout Error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}