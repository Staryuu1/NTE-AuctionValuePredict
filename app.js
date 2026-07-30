// ==========================================
// FUNGSI PILIH ITEM RED (GRID)
// ==========================================
const RED_IMAGE_PATH = "assets/red/";

let counts = {};

function fmt(n) {
  return Math.round(n).toLocaleString("id-ID");
}

function totalSelected() {
  let total = 0;
  for (let k in counts) total += counts[k];
  return total;
}

function adjustRedGridHeight() {
  const grid = document.getElementById("redGrid");
  const firstCard = grid.firstElementChild;
  if (!firstCard) {
    grid.style.maxHeight = "";
    return;
  }
  const cellHeight = firstCard.getBoundingClientRect().height;
  if (!cellHeight) return; // image likely hasn't loaded/measured yet
  const rowGap = parseFloat(getComputedStyle(grid).rowGap) || 0;
  const targetHeight = cellHeight * 3 + rowGap * 2;
  grid.style.maxHeight = targetHeight + "px";
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
      runSearch();
    });

    img.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (counts[idx]) {
        counts[idx] -= 1;
        if (counts[idx] <= 0) delete counts[idx];
      }
      renderGrid();
      calc();
      runSearch();
    });

    card.appendChild(img);

    if (qty > 0) {
      const badge = document.createElement("span");
      badge.className = "absolute top-0 right-0 min-w-[20px] h-5 px-1.5 rounded-bl-lg bg-[#ff6b6b] text-[#1c0d10] text-xs flex items-center justify-center font-bold pointer-events-none";
      badge.textContent = qty;
      card.appendChild(badge);

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
        runSearch();
      });
      card.appendChild(minusBtn);
    }

    grid.appendChild(card);
  });

  document.getElementById("revealCount").textContent =
    totalSelected() + " dipilih";

  // Tunggu gambar termuat baru hitung tinggi 3 baris (ukuran gambar menentukan tinggi sel)
  const firstImg = grid.querySelector("img");
  if (firstImg && !firstImg.complete) {
    firstImg.addEventListener("load", adjustRedGridHeight, { once: true });
  }
  requestAnimationFrame(adjustRedGridHeight);
}

let _redGridResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(_redGridResizeTimer);
  _redGridResizeTimer = setTimeout(adjustRedGridHeight, 150);
});

// ==========================================
// FUNGSI PILIH ITEM GOLD YANG SUDAH DIKETAHUI (FILTER PREDIKSI)
// Sekarang pakai search box + dropdown + chip, bukan grid gambar,
// supaya lebih ringkas dan tidak makan banyak tempat.
// ==========================================
const GOLD_IMAGE_PATH = "assets/gold/";
let goldKnownCounts = {};

function totalGoldKnownSelected() {
  let total = 0;
  for (let k in goldKnownCounts) total += goldKnownCounts[k];
  return total;
}

function renderGoldChips() {
  document.getElementById("goldKnownCountLabel").textContent =
    totalGoldKnownSelected() + " dipilih";

  const chipsEl = document.getElementById("goldKnownChips");
  chipsEl.innerHTML = "";

  for (let idx in goldKnownCounts) {
    const qty = goldKnownCounts[idx];
    const item = goldItems[idx];

    const chip = document.createElement("button");
    chip.type = "button";
    chip.title = "Klik untuk mengurangi";
    chip.className =
      "flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-[#241b0c] border border-[#ffb84d]/40 text-[#ffb84d] text-xs hover:bg-[#332510] transition cursor-pointer";

    const img = document.createElement("img");
    img.src = GOLD_IMAGE_PATH + idx + ".png";
    img.alt = item.name;
    img.className = "w-5 h-5 rounded-full object-cover flex-shrink-0";
    img.onerror = () => img.style.display = 'none';
    chip.appendChild(img);

    const text = document.createElement("span");
    text.className = "truncate max-w-[140px]";
    text.textContent = item.name + (qty > 1 ? " ×" + qty : "");
    chip.appendChild(text);

    chip.addEventListener("click", () => {
      goldKnownCounts[idx] -= 1;
      if (goldKnownCounts[idx] <= 0) delete goldKnownCounts[idx];
      renderGoldChips();
      runSearch();
    });

    chipsEl.appendChild(chip);
  }
}

