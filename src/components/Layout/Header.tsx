import { User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiStatus } from '@/components/ui/api-status';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-border z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{subtitle}</p>
              <ApiStatus />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <User size={20} />
                {isAdmin && (
                  <Shield size={12} className="absolute -top-1 -right-1 text-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.nome}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <Badge variant={isAdmin ? "default" : "secondary"} className="ml-auto">
                  {isAdmin ? "Admin" : "User"}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}