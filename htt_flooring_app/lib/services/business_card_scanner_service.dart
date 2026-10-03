import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

import '../models/business_card_scan_result.dart';

class BusinessCardScannerService {
  Future<BusinessCardScanResult> scanImage(String imagePath) async {
    final inputImage = InputImage.fromFilePath(imagePath);

    final recognizer = TextRecognizer(script: TextRecognitionScript.latin);

    try {
      final recognizedText = await recognizer.processImage(inputImage);

      return _parse(recognizedText.text);
    } finally {
      await recognizer.close();
    }
  }

  BusinessCardScanResult _parse(String rawText) {
    final originalLines = rawText
        .split('\n')
        .map((line) => line.trim())
        .where((line) => line.isNotEmpty)
        .toList();

    final lines = originalLines
        .map(_normaliseLine)
        .where((line) => line.isNotEmpty)
        .toList();

    String email = '';
    String phone = '';
    String website = '';
    String businessName = '';
    String contactName = '';
    String address = '';

    // ------------------------------------------------------------
    // 1. Email
    // ------------------------------------------------------------

    for (final line in lines) {
      final detected = _extractEmail(line);

      if (detected.isNotEmpty) {
        email = detected;
        break;
      }
    }

    // ------------------------------------------------------------
    // 2. Website
    // ------------------------------------------------------------

    for (final line in lines) {
      final detected = _extractWebsite(line);

      if (detected.isNotEmpty) {
        website = detected;
        break;
      }
    }

    // ------------------------------------------------------------
    // 3. Phone
    // ------------------------------------------------------------

    for (final line in lines) {
      final detected = _extractPhone(line);

      if (detected.isNotEmpty) {
        phone = detected;
        break;
      }
    }

    // ------------------------------------------------------------
    // 4. Address
    // ------------------------------------------------------------

    address = _guessAddress(lines);

    // ------------------------------------------------------------
    // 5. Remove contact information before guessing names
    // ------------------------------------------------------------

    final candidateLines = lines.where((line) {
      if (_isEmailLine(line)) {
        return false;
      }

      if (_isWebsiteLine(line)) {
        return false;
      }

      if (_isPhoneLine(line)) {
        return false;
      }

      if (_isAddressLine(line)) {
        return false;
      }

      return true;
    }).toList();

    // ------------------------------------------------------------
    // 6. Contact name
    //
    // Person name is detected BEFORE company name.
    // This prevents:
    //
    // MARIA OLIVIA
    // Manager
    //
    // from becoming Business Name.
    // ------------------------------------------------------------

    contactName = _guessContactName(candidateLines);

    // ------------------------------------------------------------
    // 7. Business name
    // ------------------------------------------------------------

    businessName = _guessBusinessName(candidateLines, contactName);

    return BusinessCardScanResult(
      businessName: businessName,
      contactName: contactName,
      phone: phone,
      email: email,
      website: website,
      address: address,
      rawText: rawText,
    );
  }

  // ============================================================
  // NORMALISATION
  // ============================================================

  String _normaliseLine(String value) {
    var line = value.trim();

    // Replace common OCR punctuation variants.
    line = line
        .replaceAll('＠', '@')
        .replaceAll('．', '.')
        .replaceAll('。', '.')
        .replaceAll('，', ',')
        .replaceAll('：', ':');

    // Collapse repeated whitespace.
    line = line.replaceAll(RegExp(r'\s+'), ' ');

    return line.trim();
  }

  // ============================================================
  // EMAIL
  // ============================================================

  String _extractEmail(String line) {
    var value = line.trim();

    // Remove common labels.
    value = value.replaceFirst(
      RegExp(r'^(email|e-mail|mail)\s*[:\-]?\s*', caseSensitive: false),
      '',
    );

    // OCR sometimes inserts spaces around @ or .
    value = value
        .replaceAll(RegExp(r'\s*@\s*'), '@')
        .replaceAll(RegExp(r'\s*\.\s*'), '.');

    final match = RegExp(
      r'[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}',
      caseSensitive: false,
    ).firstMatch(value);

    if (match == null) {
      return '';
    }

    return match.group(0)?.trim() ?? '';
  }

  bool _isEmailLine(String line) {
    if (_extractEmail(line).isNotEmpty) {
      return true;
    }

    return line.contains('@');
  }

