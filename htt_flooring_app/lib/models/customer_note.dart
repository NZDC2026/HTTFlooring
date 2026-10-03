enum CustomerNoteType { note, followUp }

enum FollowUpStatus { pending, completed }

class CustomerNote {
  final String id;
  final String customerId;

  final CustomerNoteType type;

  final String content;

  final DateTime createdAt;

  final DateTime? followUpDate;

  final FollowUpStatus? followUpStatus;

  const CustomerNote({
    required this.id,
    required this.customerId,
    required this.type,
    required this.content,
    required this.createdAt,
    this.followUpDate,
    this.followUpStatus,
  });

  bool get isFollowUp => type == CustomerNoteType.followUp;

  bool get isCompleted => followUpStatus == FollowUpStatus.completed;

  CustomerNote copyWith({
    String? content,
    DateTime? followUpDate,
    FollowUpStatus? followUpStatus,
  }) {
    return CustomerNote(
      id: id,
      customerId: customerId,
      type: type,
      content: content ?? this.content,
      createdAt: createdAt,
      followUpDate: followUpDate ?? this.followUpDate,
      followUpStatus: followUpStatus ?? this.followUpStatus,
    );
  }
}
