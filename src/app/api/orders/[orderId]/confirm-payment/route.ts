import { NextRequest, NextResponse } from "next/server";
import { confirmPayment } from "@/actions/order/orderServices";

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params;

  try {
    const result = await confirmPayment(orderId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
