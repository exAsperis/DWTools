import{O as i,C as b,f as u,i as w}from"./constants-0.2.4.js";import{p as x,f as T,r as k}from"./damage-0.2.4.js";const m=document.querySelector("#app"),v=new URLSearchParams(window.location.search),g=v.get("itemId"),M=v.get("view")??"edit",S=v.get("preview");function l(t){return t.replace(/[&<>'"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[e])}function d(t){return typeof t=="number"&&Number.isFinite(t)?String(t):""}function p(t,e){const s=String(t.get(e)??"").trim();if(!s)return;const o=Number(s);return Number.isFinite(o)?Math.trunc(o):void 0}function c(t,e){return String(t.get(e)??"").trim()||void 0}function $(){m.innerHTML=`
    <section class="home">
      <div class="crest">DW</div>
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
    </section>`}function y(t,e){const s=M==="hp";m.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${l(t.name||"Unnamed token")}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      <div class="hp-row">
        <label>Current HP<input name="hpCurrent" type="number" step="1" value="${d(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${d(e.hpMax)}"></label>
      </div>
      <div class="quick-hp" aria-label="Quick HP adjustment">
        ${[-5,-1,1,5].map(a=>`<button type="button" data-hp="${a}">${a>0?"+":""}${a}</button>`).join("")}
      </div>
      ${s?"":`
        <div class="two-column">
          <label>Armor<input name="armor" type="number" step="1" value="${d(e.armor)}"></label>
          <label>Damage<input name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${l(e.damage??"")}"></label>
        </div>
        <button class="secondary roll" type="button" id="roll">Roll damage</button>
        <label>Instinct<textarea name="instinct" rows="2">${l(e.instinct??"")}</textarea></label>
        <label>Moves<textarea name="moves" rows="4" placeholder="One move per line">${l(e.moves??"")}</textarea></label>
        <label>Treasure<textarea name="treasure" rows="3">${l(e.treasure??"")}</textarea></label>
        <label class="visibility">
          <input name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
          Show the token overlay to players
        </label>
      `}
      <p id="message" class="message" role="status"></p>
      <footer>
        ${s?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit">Save</button>
      </footer>
    </form>`;const o=document.querySelector("#creature-form"),h=o.elements.namedItem("hpCurrent");for(const a of o.querySelectorAll("[data-hp]"))a.addEventListener("click",()=>{h.value=String((Number(h.value)||0)+Number(a.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{i.popover.close(u)}),document.querySelector("#roll")?.addEventListener("click",()=>{const a=o.elements.namedItem("damage").value.trim(),r=x(a),n=document.querySelector("#message");n.textContent=r?T(a,k(r)):"Use d6, 2d6+1, b[2d6], or w[2d8]-1."}),document.querySelector("#remove")?.addEventListener("click",async()=>{await i.scene.items.updateItems([t],a=>{delete a[0].metadata[b]}),await i.popover.close(u)}),o.addEventListener("submit",async a=>{a.preventDefault();const r=new FormData(o),n=s?{...e}:{};n.hpCurrent=p(r,"hpCurrent"),n.hpMax=p(r,"hpMax"),s||(n.armor=p(r,"armor"),n.damage=c(r,"damage"),n.instinct=c(r,"instinct"),n.moves=c(r,"moves"),n.treasure=c(r,"treasure"),n.visibleToPlayers=r.get("visibleToPlayers")==="on"),await i.scene.items.updateItems([t],f=>{f[0].metadata[b]=n}),await i.popover.close(u)})}S==="editor"?y({id:"preview",name:"Frogman",metadata:{}},{hpCurrent:7,hpMax:10,armor:1,damage:"b[2d6]+1",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"}):g?i.isAvailable?i.onReady(async()=>{const t=(await i.scene.items.getItems([g]))[0];if(!t){m.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}const e=t.metadata[b];y(t,w(e)?e:{})}):m.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':$();
