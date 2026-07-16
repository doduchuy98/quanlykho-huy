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
}

export default function MobilePOSScreen({
  table,
  zoneName,
  menuItems,
  activeOrder,
  onAddToCart,
  onBack,
  onOpenCart,
  onTableAction
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
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Sparkles size={28} className="stroke-[1.5] text-slate-600 mb-2 animate-pulse" />
            <p className="text-xs">Không tìm thấy món ăn phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const inCartQty = getItemQuantityInCart(item.id);
              const isNewlyCreated = item.isNew || item.id.startsWith('m_');
              
              return (
                <div
                  key={item.id}
                  className="bg-slate-850 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm relative group"
                >
                  {/* Newly Created / Món mới Menu Badge Overlay */}
                  {isNewlyCreated && (
                    <div className="absolute top-2 left-2 z-10 bg-amber-400 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md shadow-amber-400/20 border border-amber-300/30 animate-pulse">
                      <span>✨</span>
                      <span>MÓN MỚI</span>
                    </div>
                  )}

                  {/* Quantity Badge overlay */}
                  <AnimatePresence>
                    {inCartQty > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-orange-400/20 z-10"
                      >
                        {inCartQty}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Product Visual */}
                  <div className="h-28 overflow-hidden relative bg-slate-900 select-none">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-100 tracking-tight leading-snug line-clamp-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1 leading-normal">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-1 border-t border-slate-800/30">
                      <span className="text-xs font-black text-slate-200 tracking-tight">
                        {formatVND(item.price)}
                      </span>

                      {/* Add button designed for thumb reach */}
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onAddToCart(item)}
                        className="w-7 h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-orange-500/10 active:scale-90 transition-all cursor-pointer"
                        title="Thêm món"
                      >
                        <Plus size={16} className="stroke-[2.5]" />
                      </motion.button>
                    </div>
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
