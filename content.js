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
    const heeftSchildje = speler && speler.querySelector('img[src="./bulletstar-icons/shield_add.png"]') !== null;
    const familie = speler.querySelector('img[src="bulletstar-icons/user_green.png"]') !== null;

    if (heeftSchildje) return;
    if (familie) return;

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

let captchaCache = JSON.parse(localStorage.getItem("captchaCache") || "{}");

async function getBase64DataUrl(imgElement) {
    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0);
    return canvas.toDataURL("image/png");
}

//voor mass toevoegen op de code.php pagina
async function ezCaptcha() {
    const img = document.querySelector("img");
    const dataUrl = await getBase64DataUrl(img);

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
                        { type: "input_text", text: "Lees de code in deze afbeelding, geef de code terug als alleen de cijfers." },
                        { type: "input_image", image_url: dataUrl },
                    ],
                },
            ],
        }),
    });

    const result = await response.json();
    console.log("Gelezen captcha:", result?.output?.[1]?.content?.[0]?.text);

    captchaCache[dataUrl] = result?.output?.[1]?.content?.[0]?.text;
    localStorage.setItem("captchaCache", JSON.stringify(captchaCache));

    window.location.reload();
}

async function autoFillCaptcha() {
    const img = document.querySelector("#captchaImage");
    const input = document.querySelector('input[name="code"]');
    if (!img || !input) return;

    const dataUrl = await getBase64DataUrl(img);

    if (captchaCache[dataUrl]) {
        console.log("Captcha uit cache:", captchaCache[dataUrl]);
        input.value = captchaCache[dataUrl];
        return;
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
                        { type: "input_text", text: "Lees de code in deze afbeelding, geef de code terug als alleen de cijfers." },
                        { type: "input_image", image_url: dataUrl },
                    ],
                },
            ],
        }),
    });

    const result = await response.json();
    const text = result?.output?.[1]?.content?.[0]?.text || "";
    console.log("Gelezen captcha:", text);

    input.value = text;

    captchaCache[dataUrl] = text;
    localStorage.setItem("captchaCache", JSON.stringify(captchaCache));
}

function autoCrime() {
    if (! window.location.href.endsWith('crimes')) return;

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
    if (! window.location.href.includes('profile')) return;

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

            chrome.storage.sync.set({ power: powerValue }, () => {
                console.log('Power value aangepast naar ' + powerValue)
            });
        }
    })
}

function addCaptchaButton() {
    const img = document.querySelector("#captchaImage");
    const input = document.querySelector('input[name="code"]');
    if (!img || !input) return;

    const button = document.createElement("button");
    button.textContent = "solve";
    button.className = "solveButton";
    button.type = "button";

    button.onclick = () => autoFillCaptcha();

    input.insertAdjacentElement("afterend", button);
}


window.addEventListener('load', autoCrime);
window.addEventListener('load', autoFillCaptcha);
window.addEventListener('load', addCaptchaButton);
window.addEventListener('load', autoFillPower);
