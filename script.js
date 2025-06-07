function updatePrice() {
  const event = document.getElementById("event").value;
  const hourlyContainer = document.getElementById("hourlyInputContainer");
  const startTime = document.getElementById("startTime").value;
  const hoursInput = document.getElementById("hoursCount");
  let price = 0;
  let duration = 0;

  // Show/hide hourly dropdown
  if (event === "hourly") {
    hourlyContainer.style.display = "block";
  } else {
    hourlyContainer.style.display = "none";
  }

  // Calculate price and duration
  switch (event) {
    case "full":
      price = 1200;
      duration = 12;
      break;
    case "half":
      price = 700;
      duration = 6;
      break;
    case "hourly":
      const hours = parseInt(hoursInput.value) || 1;
      price = 160 * hours;
      duration = hours;
      break;
    default:
      price = 0;
  }

  document.getElementById("eventPrice").textContent = `€${price.toFixed(2)}`;

const priceDisplay = document.getElementById("priceDisplay");
if (priceDisplay) {
  priceDisplay.scrollIntoView({ behavior: "smooth" });
}

  // Update end time if start time and duration are valid
  if (startTime && duration > 0) {
    const endTime = calculateEndTime(startTime, duration);
    document.getElementById("endTime").value = endTime;
  } else {
    document.getElementById("endTime").value = "";
  }
}

// Utility function to add hours to HH:mm format
function calculateEndTime(startTime, hoursToAdd) {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(startHour, startMin);
  startDate.setMinutes(0);

  // Add the specified number of hours
  startDate.setHours(startDate.getHours() + hoursToAdd);

  // Format to 24-hour time string like "23:00"
  const endHour = startDate.getHours().toString().padStart(2, "0");
  const endMin = startDate.getMinutes().toString().padStart(2, "0");

  return `${endHour}:${endMin}`;
}


document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value;
  const surname = document.getElementById("surname").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const email = document.getElementById("email").value;

  const eventType = document.getElementById("eventType").value;
  const otherEventType = document.getElementById("otherEventType")?.value || "";
  const eventLabel = eventType === "other" ? `Other (${otherEventType})` : eventType;

  const event = document.getElementById("event").value;
  const hours = event === "hourly" ? parseInt(document.getElementById("hoursCount").value) || 1 : null;
  const bookingLabel = event === "hourly"
    ? `Hourly (${hours} hour${hours > 1 ? 's' : ''})`
    : event === "full"
      ? "Full day"
      : event === "half"
        ? "Half day"
        : event;

  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const priceText = document.getElementById("eventPrice").textContent;

  db.collection("bookings").add({
    firstName,
    surname,
    phoneNumber,
    email,
    eventType: eventLabel,
    bookingType: bookingLabel, // ✅ combined label
    date,
    startTime,
    endTime,
    price: priceText,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert(`Thank you ${firstName} ${surname}!\nYour booking has been recorded successfully.`);
    document.getElementById("bookingForm").reset();
    document.getElementById("eventPrice").textContent = "€0.00";
    document.getElementById("hourlyInputContainer").style.display = "none";
    document.getElementById("otherEventTypeContainer").style.display = "none";
    document.getElementById("endTime").value = "";
  })
  .catch((error) => {
    alert("Error saving booking: " + error.message);
  });
});



// 💡 New addition for updating price when hours change
document.addEventListener("DOMContentLoaded", function () {
  const hoursDropdown = document.getElementById("hoursCount");
  const startTime = document.getElementById("startTime");
  const bookingType = document.getElementById("event");

  if (hoursDropdown) {
    hoursDropdown.addEventListener("change", updatePrice);
  }

  if (startTime) {
    startTime.addEventListener("change", updatePrice);
  }

  if (bookingType) {
    bookingType.addEventListener("change", updatePrice);
  }
});
