import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/sales_user.dart';
import '../models/warehouse_inventory.dart';

class InventoryService {
  const InventoryService();

  static SharedPreferences? _receipts;
  static final receiptChanges = ValueNotifier(0);

  static Future<void> loadReceipts() async {
    _receipts = await SharedPreferences.getInstance();
  }

  String _receiptKey(String id, SalesRegion region) =>
      'warehouse_received_${region.code}_$id';

  Future<void> receiveBoxes(String id, SalesRegion region, int boxes) async {
    if (boxes <= 0 || getForProductAndRegion(id, region) == null) {
      throw ArgumentError('Invalid receipt.');
    }
    final receipts = _receipts!;
    final key = _receiptKey(id, region);
    if (!await receipts.setInt(key, (receipts.getInt(key) ?? 0) + boxes)) {
      await receipts.reload();
      throw StateError('Receipt could not be saved.');
    }
    receiptChanges.value++;
  }

  Future<void> transferBoxes(
    String id,
    SalesRegion source,
    SalesRegion destination,
    int boxes,
  ) async {
    final stock = getForProductAndRegion(id, source);
    if (source == destination ||
        boxes <= 0 ||
        stock == null ||
        stock.stockBoxes < boxes ||
        getForProductAndRegion(id, destination) == null) {
      throw ArgumentError('Check the quantity and destination warehouse.');
    }
    final prefs = _receipts!;
    final transfers = Map<String, int>.from(
      jsonDecode(prefs.getString('warehouse_transfers_v1') ?? '{}') as Map,
    );
    final sourceKey = _receiptKey(id, source);
    final destinationKey = _receiptKey(id, destination);
    transfers[sourceKey] = (transfers[sourceKey] ?? 0) - boxes;
    transfers[destinationKey] = (transfers[destinationKey] ?? 0) + boxes;
    if (!await prefs.setString(
      'warehouse_transfers_v1',
      jsonEncode(transfers),
    )) {
      await prefs.reload();
      throw StateError('Transfer could not be saved.');
    }
    receiptChanges.value++;
  }

  WarehouseInventory _withReceipts(WarehouseInventory item) {
    final transfers = jsonDecode(
      _receipts?.getString('warehouse_transfers_v1') ?? '{}',
    ) as Map;
    final received =
        (transfers[_receiptKey(item.productId, item.region)] as int? ?? 0) +
        (_receipts?.getInt(_receiptKey(item.productId, item.region)) ?? 0);
    if (received == 0) return item;
    final sqmPerBox = item.stockBoxes == 0
        ? 0.0
        : item.stockSqm / item.stockBoxes;
    return WarehouseInventory(
      productId: item.productId,
      region: item.region,
      stockBoxes: item.stockBoxes + received,
      stockSqm: item.stockSqm + received * sqmPerBox,
      stockPieces: item.stockPieces,
    );
  }

  static const List<WarehouseInventory> _inventory = [
    // Bonita Natural Oak
    WarehouseInventory(
      productId: 'bonita',
      region: SalesRegion.sydney,
      stockBoxes: 328,
      stockSqm: 721.60,
    ),
    WarehouseInventory(
      productId: 'bonita',
      region: SalesRegion.melbourne,
      stockBoxes: 186,
      stockSqm: 409.20,
    ),

    // Guardian D3016
    WarehouseInventory(
      productId: 'guardian',
      region: SalesRegion.sydney,
      stockBoxes: 124,
      stockSqm: 272.80,
    ),
    WarehouseInventory(
      productId: 'guardian',
      region: SalesRegion.melbourne,
      stockBoxes: 86,
      stockSqm: 189.20,
    ),

    // AquaGlow Silver
    WarehouseInventory(
      productId: 'aquaglow',
      region: SalesRegion.sydney,
      stockBoxes: 76,
      stockSqm: 167.20,
    ),
    WarehouseInventory(
      productId: 'aquaglow',
      region: SalesRegion.melbourne,
      stockBoxes: 42,
      stockSqm: 92.40,
    ),
  ];

  List<WarehouseInventory> get inventory =>
      List.unmodifiable(_inventory.map(_withReceipts));

  List<WarehouseInventory> getForProduct(String productId) {
    return _inventory
        .where((item) => item.productId == productId)
        .map(_withReceipts)
        .toList();
  }

  WarehouseInventory? getForProductAndRegion(
    String productId,
    SalesRegion region,
  ) {
    for (final item in _inventory) {
      if (item.productId == productId && item.region == region) {
        return _withReceipts(item);
      }
    }

    return null;
  }

  int totalBoxes(String productId) {
    return getForProduct(productId)
        .fold(0, (total, item) => total + item.stockBoxes);
  }

  double totalSqm(String productId) {
    return getForProduct(productId)
        .fold(0, (total, item) => total + item.stockSqm);
  }

  bool isInStock(String productId) {
    return totalBoxes(productId) > 0;
  }
}
