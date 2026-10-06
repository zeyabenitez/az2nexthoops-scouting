/* =====================================================================
   AZ2NEXTHOOPS — app logic
   - Public, read-only scouting site (Reports + Ranked Boards).
   - Password-protected Editor lets the owner add/edit reports & boards
     through forms (no coding). Edits save to the browser; "Publish"
     downloads an updated data.js to put on the host.
   ===================================================================== */

/* ---------------------------------------------------------------------
   >>> CHANGE THIS to your own private password (owner-only editor) <<<
   --------------------------------------------------------------------- */
const ADMIN_PASSWORD = "zeya2002!"; // <-- edit me

/* ---------- Evaluation pillars (structure the Analysis area) ---------- */
const PILLARS = [
  { id:"shooting", label:"Shooting", blurb:"What has to be true about a shot before you trust it.", fields:[
    {id:"mechanics",   label:"Mechanics"},
    {id:"rangeVolume", label:"Range / Volume"},
    {id:"shotSelection",label:"Shot Selection"},
    {id:"offMovement", label:"Off-Movement vs Catch-and-Shoot"},
  ]},
  { id:"creation", label:"Shot Creation & Handle", blurb:"How a player manufactures offense on their own.", fields:[
    {id:"changeOfPace", label:"Change of Pace"},
    {id:"separation",   label:"Separation Package"},
    {id:"finishing",    label:"Finishing Through Contact"},
    {id:"selfVsScheme", label:"Self-Creation vs Scheme-Reliant"},
  ]},
  { id:"passing", label:"Passing & Feel", blurb:"How a player processes the game in real time.", fields:[
    {id:"liveVision",  label:"Live-Dribble Vision"},
    {id:"processing",  label:"Processing Speed"},
    {id:"decisions",   label:"Decision-Making Under Pressure"},
    {id:"feel",        label:"Feel for Teammates / Timing"},
  ]},
  { id:"defense", label:"Defense", blurb:"What you need to see on the other end of the floor.", fields:[
    {id:"onBall",      label:"On-Ball"},
    {id:"offBall",     label:"Off-Ball / Rotations"},
    {id:"versatility", label:"Versatility Across Positions"},
    {id:"effort",      label:"Effort / Discipline"},
  ]},
  { id:"athletic", label:"Athletic Tools & Physical Profile", blurb:"What has to be true physically before skill even matters.", fields:[
    {id:"sizeLength", label:"Size / Length"},
    {id:"speed",      label:"Speed / Quickness"},
    {id:"vertical",   label:"Vertical / Explosion"},
    {id:"strength",   label:"Strength / Frame Projection"},
  ]},
  { id:"rebounding", label:"Rebounding & Screening", blurb:"The unselfish, unglamorous stuff that wins possessions.", fields:[
    {id:"boxOut",      label:"Box-Out / Positioning"},
    {id:"timing",      label:"Timing / Second Effort"},
    {id:"screening",   label:"Screen-Setting Quality"},
    {id:"physicality", label:"Physicality Without Fouling"},
  ]},
  { id:"offball", label:"Off-Ball Movement", blurb:"What a player does in the other 90% of possessions.", fields:[
    {id:"cutting",     label:"Cutting Timing / Angles"},
    {id:"spacing",     label:"Spacing IQ"},
    {id:"relocation",  label:"Relocation"},
    {id:"navigation",  label:"Screen Navigation"},
  ]},
  { id:"makeup", label:"Makeup & Intangibles", blurb:"Traits that predict whether the rest keeps developing.", fields:[
    {id:"motor",        label:"Competitiveness / Motor"},
    {id:"coachability", label:"Coachability"},
    {id:"adversity",    label:"Response to Adversity"},
    {id:"leadership",   label:"Leadership / Connectivity"},
  ]},
];

/* ---------- Scout context (internal — NOT shown on public report) ---------- */
const COMP_HINTS = {
  "NBA":"NBA rotation context — who they guard and who guards them nightly; role within the roster.",
  "College":"Conference strength, strength of schedule, and big-game/tournament exposure.",
  "G-League":"G-League role vs. NBA call-up translation; how the assignment is being used.",
  "International":"League + country; domestic vs EuroLeague/FIBA level; age relative to draft cohort."
};
const ROLE_HINTS = {
  "NBA":"Rotation role — starter, reserve, or situational (3-and-D, backup PG, lob threat, etc.).",
  "College":"Usage within the system — primary initiator, connective piece, or defensive specialist.",
  "G-League":"Development focus of the assignment; what the parent club is evaluating.",
  "International":"Role on club and national team; offensive/defensive responsibility."
};
const CONTEXT_FIELDS = [
  {id:"age", label:"Age / Birth Year"},
  {id:"role", label:"Role on current team", hint:l=>ROLE_HINTS[l]||""},
  {id:"competition", label:"Competition level / league context", hint:l=>COMP_HINTS[l]||""},
  {id:"physicalGrowth", label:"Physical growth / frame projection", hint:"Room to add strength? Wingspan usage? Does quickness hold as he fills out?"},
  {id:"mentalAdaptability", label:"Mental adaptability / coachability", hint:"Open learner? Adjusts in-game? Stays within role? Provides versatility?"},
  {id:"referencePoints", label:"Reference points (comparisons)", hint:"Similar players who succeeded — and who failed. Anchors the eval in experience, not romance."}
];

