import { Zone, Table, MenuItem } from './types';

export const INITIAL_ZONES: Zone[] = [
  { id: 'all', name: 'Tất cả' },
  { id: 'ground', name: 'Tầng trệt' },
  { id: 'floor1', name: 'Lầu 1' },
  { id: 'outdoor', name: 'Ngoài trời' },
  { id: 'vip', name: 'Phòng VIP' }
];

export const INITIAL_TABLES: Table[] = [
  // Ground floor tables
  { id: 'g1', name: 'Bàn 01', status: 'empty', zoneId: 'ground', guestCount: 0 },
  { id: 'g2', name: 'Bàn 02', status: 'active', zoneId: 'ground', guestCount: 2, checkInTime: '2026-07-16T01:30:00-07:00' },
  { id: 'g3', name: 'Bàn 03', status: 'empty', zoneId: 'ground', guestCount: 0 },
  { id: 'g4', name: 'Bàn 04', status: 'billing', zoneId: 'ground', guestCount: 4, checkInTime: '2026-07-16T01:00:00-07:00' },
  { id: 'g5', name: 'Bàn 05', status: 'active', zoneId: 'ground', guestCount: 3, checkInTime: '2026-07-16T01:15:00-07:00' },
  { id: 'g6', name: 'Bàn 06', status: 'empty', zoneId: 'ground', guestCount: 0 },
  
  // Floor 1 tables
  { id: 'f1', name: 'Bàn 101', status: 'empty', zoneId: 'floor1', guestCount: 0 },
  { id: 'f2', name: 'Bàn 102', status: 'active', zoneId: 'floor1', guestCount: 5, checkInTime: '2026-07-16T01:45:00-07:00' },
  { id: 'f3', name: 'Bàn 103', status: 'empty', zoneId: 'floor1', guestCount: 0 },
  { id: 'f4', name: 'Bàn 104', status: 'empty', zoneId: 'floor1', guestCount: 0 },
  { id: 'f5', name: 'Bàn 105', status: 'billing', zoneId: 'floor1', guestCount: 2, checkInTime: '2026-07-16T02:00:00-07:00' },

  // Outdoor tables
  { id: 'o1', name: 'Bàn Sân Vườn 1', status: 'empty', zoneId: 'outdoor', guestCount: 0 },
  { id: 'o2', name: 'Bàn Sân Vườn 2', status: 'active', zoneId: 'outdoor', guestCount: 4, checkInTime: '2026-07-16T01:10:00-07:00' },
  { id: 'o3', name: 'Bàn Sân Vườn 3', status: 'empty', zoneId: 'outdoor', guestCount: 0 },
  { id: 'o4', name: 'Bàn Sân Vườn 4', status: 'empty', zoneId: 'outdoor', guestCount: 0 },

  // VIP tables
  { id: 'v1', name: 'Phòng VIP 1', status: 'active', zoneId: 'vip', guestCount: 8, checkInTime: '2026-07-16T00:45:00-07:00' },
  { id: 'v2', name: 'Phòng VIP 2', status: 'empty', zoneId: 'vip', guestCount: 0 },
  { id: 'v3', name: 'Phòng VIP 3', status: 'empty', zoneId: 'vip', guestCount: 0 },
];

export const CATEGORIES = [
  { id: 'coffee', name: 'Cà phê', icon: '☕' },
  { id: 'tea', name: 'Trà sữa', icon: '🧋' },
  { id: 'juice', name: 'Sinh tố & Nước ép', icon: '🍹' },
  { id: 'snack', name: 'Đồ ăn vặt', icon: '🍟' },
  { id: 'food', name: 'Điểm tâm', icon: '🍜' },
];