function addGoldKnown(idx) {
  goldKnownCounts[idx] = (goldKnownCounts[idx] || 0) + 1;
  renderGoldChips();
  runSearch();
}

function renderGoldSearchDropdown(query) {
  const dropdown = document.getElementById("goldSearchDropdown");
  dropdown.innerHTML = "";

  const q = query.trim().toLowerCase();
  if (!q) {
    dropdown.classList.add("hidden");
    return;
  }

  const matches = goldItems
    .map((item, idx) => ({ ...item, idx }))
    .filter((item) => item.name.toLowerCase().includes(q))
    .slice(0, 8);

  if (matches.length === 0) {
    const empty = document.createElement("div");
    empty.className = "px-3 py-2 text-sm text-[#5f636e]";
    empty.textContent = "Tidak ada item yang cocok.";
    dropdown.appendChild(empty);
    dropdown.classList.remove("hidden");
    return;
  }

  matches.forEach((item) => {
    const row = document.createElement("div");
    row.tabIndex = 0;
    row.className =
      "w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1a1c24] text-left text-sm text-[#e8e8ec] transition cursor-pointer";

    const img = document.createElement("img");
    img.src = GOLD_IMAGE_PATH + item.idx + ".png";
    img.alt = item.name;
    img.className = "w-6 h-6 rounded object-cover flex-shrink-0";
    img.onerror = () => img.style.display = 'none';
    row.appendChild(img);

    const text = document.createElement("span");
    text.className = "flex-1 truncate";
    text.textContent = item.name;
    row.appendChild(text);

    const currentQty = goldKnownCounts[item.idx] || 0;
    if (currentQty > 0) {
      const qtyGroup = document.createElement("span");
      qtyGroup.className = "flex items-center gap-1 flex-shrink-0";

      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "w-5 h-5 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-[#ffb84d] text-xs font-bold leading-none";
      minusBtn.innerHTML = "&minus;";
      minusBtn.title = "Kurangi";
      minusBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        goldKnownCounts[item.idx] -= 1;
        if (goldKnownCounts[item.idx] <= 0) delete goldKnownCounts[item.idx];
        renderGoldChips();
        runSearch();
        renderGoldSearchDropdown(document.getElementById("goldSearchInput").value);
      });
      qtyGroup.appendChild(minusBtn);

      const qtyBadge = document.createElement("span");
      qtyBadge.className = "text-[10px] font-bold text-[#1c1206] bg-[#ffb84d] rounded-full px-1.5 py-0.5 min-w-[20px] text-center";
      qtyBadge.textContent = "×" + currentQty;
      qtyGroup.appendChild(qtyBadge);

      row.appendChild(qtyGroup);
    }

    const valueLabel = document.createElement("span");
    valueLabel.className = "text-[11px] text-[#767b87] flex-shrink-0";
    valueLabel.textContent = fmt(item.value);
    row.appendChild(valueLabel);

    // mousedown (bukan click) supaya sempat jalan sebelum event blur menyembunyikan dropdown
    row.addEventListener("mousedown", (e) => {
      e.preventDefault();
      addGoldKnown(item.idx);
      const input = document.getElementById("goldSearchInput");
      input.value = "";
      dropdown.classList.add("hidden");
    });

    dropdown.appendChild(row);
  });

  dropdown.classList.remove("hidden");
}

function setupGoldSearch() {
  const input = document.getElementById("goldSearchInput");
  const dropdown = document.getElementById("goldSearchDropdown");

  input.addEventListener("input", (e) => {
    renderGoldSearchDropdown(e.target.value);
  });

  input.addEventListener("focus", (e) => {
    if (e.target.value.trim()) renderGoldSearchDropdown(e.target.value);
  });

  input.addEventListener("blur", () => {
    // delay supaya klik pada item dropdown (mousedown) sempat diproses dulu
    setTimeout(() => {
      dropdown.classList.add("hidden");
    }, 150);
  });
}

