/* eslint-disable no-unused-vars -- portalLogout is used by the header HTML. */
/* Local business preview only. No account, order, notification, or payment API is called. */
function portalLogout() {
  if (window.parent !== window) window.parent.postMessage({type:'htt-reference:logout'},location.origin);
}
(function () {
  const notifyRoute=()=>{
    if(window.parent!==window)window.parent.postMessage({type:'htt-reference:route',route:location.hash.slice(1)||'/dashboard'},location.origin);
  };
  window.addEventListener('hashchange',notifyRoute);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='htt-reference:navigate')return;
    const route=event.data.route;
    if(typeof route!=='string'||!/^\/[a-z0-9][a-z0-9\-/?=&%+_.]*$/i.test(route))return;
    if(location.hash.slice(1)!==route)location.replace('#'+route);
  });
  // Match the prototype's local workflows while making notification results truthful.
  sendReset=async()=>toast('Local preview: no password reset email has been sent.');
  saveTempPw=async()=>toast('Local preview: authentication credentials have not been changed.');
  const originalToast=toast;
  toast=function(message){
    if(/email sent|invitation sent|invite sent|notified|submitted|access updated|user disabled|user enabled/i.test(message))message='Local preview (no server update or email): '+message.replace(/email sent|invitation sent|invite sent/ig,'request saved (no email sent)').replace(/HTT has been notified|HTT notified/ig,'saved locally; no notification sent').replace(/submitted for review/ig,'saved locally for review');
    originalToast(message);
  };
  // The isolated frame owns scrolling, including browser find and in-page account anchors.
  notifyRoute();
})();

const localAddressRequests=[];

// Keep preview changes separate from the API portal and the previous local ledger.
(function(){
  const key=referenceStorageKey('state');
  const arrays={quotes:QUOTES,orders:ORDERS,invoices:INVOICES,credits:CREDITS,boards:BOARDS,requests:BOARD_REQS,stands:STAND_HIST};
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    if(saved?.version===1){
      if(Array.isArray(saved.addressRequests))localAddressRequests.push(...saved.addressRequests);
      for(const [name,items] of Object.entries(arrays)){
        if(Array.isArray(saved[name]))items.splice(0,items.length,...saved[name]);
      }
      if(Array.isArray(saved.pendingContacts))MOCK_CONTACTS.pendingRequests=saved.pendingContacts;
      if(Array.isArray(saved.users)&&saved.users.some(user=>user.userId===MOCK_USERS.currentUserId))MOCK_USERS.users=saved.users;
      if(saved.addresses?.delivery?.length&&saved.addresses.billing)MOCK_SUMMARY.addresses=saved.addresses;
      recalcInvoices();
    }
  }catch{/* A corrupt preview snapshot must not prevent the reference fixtures from loading. */}
  function persist(){
    try{
      const values=Object.fromEntries(Object.entries(arrays).map(([name,items])=>[name,[...items,...(_HID.get(items)||[])]]));
      localStorage.setItem(key,JSON.stringify({version:1,...values,addressRequests:localAddressRequests,pendingContacts:MOCK_CONTACTS.pendingRequests,users:MOCK_USERS.users,addresses:MOCK_SUMMARY.addresses}));
    }catch{/* The preview remains usable if storage is full or disabled. */}
  }
  const originalRender=render;
  render=async function(){await originalRender();paintAddressRequests();paintLocalWorkflowNotices();persist();};
  window.addEventListener('pagehide',persist);
  window.addEventListener('hashchange',persist);
  window.addEventListener('htt-reference:changed',persist);
  render();
})();

function submitAddressRequest(form){
  if(!form.reportValidity())return;
  const fields=Object.fromEntries([...new FormData(form)].map(([key,value])=>[key,String(value).trim()]));
  for(const key of ['label','line1','suburb','postcode'])if(!String(fields[key]||'').trim()){toast('Complete the required address fields.');return;}
  localAddressRequests.push({id:crypto.randomUUID(),...fields,status:'Pending local review',createdAt:new Date().toISOString()});
  closeModal();window.dispatchEvent(new Event('htt-reference:changed'));
  toast('Address request saved locally. No request has been sent to HTT.');render();
}
function paintAddressRequests(){
  const section=document.getElementById('sec-stores');if(!section||!localAddressRequests.length)return;
  section.querySelector('.local-address-requests')?.remove();
  section.insertAdjacentHTML('beforeend',`<div class="local-address-requests leave"><b>Saved locally · awaiting submission</b>${localAddressRequests.map(request=>`<p>${esc(request.label)} — ${esc(request.line1)}, ${esc(request.suburb)} ${esc(request.postcode)} · ${esc(request.status)}</p>`).join('')}</div>`);
}
(function(){
  if(new URLSearchParams(location.search).get('businessPreview')==='api'){
    document.body.classList.add('business-preview-api');
    const marker=document.createElement('aside');marker.className='business-preview-marker';marker.setAttribute('role','note');marker.textContent='Sample business data · business APIs not connected';document.body.append(marker);
  }
  const modal=document.getElementById('modal');let lastDialog=null,returnFocus=null,wasOpen=false;
  new MutationObserver(()=>{
    const open=modal.style.display==='flex'&&modal.firstElementChild;
    if(open&&(!wasOpen||lastDialog!==modal.firstElementChild)){
      returnFocus=document.activeElement;lastDialog=modal.firstElementChild;
      lastDialog.setAttribute('role','dialog');lastDialog.setAttribute('aria-modal','true');
      const title=lastDialog.querySelector('h1,h2,h3,.serif');if(title){title.id='reference-dialog-title';lastDialog.setAttribute('aria-labelledby',title.id);}
      const input=lastDialog.querySelector('input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea,button:not(:disabled)');
      if(input)input.focus({preventScroll:true});else{lastDialog.tabIndex=-1;lastDialog.focus({preventScroll:true});}
    }else if(!open&&wasOpen&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
    wasOpen=!!open;
  }).observe(modal,{childList:true,attributes:true,attributeFilter:['style']});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(modal.style.display==='flex'){closeModal();event.preventDefault();}
      else if(document.querySelector('#dp.open')){closeDP();document.querySelector('.dptrigger')?.focus();event.preventDefault();}
    }
    if(event.key!=='Tab'||modal.style.display!=='flex')return;
    const fields=[...modal.querySelectorAll('button,input:not([type=hidden]),select,textarea,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
    const first=fields[0],last=fields.at(-1);if(!first){event.preventDefault();return;}
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  });
})();

function paintLocalWorkflowNotices(){
  const app=document.getElementById('app');if(!app)return;
  const walker=document.createTreeWalker(app,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
    node.nodeValue=node.nodeValue.replace(/HTT has been notified|HTT notified/g,'Saved locally · no notification sent').replace(/notifies HTT/g,'saves locally (no notification sent)').replace(/Sent to HTT's system with your (quote|order)\./g,'Saved locally with your $1. No request is sent to HTT.');
  }
}
new MutationObserver(()=>{paintAddressRequests();paintLocalWorkflowNotices();}).observe(document.getElementById('app'),{childList:true});

function containWideTables(){
  document.querySelectorAll('#app table').forEach(table=>{
    if(table.parentElement?.classList.contains('responsive-table-viewport'))return;
    const viewport=document.createElement('div');viewport.className='responsive-table-viewport';
    table.before(viewport);viewport.append(table);
  });
}
new MutationObserver(containWideTables).observe(document.getElementById('app'),{childList:true});
containWideTables();
