import { Navigate } from 'react-router-dom'
import type { Role } from '@/types'
import { useAuthContext } from './AuthContext'

interface Props {
  allowedRole: Role
  children: React.ReactNode
}

export default function ProtectedRoute({ allowedRole, children }: Props) {
  const { currentUser } = useAuthContext()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== allowedRole) {
    const map: Record<Role, string> = {
      customer: '/customer', operation_staff: '/operation',
      petcare_staff: '/petcare', shop_head: '/shop-head',
      admin: '/admin', warehouse_manager: '/warehouse',
    }
    return <Navigate to={map[currentUser.role]} replace />
  }
  return <>{children}</>
}
