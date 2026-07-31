import{B as rt,F as Re,G as Ae,H as Ke,A as Xe,u as fe,I as At,w as it,J as st,K as Nt,t as qt,r as Wt,M as Pt,N as Ht,P as Bt,Q as He,R as xe,S as Ft,T as jt,U as ct,q as ce,i as Te,b as lt,C as Q,V as Le,W as dt,O as l,E as Be,l as ut,m as mt,x as pt,X as Gt,Y as ht,g as G,Z as yt,_ as Vt,z as Ut,$ as _t,a0 as Yt,a1 as Je,a2 as zt,a3 as Kt}from"./obrMetadataMigration-1.3.11.js";import{r as Xt,a as Jt}from"./contextMarkdown-1.3.11.js";function d(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function w(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function vt(e,t="",a="creature"){const n=E=>`${t}${E}`,o=e.scores??rt(),r=Re(e.hpBase,o[2]),i=Ae(e.loadBase,o[0]),s=r!==void 0&&e.hpMax!==r,c=i!==void 0&&e.maxLoad!==i,y=o.map((E,m)=>`
        <div class="ability-row">
          <label class="ability-score">${Ke[m]}
            <input id="${n(`score-${m}`)}" name="score-${m}" type="number" min="3" max="18" step="1" value="${w(E)}">
          </label>
          <span class="ability-modifier" aria-label="${Ke[m]} modifier">
            <span class="ability-modifier-label">${Xe[m]}</span>
            <span class="ability-modifier-value" data-score-modifier="${m}">${it(st(E))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${fe[m]}`)}" name="condition-${fe[m]}" type="checkbox" ${e.conditions?.[fe[m]]===-1?"checked":""}>
            ${At[m]} <span>−1 ${Xe[m]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${d(e.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${n("armor")}" name="armor" type="number" step="1" value="${w(e.armor)}"></label>
        <label>Current HP<input id="${n("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${w(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${n("hpMax")}" name="hpMax" class="${s?"calculation-mismatch":""}" type="number" min="0" step="1" value="${w(e.hpMax)}">
          <span class="calculated-hint" data-calculated-hp>Calculated: ${r??"—"}</span>
        </label>
      </div>
      <div class="damage-fields">
        <label>Damage die<input id="${n("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${d(e.damage??"")}"></label>
        <label>Damage description<input id="${n("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${d(e.damageDescription??"")}"></label>
      </div>
      <label>Damage tags<input id="${n("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${d(e.damageTags??"")}"></label>
      <label class="visibility">
        <input id="${n("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
        Show the token overlay to players
      </label>
    </section>
    <details class="editor-section expandable-fields" ${a==="creature"?"open":""}>
      <summary><strong>GM Character</strong></summary>
      <div class="editor-section-body">
        <label>Tags<input id="${n("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${d(e.tags??"")}"></label>
        <label>Instinct<textarea id="${n("instinct")}" name="instinct" rows="2">${d(e.instinct??"")}</textarea></label>
        <label>Moves<textarea id="${n("moves")}" name="moves" rows="4" placeholder="One move per line">${d(e.moves??"")}</textarea></label>
        <label>Treasure<textarea id="${n("treasure")}" name="treasure" rows="3">${d(e.treasure??"")}</textarea></label>
      </div>
    </details>
    <details class="editor-section expandable-fields player-fields" ${a==="character"?"open":""}>
      <summary><strong>Player Character</strong></summary>
      <div class="editor-section-body">
        <div class="progression-row">
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${w(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${w(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${d(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${w(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${w(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${c?"calculation-mismatch":""}" type="number" min="0" step="any" value="${w(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${i??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${y}</div>
      </div>
    </details>`}function Zt(e){const t=e.fields;return`${d(t.name)} · HP ${w(t.hpCurrent)||"—"}/${w(t.hpMax)||"—"} · ARM ${w(t.armor)||"—"} · DMG ${d(t.damage??"—")}`}function Qt(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function ea(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function ta(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
    <div class="inventory-row" data-inventory-row="${a}">
      <div class="inventory-primary">
        <input class="inventory-inline-input inventory-name" data-inventory-name="${a}" type="text" maxlength="120" value="${d(t[0])}" aria-label="Item name">
        <div class="inventory-actions">
          <button type="button" class="danger compact" data-inventory-remove="${a}" aria-label="Remove ${d(t[0])}">Remove</button>
          ${n.role==="GM"?`<button type="button" class="secondary compact" data-inventory-transfer="${a}">Transfer</button>`:""}
        </div>
      </div>
      <div class="inventory-metrics">
        <label class="inventory-metric">wt/ea:
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${w(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${d(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${d(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${d(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${Pt(Ht(t))}</strong></span>
      </div>
    </div>
    ${o?`<form class="transfer-form" data-transfer-form="${a}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${n.records.filter(r=>r.id!==e.id).map(r=>`<option value="${d(r.id)}">${d(r.fields.name)}</option>`).join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${t[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`:""}`}function aa(e,t){const a=e.inventory??[],n=Nt(qt(a),e.fields.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.fields.maxLoad===void 0?"Empty":Wt(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${d(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${d(e.fields.name)} inventory">
          ${a.length?a.map((i,s)=>ta(e,i,s,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function na(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.counts.get(e.id)??0;return`
    <details class="character-card" data-character-details="${d(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${d(e.fields.name)}</strong>
      </summary>
      <div class="character-card-body">
        <span>HP ${w(e.fields.hpCurrent)||"—"}/${w(e.fields.hpMax)||"—"} · ARM ${w(e.fields.armor)||"—"} · DMG ${d(e.fields.damage??"—")}</span>
        <span>${n} linked token${n===1?"":"s"} in current scene · Updated ${d(new Date(e.updatedAt).toLocaleString())}</span>
        <div class="card-actions">
          <button type="button" class="secondary compact" data-edit-character="${d(e.id)}">Edit Character</button>
          ${t.role==="GM"?`<button type="button" class="danger compact" data-delete-character="${d(e.id)}">Delete</button>`:""}
        </div>
        ${aa(e,t)}
      </div>
    </details>`}function oa(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${d(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${d(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${vt(e.editing.fields,"manager-","character")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${e.saving?"disabled":""}>${e.saving?"Saving…":"Save record"}</button>
          </div>
        </form>
      </section>`:`
    <section class="character-manager" data-home-section="characters">
      <div class="section-heading major-section-heading" draggable="true" data-drag-section="characters">
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>Character maintenance</span>
        </button>
      </div>
      ${t?`${e.role==="GM"?ea(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${d(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>na(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}const we=`${Bt}/creature-clipboard`,ft=1;function gt(e,t,a=new Date().toISOString()){const n=t.trim();if(!n)throw new Error("The copied token must have a name.");if(!Number.isFinite(Date.parse(a)))throw new Error("The copied-data timestamp is invalid.");return{schemaVersion:ft,sourceName:n,copiedAt:a,data:He(e)}}function ra(e,t){e.setItem(we,JSON.stringify(t))}function bt(e){try{const t=e.getItem(we);if(t===null)return;const a=JSON.parse(t);if(a.schemaVersion!==ft||typeof a.sourceName!="string"||typeof a.copiedAt!="string")throw new Error("Unsupported creature clipboard.");return gt(a.data,a.sourceName,a.copiedAt)}catch{try{e.removeItem(we)}catch{}return}}function ia(e,t){return xe({name:e,...t.data})}function sa(e){e.removeItem(we)}function ca(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function V(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function Ze(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function W(e,t){return String(e.get(t)??"").trim()||void 0}function la(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=V(e,"hpCurrent"),n.hpMax=V(e,"hpMax"),a)return n;n.tags=W(e,"tags"),n.hpBase=V(e,"hpBase"),n.maxLoad=Ze(e,"maxLoad"),n.loadBase=V(e,"loadBase"),n.armor=V(e,"armor"),n.damage=W(e,"damage"),n.damageDescription=W(e,"damageDescription"),n.damageTags=W(e,"damageTags"),n.instinct=W(e,"instinct"),n.moves=W(e,"moves"),n.treasure=W(e,"treasure"),n.level=V(e,"level"),n.xp=V(e,"xp");const o=rt();for(let i=0;i<o.length;i+=1)o[i]=Ze(e,`score-${i}`)??null;n.scores=Ft(o);const r={};for(const i of fe)e.get(`condition-${i}`)==="on"&&(r[i]=-1);return n.conditions=jt(r),n.alignment=W(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function Fe(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...la(e,t,a)}}function da(e,t,a,n){return{x:e.x+a/2-t.x,y:e.y+n/2-t.y}}function wt(e){return e.filter(t=>t.layer==="CHARACTER"&&Te(t)&&lt(t.metadata[Q])).map(t=>({id:t.id,itemText:Te(t)?t.text.plainText.trim():"",itemName:t.name.trim(),imageUrl:Te(t)?t.image.url:"",lastModified:t.lastModified??"",data:t.metadata[Q]})).sort((t,a)=>t.itemText.localeCompare(a.itemText,void 0,{sensitivity:"base"})||t.itemName.localeCompare(a.itemName,void 0,{sensitivity:"base"})||t.id.localeCompare(a.id))}function ua(e){if(typeof e!="object"||e===null||Array.isArray(e))return{schemaVersion:1,inactiveItemIds:[]};const t=e;if(!Array.isArray(t.inactiveItemIds))return{schemaVersion:1,inactiveItemIds:[]};const a=Ne(t.inactiveItemIds).sort();return t.schemaVersion===1?{schemaVersion:1,inactiveItemIds:a}:t.schemaVersion!==2||!Array.isArray(t.activeItemIds)?{schemaVersion:1,inactiveItemIds:[]}:{schemaVersion:2,inactiveItemIds:a,activeItemIds:Ne(t.activeItemIds).filter(n=>!a.includes(n))}}function Ne(e){return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function le(e){return ua(e[ct])}function je(e,t){const a=new Set(t.inactiveItemIds),n=new Map(e.map(c=>[c.id,c])),o=e.filter(c=>a.has(c.id));if(t.schemaVersion===1)return{active:e.filter(c=>!a.has(c.id)),inactive:o};const r=t.activeItemIds.map(c=>n.get(c)).filter(c=>c!==void 0&&!a.has(c.id)),i=new Set(r.map(c=>c.id));return{active:[...e.filter(c=>!a.has(c.id)&&!i.has(c.id)).sort((c,y)=>y.lastModified.localeCompare(c.lastModified)||ma(c,y)),...r],inactive:o}}function ma(e,t){return e.itemText.localeCompare(t.itemText,void 0,{sensitivity:"base"})||e.itemName.localeCompare(t.itemName,void 0,{sensitivity:"base"})||e.id.localeCompare(t.id)}function $t(e,t){const a=new Set(e.map(o=>o.id)),{active:n}=je(e,t);return{schemaVersion:2,inactiveItemIds:t.inactiveItemIds.filter(o=>a.has(o)).sort(),activeItemIds:n.map(o=>o.id)}}function kt(e,t){return t.schemaVersion===2&&e.inactiveItemIds.join("\0")===t.inactiveItemIds.join("\0")&&e.activeItemIds.join("\0")===t.activeItemIds.join("\0")}async function Ge(e,t,a,n){for(let o=0;o<n;o+=1){const r=await e.getMetadata(),i=$t(a,le(r)),s=t(i);await e.setMetadata({[ct]:s});const c=le(await e.getMetadata());if(kt(s,c))return s}throw new Error("Encounter layout changed on another GM client. Try again.")}async function pa(e,t,a=3){const n=await e.getMetadata(),o=le(n),r=$t(t,o);return kt(r,o)?r:Ge(e,i=>i,t,a)}async function ha(e,t,a,n,o=3){const r=new Set(t.map(i=>i.id));return Ge(e,i=>{const s=new Set(i.inactiveItemIds),c=i.activeItemIds.filter(y=>y!==a);return n?(s.delete(a),r.has(a)&&c.unshift(a)):r.has(a)&&s.add(a),{schemaVersion:2,inactiveItemIds:[...s].sort(),activeItemIds:c}},t,o)}async function ya(e,t,a,n=3){return Ge(e,o=>{const r=new Set(o.activeItemIds),i=Ne(a).filter(s=>r.has(s));for(const s of o.activeItemIds)i.includes(s)||i.push(s);return{...o,activeItemIds:i}},t,n)}function x(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function va(e){const t=e.hpCurrent,a=e.hpMax;if(t===void 0&&a===void 0)return{text:"—",percent:0,color:"empty",adjustable:!1};const n=`${t??"—"}/${a??"—"}`;if(t!==void 0&&a!==void 0&&t>a)return{text:n,percent:100,color:"purple",adjustable:!0};const o=a&&a>0&&t!==void 0?Math.max(0,Math.min(100,t/a*100)):0;return{text:n,percent:o,color:o>50?"green":o>25?"amber":"red",adjustable:t!==void 0}}function St(e){return`<span class="encounter-item-text">${x(e.itemText||"Unnamed character")}</span><span class="encounter-item-name">(${x(e.itemName||"Unnamed item")})</span>`}function Ct(e){return e.imageUrl?`<img class="encounter-thumbnail" src="${x(e.imageUrl)}" alt="">`:'<span class="encounter-thumbnail encounter-thumbnail-empty" aria-hidden="true"></span>'}function It(e,t,a){const n=t?"Move to Inactive":"Add to Encounter";return`<span class="encounter-actions"><button class="encounter-locate" type="button" data-encounter-locate="${x(e.id)}" aria-label="Locate on scene" title="Locate on scene">${ce("map-pin")}</button><button class="encounter-activity" type="button" data-encounter-active="${t?"false":"true"}" data-item-id="${x(e.id)}" aria-label="${n}" title="${n}" ${a?"disabled":""}>${ce(t?"minus-circle":"plus-circle")}</button></span>`}function fa(e,t){const a=e.data,n=va(a),o=a.damage?.trim(),r=a.damageDescription?.trim(),i=a.damageTags?.trim(),s=a.instinct?.trim(),c=a.moves?.trim(),y=t.has(e.id);return`<article class="encounter-card" data-encounter-item="${x(e.id)}">
    <div class="encounter-identity encounter-drag-handle" draggable="${y?"false":"true"}" data-encounter-drag="${x(e.id)}">${Ct(e)}<span class="encounter-identity-copy">${St(e)}</span>${It(e,!0,y)}</div>
    <div class="encounter-combat">
      <span class="encounter-armor" title="Armor">${ce("shield")}<strong>${a.armor??"—"}</strong></span>
      <span class="encounter-damage">${ce("sword")}<span class="encounter-damage-copy">${o?`<button type="button" data-encounter-damage="${x(o)}">🎲 ${x(o)}</button>`:"—"}${r?`<span> (${x(r)})</span>`:""}${i?`<em>${x(i)}</em>`:""}</span></span>
      <span class="encounter-hp"><button type="button" data-encounter-hp="-1" data-item-id="${x(e.id)}" aria-label="Decrease HP" ${!n.adjustable||y?"disabled":""}>−</button><span class="encounter-hp-bar hp-${n.color}"><span class="encounter-hp-fill" style="width:${n.percent}%"></span><strong>${n.text}</strong></span><button type="button" data-encounter-hp="1" data-item-id="${x(e.id)}" aria-label="Increase HP" ${!n.adjustable||y?"disabled":""}>+</button></span>
    </div>
    ${s?`<div class="encounter-instinct"><strong>Instinct:</strong> ${x(s)}</div>`:""}
    ${c?`<div class="encounter-moves"><strong>Moves:</strong><div class="markdown-content">${Xt(c)}</div></div>`:""}
  </article>`}function ga(e,t,a,n=new Set){const{active:o,inactive:r}=je(e,t);return`<div class="encounter-list" data-encounter-active-list>${o.length?o.map(i=>fa(i,n)).join(""):'<p class="encounter-empty">No active DWTools creatures in this scene.</p>'}</div>
    <section class="encounter-inactive">
      <button class="section-toggle encounter-inactive-toggle" type="button" data-toggle-section="encounterInactive" aria-expanded="${a}"><span class="section-arrow" aria-hidden="true">&#9656;</span><span>Inactive (${r.length})</span></button>
      ${a?`<div class="encounter-inactive-list">${r.length?r.map(i=>`<div class="encounter-inactive-row">${Ct(i)}<span class="encounter-identity-copy">${St(i)}</span>${It(i,!1,n.has(i.id))}</div>`).join(""):'<p class="encounter-empty">No inactive creatures.</p>'}</div>`:""}
    </section>`}function Ve(e){const t=e[Le];return typeof t=="boolean"?t:!0}function ba(e,t){return lt(e)?e:{visibleToPlayers:t}}async function wa(e,t){await e({[Le]:t})}const T={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,encounter:!1,encounterInactive:!1,settings:!1,characters:!1},$e=["agenda","moves","encounter","settings","characters"];function $a(e){const t=new Set($e),a=Array.isArray(e)?e.filter(o=>typeof o=="string"&&t.has(o)):[],n=[...new Set(a)];for(const o of $e)o!=="encounter"&&!n.includes(o)&&n.push(o);if(!n.includes("encounter")){const o=n.indexOf("moves");n.splice(o>=0?o+1:n.length,0,"encounter")}return n}const Et=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],xt=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function ye(e,t,a){return`
    <div class="section-heading major-section-heading" draggable="true" data-drag-section="${t}">
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
      </button>
    </div>`}function Qe(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function ka(e,t,a,n=T,o="",r="",i=""){const s=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section" data-home-section="agenda">
        ${ye("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section" data-home-section="moves">
        ${ye("Moves","moves",n.moves)}
        ${n.moves?`${Qe("Basic Moves","basicMoves",n.basicMoves,Et)}
        ${Qe("Special Moves","specialMoves",n.specialMoves,xt)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section encounter-section" data-home-section="encounter">
        ${ye("Encounter (Scene)","encounter",n.encounter)}
        ${n.encounter?r:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="settings">
        ${ye("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${s}" title="${s}" ${a?"disabled":""}>
            ${ce(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>`:""}
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
    </section>`}function et(e){const t=e[dt];return typeof t=="boolean"?t:!0}async function Sa(e,t){await e({[dt]:t})}const K=document.querySelector("#app"),de=new URLSearchParams(window.location.search),ee=de.get("itemId"),Lt=de.get("view")??"edit",tt=de.get("preview");function ke(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function C(e,t){return e instanceof Error?e.message:t}function h(e,t){l.isAvailable&&l.notification.show(e,t)}function Ue(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=_t(t.value);const a=Yt(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function Mt(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>Ue(e))}function M(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function Tt(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),o=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const r=()=>{for(let y=0;y<6;y+=1){const E=M(e,`score-${y}`),m=e.querySelector(`[data-score-modifier="${y}"]`);m&&(m.textContent=it(st(E)))}const s=Re(M(e,"hpBase"),M(e,"score-2")),c=Ae(M(e,"loadBase"),M(e,"score-0"));n&&(n.textContent=`Calculated: ${s??"—"}`),o&&(o.textContent=`Calculated: ${c??"—"}`),t.classList.toggle("calculation-mismatch",Je(M(e,"hpMax"),s)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",Je(M(e,"maxLoad"),c))},i=(s,c,y,E)=>{const m=e.elements.namedItem(s);!(m instanceof HTMLInputElement)||!(c instanceof HTMLInputElement)||(m.dataset.lastPromptedValue=m.value,m.addEventListener("blur",()=>{const Ot=m.dataset.lastPromptedValue??"",Me=E();if(!zt(Ot,m.value,M(e,c.name),Me)){m.dataset.lastPromptedValue=m.value,r();return}m.dataset.lastPromptedValue=m.value;const Rt=c.value.trim()||"blank";window.confirm(`${y} changed. Recalculate ${c.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${Rt} to ${Me}?`)&&(c.value=String(Me)),r()}))};for(const s of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))s.addEventListener("input",r);i("score-2",t,"Constitution",()=>Re(M(e,"hpBase"),M(e,"score-2"))),i("score-0",a,"Strength",()=>Ae(M(e,"loadBase"),M(e,"score-0"))),r()}function Ca(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],o={};for(const r of n)JSON.stringify(e[r])!==JSON.stringify(t[r])&&(o[r]=t[r]);return o}let k="PLAYER",_={},ge=!1,Z,ne,$,X=[],_e=new Map,me,qe=!1,A=!1,L,We=!1,b,te,B,Y=[],j={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};const z=new Set;let be=!1,P,De=0;const Se=new Set,Ce=new Set,Ia="dwtools/home-sections";function Ea(){try{const e=JSON.parse(localStorage.getItem(Ia)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:T.agenda,moves:typeof e.moves=="boolean"?e.moves:T.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:T.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:T.specialMoves,encounter:typeof e.encounter=="boolean"?e.encounter:T.encounter,encounterInactive:typeof e.encounterInactive=="boolean"?e.encounterInactive:T.encounterInactive,settings:typeof e.settings=="boolean"?e.settings:T.settings,characters:typeof e.characters=="boolean"?e.characters:T.characters}}catch{return{...T}}}function xa(e){const t=typeof e=="object"&&e!==null?e:{};return Object.fromEntries(Object.entries(T).map(([a,n])=>[a,typeof t[a]=="boolean"?t[a]:n]))}function at(e){const t=e[yt];if(typeof t=="object"&&t!==null){const a=t;O=xa(a.expanded),ae=$a(a.order);return}O=Ea(),ae=[...$e]}async function Pe(){try{await l.player.setMetadata({[yt]:{version:1,expanded:O,order:ae}})}catch(e){console.error("DWTools could not save the panel layout",e),h("DWTools could not save your panel layout.","ERROR")}}let O={...T},ae=[...$e],re;function La(){return{records:X,counts:_e,role:k,usage:me,loading:qe,saving:A,error:L,editing:b,expandedCharacters:Se,expandedInventories:Ce,draftCharacterId:te,transfer:B}}function u(){const e=Ve(_),t=oa(La(),O.characters||!!b),a=ga(Y,j,O.encounterInactive,z);K.innerHTML=ka(k,e,ge,O,t,a,Kt);const n=document.querySelector(".home"),o=document.querySelector(".extension-version, #move-dialog");if(n&&o)for(const r of ae){const i=n.querySelector(`[data-home-section="${r}"]`);i&&n.insertBefore(i,o)}document.querySelector("#default-visibility")?.addEventListener("click",()=>{Ba()});for(const r of document.querySelectorAll("[data-toggle-section]"))r.addEventListener("click",()=>{const i=r.dataset.toggleSection;O={...O,[i]:!O[i]},Pe(),u()});for(const r of document.querySelectorAll("[data-drag-section]")){const i=r.dataset.dragSection,s=r.closest("[data-home-section]");r.addEventListener("dragstart",c=>{re=i,s?.classList.add("dragging"),c.dataTransfer?.setData("text/plain",i),c.dataTransfer&&(c.dataTransfer.effectAllowed="move")}),r.addEventListener("dragend",()=>{re=void 0,document.querySelectorAll(".dragging, .drag-over").forEach(c=>c.classList.remove("dragging","drag-over"))}),s?.addEventListener("dragover",c=>{!re||re===i||(c.preventDefault(),s.classList.add("drag-over"))}),s?.addEventListener("dragleave",()=>s.classList.remove("drag-over")),s?.addEventListener("drop",c=>{c.preventDefault();const y=re;if(!y||y===i)return;const E=ae.filter(m=>m!==y);E.splice(E.indexOf(i),0,y),ae=E,Pe(),u()})}for(const r of document.querySelectorAll("[data-move]"))r.addEventListener("click",()=>{const i=[...Et,...xt].find(E=>E.id===r.dataset.move),s=document.querySelector("#move-dialog"),c=document.querySelector("#move-dialog-title"),y=document.querySelector("#move-dialog-text");!i||!s||!c||!y||(c.textContent=i.name,y.textContent=i.text,s.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),Ma(),qa()}function nt(e){const t=Ut(e);h(t.message,t.ok?"SUCCESS":"ERROR")}function Ma(){Da();for(const e of document.querySelectorAll("[data-encounter-locate]"))e.addEventListener("click",()=>{const t=e.dataset.encounterLocate;t&&Ra(t)});for(const e of document.querySelectorAll("[data-encounter-active]"))e.addEventListener("click",()=>{const t=e.dataset.itemId;t&&Aa(t,e.dataset.encounterActive==="true")});for(const e of document.querySelectorAll("[data-encounter-hp]"))e.addEventListener("click",()=>{const t=e.dataset.itemId,a=Number(e.dataset.encounterHp);t&&Number.isFinite(a)&&Na(t,a)});for(const e of document.querySelectorAll("[data-encounter-damage]"))e.addEventListener("click",()=>{const t=e.dataset.encounterDamage;t&&nt(t)});for(const e of document.querySelectorAll(".encounter-section [data-roll-expression]"))e.addEventListener("click",()=>{const t=e.dataset.rollExpression;t&&nt(t)})}function ot(){document.querySelectorAll(".encounter-dragging, .encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-dragging","encounter-drop-before","encounter-drop-after"))}function Ta(){document.querySelectorAll(".encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-drop-before","encounter-drop-after"))}function Da(){if(!be)for(const e of document.querySelectorAll("[data-encounter-drag]")){const t=e.closest("[data-encounter-item]");t&&(e.addEventListener("dragstart",a=>{if(a.target.closest("button")){a.preventDefault();return}P=e.dataset.encounterDrag,t.classList.add("encounter-dragging"),a.dataTransfer&&P&&(a.dataTransfer.effectAllowed="move",a.dataTransfer.setData("text/plain",P))}),e.addEventListener("dragend",()=>{P=void 0,ot()}),t.addEventListener("dragover",a=>{!P||P===t.dataset.encounterItem||(a.preventDefault(),Ta(),t.classList.add(a.clientY<t.getBoundingClientRect().top+t.offsetHeight/2?"encounter-drop-before":"encounter-drop-after"))}),t.addEventListener("drop",a=>{a.preventDefault();const n=P,o=t.dataset.encounterItem,r=t.classList.contains("encounter-drop-after");P=void 0,ot(),n&&o&&n!==o&&Oa(n,o,r)}))}}async function Oa(e,t,a){if(k!=="GM"||be)return;const n=je(Y,j).active.map(i=>i.id),o=n.filter(i=>i!==e),r=o.indexOf(t);if(!(r<0||!n.includes(e))&&(o.splice(r+(a?1:0),0,e),o.join("\0")!==n.join("\0"))){be=!0,u();try{j=await ya(Ye(),Y,o)}catch(i){console.error("DWTools could not reorder the encounter",i),h(C(i,"DWTools could not save the encounter order."),"ERROR")}finally{be=!1,u()}}}async function Ra(e){if(k==="GM")try{const[t,a,n,o,r]=await Promise.all([l.scene.items.getItemBounds([e]),l.viewport.getScale(),l.viewport.getPosition(),l.viewport.getWidth(),l.viewport.getHeight()]),i=await l.viewport.transformPoint(t.center);await l.viewport.animateTo({position:da(n,i,o,r),scale:a})}catch(t){console.error("DWTools could not locate the encounter item",t),h("That item is no longer available in the scene.","ERROR")}}function Ye(){return{getMetadata:()=>l.scene.getMetadata(),setMetadata:e=>l.scene.setMetadata(e)}}async function Aa(e,t){if(!(k!=="GM"||z.has(e))){z.add(e),u();try{j=await ha(Ye(),Y,e,t)}catch(a){console.error("DWTools could not update encounter activity",a),h(C(a,"DWTools could not update encounter activity."),"ERROR")}finally{z.delete(e),u()}}}async function Na(e,t){if(!(k!=="GM"||!ne||z.has(e))){z.add(e),u();try{const a=(await l.scene.items.getItems([e]))[0];if(!a)return;const n=wt([a])[0];if(!n||n.data.hpCurrent===void 0)return;await ne.updateCreatureFields(e,{hpCurrent:Jt(n.data.hpCurrent,t)})}catch(a){console.error("DWTools could not update encounter HP",a),h(C(a,"DWTools could not update encounter HP."),"ERROR")}finally{z.delete(e),u()}}}async function ve(e){const t=++De;if(k!=="GM"||!await l.scene.isReady()){if(t!==De)return;Y=[],j={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};return}const[a,n]=await Promise.all([e?Promise.resolve(e):l.scene.items.getItems(),l.scene.getMetadata()]);if(t!==De)return;Y=wt(a),j=le(n);try{j=await pa(Ye(),Y)}catch(r){console.error("DWTools could not reconcile the encounter order",r)}}function qa(){document.querySelector("#manager-create")?.addEventListener("click",()=>{L=void 0,b={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},O.characters=!0,Pe(),u()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{b=void 0,L=void 0,u()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=X.find(n=>n.id===t.dataset.editCharacter);a&&(L=void 0,b={kind:"edit",id:a.id,fields:a.fields},u())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{Ha(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(Mt(e),Tt(e),e.addEventListener("submit",t=>{t.preventDefault(),Pa(e)}));for(const t of document.querySelectorAll("[data-character-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.characterDetails;a&&(t.open?Se.add(a):Se.delete(a))});for(const t of document.querySelectorAll("[data-inventory-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.inventoryDetails;a&&(t.open?Ce.add(a):Ce.delete(a))});Wa()}function H(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return X.find(a=>a.id===t)}function J(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function U(e,t,a){if(!A){A=!0,L=void 0,a?Ie(a):u();try{await e(),te=void 0,B=void 0,await R(!1),t&&h(t,"SUCCESS"),me?.nearLimit&&h("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=C(n,"DWTools could not update this inventory.");await R(!1),L=o}finally{A=!1,a?Ie(a):u()}}}function Ie(e,t=!1){u(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function Oe(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function Wa(){if(!$)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=H(a),o=Number(a.dataset.inventoryName),r=n&&J(n,o);!n||!r||Oe(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const i=[a.value,r.expected[1],r.expected[2]];U(()=>$.updateInventoryItem(n.id,r,i))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=H(a),o=Number(a.dataset.inventoryWeight),r=n&&J(n,o);if(!n||!r)continue;const i=String(r.expected[1]);Oe(a,i,()=>{if(a.value===i)return;const s=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];U(()=>$.updateInventoryItem(n.id,r,s))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=H(a),o=Number(a.dataset.inventoryCount),r=n&&J(n,o);if(!n||!r)continue;const i=String(r.expected[2]);Oe(a,i,()=>{if(a.value===i)return;const s=a.value.trim()===""?Number.NaN:Number(a.value);U(()=>$.changeInventoryItemCount(n.id,r,s-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=H(a),o=Number(a.dataset.inventoryAdjust),r=n&&J(n,o),i=Number(a.dataset.change);!n||!r||U(()=>$.changeInventoryItemCount(n.id,r,i))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=H(a),o=Number(a.dataset.inventoryRemove),r=n&&J(n,o);!n||!r||U(()=>$.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=H(a);n&&(te=n.id,Se.add(n.id),Ce.add(n.id),Ie(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=te;te=void 0,a?Ie(a):u()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=H(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];U(()=>$.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=H(a),o=Number(a.dataset.inventoryTransfer),r=n&&J(n,o);!n||!r||(B={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},u())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{B=void 0,u()});const t=document.querySelector("[data-transfer-form]");t&&B&&t.addEventListener("submit",a=>{if(a.preventDefault(),!B||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),i=B;U(()=>$.transferInventoryItem(i.sourceCharacterId,o,{sourceIndex:i.sourceIndex,expected:i.expected},r),"Item transferred.")})}async function R(e=!0){if(!(!Z||!ne||!$)){qe=!0,L=void 0,e&&!b&&u();try{if(k==="GM"&&!We){const t=await $.cleanupLegacyTombstones();We=!0,t&&h(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[X,_e,me]=await Promise.all([$.listAccessible(),Vt(ne.scene),k==="GM"?Z.estimateUsage():Promise.resolve(void 0)]),k==="PLAYER"&&b?.kind==="edit"&&!X.some(t=>t.id===b?.id)&&(b=void 0,L="You no longer control a token linked to the Character being edited.")}catch(t){L=C(t,"DWTools could not load character records.")}finally{qe=!1,e&&!b&&u()}}}async function Pa(e){if(!(!b||!$||A)){if(!Ue(e)||!e.reportValidity()){L="Correct the highlighted character fields before saving.",u();return}A=!0,L=void 0,u();try{const t=xe(Fe(new FormData(e),b.fields,!1));b.kind==="create"?(await $.create(t),h("Character record created.","SUCCESS")):(await $.save(b.id,t),h("Character record saved.","SUCCESS")),b=void 0,await R(!1),me?.nearLimit&&h("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){L=C(t,"DWTools could not save the record.")}finally{A=!1,u()}}}async function Ha(e){if(!e||!$||A)return;const t=X.find(a=>a.id===e);if(t&&window.confirm(Qt(t.fields.name))){A=!0,L=void 0,u();try{await $.delete(e),h("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await R(!1)}catch(a){L=C(a,"DWTools could not delete the record.")}finally{A=!1,u()}}}async function Ba(){if(k!=="GM"||ge)return;const e=!Ve(_);ge=!0,u();try{await wa(t=>l.room.setMetadata(t),e),_={..._,[Le]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),h("DWTools could not save the default overlay visibility.","ERROR")}finally{ge=!1,u()}}async function Fa(){try{await ut()}catch(o){console.error("DWTools metadata namespace migration failed",o),K.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',h("DWTools could not migrate its saved data.","ERROR");return}Z=mt(),ne=pt(Z),$=Gt(Z,ne);const[e,t,a]=await Promise.all([l.player.getRole(),l.room.getMetadata(),l.player.getMetadata(),l.theme.getTheme().then(ke)]);k=e,_=t,at(a),await Promise.all([R(!1),ve()]),u();const n=[l.room.onMetadataChange(o=>{_=o,u()}),Z.subscribe(o=>{o.some(r=>r.lookup.status==="deleted")&&(We=!1),R(k==="PLAYER"||!b)}),l.player.onChange(o=>{k=o.role,at(o.metadata),b=void 0,te=void 0,B=void 0,Promise.all([R(),ve()]).then(u)}),l.scene.items.onChange(o=>{ve(o).then(u),R(k==="PLAYER"||!b)}),l.scene.onMetadataChange(o=>{j=le(o),u()}),l.scene.onReadyChange(()=>{Promise.all([R(),ve()]).then(u)}),l.room.onPermissionsChange(()=>{R(k==="PLAYER"||!b)}),l.theme.onChange(ke)];window.addEventListener("unload",()=>{for(const o of n)o()},{once:!0})}let F,I,p,f,D={status:"missing"},Ee=[],pe=!1,ie="",v=!1,N=!0,se=!1,S,he=!1,q,oe;function ja(e){const t=G(e);let a,n;t?D.status==="active"?(a=`Character record: <strong>${d(D.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${D.status==="malformed"?"malformed":D.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=ie.trim().toLocaleLowerCase(),r=o?Ee.filter(s=>s.fields.name.toLocaleLowerCase().includes(o)||s.fields.tags?.toLocaleLowerCase().includes(o)):Ee,i=pe?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${N?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${d(ie)}"></label>
        <div class="link-results">
          ${r.length?r.map(s=>`
                <button type="button" data-link-record="${d(s.id)}" data-link-search="${d(`${s.fields.name} ${s.fields.tags??""}`.toLocaleLowerCase())}">
                  ${Zt(s)}
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
        <input id="overwrite-label" type="checkbox" ${N?"checked":""} ${se?"disabled":""}>
        Overwrite label
      </label>
      ${i}
    </section>`}function Dt(e){return e?`Copied from ${e.sourceName} · ${new Date(e.copiedAt).toLocaleString()}`:"No copied DWTools data."}function Ga(){const e=he||D.status==="active";return`
    <section class="creature-clipboard-section">
      <div class="creature-clipboard-heading">
        <strong>DWTools data clipboard</strong>
        <span data-clipboard-status>${d(Dt(q))}</span>
      </div>
      ${oe?`<p class="clipboard-staged">Pasted data from ${d(oe.sourceName)} is staged. Save to apply it.</p>`:""}
      <div class="clipboard-actions">
        <button class="secondary" type="button" id="copy-creature-data" ${e&&!v?"":"disabled"}>Copy DWTools data</button>
        <button class="secondary" type="button" id="paste-creature-data" ${q&&!v?"":"disabled"}>Paste DWTools data</button>
        <button class="secondary" type="button" id="clear-creature-data" ${q&&!v?"":"disabled"}>Clear copied data</button>
      </div>
    </section>`}function g(){if(!p||!f)return;const e=Lt==="hp";K.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${d(f.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${ja(p)}
      ${S?`<p class="inline-error">${d(S)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${w(f.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${w(f.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:vt(f)}
      ${e?"":Ga()}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${v?"disabled":""}>${v?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=ca(a.value,n.value);o!==null&&(n.value=o)}),Mt(t),Tt(t);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{l.popover.close(Be)}),document.querySelector("#remove")?.addEventListener("click",()=>{Qa()}),document.querySelector("#copy-creature-data")?.addEventListener("click",()=>Va()),document.querySelector("#paste-creature-data")?.addEventListener("click",()=>Ya(t)),document.querySelector("#clear-creature-data")?.addEventListener("click",()=>Ua()),document.querySelector("#link-character")?.addEventListener("click",()=>{za()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{Ka(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{Ja()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Za()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{pe=!1,ie="",g()}),document.querySelector("#link-search")?.addEventListener("input",o=>{ie=o.currentTarget.value;const r=ie.trim().toLocaleLowerCase();for(const i of document.querySelectorAll("[data-link-search]"))i.hidden=!String(i.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{Xa(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),en(t)})}function ze(){const e=document.querySelector("[data-clipboard-status]");e&&(e.textContent=Dt(q));const t=document.querySelector("#paste-creature-data"),a=document.querySelector("#clear-creature-data");t&&(t.disabled=!q),a&&(a.disabled=!q)}function Va(){if(!p||!f||!he&&D.status!=="active"){h("This token has no saved DWTools data to copy.","WARNING");return}try{const e=gt(He(f),p.name);ra(window.localStorage,e),q=e,ze(),h(`Copied DWTools data from ${e.sourceName}.`,"SUCCESS")}catch(e){h(C(e,"DWTools could not copy the creature data."),"ERROR")}}function Ua(){try{sa(window.localStorage),q=void 0,ze(),h("Copied DWTools data cleared.","SUCCESS")}catch(e){h(C(e,"DWTools could not clear the copied data."),"ERROR")}}function _a(e){if(!f)return!1;try{const t=xe(Fe(new FormData(e),f,!1));return JSON.stringify(t)!==JSON.stringify(f)}catch{return!0}}function Ya(e){if(!p||!f)return;if(G(p)){h("Unlink this token from its Character record before pasting DWTools data.","ERROR");return}const t=bt(window.localStorage);if(q=t,!t){ze(),h("There is no valid copied DWTools data to paste.","WARNING");return}_a(e)&&!window.confirm("Replace the unsaved form values with the copied DWTools data?")||(f=ia(f.name,t),oe=t,S=void 0,g())}async function ue(){if(!ee||!I||!F)return;const e=await I.getItem(ee);if(!e){K.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}he=Q in e.metadata,oe=void 0,p=e,f=ht(e);const t=G(e);D=t?await F.inspect(t.characterId):{status:"missing"},D.status==="active"&&(f=D.record.fields),g()}async function za(){if(!(!F||v)){v=!0,S=void 0,g();try{Ee=await F.list(),pe=!0}catch(e){S=C(e,"DWTools could not load character records.")}finally{v=!1,g()}}}async function Ka(e){if(se)return;const t=N;N=e,se=!0,g();try{await Sa(a=>l.room.setMetadata(a),e)}catch(a){N=t,S=C(a,"DWTools could not save the overwrite-label setting.")}finally{se=!1,g()}}async function Xa(e){if(!e||!I||!p||v)return;const t=Ee.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${N?"overwritten":"retained"}.`)){v=!0,S=void 0,g();try{await I.linkToExistingCharacter(p.id,e,N),h(`Linked to ${t.fields.name}.`,"SUCCESS"),pe=!1,await ue()}catch(a){S=C(a,"DWTools could not link the character.")}finally{v=!1,g()}}}async function Ja(){if(!(!I||!p||v)){v=!0,S=void 0,g();try{const{record:e}=await I.createAndLinkCharacter(p.id);h(`Created and linked ${e.fields.name}.`,"SUCCESS"),pe=!1,await ue()}catch(e){S=C(e,"DWTools could not create and link the character.")}finally{v=!1,g()}}}async function Za(){if(!(!I||!p||v)){v=!0,S=void 0,g();try{await I.unlinkCharacter(p.id),h("Character unlinked; creature fields were retained.","SUCCESS"),await ue()}catch(e){S=C(e,"DWTools could not unlink the character.")}finally{v=!1,g()}}}async function Qa(){if(!(!I||!p||v||G(p)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){v=!0,g();try{await I.removeCreatureData(p.id),await l.popover.close(Be)}catch(t){S=C(t,"DWTools could not remove the creature data."),v=!1,g()}}}async function en(e){if(!(!I||!p||!f||v)){if(!Ue(e)||!e.reportValidity()){S="Correct the highlighted creature fields before saving.",g();return}v=!0,S=void 0,g();try{const t=Lt==="hp",a=xe(Fe(new FormData(e),f,t)),n=!!oe;if(n)await I.replaceUnlinkedCreatureData(p.id,He(a)),oe=void 0;else{let o=Ca(f,a,t);!he&&!G(p)&&(o=a),Object.keys(o).length&&await I.updateCreatureFields(p.id,o)}h(n?"Copied DWTools data saved.":G(p)?"Character record saved.":"Creature saved.","SUCCESS"),await l.popover.close(Be)}catch(t){S=C(t,"DWTools could not save the creature."),v=!1,g()}}}async function tn(){if(!ee)return;try{await ut()}catch(r){console.error("DWTools metadata namespace migration failed",r),K.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',h("DWTools could not migrate its saved data.","ERROR");return}F=mt(),I=pt(F),q=bt(window.localStorage);const[e,t]=await Promise.all([I.getItem(ee),l.room.getMetadata().catch(r=>(console.warn("DWTools could not load room visibility settings",r),{})),l.theme.getTheme().then(ke)]);if(!e){K.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}he=Q in e.metadata;const a=ba(e.metadata[Q],Ve(t));N=et(t),p={...e,metadata:{...e.metadata,[Q]:a}},f=ht(p);const n=G(p);D=n?await F.inspect(n.characterId):{status:"missing"},D.status==="active"&&(f=D.record.fields),g();const o=[F.subscribe(r=>{const i=p&&G(p);i&&r.some(s=>s.characterId===i.characterId)&&!v&&ue()}),l.scene.items.onChange(r=>{r.find(s=>s.id===ee)&&!v&&ue()}),l.room.onMetadataChange(r=>{se||(N=et(r),g())}),l.theme.onChange(ke)];window.addEventListener("unload",()=>{for(const r of o)r()},{once:!0})}tt==="home"?(k="GM",_={[Le]:de.get("default")!=="hidden"},X=[{schemaVersion:3,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],_e=new Map([["preview-active",2]]),me={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},u()):tt==="editor"?(N=de.get("overwriteLabel")?.toLocaleLowerCase()!=="false",p={id:"preview",name:"Frogman",metadata:{}},f={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},g()):ee?l.isAvailable?l.onReady(()=>{tn()}):K.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(u(),l.isAvailable&&l.onReady(()=>{Fa()}));
