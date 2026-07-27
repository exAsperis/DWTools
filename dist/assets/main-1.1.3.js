import{n as V,i as he,j as ge,O as d,m as Z,h as re,k as oe,q as fe,C as N,t as ie,u as O,v as se,w as pe,x as ve,y as ye}from"./obrCharacterServices-1.1.3.js";function o(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function b(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function le(e,t=""){const a=n=>`${t}${n}`;return`
    <label>Name<input id="${a("name")}" name="name" type="text" maxlength="120" required value="${o(e.name)}"></label>
    <label>Tags<input id="${a("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${o(e.tags??"")}"></label>
    <div class="vitals-row">
      <label>Armor<input id="${a("armor")}" name="armor" type="number" step="1" value="${b(e.armor)}"></label>
      <label>Current HP<input id="${a("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${b(e.hpCurrent)}"></label>
      <span class="slash">/</span>
      <label>Maximum HP<input id="${a("hpMax")}" name="hpMax" type="number" min="0" step="1" value="${b(e.hpMax)}"></label>
    </div>
    <div class="damage-fields">
      <label>Damage<input id="${a("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${o(e.damage??"")}"></label>
      <label>Description<input id="${a("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${o(e.damageDescription??"")}"></label>
    </div>
    <label>Damage tags<input id="${a("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${o(e.damageTags??"")}"></label>
    <label>Instinct<textarea id="${a("instinct")}" name="instinct" rows="2">${o(e.instinct??"")}</textarea></label>
    <label>Moves<textarea id="${a("moves")}" name="moves" rows="4" placeholder="One move per line">${o(e.moves??"")}</textarea></label>
    <label>Treasure<textarea id="${a("treasure")}" name="treasure" rows="3">${o(e.treasure??"")}</textarea></label>
    <label class="visibility">
      <input id="${a("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
      Show the token overlay to players
    </label>`}function be(e){const t=e.fields;return`${o(t.name)} · HP ${b(t.hpCurrent)||"—"}/${b(t.hpMax)||"—"} · ARM ${b(t.armor)||"—"} · DMG ${o(t.damage??"—")}`}function ke(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function we(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function Ce(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${o(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${o(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${le(e.editing.fields,"manager-")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${e.saving?"disabled":""}>${e.saving?"Saving…":"Save record"}</button>
          </div>
        </form>
      </section>`:`
    <section class="character-manager">
      <div class="section-heading">
        <h2>Character Records</h2>
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          (${t?"collapse":"expand"})
        </button>
      </div>
      ${t?`${we(e.usage)}
      <button type="button" class="primary compact manager-create" id="manager-create">New</button>
      ${e.error?`<p class="inline-error">${o(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading character records…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>`
              <article class="character-card" data-character-search="${o(`${a.fields.name} ${a.fields.tags??""}`.toLocaleLowerCase())}">
                <div>
                  <strong>${o(a.fields.name)}</strong>
                  <span>HP ${b(a.fields.hpCurrent)||"—"}/${b(a.fields.hpMax)||"—"} · ARM ${b(a.fields.armor)||"—"} · DMG ${o(a.fields.damage??"—")}</span>
                  <span>${e.counts.get(a.id)??0} linked token${e.counts.get(a.id)===1?"":"s"} in current scene · Updated ${o(new Date(a.updatedAt).toLocaleString())}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="secondary compact" data-edit-character="${o(a.id)}">Edit</button>
                  <button type="button" class="danger compact" data-delete-character="${o(a.id)}">Delete</button>
                </div>
              </article>`).join("")}</div>`:'<p class="manager-status">No character records found.</p>'}`:""}
    </section>`}function $e(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function j(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function x(e,t){return String(e.get(t)??"").trim()||void 0}function Se(e,t,a){const n=a?{...t}:{};return n.hpCurrent=j(e,"hpCurrent"),n.hpMax=j(e,"hpMax"),a||(n.tags=x(e,"tags"),n.armor=j(e,"armor"),n.damage=x(e,"damage"),n.damageDescription=x(e,"damageDescription"),n.damageTags=x(e,"damageTags"),n.instinct=x(e,"instinct"),n.moves=x(e,"moves"),n.treasure=x(e,"treasure"),n.visibleToPlayers=e.get("visibleToPlayers")==="on"),n}function ce(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Se(e,t,a)}}function Q(e){const t=e[V];return typeof t=="boolean"?t:!0}function Me(e,t){return he(e)?e:{visibleToPlayers:t}}async function Le(e,t){await e({[V]:t})}const I={agenda:!0,moves:!0,settings:!1,characters:!1},de=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

• You have to move to get the shot, placing you in danger of the GM’s choice.
• You have to take what you can get: -1d6 damage.
• You have to take several shots, reducing your ammo by one.`},{id:"defy-danger",name:"Defy Danger",text:`When you act despite an imminent threat or suffer a calamity, say how you deal with it and roll. If you do it…

• …by powering through, +Str
• …by getting out of the way or acting fast, +Dex
• …by enduring, +Con
• …with quick thinking, +Int
• …through mental fortitude, +Wis
• …using charm and social grace, +Cha

On a 10+, you do what you set out to, the threat doesn’t come to bear. On a 7–9, you stumble, hesitate, or flinch: the GM will offer you a worse outcome, hard bargain, or ugly choice.`},{id:"defend",name:"Defend",text:`When you stand in defense of a person, item, or location under attack, roll+Con. On a 10+, hold 3. On a 7–9, hold 1. So long as you stand in defense, when you or the thing you defend is attacked you may spend hold, 1 for 1, to choose an option:

• Redirect an attack from the thing you defend to yourself.
• Halve the attack’s effect or damage.
• Open up the attacker to an ally, giving that ally +1 forward against the attacker.
• Deal damage to the attacker equal to your level.`},{id:"spout-lore",name:"Spout Lore",text:"When you consult your accumulated knowledge about something, roll+Int. On a 10+ the GM will tell you something interesting and useful about the subject relevant to your situation. On a 7–9 the GM will only tell you something interesting—it’s on you to make it useful. The GM might ask you “How do you know this?” Tell them the truth, now."},{id:"discern-realities",name:"Discern Realities",text:`When you closely study a situation or person, roll+Wis. On a 10+ ask the GM 3 questions from the list below. On a 7–9 ask 1. Take +1 forward when acting on the answers.

• What happened here recently?
• What is about to happen?
• What should I be on the lookout for?
• What here is useful or valuable to me?
• Who’s really in control here?
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}];function K(e,t,a){return`
    <div class="section-heading">
      <h2>${e}</h2>
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        (${a?"collapse":"expand"})
      </button>
    </div>`}function xe(e,t,a,n=I,r=""){const i=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section">
        ${K("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section">
        ${K("Moves","moves",n.moves)}
        ${n.moves?`<div class="move-list">${de.map(h=>`<button type="button" class="move-link" data-move="${h.id}">${h.name}</button>`).join("")}</div>`:""}
      </section>
      ${e==="GM"?`<section class="home-section">
        ${K("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${i}" title="${i}" ${a?"disabled":""}>
            ${ge(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>`:""}
      </section>
      ${r}`:""}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`}const H=document.querySelector("#app"),_=new URLSearchParams(window.location.search),W=_.get("itemId"),ue=_.get("view")??"edit",ne=_.get("preview");function $(e,t){return e instanceof Error?e.message:t}function C(e,t){d.isAvailable&&d.notification.show(e,t)}function X(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=ve(t.value);const a=ye(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function me(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>X(e))}function De(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","armor","damage","damageDescription","damageTags","instinct","moves","treasure","visibleToPlayers"],r={};for(const i of n)e[i]!==t[i]&&(r[i]=t[i]);return r}let y="PLAYER",T={},G=!1,D,U,L,P=[],ee=new Map,Y,z=!1,E=!1,k,J=!1,m;const te="dwtools/home-sections";function Te(){try{const e=JSON.parse(localStorage.getItem(te)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:I.agenda,moves:typeof e.moves=="boolean"?e.moves:I.moves,settings:typeof e.settings=="boolean"?e.settings:I.settings,characters:typeof e.characters=="boolean"?e.characters:I.characters}}catch{return{...I}}}let S=Te();function Ee(){return{records:P,counts:ee,usage:Y,loading:z,saving:E,error:k,editing:m}}function c(){const e=Q(T),t=y==="GM"?Ce(Ee(),S.characters||!!m):"";H.innerHTML=xe(y,e,G,S,t),document.querySelector("#default-visibility")?.addEventListener("click",()=>{We()});for(const a of document.querySelectorAll("[data-toggle-section]"))a.addEventListener("click",()=>{const n=a.dataset.toggleSection;S={...S,[n]:!S[n]},localStorage.setItem(te,JSON.stringify(S)),c()});for(const a of document.querySelectorAll("[data-move]"))a.addEventListener("click",()=>{const n=de.find(g=>g.id===a.dataset.move),r=document.querySelector("#move-dialog"),i=document.querySelector("#move-dialog-title"),h=document.querySelector("#move-dialog-text");!n||!r||!i||!h||(i.textContent=n.name,h.textContent=n.text,r.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),Oe()}function Oe(){document.querySelector("#manager-create")?.addEventListener("click",()=>{k=void 0,m={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},S.characters=!0,localStorage.setItem(te,JSON.stringify(S)),c()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{m=void 0,k=void 0,c()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=P.find(n=>n.id===t.dataset.editCharacter);a&&(k=void 0,m={kind:"edit",id:a.id,fields:a.fields},c())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{Re(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(me(e),e.addEventListener("submit",t=>{t.preventDefault(),Ie(e)}))}async function R(e=!0){if(!(y!=="GM"||!D||!U||!L)){z=!0,k=void 0,e&&!m&&c();try{if(!J){const t=await L.cleanupLegacyTombstones();J=!0,t&&C(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[P,ee,Y]=await Promise.all([D.list(),pe(U.scene),D.estimateUsage()])}catch(t){k=$(t,"DWTools could not load character records.")}finally{z=!1,e&&!m&&c()}}}async function Ie(e){if(!(!m||!L||E)){if(!X(e)||!e.reportValidity()){k="Correct the highlighted character fields before saving.",c();return}E=!0,k=void 0,c();try{const t=se(ce(new FormData(e),m.fields,!1));m.kind==="create"?(await L.create(t),C("Character record created.","SUCCESS")):(await L.save(m.id,t),C("Character record saved.","SUCCESS")),m=void 0,await R(!1),Y?.nearLimit&&C("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){k=$(t,"DWTools could not save the record.")}finally{E=!1,c()}}}async function Re(e){if(!e||!L||E)return;const t=P.find(a=>a.id===e);if(t&&window.confirm(ke(t.fields.name))){E=!0,k=void 0,c();try{await L.delete(e),C("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await R(!1)}catch(a){k=$(a,"DWTools could not delete the record.")}finally{E=!1,c()}}}async function We(){if(y!=="GM"||G)return;const e=!Q(T);G=!0,c();try{await Le(t=>d.room.setMetadata(t),e),T={...T,[V]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),C("DWTools could not save the default overlay visibility.","ERROR")}finally{G=!1,c()}}async function qe(){D=re(),U=oe(D),L=fe(D,U),[y,T]=await Promise.all([d.player.getRole(),d.room.getMetadata()]),y==="GM"&&await R(!1),c();const e=[d.room.onMetadataChange(t=>{T=t,c()}),D.subscribe(t=>{t.some(a=>a.lookup.status==="deleted")&&(J=!1),y==="GM"&&R(!m)}),d.player.onChange(t=>{y=t.role,m=void 0,y==="GM"?R():c()}),d.scene.items.onChange(()=>{y==="GM"&&!m&&R()})];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let M,p,s,v,w={status:"missing"},B=[],F=!1,q="",l=!1,f,ae=!1;function Ae(e){const t=O(e);let a,n;t?w.status==="active"?(a=`Character record: <strong>${o(w.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${w.status==="malformed"?"malformed":w.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const r=q.trim().toLocaleLowerCase(),i=r?B.filter(g=>g.fields.name.toLocaleLowerCase().includes(r)||g.fields.tags?.toLocaleLowerCase().includes(r)):B,h=F?`
      <div class="link-picker">
        <p>Selecting an existing record replaces every persistent DWTools field on this token.</p>
        <label>Search characters<input id="link-search" type="search" value="${o(q)}"></label>
        <div class="link-results">
          ${i.length?i.map(g=>`
                <button type="button" data-link-record="${o(g.id)}" data-link-search="${o(`${g.fields.name} ${g.fields.tags??""}`.toLocaleLowerCase())}">
                  ${be(g)}
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
      ${h}
    </section>`}function u(){if(!s||!v)return;const e=ue==="hp";H.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${o(v.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${Ae(s)}
      ${f?`<p class="inline-error">${o(f)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${b(v.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${b(v.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(r=>`<button type="button" data-hp="${r}">${r>0?"+":""}${r}</button>`).join("")}
          </div>`:le(v)}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${l?"disabled":""}>${l?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const r=$e(a.value,n.value);r!==null&&(n.value=r)}),me(t);for(const r of t.querySelectorAll("[data-hp]"))r.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(r.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{d.popover.close(Z)}),document.querySelector("#remove")?.addEventListener("click",()=>{Ge()}),document.querySelector("#link-character")?.addEventListener("click",()=>{He()});for(const r of document.querySelectorAll("#create-character"))r.addEventListener("click",()=>{Fe()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Ne()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{F=!1,q="",u()}),document.querySelector("#link-search")?.addEventListener("input",r=>{q=r.currentTarget.value;const i=q.trim().toLocaleLowerCase();for(const h of document.querySelectorAll("[data-link-search]"))h.hidden=!String(h.dataset.linkSearch).includes(i)});for(const r of document.querySelectorAll("[data-link-record]"))r.addEventListener("click",()=>{Pe(r.dataset.linkRecord)});t.addEventListener("submit",r=>{r.preventDefault(),Ue(t)})}async function A(){if(!W||!p||!M)return;const e=await p.getItem(W);if(!e){H.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ae=N in e.metadata,s=e,v=ie(e);const t=O(e);w=t?await M.inspect(t.characterId):{status:"missing"},w.status==="active"&&(v=w.record.fields),u()}async function He(){if(!(!M||l)){l=!0,f=void 0,u();try{B=await M.list(),F=!0}catch(e){f=$(e,"DWTools could not load character records.")}finally{l=!1,u()}}}async function Pe(e){if(!e||!p||!s||l)return;const t=B.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools fields will be replaced by the latest character record.`)){l=!0,f=void 0,u();try{await p.linkToExistingCharacter(s.id,e),C(`Linked to ${t.fields.name}.`,"SUCCESS"),F=!1,await A()}catch(a){f=$(a,"DWTools could not link the character.")}finally{l=!1,u()}}}async function Fe(){if(!(!p||!s||l)){l=!0,f=void 0,u();try{const{record:e}=await p.createAndLinkCharacter(s.id);C(`Created and linked ${e.fields.name}.`,"SUCCESS"),F=!1,await A()}catch(e){f=$(e,"DWTools could not create and link the character.")}finally{l=!1,u()}}}async function Ne(){if(!(!p||!s||l)){l=!0,f=void 0,u();try{await p.unlinkCharacter(s.id),C("Character unlinked; creature fields were retained.","SUCCESS"),await A()}catch(e){f=$(e,"DWTools could not unlink the character.")}finally{l=!1,u()}}}async function Ge(){if(!(!p||!s||l||O(s)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){l=!0,u();try{await p.removeCreatureData(s.id),await d.popover.close(Z)}catch(t){f=$(t,"DWTools could not remove the creature data."),l=!1,u()}}}async function Ue(e){if(!(!p||!s||!v||l)){if(!X(e)||!e.reportValidity()){f="Correct the highlighted creature fields before saving.",u();return}l=!0,f=void 0,u();try{const t=ue==="hp",a=se(ce(new FormData(e),v,t));let n=De(v,a,t);!ae&&!O(s)&&(n=a),Object.keys(n).length&&await p.updateCreatureFields(s.id,n),C(O(s)?"Character record saved.":"Creature saved.","SUCCESS"),await d.popover.close(Z)}catch(t){f=$(t,"DWTools could not save the creature."),l=!1,u()}}}async function Be(){if(!W)return;M=re(),p=oe(M);const[e,t]=await Promise.all([p.getItem(W),d.room.getMetadata().catch(i=>(console.warn("DWTools could not load room visibility settings",i),{}))]);if(!e){H.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ae=N in e.metadata;const a=Me(e.metadata[N],Q(t));s={...e,metadata:{...e.metadata,[N]:a}},v=ie(s);const n=O(s);w=n?await M.inspect(n.characterId):{status:"missing"},w.status==="active"&&(v=w.record.fields),u();const r=[M.subscribe(i=>{const h=s&&O(s);h&&i.some(g=>g.characterId===h.characterId)&&!l&&A()}),d.scene.items.onChange(i=>{i.find(g=>g.id===W)&&!l&&A()})];window.addEventListener("unload",()=>{for(const i of r)i()},{once:!0})}ne==="home"?(y="GM",T={[V]:_.get("default")!=="hidden"},P=[{schemaVersion:1,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],ee=new Map([["preview-active",2]]),Y={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},c()):ne==="editor"?(s={id:"preview",name:"Frogman",metadata:{}},v={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},u()):W?d.isAvailable?d.onReady(()=>{Be()}):H.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(c(),d.isAvailable&&d.onReady(()=>{qe()}));
