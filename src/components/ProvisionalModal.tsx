import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Receipt, Sparkles } from 'lucide-react';
import { Order, Table } from '../types';
import { formatVND } from '../utils';

interface ProvisionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  table: Table | null;
  zoneName: string;
}

export default function ProvisionalModal({
  isOpen,
  onClose,
  activeOrder,
  table,
  zoneName
}: ProvisionalModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !activeOrder || !table) return null;

  const totalAmount = activeOrder.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const now = new Date();
  const formattedDateTime = now.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    // Elegant mock print notification
    alert('🖨️ Đang kết nối tới máy in nhiệt K80...\nĐã gửi lệnh in phiếu TẠM TÍNH của ' + table.name + ' thành công!');
  };

  return (
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
            <Receipt size={14} className="text-orange-400" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Phiếu Tạm Tính</span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-none space-y-4">
          
          {/* Paper Thermal Receipt Simulator */}
          <div 
            ref={receiptRef}
            className="bg-white text-slate-950 p-5 rounded-2xl shadow-inner font-mono text-xs relative overflow-hidden border border-slate-200 select-none"
            style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff 95%, #f8f9fa 100%)' }}
          >
            {/* Top jagged paper aesthetic lines */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 to-transparent"></div>

            {/* Receipt Header */}
            <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
              <h2 className="text-sm font-black tracking-wide uppercase">☕ BÌNH DƯƠNG COFFEE & POS</h2>
              <p className="text-[10px] text-slate-600">Đ/C: 123 Đường 30 Tháng 4, Thủ Dầu Một</p>
              <p className="text-[10px] text-slate-600">SĐT: 0987.654.321</p>
              <div className="pt-2 text-[11px] font-bold text-slate-800">
                PHIẾU TẠM TÍNH
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="py-3 space-y-1 text-[10px] text-slate-700 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Bàn: <strong>{table.name}</strong></span>
                <span>Khu vực: <strong>{zoneName}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>Giờ vào: {table.checkInTime ? new Date(table.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : formattedDateTime}</span>
                <span>In lúc: {formattedDateTime}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Mã đơn: {activeOrder.id}</span>
                <span>Khách: {table.guestCount || 2} người</span>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="py-4 space-y-2 border-b border-dashed border-slate-300">
              <div className="grid grid-cols-12 font-bold text-slate-800 text-[10px] border-b border-slate-200 pb-1">
                <span className="col-span-6">TÊN MÓN</span>
                <span className="col-span-2 text-center">SL</span>
                <span className="col-span-4 text-right">T.TIỀN</span>
              </div>
              
              <div className="space-y-2">
                {activeOrder.items.map((item) => {
                  const subTotal = item.price * item.quantity;
                  return (
                    <div key={item.id} className="grid grid-cols-12 items-start text-[10.5px] text-slate-800">
                      <div className="col-span-6 pr-1">
                        <span className="font-bold block text-slate-900 leading-tight">{item.name}</span>
                        {item.notes && (
                          <span className="text-[9px] text-amber-700 font-medium block leading-none mt-0.5">💬 {item.notes}</span>
                        )}
                      </div>
                      <span className="col-span-2 text-center font-bold text-slate-900">{item.quantity}</span>
                      <span className="col-span-4 text-right font-black text-slate-950">{formatVND(subTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Billing Summary block */}
            <div className="pt-3 space-y-1.5 text-[11px] text-slate-800 font-bold">
              <div className="flex justify-between">
                <span>Cộng tiền món:</span>
                <span>{formatVND(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-[12px] font-black text-slate-950 pt-2 border-t border-slate-200">
                <span className="uppercase text-orange-600">Tổng tạm tính:</span>
                <span className="text-orange-600 text-sm font-black">{formatVND(totalAmount)}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-5 pb-1 mt-4 border-t border-dashed border-slate-300 text-[9px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Cảm ơn quý khách - Hẹn gặp lại!</p>
              <p className="italic">Powered by Bình Dương F&B POS</p>
              <p className="text-[8px] text-slate-400">Đây là phiếu tạm tính, vui lòng thanh toán tại quầy</p>
            </div>
            
            {/* Soft decorative bottom receipt edge teeth */}
            <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-between">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-2.5 h-1 bg-slate-900" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-850 shrink-0 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            Đóng
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 transition-all active:scale-95 cursor-pointer"
          >
            <Printer size={13} />
            <span>In hóa đơn</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
