let panels = [];

const approvalTable = document.getElementById("approvalTable");
const approvalMessage = document.getElementById("approvalMessage");

// Load panels from backend
async function loadPanels() {
  try {
    const response = await fetch("/api/panels");
    panels = await response.json();
    renderApprovalTable();
  } catch (error) {
    console.error("Error loading panels:", error);
    showApprovalMessage("Could not load panel submissions.", "danger");
  }
}

// Render the table
function renderApprovalTable() {
  approvalTable.innerHTML = "";

  if (panels.length === 0) {
    approvalTable.innerHTML = `
      <tr>
        <td colspan="10" class="text-center">No panel submissions found.</td>
      </tr>
    `;
    return;
  }

  panels.forEach(function (panel) {
    approvalTable.innerHTML += `
      <tr>
        <td>${panel.id}</td>
        <td>${panel.speaker}</td>
        <td>${panel.title}</td>
        <td>${panel.category}</td>
        <td>${panel.room}</td>
        <td>${panel.duration}</td>
        <td class="text-capitalize">${panel.status || "pending"}</td>
        <td>${panel.description || ""}</td>
        <td>
          <textarea
            class="form-control bg-black text-light border-success"
            rows="2"
            id="comment-${panel.id}"
            placeholder="Enter moderator comment..."
          >${panel.moderatorComment || ""}</textarea>
        </td>
        <td>
          <div class="d-grid gap-2">
            <button
              class="btn btn-success btn-sm"
              onclick="updatePanelStatus('${panel.id}', 'approved')"
            >
              Approve
            </button>
            <button
              class="btn btn-danger btn-sm"
              onclick="updatePanelStatus('${panel.id}', 'denied')"
            >
              Deny
            </button>
            <button
              class="btn btn-outline-danger btn-sm"
              onclick="deletePanel('${panel.id}')"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

// Update status/comment
async function updatePanelStatus(panelId, status) {
  const commentInput = document.getElementById(`comment-${panelId}`);
  const moderatorComment = commentInput.value.trim();

  try {
    const response = await fetch(`/api/panels/${panelId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, moderatorComment }),
    });

    const data = await response.json();

    if (!response.ok) {
      showApprovalMessage(data.error || "Failed to update panel.", "danger");
      return;
    }

    showApprovalMessage(
      `Panel ${panelId} updated successfully as ${status}.`,
      "success",
    );

    loadPanels();
  } catch (error) {
    console.error("Error updating panel:", error);
    showApprovalMessage("Server error. Could not update panel.", "danger");
  }
}

// DELETE panel
async function deletePanel(panelId) {
  if (
    !confirm(
      `Are you sure you want to delete panel ${panelId}? This cannot be undone.`,
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`/api/panels/${panelId}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      showApprovalMessage(data.error || "Failed to delete panel.", "danger");
      return;
    }

    showApprovalMessage(`Panel ${panelId} deleted successfully.`, "success");
    loadPanels();
  } catch (error) {
    console.error("Error deleting panel:", error);
    showApprovalMessage("Server error. Could not delete panel.", "danger");
  }
}

// Show messages
function showApprovalMessage(message, type) {
  approvalMessage.textContent = message;
  approvalMessage.className = `alert alert-${type} mb-4`;
  approvalMessage.classList.remove("d-none");
}

// Initial load
loadPanels();
