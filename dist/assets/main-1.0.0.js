import{i as S,j as g,g as E,O as n,C as M,h as y}from"./icons-1.0.0.js";import{n as L,i as R}from"./damage-1.0.0.js";function P(e,t){if(t.trim()!==""||e.trim()==="")return null;const i=Number(e);return Number.isFinite(i)&&i>=0?e.trim():null}function f(e,t){const i=String(e.get(t)??"").trim();if(!i)return;const a=Number(i);return Number.isFinite(a)?Math.trunc(a):void 0}function o(e,t){return String(e.get(t)??"").trim()||void 0}function k(e,t,i){const a=i?{...t}:{};return a.hpCurrent=f(e,"hpCurrent"),a.hpMax=f(e,"hpMax"),i||(a.tags=o(e,"tags"),a.armor=f(e,"armor"),a.damage=o(e,"damage"),a.damageDescription=o(e,"damageDescription"),a.damageTags=o(e,"damageTags"),a.instinct=o(e,"instinct"),a.moves=o(e,"moves"),a.treasure=o(e,"treasure"),a.visibleToPlayers=e.get("visibleToPlayers")==="on"),a}function w(e){const t=e[g];return typeof t=="boolean"?t:!0}function H(e,t){return S(e)?e:{visibleToPlayers:t}}async function A(e,t){await e({[g]:t})}function O(e,t,i){const a=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      ${e==="GM"?`
        <div class="default-visibility">
          <span>Default character overlay visibility:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${a}" title="${a}" ${i?"disabled":""}>
            ${E(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>
      `:""}
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
    </section>`}const b=document.querySelector("#app"),h=new URLSearchParams(window.location.search),x=h.get("itemId"),F=h.get("view")??"edit",T=h.get("preview");function r(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function m(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}let d="PLAYER",u={},v=!1;function c(){const e=w(u);b.innerHTML=O(d,e,v),document.querySelector("#default-visibility")?.addEventListener("click",()=>{q()})}async function q(){if(d!=="GM"||v)return;const e=!w(u);v=!0,c();try{await A(t=>n.room.setMetadata(t),e),u={...u,[g]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),n.notification.show("DWTools could not save the default overlay visibility.","ERROR")}finally{v=!1,c()}}async function N(){[d,u]=await Promise.all([n.player.getRole(),n.room.getMetadata()]),c(),n.room.onMetadataChange(e=>{u=e,c()}),n.player.onChange(e=>{d=e.role,c()})}function $(e,t){const i=F==="hp";b.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${r(e.name||"Unnamed token")}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${i?`
        <div class="hp-row">
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${m(t.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${m(t.hpMax)}"></label>
        </div>
        <div class="quick-hp" aria-label="Quick HP adjustment">
          ${[-5,-1,1,5].map(l=>`<button type="button" data-hp="${l}">${l>0?"+":""}${l}</button>`).join("")}
        </div>
      `:`
        <label>Tags<input name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${r(t.tags??"")}"></label>
        <div class="vitals-row">
          <label>Armor<input name="armor" type="number" step="1" value="${m(t.armor)}"></label>
          <label>Current HP<input name="hpCurrent" type="number" step="1" value="${m(t.hpCurrent)}"></label>
          <span class="slash">/</span>
          <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${m(t.hpMax)}"></label>
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
        ${i?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit">Save</button>
      </footer>
    </form>`;const a=document.querySelector("#creature-form"),p=a.elements.namedItem("hpCurrent"),D=a.elements.namedItem("hpMax");p.addEventListener("blur",()=>{const l=P(p.value,D.value);l!==null&&(D.value=l)});const s=a.elements.namedItem("damage");s instanceof HTMLInputElement&&s.addEventListener("blur",()=>{s.value=L(s.value);const l=R(s.value);s.classList.toggle("field-invalid",l),s.setAttribute("aria-invalid",String(l))});for(const l of a.querySelectorAll("[data-hp]"))l.addEventListener("click",()=>{p.value=String((Number(p.value)||0)+Number(l.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{n.popover.close(y)}),document.querySelector("#remove")?.addEventListener("click",async()=>{await n.scene.items.updateItems([e],l=>{delete l[0].metadata[M]}),await n.popover.close(y)}),a.addEventListener("submit",async l=>{l.preventDefault();const C=k(new FormData(a),t,i);await n.scene.items.updateItems([e],I=>{I[0].metadata[M]=C}),await n.popover.close(y)})}T==="home"?(d="GM",u={[g]:h.get("default")!=="hidden"},c()):T==="editor"?$({id:"preview",name:"Frogman",metadata:{}},{hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"}):x?n.isAvailable?n.onReady(async()=>{const[e,t]=await Promise.all([n.scene.items.getItems([x]).then(a=>a[0]),n.room.getMetadata().catch(a=>(console.warn("DWTools could not load room visibility settings",a),{}))]);if(!e){b.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}const i=e.metadata[M];$(e,H(i,w(t)))}):b.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(c(),n.isAvailable&&n.onReady(()=>{N()}));
