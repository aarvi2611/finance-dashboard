export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  createdAt: string
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue"
export type PaymentMethod = "bank_transfer" | "credit_card" | "paypal" | "cash"

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
}

export interface Invoice {
  id: string
  number: string
  clientId: string
  items: InvoiceItem[]
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  notes: string
  taxRate: number
  discount: number
  terms: string
  signatory: string
}

export interface BusinessProfile {
  name: string
  tagline: string
  email: string
  phone: string
  website: string
  address: string
  taxId: string
  bankName: string
  bankAccount: string
  bankRouting: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  date: string
  method: PaymentMethod
  reference: string
}

// --- Seed Data ---
const initialClients: Client[] = [
  {
    id: "c1",
    name: "Sarah Mitchell",
    email: "sarah@acmecorp.io",
    phone: "+1 (555) 234-5678",
    company: "Acme Corp",
    address: "123 Business Ave, New York, NY 10001",
    createdAt: "2025-08-15",
  },
  {
    id: "c2",
    name: "James Rivera",
    email: "james@brightlabs.co",
    phone: "+1 (555) 345-6789",
    company: "Bright Labs",
    address: "456 Innovation Dr, San Francisco, CA 94102",
    createdAt: "2025-09-02",
  },
  {
    id: "c3",
    name: "Emily Chen",
    email: "emily@novanet.com",
    phone: "+1 (555) 456-7890",
    company: "NovaNet",
    address: "789 Tech Blvd, Austin, TX 73301",
    createdAt: "2025-10-11",
  },
  {
    id: "c4",
    name: "Marcus Thompson",
    email: "marcus@greenleaf.co",
    phone: "+1 (555) 567-8901",
    company: "Greenleaf Solutions",
    address: "321 Eco Lane, Portland, OR 97201",
    createdAt: "2025-11-03",
  },
  {
    id: "c5",
    name: "Olivia Park",
    email: "olivia@zenithdesign.com",
    phone: "+1 (555) 678-9012",
    company: "Zenith Design",
    address: "654 Creative St, Chicago, IL 60601",
    createdAt: "2025-12-20",
  },
]

const defaultTerms = "1. Payment is due within the terms stated above.\n2. Late payments may incur a 1.5% monthly interest charge.\n3. All deliverables remain the property of the service provider until full payment is received.\n4. Any disputes must be raised within 14 days of receipt of this invoice.\n5. This invoice is governed by the laws of the State of New York."

const initialInvoices: Invoice[] = [
  {
    id: "inv1",
    number: "INV-001",
    clientId: "c1",
    items: [
      { id: "i1", description: "Website Redesign", quantity: 1, rate: 4500 },
      { id: "i2", description: "SEO Optimization", quantity: 1, rate: 1200 },
    ],
    status: "paid",
    issueDate: "2026-01-05",
    dueDate: "2026-02-05",
    notes: "Thank you for your business.",
    taxRate: 8.5,
    discount: 0,
    terms: defaultTerms,
    signatory: "Alex Morgan",
  },
  {
    id: "inv2",
    number: "INV-002",
    clientId: "c2",
    items: [
      { id: "i3", description: "Mobile App Development - Phase 1", quantity: 1, rate: 8500 },
      { id: "i4", description: "UX Consultation", quantity: 3, rate: 350 },
    ],
    status: "sent",
    issueDate: "2026-01-18",
    dueDate: "2026-02-18",
    notes: "Net 30 terms apply.",
    taxRate: 8.5,
    discount: 500,
    terms: defaultTerms,
    signatory: "Alex Morgan",
  },
  {
    id: "inv3",
    number: "INV-003",
    clientId: "c3",
    items: [
      { id: "i5", description: "Cloud Infrastructure Setup", quantity: 1, rate: 3200 },
      { id: "i6", description: "Monthly Monitoring (3 months)", quantity: 3, rate: 600 },
    ],
    status: "overdue",
    issueDate: "2025-12-01",
    dueDate: "2026-01-01",
    notes: "Please remit payment at your earliest convenience.",
    taxRate: 8.5,
    discount: 0,
    terms: defaultTerms,
    signatory: "Alex Morgan",
  },
  {
    id: "inv4",
    number: "INV-004",
    clientId: "c4",
    items: [
      { id: "i7", description: "Brand Strategy Workshop", quantity: 1, rate: 2800 },
    ],
    status: "draft",
    issueDate: "2026-02-10",
    dueDate: "2026-03-10",
    notes: "",
    taxRate: 0,
    discount: 0,
    terms: defaultTerms,
    signatory: "Alex Morgan",
  },
  {
    id: "inv5",
    number: "INV-005",
    clientId: "c5",
    items: [
      { id: "i8", description: "UI/UX Design System", quantity: 1, rate: 6200 },
      { id: "i9", description: "Component Library", quantity: 1, rate: 3800 },
    ],
    status: "paid",
    issueDate: "2025-11-20",
    dueDate: "2025-12-20",
    notes: "Thank you for prompt payment!",
    taxRate: 8.5,
    discount: 200,
    terms: defaultTerms,
    signatory: "Alex Morgan",
  },
  {
    id: "inv6",
    number: "INV-006",
    clientId: "c1",
    items: [
      { id: "i10", description: "Email Campaign Setup", quantity: 1, rate: 1500 },
      { id: "i11", description: "A/B Testing (4 variants)", quantity: 4, rate: 300 },
    ],
    status: "sent",
    issueDate: "2026-02-01",
    dueDate: "2026-03-01",
    notes: "",
    taxRate: 8.5,
    discount: 0,
    terms: defaultTerms,
    signatory: "Alex Morgan",
  },
]

