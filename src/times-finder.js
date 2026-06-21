function addTimesFinder() {
  const root = document.getElementById('root');
  if (!root) return;

  const pageText = root.textContent || '';
  const isTarget = pageText.includes('1152 ÷ 24') && pageText.includes('192の中に24は何回入る？');
  const oldCard = document.querySelector('.times-finder-card');

  if (!isTarget) {
    oldCard?.remove();
    return;
  }

  const actions = document.querySelector('.actions');
  if (!actions) return;

  if (oldCard) {
    if (oldCard.previousElementSibling !== actions) {
      actions.insertAdjacentElement('afterend', oldCard);
    }
    return;
  }

  const card = document.createElement('section');
  card.className = 'times-finder-card';
  card.innerHTML = `
    <p class="step-label">24の段で探す</p>
    <h3>192は24の何回ぶん？</h3>
    <div class="times-finder-list">
      <div><strong>24×5=120</strong><span>まだ足りない</span></div>
      <div><strong>24×6=144</strong><span>まだ足りない</span></div>
      <div><strong>24×7=168</strong><span>まだ足りない</span></div>
      <div class="times-finder-answer"><strong>24×8=192</strong><span>ぴったり。だから8回</span></div>
    </div>
  `;

  actions.insertAdjacentElement('afterend', card);
}

const observer = new MutationObserver(addTimesFinder);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', addTimesFinder);
setTimeout(addTimesFinder, 300);
