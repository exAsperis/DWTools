import{O as l,C as m,f as u,i as w}from"./constants-0.3.1.js";function p(e,t){const r=String(e.get(t)??"").trim();if(!r)return;const a=Number(r);return Number.isFinite(a)?Math.trunc(a):void 0}function i(e,t){return String(e.get(t)??"").trim()||void 0}function x(e,t,r){const a=r?{...t}:{};return a.hpCurrent=p(e,"hpCurrent"),a.hpMax=p(e,"hpMax"),r||(a.tags=i(e,"tags"),a.armor=p(e,"armor"),a.damage=i(e,"damage"),a.damageDescription=i(e,"damageDescription"),a.damageTags=i(e,"damageTags"),a.instinct=i(e,"instinct"),a.moves=i(e,"moves"),a.treasure=i(e,"treasure"),a.visibleToPlayers=e.get("visibleToPlayers")==="on"),a}const c=document.querySelector("#app"),d=new URLSearchParams(window.location.search),v=d.get("itemId"),T=d.get("view")??"edit",f=d.get("preview");function s(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function o(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function C(){c.innerHTML=`
    <section class="home">
      <div class="crest">DW</div>
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
    </section>`}function h(e,t){const r=T==="hp";c.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${s(e.name||"Unnamed token")}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${r?`
        <div class="hp-row">
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${o(t.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${o(t.hpMax)}"></label>
        </div>
        <div class="quick-hp" aria-label="Quick HP adjustment">
          ${[-5,-1,1,5].map(n=>`<button type="button" data-hp="${n}">${n>0?"+":""}${n}</button>`).join("")}
        </div>
      `:`
        <label>Tags<input name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${s(t.tags??"")}"></label>
        <div class="vitals-row">
          <label>Armor<input name="armor" type="number" step="1" value="${o(t.armor)}"></label>
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${o(t.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${o(t.hpMax)}"></label>
        </div>
        <div class="damage-fields">
          <label>Damage<input name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${s(t.damage??"")}"></label>
          <label>Description<input name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${s(t.damageDescription??"")}"></label>
        </div>
        <label>Damage tags<input name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${s(t.damageTags??"")}"></label>
        <label>Instinct<textarea name="instinct" rows="2">${s(t.instinct??"")}</textarea></label>
        <label>Moves<textarea name="moves" rows="4" placeholder="One move per line">${s(t.moves??"")}</textarea></label>
        <label>Treasure<textarea name="treasure" rows="3">${s(t.treasure??"")}</textarea></label>
        <label class="visibility">
          <input name="visibleToPlayers" type="checkbox" ${t.visibleToPlayers===!1?"":"checked"}>
          Show the token overlay to players
        </label>
      `}
      <footer>
        ${r?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit">Save</button>
      </footer>
    </form>`;const a=document.querySelector("#creature-form"),b=a.elements.namedItem("hpCurrent");for(const n of a.querySelectorAll("[data-hp]"))n.addEventListener("click",()=>{b.value=String((Number(b.value)||0)+Number(n.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{l.popover.close(u)}),document.querySelector("#remove")?.addEventListener("click",async()=>{await l.scene.items.updateItems([e],n=>{delete n[0].metadata[m]}),await l.popover.close(u)}),a.addEventListener("submit",async n=>{n.preventDefault();const g=x(new FormData(a),t,r);await l.scene.items.updateItems([e],y=>{y[0].metadata[m]=g}),await l.popover.close(u)})}f==="editor"?h({id:"preview",name:"Frogman",metadata:{}},{hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"}):v?l.isAvailable?l.onReady(async()=>{const e=(await l.scene.items.getItems([v]))[0];if(!e){c.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}const t=e.metadata[m];h(e,w(t)?t:{})}):c.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':C();
