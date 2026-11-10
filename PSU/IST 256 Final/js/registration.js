let editId = null;

const form = document.getElementById("registrationForm");
const table = document.getElementById("attendeeTable");

// Load attendees from server
async function loadAttendees() {
  try {
    const res = await fetch("/api/attendees");
    const attendees = await res.json();
    renderTable(attendees);
  } catch (err) {
    console.error("Failed to load attendees:", err);
    table.innerHTML = `<tr><td colspan="5" class="text-center">Failed to load attendees.</td></tr>`;
  }
}

// Render attendee table
function renderTable(attendees) {
  table.innerHTML = "";

  if (!attendees.length) {
    table.innerHTML = `<tr><td colspan="5" class="text-center">No attendees registered yet.</td></tr>`;
    return;
  }

  attendees.forEach((attendee) => {
    table.innerHTML += `
      <tr>
        <td>${attendee.fullName}</td>
        <td>${attendee.email}</td>
        <td>${attendee.age}</td>
        <td>${attendee.affiliation}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editAttendee('${attendee._id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteAttendee('${attendee._id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

// Handle form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const age = document.getElementById("age").value.trim();
  const affiliation = document.getElementById("affiliation").value.trim();

  if (!fullName || !email || !age || !affiliation) {
    alert("Please fill all required fields.");
    return;
  }

  const attendeeData = { fullName, email, phone, age, affiliation };

  try {
    if (editId) {
      // Update existing attendee
      await fetch(`/api/attendees/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendeeData),
      });
      editId = null;
    } else {
      // Create new attendee
      await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendeeData),
      });
    }

    form.reset();
    loadAttendees();
  } catch (err) {
    console.error("Failed to save attendee:", err);
    alert("Error saving attendee. See console for details.");
  }
});

// Edit attendee
async function editAttendee(id) {
  try {
    const res = await fetch(`/api/attendees`);
    const attendees = await res.json();
    const attendee = attendees.find((a) => a._id === id);
    if (!attendee) return alert("Attendee not found.");

    document.getElementById("fullName").value = attendee.fullName;
    document.getElementById("email").value = attendee.email;
    document.getElementById("phone").value = attendee.phone;
    document.getElementById("age").value = attendee.age;
    document.getElementById("affiliation").value = attendee.affiliation;

    editId = id;
  } catch (err) {
    console.error("Failed to fetch attendee for edit:", err);
  }
}

// Delete attendee
async function deleteAttendee(id) {
  if (!confirm("Are you sure you want to delete this attendee?")) return;

  try {
    await fetch(`/api/attendees/${id}`, { method: "DELETE" });
    loadAttendees();
  } catch (err) {
    console.error("Failed to delete attendee:", err);
    alert("Error deleting attendee. See console for details.");
  }
}

// Initial load
loadAttendees();
