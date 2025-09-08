document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#captchaTable tbody");
    const saveBtn = document.getElementById("saveBtn");
    const clearBtn = document.getElementById("clearBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const uploadBtn = document.getElementById("uploadBtn");

    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = ".json";
    uploadInput.style.display = "none";
    document.body.appendChild(uploadInput);

    function loadCache() {
        chrome.storage.local.get("captchaCache", (data) => {
            const cache = data.captchaCache || {};
            tableBody.innerHTML = "";

            for (const [hash, entry] of Object.entries(cache)) {
                const tr = document.createElement("tr");

                // Thumbnail
                const tdImg = document.createElement("td");
                const img = document.createElement("img");
                img.src = entry.thumbnail;
                tdImg.appendChild(img);

                // Code editable
                const tdCode = document.createElement("td");
                const input = document.createElement("input");
                input.type = "text";
                input.value = entry.code;
                input.className = "form-control form-control-sm";
                tdCode.appendChild(input);

                // Acties
                const tdActions = document.createElement("td");
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn btn-link text-danger p-0";
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.addEventListener("click", () => {
                    delete cache[hash];
                    chrome.storage.local.set({ captchaCache: cache }, loadCache);
                });
                tdActions.appendChild(deleteBtn);

                tr.appendChild(tdImg);
                tr.appendChild(tdCode);
                tr.appendChild(tdActions);
                tableBody.appendChild(tr);
            }
        });
    }

    // Initial load
    loadCache();

    // Opslaan
    saveBtn.addEventListener("click", () => {
        chrome.storage.local.get("captchaCache", (data) => {
            const cache = data.captchaCache || {};
            const rows = tableBody.querySelectorAll("tr");
            rows.forEach((tr, i) => {
                const hash = Object.keys(cache)[i];
                cache[hash].code = tr.querySelector("input").value;
            });
            chrome.storage.local.set({ captchaCache: cache }, () => alert("Cache opgeslagen!"));
        });
    });

    // Leegmaken
    clearBtn.addEventListener("click", () => {
        if (confirm("Weet je zeker dat je alle cache wilt verwijderen?")) {
            chrome.storage.local.remove("captchaCache", loadCache);
        }
    });

    // Download
    downloadBtn.addEventListener("click", () => {
        chrome.storage.local.get("captchaCache", (data) => {
            const cache = data.captchaCache || {};
            const blob = new Blob([JSON.stringify(cache, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "captchaCache.json";
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    // Upload
    uploadBtn.addEventListener("click", () => uploadInput.click());
    uploadInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                chrome.storage.local.set({ captchaCache: json }, loadCache);
                alert("Cache succesvol geüpload!");
            } catch (err) {
                alert("Ongeldig JSON-bestand!");
            }
        };
        reader.readAsText(file);
    });
});
