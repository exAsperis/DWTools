import{j as u,O as s,k as h,C as g,i as w,p as T,l as E,r as S,m as C}from"./obrCharacterServices-1.1.4.js";function P(e,t){return Math.max(0,e+t)}function l(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function i(e){return e===void 0||e===""?"—":l(String(e))}function R(e){const t=e.damageDescription?.trim(),a=e.damageTags?.trim();return`
    <div class="summary-row tags-row">
      <button class="visibility-button" type="button" id="visibility" aria-label="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}" title="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}">
        ${u(e.visibleToPlayers===!1?"eye-off":"eye")}
      </button>
      <span class="descriptors">${i(e.tags)}</span>
    </div>
    <div class="summary-row combat-row">
      <span class="stat-group armor-stat">${u("shield")}<span>${i(e.armor)}</span></span>
      <button class="hp-button" type="button" data-hp="-1" aria-label="Decrease HP">−</button>
      <span class="hp-value">HP ${i(e.hpCurrent)}/${i(e.hpMax)}</span>
      <button class="hp-button" type="button" data-hp="1" aria-label="Increase HP">+</button>
    </div>
    <div class="summary-row damage-row">
      ${u("sword")}
      <button class="damage" type="button" id="damage" title="Roll damage">${i(e.damage)}</button>
      ${t?`<span class="damage-description">(${l(t)})</span>`:""}
      ${a?`<span class="descriptors">${l(a)}</span>`:""}
    </div>`}const r=document.querySelector("#context-menu"),$=new URL("./",window.location.href),v=new URLSearchParams(window.location.search),x=v.get("preview");let n,p=!1,o;function d(e){const t=e.metadata[g];return w(t)?t:{}}function m(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-primary",e.primary.main)}function c(){if(!n){r.innerHTML='<p class="loading">Select one character token.</p>';return}const e=d(n),t=(e.moves??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean);r.innerHTML=`
    <section class="panel">
      <div class="summary" aria-label="Creature summary">${R(e)}</div>
      <div class="details">
        <div class="line"><span class="label">Instinct:</span> ${i(e.instinct)}</div>
        <div class="line">
          <span class="label">Moves:</span>
          ${t.length?`<ul class="moves">${t.map(a=>`<li>${l(a)}</li>`).join("")}</ul>`:'<span class="empty">—</span>'}
        </div>
        <div class="line"><span class="label">Treasure:</span> ${i(e.treasure)}</div>
      </div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;for(const a of r.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{D(Number(a.dataset.hp))});r.querySelector("#damage")?.addEventListener("click",k),r.querySelector("#visibility")?.addEventListener("click",()=>{H()}),r.querySelector("#edit")?.addEventListener("click",()=>{L()})}async function D(e){if(!(!n||!o||p)){p=!0;for(const t of r.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await s.scene.items.getItems([n.id]))[0];if(!t)return;const f=d(t).hpCurrent??0,b=P(f,e);await o.updateCreatureFields(t.id,{hpCurrent:b})}catch(t){console.error("DWTools could not update creature HP",t),s.notification.show(t instanceof Error?t.message:"DWTools could not update creature HP.","ERROR")}finally{p=!1,c()}}}async function H(){if(!n||!o)return;const e=(await s.scene.items.getItems([n.id]))[0];if(!e)return;const t=d(e);try{await o.updateCreatureFields(e.id,{visibleToPlayers:t.visibleToPlayers===!1})}catch(a){console.error("DWTools could not update overlay visibility",a),s.notification.show(a instanceof Error?a.message:"DWTools could not update overlay visibility.","ERROR")}}function k(){if(!n)return;const e=d(n).damage?.trim();if(!e){s.notification.show("This creature has no damage expression.","WARNING");return}const t=T(e);if(!t){s.notification.show(`Unsupported damage expression: ${e}`,"ERROR");return}s.notification.show(E(e,S(t)),"SUCCESS")}async function L(){if(!n)return;const e=new URL($);e.searchParams.set("itemId",n.id),await s.popover.open({id:C,url:e.toString(),height:760,width:390})}async function y(){const e=await s.player.getSelection();n=e?.length===1?(await s.scene.items.getItems([e[0]]))[0]:void 0,c()}if(x==="context"){n={id:"preview",name:"Frogman",metadata:{[g]:{tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,hpCurrent:7,hpMax:10,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol",visibleToPlayers:!0}}};const e=v.get("theme")==="light";document.documentElement.dataset.obrTheme=e?"light":"dark",document.documentElement.style.setProperty("--dw-text",e?"#27272a":"#f4f4f5"),document.documentElement.style.setProperty("--dw-text-secondary",e?"#52525b":"#d4d4d8"),document.documentElement.style.setProperty("--dw-primary","#7c3aed"),c()}else s.isAvailable?s.onReady(async()=>{o=h(),m(await s.theme.getTheme()),s.theme.onChange(m),await y(),s.player.onChange(()=>{y()}),s.scene.items.onChange(e=>{if(!n)return;const t=e.find(a=>a.id===n.id);t&&(n=t,c())})}):r.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
