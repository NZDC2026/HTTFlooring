import 'package:flutter/foundation.dart';

import '../models/warehouse_order.dart';
import '../models/warehouse_order_item.dart';

class WarehouseOrderService extends ChangeNotifier {
  WarehouseOrderService() {
    final now = DateTime.now();
    _orders.addAll([
      WarehouseOrder(
        id: 'wo-100001',
        number: 'HTT-100001',
        customerName: 'ABC Flooring',
        status: WarehouseOrderStatus.toPick,
        fulfilmentType: WarehouseFulfilmentType.pickup,
        fulfilmentDate: now,
        items: [
          WarehouseOrderItem(
            id: 'wo1-i1',
            productId: 'bonita',
            productName: 'Bonita Natural Oak',
            sku: 'BON-001',
            requiredBoxes: 8,
          ),
          WarehouseOrderItem(
            id: 'wo1-i2',
            productId: 'guardian',
            productName: 'Guardian D3016',
            sku: 'GUA-D3016',
            requiredBoxes: 4,
          ),
        ],
      ),
      WarehouseOrder(
        id: 'wo-100002',
        number: 'HTT-100002',
        customerName: 'Timber World',
        status: WarehouseOrderStatus.preparing,
        fulfilmentType: WarehouseFulfilmentType.transport,
        fulfilmentDate: now,
        items: [
          WarehouseOrderItem(
            id: 'wo2-i1',
            productId: 'aquaglow',
            productName: 'AquaGlow Silver',
            sku: 'AQU-SIL',
            requiredBoxes: 12,
            preparedBoxes: 6,
          ),
        ],
      ),
      WarehouseOrder(
        id: 'wo-100003',
        number: 'HTT-100003',
        customerName: 'Floor Direct',
        status: WarehouseOrderStatus.toPick,
        fulfilmentType: WarehouseFulfilmentType.pickup,
        fulfilmentDate: now.add(const Duration(days: 1)),
        items: [
          WarehouseOrderItem(
            id: 'wo3-i1',
            productId: 'bonita',
            productName: 'Bonita Natural Oak',
            sku: 'BON-001',
            requiredBoxes: 16,
          ),
        ],
      ),
      WarehouseOrder(
        id: 'wo-100004',
        number: 'HTT-100004',
        customerName: 'Northside Floors',
        status: WarehouseOrderStatus.prepared,
        fulfilmentType: WarehouseFulfilmentType.pickup,
        fulfilmentDate: now,
        items: [
          WarehouseOrderItem(
            id: 'wo4-i1',
            productId: 'guardian',
            productName: 'Guardian D3016',
            sku: 'GUA-D3016',
            requiredBoxes: 6,
            preparedBoxes: 6,
            preparationPhotos: ['mock-1', 'mock-2'],
          ),
        ],
      ),
    ]);
  }

  final List<WarehouseOrder> _orders = [];
  List<WarehouseOrder> get orders => List.unmodifiable(_orders);
  int get toPickCount =>
      _orders.where((o) => o.status == WarehouseOrderStatus.toPick).length;
  int get preparingCount =>
      _orders.where((o) => o.status == WarehouseOrderStatus.preparing).length;
  int get preparedCount =>
      _orders.where((o) => o.status == WarehouseOrderStatus.prepared).length;

  WarehouseOrder? findOrder(String id) {
    for (final order in _orders) {
      if (order.id == id) {
        return order;
      }
    }
    return null;
  }

  WarehouseOrderItem? findItem(String orderId, String itemId) {
    final order = findOrder(orderId);
    if (order == null) {
      return null;
    }
    for (final item in order.items) {
      if (item.id == itemId) {
        return item;
      }
    }
    return null;
  }

  void startPreparing(String orderId) {
    final order = findOrder(orderId);
    if (order == null || order.status != WarehouseOrderStatus.toPick) {
      return;
    }
    order.status = WarehouseOrderStatus.preparing;
    notifyListeners();
  }

  void setPreparedBoxes(String orderId, String itemId, int boxes) {
    final item = findItem(orderId, itemId);
    if (item == null) {
      return;
    }
    item.preparedBoxes = boxes.clamp(0, item.requiredBoxes);
    notifyListeners();
  }

  void addPreparationPhoto(String orderId, String itemId, String path) {
    final item = findItem(orderId, itemId);
    if (item == null) {
      return;
    }
    item.preparationPhotos.add(path);
    notifyListeners();
  }

  void removePreparationPhoto(String orderId, String itemId, int index) {
    final item = findItem(orderId, itemId);
    if (item == null || index < 0 || index >= item.preparationPhotos.length) {
      return;
    }
    item.preparationPhotos.removeAt(index);
    notifyListeners();
  }

  bool markItemPrepared(String orderId, String itemId) {
    final order = findOrder(orderId);
    final item = findItem(orderId, itemId);
    if (order == null || item == null) {
      return false;
    }
    if (item.preparedBoxes <= 0 || item.preparationPhotos.length < 2) {
      return false;
    }
    if (order.status == WarehouseOrderStatus.toPick) {
      order.status = WarehouseOrderStatus.preparing;
    }
    if (order.allItemsPrepared) {
      order.status = WarehouseOrderStatus.prepared;
    }
    notifyListeners();
    return true;
  }

  void setFulfilmentType(
    String orderId,
    WarehouseFulfilmentType fulfilmentType,
  ) {
    final order = findOrder(orderId);
    if (order == null ||
        order.status == WarehouseOrderStatus.readyForDispatch ||
        order.status == WarehouseOrderStatus.completed) {
      return;
    }

    order.fulfilmentType = fulfilmentType;
    notifyListeners();
  }

  bool confirmPickupOrTransport(String orderId, String collectedBy) {
    final order = findOrder(orderId);
    final name = collectedBy.trim();
    if (order == null ||
        order.status != WarehouseOrderStatus.prepared ||
        name.isEmpty) {
      return false;
    }

    order.collectedBy = name;
    order.pickupConfirmedAt = DateTime.now();
    order.status = WarehouseOrderStatus.readyForDispatch;
    notifyListeners();
    return true;
  }

  void addDispatchPhoto(String orderId, String path) {
    final order = findOrder(orderId);
    if (order == null ||
        order.status != WarehouseOrderStatus.readyForDispatch) {
      return;
    }
    order.dispatchPhotos.add(path);
    notifyListeners();
  }

  void removeDispatchPhoto(String orderId, int index) {
    final order = findOrder(orderId);
    if (order == null ||
        index < 0 ||
        index >= order.dispatchPhotos.length ||
        order.status != WarehouseOrderStatus.readyForDispatch) {
      return;
    }
    order.dispatchPhotos.removeAt(index);
    notifyListeners();
  }

  void setDispatchNotes(String orderId, String notes) {
    final order = findOrder(orderId);
    if (order == null) {
      return;
    }
    order.dispatchNotes = notes.trim();
  }

  bool markCompleted(String orderId, {String notes = ''}) {
    final order = findOrder(orderId);
    if (order == null ||
        order.status != WarehouseOrderStatus.readyForDispatch ||
        !order.hasMinimumDispatchPhotos) {
      return false;
    }

    order.dispatchNotes = notes.trim();
    order.completedAt = DateTime.now();
    order.status = WarehouseOrderStatus.completed;
    notifyListeners();
    return true;
  }
}
