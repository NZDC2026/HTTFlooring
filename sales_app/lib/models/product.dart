class Product {
  final String id;
  final String sku;
  final String name;
  final String category;
  final String colour;

  final double standardPrice;

  // Sales can never set a customer price below this value.
  final double salesFloorPrice;

  final int discount;

  // Current sales region inventory only.
  final int stockBoxes;
  final double stockSqm;

  final double sqmPerBox;
  final String status;

  const Product({
    required this.id,
    required this.sku,
    required this.name,
    required this.category,
    required this.colour,
    required this.standardPrice,
    required this.salesFloorPrice,
    required this.discount,
    required this.stockBoxes,
    required this.stockSqm,
    required this.sqmPerBox,
    required this.status,
  });
}
