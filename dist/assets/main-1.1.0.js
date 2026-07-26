import{n as G,i as le,j as ce,O as c,m as z,h as Z,k as ee,q as de,C as W,t as te,u as E,v as ae,w as ue,x as me,y as pe}from"./obrCharacterServices-1.1.0.js";function i(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function b(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function re(e,t=""){const a=r=>`${t}${r}`;return`
    <label>Name<input id="${a("name")}" name="name" type="text" maxlength="120" required value="${i(e.name)}"></label>
    <label>Tags<input id="${a("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${i(e.tags??"")}"></label>
    <div class="vitals-row">
      <label>Armor<input id="${a("armor")}" name="armor" type="number" step="1" value="${b(e.armor)}"></label>
      <label>Current HP<input id="${a("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${b(e.hpCurrent)}"></label>
      <span class="slash">/</span>
      <label>Maximum HP<input id="${a("hpMax")}" name="hpMax" type="number" min="0" step="1" value="${b(e.hpMax)}"></label>
    </div>
    <div class="damage-fields">
      <label>Damage<input id="${a("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${i(e.damage??"")}"></label>
      <label>Description<input id="${a("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${i(e.damageDescription??"")}"></label>
    </div>
    <label>Damage tags<input id="${a("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${i(e.damageTags??"")}"></label>
    <label>Instinct<textarea id="${a("instinct")}" name="instinct" rows="2">${i(e.instinct??"")}</textarea></label>
    <label>Moves<textarea id="${a("moves")}" name="moves" rows="4" placeholder="One move per line">${i(e.moves??"")}</textarea></label>
    <label>Treasure<textarea id="${a("treasure")}" name="treasure" rows="3">${i(e.treasure??"")}</textarea></label>
    <label class="visibility">
      <input id="${a("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
      Show the token overlay to players
    </label>`}function he(e){const t=e.fields;return`${i(t.name)} · HP ${b(t.hpCurrent)||"—"}/${b(t.hpMax)||"—"} · ARM ${b(t.armor)||"—"} · DMG ${i(t.damage??"—")}`}function fe(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function ve(e){if(e.editing)return`
      <section class="character-manager">
        <div class="manager-heading">
          <div><p class="eyebrow">Room persistence</p><h2>${e.editing.kind==="create"?"New character record":`Edit ${i(e.editing.fields.name)}`}</h2></div>
        </div>
        ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${re(e.editing.fields,"manager-")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${e.saving?"disabled":""}>${e.saving?"Saving…":"Save record"}</button>
          </div>
        </form>
      </section>`;const t=e.search.trim().toLocaleLowerCase(),a=t?e.records.filter(r=>r.fields.name.toLocaleLowerCase().includes(t)||r.fields.tags?.toLocaleLowerCase().includes(t)):e.records;return`
    <section class="character-manager">
      <div class="manager-heading">
        <div><p class="eyebrow">Room persistence</p><h2>Character Records</h2></div>
        <button type="button" class="primary compact" id="manager-create">New</button>
      </div>
      ${fe(e.usage)}
      <label class="manager-search">Search<input id="manager-search" type="search" value="${i(e.search)}" placeholder="Name or tags"></label>
      ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading character records…</p>':a.length?`<div class="character-list">${a.map(r=>`
              <article class="character-card" data-character-search="${i(`${r.fields.name} ${r.fields.tags??""}`.toLocaleLowerCase())}">
                <div>
                  <strong>${i(r.fields.name)}</strong>
                  <span>HP ${b(r.fields.hpCurrent)||"—"}/${b(r.fields.hpMax)||"—"} · ARM ${b(r.fields.armor)||"—"} · DMG ${i(r.fields.damage??"—")}</span>
                  <span>${e.counts.get(r.id)??0} linked token${e.counts.get(r.id)===1?"":"s"} in current scene · Updated ${i(new Date(r.updatedAt).toLocaleString())}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="secondary compact" data-edit-character="${i(r.id)}">Edit</button>
                  <button type="button" class="danger compact" data-delete-character="${i(r.id)}">Delete</button>
                </div>
              </article>`).join("")}</div>`:'<p class="manager-status">No character records found.</p>'}
    </section>`}function ge(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function V(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const r=Number(a);return Number.isFinite(r)?Math.trunc(r):void 0}function L(e,t){return String(e.get(t)??"").trim()||void 0}function be(e,t,a){const r=a?{...t}:{};return r.hpCurrent=V(e,"hpCurrent"),r.hpMax=V(e,"hpMax"),a||(r.tags=L(e,"tags"),r.armor=V(e,"armor"),r.damage=L(e,"damage"),r.damageDescription=L(e,"damageDescription"),r.damageTags=L(e,"damageTags"),r.instinct=L(e,"instinct"),r.moves=L(e,"moves"),r.treasure=L(e,"treasure"),r.visibleToPlayers=e.get("visibleToPlayers")==="on"),r}function ne(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...be(e,t,a)}}function K(e){const t=e[G];return typeof t=="boolean"?t:!0}function ye(e,t){return le(e)?e:{visibleToPlayers:t}}async function ke(e,t){await e({[G]:t})}function Ce(e,t,a,r=""){const n=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      <div class="sample"><strong>HP 7/10</strong> &nbsp;███████░░░<br><strong>ARM 1</strong> &nbsp; DMG d8+2</div>
      ${e==="GM"?`
        <div class="default-visibility">
          <span>Default character overlay visibility:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${n}" title="${n}" ${a?"disabled":""}>
            ${ce(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>
      `:""}
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
      ${e==="GM"?r:""}
    </section>`}const I=document.querySelector("#app"),B=new URLSearchParams(window.location.search),R=B.get("itemId"),ie=B.get("view")??"edit",X=B.get("preview");function $(e,t){return e instanceof Error?e.message:t}function C(e,t){c.isAvailable&&c.notification.show(e,t)}function Y(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=me(t.value);const a=pe(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function oe(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>Y(e))}function $e(e,t,a){const r=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","armor","damage","damageDescription","damageTags","instinct","moves","treasure","visibleToPlayers"],n={};for(const l of r)e[l]!==t[l]&&(n[l]=t[l]);return n}let g="PLAYER",D={},O=!1,M,N,q,F=[],se=new Map,Q,j=!1,T=!1,y,_="",m;function we(){return{records:F,counts:se,usage:Q,loading:j,saving:T,error:y,search:_,editing:m}}function d(){const e=K(D),t=g==="GM"?ve(we()):"";I.innerHTML=Ce(g,e,O,t),document.querySelector("#default-visibility")?.addEventListener("click",()=>{De()}),Se()}function Se(){document.querySelector("#manager-create")?.addEventListener("click",()=>{y=void 0,m={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},d()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{m=void 0,y=void 0,d()}),document.querySelector("#manager-search")?.addEventListener("input",t=>{_=t.currentTarget.value;const a=_.trim().toLocaleLowerCase();for(const r of document.querySelectorAll("[data-character-search]"))r.hidden=!String(r.dataset.characterSearch).includes(a)});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=F.find(r=>r.id===t.dataset.editCharacter);a&&(y=void 0,m={kind:"edit",id:a.id,fields:a.fields},d())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{Me(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(oe(e),e.addEventListener("submit",t=>{t.preventDefault(),Le(e)}))}async function x(e=!0){if(!(g!=="GM"||!M||!N)){j=!0,y=void 0,e&&!m&&d();try{[F,se,Q]=await Promise.all([M.list(),ue(N.scene),M.estimateUsage()])}catch(t){y=$(t,"DWTools could not load character records.")}finally{j=!1,e&&!m&&d()}}}async function Le(e){if(!(!m||!q||T)){if(!Y(e)||!e.reportValidity()){y="Correct the highlighted character fields before saving.",d();return}T=!0,y=void 0,d();try{const t=ae(ne(new FormData(e),m.fields,!1));m.kind==="create"?(await q.create(t),C("Character record created.","SUCCESS")):(await q.save(m.id,t),C("Character record saved.","SUCCESS")),m=void 0,await x(!1),Q?.nearLimit&&C("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){y=$(t,"DWTools could not save the record.")}finally{T=!1,d()}}}async function Me(e){if(!e||!q||T)return;const t=F.find(a=>a.id===e);if(t&&window.confirm(`Delete the room character record "${t.fields.name}"? Current-scene tokens will be unlinked but keep their creature fields.`)){T=!0,y=void 0,d();try{await q.delete(e),C("Character record deleted.","SUCCESS"),await x(!1)}catch(a){y=$(a,"DWTools could not delete the record.")}finally{T=!1,d()}}}async function De(){if(g!=="GM"||O)return;const e=!K(D);O=!0,d();try{await ke(t=>c.room.setMetadata(t),e),D={...D,[G]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),C("DWTools could not save the default overlay visibility.","ERROR")}finally{O=!1,d()}}async function Te(){M=Z(),N=ee(M),q=de(M,N),[g,D]=await Promise.all([c.player.getRole(),c.room.getMetadata()]),g==="GM"&&await x(!1),d();const e=[c.room.onMetadataChange(t=>{D=t,d()}),M.subscribe(()=>{g==="GM"&&x(!m)}),c.player.onChange(t=>{g=t.role,m=void 0,g==="GM"?x():d()}),c.scene.items.onChange(()=>{g==="GM"&&!m&&x()})];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let S,h,o,f,k={status:"missing"},U=[],H=!1,P="",s=!1,p,J=!1;function Ee(e){const t=E(e);let a,r;t?k.status==="active"?(a=`Character record: <strong>${i(k.record.fields.name)}</strong>`,r=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${k.status==="malformed"?"malformed":k.status==="deleted"?"deleted":"missing"})</strong>`,r=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",r='<button type="button" class="secondary" id="link-character">Link to character</button>');const n=P.trim().toLocaleLowerCase(),l=n?U.filter(v=>v.fields.name.toLocaleLowerCase().includes(n)||v.fields.tags?.toLocaleLowerCase().includes(n)):U,w=H?`
      <div class="link-picker">
        <p>Selecting an existing record replaces every persistent DWTools field on this token.</p>
        <label>Search characters<input id="link-search" type="search" value="${i(P)}"></label>
        <div class="link-results">
          ${l.length?l.map(v=>`
                <button type="button" data-link-record="${i(v.id)}" data-link-search="${i(`${v.fields.name} ${v.fields.tags??""}`.toLocaleLowerCase())}">
                  ${he(v)}
                </button>`).join(""):'<span class="manager-status">No matching character records.</span>'}
        </div>
        <div class="manager-actions">
          <button type="button" class="secondary" id="create-character">Create new from this creature</button>
          <button type="button" class="secondary" id="cancel-link">Cancel</button>
        </div>
      </div>`:"";return`
    <section class="character-link-section">
      <span>${a}</span>
      <div class="link-actions">${r}</div>
      ${w}
    </section>`}function u(){if(!o||!f)return;const e=ie==="hp";I.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${i(f.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${Ee(o)}
      ${p?`<p class="inline-error">${i(p)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${b(f.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${b(f.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(n=>`<button type="button" data-hp="${n}">${n>0?"+":""}${n}</button>`).join("")}
          </div>`:re(f)}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${s?"disabled":""}>${s?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),r=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const n=ge(a.value,r.value);n!==null&&(r.value=n)}),oe(t);for(const n of t.querySelectorAll("[data-hp]"))n.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(n.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{c.popover.close(z)}),document.querySelector("#remove")?.addEventListener("click",()=>{Ae()}),document.querySelector("#link-character")?.addEventListener("click",()=>{xe()});for(const n of document.querySelectorAll("#create-character"))n.addEventListener("click",()=>{qe()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Pe()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{H=!1,P="",u()}),document.querySelector("#link-search")?.addEventListener("input",n=>{P=n.currentTarget.value;const l=P.trim().toLocaleLowerCase();for(const w of document.querySelectorAll("[data-link-search]"))w.hidden=!String(w.dataset.linkSearch).includes(l)});for(const n of document.querySelectorAll("[data-link-record]"))n.addEventListener("click",()=>{Re(n.dataset.linkRecord)});t.addEventListener("submit",n=>{n.preventDefault(),Ie(t)})}async function A(){if(!R||!h||!S)return;const e=await h.getItem(R);if(!e){I.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}J=W in e.metadata,o=e,f=te(e);const t=E(e);k=t?await S.inspect(t.characterId):{status:"missing"},k.status==="active"&&(f=k.record.fields),u()}async function xe(){if(!(!S||s)){s=!0,p=void 0,u();try{U=await S.list(),H=!0}catch(e){p=$(e,"DWTools could not load character records.")}finally{s=!1,u()}}}async function Re(e){if(!e||!h||!o||s)return;const t=U.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools fields will be replaced by the latest character record.`)){s=!0,p=void 0,u();try{await h.linkToExistingCharacter(o.id,e),C(`Linked to ${t.fields.name}.`,"SUCCESS"),H=!1,await A()}catch(a){p=$(a,"DWTools could not link the character.")}finally{s=!1,u()}}}async function qe(){if(!(!h||!o||s)){s=!0,p=void 0,u();try{const{record:e}=await h.createAndLinkCharacter(o.id);C(`Created and linked ${e.fields.name}.`,"SUCCESS"),H=!1,await A()}catch(e){p=$(e,"DWTools could not create and link the character.")}finally{s=!1,u()}}}async function Pe(){if(!(!h||!o||s)){s=!0,p=void 0,u();try{await h.unlinkCharacter(o.id),C("Character unlinked; creature fields were retained.","SUCCESS"),await A()}catch(e){p=$(e,"DWTools could not unlink the character.")}finally{s=!1,u()}}}async function Ae(){if(!(!h||!o||s||E(o)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){s=!0,u();try{await h.removeCreatureData(o.id),await c.popover.close(z)}catch(t){p=$(t,"DWTools could not remove the creature data."),s=!1,u()}}}async function Ie(e){if(!(!h||!o||!f||s)){if(!Y(e)||!e.reportValidity()){p="Correct the highlighted creature fields before saving.",u();return}s=!0,p=void 0,u();try{const t=ie==="hp",a=ae(ne(new FormData(e),f,t));let r=$e(f,a,t);!J&&!E(o)&&(r=a),Object.keys(r).length&&await h.updateCreatureFields(o.id,r),C(E(o)?"Character record saved.":"Creature saved.","SUCCESS"),await c.popover.close(z)}catch(t){p=$(t,"DWTools could not save the creature."),s=!1,u()}}}async function Fe(){if(!R)return;S=Z(),h=ee(S);const[e,t]=await Promise.all([h.getItem(R),c.room.getMetadata().catch(l=>(console.warn("DWTools could not load room visibility settings",l),{}))]);if(!e){I.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}J=W in e.metadata;const a=ye(e.metadata[W],K(t));o={...e,metadata:{...e.metadata,[W]:a}},f=te(o);const r=E(o);k=r?await S.inspect(r.characterId):{status:"missing"},k.status==="active"&&(f=k.record.fields),u();const n=[S.subscribe(l=>{const w=o&&E(o);w&&l.some(v=>v.characterId===w.characterId)&&!s&&A()}),c.scene.items.onChange(l=>{l.find(v=>v.id===R)&&!s&&A()})];window.addEventListener("unload",()=>{for(const l of n)l()},{once:!0})}X==="home"?(g="GM",D={[G]:B.get("default")!=="hidden"},F=[],d()):X==="editor"?(o={id:"preview",name:"Frogman",metadata:{}},f={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},u()):R?c.isAvailable?c.onReady(()=>{Fe()}):I.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(d(),c.isAvailable&&c.onReady(()=>{Te()}));
