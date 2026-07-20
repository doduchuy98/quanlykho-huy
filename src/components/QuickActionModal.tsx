import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ArrowRightLeft, 
  Merge, 
  DollarSign, 
  Users, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Table } from '../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  allTables: Table[];
  onMoveTable: (fromId: string, toId: string) => void;
  onMergeTable: (fromId: string, toId: string) => void;
  onQuickBill: (tableId: string) => void;
  onUpdateGuests: (tableId: string, guests: number) => void;
  onClearTable: (tableId: string) => void;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  table,
  allTables,
  onMoveTable,
  onMergeTable,
  onQuickBill,
  onUpdateGuests,
  onClearTable
}: QuickActionModalProps) {
  const [mode, setMode] = useState<'menu' | 'move' | 'merge' | 'guests'>('menu');
  const [targetTableId, setTargetTableId] = useState('');
  const [tempGuests, setTempGuests] = useState(table.guestCount);

  if (!isOpen) return null;

  // Filter tables suitable for moving (only empty tables)
  const emptyTablesForMove = allTables.filter(t => t.id !== table.id && t.status === 'empty');

  // Filter tables suitable for merging (only active/billing tables)
  const activeTablesForMerge = allTables.filter(t => t.id !== table.id && t.status !== 'empty');

  const handleMove = () => {
    if (!targetTableId) return;
    const targetTable = allTables.find(t => t.id === targetTableId);
    const targetName = targetTable ? targetTable.name : 'Bàn mới';
    if (confirm(`Bạn có chắc chắn muốn CHUYỂN toàn bộ hóa đơn từ [${table.name}] sang [${targetName}] không?`)) {
      onMoveTable(table.id, targetTableId);
      onClose();
    }
  };

  const handleMerge = () => {
    if (!targetTableId) return;
    const targetTable = allTables.find(t => t.id === targetTableId);
    const targetName = targetTable ? targetTable.name : 'Bàn gộp';
    if (confirm(`Bạn có chắc chắn muốn GHÉP/GỘP toàn bộ hóa đơn từ [${table.name}] vào [${targetName}] không?`)) {
      onMergeTable(table.id, targetTableId);
      onClose();
    }
  };

  const handleSaveGuests = () => {
    onUpdateGuests(table.id, tempGuests);
    onClose();
  };

  const handleClear = () => {
    if (confirm(`Bạn có chắc chắn muốn hủy bàn này? Toàn bộ order chưa thanh toán của ${table.name} sẽ bị xóa.`)) {
      onClearTable(table.id);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end">
      {/* Dimmed backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
      />

      {/* Main Bottom Sheet Panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative bg-slate-900 border-t border-slate-800 rounded-t-[28px] w-full p-4 flex flex-col gap-4 z-50 overflow-hidden shrink-0"
      >
        {/* Header indicator */}
        <div className="w-full flex justify-center pb-2 shrink-0">
          <div className="w-12 h-1 bg-slate-700 rounded-full cursor-pointer" onClick={onClose}></div>
        </div>

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              ⚡ Thao tác nhanh — <span className="text-orange-400">{table.name}</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Trạng thái hiện tại: <span className="text-slate-200 capitalize">{table.status === 'empty' ? 'Bàn trống' : table.status === 'active' ? 'Đang ngồi' : 'Chờ thanh toán'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Dynamic content rendering based on internal mode */}
        {mode === 'menu' && (
          <div className="flex flex-col gap-2 pb-2">
            {table.status !== 'empty' && (
              <>
                {/* 1. Quick Billing */}
                <button
                  onClick={() => {
                    onQuickBill(table.id);
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all text-left"
                >
                  <DollarSign size={16} />
                  <div>
                    <p>Thanh toán nhanh</p>
                    <p className="text-[9px] text-slate-400 font-medium">Chuyển sang Chờ thanh toán và mở QR ngay</p>
                  </div>
                </button>

                {/* 2. Move Table */}
                <button
                  onClick={() => setMode('move')}
                  className="w-full py-3 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all text-left"
                >
                  <ArrowRightLeft size={16} className="text-orange-400" />
                  <div>
                    <p className="text-slate-200">Chuyển bàn</p>
                    <p className="text-[9px] text-slate-400 font-medium">Chuyển toàn bộ món ăn và khách sang bàn trống</p>
                  </div>
                </button>

                {/* 3. Merge Table */}
                <button
                  onClick={() => setMode('merge')}
                  className="w-full py-3 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all text-left"
                >
                  <Merge size={16} className="text-orange-400" />
                  <div>
                    <p className="text-slate-200">Ghép bàn / Gộp bàn</p>
                    <p className="text-[9px] text-slate-400 font-medium">Gộp hóa đơn của bàn này chung với bàn khác</p>
                  </div>
                </button>

                {/* 4. Edit Guests Headcount */}
                <button
                  onClick={() => {
                    setTempGuests(table.guestCount);
                    setMode('guests');
                  }}
                  className="w-full py-3 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all text-left"
                >
                  <Users size={16} className="text-orange-400" />
                  <div>
                    <p className="text-slate-200">Thay đổi số khách</p>
                    <p className="text-[9px] text-slate-400 font-medium">Hiện có {table.guestCount} khách đang ngồi</p>
                  </div>
                </button>

                {/* 5. Clear / Cancel Table */}
                <button
                  onClick={handleClear}
                  className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all text-left"
                >
                  <Trash2 size={16} />
                  <div>
                    <p>Hủy bàn trống / Trả bàn</p>
                    <p className="text-[9px] text-slate-400 font-medium">Hủy toàn bộ đơn gọi và trả về bàn trống</p>
                  </div>
                </button>
              </>
            )}

            {table.status === 'empty' && (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-2">
                <AlertCircle size={24} className="text-slate-600 animate-pulse" />
                <p className="text-xs">Bàn này hiện tại trống.</p>
                <p className="text-[10px] text-slate-500">Hãy nhấn 1 chạm trực tiếp vào bàn để mở màn hình POS gọi món và đón khách mới.</p>
              </div>
            )}
          </div>
        )}

        {/* Change / Move table UI panel */}
        {mode === 'move' && (
          <div className="flex flex-col gap-3 pb-3">
            <h4 className="text-xs font-bold text-slate-200">Chuyển {table.name} sang bàn trống nào?</h4>
            {emptyTablesForMove.length === 0 ? (
              <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">Không còn bàn trống nào trong quán hiện tại.</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto">
                {emptyTablesForMove.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTargetTableId(t.id)}
                    className={`py-2 px-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between border ${
                      targetTableId === t.id 
                        ? 'bg-orange-500/15 border-orange-500 text-orange-400' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.name}</span>
                    {targetTableId === t.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setMode('menu')}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                disabled={!targetTableId}
                onClick={handleMove}
                className="flex-1 py-2 bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all"
              >
                Xác nhận Chuyển
              </button>
            </div>
          </div>
        )}

        {/* Merge Table UI Panel */}
        {mode === 'merge' && (
          <div className="flex flex-col gap-3 pb-3">
            <h4 className="text-xs font-bold text-slate-200">Gộp hóa đơn {table.name} chung vào bàn nào?</h4>
            {activeTablesForMerge.length === 0 ? (
              <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">Không có bàn nào khác đang có khách trong quán.</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto">
                {activeTablesForMerge.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTargetTableId(t.id)}
                    className={`py-2 px-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between border ${
                      targetTableId === t.id 
                        ? 'bg-orange-500/15 border-orange-500 text-orange-400' 
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.name}</span>
                    {targetTableId === t.id && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setMode('menu')}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                disabled={!targetTableId}
                onClick={handleMerge}
                className="flex-1 py-2 bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all"
              >
                Xác nhận Gộp
              </button>
            </div>
          </div>
        )}

        {/* Change guests headcount Panel */}
        {mode === 'guests' && (
          <div className="flex flex-col gap-3 pb-3 items-center">
            <h4 className="text-xs font-bold text-slate-200">Điều chỉnh số khách ngồi tại {table.name}</h4>
            
            <div className="flex items-center gap-6 my-2 bg-slate-950 p-4 rounded-2xl border border-slate-850">
              <button
                onClick={() => setTempGuests(Math.max(1, tempGuests - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg"
              >
                -
              </button>
              <span className="text-2xl font-black text-orange-400 w-12 text-center">{tempGuests}</span>
              <button
                onClick={() => setTempGuests(tempGuests + 1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-lg"
              >
                +
              </button>
            </div>

            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setMode('menu')}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveGuests}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
