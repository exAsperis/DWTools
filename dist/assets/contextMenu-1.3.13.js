import{q as C,t as H,e as B,r as N,u as E,v as q,A as F,w as W,O as r,l as U,m as X,x as j,g as I,C as P,b as _,y as V,E as Y,z as Z}from"./obrMetadataMigration-1.3.13.js";import{r as T,a as z}from"./contextMarkdown-1.3.13.js";function v(e){return e.replace(/[&<>'"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[t])}function S(e,t,o){const n=[];for(let s=t;s<o;s+=1){const y=e.conditions?.[E[s]]===-1,c=q(e.scores?.[s],e.conditions?.[E[s]]);if(c===void 0)continue;const l=W(c);n.push(`
      <button class="modifier-roll${y?" condition-affected":""}" type="button" data-ability="${s}" data-modifier="${c}" title="Roll 2d6${l}">
        <span>${F[s]}</span> <strong>${l}</strong>
      </button>`)}return n.length?`<div class="summary-row ability-summary-row">${n.join("")}</div>`:""}function L(e,t){const o=t?.trim();return o?`<div class="summary-row detail-row"><span class="label">${e}:</span> ${v(o)}</div>`:""}function G(e,t){const o=e.damageDescription?.trim(),n=e.damageTags?.trim(),s=!!(e.damage?.trim()||o||n),y=e.hpCurrent!==void 0||e.hpMax!==void 0,c=e.hpCurrent!==void 0?`HP ${e.hpCurrent}${e.hpMax!==void 0?`/${e.hpMax}`:""}`:`Maximum HP ${e.hpMax}`,l=[e.armor!==void 0?`<span class="stat-group armor-stat">${C("shield")}<span>${e.armor}</span></span>`:"",y?`<span class="hp-group">
          ${e.hpCurrent!==void 0?'<button class="hp-button" type="button" data-hp="-1" aria-label="Decrease HP">−</button>':""}
          <span class="hp-value">${c}</span>
          ${e.hpCurrent!==void 0?'<button class="hp-button" type="button" data-hp="1" aria-label="Increase HP">+</button>':""}
        </span>`:""].filter(Boolean),A=e.level!==void 0&&e.xp!==void 0&&e.xp>=e.level+7,b=[e.level!==void 0?`<span class="level-value ${A?"level-ready":""}">Lv ${e.level}</span>`:"",e.xp!==void 0?`<span class="xp-group">
          <button class="xp-button" type="button" data-xp="-1" aria-label="Decrease XP">−</button>
          <span>XP ${e.xp}</span>
          <button class="xp-button" type="button" data-xp="1" aria-label="Increase XP">+</button>
        </span>`:""].filter(Boolean),$=e.moves?.trim(),x=e.treasure?.trim(),R=t?H(t.inventory):void 0,m=t&&R!==void 0?B(R,t.fields.maxLoad):void 0,O=m==="Encumbered (-1)"?"encumbered-minus-one":m==="Encumbered (X)"?"encumbered-x":"";return`
    ${l.length?`<div class="summary-row combat-row">${l.join("")}</div>`:""}
    ${s?`<div class="summary-row damage-row">
          ${C("sword")}
          ${e.damage?.trim()?`<button class="damage" type="button" id="damage" title="Roll damage">🎲 ${v(e.damage.trim())}</button>`:""}
          ${o?`<span class="damage-description">(${v(o)})</span>`:""}
          ${n?`<span class="descriptors">${v(n)}</span>`:""}
        </div>`:""}
    ${S(e,0,3)}
    ${S(e,3,6)}
    ${t?`<div class="summary-row load-row ${O}">
          ${N(t.inventory,t.fields.maxLoad)}
          ${m?`<strong>${m}</strong>`:""}
        </div>`:""}
    ${b.length?`<div class="summary-row progression-summary-row">${b.join("")}</div>`:""}
    ${L("Tags",e.tags)}
    ${L("Instinct",e.instinct)}
    ${$?`<div class="summary-row detail-row">
          <span class="label">Moves:</span>
          <div class="markdown-content">${T($)}</div>
        </div>`:""}
    ${x?`<div class="summary-row detail-row">
          <span class="label">Treasure:</span>
          <div class="markdown-content">${T(x)}</div>
        </div>`:""}`}const i=document.querySelector("#context-menu"),K=new URL("./",window.location.href),M=new URLSearchParams(window.location.search),J=M.get("preview");let a,g=!1,u,d,f;function h(e){const t=e.metadata[P];return _(t)?t:{}}function k(e){const t=document.documentElement;t.dataset.obrTheme=e.mode.toLowerCase(),t.style.setProperty("--dw-text",e.text.primary),t.style.setProperty("--dw-text-secondary",e.text.secondary),t.style.setProperty("--dw-primary",e.primary.main)}function w(){if(!a){i.innerHTML='<p class="loading">Select one character token.</p>';return}const e=h(a);i.innerHTML=`
    <section class="panel">
      <div class="summary" aria-label="Creature summary">${G(e,f)}</div>
      <button class="edit" type="button" id="edit">Edit creature</button>
    </section>`;for(const t of i.querySelectorAll("[data-hp]"))t.addEventListener("click",()=>{Q(Number(t.dataset.hp))});for(const t of i.querySelectorAll("[data-xp]"))t.addEventListener("click",()=>{ee(Number(t.dataset.xp))});for(const t of i.querySelectorAll("[data-modifier]"))t.addEventListener("click",()=>te(t));for(const t of i.querySelectorAll("[data-roll-expression]"))t.addEventListener("click",()=>oe(t));i.querySelector("#damage")?.addEventListener("click",ae),i.querySelector("#edit")?.addEventListener("click",()=>{re()})}async function Q(e){if(!(!a||!u||g)){g=!0;for(const t of i.querySelectorAll("[data-hp]"))t.disabled=!0;try{const t=(await r.scene.items.getItems([a.id]))[0];if(!t)return;const n=h(t).hpCurrent??0,s=z(n,e);await u.updateCreatureFields(t.id,{hpCurrent:s})}catch(t){console.error("DWTools could not update creature HP",t),r.notification.show(t instanceof Error?t.message:"DWTools could not update creature HP.","ERROR")}finally{g=!1,w()}}}async function ee(e){if(!a||!u)return;const t=(await r.scene.items.getItems([a.id]))[0];if(!t)return;const o=h(t);try{await u.updateCreatureFields(t.id,{xp:Math.max(0,(o.xp??0)+e)})}catch(n){console.error("DWTools could not update XP",n),r.notification.show(n instanceof Error?n.message:"DWTools could not update XP.","ERROR")}}function te(e){const t=Number(e.dataset.modifier);if(!Number.isFinite(t))return;const o=t>=0?"+":"",n=V(`2d6${o}${t}`);n&&r.notification.show(n,"SUCCESS")}function oe(e){const t=e.dataset.rollExpression;t&&D(t)}function D(e){const t=Z(e);if(!t.ok){r.notification.show(t.message,"ERROR");return}r.notification.show(t.message,"SUCCESS")}function ae(){if(!a)return;const e=h(a).damage?.trim();if(!e){r.notification.show("This creature has no damage expression.","WARNING");return}D(e)}async function re(){if(!a)return;const e=new URL(K);e.searchParams.set("itemId",a.id),await r.popover.open({id:Y,url:e.toString(),height:760,width:390})}async function p(){const e=await r.player.getSelection();a=e?.length===1?(await r.scene.items.getItems([e[0]]))[0]:void 0,f=void 0;const t=a&&I(a);if(t&&d){const o=await d.inspect(t.characterId);f=o.status==="active"?o.record:void 0}w()}if(J==="context"){a={id:"preview",name:"Frogman",metadata:{[P]:{tags:"Solitary, Small, Intelligent, Stealthy, Devious",armor:1,hpCurrent:7,hpMax:10,damage:"b[2d6]+1",damageDescription:"Claws",damageTags:"Close, Messy",level:3,xp:10,scores:[16,13,10,8,11,7],conditions:{weak:-1},instinct:"To defend the drowned temple",moves:`Strike from beneath the water
Call the marsh to its aid`,treasure:"A waterlogged purse and a silver idol",visibleToPlayers:!0}}},f={schemaVersion:3,id:"preview-character",fields:{name:"Frogman",maxLoad:11},inventory:[["Coin",.01,137],["Bag of Books",.4,3]],revision:1,createdAt:"2026-07-27T12:00:00.000Z",createdBy:"preview",updatedAt:"2026-07-27T12:00:00.000Z",updatedBy:"preview",writeId:"preview-write"};const e=M.get("theme")==="light";document.documentElement.dataset.obrTheme=e?"light":"dark",document.documentElement.style.setProperty("--dw-text",e?"#27272a":"#f4f4f5"),document.documentElement.style.setProperty("--dw-text-secondary",e?"#52525b":"#d4d4d8"),document.documentElement.style.setProperty("--dw-primary","#7c3aed"),w()}else r.isAvailable?r.onReady(async()=>{try{await U()}catch(e){console.error("DWTools metadata namespace migration failed",e),i.innerHTML='<p class="error">DWTools could not migrate its saved data. Reload Owlbear and try again.</p>',await r.notification.show("DWTools could not migrate its saved data.","ERROR");return}d=X(),u=j(d),k(await r.theme.getTheme()),r.theme.onChange(k),await p(),r.player.onChange(()=>{p()}),r.scene.items.onChange(e=>{if(!a)return;const t=e.find(o=>o.id===a.id);t&&(a=t,p())}),d.subscribe(e=>{const t=a&&I(a);t&&e.some(o=>o.characterId===t.characterId)&&p()})}):i.innerHTML='<p class="error">Open this menu inside Owlbear Rodeo.</p>';
