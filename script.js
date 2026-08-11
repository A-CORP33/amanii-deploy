const WHATSAPP_NUMBER = "221770000000";

let currentView = "vue1";

document.addEventListener("DOMContentLoaded", function () {
  buildWhatsAppLinks();
  setupSwitcher();
  setupCarousels();
  setupContactForm();
});

function buildWhatsAppLink(message) {
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

function buildWhatsAppLinks() {
  document.querySelectorAll("[data-wa-cta]").forEach(function (link) {
    const card = link.closest("[data-wa-message]");
    if (!card) return;
    link.href = buildWhatsAppLink(card.dataset.waMessage);
    link.target = "_blank";
    link.rel = "noopener";
  });
}

function setupSwitcher() {
  const track = document.getElementById("switcherTrack");
  const btnVue1 = document.getElementById("btnVue1");
  const btnVue2 = document.getElementById("btnVue2");

  btnVue1.addEventListener("click", function () { switchView("vue1", track, btnVue1, btnVue2); });
  btnVue2.addEventListener("click", function () { switchView("vue2", track, btnVue1, btnVue2); });
}

function switchView(target, track, btnVue1, btnVue2) {
  if (target === currentView) return;

  const oldSection = document.getElementById(currentView);
  const newSection = document.getElementById(target);

  oldSection.classList.add("fade-out");

  newSection.classList.add("is-active", "fade-in");
  void newSection.offsetWidth;
  newSection.classList.remove("fade-in");

  window.setTimeout(function () {
    oldSection.classList.remove("is-active", "fade-out");
  }, 350);

  track.classList.toggle("is-vue2", target === "vue2");
  btnVue1.setAttribute("aria-selected", String(target === "vue1"));
  btnVue2.setAttribute("aria-selected", String(target === "vue2"));

  const firstCard = newSection.querySelector(".card");
  if (firstCard) updateStickyCta(firstCard);

  currentView = target;
}

function setupCarousels() {
  document.querySelectorAll(".carousel").forEach(function (carousel) {
    const track = carousel.querySelector(".carousel-track");
    const cards = Array.from(track.children);
    const dotsContainer = carousel.querySelector(".dots");

    cards.forEach(function (card, index) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot" + (index === 0 ? " active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
      dot.setAttribute("aria-label", "Voir l'offre " + card.dataset.offerName);
      dot.addEventListener("click", function () {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = cards.indexOf(entry.target);
            dots.forEach(function (d) { d.classList.remove("active"); d.setAttribute("aria-selected", "false"); });
            if (dots[index]) { dots[index].classList.add("active"); dots[index].setAttribute("aria-selected", "true"); }

            const parentView = carousel.closest(".offers-view");
            if (parentView && parentView.id === currentView) {
              updateStickyCta(entry.target);
            }
          }
        });
      },
      { root: track, threshold: [0.6] }
    );

    cards.forEach(function (card) { observer.observe(card); });
  });
}

function updateStickyCta(card) {
  const nameEl = document.getElementById("stickyCtaOfferName");
  const linkEl = document.getElementById("stickyCtaLink");
  nameEl.textContent = card.dataset.offerName;
  linkEl.href = buildWhatsAppLink(card.dataset.waMessage);
  linkEl.target = "_blank";
  linkEl.rel = "noopener";
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  const nameInput = document.getElementById("contactName");
  const phoneInput = document.getElementById("contactPhone");
  const nameError = document.getElementById("contactNameError");
  const phoneError = document.getElementById("contactPhoneError");
  const feedback = document.getElementById("formFeedback");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;
    nameError.textContent = "";
    phoneError.textContent = "";
    nameInput.removeAttribute("aria-invalid");
    phoneInput.removeAttribute("aria-invalid");

    if (!nameInput.value.trim()) {
      nameError.textContent = "Merci d'indiquer votre nom ou celui de votre entreprise.";
      nameInput.setAttribute("aria-invalid", "true");
      isValid = false;
    }

    const phoneDigits = phoneInput.value.replace(/\D/g, "");
    if (!phoneInput.value.trim() || phoneDigits.length < 8) {
      phoneError.textContent = "Merci d'indiquer un numéro WhatsApp valide.";
      phoneInput.setAttribute("aria-invalid", "true");
      isValid = false;
    }

    feedback.classList.remove("success", "error");

    if (!isValid) {
      feedback.textContent = "Merci de corriger les champs signalés ci-dessus.";
      feedback.classList.add("error");
      return;
    }

    feedback.textContent = "Merci ! Nous vous recontactons très rapidement sur WhatsApp.";
    feedback.classList.add("success");
    form.reset();
  });
}
