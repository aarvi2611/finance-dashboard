import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  DocumentData
} from "firebase/firestore";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAehNun7QP5CA-p9bIHWVgb3tGIz14iqk0",
  authDomain: "finance-dashboard-2611.firebaseapp.com",
  projectId: "finance-dashboard-2611",
  storageBucket: "finance-dashboard-2611.firebasestorage.app",
  messagingSenderId: "1066872152648",
  appId: "1:1066872152648:web:f8873b0e27a7cf40d6ee7d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);



// =====================================================
// 🟢 CLIENTS
// =====================================================

export const addClient = async (clientData: DocumentData) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "clients"), {
    ...clientData,
    userId: user.uid,
    createdAt: serverTimestamp()
  });
};

export const getClients = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "clients"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};



// =====================================================
// 🟢 INVOICES
// =====================================================

export const addInvoice = async (invoiceData: DocumentData) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "invoices"), {
    ...invoiceData,
    status: invoiceData.status || "Sent",
    userId: user.uid,
    createdAt: serverTimestamp()
  });
};

export const updateInvoiceStatus = async (
  invoiceId: string,
  status: string
) => {
  await updateDoc(doc(db, "invoices", invoiceId), {
    status
  });
};

export const getInvoices = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "invoices"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};



// =====================================================
// 🟢 PAYMENTS
// =====================================================

export const addPayment = async (paymentData: DocumentData) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, "payments"), {
    ...paymentData,
    userId: user.uid,
    createdAt: serverTimestamp()
  });
};

export const getPayments = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "payments"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};



// =====================================================
// 🔴 DELETE (Reusable)
// =====================================================

export const deleteItem = async (
  collectionName: string,
  id: string
) => {
  await deleteDoc(doc(db, collectionName, id));
};



// =====================================================
// 📊 DASHBOARD CALCULATIONS
// =====================================================

export const getDashboardStats = async () => {
  const invoices = await getInvoices();
  const clients = await getClients();

  const totalRevenue = invoices
    .filter((inv: any) => inv.status === "Paid")
    .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

  const outstanding = invoices
    .filter((inv: any) => inv.status !== "Paid")
    .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);

  const overdue = invoices.filter(
    (inv: any) => inv.status === "Overdue"
  ).length;

  return {
    totalRevenue,
    outstanding,
    totalClients: clients.length,
    overdue
  };
};



// =====================================================
// 📈 MONTHLY REVENUE (FOR CHART)
// =====================================================

export const getMonthlyRevenue = async () => {
  const invoices = await getInvoices();

  const monthly: { [key: string]: number } = {};

  invoices.forEach((inv: any) => {
    if (inv.status !== "Paid" || !inv.createdAt) return;

    const date = inv.createdAt.toDate();
    const month = date.toLocaleString("default", { month: "short" });

    monthly[month] = (monthly[month] || 0) + Number(inv.amount || 0);
  });

  return Object.keys(monthly).map(month => ({
    month,
    revenue: monthly[month]
  }));
};



// =====================================================
// 🔵 REAL-TIME LISTENER (Invoices)
// =====================================================

export const listenInvoices = (
  callback: (data: any[]) => void
) => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "invoices"),
    where("userId", "==", user.uid)
  );

  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(data);
  });
};