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


function autoFillCaptcha() {
  chrome.storage.sync.get("autoCaptcha", (data) => {
    const autoCaptcha = data.autoCaptcha;

    if (!autoCaptcha) {
      return;
    }

    const img = document.querySelector("#captchaImage");
    const input = document.querySelector('input[name="code"]');
    if (!img || !input) return;


    Tesseract.recognize(img, "eng", { tessedit_char_whitelist: "0123456789" }).then(({ data: { text } }) => {
      const clean = text.replace(/[^a-zA-Z0-9]/g, "").trim();
      if (clean) {
        input.value = clean;
        console.log("Captcha herkend en ingevuld:", clean);
      } else {
        console.log("Geen geldige captcha herkend.");
      }
    });

  });
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

window.addEventListener("load", autoFillCaptcha);
window.addEventListener('load', autoCrime);
window.addEventListener('load', autoFillPower);
