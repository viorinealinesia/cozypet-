const KEY="cozypet-v1";
const defaults={name:"Mochi",species:"bunny",coins:120,level:1,exp:0,hunger:78,happiness:86,energy:74,health:92,clean:82,streak:1,lastClaim:"",sound:true,dark:false,ownedDecor:["rug"],decorEquipped:[],foods:{berry:0,carrot:0,cake:0},achievements:{}};
let S=JSON.parse(localStorage.getItem(KEY)||"null")||structuredClone(defaults);
let shopMode="food", soundOn=S.sound;

const species={bunny:"🐰",cat:"🐱",bear:"🐻",hamster:"🐹"};
const foodItems=[
 {id:"berry",name:"Berry Bowl",emoji:"🍓",price:15,desc:"A sweet little snack.",effect:"+18 Hunger"},
 {id:"carrot",name:"Crunchy Carrot",emoji:"🥕",price:12,desc:"Mochi's classic favorite.",effect:"+14 Hunger"},
 {id:"cake",name:"Cozy Cake",emoji:"🍰",price:30,desc:"A special happy treat.",effect:"+25 Happiness"}
];
const decorItems=[
 {id:"rug",name:"Blush Rug",emoji:"🩷",price:35,desc:"A soft place to relax."},
 {id:"plant",name:"Tiny Plant",emoji:"🪴",price:45,desc:"Adds a little green to the room."},
 {id:"lamp",name:"Cozy Lamp",emoji:"🛋️",price:60,desc:"Warm vibes, always."},
 {id:"teddy",name:"Teddy Bear",emoji:"🧸",price:55,desc:"A cuddly room buddy."},
 {id:"flower",name:"Flower Vase",emoji:"🌷",price:40,desc:"A tiny pop of color."},
 {id:"star",name:"Star Light",emoji:"⭐",price:70,desc:"A dreamy night glow."}
];
const achievements=[
 {id:"firstcare",icon:"💗",title:"First Love",desc:"Do your first care action."},
 {id:"rich",icon:"🪙",title:"Little Saver",desc:"Have 250 coins."},
 {id:"level3",icon:"⭐",title:"Growing Up",desc:"Reach level 3."},
 {id:"play5",icon:"🎾",title:"Playmate",desc:"Play 5 times."},
 {id:"collector",icon:"🛋️",title:"Cozy Collector",desc:"Own 4 decorations."},
 {id:"streak3",icon:"🔥",title:"Three Cozy Days",desc:"Claim rewards for 3 days."}
];
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function go(page){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 document.getElementById("page-"+page).classList.add("active");
 document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 render();
 window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));

function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),2200)}
function beep(freq=500){if(!soundOn)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;let c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;o.type="sine";g.gain.value=.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.08)}catch(e){}}
function petEmoji(){return species[S.species]||"🐰"}
function clamp(v){return Math.max(0,Math.min(100,v))}
function expNeed(){return 80+(S.level-1)*45}
function addExp(n){S.exp+=n;while(S.exp>=expNeed()){S.exp-=expNeed();S.level++;toast("✨ Level up! CozyPet is now level "+S.level)}}
function mood(){if(S.health<35)return ["Needs care","😟"];if(S.energy<25)return ["Sleepy","😴"];if(S.hunger<30)return ["Hungry","🥺"];if(S.happiness>75)return ["Happy","😊"];return ["Okay","🙂"]}

function statCard(label,val,emoji){return `<div class="stat"><div class="stat-top"><span>${emoji} ${label}</span><b>${Math.round(val)}</b></div><div class="bar"><div class="fill" style="width:${val}%"></div></div></div>`}
function render(){
 document.getElementById("coins").textContent=S.coins;
 document.getElementById("shopCoins").textContent=S.coins;
 ["homePetName","homePetName2","petNameTitle","petNamePlate","roomPetName"].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=S.name});
 document.getElementById("heroPet").textContent=petEmoji();
 document.getElementById("bigPet").textContent=petEmoji();
 document.getElementById("level").textContent=S.level;
 document.getElementById("moodText").textContent=mood()[0];
 document.getElementById("moodBadge").textContent=mood()[1]+" "+mood()[0];
 document.getElementById("petSpeciesPlate").textContent=S.species[0].toUpperCase()+S.species.slice(1);
 document.getElementById("homeStats").innerHTML=statCard("Hunger",S.hunger,"🍓")+statCard("Happiness",S.happiness,"💗")+statCard("Energy",S.energy,"⚡")+statCard("Health",S.health,"❤️");
 document.getElementById("petStats").innerHTML=
   statRow("Hunger",S.hunger,"🍓")+statRow("Happiness",S.happiness,"💗")+statRow("Energy",S.energy,"⚡")+statRow("Health",S.health,"❤️")+statRow("Clean",S.clean,"🫧");
 document.getElementById("streakText").textContent="Day "+S.streak;
 const claim=document.getElementById("dailyBtn"); claim.disabled=S.lastClaim===today(); claim.textContent=S.lastClaim===today()?"✓ Reward claimed today":"🪙 Claim 50 coins";
 renderShop();renderRoom();renderAchievements();
 document.getElementById("nameInput").value=S.name;document.getElementById("speciesInput").value=S.species;
 document.getElementById("soundInput").checked=S.sound;document.getElementById("darkInput").checked=S.dark;
 document.body.classList.toggle("dark",S.dark);
}
function statRow(label,val,emoji){return `<div class="bar-row"><div><span>${emoji} ${label}</span><span>${Math.round(val)}%</span></div><div class="bar"><div class="fill" style="width:${val}%"></div></div></div>`}
function today(){return new Date().toISOString().slice(0,10)}

