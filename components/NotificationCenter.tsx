'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icon';
import Link from 'next/link';

// Mock Notification Data
const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: 'Yeni İş Atandı',
        message: 'M/Y Serenity teknemiz için motor bakımı atandı.',
        time: '5 dk önce',
        read: false,
        type: 'info',
        link: '/servis/123'
    },
    {
        id: 2,
        title: 'Parça Geldi',
        message: 'Jeneratör filtresi stoğa girdi.',
        time: '1 saat önce',
        read: false,
        type: 'success',
        link: '/ozet'
    },
    {
        id: 3,
        title: 'Acil Durum',
        message: 'Bilge pompası arızası bildirildi!',
        time: '2 saat önce',
        read: true,
        type: 'error',
        link: '/servis/124'
    }
];

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                <Icon name="bell" size="md" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Bildirimler</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                >
                                    Tümünü Okundu İşaretle
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Icon name="bell" size="lg" className="mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Bildiriminiz yok.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notification.type === 'error' ? 'bg-red-500' :
                                                        notification.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                                    }`} />
                                                <div className="flex-1 space-y-1">
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => {
                                                            markAsRead(notification.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="block"
                                                    >
                                                        <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                            {notification.message}
                                                        </p>
                                                    </Link>
                                                    <span className="text-[10px] text-slate-400">{notification.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
