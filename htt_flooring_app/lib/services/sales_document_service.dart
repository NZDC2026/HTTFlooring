import 'package:flutter/foundation.dart';

import '../models/customer.dart';
import '../models/customer_snapshot.dart';
import '../models/quote.dart';
import '../models/sales_document.dart';
import '../models/sales_document_item.dart';

class SalesDocumentService extends ChangeNotifier {
  final List<SalesDocument> _documents = [];

  List<SalesDocument> get documents {
    return List.unmodifiable(_documents);
  }

  List<SalesDocument> get quotations {
    return _documents
        .where((document) => document.status == SalesDocumentStatus.quotation)
        .toList();
  }

  List<SalesDocument> get orders {
    return _documents
        .where((document) => document.status == SalesDocumentStatus.order)
        .toList();
  }

  List<SalesDocument> get invoices {
    return _documents
        .where((document) => document.status == SalesDocumentStatus.invoice)
        .toList();
  }

  List<SalesDocument> get unpaidInvoices {
    return invoices.where((document) => document.balanceDue > 0).toList();
  }

  List<SalesDocument> get overdueInvoices {
    return invoices
        .where(
          (document) =>
              document.invoicePaymentStatus == InvoicePaymentStatus.overdue,
        )
        .toList();
  }

  double get totalOutstanding {
    return invoices.fold(0, (total, document) => total + document.balanceDue);
  }

  double get totalOverdue {
    return overdueInvoices.fold(
      0,
      (total, document) => total + document.balanceDue,
    );
  }

  SalesDocument? findByNumber(String number) {
    for (final document in _documents) {
      if (document.number == number) {
        return document;
      }
    }

    return null;
  }

  void createQuotation({
    required String number,
    required Customer customer,
    required List<QuoteItem> items,
  }) {
    final alreadyExists = _documents.any(
      (document) => document.number == number,
    );

    if (alreadyExists) {
      throw StateError('Document number already exists.');
    }

    if (items.isEmpty) {
      throw StateError('Quotation must contain at least one item.');
    }

    final customerSnapshot = CustomerSnapshot.fromCustomer(customer);

    final documentItems = items
        .map(SalesDocumentItem.fromQuoteItem)
        .toList(growable: false);

    _documents.add(
      SalesDocument(
        number: number,

        // Freeze customer details at Create & Lock.
        customer: customerSnapshot,

        // Freeze product details, quantity and selling price
        // at Create & Lock.
        items: List<SalesDocumentItem>.unmodifiable(documentItems),

        createdAt: DateTime.now(),

        status: SalesDocumentStatus.quotation,
      ),
    );

    notifyListeners();
  }

  void convertQuotationToOrder(String number) {
    final index = _findIndex(number);

    final document = _documents[index];

    if (document.status != SalesDocumentStatus.quotation) {
      throw StateError('Only quotations can be converted to orders.');
    }

    _documents[index] = document.copyWith(
      status: SalesDocumentStatus.order,

      convertedToOrderAt: DateTime.now(),
    );

    notifyListeners();
  }

  void convertOrderToInvoice(String number) {
    final index = _findIndex(number);

    final document = _documents[index];

    if (document.status != SalesDocumentStatus.order) {
      throw StateError('Only orders can be converted to invoices.');
    }

    final invoiceDate = DateTime.now();

    final dueDate = invoiceDate.add(const Duration(days: 30));

    _documents[index] = document.copyWith(
      status: SalesDocumentStatus.invoice,

      convertedToInvoiceAt: invoiceDate,

      invoiceDate: invoiceDate,

      dueDate: dueDate,

      amountPaid: 0,
    );

    notifyListeners();
  }

  void recordPayment({required String number, required double amount}) {
    if (amount <= 0) {
      throw ArgumentError('Payment amount must be greater than zero.');
    }

    final index = _findIndex(number);

    final document = _documents[index];

    if (document.status != SalesDocumentStatus.invoice) {
      throw StateError('Payments can only be recorded against invoices.');
    }

    if (document.balanceDue <= 0) {
      throw StateError('Invoice is already fully paid.');
    }

    if (amount > document.balanceDue) {
      throw ArgumentError('Payment cannot exceed the balance due.');
    }

    final newAmountPaid = document.amountPaid + amount;

    _documents[index] = document.copyWith(amountPaid: newAmountPaid);

    notifyListeners();
  }

  List<SalesDocument> getCustomerOrders(String customerId) {
    return _documents
        .where(
          (document) =>
              document.customer.id == customerId &&
              document.status == SalesDocumentStatus.order,
        )
        .toList();
  }

  List<SalesDocument> getCustomerInvoices(String customerId) {
    return _documents
        .where(
          (document) =>
              document.customer.id == customerId &&
              document.status == SalesDocumentStatus.invoice,
        )
        .toList();
  }

  double getCustomerOutstanding(String customerId) {
    return getCustomerInvoices(customerId)
        .fold(0.0, (total, invoice) => total + invoice.balanceDue);
  }

  double getCustomerOverdue(String customerId) {
    return getCustomerInvoices(customerId)
        .where(
          (invoice) =>
              invoice.invoicePaymentStatus == InvoicePaymentStatus.overdue,
        )
        .fold(0.0, (total, invoice) => total + invoice.balanceDue);
  }

  int getCustomerOldestOverdueDays(String customerId) {
    final overdueInvoices = getCustomerInvoices(customerId).where(
      (invoice) => invoice.invoicePaymentStatus == InvoicePaymentStatus.overdue,
    );

    if (overdueInvoices.isEmpty) {
      return 0;
    }

    return overdueInvoices.fold<int>(0, (oldestDays, invoice) {
      if (invoice.overdueDays > oldestDays) {
        return invoice.overdueDays;
      }

      return oldestDays;
    });
  }

  int getCustomerUnpaidInvoiceCount(String customerId) {
    return getCustomerInvoices(customerId)
        .where((invoice) => invoice.balanceDue > 0)
        .length;
  }

  int getCustomerOverdueInvoiceCount(String customerId) {
    return getCustomerInvoices(customerId)
        .where(
          (invoice) =>
              invoice.invoicePaymentStatus == InvoicePaymentStatus.overdue,
        )
        .length;
  }

  int _findIndex(String number) {
    final index = _documents.indexWhere(
      (document) => document.number == number,
    );

    if (index == -1) {
      throw StateError('Sales document not found.');
    }

    return index;
  }
}
