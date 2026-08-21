(function(){
'use strict';
const CONTACTS_KEY='roamadic_contacts_v2';
const VEHICLES_KEY='roamadic_vehicles_by_vin_v1';
const ATTACHMENTS_DB='roamadic_pending_attachments_v1';
const DEFAULT_CONTACTS=[
  {name:'Santiago',hourlyRate:100},
  {name:'Andy',hourlyRate:100},
  {name:'Friday Harbor Tile'}
];
function readJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback;}catch(e){return fallback;}}
function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){console.warn('Local backup failed',e);}}
function norm(value){return String(value||'').trim().toLowerCase();}
function mergeContacts(){
  const merged=new Map();
  DEFAULT_CONTACTS.concat(readJson(CONTACTS_KEY,[])).forEach(c=>{
    const key=norm(c.phone||c.name||c.customer); if(!key)return;
    merged.set(key,Object.assign({},merged.get(key)||{},c,{name:c.name||c.customer||''}));
  });
  return Array.from(merged.values());
}
function saveContact(contact){
  const list=mergeContacts(), key=norm(contact.phone||contact.name);
  const i=list.findIndex(c=>norm(c.phone||c.name)===key);
  if(i<0)list.push(contact);else list[i]=Object.assign({},list[i],contact);
  writeJson(CONTACTS_KEY,list);
}
function knownRate(name){const c=mergeContacts().find(x=>norm(x.name)===norm(name));return Number(c&&c.hourlyRate)||0;}

function setupHubContacts(){
  const listEl=document.getElementById('contacts-list');
  if(!listEl)return;
  function appendStandalone(filter){
    const q=norm(filter), existing=new Set(Array.from(listEl.querySelectorAll('.contact-name')).map(x=>norm(x.textContent)));
    const standalone=mergeContacts().filter(c=>(!q||norm(c.name).includes(q)||norm(c.phone).includes(q))&&!existing.has(norm(c.name)));
    standalone.reverse().forEach(c=>{
      const row=document.createElement('div'); row.className='contact-item'; row.dataset.standalone='1';
      row.innerHTML='<div class="contact-name"></div><div class="contact-sub"></div>';
      row.querySelector('.contact-name').textContent=c.name||'(no name)';
      row.querySelector('.contact-sub').textContent=[c.phone,c.hourlyRate?'$'+c.hourlyRate+'/hr':''].filter(Boolean).join(' · ');
      row.onclick=function(e){e.stopPropagation();
        ['f-customer','f-phone','f-address','f-vehicle','f-vin','f-plate','f-engine'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=c[id.replace('f-','')]||c[id==='f-customer'?'name':'']||'';});
        const amount=document.getElementById('f-amount');if(amount&&c.hourlyRate)amount.value=c.hourlyRate;
        if(typeof window.closeContacts==='function')window.closeContacts(); if(typeof window.switchTab==='function')window.switchTab('new');
      };
      listEl.prepend(row);
    });
  }
  const contactsBtn=document.getElementById('contacts-btn');
  const search=document.getElementById('contacts-modal-search');
  if(contactsBtn)contactsBtn.addEventListener('click',()=>setTimeout(()=>appendStandalone(search&&search.value),0));
  const quickSearch=document.getElementById('contacts-search');
  if(quickSearch)quickSearch.addEventListener('focus',()=>setTimeout(()=>appendStandalone(search&&search.value),0));
  if(search)search.addEventListener('input',()=>setTimeout(()=>appendStandalone(search.value),0));
  const createBtn=document.getElementById('create-btn');
  if(createBtn)createBtn.addEventListener('click',()=>saveContact({name:(document.getElementById('f-customer')||{}).value||'',phone:(document.getElementById('f-phone')||{}).value||'',address:(document.getElementById('f-address')||{}).value||'',vehicle:(document.getElementById('f-vehicle')||{}).value||'',vin:(document.getElementById('f-vin')||{}).value||'',plate:(document.getElementById('f-plate')||{}).value||'',engine:(document.getElementById('f-engine')||{}).value||'',hourlyRate:knownRate((document.getElementById('f-customer')||{}).value)}),true);
}

