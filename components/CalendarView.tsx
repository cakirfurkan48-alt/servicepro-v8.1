'use client';

import { useState, useMemo } from 'react';
import { Service } from '@/lib/hooks';

interface CalendarViewProps {
    services: Service[];
    onServiceClick?: (service: Service) => void;
    onDateChange?: (serviceId: string, newDate: string) => void;
}

export default function CalendarView({ services, onServiceClick, onDateChange }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedService, setDraggedService] = useState<Service | null>(null);

    // Get calendar data
    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay(); // 0 = Sunday

        const days: { date: Date; services: Service[] }[] = [];

        // Previous month padding
        for (let i = 0; i < startDay; i++) {
            const d = new Date(year, month, -startDay + i + 1);
            days.push({ date: d, services: [] });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const dateStr = d.toISOString().split('T')[0];
            const dayServices = services.filter(s => s.scheduledDate === dateStr);
            days.push({ date: d, services: dayServices });
        }

        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            days.push({ date: d, services: [] });
        }

        return days;
    }, [currentDate, services]);

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const dayNames = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDragStart = (e: React.DragEvent, service: Service) => {
        setDraggedService(service);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', service.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        if (draggedService && onDateChange) {
            const newDateStr = date.toISOString().split('T')[0];
            if (draggedService.scheduledDate !== newDateStr) {
                onDateChange(draggedService.id, newDateStr);
            }
        }
        setDraggedService(null);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="btn btn-secondary" onClick={prevMonth}>◀</button>
                <div className="calendar-title">
                    <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <button className="btn btn-primary btn-sm" onClick={goToToday}>Bugün</button>
                </div>
                <button className="btn btn-secondary" onClick={nextMonth}>▶</button>
            </div>

            <div className="calendar-grid">
                {/* Day headers */}
                {dayNames.map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                ))}

                {/* Calendar days */}
                {calendarData.map((day, idx) => (
                    <div
                        key={idx}
                        className={`calendar-day ${isToday(day.date) ? 'today' : ''} ${!isCurrentMonth(day.date) ? 'other-month' : ''}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day.date)}
                    >
                        <div className="day-number">{day.date.getDate()}</div>
                        <div className="day-services">
                            {day.services.slice(0, 3).map(service => (
                                <div
                                    key={service.id}
                                    className="calendar-service"
                                    style={{
                                        backgroundColor: service.statusColor + '30',
                                        borderLeft: `3px solid ${service.statusColor}`,
                                    }}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, service)}
                                    onClick={() => onServiceClick?.(service)}
                                    title={`${service.boatName} - ${service.statusLabel}`}
                                >
                                    <span className="service-boat">{service.boatName}</span>
                                    {service.scheduledTime && (
                                        <span className="service-time">{service.scheduledTime}</span>
                                    )}
                                </div>
                            ))}
                            {day.services.length > 3 && (
                                <div className="more-services">
                                    +{day.services.length - 3} daha
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
