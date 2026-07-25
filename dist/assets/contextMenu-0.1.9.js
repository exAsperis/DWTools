import{O as i,C as c,i as y,a as g}from"./constants-0.1.9.js";import{p as h,f as w,r as R}from"./damage-0.1.9.js";const s=document.querySelector("#context-menu"),S=new URL("./",window.location.href);let n,l=!1;function m(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function r(e){const t=e.metadata[c];return y(t)?t:{}}function o(e){return e===void 0||e===""?"—":m(String(e))}function f(){if(!n){s.innerHTML='<p class="loading">Select one character token.</p>';return}const e=r(n),t=(e.moves??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean);s.innerHTML=`
    <section class="panel">
      <div class="stats">
        <button class="visibility-button" type="button" id="visibility" title="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}">
          ${e.visibleToPlayers===!1?"⊘":"👁"}
        </button>
        <span>ARM ${o(e.armor)}</span>
        <button class="damage" type="button" id="damage" title="Roll damage">DMG ${o(e.damage)}</button>
      </div>
      <div class="hp" aria-label="Hit points">
        <button type="button" data-hp="-1" aria-label="Decrease HP">−</button>
        <span class="hp-value">HP ${o(e.hpCurrent)}/${o(e.hpMax)}</span>
        <button type="button" data-hp="1" aria-label="Increase HP">+</button>
      </div>
      <div class="details">
        <div class="line"><span class="label">Instinct:</span> ${o(e.instinct)}</div>
        <div class="line">
          <span class="label">Moves:</span>
          ${t.length?`<ul class="moves">${t.map(a=>`<li>${m(a)}</li>`).join("")}</ul>`:'<span class="empty">—</span>'}
        </div>
        <div class="line"><span class="label">Treasure:</span> ${o(e.treasure)}</div>
      </div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;for(const a of s.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{E(Number(a.dataset.hp))});s.querySelector("#damage")?.addEventListener("click",$),s.querySelector("#visibility")?.addEventListener("click",()=>{T()}),s.querySelector("#edit")?.addEventListener("click",()=>{H()})}async function E(e){if(!(!n||l)){l=!0;for(const t of s.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await i.scene.items.getItems([n.id]))[0];if(!t)return;const a=r(t),d=a.hpCurrent??0,u=a.hpMax,v=u===void 0?d+e:Math.max(0,Math.min(u,d+e));await i.scene.items.updateItems([t],b=>{b[0].metadata[c]={...a,hpCurrent:v}})}finally{l=!1}}}async function T(){if(!n)return;const e=(await i.scene.items.getItems([n.id]))[0];if(!e)return;const t=r(e);await i.scene.items.updateItems([e],a=>{a[0].metadata[c]={...t,visibleToPlayers:t.visibleToPlayers===!1}})}function $(){if(!n)return;const e=r(n).damage?.trim();if(!e){i.notification.show("This creature has no damage expression.","WARNING");return}const t=h(e);if(!t){i.notification.show(`Unsupported damage expression: ${e}`,"ERROR");return}i.notification.show(w(e,R(t)),"SUCCESS")}async function H(){if(!n)return;const e=new URL(S);e.searchParams.set("itemId",n.id),await i.popover.open({id:g,url:e.toString(),height:620,width:390})}async function p(){const e=await i.player.getSelection();n=e?.length===1?(await i.scene.items.getItems([e[0]]))[0]:void 0,f()}i.isAvailable?i.onReady(async()=>{await p(),i.player.onChange(()=>{p()}),i.scene.items.onChange(e=>{if(!n)return;const t=e.find(a=>a.id===n.id);t&&(n=t,f())})}):s.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
