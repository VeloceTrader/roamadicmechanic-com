(function () {
  'use strict';

  const css = document.createElement('style');
  css.textContent = `
    :root{--rm-bg:#f4f6f8;--rm-card:#fff;--rm-blue:#16364d;--rm-blue2:#214d69;--rm-gold:#c99a3e;--rm-red:#b14a3b;--rm-green:#2e7d5a;--rm-shadow:0 8px 28px rgba(18,40,59,.08)}
    body.rm-modern{padding:0;background:var(--rm-bg);min-height:100vh}
    .rm-modern .wrap{max-width:none;margin:0;min-height:100vh;padding-left:248px}
    .rm-modern .header{height:76px;margin:0;padding:14px 28px;background:#fff;border-bottom:1px solid #e3e7ea;display:flex;align-items:center;text-align:left;gap:12px;position:sticky;top:0;z-index:20}
    .rm-modern .header img{width:46px;height:46px}.rm-modern .header h1{font-size:17px;margin:0}.rm-modern .header p{margin:2px 0 0}.rm-modern .header>img,.rm-modern .header>h1,.rm-modern .header>p{display:none}
    .rm-topbar-copy{display:flex;flex-direction:column}.rm-topbar-copy b{font-size:18px;color:var(--rm-blue)}.rm-topbar-copy span{font-size:12px;color:var(--muted);margin-top:2px}
    .rm-sidebar{position:fixed;inset:0 auto 0 0;width:248px;background:linear-gradient(180deg,var(--rm-blue),#102a3d);color:#fff;padding:24px 16px;z-index:30;display:flex;flex-direction:column}
    .rm-brand{display:flex;align-items:center;gap:11px;padding:0 8px 24px;border-bottom:1px solid rgba(255,255,255,.12)}.rm-brand img{width:46px;height:46px}.rm-brand b{font-size:15px;letter-spacing:.04em}.rm-brand small{display:block;color:#b9c8d2;margin-top:2px}
    .rm-modern .tabs{margin:22px 0 0;padding:0;background:transparent;border:0;display:flex;flex-direction:column;gap:5px}
    .rm-modern .tab{flex:none;text-align:left;color:#c8d4dc;padding:12px 14px;border-radius:9px;font-size:13px}.rm-modern .tab.active{background:rgba(255,255,255,.14);color:#fff}.rm-modern .tab:hover{background:rgba(255,255,255,.08)}
    .rm-sidebar-foot{margin-top:auto;padding:14px 10px;color:#9fb2be;font-size:11px;line-height:1.5}
    .rm-modern #panels{padding:24px 28px 56px;max-width:1480px;margin:0 auto}.rm-modern .panel{animation:rmFade .18s ease}@keyframes rmFade{from{opacity:.55;transform:translateY(3px)}}
    .rm-dash-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}.rm-dash-head h2{margin:0;color:var(--rm-blue);font-size:25px}.rm-dash-head p{margin:4px 0 0;color:var(--muted);font-size:13px}.rm-dash-head .btn{width:auto;min-width:150px}
    .rm-modern .rm-command{border:0;box-shadow:var(--rm-shadow);padding:14px;border-radius:14px;margin-bottom:18px}.rm-modern .rm-command input{border:1px solid #dfe5e8;border-radius:10px;padding:13px 15px;background:#f8fafb;font-size:14px}.rm-modern .rm-quick{grid-template-columns:repeat(6,minmax(90px,1fr));gap:8px}.rm-modern .rm-quick button{min-height:42px}
    .rm-modern .stats{grid-template-columns:repeat(4,minmax(135px,1fr));gap:12px;margin:0 0 18px}.rm-modern .stat{border:0;box-shadow:var(--rm-shadow);border-radius:14px;padding:17px 18px}.rm-modern .stat .n{font-size:27px}.rm-modern .stat:nth-child(2){border-left:4px solid var(--rm-gold)}.rm-modern .stat:nth-child(3){border-left:4px solid var(--rm-red)}
    .rm-work-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(290px,.8fr);gap:18px;align-items:start}.rm-card-section{background:#fff;border-radius:15px;box-shadow:var(--rm-shadow);padding:17px}.rm-section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.rm-section-head h3{margin:0;color:var(--rm-blue);font-size:16px}.rm-section-head span{color:var(--muted);font-size:11px}
    .rm-modern #dash-open .ticket{box-shadow:none;border-color:#e4e8eb;margin-bottom:9px}.rm-modern #dash-open .ticket:last-child{margin-bottom:0}.rm-modern .t-body{padding:14px 16px}.rm-modern .t-num{font-size:13px}.rm-modern .t-cust{font-size:15px}.rm-modern .t-controls .btn{min-height:38px}
    .rm-modern .rm-attention{grid-template-columns:1fr;gap:9px;margin:0}.rm-modern .rm-attention>div{box-shadow:none;background:#fff5ef;border:0;border-left:4px solid var(--warn);padding:13px}.rm-modern .rm-attention b{font-size:23px;color:var(--rm-blue)}
    .rm-modern .rm-health{margin:12px 0 0;border:0;background:#edf7f1;color:var(--rm-green);font-weight:700}
    .rm-recent-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.rm-recent-list{display:grid;gap:8px}.rm-recent-row{display:flex;align-items:center;gap:11px;padding:10px;border:1px solid #e7eaec;border-radius:10px}.rm-avatar{width:34px;height:34px;border-radius:50%;background:#e9eff3;color:var(--rm-blue);display:grid;place-items:center;font-weight:800;font-size:12px;flex:none}.rm-recent-row b{font-size:13px}.rm-recent-row small{display:block;color:var(--muted);margin-top:2px}.rm-recent-row .rm-arrow{margin-left:auto;color:#9aa7ae}
    .rm-modern #dash-search{display:none}.rm-modern #panel-dash>.section-title{display:none}.rm-modern #dash-new-ticket-btn{display:none}.rm-modern #rm-sync-health{font-size:11px}.rm-modern .form{border:0;box-shadow:var(--rm-shadow);border-radius:15px;max-width:900px}.rm-modern #panel-tickets>.field{max-width:680px}.rm-modern #ticket-list{max-width:980px}
    .rm-modern .rm-signout{position:fixed;right:26px;top:20px;z-index:45}.rm-modern #rm-register-passkey{width:auto!important;position:fixed;right:116px;top:12px;z-index:44;margin:0!important}
    @media(max-width:1050px){.rm-modern .rm-quick{grid-template-columns:repeat(3,1fr)}.rm-work-grid{grid-template-columns:1fr}.rm-modern .rm-attention{grid-template-columns:repeat(4,1fr)}.rm-modern .stats{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:760px){body.rm-modern{padding-bottom:72px}.rm-modern .wrap{padding-left:0}.rm-sidebar{inset:auto 0 0 0;width:auto;height:68px;padding:6px 8px;background:var(--rm-blue);display:block}.rm-brand,.rm-sidebar-foot{display:none}.rm-modern .tabs{margin:0;display:flex;flex-direction:row;gap:2px;height:56px}.rm-modern .tab{text-align:center;display:grid;place-items:center;padding:7px 5px;font-size:10.5px;border-radius:9px}.rm-modern .header{height:64px;padding:10px 14px}.rm-topbar-copy b{font-size:16px}.rm-modern #panels{padding:14px 12px 30px}.rm-dash-head{align-items:flex-start}.rm-dash-head h2{font-size:21px}.rm-dash-head .btn{min-width:0;padding:10px 12px}.rm-modern .rm-command{padding:11px;margin-bottom:13px}.rm-modern .rm-quick{display:flex;overflow-x:auto}.rm-modern .rm-quick button{min-width:104px}.rm-modern .stats{grid-template-columns:1fr 1fr;gap:8px}.rm-modern .stat{padding:13px}.rm-modern .stat .n{font-size:22px}.rm-card-section{padding:13px;border-radius:12px}.rm-modern .rm-attention{grid-template-columns:1fr 1fr}.rm-recent-grid{grid-template-columns:1fr;gap:12px}.rm-modern .rm-signout{right:10px;top:14px;padding:7px 9px}.rm-modern #rm-register-passkey{position:static;width:100%!important;margin-top:8px!important}.rm-modern .header{padding-right:78px}.rm-modern .t-top,.rm-modern .t-row{align-items:flex-start}.rm-modern .t-controls{width:100%;display:grid;grid-template-columns:repeat(2,1fr)}.rm-modern .t-controls .btn{width:100%}}
  `;
  document.head.appendChild(css);

  function initials(name) { return String(name || '?').split(/\s+/).slice(0,2).map(function (x) { return x[0] || ''; }).join('').toUpperCase(); }
  function safe(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function recentRows(items, kind) {
    return items.slice(0,5).map(function (t) {
      const title = kind === 'customer' ? t.customer : t.vehicle;
      const sub = kind === 'customer' ? [t.phone,t.vehicle].filter(Boolean).join(' · ') : [t.customer,t.number].filter(Boolean).join(' · ');
      return '<div class="rm-recent-row"><span class="rm-avatar">'+safe(initials(title))+'</span><span><b>'+safe(title || 'Unknown')+'</b><small>'+safe(sub)+'</small></span><span class="rm-arrow">›</span></div>';
    }).join('') || '<div class="empty">No recent records yet.</div>';
  }
  function renderRecent() {
    const tickets = (window.rmTickets || []).slice().reverse();
    const customers = [], vehicles = [], seenC = new Set(), seenV = new Set();
    tickets.forEach(function (t) { const c=(t.customer||'').toLowerCase(),v=(t.vehicle||'').toLowerCase(); if(c&&!seenC.has(c)){seenC.add(c);customers.push(t)} if(v&&!seenV.has(v)){seenV.add(v);vehicles.push(t)} });
    const c = document.getElementById('rm-recent-customers'); if(c) c.innerHTML = recentRows(customers,'customer');
    const v = document.getElementById('rm-recent-vehicles'); if(v) v.innerHTML = recentRows(vehicles,'vehicle');
    const count = document.getElementById('rm-today-count'); if(count) count.textContent = (window.rmTickets||[]).filter(function(t){return t.status==='open'}).length+' active';
  }
  function build() {
    document.body.classList.add('rm-modern');
    const wrap = document.querySelector('.wrap'), header = document.querySelector('.header'), tabs = document.querySelector('.tabs'), dash = document.getElementById('panel-dash');
    if(!wrap||!header||!tabs||!dash||document.querySelector('.rm-sidebar')) return;
    const sidebar=document.createElement('aside'); sidebar.className='rm-sidebar'; sidebar.innerHTML='<div class="rm-brand"><img src="icons/hub/icon-192.png" alt=""><span><b>ROAMADIC MECHANIC</b><small>Shop Operations</small></span></div><div class="rm-sidebar-foot">Secure shop workspace<br>Supabase protected</div>';
    sidebar.insertBefore(tabs,sidebar.querySelector('.rm-sidebar-foot')); document.body.appendChild(sidebar);
    header.innerHTML='<div class="rm-topbar-copy"><b>Shop Command Center</b><span id="rm-current-date"></span></div>';
    document.getElementById('rm-current-date').textContent=new Date().toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'});
    const command=dash.querySelector('.rm-command'), attention=document.getElementById('rm-attention'), health=document.getElementById('rm-sync-health'), stats=document.getElementById('stats'), jobs=document.getElementById('dash-open'), newBtn=document.getElementById('dash-new-ticket-btn');
    const head=document.createElement('div'); head.className='rm-dash-head'; head.innerHTML='<div><h2>Today’s Shop</h2><p>Jobs, customers, vehicles, and money that need your attention.</p></div><button class="btn btn-primary" id="rm-new-job">+ New Job</button>'; dash.insertBefore(head,dash.firstChild); head.querySelector('#rm-new-job').onclick=function(){newBtn.click()};
    const grid=document.createElement('div'); grid.className='rm-work-grid'; grid.innerHTML='<section class="rm-card-section"><div class="rm-section-head"><h3>Today’s Jobs</h3><span id="rm-today-count"></span></div><div id="rm-jobs-slot"></div></section><aside class="rm-card-section"><div class="rm-section-head"><h3>Needs Attention</h3><span>Act next</span></div><div id="rm-attention-slot"></div></aside>';
    const recent=document.createElement('div'); recent.className='rm-recent-grid'; recent.innerHTML='<section class="rm-card-section"><div class="rm-section-head"><h3>Recent Customers</h3><span>Latest activity</span></div><div class="rm-recent-list" id="rm-recent-customers"></div></section><section class="rm-card-section"><div class="rm-section-head"><h3>Recent Vehicles</h3><span>Service history</span></div><div class="rm-recent-list" id="rm-recent-vehicles"></div></section>';
    if(command) dash.insertBefore(command,head.nextSibling); if(stats) dash.insertBefore(stats,command?command.nextSibling:head.nextSibling); dash.appendChild(grid); dash.appendChild(recent);
    grid.querySelector('#rm-jobs-slot').appendChild(jobs); const attSlot=grid.querySelector('#rm-attention-slot'); if(attention)attSlot.appendChild(attention); if(health)attSlot.appendChild(health);
    renderRecent();
  }
  document.addEventListener('DOMContentLoaded', function(){setTimeout(build,0);});
  window.addEventListener('rm:dashboard-rendered', renderRecent);
})();

