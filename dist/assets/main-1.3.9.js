import{B as et,F as De,G as Oe,H as je,A as Ue,u as ye,I as St,w as tt,r as at,J as nt,K as xt,t as Et,M as Lt,N as Mt,P as It,Q as qe,R as Ee,S as Tt,T as Dt,q as oe,i as Ve,b as ot,C as X,U as rt,V as Le,W as it,O as l,E as We,l as st,m as ct,x as lt,X as Ot,Y as dt,g as F,Z as ut,_ as Rt,z as At,$ as Nt,a0 as qt,a1 as Ye,a2 as Wt,a3 as Pt}from"./obrMetadataMigration-1.3.9.js";import{r as Ht,a as Bt}from"./contextMarkdown-1.3.9.js";function c(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function w(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function mt(e,t="",a="creature"){const n=k=>`${t}${k}`,o=e.scores??et(),r=De(e.hpBase,o[2]),i=Oe(e.loadBase,o[0]),s=r!==void 0&&e.hpMax!==r,m=i!==void 0&&e.maxLoad!==i,h=o.map((k,u)=>`
        <div class="ability-row">
          <label class="ability-score">${je[u]}
            <input id="${n(`score-${u}`)}" name="score-${u}" type="number" min="3" max="18" step="1" value="${w(k)}">
          </label>
          <span class="ability-modifier" aria-label="${je[u]} modifier">
            <span class="ability-modifier-label">${Ue[u]}</span>
            <span class="ability-modifier-value" data-score-modifier="${u}">${tt(nt(k))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${ye[u]}`)}" name="condition-${ye[u]}" type="checkbox" ${e.conditions?.[ye[u]]===-1?"checked":""}>
            ${St[u]} <span>−1 ${Ue[u]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${c(e.name)}"></label>
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
        <label>Damage die<input id="${n("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${c(e.damage??"")}"></label>
        <label>Damage description<input id="${n("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${c(e.damageDescription??"")}"></label>
      </div>
      <label>Damage tags<input id="${n("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${c(e.damageTags??"")}"></label>
      <label class="visibility">
        <input id="${n("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
        Show the token overlay to players
      </label>
    </section>
    <details class="editor-section expandable-fields" ${a==="creature"?"open":""}>
      <summary><strong>GM Character</strong></summary>
      <div class="editor-section-body">
        <label>Tags<input id="${n("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${c(e.tags??"")}"></label>
        <label>Instinct<textarea id="${n("instinct")}" name="instinct" rows="2">${c(e.instinct??"")}</textarea></label>
        <label>Moves<textarea id="${n("moves")}" name="moves" rows="4" placeholder="One move per line">${c(e.moves??"")}</textarea></label>
        <label>Treasure<textarea id="${n("treasure")}" name="treasure" rows="3">${c(e.treasure??"")}</textarea></label>
      </div>
    </details>
    <details class="editor-section expandable-fields player-fields" ${a==="character"?"open":""}>
      <summary><strong>Player Character</strong></summary>
      <div class="editor-section-body">
        <div class="progression-row">
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${w(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${w(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${c(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${w(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${w(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${m?"calculation-mismatch":""}" type="number" min="0" step="any" value="${w(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${i??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${h}</div>
      </div>
    </details>`}function Ft(e){const t=e.fields;return`${c(t.name)} · HP ${w(t.hpCurrent)||"—"}/${w(t.hpMax)||"—"} · ARM ${w(t.armor)||"—"} · DMG ${c(t.damage??"—")}`}function Gt(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function _t(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function jt(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
    <div class="inventory-row" data-inventory-row="${a}">
      <div class="inventory-primary">
        <input class="inventory-inline-input inventory-name" data-inventory-name="${a}" type="text" maxlength="120" value="${c(t[0])}" aria-label="Item name">
        <div class="inventory-actions">
          <button type="button" class="danger compact" data-inventory-remove="${a}" aria-label="Remove ${c(t[0])}">Remove</button>
          ${n.role==="GM"?`<button type="button" class="secondary compact" data-inventory-transfer="${a}">Transfer</button>`:""}
        </div>
      </div>
      <div class="inventory-metrics">
        <label class="inventory-metric">wt/ea:
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${w(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${c(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${c(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${c(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${Lt(Mt(t))}</strong></span>
      </div>
    </div>
    ${o?`<form class="transfer-form" data-transfer-form="${a}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${n.records.filter(r=>r.id!==e.id).map(r=>`<option value="${c(r.id)}">${c(r.fields.name)}</option>`).join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${t[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`:""}`}function Ut(e,t){const a=e.inventory??[],n=xt(Et(a),e.fields.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.fields.maxLoad===void 0?"Empty":at(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${c(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${c(e.fields.name)} inventory">
          ${a.length?a.map((i,s)=>jt(e,i,s,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function Vt(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.counts.get(e.id)??0;return`
    <details class="character-card" data-character-details="${c(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${c(e.fields.name)}</strong>
        <span>${at(e.inventory,e.fields.maxLoad)}</span>
      </summary>
      <div class="character-card-body">
        <span>HP ${w(e.fields.hpCurrent)||"—"}/${w(e.fields.hpMax)||"—"} · ARM ${w(e.fields.armor)||"—"} · DMG ${c(e.fields.damage??"—")}</span>
        <span>${n} linked token${n===1?"":"s"} in current scene · Updated ${c(new Date(e.updatedAt).toLocaleString())}</span>
        <div class="card-actions">
          <button type="button" class="secondary compact" data-edit-character="${c(e.id)}">Edit Character</button>
          ${t.role==="GM"?`<button type="button" class="danger compact" data-delete-character="${c(e.id)}">Delete</button>`:""}
        </div>
        ${Ut(e,t)}
      </div>
    </details>`}function Yt(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${c(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${c(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${mt(e.editing.fields,"manager-","character")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${e.saving?"disabled":""}>${e.saving?"Saving…":"Save record"}</button>
          </div>
        </form>
      </section>`:`
    <section class="character-manager" data-home-section="characters">
      <div class="section-heading major-section-heading" draggable="true" data-drag-section="characters">
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>Characters</span>
        </button>
      </div>
      ${t?`${e.role==="GM"?_t(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${c(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>Vt(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}const ge=`${It}/creature-clipboard`,pt=1;function ht(e,t,a=new Date().toISOString()){const n=t.trim();if(!n)throw new Error("The copied token must have a name.");if(!Number.isFinite(Date.parse(a)))throw new Error("The copied-data timestamp is invalid.");return{schemaVersion:pt,sourceName:n,copiedAt:a,data:qe(e)}}function zt(e,t){e.setItem(ge,JSON.stringify(t))}function yt(e){try{const t=e.getItem(ge);if(t===null)return;const a=JSON.parse(t);if(a.schemaVersion!==pt||typeof a.sourceName!="string"||typeof a.copiedAt!="string")throw new Error("Unsupported creature clipboard.");return ht(a.data,a.sourceName,a.copiedAt)}catch{try{e.removeItem(ge)}catch{}return}}function Kt(e,t){return Ee({name:e,...t.data})}function Xt(e){e.removeItem(ge)}function Jt(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function G(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function ze(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function W(e,t){return String(e.get(t)??"").trim()||void 0}function Zt(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=G(e,"hpCurrent"),n.hpMax=G(e,"hpMax"),a)return n;n.tags=W(e,"tags"),n.hpBase=G(e,"hpBase"),n.maxLoad=ze(e,"maxLoad"),n.loadBase=G(e,"loadBase"),n.armor=G(e,"armor"),n.damage=W(e,"damage"),n.damageDescription=W(e,"damageDescription"),n.damageTags=W(e,"damageTags"),n.instinct=W(e,"instinct"),n.moves=W(e,"moves"),n.treasure=W(e,"treasure"),n.level=G(e,"level"),n.xp=G(e,"xp");const o=et();for(let i=0;i<o.length;i+=1)o[i]=ze(e,`score-${i}`)??null;n.scores=Tt(o);const r={};for(const i of ye)e.get(`condition-${i}`)==="on"&&(r[i]=-1);return n.conditions=Dt(r),n.alignment=W(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function Pe(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Zt(e,t,a)}}const Qt=1;function He(e){return e.filter(t=>t.layer==="CHARACTER"&&Ve(t)&&ot(t.metadata[X])).map(t=>({id:t.id,itemText:Ve(t)?t.text.plainText.trim():"",itemName:t.name.trim(),data:t.metadata[X]})).sort((t,a)=>t.itemText.localeCompare(a.itemText,void 0,{sensitivity:"base"})||t.itemName.localeCompare(a.itemName,void 0,{sensitivity:"base"})||t.id.localeCompare(a.id))}function ea(e){if(typeof e!="object"||e===null||Array.isArray(e))return{schemaVersion:1,inactiveItemIds:[]};const t=e;return t.schemaVersion!==Qt||!Array.isArray(t.inactiveItemIds)?{schemaVersion:1,inactiveItemIds:[]}:{schemaVersion:1,inactiveItemIds:[...new Set(t.inactiveItemIds.filter(a=>typeof a=="string"&&a.length>0))].sort()}}function be(e){return ea(e[rt])}function ta(e,t){const a=new Set(t.inactiveItemIds);return{active:e.filter(n=>!a.has(n.id)),inactive:e.filter(n=>a.has(n.id))}}async function aa(e,t,a,n,o=3){const r=new Set(t);for(let i=0;i<o;i+=1){const s=await e.getMetadata(),m=be(s),h=new Set(m.inactiveItemIds.filter(ae=>r.has(ae)));n?h.delete(a):r.has(a)&&h.add(a);const k={schemaVersion:1,inactiveItemIds:[...h].sort()};await e.setMetadata({[rt]:k});const u=be(await e.getMetadata());if(u.inactiveItemIds.includes(a)===!n&&[...h].every(ae=>u.inactiveItemIds.includes(ae)))return u}throw new Error("Encounter activity changed on another GM client. Try again.")}function I(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function na(e){const t=e.hpCurrent,a=e.hpMax;if(t===void 0&&a===void 0)return{text:"—",percent:0,color:"empty",adjustable:!1};const n=`${t??"—"}/${a??"—"}`;if(t!==void 0&&a!==void 0&&t>a)return{text:n,percent:100,color:"purple",adjustable:!0};const o=a&&a>0&&t!==void 0?Math.max(0,Math.min(100,t/a*100)):0;return{text:n,percent:o,color:o>50?"green":o>25?"amber":"red",adjustable:t!==void 0}}function vt(e){return`<span class="encounter-item-text">${I(e.itemText||"Unnamed character")}</span> <span class="encounter-item-name">(${I(e.itemName||"Unnamed item")})</span>`}function oa(e,t){const a=e.data,n=na(a),o=a.damage?.trim(),r=a.damageDescription?.trim(),i=a.damageTags?.trim(),s=a.instinct?.trim(),m=a.moves?.trim(),h=t.has(e.id);return`<article class="encounter-card" data-encounter-item="${I(e.id)}">
    <div class="encounter-identity">${vt(e)}<button class="encounter-activity" type="button" data-encounter-active="false" data-item-id="${I(e.id)}" aria-label="Move to Inactive" title="Move to Inactive" ${h?"disabled":""}>${oe("minus-circle")}</button></div>
    <div class="encounter-combat">
      <span class="encounter-armor" title="Armor">${oe("shield")}<strong>${a.armor??"—"}</strong></span>
      <span class="encounter-damage">${oe("sword")}<span class="encounter-damage-copy">${o?`<button type="button" data-encounter-damage="${I(o)}">🎲 ${I(o)}</button>`:"—"}${r?`<span> (${I(r)})</span>`:""}${i?`<em>${I(i)}</em>`:""}</span></span>
      <span class="encounter-hp"><button type="button" data-encounter-hp="-1" data-item-id="${I(e.id)}" aria-label="Decrease HP" ${!n.adjustable||h?"disabled":""}>−</button><span class="encounter-hp-bar hp-${n.color}"><span class="encounter-hp-fill" style="width:${n.percent}%"></span><strong>${n.text}</strong></span><button type="button" data-encounter-hp="1" data-item-id="${I(e.id)}" aria-label="Increase HP" ${!n.adjustable||h?"disabled":""}>+</button></span>
    </div>
    ${s?`<div class="encounter-instinct"><strong>Instinct:</strong> ${I(s)}</div>`:""}
    ${m?`<div class="encounter-moves"><strong>Moves:</strong><div class="markdown-content">${Ht(m)}</div></div>`:""}
  </article>`}function ra(e,t,a,n=new Set){const{active:o,inactive:r}=ta(e,t);return`<div class="encounter-list">${o.length?o.map(i=>oa(i,n)).join(""):'<p class="encounter-empty">No active DWTools creatures in this scene.</p>'}</div>
    <section class="encounter-inactive">
      <button class="section-toggle encounter-inactive-toggle" type="button" data-toggle-section="encounterInactive" aria-expanded="${a}"><span class="section-arrow" aria-hidden="true">&#9656;</span><span>Inactive (${r.length})</span></button>
      ${a?`<div class="encounter-inactive-list">${r.length?r.map(i=>`<div class="encounter-inactive-row">${vt(i)}<button class="encounter-activity" type="button" data-encounter-active="true" data-item-id="${I(i.id)}" aria-label="Add to Encounter" title="Add to Encounter" ${n.has(i.id)?"disabled":""}>${oe("plus-circle")}</button></div>`).join(""):'<p class="encounter-empty">No inactive creatures.</p>'}</div>`:""}
    </section>`}function Be(e){const t=e[Le];return typeof t=="boolean"?t:!0}function ia(e,t){return ot(e)?e:{visibleToPlayers:t}}async function sa(e,t){await e({[Le]:t})}const T={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,encounter:!1,encounterInactive:!1,settings:!1,characters:!1},we=["agenda","moves","encounter","settings","characters"];function ca(e){const t=new Set(we),a=Array.isArray(e)?e.filter(o=>typeof o=="string"&&t.has(o)):[],n=[...new Set(a)];for(const o of we)o!=="encounter"&&!n.includes(o)&&n.push(o);if(!n.includes("encounter")){const o=n.indexOf("moves");n.splice(o>=0?o+1:n.length,0,"encounter")}return n}const ft=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],gt=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
    </div>`}function Ke(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function la(e,t,a,n=T,o="",r="",i=""){const s=t?"Default: visible to players":"Default: hidden from players";return`
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
      <section class="home-section" data-home-section="moves">
        ${he("Moves","moves",n.moves)}
        ${n.moves?`${Ke("Basic Moves","basicMoves",n.basicMoves,ft)}
        ${Ke("Special Moves","specialMoves",n.specialMoves,gt)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section encounter-section" data-home-section="encounter">
        ${he("Encounter (Scene)","encounter",n.encounter)}
        ${n.encounter?r:""}
      </section>`:""}
      ${e==="GM"?`<section class="home-section" data-home-section="settings">
        ${he("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${s}" title="${s}" ${a?"disabled":""}>
            ${oe(t?"eye":"eye-off","default-visibility-icon")}
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
    </section>`}function Xe(e){const t=e[it];return typeof t=="boolean"?t:!0}async function da(e,t){await e({[it]:t})}const V=document.querySelector("#app"),se=new URLSearchParams(window.location.search),J=se.get("itemId"),bt=se.get("view")??"edit",Je=se.get("preview");function $e(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function E(e,t){return e instanceof Error?e.message:t}function y(e,t){l.isAvailable&&l.notification.show(e,t)}function Fe(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=Nt(t.value);const a=qt(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function wt(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>Fe(e))}function M(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function $t(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),o=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const r=()=>{for(let h=0;h<6;h+=1){const k=M(e,`score-${h}`),u=e.querySelector(`[data-score-modifier="${h}"]`);u&&(u.textContent=tt(nt(k)))}const s=De(M(e,"hpBase"),M(e,"score-2")),m=Oe(M(e,"loadBase"),M(e,"score-0"));n&&(n.textContent=`Calculated: ${s??"—"}`),o&&(o.textContent=`Calculated: ${m??"—"}`),t.classList.toggle("calculation-mismatch",Ye(M(e,"hpMax"),s)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",Ye(M(e,"maxLoad"),m))},i=(s,m,h,k)=>{const u=e.elements.namedItem(s);!(u instanceof HTMLInputElement)||!(m instanceof HTMLInputElement)||(u.dataset.lastPromptedValue=u.value,u.addEventListener("blur",()=>{const ae=u.dataset.lastPromptedValue??"",Me=k();if(!Wt(ae,u.value,M(e,m.name),Me)){u.dataset.lastPromptedValue=u.value,r();return}u.dataset.lastPromptedValue=u.value;const Ct=m.value.trim()||"blank";window.confirm(`${h} changed. Recalculate ${m.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${Ct} to ${Me}?`)&&(m.value=String(Me)),r()}))};for(const s of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))s.addEventListener("input",r);i("score-2",t,"Constitution",()=>De(M(e,"hpBase"),M(e,"score-2"))),i("score-0",a,"Strength",()=>Oe(M(e,"loadBase"),M(e,"score-0"))),r()}function ua(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],o={};for(const r of n)JSON.stringify(e[r])!==JSON.stringify(t[r])&&(o[r]=t[r]);return o}let C="PLAYER",j={},ve=!1,K,ee,$,Y=[],Ge=new Map,ue,Re=!1,A=!1,L,Ae=!1,b,Z,H,ce=[],le={schemaVersion:1,inactiveItemIds:[]};const U=new Set;let fe=0;const ke=new Set,Ce=new Set,ma="dwtools/home-sections";function pa(){try{const e=JSON.parse(localStorage.getItem(ma)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:T.agenda,moves:typeof e.moves=="boolean"?e.moves:T.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:T.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:T.specialMoves,encounter:typeof e.encounter=="boolean"?e.encounter:T.encounter,encounterInactive:typeof e.encounterInactive=="boolean"?e.encounterInactive:T.encounterInactive,settings:typeof e.settings=="boolean"?e.settings:T.settings,characters:typeof e.characters=="boolean"?e.characters:T.characters}}catch{return{...T}}}function ha(e){const t=typeof e=="object"&&e!==null?e:{};return Object.fromEntries(Object.entries(T).map(([a,n])=>[a,typeof t[a]=="boolean"?t[a]:n]))}function Ze(e){const t=e[ut];if(typeof t=="object"&&t!==null){const a=t;O=ha(a.expanded),Q=ca(a.order);return}O=pa(),Q=[...we]}async function Ne(){try{await l.player.setMetadata({[ut]:{version:1,expanded:O,order:Q}})}catch(e){console.error("DWTools could not save the panel layout",e),y("DWTools could not save your panel layout.","ERROR")}}let O={...T},Q=[...we],ne;function ya(){return{records:Y,counts:Ge,role:C,usage:ue,loading:Re,saving:A,error:L,editing:b,expandedCharacters:ke,expandedInventories:Ce,draftCharacterId:Z,transfer:H}}function d(){const e=Be(j),t=Yt(ya(),O.characters||!!b),a=ra(ce,le,O.encounterInactive,U);V.innerHTML=la(C,e,ve,O,t,a,Pt);const n=document.querySelector(".home"),o=document.querySelector(".extension-version, #move-dialog");if(n&&o)for(const r of Q){const i=n.querySelector(`[data-home-section="${r}"]`);i&&n.insertBefore(i,o)}document.querySelector("#default-visibility")?.addEventListener("click",()=>{Ca()});for(const r of document.querySelectorAll("[data-toggle-section]"))r.addEventListener("click",()=>{const i=r.dataset.toggleSection;O={...O,[i]:!O[i]},Ne(),d()});for(const r of document.querySelectorAll("[data-drag-section]")){const i=r.dataset.dragSection,s=r.closest("[data-home-section]");r.addEventListener("dragstart",m=>{ne=i,s?.classList.add("dragging"),m.dataTransfer?.setData("text/plain",i),m.dataTransfer&&(m.dataTransfer.effectAllowed="move")}),r.addEventListener("dragend",()=>{ne=void 0,document.querySelectorAll(".dragging, .drag-over").forEach(m=>m.classList.remove("dragging","drag-over"))}),s?.addEventListener("dragover",m=>{!ne||ne===i||(m.preventDefault(),s.classList.add("drag-over"))}),s?.addEventListener("dragleave",()=>s.classList.remove("drag-over")),s?.addEventListener("drop",m=>{m.preventDefault();const h=ne;if(!h||h===i)return;const k=Q.filter(u=>u!==h);k.splice(k.indexOf(i),0,h),Q=k,Ne(),d()})}for(const r of document.querySelectorAll("[data-move]"))r.addEventListener("click",()=>{const i=[...ft,...gt].find(k=>k.id===r.dataset.move),s=document.querySelector("#move-dialog"),m=document.querySelector("#move-dialog-title"),h=document.querySelector("#move-dialog-text");!i||!s||!m||!h||(m.textContent=i.name,h.textContent=i.text,s.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),va(),ba()}function Qe(e){const t=At(e);y(t.message,t.ok?"SUCCESS":"ERROR")}function va(){for(const e of document.querySelectorAll("[data-encounter-active]"))e.addEventListener("click",()=>{const t=e.dataset.itemId;t&&fa(t,e.dataset.encounterActive==="true")});for(const e of document.querySelectorAll("[data-encounter-hp]"))e.addEventListener("click",()=>{const t=e.dataset.itemId,a=Number(e.dataset.encounterHp);t&&Number.isFinite(a)&&ga(t,a)});for(const e of document.querySelectorAll("[data-encounter-damage]"))e.addEventListener("click",()=>{const t=e.dataset.encounterDamage;t&&Qe(t)});for(const e of document.querySelectorAll(".encounter-section [data-roll-expression]"))e.addEventListener("click",()=>{const t=e.dataset.rollExpression;t&&Qe(t)})}async function fa(e,t){if(!(C!=="GM"||U.has(e))){U.add(e),d();try{le=await aa({getMetadata:()=>l.scene.getMetadata(),setMetadata:a=>l.scene.setMetadata(a)},ce.map(a=>a.id),e,t)}catch(a){console.error("DWTools could not update encounter activity",a),y(E(a,"DWTools could not update encounter activity."),"ERROR")}finally{U.delete(e),d()}}}async function ga(e,t){if(!(C!=="GM"||!ee||U.has(e))){U.add(e),d();try{const a=(await l.scene.items.getItems([e]))[0];if(!a)return;const n=He([a])[0];if(!n||n.data.hpCurrent===void 0)return;await ee.updateCreatureFields(e,{hpCurrent:Bt(n.data.hpCurrent,t)})}catch(a){console.error("DWTools could not update encounter HP",a),y(E(a,"DWTools could not update encounter HP."),"ERROR")}finally{U.delete(e),d()}}}async function Ie(e){const t=++fe;if(C!=="GM"||!await l.scene.isReady()){if(t!==fe)return;ce=[],le={schemaVersion:1,inactiveItemIds:[]};return}const[a,n]=await Promise.all([l.scene.items.getItems(),l.scene.getMetadata()]);t===fe&&(ce=He(a),le=be(n))}function ba(){document.querySelector("#manager-create")?.addEventListener("click",()=>{L=void 0,b={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},O.characters=!0,Ne(),d()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{b=void 0,L=void 0,d()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=Y.find(n=>n.id===t.dataset.editCharacter);a&&(L=void 0,b={kind:"edit",id:a.id,fields:a.fields},d())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{ka(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(wt(e),$t(e),e.addEventListener("submit",t=>{t.preventDefault(),$a(e)}));for(const t of document.querySelectorAll("[data-character-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.characterDetails;a&&(t.open?ke.add(a):ke.delete(a))});for(const t of document.querySelectorAll("[data-inventory-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.inventoryDetails;a&&(t.open?Ce.add(a):Ce.delete(a))});wa()}function P(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return Y.find(a=>a.id===t)}function z(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function _(e,t,a){if(!A){A=!0,L=void 0,a?Se(a):d();try{await e(),Z=void 0,H=void 0,await R(!1),t&&y(t,"SUCCESS"),ue?.nearLimit&&y("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=E(n,"DWTools could not update this inventory.");await R(!1),L=o}finally{A=!1,a?Se(a):d()}}}function Se(e,t=!1){d(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function Te(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function wa(){if(!$)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=P(a),o=Number(a.dataset.inventoryName),r=n&&z(n,o);!n||!r||Te(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const i=[a.value,r.expected[1],r.expected[2]];_(()=>$.updateInventoryItem(n.id,r,i))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=P(a),o=Number(a.dataset.inventoryWeight),r=n&&z(n,o);if(!n||!r)continue;const i=String(r.expected[1]);Te(a,i,()=>{if(a.value===i)return;const s=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];_(()=>$.updateInventoryItem(n.id,r,s))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=P(a),o=Number(a.dataset.inventoryCount),r=n&&z(n,o);if(!n||!r)continue;const i=String(r.expected[2]);Te(a,i,()=>{if(a.value===i)return;const s=a.value.trim()===""?Number.NaN:Number(a.value);_(()=>$.changeInventoryItemCount(n.id,r,s-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=P(a),o=Number(a.dataset.inventoryAdjust),r=n&&z(n,o),i=Number(a.dataset.change);!n||!r||_(()=>$.changeInventoryItemCount(n.id,r,i))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=P(a),o=Number(a.dataset.inventoryRemove),r=n&&z(n,o);!n||!r||_(()=>$.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=P(a);n&&(Z=n.id,ke.add(n.id),Ce.add(n.id),Se(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=Z;Z=void 0,a?Se(a):d()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=P(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];_(()=>$.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=P(a),o=Number(a.dataset.inventoryTransfer),r=n&&z(n,o);!n||!r||(H={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},d())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{H=void 0,d()});const t=document.querySelector("[data-transfer-form]");t&&H&&t.addEventListener("submit",a=>{if(a.preventDefault(),!H||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),i=H;_(()=>$.transferInventoryItem(i.sourceCharacterId,o,{sourceIndex:i.sourceIndex,expected:i.expected},r),"Item transferred.")})}async function R(e=!0){if(!(!K||!ee||!$)){Re=!0,L=void 0,e&&!b&&d();try{if(C==="GM"&&!Ae){const t=await $.cleanupLegacyTombstones();Ae=!0,t&&y(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[Y,Ge,ue]=await Promise.all([$.listAccessible(),Rt(ee.scene),C==="GM"?K.estimateUsage():Promise.resolve(void 0)]),C==="PLAYER"&&b?.kind==="edit"&&!Y.some(t=>t.id===b?.id)&&(b=void 0,L="You no longer control a token linked to the Character being edited.")}catch(t){L=E(t,"DWTools could not load character records.")}finally{Re=!1,e&&!b&&d()}}}async function $a(e){if(!(!b||!$||A)){if(!Fe(e)||!e.reportValidity()){L="Correct the highlighted character fields before saving.",d();return}A=!0,L=void 0,d();try{const t=Ee(Pe(new FormData(e),b.fields,!1));b.kind==="create"?(await $.create(t),y("Character record created.","SUCCESS")):(await $.save(b.id,t),y("Character record saved.","SUCCESS")),b=void 0,await R(!1),ue?.nearLimit&&y("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){L=E(t,"DWTools could not save the record.")}finally{A=!1,d()}}}async function ka(e){if(!e||!$||A)return;const t=Y.find(a=>a.id===e);if(t&&window.confirm(Gt(t.fields.name))){A=!0,L=void 0,d();try{await $.delete(e),y("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await R(!1)}catch(a){L=E(a,"DWTools could not delete the record.")}finally{A=!1,d()}}}async function Ca(){if(C!=="GM"||ve)return;const e=!Be(j);ve=!0,d();try{await sa(t=>l.room.setMetadata(t),e),j={...j,[Le]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),y("DWTools could not save the default overlay visibility.","ERROR")}finally{ve=!1,d()}}async function Sa(){try{await st()}catch(o){console.error("DWTools metadata namespace migration failed",o),V.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',y("DWTools could not migrate its saved data.","ERROR");return}K=ct(),ee=lt(K),$=Ot(K,ee);const[e,t,a]=await Promise.all([l.player.getRole(),l.room.getMetadata(),l.player.getMetadata(),l.theme.getTheme().then($e)]);C=e,j=t,Ze(a),await Promise.all([R(!1),Ie()]),d();const n=[l.room.onMetadataChange(o=>{j=o,d()}),K.subscribe(o=>{o.some(r=>r.lookup.status==="deleted")&&(Ae=!1),R(C==="PLAYER"||!b)}),l.player.onChange(o=>{C=o.role,Ze(o.metadata),b=void 0,Z=void 0,H=void 0,Promise.all([R(),Ie()]).then(d)}),l.scene.items.onChange(o=>{fe+=1,ce=C==="GM"?He(o):[],d(),R(C==="PLAYER"||!b)}),l.scene.onMetadataChange(o=>{le=be(o),d()}),l.scene.onReadyChange(()=>{Promise.all([R(),Ie()]).then(d)}),l.room.onPermissionsChange(()=>{R(C==="PLAYER"||!b)}),l.theme.onChange($e)];window.addEventListener("unload",()=>{for(const o of n)o()},{once:!0})}let B,x,p,f,D={status:"missing"},xe=[],me=!1,re="",v=!1,N=!0,ie=!1,S,pe=!1,q,te;function xa(e){const t=F(e);let a,n;t?D.status==="active"?(a=`Character record: <strong>${c(D.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${D.status==="malformed"?"malformed":D.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=re.trim().toLocaleLowerCase(),r=o?xe.filter(s=>s.fields.name.toLocaleLowerCase().includes(o)||s.fields.tags?.toLocaleLowerCase().includes(o)):xe,i=me?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${N?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${c(re)}"></label>
        <div class="link-results">
          ${r.length?r.map(s=>`
                <button type="button" data-link-record="${c(s.id)}" data-link-search="${c(`${s.fields.name} ${s.fields.tags??""}`.toLocaleLowerCase())}">
                  ${Ft(s)}
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
        <input id="overwrite-label" type="checkbox" ${N?"checked":""} ${ie?"disabled":""}>
        Overwrite label
      </label>
      ${i}
    </section>`}function kt(e){return e?`Copied from ${e.sourceName} · ${new Date(e.copiedAt).toLocaleString()}`:"No copied DWTools data."}function Ea(){const e=pe||D.status==="active";return`
    <section class="creature-clipboard-section">
      <div class="creature-clipboard-heading">
        <strong>DWTools data clipboard</strong>
        <span data-clipboard-status>${c(kt(q))}</span>
      </div>
      ${te?`<p class="clipboard-staged">Pasted data from ${c(te.sourceName)} is staged. Save to apply it.</p>`:""}
      <div class="clipboard-actions">
        <button class="secondary" type="button" id="copy-creature-data" ${e&&!v?"":"disabled"}>Copy DWTools data</button>
        <button class="secondary" type="button" id="paste-creature-data" ${q&&!v?"":"disabled"}>Paste DWTools data</button>
        <button class="secondary" type="button" id="clear-creature-data" ${q&&!v?"":"disabled"}>Clear copied data</button>
      </div>
    </section>`}function g(){if(!p||!f)return;const e=bt==="hp";V.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${c(f.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${xa(p)}
      ${S?`<p class="inline-error">${c(S)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${w(f.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${w(f.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:mt(f)}
      ${e?"":Ea()}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${v?"disabled":""}>${v?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=Jt(a.value,n.value);o!==null&&(n.value=o)}),wt(t),$t(t);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{l.popover.close(We)}),document.querySelector("#remove")?.addEventListener("click",()=>{qa()}),document.querySelector("#copy-creature-data")?.addEventListener("click",()=>La()),document.querySelector("#paste-creature-data")?.addEventListener("click",()=>Ta(t)),document.querySelector("#clear-creature-data")?.addEventListener("click",()=>Ma()),document.querySelector("#link-character")?.addEventListener("click",()=>{Da()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{Oa(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{Aa()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Na()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{me=!1,re="",g()}),document.querySelector("#link-search")?.addEventListener("input",o=>{re=o.currentTarget.value;const r=re.trim().toLocaleLowerCase();for(const i of document.querySelectorAll("[data-link-search]"))i.hidden=!String(i.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{Ra(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),Wa(t)})}function _e(){const e=document.querySelector("[data-clipboard-status]");e&&(e.textContent=kt(q));const t=document.querySelector("#paste-creature-data"),a=document.querySelector("#clear-creature-data");t&&(t.disabled=!q),a&&(a.disabled=!q)}function La(){if(!p||!f||!pe&&D.status!=="active"){y("This token has no saved DWTools data to copy.","WARNING");return}try{const e=ht(qe(f),p.name);zt(window.localStorage,e),q=e,_e(),y(`Copied DWTools data from ${e.sourceName}.`,"SUCCESS")}catch(e){y(E(e,"DWTools could not copy the creature data."),"ERROR")}}function Ma(){try{Xt(window.localStorage),q=void 0,_e(),y("Copied DWTools data cleared.","SUCCESS")}catch(e){y(E(e,"DWTools could not clear the copied data."),"ERROR")}}function Ia(e){if(!f)return!1;try{const t=Ee(Pe(new FormData(e),f,!1));return JSON.stringify(t)!==JSON.stringify(f)}catch{return!0}}function Ta(e){if(!p||!f)return;if(F(p)){y("Unlink this token from its Character record before pasting DWTools data.","ERROR");return}const t=yt(window.localStorage);if(q=t,!t){_e(),y("There is no valid copied DWTools data to paste.","WARNING");return}Ia(e)&&!window.confirm("Replace the unsaved form values with the copied DWTools data?")||(f=Kt(f.name,t),te=t,S=void 0,g())}async function de(){if(!J||!x||!B)return;const e=await x.getItem(J);if(!e){V.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}pe=X in e.metadata,te=void 0,p=e,f=dt(e);const t=F(e);D=t?await B.inspect(t.characterId):{status:"missing"},D.status==="active"&&(f=D.record.fields),g()}async function Da(){if(!(!B||v)){v=!0,S=void 0,g();try{xe=await B.list(),me=!0}catch(e){S=E(e,"DWTools could not load character records.")}finally{v=!1,g()}}}async function Oa(e){if(ie)return;const t=N;N=e,ie=!0,g();try{await da(a=>l.room.setMetadata(a),e)}catch(a){N=t,S=E(a,"DWTools could not save the overwrite-label setting.")}finally{ie=!1,g()}}async function Ra(e){if(!e||!x||!p||v)return;const t=xe.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${N?"overwritten":"retained"}.`)){v=!0,S=void 0,g();try{await x.linkToExistingCharacter(p.id,e,N),y(`Linked to ${t.fields.name}.`,"SUCCESS"),me=!1,await de()}catch(a){S=E(a,"DWTools could not link the character.")}finally{v=!1,g()}}}async function Aa(){if(!(!x||!p||v)){v=!0,S=void 0,g();try{const{record:e}=await x.createAndLinkCharacter(p.id);y(`Created and linked ${e.fields.name}.`,"SUCCESS"),me=!1,await de()}catch(e){S=E(e,"DWTools could not create and link the character.")}finally{v=!1,g()}}}async function Na(){if(!(!x||!p||v)){v=!0,S=void 0,g();try{await x.unlinkCharacter(p.id),y("Character unlinked; creature fields were retained.","SUCCESS"),await de()}catch(e){S=E(e,"DWTools could not unlink the character.")}finally{v=!1,g()}}}async function qa(){if(!(!x||!p||v||F(p)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){v=!0,g();try{await x.removeCreatureData(p.id),await l.popover.close(We)}catch(t){S=E(t,"DWTools could not remove the creature data."),v=!1,g()}}}async function Wa(e){if(!(!x||!p||!f||v)){if(!Fe(e)||!e.reportValidity()){S="Correct the highlighted creature fields before saving.",g();return}v=!0,S=void 0,g();try{const t=bt==="hp",a=Ee(Pe(new FormData(e),f,t)),n=!!te;if(n)await x.replaceUnlinkedCreatureData(p.id,qe(a)),te=void 0;else{let o=ua(f,a,t);!pe&&!F(p)&&(o=a),Object.keys(o).length&&await x.updateCreatureFields(p.id,o)}y(n?"Copied DWTools data saved.":F(p)?"Character record saved.":"Creature saved.","SUCCESS"),await l.popover.close(We)}catch(t){S=E(t,"DWTools could not save the creature."),v=!1,g()}}}async function Pa(){if(!J)return;try{await st()}catch(r){console.error("DWTools metadata namespace migration failed",r),V.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',y("DWTools could not migrate its saved data.","ERROR");return}B=ct(),x=lt(B),q=yt(window.localStorage);const[e,t]=await Promise.all([x.getItem(J),l.room.getMetadata().catch(r=>(console.warn("DWTools could not load room visibility settings",r),{})),l.theme.getTheme().then($e)]);if(!e){V.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}pe=X in e.metadata;const a=ia(e.metadata[X],Be(t));N=Xe(t),p={...e,metadata:{...e.metadata,[X]:a}},f=dt(p);const n=F(p);D=n?await B.inspect(n.characterId):{status:"missing"},D.status==="active"&&(f=D.record.fields),g();const o=[B.subscribe(r=>{const i=p&&F(p);i&&r.some(s=>s.characterId===i.characterId)&&!v&&de()}),l.scene.items.onChange(r=>{r.find(s=>s.id===J)&&!v&&de()}),l.room.onMetadataChange(r=>{ie||(N=Xe(r),g())}),l.theme.onChange($e)];window.addEventListener("unload",()=>{for(const r of o)r()},{once:!0})}Je==="home"?(C="GM",j={[Le]:se.get("default")!=="hidden"},Y=[{schemaVersion:3,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],Ge=new Map([["preview-active",2]]),ue={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},d()):Je==="editor"?(N=se.get("overwriteLabel")?.toLocaleLowerCase()!=="false",p={id:"preview",name:"Frogman",metadata:{}},f={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},g()):J?l.isAvailable?l.onReady(()=>{Pa()}):V.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(d(),l.isAvailable&&l.onReady(()=>{Sa()}));
