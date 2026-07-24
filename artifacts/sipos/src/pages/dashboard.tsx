import React, { useState } from 'react';
import { 
  useGetDashboardStats, 
  useGetDashboardAktivitas, 
  useGetDashboardTopSantri, 
  useGetDashboardGrafikBulanan 
} from '@workspace/api-client-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Users, 
  AlertOctagon, 
  Award, 
  Activity,
  Calendar,
  Clock,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'wouter';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useGetDashboardAktivitas();
  const { data: topPrestasi, isLoading: topPrestasiLoading } = useGetDashboardTopSantri({ tipe: 'prestasi' });
  const { data: topPelanggaran, isLoading: topPelanggaranLoading } = useGetDashboardTopSantri({ tipe: 'pelanggaran' });
  const { data: grafik, isLoading: grafikLoading } = useGetDashboardGrafikBulanan();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Ringkasan informasi poin dan aktivitas santri.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Santri" 
          value={stats?.totalSantri} 
          subtitle={`${stats?.santriAktif || 0} aktif`}
          icon={<Users className="w-5 h-5 text-primary" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Pelanggaran Hari Ini" 
          value={stats?.pelanggaranHariIni} 
          subtitle={`${stats?.pelanggaranBulanIni || 0} bulan ini`}
          icon={<AlertOctagon className="w-5 h-5 text-destructive" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Prestasi Hari Ini" 
          value={stats?.prestasiHariIni} 
          subtitle={`${stats?.prestasiBulanIni || 0} bulan ini`}
          icon={<Award className="w-5 h-5 text-[#f59e0b]" />} 
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Aktivitas" 
          value={activities?.length || 0} 
          subtitle="Tercatat di sistem"
          icon={<Activity className="w-5 h-5 text-blue-500" />} 
          loading={activitiesLoading} 
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafik Bulanan */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              Statistik Bulanan
            </h2>
          </div>
          <div className="h-[300px] w-full">
            {grafikLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : grafik && grafik.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafik} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="bulan" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-md)',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="prestasi" name="Prestasi" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="pelanggaran" name="Pelanggaran" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data grafik
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-card border border-border rounded-xl p-0 shadow-sm flex flex-col overflow-hidden h-[390px]">
          <div className="p-5 border-b border-border flex items-center justify-between bg-card shrink-0">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Aktivitas Terbaru
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            {activitiesLoading ? (
              <div className="p-5 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="flex flex-col divide-y divide-border">
                {activities.map((act) => (
                  <div key={act.id} className="p-4 flex gap-3 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{act.userName || 'Sistem'}</span> {act.aksi}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{act.detail}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {format(parseISO(act.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full text-muted-foreground">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Tidak ada aktivitas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Santri Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Prestasi */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#f59e0b]" />
              Top 10 Prestasi
            </h2>
            <Link href="/santri" className="text-sm text-primary hover:underline font-medium">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama Santri</th>
                  <th className="px-4 py-3 text-right">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topPrestasiLoading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center">Memuat data...</td></tr>
                ) : topPrestasi && topPrestasi.length > 0 ? (
                  topPrestasi.map((santri, idx) => (
                    <tr key={santri.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-center text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/santri/${santri.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                          {santri.nama}
                        </Link>
                        <div className="text-xs text-muted-foreground">{santri.kelas} • {santri.asrama}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex font-mono items-center px-2 py-1 rounded-md bg-[#f59e0b]/10 text-[#f59e0b] font-bold">
                          +{santri.totalPoin}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Pelanggaran */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-card">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Top 10 Pelanggaran
            </h2>
            <Link href="/santri" className="text-sm text-primary hover:underline font-medium">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Nama Santri</th>
                  <th className="px-4 py-3 text-right">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topPelanggaranLoading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center">Memuat data...</td></tr>
                ) : topPelanggaran && topPelanggaran.length > 0 ? (
                  topPelanggaran.map((santri, idx) => (
                    <tr key={santri.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-center text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/santri/${santri.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                          {santri.nama}
                        </Link>
                        <div className="text-xs text-muted-foreground">{santri.kelas} • {santri.asrama}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex font-mono items-center px-2 py-1 rounded-md bg-destructive/10 text-destructive font-bold">
                          {santri.totalPoin}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, loading }: { title: string, value?: number, subtitle?: string, icon: React.ReactNode, loading: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 rounded-lg bg-muted/50">{icon}</div>
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded-md mt-1"></div>
        ) : (
          <div className="text-3xl font-bold text-foreground font-mono">{value !== undefined ? value : '-'}</div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
