"use client"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useFinance, type Bill } from "@/contexts/finance-context"
import { X, Plus } from "lucide-react"
import { useBillContext } from "./context/bill-context"
import { useMemo } from "react"

// Define the form schema
const billItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.coerce.number().positive({ message: "Quantity must be positive" }),
  unitPrice: z.coerce.number().positive({ message: "Unit price must be positive" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  taxRate: z.coerce.number().min(0, { message: "Tax rate must be non-negative" }),
  taxAmount: z.coerce.number().min(0, { message: "Tax amount must be non-negative" }),
})

const formSchema = z.object({
  supplier: z.string().min(1, { message: "Supplier is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  dueDate: z.string().min(1, { message: "Due date is required" }),
  status: z.enum(["Open", "Paid", "Overdue", "Partially Paid"]),
  items: z.array(billItemSchema).min(1, { message: "At least one item is required" }),
})

type BillFormValues = z.infer<typeof formSchema>

interface BillFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues: Partial<Bill>
  billId?: string
}

export function BillForm({ open, onOpenChange, initialValues, billId }: BillFormProps) {
  const isEditing = !!billId

  // Default values for the form
  const defaultValues: Partial<BillFormValues> = useMemo(() => {
    if (isEditing) return initialValues
    return ({
      supplier: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Open",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          taxRate: 18,
          taxAmount: 0,
        },
      ],
      ...initialValues,
    })
  }, [initialValues, billId, isEditing, open])

  // Initialize the form
  const form = useForm<BillFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Use field array for bill items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Calculate item amount and tax amount when quantity or unit price changes
  const calculateItemAmounts = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`)
    const unitPrice = form.getValues(`items.${index}.unitPrice`)
    const taxRate = form.getValues(`items.${index}.taxRate`)

    const amount = quantity * unitPrice
    const taxAmount = (amount * taxRate) / 100

    form.setValue(`items.${index}.amount`, amount)
    form.setValue(`items.${index}.taxAmount`, taxAmount)
  }

  // Calculate total bill amount
  const calculateTotalAmount = (): { subtotal: number; tax: number; total: number } => {
    const items = form.getValues("items")
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
    const tax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  // Add a new item
  const addItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      taxRate: 18,
      taxAmount: 0,
    })
  }


  const { create, update, data: billContext } = useBillContext()
  // Handle form submission
  const onSubmit = (values: BillFormValues) => {
    const { subtotal, tax, total } = calculateTotalAmount()

    const billData = {
      ...values,
      amount: total,
      balance: total,
    }

    if (isEditing) {
      update({ ...billData, id: billId, items: JSON.stringify(billData.items) }).then(() => {
        onOpenChange(false)
        form.reset(defaultValues)
      })
    } else {
      create({ ...billData, status: billData.status as string, items: JSON.stringify(billData.items) })
        .then(() => {
          onOpenChange(false)
          form.reset(defaultValues)
        })
    }
    // if (isEditing && billId) {
    //   updateBill(billId, billData)
    // } else {
    //   addBill(billData)
    // }

    // onOpenChange(false)
    // form.reset(defaultValues)
  }

  const { subtotal, tax, total } = calculateTotalAmount()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Bill" : "Create Bill"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this bill." : "Enter the details for the new bill."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Bill Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-md p-4 space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 pb-4 border-b last:border-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  calculateItemAmounts(index)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  calculateItemAmounts(index)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.amount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Rate (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  calculateItemAmounts(index)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.taxAmount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Amount (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border rounded-md p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax:</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center font-bold pt-2 border-t">
                <span>Total:</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
