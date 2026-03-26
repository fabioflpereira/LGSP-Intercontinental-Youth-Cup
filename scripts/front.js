import {
  fixturesAPI,
  standingsAPI,
  teamAPI,
  gameAPI,
  playerAPI,
  eventAPI,
} from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.endsWith("/jogos.html")) {
    const data = await gameAPI.getAll();
    const games = data?.games ?? [];
    const html = games
      .map((game) => {
        return `<div class="fixture expandable" onclick="toggleFixture(this)">
                <div class="fixture-main">
                    <span class="teamresult-left">${game.teams[0].name}</span>
                    <img src="${game.teams[0].image}" class="teamresult-logo">
                    <span class="timeresult">${game.result.homeScore} <strong>vs</strong> ${game.result.awayScore}</span>
                    <img src="${game.teams[1].image}" class="teamresult-logo">
                    <span class="teamresult-right">${game.teams[1].name}</span> <span class="expand-hint">Clique para ver
                        detalhes</span>
                </div>

                <!-- Hidden expandable content -->
                <div class="fixture-details">
                    <div class="goals">
                        <h4>⚽Eventos</h4>
                        <p><strong>${game.teams[0].name}:</strong>${game.events
                          .filter((e) => e.team === game.teams[0]._id)
                          .map((e) => `${e.type} ${e.time} ${e.player}`)
                          .join(", ")}
                            </p>
                        <p><strong>${game.teams[1].name}:</strong>${game.events
                          .filter((e) => e.team === game.teams[1]._id)
                          .map((e) => `${e.type} ${e.time} ${e.player}`)
                          .join(", ")}
                            </p>
                    </div>

                    <div class="motm">
                        <h4>🏆 Man of the Match</h4>
                        <img src="${game.mvp?.image || ""}" alt="Man of the Match">
                        <p>${game.mvp?.name || ""}</p>
                    </div>
                </div>
            </div>`;
      })
      .join("");
    document.getElementById("dia1").innerHTML = html;
  }
  if (window.location.pathname.endsWith("/classif.html")) {
    const data = await standingsAPI.getLive();
    let pos = 1;
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
  }
});
