import { NextRequest, NextResponse } from "next/server";

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
      const { customer } = payload.data;
      console.log(`Payment successful for ${customer.email}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}