const POS_GROUPS = { guards:["PG","SG"], wings:["SF"], bigs:["PF","C"] };
const LS_KEY = "az2nexthoops_data_v1";

/* ---------- State ---------- */
let DATA=null;
let view="reports";
let fLevel="NBA", fPos="All", fSearch="";
let bLevel="NBA", bCat="overall";
let adminUnlocked=false;
let currentReaderId=null;
let suppressHash=false;

/* ============================ Helpers ============================ */
function el(tag, attrs, children){
  const e=document.createElement(tag);
  if(attrs) for(const k in attrs){ const v=attrs[k];
    if(v===null||v===false||v===undefined) continue;
    if(k==="class") e.className=v;
    else if(k==="text") e.textContent=v;
    else if(k==="html") e.innerHTML=v;
    else if(k==="dataset") Object.assign(e.dataset,v);
    else if(k.indexOf("on")===0 && typeof v==="function") e.addEventListener(k.slice(2).toLowerCase(),v);
    else e.setAttribute(k,v);
  }
  const kids = children==null?[]:(Array.isArray(children)?children:[children]);
  kids.forEach(c=>{ if(c==null||c===false) return; e.appendChild(typeof c==="string"?document.createTextNode(c):c); });
  return e;
}
function uid(){ return "p_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }
function toast(msg,err){ const t=document.getElementById("toast"); t.textContent=msg; t.className="toast show"+(err?" err":""); clearTimeout(t._t); t._t=setTimeout(()=>t.className="toast",2600); }
function fmtDate(ts){ if(!ts) return "—"; return new Date(ts).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}); }
function getPlayer(id){ return (DATA.players||[]).find(p=>p.id===id); }
function catMeta(id){ return DATA.boardCategories.find(c=>c.id===id); }
function boardAllows(catId,pos){ const c=catMeta(catId); if(!c||!c.byPosition) return true; return (POS_GROUPS[catId]||[]).includes(pos); }
function download(name,text){
  const b=new Blob([text],{type:"text/plain"}); const u=URL.createObjectURL(b);
  const a=el("a",{href:u,download:name}); document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(u); a.remove(); },500);
}

/* ============================ Data layer ============================ */
function ensurePlayer(p){
  p.vitals=p.vitals||{};
  p.strengths=p.strengths||[];
  p.questions=p.questions||[];
  p.objective=p.objective||"";
  p.role=p.role||"";
  p.context=p.context||{};
  p.analysis=p.analysis||{};
  PILLARS.forEach(pl=>{ p.analysis[pl.id]=p.analysis[pl.id]||{}; pl.fields.forEach(f=>{ if(p.analysis[pl.id][f.id]==null) p.analysis[pl.id][f.id]=""; }); });
  CONTEXT_FIELDS.forEach(f=>{ if(p.context[f.id]==null) p.context[f.id]=""; });
  return p;
}
function ensureBoards(){
  DATA.boards=DATA.boards||{};
  const ids=new Set(DATA.players.map(p=>p.id));
  DATA.levels.forEach(lv=>{
    DATA.boards[lv]=DATA.boards[lv]||{};
    DATA.boardCategories.forEach(c=>{
      let arr=Array.isArray(DATA.boards[lv][c.id])?DATA.boards[lv][c.id]:[];
      arr=arr.filter(id=>ids.has(id)); // prune missing players
      DATA.boards[lv][c.id]=arr;
    });
  });
}
function loadData(){
  const seed=window.SEED_DATA;
  let local=null;
  try{ local=JSON.parse(localStorage.getItem(LS_KEY)||"null"); }catch(e){}
  if(local && local.dataVersion>=seed.dataVersion){ DATA=local; }
  else { DATA=clone(seed); try{ localStorage.removeItem(LS_KEY); }catch(e){} }
  DATA.players=(DATA.players||[]).map(ensurePlayer);
  ensureBoards();
}
function saveData(){ try{ localStorage.setItem(LS_KEY,JSON.stringify(DATA)); }catch(e){} }

