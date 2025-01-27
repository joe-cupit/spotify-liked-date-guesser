const getMonth = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December"
}

let currentYear = 2025;
let currentMonth = 1;
let currentDay = 1;


function getMaxDayBasedOnMonth() {
  let maxDay = 31;
  if (currentMonth === 2) {
    if (currentYear % 4 === 0 && currentYear % 100 !== 0) {
      maxDay = 29;
    }
    else {
      maxDay = 28;
    }
  }
  else if ([4, 6, 9, 11].includes(currentMonth)) {
    maxDay = 30;
  }

  return maxDay;
}


function incrementYear() {
  currentYear += 1;
  if (currentYear > 2025) {
    currentYear = 2000;
  }

  document.getElementById("date-input__year").innerText = currentYear;
}
function decrementYear() {
  currentYear -= 1;
  if (currentYear < 2000) {
    currentYear = 2025;
  }

  document.getElementById("date-input__year").innerText = currentYear;
}

function incrementMonth() {
  currentMonth += 1;
  if (currentMonth > 12) {
    currentMonth = 1;
  }

  document.getElementById("date-input__month").innerText = getMonth[currentMonth];

  if (currentDay > getMaxDayBasedOnMonth()) {
    currentDay = getMaxDayBasedOnMonth();
    document.getElementById("date-input__day").innerText = currentDay;
  }
}
function decrementMonth() {
  currentMonth -= 1;
  if (currentMonth < 1) {
    currentMonth = 12;
  }

  document.getElementById("date-input__month").innerText = getMonth[currentMonth];

  if (currentDay > getMaxDayBasedOnMonth()) {
    currentDay = getMaxDayBasedOnMonth();
    document.getElementById("date-input__day").innerText = currentDay;
  }
}

function incrementDay() {
  currentDay += 1;

  let maxDay = getMaxDayBasedOnMonth();
  if (currentDay > maxDay) {
    currentDay = 1;
  }

  document.getElementById("date-input__day").innerText = currentDay;
}
function decrementDay() {
  currentDay -= 1;
  if (currentDay < 1) {
    currentDay = getMaxDayBasedOnMonth();
  }

  document.getElementById("date-input__day").innerText = currentDay;
}
