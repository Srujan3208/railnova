import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay test credentials are not configured on the server." }, { status: 503 });
  }
  if (!keyId.startsWith("rzp_test_")) {
    return NextResponse.json({ error: "This demo checkout only accepts Razorpay test-mode keys." }, { status: 503 });
  }
  try {
    const body = await request.json();
    const amount = Number(body?.amount);
    if (!Number.isInteger(amount) || amount < 100 || amount > 10000000) {
      return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
    }
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(keyId + ":" + keySecret).toString("base64"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: "RNDEMO" + Date.now().toString(),
        notes: { app: "RAILNOVA", booking_mode: "DEMO_NOT_RAILWAY_RESERVATION" },
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.description || "Razorpay could not create the test order." }, { status: 502 });
    }
    return NextResponse.json({ keyId, orderId: data.id, amount: data.amount, currency: data.currency });
  } catch {
    return NextResponse.json({ error: "Unable to create Razorpay test order." }, { status: 500 });
  }
}
