// ETI Odprema – aplikacija se odpre takoj (tudi brez interneta), nova različica pride samodejno
const C='odprema-v5';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')){
    e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}))));return}
  if(u.origin!==location.origin)return;
  e.respondWith(caches.open(C).then(c=>c.match(r,{ignoreSearch:true}).then(m=>{
    // vedno preveri strežnik mimo predpomnilnika brskalnika
    const net=fetch(u.origin+u.pathname+'?_='+Date.now(),{cache:'no-store'}).then(res=>{if(res&&res.ok){
        if(m&&r.mode==='navigate')Promise.all([m.clone().text(),res.clone().text()]).then(([a,b])=>{if(a!==b)self.clients.matchAll().then(cl=>cl.forEach(x=>x.postMessage('updated')))});
        c.put(r,res.clone())}return res}).catch(()=>m);
    return m||net})));
});
