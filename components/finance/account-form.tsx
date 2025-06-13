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
import { useFinance, type Account } from "@/contexts/finance-context"
import { useChartAccount } from "./context/chart-accounts"
import { removebasicTypes } from "../generic"
import { useMemo } from "react"

// Define the form schema
const formSchema = z.object({
  id: z.string(),
  accountCode: z.string().min(1, { message: "Account code is required" }),
  name: z.string().min(1, { message: "Account name is required" }),
  type: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
  balance: z.coerce.number().default(0),
  parentId: z.string().optional(),
})

type AccountFormValues = z.infer<typeof formSchema>

interface AccountFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Partial<Account>
  accountId?: string
}

export function AccountForm({ open, onOpenChange, initialValues, accountId }: AccountFormProps) {
  const { addAccount, updateAccount, accounts } = useFinance()
  const { create, update } = useChartAccount()
  const isEditing = !!accountId

  console.log({ initialValues })

  // Get parent accounts for dropdown
  const parentAccounts = accounts.filter((account) => !account.parentId)

  // Default values for the form
  const defaultValues: Partial<AccountFormValues> = useMemo(() => {
    if (isEditing) return initialValues
    return ({
      id: "",
      name: "",
      type: "Asset",
      balance: 0,
      parentId: undefined,
    })
  }, [isEditing, initialValues])

  // Initialize the form
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Handle form submission
  const onSubmit = (values: AccountFormValues) => {
    if (isEditing) {
      update({ ...values, accountCode: accountId, id: accountId } as any).then(_ => {
        onOpenChange(false)
        form.reset(defaultValues)
      })
    } else {
      create(removebasicTypes({ ...values, accountCode: values.accountCode })).then(_ => {
        onOpenChange(false)
        form.reset(defaultValues)
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Account" : "Add Account"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this account." : "Enter the details for the new account."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Code</FormLabel>
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
                        <SelectItem value="Asset">Asset</SelectItem>
                        <SelectItem value="Liability">Liability</SelectItem>
                        <SelectItem value="Equity">Equity</SelectItem>
                        <SelectItem value="Revenue">Revenue</SelectItem>
                        <SelectItem value="Expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Account (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Top-level Account)</SelectItem>
                        {parentAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.id} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Leave empty for top-level accounts</FormDescription>
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