/* ============================ Render shell ============================ */
function renderHeader(){
  document.querySelectorAll(".nav-btn[data-view]").forEach(b=>{
    b.classList.toggle("active", b.dataset.view===view);
  });
  const tog=document.getElementById("adminToggle");
  const lab=document.getElementById("adminToggleLabel");
  tog.classList.toggle("unlocked",adminUnlocked);
  lab.textContent=adminUnlocked?"Editor on":"Editor";
}
function render(){
  renderHeader();
  const app=document.getElementById("app");
  app.innerHTML="";
  const wrap=el("section",{class:"view"});
  if(adminUnlocked) wrap.appendChild(renderAdminBar());
  wrap.appendChild(view==="reports"?renderReports():renderBoards());
  app.appendChild(wrap);
}

/* ============================ Admin bar ============================ */
function renderAdminBar(){
  const bar=el("div",{class:"adminbar"},[
    el("div",{class:"ab-title"},[el("span",{class:"dot"}),"Editor unlocked — only you can change reports & boards"]),
    el("div",{class:"spacer"}),
    el("button",{class:"btn btn-ghost btn-sm",onclick:publish},[icon("download"),"Publish (download data.js)"]),
    el("button",{class:"btn btn-ghost btn-sm",onclick:reloadFromFile},[icon("refresh"),"Sync from file"]),
    el("button",{class:"btn btn-ghost btn-sm",onclick:()=>{ adminUnlocked=false; render(); toast("Editor locked."); }},[icon("lock"),"Lock editor"])
  ]);
  return el("div",{},[bar, el("div",{class:"adminhint"},
    "Tip: edits save automatically to THIS browser. To push changes to the public site, click Publish, then replace js/data.js on your host. On other devices click “Sync from file” after updating.")
  ]);
}
function icon(name){
  const p={download:"M12 3v12m0 0l-4-4m4 4l4-4M5 21h14",refresh:"M21 12a9 9 0 1 1-3-6.7M21 4v4h-4",lock:"M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z",
    plus:"M12 5v14M5 12h14",edit:"M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",trash:"M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
    close:"M6 6l12 12M18 6L6 18",print:"M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z",chev:"M6 9l6 6 6-6",up:"M12 19V5M5 12l7-7 7 7",down:"M12 5v14M5 12l7 7 7-7",
    unlock:"M8 11V7a4 4 0 0 1 7.5-2M5 11h14v10H5z"};
  const ns="http://www.w3.org/2000/svg";
  const s=document.createElementNS(ns,"svg"); s.setAttribute("width","15"); s.setAttribute("height","15"); s.setAttribute("viewBox","0 0 24 24"); s.setAttribute("fill","none"); s.setAttribute("stroke","currentColor"); s.setAttribute("stroke-width","2"); s.setAttribute("stroke-linecap","round"); s.setAttribute("stroke-linejoin","round");
  const path=document.createElementNS(ns,"path"); path.setAttribute("d",p[name]||p.plus); s.appendChild(path); return s;
}

/* ============================ Reports view ============================ */
function renderReports(){
  const root=el("div",{class:"reports"});
  const head=el("div",{class:"view-head"},[
    el("div",{},[ el("h1",{class:"view-title",text:"Scouting Reports"}),
      el("p",{class:"view-sub",text:"Clean, role-first evaluations — by level and position."}) ]),
    adminUnlocked ? el("button",{class:"btn btn-accent",onclick:()=>openEditor(null)},[icon("plus"),"Add Report"]) : null
  ]);
  root.appendChild(head);

  const tb=el("div",{class:"toolbar"},[
    el("div",{class:"toolbar-row"},[
      el("span",{class:"lbl",text:"Level"}),
      el("div",{class:"tab-group"}, DATA.levels.map(lv=>el("button",{class:"tab"+(lv===fLevel?" active":""),onclick:()=>{fLevel=lv;render();}},[lv])))
    ]),
    el("div",{class:"toolbar-row"},[
      el("span",{class:"lbl",text:"Position"}),
      el("div",{class:"tab-group"}, ["All",...DATA.positions].map(p=>el("button",{class:"chip"+((p===fPos?" active":"")),onclick:()=>{fPos=p;render();}},[p]))),
      el("input",{class:"search",type:"search",placeholder:"Search by name or team…",value:fSearch,oninput:e=>{fSearch=e.target.value;renderReportsList();}})
    ])
  ]);
  root.appendChild(tb);

  const listWrap=el("div",{id:"reportsList"}); root.appendChild(listWrap);
  renderReportsList(listWrap);
  return root;
}
function visiblePlayers(){
  return DATA.players.filter(p=>
    p.level===fLevel &&
    (fPos==="All"||p.position===fPos) &&
    (!fSearch || (p.name+" "+(p.team||"")).toLowerCase().includes(fSearch.toLowerCase()))
  );
}
function renderReportsList(listWrap){
  const wrap=listWrap||document.getElementById("reportsList");
  wrap.innerHTML="";
  const items=visiblePlayers();
  if(!items.length){ wrap.appendChild(el("div",{class:"empty"},[el("h3",{text:"No reports here yet"}),el("div",{text: adminUnlocked?"Click “Add Report” to create the first one for this level/position.":"Check another level or position — reports are still being added."})])); return; }
  const grid=el("div",{class:"grid"});
  items.forEach(p=>grid.appendChild(playerCard(p)));
  wrap.appendChild(grid);
}
function playerCard(p){
  const card=el("div",{class:"card",onclick:()=>openReader(p.id)},[
    el("div",{class:"card-top"},[
      el("div",{},[ el("div",{class:"card-name",text:p.name}) ]),
      el("span",{class:"card-pos",text:p.position||"—"})
    ]),
    el("div",{class:"card-meta",text:[p.team,p.vitals&&p.vitals.height].filter(Boolean).join(" · ")}),
    p.objective?el("div",{class:"card-obj",text:p.objective}):null,
    el("div",{class:"card-foot"},[
      el("span",{class:"card-role",text:p.role?("Projected: "+p.role):""}),
      el("span",{class:"badge-level",text:p.level})
    ])
  ]);
  if(adminUnlocked){
    const actions=el("div",{class:"card-actions",onclick:e=>e.stopPropagation()},[
      el("button",{class:"btn btn-ghost btn-sm",onclick:e=>{e.stopPropagation();openEditor(p.id);}},[icon("edit"),"Edit"]),
      el("button",{class:"btn btn-danger btn-sm",onclick:e=>{e.stopPropagation();deletePlayer(p.id);}},[icon("trash")])
    ]);
    card.appendChild(actions);
  }
  return card;
}

