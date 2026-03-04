import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// const PRICE_INR = 39900; // ₹399 in paise
// const PRICE_INR = 5900; // ₹59 in paise
const PRICE_INR = 100; // ₹1 in paise
const PRICE_USD = "5.00";

// function getCountry(req: Request) {
//   if (process.env.NODE_ENV === "development") {
//     return "IN";
//   }

//   return (
//     req.headers.get("x-vercel-ip-country") ||
//     req.headers.get("cf-ipcountry") ||
//     "US"
//   );
// }
function getCountry(req: Request) {
  // 🔥 Manual override for dev/testing
  const override = process.env.PAYMENT_COUNTRY_OVERRIDE;
  if (override) {
    return override.toUpperCase();
  }

  // Production detection
  return (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "US"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId } = body as { jobId?: string };

    /* ================= VALIDATION ================= */

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid jobId" },
        { status: 400 }
      );
    }

    const country = getCountry(req);

    /* ================= INDIA → RAZORPAY ================= */

    if (country === "IN") {
      const order = await razorpay.orders.create({
        amount: PRICE_INR,
        currency: "INR",
        receipt: `job_${jobId}`,
        notes: {
          jobId,
          product: "handwritten_to_doc",
        },
      });

      return NextResponse.json({
        gateway: "razorpay",
        key: process.env.RAZORPAY_KEY_ID,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      });
    }

    /* ================= GLOBAL → PAYPAL ================= */

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    if (!tokenRes.ok) {
      throw new Error("PayPal auth failed");
    }

    const { access_token } = await tokenRes.json();

    const orderRes = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: jobId,
              custom_id: jobId,
              amount: {
                currency_code: "USD",
                value: PRICE_USD,
              },
            },
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/handwritten-to-doc/preview`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/handwritten-to-doc/preview`,
          },
        }),
      }
    );

    if (!orderRes.ok) {
      throw new Error("PayPal order creation failed");
    }

    const order = await orderRes.json();

    const approveUrl = order.links?.find(
      (l: any) => l.rel === "approve"
    )?.href;

    if (!approveUrl) {
      throw new Error("PayPal approval URL missing");
    }

    return NextResponse.json({
      gateway: "paypal",
      approveUrl,
    });
  } catch (err: any) {
    console.error("🔥 Checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
