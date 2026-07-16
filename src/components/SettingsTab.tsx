import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Hash, 
  Save, 
  Store, 
  MapPin, 
  CheckCircle,
  HelpCircle,
  Coins
} from 'lucide-react';
import { BankConfig } from '../types';
import { LIST_OF_BANKS } from '../data';

interface SettingsTabProps {
  bankConfig: BankConfig;
  onUpdateBankConfig: (config: BankConfig) => void;
  theme: 'light' | 'dark';
  onChangeTheme: (theme: 'light' | 'dark') => void;
  accentColor: 'orange' | 'emerald' | 'blue' | 'purple' | 'rose';
  onChangeAccentColor: (color: 'orange' | 'emerald' | 'blue' | 'purple' | 'rose') => void;
  radius: 'sharp' | 'medium' | 'round';
  onChangeRadius: (radius: 'sharp' | 'medium' | 'round') => void;
  fontFamily: 'inter' | 'outfit' | 'space-grotesk' | 'playfair' | 'mono';
  onChangeFontFamily: (font: 'inter' | 'outfit' | 'space-grotesk' | 'playfair' | 'mono') => void;
}

export default function SettingsTab({ 
  bankConfig, 
  onUpdateBankConfig,
  theme,
  onChangeTheme,
  accentColor,
  onChangeAccentColor,
  radius,
  onChangeRadius,
  fontFamily,
  onChangeFontFamily
}: SettingsTabProps) {
  const [bankId, setBankId] = useState(bankConfig.bankId);
  const [accountNo, setAccountNo] = useState(bankConfig.accountNo);
  const [accountName, setAccountName] = useState(bankConfig.accountName);
  const [storeName, setStoreName] = useState('An Nam Coffee & Food');
  const [storeAddress, setStoreAddress] = useState('120 Trần Hưng Đạo, Quận 1, TP. HCM');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBankConfig({
      bankId,
      accountNo,
      accountName
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 h-full p-4 scrollbar-none overflow-y-auto pb-24">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 mb-4 shrink-0">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          <span>⚙️</span> Thiết lập Hệ thống
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Cấu hình thông tin cửa hàng, tài khoản nhận VietQR của quán và tùy biến giao diện.</p>
      </div>

      {isSaved && (
        <div className="mb-4 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-xl p-3 text-[11px] font-semibold flex items-center gap-2">
          <CheckCircle size={14} />
          <span>Đã cập nhật cấu hình hệ thống thành công!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Theme Switcher & Customization Section */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-4">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>🎨</span>
            <span>Tùy biến giao diện (Real-time)</span>
          </div>

          {/* 1. Light/Dark Mode */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Chế độ hiển thị
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeTheme('light')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all border ${
                  theme === 'light'
                    ? 'bg-orange-500/10 border-orange-500/80 text-orange-400 shadow-md shadow-orange-500/5'
                    : 'bg-slate-950 border-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>☀️</span> SÁNG (Light)
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all border ${
                  theme === 'dark'
                    ? 'bg-orange-500/10 border-orange-500/80 text-orange-400 shadow-md shadow-orange-500/5'
                    : 'bg-slate-950 border-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌙</span> TỐI (Dark)
              </button>
            </div>
          </div>

          {/* 2. Accent color picker */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tông màu chủ đạo
            </span>
            <div className="flex flex-wrap gap-2.5">
              {[
                { key: 'orange', name: 'Cam đất', colorBg: 'bg-orange-500', colorText: 'text-orange-400', border: 'border-orange-500/30' },
                { key: 'emerald', name: 'Xanh Mint', colorBg: 'bg-emerald-500', colorText: 'text-emerald-400', border: 'border-emerald-500/30' },
                { key: 'blue', name: 'Xanh biển', colorBg: 'bg-blue-500', colorText: 'text-blue-400', border: 'border-blue-500/30' },
                { key: 'purple', name: 'Nebula', colorBg: 'bg-purple-500', colorText: 'text-purple-400', border: 'border-purple-500/30' },
                { key: 'rose', name: 'Blossom', colorBg: 'bg-rose-500', colorText: 'text-rose-400', border: 'border-rose-500/30' },
              ].map((c) => {
                const isActive = accentColor === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => onChangeAccentColor(c.key as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black border transition-all active:scale-95 ${
                      isActive
                        ? 'bg-orange-500/10 border-orange-500/80 text-orange-400'
                        : 'bg-slate-950 border-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${c.colorBg} shrink-0`} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Border Roundness (Bo góc) */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Kiểu bo góc nút & thẻ
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'sharp', label: '🔲 Góc vuông', desc: 'Sắc sảo / Tối giản' },
                { key: 'medium', label: '📐 Bo vừa', desc: 'Thanh lịch / Cân đối' },
                { key: 'round', label: '⚪ Bo nhiều', desc: 'Thân thiện / Thẩm mỹ' },
              ].map((r) => {
                const isActive = radius === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => onChangeRadius(r.key as any)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95 ${
                      isActive
                        ? 'bg-orange-500/10 border-orange-500/80 text-orange-400'
                        : 'bg-slate-950 border-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-black">{r.label}</span>
                    <span className="text-[8px] text-slate-500 font-medium mt-0.5">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Font Family selection */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Phông chữ hệ thống
            </span>
            <select
              value={fontFamily}
              onChange={(e) => onChangeFontFamily(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
            >
              <option value="inter">Inter — Đa năng & Dễ đọc (Mặc định)</option>
              <option value="outfit">Outfit — Hình học trẻ trung & Thân thiện</option>
              <option value="space-grotesk">Space Grotesk — Độc đáo & Hiện đại</option>
              <option value="playfair">Playfair Display — Sang trọng & Cổ điển</option>
              <option value="mono">JetBrains Mono — Kỹ thuật & Retro</option>
            </select>
          </div>
        </div>

        {/* 1. Shop Info Section */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Store size={14} className="text-orange-400" />
            <span>Thông tin Cửa hàng</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold">Tên cửa hàng / Thương hiệu</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold">Địa chỉ</label>
            <div className="relative">
              <input
                type="text"
                required
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
              <MapPin size={12} className="absolute left-2.5 top-3 text-slate-500" />
            </div>
          </div>
        </div>

        {/* 2. Bank QR Info Section */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800/80 flex flex-col gap-3">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 size={14} className="text-orange-400" />
            <span>Tài khoản nhận VietQR động</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold">Ngân hàng thụ hưởng</label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
            >
              {LIST_OF_BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold">Số tài khoản nhận tiền</label>
            <div className="relative">
              <input
                type="text"
                required
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="Nhập số tài khoản ngân hàng..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
              <Hash size={12} className="absolute left-2.5 top-3 text-slate-500" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400 font-bold">Tên chủ tài khoản (In hoa không dấu)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN A"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500/50"
              />
              <User size={12} className="absolute left-2.5 top-3 text-slate-500" />
            </div>
          </div>
        </div>

        {/* 3. Guidance Help box */}
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[10px] text-slate-400">
          <HelpCircle size={14} className="text-orange-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <p className="font-bold text-slate-300">VietQR hoạt động như thế nào?</p>
            <p className="mt-0.5">Hệ thống POS tự động sinh mã QR liên kết ngân hàng tích hợp sẵn số tiền thanh toán chính xác từng đồng kèm lời nhắn. Thực khách quét QR này bằng bất cứ app ngân hàng nào của Việt Nam đều sẽ tự động điền đúng số tài khoản, số tiền nhận mà không cần nhập tay.</p>
          </div>
        </div>

        {/* Save Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/15 active:scale-95 transition-all mt-2 cursor-pointer"
        >
          <Save size={14} />
          <span>LƯU CẤU HÌNH HỆ THỐNG</span>
        </button>
      </form>
    </div>
  );
}
