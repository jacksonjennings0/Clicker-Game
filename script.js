// =======================
// Game Variables
// =======================
let score = 0;
let clickPower = 1;
let autoClickPower = 0;

let clickCost = 25;
let autoClickCost = 50;

let critChance = 0.1;
let critMultiplier = 2;

let prestigePoints = 0;
let prestigeBonus = 1;

let bossActive = false;
let bossHealth = 500;
let bossMaxHealth = 500;
let bossSpawnInterval = 180000; 
let bossDuration = 30000; 
let bossAttackInterval = 5000;
let bossTimer, bossAttackTimer;

let bossKills = 0;
let bossRewardPercent = 0.25;
let bossPassiveScore = 0;

// =======================
// Floating Text
// =======================
function showFloatingText(amount, type) {
    const text = document.createElement("div");
    text.className = "floating-text";
    text.innerText = amount;

    const x = Math.random() * (window.innerWidth - 50);
    const y = Math.random() * (window.innerHeight - 100);
    text.style.left = x + "px";
    text.style.top = y + "px";

    if(type==="crit") text.style.color="red";
    else if(type==="auto") text.style.color="cyan";
    else text.style.color="gold";

    document.body.appendChild(text);

    let drift = (Math.random() * 60) - 30;
    let start = 0;
    const floatAnim = setInterval(() => {
        start += 2;
        text.style.transform = `translate(${drift}px, -${start}px)`;
    },16);

    setTimeout(() => { clearInterval(floatAnim); text.remove(); }, 1000);
}

// =======================
// Update UI
// =======================
function updateUI(){
    document.getElementById("scoreDisplay").innerText = "Score: "+Math.floor(score);
    document.getElementById("clickPowerDisplay").innerText = clickPower;
    document.getElementById("autoCount").innerText = autoClickPower;
    document.getElementById("prestigeInfo").innerText =
        "Prestige: " + prestigePoints +
        " | Bonus: x" + prestigeBonus.toFixed(1) +
        " | Boss Kills: " + bossKills +
        " | Passive/sec: " + bossPassiveScore;
    document.getElementById("bossKillsDisplay").innerText = bossKills;
}

// =======================
// Click
// =======================
function clickCookie(){
    let crit = Math.random() < critChance;
    let gain = clickPower * prestigeBonus;
    if(crit) gain *= critMultiplier;
    score += gain;
    showFloatingText(Math.floor(gain), crit?"crit":"manual");
    updateUI();
    saveGame();
}

// =======================
// Upgrades
// =======================
function buyClickUpgrade(){
    score = Number(score); clickCost = Number(clickCost);
    if(score >= clickCost){
        score -= clickCost;
        clickPower += 1;
        clickCost = Math.floor(Number(clickCost)*1.5);
        document.getElementById("clickCost").innerText = clickCost;
        updateUI(); saveGame();
    } else alert("Not enough score!");
}

function buyAutoClicker(){
    score = Number(score); autoClickCost = Number(autoClickCost);
    if(score >= autoClickCost){
        score -= autoClickCost;
        autoClickPower +=1;
        autoClickCost = Math.floor(Number(autoClickCost)*1.5);
        document.getElementById("autoCost").innerText = autoClickCost;
        updateUI(); saveGame();
    } else alert("Not enough score!");
}

// =======================
// Auto Click Loop
// =======================
setInterval(()=>{
    if(autoClickPower>0){
        let gain = autoClickPower*prestigeBonus;
        score += gain;
        showFloatingText(Math.floor(gain),"auto");

        if(bossActive){
            bossHealth -= gain;
            updateBossHealth();
            if(bossHealth<=0) despawnBoss(true);
        }
        updateUI(); saveGame();
    }
},1000);

// =======================
// Prestige
// =======================
function prestige(){
    const prestigeThreshold = 1000;
    if(score<prestigeThreshold){ alert("Need "+prestigeThreshold+" score to prestige!"); return; }
    prestigePoints += Math.floor(Math.sqrt(score/100));
    prestigeBonus = 1 + prestigePoints/10;
    score=0; clickPower=1; autoClickPower=0; bossKills=0; bossPassiveScore=0;
    updateUI(); saveGame();
    alert("Prestige successful! Bonus x"+prestigeBonus.toFixed(1));
}

// =======================
// Boss
// =======================
function spawnBoss(){
    if(bossActive) return;
    bossActive=true; bossHealth=bossMaxHealth;
    document.getElementById("bossArea").style.display="block";
    updateBossHealth();

    bossTimer=setTimeout(()=>{despawnBoss(false)}, bossDuration);
    bossAttackTimer=setInterval(()=>{
        if(score>0){
            let dmgPercent=Math.random()*0.15+0.05;
            let dmg=Math.floor(score*dmgPercent);
            score -= dmg; if(score<0) score=0;
            showFloatingText(-dmg,"crit"); updateUI(); saveGame();
        }
    }, bossAttackInterval);
}

function attackBoss(){
    if(!bossActive) return;
    let damage = clickPower * prestigeBonus;
    if(Math.random()<critChance){ damage*=2; showFloatingText(Math.floor(damage),"crit"); }
    else showFloatingText(Math.floor(damage),"manual");
    bossHealth -= damage;
    if(bossHealth<=0) despawnBoss(true);
    updateBossHealth(); updateUI(); saveGame();
}

function updateBossHealth(){
    document.getElementById("bossHealthDisplay").innerText = Math.max(0, Math.floor(bossHealth));
}

function despawnBoss(defeated){
    if(defeated && bossActive){
        let reward=Math.floor(score*bossRewardPercent);
        score+=reward; bossKills++; bossPassiveScore=100*bossKills;
        showFloatingText(reward,"auto");
        alert("Boss defeated! Reward: "+reward+" | Total kills: "+bossKills);
    }
    bossActive=false; clearInterval(bossAttackTimer); clearTimeout(bossTimer);
    document.getElementById("bossArea").style.display="none";
    setTimeout(spawnBoss,bossSpawnInterval);
    updateUI();
}

// =======================
// Boss Passive
// =======================
setInterval(()=>{
    if(bossPassiveScore>0){
        score+=bossPassiveScore;
        showFloatingText(bossPassiveScore,"auto");
        updateUI(); saveGame();
    }
},1000);

// =======================
// Save/Load
// =======================
function saveGame(){
    const save = {
        score, clickPower, autoClickPower, clickCost, autoClickCost,
        prestigePoints, prestigeBonus, bossKills, bossPassiveScore
    };
    localStorage.setItem("clickerSave",JSON.stringify(save));
}

function loadGame(){
    const save = JSON.parse(localStorage.getItem("clickerSave"));
    if(save){
        score = Number(save.score);
        clickPower = Number(save.clickPower);
        autoClickPower = Number(save.autoClickPower);
        clickCost = Number(save.clickCost);
        autoClickCost = Number(save.autoClickCost);
        prestigePoints = Number(save.prestigePoints);
        prestigeBonus = Number(save.prestigeBonus);
        bossKills = Number(save.bossKills);
        bossPassiveScore = Number(save.bossPassiveScore);
        updateUI();
    }
}

window.onload=()=>{
    loadGame();
    updateUI();
    setTimeout(spawnBoss,bossSpawnInterval);
};
