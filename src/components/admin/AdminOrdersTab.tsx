import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, CheckCircle2, Clock, 
  AlertCircle, RefreshCw, Eye, X, CreditCard, User, 
  DollarSign, ArrowUpRight 
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatPriceToman, toPersianDigits } from '../../utils/persian.js';

export const AdminOrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.commerce.getAllOrders({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchTerm || undefined
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
        setTotalCount(res.data.totalCount);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.commerce.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={12} />
            پرداخت شده
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <Clock size={12} />
            در انتظار پرداخت
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
            <RefreshCw size={12} />
            مسترد شده
          </span>
        );
      case 'CANCELLED':
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <AlertCircle size={12} />
            ناموفق / لغو شده
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="جستجو بر اساس شماره سفارش، نام دانشجو، ایمیل یا کد رهگیری..."
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900/60 text-slate-800 dark:text-slate-100 text-xs focus:outline-hidden"
            />
            <Search size={14} className="absolute start-3 top-2.5 text-slate-400" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold cursor-pointer transition-all"
          >
            جستجو
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0c2e39] border border-teal-100 dark:border-teal-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="PAID">پرداخت شده</option>
            <option value="PENDING">در انتظار پرداخت</option>
            <option value="REFUNDED">مسترد شده</option>
            <option value="CANCELLED">لغو شده</option>
          </select>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl border border-teal-100 dark:border-teal-900/60 hover:bg-slate-50 dark:hover:bg-[#0c2e39] text-slate-600 dark:text-slate-300 cursor-pointer"
            title="به‌روزرسانی"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#08242d] rounded-3xl border border-teal-100 dark:border-teal-900 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-teal-100/60 dark:border-teal-900/60 flex items-center justify-between">
          <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#0d9488]" />
            <span>لیست جامع تراکنش‌ها و سفارش‌های پلتفرم ({toPersianDigits(totalCount)})</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin mb-2"></div>
            <div>در حال بارگذاری تراکنش‌ها...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            سفارشی با معیارهای انتخابی یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead className="bg-slate-50/70 dark:bg-[#0c2e39]/50 text-slate-400 text-[11px] font-bold border-b border-teal-100/60 dark:border-teal-900/60">
                <tr>
                  <th className="py-3 px-4 text-start">شماره سفارش</th>
                  <th className="py-3 px-4 text-start">دانشجو</th>
                  <th className="py-3 px-4 text-start">دوره‌ها</th>
                  <th className="py-3 px-4 text-start">مبلغ کل</th>
                  <th className="py-3 px-4 text-start">کد تخفیف</th>
                  <th className="py-3 px-4 text-start">وضعیت</th>
                  <th className="py-3 px-4 text-start">کد رهگیری</th>
                  <th className="py-3 px-4 text-start">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-100/40 dark:divide-teal-900/40">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0a2f3a]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{order.userName}</div>
                      <div className="text-[10px] text-slate-400">{order.userEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                        {order.items.map(i => i.title).join('، ')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {toPersianDigits(order.items.length)} آیتم
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0d9488] dark:text-[#5eead4]">
                      {order.totalAmount === 0 ? 'رایگان' : formatPriceToman(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.couponCode ? (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold">
                          {order.couponCode}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {order.trackingCode || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#08242d] border border-teal-100 dark:border-teal-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-teal-100/60 dark:border-teal-900/60 pb-4">
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">جزئیات سفارش مالی</div>
                <div className="font-extrabold text-base text-slate-900 dark:text-white font-mono">
                  {selectedOrder.orderNumber}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer & Gateway Info */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#0c2e39] text-[11px]">
              <div>
                <div className="text-slate-400">نام دانشجو:</div>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{selectedOrder.userName}</div>
              </div>
              <div>
                <div className="text-slate-400">ایمیل:</div>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{selectedOrder.userEmail}</div>
              </div>
              <div>
                <div className="text-slate-400">درگاه پرداخت:</div>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">{selectedOrder.paymentGateway || 'MOCK_GATEWAY'}</div>
              </div>
              <div>
                <div className="text-slate-400">کد رهگیری بانکی:</div>
                <div className="font-bold text-teal-600 dark:text-teal-400 mt-0.5 font-mono">{selectedOrder.trackingCode || '-'}</div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="font-bold text-xs text-slate-700 dark:text-slate-200">دوره‌های خریداری شده:</div>
              <div className="divide-y divide-teal-100/40 dark:divide-teal-900/40 border border-teal-100/60 dark:border-teal-900/60 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between bg-white dark:bg-[#0a2d38]">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                      {item.instructorName && (
                        <div className="text-[10px] text-slate-400 mt-0.5">مدرس: {item.instructorName}</div>
                      )}
                    </div>
                    <div className="font-bold text-[#0d9488] dark:text-[#5eead4]">
                      {item.price === 0 ? 'رایگان' : formatPriceToman(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-1.5 text-[11px] pt-2 border-t border-teal-100/60 dark:border-teal-900/60">
              <div className="flex justify-between text-slate-500">
                <span>جمع کل اقلام:</span>
                <span>{formatPriceToman(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-500 font-bold">
                  <span>تخفیف کوپن ({selectedOrder.couponCode}):</span>
                  <span>- {formatPriceToman(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-teal-100/40 dark:border-teal-900/40">
                <span>مبلغ نهایی پرداخت:</span>
                <span className="text-[#0d9488] dark:text-[#5eead4]">{formatPriceToman(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="flex items-center gap-2 pt-2">
              {selectedOrder.status !== 'PAID' && (
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'PAID')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  تایید دستی و فعال‌سازی دسترسی
                </button>
              )}
              {selectedOrder.status === 'PAID' && (
                <button
                  disabled={isUpdatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'REFUNDED')}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  استرداد وجه و لغو دسترسی دوره
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
