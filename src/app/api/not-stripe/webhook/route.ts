import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { razorpay } from "@/lib/not-stripe";
export async function POST(req: Request) {
    return NextResponse.json({
        message : "Hello world"
    })
}