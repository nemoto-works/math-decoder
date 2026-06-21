function markFourDigitLayout() {
  const root = document.getElementById('root');
  const text = root?.textContent || '';
  const isFourDigit = text.includes('1152 ÷ 24');
  document.body.classList.toggle('four-digit-active', isFourDigit);

  const svg = document.querySelector('.division-svg');
  if (svg && isFourDigit) {
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
}

const observer = new MutationObserver(markFourDigitLayout);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', markFourDigitLayout);
setTimeout(markFourDigitLayout, 300);
