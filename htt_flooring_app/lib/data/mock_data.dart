import '../models/customer.dart';
import '../models/customer_contact.dart';
import '../models/product.dart';
import '../models/sales_user.dart';

final customers = [
  Customer(
    id: 'abc',
    businessName: 'ABC Flooring',
    type: 'Trade Customer',
    region: SalesRegion.sydney,
    address: '15 George Street, Sydney NSW',
    abn: '12 345 678 901',
    lastOrderDate: DateTime(2026, 9, 18),
    thisMonthOrders: 18420,
    lastMonthOrders: 24850,
    thisMonthOrderCount: 6,
    outstanding: 12680,
    overdue: 2420,
    oldestOverdueDays: 17,
    favourite: true,
  ),
  Customer(
    id: 'timber',
    businessName: 'Timber World',
    type: 'Trade Customer',
    region: SalesRegion.sydney,
    address: '88 Smith Street, Sydney NSW',
    abn: '18 222 333 444',
    lastOrderDate: DateTime(2026, 10, 2),
    thisMonthOrders: 26820,
    lastMonthOrders: 22100,
    thisMonthOrderCount: 8,
    outstanding: 0,
    overdue: 0,
    oldestOverdueDays: 0,
    favourite: false,
  ),
  Customer(
    id: 'floor-direct',
    businessName: 'Floor Direct',
    type: 'Trade Customer',
    region: SalesRegion.sydney,
    address: '42 Parramatta Road, Sydney NSW',
    abn: '24 333 555 777',
    lastOrderDate: DateTime(2026, 7, 28),
    thisMonthOrders: 0,
    lastMonthOrders: 6200,
    thisMonthOrderCount: 0,
    outstanding: 5680,
    overdue: 5680,
    oldestOverdueDays: 42,
    favourite: false,
  ),
  Customer(
    id: 'mel-floor',
    businessName: 'Melbourne Flooring Co.',
    type: 'Trade Customer',
    region: SalesRegion.melbourne,
    address: '120 Collins Street, Melbourne VIC',
    abn: '55 666 777 888',
    lastOrderDate: DateTime(2026, 9, 20),
    thisMonthOrders: 32600,
    lastMonthOrders: 28750,
    thisMonthOrderCount: 9,
    outstanding: 8500,
    overdue: 0,
    oldestOverdueDays: 0,
    favourite: false,
  ),
];

final customerContacts = [
  const CustomerContact(
    id: 'contact-abc-john',
    customerId: 'abc',
    name: 'John Smith',
    jobTitle: 'Manager',
    phone: '0400 123 456',
    email: 'john@abcflooring.com.au',
    isPrimary: true,
  ),
  const CustomerContact(
    id: 'contact-timber-michael',
    customerId: 'timber',
    name: 'Michael Chen',
    jobTitle: 'Manager',
    phone: '0412 555 882',
    email: 'michael@timberworld.com.au',
    isPrimary: true,
  ),
  const CustomerContact(
    id: 'contact-floor-direct-david',
    customerId: 'floor-direct',
    name: 'David Lee',
    jobTitle: 'Manager',
    phone: '0433 882 100',
    email: 'david@floordirect.com.au',
    isPrimary: true,
  ),
  const CustomerContact(
    id: 'contact-mel-floor-daniel',
    customerId: 'mel-floor',
    name: 'Daniel Brown',
    jobTitle: 'Manager',
    phone: '0411 888 999',
    email: 'daniel@melbourneflooring.com.au',
    isPrimary: true,
  ),
];

final products = [
  const Product(
    id: 'bonita',
    sku: 'BON-001',
    name: 'Bonita Natural Oak',
    category: 'Engineered Timber',
    colour: 'Natural Oak',

    standardPrice: 82,
    salesFloorPrice: 63,
    discount: 16,

    stockBoxes: 328,
    stockSqm: 721.60,
    sqmPerBox: 2.20,

    status: 'In Stock',
  ),
  const Product(
    id: 'guardian',
    sku: 'GUA-016',
    name: 'Guardian D3016',
    category: 'Hybrid',
    colour: 'D3016',

    standardPrice: 55,
    salesFloorPrice: 44,
    discount: 14,

    stockBoxes: 124,
    stockSqm: 272.80,
    sqmPerBox: 2.20,

    status: 'In Stock',
  ),
  const Product(
    id: 'aquaglow',
    sku: 'AQU-002',
    name: 'AquaGlow Silver',
    category: 'Laminate',
    colour: 'Silver',

    standardPrice: 48,
    salesFloorPrice: 41,
    discount: 10,

    stockBoxes: 76,
    stockSqm: 167.20,
    sqmPerBox: 2.20,

    status: 'In Stock',
  ),
];