  // ============================================================
  // WEBSITE
  // ============================================================

  String _extractWebsite(String line) {
    if (_isEmailLine(line)) {
      return '';
    }

    var value = line.trim();

    value = value.replaceFirst(
      RegExp(r'^(website|web|site)\s*[:\-]?\s*', caseSensitive: false),
      '',
    );

    // Repair spaces introduced around dots.
    value = value.replaceAll(RegExp(r'\s*\.\s*'), '.');

    // Handle some common OCR errors at the start of www.
    value = value.replaceFirst(RegExp(r'^[wWvV]{2,4}\s*[.:]?\s*'), 'www.');

    final match = RegExp(
      r'(?:(?:https?://)?(?:www\.)?)'
      r'[a-zA-Z0-9][a-zA-Z0-9\-]*'
      r'(?:\.[a-zA-Z0-9][a-zA-Z0-9\-]*)+'
      r'(?:/[^\s]*)?',
      caseSensitive: false,
    ).firstMatch(value);

    if (match == null) {
      return '';
    }

    var website = match.group(0)?.trim() ?? '';

    website = website.replaceAll(RegExp(r'[,.]+$'), '');

    return website;
  }

  bool _isWebsiteLine(String line) {
    if (_isEmailLine(line)) {
      return false;
    }

    return _extractWebsite(line).isNotEmpty;
  }

  // ============================================================
  // PHONE
  // ============================================================

  String _extractPhone(String line) {
    var value = line.trim();

    value = value.replaceFirst(
      RegExp(
        r'^(phone|mobile|mob|tel|telephone|ph|m)\s*[:\-]?\s*',
        caseSensitive: false,
      ),
      '',
    );

    final match = RegExp(r'(?<!\w)\+?\d[\d\s().\-]{6,}\d(?!\w)')
        .firstMatch(value);

    if (match == null) {
      return '';
    }

    final phone = match.group(0)?.trim() ?? '';

    // Make sure it actually contains enough digits.
    final digits = phone.replaceAll(RegExp(r'\D'), '');

    if (digits.length < 7) {
      return '';
    }

    return phone;
  }

  bool _isPhoneLine(String line) {
    return _extractPhone(line).isNotEmpty;
  }

  // ============================================================
  // CONTACT NAME
  // ============================================================

  String _guessContactName(List<String> lines) {
    for (var i = 0; i < lines.length; i++) {
      final line = lines[i];

      if (!_looksLikePersonName(line)) {
        continue;
      }

      // Strong signal:
      // Person name followed by a job title.
      //
      // MARIA OLIVIA
      // Manager
      //
      if (i + 1 < lines.length && _isJobTitle(lines[i + 1])) {
        return line;
      }
    }

    // Second pass:
    // Find the most plausible human name.
    for (final line in lines) {
      if (_looksLikePersonName(line)) {
        return line;
      }
    }

    return '';
  }

  bool _looksLikePersonName(String line) {
    final value = line.trim();

    if (value.isEmpty) {
      return false;
    }

    if (RegExp(r'\d').hasMatch(value)) {
      return false;
    }

    if (value.contains('@')) {
      return false;
    }

    if (_isJobTitle(value)) {
      return false;
    }

    if (_containsCompanyKeyword(value)) {
      return false;
    }

    if (_isWebsiteLine(value)) {
      return false;
    }

    final words = value
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();

    if (words.length < 2 || words.length > 4) {
      return false;
    }

    for (final word in words) {
      final cleaned = word.replaceAll(RegExp(r"[^A-Za-zÀ-ÖØ-öø-ÿ'\-]"), '');

      if (cleaned.length < 2) {
        return false;
      }
    }

    return true;
  }

  // ============================================================
  // JOB TITLE
  // ============================================================

  bool _isJobTitle(String line) {
    final lower = line.toLowerCase();

    const jobWords = [
      'manager',
      'director',
      'sales',
      'salesperson',
      'sales manager',
      'account manager',
      'business development',
      'business development manager',
      'owner',
      'founder',
      'co-founder',
      'consultant',
      'representative',
      'account executive',
      'executive',
      'marketing',
      'operations',
      'supervisor',
      'coordinator',
      'administrator',
      'assistant',
      'engineer',
      'designer',
      'architect',
      'developer',
      'ceo',
      'cfo',
      'cto',
      'coo',
      'general manager',
      'managing director',
      'project manager',
    ];

    for (final word in jobWords) {
      if (lower == word || lower.contains(word)) {
        return true;
      }
    }

    return false;
  }

