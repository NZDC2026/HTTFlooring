import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../services/app_session.dart';
import '../../../services/customer_location_service.dart';

import '../../../services/visit_backend.dart';
import 'visit_check_in_screen.dart';

class SalesVisitScreen extends StatefulWidget {
  const SalesVisitScreen({super.key, this.initialSearch = ''});

  final String initialSearch;

  @override
  State<SalesVisitScreen> createState() => _SalesVisitScreenState();
}

class _SalesVisitScreenState extends State<SalesVisitScreen> {
  late final _search = TextEditingController(text: widget.initialSearch);
  final _branches = <JsonObject>[];
  List<JsonObject> _companies = [];
  VisitBackend? _connection;
  VisitBackend? _backend;
  JsonObject? _pending;
  bool _busy = false;
  String? _message;
  int _total = 0;
  int _page = 0;
  String _query = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _run(_loadSession);
    });
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() {
      _busy = true;
      _message = null;
    });
    try {
      await action();
    } catch (error) {
      if (mounted) {
        setState(() {
          _message = error is VisitApiException || error is FormatException
              ? '$error'
              : 'Could not complete the request. Check your connection and try again.';
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _loadSession() async {
    final token = context.read<AppSession>().employeeAccessToken;
    if (token == null || token.isEmpty) {
      return;
    }
    final origin = Uri.tryParse(const String.fromEnvironment('HTT_API_ORIGIN'));
    if (origin == null ||
        origin.scheme != 'https' ||
        origin.host.isEmpty ||
        origin.userInfo.isNotEmpty ||
        origin.hasQuery ||
        origin.hasFragment ||
        (origin.path.isNotEmpty && origin.path != '/')) {
      throw const FormatException('The check-in backend is not configured.');
    }
    final connection = VisitBackend(origin, token);
    final me = await connection.request('GET', '/me');
    if (!mounted) return;
    final companies = (me['companies'] as List).cast<JsonObject>();
    if (companies.isEmpty) {
      throw const FormatException('No company access was returned.');
    }
    _connection = connection;
    _companies = companies;
    if (_companies.length == 1) await _selectCompany(_companies.single);
  }

  Future<void> _selectCompany(JsonObject company) async {
    final backend = _connection!.forCompany(company);
    final pending = await backend.pending();
    if (!mounted) return;
    _backend = backend;
    _pending = pending;
    if (pending == null) await _loadBranches(reset: true);
  }

  Future<void> _loadBranches({bool reset = false}) async {
    final page = reset ? 1 : _page + 1;
    final query = reset ? _search.text.trim() : _query;
    final response = await _backend!.request(
      'GET',
      '/crm/map/branches',
      query: {
        'geocodeState': 'LOCATED',
        'status': 'ACTIVE',
        'page': '$page',
        'pageSize': '50',
        if (query.isNotEmpty) 'q': query,
      },
    );
    if (!mounted) return;
    if (reset) _branches.clear();
    _branches.addAll((response['items'] as List).cast<JsonObject>());
    _query = query;
    _page = page;
    _total = response['total'] as int;
  }

  @override
  Widget build(BuildContext context) {
    final supported =
        kIsWeb ||
        defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
    return Scaffold(
      appBar: AppBar(title: const Text('Sales Visit Check-in')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (!supported)
            const Text(
              'Use the Android or iOS app, or a browser with camera access.',
            )
          else if (context
                  .watch<AppSession>()
                  .employeeAccessToken
                  ?.isNotEmpty !=
              true) ...[
            const Text('Demo check-in · Photos are previewed on this device.'),
            for (final location
                in context.watch<CustomerLocationService>().getForRegion(
                  context.watch<AppSession>().region,
                ))
              ListTile(
                title: Text(location.name),
                subtitle: Text(location.address),
                onTap: () => Navigator.of(context).push<bool>(
                  MaterialPageRoute(
                    builder: (_) => VisitCheckInScreen.demo(location),
                  ),
                ),
              ),
          ] else if (_connection == null) ...[
            if (!_busy &&
                context.read<AppSession>().employeeAccessToken != null)
              TextButton(
                onPressed: () => _run(_loadSession),
                child: const Text('Retry'),
              ),
          ] else if (_backend == null) ...[
            for (final company in _companies)
              ListTile(
                title: Text(company['companyName'] as String),
                onTap: _busy ? null : () => _run(() => _selectCompany(company)),
              ),
          ] else if (_pending case final pending?) ...[
            Text(
              'Pending visit at ${pending['name']}. The photo is saved on this device.',
            ),
            FilledButton(
              onPressed: _busy
                  ? null
                  : () => _run(() async {
                      await _backend!.submitPending();
                      if (!mounted) return;
                      _pending = null;
                      _message = 'Visit submitted. Photo queued for scanning.';
                      await _loadBranches(reset: true);
                    }),
              child: const Text('Retry Submission'),
            ),
          ] else ...[
            TextField(
              controller: _search,
              enabled: !_busy,
              decoration: const InputDecoration(
                labelText: 'Search customers and branches',
              ),
              onSubmitted: (_) => _run(() => _loadBranches(reset: true)),
            ),
            TextButton(
              onPressed: _busy
                  ? null
                  : () => _run(() => _loadBranches(reset: true)),
              child: const Text('Search'),
            ),
            if (!_busy && _branches.isEmpty)
              const Text('No located branches found.'),
            for (final branch in _branches)
              ListTile(
                title: Text('${branch['customerName']} · ${branch['name']}'),
                subtitle: Text(
                  [
                    visitAddress(branch),
                    if (branch['attribution'] case final String attribution)
                      attribution,
                  ].join('\n'),
                ),
                enabled:
                    !_busy &&
                    branch['latitude'] is num &&
                    branch['longitude'] is num,
                onTap: () => _run(() async {
                  final backend = _backend!;
                  final submitted = await Navigator.of(context).push<bool>(
                    MaterialPageRoute(
                      builder: (_) =>
                          VisitCheckInScreen(backend: backend, branch: branch),
                    ),
                  );
                  if (!mounted) return;
                  _pending = await backend.pending();
                  if (submitted == true) {
                    _message = 'Visit submitted. Photo queued for scanning.';
                  }
                }),
              ),
            if (_branches.length < _total)
              TextButton(
                onPressed: _busy ? null : () => _run(_loadBranches),
                child: const Text('Load more'),
              ),
          ],
          if (_busy) const LinearProgressIndicator(),
          if (_message case final message?) Text(message),
        ],
      ),
    );
  }
}
