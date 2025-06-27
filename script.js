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

  startDate.setHours(startDate.getHours() + hoursToAdd);

  const endHour = startDate.getHours().toString().padStart(2, "0");
  const endMin = startDate.getMinutes().toString().padStart(2, "0");

  return `${endHour}:${endMin}`;
}

// Form submission handler
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
  const cateringService = document.getElementById("cateringService").checked ? "Yes" : "No";

  const bookingData = {
    firstName,
    surname,
    phoneNumber,
    email,
    eventType: eventLabel,
    bookingType: bookingLabel,
    date,
    startTime,
    endTime,
    price: priceText,
    cateringService,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("bookings").add(bookingData)
    .then(() => {
      alert(`Thank you ${firstName} ${surname}!\nYour booking has been recorded successfully.`);
      document.getElementById("bookingForm").reset();
      document.getElementById("eventPrice").textContent = "€0.00";
      document.getElementById("hourlyInputContainer").style.display = "none";
      document.getElementById("otherEventTypeContainer").style.display = "none";
      document.getElementById("endTime").value = "";

      const templateParams = {
        to_email: email,
        to_name: `${firstName} ${surname}`,
        event_type: eventLabel,
        booking_type: bookingLabel,
        date,
        start_time: startTime,
        end_time: endTime,
        price: priceText,
        phone: phoneNumber,
        catering_service: cateringService
      };

      // Send confirmation to customer
      emailjs.send("service_fttp7ie", "template_1024so3", templateParams)
        .then(() => console.log("Confirmation email sent to customer"))
        .catch((error) => console.error("Customer email error:", error));

      // Send notification to your business
const teamParams = {
  ...templateParams,
  customer_email: templateParams.to_email, // ✅ keep customer's email for use in the message
  to_email: "eliteeventsandcaterers@outlook.ie", // ✅ actual recipient (your team)
  to_name: `${firstName} ${surname}`
};

      emailjs.send("service_fttp7ie", "template_id8umqi", teamParams)
        .then(() => console.log("Internal confirmation sent"))
        .catch((error) => console.error("Internal email error:", error));
    })
    .catch((error) => {
      alert("Error saving booking: " + error.message);
    });
});

// Auto update price and time on selection
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
