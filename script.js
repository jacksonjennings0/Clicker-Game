let score = 0;
let clickPower = 1;
let autoClickPower = 0;

let autoClickCost = 50;
let clickUpgradeCost = 25;

let prestigePoints = 0;
let prestigeBonus = 1;

function updateUI() {
    document.getElementById("score").innerText = Math.floor(score);
    document.getElementById("autoCost").innerText = autoClickCost;
    document.getElementById("clickCost").innerText = clickUpgradeCost;

    document.getElementById("prestigeInfo").innerText =
        "Prestige Points: " + prestigePoints + " | Bonus: x" + prestigeBonus.toFixed(1);
}

function buyClickUpgrade() {
    if (score >= clickUpgradeCost) {
        score -= clickUpgradeCost;
        clickPower++;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);

        updateUI();
        saveGame();
    } else {
        alert("Not enough points!");
    }
}

function showFloatingText(amount, type) {
    let text = document.createElement("div");
    text.className = "floatingText " + type;
    text.innerText = "+" + Math.floor(amount);

    let x = Math.random() * window.innerWidth;
    let y = window.innerHeight / 2;

    text.style.left = x + "px";
    text.style.top = y + "px";

    document.getElementById("floatingContainer").appendChild(text);

    setTimeout(() => {
        text.remove();
    }, 1000);
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
    if (score >= autoClickCost) {
        score -= autoClickCost;
        autoClickPower++;
        autoClickCost = Math.floor(autoClickCost * 1.5);

        updateUI();
        saveGame();
    } else {
        alert("Not enough points!");
    }
}

setInterval(() => {
    if (autoClickPower > 0) {
        let critChance = 0.1;
        let critMultiplier = 3;

        let baseGain = autoClickPower * prestigeBonus;

        if (Math.random() < critChance) {
            let critAmount = baseGain * critMultiplier;
            score += critAmount;
            showFloatingText(critAmount, "crit");
        } else {
            score += baseGain;
            showFloatingText(baseGain, "auto");
        }

        updateUI();
        saveGame();
    }
}, 1000);

function prestige() {
    if (score < 100000) {
        alert("You need at least 100,000 points to prestige!");
        return;
    }

    let gained = Math.floor(score / 100000);
    prestigePoints += gained;
    prestigeBonus = 1 + prestigePoints * 0.1;

    score = 0;
    clickPower = 1;
    autoClickPower = 0;
    clickUpgradeCost = 25;
    autoClickCost = 50;

    updateUI();
    saveGame();

    alert("Prestiged! Gained " + gained + " prestige points!");
}

function saveGame() {
    try {
        localStorage.setItem("clickerSave", JSON.stringify({
            score,
            clickPower,
            autoClickPower,
            clickUpgradeCost,
            autoClickCost,
            prestigePoints,
            prestigeBonus,
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
            alert("Welcome back! You earned " + Math.floor(offlineEarnings) + " points while away!");
        }
    } catch (e) {
        console.log("Load skipped: localStorage not available");
    }

    updateUI();
}

loadGame();
