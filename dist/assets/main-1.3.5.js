import{F as De,G as ye,H as pe,I as Se,A as xe,v as te,J as Xe,x as Oe,u as qe,K as Ae,M as Je,t as Ze,N as Qe,P as et,Q as tt,R as at,S as de,b as nt,r as ot,T as Ne,O as d,E as ge,l as We,m as Pe,y as Re,U as rt,C as ae,V as Be,g as G,W as He,X as it,Y as st,Z as lt,_ as Le,$ as ct,a0 as dt}from"./obrMetadataMigration-1.3.5.js";function s(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function v(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function Fe(e,t="",a="creature"){const n=O=>`${t}${O}`,r=e.scores??De(),o=ye(e.hpBase,r[2]),i=pe(e.loadBase,r[0]),l=o!==void 0&&e.hpMax!==o,L=i!==void 0&&e.maxLoad!==i,D=r.map((O,c)=>`
        <div class="ability-row">
          <label class="ability-score">${Se[c]}
            <input id="${n(`score-${c}`)}" name="score-${c}" type="number" min="3" max="18" step="1" value="${v(O)}">
          </label>
          <span class="ability-modifier" aria-label="${Se[c]} modifier">
            <span class="ability-modifier-label">${xe[c]}</span>
            <span class="ability-modifier-value" data-score-modifier="${c}">${Oe(Ae(O))}</span>
          </span>
          <label class="condition-toggle">
            <input id="${n(`condition-${te[c]}`)}" name="condition-${te[c]}" type="checkbox" ${e.conditions?.[te[c]]===-1?"checked":""}>
            ${Xe[c]} <span>−1 ${xe[c]}</span>
          </label>
        </div>`).join("");return`
    <section class="editor-section common-fields">
      <h2>Common</h2>
      <label>Name<input id="${n("name")}" name="name" type="text" maxlength="120" required value="${s(e.name)}"></label>
      <div class="vitals-row">
        <label>Armor<input id="${n("armor")}" name="armor" type="number" step="1" value="${v(e.armor)}"></label>
        <label>Current HP<input id="${n("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${v(e.hpCurrent)}"></label>
        <span class="slash">/</span>
        <label class="calculated-field">Maximum HP
          <input id="${n("hpMax")}" name="hpMax" class="${l?"calculation-mismatch":""}" type="number" min="0" step="1" value="${v(e.hpMax)}">
          <span class="calculated-hint" data-calculated-hp>Calculated: ${o??"—"}</span>
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
          <label>Level<input id="${n("level")}" name="level" type="number" min="1" max="10" step="1" value="${v(e.level)}"></label>
          <label>XP<input id="${n("xp")}" name="xp" type="number" min="0" step="1" value="${v(e.xp)}"></label>
          <label>Alignment<input id="${n("alignment")}" name="alignment" type="text" maxlength="120" value="${s(e.alignment??"")}"></label>
        </div>
        <div class="base-row">
          <label>HP base<input id="${n("hpBase")}" name="hpBase" type="number" min="0" step="1" value="${v(e.hpBase)}"></label>
          <label>Load base<input id="${n("loadBase")}" name="loadBase" type="number" min="0" step="1" value="${v(e.loadBase)}"></label>
          <label class="calculated-field">Maximum Load
            <input id="${n("maxLoad")}" name="maxLoad" class="${L?"calculation-mismatch":""}" type="number" min="0" step="any" value="${v(e.maxLoad)}">
            <span class="calculated-hint" data-calculated-load>Calculated: ${i??"—"}</span>
          </label>
        </div>
        <div class="ability-list" aria-label="Ability scores and conditions">${D}</div>
      </div>
    </details>`}function ut(e){const t=e.fields;return`${s(t.name)} · HP ${v(t.hpCurrent)||"—"}/${v(t.hpMax)||"—"} · ARM ${v(t.armor)||"—"} · DMG ${s(t.damage??"—")}`}function mt(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function ht(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function yt(e,t,a,n){const r=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
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
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${v(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${s(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${s(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${s(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${Qe(et(t))}</strong></span>
      </div>
    </div>
    ${r?`<form class="transfer-form" data-transfer-form="${a}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${n.records.filter(o=>o.id!==e.id).map(o=>`<option value="${s(o.id)}">${s(o.fields.name)}</option>`).join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${t[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`:""}`}function pt(e,t){const a=e.inventory??[],n=Je(Ze(a),e.fields.maxLoad),r=t.expandedInventories?.has(e.id)??!1,o=!a.length&&e.fields.maxLoad===void 0?"Empty":qe(a,e.fields.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${s(e.id)}" ${r?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${o}</span>
      </summary>
      <div class="inventory-editor">
        <div class="inventory-list" aria-label="${s(e.fields.name)} inventory">
          ${a.length?a.map((i,l)=>yt(e,i,l,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function vt(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.counts.get(e.id)??0;return`
    <details class="character-card" data-character-details="${s(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${s(e.fields.name)}</strong>
        <span>${qe(e.inventory,e.fields.maxLoad)}</span>
      </summary>
      <div class="character-card-body">
        <span>HP ${v(e.fields.hpCurrent)||"—"}/${v(e.fields.hpMax)||"—"} · ARM ${v(e.fields.armor)||"—"} · DMG ${s(e.fields.damage??"—")}</span>
        <span>${n} linked token${n===1?"":"s"} in current scene · Updated ${s(new Date(e.updatedAt).toLocaleString())}</span>
        <div class="card-actions">
          <button type="button" class="secondary compact" data-edit-character="${s(e.id)}">Edit Character</button>
          ${t.role==="GM"?`<button type="button" class="danger compact" data-delete-character="${s(e.id)}">Delete</button>`:""}
        </div>
        ${pt(e,t)}
      </div>
    </details>`}function ft(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${s(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${s(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${Fe(e.editing.fields,"manager-","character")}
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
      ${t?`${e.role==="GM"?ht(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${s(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>vt(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}function gt(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function B(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function Me(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?n:void 0}function q(e,t){return String(e.get(t)??"").trim()||void 0}function bt(e,t,a){const n=a?{...t}:{};if(n.hpCurrent=B(e,"hpCurrent"),n.hpMax=B(e,"hpMax"),a)return n;n.tags=q(e,"tags"),n.hpBase=B(e,"hpBase"),n.maxLoad=Me(e,"maxLoad"),n.loadBase=B(e,"loadBase"),n.armor=B(e,"armor"),n.damage=q(e,"damage"),n.damageDescription=q(e,"damageDescription"),n.damageTags=q(e,"damageTags"),n.instinct=q(e,"instinct"),n.moves=q(e,"moves"),n.treasure=q(e,"treasure"),n.level=B(e,"level"),n.xp=B(e,"xp");const r=De();for(let i=0;i<r.length;i+=1)r[i]=Me(e,`score-${i}`)??null;n.scores=tt(r);const o={};for(const i of te)e.get(`condition-${i}`)==="on"&&(o[i]=-1);return n.conditions=at(o),n.alignment=q(e,"alignment"),n.visibleToPlayers=e.get("visibleToPlayers")==="on",n}function Ge(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...bt(e,t,a)}}function be(e){const t=e[de];return typeof t=="boolean"?t:!0}function wt(e,t){return nt(e)?e:{visibleToPlayers:t}}async function kt(e,t){await e({[de]:t})}const N={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,settings:!1,characters:!1},Ye=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],Ve=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function me(e,t,a){return`
    <div class="section-heading">
      <h2>${e}</h2>
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        (${a?"collapse":"expand"})
      </button>
    </div>`}function Ee(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <h3>${e}</h3>
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          (${a?"collapse":"expand"})
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(r=>`<button type="button" class="move-link" data-move="${r.id}">${r.name}</button>`).join("")}</div>`:""}
    </section>`}function $t(e,t,a,n=N,r="",o=""){const i=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section">
        ${me("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section">
        ${me("Moves","moves",n.moves)}
        ${n.moves?`${Ee("Basic Moves","basicMoves",n.basicMoves,Ye)}
        ${Ee("Special Moves","specialMoves",n.specialMoves,Ve)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section">
        ${me("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${i}" title="${i}" ${a?"disabled":""}>
            ${ot(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>`:""}
      </section>`:""}
      ${r}
      ${o?`<p class="extension-version">version ${o}</p>`:""}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`}function Ie(e){const t=e[Ne];return typeof t=="boolean"?t:!0}async function Ct(e,t){await e({[Ne]:t})}const Y=document.querySelector("#app"),J=new URLSearchParams(window.location.search),_=J.get("itemId"),je=J.get("view")??"edit",Te=J.get("preview");function oe(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function x(e,t){return e instanceof Error?e.message:t}function b(e,t){d.isAvailable&&d.notification.show(e,t)}function we(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=st(t.value);const a=lt(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function Ue(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>we(e))}function C(e,t){const a=e.elements.namedItem(t);if(!(!(a instanceof HTMLInputElement)||a.value.trim()===""))return Number.isFinite(a.valueAsNumber)?a.valueAsNumber:void 0}function _e(e){const t=e.elements.namedItem("hpMax"),a=e.elements.namedItem("maxLoad"),n=e.querySelector("[data-calculated-hp]"),r=e.querySelector("[data-calculated-load]");if(!(t instanceof HTMLInputElement))return;const o=()=>{for(let D=0;D<6;D+=1){const O=C(e,`score-${D}`),c=e.querySelector(`[data-score-modifier="${D}"]`);c&&(c.textContent=Oe(Ae(O)))}const l=ye(C(e,"hpBase"),C(e,"score-2")),L=pe(C(e,"loadBase"),C(e,"score-0"));n&&(n.textContent=`Calculated: ${l??"—"}`),r&&(r.textContent=`Calculated: ${L??"—"}`),t.classList.toggle("calculation-mismatch",Le(C(e,"hpMax"),l)),a instanceof HTMLInputElement&&a.classList.toggle("calculation-mismatch",Le(C(e,"maxLoad"),L))},i=(l,L,D,O)=>{const c=e.elements.namedItem(l);!(c instanceof HTMLInputElement)||!(L instanceof HTMLInputElement)||(c.dataset.lastPromptedValue=c.value,c.addEventListener("blur",()=>{const ze=c.dataset.lastPromptedValue??"",ue=O();if(!ct(ze,c.value,C(e,L.name),ue)){c.dataset.lastPromptedValue=c.value,o();return}c.dataset.lastPromptedValue=c.value;const Ke=L.value.trim()||"blank";window.confirm(`${D} changed. Recalculate ${L.name==="hpMax"?"Maximum HP":"Maximum Load"} from ${Ke} to ${ue}?`)&&(L.value=String(ue)),o()}))};for(const l of e.querySelectorAll('[name^="score-"], [name="hpBase"], [name="loadBase"], [name="hpMax"], [name="maxLoad"]'))l.addEventListener("input",o);i("score-2",t,"Constitution",()=>ye(C(e,"hpBase"),C(e,"score-2"))),i("score-0",a,"Strength",()=>pe(C(e,"loadBase"),C(e,"score-0"))),o()}function St(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","hpBase","maxLoad","loadBase","armor","damage","damageDescription","damageTags","instinct","moves","treasure","level","xp","scores","conditions","alignment","visibleToPlayers"],r={};for(const o of n)JSON.stringify(e[o])!==JSON.stringify(t[o])&&(r[o]=t[o]);return r}let S="PLAYER",F={},ne=!1,U,re,f,V=[],ke=new Map,Q,ve=!1,E=!1,w,fe=!1,p,z,P;const ie=new Set,se=new Set,$e="dwtools/home-sections";function xt(){try{const e=JSON.parse(localStorage.getItem($e)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:N.agenda,moves:typeof e.moves=="boolean"?e.moves:N.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:N.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:N.specialMoves,settings:typeof e.settings=="boolean"?e.settings:N.settings,characters:typeof e.characters=="boolean"?e.characters:N.characters}}catch{return{...N}}}let W=xt();function Lt(){return{records:V,counts:ke,role:S,usage:Q,loading:ve,saving:E,error:w,editing:p,expandedCharacters:ie,expandedInventories:se,draftCharacterId:z,transfer:P}}function u(){const e=be(F),t=ft(Lt(),W.characters||!!p);Y.innerHTML=$t(S,e,ne,W,t,dt),document.querySelector("#default-visibility")?.addEventListener("click",()=>{Dt()});for(const a of document.querySelectorAll("[data-toggle-section]"))a.addEventListener("click",()=>{const n=a.dataset.toggleSection;W={...W,[n]:!W[n]},localStorage.setItem($e,JSON.stringify(W)),u()});for(const a of document.querySelectorAll("[data-move]"))a.addEventListener("click",()=>{const n=[...Ye,...Ve].find(l=>l.id===a.dataset.move),r=document.querySelector("#move-dialog"),o=document.querySelector("#move-dialog-title"),i=document.querySelector("#move-dialog-text");!n||!r||!o||!i||(o.textContent=n.name,i.textContent=n.text,r.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),Mt()}function Mt(){document.querySelector("#manager-create")?.addEventListener("click",()=>{w=void 0,p={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},W.characters=!0,localStorage.setItem($e,JSON.stringify(W)),u()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{p=void 0,w=void 0,u()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=V.find(n=>n.id===t.dataset.editCharacter);a&&(w=void 0,p={kind:"edit",id:a.id,fields:a.fields},u())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{Tt(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(Ue(e),_e(e),e.addEventListener("submit",t=>{t.preventDefault(),It(e)}));for(const t of document.querySelectorAll("[data-character-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.characterDetails;a&&(t.open?ie.add(a):ie.delete(a))});for(const t of document.querySelectorAll("[data-inventory-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.inventoryDetails;a&&(t.open?se.add(a):se.delete(a))});Et()}function A(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return V.find(a=>a.id===t)}function j(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function H(e,t,a){if(!E){E=!0,w=void 0,a?le(a):u();try{await e(),z=void 0,P=void 0,await T(!1),t&&b(t,"SUCCESS"),Q?.nearLimit&&b("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const r=x(n,"DWTools could not update this inventory.");await T(!1),w=r}finally{E=!1,a?le(a):u()}}}function le(e,t=!1){u(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(r=>r.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function he(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function Et(){if(!f)return;for(const a of document.querySelectorAll("[data-inventory-name]")){const n=A(a),r=Number(a.dataset.inventoryName),o=n&&j(n,r);!n||!o||he(a,o.expected[0],()=>{if(a.value===o.expected[0])return;const i=[a.value,o.expected[1],o.expected[2]];H(()=>f.updateInventoryItem(n.id,o,i))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=A(a),r=Number(a.dataset.inventoryWeight),o=n&&j(n,r);if(!n||!o)continue;const i=String(o.expected[1]);he(a,i,()=>{if(a.value===i)return;const l=[o.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),o.expected[2]];H(()=>f.updateInventoryItem(n.id,o,l))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=A(a),r=Number(a.dataset.inventoryCount),o=n&&j(n,r);if(!n||!o)continue;const i=String(o.expected[2]);he(a,i,()=>{if(a.value===i)return;const l=a.value.trim()===""?Number.NaN:Number(a.value);H(()=>f.changeInventoryItemCount(n.id,o,l-o.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=A(a),r=Number(a.dataset.inventoryAdjust),o=n&&j(n,r),i=Number(a.dataset.change);!n||!o||H(()=>f.changeInventoryItemCount(n.id,o,i))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=A(a),r=Number(a.dataset.inventoryRemove),o=n&&j(n,r);!n||!o||H(()=>f.removeInventoryItem(n.id,o))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=A(a);n&&(z=n.id,ie.add(n.id),se.add(n.id),le(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=z;z=void 0,a?le(a):u()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=A(e);if(!n||!e.reportValidity())return;const r=new FormData(e),o=[String(r.get("name")??""),Number(r.get("weight")),Number(r.get("count"))];H(()=>f.addInventoryItem(n.id,o),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=A(a),r=Number(a.dataset.inventoryTransfer),o=n&&j(n,r);!n||!o||(P={sourceCharacterId:n.id,sourceIndex:r,expected:o.expected},u())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{P=void 0,u()});const t=document.querySelector("[data-transfer-form]");t&&P&&t.addEventListener("submit",a=>{if(a.preventDefault(),!P||!t.reportValidity())return;const n=new FormData(t),r=String(n.get("destination")??""),o=Number(n.get("count")),i=P;H(()=>f.transferInventoryItem(i.sourceCharacterId,r,{sourceIndex:i.sourceIndex,expected:i.expected},o),"Item transferred.")})}async function T(e=!0){if(!(!U||!re||!f)){ve=!0,w=void 0,e&&!p&&u();try{if(S==="GM"&&!fe){const t=await f.cleanupLegacyTombstones();fe=!0,t&&b(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[V,ke,Q]=await Promise.all([f.listAccessible(),it(re.scene),S==="GM"?U.estimateUsage():Promise.resolve(void 0)]),S==="PLAYER"&&p?.kind==="edit"&&!V.some(t=>t.id===p?.id)&&(p=void 0,w="You no longer control a token linked to the Character being edited.")}catch(t){w=x(t,"DWTools could not load character records.")}finally{ve=!1,e&&!p&&u()}}}async function It(e){if(!(!p||!f||E)){if(!we(e)||!e.reportValidity()){w="Correct the highlighted character fields before saving.",u();return}E=!0,w=void 0,u();try{const t=He(Ge(new FormData(e),p.fields,!1));p.kind==="create"?(await f.create(t),b("Character record created.","SUCCESS")):(await f.save(p.id,t),b("Character record saved.","SUCCESS")),p=void 0,await T(!1),Q?.nearLimit&&b("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){w=x(t,"DWTools could not save the record.")}finally{E=!1,u()}}}async function Tt(e){if(!e||!f||E)return;const t=V.find(a=>a.id===e);if(t&&window.confirm(mt(t.fields.name))){E=!0,w=void 0,u();try{await f.delete(e),b("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await T(!1)}catch(a){w=x(a,"DWTools could not delete the record.")}finally{E=!1,u()}}}async function Dt(){if(S!=="GM"||ne)return;const e=!be(F);ne=!0,u();try{await kt(t=>d.room.setMetadata(t),e),F={...F,[de]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),b("DWTools could not save the default overlay visibility.","ERROR")}finally{ne=!1,u()}}async function Ot(){try{await We()}catch(t){console.error("DWTools metadata namespace migration failed",t),Y.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',b("DWTools could not migrate its saved data.","ERROR");return}U=Pe(),re=Re(U),f=rt(U,re),[S,F]=await Promise.all([d.player.getRole(),d.room.getMetadata(),d.theme.getTheme().then(oe)]),await T(!1),u();const e=[d.room.onMetadataChange(t=>{F=t,u()}),U.subscribe(t=>{t.some(a=>a.lookup.status==="deleted")&&(fe=!1),T(S==="PLAYER"||!p)}),d.player.onChange(t=>{S=t.role,p=void 0,z=void 0,P=void 0,T()}),d.scene.items.onChange(()=>{T(S==="PLAYER"||!p)}),d.room.onPermissionsChange(()=>{T(S==="PLAYER"||!p)}),d.theme.onChange(oe)];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let R,k,m,$,M={status:"missing"},ce=[],ee=!1,K="",h=!1,I=!0,X=!1,g,Ce=!1;function qt(e){const t=G(e);let a,n;t?M.status==="active"?(a=`Character record: <strong>${s(M.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${M.status==="malformed"?"malformed":M.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const r=K.trim().toLocaleLowerCase(),o=r?ce.filter(l=>l.fields.name.toLocaleLowerCase().includes(r)||l.fields.tags?.toLocaleLowerCase().includes(r)):ce,i=ee?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${I?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${s(K)}"></label>
        <div class="link-results">
          ${o.length?o.map(l=>`
                <button type="button" data-link-record="${s(l.id)}" data-link-search="${s(`${l.fields.name} ${l.fields.tags??""}`.toLocaleLowerCase())}">
                  ${ut(l)}
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
        <input id="overwrite-label" type="checkbox" ${I?"checked":""} ${X?"disabled":""}>
        Overwrite label
      </label>
      ${i}
    </section>`}function y(){if(!m||!$)return;const e=je==="hp";Y.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${s($.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${qt(m)}
      ${g?`<p class="inline-error">${s(g)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${v($.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${v($.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(r=>`<button type="button" data-hp="${r}">${r>0?"+":""}${r}</button>`).join("")}
          </div>`:Fe($)}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${h?"disabled":""}>${h?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const r=gt(a.value,n.value);r!==null&&(n.value=r)}),Ue(t),_e(t);for(const r of t.querySelectorAll("[data-hp]"))r.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(r.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{d.popover.close(ge)}),document.querySelector("#remove")?.addEventListener("click",()=>{Bt()}),document.querySelector("#link-character")?.addEventListener("click",()=>{At()}),document.querySelector("#overwrite-label")?.addEventListener("change",r=>{Nt(r.currentTarget.checked)});for(const r of document.querySelectorAll("#create-character"))r.addEventListener("click",()=>{Pt()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Rt()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{ee=!1,K="",y()}),document.querySelector("#link-search")?.addEventListener("input",r=>{K=r.currentTarget.value;const o=K.trim().toLocaleLowerCase();for(const i of document.querySelectorAll("[data-link-search]"))i.hidden=!String(i.dataset.linkSearch).includes(o)});for(const r of document.querySelectorAll("[data-link-record]"))r.addEventListener("click",()=>{Wt(r.dataset.linkRecord)});t.addEventListener("submit",r=>{r.preventDefault(),Ht(t)})}async function Z(){if(!_||!k||!R)return;const e=await k.getItem(_);if(!e){Y.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}Ce=ae in e.metadata,m=e,$=Be(e);const t=G(e);M=t?await R.inspect(t.characterId):{status:"missing"},M.status==="active"&&($=M.record.fields),y()}async function At(){if(!(!R||h)){h=!0,g=void 0,y();try{ce=await R.list(),ee=!0}catch(e){g=x(e,"DWTools could not load character records.")}finally{h=!1,y()}}}async function Nt(e){if(X)return;const t=I;I=e,X=!0,y();try{await Ct(a=>d.room.setMetadata(a),e)}catch(a){I=t,g=x(a,"DWTools could not save the overwrite-label setting.")}finally{X=!1,y()}}async function Wt(e){if(!e||!k||!m||h)return;const t=ce.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${I?"overwritten":"retained"}.`)){h=!0,g=void 0,y();try{await k.linkToExistingCharacter(m.id,e,I),b(`Linked to ${t.fields.name}.`,"SUCCESS"),ee=!1,await Z()}catch(a){g=x(a,"DWTools could not link the character.")}finally{h=!1,y()}}}async function Pt(){if(!(!k||!m||h)){h=!0,g=void 0,y();try{const{record:e}=await k.createAndLinkCharacter(m.id);b(`Created and linked ${e.fields.name}.`,"SUCCESS"),ee=!1,await Z()}catch(e){g=x(e,"DWTools could not create and link the character.")}finally{h=!1,y()}}}async function Rt(){if(!(!k||!m||h)){h=!0,g=void 0,y();try{await k.unlinkCharacter(m.id),b("Character unlinked; creature fields were retained.","SUCCESS"),await Z()}catch(e){g=x(e,"DWTools could not unlink the character.")}finally{h=!1,y()}}}async function Bt(){if(!(!k||!m||h||G(m)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){h=!0,y();try{await k.removeCreatureData(m.id),await d.popover.close(ge)}catch(t){g=x(t,"DWTools could not remove the creature data."),h=!1,y()}}}async function Ht(e){if(!(!k||!m||!$||h)){if(!we(e)||!e.reportValidity()){g="Correct the highlighted creature fields before saving.",y();return}h=!0,g=void 0,y();try{const t=je==="hp",a=He(Ge(new FormData(e),$,t));let n=St($,a,t);!Ce&&!G(m)&&(n=a),Object.keys(n).length&&await k.updateCreatureFields(m.id,n),b(G(m)?"Character record saved.":"Creature saved.","SUCCESS"),await d.popover.close(ge)}catch(t){g=x(t,"DWTools could not save the creature."),h=!1,y()}}}async function Ft(){if(!_)return;try{await We()}catch(o){console.error("DWTools metadata namespace migration failed",o),Y.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',b("DWTools could not migrate its saved data.","ERROR");return}R=Pe(),k=Re(R);const[e,t]=await Promise.all([k.getItem(_),d.room.getMetadata().catch(o=>(console.warn("DWTools could not load room visibility settings",o),{})),d.theme.getTheme().then(oe)]);if(!e){Y.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}Ce=ae in e.metadata;const a=wt(e.metadata[ae],be(t));I=Ie(t),m={...e,metadata:{...e.metadata,[ae]:a}},$=Be(m);const n=G(m);M=n?await R.inspect(n.characterId):{status:"missing"},M.status==="active"&&($=M.record.fields),y();const r=[R.subscribe(o=>{const i=m&&G(m);i&&o.some(l=>l.characterId===i.characterId)&&!h&&Z()}),d.scene.items.onChange(o=>{o.find(l=>l.id===_)&&!h&&Z()}),d.room.onMetadataChange(o=>{X||(I=Ie(o),y())}),d.theme.onChange(oe)];window.addEventListener("unload",()=>{for(const o of r)o()},{once:!0})}Te==="home"?(S="GM",F={[de]:J.get("default")!=="hidden"},V=[{schemaVersion:3,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],ke=new Map([["preview-active",2]]),Q={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},u()):Te==="editor"?(I=J.get("overwriteLabel")?.toLocaleLowerCase()!=="false",m={id:"preview",name:"Frogman",metadata:{}},$={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},y()):_?d.isAvailable?d.onReady(()=>{Ft()}):Y.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(u(),d.isAvailable&&d.onReady(()=>{Ot()}));
