import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Clock, 
  Plus, 
  MoreVertical, 
  ArrowRightLeft, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  Utensils
} from 'lucide-react';
import { Table, Zone, Order, TableStatus } from '../types';
import { formatVND, calculateTimeElapsed } from '../utils';

interface TablesScreenProps {
  tables: Table[];
  zones: Zone[];
  orders: Order[];
  selectedZoneId: string;
  setSelectedZoneId: (id: string) => void;
  onTableTap: (table: Table) => void;
  onTableLongPress: (table: Table) => void;
  onAddTableClick: () => void;
}

export default function TablesScreen({
  tables,
  zones,
  orders,
  selectedZoneId,
  setSelectedZoneId,
  onTableTap,
  onTableLongPress,
  onAddTableClick
}: TablesScreenProps) {
  const [elapsedTimers, setElapsedTimers] = useState<Record<string, string>>({});

  // Live elapsed time tick updating every 30 seconds
  useEffect(() => {
    const updateAllTimers = () => {
      const timers: Record<string, string> = {};
      tables.forEach(t => {
        if (t.checkInTime) {
          timers[t.id] = calculateTimeElapsed(t.checkInTime);
        }
      });
      setElapsedTimers(timers);
    };

    updateAllTimers();
    const interval = setInterval(updateAllTimers, 30000);
    return () => clearInterval(interval);
  }, [tables]);

  // Filter tables by Zone
  const filteredTables = selectedZoneId === 'all' 
    ? tables 
    : tables.filter(t => t.zoneId === selectedZoneId);

  // Stats calculation
  const totalTablesCount = filteredTables.length;
  const activeCount = filteredTables.filter(t => t.status === 'active').length;
  const billingCount = filteredTables.filter(t => t.status === 'billing').length;
  const emptyCount = filteredTables.filter(t => t.status === 'empty').length;

  // Get total temporary amount for active tables
  const getTableAmount = (tableId: string): number => {
    const order = orders.find(o => o.tableId === tableId && o.status === 'active');
    return order ? order.totalAmount : 0;
  };

  // Custom long press implementation for web
  const useLongPress = (callback: () => void, ms = 500) => {
    let timerId: any;

    const start = () => {
      timerId = setTimeout(() => {
        callback();
      }, ms);
    };

    const stop = () => {
      clearTimeout(timerId);
    };

    return {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop
    };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Horizontal Zone Filter Slider */}
      <div className="bg-slate-900/90 pt-3 pb-2 border-b border-slate-800 shrink-0">
        <div className="overflow-x-auto scrollbar-none px-4 flex gap-2">
          {zones.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/15'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {zone.id === 'all' && <Layers size={12} />}
                {zone.id !== 'all' && <Utensils size={12} />}
                {zone.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stat Bar */}
      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 shrink-0 grid grid-cols-4 gap-2 text-center text-[10px]">
        <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800/50">
          <div className="text-slate-400 font-medium">Tổng số</div>
          <div className="text-sm font-bold text-slate-200 mt-0.5">{totalTablesCount}</div>
        </div>
        <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/25">
          <div className="text-amber-400 font-medium flex items-center justify-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Phục vụ
          </div>
          <div className="text-sm font-bold text-amber-500 mt-0.5">{activeCount}</div>
        </div>
        <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/25">
          <div className="text-emerald-400 font-medium flex items-center justify-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Tính tiền
          </div>
          <div className="text-sm font-bold text-emerald-500 mt-0.5">{billingCount}</div>
        </div>
        <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/30">
          <div className="text-slate-400 font-medium">Bàn trống</div>
          <div className="text-sm font-bold text-slate-400 mt-0.5">{emptyCount}</div>
        </div>
      </div>

      {/* Tables Grid Layout */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none pb-24">
        {filteredTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Sparkles size={32} className="stroke-[1.5] mb-2 text-slate-600 animate-pulse" />
            <p className="text-xs">Khu vực này hiện chưa có bàn nào</p>
            <button
              onClick={onAddTableClick}
              className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
            >
              <Plus size={14} /> Thêm bàn ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredTables.map((table) => {
                const amount = getTableAmount(table.id);
                const sittingTime = elapsedTimers[table.id] || '';
                
                // Color mapping
                let bgClass = 'bg-slate-800/40 border-slate-700/40 text-slate-300';
                let statusColor = 'bg-slate-500';
                let accentColor = 'border-slate-800';
                let statusLabel = 'Trống';

                if (table.status === 'active') {
                  bgClass = 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15';
                  statusColor = 'bg-amber-500';
                  accentColor = 'border-amber-500/50';
                  statusLabel = 'Đang ngồi';
                } else if (table.status === 'billing') {
                  bgClass = 'bg-emerald-500/10 border-emerald-500/35 hover:bg-emerald-500/15 animate-[pulse_3s_infinite]';
                  statusColor = 'bg-emerald-500';
                  accentColor = 'border-emerald-500/50';
                  statusLabel = 'Tính tiền';
                }

                return (
                  <motion.div
                    layoutId={`table-${table.id}`}
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onTableTap(table)}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between h-28 cursor-pointer select-none overflow-hidden transition-all shadow-md group ${bgClass} ${accentColor}`}
                    title="Chạm để mở order • Giữ lâu để tùy chỉnh"
                  >
                    {/* Tiny Status indicator line at the top */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 w-full flex">
                      <div className={`h-full w-full ${statusColor} opacity-50`} />
                    </div>

                    {/* Table Header with name & action menu button */}
                    <div className="flex justify-between items-start pt-1">
                      <span className="font-bold text-sm text-slate-100 tracking-tight leading-tight group-hover:text-orange-400 transition-colors">
                        {table.name}
                      </span>
                      
                      {/* Menu trigger button (especially helpful for desktop users instead of long press) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTableLongPress(table);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 z-10 -mr-1 -mt-1"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>

                    {/* Guest Count & Time sitting */}
                    {table.status !== 'empty' ? (
                      <div className="flex flex-col gap-1 my-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Users size={10} className="text-slate-400" />
                          <span>👥 {table.guestCount} khách</span>
                        </div>
                        {sittingTime && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                            <Clock size={10} className="text-slate-400" />
                            <span>⏳ {sittingTime}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 my-1 justify-center items-start">
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                          Trống
                        </span>
                      </div>
                    )}

                    {/* Footer price tag */}
                    <div className="mt-auto pt-1 flex justify-between items-center border-t border-slate-800/40">
                      {table.status !== 'empty' && amount > 0 ? (
                        <span className="text-[11px] font-bold text-orange-400 tracking-tight truncate w-full">
                          {formatVND(amount)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-medium truncate italic">
                          - - -
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Action Button for adding table */}
      <div className="absolute bottom-20 right-6 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAddTableClick}
          className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/20"
          title="Thêm bàn mới"
        >
          <Plus size={24} className="stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
}