const initialPayments: Payment[] = [
  {
    id: "p1",
    invoiceId: "inv1",
    amount: 5700,
    date: "2026-01-28",
    method: "bank_transfer",
    reference: "TXN-20260128-001",
  },
  {
    id: "p2",
    invoiceId: "inv5",
    amount: 10000,
    date: "2025-12-18",
    method: "credit_card",
    reference: "TXN-20251218-002",
  },
  {
    id: "p3",
    invoiceId: "inv3",
    amount: 2000,
    date: "2026-01-15",
    method: "paypal",
    reference: "TXN-20260115-003",
  },
]

// --- In-memory store (client-side state) ---
let clients = [...initialClients]
let invoices = [...initialInvoices]
let payments = [...initialPayments]
let invoiceCounter = 7

let businessProfile: BusinessProfile = {
  name: "FinanceHub",
  tagline: "Professional Financial Services",
  email: "billing@financehub.io",
  phone: "+1 (555) 100-2000",
  website: "www.financehub.io",
  address: "100 Finance Street, Suite 400\nNew York, NY 10005",
  taxId: "EIN 12-3456789",
  bankName: "First National Bank",
  bankAccount: "****-****-****-4832",
  bankRouting: "021000021",
}

export function getBusinessProfile(): BusinessProfile {
  return { ...businessProfile }
}

export function updateBusinessProfile(updates: Partial<BusinessProfile>) {
  businessProfile = { ...businessProfile, ...updates }
  return getBusinessProfile()
}

export const DEFAULT_TERMS = "1. Payment is due within the terms stated above.\n2. Late payments may incur a 1.5% monthly interest charge.\n3. All deliverables remain the property of the service provider until full payment is received.\n4. Any disputes must be raised within 14 days of receipt of this invoice.\n5. This invoice is governed by the laws of the State of New York."

export function getClients() {
  return [...clients]
}

export function getClient(id: string) {
  return clients.find((c) => c.id === id) ?? null
}

export function addClient(c: Omit<Client, "id" | "createdAt">) {
  const newClient: Client = {
    ...c,
    id: `c${Date.now()}`,
    createdAt: new Date().toISOString().split("T")[0],
  }
  clients = [newClient, ...clients]
  return newClient
}

export function updateClient(id: string, updates: Partial<Omit<Client, "id" | "createdAt">>) {
  clients = clients.map((c) => (c.id === id ? { ...c, ...updates } : c))
  return getClient(id)
}

export function deleteClient(id: string) {
  clients = clients.filter((c) => c.id !== id)
}

export function getInvoices() {
  return [...invoices]
}

export function getInvoice(id: string) {
  return invoices.find((inv) => inv.id === id) ?? null
}

export function addInvoice(inv: Omit<Invoice, "id" | "number">) {
  const newInvoice: Invoice = {
    ...inv,
    id: `inv${Date.now()}`,
    number: `INV-${String(invoiceCounter++).padStart(3, "0")}`,
  }
  invoices = [newInvoice, ...invoices]
  return newInvoice
}

export function updateInvoice(id: string, updates: Partial<Omit<Invoice, "id" | "number">>) {
  invoices = invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
  return getInvoice(id)
}

export function deleteInvoice(id: string) {
  invoices = invoices.filter((inv) => inv.id !== id)
}

export function getPayments() {
  return [...payments]
}

export function getPaymentsByInvoice(invoiceId: string) {
  return payments.filter((p) => p.invoiceId === invoiceId)
}

export function addPayment(p: Omit<Payment, "id">) {
  const newPayment: Payment = { ...p, id: `p${Date.now()}` }
  payments = [newPayment, ...payments]
  return newPayment
}

export function getInvoiceTotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
}

export function getInvoiceGrandTotal(invoice: Invoice): number {
  const subtotal = getInvoiceTotal(invoice)
  const discount = invoice.discount ?? 0
  const taxRate = invoice.taxRate ?? 0
  const afterDiscount = subtotal - discount
  const tax = afterDiscount * (taxRate / 100)
  return afterDiscount + tax
}

export function getInvoicePaid(invoiceId: string): number {
  return payments.filter((p) => p.invoiceId === invoiceId).reduce((sum, p) => sum + p.amount, 0)
}

export function getInvoiceBalance(invoice: Invoice): number {
  return getInvoiceGrandTotal(invoice) - getInvoicePaid(invoice.id)
}
