import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/stock_adjustment.dart';
import '../../../services/stock_adjustment_service.dart';
import '../../../theme/app_theme.dart';

class StockLevelCheckScreen extends StatelessWidget {
  const StockLevelCheckScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => StockAdjustmentService(),
      child: const _StockLevelCheckView(),
    );
  }
}

class _StockLevelCheckView extends StatefulWidget {
  const _StockLevelCheckView();

  @override
  State<_StockLevelCheckView> createState() => _StockLevelCheckViewState();
}

class _StockLevelCheckViewState extends State<_StockLevelCheckView> {
  final Map<String, TextEditingController> _controllers = {};
  final Set<String> _selected = {};
  String _region = 'Sydney';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final products = context.read<StockAdjustmentService>().products;
    for (final product in products) {
      _controllers.putIfAbsent(
        product.id,
        () => TextEditingController(text: product.systemBoxes.toString()),
      );
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  int _actualBoxes(StockCheckProduct product) {
    return int.tryParse(_controllers[product.id]?.text ?? '') ??
        product.systemBoxes;
  }

  int _difference(StockCheckProduct product) {
    return _actualBoxes(product) - product.systemBoxes;
  }

  void _refreshSelection(StockCheckProduct product) {
    setState(() {
      if (_difference(product) == 0) {
        _selected.remove(product.id);
      }
    });
  }

  void _submit() {
    final service = context.read<StockAdjustmentService>();
    final lines = service.products
        .where((product) => _selected.contains(product.id))
        .where((product) => _difference(product) != 0)
        .map(
          (product) => StockAdjustmentLine(
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            systemBoxes: product.systemBoxes,
            actualBoxes: _actualBoxes(product),
          ),
        )
        .toList();

    if (lines.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Select at least one stock difference.')),
      );
      return;
    }

    final request = service.submit(region: _region, lines: lines);

    setState(() {
      _selected.clear();
      for (final product in service.products) {
        _controllers[product.id]?.text = product.systemBoxes.toString();
      }
    });

    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Submitted for Approval'),
        content: Text(
          '${request.id} has been sent to Front Desk / Manager. '
          'Official stock has not been changed.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final service = context.watch<StockAdjustmentService>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Stock Level Check'),
        backgroundColor: AppColors.background,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.warningLight,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Text(
                      'Count the physical stock and enter Actual Stock. '
                      'Differences are submitted for approval and do not '
                      'change official inventory directly.',
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Text(
                        'Warehouse',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const Spacer(),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(value: 'Sydney', label: Text('Sydney')),
                          ButtonSegment(
                            value: 'Melbourne',
                            label: Text('Melbourne'),
                          ),
                        ],
                        selected: {_region},
                        onSelectionChanged: (value) {
                          setState(() => _region = value.first);
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 120),
                itemCount: service.products.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final product = service.products[index];
                  final difference = _difference(product);
                  final selected = _selected.contains(product.id);

                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Checkbox(
                              value: selected,
                              onChanged: difference == 0
                                  ? null
                                  : (value) {
                                      setState(() {
                                        if (value ?? false) {
                                          _selected.add(product.id);
                                        } else {
                                          _selected.remove(product.id);
                                        }
                                      });
                                    },
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    product.name,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.text,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    product.sku,
                                    style: const TextStyle(
                                      color: AppColors.muted,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: _ValueBox(
                                label: 'System Stock',
                                value: '${product.systemBoxes} boxes',
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: _controllers[product.id],
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: 'Actual Stock',
                                  suffixText: 'boxes',
                                  border: OutlineInputBorder(),
                                ),
                                onChanged: (_) => _refreshSelection(product),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Text(
                              'Difference',
                              style: TextStyle(color: AppColors.muted),
                            ),
                            const Spacer(),
                            Text(
                              difference > 0 ? '+$difference' : '$difference',
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                color: difference == 0
                                    ? AppColors.muted
                                    : difference > 0
                                    ? AppColors.success
                                    : AppColors.danger,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Text('boxes'),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: FilledButton.icon(
          onPressed: _selected.isEmpty ? null : _submit,
          icon: const Icon(Icons.send_outlined),
          label: Text(
            _selected.isEmpty
                ? 'Select Stock Differences'
                : 'Submit ${_selected.length} for Approval',
          ),
          style: FilledButton.styleFrom(
            backgroundColor: AppColors.green,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
      ),
    );
  }
}

class _ValueBox extends StatelessWidget {
  const _ValueBox({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.ivory,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.muted)),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}
