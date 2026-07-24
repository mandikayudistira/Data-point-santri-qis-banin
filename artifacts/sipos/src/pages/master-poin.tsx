import React, { useState } from 'react';
import { 
  useListMasterPelanggaran, 
  useCreateMasterPelanggaran, 
  useUpdateMasterPelanggaran, 
  useDeleteMasterPelanggaran,
  useListMasterPrestasi, 
  useCreateMasterPrestasi, 
  useUpdateMasterPrestasi, 
  useDeleteMasterPrestasi,
  getListMasterPelanggaranQueryKey,
  getListMasterPrestasiQueryKey,
  MasterPelanggaran,
  MasterPrestasi
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, AlertOctagon, Award } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';

const masterSchema = z.object({
  kode: z.string().min(1, 'Kode wajib diisi'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  poin: z.coerce.number().min(1, 'Poin harus lebih dari 0'),
  keterangan: z.string().optional(),
});

type MasterFormValues = z.infer<typeof masterSchema>;

export default function MasterPoinPage() {
  const [activeTab, setActiveTab] = useState('pelanggaran');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Master Poin</h1>
        <p className="text-muted-foreground text-sm">Kelola daftar aturan pelanggaran dan prestasi beserta bobot poinnya.</p>
      </div>

      <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <TabsPrimitive.List className="flex w-full sm:w-fit bg-muted p-1 rounded-xl">
          <TabsPrimitive.Trigger 
            value="pelanggaran" 
            className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            Pelanggaran
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger 
            value="prestasi" 
            className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            Prestasi
          </TabsPrimitive.Trigger>
        </TabsPrimitive.List>

        <TabsPrimitive.Content value="pelanggaran" className="focus:outline-none">
          <MasterPelanggaranTab />
        </TabsPrimitive.Content>

        <TabsPrimitive.Content value="prestasi" className="focus:outline-none">
          <MasterPrestasiTab />
        </TabsPrimitive.Content>
      </TabsPrimitive.Root>
    </div>
  );
}

function MasterPelanggaranTab() {
  const queryClient = useQueryClient();
  const { data: masters, isLoading } = useListMasterPelanggaran();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MasterPelanggaran | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const createMutation = useCreateMasterPelanggaran();
  const updateMutation = useUpdateMasterPelanggaran();
  const deleteMutation = useDeleteMasterPelanggaran();

  const handleCreate = async (data: MasterFormValues) => {
    try {
      await createMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: getListMasterPelanggaranQueryKey() });
      setIsAddOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (data: MasterFormValues) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({ id: editItem.id, data });
      queryClient.invalidateQueries({ queryKey: getListMasterPelanggaranQueryKey() });
      setEditItem(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getListMasterPelanggaranQueryKey() });
      setDeleteId(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
        <h2 className="font-bold text-foreground">Daftar Pelanggaran</h2>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Pelanggaran
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-5 py-3 w-24">Kode</th>
              <th className="px-5 py-3">Nama Pelanggaran</th>
              <th className="px-5 py-3">Keterangan</th>
              <th className="px-5 py-3 text-right">Poin</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center">Memuat data...</td></tr>
            ) : masters && masters.length > 0 ? (
              masters.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-muted-foreground font-semibold">{item.kode}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{item.nama}</td>
                  <td className="px-5 py-3 text-muted-foreground max-w-[300px] truncate">{item.keterangan || '-'}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex font-mono items-center px-2 py-1 rounded bg-destructive/10 text-destructive font-bold">
                      {item.poin}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditItem(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <MasterDialog 
        open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Master Pelanggaran" 
        onSubmit={handleCreate} isPending={createMutation.isPending} type="pelanggaran"
      />
      {editItem && (
        <MasterDialog 
          open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Master Pelanggaran" 
          defaultValues={editItem} onSubmit={handleUpdate} isPending={updateMutation.isPending} type="pelanggaran"
        />
      )}
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} isPending={deleteMutation.isPending} />
    </div>
  );
}

