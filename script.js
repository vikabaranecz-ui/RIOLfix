const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

toggle.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mobileNav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

const calendar = document.querySelector("[data-calendar]");

if (calendar) {
  const title = calendar.querySelector("[data-calendar-title]");
  const grid = calendar.querySelector("[data-calendar-grid]");
  const prev = calendar.querySelector("[data-calendar-prev]");
  const next = calendar.querySelector("[data-calendar-next]");
  const selectedDateInput = document.querySelector("[data-selected-date]");
  const selectedSlotInput = document.querySelector("[data-selected-slot]");
  const summary = document.querySelector("[data-booking-summary]");
  const bookingForm = document.querySelector(".booking-form");
  const slotButtons = [...document.querySelectorAll("[data-slot]")];
  const monthNames = [
    "januari",
    "februari",
    "maart",
    "april",
    "mei",
    "juni",
    "juli",
    "augustus",
    "september",
    "oktober",
    "november",
    "december",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const discountStart = new Date(today);
  discountStart.setDate(discountStart.getDate() + 30);

  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = "";
  let selectedSlot = "";

  const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(`${isoDate}T00:00:00`);
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const updateSummary = () => {
    const earnsDiscount = selectedDate && new Date(`${selectedDate}T00:00:00`) >= discountStart;

    if (selectedDate && selectedSlot) {
      const discountText = earnsDiscount
        ? "Deze planning komt in aanmerking voor €20 korting."
        : "Boek minstens 1 maand vooraf om €20 korting te krijgen.";
      summary.innerHTML = `<strong>${formatDate(selectedDate)} · ${selectedSlot}</strong><span>${discountText}</span>`;
      return;
    }

    if (selectedDate) {
      summary.innerHTML = `<strong>${formatDate(selectedDate)}</strong><span>Kies nog een vrij moment om de boeking af te werken.</span>`;
      return;
    }

    summary.innerHTML =
      "<strong>Nog geen moment gekozen</strong><span>Selecteer een datum en tijdslot voor uw geplande reiniging.</span>";
  };

  const renderCalendar = () => {
    grid.innerHTML = "";
    title.textContent = `${monthNames[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`;

    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const lastDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    const leadingDays = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < leadingDays; i += 1) {
      const empty = document.createElement("button");
      empty.type = "button";
      empty.className = "is-empty";
      empty.tabIndex = -1;
      grid.append(empty);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
      const isoDate = toIsoDate(date);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(day);
      button.dataset.date = isoDate;
      button.disabled = date < today;
      button.classList.toggle("is-today", isoDate === toIsoDate(today));
      button.classList.toggle("is-selected", isoDate === selectedDate);
      button.classList.toggle("has-discount", date >= discountStart);
      button.setAttribute("aria-label", `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`);

      button.addEventListener("click", () => {
        selectedDate = isoDate;
        selectedDateInput.value = selectedDate;
        renderCalendar();
        updateSummary();
      });

      grid.append(button);
    }
  };

  prev.addEventListener("click", () => {
    const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    if (previousMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      visibleMonth = previousMonth;
      renderCalendar();
    }
  });

  next.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  slotButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedSlot = button.dataset.slot;
      selectedSlotInput.value = selectedSlot;
      slotButtons.forEach((slotButton) => {
        slotButton.classList.toggle("is-selected", slotButton === button);
      });
      updateSummary();
    });
  });

  bookingForm.addEventListener("submit", (event) => {
    if (!selectedDate || !selectedSlot) {
      event.preventDefault();
      summary.classList.add("needs-selection");
      summary.innerHTML =
        "<strong>Kies eerst een datum en tijdslot</strong><span>Daarna kunt u de geplande reiniging aanvragen.</span>";
    }
  });

  renderCalendar();
  updateSummary();
}
