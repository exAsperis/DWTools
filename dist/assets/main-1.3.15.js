import{B as mt,F as Pe,G as He,H as tt,A as at,u as we,I as jt,w as pt,J as ht,K as Ft,t as Gt,r as Ut,M as Vt,N as _t,P as Yt,Q as Ue,R as Te,S as zt,T as Kt,U as yt,q as ue,i as $e,b as ft,C as Q,V as De,W as vt,g as W,O as l,E as Ve,l as gt,m as bt,x as wt,X as Jt,Y as $t,Z as kt,_ as Xt,z as Zt,$ as Qt,a0 as ea,a1 as nt,a2 as ta,a3 as aa}from"./obrMetadataMigration-1.3.15.js";import{r as na,a as oa}from"./contextMarkdown-1.3.15.js";function d(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function $(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function St(e,t="",a="creature"){const n=v=>`${t}${v}`,o=e.scores??mt(),r=Pe(e.hpBase,o[2]),i=He(e.loadBase,o[0]),s=r!==void 0&&e.hpMax!==r,c=i!==void 0&&e.maxLoad!==i,u=o.map((v,m)=>`
        <div class="ability-row">
          <label class="ability-score">${tt[m]}
            <input id="${n(`score-${m}`)}" name="score-${m}" type="number" min="3" max="18" step="1" value="${$(v)}">
          </label>
          <span class="ability-modifier" aria-label="${tt[m]} modifier">
            <span class="ability-modifier-label">${at[m]}</span>
            <span class="ability-modifier-value" data-score-modifier="${m}">${pt(ht(v))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${we[m]}`)}" name="condition-${we[m]}" type="checkbox" ${e.conditions?.[we[m]]===-1?"checked":""}>
            ${jt[m]} <span>−1 ${at[m]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${d(e.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${n("armor")}" name="armor" type="number" step="1" value="${$(e.armor)}"></label>
        <label>Current HP<input id="${n("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${$(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${n("hpMax")}" name="hpMax" class="${s?"calculation-mismatch":""}" type="number" min="0" step="1" value="${$(e.hpMax)}">
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
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${$(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${$(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${d(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${$(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${$(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${c?"calculation-mismatch":""}" type="number" min="0" step="any" value="${$(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${i??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${u}</div>
      </div>
    </details>`}function ra(e){const t=e.fields;return`${d(t.name)} · HP ${$(t.hpCurrent)||"—"}/${$(t.hpMax)||"—"} · ARM ${$(t.armor)||"—"} · DMG ${d(t.damage??"—")}`}function ia(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function sa(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function ca(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
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
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${$(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${d(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${d(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${d(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${Vt(_t(t))}</strong></span>
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
        </form>`:""}`}function la(e,t){const a=e.inventory??[],n=Ft(Gt(a),e.fields.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.fields.maxLoad===void 0?"Empty":Ut(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${d(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${d(e.fields.name)} inventory">
          ${a.length?a.map((i,s)=>ca(e,i,s,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function da(e,t){const a=t.expandedStats?.has(e.id)??!1;return`
    <details class="stats-section" data-stats-details="${d(e.id)}" ${a?"open":""}>
      <summary><strong>Stats</strong></summary>
      <div class="stats-editor">
        <form class="manager-form stats-form" data-character-stats="${d(e.id)}">
          ${St(e.fields,`stats-${e.id}-`,"character")}
        </form>
        ${t.role==="GM"?`<button type="button" class="danger compact stats-delete" data-delete-character="${d(e.id)}">Delete Character</button>`:""}
      </div>
    </details>`}function ua(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.linkedTokens?.get(e.id)??[],o=n.length||t.counts.get(e.id)||0,r=n.filter(i=>i.imageUrl).map(i=>`<img class="linked-token-thumbnail" src="${d(i.imageUrl)}" alt="${d(i.name)}" title="${d(i.name)}">`).join("");return`
    <details class="character-card" data-character-details="${d(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${d(e.fields.name)}</strong>
      </summary>
      <div class="character-card-body">
        <span>HP ${$(e.fields.hpCurrent)||"—"}/${$(e.fields.hpMax)||"—"} · ARM ${$(e.fields.armor)||"—"} · DMG ${d(e.fields.damage??"—")}</span>
        <div class="linked-token-line">
          ${r?`<span class="linked-token-thumbnails" aria-label="Linked tokens">${r}</span>`:""}
          <span>${o} linked token${o===1?"":"s"} in current scene · Updated ${d(new Date(e.updatedAt).toLocaleString())}</span>
        </div>
        ${da(e,t)}
        ${la(e,t)}
      </div>
    </details>`}function ma(e,t=!1){return`
    <section class="character-manager" data-home-section="characters">
      <div class="section-heading major-section-heading" draggable="true" data-drag-section="characters">
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>Character maintenance</span>
        </button>
      </div>
      ${t?`${e.role==="GM"?sa(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${d(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>ua(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}const Ce=`${Yt}/creature-clipboard`,Ct=1;function xt(e,t,a=new Date().toISOString()){const n=t.trim();if(!n)throw new Error("The copied token must have a name.");if(!Number.isFinite(Date.parse(a)))throw new Error("The copied-data timestamp is invalid.");return{schemaVersion:Ct,sourceName:n,copiedAt:a,data:Ue(e)}}function pa(e,t){e.setItem(Ce,JSON.stringify(t))}function Et(e){try{const t=e.getItem(Ce);if(t===null)return;const a=JSON.parse(t);if(a.schemaVersion!==Ct||typeof a.sourceName!="string"||typeof a.copiedAt!="string")throw new Error("Unsupported creature clipboard.");return xt(a.data,a.sourceName,a.copiedAt)}catch{try{e.removeItem(Ce)}catch{}return}}function ha(e,t){return Te({name:e,...t.data})}function ya(e){e.removeItem(Ce)}function fa(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function Y(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function ot(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function P(e,t){return String(e.get(t)??"").trim()||void 0}function va(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=Y(e,"hpCurrent"),n.hpMax=Y(e,"hpMax"),a)return n;n.tags=P(e,"tags"),n.hpBase=Y(e,"hpBase"),n.maxLoad=ot(e,"maxLoad"),n.loadBase=Y(e,"loadBase"),n.armor=Y(e,"armor"),n.damage=P(e,"damage"),n.damageDescription=P(e,"damageDescription"),n.damageTags=P(e,"damageTags"),n.instinct=P(e,"instinct"),n.moves=P(e,"moves"),n.treasure=P(e,"treasure"),n.level=Y(e,"level"),n.xp=Y(e,"xp");const o=mt();for(let i=0;i<o.length;i+=1)o[i]=ot(e,`score-${i}`)??null;n.scores=zt(o);const r={};for(const i of we)e.get(`condition-${i}`)==="on"&&(r[i]=-1);return n.conditions=Kt(r),n.alignment=P(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function _e(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...va(e,t,a)}}function ga(e,t,a,n){return{x:e.x+a/2-t.x,y:e.y+n/2-t.y}}function Ye(e){return e.filter(t=>t.layer==="CHARACTER"&&$e(t)&&ft(t.metadata[Q])).map(t=>({id:t.id,itemText:$e(t)?t.text.plainText.trim():"",itemName:t.name.trim(),imageUrl:$e(t)?t.image.url:"",lastModified:t.lastModified??"",data:t.metadata[Q]})).sort((t,a)=>t.itemText.localeCompare(a.itemText,void 0,{sensitivity:"base"})||t.itemName.localeCompare(a.itemName,void 0,{sensitivity:"base"})||t.id.localeCompare(a.id))}function ba(e){if(typeof e!="object"||e===null||Array.isArray(e))return{schemaVersion:1,inactiveItemIds:[]};const t=e;if(!Array.isArray(t.inactiveItemIds))return{schemaVersion:1,inactiveItemIds:[]};const a=Be(t.inactiveItemIds).sort();return t.schemaVersion===1?{schemaVersion:1,inactiveItemIds:a}:t.schemaVersion!==2||!Array.isArray(t.activeItemIds)?{schemaVersion:1,inactiveItemIds:[]}:{schemaVersion:2,inactiveItemIds:a,activeItemIds:Be(t.activeItemIds).filter(n=>!a.includes(n))}}function Be(e){return[...new Set(e.filter(t=>typeof t=="string"&&t.length>0))]}function me(e){return ba(e[yt])}function ze(e,t){const a=new Set(t.inactiveItemIds),n=new Map(e.map(c=>[c.id,c])),o=e.filter(c=>a.has(c.id));if(t.schemaVersion===1)return{active:e.filter(c=>!a.has(c.id)),inactive:o};const r=t.activeItemIds.map(c=>n.get(c)).filter(c=>c!==void 0&&!a.has(c.id)),i=new Set(r.map(c=>c.id));return{active:[...e.filter(c=>!a.has(c.id)&&!i.has(c.id)).sort((c,u)=>u.lastModified.localeCompare(c.lastModified)||wa(c,u)),...r],inactive:o}}function wa(e,t){return e.itemText.localeCompare(t.itemText,void 0,{sensitivity:"base"})||e.itemName.localeCompare(t.itemName,void 0,{sensitivity:"base"})||e.id.localeCompare(t.id)}function It(e,t){const a=new Set(e.map(o=>o.id)),{active:n}=ze(e,t);return{schemaVersion:2,inactiveItemIds:t.inactiveItemIds.filter(o=>a.has(o)).sort(),activeItemIds:n.map(o=>o.id)}}function Lt(e,t){return t.schemaVersion===2&&e.inactiveItemIds.join("\0")===t.inactiveItemIds.join("\0")&&e.activeItemIds.join("\0")===t.activeItemIds.join("\0")}async function Ke(e,t,a,n){for(let o=0;o<n;o+=1){const r=await e.getMetadata(),i=It(a,me(r)),s=t(i);await e.setMetadata({[yt]:s});const c=me(await e.getMetadata());if(Lt(s,c))return s}throw new Error("Encounter layout changed on another GM client. Try again.")}async function $a(e,t,a=3){const n=await e.getMetadata(),o=me(n),r=It(t,o);return Lt(r,o)?r:Ke(e,i=>i,t,a)}async function ka(e,t,a,n,o=3){const r=new Set(t.map(i=>i.id));return Ke(e,i=>{const s=new Set(i.inactiveItemIds),c=i.activeItemIds.filter(u=>u!==a);return n?(s.delete(a),r.has(a)&&c.unshift(a)):r.has(a)&&s.add(a),{schemaVersion:2,inactiveItemIds:[...s].sort(),activeItemIds:c}},t,o)}async function Sa(e,t,a,n=3){return Ke(e,o=>{const r=new Set(o.activeItemIds),i=Be(a).filter(s=>r.has(s));for(const s of o.activeItemIds)i.includes(s)||i.push(s);return{...o,activeItemIds:i}},t,n)}function E(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function Ca(e){const t=e.hpCurrent,a=e.hpMax;if(t===void 0&&a===void 0)return{text:"—",percent:0,color:"empty",adjustable:!1};const n=`${t??"—"}/${a??"—"}`;if(t!==void 0&&a!==void 0&&t>a)return{text:n,percent:100,color:"purple",adjustable:!0};const o=a&&a>0&&t!==void 0?Math.max(0,Math.min(100,t/a*100)):0;return{text:n,percent:o,color:o>50?"green":o>25?"amber":"red",adjustable:t!==void 0}}function Mt(e){return`<span class="encounter-item-text">${E(e.itemText||"Unnamed character")}</span><span class="encounter-item-name">(${E(e.itemName||"Unnamed item")})</span>`}function Tt(e){return e.imageUrl?`<img class="encounter-thumbnail" src="${E(e.imageUrl)}" alt="">`:'<span class="encounter-thumbnail encounter-thumbnail-empty" aria-hidden="true"></span>'}function Dt(e,t,a){const n=t?"Move to Inactive":"Add to Encounter";return`<span class="encounter-actions"><button class="encounter-locate" type="button" data-encounter-locate="${E(e.id)}" aria-label="Locate on scene" title="Locate on scene">${ue("map-pin")}</button><button class="encounter-activity" type="button" data-encounter-active="${t?"false":"true"}" data-item-id="${E(e.id)}" aria-label="${n}" title="${n}" ${a?"disabled":""}>${ue(t?"minus-circle":"plus-circle")}</button></span>`}function xa(e,t){const a=e.data,n=Ca(a),o=a.damage?.trim(),r=a.damageDescription?.trim(),i=a.damageTags?.trim(),s=a.instinct?.trim(),c=a.moves?.trim(),u=t.has(e.id);return`<article class="encounter-card" data-encounter-item="${E(e.id)}">
    <div class="encounter-identity encounter-drag-handle" draggable="${u?"false":"true"}" data-encounter-drag="${E(e.id)}">${Tt(e)}<span class="encounter-identity-copy">${Mt(e)}</span>${Dt(e,!0,u)}</div>
    <div class="encounter-combat">
      <span class="encounter-armor" title="Armor">${ue("shield")}<strong>${a.armor??"—"}</strong></span>
      <span class="encounter-damage">${ue("sword")}<span class="encounter-damage-copy">${o?`<button type="button" data-encounter-damage="${E(o)}">🎲 ${E(o)}</button>`:"—"}${r?`<span> (${E(r)})</span>`:""}${i?`<em>${E(i)}</em>`:""}</span></span>
      <span class="encounter-hp"><button type="button" data-encounter-hp="-1" data-item-id="${E(e.id)}" aria-label="Decrease HP" ${!n.adjustable||u?"disabled":""}>−</button><span class="encounter-hp-bar hp-${n.color}"><span class="encounter-hp-fill" style="width:${n.percent}%"></span><strong>${n.text}</strong></span><button type="button" data-encounter-hp="1" data-item-id="${E(e.id)}" aria-label="Increase HP" ${!n.adjustable||u?"disabled":""}>+</button></span>
    </div>
    ${s?`<div class="encounter-instinct"><strong>Instinct:</strong> ${E(s)}</div>`:""}
    ${c?`<div class="encounter-moves"><strong>Moves:</strong><div class="markdown-content">${na(c)}</div></div>`:""}
  </article>`}function Ea(e,t,a,n=new Set){const{active:o,inactive:r}=ze(e,t);return`<div class="encounter-list" data-encounter-active-list>${o.length?o.map(i=>xa(i,n)).join(""):'<p class="encounter-empty">No active DWTools creatures in this scene.</p>'}</div>
    <section class="encounter-inactive">
      <button class="section-toggle encounter-inactive-toggle" type="button" data-toggle-section="encounterInactive" aria-expanded="${a}"><span class="section-arrow" aria-hidden="true">&#9656;</span><span>Inactive (${r.length})</span></button>
      ${a?`<div class="encounter-inactive-list">${r.length?r.map(i=>`<div class="encounter-inactive-row">${Tt(i)}<span class="encounter-identity-copy">${Mt(i)}</span>${Dt(i,!1,n.has(i.id))}</div>`).join(""):'<p class="encounter-empty">No inactive creatures.</p>'}</div>`:""}
    </section>`}function Je(e){const t=e[De];return typeof t=="boolean"?t:!0}function Ia(e,t){return ft(e)?e:{visibleToPlayers:t}}async function La(e,t){await e({[De]:t})}const I={agenda:!0,principles:!0,moves:!0,basicMoves:!0,specialMoves:!1,encounter:!1,encounterInactive:!1,settings:!1,characters:!1},xe=["agenda","principles","moves","encounter","settings","characters"];function Ma(e){const t=new Set(xe),a=Array.isArray(e)?e.filter(o=>typeof o=="string"&&t.has(o)):[],n=[...new Set(a)];for(const o of xe)o!=="encounter"&&o!=="principles"&&!n.includes(o)&&n.push(o);if(!n.includes("principles")){const o=n.indexOf("agenda");n.splice(o>=0?o+1:0,0,"principles")}if(!n.includes("encounter")){const o=n.indexOf("moves");n.splice(o>=0?o+1:n.length,0,"encounter")}return n}const Ot=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],At=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function ie(e,t,a){return`
    <div class="section-heading major-section-heading" draggable="true" data-drag-section="${t}">
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
      </button>
    </div>`}function rt(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function Ta(e,t,a,n=I,o="",r="",i=""){const s=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section" data-home-section="agenda">
        ${ie("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="principles">
        ${ie("Principles","principles",n.principles)}
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
        ${ie("Moves","moves",n.moves)}
        ${n.moves?`${rt("Basic Moves","basicMoves",n.basicMoves,Ot)}
        ${rt("Special Moves","specialMoves",n.specialMoves,At)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section encounter-section" data-home-section="encounter">
        ${ie("Encounter (Scene)","encounter",n.encounter)}
        ${n.encounter?r:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="settings">
        ${ie("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${s}" title="${s}" ${a?"disabled":""}>
            ${ue(t?"eye":"eye-off","default-visibility-icon")}
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
    </section>`}function it(e){const t=e[vt];return typeof t=="boolean"?t:!0}async function Da(e,t){await e({[vt]:t})}function qe(e,t,a,n){!n||!t||(a?e.add(t):e.delete(t))}function Ee(e){return Array.isArray(e)?`[${e.map(Ee).join(",")}]`:typeof e=="object"&&e!==null?`{${Object.entries(e).sort(([t],[a])=>t.localeCompare(a)).map(([t,a])=>`${JSON.stringify(t)}:${Ee(a)}`).join(",")}}`:JSON.stringify(e)}function Rt(e){return Ee(e.map(({id:t,itemText:a,itemName:n,imageUrl:o,data:r})=>({id:t,itemText:a,itemName:n,imageUrl:o,data:r})))}function qt(e){return Ee([...e.entries()].sort(([t],[a])=>t.localeCompare(a)))}function Oa(e){const t=new Map;for(const a of e){const n=W(a);if(!n)continue;const o=t.get(n.characterId)??[];o.push({id:a.id,name:a.name.trim()||"Linked token",imageUrl:$e(a)?a.image.url:""}),t.set(n.characterId,o)}return{encounter:Rt(Ye(e)),linkedTokens:qt(t)}}const V=document.querySelector("#app"),pe=new URLSearchParams(window.location.search),ee=pe.get("itemId"),Nt=pe.get("view")??"edit",st=pe.get("preview");function Ie(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function k(e,t){return e instanceof Error?e.message:t}function y(e,t){l.isAvailable&&l.notification.show(e,t)}function Xe(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=Qt(t.value);const a=ea(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function Wt(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>Xe(e))}function L(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function Pt(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),o=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const r=()=>{for(let u=0;u<6;u+=1){const v=L(e,`score-${u}`),m=e.querySelector(`[data-score-modifier="${u}"]`);m&&(m.textContent=pt(ht(v)))}const s=Pe(L(e,"hpBase"),L(e,"score-2")),c=He(L(e,"loadBase"),L(e,"score-0"));n&&(n.textContent=`Calculated: ${s??"—"}`),o&&(o.textContent=`Calculated: ${c??"—"}`),t.classList.toggle("calculation-mismatch",nt(L(e,"hpMax"),s)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",nt(L(e,"maxLoad"),c))},i=(s,c,u,v)=>{const m=e.elements.namedItem(s);!(m instanceof HTMLInputElement)||!(c instanceof HTMLInputElement)||(m.dataset.lastPromptedValue=m.value,m.addEventListener("blur",()=>{const _=m.dataset.lastPromptedValue??"",re=v();if(!ta(_,m.value,L(e,c.name),re)){m.dataset.lastPromptedValue=m.value,r();return}m.dataset.lastPromptedValue=m.value;const Bt=c.value.trim()||"blank";window.confirm(`${u} changed. Recalculate ${c.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${Bt} to ${re}?`)&&(c.value=String(re)),r()}))};for(const s of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))s.addEventListener("input",r);i("score-2",t,"Constitution",()=>Pe(L(e,"hpBase"),L(e,"score-2"))),i("score-0",a,"Strength",()=>He(L(e,"loadBase"),L(e,"score-0"))),r()}function je(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],o={};for(const r of n)JSON.stringify(e[r])!==JSON.stringify(t[r])&&(o[r]=t[r]);return o}let C="PLAYER",K={},ke=!1,Z,ne,w,N=[],Ze=new Map,he=new Map,Oe,Fe=!1,T=!1,D,Ge=!1;const Ae=new Set,ce=new Map;let te,j,G=[],U={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};const J=new Set;let Se=!1,H,Ne=0;const fe=new Set,Re=new Set,Aa="dwtools/home-sections";function Ra(){try{const e=JSON.parse(localStorage.getItem(Aa)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:I.agenda,principles:typeof e.principles=="boolean"?e.principles:I.principles,moves:typeof e.moves=="boolean"?e.moves:I.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:I.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:I.specialMoves,encounter:typeof e.encounter=="boolean"?e.encounter:I.encounter,encounterInactive:typeof e.encounterInactive=="boolean"?e.encounterInactive:I.encounterInactive,settings:typeof e.settings=="boolean"?e.settings:I.settings,characters:typeof e.characters=="boolean"?e.characters:I.characters}}catch{return{...I}}}function qa(e){const t=typeof e=="object"&&e!==null?e:{};return Object.fromEntries(Object.entries(I).map(([a,n])=>[a,typeof t[a]=="boolean"?t[a]:n]))}function ct(e){const t=e[kt];if(typeof t=="object"&&t!==null){const a=t;q=qa(a.expanded),ae=Ma(a.order);return}q=Ra(),ae=[...xe]}async function lt(){try{await l.player.setMetadata({[kt]:{version:1,expanded:q,order:ae}})}catch(e){console.error("DWTools could not save the panel layout",e),y("DWTools could not save your panel layout.","ERROR")}}let q={...I},ae=[...xe],se;function Na(){return{records:N,counts:Ze,linkedTokens:he,role:C,usage:Oe,loading:Fe,saving:T,error:D,expandedCharacters:fe,expandedStats:Ae,expandedInventories:Re,draftCharacterId:te,transfer:j}}function Wa(){const e=(t,a)=>{for(const n of V.querySelectorAll(t)){const o=n.dataset.characterDetails??n.dataset.statsDetails??n.dataset.inventoryDetails;o&&(n.open?a.add(o):a.delete(o))}};e("[data-character-details]",fe),e("[data-stats-details]",Ae),e("[data-inventory-details]",Re)}function p(){Wa();const e=document.scrollingElement?.scrollLeft??window.scrollX,t=document.scrollingElement?.scrollTop??window.scrollY,a=Je(K),n=ma(Na(),q.characters),o=Ea(G,U,q.encounterInactive,J);V.innerHTML=Ta(C,a,ke,q,n,o,aa);const r=document.querySelector(".home"),i=document.querySelector(".extension-version, #move-dialog");if(r&&i)for(const s of ae){const c=r.querySelector(`[data-home-section="${s}"]`);c&&r.insertBefore(c,i)}document.querySelector("#default-visibility")?.addEventListener("click",()=>{Xa()});for(const s of document.querySelectorAll("[data-toggle-section]"))s.addEventListener("click",()=>{const c=s.dataset.toggleSection;q={...q,[c]:!q[c]},lt(),p()});for(const s of document.querySelectorAll("[data-drag-section]")){const c=s.dataset.dragSection,u=s.closest("[data-home-section]");s.addEventListener("dragstart",v=>{se=c,u?.classList.add("dragging"),v.dataTransfer?.setData("text/plain",c),v.dataTransfer&&(v.dataTransfer.effectAllowed="move")}),s.addEventListener("dragend",()=>{se=void 0,document.querySelectorAll(".dragging, .drag-over").forEach(v=>v.classList.remove("dragging","drag-over"))}),u?.addEventListener("dragover",v=>{!se||se===c||(v.preventDefault(),u.classList.add("drag-over"))}),u?.addEventListener("dragleave",()=>u.classList.remove("drag-over")),u?.addEventListener("drop",v=>{v.preventDefault();const m=se;if(!m||m===c)return;const _=ae.filter(re=>re!==m);_.splice(_.indexOf(c),0,m),ae=_,lt(),p()})}for(const s of document.querySelectorAll("[data-move]"))s.addEventListener("click",()=>{const c=[...Ot,...At].find(_=>_.id===s.dataset.move),u=document.querySelector("#move-dialog"),v=document.querySelector("#move-dialog-title"),m=document.querySelector("#move-dialog-text");!c||!u||!v||!m||(v.textContent=c.name,m.textContent=c.text,u.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),Pa(),Va(),window.scrollTo(e,t)}function dt(e){const t=Zt(e);y(t.message,t.ok?"SUCCESS":"ERROR")}function Pa(){Ba();for(const e of document.querySelectorAll("[data-encounter-locate]"))e.addEventListener("click",()=>{const t=e.dataset.encounterLocate;t&&Fa(t)});for(const e of document.querySelectorAll("[data-encounter-active]"))e.addEventListener("click",()=>{const t=e.dataset.itemId;t&&Ga(t,e.dataset.encounterActive==="true")});for(const e of document.querySelectorAll("[data-encounter-hp]"))e.addEventListener("click",()=>{const t=e.dataset.itemId,a=Number(e.dataset.encounterHp);t&&Number.isFinite(a)&&Ua(t,a)});for(const e of document.querySelectorAll("[data-encounter-damage]"))e.addEventListener("click",()=>{const t=e.dataset.encounterDamage;t&&dt(t)});for(const e of document.querySelectorAll(".encounter-section [data-roll-expression]"))e.addEventListener("click",()=>{const t=e.dataset.rollExpression;t&&dt(t)})}function ut(){document.querySelectorAll(".encounter-dragging, .encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-dragging","encounter-drop-before","encounter-drop-after"))}function Ha(){document.querySelectorAll(".encounter-drop-before, .encounter-drop-after").forEach(e=>e.classList.remove("encounter-drop-before","encounter-drop-after"))}function Ba(){if(!Se)for(const e of document.querySelectorAll("[data-encounter-drag]")){const t=e.closest("[data-encounter-item]");t&&(e.addEventListener("dragstart",a=>{if(a.target.closest("button")){a.preventDefault();return}H=e.dataset.encounterDrag,t.classList.add("encounter-dragging"),a.dataTransfer&&H&&(a.dataTransfer.effectAllowed="move",a.dataTransfer.setData("text/plain",H))}),e.addEventListener("dragend",()=>{H=void 0,ut()}),t.addEventListener("dragover",a=>{!H||H===t.dataset.encounterItem||(a.preventDefault(),Ha(),t.classList.add(a.clientY<t.getBoundingClientRect().top+t.offsetHeight/2?"encounter-drop-before":"encounter-drop-after"))}),t.addEventListener("drop",a=>{a.preventDefault();const n=H,o=t.dataset.encounterItem,r=t.classList.contains("encounter-drop-after");H=void 0,ut(),n&&o&&n!==o&&ja(n,o,r)}))}}async function ja(e,t,a){if(C!=="GM"||Se)return;const n=ze(G,U).active.map(i=>i.id),o=n.filter(i=>i!==e),r=o.indexOf(t);if(!(r<0||!n.includes(e))&&(o.splice(r+(a?1:0),0,e),o.join("\0")!==n.join("\0"))){Se=!0,p();try{U=await Sa(Qe(),G,o)}catch(i){console.error("DWTools could not reorder the encounter",i),y(k(i,"DWTools could not save the encounter order."),"ERROR")}finally{Se=!1,p()}}}async function Fa(e){if(C==="GM")try{const[t,a,n,o,r]=await Promise.all([l.scene.items.getItemBounds([e]),l.viewport.getScale(),l.viewport.getPosition(),l.viewport.getWidth(),l.viewport.getHeight()]),i=await l.viewport.transformPoint(t.center);await l.viewport.animateTo({position:ga(n,i,o,r),scale:a})}catch(t){console.error("DWTools could not locate the encounter item",t),y("That item is no longer available in the scene.","ERROR")}}function Qe(){return{getMetadata:()=>l.scene.getMetadata(),setMetadata:e=>l.scene.setMetadata(e)}}async function Ga(e,t){if(!(C!=="GM"||J.has(e))){J.add(e),p();try{U=await ka(Qe(),G,e,t)}catch(a){console.error("DWTools could not update encounter activity",a),y(k(a,"DWTools could not update encounter activity."),"ERROR")}finally{J.delete(e),p()}}}async function Ua(e,t){if(!(C!=="GM"||!ne||J.has(e))){J.add(e),p();try{const a=(await l.scene.items.getItems([e]))[0];if(!a)return;const n=Ye([a])[0];if(!n||n.data.hpCurrent===void 0)return;await ne.updateCreatureFields(e,{hpCurrent:oa(n.data.hpCurrent,t)})}catch(a){console.error("DWTools could not update encounter HP",a),y(k(a,"DWTools could not update encounter HP."),"ERROR")}finally{J.delete(e),p()}}}async function be(e){const t=++Ne;if(C!=="GM"||!await l.scene.isReady()){if(t!==Ne)return;G=[],U={schemaVersion:2,inactiveItemIds:[],activeItemIds:[]};return}const[a,n]=await Promise.all([e?Promise.resolve(e):l.scene.items.getItems(),l.scene.getMetadata()]);if(t!==Ne)return;G=Ye(a),U=me(n);try{U=await $a(Qe(),G)}catch(r){console.error("DWTools could not reconcile the encounter order",r)}}function Va(){document.querySelector("#manager-create")?.addEventListener("click",()=>{_a()});for(const e of document.querySelectorAll("[data-delete-character]"))e.addEventListener("click",()=>{Ja(e.dataset.deleteCharacter)});for(const e of document.querySelectorAll("[data-character-details]"))e.addEventListener("toggle",()=>{qe(fe,e.dataset.characterDetails,e.open,e.isConnected)});for(const e of document.querySelectorAll("[data-stats-details]"))e.addEventListener("toggle",()=>{qe(Ae,e.dataset.statsDetails,e.open,e.isConnected)});for(const e of document.querySelectorAll("[data-inventory-details]"))e.addEventListener("toggle",()=>{qe(Re,e.dataset.inventoryDetails,e.open,e.isConnected)});Ya(),Ka()}async function _a(){if(!w||T)return;T=!0,D=void 0,p();let e;try{const t=await w.create({name:"Untitled character",visibleToPlayers:!0});e=t.id,await O(!1),fe.add(t.id),Ae.add(t.id)}catch(t){D=k(t,"DWTools could not create the Character.")}finally{T=!1,p(),e&&window.requestAnimationFrame(()=>{const t=document.querySelector(`[data-character-details="${CSS.escape(e)}"]`);t?.scrollIntoView({block:"nearest"}),t?.querySelector('[name="name"]')?.focus()})}}function Ya(){for(const e of document.querySelectorAll("[data-character-stats]")){const t=e.dataset.characterStats;if(!t)continue;Wt(e),Pt(e),e.addEventListener("submit",n=>n.preventDefault());const a=()=>za(t,e);for(const n of e.querySelectorAll("input, textarea, select"))n instanceof HTMLInputElement&&(n.type==="checkbox"||n.type==="radio")||n instanceof HTMLSelectElement?n.addEventListener("change",a):n.addEventListener("blur",a)}}function za(e,t){const a=N.find(s=>s.id===e);if(!a||!w||!Xe(t)||!t.checkValidity())return;const n=Te(_e(new FormData(t),a.fields,!1)),o=je(a.fields,n,!1);if(!Object.keys(o).length)return;const i=(ce.get(e)??Promise.resolve()).catch(()=>{}).then(async()=>{const s=N.find(u=>u.id===e);if(!s||!w)return;const c=je(s.fields,n,!1);if(Object.keys(c).length)try{const u=await w.patch(e,c);N=N.map(v=>v.id===e?u:v),D=void 0}catch(u){D=k(u,"DWTools could not update these Character stats."),y(D,"ERROR")}}).finally(()=>{if(ce.get(e)!==i)return;ce.delete(e),document.querySelector(`[data-character-stats="${CSS.escape(e)}"]`)?.contains(document.activeElement)||p()});ce.set(e,i)}function B(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return N.find(a=>a.id===t)}function X(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function z(e,t,a){if(!T){T=!0,D=void 0,a?Le(a):p();try{await e(),te=void 0,j=void 0,await O(!1),t&&y(t,"SUCCESS"),Oe?.nearLimit&&y("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=k(n,"DWTools could not update this inventory.");await O(!1),D=o}finally{T=!1,a?Le(a):p()}}}function Le(e,t=!1){p(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function We(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function Ka(){if(!w)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=B(a),o=Number(a.dataset.inventoryName),r=n&&X(n,o);!n||!r||We(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const i=[a.value,r.expected[1],r.expected[2]];z(()=>w.updateInventoryItem(n.id,r,i))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=B(a),o=Number(a.dataset.inventoryWeight),r=n&&X(n,o);if(!n||!r)continue;const i=String(r.expected[1]);We(a,i,()=>{if(a.value===i)return;const s=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];z(()=>w.updateInventoryItem(n.id,r,s))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=B(a),o=Number(a.dataset.inventoryCount),r=n&&X(n,o);if(!n||!r)continue;const i=String(r.expected[2]);We(a,i,()=>{if(a.value===i)return;const s=a.value.trim()===""?Number.NaN:Number(a.value);z(()=>w.changeInventoryItemCount(n.id,r,s-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=B(a),o=Number(a.dataset.inventoryAdjust),r=n&&X(n,o),i=Number(a.dataset.change);!n||!r||z(()=>w.changeInventoryItemCount(n.id,r,i))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=B(a),o=Number(a.dataset.inventoryRemove),r=n&&X(n,o);!n||!r||z(()=>w.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=B(a);n&&(te=n.id,fe.add(n.id),Re.add(n.id),Le(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=te;te=void 0,a?Le(a):p()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=B(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];z(()=>w.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=B(a),o=Number(a.dataset.inventoryTransfer),r=n&&X(n,o);!n||!r||(j={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},p())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{j=void 0,p()});const t=document.querySelector("[data-transfer-form]");t&&j&&t.addEventListener("submit",a=>{if(a.preventDefault(),!j||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),i=j;z(()=>w.transferInventoryItem(i.sourceCharacterId,o,{sourceIndex:i.sourceIndex,expected:i.expected},r),"Item transferred.")})}async function O(e=!0){if(!(!Z||!ne||!w)){Fe=!0,D=void 0,e&&p();try{if(C==="GM"&&!Ge){const t=await w.cleanupLegacyTombstones();Ge=!0,t&&y(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[N,he,Oe]=await Promise.all([w.listAccessible(),Xt(ne.scene),C==="GM"?Z.estimateUsage():Promise.resolve(void 0)]),Ze=new Map([...he].map(([t,a])=>[t,a.length]))}catch(t){D=k(t,"DWTools could not load character records.")}finally{Fe=!1,e&&p()}}}async function Ja(e){if(!e||!w||T)return;const t=N.find(a=>a.id===e);if(t&&window.confirm(ia(t.fields.name))){T=!0,D=void 0,p();try{await w.delete(e),y("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await O(!1)}catch(a){D=k(a,"DWTools could not delete the record.")}finally{T=!1,p()}}}async function Xa(){if(C!=="GM"||ke)return;const e=!Je(K);ke=!0,p();try{await La(t=>l.room.setMetadata(t),e),K={...K,[De]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),y("DWTools could not save the default overlay visibility.","ERROR")}finally{ke=!1,p()}}async function Za(){try{await gt()}catch(o){console.error("DWTools metadata namespace migration failed",o),V.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',y("DWTools could not migrate its saved data.","ERROR");return}Z=bt(),ne=wt(Z),w=Jt(Z,ne);const[e,t,a]=await Promise.all([l.player.getRole(),l.room.getMetadata(),l.player.getMetadata(),l.theme.getTheme().then(Ie)]);C=e,K=t,ct(a),await Promise.all([O(!1),be()]),p();const n=[l.room.onMetadataChange(o=>{K=o,p()}),Z.subscribe(o=>{o.some(r=>r.lookup.status==="deleted")&&(Ge=!1),O(ce.size===0&&(C==="PLAYER"||!T))}),l.player.onChange(o=>{C=o.role,ct(o.metadata),te=void 0,j=void 0,Promise.all([O(),be()]).then(p)}),l.scene.items.onChange(o=>{const r=Oa(o),i=r.encounter!==Rt(G),s=r.linkedTokens!==qt(he);!i&&!s||Promise.all([i?be(o):Promise.resolve(),s?O(!1):Promise.resolve()]).then(p)}),l.scene.onMetadataChange(o=>{U=me(o),p()}),l.scene.onReadyChange(()=>{Promise.all([O(),be()]).then(p)}),l.room.onPermissionsChange(()=>{O(C==="PLAYER"||!T)}),l.theme.onChange(Ie)];window.addEventListener("unload",()=>{for(const o of n)o()},{once:!0})}let F,x,h,g,M={status:"missing"},Me=[],ve=!1,le="",f=!1,A=!0,de=!1,S,ge=!1,R,oe;function Qa(e){const t=W(e);let a,n;t?M.status==="active"?(a=`Character record: <strong>${d(M.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${M.status==="malformed"?"malformed":M.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=le.trim().toLocaleLowerCase(),r=o?Me.filter(s=>s.fields.name.toLocaleLowerCase().includes(o)||s.fields.tags?.toLocaleLowerCase().includes(o)):Me,i=ve?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${A?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${d(le)}"></label>
        <div class="link-results">
          ${r.length?r.map(s=>`
                <button type="button" data-link-record="${d(s.id)}" data-link-search="${d(`${s.fields.name} ${s.fields.tags??""}`.toLocaleLowerCase())}">
                  ${ra(s)}
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
        <input id="overwrite-label" type="checkbox" ${A?"checked":""} ${de?"disabled":""}>
        Overwrite label
      </label>
      ${i}
    </section>`}function Ht(e){return e?`Copied from ${e.sourceName} · ${new Date(e.copiedAt).toLocaleString()}`:"No copied DWTools data."}function en(){const e=ge||M.status==="active";return`
    <section class="creature-clipboard-section">
      <div class="creature-clipboard-heading">
        <strong>DWTools data clipboard</strong>
        <span data-clipboard-status>${d(Ht(R))}</span>
      </div>
      ${oe?`<p class="clipboard-staged">Pasted data from ${d(oe.sourceName)} is staged. Save to apply it.</p>`:""}
      <div class="clipboard-actions">
        <button class="secondary" type="button" id="copy-creature-data" ${e&&!f?"":"disabled"}>Copy DWTools data</button>
        <button class="secondary" type="button" id="paste-creature-data" ${R&&!f?"":"disabled"}>Paste DWTools data</button>
        <button class="secondary" type="button" id="clear-creature-data" ${R&&!f?"":"disabled"}>Clear copied data</button>
      </div>
    </section>`}function b(){if(!h||!g)return;const e=Nt==="hp";V.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${d(g.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${Qa(h)}
      ${S?`<p class="inline-error">${d(S)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${$(g.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${$(g.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:St(g)}
      ${e?"":en()}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${f?"disabled":""}>${f?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=fa(a.value,n.value);o!==null&&(n.value=o)}),Wt(t),Pt(t);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{l.popover.close(Ve)}),document.querySelector("#remove")?.addEventListener("click",()=>{un()}),document.querySelector("#copy-creature-data")?.addEventListener("click",()=>tn()),document.querySelector("#paste-creature-data")?.addEventListener("click",()=>on(t)),document.querySelector("#clear-creature-data")?.addEventListener("click",()=>an()),document.querySelector("#link-character")?.addEventListener("click",()=>{rn()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{sn(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{ln()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{dn()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{ve=!1,le="",b()}),document.querySelector("#link-search")?.addEventListener("input",o=>{le=o.currentTarget.value;const r=le.trim().toLocaleLowerCase();for(const i of document.querySelectorAll("[data-link-search]"))i.hidden=!String(i.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{cn(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),mn(t)})}function et(){const e=document.querySelector("[data-clipboard-status]");e&&(e.textContent=Ht(R));const t=document.querySelector("#paste-creature-data"),a=document.querySelector("#clear-creature-data");t&&(t.disabled=!R),a&&(a.disabled=!R)}function tn(){if(!h||!g||!ge&&M.status!=="active"){y("This token has no saved DWTools data to copy.","WARNING");return}try{const e=xt(Ue(g),h.name);pa(window.localStorage,e),R=e,et(),y(`Copied DWTools data from ${e.sourceName}.`,"SUCCESS")}catch(e){y(k(e,"DWTools could not copy the creature data."),"ERROR")}}function an(){try{ya(window.localStorage),R=void 0,et(),y("Copied DWTools data cleared.","SUCCESS")}catch(e){y(k(e,"DWTools could not clear the copied data."),"ERROR")}}function nn(e){if(!g)return!1;try{const t=Te(_e(new FormData(e),g,!1));return JSON.stringify(t)!==JSON.stringify(g)}catch{return!0}}function on(e){if(!h||!g)return;if(W(h)){y("Unlink this token from its Character record before pasting DWTools data.","ERROR");return}const t=Et(window.localStorage);if(R=t,!t){et(),y("There is no valid copied DWTools data to paste.","WARNING");return}nn(e)&&!window.confirm("Replace the unsaved form values with the copied DWTools data?")||(g=ha(g.name,t),oe=t,S=void 0,b())}async function ye(){if(!ee||!x||!F)return;const e=await x.getItem(ee);if(!e){V.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ge=Q in e.metadata,oe=void 0,h=e,g=$t(e);const t=W(e);M=t?await F.inspect(t.characterId):{status:"missing"},M.status==="active"&&(g=M.record.fields),b()}async function rn(){if(!(!F||f)){f=!0,S=void 0,b();try{Me=await F.list(),ve=!0}catch(e){S=k(e,"DWTools could not load character records.")}finally{f=!1,b()}}}async function sn(e){if(de)return;const t=A;A=e,de=!0,b();try{await Da(a=>l.room.setMetadata(a),e)}catch(a){A=t,S=k(a,"DWTools could not save the overwrite-label setting.")}finally{de=!1,b()}}async function cn(e){if(!e||!x||!h||f)return;const t=Me.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${A?"overwritten":"retained"}.`)){f=!0,S=void 0,b();try{await x.linkToExistingCharacter(h.id,e,A),y(`Linked to ${t.fields.name}.`,"SUCCESS"),ve=!1,await ye()}catch(a){S=k(a,"DWTools could not link the character.")}finally{f=!1,b()}}}async function ln(){if(!(!x||!h||f)){f=!0,S=void 0,b();try{const{record:e}=await x.createAndLinkCharacter(h.id);y(`Created and linked ${e.fields.name}.`,"SUCCESS"),ve=!1,await ye()}catch(e){S=k(e,"DWTools could not create and link the character.")}finally{f=!1,b()}}}async function dn(){if(!(!x||!h||f)){f=!0,S=void 0,b();try{await x.unlinkCharacter(h.id),y("Character unlinked; creature fields were retained.","SUCCESS"),await ye()}catch(e){S=k(e,"DWTools could not unlink the character.")}finally{f=!1,b()}}}async function un(){if(!(!x||!h||f||W(h)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){f=!0,b();try{await x.removeCreatureData(h.id),await l.popover.close(Ve)}catch(t){S=k(t,"DWTools could not remove the creature data."),f=!1,b()}}}async function mn(e){if(!(!x||!h||!g||f)){if(!Xe(e)||!e.reportValidity()){S="Correct the highlighted creature fields before saving.",b();return}f=!0,S=void 0,b();try{const t=Nt==="hp",a=Te(_e(new FormData(e),g,t)),n=!!oe;if(n)await x.replaceUnlinkedCreatureData(h.id,Ue(a)),oe=void 0;else{let o=je(g,a,t);!ge&&!W(h)&&(o=a),Object.keys(o).length&&await x.updateCreatureFields(h.id,o)}y(n?"Copied DWTools data saved.":W(h)?"Character record saved.":"Creature saved.","SUCCESS"),await l.popover.close(Ve)}catch(t){S=k(t,"DWTools could not save the creature."),f=!1,b()}}}async function pn(){if(!ee)return;try{await gt()}catch(r){console.error("DWTools metadata namespace migration failed",r),V.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',y("DWTools could not migrate its saved data.","ERROR");return}F=bt(),x=wt(F),R=Et(window.localStorage);const[e,t]=await Promise.all([x.getItem(ee),l.room.getMetadata().catch(r=>(console.warn("DWTools could not load room visibility settings",r),{})),l.theme.getTheme().then(Ie)]);if(!e){V.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ge=Q in e.metadata;const a=Ia(e.metadata[Q],Je(t));A=it(t),h={...e,metadata:{...e.metadata,[Q]:a}},g=$t(h);const n=W(h);M=n?await F.inspect(n.characterId):{status:"missing"},M.status==="active"&&(g=M.record.fields),b();const o=[F.subscribe(r=>{const i=h&&W(h);i&&r.some(s=>s.characterId===i.characterId)&&!f&&ye()}),l.scene.items.onChange(r=>{r.find(s=>s.id===ee)&&!f&&ye()}),l.room.onMetadataChange(r=>{de||(A=it(r),b())}),l.theme.onChange(Ie)];window.addEventListener("unload",()=>{for(const r of o)r()},{once:!0})}st==="home"?(C="GM",K={[De]:pe.get("default")!=="hidden"},N=[{schemaVersion:3,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],Ze=new Map([["preview-active",2]]),he=new Map([["preview-active",[{id:"preview-token-1",name:"Raganah one",imageUrl:"/DWTools/icon.svg"},{id:"preview-token-2",name:"Raganah two",imageUrl:"/DWTools/icon.svg"}]]]),Oe={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},p()):st==="editor"?(A=pe.get("overwriteLabel")?.toLocaleLowerCase()!=="false",h={id:"preview",name:"Frogman",metadata:{}},g={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},b()):ee?l.isAvailable?l.onReady(()=>{pn()}):V.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(p(),l.isAvailable&&l.onReady(()=>{Za()}));
