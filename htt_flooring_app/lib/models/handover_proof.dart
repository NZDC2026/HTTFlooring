/// Immutable proof captured from the person physically handing over goods.
class HandoverProof {
  HandoverProof({
    required String name,
    String mobile = '',
    required List<List<double>> points,
    DateTime? signedAt,
  }) : name = name.trim(),
       mobile = mobile.trim(),
       points = List.unmodifiable(
         points.map((p) => List<double>.unmodifiable(p)),
       ),
       signedAt = signedAt ?? DateTime.now() {
    if (this.name.isEmpty || !hasSignature(this.points)) {
      throw ArgumentError('A name and handwritten signature are required.');
    }
  }
  final String name;
  final String mobile;
  // Normalised x/y coordinates; empty lists separate strokes.
  final List<List<double>> points;
  final DateTime signedAt;
  static bool hasSignature(List<List<double>> points) {
    final ink = points.where((p) => p.length == 2).toList();
    if (ink.length < 2 ||
        ink.any((p) => p.any((v) => !v.isFinite || v < 0 || v > 1))) {
      return false;
    }
    return ink.any(
      (p) => (p[0] - ink.first[0]).abs() + (p[1] - ink.first[1]).abs() > 0.01,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'mobile': mobile,
    'points': points,
    'signedAt': signedAt.toIso8601String(),
  };
  factory HandoverProof.fromJson(Map<String, dynamic> j) => HandoverProof(
    name: j['name'] as String,
    mobile: j['mobile'] as String? ?? '',
    points: (j['points'] as List)
        .map((p) => (p as List).map((v) => (v as num).toDouble()).toList())
        .toList(),
    signedAt: DateTime.parse(j['signedAt'] as String),
  );
}
