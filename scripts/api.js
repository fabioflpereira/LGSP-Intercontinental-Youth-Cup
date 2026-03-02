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

document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const result = await sendContactForm({
    name: `${e.target.name.value} ${e.target.surname.value}`,
    email: e.target.email.value,
    subject: `FIFA Card Submission: ${e.target.team.value} - ${e.target.playerPosition.value}`,
    message: `Team: ${e.target.team.value}\nNationality: ${e.target.nationality.value}\nPosition: ${e.target.playerPosition.value}\nPace: ${e.target.pacePoints.value}\nShooting: ${e.target.shootingPoints.value}\nPassing: ${e.target.passingPoints.value}\nDribbling: ${e.target.dribblingPoints.value}\nDefence: ${e.target.defencePoints.value}\nPhysical: ${e.target.physicalPoints.value}`,
  });

  if (result.success) {
    alert("Mensagem enviada com sucesso!");
  } else {
    alert("Erro ao enviar: " + (result.message || ""));
  }
});

const form = document.getElementById("addTeamForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const upload = await uploadToCpanel(form.teamImage.files[0]);
  console.log("image:", upload);
  const teamData = {
    name: form.teamName.value,
    country: form.teamCountry.value,
    image: upload.url,
  };
  console.log("Form data:", teamData);
  if (!teamData) return console.log("Form data is empty or invalid.");
  teamAPI
    .create(teamData)
    .then((response) => {
      console.log("Team added successfully:", response);
    })
    .catch((error) => {
      console.error("Error adding team:", error);
    });
});
