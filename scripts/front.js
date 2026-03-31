import {
  fixturesAPI,
  standingsAPI,
  teamAPI,
  gameAPI,
  playerAPI,
  eventAPI,
} from "./api.js";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return value._id ? value._id.toString() : value.toString();
  }
  return value.toString();
};

const formatEventType = (type) => {
  if (!type) return "";
  const map = {
    golo: "⚽",
    autogolo: "🥅",
    "cartao amarelo": "🟨",
    "cartao vermelho": "🟥",
  };
  const key = type.toString().toLowerCase();
  return (
    map[key] ||
    `${type.toString().charAt(0).toUpperCase()}${type.toString().slice(1)}`
  );
};

const getPlayerName = async (player) => {
  try {
    const playerData = await playerAPI.getById(player);
    return playerData?.name || "";
  } catch {
    return "";
  }
};

const renderMatchEvents = async (events, team) => {
  const eventStrings = await Promise.all(
    (events || [])
      .filter((e) => normalizeId(e.team) === normalizeId(team))
      .map(async (e) => {
        const playerName = await getPlayerName(e.player);
        return `${formatEventType(e.type)}-${playerName}-${e.time || ""}'`.trim();
      }),
  );

  const filtered = eventStrings.filter(Boolean);
  return filtered.length ? filtered.join(", ") : "Nenhum evento";
};

const buildFixtureHtml = async (game) => {
  const team0Events = await renderMatchEvents(game.events, game.teams[0]);
  const team1Events = await renderMatchEvents(game.events, game.teams[1]);

  return `<div class="fixture expandable" onclick="toggleFixture(this)">
                <div class="fixture-main">
                    <span class="teamresult-left">${game.teams[0]?.name || "A definir"}</span>
                    <img src="${game.teams[0]?.image || ""}" class="teamresult-logo">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                      <span class="timeresult">${game.result.homeScore} <strong>-</strong> ${game.result.awayScore}</span>
                      <span style="" >${formatTime(game.date)}</span>
                    </div>
                    <img src="${game.teams[1]?.image || ""}" class="teamresult-logo">
                    <span class="teamresult-right">${game.teams[1]?.name || "A definir"}</span> <span class="expand-hint">Clique para ver
                        detalhes</span>
                </div>

                <!-- Hidden expandable content -->
                <div class="fixture-details">
                    <div class="goals">
                        <h4>⚽Eventos</h4>
                        <p><strong>${game.teams[0]?.name || "A definir"}:</strong> ${team0Events}</p>
                        <p><strong>${game.teams[1]?.name || "A definir"}:</strong> ${team1Events}</p>
                    </div>

                    <div class="motm">
                        <h4>🏆 Man of the Match</h4>
                        <img src="${game.mvp?.image || ""}" alt="Man of the Match">
                        <p>${game.mvp?.name || ""}</p>
                        <p>${game.mvp?.team.name || ""}</p>
                    </div>
                </div>
            </div>`;
};

const renderFixturesByDate = async (games, dateString) => {
  const fixtures = await Promise.all(
    games
      .filter(
        (game) =>
          new Date(game.date).toDateString() ===
          new Date(dateString).toDateString(),
      )
      .map(async (game) => await buildFixtureHtml(game)),
  );
  return fixtures.join("");
};