// ==========================================
// FUNGSI KALKULATOR (CALC)
// ==========================================
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

  const safebidText = fmt(safebid);
  const safebidEl = document.getElementById("safebid");
  safebidEl.textContent = safebidText;

  // Perkecil font otomatis kalau angkanya makin panjang (misal sudah 1jt+)
  let size = "1.5rem"; // text-2xl
  if (safebidText.length > 13) size = "1rem";
  else if (safebidText.length > 10) size = "1.125rem";
  else if (safebidText.length > 8) size = "1.25rem";
  safebidEl.style.fontSize = size;
}

// ==========================================
// FUNGSI PREDIKSI KOMBINASI GOLD
// ==========================================
const sortedGold = goldItems.map((item, idx) => ({...item, originalIdx: idx})).sort((a, b) => a.value - b.value);
const MAX_RESULTS_PER_G = 3;
const MAX_NODES = 300000;

function searchRange(count, low, high, maxResults) {
  const results = [];
  const combo = [];
  let nodes = 0;
  const minPrice = sortedGold[0].value;
  const maxPrice = sortedGold[sortedGold.length - 1].value;

  function rec(startIdx, remaining, curSum) {
    if (results.length >= maxResults || nodes >= MAX_NODES) return;
    nodes++;

    if (remaining === 0) {
      if (curSum >= low && curSum <= high) results.push(combo.slice());
      return;
    }

    for (let i = startIdx; i < sortedGold.length; i++) {
      const item = sortedGold[i];
      const p = item.value;
      const minPossible = curSum + p + (remaining - 1) * minPrice;
      const maxPossible = curSum + p + (remaining - 1) * maxPrice;

      if (minPossible > high) break;
      if (maxPossible < low) continue;

      combo.push(item);
      rec(i, remaining - 1, curSum + p);
      combo.pop();

      if (results.length >= maxResults || nodes >= MAX_NODES) return;
    }
  }

  rec(0, count, 0);
  return results;
}