export const MENU_ITEMS: MenuItem[] = [
  // Coffee
  {
    id: 'm1',
    name: 'Cà phê Đen Đá',
    price: 29000,
    category: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop&q=60',
    description: 'Cà phê rang xay nguyên chất đậm đà truyền thống',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i1', quantity: 0.02 }, // 20g cà phê Robusta
      { inventoryItemId: 'i12', quantity: 0.2 }  // 0.2kg đá viên
    ]
  },
  {
    id: 'm2',
    name: 'Cà phê Sữa Đá',
    price: 35000,
    category: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=150&auto=format&fit=crop&q=60',
    description: 'Sự kết hợp hoàn hảo giữa cà phê đậm vị và sữa đặc thơm béo',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i1', quantity: 0.02 }, // 20g cà phê
      { inventoryItemId: 'i2', quantity: 0.1 },  // 0.1 lon sữa đặc
      { inventoryItemId: 'i12', quantity: 0.2 }  // 0.2kg đá viên
    ]
  },
  {
    id: 'm3',
    name: 'Bạc Xỉu Đá',
    price: 39000,
    category: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=60',
    description: 'Nhiều sữa ít cà phê, béo ngậy ngọt ngào',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i1', quantity: 0.015 }, // 15g cà phê
      { inventoryItemId: 'i2', quantity: 0.15 },  // 0.15 lon sữa đặc
      { inventoryItemId: 'i12', quantity: 0.2 }   // 0.2kg đá viên
    ]
  },
  {
    id: 'm4',
    name: 'Cà phê Muối',
    price: 45000,
    category: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=150&auto=format&fit=crop&q=60',
    description: 'Lớp kem muối béo mặn hòa cùng espresso đậm đà',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i1', quantity: 0.02 },
      { inventoryItemId: 'i12', quantity: 0.15 }
    ]
  },

  // Tea
  {
    id: 'm5',
    name: 'Trà Sữa Trân Châu',
    price: 49000,
    category: 'tea',
    imageUrl: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=150&auto=format&fit=crop&q=60',
    description: 'Hồng trà đậm vị kết hợp sữa béo và trân châu đen dai giòn',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i3', quantity: 0.015 }, // 15g trà đen
      { inventoryItemId: 'i4', quantity: 0.05 },  // 50g trân châu
      { inventoryItemId: 'i12', quantity: 0.15 }  // 150g đá viên
    ]
  },
  {
    id: 'm6',
    name: 'Trà Đào Cam Sả',
    price: 45000,
    category: 'tea',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=150&auto=format&fit=crop&q=60',
    description: 'Trà đào thanh mát quyện cùng hương sả nồng nàn và cam tươi',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i3', quantity: 0.01 },   // 10g trà đen
      { inventoryItemId: 'i8', quantity: 0.15 },   // 0.15 chai siro đào
      { inventoryItemId: 'i7', quantity: 0.1 },    // 100g cam tươi
      { inventoryItemId: 'i12', quantity: 0.15 }   // 150g đá viên
    ]
  },
  {
    id: 'm7',
    name: 'Trà Vải Lài',
    price: 45000,
    category: 'tea',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop&q=60',
    description: 'Hương nhài thơm thanh khiết kết hợp quả vải ngọt lịm',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i3', quantity: 0.01 },
      { inventoryItemId: 'i12', quantity: 0.2 }
    ]
  },

  // Juice
  {
    id: 'm8',
    name: 'Sinh tố Bơ',
    price: 55000,
    category: 'juice',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=150&auto=format&fit=crop&q=60',
    description: 'Quả bơ sáp Đắk Lắk xay sánh mịn cùng sữa tươi',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i6', quantity: 0.25 }, // 250g bơ sáp Đắk Lắk
      { inventoryItemId: 'i2', quantity: 0.05 },  // 0.05 lon sữa đặc Ngôi Sao
      { inventoryItemId: 'i12', quantity: 0.1 }   // 100g đá viên
    ]
  },
  {
    id: 'm9',
    name: 'Nước ép Thơm Bạc Hà',
    price: 42000,
    category: 'juice',
    imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=150&auto=format&fit=crop&q=60',
    description: 'Nước ép dứa nguyên chất mát lạnh, thêm lá bạc hà thanh mát',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i12', quantity: 0.15 }
    ]
  },
  {
    id: 'm10',
    name: 'Nước ép Cam Cà Rốt',
    price: 45000,
    category: 'juice',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=150&auto=format&fit=crop&q=60',
    description: 'Bổ sung vitamin, cam ngọt dịu phối hợp cà rốt tươi ngon',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i7', quantity: 0.2 },  // 200g cam tươi
      { inventoryItemId: 'i12', quantity: 0.15 }
    ]
  },

  // Snack
  {
    id: 'm11',
    name: 'Khoai Tây Chiên Lắc Phô Mai',
    price: 39000,
    category: 'snack',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=150&auto=format&fit=crop&q=60',
    description: 'Khoai tây chiên vàng giòn lắc bột phô mai mằn mặn béo ngậy',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i9', quantity: 0.15 } // 150g khoai tây đông lạnh
    ]
  },
  {
    id: 'm12',
    name: 'Cá Viên Chiên Mắm Tỏi',
    price: 49000,
    category: 'snack',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&auto=format&fit=crop&q=60',
    description: 'Cá viên chiên giòn rụm sốt mắm tỏi thơm lừng đậm đà',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i11', quantity: 0.15 } // 150g cá viên chiên
    ]
  },
  {
    id: 'm13',
    name: 'Khô Mực Trộn Cóc Non',
    price: 59000,
    category: 'snack',
    imageUrl: 'https://images.unsplash.com/photo-1615233500621-4a7cd7c5d021?w=150&auto=format&fit=crop&q=60',
    description: 'Khô mực xé cay trộn cùng cóc non chua giòn bắt mồi',
    isAvailable: true
  },

  // Food
  {
    id: 'm14',
    name: 'Bánh Mì Chảo Đặc Biệt',
    price: 59000,
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=150&auto=format&fit=crop&q=60',
    description: 'Gồm pate gan, trứng ốp la, xúc xích và bánh mì giòn nóng',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i5', quantity: 1.0 } // 1 ổ bánh mì tươi
    ]
  },
  {
    id: 'm15',
    name: 'Mì Ý Sốt Bò Bằm',
    price: 65000,
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=150&auto=format&fit=crop&q=60',
    description: 'Sợi mì dai mịn quyện cùng sốt cà chua thịt bò bằm đậm vị',
    isAvailable: true,
    recipe: [
      { inventoryItemId: 'i10', quantity: 0.1 } // 100g mì Ý sợi tròn
    ]
  }
];

