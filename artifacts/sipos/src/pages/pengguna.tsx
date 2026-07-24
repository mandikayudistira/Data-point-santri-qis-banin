import React, { useState } from 'react';
import { 
  useListUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  useListSantri,
  getListUsersQueryKey,
  User,
} from '@workspace/api-client-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, ShieldAlert, KeyRound, Link2, UserCheck, UserX } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as DialogPrimitive from '@radix-ui/react-dialog';

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') + '/api';

const userSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  nama: z.string().min(1, 'Nama wajib diisi'),
  role: z.enum(['admin', 'sayyid', 'wali'] as const),
});

type UserFormValues = z.infer<typeof userSchema>;

interface LinkedSantri {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  asrama: string;
}

export default function PenggunaPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useListUsers();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [linkWaliUser, setLinkWaliUser] = useState<User | null>(null);

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleCreate = async (data: UserFormValues) => {
    try {
      await createMutation.mutateAsync({ 
        data: { ...data, password: data.password || 'password123' } 
      });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setIsAddOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleUpdate = async (data: UserFormValues) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({ 
        id: editItem.id, 
        data: { username: data.username, nama: data.nama, role: data.role, password: data.password || undefined }
      });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setEditItem(null);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setDeleteId(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">Pengguna Sistem</h1>
          <p className="text-muted-foreground text-sm">Kelola akses akun Admin, Sayyid (Ustadz), dan Wali Santri.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-5 py-4">Nama / Username</th>
                <th className="px-5 py-4">Role Hak Akses</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={3} className="px-5 py-8 text-center">Memuat data...</td></tr>
              ) : users && users.length > 0 ? (
                users.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-foreground">{item.nama}</div>
                      <div className="font-mono text-xs text-muted-foreground">{item.username}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider
                        ${item.role === 'admin' ? 'bg-primary/10 text-primary' : 
                          item.role === 'sayyid' ? 'bg-blue-500/10 text-blue-600' : 
                          'bg-[#f59e0b]/10 text-[#f59e0b]'}
                      `}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.role === 'wali' && (
                          <button
                            onClick={() => setLinkWaliUser(item)}
                            title="Hubungkan dengan Santri"
                            className="p-1.5 text-muted-foreground hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded"
                          >
                            <Link2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setEditItem(item)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {item.username !== 'admin' && (
                          <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">Belum ada data pengguna</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserDialog 
        open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Pengguna" 
        onSubmit={handleCreate} isPending={createMutation.isPending} mode="create"
      />
      {editItem && (
        <UserDialog 
          open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)} title="Edit Pengguna" 
          defaultValues={editItem} onSubmit={handleUpdate} isPending={updateMutation.isPending} mode="edit"
        />
      )}
      <DeleteConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} onConfirm={handleDelete} isPending={deleteMutation.isPending} />
      {linkWaliUser && (
        <LinkSantriDialog
          user={linkWaliUser}
          open={!!linkWaliUser}
          onOpenChange={(o) => !o && setLinkWaliUser(null)}
        />
      )}
    </div>
  );
}

// --- Link Santri Dialog ---

function LinkSantriDialog({ user, open, onOpenChange }: { user: User; open: boolean; onOpenChange: (o: boolean) => void }) {
  const queryClient = useQueryClient();
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');

  const linkedKey = ['wali-santri-links', user.id];

  const { data: linked = [], isLoading: loadingLinked } = useQuery<LinkedSantri[]>({
    queryKey: linkedKey,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/users/${user.id}/wali-santri`, { credentials: 'include' });
      if (!res.ok) throw new Error('Gagal memuat data');
      return res.json();
    },
    enabled: open,
  });

  const { data: allSantriResp } = useListSantri({ status: 'aktif' });
  const allSantri = allSantriResp?.data ?? [];

  const linkedIds = new Set(linked.map((s) => s.id));
  const available = allSantri.filter((s) => !linkedIds.has(s.id));

  const addMutation = useMutation({
    mutationFn: async (santriId: number) => {
      const res = await fetch(`${API_BASE}/users/${user.id}/wali-santri`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ santriId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Gagal menambahkan');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedKey });
      setSelectedSantriId('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (santriId: number) => {
      const res = await fetch(`${API_BASE}/users/${user.id}/wali-santri/${santriId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Gagal menghapus');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkedKey });
    },
  });

  const handleAdd = () => {
    if (!selectedSantriId) return;
    addMutation.mutate(parseInt(selectedSantriId, 10));
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-card border border-border shadow-xl rounded-xl p-0 animate-in fade-in-0 zoom-in-95">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-foreground flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#f59e0b]" />
                Hubungkan Santri
              </DialogPrimitive.Title>
              <p className="text-xs text-muted-foreground mt-0.5">Akun: <span className="font-mono font-semibold">{user.username}</span> — {user.nama}</p>
            </div>
            <DialogPrimitive.Close className="text-muted-foreground hover:bg-muted p-1.5 rounded-md">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Add new link */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tambah Santri</label>
              <div className="flex gap-2">
                <select
                  value={selectedSantriId}
                  onChange={(e) => setSelectedSantriId(e.target.value)}
                  className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">-- Pilih santri --</option>
                  {available.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.nis}) — {s.kelas}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  disabled={!selectedSantriId || addMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  {addMutation.isPending ? 'Menyimpan...' : 'Tambah'}
                </button>
              </div>
              {addMutation.isError && (
                <p className="text-xs text-destructive">{(addMutation.error as Error).message}</p>
              )}
            </div>

            {/* Currently linked */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Santri yang Terhubung</label>
              {loadingLinked ? (
                <p className="text-sm text-muted-foreground py-3 text-center">Memuat...</p>
              ) : linked.length === 0 ? (
                <div className="py-5 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  Belum ada santri yang terhubung dengan akun ini.
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {linked.map((s) => (
                    <li key={s.id} className="flex items-center justify-between px-4 py-3 bg-muted/40 border border-border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm text-foreground">{s.nama}</div>
                        <div className="text-xs text-muted-foreground font-mono">{s.nis} · {s.kelas} · {s.asrama}</div>
                      </div>
                      <button
                        onClick={() => removeMutation.mutate(s.id)}
                        disabled={removeMutation.isPending}
                        title="Putus hubungan"
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="p-5 border-t border-border flex justify-end bg-muted/10">
            <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition-colors">
              Tutup
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// --- User Form Dialog ---

function UserDialog({ open, onOpenChange, title, defaultValues, onSubmit, isPending, mode }: any) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || { role: 'sayyid' }
  });

  React.useEffect(() => {
    if (open) reset(defaultValues || { role: 'sayyid' });
  }, [open, defaultValues, reset]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-card border border-border shadow-xl rounded-xl p-0 animate-in fade-in-0 zoom-in-95">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <DialogPrimitive.Title className="text-lg font-bold text-foreground">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="text-muted-foreground hover:bg-muted p-1.5 rounded-md">
              <X className="w-5 h-5" />
            </DialogPrimitive.Close>
          </div>
          
          <div className="p-5">
            <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <input {...register('nama')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.nama && <p className="text-xs text-destructive">{errors.nama.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Username</label>
                  <input {...register('username')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                  {errors.username && <p className="text-xs text-destructive">{errors.username.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role Akses</label>
                  <select {...register('role')} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="admin">Admin</option>
                    <option value="sayyid">Sayyid (Ustadz)</option>
                    <option value="wali">Wali Santri</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 p-4 rounded-lg bg-muted/30 border border-border mt-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  Password {mode === 'edit' && <span className="text-muted-foreground font-normal">(Isi jika ingin diubah)</span>}
                </label>
                <input 
                  type="password" 
                  {...register('password')} 
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                  placeholder={mode === 'edit' ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
              </div>
            </form>
          </div>

          <div className="p-5 border-t border-border flex justify-end gap-3 bg-muted/10">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-foreground bg-background border border-border hover:bg-muted transition-colors">Batal</button>
            <button form="user-form" type="submit" disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
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
          <div className="flex items-center gap-3 mb-2 text-destructive">
            <ShieldAlert className="w-6 h-6" />
            <DialogPrimitive.Title className="text-lg font-bold">Hapus Pengguna</DialogPrimitive.Title>
          </div>
          <DialogPrimitive.Description className="text-muted-foreground mb-6">
            Apakah Anda yakin ingin menghapus akun pengguna ini? Mereka tidak akan bisa login lagi ke dalam sistem.
          </DialogPrimitive.Description>
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
