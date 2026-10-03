import 'package:flutter/foundation.dart';

class DocumentNumberService extends ChangeNotifier {
  int _nextNumber = 100001;

  final Set<String> _issuedNumbers = {};

  String issueNumber() {
    final number = 'HTT-${_nextNumber.toString().padLeft(6, '0')}';

    _issuedNumbers.add(number);

    _nextNumber++;

    notifyListeners();

    return number;
  }

  bool hasBeenIssued(String number) {
    return _issuedNumbers.contains(number);
  }
}
