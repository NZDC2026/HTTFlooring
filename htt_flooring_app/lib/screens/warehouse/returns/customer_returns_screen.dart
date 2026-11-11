import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../services/app_session.dart';
import '../../../services/visit_backend.dart';
import '../../../services/warehouse_return_backend.dart';
import '../../../widgets/handover_fields.dart';

/// Live return data is fetched for the verified company; legacy device records
/// are never imported into another user's warehouse workspace.
class CustomerReturnsScreen extends StatefulWidget {
  const CustomerReturnsScreen({super.key});
  @override
  State<CustomerReturnsScreen> createState() => _CustomerReturnsScreenState();
}

class _CustomerReturnsScreenState extends State<CustomerReturnsScreen> {
  VisitBackend? _connection, _api;
  WarehouseReturnBackend? _returns;
  List<JsonObject> _companies = [], _warehouses = [], _orders = [], _rows = [];
  JsonObject? _company, _warehouse, _order, _pending;
  List<JsonObject> _movements = [], _items = [];
  var _proof = GlobalKey<HandoverFieldsState>();
  final _reason = TextEditingController();
  final _quantity = TextEditingController(text: '1');
  final _picker = ImagePicker();
  String? _movement, _message, _token;
  String _condition = 'good', _status = 'PENDING';
  List<JsonObject> _photos = [];
  bool _busy = false, _moreOrders = false, _moreRows = false;
  int _orderPage = 0, _rowPage = 0;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _run(_connect);
    });
  }

  @override
  void dispose() {
    _reason.dispose();
    _quantity.dispose();
    super.dispose();
  }

  bool get _sameIdentity =>
      mounted && context.read<AppSession>().employeeAccessToken == _token;
  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _message = null;
    });
    try {
      await action();
    } catch (e) {
      if (mounted) {
        _message = e is VisitApiException && e.status == 422
            ? 'Photos may still be awaiting verification. Check your evidence and retry the pending return.'
            : e is VisitApiException || e is FormatException
            ? '$e'
            : 'Request incomplete. Your pending return is retained; retry when connected.';
      }
    } finally {
      if (mounted) {
        setState(() {
          _busy = false;
        });
      }
    }
  }

  Future<void> _connect() async {
    _connection = null;
    _api = null;
    _returns = null;
    _company = null;
    _warehouse = null;
    _order = null;
    _pending = null;
    _companies = [];
    _warehouses = [];
    _orders = [];
    _rows = [];
    _movements = [];
    _items = [];
    _photos = [];
    _token = context.read<AppSession>().employeeAccessToken;
    if (_token == null || _token!.isEmpty) return;
    final origin = Uri.tryParse(const String.fromEnvironment('HTT_API_ORIGIN'));
    if (origin == null ||
        origin.scheme != 'https' ||
        origin.host.isEmpty ||
        origin.userInfo.isNotEmpty ||
        origin.hasQuery ||
        origin.hasFragment ||
        (origin.path.isNotEmpty && origin.path != '/')) {
      throw const FormatException('The warehouse backend is not configured.');
    }
    _connection = VisitBackend(origin, _token!);
    final me = await _connection!.request('GET', '/me');
    if (!_sameIdentity) return;
    _companies = (me['companies'] as List).cast<JsonObject>();
    if (_companies.length == 1) await _selectCompany(_companies.single);
  }

  Future<void> _selectCompany(JsonObject company) async {
    _company = company;
    _warehouse = null;
    _order = null;
    _rows = [];
    _orders = [];
    _items = [];
    _photos = [];
    _movements = [];
    _api = _connection!.forCompany(company);
    _returns = WarehouseReturnBackend(_api!);
    _pending = await _returns!.pending();
    final result = await _api!.request('GET', '/warehouse/return-warehouses');
    if (!_sameIdentity) return;
    _warehouses = (result['items'] as List).cast<JsonObject>();
    if (_warehouses.length == 1) await _selectWarehouse(_warehouses.single);
  }

  Future<void> _selectWarehouse(JsonObject warehouse) async {
    _warehouse = warehouse;
    _order = null;
    _movements = [];
    _items = [];
    _photos = [];
    await _loadOrders(reset: true);
    await _loadRows(reset: true);
  }

  Future<void> _loadOrders({bool reset = false}) async {
    final page = reset ? 1 : _orderPage + 1;
    final result = await _api!.request(
      'GET',
      '/warehouse/return-orders',
      query: {'warehouseId': _warehouse!['id'], 'page': '$page'},
    );
    if (!_sameIdentity) return;
    _orders = [
      ...(reset ? <JsonObject>[] : _orders),
      ...(result['items'] as List).cast<JsonObject>(),
    ];
    _orderPage = page;
    _moreOrders = result['hasMore'] == true;
  }

  Future<void> _loadRows({bool reset = false}) async {
    final page = reset ? 1 : _rowPage + 1;
    final result = await _api!.request(
      'GET',
      '/warehouse/return-requests',
      query: {
        'warehouseId': _warehouse!['id'],
        'page': '$page',
        'status': _status,
      },
    );
    if (!_sameIdentity) return;
    _rows = [
      ...(reset ? <JsonObject>[] : _rows),
      ...(result['items'] as List).cast<JsonObject>(),
    ];
    _rowPage = page;
    _moreRows = result['hasMore'] == true;
  }

  Future<void> _selectOrder(JsonObject order) async {
    final result = await _api!.request(
      'GET',
      '/warehouse/orders/${order['id']}/returnable',
    );
    if (!_sameIdentity) return;
    _proof = GlobalKey<HandoverFieldsState>();
    _reason.clear();
    _quantity.text = '1';
    _order = result;
    _movements = (result['movements'] as List).cast<JsonObject>();
    _movement = null;
    _items = [];
    _photos = [];
  }

  Future<void> _photo() async {
    final photo = await _picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 75,
    );
    if (photo == null) return;
    final bytes = await photo.readAsBytes();
    if (bytes.length > 10 * 1024 * 1024) {
      throw const FormatException('Photos must be under 10 MiB.');
    }
    if (_sameIdentity) {
      _photos = [
        ..._photos,
        {'body': base64Encode(bytes)},
      ];
    }
  }

  Future<void> _addItem() async {
    final qty = num.tryParse(_quantity.text);
    if (_movement == null ||
        qty == null ||
        !qty.isFinite ||
        qty <= 0 ||
        _reason.text.trim().length < 3 ||
        _photos.length < 2 ||
        _photos.length > 10 ||
        _items.any((x) => x['stockMovementId'] == _movement)) {
      throw const FormatException(
        'Choose a dispatched item, quantity, reason and 2–10 photos; add each movement once.',
      );
    }
    final movement = _movements.firstWhere(
      (x) => x['stockMovementId'] == _movement,
    );
    final remaining =
        num.parse('${movement['quantity']}') -
        num.parse('${movement['returnedQuantity']}');
    if (qty > remaining) {
      throw const FormatException(
        'Quantity exceeds the remaining dispatched quantity.',
      );
    }
    _items = [
      ..._items,
      {
        'stockMovementId': _movement,
        'quantity': qty,
        'reason': _reason.text.trim(),
        'condition': _condition,
        'photos': _photos,
      },
    ];
    _photos = [];
    _reason.clear();
    _quantity.text = '1';
  }

  Future<void> _submit() async {
    final proof = _proof.currentState?.validateAndRead();
    if (proof == null || _items.isEmpty) {
      throw const FormatException('Add return items and a signed handover.');
    }
    await _returns!.stage(_order!, proof.toJson(), _items);
    _pending = await _returns!.pending();
    _items = [];
    await _resume();
  }

  Future<void> _resume() async {
    final result = await _returns!.resume();
    if (!_sameIdentity) return;
    _pending = await _returns!.pending();
    if (result != null) {
      _message =
          'Return acknowledged by the server: ${result['id']}. Front Desk can now process it.';
      _order = null;
      _movements = [];
      if (_warehouse != null) await _loadRows(reset: true);
    }
  }

  Future<void> _discard() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Discard unsubmitted return?'),
        content: const Text(
          'This clears the local draft. Uploaded evidence remains private on the server. A submission with an uncertain result must be retried first.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c, false),
            child: const Text('Keep draft'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(c, true),
            child: const Text('Discard'),
          ),
        ],
      ),
    );
    if (confirmed != true || !_sameIdentity) return;
    await _returns!.discardSafely();
    _pending = null;
    _order = null;
    _items = [];
    _photos = [];
  }

  void _sample() {
    showDialog<void>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Sample return · read-only'),
        content: const Text(
          'Harbour Floors · SO-SAMPLE-04725\nBonita Oak · 2 cartons · damaged packaging\n2 verified photos and signed handover\n\nPending → Front Desk review → Processed or Rejected\n\nNo request, stock movement or notification is created.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(c),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<AppSession>();
    final authorized = _token != null && session.employeeAccessToken == _token;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Customer Returns'),
        actions: [TextButton(onPressed: _sample, child: const Text('Sample'))],
      ),
      body: AbsorbPointer(
        absorbing: _busy,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_busy) const LinearProgressIndicator(),
            if (_message != null && authorized)
              Text(_message!, key: const Key('return-message')),
            if (!authorized) ...[
              const Text(
                'Connect with an employee account to load your authorized return workspace. Local legacy records are not uploaded.',
              ),
              FilledButton(
                onPressed: () => _run(_connect),
                child: const Text('Connect'),
              ),
            ],
            if (authorized) ...[
              DropdownButtonFormField<JsonObject>(
                initialValue: _company,
                decoration: const InputDecoration(labelText: 'Company'),
                items: _companies
                    .map(
                      (c) => DropdownMenuItem(
                        value: c,
                        child: Text('${c['companyName']}'),
                      ),
                    )
                    .toList(),
                onChanged: _pending != null
                    ? null
                    : (c) {
                        if (c != null) _run(() => _selectCompany(c));
                      },
              ),
              if (_pending != null) ...[
                const Text(
                  'A return is pending submission or photo verification. Retry with the same account; it will not create duplicates.',
                ),
                FilledButton(
                  onPressed: () => _run(_resume),
                  child: const Text('Retry pending return'),
                ),
                TextButton(
                  onPressed: () => _run(_discard),
                  child: const Text('Discard unsubmitted draft'),
                ),
              ],
              if (_warehouses.isNotEmpty)
                DropdownButtonFormField<JsonObject>(
                  key: ValueKey('warehouse-${_company?['companyId']}'),
                  initialValue: _warehouse,
                  decoration: const InputDecoration(labelText: 'Warehouse'),
                  items: _warehouses
                      .map(
                        (w) => DropdownMenuItem(
                          value: w,
                          child: Text('${w['code']} · ${w['name']}'),
                        ),
                      )
                      .toList(),
                  onChanged: _pending != null
                      ? null
                      : (w) {
                          if (w != null) _run(() => _selectWarehouse(w));
                        },
                ),
              if (_warehouse != null) ...[
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  key: ValueKey('status-$_status'),
                  initialValue: _status,
                  items: ['PENDING', 'PROCESSED', 'REJECTED']
                      .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                      .toList(),
                  onChanged: (s) {
                    if (s != null) {
                      _run(() async {
                        _status = s;
                        await _loadRows(reset: true);
                      });
                    }
                  },
                ),
                TextButton(
                  onPressed: () => _run(() => _loadRows(reset: true)),
                  child: const Text('Refresh server decisions'),
                ),
                ..._rows.map(
                  (r) => ListTile(
                    title: Text('${r['id']}'),
                    subtitle: Text('${r['status']} · ${r['created_at']}'),
                  ),
                ),
                if (_moreRows)
                  TextButton(
                    onPressed: () => _run(_loadRows),
                    child: const Text('More returns'),
                  ),
                if (_pending == null) ...[
                  const Divider(),
                  const Text('New return · dispatched items only'),
                  DropdownButtonFormField<String>(
                    key: ValueKey(
                      'order-${_warehouse!['id']}-${_order?['orderId']}',
                    ),
                    initialValue: _order?['orderId'] as String?,
                    isExpanded: true,
                    decoration: const InputDecoration(
                      labelText: 'Source order',
                    ),
                    items: _orders
                        .map(
                          (o) => DropdownMenuItem<String>(
                            value: o['id'] as String,
                            child: Text(
                              '${o['number']} · ${o['customer_name']}',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (id) {
                      if (id != null) {
                        _run(
                          () => _selectOrder(
                            _orders.firstWhere((o) => o['id'] == id),
                          ),
                        );
                      }
                    },
                  ),
                  if (_moreOrders)
                    TextButton(
                      onPressed: () => _run(_loadOrders),
                      child: const Text('More orders'),
                    ),
                  if (_order != null) ...[
                    DropdownButtonFormField<String>(
                      key: ValueKey('movement-${_order!['orderId']}'),
                      initialValue: _movement,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        labelText: 'Dispatched item',
                      ),
                      items: _movements
                          .map(
                            (m) => DropdownMenuItem<String>(
                              value: m['stockMovementId'] as String,
                              child: Text(
                                '${m['sku']} · ${m['quantity']} ${m['unitCode']}',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (id) => setState(() => _movement = id),
                    ),
                    TextField(
                      controller: _quantity,
                      keyboardType: const TextInputType.numberWithOptions(
                        decimal: true,
                      ),
                      decoration: const InputDecoration(
                        labelText: 'Return quantity (source unit)',
                      ),
                    ),
                    DropdownButtonFormField<String>(
                      initialValue: _condition,
                      items: ['good', 'damaged']
                          .map(
                            (s) => DropdownMenuItem(value: s, child: Text(s)),
                          )
                          .toList(),
                      onChanged: (s) => setState(() => _condition = s!),
                    ),
                    TextField(
                      controller: _reason,
                      maxLength: 2000,
                      decoration: const InputDecoration(
                        labelText: 'Item reason',
                      ),
                    ),
                    TextButton(
                      onPressed: _photos.length >= 10
                          ? null
                          : () => _run(_photo),
                      child: Text(
                        'Take photo (${_photos.length}/10; minimum 2)',
                      ),
                    ),
                    TextButton(
                      onPressed: () => _run(_addItem),
                      child: const Text('Add item'),
                    ),
                    Text('${_items.length} return items ready'),
                    HandoverFields(
                      key: _proof,
                      nameLabel: 'Customer name',
                      signatureLabel: 'Customer signature',
                    ),
                    FilledButton(
                      onPressed: () => _run(_submit),
                      child: const Text('Upload evidence and submit'),
                    ),
                  ],
                ],
              ],
            ],
          ],
        ),
      ),
    );
  }
}
