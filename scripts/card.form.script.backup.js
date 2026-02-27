document.getElementById("cardForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const name = encodeURIComponent(document.getElementById("name").value);
    const surname = encodeURIComponent(document.getElementById("surname").value);
    const team = encodeURIComponent(document.getElementById("team").value);
    const nationality = encodeURIComponent(document.getElementById("nationality").value);
    const playerPosition = encodeURIComponent(document.getElementById("playerPosition").value);
    const pacePoints = encodeURIComponent(document.getElementById("pacePoints").value);
    const shootingPoints = encodeURIComponent(document.getElementById("shootingPoints").value);
    const passingPoints = encodeURIComponent(document.getElementById("passingPoints").value);
    const dribblingPoints = encodeURIComponent(document.getElementById("dribblingPoints").value);
    const defencePoints = encodeURIComponent(document.getElementById("defencePoints").value);
    const physicalPoints = encodeURIComponent(document.getElementById("physicalPoints").value);

    const subject = encodeURIComponent(`LIYC Card Form Submission for ${name} ${surname}, ${team}`);

    const body = encodeURIComponent(
        `You have received a new player card request, please see the information below:\n\n` +
        `Player Name: ${name}\n` +
        `Player Surname: ${surname}\n` +
        `Team: ${team}\n` +
        `Nationality: ${nationality}\n` +
        `Player Position: ${playerPosition}\n` +
        `PAC - Pace: ${pacePoints}\n` +
        `SHO - Shooting: ${shootingPoints}\n` +
        `PAS - Passing: ${passingPoints}\n` +
        `DRI - Dribbling: ${dribblingPoints}\n` +
        `DEF - Defending: ${defencePoints}\n` +
        `PHY - Physical: ${physicalPoints}\n\n` +
        `Thank you.`
    );

    window.location.href = `mailto:arnold.luanzambi@dlh.de?subject=${subject}&body=${body}`;
});