"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Trash2,
  Search,
  FileDown,
  Eye,
  X,
} from "lucide-react"
import {
  getInvoices,
  getClients,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceTotal,
  getInvoiceGrandTotal,
  getInvoicePaid,
  getBusinessProfile,
  DEFAULT_TERMS,
  type Invoice,
  type InvoiceItem,
  type InvoiceStatus,
} from "@/lib/data"
import { toast } from "sonner"

const statusBadge: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-success/15 text-success border-success/20" },
  sent: { label: "Sent", className: "bg-primary/15 text-primary border-primary/20" },
  overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/20" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
}

interface InvoiceForm {
  clientId: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  notes: string
  items: InvoiceItem[]
  taxRate: number
  discount: number
  terms: string
  signatory: string
}

const emptyItem = (): InvoiceItem => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  description: "",
  quantity: 1,
  rate: 0,
})

const emptyForm: InvoiceForm = {
  clientId: "",
  status: "draft",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  notes: "",
  items: [emptyItem()],
  taxRate: 8.5,
  discount: 0,
  terms: DEFAULT_TERMS,
  signatory: "Alex Morgan",
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function generatePdf(invoice: Invoice, clientName: string, clientCompany: string, clientEmail: string, clientAddress: string) {
  const biz = getBusinessProfile()
  const subtotal = getInvoiceTotal(invoice)
  const discount = invoice.discount ?? 0
  const taxRate = invoice.taxRate ?? 0
  const afterDiscount = subtotal - discount
  const tax = afterDiscount * (taxRate / 100)
  const grandTotal = afterDiscount + tax
  const paid = getInvoicePaid(invoice.id)
  const balance = grandTotal - paid

  const statusColors: Record<string, { bg: string; text: string }> = {
    paid: { bg: "#e8f5e9", text: "#2e7d32" },
    sent: { bg: "#e3f2fd", text: "#1565c0" },
    overdue: { bg: "#ffebee", text: "#c62828" },
    draft: { bg: "#f5f5f5", text: "#616161" },
  }
  const sc = statusColors[invoice.status] ?? statusColors.draft

  const watermarkColor = invoice.status === "paid" ? "rgba(46,125,50,0.06)" : invoice.status === "overdue" ? "rgba(198,40,40,0.06)" : "transparent"
  const watermarkText = invoice.status === "paid" ? "PAID" : invoice.status === "overdue" ? "OVERDUE" : ""

  const termsList = (invoice.terms || "").split("\n").filter(Boolean).map(t => `<li>${t.replace(/^\d+\.\s*/, "")}</li>`).join("")

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${invoice.number} - Invoice</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1a1d2e;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { margin: 0; size: A4; }
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0;
      overflow: hidden;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 120px;
      font-weight: 800;
      color: ${watermarkColor};
      letter-spacing: 20px;
      pointer-events: none;
      z-index: 0;
      user-select: none;
    }

    /* Top accent bar */
    .accent-bar {
      height: 6px;
      background: linear-gradient(90deg, #2d3a8c 0%, #4a5bc7 100%);
    }

    .content { padding: 40px 48px; position: relative; z-index: 1; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand { display: flex; flex-direction: column; gap: 4px; }
    .logo-mark {
      display: flex; align-items: center; gap: 10px;
    }
    .logo-icon {
      width: 36px; height: 36px; background: #2d3a8c; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 800; font-size: 18px;
    }
    .logo-text { font-size: 22px; font-weight: 700; color: #2d3a8c; letter-spacing: -0.5px; }
    .logo-tagline { font-size: 11px; color: #888; margin-left: 46px; margin-top: -2px; }
    .invoice-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${sc.bg}; color: ${sc.text};
      padding: 5px 14px; border-radius: 20px;
      font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .invoice-badge-dot {
      width: 7px; height: 7px; border-radius: 50%; background: ${sc.text};
    }

    /* Invoice title row */
    .title-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 1px solid #eef0f4; }
    .title-col h1 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; font-weight: 600; margin-bottom: 4px; }
    .title-col .inv-number { font-size: 28px; font-weight: 700; color: #1a1d2e; letter-spacing: -0.5px; }
    .dates-col { text-align: right; font-size: 12px; color: #666; line-height: 1.8; }
    .dates-col strong { color: #333; font-weight: 600; }

    /* Parties */
    .parties { display: flex; justify-content: space-between; margin-bottom: 36px; gap: 40px; }
    .party { flex: 1; }
    .party-label {
      font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #2d3a8c;
      font-weight: 700; margin-bottom: 10px;
      display: flex; align-items: center; gap: 6px;
    }
    .party-label::before {
      content: ''; display: block; width: 16px; height: 2px; background: #2d3a8c; border-radius: 1px;
    }
    .party-name { font-size: 15px; font-weight: 600; color: #1a1d2e; margin-bottom: 4px; }
    .party-company { font-size: 12px; color: #555; margin-bottom: 2px; }
    .party-detail { font-size: 11px; color: #888; line-height: 1.6; }

    /* Table */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    .items-table thead { background: #f7f8fc; }
    .items-table th {
      font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px;
      color: #666; padding: 11px 14px; text-align: left; font-weight: 600;
      border-bottom: 2px solid #e8eaf0;
    }
    .items-table th.right { text-align: right; }
    .items-table td {
      padding: 14px; border-bottom: 1px solid #f0f1f5; font-size: 13px; color: #333;
      vertical-align: top;
    }
    .items-table td.right { text-align: right; font-variant-numeric: tabular-nums; }
    .items-table td.desc { font-weight: 500; color: #1a1d2e; }
    .items-table tbody tr:last-child td { border-bottom: 2px solid #e8eaf0; }
    .row-num { display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: #f0f1f5; align-items: center; justify-content: center; font-size: 10px; color: #888; margin-right: 8px; font-weight: 600; }

    /* Totals */
    .totals-section { display: flex; justify-content: flex-end; margin-top: 0; margin-bottom: 36px; }
    .totals-box { width: 280px; }
    .total-line { display: flex; justify-content: space-between; padding: 7px 0; font-size: 12px; color: #555; }
    .total-line .label { }
    .total-line .value { font-variant-numeric: tabular-nums; font-weight: 500; color: #333; }
    .total-line.discount .value { color: #c62828; }
    .total-line.grand {
      font-size: 16px; font-weight: 700; color: #1a1d2e;
      border-top: 2px solid #1a1d2e; padding-top: 12px; margin-top: 8px;
    }
    .total-line.balance {
      font-size: 13px; font-weight: 600; color: #2d3a8c;
      background: #f0f2ff; margin: 8px -12px 0; padding: 10px 12px; border-radius: 6px;
    }

    /* Payment info */
    .payment-info {
      background: #f9fafb; border: 1px solid #eef0f4; border-radius: 8px;
      padding: 20px 24px; margin-bottom: 28px;
      display: flex; gap: 40px;
    }
    .payment-info-section h4 {
      font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
      color: #2d3a8c; font-weight: 700; margin-bottom: 8px;
    }
    .payment-info-section p { font-size: 12px; color: #555; line-height: 1.7; }
    .payment-info-section p strong { color: #333; font-weight: 600; }

    /* Notes */
    .notes-box {
      background: #fffef5; border: 1px solid #f0eedb; border-radius: 6px;
      padding: 14px 18px; margin-bottom: 28px;
    }
    .notes-box h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #b8860b; font-weight: 700; margin-bottom: 6px; }
    .notes-box p { font-size: 12px; color: #666; line-height: 1.6; }

    /* Terms */
    .terms { margin-bottom: 36px; }
    .terms h4 {
      font-size: 10px; text-transform: uppercase; letter-spacing: 1px;
      color: #999; font-weight: 700; margin-bottom: 10px;
    }
    .terms ol { font-size: 11px; color: #888; line-height: 1.8; padding-left: 16px; }
    .terms ol li { margin-bottom: 2px; }

    /* Signature */
    .signature-section {
      display: flex; justify-content: flex-end; margin-bottom: 40px;
    }
    .signature-block {
      width: 240px; text-align: center;
    }
    .signature-line {
      border-bottom: 1px solid #ccc; height: 50px; margin-bottom: 8px;
      display: flex; align-items: flex-end; justify-content: center;
      padding-bottom: 6px;
    }
    .signature-name { font-size: 14px; font-weight: 600; color: #1a1d2e; font-style: italic; }
    .signature-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600; }
    .signature-title { font-size: 10px; color: #888; margin-top: 2px; }

    /* Footer */
    .footer {
      border-top: 1px solid #eef0f4; padding-top: 20px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-thanks { font-size: 14px; font-weight: 600; color: #2d3a8c; }
    .footer-contact { font-size: 10px; color: #999; text-align: right; line-height: 1.6; }

    @media print {
      .page { width: 100%; min-height: auto; }
    }
  </style>
</head>
<body>
  <div class="page">
    ${watermarkText ? `<div class="watermark">${watermarkText}</div>` : ""}
    <div class="accent-bar"></div>
    <div class="content">
      <div class="header">
        <div class="brand">
          <div class="logo-mark">
            <div class="logo-icon">F</div>
            <div class="logo-text">${biz.name}</div>
          </div>
          <div class="logo-tagline">${biz.tagline}</div>
        </div>
        <div class="invoice-badge">
          <span class="invoice-badge-dot"></span>
          ${invoice.status.toUpperCase()}
        </div>
      </div>

      <div class="title-row">
        <div class="title-col">
          <h1>Invoice</h1>
          <div class="inv-number">${invoice.number}</div>
        </div>
        <div class="dates-col">
          <div><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          ${biz.taxId ? `<div style="margin-top: 4px; font-size: 11px; color: #999;">Tax ID: ${biz.taxId}</div>` : ""}
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <div class="party-label">Bill To</div>
          <div class="party-name">${clientName}</div>
          <div class="party-company">${clientCompany}</div>
          <div class="party-detail">${clientEmail}<br>${clientAddress}</div>
        </div>
        <div class="party" style="text-align: right;">
          <div class="party-label" style="justify-content: flex-end;">From</div>
          <div class="party-name">${biz.name}</div>
          <div class="party-detail">${biz.address.replace(/\n/g, "<br>")}<br>${biz.phone}<br>${biz.email}<br>${biz.website}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 8%">#</th>
            <th style="width: 42%">Description</th>
            <th class="right" style="width: 12%">Qty</th>
            <th class="right" style="width: 18%">Unit Price</th>
            <th class="right" style="width: 20%">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item, i) => `
          <tr>
            <td><span class="row-num">${i + 1}</span></td>
            <td class="desc">${item.description}</td>
            <td class="right">${item.quantity}</td>
            <td class="right">$${fmt(item.rate)}</td>
            <td class="right" style="font-weight: 600;">$${fmt(item.quantity * item.rate)}</td>
          </tr>`).join("")}
        </tbody>
      </table>

      <div class="totals-section">
        <div class="totals-box">
          <div class="total-line"><span class="label">Subtotal</span><span class="value">$${fmt(subtotal)}</span></div>
          ${discount > 0 ? `<div class="total-line discount"><span class="label">Discount</span><span class="value">-$${fmt(discount)}</span></div>` : ""}
          ${taxRate > 0 ? `<div class="total-line"><span class="label">Tax (${taxRate}%)</span><span class="value">$${fmt(tax)}</span></div>` : ""}
          <div class="total-line grand"><span class="label">Grand Total</span><span class="value">$${fmt(grandTotal)}</span></div>
          ${paid > 0 ? `<div class="total-line"><span class="label">Amount Paid</span><span class="value" style="color: #2e7d32;">-$${fmt(paid)}</span></div>` : ""}
          <div class="total-line balance"><span class="label">Balance Due</span><span class="value">$${fmt(balance)}</span></div>
        </div>
      </div>

      <div class="payment-info">
        <div class="payment-info-section">
          <h4>Payment Details</h4>
          <p>
            <strong>Bank:</strong> ${biz.bankName}<br>
            <strong>Account:</strong> ${biz.bankAccount}<br>
            <strong>Routing:</strong> ${biz.bankRouting}
          </p>
        </div>
        <div class="payment-info-section">
          <h4>Payment Methods</h4>
          <p>Bank Transfer, Credit Card, PayPal<br>
          Please reference <strong>${invoice.number}</strong><br>when making payment.</p>
        </div>
      </div>

      ${invoice.notes ? `
      <div class="notes-box">
        <h4>Notes</h4>
        <p>${invoice.notes}</p>
      </div>` : ""}

      ${termsList ? `
      <div class="terms">
        <h4>Terms &amp; Conditions</h4>
        <ol>${termsList}</ol>
      </div>` : ""}

      ${invoice.signatory ? `
      <div class="signature-section">
        <div class="signature-block">
          <div class="signature-line">
            <span class="signature-name">${invoice.signatory}</span>
          </div>
          <div class="signature-label">Authorized Signature</div>
          <div class="signature-title">${biz.name}</div>
        </div>
      </div>` : ""}

      <div class="footer">
        <div class="footer-thanks">Thank you for your business!</div>
        <div class="footer-contact">${biz.email} | ${biz.phone}<br>${biz.website}</div>
      </div>
    </div>
  </div>
</body>
</html>`

  const w = window.open("", "_blank")
  if (w) {
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 600)
  }
}

export function InvoicesTable() {
  const clients = getClients()
  const [invoices, setInvoices] = useState(getInvoices)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<InvoiceForm>(emptyForm)

  const refresh = useCallback(() => setInvoices(getInvoices()), [])

  const filtered = invoices.filter((inv) => {
    const client = clients.find((c) => c.id === inv.clientId)
    const matchSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      (client?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatus = statusFilter === "all" || inv.status === statusFilter
    return matchSearch && matchStatus
  })

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(invoice: Invoice) {
    setEditingId(invoice.id)
    setForm({
      clientId: invoice.clientId,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
      items: [...invoice.items],
      taxRate: invoice.taxRate ?? 0,
      discount: invoice.discount ?? 0,
      terms: invoice.terms ?? DEFAULT_TERMS,
      signatory: invoice.signatory ?? "",
    })
    setDialogOpen(true)
  }

  function handleSave() {
    if (!form.clientId) {
      toast.error("Please select a client.")
      return
    }
    if (form.items.length === 0 || form.items.some((i) => !i.description.trim())) {
      toast.error("All line items must have a description.")
      return
    }
    if (!form.dueDate) {
      toast.error("Due date is required.")
      return
    }

    if (editingId) {
      updateInvoice(editingId, form)
      toast.success("Invoice updated.")
    } else {
      addInvoice(form)
      toast.success("Invoice created.")
    }
    refresh()
    setDialogOpen(false)
  }

  function handleDelete() {
    if (!deleteId) return
    deleteInvoice(deleteId)
    refresh()
    setDeleteId(null)
    toast.success("Invoice deleted.")
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }))
  }

  function removeItem(id: string) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }))
  }

  function updateItem(id: string, field: keyof InvoiceItem, value: string | number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    }))
  }

  const formSubtotal = form.items.reduce((sum, i) => sum + i.quantity * i.rate, 0)
  const formAfterDiscount = formSubtotal - form.discount
  const formTax = formAfterDiscount * (form.taxRate / 100)
  const formGrandTotal = formAfterDiscount + formTax

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          New Invoice
        </Button>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden md:table-cell">Issue Date</TableHead>
              <TableHead className="hidden md:table-cell">Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId)
                const total = getInvoiceGrandTotal(inv)
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium font-mono text-foreground">
                      {inv.number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {new Date(inv.issueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {new Date(inv.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge[inv.status].className}>
                        {statusBadge[inv.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-foreground tabular-nums">
                      ${fmt(total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setDetailInvoice(inv)}
                          aria-label={`View ${inv.number}`}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            const c = clients.find((cl) => cl.id === inv.clientId)
                            generatePdf(inv, c?.name ?? "Client", c?.company ?? "", c?.email ?? "", c?.address ?? "")
                          }}
                          aria-label={`Export ${inv.number} as PDF`}
                        >
                          <FileDown className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(inv.id)}
                          aria-label={`Delete ${inv.number}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      {detailInvoice && (
        <Dialog open={!!detailInvoice} onOpenChange={() => setDetailInvoice(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{detailInvoice.number}</DialogTitle>
              <DialogDescription>
                {clients.find((c) => c.id === detailInvoice.clientId)?.name ?? "Unknown client"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusBadge[detailInvoice.status].className}>
                  {statusBadge[detailInvoice.status].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Issue Date</span>
                <span className="text-foreground">
                  {new Date(detailInvoice.issueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Due Date</span>
                <span className="text-foreground">
                  {new Date(detailInvoice.dueDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="mt-2 rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-foreground">{item.description}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground font-mono">
                          ${fmt(item.rate)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-foreground">
                          ${fmt(item.quantity * item.rate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-1 rounded-lg bg-muted px-4 py-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">${fmt(getInvoiceTotal(detailInvoice))}</span>
                </div>
                {(detailInvoice.discount ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Discount</span>
                    <span className="font-mono text-destructive">-${fmt(detailInvoice.discount)}</span>
                  </div>
                )}
                {(detailInvoice.taxRate ?? 0) > 0 && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tax ({detailInvoice.taxRate}%)</span>
                    <span className="font-mono">${fmt((getInvoiceTotal(detailInvoice) - (detailInvoice.discount ?? 0)) * ((detailInvoice.taxRate ?? 0) / 100))}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
                  <span className="text-sm font-medium text-foreground">Grand Total</span>
                  <span className="text-lg font-bold font-mono text-foreground">
                    ${fmt(getInvoiceGrandTotal(detailInvoice))}
                  </span>
                </div>
              </div>
              {detailInvoice.signatory && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Signatory</span>
                  <span className="text-foreground italic">{detailInvoice.signatory}</span>
                </div>
              )}
              {detailInvoice.notes && (
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Notes:</strong> {detailInvoice.notes}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => openEdit(detailInvoice)}>
                Edit
              </Button>
              <Button
                onClick={() => {
                  const c = clients.find((cl) => cl.id === detailInvoice.clientId)
                  generatePdf(detailInvoice, c?.name ?? "Client", c?.company ?? "", c?.email ?? "", c?.address ?? "")
                }}
              >
                <FileDown className="mr-2 size-4" />
                Export PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Invoice" : "New Invoice"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update invoice details." : "Create a new invoice for a client."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Client</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.company})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v as InvoiceStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="grid gap-2">
              <Label>Line Items</Label>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-20">Qty</TableHead>
                      <TableHead className="w-28">Rate</TableHead>
                      <TableHead className="w-28 text-right">Amount</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Description"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, "quantity", parseInt(e.target.value) || 0)
                            }
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(item.id, "rate", parseFloat(e.target.value) || 0)
                            }
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          ${fmt(item.quantity * item.rate)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                            disabled={form.items.length <= 1}
                            aria-label="Remove item"
                          >
                            <X className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm" onClick={addItem} className="w-fit">
                <Plus className="mr-1 size-3" />
                Add Item
              </Button>
            </div>

            {/* Tax, Discount & Totals */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.taxRate}
                  onChange={(e) => setForm((p) => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Discount ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.discount}
                  onChange={(e) => setForm((p) => ({ ...p, discount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted px-4 py-3 flex flex-col gap-0.5 text-sm">
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Subtotal</span>
                <span className="font-mono">${fmt(formSubtotal)}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Discount</span>
                  <span className="font-mono text-destructive">-${fmt(form.discount)}</span>
                </div>
              )}
              {form.taxRate > 0 && (
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Tax ({form.taxRate}%)</span>
                  <span className="font-mono">${fmt(formTax)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border mt-1">
                <span>Grand Total</span>
                <span className="font-mono">${fmt(formGrandTotal)}</span>
              </div>
            </div>

            {/* Signatory */}
            <div className="grid gap-1.5">
              <Label>Authorized Signatory</Label>
              <Input
                value={form.signatory}
                onChange={(e) => setForm((p) => ({ ...p, signatory: e.target.value }))}
                placeholder="Full name of authorized signer"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-1.5">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Optional notes for the client..."
                rows={2}
              />
            </div>

            {/* Terms */}
            <div className="grid gap-1.5">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={form.terms}
                onChange={(e) => setForm((p) => ({ ...p, terms: e.target.value }))}
                placeholder="Enter terms and conditions..."
                rows={4}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will permanently remove the invoice and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
