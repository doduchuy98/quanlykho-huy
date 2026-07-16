import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Flame, 
  CheckSquare, 
  RotateCcw,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';
import { Order, Table, Zone } from '../types';
import { calculateTimeElapsed } from '../utils';

interface KitchenKdsViewProps {
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  tables: Table[];
  zones: Zone[];
  showToast: (msg: string) => void;
}

export default function KitchenKdsView({
  orders,
  onUpdateOrders,
  tables,
  zones,
  showToast
}: KitchenKdsViewProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
  // Local state to check/uncheck individual menu items on kitchen cards for progress tracking
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('fb_kds_checked_items');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist item checklists
  useEffect(() => {
    localStorage.setItem('fb_kds_checked_items', JSON.stringify(checkedItems));
  }, [checkedItems]);

  // Dynamic ticking clock for KDS view
  const [timeTicker, setTimeTicker] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(new Date());
    }, 30000); // refresh time relative indicators every 30s
    return () => clearInterval(timer);
  }, []);

  const getTableInfo = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return { tableName: 'Bàn vãng lai', zoneName: 'Không rõ khu' };
    const zone = zones.find(z => z.id === table.zoneId);
    return {
      tableName: table.name,
      zoneName: zone ? zone.name : 'Không xác định'
    };
  };

  const handleCompleteOrder = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, isPrepared: true };
      }
      return o;
    });
    onUpdateOrders(updated);
    showToast(`👨‍🍳 Đã chế biến xong đơn hàng #${orderId.replace('ord_', '')}!`);
  };

  const handleRevertOrder = (orderId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, isPrepared: false };
      }
      return o;
    });
    onUpdateOrders(updated);
    showToast(`↩️ Đã khôi phục đơn #${orderId.replace('ord_', '')} về danh sách chờ chế biến.`);
  };

  const toggleItemCheck = (orderItemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [orderItemId]: !prev[orderItemId]
    }));
  };

  // Filter orders
  // Pending: Status is active, and isPrepared is not true
  // Completed: Status is active, and isPrepared is true
  const displayedOrders = orders.filter(o => {
    if (o.status !== 'active') return false;
    if (filter === 'pending') {
      return !o.isPrepared;
    } else {
      return !!o.isPrepared;
    }
  });

  // Calculate elapsed minutes for urgency highlighting
  const getElapsedMins = (startTimeStr: string): number => {
    try {
      const diffMs = new Date().getTime() - new Date(startTimeStr).getTime();
      return Math.max(0, Math.floor(diffMs / 60000));
    } catch {
      return 0;
    }
  };

  const renderKdsContent = () => {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* KDS Control Toolbar */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex flex-wrap gap-4 items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <ChefHat size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100 flex items-center gap-2">
                MÀN HÌNH CHẾ BIẾN BẾP & BAR
                {filter === 'pending' && displayedOrders.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {displayedOrders.length} ĐƠN CHỜ
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Kênh điều phối đồ uống, món ăn thời gian thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle Buttons */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center shrink-0">
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  filter === 'pending'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame size={13} className={filter === 'pending' ? 'animate-bounce' : ''} />
                <span>Đang chế biến</span>
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                  filter === 'completed'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Đã làm xong</span>
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-300 hover:text-white border border-slate-700/60 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title={isFullScreen ? "Thu nhỏ" : "Phóng to toàn màn hình"}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 size={14} />
                  <span className="hidden sm:inline">Thu nhỏ</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span className="hidden sm:inline">Toàn màn hình</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Orders Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {displayedOrders.length === 0 ? (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
                {filter === 'pending' ? <ChefHat size={32} /> : <ClipboardList size={32} />}
              </div>
              <h3 className="text-sm font-black text-slate-300">
                {filter === 'pending'
                  ? 'Tuyệt vời! Không còn đơn hàng nào đang chờ chế biến'
                  : 'Chưa có đơn hàng nào được hoàn thành trong ca làm việc'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5">
                {filter === 'pending'
                  ? 'Đơn đặt món từ các bàn sẽ tự động hiển thị tại đây với cảnh báo thời gian thực.'
                  : 'Khi chế biến xong và nhấn "Hoàn thành", đơn hàng sẽ được lưu lịch sử tại đây.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedOrders.map(order => {
                const { tableName, zoneName } = getTableInfo(order.tableId);
                const elapsedMins = getElapsedMins(order.startTime);
                const isDelayed = filter === 'pending' && elapsedMins >= 15;

                return (
                  <div
                    key={order.id}
                    className={`bg-slate-900 border ${
                      isDelayed 
                        ? 'border-red-500/50 ring-1 ring-red-500/20' 
                        : 'border-slate-800'
                    } rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl hover:border-slate-700 transition-all duration-200 h-full min-h-[300px]`}
                  >
                    {/* Card Header */}
                    <div className="bg-slate-950 p-3.5 border-b border-slate-850 flex items-center justify-between gap-2 shrink-0">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                          {tableName}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                          {zoneName} • {order.id.replace('ord_', '#')}
                        </p>
                      </div>

                      {/* Urgency indicator */}
                      <div
                        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] font-black tracking-wider ${
                          isDelayed
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        <Clock size={12} />
                        <span>{calculateTimeElapsed(order.startTime) || 'Mới gọi'}</span>
                      </div>
                    </div>

                    {/* Delay Warning Alert */}
                    {isDelayed && (
                      <div className="bg-red-950/25 border-b border-red-900/30 px-3 py-1.5 flex items-center gap-1.5 text-[10px] text-red-400 font-bold shrink-0">
                        <AlertTriangle size={12} className="shrink-0" />
                        <span>CẢNH BÁO: Đơn hàng trễ quá 15 phút!</span>
                      </div>
                    )}

                    {/* Items List - Large Touch Targets */}
                    <div className="flex-1 p-3.5 space-y-2 overflow-y-auto no-scrollbar">
                      {order.items.map((item) => {
                        const isChecked = !!checkedItems[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemCheck(item.id)}
                            className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-start gap-2.5 ${
                              isChecked
                                ? 'bg-slate-950/40 border-slate-850/40 opacity-40'
                                : 'bg-slate-950 border-slate-850 hover:bg-slate-850'
                            }`}
                          >
                            {/* Checkbox indicator */}
                            <div className="mt-0.5 shrink-0">
                              <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all ${
                                isChecked 
                                  ? 'bg-emerald-500 border-emerald-400 text-white' 
                                  : 'border-slate-700 bg-slate-900'
                              }`}>
                                {isChecked && <CheckSquare size={12} className="stroke-[3.5]" />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                                  isChecked ? 'bg-slate-800 text-slate-500' : 'bg-orange-500/15 text-orange-400'
                                }`}>
                                  x{item.quantity}
                                </span>
                                <p className={`text-xs font-black truncate leading-tight flex items-center gap-1.5 ${
                                  isChecked ? 'line-through text-slate-500' : 'text-slate-100'
                                }`}>
                                  <span>{item.name}</span>
                                  {item.isNew && (
                                    <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded-lg animate-pulse whitespace-nowrap shrink-0">
                                      ✨ MỚI
                                    </span>
                                  )}
                                </p>
                              </div>

                              {/* Custom requirement/Notes */}
                              {item.notes && (
                                <div className="mt-1 bg-amber-500/10 border border-amber-500/20 text-[10px] font-extrabold text-amber-500 px-2 py-1 rounded-lg flex items-start gap-1 leading-normal">
                                  <span className="shrink-0">💬</span>
                                  <span className="break-words uppercase">{item.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Complete cooking */}
                    <div className="p-3.5 bg-slate-950/30 border-t border-slate-850 shrink-0">
                      {filter === 'pending' ? (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold text-[11px] py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase shadow-md shadow-orange-500/10"
                        >
                          <CheckCircle2 size={14} className="stroke-[2.5]" />
                          <span>HOÀN THÀNH CHẾ BIẾN</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevertOrder(order.id)}
                          className="w-full bg-slate-800 hover:bg-slate-750 active:scale-[0.98] text-slate-300 font-extrabold text-[11px] py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase border border-slate-750"
                        >
                          <RotateCcw size={14} />
                          <span>↩️ Quay lại chờ chế biến</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Full screen immersive overlay
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col text-slate-100 animate-in fade-in duration-200">
        {/* Fullscreen top HUD */}
        <div className="bg-slate-900 border-b border-slate-850 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-black text-red-500 tracking-wider">HỆ THỐNG KDS BẾP / BAR TRỰC TUYẾN</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 font-mono">
              {timeTicker.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={() => setIsFullScreen(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
            >
              <Minimize2 size={11} />
              <span>Thoát KDS</span>
            </button>
          </div>
        </div>

        {renderKdsContent()}
      </div>
    );
  }

  return renderKdsContent();
}
