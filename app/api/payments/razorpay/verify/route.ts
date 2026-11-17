import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || !keyId.startsWith("rzp_test_")) {
    return NextResponse.json({ error: "Razorpay test credentials are not configured." }, { status: 503 });
  }
  try {
    const body = await request.json();
    const orderId = String(body?.razorpay_order_id || "");
    const paymentId = String(body?.razorpay_payment_id || "");
    const signature = String(body?.razorpay_signature || "");
    if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) {
      return NextResponse.json({ error: "Invalid Razorpay callback fields." }, { status: 400 });
    }
    const expected = createHmac("sha256", keySecret).update(orderId + "|" + paymentId).digest();
    const received = Buffer.from(signature, "hex");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return NextResponse.json({ verified: false, error: "Payment signature verification failed." }, { status: 400 });
    }
    const paymentResponse = await fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(paymentId), {
      headers: { Authorization: "Basic " + Buffer.from(keyId + ":" + keySecret).toString("base64") },
      cache: "no-store",
    });
    const payment = await paymentResponse.json().catch(() => ({}));
    if (!paymentResponse.ok || payment.order_id !== orderId || !["captured", "authorized"].includes(payment.status)) {
      return NextResponse.json({ verified: false, error: "Razorpay payment could not be confirmed." }, { status: 400 });
    }
    return NextResponse.json({
      verified: true,
      paymentId,
      orderId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      demoOnly: true,
    });
  } catch {
    return NextResponse.json({ error: "Unable to verify Razorpay payment." }, { status: 500 });
  }
}
