

const RED_IMAGE_PATH = "assets/red/"; // taruh 0.png, 1.png, ... 19.png di sini

let counts = {}; // idx -> jumlah dipilih

function fmt(n) {
  return Math.round(n).toLocaleString("id-ID");
}

function totalSelected() {
  let total = 0;
  for (let k in counts) total += counts[k];
  return total;
}

function renderGrid() {
  const grid = document.getElementById("redGrid");
  grid.innerHTML = "";
  redItems.forEach((item, idx) => {
    const qty = counts[idx] || 0;
    const card = document.createElement("div");
    card.className =
      "relative rounded-lg overflow-hidden transition " +
      (qty > 0
        ? "ring-2 ring-[#ff6b6b]"
        : "opacity-90 hover:opacity-100");
    
    // Gambar berfungsi sebagai tombol tambah
    const img = document.createElement("img");
    img.src = RED_IMAGE_PATH + idx + ".png";
    img.alt = item.name;
    img.className = "w-full h-auto block cursor-pointer";
    img.onerror = () => img.style.display = 'none';
    img.title = "Ketuk untuk menambah";
    img.addEventListener("click", () => {
      counts[idx] = (counts[idx] || 0) + 1;
      renderGrid();
      calc();
    });
    // Tetap dukung klik kanan untuk desktop
    img.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (counts[idx]) {
        counts[idx] -= 1;
        if (counts[idx] <= 0) delete counts[idx];
      }
      renderGrid();
      calc();
    });
    
    card.appendChild(img);

    if (qty > 0) {
      // Label angka
      const badge = document.createElement("span");
      badge.className = "absolute top-0 right-0 min-w-[20px] h-5 px-1.5 rounded-bl-lg bg-[#ff6b6b] text-[#1c0d10] text-xs flex items-center justify-center font-bold pointer-events-none";
      badge.textContent = qty;
      card.appendChild(badge);

      // Tombol minus untuk mobile (kiri atas)
      const minusBtn = document.createElement("button");
      minusBtn.className = "absolute top-0 left-0 w-7 h-7 bg-black/70 hover:bg-black/90 text-white rounded-br-lg flex items-center justify-center text-lg font-bold backdrop-blur-sm transition-colors cursor-pointer";
      minusBtn.innerHTML = "&minus;";
      minusBtn.title = "Kurangi";
      minusBtn.addEventListener("click", (e) => {
        e.stopPropagation(); 
        if (counts[idx]) {
          counts[idx] -= 1;
          if (counts[idx] <= 0) delete counts[idx];
        }
        renderGrid();
        calc();
      });
      card.appendChild(minusBtn);
    }

    grid.appendChild(card);
  });

  document.getElementById("revealCount").textContent =
    totalSelected() + " dipilih";
}

function calc() {
  const total = parseFloat(document.getElementById("total").value) || 0;
  const purple = parseFloat(document.getElementById("purple").value) || 0;
  const avg = parseFloat(document.getElementById("avgprice").value) || 0;

  const goldredTotal = Math.max(total - purple, 0);
  const knownCount = totalSelected();
  let knownValue = 0;
  for (let idx in counts) {
    knownValue += redItems[idx].value * counts[idx];
  }

  const remaining = Math.max(goldredTotal - knownCount, 0);
  const safebid = remaining * avg + knownValue;

  document.getElementById("goldred").textContent = Math.round(remaining);
  document.getElementById("safebid").textContent = fmt(safebid);
}

["total", "purple", "avgprice"].forEach((id) => {
  document.getElementById(id).addEventListener("input", calc);
});

// Init
renderGrid();
calc();
