import{n as Y,i as ge,j as fe,O as c,m as Z,h as ie,k as se,q as ve,C as G,t as le,u as W,v as ce,w as be,x as we,y as ke}from"./obrCharacterServices-1.1.4.js";function r(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function b(e){return typeof e=="number"&&Number.isFinite(e)?String(e):""}function de(e,t=""){const a=o=>`${t}${o}`;return`
    <label>Name<input id="${a("name")}" name="name" type="text" maxlength="120" required value="${r(e.name)}"></label>
    <label>Tags<input id="${a("tags")}" name="tags" type="text" maxlength="160" placeholder="Solitary, Small, Intelligent, Stealthy, Devious" value="${r(e.tags??"")}"></label>
    <div class="vitals-row">
      <label>Armor<input id="${a("armor")}" name="armor" type="number" step="1" value="${b(e.armor)}"></label>
      <label>Current HP<input id="${a("hpCurrent")}" name="hpCurrent" type="number" step="1" value="${b(e.hpCurrent)}"></label>
      <span class="slash">/</span>
      <label>Maximum HP<input id="${a("hpMax")}" name="hpMax" type="number" min="0" step="1" value="${b(e.hpMax)}"></label>
    </div>
    <div class="damage-fields">
      <label>Damage<input id="${a("damage")}" name="damage" type="text" maxlength="40" placeholder="b[2d6]+1" value="${r(e.damage??"")}"></label>
      <label>Description<input id="${a("damageDescription")}" name="damageDescription" type="text" maxlength="80" placeholder="Claws" value="${r(e.damageDescription??"")}"></label>
    </div>
    <label>Damage tags<input id="${a("damageTags")}" name="damageTags" type="text" maxlength="160" placeholder="Close, Reach, Messy, Forceful" value="${r(e.damageTags??"")}"></label>
    <label>Instinct<textarea id="${a("instinct")}" name="instinct" rows="2">${r(e.instinct??"")}</textarea></label>
    <label>Moves<textarea id="${a("moves")}" name="moves" rows="4" placeholder="One move per line">${r(e.moves??"")}</textarea></label>
    <label>Treasure<textarea id="${a("treasure")}" name="treasure" rows="3">${r(e.treasure??"")}</textarea></label>
    <label class="visibility">
      <input id="${a("visibleToPlayers")}" name="visibleToPlayers" type="checkbox" ${e.visibleToPlayers===!1?"":"checked"}>
      Show the token overlay to players
    </label>`}function Ce(e){const t=e.fields;return`${r(t.name)} · HP ${b(t.hpCurrent)||"—"}/${b(t.hpMax)||"—"} · ARM ${b(t.armor)||"—"} · DMG ${r(t.damage??"—")}`}function $e(e){return`Delete the room character record "${e}"? Current-scene tokens will be unlinked and keep their creature fields. Linked copies in other scenes will become orphaned and need to be manually resolved.`}function Se(e){if(!e)return'<p class="manager-status">Metadata usage unavailable.</p>';const t=(e.bytes/1024).toFixed(1),a=(e.safeMaximumBytes/1024).toFixed(0);return`
    <div class="metadata-usage ${e.nearLimit?"near-limit":""}">
      <span>Room metadata: approximately ${t} KiB of ${a} KiB safe maximum</span>
      <progress max="${e.limitBytes}" value="${e.bytes}"></progress>
      ${e.nearLimit?"<strong>Room metadata is approaching Owlbear's limit.</strong>":""}
    </div>`}function Me(e,t=!1){return e.editing?`
      <section class="character-manager">
        <div class="manager-heading"><h2>${e.editing.kind==="create"?"New character record":`Edit ${r(e.editing.fields.name)}`}</h2></div>
        ${e.error?`<p class="inline-error">${r(e.error)}</p>`:""}
        <form id="character-manager-form" class="manager-form">
          ${de(e.editing.fields,"manager-")}
          <div class="manager-actions">
            <button type="button" class="secondary" id="manager-cancel">Cancel</button>
            <button type="submit" class="primary" ${e.saving?"disabled":""}>${e.saving?"Saving…":"Save record"}</button>
          </div>
        </form>
      </section>`:`
    <section class="character-manager">
      <div class="section-heading">
        <h2>Character Records</h2>
        <button class="section-toggle" type="button" data-toggle-section="characters" aria-expanded="${t}">
          (${t?"collapse":"expand"})
        </button>
      </div>
      ${t?`${Se(e.usage)}
      <button type="button" class="primary compact manager-create" id="manager-create">New</button>
      ${e.error?`<p class="inline-error">${r(e.error)}</p>`:""}
      ${e.loading?'<p class="manager-status">Loading character records…</p>':e.records.length?`<div class="character-list">${e.records.map(a=>`
              <article class="character-card" data-character-search="${r(`${a.fields.name} ${a.fields.tags??""}`.toLocaleLowerCase())}">
                <div>
                  <strong>${r(a.fields.name)}</strong>
                  <span>HP ${b(a.fields.hpCurrent)||"—"}/${b(a.fields.hpMax)||"—"} · ARM ${b(a.fields.armor)||"—"} · DMG ${r(a.fields.damage??"—")}</span>
                  <span>${e.counts.get(a.id)??0} linked token${e.counts.get(a.id)===1?"":"s"} in current scene · Updated ${r(new Date(a.updatedAt).toLocaleString())}</span>
                </div>
                <div class="card-actions">
                  <button type="button" class="secondary compact" data-edit-character="${r(a.id)}">Edit</button>
                  <button type="button" class="danger compact" data-delete-character="${r(a.id)}">Delete</button>
                </div>
              </article>`).join("")}</div>`:'<p class="manager-status">No character records found.</p>'}`:""}
    </section>`}function xe(e,t){if(t.trim()!==""||e.trim()==="")return null;const a=Number(e);return Number.isFinite(a)&&a>=0?e.trim():null}function z(e,t){const a=String(e.get(t)??"").trim();if(!a)return;const o=Number(a);return Number.isFinite(o)?Math.trunc(o):void 0}function D(e,t){return String(e.get(t)??"").trim()||void 0}function Le(e,t,a){const o=a?{...t}:{};return o.hpCurrent=z(e,"hpCurrent"),o.hpMax=z(e,"hpMax"),a||(o.tags=D(e,"tags"),o.armor=z(e,"armor"),o.damage=D(e,"damage"),o.damageDescription=D(e,"damageDescription"),o.damageTags=D(e,"damageTags"),o.instinct=D(e,"instinct"),o.moves=D(e,"moves"),o.treasure=D(e,"treasure"),o.visibleToPlayers=e.get("visibleToPlayers")==="on"),o}function ue(e,t,a){return{name:a?t.name:String(e.get("name")??"").trim(),...Le(e,t,a)}}function Q(e){const t=e[Y];return typeof t=="boolean"?t:!0}function De(e,t){return ge(e)?e:{visibleToPlayers:t}}async function Te(e,t){await e({[Y]:t})}const S={agenda:!0,moves:!0,basicMoves:!0,specialMoves:!1,settings:!1,characters:!1},he=[{id:"hack-and-slash",name:"Hack and Slash",text:"When you attack an enemy in melee, roll+Str. On a 10+ you deal your damage to the enemy and avoid their attack. At your option, you may choose to do +1d6 damage but expose yourself to the enemy’s attack. On a 7–9, you deal your damage to the enemy and the enemy makes an attack against you."},{id:"volley",name:"Volley",text:`When you take aim and shoot at an enemy at range, roll+Dex. On a 10+ you have a clear shot—deal your damage. On a 7–9, choose one (whichever you choose you deal your damage):

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
• What here is not what it appears to be?`},{id:"parley",name:"Parley",text:"When you have leverage on a GM character and manipulate them, roll+Cha. Leverage is something they need or want. On a hit they ask you for something and do it if you make them a promise first. On a 7–9, they need some concrete assurance of your promise, right now."},{id:"aid-or-interfere",name:"Aid or Interfere",text:"When you help or hinder someone you have a bond with, roll+Bond with them. On a 10+ they take +1 or -2, your choice. On a 7–9 you also expose yourself to danger, retribution, or cost."}],me=[{id:"last-breath",name:"Last Breath",text:"When you’re dying you catch a glimpse of what lies beyond the Black Gates of Death’s Kingdom (the GM will describe it). Then roll (just roll, +nothing—yeah, Death doesn’t care how tough or cool you are). On a 10+ you’ve cheated death—you’re in a bad spot but you’re still alive. On a 7–9 Death will offer you a bargain. Take it and stabilize or refuse and pass beyond the Black Gates into whatever fate awaits you. On a miss, your fate is sealed. You’re marked as Death’s own and you’ll cross the threshold soon. The GM will tell you when."},{id:"encumbrance",name:"Encumbrance",text:"When you make a move while carrying weight up to or equal to load, you’re fine. When you make a move while carrying weight equal to load+1 or load+2, you take -1. When you make a move while carrying weight greater than load+2, you have a choice: drop at least 1 weight and roll at -1, or automatically fail."},{id:"make-camp",name:"Make Camp",text:"When you settle in to rest consume a ration. If you’re somewhere dangerous decide the watch order as well. If you have enough XP you may Level Up. When you wake from at least a few uninterrupted hours of sleep heal damage equal to half your max HP."},{id:"take-watch",name:"Take Watch",text:"When you’re on watch and something approaches the camp roll+Wis. On a 10+ you’re able to wake the camp and prepare a response, the camp takes +1 forward. On a 7–9 you react just a moment too late; the camp is awake but hasn’t had time to prepare. You have weapons and armor but little else. On a miss whatever lurks outside the campfire’s light has the drop on you."},{id:"undertake-a-perilous-journey",name:"Undertake a Perilous Journey",text:`When you travel through hostile territory, choose one member of the party to act as trailblazer, one to scout ahead, and one to be quartermaster (the same character cannot have two jobs). If you don’t have enough party members or choose not to assign a job, treat that job as if it had rolled a 6. Each character with a job to do rolls+Wis. On a 10+ the quartermaster reduces the number of rations required by one.

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
• Someone important to you has been put in a bad spot as a result of your actions.`},{id:"bolster",name:"Bolster",text:"When you spend your leisure time in study, meditation, or hard practice, you gain preparation. If you prepare for a week or two, 1 preparation. If you prepare for a month or longer, 3 preparation. When your preparation pays off spend 1 preparation for +1 to any roll. You can only spend one preparation per roll."}];function K(e,t,a){return`
    <div class="section-heading">
      <h2>${e}</h2>
      <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
        (${a?"collapse":"expand"})
      </button>
    </div>`}function ne(e,t,a,o){return`
    <section class="move-subsection">
      <div class="move-subheading">
        <h3>${e}</h3>
        <button class="section-toggle" type="button" data-toggle-section="${t}" aria-expanded="${a}">
          (${a?"collapse":"expand"})
        </button>
      </div>
      ${a?`<div class="move-list">${o.map(n=>`<button type="button" class="move-link" data-move="${n.id}">${n.name}</button>`).join("")}</div>`:""}
    </section>`}function Oe(e,t,a,o=S,n=""){const i=t?"Default: visible to players":"Default: hidden from players";return`
    <section class="home">
      <div class="home-brand">
        <img class="extension-logo" src="./icon.svg" alt="DWTools logo">
        <h1>DWTools</h1>
      </div>
      ${e==="GM"?`<section class="home-section">
        ${K("Agenda","agenda",o.agenda)}
        ${o.agenda?`<ul class="agenda-list">
          <li>Portray a fantastic world</li>
          <li>Fill the characters’ lives with adventure</li>
          <li>Play to find out what happens</li>
        </ul>`:""}
      </section>`:""}
      <section class="home-section">
        ${K("Moves","moves",o.moves)}
        ${o.moves?`${ne("Basic Moves","basicMoves",o.basicMoves,he)}
        ${ne("Special Moves","specialMoves",o.specialMoves,me)}`:""}
      </section>
      ${e==="GM"?`<section class="home-section">
        ${K("Settings","settings",o.settings)}
        ${o.settings?`<div class="default-visibility">
          <span>Default character overlay:</span>
          <button class="default-visibility-toggle" type="button" id="default-visibility" aria-label="${i}" title="${i}" ${a?"disabled":""}>
            ${fe(t?"eye":"eye-off","default-visibility-icon")}
          </button>
        </div>`:""}
      </section>
      ${n}`:""}
      <dialog id="move-dialog" class="move-dialog">
        <div class="move-dialog-heading">
          <h2 id="move-dialog-title"></h2>
          <button type="button" class="icon-button" id="move-dialog-close" aria-label="Close">×</button>
        </div>
        <div id="move-dialog-text" class="move-dialog-text"></div>
      </dialog>
    </section>`}const A=document.querySelector("#app"),V=new URLSearchParams(window.location.search),P=V.get("itemId"),ye=V.get("view")??"edit",re=V.get("preview");function B(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-background",e.background.paper),t.style.setProperty("--dw-surface",e.background.default),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-text-disabled",e.text.disabled),t.style.setProperty("--dw-primary",e.primary.main)}function $(e,t){return e instanceof Error?e.message:t}function C(e,t){c.isAvailable&&c.notification.show(e,t)}function ee(e){const t=e.elements.namedItem("damage");if(!(t instanceof HTMLInputElement))return!0;t.value=we(t.value);const a=ke(t.value);return t.classList.toggle("field-invalid",a),t.setAttribute("aria-invalid",String(a)),!a}function pe(e){const t=e.elements.namedItem("damage");t instanceof HTMLInputElement&&t.addEventListener("blur",()=>ee(e))}function Ee(e,t,a){const o=a?["hpCurrent","hpMax"]:["name","tags","hpCurrent","hpMax","armor","damage","damageDescription","damageTags","instinct","moves","treasure","visibleToPlayers"],n={};for(const i of o)e[i]!==t[i]&&(n[i]=t[i]);return n}let v="PLAYER",O={},N=!1,T,U,L,H=[],te=new Map,_,X=!1,E=!1,w,J=!1,h;const ae="dwtools/home-sections";function We(){try{const e=JSON.parse(localStorage.getItem(ae)??"{}");return{agenda:typeof e.agenda=="boolean"?e.agenda:S.agenda,moves:typeof e.moves=="boolean"?e.moves:S.moves,basicMoves:typeof e.basicMoves=="boolean"?e.basicMoves:S.basicMoves,specialMoves:typeof e.specialMoves=="boolean"?e.specialMoves:S.specialMoves,settings:typeof e.settings=="boolean"?e.settings:S.settings,characters:typeof e.characters=="boolean"?e.characters:S.characters}}catch{return{...S}}}let M=We();function Ie(){return{records:H,counts:te,usage:_,loading:X,saving:E,error:w,editing:h}}function d(){const e=Q(O),t=v==="GM"?Me(Ie(),M.characters||!!h):"";A.innerHTML=Oe(v,e,N,M,t),document.querySelector("#default-visibility")?.addEventListener("click",()=>{Ae()});for(const a of document.querySelectorAll("[data-toggle-section]"))a.addEventListener("click",()=>{const o=a.dataset.toggleSection;M={...M,[o]:!M[o]},localStorage.setItem(ae,JSON.stringify(M)),d()});for(const a of document.querySelectorAll("[data-move]"))a.addEventListener("click",()=>{const o=[...he,...me].find(m=>m.id===a.dataset.move),n=document.querySelector("#move-dialog"),i=document.querySelector("#move-dialog-title"),f=document.querySelector("#move-dialog-text");!o||!n||!i||!f||(i.textContent=o.name,f.textContent=o.text,n.showModal())});document.querySelector("#move-dialog-close")?.addEventListener("click",()=>document.querySelector("#move-dialog")?.close()),Pe()}function Pe(){document.querySelector("#manager-create")?.addEventListener("click",()=>{w=void 0,h={kind:"create",fields:{name:"Untitled character",visibleToPlayers:!0}},M.characters=!0,localStorage.setItem(ae,JSON.stringify(M)),d()}),document.querySelector("#manager-cancel")?.addEventListener("click",()=>{h=void 0,w=void 0,d()});for(const t of document.querySelectorAll("[data-edit-character]"))t.addEventListener("click",()=>{const a=H.find(o=>o.id===t.dataset.editCharacter);a&&(w=void 0,h={kind:"edit",id:a.id,fields:a.fields},d())});for(const t of document.querySelectorAll("[data-delete-character]"))t.addEventListener("click",()=>{Re(t.dataset.deleteCharacter)});const e=document.querySelector("#character-manager-form");e&&(pe(e),e.addEventListener("submit",t=>{t.preventDefault(),qe(e)}))}async function I(e=!0){if(!(v!=="GM"||!T||!U||!L)){X=!0,w=void 0,e&&!h&&d();try{if(!J){const t=await L.cleanupLegacyTombstones();J=!0,t&&C(`Cleaned up ${t} legacy deleted character record${t===1?"":"s"}.`,"SUCCESS")}[H,te,_]=await Promise.all([T.list(),be(U.scene),T.estimateUsage()])}catch(t){w=$(t,"DWTools could not load character records.")}finally{X=!1,e&&!h&&d()}}}async function qe(e){if(!(!h||!L||E)){if(!ee(e)||!e.reportValidity()){w="Correct the highlighted character fields before saving.",d();return}E=!0,w=void 0,d();try{const t=ce(ue(new FormData(e),h.fields,!1));h.kind==="create"?(await L.create(t),C("Character record created.","SUCCESS")):(await L.save(h.id,t),C("Character record saved.","SUCCESS")),h=void 0,await I(!1),_?.nearLimit&&C("Room metadata is approaching Owlbear's size limit.","WARNING")}catch(t){w=$(t,"DWTools could not save the record.")}finally{E=!1,d()}}}async function Re(e){if(!e||!L||E)return;const t=H.find(a=>a.id===e);if(t&&window.confirm($e(t.fields.name))){E=!0,w=void 0,d();try{await L.delete(e),C("Character record deleted. Other-scene copies are now orphaned.","SUCCESS"),await I(!1)}catch(a){w=$(a,"DWTools could not delete the record.")}finally{E=!1,d()}}}async function Ae(){if(v!=="GM"||N)return;const e=!Q(O);N=!0,d();try{await Te(t=>c.room.setMetadata(t),e),O={...O,[Y]:e}}catch(t){console.error("DWTools could not save the default overlay visibility",t),C("DWTools could not save the default overlay visibility.","ERROR")}finally{N=!1,d()}}async function He(){T=ie(),U=se(T),L=ve(T,U),[v,O]=await Promise.all([c.player.getRole(),c.room.getMetadata(),c.theme.getTheme().then(B)]),v==="GM"&&await I(!1),d();const e=[c.room.onMetadataChange(t=>{O=t,d()}),T.subscribe(t=>{t.some(a=>a.lookup.status==="deleted")&&(J=!1),v==="GM"&&I(!h)}),c.player.onChange(t=>{v=t.role,h=void 0,v==="GM"?I():d()}),c.scene.items.onChange(()=>{v==="GM"&&!h&&I()}),c.theme.onChange(B)];window.addEventListener("unload",()=>{for(const t of e)t()},{once:!0})}let x,p,s,g,k={status:"missing"},j=[],F=!1,q="",l=!1,y,oe=!1;function Fe(e){const t=W(e);let a,o;t?k.status==="active"?(a=`Character record: <strong>${r(k.record.fields.name)}</strong>`,o=`
      <button type="button" class="secondary" id="link-character">Change link</button>
      <button type="button" class="secondary" id="unlink-character">Unlink</button>`):(a=`Character record: <strong class="orphaned">Orphaned link (${k.status==="malformed"?"malformed":k.status==="deleted"?"deleted":"missing"})</strong>`,o=`
      <button type="button" class="secondary" id="link-character">Relink to existing</button>
      <button type="button" class="secondary" id="create-character">Create new from creature</button>
      <button type="button" class="secondary" id="unlink-character">Unlink and retain fields</button>`):(a="Character record: <strong>Not linked</strong>",o='<button type="button" class="secondary" id="link-character">Link to character</button>');const n=q.trim().toLocaleLowerCase(),i=n?j.filter(m=>m.fields.name.toLocaleLowerCase().includes(n)||m.fields.tags?.toLocaleLowerCase().includes(n)):j,f=F?`
      <div class="link-picker">
        <p>Selecting an existing record replaces every persistent DWTools field on this token.</p>
        <label>Search characters<input id="link-search" type="search" value="${r(q)}"></label>
        <div class="link-results">
          ${i.length?i.map(m=>`
                <button type="button" data-link-record="${r(m.id)}" data-link-search="${r(`${m.fields.name} ${m.fields.tags??""}`.toLocaleLowerCase())}">
                  ${Ce(m)}
                </button>`).join(""):'<span class="manager-status">No matching character records.</span>'}
        </div>
        <div class="manager-actions">
          <button type="button" class="secondary" id="create-character">Create new from this creature</button>
          <button type="button" class="secondary" id="cancel-link">Cancel</button>
        </div>
      </div>`:"";return`
    <section class="character-link-section">
      <span>${a}</span>
      <div class="link-actions">${o}</div>
      ${f}
    </section>`}function u(){if(!s||!g)return;const e=ye==="hp";A.innerHTML=`
    <form id="creature-form" class="editor">
      <header>
        <div><p class="eyebrow">DWTools creature</p><h1>${r(g.name)}</h1></div>
        <button class="icon-button" type="button" id="close" aria-label="Close">×</button>
      </header>
      ${Fe(s)}
      ${y?`<p class="inline-error">${r(y)}</p>`:""}
      ${e?`
          <div class="hp-row">
            <label>Current HP<input name="hpCurrent" type="number" step="1" value="${b(g.hpCurrent)}"></label>
            <span class="slash">/</span>
            <label>Maximum HP<input name="hpMax" type="number" min="0" step="1" value="${b(g.hpMax)}"></label>
          </div>
          <div class="quick-hp" aria-label="Quick HP adjustment">
            ${[-5,-1,1,5].map(n=>`<button type="button" data-hp="${n}">${n>0?"+":""}${n}</button>`).join("")}
          </div>`:de(g)}
      <footer>
        ${e?"":'<button class="danger" type="button" id="remove">Remove data</button>'}
        <button class="primary" type="submit" ${l?"disabled":""}>${l?"Saving…":"Save"}</button>
      </footer>
    </form>`;const t=document.querySelector("#creature-form"),a=t.elements.namedItem("hpCurrent"),o=t.elements.namedItem("hpMax");a.addEventListener("blur",()=>{const n=xe(a.value,o.value);n!==null&&(o.value=n)}),pe(t);for(const n of t.querySelectorAll("[data-hp]"))n.addEventListener("click",()=>{a.value=String((Number(a.value)||0)+Number(n.dataset.hp))});document.querySelector("#close")?.addEventListener("click",()=>{c.popover.close(Z)}),document.querySelector("#remove")?.addEventListener("click",()=>{je()}),document.querySelector("#link-character")?.addEventListener("click",()=>{Ge()});for(const n of document.querySelectorAll("#create-character"))n.addEventListener("click",()=>{Be()});document.querySelector("#unlink-character")?.addEventListener("click",()=>{Ue()}),document.querySelector("#cancel-link")?.addEventListener("click",()=>{F=!1,q="",u()}),document.querySelector("#link-search")?.addEventListener("input",n=>{q=n.currentTarget.value;const i=q.trim().toLocaleLowerCase();for(const f of document.querySelectorAll("[data-link-search]"))f.hidden=!String(f.dataset.linkSearch).includes(i)});for(const n of document.querySelectorAll("[data-link-record]"))n.addEventListener("click",()=>{Ne(n.dataset.linkRecord)});t.addEventListener("submit",n=>{n.preventDefault(),Ye(t)})}async function R(){if(!P||!p||!x)return;const e=await p.getItem(P);if(!e){A.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}oe=G in e.metadata,s=e,g=le(e);const t=W(e);k=t?await x.inspect(t.characterId):{status:"missing"},k.status==="active"&&(g=k.record.fields),u()}async function Ge(){if(!(!x||l)){l=!0,y=void 0,u();try{j=await x.list(),F=!0}catch(e){y=$(e,"DWTools could not load character records.")}finally{l=!1,u()}}}async function Ne(e){if(!e||!p||!s||l)return;const t=j.find(a=>a.id===e);if(t&&window.confirm(`Link to "${t.fields.name}"? This token's current DWTools fields will be replaced by the latest character record.`)){l=!0,y=void 0,u();try{await p.linkToExistingCharacter(s.id,e),C(`Linked to ${t.fields.name}.`,"SUCCESS"),F=!1,await R()}catch(a){y=$(a,"DWTools could not link the character.")}finally{l=!1,u()}}}async function Be(){if(!(!p||!s||l)){l=!0,y=void 0,u();try{const{record:e}=await p.createAndLinkCharacter(s.id);C(`Created and linked ${e.fields.name}.`,"SUCCESS"),F=!1,await R()}catch(e){y=$(e,"DWTools could not create and link the character.")}finally{l=!1,u()}}}async function Ue(){if(!(!p||!s||l)){l=!0,y=void 0,u();try{await p.unlinkCharacter(s.id),C("Character unlinked; creature fields were retained.","SUCCESS"),await R()}catch(e){y=$(e,"DWTools could not unlink the character.")}finally{l=!1,u()}}}async function je(){if(!(!p||!s||l||W(s)&&!window.confirm("Remove this token's DWTools data? The token will be unlinked, but the room character record will be preserved."))){l=!0,u();try{await p.removeCreatureData(s.id),await c.popover.close(Z)}catch(t){y=$(t,"DWTools could not remove the creature data."),l=!1,u()}}}async function Ye(e){if(!(!p||!s||!g||l)){if(!ee(e)||!e.reportValidity()){y="Correct the highlighted creature fields before saving.",u();return}l=!0,y=void 0,u();try{const t=ye==="hp",a=ce(ue(new FormData(e),g,t));let o=Ee(g,a,t);!oe&&!W(s)&&(o=a),Object.keys(o).length&&await p.updateCreatureFields(s.id,o),C(W(s)?"Character record saved.":"Creature saved.","SUCCESS"),await c.popover.close(Z)}catch(t){y=$(t,"DWTools could not save the creature."),l=!1,u()}}}async function Ve(){if(!P)return;x=ie(),p=se(x);const[e,t]=await Promise.all([p.getItem(P),c.room.getMetadata().catch(i=>(console.warn("DWTools could not load room visibility settings",i),{})),c.theme.getTheme().then(B)]);if(!e){A.innerHTML='<p class="error">That token is no longer in the scene.</p>';return}oe=G in e.metadata;const a=De(e.metadata[G],Q(t));s={...e,metadata:{...e.metadata,[G]:a}},g=le(s);const o=W(s);k=o?await x.inspect(o.characterId):{status:"missing"},k.status==="active"&&(g=k.record.fields),u();const n=[x.subscribe(i=>{const f=s&&W(s);f&&i.some(m=>m.characterId===f.characterId)&&!l&&R()}),c.scene.items.onChange(i=>{i.find(m=>m.id===P)&&!l&&R()}),c.theme.onChange(B)];window.addEventListener("unload",()=>{for(const i of n)i()},{once:!0})}re==="home"?(v="GM",O={[Y]:V.get("default")!=="hidden"},H=[{schemaVersion:1,id:"preview-active",fields:{name:"Raganah",hpCurrent:8,hpMax:10,armor:1,damage:"d8+2",tags:"Cautious, Loyal"},revision:3,createdAt:"2026-07-25T15:00:00.000Z",createdBy:"preview-gm",updatedAt:"2026-07-26T15:00:00.000Z",updatedBy:"preview-gm",writeId:"preview-active-write"}],te=new Map([["preview-active",2]]),_={bytes:7168,limitBytes:16384,safeMaximumBytes:15360,warningBytes:13107,nearLimit:!1,percentOfLimit:43.75},d()):re==="editor"?(s={id:"preview",name:"Frogman",metadata:{}},g={name:"Frogman",hpCurrent:7,hpMax:10,tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol"},u()):P?c.isAvailable?c.onReady(()=>{Ve()}):A.innerHTML='<p class="error">Open this editor from a token inside Owlbear Rodeo.</p>':(d(),c.isAvailable&&c.onReady(()=>{He()}));