// Seed initial orders for currently active tables
export const INITIAL_ORDERS = [
  {
    id: 'ord_g2',
    tableId: 'g2',
    items: [
      { id: 'oi1', menuItemId: 'm1', name: 'Cà phê Đen Đá', price: 29000, quantity: 1, notes: 'Ít đường' },
      { id: 'oi2', menuItemId: 'm2', name: 'Cà phê Sữa Đá', price: 35000, quantity: 1, notes: 'Nhiều đá' }
    ],
    status: 'active' as const,
    startTime: '2026-07-16T01:30:00-07:00',
    totalAmount: 64000
  },
  {
    id: 'ord_g4',
    tableId: 'g4',
    items: [
      { id: 'oi3', menuItemId: 'm5', name: 'Trà Sữa Trân Châu', price: 49000, quantity: 2 },
      { id: 'oi4', menuItemId: 'm11', name: 'Khoai Tây Chiên Lắc Phô Mai', price: 39000, quantity: 1, notes: 'Chiên giòn' },
      { id: 'oi5', menuItemId: 'm12', name: 'Cá Viên Chiên Mắm Tỏi', price: 49000, quantity: 1 }
    ],
    status: 'active' as const,
    startTime: '2026-07-16T01:00:00-07:00',
    totalAmount: 186000
  },
  {
    id: 'ord_g5',
    tableId: 'g5',
    items: [
      { id: 'oi6', menuItemId: 'm4', name: 'Cà phê Muối', price: 45000, quantity: 2 },
      { id: 'oi7', menuItemId: 'm8', name: 'Sinh tố Bơ', price: 55000, quantity: 1, notes: 'Không quá ngọt' }
    ],
    status: 'active' as const,
    startTime: '2026-07-16T01:15:00-07:00',
    totalAmount: 145000
  },
  {
    id: 'ord_f2',
    tableId: 'f2',
    items: [
      { id: 'oi8', menuItemId: 'm15', name: 'Mì Ý Sốt Bò Bằm', price: 65000, quantity: 2 },
      { id: 'oi9', menuItemId: 'm7', name: 'Trà Vải Lài', price: 45000, quantity: 3 }
    ],
    status: 'active' as const,
    startTime: '2026-07-16T01:45:00-07:00',
    totalAmount: 265000
  },
  {
    id: 'ord_f5',
    tableId: 'f5',
    items: [
      { id: 'oi10', menuItemId: 'm3', name: 'Bạc Xỉu Đá', price: 39000, quantity: 2 }
    ],
    status: 'active' as const,
    startTime: '2026-07-16T02:00:00-07:00',
    totalAmount: 78000
  },
  {
    id: 'ord_o2',
    tableId: 'o2',
    items: [
      { id: 'oi11', menuItemId: 'm6', name: 'Trà Đào Cam Sả', price: 45000, quantity: 4 },
      { id: 'oi12', menuItemId: 'm13', name: 'Khô Mực Trộn Cóc Non', price: 59000, quantity: 1 }
    ],
    status: 'active' as const,
    startTime: '2026-07-16T01:10:00-07:00',
    totalAmount: 239000
  },
  {
    id: 'ord_v1',
    tableId: 'v1',
    items: [
      { id: 'oi13', menuItemId: 'm14', name: 'Bánh Mì Chảo Đặc Biệt', price: 59000, quantity: 4 },
      { id: 'oi14', menuItemId: 'm15', name: 'Mì Ý Sốt Bò Bằm', price: 65000, quantity: 4 },
      { id: 'oi15', menuItemId: 'm9', name: 'Nước ép Thơm Bạc Hà', price: 42000, quantity: 8 }
    ],
    status: 'active' as const,
    startTime: '2026-07-16T00:45:00-07:00',
    totalAmount: 832000
  }
];

