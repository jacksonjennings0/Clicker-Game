// BOSS SYSTEM VARIABLES
let bossKills = 0; // Total bosses defeated
let bossRewardPercent = 0.25; // 25% of score on defeat
let bossPassiveScore = 0; // Passive points per second from bosses
let bossActive = false; // Is a boss currently active?
let bossHealth = 500; // Current boss health
let bossMaxHealth = 500; // Max health of the current boss

let bossSpawnInterval = 180000; // 3 minutes

let bossDuration = 30000; // 30 seconds

let bossAttackInterval = 5000; // Boss attacks every 5 seconds


let bossTimer;
let bossAttackTimer;

// CLICKER VARIABLES
let score = 0; // Player's current score
let clickPower = 1; // Points per click
let autoClickPower = 0; // Points per second from auto-clickers

let autoClickCost = 50; // Initial cost of auto-clickers
let clickUpgradeCost = 25; // Initial cost of click upgrades

let prestigePoints = 0; // Prestige points earned
let prestigeBonus = 1; // Score bonus from prestige

function updateUI() {
    document.getElementById("score").innerText = Math.floor(score);

    document.getElementById("autoCost").innerText = autoClickCost;

    document.getElementById("clickCost").innerText = clickUpgradeCost;

    document.getElementById("prestigeInfo").innerText = "Prestige Points: " + prestigePoints + " | Bonus: x" + prestigeBonus.toFixed(1) + " | Boss Kills: " + bossKills;
}

function buyClickUpgrade() {
    if (score > clickUpgradeCost) {
        score -= clickUpgradeCost;
        clickPower++;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);

        updateUI();
        saveGame();
    } else {
        alert("Not Enough Points To Upgrade Click Power!");
    }
}

function showFloatingText(amount, type) {
    try {
        const text = document.createElement("div");
        text.className = "floating-text";
        text.innerText = amount;

        // Spawn near the click button (or center if button not found)
        const button = document.getElementById("clickButton");
        let x, y;

        if (button) {
            const rect = button.getBoundingClientRect();
            // Random left/right offset
            x = rect.left + rect.width / 2 + (Math.random() * 60 - 30); 
            y = rect.top + rect.height / 2 + (Math.random() * 20 - 10);
        } else {
            // fallback to center
            x = window.innerWidth / 2 + (Math.random() * 60 - 30);
            y = window.innerHeight / 2 + (Math.random() * 20 - 10);
        }

        text.style.position = "fixed";
        text.style.left = x + "px";
        text.style.top = y + "px";
        text.style.pointerEvents = "none";

        // Color by type
        if (type === "crit") text.style.color = "red";
        else if (type === "auto") text.style.color = "cyan";
        else text.style.color = "gold";

        document.body.appendChild(text);

        // Animate floating up
        setTimeout(() => {
            text.remove();
        }, 1000);

    } catch (err) {
        console.error("Floating text error:", err);
    }
}

function clickCookie() {
    let critChance = 0.15;
    let critMultiplier = 5;

    let baseGain = clickPower * prestigeBonus;

    if (Math.random() < critChance) {
        let critAmount = baseGain * critMultiplier;
        score += critAmount;
        showFloatingText(critAmount, "crit");
    } else {
        score += baseGain;
        showFloatingText(baseGain, "manual");
    }

    updateUI();
    saveGame();
}

function buyAutoClicker() {
    if (score > autoClickCost) {
        score -= autoClickCost;
        autoClickPower++;
        autoClickCost = Math.floor(autoClickCost * 1.15);

        updateUI();
        saveGame();
    } else {
        alert("Not Enough Points To Buy Auto-Clicker!");
    }
}

setInterval(() => {
    if (autoClickPower > 0) {
        let gain = autoClickPower * prestigeBonus;
        score += gain;
        showFloatingText(gain, "auto");

        // AUTO CLICKERS DAMAGE BOSS TOO
        if (bossActive) {
            bossHealth -= gain;
            updateBossHealth();

            if (bossHealth <= 0) {
                despawnBoss(true);
            }
        }

        updateUI();
        saveGame();
    }
}, 1000);

