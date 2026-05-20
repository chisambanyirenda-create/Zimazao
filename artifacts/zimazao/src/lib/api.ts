const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API_BASE = `${BASE}/api`;

function getToken(): string | null {
  return localStorage.getItem("zimazao_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.error || `HTTP ${res.status}`);
    err.code = data.code;
    throw err;
  }
  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: ApiUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      location?: string;
      userType: "farmer" | "buyer";
    }) =>
      request<{ token: string; user: ApiUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  listings: {
    list: (params?: { category?: string; location?: string; search?: string }) => {
      const qs = params
        ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
        : "";
      return request<ApiListing[]>(`/listings${qs}`);
    },
    get: (id: number) => request<ApiListing>(`/listings/${id}`),
    create: (data: {
      cropName: string;
      price: number;
      unit: string;
      quantity: string;
      location: string;
      latitude?: number | null;
      longitude?: number | null;
      category: string;
      description?: string;
      imageUrl?: string;
    }) =>
      request<ApiListing>("/listings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  farmers: {
    get: (id: number) => request<ApiFarmerProfile>(`/farmers/${id}`),
  },
  orders: {
    list: () => request<ApiOrderDetail[]>("/orders"),
    create: (data: { listingId: number; quantity: string; totalPrice: number }) =>
      request<ApiOrder>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  messages: {
    conversations: () => request<ApiMessage[]>("/messages"),
    thread: (userId: number) => request<ApiMessage[]>(`/messages/${userId}`),
    send: (receiverId: number, content: string) =>
      request<ApiMessage>("/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId, content }),
      }),
  },
  disease: {
    scan: (imageBase64: string) =>
      request<ApiDiseaseScanResult>("/disease/scan", {
        method: "POST",
        body: JSON.stringify({ imageBase64 }),
      }),
  },
  livestock: {
    scan: (imageBase64: string) =>
      request<ApiLivestockScanResult>("/livestock/scan", {
        method: "POST",
        body: JSON.stringify({ imageBase64 }),
      }),
  },
  prices: {
    list: () => request<ApiMarketPrice[]>("/prices"),
  },
  dashboard: {
    get: () => request<ApiDashboardStats>("/dashboard"),
  },
  upload: {
    image: async (file: File): Promise<{ url: string; publicId: string }> => {
      const token = getToken();
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    },
  },
  subscription: {
    status: () => request<ApiSubscriptionStatus>("/subscription"),
    upgrade: (plan: "pro", paymentReference: string) =>
      request<ApiSubscription>("/subscription/upgrade", {
        method: "POST",
        body: JSON.stringify({ plan, paymentReference }),
      }),
  },
  payments: {
    initiate: (data: { amount: number; method: string; phone: string; purpose?: string }) =>
      request<ApiPaymentInitiate>("/payments/initiate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    verify: (reference: string) =>
      request<ApiPaymentVerify>("/payments/verify", {
        method: "POST",
        body: JSON.stringify({ reference }),
      }),
    history: () => request<ApiPayment[]>("/payments/history"),
  },
  admin: {
    revenue: () => request<any>("/admin/revenue"),
    sponsors: {
      list: () => request<ApiSponsoredProduct[]>("/admin/sponsors"),
      create: (data: Omit<ApiSponsoredProduct, "id" | "createdAt" | "isActive">) =>
        request<ApiSponsoredProduct>("/admin/sponsors", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: number, data: Partial<ApiSponsoredProduct>) =>
        request<ApiSponsoredProduct>(`/admin/sponsors/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      delete: (id: number) =>
        request<{ success: boolean }>(`/admin/sponsors/${id}`, { method: "DELETE" }),
    },
  },
};

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  userType: "farmer" | "buyer";
  isAdmin?: boolean;
  createdAt: string;
}

export interface ApiListing {
  id: number;
  farmerId: number;
  farmerName: string | null;
  cropName: string;
  price: string;
  unit: string;
  quantity: string;
  location: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApiFarmerProfile {
  id: number;
  name: string;
  location: string | null;
  phone: string | null;
  createdAt: string;
  totalListings: number;
  listings: Omit<ApiListing, "farmerId" | "farmerName" | "isActive">[];
}

export interface ApiOrder {
  id: number;
  buyerId: number;
  listingId: number;
  quantity: string;
  totalPrice: string;
  commission: string;
  status: string;
  createdAt: string;
  farmerPayout?: number;
}

export interface ApiOrderDetail extends ApiOrder {
  cropName: string | null;
  unit: string | null;
  location: string | null;
  imageUrl: string | null;
  farmerName: string | null;
  farmerId: number | null;
}

export interface ApiMessage {
  id: number;
  senderId: number;
  senderName: string | null;
  receiverId: number;
  content: string;
  createdAt: string;
}

export interface ApiLivestockScanResult {
  condition: string;
  animalType: string;
  confidence: number;
  description: string;
  symptoms: string[];
  urgency: "routine" | "soon" | "urgent" | "emergency";
  treatment: string[];
  medicines: string[];
  prevention: string[];
  vetAdvice: string;
}

export interface ApiSponsoredProduct {
  id: number;
  companyName: string;
  productName: string;
  productImage: string | null;
  description: string | null;
  price: string | null;
  targetDisease: string;
  contactNumber: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApiDiseaseScanResult {
  disease: string;
  confidence: number;
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  severity: "low" | "medium" | "high";
  medicines?: string[];
  sponsoredProducts?: ApiSponsoredProduct[];
}

export interface ApiMarketPrice {
  crop: string;
  emoji: string;
  unit: string;
  average: number;
  weeklyChange: number;
  markets: { name: string; price: number; change: number }[];
}

export interface ApiDashboardStats {
  totalSales: number;
  activeListings: number;
  totalOrders: number;
  messages: number;
  recentListings: ApiListing[];
}

export interface ApiSubscriptionStatus {
  plan: "free" | "pro";
  status: string;
  startDate?: string;
  endDate?: string;
  limits: { listings: number | null; diseaseScans: number | null };
}

export interface ApiSubscription {
  id: number;
  userId: number;
  plan: "free" | "pro";
  startDate: string;
  endDate: string | null;
  status: string;
}

export interface ApiPaymentInitiate {
  status: string;
  reference: string;
  paymentId: number;
  message: string;
  testMode?: boolean;
  flutterwaveData?: any;
}

export interface ApiPaymentVerify {
  status: string;
  reference: string;
  amount?: string;
  currency?: string;
  testMode?: boolean;
}

export interface ApiPayment {
  id: number;
  userId: number;
  amount: string;
  currency: string;
  method: string;
  status: string;
  reference: string;
  purpose: string;
  createdAt: string;
}