/* ============================ Boards view ============================ */
function renderBoards(){
  const root=el("div",{class:"boards"});
  const head=el("div",{class:"view-head"},[
    el("div",{},[ el("h1",{class:"view-title",text:"Ranked Boards"}),
      el("p",{class:"view-sub",text:"Level-sealed boards — leagues and positions are never mixed."}) ])
  ]);
  root.appendChild(head);

  const tb=el("div",{class:"toolbar board-controls"},[
    el("div",{class:"toolbar-row"},[
      el("span",{class:"lbl",text:"Level"}),
      el("div",{class:"tab-group"}, DATA.levels.map(lv=>el("button",{class:"tab"+(lv===bLevel?" active":""),onclick:()=>{bLevel=lv;render();}},[lv])))
    ]),
    el("div",{class:"toolbar-row"},[
      el("span",{class:"lbl",text:"Board"}),
      el("div",{class:"tab-group"}, DATA.boardCategories.map(c=>el("button",{class:"tab"+(c.id===bCat?" active":""),onclick:()=>{bCat=c.id;render();}},[c.label])))
    ])
  ]);
  root.appendChild(tb);

  if(adminUnlocked) root.appendChild(renderBoardEditor());

  const ids=DATA.boards[bLevel][bCat]||[];
  const list=el("div",{class:"ranklist"});
  if(!ids.length){
    list.appendChild(el("div",{class:"empty"},[el("h3",{text:"This board is empty"}),el("div",{text: adminUnlocked?"Add players from this level using the editor above.":"Check back — this board is still being built."})]));
  } else {
    ids.forEach((id,i)=>{
      const p=getPlayer(id); if(!p) return;
      const row=el("div",{class:"rank-row"+(adminUnlocked?"":" clickable"),onclick:()=>{ if(!adminUnlocked) openReader(p.id); }},[
        el("div",{class:"rank-num",text:String(i+1)}),
        el("div",{class:"rank-info"},[
          el("div",{class:"rank-name",text:p.name}),
          el("div",{class:"rank-meta",text:[p.team,p.vitals&&p.vitals.height].filter(Boolean).join(" · ")})
        ]),
        el("span",{class:"rank-pos",text:p.position||"—"})
      ]);
      list.appendChild(row);
    });
  }
  root.appendChild(list);
  return root;
}
function renderBoardEditor(){
  const ids=DATA.boards[bLevel][bCat]||[];
  const eligible=DATA.players.filter(p=>p.level===bLevel && boardAllows(bCat,p.position));
  const available=eligible.filter(p=>!ids.includes(p.id));

  const box=el("div",{class:"toolbar",style:"margin-top:18px"},[
    el("div",{class:"ab-title",style:"color:var(--navy)"},[icon("edit"),"Manage this board ("+bLevel+" · "+catMeta(bCat).label+")"]),
    el("div",{class:"toolbar-row"},[
      el("select",{id:"boardAddSel",style:"flex:1;min-width:200px;border:1px solid var(--line-2);border-radius:10px;padding:9px 12px;font-size:14px"},
        [el("option",{value:"",text: available.length? "Select a player to add…" : "No eligible players available"})]
          .concat(available.map(p=>el("option",{value:p.id,text:p.name+" — "+p.position})))
      ),
      el("button",{class:"btn btn-accent btn-sm",onclick:()=>{ const sel=document.getElementById("boardAddSel"); if(sel.value){ addToBoard(sel.value); } }},[icon("plus"),"Add to board"])
    ])
  ]);
  const cur=el("div",{style:"margin-top:10px;display:flex;flex-direction:column;gap:8px"});
  ids.forEach((id,i)=>{
    const p=getPlayer(id);
    cur.appendChild(el("div",{class:"rank-row"},[
      el("div",{class:"rank-num",text:String(i+1)}),
      el("div",{class:"rank-info"},[el("div",{class:"rank-name",text:p?p.name:"(missing)"}),el("div",{class:"rank-meta",text:p?p.position:""})]),
      el("button",{class:"btn btn-ghost btn-icon btn-sm",title:"Move up",onclick:()=>moveBoard(i,-1)},[icon("up")]),
      el("button",{class:"btn btn-ghost btn-icon btn-sm",title:"Move down",onclick:()=>moveBoard(i,1)},[icon("down")]),
      el("button",{class:"btn btn-danger btn-icon btn-sm",title:"Remove",onclick:()=>removeFromBoard(i)},[icon("trash")])
    ]));
  });
  if(!ids.length) cur.appendChild(el("div",{class:"empty",style:"padding:18px"},[el("div",{text:"Board is empty — add players above."})]));
  box.appendChild(cur);
  return el("div",{},[box]);
}
function addToBoard(id){ DATA.boards[bLevel][bCat].push(id); saveData(); render(); toast("Added to board."); }
function moveBoard(i,dir){
  const arr=DATA.boards[bLevel][bCat]; const j=i+dir;
  if(j<0||j>=arr.length) return;
  [arr[i],arr[j]]=[arr[j],arr[i]]; saveData(); render();
}
function removeFromBoard(i){ DATA.boards[bLevel][bCat].splice(i,1); saveData(); render(); toast("Removed from board."); }

