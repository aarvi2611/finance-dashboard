"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, DollarSign, TrendingUp, Clock } from "lucide-react"
import {
  getPayments,
  getInvoices,
  getClients,
  addPayment,
  getInvoiceGrandTotal,
  getInvoicePaid,
  type Payment,
  type PaymentMethod,
} from "@/lib/data"
import { toast } from "sonner"

const methodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  credit_card: "Credit Card",
  paypal: "PayPal",
  cash: "Cash",
}

const methodBadge: Record<PaymentMethod, string> = {
  bank_transfer: "bg-primary/10 text-primary border-primary/20",
  credit_card: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  paypal: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  cash: "bg-chart-4/10 text-chart-4 border-chart-4/20",
}

interface PaymentForm {
  invoiceId: string
  amount: number
  date: string
  method: PaymentMethod
  reference: string
}

const emptyForm: PaymentForm = {
  invoiceId: "",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  method: "bank_transfer",
  reference: "",
}

export function PaymentsTable() {
  const invoices = getInvoices()
  const clients = getClients()
  const [payments, setPayments] = useState(getPayments)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<PaymentForm>(emptyForm)

  const refresh = useCallback(() => setPayments(getPayments()), [])

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0)
    const thisMonth = payments.filter((p) => {
      const d = new Date(p.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const thisMonthTotal = thisMonth.reduce((sum, p) => sum + p.amount, 0)
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === "sent" || inv.status === "overdue"
    )
    const pendingTotal = pendingInvoices.reduce(
      (sum, inv) => sum + (getInvoiceGrandTotal(inv) - getInvoicePaid(inv.id)),
      0
    )
    return { total, thisMonthTotal, pendingTotal, count: payments.length }
  }, [payments, invoices])

  const filtered = payments.filter((p) => {
    const inv = invoices.find((i) => i.id === p.invoiceId)
    const client = inv ? clients.find((c) => c.id === inv.clientId) : null
    return (
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      (inv?.number.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (client?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    )
  })

  // Get invoices that have an outstanding balance
  const unpaidInvoices = invoices.filter((inv) => {
    const balance = getInvoiceGrandTotal(inv) - getInvoicePaid(inv.id)
    return balance > 0 && inv.status !== "draft"
  })

  function handleSave() {
    if (!form.invoiceId) {
      toast.error("Please select an invoice.")
      return
    }
    if (form.amount <= 0) {
      toast.error("Amount must be greater than zero.")
      return
    }
    addPayment(form)
    refresh()
    setDialogOpen(false)
    setForm(emptyForm)
    toast.success("Payment recorded.")
  }

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
            <div className="rounded-md bg-success/10 p-2 text-success">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground font-mono">
              ${stats.total.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.count} payments total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground font-mono">
              ${stats.thisMonthTotal.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Collected in {new Date().toLocaleString("en-US", { month: "long" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Balance
            </CardTitle>
            <div className="rounded-md bg-warning/10 p-2 text-warning">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground font-mono">
              ${stats.pendingTotal.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true) }}>
          <Plus className="mr-2 size-4" />
          Record Payment
        </Button>
      </div>

      {/* Payment Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((payment) => {
                const inv = invoices.find((i) => i.id === payment.invoiceId)
                const client = inv ? clients.find((c) => c.id === inv.clientId) : null
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm text-foreground">
                      {payment.reference}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {inv?.number ?? "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {client?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={methodBadge[payment.method]}>
                        {methodLabels[payment.method]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-success tabular-nums">
                      +${payment.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Log a payment received against an invoice.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Invoice</Label>
              <Select value={form.invoiceId} onValueChange={(v) => {
                const inv = invoices.find(i => i.id === v)
                const balance = inv ? getInvoiceGrandTotal(inv) - getInvoicePaid(inv.id) : 0
                setForm((p) => ({ ...p, invoiceId: v, amount: balance }))
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {unpaidInvoices.map((inv) => {
                    const client = clients.find((c) => c.id === inv.clientId)
                    const balance = getInvoiceGrandTotal(inv) - getInvoicePaid(inv.id)
                    return (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.number} - {client?.name} (${balance.toLocaleString()} due)
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Amount</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) => setForm((p) => ({ ...p, method: v as PaymentMethod }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Reference</Label>
              <Input
                value={form.reference}
                onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
                placeholder="e.g. TXN-20260227-001"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
