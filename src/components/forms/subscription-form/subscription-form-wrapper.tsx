'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { pricingCards } from '@/lib/constants'
import { useModal } from '@/providers/modal-provider'
import { Plan } from '@prisma/client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
// import { Elements } from '@stripe/react-stripe-js'
import Loading from '@/components/global/loading'
import SubscriptionForm from '.'
import { subscriptionCreated } from '@/lib/not-stripe/actions'
import { Subscription } from '@prisma/client'
type Props = {
  customerId: string
  planExists: boolean
}

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  console.log(customerId)
  const { data, setClose } = useModal()
  const router = useRouter()
  const customer_id = useRef(customerId);
  if(!planExists) setTimeout(() => {},1000);
  const [selectedPlanId, setSelectedPlanId] = useState<Plan | ''>(
    data?.plans?.defaultPriceId || ''
  )
  const [SubscriptionInfo,setSubscriptionInfo] = useState<Partial<Subscription>>();

  const [subscription, setSubscription] = useState<{
    subscriptionId: string
    // clientSecret: string
    status: string
    url : string
    current_end: Date
    plan_id: string
  }>({ subscriptionId: '', 
    // clientSecret: ''
      status: '',
      url: '' ,
      current_end: new Date(),
      plan_id: ''
    })

  const options = useMemo(
    () => ({
      status: subscription?.status,
      appearance: {
        theme: 'flat',
      },
    }),
    [subscription]
  )

  useEffect(() => {
    if (!selectedPlanId) {
     console.log(selectedPlanId)
      return
    }
    const createSecret = async () => {
      const subscriptionResponse = await fetch(
        '/api/not-stripe/create-subscription',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            planId: selectedPlanId,
          }),
        }
      )
      const subscriptionResponseData = await subscriptionResponse.json()
      console.log(subscriptionResponseData);
      setSubscription({
        status: subscriptionResponseData.status,
        subscriptionId: subscriptionResponseData.subscriptionId,
        url: subscriptionResponseData.url,
        current_end: subscriptionResponseData.current_end,
        plan_id: subscriptionResponseData.plan_id
      })
    //   Adding customer to the database using not-stripe/actions.ts

      if(subscriptionResponseData.subscriptionId){
        setSubscriptionInfo(await subscriptionCreated(subscription ,customerId = customer_id.current, false));
        console.log(subscription);
      }
      if (planExists) {
        toast({
          title: 'Success',
          description: 'Your plan has been successfully upgraded!',
        })
        setClose()
        router.refresh()
      }
    }
    createSecret()
  }, [data, selectedPlanId, customerId])

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((plan) => (
          <Card
            onClick={() => setSelectedPlanId(plan.id as Plan)}
            key={plan.id}
            className={clsx('relative cursor-pointer transition-all', {
              'border-primary': selectedPlanId === plan.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${plan.item.amount ? (plan.item.amount as number ) / 100 : '0'}
                <p className="text-sm text-muted-foreground">
                  {plan.item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    pricingCards.find((p) => p.plan === plan.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>
            {selectedPlanId === plan.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.status && !planExists && SubscriptionInfo && (
          <>
            <h1 className="text-xl">Payment</h1>
            <SubscriptionForm subscription = {SubscriptionInfo} url ={subscription.url}/>
          </>
        )}

        {!options.status && selectedPlanId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionFormWrapper
