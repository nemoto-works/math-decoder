function alignFourDigitDivision() {
  const root = document.getElementById('root');
  const text = root?.textContent || '';
  const isFourDigit = text.includes('1152 ÷ 24 ・ STEP');
  const svg = document.querySelector('.division-svg');
  if (!svg || !isFourDigit) return;

  const shift = 38;
  const groups = [...svg.querySelectorAll('g')];
  groups.forEach((group) => {
    const digit = group.querySelector('text');
    if (!digit) return;
    const y = digit.getAttribute('y');
    const isDigitColumn = ['54', '130', '178', '232', '278', '326'].includes(y);
    if (isDigitColumn) {
      group.setAttribute('transform', `translate(${shift} 0)`);
    }
  });

  const mainLine = svg.querySelector('line.division-line');
  if (mainLine) {
    mainLine.setAttribute('x1', '134');
    mainLine.setAttribute('x2', '306');
  }

  const bracket = svg.querySelector('path.no-fill');
  if (bracket) {
    bracket.setAttribute('d', 'M126 82 C140 112 140 138 126 168');
  }
}

const observer = new MutationObserver(alignFourDigitDivision);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', alignFourDigitDivision);
setTimeout(alignFourDigitDivision, 300);
