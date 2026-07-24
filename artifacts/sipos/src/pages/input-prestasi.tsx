import React, { useState } from 'react';
import { 
  useListSantri, 
  useListMasterPrestasi, 
  useCreateRiwayatPoin,
  RiwayatPoinInputTipe
} from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Award, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  santriId: z.coerce.number().min(1, 'Pilih santri'),
  masterId: z.coerce.number().min(1, 'Pilih prestasi'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  keterangan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InputPrestasiPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { data: santris, isLoading: santrisLoading } = useListSantri({ status: 'aktif' });
  const { data: masters, isLoading: mastersLoading } = useListMasterPrestasi();
  
  const createMutation = useCreateRiwayatPoin();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tanggal: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    }
  });

  const selectedMasterId = watch('masterId');
  const selectedMaster = masters?.find(m => m.id === selectedMasterId);

  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync({
        data: {
          santriId: data.santriId,
          masterId: data.masterId,
          tipe: RiwayatPoinInputTipe.prestasi,
          tanggal: new Date(data.tanggal).toISOString(),
          keterangan: data.keterangan,
        }
      });
      setSuccess(true);
      reset({
        santriId: 0,
        masterId: 0,
        tanggal: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        keterangan: ''
      });
      setTimeout(() => setSuccess(false), 3000);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/santri'] });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-[#f59e0b]" />
          Input Prestasi
        </h1>
        <p className="text-muted-foreground text-sm">Catat prestasi santri baru. Poin akan otomatis menambah total poin santri.</p>
      </div>

      {success && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Prestasi berhasil dicatat.</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Pilih Santri <span className="text-destructive">*</span>
            </label>
            <select
              {...register('santriId')}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={santrisLoading}
            >
              <option value="0">-- Pilih Santri --</option>
              {santris?.map(s => (
                <option key={s.id} value={s.id}>{s.nis} - {s.nama} ({s.kelas} {s.asrama})</option>
              ))}
            </select>
            {errors.santriId && <span className="text-xs text-destructive">{errors.santriId.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Prestasi <span className="text-destructive">*</span>
            </label>
            <select
              {...register('masterId')}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={mastersLoading}
            >
              <option value="0">-- Pilih Prestasi --</option>
              {masters?.map(m => (
                <option key={m.id} value={m.id}>[{m.kode}] {m.nama}</option>
              ))}
            </select>
            {errors.masterId && <span className="text-xs text-destructive">{errors.masterId.message}</span>}
            
            {selectedMaster && (
              <div className="mt-2 p-3 bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b]/20 text-sm flex justify-between">
                <span className="text-muted-foreground">Poin yang didapat:</span>
                <span className="font-bold font-mono text-[#f59e0b]">+{selectedMaster.poin}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Tanggal & Waktu <span className="text-destructive">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('tanggal')}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.tanggal && <span className="text-xs text-destructive">{errors.tanggal.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Keterangan Tambahan
            </label>
            <textarea
              {...register('keterangan')}
              rows={3}
              placeholder="Detail kegiatan..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                setLocation('/dashboard');
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-foreground bg-muted hover:bg-muted/80 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Prestasi'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
