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
    updateProfile: (data: {
      name?: string;
      phone?: string;
      location?: string;
      oldPassword?: string;
      newPassword?: string;
    }) =>
      request<ApiUser>("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    uploadAvatar: (file: File): Promise<ApiUser> => {
      const token = localStorage.getItem("zimazao_token");
      const form = new FormData();
      form.append("avatar", file);
      return fetch(`${API_BASE}/users/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        return data as ApiUser;
      });
    },
    switchMode: (targetMode: "farmer" | "buyer") =>
      request<{ token: string; user: ApiUser }>("/auth/switch-mode", {
        method: "PATCH",
        body: JSON.stringify({ targetMode }),
      }),
  },
  listings: {
    list: (params?: { category?: string; location?: string; search?: string; minPrice?: string; maxPrice?: string; minQty?: string; verifiedOnly?: string; sort?: string }) => {
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
    farmerOrders: () => request<ApiOrderDetail[]>("/orders/farmer-orders"),
    create: (data: { listingId: number; quantity: string; totalPrice: number; paymentMethod?: "online" | "cod" }) =>
      request<ApiOrder>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, status: string, estimatedDelivery?: string) =>
      request<ApiOrder>(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(estimatedDelivery ? { estimatedDelivery } : {}) }),
      }),
    confirmDelivery: (id: number) =>
      request<{ ok: boolean; message: string; farmerPayout: number }>(`/orders/${id}/confirm-delivery`, { method: "POST" }),
    codComplete: (id: number) =>
      request<{ ok: boolean; message: string }>(`/orders/${id}/cod-complete`, { method: "POST" }),
    updateLocation: (id: number, lat: number, lng: number) =>
      request<{ ok: boolean; role: string }>(`/orders/${id}/location`, {
        method: "PATCH",
        body: JSON.stringify({ lat, lng }),
      }),
    getLocations: (id: number) =>
      request<{ farmer?: { lat: number; lng: number; updatedAt: number }; buyer?: { lat: number; lng: number; updatedAt: number } }>(`/orders/${id}/locations`),
    track: (token: string) => request<ApiTrackingInfo>(`/orders/track/${token}`),
  },
  disputes: {
    raise: (data: { orderId: number; reason: string; description: string }) =>
      request<{ id: number; orderId: number; reason: string; status: string }>("/disputes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    my: () => request<Array<{ id: number; orderId: number; reason: string; status: string; createdAt: string }>>("/disputes/my"),
  },
  withdrawals: {
    request: (data: { amount: number; mobileMoneyNumber: string; network?: string }) =>
      request<{ id: number; amount: string; status: string }>("/withdrawals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: () => request<Array<{ id: number; amount: string; mobileMoneyNumber: string; network: string; status: string; createdAt: string }>>("/withdrawals"),
  },
  messages: {
    conversations: () => request<ApiMessage[]>("/messages"),
    thread: (userId: number) => request<ApiThreadResponse>(`/messages/${userId}`),
    send: (receiverId: number, content: string, relatedOrderId?: number) =>
      request<ApiMessage>("/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId, content, ...(relatedOrderId ? { relatedOrderId } : {}) }),
      }),
    unreadCount: () => request<{ count: number; latest: ApiMessage | null }>("/messages/unread-count"),
    markRead: (senderId: number) =>
      request<{ ok: boolean }>(`/messages/mark-read/${senderId}`, { method: "POST" }),
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
  reviews: {
    forFarmer: (farmerId: number) =>
      request<ApiFarmerReviews>(`/reviews/farmer/${farmerId}`),
    create: (data: { orderId: number; farmerId: number; rating: number; comment?: string }) =>
      request<ApiReview>("/reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  notifications: {
    list: () => request<ApiNotification[]>("/notifications"),
    unreadCount: () => request<{ count: number }>("/notifications/unread-count"),
    markAllRead: () => request<{ ok: boolean }>("/notifications/mark-all-read", { method: "PATCH" }),
    markRead: (id: number) => request<{ ok: boolean }>(`/notifications/${id}/read`, { method: "PATCH" }),
  },
};

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  profilePicture?: string | null;
  userType: "farmer" | "buyer";
  walletBalance: number;
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
  listingId: number | null;
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
  buyerName?: string | null;
  farmerId: number | null;
  paymentMethod?: "online" | "cod";
  escrowStatus?: "held" | "released" | "refunded" | "frozen" | "cod_complete" | null;
  listingId: number | null;
}

export interface ApiMessage {
  id: number;
  senderId: number;
  senderName: string | null;
  receiverId: number;
  receiverName?: string | null;
  content: string;
  isRead?: boolean;
  relatedOrderId?: number | null;
  unreadCount?: number;
  unread?: boolean;
  createdAt: string;
}

export interface ApiOrderInThread {
  id: number;
  quantity: string;
  totalPrice: string;
  commission: string;
  status: string;
  cropName: string | null;
  unit: string | null;
  imageUrl: string | null;
  location: string | null;
  farmerId: number | null;
  buyerId: number;
  createdAt: string;
}

export interface ApiThreadResponse {
  messages: ApiMessage[];
  relatedOrderId: number | null;
  orderDetail: ApiOrderInThread | null;
}

export interface ApiReview {
  id: number;
  orderId: number;
  buyerId: number;
  farmerId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  buyerName?: string | null;
}

export interface ApiFarmerReviews {
  reviews: ApiReview[];
  averageRating: number;
  totalReviews: number;
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

export interface ApiNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  href: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiTrackingInfo {
  id: number;
  status: string;
  quantity: string;
  totalPrice: string;
  createdAt: string;
  estimatedDelivery: string | null;
  cropName: string | null;
  unit: string | null;
  location: string | null;
  farmerName: string | null;
}
