import{F as _e,G as $e,H as Ce,I as Ne,A as Re,v as ie,J as ut,x as Ge,u as Ue,K as Ye,M as mt,t as ht,N as pt,P as yt,Q as vt,R as xe,S as fe,T as ft,U as gt,V as ge,b as bt,r as wt,W as je,O as d,E as Ee,l as Ve,m as ze,y as Ke,X as kt,C as se,Y as Je,g as B,Z as Xe,_ as $t,$ as Ct,a0 as St,a1 as Ae,a2 as Lt,a3 as xt}from"./obrMetadataMigration-1.3.8.js";function l(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function b(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function Ze(e,t="",a="creature"){const n=T=>`${t}${T}`,o=e.scores??_e(),r=$e(e.hpBase,o[2]),i=Ce(e.loadBase,o[0]),s=r!==void 0&&e.hpMax!==r,g=i!==void 0&&e.maxLoad!==i,C=o.map((T,u)=>`
        <div class="ability-row">
          <label class="ability-score">${Ne[u]}
            <input id="${n(`score-${u}`)}" name="score-${u}" type="number" min="3" max="18" step="1" value="${b(T)}">
          </label>
          <span class="ability-modifier" aria-label="${Ne[u]} modifier">
            <span class="ability-modifier-label">${Re[u]}</span>
            <span class="ability-modifier-value" data-score-modifier="${u}">${Ge(Ye(T))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${ie[u]}`)}" name="condition-${ie[u]}" type="checkbox" ${e.conditions?.[ie[u]]===-1?"checked":""}>
            ${ut[u]} <span>−1 ${Re[u]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${l(e.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${n("armor")}" name="armor" type="number" step="1" value="${b(e.armor)}"></label>
        <label>Current HP<input id="${n("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${b(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${n("hpMax")}" name="hpMax" class="${s?"calculation-mismatch":""}" type="number" min="0" step="1" value="${b(e.hpMax)}">
          <span class="calculated-hint" data-calculated-hp>Calculated: ${r??"—"}</span>
        </label>
      </div>
      <div class="damage-fields">
        <label>Damage die<input id="${n("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${l(e.damage??"")}"></label>
        <label>Damage description<input id="${n("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${l(e.damageDescription??"")}"></label>
      </div>
      <label>Damage tags<input id="${n("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${l(e.damageTags??"")}"></label>
      <label class="visibility">
        <input id="${n("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
        Show the token overlay to players
      </label>
    </section>
    <details class="editor-section expandable-fields" ${a==="creature"?"open":""}>
      <summary><strong>GM Character</strong></summary>
      <div class="editor-section-body">
        <label>Tags<input id="${n("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${l(e.tags??"")}"></label>
        <label>Instinct<textarea id="${n("instinct")}" name="instinct" rows="2">${l(e.instinct??"")}</textarea></label>
        <label>Moves<textarea id="${n("moves")}" name="moves" rows="4" placeholder="One move per line">${l(e.moves??"")}</textarea></label>
        <label>Treasure<textarea id="${n("treasure")}" name="treasure" rows="3">${l(e.treasure??"")}</textarea></label>
      </div>
    </details>
    <details class="editor-section expandable-fields player-fields" ${a==="character"?"open":""}>
      <summary><strong>Player Character</strong></summary>
      <div class="editor-section-body">
        <div class="progression-row">
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${b(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${b(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${l(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${b(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${b(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${g?"calculation-mismatch":""}" type="number" min="0" step="any" value="${b(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${i??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${C}</div>
      </div>
    </details>`}function Et(e){const t=e.fields;return`${l(t.name)} · HP ${b(t.hpCurrent)||"—"}/${b(t.hpMax)||"—"} · ARM ${b(t.armor)||"—"} · DMG ${l(t.damage??"—")}`}function Mt(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function Tt(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function Dt(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
    <div class="inventory-row" data-inventory-row="${a}">
      <div class="inventory-primary">
        <input class="inventory-inline-input inventory-name" data-inventory-name="${a}" type="text" maxlength="120" value="${l(t[0])}" aria-label="Item name">
        <div class="inventory-actions">
          <button type="button" class="danger compact" data-inventory-remove="${a}" aria-label="Remove ${l(t[0])}">Remove</button>
          ${n.role==="GM"?`<button type="button" class="secondary compact" data-inventory-transfer="${a}">Transfer</button>`:""}
        </div>
      </div>
      <div class="inventory-metrics">
        <label class="inventory-metric">wt/ea:
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${b(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${l(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${l(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${l(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${pt(yt(t))}</strong></span>
      </div>
    </div>
    ${o?`<form class="transfer-form" data-transfer-form="${a}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${n.records.filter(r=>r.id!==e.id).map(r=>`<option value="${l(r.id)}">${l(r.fields.name)}</option>`).join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${t[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`:""}`}function It(e,t){const a=e.inventory??[],n=mt(ht(a),e.fields.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.fields.maxLoad===void 0?"Empty":Ue(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${l(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${l(e.fields.name)} inventory">
          ${a.length?a.map((i,s)=>Dt(e,i,s,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function Ot(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.counts.get(e.id)??0;return`
    <details class="character-card" data-character-details="${l(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${l(e.fields.name)}</strong>
        <span>${Ue(e.inventory,e.fields.maxLoad)}</span>
      </summary>
      <div class="character-card-body">
        <span>HP ${b(e.fields.hpCurrent)||"—"}/${b(e.fields.hpMax)||"—"} · ARM ${b(e.fields.armor)||"—"} · DMG ${l(e.fields.damage??"—")}</span>
        <span>${n} linked token${n===1?"":"s"} in current scene · Updated ${l(new Date(e.updatedAt).toLocaleString())}</span>
        <div class="card-actions">
          <button type="button" class="secondary compact" data-edit-character="${l(e.id)}">Edit Character</button>
          ${t.role==="GM"?`<button type="button" class="danger compact" data-delete-character="${l(e.id)}">Delete</button>`:""}
        </div>
        ${It(e,t)}
      </div>
    </details>`}function Nt(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${l(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${l(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${Ze(e.editing.fields,"manager-","character")}
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
      ${t?`${e.role==="GM"?Tt(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${l(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>Ot(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}const ce=`${vt}/creature-clipboard`,Qe=1;function et(e,t,a=new Date().toISOString()){const n=t.trim();if(!n)throw new Error("The copied token must have a name.");if(!Number.isFinite(Date.parse(a)))throw new Error("The copied-data timestamp is invalid.");return{schemaVersion:Qe,sourceName:n,copiedAt:a,data:xe(e)}}function Rt(e,t){e.setItem(ce,JSON.stringify(t))}function tt(e){try{const t=e.getItem(ce);if(t===null)return;const a=JSON.parse(t);if(a.schemaVersion!==Qe||typeof a.sourceName!="string"||typeof a.copiedAt!="string")throw new Error("Unsupported creature clipboard.");return et(a.data,a.sourceName,a.copiedAt)}catch{try{e.removeItem(ce)}catch{}return}}function At(e,t){return fe({name:e,...t.data})}function Wt(e){e.removeItem(ce)}function qt(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function F(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function We(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function W(e,t){return String(e.get(t)??"").trim()||void 0}function Pt(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=F(e,"hpCurrent"),n.hpMax=F(e,"hpMax"),a)return n;n.tags=W(e,"tags"),n.hpBase=F(e,"hpBase"),n.maxLoad=We(e,"maxLoad"),n.loadBase=F(e,"loadBase"),n.armor=F(e,"armor"),n.damage=W(e,"damage"),n.damageDescription=W(e,"damageDescription"),n.damageTags=W(e,"damageTags"),n.instinct=W(e,"instinct"),n.moves=W(e,"moves"),n.treasure=W(e,"treasure"),n.level=F(e,"level"),n.xp=F(e,"xp");const o=_e();for(let i=0;i<o.length;i+=1)o[i]=We(e,`score-${i}`)??null;n.scores=ft(o);const r={};for(const i of ie)e.get(`condition-${i}`)==="on"&&(r[i]=-1);return n.conditions=gt(r),n.alignment=W(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function Me(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Pt(e,t,a)}}function Te(e){const t=e[ge];return typeof t=="boolean"?t:!0}function Ht(e,t){return bt(e)?e:{visibleToPlayers:t}}async function Bt(e,t){await e({[ge]:t})}const D={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,settings:!1,characters:!1},de=["agenda","moves","settings","characters"];function Ft(e){const t=new Set(de),a=Array.isArray(e)?e.filter(n=>typeof n=="string"&&t.has(n)):[];return[...new Set(a),...de.filter(n=>!a.includes(n))]}const at=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],nt=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function we(e,t,a){return`
    <div class="section-heading major-section-heading" draggable="true" data-drag-section="${t}">
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
      </button>
    </div>`}function qe(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          <span class="section-arrow" aria-hidden="true">&#9656;</span><span>${e}</span>
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function _t(e,t,a,n=D,o="",r=""){const i=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section" data-home-section="agenda">
        ${we("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section" data-home-section="moves">
        ${we("Moves","moves",n.moves)}
        ${n.moves?`${qe("Basic Moves","basicMoves",n.basicMoves,at)}
        ${qe("Special Moves","specialMoves",n.specialMoves,nt)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section" data-home-section="settings">
        ${we("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${i}" title="${i}" ${a?"disabled":""}>
            ${wt(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>`:""}
      </section>`:""}
      ${o}
      ${r?`<p class="extension-version">version ${r}</p>`:""}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`}function Pe(e){const t=e[je];return typeof t=="boolean"?t:!0}async function Gt(e,t){await e({[je]:t})}const U=document.querySelector("#app"),te=new URLSearchParams(window.location.search),z=te.get("itemId"),ot=te.get("view")??"edit",He=te.get("preview");function ue(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function L(e,t){return e instanceof Error?e.message:t}function p(e,t){d.isAvailable&&d.notification.show(e,t)}function De(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=Ct(t.value);const a=St(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function rt(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>De(e))}function x(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function it(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),o=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const r=()=>{for(let C=0;C<6;C+=1){const T=x(e,`score-${C}`),u=e.querySelector(`[data-score-modifier="${C}"]`);u&&(u.textContent=Ge(Ye(T)))}const s=$e(x(e,"hpBase"),x(e,"score-2")),g=Ce(x(e,"loadBase"),x(e,"score-0"));n&&(n.textContent=`Calculated: ${s??"—"}`),o&&(o.textContent=`Calculated: ${g??"—"}`),t.classList.toggle("calculation-mismatch",Ae(x(e,"hpMax"),s)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",Ae(x(e,"maxLoad"),g))},i=(s,g,C,T)=>{const u=e.elements.namedItem(s);!(u instanceof HTMLInputElement)||!(g instanceof HTMLInputElement)||(u.dataset.lastPromptedValue=u.value,u.addEventListener("blur",()=>{const ct=u.dataset.lastPromptedValue??"",be=T();if(!Lt(ct,u.value,x(e,g.name),be)){u.dataset.lastPromptedValue=u.value,r();return}u.dataset.lastPromptedValue=u.value;const dt=g.value.trim()||"blank";window.confirm(`${C} changed. Recalculate ${g.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${dt} to ${be}?`)&&(g.value=String(be)),r()}))};for(const s of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))s.addEventListener("input",r);i("score-2",t,"Constitution",()=>$e(x(e,"hpBase"),x(e,"score-2"))),i("score-0",a,"Strength",()=>Ce(x(e,"loadBase"),x(e,"score-0"))),r()}function Ut(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],o={};for(const r of n)JSON.stringify(e[r])!==JSON.stringify(t[r])&&(o[r]=t[r]);return o}let E="PLAYER",G={},le=!1,V,me,w,Y=[],Ie=new Map,ne,Se=!1,O=!1,S,Le=!1,f,K,P;const he=new Set,pe=new Set,st="dwtools/home-sections";function Yt(){try{const e=JSON.parse(localStorage.getItem(st)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:D.agenda,moves:typeof e.moves=="boolean"?e.moves:D.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:D.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:D.specialMoves,settings:typeof e.settings=="boolean"?e.settings:D.settings,characters:typeof e.characters=="boolean"?e.characters:D.characters}}catch{return{...D}}}function jt(e){const t=typeof e=="object"&&e!==null?e:{};return Object.fromEntries(Object.entries(D).map(([a,n])=>[a,typeof t[a]=="boolean"?t[a]:n]))}function Be(e){const t=e[Xe];if(typeof t=="object"&&t!==null){const a=t;I=jt(a.expanded),J=Ft(a.order);return}I=Yt(),J=[...de]}async function Fe(){try{await d.player.setMetadata({[Xe]:{version:1,expanded:I,order:J}})}catch(e){console.error("DWTools could not save the panel layout",e),p("DWTools could not save your panel layout.","ERROR")}}let I={...D},J=[...de],Z;function Vt(){return{records:Y,counts:Ie,role:E,usage:ne,loading:Se,saving:O,error:S,editing:f,expandedCharacters:he,expandedInventories:pe,draftCharacterId:K,transfer:P}}function h(){const e=Te(G),t=Nt(Vt(),I.characters||!!f);U.innerHTML=_t(E,e,le,I,t,xt);const a=document.querySelector(".home"),n=document.querySelector(".extension-version, #move-dialog");if(a&&n)for(const o of J){const r=a.querySelector(`[data-home-section="${o}"]`);r&&a.insertBefore(r,n)}document.querySelector("#default-visibility")?.addEventListener("click",()=>{Zt()});for(const o of document.querySelectorAll("[data-toggle-section]"))o.addEventListener("click",()=>{const r=o.dataset.toggleSection;I={...I,[r]:!I[r]},Fe(),h()});for(const o of document.querySelectorAll("[data-drag-section]")){const r=o.dataset.dragSection,i=o.closest("[data-home-section]");o.addEventListener("dragstart",s=>{Z=r,i?.classList.add("dragging"),s.dataTransfer?.setData("text/plain",r),s.dataTransfer&&(s.dataTransfer.effectAllowed="move")}),o.addEventListener("dragend",()=>{Z=void 0,document.querySelectorAll(".dragging, .drag-over").forEach(s=>s.classList.remove("dragging","drag-over"))}),i?.addEventListener("dragover",s=>{!Z||Z===r||(s.preventDefault(),i.classList.add("drag-over"))}),i?.addEventListener("dragleave",()=>i.classList.remove("drag-over")),i?.addEventListener("drop",s=>{s.preventDefault();const g=Z;if(!g||g===r)return;const C=J.filter(T=>T!==g);C.splice(C.indexOf(r),0,g),J=C,Fe(),h()})}for(const o of document.querySelectorAll("[data-move]"))o.addEventListener("click",()=>{const r=[...at,...nt].find(C=>C.id===o.dataset.move),i=document.querySelector("#move-dialog"),s=document.querySelector("#move-dialog-title"),g=document.querySelector("#move-dialog-text");!r||!i||!s||!g||(s.textContent=r.name,g.textContent=r.text,i.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),zt()}function zt(){document.querySelector("#manager-create")?.addEventListener("click",()=>{S=void 0,f={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},I.characters=!0,localStorage.setItem(st,JSON.stringify(I)),h()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{f=void 0,S=void 0,h()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=Y.find(n=>n.id===t.dataset.editCharacter);a&&(S=void 0,f={kind:"edit",id:a.id,fields:a.fields},h())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{Xt(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(rt(e),it(e),e.addEventListener("submit",t=>{t.preventDefault(),Jt(e)}));for(const t of document.querySelectorAll("[data-character-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.characterDetails;a&&(t.open?he.add(a):he.delete(a))});for(const t of document.querySelectorAll("[data-inventory-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.inventoryDetails;a&&(t.open?pe.add(a):pe.delete(a))});Kt()}function q(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return Y.find(a=>a.id===t)}function j(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function _(e,t,a){if(!O){O=!0,S=void 0,a?ye(a):h();try{await e(),K=void 0,P=void 0,await A(!1),t&&p(t,"SUCCESS"),ne?.nearLimit&&p("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=L(n,"DWTools could not update this inventory.");await A(!1),S=o}finally{O=!1,a?ye(a):h()}}}function ye(e,t=!1){h(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function ke(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function Kt(){if(!w)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=q(a),o=Number(a.dataset.inventoryName),r=n&&j(n,o);!n||!r||ke(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const i=[a.value,r.expected[1],r.expected[2]];_(()=>w.updateInventoryItem(n.id,r,i))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=q(a),o=Number(a.dataset.inventoryWeight),r=n&&j(n,o);if(!n||!r)continue;const i=String(r.expected[1]);ke(a,i,()=>{if(a.value===i)return;const s=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];_(()=>w.updateInventoryItem(n.id,r,s))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=q(a),o=Number(a.dataset.inventoryCount),r=n&&j(n,o);if(!n||!r)continue;const i=String(r.expected[2]);ke(a,i,()=>{if(a.value===i)return;const s=a.value.trim()===""?Number.NaN:Number(a.value);_(()=>w.changeInventoryItemCount(n.id,r,s-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=q(a),o=Number(a.dataset.inventoryAdjust),r=n&&j(n,o),i=Number(a.dataset.change);!n||!r||_(()=>w.changeInventoryItemCount(n.id,r,i))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=q(a),o=Number(a.dataset.inventoryRemove),r=n&&j(n,o);!n||!r||_(()=>w.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=q(a);n&&(K=n.id,he.add(n.id),pe.add(n.id),ye(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=K;K=void 0,a?ye(a):h()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=q(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];_(()=>w.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=q(a),o=Number(a.dataset.inventoryTransfer),r=n&&j(n,o);!n||!r||(P={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},h())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{P=void 0,h()});const t=document.querySelector("[data-transfer-form]");t&&P&&t.addEventListener("submit",a=>{if(a.preventDefault(),!P||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),i=P;_(()=>w.transferInventoryItem(i.sourceCharacterId,o,{sourceIndex:i.sourceIndex,expected:i.expected},r),"Item transferred.")})}async function A(e=!0){if(!(!V||!me||!w)){Se=!0,S=void 0,e&&!f&&h();try{if(E==="GM"&&!Le){const t=await w.cleanupLegacyTombstones();Le=!0,t&&p(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[Y,Ie,ne]=await Promise.all([w.listAccessible(),$t(me.scene),E==="GM"?V.estimateUsage():Promise.resolve(void 0)]),E==="PLAYER"&&f?.kind==="edit"&&!Y.some(t=>t.id===f?.id)&&(f=void 0,S="You no longer control a token linked to the Character being edited.")}catch(t){S=L(t,"DWTools could not load character records.")}finally{Se=!1,e&&!f&&h()}}}async function Jt(e){if(!(!f||!w||O)){if(!De(e)||!e.reportValidity()){S="Correct the highlighted character fields before saving.",h();return}O=!0,S=void 0,h();try{const t=fe(Me(new FormData(e),f.fields,!1));f.kind==="create"?(await w.create(t),p("Character record created.","SUCCESS")):(await w.save(f.id,t),p("Character record saved.","SUCCESS")),f=void 0,await A(!1),ne?.nearLimit&&p("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){S=L(t,"DWTools could not save the record.")}finally{O=!1,h()}}}async function Xt(e){if(!e||!w||O)return;const t=Y.find(a=>a.id===e);if(t&&window.confirm(Mt(t.fields.name))){O=!0,S=void 0,h();try{await w.delete(e),p("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await A(!1)}catch(a){S=L(a,"DWTools could not delete the record.")}finally{O=!1,h()}}}async function Zt(){if(E!=="GM"||le)return;const e=!Te(G);le=!0,h();try{await Bt(t=>d.room.setMetadata(t),e),G={...G,[ge]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),p("DWTools could not save the default overlay visibility.","ERROR")}finally{le=!1,h()}}async function Qt(){try{await Ve()}catch(o){console.error("DWTools metadata namespace migration failed",o),U.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',p("DWTools could not migrate its saved data.","ERROR");return}V=ze(),me=Ke(V),w=kt(V,me);const[e,t,a]=await Promise.all([d.player.getRole(),d.room.getMetadata(),d.player.getMetadata(),d.theme.getTheme().then(ue)]);E=e,G=t,Be(a),await A(!1),h();const n=[d.room.onMetadataChange(o=>{G=o,h()}),V.subscribe(o=>{o.some(r=>r.lookup.status==="deleted")&&(Le=!1),A(E==="PLAYER"||!f)}),d.player.onChange(o=>{E=o.role,Be(o.metadata),f=void 0,K=void 0,P=void 0,A()}),d.scene.items.onChange(()=>{A(E==="PLAYER"||!f)}),d.room.onPermissionsChange(()=>{A(E==="PLAYER"||!f)}),d.theme.onChange(ue)];window.addEventListener("unload",()=>{for(const o of n)o()},{once:!0})}let H,$,c,y,M={status:"missing"},ve=[],oe=!1,Q="",m=!1,N=!0,ee=!1,k,re=!1,R,X;function ea(e){const t=B(e);let a,n;t?M.status==="active"?(a=`Character record: <strong>${l(M.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${M.status==="malformed"?"malformed":M.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=Q.trim().toLocaleLowerCase(),r=o?ve.filter(s=>s.fields.name.toLocaleLowerCase().includes(o)||s.fields.tags?.toLocaleLowerCase().includes(o)):ve,i=oe?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${N?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${l(Q)}"></label>
        <div class="link-results">
          ${r.length?r.map(s=>`
                <button type="button" data-link-record="${l(s.id)}" data-link-search="${l(`${s.fields.name} ${s.fields.tags??""}`.toLocaleLowerCase())}">
                  ${Et(s)}
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
        <input id="overwrite-label" type="checkbox" ${N?"checked":""} ${ee?"disabled":""}>
        Overwrite label
      </label>
      ${i}
    </section>`}function lt(e){return e?`Copied from ${e.sourceName} · ${new Date(e.copiedAt).toLocaleString()}`:"No copied DWTools data."}function ta(){const e=re||M.status==="active";return`
    <section class="creature-clipboard-section">
      <div class="creature-clipboard-heading">
        <strong>DWTools data clipboard</strong>
        <span data-clipboard-status>${l(lt(R))}</span>
      </div>
      ${X?`<p class="clipboard-staged">Pasted data from ${l(X.sourceName)} is staged. Save to apply it.</p>`:""}
      <div class="clipboard-actions">
        <button class="secondary" type="button" id="copy-creature-data" ${e&&!m?"":"disabled"}>Copy DWTools data</button>
        <button class="secondary" type="button" id="paste-creature-data" ${R&&!m?"":"disabled"}>Paste DWTools data</button>
        <button class="secondary" type="button" id="clear-creature-data" ${R&&!m?"":"disabled"}>Clear copied data</button>
      </div>
    </section>`}function v(){if(!c||!y)return;const e=ot==="hp";U.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${l(y.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${ea(c)}
      ${k?`<p class="inline-error">${l(k)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${b(y.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${b(y.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:Ze(y)}
      ${e?"":ta()}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${m?"disabled":""}>${m?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=qt(a.value,n.value);o!==null&&(n.value=o)}),rt(t),it(t);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{d.popover.close(Ee)}),document.querySelector("#remove")?.addEventListener("click",()=>{ua()}),document.querySelector("#copy-creature-data")?.addEventListener("click",()=>aa()),document.querySelector("#paste-creature-data")?.addEventListener("click",()=>ra(t)),document.querySelector("#clear-creature-data")?.addEventListener("click",()=>na()),document.querySelector("#link-character")?.addEventListener("click",()=>{ia()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{sa(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{ca()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{da()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{oe=!1,Q="",v()}),document.querySelector("#link-search")?.addEventListener("input",o=>{Q=o.currentTarget.value;const r=Q.trim().toLocaleLowerCase();for(const i of document.querySelectorAll("[data-link-search]"))i.hidden=!String(i.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{la(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),ma(t)})}function Oe(){const e=document.querySelector("[data-clipboard-status]");e&&(e.textContent=lt(R));const t=document.querySelector("#paste-creature-data"),a=document.querySelector("#clear-creature-data");t&&(t.disabled=!R),a&&(a.disabled=!R)}function aa(){if(!c||!y||!re&&M.status!=="active"){p("This token has no saved DWTools data to copy.","WARNING");return}try{const e=et(xe(y),c.name);Rt(window.localStorage,e),R=e,Oe(),p(`Copied DWTools data from ${e.sourceName}.`,"SUCCESS")}catch(e){p(L(e,"DWTools could not copy the creature data."),"ERROR")}}function na(){try{Wt(window.localStorage),R=void 0,Oe(),p("Copied DWTools data cleared.","SUCCESS")}catch(e){p(L(e,"DWTools could not clear the copied data."),"ERROR")}}function oa(e){if(!y)return!1;try{const t=fe(Me(new FormData(e),y,!1));return JSON.stringify(t)!==JSON.stringify(y)}catch{return!0}}function ra(e){if(!c||!y)return;if(B(c)){p("Unlink this token from its Character record before pasting DWTools data.","ERROR");return}const t=tt(window.localStorage);if(R=t,!t){Oe(),p("There is no valid copied DWTools data to paste.","WARNING");return}oa(e)&&!window.confirm("Replace the unsaved form values with the copied DWTools data?")||(y=At(y.name,t),X=t,k=void 0,v())}async function ae(){if(!z||!$||!H)return;const e=await $.getItem(z);if(!e){U.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}re=se in e.metadata,X=void 0,c=e,y=Je(e);const t=B(e);M=t?await H.inspect(t.characterId):{status:"missing"},M.status==="active"&&(y=M.record.fields),v()}async function ia(){if(!(!H||m)){m=!0,k=void 0,v();try{ve=await H.list(),oe=!0}catch(e){k=L(e,"DWTools could not load character records.")}finally{m=!1,v()}}}async function sa(e){if(ee)return;const t=N;N=e,ee=!0,v();try{await Gt(a=>d.room.setMetadata(a),e)}catch(a){N=t,k=L(a,"DWTools could not save the overwrite-label setting.")}finally{ee=!1,v()}}async function la(e){if(!e||!$||!c||m)return;const t=ve.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${N?"overwritten":"retained"}.`)){m=!0,k=void 0,v();try{await $.linkToExistingCharacter(c.id,e,N),p(`Linked to ${t.fields.name}.`,"SUCCESS"),oe=!1,await ae()}catch(a){k=L(a,"DWTools could not link the character.")}finally{m=!1,v()}}}async function ca(){if(!(!$||!c||m)){m=!0,k=void 0,v();try{const{record:e}=await $.createAndLinkCharacter(c.id);p(`Created and linked ${e.fields.name}.`,"SUCCESS"),oe=!1,await ae()}catch(e){k=L(e,"DWTools could not create and link the character.")}finally{m=!1,v()}}}async function da(){if(!(!$||!c||m)){m=!0,k=void 0,v();try{await $.unlinkCharacter(c.id),p("Character unlinked; creature fields were retained.","SUCCESS"),await ae()}catch(e){k=L(e,"DWTools could not unlink the character.")}finally{m=!1,v()}}}async function ua(){if(!(!$||!c||m||B(c)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){m=!0,v();try{await $.removeCreatureData(c.id),await d.popover.close(Ee)}catch(t){k=L(t,"DWTools could not remove the creature data."),m=!1,v()}}}async function ma(e){if(!(!$||!c||!y||m)){if(!De(e)||!e.reportValidity()){k="Correct the highlighted creature fields before saving.",v();return}m=!0,k=void 0,v();try{const t=ot==="hp",a=fe(Me(new FormData(e),y,t)),n=!!X;if(n)await $.replaceUnlinkedCreatureData(c.id,xe(a)),X=void 0;else{let o=Ut(y,a,t);!re&&!B(c)&&(o=a),Object.keys(o).length&&await $.updateCreatureFields(c.id,o)}p(n?"Copied DWTools data saved.":B(c)?"Character record saved.":"Creature saved.","SUCCESS"),await d.popover.close(Ee)}catch(t){k=L(t,"DWTools could not save the creature."),m=!1,v()}}}async function ha(){if(!z)return;try{await Ve()}catch(r){console.error("DWTools metadata namespace migration failed",r),U.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',p("DWTools could not migrate its saved data.","ERROR");return}H=ze(),$=Ke(H),R=tt(window.localStorage);const[e,t]=await Promise.all([$.getItem(z),d.room.getMetadata().catch(r=>(console.warn("DWTools could not load room visibility settings",r),{})),d.theme.getTheme().then(ue)]);if(!e){U.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}re=se in e.metadata;const a=Ht(e.metadata[se],Te(t));N=Pe(t),c={...e,metadata:{...e.metadata,[se]:a}},y=Je(c);const n=B(c);M=n?await H.inspect(n.characterId):{status:"missing"},M.status==="active"&&(y=M.record.fields),v();const o=[H.subscribe(r=>{const i=c&&B(c);i&&r.some(s=>s.characterId===i.characterId)&&!m&&ae()}),d.scene.items.onChange(r=>{r.find(s=>s.id===z)&&!m&&ae()}),d.room.onMetadataChange(r=>{ee||(N=Pe(r),v())}),d.theme.onChange(ue)];window.addEventListener("unload",()=>{for(const r of o)r()},{once:!0})}He==="home"?(E="GM",G={[ge]:te.get("default")!=="hidden"},Y=[{schemaVersion:3,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],Ie=new Map([["preview-active",2]]),ne={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},h()):He==="editor"?(N=te.get("overwriteLabel")?.toLocaleLowerCase()!=="false",c={id:"preview",name:"Frogman",metadata:{}},y={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},v()):z?d.isAvailable?d.onReady(()=>{ha()}):U.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(h(),d.isAvailable&&d.onReady(()=>{Qt()}));
