import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) {
    return NextResponse.json({ error: "Webhook key missing" }, { status: 500 });
  }

  const body = await req.text();
  // const signature = req.headers.get("dodo-signature") || "";

  try {
    const payload = JSON.parse(body);
    console.log("Dodo Webhook Received:", payload.type);

    if (payload.type === "payment.succeeded") {
      const { metadata, product_cart } = payload.data;
      const userId = metadata?.user_id;
      const productId = product_cart?.[0]?.product_id;
      const roastId = metadata?.roast_id;

      if (userId && productId) {
        let creditAmount = 0;
        if (productId === "p_one_shot") creditAmount = 1;
        else if (productId === "p_batch") creditAmount = 3;

        if (creditAmount > 0) {
          await supabaseAdmin.from('credits_ledger').insert({
            user_id: userId,
            amount: creditAmount,
            type: 'purchase',
            description: `Purchase of ${productId}`
          });
          console.log(`Granted ${creditAmount} credits to user ${userId}`);
        }

        // Handle specific PDF unlock
        if (productId === "p_pdf_export" && roastId) {
          await supabaseAdmin
            .from('roasts')
            .update({ pdf_unlocked: true })
            .eq('id', roastId);
          console.log(`Unlocked PDF for roast ${roastId}`);
        }

        // If it's a batch purchase, maybe unlock all roasts or future ones?
        // For now, api/roast handles checking p_batch for future roasts.
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}