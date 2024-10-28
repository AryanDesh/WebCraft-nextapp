'use server'
import { db } from '../db'
import {razorpay} from '.'
import { Subscription } from '@prisma/client'
import { Plan } from '@prisma/client'
function removeUndefinedFields<T>(obj: Partial<T>): T {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as T;
}
export const subscriptionCreated = async (
  subscription: any, // Razorpay Subscription object
  customerId: string,
  active : boolean
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
    const planId : Plan= subscription.plan_id;
    const data : Partial<Subscription> = {
        active: active,
        agencyId: agency.id,
        customerId,
        currentPeriodEndDate: new Date(subscription.current_end), // current_end is used in Razorpay for subscription period
        subscriptionId: subscription.subscriptionId,
        plan: planId,
    }
    const cleanedData = removeUndefinedFields(data);
    
    const res = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      create: cleanedData,
      update: data,
    })
    console.log(`🟢 Created Subscription for ${subscription.subscriptionId}`)
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
  