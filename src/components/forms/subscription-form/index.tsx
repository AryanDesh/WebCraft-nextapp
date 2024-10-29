'use client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Plan, Subscription } from '@prisma/client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { razorpay } from '@/lib/not-stripe'
import Razorpay from 'razorpay'


type Props = {
  subscription : Partial<Subscription>
  url: string
}

const SubscriptionForm = ({ subscription , url}: Props) => {
  const { toast } = useToast()
const router = useRouter();
  const [priceError, setPriceError] = useState('')
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!subscription.plan) {
      setPriceError('You need to select a plan to subscribe.')
      return
    }
    setPriceError('')
    event.preventDefault()
    if (!subscription.plan) return
  
    try {
      // Redirect to the payment URL if available
        console.log('Redirecting to payment page:', url)
        // const razorpayPayment = new window.Razorpay(subscription);
        // razorpayPayment.open();
        window.location.href = url;

  
      if (subscription.active) {
        toast({
          title: 'Payment successful',
          description: 'Your payment has been successfully processed.',
        })
        router.refresh()
      } else {
        toast({
          title: 'Incomplete Payment',
          description: 'Your payment is incomplete. Check your email or messages for the payment URL.',
        })
        router.refresh()
      }
    } catch (error) {
      console.log(error)
      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description: 'We couldn’t process your payment. Please try again.',
      })
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <Button
        className="mt-4 w-full"
      >
        Go To Payment
      </Button>
    </form>
  )
}
export default SubscriptionForm
