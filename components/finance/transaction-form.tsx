"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useFinance, type Transaction } from "@/contexts/finance-context"
import { useEffect } from "react"
import { useTranscation } from "./context/trasncations"

// Define the form schema
const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  account: z.string().min(1, { message: "Account is required" }),
  type: z.enum(["Deposit", "Withdrawal", "Transfer"]),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  reference: z.string().optional(),
  status: z.enum(["Cleared", "Pending", "Bounced"]),
})

type TransactionFormValues = z.infer<typeof formSchema>

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Partial<Transaction>
  transactionId?: string
}

export function TransactionForm({ open, onOpenChange, initialValues, transactionId }: TransactionFormProps) {
  const { bankAccounts, addTransaction, updateTransaction } = useFinance()
  const isEditing = !!transactionId

  // Default values for the form
  const defaultValues: Partial<TransactionFormValues> = {
    date: new Date().toISOString().split("T")[0],
    description: "",
    account: bankAccounts.length > 0 ? bankAccounts[0].name : "",
    type: "Deposit",
    amount: 0,
    reference: "",
    status: "Pending",
  }

  // Initialize the form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Reset form when dialog opens/closes or when editing/creating mode changes
  useEffect(() => {
    if (open) {
      if (isEditing && initialValues) {
        // If editing, populate with initial values
        form.reset({
          date: initialValues.date,
          description: initialValues.description,
          account: initialValues.account,
          type: initialValues.type,
          amount: initialValues.amount,
          reference: initialValues.reference || "",
          status: initialValues.status,
        })
      } else {
        // If creating new, reset to default values
        form.reset(defaultValues)
      }
    }
  }, [form, initialValues, isEditing, open])

  const { create, update } = useTranscation()
  // Handle form submission
  const onSubmit = (values: TransactionFormValues) => {
    if (isEditing) {
      update({ ...values, id: parseInt(transactionId), reference: (values?.reference || "") }).then(() => {
        onOpenChange(false)
        form.reset(defaultValues)
      })
    } else {
      create({ ...values, reference: (values?.reference || "") })
        .then(() => {
          onOpenChange(false)
          form.reset(defaultValues)
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this transaction." : "Enter the details for the new transaction."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                        <SelectItem value="Cleared">Cleared</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Bounced">Bounced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.name}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Deposit">Deposit</SelectItem>
                        <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="Transfer">Transfer</SelectItem>
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Optional reference number or code</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
