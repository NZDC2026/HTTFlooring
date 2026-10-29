"""Bounded stdin JSON -> stdout PDF. No network, HTML execution or input-controlled paths."""
import io
from datetime import date, timedelta
import json
import os
import sys
from decimal import Decimal
from pathlib import Path
from xml.sax.saxutils import escape
import reportlab
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether


def render_statement(data):
    lines = data['lines']
    if not isinstance(lines, list) or len(lines) > 1000 or len(data.get('openItems', [])) > 1000:
        raise ValueError('Statement exceeds bounded template')
    amount = lambda key: Decimal(str(data[key]))
    opening, closing = amount('opening'), amount('closing')
    debit = sum(Decimal(str(x['debit'])) for x in lines)
    credit = sum(Decimal(str(x['credit'])) for x in lines)
    if debit != amount('debits') or credit != amount('credits') or opening + debit - credit != closing or amount('difference') != 0 or data['status'] != 'RECONCILED':
        raise ValueError('Statement balances differ')
    running = opening
    for line in lines:
        running += Decimal(str(line['debit'])) - Decimal(str(line['credit']))
        if running != Decimal(str(line['balance'])):
            raise ValueError('Statement running balance differs')
    font_path = os.environ.get('HTT_PDF_FONT') or str(Path(reportlab.__file__).parent / 'fonts' / 'Vera.ttf')
    pdfmetrics.registerFont(TTFont('StatementFont', font_path))
    chars = pdfmetrics.getFont('StatementFont').face.charToGlyph
    def clean(value):
        value = '' if value is None else str(value)
        if any((ord(c) < 32 and c not in '\n\r\t') or (ord(c) >= 32 and ord(c) not in chars) for c in value):
            raise ValueError('Configured font does not support statement text')
        return escape(value).replace('\n', '<br/>')
    body = ParagraphStyle('statement_body', fontName='StatementFont', fontSize=9, leading=13, wordWrap='CJK', spaceAfter=4)
    small = ParagraphStyle('statement_small', parent=body, fontSize=7.5, leading=10, spaceAfter=2)
    right = ParagraphStyle('statement_right', parent=small, alignment=TA_RIGHT)
    title = ParagraphStyle('statement_title', parent=body, fontSize=21, leading=27, textColor=colors.HexColor('#16334c'), spaceAfter=12)
    p = lambda value, style=body: Paragraph(clean(value), style)
    money = lambda value: f'{Decimal(str(value)):,.2f}'
    output = io.BytesIO()
    doc = SimpleDocTemplate(output, pagesize=A4, leftMargin=42, rightMargin=42, topMargin=42, bottomMargin=48,
                            title='Customer statement '+data['number'], author=data['issuer']['name'], invariant=1)
    story = [p('CUSTOMER STATEMENT', title), p(data['issuer']['name']), p('ABN: '+str(data['issuer'].get('abn') or 'Not provided'), small), Spacer(1, 10)]
    header = Table([[[p('CUSTOMER', small), p(data['party']['legalName'])],
                     [p(data['number'], small), p('Period: '+data['from']+' to '+(date.fromisoformat(data['to'])-timedelta(days=1)).isoformat(), small), p('Currency: AUD | Posting-date basis', small)]]], colWidths=[260, 251])
    header.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),12)]))
    story.append(header)
    rows = [[p(x, small) for x in ['Date', 'Document / activity', 'Debit AUD', 'Credit AUD', 'Balance AUD']],
            ['', p('Opening balance', small), '', '', p(money(opening), right)]]
    for line in lines:
        rows.append([p(line['date'], small), p(str(line.get('number') or line['documentId'])+'\n'+line['type'], small),
                     p(money(line['debit']), right), p(money(line['credit']), right), p(money(line['balance']), right)])
    rows.append(['', p('Closing balance', small), p(money(debit), right), p(money(credit), right), p(money(closing), right)])
    grid = Table(rows, colWidths=[58,231,73,73,76], repeatRows=1, hAlign='LEFT')
    grid.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e9eff4')),
        ('LINEBELOW',(0,0),(-1,0),.7,colors.HexColor('#8ba2b4')),('LINEBELOW',(0,1),(-1,-1),.25,colors.HexColor('#dce3e9')),
        ('LINEABOVE',(0,-1),(-1,-1),.8,colors.HexColor('#16334c')),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    story.extend([grid, Spacer(1, 14)])
    story.append(KeepTogether([p('Account balance: AUD '+money(closing)),
        p('Advance balance (shown separately, not deducted again): AUD '+money(data['advanceBalance']), small),
        p('This statement is not a tax invoice. Negative balances are account credits. Credits are already included in the account balance.', small)]))
    if data.get('openItems'):
        story.extend([Spacer(1,14),p('Open invoice balances at period end')])
        items=[[p('Document',small),p('Due date',small),p('Balance AUD',small)]]
        for item in data['openItems']:
            items.append([p(item['number'],small),p(item['dueOn'],small),p(money(item['balance']),right)])
        grid=Table(items,colWidths=[330,90,91],repeatRows=1)
        grid.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e9eff4')),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
        story.append(grid)
    def footer(canvas, document):
        canvas.saveState(); canvas.setFont('StatementFont',7); canvas.setFillColor(colors.HexColor('#536779'))
        canvas.drawString(42,27,data['number']+' | AUD'); canvas.drawRightString(A4[0]-42,27,'Page '+str(document.page)); canvas.restoreState()
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return output.getvalue()


