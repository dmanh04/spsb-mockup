import React, { useState, useMemo } from 'react'
import {
  Layers, Plus, Edit, Trash2, Search, CheckCircle, AlertTriangle, AlertCircle, Move, ChevronRight, Folder, FolderOpen
} from 'lucide-react'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_MOCK_LIST,
  saveProductCategories
} from '@/data/productMockData'
import type { ProductCategory } from '@/types'

// Simple emoji list for pet care categories
const PET_EMOJIS = ['🐕', '🐈', '🍖', '🦴', '🎀', '🧸', '🧴', '🧼', '💊', '🐹', '🐦', '🐠', '🐈‍⬛', '🦮', '🐾', '🏠']

export default function CategoryManagementPage() {
  // 1. Categories State (triggered by save)
  const [categories, setCategories] = useState<ProductCategory[]>(PRODUCT_CATEGORIES)
  const [selectedParentId, setSelectedParentId] = useState<string | null>(() => {
    // Default to the first parent category
    const firstParent = PRODUCT_CATEGORIES.find(c => c.parentId === null)
    return firstParent ? firstParent.id : null
  })

  // 2. Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'create_parent' | 'edit_parent' | 'create_sub' | 'edit_sub'>('create_parent')
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)

  // 3. Form fields
  const [formName, setFormName] = useState('')
  const [formIcon, setFormIcon] = useState('🐕')
  const [formDesc, setFormDesc] = useState('')
  const [formParentId, setFormParentId] = useState<string | null>(null)

  // 4. Searching & UI feedback
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [validationError, setValidationError] = useState('')

  // 5. Drag and Drop state tracking
  const [draggedParentIdx, setDraggedParentIdx] = useState<number | null>(null)
  const [draggedSubId, setDraggedSubId] = useState<string | null>(null)
  const [draggedSubIdx, setDraggedSubIdx] = useState<number | null>(null)
  const [hoveredParentIdForDrop, setHoveredParentIdForDrop] = useState<string | null>(null)

  // Trigger Toast Notification
  function triggerToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Parents computed & sorted
  const parentCategories = useMemo(() => {
    return categories
      .filter(c => c.parentId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [categories])

  // Subcategories of selected parent computed & sorted
  const subCategories = useMemo(() => {
    if (!selectedParentId) return []
    return categories
      .filter(c => c.parentId === selectedParentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [categories, selectedParentId])

  // Selected parent object lookup
  const selectedParent = useMemo(() => {
    return categories.find(c => c.id === selectedParentId) || null
  }, [categories, selectedParentId])

  // Dynamic Product Counter per Category
  const getProductCount = (categoryName: string) => {
    return PRODUCT_MOCK_LIST.filter(p => p.category === categoryName).length
  }

  // Total products in a parent category (sum of all its subcategory counts)
  const getParentProductCount = (parentId: string) => {
    const subs = categories.filter(c => c.parentId === parentId).map(c => c.name)
    return PRODUCT_MOCK_LIST.filter(p => subs.includes(p.category)).length
  }

  // --- CRUD Modal Actions ---
  function openCreateParentModal() {
    setModalType('create_parent')
    setEditingCategory(null)
    setFormName('')
    setFormIcon('🐕')
    setFormDesc('')
    setFormParentId(null)
    setValidationError('')
    setIsModalOpen(true)
  }

  function openEditParentModal(cat: ProductCategory) {
    setModalType('edit_parent')
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormIcon(cat.icon)
    setFormDesc(cat.description || '')
    setFormParentId(null)
    setValidationError('')
    setIsModalOpen(true)
  }

  function openCreateSubModal() {
    if (!selectedParentId) {
      alert('Vui lòng chọn danh mục cha trước!')
      return
    }
    setModalType('create_sub')
    setEditingCategory(null)
    setFormName('')
    setFormIcon('🐾')
    setFormDesc('')
    setFormParentId(selectedParentId)
    setValidationError('')
    setIsModalOpen(true)
  }

  function openEditSubModal(cat: ProductCategory) {
    setModalType('edit_sub')
    setEditingCategory(cat)
    setFormName(cat.name)
    setFormIcon(cat.icon)
    setFormDesc(cat.description || '')
    setFormParentId(cat.parentId)
    setValidationError('')
    setIsModalOpen(true)
  }

  // Handle Form Submit
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) {
      setValidationError('Tên danh mục không được để trống.')
      return
    }

    // Check duplicates (excluding self)
    const isDuplicateName = categories.some(
      c => c.name.toLowerCase().trim() === formName.toLowerCase().trim() && c.id !== editingCategory?.id
    )
    if (isDuplicateName) {
      setValidationError(`Tên danh mục "${formName}" đã tồn tại.`)
      return
    }

    let updatedList = [...categories]

    if (modalType === 'create_parent' || modalType === 'create_sub') {
      const isParent = modalType === 'create_parent'
      const newId = isParent 
        ? `P_CAT_${Date.now()}` 
        : `SUB_CAT_${Date.now()}`
      
      const siblingCount = categories.filter(c => c.parentId === formParentId).length
      
      const newCategory: ProductCategory = {
        id: newId,
        name: formName.trim(),
        parentId: formParentId,
        icon: formIcon,
        description: formDesc.trim(),
        sortOrder: siblingCount + 1,
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      updatedList.push(newCategory)
      triggerToast(`Đã thêm danh mục "${formName}" thành công!`)
      if (isParent) setSelectedParentId(newId)
    } else {
      // Editing
      if (!editingCategory) return
      
      updatedList = updatedList.map(c => {
        if (c.id === editingCategory.id) {
          return {
            ...c,
            name: formName.trim(),
            icon: formIcon,
            description: formDesc.trim(),
            parentId: formParentId
          }
        }
        return c
      })
      triggerToast(`Đã cập nhật danh mục "${formName}" thành công!`)
    }

    saveProductCategories(updatedList)
    setCategories(updatedList)
    setIsModalOpen(false)
  }

  // Delete category action with product validation check
  function handleDelete(cat: ProductCategory) {
    const isParent = cat.parentId === null

    if (isParent) {
      const subCategoryList = categories.filter(c => c.parentId === cat.id)
      if (subCategoryList.length > 0) {
        alert(`Không thể xóa danh mục cha "${cat.name}" vì có ${subCategoryList.length} danh mục con trực thuộc. Vui lòng xóa hoặc di chuyển các danh mục con trước.`)
        return
      }
    } else {
      // Check if products exist under this specific subcategory
      const count = getProductCount(cat.name)
      if (count > 0) {
        const affectedProducts = PRODUCT_MOCK_LIST
          .filter(p => p.category === cat.name)
          .slice(0, 3)
          .map(p => `• ${p.name}`)
          .join('\n')
        
        alert(`Không thể xóa danh mục "${cat.name}"!\n\nCó ${count} sản phẩm đang sử dụng danh mục này:\n${affectedProducts}\n${count > 3 ? `... và ${count - 3} sản phẩm khác\n` : ''}\nVui lòng cập nhật thể loại của các sản phẩm trên sang danh mục khác trước khi xóa.`)
        return
      }
    }

    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
      const updatedList = categories.filter(c => c.id !== cat.id)
      saveProductCategories(updatedList)
      setCategories(updatedList)
      triggerToast(`Đã xóa danh mục "${cat.name}" thành công!`)
      
      // If deleted active parent, switch selection
      if (cat.id === selectedParentId) {
        const firstParent = updatedList.find(c => c.parentId === null)
        setSelectedParentId(firstParent ? firstParent.id : null)
      }
    }
  }

  // --- HTML5 Drag & Drop for Parent Categories (Sorting) ---
  function handleParentDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedParentIdx(index)
    // Darken custom drag ghost text if supported
    e.dataTransfer.setData('text/plain', parentCategories[index].id)
  }

  function handleParentDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (draggedParentIdx === null || draggedParentIdx === index) return
  }

  function handleParentDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault()
    if (draggedParentIdx === null || draggedParentIdx === targetIdx) return

    const reorderedParents = [...parentCategories]
    const [draggedItem] = reorderedParents.splice(draggedParentIdx, 1)
    reorderedParents.splice(targetIdx, 0, draggedItem)

    // Re-assign sortOrder
    const orderMap: Record<string, number> = {}
    reorderedParents.forEach((p, idx) => {
      orderMap[p.id] = idx + 1
    })

    const updatedList = categories.map(c => {
      if (c.parentId === null && orderMap[c.id] !== undefined) {
        return { ...c, sortOrder: orderMap[c.id] }
      }
      return c
    })

    saveProductCategories(updatedList)
    setCategories(updatedList)
    setDraggedParentIdx(null)
    triggerToast('Đã lưu thứ tự danh mục cha!')
  }

  // --- Drag Subcategory into Parent (Parent Reassignment) ---
  function handleSubDragStart(e: React.DragEvent, subId: string, idx: number) {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedSubId(subId)
    setDraggedSubIdx(idx)
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'sub_cat', id: subId }))
  }

  // Drag over a parent list item
  function handleParentDragOverForSub(e: React.DragEvent, targetParentId: string) {
    e.preventDefault()
    if (!draggedSubId) return
    
    // Prevent dragging onto own parent
    const sub = categories.find(c => c.id === draggedSubId)
    if (sub && sub.parentId === targetParentId) return

    setHoveredParentIdForDrop(targetParentId)
  }

  function handleParentDragLeaveForSub() {
    setHoveredParentIdForDrop(null)
  }

  // Drop subcategory onto parent list item to reassign parent
  function handleParentDropForSub(e: React.DragEvent, targetParentId: string) {
    e.preventDefault()
    setHoveredParentIdForDrop(null)
    
    const dragData = e.dataTransfer.getData('application/json')
    if (!dragData) return

    try {
      const { type, id } = JSON.parse(dragData)
      if (type !== 'sub_cat') return

      const sub = categories.find(c => c.id === id)
      if (!sub) return
      if (sub.parentId === targetParentId) return // Drop on same parent

      const siblingsInTarget = categories.filter(c => c.parentId === targetParentId)
      
      const updatedList = categories.map(c => {
        if (c.id === id) {
          return {
            ...c,
            parentId: targetParentId,
            sortOrder: siblingsInTarget.length + 1
          }
        }
        return c
      })

      saveProductCategories(updatedList)
      setCategories(updatedList)
      setDraggedSubId(null)
      setDraggedSubIdx(null)
      triggerToast(`Đã chuyển danh mục con "${sub.name}" vào nhóm mới.`)
    } catch (err) {
      console.error(err)
    }
  }

  // --- HTML5 Drag & Drop for Subcategories (Sorting within same parent) ---
  function handleSubDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (draggedSubIdx === null || draggedSubIdx === index) return
  }

  function handleSubDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault()
    if (draggedSubIdx === null || draggedSubIdx === targetIdx) return

    const reorderedSubs = [...subCategories]
    const [draggedItem] = reorderedSubs.splice(draggedSubIdx, 1)
    reorderedSubs.splice(targetIdx, 0, draggedItem)

    // Re-assign sortOrder
    const orderMap: Record<string, number> = {}
    reorderedSubs.forEach((sub, idx) => {
      orderMap[sub.id] = idx + 1
    })

    const updatedList = categories.map(c => {
      if (c.parentId === selectedParentId && orderMap[c.id] !== undefined) {
        return { ...c, sortOrder: orderMap[c.id] }
      }
      return c
    })

    saveProductCategories(updatedList)
    setCategories(updatedList)
    setDraggedSubIdx(null)
    setDraggedSubId(null)
    triggerToast('Đã sắp xếp lại thứ tự danh mục con!')
  }

  // Filtered parent categories for left sidebar if searched
  const filteredParents = parentCategories.filter(p => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    const matchesParentName = p.name.toLowerCase().includes(searchLower)
    const matchesSubName = categories.some(
      c => c.parentId === p.id && c.name.toLowerCase().includes(searchLower)
    )
    return matchesParentName || matchesSubName
  })

  return (
    <div className="space-y-5 animate-fadeIn relative text-xs">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-gray-950 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-slideIn">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Layers size={22} className="text-red-800" />
            Cấu hình Phân loại & Danh mục
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Thiết lập danh mục cha/con (2 cấp), sắp xếp hiển thị bằng cách kéo thả, kéo thả danh mục con để đổi cha.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateParentModal}
            className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 bg-red-800 hover:bg-red-900 border-none transition-all shadow-md cursor-pointer"
          >
            <Plus size={15} /> Thêm nhóm danh mục cha
          </button>
        </div>
      </div>

      {/* Main layout pane splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Side Pane: Parents Tree List */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col space-y-4">
          <div className="space-y-1 border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Folder size={16} className="text-red-800" />
              Nhóm danh mục cha
            </h3>
            <p className="text-[10px] text-gray-400">Kéo thả danh mục để sắp xếp vị trí hiển thị.</p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Parent categories draggable list */}
          <div className="space-y-1 overflow-y-auto max-h-[480px] pr-1">
            {filteredParents.map((p, idx) => {
              const isSelected = selectedParentId === p.id
              const totalCount = getParentProductCount(p.id)
              const childCount = categories.filter(c => c.parentId === p.id).length
              const isHovered = hoveredParentIdForDrop === p.id

              return (
                <div
                  key={p.id}
                  draggable="true"
                  onDragStart={(e) => handleParentDragStart(e, idx)}
                  onDragOver={(e) => {
                    handleParentDragOver(e, idx)
                    handleParentDragOverForSub(e, p.id)
                  }}
                  onDragLeave={handleParentDragLeaveForSub}
                  onDrop={(e) => {
                    handleParentDrop(e, idx)
                    handleParentDropForSub(e, p.id)
                  }}
                  onClick={() => setSelectedParentId(p.id)}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer group/item relative ${
                    isSelected
                      ? 'bg-red-50/50 border-red-800/40 shadow-sm'
                      : isHovered
                      ? 'bg-emerald-50 border-emerald-400 border-dashed scale-[1.02]'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Drag Handle Indicator */}
                    <div className="text-gray-300 hover:text-gray-500 cursor-grab shrink-0">
                      <Move size={12} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </div>

                    <span className="text-lg shrink-0">{p.icon}</span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-gray-800 flex items-center gap-1.5">
                        {p.name}
                        {isSelected && <ChevronRight size={12} className="text-red-800" />}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>{childCount} danh mục con</span>
                        <span>•</span>
                        <span>{totalCount} sản phẩm</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons inside Item row */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditParentModal(p)
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-800 cursor-pointer"
                      title="Sửa nhóm cha"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(p)
                      }}
                      className="p-1 hover:bg-rose-50 rounded text-gray-500 hover:text-rose-700 cursor-pointer"
                      title="Xóa nhóm cha"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredParents.length === 0 && (
              <div className="py-12 text-center text-gray-400 border border-dashed border-gray-100 rounded-lg">
                <AlertCircle size={20} className="mx-auto text-gray-300 mb-1" />
                Không tìm thấy danh mục cha nào.
              </div>
            )}
          </div>
        </div>

        {/* Right Side Pane: Subcategories Details (Span 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col space-y-4">
          {selectedParent ? (
            <>
              {/* Selected parent description summary */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedParent.icon}</span>
                    <h2 className="text-base font-extrabold text-gray-900">{selectedParent.name}</h2>
                    <span className="bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded text-[9px] uppercase border border-gray-200">
                      Danh mục gốc (Parent)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed italic max-w-xl">
                    {selectedParent.description || 'Chưa có thông tin mô tả cho nhóm danh mục này.'}
                  </p>
                </div>
                
                <button
                  onClick={openCreateSubModal}
                  className="btn-primary py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1 border border-red-800 text-red-800 bg-white hover:bg-red-50 hover:text-red-900 cursor-pointer shrink-0 transition-colors"
                >
                  <Plus size={13} /> Thêm danh mục con
                </button>
              </div>

              {/* Subcategories list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-700 text-xs flex items-center gap-1.5">
                    <FolderOpen size={14} className="text-red-800" />
                    Danh sách danh mục con trực thuộc ({subCategories.length})
                  </h3>
                  <span className="text-[10px] text-gray-400">Mẹo: Kéo thả các dòng để sắp xếp hoặc thả vào nhóm cha bên trái để chuyển nhóm.</span>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-2.5 w-8"></th>
                        <th className="px-4 py-2.5">Tên danh mục con</th>
                        <th className="px-4 py-2.5">Mô tả</th>
                        <th className="px-4 py-2.5 text-center">Số sản phẩm</th>
                        <th className="px-4 py-2.5 text-center">Ngày tạo</th>
                        <th className="px-4 py-2.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subCategories.map((sub, idx) => {
                        const productCount = getProductCount(sub.name)
                        return (
                          <tr
                            key={sub.id}
                            draggable="true"
                            onDragStart={(e) => handleSubDragStart(e, sub.id, idx)}
                            onDragOver={(e) => handleSubDragOver(e, idx)}
                            onDrop={(e) => handleSubDrop(e, idx)}
                            className="hover:bg-gray-50/50 transition-colors group/row"
                          >
                            {/* Drag handle */}
                            <td className="px-4 py-3">
                              <div className="cursor-grab text-gray-300 hover:text-gray-500">
                                <Move size={12} className="opacity-0 group-hover/row:opacity-100 transition-opacity" />
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-800">
                              <div className="flex items-center gap-2">
                                <span className="text-sm shrink-0">{sub.icon}</span>
                                <span>{sub.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                              {sub.description || '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center justify-center font-bold font-mono px-2 py-0.5 rounded-full text-[10px] ${
                                productCount > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                {productCount}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-400 font-medium">
                              {sub.createdAt}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditSubModal(sub)}
                                  className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-800 cursor-pointer"
                                  title="Chỉnh sửa danh mục con"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(sub)}
                                  className="p-1.5 hover:bg-rose-50 rounded text-gray-500 hover:text-rose-700 cursor-pointer"
                                  title="Xóa danh mục con"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}

                      {subCategories.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-gray-400 italic">
                            <AlertCircle size={20} className="mx-auto text-gray-300 mb-1" />
                            Không có danh mục con nào trực thuộc nhóm này. Hãy thêm mới danh mục con ở nút phía trên.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-gray-400 italic border border-dashed border-gray-100 rounded-xl">
              Vui lòng tạo hoặc chọn một nhóm danh mục cha bên trái để quản lý danh mục con.
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-2xl w-full max-w-md space-y-4 animate-scaleUp">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                <Layers size={16} className="text-red-800" />
                {modalType === 'create_parent' && 'Thêm Nhóm Danh Mục Cha'}
                {modalType === 'edit_parent' && 'Chỉnh Sửa Nhóm Danh Mục Cha'}
                {modalType === 'create_sub' && 'Thêm Danh Mục Con'}
                {modalType === 'edit_sub' && 'Chỉnh Sửa Danh Mục Con'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Cung cấp các thông tin cơ bản cho danh mục của bạn.
              </p>
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                <span className="font-semibold text-[10px]">{validationError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Tên danh mục <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thức ăn khô, Đồ dùng lưu trú..."
                  value={formName}
                  onChange={e => {
                    setFormName(e.target.value)
                    setValidationError('')
                  }}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Emoji/Icon Selector */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-600">Icon / Biểu tượng <span className="text-rose-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formIcon}
                    onChange={e => setFormIcon(e.target.value)}
                    className="w-12 text-center text-lg border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                  />
                  <div className="flex-1 flex flex-wrap gap-1 border border-gray-100 rounded-lg p-2 bg-gray-50/50">
                    {PET_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormIcon(emoji)}
                        className={`w-6 h-6 flex items-center justify-center text-sm rounded hover:bg-white border transition-all cursor-pointer ${
                          formIcon === emoji ? 'border-red-800 bg-white scale-110 shadow-sm' : 'border-transparent'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parent category assignment (Only for Sub Editing, to let them move manually if desired) */}
              {(modalType === 'edit_sub' || modalType === 'create_sub') && (
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600">Danh mục cha trực thuộc</label>
                  <select
                    value={formParentId || ''}
                    onChange={e => setFormParentId(e.target.value || null)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 bg-white font-semibold"
                  >
                    {parentCategories.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-gray-600">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú thêm về danh mục này..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Xác nhận lưu
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
