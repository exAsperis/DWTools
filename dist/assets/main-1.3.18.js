import{K as ye,M as ea,y as X,N as ta,P as Ct,Q as Ke,R as Xe,S as ut,G as mt,B as De,T as aa,H as Et,U as xt,V as na,x as oa,A as ra,W as ia,X as sa,E as ca,Y as Ce,Z as je,_ as la,$ as da,a0 as Lt,z as ge,i as Oe,f as It,e as z,a1 as Fe,a2 as Tt,g as G,a3 as be,O as l,a4 as ua,J as tt,r as Mt,t as Dt,I as Ot,a5 as ma,a6 as At,a7 as Rt,a8 as pa,a9 as ha,aa as ya,ab as pt,ac as fa}from"./obrMetadataMigration-1.3.18.js";import{r as va,s as ga,D as ht,a as ba,b as wa}from"./contextMarkdown-1.3.18.js";function oe(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function _e(e,t,a,n){return`<label class="tag-field"><span>${oe(e)}</span>
    <div class="tag-editor" data-tag-editor="${t}">
      <input type="hidden" name="${t}" value="${oe(X(a))}">
      <span class="tag-values"></span>
      <span class="tag-entry"><input id="${oe(n)}" class="tag-input" type="text" maxlength="160" autocomplete="off"><span class="tag-suggestion" aria-hidden="true"></span></span>
    </div>
  </label>`}function qt(e,t){for(const a of e.querySelectorAll("[data-tag-editor]")){const n=a.dataset.tagEditor,o=a.querySelector('input[type="hidden"]'),r=a.querySelector(".tag-input"),i=a.querySelector(".tag-values"),c=a.querySelector(".tag-suggestion");let s=ye(o.value)??[],d="";const p=()=>r.value===d?void 0:ta(r.value,s,t[n]??[]),m=()=>{const g=p();c.textContent=g?`${r.value}${g.slice(r.value.trim().length)}`:""},A=()=>{o.value=X(s),i.innerHTML=s.map((g,B)=>`<span class="tag-value"><span>${oe(g)}</span><button type="button" data-remove-tag="${B}" aria-label="Remove ${oe(g)}" title="Remove ${oe(g)}">×</button></span>${B<s.length-1?'<span class="tag-separator" aria-hidden="true">, </span>':""}`).join("");for(const g of i.querySelectorAll("[data-remove-tag]"))g.addEventListener("click",()=>{s.splice(Number(g.dataset.removeTag),1),A(),o.dispatchEvent(new Event("change",{bubbles:!0})),r.focus()});m()},R=g=>{let B;try{B=ye([...s,g??r.value])??[]}catch(Ie){return r.setCustomValidity(Ie instanceof Error?Ie.message:"Tags are invalid."),!1}r.setCustomValidity("");const de=X(B)!==X(s);return s=B,r.value="",d="",A(),de&&o.dispatchEvent(new Event("change",{bubbles:!0})),!0};r.addEventListener("input",()=>{d="",r.setCustomValidity(""),m()}),r.addEventListener("keydown",g=>{const B=p(),de=ea(g.key,r.value,B);if(de==="commit-draft"){const Ie=R();(g.key===","||!Ie)&&g.preventDefault()}else de==="commit-suggestion"?(g.preventDefault(),R(B)):de==="dismiss-suggestion"&&(g.preventDefault(),d=r.value,m())}),a.addEventListener("focusout",()=>{window.setTimeout(()=>{!a.contains(document.activeElement)&&r.value.trim()&&R()})}),a.closest("form")?.addEventListener("submit",g=>{R()||g.preventDefault()},{capture:!0}),a.addEventListener("click",g=>{(g.target===a||g.target===i)&&r.focus()}),A()}}function u(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function k(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function Nt(e,t="",a="creature"){const n=p=>`${t}${p}`,o=e.scores??Ct(),r=Ke(e.hpBase,o[2]),i=Xe(e.loadBase,o[0]),c=r!==void 0&&e.hpMax!==r,s=i!==void 0&&e.maxLoad!==i,d=o.map((p,m)=>`
        <div class="ability-row">
          <label class="ability-score">${ut[m]}
            <input id="${n(`score-${m}`)}" name="score-${m}" type="number" min="3" max="18" step="1" value="${k(p)}">
          </label>
          <span class="ability-modifier" aria-label="${ut[m]} modifier">
            <span class="ability-modifier-label">${mt[m]}</span>
            <span class="ability-modifier-value" data-score-modifier="${m}">${Et(xt(p))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${De[m]}`)}" name="condition-${De[m]}" type="checkbox" ${e.conditions?.[De[m]]===-1?"checked":""}>
            ${aa[m]} <span>−1 ${mt[m]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${u(e.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${n("armor")}" name="armor" type="number" step="1" value="${k(e.armor)}"></label>
        <label>Current HP<input id="${n("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${k(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${n("hpMax")}" name="hpMax" class="${c?"calculation-mismatch":""}" type="number" min="0" step="1" value="${k(e.hpMax)}">
          <span class="calculated-hint" data-calculated-hp>Calculated: ${r??"—"}</span>
        </label>
      </div>
      ${_e("Armor tags","armorTags",e.armorTags,n("armorTags"))}
      <div class="damage-fields">
        <label>Damage die<input id="${n("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${u(e.damage??"")}"></label>
        <label>Damage description<input id="${n("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${u(e.damageDescription??"")}"></label>
      </div>
      ${_e("Damage tags","damageTags",e.damageTags,n("damageTags"))}
      <label class="visibility">
        <input id="${n("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
        Show the token overlay to players
      </label>
    </section>
    <details class="editor-section expandable-fields" ${a==="creature"?"open":""}>
      <summary><strong>GM Character</strong></summary>
      <div class="editor-section-body">
        ${_e("Tags","tags",e.tags,n("tags"))}
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
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${k(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${k(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${u(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${k(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${k(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${s?"calculation-mismatch":""}" type="number" min="0" step="any" value="${k(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${i??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${d}</div>
      </div>
    </details>`}function $a(e){const t=e.fields;return`${u(t.name)} · HP ${k(t.hpCurrent)||"—"}/${k(t.hpMax)||"—"} · ARM ${k(t.armor)||"—"} · DMG ${u(t.damage??"—")}`}function ka(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function Sa(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function Ca(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
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
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${k(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${u(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${u(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${u(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${ia(sa(t))}</strong></span>
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
        </form>`:""}`}function Ea(e,t){const a=e.inventory??[],n=na(oa(a),e.fields.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.fields.maxLoad===void 0?"Empty":ra(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${u(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${u(e.fields.name)} inventory">
          ${a.length?a.map((i,c)=>Ca(e,i,c,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function xa(e,t){const a=t.expandedStats?.has(e.id)??!1;return`
    <details class="stats-section" data-stats-details="${u(e.id)}" ${a?"open":""}>
      <summary><strong>Stats</strong></summary>
      <div class="stats-editor">
        <form class="manager-form stats-form" data-character-stats="${u(e.id)}">
          ${Nt(e.fields,`stats-${e.id}-`,"character")}
        </form>
        ${t.role==="GM"?`<button type="button" class="danger compact stats-delete" data-delete-character="${u(e.id)}">Delete Character</button>`:""}
      </div>
    </details>`}function La(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.linkedTokens?.get(e.id)??[],o=n.length||t.counts.get(e.id)||0,r=n.filter(i=>i.imageUrl).map(i=>`<img class="linked-token-thumbnail" src="${u(i.imageUrl)}" alt="${u(i.name)}" title="${u(i.name)}">`).join("");return`
    <details class="character-card" data-character-details="${u(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${u(e.fields.name)}</strong>
      </summary>
      <div class="character-card-body">
        <span>HP ${k(e.fields.hpCurrent)||"—"}/${k(e.fields.hpMax)||"—"} · ARM ${k(e.fields.armor)||"—"} · DMG ${u(e.fields.damage??"—")}</span>
        <div class="linked-token-line">
          ${r?`<span class="linked-token-thumbnails" aria-label="Linked tokens">${r}</span>`:""}
          <span>${o} linked token${o===1?"":"s"} in current scene · Updated ${u(new Date(e.updatedAt).toLocaleString())}</span>
        </div>
        ${xa(e,t)}
        ${Ea(e,t)}
      </div>
    </details>`}function Ia(e,t=!1){return`
    <section class="character-manager" data-home-section="characters">
      <div class="section-heading major-section-heading" draggable="true" data-drag-section="characters">
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>Character maintenance</span>
        </button>
      </div>
      ${t?`${e.role==="GM"?Sa(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${u(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>La(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}const qe=`${ca}/creature-clipboard`,Wt=1;function Pt(e,t,a=new Date().toISOString()){const n=t.trim();if(!n)throw new Error("The copied token must have a name.");if(!Number.isFinite(Date.parse(a)))throw new Error("The copied-data timestamp is invalid.");return{schemaVersion:Wt,sourceName:n,copiedAt:a,data:Ce(e)}}function Ta(e,t){e.setItem(qe,JSON.stringify(t))}function Ht(e){try{const t=e.getItem(qe);if(t===null)return;const a=JSON.parse(t);if(a.schemaVersion!==Wt||typeof a.sourceName!="string"||typeof a.copiedAt!="string")throw new Error("Unsupported creature clipboard.");return Pt(a.data,a.sourceName,a.copiedAt)}catch{try{e.removeItem(qe)}catch{}return}}function Ma(e,t){return je({name:e,...t.data})}function Da(e){e.removeItem(qe)}function Oa(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function Z(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function yt(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function q(e,t){return String(e.get(t)??"").trim()||void 0}function Aa(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=Z(e,"hpCurrent"),n.hpMax=Z(e,"hpMax"),a)return n;n.tags=ye(q(e,"tags")),n.specialQualities=q(e,"specialQualities"),n.hpBase=Z(e,"hpBase"),n.maxLoad=yt(e,"maxLoad"),n.loadBase=Z(e,"loadBase"),n.armor=Z(e,"armor"),n.armorTags=ye(q(e,"armorTags")),n.damage=q(e,"damage"),n.damageDescription=q(e,"damageDescription"),n.damageTags=ye(q(e,"damageTags")),n.instinct=q(e,"instinct"),n.moves=q(e,"moves"),n.treasure=q(e,"treasure"),n.level=Z(e,"level"),n.xp=Z(e,"xp");const o=Ct();for(let i=0;i<o.length;i+=1)o[i]=yt(e,`score-${i}`)??null;n.scores=la(o);const r={};for(const i of De)e.get(`condition-${i}`)==="on"&&(r[i]=-1);return n.conditions=da(r),n.alignment=q(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function at(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Aa(e,t,a)}}function Ra(e,t,a,n){return{x:e.x+a/2-t.x,y:e.y+n/2-t.y}}function nt(e){return e.filter(t=>t.layer==="CHARACTER"&&Oe(t)&&It(t.metadata[z])).map(t=>({id:t.id,itemText:Oe(t)?t.text.plainText.trim():"",itemName:t.name.trim(),imageUrl:Oe(t)?t.image.url:"",lastModified:t.lastModified??"",data:t.metadata[z]})).sort((t,a)=>t.itemText.localeCompare(a.itemText,void 0,{sensitivity:"base"})||t.itemName.localeCompare(a.itemName,void 0,{sensitivity:"base"})||t.id.localeCompare(a.id))}function qa(e){if(typeof e!="object"||e===null||Array.isArray(e))return{schemaVersion:1,inactiveItemIds:[]};const t=e;if(!Array.isArray(t.inactiveItemIds))return{schemaVersion:1,inactiveItemIds:[]};const a=Je(t.inactiveItemIds).sort();return t.schemaVersion===1?{schemaVersion:1,inactiveItemIds:a}:t.schemaVersion!==2||!Array.isArray(t.activeItemIds)?{schemaVersion:1,inactiveItemIds:[]}:{schemaVersion:2,inactiveItemIds:a,activeItemIds:Je(t.activeItemIds).filter(n=>!a.includes(n))}}function Je(e){return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function we(e){return qa(e[Lt])}function ot(e,t){const a=new Set(t.inactiveItemIds),n=new Map(e.map(s=>[s.id,s])),o=e.filter(s=>a.has(s.id));if(t.schemaVersion===1)return{active:e.filter(s=>!a.has(s.id)),inactive:o};const r=t.activeItemIds.map(s=>n.get(s)).filter(s=>s!==void 0&&!a.has(s.id)),i=new Set(r.map(s=>s.id));return{active:[...e.filter(s=>!a.has(s.id)&&!i.has(s.id)).sort((s,d)=>d.lastModified.localeCompare(s.lastModified)||Na(s,d)),...r],inactive:o}}function Na(e,t){return e.itemText.localeCompare(t.itemText,void 0,{sensitivity:"base"})||e.itemName.localeCompare(t.itemName,void 0,{sensitivity:"base"})||e.id.localeCompare(t.id)}function Bt(e,t){const a=new Set(e.map(o=>o.id)),{active:n}=ot(e,t);return{schemaVersion:2,inactiveItemIds:t.inactiveItemIds.filter(o=>a.has(o)).sort(),activeItemIds:n.map(o=>o.id)}}function jt(e,t){return t.schemaVersion===2&&e.inactiveItemIds.join("\0")===t.inactiveItemIds.join("\0")&&e.activeItemIds.join("\0")===t.activeItemIds.join("\0")}async function rt(e,t,a,n){for(let o=0;o<n;o+=1){const r=await e.getMetadata(),i=Bt(a,we(r)),c=t(i);await e.setMetadata({[Lt]:c});const s=we(await e.getMetadata());if(jt(c,s))return c}throw new Error("Encounter layout changed on another GM client. Try again.")}async function Wa(e,t,a=3){const n=await e.getMetadata(),o=we(n),r=Bt(t,o);return jt(r,o)?r:rt(e,i=>i,t,a)}async function Pa(e,t,a,n,o=3){const r=new Set(t.map(i=>i.id));return rt(e,i=>{const c=new Set(i.inactiveItemIds),s=i.activeItemIds.filter(d=>d!==a);return n?(c.delete(a),r.has(a)&&s.unshift(a)):r.has(a)&&c.add(a),{schemaVersion:2,inactiveItemIds:[...c].sort(),activeItemIds:s}},t,o)}async function Ha(e,t,a,n=3){return rt(e,o=>{const r=new Set(o.activeItemIds),i=Je(a).filter(c=>r.has(c));for(const c of o.activeItemIds)i.includes(c)||i.push(c);return{...o,activeItemIds:i}},t,n)}function E(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function Ba(e){const t=e.hpCurrent,a=e.hpMax;if(t===void 0&&a===void 0)return{text:"—",percent:0,color:"empty",adjustable:!1};const n=`${t??"—"}/${a??"—"}`;if(t!==void 0&&a!==void 0&&t>a)return{text:n,percent:100,color:"purple",adjustable:!0};const o=a&&a>0&&t!==void 0?Math.max(0,Math.min(100,t/a*100)):0;return{text:n,percent:o,color:o>50?"green":o>25?"amber":"red",adjustable:t!==void 0}}function Ft(e){return`<span class="encounter-item-text">${E(e.itemText||"Unnamed character")}</span><span class="encounter-item-name">(${E(e.itemName||"Unnamed item")})</span>`}function Vt(e){return e.imageUrl?`<img class="encounter-thumbnail" src="${E(e.imageUrl)}" alt="">`:'<span class="encounter-thumbnail encounter-thumbnail-empty" aria-hidden="true"></span>'}function Gt(e,t,a){const n=t?"Move to Inactive":"Add to Encounter";return`<span class="encounter-actions"><button class="encounter-locate" type="button" data-encounter-locate="${E(e.id)}" aria-label="Locate on scene" title="Locate on scene">${ge("map-pin")}</button><button class="encounter-activity" type="button" data-encounter-active="${t?"false":"true"}" data-item-id="${E(e.id)}" aria-label="${n}" title="${n}" ${a?"disabled":""}>${ge(t?"minus-circle":"plus-circle")}</button></span>`}function ja(e,t){const a=e.data,n=Ba(a),o=a.damage?.trim(),r=a.damageDescription?.trim(),i=X(a.damageTags),c=X(a.armorTags),s=a.instinct?.trim(),d=a.moves?.trim(),p=t.has(e.id);return`<article class="encounter-card" data-encounter-item="${E(e.id)}">
    <div class="encounter-identity encounter-drag-handle" draggable="${p?"false":"true"}" data-encounter-drag="${E(e.id)}">${Vt(e)}<span class="encounter-identity-copy">${Ft(e)}</span>${Gt(e,!0,p)}</div>
    <div class="encounter-combat">
      <span class="encounter-armor" title="Armor">${ge("shield")}<span><strong>${a.armor??"—"}</strong>${c?`<em>${E(c)}</em>`:""}</span></span>
      <span class="encounter-damage">${ge("sword")}<span class="encounter-damage-copy">${o?`<button type="button" data-encounter-damage="${E(o)}">🎲 ${E(o)}</button>`:"—"}${r?`<span> (${E(r)})</span>`:""}${i?`<em>${E(i)}</em>`:""}</span></span>
      <span class="encounter-hp"><button type="button" data-encounter-hp="-1" data-item-id="${E(e.id)}" aria-label="Decrease HP" ${!n.adjustable||p?"disabled":""}>−</button><span class="encounter-hp-bar hp-${n.color}"><span class="encounter-hp-fill" style="width:${n.percent}%"></span><strong>${n.text}</strong></span><button type="button" data-encounter-hp="1" data-item-id="${E(e.id)}" aria-label="Increase HP" ${!n.adjustable||p?"disabled":""}>+</button></span>
    </div>
    ${s?`<div class="encounter-instinct"><strong>Instinct:</strong> ${E(s)}</div>`:""}
    ${d?`<div class="encounter-moves"><strong>Moves:</strong><div class="markdown-content">${va(d)}</div></div>`:""}
  </article>`}function Fa(e,t,a,n=new Set){const{active:o,inactive:r}=ot(e,t);return`<div class="encounter-list" data-encounter-active-list>${o.length?o.map(i=>ja(i,n)).join(""):'<p class="encounter-empty">No active DWTools creatures in this scene.</p>'}</div>
    <section class="encounter-inactive">
      <button class="section-toggle encounter-inactive-toggle" type="button" data-toggle-section="encounterInactive" aria-expanded="${a}"><span class="section-arrow" aria-hidden="true">&#9656;</span><span>Inactive (${r.length})</span></button>
      ${a?`<div class="encounter-inactive-list">${r.length?r.map(i=>`<div class="encounter-inactive-row">${Vt(i)}<span class="encounter-identity-copy">${Ft(i)}</span>${Gt(i,!1,n.has(i.id))}</div>`).join(""):'<p class="encounter-empty">No inactive creatures.</p>'}</div>`:""}
    </section>`}function it(e){const t=e[Fe];return typeof t=="boolean"?t:!0}function Va(e,t){return It(e)?e:{visibleToPlayers:t}}async function Ga(e,t){await e({[Fe]:t})}const I={agenda:!0,principles:!0,moves:!0,basicMoves:!0,specialMoves:!1,encounter:!1,encounterInactive:!1,settings:!1,characters:!1},Ne=["agenda","principles","moves","encounter","settings","characters"];function Ua(e){const t=new Set(Ne),a=Array.isArray(e)?e.filter(o=>typeof o=="string"&&t.has(o)):[],n=[...new Set(a)];for(const o of Ne)o!=="encounter"&&o!=="principles"&&!n.includes(o)&&n.push(o);if(!n.includes("principles")){const o=n.indexOf("agenda");n.splice(o>=0?o+1:0,0,"principles")}if(!n.includes("encounter")){const o=n.indexOf("moves");n.splice(o>=0?o+1:n.length,0,"encounter")}return n}const Ut=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],_t=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function ue(e,t,a){return`
    <div class="section-heading major-section-heading" draggable="true" data-drag-section="${t}">
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
      </button>
    </div>`}function ft(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function _a(e,t,a,n=I,o="",r="",i="",c="dwtools"){const s=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section" data-home-section="agenda">
        ${ue("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="principles">
        ${ue("Principles","principles",n.principles)}
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
        ${ue("Moves","moves",n.moves)}
        ${n.moves?`${ft("Basic Moves","basicMoves",n.basicMoves,Ut)}
        ${ft("Special Moves","specialMoves",n.specialMoves,_t)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section encounter-section" data-home-section="encounter">
        ${ue("Encounter (Scene)","encounter",n.encounter)}
        ${n.encounter?r:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="settings">
        ${ue("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${s}" title="${s}" ${a?"disabled":""}>
            ${ge(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>
        <label class="dice-extension-setting" for="dice-extension">Dice rolling extension
          <select id="dice-extension">
            <option value="dwtools" ${c==="dwtools"?"selected":""}>DWTools</option>
            <option value="no-dice" ${c==="no-dice"?"selected":""}>No Dice</option>
          </select>
        </label>`:""}
      </section>`:""}
      ${o}
      ${i?`<p class="extension-version">version ${i}</p>`:""}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`}function vt(e){const t=e[Tt];return typeof t=="boolean"?t:!0}async function Ya(e,t){await e({[Tt]:t})}function Ye(e,t,a,n){!n||!t||(a?e.add(t):e.delete(t))}function gt(e,t,a){return t?a:e}function We(e){return Array.isArray(e)?`[${e.map(We).join(",")}]`:typeof e=="object"&&e!==null?`{${Object.entries(e).sort(([t],[a])=>t.localeCompare(a)).map(([t,a])=>`${JSON.stringify(t)}:${We(a)}`).join(",")}}`:JSON.stringify(e)}function Yt(e){return We(e.map(({id:t,itemText:a,itemName:n,imageUrl:o,data:r})=>({id:t,itemText:a,itemName:n,imageUrl:o,data:r})))}function zt(e){return We([...e.entries()].sort(([t],[a])=>t.localeCompare(a)))}function za(e){const t=new Map;for(const a of e){const n=G(a);if(!n)continue;const o=t.get(n.characterId)??[];o.push({id:a.id,name:a.name.trim()||"Linked token",imageUrl:Oe(a)?a.image.url:""}),t.set(n.characterId,o)}return{encounter:Yt(nt(e)),linkedTokens:zt(t)}}const Q=document.querySelector("#app"),$e=new URLSearchParams(window.location.search),re=$e.get("itemId"),Kt=$e.get("view")??"edit",bt=$e.get("preview");function Pe(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function S(e,t){return e instanceof Error?e.message:t}function f(e,t){l.isAvailable&&l.notification.show(e,t)}function st(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=ha(t.value);const a=ya(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function Xt(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>st(e))}function T(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function Jt(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),o=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const r=()=>{for(let d=0;d<6;d+=1){const p=T(e,`score-${d}`),m=e.querySelector(`[data-score-modifier="${d}"]`);m&&(m.textContent=Et(xt(p)))}const c=Ke(T(e,"hpBase"),T(e,"score-2")),s=Xe(T(e,"loadBase"),T(e,"score-0"));n&&(n.textContent=`Calculated: ${c??"—"}`),o&&(o.textContent=`Calculated: ${s??"—"}`),t.classList.toggle("calculation-mismatch",pt(T(e,"hpMax"),c)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",pt(T(e,"maxLoad"),s))},i=(c,s,d,p)=>{const m=e.elements.namedItem(c);!(m instanceof HTMLInputElement)||!(s instanceof HTMLInputElement)||(m.dataset.lastPromptedValue=m.value,m.addEventListener("blur",()=>{const A=m.dataset.lastPromptedValue??"",R=p();if(!fa(A,m.value,T(e,s.name),R)){m.dataset.lastPromptedValue=m.value,r();return}m.dataset.lastPromptedValue=m.value;const g=s.value.trim()||"blank";window.confirm(`${d} changed. Recalculate ${s.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${g} to ${R}?`)&&(s.value=String(R)),r()}))};for(const c of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))c.addEventListener("input",r);i("score-2",t,"Constitution",()=>Ke(T(e,"hpBase"),T(e,"score-2"))),i("score-0",a,"Strength",()=>Xe(T(e,"loadBase"),T(e,"score-0"))),r()}function Qe(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","specialQualities","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","armorTags","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],o={};for(const r of n)JSON.stringify(e[r])!==JSON.stringify(t[r])&&(o[r]=t[r]);return o}let x="PLAYER",W={},Ae=!1,ne,ce,$,F=[],ct=new Map,ke=new Map,Ve,pe=!1,D=!1,O,Ze=!1;const Ge=new Set,he=new Map;let ie,Y,V=[],et=be([]),J={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};const te=new Set;let Re=!1,U,Te=0;const Ee=new Set,Ue=new Set,Ka="dwtools/home-sections";function Xa(){try{const e=JSON.parse(localStorage.getItem(Ka)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:I.agenda,principles:typeof e.principles=="boolean"?e.principles:I.principles,moves:typeof e.moves=="boolean"?e.moves:I.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:I.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:I.specialMoves,encounter:typeof e.encounter=="boolean"?e.encounter:I.encounter,encounterInactive:typeof e.encounterInactive=="boolean"?e.encounterInactive:I.encounterInactive,settings:typeof e.settings=="boolean"?e.settings:I.settings,characters:typeof e.characters=="boolean"?e.characters:I.characters}}catch{return{...I}}}function Ja(e){const t=typeof e=="object"&&e!==null?e:{};return Object.fromEntries(Object.entries(I).map(([a,n])=>[a,typeof t[a]=="boolean"?t[a]:n]))}function wt(e){const t=e[Rt];if(typeof t=="object"&&t!==null){const a=t;j=Ja(a.expanded),se=Ua(a.order);return}j=Xa(),se=[...Ne]}async function $t(){try{await l.player.setMetadata({[Rt]:{version:1,expanded:j,order:se}})}catch(e){console.error("DWTools could not save the panel layout",e),f("DWTools could not save your panel layout.","ERROR")}}let j={...I},se=[...Ne],me;function Qa(){return{records:F,counts:ct,linkedTokens:ke,role:x,usage:Ve,loading:pe,saving:D,error:O,expandedCharacters:Ee,expandedStats:Ge,expandedInventories:Ue,draftCharacterId:ie,transfer:Y}}function Za(){const e=(t,a)=>{for(const n of Q.querySelectorAll(t)){const o=n.dataset.characterDetails??n.dataset.statsDetails??n.dataset.inventoryDetails;o&&(n.open?a.add(o):a.delete(o))}};e("[data-character-details]",Ee),e("[data-stats-details]",Ge),e("[data-inventory-details]",Ue)}function h(){Za();const e=document.scrollingElement?.scrollLeft??window.scrollX,t=document.scrollingElement?.scrollTop??window.scrollY,a=it(W),n=Ia(Qa(),j.characters),o=Fa(V,J,j.encounterInactive,te);Q.innerHTML=_a(x,a,Ae,j,n,o,ua,ga(W)),document.querySelector("#dice-extension")?.addEventListener("change",c=>{const s=c.currentTarget.value;s!=="dwtools"&&s!=="no-dice"||l.room.setMetadata({[ht]:s}).then(()=>{W={...W,[ht]:s},h()}).catch(d=>{console.error("DWTools could not save the dice extension",d),f("Could not save the dice extension.","ERROR")})});const r=document.querySelector(".home"),i=document.querySelector(".extension-version, #move-dialog");if(r&&i)for(const c of se){const s=r.querySelector(`[data-home-section="${c}"]`);s&&r.insertBefore(s,i)}document.querySelector("#default-visibility")?.addEventListener("click",()=>{hn()});for(const c of document.querySelectorAll("[data-toggle-section]"))c.addEventListener("click",()=>{const s=c.dataset.toggleSection;j={...j,[s]:!j[s]},$t(),h()});for(const c of document.querySelectorAll("[data-drag-section]")){const s=c.dataset.dragSection,d=c.closest("[data-home-section]");c.addEventListener("dragstart",p=>{me=s,d?.classList.add("dragging"),p.dataTransfer?.setData("text/plain",s),p.dataTransfer&&(p.dataTransfer.effectAllowed="move")}),c.addEventListener("dragend",()=>{me=void 0,document.querySelectorAll(".dragging, .drag-over").forEach(p=>p.classList.remove("dragging","drag-over"))}),d?.addEventListener("dragover",p=>{!me||me===s||(p.preventDefault(),d.classList.add("drag-over"))}),d?.addEventListener("dragleave",()=>d.classList.remove("drag-over")),d?.addEventListener("drop",p=>{p.preventDefault();const m=me;if(!m||m===s)return;const A=se.filter(R=>R!==m);A.splice(A.indexOf(s),0,m),se=A,$t(),h()})}for(const c of document.querySelectorAll("[data-move]"))c.addEventListener("click",()=>{const s=[...Ut,..._t].find(A=>A.id===c.dataset.move),d=document.querySelector("#move-dialog"),p=document.querySelector("#move-dialog-title"),m=document.querySelector("#move-dialog-text");!s||!d||!p||!m||(p.textContent=s.name,m.textContent=s.text,d.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),en(),cn(),window.scrollTo(e,t)}function kt(e){wa(e)}function en(){an();for(const e of document.querySelectorAll("[data-encounter-locate]"))e.addEventListener("click",()=>{const t=e.dataset.encounterLocate;t&&on(t)});for(const e of document.querySelectorAll("[data-encounter-active]"))e.addEventListener("click",()=>{const t=e.dataset.itemId;t&&rn(t,e.dataset.encounterActive==="true")});for(const e of document.querySelectorAll("[data-encounter-hp]"))e.addEventListener("click",()=>{const t=e.dataset.itemId,a=Number(e.dataset.encounterHp);t&&Number.isFinite(a)&&sn(t,a)});for(const e of document.querySelectorAll("[data-encounter-damage]"))e.addEventListener("click",()=>{const t=e.dataset.encounterDamage;t&&kt(t)});for(const e of document.querySelectorAll(".encounter-section [data-roll-expression]"))e.addEventListener("click",()=>{const t=e.dataset.rollExpression;t&&kt(t)})}function St(){document.querySelectorAll(".encounter-dragging, .encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-dragging","encounter-drop-before","encounter-drop-after"))}function tn(){document.querySelectorAll(".encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-drop-before","encounter-drop-after"))}function an(){if(!Re)for(const e of document.querySelectorAll("[data-encounter-drag]")){const t=e.closest("[data-encounter-item]");t&&(e.addEventListener("dragstart",a=>{if(a.target.closest("button")){a.preventDefault();return}U=e.dataset.encounterDrag,t.classList.add("encounter-dragging"),a.dataTransfer&&U&&(a.dataTransfer.effectAllowed="move",a.dataTransfer.setData("text/plain",U))}),e.addEventListener("dragend",()=>{U=void 0,St()}),t.addEventListener("dragover",a=>{!U||U===t.dataset.encounterItem||(a.preventDefault(),tn(),t.classList.add(a.clientY<t.getBoundingClientRect().top+t.offsetHeight/2?"encounter-drop-before":"encounter-drop-after"))}),t.addEventListener("drop",a=>{a.preventDefault();const n=U,o=t.dataset.encounterItem,r=t.classList.contains("encounter-drop-after");U=void 0,St(),n&&o&&n!==o&&nn(n,o,r)}))}}async function nn(e,t,a){if(x!=="GM"||Re)return;const n=ot(V,J).active.map(i=>i.id),o=n.filter(i=>i!==e),r=o.indexOf(t);if(!(r<0||!n.includes(e))&&(o.splice(r+(a?1:0),0,e),o.join("\0")!==n.join("\0"))){Re=!0,h();try{J=await Ha(lt(),V,o)}catch(i){console.error("DWTools could not reorder the encounter",i),f(S(i,"DWTools could not save the encounter order."),"ERROR")}finally{Re=!1,h()}}}async function on(e){if(x==="GM")try{const[t,a,n,o,r]=await Promise.all([l.scene.items.getItemBounds([e]),l.viewport.getScale(),l.viewport.getPosition(),l.viewport.getWidth(),l.viewport.getHeight()]),i=await l.viewport.transformPoint(t.center);await l.viewport.animateTo({position:Ra(n,i,o,r),scale:a})}catch(t){console.error("DWTools could not locate the encounter item",t),f("That item is no longer available in the scene.","ERROR")}}function lt(){return{getMetadata:()=>l.scene.getMetadata(),setMetadata:e=>l.scene.setMetadata(e)}}async function rn(e,t){if(!(x!=="GM"||te.has(e))){te.add(e),h();try{J=await Pa(lt(),V,e,t)}catch(a){console.error("DWTools could not update encounter activity",a),f(S(a,"DWTools could not update encounter activity."),"ERROR")}finally{te.delete(e),h()}}}async function sn(e,t){if(!(x!=="GM"||!ce||te.has(e))){te.add(e),h();try{const a=(await l.scene.items.getItems([e]))[0];if(!a)return;const n=nt([a])[0];if(!n||n.data.hpCurrent===void 0)return;await ce.updateCreatureFields(e,{hpCurrent:ba(n.data.hpCurrent,t)})}catch(a){console.error("DWTools could not update encounter HP",a),f(S(a,"DWTools could not update encounter HP."),"ERROR")}finally{te.delete(e),h()}}}async function Me(e){const t=++Te;if(!await l.scene.isReady()){if(t!==Te)return;V=[],et=be([]),J={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};return}const a=e??await l.scene.items.getItems();if(t!==Te)return;if(et=be(a.flatMap(r=>{try{return[Ce(r.metadata[z])]}catch{return[]}})),x!=="GM"){V=[];return}const n=await l.scene.getMetadata();if(t!==Te)return;V=nt(a),J=we(n);try{J=await Wa(lt(),V)}catch(r){console.error("DWTools could not reconcile the encounter order",r)}}function cn(){document.querySelector("#manager-create")?.addEventListener("click",()=>{ln()});for(const e of document.querySelectorAll("[data-delete-character]"))e.addEventListener("click",()=>{pn(e.dataset.deleteCharacter)});for(const e of document.querySelectorAll("[data-character-details]"))e.addEventListener("toggle",()=>{Ye(Ee,e.dataset.characterDetails,e.open,e.isConnected)});for(const e of document.querySelectorAll("[data-stats-details]"))e.addEventListener("toggle",()=>{Ye(Ge,e.dataset.statsDetails,e.open,e.isConnected)});for(const e of document.querySelectorAll("[data-inventory-details]"))e.addEventListener("toggle",()=>{Ye(Ue,e.dataset.inventoryDetails,e.open,e.isConnected)});dn(),mn()}async function ln(){if(!$||D)return;D=!0,O=void 0,h();let e;try{const t=await $.create({name:"Untitled character",visibleToPlayers:!0});e=t.id,await N(!1),Ee.add(t.id),Ge.add(t.id)}catch(t){O=S(t,"DWTools could not create the Character.")}finally{D=!1,h(),e&&window.requestAnimationFrame(()=>{const t=document.querySelector(`[data-character-details="${CSS.escape(e)}"]`);t?.scrollIntoView({block:"nearest"}),t?.querySelector('[name="name"]')?.focus()})}}function dn(){for(const e of document.querySelectorAll("[data-character-stats]")){const t=e.dataset.characterStats;if(!t)continue;qt(e,et),Xt(e),Jt(e),e.addEventListener("submit",n=>n.preventDefault());const a=()=>un(t,e);for(const n of e.querySelectorAll("input, textarea, select"))n instanceof HTMLInputElement&&(n.type==="checkbox"||n.type==="radio"||n.type==="hidden")||n instanceof HTMLSelectElement?n.addEventListener("change",a):n.addEventListener("blur",a)}}function un(e,t){const a=F.find(c=>c.id===e);if(!a||!$||!st(t)||!t.checkValidity())return;const n=je(at(new FormData(t),a.fields,!1)),o=Qe(a.fields,n,!1);if(!Object.keys(o).length)return;const i=(he.get(e)??Promise.resolve()).catch(()=>{}).then(async()=>{const c=F.find(d=>d.id===e);if(!c||!$)return;const s=Qe(c.fields,n,!1);if(Object.keys(s).length)try{const d=await $.patch(e,s);F=F.map(p=>p.id===e?d:p),O=void 0}catch(d){O=S(d,"DWTools could not update these Character stats."),f(O,"ERROR")}}).finally(()=>{if(he.get(e)!==i)return;he.delete(e),document.querySelector(`[data-character-stats="${CSS.escape(e)}"]`)?.contains(document.activeElement)||h()});he.set(e,i)}function _(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return F.find(a=>a.id===t)}function ae(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function ee(e,t,a){if(!D){D=!0,O=void 0,a?He(a):h();try{await e(),ie=void 0,Y=void 0,await N(!1),t&&f(t,"SUCCESS"),Ve?.nearLimit&&f("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=S(n,"DWTools could not update this inventory.");await N(!1),O=o}finally{D=!1,a?He(a):h()}}}function He(e,t=!1){h(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function ze(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function mn(){if(!$)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=_(a),o=Number(a.dataset.inventoryName),r=n&&ae(n,o);!n||!r||ze(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const i=[a.value,r.expected[1],r.expected[2]];ee(()=>$.updateInventoryItem(n.id,r,i))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=_(a),o=Number(a.dataset.inventoryWeight),r=n&&ae(n,o);if(!n||!r)continue;const i=String(r.expected[1]);ze(a,i,()=>{if(a.value===i)return;const c=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];ee(()=>$.updateInventoryItem(n.id,r,c))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=_(a),o=Number(a.dataset.inventoryCount),r=n&&ae(n,o);if(!n||!r)continue;const i=String(r.expected[2]);ze(a,i,()=>{if(a.value===i)return;const c=a.value.trim()===""?Number.NaN:Number(a.value);ee(()=>$.changeInventoryItemCount(n.id,r,c-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=_(a),o=Number(a.dataset.inventoryAdjust),r=n&&ae(n,o),i=Number(a.dataset.change);!n||!r||ee(()=>$.changeInventoryItemCount(n.id,r,i))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=_(a),o=Number(a.dataset.inventoryRemove),r=n&&ae(n,o);!n||!r||ee(()=>$.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=_(a);n&&(ie=n.id,Ee.add(n.id),Ue.add(n.id),He(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=ie;ie=void 0,a?He(a):h()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=_(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];ee(()=>$.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=_(a),o=Number(a.dataset.inventoryTransfer),r=n&&ae(n,o);!n||!r||(Y={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},h())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{Y=void 0,h()});const t=document.querySelector("[data-transfer-form]");t&&Y&&t.addEventListener("submit",a=>{if(a.preventDefault(),!Y||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),i=Y;ee(()=>$.transferInventoryItem(i.sourceCharacterId,o,{sourceIndex:i.sourceIndex,expected:i.expected},r),"Item transferred.")})}async function N(e=!0){if(!(!ne||!ce||!$)){pe=gt(pe,e,!0),O=void 0,e&&h();try{if(x==="GM"&&!Ze){const t=await $.cleanupLegacyTombstones();Ze=!0,t&&f(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[F,ke,Ve]=await Promise.all([$.listAccessible(),pa(ce.scene),x==="GM"?ne.estimateUsage():Promise.resolve(void 0)]),ct=new Map([...ke].map(([t,a])=>[t,a.length]))}catch(t){O=S(t,"DWTools could not load character records.")}finally{pe=gt(pe,e,!1),e&&h()}}}async function pn(e){if(!e||!$||D)return;const t=F.find(a=>a.id===e);if(t&&window.confirm(ka(t.fields.name))){D=!0,O=void 0,h();try{await $.delete(e),f("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await N(!1)}catch(a){O=S(a,"DWTools could not delete the record.")}finally{D=!1,h()}}}async function hn(){if(x!=="GM"||Ae)return;const e=!it(W);Ae=!0,h();try{await Ga(t=>l.room.setMetadata(t),e),W={...W,[Fe]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),f("DWTools could not save the default overlay visibility.","ERROR")}finally{Ae=!1,h()}}async function yn(){try{await Mt()}catch(o){console.error("DWTools metadata namespace migration failed",o),Q.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',f("DWTools could not migrate its saved data.","ERROR");return}ne=Dt(),ce=Ot(ne),$=ma(ne,ce);const[e,t,a]=await Promise.all([l.player.getRole(),l.room.getMetadata(),l.player.getMetadata(),l.theme.getTheme().then(Pe)]);x=e,W=t,wt(a),await Promise.all([N(!1),Me()]),h();const n=[l.room.onMetadataChange(o=>{W=o,h()}),ne.subscribe(o=>{o.some(r=>r.lookup.status==="deleted")&&(Ze=!1),N(he.size===0&&(x==="PLAYER"||!D))}),l.player.onChange(o=>{x=o.role,wt(o.metadata),ie=void 0,Y=void 0,Promise.all([N(),Me()]).then(h)}),l.scene.items.onChange(o=>{const r=za(o),i=r.encounter!==Yt(V),c=r.linkedTokens!==zt(ke);!i&&!c||Promise.all([i?Me(o):Promise.resolve(),c?N(!1):Promise.resolve()]).then(h)}),l.scene.onMetadataChange(o=>{J=we(o),h()}),l.scene.onReadyChange(()=>{Promise.all([N(),Me()]).then(h)}),l.room.onPermissionsChange(()=>{N(x==="PLAYER"||!D)}),l.theme.onChange(Pe)];window.addEventListener("unload",()=>{for(const o of n)o()},{once:!0})}let K,L,y,b,M={status:"missing"},Be=[],xe=!1,fe="",v=!1,P=!0,ve=!1,C,Le=!1,H,le,Qt=be([]);function fn(e){const t=G(e);let a,n;t?M.status==="active"?(a=`Character record: <strong>${u(M.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${M.status==="malformed"?"malformed":M.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=fe.trim().toLocaleLowerCase(),r=o?Be.filter(c=>c.fields.name.toLocaleLowerCase().includes(o)||X(c.fields.tags).toLocaleLowerCase().includes(o)):Be,i=xe?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${P?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${u(fe)}"></label>
        <div class="link-results">
          ${r.length?r.map(c=>`
                <button type="button" data-link-record="${u(c.id)}" data-link-search="${u(`${c.fields.name} ${X(c.fields.tags)}`.toLocaleLowerCase())}">
                  ${$a(c)}
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
        <input id="overwrite-label" type="checkbox" ${P?"checked":""} ${ve?"disabled":""}>
        Overwrite label
      </label>
      ${i}
    </section>`}function Zt(e){return e?`Copied from ${e.sourceName} · ${new Date(e.copiedAt).toLocaleString()}`:"No copied DWTools data."}function vn(){const e=Le||M.status==="active";return`
    <section class="creature-clipboard-section">
      <div class="creature-clipboard-heading">
        <strong>DWTools data clipboard</strong>
        <span data-clipboard-status>${u(Zt(H))}</span>
      </div>
      ${le?`<p class="clipboard-staged">Pasted data from ${u(le.sourceName)} is staged. Save to apply it.</p>`:""}
      <div class="clipboard-actions">
        <button class="secondary" type="button" id="copy-creature-data" ${e&&!v?"":"disabled"}>Copy DWTools data</button>
        <button class="secondary" type="button" id="paste-creature-data" ${H&&!v?"":"disabled"}>Paste DWTools data</button>
        <button class="secondary" type="button" id="clear-creature-data" ${H&&!v?"":"disabled"}>Clear copied data</button>
      </div>
    </section>`}function w(){if(!y||!b)return;const e=Kt==="hp";Q.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${u(b.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${fn(y)}
      ${C?`<p class="inline-error">${u(C)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${k(b.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${k(b.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:Nt(b)}
      ${e?"":vn()}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${v?"disabled":""}>${v?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=Oa(a.value,n.value);o!==null&&(n.value=o)}),Xt(t),Jt(t),qt(t,Qt);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{l.popover.close(tt)}),document.querySelector("#remove")?.addEventListener("click",()=>{Ln()}),document.querySelector("#copy-creature-data")?.addEventListener("click",()=>gn()),document.querySelector("#paste-creature-data")?.addEventListener("click",()=>$n(t)),document.querySelector("#clear-creature-data")?.addEventListener("click",()=>bn()),document.querySelector("#link-character")?.addEventListener("click",()=>{kn()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{Sn(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{En()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{xn()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{xe=!1,fe="",w()}),document.querySelector("#link-search")?.addEventListener("input",o=>{fe=o.currentTarget.value;const r=fe.trim().toLocaleLowerCase();for(const i of document.querySelectorAll("[data-link-search]"))i.hidden=!String(i.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{Cn(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),In(t)})}function dt(){const e=document.querySelector("[data-clipboard-status]");e&&(e.textContent=Zt(H));const t=document.querySelector("#paste-creature-data"),a=document.querySelector("#clear-creature-data");t&&(t.disabled=!H),a&&(a.disabled=!H)}function gn(){if(!y||!b||!Le&&M.status!=="active"){f("This token has no saved DWTools data to copy.","WARNING");return}try{const e=Pt(Ce(b),y.name);Ta(window.localStorage,e),H=e,dt(),f(`Copied DWTools data from ${e.sourceName}.`,"SUCCESS")}catch(e){f(S(e,"DWTools could not copy the creature data."),"ERROR")}}function bn(){try{Da(window.localStorage),H=void 0,dt(),f("Copied DWTools data cleared.","SUCCESS")}catch(e){f(S(e,"DWTools could not clear the copied data."),"ERROR")}}function wn(e){if(!b)return!1;try{const t=je(at(new FormData(e),b,!1));return JSON.stringify(t)!==JSON.stringify(b)}catch{return!0}}function $n(e){if(!y||!b)return;if(G(y)){f("Unlink this token from its Character record before pasting DWTools data.","ERROR");return}const t=Ht(window.localStorage);if(H=t,!t){dt(),f("There is no valid copied DWTools data to paste.","WARNING");return}wn(e)&&!window.confirm("Replace the unsaved form values with the copied DWTools data?")||(b=Ma(b.name,t),le=t,C=void 0,w())}async function Se(){if(!re||!L||!K)return;const e=await L.getItem(re);if(!e){Q.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}Le=z in e.metadata,le=void 0,y=e,b=At(e);const t=G(e);M=t?await K.inspect(t.characterId):{status:"missing"},M.status==="active"&&(b=M.record.fields),w()}async function kn(){if(!(!K||v)){v=!0,C=void 0,w();try{Be=await K.list(),xe=!0}catch(e){C=S(e,"DWTools could not load character records.")}finally{v=!1,w()}}}async function Sn(e){if(ve)return;const t=P;P=e,ve=!0,w();try{await Ya(a=>l.room.setMetadata(a),e)}catch(a){P=t,C=S(a,"DWTools could not save the overwrite-label setting.")}finally{ve=!1,w()}}async function Cn(e){if(!e||!L||!y||v)return;const t=Be.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${P?"overwritten":"retained"}.`)){v=!0,C=void 0,w();try{await L.linkToExistingCharacter(y.id,e,P),f(`Linked to ${t.fields.name}.`,"SUCCESS"),xe=!1,await Se()}catch(a){C=S(a,"DWTools could not link the character.")}finally{v=!1,w()}}}async function En(){if(!(!L||!y||v)){v=!0,C=void 0,w();try{const{record:e}=await L.createAndLinkCharacter(y.id);f(`Created and linked ${e.fields.name}.`,"SUCCESS"),xe=!1,await Se()}catch(e){C=S(e,"DWTools could not create and link the character.")}finally{v=!1,w()}}}async function xn(){if(!(!L||!y||v)){v=!0,C=void 0,w();try{await L.unlinkCharacter(y.id),f("Character unlinked; creature fields were retained.","SUCCESS"),await Se()}catch(e){C=S(e,"DWTools could not unlink the character.")}finally{v=!1,w()}}}async function Ln(){if(!(!L||!y||v||G(y)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){v=!0,w();try{await L.removeCreatureData(y.id),await l.popover.close(tt)}catch(t){C=S(t,"DWTools could not remove the creature data."),v=!1,w()}}}async function In(e){if(!(!L||!y||!b||v)){if(!st(e)||!e.reportValidity()){C="Correct the highlighted creature fields before saving.",w();return}v=!0,C=void 0,w();try{const t=Kt==="hp",a=je(at(new FormData(e),b,t)),n=!!le;if(n)await L.replaceUnlinkedCreatureData(y.id,Ce(a)),le=void 0;else{let o=Qe(b,a,t);!Le&&!G(y)&&(o=a),Object.keys(o).length&&await L.updateCreatureFields(y.id,o)}f(n?"Copied DWTools data saved.":G(y)?"Character record saved.":"Creature saved.","SUCCESS"),await l.popover.close(tt)}catch(t){C=S(t,"DWTools could not save the creature."),v=!1,w()}}}async function Tn(){if(!re)return;try{await Mt()}catch(i){console.error("DWTools metadata namespace migration failed",i),Q.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',f("DWTools could not migrate its saved data.","ERROR");return}K=Dt(),L=Ot(K),H=Ht(window.localStorage);const[e,t,a]=await Promise.all([L.getItem(re),l.room.getMetadata().catch(i=>(console.warn("DWTools could not load room visibility settings",i),{})),l.scene.items.getItems(),l.theme.getTheme().then(Pe)]);if(Qt=be(a.flatMap(i=>{try{return[Ce(i.metadata[z])]}catch{return[]}})),!e){Q.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}Le=z in e.metadata;const n=Va(e.metadata[z],it(t));P=vt(t),y={...e,metadata:{...e.metadata,[z]:n}},b=At(y);const o=G(y);M=o?await K.inspect(o.characterId):{status:"missing"},M.status==="active"&&(b=M.record.fields),w();const r=[K.subscribe(i=>{const c=y&&G(y);c&&i.some(s=>s.characterId===c.characterId)&&!v&&Se()}),l.scene.items.onChange(i=>{i.find(s=>s.id===re)&&!v&&Se()}),l.room.onMetadataChange(i=>{ve||(P=vt(i),w())}),l.theme.onChange(Pe)];window.addEventListener("unload",()=>{for(const i of r)i()},{once:!0})}bt==="home"?(x="GM",W={[Fe]:$e.get("default")!=="hidden"},F=[{schemaVersion:4,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:["Cautious","Loyal"]},revision:3,parents:[],createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],ct=new Map([["preview-active",2]]),ke=new Map([["preview-active",[{id:"preview-token-1",name:"Raganah one",imageUrl:"/icon.svg"},{id:"preview-token-2",name:"Raganah two",imageUrl:"/icon.svg"}]]]),Ve={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},h()):bt==="editor"?(P=$e.get("overwriteLabel")?.toLocaleLowerCase()!=="false",y={id:"preview",name:"Frogman",metadata:{}},b={name:"Frogman",hpCurrent:7,hpMax:10,tags:["Solitary","Small","Intelligent","Stealthy","Devious"],specialQualities:"Amphibious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:["Close","Messy"],instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},w()):re?l.isAvailable?l.onReady(()=>{Tn()}):Q.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(h(),l.isAvailable&&l.onReady(()=>{yn()}));
