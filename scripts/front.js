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
    golo: "Golo",
    autogolo: "Auto-golo",
    "cartao amarelo": "Cartão amarelo",
    "cartao vermelho": "Cartão vermelho",
    falta: "Falta",
    penalty: "Penalty",
  };
  const key = type.toString().toLowerCase();
  return (
    map[key] ||
    `${type.toString().charAt(0).toUpperCase()}${type.toString().slice(1)}`
  );
};

const getPlayerName = (player) => {
  if (!player) return "";
  if (typeof player === "object") return player.name || "";
  return player.toString();
};

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.endsWith("/jogos.html")) {
    const data = await gameAPI.getAll();
    const games = data?.games ?? [];
    const html = games
      .map((game) => {
        return `<div class="fixture expandable" onclick="toggleFixture(this)">
                <div class="fixture-main">
                    <span class="teamresult-left">${game.teams[0]?.name || "TBD"}</span>
                    <img src="${game.teams[0]?.image || ""}" class="teamresult-logo">
                    <span class="timeresult">${game.result.homeScore} <strong>-</strong> ${game.result.awayScore}</span>
                    <img src="${game.teams[1]?.image || ""}" class="teamresult-logo">
                    <span class="teamresult-right">${game.teams[1]?.name || "TBD"}</span> <span class="expand-hint">Clique para ver
                        detalhes</span>
                </div>

                <!-- Hidden expandable content -->
                <div class="fixture-details">
                    <div class="goals">
                        <h4>⚽Eventos</h4>
                        <p><strong>${game.teams[0]?.name || "TBD"}:</strong> ${
                          (game.events || [])
                            .filter(
                              (e) =>
                                normalizeId(e.team) ===
                                normalizeId(game.teams[0]),
                            )
                            .map((e) =>
                              `${formatEventType(e.type)} ${e.time || ""}min ${getPlayerName(e.player)}`.trim(),
                            )
                            .filter(Boolean)
                            .join(", ") || "Nenhum evento"
                        }
                            </p>
                        <p><strong>${game.teams[1]?.name || "TBD"}:</strong> ${
                          (game.events || [])
                            .filter(
                              (e) =>
                                normalizeId(e.team) ===
                                normalizeId(game.teams[1]),
                            )
                            .map((e) =>
                              `${formatEventType(e.type)} ${e.time || ""}min ${getPlayerName(e.player)}`.trim(),
                            )
                            .filter(Boolean)
                            .join(", ") || "Nenhum evento"
                        }
                            </p>
                    </div>

                    <div class="motm">
                        <h4>🏆 Man of the Match</h4>
                        <img src="${game.mvp?.image || ""}" alt="Man of the Match">
                        <p>${game.mvp?.name || ""}</p>
                        <p>${game.mvp?.team.name || ""}</p>
                    </div>
                </div>
            </div>`;
      })
      .join("");
    document.getElementById("dia1").innerHTML = html;
  }
  if (window.location.pathname.endsWith("/classif.html")) {
    const data = await standingsAPI.getAll();
    let pos = 1;

    const htmlGroups = `
            <h2>Group A</h2>
                    <table class="group-table">
                        <thead>
                            <tr>
                                <th>Team</th>
                                <th>GP</th>
                                <th>W</th>
                                <th>D</th>
                                <th>L</th>
                                <th>GD</th>
                                <th>PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="team"><img src="logo1.png" alt="Team A"> Team A</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td class="team"><img src="logo2.png" alt="Team B"> Team B</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td class="team"><img src="logo3.png" alt="Team C"> Team C</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                            <tr>
                                <td class="team"><img src="logo4.png" alt="Team D"> Team D</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                            </tr>
                        </tbody>
                    </table>`;
    const html = data
      .map((classif) => {
        return `<tr>
                        <td>${pos++}</td>
                        <td class="teamtable"><img src="" alt="${classif.team}">${classif.team}</td>
                        <td>${classif.played}</td>
                        <td>${classif.wins}</td>
                        <td>${classif.draws}</td>
                        <td>${classif.losses}</td>
                        <td>${classif.goalDifference}</td>
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
        const homeName = game.teams[0]?.name || "TBD";
        const awayName = game.teams[1]?.name || "TBD";
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
});
