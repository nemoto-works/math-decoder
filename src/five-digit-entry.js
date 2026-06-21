function addFiveDigitEntry() {
  const options = document.querySelector('.problem-options');
  if (!options || document.querySelector('.five-digit-entry')) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'problem-option five-digit-entry';

  const title = document.createElement('strong');
  title.textContent = '10368 ÷ 24';

  const level = document.createElement('span');
  level.textContent = '5桁÷2桁';

  button.appendChild(title);
  button.appendChild(level);
  button.addEventListener('click', () => {
    alert('5桁÷2桁レッスンは追加中です。10368÷24=432 を扱います。');
  });

  options.appendChild(button);
}

const observer = new MutationObserver(addFiveDigitEntry);
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('load', addFiveDigitEntry);
setTimeout(addFiveDigitEntry, 300);
