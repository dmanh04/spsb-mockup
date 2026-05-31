import type { PermissionMatrix, Role, Module } from '@/types'

const ALL = { read: true, write: true, delete: true }
const RW = { read: true, write: true, delete: false }
const RO = { read: true, write: false, delete: false }
const NO = { read: false, write: false, delete: false }

export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  customer: {
    booking: RO, product: RO, inventory: NO, order: RO,
    user: NO, shop: NO, schedule: NO, voucher: RO,
    report: NO, service: RO, room: NO,
  },
  operation_staff: {
    booking: RW, product: RO, inventory: NO, order: RW,
    user: NO, shop: RO, schedule: RO, voucher: NO,
    report: NO, service: RO, room: RW,
  },
  petcare_staff: {
    booking: RW, product: NO, inventory: NO, order: NO,
    user: NO, shop: NO, schedule: RO, voucher: NO,
    report: NO, service: RO, room: NO,
  },
  shop_head: {
    booking: ALL, product: ALL, inventory: RW, order: ALL,
    user: RO, shop: RW, schedule: ALL, voucher: ALL,
    report: RO, service: ALL, room: ALL,
  },
  admin: {
    booking: ALL, product: ALL, inventory: ALL, order: ALL,
    user: ALL, shop: ALL, schedule: ALL, voucher: ALL,
    report: ALL, service: ALL, room: ALL,
  },
  warehouse_manager: {
    booking: NO, product: RO, inventory: ALL, order: RO,
    user: NO, shop: NO, schedule: NO, voucher: NO,
    report: RO, service: NO, room: NO,
  },
}

export function getPortalPath(role: Role): string {
  const map: Record<Role, string> = {
    customer: '/customer',
    operation_staff: '/operation',
    petcare_staff: '/petcare',
    shop_head: '/shop-head',
    admin: '/admin',
    warehouse_manager: '/warehouse',
  }
  return map[role]
}
