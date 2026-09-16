import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Bell, CheckCheck, Inbox, Clock, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../../utils/persian';

export const NotificationsTab: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#071e28] rounded-2xl p-5 border border-teal-100/80 dark:border-teal-900/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/60 shadow-xs">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>پیام‌ها و اعلان‌های سیستم</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
                    {toPersianDigits(unreadCount)} جدید
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مشاهده وضعیت سفارشات، فعال‌سازی اشتراک، دوره‌ها و رویدادهای حساب کاربری
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-xl border border-teal-200 dark:border-teal-800 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <CheckCheck size={16} />
              <span>علامت‌گذاری همه به عنوان خوانده‌شده</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#0d9488] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            همه ({toPersianDigits(notifications.length)})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#0d9488] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            خوانده‌نشده ({toPersianDigits(unreadCount)})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-[#071e28] rounded-2xl p-12 text-center border border-dashed border-teal-200 dark:border-teal-900">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
            <Inbox size={28} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            {filter === 'unread' ? 'پیام خوانده‌نشده‌ای وجود ندارد' : 'هیچ پیام یا اعلانی ثبت نشده است'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            کلیه اخبار، تغییرات اشتراک، تخفیف‌های ویژه و تراکنش‌های حساب کاربری به صورت لحظه‌ای در این صفحه به اطلاع شما می‌رسد.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => markNotificationAsRead(notification.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                notification.read
                  ? 'bg-white dark:bg-[#071e28] border-slate-200/80 dark:border-slate-800 opacity-80 hover:opacity-100'
                  : 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notification.read
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      : 'bg-teal-500 text-white shadow-xs'
                  }`}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock size={12} />
                    <span>{notification.createdAt}</span>
                  </span>
                  {!notification.read && (
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline">
                      علامت‌گذاری به عنوان خوانده‌شده
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
