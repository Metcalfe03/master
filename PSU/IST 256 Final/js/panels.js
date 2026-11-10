let panels = [];

const form = document.getElementById("panelForm");
const formMessage = document.getElementById("formMessage");

const speakerInput = document.getElementById("speakerName");
const titleInput = document.getElementById("panelTitle");
const categorySelect = document.getElementById("category");
const roomSelect = document.getElementById("room");
const durationInput = document.getElementById("duration");
const capacityInput = document.getElementById("capacity");
const descriptionInput = document.getElementById("description");

// Fill capacity when room changes
roomSelect.addEventListener("change", function () {
  capacityInput.value = getCapacityFromRoom(roomSelect.value);
});

// Submit panel to backend
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  let speaker = speakerInput.value.trim();
  let title = titleInput.value.trim();
  let category = categorySelect.value.trim();
  let room = roomSelect.value.trim();
  let duration = durationInput.value.trim();
  let description = descriptionInput.value.trim();

  if (!speaker || !title || !category || !room || !duration) {
    showMessage("Please fill in all required fields.", "Error");
    return;
  }

  if (Number(duration) <= 0) {
    showMessage("Duration must be greater than 0.", "Error");
    return;
  }

  let capacity = getCapacityFromRoom(room);

  const panelData = {
    speaker,
    title,
    category,
    room,
    duration: Number(duration),
    capacity: Number(capacity),
    description,
  };

  try {
    const response = await fetch("/api/panels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(panelData),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Failed to submit panel.", "Error");
      return;
    }

    showMessage(
      "Panel submitted successfully, pending staff approval.",
      "success",
    );
    form.reset();
    capacityInput.value = "";
    loadPanels();
  } catch (error) {
    console.error("Error submitting panel:", error);
    showMessage("Server error. Could not submit panel.", "Error");
  }
});

// Determine room capacity
function getCapacityFromRoom(roomValue) {
  if (!roomValue) return "";
  if (roomValue.startsWith("1")) return 30;
  if (roomValue.startsWith("2")) return 48;
  return "";
}

// Load panels (from backend)
async function loadPanels() {
  try {
    const response = await fetch("/api/panels");
    panels = await response.json();
    renderTable();
  } catch (error) {
    console.error("Error loading panels:", error);
    showMessage("Could not load panels.", "Error");
  }
}

// Show message
function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `alert alert-${type} mb-4`;
  formMessage.classList.remove("d-none");
}

// Render table
function renderTable(list = panels) {
  let table = document.getElementById("panelTable");
  table.innerHTML = "";

  list.forEach(function (panel) {
    table.innerHTML += `
      <tr>
        <td>${panel.id}</td>
        <td>${panel.speaker}</td>
        <td>${panel.title}</td>
        <td>${panel.category}</td>
        <td>${panel.room}</td>
        <td>${panel.duration}</td>
        <td>${panel.capacity}</td>
        <td class="text-capitalize">${panel.status || "pending"}</td>
        <td>${panel.moderatorComment || ""}</td>
      </tr>
    `;
  });
}

// Search by speaker or panel ID
$("#searchBtn").click(function () {
  let term = $("#searchSpeaker").val().trim().toLowerCase();

  if (!term) {
    renderTable();
    return;
  }

  let filtered = panels.filter(function (panel) {
    let speakerMatch = (panel.speaker || "").toLowerCase().includes(term);
    let idMatch = (panel.id || "").toLowerCase().includes(term);
    return speakerMatch || idMatch;
  });

  renderTable(filtered);
});

$("#clearSearchBtn").click(function () {
  $("#searchSpeaker").val("");
  renderTable();
});

loadPanels();
