import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, useSidebar } from '../../contexts/SidebarContext';

function DashboardContent() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen bg-sidebar overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden">
        <div className="flex-1 bg-card rounded-3xl border border-border/20 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}