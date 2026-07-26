import{O as a,C as c,i as g,f as h}from"./constants-0.2.4.js";import{p as w,f as T,r as R}from"./damage-0.2.4.js";import{a as E}from"./icons-0.2.4.js";const n=document.querySelector("#context-menu"),P=new URL("./",window.location.href);let s,l=!1;function y(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function r(e){const t=e.metadata[c];return g(t)?t:{}}function o(e){return e===void 0||e===""?"—":y(String(e))}function u(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-primary",e.primary.main)}function f(){if(!s){n.innerHTML='<p class="loading">Select one character token.</p>';return}const e=r(s),t=(e.moves??"").split(/\r?\n/).map(i=>i.trim()).filter(Boolean);n.innerHTML=`
    <section class="panel">
      <div class="stats">
        <button class="visibility-button" type="button" id="visibility" aria-label="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}" title="${e.visibleToPlayers===!1?"Hidden from players":"Visible to players"}">
          ${E(e.visibleToPlayers===!1?"eye-off":"eye")}
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
          ${t.length?`<ul class="moves">${t.map(i=>`<li>${y(i)}</li>`).join("")}</ul>`:'<span class="empty">—</span>'}
        </div>
        <div class="line"><span class="label">Treasure:</span> ${o(e.treasure)}</div>
      </div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;for(const i of n.querySelectorAll("[data-hp]"))i.addEventListener("click",()=>{S(Number(i.dataset.hp))});n.querySelector("#damage")?.addEventListener("click",$),n.querySelector("#visibility")?.addEventListener("click",()=>{x()}),n.querySelector("#edit")?.addEventListener("click",()=>{C()})}async function S(e){if(!(!s||l)){l=!0;for(const t of n.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await a.scene.items.getItems([s.id]))[0];if(!t)return;const i=r(t),d=i.hpCurrent??0,p=i.hpMax,b=p===void 0?d+e:Math.max(0,Math.min(p,d+e));await a.scene.items.updateItems([t],v=>{v[0].metadata[c]={...i,hpCurrent:b}})}finally{l=!1}}}async function x(){if(!s)return;const e=(await a.scene.items.getItems([s.id]))[0];if(!e)return;const t=r(e);await a.scene.items.updateItems([e],i=>{i[0].metadata[c]={...t,visibleToPlayers:t.visibleToPlayers===!1}})}function $(){if(!s)return;const e=r(s).damage?.trim();if(!e){a.notification.show("This creature has no damage expression.","WARNING");return}const t=w(e);if(!t){a.notification.show(`Unsupported damage expression: ${e}`,"ERROR");return}a.notification.show(T(e,R(t)),"SUCCESS")}async function C(){if(!s)return;const e=new URL(P);e.searchParams.set("itemId",s.id),await a.popover.open({id:h,url:e.toString(),height:620,width:390})}async function m(){const e=await a.player.getSelection();s=e?.length===1?(await a.scene.items.getItems([e[0]]))[0]:void 0,f()}a.isAvailable?a.onReady(async()=>{u(await a.theme.getTheme()),a.theme.onChange(u),await m(),a.player.onChange(()=>{m()}),a.scene.items.onChange(e=>{if(!s)return;const t=e.find(i=>i.id===s.id);t&&(s=t,f())})}):n.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
