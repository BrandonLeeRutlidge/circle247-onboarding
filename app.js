(function(){
var stage=document.getElementById('stage');
var secs={};[].forEach.call(stage.querySelectorAll('.screen'),function(s){secs[s.id]=s;});
var ORDER=['s-welcome','s-who','s-name','s-worry','s-feeling','s-reframe','s-proof','s-hardest','s-hope','s-sos','s-heartbeat','s-checkin','s-rating','s-notif','s-location','s-contacts','s-referral','s-building','s-ready','s-pay1','s-pay2','s-pay3','s-done'];
var MORDER=['m-code','m-join','m-location','m-sos','m-notif','m-done'];
// progress moves on every screen and stops short of 100% until the loader finishes the job
// the screens that carry the progress bar, in order (the who-branches slot in after s-who)
var QSEQ=['s-name','s-worry','s-feeling','s-reframe','s-proof','s-hardest','s-hope','s-sos','s-heartbeat','s-checkin','s-rating','s-notif','s-location','s-contacts','s-referral'];
var MSEQ=['m-code','m-join','m-location','m-sos','m-notif'];
var ICONS='assets/icons.svg#',PEOPLE='assets/people.svg#';
// example names, per kind of person, for the first, second and third of them
var EX={'child:son':['Jack','Leo','Alfie'],'child:daughter':['Maya','Ella','Isla'],'teen:son':['Oliver','Harry','George'],'teen:daughter':['Chloe','Freya','Amelia'],'partner:husband':['Tom'],'partner:wife':['Sarah'],'partner:boyfriend':['Alex'],'partner:girlfriend':['Emma'],'partner:partner':['Sam'],'parent:mum':['Mum'],'parent:dad':['Dad'],'grandparent:grandma':['Grandma'],'grandparent:grandad':['Grandad']};
var PIC={'child:son':'p-son','child:daughter':'p-daughter','teen:son':'p-teen-son','teen:daughter':'p-teen-daughter','partner:husband':'p-husband','partner:wife':'p-wife','partner:boyfriend':'p-boyfriend','partner:girlfriend':'p-girlfriend','partner:partner':'p-partner','parent:mum':'p-mum','parent:dad':'p-dad','grandparent:grandma':'p-grandma','grandparent:grandad':'p-grandad'};
var NTH=['','','second ','third '];
var STATUS={child:'At school',teen:'On the bus home',partner:'At work',parent:'At the shops',grandparent:'Home, all quiet'};
var WORRY={child:[['i-school','The walk to and from school'],['i-play','Playdates and clubs']],teen:[['i-night','First nights out'],['i-car','Learning to drive']],partner:[['i-train','Late journeys home']],parent:[['i-walk',"When they're out on their own"],['i-support','If they have a fall']],grandparent:[['i-walk',"When they're out on their own"],['i-support','If they have a fall']]};
function person(cat,rel,n){return {key:cat+':'+rel+':'+n,cat:cat,rel:rel,n:n};}
var DEF=[person('child','daughter',1),person('partner','wife',1),person('grandparent','grandma',1)];
// trail is every screen visited, pos is where we are in it; browser history mirrors pos so a phone's back gesture steps back a screen
var cur='s-welcome',trail=['s-welcome'],pos=0,useHist=true,timer=null,finishT=null,lastPct=0,advancing=false,worrySig='';
var state={people:DEF.slice(),names:{'child:daughter:1':'Maya','partner:wife:1':'Sarah','grandparent:grandma:1':'Grandma'},name:'Maya',people_s:'Maya, Sarah and Grandma',hb:'Grandma',ci:'Maya'};
function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function people(){return state.people.length?state.people:DEF;}
function label(p){return 'Your '+NTH[p.n]+(p.cat==='teen'?'teenage ':'')+p.rel;}
function relWord(p){var w=(p.cat==='teen'?'teenage ':'')+p.rel;return w.charAt(0).toUpperCase()+w.slice(1);}
// a field the user cleared reads "your son", not someone else's example name
function nameOf(p){var v=state.names[p.key],n=(v||'').trim();if(n)return n;if(v!=null)return 'your '+NTH[p.n]+p.rel;var ex=EX[p.cat+':'+p.rel];return ex?ex[Math.min(p.n,ex.length)-1]:p.rel;}
function initial(nm){return (Array.from(nm)[0]||'').toUpperCase();}
function icon(id){return '<svg class="ico"><use href="'+ICONS+id+'"/></svg>';}
function av(p,i,cls){var pic=PIC[p.cat+':'+p.rel];
if(pic)return '<span class="av por'+(cls?' '+cls:'')+'" title="'+esc(nameOf(p))+'"><svg viewBox="0 0 96 96"><use href="'+PEOPLE+pic+'"/></svg></span>';
return '<span class="av c'+(i%4)+(cls?' '+cls:'')+'">'+esc(initial(nameOf(p)))+'</span>';}
function face(pic){return '<span class="av por"><svg viewBox="0 0 96 96"><use href="'+PEOPLE+pic+'"/></svg></span>';}
function pick(order){var ps=people();for(var i=0;i<order.length;i++)for(var j=0;j<ps.length;j++)if(ps[j].cat===order[i])return ps[j];return ps[0];}
Object.keys(secs).forEach(function(id){var s=secs[id],top='';
if(s.hasAttribute('data-back'))top='<div class="topbar"><button class="back" data-prev aria-label="Back">‹</button><div class="progress"><i></i></div></div>';
else if(s.hasAttribute('data-close'))top='<div class="topbar close"><div class="progress ghost"></div><button class="xbtn" data-goto="'+s.getAttribute('data-close')+'" aria-label="Close">×</button></div>';
if(top)s.insertAdjacentHTML('afterbegin',top);});
[].forEach.call(stage.querySelectorAll('.cta'),function(b){b.setAttribute('data-label',b.textContent);});
function buildPeople(){
var arr=people().map(nameOf);
arr=arr.filter(function(v,i,a){return v&&a.indexOf(v)===i;});
state.name=arr[0]||'Maya';
state.people_s=arr.length<=1?(arr[0]||'the people you love'):arr.slice(0,-1).join(', ')+' and '+arr[arr.length-1];
// the heartbeat leads with the eldest, check-ins with the youngest
state.hb=nameOf(pick(['grandparent','parent','child','teen','partner']));
state.ci=nameOf(pick(['child','teen','partner','parent','grandparent']));}
function names(){
function fill(sel,v){document.querySelectorAll(sel).forEach(function(x){x.textContent=v;});}
fill('.jsname',state.name);fill('.jspeople',state.people_s);fill('.jshb',state.hb);fill('.jsci',state.ci);}
function buildNameRows(){var c=document.getElementById('nameRows');if(!c)return;var ps=people();
c.innerHTML=ps.map(function(p,i){var v=state.names[p.key]!=null?state.names[p.key]:nameOf(p);
return '<label class="nrow"><span class="ic por"><svg><use href="'+PEOPLE+(PIC[p.cat+':'+p.rel]||'p-partner')+'"/></svg></span><span class="nwrap"><span class="nl">'+esc(label(p))+'</span><span class="nfield"><input class="input sm" data-nm="'+esc(p.key)+'" value="'+esc(v)+'" maxlength="16" autocomplete="off" autocapitalize="words" enterkeyhint="'+(i<ps.length-1?'next':'go')+'" placeholder="Their name" aria-label="'+esc(label(p))+'’s name"><svg class="pen" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.6V20h3.4l9.9-9.9-3.4-3.4L4 16.6zm15.7-9.1a1 1 0 0 0 0-1.4l-1.8-1.8a1 1 0 0 0-1.4 0l-1.4 1.4 3.4 3.4 1.2-1.6z"/></svg></span></span></label>';}).join('');}
function buildWorry(){var c=document.getElementById('worryOpts');if(!c)return;
var cats=[];['grandparent','parent','child','teen','partner'].forEach(function(k){if(people().some(function(p){return p.cat===k;}))cats.push(k);});
var sig=cats.join(',');if(sig===worrySig)return;worrySig=sig;
// take each person's first worry, then their second, then the shared ones, so a big family still gets a short list
var items=[],seen={};function add(w){if(w&&!seen[w[1]]&&items.length<6){seen[w[1]]=1;items.push(w);}}
[0,1].forEach(function(i){cats.forEach(function(k){add((WORRY[k]||[])[i]);});});
if(cats.some(function(k){return k!=='partner';}))add(['i-home',"When they're home alone"]);
add(['i-silent',"When they don't pick up"]);
c.innerHTML=items.map(function(w){return '<div class="opt" tabindex="0" role="button"><span class="ic">'+icon(w[0])+'</span><span class="lbl">'+esc(w[1])+'</span><span class="tick"></span></div>';}).join('')+
'<div class="opt other" tabindex="0" role="button"><span class="ic">'+icon('i-plus')+'</span><span class="lbl">Something else…</span><span class="tick"></span></div>';
document.getElementById('worryOther').classList.remove('on');}
// people sitting on a ring around you, joined by two-way dots: the circle of care, made literal
function orbit(id,mode){var c=document.getElementById(id);if(!c)return;var ps=people().slice(0,6),n=ps.length;
var h='<div class="orbit'+(mode?' '+mode:'')+'"><span class="oring"></span>';
ps.forEach(function(p,i){var a=-90+i*360/n;h+='<span class="olink" style="--a:'+a+'deg"></span><span class="onode" style="--a:'+a+'deg">'+av(p,i)+'<em>'+esc(nameOf(p))+(mode==='pending'?'<small>Invited</small>':'')+'</em></span>';});
c.innerHTML=h+'<span class="ome">You</span></div>';}
function pins(c,list){c.innerHTML='<img class="mapimg" src="assets/map.svg" alt="">'+(c.id==='payMap'||c.id==='doneMap'?'<span class="mtag">Example</span>':'')+list.map(function(x){
return '<span class="mpin" style="left:'+x[2]+'%;top:'+x[3]+'%">'+x[0]+(x[1]==='You'?'':'<span class="mlab"><b>'+esc(x[1])+'</b>'+(x[4]?' · '+esc(x[4]):'')+'</span>')+'</span>';}).join('');}
var DAD=[['p-dad','Dad',64,30,'Home'],['p-mum','Mum',28,22,'At the shops'],['p-teen-daughter','Jess',70,76,'At school']];
var SPOTS=[[27,18],[70,27],[34,47],[72,63],[33,80]];
// the paywall map shows everyone you named (up to five) going about their day; the done screen marks them as invited
function buildMap(id,label){var c=document.getElementById(id);if(!c)return;
pins(c,people().slice(0,5).map(function(p,k){return [av(p,k),nameOf(p),SPOTS[k][0],SPOTS[k][1],label||STATUS[p.cat]];}));}
function buildLoc(){var c=document.getElementById('locMap');if(c){var p=people()[0];pins(c,[['<span class="av you">You</span>','You',30,62,''],[av(p,0),nameOf(p),66,30,STATUS[p.cat]]]);}
var m=document.getElementById('mLocMap');if(m&&!m.firstChild)pins(m,[['<span class="av you">You</span>','You',30,58,'']].concat(DAD.map(function(d){return [face(d[0]),d[1],d[2],d[3],d[4]];})));}
function buildDad(){var c=document.getElementById('dadWho');if(c&&!c.firstChild)c.innerHTML='<span class="avs">'+DAD.map(function(d){return face(d[0]);}).join('')+'</span><p>Dad, Mum and Jess are already in</p>';}
function buildContacts(){var c=document.getElementById('contactRows');if(!c)return;
c.innerHTML=people().map(function(p,i){
return '<div class="contact s" tabindex="0" role="button">'+av(p,i)+'<div><div class="nm">'+esc(nameOf(p))+'</div><div class="rl">'+esc(relWord(p))+' · 07••• •••'+String((482+i*137)%1000).padStart(3,'0')+'</div></div><span class="add" aria-hidden="true"></span></div>';}).join('');
syncInvites();}
function syncInvites(){var b=document.getElementById('inviteCta');if(!b)return;var n=secs['s-contacts'].querySelectorAll('.contact.s').length;
b.disabled=!n;b.textContent=n?'Send '+n+' invite'+(n>1?'s':''):'Pick someone to invite';}
function buildFor(){var c=document.getElementById('payWho');if(!c)return;var ps=people().slice(0,5);
c.innerHTML='<span class="avs">'+ps.map(function(p,i){return av(p,i);}).join('')+'</span><p>For '+esc(state.people_s)+'</p>';}
function buildBuild(){var c=document.getElementById('buildList');if(!c)return;
var items=people().map(function(p){return 'Adding '+esc(nameOf(p))+' to your circle';});
items.push('Setting up the silent SOS','Turning on the live map','Enabling the offline heartbeat','Scheduling your check-ins');
c.innerHTML=items.map(function(t){return '<div class="cl"><span class="ck"></span>'+t+'</div>';}).join('');}
function seqFor(id){return id.indexOf('m-')===0?MORDER:ORDER;}
// The bar opens at 30% so people feel they're already well on their way, then each answer adds a little less than the last
// (big early jumps, small late ones), finishing at 96% for the loader to carry home. Worked out from this person's actual
// route, so every screen moves it, however many branch screens they get.
function pct(id){var seq=id.indexOf('m-')===0?MSEQ:['s-who'].concat(branches(),QSEQ),i=seq.indexOf(id);if(i<0)return 0;
var v=0;for(var k=0;k<=i;k++){var t=seq.length>1?k/(seq.length-1):1;v=Math.max(Math.round(30+66*(.85*(1-Math.pow(1-t,3))+.15*t)),k?v+1:30);}
return v;}
function picked(s){return s.querySelector('.opt.s,.tile.s,.face.s');}
// Continue waits for at least one pick, and says so
function syncCta(){[].forEach.call(secs[cur].querySelectorAll('[data-need]'),function(b){var ok=!!picked(secs[cur]);b.disabled=!ok;b.textContent=ok?b.getAttribute('data-label'):'Pick at least one';});}
// screen readers hear what is ticked or switched on
function syncAria(){[].forEach.call(secs[cur].querySelectorAll(TAP),function(el){
if(el.classList.contains('toggle'))el.setAttribute('aria-checked',el.classList.contains('on'));
else if(!el.hasAttribute('data-goto'))el.setAttribute('aria-pressed',el.classList.contains('s'));});}
function fitFooter(){var s=secs[cur],f=s.querySelector('.footer');s.style.setProperty('--fh',(f?f.offsetHeight:0)+'px');}
window.addEventListener('resize',function(){fitFooter();});
function render(){[].forEach.call(stage.querySelectorAll('.screen.on'),function(s){s.classList.remove('on');});secs[cur].classList.add('on');advancing=false;
if(cur==='s-name')buildNameRows();if(cur==='s-worry')buildWorry();if(cur==='s-reframe')orbit('reframeOrbit');
if(cur==='s-location'||cur==='m-location')buildLoc();if(cur==='m-join')buildDad();if(cur==='s-contacts')buildContacts();
if(cur==='s-ready')orbit('readyOrbit','pending');if(cur==='s-pay2')buildFor();if(cur==='s-done')buildMap('doneMap','Invite sent');if(cur==='s-pay1')buildMap('payMap');
names();syncCta();syncAria();fitFooter();
var bar=secs[cur].querySelector('.progress>i');if(bar){var p=pct(cur);bar.style.transition='none';bar.style.width=lastPct+'%';void bar.offsetWidth;bar.style.transition='';bar.style.width=p+'%';lastPct=p;}
var c=secs[cur].querySelector('.content');if(c)c.scrollTop=0;
if(stage.contains(document.activeElement)||document.activeElement===document.body)secs[cur].focus({preventScroll:true});
if(timer){clearInterval(timer);timer=null;}if(finishT){clearTimeout(finishT);finishT=null;}if(cur==='s-building')runLoader();}
// The loader works in bursts and pauses, like real set-up work, rather than one steady crawl.
// Each step: [reach this %, over this many ms (fast start, easing off), then hold for this many ms]. About 7 seconds in all.
var LOADSTEPS=[[18,600,300],[27,700,450],[49,550,150],[61,800,550],[79,600,200],[90,800,400],[96,450,200],[100,350,0]];
function loadAt(ms){var from=0,t=0;for(var i=0;i<LOADSTEPS.length;i++){var s=LOADSTEPS[i];
if(ms<t+s[1]){var k=(ms-t)/s[1];return from+(s[0]-from)*(1-Math.pow(1-k,3));}t+=s[1];
if(ms<t+s[2])return s[0];t+=s[2];from=s[0];}return 100;}
function runLoader(){var n=0,start=Date.now(),el=document.getElementById('loadN'),arc=document.getElementById('loadArc');buildBuild();var cls=secs['s-building'].querySelectorAll('.cl');
function paint(){if(el)el.textContent=Math.round(n)+'%';if(arc)arc.style.strokeDashoffset=100-n;}paint();
timer=setInterval(function(){n=loadAt(Date.now()-start);paint();
cls.forEach(function(c,i){if(n>=(i+1)/cls.length*100)c.classList.add('done');});
// the finished loader replaces its own history entry, so Back from "Your circle's set up" skips it rather than re-running it
if(n>=100){clearInterval(timer);timer=null;finishT=setTimeout(function(){finishT=null;if(cur!=='s-building')return;trail.length=pos;trail.push('s-ready');cur='s-ready';render();},800);}},30);}
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
var ps=[];q.forEach(function(b){var cat=b.replace('s-who-','');[].forEach.call(secs[b].querySelectorAll('.opt.s,.tile.s'),function(o){var r=o.getAttribute('data-rel'),n=+(o.getAttribute('data-n')||1);for(var k=1;k<=n;k++)ps.push(person(cat,r,k));});});
state.people=ps;buildPeople();goto('s-name');}
function next(){
if(cur==='s-who'||cur.indexOf('s-who-')===0){if(!picked(secs[cur]))return;nextBranch(cur);return;}
if(cur==='s-name'){[].forEach.call(document.querySelectorAll('#nameRows [data-nm]'),function(x){state.names[x.getAttribute('data-nm')]=x.value.trim();});buildPeople();names();}
if(secs[cur].querySelector('[data-need]')&&!picked(secs[cur]))return;
var seq=seqFor(cur),i=seq.indexOf(cur);if(i>=0&&i<seq.length-1)goto(seq[i+1]);}
// single-choice screens move on by themselves after a beat, like Cal AI
function autoNext(){if(advancing)return;advancing=true;var from=cur;setTimeout(function(){if(cur===from)next();},280);}
var toastT=null;function toast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on');},2600);}
stage.addEventListener('click',function(e){var t=e.target;
var st=t.closest('[data-inc],[data-dec]');if(st){var tile=st.closest('.tile'),n=+(tile.getAttribute('data-n')||1);n=Math.max(1,Math.min(3,n+(st.hasAttribute('data-inc')?1:-1)));tile.setAttribute('data-n',n);tile.querySelector('.step b').textContent=n;tile.querySelector('[data-dec]').disabled=n<=1;return;}
var tl=t.closest('.tile');if(tl){tl.classList.toggle('s');if(!tl.classList.contains('s')){tl.setAttribute('data-n',1);var sb=tl.querySelector('.step b');if(sb){sb.textContent=1;tl.querySelector('[data-dec]').disabled=true;}}syncCta();syncAria();return;}
var op=t.closest('.opt');
if(op){if(op.closest('[data-relsingle]')){[].forEach.call(op.parentNode.querySelectorAll('.opt'),function(x){x.classList.remove('s');});op.classList.add('s');syncAria();autoNext();return;}
if(op.closest('[data-multi]')||op.closest('[data-catmulti]')){op.classList.toggle('s');
if(op.classList.contains('other')){var oi=document.getElementById('worryOther');oi.classList.toggle('on',op.classList.contains('s'));if(op.classList.contains('s'))oi.focus();}
syncCta();syncAria();return;}}
var fc=t.closest('.face');if(fc){[].forEach.call(fc.parentNode.querySelectorAll('.face'),function(x){x.classList.remove('s');});fc.classList.add('s');syncAria();autoNext();return;}
var ct=t.closest('.contact');if(ct){ct.classList.toggle('s');syncInvites();syncAria();return;}
var tg=t.closest('.toggle');if(tg){tg.classList.toggle('on');syncAria();return;}
var pl=t.closest('.plan');if(pl){[].forEach.call(pl.parentNode.querySelectorAll('.plan'),function(x){x.classList.remove('s');});pl.classList.add('s');syncAria();return;}
if(t.closest('[data-practise]')){var v=secs[cur].querySelector('.sosv');if(v){v.classList.remove('practise');void v.offsetWidth;v.classList.add('practise');}
if(navigator.vibrate)navigator.vibrate([90,70,90,70,90,320,90,70,90,70,90,320,90,70,90,70,90]);toast("That's it. Nothing was sent.");return;}
if(t.closest('[data-paste]')){var mi=document.getElementById('mCode');
if(navigator.clipboard&&navigator.clipboard.readText)navigator.clipboard.readText().then(function(x){mi.value=x.trim().slice(0,7);paintCode();},function(){toast('Copy the code from Messages first');});else toast('Copy the code from Messages first');return;}
if(t.closest('[data-resend]')){toast('In the app, this asks them to send it again.');return;}
var g=t.closest('[data-goto]');if(g){goto(g.getAttribute('data-goto'));return;}
var pv=t.closest('[data-prev]');if(pv){back();return;}
var nx=t.closest('[data-next]');if(nx){next();return;}});
// Names are kept as they are typed, so going back before Continue doesn't lose them
stage.addEventListener('input',function(e){var k=e.target.getAttribute&&e.target.getAttribute('data-nm');if(k){state.names[k]=e.target.value;buildPeople();names();}
if(e.target.id==='refCode')document.getElementById('refCta').disabled=!e.target.value.trim();
if(e.target.id==='mCode')paintCode();});
// The invite code shows as separate boxes, easier to check character by character
var mc=document.getElementById('mCode'),cells=document.getElementById('codeCells');
function paintCode(){var v=(mc.value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6),h='';
for(var i=0;i<6;i++){if(i===3)h+='<i class="gap"></i>';h+='<span class="cell'+(i===v.length&&document.activeElement===mc?' cur':'')+'">'+esc(v.charAt(i))+'</span>';}cells.innerHTML=h;}
if(mc){mc.addEventListener('focus',paintCode);mc.addEventListener('blur',paintCode);paintCode();}
// The tappable cards are divs, so give them keyboard access too; Enter in a text field moves on like the keyboard's Go key promises
var TAP='.opt,.tile,.face,.contact,.toggle,.plan';
[].forEach.call(stage.querySelectorAll(TAP),function(el){el.setAttribute('tabindex','0');el.setAttribute('role','button');});
[].forEach.call(stage.querySelectorAll('.toggle'),function(el){el.setAttribute('role','switch');var t=el.closest('.card');var l=t&&t.querySelector('.t');if(l)el.setAttribute('aria-label',l.textContent);});
stage.addEventListener('keydown',function(e){var t=e.target;
if(e.key==='Enter'&&t.tagName==='INPUT'&&!e.isComposing){e.preventDefault();var ins=[].slice.call(secs[cur].querySelectorAll('input:not(.otherin)')),i=ins.indexOf(t);
if(t.classList.contains('otherin')){t.blur();return;}
if(i>-1&&i<ins.length-1)ins[i+1].focus();else{t.blur();next();}return;}
if((e.key==='Enter'||e.key===' ')&&t.matches&&t.matches(TAP)){e.preventDefault();t.click();}});
buildPeople();names();render();
// When the phone keyboard opens, size the app to the space above it so the fields and the button stay reachable and the screen
// can scroll; then bring the field being typed in to the middle. Pinch-zoom is left alone.
var vv=window.visualViewport,root=document.documentElement;
function fitViewport(){if(vv.scale>1.01){root.style.removeProperty('--vvh');root.style.removeProperty('--vvt');}
else{root.style.setProperty('--vvh',vv.height+'px');root.style.setProperty('--vvt',vv.offsetTop+'px');}fitFooter();}
if(vv){vv.addEventListener('resize',fitViewport);vv.addEventListener('scroll',fitViewport);fitViewport();}
stage.addEventListener('focusin',function(e){var t=e.target;if(t.tagName!=='INPUT')return;
setTimeout(function(){if(document.activeElement===t)t.scrollIntoView({block:'center'});},350);});

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
