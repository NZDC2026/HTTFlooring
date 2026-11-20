/* eslint-disable no-unused-vars -- portalLogout is used by the header HTML. */
/* Local mock preview only. No account, order, notification, or payment API is called. */
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
    if(/email sent|invitation sent|invite sent|notified|submitted|access updated|user disabled|user enabled/i.test(message))message='Local preview (no server update or email): '+message.replace(/email sent|invitation sent/ig,'request saved (no email sent)').replace(/HTT notified/ig,'saved locally').replace(/submitted for review/ig,'saved locally for review');
    originalToast(message);
  };
  // The isolated frame owns scrolling, including browser find and in-page account anchors.
  notifyRoute();
})();

// Keep preview changes separate from the API portal and the previous local ledger.
(function(){
  const key='htt.reference.state.v1';
  const arrays={quotes:QUOTES,orders:ORDERS,invoices:INVOICES,credits:CREDITS,boards:BOARDS,requests:BOARD_REQS,stands:STAND_HIST};
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    if(saved?.version===1){
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
      localStorage.setItem(key,JSON.stringify({version:1,...values,pendingContacts:MOCK_CONTACTS.pendingRequests,users:MOCK_USERS.users,addresses:MOCK_SUMMARY.addresses}));
    }catch{/* The preview remains usable if storage is full or disabled. */}
  }
  const originalRender=render;
  render=async function(){await originalRender();persist();};
  window.addEventListener('pagehide',persist);
  render();
})();