/* ============================ Reader (white doc) ============================ */
function openReader(id){
  const p=getPlayer(id); if(!p) return;
  currentReaderId=id;
  if(!suppressHash){ suppressHash=true; try{ location.hash="report/"+id; }catch(e){} suppressHash=false; }

  const v=p.vitals||{};
  const metaBits=[p.level&&{t:p.level,pos:false}, p.position&&{t:p.position,pos:true}, p.team, v.height, v.weight&&(v.weight+" lb"), v.age&&(v.age+" yrs"), v.classYear, v.handedness&&(v.handedness+"-hand")]
    .filter(Boolean).map(b=> typeof b==="string"? el("span",{class:"pill",text:b}) : el("span",{class:"pill"+(b.pos?" pos":""),text:b.t}));

  const doc=el("div",{class:"doc"},[
    el("div",{class:"doc-mast"},[
      el("div",{},[
        el("h1",{class:"doc-name",text:p.name}),
        el("div",{class:"doc-id"},metaBits)
      ])
    ]),
    section("Objective Statement", [ el("p",{class:"objective",text:p.objective||"—"}) ]),
    analysisSection(p),
    p.role? section("Projected Role",[ el("p",{class:"role-line",text:p.role}) ]):null,
    (p.strengths&&p.strengths.length)? section("Strengths",[ el("ul",{},p.strengths.map(s=>el("li",{text:s}))) ]):null,
    (p.questions&&p.questions.length)? section("Questions",[ el("ul",{},p.questions.map(s=>el("li",{text:s}))) ]):null,
    el("div",{class:"doc-foot"},[
      el("span",{text:"AZ2NEXTHOOPS · Scouting Report"}),
      el("span",{text:"Report date: "+fmtDate(p.updatedAt)})
    ])
  ]);
  const bar=el("div",{class:"reader-bar"},[
    el("button",{class:"btn btn-ghost btn-sm",onclick:closeReader},[icon("close"),"Close"]),
    el("button",{class:"btn btn-ghost btn-sm",onclick:()=>window.print()},[icon("print"),"Print / PDF"]),
    el("div",{class:"spacer"}),
    adminUnlocked? el("button",{class:"btn btn-accent btn-sm",onclick:()=>openEditor(p.id)},[icon("edit"),"Edit report"]):null
  ]);
  const overlay=el("div",{class:"reader-overlay",onclick:e=>{ if(e.target===e.currentTarget) closeReader(); }},
    [ el("div",{class:"reader"},[bar,doc]) ]);
  showModal(overlay);
}
function closeReader(){ currentReaderId=null; if(!suppressHash && location.hash){ suppressHash=true; try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){ try{ location.hash=""; }catch(_){} } suppressHash=false; } closeModal(); }
function section(title,children){ return el("section",{},[el("h2",{text:title})].concat(children||[])); }
function analysisSection(p){
  const parts=[el("h2",{text:"Analysis"})];
  let any=false;
  PILLARS.forEach(pl=>{
    const filled=pl.fields.filter(f=>(p.analysis[pl.id][f.id]||"").trim());
    if(!filled.length) return; any=true;
    parts.push(el("h3",{text:pl.label}));
    filled.forEach(f=>parts.push(el("div",{class:"analysis-field"},[
      el("span",{class:"af-label",text:f.label}),
      el("div",{class:"af-text",text:p.analysis[pl.id][f.id]})
    ])));
  });
  if(!any) parts.push(el("p",{text:"—"}));
  return el("section",{},parts);
}

