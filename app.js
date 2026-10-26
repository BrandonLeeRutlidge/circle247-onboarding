(function(){
var stage=document.getElementById('stage');
var secs={};[].forEach.call(stage.querySelectorAll('.screen'),function(s){secs[s.id]=s;});
var ORDER=['s-welcome','s-who','s-name','s-worry','s-feeling','s-reframe','s-proof','s-hardest','s-hope','s-sos','s-heartbeat','s-checkin','s-rating','s-notif','s-contacts','s-referral','s-building','s-ready','s-pay1','s-pay2','s-pay3','s-done'];
var MORDER=['m-code','m-join','m-sos','m-notif','m-done'];
var ONB=['s-who','s-name','s-worry','s-feeling','s-reframe','s-proof','s-hardest','s-hope','s-sos','s-heartbeat','s-checkin','s-rating','s-notif','s-contacts','s-referral'];
var REL={son:{w:'son',ex:'Jack'},daughter:{w:'daughter',ex:'Maya'},husband:{w:'husband',ex:'Tom'},wife:{w:'wife',ex:'Sarah'},boyfriend:{w:'boyfriend',ex:'Alex'},girlfriend:{w:'girlfriend',ex:'Emma'},partner:{w:'partner',ex:'Sam'},mum:{w:'mum',ex:'Mum'},dad:{w:'dad',ex:'Dad'},grandma:{w:'grandma',ex:'Grandma'},grandad:{w:'grandad',ex:'Grandad'}};
var DEF=['daughter','wife','grandma'];
var TAP='.opt,.face,.contact,.toggle,.plan';
// trail is every screen visited, pos is where we are in it; browser history mirrors pos so a phone's back gesture steps back a screen
var cur='s-welcome',trail=['s-welcome'],pos=0,useHist=true,timer=null,finishT=null;
var state={rels:DEF.slice(),names:{daughter:'Maya',wife:'Sarah',grandma:'Grandma'},name:'Maya',people:'Maya, Sarah and Grandma'};
function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function rels(){return state.rels.length?state.rels:DEF;}
// a field the user cleared reads "your son", not someone else's example name
function nameOf(r){var n=(state.names[r]||'').trim();if(n)return n;if(state.names[r]!=null)return 'your '+(REL[r]?REL[r].w:r);return REL[r]?REL[r].ex:'';}
function initial(nm){return (Array.from(nm)[0]||'').toUpperCase();}
function curve(pi){var t=(pi+1)/ONB.length;return Math.round(30+70*(t+0.15*Math.sin(2*Math.PI*t)));}
Object.keys(secs).forEach(function(id){var s=secs[id],top='';
if(id.indexOf('m-')===0){var mi=MORDER.indexOf(id),mp=mi>=0?Math.round((mi+1)/MORDER.length*100):0;top='<div class="topbar"><button class="back" data-prev aria-label="Back">‹</button><div class="progress"><i style="width:'+mp+'%"></i></div><span class="pct">'+mp+'%</span></div>';}
else if(s.hasAttribute('data-back')){var pkey=id.indexOf('s-who-')===0?'s-who':id,pi=ONB.indexOf(pkey),pct=pi>=0?curve(pi):0;top='<div class="topbar"><button class="back" data-prev aria-label="Back">‹</button><div class="progress"><i style="width:'+pct+'%"></i></div><span class="pct">'+pct+'%</span></div>';}
else if(s.hasAttribute('data-close'))top='<div class="topbar close"><div class="progress ghost"></div><button class="xbtn" data-goto="'+s.getAttribute('data-close')+'" aria-label="Close">×</button></div>';
if(top)s.insertAdjacentHTML('afterbegin',top);});
function buildPeople(){
var arr=rels().map(function(r){return nameOf(r)||('your '+r);});
arr=arr.filter(function(v,i,a){return v&&a.indexOf(v)===i;});
state.name=arr[0]||'Maya';
state.people=arr.length<=1?(arr[0]||'the people you love'):arr.slice(0,-1).join(', ')+' and '+arr[arr.length-1];}
function names(){document.querySelectorAll('.jsname').forEach(function(x){x.textContent=state.name;});
document.querySelectorAll('.jspeople').forEach(function(x){x.textContent=state.people;});}
function buildNameRows(){var c=document.getElementById('nameRows');if(!c)return;var rs=rels();
c.innerHTML=rs.map(function(r,i){var w=REL[r]?REL[r].w:r;var val=(state.names[r]!=null?state.names[r]:(REL[r]?REL[r].ex:''));
return '<div class="namerow"><span class="nl">Your '+esc(w)+'</span><input class="input sm" data-nm="'+esc(r)+'" value="'+esc(val)+'" maxlength="16" autocomplete="off" autocapitalize="words" enterkeyhint="'+(i<rs.length-1?'next':'go')+'" aria-label="Your '+esc(w)+'’s name"></div>';}).join('');}
function buildReady(){var c=document.getElementById('readyRows');if(!c)return;
c.innerHTML=rels().map(function(r){var nm=nameOf(r)||'Them';
return '<div class="cperson"><span class="cav">'+esc(initial(nm))+'</span><div class="cpi"><div class="cpn">'+esc(nm)+'</div><div class="cps">Invite sent · pending</div></div><span class="cdot pend"></span></div>';}).join('');}
function buildContacts(){var c=document.getElementById('contactRows');if(!c)return;
c.innerHTML=rels().map(function(r){var nm=nameOf(r);
return '<div class="contact s" tabindex="0" role="button"><span class="av">'+esc(Array.from(nm).slice(0,2).join('').toUpperCase())+'</span><div><div class="nm">'+esc(nm)+'</div><div class="rl">You\'re inviting</div></div><span class="add"></span></div>';}).join('');}
function buildMap(){var c=document.getElementById('payMap');if(!c)return;
var rs=rels(),pins=c.querySelectorAll('.mpin');
[].forEach.call(pins,function(p,i){p.style.display=rs[i]?'':'none';if(rs[i])p.querySelector('.mav').textContent=initial(nameOf(rs[i]));});}
function buildBuild(){var c=document.getElementById('buildList');if(!c)return;
var items=rels().map(function(r){return 'Adding '+esc(nameOf(r))+' to your circle';});
items.push('Setting up the silent SOS','Turning on the live map','Enabling the offline heartbeat','Scheduling your check ins');
c.innerHTML=items.map(function(t){return '<div class="cl"><span class="ck"></span>'+t+'</div>';}).join('');}
function seqFor(id){return id.indexOf('m-')===0?MORDER:ORDER;}
// Who's in your circle and its branch screens need at least one pick before Continue
function syncCta(){if(cur!=='s-who'&&cur.indexOf('s-who-')!==0)return;var b=secs[cur].querySelector('.footer .cta');if(b)b.disabled=!secs[cur].querySelector('.opt.s');}
// screen readers hear what is ticked or switched on
function syncAria(){[].forEach.call(secs[cur].querySelectorAll(TAP),function(el){
if(el.classList.contains('toggle'))el.setAttribute('aria-checked',el.classList.contains('on'));
else if(!el.hasAttribute('data-goto'))el.setAttribute('aria-pressed',el.classList.contains('s'));});}
function render(){[].forEach.call(stage.querySelectorAll('.screen.on'),function(s){s.classList.remove('on');});secs[cur].classList.add('on');
if(cur==='s-name')buildNameRows();if(cur==='s-contacts')buildContacts();if(cur==='s-ready')buildReady();if(cur==='s-pay1')buildMap();names();syncCta();syncAria();
var c=secs[cur].querySelector('.content');if(c)c.scrollTop=0;
if(stage.contains(document.activeElement)||document.activeElement===document.body)secs[cur].focus({preventScroll:true});
if(timer){clearInterval(timer);timer=null;}if(finishT){clearTimeout(finishT);finishT=null;}if(cur==='s-building')runLoader();}
function runLoader(){var n=0,el=document.getElementById('loadN');buildBuild();var cls=secs['s-building'].querySelectorAll('.cl');if(el)el.textContent='0%';
timer=setInterval(function(){n+=1.55;if(n>100)n=100;if(el)el.textContent=Math.round(n)+'%';
cls.forEach(function(c,i){if(n>=(i+1)/cls.length*100)c.classList.add('done');});
// the finished loader replaces its own history entry, so Back from "Your circle's set up" skips it rather than re-running it
if(n>=100){clearInterval(timer);timer=null;finishT=setTimeout(function(){finishT=null;if(cur!=='s-building')return;trail.length=pos;trail.push('s-ready');cur='s-ready';render();},800);}},95);}
function goto(id){
// Done and Start again rewind history to the first screen instead of stacking a finished flow behind it
if(id==='s-welcome'&&pos>0){if(useHist){history.go(-pos);return;}trail=['s-welcome'];pos=0;cur=id;render();return;}
trail=trail.slice(0,pos+1);trail.push(id);pos++;
if(useHist){try{history.pushState({c247:pos},'');}catch(e){useHist=false;}}
cur=id;render();}
function back(){if(pos<=0)return;if(useHist){history.back();return;}pos--;cur=trail[pos];render();}
window.addEventListener('popstate',function(e){var p=e.state&&typeof e.state.c247==='number'?e.state.c247:0;
if(p>trail.length-1){history.go((trail.length-1)-p);return;}
pos=p;cur=trail[pos]||'s-welcome';render();});
// After a reload the old entries are stale, so rewind to the first one rather than leaving dead Back presses
var h0=history.state&&typeof history.state.c247==='number'?history.state.c247:0;
if(h0>0)history.go(-h0);else{try{history.replaceState({c247:0},'');}catch(e){useHist=false;}}
// The branch screens for whoever is ticked on "Who's in your circle?", in order. Worked out fresh each time, so going back and changing answers is safe.
function branches(){var q=[];[].forEach.call(secs['s-who'].querySelectorAll('.opt.s'),function(o){var b=o.getAttribute('data-branch');if(b&&secs[b])q.push(b);});return q;}
function nextBranch(from){var q=branches(),i=q.indexOf(from);
if(i<q.length-1){goto(q[i+1]);return;}
var rs=[];q.forEach(function(b){[].forEach.call(secs[b].querySelectorAll('.opt.s'),function(o){var r=o.getAttribute('data-rel');if(r&&rs.indexOf(r)<0)rs.push(r);});});
state.rels=rs;buildPeople();goto('s-name');}
function next(){
if(cur==='s-who'||cur.indexOf('s-who-')===0){if(!secs[cur].querySelector('.opt.s'))return;nextBranch(cur);return;}
if(cur==='s-name'){[].forEach.call(document.querySelectorAll('#nameRows [data-nm]'),function(x){state.names[x.getAttribute('data-nm')]=x.value.trim();});buildPeople();names();}
var seq=seqFor(cur),i=seq.indexOf(cur);if(i>=0&&i<seq.length-1)goto(seq[i+1]);}
stage.addEventListener('click',function(e){var t=e.target;
var op=t.closest('.opt');
if(op){if(op.closest('[data-relsingle]')){[].forEach.call(op.parentNode.querySelectorAll('.opt'),function(x){x.classList.remove('s');});op.classList.add('s');syncCta();syncAria();return;}
if(op.closest('[data-multi]')||op.closest('[data-catmulti]')||op.closest('[data-relmulti]')){op.classList.toggle('s');syncCta();syncAria();return;}}
var fc=t.closest('.face');if(fc){var p=fc.parentNode;[].forEach.call(p.querySelectorAll('.face'),function(x){x.classList.remove('s');});fc.classList.add('s');syncAria();return;}
var ct=t.closest('.contact');if(ct){ct.classList.toggle('s');var a=ct.querySelector('.add');if(a)a.textContent=ct.classList.contains('s')?'':'+';syncAria();return;}
var tg=t.closest('.toggle');if(tg){tg.classList.toggle('on');syncAria();return;}
var pl=t.closest('.plan');if(pl){var pp=pl.parentNode;[].forEach.call(pp.querySelectorAll('.plan'),function(x){x.classList.remove('s');});pl.classList.add('s');syncAria();return;}
var g=t.closest('[data-goto]');if(g){goto(g.getAttribute('data-goto'));return;}
var pv=t.closest('[data-prev]');if(pv){back();return;}
var nx=t.closest('[data-next]');if(nx){next();return;}});
// Names are kept as they are typed, so going back before Continue doesn't lose them
stage.addEventListener('input',function(e){var k=e.target.getAttribute&&e.target.getAttribute('data-nm');if(k){state.names[k]=e.target.value;buildPeople();names();}});
// The tappable cards are divs, so give them keyboard access too; Enter in a text field moves on like the keyboard's Go key promises
[].forEach.call(stage.querySelectorAll(TAP),function(el){el.setAttribute('tabindex','0');el.setAttribute('role','button');});
[].forEach.call(stage.querySelectorAll('.toggle'),function(el){el.setAttribute('role','switch');var t=el.closest('.card');var l=t&&t.querySelector('.t');if(l)el.setAttribute('aria-label',l.textContent);});
stage.addEventListener('keydown',function(e){var t=e.target;
if(e.key==='Enter'&&t.tagName==='INPUT'&&!e.isComposing){e.preventDefault();var ins=[].slice.call(secs[cur].querySelectorAll('input')),i=ins.indexOf(t);
if(i>-1&&i<ins.length-1)ins[i+1].focus();else{t.blur();next();}return;}
if((e.key==='Enter'||e.key===' ')&&t.matches&&t.matches(TAP)){e.preventDefault();t.click();}});
buildPeople();names();render();

// Desktop only: a QR code of this page so people can carry on on their phone
var scan=document.getElementById('scan'),qrBox=document.getElementById('qr');
if(scan&&qrBox&&window.matchMedia){var mq=window.matchMedia('(min-aspect-ratio:1/1) and (min-width:1080px) and (min-height:640px)');
function drawQR(){var q=window.qrcode(0,'M');q.addData(location.href.split('#')[0]);q.make();
var n=q.getModuleCount(),d='';for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))d+='M'+c+' '+r+'h1v1h-1z';
qrBox.innerHTML='<svg viewBox="0 0 '+n+' '+n+'" shape-rendering="crispEdges" role="img" aria-label="QR code for this page"><path fill="#05475E" d="'+d+'"/></svg>';scan.hidden=false;}
function loadQR(){if(!mq.matches||scan.getAttribute('data-loading'))return;scan.setAttribute('data-loading','1');
var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';s.crossOrigin='anonymous';
s.integrity='sha512-ZDSPMa/JM1D+7kdg2x3BsruQ6T/JpJo3jWDWkCZsP+5yVyp1KfESqLI+7RqB5k24F7p2cV7i2YHh/890y6P6Sw==';
s.onload=function(){if(window.qrcode)drawQR();};document.head.appendChild(s);}
loadQR();if(mq.addEventListener)mq.addEventListener('change',loadQR);else if(mq.addListener)mq.addListener(loadQR);}
})();
