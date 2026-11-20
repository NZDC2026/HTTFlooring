import 'dart:convert';

import 'customer_note.dart';
import 'app_user.dart';
import 'sales_user.dart';

Map<String, dynamic> encodeCustomerNote(CustomerNote note) {
  Map<String, dynamic> attachment(ActivityAttachment a) => {
    'name': a.name,
    'bytes': base64Encode(a.bytes),
    'photo': a.isPhoto,
  };
  return {
    'id': note.id,
    'customerId': note.customerId,
    'type': note.type.name,
    'content': note.content,
    'createdAt': note.createdAt.toIso8601String(),
    'creatorId': note.creatorId,
    'authorName': note.authorName,
    'noteType': note.noteType,
    'followUpType': note.followUpType,
    'date': note.followUpDate?.toIso8601String(),
    'status': note.followUpStatus?.name,
    'priority': note.priority,
    'reminder': note.reminder,
    'reminderDate': note.reminderDate?.toIso8601String(),
    'owners': [
      for (final p in note.assignees)
        {
          'id': p.id,
          'name': p.name,
          'email': p.email,
          'role': p.role.name,
          'region': p.region.name,
        },
    ],
    'attachments': note.attachments.map(attachment).toList(),
    'events': [
      for (final e in note.events)
        {
          'author': e.author,
          'action': e.action,
          'message': e.message,
          'at': e.at.toIso8601String(),
          'attachments': e.attachments.map(attachment).toList(),
        },
    ],
  };
}

CustomerNote decodeCustomerNote(Map<String, dynamic> row) {
  List<ActivityAttachment> attachments(dynamic raw) => [
    for (final a in raw as List? ?? const [])
      ActivityAttachment(
        name: '${a['name']}',
        bytes: base64Decode('${a['bytes']}'),
        isPhoto: a['photo'] == true,
      ),
  ];
  DateTime? date(dynamic raw) => raw == null ? null : DateTime.tryParse('$raw');
  return CustomerNote(
    id: row['id'] as String,
    customerId: row['customerId'] as String,
    type: CustomerNoteType.values.byName(row['type'] as String),
    content: row['content'] as String,
    createdAt: DateTime.parse(row['createdAt'] as String),
    creatorId: row['creatorId'] as String?,
    authorName: row['authorName'] as String?,
    noteType: row['noteType'] as String?,
    followUpType: row['followUpType'] as String?,
    followUpDate: date(row['date']),
    followUpStatus: row['status'] == null
        ? null
        : FollowUpStatus.values.byName(row['status'] as String),
    priority: row['priority'] as String?,
    reminder: row['reminder'] as String?,
    reminderDate: date(row['reminderDate']),
    assignees: [
      for (final p in row['owners'] as List? ?? const [])
        AppUser(
          id: p['id'] as String,
          name: p['name'] as String,
          email: p['email'] as String,
          role: UserRole.values.byName(p['role'] as String),
          region: SalesRegion.values.byName(p['region'] as String),
        ),
    ],
    attachments: attachments(row['attachments']),
    events: [
      for (final e in row['events'] as List? ?? const [])
        (
          author: e['author'] as String,
          action: e['action'] as String,
          message: e['message'] as String?,
          at: DateTime.parse(e['at'] as String),
          attachments: attachments(e['attachments']),
        ),
    ],
  );
}
