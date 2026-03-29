const BASE_URL = "https://liyc-1zn5.onrender.com/api";
const path = window.location.pathname;

async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${BASE_URL}/auth/refreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/Pages/admin/login.html";
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/Pages/admin/login.html";
    throw error;
  }
}

async function fetchAPI(
  endpoint,
  method = "GET",
  body = null,
  retried = false,
) {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("accessToken"); // ✅ correto
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (response.status === 401 && !retried) {
    try {
      await refreshAccessToken();
      return fetchAPI(endpoint, method, body, true);
    } catch (error) {
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getAuthToken() {
  return localStorage.getItem("accessToken");
}

export function isAuthenticated() {
  return getAuthToken();
}

export function isAdmin() {
  const user = getCurrentUser();
  return user?.role === "admin";
}

export function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = "/Pages/admin/login.html";
  }
}

export function protectPagesAdmin() {
  if (!isAdmin) {
    window.location.href = "/Pages/admin/home.html";
  }
}

// Auth API
export const authAPI = {
  login: (data) => fetchAPI("/auth/login", "POST", data),
  register: (data) => fetchAPI("/auth/register", "POST", data),
  logout: () => fetchAPI("/auth/logout", "POST"),
  refreshToken: (data) => fetchAPI("/auth/refreshToken", "POST", data),
  getUser: () => fetchAPI("/auth/user", "GET"),
};

// Event API
export const eventAPI = {
  getAll: () => fetchAPI("/events", "GET"),
  getById: (id) => fetchAPI(`/events/${id}`, "GET"),
  create: (data) => fetchAPI("/events", "POST", data),
  update: (id, data) => fetchAPI(`/events/${id}`, "PUT", data),
  delete: (id) => fetchAPI(`/events/${id}`, "DELETE"),
};

// Fixtures API
export const fixturesAPI = {
  create: (data) => fetchAPI("/", "POST", data),
  createGroups: (data) => fetchAPI("/groups", "POST", data),
};

// Game API
export const gameAPI = {
  getAll: () => fetchAPI("/games", "GET"),
  getById: (id) => fetchAPI(`/games/${id}`, "GET"),
  create: (data) => fetchAPI("/games", "POST", data),
  update: (id, data) => fetchAPI(`/games/${id}`, "PUT", data),
  delete: (id) => fetchAPI(`/games/${id}`, "DELETE"),
};

// Player API
export const playerAPI = {
  getAll: () => fetchAPI("/players", "GET"),
  getById: (id) => fetchAPI(`/players/${id}`, "GET"),
  create: (data) => fetchAPI("/players", "POST", data),
  update: (id, data) => fetchAPI(`/players/${id}`, "PUT", data),
  delete: (id) => fetchAPI(`/players/${id}`, "DELETE"),
};

// Standings API
export const standingsAPI = {
  getAll: () => fetchAPI("/standings", "GET"),
  getByGroup: () => fetchAPI(`/standings/byGroup`, "GET"),
  getLive: () => fetchAPI(`/standings/live`, "GET"),
  getByGroupLive: () => fetchAPI(`/standings/byGroupLive`, "GET"),
};

// Team API
export const teamAPI = {
  getAll: () => fetchAPI("/teams", "GET"),
  getById: (id) => fetchAPI(`/teams/${id}`, "GET"),
  create: (data) => fetchAPI("/teams", "POST", data),
  update: (id, data) => fetchAPI(`/teams/${id}`, "PUT", data),
  delete: (id) => fetchAPI(`/teams/${id}`, "DELETE"),
};

// mudar no cPanel para url do site no ficheiro upload.php
async function uploadToCpanel(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    "https://lgspintercontinentalyouthcup.com/upload.php",
    {
      method: "POST",
      body: formData,
    },
  );

  return await res.json();
}

// mudar no cPanel para url do site no ficheiro sendEmail.php
async function sendContactForm(data) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("subject", data.subject);
  formData.append("message", data.message);

  const res = await fetch(
    "https://lgspintercontinentalyouthcup.com/sendEmail.php",
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await res.json();
  return result;
}

