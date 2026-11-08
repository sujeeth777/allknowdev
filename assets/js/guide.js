"use strict";

const checks = [...document.querySelectorAll(".stage-check")];
const progress = document.getElementById("pathProgress");
const progressLabel = document.getElementById("progressLabel");

const STORAGE_KEY = "allknowdev-roadmap-" + location.pathname;

function updateProgress() {
  const completed = checks.filter(check => check.checked).length;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks.map(check => check.checked)));
  } catch (_) {}
  if (progress) progress.value = completed;
  if (progressLabel) {
    progressLabel.textContent = `${completed} of ${checks.length} stages complete`;
  }
}

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  checks.forEach((check, index) => { if (saved[index]) check.checked = true; });
} catch (_) {}

checks.forEach(check => check.addEventListener("change", updateProgress));
updateProgress();
