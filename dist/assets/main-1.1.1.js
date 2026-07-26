import{n as B,i as de,j as ue,O as d,m as Y,h as te,k as ae,q as me,C as W,t as re,u as R,v as ne,w as pe,x as he,y as fe}from"./obrCharacterServices-1.1.1.js";function i(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function y(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function ie(e,t=""){const a=n=>`${t}${n}`;return`
    <label>Name<input id="${a("name")}" name="name" type="text" maxlength="120" required value="${i(e.name)}"></label>
    <label>Tags<input id="${a("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${i(e.tags??"")}"></label>
    <div class="vitals-row">
      <label>Armor<input id="${a("armor")}" name="armor" type="number" step="1" value="${y(e.armor)}"></label>
      <label>Current HP<input id="${a("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${y(e.hpCurrent)}"></label>
      <span class="slash">/</span>
      <label>Maximum HP<input id="${a("hpMax")}" name="hpMax" type="number" min="0" step="1" value="${y(e.hpMax)}"></label>
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
    </label>`}function ve(e){const t=e.fields;return`${i(t.name)} · HP ${y(t.hpCurrent)||"—"}/${y(t.hpMax)||"—"} · ARM ${y(t.armor)||"—"} · DMG ${i(t.damage??"—")}`}function ge(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function be(e){if(e.editing)return`
      <section class="character-manager">
        <div class="manager-heading">
          <div><p class="eyebrow">Room persistence</p><h2>${e.editing.kind==="create"?"New character record":`Edit ${i(e.editing.fields.name)}`}</h2></div>
        </div>
        ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${ie(e.editing.fields,"manager-")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${e.saving?"disabled":""}>${e.saving?"Saving…":"Save record"}</button>
          </div>
        </form>
      </section>`;const t=e.search.trim().toLocaleLowerCase(),a=e.showTombstones?[...e.records,...e.tombstones]:e.records,n=t?a.filter(r=>(r.deleted?`${r.name??""} ${r.id}`:`${r.fields.name} ${r.fields.tags??""}`).toLocaleLowerCase().includes(t)):a;return`
    <section class="character-manager">
      <div class="manager-heading">
        <div><p class="eyebrow">Room persistence</p><h2>Character Records</h2></div>
        <button type="button" class="primary compact" id="manager-create">New</button>
      </div>
      ${ge(e.usage)}
      <label class="tombstone-toggle">
        <input id="show-tombstones" type="checkbox" ${e.showTombstones?"checked":""}>
        <span>Show tombstoned characters</span>
      </label>
      <label class="manager-search">Search<input id="manager-search" type="search" value="${i(e.search)}" placeholder="Name or tags"></label>
      ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading character records…</p>':n.length?`<div class="character-list">${n.map(r=>r.deleted?`
              <article class="character-card tombstoned" data-character-search="${i(`${r.name??""} ${r.id}`.toLocaleLowerCase())}">
                <div>
                  <div class="character-card-title">
                    <strong>${i(r.name??`Deleted character ${r.id.slice(0,8)}`)}</strong>
                    <span class="tombstone-badge">Tombstoned</span>
                  </div>
                  <span>Deleted ${i(new Date(r.deletedAt).toLocaleString())}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="danger compact" data-delete-permanently="${i(r.id)}" ${e.saving?"disabled":""}>Delete permanently</button>
                </div>
                <span class="permanent-delete-warning">This action will orphan linked creature tokens in other scenes.</span>
              </article>`:`
              <article class="character-card" data-character-search="${i(`${r.fields.name} ${r.fields.tags??""}`.toLocaleLowerCase())}">
                <div>
                  <strong>${i(r.fields.name)}</strong>
                  <span>HP ${y(r.fields.hpCurrent)||"—"}/${y(r.fields.hpMax)||"—"} · ARM ${y(r.fields.armor)||"—"} · DMG ${i(r.fields.damage??"—")}</span>
                  <span>${e.counts.get(r.id)??0} linked token${e.counts.get(r.id)===1?"":"s"} in current scene · Updated ${i(new Date(r.updatedAt).toLocaleString())}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="secondary compact" data-edit-character="${i(r.id)}">Edit</button>
                  <button type="button" class="danger compact" data-delete-character="${i(r.id)}">Delete</button>
                </div>
              </article>`).join("")}</div>`:'<p class="manager-status">No character records found.</p>'}
    </section>`}function ye(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function _(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function M(e,t){return String(e.get(t)??"").trim()||void 0}function ke(e,t,a){const n=a?{...t}:{};return n.hpCurrent=_(e,"hpCurrent"),n.hpMax=_(e,"hpMax"),a||(n.tags=M(e,"tags"),n.armor=_(e,"armor"),n.damage=M(e,"damage"),n.damageDescription=M(e,"damageDescription"),n.damageTags=M(e,"damageTags"),n.instinct=M(e,"instinct"),n.moves=M(e,"moves"),n.treasure=M(e,"treasure"),n.visibleToPlayers=e.get("visibleToPlayers")==="on"),n}function oe(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...ke(e,t,a)}}function Z(e){const t=e[B];return typeof t=="boolean"?t:!0}function we(e,t){return de(e)?e:{visibleToPlayers:t}}async function $e(e,t){await e({[B]:t})}function Ce(e,t,a,n=""){const r=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
      <h1>DWTools</h1>
      <p>Right-click a character token to add or edit its creature stats.</p>
      ${e==="GM"?`
        <div class="default-visibility">
          <span>Default character overlay visibility:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${r}" title="${r}" ${a?"disabled":""}>
            ${ue(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>
      `:""}
      <p class="muted">The editor and quick HP controls are available to the GM.</p>
      ${e==="GM"?n:""}
    </section>`}const I=document.querySelector("#app"),G=new URLSearchParams(window.location.search),q=G.get("itemId"),se=G.get("view")??"edit",ee=G.get("preview");function C(e,t){return e instanceof Error?e.message:t}function w(e,t){d.isAvailable&&d.notification.show(e,t)}function Q(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=he(t.value);const a=fe(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function le(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>Q(e))}function Se(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","armor","damage","damageDescription","damageTags","instinct","moves","treasure","visibleToPlayers"],r={};for(const c of n)e[c]!==t[c]&&(r[c]=t[c]);return r}let b="PLAYER",E={},O=!1,D,N,T,F=[],V=[],J=new Map,j,z=!1,$=!1,v,K="",ce=!1,m;function Le(){return{records:F,tombstones:V,showTombstones:ce,counts:J,usage:j,loading:z,saving:$,error:v,search:K,editing:m}}function l(){const e=Z(E),t=b==="GM"?be(Le()):"";I.innerHTML=Ce(b,e,O,t),document.querySelector("#default-visibility")?.addEventListener("click",()=>{Ee()}),Te()}function Te(){document.querySelector("#manager-create")?.addEventListener("click",()=>{v=void 0,m={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},l()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{m=void 0,v=void 0,l()}),document.querySelector("#show-tombstones")?.addEventListener("change",t=>{ce=t.currentTarget.checked,l()}),document.querySelector("#manager-search")?.addEventListener("input",t=>{K=t.currentTarget.value;const a=K.trim().toLocaleLowerCase();for(const n of document.querySelectorAll("[data-character-search]"))n.hidden=!String(n.dataset.characterSearch).includes(a)});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=F.find(n=>n.id===t.dataset.editCharacter);a&&(v=void 0,m={kind:"edit",id:a.id,fields:a.fields},l())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{De(t.dataset.deleteCharacter)});for(const t of document.querySelectorAll("[data-delete-permanently]"))t.addEventListener("click",()=>{xe(t.dataset.deletePermanently)});const e=document.querySelector("#character-manager-form");e&&(le(e),e.addEventListener("submit",t=>{t.preventDefault(),Me(e)}))}async function x(e=!0){if(!(b!=="GM"||!D||!N)){z=!0,v=void 0,e&&!m&&l();try{const[t,a,n]=await Promise.all([D.listStored(),pe(N.scene),D.estimateUsage()]);F=t.flatMap(r=>r.deleted?[]:[r]),V=t.flatMap(r=>r.deleted?[r]:[]),J=a,j=n}catch(t){v=C(t,"DWTools could not load character records.")}finally{z=!1,e&&!m&&l()}}}async function Me(e){if(!(!m||!T||$)){if(!Q(e)||!e.reportValidity()){v="Correct the highlighted character fields before saving.",l();return}$=!0,v=void 0,l();try{const t=ne(oe(new FormData(e),m.fields,!1));m.kind==="create"?(await T.create(t),w("Character record created.","SUCCESS")):(await T.save(m.id,t),w("Character record saved.","SUCCESS")),m=void 0,await x(!1),j?.nearLimit&&w("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){v=C(t,"DWTools could not save the record.")}finally{$=!1,l()}}}async function De(e){if(!e||!T||$)return;const t=F.find(a=>a.id===e);if(t&&window.confirm(`Delete the room character record "${t.fields.name}"? Current-scene tokens will be unlinked but keep their creature fields.`)){$=!0,v=void 0,l();try{await T.delete(e),w("Character record deleted.","SUCCESS"),await x(!1)}catch(a){v=C(a,"DWTools could not delete the record.")}finally{$=!1,l()}}}async function xe(e){if(!e||!T||$)return;const t=V.find(n=>n.id===e);if(!t)return;const a=t.name??`deleted character ${t.id.slice(0,8)}`;if(window.confirm(`Permanently delete "${a}"? This cannot be undone and will orphan linked creature tokens in other scenes.`)){$=!0,v=void 0,l();try{await T.deletePermanently(e),w("Character record permanently deleted.","SUCCESS"),await x(!1)}catch(n){v=C(n,"DWTools could not permanently delete the record.")}finally{$=!1,l()}}}async function Ee(){if(b!=="GM"||O)return;const e=!Z(E);O=!0,l();try{await $e(t=>d.room.setMetadata(t),e),E={...E,[B]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),w("DWTools could not save the default overlay visibility.","ERROR")}finally{O=!1,l()}}async function Re(){D=te(),N=ae(D),T=me(D,N),[b,E]=await Promise.all([d.player.getRole(),d.room.getMetadata()]),b==="GM"&&await x(!1),l();const e=[d.room.onMetadataChange(t=>{E=t,l()}),D.subscribe(()=>{b==="GM"&&x(!m)}),d.player.onChange(t=>{b=t.role,m=void 0,b==="GM"?x():l()}),d.scene.items.onChange(()=>{b==="GM"&&!m&&x()})];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let L,h,o,f,k={status:"missing"},U=[],H=!1,A="",s=!1,p,X=!1;function qe(e){const t=R(e);let a,n;t?k.status==="active"?(a=`Character record: <strong>${i(k.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${k.status==="malformed"?"malformed":k.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const r=A.trim().toLocaleLowerCase(),c=r?U.filter(g=>g.fields.name.toLocaleLowerCase().includes(r)||g.fields.tags?.toLocaleLowerCase().includes(r)):U,S=H?`
      <div class="link-picker">
        <p>Selecting an existing record replaces every persistent DWTools field on this token.</p>
        <label>Search characters<input id="link-search" type="search" value="${i(A)}"></label>
        <div class="link-results">
          ${c.length?c.map(g=>`
                <button type="button" data-link-record="${i(g.id)}" data-link-search="${i(`${g.fields.name} ${g.fields.tags??""}`.toLocaleLowerCase())}">
                  ${ve(g)}
                </button>`).join(""):'<span class="manager-status">No matching character records.</span>'}
        </div>
        <div class="manager-actions">
          <button type="button" class="secondary" id="create-character">Create new from this creature</button>
          <button type="button" class="secondary" id="cancel-link">Cancel</button>
        </div>
      </div>`:"";return`
    <section class="character-link-section">
      <span>${a}</span>
      <div class="link-actions">${n}</div>
      ${S}
    </section>`}function u(){if(!o||!f)return;const e=se==="hp";I.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${i(f.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${qe(o)}
      ${p?`<p class="inline-error">${i(p)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${y(f.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${y(f.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(r=>`<button type="button" data-hp="${r}">${r>0?"+":""}${r}</button>`).join("")}
          </div>`:ie(f)}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${s?"disabled":""}>${s?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const r=ye(a.value,n.value);r!==null&&(n.value=r)}),le(t);for(const r of t.querySelectorAll("[data-hp]"))r.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(r.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{d.popover.close(Y)}),document.querySelector("#remove")?.addEventListener("click",()=>{He()}),document.querySelector("#link-character")?.addEventListener("click",()=>{Ae()});for(const r of document.querySelectorAll("#create-character"))r.addEventListener("click",()=>{Ie()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Fe()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{H=!1,A="",u()}),document.querySelector("#link-search")?.addEventListener("input",r=>{A=r.currentTarget.value;const c=A.trim().toLocaleLowerCase();for(const S of document.querySelectorAll("[data-link-search]"))S.hidden=!String(S.dataset.linkSearch).includes(c)});for(const r of document.querySelectorAll("[data-link-record]"))r.addEventListener("click",()=>{Pe(r.dataset.linkRecord)});t.addEventListener("submit",r=>{r.preventDefault(),We(t)})}async function P(){if(!q||!h||!L)return;const e=await h.getItem(q);if(!e){I.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}X=W in e.metadata,o=e,f=re(e);const t=R(e);k=t?await L.inspect(t.characterId):{status:"missing"},k.status==="active"&&(f=k.record.fields),u()}async function Ae(){if(!(!L||s)){s=!0,p=void 0,u();try{U=await L.list(),H=!0}catch(e){p=C(e,"DWTools could not load character records.")}finally{s=!1,u()}}}async function Pe(e){if(!e||!h||!o||s)return;const t=U.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools fields will be replaced by the latest character record.`)){s=!0,p=void 0,u();try{await h.linkToExistingCharacter(o.id,e),w(`Linked to ${t.fields.name}.`,"SUCCESS"),H=!1,await P()}catch(a){p=C(a,"DWTools could not link the character.")}finally{s=!1,u()}}}async function Ie(){if(!(!h||!o||s)){s=!0,p=void 0,u();try{const{record:e}=await h.createAndLinkCharacter(o.id);w(`Created and linked ${e.fields.name}.`,"SUCCESS"),H=!1,await P()}catch(e){p=C(e,"DWTools could not create and link the character.")}finally{s=!1,u()}}}async function Fe(){if(!(!h||!o||s)){s=!0,p=void 0,u();try{await h.unlinkCharacter(o.id),w("Character unlinked; creature fields were retained.","SUCCESS"),await P()}catch(e){p=C(e,"DWTools could not unlink the character.")}finally{s=!1,u()}}}async function He(){if(!(!h||!o||s||R(o)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){s=!0,u();try{await h.removeCreatureData(o.id),await d.popover.close(Y)}catch(t){p=C(t,"DWTools could not remove the creature data."),s=!1,u()}}}async function We(e){if(!(!h||!o||!f||s)){if(!Q(e)||!e.reportValidity()){p="Correct the highlighted creature fields before saving.",u();return}s=!0,p=void 0,u();try{const t=se==="hp",a=ne(oe(new FormData(e),f,t));let n=Se(f,a,t);!X&&!R(o)&&(n=a),Object.keys(n).length&&await h.updateCreatureFields(o.id,n),w(R(o)?"Character record saved.":"Creature saved.","SUCCESS"),await d.popover.close(Y)}catch(t){p=C(t,"DWTools could not save the creature."),s=!1,u()}}}async function Oe(){if(!q)return;L=te(),h=ae(L);const[e,t]=await Promise.all([h.getItem(q),d.room.getMetadata().catch(c=>(console.warn("DWTools could not load room visibility settings",c),{}))]);if(!e){I.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}X=W in e.metadata;const a=we(e.metadata[W],Z(t));o={...e,metadata:{...e.metadata,[W]:a}},f=re(o);const n=R(o);k=n?await L.inspect(n.characterId):{status:"missing"},k.status==="active"&&(f=k.record.fields),u();const r=[L.subscribe(c=>{const S=o&&R(o);S&&c.some(g=>g.characterId===S.characterId)&&!s&&P()}),d.scene.items.onChange(c=>{c.find(g=>g.id===q)&&!s&&P()})];window.addEventListener("unload",()=>{for(const c of r)c()},{once:!0})}ee==="home"?(b="GM",E={[B]:G.get("default")!=="hidden"},F=[{schemaVersion:1,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],V=[{schemaVersion:1,id:"preview-deleted",name:"The Ashen Seer",revision:4,writeId:"preview-deleted-write",deleted:!0,deletedAt:"2026-07-26T16:30:00.000Z",deletedBy:"preview-gm"}],J=new Map([["preview-active",2]]),j={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},l()):ee==="editor"?(o={id:"preview",name:"Frogman",metadata:{}},f={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},u()):q?d.isAvailable?d.onReady(()=>{Oe()}):I.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(l(),d.isAvailable&&d.onReady(()=>{Re()}));
