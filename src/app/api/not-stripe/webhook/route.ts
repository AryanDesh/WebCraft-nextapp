
export async function GET(req: Request) {
    try {
        console.log('Webhook Route', )
        return new NextResponse("Hello World")
    } catch (error) {
      console.log('🔴 Error', error)
      return new NextResponse('Internal Server Error', {
        status: 500,
      })
    }
  }
  
import Razorpay from "razorpay";
import crypto from "crypto"; 
import { db } from "@/lib/db";
import { razorpay } from "@/lib/not-stripe";

// export async function POST(req: Request) {

//  if (isAuthentic) {

//   //  return NextResponse.redirect(new URL('/paymentsuccess', req.url));

// } else {
//     return NextResponse.json({
//         message: "fail"
//       }, {
//         status: 400,
//       })

// }


// return NextResponse.json({
//     message: "success"
//   }, {
//     status: 200,
//   })

// }

const WebhookEvents = new Set([
  // "payment.authorized",
  // "payment.failed",
  // "payment.captured",
  // "payment.dispute.created",
  // payment.dispute.won
  // payment.dispute.lost
  // payment.dispute.closed
  // payment.dispute.under_review
  // payment.dispute.action_required
  // payment.downtime.started
  // payment.downtime.updated
  // payment.downtime.resolved
  // order.paid
  // order.notification.delivered
  // order.notification.failed
  // invoice.paid
  // invoice.partially_paid
  // invoice.expired
  // "subscription.authenticated",
  // "subscription.paused",
  // "subscription.resumed",
  "subscription.activated",
  // "subscription.pending",
  // "subscription.halted",
  // "subscription.charged",
  // "subscription.cancelled",
  "subscription.completed",
  // "subscription.updated",
  // "settlement Events",
  // "settlement.processed"
  // fund_account Events
  // fund_account.validation.completed
  // fund_account.validation.failed
  // refund Events
  // refund.speed_changed
  // refund.processed
  // refund.failed
  // refund.created
  // transfer Events
  // transfer.processed
  // transfer.failed
  // account Events
  // account.instantly_activated
  // account.activated_kyc_pending
  // account.under_review
  // account.needs_clarification
  // account.activated
  // account.rejected
  // account.updated
  // payment_link Events
  // payment_link.paid
  // payment_link.partially_paid
  // payment_link.expired
  // payment_link.cancelled
  // product Events
  // product.route.under_review
  // product.route.activated
  // product.route.needs_clarification
  // product.route.rejected
  ])
  
  
  import { NextRequest, NextResponse } from 'next/server'
  import { headers } from 'next/headers'
  import { subscriptionCreated } from "@/lib/not-stripe/actions";
  import { Invoices } from "@prisma/client";


function removeUndefinedFields<T>(obj: Partial<T>): T {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as T;
}

  export async function POST(req: NextRequest) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = await req.json();
    const headers = await req.headers;
    // const sig= await headers['X-Razorpay-Signature']
    console.log(headers);
    const {event} = body;
  try {
    if (WebhookEvents.has(event)) {
      const subscription = body.payload.subscription;
      const subscriptionDB = await db.subscription.findFirst({
        where: {
          subscriptionId: subscription.entity.id
        }
      })
      const invoice : Partial<Invoices>= {
        customerId: subscriptionDB?.customerId || "",
        subscriptionId:subscription.entity.id || "",
        paymentId: body.payload.payment.entity.id || "",
        orderId:  body.payload.payment.entity.order_id || "",
        invoiceId:  body.payload.payment.entity.invoice_id || "",
        description:  body.payload.payment.entity.description || "",
        amount:  body.payload.payment.entity.amount || "",
        created_at: new Date(body.payload.payment.entity.created_at || Date.now())
      }
      const options = {
        status: subscription.entity.status,
        subscriptionId: subscription.entity.id,
        url: subscription.entity.short_url,
        current_end: subscription.entity.current_end,
        plan_id: subscription.entity.plan_id
      }
      const cleanedInvoice = await removeUndefinedFields(invoice);
      switch (event) {
        case 'subscription.updated':
        case 'subscription.activated': {
          if (subscription.entity.status === 'active') {
            await subscriptionCreated(
              options,
              subscriptionDB?.customerId as string,
              true
            )
            await db.invoices.upsert({
              where : {
                subscriptionId: options.subscriptionId
              },
              create: cleanedInvoice,
              update: invoice
            });
            console.log('CREATED FROM WEBHOOK 💳', subscription)
          } else {
            console.log(
              'SKIPPED AT CREATED FROM WEBHOOK 💳 because subscription status is not active',
              subscription
            )
          }
          break;
        }
        default:
          console.log('👉🏻 Unhandled relevant event!', event)
      }
    } else {
      console.log(
        'SKIPPED FROM WEBHOOK 💳 because subscription was from a connected account not for the application'
      )
    }
  } catch (error) {
    console.log(error)
  }
  return NextResponse.json(
    {
      status: 200,
    }
  )
}
