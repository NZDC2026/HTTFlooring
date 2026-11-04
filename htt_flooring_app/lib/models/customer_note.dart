import 'dart:typed_data';

import 'app_user.dart';

enum CustomerNoteType { note, followUp }

enum FollowUpStatus { pending, inProgress, completed }

typedef TaskEvent = ({
  String author,
  String action,
  String? message,
  DateTime at,
  List<ActivityAttachment> attachments,
});

class ActivityAttachment {
  const ActivityAttachment({
    required this.name,
    required this.bytes,
    required this.isPhoto,
  });

  final String name;
  final Uint8List bytes;
  final bool isPhoto;
}

class CustomerNote {
  final List<ActivityAttachment> attachments;
  final List<TaskEvent> events;
  final String? creatorId;
  final String id;
  final String customerId;

  final CustomerNoteType type;

  final String content;

  final DateTime createdAt;

  final DateTime? followUpDate;

  final FollowUpStatus? followUpStatus;

  final String? authorName;
  final String? noteType;
  final String? followUpType;
  final List<AppUser> assignees;
  final String? priority;
  final String? reminder;
  final DateTime? reminderDate;

  const CustomerNote({
    required this.id,
    required this.customerId,
    required this.type,
    required this.content,
    required this.createdAt,
    this.followUpDate,
    this.followUpStatus,
    this.authorName,
    this.noteType,
    this.followUpType,
    this.assignees = const [],
    this.priority,
    this.reminder,
    this.reminderDate,
    this.events = const [],
    this.creatorId,
    this.attachments = const [],
  });

  bool get isFollowUp => type == CustomerNoteType.followUp;

  bool canReply(AppUser user) =>
      isFollowUp &&
      !isCompleted &&
      (creatorId == user.id ||
          assignees.any((assignee) => assignee.id == user.id));

  bool get isCompleted => followUpStatus == FollowUpStatus.completed;

  CustomerNote copyWith({
    String? content,
    DateTime? followUpDate,
    FollowUpStatus? followUpStatus,
    List<TaskEvent>? events,
    List<ActivityAttachment>? attachments,
  }) {
    return CustomerNote(
      id: id,
      customerId: customerId,
      type: type,
      content: content ?? this.content,
      createdAt: createdAt,
      followUpDate: followUpDate ?? this.followUpDate,
      followUpStatus: followUpStatus ?? this.followUpStatus,
      authorName: authorName,
      noteType: noteType,
      followUpType: followUpType,
      assignees: assignees,
      priority: priority,
      reminder: reminder,
      reminderDate: reminderDate,
      events: events ?? this.events,
      creatorId: creatorId,
      attachments: attachments ?? this.attachments,
    );
  }
}
