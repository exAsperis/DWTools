import{F as Pe,G as be,H as we,I as Ie,A as Oe,v as oe,J as rt,x as Be,u as He,K as Fe,M as it,t as st,N as lt,P as ct,Q as dt,R as Ce,S as pe,T as ut,U as mt,V as ye,b as ht,r as pt,W as Ge,O as m,E as Se,l as Ue,m as _e,y as Ve,X as yt,C as re,Y as Ye,g as H,Z as vt,_ as ft,$ as gt,a0 as Ne,a1 as bt,a2 as wt}from"./obrMetadataMigration-1.3.7.js";function s(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function g(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function je(e,t="",a="creature"){const n=N=>`${t}${N}`,o=e.scores??Pe(),r=be(e.hpBase,o[2]),i=we(e.loadBase,o[0]),l=r!==void 0&&e.hpMax!==r,M=i!==void 0&&e.maxLoad!==i,O=o.map((N,d)=>`
        <div class="ability-row">
          <label class="ability-score">${Ie[d]}
            <input id="${n(`score-${d}`)}" name="score-${d}" type="number" min="3" max="18" step="1" value="${g(N)}">
          </label>
          <span class="ability-modifier" aria-label="${Ie[d]} modifier">
            <span class="ability-modifier-label">${Oe[d]}</span>
            <span class="ability-modifier-value" data-score-modifier="${d}">${Be(Fe(N))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${oe[d]}`)}" name="condition-${oe[d]}" type="checkbox" ${e.conditions?.[oe[d]]===-1?"checked":""}>
            ${rt[d]} <span>−1 ${Oe[d]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${s(e.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${n("armor")}" name="armor" type="number" step="1" value="${g(e.armor)}"></label>
        <label>Current HP<input id="${n("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${g(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${n("hpMax")}" name="hpMax" class="${l?"calculation-mismatch":""}" type="number" min="0" step="1" value="${g(e.hpMax)}">
          <span class="calculated-hint" data-calculated-hp>Calculated: ${r??"—"}</span>
        </label>
      </div>
      <div class="damage-fields">
        <label>Damage die<input id="${n("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${s(e.damage??"")}"></label>
        <label>Damage description<input id="${n("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${s(e.damageDescription??"")}"></label>
      </div>
      <label>Damage tags<input id="${n("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${s(e.damageTags??"")}"></label>
      <label class="visibility">
        <input id="${n("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
        Show the token overlay to players
      </label>
    </section>
    <details class="editor-section expandable-fields" ${a==="creature"?"open":""}>
      <summary><strong>GM Character</strong></summary>
      <div class="editor-section-body">
        <label>Tags<input id="${n("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${s(e.tags??"")}"></label>
        <label>Instinct<textarea id="${n("instinct")}" name="instinct" rows="2">${s(e.instinct??"")}</textarea></label>
        <label>Moves<textarea id="${n("moves")}" name="moves" rows="4" placeholder="One move per line">${s(e.moves??"")}</textarea></label>
        <label>Treasure<textarea id="${n("treasure")}" name="treasure" rows="3">${s(e.treasure??"")}</textarea></label>
      </div>
    </details>
    <details class="editor-section expandable-fields player-fields" ${a==="character"?"open":""}>
      <summary><strong>Player Character</strong></summary>
      <div class="editor-section-body">
        <div class="progression-row">
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${g(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${g(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${s(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${g(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${g(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${M?"calculation-mismatch":""}" type="number" min="0" step="any" value="${g(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${i??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${O}</div>
      </div>
    </details>`}function kt(e){const t=e.fields;return`${s(t.name)} · HP ${g(t.hpCurrent)||"—"}/${g(t.hpMax)||"—"} · ARM ${g(t.armor)||"—"} · DMG ${s(t.damage??"—")}`}function $t(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function Ct(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function St(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
    <div class="inventory-row" data-inventory-row="${a}">
      <div class="inventory-primary">
        <input class="inventory-inline-input inventory-name" data-inventory-name="${a}" type="text" maxlength="120" value="${s(t[0])}" aria-label="Item name">
        <div class="inventory-actions">
          <button type="button" class="danger compact" data-inventory-remove="${a}" aria-label="Remove ${s(t[0])}">Remove</button>
          ${n.role==="GM"?`<button type="button" class="secondary compact" data-inventory-transfer="${a}">Transfer</button>`:""}
        </div>
      </div>
      <div class="inventory-metrics">
        <label class="inventory-metric">wt/ea:
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${g(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${s(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${s(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${s(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${lt(ct(t))}</strong></span>
      </div>
    </div>
    ${o?`<form class="transfer-form" data-transfer-form="${a}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${n.records.filter(r=>r.id!==e.id).map(r=>`<option value="${s(r.id)}">${s(r.fields.name)}</option>`).join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${t[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`:""}`}function xt(e,t){const a=e.inventory??[],n=it(st(a),e.fields.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.fields.maxLoad===void 0?"Empty":He(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${s(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${s(e.fields.name)} inventory">
          ${a.length?a.map((i,l)=>St(e,i,l,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function Lt(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.counts.get(e.id)??0;return`
    <details class="character-card" data-character-details="${s(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${s(e.fields.name)}</strong>
        <span>${He(e.inventory,e.fields.maxLoad)}</span>
      </summary>
      <div class="character-card-body">
        <span>HP ${g(e.fields.hpCurrent)||"—"}/${g(e.fields.hpMax)||"—"} · ARM ${g(e.fields.armor)||"—"} · DMG ${s(e.fields.damage??"—")}</span>
        <span>${n} linked token${n===1?"":"s"} in current scene · Updated ${s(new Date(e.updatedAt).toLocaleString())}</span>
        <div class="card-actions">
          <button type="button" class="secondary compact" data-edit-character="${s(e.id)}">Edit Character</button>
          ${t.role==="GM"?`<button type="button" class="danger compact" data-delete-character="${s(e.id)}">Delete</button>`:""}
        </div>
        ${xt(e,t)}
      </div>
    </details>`}function Mt(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${s(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${s(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${je(e.editing.fields,"manager-","character")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${e.saving?"disabled":""}>${e.saving?"Saving…":"Save record"}</button>
          </div>
        </form>
      </section>`:`
    <section class="character-manager">
      <div class="section-heading">
        <h2>Characters</h2>
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          (${t?"collapse":"expand"})
        </button>
      </div>
      ${t?`${e.role==="GM"?Ct(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${s(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>Lt(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}const se=`${dt}/creature-clipboard`,ze=1;function Je(e,t,a=new Date().toISOString()){const n=t.trim();if(!n)throw new Error("The copied token must have a name.");if(!Number.isFinite(Date.parse(a)))throw new Error("The copied-data timestamp is invalid.");return{schemaVersion:ze,sourceName:n,copiedAt:a,data:Ce(e)}}function Et(e,t){e.setItem(se,JSON.stringify(t))}function Ke(e){try{const t=e.getItem(se);if(t===null)return;const a=JSON.parse(t);if(a.schemaVersion!==ze||typeof a.sourceName!="string"||typeof a.copiedAt!="string")throw new Error("Unsupported creature clipboard.");return Je(a.data,a.sourceName,a.copiedAt)}catch{try{e.removeItem(se)}catch{}return}}function Tt(e,t){return pe({name:e,...t.data})}function Dt(e){e.removeItem(se)}function It(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function F(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function Re(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function R(e,t){return String(e.get(t)??"").trim()||void 0}function Ot(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=F(e,"hpCurrent"),n.hpMax=F(e,"hpMax"),a)return n;n.tags=R(e,"tags"),n.hpBase=F(e,"hpBase"),n.maxLoad=Re(e,"maxLoad"),n.loadBase=F(e,"loadBase"),n.armor=F(e,"armor"),n.damage=R(e,"damage"),n.damageDescription=R(e,"damageDescription"),n.damageTags=R(e,"damageTags"),n.instinct=R(e,"instinct"),n.moves=R(e,"moves"),n.treasure=R(e,"treasure"),n.level=F(e,"level"),n.xp=F(e,"xp");const o=Pe();for(let i=0;i<o.length;i+=1)o[i]=Re(e,`score-${i}`)??null;n.scores=ut(o);const r={};for(const i of oe)e.get(`condition-${i}`)==="on"&&(r[i]=-1);return n.conditions=mt(r),n.alignment=R(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function xe(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Ot(e,t,a)}}function Le(e){const t=e[ye];return typeof t=="boolean"?t:!0}function Nt(e,t){return ht(e)?e:{visibleToPlayers:t}}async function Rt(e,t){await e({[ye]:t})}const q={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,settings:!1,characters:!1},Xe=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],Ze=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function fe(e,t,a){return`
    <div class="section-heading">
      <h2>${e}</h2>
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        (${a?"collapse":"expand"})
      </button>
    </div>`}function We(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <h3>${e}</h3>
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          (${a?"collapse":"expand"})
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function Wt(e,t,a,n=q,o="",r=""){const i=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section">
        ${fe("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section">
        ${fe("Moves","moves",n.moves)}
        ${n.moves?`${We("Basic Moves","basicMoves",n.basicMoves,Xe)}
        ${We("Special Moves","specialMoves",n.specialMoves,Ze)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section">
        ${fe("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${i}" title="${i}" ${a?"disabled":""}>
            ${pt(t?"eye":"eye-off","default-visibility-icon")}
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
    </section>`}function qe(e){const t=e[Ge];return typeof t=="boolean"?t:!0}async function qt(e,t){await e({[Ge]:t})}const _=document.querySelector("#app"),Q=new URLSearchParams(window.location.search),z=Q.get("itemId"),Qe=Q.get("view")??"edit",Ae=Q.get("preview");function le(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function C(e,t){return e instanceof Error?e.message:t}function y(e,t){m.isAvailable&&m.notification.show(e,t)}function Me(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=ft(t.value);const a=gt(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function et(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>Me(e))}function S(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function tt(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),o=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const r=()=>{for(let O=0;O<6;O+=1){const N=S(e,`score-${O}`),d=e.querySelector(`[data-score-modifier="${O}"]`);d&&(d.textContent=Be(Fe(N)))}const l=be(S(e,"hpBase"),S(e,"score-2")),M=we(S(e,"loadBase"),S(e,"score-0"));n&&(n.textContent=`Calculated: ${l??"—"}`),o&&(o.textContent=`Calculated: ${M??"—"}`),t.classList.toggle("calculation-mismatch",Ne(S(e,"hpMax"),l)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",Ne(S(e,"maxLoad"),M))},i=(l,M,O,N)=>{const d=e.elements.namedItem(l);!(d instanceof HTMLInputElement)||!(M instanceof HTMLInputElement)||(d.dataset.lastPromptedValue=d.value,d.addEventListener("blur",()=>{const nt=d.dataset.lastPromptedValue??"",ve=N();if(!bt(nt,d.value,S(e,M.name),ve)){d.dataset.lastPromptedValue=d.value,r();return}d.dataset.lastPromptedValue=d.value;const ot=M.value.trim()||"blank";window.confirm(`${O} changed. Recalculate ${M.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${ot} to ${ve}?`)&&(M.value=String(ve)),r()}))};for(const l of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))l.addEventListener("input",r);i("score-2",t,"Constitution",()=>be(S(e,"hpBase"),S(e,"score-2"))),i("score-0",a,"Strength",()=>we(S(e,"loadBase"),S(e,"score-0"))),r()}function At(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],o={};for(const r of n)JSON.stringify(e[r])!==JSON.stringify(t[r])&&(o[r]=t[r]);return o}let x="PLAYER",U={},ie=!1,j,ce,b,V=[],Ee=new Map,te,ke=!1,E=!1,$,$e=!1,f,J,P;const de=new Set,ue=new Set,Te="dwtools/home-sections";function Pt(){try{const e=JSON.parse(localStorage.getItem(Te)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:q.agenda,moves:typeof e.moves=="boolean"?e.moves:q.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:q.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:q.specialMoves,settings:typeof e.settings=="boolean"?e.settings:q.settings,characters:typeof e.characters=="boolean"?e.characters:q.characters}}catch{return{...q}}}let A=Pt();function Bt(){return{records:V,counts:Ee,role:x,usage:te,loading:ke,saving:E,error:$,editing:f,expandedCharacters:de,expandedInventories:ue,draftCharacterId:J,transfer:P}}function h(){const e=Le(U),t=Mt(Bt(),A.characters||!!f);_.innerHTML=Wt(x,e,ie,A,t,wt),document.querySelector("#default-visibility")?.addEventListener("click",()=>{_t()});for(const a of document.querySelectorAll("[data-toggle-section]"))a.addEventListener("click",()=>{const n=a.dataset.toggleSection;A={...A,[n]:!A[n]},localStorage.setItem(Te,JSON.stringify(A)),h()});for(const a of document.querySelectorAll("[data-move]"))a.addEventListener("click",()=>{const n=[...Xe,...Ze].find(l=>l.id===a.dataset.move),o=document.querySelector("#move-dialog"),r=document.querySelector("#move-dialog-title"),i=document.querySelector("#move-dialog-text");!n||!o||!r||!i||(r.textContent=n.name,i.textContent=n.text,o.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),Ht()}function Ht(){document.querySelector("#manager-create")?.addEventListener("click",()=>{$=void 0,f={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},A.characters=!0,localStorage.setItem(Te,JSON.stringify(A)),h()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{f=void 0,$=void 0,h()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=V.find(n=>n.id===t.dataset.editCharacter);a&&($=void 0,f={kind:"edit",id:a.id,fields:a.fields},h())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{Ut(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(et(e),tt(e),e.addEventListener("submit",t=>{t.preventDefault(),Gt(e)}));for(const t of document.querySelectorAll("[data-character-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.characterDetails;a&&(t.open?de.add(a):de.delete(a))});for(const t of document.querySelectorAll("[data-inventory-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.inventoryDetails;a&&(t.open?ue.add(a):ue.delete(a))});Ft()}function W(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return V.find(a=>a.id===t)}function Y(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function G(e,t,a){if(!E){E=!0,$=void 0,a?me(a):h();try{await e(),J=void 0,P=void 0,await I(!1),t&&y(t,"SUCCESS"),te?.nearLimit&&y("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=C(n,"DWTools could not update this inventory.");await I(!1),$=o}finally{E=!1,a?me(a):h()}}}function me(e,t=!1){h(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function ge(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function Ft(){if(!b)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=W(a),o=Number(a.dataset.inventoryName),r=n&&Y(n,o);!n||!r||ge(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const i=[a.value,r.expected[1],r.expected[2]];G(()=>b.updateInventoryItem(n.id,r,i))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=W(a),o=Number(a.dataset.inventoryWeight),r=n&&Y(n,o);if(!n||!r)continue;const i=String(r.expected[1]);ge(a,i,()=>{if(a.value===i)return;const l=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];G(()=>b.updateInventoryItem(n.id,r,l))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=W(a),o=Number(a.dataset.inventoryCount),r=n&&Y(n,o);if(!n||!r)continue;const i=String(r.expected[2]);ge(a,i,()=>{if(a.value===i)return;const l=a.value.trim()===""?Number.NaN:Number(a.value);G(()=>b.changeInventoryItemCount(n.id,r,l-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=W(a),o=Number(a.dataset.inventoryAdjust),r=n&&Y(n,o),i=Number(a.dataset.change);!n||!r||G(()=>b.changeInventoryItemCount(n.id,r,i))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=W(a),o=Number(a.dataset.inventoryRemove),r=n&&Y(n,o);!n||!r||G(()=>b.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=W(a);n&&(J=n.id,de.add(n.id),ue.add(n.id),me(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=J;J=void 0,a?me(a):h()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=W(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];G(()=>b.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=W(a),o=Number(a.dataset.inventoryTransfer),r=n&&Y(n,o);!n||!r||(P={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},h())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{P=void 0,h()});const t=document.querySelector("[data-transfer-form]");t&&P&&t.addEventListener("submit",a=>{if(a.preventDefault(),!P||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),i=P;G(()=>b.transferInventoryItem(i.sourceCharacterId,o,{sourceIndex:i.sourceIndex,expected:i.expected},r),"Item transferred.")})}async function I(e=!0){if(!(!j||!ce||!b)){ke=!0,$=void 0,e&&!f&&h();try{if(x==="GM"&&!$e){const t=await b.cleanupLegacyTombstones();$e=!0,t&&y(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[V,Ee,te]=await Promise.all([b.listAccessible(),vt(ce.scene),x==="GM"?j.estimateUsage():Promise.resolve(void 0)]),x==="PLAYER"&&f?.kind==="edit"&&!V.some(t=>t.id===f?.id)&&(f=void 0,$="You no longer control a token linked to the Character being edited.")}catch(t){$=C(t,"DWTools could not load character records.")}finally{ke=!1,e&&!f&&h()}}}async function Gt(e){if(!(!f||!b||E)){if(!Me(e)||!e.reportValidity()){$="Correct the highlighted character fields before saving.",h();return}E=!0,$=void 0,h();try{const t=pe(xe(new FormData(e),f.fields,!1));f.kind==="create"?(await b.create(t),y("Character record created.","SUCCESS")):(await b.save(f.id,t),y("Character record saved.","SUCCESS")),f=void 0,await I(!1),te?.nearLimit&&y("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){$=C(t,"DWTools could not save the record.")}finally{E=!1,h()}}}async function Ut(e){if(!e||!b||E)return;const t=V.find(a=>a.id===e);if(t&&window.confirm($t(t.fields.name))){E=!0,$=void 0,h();try{await b.delete(e),y("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await I(!1)}catch(a){$=C(a,"DWTools could not delete the record.")}finally{E=!1,h()}}}async function _t(){if(x!=="GM"||ie)return;const e=!Le(U);ie=!0,h();try{await Rt(t=>m.room.setMetadata(t),e),U={...U,[ye]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),y("DWTools could not save the default overlay visibility.","ERROR")}finally{ie=!1,h()}}async function Vt(){try{await Ue()}catch(t){console.error("DWTools metadata namespace migration failed",t),_.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',y("DWTools could not migrate its saved data.","ERROR");return}j=_e(),ce=Ve(j),b=yt(j,ce),[x,U]=await Promise.all([m.player.getRole(),m.room.getMetadata(),m.theme.getTheme().then(le)]),await I(!1),h();const e=[m.room.onMetadataChange(t=>{U=t,h()}),j.subscribe(t=>{t.some(a=>a.lookup.status==="deleted")&&($e=!1),I(x==="PLAYER"||!f)}),m.player.onChange(t=>{x=t.role,f=void 0,J=void 0,P=void 0,I()}),m.scene.items.onChange(()=>{I(x==="PLAYER"||!f)}),m.room.onPermissionsChange(()=>{I(x==="PLAYER"||!f)}),m.theme.onChange(le)];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let B,k,c,p,L={status:"missing"},he=[],ae=!1,X="",u=!1,T=!0,Z=!1,w,ne=!1,D,K;function Yt(e){const t=H(e);let a,n;t?L.status==="active"?(a=`Character record: <strong>${s(L.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${L.status==="malformed"?"malformed":L.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=X.trim().toLocaleLowerCase(),r=o?he.filter(l=>l.fields.name.toLocaleLowerCase().includes(o)||l.fields.tags?.toLocaleLowerCase().includes(o)):he,i=ae?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${T?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${s(X)}"></label>
        <div class="link-results">
          ${r.length?r.map(l=>`
                <button type="button" data-link-record="${s(l.id)}" data-link-search="${s(`${l.fields.name} ${l.fields.tags??""}`.toLocaleLowerCase())}">
                  ${kt(l)}
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
        <input id="overwrite-label" type="checkbox" ${T?"checked":""} ${Z?"disabled":""}>
        Overwrite label
      </label>
      ${i}
    </section>`}function at(e){return e?`Copied from ${e.sourceName} · ${new Date(e.copiedAt).toLocaleString()}`:"No copied DWTools data."}function jt(){const e=ne||L.status==="active";return`
    <section class="creature-clipboard-section">
      <div class="creature-clipboard-heading">
        <strong>DWTools data clipboard</strong>
        <span data-clipboard-status>${s(at(D))}</span>
      </div>
      ${K?`<p class="clipboard-staged">Pasted data from ${s(K.sourceName)} is staged. Save to apply it.</p>`:""}
      <div class="clipboard-actions">
        <button class="secondary" type="button" id="copy-creature-data" ${e&&!u?"":"disabled"}>Copy DWTools data</button>
        <button class="secondary" type="button" id="paste-creature-data" ${D&&!u?"":"disabled"}>Paste DWTools data</button>
        <button class="secondary" type="button" id="clear-creature-data" ${D&&!u?"":"disabled"}>Clear copied data</button>
      </div>
    </section>`}function v(){if(!c||!p)return;const e=Qe==="hp";_.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${s(p.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${Yt(c)}
      ${w?`<p class="inline-error">${s(w)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${g(p.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${g(p.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:je(p)}
      ${e?"":jt()}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${u?"disabled":""}>${u?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=It(a.value,n.value);o!==null&&(n.value=o)}),et(t),tt(t);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{m.popover.close(Se)}),document.querySelector("#remove")?.addEventListener("click",()=>{na()}),document.querySelector("#copy-creature-data")?.addEventListener("click",()=>zt()),document.querySelector("#paste-creature-data")?.addEventListener("click",()=>Xt(t)),document.querySelector("#clear-creature-data")?.addEventListener("click",()=>Jt()),document.querySelector("#link-character")?.addEventListener("click",()=>{Zt()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{Qt(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{ta()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{aa()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{ae=!1,X="",v()}),document.querySelector("#link-search")?.addEventListener("input",o=>{X=o.currentTarget.value;const r=X.trim().toLocaleLowerCase();for(const i of document.querySelectorAll("[data-link-search]"))i.hidden=!String(i.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{ea(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),oa(t)})}function De(){const e=document.querySelector("[data-clipboard-status]");e&&(e.textContent=at(D));const t=document.querySelector("#paste-creature-data"),a=document.querySelector("#clear-creature-data");t&&(t.disabled=!D),a&&(a.disabled=!D)}function zt(){if(!c||!p||!ne&&L.status!=="active"){y("This token has no saved DWTools data to copy.","WARNING");return}try{const e=Je(Ce(p),c.name);Et(window.localStorage,e),D=e,De(),y(`Copied DWTools data from ${e.sourceName}.`,"SUCCESS")}catch(e){y(C(e,"DWTools could not copy the creature data."),"ERROR")}}function Jt(){try{Dt(window.localStorage),D=void 0,De(),y("Copied DWTools data cleared.","SUCCESS")}catch(e){y(C(e,"DWTools could not clear the copied data."),"ERROR")}}function Kt(e){if(!p)return!1;try{const t=pe(xe(new FormData(e),p,!1));return JSON.stringify(t)!==JSON.stringify(p)}catch{return!0}}function Xt(e){if(!c||!p)return;if(H(c)){y("Unlink this token from its Character record before pasting DWTools data.","ERROR");return}const t=Ke(window.localStorage);if(D=t,!t){De(),y("There is no valid copied DWTools data to paste.","WARNING");return}Kt(e)&&!window.confirm("Replace the unsaved form values with the copied DWTools data?")||(p=Tt(p.name,t),K=t,w=void 0,v())}async function ee(){if(!z||!k||!B)return;const e=await k.getItem(z);if(!e){_.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ne=re in e.metadata,K=void 0,c=e,p=Ye(e);const t=H(e);L=t?await B.inspect(t.characterId):{status:"missing"},L.status==="active"&&(p=L.record.fields),v()}async function Zt(){if(!(!B||u)){u=!0,w=void 0,v();try{he=await B.list(),ae=!0}catch(e){w=C(e,"DWTools could not load character records.")}finally{u=!1,v()}}}async function Qt(e){if(Z)return;const t=T;T=e,Z=!0,v();try{await qt(a=>m.room.setMetadata(a),e)}catch(a){T=t,w=C(a,"DWTools could not save the overwrite-label setting.")}finally{Z=!1,v()}}async function ea(e){if(!e||!k||!c||u)return;const t=he.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${T?"overwritten":"retained"}.`)){u=!0,w=void 0,v();try{await k.linkToExistingCharacter(c.id,e,T),y(`Linked to ${t.fields.name}.`,"SUCCESS"),ae=!1,await ee()}catch(a){w=C(a,"DWTools could not link the character.")}finally{u=!1,v()}}}async function ta(){if(!(!k||!c||u)){u=!0,w=void 0,v();try{const{record:e}=await k.createAndLinkCharacter(c.id);y(`Created and linked ${e.fields.name}.`,"SUCCESS"),ae=!1,await ee()}catch(e){w=C(e,"DWTools could not create and link the character.")}finally{u=!1,v()}}}async function aa(){if(!(!k||!c||u)){u=!0,w=void 0,v();try{await k.unlinkCharacter(c.id),y("Character unlinked; creature fields were retained.","SUCCESS"),await ee()}catch(e){w=C(e,"DWTools could not unlink the character.")}finally{u=!1,v()}}}async function na(){if(!(!k||!c||u||H(c)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){u=!0,v();try{await k.removeCreatureData(c.id),await m.popover.close(Se)}catch(t){w=C(t,"DWTools could not remove the creature data."),u=!1,v()}}}async function oa(e){if(!(!k||!c||!p||u)){if(!Me(e)||!e.reportValidity()){w="Correct the highlighted creature fields before saving.",v();return}u=!0,w=void 0,v();try{const t=Qe==="hp",a=pe(xe(new FormData(e),p,t)),n=!!K;if(n)await k.replaceUnlinkedCreatureData(c.id,Ce(a)),K=void 0;else{let o=At(p,a,t);!ne&&!H(c)&&(o=a),Object.keys(o).length&&await k.updateCreatureFields(c.id,o)}y(n?"Copied DWTools data saved.":H(c)?"Character record saved.":"Creature saved.","SUCCESS"),await m.popover.close(Se)}catch(t){w=C(t,"DWTools could not save the creature."),u=!1,v()}}}async function ra(){if(!z)return;try{await Ue()}catch(r){console.error("DWTools metadata namespace migration failed",r),_.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',y("DWTools could not migrate its saved data.","ERROR");return}B=_e(),k=Ve(B),D=Ke(window.localStorage);const[e,t]=await Promise.all([k.getItem(z),m.room.getMetadata().catch(r=>(console.warn("DWTools could not load room visibility settings",r),{})),m.theme.getTheme().then(le)]);if(!e){_.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ne=re in e.metadata;const a=Nt(e.metadata[re],Le(t));T=qe(t),c={...e,metadata:{...e.metadata,[re]:a}},p=Ye(c);const n=H(c);L=n?await B.inspect(n.characterId):{status:"missing"},L.status==="active"&&(p=L.record.fields),v();const o=[B.subscribe(r=>{const i=c&&H(c);i&&r.some(l=>l.characterId===i.characterId)&&!u&&ee()}),m.scene.items.onChange(r=>{r.find(l=>l.id===z)&&!u&&ee()}),m.room.onMetadataChange(r=>{Z||(T=qe(r),v())}),m.theme.onChange(le)];window.addEventListener("unload",()=>{for(const r of o)r()},{once:!0})}Ae==="home"?(x="GM",U={[ye]:Q.get("default")!=="hidden"},V=[{schemaVersion:3,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],Ee=new Map([["preview-active",2]]),te={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},h()):Ae==="editor"?(T=Q.get("overwriteLabel")?.toLocaleLowerCase()!=="false",c={id:"preview",name:"Frogman",metadata:{}},p={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},v()):z?m.isAvailable?m.onReady(()=>{ra()}):_.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(h(),m.isAvailable&&m.onReady(()=>{Vt()}));
