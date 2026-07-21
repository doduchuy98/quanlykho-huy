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
  Inbox,
  Eye,
  Printer,
  X,
  FileText
} from 'lucide-react';
import { Invoice, StoreInfo } from '../types';
import { formatVND } from '../utils';

interface HistoryTabProps {
  invoices: Invoice[];
  onClearHistory: () => void;
  storeInfo?: StoreInfo;
}

export default function HistoryTab({ invoices, onClearHistory, storeInfo }: HistoryTabProps) {
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'vietqr'>('all');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);

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
                          <span>{formattedTime}</span>
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

                          {/* Dual Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 border-t border-slate-800/60 pt-2.5 mt-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceForModal(inv);
                              }}
                              className="flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                            >
                              <Eye size={12} className="text-orange-400" />
                              <span>Xem hóa đơn</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`🖨️ ĐANG KẾT NỐI TỚI MÁY IN NHIỆT K80...\nĐã xuất hóa đơn thành công!\nBàn: ${inv.tableName}\nMã HD: ${inv.id}\nSố tiền: ${formatVND(inv.finalAmount)}`);
                              }}
                              className="flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-orange-500/10"
                            >
                              <Printer size={12} />
                              <span>Xuất hóa đơn</span>
                            </button>
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

      {/* Historical Invoice Modal Simulator */}
      <AnimatePresence>
        {selectedInvoiceForModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-850 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-orange-400" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Xem Chi Tiết Hóa Đơn</span>
                </div>
                <button 
                  onClick={() => setSelectedInvoiceForModal(null)}
                  className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable Receipt Area */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-none space-y-4">
                {/* Paper Thermal Receipt Simulator */}
                <div 
                  className="bg-white text-slate-950 p-5 rounded-2xl shadow-inner font-mono text-xs relative overflow-hidden border border-slate-200 select-none"
                  style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff 95%, #f8f9fa 100%)' }}
                >
                  {/* Top jagged paper aesthetic lines */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 to-transparent"></div>

                  {/* Stamp watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-dashed border-emerald-500 text-emerald-500 rounded-2xl px-4 py-2 font-black text-lg uppercase tracking-widest opacity-20 pointer-events-none select-none select-all">
                    ĐÃ THANH TOÁN
                  </div>

                  {/* Receipt Header */}
                  <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
                    <h2 className="text-sm font-black tracking-wide uppercase">☕ {storeInfo?.name || 'BÌNH DƯƠNG COFFEE & POS'}</h2>
                    <p className="text-[10px] text-slate-600">Đ/C: {storeInfo?.address || '123 Đường 30 Tháng 4, Thủ Dầu Một'}</p>
                    <p className="text-[10px] text-slate-600">SĐT: {storeInfo?.phone || '0987.654.321'}</p>
                    <div className="pt-2 text-[11px] font-bold text-slate-800">
                      HÓA ĐƠN THANH TOÁN
                    </div>
                  </div>

                  {/* Receipt Metadata */}
                  <div className="py-3 space-y-1 text-[10px] text-slate-700 border-b border-dashed border-slate-300">
                    <div className="flex justify-between">
                      <span>Bàn: <strong>{selectedInvoiceForModal.tableName}</strong></span>
                      <span>Khu vực: <strong>{selectedInvoiceForModal.zoneName}</strong></span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thanh toán lúc: {new Date(selectedInvoiceForModal.paymentTime).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Mã hóa đơn: {selectedInvoiceForModal.id}</span>
                      <span>Hình thức: <strong className="text-slate-800 uppercase">{selectedInvoiceForModal.paymentMethod === 'vietqr' ? 'Chuyển khoản' : 'Tiền mặt'}</strong></span>
                    </div>
                  </div>

                  {/* Ordered Items List */}
                  <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
                    <div className="grid grid-cols-12 gap-1 font-bold text-[10px] text-slate-800 pb-1">
                      <span className="col-span-6">Tên món</span>
                      <span className="col-span-2 text-center">SL</span>
                      <span className="col-span-4 text-right">T.Tiền</span>
                    </div>

                    {selectedInvoiceForModal.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-1 text-[10px] text-slate-700">
                        <div className="col-span-6 flex flex-col">
                          <span className="font-semibold">{item.name}</span>
                          {item.notes && <span className="text-[8px] text-slate-500 italic">({item.notes})</span>}
                        </div>
                        <span className="col-span-2 text-center">x{item.quantity}</span>
                        <span className="col-span-4 text-right font-semibold">{formatVND(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cost totals */}
                  <div className="py-3 space-y-1.5 text-xs text-slate-800 font-bold">
                    <div className="flex justify-between text-[10px] font-medium text-slate-600">
                      <span>Tổng tiền hàng:</span>
                      <span>{formatVND(selectedInvoiceForModal.totalAmount)}</span>
                    </div>
                    {selectedInvoiceForModal.discount > 0 && (
                      <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                        <span>Chiết khấu/Giảm giá:</span>
                        <span>-{formatVND(selectedInvoiceForModal.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black pt-2 border-t border-dashed border-slate-300 text-slate-950">
                      <span>THỰC THU:</span>
                      <span>{formatVND(selectedInvoiceForModal.finalAmount)}</span>
                    </div>
                  </div>

                  {/* Footer message */}
                  <div className="text-center pt-4 space-y-1 text-[9px] text-slate-500 border-t border-dashed border-slate-200">
                    <p className="font-bold">CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!</p>
                    <p className="italic">Powered by Bình Dương POS System</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-950 border-t border-slate-850 grid grid-cols-2 gap-3 shrink-0">
                <button
                  onClick={() => {
                    alert(`🖨️ ĐANG KẾT NỐI TỚI MÁY IN NHIỆT K80...\nĐã xuất hóa đơn thành công!\nBàn: ${selectedInvoiceForModal.tableName}\nMã HD: ${selectedInvoiceForModal.id}`);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 rounded-xl py-3 text-xs font-black shadow-lg shadow-orange-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Xuất hóa đơn</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForModal(null)}
                  className="flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-3 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
