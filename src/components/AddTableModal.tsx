import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Layers, Laptop } from 'lucide-react';
import { Zone } from '../types';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: Zone[];
  onAddTable: (tableName: string, zoneId: string) => void;
  onAddZone: (zoneName: string) => void;
}

export default function AddTableModal({
  isOpen,
  onClose,
  zones,
  onAddTable,
  onAddZone
}: AddTableModalProps) {
  const [activeTab, setActiveTab] = useState<'table' | 'zone'>('table');
  const [tableName, setTableName] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [zoneName, setZoneName] = useState('');

  // Auto-select first zone excluding 'all'
  React.useEffect(() => {
    const validZone = zones.find(z => z.id !== 'all');
    if (validZone) {
      setSelectedZoneId(validZone.id);
    }
  }, [zones]);

  if (!isOpen) return null;

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim() || !selectedZoneId) return;
    onAddTable(tableName.trim(), selectedZoneId);
    setTableName('');
    onClose();
  };

  const handleAddZoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;
    onAddZone(zoneName.trim());
    setZoneName('');
    setActiveTab('table');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer"
      />

      {/* Dialog body */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-4 shadow-2xl flex flex-col gap-3 z-50"
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
            <span>⚙️</span> Thêm mới Bàn / Khu vực
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('table')}
            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === 'table'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thêm Bàn mới
          </button>
          <button
            onClick={() => setActiveTab('zone')}
            className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === 'zone'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thêm Khu vực
          </button>
        </div>

        {activeTab === 'table' ? (
          /* ADD TABLE FORM */
          <form onSubmit={handleAddTableSubmit} className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-bold">Tên bàn / Số bàn</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Bàn 07, Bàn 203..."
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-bold">Khu vực / Tầng</label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              >
                {zones
                  .filter((z) => z.id !== 'all')
                  .map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs mt-2 shadow-md shadow-orange-500/15"
            >
              Lưu & Tạo Bàn
            </button>
          </form>
        ) : (
          /* ADD ZONE FORM */
          <form onSubmit={handleAddZoneSubmit} className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-bold">Tên Khu vực mới</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Lầu 2, Rooftop, Phòng lạnh..."
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-xs mt-2 shadow-md shadow-orange-500/15"
            >
              Lưu & Tạo Khu vực
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
