"use strict";

const checks = [...document.querySelectorAll(".stage-check")];
const progress = document.getElementById("pathProgress");
const progressLabel = document.getElementById("progressLabel");

function updateProgress() {
  const completed = checks.filter(check => check.checked).length;
  if (progress) progress.value = completed;
  if (progressLabel) {
    progressLabel.textContent = `${completed} of ${checks.length} stages complete`;
  }
}

checks.forEach(check => check.addEventListener("change", updateProgress));
updateProgress();
