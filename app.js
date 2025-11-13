const seriesData = [
  {
    id: "dbz",
    title: "Dragon Ball Z",
    year: 1989,
    thumb: "dragon_ball_z.png",
    seasons: [
      {
        season: 1,
        episodes: [
          { number: 1, title: "El guerrero misterioso", duration: "24m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
          { number: 2, title: "La llegada de Raditz", duration: "24m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
          { number: 3, title: "El sacrificio de Goku", duration: "24m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        ],
      },
      { season: 2, episodes: [{ number: 1, title: "Entrenamiento en el otro mundo", duration: "24m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" }] },
    ],
  },
  {
    id: "saint-seiya",
    title: "Los Caballeros del Zodiaco",
    year: 1986,
    thumb: "saint_seiya.png",
    seasons: [
      {
        season: 1,
        episodes: [
          { number: 1, title: "Seiya, el caballero de Pegaso", duration: "23m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
          { number: 2, title: "El torneo galáctico", duration: "23m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        ],
      },
    ],
  },
  {
    id: "sailor-moon",
    title: "Sailor Moon",
    year: 1992,
    thumb: "sailor_moon.png",
    seasons: [
      {
        season: 1,
        episodes: [
          { number: 1, title: "¡Sailor Moon aparece!", duration: "22m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
          { number: 2, title: "El llanto de Usagi", duration: "22m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        ],
      },
    ],
  },
  {
    id: "he-man",
    title: "He-Man y los Amos del Universo",
    year: 1983,
    thumb: "he_man.png",
    seasons: [
      {
        season: 1,
        episodes: [
          { number: 1, title: "El corazón de la serpiente", duration: "22m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
          { number: 2, title: "Skeletor ataca", duration: "22m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        ],
      },
    ],
  },
  {
    id: "thundercats",
    title: "Thundercats",
    year: 1985,
    thumb: "thundercats.png",
    seasons: [
      {
        season: 1,
        episodes: [
          { number: 1, title: "Éxodo", duration: "22m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
          { number: 2, title: "El despertar", duration: "22m", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        ],
      },
    ],
  },
];

const gridEl = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const episodeModal = document.getElementById("episodeModal");
const closeEpisodeModal = document.getElementById("closeEpisodeModal");
const modalThumb = document.getElementById("modalThumb");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const seasonSelect = document.getElementById("seasonSelect");
const episodeList = document.getElementById("episodeList");

const playerOverlay = document.getElementById("playerOverlay");
const closePlayer = document.getElementById("closePlayer");
const videoEl = document.getElementById("videoEl");
const playerTitle = document.getElementById("playerTitle");

let currentSeries = null;
// Reacciones en localStorage
const reactionsKey = "retroSeriesReactions";
const reactions = JSON.parse(localStorage.getItem(reactionsKey) || "{}");
const votesKey = "retroSeriesVotes";
const userVotes = JSON.parse(localStorage.getItem(votesKey) || "{}");

function renderGrid(list) {
  gridEl.innerHTML = "";
  list.forEach(s => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img loading="lazy" src="${s.thumb}" alt="${s.title}">
      <div class="info">
        <div class="title">${s.title}</div>
        <div class="meta">${s.year} • ${s.seasons.length} temporada(s)</div>
      </div>
      <div class="extras">
        <div class="reactions" data-id="${s.id}">
          <button class="reaction-btn like-btn" aria-label="Me gusta">👍🏼 <span class="reaction-count like-count">${getCount(s.id, "like")}</span></button>
          <button class="reaction-btn dislike-btn" aria-label="No me gusta">👎🏼 <span class="reaction-count dislike-count">${getCount(s.id, "dislike")}</span></button>
        </div>
        <div class="country-badge"><span class="flag">🇪🇸</span><span class="label">España</span></div>
      </div>
    `;
    card.addEventListener("click", () => openSeriesModal(s));

    // Reacciones con posibilidad de revertir o cambiar
    const reactWrap = card.querySelector(".reactions");
    const likeBtn = reactWrap.querySelector(".like-btn");
    const dislikeBtn = reactWrap.querySelector(".dislike-btn");

    // pintar estado activo si el usuario ya votó
    const existing = getVote(s.id);
    if (existing === "like") likeBtn.classList.add("active");
    if (existing === "dislike") dislikeBtn.classList.add("active");

    reactWrap.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = reactWrap.getAttribute("data-id");
      const targetLike = e.target.closest(".like-btn");
      const targetDislike = e.target.closest(".dislike-btn");
      if (!targetLike && !targetDislike) return;

      const prev = getVote(id);
      const newVote = targetLike ? "like" : "dislike";

      if (prev === newVote) {
        // Revertir el voto
        decCount(id, newVote);
        clearVote(id);
      } else {
        // Cambiar o establecer voto
        if (prev) decCount(id, prev);
        incCount(id, newVote);
        setVote(id, newVote);
      }

      // Actualizar UI
      reactWrap.querySelector(".like-count").textContent = getCount(id, "like");
      reactWrap.querySelector(".dislike-count").textContent = getCount(id, "dislike");
      likeBtn.classList.toggle("active", getVote(id) === "like");
      dislikeBtn.classList.toggle("active", getVote(id) === "dislike");
    });

    gridEl.appendChild(card);
  });
}

function getCount(id, type) {
  return reactions[id]?.[type] ?? 0;
}
function incCount(id, type) {
  reactions[id] = reactions[id] || { like: 0, dislike: 0 };
  reactions[id][type] += 1;
  localStorage.setItem(reactionsKey, JSON.stringify(reactions));
}
function decCount(id, type) {
  reactions[id] = reactions[id] || { like: 0, dislike: 0 };
  reactions[id][type] = Math.max(0, reactions[id][type] - 1);
  localStorage.setItem(reactionsKey, JSON.stringify(reactions));
}
function getVote(id){ return userVotes[id] || null; }
function setVote(id, type){ userVotes[id]=type; localStorage.setItem(votesKey, JSON.stringify(userVotes)); }
function clearVote(id){ delete userVotes[id]; localStorage.setItem(votesKey, JSON.stringify(userVotes)); }

function openSeriesModal(series) {
  currentSeries = series;
  episodeModal.classList.remove("hidden");
  episodeModal.setAttribute("aria-hidden", "false");

  modalThumb.src = series.thumb;
  modalThumb.alt = series.title;
  modalTitle.textContent = series.title;
  modalMeta.textContent = `${series.year} • ${series.seasons.length} temporada(s)`;

  seasonSelect.innerHTML = "";
  series.seasons.forEach(sea => {
    const opt = document.createElement("option");
    opt.value = sea.season;
    opt.textContent = `Temporada ${sea.season}`;
    seasonSelect.appendChild(opt);
  });
  renderEpisodes(series.seasons[0].season);

  seasonSelect.onchange = () => renderEpisodes(parseInt(seasonSelect.value, 10));
}

function renderEpisodes(seasonNumber) {
  const seasonObj = currentSeries.seasons.find(s => s.season === seasonNumber);
  episodeList.innerHTML = "";
  seasonObj.episodes.forEach(ep => {
    const item = document.createElement("button");
    item.className = "episode";
    item.innerHTML = `
      <img class="ep-thumb" src="${currentSeries.thumb}" alt="T${seasonNumber}E${ep.number}">
      <div class="ep-info">
        <div class="ep-title">Capítulo ${ep.number}: ${ep.title}</div>
        <div class="ep-meta">T${seasonNumber} • ${ep.duration}</div>
      </div>
    `;
    item.addEventListener("click", () => openPlayer(currentSeries, seasonNumber, ep));
    episodeList.appendChild(item);
  });
}

function openPlayer(series, seasonNumber, ep) {
  playerOverlay.classList.remove("hidden");
  playerOverlay.setAttribute("aria-hidden", "false");
  playerTitle.textContent = `${series.title} — T${seasonNumber}E${ep.number}: ${ep.title}`;

  videoEl.src = ep.src;
  videoEl.currentTime = 0;
  videoEl.play().catch(() => {});
}

function closeModals() {
  episodeModal.classList.add("hidden");
  episodeModal.setAttribute("aria-hidden", "true");
}

function closePlayerOverlay() {
  videoEl.pause();
  videoEl.src = "";
  playerOverlay.classList.add("hidden");
  playerOverlay.setAttribute("aria-hidden", "true");
}

closeEpisodeModal.addEventListener("click", closeModals);
closePlayer.addEventListener("click", closePlayerOverlay);

episodeModal.addEventListener("click", (e) => {
  if (e.target === episodeModal) closeModals();
});
playerOverlay.addEventListener("click", (e) => {
  if (e.target === playerOverlay) closePlayerOverlay();
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = seriesData.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.seasons.some(sea => sea.episodes.some(ep => (ep.title.toLowerCase().includes(q))))
  );
  renderGrid(filtered);
});

sortSelect.addEventListener("change", () => {
  const v = sortSelect.value;
  const list = [...seriesData];
  if (v === "title-asc") list.sort((a,b)=> a.title.localeCompare(b.title));
  if (v === "title-desc") list.sort((a,b)=> b.title.localeCompare(a.title));
  if (v === "year-asc") list.sort((a,b)=> a.year - b.year);
  if (v === "year-desc") list.sort((a,b)=> b.year - a.year);
  renderGrid(list);
});

renderGrid(seriesData);

// Bloquear menú contextual sobre el video para desalentar descargas
videoEl.addEventListener("contextmenu", (e) => e.preventDefault());

// Desactivar el antiguo mosaico en canvas (mantener funciones por compatibilidad, pero no dibujar)
// const characters = ["goku","greenRanger","yogi","dexter","heman","bulma"];
// function faceBase(ctx,x,y,r,skin){ ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
// function drawGoku(ctx,x,y,s){ faceBase(ctx,x,y,14*s,"#ffccaa"); ctx.fillStyle="#111"; ctx.beginPath(); ctx.moveTo(x-18*s,y-6*s); ctx.lineTo(x,y-22*s); ctx.lineTo(x+18*s,y-6*s); ctx.lineTo(x+10*s,y-2*s); ctx.lineTo(x-10*s,y-2*s); ctx.closePath(); ctx.fill(); }
// function drawGreenRanger(ctx,x,y,s){ ctx.fillStyle="#0b7d39"; ctx.beginPath(); ctx.arc(x,y,16*s,0,Math.PI*2); ctx.fill(); ctx.fillStyle="#111"; ctx.fillRect(x-10*s,y-4*s,20*s,8*s); ctx.fillStyle="#eee"; ctx.fillRect(x-8*s,y-2*s,16*s,4*s); }
// function drawYogi(ctx,x,y,s){ faceBase(ctx,x,y,14*s,"#a46b37"); ctx.fillStyle="#5b3a1f"; ctx.beginPath(); ctx.arc(x,y-10*s,8*s,Math.PI,0); ctx.fill(); ctx.fillStyle="#7cc04b"; ctx.fillRect(x-6*s,y+9*s,12*s,4*s); }
// function drawDexter(ctx,x,y,s){ faceBase(ctx,x,y,13*s,"#ffd7b8"); ctx.fillStyle="#f28c1b"; ctx.fillRect(x-14*s,y-16*s,28*s,8*s); ctx.fillStyle="#66c5ff"; ctx.fillRect(x-12*s,y-6*s,24*s,10*s); ctx.fillStyle="#111"; ctx.fillRect(x-12*s,y-6*s,2*s,10*s); ctx.fillRect(x+10*s,y-6*s,2*s,10*s); }
// function drawHeMan(ctx,x,y,s){ faceBase(ctx,x,y,14*s,"#ffcf9c"); ctx.fillStyle="#e8c15d"; ctx.fillRect(x-16*s,y-14*s,32*s,10*s); ctx.fillStyle="#caa24b"; ctx.fillRect(x-14*s,y-8*s,28*s,6*s); }
// function drawBulma(ctx,x,y,s){ faceBase(ctx,x,y,13*s,"#ffd6c1"); ctx.fillStyle="#27c0c7"; ctx.beginPath(); ctx.arc(x,y-6*s,15*s,Math.PI,0); ctx.fill(); ctx.fillStyle="#e91e63"; ctx.fillRect(x-6*s,y-15*s,12*s,3*s); }
// function drawCharacter(ctx,x,y,scale,type){
//   const s = scale;
//   if(type==="goku") return drawGoku(ctx,x,y,s);
//   if(type==="greenRanger") return drawGreenRanger(ctx,x,y,s);
//   if(type==="yogi") return drawYogi(ctx,x,y,s);
//   if(type==="dexter") return drawDexter(ctx,x,y,s);
//   if(type==="heman") return drawHeMan(ctx,x,y,s);
//   return drawBulma(ctx,x,y,s);
// }

// Fondo mosaico con emojis nostálgicos
// const mosaicCanvas = document.getElementById("bgMosaic");
// const mCtx = mosaicCanvas.getContext("2d");
// const emojiSet = ["🕹️","📼","💾","🎮","📺","📻","💿","🧸","⭐","🚀","🎲","🎯","🎼","🧩"];
// function drawMosaic() {
//   mosaicCanvas.width = window.innerWidth;
//   mosaicCanvas.height = window.innerHeight;
//   mCtx.clearRect(0,0,mosaicCanvas.width,mosaicCanvas.height);
//   const tile = 96; // tamaño de mosaico
//   for (let y=0; y<mosaicCanvas.height; y+=tile) {
//     for (let x=0; x<mosaicCanvas.width; x+=tile) {
//       // fondo cuadrado suave
//       const hue = 40 + Math.floor(Math.random()*40); // cálidos
//       const sat = 50 + Math.floor(Math.random()*30);
//       const light = 18 + Math.floor(Math.random()*8);
//       mCtx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
//       mCtx.fillRect(x, y, tile, tile);
//       // borde sutil
//       mCtx.strokeStyle = "rgba(255, 204, 51, 0.08)";
//       mCtx.strokeRect(x+0.5, y+0.5, tile-1, tile-1);
//       // emoji centrado
//       const type = characters[Math.floor(Math.random()*characters.length)];
//       drawCharacter(mCtx, x + tile/2, y + tile/2, 1, type);
//     }
//   }
// }
// drawMosaic();
// window.addEventListener("resize", () => {
//   // debounce simple
//   clearTimeout(window.__mosaicTimer);
//   window.__mosaicTimer = setTimeout(drawMosaic, 100);
// });
