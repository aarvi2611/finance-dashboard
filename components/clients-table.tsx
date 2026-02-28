"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import { toast } from "sonner"

type Client = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  createdAt: number
}

type FormData = Omit<Client, "id" | "createdAt">

const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
}

export function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  async function fetchClients() {
    const snapshot = await getDocs(collection(db, "clients"))
    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Client, "id">),
    }))
    setClients(list)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(client: Client) {
    setEditingId(client.id)
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.")
      return
    }

    if (editingId) {
      await updateDoc(doc(db, "clients", editingId), form)
      toast.success("Client updated successfully.")
    } else {
      await addDoc(collection(db, "clients"), {
        ...form,
        createdAt: Date.now(),
      })
      toast.success("Client created successfully.")
    }

    setDialogOpen(false)
    fetchClients()
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteDoc(doc(db, "clients", deleteId))
    setDeleteId(null)
    toast.success("Client deleted.")
    fetchClients()
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Add Client
        </Button>
      </div>

      <div className="mt-4 rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(client)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleteId(client.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog & Delete remain same structure */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Client" : "New Client"}</DialogTitle>
            <DialogDescription>
              Fill in client details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {(["name","email","phone","company","address"] as (keyof FormData)[]).map((key) => (
              <div key={key}>
                <Label>{key}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
