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
    const sub = await db.subscription.findFirst({
      where: {
        agencyId: agency.id,
      }
    })
    //Incase where there is already an active plan and a new plan needs to be created
    if(!active && sub?.active === true ) return sub;
    const planId : Plan = subscription.plan_id;
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
    return res;
  } catch (error) {
    console.log('🔴 Error from Create action', error)
  }
}


//  Cant fetch based on the razorpya Account ID so have to update this function so that the new accounts api key can be fetched based on the razorpayaccountId and then creaing an new instance for that account and then fetching the relavant items.
 
export const getConnectAccountProducts = async (razorpayAccountId: string) => {
    try {
      const products = await  razorpay.items.all({
        count: 10,
      })
      return products
    } catch (error) {
      console.error('Error fetching products/plans from Razorpay:', error)
      throw error
    }
  }
  