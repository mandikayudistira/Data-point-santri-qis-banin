import React, { useState, useRef, useEffect } from 'react';
import { 
  useListSantri, 
  useCreateSantri, 
  useUpdateSantri, 
  useDeleteSantri,
  getListSantriQueryKey,
  Santri,
  SantriInput,
  SantriUpdate
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, Plus, Edit2, Trash2, MoreVertical, X, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';

const santriSchema = z.object({
  nis: z.string().min(1, 'NIS wajib diisi'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  ttl: z.string().optional(),
  jenisKelamin: z.enum(['L', 'P']).optional(),
  kelas: z.string().min(1, 'Kelas wajib diisi'),
  kamar: z.string().optional(),
  asrama: z.string().min(1, 'Asrama wajib diisi'),
  namaOrtu: z.string().optional(),
  noHp: z.string().optional(),
  status: z.enum(['aktif', 'nonaktif', 'alumni']).default('aktif'),
});

type SantriFormValues = z.infer<typeof santriSchema>;

export default function SantriList() {
  const [search, setSearch] = useState('');
  const [kelas, setKelas] = useState('');
  const [asrama, setAsrama] = useState('');
  const queryClient = useQueryClient();

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [search]);

  const { data: santris, isLoading } = useListSantri(
    { search: debouncedSearch, kelas, asrama },
    { query: { queryKey: getListSantriQueryKey({ search: debouncedSearch, kelas, asrama }) } }
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSantri, setEditSantri] = useState<Santri | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const createMutation = useCreateSantri();
  const updateMutation = useUpdateSantri();
  const deleteMutation = useDeleteSantri();

  const handleCreate = async (data: SantriFormValues) => {
    try {
      await createMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: getListSantriQueryKey() });
      setIsAddOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (data: SantriFormValues) => {
    if (!editSantri) return;
    try {
      await updateMutation.mutateAsync({ id: editSantri.id, data });
      queryClient.invalidateQueries({ queryKey: getListSantriQueryKey() });
      setEditSantri(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getListSantriQueryKey() });
      setDeleteId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Santri</h1>
          <p className="text-muted-foreground text-sm">Kelola daftar santri aktif dan alumni.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          data-testid="button-add-santri"
        >
          <Plus className="w-4 h-4" />
          Tambah Santri
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 bg-muted/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="bg-background border border-input rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            >
              <option value="">Semua Kelas</option>
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
            </select>
            <select
              value={asrama}
              onChange={(e) => setAsrama(e.target.value)}
              className="bg-background border border-input rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            >
              <option value="">Semua Asrama</option>
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-5 py-3">NIS</th>
                <th className="px-5 py-3">Nama Lengkap</th>
                <th className="px-5 py-3">Kelas</th>
                <th className="px-5 py-3">Asrama</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Poin</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : santris && santris.length > 0 ? (
                santris.map((santri) => (
                  <tr key={santri.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-muted-foreground">{santri.nis}</td>
                    <td className="px-5 py-3 font-semibold text-foreground">
                      <Link href={`/santri/${santri.id}`} className="hover:text-primary hover:underline">
                        {santri.nama}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{santri.kelas}</td>
                    <td className="px-5 py-3">{santri.asrama} {santri.kamar ? `- ${santri.kamar}` : ''}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                        ${santri.status === 'aktif' ? 'bg-primary/10 text-primary' : 
                          santri.status === 'nonaktif' ? 'bg-destructive/10 text-destructive' : 
                          'bg-muted text-muted-foreground'}
                      `}>
                        {santri.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-mono font-bold ${santri.totalPoin < 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {santri.totalPoin}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditSantri(santri)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteId(santri.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    Tidak ada data santri yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <SantriDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        title="Tambah Santri Baru" 
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      {/* Edit Dialog */}
      {editSantri && (
        <SantriDialog 
          open={!!editSantri} 
          onOpenChange={(o) => !o && setEditSantri(null)} 
          title="Edit Data Santri" 
          defaultValues={{
            ...editSantri,
            ttl: editSantri.ttl ?? undefined,
            jenisKelamin: editSantri.jenisKelamin === 'L' || editSantri.jenisKelamin === 'P'
              ? editSantri.jenisKelamin
              : undefined,
            kamar: editSantri.kamar ?? undefined,
            namaOrtu: editSantri.namaOrtu ?? undefined,
            noHp: editSantri.noHp ?? undefined,
          }}
          onSubmit={handleUpdate}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete Confirm */}
      <DialogPrimitive.Root open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-card border border-border shadow-xl rounded-xl p-6 animate-in fade-in-0 zoom-in-95">
            <DialogPrimitive.Title className="text-lg font-bold text-foreground mb-2">
              Hapus Santri
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-muted-foreground mb-6">
              Apakah Anda yakin ingin menghapus data santri ini? Tindakan ini tidak dapat dibatalkan.
            </DialogPrimitive.Description>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
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

// Dialog Component for Form
function SantriDialog({ 
  open, 
  onOpenChange, 
  title, 
  defaultValues, 
  onSubmit, 
  isPending 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  title: string; 
  defaultValues?: Partial<SantriFormValues>; 
  onSubmit: (data: SantriFormValues) => void; 
  isPending: boolean;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SantriFormValues>({
    resolver: zodResolver(santriSchema),
    defaultValues: defaultValues || { status: 'aktif' }
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      reset(defaultValues || { status: 'aktif', jenisKelamin: 'L' });
    }
  }, [open, defaultValues, reset]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-card border border-border shadow-xl rounded-xl p-0 animate-in fade-in-0 zoom-in-95 max-h-[90dvh] flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
            <DialogPrimitive.Title className="text-lg font-bold text-foreground">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-muted-foreground hover:bg-muted p-1.5 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>
          
          <div className="overflow-y-auto p-5">
            <form id="santri-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground">NIS <span className="text-destructive">*</span></label>
                  <input {...register('nis')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {errors.nis && <p className="text-xs text-destructive">{errors.nis.message}</p>}
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select {...register('status')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring capitalize">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nama Lengkap <span className="text-destructive">*</span></label>
                <input {...register('nama')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Jenis Kelamin</label>
                  <select {...register('jenisKelamin')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tempat, Tanggal Lahir</label>
                  <input {...register('ttl')} placeholder="Pati, 01 Januari 2005" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Kelas <span className="text-destructive">*</span></label>
                  <input {...register('kelas')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {errors.kelas && <p className="text-xs text-destructive">{errors.kelas.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Asrama <span className="text-destructive">*</span></label>
                  <select {...register('asrama')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Putra">Putra</option>
                    <option value="Putri">Putri</option>
                  </select>
                  {errors.asrama && <p className="text-xs text-destructive">{errors.asrama.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Kamar</label>
                  <input {...register('kamar')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nama Orang Tua/Wali</label>
                  <input {...register('namaOrtu')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">No HP (WA)</label>
                  <input {...register('noHp')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </form>
          </div>

          <div className="p-5 border-t border-border flex justify-end gap-3 shrink-0 bg-muted/10">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              form="santri-form"
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