async function decodeVin(vin){
  vin=String(vin||'').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'');
  if(vin.length!==17)throw new Error('VIN must be 17 characters');
  const saved=readJson(VEHICLES_KEY,{})[vin]; if(saved)return saved;
  const url='https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/'+encodeURIComponent(vin)+'?format=json';
  const res=await fetch(url); if(!res.ok)throw new Error('VIN service unavailable');
  const r=(await res.json()).Results[0]||{};
  const liters=parseFloat(r.DisplacementL);
  const vehicle={vin,year:r.ModelYear||'',make:r.Make||'',model:r.Model||'',engine:[isNaN(liters)?'':(Math.round(liters*10)/10)+'L',r.EngineCylinders?r.EngineCylinders+' cyl':''].filter(Boolean).join(' ')};
  if(!vehicle.make&&!vehicle.model)throw new Error(r.ErrorText||'VIN not recognized');
  const store=readJson(VEHICLES_KEY,{});store[vin]=vehicle;writeJson(VEHICLES_KEY,store);return vehicle;
}
function setupHubVin(){
  const vin=document.getElementById('f-vin');if(!vin)return;
  let msg=document.getElementById('vin-status');if(!msg){msg=document.createElement('div');msg.id='vin-status';msg.style.cssText='font-size:11px;margin-top:4px;color:var(--muted)';vin.insertAdjacentElement('afterend',msg);}
  let timer;
  vin.addEventListener('input',()=>{clearTimeout(timer);vin.value=vin.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'').slice(0,17);if(vin.value.length===17)timer=setTimeout(run,350);});
  async function run(){msg.textContent='Decoding VIN…';try{const v=await decodeVin(vin.value);const vehicle=document.getElementById('f-vehicle'),engine=document.getElementById('f-engine');if(vehicle&&!vehicle.value)vehicle.value=[v.year,v.make,v.model].filter(Boolean).join(' ');if(engine&&!engine.value)engine.value=v.engine;msg.textContent='VIN decoded and vehicle saved.';msg.style.color='var(--ok)';}catch(e){msg.textContent=e.message;msg.style.color='var(--bad)';}}
}

function setupKnownLaborRate(){
  const name=document.getElementById('customerName');if(!name||!document.getElementById('services-body'))return;
  function apply(){const rate=knownRate(name.value);if(!rate)return;document.querySelectorAll('#services-body tr').forEach(tr=>{const input=tr.querySelector('.rate');if(input&&(!input.value||Number(input.value)===0)){input.value=rate;input.dispatchEvent(new Event('input',{bubbles:true}));}});}
  name.addEventListener('change',apply);name.addEventListener('blur',apply);setTimeout(apply,500);
}

function preparePrint(){
  document.querySelectorAll('select').forEach(el=>el.classList.toggle('rm-print-empty',!el.value||/^--\s*select\s*--$/i.test(el.value)));
  document.querySelectorAll('tr').forEach(row=>{const fields=Array.from(row.querySelectorAll('input,select,textarea'));if(fields.length)row.classList.toggle('rm-print-empty-row',fields.every(x=>!String(x.value||'').trim()||Number(x.value)===0));});
}
function setupPrintFixes(){
  const style=document.createElement('style');style.textContent='@media print{select{appearance:none!important;-webkit-appearance:none!important;background-image:none!important}.rm-print-empty{color:transparent!important;border-color:transparent!important}.rm-print-empty-row{display:none!important}input::placeholder,textarea::placeholder{color:transparent!important}}';document.head.appendChild(style);
  addEventListener('beforeprint',preparePrint);
}

function openAttachmentDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open(ATTACHMENTS_DB,1);req.onupgradeneeded=()=>req.result.createObjectStore('files',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function backupFiles(input){
  const files=Array.from(input.files||[]);if(!files.length)return;
  try{const db=await openAttachmentDb();const tx=db.transaction('files','readwrite');files.forEach(file=>{const reader=new FileReader();reader.onload=()=>tx.objectStore('files').put({id:location.pathname+'|'+file.name+'|'+file.lastModified,name:file.name,type:file.type,dataUrl:reader.result,createdAt:Date.now(),state:'pending'});reader.readAsDataURL(file);});}catch(e){showAttachmentMessage('Could not create a local attachment backup. Keep this page open and retry.','bad');}
}
function showAttachmentMessage(text,state){let el=document.getElementById('attachment-status');if(!el){el=document.createElement('div');el.id='attachment-status';el.className='no-print';el.style.cssText='font-size:12px;margin-top:8px';const grid=document.getElementById('attachments-grid');if(grid)grid.insertAdjacentElement('afterend',el);}if(el){el.textContent=text;el.style.color=state==='bad'?'var(--bad)':state==='ok'?'var(--ok)':'var(--warn)';}}
function setupAttachmentSafety(){
  document.querySelectorAll('input[type=file]').forEach(input=>input.addEventListener('change',()=>backupFiles(input),true));
  const originalFetch=window.fetch.bind(window);window.fetch=async function(){const args=arguments,url=String(args[0]||''),isSave=args[1]&&args[1].method==='POST'&&/script\.google\.com/.test(url);if(!isSave)return originalFetch.apply(null,args);let last;for(let attempt=1;attempt<=3;attempt++){try{const res=await originalFetch.apply(null,args);if(res.ok){showAttachmentMessage('Saved to Drive. Local attachment backup retained until this record is reopened.','ok');return res;}last=new Error('HTTP '+res.status);}catch(e){last=e;}showAttachmentMessage('Drive save failed; retrying ('+attempt+'/3)…','warn');await new Promise(r=>setTimeout(r,attempt*900));}showAttachmentMessage('Drive save failed after 3 attempts. Your attachments remain backed up on this device. Tap Save to retry.','bad');throw last;};
}

function setupBrakeChecklist(){
  if(!/\/brake-job\/?$/.test(location.pathname))return;
  const marker=Array.from(document.querySelectorAll('.section-title')).find(x=>/Labor \/ Services/i.test(x.textContent));if(!marker)return;
  const wrap=document.createElement('div');wrap.innerHTML='<div class="section-title">Brake Inspection Checklist</div><div class="grid-2"><div class="field"><label>Front pad thickness (mm)</label><input id="frontPadMm" type="number" min="0" step="0.1"></div><div class="field"><label>Rear pad/shoe thickness (mm)</label><input id="rearPadMm" type="number" min="0" step="0.1"></div><div class="field"><label>Front rotor diameter/thickness (mm)</label><input id="frontRotorMm"></div><div class="field"><label>Rear rotor/drum measurement (mm)</label><input id="rearRotorMm"></div></div><div class="checklist"><label><input type="checkbox"> Road test completed</label><label><input type="checkbox"> Brake fluid level/condition checked</label><label><input type="checkbox"> Hoses and hard lines inspected</label><label><input type="checkbox"> Calipers/wheel cylinders inspected</label><label><input type="checkbox"> Hardware and slide pins serviced</label><label><input type="checkbox"> Parking brake checked/adjusted</label><label><input type="checkbox"> Rotor/drum runout and surface checked</label><label><input type="checkbox"> ABS warning light checked</label><label><input type="checkbox"> Wheels torqued to specification</label><label><input type="checkbox"> Final road test completed</label></div><div class="grid-2"><div class="field"><label>Brake concern / symptoms</label><textarea id="brakeConcern"></textarea></div><div class="field"><label>Findings / recommendations</label><textarea id="brakeFindings"></textarea></div></div>';
  marker.parentNode.insertBefore(wrap,marker);
}

function setupDashboardImprovements(){
  const dash=document.getElementById('panel-dash'),tabs=document.querySelector('.tabs');
  if(!dash||!tabs)return;
  const style=document.createElement('style');
  style.textContent='.rm-command{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:14px}.rm-command input{width:100%;box-sizing:border-box}.rm-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.rm-quick button{font-size:11px;padding:9px 5px}.rm-attention{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:14px}.rm-attention>div{background:#fff;border:1px solid var(--line);border-left:4px solid var(--warn);border-radius:9px;padding:10px}.rm-attention b{display:block;font-size:19px}.rm-directory{display:grid;gap:8px}.rm-directory .contact-item{background:#fff;border:1px solid var(--line);border-radius:9px;padding:10px}.rm-health{font-size:12px;padding:9px 11px;border-radius:9px;background:#fff;border:1px solid var(--line);margin-bottom:12px}@media(max-width:520px){.rm-quick{grid-template-columns:repeat(2,1fr)}}';
  document.head.appendChild(style);
  const command=document.createElement('div');command.className='rm-command';command.innerHTML='<input id="rm-universal-search" placeholder="Search customers, phones, VINs, vehicles, invoices…"><div class="rm-quick"><button class="btn btn-ghost" data-rm-type="invoice">New Invoice</button><button class="btn btn-ghost" data-rm-type="estimate">New Estimate</button><button class="btn btn-ghost" data-rm-type="oilchange">Oil Change</button><button class="btn btn-ghost" data-rm-type="inspection">Inspection</button><button class="btn btn-ghost" data-rm-link="brake-job/">Brake Job</button><button class="btn btn-ghost" data-rm-view="contacts">Contacts</button></div>';
  dash.insertBefore(command,dash.firstChild);
  const attention=document.createElement('div');attention.id='rm-attention';attention.className='rm-attention';command.insertAdjacentElement('afterend',attention);
  const health=document.createElement('div');health.id='rm-sync-health';health.className='rm-health';health.textContent=navigator.onLine?'Online · Drive sync ready':'Offline · changes will stay on this device';attention.insertAdjacentElement('afterend',health);
  ['contacts','vehicles'].forEach(name=>{const b=document.createElement('button');b.className='tab';b.dataset.tab='rm-'+name;b.textContent=name[0].toUpperCase()+name.slice(1);tabs.appendChild(b);const p=document.createElement('div');p.className='panel';p.id='panel-rm-'+name;p.innerHTML='<div class="section-title">'+b.textContent+'</div><div class="rm-directory" id="rm-'+name+'-list"></div>';document.getElementById('panels').appendChild(p);b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x===p));renderDirectories();};});
  function newType(type){const newBtn=document.getElementById('dash-new-ticket-btn');if(newBtn)newBtn.click();setTimeout(()=>{const opt=document.querySelector('[data-type="'+type+'"]');if(opt)opt.click();},0);}
  command.addEventListener('click',e=>{const t=e.target.closest('[data-rm-type]'),l=e.target.closest('[data-rm-link]'),v=e.target.closest('[data-rm-view]');if(t)newType(t.dataset.rmType);if(l)location.href=l.dataset.rmLink;if(v){const tab=document.querySelector('[data-tab="rm-'+v.dataset.rmView+'"]');if(tab)tab.click();}});
  const search=command.querySelector('#rm-universal-search');search.addEventListener('input',()=>{const q=norm(search.value);document.querySelectorAll('#dash-open .ticket,#ticket-list .ticket,.owed-bar-collapsed,.owed-bar-expanded').forEach(card=>card.style.display=!q||norm(card.textContent).includes(q)?'':'none');});
  addEventListener('online',()=>health.textContent='Online · Drive sync ready');addEventListener('offline',()=>health.textContent='Offline · changes will stay on this device');
  document.addEventListener('click',e=>{const f=e.target.closest('[data-filter]');if(f)localStorage.setItem('roamadic_dashboard_filter',f.dataset.filter);});
  function renderDirectories(){
    const tickets=window.rmTickets||[], contacts=new Map();tickets.forEach(t=>{const key=norm(t.phone||t.customer);if(key)contacts.set(key,{name:t.customer,phone:t.phone,address:t.address,vehicle:t.vehicle,vin:t.vin});});mergeContacts().forEach(c=>contacts.set(norm(c.phone||c.name),c));
    const cList=document.getElementById('rm-contacts-list');if(cList)cList.innerHTML=Array.from(contacts.values()).sort((a,b)=>norm(a.name).localeCompare(norm(b.name))).map(c=>'<div class="contact-item"><b>'+escapeHtml(c.name||'(no name)')+'</b><div class="contact-sub">'+escapeHtml([c.phone,c.vehicle,c.hourlyRate?'$'+c.hourlyRate+'/hr':''].filter(Boolean).join(' · '))+'</div></div>').join('')||'<div class="empty">No contacts yet.</div>';
    const vehicles=readJson(VEHICLES_KEY,{});tickets.forEach(t=>{if(t.vin)vehicles[String(t.vin).toUpperCase()]=Object.assign({},vehicles[String(t.vin).toUpperCase()]||{},{vin:t.vin,vehicle:t.vehicle,mileage:t.mileage,customer:t.customer});});
    const vList=document.getElementById('rm-vehicles-list');if(vList)vList.innerHTML=Object.values(vehicles).map(v=>'<div class="contact-item"><b>'+escapeHtml(v.vehicle||[v.year,v.make,v.model].filter(Boolean).join(' ')||v.vin)+'</b><div class="contact-sub">'+escapeHtml([v.vin,v.mileage?v.mileage+' mi':'',v.customer].filter(Boolean).join(' · '))+'</div></div>').join('')||'<div class="empty">Vehicles appear after a VIN is entered.</div>';
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function refresh(e){const tickets=(e&&e.detail&&e.detail.tickets)||window.rmTickets||[],today=new Date().toDateString();const scheduled=tickets.filter(t=>t.scheduledAt&&new Date(t.scheduledAt).toDateString()===today).length, overdue=tickets.filter(t=>t.status==='open'&&t.scheduledAt&&new Date(t.scheduledAt)<new Date()&&new Date(t.scheduledAt).toDateString()!==today).length,drafts=Object.keys(localStorage).filter(k=>/form|draft/i.test(k)).length,failed=document.getElementById('attachment-status')&&/failed/i.test(document.getElementById('attachment-status').textContent)?1:0;attention.innerHTML='<div><b>'+scheduled+'</b>Scheduled today</div><div><b>'+overdue+'</b>Overdue</div><div><b>'+drafts+'</b>Local drafts</div><div><b>'+failed+'</b>Upload issues</div>';renderDirectories();const saved=localStorage.getItem('roamadic_dashboard_filter');if(saved){const f=document.querySelector('[data-filter="'+saved+'"]');if(f&&!document.querySelector('.filter.active'))f.click();}}
  addEventListener('rm:dashboard-rendered',refresh);setTimeout(()=>refresh(),800);
}

document.addEventListener('DOMContentLoaded',()=>{setupHubContacts();setupHubVin();setupKnownLaborRate();setupPrintFixes();setupAttachmentSafety();setupBrakeChecklist();setupDashboardImprovements();});
})();
