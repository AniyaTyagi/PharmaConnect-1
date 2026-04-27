import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Printer } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import axiosInstance from "../utils/axiosInstance";
import { downloadInvoicePDF } from "../services/invoicePDF";

const InvoicesPage = () => {
  const navigate  = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axiosInstance.get("/orders/my").then((r) => setInvoices(r.data)).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu="invoices" />
      <div className="ml-44 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 space-y-5">

          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Invoices</h1>
            <p className="text-xs text-gray-400 mt-0.5">{invoices.length} invoices generated</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Invoice ID", "Date", "Items", "Total", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <FileText size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-400">No invoices yet</p>
                        <p className="text-xs text-gray-300">Invoices are generated automatically after placing orders</p>
                        <button onClick={() => navigate("/products")}
                          className="mt-2 px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                          Browse Products
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : invoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-700">INV-{String(inv._id).slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{inv.items.length}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-800">₹{inv.total.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Issued</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelected(inv)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">View</button>
                        <button onClick={() => downloadInvoicePDF(inv)}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1">
                          <Download size={12} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <p className="text-xs text-gray-400 mt-0.5 font-mono">INV-{String(selected._id).slice(-8).toUpperCase()}</p>
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
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Product", "Qty", "Unit Price", "Amount"].map((h) => (
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
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Amount</p>
                  <p className="text-lg font-bold text-gray-800">₹{selected.total?.toLocaleString()}</p>
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
                    className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
