import React from 'react';
import { 
  useGetSantri,
  useListRiwayatPoin,
  useDeleteRiwayatPoin,
  getGetSantriQueryKey,
  getListRiwayatPoinQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Award, 
  AlertOctagon, 
  Download,
  Trash2,
  CalendarDays
} from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export default function SantriDetail() {
  const { id: santriIdStr } = useParams();
  const santriId = Number(santriIdStr);
  const queryClient = useQueryClient();

  const { data: santri, isLoading: santriLoading } = useGetSantri(santriId, {
    query: { enabled: !!santriId, queryKey: getGetSantriQueryKey(santriId) }
  });

  const { data: riwayat, isLoading: riwayatLoading } = useListRiwayatPoin({ santriId }, {
    query: { enabled: !!santriId, queryKey: getListRiwayatPoinQueryKey({ santriId }) }
  });

  const deleteMutation = useDeleteRiwayatPoin();
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  const handleDeleteRiwayat = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getGetSantriQueryKey(santriId) });
      queryClient.invalidateQueries({ queryKey: getListRiwayatPoinQueryKey({ santriId }) });
      setDeleteId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (!riwayat || !santri) return;
    const headers = ['Tanggal', 'Tipe', 'Kode/Nama Poin', 'Keterangan', 'Poin', 'Diinput Oleh'];
    const csvContent = [
      headers.join(','),
      ...riwayat.map(r => [
        format(parseISO(r.tanggal), 'yyyy-MM-dd HH:mm'),
        r.tipe,
        `"${r.masterNama || '-'}"`,
        `"${r.keterangan || '-'}"`,
        r.poin,
        `"${r.createdBy || 'Sistem'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riwayat_poin_${santri.nis}_${santri.nama.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  if (santriLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Memuat data santri...</p>
      </div>
    );
  }

  if (!santri) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <User className="w-12 h-12 text-muted-foreground/30" />
        <h2 className="text-xl font-bold">Santri Tidak Ditemukan</h2>
        <Link href="/santri" className="text-primary hover:underline">Kembali ke daftar santri</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/santri" className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            {santri.nama}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize
              ${santri.status === 'aktif' ? 'bg-primary/10 text-primary' : 
                santri.status === 'nonaktif' ? 'bg-destructive/10 text-destructive' : 
                'bg-muted text-muted-foreground'}
            `}>
              {santri.status}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm font-mono">{santri.nis}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl">
                {santri.nama.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground font-medium mb-1">Total Poin</div>
                <div className={`text-3xl font-bold font-mono ${santri.totalPoin < 0 ? 'text-destructive' : 'text-foreground'}`}>
                  {santri.totalPoin}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Kelas & Asrama</div>
                  <div className="text-muted-foreground">Kelas {santri.kelas} • Asrama {santri.asrama} {santri.kamar ? `Kamar ${santri.kamar}` : ''}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Tempat, Tgl Lahir</div>
                  <div className="text-muted-foreground">{santri.ttl || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">Orang Tua / Wali</div>
                  <div className="text-muted-foreground">{santri.namaOrtu || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">No HP (WA)</div>
                  <div className="text-muted-foreground">{santri.noHp || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/pelanggaran" className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 py-2.5 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-colors border border-destructive/20">
              <AlertOctagon className="w-4 h-4" />
              Catat Pelanggaran
            </Link>
            <Link href="/prestasi" className="flex-1 bg-primary/10 text-primary hover:bg-primary/20 py-2.5 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-colors border border-primary/20">
              <Award className="w-4 h-4" />
              Catat Prestasi
            </Link>
          </div>
        </div>

        {/* Riwayat Table */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center bg-card shrink-0">
            <h2 className="text-lg font-bold text-foreground">Riwayat Poin</h2>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-sm text-foreground bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border sticky top-0">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Keterangan</th>
                  <th className="px-5 py-3 text-right">Poin</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {riwayatLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">Memuat riwayat...</td>
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
                        <div className="text-xs text-muted-foreground/60 mt-1 ml-4 italic">Oleh: {r.createdBy || 'Sistem'}</div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md font-bold text-xs ${
                          r.tipe === 'prestasi' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {r.tipe === 'prestasi' ? '+' : ''}{r.poin}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Hapus riwayat ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                      Belum ada riwayat poin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Delete Confirm */}
      <DialogPrimitive.Root open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-card border border-border shadow-xl rounded-xl p-6 animate-in fade-in-0 zoom-in-95">
            <DialogPrimitive.Title className="text-lg font-bold text-foreground mb-2">
              Hapus Riwayat Poin
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus riwayat poin ini? Poin santri akan dikalkulasi ulang secara otomatis.
            </DialogPrimitive.Description>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteRiwayat}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

    </div>
  );
}
