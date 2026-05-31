import { useState } from 'react'
import { Shield, ShieldCheck, Users, Lock, Clock, TableProperties } from 'lucide-react'
import PermissionMatrixTable from '@/components/permission/PermissionMatrixTable'
import OverviewPanel from '@/components/permission/OverviewPanel'
import RoleManagementPanel from '@/components/permission/RoleManagementPanel'
import UserAssignmentPanel from '@/components/permission/UserAssignmentPanel'
import SecurityPolicyPanel from '@/components/permission/SecurityPolicyPanel'
import AuditLogsPanel from '@/components/permission/AuditLogsPanel'

type TabType = 'overview' | 'matrix' | 'roles' | 'assign' | 'policy' | 'logs'

interface TabOption {
  id: TabType
  label: string
  icon: React.ElementType
}

const TABS: TabOption[] = [
  { id: 'overview', label: 'Tổng quan', icon: ShieldCheck },
  { id: 'matrix', label: 'Ma trận Quyền', icon: TableProperties },
  { id: 'roles', label: 'Quản lý Vai trò', icon: Shield },
  { id: 'assign', label: 'Gán quyền User', icon: Users },
  { id: 'policy', label: 'Chính sách Bảo mật', icon: Lock },
  { id: 'logs', label: 'Nhật ký', icon: Clock }
]

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('matrix')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Shield size={22} className="text-red-800 fill-red-800/10" /> 
          Phân quyền hệ thống
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Cấu hình vai trò nghiệp vụ, phân chia ma trận quyền hạn chi tiết và quản trị chính sách bảo mật hệ thống.
        </p>
      </div>

      {/* Tabs Header bar */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap -mb-px gap-1.5" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-lg transition-all cursor-pointer ${
                  active
                    ? 'border-red-800 text-red-800 bg-white shadow-sm'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon size={14} className={active ? 'text-red-800' : 'text-gray-400'} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Active Tab Panel */}
      <div className="mt-4 min-h-[500px]">
        {activeTab === 'overview' && (
          <OverviewPanel onNavigateToMatrix={() => setActiveTab('matrix')} />
        )}
        
        {activeTab === 'matrix' && (
          <PermissionMatrixTable />
        )}
        
        {activeTab === 'roles' && (
          <RoleManagementPanel />
        )}
        
        {activeTab === 'assign' && (
          <UserAssignmentPanel />
        )}
        
        {activeTab === 'policy' && (
          <SecurityPolicyPanel />
        )}
        
        {activeTab === 'logs' && (
          <AuditLogsPanel />
        )}
      </div>
    </div>
  )
}