function prestige() {
    if (score >= 100000) {
        alert("You Need At Least 100,000 Points To Prestige!");
        return;
    }

    let gained = Math.floor(score / 100000);
    prestigePoints += gained;
    prestigeBonus = 1 + (prestigePoints * 0.1);

    score = 0;
    clickPower = 1;
    autoClickPower = 0;
    clickUpgradeCost = 25;
    autoClickCost = 50;

    updateUI();
    saveGame();

    alert("Prestiged! Gained " + gained + " prestige points.");
}

function spawnBoss() {
    bossActive = true;
    bossHealth = bossMaxHealth;

document.getElementById("bossArea").style.display = "block";
    updateBossHealth();

    // Boss attacks every 5 seconds
    bossAttackTimer = setInterval(() => {
        if (!bossActive) return;

        let attackPercent = Math.random() * 0.15 + 0.1; // random 10-25%
        let damage = Math.floor(score * attackPercent);
        score -= damage;
        if (score < 0) score = 0;

        showFloatingText(damage, "crit"); // red floating number for boss attack
        updateUI();
    }, bossAttackInterval);

    // Boss disappears after 30 seconds if not killed
    bossTimer = setTimeout(() => {
        despawnBoss();
    }, bossDuration);
}

function attackBoss() {
    if (!bossActive) return;

    let damage = clickPower * prestigeBonus;
    bossHealth -= damage;

    showFloatingText(damage, "manual"); 
    updateBossHealth();

    if (bossHealth <= 0) {
        // Boss defeated
        score += 1000; // Reward for defeating boss
        despawnBoss();
    }

    updateUI();
}

function despawnBoss() {
    if (bossActive) {
        // Boss defeated
        let reward = Math.floor(score * bossRewardPercent);
        score += reward;

        bossKills++; // track kills
        bossPassiveScore = 100 * bossKills; // 1st boss =100/sec, scales with kills

        showFloatingText(reward, "auto"); // bonus points floating text

        alert('Boss defeated! Reward: ${reward} points | Total kills: ${bossKills}');
    }

    bossActive = false;
    clearInterval(bossAttackTimer);
    clearTimeout(bossTimer);


    document.getElementById("bossArea").style.display = "none";

    // schedule next boss spawn
    setTimeout(spawnBoss, bossSpawnInterval);
    updateUI();
}

setInterval(() => {
    if (bossPassiveScore > 0) {
        score += bossPassiveScore;
        showFloatingText(bossPassiveScore, "auto");
        updateUI();
        saveGame();
    }
}, 1000); // every second

function updateBossHealth() {
    let bar = document.getElementById("bossHealthBar");
    let percent = (bossHealth / bossMaxHealth) * 100;
    bar.style.width = percent * 5 + "px"; // 500px max width
}

function saveGame() {
    try {
        localStorage.setItem("clickerSave", JSON.stringify({
            score: score,
            clickPower: clickPower,
            autoClickPower: autoClickPower,
            clickUpgradeCost: clickUpgradeCost,
            autoClickCost: autoClickCost,
            prestigePoints: prestigePoints,
            prestigeBonus: prestigeBonus,
            lastPlayed: Date.now()
        }));
    } catch (e) {
        // localStorage failed (mobile file preview)
        console.log("Save skipped: localStorage not available");
    }
}

function loadGame() {
    try {
        let saveData = JSON.parse(localStorage.getItem("clickerSave")) || {};

        score = saveData.score || 0;
        clickPower = saveData.clickPower || 1;
        autoClickPower = saveData.autoClickPower || 0;
        clickUpgradeCost = saveData.clickUpgradeCost || 25;
        autoClickCost = saveData.autoClickCost || 50;
        prestigePoints = saveData.prestigePoints || 0;
        prestigeBonus = saveData.prestigeBonus || 1;

        let lastPlayed = saveData.lastPlayed || Date.now();
        let now = Date.now();
        let secondsAway = Math.floor((now - lastPlayed) / 1000);

        if (secondsAway > 5 && autoClickPower > 0) {
            let offlineEarnings = secondsAway * autoClickPower * prestigeBonus;
            score += offlineEarnings;
            alert("Welcome Back! You earned " + Math.floor(offlineEarnings) + " points while you were away!");
        }
    } catch (e) {
        console.log("Load skipped: localStorage not available");
    }

    updateUI();
}

loadGame();



