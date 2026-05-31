import { DEFAULT_PERMISSIONS } from '@/auth/permissions'
import type { PermissionMatrix } from '@/types'

// Module-level mutable state for admin-editable permission matrix
// In real app this would be persisted via API; here it's in-memory
let _matrix: PermissionMatrix = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))

export function getPermissionMatrix(): PermissionMatrix {
  return _matrix
}

export function updatePermission(
  role: keyof PermissionMatrix,
  module: string,
  action: 'read' | 'write' | 'delete',
  value: boolean
) {
  _matrix = {
    ..._matrix,
    [role]: {
      ..._matrix[role],
      [module]: {
        ..._matrix[role][module as keyof typeof _matrix[typeof role]],
        [action]: value,
      },
    },
  }
}

export function resetPermissions() {
  _matrix = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS))
}
