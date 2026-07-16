import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  Coins, 
  ChevronDown, 
  Building2, 
  User, 
  Hash,
  Download,
  Check
} from 'lucide-react';
import { Order, BankConfig } from '../types';
import { formatVND, generateVietQRUrl } from '../utils';
import { LIST_OF_BANKS } from '../data';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order;
  tableName: string;
  zoneName: string;
  discountPercent: number;
  bankConfig: BankConfig;
  onUpdateBankConfig: (config: BankConfig) => void;
  onPaymentSuccess: (paymentMethod: 'cash' | 'vietqr', discount: number) => void;
}

export default function VietQRModal({
  isOpen,
  onClose,
  activeOrder,
  tableName,
  zoneName,
  discountPercent,
  bankConfig,
  onUpdateBankConfig,
  onPaymentSuccess
}: VietQRModalProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [localBankId, setLocalBankId] = useState(bankConfig.bankId);
  const [localAccountNo, setLocalAccountNo] = useState(bankConfig.accountNo);
  const [localAccountName, setLocalAccountName] = useState(bankConfig.accountName);
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'cash'>('vietqr');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const originalAmount = activeOrder.totalAmount;
  const discountAmount = Math.floor(originalAmount * (discountPercent / 100));
  const finalAmount = originalAmount - discountAmount;

  // Selected Bank Object
  const selectedBank = LIST_OF_BANKS.find(b => b.id === localBankId) || LIST_OF_BANKS[0];

  // Description formatted for dynamic VietQR parsing
  const qrDescription = `Thanh toan ${tableName.replace(/\s+/g, '')}`;

  // Generated authentic VietQR Image URL
  const qrUrl = generateVietQRUrl(
    selectedBank.code,
    localAccountNo,
    finalAmount,
    qrDescription,
    localAccountName
  );

  const handleSaveConfig = () => {
    onUpdateBankConfig({
      bankId: localBankId,
      accountNo: localAccountNo,
      accountName: localAccountName
    });
    setShowConfig(false);
  };

  const handleConfirmPaid = () => {
    onPaymentSuccess(paymentMethod, discountAmount);
  };

  const handleCopyNo = () => {
    navigator.clipboard.writeText(localAccountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Black Translucent Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer"
      />

      {/* Main Drawer Container */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative bg-slate-900 border-t border-slate-800 rounded-t-[32px] shadow-2xl max-h-[92%] flex flex-col overflow-hidden z-50 w-full"
      >
        {/* Swipe Handle */}
        <div className="w-full flex justify-center py-2 shrink-0">
          <div className="w-12 h-1 bg-slate-700 rounded-full cursor-pointer" onClick={onClose}></div>
        </div>

        {/* Modal Header */}
        <div className="px-4 pb-2 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              💳 Thanh toán nhanh
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{tableName} — {zoneName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        {/* Payment Screen Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none flex flex-col gap-4">
          
          {/* Billing Amount Summary */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 text-center shadow-inner relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-orange-500/5 rounded-full blur-xl"></div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tổng tiền thanh toán</p>
            <h4 className="text-xl font-black text-orange-400 mt-1 tracking-tight">
              {formatVND(finalAmount)}
            </h4>
            {discountAmount > 0 && (
              <p className="text-[9px] text-emerald-400 mt-0.5 font-bold">
                (Đã áp dụng giảm giá: -{formatVND(discountAmount)})
              </p>
            )}
          </div>

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setPaymentMethod('vietqr')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                paymentMethod === 'vietqr'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode size={13} />
              <span>Chuyển khoản VietQR</span>
            </button>
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                paymentMethod === 'cash'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins size={13} />
              <span>Tiền mặt</span>
            </button>
          </div>

          {paymentMethod === 'vietqr' ? (
            /* VIETQR INTERACTION */
            <div className="flex flex-col items-center gap-3">
              {/* Actual dynamic VietQR scan card */}
              <div className="bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center border border-slate-200 max-w-[210px] w-full mx-auto">
                <div className="w-full text-center pb-1 mb-1 border-b border-slate-100 flex items-center justify-center gap-1">
                  <span className="text-[8px] font-black tracking-widest text-blue-900 uppercase">Viet</span>
                  <span className="text-[8px] font-black tracking-widest text-red-600 uppercase">QR</span>
                  <span className="text-[6px] text-slate-400">|</span>
                  <span className="text-[7px] font-bold text-slate-500">{selectedBank.name}</span>
                </div>
                
                <img
                  src={qrUrl}
                  alt="Dynamic VietQR code"
                  className="w-full aspect-square object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback to text instructions in case of offline / API issues
                    e.currentTarget.style.display = 'none';
                  }}
                />

                <div className="mt-1 text-[8px] font-medium text-slate-500 text-center leading-tight">
                  Quét bằng mọi ứng dụng ngân hàng
                </div>
              </div>

              {/* Dynamic QR Information Table */}
              <div className="w-full bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-[11px] font-semibold flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="text-slate-200 font-bold">{selectedBank.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-100 font-bold tracking-wider">{localAccountNo}</span>
                    <button
                      onClick={handleCopyNo}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-orange-400"
                      title="Sao chép số tài khoản"
                    >
                      {copied ? <Check size={10} className="text-emerald-400" /> : <span className="text-[8px]">Copy</span>}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tên thụ hưởng:</span>
                  <span className="text-slate-200 uppercase">{localAccountName}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Nội dung quét:</span>
                  <span className="text-orange-400 font-black italic">{qrDescription}</span>
                </div>
              </div>

              {/* Quick toggle to setup merchant accounts */}
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="text-[10px] text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800/50"
              >
                <QrCode size={11} />
                <span>{showConfig ? 'Đóng cấu hình tài khoản' : 'Cấu hình TK Ngân hàng nhận tiền'}</span>
                <ChevronDown size={11} className={`transform transition-transform ${showConfig ? 'rotate-180' : ''}`} />
              </button>

              {/* Merchant Bank Config panel */}
              {showConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="w-full bg-slate-850 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 text-xs"
                >
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <Building2 size={13} className="text-orange-400" />
                    <span>Thiết lập Tài khoản nhận tiền</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold">Chọn Ngân hàng</label>
                    <select
                      value={localBankId}
                      onChange={(e) => setLocalBankId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      {LIST_OF_BANKS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold">Số tài khoản ngân hàng</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={localAccountNo}
                        onChange={(e) => setLocalAccountNo(e.target.value)}
                        placeholder="Nhập số tài khoản..."
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                      />
                      <Hash size={12} className="absolute left-2.5 top-3 text-slate-500" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-slate-400 font-bold">Tên chủ tài khoản (In hoa không dấu)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={localAccountName}
                        onChange={(e) => setLocalAccountName(e.target.value.toUpperCase())}
                        placeholder="NGUYEN VAN A"
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                      />
                      <User size={12} className="absolute left-2.5 top-3 text-slate-500" />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="w-full mt-1 bg-orange-500 text-white py-2 rounded-xl font-bold text-xs shadow-md shadow-orange-500/15"
                  >
                    Lưu thiết lập
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            /* CASH INTERACTION */
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center gap-3 text-center my-4 py-8">
              <Coins size={36} className="text-orange-400 animate-bounce" />
              <div>
                <p className="text-xs font-bold text-slate-200">Thu tiền mặt trực tiếp tại bàn</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">
                  Vui lòng nhận đúng số tiền <span className="text-orange-400 font-black">{formatVND(finalAmount)}</span> từ thực khách, sau đó bấm Xác nhận thanh toán.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Bottom Confirmation Section */}
        <div className="bg-slate-950 p-4 border-t border-slate-850 shrink-0">
          <button
            onClick={handleConfirmPaid}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 active:scale-[0.98] transition-all cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>XÁC NHẬN ĐÃ THU ĐỦ TIỀN</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
