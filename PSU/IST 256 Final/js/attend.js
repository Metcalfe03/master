document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("attendForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get values
    const name = document.getElementById("attendeeName").value.trim();
    const email = document.getElementById("attendeeEmail").value.trim();
    const panel = document.getElementById("selectedPanel").value;
    const participation = document.getElementById("participationType").value;
    const day = document.getElementById("sessionDay").value;
    const notes = document.getElementById("attendanceNotes").value.trim();
    const confirmed = document.getElementById("confirmAttendance").checked;

    // Validation
    if (!name || !email || !panel || !participation || !day || !confirmed) {
      alert("Please complete all required fields and confirm attendance.");
      return;
    }

    // Create JSON object
    const attendanceData = {
      name: name,
      email: email,
      panel: panel,
      participationType: participation,
      sessionDay: day,
      notes: notes,
      confirmed: confirmed,
    };

    // Log to console (for screenshots)
    console.log("Attendance JSON:", attendanceData);

    // Send data to a placeholder API
    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceData),
    })
      .then((response) => response.json())
      .then((json) => {
        console.log("Server response:", json);
        document.getElementById("attendanceMessage").innerHTML =
          '<div class="alert alert-success">Attendance submitted!</div>';
      });

    // Display summary using React
    const root = ReactDOM.createRoot(document.getElementById("reactRoot"));
    function AttendanceDisplay(props) {
      return React.createElement(
        "div",
        { className: "card bg-black border-success mt-3 p-3 text-light" },
        [
          React.createElement(
            "h5",
            { key: "title", className: "text-success" },
            "Submission Summary",
          ),
          React.createElement("p", { key: "name" }, `Name: ${props.data.name}`),
          React.createElement(
            "p",
            { key: "email" },
            `Email: ${props.data.email}`,
          ),
          React.createElement(
            "p",
            { key: "panel" },
            `Panel: ${props.data.panel}`,
          ),
          React.createElement(
            "p",
            { key: "type" },
            `Participation: ${props.data.participationType}`,
          ),
          React.createElement(
            "p",
            { key: "day" },
            `Day: ${props.data.sessionDay}`,
          ),
          React.createElement(
            "p",
            { key: "notes" },
            `Notes: ${props.data.notes || "None"}`,
          ),
        ],
      );
    }
    root.render(
      React.createElement(AttendanceDisplay, { data: attendanceData }),
    );

    // Save to localStorage
    localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
  });
});
