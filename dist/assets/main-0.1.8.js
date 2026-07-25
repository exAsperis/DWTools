import{O as n,C as b,a as d,E as T,i as I}from"./constants-0.1.8.js";import{p as M,f as S,r as $}from"./damage-0.1.8.js";import{a as y}from"./display-0.1.8.js";const c=document.querySelector("#app"),v=new URLSearchParams(window.location.search),f=v.get("itemId"),D=v.get("view")??"edit",C=v.get("preview");function l(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function u(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function p(e,t){const o=String(e.get(t)??"").trim();if(!o)return;const i=Number(o);return Number.isFinite(i)?Math.trunc(i):void 0}function m(e,t){return String(e.get(t)??"").trim()||void 0}function E(){c.innerHTML=`
    <section class="home">
      <div class="crest">DW</div>
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
    </section>`}function w(e,t){const o=D==="hp";c.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${l(e.name||"Unnamed token")}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      <div class="hp-row">
        <label>Current HP<input name="hpCurrent" type="number" step="1" value="${u(t.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${u(t.hpMax)}"></label>
      </div>
      <div class="quick-hp" aria-label="Quick HP adjustment">
        ${[-5,-1,1,5].map(a=>`<button type="button" data-hp="${a}">${a>0?"+":""}${a}</button>`).join("")}
      </div>
      ${o?"":`
        <div class="two-column">
          <label>Armor<input name="armor" type="number" step="1" value="${u(t.armor)}"></label>
          <label>Damage<input name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${l(t.damage??"")}"></label>
        </div>
        <button class="secondary roll" type="button" id="roll">Roll damage</button>
        <label>Instinct<textarea name="instinct" rows="2">${l(t.instinct??"")}</textarea></label>
        <label>Moves<textarea name="moves" rows="4" placeholder="One move per line">${l(t.moves??"")}</textarea></label>
        <label>Treasure<textarea name="treasure" rows="3">${l(t.treasure??"")}</textarea></label>
        <label class="visibility">
          <input name="visibleToPlayers" type="checkbox" ${t.visibleToPlayers===!1?"":"checked"}>
          Show the token overlay to players
        </label>
      `}
      <p id="message" class="message" role="status"></p>
      <footer>
        ${o?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit">Save</button>
      </footer>
    </form>`;const i=document.querySelector("#creature-form"),h=i.elements.namedItem("hpCurrent");for(const a of i.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{h.value=String((Number(h.value)||0)+Number(a.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{n.popover.close(d)}),document.querySelector("#roll")?.addEventListener("click",()=>{const a=i.elements.namedItem("damage").value.trim(),r=M(a),s=document.querySelector("#message");s.textContent=r?S(a,$(r)):"Use d6, 2d6+1, b[2d6], or w[2d8]-1."}),document.querySelector("#remove")?.addEventListener("click",async()=>{await n.scene.items.updateItems([e],r=>{delete r[0].metadata[b]});const a=(await n.scene.items.getItems([e.id]))[0];a&&await y(a),await n.popover.close(d)}),i.addEventListener("submit",async a=>{a.preventDefault();const r=new FormData(i),s=o?{...t}:{};s.hpCurrent=p(r,"hpCurrent"),s.hpMax=p(r,"hpMax"),o||(s.armor=p(r,"armor"),s.damage=m(r,"damage"),s.instinct=m(r,"instinct"),s.moves=m(r,"moves"),s.treasure=m(r,"treasure"),s.visibleToPlayers=r.get("visibleToPlayers")==="on"),await n.scene.items.updateItems([e],x=>{x[0].metadata[b]=s});const g=(await n.scene.items.getItems([e.id]))[0];g&&await y(g),window.parent.postMessage({type:`${T}/sync`,itemId:e.id},"*"),await n.popover.close(d)})}C==="editor"?w({id:"preview",name:"Frogman",metadata:{}},{hpCurrent:7,hpMax:10,armor:1,damage:"b[2d6]+1",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"}):f?n.isAvailable?n.onReady(async()=>{const e=(await n.scene.items.getItems([f]))[0];if(!e){c.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}const t=e.metadata[b];w(e,I(t)?t:{})}):c.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':E();
