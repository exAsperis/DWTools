import{i as C,j as b,g as S,O as i,C as y,h}from"./icons-0.4.0.js";function g(e,t){const n=String(e.get(t)??"").trim();if(!n)return;const a=Number(n);return Number.isFinite(a)?Math.trunc(a):void 0}function s(e,t){return String(e.get(t)??"").trim()||void 0}function R(e,t,n){const a=n?{...t}:{};return a.hpCurrent=g(e,"hpCurrent"),a.hpMax=g(e,"hpMax"),n||(a.tags=s(e,"tags"),a.armor=g(e,"armor"),a.damage=s(e,"damage"),a.damageDescription=s(e,"damageDescription"),a.damageTags=s(e,"damageTags"),a.instinct=s(e,"instinct"),a.moves=s(e,"moves"),a.treasure=s(e,"treasure"),a.visibleToPlayers=e.get("visibleToPlayers")==="on"),a}function f(e){const t=e[b];return typeof t=="boolean"?t:!0}function P(e,t){return C(e)?e:{visibleToPlayers:t}}async function k(e,t){await e({[b]:t})}function E(e,t,n){const a=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="crest">DW</div>
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      ${e==="GM"?`
        <div class="default-visibility">
          <span>Default character overlay visibility:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${a}" title="${a}" ${n?"disabled":""}>
            ${S(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>
      `:""}
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
    </section>`}const p=document.querySelector("#app"),v=new URLSearchParams(window.location.search),D=v.get("itemId"),I=v.get("view")??"edit",M=v.get("preview");function r(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function c(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}let d="PLAYER",o={},m=!1;function u(){const e=f(o);p.innerHTML=E(d,e,m),document.querySelector("#default-visibility")?.addEventListener("click",()=>{H()})}async function H(){if(d!=="GM"||m)return;const e=!f(o);m=!0,u();try{await k(t=>i.room.setMetadata(t),e),o={...o,[b]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),i.notification.show("DWTools could not save the default overlay visibility.","ERROR")}finally{m=!1,u()}}async function L(){[d,o]=await Promise.all([i.player.getRole(),i.room.getMetadata()]),u(),i.room.onMetadataChange(e=>{o=e,u()}),i.player.onChange(e=>{d=e.role,u()})}function T(e,t){const n=I==="hp";p.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${r(e.name||"Unnamed token")}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${n?`
        <div class="hp-row">
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${c(t.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${c(t.hpMax)}"></label>
        </div>
        <div class="quick-hp" aria-label="Quick HP adjustment">
          ${[-5,-1,1,5].map(l=>`<button type="button" data-hp="${l}">${l>0?"+":""}${l}</button>`).join("")}
        </div>
      `:`
        <label>Tags<input name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${r(t.tags??"")}"></label>
        <div class="vitals-row">
          <label>Armor<input name="armor" type="number" step="1" value="${c(t.armor)}"></label>
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${c(t.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${c(t.hpMax)}"></label>
        </div>
        <div class="damage-fields">
          <label>Damage<input name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${r(t.damage??"")}"></label>
          <label>Description<input name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${r(t.damageDescription??"")}"></label>
        </div>
        <label>Damage tags<input name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${r(t.damageTags??"")}"></label>
        <label>Instinct<textarea name="instinct" rows="2">${r(t.instinct??"")}</textarea></label>
        <label>Moves<textarea name="moves" rows="4" placeholder="One move per line">${r(t.moves??"")}</textarea></label>
        <label>Treasure<textarea name="treasure" rows="3">${r(t.treasure??"")}</textarea></label>
        <label class="visibility">
          <input name="visibleToPlayers" type="checkbox" ${t.visibleToPlayers===!1?"":"checked"}>
          Show the token overlay to players
        </label>
      `}
      <footer>
        ${n?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit">Save</button>
      </footer>
    </form>`;const a=document.querySelector("#creature-form"),w=a.elements.namedItem("hpCurrent");for(const l of a.querySelectorAll("[data-hp]"))l.addEventListener("click",()=>{w.value=String((Number(w.value)||0)+Number(l.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{i.popover.close(h)}),document.querySelector("#remove")?.addEventListener("click",async()=>{await i.scene.items.updateItems([e],l=>{delete l[0].metadata[y]}),await i.popover.close(h)}),a.addEventListener("submit",async l=>{l.preventDefault();const x=R(new FormData(a),t,n);await i.scene.items.updateItems([e],$=>{$[0].metadata[y]=x}),await i.popover.close(h)})}M==="home"?(d="GM",o={[b]:v.get("default")!=="hidden"},u()):M==="editor"?T({id:"preview",name:"Frogman",metadata:{}},{hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"}):D?i.isAvailable?i.onReady(async()=>{const[e,t]=await Promise.all([i.scene.items.getItems([D]).then(a=>a[0]),i.room.getMetadata().catch(a=>(console.warn("DWTools could not load room visibility settings",a),{}))]);if(!e){p.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}const n=e.metadata[y];T(e,P(n,f(t)))}):p.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(u(),i.isAvailable&&i.onReady(()=>{L()}));
