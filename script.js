const monthPicker = document.getElementById("monthPicker");
const tableBody = document.querySelector("#attendanceTable tbody");
const totalMealsInput = document.getElementById("totalMealsInput");
const themeSelector = document.getElementById("themeSelector");

monthPicker.addEventListener("change", generateTable);
themeSelector.addEventListener("change", () => {
  document.body.className = themeSelector.value;
});

function generateTable() {
  tableBody.innerHTML = "";
  const [year, month] = monthPicker.value.split("-");
  const date = new Date(year, month - 1, 1);
  let sno = 1;

  while (date.getMonth() == month - 1) {
    const day = date.getDate();
    const weekday = date.toLocaleString("en-US", { weekday: "long" });
    const formattedDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    const isSunday = weekday === "Sunday";
    const attendance = isSunday ? "Week Off (Sunday)" : "Present";
    const meals = isSunday ? 0 : 90;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="sno">${sno}</td>
      <td class="date">${formattedDate}</td>
      <td contenteditable="true">${attendance}</td>
      <td class="mealAmount" contenteditable="true">${meals}</td>
    `;
    tableBody.appendChild(row);

    date.setDate(day + 1);
    sno++;
  }

  updateTotalMeals();
  tableBody.addEventListener("input", updateTotalMeals);
}

function updateTotalMeals() {
  const meals = document.querySelectorAll(".mealAmount");
  let total = 0;
  let presentDays = 0;

  meals.forEach((cell, index) => {
    const value = parseInt(cell.textContent.trim()) || 0;
    total += value;

    const attnCell = tableBody.rows[index].cells[2];
    const attnText = attnCell.textContent.trim().toLowerCase();
    if (attnText === "present") {
      presentDays++;
    }
  });

  // Update the input field with calculated value
  const totalInput = document.getElementById("totalMealsInput");
  totalInput.value = total;

  // Update present days separately
  document.getElementById("presentDays").textContent = `(for ${presentDays} days)`;
}


async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const totalText = "Total Meals Amount = " + totalMealsInput.value;

  doc.setFontSize(18);
  doc.text(header, 14, 15);

  doc.autoTable({
    html: "#attendanceTable",
    startY: 25,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      halign: "center",
    },
    styles: {
      fontSize: 10,
      halign: "center",
    },
    didDrawPage: function (data) {
      const totalText = "Total Meals Amount = " + totalMealsInput.value;
      const comboText = "Total Combo Off = " + document.getElementById("comboOff").innerText;
      doc.setFontSize(12);
      doc.text(totalText, 14, data.cursor.y + 10);
      doc.text(comboText, 14, data.cursor.y + 18);
    }
  });

  const [year, month] = monthPicker.value.split("-");
  const monthName = new Date(`${year}-${month}-01`).toLocaleString("default", { month: "long" });
  const fileName = `${monthName} Attendance.pdf`;

  doc.save(fileName);
}

function resetForm() {
  monthPicker.value = "";
  tableBody.innerHTML = "";
  totalMealsInput.value = 0;
  document.getElementById("comboOff").innerText = "0";
  document.getElementById("editableHeader").innerText = "Monthly Attendance and Meal Tracker";
  document.body.className = "";
  themeSelector.value = "default";
}
document.getElementById("totalMealsInput").addEventListener("input", function() {
  console.log("User set total meals =", this.value);
});



