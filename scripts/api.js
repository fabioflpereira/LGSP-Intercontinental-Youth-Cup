const BASE_URL = "https://liyc-1zn5.onrender.com/api";

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

  const token = localStorage.getItem("refreshToken");
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
  return !!getAuthToken();
}

export function isAdmin() {
  const user = getCurrentUser();
  return user?.role === "admin";
}

export function protectAdminPage() {
  if (!isAuthenticated()) {
    window.location.href = "/Pages/admin/login.html";
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
  getAll: () => fetchAPI("/fixtures", "GET"),
  getById: (id) => fetchAPI(`/fixtures/${id}`, "GET"),
  create: (data) => fetchAPI("/fixtures", "POST", data),
  update: (id, data) => fetchAPI(`/fixtures/${id}`, "PUT", data),
  delete: (id) => fetchAPI(`/fixtures/${id}`, "DELETE"),
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
  getById: (id) => fetchAPI(`/standings/${id}`, "GET"),
  create: (data) => fetchAPI("/standings", "POST", data),
  update: (id, data) => fetchAPI(`/standings/${id}`, "PUT", data),
  delete: (id) => fetchAPI(`/standings/${id}`, "DELETE"),
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

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

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
      if (!teamData) return console.log("Form data is empty or invalid.");
      teamAPI
        .create(teamData)
        .then((response) => {
          window.location.reload();
          alert("Equipa adicionada com sucesso!");
          console.log("Team added successfully:", response);
        })
        .catch((error) => {
          console.error("Error adding team:", error);
        });
    });
  }

  // Add Player Form
  const formAddPlayer = document.getElementById("addPlayerForm");
  if (formAddPlayer) {
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
      if (!playerData) return console.log("Form data is empty or invalid.");
      playerAPI
        .create(playerData)
        .then((response) => {
          window.location.reload();
          alert("Jogador adicionado com sucesso!");
          console.log("Player added successfully:", response);
        })
        .catch((error) => {
          console.error("Error adding player:", error);
        });
    });
  }

  // Edit Team Form
  const formEditTeam = document.getElementById("editTeamForm");
  if (formEditTeam) {
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get("team");
    formEditTeam.addEventListener("submit", async (e) => {
      e.preventDefault();
      const upload = await uploadToCpanel(formEditTeam.teamImage.files[0]);
      const teamData = {
        name: formEditTeam.teamName.value,
        country: formEditTeam.teamCountry.value,
        group: formEditTeam.teamGroup.value,
        image: upload.url,
      };
      if (!teamData) return console.log("Form data is empty or invalid.");
      teamAPI
        .update(teamId, teamData)
        .then((response) => {
          window.location.reload();
          alert("Equipa editada com sucesso!");
          console.log("Team edited successfully:", response);
        })
        .catch((error) => {
          console.error("Error editing team:", error);
        });
    });
  }

  //redirect to login
  const adminPages = [
    "/Pages/admin/editPlayer.html",
    "/Pages/admin/editTeam.html",
    "/Pages/admin/listPlayers.html",
    "/Pages/admin/listTeams.html",
    "/Pages/admin/addPlayer.html",
    "/Pages/admin/addTeam.html",
    "/Pages/admin/homeAdmin.html",
  ];
  if (adminPages.some((page) => path.endsWith(page))) {
    protectAdminPage();
  }

  // Logout Button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      logoutBtn.textContent = "Login out...";
      const refreshToken = localStorage.getItem("refreshToken");

      try {
        const response = await authAPI.logout(refreshToken);
        console.log("Logout response:", response);

        if (response) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          alert("Login realizado com sucesso! Redirecionando...");

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

  if (path.endsWith("/Pages/admin/login.html")) {
    if (localStorage.getItem("refreshToken")) {
      window.location.href = "/Pages/admin/homeAdmin.html";
    }

    const loginForm = document.getElementById("loginForm");
    const loginBtn = document.getElementById("loginBtn");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginBtn.disabled = true;
      loginBtn.textContent = "A autenticar...";

      try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await authAPI.login({ email, password });

        if (response && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
          alert("Login realizado com sucesso! Redirecionando...");

          setTimeout(() => {
            window.location.href = "/Pages/admin/homeAdmin.html";
          }, 1000);
        } else {
          alert("Falha no login. Verifique as suas credenciais.");
          loginBtn.disabled = false;
          loginBtn.textContent = "Entrar";
        }
      } catch (error) {
        console.error("Login error:", error);
        alert(error.message || "Erro ao fazer login. Tente novamente.");
        loginBtn.disabled = false;
        loginBtn.textContent = "Entrar";
      }
    });
  }

  if (path.endsWith("/Pages/admin/editPlayer.html")) {
    try {
      const params = new URLSearchParams(window.location.search);
      const playerId = params.get("player");

      let player = null;

      if (playerId) {
        player = await playerAPI.getById(playerId);
      } else {
        throw new Error("Parâmetros em falta. Esperava ?player=...");
      }

      if (!player) throw new Error("Jogador não encontrado.");

      document.getElementById("playerName").value = player.name ?? "";
      document.getElementById("playerNumber").value = player.number ?? "";
      document.getElementById("playerPosition").value = player.position ?? "";
    } catch (err) {
      console.error("Erro ao carregar jogador:", err);
      alert("Não foi possível carregar os dados do jogador.");
    }
  }

  if (path.endsWith("/Pages/admin/editTeam.html")) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const teamId = urlParams.get("team");
      if (!teamId) throw new Error("Parâmetro 'id' em falta no URL.");

      const team = await teamAPI.getById(teamId);
      console.log("Team data:", team);

      document.getElementById("teamName").value = team.name ?? "";
      document.getElementById("teamCountry").value = team.country ?? "";

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

  if (path.endsWith("/Pages/admin/addPlayer.html")) {
    const teamDropdown = document.getElementById("teamsDropdown");
    if (!teamDropdown) return console.log("erro");

    try {
      const data = await teamAPI.getAll();
      const teams = data?.teams ?? [];
      teamDropdown.innerHTML =
        `<option value="">Selecione uma equipa</option>` +
        teams
          .map((team) => `<option value="${team._id}">${team.name}</option>`)
          .join("");
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Não foi possível carregar as equipas.");
    }
  }

  if (path.endsWith("/Pages/admin/listPlayers.html")) {
    const teamDropdown = document.getElementById("teamsDropdown");
    const playersList = document.getElementById("playersList");
    if (!teamDropdown || !playersList) return;

    const userIsAdmin = isAdmin();

    try {
      const data = await teamAPI.getAll();
      const teams = data?.teams ?? [];
      teamDropdown.innerHTML =
        `<option value="">Selecione uma equipa</option>` +
        teams
          .map((team) => `<option value="${team._id}">${team.name}</option>`)
          .join("");
      teamDropdown.addEventListener("change", async () => {
        const selectedTeamId = teamDropdown.value;
        if (!selectedTeamId) {
          playersList.innerHTML = "";
          return;
        }
        try {
          const teamData = await teamAPI.getById(selectedTeamId);
          const players = teamData.players ?? [];
          playersList.innerHTML = players
            .map((player) => {
              const deleteButton = userIsAdmin
                ? `<button class="deletePlayerBtn" data-playerid="${player._id}"><i class="fa-solid fa-trash"></i></button>`
                : "";
              return `<div>${player.number} - ${player.name} - ${player.position} <button class="editPlayerBtn" data-playerid="${player._id}"><i class="fa-regular fa-pen-to-square"></i></button> ${deleteButton}</div>`;
            })
            .join("");
        } catch (err) {
          console.error("Error fetching team players:", err);
          alert(
            "Não foi possível carregar os jogadores da equipa selecionada.",
          );
        }
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
      alert("Não foi possível carregar as equipas.");
    }

    playersList.addEventListener("click", async (e) => {
      // EDIT PLAYER
      const editPlayerBtn = e.target.closest(".editPlayerBtn");
      if (editPlayerBtn) {
        const playerId = editPlayerBtn.dataset.playerid;
        window.location.href = `/Pages/admin/editPlayer.html?player=${playerId}`;
        return;
      }

      // DELETE PLAYER
      const deletePlayerBtn = e.target.closest(".deletePlayerBtn");
      if (deletePlayerBtn) {
        const playerId = deletePlayerBtn.dataset.playerid;
        if (!playerId) return;
        if (!confirm("Tem certeza que deseja eliminar este jogador?")) return;
        deletePlayerBtn.disabled = true;
        const originalText = deletePlayerBtn.textContent;
        deletePlayerBtn.textContent = "A eliminar...";
        try {
          await playerAPI.delete(playerId);
          alert("Jogador eliminado com sucesso.");
          const li = deletePlayerBtn.closest("div");
          if (li) li.remove();
        } catch (err) {
          console.error("Error deleting player:", err);
          alert("Falha ao eliminar o jogador.");
        } finally {
          deletePlayerBtn.disabled = false;
          deletePlayerBtn.textContent = originalText;
        }
      }
    });
  }

  if (path.endsWith("/Pages/admin/listTeams.html")) {
    const teamList = document.getElementById("teamsList");
    if (!teamList) return;

    const userIsAdmin = isAdmin();

    async function loadAndRenderTeams() {
      try {
        const data = await teamAPI.getAll();
        const teams = data?.teams ?? [];

        if (!userIsAdmin) {
          document.getElementById("addTeamBtn").style.display = "none";
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
            <img src="${team.image}" alt="Imagem não disponivel"/>
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

        teamList.innerHTML = html;
      } catch (error) {
        console.error("Error fetching teams:", error);
        alert("Não foi possível carregar as equipas.");
      }
    }

    await loadAndRenderTeams();

    teamList.addEventListener("click", async (e) => {
      // EDIT TEAM
      const editTeamBtn = e.target.closest(".editTeamBtn");
      if (editTeamBtn) {
        const teamId = editTeamBtn.dataset.teamid;
        window.location.href = `/Pages/admin/editTeam.html?team=${teamId}`;
        return;
      }

      // DELETE TEAM
      const deleteTeamBtn = e.target.closest(".deleteTeamBtn");
      if (deleteTeamBtn) {
        const teamId = deleteTeamBtn.dataset.teamid;
        if (!teamId) return;

        if (!confirm("Tem certeza que deseja eliminar esta equipa?")) return;

        deleteTeamBtn.disabled = true;
        const originalText = deleteTeamBtn.textContent;
        deleteTeamBtn.textContent = "A eliminar...";

        try {
          await teamAPI.delete(teamId);
          alert("Equipa eliminada com sucesso.");
          const li = deleteTeamBtn.closest("li");
          if (li) li.remove();
        } catch (err) {
          console.error("Error deleting team:", err);
          alert("Falha ao eliminar a equipa.");
        } finally {
          deleteTeamBtn.disabled = false;
          deleteTeamBtn.textContent = originalText;
        }
        return;
      }
    });
  }
});
