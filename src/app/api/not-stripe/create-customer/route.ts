import { razorpay } from '@/lib/not-stripe'
import { RazorpayCustomerType } from '@/lib/types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { address, email, name, shipping }: RazorpayCustomerType =
    await req.json()
  if (!email || !address || !name || !shipping)
    return new NextResponse('Missing data', {
      status: 400,
    })
  try {
    const customer = await razorpay.customers.create({
      email,
      name,
      
      notes : {
        address_line1: address.line1,
        address_city:address.city,
        address_country: address.country,
        address_postal_code: address.postal_code,
        shipping_name: shipping.name,
        shipping_address: shipping.address.line1
      }
    })
    return Response.json({ customerId: customer.id })
  } catch (error) {
    console.log('🔴 Error', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}