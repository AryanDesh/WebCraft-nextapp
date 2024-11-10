import { razorpay } from '@/lib/not-stripe';
import { NextResponse } from 'next/server';

interface Price {
  recurring: boolean;
  amount: number; 
}

interface RequestBody {
  subAccountConnectAccId: string;
  prices: Price[];
  subaccountId: string;
}

const createCORSHeaders = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

export async function POST(req: Request) {
  const { subAccountConnectAccId, prices, subaccountId } = (await req.json()) as RequestBody;

  const origin = req.headers.get('origin');
  if (!subAccountConnectAccId || !prices.length) {
    return new NextResponse('Razorpay Account ID or amount is missing', { status: 400 });
  }

  const {
    NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT,
    NEXT_PUBLIC_PLATFORM_ONETIME_FEE,
    NEXT_PUBLIC_PLATFORM_AGENCY_PERCENT,
  } = process.env;

  if (
    !NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT ||
    !NEXT_PUBLIC_PLATFORM_ONETIME_FEE ||
    !NEXT_PUBLIC_PLATFORM_AGENCY_PERCENT
  ) {
    console.error('Required platform fee environment variables are missing');
    return NextResponse.json({ error: 'Fees do not exist' });
  }

  const totalAmount = prices.reduce((total, price) => total + price.amount, 0) * 100;

  try {
    const order = await razorpay.orders.create({
      amount: totalAmount, 
      currency: 'INR',
      receipt: `receipt_${subaccountId}`,
      notes: {
        subaccountId,
        ...(prices.some((price) => price.recurring) && { isSubscription: 'true' }),
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      {
        headers: createCORSHeaders(origin),
      }
    );
  } catch (error) {
    console.error('🔴 Error creating Razorpay order:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...createCORSHeaders(origin),
      'Access-Control-Max-Age': '86400',
    },
  });
}
