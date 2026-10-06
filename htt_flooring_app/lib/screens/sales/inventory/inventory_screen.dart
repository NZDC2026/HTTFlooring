import 'package:flutter/material.dart';

import '../../../data/mock_data.dart';
import '../../../models/product.dart';
import '../../../models/sales_user.dart';
import '../../../models/warehouse_inventory.dart';
import '../../../services/inventory_service.dart';
import '../../../theme/app_theme.dart';
import 'product_detail_screen.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final TextEditingController _searchController = TextEditingController();

  final InventoryService _inventoryService = const InventoryService();

  String _selectedFilter = 'All';

  List<Product> get filteredProducts {
    final query = _searchController.text.trim().toLowerCase();

    return products.where((product) {
      final matchesSearch =
          query.isEmpty ||
          product.name.toLowerCase().contains(query) ||
          product.sku.toLowerCase().contains(query) ||
          product.colour.toLowerCase().contains(query) ||
          product.category.toLowerCase().contains(query);

      bool matchesFilter;

      switch (_selectedFilter) {
        case 'In Stock':
          matchesFilter = _inventoryService.isInStock(product.id);
          break;

        case 'Hybrid':
          matchesFilter = product.category.toLowerCase() == 'hybrid';
          break;

        case 'Laminate':
          matchesFilter = product.category.toLowerCase() == 'laminate';
          break;

        case 'Timber':
          matchesFilter = product.category.toLowerCase().contains('timber');
          break;

        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    }).toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final visibleProducts = filteredProducts;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Inventory Lookup'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          _buildSearch(),
          _buildFilters(),
          Expanded(
            child: visibleProducts.isEmpty
                ? _buildEmptyState()
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
                    itemCount: visibleProducts.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      return _buildProductCard(visibleProducts[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearch() {
    return Container(
      color: AppColors.green,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Check stock across warehouses',
            style: TextStyle(
              color: Colors.white,
              fontSize: 17,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Sydney and Melbourne inventory',
            style: TextStyle(color: Colors.white70, fontSize: 11),
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _searchController,
            onChanged: (_) {
              setState(() {});
            },
            decoration: InputDecoration(
              hintText: 'Search product, colour or SKU...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isEmpty
                  ? null
                  : IconButton(
                      onPressed: () {
                        _searchController.clear();

                        setState(() {});
                      },
                      icon: const Icon(Icons.close),
                    ),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 13),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    const filters = ['All', 'In Stock', 'Timber', 'Hybrid', 'Laminate'];

    return Container(
      width: double.infinity,
      color: AppColors.card,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: filters.map((filter) {
            final selected = _selectedFilter == filter;

            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(filter),
                selected: selected,
                showCheckmark: false,
                selectedColor: AppColors.copperLight,
                backgroundColor: AppColors.background,
                side: BorderSide(
                  color: selected ? AppColors.copper : AppColors.border,
                ),
                labelStyle: TextStyle(
                  color: selected ? AppColors.copper : AppColors.text,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
                onSelected: (_) {
                  setState(() {
                    _selectedFilter = filter;
                  });
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    final sydney = _inventoryService.getForProductAndRegion(
      product.id,
      SalesRegion.sydney,
    );

    final melbourne = _inventoryService.getForProductAndRegion(
      product.id,
      SalesRegion.melbourne,
    );

    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ProductDetailScreen(product: product),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      color: AppColors.copperLight,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.texture,
                      color: AppColors.copper,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 13),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: const TextStyle(
                            color: AppColors.text,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          '${product.sku} · '
                          '${product.category}',
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 10,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Text(
                          '\$${product.standardPrice.toStringAsFixed(2)} / m²',
                          style: const TextStyle(
                            color: AppColors.copper,
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: AppColors.muted),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(height: 1, color: AppColors.border),
              const SizedBox(height: 13),
              Row(
                children: [
                  Expanded(child: _warehouseSummary('Sydney', sydney)),
                  Container(width: 1, height: 52, color: AppColors.border),
                  Expanded(child: _warehouseSummary('Melbourne', melbourne)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _warehouseSummary(String warehouse, WarehouseInventory? inventory) {
    final boxes = inventory?.stockBoxes ?? 0;
    final inStock = boxes > 0;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            warehouse,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            '$boxes boxes',
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 5),
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: inStock ? AppColors.success : AppColors.danger,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                inStock ? 'In Stock' : 'Out of Stock',
                style: TextStyle(
                  color: inStock ? AppColors.success : AppColors.danger,
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(30),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inventory_2_outlined, size: 42, color: AppColors.muted),
            SizedBox(height: 12),
            Text(
              'No products found',
              style: TextStyle(
                color: AppColors.text,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'Try another product, colour or SKU.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted),
            ),
          ],
        ),
      ),
    );
  }
}