  // ============================================================
  // BUSINESS NAME
  // ============================================================

  String _guessBusinessName(List<String> lines, String contactName) {
    // First pass:
    // Look for explicit company indicators.
    for (final line in lines) {
      if (line == contactName) {
        continue;
      }

      if (_isJobTitle(line)) {
        continue;
      }

      if (_containsCompanyKeyword(line)) {
        return line;
      }
    }

    // Second pass:
    // Look for a company-like line that isn't a person or job title.
    for (final line in lines) {
      if (line == contactName) {
        continue;
      }

      if (_isJobTitle(line)) {
        continue;
      }

      if (_looksLikePersonName(line)) {
        continue;
      }

      if (_isEmailLine(line) ||
          _isWebsiteLine(line) ||
          _isPhoneLine(line) ||
          _isAddressLine(line)) {
        continue;
      }

      if (line.length >= 3) {
        return line;
      }
    }

    // Important:
    // Do NOT use lines.first here.
    //
    // If no company is actually present on the card,
    // leave Business Name empty for manual review.
    return '';
  }

  bool _containsCompanyKeyword(String line) {
    final lower = line.toLowerCase();

    const companyWords = [
      'pty',
      'pty ltd',
      'ltd',
      'limited',
      'inc',
      'inc.',
      'llc',
      'corp',
      'corporation',
      'company',
      'co.',
      'group',
      'holdings',
      'solutions',
      'services',
      'industries',
      'enterprises',
      'flooring',
      'floors',
      'carpet',
      'carpets',
      'timber',
      'construction',
      'building',
      'builders',
      'interiors',
      'trading',
      'design',
      'studio',
      'agency',
      'partners',
      'Australia',
      'Australia Pty',
    ];

    return companyWords.any((word) => lower.contains(word.toLowerCase()));
  }

  // ============================================================
  // ADDRESS
  // ============================================================

  String _guessAddress(List<String> lines) {
    for (var i = 0; i < lines.length; i++) {
      final line = lines[i];

      if (!_isAddressLine(line)) {
        continue;
      }

      final addressParts = <String>[line];

      // Often the suburb/state/postcode is on the next line.
      if (i + 1 < lines.length) {
        final next = lines[i + 1];

        if (_looksLikeAddressContinuation(next)) {
          addressParts.add(next);
        }
      }

      return addressParts.join(', ');
    }

    return '';
  }

  bool _isAddressLine(String line) {
    final lower = ' ${line.toLowerCase()} ';

    if (!RegExp(r'\d').hasMatch(line)) {
      return false;
    }

    const addressWords = [
      ' street ',
      ' st ',
      ' road ',
      ' rd ',
      ' avenue ',
      ' ave ',
      ' drive ',
      ' dr ',
      ' lane ',
      ' ln ',
      ' way ',
      ' highway ',
      ' hwy ',
      ' boulevard ',
      ' blvd ',
      ' parade ',
      ' place ',
      ' pl ',
      ' crescent ',
      ' cres ',
      ' court ',
      ' ct ',
      ' terrace ',
      ' unit ',
      ' suite ',
      ' level ',
    ];

    return addressWords.any(lower.contains);
  }

  bool _looksLikeAddressContinuation(String line) {
    if (_isEmailLine(line) || _isWebsiteLine(line) || _isPhoneLine(line)) {
      return false;
    }

    // Australian / NZ postcode-like line.
    if (RegExp(r'\b\d{4}\b').hasMatch(line)) {
      return true;
    }

    const regionWords = [
      'nsw',
      'vic',
      'qld',
      'wa',
      'sa',
      'tas',
      'act',
      'nt',
      'auckland',
      'waikato',
      'wellington',
      'canterbury',
      'otago',
    ];

    final lower = line.toLowerCase();

    return regionWords.any(
      (word) => RegExp(
        '\\b${RegExp.escape(word)}\\b',
        caseSensitive: false,
      ).hasMatch(lower),
    );
  }
}
