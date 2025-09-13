import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Bell, Settings, User } from 'lucide-react';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-sm text-gray-600">
            Bienvenue, {user?.name || 'utilisateur'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user?.name || 'Utilisateur'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}