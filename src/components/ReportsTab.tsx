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
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Invoice, MenuItem } from '../types';
import { formatVND } from '../utils';

// Styled custom tooltip for Recharts daily trend
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 px-3 py-2 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{payload[0].payload.name}</p>
        <p className="text-xs font-black text-orange-400 mt-0.5">{formatVND(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

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
      <div className="p-2.5 sm:p-4 bg-slate-950 border-b border-slate-850 shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/15 shrink-0">
              <BarChart3 size={12} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[10px] sm:text-xs font-black text-slate-200 uppercase tracking-wide whitespace-nowrap truncate">Báo Cáo Hoạt Động</h2>
              <p className="text-[8px] sm:text-[9px] text-slate-500 whitespace-nowrap truncate">Số liệu phân tích tài chính & bán hàng</p>
            </div>
          </div>

          <div className="flex flex-row flex-nowrap bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
            {(['all', 'today', 'week', 'month'] as const).map(period => (
              <button
                key={period}
                type="button"
                onClick={() => setTimePeriod(period)}
                className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[9.5px] font-black rounded-md transition-all uppercase whitespace-nowrap shrink-0 flex items-center justify-center ${
                  timePeriod === period
                    ? 'bg-orange-500 text-slate-950 shadow-xs shadow-orange-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {period === 'all' ? 'Tất\u00a0cả' : period === 'today' ? 'Hôm\u00a0nay' : period === 'week' ? '7\u00a0ngày' : 'Tháng'}
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
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Xu hướng doanh thu 7 ngày qua</span>
            <span className="text-[9px] font-mono text-slate-500">Mức cao nhất: {formatVND(maxDailyAmount)}</span>
          </div>

          {/* Interactive Recharts Area Chart */}
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyTrendData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={8} 
                  tickLine={false}
                  axisLine={false}
                  dy={6}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={8} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#f97316" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
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
