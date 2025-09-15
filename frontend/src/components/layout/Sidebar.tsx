import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { 
  LayoutDashboard, 
  Gift, 
  Users, 
  Building, 
  LogOut,
  TrendingUp,
  Menu
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Offers', href: '/dashboard/offers', icon: Gift },
  { name: 'Affiliates', href: '/dashboard/affiliates', icon: Users },
  { name: 'Advertisers', href: '/dashboard/advertisers', icon: Building },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className={`flex items-center justify-center h-12 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className="flex items-center">
          <TrendingUp className="h-6 w-6 text-sidebar-foreground" />
          {!isCollapsed && (
            <span className="ml-2 text-lg font-semibold text-sidebar-foreground">Everflow</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-6 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                flex items-center py-2.5 text-sm font-medium rounded-md transition-colors
                ${isCollapsed ? 'px-2 justify-center' : 'px-3'}
                ${isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-primary/10 hover:text-primary'
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
        <button
          onClick={logout}
          className={`flex items-center w-full py-2.5 text-sm font-medium text-sidebar-foreground rounded-md hover:bg-primary/10 hover:text-primary transition-colors ${isCollapsed ? 'px-2 justify-center' : 'px-3'}`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </div>
  );
}