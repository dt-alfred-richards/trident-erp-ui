"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
import { useFinance, type BankAccount } from "@/contexts/finance-context"

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Account name is required" }),
  bank: z.string().min(1, { message: "Bank name is required" }),
  accountNumber: z.string().min(1, { message: "Account number is required" }),
  balance: z.coerce.number().nonnegative({ message: "Balance must be non-negative" }),
  type: z.enum(["Current", "Savings", "Fixed Deposit", "Cash"]),
})

type BankAccountFormValues = z.infer<typeof formSchema>

interface BankAccountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Partial<BankAccount>
  accountId?: string
}

export function BankAccountForm({ open, onOpenChange, initialValues, accountId }: BankAccountFormProps) {
  const { addBankAccount, updateBankAccount } = useFinance()
  const isEditing = !!accountId

  // Default values for the form
  const defaultValues: Partial<BankAccountFormValues> = {
    name: "",
    bank: "",
    accountNumber: "",
    balance: 0,
    type: "Current",
    ...initialValues,
  }

  // Initialize the form
  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Handle form submission
  const onSubmit = (values: BankAccountFormValues) => {
    if (isEditing && accountId) {
      updateBankAccount(accountId, values)
    } else {
      addBankAccount(values)
    }

    onOpenChange(false)
    form.reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this bank account." : "Enter the details for the new bank account."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Current">Current</SelectItem>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
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
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Enter "N/A" for cash accounts</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opening Balance (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
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

