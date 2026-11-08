// ODPREMA / SLOVENIJA – strani vedno najprej z interneta (nova različica takoj),
// kopija v telefonu samo, ko ni signala.
const C='odprema-v8';
const SHELL=['./','./index.html','./slovenija.html','./manifest.webmanifest','./manifest-slovenija.webmanifest','./icon-192.png','./icon-512.png','./icon-s-192.png','./icon-s-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
function fresh(u){return fetch(u.origin+u.pathname+'?_='+Date.now(),{cache:'no-store'})}
function withTimeout(p,ms){return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('timeout')),ms);p.then(v=>{clearTimeout(t);res(v)},e=>{clearTimeout(t);rej(e)})})}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // Firebase knjižnice: iz kopije (ne spreminjajo se)
  if(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')){
    e.respondWith(caches.open(C).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}))));return}
  if(u.origin!==location.origin)return;
  const page=r.mode==='navigate'||/\.html$|\/$|\.webmanifest$/.test(u.pathname);
  if(page){
    // strani: najprej internet (do 6 s), sicer kopija
    e.respondWith(caches.open(C).then(c=>withTimeout(fresh(u),6000).then(res=>{if(res&&res.ok){c.put(r,res.clone());return res}throw new Error('bad')})
      .catch(()=>c.match(r,{ignoreSearch:true}).then(m=>m||c.match('./index.html')).then(m=>m||fetch(r)))));
    return}
  // ikone, manifest: kopija takoj, v ozadju osveži
  e.respondWith(caches.open(C).then(c=>c.match(r,{ignoreSearch:true}).then(m=>{
    const net=fresh(u).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>m);
    return m||net})));
});