/* ============================ Modal plumbing ============================ */
function showModal(node){ const r=document.getElementById("modalRoot"); r.innerHTML=""; r.appendChild(node); }
function closeModal(){ document.getElementById("modalRoot").innerHTML=""; }

/* ============================ Admin auth ============================ */
function promptLogin(){
  const card=el("div",{class:"modal login-box",style:"max-width:380px"},[
    el("div",{class:"modal-body",style:"padding:30px"},[
      el("img",{class:"brand-logo",src:"assets/az2nexthoops-logo.jpg",alt:"logo"}),
      el("h3",{text:"Owner access",style:"color:var(--navy)"}),
      el("p",{text:"Enter your editor password to add or edit reports."}),
      el("input",{id:"pwInput",type:"password",placeholder:"Password",style:"width:100%;border:1px solid var(--line-2);border-radius:9px;padding:11px;font-size:15px;text-align:center",onkeydown:e=>{ if(e.key==="Enter") doLogin(); }}),
      el("div",{style:"margin-top:14px;display:flex;gap:8px;justify-content:center"},[
        el("button",{class:"btn btn-accent",onclick:doLogin},["Unlock"]),
        el("button",{class:"btn btn-ghost",onclick:closeModal},["Cancel"])
      ])
    ])
  ]);
  const overlay=el("div",{class:"modal-overlay",onclick:e=>{ if(e.target===e.currentTarget) closeModal(); }},[card]);
  showModal(overlay);
  setTimeout(()=>{ const i=document.getElementById("pwInput"); if(i) i.focus(); },50);
}
function doLogin(){
  const v=(document.getElementById("pwInput").value||"").trim();
  if(v===ADMIN_PASSWORD){ adminUnlocked=true; closeModal(); render(); toast("Editor unlocked — welcome back."); }
  else { toast("Wrong password.",true); const i=document.getElementById("pwInput"); if(i){ i.value=""; i.focus(); } }
}

