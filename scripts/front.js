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

const getTeamData = async (team) => {
  try {
    const teamData = await teamAPI.getById(team);
    return teamData || [];
  } catch {
    return [];
  }
};

const normalizeDate = (d) => {
  const [day, month, year] = d.split("-");
  return `${year}-${month}-${day}`;
};

const renderMatchEvents = async (events, team, idioma) => {
  const eventStrings = await Promise.all(
    (events || [])
      .filter((e) => normalizeId(e.team) === normalizeId(team))
      .map(async (e) => {
        const playerName = await getPlayerName(e.player);
        return `${formatEventType(e.type)}-${playerName}-${e.time || ""}'`.trim();
      }),
  );
  let text;
  if (idioma == "PT") text = `Nenhum evento`;
  if (idioma == "EN") text = `No events`;

  const filtered = eventStrings.filter(Boolean);
  return filtered.length ? filtered.join(", ") : text;
};

const buildFixtureHtml = async (game, idioma) => {
  const team0Events = await renderMatchEvents(
    game.events,
    game.teams[0],
    idioma,
  );
  const team1Events = await renderMatchEvents(
    game.events,
    game.teams[1],
    idioma,
  );
  if (idioma == "PT")
    return `<div class="fixture expandable" onclick="toggleFixture(this)">
                <div class="fixture-main">
                    <span class="teamresult-left">${game.teams[0]?.name || "A definir"}</span>
                    <img src="${game.teams[0]?.image || ""}" class="teamresult-logo">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                      <span style="" >J${game.n_jogo}</span>
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
                        <h4>Eventos</h4>
                        <p><strong>${game.teams[0]?.name || "A definir"}:</strong> ${team0Events}</p>
                        <p><strong>${game.teams[1]?.name || "A definir"}:</strong> ${team1Events}</p>
                    </div>

                    <div class="motm">
                        <h4>🏆 Homem do Jogo</h4>
                        <img src="${game.mvp?.image || ""}" alt="Homem do Jogo">
                        <p>${game.mvp?.name || ""}</p>
                        <p>${game.mvp?.team.name || ""}</p>
                    </div>
                </div>
            </div>`;
  else if (idioma === "EN")
    return `<div class="fixture expandable" onclick="toggleFixture(this)">
                <div class="fixture-main">
                    <span class="teamresult-left">${game.teams[0]?.name || "To Be Defined"}</span>
                    <img src="${game.teams[0]?.image || ""}" class="teamresult-logo">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                      <span style="" >G${game.n_jogo}</span>
                      <span class="timeresult">${game.result.homeScore} <strong>-</strong> ${game.result.awayScore}</span>
                      <span style="" >${formatTime(game.date)}</span>
                    </div>
                    <img src="${game.teams[1]?.image || ""}" class="teamresult-logo">
                    <span class="teamresult-right">${game.teams[1]?.name || "To Be Defined"}</span> <span class="expand-hint">Click to see more details</span>
                </div>

                <!-- Hidden expandable content -->
                <div class="fixture-details">
                    <div class="goals">
                        <h4>Events</h4>
                        <p><strong>${game.teams[0]?.name || "To Be Defined"}:</strong> ${team0Events}</p>
                        <p><strong>${game.teams[1]?.name || "To Be Defined"}:</strong> ${team1Events}</p>
                    </div>

                    <div class="motm">
                        <h4>🏆 Man of the Match</h4>
                        <img src="${game.mvp?.team?.image || ""}" alt="Man of  Match">
                        <p>${game.mvp?.name || ""}</p>
                        <p>${game.mvp?.team.name || ""}</p>
                    </div>
                </div>
            </div>`;
};