const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "4-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.endsWith("/jogos.html")) {
    const data = await gameAPI.getAll();
    const games = data?.games ?? [];
    const htmlDia1 = await renderFixturesByDate(games, "02-04-2026");
    const htmlDia2 = await renderFixturesByDate(games, "03-04-2026");
    const htmlDia3 = await renderFixturesByDate(games, "04-04-2026");
    document.getElementById("dia1").innerHTML = htmlDia1;
    document.getElementById("dia2").innerHTML = htmlDia2;
    document.getElementById("dia3").innerHTML = htmlDia3;
  }
  if (window.location.pathname.endsWith("/classif.html")) {
    const data = await standingsAPI.getAll();
    const dataGroups = await standingsAPI.getByGroup();
    let pos = 1;

    const htmlGroups = Object.entries(dataGroups || {})
      .sort()
      .map(([groupName, teams]) => {
        const groupHtml = `
        <div id="groupStandings" class="group">
            <h2>Group ${groupName}</h2>
                    <table class="group-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Team</th>
                                <th>GP</th>
                                <th>W</th>
                                <th>D</th>
                                <th>L</th>
                                <th>GF</th>
                                <th>GA</th>
                                <th>GD</th>
                                <th>YC</th>
                                <th>RC</th>
                                <th>PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${teams
                          .map((team) => {
                            return `
                            <tr>
                                <td>${pos++}</td>
                                <td class="teamtable"><img src="${team.logo}" alt="${team.team}">${team.team}</td>
                                <td>${team.played}</td>
                                <td>${team.wins}</td>
                                <td>${team.draws}</td>
                                <td>${team.losses}</td>
                                <td>${team.goalsFor}</td>
                                <td>${team.goalsAgainst}</td>
                                <td>${team.goalDifference}</td>
                                <td>${team.yellowCards}</td>
                                <td>${team.redCards}</td>
                                <td>${team.points}</td>
                            </tr>`;
                          })
                          .join("")}
                        </tbody>
                    </table>
                    </div>`;
        return groupHtml;
      })
      .join("");
    document.getElementById("group").innerHTML = htmlGroups;
    pos = 1;
    const html = data
      .map((classif) => {
        return `<tr>
                        <td>${pos++}</td>
                        <td class="teamtable"><img src="${classif.logo}" alt="${classif.team}">${classif.team}</td>
                        <td>${classif.played}</td>
                        <td>${classif.wins}</td>
                        <td>${classif.draws}</td>
                        <td>${classif.losses}</td>
                        <td>${classif.goalsFor}</td>
                        <td>${classif.goalsAgainst}</td>
                        <td>${classif.goalDifference}</td>
                        <td>${classif.yellowCards}</td>
                        <td>${classif.redCards}</td>
                        <td>${classif.points}</td>
                    </tr>`;
      })
      .join("");
    document.getElementById("standingList").innerHTML = html;

    const finalData = await gameAPI.getAll();
    const finalGames = (finalData?.games || [])
      .filter((game) => game.n_jogo >= 41)
      .sort((a, b) => a.n_jogo - b.n_jogo);

    const finalHtml = finalGames
      .map((game) => {
        const homeName = game.teams[0]?.name || "A definir";
        const awayName = game.teams[1]?.name || "A definir";
        const homeScore = game.result?.homeScore ?? "";
        const awayScore = game.result?.awayScore ?? "";
        return `<div class="final-game">
                        <span class="final-game-number">J${game.n_jogo}</span>
                        <span class="final-game-teams">${homeName} vs ${awayName}</span>
                        <span class="final-game-score">${homeScore} - ${awayScore}</span>
                        <span class="final-game-status">${game.status || "scheduled"}</span>
                    </div>`;
      })
      .join("");

    document.getElementById("finalStageList").innerHTML =
      finalHtml || "<p>Nenhum jogo de fase final encontrado.</p>";
  }
  if (window.location.pathname.endsWith("/index.html")) {
    const dataGames = await gameAPI.getAll();
    const games = dataGames?.games ?? [];
    const dataTeams = await teamAPI.getAll();
    const teams = dataTeams?.teams ?? [];
    const htmlResults = games
      .map((game) => {
        return `
        `;
      })
      .join("");

    const htmlTeams = teams
      .map((team) => {
        return `
    <div class="hover-container">
      <a href="https://www.fcfamalicao.pt">
        <img src="${team.image}" alt="Image" class="container-image">
        <span class="container-text">${team.name}</span>
        <i class="fa fa-arrow-right"></i>
      </a>
    </div>
  `;
      })
      .join("");

    document.getElementById("teamsMainPage").innerHTML = htmlTeams;
    document.getElementById("teamsMainPage").innerHTML = htmlResults;
  }
});
