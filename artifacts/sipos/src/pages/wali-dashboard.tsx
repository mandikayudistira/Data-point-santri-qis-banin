import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { 
  useGetSantri, 
  useListRiwayatPoin,
  getGetSantriQueryKey,
  getListRiwayatPoinQueryKey
} from '@workspace/api-client-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  User, 
  MapPin, 
  Award, 
  AlertOctagon, 
  CalendarDays,
  ShieldCheck
} from 'lucide-react';

export default function WaliDashboard() {
  const { user } = useAuth();
  
  // A Wali might have multiple children. We display the first one for simplicity,
  // or we could loop. Since the UI usually focuses on one child at a time in dashboards,
  // we map through them if there are multiple.
  const childIds = user?.waliSantriIds || [];

  if (childIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mb-2">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Data Santri Tidak Ditemukan</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Akun Anda belum dihubungkan dengan data santri manapun. Silakan hubungi administrator pesantren.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Wali Santri</h1>
        <p className="text-muted-foreground text-sm">Pantau perkembangan poin kedisiplinan dan prestasi putra/putri Anda.</p>
      </div>

      {childIds.map(childId => (
        <ChildProfile key={childId} santriId={childId} />
      ))}
    </div>
  );
}

function ChildProfile({ santriId }: { santriId: number }) {
  const { data: santri, isLoading: santriLoading } = useGetSantri(santriId, {
    query: { enabled: !!santriId, queryKey: getGetSantriQueryKey(santriId) }
  });

  const { data: riwayat, isLoading: riwayatLoading } = useListRiwayatPoin({ santriId }, {
    query: { enabled: !!santriId, queryKey: getListRiwayatPoinQueryKey({ santriId }) }
  });

  if (santriLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 flex justify-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground text-sm font-medium">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (!santri) return null;

  const totalPrestasi = riwayat?.filter(r => r.tipe === 'prestasi').reduce((sum, r) => sum + r.poin, 0) || 0;
  const totalPelanggaran = riwayat?.filter(r => r.tipe === 'pelanggaran').reduce((sum, r) => sum + r.poin, 0) || 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Profile & Summary */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-primary/5 z-0" />
          
          <div className="relative z-10 flex flex-col items-center text-center mt-4">
            <div className="w-24 h-24 rounded-full bg-background border-4 border-card shadow-sm flex items-center justify-center font-bold text-4xl text-primary mb-4 relative">
              {santri.nama.charAt(0).toUpperCase()}
              {santri.totalPoin > 0 && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#f59e0b] rounded-full flex items-center justify-center text-white border-2 border-card shadow-sm">
                  <Award className="w-4 h-4" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">{santri.nama}</h2>
            <div className="text-sm font-mono text-muted-foreground mb-4">{santri.nis}</div>
            
            <div className="w-full grid grid-cols-2 gap-3 mb-6">
              <div className="bg-background border border-border rounded-lg p-3 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Kelas</span>
                <span className="font-semibold">{santri.kelas}</span>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 flex flex-col">
                <span className="text-xs text-muted-foreground mb-1">Asrama</span>
                <span className="font-semibold">{santri.asrama} {santri.kamar ? `(${santri.kamar})` : ''}</span>
              </div>
            </div>
            
            <div className="w-full bg-primary/10 border border-primary/20 rounded-xl p-5 flex flex-col items-center justify-center">
              <span className="text-sm font-medium text-primary mb-1">Total Poin Saat Ini</span>
              <span className={`text-4xl font-bold font-mono ${santri.totalPoin < 0 ? 'text-destructive' : 'text-foreground'}`}>
                {santri.totalPoin}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-5 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="w-4 h-4 text-[#f59e0b]" />
              Poin Prestasi
            </div>
            <span className="text-2xl font-bold text-[#f59e0b] font-mono">+{totalPrestasi}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertOctagon className="w-4 h-4 text-destructive" />
              Poin Pelanggaran
            </div>
            <span className="text-2xl font-bold text-destructive font-mono">-{totalPelanggaran}</span>
          </div>
        </div>
      </div>

      {/* Riwayat Table */}
      <div className="lg:w-2/3 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2 bg-card shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Catatan Poin Terbaru</h2>
        </div>
        
        <div className="flex-1 overflow-auto max-h-[600px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border sticky top-0">
              <tr>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Keterangan</th>
                <th className="px-5 py-3 text-right">Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {riwayatLoading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">Memuat riwayat...</td>
                </tr>
              ) : riwayat && riwayat.length > 0 ? (
                riwayat.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {format(parseISO(r.tanggal), 'dd MMM yyyy', { locale: id })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(r.tanggal), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${r.tipe === 'prestasi' ? 'bg-[#f59e0b]' : 'bg-destructive'}`} />
                        <span className="font-semibold text-foreground">{r.masterNama || '-'}</span>
                      </div>
                      {r.keterangan && <div className="text-muted-foreground text-xs mt-1 ml-4">{r.keterangan}</div>}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md font-bold text-xs ${
                        r.tipe === 'prestasi' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {r.tipe === 'prestasi' ? '+' : ''}{r.poin}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center flex flex-col items-center text-muted-foreground">
                    <CalendarDays className="w-8 h-8 mb-2 opacity-20" />
                    Belum ada catatan kedisiplinan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
