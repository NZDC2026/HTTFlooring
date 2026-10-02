import 'package:flutter/foundation.dart';

import '../models/customer.dart';
import '../models/product.dart';
import '../models/quote.dart';

class QuoteService extends ChangeNotifier {
  Customer? _customer;

  final List<QuoteItem> _items = [];

  String? _documentNumber;

  Customer? get customer => _customer;

  List<QuoteItem> get items {
    return List.unmodifiable(_items);
  }

  String? get documentNumber {
    return _documentNumber;
  }

  bool get hasCustomer {
    return _customer != null;
  }

  bool get hasItems {
    return _items.isNotEmpty;
  }

  bool get isCreated {
    return _documentNumber != null;
  }

  void selectCustomer(Customer customer) {
    // 正式创建后的 Quote 不允许修改客户
    if (isCreated) {
      throw StateError('Created quotation cannot be modified.');
    }

    // Quote 已有产品时，不允许切换成另一个客户
    if (_customer != null &&
        _customer!.id != customer.id &&
        _items.isNotEmpty) {
      throw StateError('Cannot change customer while quote contains items.');
    }

    _customer = customer;

    notifyListeners();
  }

  void addItem({
    required Product product,
    required int boxes,
    required double sqm,
    required double unitPrice,
  }) {
    // 正式创建后的 Quote 不允许增加产品
    if (isCreated) {
      throw StateError('Created quotation cannot be modified.');
    }

    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id,
    );

    // 第一次加入这个产品
    if (existingIndex == -1) {
      _items.add(
        QuoteItem(
          product: product,
          boxes: boxes,
          sqm: sqm,
          unitPrice: unitPrice,
        ),
      );
    } else {
      // 已经存在相同产品
      // 数量累加，而不是替换
      final existingItem = _items[existingIndex];

      _items[existingIndex] = QuoteItem(
        product: product,

        boxes: existingItem.boxes + boxes,

        sqm: existingItem.sqm + sqm,

        // 当前使用本次添加时的最新价格
        unitPrice: unitPrice,
      );
    }

    notifyListeners();
  }

  void removeItem(int index) {
    // 正式创建后的 Quote 不允许删除产品
    if (isCreated) {
      throw StateError('Created quotation cannot be modified.');
    }

    _items.removeAt(index);

    notifyListeners();
  }

  void assignDocumentNumber(String number) {
    // 一个 Quote 只能分配一次号码
    if (_documentNumber != null) {
      return;
    }

    _documentNumber = number;

    notifyListeners();
  }

  double get subtotal {
    return _items.fold(0, (total, item) {
      return total + item.subtotal;
    });
  }

  double get gst {
    return subtotal * 0.10;
  }

  double get total {
    return subtotal + gst;
  }

  void clear() {
    _customer = null;

    _items.clear();

    _documentNumber = null;

    notifyListeners();
  }
}
