import { Home, Users, Package, ShoppingCart, BarChart3, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { icon: Home, label: 'Início', href: '/', adminOnly: false },
  { icon: Package, label: 'Bingos', href: '/bingos', adminOnly: true },
  { icon: Users, label: 'Vendedores', href: '/vendedores', adminOnly: true },
  { 
    icon: ShoppingCart, 
    label: 'Pedidos', 
    href: '/pedidos', 
    adminOnly: false,
    // Mostrar "Meus Pedidos" para usuários comuns
    getUserLabel: (isAdmin: boolean) => isAdmin ? 'Pedidos' : 'Meus Pedidos'
  },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios', adminOnly: false },
];

export function BottomNavigation() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleItems.map((item) => {
          const { icon: Icon, label, href, adminOnly, getUserLabel } = item;
          const isActive = location.pathname === href;
          const displayLabel = getUserLabel ? getUserLabel(isAdmin) : label;
          
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 relative",
                "min-w-0 flex-1 max-w-[80px]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-button)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon size={20} className="shrink-0" />
              {adminOnly && (
                <Shield size={8} className="absolute top-1 right-1 text-primary" />
              )}
              <span className="text-xs font-medium truncate">{displayLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}