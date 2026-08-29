import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Search, DollarSign, Download, ArrowUpRight } from 'lucide-react';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';

interface OrderRecord {
  id: string;
  orderNumber: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentGateway: string;
}

export const OrdersManagerTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [orders] = useState<OrderRecord[]>([
    {
      id: 'ord-1',
      orderNumber: 'ORD-98421',
      studentName: 'امیررضا کاظمی',
      courseTitle: 'مسترکلاس طراحی دیزاین سیستم پیشرفته با فیگما',
      amount: 1850000,
      date: '۱۴۰۳/۰۸/۲۴ - ۱۴:۳۰',
      status: 'completed',
      paymentGateway: 'زرین‌پال شاپرک'
    },
    {
      id: 'ord-2',
      orderNumber: 'ORD-98420',
      studentName: 'مریم بهرامی',
      courseTitle: 'معماری و کامپوننت‌های مدرن ری‌اکت و نکست',
      amount: 1480000,
      date: '۱۴۰۳/۰۸/۲۴ - ۱۲:۱۵',
      status: 'completed',
      paymentGateway: 'درگاه به پرداخت ملت'
    },
    {
      id: 'ord-3',
      orderNumber: 'ORD-98419',
      studentName: 'پویا دهقان',
      courseTitle: 'اصول تایپوگرافی فارسی و طراحی وب',
      amount: 690000,
      date: '۱۴۰۳/۰۸/۲۳ - ۱۹:۴۰',
      status: 'completed',
      paymentGateway: 'زیبال'
    },
    {
      id: 'ord-4',
      orderNumber: 'ORD-98418',
      studentName: 'علیرضا اسدی',
      courseTitle: 'طراحی رابط کاربری پیشرفته',
      amount: 1200000,
      date: '۱۴۰۳/۰۸/۲۳ - ۰۹:۱۰',
      status: 'failed',
      paymentGateway: 'زرین‌پال'
    }
  ]);

  const filtered = orders.filter(o => 
    !searchTerm.trim() || o.studentName.includes(searchTerm) || o.orderNumber.includes(searchTerm) || o.courseTitle.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
            سفارش‌ها و تراکنش‌های فروش
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
            فهرست ثبت‌نام‌ها، فاکتورهای صادره و وضعیت پرداخت درگاه‌های بانکی
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-[#527683]" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="جستجو با شماره سفارش یا نام دانشجو..."
            className="w-full ps-9 pe-4 py-2 rounded-xl bg-white dark:bg-[#06242e] border border-[#ccede5] dark:border-teal-900 text-xs text-[#06242e] dark:text-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#06242e] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#ccede5] dark:border-teal-900/60 bg-[#f0fbf8] dark:bg-[#092b36] text-[11px] font-bold text-[#527683] dark:text-[#8ab5be]">
                <th className="p-4">شماره سفارش</th>
                <th className="p-4">دانشجو</th>
                <th className="p-4">دوره خریداری شده</th>
                <th className="p-4">مبلغ (تومان)</th>
                <th className="p-4">درگاه</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ccede5]/60 dark:divide-teal-900/40">
              {filtered.map(ord => (
                <tr key={ord.id} className="hover:bg-[#f0fbf8]/50 dark:hover:bg-[#082834] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#06242e] dark:text-white">
                    {ord.orderNumber}
                  </td>

                  <td className="p-4 font-bold text-[#06242e] dark:text-white">
                    {ord.studentName}
                  </td>

                  <td className="p-4 font-semibold text-[#06242e] dark:text-slate-200 line-clamp-1 max-w-xs">
                    {ord.courseTitle}
                  </td>

                  <td className="p-4 font-black text-[#0d9488] dark:text-[#5eead4]">
                    {formatTomanPrice(ord.amount)}
                  </td>

                  <td className="p-4 text-[#527683] dark:text-[#8ab5be]">
                    {ord.paymentGateway}
                  </td>

                  <td className="p-4">
                    {ord.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        <CheckCircle2 size={12} />
                        <span>موفق</span>
                      </span>
                    ) : ord.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        <Clock size={12} />
                        <span>در انتظار</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        <XCircle size={12} />
                        <span>ناموفق</span>
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-[#527683] dark:text-[#8ab5be]">
                    {ord.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
