import{O as n,C as u,i as g,a as b}from"./constants-C5x5FgO0.js";import{p as y,f as w,r as R}from"./damage-CAgtM6K0.js";const i=document.querySelector("#context-menu"),S=new URL("./",window.location.href);let s,r=!1;function m(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function l(e){const t=e.metadata[u];return g(t)?t:{}}function o(e){return e===void 0||e===""?"—":m(String(e))}function f(){if(!s){i.innerHTML='<p class="loading">Select one character token.</p>';return}const e=l(s),t=(e.moves??"").split(/\r?\n/).map(a=>a.trim()).filter(Boolean);i.innerHTML=`
    <section class="panel">
      <div class="stats">
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
    </section>`;for(const a of i.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{E(Number(a.dataset.hp))});i.querySelector("#damage")?.addEventListener("click",C),i.querySelector("#edit")?.addEventListener("click",()=>{D()})}async function E(e){if(!(!s||r)){r=!0;for(const t of i.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await n.scene.items.getItems([s.id]))[0];if(!t)return;const a=l(t),c=a.hpCurrent??0,d=a.hpMax,h=d===void 0?c+e:Math.max(0,Math.min(d,c+e));await n.scene.items.updateItems([t],v=>{v[0].metadata[u]={...a,hpCurrent:h}})}finally{r=!1}}}function C(){if(!s)return;const e=l(s).damage?.trim();if(!e){n.notification.show("This creature has no damage expression.","WARNING");return}const t=y(e);if(!t){n.notification.show(`Unsupported damage expression: ${e}`,"ERROR");return}n.notification.show(w(e,R(t)),"SUCCESS")}async function D(){if(!s)return;const e=new URL(S);e.searchParams.set("itemId",s.id),await n.popover.open({id:b,url:e.toString(),height:620,width:390})}async function p(){const e=await n.player.getSelection();s=e?.length===1?(await n.scene.items.getItems([e[0]]))[0]:void 0,f()}n.isAvailable?n.onReady(async()=>{await p(),n.player.onChange(()=>{p()}),n.scene.items.onChange(e=>{if(!s)return;const t=e.find(a=>a.id===s.id);t&&(s=t,f())})}):i.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