// Helper functions
async function loadTeamsDropdown(selectElement, includeEmpty = true) {
  try {
    const data = await teamAPI.getAll();
    const teams = data?.teams ?? [];
    selectElement.innerHTML =
      (includeEmpty ? `<option value="">Selecione uma equipa</option>` : "") +
      teams
        .map((team) => `<option value="${team._id}">${team.name}</option>`)
        .join("");
  } catch (error) {
    console.error("Error fetching teams:", error);
    alert("Não foi possível carregar as equipas.");
  }
}

async function loadGamesDropdown(selectElement, includeEmpty = true) {
  try {
    const data = await gameAPI.getAll();
    const games = data?.games ?? [];
    selectElement.innerHTML =
      (includeEmpty ? `<option value="">Selecione um jogo</option>` : "") +
      games
        .map(
          (game) => `<option value="${game._id}">Jogo J${game.n_jogo}</option>`,
        )
        .join("");
  } catch (error) {
    console.error("Error fetching games:", error);
    alert("Não foi possível carregar os jogos.");
  }
}

async function loadTeamsForGame(gameId, teamSelect) {
  if (!gameId) {
    teamSelect.innerHTML = `<option value="">Selecione uma equipa</option>`;
    return;
  }

  try {
    const game = await gameAPI.getById(gameId);

    const gameTeams = game.teams;

    teamSelect.innerHTML =
      `<option value="">Selecione uma equipa</option>` +
      gameTeams
        .map((team) => `<option value="${team._id}">${team.name}</option>`)
        .join("");
  } catch (err) {
    console.error("Erro ao carregar equipas do jogo:", err);
    alert("Não foi possível carregar as equipas deste jogo.");
  }
}

async function loadPlayersForTeam(teamId, playerSelect) {
  if (!teamId) {
    playerSelect.innerHTML = `<option value="">Selecione um jogador</option>`;
    return;
  }

  try {
    const team = await teamAPI.getById(teamId);

    const teamPlayers = team.players;

    playerSelect.innerHTML =
      `<option value="">Selecione um jogador</option>` +
      teamPlayers
        .map(
          (player) => `<option value="${player._id}">${player.name}</option>`,
        )
        .join("");
  } catch (err) {
    console.error("Erro ao carregar jogadores:", err);
    alert("Não foi possível carregar os jogadores.");
  }
}

