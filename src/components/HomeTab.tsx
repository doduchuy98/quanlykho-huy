import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Coffee, 
  ArrowRight, 
  Activity, 
  AlertTriangle, 
  Grid3X3, 
  History, 
  Layers, 
  Settings as SettingsIcon,
  CheckCircle2,
  Sparkles,
  Utensils
} from 'lucide-react';

import { Table, Zone, Order, Invoice, MenuItem, InventoryItem } from '../types';
import { formatVND } from '../utils';

interface HomeTabProps {
  tables: Table[];
  zones: Zone[];
  orders: Order[];
  invoices: Invoice[];
  menuItems: MenuItem[];
  inventoryItems: InventoryItem[];
  onNavigate: (tab: 'home' | 'tables' | 'history' | 'management' | 'settings') => void;
  onTableTap: (table: Table) => void;
}

export default function HomeTab({
  tables,
  zones,
  orders,
  invoices,
  menuItems,
  inventoryItems,
  onNavigate,
  onTableTap
}: HomeTabProps) {
  const [timeStr, setTimeStr] = useState('');

  // Live time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng ☕';
    if (hour < 18) return 'Buổi chiều tốt lành 🍹';
    return 'Buổi tối đầm ấm ✨';
  };

  // --- STATS CALCULATIONS ---
  const todayRevenue = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
  const totalInvoicesCount = invoices.length;
  
  const occupiedTables = tables.filter(t => t.status !== 'empty');
  const activeTablesCount = occupiedTables.length;
  const tableOccupancyRate = tables.length > 0 ? Math.round((activeTablesCount / tables.length) * 100) : 0;

  const currentGuestsCount = occupiedTables.reduce((sum, t) => sum + (t.guestCount || 0), 0);

  // --- TOP SELLING ITEMS ---
  const itemSalesMap: Record<string, { count: number; name: string; price: number; imageUrl: string }> = {};
  
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (itemSalesMap[item.menuItemId]) {
        itemSalesMap[item.menuItemId].count += item.quantity;
      } else {
        const originalItem = menuItems.find(m => m.id === item.menuItemId);
        itemSalesMap[item.menuItemId] = {
          count: item.quantity,
          name: item.name,
          price: item.price,
          imageUrl: originalItem?.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60'
        };
      }
    });
  });

  const topSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const maxSalesCount = topSellingItems.length > 0 ? Math.max(...topSellingItems.map(i => i.count)) : 1;

  // --- LOW INVENTORY WARNINGS ---
  const lowInventory = inventoryItems.filter(item => item.quantity <= item.minThreshold);

  // Helper to calculate elapsed time for active tables
  const getElapsedTimeStr = (checkInTime?: string) => {
    if (!checkInTime) return '';
    const diffMs = new Date().getTime() - new Date(checkInTime).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} phút`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 h-full">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none pb-24 space-y-4">
        
        {/* Header section with Greeting and Live Clock */}
        <div className="flex justify-between items-start bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> Hệ thống quản lý bán hàng
            </span>
            <h1 className="text-sm font-black text-slate-100 mt-1">
              {getGreeting()}
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Chúc bạn một ngày phục vụ năng lượng & hiệu quả!</p>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-black text-slate-200 block bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl shadow-xs">
              ⏱️ {timeStr || '00:00:00'}
            </span>
            <span className="text-[9px] text-slate-500 font-bold mt-1 block">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Dynamic Business KPIs Dashboard */}
        <div className="grid grid-cols-2 gap-3">
          {/* Revenue Widget */}
          <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">Doanh thu hôm nay</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/15">
                <TrendingUp size={12} />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-sm font-black text-emerald-400 block">
                {formatVND(todayRevenue)}
              </span>
              <span className="text-[9px] text-slate-500 font-bold mt-0.5 block">
                Từ {totalInvoicesCount} hóa đơn đã đóng
              </span>
            </div>
          </div>

          {/* Table Occupancy Widget */}
          <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">Hiệu suất sử dụng bàn</span>
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/15">
                <Activity size={12} />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-sm font-black text-orange-400 block">
                {tableOccupancyRate}%
              </span>
              <span className="text-[9px] text-slate-500 font-bold mt-0.5 block">
                Đang dùng: {activeTablesCount}/{tables.length} bàn ({currentGuestsCount} khách)
              </span>
            </div>
          </div>
        </div>

        {/* High-Ergonomic Quick Shortcuts Menu */}
        <div className="bg-slate-950/30 p-3.5 rounded-2xl border border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
            Lối tắt chức năng nhanh
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onNavigate('tables')}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800/80 rounded-xl transition-all cursor-pointer active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/15 mb-1.5 group-hover:scale-105 transition-all">
                <Grid3X3 size={15} />
              </div>
              <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">Sơ đồ bàn</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800/80 rounded-xl transition-all cursor-pointer active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/15 mb-1.5 group-hover:scale-105 transition-all">
                <History size={15} />
              </div>
              <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">Lịch sử</span>
            </button>

            <button
              onClick={() => onNavigate('management')}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800/80 rounded-xl transition-all cursor-pointer active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/15 mb-1.5 group-hover:scale-105 transition-all">
                <Layers size={15} />
              </div>
              <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">Kho & Menu</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800/80 rounded-xl transition-all cursor-pointer active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/20 flex items-center justify-center text-slate-300 border border-slate-700/30 mb-1.5 group-hover:scale-105 transition-all">
                <SettingsIcon size={15} />
              </div>
              <span className="text-[9px] text-slate-300 font-bold whitespace-nowrap">Thiết lập</span>
            </button>
          </div>
        </div>

        {/* Low Inventory Alert Section (Only visible when items are critical) */}
        {lowInventory.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400" />
              <h3 className="text-[10px] font-black text-red-400 uppercase tracking-wider">
                Cảnh báo hết nguyên liệu kho ({lowInventory.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {lowInventory.map(item => (
                <div key={item.id} className="bg-slate-900/40 p-2.5 rounded-xl border border-red-500/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-200 font-bold block">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-bold">Mức an toàn tối thiểu: {item.minThreshold}{item.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/15">
                      Còn {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Active Tables Overview */}
        <div className="bg-slate-850 rounded-2xl border border-slate-800 p-3.5 space-y-2.5">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils size={11} className="text-orange-400" /> Hoạt động bàn trực tiếp
            </h3>
            <button 
              onClick={() => onNavigate('tables')} 
              className="text-[9px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
            >
              Xem tất cả <ArrowRight size={10} />
            </button>
          </div>

          {occupiedTables.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500/30 mb-1.5" />
              <p className="text-[10px] font-semibold">Tất cả các bàn hiện đang trống!</p>
              <p className="text-[9px] text-slate-600 mt-0.5">Ấn nút "Sơ đồ bàn" để mở bàn mới đón khách.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto scrollbar-none">
              {occupiedTables.map(table => {
                const isBilling = table.status === 'billing';
                return (
                  <div 
                    key={table.id}
                    onClick={() => onTableTap(table)}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between transition-all cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3.5 h-3.5 rounded-full ${
                        isBilling ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                      }`} />
                      <div>
                        <span className="text-[10px] text-slate-200 font-black block">{table.name}</span>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold mt-0.5">
                          <span>👤 {table.guestCount} khách</span>
                          <span>•</span>
                          <span>⏱️ {getElapsedTimeStr(table.checkInTime)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                        isBilling 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {isBilling ? 'Thanh toán' : 'Đang ăn'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Products / Popular Items Section */}
        <div className="bg-slate-850 rounded-2xl border border-slate-800 p-3.5 space-y-2.5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag size={11} className="text-blue-400" /> Đồ uống & Món ăn bán chạy nhất
          </h3>

          {topSellingItems.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <Coffee size={24} className="mx-auto text-blue-500/30 mb-1.5" />
              <p className="text-[10px] font-semibold">Chưa có số liệu thống kê sản phẩm</p>
              <p className="text-[9px] text-slate-600 mt-0.5">Hoàn tất các đơn hàng để cập nhật bảng xếp hạng.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topSellingItems.map((item, idx) => {
                const ratio = Math.round((item.count / maxSalesCount) * 100);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-9 h-9 rounded-lg object-cover border border-slate-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-slate-200 font-bold block truncate pr-2">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-orange-400 font-black whitespace-nowrap">
                          Đã bán: {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full rounded-full" 
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
