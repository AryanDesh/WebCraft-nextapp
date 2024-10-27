'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan } from '@prisma/client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'


type Props = {
  selectedPlanId: string | Plan
  customerId : string
}

const SubscriptionForm = ({ selectedPlanId, customerId }: Props) => {
  const { toast } = useToast()
const router = useRouter();
  const [status,setStatus] = useState();
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
      const res = await fetch(`/api/not-stripe/fetch-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlanId, customerId : customerId }),
      })
      const data = await res.json()

      if(!data?.id){
        console.log('Failed to create subscription order')
        router.refresh();
      }
      if (data?.status !== "completed") {
        window.location.href = data.url
        return
      }
      setStatus(data.status)
      toast({
        title: 'Payment successful',
        description: 'Your payment has been successfully processed. ',
      })
      router.refresh();
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description:
          'We couldnt process your payment. Please try a different card',
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