function care(type){
 let before={...S};
 if(type==="feed"){S.hunger=clamp(S.hunger+18);S.health=clamp(S.health+3);S.energy=clamp(S.energy-3);toast("🍓 Yum! "+S.name+" enjoyed the food.")}
 if(type==="play"){if(S.energy<12){toast("😴 Too sleepy! Let "+S.name+" rest first.");return}S.happiness=clamp(S.happiness+20);S.energy=clamp(S.energy-12);S.hunger=clamp(S.hunger-7);S.exp+=12;S.playCount=(S.playCount||0)+1;toast("🎾 So much fun!")}
 if(type==="bath"){S.clean=clamp(S.clean+30);S.health=clamp(S.health+16);S.happiness=clamp(S.happiness+4);toast("🫧 Fresh and clean!")}
 if(type==="sleep"){S.energy=clamp(S.energy+25);S.health=clamp(S.health+4);S.happiness=clamp(S.happiness+3);toast("🌙 Sweet dreams!")}
 addExp(8);S.achievements.firstcare=true;save();beep(600);render();
}
document.getElementById("dailyBtn").onclick=()=>{
 if(S.lastClaim===today())return;
 S.coins+=50;S.lastClaim=today();S.streak++;S.achievements.streak3=S.streak>=3;save();toast("🪙 +50 coins!");beep(800);render()
}
function renderShop(){
 let arr=shopMode==="food"?foodItems:decorItems;
 document.getElementById("shopGrid").innerHTML=arr.map(x=>{
 let owned=shopMode==="decor"&&S.ownedDecor.includes(x.id);
 let foodCount=shopMode==="food"?S.foods[x.id]||0:0;
 return `<div class="shop-item"><div class="shop-emoji">${x.emoji}</div><h3>${x.name}</h3><p>${x.desc} ${x.effect||""}</p><div class="price-row"><b>🪙 ${x.price}</b>${shopMode==="food"?`<button class="buy" onclick="buyFood('${x.id}')">Buy</button>`:`<button class="buy ${owned?"owned":""}" ${owned?"disabled":""} onclick="buyDecor('${x.id}')">${owned?"Owned":"Buy"}</button>`}</div>${shopMode==="food"?`<small style="color:#9a8589">Owned: ${foodCount}</small>`:""}</div>`
 }).join("");
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");shopMode=b.dataset.shop;renderShop()});
function buyFood(id){let x=foodItems.find(a=>a.id===id);if(S.coins<x.price){toast("🪙 Not enough coins!");return}S.coins-=x.price;S.foods[id]++;save();toast("🍓 Added to your pantry!");beep(700);render()}
function buyDecor(id){let x=decorItems.find(a=>a.id===id);if(S.ownedDecor.includes(id))return;if(S.coins<x.price){toast("🪙 Not enough coins!");return}S.coins-=x.price;S.ownedDecor.push(id);S.achievements.collector=S.ownedDecor.length>=4;save();toast("🛋️ New decor unlocked!");beep(700);render()}
function renderRoom(){
 let list=decorItems.filter(x=>S.ownedDecor.includes(x.id));
 document.getElementById("decorCount").textContent=list.length;
 document.getElementById("decorList").innerHTML=list.map(x=>`<div class="inventory-item"><span>${x.emoji} <b>${x.name}</b></span><button onclick="toggleDecor('${x.id}')">${S.decorEquipped.includes(x.id)?"Remove":"Place"}</button></div>`).join("");
 const positions={rug:"left:25%;bottom:70px;font-size:42px",plant:"left:12%;bottom:175px",lamp:"right:12%;bottom:180px",teddy:"right:27%;bottom:75px",flower:"right:12%;top:175px",star:"left:30%;top:80px"};
 document.getElementById("roomDecor").innerHTML=S.decorEquipped.map(id=>{let x=decorItems.find(a=>a.id===id);return x?`<div class="decor-item" style="${positions[id]||""}">${x.emoji}</div>`:""}).join("");
}
function toggleDecor(id){if(S.decorEquipped.includes(id))S.decorEquipped=S.decorEquipped.filter(x=>x!==id);else{if(S.decorEquipped.length>=4){toast("Room is full! Remove one first.");return}S.decorEquipped.push(id)}save();renderRoom()}
function renderAchievements(){
 let map={firstcare:!!S.achievements.firstcare,rich:S.coins>=250,level3:S.level>=3,play5:(S.playCount||0)>=5,collector:S.ownedDecor.length>=4,streak3:S.streak>=3};
 document.getElementById("achievementGrid").innerHTML=achievements.map(a=>`<div class="card achievement ${map[a.id]?"":"locked"}"><div class="ach-icon">${a.icon}</div><div><h3>${a.title}</h3><small>${a.desc}</small></div>${map[a.id]?"<span>✓</span>":""}</div>`).join("");
}
function saveProfile(){let n=document.getElementById("nameInput").value.trim();if(n)S.name=n;S.species=document.getElementById("speciesInput").value;save();toast("💗 Profile saved!");render()}
document.getElementById("soundBtn").onclick=()=>{S.sound=!S.sound;soundOn=S.sound;save();render();beep(600)}
document.getElementById("soundInput").onchange=e=>{S.sound=e.target.checked;soundOn=S.sound;save()}
document.getElementById("darkInput").onchange=e=>{S.dark=e.target.checked;save();render()}
function resetGame(){if(confirm("Reset semua progress CozyPet?")){localStorage.removeItem(KEY);location.reload()}}
function passive(){
 S.hunger=clamp(S.hunger-.7);S.happiness=clamp(S.happiness-.35);S.energy=clamp(S.energy-.18);S.health=clamp(S.health+(S.hunger<20?-0.3:.05));S.clean=clamp(S.clean-.25);
 save();render();
}
setInterval(passive,30000);
function startHearts(){
 const modal=document.getElementById("gameModal"),box=document.getElementById("gameBox");modal.classList.add("show");
 let score=0,time=15;
 box.innerHTML=`<div class="game-header"><div><h2>💗 Catch the Hearts</h2><small>Catch them before time runs out!</small></div><button class="close-game" onclick="closeGame()">×</button></div><div class="game-header"><b>Score: <span id="gScore">0</span></b><b>⏱️ <span id="gTime">15</span>s</b></div><div class="heart-area" id="heartArea"></div>`;
 const area=document.getElementById("heartArea");
 let spawn=setInterval(()=>{let h=document.createElement("button");h.className="heart-target";h.textContent=["💗","💖","💕","❤️"][Math.floor(Math.random()*4)];h.style.left=Math.random()*88+"%";h.style.top=Math.random()*82+"%";h.onclick=()=>{score++;document.getElementById("gScore").textContent=score;h.remove();beep(900)};area.appendChild(h);setTimeout(()=>h.remove(),1000)},500);
 let timer=setInterval(()=>{time--;document.getElementById("gTime").textContent=time;if(time<=0){clearInterval(timer);clearInterval(spawn);S.coins+=score*4;S.happiness=clamp(S.happiness+Math.min(20,score));S.playCount=(S.playCount||0)+1;S.achievements.play5=S.playCount>=5;addExp(15);save();toast("🎉 Game over! +"+(score*4)+" coins");closeGame();render()}},1000);
}
function startMemory(){
 const modal=document.getElementById("gameModal"),box=document.getElementById("gameBox");modal.classList.add("show");
 let icons=["🍓","🌷","⭐","🧸","🍓","🌷","⭐","🧸"].sort(()=>Math.random()-.5),open=[],matched=0;
 box.innerHTML=`<div class="game-header"><div><h2>🧠 Cozy Memory</h2><small>Find all matching pairs.</small></div><button class="close-game" onclick="closeGame()">×</button></div><div class="memory-grid">${icons.map((_,i)=>`<button class="memory-card" data-i="${i}">?</button>`).join("")}</div>`;
 document.querySelectorAll(".memory-card").forEach(btn=>btn.onclick=()=>{
  let i=+btn.dataset.i;if(open.includes(i)||btn.classList.contains("matched"))return;btn.textContent=icons[i];btn.classList.add("open");open.push(i);
  if(open.length===2){let[a,b]=open;if(icons[a]===icons[b]){document.querySelectorAll(".memory-card")[a].classList.add("matched");document.querySelectorAll(".memory-card")[b].classList.add("matched");matched++;open=[];beep(900);if(matched===4){S.coins+=45;S.happiness=clamp(S.happiness+20);S.playCount=(S.playCount||0)+1;S.achievements.play5=S.playCount>=5;addExp(20);save();toast("🏆 Perfect match! +45 coins");setTimeout(closeGame,700);render()}}else setTimeout(()=>{document.querySelectorAll(".memory-card")[a].textContent="?";document.querySelectorAll(".memory-card")[b].textContent="?";document.querySelectorAll(".memory-card")[a].classList.remove("open");document.querySelectorAll(".memory-card")[b].classList.remove("open");open=[]},650)}
 });
}
function closeGame(){document.getElementById("gameModal").classList.remove("show")}
render();
