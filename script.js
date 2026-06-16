/**
 * HomeVal — script.js
 * Handles form submission, API call, result rendering, and UX polish.
 */

/* ═══════════════════════════════════════════════════════
   DOM references
═══════════════════════════════════════════════════════ */
const form        = document.getElementById("predictionForm");
const submitBtn   = document.getElementById("submitBtn");
const btnText     = submitBtn.querySelector(".btn-text");
const btnLoading  = submitBtn.querySelector(".btn-loading");
const resultCard  = document.getElementById("resultCard");
const resultPrice = document.getElementById("resultPrice");
const resultMeta  = document.getElementById("resultMeta");
const errorCard   = document.getElementById("errorCard");
const errorMsg    = document.getElementById("errorMessage");

/* ═══════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════ */

/** Format a number as a dollar currency string */
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Show the loading state on the submit button */
function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.classList.toggle("d-none", loading);
  btnLoading.classList.toggle("d-none", !loading);
}

/** Hide both result and error cards */
function clearFeedback() {
  resultCard.classList.add("d-none");
  errorCard.classList.add("d-none");
}

/** Render the error card with a message */
function showError(message) {
  errorMsg.textContent = message;
  errorCard.classList.remove("d-none");
  errorCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Render the result card with the predicted price */
function showResult(price, formData) {
  // Format and display price
  resultPrice.textContent = formatCurrency(price);

  // Build summary chips from form data
  const chips = [
    `${formData.get("area")} sq ft`,
    `${formData.get("bedrooms")} bed`,
    `${formData.get("bathrooms")} bath`,
    `${formData.get("stories")} floor${formData.get("stories") > 1 ? "s" : ""}`,
    furnishingLabel(parseInt(formData.get("furnishingstatus"), 10)),
  ];

  resultMeta.innerHTML = chips
    .map((c) => `<span class="result-chip">${c}</span>`)
    .join("");

  resultCard.classList.remove("d-none");
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Map numeric furnishing status to a human label */
function furnishingLabel(value) {
  return { 2: "Fully Furnished", 1: "Semi Furnished", 0: "Unfurnished" }[value] ?? "—";
}

/* ═══════════════════════════════════════════════════════
   Form validation (lightweight, CSS-driven)
═══════════════════════════════════════════════════════ */
function validateForm() {
  const area = parseFloat(document.getElementById("area").value);
  const bedrooms = document.getElementById("bedrooms").value;
  const bathrooms = document.getElementById("bathrooms").value;
  const stories = document.getElementById("stories").value;

  let valid = true;

  // Area
  const areaEl = document.getElementById("area");
  if (!area || area < 100) {
    areaEl.classList.add("is-invalid");
    valid = false;
  } else {
    areaEl.classList.remove("is-invalid");
  }

  // Selects
  [
    { id: "bedrooms", val: bedrooms },
    { id: "bathrooms", val: bathrooms },
    { id: "stories", val: stories },
  ].forEach(({ id, val }) => {
    const el = document.getElementById(id);
    if (!val) {
      el.classList.add("is-invalid");
      valid = false;
    } else {
      el.classList.remove("is-invalid");
    }
  });

  return valid;
}

/* ═══════════════════════════════════════════════════════
   Form submission
═══════════════════════════════════════════════════════ */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFeedback();

  if (!validateForm()) {
    // Scroll to first invalid field
    const firstInvalid = form.querySelector(".is-invalid");
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  setLoading(true);

  // Gather form data
  const fd = new FormData(form);

  const payload = {
    area:              parseFloat(fd.get("area")),
    bedrooms:          parseInt(fd.get("bedrooms"), 10),
    bathrooms:         parseInt(fd.get("bathrooms"), 10),
    stories:           parseInt(fd.get("stories"), 10),
    parking:           parseInt(fd.get("parking") || "0", 10),
    mainroad:          fd.get("mainroad") === "1" ? 1 : 0,
    guestroom:         fd.get("guestroom") === "1" ? 1 : 0,
    basement:          fd.get("basement") === "1" ? 1 : 0,
    hotwaterheating:   fd.get("hotwaterheating") === "1" ? 1 : 0,
    airconditioning:   fd.get("airconditioning") === "1" ? 1 : 0,
    prefarea:          fd.get("prefarea") === "1" ? 1 : 0,
    furnishingstatus:  parseInt(fd.get("furnishingstatus") || "2", 10),
  };

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok) {
      showError(json.error || `Server error (${response.status}). Please try again.`);
      return;
    }

    showResult(json.predicted_price, fd);

  } catch (err) {
    console.error("Network error:", err);
    showError("Could not reach the server. Check your connection and try again.");
  } finally {
    setLoading(false);
  }
});

/* ═══════════════════════════════════════════════════════
   UX: clear invalid state on input
═══════════════════════════════════════════════════════ */
["area", "bedrooms", "bathrooms", "stories"].forEach((id) => {
  document.getElementById(id).addEventListener("input", function () {
    this.classList.remove("is-invalid");
  });
});

/* ═══════════════════════════════════════════════════════
   UX: Navbar scroll shadow
═══════════════════════════════════════════════════════ */
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  navbar.style.background =
    window.scrollY > 50
      ? "rgba(8,11,20,0.97)"
      : "rgba(8,11,20,0.85)";
}, { passive: true });

/* ═══════════════════════════════════════════════════════
   UX: Smooth scroll for all anchor links
═══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

/* ═══════════════════════════════════════════════════════
   UX: Scroll-triggered fade-in for cards
═══════════════════════════════════════════════════════ */
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".about-card").forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(24px)";
    card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(card);
  });
}
