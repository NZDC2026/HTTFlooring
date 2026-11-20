import '../models/app_user.dart';
import '../models/sales_user.dart';

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/customer_note.dart';
import '../services/app_session.dart';
import '../services/customer_note_service.dart';
import 'sales_detail_ui.dart';

class SalesTaskCompletion {
  const SalesTaskCompletion(this.outcome, {this.nextDate});
  final String outcome;
  final DateTime? nextDate;
}

Future<SalesTaskCompletion?> chooseTaskCompletion(
  BuildContext context, {
  required String customerName,
  required String description,
  required String type,
}) async {
  final payment = type.toLowerCase().contains('payment');
  final choice = await showDetailSheet<bool>(
    context,
    (sheet) => Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Complete follow-up',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 5),
        Text(
          '$customerName · $description',
          style: const TextStyle(fontSize: 12, color: detailMuted),
        ),
        const SizedBox(height: 12),
        for (final again in [false, true])
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 2),
            leading: DetailGlyph(again ? 'calendar' : 'check', size: 21),
            title: Text(
              payment
                  ? again
                        ? 'Promised to pay'
                        : 'Paid'
                  : again
                  ? 'Done — follow up again'
                  : 'Done',
              style: const TextStyle(fontSize: 14),
            ),
            subtitle: Text(
              payment
                  ? again
                        ? 'Follow up again on the promised date'
                        : 'Payment received'
                  : again
                  ? 'Create the next follow-up'
                  : 'Nothing more needed',
              style: const TextStyle(fontSize: 12, color: detailMuted),
            ),
            onTap: () => Navigator.pop(sheet, again),
          ),
      ],
    ),
  );
  if (choice == null || !context.mounted) return null;
  final outcome = payment
      ? choice
            ? 'Promised to pay'
            : 'Paid'
      : 'Done';
  if (!choice) return SalesTaskCompletion(outcome);
  final date = await chooseNextFollowUpDate(context, customerName);
  return date == null ? null : SalesTaskCompletion(outcome, nextDate: date);
}

Future<DateTime?> chooseNextFollowUpDate(BuildContext context, String name) {
  final now = DateUtils.dateOnly(DateTime.now());
  final monday = now.add(Duration(days: 8 - now.weekday));
  return showDetailSheet<DateTime>(
    context,
    (sheet) => Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Next follow-up for $name',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        for (final row in [
          ('Tomorrow', now.add(const Duration(days: 1))),
          ('Next Monday', monday),
          ('In 1 week', now.add(const Duration(days: 7))),
          ('In 2 weeks', now.add(const Duration(days: 14))),
        ])
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const DetailGlyph('calendar'),
            title: Text(row.$1, style: const TextStyle(fontSize: 14)),
            subtitle: Text(
              DateFormat('EEE d MMM').format(row.$2),
              style: const TextStyle(fontSize: 12, color: detailMuted),
            ),
            onTap: () => Navigator.pop(sheet, row.$2),
          ),
      ],
    ),
  );
}

/// Follow-up outcomes never change an invoice's accounting/payment status.
Future<void> createNextSalesFollowUp(
  BuildContext context,
  SalesTaskCompletion choice, {
  required String customerId,
  required String content,
  required String type,
  CustomerNoteService? service,
  List<AppUser>? assignees,
  String? priority,
}) async {
  if (choice.nextDate == null) return;
  final user = context.read<AppSession>().currentUser;
  final target = service ?? context.read<CustomerNoteService>();
  target.addFollowUp(
    customerId: customerId,
    actor: user,
    content: content,
    followUpDate: choice.nextDate,
    followUpType: type,
    assignees: assignees ?? [user],
    priority: priority,
  );
  final note = target.notes.last;
  final prefs = await SharedPreferences.getInstance();
  final key = 'sales-next-follow-ups-${user.id}';
  final rows = (jsonDecode(prefs.getString(key) ?? '[]') as List);
  rows.add({
    'id': note.id,
    'customerId': customerId,
    'content': content,
    'type': type,
    'date': choice.nextDate!.toIso8601String(),
    'createdAt': note.createdAt.toIso8601String(),
    'priority': priority,
    'assignees': [
      for (final person in assignees ?? [user])
        {
          'id': person.id,
          'name': person.name,
          'email': person.email,
          'role': person.role.name,
          'region': person.region.name,
        },
    ],
  });
  await prefs.setString(key, jsonEncode(rows));
}

Future<void> restoreNextSalesFollowUps(BuildContext context) async {
  final user = context.read<AppSession>().currentUser;
  final target = context.read<CustomerNoteService>();
  final prefs = await SharedPreferences.getInstance();
  final raw = prefs.getString('sales-next-follow-ups-${user.id}');
  if (raw == null) return;
  try {
    for (final row in jsonDecode(raw) as List) {
      target.restoreLocalFollowUp(
        CustomerNote(
          id: row['id'] as String,
          customerId: row['customerId'] as String,
          type: CustomerNoteType.followUp,
          content: row['content'] as String,
          createdAt: DateTime.parse(row['createdAt'] as String),
          followUpDate: DateTime.parse(row['date'] as String),
          followUpType: row['type'] as String,
          followUpStatus: row['completed'] == true
              ? FollowUpStatus.completed
              : FollowUpStatus.pending,
          creatorId: user.id,
          priority: row['priority'] as String?,
          assignees: row['assignees'] is List
              ? [
                  for (final person in row['assignees'] as List)
                    AppUser(
                      id: person['id'] as String,
                      name: person['name'] as String,
                      email: person['email'] as String? ?? '',
                      role:
                          UserRole.values
                              .where((v) => v.name == person['role'])
                              .firstOrNull ??
                          UserRole.sales,
                      region:
                          SalesRegion.values
                              .where((v) => v.name == person['region'])
                              .firstOrNull ??
                          user.region,
                    ),
                ]
              : [user],
        ),
      );
    }
  } catch (_) {
    /* Ignore old local preview data. */
  }
}

Future<void> saveNextSalesFollowUpStates(
  BuildContext context, {
  CustomerNoteService? service,
}) async {
  final userId = context.read<AppSession>().currentUser.id;
  final target = service ?? context.read<CustomerNoteService>();
  final prefs = await SharedPreferences.getInstance();
  final key = 'sales-next-follow-ups-$userId';
  final raw = prefs.getString(key);
  if (raw == null) return;
  final rows = jsonDecode(raw) as List;
  for (final row in rows) {
    final note = target.notes.where((n) => n.id == row['id']).firstOrNull;
    if (note == null) continue;
    row['completed'] = note.isCompleted;
    row['date'] = note.followUpDate?.toIso8601String() ?? row['date'];
    row['content'] = note.content;
    row['type'] = note.followUpType ?? row['type'];
  }
  await prefs.setString(key, jsonEncode(rows));
}
