import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Link, useLocation } from 'wouter';
import { useLogout, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Users, 
  AlertOctagon, 
  Award, 
  Settings, 
  LogOut, 
  Menu,
  X,
  BookOpen,
  UserCog
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      queryClient.setQueryData(getGetMeQueryKey(), null);
      setLocation('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: user?.role === 'wali' ? '/wali-dashboard' : '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['admin', 'sayyid', 'wali'],
    },
    {
      name: 'Data Santri',
      href: '/santri',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'sayyid'],
    },
    {
      name: 'Input Pelanggaran',
      href: '/pelanggaran',
      icon: <AlertOctagon className="w-5 h-5" />,
      roles: ['admin', 'sayyid'],
    },
    {
      name: 'Input Prestasi',
      href: '/prestasi',
      icon: <Award className="w-5 h-5" />,
      roles: ['admin', 'sayyid'],
    },
    {
      name: 'Master Poin',
      href: '/master-poin',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      name: 'Pengguna',
      href: '/pengguna',
      icon: <UserCog className="w-5 h-5" />,
      roles: ['admin'],
    },
  ];

  const visibleNavItems = navItems.filter((item) => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            S
          </div>
          <span className="font-bold text-foreground">SIPOS</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-foreground hover:bg-muted rounded-md"
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-[100dvh] w-64 bg-sidebar border-r border-sidebar-border
          flex flex-col transition-transform duration-300 z-10
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-foreground">SIPOS</h1>
            <p className="text-xs text-muted-foreground">Poin Santri</p>
          </div>
        </div>

        <div className="px-4 py-4 md:pt-0">
          <div className="mb-6 p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground truncate">{user?.nama}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {visibleNavItems.map((item) => {
              const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/' && item.href !== '/dashboard' && item.href !== '/wali-dashboard');
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
            {logoutMutation.isPending ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[100dvh] overflow-x-hidden">
        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-0 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
