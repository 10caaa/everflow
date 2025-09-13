import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { authService } from '@/services/api'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    // Vérifier si l'utilisateur est authentifié
    if (!authService.isAuthenticated()) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})
