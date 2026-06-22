const cycleLabels = ['見る', 'たてる', 'かける', 'ひく', 'おろす'];

function currentCycleLabel() {
  const stepLabel = document.querySelector('.lesson-head .step-label, .five-lite-card > .step-label');
  const text = stepLabel?.textContent || '';

  if (text.includes('見る')) return '見る';
  if (text.includes('たてる')) return 'たてる';
  if (text.includes('かける')) return 'かける';
  if (text.includes('ひく')) return 'ひく';
  if (text.includes('おろす')) return 'おろす';

  const heading = document.querySelector('.lesson-head h2, .five-lite-card h2');
  const title = heading?.textContent || '';
  if (title.includes('見る') || title.includes('何回')) return '見る';
  if (title.includes('書く')) return 'たてる';
  if (title.includes('×')) return 'かける';
  if (title.includes('−') || title.includes('-')) return 'ひく';
  if (title.includes('おろ')) return 'おろす';

  return text.includes('あたり') ? '見る' : '見る';
}

function cycleTarget() {
  return document.querySelector('.lesson-head') || document.querySelector('.five-lite-card h2');
}

function renderCycleBar() {
  const target = cycleTarget();
  if (!target) return;

  const active = currentCycleLabel();
  let bar = document.querySelector('.cycle-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'cycle-bar';
  }

  bar.innerHTML = cycleLabels.map((label) => {
    const className = ['cycle-step', label === active ? 'active' : 'dimmed'].join(' ');
    return `<span class="${className}">${label}</span>`;
  }).join('');

  if (target.classList.contains('lesson-head')) {
    target.insertAdjacentElement('afterend', bar);
  } else {
    target.insertAdjacentElement('afterend', bar);
  }
}

const cycleObserver = new MutationObserver(renderCycleBar);
cycleObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', renderCycleBar);
setTimeout(renderCycleBar, 300);