function runSearch() {
  const total = parseFloat(document.getElementById("total").value) || 0;
  const purple = parseFloat(document.getElementById("purple").value) || 0;
  const avg = parseFloat(document.getElementById("avgprice").value) || 0;

  const goldredTotal = Math.max(total - purple, 0);
  const knownCount = totalSelected();
  const N = Math.max(Math.round(goldredTotal - knownCount), 0);

  const resultsEl = document.getElementById("pkResults");

  if (N <= 0) {
    if (goldredTotal > 0 && knownCount >= goldredTotal) {
      resultsEl.innerHTML = '<p class="text-sm text-[#767b87]">Semua slot gold+red sudah diketahui dari item red yang dipilih di atas — tidak ada lagi yang perlu diprediksi.</p>';
    } else {
      resultsEl.innerHTML = '<p class="text-sm text-[#767b87]">Isi "Total purple+gold+red" dan "Total purple" di atas dulu.</p>';
    }
    return;
  }

  const found = [];

  // Item gold yang sudah diketahui (dipilih lewat search) -> wajib ada di setiap kombinasi
  const fixedExpanded = [];
  let fixedCount = 0;
  let fixedSum = 0;
  for (let idx in goldKnownCounts) {
    const qty = goldKnownCounts[idx];
    const baseItem = goldItems[idx];
    for (let k = 0; k < qty; k++) {
      fixedExpanded.push({ ...baseItem, originalIdx: Number(idx), forced: true });
    }
    fixedCount += qty;
    fixedSum += baseItem.value * qty;
  }

  const COUNT_CAP = 300; // batas hitung supaya cepat, ditandai "300+" kalau tercapai

  for (let G = 1; G <= N; G++) {
    // Kalau item wajib saja sudah lebih banyak dari G, kombinasi ini tidak mungkin
    const remainingCount = G - fixedCount;
    if (remainingCount < 0) continue;

    // Cari kombinasi yang rata-ratanya sendiri (sum/G), kalau di-floor, sama dengan angka avg yang diinput.
    // floor(sum/G) === avg  <=>  sum berada di rentang [avg*G, avg*G + (G-1)]
    const low = avg * G - fixedSum;
    const high = avg * G + (G - 1) - fixedSum;

    // hitung dulu berapa banyak yang cocok (dibatasi COUNT_CAP), baru ambil beberapa contoh untuk detail
    const countingResults = searchRange(remainingCount, low, high, COUNT_CAP);
    if (countingResults.length > 0) {
      const combos = countingResults.slice(0, MAX_RESULTS_PER_G).map((sc) => fixedExpanded.concat(sc));
      found.push({
        G,
        R: (N - G) + knownCount,
        combos,
        matchCount: countingResults.length,
        matchCapped: countingResults.length >= COUNT_CAP,
      });
    }
  }

  resultsEl.innerHTML = "";

  if (found.length === 0) {
    resultsEl.innerHTML = '<p class="text-sm text-[#767b87]">Tidak ada kombinasi yang cocok dengan rata-rata ini.</p>';
    return;
  }

  const compactMode = found.length > 2;

  if (compactMode) {
    resultsEl.className = "mt-1 flex flex-col gap-2";

    found.forEach((f) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between px-4 py-3 bg-[#0e1016] rounded-xl border border-[#22252f]";

      const label = document.createElement("span");
      label.className = "text-sm font-semibold text-[#e8e8ec]";
      label.innerHTML = `Gold ${f.G} <span class="text-[#5f636e] font-normal">·</span> Red ${f.R}`;
      row.appendChild(label);

      const chance = document.createElement("span");
      chance.className = "text-xs text-[#8fa0ff] bg-[#1a2140] border border-[#3a4a8f] px-2 py-1 rounded-full whitespace-nowrap";
      chance.textContent = (f.matchCapped ? f.matchCount + "+" : f.matchCount) + " kombinasi cocok";
      row.appendChild(chance);

      resultsEl.appendChild(row);
    });

    return;
  }

  resultsEl.className = "mt-1 grid gap-3 items-start grid-cols-[repeat(auto-fit,minmax(280px,1fr))]";

  found.forEach((f) => {
    const block = document.createElement("div");
    block.className = "bg-[#0e1016] rounded-xl p-3 border border-[#22252f] flex flex-col gap-2";

    const header = document.createElement("div");
    header.className = "flex items-center justify-between text-xs font-semibold text-[#e8e8ec] uppercase tracking-wide";
    header.innerHTML = `<span>Gold ${f.G} <span class="text-[#5f636e] font-normal normal-case">·</span> Red ${f.R}</span>`;
    block.appendChild(header);

    f.combos.forEach((combo) => {
      const sum = combo.reduce((a, b) => a + b.value, 0);
      const avgActual = Math.floor(sum / f.G);

      const row = document.createElement("div");
      row.className = "flex items-center gap-2 p-2 bg-[#12141a] rounded-lg border border-[#22252f]";

      const imagesContainer = document.createElement("div");
      imagesContainer.className = "grid grid-cols-3 gap-1.5 flex-1";

      combo.forEach((item) => {
        const imgWrap = document.createElement("div");
        const ringColor = item.forced ? "ring-[#ffb84d]" : "ring-[#3a4a8f]";
        imgWrap.className = "rounded-lg overflow-hidden ring-2 " + ringColor + " bg-[#0b0d12] flex flex-col";

        const img = document.createElement("img");
        img.src = "assets/gold/" + item.originalIdx + ".png";
        img.alt = item.name;
        img.title = item.name;
        img.className = "w-full h-auto block";
        img.onerror = () => img.style.display = 'none';
        imgWrap.appendChild(img);

        const nameLabel = document.createElement("p");
        nameLabel.className = "text-[10px] leading-tight text-center text-[#c7ceff] px-1 py-1 truncate";
        nameLabel.textContent = item.name;
        nameLabel.title = item.name;
        imgWrap.appendChild(nameLabel);

        imagesContainer.appendChild(imgWrap);
      });

      const textContainer = document.createElement("div");
      textContainer.className = "text-[11px] text-[#8fa0ff] font-medium bg-[#1a2140] px-2 py-1 rounded border border-[#3a4a8f] whitespace-nowrap shrink-0 self-start";
      textContainer.textContent = "avg " + fmt(avgActual);

      row.appendChild(imagesContainer);
      row.appendChild(textContainer);

      block.appendChild(row);
    });

    resultsEl.appendChild(block);
  });
}

["total", "purple", "avgprice"].forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    calc();
    runSearch();
  });
});

renderGrid();
renderGoldChips();
setupGoldSearch();
calc();
runSearch();