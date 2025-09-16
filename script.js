const monthPicker = document.getElementById("monthPicker");
const tableBody = document.querySelector("#attendanceTable tbody");
const themeSelector = document.getElementById("themeSelector");
const totalMealsValue = document.getElementById("totalMealsValue");

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
    const formattedDate = `${String(day).padStart(2,'0')}-${String(month).padStart(2,'0')}-${year}`;
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

    // Update sum dynamically when meal cell is edited
    row.querySelector(".mealAmount").addEventListener("input", updateTotalMeals);

    date.setDate(day + 1);
    sno++;
  }

  updateTotalMeals(); // initial sum
}

function updateTotalMeals() {
  const meals = document.querySelectorAll(".mealAmount");
  let total = 0;

  meals.forEach(cell => {
    const value = parseInt(cell.textContent.trim()) || 0;
    total += value;
  });

  // Update only the sum
  totalMealsValue.innerText = total;
}

async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const header = document.getElementById("editableHeader").innerText;

  doc.setFontSize(18);
  doc.text(header, 14, 15);

  doc.autoTable({
    html: "#attendanceTable",
    startY: 25,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], halign: "center" },
    styles: { fontSize: 10, halign: "center" },
    didDrawPage: function (data) {
      const totalText = `${document.getElementById("totalMealsLabel").innerText} = ${totalMealsValue.innerText}`;
      const comboText = "Total Combo Off = " + document.getElementById("comboOff").innerText;
      doc.setFontSize(12);
      doc.text(totalText, 14, data.cursor.y + 10);
      doc.text(comboText, 14, data.cursor.y + 18);
    }
  });

  const [year, month] = monthPicker.value.split("-");
  const monthName = new Date(`${year}-${month}-01`).toLocaleString("default", { month: "long" });
  doc.save(`${monthName} Attendance.pdf`);
}

function resetForm() {
  monthPicker.value = "";
  tableBody.innerHTML = "";
  document.getElementById("totalMealsLabel").innerText = "Total Meals Amount";
  totalMealsValue.innerText = "0";
  document.getElementById("comboOff").innerText = "0";
  document.getElementById("editableHeader").innerText = "Monthly Attendance and Meal Tracker";
  document.body.className = "";
  themeSelector.value = "default";
}
