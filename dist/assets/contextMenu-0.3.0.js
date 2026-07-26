import{O as s,C as u,i as $,f as T}from"./constants-0.3.0.js";import{a as f}from"./icons-0.3.0.js";const S=/^(?:(\d+))?d(\d+)([+-]\d+)?$/i,C=/^([bw])\[(\d+)d(\d+)\]([+-]\d+)?$/i;function E(e){const t=e.replace(/\s+/g,"");let a=t.match(C);if(a){const d=Number(a[2]),c=Number(a[3]);return g(d,c)?{mode:a[1].toLowerCase()==="b"?"best":"worst",count:d,sides:c,modifier:Number(a[4]??0)}:null}if(a=t.match(S),!a)return null;const i=Number(a[1]??1),r=Number(a[2]);return g(i,r)?{mode:"sum",count:i,sides:r,modifier:Number(a[3]??0)}:null}function g(e,t){return Number.isInteger(e)&&e>=1&&e<=100&&Number.isInteger(t)&&t>=2&&t<=1e3}function P(e,t=Math.random){const a=Array.from({length:e.count},()=>Math.floor(t()*e.sides)+1),i=e.mode==="best"?Math.max(...a):e.mode==="worst"?Math.min(...a):a.reduce((r,d)=>r+d,0);return{...e,rolls:a,subtotal:i,total:i+e.modifier}}function R(e,t){const a=t.mode==="sum"?"sum":t.mode,i=t.modifier===0?"":` ${t.modifier>0?"+":"−"} ${Math.abs(t.modifier)}`;return`${e}: [${t.rolls.join(", ")}] ${a}${i} = ${t.total}`}function m(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function l(e){return e===void 0||e===""?"—":m(String(e))}function M(e){const t=e.damageDescription?.trim(),a=e.damageTags?.trim();return`
    <div class="summary-row tags-row">
      <button class="visibility-button" type="button" id="visibility" aria-label="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}" title="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}">
        ${f(e.visibleToPlayers===!1?"eye-off":"eye")}
      </button>
      <span class="descriptors">${l(e.tags)}</span>
    </div>
    <div class="summary-row combat-row">
      <span class="stat-group armor-stat">${f("shield")}<span>${l(e.armor)}</span></span>
      <button class="hp-button" type="button" data-hp="-1" aria-label="Decrease HP">−</button>
      <span class="hp-value">HP ${l(e.hpCurrent)}/${l(e.hpMax)}</span>
      <button class="hp-button" type="button" data-hp="1" aria-label="Increase HP">+</button>
    </div>
    <div class="summary-row damage-row">
      ${f("sword")}
      <button class="damage" type="button" id="damage" title="Roll damage">${l(e.damage)}</button>
      ${t?`<span class="damage-description">(${m(t)})</span>`:""}
      ${a?`<span class="descriptors">${m(a)}</span>`:""}
    </div>`}const o=document.querySelector("#context-menu"),D=new URL("./",window.location.href),w=new URLSearchParams(window.location.search),I=w.get("preview");let n,y=!1;function p(e){const t=e.metadata[u];return $(t)?t:{}}function h(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-primary",e.primary.main)}function b(){if(!n){o.innerHTML='<p class="loading">Select one character token.</p>';return}const e=p(n),t=(e.moves??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean);o.innerHTML=`
    <section class="panel">
      <div class="summary" aria-label="Creature summary">${M(e)}</div>
      <div class="details">
        <div class="line"><span class="label">Instinct:</span> ${l(e.instinct)}</div>
        <div class="line">
          <span class="label">Moves:</span>
          ${t.length?`<ul class="moves">${t.map(a=>`<li>${m(a)}</li>`).join("")}</ul>`:'<span class="empty">—</span>'}
        </div>
        <div class="line"><span class="label">Treasure:</span> ${l(e.treasure)}</div>
      </div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;for(const a of o.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{x(Number(a.dataset.hp))});o.querySelector("#damage")?.addEventListener("click",N),o.querySelector("#visibility")?.addEventListener("click",()=>{L()}),o.querySelector("#edit")?.addEventListener("click",()=>{k()})}async function x(e){if(!(!n||y)){y=!0;for(const t of o.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await s.scene.items.getItems([n.id]))[0];if(!t)return;const a=p(t),i=a.hpCurrent??0,r=a.hpMax,d=r===void 0?i+e:Math.max(0,Math.min(r,i+e));await s.scene.items.updateItems([t],c=>{c[0].metadata[u]={...a,hpCurrent:d}})}finally{y=!1}}}async function L(){if(!n)return;const e=(await s.scene.items.getItems([n.id]))[0];if(!e)return;const t=p(e);await s.scene.items.updateItems([e],a=>{a[0].metadata[u]={...t,visibleToPlayers:t.visibleToPlayers===!1}})}function N(){if(!n)return;const e=p(n).damage?.trim();if(!e){s.notification.show("This creature has no damage expression.","WARNING");return}const t=E(e);if(!t){s.notification.show(`Unsupported damage expression: ${e}`,"ERROR");return}s.notification.show(R(e,P(t)),"SUCCESS")}async function k(){if(!n)return;const e=new URL(D);e.searchParams.set("itemId",n.id),await s.popover.open({id:T,url:e.toString(),height:620,width:390})}async function v(){const e=await s.player.getSelection();n=e?.length===1?(await s.scene.items.getItems([e[0]]))[0]:void 0,b()}if(I==="context"){n={id:"preview",name:"Frogman",metadata:{[u]:{tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,hpCurrent:7,hpMax:10,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol",visibleToPlayers:!0}}};const e=w.get("theme")==="light";document.documentElement.dataset.obrTheme=e?"light":"dark",document.documentElement.style.setProperty("--dw-text",e?"#27272a":"#f4f4f5"),document.documentElement.style.setProperty("--dw-text-secondary",e?"#52525b":"#d4d4d8"),document.documentElement.style.setProperty("--dw-primary","#7c3aed"),b()}else s.isAvailable?s.onReady(async()=>{h(await s.theme.getTheme()),s.theme.onChange(h),await v(),s.player.onChange(()=>{v()}),s.scene.items.onChange(e=>{if(!n)return;const t=e.find(a=>a.id===n.id);t&&(n=t,b())})}):o.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
