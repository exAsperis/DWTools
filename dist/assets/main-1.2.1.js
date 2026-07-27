import{l as pe,k as Le,t as Me,v as Ee,w as De,x as te,i as Te,j as Ie,O as c,u as se,h as ve,m as fe,y as Oe,C as z,z as ge,n as A,A as be,B as qe,F as We,G as Ae}from"./obrCharacterServices-1.2.1.js";function i(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function v(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function we(e,t=""){const a=n=>`${t}${n}`;return`
    <label>Name<input id="${a("name")}" name="name" type="text" maxlength="120" required value="${i(e.name)}"></label>
    <label>Tags<input id="${a("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${i(e.tags??"")}"></label>
    <div class="vitals-row">
      <label>Armor<input id="${a("armor")}" name="armor" type="number" step="1" value="${v(e.armor)}"></label>
      <label>Current HP<input id="${a("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${v(e.hpCurrent)}"></label>
      <span class="slash">/</span>
      <label>Maximum HP<input id="${a("hpMax")}" name="hpMax" type="number" min="0" step="1" value="${v(e.hpMax)}"></label>
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
    </label>`}function Pe(e){const t=e.fields;return`${i(t.name)} · HP ${v(t.hpCurrent)||"—"}/${v(t.hpMax)||"—"} · ARM ${v(t.armor)||"—"} · DMG ${i(t.damage??"—")}`}function Ne(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function Re(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function Fe(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
    <div class="inventory-row" data-inventory-row="${a}">
      <div class="inventory-primary">
        <input class="inventory-inline-input inventory-name" data-inventory-name="${a}" type="text" maxlength="120" value="${i(t[0])}" aria-label="Item name">
        <div class="inventory-actions">
          <button type="button" class="danger compact" data-inventory-remove="${a}" aria-label="Remove ${i(t[0])}">Remove</button>
          ${n.role==="GM"?`<button type="button" class="secondary compact" data-inventory-transfer="${a}">Transfer</button>`:""}
        </div>
      </div>
      <div class="inventory-metrics">
        <label class="inventory-metric">wt/ea:
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${v(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${i(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${i(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${i(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${Ee(De(t))}</strong></span>
      </div>
    </div>
    ${o?`<form class="transfer-form" data-transfer-form="${a}">
          <label>Destination
            <select name="destination" required>
              <option value="">Choose a Character</option>
              ${n.records.filter(r=>r.id!==e.id).map(r=>`<option value="${i(r.id)}">${i(r.fields.name)}</option>`).join("")}
            </select>
          </label>
          <label>Count
            <input name="count" type="number" min="1" max="${t[2]}" step="1" value="1" required>
          </label>
          <div class="manager-actions">
            <button type="button" class="secondary compact" data-transfer-cancel>Cancel</button>
            <button type="submit" class="primary compact">Transfer</button>
          </div>
        </form>`:""}`}function He(e,t){const a=e.inventory??[],n=Le(Me(a),e.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.maxLoad===void 0?"Empty":pe(a,e.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${i(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <label class="max-load">Maximum Load
          <input data-max-load type="number" min="0" step="any" value="${v(e.maxLoad)}" placeholder="No maximum">
        </label>
        <div class="inventory-list" aria-label="${i(e.fields.name)} inventory">
          ${a.length?a.map((s,m)=>Fe(e,s,m,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function Ge(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.counts.get(e.id)??0;return`
    <details class="character-card" data-character-details="${i(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${i(e.fields.name)}</strong>
        <span>${pe(e.inventory,e.maxLoad)}</span>
      </summary>
      <div class="character-card-body">
        <span>HP ${v(e.fields.hpCurrent)||"—"}/${v(e.fields.hpMax)||"—"} · ARM ${v(e.fields.armor)||"—"} · DMG ${i(e.fields.damage??"—")}</span>
        <span>${n} linked token${n===1?"":"s"} in current scene · Updated ${i(new Date(e.updatedAt).toLocaleString())}</span>
        <div class="card-actions">
          <button type="button" class="secondary compact" data-edit-character="${i(e.id)}">Edit Character</button>
          ${t.role==="GM"?`<button type="button" class="danger compact" data-delete-character="${i(e.id)}">Delete</button>`:""}
        </div>
        ${He(e,t)}
      </div>
    </details>`}function je(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${i(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${we(e.editing.fields,"manager-")}
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
      ${t?`${e.role==="GM"?Re(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>Ge(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}function Be(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function ne(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function q(e,t){return String(e.get(t)??"").trim()||void 0}function Ue(e,t,a){const n=a?{...t}:{};return n.hpCurrent=ne(e,"hpCurrent"),n.hpMax=ne(e,"hpMax"),a||(n.tags=q(e,"tags"),n.armor=ne(e,"armor"),n.damage=q(e,"damage"),n.damageDescription=q(e,"damageDescription"),n.damageTags=q(e,"damageTags"),n.instinct=q(e,"instinct"),n.moves=q(e,"moves"),n.treasure=q(e,"treasure"),n.visibleToPlayers=e.get("visibleToPlayers")==="on"),n}function ke(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Ue(e,t,a)}}function le(e){const t=e[te];return typeof t=="boolean"?t:!0}function Ye(e,t){return Te(e)?e:{visibleToPlayers:t}}async function Ve(e,t){await e({[te]:t})}const D={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,settings:!1,characters:!1},$e=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],Ce=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function oe(e,t,a){return`
    <div class="section-heading">
      <h2>${e}</h2>
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        (${a?"collapse":"expand"})
      </button>
    </div>`}function he(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <h3>${e}</h3>
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          (${a?"collapse":"expand"})
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function ze(e,t,a,n=D,o=""){const r=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section">
        ${oe("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section">
        ${oe("Moves","moves",n.moves)}
        ${n.moves?`${he("Basic Moves","basicMoves",n.basicMoves,$e)}
        ${he("Special Moves","specialMoves",n.specialMoves,Ce)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section">
        ${oe("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${r}" title="${r}" ${a?"disabled":""}>
            ${Ie(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>`:""}
      </section>`:""}
      ${o}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`}const B=document.querySelector("#app"),ae=new URLSearchParams(window.location.search),F=ae.get("itemId"),Se=ae.get("view")??"edit",ye=ae.get("preview");function K(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function x(e,t){return e instanceof Error?e.message:t}function $(e,t){c.isAvailable&&c.notification.show(e,t)}function ce(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=We(t.value);const a=Ae(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function xe(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>ce(e))}function _e(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","armor","damage","damageDescription","damageTags","instinct","moves","treasure","visibleToPlayers"],o={};for(const r of n)e[r]!==t[r]&&(o[r]=t[r]);return o}let k="PLAYER",W={},_=!1,R,X,y,P=[],de=new Map,U,re=!1,S=!1,f,ie=!1,h,H,I;const J=new Set,Z=new Set,ue="dwtools/home-sections";function Ke(){try{const e=JSON.parse(localStorage.getItem(ue)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:D.agenda,moves:typeof e.moves=="boolean"?e.moves:D.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:D.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:D.specialMoves,settings:typeof e.settings=="boolean"?e.settings:D.settings,characters:typeof e.characters=="boolean"?e.characters:D.characters}}catch{return{...D}}}let T=Ke();function Xe(){return{records:P,counts:de,role:k,usage:U,loading:re,saving:S,error:f,editing:h,expandedCharacters:J,expandedInventories:Z,draftCharacterId:H,transfer:I}}function l(){const e=le(W),t=je(Xe(),T.characters||!!h);B.innerHTML=ze(k,e,_,T,t),document.querySelector("#default-visibility")?.addEventListener("click",()=>{tt()});for(const a of document.querySelectorAll("[data-toggle-section]"))a.addEventListener("click",()=>{const n=a.dataset.toggleSection;T={...T,[n]:!T[n]},localStorage.setItem(ue,JSON.stringify(T)),l()});for(const a of document.querySelectorAll("[data-move]"))a.addEventListener("click",()=>{const n=[...$e,...Ce].find(m=>m.id===a.dataset.move),o=document.querySelector("#move-dialog"),r=document.querySelector("#move-dialog-title"),s=document.querySelector("#move-dialog-text");!n||!o||!r||!s||(r.textContent=n.name,s.textContent=n.text,o.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),Je()}function Je(){document.querySelector("#manager-create")?.addEventListener("click",()=>{f=void 0,h={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},T.characters=!0,localStorage.setItem(ue,JSON.stringify(T)),l()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{h=void 0,f=void 0,l()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=P.find(n=>n.id===t.dataset.editCharacter);a&&(f=void 0,h={kind:"edit",id:a.id,fields:a.fields},l())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{et(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(xe(e),e.addEventListener("submit",t=>{t.preventDefault(),Qe(e)}));for(const t of document.querySelectorAll("[data-character-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.characterDetails;a&&(t.open?J.add(a):J.delete(a))});for(const t of document.querySelectorAll("[data-inventory-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.inventoryDetails;a&&(t.open?Z.add(a):Z.delete(a))});Ze()}function L(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return P.find(a=>a.id===t)}function N(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function E(e,t,a){if(!S){S=!0,f=void 0,a?Q(a):l();try{await e(),H=void 0,I=void 0,await M(!1),t&&$(t,"SUCCESS"),U?.nearLimit&&$("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=x(n,"DWTools could not update this inventory.");await M(!1),f=o}finally{S=!1,a?Q(a):l()}}}function Q(e,t=!1){l(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function V(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function Ze(){if(!y)return;for(const a of document.querySelectorAll("[data-max-load]")){const n=L(a);if(!n)continue;const o=v(n.maxLoad);V(a,o,()=>{if(a.value===o)return;const r=a.value.trim()===""?void 0:Number(a.value);E(()=>y.setMaxLoad(n.id,r),"Maximum Load saved.")})}for(const a of document.querySelectorAll("[data-inventory-name]")){const n=L(a),o=Number(a.dataset.inventoryName),r=n&&N(n,o);!n||!r||V(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const s=[a.value,r.expected[1],r.expected[2]];E(()=>y.updateInventoryItem(n.id,r,s))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=L(a),o=Number(a.dataset.inventoryWeight),r=n&&N(n,o);if(!n||!r)continue;const s=String(r.expected[1]);V(a,s,()=>{if(a.value===s)return;const m=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];E(()=>y.updateInventoryItem(n.id,r,m))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=L(a),o=Number(a.dataset.inventoryCount),r=n&&N(n,o);if(!n||!r)continue;const s=String(r.expected[2]);V(a,s,()=>{if(a.value===s)return;const m=a.value.trim()===""?Number.NaN:Number(a.value);E(()=>y.changeInventoryItemCount(n.id,r,m-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=L(a),o=Number(a.dataset.inventoryAdjust),r=n&&N(n,o),s=Number(a.dataset.change);!n||!r||E(()=>y.changeInventoryItemCount(n.id,r,s))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=L(a),o=Number(a.dataset.inventoryRemove),r=n&&N(n,o);!n||!r||E(()=>y.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=L(a);n&&(H=n.id,J.add(n.id),Z.add(n.id),Q(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=H;H=void 0,a?Q(a):l()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=L(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];E(()=>y.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=L(a),o=Number(a.dataset.inventoryTransfer),r=n&&N(n,o);!n||!r||(I={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},l())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{I=void 0,l()});const t=document.querySelector("[data-transfer-form]");t&&I&&t.addEventListener("submit",a=>{if(a.preventDefault(),!I||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),s=I;E(()=>y.transferInventoryItem(s.sourceCharacterId,o,{sourceIndex:s.sourceIndex,expected:s.expected},r),"Item transferred.")})}async function M(e=!0){if(!(!R||!X||!y)){re=!0,f=void 0,e&&!h&&l();try{if(k==="GM"&&!ie){const t=await y.cleanupLegacyTombstones();ie=!0,t&&$(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[P,de,U]=await Promise.all([y.listAccessible(),qe(X.scene),k==="GM"?R.estimateUsage():Promise.resolve(void 0)]),k==="PLAYER"&&h?.kind==="edit"&&!P.some(t=>t.id===h?.id)&&(h=void 0,f="You no longer control a token linked to the Character being edited.")}catch(t){f=x(t,"DWTools could not load character records.")}finally{re=!1,e&&!h&&l()}}}async function Qe(e){if(!(!h||!y||S)){if(!ce(e)||!e.reportValidity()){f="Correct the highlighted character fields before saving.",l();return}S=!0,f=void 0,l();try{const t=be(ke(new FormData(e),h.fields,!1));h.kind==="create"?(await y.create(t),$("Character record created.","SUCCESS")):(await y.save(h.id,t),$("Character record saved.","SUCCESS")),h=void 0,await M(!1),U?.nearLimit&&$("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){f=x(t,"DWTools could not save the record.")}finally{S=!1,l()}}}async function et(e){if(!e||!y||S)return;const t=P.find(a=>a.id===e);if(t&&window.confirm(Ne(t.fields.name))){S=!0,f=void 0,l();try{await y.delete(e),$("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await M(!1)}catch(a){f=x(a,"DWTools could not delete the record.")}finally{S=!1,l()}}}async function tt(){if(k!=="GM"||_)return;const e=!le(W);_=!0,l();try{await Ve(t=>c.room.setMetadata(t),e),W={...W,[te]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),$("DWTools could not save the default overlay visibility.","ERROR")}finally{_=!1,l()}}async function at(){R=ve(),X=fe(R),y=Oe(R,X),[k,W]=await Promise.all([c.player.getRole(),c.room.getMetadata(),c.theme.getTheme().then(K)]),await M(!1),l();const e=[c.room.onMetadataChange(t=>{W=t,l()}),R.subscribe(t=>{t.some(a=>a.lookup.status==="deleted")&&(ie=!1),M(k==="PLAYER"||!h)}),c.player.onChange(t=>{k=t.role,h=void 0,H=void 0,I=void 0,M()}),c.scene.items.onChange(()=>{M(k==="PLAYER"||!h)}),c.room.onPermissionsChange(()=>{M(k==="PLAYER"||!h)}),c.theme.onChange(K)];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let O,b,d,w,C={status:"missing"},ee=[],Y=!1,G="",u=!1,g,me=!1;function nt(e){const t=A(e);let a,n;t?C.status==="active"?(a=`Character record: <strong>${i(C.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${C.status==="malformed"?"malformed":C.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=G.trim().toLocaleLowerCase(),r=o?ee.filter(m=>m.fields.name.toLocaleLowerCase().includes(o)||m.fields.tags?.toLocaleLowerCase().includes(o)):ee,s=Y?`
      <div class="link-picker">
        <p>Selecting an existing record replaces every persistent DWTools field on this token.</p>
        <label>Search characters<input id="link-search" type="search" value="${i(G)}"></label>
        <div class="link-results">
          ${r.length?r.map(m=>`
                <button type="button" data-link-record="${i(m.id)}" data-link-search="${i(`${m.fields.name} ${m.fields.tags??""}`.toLocaleLowerCase())}">
                  ${Pe(m)}
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
      ${s}
    </section>`}function p(){if(!d||!w)return;const e=Se==="hp";B.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${i(w.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${nt(d)}
      ${g?`<p class="inline-error">${i(g)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${v(w.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${v(w.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:we(w)}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${u?"disabled":""}>${u?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=Be(a.value,n.value);o!==null&&(n.value=o)}),xe(t);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{c.popover.close(se)}),document.querySelector("#remove")?.addEventListener("click",()=>{lt()}),document.querySelector("#link-character")?.addEventListener("click",()=>{ot()});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{it()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{st()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{Y=!1,G="",p()}),document.querySelector("#link-search")?.addEventListener("input",o=>{G=o.currentTarget.value;const r=G.trim().toLocaleLowerCase();for(const s of document.querySelectorAll("[data-link-search]"))s.hidden=!String(s.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{rt(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),ct(t)})}async function j(){if(!F||!b||!O)return;const e=await b.getItem(F);if(!e){B.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}me=z in e.metadata,d=e,w=ge(e);const t=A(e);C=t?await O.inspect(t.characterId):{status:"missing"},C.status==="active"&&(w=C.record.fields),p()}async function ot(){if(!(!O||u)){u=!0,g=void 0,p();try{ee=await O.list(),Y=!0}catch(e){g=x(e,"DWTools could not load character records.")}finally{u=!1,p()}}}async function rt(e){if(!e||!b||!d||u)return;const t=ee.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools fields will be replaced by the latest character record.`)){u=!0,g=void 0,p();try{await b.linkToExistingCharacter(d.id,e),$(`Linked to ${t.fields.name}.`,"SUCCESS"),Y=!1,await j()}catch(a){g=x(a,"DWTools could not link the character.")}finally{u=!1,p()}}}async function it(){if(!(!b||!d||u)){u=!0,g=void 0,p();try{const{record:e}=await b.createAndLinkCharacter(d.id);$(`Created and linked ${e.fields.name}.`,"SUCCESS"),Y=!1,await j()}catch(e){g=x(e,"DWTools could not create and link the character.")}finally{u=!1,p()}}}async function st(){if(!(!b||!d||u)){u=!0,g=void 0,p();try{await b.unlinkCharacter(d.id),$("Character unlinked; creature fields were retained.","SUCCESS"),await j()}catch(e){g=x(e,"DWTools could not unlink the character.")}finally{u=!1,p()}}}async function lt(){if(!(!b||!d||u||A(d)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){u=!0,p();try{await b.removeCreatureData(d.id),await c.popover.close(se)}catch(t){g=x(t,"DWTools could not remove the creature data."),u=!1,p()}}}async function ct(e){if(!(!b||!d||!w||u)){if(!ce(e)||!e.reportValidity()){g="Correct the highlighted creature fields before saving.",p();return}u=!0,g=void 0,p();try{const t=Se==="hp",a=be(ke(new FormData(e),w,t));let n=_e(w,a,t);!me&&!A(d)&&(n=a),Object.keys(n).length&&await b.updateCreatureFields(d.id,n),$(A(d)?"Character record saved.":"Creature saved.","SUCCESS"),await c.popover.close(se)}catch(t){g=x(t,"DWTools could not save the creature."),u=!1,p()}}}async function dt(){if(!F)return;O=ve(),b=fe(O);const[e,t]=await Promise.all([b.getItem(F),c.room.getMetadata().catch(r=>(console.warn("DWTools could not load room visibility settings",r),{})),c.theme.getTheme().then(K)]);if(!e){B.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}me=z in e.metadata;const a=Ye(e.metadata[z],le(t));d={...e,metadata:{...e.metadata,[z]:a}},w=ge(d);const n=A(d);C=n?await O.inspect(n.characterId):{status:"missing"},C.status==="active"&&(w=C.record.fields),p();const o=[O.subscribe(r=>{const s=d&&A(d);s&&r.some(m=>m.characterId===s.characterId)&&!u&&j()}),c.scene.items.onChange(r=>{r.find(m=>m.id===F)&&!u&&j()}),c.theme.onChange(K)];window.addEventListener("unload",()=>{for(const r of o)r()},{once:!0})}ye==="home"?(k="GM",W={[te]:ae.get("default")!=="hidden"},P=[{schemaVersion:2,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],de=new Map([["preview-active",2]]),U={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},l()):ye==="editor"?(d={id:"preview",name:"Frogman",metadata:{}},w={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},p()):F?c.isAvailable?c.onReady(()=>{dt()}):B.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(l(),c.isAvailable&&c.onReady(()=>{at()}));
