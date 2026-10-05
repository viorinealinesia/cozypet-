const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const pets={bunny:{name:"Bunny",emoji:"🐰"},cat:{name:"Mimi",emoji:"🐱"},bear:{name:"Teddy",emoji:"🧸"},hamster:{name:"Nini",emoji:"🐹"},fox:{name:"Foxy",emoji:"🦊"},panda:{name:"Panda",emoji:"🐼"}};
const foods=[{id:"berry",name:"Berry Cake",emoji:"🍓",price:12,hunger:18,happy:4},{id:"milk",name:"Strawberry Milk",emoji:"🥛",price:15,hunger:12,happy:8},{id:"cookie",name:"Cozy Cookie",emoji:"🍪",price:18,hunger:22,happy:6},{id:"honey",name:"Honey Toast",emoji:"🍯",price:25,hunger:28,happy:10}];
const plants=[{id:"tulip",name:"Tulip",emoji:"🌷",cost:8,reward:18},{id:"sunflower",name:"Sunflower",emoji:"🌻",cost:12,reward:28},{id:"rose",name:"Rose",emoji:"🌹",cost:18,reward:40},{id:"strawberry",name:"Strawberry",emoji:"🍓",cost:22,reward:48}];
const decor=[{name:"Cloud Pillow",emoji:"☁️",price:30},{name:"Tiny Lamp",emoji:"🛋️",price:45},{name:"Flower Vase",emoji:"🌸",price:55},{name:"Cozy Rug",emoji:"🧶",price:70},{name:"Moon Light",emoji:"🌙",price:100}];

