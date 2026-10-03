import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/sales_document.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';
import 'sales_document_detail_screen.dart';

class SalesDocumentsScreen extends StatelessWidget {
  const SalesDocumentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final documentService = context.watch<SalesDocumentService>();

    final documents = documentService.documents.reversed.toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Sales Documents')),
      body: documents.isEmpty
          ? const _EmptyDocuments()
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _SummaryCard(
                        title: 'Quotations',
                        value: documentService.quotations.length.toString(),
                        icon: Icons.description_outlined,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _SummaryCard(
                        title: 'Total',
                        value: documents.length.toString(),
                        icon: Icons.folder_outlined,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'DOCUMENTS',
                  style: TextStyle(
                    color: AppColors.muted,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 10),
                ...documents.map(
                  (document) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _DocumentCard(document: document),
                  ),
                ),
              ],
            ),
    );
  }
}

class _DocumentCard extends StatelessWidget {
  final SalesDocument document;

  const _DocumentCard({required this.document});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => SalesDocumentDetailScreen(document: document),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: AppColors.copperLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.description_outlined,
                  color: AppColors.copper,
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            document.number,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        _StatusBadge(status: document.status),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      document.customer.businessName,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${document.items.length} item${document.items.length == 1 ? '' : 's'}'
                      ' · ${_formatDate(document.createdAt)}',
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '\$${document.total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: AppColors.copper,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 5),
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: Icon(Icons.chevron_right, color: AppColors.muted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final SalesDocumentStatus status;

  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final String label;
    final Color background;
    final Color foreground;

    switch (status) {
      case SalesDocumentStatus.quotation:
        label = 'QUOTE';
        background = AppColors.copperLight;
        foreground = AppColors.copper;
        break;

      case SalesDocumentStatus.order:
        label = 'ORDER';
        background = AppColors.successLight;
        foreground = AppColors.success;
        break;

      case SalesDocumentStatus.invoice:
        label = 'INVOICE';
        background = AppColors.successLight;
        foreground = AppColors.success;
        break;

      case SalesDocumentStatus.cancelled:
        label = 'CANCELLED';
        background = AppColors.dangerLight;
        foreground = AppColors.danger;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: foreground,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.copper),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
          ),
          Text(
            title,
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _EmptyDocuments extends StatelessWidget {
  const _EmptyDocuments();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.description_outlined, size: 52, color: AppColors.muted),
            SizedBox(height: 14),
            Text(
              'No sales documents yet',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
            SizedBox(height: 6),
            Text(
              'Created quotations will appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.muted),
            ),
          ],
        ),
      ),
    );
  }
}

String _formatDate(DateTime date) {
  final day = date.day.toString().padLeft(2, '0');

  final month = date.month.toString().padLeft(2, '0');

  return '$day/$month/${date.year}';
}
