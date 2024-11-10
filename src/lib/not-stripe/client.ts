// export const getRazorpay = (options: any) => {
//     const razorpayInstance = new (window as any).Razorpay({
//       key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
//       amount: options.amount, // Amount in paise (e.g., 50000 = Rs 500)
//       currency: 'INR',
//       name: 'WebCraft App',
//       order_id: options.order_id, // Razorpay order ID from backend
//       prefill: {
//         email: options.email,
//         contact: options.contact,
//       },
//       theme: {
//         color: '#3399cc',
//       },
//     })
  
//     razorpayInstance.open()
//   }
  