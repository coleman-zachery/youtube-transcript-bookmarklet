(async()=>{const d=document,N=navigator,D=Date.now,t='textContent',s='style',c='cssText',k='click',
a='appendChild',r='remove',q=(s,o=d)=>o.querySelector(s),Q=(s,o=d)=>[...o.querySelectorAll(s)],
S=m=>new Promise(r=>setTimeout(r,m)),W=async(f,m=25e3)=>{for(let e=D()+m;D()<e;await S(150)){
let x=f.call?f():q(f);if(x)return x}throw Error('timeout')},M='segment',V='#'+M+'s-container',w='button',
p='engagement-panel-s',E='#description-inline-expander #',G=`ytd-${p}ection-list-renderer[target-id="${p}earchable-transcript"] `
q(E+'expand')?.[k]();if(!q(V))(await W(()=>Q(w).find(b=>/show transcript/i.test(b.ariaLabel||b[t]))))[k]()
const P=await W(V),T=x=>x?.[t]?.replace(/\s+/g,' ')?.trim()||'',
R=await W(()=>{let x=Q(`ytd-transcript-${M}-renderer`,P);return x[0]&&x}),
X=R.map(x=>(T(q(`.${M}-timestamp`,x))+' '+T(q(`.${M}-text`,x))).trim()).filter(Boolean).join('\n')
await S(300);q(G+w+'[aria-label*="Close"]')?.[k]();q(E+'collapse')?.[k]()
const l='createElement',C=d[l]('dialog'),B=d[l](w),Y=d[l]('style'),g='0 0 ',b='background',e='border',
i='infinite',x='transform',K='@keyframes ',j=`box-shadow:${g}10px #fffe,${g}25px `,u='#f0c',v='#0cf',
n='#0f6',m='#fc0',A='COPY FULL TRANSCRIPT — ',o=`${u},${v} 25%,${n} 50%,${m} 75%,${u}`,
H=(A,B,C)=>`${j}${A},${g}55px ${B},${g}95px ${C}`;let z=30
C[s][c]=`inset:24px 24px auto auto;margin:0;padding:0;${e}:0;${b}:0;overflow:visible`;B[t]=A+z+'s'
B[s][c]=`padding:16px 24px;${e}:2px solid #fff;border-radius:999px;${b}:linear-gradient(90deg,${o});
background-size:200% 100%;color:#fff;text-shadow:0 2px 4px #000d,${g}8px #0009,${g}14px #0007;font-size:15px;
font-weight:900;cursor:pointer;${H('#f0ce','#33fd','#0fcc')};animation:p 1.2s ease-in-out ${i} alternate,g 4s linear ${i},
r 5s linear ${i};transition:opacity 1s linear,${x} .2s ease`;Y[t]=`::backdrop{${b}:0}
${K}p{from{${x}:scale(1);filter:brightness(1)}to{${x}:scale(1.06);filter:brightness(1.25)}}
${K}g{from{background-position:0 50%}to{background-position:-200% 50%}}
${K}r{0%,100%{${H('#f0ce','#33fd','#0fcc')}}33%{${H('#0fce','#fc0d','#f0cc')}}66%{${H('#33fe','#0fcd','#fc0c')}}}`
d.head[a](Y);C[a](B);d.documentElement[a](C);C.showModal();const U=()=>{clearInterval(I);C[r]();Y[r]()}
B.onclick=async()=>{await N.clipboard.writeText(X);U()}
const I=setInterval(()=>{B[t]=A+--z+'s';z<=5&&(B[s].opacity=Math.max(.25,z/5));z<1&&U()},1e3);return X})()