// Pak elementen
const input = document.getElementById("mijnInput");
const logoInput = document.getElementById("oudLogo");
const captchaCheckBoxInput = document.getElementById("captchaCheck");
const button = document.getElementById("opslaanBtn");
const status = document.getElementById("status");

// Init: waarden laden
chrome.storage.sync.get(["power", "autoCaptcha", "oudLogo"], (data) => {
  if (typeof data.power === "string") {
    input.value = data.power;
  }
  // let op: checkboxes -> .checked
  if (typeof data.autoCaptcha === "boolean") {
    captchaCheckBoxInput.checked = data.autoCaptcha;
  }
  if (typeof data.oudLogo === "boolean" && logoInput) {
    logoInput.checked = data.oudLogo;
  }
});

// Opslaan
button.addEventListener("click", () => {
  const payload = {
    power: input.value,
    autoCaptcha: !!captchaCheckBoxInput.checked, // boolean
    ...(logoInput ? { oudLogo: !!logoInput.checked } : {}),
  };

  chrome.storage.sync.set(payload, () => {
    if (chrome.runtime.lastError) {
      status.textContent = "❌ Fout bij opslaan.";
      console.error(chrome.runtime.lastError);
      return;
    }
    status.textContent = "✅ Opgeslagen!";
    setTimeout(() => { status.textContent = ""; }, 2000);
  });
});