const renderFixturesByDate = async (games, dateString, idioma) => {
  const target = new Date(normalizeDate(dateString)).toDateString();

  const fixtures = await Promise.all(
    games
      .filter((game) => new Date(game.date).toDateString() === target)
      .map(async (game) => await buildFixtureHtml(game, idioma)),
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

const formatTime = (dateStr) => {
  return dateStr.substring(11, 16);
};

const linkEquipas = [
  { equipa: "FC Famalicão", link: "https://www.fcfamalicao.pt" },
  { equipa: "FC Porto", link: "https://www.fcporto.pt/pt" },
  { equipa: "FC Twente", link: "https://fctwente.nl" },
  { equipa: "FC Vizela", link: "https://fcvizela.pt" },
  { equipa: "Gondomar SC", link: "https://gondomarsportclube.pt" },
  { equipa: "Hong Kong FC", link: "https://www.hkfc.com" },
  { equipa: "Kalamata FC", link: "" },
  { equipa: "Lion City Sailors FC", link: "https://www.lioncitysailorsfc.sg" },
  { equipa: "Liverpool FC", link: "https://www.liverpoolfc.com" },
  { equipa: "RC Deportivo La Coruña", link: "https://www.rcdeportivo.es" },
  { equipa: "SC Beira-Mar", link: "https://beiramar.pt/home" },
  { equipa: "SC Braga", link: "https://scbraga.pt" },
  { equipa: "SC Rio Tinto", link: "https://sportcluberiotinto.com" },
  { equipa: "Sporting CP", link: "https://www.sporting.pt" },
  { equipa: "SC Salgueiros", link: "https://scsalgueiros.pt" },
  { equipa: "SL Benfica", link: "https://www.slbenfica.pt" },
  { equipa: "Stoke City FC", link: "https://www.stokecityfc.com" },
  { equipa: "UMS Pontault-Combault", link: "https://umspc.footeo.com" },
  { equipa: "Varzim SC", link: "https://varzim.pt" },
  { equipa: "Vitória SC", link: "https://vitoriasc.pt" },
];

function getTeamLink(team) {
  const teamName = typeof team === "string" ? team : team.name;

  const found = linkEquipas.find((t) => t.equipa === teamName);
  return found?.link || "";
}

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.endsWith("/jogos.html")) {
    const data = await gameAPI.getAll();
    const games = data?.games ?? [];
    const htmlDia1 = await renderFixturesByDate(games, "02-04-2026", "PT");
    const htmlDia2 = await renderFixturesByDate(games, "03-04-2026", "PT");
    const htmlDia3 = await renderFixturesByDate(games, "04-04-2026", "PT");
    document.getElementById("dia1").innerHTML = htmlDia1;
    document.getElementById("dia2").innerHTML = htmlDia2;
    document.getElementById("dia3").innerHTML = htmlDia3;
  }
  if (window.location.pathname.endsWith("/jogos_en.html")) {
    const data = await gameAPI.getAll();
    const games = data?.games ?? [];
    const htmlDia1 = await renderFixturesByDate(games, "02-04-2026", "EN");
    const htmlDia2 = await renderFixturesByDate(games, "03-04-2026", "EN");
    const htmlDia3 = await renderFixturesByDate(games, "04-04-2026", "EN");
    document.getElementById("dia1").innerHTML = htmlDia1;
    document.getElementById("dia2").innerHTML = htmlDia2;
    document.getElementById("dia3").innerHTML = htmlDia3;
  }
  if (window.location.pathname.endsWith("/classif.html")) {
    const dataGroups = await standingsAPI.getByGroup();
    let pos = 1;

    const htmlGroups = Object.entries(dataGroups || {})
      .sort()
      .map(([groupName, teams]) => {
        pos = 1;
        const groupHtml = `
        <div id="groupStandings" class="group">
            <h2>Grupo ${groupName}</h2>
                    <table class="group-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Equipa</th>
                                <th>J</th>
                                <th>V</th>
                                <th>E</th>
                                <th>D</th>
                                <th>GM</th>
                                <th>GS</th>
                                <th>DG</th>
                                <th>PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${teams
                          .map((team) => {
                            return `
                            <tr>
                                <td>${pos++}</td>
                                <td class="team"><img src="${team.logo}" alt="${team.team}">${team.team}</td>
                                <td>${team.played}</td>
                                <td>${team.wins}</td>
                                <td>${team.draws}</td>
                                <td>${team.losses}</td>
                                <td>${team.goalsFor}</td>
                                <td>${team.goalsAgainst}</td>
                                <td>${team.goalDifference}</td>
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
    const standingGroupEl = document.getElementById("group");
    standingGroupEl.innerHTML = htmlGroups;

    /* const data = await standingsAPI.getFinal();
    const htmlFinal = data
      .map((classif) => {
        return `<tr>
                        <td>${classif.position}</td>
                        <td class="teamtable"><img src="${classif.team?.logo || ""}" alt="${classif.team?.team || ""}">${classif.team?.team || "A definir"}</td>
                    </tr>`;
      })
      .join("");

    const standingListEl = document.getElementById("standingList");
    if (standingListEl) standingListEl.innerHTML = htmlFinal; */
  }
  if (window.location.pathname.endsWith("/classif_en.html")) {
    const dataGroups = await standingsAPI.getByGroup();
    let pos = 1;

    const htmlGroups = Object.entries(dataGroups || {})
      .sort()
      .map(([groupName, teams]) => {
        pos = 1;
        const groupHtml = `
        <div id="groupStandings" class="group">
            <h2>Group ${groupName}</h2>
                    <table class="group-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Team</th>
                                <th>G</th>
                                <th>W</th>
                                <th>D</th>
                                <th>L</th>
                                <th>GF</th>
                                <th>GA</th>
                                <th>DG</th>
                                <th>PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${teams
                          .map((team) => {
                            return `
                            <tr>
                                <td>${pos++}</td>
                                <td class="team"><img src="${team.logo}" alt="${team.team}">${team.team}</td>
                                <td>${team.played}</td>
                                <td>${team.wins}</td>
                                <td>${team.draws}</td>
                                <td>${team.losses}</td>
                                <td>${team.goalsFor}</td>
                                <td>${team.goalsAgainst}</td>
                                <td>${team.goalDifference}</td>
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
    const standingGroupEl = document.getElementById("group");
    standingGroupEl.innerHTML = htmlGroups;

    /* const data = await standingsAPI.getFinal();
    const htmlFinal = data
      .map((classif) => {
        return `<tr>
                        <td>${classif.position}</td>
                        <td class="teamtable"><img src="${classif.team?.logo || ""}" alt="${classif.team?.team || ""}">${classif.team?.team || "To Be Defined"}</td>
                    </tr>`;
      })
      .join("");

    const standingListEl = document.getElementById("standingList");
    if (standingListEl) standingListEl.innerHTML = htmlFinal; */

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
    const finalStageEl = document.getElementById("finalStageList");
    if (finalStageEl) finalStageEl.innerHTML = finalHtml;
  }
  if (window.location.pathname.endsWith("/index.html")) {
    const dataGames = await gameAPI.getAll();
    const games = dataGames?.games ?? [];
    const dataTeams = await teamAPI.getAll();
    const teams = dataTeams?.teams ?? [];
    const htmlResults = games
      .filter((game) => game.status == "completed")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map((game) => {
        return `
                    <div class="fixture">
                        <span class="team">${game.teams[0]?.name}</span>
                        <img src="${game.teams[0]?.image}" class="team-logo">
                        <span class="time">${game.result?.homeScore}-${game.result?.awayScore}</span>
                        <img src="${game.teams[1]?.image}" class="team-logo">
                        <span class="team">${game.teams[1]?.name}</span>
                    </div>
        `;
      })
      .join("");
    const htmlTeams = teams
      .map((team) => {
        return `
    <div class="hover-container">
      <a href="${getTeamLink(team.name)}">
        <img src="${team.image}" alt="Image" class="container-image">
        <span class="container-text">${team.name}</span>
        <i class="fa fa-arrow-right"></i>
      </a>
    </div>
  `;
      })
      .join("");

    document.getElementById("teamsMainPage").innerHTML = htmlTeams;
    document.getElementById("last10games").innerHTML = htmlResults;
    const mvpData = await playerAPI.getMVP();
    const mvps = mvpData?.mvps ?? [];
    const htmlMVPs = await Promise.all(
      mvps.slice(0, 3).map(async (mvp) => {
        const teamData = await getTeamData(mvp.player.team);
        return `
      <div class="golos-card">
                            <div class="golos-header">
                                <span class="golos-badge">${mvp.player.name}</span>
                            </div>

                            <div class="golos-image-wrapper">
                                <img id="logobackground" src="/images/logobackground.png" alt="">
                                <img src="${teamData.image}" alt="Player" class="golos-image">
                                <div class="golos-number">${mvp.player.number}</div>
                            </div>

                            <div class="golos-list">
                                <div class="golos-item">

                                    <div class="golos-info">
                                        <span class="golos-name">${teamData.name} - ${mvp.player.name}</span>
                                    </div>
                                </div>

                                <div class="golos-item">
                                    <div class="golos-info">
                                        <span class="golos-team">Nº DE MVPs</span>
                                    </div>
                                    <span class="golos-score">${mvp.mvps}</span>
                                </div>


                            </div>
                        </div>
      `;
      }),
    );
    document.getElementById("listMVPs").innerHTML = htmlMVPs.join("");
    const topScorerData = await playerAPI.getScorer();
    const topScorer = topScorerData?.topScorers ?? [];
    const htmlTopScorer = await Promise.all(
      topScorer.slice(0, 3).map(async (topScorer) => {
        const teamData = await getTeamData(topScorer.player.team);
        return `
      <div class="golos-card">
                            <div class="golos-header">
                                <span class="golos-badge">${topScorer.player.name}</span>
                            </div>

                            <div class="golos-image-wrapper">
                                <img id="logobackground" src="/images/logobackground.png" alt="">
                                <img src="${teamData.image}" alt="Player" class="golos-image">
                                <div class="golos-number">${topScorer.player.number}</div>
                            </div>

                            <div class="golos-list">
                                <div class="golos-item">

                                    <div class="golos-info">
                                        <span class="golos-name">${teamData.name} - ${topScorer.player.name}</span>
                                    </div>
                                </div>

                                <div class="golos-item">
                                    <div class="golos-info">
                                        <span class="golos-team">Nº DE GOLOS</span>
                                    </div>
                                    <span class="golos-score">${topScorer.goals}</span>
                                </div>


                            </div>
                        </div>
      `;
      }),
    );
    document.getElementById("listTopGoals").innerHTML = htmlTopScorer.join("");
    /* const dataStandings = await standingsAPI.getFinal();
    const htmlFinal = dataStandings
      .map((classif) => {
        return `<tr>
                        <td>${classif.position}</td>
                        <td class="teamtable"><img src="${classif.team?.logo || ""}" alt="${classif.team?.team || ""}">${classif.team?.team || "A definir"}</td>
                    </tr>`;
      })
      .join("");

    const standingListEl = document.getElementById("standingList");
    if (standingListEl) standingListEl.innerHTML = htmlFinal; */
  }
  if (window.location.pathname.endsWith("/index_en.html")) {
    const dataGames = await gameAPI.getAll();
    const games = dataGames?.games ?? [];
    const dataTeams = await teamAPI.getAll();
    const teams = dataTeams?.teams ?? [];
    const htmlResults = games
      .filter((game) => game.status == "completed")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map((game) => {
        return `
                    <div class="fixture">
                        <span class="team">${game.teams[0]?.name}</span>
                        <img src="${game.teams[0]?.image}" class="team-logo">
                        <span class="time">${game.result?.homeScore}-${game.result?.awayScore}</span>
                        <img src="${game.teams[1]?.image}" class="team-logo">
                        <span class="team">${game.teams[1]?.name}</span>
                    </div>
        `;
      })
      .join("");
    const htmlTeams = teams
      .map((team) => {
        return `
    <div class="hover-container">
      <a href="${getTeamLink(team.name)}">
        <img src="${team.image}" alt="Image" class="container-image">
        <span class="container-text">${team.name}</span>
        <i class="fa fa-arrow-right"></i>
      </a>
    </div>
  `;
      })
      .join("");

    document.getElementById("teamsMainPage").innerHTML = htmlTeams;
    document.getElementById("last10games").innerHTML = htmlResults;
    const mvpData = await playerAPI.getMVP();
    const mvps = mvpData?.mvps ?? [];
    const htmlMVPs = await Promise.all(
      mvps.slice(0, 3).map(async (mvp) => {
        const teamData = await getTeamData(mvp.player.team);
        return `
      <div class="golos-card">
                            <div class="golos-header">
                                <span class="golos-badge">${mvp.player.name}</span>
                            </div>

                            <div class="golos-image-wrapper">
                                <img id="logobackground" src="/images/logobackground.png" alt="">
                                <img src="${teamData.image}" alt="Player" class="golos-image">
                                <div class="golos-number">${mvp.player.number}</div>
                            </div>

                            <div class="golos-list">
                                <div class="golos-item">

                                    <div class="golos-info">
                                        <span class="golos-name">${teamData.name} - ${mvp.player.name}</span>
                                    </div>
                                </div>

                                <div class="golos-item">
                                    <div class="golos-info">
                                        <span class="golos-team">NR OF MVPs</span>
                                    </div>
                                    <span class="golos-score">${mvp.mvps}</span>
                                </div>


                            </div>
                        </div>
      `;
      }),
    );
    document.getElementById("listMVPs").innerHTML = htmlMVPs.join("");
    const topScorerData = await playerAPI.getScorer();
    const topScorer = topScorerData?.topScorers ?? [];
    const htmlTopScorer = await Promise.all(
      topScorer.slice(0, 3).map(async (topScorer) => {
        const teamData = await getTeamData(topScorer.player.team);
        return `
      <div class="golos-card">
                            <div class="golos-header">
                                <span class="golos-badge">${topScorer.player.name}</span>
                            </div>

                            <div class="golos-image-wrapper">
                                <img id="logobackground" src="/images/logobackground.png" alt="">
                                <img src="${teamData.image}" alt="Player" class="golos-image">
                                <div class="golos-number">${topScorer.player.number}</div>
                            </div>

                            <div class="golos-list">
                                <div class="golos-item">

                                    <div class="golos-info">
                                        <span class="golos-name">${teamData.name} - ${topScorer.player.name}</span>
                                    </div>
                                </div>

                                <div class="golos-item">
                                    <div class="golos-info">
                                        <span class="golos-team">NR OF GOALS</span>
                                    </div>
                                    <span class="golos-score">${topScorer.goals}</span>
                                </div>


                            </div>
                        </div>
      `;
      }),
    );
    document.getElementById("listTopGoals").innerHTML = htmlTopScorer.join("");
    /* const dataStandings = await standingsAPI.getFinal();
    const htmlFinal = dataStandings
      .map((classif) => {
        return `<tr>
                        <td>${classif.position}</td>
                        <td class="teamtable"><img src="${classif.team?.logo || ""}" alt="${classif.team?.team || ""}">${classif.team?.team || "Ro Be Defined"}</td>
                    </tr>`;
      })
      .join("");

    const standingListEl = document.getElementById("standingList");
    if (standingListEl) standingListEl.innerHTML = htmlFinal; */
  }
});
