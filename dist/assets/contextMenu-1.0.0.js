import{g as c,O as s,C as l,i as h,h as w}from"./icons-1.0.0.js";import{p as T,f as $,r as S}from"./damage-1.0.0.js";function P(e,t){return Math.max(0,e+t)}function o(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function r(e){return e===void 0||e===""?"—":o(String(e))}function C(e){const t=e.damageDescription?.trim(),a=e.damageTags?.trim();return`
    <div class="summary-row tags-row">
      <button class="visibility-button" type="button" id="visibility" aria-label="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}" title="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}">
        ${c(e.visibleToPlayers===!1?"eye-off":"eye")}
      </button>
      <span class="descriptors">${r(e.tags)}</span>
    </div>
    <div class="summary-row combat-row">
      <span class="stat-group armor-stat">${c("shield")}<span>${r(e.armor)}</span></span>
      <button class="hp-button" type="button" data-hp="-1" aria-label="Decrease HP">−</button>
      <span class="hp-value">HP ${r(e.hpCurrent)}/${r(e.hpMax)}</span>
      <button class="hp-button" type="button" data-hp="1" aria-label="Increase HP">+</button>
    </div>
    <div class="summary-row damage-row">
      ${c("sword")}
      <button class="damage" type="button" id="damage" title="Roll damage">${r(e.damage)}</button>
      ${t?`<span class="damage-description">(${o(t)})</span>`:""}
      ${a?`<span class="descriptors">${o(a)}</span>`:""}
    </div>`}const i=document.querySelector("#context-menu"),E=new URL("./",window.location.href),g=new URLSearchParams(window.location.search),x=g.get("preview");let n,m=!1;function d(e){const t=e.metadata[l];return h(t)?t:{}}function u(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-primary",e.primary.main)}function p(){if(!n){i.innerHTML='<p class="loading">Select one character token.</p>';return}const e=d(n),t=(e.moves??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean);i.innerHTML=`
    <section class="panel">
      <div class="summary" aria-label="Creature summary">${C(e)}</div>
      <div class="details">
        <div class="line"><span class="label">Instinct:</span> ${r(e.instinct)}</div>
        <div class="line">
          <span class="label">Moves:</span>
          ${t.length?`<ul class="moves">${t.map(a=>`<li>${o(a)}</li>`).join("")}</ul>`:'<span class="empty">—</span>'}
        </div>
        <div class="line"><span class="label">Treasure:</span> ${r(e.treasure)}</div>
      </div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;for(const a of i.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{R(Number(a.dataset.hp))});i.querySelector("#damage")?.addEventListener("click",D),i.querySelector("#visibility")?.addEventListener("click",()=>{I()}),i.querySelector("#edit")?.addEventListener("click",()=>{H()})}async function R(e){if(!(!n||m)){m=!0;for(const t of i.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await s.scene.items.getItems([n.id]))[0];if(!t)return;const a=d(t),f=a.hpCurrent??0,b=P(f,e);await s.scene.items.updateItems([t],v=>{v[0].metadata[l]={...a,hpCurrent:b}})}finally{m=!1}}}async function I(){if(!n)return;const e=(await s.scene.items.getItems([n.id]))[0];if(!e)return;const t=d(e);await s.scene.items.updateItems([e],a=>{a[0].metadata[l]={...t,visibleToPlayers:t.visibleToPlayers===!1}})}function D(){if(!n)return;const e=d(n).damage?.trim();if(!e){s.notification.show("This creature has no damage expression.","WARNING");return}const t=T(e);if(!t){s.notification.show(`Unsupported damage expression: ${e}`,"ERROR");return}s.notification.show($(e,S(t)),"SUCCESS")}async function H(){if(!n)return;const e=new URL(E);e.searchParams.set("itemId",n.id),await s.popover.open({id:w,url:e.toString(),height:620,width:390})}async function y(){const e=await s.player.getSelection();n=e?.length===1?(await s.scene.items.getItems([e[0]]))[0]:void 0,p()}if(x==="context"){n={id:"preview",name:"Frogman",metadata:{[l]:{tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,hpCurrent:7,hpMax:10,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol",visibleToPlayers:!0}}};const e=g.get("theme")==="light";document.documentElement.dataset.obrTheme=e?"light":"dark",document.documentElement.style.setProperty("--dw-text",e?"#27272a":"#f4f4f5"),document.documentElement.style.setProperty("--dw-text-secondary",e?"#52525b":"#d4d4d8"),document.documentElement.style.setProperty("--dw-primary","#7c3aed"),p()}else s.isAvailable?s.onReady(async()=>{u(await s.theme.getTheme()),s.theme.onChange(u),await y(),s.player.onChange(()=>{y()}),s.scene.items.onChange(e=>{if(!n)return;const t=e.find(a=>a.id===n.id);t&&(n=t,p())})}):i.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
