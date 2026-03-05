const BASE_URL = "https://liyc-1zn5.onrender.com/api";

async function fetchAPI(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (data) => fetchAPI("/auth/login", "POST", data),
  register: (data) => fetchAPI("/auth/register", "POST", data),
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

const formAddTeam = document.getElementById("addTeamForm");

if (formAddTeam) {
  formAddTeam.addEventListener("submit", async (e) => {
    e.preventDefault();
    const upload = await uploadToCpanel(formAddTeam.teamImage.files[0]);
    const teamData = {
      name: formAddTeam.teamName.value,
      country: formAddTeam.teamCountry.value,
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

document.addEventListener("DOMContentLoaded", async () => {
  const path = window.location.pathname;

  if (path.endsWith("/Pages/admin/editPlayer.html")) {
    try {
      const params = new URLSearchParams(window.location.search);
      const teamId = params.get("team"); // preferível: passar team e player
      const playerId = params.get("player");

      let player = null;

      if (teamId && playerId) {
        // Via equipa -> procurar jogador na lista
        const team = await teamAPI.getById(teamId);
        if (!team || !Array.isArray(team.players)) {
          throw new Error("Equipa inválida ou sem lista de jogadores.");
        }
        player = team.players.find((p) => p._id === playerId);
      } else if (playerId) {
        // Se tiveres endpoint direto
        player = await playerAPI.getById(playerId);
      } else {
        throw new Error(
          "Parâmetros em falta. Esperava ?team=...&player=... ou ?player=...",
        );
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

  if (path.endsWith("/Pages/admin/listTeams.html")) {
    const teamList = document.getElementById("teamList");
    if (!teamList) return;

    async function loadAndRenderTeams() {
      try {
        const data = await teamAPI.getAll();
        const teams = data?.teams ?? [];

        const html = teams
          .map(
            (team) => `
          <li>
            ${team.name} (${team.country})
            <div>
              <button class="editTeamBtn" data-teamid="${team._id}">Editar Equipa</button>
              <button class="deleteTeamBtn" data-teamid="${team._id}">Eliminar Equipa</button>
            </div>
            <button class="addPlayerBtn" data-teamid="${team._id}">Adicionar Jogador</button>
            <ul>
              ${(team.players ?? [])
                .map(
                  (player) => `
                <li id="${player._id}">
                  ${player.number} - ${player.name} - ${player.position}
                  <div>
                    <button class="editPlayerBtn" data-playerid="${player._id}">Editar Jogador</button>
                    <button class="deletePlayerBtn" data-playerid="${player._id}">Eliminar Jogador</button>
                  </div>
                </li>
              `,
                )
                .join("")}
            </ul>
          </li>
        `,
          )
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
          const li = deleteTeamBtn.closest("li[data-teamid]");
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

      // EDIT PLAYER (passar team e player no URL)
      const editPlayerBtn = e.target.closest(".editPlayerBtn");
      if (editPlayerBtn) {
        const playerId = editPlayerBtn.dataset.playerid;
        window.location.href = `/Pages/admin/editPlayer.html?player=${playerId}`;
        return;
      }

      // DELETE PLAYER (se precisares no futuro)
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
          const li = deletePlayerBtn.closest("li");
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
});
