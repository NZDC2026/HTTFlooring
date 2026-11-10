"""Frozen HTT report pack. Escaped text only; no images, URLs, HTML or input paths."""
import io
import os
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import re
from xml.sax.saxutils import escape
import reportlab
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, LongTable, TableStyle
from reportlab.platypus.tableofcontents import TableOfContents


def render_pack(data):
    sections = data['sections']
    if not isinstance(sections, list) or not 1 <= len(sections) <= 8 or sum(len(s['rows']) for s in sections) > 2000:
        raise ValueError('Invalid bounded report pack')
    font_path = os.environ.get('HTT_PDF_FONT') or str(Path(reportlab.__file__).parent / 'fonts' / 'Vera.ttf')
    pdfmetrics.registerFont(TTFont('PackFont', font_path))
    pdfmetrics.registerFontFamily('PackFont', normal='PackFont', bold='PackFont', italic='PackFont', boldItalic='PackFont')
    chars = pdfmetrics.getFont('PackFont').face.charToGlyph

    def safe(value):
        value = '' if value is None else str(value)
        if len(value) > 8000 or any((ord(c) < 32 and c not in '\n\r\t') or (ord(c) >= 32 and ord(c) not in chars) for c in value):
            raise ValueError('Font coverage or text limit')
        return escape(value).replace('\n', '<br/>')

    ink = colors.HexColor('#16334c')
    body = ParagraphStyle('PackBody', fontName='PackFont', fontSize=8, leading=11, wordWrap='CJK', spaceAfter=3)
    small = ParagraphStyle('PackSmall', parent=body, fontSize=7, leading=10, textColor=colors.HexColor('#536779'))
    right = ParagraphStyle('PackRight', parent=body, alignment=TA_RIGHT)
    heading = ParagraphStyle('PackHeading', parent=body, fontSize=19, leading=25, textColor=ink, spaceAfter=12)
    cover = ParagraphStyle('PackCover', parent=heading, fontSize=30, leading=38, spaceAfter=22)
    config = data['format']
    if config['currency'] != 'AUD' or config['basis'] != 'SOURCE_DEFINED' or config['decimalPlaces'] not in (0, 2):
        raise ValueError('Unsupported presentation basis')
    places = config['decimalPlaces']

    def number(value, precision=None):
        if value is None:
            return ''
        n = Decimal(str(value))
        if not n.is_finite():
            raise ValueError('Nonfinite output')
        n = n.quantize(Decimal(1).scaleb(-(places if precision is None else precision)), rounding=ROUND_HALF_UP)
        text = format(abs(n), f',.{places if precision is None else precision}f')
        return ('(' + text + ')' if config['negativeStyle'] == 'PARENTHESES' else '-' + text) if n < 0 else text

    def p(value, style=body):
        return Paragraph(safe(value), style)

    titles = {'PROFIT_LOSS': 'Profit and loss', 'BALANCE_SHEET': 'Balance sheet', 'AR_AGING': 'Receivables aging', 'AP_AGING': 'Payables aging', 'CASH_FLOW': 'Cash flow', 'PURCHASING': 'Purchasing', 'ARAP': 'Receivables and payables', 'INVENTORY': 'Inventory', 'BANKING': 'Banking', 'SALES': 'Sales'}
    output = io.BytesIO()
    size = landscape(A4)
    width = size[0] - 84

    class PackDoc(BaseDocTemplate):
        def afterFlowable(self, flowable):
            if getattr(flowable, 'toc_title', None):
                key = flowable.toc_key
                self.canv.bookmarkPage(key)
                self.canv.addOutlineEntry(flowable.toc_title, key, 0, False)
                self.notify('TOCEntry', (0, flowable.toc_title, self.page, key))

    doc = PackDoc(output, pagesize=size, rightMargin=42, leftMargin=42, topMargin=55, bottomMargin=50, title=str(data['title']), author='HTT Flooring')

    def page(canvas, document):
        canvas.saveState()
        canvas.setFont('PackFont', 7)
        canvas.setFillColor(colors.HexColor('#536779'))
        # Paragraphs wrap long custom text instead of painting over page numbers.
        header = p(config.get('header') or data['issuer']['name'], small)
        _, h = header.wrap(width, 30)
        header.drawOn(canvas, 42, size[1] - 18 - h)
        footer = p(config.get('footer') or 'AUD | Frozen snapshot | Display rounding only', small)
        _, h = footer.wrap(width - 90, 32)
        footer.drawOn(canvas, 42, 22)
        canvas.drawRightString(size[0] - 42, 27, 'Page ' + str(document.page))
        canvas.restoreState()

    doc.addPageTemplates(PageTemplate(id='pack', frames=[Frame(42, 50, width, size[1] - 105, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=page))
    story = [Spacer(1, 55), p('FINANCIAL AND OPERATING REPORTS', small), p(data['title'], cover), p(data['issuer']['name'], heading)]
    if data['issuer'].get('abn'):
        story.append(p('ABN ' + data['issuer']['abn']))
    story.extend([p('Captured: ' + data['snapshotAt']), p('Currency: AUD | Basis: defined by each source report'), p('Reports: ' + str(len(sections))), Spacer(1, 24), p('Source snapshot SHA256', small), p(data['snapshotHash'], small), p('This report pack is not a tax invoice or proof of payment. Display rounding does not change stored financial values.', small), PageBreak(), p('Contents', heading)])
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle('PackTOC', parent=body, fontSize=11, leading=24, leftIndent=0, rightIndent=24)]
    story.extend([toc, PageBreak()])
    for index, section in enumerate(sections):
        if len(section['rows']) > 1000 or not 1 <= len(section['columns']) <= 8:
            raise ValueError('Section exceeds bounds')
        title = f"{index + 1}. {titles[section['kind']]}"
        line = p(title, heading)
        line.toc_title, line.toc_key = title, 'report-' + str(index)
        story.append(line)
        filters = section['definition']['filters']
        story.append(p(' | '.join(f'{k}: {v}' for k, v in filters.items() if v is not None), small))
        meta = section['metadata']
        story.append(p('Currency: AUD | Basis: ' + str(meta.get('basis', meta.get('method', 'SOURCE_DEFINED'))) + ' | Status: ' + str(meta.get('status', 'SOURCE_EVENTS')), small))
        # Keep native totals/status even when users choose only some row columns.
        if meta.get('totals'):
            def label(key):
                return re.sub(r'([a-z])([A-Z])', r'\1 \2', key).replace('_', ' ').capitalize()

            def summary(key, value, prefix=''):
                caption = (prefix + ' / ' if prefix else '') + label(key)
                if isinstance(value, dict):
                    for child, item in value.items():
                        yield from summary(child, item, caption)
                elif isinstance(value, list):
                    for item in value:
                        if key == 'quantityByBaseUnit':
                            yield p(caption + ' - ' + str(item['baseUnitCode']) + ': ' + number(item['baseQuantity'], 6), small)
                        else:
                            yield from summary('item', item, caption)
                elif value is not None:
                    if re.fullmatch(r'-?[0-9]+(?:\.[0-9]+)?', str(value)):
                        precision = 0 if key.lower().endswith('count') else 4 if 'percent' in key.lower() else None
                        shown = number(value, precision)
                    else:
                        shown = str(value)
                    yield p(caption + ': ' + shown, small)
            for key, value in meta['totals'].items():
                story.extend(summary(key, value))
        columns = section['columns']
        rows = [[p(c['label'], small) for c in columns]]
        for row in section['rows']:
            rows.append([p(number(row.get(c['key']), 6 if 'quantity' in c['key'].lower() else 4 if 'percent' in c['key'].lower() else None) if c['type'] == 'decimal' else row.get(c['key'], ''), right if c['type'] == 'decimal' else body) for c in columns])
        if len(rows) == 1:
            story.append(p('No rows for this selection.'))
        else:
            weights = [2.5 if any(s in c['key'].lower() for s in ('name', 'description')) else 1.3 for c in columns]
            widths = [width * w / sum(weights) for w in weights]
            grid = LongTable(rows, colWidths=widths, repeatRows=1, hAlign='LEFT', splitByRow=1, splitInRow=1)
            grid.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e9eff4')), ('LINEBELOW', (0, 0), (-1, 0), .7, ink), ('LINEBELOW', (0, 1), (-1, -1), .25, colors.HexColor('#dce3e9')), ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]))
            story.append(grid)
        story.extend([Spacer(1, 10), p('Rows: ' + str(len(section['rows'])) + ' | Complete selection; no silent truncation.', small)])
        if index != len(sections) - 1:
            story.append(PageBreak())
    doc.multiBuild(story, maxPasses=4)
    return output.getvalue()
