import { NextRequest, NextResponse } from "next/server";
import { dodo } from "@/lib/dodopayments";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, roastId } = await req.json();

    // Dodo Payments Checkout Session
    const session = await dodo.checkoutSessions.create({
      customer: {
        email: user.email!,
      },
      product_cart: [{
        product_id: productId || process.env.DODO_PRODUCT_ID || "p_123",
        quantity: 1
      }],
      metadata: {
        user_id: user.id,
        roast_id: roastId || ""
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/roast?payment_success=true${roastId ? `&roast_id=${roastId}` : ""}`,
    });

    return NextResponse.json({ url: session.checkout_url });
  } catch (error) {
    console.error("Dodo Checkout Error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}