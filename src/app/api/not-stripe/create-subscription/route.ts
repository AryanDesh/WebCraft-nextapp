import { db } from "@/lib/db";
import { razorpay } from "@/lib/not-stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { customerId, planId } = await req.json()
    if (!customerId || !planId)
      return new NextResponse('Customer Id or plan id or Offer Id is missing', {
        status: 400,
      })
  
    const subscriptionExists = await db.agency.findFirst({
      where: { customerId },
      include: { Subscription: true },
    })
  
    try {
      if (
        subscriptionExists?.Subscription?.subscriptionId &&
        subscriptionExists.Subscription.active
      ) {
        if (!subscriptionExists.Subscription.subscriptionId) {
          throw new Error(
            'Could not find the subscription Id to update the subscription.'
          )
        }
        console.log('Updating the subscription')
        const currentSubscriptionDetails = await razorpay.subscriptions.fetch(
          subscriptionExists.Subscription.subscriptionId
        )
        const subscription = await razorpay.subscriptions.update(
            subscriptionExists.Subscription.subscriptionId,
            {
              customer_notify: 1
            }
        )
        return NextResponse.json({
          subscriptionId: subscription.id,
          status: subscription.status,
          url: subscription.short_url,
          plan_id: subscription.plan_id,
          current_end: subscription.ended_at,
        })
      } else {
        console.log('Creating a sub ',planId )
        const customer = await db.agency.findFirst({
          where: { customerId },
          include: { Subscription: true },
        })
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 12,
            quantity: 1,
// may need to get the expiry date from the client itself.
            expire_by: Date.now() + 24 * 60 * 60 * 1000,
            customer_notify: 1,
            notify_info: {
                notify_phone: customer?.companyPhone,
                notify_email: customer?.companyEmail
            }
        })
        return NextResponse.json({
          subscriptionId: subscription.id,
          status: subscription.status,
          url: subscription.short_url,
          current_end: subscription.expire_by,
          plan_id : subscription.plan_id
        })
      }
    } catch (error) {
      console.log('🔴 Error', error)
      return new NextResponse('Internal Server Error', {
        status: 500,
      })
    }
  }
  