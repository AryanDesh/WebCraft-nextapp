'use client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { pricingCards } from '@/lib/constants'
import { useModal } from '@/providers/modal-provider'
import { Plan } from '@prisma/client'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
// import { Elements } from '@stripe/react-stripe-js'
import { getRazorpay } from '@/lib/not-stripe/client'
import Loading from '@/components/global/loading'
import SubscriptionForm from '.'
// import SubscriptionForm from '.'

type Props = {
  customerId: string
  planExists: boolean
}

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal()
  const router = useRouter()
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | ''>(
    data?.plans?.defaultPriceId || ''
  )
  const [subscription, setSubscription] = useState<{
    subscriptionId: string
    // clientSecret: string
    status: string
  }>({ subscriptionId: '', 
    // clientSecret: ''
    status: '' })

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
    if (!selectedPriceId) return
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
            planId: selectedPriceId,
          }),
        }
      )
      const subscriptionResponseData = await subscriptionResponse.json()
      setSubscription({
        status: subscriptionResponseData.status,
        subscriptionId: subscriptionResponseData.subscriptionId,
      })
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
  }, [data, selectedPriceId, customerId])

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => setSelectedPriceId(price.id as Plan)}
            key={price.id}
            className={clsx('relative cursor-pointer transition-all', {
              'border-primary': selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${price.item.amount ? (price.item.amount as number ) / 100 : '0'}
                <p className="text-sm text-muted-foreground">
                  {price.item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {
                    pricingCards.find((p) => p.plan === price.id)
                      ?.description
                  }
                </p>
              </CardTitle>
            </CardHeader>
            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.status && !planExists && (
          <>
            <h1 className="text-xl">Payment Method</h1>
            {/* <Elements
              stripe={getRazorpay()}
              options={options}
            >
            </Elements> */}
            <SubscriptionForm selectedPlanId={selectedPriceId} customerId = {customerId} />
          </>
        )}

        {!options.status && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loading />
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionFormWrapper
