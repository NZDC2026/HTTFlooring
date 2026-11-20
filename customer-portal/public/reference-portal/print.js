/* Print a snapshot in its own frame: application privacy and browser widgets stay outside it. */
(function () {
  const printStyleUrl = new URL('./print.css', document.currentScript?.src || document.baseURI).href;
  function snapshot(source) {
    const paper = source.cloneNode(true);
    paper.querySelectorAll('.print-actions,.demo,button,script,.doclinks').forEach(node => node.remove());
    paper.querySelectorAll('select').forEach(select => select.replaceWith(select.ownerDocument.createTextNode(select.selectedOptions[0]?.textContent || '')));
    paper.querySelectorAll('input,textarea').forEach(input => input.replaceWith(input.ownerDocument.createTextNode(input.value || '')));
    paper.querySelectorAll('*').forEach(node => {
      for (const attr of [...node.attributes]) if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      if (node.tagName === 'A') { node.removeAttribute('href'); node.removeAttribute('target'); }
    });
    return paper.outerHTML;
  }
  function open(title) {
    const popup = window.open('', '_blank');
    if (!popup) return null;
    const outer = popup.document;
    outer.open();
    outer.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:white;font:13px system-ui}.print-toolbar{display:flex;align-items:center;gap:12px;padding:12px 18px;background:#f1efea}.print-toolbar span{margin-right:auto}button{padding:8px 12px;cursor:pointer}iframe{display:block;width:100%;border:0}@media print{.print-toolbar{display:none}}</style></head><body><p role="status">Preparing document…</p></body></html>');
    outer.close(); outer.title = title + ' · HTT Flooring';
    return {
      setDocument(source) {
        outer.body.innerHTML = '<div class="print-toolbar"><span>Choose “Save as PDF” in Destination. Turn off Headers and footers for a clean document.</span><button type="button" disabled>Print / Save PDF</button><button type="button">Close</button></div><iframe title="Printable document"></iframe>';
        const frame=outer.querySelector('iframe'), printWindow=frame.contentWindow, doc=printWindow.document;
        doc.open();doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body class="print-document"></body></html>');doc.close();
        doc.title=outer.title;doc.body.innerHTML=snapshot(source);
        const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => link.href);
        styles.push(printStyleUrl);
        const ready = styles.map(href => new Promise(resolve => {
          const link = doc.createElement('link'); link.rel = 'stylesheet'; link.href = href;
          const timer=setTimeout(()=>resolve(false),10000);
          link.onload = () => {clearTimeout(timer);resolve(true);};link.onerror = () => {clearTimeout(timer);resolve(false);};doc.head.append(link);
        }));
        const buttons = outer.querySelectorAll('.print-toolbar button');
        const print=()=>{printWindow.focus();printWindow.print();};
        buttons[0].onclick = print;buttons[1].onclick = () => popup.close();
        this.ready = Promise.all(ready).then(async loaded => {
          if (loaded.some((ok,index) => !ok && new URL(styles[index]).origin === location.origin)) throw new Error('Print styles could not load.');
          if (doc.fonts) await Promise.race([doc.fonts.ready,new Promise(resolve=>setTimeout(resolve,5000))]);
          await Promise.all([...doc.images].map(img => img.complete ? Promise.resolve() : new Promise(resolve => {const timer=setTimeout(resolve,5000);img.onload=img.onerror=()=>{clearTimeout(timer);resolve();};})));
          frame.style.height=Math.max(1100,doc.documentElement.scrollHeight)+'px';
          await new Promise(resolve => popup.requestAnimationFrame(() => popup.requestAnimationFrame(resolve)));
          // Chromium can open a blank preview if a newly written child frame has not committed its first paint.
          await new Promise(resolve => popup.setTimeout(resolve,300));
          buttons[0].disabled = false;
        });
        this.invokePrint=print;
      },
      async print() { await this.ready;if (!popup.closed) this.invokePrint(); },
      fail() { if (!popup.closed) outer.body.textContent = 'Unable to prepare this document. Close this tab and try again.'; }
    };
  }
  window.HTTPrint = {open, snapshot};
  window.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p' && document.querySelector('#app .doc')) {
      event.preventDefault();window.printDoc();
    }
  });
})();
