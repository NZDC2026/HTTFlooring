import 'product.dart';

class ProductSnapshot {
  const ProductSnapshot({
    required this.id,
    required this.sku,
    required this.name,
    required this.category,
    required this.colour,
    required this.sqmPerBox,
  });

  final String id;
  final String sku;
  final String name;
  final String category;
  final String colour;
  final double sqmPerBox;

  factory ProductSnapshot.fromProduct(Product product) {
    return ProductSnapshot(
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      colour: product.colour,
      sqmPerBox: product.sqmPerBox,
    );
  }
}
