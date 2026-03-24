import { gameAPI, eventAPI, getCurrentUser } from '/scripts/api.js';


function isGameMaster() {
  const user = getCurrentUser();
  return user?.role === "gamemaster";
}

if (!isGameMaster()) {
  window.location.href = "/";
}

const gamesDropdown = document.getElementById("gamesDropdown");
const playersA = document.getElementById("playersA");
const playersB = document.getElementById("playersB");
const playerSelect = document.getElementById("playerSelect");
const eventForm = document.getElementById("eventForm");
const eventsList = document.getElementById("eventsList");
const startGameBtn = document.getElementById("startGameBtn");
const endGameBtn = document.getElementById("endGameBtn");

let currentGame = null;
let events = [];


async function loadGames() {
  try {
    const data = await gameAPI.getAll();
    const games = data.games ?? [];

    gamesDropdown.innerHTML = games.map(g => {
      const teamA = g.teams[0]?.name || "A";
      const teamB = g.teams[1]?.name || "B";
      return `<option value="${g._id}">${teamA} vs ${teamB}</option>`;
    }).join("");

    if (games.length > 0) loadGameDetails(games[0]._id);

  } catch (err) {
    console.error("Erro ao carregar jogos:", err);
  }
}

gamesDropdown.addEventListener("change", e => loadGameDetails(e.target.value));


async function loadGameDetails(gameId) {
  try {
    currentGame = await gameAPI.getById(gameId);

    const [teamA, teamB] = currentGame.teams;

    playersA.innerHTML = (teamA.players ?? []).map(p => `<p>${p.number} - ${p.name}</p>`).join("");
    playersB.innerHTML = (teamB.players ?? []).map(p => `<p>${p.number} - ${p.name}</p>`).join("");

    const allPlayers = [...(teamA.players ?? []), ...(teamB.players ?? [])];
    playerSelect.innerHTML = allPlayers.map(p => `<option value="${p._id}">${p.name}</option>`).join("");

   
    events = currentGame.events?.map(ev => ({
      ...ev,
      playerName: allPlayers.find(p => p._id === ev.player)?.name || "Desconhecido"
    })) ?? [];
    renderEvents();

  } catch (err) {
    console.error("Erro ao carregar detalhes do jogo:", err);
  }
}


function renderEvents() {
  eventsList.innerHTML = events
    .map(ev => {
      const team = currentGame.teams.find(t => t.players.some(p => p._id === ev.player));
      const teamName = team?.name || "Desconhecida";
      return `<li>[${teamName}] ${ev.minute}' - ${ev.type.toUpperCase()} - ${ev.playerName}</li>`;
    })
    .join("");
}
eventForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentGame) return alert("Escolha um jogo primeiro!");

  const playerId = playerSelect.value;
  const player = [...currentGame.teams[0].players, ...currentGame.teams[1].players].find(p => p._id === playerId);

  const eventData = {
    game: currentGame._id,
    type: document.getElementById("eventType").value,
    minute: parseInt(document.getElementById("minute").value),
    player: playerId,
  };

  try {
    const createdEvent = await eventAPI.create(eventData);

  
    events.push({ ...eventData, playerName: player.name });
    renderEvents();

    // Atualizar score automaticamente se for golo
    if (eventData.type === "goal") {
      const team = currentGame.teams.find(t => t.players.some(p => p._id === playerId));
      const updatedResult = { ...currentGame.result };
      if (team._id === currentGame.teams[0]._id) updatedResult.homeScore = (updatedResult.homeScore ?? 0) + 1;
      else updatedResult.awayScore = (updatedResult.awayScore ?? 0) + 1;

      await gameAPI.update(currentGame._id, { result: updatedResult });
      currentGame.result = updatedResult;
    }

    eventForm.reset();
  } catch (err) {
    console.error("Erro ao adicionar evento:", err);
    alert("Não foi possível adicionar o evento!");
  }
});

// Iniciar jogo
startGameBtn.addEventListener("click", async () => {
  if (!currentGame) return alert("Escolha um jogo!");
  try {
    await gameAPI.update(currentGame._id, { status: "in_progress" });
    alert("Jogo iniciado!");
  } catch (err) {
    console.error("Erro ao iniciar jogo:", err);
  }
});

//  Finalizar jogo
endGameBtn.addEventListener("click", async () => {
  if (!currentGame) return alert("Escolha um jogo!");
  try {
    await gameAPI.update(currentGame._id, { status: "finished" });
    alert("Jogo finalizado!");
  } catch (err) {
    console.error("Erro ao finalizar jogo:", err);
  }
});


loadGames();


import { authAPI } from '/scripts/api.js';

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await authAPI.login({ email, password });

    // Verifica se o usuário é Game Master
    if (res.user.role !== 'gamemaster') {
      alert('Não tem permissão para aceder como Game Master!');
      return;
    }

    // Salva token e info do usuário
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));

    // Redireciona para painel do Game Master
    window.location.href = '/Pages/gamemaster/gameMasterFichaJogo.html';

  } catch (err) {
    console.error(err);
    alert('Email ou senha inválidos!');
  }
});