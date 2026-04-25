import React, { useState, useEffect } from "react";
import { Printer, Download } from "lucide-react";
import { downloadInvoicePDF } from "../../services/invoicePDF";
import SellerSidebar from "../components/SellerSidebar";
import SellerHeader from "../components/SellerHeader";
import axiosInstance from "../../utils/axiosInstance";

const SellerInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    console.log("Fetching seller invoices...");
    axiosInstance.get("/api/invoices/seller")
      .then((r) => {
        console.log("Invoices received:", r.data);
        setInvoices(r.data);
      })
      .catch((err) => {
        console.error("Invoice fetch error:", err.response || err);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar active="invoices" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <SellerHeader />
        <main className="flex-1 p-6 space-y-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Invoices</h1>
            <p className="text-xs text-gray-400 mt-0.5">{invoices.length} invoices generated</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Invoice ID","Order ID","Buyer","Date","Total","Action"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <p className="text-sm font-medium text-gray-400">No invoices yet</p>
                      <p className="text-xs text-gray-300 mt-1">Invoices are auto-generated when orders are placed</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-700">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{String(inv.order).slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-800">{inv.buyer?.name || "—"}</p>
                        <p className="text-[11px] text-gray-400">{inv.buyer?.email || ""}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-bold text-gray-800">₹{inv.total?.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">Tax: ₹{inv.tax?.toLocaleString()}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setSelected(inv)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Invoice detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800 tracking-tight">Invoice Details</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{selected.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">From</p>
                  <p className="text-sm font-semibold text-gray-800">PharmaConnect</p>
                  <p className="text-xs text-gray-400">B2B Platform</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Buyer</p>
                  <p className="text-sm font-semibold text-gray-800">{selected.buyer?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{selected.buyer?.email || ""}</p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Product","Qty","Unit Price","Amount"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.items?.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2.5 text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="py-2.5 text-sm text-gray-500">{item.quantity}</td>
                      <td className="py-2.5 text-sm text-gray-500">₹{item.price?.toLocaleString()}</td>
                      <td className="py-2.5 text-sm font-semibold text-gray-700">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Subtotal</p>
                  <p className="text-sm font-semibold text-gray-700">₹{selected.subtotal?.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Tax (18% GST): ₹{selected.tax?.toLocaleString()}</p>
                  <p className="text-base font-bold text-gray-800 mt-2">Total: ₹{selected.total?.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                    <Printer size={13} /> Print
                  </button>
                  <button onClick={() => downloadInvoicePDF(selected)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download size={13} /> Download PDF
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerInvoicesPage;
