import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Clock, ArrowUpRight, Plus, Building2 } from 'lucide-react';
import { toPersianDigits, formatTomanPrice } from '../../../utils/persian';

interface PayoutRecord {
  id: string;
  instructorName: string;
  amount: number;
  shebaNumber: string;
  bankName: string;
  requestDate: string;
  status: 'paid' | 'pending';
}

export const PayoutsManagerTab: React.FC = () => {
  const [payouts] = useState<PayoutRecord[]>([
    {
      id: 'pay-1',
      instructorName: 'النا رضایی',
      amount: 14200000,
      shebaNumber: 'IR480170000000109283746501',
      bankName: 'بانک ملت',
      requestDate: '۱۴۰۳/۰۸/۲۲',
      status: 'paid'
    },
    {
      id: 'pay-2',
      instructorName: 'دکتر هومن خسروی',
      amount: 28500000,
      shebaNumber: 'IR820120000000889922331102',
      bankName: 'بانک سامان',
      requestDate: '۱۴۰۳/۰۸/۲۴',
      status: 'pending'
    },
    {
      id: 'pay-3',
      instructorName: 'سارا تهرانی',
      amount: 9800000,
      shebaNumber: 'IR190560000000778899445503',
      bankName: 'بانک پاسارگاد',
      requestDate: '۱۴۰۳/۰۸/۱۹',
      status: 'paid'
    }
  ]);

  return (
    <div className="space-y-6 text-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#06242e] dark:text-white">
            تسویه‌حساب و پرداخت‌های اساتید
          </h2>
          <p className="text-xs text-[#527683] dark:text-[#8ab5be] mt-0.5">
            محاسبه سهم مدرسین، پیگیری واریز به شماره شبا و گزارشات مالی پایا/ساتنا
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0b3b49] dark:bg-[#5eead4] text-white dark:text-[#06242e] text-xs font-extrabold shadow-sm transition-all cursor-pointer">
          <Plus size={16} />
          <span>ثبت درخواست تسویه جدید</span>
        </button>
      </div>

      {/* Payouts Table */}
      <div className="bg-white dark:bg-[#06242e] rounded-2xl border border-[#ccede5] dark:border-teal-900/60 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#ccede5] dark:border-teal-900/60 bg-[#f0fbf8] dark:bg-[#092b36] text-[11px] font-bold text-[#527683] dark:text-[#8ab5be]">
                <th className="p-4">استاد / ذینفع</th>
                <th className="p-4">مبلغ تسویه (تومان)</th>
                <th className="p-4">بانک و شماره شبا</th>
                <th className="p-4">تاریخ درخواست</th>
                <th className="p-4">وضعیت انتقال</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ccede5]/60 dark:divide-teal-900/40">
              {payouts.map(pay => (
                <tr key={pay.id} className="hover:bg-[#f0fbf8]/50 dark:hover:bg-[#082834] transition-colors">
                  <td className="p-4 font-bold text-[#06242e] dark:text-white">
                    {pay.instructorName}
                  </td>

                  <td className="p-4 font-black text-[#0d9488] dark:text-[#5eead4]">
                    {formatTomanPrice(pay.amount)}
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-[#06242e] dark:text-white">{pay.bankName}</div>
                      <div className="font-mono text-[10px] text-[#527683] dark:text-[#8ab5be]" dir="ltr">
                        {pay.shebaNumber}
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-[#527683] dark:text-[#8ab5be]">
                    {pay.requestDate}
                  </td>

                  <td className="p-4">
                    {pay.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        <CheckCircle2 size={12} />
                        <span>واریز شده ✓</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        <Clock size={12} />
                        <span>در صف واریز پایا</span>
                      </span>
                    )}
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
