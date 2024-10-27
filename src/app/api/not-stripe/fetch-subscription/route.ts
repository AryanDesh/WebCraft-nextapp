import { db } from "@/lib/db";
import { razorpay } from "@/lib/not-stripe";
import { NextResponse } from "next/server";
import { custom, late } from "zod";

export async function POST(req: Request) {
    const { customerId, selectedPlanId } = await req.json()
    if(!selectedPlanId) return;
    try{

      const subscriptions =  await razorpay.subscriptions.all({
        count : 10,
        plan_id: selectedPlanId
      })
      const length = subscriptions.items.length
      const latest = subscriptions.items[length]
      const url = latest.short_url
      return NextResponse.json({
        status : latest.status,
        id : latest.id,
        url : url
      })
    }
    catch(error){
      console.log('🔴 Error', error)
      return new NextResponse('Internal Server Error', {
        status: 500,
      })
    }
}
    // const addOns = await Promise.all(addOnPromises);  }
  