'use server'
import Razorpay from 'razorpay'
import { db } from '../db'
import {razorpay} from '.'
import { DevBundler } from 'next/dist/server/lib/router-utils/setup-dev-bundler'

// Initialize Razorpay client


  
export const subscriptionCreated = async (
  subscription: any, // Razorpay Subscription object
  customerId: string
) => {
  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        SubAccount: true,
      },
    })
    if (!agency) {
      throw new Error('Could not find an agency to upsert the subscription')
    }
    const data  = {
        active: subscription.status === 'active',
        agencyId: agency.id,
        customerId,
        currentPeriodEndDate: new Date(subscription.current_end), // current_end is used in Razorpay for subscription period
        priceId: subscription.plan_id, // Razorpay uses plan_id
        subscriptionId: subscription.id,
        plan: subscription.plan_id,
        id: ''
    }

    const res = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      create: data,
      update: data,
    })
    console.log(`🟢 Created Subscription for ${subscription.id}`)
  } catch (error) {
    console.log('🔴 Error from Create action', error)
  }
}

export const getConnectAccountProducts = async (razorpayAccountId: string) => {
    try {
      const products = razorpay.items.all({
        count: 50,
      })
      return products
    } catch (error) {
      console.error('Error fetching products/plans from Razorpay:', error)
      throw error
    }
  }
  