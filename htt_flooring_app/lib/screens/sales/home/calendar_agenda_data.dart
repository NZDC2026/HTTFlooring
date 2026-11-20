import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/customer_note.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/sales_session.dart';
import '../customers/customer_directory_data.dart';

enum AgendaKind { visit, followUp, note }

class AgendaEvent {
  const AgendaEvent({
    required this.id,
    required this.kind,
    required this.at,
    required this.customerName,
    required this.description,
    this.customer,
    this.note,
    this.contact = '',
    this.address = '',
    this.duration = 45,
    this.completed = false,
    this.inProgress = false,
    this.demo = false,
    this.type = 'Follow-up',
    this.assignedToMe = true,
  });
  final String id, customerName, description, contact, address, type;
  final AgendaKind kind;
  final DateTime at;
  final Customer? customer;
  final CustomerNote? note;
  final int duration;
  final bool completed, inProgress, demo, assignedToMe;
  DateTime get end => at.add(Duration(minutes: duration));
}

class CalendarAgendaData {
  CalendarAgendaData(
    BuildContext context, {
    required DateTime today,
    Map<String, bool> completion = const {},
    Map<String, DateTime> dates = const {},
    Map<String, int> durations = const {},
  }) {
    final app = context.read<AppSession>();
    final session = context.read<SalesSession>();
    final directory = CustomerDirectoryData(context);
    final customers = {
      for (final r in directory.rows) r.customer.id: r.customer,
    };
    demo =
        AppSession.demoLoginEnabled &&
        (app.employeeAccessToken?.isEmpty ?? true);
    final notes = context.read<CustomerNoteService>().notes;
    events = [];
    for (final n in notes) {
      if (n.creatorId != app.currentUser.id &&
          !n.assignees.any((u) => u.id == app.currentUser.id)) {
        continue;
      }
      final customer = customers[n.customerId];
      if (n.customerId.isNotEmpty &&
          (customer == null || !session.canAccessRegion(customer.region))) {
        continue;
      }
      final date = n.isFollowUp ? n.followUpDate : n.createdAt;
      if (date == null) continue;
      final type = n.followUpType ?? 'Follow-up';
      final visit = type == 'Customer Visit' || type == 'Visit / Meeting';
      final record = directory.rows
          .where((r) => r.customer.id == n.customerId)
          .firstOrNull;
      events.add(
        AgendaEvent(
          id: n.id,
          assignedToMe: n.assignees.any((u) => u.id == app.currentUser.id),
          kind: !n.isFollowUp
              ? AgendaKind.note
              : visit
              ? AgendaKind.visit
              : AgendaKind.followUp,
          at: date.toLocal(),
          customerName: customer?.businessName ?? 'General task',
          customer: customer,
          note: n,
          description: n.content,
          contact: record?.contact ?? '',
          address: customer?.address ?? '',
          completed: n.isCompleted,
          inProgress: n.followUpStatus == FollowUpStatus.inProgress,
          duration: durations[n.id] ?? 45,
          type: !n.isFollowUp ? 'Note' : _shortType(type),
        ),
      );
    }
    if (demo) {
      final stamp = '${today.year}-${today.month}-${today.day}';
      void add(
        String id,
        AgendaKind kind,
        int offset,
        String name,
        String description, {
        int hour = 9,
        int minute = 0,
        bool done = false,
        bool progress = false,
        bool mine = true,
        String type = 'Follow-up',
        String contact = '',
        String address = '',
      }) {
        final key = 'calendar-demo-$stamp-$id';
        final row = directory.rows
            .where((r) => r.customer.businessName == name)
            .firstOrNull;
        final date =
            dates[key] ??
            DateTime(today.year, today.month, today.day + offset, hour, minute);
        events.add(
          AgendaEvent(
            id: key,
            assignedToMe: mine,
            kind: kind,
            at: date,
            customerName: name,
            description: description,
            customer: row?.customer,
            contact: contact.isEmpty ? row?.contact ?? '' : contact,
            address: address.isEmpty ? row?.customer.address ?? '' : address,
            completed: completion[key] ?? done,
            inProgress: progress,
            demo: true,
            type: type,
          ),
        );
      }

      add(
        'visit-abc',
        AgendaKind.visit,
        0,
        'ABC Flooring',
        'Showroom quote review',
        hour: 10,
        minute: 30,
        contact: 'John',
        address: '15 George Street, Sydney NSW 2000',
      );
      add(
        'visit-city',
        AgendaKind.visit,
        0,
        'City Timber Floors',
        'Deliver Heritage swatches',
        hour: 14,
        contact: 'Grace',
        address: '88 Victoria Road, Parramatta NSW 2150',
      );
      const tasks = <(String, String, String, String)>[
        (
          'ABC Flooring',
          'INV-10548 due today (\$8,682.96 incl. GST)',
          'Payment',
          'John',
        ),
        (
          'City Timber Floors',
          'Deliver Heritage swatches (Natural Oak, White Oak)',
          'Swatches',
          'Grace',
        ),
        (
          'Northern Floors',
          'Follow up QT-1003 — Hornsby townhouses',
          'Quote',
          'Mark',
        ),
        (
          'Floor Direct',
          'INV-10145 overdue 83 days — account on hold',
          'Payment',
          'David',
        ),
        (
          'ABC Flooring',
          'Deliver Heritage Smoked Oak colour panel (DBR-0412)',
          'Swatches',
          'John',
        ),
        (
          'Timber World',
          'Confirm Thursday showroom visit with Emma',
          'Follow-up',
          'Emma',
        ),
      ];
      for (var i = 0; i < 16; i++) {
        final t = tasks[i % tasks.length];
        add(
          'task-$i',
          AgendaKind.followUp,
          0,
          t.$1,
          t.$2,
          type: t.$3,
          contact: t.$4,
          progress: i == 1,
          mine: i < 14,
        );
      }
      for (var i = 0; i < 3; i++) {
        final t = tasks[i];
        add(
          'completed-$i',
          AgendaKind.followUp,
          0,
          t.$1,
          t.$2,
          type: t.$3,
          contact: t.$4,
          done: true,
        );
      }
      add(
        'future-visit',
        AgendaKind.visit,
        2,
        'Timber World',
        'Review new flooring samples',
        hour: 11,
        contact: 'Emma',
      );
      add(
        'future-task',
        AgendaKind.followUp,
        2,
        'Northern Floors',
        'Confirm quotation and delivery requirements',
        type: 'Quote',
        contact: 'Mark',
      );
      add(
        'future-payment',
        AgendaKind.followUp,
        3,
        'ABC Flooring',
        'Confirm the next payment arrangement',
        type: 'Payment',
        contact: 'John',
      );
      for (final day in [1, 4, 10, 12, 15]) {
        final past = DateTime(today.year, today.month, day);
        if (past.isBefore(today)) {
          add(
            'history-$day',
            AgendaKind.followUp,
            past.difference(today).inDays,
            'ABC Flooring',
            'Customer follow-up completed',
            done: true,
          );
        }
      }
    }
    events.sort((a, b) => a.at.compareTo(b.at));
  }
  late bool demo;
  late List<AgendaEvent> events;
  static String _shortType(String type) => type.contains('Payment')
      ? 'Payment'
      : type.contains('Sample') || type.contains('Swatch')
      ? 'Swatches'
      : type.contains('Quotation') || type.contains('Quote')
      ? 'Quote'
      : type;
  List<AgendaEvent> on(DateTime day) =>
      events.where((e) => DateUtils.isSameDay(e.at, day)).toList();
}
