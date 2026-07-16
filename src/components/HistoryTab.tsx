import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Receipt, 
  Calendar, 
  CreditCard, 
  Coins, 
  Trash2, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Inbox
} from 'lucide-react';
import { Invoice } from '../types';
import { formatVND } from '../utils';

interface HistoryTabProps {
  invoices: Invoice[];
  onClearHistory: () => void;
}

export default function HistoryTab({ invoices, onClearHistory }: HistoryTabProps) {
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'vietqr'>('all');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Filtered list
  const filteredInvoices = filterMethod === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.paymentMethod === filterMethod);

  // Sorting: Newest first
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    return new Date(b.paymentTime).getTime() - new Date(a.paymentTime).getTime();
  });

  // Calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
  const totalInvoicesCount = invoices.length;
  const averageBill = totalInvoicesCount > 0 ? Math.floor(totalRevenue / totalInvoicesCount) : 0;

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  const handleClear = () => {
    if (confirm('Cảnh báo: Bạn có chắc chắn muốn xóa toàn bộ lịch sử hóa đơn và doanh thu hiện tại không? Hành động này không thể hoàn tác.')) {
      onClearHistory();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 h-full">
      {/* Dynamic Summary Cards */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 shrink-0 grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 font-bold flex items-center justify-center gap-1">
            <TrendingUp size={10} className="text-emerald-400" /> Doanh thu
          </span>
          <span className="text-xs font-black text-emerald-400 mt-1 block truncate">
            {formatVND(totalRevenue)}
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 font-bold flex items-center justify-center gap-1">
            <Receipt size={10} className="text-orange-400" /> Hóa đơn
          </span>
          <span className="text-xs font-black text-slate-200 mt-1 block">
            {totalInvoicesCount} đơn
          </span>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-center flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 font-bold flex items-center justify-center gap-1">
            <DollarSign size={10} className="text-blue-400" /> Trung bình
          </span>
          <span className="text-xs font-black text-blue-400 mt-1 block truncate">
            {formatVND(averageBill)}
          </span>
        </div>
      </div>

      {/* Filters and Actions toolbar */}
      <div className="px-4 py-2 border-b border-slate-850 bg-slate-950/40 shrink-0 flex justify-between items-center">
        <div className="flex gap-1.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterMethod('all')}
            className={`px-2 py-1 rounded-md text-[9px] font-bold ${
              filterMethod === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterMethod('vietqr')}
            className={`px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 ${
              filterMethod === 'vietqr' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CreditCard size={9} />
            <span>VietQR</span>
          </button>
          <button
            onClick={() => setFilterMethod('cash')}
            className={`px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 ${
              filterMethod === 'cash' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Coins size={9} />
            <span>Tiền mặt</span>
          </button>
        </div>

        {invoices.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[9px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg transition-colors"
          >
            <Trash2 size={10} />
            <span>Xóa lịch sử</span>
          </button>
        )}
      </div>

      {/* Invoice List View */}
      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none pb-24">
        {sortedInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
            <Inbox size={28} className="text-slate-700 animate-pulse" />
            <p className="text-xs">Chưa có hóa đơn nào được lưu</p>
            <p className="text-[10px] text-slate-600 max-w-[200px] text-center">Các hóa đơn sau khi hoàn thành thanh toán chuẩn ở sơ đồ bàn sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sortedInvoices.map((inv) => {
              const isExpanded = expandedInvoiceId === inv.id;
              const formattedTime = new Date(inv.paymentTime).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={inv.id}
                  className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-xs transition-all"
                >
                  {/* Summary Card Header */}
                  <div
                    onClick={() => toggleExpand(inv.id)}
                    className="p-3 flex items-center justify-between cursor-pointer select-none active:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        inv.paymentMethod === 'vietqr' 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                      }`}>
                        {inv.paymentMethod === 'vietqr' ? <CreditCard size={14} /> : <Coins size={14} />}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-200">
                          {inv.tableName} <span className="text-[10px] text-slate-400 font-medium">({inv.zoneName})</span>
                        </h4>
                        <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-0.5">
                          <span>⏱️ {formattedTime}</span>
                          <span>•</span>
                          <span className="font-mono">{inv.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs font-black text-orange-400 block">
                          {formatVND(inv.finalAmount)}
                        </span>
                        {inv.discount > 0 && (
                          <span className="text-[9px] text-emerald-400 font-bold block">
                            -{formatVND(inv.discount)}
                          </span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expandable item details list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden bg-slate-950/40 border-t border-slate-800/50"
                      >
                        <div className="p-3 flex flex-col gap-2 text-[10px]">
                          <div className="font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-1 mb-1">
                            Chi tiết món đã gọi:
                          </div>
                          {inv.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start py-0.5">
                              <div className="flex-1 pr-4">
                                <span className="text-slate-200 font-semibold">{item.name}</span>
                                {item.notes && (
                                  <span className="text-orange-400 italic block text-[9px]">Ghi chú: {item.notes}</span>
                                )}
                              </div>
                              <span className="text-slate-400 font-bold whitespace-nowrap">x{item.quantity}</span>
                              <span className="text-slate-300 font-bold pl-4 text-right min-w-[70px] whitespace-nowrap">
                                {formatVND(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}

                          <div className="border-t border-slate-800/80 pt-2 mt-1 flex flex-col gap-1 text-[10px]">
                            <div className="flex justify-between text-slate-400">
                              <span>Tổng cộng ban đầu:</span>
                              <span>{formatVND(inv.totalAmount)}</span>
                            </div>
                            {inv.discount > 0 && (
                              <div className="flex justify-between text-emerald-400 font-bold">
                                <span>Giảm giá trừ thẳng:</span>
                                <span>-{formatVND(inv.discount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-200 font-black border-t border-slate-800/30 pt-1.5 mt-0.5">
                              <span>Thực thu ({inv.paymentMethod === 'vietqr' ? 'VietQR Transfer' : 'Tiền mặt'}):</span>
                              <span className="text-orange-400">{formatVND(inv.finalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
