import 'customer_snapshot.dart';
import 'sales_document_item.dart';

enum SalesDocumentStatus { quotation, order, invoice, cancelled }

enum InvoicePaymentStatus { unpaid, partiallyPaid, paid, overdue }

class SalesDocument {
  final String number;

  final CustomerSnapshot customer;

  final List<SalesDocumentItem> items;

  final DateTime createdAt;

  final SalesDocumentStatus status;

  final DateTime? convertedToOrderAt;

  final DateTime? convertedToInvoiceAt;

  // Invoice fields
  final DateTime? invoiceDate;

  final DateTime? dueDate;

  final double amountPaid;

  const SalesDocument({
    required this.number,
    required this.customer,
    required this.items,
    required this.createdAt,
    this.status = SalesDocumentStatus.quotation,
    this.convertedToOrderAt,
    this.convertedToInvoiceAt,
    this.invoiceDate,
    this.dueDate,
    this.amountPaid = 0,
  });

  double get subtotal {
    return items.fold(0, (total, item) {
      return total + item.subtotal;
    });
  }

  double get gst {
    return subtotal * 0.10;
  }

  double get total {
    return subtotal + gst;
  }

  double get balanceDue {
    final balance = total - amountPaid;

    if (balance < 0) {
      return 0;
    }

    return balance;
  }

  InvoicePaymentStatus? get invoicePaymentStatus {
    if (status != SalesDocumentStatus.invoice) {
      return null;
    }

    // Fully paid always takes priority.
    if (balanceDue <= 0) {
      return InvoicePaymentStatus.paid;
    }

    // Still owing money after due date.
    if (dueDate != null) {
      final today = DateTime.now();

      final todayOnly = DateTime(today.year, today.month, today.day);

      final dueDateOnly = DateTime(dueDate!.year, dueDate!.month, dueDate!.day);

      if (todayOnly.isAfter(dueDateOnly)) {
        return InvoicePaymentStatus.overdue;
      }
    }

    if (amountPaid > 0) {
      return InvoicePaymentStatus.partiallyPaid;
    }

    return InvoicePaymentStatus.unpaid;
  }

  int get overdueDays {
    if (status != SalesDocumentStatus.invoice) {
      return 0;
    }

    if (balanceDue <= 0) {
      return 0;
    }

    if (dueDate == null) {
      return 0;
    }

    final today = DateTime.now();

    final todayOnly = DateTime(today.year, today.month, today.day);

    final dueDateOnly = DateTime(dueDate!.year, dueDate!.month, dueDate!.day);

    if (!todayOnly.isAfter(dueDateOnly)) {
      return 0;
    }

    return todayOnly.difference(dueDateOnly).inDays;
  }

  SalesDocument copyWith({
    SalesDocumentStatus? status,
    DateTime? convertedToOrderAt,
    DateTime? convertedToInvoiceAt,
    DateTime? invoiceDate,
    DateTime? dueDate,
    double? amountPaid,
  }) {
    return SalesDocument(
      number: number,
      customer: customer,
      items: items,
      createdAt: createdAt,

      status: status ?? this.status,

      convertedToOrderAt: convertedToOrderAt ?? this.convertedToOrderAt,

      convertedToInvoiceAt: convertedToInvoiceAt ?? this.convertedToInvoiceAt,

      invoiceDate: invoiceDate ?? this.invoiceDate,

      dueDate: dueDate ?? this.dueDate,

      amountPaid: amountPaid ?? this.amountPaid,
    );
  }
}
