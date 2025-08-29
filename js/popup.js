const powerInput = document.getElementById("powerInput");
const captchaCheckBoxInput = document.getElementById("captchaCheck");
const button = document.getElementById("saveSettingsButton");
const status = document.getElementById("status");
const autoLevel = document.getElementById("autoLevel");
const autoLevelCheckbox = document.querySelector("input[name=autoLevel]");


chrome.storage.sync.get(["power", "autoCaptcha", "autoLevel", "autoLevelCheck"], (data) => {
    if (typeof data.power === 'string') {
        powerInput.value = data.power;
    }

    if (typeof data.autoCaptcha === 'boolean') {
        captchaCheckBoxInput.checked = data.autoCaptcha;
    }

    if (typeof data.autoLevelCheck === 'boolean') {
        autoLevelCheckbox.checked = data.autoLevelCheck;
        autoLevel.style.display = data.autoLevelCheck ? 'block' : 'none';
    }

    if (typeof data.autoLevel === 'string') {
        autoLevel.value = data.autoLevel;
    }
});

button.addEventListener("click", () => {
    const payload = {
        power: powerInput.value,
        autoCaptcha: !!captchaCheckBoxInput.checked,
        autoLevelCheck: !!autoLevelCheckbox.checked,
        autoLevel: autoLevel.value,
    };

    chrome.storage.sync.set(payload, () => {
        if (chrome.runtime.lastError) {
            status.textContent = "Fout bij opslaan.";
            console.error(chrome.runtime.lastError);
            return;
        }
        status.textContent = "Opgeslagen!";
        setTimeout(() => {
            status.textContent = "";
        }, 2000);
    });
});

autoLevelCheckbox.addEventListener('change', () => {
    autoLevel.style.display = autoLevelCheckbox.checked ? 'block' : 'none';
});