export const LIST_OF_BANKS = [
  { id: 'vcb', name: 'Vietcombank', code: '970436' },
  { id: 'mbb', name: 'MB Bank', code: '970422' },
  { id: 'tcb', name: 'Techcombank', code: '970407' },
  { id: 'bidv', name: 'BIDV', code: '970418' },
  { id: 'vtb', name: 'VietinBank', code: '970415' },
  { id: 'acb', name: 'ACB', code: '970416' }
];

export const INITIAL_INVENTORY = [
  { id: 'i1', name: 'Cà phê hạt Robusta', initialQuantity: 30.0, quantity: 24.5, importedQuantity: 0.0, exportedQuantity: 5.5, unit: 'kg', minThreshold: 5.0, lastUpdated: '2026-07-16T02:00:00-07:00' },
  { id: 'i2', name: 'Sữa đặc Ngôi Sao', initialQuantity: 60, quantity: 48, importedQuantity: 0, exportedQuantity: 12, unit: 'lon', minThreshold: 12, lastUpdated: '2026-07-16T01:30:00-07:00' },
  { id: 'i3', name: 'Trà đen nguyên lá', initialQuantity: 15.0, quantity: 12.0, importedQuantity: 0.0, exportedQuantity: 3.0, unit: 'kg', minThreshold: 3.0, lastUpdated: '2026-07-15T18:00:00-07:00' },
  { id: 'i4', name: 'Trân châu đen Royal', initialQuantity: 20.0, quantity: 15.0, importedQuantity: 0.0, exportedQuantity: 5.0, unit: 'kg', minThreshold: 4.0, lastUpdated: '2026-07-16T00:30:00-07:00' },
  { id: 'i5', name: 'Bánh mì tươi (ổ)', initialQuantity: 30, quantity: 6, importedQuantity: 0, exportedQuantity: 24, unit: 'ổ', minThreshold: 20, lastUpdated: '2026-07-16T02:15:00-07:00' }, // Alert: Sắp hết kho!
  { id: 'i6', name: 'Bơ sáp Đắk Lắk', initialQuantity: 10.0, quantity: 2.1, importedQuantity: 0.0, exportedQuantity: 7.9, unit: 'kg', minThreshold: 5.0, lastUpdated: '2026-07-16T01:00:00-07:00' }, // Alert: Sắp hết kho!
  { id: 'i7', name: 'Cam tươi sành', initialQuantity: 40.0, quantity: 32.0, importedQuantity: 0.0, exportedQuantity: 8.0, unit: 'kg', minThreshold: 8.0, lastUpdated: '2026-07-16T02:30:00-07:00' },
  { id: 'i8', name: 'Siro đào Teisseire', initialQuantity: 10, quantity: 8, importedQuantity: 0, exportedQuantity: 2, unit: 'chai', minThreshold: 2, lastUpdated: '2026-07-14T10:00:00-07:00' },
  { id: 'i9', name: 'Khoai tây đông lạnh', initialQuantity: 25.0, quantity: 18.0, importedQuantity: 0.0, exportedQuantity: 7.0, unit: 'kg', minThreshold: 5.0, lastUpdated: '2026-07-16T01:15:00-07:00' },
  { id: 'i10', name: 'Mì Ý sợi tròn', initialQuantity: 20.0, quantity: 14.5, importedQuantity: 0.0, exportedQuantity: 5.5, unit: 'kg', minThreshold: 3.0, lastUpdated: '2026-07-15T17:00:00-07:00' },
  { id: 'i11', name: 'Cá viên chiên', initialQuantity: 15.0, quantity: 11.0, importedQuantity: 0.0, exportedQuantity: 4.0, unit: 'kg', minThreshold: 3.0, lastUpdated: '2026-07-16T01:45:00-07:00' },
  { id: 'i12', name: 'Đá viên tinh khiết', initialQuantity: 150, quantity: 120, importedQuantity: 0, exportedQuantity: 30, unit: 'kg', minThreshold: 20, lastUpdated: '2026-07-16T02:30:00-07:00' }
];

