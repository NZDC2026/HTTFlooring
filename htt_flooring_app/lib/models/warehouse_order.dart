import 'warehouse_order_item.dart';

enum WarehouseOrderStatus {
  toPick,
  preparing,
  prepared,
  readyForDispatch,
  completed,
}

enum WarehouseFulfilmentType { pickup, transport }

class WarehouseOrder {
  WarehouseOrder({
    required this.id,
    required this.number,
    required this.customerName,
    required this.status,
    required this.fulfilmentType,
    required this.fulfilmentDate,
    required this.items,
    this.collectedBy = '',
    this.pickupConfirmedAt,
    List<String>? dispatchPhotos,
    this.dispatchNotes = '',
    this.completedAt,
  }) : dispatchPhotos = dispatchPhotos ?? [];

  final String id;
  final String number;
  final String customerName;
  WarehouseOrderStatus status;
  final WarehouseFulfilmentType fulfilmentType;
  final DateTime fulfilmentDate;
  final List<WarehouseOrderItem> items;

  String collectedBy;
  DateTime? pickupConfirmedAt;
  final List<String> dispatchPhotos;
  String dispatchNotes;
  DateTime? completedAt;

  int get totalRequiredBoxes =>
      items.fold(0, (total, item) => total + item.requiredBoxes);

  int get totalPreparedBoxes =>
      items.fold(0, (total, item) => total + item.preparedBoxes);

  int get preparedItemCount => items.where((item) => item.isPrepared).length;

  bool get allItemsPrepared =>
      items.isNotEmpty && items.every((item) => item.isPrepared);

  bool get hasMinimumDispatchPhotos => dispatchPhotos.length >= 2;

  String get statusLabel {
    switch (status) {
      case WarehouseOrderStatus.toPick:
        return 'To Pick';
      case WarehouseOrderStatus.preparing:
        return 'Preparing';
      case WarehouseOrderStatus.prepared:
        return 'Prepared';
      case WarehouseOrderStatus.readyForDispatch:
        return 'Ready for Dispatch';
      case WarehouseOrderStatus.completed:
        return 'Completed';
    }
  }

  String get fulfilmentLabel =>
      fulfilmentType == WarehouseFulfilmentType.pickup ? 'Pickup' : 'Transport';

  String get collectedByLabel =>
      fulfilmentType == WarehouseFulfilmentType.pickup
      ? 'Customer / Collector Name'
      : 'Driver / Transport Name';
}
