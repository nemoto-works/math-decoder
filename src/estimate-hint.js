function addEstimateHint() {
  const root = document.getElementById('root');
  if (!root) return;

  const pageText = root.textContent || '';
  const isTarget = pageText.includes('1152 ÷ 24') && pageText.includes('115の中に24は何回入る？');
  const oldHint = document.querySelector('.estimate-hint-card');

  if (!isTarget) {
    oldHint?.remove();
    return;
  }

  const actions = document.querySelector('.actions');
  const checkCard = document.querySelector('.check-card');
  if (!actions || !checkCard || !actions.parentElement) return;

  if (oldHint) {
    if (oldHint.previousElementSibling !== actions) {
      actions.insertAdjacentElement('afterend', oldHint);
    }
    return;
  }

  const hint = document.createElement('section');
  hint.className = 'estimate-hint-card';
  hint.innerHTML = `
    <p class="step-label">あたりをつける</p>
    <h3>いきなり4を当てなくてOK</h3>
    <div class="estimate-steps">
      <div><strong>24</strong><span>は、だいたい</span><strong>25</strong></div>
      <div><strong>25 × 4 = 100</strong><span>だから、4回くらい入りそう</span></div>
      <div><strong>24 × 5 = 120</strong><span>だと、115を超える</span></div>
      <div class="estimate-answer"><strong>だから4回</strong></div>
    </div>
  `;

  actions.insertAdjacentElement('afterend', hint);
}

const observer = new MutationObserver(addEstimateHint);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', addEstimateHint);
setTimeout(addEstimateHint, 300);
