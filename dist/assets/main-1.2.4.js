import{q as ge,p as Ie,t as Oe,y as qe,z as We,A as oe,b as Ae,n as Re,B as be,O as l,E as ce,j as we,k as ke,r as $e,F as Ne,C as X,G as Ce,u as R,H as Se,I as Pe,J as Fe,K as He}from"./obrMetadataMigration-1.2.4.js";function i(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function f(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function xe(e,t=""){const a=n=>`${t}${n}`;return`
    <label>Name<input id="${a("name")}" name="name" type="text" maxlength="120" required value="${i(e.name)}"></label>
    <label>Tags<input id="${a("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${i(e.tags??"")}"></label>
    <div class="vitals-row">
      <label>Armor<input id="${a("armor")}" name="armor" type="number" step="1" value="${f(e.armor)}"></label>
      <label>Current HP<input id="${a("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${f(e.hpCurrent)}"></label>
      <span class="slash">/</span>
      <label>Maximum HP<input id="${a("hpMax")}" name="hpMax" type="number" min="0" step="1" value="${f(e.hpMax)}"></label>
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
    </label>`}function Ge(e){const t=e.fields;return`${i(t.name)} · HP ${f(t.hpCurrent)||"—"}/${f(t.hpMax)||"—"} · ARM ${f(t.armor)||"—"} · DMG ${i(t.damage??"—")}`}function Be(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function je(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function Ye(e,t,a,n){const o=n.role==="GM"&&n.transfer?.sourceCharacterId===e.id&&n.transfer.sourceIndex===a;return`
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
          <input class="inventory-inline-input inventory-weight" data-inventory-weight="${a}" type="number" min="0" step="any" value="${f(t[1])}" aria-label="Weight each">
        </label>
        <span class="inventory-metric inventory-count-label">ct:
          <span class="inventory-count">
            <button type="button" data-inventory-adjust="${a}" data-change="-1" aria-label="Decrease ${i(t[0])} count">−</button>
            <input class="inventory-inline-input" data-inventory-count="${a}" type="number" min="0" step="1" value="${t[2]}" aria-label="${i(t[0])} quantity or uses">
            <button type="button" data-inventory-adjust="${a}" data-change="1" aria-label="Increase ${i(t[0])} count">+</button>
          </span>
        </span>
        <span class="inventory-metric inventory-load">load: <strong>${qe(We(t))}</strong></span>
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
        </form>`:""}`}function Ue(e,t){const a=e.inventory??[],n=Ie(Oe(a),e.maxLoad),o=t.expandedInventories?.has(e.id)??!1,r=!a.length&&e.maxLoad===void 0?"Empty":ge(a,e.maxLoad);return`
    <details class="inventory-section ${n?"overloaded":""}" data-inventory-details="${i(e.id)}" ${o?"open":""}>
      <summary>
        <strong>Inventory</strong>
        <span class="inventory-summary ${n?"load-warning":""}">${r}</span>
      </summary>
      <div class="inventory-editor">
        <label class="max-load">Maximum Load
          <input data-max-load type="number" min="0" step="any" value="${f(e.maxLoad)}" placeholder="No maximum">
        </label>
        <div class="inventory-list" aria-label="${i(e.fields.name)} inventory">
          ${a.length?a.map((s,m)=>Ye(e,s,m,t)).join(""):'<p class="manager-status inventory-empty">No items.</p>'}
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
    </details>`}function Ve(e,t){const a=t.expandedCharacters?.has(e.id)??!1,n=t.counts.get(e.id)??0;return`
    <details class="character-card" data-character-details="${i(e.id)}" ${a?"open":""}>
      <summary class="character-card-summary">
        <strong>${i(e.fields.name)}</strong>
        <span>${ge(e.inventory,e.maxLoad)}</span>
      </summary>
      <div class="character-card-body">
        <span>HP ${f(e.fields.hpCurrent)||"—"}/${f(e.fields.hpMax)||"—"} · ARM ${f(e.fields.armor)||"—"} · DMG ${i(e.fields.damage??"—")}</span>
        <span>${n} linked token${n===1?"":"s"} in current scene · Updated ${i(new Date(e.updatedAt).toLocaleString())}</span>
        <div class="card-actions">
          <button type="button" class="secondary compact" data-edit-character="${i(e.id)}">Edit Character</button>
          ${t.role==="GM"?`<button type="button" class="danger compact" data-delete-character="${i(e.id)}">Delete</button>`:""}
        </div>
        ${Ue(e,t)}
      </div>
    </details>`}function _e(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${i(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${xe(e.editing.fields,"manager-")}
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
      ${t?`${e.role==="GM"?je(e.usage):""}
      ${e.role==="GM"?'<button type="button" class="primary compact manager-create" id="manager-create">New</button>':""}
      ${e.error?`<p class="inline-error">${i(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading Characters…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>Ve(a,e)).join("")}</div>`:`<p class="manager-status">${e.role==="GM"?"No Character records found.":"You do not currently control any linked Character tokens in this scene."}</p>`}`:""}
    </section>`}function ze(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function re(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const n=Number(a);return Number.isFinite(n)?Math.trunc(n):void 0}function W(e,t){return String(e.get(t)??"").trim()||void 0}function Ke(e,t,a){const n=a?{...t}:{};return n.hpCurrent=re(e,"hpCurrent"),n.hpMax=re(e,"hpMax"),a||(n.tags=W(e,"tags"),n.armor=re(e,"armor"),n.damage=W(e,"damage"),n.damageDescription=W(e,"damageDescription"),n.damageTags=W(e,"damageTags"),n.instinct=W(e,"instinct"),n.moves=W(e,"moves"),n.treasure=W(e,"treasure"),n.visibleToPlayers=e.get("visibleToPlayers")==="on"),n}function Le(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Ke(e,t,a)}}function de(e){const t=e[oe];return typeof t=="boolean"?t:!0}function Xe(e,t){return Ae(e)?e:{visibleToPlayers:t}}async function Je(e,t){await e({[oe]:t})}const T={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,settings:!1,characters:!1},Me=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],Ee=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
    <div class="section-heading">
      <h2>${e}</h2>
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        (${a?"collapse":"expand"})
      </button>
    </div>`}function ve(e,t,a,n){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <h3>${e}</h3>
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          (${a?"collapse":"expand"})
        </button>
      </div>
      ${a?`<div class="move-list">${n.map(o=>`<button type="button" class="move-link" data-move="${o.id}">${o.name}</button>`).join("")}</div>`:""}
    </section>`}function Ze(e,t,a,n=T,o=""){const r=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section">
        ${ie("Agenda","agenda",n.agenda)}
        ${n.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section">
        ${ie("Moves","moves",n.moves)}
        ${n.moves?`${ve("Basic Moves","basicMoves",n.basicMoves,Me)}
        ${ve("Special Moves","specialMoves",n.specialMoves,Ee)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section">
        ${ie("Settings","settings",n.settings)}
        ${n.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${r}" title="${r}" ${a?"disabled":""}>
            ${Re(t?"eye":"eye-off","default-visibility-icon")}
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
    </section>`}function pe(e){const t=e[be];return typeof t=="boolean"?t:!0}async function Qe(e,t){await e({[be]:t})}const N=document.querySelector("#app"),U=new URLSearchParams(window.location.search),G=U.get("itemId"),De=U.get("view")??"edit",fe=U.get("preview");function Z(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function C(e,t){return e instanceof Error?e.message:t}function g(e,t){l.isAvailable&&l.notification.show(e,t)}function ue(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=Fe(t.value);const a=He(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function Te(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>ue(e))}function et(e,t,a){const n=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","armor","damage","damageDescription","damageTags","instinct","moves","treasure","visibleToPlayers"],o={};for(const r of n)e[r]!==t[r]&&(o[r]=t[r]);return o}let $="PLAYER",A={},J=!1,H,Q,v,P=[],me=new Map,_,se=!1,x=!1,b,le=!1,y,B,O;const ee=new Set,te=new Set,he="dwtools/home-sections";function tt(){try{const e=JSON.parse(localStorage.getItem(he)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:T.agenda,moves:typeof e.moves=="boolean"?e.moves:T.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:T.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:T.specialMoves,settings:typeof e.settings=="boolean"?e.settings:T.settings,characters:typeof e.characters=="boolean"?e.characters:T.characters}}catch{return{...T}}}let I=tt();function at(){return{records:P,counts:me,role:$,usage:_,loading:se,saving:x,error:b,editing:y,expandedCharacters:ee,expandedInventories:te,draftCharacterId:B,transfer:O}}function c(){const e=de(A),t=_e(at(),I.characters||!!y);N.innerHTML=Ze($,e,J,I,t),document.querySelector("#default-visibility")?.addEventListener("click",()=>{st()});for(const a of document.querySelectorAll("[data-toggle-section]"))a.addEventListener("click",()=>{const n=a.dataset.toggleSection;I={...I,[n]:!I[n]},localStorage.setItem(he,JSON.stringify(I)),c()});for(const a of document.querySelectorAll("[data-move]"))a.addEventListener("click",()=>{const n=[...Me,...Ee].find(m=>m.id===a.dataset.move),o=document.querySelector("#move-dialog"),r=document.querySelector("#move-dialog-title"),s=document.querySelector("#move-dialog-text");!n||!o||!r||!s||(r.textContent=n.name,s.textContent=n.text,o.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),nt()}function nt(){document.querySelector("#manager-create")?.addEventListener("click",()=>{b=void 0,y={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},I.characters=!0,localStorage.setItem(he,JSON.stringify(I)),c()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{y=void 0,b=void 0,c()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=P.find(n=>n.id===t.dataset.editCharacter);a&&(b=void 0,y={kind:"edit",id:a.id,fields:a.fields},c())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{it(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(Te(e),e.addEventListener("submit",t=>{t.preventDefault(),rt(e)}));for(const t of document.querySelectorAll("[data-character-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.characterDetails;a&&(t.open?ee.add(a):ee.delete(a))});for(const t of document.querySelectorAll("[data-inventory-details]"))t.addEventListener("toggle",()=>{const a=t.dataset.inventoryDetails;a&&(t.open?te.add(a):te.delete(a))});ot()}function M(e){const t=e.closest("[data-character-details]")?.dataset.characterDetails;return P.find(a=>a.id===t)}function F(e,t){const a=e.inventory?.[t];return a?{sourceIndex:t,expected:[...a]}:void 0}async function D(e,t,a){if(!x){x=!0,b=void 0,a?ae(a):c();try{await e(),B=void 0,O=void 0,await E(!1),t&&g(t,"SUCCESS"),_?.nearLimit&&g("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(n){const o=C(n,"DWTools could not update this inventory.");await E(!1),b=o}finally{x=!1,a?ae(a):c()}}}function ae(e,t=!1){c(),window.requestAnimationFrame(()=>{const a=[...document.querySelectorAll("[data-character-details]")].find(o=>o.dataset.characterDetails===e);(a?.querySelector("[data-inventory-draft]")??a?.querySelector("[data-inventory-add]")??a?.querySelector("[data-inventory-details]"))?.scrollIntoView({block:"nearest"}),t&&a?.querySelector("[data-inventory-draft] [name=name]")?.focus()})}function K(e,t,a){e.addEventListener("keydown",n=>{n.key==="Escape"?(e.value=t,e.blur()):n.key==="Enter"&&(n.preventDefault(),e.blur())}),e.addEventListener("blur",a)}function ot(){if(!v)return;for(const a of document.querySelectorAll("[data-max-load]")){const n=M(a);if(!n)continue;const o=f(n.maxLoad);K(a,o,()=>{if(a.value===o)return;const r=a.value.trim()===""?void 0:Number(a.value);D(()=>v.setMaxLoad(n.id,r),"Maximum Load saved.")})}for(const a of document.querySelectorAll("[data-inventory-name]")){const n=M(a),o=Number(a.dataset.inventoryName),r=n&&F(n,o);!n||!r||K(a,r.expected[0],()=>{if(a.value===r.expected[0])return;const s=[a.value,r.expected[1],r.expected[2]];D(()=>v.updateInventoryItem(n.id,r,s))})}for(const a of document.querySelectorAll("[data-inventory-weight]")){const n=M(a),o=Number(a.dataset.inventoryWeight),r=n&&F(n,o);if(!n||!r)continue;const s=String(r.expected[1]);K(a,s,()=>{if(a.value===s)return;const m=[r.expected[0],a.value.trim()===""?Number.NaN:Number(a.value),r.expected[2]];D(()=>v.updateInventoryItem(n.id,r,m))})}for(const a of document.querySelectorAll("[data-inventory-count]")){const n=M(a),o=Number(a.dataset.inventoryCount),r=n&&F(n,o);if(!n||!r)continue;const s=String(r.expected[2]);K(a,s,()=>{if(a.value===s)return;const m=a.value.trim()===""?Number.NaN:Number(a.value);D(()=>v.changeInventoryItemCount(n.id,r,m-r.expected[2]))})}for(const a of document.querySelectorAll("[data-inventory-adjust]"))a.addEventListener("click",()=>{const n=M(a),o=Number(a.dataset.inventoryAdjust),r=n&&F(n,o),s=Number(a.dataset.change);!n||!r||D(()=>v.changeInventoryItemCount(n.id,r,s))});for(const a of document.querySelectorAll("[data-inventory-remove]"))a.addEventListener("click",()=>{const n=M(a),o=Number(a.dataset.inventoryRemove),r=n&&F(n,o);!n||!r||D(()=>v.removeInventoryItem(n.id,r))});for(const a of document.querySelectorAll("[data-inventory-add]"))a.addEventListener("click",()=>{const n=M(a);n&&(B=n.id,ee.add(n.id),te.add(n.id),ae(n.id,!0))});document.querySelector("[data-inventory-draft-cancel]")?.addEventListener("click",()=>{const a=B;B=void 0,a?ae(a):c()});const e=document.querySelector("[data-inventory-draft]");e&&e.addEventListener("submit",a=>{a.preventDefault();const n=M(e);if(!n||!e.reportValidity())return;const o=new FormData(e),r=[String(o.get("name")??""),Number(o.get("weight")),Number(o.get("count"))];D(()=>v.addInventoryItem(n.id,r),void 0,n.id)});for(const a of document.querySelectorAll("[data-inventory-transfer]"))a.addEventListener("click",()=>{const n=M(a),o=Number(a.dataset.inventoryTransfer),r=n&&F(n,o);!n||!r||(O={sourceCharacterId:n.id,sourceIndex:o,expected:r.expected},c())});document.querySelector("[data-transfer-cancel]")?.addEventListener("click",()=>{O=void 0,c()});const t=document.querySelector("[data-transfer-form]");t&&O&&t.addEventListener("submit",a=>{if(a.preventDefault(),!O||!t.reportValidity())return;const n=new FormData(t),o=String(n.get("destination")??""),r=Number(n.get("count")),s=O;D(()=>v.transferInventoryItem(s.sourceCharacterId,o,{sourceIndex:s.sourceIndex,expected:s.expected},r),"Item transferred.")})}async function E(e=!0){if(!(!H||!Q||!v)){se=!0,b=void 0,e&&!y&&c();try{if($==="GM"&&!le){const t=await v.cleanupLegacyTombstones();le=!0,t&&g(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[P,me,_]=await Promise.all([v.listAccessible(),Pe(Q.scene),$==="GM"?H.estimateUsage():Promise.resolve(void 0)]),$==="PLAYER"&&y?.kind==="edit"&&!P.some(t=>t.id===y?.id)&&(y=void 0,b="You no longer control a token linked to the Character being edited.")}catch(t){b=C(t,"DWTools could not load character records.")}finally{se=!1,e&&!y&&c()}}}async function rt(e){if(!(!y||!v||x)){if(!ue(e)||!e.reportValidity()){b="Correct the highlighted character fields before saving.",c();return}x=!0,b=void 0,c();try{const t=Se(Le(new FormData(e),y.fields,!1));y.kind==="create"?(await v.create(t),g("Character record created.","SUCCESS")):(await v.save(y.id,t),g("Character record saved.","SUCCESS")),y=void 0,await E(!1),_?.nearLimit&&g("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){b=C(t,"DWTools could not save the record.")}finally{x=!1,c()}}}async function it(e){if(!e||!v||x)return;const t=P.find(a=>a.id===e);if(t&&window.confirm(Be(t.fields.name))){x=!0,b=void 0,c();try{await v.delete(e),g("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await E(!1)}catch(a){b=C(a,"DWTools could not delete the record.")}finally{x=!1,c()}}}async function st(){if($!=="GM"||J)return;const e=!de(A);J=!0,c();try{await Je(t=>l.room.setMetadata(t),e),A={...A,[oe]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),g("DWTools could not save the default overlay visibility.","ERROR")}finally{J=!1,c()}}async function lt(){try{await we()}catch(t){console.error("DWTools metadata namespace migration failed",t),N.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',g("DWTools could not migrate its saved data.","ERROR");return}H=ke(),Q=$e(H),v=Ne(H,Q),[$,A]=await Promise.all([l.player.getRole(),l.room.getMetadata(),l.theme.getTheme().then(Z)]),await E(!1),c();const e=[l.room.onMetadataChange(t=>{A=t,c()}),H.subscribe(t=>{t.some(a=>a.lookup.status==="deleted")&&(le=!1),E($==="PLAYER"||!y)}),l.player.onChange(t=>{$=t.role,y=void 0,B=void 0,O=void 0,E()}),l.scene.items.onChange(()=>{E($==="PLAYER"||!y)}),l.room.onPermissionsChange(()=>{E($==="PLAYER"||!y)}),l.theme.onChange(Z)];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let q,w,d,k,S={status:"missing"},ne=[],z=!1,j="",u=!1,L=!0,Y=!1,p,ye=!1;function ct(e){const t=R(e);let a,n;t?S.status==="active"?(a=`Character record: <strong>${i(S.record.fields.name)}</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${S.status==="malformed"?"malformed":S.status==="deleted"?"deleted":"missing"})</strong>`,n=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",n='<button type="button" class="secondary" id="link-character">Link to character</button>');const o=j.trim().toLocaleLowerCase(),r=o?ne.filter(m=>m.fields.name.toLocaleLowerCase().includes(o)||m.fields.tags?.toLocaleLowerCase().includes(o)):ne,s=z?`
      <div class="link-picker">
        <p>Selecting an existing record replaces this token's DWTools creature data. ${L?"Its label will also be overwritten.":"Its label will be retained."}</p>
        <label>Search characters<input id="link-search" type="search" value="${i(j)}"></label>
        <div class="link-results">
          ${r.length?r.map(m=>`
                <button type="button" data-link-record="${i(m.id)}" data-link-search="${i(`${m.fields.name} ${m.fields.tags??""}`.toLocaleLowerCase())}">
                  ${Ge(m)}
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
        <input id="overwrite-label" type="checkbox" ${L?"checked":""} ${Y?"disabled":""}>
        Overwrite label
      </label>
      ${s}
    </section>`}function h(){if(!d||!k)return;const e=De==="hp";N.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${i(k.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${ct(d)}
      ${p?`<p class="inline-error">${i(p)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${f(k.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${f(k.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(o=>`<button type="button" data-hp="${o}">${o>0?"+":""}${o}</button>`).join("")}
          </div>`:xe(k)}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${u?"disabled":""}>${u?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),n=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const o=ze(a.value,n.value);o!==null&&(n.value=o)}),Te(t);for(const o of t.querySelectorAll("[data-hp]"))o.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(o.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{l.popover.close(ce)}),document.querySelector("#remove")?.addEventListener("click",()=>{vt()}),document.querySelector("#link-character")?.addEventListener("click",()=>{dt()}),document.querySelector("#overwrite-label")?.addEventListener("change",o=>{ut(o.currentTarget.checked)});for(const o of document.querySelectorAll("#create-character"))o.addEventListener("click",()=>{ht()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{yt()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{z=!1,j="",h()}),document.querySelector("#link-search")?.addEventListener("input",o=>{j=o.currentTarget.value;const r=j.trim().toLocaleLowerCase();for(const s of document.querySelectorAll("[data-link-search]"))s.hidden=!String(s.dataset.linkSearch).includes(r)});for(const o of document.querySelectorAll("[data-link-record]"))o.addEventListener("click",()=>{mt(o.dataset.linkRecord)});t.addEventListener("submit",o=>{o.preventDefault(),pt(t)})}async function V(){if(!G||!w||!q)return;const e=await w.getItem(G);if(!e){N.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ye=X in e.metadata,d=e,k=Ce(e);const t=R(e);S=t?await q.inspect(t.characterId):{status:"missing"},S.status==="active"&&(k=S.record.fields),h()}async function dt(){if(!(!q||u)){u=!0,p=void 0,h();try{ne=await q.list(),z=!0}catch(e){p=C(e,"DWTools could not load character records.")}finally{u=!1,h()}}}async function ut(e){if(Y)return;const t=L;L=e,Y=!0,h();try{await Qe(a=>l.room.setMetadata(a),e)}catch(a){L=t,p=C(a,"DWTools could not save the overwrite-label setting.")}finally{Y=!1,h()}}async function mt(e){if(!e||!w||!d||u)return;const t=ne.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools creature data will be replaced by the latest character record. Its label will be ${L?"overwritten":"retained"}.`)){u=!0,p=void 0,h();try{await w.linkToExistingCharacter(d.id,e,L),g(`Linked to ${t.fields.name}.`,"SUCCESS"),z=!1,await V()}catch(a){p=C(a,"DWTools could not link the character.")}finally{u=!1,h()}}}async function ht(){if(!(!w||!d||u)){u=!0,p=void 0,h();try{const{record:e}=await w.createAndLinkCharacter(d.id);g(`Created and linked ${e.fields.name}.`,"SUCCESS"),z=!1,await V()}catch(e){p=C(e,"DWTools could not create and link the character.")}finally{u=!1,h()}}}async function yt(){if(!(!w||!d||u)){u=!0,p=void 0,h();try{await w.unlinkCharacter(d.id),g("Character unlinked; creature fields were retained.","SUCCESS"),await V()}catch(e){p=C(e,"DWTools could not unlink the character.")}finally{u=!1,h()}}}async function vt(){if(!(!w||!d||u||R(d)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){u=!0,h();try{await w.removeCreatureData(d.id),await l.popover.close(ce)}catch(t){p=C(t,"DWTools could not remove the creature data."),u=!1,h()}}}async function pt(e){if(!(!w||!d||!k||u)){if(!ue(e)||!e.reportValidity()){p="Correct the highlighted creature fields before saving.",h();return}u=!0,p=void 0,h();try{const t=De==="hp",a=Se(Le(new FormData(e),k,t));let n=et(k,a,t);!ye&&!R(d)&&(n=a),Object.keys(n).length&&await w.updateCreatureFields(d.id,n),g(R(d)?"Character record saved.":"Creature saved.","SUCCESS"),await l.popover.close(ce)}catch(t){p=C(t,"DWTools could not save the creature."),u=!1,h()}}}async function ft(){if(!G)return;try{await we()}catch(r){console.error("DWTools metadata namespace migration failed",r),N.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',g("DWTools could not migrate its saved data.","ERROR");return}q=ke(),w=$e(q);const[e,t]=await Promise.all([w.getItem(G),l.room.getMetadata().catch(r=>(console.warn("DWTools could not load room visibility settings",r),{})),l.theme.getTheme().then(Z)]);if(!e){N.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}ye=X in e.metadata;const a=Xe(e.metadata[X],de(t));L=pe(t),d={...e,metadata:{...e.metadata,[X]:a}},k=Ce(d);const n=R(d);S=n?await q.inspect(n.characterId):{status:"missing"},S.status==="active"&&(k=S.record.fields),h();const o=[q.subscribe(r=>{const s=d&&R(d);s&&r.some(m=>m.characterId===s.characterId)&&!u&&V()}),l.scene.items.onChange(r=>{r.find(m=>m.id===G)&&!u&&V()}),l.room.onMetadataChange(r=>{Y||(L=pe(r),h())}),l.theme.onChange(Z)];window.addEventListener("unload",()=>{for(const r of o)r()},{once:!0})}fe==="home"?($="GM",A={[oe]:U.get("default")!=="hidden"},P=[{schemaVersion:2,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],me=new Map([["preview-active",2]]),_={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},c()):fe==="editor"?(L=U.get("overwriteLabel")?.toLocaleLowerCase()!=="false",d={id:"preview",name:"Frogman",metadata:{}},k={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},h()):G?l.isAvailable?l.onReady(()=>{ft()}):N.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(c(),l.isAvailable&&l.onReady(()=>{lt()}));
