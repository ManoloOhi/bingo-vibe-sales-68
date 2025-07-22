import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} subtitle={subtitle} />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}