/* ============================ Editor (add/edit report) ============================ */
function openEditor(id){
  const isNew=!id;
  const p=isNew? ensurePlayer({id:uid(),name:"",level:fLevel,position:"PG",team:""}) : clone(getPlayer(id));
  const draft=p;

  const body=el("div",{class:"modal-body"});
  // identity
  body.appendChild(el("div",{class:"field"},[el("label",{text:"Player name *"}) ,
    el("input",{type:"text","data-bind":"name",value:draft.name,placeholder:"e.g. Jordan Mercer"})]));
  body.appendChild(el("div",{class:"row-2"},[
    fieldSelect("Level *","level",DATA.levels,draft.level),
    fieldSelect("Position *","position",DATA.positions,draft.position)
  ]));
  body.appendChild(el("div",{class:"field"},[el("label",{text:"Team / affiliation"}) ,
    el("input",{type:"text","data-bind":"team",value:draft.team||"",placeholder:"e.g. Oregon / KK Zagreb / Maine Celtics"})]));

  // vitals
  body.appendChild(el("div",{class:"row-3"},[
    fieldInput("Height","vitals.height",draft.vitals.height,"6'5\""),
    fieldInput("Weight (lb)","vitals.weight",draft.vitals.weight,"205"),
    fieldInput("Age","vitals.age",draft.vitals.age,"20")
  ]));
  body.appendChild(el("div",{class:"row-2"},[
    fieldInput("Class / Year","vitals.classYear",draft.vitals.classYear,"Sophomore"),
    fieldSelect("Handedness","vitals.handedness",["","Right","Left","Ambidextrous"],draft.vitals.handedness)
  ]));

  // objective + role
  body.appendChild(el("div",{class:"field"},[el("label",{text:"Objective statement *"}),
    el("div",{class:"hint",text:"Your lens — the one-paragraph summary you'd hand to a GM. Role, projection, and the decision it supports."}),
    el("textarea",{"data-bind":"objective",rows:3,placeholder:"Efficient, low-maintenance ___ who projects as ___ …"},[draft.objective])]));
  body.appendChild(el("div",{class:"field"},[el("label",{text:"Projected role"}),
    el("input",{type:"text","data-bind":"role",value:draft.role||"",placeholder:"e.g. Backup PG / developmental 3-and-D point"})]));

  // strengths / questions
  body.appendChild(el("div",{class:"field"},[el("label",{text:"Strengths"}), listEditor("le-strengths",draft.strengths,"Add a strength")]));
  body.appendChild(el("div",{class:"field"},[el("label",{text:"Questions (open concerns)"}), listEditor("le-questions",draft.questions,"Add a question")]));

  // analysis accordions
  body.appendChild(el("div",{class:"field"},[el("label",{text:"Analysis (fact-backed detail)"}),
    el("div",{class:"hint",text:"Fill what you have — leave the rest blank. Only sections you fill in appear on the public report."})]));
  PILLARS.forEach(pl=>{
    const inner=el("div",{class:"acc-body"});
    pl.fields.forEach(f=>inner.appendChild(fieldTA(pl.label+" — "+f.label,"analysis."+pl.id+"."+f.id,draft.analysis[pl.id][f.id])));
    body.appendChild(accordion(pl.label,pl.blurb,inner,false));
  });

  // context (internal)
  const cbody=el("div",{class:"acc-body"});
  cbody.appendChild(el("div",{class:"hint",style:"margin-bottom:10px",text:"Internal scout context — these guide your evaluation but are NEVER shown on the public report."}));
  CONTEXT_FIELDS.forEach(cf=>{
    const hint=typeof cf.hint==="function"?cf.hint(draft.level):cf.hint;
    cbody.appendChild(fieldTAHint(cf.label,"context."+cf.id,draft.context[cf.id],hint));
  });
  body.appendChild(accordion("Scout context (internal only)","Age · role · competition · physical growth · mental adaptability · reference points",cbody,true));

  const modal=el("div",{class:"modal",id:"editorModal"},[
    el("div",{class:"modal-head"},[el("h3",{text:isNew?"Add scouting report":"Edit scouting report"}),
      el("button",{class:"btn btn-ghost btn-icon btn-sm",onclick:closeModal},[icon("close")])]),
    body,
    el("div",{class:"modal-foot"},[
      !isNew? el("button",{class:"btn btn-danger",onclick:()=>{ deletePlayer(draft.id,true); }},[icon("trash"),"Delete"]):null,
      el("div",{style:"flex:1"}),
      el("button",{class:"btn btn-ghost",onclick:closeModal},["Cancel"]),
      el("button",{class:"btn btn-accent",onclick:()=>saveReport(draft.id,isNew)},["Save report"])
    ])
  ]);
  const overlay=el("div",{class:"modal-overlay",onclick:e=>{ if(e.target===e.currentTarget) closeModal(); }},[modal]);
  showModal(overlay);
  modal.scrollTop=0;
}
function fieldInput(label,bind,val,ph){ return el("div",{class:"field"},[el("label",{text:label}),el("input",{type:"text","data-bind":bind,value:val||"",placeholder:ph||""})]); }
function fieldTA(label,bind,val){ return el("div",{class:"field"},[el("label",{text:label}),el("textarea",{"data-bind":bind,rows:2},[val||""])]); }
function fieldTAHint(label,bind,val,hint){ return el("div",{class:"field"},[el("label",{text:label}),hint?el("div",{class:"hint",text:hint}):null,el("textarea",{"data-bind":bind,rows:2,placeholder:"Internal notes…"},[val||""])]); }
function fieldSelect(label,bind,opts,val){
  return el("div",{class:"field"},[el("label",{text:label}),
    el("select",{"data-bind":bind}, opts.map(o=>el("option",{value:o,selected:o===val,text:o===""?"— select —":o})))
  ]);
}
function accordion(title,sub,bodyEl,context){
  const acc=el("div",{class:"acc"+(context?" acc-context":"")});
  const head=el("div",{class:"acc-head",onclick:()=>acc.classList.toggle("open")},[
    el("div",{},[el("div",{class:"acc-title",text:title}),sub?el("div",{class:"acc-sub",text:sub}):null]),
    el("span",{class:"acc-chev"},[icon("chev")])
  ]);
  acc.appendChild(head); acc.appendChild(bodyEl); return acc;
}
function listEditor(containerId,items,addLabel){
  const wrap=el("div",{class:"list-editor",id:containerId});
  function draw(){
    wrap.innerHTML="";
    (items&&items.length?items:[""]).forEach((val,i)=>{
      const row=el("div",{class:"le-row"},[
        el("input",{type:"text",value:val,placeholder:"Type an item…"}),
        el("button",{class:"btn btn-danger btn-icon btn-sm",title:"Remove",onclick:()=>{ items.splice(i,1); draw(); }},[icon("trash")])
      ]);
      wrap.appendChild(row);
    });
    wrap.appendChild(el("button",{class:"btn btn-ghost btn-sm",onclick:()=>{ items.push(""); draw(); }},[icon("plus"),addLabel]));
  }
  draw();
  return wrap;
}
function readList(containerId){
  const wrap=document.getElementById(containerId); if(!wrap) return [];
  return Array.from(wrap.querySelectorAll(".le-row input")).map(i=>i.value).map(s=>s.trim()).filter(Boolean);
}
function collectDraft(){
  const m=document.getElementById("editorModal");
  const get=p=>{ const e=m.querySelector('[data-bind="'+p+'"]'); return e? (e.value||"").trim():""; };
  const d={ name:get("name"), team:get("team"), level:get("level"), position:get("position"),
    vitals:{height:get("vitals.height"),weight:get("vitals.weight"),age:get("vitals.age"),classYear:get("vitals.classYear"),handedness:get("vitals.handedness")},
    objective:get("objective"), role:get("role"), analysis:{}, context:{} };
  PILLARS.forEach(pl=>{ d.analysis[pl.id]={}; pl.fields.forEach(f=>d.analysis[pl.id][f.id]=get("analysis."+pl.id+"."+f.id)); });
  CONTEXT_FIELDS.forEach(f=>d.context[f.id]=get("context."+f.id));
  d.strengths=readList("le-strengths"); d.questions=readList("le-questions");
  return d;
}
function saveReport(id,isNew){
  const d=collectDraft();
  if(!d.name){ toast("Player name is required.",true); return; }
  if(!d.level||!DATA.levels.includes(d.level)){ toast("Pick a valid level.",true); return; }
  if(!d.position||!DATA.positions.includes(d.position)){ toast("Pick a valid position.",true); return; }
  if(!d.objective){ toast("Add an objective statement.",true); return; }
  const idx=DATA.players.findIndex(p=>p.id===id);
  const rec=ensurePlayer(Object.assign({}, idx>=0?DATA.players[idx]:{id}, d, {updatedAt:Date.now()}));
  if(idx>=0) DATA.players[idx]=rec; else DATA.players.push(rec);
  // keep player on valid boards for its level; if level/position changed, prune from now-invalid position boards
  ensureBoards();
  saveData();
  closeModal();
  if(currentReaderId===id) closeReader();
  render();
  toast(isNew?"Report created.":"Report saved.");
}
function deletePlayer(id,fromEditor){
  const p=getPlayer(id); if(!p) return;
  if(!confirm("Delete the scouting report for "+p.name+"? This also removes them from all boards. This cannot be undone.")) { if(fromEditor) return; else return; }
  DATA.players=DATA.players.filter(x=>x.id!==id);
  ensureBoards(); saveData();
  closeModal(); if(currentReaderId===id) { currentReaderId=null; }
  render();
  toast("Report deleted.");
}

