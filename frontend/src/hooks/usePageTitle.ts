import { useLocation } from 'react-router-dom'

export function usePageTitle() {
  const location = useLocation()
  
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard'
      case '/dashboard/offers':
        return 'Offers'
      case '/dashboard/affiliates':
        return 'Affiliates'
      case '/dashboard/advertisers':
        return 'Advertisers'
      default:
        return 'Dashboard'
    }
  }
  
  const getPageDescription = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Welcome, user'
      case '/dashboard/offers':
        return 'Manage and analyze your offers performance'
      case '/dashboard/affiliates':
        return 'Track your affiliate network performance'
      case '/dashboard/advertisers':
        return 'Manage your advertising partners and their performance'
      default:
        return 'Welcome, user'
    }
  }
  
  return {
    title: getPageTitle(location.pathname),
    description: getPageDescription(location.pathname)
  }
}