function MasterPrestasiTab() {
  const queryClient = useQueryClient();
  const { data: masters, isLoading } = useListMasterPrestasi();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MasterPrestasi | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const createMutation = useCreateMasterPrestasi();
  const updateMutation = useUpdateMasterPrestasi();
  const deleteMutation = useDeleteMasterPrestasi();

  const handleCreate = async (data: MasterFormValues) => {
    try {
      await createMutation.mutateAsync({ data });
      queryClient.invalidateQueries({ queryKey: getListMasterPrestasiQueryKey() });
      setIsAddOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (data: MasterFormValues) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({ id: editItem.id, data });
      queryClient.invalidateQueries({ queryKey: getListMasterPrestasiQueryKey() });
      setEditItem(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getListMasterPrestasiQueryKey() });
      setDeleteId(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
        <h2 className="font-bold text-foreground">Daftar Prestasi</h2>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#f59e0b] text-white hover:bg-[#f59e0b]/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Prestasi
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-5 py-3 w-24">Kode</th>
              <th className="px-5 py-3">Nama Prestasi</th>
              <th className="px-5 py-3">Keterangan</th>
              <th className="px-5 py-3 text-right">Poin</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center">Memuat data...</td></tr>
            ) : masters && masters.length > 0 ? (
              masters.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-muted-foreground font-semibold">{item.kode}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{item.nama}</td>
                  <td className="px-5 py-3 text-muted-foreground max-w-[300px] truncate">{item.keterangan || '-'}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex font-mono items-center px-2 py-1 rounded bg-[#f59e0b]/10 text-[#f59e0b] font-bold">
                      +{item.poin}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditItem(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <MasterDialog 
        open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Master Prestasi" 
        onSubmit={handleCreate} isPending={createMutation.isPending} type="prestasi"
      />
      {editItem && (
        <MasterDialog 
          open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Master Prestasi" 
          defaultValues={editItem} onSubmit={handleUpdate} isPending={updateMutation.isPending} type="prestasi"
        />
      )}
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} isPending={deleteMutation.isPending} />
    </div>
  );
}

function MasterDialog({ open, onOpenChange, title, defaultValues, onSubmit, isPending, type }: any) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MasterFormValues>({
    resolver: zodResolver(masterSchema),
    defaultValues: defaultValues || { poin: 10 }
  });

  React.useEffect(() => {
    if (open) reset(defaultValues || { poin: 10 });
  }, [open, defaultValues, reset]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-card border border-border shadow-xl rounded-xl p-0 animate-in fade-in-0 zoom-in-95">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-bold text-foreground flex items-center gap-2">
              {type === 'pelanggaran' ? <AlertOctagon className="w-5 h-5 text-destructive"/> : <Award className="w-5 h-5 text-[#f59e0b]"/>}
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-muted-foreground hover:bg-muted p-1.5 rounded-md">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>
          
          <div className="p-5">
            <form id="master-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-sm font-medium">Kode</label>
                  <input {...register('kode')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" placeholder="PLG01" />
                  {errors.kode && <p className="text-xs text-destructive">{errors.kode.message as string}</p>}
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium">Bobot Poin</label>
                  <input type="number" {...register('poin')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                  {errors.poin && <p className="text-xs text-destructive">{errors.poin.message as string}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nama Aturan</label>
                <input {...register('nama')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Misal: Terlambat sholat jamaah" />
                {errors.nama && <p className="text-xs text-destructive">{errors.nama.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Keterangan</label>
                <textarea {...register('keterangan')} rows={3} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </form>
          </div>

          <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/10">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition-colors">Batal</button>
            <button form="master-form" type="submit" disabled={isPending} className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${type === 'pelanggaran' ? 'bg-destructive hover:bg-destructive/90' : 'bg-[#f59e0b] hover:bg-[#f59e0b]/90'}`}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DeleteConfirmDialog({ open, onOpenChange, onConfirm, isPending }: any) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-card border border-border shadow-xl rounded-xl p-6 animate-in fade-in-0 zoom-in-95">
          <DialogPrimitive.Title className="text-lg font-bold text-foreground mb-2">Hapus Aturan</DialogPrimitive.Title>
          <DialogPrimitive.Description className="text-muted-foreground mb-6">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</DialogPrimitive.Description>
          <div className="flex justify-end gap-3">
            <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors">Batal</button>
            <button onClick={onConfirm} disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors disabled:opacity-50">
              {isPending ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