/* ============================ Publish / sync ============================ */
function publish(){
  DATA.dataVersion=(DATA.dataVersion||1)+1;
  saveData();
  const header="/* =====================================================================\n   AZ2NEXTHOOPS — scouting data (SOURCE OF TRUTH for the public site)\n   Generated by Publish on "+new Date().toISOString()+"\n   Replace js/data.js on your host with this file. See README.md.\n   ===================================================================== */\n\n";
  download("data.js", header+"window.SEED_DATA = "+JSON.stringify(DATA,null,2)+";\n");
  toast("Published — data.js downloaded. Replace the file on your host.");
}
function reloadFromFile(){
  if(!confirm("Replace your unsaved browser edits with the latest published data.js on the server?")) return;
  try{ localStorage.removeItem(LS_KEY); }catch(e){}
  loadData(); render(); toast("Loaded the latest published data.js.");
}

/* ============================ Routing / init ============================ */
function onHash(){
  if(suppressHash) return;
  const h=location.hash.replace(/^#/,"");
  if(h.indexOf("report/")===0){
    const id=h.slice("report/".length);
    if(id && id!==currentReaderId) openReader(id);
  } else {
    if(currentReaderId) closeReader();
  }
}
function init(){
  loadData();
  // nav
  document.querySelectorAll(".nav-btn[data-view]").forEach(b=>b.addEventListener("click",()=>{
    view=b.dataset.view; render();
  }));
  document.getElementById("adminToggle").addEventListener("click",()=>{
    if(adminUnlocked){ adminUnlocked=false; render(); toast("Editor locked."); }
    else promptLogin();
  });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ const r=document.getElementById("modalRoot"); if(r&&r.innerHTML.trim()) closeModal(); } });
  window.addEventListener("hashchange",onHash);
  render();
  // open deep link if present
  if(location.hash && location.hash.indexOf("#report/")===0){ const id=location.hash.slice("#report/".length); if(getPlayer(id)) setTimeout(()=>openReader(id),0); }
}
document.addEventListener("DOMContentLoaded",init);
