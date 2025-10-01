const TIKKIE = '7';
const KELD = '8';
const MOORD = '6';

chrome.storage.sync.get("power", (data) => {
    if (!data.power) return;

    const waarde = data.power.replace(/[^\d]/g, "");
    const grens = parseInt(waarde, 10);

    const rows = document.querySelectorAll("tr.trSo");

    rows.forEach((row) => {
        const speler = row.querySelector("td:nth-child(2)");
        const isProtected = speler && speler.querySelector('img[src="./bulletstar-icons/shield_add.png"]') !== null;
        const family = speler.querySelector('img[src="bulletstar-icons/user_green.png"]') !== null;

        if (isProtected) return;
        if (family) return;

        const targetCell = row.querySelector("td:nth-child(4)");
        if (!targetCell) return;

        const rawText = targetCell.textContent.trim();
        const clean = rawText.replace(/[^\d]/g, "");

        const waarde = parseInt(clean, 10);

        if (waarde < grens) {
            const targetCell = row.querySelector("td:nth-child(5)");
            targetCell.style.setProperty("background-color", "rgba(189,237,178,0.15)", "important");
            row.style.setProperty("background-color", "rgba(189,237,178,0.15)", "important");
        }
    });
});

function bitch(){
    const rows = document.querySelectorAll("tr.trSo");
    rows.forEach((row) => {
        const speler = row.querySelector("td:nth-child(2)");
    });
}


async function getBase64DataUrl(imgElement) {
    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL("image/png");
}

function getThumbnail(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 50;
            canvas.height = 50;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 50, 50);
            resolve(canvas.toDataURL("image/png"));
        };
        img.src = dataUrl;
    });
}

async function hashDataUrl(dataUrl) {
    const data = dataUrl.split(",")[1];
    const byteStr = atob(data);
    const bytes = new Uint8Array(byteStr.length);
    for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function autoFillCaptcha() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("autoCaptcha", async (data) => {
            if (!data.autoCaptcha) return resolve(false);

            const img = document.querySelector("#captchaImage");
            const input = document.querySelector('input[name="code"]');
            if (!img || !input) return resolve(false);

            const dataUrl = await getBase64DataUrl(img);
            const hash = await hashDataUrl(dataUrl);
            const thumb = await getThumbnail(dataUrl);

            chrome.storage.local.get("captchaCache", async (result) => {
                const captchaCache = result.captchaCache || {};

                if (captchaCache[hash]) {
                    input.value = captchaCache[hash].code;
                    return resolve(true); // ✅ finished
                }

                const response = await fetch("https://api.openai.com/v1/responses", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-5-nano",
                        input: [
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "input_text",
                                        text: "Lees de code in deze afbeelding, geef de code terug als alleen de cijfers het zijn maximaal 3 cijfers. ook als het beeld niet duidelijk is graag terug vallen naar 000"
                                    },
                                    {type: "input_image", image_url: dataUrl},
                                ],
                            },
                        ],
                    }),
                });

                const code = await response.json();
                const text = code?.output?.[1]?.content?.[0]?.text || "";
                console.log("Gelezen captcha:", text);

                input.value = text;

                captchaCache[hash] = {code: text, thumbnail: thumb};
                chrome.storage.local.set({captchaCache}, () => {
                    console.log("Captcha cache opgeslagen!");
                });

                resolve(text.trim() !== "");
            });
        });
    });
}

function autoCrime() {
    if (!window.location.href.endsWith('crimes')) return;

    chrome.storage.sync.get(['autoLevel', 'autoLevelCheck'], (data) => {
        if (data.autoLevelCheck === 'boolean' && data.autoLevelCheck === false) return;

        let callback = null;
        switch (data.autoLevel) {
            case TIKKIE:
                callback = autoTikkie;
                break;
            case KELD:
                callback = autoKeld;
                break;
            case MOORD:
                callback = autoMoord;
                break;
        }

        if (callback !== null) {
            window.setInterval(callback, Math.floor(Math.random() * 3000) + 1000);
        }
    });
}

