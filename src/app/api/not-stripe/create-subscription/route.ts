import { db } from "@/lib/db";
import { razorpay } from "@/lib/not-stripe";
import { NextResponse } from "next/server";
import { custom } from "zod";

export async function POST(req: Request) {
    const { customerId, planId } = await req.json()
    if (!customerId || !planId)
      return new NextResponse('Customer Id or price id or Offer Id is missing', {
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
        //update the subscription instead of creating one.
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
              "plan_id" : planId
            }
        )
// If needed Create an invoice here.
        // const createInvoice = await razorpay.invoices.create({
        //   "type": "invoice",
        //   "date": Date.now()/1000,
        //   "customer_id": customerId,
        //   "line_items": [
        //     {
        //       "item_id" : 
        //     }
        //   ]
        // })
// Get latets invoice if needed
        // const latest_invoice = await razorpay.invoices.all({
        //     subscription_id: subscriptionExists.Subscription.subscriptionId
        // })
        return NextResponse.json({
          subscriptionId: subscription.id,
          // clientSecret: latest_invoice.items[0],
          status: subscription.status
        })
      } else {
        console.log('Creating a sub')
        const customer = await db.agency.findFirst({
          where: { customerId },
          include: { Subscription: true },
        })
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 12,
            quantity: 1,
// may need to get the expiry date from the client itself.
            expire_by: Date.now() + 365.25 * 24 * 60 * 60 * 1000,
            customer_notify: 1,
            notify_info: {
                notify_phone: customer?.companyPhone,
                notify_email: customer?.companyEmail
            }
        })
        return NextResponse.json({
          subscriptionId: subscription.id,
          // clientSecret: latest_invoice.items[0],
          status: subscription.status
        })
      }
    } catch (error) {
      console.log('🔴 Error', error)
      return new NextResponse('Internal Server Error', {
        status: 500,
      })
    }
  }
  