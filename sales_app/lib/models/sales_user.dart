enum SalesRegion { sydney, melbourne }

enum SalesRole { sales, manager, admin }

class SalesUser {
  final String id;
  final String name;
  final String email;
  final SalesRegion region;
  final SalesRole role;

  const SalesUser({
    required this.id,
    required this.name,
    required this.email,
    required this.region,
    required this.role,
  });
}

extension SalesRegionExtension on SalesRegion {
  String get label {
    switch (this) {
      case SalesRegion.sydney:
        return 'Sydney';
      case SalesRegion.melbourne:
        return 'Melbourne';
    }
  }

  String get code {
    switch (this) {
      case SalesRegion.sydney:
        return 'SYD';
      case SalesRegion.melbourne:
        return 'MEL';
    }
  }
}