function autoFillPower() {

    let href = document.querySelector(".logo").getAttribute("href");
    if (window.location.href !== href) return;

    const rows = document.querySelectorAll("tr");

    let i = 0;
    rows.forEach((row) => {
        const valueCol = row.querySelector("img[src=\"./bulletstar-icons/shield.png\"]");
        if (valueCol === null) {
            return;
        }

        i++;

        if (i === 3) {
            const powerHTML = valueCol.closest('tr').children.item(2).innerHTML,
                powerValue = powerHTML.substring(0, powerHTML.indexOf(' ')).trim();

            chrome.storage.sync.set({power: powerValue}, () => {
                console.log('Power value aangepast naar ' + powerValue)
            });
        }
    })
}

function addCaptchaButton() {
    chrome.storage.sync.get("autoCaptcha", (data) => {
        const autoCaptcha = data.autoCaptcha;

        if (!autoCaptcha) {
            return;
        }
        const img = document.querySelector("#captchaImage");
        const input = document.querySelector('input[name="code"]');
        if (!img || !input) return;

        const button = document.createElement("button");
        button.textContent = "solve";
        button.className = "solveButton";
        button.type = "button";

        button.onclick = () => autoFillCaptcha();

        input.insertAdjacentElement("afterend", button);
    })
}

async function autoCar() {
    if (!window.location.href.endsWith('voertuigen-stelen')) return;

    let submitButtons = document.querySelectorAll('input[type=submit]');
    const solved = await autoFillCaptcha();

    if (solved) {
        setTimeout(function () {
            submitButtons[0].click();
        }, Math.floor(Math.random() * 3000) + 1000)
    }
}

function refreshAuto() {
    if (!window.location.href.endsWith('voertuigen-stelen')) return;
    if (!document.querySelector(".sTitle2") || !document.querySelector('img[src="./bulletstar-icons/tick.png"]')) return;

    let fout = document.querySelector(".sTitle2").innerText;

    if (fout === "Je bent opgepakt!" || fout === "Het ging niet goed.." || fout === "Foutmelding!" || document.querySelector('img[src="./bulletstar-icons/tick.png"]')) {
        setTimeout(function () {
            window.location.reload();
        }, Math.floor(Math.random() * 3000) + 1000)
    }
}


function expandNumberSuffix() {
    if (!document.getElementById("bedrag")) return;

    document.getElementById("bedrag").addEventListener("input", function () {
        let val = this.value.toLowerCase().trim();

        if (val.endsWith("k")) {
            let num = parseFloat(val.replace("k", "")) || 0;
            this.value = num * 1000;
        } else if (val.endsWith("m")) {
            let num = parseFloat(val.replace("m", "")) || 0;
            this.value = num * 1000000;
        } else if (val.endsWith("b")) {
            let num = parseFloat(val.replace("b", "")) || 0;
            this.value = num * 1000000000;
        }

    });
}

async function robotControle() {
    if (document.querySelector("#titel1").innerText !== 'Bulletstar - Robotcontrole') return;

    if (document.getElementById("googlecaptcha")) {
        return;
    }

    const solved = await autoFillCaptcha();

    let submitButtons = document.querySelectorAll('input[type=submit]');
    if (solved) {
        submitButtons[0].click();
    }
}

function goEscape(){
    let href = document.querySelector(".logo").getAttribute("href");
    if (window.location.href !== href) return;

    (async () => {
        const url = "/?p=algemeen-vliegveld";
        const body = new URLSearchParams({
            stad: "3",
            reizen: "Reizen!"
        });

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: body.toString(),
                credentials: "include"
            });

            console.log("Status:", res.status);
            const text = await res.text();
            console.log("Response (eerste 1000 tekens):", text.slice(0, 1000));
        } catch (err) {
            console.error("POST failed:", err);
        }
    })();
}

window.addEventListener('load', autoCrime);
window.addEventListener('load', autoCar);
window.addEventListener('load', refreshAuto);
// window.addEventListener('load', robotControle);
window.addEventListener('load', expandNumberSuffix);
// window.addEventListener('load', autoFillCaptcha);
window.addEventListener('load', addCaptchaButton);
window.addEventListener('load', autoFillPower);
// window.addEventListener('load', goEscape);
// window.addEventListener('load', bitch);


