import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  ShoppingCart, 
  Grid, 
  ArrowRightLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Table, MenuItem, Order, OrderItem } from '../types';
import { formatVND } from '../utils';
import { CATEGORIES } from '../data';

interface MobilePOSScreenProps {
  table: Table;
  zoneName: string;
  menuItems: MenuItem[];
  activeOrder: Order | null;
  onAddToCart: (item: MenuItem) => void;
  onBack: () => void;
  onOpenCart: () => void;
  onTableAction: () => void; // Trigger Change / Merge table
  onUpdateQuantity?: (orderItemId: string, change: number) => void;
  onRemoveItem?: (orderItemId: string) => void;
}

export default function MobilePOSScreen({
  table,
  zoneName,
  menuItems,
  activeOrder,
  onAddToCart,
  onBack,
  onOpenCart,
  onTableAction,
  onUpdateQuantity,
  onRemoveItem
}: MobilePOSScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items by category and search query
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  // Calculate current cart quantities
  const getCartCount = () => {
    if (!activeOrder) return 0;
    return activeOrder.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartTotal = () => {
    if (!activeOrder) return 0;
    return activeOrder.totalAmount;
  };

  // Helper to find quantity of a specific item already in cart
  const getItemQuantityInCart = (itemId: string): number => {
    if (!activeOrder) return 0;
    const found = activeOrder.items.find(i => i.menuItemId === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 h-full relative">
      {/* Header bar */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 shrink-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1">
                Order — <span className="text-orange-400">{table.name}</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">{zoneName}</p>
            </div>
          </div>

          <button
            onClick={onTableAction}
            className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold bg-slate-900 border border-slate-800 text-orange-400 hover:bg-slate-850 active:scale-95 transition-all"
          >
            <ArrowRightLeft size={10} />
            <span>Đổi/Ghép bàn</span>
          </button>
        </div>

        {/* Search bar optimized for one hand (accessible directly) */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Tìm kiếm món ăn nhanh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
        </div>
      </div>

      {/* Horizontal Category Slider */}
      <div className="bg-slate-950/40 py-2 border-b border-slate-850 shrink-0">
        <div className="overflow-x-auto scrollbar-none px-4 flex gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Menu Item List (2 Columns) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none pb-28">
        
        {/* Ordered items list directly on the screen */}
        {activeOrder && activeOrder.items.length > 0 && (
          <div className="mb-6 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <h3 className="text-[10px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋 Món đã order ({activeOrder.items.reduce((s, i) => s + i.quantity, 0)})</span>
              </h3>
              <span className="text-[9px] font-bold text-slate-500 italic">Xem danh sách đầy đủ bên dưới</span>
            </div>
            
            <div className="space-y-2.5">
              {activeOrder.items.map((item) => {
                const subTotal = item.price * item.quantity;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-1 bg-slate-900/40 p-2 rounded-xl border border-slate-850">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-extrabold text-slate-200 truncate">{item.name}</span>
                        {item.isNew ? (
                          <span className="bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                            Mới thêm
                          </span>
                        ) : (
                          <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                            Đã gửi bếp
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-[9px] text-amber-500/70 font-medium italic mt-0.5">💬 {item.notes}</p>
                      )}
                      <p className="text-[9px] text-slate-500 font-bold mt-1">Đơn giá: {formatVND(item.price)}</p>
                    </div>

                    {/* Quantity controls & Subtotal */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Qty edit section */}
                      {onUpdateQuantity && onRemoveItem && (
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                if (confirm(`Bạn có chắc muốn xóa món "${item.name}" khỏi hóa đơn?`)) {
                                  onRemoveItem(item.id);
                                }
                              } else {
                                onUpdateQuantity(item.id, -1);
                              }
                            }}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded-md hover:bg-slate-900 font-black text-xs"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-black text-slate-200 px-1.5 min-w-[14px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white rounded-md hover:bg-slate-900 font-black text-xs"
                          >
                            +
                          </button>
                        </div>
                      )}
                      
                      {/* Subtotal price tag */}
                      <div className="text-right min-w-[65px]">
                        <span className="text-[11px] font-black text-slate-200 block">{formatVND(subTotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-3 border-b border-slate-850 pb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thực đơn chọn món</span>
          {searchQuery && <span className="text-[9px] text-slate-500">Kết quả tìm kiếm cho "{searchQuery}"</span>}
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Sparkles size={28} className="stroke-[1.5] text-slate-600 mb-2 animate-pulse" />
            <p className="text-xs">Không tìm thấy món ăn phù hợp</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const inCartQty = getItemQuantityInCart(item.id);
              const isNewlyCreated = item.isNew || item.id.startsWith('m_');
              const cartItem = activeOrder?.items.find(i => i.menuItemId === item.id);
              
              return (
                <div
                  key={item.id}
                  className="bg-slate-850/80 border border-slate-800/60 p-2.5 rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-200"
                >
                  {/* Left part: Image with badge overlays */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative bg-slate-900 select-none shrink-0 border border-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Món mới badge */}
                    {isNewlyCreated && (
                      <div className="absolute top-0.5 left-0.5 z-10 bg-amber-400 text-slate-950 text-[7px] font-black px-1 py-0.2 rounded shadow-sm border border-amber-350">
                        NEW
                      </div>
                    )}
                    
                    {/* Quantity overlay inside the image */}
                    <AnimatePresence>
                      {inCartQty > 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute bottom-1 right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg border border-orange-400/20"
                        >
                          {inCartQty}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Middle part: Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-xs text-slate-200 tracking-tight leading-snug truncate">
                      {item.name}
                    </h3>
                    {item.description ? (
                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1 leading-normal">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-[9px] text-slate-600 mt-0.5 italic">Chưa có mô tả món</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-black text-orange-400">
                        {formatVND(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Right part: Add button / Interactive quantity controls */}
                  <div className="shrink-0 flex items-center justify-end">
                    {inCartQty > 0 && cartItem && onUpdateQuantity && onRemoveItem ? (
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (cartItem.quantity === 1) {
                              if (confirm(`Bạn có chắc muốn xóa món "${item.name}" khỏi hóa đơn?`)) {
                                onRemoveItem(cartItem.id);
                              }
                            } else {
                              onUpdateQuantity(cartItem.id, -1);
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 font-black text-xs active:scale-90"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-black text-slate-200 px-2 min-w-[16px] text-center">
                          {inCartQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(cartItem.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 font-black text-xs active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => onAddToCart(item)}
                        className="h-7 px-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-1 shadow-md shadow-orange-500/10 active:scale-90 transition-all cursor-pointer font-black text-[10px]"
                        title="Thêm món"
                      >
                        <Plus size={12} className="stroke-[2.5]" />
                        <span>Thêm</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      <AnimatePresence>
        {getCartCount() > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="absolute bottom-6 left-4 right-4 z-20"
          >
            <button
              onClick={onOpenCart}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl py-3.5 px-4 flex items-center justify-between shadow-xl shadow-orange-500/20 border border-orange-400/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center relative">
                  <ShoppingCart size={16} />
                  <span className="absolute -top-1 -right-1 bg-white text-orange-600 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
                    {getCartCount()}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-white/70 font-medium">Đã gọi {getCartCount()} món</div>
                  <div className="text-xs font-black">{formatVND(getCartTotal())}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 font-bold text-xs bg-white/15 px-3 py-1.5 rounded-xl">
                <span>Xem chi tiết</span>
                <ChevronRight size={14} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