const fresh={
 pet:"bunny", petName:"Mochi", coins:180,gems:12,level:1,xp:0,
 hunger:80,happy:80,energy:80,clean:80,health:100,streak:1,
 location:"home",weather:"sun",lastDay:"",rewardClaimed:false,
 ownedPets:["bunny"], plants:{}, gardenSlots:3, decor:[], inventory:[],
 quests:{care:0,play:0,garden:0,shop:0}, achievements:[],
 sound:true, dark:false
};
let state=JSON.parse(localStorage.getItem("cozypet3"))||fresh;
function save(){localStorage.setItem("cozypet3",JSON.stringify(state))}
function clamp(n){return Math.max(0,Math.min(100,n))}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function addXP(n){state.xp+=n;while(state.xp>=100){state.xp-=100;state.level++;state.coins+=30;toast("🎉 Level Up! +30 coins")}save()}
function spend(c,g=0){if(state.coins<c||state.gems<g){toast("💭 Coins/Gems belum cukup");return false}state.coins-=c;state.gems-=g;return true}
function action(type){
 if(type==="feed"){state.hunger=clamp(state.hunger+20);state.energy=clamp(state.energy-2);state.happy=clamp(state.happy+5);state.quests.care++;addXP(10);toast("🍓 Yummy! Pet kenyang")}
 if(type==="play"){if(state.energy<12){toast("😴 Pet terlalu lelah");return}state.happy=clamp(state.happy+18);state.energy=clamp(state.energy-14);state.hunger=clamp(state.hunger-5);state.quests.play++;addXP(14);toast("🎾 Seru banget!")}
 if(type==="bath"){state.clean=100;state.happy=clamp(state.happy+6);state.quests.care++;addXP(9);toast("🫧 Fresh & clean!")}
 if(type==="sleep"){state.energy=100;state.hunger=clamp(state.hunger-10);state.happy=clamp(state.happy+4);addXP(12);toast("🌙 Good night!")}
 healthCalc(); save(); render();
}
function healthCalc(){let avg=(state.hunger+state.happy+state.energy+state.clean)/4;state.health=clamp(Math.round(avg))}
function mood(){let a=(state.hunger+state.happy+state.energy+state.clean)/4;if(state.energy<25)return["🥱","Sleepy"];if(a>80)return["🥰","Super Happy"];if(a>60)return["😊","Happy"];if(a>40)return["🙂","Okay"];return["🥺","Needs Care"]}
function render(){
 $("#coins").textContent=state.coins;$("#gems").textContent=state.gems;$("#level").textContent=state.level;$("#xpBar").style.width=state.xp+"%";
 $("#hunger").textContent=Math.round(state.hunger);$("#happy").textContent=Math.round(state.happy);$("#energy").textContent=Math.round(state.energy);$("#clean").textContent=Math.round(state.clean);$("#health").textContent=Math.round(state.health);
 $("#pet").textContent=pets[state.pet].emoji;$("#petName").textContent=state.petName;let m=mood();$("#mood").textContent=m[0]+" "+m[1];$("#weather").textContent=state.weather==="rain"?"🌧️":"☀️";
 $("#streak").textContent=state.streak+" day streak";$("#collectionCount").textContent=state.ownedPets.length+" / 6 pets";
 document.body.classList.toggle("dark",state.dark);renderWorld();renderQuests();renderCollection()
}
function renderWorld(){
 const p=$("#worldPanel");
 const data={
 home:{icon:"🏠",title:"Cozy Home",sub:"Tempat paling nyaman untuk pet-mu.",html:`<div class="world-grid">
 ${decor.map((d,i)=>`<div class="item"><div class="emoji">${d.emoji}</div><b>${d.name}</b><small>${state.decor.includes(i)?"Sudah dimiliki":"Bikin kamar makin cozy"}</small>${state.decor.includes(i)?"":"<button onclick='buyDecor("+i+")'>🪙 "+d.price+"</button>"}</div>`).join("")}</div>`},
 garden:{icon:"🌷",title:"Flower Garden",sub:"Tanam, tunggu tumbuh, lalu panen.",html:`<div class="world-grid">${plants.map((p,i)=>{let st=state.plants[p.id];let ready=st&&Date.now()-st>=15000;return `<div class="item"><div class="emoji">${p.emoji}</div><b>${p.name}</b><small>${!st?"Siap ditanam":"Sedang tumbuh"} </small><button onclick="gardenAction('${p.id}')">${!st?"🌱 "+p.cost:(ready?"🧺 Panen":"⏳ Growing...")}</button></div>`}).join("")}</div>`},
 cafe:{icon:"☕",title:"Cozy Café",sub:"Pesan makanan favorit untuk pet.",html:`<div class="world-grid">${foods.map(f=>`<div class="item"><div class="emoji">${f.emoji}</div><b>${f.name}</b><small>+${f.hunger} hunger · +${f.happy} happy</small><button onclick="buyFood('${f.id}')">🪙 ${f.price}</button></div>`).join("")}</div>`},
 shop:{icon:"🛍️",title:"Town Shop",sub:"Cari item dan unlock pet baru.",html:`<div class="world-grid">
 ${Object.entries(pets).filter(([id])=>!state.ownedPets.includes(id)).map(([id,p])=>`<div class="item"><div class="emoji">${p.emoji}</div><b>${p.name}</b><small>Pet baru untuk koleksi</small><button onclick="buyPet('${id}')">💎 8</button></div>`).join("")||"<div class='empty'>✨ Semua pet sudah terkumpul!</div>"}
 <div class="item"><div class="emoji">🎁</div><b>Gem Chest</b><small>Exchange 80 coins menjadi 3 gems</small><button onclick="buyGems()">🪙 80</button></div>
 </div>`},
 park:{icon:"🎡",title:"Fun Park",sub:"Main cepat untuk mendapatkan reward.",html:`<div class="world-grid">
 <div class="item"><div class="emoji">💖</div><b>Catch Hearts</b><small>Tap untuk menangkap hati.</small><button onclick="heartGame()">▶ Play</button></div>
 <div class="item"><div class="emoji">🧠</div><b>Cozy Quiz</b><small>Jawab pertanyaan sederhana.</small><button onclick="quizGame()">▶ Play</button></div>
 <div class="item"><div class="emoji">🎰</div><b>Lucky Leaf</b><small>Coba keberuntungan sekali sehari.</small><button onclick="lucky()">▶ Try</button></div>
 </div>`}
 };
 let d=data[state.location];p.innerHTML=`<div class="world-title"><span class="big">${d.icon}</span><div><span class="eyebrow">CURRENT LOCATION</span><h2>${d.title}</h2><small>${d.sub}</small></div></div>${d.html}`
}
function renderQuests(){
 const qs=[["care","🫶 Care for pet",3,10],["play","🎾 Play together",2,12],["garden","🌱 Harvest garden",2,15],["shop","🛍️ Buy something",1,18]];
 $("#quests").innerHTML=qs.map(q=>`<div class="quest"><div class="quest-row"><b>${q[1]}</b><span>${Math.min(state.quests[q[0]],q[2])}/${q[2]}</span></div><small>Reward: ${q[3]} XP</small><progress value="${Math.min(state.quests[q[0]],q[2])}" max="${q[2]}"></progress></div>`).join("")
}
function renderCollection(){
 $("#petCollection").innerHTML=Object.entries(pets).map(([id,p])=>`<div class="pet-card ${state.ownedPets.includes(id)?"":"locked"}"><div class="pemoji">${state.ownedPets.includes(id)?p.emoji:"❔"}</div><b>${state.ownedPets.includes(id)?p.name:"Locked"}</b></div>`).join("")
}
function buyDecor(i){if(state.decor.includes(i))return;if(spend(decor[i].price)){state.decor.push(i);state.quests.shop++;addXP(7);toast("🏠 Decor added!");save();render()}}
function buyFood(id){let f=foods.find(x=>x.id===id);if(spend(f.price)){state.hunger=clamp(state.hunger+f.hunger);state.happy=clamp(state.happy+f.happy);state.quests.shop++;addXP(6);toast(f.emoji+" Pet menikmati "+f.name);save();render()}}
function buyPet(id){if(state.ownedPets.includes(id))return;if(spend(0,8)){state.ownedPets.push(id);addXP(30);toast("🎉 Pet baru unlocked!");save();render()}}
function buyGems(){if(spend(80)){state.gems+=3;toast("💎 +3 gems");save();render()}}
function gardenAction(id){let p=plants.find(x=>x.id===id),st=state.plants[id];if(!st){if(spend(p.cost)){state.plants[id]=Date.now();toast("🌱 Benih ditanam!");save();render()}}else if(Date.now()-st>=15000){delete state.plants[id];state.coins+=p.reward;state.quests.garden++;addXP(15);toast("🧺 Panen! +"+p.reward+" coins");save();render()}else toast("⏳ Belum tumbuh, tunggu sebentar")}
function heartGame(){let reward=10+Math.floor(Math.random()*25);state.coins+=reward;state.happy=clamp(state.happy+10);addXP(12);toast("💖 Kamu menang! +"+reward+" coins");save();render()}
function quizGame(){let q=[["Hewan mana yang suka wortel?","bunny"],["Minuman cozy apa yang populer?","milk"],["Tanaman berwarna kuning?","sunflower"]][Math.floor(Math.random()*3)];let ans=prompt(q[0]+"\\nKetik jawaban: bunny / milk / sunflower");if(ans&&ans.toLowerCase().trim()===q[1]){state.coins+=30;addXP(20);toast("🧠 Benar! +30 coins")}else toast("🙈 Belum tepat");save();render()}
function lucky(){if(localStorage.getItem("lucky3")===new Date().toDateString()){toast("🌙 Coba lagi besok");return}localStorage.setItem("lucky3",new Date().toDateString());let win=Math.random()>.35; if(win){state.gems+=2;state.coins+=20;toast("🍀 Lucky! +2 gems +20 coins")}else toast("🍃 Hampir! Coba besok");save();render()}
function daily(){
 let d=new Date().toDateString();if(state.lastDay===d){toast("🎁 Reward hari ini sudah diambil");return}
 state.lastDay=d;state.rewardClaimed=true;state.coins+=50;state.gems+=1;state.streak++;addXP(20);toast("🎁 Daily Reward +50 coins +1 gem");save();render()
}
function setLocation(l){state.location=l;$$(".location").forEach(x=>x.classList.toggle("active",x.dataset.location===l));renderWorld();save()}
$$("[data-action]").forEach(b=>b.onclick=()=>action(b.dataset.action));
$$(".location").forEach(b=>b.onclick=()=>setLocation(b.dataset.location));
$("#rewardBtn").onclick=daily;
$("#settingsBtn").onclick=()=>openSettings();
$("#closeModal").onclick=()=>$("#modal").classList.remove("show");
function openSettings(){openModal(`<h2>⚙️ Cozy Settings</h2><label>Nama Pet</label><input id="nameInput" value="${state.petName}" style="width:100%;padding:12px;border:1px solid #eadedb;border-radius:12px;margin:7px 0 14px"><label>Spesies</label><select id="speciesInput" style="width:100%;padding:12px;border:1px solid #eadedb;border-radius:12px;margin:7px 0 14px">${Object.entries(pets).map(([id,p])=>`<option value="${id}" ${id===state.pet?"selected":""}>${p.emoji} ${p.name}</option>`).join("")}</select><button class="wide-btn" onclick="saveSettings()">💾 Save Settings</button><br><br><button class="wide-btn" onclick="resetGame()">🗑️ Reset Game</button>`)}
function saveSettings(){state.petName=$("#nameInput").value.trim()||"Mochi";state.pet=$("#speciesInput").value;save();$("#modal").classList.remove("show");toast("✨ Settings saved");render()}
function resetGame(){if(confirm("Reset semua progress CozyPet?")){localStorage.removeItem("cozypet3");location.reload()}}
function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.add("show")}
function tick(){let hour=new Date().getHours();let night=hour>=18||hour<6;$("#timeLabel").textContent=night?"🌙 Night":"☀️ Day";state.weather=Math.random()>.88?"rain":"sun";if(Math.random()<.06)$("#speech").textContent=["Mau jalan-jalan? 🥺","Aku suka tempat ini! 🌷","Yummy! 🍓","Zzz... 😴","Kita main yuk! 🎾"][Math.floor(Math.random()*5)];healthCalc();save();render()}
tick();setInterval(tick,30000);
