'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const dataIncome = [
    { name: 'Pzt', gelir: 4000 },
    { name: 'Sal', gelir: 3000 },
    { name: 'Çar', gelir: 2000 },
    { name: 'Per', gelir: 2780 },
    { name: 'Cum', gelir: 1890 },
    { name: 'Cmt', gelir: 2390 },
    { name: 'Paz', gelir: 3490 },
];

const dataStatus = [
    { name: 'Tamamlandı', value: 400, color: '#10b981' },
    { name: 'Devam Eden', value: 300, color: '#3b82f6' },
    { name: 'Bekleyen', value: 300, color: '#f59e0b' },
];

export default function DashboardCharts() {
    return (
        <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Gelir Grafiği */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">
                    Haftalık Performans
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataIncome}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `₺${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="gelir"
                                fill="#0ea5e9"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Durum Grafiği */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">
                    İş Durum Dağılımı
                </h3>
                <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                    {dataStatus.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
