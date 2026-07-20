import React, { useState } from 'react';
import { 
  TrendingUp, 
  Receipt, 
  DollarSign, 
  Coffee, 
  CreditCard, 
  Coins, 
  BarChart3, 
  PieChart, 
  Calendar,
  Utensils,
  Award,
  ChevronRight,
  TrendingDown,
  Percent
} from 'lucide-react';
import { Invoice, MenuItem } from '../types';
import { formatVND } from '../utils';

interface ReportsTabProps {
  invoices: Invoice[];
  menuItems: MenuItem[];
}

export default function ReportsTab({ invoices, menuItems }: ReportsTabProps) {
  const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filter invoices by time range
  const now = new Date();
  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.paymentTime);
    if (timePeriod === 'today') {
      return invDate.toDateString() === now.toDateString();
    }
    if (timePeriod === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return invDate >= oneWeekAgo;
    }
    if (timePeriod === 'month') {
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    }
    return true; // all
  });

  // Calculate high level metrics
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
  const totalInvoices = filteredInvoices.length;
  const originalCost = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalDiscounts = filteredInvoices.reduce((sum, inv) => sum + inv.discount, 0);
  const averageBill = totalInvoices > 0 ? Math.floor(totalRevenue / totalInvoices) : 0;

  // Payment method stats
  const vietQrInvoices = filteredInvoices.filter(inv => inv.paymentMethod === 'vietqr');
  const cashInvoices = filteredInvoices.filter(inv => inv.paymentMethod === 'cash');
  
  const vietQrRevenue = vietQrInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
  const cashRevenue = cashInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);

  const vietQrPercent = totalRevenue > 0 ? Math.round((vietQrRevenue / totalRevenue) * 100) : 0;
  const cashPercent = totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0;

  // Item leaderboards
  const itemQuantities: { [key: string]: { name: string, qty: number, revenue: number } } = {};
  filteredInvoices.forEach(inv => {
    inv.items.forEach(item => {
      if (itemQuantities[item.id]) {
        itemQuantities[item.id].qty += item.quantity;
        itemQuantities[item.id].revenue += item.price * item.quantity;
      } else {
        itemQuantities[item.id] = {
          name: item.name,
          qty: item.quantity,
          revenue: item.price * item.quantity
        };
      }
    });
  });

  const sortedItems = Object.values(itemQuantities).sort((a, b) => b.qty - a.qty);
  const topItems = sortedItems.slice(0, 5);

  // Grouped by Category
  const categorySales: { [key: string]: number } = {};
  filteredInvoices.forEach(inv => {
    inv.items.forEach(item => {
      // Find original item to get category
      const originItem = menuItems.find(m => m.id === item.id);
      const cat = originItem?.category || 'Khác';
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
    });
  });

  const categoryLeaderboard = Object.entries(categorySales).sort((a, b) => b[1] - a[1]);

  // Daily revenue for the last 7 days chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - i);
    return d;
  }).reverse();

  const dailyTrendData = last7Days.map(date => {
    const dayString = date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
    const amount = invoices
      .filter(inv => new Date(inv.paymentTime).toDateString() === date.toDateString())
      .reduce((sum, inv) => sum + inv.finalAmount, 0);
    return { name: dayString, amount };
  });

  const maxDailyAmount = Math.max(...dailyTrendData.map(d => d.amount), 100000);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 h-full">
      {/* Header and Filter */}
      <div className="p-4 bg-slate-950 border-b border-slate-850 shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/15">
              <BarChart3 size={15} />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-200 uppercase tracking-wide">Báo Cáo Hoạt Động</h2>
              <p className="text-[9px] text-slate-500">Số liệu phân tích tài chính & bán hàng</p>
            </div>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(['all', 'today', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                type="button"
                onClick={() => setTimePeriod(period)}
                className={`px-2.5 py-1 text-[9.5px] font-bold rounded-md transition-all uppercase ${
                  timePeriod === period
                    ? 'bg-orange-500 text-slate-950 font-black shadow-xs shadow-orange-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {period === 'all' ? 'Tất cả' : period === 'today' ? 'Hôm nay' : period === 'week' ? '7 ngày' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 scrollbar-none">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <TrendingUp size={11} className="text-emerald-400" />
              <span>Doanh thu thuần</span>
            </div>
            <div className="mt-2.5">
              <span className="text-sm font-black text-emerald-400 block tracking-tight">
                {formatVND(totalRevenue)}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block font-medium">
                Gốc hàng: {formatVND(originalCost)}
              </span>
            </div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <Receipt size={11} className="text-orange-400" />
              <span>Số lượng hóa đơn</span>
            </div>
            <div className="mt-2.5">
              <span className="text-sm font-black text-slate-200 block">
                {totalInvoices} hóa đơn
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block font-medium">
                TB/Đơn: {formatVND(averageBill)}
              </span>
            </div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <Percent size={11} className="text-blue-400" />
              <span>Tổng Giảm giá</span>
            </div>
            <div className="mt-2.5">
              <span className="text-sm font-black text-blue-400 block">
                -{formatVND(totalDiscounts)}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block font-medium">
                Khuyến mãi trực tiếp
              </span>
            </div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <Coins size={11} className="text-amber-500" />
              <span>Hình Thức Bán</span>
            </div>
            <div className="mt-2.5">
              <span className="text-sm font-black text-amber-500 block">
                Offline POS
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5 block font-medium">
                Tại quầy & mang về
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Revenue Trend Chart */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Doanh thu 7 ngày qua</span>
            <span className="text-[9px] font-mono text-slate-500">Mức cao nhất: {formatVND(maxDailyAmount)}</span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-32 flex items-end justify-between gap-1.5 pt-4 border-b border-slate-800 pb-1">
            {dailyTrendData.map((data, idx) => {
              const heightPercent = maxDailyAmount > 0 ? (data.amount / maxDailyAmount) * 100 : 0;
              const isToday = idx === dailyTrendData.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-[8px] font-mono text-orange-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {formatVND(data.amount)}
                  </div>
                  {/* Bar */}
                  <div 
                    style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 cursor-pointer ${
                      isToday 
                        ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-xs shadow-orange-500/20' 
                        : 'bg-slate-700 group-hover:bg-orange-500/50'
                    }`}
                  />
                  {/* Label */}
                  <span className="text-[8px] font-bold text-slate-500 mt-2 truncate max-w-full text-center">
                    {data.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hình thức thanh toán</span>
          
          <div className="space-y-3.5">
            {/* Progress bar combination */}
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-900">
              <div 
                style={{ width: `${vietQrPercent}%` }} 
                className="bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500" 
              />
              <div 
                style={{ width: `${cashPercent}%` }} 
                className="bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-slate-300 font-semibold">Chuyển khoản VietQR</span>
                </div>
                <div className="pl-4">
                  <span className="text-xs font-black text-slate-200">{formatVND(vietQrRevenue)}</span>
                  <span className="text-[9px] text-slate-500 block font-bold">{vietQrPercent}% tổng nguồn thu</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-slate-300 font-semibold">Tiền mặt thủ công</span>
                </div>
                <div className="pl-4">
                  <span className="text-xs font-black text-slate-200">{formatVND(cashRevenue)}</span>
                  <span className="text-[9px] text-slate-500 block font-bold">{cashPercent}% tổng nguồn thu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top selling dishes */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top 5 món bán chạy nhất</span>
            <span className="text-[9px] text-slate-500 font-bold">Xếp hạng theo SL gọi</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            {topItems.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-slate-500">Chưa ghi nhận món ăn nào được bán ra</div>
            ) : (
              topItems.map((item, idx) => {
                const maxQty = topItems[0]?.qty || 1;
                const progressWidth = (item.qty / maxQty) * 100;

                return (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-[9px] text-orange-400 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <span className="text-[10.5px] font-bold text-slate-200 block truncate">{item.name}</span>
                        {/* Custom progress bar under name */}
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${progressWidth}%` }} 
                            className="bg-orange-500 h-full rounded-full transition-all duration-500" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10.5px] font-black text-slate-200 block">
                        {item.qty} cốc/món
                      </span>
                      <span className="text-[8.5px] text-slate-500 font-bold">
                        Thu về: {formatVND(item.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Revenue Contribution */}
        <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Doanh thu theo phân mục</span>

          <div className="grid grid-cols-1 gap-2">
            {categoryLeaderboard.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-slate-500">Chưa ghi nhận danh mục nào</div>
            ) : (
              categoryLeaderboard.map(([cat, rev], idx) => {
                const totalCatRev = Object.values(categorySales).reduce((a, b) => a + b, 0);
                const percent = totalCatRev > 0 ? Math.round((rev / totalCatRev) * 100) : 0;

                return (
                  <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <span className="text-[10.5px] text-slate-300 font-bold">{cat}</span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10.5px] font-black text-orange-400 block">{formatVND(rev)}</span>
                        <span className="text-[8.5px] text-slate-500 font-bold">Chiếm {percent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
