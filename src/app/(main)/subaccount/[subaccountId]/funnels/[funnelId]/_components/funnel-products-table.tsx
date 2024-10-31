'use client'
import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import {
  saveActivityLogsNotification,
  updateFunnelProducts,
} from '@/lib/queries'
import { Funnel } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RazorpayProduct, RazorpayProductList } from '@/lib/types'
interface FunnelProductsTableProps {
  defaultData: Funnel
  products: RazorpayProductList
}

const FunnelProductsTable: React.FC<FunnelProductsTableProps> = ({
  products,
  defaultData,
}) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [liveProducts, setLiveProducts] = useState<
    { productId: string }[] | []
  >(JSON.parse(defaultData.liveProducts || '[]'))

  // console.log(liveProducts);
  products.items.map((product) => {
    console.log(product.name)
  })
  const handleSaveProducts = async () => {
    setIsLoading(true)
    const response = await updateFunnelProducts(
      JSON.stringify(liveProducts),
      defaultData.id
    )
    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Update funnel products | ${response.name}`,
      subaccountId: defaultData.subAccountId,
    })
    setIsLoading(false)
    router.refresh()
  }

  const handleAddProduct = async (product : RazorpayProduct) => {
    const productIdExists = liveProducts.find(
      //@ts-ignore
      (prod) => prod.productId === product.id
    )
    productIdExists
      ? setLiveProducts(
          liveProducts.filter(
            (prod) =>
              prod.productId !==
              //@ts-ignore
              product.id
          )
        )
      : setLiveProducts([
          ...liveProducts,
          {
            //@ts-ignore
            productId: product.id as string,
            //@ts-ignore
          },
        ])
  }
  return (
    <>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead>Live</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            {/* <TableHead>Interval</TableHead> */}
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {products.items.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Input
                  defaultChecked={
                    !!liveProducts.find(
                      //@ts-ignore
                      (prod) => prod.productId === product.id
                    )
                  }
                  onChange={() => handleAddProduct(product)}
                  type="checkbox"
                  className="w-4 h-4"
                />
              </TableCell>
              <TableCell>
                {/* <Image
                  alt="product Image"
                  height={60}
                  width={60}
                  src={product.description}
                /> */}
              </TableCell>
              <TableCell>{product.name || "Unknown"}</TableCell>
              {/* <TableCell>
                {
                  //@ts-ignore
                  product.item.default_price?.recurring ? 'Recurring' : 'One Time'
                }
              </TableCell> */}
              <TableCell className="text-right">
                $
                {
                  //@ts-ignore
                  product.unit_amount / 100
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        disabled={isLoading}
        onClick={handleSaveProducts}
        className="mt-4"
      >
        Save Products
      </Button>
    </>
  )
}

export default FunnelProductsTable