async function loadPlayers(teamId, playersListElement) {
  try {
    const teamData = await teamAPI.getById(teamId);
    const players = teamData.players ?? [];
    const userIsAdmin = isAdmin();
    playersListElement.innerHTML = players
      .map((player) => {
        const deleteButton = userIsAdmin
          ? `<button class="deletePlayerBtn" data-playerid="${player._id}"><i class="fa-solid fa-trash"></i></button>`
          : "";
        return `<div>${player.number} - ${player.name} - ${player.position} <button class="editPlayerBtn" data-playerid="${player._id}"><i class="fa-regular fa-pen-to-square"></i></button> ${deleteButton}</div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error fetching team players:", err);
    alert("Não foi possível carregar os jogadores da equipa selecionada.");
  }
}

async function loadEvents(gameId, eventsListElement) {
  try {
    const gameData = await gameAPI.getById(gameId);
    const events = gameData.events ?? [];

    const htmlArray = await Promise.all(
      events.map(async (event) => {
        const team = await teamAPI.getById(event.team);
        const player = await playerAPI.getById(event.player);
        return `
        <div>
          ${event.type} | ${event.time}min - ${team.name} - ${player.name}
        </div>
      `;
      }),
    );

    eventsListElement.innerHTML = htmlArray.join("");
  } catch (err) {
    console.error("Error fetching game events:", err);
    alert("Não foi possível carregar os eventos do jogo selecionado.");
  }
}

async function loadAndRenderTeams(teamsListElement) {
  try {
    const data = await teamAPI.getAll();
    const teams = data?.teams ?? [];
    const userIsAdmin = isAdmin();

    if (!userIsAdmin) {
      const addBtn = document.getElementById("addTeamBtn");
      if (addBtn) addBtn.style.display = "none";
    }

    const html = teams
      .map((team) => {
        const adminButtons = userIsAdmin
          ? `<div class="editMenu">
              <button class="editTeamBtn" data-teamid="${team._id}">Editar Equipa</button>
              <button class="deleteTeamBtn" data-teamid="${team._id}">Eliminar Equipa</button>
            </div>`
          : "";
        return `
          <li class="listTeams">
            <img src="${team.image}" alt="Imagem não disponível"/>
            <h3>${team.name} (${team.country})</h3>
            <h4>${team.group}</h4>
            ${adminButtons}
            <h5>Jogadores</h5>
            <ul>
              ${(team.players ?? [])
                .map(
                  (player) => `
                <li id="${player._id}">
                  ${player.number} - ${player.name} - ${player.position}
                </li>
              `,
                )
                .join("")}
            </ul>
          </li>
        `;
      })
      .join("");

    teamsListElement.innerHTML = html;
  } catch (error) {
    console.error("Error fetching teams:", error);
    alert("Não foi possível carregar as equipas.");
  }
}

async function loadAndRenderGames(gamesListElement) {
  try {
    const data = await gameAPI.getAll();
    const games = data?.games ?? [];
    const userIsAdmin = isAdmin();

    if (!userIsAdmin) {
      const addBtn = document.getElementById("addGameBtn");
      if (addBtn) addBtn.style.display = "none";
    }

    const html = games
      .map((game) => {
        const adminButtons = userIsAdmin
          ? `<div class="editMenu">
              <button class="editGameBtn" data-gameid="${game._id}">Editar Jogo</button>
              <button class="deleteGameBtn" data-gameid="${game._id}">Eliminar Jogo</button>
            </div>`
          : "";
        return `
          <li class="listGames">
            <h3>Jogo J${game.n_jogo}</h3>
            ${adminButtons}
            <h5>Equipas</h5>
            <ul>
              ${(game.teams ?? [])
                .map(
                  (team) => `
                <li id="${team._id}">
                  ${team.name}
                </li>
              `,
                )
                .join("")}
            </ul>
          </li>
        `;
      })
      .join("");

    gamesListElement.innerHTML = html;
  } catch (error) {
    console.error("Error fetching games:", error);
    alert("Não foi possível carregar os jogos.");
  }
}

async function loadAndRenderEvents(eventsListElement) {
  try {
    const data = await eventAPI.getAll();
    const events = data.events ?? [];
    const userIsAdmin = isAdmin();

    const html = events
      .map((ev) => {
        const adminBtns = userIsAdmin
          ? `<div class="editMenu">
          <button class="editEventBtn" data-eventid="${ev._id}">Editar</button>
          <button class="deleteEventBtn" data-eventid="${ev._id}">Eliminar</button>
        </div>`
          : "";
        return `<li class="eventItem">
          <h3>Jogo J${ev.game.n_jogo}</h3>
          <p><strong>equipa:</strong> ${ev.team.name} <strong>jogador:</strong> ${ev.player.name}</p>
          <p><strong>minuto:</strong> ${ev.time} <strong>tipo:</strong> ${ev.type}</p>
          ${adminBtns}
        </li>`;
      })
      .join("");

    eventsListElement.innerHTML = html;
  } catch (error) {
    console.error("Error fetching events:", error);
    alert("Não foi possível carregar os eventos.");
  }
}

async function handleDelete(
  apiCall,
  id,
  elementToRemove,
  successMessage,
  errorMessage,
) {
  if (!confirm("Tem certeza que deseja eliminar este item?")) return;

  const btn = document.querySelector('button[class="delete*"]');
  if (btn) {
    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "A eliminar...";
  }

  try {
    await apiCall(id);
    alert(successMessage);
    elementToRemove.remove();
  } catch (err) {
    console.error("Error deleting:", err);
    alert(errorMessage);
     btn.disabled = false;
    btn.textContent = originalText;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

async function loadPlayerForEdit(playerId) {
  try {
    const player = await playerAPI.getById(playerId);
    if (!player) throw new Error("Jogador não encontrado.");

    document.getElementById("playerName").value = player.name ?? "";
    document.getElementById("playerNumber").value = player.number ?? "";
    document.getElementById("playerPosition").value = player.position ?? "";

    const teams = (await teamAPI.getAll())?.teams ?? [];
    const teamDropdown = document.getElementById("teamsDropdown");
    teamDropdown.innerHTML = teams
      .map(
        (t) =>
          `<option value="${t._id}" ${t._id === player.team ? "selected" : ""}>${t.name}</option>`,
      )
      .join("");

    const imgPreview = document.getElementById("imgPlayer");
    if (player.image && imgPreview) imgPreview.src = player.image;
  } catch (err) {
    console.error("Erro ao carregar jogador:", err);
    alert("Não foi possível carregar os dados do jogador.");
  }
}

async function loadTeamForEdit(teamId) {
  try {
    const team = await teamAPI.getById(teamId);
    if (!team) throw new Error("Equipa não encontrada.");

    document.getElementById("teamName").value = team.name ?? "";
    document.getElementById("teamCountry").value = team.country ?? "";
    document.getElementById("teamGroup").value = team.group ?? "";

    const imgPreview = document.getElementById("imgTeam");
    if (imgPreview && team.image) {
      imgPreview.src = team.image;
      imgPreview.style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching team:", error);
    alert("Não foi possível carregar os dados da equipa.");
  }
}

async function loadGameForEdit(gameId) {
  try {
    const game = await gameAPI.getById(gameId);
    if (!game) throw new Error("Jogo não encontrado.");

    const teams = (await teamAPI.getAll())?.teams ?? [];
    const teamA = document.getElementById("teamA");
    const teamB = document.getElementById("teamB");

    const options = teams
      .map((t) => `<option value="${t._id}">${t.name}</option>`)
      .join("");

    teamA.innerHTML = options;
    teamB.innerHTML = options;

    teamA.value = game.teams[0]?._id || game.teams[0];
    teamB.value = game.teams[1]?._id || game.teams[1];

    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.value = game.status;
    const n_jogoEl = document.getElementById("n_jogo");
    if (n_jogoEl) n_jogoEl.value = game.n_jogo;
  } catch (err) {
    console.error(err);
    alert("Não foi possível carregar o jogo.");
  }
}

async function loadEventForEdit(eventId) {
  try {
    const event = await eventAPI.getById(eventId);
    if (!event) throw new Error("Evento não encontrado.");

    const teamDropdown = document.getElementById("teamsDropdown");
    const gamesDropdown = document.getElementById("gamesDropdown");
    const playersDropdown = document.getElementById("playersDropdown");

    await loadGamesDropdown(gamesDropdown);
    gamesDropdown.value = event.game._id;
    await loadTeamsForGame(event.game._id, teamDropdown);
    teamDropdown.value = event.team._id;
    await loadPlayersForTeam(event.team._id, playersDropdown);
    playersDropdown.value = event.player._id;
    document.getElementById("eventType").value = event.type;
    document.getElementById("eventTime").value = event.time;
  } catch (err) {
    console.error(err);
    alert("Não foi possível carregar o evento.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      logoutBtn.textContent = "A sair...";
      const refreshToken = localStorage.getItem("refreshToken");

      try {
        const response = await authAPI.logout(refreshToken);
        console.log("Logout response:", response);

        if (response) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          alert("Logout realizado com sucesso! Redirecionando...");

          setTimeout(() => {
            window.location.href = "/Pages/admin/login.html";
          }, 1000);
        } else {
          alert("Falha no logout.");
        }
      } catch (error) {
        console.error("Logout error:", error);
        alert(error.message || "Erro ao fazer logout. Tente novamente.");
      }
    });
  }

  // Login
  if (path.endsWith("/Pages/admin/login.html")) {
    if (localStorage.getItem("refreshToken")) {
      window.location.href = "/Pages/admin/home.html";
    }

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");

    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginBtn.disabled = true;
      loginBtn.textContent = "A autenticar...";

      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await authAPI.login({ email, password });

        if (response?.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
          alert("Login realizado com sucesso! Redirecionando...");
          setTimeout(
            () =>
              isAdmin
                ? (window.location.href = "/Pages/admin/home.html")
                : (window.location.href = "/Pages/admin/gameMaster.html"),
            1000,
          );
        } else {
          alert("Falha no login. Verifique as suas credenciais.");
          loginBtn.disabled = false;
          loginBtn.textContent = "Entrar";
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao fazer login. Tente novamente.");
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar";
      }
    });
  }

  // FIFA Card Form
  const fifaCardForm = document.getElementById("contactForm");
  if (fifaCardForm) {
    fifaCardForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const result = await sendContactForm({
        name: `${e.target.name.value} ${e.target.surname.value}`,
        email: e.target.email.value,
        subject: `FIFA Card Submission: ${e.target.team.value} - ${e.target.playerPosition.value}`,
        message: `Team: ${e.target.team.value}\nNationality: ${e.target.nationality.value}\nPosition: ${e.target.playerPosition.value}\nPace: ${e.target.pacePoints.value}\nShooting: ${e.target.shootingPoints.value}\nPassing: ${e.target.passingPoints.value}\nDribbling: ${e.target.dribblingPoints.value}\nDefence: ${e.target.defencePoints.value}\nPhysical: ${e.target.physicalPoints.value}`,
      });

      if (result.success) {
        alert("Mensagem enviada com sucesso!");
        window.location.reload();
      } else {
        alert("Erro ao enviar: " + (result.message || ""));
      }
    });
  }

  // ADD GAME
  const addGameForm = document.getElementById("addGameForm");
  if (addGameForm) {
    const teamA = document.getElementById("teamA");
    const teamB = document.getElementById("teamB");

    await loadTeamsDropdown(teamA, true);
    await loadTeamsDropdown(teamB, true);

    addGameForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        if (e.target.teamA.value === e.target.teamB.value) {
          return alert("As equipas têm de ser diferentes!");
        }

        const gameData = {
          teams: [e.target.teamA.value, e.target.teamB.value],
          n_jogo: e.target.n_jogo.value,
          status: e.target.status.value,
        };

        await gameAPI.create(gameData);

        alert("Jogo criado com sucesso!");
        window.location.href = "/Pages/admin/listGames.html";
      } catch (err) {
        console.error("Erro ao criar jogo:", err);
        alert("Erro ao criar jogo.");
      }
    });
  }

  // Add Team Form
  const formAddTeam = document.getElementById("addTeamForm");
  if (formAddTeam) {
    formAddTeam.addEventListener("submit", async (e) => {
      e.preventDefault();
      const upload = await uploadToCpanel(formAddTeam.teamImage.files[0]);
      const teamData = {
        name: formAddTeam.teamName.value,
        country: formAddTeam.teamCountry.value,
        group: formAddTeam.teamGroup.value,
        image: upload.url,
      };
      if (!teamData.name || !teamData.country)
        return alert("Preencha todos os campos obrigatórios.");

      try {
        await teamAPI.create(teamData);
        alert("Equipa adicionada com sucesso!");
        window.location.reload();
      } catch (error) {
        console.error("Error adding team:", error);
        alert("Erro ao adicionar equipa.");
      }
    });
  }

  // Add Player Form
  const formAddPlayer = document.getElementById("addPlayerForm");
  if (formAddPlayer) {
    const teamDropdown = document.getElementById("teamsDropdown");
    if (teamDropdown) await loadTeamsDropdown(teamDropdown);

    formAddPlayer.addEventListener("submit", async (e) => {
      e.preventDefault();
      const upload = await uploadToCpanel(formAddPlayer.playerImage.files[0]);
      const playerData = {
        name: formAddPlayer.playerName.value,
        team: formAddPlayer.teamsDropdown.value,
        number: formAddPlayer.playerNumber.value,
        position: formAddPlayer.playerPosition.value,
        image: upload.url,
      };
      if (!playerData.name || !playerData.team)
        return alert("Preencha todos os campos obrigatórios.");

      try {
        await playerAPI.create(playerData);
        alert("Jogador adicionado com sucesso!");
        window.location.reload();
      } catch (error) {
        console.error("Error adding player:", error);
        alert("Erro ao adicionar jogador.");
      }
    });
  }

  // Add Event Form
  const formAddEvent = document.getElementById("addEventForm");
  if (formAddEvent) {
    const teamDropdown = document.getElementById("teamsDropdown");
    const gamesDropdown = document.getElementById("gamesDropdown");
    const playersDropdown = document.getElementById("playersDropdown");
    if (gamesDropdown) await loadGamesDropdown(gamesDropdown);
    gamesDropdown.addEventListener("change", () => {
      if (teamDropdown) loadTeamsForGame(gamesDropdown.value, teamDropdown);
    });
    teamDropdown.addEventListener("change", () => {
      if (playersDropdown)
        loadPlayersForTeam(teamDropdown.value, playersDropdown);
    });

    formAddEvent.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const eventData = {
          type: formAddEvent.eventType.value,
          time: formAddEvent.eventTime.value,
          team: formAddEvent.teamsDropdown.value,
          player: formAddEvent.playersDropdown.value,
          game: formAddEvent.gamesDropdown?.value || gamesDropdown.value,
        };
        if (
          !eventData.type ||
          !eventData.time ||
          !eventData.game ||
          !eventData.player ||
          !eventData.team
        )
          return alert("Preencha todos os campos obrigatórios.");

        await eventAPI.create(eventData);
        alert("Evento adicionado com sucesso!");
        if (path.endsWith("/Pages/admin/gameMaster.html"))
          window.location.href = "/Pages/admin/gameMaster.html";
        if (path.endsWith("/Pages/admin/addEvent.html"))
          window.location.href = "/Pages/admin/listEvents.html";
      } catch (err) {
        console.error(err);
        alert("Erro ao adicionar evento.");
      }
    });
  }

  // EDIT GAME
  if (path.endsWith("/Pages/admin/editGame.html")) {
    const form = document.getElementById("editGameForm");
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("game");

    if (!gameId) {
      alert("ID do jogo em falta.");
      return;
    }

    await loadGameForEdit(gameId);

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const teamA = document.getElementById("teamA");
      const teamB = document.getElementById("teamB");

      if (teamA.value === teamB.value) {
        return alert("As equipas têm de ser diferentes!");
      }

      try {
        const updatedGame = {
          teams: [teamA.value, teamB.value],
          status: document.getElementById("status")?.value || "",
        };

        await gameAPI.update(gameId, updatedGame);

        alert("Jogo atualizado com sucesso!");
        window.location.href = "/Pages/admin/listGames.html";
      } catch (err) {
        console.error(err);
        alert("Erro ao atualizar jogo.");
      }
    });
  }

  // Edit Team Form
  const formEditTeam = document.getElementById("editTeamForm");
  if (formEditTeam) {
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get("team");

    if (teamId) await loadTeamForEdit(teamId);

    formEditTeam.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const file = formEditTeam.teamImage.files[0];
        const upload = file ? await uploadToCpanel(file) : { url: "" };
        const teamData = {
          name: formEditTeam.teamName.value,
          country: formEditTeam.teamCountry.value,
          group: formEditTeam.teamGroup.value,
          image: upload.url || document.getElementById("imgTeam")?.src || "",
        };

        await teamAPI.update(teamId, teamData);
        alert("Equipa editada com sucesso!");
        window.location.reload();
      } catch (error) {
        console.error("Error editing team:", error);
        alert("Erro ao editar equipa.");
      }
    });
  }

  // Edit Player Form
  const formEditPlayer = document.getElementById("editPlayerForm");
  if (formEditPlayer) {
    const playerId = new URLSearchParams(window.location.search).get("player");

    if (playerId) await loadPlayerForEdit(playerId);

    formEditPlayer.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const file = formEditPlayer.playerImage.files[0];
        const upload = file
          ? await uploadToCpanel(file)
          : { url: document.getElementById("imgPlayer")?.src || "" };
        const updatedPlayer = {
          name: formEditPlayer.playerName.value,
          number: formEditPlayer.playerNumber.value,
          position: formEditPlayer.playerPosition.value,
          team: formEditPlayer.teamsDropdown.value,
          image: upload.url,
        };

        await playerAPI.update(playerId, updatedPlayer);
        alert("Jogador atualizado com sucesso!");
        window.location.href = "/Pages/admin/listPlayers.html";
      } catch (err) {
        console.error(err);
        alert("Falha ao atualizar jogador.");
      }
    });
  }

  const menu = document.getElementById("menu");
  if (menu) {
    if (isAdmin()) {
      menu.innerHTML = `<ul class="menu">
        <li>
          <button><a href="/Pages/admin/listTeams.html">Equipas</a></button>
        </li>
        <li>
          <button><a href="/Pages/admin/listPlayers.html">Jogadores</a></button>
        </li>
        <li>
          <button><a href="/Pages/admin/listGames.html">Jogos</a></button>
        </li>
        <li>
          <button><a href="/Pages/admin/listEvents.html">Eventos</a></button>
        </li>
      </ul>`;
    } else {
      menu.innerHTML = `<ul class="menu">
        <li>
          <button><a href="/Pages/admin/gameMaster.html">Game Master</a></button>
        </li>
      </ul>`;
    }
  }

  // Edit Event Form
  const formEditEvent = document.getElementById("editEventForm");
  if (formEditEvent) {
    const eventId = new URLSearchParams(window.location.search).get("event");

    if (eventId) await loadEventForEdit(eventId);

    formEditEvent.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const eventData = {
          type: formEditEvent.eventType.value,
          time: formEditEvent.eventTime.value,
          team: formEditEvent.teamsDropdown.value,
          player: formEditEvent.playersDropdown.value,
          game: formEditEvent.gamesDropdown.value,
        };
        if (
          !eventData.type ||
          !eventData.time ||
          !eventData.game ||
          !eventData.player ||
          !eventData.team
        )
          return alert("Preencha todos os campos obrigatórios.");

        await eventAPI.update(eventId, updatedEvent);
        alert("Evento atualizado com sucesso!");
        window.location.href = "/Pages/admin/listEvents.html";
      } catch (err) {
        console.error(err);
        alert("Falha ao atualizar evento.");
      }
    });
  }

  // LIST PLAYERS
  const playersList = document.getElementById("playersList");
  const teamDropdown = document.getElementById("teamsDropdown");
  if (playersList && teamDropdown) {
    await loadTeamsDropdown(teamDropdown);

    teamDropdown.addEventListener("change", async () => {
      const selectedTeamId = teamDropdown.value;
      if (!selectedTeamId) {
        playersList.innerHTML = "";
        return;
      }
      await loadPlayers(selectedTeamId, playersList);
    });

    playersList.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".editPlayerBtn");
      if (editBtn) {
        window.location.href = `/Pages/admin/editPlayer.html?player=${editBtn.dataset.playerid}`;
        return;
      }

      const deleteBtn = e.target.closest(".deletePlayerBtn");
      if (deleteBtn) {
        await handleDelete(
          playerAPI.delete,
          deleteBtn.dataset.playerid,
          deleteBtn.closest("div"),
          "Jogador eliminado com sucesso.",
          "Falha ao eliminar o jogador.",
        );
      }
    });
  }

  // LIST TEAMS
  const teamsList = document.getElementById("teamsList");
  if (teamsList) {
    await loadAndRenderTeams(teamsList);

    teamsList.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".editTeamBtn");
      if (editBtn) {
        window.location.href = `/Pages/admin/editTeam.html?team=${editBtn.dataset.teamid}`;
        return;
      }

      const deleteBtn = e.target.closest(".deleteTeamBtn");
      if (deleteBtn) {
        await handleDelete(
          teamAPI.delete,
          deleteBtn.dataset.teamid,
          deleteBtn.closest("li"),
          "Equipa eliminada com sucesso.",
          "Falha ao eliminar a equipa.",
        );
      }
    });
  }

  // LIST GAMES
  const gamesList = document.getElementById("gamesList");
  if (gamesList) {
    await loadAndRenderGames(gamesList);

    gamesList.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".editGameBtn");
      if (editBtn) {
        window.location.href = `/Pages/admin/editGame.html?game=${editBtn.dataset.gameid}`;
        return;
      }

      const deleteBtn = e.target.closest(".deleteGameBtn");
      if (deleteBtn) {
        await handleDelete(
          gameAPI.delete,
          deleteBtn.dataset.gameid,
          deleteBtn.closest("li"),
          "Jogo eliminado com sucesso.",
          "Falha ao eliminar o jogo.",
        );
      }
    });
  }

  // LIST EVENTS
  const eventsList = document.getElementById("eventsList");
  if (eventsList) {
    await loadAndRenderEvents(eventsList);

    eventsList.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".editEventBtn");
      if (editBtn) {
        window.location.href = `/Pages/admin/editEvent.html?event=${editBtn.dataset.eventid}`;
        return;
      }

      const deleteBtn = e.target.closest(".deleteEventBtn");
      if (deleteBtn) {
        await handleDelete(
          eventAPI.delete,
          deleteBtn.dataset.eventid,
          deleteBtn.closest("li"),
          "Evento eliminado com sucesso.",
          "Falha ao eliminar o evento.",
        );
      }
    });
  }

  // Page-specific initial loads
  if (path.endsWith("/Pages/admin/editPlayer.html")) {
    const playerId = new URLSearchParams(window.location.search).get("player");
    if (playerId) await loadPlayerForEdit(playerId);
  }

  if (path.endsWith("/Pages/admin/editTeam.html")) {
    const teamId = new URLSearchParams(window.location.search).get("team");
    if (teamId) await loadTeamForEdit(teamId);
  }

  if (path.endsWith("/Pages/admin/addPlayer.html")) {
    const teamDropdown = document.getElementById("teamsDropdown");
    if (teamDropdown) await loadTeamsDropdown(teamDropdown);
  }

  if (path.endsWith("/Pages/admin/gameMaster.html")) {
    const gameId = new URLSearchParams(window.location.search).get("game");
    if (gameId) await loadGameForEdit(gameId);

    const gamesDropdown = document.getElementById("gamesDropdown");
    const playersA = document.getElementById("playersA");
    const playersB = document.getElementById("playersB");
    const gameEventsList = document.getElementById("gameEventsList");
    const startGameBtn = document.getElementById("startGameBtn");
    const endGameBtn = document.getElementById("endGameBtn");
    const imgA = document.getElementById("imgTeamA");
    const imgB = document.getElementById("imgTeamB");
    const scoreA = document.getElementById("scoreTeamA");
    const scoreB = document.getElementById("scoreTeamB");
    const statusEl = document.getElementById("status");

    if (gamesDropdown) await loadGamesDropdown(gamesDropdown);
    gamesDropdown.addEventListener("change", async () => {
      const game = await gameAPI.getById(gamesDropdown.value);
      if (!game) return console.error("Jogo não encontrado!");

      startGameBtn.addEventListener("click", async () => {
        if (!game) return alert("Escolha um jogo!");
        try {
          await gameAPI.update(game._id, { status: "in_progress" });
          window.location.reload();
          alert("Jogo iniciado!");
        } catch (err) {
          console.error("Erro ao iniciar jogo:", err);
        }
      });

      endGameBtn.addEventListener("click", async () => {
        if (!game) return alert("Escolha um jogo!");
        try {
          await gameAPI.update(game._id, { status: "completed" });
          alert("Jogo finalizado!");
        } catch (err) {
          console.error("Erro ao finalizar jogo:", err);
        }
      });

      const teams = game.teams;
      if (!Array.isArray(teams) || teams.length < 2) {
        return console.error("Jogo inválido: equipas insuficientes.");
      }
      const teamA = await teamAPI.getById(teams[0]._id);
      const teamB = await teamAPI.getById(teams[1]._id);

      imgA.src = `${teamA.image}`;
      imgB.src = `${teamB.image}`;
      scoreA.innerHTML = `${game.result.homeScore}`;
      scoreB.innerHTML = `${game.result.awayScore}`;
      statusEl.innerHTML = `${game.status}`;
      await loadPlayers(teams[0]._id, playersA);
      await loadPlayers(teams[1]._id, playersB);
      await loadEvents(game._id, gameEventsList);
    });
  }
});

// Redirect to login for admin pages
const adminPages = [
  "/Pages/admin/editPlayer.html",
  "/Pages/admin/editTeam.html",
  "/Pages/admin/listPlayers.html",
  "/Pages/admin/listTeams.html",
  "/Pages/admin/addPlayer.html",
  "/Pages/admin/addGame.html",
  "/Pages/admin/addTeam.html",
  "/Pages/admin/listEvents.html",
  "/Pages/admin/listGames.html",
  "/Pages/admin/addEvent.html",
  "/Pages/admin/editEvent.html",
  "/Pages/admin/editGame.html",
  "/Pages/admin/home.html",
];
if (adminPages.some((page) => path.endsWith(page))) {
  protectPagesAdmin();
}
if (path.endsWith("/Pages/admin/gameMaster.html")) {
  protectPage();
}