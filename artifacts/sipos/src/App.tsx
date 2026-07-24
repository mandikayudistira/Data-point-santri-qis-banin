import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { AppLayout } from '@/components/layout/app-layout';
import React, { useEffect } from 'react';

// Pages
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import SantriList from '@/pages/santri-list';
import SantriDetail from '@/pages/santri-detail';
import InputPelanggaranPage from '@/pages/input-pelanggaran';
import InputPrestasiPage from '@/pages/input-prestasi';
import MasterPoinPage from '@/pages/master-poin';
import PenggunaPage from '@/pages/pengguna';
import WaliDashboard from '@/pages/wali-dashboard';

const queryClient = new QueryClient();

// Redirect helper component
function RootRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation('/login');
      } else if (user?.role === 'wali') {
        setLocation('/wali-dashboard');
      } else {
        setLocation('/dashboard');
      }
    }
  }, [user, isLoading, isAuthenticated, setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      {/* Protected Routes Wrapper */}
      <Route path="*">
        <ProtectedRoute>
          <AppLayout>
            <Switch>
              <Route path="/" component={RootRedirect} />
              
              <Route path="/dashboard">
                <ProtectedRoute allowedRoles={['admin', 'sayyid']}>
                  <DashboardPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/santri">
                <ProtectedRoute allowedRoles={['admin', 'sayyid']}>
                  <SantriList />
                </ProtectedRoute>
              </Route>
              
              <Route path="/santri/:id">
                <ProtectedRoute allowedRoles={['admin', 'sayyid']}>
                  <SantriDetail />
                </ProtectedRoute>
              </Route>
              
              <Route path="/pelanggaran">
                <ProtectedRoute allowedRoles={['admin', 'sayyid']}>
                  <InputPelanggaranPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/prestasi">
                <ProtectedRoute allowedRoles={['admin', 'sayyid']}>
                  <InputPrestasiPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/master-poin">
                <ProtectedRoute allowedRoles={['admin']}>
                  <MasterPoinPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/pengguna">
                <ProtectedRoute allowedRoles={['admin']}>
                  <PenggunaPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/wali-dashboard">
                <ProtectedRoute allowedRoles={['wali', 'admin']}>
                  <WaliDashboard />
                </ProtectedRoute>
              </Route>
              
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
