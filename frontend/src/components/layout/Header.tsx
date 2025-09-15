import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Button } from '../ui/button';
import { Bell, Settings, User, PanelLeft } from 'lucide-react';

export function Header() {
  const { user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { title, description } = usePageTitle();

  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <PanelLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="h-6 w-px bg-border"></div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {user?.name || 'Utilisateur'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}