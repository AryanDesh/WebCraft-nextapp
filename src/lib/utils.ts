import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRazorpayOAuthLink(
  accountType: 'agency' | 'subaccount',
  state: string
) {
  return `https://auth.razorpay.com/authorize?client_id=${process.env.NEXT_PUBLIC_RAZORPAY_CLIENT_ID}&response_type=code&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_URL}/${accountType}/dashboard&state=${state}`;
}