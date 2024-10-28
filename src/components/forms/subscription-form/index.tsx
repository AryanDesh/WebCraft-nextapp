'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'


type Props = {
  selectedPlanId: string | Plan
  customerId : string
  url :  string
}

const SubscriptionForm = ({ selectedPlanId, customerId, url }: Props) => {
  const { toast } = useToast()
const router = useRouter();
  const [priceError, setPriceError] = useState('')
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!selectedPlanId) {
      setPriceError('You need to select a plan to subscribe.')
      return
    }
    setPriceError('')
    event.preventDefault()
    if(!selectedPlanId) return;

    try {
        const subscription = await db.subscription.findFirst({
            where: {
                customerId
            }
        })
        if(url){
            console.log(url);
            window.location.href = url
        }
      if(!subscription){
        console.log('Failed to create subscription order')
        router.refresh();
        return;
      }
      if(subscription.active){
          toast({
            title: 'Payment successful',
            description: 'Your payment has been successfully processed. ',
          })
          router.refresh();
      }
      else{
        toast({
            title: 'Incomplete Payment',
            description: 'Your hasnt been completed, check ur email or messages for the url. ',
          })
          router.refresh();
      }
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description:
          'We couldnt process your payment. Please try again',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <Button
        className="mt-4 w-full"
      >
        Submit
      </Button>
    </form>
  )
}
export default SubscriptionForm
