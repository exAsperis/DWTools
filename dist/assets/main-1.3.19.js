import{P as $e,Q as ya,B as ee,R as ga,S as Ht,T as lt,U as dt,V as It,J as Lt,H as He,W as ba,K as jt,X as Bt,Y as wa,A as $a,G as ka,Z as Sa,_ as Ca,E as Vt,$ as Ea,a0 as Oe,a1 as Qe,a2 as Ia,a3 as La,a4 as Ft,F as Ee,g as je,j as _t,C as Q,a5 as Ze,a6 as Gt,k as z,a7 as Ie,O as m,a8 as Ta,M as vt,v as Ut,w as Yt,a9 as zt,aa as Kt,ab as xa,ac as Ma,ad as Da,ae as Oa,af as Tt,ag as Ra,N as Xt,ah as Aa}from"./obrMetadataMigration-1.3.19.js";import{c as qa}from"./characterSceneStore-1.3.19.js";import{r as Pa,s as Na,D as xt,a as Wa}from"./contextMarkdown-1.3.19.js";function ce(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function at(e,t,a,n){return`<label class="tag-field"><span>${ce(e)}</span>
    <div class="tag-editor" data-tag-editor="${t}">
      <input type="hidden" name="${t}" value="${ce(ee(a))}">
      <span class="tag-values"></span>
      <span class="tag-entry"><input id="${ce(n)}" class="tag-input" type="text" maxlength="160" autocomplete="off"><span class="tag-suggestion" aria-hidden="true"></span></span>
    </div>
  </label>`}function Jt(e,t){for(const a of e.querySelectorAll("[data-tag-editor]")){const n=a.dataset.tagEditor,o=a.querySelector('input[type="hidden"]'),r=a.querySelector(".tag-input"),s=a.querySelector(".tag-values"),c=a.querySelector(".tag-suggestion");let i=$e(o.value)??[],l="";const v=()=>r.value===l?void 0:ga(r.value,i,t[n]??[]),p=()=>{const f=v();c.textContent=f?`${r.value}${f.slice(r.value.trim().length)}`:""},I=()=>{o.value=ee(i),s.innerHTML=i.map((f,w)=>`<span class="tag-value"><span>${ce(f)}</span><button type="button" data-remove-tag="${w}" aria-label="Remove ${ce(f)}" title="Remove ${ce(f)}">×</button></span>${w<i.length-1?'<span class="tag-separator" aria-hidden="true">, </span>':""}`).join("");for(const f of s.querySelectorAll("[data-remove-tag]"))f.addEventListener("click",()=>{i.splice(Number(f.dataset.removeTag),1),I(),o.dispatchEvent(new Event("change",{bubbles:!0})),r.focus()});p()},d=f=>{let w;try{w=$e([...i,f??r.value])??[]}catch(ae){return r.setCustomValidity(ae instanceof Error?ae.message:"Tags are invalid."),!1}r.setCustomValidity("");const O=ee(w)!==ee(i);return i=w,r.value="",l="",I(),O&&o.dispatchEvent(new Event("change",{bubbles:!0})),!0};r.addEventListener("input",()=>{l="",r.setCustomValidity(""),p()}),r.addEventListener("keydown",f=>{const w=v(),O=ya(f.key,r.value,w);if(O==="commit-draft"){const ae=d();(f.key===","||!ae)&&f.preventDefault()}else O==="commit-suggestion"?(f.preventDefault(),d(w)):O==="dismiss-suggestion"&&(f.preventDefault(),l=r.value,p())}),a.addEventListener("focusout",()=>{window.setTimeout(()=>{!a.contains(document.activeElement)&&r.value.trim()&&d()})}),a.closest("form")?.addEventListener("submit",f=>{d()||f.preventDefault()},{capture:!0}),a.addEventListener("click",f=>{(f.target===a||f.target===s)&&r.focus()}),I()}}function u(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function S(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function Qt(e,t="",a="creature"){const n=v=>`${t}${v}`,o=e.scores??Ht(),r=lt(e.hpBase,o[2]),s=dt(e.loadBase,o[0]),c=r!==void 0&&e.hpMax!==r,i=s!==void 0&&e.maxLoad!==s,l=o.map((v,p)=>`
        <div class="ability-row">
          <label class="ability-score">${It[p]}
            <input id="${n(`score-${p}`)}" name="score-${p}" type="number" min="3" max="18" step="1" value="${S(v)}">
          </label>
          <span class="ability-modifier" aria-label="${It[p]} modifier">
            <span class="ability-modifier-label">${Lt[p]}</span>
            <span class="ability-modifier-value" data-score-modifier="${p}">${jt(Bt(v))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${He[p]}`)}" name="condition-${He[p]}" type="checkbox" ${e.conditions?.[He[p]]===-1?"checked":""}>
            ${ba[p]} <span>−1 ${Lt[p]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${u(e.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${n("armor")}" name="armor" type="number" step="1" value="${S(e.armor)}"></label>
        <label>Current HP<input id="${n("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${S(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${n("hpMax")}" name="hpMax" class="${c?"calculation-mismatch":""}" type="number" min="0" step="1" value="${S(e.hpMax)}">
          <span class="calculated-hint" data-calculated-hp>Calculated: ${r??"—"}</span>
        </label>
      </div>
      ${at("Armor tags","armorTags",e.armorTags,n("armorTags"))}
      <div class="damage-fields">
        <label>Damage die<input id="${n("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${u(e.damage??"")}"></label>
        <label>Damage description<input id="${n("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${u(e.damageDescription??"")}"></label>
      </div>
      ${at("Damage tags","damageTags",e.damageTags,n("damageTags"))}
      <label class="visibility">
        <input id="${n("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
        Show the token overlay to players
      </label>
    </section>
    <details class="editor-section expandable-fields" ${a==="creature"?"open":""}>
      <summary><strong>GM Character</strong></summary>
      <div class="editor-section-body">
        ${at("Tags","tags",e.tags,n("tags"))}
        <label>Special qualities<textarea id="${n("specialQualities")}" name="specialQualities" rows="2">${u(e.specialQualities??"")}</textarea></label>
        <label>Instinct<textarea id="${n("instinct")}" name="instinct" rows="2">${u(e.instinct??"")}</textarea></label>
        <label>Moves<textarea id="${n("moves")}" name="moves" rows="4" placeholder="One move per line">${u(e.moves??"")}</textarea></label>
        <label>Treasure<textarea id="${n("treasure")}" name="treasure" rows="3">${u(e.treasure??"")}</textarea></label>
      </div>
    </details>
    <details class="editor-section expandable-fields player-fields" ${a==="character"?"open":""}>
      <summary><strong>Player Character</strong></summary>
      <div class="editor-section-body">
        <div class="progression-row">
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${S(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${S(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${u(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${S(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${S(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${i?"calculation-mismatch":""}" type="number" min="0" step="any" value="${S(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${s??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${l}</div>
      </div>
    </details>`}function Ha(e){const t=e.fields;return`${u(t.name)} · HP ${S(t.hpCurrent)||"—"}/${S(t.hpMax)||"—"} · ARM ${S(t.armor)||"—"} · DMG ${u(t.damage??"—")}`}function ja(e){return`Delete the Character "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function Ba(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
    <div class="inventory-row" data-inventory-row="${a}">
      <div class="inventory-primary">
        <input class="inventory-inline-input inventory-name" data-inventory-name="${a}" type="text" maxlength="120" value="${u(t[0])}" aria-label="Item name">
        <div class="inventory-actions">
          <button type="button" class="danger compact" data-inventory-remove="${a}" aria-label="Remove ${u(t[0])}">Remove</button>
          ${n.role==="GM"?`<button type="button" class="secondary compact" data-inventory-transfer="${a}">Transfer</button>`:""}
        </div>
      </div>
      <div class="inventory-metrics">
        <label class="inventory-metric">wt/ea:
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${S(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${u(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${u(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${u(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${Sa(Ca(t))}</strong></span>
      </div>
    </div>
    ${o?`<form class="transfer-form" data-transfer-form="${a}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${n.records.filter(r=>r.id!==e.id).map(r=>`<option value="${u(r.id)}">${u(r.fields.name)}</option>`).join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${t[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`:""}`}function Va(e,t){const a=e.inventory??[],n=wa($a(a),e.fields.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.fields.maxLoad===void 0?"Empty":ka(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${u(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${u(e.fields.name)} inventory">
          ${a.length?a.map((s,c)=>Ba(e,s,c,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
          ${t.draftCharacterId===e.id?`<form class="inventory-row inventory-draft" data-inventory-draft>
                <div class="inventory-primary">
                  <input class="inventory-inline-input inventory-name" name="name" type="text" maxlength="120" placeholder="Item name" aria-label="New item name" required>
                  <div class="inventory-actions">
                    <button type="button" class="secondary compact" data-inventory-draft-cancel>Cancel</button>
                    <button type="submit" class="primary compact">Save</button>
                  </div>
                </div>
                <div class="inventory-metrics">
                  <label class="inventory-metric">wt/ea:
                    <input class="inventory-inline-input inventory-weight" name="weight" type="number" min="0" step="any" value="0" aria-label="New item weight each" required>
                  </label>
                  <label class="inventory-metric">ct:
                    <input class="inventory-inline-input inventory-draft-count" name="count" type="number" min="1" step="1" value="1" aria-label="New item quantity or uses" required>
                  </label>
                  <span class="inventory-metric inventory-load">load: <strong>—</strong></span>
                </div>
              </form>`:""}
        </div>
        ${t.draftCharacterId===e.id?"":'<button type="button" class="secondary compact add-item" data-inventory-add>Add Item</button>'}
      </div>
    </details>`}function Fa(e,t){const a=t.expandedStats?.has(e.id)??!1;return`
    <details class="stats-section" data-stats-details="${u(e.id)}" ${a?"open":""}>
      <summary><strong>Stats</strong></summary>
      <div class="stats-editor">
        <form class="manager-form stats-form" data-character-stats="${u(e.id)}">
          ${Qt(e.fields,`stats-${e.id}-`,"character")}
        </form>
        ${t.role==="GM"?`<button type="button" class="danger compact stats-delete" data-delete-character="${u(e.id)}">Delete Character</button>`:""}
      </div>
    </details>`}function _a(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.linkedTokens?.get(e.id)??[],o=n.length||t.counts.get(e.id)||0,r=n.filter(s=>s.imageUrl).map(s=>`<img class="linked-token-thumbnail" src="${u(s.imageUrl)}" alt="${u(s.name)}" title="${u(s.name)}">`).join("");return`
    <details class="character-card" data-character-details="${u(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${u(e.fields.name)}</strong>
      </summary>
      <div class="character-card-body">
        <span>HP ${S(e.fields.hpCurrent)||"—"}/${S(e.fields.hpMax)||"—"} · ARM ${S(e.fields.armor)||"—"} · DMG ${u(e.fields.damage??"—")}</span>
        <div class="linked-token-line">
          ${r?`<span class="linked-token-thumbnails" aria-label="Linked tokens">${r}</span>`:""}
          <span>${o} linked token${o===1?"":"s"} in current scene · Updated ${u(new Date(e.updatedAt).toLocaleString())}</span>
        </div>
        ${Fa(e,t)}
        ${Va(e,t)}
      </div>
    </details>`}function Ga(e,t=!1){return`
    <section class="character-manager" data-home-section="characters">
      <div class="section-heading major-section-heading" draggable="true" data-drag-section="characters">
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>Character maintenance</span>
        </button>
      </div>
      ${t?`${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${u(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>_a(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}const ut=`${Vt}/developer-tools-enabled`;function Ua(e){try{return e.getItem(ut)==="true"}catch{return!1}}function Ya(e,t){try{t?e.setItem(ut,"true"):e.removeItem(ut)}catch{}}function Le(e){return[...e].sort((t,a)=>t.localeCompare(a))}function za(e,t){const a=Le(t);return e.length===t.length&&Le(e).every((n,o)=>n===a[o])}function nt(e){return{heads:Le(e.heads),revisionCount:Object.keys(e.revisions).length}}function ot(e){if(!e)return;const t=[...e.heads.map(a=>e.revisions[a]).filter(a=>a!==void 0),...Object.values(e.revisions)];for(const a of t)if(a.deleted!==!0&&a.fields.name)return a.fields.name}function Ka(e){return`${e.kind}: ${e.message}`}function Xa(e,t,a,n){const o=Ea(e),r=new Map(o.histories.map(d=>[d.characterId,d])),s=new Map(t.entries.map(d=>[d.characterId,d])),c=new Map((a?.histories??[]).map(d=>[d.characterId,d])),i=new Map,l=[],v=(d,f)=>{if(!d){l.push(f);return}const w=i.get(d)??[];w.push(f),i.set(d,w)};for(const d of o.issues)v("characterId"in d?d.characterId:void 0,`Room: ${Ka(d)}`);for(const d of t.issues)v(d.characterId,`Local: ${d.code}: ${d.message}`);for(const d of a?.issues??[])v(d.characterId,`Scene: ${d.code}: ${d.message}`);const p=new Set([...r.keys(),...s.keys(),...c.keys(),...i.keys()]),I=[];for(const d of Le(p)){const f=r.get(d),w=s.get(d),O=c.get(d),ae=i.get(d)??[];let _;ae.length>0?_="issue":w?n?O?w.sync.pendingRevisionIds.length>0?_="pending":w.history.heads.length>1||O.heads.length>1?_="branched":za(w.history.heads,O.heads)?_="synced":_="drift":_="scene-missing":_="scene-unavailable":_="local-missing",I.push({characterId:d,name:ot(w?.history)??ot(O)??ot(f)??d,status:_,...f?{room:nt(f)}:{},...w?{local:{...nt(w.history),pendingRevisionIds:Le(w.sync.pendingRevisionIds)}}:{},...O?{scene:nt(O)}:{},issues:[...ae]})}return{rows:I,roomCharacterCount:r.size,localCharacterCount:s.size,sceneCharacterCount:c.size,pendingCharacterCount:t.entries.filter(d=>d.sync.pendingRevisionIds.length>0).length,issueCount:o.issues.length+t.issues.length+(a?.issues.length??0),sceneReady:n,globalIssues:l.sort()}}function Ja(e){return e.length<=12?e:`${e.slice(0,8)}…`}function Zt(e){return e.length===0?"—":e.map(t=>`<code title="${u(t)}">${u(Ja(t))}</code>`).join(", ")}function rt(e,t){return t?`<div class="persistence-source"><strong>${u(e)}</strong><span>${t.revisionCount} revision${t.revisionCount===1?"":"s"}</span><span>Head${t.heads.length===1?"":"s"}: ${Zt(t.heads)}</span></div>`:`<div class="persistence-source persistence-source-missing"><strong>${u(e)}</strong><span>Missing</span></div>`}function Qa(e){return{synced:"Synced",pending:"Pending",branched:"Branched",drift:"Drift","local-missing":"Local missing","scene-missing":"Scene missing","scene-unavailable":"Scene unavailable",issue:"Issue"}[e]}function Za(e,t,a){const n=e?`<div class="persistence-summary"><span>Room <strong>${e.roomCharacterCount}</strong></span><span>Local <strong>${e.localCharacterCount}</strong></span><span>Scene <strong>${e.sceneCharacterCount}</strong></span><span>Pending <strong>${e.pendingCharacterCount}</strong></span><span>Issues <strong>${e.issueCount}</strong></span></div>`:"",o=e?.globalIssues.length?`<div class="persistence-global-issues">${e.globalIssues.map(s=>`<div>${u(s)}</div>`).join("")}</div>`:"",r=e?`<div class="persistence-character-list">${e.rows.length?e.rows.map(s=>`<details class="persistence-character"><summary><span><strong>${u(s.name)}</strong><small>${u(s.characterId)}</small></span><span class="persistence-status persistence-status-${s.status}">${Qa(s.status)}</span></summary><div class="persistence-character-body">${rt("Room",s.room)}${rt("Local",s.local)}${s.local?`<div class="persistence-pending"><strong>Pending:</strong> ${Zt(s.local.pendingRevisionIds)}</div>`:""}${e.sceneReady?rt("Scene",s.scene):'<div class="persistence-source persistence-source-missing"><strong>Scene</strong><span>Not ready</span></div>'}${s.issues.length?`<div class="persistence-row-issues">${s.issues.map(c=>`<div>${u(c)}</div>`).join("")}</div>`:""}</div></details>`).join(""):'<p class="manager-status">No Character persistence data found.</p>'}</div>`:`<p class="manager-status">${t?"Loading Character persistence…":"No diagnostics loaded."}</p>`;return`<section class="persistence-dev-panel"><div class="persistence-dev-heading"><div><strong>Character Persistence</strong><span>Shadow room → local ↔ scene diagnostics</span></div><button class="secondary persistence-refresh" type="button" id="persistence-dev-refresh" ${t?"disabled":""}>${t?"Refreshing…":"Refresh"}</button></div>${a?`<p class="persistence-dev-error">${u(a)}</p>`:""}${n}${o}${r}</section>`}const Fe=`${Vt}/creature-clipboard`,ea=1;function ta(e,t,a=new Date().toISOString()){const n=t.trim();if(!n)throw new Error("The copied token must have a name.");if(!Number.isFinite(Date.parse(a)))throw new Error("The copied-data timestamp is invalid.");return{schemaVersion:ea,sourceName:n,copiedAt:a,data:Oe(e)}}function en(e,t){e.setItem(Fe,JSON.stringify(t))}function aa(e){try{const t=e.getItem(Fe);if(t===null)return;const a=JSON.parse(t);if(a.schemaVersion!==ea||typeof a.sourceName!="string"||typeof a.copiedAt!="string")throw new Error("Unsupported creature clipboard.");return ta(a.data,a.sourceName,a.copiedAt)}catch{try{e.removeItem(Fe)}catch{}return}}function tn(e,t){return Qe({name:e,...t.data})}function an(e){e.removeItem(Fe)}function nn(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function ne(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function Mt(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function N(e,t){return String(e.get(t)??"").trim()||void 0}function on(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=ne(e,"hpCurrent"),n.hpMax=ne(e,"hpMax"),a)return n;n.tags=$e(N(e,"tags")),n.specialQualities=N(e,"specialQualities"),n.hpBase=ne(e,"hpBase"),n.maxLoad=Mt(e,"maxLoad"),n.loadBase=ne(e,"loadBase"),n.armor=ne(e,"armor"),n.armorTags=$e(N(e,"armorTags")),n.damage=N(e,"damage"),n.damageDescription=N(e,"damageDescription"),n.damageTags=$e(N(e,"damageTags")),n.instinct=N(e,"instinct"),n.moves=N(e,"moves"),n.treasure=N(e,"treasure"),n.level=ne(e,"level"),n.xp=ne(e,"xp");const o=Ht();for(let s=0;s<o.length;s+=1)o[s]=Mt(e,`score-${s}`)??null;n.scores=Ia(o);const r={};for(const s of He)e.get(`condition-${s}`)==="on"&&(r[s]=-1);return n.conditions=La(r),n.alignment=N(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function ft(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...on(e,t,a)}}function rn(e,t,a,n){return{x:e.x+a/2-t.x,y:e.y+n/2-t.y}}function yt(e){return e.filter(t=>t.layer==="CHARACTER"&&je(t)&&_t(t.metadata[Q])).map(t=>({id:t.id,itemText:je(t)?t.text.plainText.trim():"",itemName:t.name.trim(),imageUrl:je(t)?t.image.url:"",lastModified:t.lastModified??"",data:t.metadata[Q]})).sort((t,a)=>t.itemText.localeCompare(a.itemText,void 0,{sensitivity:"base"})||t.itemName.localeCompare(a.itemName,void 0,{sensitivity:"base"})||t.id.localeCompare(a.id))}function sn(e){if(typeof e!="object"||e===null||Array.isArray(e))return{schemaVersion:1,inactiveItemIds:[]};const t=e;if(!Array.isArray(t.inactiveItemIds))return{schemaVersion:1,inactiveItemIds:[]};const a=mt(t.inactiveItemIds).sort();return t.schemaVersion===1?{schemaVersion:1,inactiveItemIds:a}:t.schemaVersion!==2||!Array.isArray(t.activeItemIds)?{schemaVersion:1,inactiveItemIds:[]}:{schemaVersion:2,inactiveItemIds:a,activeItemIds:mt(t.activeItemIds).filter(n=>!a.includes(n))}}function mt(e){return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function Te(e){return sn(e[Ft])}function gt(e,t){const a=new Set(t.inactiveItemIds),n=new Map(e.map(i=>[i.id,i])),o=e.filter(i=>a.has(i.id));if(t.schemaVersion===1)return{active:e.filter(i=>!a.has(i.id)),inactive:o};const r=t.activeItemIds.map(i=>n.get(i)).filter(i=>i!==void 0&&!a.has(i.id)),s=new Set(r.map(i=>i.id));return{active:[...e.filter(i=>!a.has(i.id)&&!s.has(i.id)).sort((i,l)=>l.lastModified.localeCompare(i.lastModified)||cn(i,l)),...r],inactive:o}}function cn(e,t){return e.itemText.localeCompare(t.itemText,void 0,{sensitivity:"base"})||e.itemName.localeCompare(t.itemName,void 0,{sensitivity:"base"})||e.id.localeCompare(t.id)}function na(e,t){const a=new Set(e.map(o=>o.id)),{active:n}=gt(e,t);return{schemaVersion:2,inactiveItemIds:t.inactiveItemIds.filter(o=>a.has(o)).sort(),activeItemIds:n.map(o=>o.id)}}function oa(e,t){return t.schemaVersion===2&&e.inactiveItemIds.join("\0")===t.inactiveItemIds.join("\0")&&e.activeItemIds.join("\0")===t.activeItemIds.join("\0")}async function bt(e,t,a,n){for(let o=0;o<n;o+=1){const r=await e.getMetadata(),s=na(a,Te(r)),c=t(s);await e.setMetadata({[Ft]:c});const i=Te(await e.getMetadata());if(oa(c,i))return c}throw new Error("Encounter layout changed on another GM client. Try again.")}async function ln(e,t,a=3){const n=await e.getMetadata(),o=Te(n),r=na(t,o);return oa(r,o)?r:bt(e,s=>s,t,a)}async function dn(e,t,a,n,o=3){const r=new Set(t.map(s=>s.id));return bt(e,s=>{const c=new Set(s.inactiveItemIds),i=s.activeItemIds.filter(l=>l!==a);return n?(c.delete(a),r.has(a)&&i.unshift(a)):r.has(a)&&c.add(a),{schemaVersion:2,inactiveItemIds:[...c].sort(),activeItemIds:i}},t,o)}async function un(e,t,a,n=3){return bt(e,o=>{const r=new Set(o.activeItemIds),s=mt(a).filter(c=>r.has(c));for(const c of o.activeItemIds)s.includes(c)||s.push(c);return{...o,activeItemIds:s}},t,n)}function T(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function mn(e){const t=e.hpCurrent,a=e.hpMax;if(t===void 0&&a===void 0)return{text:"—",percent:0,color:"empty",adjustable:!1};const n=`${t??"—"}/${a??"—"}`;if(t!==void 0&&a!==void 0&&t>a)return{text:n,percent:100,color:"purple",adjustable:!0};const o=a&&a>0&&t!==void 0?Math.max(0,Math.min(100,t/a*100)):0;return{text:n,percent:o,color:o>50?"green":o>25?"amber":"red",adjustable:t!==void 0}}function ra(e){return`<span class="encounter-item-text">${T(e.itemText||"Unnamed character")}</span><span class="encounter-item-name">(${T(e.itemName||"Unnamed item")})</span>`}function sa(e){return e.imageUrl?`<img class="encounter-thumbnail" src="${T(e.imageUrl)}" alt="">`:'<span class="encounter-thumbnail encounter-thumbnail-empty" aria-hidden="true"></span>'}function ia(e,t,a){const n=t?"Move to Inactive":"Add to Encounter";return`<span class="encounter-actions"><button class="encounter-locate" type="button" data-encounter-locate="${T(e.id)}" aria-label="Locate on scene" title="Locate on scene">${Ee("map-pin")}</button><button class="encounter-activity" type="button" data-encounter-active="${t?"false":"true"}" data-item-id="${T(e.id)}" aria-label="${n}" title="${n}" ${a?"disabled":""}>${Ee(t?"minus-circle":"plus-circle")}</button></span>`}function pn(e,t){const a=e.data,n=mn(a),o=a.damage?.trim(),r=a.damageDescription?.trim(),s=ee(a.damageTags),c=ee(a.armorTags),i=a.instinct?.trim(),l=a.moves?.trim(),v=t.has(e.id);return`<article class="encounter-card" data-encounter-item="${T(e.id)}">
    <div class="encounter-identity encounter-drag-handle" draggable="${v?"false":"true"}" data-encounter-drag="${T(e.id)}">${sa(e)}<span class="encounter-identity-copy">${ra(e)}</span>${ia(e,!0,v)}</div>
    <div class="encounter-combat">
      <span class="encounter-armor" title="Armor">${Ee("shield")}<span><strong>${a.armor??"—"}</strong>${c?`<em>${T(c)}</em>`:""}</span></span>
      <span class="encounter-damage">${Ee("sword")}<span class="encounter-damage-copy">${o?`<button type="button" data-encounter-damage="${T(o)}">🎲 ${T(o)}</button>`:"—"}${r?`<span> (${T(r)})</span>`:""}${s?`<em>${T(s)}</em>`:""}</span></span>
      <span class="encounter-hp"><button type="button" data-encounter-hp="-1" data-item-id="${T(e.id)}" aria-label="Decrease HP" ${!n.adjustable||v?"disabled":""}>−</button><span class="encounter-hp-bar hp-${n.color}"><span class="encounter-hp-fill" style="width:${n.percent}%"></span><strong>${n.text}</strong></span><button type="button" data-encounter-hp="1" data-item-id="${T(e.id)}" aria-label="Increase HP" ${!n.adjustable||v?"disabled":""}>+</button></span>
    </div>
    ${i?`<div class="encounter-instinct"><strong>Instinct:</strong> ${T(i)}</div>`:""}
    ${l?`<div class="encounter-moves"><strong>Moves:</strong><div class="markdown-content">${Pa(l)}</div></div>`:""}
  </article>`}function hn(e,t,a,n=new Set){const{active:o,inactive:r}=gt(e,t);return`<div class="encounter-list" data-encounter-active-list>${o.length?o.map(s=>pn(s,n)).join(""):'<p class="encounter-empty">No active DWTools creatures in this scene.</p>'}</div>
    <section class="encounter-inactive">
      <button class="section-toggle encounter-inactive-toggle" type="button" data-toggle-section="encounterInactive" aria-expanded="${a}"><span class="section-arrow" aria-hidden="true">&#9656;</span><span>Inactive (${r.length})</span></button>
      ${a?`<div class="encounter-inactive-list">${r.length?r.map(s=>`<div class="encounter-inactive-row">${sa(s)}<span class="encounter-identity-copy">${ra(s)}</span>${ia(s,!1,n.has(s.id))}</div>`).join(""):'<p class="encounter-empty">No inactive creatures.</p>'}</div>`:""}
    </section>`}function wt(e){const t=e[Ze];return typeof t=="boolean"?t:!0}function vn(e,t){return _t(e)?e:{visibleToPlayers:t}}async function fn(e,t){await e({[Ze]:t})}const M={agenda:!0,principles:!0,moves:!0,basicMoves:!0,specialMoves:!1,encounter:!1,encounterInactive:!1,settings:!1,characters:!1},_e=["agenda","principles","moves","encounter","settings","characters"];function yn(e){const t=new Set(_e),a=Array.isArray(e)?e.filter(o=>typeof o=="string"&&t.has(o)):[],n=[...new Set(a)];for(const o of _e)o!=="encounter"&&o!=="principles"&&!n.includes(o)&&n.push(o);if(!n.includes("principles")){const o=n.indexOf("agenda");n.splice(o>=0?o+1:0,0,"principles")}if(!n.includes("encounter")){const o=n.indexOf("moves");n.splice(o>=0?o+1:n.length,0,"encounter")}return n}const ca=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],la=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

On a 10+ the trailblazer reduces the amount of time it takes to reach your destination (the GM will say by how much). On a 10+ the scout will spot any trouble quick enough to let you get the drop on it. On a 7–9 each role performs their job as expected: the normal number of rations are consumed, the journey takes about as long as expected, no one gets the drop on you but you don’t get the drop on them either.`},{id:"level-up",name:"Level Up",text:`When you have downtime (hours or days) and XP equal to (or greater than) your current level + 7, subtract your current level + 7 from your XP, increase your level by 1, and choose a new advanced move from your class. If you are the wizard, you also get to add a new spell to your spellbook.

Choose one of your stats and increase it by 1 (this may change your modifier). Changing your Constitution increases your maximum and current HP. Ability scores can’t go higher than 18.`},{id:"end-of-session",name:"End of Session",text:`When you reach the end of a session, choose one of your bonds that you feel is resolved (completely explored, no longer relevant, or otherwise). Ask the player of the character you have the bond with if they agree. If they do, mark XP and write a new bond with whomever you wish.

Once bonds have been updated look at your alignment. If you fulfilled that alignment at least once this session, mark XP. Then answer these three questions as a group:

• Did we learn something new and important about the world?
• Did we overcome a notable monster or enemy?
• Did we loot a memorable treasure?

For each “yes” answer everyone marks XP.`},{id:"carouse",name:"Carouse",text:`When you return triumphant and throw a big party, spend 100 coin and roll + extra 100s of coin spent. On a 10+ choose 3. On a 7–9 choose 1. On a miss, you still choose one, but things get really out of hand.

• You befriend a useful NPC.
• You hear rumors of an opportunity.
• You gain useful information.
• You are not entangled, ensorcelled, or tricked.`},{id:"supply",name:"Supply",text:"When you go to buy something with gold on hand, if it’s something readily available in the settlement you’re in, you can buy it at market price. If it’s something special, beyond what’s usually available here, or non-mundane, roll+Cha. On a 10+ you find what you’re looking for at a fair price. On a 7–9 you’ll have to pay more or settle for something similar."},{id:"recover",name:"Recover",text:"When you do nothing but rest in comfort and safety after a day of rest you recover all your HP. After three days of rest you remove one debility of your choice. If you’re under the care of a healer (magical or otherwise) you heal a debility for every two days of rest instead."},{id:"recruit",name:"Recruit",text:`When you put out word that you’re looking to hire help, roll. If you make it known…

• …that your pay is generous, take +1.
• …what you’re setting out to do, take +1.
• …that they’ll get a share of whatever you find, take +1.

If you have a useful reputation around these parts take an additional +1. On a 10+ you’ve got your pick of a number of skilled applicants, your choice who you hire, no penalty for not taking them along. On a 7–9 you’ll have to settle for someone close or turn them away. On a miss someone influential and ill-suited declares they’d like to come along (a foolhardy youth, a loose cannon, or a veiled enemy, for example); bring them and take the consequences or turn them away.

If you turn away applicants you take -1 forward to Recruit.`},{id:"outstanding-warrants",name:"Outstanding Warrants",text:`When you return to a civilized place in which you’ve caused trouble before, roll+Cha. On a hit, word has spread of your deeds and everyone recognizes you. On a 7–9, that, and the GM chooses a complication:

• The local constabulary has a warrant out for your arrest.
• Someone has put a price on your head.
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function he(e,t,a){return`
    <div class="section-heading major-section-heading" draggable="true" data-drag-section="${t}">
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
      </button>
    </div>`}function Dt(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function gn(e,t,a,n=M,o="",r="",s="",c="dwtools",i=!1,l=""){const v=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section" data-home-section="agenda">
        ${he("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="principles">
        ${he("Principles","principles",n.principles)}
        ${n.principles?`<ul class="principles-list">
          <li>Draw maps, leave blanks</li>
          <li>Address the characters, not the players</li>
          <li>Embrace the fantastic</li>
          <li>Make a move that follows</li>
          <li>Never speak the name of your move</li>
          <li>Give every monster life</li>
          <li>Name every person</li>
          <li>Ask questions and use the answers</li>
          <li>Be a fan of the characters</li>
          <li>Think dangerous</li>
          <li>Begin and end with the fiction</li>
          <li>Think offscreen, too</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section" data-home-section="moves">
        ${he("Moves","moves",n.moves)}
        ${n.moves?`${Dt("Basic Moves","basicMoves",n.basicMoves,ca)}
        ${Dt("Special Moves","specialMoves",n.specialMoves,la)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section encounter-section" data-home-section="encounter">
        ${he("Encounter (Scene)","encounter",n.encounter)}
        ${n.encounter?r:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="settings">
        ${he("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${v}" title="${v}" ${a?"disabled":""}>
            ${Ee(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>
        <label class="dice-extension-setting" for="dice-extension">Dice rolling extension
          <select id="dice-extension">
            <option value="dwtools" ${c==="dwtools"?"selected":""}>DWTools</option>
            <option value="no-dice" ${c==="no-dice"?"selected":""}>No Dice</option>
          </select>
        </label>
        <label class="developer-tools-setting">
          <span>
            <strong>Developer tools</strong>
            <small>Show persistence diagnostics for this browser.</small>
          </span>
          <span class="setting-switch">
            <input id="developer-tools-toggle" type="checkbox" ${i?"checked":""} aria-label="Enable developer tools">
            <span class="setting-switch-track" aria-hidden="true"></span>
          </span>
        </label>
        ${i?l:""}`:""}
      </section>`:""}
      ${o}
      ${s?`<p class="extension-version">version ${s}</p>`:""}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`}function Ot(e){const t=e[Gt];return typeof t=="boolean"?t:!0}async function bn(e,t){await e({[Gt]:t})}function st(e,t,a,n){!n||!t||(a?e.add(t):e.delete(t))}function Rt(e,t,a){return t?a:e}function Ge(e){return Array.isArray(e)?`[${e.map(Ge).join(",")}]`:typeof e=="object"&&e!==null?`{${Object.entries(e).sort(([t],[a])=>t.localeCompare(a)).map(([t,a])=>`${JSON.stringify(t)}:${Ge(a)}`).join(",")}}`:JSON.stringify(e)}function da(e){return Ge(e.map(({id:t,itemText:a,itemName:n,imageUrl:o,data:r})=>({id:t,itemText:a,itemName:n,imageUrl:o,data:r})))}function ua(e){return Ge([...e.entries()].sort(([t],[a])=>t.localeCompare(a)))}function wn(e){const t=new Map;for(const a of e){const n=z(a);if(!n)continue;const o=t.get(n.characterId)??[];o.push({id:a.id,name:a.name.trim()||"Linked token",imageUrl:je(a)?a.image.url:""}),t.set(n.characterId,o)}return{encounter:da(yt(e)),linkedTokens:ua(t)}}const B=document.querySelector("#app"),xe=new URLSearchParams(window.location.search),le=xe.get("itemId"),ma=xe.get("view")??"edit",At=xe.get("preview");function Ue(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function E(e,t){return e instanceof Error?e.message:t}function g(e,t){m.isAvailable&&m.notification.show(e,t)}function $t(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=Da(t.value);const a=Oa(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function pa(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>$t(e))}function R(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function ha(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),o=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const r=()=>{for(let l=0;l<6;l+=1){const v=R(e,`score-${l}`),p=e.querySelector(`[data-score-modifier="${l}"]`);p&&(p.textContent=jt(Bt(v)))}const c=lt(R(e,"hpBase"),R(e,"score-2")),i=dt(R(e,"loadBase"),R(e,"score-0"));n&&(n.textContent=`Calculated: ${c??"—"}`),o&&(o.textContent=`Calculated: ${i??"—"}`),t.classList.toggle("calculation-mismatch",Tt(R(e,"hpMax"),c)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",Tt(R(e,"maxLoad"),i))},s=(c,i,l,v)=>{const p=e.elements.namedItem(c);!(p instanceof HTMLInputElement)||!(i instanceof HTMLInputElement)||(p.dataset.lastPromptedValue=p.value,p.addEventListener("blur",()=>{const I=p.dataset.lastPromptedValue??"",d=v();if(!Ra(I,p.value,R(e,i.name),d)){p.dataset.lastPromptedValue=p.value,r();return}p.dataset.lastPromptedValue=p.value;const f=i.value.trim()||"blank";window.confirm(`${l} changed. Recalculate ${i.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${f} to ${d}?`)&&(i.value=String(d)),r()}))};for(const c of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))c.addEventListener("input",r);s("score-2",t,"Constitution",()=>lt(R(e,"hpBase"),R(e,"score-2"))),s("score-0",a,"Strength",()=>dt(R(e,"loadBase"),R(e,"score-0"))),r()}function pt(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","specialQualities","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","armorTags","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],o={};for(const r of n)JSON.stringify(e[r])!==JSON.stringify(t[r])&&(o[r]=t[r]);return o}let D="PLAYER",j={},Be=!1,ye,ve,me,C,U=[],kt=new Map,Me=new Map,ge=!1,q=!1,P;const et=new Set,be=new Map;let de,J,Y=[],ht=Ie([]),te={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};const se=new Set;let Ve=!1,K,Pe=0;const Re=new Set,tt=new Set,$n="dwtools/home-sections";let H=Ua(window.localStorage),St,Ye=!1,ze,we=0,ke,Ke,it;function kn(){try{const e=JSON.parse(localStorage.getItem($n)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:M.agenda,principles:typeof e.principles=="boolean"?e.principles:M.principles,moves:typeof e.moves=="boolean"?e.moves:M.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:M.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:M.specialMoves,encounter:typeof e.encounter=="boolean"?e.encounter:M.encounter,encounterInactive:typeof e.encounterInactive=="boolean"?e.encounterInactive:M.encounterInactive,settings:typeof e.settings=="boolean"?e.settings:M.settings,characters:typeof e.characters=="boolean"?e.characters:M.characters}}catch{return{...M}}}function Sn(e){const t=typeof e=="object"&&e!==null?e:{};return Object.fromEntries(Object.entries(M).map(([a,n])=>[a,typeof t[a]=="boolean"?t[a]:n]))}function qt(e){const t=e[Kt];if(typeof t=="object"&&t!==null){const a=t;G=Sn(a.expanded),ue=yn(a.order);return}G=kn(),ue=[..._e]}async function Pt(){try{await m.player.setMetadata({[Kt]:{version:1,expanded:G,order:ue}})}catch(e){console.error("DWTools could not save the panel layout",e),g("DWTools could not save your panel layout.","ERROR")}}let G={...M},ue=[..._e],fe;function Cn(){return{records:U,counts:kt,linkedTokens:Me,role:D,loading:ge,saving:q,error:P,expandedCharacters:Re,expandedStats:et,expandedInventories:tt,draftCharacterId:de,transfer:J}}function En(){const e=(t,a)=>{for(const n of B.querySelectorAll(t)){const o=n.dataset.characterDetails??n.dataset.statsDetails??n.dataset.inventoryDetails;o&&(n.open?a.add(o):a.delete(o))}};e("[data-character-details]",Re),e("[data-stats-details]",et),e("[data-inventory-details]",tt)}function h(){En();const e=document.scrollingElement?.scrollLeft??window.scrollX,t=document.scrollingElement?.scrollTop??window.scrollY,a=wt(j),n=Ga(Cn(),G.characters),o=hn(Y,te,G.encounterInactive,se),r=H?Za(St,Ye,ze):"";B.innerHTML=gn(D,a,Be,G,n,o,Ta,Na(j),H,r),document.querySelector("#developer-tools-toggle")?.addEventListener("change",i=>{jn(i.currentTarget.checked)}),document.querySelector("#persistence-dev-refresh")?.addEventListener("click",()=>{re()}),document.querySelector("#dice-extension")?.addEventListener("change",i=>{const l=i.currentTarget.value;l!=="dwtools"&&l!=="no-dice"||m.room.setMetadata({[xt]:l}).then(()=>{j={...j,[xt]:l},h()}).catch(v=>{console.error("DWTools could not save the dice extension",v),g("Could not save the dice extension.","ERROR")})});const s=document.querySelector(".home"),c=document.querySelector(".extension-version, #move-dialog");if(s&&c)for(const i of ue){const l=s.querySelector(`[data-home-section="${i}"]`);l&&s.insertBefore(l,c)}document.querySelector("#default-visibility")?.addEventListener("click",()=>{Hn()});for(const i of document.querySelectorAll("[data-toggle-section]"))i.addEventListener("click",()=>{const l=i.dataset.toggleSection;G={...G,[l]:!G[l]},Pt(),h()});for(const i of document.querySelectorAll("[data-drag-section]")){const l=i.dataset.dragSection,v=i.closest("[data-home-section]");i.addEventListener("dragstart",p=>{fe=l,v?.classList.add("dragging"),p.dataTransfer?.setData("text/plain",l),p.dataTransfer&&(p.dataTransfer.effectAllowed="move")}),i.addEventListener("dragend",()=>{fe=void 0,document.querySelectorAll(".dragging, .drag-over").forEach(p=>p.classList.remove("dragging","drag-over"))}),v?.addEventListener("dragover",p=>{!fe||fe===l||(p.preventDefault(),v.classList.add("drag-over"))}),v?.addEventListener("dragleave",()=>v.classList.remove("drag-over")),v?.addEventListener("drop",p=>{p.preventDefault();const I=fe;if(!I||I===l)return;const d=ue.filter(f=>f!==I);d.splice(d.indexOf(l),0,I),ue=d,Pt(),h()})}for(const i of document.querySelectorAll("[data-move]"))i.addEventListener("click",()=>{const l=[...ca,...la].find(d=>d.id===i.dataset.move),v=document.querySelector("#move-dialog"),p=document.querySelector("#move-dialog-title"),I=document.querySelector("#move-dialog-text");!l||!v||!p||!I||(p.textContent=l.name,I.textContent=l.text,v.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),In(),Rn(),window.scrollTo(e,t)}function Nt(e){Wa(e)}function In(){Tn();for(const e of document.querySelectorAll("[data-encounter-locate]"))e.addEventListener("click",()=>{const t=e.dataset.encounterLocate;t&&Mn(t)});for(const e of document.querySelectorAll("[data-encounter-active]"))e.addEventListener("click",()=>{const t=e.dataset.itemId;t&&Dn(t,e.dataset.encounterActive==="true")});for(const e of document.querySelectorAll("[data-encounter-hp]"))e.addEventListener("click",()=>{const t=e.dataset.itemId,a=Number(e.dataset.encounterHp);t&&Number.isFinite(a)&&On(t,a)});for(const e of document.querySelectorAll("[data-encounter-damage]"))e.addEventListener("click",()=>{const t=e.dataset.encounterDamage;t&&Nt(t)});for(const e of document.querySelectorAll(".encounter-section [data-roll-expression]"))e.addEventListener("click",()=>{const t=e.dataset.rollExpression;t&&Nt(t)})}function Wt(){document.querySelectorAll(".encounter-dragging, .encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-dragging","encounter-drop-before","encounter-drop-after"))}function Ln(){document.querySelectorAll(".encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-drop-before","encounter-drop-after"))}function Tn(){if(!Ve)for(const e of document.querySelectorAll("[data-encounter-drag]")){const t=e.closest("[data-encounter-item]");t&&(e.addEventListener("dragstart",a=>{if(a.target.closest("button")){a.preventDefault();return}K=e.dataset.encounterDrag,t.classList.add("encounter-dragging"),a.dataTransfer&&K&&(a.dataTransfer.effectAllowed="move",a.dataTransfer.setData("text/plain",K))}),e.addEventListener("dragend",()=>{K=void 0,Wt()}),t.addEventListener("dragover",a=>{!K||K===t.dataset.encounterItem||(a.preventDefault(),Ln(),t.classList.add(a.clientY<t.getBoundingClientRect().top+t.offsetHeight/2?"encounter-drop-before":"encounter-drop-after"))}),t.addEventListener("drop",a=>{a.preventDefault();const n=K,o=t.dataset.encounterItem,r=t.classList.contains("encounter-drop-after");K=void 0,Wt(),n&&o&&n!==o&&xn(n,o,r)}))}}async function xn(e,t,a){if(D!=="GM"||Ve)return;const n=gt(Y,te).active.map(s=>s.id),o=n.filter(s=>s!==e),r=o.indexOf(t);if(!(r<0||!n.includes(e))&&(o.splice(r+(a?1:0),0,e),o.join("\0")!==n.join("\0"))){Ve=!0,h();try{te=await un(Ct(),Y,o)}catch(s){console.error("DWTools could not reorder the encounter",s),g(E(s,"DWTools could not save the encounter order."),"ERROR")}finally{Ve=!1,h()}}}async function Mn(e){if(D==="GM")try{const[t,a,n,o,r]=await Promise.all([m.scene.items.getItemBounds([e]),m.viewport.getScale(),m.viewport.getPosition(),m.viewport.getWidth(),m.viewport.getHeight()]),s=await m.viewport.transformPoint(t.center);await m.viewport.animateTo({position:rn(n,s,o,r),scale:a})}catch(t){console.error("DWTools could not locate the encounter item",t),g("That item is no longer available in the scene.","ERROR")}}function Ct(){return{getMetadata:()=>m.scene.getMetadata(),setMetadata:e=>m.scene.setMetadata(e)}}async function Dn(e,t){if(!(D!=="GM"||se.has(e))){se.add(e),h();try{te=await dn(Ct(),Y,e,t)}catch(a){console.error("DWTools could not update encounter activity",a),g(E(a,"DWTools could not update encounter activity."),"ERROR")}finally{se.delete(e),h()}}}async function On(e,t){if(!(D!=="GM"||!me||se.has(e))){se.add(e),h();try{const a=(await m.scene.items.getItems([e]))[0];if(!a)return;const n=yt([a])[0];if(!n||n.data.hpCurrent===void 0)return;await me.updateCreatureFields(e,{hpCurrent:Ma(n.data.hpCurrent,t)})}catch(a){console.error("DWTools could not update encounter HP",a),g(E(a,"DWTools could not update encounter HP."),"ERROR")}finally{se.delete(e),h()}}}async function Ne(e){const t=++Pe;if(!await m.scene.isReady()){if(t!==Pe)return;Y=[],ht=Ie([]),te={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};return}const a=e??await m.scene.items.getItems();if(t!==Pe)return;if(ht=Ie(a.flatMap(r=>{try{return[Oe(r.metadata[Q])]}catch{return[]}})),D!=="GM"){Y=[];return}const n=await m.scene.getMetadata();if(t!==Pe)return;Y=yt(a),te=Te(n);try{te=await ln(Ct(),Y)}catch(r){console.error("DWTools could not reconcile the encounter order",r)}}function Rn(){document.querySelector("#manager-create")?.addEventListener("click",()=>{An()});for(const e of document.querySelectorAll("[data-delete-character]"))e.addEventListener("click",()=>{Wn(e.dataset.deleteCharacter)});for(const e of document.querySelectorAll("[data-character-details]"))e.addEventListener("toggle",()=>{st(Re,e.dataset.characterDetails,e.open,e.isConnected)});for(const e of document.querySelectorAll("[data-stats-details]"))e.addEventListener("toggle",()=>{st(et,e.dataset.statsDetails,e.open,e.isConnected)});for(const e of document.querySelectorAll("[data-inventory-details]"))e.addEventListener("toggle",()=>{st(tt,e.dataset.inventoryDetails,e.open,e.isConnected)});qn(),Nn()}async function An(){if(!C||q)return;q=!0,P=void 0,h();let e;try{const t=await C.create({name:"Untitled character",visibleToPlayers:!0});e=t.id,await W(!1),Re.add(t.id),et.add(t.id)}catch(t){P=E(t,"DWTools could not create the Character.")}finally{q=!1,h(),e&&window.requestAnimationFrame(()=>{const t=document.querySelector(`[data-character-details="${CSS.escape(e)}"]`);t?.scrollIntoView({block:"nearest"}),t?.querySelector('[name="name"]')?.focus()})}}function qn(){for(const e of document.querySelectorAll("[data-character-stats]")){const t=e.dataset.characterStats;if(!t)continue;Jt(e,ht),pa(e),ha(e),e.addEventListener("submit",n=>n.preventDefault());const a=()=>Pn(t,e);for(const n of e.querySelectorAll("input, textarea, select"))n instanceof HTMLInputElement&&(n.type==="checkbox"||n.type==="radio"||n.type==="hidden")||n instanceof HTMLSelectElement?n.addEventListener("change",a):n.addEventListener("blur",a)}}function Pn(e,t){const a=U.find(c=>c.id===e);if(!a||!C||!$t(t)||!t.checkValidity())return;const n=Qe(ft(new FormData(t),a.fields,!1)),o=pt(a.fields,n,!1);if(!Object.keys(o).length)return;const s=(be.get(e)??Promise.resolve()).catch(()=>{}).then(async()=>{const c=U.find(l=>l.id===e);if(!c||!C)return;const i=pt(c.fields,n,!1);if(Object.keys(i).length)try{const l=await C.patch(e,i);U=U.map(v=>v.id===e?l:v),P=void 0}catch(l){P=E(l,"DWTools could not update these Character stats."),g(P,"ERROR")}}).finally(()=>{if(be.get(e)!==s)return;be.delete(e),document.querySelector(`[data-character-stats="${CSS.escape(e)}"]`)?.contains(document.activeElement)||h()});be.set(e,s)}function X(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return U.find(a=>a.id===t)}function ie(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function oe(e,t,a){if(!q){q=!0,P=void 0,a?Xe(a):h();try{await e(),de=void 0,J=void 0,await W(!1),t&&g(t,"SUCCESS")}catch(n){const o=E(n,"DWTools could not update this inventory.");await W(!1),P=o}finally{q=!1,a?Xe(a):h()}}}function Xe(e,t=!1){h(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function ct(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function Nn(){if(!C)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=X(a),o=Number(a.dataset.inventoryName),r=n&&ie(n,o);!n||!r||ct(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const s=[a.value,r.expected[1],r.expected[2]];oe(()=>C.updateInventoryItem(n.id,r,s))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=X(a),o=Number(a.dataset.inventoryWeight),r=n&&ie(n,o);if(!n||!r)continue;const s=String(r.expected[1]);ct(a,s,()=>{if(a.value===s)return;const c=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];oe(()=>C.updateInventoryItem(n.id,r,c))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=X(a),o=Number(a.dataset.inventoryCount),r=n&&ie(n,o);if(!n||!r)continue;const s=String(r.expected[2]);ct(a,s,()=>{if(a.value===s)return;const c=a.value.trim()===""?Number.NaN:Number(a.value);oe(()=>C.changeInventoryItemCount(n.id,r,c-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=X(a),o=Number(a.dataset.inventoryAdjust),r=n&&ie(n,o),s=Number(a.dataset.change);!n||!r||oe(()=>C.changeInventoryItemCount(n.id,r,s))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=X(a),o=Number(a.dataset.inventoryRemove),r=n&&ie(n,o);!n||!r||oe(()=>C.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=X(a);n&&(de=n.id,Re.add(n.id),tt.add(n.id),Xe(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=de;de=void 0,a?Xe(a):h()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=X(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];oe(()=>C.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=X(a),o=Number(a.dataset.inventoryTransfer),r=n&&ie(n,o);!n||!r||(J={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},h())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{J=void 0,h()});const t=document.querySelector("[data-transfer-form]");t&&J&&t.addEventListener("submit",a=>{if(a.preventDefault(),!J||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),s=J;oe(()=>C.transferInventoryItem(s.sourceCharacterId,o,{sourceIndex:s.sourceIndex,expected:s.expected},r),"Item transferred.")})}async function W(e=!0){if(!(!ye||!me||!C)){ge=Rt(ge,e,!0),P=void 0,e&&h();try{[U,Me]=await Promise.all([C.listAccessible(),xa(me.scene)]),kt=new Map([...Me].map(([t,a])=>[t,a.length]))}catch(t){P=E(t,"DWTools could not load character records.")}finally{ge=Rt(ge,e,!1),e&&h()}}}async function Wn(e){if(!e||!C||q)return;const t=U.find(a=>a.id===e);if(t&&window.confirm(ja(t.fields.name))){q=!0,P=void 0,h();try{await C.delete(e),g("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await W(!1)}catch(a){P=E(a,"DWTools could not delete the record.")}finally{q=!1,h()}}}async function Hn(){if(D!=="GM"||Be)return;const e=!wt(j);Be=!0,h();try{await fn(t=>m.room.setMetadata(t),e),j={...j,[Ze]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),g("DWTools could not save the default overlay visibility.","ERROR")}finally{Be=!1,h()}}async function re(e=!0){if(!H||!ke||!Ke)return;const t=++we;Ye=!0,ze=void 0,e&&h();try{const[a,n]=await Promise.all([m.room.getMetadata(),m.scene.isReady()]),o=ke.scan(),r=n?await Ke.scan():void 0;if(t!==we||!H)return;St=Xa(a,o,r,n)}catch(a){if(t!==we)return;ze=E(a,"Could not load Character persistence diagnostics.")}finally{t===we&&(Ye=!1,e&&h())}}function jn(e){if(H=e,Ya(window.localStorage,e),!e){we+=1,St=void 0,ze=void 0,Ye=!1,h();return}h(),re()}async function Bn(){try{await Ut()}catch(o){console.error("DWTools metadata namespace migration failed",o),B.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',g("DWTools could not migrate its saved data.","ERROR");return}try{ve=await Yt()}catch(o){console.error("DWTools Character persistence bootstrap failed",o),B.innerHTML='<p class="error">DWTools could not safely open Character storage. Reload Owlbear and try again.</p>',g("DWTools could not safely open Character storage.","ERROR");return}ye=ve.repository,me=Xt(ye),C=Aa(ye,me);const[e,t,a]=await Promise.all([m.player.getRole(),m.room.getMetadata(),m.player.getMetadata(),m.theme.getTheme().then(Ue)]);D=e,j=t,qt(a),ke=ve.localStore,Ke=qa(),it=ke.subscribe(()=>{H&&re(!1).then(h)}),await Promise.all([W(!1),Ne(),H?re(!1):Promise.resolve()]),h();const n=[m.room.onMetadataChange(o=>{if(j=o,H){re(!1).then(h);return}h()}),ye.subscribe(()=>{W(be.size===0&&(D==="PLAYER"||!q))}),m.player.onChange(o=>{D=o.role,qt(o.metadata),de=void 0,J=void 0,Promise.all([W(),Ne()]).then(h)}),m.scene.items.onChange(o=>{const r=wn(o),s=r.encounter!==da(Y),c=r.linkedTokens!==ua(Me);!s&&!c||Promise.all([s?Ne(o):Promise.resolve(),c?W(!1):Promise.resolve()]).then(h)}),m.scene.onMetadataChange(o=>{if(te=Te(o),H){re(!1).then(h);return}h()}),m.scene.onReadyChange(()=>{Promise.all([W(),Ne(),H?re(!1):Promise.resolve()]).then(h)}),m.room.onPermissionsChange(()=>{W(D==="PLAYER"||!q)}),m.theme.onChange(Ue)];window.addEventListener("unload",()=>{for(const o of n)o();it?.(),it=void 0,ve?.close(),ve=void 0,ke=void 0,Ke=void 0},{once:!0})}let Z,We,x,y,$,A={status:"missing"},Je=[],Ae=!1,Se="",b=!1,V=!0,Ce=!1,L,qe=!1,F,pe,va=Ie([]);function Vn(e){const t=z(e);let a,n;t?A.status==="active"?(a=`Character record: <strong>${u(A.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${A.status==="malformed"?"malformed":A.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=Se.trim().toLocaleLowerCase(),r=o?Je.filter(c=>c.fields.name.toLocaleLowerCase().includes(o)||ee(c.fields.tags).toLocaleLowerCase().includes(o)):Je,s=Ae?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${V?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${u(Se)}"></label>
        <div class="link-results">
          ${r.length?r.map(c=>`
                <button type="button" data-link-record="${u(c.id)}" data-link-search="${u(`${c.fields.name} ${ee(c.fields.tags)}`.toLocaleLowerCase())}">
                  ${Ha(c)}
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
      <label class="visibility">
        <input id="overwrite-label" type="checkbox" ${V?"checked":""} ${Ce?"disabled":""}>
        Overwrite label
      </label>
      ${s}
    </section>`}function fa(e){return e?`Copied from ${e.sourceName} · ${new Date(e.copiedAt).toLocaleString()}`:"No copied DWTools data."}function Fn(){const e=qe||A.status==="active";return`
    <section class="creature-clipboard-section">
      <div class="creature-clipboard-heading">
        <strong>DWTools data clipboard</strong>
        <span data-clipboard-status>${u(fa(F))}</span>
      </div>
      ${pe?`<p class="clipboard-staged">Pasted data from ${u(pe.sourceName)} is staged. Save to apply it.</p>`:""}
      <div class="clipboard-actions">
        <button class="secondary" type="button" id="copy-creature-data" ${e&&!b?"":"disabled"}>Copy DWTools data</button>
        <button class="secondary" type="button" id="paste-creature-data" ${F&&!b?"":"disabled"}>Paste DWTools data</button>
        <button class="secondary" type="button" id="clear-creature-data" ${F&&!b?"":"disabled"}>Clear copied data</button>
      </div>
    </section>`}function k(){if(!y||!$)return;const e=ma==="hp";B.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${u($.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${Vn(y)}
      ${L?`<p class="inline-error">${u(L)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${S($.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${S($.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:Qt($)}
      ${e?"":Fn()}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${b?"disabled":""}>${b?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=nn(a.value,n.value);o!==null&&(n.value=o)}),pa(t),ha(t),Jt(t,va);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{m.popover.close(vt)}),document.querySelector("#remove")?.addEventListener("click",()=>{Zn()}),document.querySelector("#copy-creature-data")?.addEventListener("click",()=>_n()),document.querySelector("#paste-creature-data")?.addEventListener("click",()=>Yn(t)),document.querySelector("#clear-creature-data")?.addEventListener("click",()=>Gn()),document.querySelector("#link-character")?.addEventListener("click",()=>{zn()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{Kn(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{Jn()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Qn()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{Ae=!1,Se="",k()}),document.querySelector("#link-search")?.addEventListener("input",o=>{Se=o.currentTarget.value;const r=Se.trim().toLocaleLowerCase();for(const s of document.querySelectorAll("[data-link-search]"))s.hidden=!String(s.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{Xn(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),eo(t)})}function Et(){const e=document.querySelector("[data-clipboard-status]");e&&(e.textContent=fa(F));const t=document.querySelector("#paste-creature-data"),a=document.querySelector("#clear-creature-data");t&&(t.disabled=!F),a&&(a.disabled=!F)}function _n(){if(!y||!$||!qe&&A.status!=="active"){g("This token has no saved DWTools data to copy.","WARNING");return}try{const e=ta(Oe($),y.name);en(window.localStorage,e),F=e,Et(),g(`Copied DWTools data from ${e.sourceName}.`,"SUCCESS")}catch(e){g(E(e,"DWTools could not copy the creature data."),"ERROR")}}function Gn(){try{an(window.localStorage),F=void 0,Et(),g("Copied DWTools data cleared.","SUCCESS")}catch(e){g(E(e,"DWTools could not clear the copied data."),"ERROR")}}function Un(e){if(!$)return!1;try{const t=Qe(ft(new FormData(e),$,!1));return JSON.stringify(t)!==JSON.stringify($)}catch{return!0}}function Yn(e){if(!y||!$)return;if(z(y)){g("Unlink this token from its Character record before pasting DWTools data.","ERROR");return}const t=aa(window.localStorage);if(F=t,!t){Et(),g("There is no valid copied DWTools data to paste.","WARNING");return}Un(e)&&!window.confirm("Replace the unsaved form values with the copied DWTools data?")||($=tn($.name,t),pe=t,L=void 0,k())}async function De(){if(!le||!x||!Z)return;const e=await x.getItem(le);if(!e){B.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}qe=Q in e.metadata,pe=void 0,y=e,$=zt(e);const t=z(e);A=t?await Z.inspect(t.characterId):{status:"missing"},A.status==="active"&&($=A.record.fields),k()}async function zn(){if(!(!Z||b)){b=!0,L=void 0,k();try{Je=await Z.list(),Ae=!0}catch(e){L=E(e,"DWTools could not load character records.")}finally{b=!1,k()}}}async function Kn(e){if(Ce)return;const t=V;V=e,Ce=!0,k();try{await bn(a=>m.room.setMetadata(a),e)}catch(a){V=t,L=E(a,"DWTools could not save the overwrite-label setting.")}finally{Ce=!1,k()}}async function Xn(e){if(!e||!x||!y||b)return;const t=Je.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${V?"overwritten":"retained"}.`)){b=!0,L=void 0,k();try{await x.linkToExistingCharacter(y.id,e,V),g(`Linked to ${t.fields.name}.`,"SUCCESS"),Ae=!1,await De()}catch(a){L=E(a,"DWTools could not link the character.")}finally{b=!1,k()}}}async function Jn(){if(!(!x||!y||b)){b=!0,L=void 0,k();try{const{record:e}=await x.createAndLinkCharacter(y.id);g(`Created and linked ${e.fields.name}.`,"SUCCESS"),Ae=!1,await De()}catch(e){L=E(e,"DWTools could not create and link the character.")}finally{b=!1,k()}}}async function Qn(){if(!(!x||!y||b)){b=!0,L=void 0,k();try{await x.unlinkCharacter(y.id),g("Character unlinked; creature fields were retained.","SUCCESS"),await De()}catch(e){L=E(e,"DWTools could not unlink the character.")}finally{b=!1,k()}}}async function Zn(){if(!(!x||!y||b||z(y)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){b=!0,k();try{await x.removeCreatureData(y.id),await m.popover.close(vt)}catch(t){L=E(t,"DWTools could not remove the creature data."),b=!1,k()}}}async function eo(e){if(!(!x||!y||!$||b)){if(!$t(e)||!e.reportValidity()){L="Correct the highlighted creature fields before saving.",k();return}b=!0,L=void 0,k();try{const t=ma==="hp",a=Qe(ft(new FormData(e),$,t)),n=!!pe;if(n)await x.replaceUnlinkedCreatureData(y.id,Oe(a)),pe=void 0;else{let o=pt($,a,t);!qe&&!z(y)&&(o=a),Object.keys(o).length&&await x.updateCreatureFields(y.id,o)}g(n?"Copied DWTools data saved.":z(y)?"Character record saved.":"Creature saved.","SUCCESS"),await m.popover.close(vt)}catch(t){L=E(t,"DWTools could not save the creature."),b=!1,k()}}}async function to(){if(!le)return;try{await Ut()}catch(s){console.error("DWTools metadata namespace migration failed",s),B.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',g("DWTools could not migrate its saved data.","ERROR");return}try{We=await Yt()}catch(s){console.error("DWTools Character persistence bootstrap failed",s),B.innerHTML='<p class="error">DWTools could not safely open Character storage. Reload Owlbear and try again.</p>',g("DWTools could not safely open Character storage.","ERROR");return}Z=We.repository,x=Xt(Z),F=aa(window.localStorage);const[e,t,a]=await Promise.all([x.getItem(le),m.room.getMetadata().catch(s=>(console.warn("DWTools could not load room visibility settings",s),{})),m.scene.items.getItems(),m.theme.getTheme().then(Ue)]);if(va=Ie(a.flatMap(s=>{try{return[Oe(s.metadata[Q])]}catch{return[]}})),!e){B.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}qe=Q in e.metadata;const n=vn(e.metadata[Q],wt(t));V=Ot(t),y={...e,metadata:{...e.metadata,[Q]:n}},$=zt(y);const o=z(y);A=o?await Z.inspect(o.characterId):{status:"missing"},A.status==="active"&&($=A.record.fields),k();const r=[Z.subscribe(s=>{const c=y&&z(y);c&&s.some(i=>i.characterId===c.characterId)&&!b&&De()}),m.scene.items.onChange(s=>{s.find(i=>i.id===le)&&!b&&De()}),m.room.onMetadataChange(s=>{Ce||(V=Ot(s),k())}),m.theme.onChange(Ue)];window.addEventListener("unload",()=>{for(const s of r)s();We?.close(),We=void 0},{once:!0})}At==="home"?(D="GM",j={[Ze]:xe.get("default")!=="hidden"},U=[{schemaVersion:4,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:["Cautious","Loyal"]},revision:3,parents:[],createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],kt=new Map([["preview-active",2]]),Me=new Map([["preview-active",[{id:"preview-token-1",name:"Raganah one",imageUrl:"/icon.svg"},{id:"preview-token-2",name:"Raganah two",imageUrl:"/icon.svg"}]]]),h()):At==="editor"?(V=xe.get("overwriteLabel")?.toLocaleLowerCase()!=="false",y={id:"preview",name:"Frogman",metadata:{}},$={name:"Frogman",hpCurrent:7,hpMax:10,tags:["Solitary","Small","Intelligent","Stealthy","Devious"],specialQualities:"Amphibious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:["Close","Messy"],instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},k()):le?m.isAvailable?m.onReady(()=>{to()}):B.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(h(),m.isAvailable&&m.onReady(()=>{Bn()}));
