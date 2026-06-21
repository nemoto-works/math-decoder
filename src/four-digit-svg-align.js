function alignFourDigitDivision() {
  const root = document.getElementById('root');
  const text = root?.textContent || '';
  const isFourDigit = text.includes('1152 ÷ 24 ・ STEP');
  const svg = document.querySelector('.division-svg');
  if (!svg || !isFourDigit) return;

  const groups = [...svg.querySelectorAll('g')];
  groups.forEach((group) => {
    const digit = group.querySelector('text');
    if (!digit) return;
    const y = digit.getAttribute('y');
    const isDigitColumn = ['54', '130', '178', '232', '278', '326'].includes(y);
    if (isDigitColumn) {
      group.setAttribute('transform', 'translate(22 0)');
    }
  });

  const mainLine = svg.querySelector('line.division-line');
  if (mainLine) {
    mainLine.setAttribute('x1', '124');
    mainLine.setAttribute('x2', '296');
  }

  const bracket = svg.querySelector('path.no-fill');
  if (bracket) {
    bracket.setAttribute('d', 'M116 82 C130 112 130 138 116 168');
  }
}

const observer = new MutationObserver(alignFourDigitDivision);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', alignFourDigitDivision);
setTimeout(alignFourDigitDivision, 300);