def render(data):
    if data.get('templateVersion') == 2:
        return render_statement(data)
    if data.get('templateVersion') != 1 or not 1 <= len(data['lines']) <= 50:
        raise ValueError('Unsupported document template/line count')
    font_path = os.environ.get('HTT_PDF_FONT') or str(Path(reportlab.__file__).parent / 'fonts' / 'Vera.ttf')
    pdfmetrics.registerFont(TTFont('DocumentFont', font_path))
    pdfmetrics.registerFontFamily('DocumentFont',normal='DocumentFont',bold='DocumentFont',italic='DocumentFont',boldItalic='DocumentFont')
    chars = pdfmetrics.getFont('DocumentFont').face.charToGlyph
    def text(value):
        value = '' if value is None else str(value)
        if any((ord(c) < 32 and c not in '\n\r\t') or (ord(c) >= 32 and ord(c) not in chars) for c in value):
            raise ValueError('Configured font does not support document text')
        return escape(value).replace('\n','<br/>')
    body=ParagraphStyle('body',fontName='DocumentFont',fontSize=9,leading=13,wordWrap='CJK',spaceAfter=3,textColor=colors.HexColor('#243447'))
    small=ParagraphStyle('small',parent=body,fontSize=8,leading=11)
    right=ParagraphStyle('right',parent=small,alignment=TA_RIGHT)
    heading=ParagraphStyle('heading',parent=body,fontSize=23,leading=29,spaceAfter=12,textColor=colors.HexColor('#16334c'))
    label=ParagraphStyle('label',parent=small,fontSize=8,leading=12,textColor=colors.HexColor('#536779'))
    def p(value,style=body):return Paragraph(text(value),style)
    def money(value):return f'{Decimal(str(value)):,.2f}'
    def number(value):return format(Decimal(str(value)),'f').rstrip('0').rstrip('.') if '.' in str(value) else str(value)
    lines=data['lines']
    for field in ('net','tax','gross'):
        if sum(Decimal(str(l[field])) for l in lines) != Decimal(str(data[field])):
            raise ValueError('Snapshot totals differ from lines')
    if Decimal(str(data['net']))+Decimal(str(data['tax'])) != Decimal(str(data['gross'])):
        raise ValueError('Snapshot gross differs from net plus GST')
    issuer=data['issuer'];party=data['party']
    if data['title']=='TAX INVOICE' and (not issuer.get('gstRegistered') or not issuer.get('abn') or not party.get('legalName')):
        raise ValueError('Tax invoice identity/registration is incomplete')
    output=io.BytesIO()
    doc=SimpleDocTemplate(output,pagesize=A4,rightMargin=42,leftMargin=42,topMargin=43,bottomMargin=48,
                         title=f"{data['title']} {data['number']}",author=issuer.get('name','HTT'),invariant=1)
    story=[p(data['title'],heading),p(issuer.get('name','')),p('ABN: '+str(issuer.get('abn') or 'Not registered'),small),Spacer(1,12)]
    address='\n'.join(str(party[k]) for k in ('legalName','branchName','addressLine1','suburb','state','postcode','country') if party.get(k))
    left=[p('SUPPLIER' if data['title']=='PURCHASE ORDER' else 'CUSTOMER',label),p(address)]
    if party.get('abn'):left.append(p('ABN: '+str(party['abn']),small))
    meta=[p('Number: '+data['number']),p('Issue date: '+data['businessDate']),p('Version: '+str(data['sourceVersion']),small)]
    if data.get('term'):meta.append(p(data['termLabel']+': '+data['term']))
    block=Table([[left,meta]],colWidths=[310,201]);block.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),12)]));story.append(block)
    header=[p(x,small) for x in ['Item','Qty','Unit','Unit price','Net (AUD)','GST (AUD)']]
    table=[header]
    for l in lines:
        s=l['snapshot'];item=str(s.get('name') or '')+'\nSKU: '+str(s.get('sku') or '')
        if s.get('baseQuantity') is not None and Decimal(str(s['baseQuantity']))!=Decimal(str(l['quantity'])):
            item+='\nBase quantity: '+number(s['baseQuantity'])
        if s.get('discountPercent') and Decimal(str(s['discountPercent']))!=0:item+='\nDiscount: '+number(s['discountPercent'])+'%'
        price=number(l['unitPrice'])+'\n'+('incl GST' if s.get('inclusive') else 'ex GST')
        tax=money(l['tax'])+'\n'+number(Decimal(str(l['taxRate']))*100)+'%'
        table.append([p(item,small),p(number(l['quantity']),right),p(s.get('unitCode',''),small),p(price,right),p(money(l['net']),right),p(tax,right)])
    grid=Table(table,colWidths=[230,38,34,73,68,68],repeatRows=1,hAlign='LEFT')
    grid.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e9eff4')),
        ('LINEBELOW',(0,0),(-1,0),.7,colors.HexColor('#8ba2b4')),('LINEBELOW',(0,1),(-1,-1),.25,colors.HexColor('#dce3e9')),
        ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    story.extend([grid,Spacer(1,14)])
    totals=Table([[p('Subtotal (AUD)',small),p(money(data['net']),right)],
                  [p('GST (AUD)',small),p(money(data['tax']),right)],
                  [p('TOTAL (AUD)'),p(money(data['gross']),right)]],colWidths=[155,105],hAlign='RIGHT')
    totals.setStyle(TableStyle([('LINEABOVE',(0,2),(-1,2),1,colors.HexColor('#16334c')),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story.append(KeepTogether([totals]))
    if data.get('notes'):story.extend([Spacer(1,14),p('Notes',label),p(data['notes'],small)])
    def footer(canvas,document):
        canvas.saveState();canvas.setFont('DocumentFont',8);canvas.setFillColor(colors.HexColor('#536779'))
        canvas.drawString(42,27,f"{data['number']} | AUD | Version {data['sourceVersion']}")
        canvas.drawRightString(A4[0]-42,27,f'Page {document.page}');canvas.restoreState()
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return output.getvalue()


if __name__=='__main__':
    try:
        raw=sys.stdin.buffer.read(512*1024+1)
        if len(raw)>512*1024:raise ValueError('Input too large')
        sys.stdout.buffer.write(render(json.loads(raw)))
    except Exception:
        # No customer data, filesystem paths or raw traceback in persisted job errors.
        sys.stderr.write('PDF rendering failed: check template data, installed renderer and font coverage.\n')
        sys.exit(2)
