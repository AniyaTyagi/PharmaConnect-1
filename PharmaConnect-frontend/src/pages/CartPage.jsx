import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart,             setCart]             = useState({ items: [], total: 0, count: 0 });
  const [placing,          setPlacing]          = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod,    setPaymentMethod]    = useState("cod");
  const [showQR,           setShowQR]           = useState(false);
  const [inputVals,        setInputVals]        = useState({});
  const [orderError,       setOrderError]       = useState("");

  const loadCart = () => { api.getCart().then(setCart).catch(() => {}); };
  useEffect(() => { loadCart(); }, []);

  const updateQty = async (productId, qty) => {
    const val = Math.max(1, parseInt(qty) || 1);
    setInputVals((p) => ({ ...p, [productId]: String(val) }));
    await api.updateCart(productId, val);
    await refreshCart();
  };

  const remove = async (productId) => {
    await api.removeFromCart(productId);
    await refreshCart();
  };

  const placeOrder = async () => {
    setPlacing(true);
    setOrderError("");
    try {
      await api.placeOrder();
      await refreshCart();
      setShowPaymentModal(false);
      navigate("/orders");
    } catch (e) {
      setOrderError(e.response?.data?.error || e.message || "Failed to place order");
    }
    setPlacing(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu="cart" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Shopping Cart</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {cart.count > 0 ? `${cart.count} item(s) in your cart` : "Your cart is empty"}
            </p>
          </div>

          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <ShoppingCart size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">Your cart is empty</p>
              <p className="text-xs text-gray-300">Start adding medical products to your cart</p>
              <button onClick={() => navigate("/products")}
                className="mt-1 px-5 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex gap-5 items-start">
              {/* Items */}
              <div className="flex-1 space-y-3">
                {cart.items.map(({ productId, quantity, product }) => (
                  <div key={productId} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                      <p className="text-xs text-gray-500 mt-1">₹{product.price.toLocaleString()} per unit</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(productId, (parseInt(inputVals[productId] ?? quantity) || 1) - 1)}
                          className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors">−</button>
                        <input
                          type="number" min="1"
                          value={inputVals[productId] ?? quantity}
                          onChange={(e) => setInputVals((p) => ({ ...p, [productId]: e.target.value }))}
                          onBlur={(e) => { const n = parseInt(e.target.value); updateQty(productId, (!n || n < 1) ? 1 : n); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { const n = parseInt(e.target.value); updateQty(productId, (!n || n < 1) ? 1 : n); }}}
                          className="w-12 text-center text-sm font-medium text-gray-800 border-x border-gray-200 py-1.5 outline-none"
                        />
                        <button
                          onClick={() => updateQty(productId, (parseInt(inputVals[productId] ?? quantity) || 1) + 1)}
                          className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors">+</button>
                      </div>
                      <p className="text-sm font-bold text-gray-800 w-24 text-right">₹{(product.price * quantity).toLocaleString()}</p>
                      <button onClick={() => remove(productId)}
                        className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 sticky top-6">
                <h3 className="text-sm font-bold text-gray-800 tracking-tight">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Items ({cart.count})</span>
                    <span>₹{cart.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{cart.total.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => setShowPaymentModal(true)} disabled={placing}
                  className="w-full py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl transition-colors">
                  Place Order
                </button>
                <button onClick={() => navigate("/products")}
                  className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                  ← Continue Shopping
                </button>
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPaymentModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 tracking-tight">Payment Details</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Review your order before confirming</p>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
                </div>

                <div className="px-6 py-4 space-y-4">
                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500"><span>Total Items</span><span>{cart.count}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{cart.total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-emerald-600 font-medium">Free</span></div>
                    <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                      <span>Total Amount</span><span>₹{cart.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment Method</p>
                    <div className="space-y-2">
                      {[
                        { value: "cod",    label: "Cash on Delivery" },
                        { value: "online", label: "Online Payment (UPI)" },
                      ].map(({ value, label }) => (
                        <label key={value}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                            paymentMethod === value ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                          }`}>
                          <input type="radio" name="payment" value={value}
                            checked={paymentMethod === value}
                            onChange={(e) => { setPaymentMethod(e.target.value); setShowQR(e.target.value === "online"); }}
                            className="accent-emerald-500" />
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* QR */}
                  {showQR && (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scan to Pay</p>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=merchant@upi&pn=PharmaConnect&am=${cart.total}&cu=INR`}
                        alt="Payment QR"
                        className="rounded-xl border border-gray-100 shadow-sm"
                      />
                      <p className="text-lg font-bold text-gray-800">₹{cart.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Scan with any UPI app to pay</p>
                    </div>
                  )}
                </div>

                <div className="px-6 pb-5 flex flex-col gap-3">
                  {orderError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{orderError}</p>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={placeOrder} disabled={placing}
                      className="flex-1 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl transition-colors">
                      {placing ? "Processing..." : "Confirm Order"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CartPage;
