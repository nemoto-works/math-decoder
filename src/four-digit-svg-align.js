function alignFourDigitDivision() {
  const root = document.getElementById('root');
  const text = root?.textContent || '';
  const isFourDigit = text.includes('1152 ÷ 24 ・ STEP');
  const svg = document.querySelector('.division-svg');
  if (!svg || !isFourDigit) return;

  const digitShift = 44;
  const groups = [...svg.querySelectorAll('g')];
  groups.forEach((group) => {
    const digit = group.querySelector('text');
    if (!digit) return;
    const y = digit.getAttribute('y');
    const isDigitColumn = ['54', '130', '178', '232', '278', '326'].includes(y);
    if (isDigitColumn) {
      group.setAttribute('transform', `translate(${digitShift} 0)`);
    }
  });

  const band = svg.querySelector('.target-band');
  if (band) {
    band.setAttribute('transform', `translate(${digitShift} 0)`);
  }

  const mainLine = svg.querySelector('line.division-line');
  if (mainLine) {
    mainLine.setAttribute('x1', '128');
    mainLine.setAttribute('x2', '314');
  }

  const bracket = svg.querySelector('path.no-fill');
  if (bracket) {
    bracket.setAttribute('d', 'M110 82 C124 112 124 138 110 168');
  }
}

const observer = new MutationObserver(alignFourDigitDivision);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', alignFourDigitDivision);
setTimeout(alignFourDigitDivision, 300);
