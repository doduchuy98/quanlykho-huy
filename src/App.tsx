import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Grid3X3, 
  History, 
  Settings as SettingsIcon, 
  Store,
  ChevronRight,
  TrendingUp,
  X,
  Layers,
  Home
} from 'lucide-react';

import { Table, Zone, Order, OrderItem, MenuItem, Invoice, BankConfig, InventoryItem, AuditSession } from './types';
import { INITIAL_TABLES, INITIAL_ZONES, INITIAL_ORDERS, MENU_ITEMS, INITIAL_INVENTORY } from './data';
import PhoneFrame from './components/PhoneFrame';
import TablesScreen from './components/TablesScreen';
import MobilePOSScreen from './components/MobilePOSScreen';
import CartBottomSheet from './components/CartBottomSheet';
import VietQRModal from './components/VietQRModal';
import QuickActionModal from './components/QuickActionModal';
import AddTableModal from './components/AddTableModal';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';
import ManagementTab from './components/ManagementTab';
import HomeTab from './components/HomeTab';
import ProvisionalModal from './components/ProvisionalModal';
import { formatVND } from './utils';

export default function App() {
  // --- STATE INIT WITH LOCALSTORAGE ---
  const [zones, setZones] = useState<Zone[]>(() => {
    const saved = localStorage.getItem('fb_pos_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('fb_pos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fb_pos_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('fb_pos_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [bankConfig, setBankConfig] = useState<BankConfig>(() => {
    const saved = localStorage.getItem('fb_pos_bank_config');
    return saved ? JSON.parse(saved) : {
      bankId: 'mbb',
      accountNo: '190367890209',
      accountName: 'AN NAM COFFEE AND FOOD'
    };
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('fb_pos_menu_items');
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('fb_pos_inventory_items');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>(() => {
    const saved = localStorage.getItem('fb_pos_categories');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'coffee', name: 'Cà phê', icon: '☕' },
      { id: 'tea', name: 'Trà sữa', icon: '🧋' },
      { id: 'juice', name: 'Sinh tố & Nước ép', icon: '🍹' },
      { id: 'snack', name: 'Đồ ăn vặt', icon: '🍟' },
      { id: 'food', name: 'Điểm tâm', icon: '🍜' },
    ];
  });

  const [auditSessions, setAuditSessions] = useState<AuditSession[]>(() => {
    const saved = localStorage.getItem('fb_pos_audit_sessions');
    if (saved) return JSON.parse(saved);
    
    // Seed initial audit sessions
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    return [
      {
        id: 'aud_1',
        date: yesterdayStr,
        time: `${yesterdayStr}T22:30:00Z`,
        notes: 'Kiểm kê cuối ngày - Ca tối bàn giao',
        items: [
          { itemId: 'i1', itemName: 'Cà phê hạt Robusta', unit: 'kg', systemQty: 25.0, actualQty: 24.8, difference: -0.2, openingQty: 20, importedQty: 10, exportedQty: 5, closingQty: 24.8 },
          { itemId: 'i2', itemName: 'Sữa đặc Ngôi Sao', unit: 'lon', systemQty: 50, actualQty: 50, difference: 0, openingQty: 40, importedQty: 20, exportedQty: 10, closingQty: 50 },
          { itemId: 'i5', itemName: 'Bánh mì tươi (ổ)', unit: 'ổ', systemQty: 8, actualQty: 6, difference: -2, openingQty: 10, importedQty: 5, exportedQty: 7, closingQty: 6 },
          { itemId: 'i12', itemName: 'Đá viên tinh khiết', unit: 'kg', systemQty: 125, actualQty: 120, difference: -5, openingQty: 100, importedQty: 50, exportedQty: 25, closingQty: 120 }
        ]
      },
      {
        id: 'aud_2',
        date: twoDaysAgoStr,
        time: `${twoDaysAgoStr}T22:15:00Z`,
        notes: 'Kiểm kê định kỳ đầu tuần',
        items: [
          { itemId: 'i1', itemName: 'Cà phê hạt Robusta', unit: 'kg', systemQty: 30.0, actualQty: 30.0, difference: 0, openingQty: 30.0, importedQty: 0, exportedQty: 0, closingQty: 30.0 },
          { itemId: 'i3', itemName: 'Trà đen nguyên lá', unit: 'kg', systemQty: 15.0, actualQty: 14.9, difference: -0.1, openingQty: 15.0, importedQty: 0, exportedQty: 0.1, closingQty: 14.9 },
          { itemId: 'i4', itemName: 'Trân châu đen Royal', unit: 'kg', systemQty: 20.0, actualQty: 20.0, difference: 0, openingQty: 20.0, importedQty: 0, exportedQty: 0, closingQty: 20.0 },
          { itemId: 'i6', itemName: 'Bơ sáp Đắk Lắk', unit: 'kg', systemQty: 10.0, actualQty: 9.5, difference: -0.5, openingQty: 10.0, importedQty: 0, exportedQty: 0.5, closingQty: 9.5 }
        ]
      }
    ];
  });

  // --- UI FLOW STATES ---
  const [currentTab, setCurrentTab] = useState<'home' | 'tables' | 'history' | 'management' | 'settings'>('home');

  const [selectedZoneId, setSelectedZoneId] = useState('all');
  const [activeTableForPOS, setActiveTableForPOS] = useState<Table | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTableForAction, setActiveTableForAction] = useState<Table | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isProvisionalOpen, setIsProvisionalOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('fb_pos_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [accentColor, setAccentColor] = useState<'orange' | 'emerald' | 'blue' | 'purple' | 'rose'>(() => {
    return (localStorage.getItem('fb_pos_accent_color') as any) || 'orange';
  });
  const [radius, setRadius] = useState<'sharp' | 'medium' | 'round'>(() => {
    return (localStorage.getItem('fb_pos_radius') as any) || 'round';
  });
  const [fontFamily, setFontFamily] = useState<'inter' | 'outfit' | 'space-grotesk' | 'playfair' | 'mono'>(() => {
    return (localStorage.getItem('fb_pos_font_family') as any) || 'inter';
  });

  // --- PERSISTENCE SYNCHRONIZATION ---
  useEffect(() => {
    localStorage.setItem('fb_pos_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    localStorage.setItem('fb_pos_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('fb_pos_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fb_pos_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('fb_pos_bank_config', JSON.stringify(bankConfig));
  }, [bankConfig]);

  useEffect(() => {
    localStorage.setItem('fb_pos_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('fb_pos_inventory_items', JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  useEffect(() => {
    localStorage.setItem('fb_pos_audit_sessions', JSON.stringify(auditSessions));
  }, [auditSessions]);

  useEffect(() => {
    localStorage.setItem('fb_pos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fb_pos_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fb_pos_accent_color', accentColor);
    const root = document.documentElement;
    if (accentColor === 'orange') {
      root.style.setProperty('--primary-400', '#fb923c');
      root.style.setProperty('--primary-500', '#f97316');
      root.style.setProperty('--primary-600', '#ea580c');
    } else if (accentColor === 'emerald') {
      root.style.setProperty('--primary-400', '#34d399');
      root.style.setProperty('--primary-500', '#10b981');
      root.style.setProperty('--primary-600', '#059669');
    } else if (accentColor === 'blue') {
      root.style.setProperty('--primary-400', '#60a5fa');
      root.style.setProperty('--primary-500', '#3b82f6');
      root.style.setProperty('--primary-600', '#2563eb');
    } else if (accentColor === 'purple') {
      root.style.setProperty('--primary-400', '#c084fc');
      root.style.setProperty('--primary-500', '#a855f7');
      root.style.setProperty('--primary-600', '#9333ea');
    } else if (accentColor === 'rose') {
      root.style.setProperty('--primary-400', '#f472b6');
      root.style.setProperty('--primary-500', '#ec4899');
      root.style.setProperty('--primary-600', '#db2777');
    }
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('fb_pos_radius', radius);
    const root = document.documentElement;
    if (radius === 'sharp') {
      root.style.setProperty('--radius-custom-sm', '0px');
      root.style.setProperty('--radius-custom-md', '0px');
      root.style.setProperty('--radius-custom-lg', '0px');
      root.style.setProperty('--radius-custom-xl', '0px');
      root.style.setProperty('--radius-custom-2xl', '0px');
      root.style.setProperty('--radius-custom-3xl', '0px');
    } else if (radius === 'medium') {
      root.style.setProperty('--radius-custom-sm', '4px');
      root.style.setProperty('--radius-custom-md', '6px');
      root.style.setProperty('--radius-custom-lg', '8px');
      root.style.setProperty('--radius-custom-xl', '10px');
      root.style.setProperty('--radius-custom-2xl', '12px');
      root.style.setProperty('--radius-custom-3xl', '14px');
    } else if (radius === 'round') {
      root.style.setProperty('--radius-custom-sm', '6px');
      root.style.setProperty('--radius-custom-md', '8px');
      root.style.setProperty('--radius-custom-lg', '12px');
      root.style.setProperty('--radius-custom-xl', '16px');
      root.style.setProperty('--radius-custom-2xl', '20px');
      root.style.setProperty('--radius-custom-3xl', '24px');
    }
  }, [radius]);

  useEffect(() => {
    localStorage.setItem('fb_pos_font_family', fontFamily);
    const root = document.documentElement;
    if (fontFamily === 'inter') {
      root.style.setProperty('--font-family-custom', '"Inter", ui-sans-serif, system-ui, sans-serif');
    } else if (fontFamily === 'outfit') {
      root.style.setProperty('--font-family-custom', '"Outfit", "Inter", sans-serif');
    } else if (fontFamily === 'space-grotesk') {
      root.style.setProperty('--font-family-custom', '"Space Grotesk", "Inter", sans-serif');
    } else if (fontFamily === 'playfair') {
      root.style.setProperty('--font-family-custom', '"Playfair Display", Georgia, serif');
    } else if (fontFamily === 'mono') {
      root.style.setProperty('--font-family-custom', '"JetBrains Mono", monospace');
    }
  }, [fontFamily]);

  // --- TOAST NOTIFICATIONS HELPER ---
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- HELPERS ---
  const getZoneName = (zoneId: string) => {
    const z = zones.find(item => item.id === zoneId);
    return z ? z.name : 'Chưa phân khu';
  };

  const getActiveOrderForTable = (tableId: string): Order | null => {
    return orders.find(o => o.tableId === tableId && o.status === 'active') || null;
  };

  // --- CORE POS AND TABLE ACTIONS ---

  // Tap on a Table card
  const handleTableTap = (table: Table) => {
    if (table.status === 'empty') {
      // 1. Instantly set state of the table to active
      const updatedTables = tables.map(t => {
        if (t.id === table.id) {
          return {
            ...t,
            status: 'active' as const,
            guestCount: 2,
            checkInTime: new Date().toISOString()
          };
        }
        return t;
      });
      setTables(updatedTables);

      // 2. Create a new active order session
      const newOrderId = `ord_${table.id}_${Date.now().toString().slice(-4)}`;
      const newOrder: Order = {
        id: newOrderId,
        tableId: table.id,
        items: [],
        status: 'active',
        startTime: new Date().toISOString(),
        totalAmount: 0
      };
      setOrders(prev => [...prev, newOrder]);
      
      const newTableObj = updatedTables.find(t => t.id === table.id)!;
      setActiveTableForPOS(newTableObj);
      showToast(`Đã mở ${table.name} đón khách!`);
    } else {
      // Direct POS opening
      setActiveTableForPOS(table);
    }
  };

  // Long press or option trigger for a Table
  const handleTableLongPress = (table: Table) => {
    setActiveTableForAction(table);
  };

  // Add Item to cart POS
  const handleAddToCart = (menuItem: MenuItem) => {
    if (!activeTableForPOS) return;

    const currentOrder = getActiveOrderForTable(activeTableForPOS.id);
    if (!currentOrder) return;

    let updatedItems = [...currentOrder.items];
    const existingIndex = updatedItems.findIndex(i => i.menuItemId === menuItem.id);

    if (existingIndex > -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1,
        isNew: false
      };
    } else {
      const newItem: OrderItem = {
        id: `oi_${Date.now()}_${Math.random().toString(36).slice(-3)}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        isNew: false
      };
      updatedItems.push(newItem);
    }

    const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updatedOrders = orders.map(o => {
      if (o.id === currentOrder.id) {
        return {
          ...o,
          items: updatedItems,
          totalAmount: updatedTotal
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    showToast(`Đã thêm 1 ${menuItem.name}`);
  };

  // Update item quantity in Bottom Sheet
  const handleUpdateQuantity = (orderItemId: string, change: number) => {
    if (!activeTableForPOS) return;
    const currentOrder = getActiveOrderForTable(activeTableForPOS.id);
    if (!currentOrder) return;

    let updatedItems = currentOrder.items
      .map(item => {
        if (item.id === orderItemId) {
          const nextQty = item.quantity + change;
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter(item => item.quantity > 0);

    const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updatedOrders = orders.map(o => {
      if (o.id === currentOrder.id) {
        return {
          ...o,
          items: updatedItems,
          totalAmount: updatedTotal
        };
      }
      return o;
    });

    setOrders(updatedOrders);
  };

  // Update item notes in Bottom Sheet
  const handleUpdateNotes = (orderItemId: string, notes: string) => {
    if (!activeTableForPOS) return;
    const currentOrder = getActiveOrderForTable(activeTableForPOS.id);
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.map(item => {
      if (item.id === orderItemId) {
        return { ...item, notes };
      }
      return item;
    });

    const updatedOrders = orders.map(o => {
      if (o.id === currentOrder.id) {
        return { ...o, items: updatedItems };
      }
      return o;
    });

    setOrders(updatedOrders);
    showToast('Đã ghi chú món ăn!');
  };

  // Delete item from order
  const handleRemoveItem = (orderItemId: string) => {
    if (!activeTableForPOS) return;
    const currentOrder = getActiveOrderForTable(activeTableForPOS.id);
    if (!currentOrder) return;

    const updatedItems = currentOrder.items.filter(item => item.id !== orderItemId);
    const updatedTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updatedOrders = orders.map(o => {
      if (o.id === currentOrder.id) {
        return {
          ...o,
          items: updatedItems,
          totalAmount: updatedTotal
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    showToast('Đã xóa món khỏi giỏ.');
  };

  // Update guest headcount row
  const handleUpdateGuestCount = (count: number) => {
    if (!activeTableForPOS) return;
    const updatedTables = tables.map(t => {
      if (t.id === activeTableForPOS.id) {
        return { ...t, guestCount: count };
      }
      return t;
    });
    setTables(updatedTables);
    setActiveTableForPOS(prev => prev ? { ...prev, guestCount: count } : null);
  };

  // Print/Send order to kitchen
  const handleSendToKitchen = () => {
    if (!activeTableForPOS) return;

    const currentOrder = getActiveOrderForTable(activeTableForPOS.id);
    if (currentOrder) {
      const updatedItems = currentOrder.items.map(item => ({
        ...item,
        isNew: false
      }));

      const updatedOrders = orders.map(o => {
        if (o.id === currentOrder.id) {
          return {
            ...o,
            items: updatedItems
          };
        }
        return o;
      });
      setOrders(updatedOrders);
    }

    setIsCartOpen(false);
    showToast('👨‍🍳 Đã gửi thông tin gọi món xuống bar & bếp chế biến!');
  };

  // Proceed to Billing (Sets state to 'billing' and triggers VietQR Modal)
  const handleProceedToPayment = () => {
    if (!activeTableForPOS) return;

    // Transition table status to 'billing'
    const updatedTables = tables.map(t => {
      if (t.id === activeTableForPOS.id) {
        return { ...t, status: 'billing' as const };
      }
      return t;
    });
    setTables(updatedTables);
    setActiveTableForPOS(prev => prev ? { ...prev, status: 'billing' } : null);

    // Open dynamic payment system
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  // Handle transaction confirmation (receipt writing, revenue recording, reset table)
  const handlePaymentSuccess = (paymentMethod: 'cash' | 'vietqr', discount: number) => {
    if (!activeTableForPOS) return;

    const currentOrder = getActiveOrderForTable(activeTableForPOS.id);
    if (!currentOrder) return;

    // 1. Generate Invoice receipt
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const finalInvoice: Invoice = {
      id: invoiceId,
      tableName: activeTableForPOS.name,
      zoneName: getZoneName(activeTableForPOS.zoneId),
      items: currentOrder.items,
      totalAmount: currentOrder.totalAmount,
      discount: discount,
      finalAmount: currentOrder.totalAmount - discount,
      paymentMethod: paymentMethod,
      paymentTime: new Date().toISOString()
    };

    // 1b. Tự động khấu trừ định lượng nguyên liệu trong kho hàng
    let deductedDetails: string[] = [];
    const updatedInventory = [...inventoryItems];
    
    currentOrder.items.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
        menuItem.recipe.forEach(recipeIngredient => {
          const invIndex = updatedInventory.findIndex(inv => inv.id === recipeIngredient.inventoryItemId);
          if (invIndex > -1) {
            const requiredQty = recipeIngredient.quantity * orderItem.quantity;
            const currentStock = updatedInventory[invIndex].quantity;
            const nextStock = Math.max(0, currentStock - requiredQty);
            const currentExported = updatedInventory[invIndex].exportedQuantity ?? 0;
            const nextExported = currentExported + requiredQty;
            
            updatedInventory[invIndex] = {
              ...updatedInventory[invIndex],
              quantity: Number(nextStock.toFixed(3)),
              exportedQuantity: Number(nextExported.toFixed(3)),
              lastUpdated: new Date().toISOString()
            };
            deductedDetails.push(`${updatedInventory[invIndex].name} (-${requiredQty}${updatedInventory[invIndex].unit})`);
          }
        });
      }
    });

    if (deductedDetails.length > 0) {
      setInventoryItems(updatedInventory);
    }

    // 2. Append to persistent logs
    setInvoices(prev => [finalInvoice, ...prev]);

    // 3. Complete order state
    const updatedOrders = orders.map(o => {
      if (o.id === currentOrder.id) {
        return { ...o, status: 'completed' as const };
      }
      return o;
    });
    setOrders(updatedOrders);

    // 4. Free up physical table
    const updatedTables = tables.map(t => {
      if (t.id === activeTableForPOS.id) {
        return {
          ...t,
          status: 'empty' as const,
          guestCount: 0,
          checkInTime: undefined
        };
      }
      return t;
    });
    setTables(updatedTables);

    // 5. Tear down POS states & return
    setIsPaymentOpen(false);
    setActiveTableForPOS(null);
    
    if (deductedDetails.length > 0) {
      showToast(`Thanh toán thành công ${invoiceId}! Đã tự động trừ ${deductedDetails.length} nguyên liệu kho.`);
    } else {
      showToast(`Thanh toán thành công hóa đơn ${invoiceId}!`);
    }
  };

  // --- QUICK ACTION HANDLERS ---

  // Chuyển bàn: di dời order sang bàn trống
  const handleMoveTable = (fromId: string, toId: string) => {
    const fromTable = tables.find(t => t.id === fromId);
    const toTable = tables.find(t => t.id === toId);
    const activeOrder = getActiveOrderForTable(fromId);

    if (!fromTable || !toTable || toTable.status !== 'empty' || !activeOrder) {
      showToast('Thao tác chuyển bàn thất bại!');
      return;
    }

    // Move table descriptors
    const updatedTables = tables.map(t => {
      if (t.id === fromId) {
        return { ...t, status: 'empty' as const, guestCount: 0, checkInTime: undefined };
      }
      if (t.id === toId) {
        return { 
          ...t, 
          status: fromTable.status, 
          guestCount: fromTable.guestCount, 
          checkInTime: fromTable.checkInTime 
        };
      }
      return t;
    });

    // Remap orders to target table ID
    const updatedOrders = orders.map(o => {
      if (o.id === activeOrder.id) {
        return { ...o, tableId: toId };
      }
      return o;
    });

    setTables(updatedTables);
    setOrders(updatedOrders);
    showToast(`Đã chuyển thành công ${fromTable.name} ➡️ ${toTable.name}`);
  };

  // Gộp bàn: sát nhập món ăn chung hóa đơn
  const handleMergeTable = (fromId: string, toId: string) => {
    const fromTable = tables.find(t => t.id === fromId);
    const toTable = tables.find(t => t.id === toId);
    
    const orderFrom = getActiveOrderForTable(fromId);
    const orderTo = getActiveOrderForTable(toId);

    if (!fromTable || !toTable || !orderFrom || !orderTo) {
      showToast('Thao tác gộp bàn thất bại!');
      return;
    }

    // Merge items
    let mergedItems = [...orderTo.items];
    orderFrom.items.forEach(itemFrom => {
      const existingIdx = mergedItems.findIndex(i => i.menuItemId === itemFrom.menuItemId);
      if (existingIdx > -1) {
        mergedItems[existingIdx] = {
          ...mergedItems[existingIdx],
          quantity: mergedItems[existingIdx].quantity + itemFrom.quantity,
          notes: itemFrom.notes 
            ? `${mergedItems[existingIdx].notes || ''}; ${itemFrom.notes}`
            : mergedItems[existingIdx].notes
        };
      } else {
        mergedItems.push({ ...itemFrom });
      }
    });

    const mergedTotal = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Cancel old order, update new order
    const updatedOrders = orders.map(o => {
      if (o.id === orderFrom.id) {
        return { ...o, status: 'cancelled' as const };
      }
      if (o.id === orderTo.id) {
        return {
          ...o,
          items: mergedItems,
          totalAmount: mergedTotal
        };
      }
      return o;
    });

    // Reset old table, update new table guest count
    const updatedTables = tables.map(t => {
      if (t.id === fromId) {
        return { ...t, status: 'empty' as const, guestCount: 0, checkInTime: undefined };
      }
      if (t.id === toId) {
        return { ...t, guestCount: t.guestCount + fromTable.guestCount };
      }
      return t;
    });

    setTables(updatedTables);
    setOrders(updatedOrders);
    showToast(`Đã gộp thành công ${fromTable.name} ➡️ ${toTable.name}`);
  };

  // Thanh toán nhanh từ Quick menu
  const handleQuickBill = (tableId: string) => {
    const tableObj = tables.find(t => t.id === tableId);
    if (!tableObj) return;

    const updatedTables = tables.map(t => {
      if (t.id === tableId) {
        return { ...t, status: 'billing' as const };
      }
      return t;
    });
    setTables(updatedTables);
    
    const refreshedTable = updatedTables.find(t => t.id === tableId)!;
    setActiveTableForPOS(refreshedTable);
    setIsPaymentOpen(true);
  };

  // Cập nhật khách nhanh từ Quick menu
  const handleUpdateGuestsQuick = (tableId: string, count: number) => {
    const updatedTables = tables.map(t => {
      if (t.id === tableId) {
        return { ...t, guestCount: count };
      }
      return t;
    });
    setTables(updatedTables);
    showToast('Cập nhật số lượng khách thành công!');
  };

  // Trả bàn trống không tính phí
  const handleClearTable = (tableId: string) => {
    const activeOrder = getActiveOrderForTable(tableId);
    
    // Set table back to empty
    const updatedTables = tables.map(t => {
      if (t.id === tableId) {
        return { ...t, status: 'empty' as const, guestCount: 0, checkInTime: undefined };
      }
      return t;
    });

    // Cancel order
    const updatedOrders = activeOrder 
      ? orders.map(o => {
          if (o.id === activeOrder.id) {
            return { ...o, status: 'cancelled' as const };
          }
          return o;
        })
      : orders;

    setTables(updatedTables);
    setOrders(updatedOrders);
    showToast('Đã giải phóng bàn trống.');
  };

  // --- ADMIN METHODS FOR NEW TABLES/ZONES ---

  const handleAddTable = (tableName: string, zoneId: string) => {
    const newId = `t_${Date.now()}`;
    const newTable: Table = {
      id: newId,
      name: tableName,
      status: 'empty',
      zoneId: zoneId,
      guestCount: 0
    };
    setTables(prev => [...prev, newTable]);
    showToast(`Đã thêm thành công ${tableName}!`);
  };

  const handleAddZone = (zoneName: string) => {
    const newId = `z_${Date.now()}`;
    const newZone: Zone = {
      id: newId,
      name: zoneName
    };
    setZones(prev => [...prev, newZone]);
    setSelectedZoneId(newId);
    showToast(`Đã thêm khu vực ${zoneName}!`);
  };

  const handleClearHistory = () => {
    setInvoices([]);
    showToast('Đã dọn dẹp sạch lịch sử hóa đơn.');
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
    setTables(prev => prev.filter(t => t.zoneId !== zoneId));
    setSelectedZoneId('all');
    showToast('Đã xóa khu vực và tất cả các bàn thuộc khu vực đó.');
  };

  return (
    <PhoneFrame>
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-12 left-4 right-4 z-50 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-2 shadow-2xl backdrop-blur-md"
          >
            <span className="text-sm">🔔</span>
            <span className="text-[11px] font-bold text-slate-200 flex-1">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-500 hover:text-slate-300">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Layout Router */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {activeTableForPOS ? (
          /* MÀN HÌNH 2: BÁN HÀNG NHANH (POS) GẮN LIỀN VỚI BÀN */
          <MobilePOSScreen
            table={activeTableForPOS}
            zoneName={getZoneName(activeTableForPOS.zoneId)}
            menuItems={menuItems}
            categories={categories}
            activeOrder={getActiveOrderForTable(activeTableForPOS.id)}
            onAddToCart={handleAddToCart}
            onBack={() => setActiveTableForPOS(null)}
            onOpenCart={() => setIsCartOpen(true)}
            onTableAction={() => setActiveTableForAction(activeTableForPOS)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        ) : (
          /* TAB CONTROLLER */
          <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Render selected screen with smooth animations */}
            <div className="flex-1 overflow-hidden relative pb-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 12, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.99 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className="absolute inset-0 flex flex-col overflow-hidden"
                >
                  {currentTab === 'home' && (
                    <HomeTab
                      tables={tables}
                      zones={zones}
                      orders={orders}
                      invoices={invoices}
                      menuItems={menuItems}
                      inventoryItems={inventoryItems}
                      onNavigate={setCurrentTab}
                      onTableTap={handleTableTap}
                    />
                  )}

                  {currentTab === 'tables' && (
                    <TablesScreen
                      tables={tables}
                      zones={zones}
                      orders={orders}
                      selectedZoneId={selectedZoneId}
                      setSelectedZoneId={setSelectedZoneId}
                      onTableTap={handleTableTap}
                      onTableLongPress={handleTableLongPress}
                      onAddTableClick={() => setIsAddTableOpen(true)}
                      onDeleteZone={handleDeleteZone}
                      onAddZone={handleAddZone}
                    />
                  )}

                  {currentTab === 'history' && (
                    <HistoryTab
                      invoices={invoices}
                      onClearHistory={handleClearHistory}
                    />
                  )}

                  {currentTab === 'management' && (
                    <ManagementTab
                      menuItems={menuItems}
                      onUpdateMenuItems={setMenuItems}
                      inventoryItems={inventoryItems}
                      onUpdateInventoryItems={setInventoryItems}
                      showToast={showToast}
                      orders={orders}
                      onUpdateOrders={setOrders}
                      tables={tables}
                      zones={zones}
                      invoices={invoices}
                      auditSessions={auditSessions}
                      onUpdateAuditSessions={setAuditSessions}
                      categories={categories}
                      onUpdateCategories={setCategories}
                    />
                  )}

                  {currentTab === 'settings' && (
                    <SettingsTab
                      bankConfig={bankConfig}
                      onUpdateBankConfig={setBankConfig}
                      theme={theme}
                      onChangeTheme={setTheme}
                      accentColor={accentColor}
                      onChangeAccentColor={setAccentColor}
                      radius={radius}
                      onChangeRadius={setRadius}
                      fontFamily={fontFamily}
                      onChangeFontFamily={setFontFamily}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Tab Bar Navigation - Highly Ergonomic with Sliding Pill */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950/95 border-t border-slate-850 flex items-center justify-around text-center z-30 shadow-lg px-2.5 backdrop-blur-md">
              <button
                onClick={() => {
                  setActiveTableForPOS(null);
                  setCurrentTab('home');
                }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1.5 h-12 rounded-2xl transition-all duration-300 ${
                  currentTab === 'home' ? 'text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {currentTab === 'home' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-orange-500/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center justify-center">
                  <Home size={18} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                  <span className="text-[9px] mt-1">Trang chủ</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTableForPOS(null);
                  setCurrentTab('tables');
                }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1.5 h-12 rounded-2xl transition-all duration-300 ${
                  currentTab === 'tables' ? 'text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {currentTab === 'tables' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-orange-500/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center justify-center">
                  <Grid3X3 size={18} className={currentTab === 'tables' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                  <span className="text-[9px] mt-1">Sơ đồ bàn</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTableForPOS(null);
                  setCurrentTab('history');
                }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1.5 h-12 rounded-2xl transition-all duration-300 ${
                  currentTab === 'history' ? 'text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {currentTab === 'history' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-orange-500/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center justify-center">
                  <History size={18} className={currentTab === 'history' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                  <span className="text-[9px] mt-1">Lịch sử đơn</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTableForPOS(null);
                  setCurrentTab('management');
                }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1.5 h-12 rounded-2xl transition-all duration-300 ${
                  currentTab === 'management' ? 'text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {currentTab === 'management' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-orange-500/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center justify-center">
                  <Layers size={18} className={currentTab === 'management' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                  <span className="text-[9px] mt-1">Quản lý</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTableForPOS(null);
                  setCurrentTab('settings');
                }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1.5 h-12 rounded-2xl transition-all duration-300 ${
                  currentTab === 'settings' ? 'text-orange-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {currentTab === 'settings' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-orange-500/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center justify-center">
                  <SettingsIcon size={18} className={currentTab === 'settings' ? 'stroke-[2.5]' : 'stroke-[1.5]'} />
                  <span className="text-[9px] mt-1">Thiết lập</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ALL BOTTOM SHEETS AND MODALS IN ANIMATEPRESENCE --- */}
      <AnimatePresence>
        {/* MÀN HÌNH 3: Bottom Sheet "Chi tiết gọi món & Thanh toán" */}
        {isCartOpen && activeTableForPOS && (
          <CartBottomSheet
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            activeOrder={getActiveOrderForTable(activeTableForPOS.id)}
            guestCount={activeTableForPOS.guestCount}
            onUpdateGuestCount={handleUpdateGuestCount}
            onUpdateQuantity={handleUpdateQuantity}
            onUpdateNotes={handleUpdateNotes}
            onRemoveItem={handleRemoveItem}
            onProvisionalBill={() => setIsProvisionalOpen(true)}
            onProceedToPayment={handleProceedToPayment}
          />
        )}

        {/* Provisional Bill Modal */}
        {isProvisionalOpen && activeTableForPOS && (
          <ProvisionalModal
            isOpen={isProvisionalOpen}
            onClose={() => setIsProvisionalOpen(false)}
            activeOrder={getActiveOrderForTable(activeTableForPOS.id)}
            table={activeTableForPOS}
            zoneName={getZoneName(activeTableForPOS.zoneId)}
          />
        )}

        {/* Dynamic VietQR Billing Dialog */}
        {isPaymentOpen && activeTableForPOS && getActiveOrderForTable(activeTableForPOS.id) && (
          <VietQRModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            activeOrder={getActiveOrderForTable(activeTableForPOS.id)!}
            tableName={activeTableForPOS.name}
            zoneName={getZoneName(activeTableForPOS.zoneId)}
            discountPercent={0} // Configured dynamically inside VietQR via promo codes or set default
            bankConfig={bankConfig}
            onUpdateBankConfig={setBankConfig}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Long Press Quick Action Menu */}
        {activeTableForAction && (
          <QuickActionModal
            isOpen={!!activeTableForAction}
            onClose={() => setActiveTableForAction(null)}
            table={activeTableForAction}
            allTables={tables}
            onMoveTable={handleMoveTable}
            onMergeTable={handleMergeTable}
            onQuickBill={handleQuickBill}
            onUpdateGuests={handleUpdateGuestsQuick}
            onClearTable={handleClearTable}
          />
        )}

        {/* Dynamic Table/Zone Admin Creator */}
        {isAddTableOpen && (
          <AddTableModal
            isOpen={isAddTableOpen}
            onClose={() => setIsAddTableOpen(false)}
            zones={zones}
            onAddTable={handleAddTable}
            onAddZone={handleAddZone}
          />
        )}
      </AnimatePresence>
    </PhoneFrame>
  );
}
