import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin, getGetMeQueryKey } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';

const loginSchema = z.object({
  username: z.string().min(1, 'Username diperlukan'),
  password: z.string().min(1, 'Password diperlukan'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await loginMutation.mutateAsync({ data });
      queryClient.setQueryData(getGetMeQueryKey(), user);
      
      if (user.role === 'wali') {
        setLocation('/wali-dashboard');
      } else {
        setLocation('/dashboard');
      }
    } catch (error: any) {
      // Error is handled by global query client or can be shown here
      console.error('Login error', error);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-[40dvh] bg-primary/5 rounded-b-[100%] z-0" />
      
      <div className="w-full max-w-md z-10 flex flex-col gap-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-2 bg-white flex items-center justify-center">
            <img src="/logo.png" alt="QIPOS Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">QIPOS</h1>
          <p className="text-muted-foreground text-sm font-medium">Qonita Islamic Point Organization System</p>
        </div>

        <div className="bg-card border border-border shadow-xl rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="username">
                Username
              </label>
              <input
                {...register('username')}
                id="username"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Masukkan username"
                data-testid="input-username"
              />
              {errors.username && (
                <span className="text-xs text-destructive">{errors.username.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground" htmlFor="password">
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Masukkan password"
                data-testid="input-password"
              />
              {errors.password && (
                <span className="text-xs text-destructive">{errors.password.message}</span>
              )}
            </div>

            {loginMutation.isError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 text-center">
                Username atau password salah
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 mt-2"
              data-testid="button-login"
            >
              {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
