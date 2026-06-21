function alignFourDigitDivision() {
  const root = document.getElementById('root');
  const text = root?.textContent || '';
  const isFourDigit = text.includes('1152 ÷ 24');
  const svg = document.querySelector('.division-svg');
  if (!svg || !isFourDigit) return;

  svg.setAttribute('viewBox', '0 0 350 340');

  const lines = svg.querySelectorAll('line.division-line');
  if (lines[0]) {
    lines[0].setAttribute('x1', '122');
    lines[0].setAttribute('x2', '306');
  }

  const bracket = svg.querySelector('path.no-fill');
  if (bracket) {
    bracket.setAttribute('d', 'M112 82 C126 112 126 138 112 168');
  }

  const divisor = svg.querySelector('.divisor-svg');
  if (divisor) divisor.setAttribute('x', '94');

  const digits = [...svg.querySelectorAll('text')];
  const mainRow = digits.filter((node) => node.getAttribute('y') === '130' && !node.classList.contains('divisor-svg'));
  [136, 182, 228, 274].forEach((x, index) => mainRow[index]?.setAttribute('x', String(x)));

  const quotient = digits.filter((node) => node.getAttribute('y') === '54');
  quotient[0]?.setAttribute('x', '228');
  quotient[1]?.setAttribute('x', '274');

  const y178 = digits.filter((node) => node.getAttribute('y') === '178');
  if (y178.length === 2) [182, 228].forEach((x, index) => y178[index]?.setAttribute('x', String(x)));

  const y232 = digits.filter((node) => node.getAttribute('y') === '232');
  if (y232.length === 2) [182, 228].forEach((x, index) => y232[index]?.setAttribute('x', String(x)));
  if (y232.length === 3) [182, 228, 274].forEach((x, index) => y232[index]?.setAttribute('x', String(x)));

  const y278 = digits.filter((node) => node.getAttribute('y') === '278');
  if (y278.length === 3) [182, 228, 274].forEach((x, index) => y278[index]?.setAttribute('x', String(x)));

  const y326 = digits.filter((node) => node.getAttribute('y') === '326');
  y326[0]?.setAttribute('x', '274');
}

const observer = new MutationObserver(alignFourDigitDivision);
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
window.addEventListener('load', alignFourDigitDivision);
setTimeout(alignFourDigitDivision, 300);
