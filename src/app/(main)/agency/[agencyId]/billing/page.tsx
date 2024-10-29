import React from 'react'
import { razorpay } from '@/lib/not-stripe'
import { addOnProducts, pricingCards } from '@/lib/constants'
import { db } from '@/lib/db'
import { Separator } from '@/components/ui/separator'
import PricingCard from './_components/pricing-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import clsx from 'clsx'
import SubscriptionHelper from './_components/subscription-helper'

type Props = {
  params: { agencyId: string }
}

const page = async ({ params }: Props) => {
//CHALLENGE : Create the add on  products
  const addOnPromises = addOnProducts.map((product) => razorpay.plans.fetch(product.id));
  const addOns = await Promise.all(addOnPromises);
  
  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  })
  console.log(agencySubscription?.Subscription) 
  const price = await razorpay.plans.all();
  const prices = price.items.filter((c) => c.item.name === "WebCraft");

  
  const currentPlanDetails = pricingCards.find(
    (c) => c.plan === agencySubscription?.Subscription?.plan
  )
  console.log(currentPlanDetails);

  const charges = await db.invoices.findMany({
    where:{
      customerId: agencySubscription?.customerId
    }
  })

  const allCharges = [
    ...charges.map((item) => ({
      description: item.description,
      id: item.id,
      date: `${new Date(item.created_at * 1000).toLocaleTimeString()} ${new Date(
        item.created_at * 1000
      ).toLocaleDateString()}`,
      status: 'Paid',
      amount: `$${item.amount as number/100}`,
    })),
  ]

  return (
    <>
    <SubscriptionHelper
      prices={prices}
      customerId={agencySubscription?.customerId || ''}
      planExists={agencySubscription?.Subscription?.active === true}
    />
    <h1 className="text-4xl p-4">Billing</h1>
    <Separator className=" mb-6" />
    <h2 className="text-2xl p-4">Current Plan</h2>
    <div className="flex flex-col lg:!flex-row justify-between gap-8">
      <PricingCard
        planExists={agencySubscription?.Subscription?.active === true}
        prices={prices}
        customerId={agencySubscription?.customerId || ''}
        amt={
          agencySubscription?.Subscription?.active === true
            ? currentPlanDetails?.price || '$0'
            : '$0'
        }
        buttonCta={
          agencySubscription?.Subscription?.active === true
            ? 'Change Plan'
            : 'Get Started'
        }
        highlightDescription="Want to modify your plan? You can do this here. If you have
        further question contact support@plura-app.com"
        highlightTitle="Plan Options"
        description={
          agencySubscription?.Subscription?.active === true
            ? currentPlanDetails?.description || 'Lets get started'
            : 'Lets get started! Pick a plan that works best for you.'
        }
        duration="/ month"
        features={
          agencySubscription?.Subscription?.active === true
            ? currentPlanDetails?.features || []
            : currentPlanDetails?.features ||
              pricingCards.find((pricing) => pricing.title === 'Starter')
                ?.features ||
              []
        }
        title={
          agencySubscription?.Subscription?.active === true
            ? currentPlanDetails?.title || 'Starter'
            : 'Starter'
        }
      />
      {addOns.map((addOn) => (
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}
          prices={prices}
          customerId={agencySubscription?.customerId || ''}
          key={addOn.id}
          amt={
            //@ts-ignore
            addOn.default_price?.unit_amount
              ? //@ts-ignore
                `$${addOn.default_price.unit_amount / 100}`
              : '$0'
          }
          buttonCta="Subscribe"
          description="Dedicated support line & teams channel for support"
          duration="/ month"
          features={[]}
          title={'24/7 priority support'}
          highlightTitle="Get support now!"
          highlightDescription="Get priority support and skip the long long with the click of a button."
        />
      ))}
    </div>
    <h2 className="text-2xl p-4">Payment History</h2>
    <Table className="bg-card border-[1px] border-border rounded-md">
      <TableHeader className="rounded-md">
        <TableRow>
          <TableHead className="w-[200px]">Description</TableHead>
          <TableHead className="w-[200px]">Invoice Id</TableHead>
          <TableHead className="w-[300px]">Date</TableHead>
          <TableHead className="w-[200px]">Paid</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="font-medium truncate">
        {allCharges.map((charge) => (
          <TableRow key={charge.id}>
            <TableCell>{charge.description}</TableCell>
            <TableCell className="text-muted-foreground">
              {charge.id}
            </TableCell>
            <TableCell>{charge.date}</TableCell>
            <TableCell>
              <p
                className={clsx('', {
                  'text-emerald-500': charge.status.toLowerCase() === 'paid',
                  'text-orange-600':
                    charge.status.toLowerCase() === 'pending',
                  'text-red-600': charge.status.toLowerCase() === 'failed',
                })}
              >
                {charge.status.toUpperCase()}
              </p>
            </TableCell>
            <TableCell className="text-right">{charge.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
    )
}

export default page