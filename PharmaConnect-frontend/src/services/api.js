import axiosInstance from "../utils/axiosInstance";

// --- Cart helpers (localStorage) ---
// Cart stores full product snapshot: { productId, name, price, quantity }
const getCartData = () => JSON.parse(localStorage.getItem("cart") || "[]");
const saveCartData = (items) => localStorage.setItem("cart", JSON.stringify(items));

const buildCartResponse = (items) => {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const enriched = items.map((i) => ({ ...i, product: { name: i.name, price: i.price, category: i.category } }));
  return { items: enriched, total, count: items.reduce((s, i) => s + i.quantity, 0) };
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    return res.data;
  },
  logout: async () => {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  },
  me: async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  },

  // Products — real backend
  getProducts: async ({ search = "", category = "" } = {}) => {
    const res = await axiosInstance.get("/products");
    let results = res.data;
    if (category) results = results.filter((p) => p.category === category);
    if (search)   results = results.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return results;
  },
  getProduct: async (id) => {
    const res = await axiosInstance.get("/products");
    return res.data.find((p) => p._id === id) || null;
  },

  // Cart — localStorage with full product snapshot
  getCart: () => Promise.resolve(buildCartResponse(getCartData())),
  addToCart: (product, quantity = 1) => {
    const items = getCartData();
    const existing = items.find((i) => i.productId === product._id);
    if (existing) existing.quantity += quantity;
    else items.push({ productId: product._id, name: product.name, price: product.price, category: product.category, quantity });
    saveCartData(items);
    return Promise.resolve(buildCartResponse(items));
  },
  updateCart: (productId, quantity) => {
    const items = getCartData().map((i) => i.productId === productId ? { ...i, quantity } : i);
    saveCartData(items);
    return Promise.resolve(buildCartResponse(items));
  },
  removeFromCart: (productId) => {
    const items = getCartData().filter((i) => i.productId !== productId);
    saveCartData(items);
    return Promise.resolve(buildCartResponse(items));
  },
  clearCart: () => {
    saveCartData([]);
    return Promise.resolve({ items: [], total: 0, count: 0 });
  },

  // Orders
  getOrders: async () => {
    const res = await axiosInstance.get("/api/orders/my");
    return res.data;
  },
  getOrder: async (id) => {
    const res = await axiosInstance.get("/api/orders/my");
    return res.data.find((o) => o._id === id) || null;
  },
  placeOrder: async () => {
    const cartItems = getCartData();
    if (!cartItems.length) throw new Error("Cart is empty");
    const items = cartItems.map((i) => ({ product: i.productId, name: i.name, quantity: i.quantity, price: i.price }));
    const res = await axiosInstance.post("/api/orders", { items });
    saveCartData([]);
    return res.data;
  },

  // Invoices — derived from orders
  getInvoices: async () => {
    const res = await axiosInstance.get("/api/orders/my");
    return res.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const cartItems = getCartData();
    const res = await axiosInstance.get("/api/orders/my");
    const orders = res.data;
    return {
      totalOrders:   orders.length,
      cartItems:     cartItems.reduce((s, i) => s + i.quantity, 0),
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      delivered:     orders.filter((o) => o.status === "delivered").length,
      recentOrders:  orders.slice(0, 5),
    };
  },
};
