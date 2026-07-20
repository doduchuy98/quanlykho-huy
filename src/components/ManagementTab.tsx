import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Package, 
  Coffee, 
  Check, 
  X, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Eye,
  EyeOff,
  ChefHat,
  Clock,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Flame,
  CheckSquare
} from 'lucide-react';
import { MenuItem, InventoryItem, Order, Table, Zone, Invoice, AuditSession, StoreInfo } from '../types';
import { formatVND, calculateTimeElapsed } from '../utils';
import KitchenKdsView from './KitchenKdsView';

interface ManagementTabProps {
  menuItems: MenuItem[];
  onUpdateMenuItems: (items: MenuItem[]) => void;
  inventoryItems: InventoryItem[];
  onUpdateInventoryItems: (items: InventoryItem[]) => void;
  showToast: (msg: string) => void;
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  tables: Table[];
  zones: Zone[];
  invoices: Invoice[];
  auditSessions: AuditSession[];
  onUpdateAuditSessions: (sessions: AuditSession[]) => void;
  categories: { id: string; name: string; icon: string }[];
  onUpdateCategories: (categories: { id: string; name: string; icon: string }[]) => void;
  storeInfo?: StoreInfo;
}

export default function ManagementTab({
  menuItems,
  onUpdateMenuItems,
  inventoryItems,
  onUpdateInventoryItems,
  showToast,
  orders,
  onUpdateOrders,
  tables,
  zones,
  invoices,
  auditSessions,
  onUpdateAuditSessions,
  categories,
  onUpdateCategories,
  storeInfo
}: ManagementTabProps) {
  // Navigation sub-tab: 'menu' (Quản lý món), 'inventory' (Quản lý kho), 'audit' (Kiểm kê kho hàng), or 'sales' (Bán ra trong ngày)
  const [subTab, setSubTab] = useState<'menu' | 'inventory' | 'audit' | 'sales'>('menu');

  // --- AUDIT STATES ---
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditQuantities, setAuditQuantities] = useState<Record<string, number>>({});
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  const handleOpenNewAudit = () => {
    const initialQtys: Record<string, number> = {};
    inventoryItems.forEach(item => {
      initialQtys[item.id] = item.quantity;
    });
    setAuditQuantities(initialQtys);
    setAuditNotes('');
    setIsAuditModalOpen(true);
  };

  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionItems = inventoryItems.map(item => {
      const actualQty = auditQuantities[item.id] ?? item.quantity;
      const systemQty = item.quantity;
      return {
        itemId: item.id,
        itemName: item.name,
        unit: item.unit,
        systemQty: systemQty,
        actualQty: actualQty,
        difference: Number((actualQty - systemQty).toFixed(3)),
        openingQty: item.initialQuantity || 0,
        importedQty: item.importedQuantity || 0,
        exportedQty: item.exportedQuantity || 0,
        closingQty: actualQty
      };
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const newSession = {
      id: `aud_${Date.now()}`,
      date: todayStr,
      time: now.toISOString(),
      items: sessionItems,
      notes: auditNotes.trim() || 'Kiểm kê định kỳ'
    };

    const updatedInventory = inventoryItems.map(item => {
      const actualQty = auditQuantities[item.id] ?? item.quantity;
      return {
        ...item,
        initialQuantity: actualQty,
        quantity: actualQty,
        importedQuantity: 0,
        exportedQuantity: 0,
        lastUpdated: now.toISOString()
      };
    });

    onUpdateInventoryItems(updatedInventory);
    onUpdateAuditSessions([newSession, ...auditSessions]);
    setIsAuditModalOpen(false);
    showToast('🎉 Đã hoàn thành kiểm kê ngày! Tồn kho hệ thống đã được cập nhật.');
  };

  const handleUpdateAuditQty = (itemId: string, val: string) => {
    const numVal = Number(val);
    if (!isNaN(numVal) && numVal >= 0) {
      setAuditQuantities(prev => ({
        ...prev,
        [itemId]: numVal
      }));
    }
  };

  // --- MENU STATES ---
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCatFilter, setMenuCatFilter] = useState('all');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  // Menu Form fields
  const [mName, setMName] = useState('');
  const [mPrice, setMPrice] = useState<number>(0);
  const [mCategory, setMCategory] = useState('coffee');
  const [mDescription, setMDescription] = useState('');
  const [mImageUrl, setMImageUrl] = useState('');
  const [mIsAvailable, setMIsAvailable] = useState(true);
  const [mUnit, setMUnit] = useState('Ly');

  // --- INVENTORY STATES ---
  const [invSearch, setInvSearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [selectedInvItem, setSelectedInvItem] = useState<InventoryItem | null>(null);

  // Inventory Form fields (Create/Edit Item)
  const [isCreateInvOpen, setIsCreateInvOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invInitialQuantity, setInvInitialQuantity] = useState<number>(0);
  const [invQuantity, setInvQuantity] = useState<number>(0);
  const [invImportedQuantity, setInvImportedQuantity] = useState<number>(0);
  const [invExportedQuantity, setInvExportedQuantity] = useState<number>(0);
  const [invUnit, setInvUnit] = useState('kg');
  const [invMinThreshold, setInvMinThreshold] = useState<number>(5);

  // Quick Adjust stock quantities
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('0');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in'); // in = Nhập kho, out = Xuất kho/hao hụt

  // --- RECIPE STATES ---
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeItem, setRecipeItem] = useState<MenuItem | null>(null);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState<string>('0.1');
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<string>('');

  // --- SALES REPORT STATES ---
  const [salesSegment, setSalesSegment] = useState<'dishes' | 'ingredients'>('dishes');
  const [selectedSalesDate, setSelectedSalesDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [salesFilterType, setSalesFilterType] = useState<'day' | 'month'>('day');
  const [selectedSalesMonth, setSelectedSalesMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));

  const handleOpenRecipeModal = (item: MenuItem) => {
    setRecipeItem(item);
    setIsRecipeModalOpen(true);
    setEditingIngredientId(null);
    setEditingQuantity('');
    
    // Suggest first ingredient that is not already in the recipe
    const existingIds = item.recipe?.map(r => r.inventoryItemId) || [];
    const available = inventoryItems.filter(inv => !existingIds.includes(inv.id));
    if (available.length > 0) {
      setSelectedIngredientId(available[0].id);
    } else {
      setSelectedIngredientId('');
    }
    setIngredientQuantity('0.1');
  };

  const handleSaveEditedIngredient = (ingredientId: string) => {
    if (!recipeItem) return;
    const qty = Number(editingQuantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Vui lòng nhập định lượng hợp lệ!');
      return;
    }

    const currentRecipe = recipeItem.recipe || [];
    const updatedRecipe = currentRecipe.map(r => {
      if (r.inventoryItemId === ingredientId) {
        return { ...r, quantity: qty };
      }
      return r;
    });

    const updatedMenuItems = menuItems.map(item => {
      if (item.id === recipeItem.id) {
        const nextItem = { ...item, recipe: updatedRecipe };
        setRecipeItem(nextItem);
        return nextItem;
      }
      return item;
    });

    onUpdateMenuItems(updatedMenuItems);
    showToast('Đã cập nhật định lượng nguyên liệu!');
    setEditingIngredientId(null);
  };

  const handleAddIngredientToRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeItem || !selectedIngredientId) return;

    const qty = Number(ingredientQuantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Vui lòng nhập số lượng hợp lệ!');
      return;
    }

    const currentRecipe = recipeItem.recipe || [];
    const updatedRecipe = [...currentRecipe, { inventoryItemId: selectedIngredientId, quantity: qty }];

    const updatedMenuItems = menuItems.map(item => {
      if (item.id === recipeItem.id) {
        const nextItem = { ...item, recipe: updatedRecipe };
        setRecipeItem(nextItem);
        return nextItem;
      }
      return item;
    });

    onUpdateMenuItems(updatedMenuItems);
    showToast(`Đã thêm định lượng vào món!`);

    // Reset select to next available ingredient
    const existingIds = updatedRecipe.map(r => r.inventoryItemId);
    const available = inventoryItems.filter(inv => !existingIds.includes(inv.id));
    if (available.length > 0) {
      setSelectedIngredientId(available[0].id);
    } else {
      setSelectedIngredientId('');
    }
    setIngredientQuantity('0.1');
  };

  const handleRemoveIngredientFromRecipe = (ingredientId: string) => {
    if (!recipeItem) return;

    const currentRecipe = recipeItem.recipe || [];
    const updatedRecipe = currentRecipe.filter(r => r.inventoryItemId !== ingredientId);

    const updatedMenuItems = menuItems.map(item => {
      if (item.id === recipeItem.id) {
        const nextItem = { ...item, recipe: updatedRecipe };
        setRecipeItem(nextItem);
        return nextItem;
      }
      return item;
    });

    onUpdateMenuItems(updatedMenuItems);
    showToast(`Đã xóa nguyên liệu khỏi định lượng!`);

    // If we removed something, update selection suggest if currently empty
    const existingIds = updatedRecipe.map(r => r.inventoryItemId);
    const available = inventoryItems.filter(inv => !existingIds.includes(inv.id));
    if (available.length > 0 && !selectedIngredientId) {
      setSelectedIngredientId(available[0].id);
    }
  };

  // --- MENU CRUD OPERATIONS ---
  const handleOpenAddMenuModal = () => {
    setSelectedMenuItem(null);
    setMName('');
    setMPrice(25000);
    setMCategory(categories[0]?.id || 'coffee');
    setMDescription('');
    setMImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=60');
    setMIsAvailable(true);
    setMUnit('Ly');
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenuModal = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setMName(item.name);
    setMPrice(item.price);
    setMCategory(item.category);
    setMDescription(item.description || '');
    setMImageUrl(item.imageUrl);
    setMIsAvailable(item.isAvailable);
    setMUnit(item.unit || 'Ly');
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) {
      showToast('Vui lòng nhập tên món ăn!');
      return;
    }

    if (selectedMenuItem) {
      // Edit mode
      const updated = menuItems.map(item => {
        if (item.id === selectedMenuItem.id) {
          return {
            ...item,
            name: mName,
            price: Number(mPrice),
            category: mCategory,
            description: mDescription,
            imageUrl: mImageUrl,
            isAvailable: mIsAvailable,
            unit: mUnit || 'Ly'
          };
        }
        return item;
      });
      onUpdateMenuItems(updated);
      showToast(`Đã cập nhật món: ${mName}`);
    } else {
      // Add mode
      const newItem: MenuItem = {
        id: `m_${Date.now()}`,
        name: mName,
        price: Number(mPrice),
        category: mCategory,
        description: mDescription,
        imageUrl: mImageUrl,
        isAvailable: mIsAvailable,
        isNew: true,
        unit: mUnit || 'Ly'
      };
      onUpdateMenuItems([...menuItems, newItem]);
      showToast(`Đã thêm món mới: ${mName}`);
    }
    setIsMenuModalOpen(false);
  };

  const handleDeleteMenuItem = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa món "${name}" khỏi thực đơn không?`)) {
      const updated = menuItems.filter(item => item.id !== id);
      onUpdateMenuItems(updated);
      showToast(`Đã xóa món: ${name}`);
    }
  };

  const handleToggleAvailability = (id: string) => {
    const updated = menuItems.map(item => {
      if (item.id === id) {
        const nextState = !item.isAvailable;
        showToast(`Đã chuyển "${item.name}" thành ${nextState ? 'CÒN HÀNG' : 'HẾT HÀNG'}`);
        return { ...item, isAvailable: nextState };
      }
      return item;
    });
    onUpdateMenuItems(updated);
  };

  // --- INVENTORY CRUD & ADJUST OPERATIONS ---
  const handleOpenCreateInvModal = () => {
    setSelectedInvItem(null);
    setInvName('');
    setInvInitialQuantity(10);
    setInvQuantity(10);
    setInvImportedQuantity(0);
    setInvExportedQuantity(0);
    setInvUnit('kg');
    setInvMinThreshold(5);
    setIsCreateInvOpen(true);
  };

  const handleOpenEditInvModal = (item: InventoryItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering stock adjustment on row click
    setSelectedInvItem(item);
    setInvName(item.name);
    setInvInitialQuantity(item.initialQuantity ?? item.quantity);
    setInvQuantity(item.quantity);
    setInvImportedQuantity(item.importedQuantity ?? 0);
    setInvExportedQuantity(item.exportedQuantity ?? 0);
    setInvUnit(item.unit);
    setInvMinThreshold(item.minThreshold);
    setIsCreateInvOpen(true);
  };

  const handleSaveInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) {
      showToast('Vui lòng nhập tên nguyên liệu!');
      return;
    }

    const calculatedQuantity = Number(invInitialQuantity) + Number(invImportedQuantity) - Number(invExportedQuantity);

    if (selectedInvItem) {
      // Edit
      const updated = inventoryItems.map(item => {
        if (item.id === selectedInvItem.id) {
          return {
            ...item,
            name: invName,
            initialQuantity: Number(invInitialQuantity),
            quantity: Number(calculatedQuantity.toFixed(3)),
            importedQuantity: Number(invImportedQuantity),
            exportedQuantity: Number(invExportedQuantity),
            unit: invUnit,
            minThreshold: Number(invMinThreshold),
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      });
      onUpdateInventoryItems(updated);
      showToast(`Đã cập nhật: ${invName}`);
    } else {
      // Create
      const newItem: InventoryItem = {
        id: `i_${Date.now()}`,
        name: invName,
        initialQuantity: Number(invInitialQuantity),
        quantity: Number(calculatedQuantity.toFixed(3)),
        importedQuantity: Number(invImportedQuantity),
        exportedQuantity: Number(invExportedQuantity),
        unit: invUnit,
        minThreshold: Number(invMinThreshold),
        lastUpdated: new Date().toISOString()
      };
      onUpdateInventoryItems([...inventoryItems, newItem]);
      showToast(`Đã thêm nguyên liệu: ${invName}`);
    }
    setIsCreateInvOpen(false);
  };

  const handleDeleteInventoryItem = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa nguyên liệu "${name}" khỏi kho?`)) {
      const updated = inventoryItems.filter(item => item.id !== id);
      onUpdateInventoryItems(updated);
      showToast(`Đã xóa khỏi kho: ${name}`);
    }
  };

  // Stock Adjustment
  const handleOpenAdjustStock = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustAmount('5');
    setAdjustType('in');
    setIsAdjustOpen(true);
  };

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    const val = Number(adjustAmount);
    if (isNaN(val) || val <= 0) {
      showToast('Vui lòng nhập số lượng hợp lệ!');
      return;
    }

    const multiplier = adjustType === 'in' ? 1 : -1;
    const change = val * multiplier;
    const nextQty = Math.max(0, adjustingItem.quantity + change);

    const currentImported = adjustingItem.importedQuantity ?? 0;
    const currentExported = adjustingItem.exportedQuantity ?? 0;

    const nextImported = adjustType === 'in' ? currentImported + val : currentImported;
    const nextExported = adjustType === 'out' ? currentExported + val : currentExported;

    const updated = inventoryItems.map(item => {
      if (item.id === adjustingItem.id) {
        return {
          ...item,
          quantity: Number(nextQty.toFixed(3)),
          importedQuantity: Number(nextImported.toFixed(3)),
          exportedQuantity: Number(nextExported.toFixed(3)),
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    });

    onUpdateInventoryItems(updated);
    showToast(
      adjustType === 'in'
        ? `📥 Đã nhập thêm +${val} ${adjustingItem.unit} cho ${adjustingItem.name}`
        : `📤 Đã xuất kho -${val} ${adjustingItem.unit} cho ${adjustingItem.name}`
    );
    setIsAdjustOpen(false);
  };

  // Quick preset adjust (+1, +5, etc)
  const handleQuickAdjustAmount = (amount: number) => {
    setAdjustAmount(amount.toString());
  };

  // Roll over / chốt kỳ kiểm kho
  const handleRolloverInventory = () => {
    if (confirm("Bạn có chắc muốn CHỐT KỲ KIỂM KHO không?\nHành động này sẽ thiết lập số TỒN ĐẦU KỲ mới bằng số LƯỢNG TỒN HIỆN TẠI của tất cả các nguyên vật liệu.")) {
      const updated = inventoryItems.map(item => ({
        ...item,
        initialQuantity: item.quantity,
        importedQuantity: 0,
        exportedQuantity: 0,
        lastUpdated: new Date().toISOString()
      }));
      onUpdateInventoryItems(updated);
      showToast("Đã chốt kỳ kiểm kho thành công! Số tồn hiện tại đã được đồng bộ làm Tồn đầu kỳ mới.");
    }
  };

  // Filter systems
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));
    const matchesCategory = menuCatFilter === 'all' || item.category === menuCatFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredInventoryItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(invSearch.toLowerCase());
    const isLowStock = item.quantity <= item.minThreshold;
    const matchesAlert = !showLowStockOnly || isLowStock;
    return matchesSearch && matchesAlert;
  });

  const lowStockCount = inventoryItems.filter(item => item.quantity <= item.minThreshold).length;

  const pendingKitchenOrders = (orders || []).filter(o => o.status === 'active' && !o.isPrepared);
  const pendingKitchenCount = pendingKitchenOrders.length;

  return (
    <div id="management_screen" className="flex-1 flex flex-col overflow-hidden bg-slate-900 pb-16 h-full text-slate-100">
      
      {/* Sub-tab pills selector: Menu vs Inventory vs Kitchen vs Sales - Extremely elegant */}
      <div className="bg-slate-950 p-3 shrink-0 flex items-center justify-center border-b border-slate-850">
        <div className="bg-slate-900 p-1 rounded-xl flex w-full max-w-md border border-slate-800">
          <button
            onClick={() => setSubTab('menu')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              subTab === 'menu'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee size={12} />
            <span>Món Ăn ({menuItems.length})</span>
          </button>
          <button
            onClick={() => setSubTab('inventory')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all relative ${
              subTab === 'inventory'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package size={12} />
            <span>Kho ({inventoryItems.length})</span>
            {lowStockCount > 0 && (
              <span className="absolute -top-1 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-[8px] font-black flex items-center justify-center text-white ring-2 ring-slate-900 animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('audit')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all relative ${
              subTab === 'audit'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare size={12} />
            <span>Kiểm Kê ({auditSessions?.length || 0})</span>
          </button>
          <button
            onClick={() => setSubTab('sales')}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all relative ${
              subTab === 'sales'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={12} />
            <span>Bán Ra</span>
          </button>
        </div>
      </div>

      {/* --- SUBTAB 1: MENU ITEM MANAGEMENT --- */}
      {subTab === 'menu' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Control Panel: Search & Add */}
          <div className="p-3 bg-slate-950/45 border-b border-slate-850 shrink-0 flex flex-col gap-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, mô tả..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-200"
                />
              </div>
              <button
                onClick={handleOpenAddMenuModal}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold px-3.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-orange-500/10 transition-all shrink-0"
              >
                <Plus size={15} className="stroke-[2.5]" />
                <span>Thêm Món</span>
              </button>
            </div>

            {/* Horizontally scrollable Category Filter for mobile thumb reach */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 items-center">
              <button
                onClick={() => setMenuCatFilter('all')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all border ${
                  menuCatFilter === 'all'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setMenuCatFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all border flex items-center gap-1 ${
                    menuCatFilter === cat.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}

              {/* Special Button to Add Category */}
              <button
                type="button"
                onClick={() => {
                  const name = prompt('Nhập tên danh mục mới:');
                  if (name && name.trim()) {
                    const icon = prompt('Nhập emoji biểu tượng cho danh mục (ví dụ: 🍿, 🥤, 🍮) hoặc để trống:', '🍽️') || '🍽️';
                    const newId = `cat_${Date.now()}`;
                    const newCat = { id: newId, name: name.trim(), icon: icon.trim() };
                    onUpdateCategories([...categories, newCat]);
                    setMenuCatFilter(newId);
                    showToast(`Đã thêm danh mục mới: ${name.trim()}`);
                  }
                }}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all border border-dashed border-slate-700 text-orange-400 hover:text-orange-300 hover:border-orange-500/50 flex items-center gap-1 bg-slate-900/50"
              >
                <Plus size={10} className="stroke-[2.5]" />
                <span>Thêm danh mục</span>
              </button>
            </div>

            {/* Rename/Delete Action Bar for the selected category */}
            {menuCatFilter !== 'all' && (
              <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900/60 rounded-xl border border-slate-850/60 max-w-fit animate-in fade-in slide-in-from-top-1 duration-150">
                <span className="text-[9px] font-bold text-slate-400">Danh mục chọn:</span>
                <span className="text-[10px] font-black text-slate-200">
                  {categories.find(c => c.id === menuCatFilter)?.icon} {categories.find(c => c.id === menuCatFilter)?.name}
                </span>
                <div className="h-3 w-px bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    const currentCat = categories.find(c => c.id === menuCatFilter);
                    if (!currentCat) return;
                    const newName = prompt(`Nhập tên mới cho danh mục "${currentCat.name}":`, currentCat.name);
                    if (newName && newName.trim() && newName.trim() !== currentCat.name) {
                      const updated = categories.map(c => c.id === menuCatFilter ? { ...c, name: newName.trim() } : c);
                      onUpdateCategories(updated);
                      showToast(`Đã đổi tên danh mục thành "${newName.trim()}"`);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 hover:text-amber-300 text-[9px] font-black hover:bg-slate-750 flex items-center gap-1 transition-all"
                >
                  <Edit2 size={9} /> Đổi tên
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentCat = categories.find(c => c.id === menuCatFilter);
                    if (!currentCat) return;
                    if (confirm(`Bạn có chắc muốn xóa danh mục "${currentCat.name}"?\nLưu ý: Tất cả món ăn thuộc danh mục này cũng sẽ bị xóa!`)) {
                      const updatedCategories = categories.filter(c => c.id !== menuCatFilter);
                      const updatedMenuItems = menuItems.filter(item => item.category !== menuCatFilter);
                      onUpdateCategories(updatedCategories);
                      onUpdateMenuItems(updatedMenuItems);
                      setMenuCatFilter('all');
                      showToast(`Đã xóa danh mục "${currentCat.name}" cùng các món ăn thuộc danh mục.`);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 hover:text-rose-300 text-[9px] font-black hover:bg-rose-950/80 flex items-center gap-1 transition-all"
                >
                  <Trash2 size={9} /> Xóa danh mục
                </button>
              </div>
            )}
          </div>

          {/* Menu Items list view */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 no-scrollbar">
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Coffee size={36} className="mx-auto text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold">Không tìm thấy món ăn nào</p>
                <p className="text-[10px] text-slate-650 mt-1">Thay đổi từ khóa hoặc bộ lọc thử lại</p>
              </div>
            ) : (
              filteredMenuItems.map(item => (
                <div 
                  key={item.id}
                  className={`bg-slate-950/40 border border-slate-850 rounded-2xl p-2.5 flex gap-3 transition-all ${
                    !item.isAvailable ? 'opacity-55 border-slate-900 bg-slate-950/20' : 'hover:border-slate-800'
                  }`}
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 relative flex items-center justify-center">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-1">
                        <Coffee size={20} className="mx-auto text-slate-500 stroke-[1.5]" />
                        <span className="text-[7px] font-black text-slate-500 block mt-1">KHÔNG ẢNH</span>
                      </div>
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-black text-red-400 tracking-wider">
                        HẾT MÓN
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-extrabold text-slate-100 truncate pr-2">
                          {item.name}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-bold bg-slate-900 px-1.5 py-0.5 rounded-md shrink-0 border border-slate-850">
                          {categories.find(c => c.id === item.category)?.name || 'Khác'}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}

                      {/* Display recipe formulation details */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.recipe && item.recipe.length > 0 ? (
                          item.recipe.map((rec, rIdx) => {
                            const inv = inventoryItems.find(i => i.id === rec.inventoryItemId);
                            if (!inv) return null;
                            return (
                              <span key={rIdx} className="text-[8px] bg-slate-900 text-slate-300 border border-slate-850 px-1.5 py-0.5 rounded-sm inline-flex items-center gap-0.5">
                                ⚖️ {inv.name}: <span className="font-bold text-orange-400">{rec.quantity}</span> {inv.unit}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[8px] font-bold bg-amber-500/10 text-amber-500/90 border border-amber-500/20 px-1.5 py-0.5 rounded-sm inline-flex items-center gap-0.5">
                            ⚠️ Chưa có định lượng
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-850/40">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-orange-400">
                          {formatVND(item.price)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold bg-slate-900 px-1 py-0.2 rounded border border-slate-850">
                          {item.unit || 'Ly'}
                        </span>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center gap-1">
                        {/* Recipe Formulation Config Button */}
                        <button
                          onClick={() => handleOpenRecipeModal(item)}
                          title="Cấu hình định lượng nguyên liệu"
                          className="p-1 px-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-[9px] font-bold flex items-center gap-0.5"
                        >
                          <span>⚖️</span>
                          <span className="xs:inline">Định lượng</span>
                        </button>

                        {/* Quick Toggle Available */}
                        <button
                          onClick={() => handleToggleAvailability(item.id)}
                          title={item.isAvailable ? 'Đánh dấu hết hàng' : 'Đánh dấu còn hàng'}
                          className={`p-1 rounded-lg border transition-all ${
                            item.isAvailable 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {item.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditMenuModal(item)}
                          className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white transition-all"
                        >
                          <Edit2 size={12} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteMenuItem(item.id, item.name)}
                          className="p-1 rounded-lg bg-red-950/30 border border-red-900/30 text-red-400 hover:bg-red-900/25 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: INVENTORY STOCK MANAGEMENT --- */}
      {subTab === 'inventory' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Top Control Panel: Search & Add & Alerts Toggle */}
          <div className="p-3 bg-slate-950/45 border-b border-slate-850 shrink-0 flex flex-col gap-2.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nguyên liệu kho..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-200"
                />
              </div>
              <button
                onClick={handleOpenCreateInvModal}
                className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold px-3.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-orange-500/10 transition-all shrink-0"
              >
                <Plus size={15} className="stroke-[2.5]" />
                <span>Thêm NL</span>
              </button>
            </div>

            {/* Alert filters & status indicators */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  showLowStockOnly
                    ? 'bg-red-500/15 border-red-500 text-red-400 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <AlertCircle size={12} className={showLowStockOnly ? 'animate-bounce' : ''} />
                <span>Cảnh báo hết kho ({lowStockCount})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRolloverInventory}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-400 font-extrabold border border-amber-500/30 rounded-full text-[10px] transition-all"
                  title="Đặt lại số lượng tồn đầu kỳ bằng tồn cuối hiện tại"
                >
                  <span>🔒 Chốt kỳ kiểm kho</span>
                </button>
                <span className="text-[10px] text-slate-500 font-medium hidden xs:inline">
                  Cập nhật: <span className="font-bold text-slate-400">Vừa xong</span>
                </span>
              </div>
            </div>
          </div>

          {/* Inventory Item Table list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
            {filteredInventoryItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Package size={36} className="mx-auto text-slate-700 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold">Kho trống hoặc không có kết quả</p>
                <p className="text-[10px] text-slate-650 mt-1">Vui lòng thêm mới hoặc bỏ bộ lọc cảnh báo</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-850 bg-slate-950/40 rounded-2xl">
                <table className="w-full text-left border-collapse min-w-[850px] text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider whitespace-nowrap">
                      <th className="py-3 px-4 font-black">Nguyên liệu</th>
                      <th className="py-3 px-2 text-center font-black">Tồn đầu kỳ</th>
                      <th className="py-3 px-2 text-center font-black text-emerald-400">Nhập trong kỳ</th>
                      <th className="py-3 px-2 text-center font-black text-rose-400">Xuất trong kỳ</th>
                      <th className="py-3 px-2 text-center font-black">Tồn cuối (Hiện tại)</th>
                      <th className="py-3 px-2 text-center font-black">Trạng thái / Còn lại</th>
                      <th className="py-3 px-2 text-center font-black">Hạn mức cảnh báo</th>
                      <th className="py-3 px-4 text-right font-black">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventoryItems.map(item => {
                      const isLow = item.quantity <= item.minThreshold;
                      const initial = item.initialQuantity ?? item.quantity;
                      const percentage = initial > 0 ? Math.max(0, Math.round((item.quantity / initial) * 100)) : 100;
                      
                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleOpenAdjustStock(item)}
                          className={`border-b border-slate-900/60 hover:bg-slate-900/30 transition-all cursor-pointer select-none active:scale-[0.995] whitespace-nowrap ${
                            isLow ? 'bg-red-950/5 hover:bg-red-950/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-extrabold text-slate-100 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[180px]" title={item.name}>{item.name}</span>
                              {isLow && (
                                <span className="text-[8px] bg-red-500/15 border border-red-500/30 text-red-400 font-extrabold px-1.5 py-0.5 rounded-md animate-pulse shrink-0 whitespace-nowrap">
                                  HẾT NL
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center text-amber-500 font-extrabold text-xs whitespace-nowrap">
                            {initial} <span className="text-[9px] text-slate-500 font-bold uppercase">{item.unit}</span>
                          </td>
                          <td className="py-3 px-2 text-center text-emerald-400 font-extrabold text-xs whitespace-nowrap">
                            +{item.importedQuantity ?? 0} <span className="text-[9px] text-slate-500 font-bold uppercase">{item.unit}</span>
                          </td>
                          <td className="py-3 px-2 text-center text-rose-400 font-extrabold text-xs whitespace-nowrap">
                            -{item.exportedQuantity ?? 0} <span className="text-[9px] text-slate-500 font-bold uppercase">{item.unit}</span>
                          </td>
                          <td className="py-3 px-2 text-center font-black text-xs whitespace-nowrap">
                            <span className={isLow ? 'text-red-400' : 'text-emerald-400'}>
                              {item.quantity}
                            </span>{' '}
                            <span className="text-[9px] text-slate-500 font-bold uppercase">{item.unit}</span>
                          </td>
                          <td className="py-3 px-2 text-center whitespace-nowrap">
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className={`font-extrabold text-[10px] ${isLow ? 'text-red-400' : 'text-slate-300'}`}>
                                {percentage}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isLow ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                  }`}
                                  style={{ width: `${Math.min(100, percentage)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center text-slate-400 font-semibold text-xs whitespace-nowrap">
                            {item.minThreshold} <span className="text-[9px] text-slate-500 font-bold uppercase">{item.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit NL Button */}
                              <button
                                onClick={(e) => handleOpenEditInvModal(item, e)}
                                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all active:scale-90"
                                title="Sửa thông tin"
                              >
                                <Edit2 size={12} />
                              </button>
                              
                              {/* Adjust stock button */}
                              <button
                                onClick={() => handleOpenAdjustStock(item)}
                                className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[9px] font-black rounded-lg transition-all shadow-sm shadow-orange-500/10"
                              >
                                +/- Nhập Xuất
                              </button>
      
                              {/* Delete NL button */}
                              <button
                                onClick={(e) => handleDeleteInventoryItem(item.id, item.name, e)}
                                className="p-1.5 rounded-lg bg-red-950/20 border border-red-950/30 text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-all active:scale-90"
                                title="Xóa nguyên liệu"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: AUDITING / KIỂM KÊ KHO HÀNG --- */}
      {subTab === 'audit' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Action Panel */}
          <div className="p-3 bg-slate-950/45 border-b border-slate-850 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider">Lịch sử kiểm kê hàng theo ngày</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Lịch sử chốt tồn thực tế định kỳ</p>
            </div>
            
            <button
              onClick={handleOpenNewAudit}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-500/10 transition-all cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Bắt đầu kiểm kho</span>
            </button>
          </div>

          {/* Audit History List */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-none pb-24">
            {(!auditSessions || auditSessions.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <AlertCircle size={28} className="stroke-[1.5] text-slate-600 mb-1.5 animate-pulse" />
                <p className="text-xs font-medium">Chưa có lịch sử kiểm kê kho nào</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Nhấp nút ở trên để bắt đầu đợt kiểm kho đầu tiên</p>
              </div>
            ) : (
              auditSessions.map((session) => {
                const totalDiffCount = session.items.filter(item => item.difference !== 0).length;
                const isExpanded = expandedAuditId === session.id;
                const formattedTime = new Date(session.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                const formattedDate = new Date(session.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

                return (
                  <div
                    key={session.id}
                    className="bg-slate-950/50 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-200 animate-in fade-in-50"
                  >
                    {/* Header Summary Row */}
                    <div
                      onClick={() => setExpandedAuditId(isExpanded ? null : session.id)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/30 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-200">{formattedDate}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{formattedTime}</span>
                        </div>
                        {session.notes && (
                          <p className="text-[10.5px] text-slate-400 font-medium truncate mt-1">{session.notes}</p>
                        )}
                      </div>

                      {/* Summary badges */}
                      <div className="flex items-center gap-3">
                        {totalDiffCount > 0 ? (
                          <span className="bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
                            <span>⚠️ Lệch {totalDiffCount} NVL</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
                            <span>✅ Khớp hoàn toàn</span>
                          </span>
                        )}
                        
                        <ChevronRight
                          size={14}
                          className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded Detail Table */}
                    {isExpanded && (
                      <div className="px-3 pb-4 pt-1 bg-slate-950/40 border-t border-slate-900/50">
                        {/* Physical Receipt/Paper Ticket design container */}
                        <div className="bg-amber-50 text-slate-950 p-4 rounded-xl border border-amber-100 shadow-lg font-mono text-[10.5px] leading-tight select-none relative overflow-hidden">
                          {/* Inner double border like classic bookkeeping form */}
                          <div className="border border-amber-200/50 p-3 rounded-lg bg-amber-50/50">
                            {/* Receipt Title */}
                            <div className="text-center pb-2.5 mb-2.5 border-b border-dashed border-amber-900/20 space-y-0.5">
                              <h3 className="text-[12px] font-black tracking-wider uppercase text-amber-950">PHIẾU KIỂM KÊ KHO HÀNG</h3>
                              <p className="text-[9px] text-amber-900/60 font-bold">Ngày: {formattedDate} | Giờ: {formattedTime}</p>
                              <p className="text-[9.5px] text-amber-900/80 italic font-medium">Ghi chú: {session.notes || 'Không ghi chú'}</p>
                            </div>

                            {/* Ticket Items Grid Table */}
                            <div className="overflow-x-auto no-scrollbar">
                              <table className="w-full text-[10px] text-left border-collapse min-w-[420px]">
                                <thead>
                                  <tr className="border-b-2 border-amber-900/20 text-amber-950 font-black tracking-wider text-[9px] uppercase">
                                    <th className="py-1.5 px-1 text-left">TÊN NL</th>
                                    <th className="py-1.5 px-1 text-center w-8">ĐVT</th>
                                    <th className="py-1.5 px-1 text-center w-10">TĐ</th>
                                    <th className="py-1.5 px-1 text-center w-10 text-emerald-800">NHẬP</th>
                                    <th className="py-1.5 px-1 text-center w-10 text-rose-800">XUẤT</th>
                                    <th className="py-1.5 px-1 text-center w-10">L.THUYẾT</th>
                                    <th className="py-1.5 px-1 text-center w-10 font-bold">THỰC TẾ</th>
                                    <th className="py-1.5 px-1 text-right w-12 text-amber-950">CHÊNH LỆCH</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-900/10 text-slate-800">
                                  {session.items.map((item) => {
                                    const opening = item.openingQty ?? item.systemQty;
                                    const imported = item.importedQty ?? 0;
                                    const exported = item.exportedQty ?? 0;
                                    const expected = item.systemQty;
                                    const actual = item.actualQty;
                                    const diff = item.difference;

                                    return (
                                      <tr key={item.itemId} className="hover:bg-amber-100/50 transition-all font-semibold">
                                        <td className="py-2 px-1 font-bold text-slate-900">
                                          <div>{item.itemName}</div>
                                          {diff !== 0 && (
                                            <div className="text-[8.5px] font-bold mt-0.5 leading-none">
                                              {diff < 0 ? (
                                                <span className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded-sm border border-rose-100">Hao hụt: {diff} {item.unit}</span>
                                              ) : (
                                                <span className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded-sm border border-emerald-100">Thặng dư: +{diff} {item.unit}</span>
                                              )}
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-2 px-1 text-center text-slate-600 font-bold">{item.unit}</td>
                                        <td className="py-2 px-1 text-center text-slate-700">{opening}</td>
                                        <td className="py-2 px-1 text-center text-emerald-700">+{imported}</td>
                                        <td className="py-2 px-1 text-center text-rose-700">-{exported}</td>
                                        <td className="py-2 px-1 text-center text-slate-750 font-medium">{expected}</td>
                                        <td className="py-2 px-1 text-center font-black text-slate-950">{actual}</td>
                                        <td className={`py-2 px-1 text-right font-black ${diff < 0 ? 'text-rose-600' : diff > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                          {diff > 0 ? `+${diff}` : diff}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Dotted border line */}
                            <div className="mt-3.5 pt-2 border-t border-dashed border-amber-900/20 text-[9px] text-amber-900/60 text-center space-y-0.5 font-bold">
                              <p className="uppercase text-amber-950">Mẫu biên bản lưu trữ K80</p>
                              <p>{storeInfo?.name || 'BÌNH DƯƠNG COFFEE & POS SYSTEM'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: SALES AND INGREDIENTS CONSUMPTION REPORT --- */}
      {subTab === 'sales' && (() => {
        // Date/Month filtering
        const filteredInvoices = (invoices || []).filter(inv => {
          if (salesFilterType === 'day') {
            if (!selectedSalesDate) return true;
            return inv.paymentTime.split('T')[0] === selectedSalesDate;
          } else {
            if (!selectedSalesMonth) return true;
            return inv.paymentTime.startsWith(selectedSalesMonth);
          }
        });

        // Calculations
        const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
        const totalInvoicesCount = filteredInvoices.length;
        const totalDishesCount = filteredInvoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

        // Group dishes
        const dishSalesMap: Record<string, { menuItemId: string; name: string; price: number; quantity: number; category: string; imageUrl: string }> = {};
        filteredInvoices.forEach(invoice => {
          invoice.items.forEach(item => {
            if (!dishSalesMap[item.menuItemId]) {
              const originalItem = menuItems.find(m => m.id === item.menuItemId);
              dishSalesMap[item.menuItemId] = {
                menuItemId: item.menuItemId,
                name: item.name,
                price: item.price,
                quantity: 0,
                category: originalItem?.category || 'coffee',
                imageUrl: originalItem?.imageUrl || '',
              };
            }
            dishSalesMap[item.menuItemId].quantity += item.quantity;
          });
        });

        const dishSalesList = Object.values(dishSalesMap).sort((a, b) => b.quantity - a.quantity);
        const maxDishQty = dishSalesList.length > 0 ? Math.max(...dishSalesList.map(d => d.quantity)) : 1;

        // Group ingredients
        const ingredientConsumptionMap: Record<string, { id: string; name: string; unit: string; quantity: number; currentStock: number; minThreshold: number }> = {};
        filteredInvoices.forEach(invoice => {
          invoice.items.forEach(item => {
            const originalItem = menuItems.find(m => m.id === item.menuItemId);
            if (originalItem && originalItem.recipe) {
              originalItem.recipe.forEach(recipeIngredient => {
                const invItem = inventoryItems.find(i => i.id === recipeIngredient.inventoryItemId);
                if (invItem) {
                  if (!ingredientConsumptionMap[recipeIngredient.inventoryItemId]) {
                    ingredientConsumptionMap[recipeIngredient.inventoryItemId] = {
                      id: recipeIngredient.inventoryItemId,
                      name: invItem.name,
                      unit: invItem.unit,
                      quantity: 0,
                      currentStock: invItem.quantity,
                      minThreshold: invItem.minThreshold
                    };
                  }
                  ingredientConsumptionMap[recipeIngredient.inventoryItemId].quantity += recipeIngredient.quantity * item.quantity;
                }
              });
            }
          });
        });

        const ingredientConsumptionList = Object.values(ingredientConsumptionMap).sort((a, b) => b.quantity - a.quantity);
        const maxIngredientQty = ingredientConsumptionList.length > 0 ? Math.max(...ingredientConsumptionList.map(i => i.quantity)) : 1;

        return (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Date Filter Bar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-850 shrink-0 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">Lọc doanh thu bán ra:</span>
                
                {/* Day / Month toggle */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setSalesFilterType('day')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                      salesFilterType === 'day'
                        ? 'bg-orange-500 text-white font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalesFilterType('month')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                      salesFilterType === 'month'
                        ? 'bg-orange-500 text-white font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tháng
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {salesFilterType === 'day' ? (
                  <input
                    type="date"
                    value={selectedSalesDate}
                    onChange={(e) => setSelectedSalesDate(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-orange-400 font-extrabold focus:outline-none focus:border-orange-500/50 flex-1 max-w-[150px]"
                  />
                ) : (
                  <input
                    type="month"
                    value={selectedSalesMonth}
                    onChange={(e) => setSelectedSalesMonth(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-orange-400 font-extrabold focus:outline-none focus:border-orange-500/50 flex-1 max-w-[150px]"
                  />
                )}
                
                <button
                  type="button"
                  onClick={() => {
                    if (salesFilterType === 'day') {
                      setSelectedSalesDate('');
                    } else {
                      setSelectedSalesMonth('');
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    (salesFilterType === 'day' && selectedSalesDate === '') || (salesFilterType === 'month' && selectedSalesMonth === '')
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tất cả
                </button>
              </div>
            </div>
            {/* Sales Stats Bento Cards */}
            <div className="p-3 bg-slate-950/45 border-b border-slate-850 shrink-0 grid grid-cols-3 gap-2">
              <div className="bg-slate-950/80 border border-slate-850/80 p-2 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Doanh thu</span>
                <div>
                  <span className="text-xs font-black text-emerald-400 block truncate">{formatVND(totalRevenue)}</span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5 truncate">
                    {salesFilterType === 'day' 
                      ? (selectedSalesDate ? `Ngày ${selectedSalesDate.split('-').reverse().join('/')}` : 'Tất cả các ngày')
                      : (selectedSalesMonth ? `Tháng ${selectedSalesMonth.split('-').reverse().slice(0, 2).join('/')}` : 'Tất cả các tháng')
                    }
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-850/80 p-2 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hóa đơn</span>
                <div>
                  <span className="text-xs font-black text-orange-400 block">{totalInvoicesCount} đơn</span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Đã xong</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-850/80 p-2 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sản lượng</span>
                <div>
                  <span className="text-xs font-black text-blue-400 block">{totalDishesCount} món</span>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5">Đã bán ra</span>
                </div>
              </div>
            </div>

            {/* Selector Segment: Dishes vs Ingredients */}
            <div className="p-2.5 bg-slate-950/20 border-b border-slate-850 shrink-0 flex gap-2">
              <button
                onClick={() => setSalesSegment('dishes')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  salesSegment === 'dishes'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-black'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <span>🍔 Món Ăn Bán Ra ({dishSalesList.length})</span>
              </button>
              <button
                onClick={() => setSalesSegment('ingredients')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  salesSegment === 'ingredients'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-black'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400'
                }`}
              >
                <span>🌾 Nguyên Liệu ({ingredientConsumptionList.length})</span>
              </button>
            </div>

            {/* Content List Area */}
            <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2 no-scrollbar">
              {salesSegment === 'dishes' ? (
                dishSalesList.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-slate-950/20 border border-slate-850/60 rounded-3xl">
                    <span className="text-3xl block mb-2">📊</span>
                    <h4 className="text-xs font-bold text-slate-300">Chưa có đơn hàng hoàn thành hôm nay</h4>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Các món ăn và định lượng nguyên liệu bán ra sẽ tự động tổng hợp tại đây ngay khi có đơn hàng được thanh toán thành công.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Chi tiết món</span>
                      <span>S.Lượng / Tổng thu</span>
                    </div>
                    {dishSalesList.map((dish, idx) => {
                      const relativeWidth = Math.max(8, (dish.quantity / maxDishQty) * 100);
                      const catInfo = categories.find(c => c.id === dish.category);
                      const catLabel = catInfo ? catInfo.name : 'Món khác';
                      const catIcon = catInfo ? catInfo.icon : '☕';

                      return (
                        <div key={dish.menuItemId} className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-2xl flex items-center gap-3 hover:border-slate-800 transition-all">
                          {/* Left Number Badge */}
                          <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400">
                            {idx + 1}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-black text-slate-200 truncate">{dish.name}</span>
                              <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[8px] font-bold text-amber-500 rounded-md">
                                {catIcon} {catLabel}
                              </span>
                            </div>
                            
                            {/* Visual Progress Bar of Sales Share */}
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                                  style={{ width: `${relativeWidth}%` }}
                                />
                              </div>
                              <span className="text-[8px] text-slate-500 font-bold whitespace-nowrap">Đơn giá: {formatVND(dish.price)}</span>
                            </div>
                          </div>

                          {/* Sales Aggregation Info */}
                          <div className="text-right shrink-0">
                            <div className="text-xs font-black text-amber-400">
                              x{dish.quantity}
                            </div>
                            <div className="text-[10px] font-bold text-slate-300 mt-0.5">
                              {formatVND(dish.quantity * dish.price)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                ingredientConsumptionList.length === 0 ? (
                  <div className="text-center py-16 px-4 bg-slate-950/20 border border-slate-850/60 rounded-3xl">
                    <span className="text-3xl block mb-2">🌾</span>
                    <h4 className="text-xs font-bold text-slate-300">Chưa có nguyên liệu tiêu hao</h4>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Vui lòng đảm bảo các món ăn bán ra đã được cấu hình Định lượng nguyên liệu (Công thức chế biến) trong phần Thực đơn.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Nguyên vật liệu</span>
                      <span>Hao hụt / Tồn kho còn lại</span>
                    </div>
                    {ingredientConsumptionList.map((ing) => {
                      const isLow = ing.currentStock <= ing.minThreshold;
                      const relativeWidth = Math.max(8, (ing.quantity / maxIngredientQty) * 100);

                      return (
                        <div key={ing.id} className="bg-slate-950/40 border border-slate-850/60 p-3 rounded-2xl flex items-center gap-3 hover:border-slate-800 transition-all">
                          {/* Icon marker */}
                          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0 font-bold">
                            📦
                          </div>

                          {/* Ingredient Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-xs font-black text-slate-200 truncate">{ing.name}</span>
                              {isLow && (
                                <span className="px-1.5 py-0.5 bg-red-950/30 border border-red-900/30 text-[8px] font-bold text-red-400 rounded-md animate-pulse">
                                  🚨 Sắp hết kho!
                                </span>
                              )}
                            </div>

                            {/* Visual Progress Bar of Consumed amount */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-500"
                                  style={{ width: `${relativeWidth}%` }}
                                />
                              </div>
                              <span className="text-[8px] text-slate-500 font-bold whitespace-nowrap">Cảnh báo: &lt;={ing.minThreshold} {ing.unit}</span>
                            </div>
                          </div>

                          {/* Usage quantity & Stock level */}
                          <div className="text-right shrink-0">
                            <div className="text-xs font-black text-rose-400">
                              -{ing.quantity.toFixed(2)} <span className="text-[8px] text-slate-500 font-bold uppercase">{ing.unit}</span>
                            </div>
                            <div className="text-[9px] font-bold mt-1 text-slate-400">
                              Còn: <span className={isLow ? 'text-red-400 font-black' : 'text-emerald-400'}>{ing.currentStock.toFixed(2)}</span> {ing.unit}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
        );
      })()}


      {/* --- MODAL A: ADD/EDIT MENU ITEM FORM --- */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>{selectedMenuItem ? '📝 Sửa Món Ăn' : '✨ Thêm Món Mới'}</span>
              </h3>
              <button 
                onClick={() => setIsMenuModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSaveMenuItem} className="p-4 space-y-3">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tên món ăn/thức uống <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cà phê cốt dừa..."
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100"
                />
              </div>

              {/* Price & Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Giá bán (VNĐ) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={mPrice}
                    onChange={(e) => setMPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100 font-bold text-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Danh mục món <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={mCategory}
                    onChange={(e) => setMCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Unit of measurement (Đơn vị tính) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Đơn vị tính <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Ly, Phần, Đĩa..."
                    value={mUnit}
                    onChange={(e) => setMUnit(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100 font-semibold"
                  />
                  <select
                    value={mUnit}
                    onChange={(e) => setMUnit(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-400"
                  >
                    <option value="">-- Chọn nhanh --</option>
                    {['Ly', 'Cốc', 'Tách', 'Phần', 'Đĩa', 'Chén', 'Chai', 'Lon', 'Cái', 'Ổ', 'Tô'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Mô tả món ăn
                </label>
                <textarea
                  placeholder="Mô tả tóm tắt nguyên liệu, cách pha chế..."
                  value={mDescription}
                  onChange={(e) => setMDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-slate-100 resize-none"
                />
              </div>

              {/* Image URL with quick options */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Đường dẫn ảnh (URL)
                  </label>
                  {mImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setMImageUrl('');
                        showToast('Đã xóa đường dẫn ảnh của món ăn!');
                      }}
                      className="text-[9px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-0.5 active:scale-95 transition-all bg-rose-950/20 px-1.5 py-0.5 rounded border border-rose-900/30"
                    >
                      <Trash2 size={9} /> Xóa ảnh hiện tại
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Không có ảnh (nhấp mẫu bên dưới hoặc dán link)..."
                  value={mImageUrl}
                  onChange={(e) => setMImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100 text-[10px] font-mono"
                />
                <div className="flex gap-1.5 mt-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[9px] text-slate-500 font-bold py-0.5 shrink-0">Chọn nhanh mẫu:</span>
                  {[
                    { name: '☕ Cafe', url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60' },
                    { name: '🧋 Trà sữa', url: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=150&auto=format&fit=crop&q=60' },
                    { name: '🍹 Nước ép', url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150&auto=format&fit=crop&q=60' },
                    { name: '🍟 Snack', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=60' },
                    { name: '🍜 Bánh mì', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=150&auto=format&fit=crop&q=60' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMImageUrl(preset.url)}
                      className="bg-slate-950 border border-slate-850 hover:border-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 text-slate-400"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2">
                  {mIsAvailable ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                  )}
                  <div>
                    <p className="text-xs font-extrabold text-slate-100">Đang phục vụ (Còn món)</p>
                    <p className="text-[9px] text-slate-500">Mở bán ngay lập tức trên thực đơn POS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMIsAvailable(!mIsAvailable)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors relative focus:outline-none ${
                    mIsAvailable ? 'bg-orange-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    mIsAvailable ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-300 py-2.5 text-xs font-bold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-xs font-black rounded-xl transition-all shadow-md shadow-orange-500/10"
                >
                  {selectedMenuItem ? 'Cập Nhật' : 'Lưu Lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- MODAL B: CREATE/EDIT INVENTORY ITEM --- */}
      {isCreateInvOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-100">
                {selectedInvItem ? '📝 Chỉnh Sửa Nguyên Liệu' : '✨ Thêm Nguyên Liệu Kho'}
              </h3>
              <button 
                onClick={() => setIsCreateInvOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveInventoryItem} className="p-4 space-y-3">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tên nguyên liệu/vật tư <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bột Matcha Nhật, Thạch sương sáo..."
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100"
                />
              </div>

              {/* Quantity, Unit & Threshold */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3 border border-slate-850/80 rounded-2xl">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tồn đầu kỳ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.001}
                    value={invInitialQuantity}
                    onChange={(e) => setInvInitialQuantity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-slate-100 font-bold text-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tồn cuối (Hiện tại)
                  </label>
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-bold text-emerald-400 min-h-[30px] flex items-center">
                    {(Number(invInitialQuantity) + Number(invImportedQuantity) - Number(invExportedQuantity)).toFixed(2)} <span className="text-[9px] text-slate-500 ml-1">{invUnit}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nhập trong kỳ
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={invImportedQuantity}
                    onChange={(e) => setInvImportedQuantity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Xuất trong kỳ
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={invExportedQuantity}
                    onChange={(e) => setInvExportedQuantity(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-orange-500 text-rose-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Đơn vị tính <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      placeholder="kg, g, lít..."
                      value={invUnit}
                      onChange={(e) => setInvUnit(e.target.value)}
                      className="w-1/2 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100 font-semibold"
                    />
                    <select
                      value={invUnit}
                      onChange={(e) => setInvUnit(e.target.value)}
                      className="w-1/2 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-1 py-2 text-[10px] focus:outline-none focus:border-orange-500 text-slate-400"
                    >
                      <option value="">-- Chọn --</option>
                      {['kg', 'g', 'lít', 'ml', 'lon', 'hộp', 'chai', 'ổ', 'bao', 'thùng', 'cái', 'viên'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1" title="Báo đỏ khi số lượng dưới mức này">
                    Ngưỡng cảnh báo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={0.001}
                    value={invMinThreshold}
                    onChange={(e) => setInvMinThreshold(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-orange-500 text-slate-100 text-red-400 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850 text-[10px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">💡 Hướng dẫn định mức:</p>
                <p>Hệ thống tự động bật cảnh báo nhấp nháy màu đỏ khi số tồn kho thực tế xuống thấp hơn hoặc bằng <span className="font-bold text-red-400">Ngưỡng cảnh báo</span>.</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateInvOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-300 py-2.5 text-xs font-bold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 text-xs font-black rounded-xl transition-all shadow-md shadow-orange-500/10"
                >
                  {selectedInvItem ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- MODAL C: QUICK STOCK ADJUSTMENT DIALOG (NHẬP/XUẤT KHO) --- */}
      {isAdjustOpen && adjustingItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phiếu thay đổi kho</h3>
                <h2 className="text-sm font-black text-slate-100 mt-0.5">{adjustingItem.name}</h2>
              </div>
              <button 
                onClick={() => setIsAdjustOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="p-4 space-y-4">
              {/* Current Quantity display banner */}
              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-850 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Số tồn thực tế hiện tại:</span>
                <span className="text-base font-black text-orange-400">
                  {adjustingItem.quantity} {adjustingItem.unit}
                </span>
              </div>

              {/* Adjust Type Tab Switcher: In vs Out */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Hình thức nghiệp vụ
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <button
                    type="button"
                    onClick={() => setAdjustType('in')}
                    className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      adjustType === 'in'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp size={14} />
                    <span>📥 Nhập kho (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('out')}
                    className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      adjustType === 'out'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingDown size={14} />
                    <span>📤 Xuất kho/Hao hụt (-)</span>
                  </button>
                </div>
              </div>

              {/* Numeric input & presets */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nhập số lượng ({adjustingItem.unit}) <span className="text-red-400">*</span>
                </label>
                
                {/* Numeric input with custom size */}
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0.1}
                    step={0.1}
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-500 text-slate-100 font-black text-center"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                    {adjustingItem.unit}
                  </span>
                </div>

                {/* Micro presets for quick one-tap mobile adjustment */}
                <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar justify-center">
                  {[1, 5, 10, 20, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleQuickAdjustAmount(num)}
                      className="px-3 py-1 bg-slate-950 hover:bg-slate-850 text-slate-300 font-extrabold border border-slate-800 hover:border-slate-700 rounded-lg text-xs transition-all shrink-0 active:scale-95"
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-300 py-2.5 text-xs font-bold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={`flex-1 text-white py-2.5 text-xs font-black rounded-xl transition-all shadow-md ${
                    adjustType === 'in' 
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10' 
                      : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                  }`}
                >
                  Xác Nhận {adjustType === 'in' ? 'Nhập' : 'Xuất'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* --- MODAL D: DETAILED RECIPE FORMULATION DIALOG (ĐỊNH LƯỢNG MÓN) --- */}
      {isRecipeModalOpen && recipeItem && (
        <div id="recipe_modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <span>⚖️</span> Định Lượng Món Ăn & Đồ Uống
                </h3>
                <h2 className="text-sm font-black text-slate-100 mt-0.5">{recipeItem.name}</h2>
              </div>
              <button 
                onClick={() => setIsRecipeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Info section explaining how it works */}
              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-850 text-[10px] text-slate-400 flex items-start gap-2.5">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-300">💡 Nguyên lý trừ kho tự động:</p>
                  <p className="mt-0.5 leading-relaxed">
                    Khi đơn hàng chứa món này được thanh toán hoàn tất, hệ thống sẽ tự động trừ số lượng nguyên liệu tương ứng khỏi kho hàng thực tế của quán.
                  </p>
                </div>
              </div>

              {/* Current formula list */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Nguyên liệu cấu thành ({recipeItem.recipe?.length || 0})
                </h3>

                {(!recipeItem.recipe || recipeItem.recipe.length === 0) ? (
                  <div className="text-center py-6 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-500">
                    <p className="text-[10px] font-medium">Chưa thiết lập định lượng nguyên liệu</p>
                    <p className="text-[9px] mt-0.5 text-slate-650">Thêm nguyên liệu phía dưới để bắt đầu trừ kho tự động</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                    {recipeItem.recipe.map((rec, idx) => {
                      const ingredient = inventoryItems.find(i => i.id === rec.inventoryItemId);
                      if (!ingredient) return null;
                      const isEditing = editingIngredientId === rec.inventoryItemId;
                      return (
                        <div key={idx} className="bg-slate-950 rounded-xl p-2.5 border border-slate-850/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{ingredient.name}</p>
                              <p className="text-[9px] text-slate-500">
                                Hiện có: {ingredient.quantity} {ingredient.unit}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step={0.001}
                                  min={0.001}
                                  value={editingQuantity}
                                  onChange={(e) => setEditingQuantity(e.target.value)}
                                  className="w-20 bg-slate-900 border border-orange-500 rounded-lg px-2 py-1 text-xs font-black text-orange-400 text-center focus:outline-none"
                                  placeholder="Định mức"
                                  autoFocus
                                />
                                <span className="text-[10px] text-slate-400 mr-1">{ingredient.unit}</span>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedIngredient(rec.inventoryItemId)}
                                  className="p-1 rounded-md text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/15"
                                  title="Lưu định lượng"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingIngredientId(null)}
                                  className="p-1 rounded-md text-slate-400 hover:bg-slate-800 border border-slate-800"
                                  title="Hủy"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="text-xs font-black text-orange-400">{rec.quantity}</span>
                                  <span className="text-[10px] text-slate-400 ml-1">{ingredient.unit}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingIngredientId(rec.inventoryItemId);
                                    setEditingQuantity(rec.quantity.toString());
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-orange-400 hover:bg-orange-950/20 transition-all border border-slate-800/60"
                                  title="Sửa định lượng"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredientFromRecipe(rec.inventoryItemId)}
                                  className="p-1 rounded-md text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 transition-all border border-red-900/10"
                                  title="Xóa nguyên liệu khỏi công thức"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add ingredient form to formula */}
              {inventoryItems.filter(
                inv => !(recipeItem.recipe?.some(r => r.inventoryItemId === inv.id))
              ).length > 0 ? (
                <form onSubmit={handleAddIngredientToRecipe} className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    ➕ Thêm nguyên liệu vào công thức
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nguyên liệu trong kho
                      </label>
                      <select
                        value={selectedIngredientId}
                        onChange={(e) => setSelectedIngredientId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-[11px] focus:outline-none focus:border-orange-500 text-slate-100"
                        required
                      >
                        {inventoryItems
                          .filter(inv => !(recipeItem.recipe?.some(r => r.inventoryItemId === inv.id)))
                          .map(inv => (
                            <option key={inv.id} value={inv.id}>
                              {inv.name} ({inv.unit})
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Định mức / cốc
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={0.001}
                          min={0.001}
                          required
                          value={ingredientQuantity}
                          onChange={(e) => setIngredientQuantity(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] focus:outline-none focus:border-orange-500 text-slate-100 font-extrabold text-center"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500">
                          {inventoryItems.find(i => i.id === selectedIngredientId)?.unit || ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white py-2 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus size={12} className="stroke-[2.5]" />
                    <span>Thêm vào định lượng</span>
                  </button>
                </form>
              ) : (
                <div className="bg-slate-950/40 rounded-2xl p-3 border border-slate-850 text-center text-[10px] text-slate-500">
                  🎉 Toàn bộ nguyên liệu trong kho đã được thêm vào định lượng của món này!
                </div>
              )}

              {/* Close Panel Button */}
              <button
                type="button"
                onClick={() => setIsRecipeModalOpen(false)}
                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-300 font-bold py-2.5 text-xs rounded-xl transition-all"
              >
                Đóng & Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL E: NEW AUDIT SESSION / PHIẾU KIỂM KÊ MỚI --- */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Phiếu kiểm kê kho</h3>
                <h2 className="text-sm font-black text-orange-400 mt-0.5">Thực tế khớp tồn hệ thống</h2>
              </div>
              <button 
                onClick={() => setIsAuditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveAudit} className="p-4 space-y-4">
              {/* Scrollable list of items to audit */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Nhập số lượng thực tế kiểm kho
                </label>
                
                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1 no-scrollbar border border-slate-850/60 p-2 rounded-2xl bg-slate-950/40">
                  {inventoryItems.map((item) => {
                    const actual = auditQuantities[item.id] ?? item.quantity;
                    const diff = Number((actual - item.quantity).toFixed(3));
                    return (
                      <div key={item.id} className="bg-slate-900/60 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-200 truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500 font-bold">Hệ thống: {item.quantity} {item.unit}</span>
                            {diff === 0 ? (
                              <span className="text-[9.5px] text-slate-500 font-bold">Khớp</span>
                            ) : diff < 0 ? (
                              <span className="text-[9.5px] text-red-500 font-extrabold">Hụt: {diff}</span>
                            ) : (
                              <span className="text-[9.5px] text-emerald-500 font-extrabold">Dư: +{diff}</span>
                            )}
                          </div>
                        </div>

                        {/* Input element */}
                        <div className="relative w-28 shrink-0">
                          <input
                            type="number"
                            step={0.001}
                            min={0}
                            value={actual}
                            onChange={(e) => handleUpdateAuditQty(item.id, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-2 py-2 text-xs font-black text-center text-slate-100"
                            required
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500 uppercase">
                            {item.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ghi chú phiếu kiểm kê
                </label>
                <input
                  type="text"
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Ví dụ: Kiểm kho ca tối, bàn giao ca..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 py-2.5 text-xs font-bold rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 text-xs font-black rounded-xl transition-all shadow-md shadow-orange-500/15"
                >
                  Lưu & Đồng bộ tồn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
