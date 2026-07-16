import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Minus, 
  Plus, 
  ChefHat, 
  CreditCard, 
  Tag, 
  Users,
  MessageSquareOff,
  Trash2,
  FileText
} from 'lucide-react';
import { Order, OrderItem, MenuItem } from '../types';
import { formatVND } from '../utils';

interface CartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  guestCount: number;
  onUpdateGuestCount: (count: number) => void;
  onUpdateQuantity: (orderItemId: string, change: number) => void;
  onUpdateNotes: (orderItemId: string, notes: string) => void;
  onRemoveItem: (orderItemId: string) => void;
  onSendToKitchen: () => void;
  onProceedToPayment: () => void;
}

export default function CartBottomSheet({
  isOpen,
  onClose,
  activeOrder,
  guestCount,
  onUpdateGuestCount,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
  onSendToKitchen,
  onProceedToPayment
}: CartBottomSheetProps) {
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoCode, setPromoCode] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  if (!isOpen || !activeOrder) return null;

  const totalAmount = activeOrder.totalAmount;
  const discountAmount = Math.floor(totalAmount * (discountPercent / 100));
  const finalAmount = totalAmount - discountAmount;

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'GIAM10') {
      setDiscountPercent(10);
      alert('Áp dụng mã GIAM10 thành công! Giảm 10% tổng bill.');
    } else if (promoCode.toUpperCase() === 'VIP20') {
      setDiscountPercent(20);
      alert('Áp dụng mã VIP20 thành công! Giảm 20% tổng bill.');
    } else {
      alert('Mã giảm giá không hợp lệ. Gợi ý: GIAM10, VIP20');
    }
    setPromoCode('');
  };

  const handleStartEditingNotes = (item: OrderItem) => {
    setEditingNotesId(item.id);
    setTempNotes(item.notes || '');
  };

  const handleSaveNotes = (orderItemId: string) => {
    onUpdateNotes(orderItemId, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Dimmed Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
      />

      {/* Slide-up Container */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative bg-slate-900 border-t border-slate-800 rounded-t-[32px] shadow-2xl max-h-[85%] flex flex-col overflow-hidden z-50 w-full"
      >
        {/* Swipe-down visual handle */}
        <div className="w-full flex justify-center py-3 shrink-0">
          <div className="w-12 h-1 bg-slate-700 rounded-full cursor-pointer" onClick={onClose}></div>
        </div>

        {/* Title area */}
        <div className="px-4 pb-3 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              🛒 Chi tiết Gọi món
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Vui lòng kiểm tra kỹ trước khi in bếp / tính tiền.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Guest Count Selector (Thumb-friendly row) */}
        <div className="bg-slate-950/20 px-4 py-2 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Users size={12} /> Số lượng khách ngồi:
          </span>
          <div className="flex items-center bg-slate-800/80 rounded-xl px-1.5 py-0.5 border border-slate-700/50">
            <button
              onClick={() => onUpdateGuestCount(Math.max(1, guestCount - 1))}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              <Minus size={11} />
            </button>
            <span className="px-2.5 text-xs font-black text-slate-100 w-6 text-center">{guestCount}</span>
            <button
              onClick={() => onUpdateGuestCount(guestCount + 1)}
              className="p-1.5 text-slate-300 hover:text-white"
            >
              <Plus size={11} />
            </button>
          </div>
        </div>

        {/* Order Item List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none flex flex-col gap-4">
          {(() => {
            const newItems = activeOrder.items.filter(item => item.isNew);
            const sentItems = activeOrder.items.filter(item => !item.isNew);

            if (activeOrder.items.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-36 text-slate-500">
                  <MessageSquareOff size={24} className="text-slate-600 mb-1" />
                  <p className="text-xs">Chưa có món nào được gọi</p>
                </div>
              );
            }

            const renderItemCard = (item: OrderItem) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex flex-col gap-2 shadow-xs transition-all ${
                  item.isNew 
                    ? 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/30' 
                    : 'bg-slate-850 border-slate-800/80 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-200 block flex items-center flex-wrap gap-1">
                      {item.name}
                      {item.isNew ? (
                        <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-amber-500/20 animate-pulse whitespace-nowrap">
                          ✨ MỚI GỌI
                        </span>
                      ) : (
                        <span className="bg-slate-900 text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-slate-800 whitespace-nowrap">
                          👨‍🍳 Đã gửi bếp
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatVND(item.price)}
                    </span>
                  </div>

                  {/* Quantity controls designed for accurate thumb taps */}
                  <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 px-1 py-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="p-1.5 text-slate-400 hover:text-slate-200"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="px-2.5 text-xs font-black text-slate-200 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="p-1.5 text-slate-400 hover:text-slate-200"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>

                {/* Notes and Delete Action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/30 gap-2">
                  {editingNotesId === item.id ? (
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Ví dụ: Ít đá, không hành..."
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700/50 rounded-lg px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-orange-500/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveNotes(item.id)}
                        className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-lg"
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEditingNotes(item)}
                      className="text-[10px] text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1.5 bg-slate-900/40 px-2.5 py-1 rounded-lg border border-slate-800"
                    >
                      <FileText size={10} />
                      <span className="truncate max-w-[150px]">
                        {item.notes ? `Ghi chú: ${item.notes}` : '+ Thêm ghi chú món'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900"
                    title="Xóa món"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );

            return (
              <>
                {/* SECTION 1: MÓN MỚI GỌI (CHƯA GỬI BẾP) */}
                {newItems.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        ✨ Món mới gọi ({newItems.reduce((acc, item) => acc + item.quantity, 0)})
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Cần gửi bếp</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {newItems.map(renderItemCard)}
                    </div>
                  </div>
                )}

                {/* SECTION 2: MÓN ĐÃ GỬI BẾP (ĐANG CHẾ BIẾN) */}
                {sentItems.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1 pt-1">
                      <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <ChefHat size={11} className="text-emerald-400 shrink-0" />
                        👨‍🍳 Món đã gửi bếp ({sentItems.reduce((acc, item) => acc + item.quantity, 0)})
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">Đang chế biến</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {sentItems.map(renderItemCard)}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Promo Code & Bill Summary Segment */}
        <div className="bg-slate-950 p-4 border-t border-slate-850 shrink-0 flex flex-col gap-2.5">
          {/* Promo code bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Nhập mã giảm giá (GIAM10, VIP20)..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-1.5 pl-8 pr-2 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 uppercase"
              />
              <Tag size={11} className="absolute left-2.5 top-2.5 text-slate-500" />
            </div>
            <button
              onClick={applyPromo}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-xl text-[10px] font-bold border border-slate-700"
            >
              Áp dụng
            </button>
          </div>

          {/* Pricing Details */}
          <div className="flex flex-col gap-1 text-[11px] font-semibold text-slate-400">
            <div className="flex justify-between">
              <span>Cộng tiền món:</span>
              <span className="text-slate-300 font-bold">{formatVND(totalAmount)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Giảm giá ({discountPercent}%):</span>
                <span>-{formatVND(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-white pt-1.5 border-t border-slate-800/50">
              <span className="text-orange-400">TỔNG TẠM TÍNH:</span>
              <span className="text-orange-400 text-sm font-black">{formatVND(finalAmount)}</span>
            </div>
          </div>

          {/* Primary Operations Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-1 pb-2">
            <button
              onClick={onSendToKitchen}
              className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-3 text-xs font-bold active:scale-95 transition-all"
            >
              <ChefHat size={14} className="text-orange-400" />
              <span>Báo chế biến</span>
            </button>

            <button
              onClick={onProceedToPayment}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-3 text-xs font-extrabold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
            >
              <CreditCard size={14} />
              <span>Thanh toán QR</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
