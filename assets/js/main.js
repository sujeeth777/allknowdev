/* =========================================
   ALLKNOWDEV — MAIN JAVASCRIPT
   Version 0.1.0
========================================= */


/* 01. MOBILE NAVIGATION */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        const isOpen = navLinks.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));

    });


    // Close menu after selecting a navigation link.

    navLinks.querySelectorAll("a").forEach((link) => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("open");

            menuToggle.setAttribute("aria-expanded", "false");

        });

    });


    // Close menu with Escape.

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            navLinks.classList.remove("open");

            menuToggle.setAttribute("aria-expanded", "false");

        }

    });

}


/* 02. CATEGORY SEARCH */

const searchInput = document.getElementById("resourceSearch");
const categoryCards = document.querySelectorAll(".category-card");
const searchStatus = document.getElementById("searchStatus");


if (searchInput && categoryCards.length > 0) {

    searchInput.addEventListener("input", () => {

        const query = searchInput.value
            .trim()
            .toLowerCase();

        let visibleCount = 0;


        categoryCards.forEach((card) => {

            const searchableText = (
                card.dataset.search + " " + card.textContent
            ).toLowerCase();

            const matches = searchableText.includes(query);

            card.hidden = !matches;

            if (matches) {
                visibleCount++;
            }

        });


        if (searchStatus) {

            if (query.length === 0) {

                searchStatus.textContent =
                    "Browse all engineering categories.";

            } else if (visibleCount > 0) {

                searchStatus.textContent =
                    `${visibleCount} matching categories found.`;

            } else {

                searchStatus.textContent =
                    "No matching categories found. Try another search.";

            }

        }

    });

}


/* 03. AUTOMATIC FOOTER YEAR */

const currentYear = document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}


/* 04. CONSOLE BRANDING */

console.log(
    "%c ALLKNOWDEV ",
    "background: #a3ff68; color: #080b0a; font-size: 18px; font-weight: bold; padding: 8px;"
);

console.log(
    "%cKnow what you can get.",
    "color: #a3ff68; font-size: 12px;"
);

console.log(
    "Open knowledge. Transparent information. Built for builders."
);