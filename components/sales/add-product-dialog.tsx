"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { ProductInfo } from "./sales-dashboard"
import { DataByTableName } from "../utils/api"
import { useOrders } from "@/contexts/order-context"
import { lodashGet } from "../common/generic"

// Unit options
const unitOptions = [
  "per kg",
  "per ton",
  "per gram",
  "per liter",
  "per ml",
  "per meter",
  "per cm",
  "per unit",
  "per dozen",
  "per box",
  "per pack",
  "per sheet",
  "per roll",
  "per sq.ft",
  "per sq.m",
]

// Form schema
const formSchema = z.object({
  product: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.string().min(1, "Price is required"),
  unit: z.string().min(1, "Unit is required"),
})

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (product: any) => void
  existingIds: number[]
  clientId: string
}

export function AddProductDialog({ open, onOpenChange, onAdd, existingIds, clientId }: AddProductDialogProps) {
  const { setRefetchData } = useOrders()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: "",
      sku: "",
      price: "",
      unit: "per ton",
    },
  })

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Create new product
    const newProduct = {
      sku: values.sku,
      price: parseInt(values.price),
      units: values.unit,
      name: values.product
    } as Partial<ProductInfo>

    const instance = new DataByTableName("dim_product");
    const clientProposedInstance = new DataByTableName("client_proposed_price");
    // setIsSubmitting(true)
    instance.post(newProduct).then(res => {
      return lodashGet({ data: res, path: "data.data.0.productId" })
    }).then((productId) => {
      return clientProposedInstance.post({
        clientId,
        productId,
        proposedPrice: values.price
      })
    }).then(() => {
      toast({
        title: "Product added",
        description: `${values.product} has been added to the products list.`,
      })
      form.reset()
      onOpenChange(false)
      setIsSubmitting(false)
      setRefetchData(p => !p)
    })
      .catch(error => {
        console.log({ error })
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Add a new product for this client. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Premium Steel Sheets" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="STL-PS-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="45000" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
