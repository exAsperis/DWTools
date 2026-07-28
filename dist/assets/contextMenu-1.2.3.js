import{m as y,n as f,t as h,p as C,O as r,h as E,j as S,q as P,r as b,C as T,i as x,u as L,v as D,w as k,E as H}from"./obrMetadataMigration-1.2.3.js";function I(e,t){return Math.max(0,e+t)}function u(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function i(e){return e===void 0||e===""?"—":u(String(e))}function O(e,t){const a=e.damageDescription?.trim(),d=e.damageTags?.trim();return`
    <div class="summary-row tags-row">
      <button class="visibility-button" type="button" id="visibility" aria-label="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}" title="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}">
        ${y(e.visibleToPlayers===!1?"eye-off":"eye")}
      </button>
      <span class="descriptors">${i(e.tags)}</span>
    </div>
    <div class="summary-row combat-row">
      <span class="stat-group armor-stat">${y("shield")}<span>${i(e.armor)}</span></span>
      <button class="hp-button" type="button" data-hp="-1" aria-label="Decrease HP">−</button>
      <span class="hp-value">HP ${i(e.hpCurrent)}/${i(e.hpMax)}</span>
      <button class="hp-button" type="button" data-hp="1" aria-label="Increase HP">+</button>
    </div>
    <div class="summary-row damage-row">
      ${y("sword")}
      <button class="damage" type="button" id="damage" title="Roll damage">${i(e.damage)}</button>
      ${a?`<span class="damage-description">(${u(a)})</span>`:""}
      ${d?`<span class="descriptors">${u(d)}</span>`:""}
    </div>
    ${t?`<div class="summary-row load-row ${f(h(t.inventory),t.maxLoad)?"load-warning":""}">
          ${C(t.inventory,t.maxLoad)}
          ${f(h(t.inventory),t.maxLoad)?"<strong>Overloaded</strong>":""}
        </div>`:""}`}const o=document.querySelector("#context-menu"),M=new URL("./",window.location.href),R=new URLSearchParams(window.location.search),q=R.get("preview");let s,v=!1,l,n,p;function m(e){const t=e.metadata[T];return x(t)?t:{}}function w(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-primary",e.primary.main)}function g(){if(!s){o.innerHTML='<p class="loading">Select one character token.</p>';return}const e=m(s),t=(e.moves??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean);o.innerHTML=`
    <section class="panel">
      <div class="summary" aria-label="Creature summary">${O(e,p)}</div>
      <div class="details">
        <div class="line"><span class="label">Instinct:</span> ${i(e.instinct)}</div>
        <div class="line">
          <span class="label">Moves:</span>
          ${t.length?`<ul class="moves">${t.map(a=>`<li>${u(a)}</li>`).join("")}</ul>`:'<span class="empty">—</span>'}
        </div>
        <div class="line"><span class="label">Treasure:</span> ${i(e.treasure)}</div>
      </div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;for(const a of o.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{A(Number(a.dataset.hp))});o.querySelector("#damage")?.addEventListener("click",U),o.querySelector("#visibility")?.addEventListener("click",()=>{W()}),o.querySelector("#edit")?.addEventListener("click",()=>{B()})}async function A(e){if(!(!s||!l||v)){v=!0;for(const t of o.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await r.scene.items.getItems([s.id]))[0];if(!t)return;const d=m(t).hpCurrent??0,$=I(d,e);await l.updateCreatureFields(t.id,{hpCurrent:$})}catch(t){console.error("DWTools could not update creature HP",t),r.notification.show(t instanceof Error?t.message:"DWTools could not update creature HP.","ERROR")}finally{v=!1,g()}}}async function W(){if(!s||!l)return;const e=(await r.scene.items.getItems([s.id]))[0];if(!e)return;const t=m(e);try{await l.updateCreatureFields(e.id,{visibleToPlayers:t.visibleToPlayers===!1})}catch(a){console.error("DWTools could not update overlay visibility",a),r.notification.show(a instanceof Error?a.message:"DWTools could not update overlay visibility.","ERROR")}}function U(){if(!s)return;const e=m(s).damage?.trim();if(!e){r.notification.show("This creature has no damage expression.","WARNING");return}const t=L(e);if(!t){r.notification.show(`Unsupported damage expression: ${e}`,"ERROR");return}r.notification.show(D(e,k(t)),"SUCCESS")}async function B(){if(!s)return;const e=new URL(M);e.searchParams.set("itemId",s.id),await r.popover.open({id:H,url:e.toString(),height:760,width:390})}async function c(){const e=await r.player.getSelection();s=e?.length===1?(await r.scene.items.getItems([e[0]]))[0]:void 0,p=void 0;const t=s&&b(s);if(t&&n){const a=await n.inspect(t.characterId);p=a.status==="active"?a.record:void 0}g()}if(q==="context"){s={id:"preview",name:"Frogman",metadata:{[T]:{tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,hpCurrent:7,hpMax:10,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol",visibleToPlayers:!0}}},p={schemaVersion:2,id:"preview-character",fields:{name:"Frogman"},inventory:[["Coin",.01,137],["Bag of Books",.4,3]],maxLoad:11,revision:1,createdAt:"2026-07-27T12:00:00.000Z",createdBy:"preview",updatedAt:"2026-07-27T12:00:00.000Z",updatedBy:"preview",writeId:"preview-write"};const e=R.get("theme")==="light";document.documentElement.dataset.obrTheme=e?"light":"dark",document.documentElement.style.setProperty("--dw-text",e?"#27272a":"#f4f4f5"),document.documentElement.style.setProperty("--dw-text-secondary",e?"#52525b":"#d4d4d8"),document.documentElement.style.setProperty("--dw-primary","#7c3aed"),g()}else r.isAvailable?r.onReady(async()=>{try{await E()}catch(e){console.error("DWTools metadata namespace migration failed",e),o.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',await r.notification.show("DWTools could not migrate its saved data.","ERROR");return}n=S(),l=P(n),w(await r.theme.getTheme()),r.theme.onChange(w),await c(),r.player.onChange(()=>{c()}),r.scene.items.onChange(e=>{if(!s)return;const t=e.find(a=>a.id===s.id);t&&(s=t,c())}),n.subscribe(e=>{const t=s&&b(s);t&&e.some(a=>a.characterId===t.characterId)&&c()})}):o.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
