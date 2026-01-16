// VARIABLES
let score = 0;
let clickPower = 1;
let autoClickPower = 0;

let clickUpgradeCost = 10;
let autoClickerCost = 50;

let prestigePoints = 0;
let prestigeBonus = 1; // Multiplier for clicks after prestige

// UPDATE UI
function updateUI() {

    document.getElementById("score").textContent = score;

    document.getElementById("clickPower").textContent = clickPower;

    document.getElementById("autoClickPower").textContent = autoClickPower;

    document.getElementById("clickCost").textContent = clickUpgradeCost;

    document.getElementById("autoCost").textContent = autoClickerCost;

    document.getElementById("prestigeInfo").innerText = "Prestige Points: " + prestigePoints + " | Bonus: x" + prestigeBonus.toFixed(1);
}

// MAIN CLICK
function clickCookie() {
    let critChance = 0.2; // 20% critical chance
    let critMultiplier = 5; // Critical hits do 5x damage

    let baseGain = clickPower * prestigeBonus;

    if (Math.random() < critChance) {
        let critAmount = baseGain * critMultiplier;
        score += critAmount;
        showCritFloatingText(critAmount);
    } else {
        score += baseGain;
        showFloatingText(baseGain);
    }

    updateUI();
    saveGame();
}

// Prestige Function
function prestige() {
    if (score < 100000) {
        alert("You need at least 100,000 points to prestige!");
        return;
    }

    let gained = Math.floor(score / 100000);
    prestigePoints += gained;
    prestigeBonus = 1 + prestigePoints * 0.1; // Each prestige point gives 10% bonus

    score = 0;
    clickPower = 1;
    autoClickPower = 0;
    autoClickerCost = 50;
    clickUpgradeCost = 10;

    updateUI();
    saveGame();

    alert("You have prestiged and gained " + gained + " prestige points!");
}

function showFloatingText(amount) {
    const float = document.createElement("div");
    float.className = "floatText";
    float.textContent = "+" + amount;

    const container = document.getElementById("floatContainer");
    container.appendChild(float);

    float.style.left = Math.random() * 200 + "px";

    setTimeout(() => {
        float.remove();
    }, 1000);
}

function showAutoFloatingText(amount) {
    const float = document.createElement("div");
    float.className = "autoFloatText";
    float.textContent = "+" + amount;

    const container = document.getElementById("floatContainer");
    container.appendChild(float);

    float.style.left = Math.random() * 200 + "px";

    setTimeout(() => {
        float.remove();
    }, 1000);
}

function showCritFloatingText(amount) {
    const float = document.createElement("div");
    float.className = "critFloatText";
    float.textContent = "+" + amount + "!";

    const container = document.getElementById("floatContainer");
    container.appendChild(float);

    float.style.left = Math.random() * 200 + "px";

    setTimeout(() => {
        float.remove();
    }, 1000);
}

// CLICK UPGRADES
function buyClickUpgrade() {
    if (score >= clickUpgradeCost) {
        score -= clickUpgradeCost;
        clickPower++;
        clickUpgradeCost = Math.floor(clickUpgradeCost * 1.5);
        updateUI();
        saveGame();
    } else {
        alert("Not enough points for Click Upgrade!");
    }
}

// AUTO CLICKER
function buyAutoClicker() {
    if (score >= autoClickerCost) {
        score -= autoClickerCost;
        autoClickPower++;

        autoClickerCost = Math.floor(autoClickerCost * 1.6);

        updateUI();
        saveGame();
    } else {
        alert("Not enough points for Auto Clicker!");
    }
}

// AUTO INCOME EVERY SECOND
setInterval(() => {
    if (autoClickPower > 0) {
        let critChance = 0.1; // 10% critical chance for auto clicks
        let critMultiplier = 3; // Critical hits do 3x damage

        if (Math.random() < critChance) {
            let critAmount = autoClickPower * critMultiplier;
            score += critAmount;

showCritFloatingText(critAmount);
        } else {
            score += autoClickPower;

showAutoFloatingText(autoClickPower);
        }

        updateUI();
        saveGame();
    }
}, 1000);

// SAVE / LOAD GAME
function saveGame() {
    localStorage.setItem("clcikerSave", JSON.stringify({
        score,clickPower,autoClickPower,clickUpgradeCost,autoClickerCost,
        prestigePoints: prestigePoints,
        prestigeBonus: prestigeBonus,
    }));
}

function loadGame() {
    let save = JSON.parse(localStorage.getItem("clcikerSave"));
    if (save) {
        score = save.score;
        clickPower = save.clickPower;
        autoClickPower = save.autoClickPower;
        clickUpgradeCost = save.clickUpgradeCost;
        autoClickerCost = save.autoClickerCost;
        prestigePoints = saveData.prestigePoints || 0;
        prestigeBonus = saveData.prestigeBonus || 1;
    }
    updateUI();
}

// LOAD ON PAGE START

loadGame();

