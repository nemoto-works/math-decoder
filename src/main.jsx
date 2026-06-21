import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const quizOptions = [
  { value: '1', label: '1だけを見る', message: '1だけだと12より小さいので、まだ割れません。もう少し左から数字を広げます。' },
  { value: '15', label: '15を見る', message: '正解です。12が入る、左から一番小さいまとまりは15です。' },
  { value: '156', label: '156全部を見る', message: '全部を一気に見なくても大丈夫です。左から12が入る最小のまとまりを探します。' },
];

const steps = [
  {
    key: 'look-15',
    label: '見る',
    title: 'まず「15」を見る',
    explanation: '12が入る、左から一番小さいまとまりを探します。1だけでは12より小さいので、15を見ます。',
    nextHint: '次は、15の中に12が何回入るかを考えます。',
    focus: ['dividend-1', 'dividend-5'],
    preview: ['q-1'],
    quotient: ['', ''],
    lines: [],
    visualTitle: '15の中に12は何回入る？',
    visual: { type: 'blocks', total: 15, group: 12, remainder: 3, note: '12が1回入って、3が残ります。' },
    quiz: { question: '最初にどこを見る？', answer: '15', options: quizOptions },
  },
  {
    key: 'write-1',
    label: 'たてる',
    title: '1回入るので「1」を上に書く',
    explanation: '15の中に12は1回入ります。だから、5の上に1を書きます。',
    nextHint: '次は、入った分の12を書きます。',
    focus: ['q-1'],
    preview: ['m-1', 'm-2'],
    quotient: ['1', ''],
    lines: [],
    visualTitle: '1回ぶんを上に記録する',
    visual: { type: 'simple', note: '「何回入ったか」を上に書くのが、筆算の「たてる」です。' },
  },
  {
    key: 'multiply-12',
    label: 'かける',
    title: '1 × 12 = 12 を書く',
    explanation: '1回入ったので、入った分の12を書きます。これは後で引くためです。',
    nextHint: '次は、15から12を引いて残りを見ます。',
    focus: ['m-1', 'm-2'],
    preview: ['r-3'],
    quotient: ['1', ''],
    lines: [{ digits: ['1', '2'], ids: ['m-1', 'm-2'], className: 'product first-product' }],
    visualTitle: '入った分を見えるようにする',
    visual: { type: 'blocks', total: 15, group: 12, remainder: 3, note: '15のうち、使った12を書きます。' },
  },
  {
    key: 'subtract-3',
    label: 'ひく',
    title: '15 − 12 = 3',
    explanation: '15から、入った分の12を引きます。残りは3です。',
    nextHint: '次は、まだ使っていない6を見ます。',
    focus: ['r-3'],
    preview: ['down-6'],
    quotient: ['1', ''],
    lines: [
      { digits: ['1', '2'], ids: ['m-1', 'm-2'], className: 'product first-product' },
      { separator: true, className: 'separator first-separator' },
      { digits: ['3'], ids: ['r-3'], className: 'remainder first-remainder' },
    ],
    visualTitle: '残りは3',
    visual: { type: 'blocks', total: 15, group: 12, remainder: 3, note: '残った3は、次の数字と組み合わせます。' },
  },
  {
    key: 'bring-down-6',
    label: 'おろす',
    title: '余り3と6を合わせて、36を見る',
    explanation: '「6を下ろす」は、余り3と次の数字6を合わせて36という新しいまとまりを作ることです。',
    nextHint: '次は、36の中に12が何回入るかを考えます。',
    focus: ['r-3', 'down-6'],
    preview: ['q-3'],
    quotient: ['1', ''],
    lines: [
      { digits: ['1', '2'], ids: ['m-1', 'm-2'], className: 'product first-product' },
      { separator: true, className: 'separator first-separator' },
      { digits: ['3', '6'], ids: ['r-3', 'down-6'], className: 'remainder second-target' },
    ],
    visualTitle: '3 + 6 → 36',
    visual: { type: 'combine', left: '3', right: '6', result: '36', note: '単に6が落ちてくるのではなく、残り3と次の6が合体して36になります。' },
  },
  {
    key: 'look-36',
    label: '見る',
    title: '36の中に12は何回入る？',
    explanation: '次は36を見ます。12は36の中に3回入ります。',
    nextHint: '次は、3回入ったことを上に書きます。',
    focus: ['r-3', 'down-6'],
    preview: ['q-3'],
    quotient: ['1', ''],
    lines: [
      { digits: ['1', '2'], ids: ['m-1', 'm-2'], className: 'product first-product' },
      { separator: true, className: 'separator first-separator' },
      { digits: ['3', '6'], ids: ['r-3', 'down-6'], className: 'remainder second-target' },
    ],
    visualTitle: '36を12ずつ分ける',
    visual: { type: 'groups', total: 36, group: 12, count: 3, note: '12が3回入ります。' },
  },
  {
    key: 'write-3',
    label: 'たてる',
    title: '3回入るので「3」を上に書く',
    explanation: '36の中に12は3回入るので、6の上に3を書きます。',
    nextHint: '最後に、入った分の36を書いて引きます。',
    focus: ['q-3'],
    preview: ['line-3-0', 'line-3-1'],
    quotient: ['1', '3'],
    lines: [
      { digits: ['1', '2'], ids: ['m-1', 'm-2'], className: 'product first-product' },
      { separator: true, className: 'separator first-separator' },
      { digits: ['3', '6'], ids: ['r-3', 'down-6'], className: 'remainder second-target' },
    ],
    visualTitle: '3回ぶんを上に記録する',
    visual: { type: 'simple', note: 'ここまでで答えの形が13になります。' },
  },
  {
    key: 'finish',
    label: '完成',
    title: '156 ÷ 12 = 13',
    explanation: '12が1回、次に3回入りました。答えは13です。',
    nextHint: '筆算は、見る場所を決めることから始まります。',
    focus: ['q-1', 'q-3'],
    preview: [],
    quotient: ['1', '3'],
    lines: [
      { digits: ['1', '2'], ids: ['m-1', 'm-2'], className: 'product first-product' },
      { separator: true, className: 'separator first-separator' },
      { digits: ['3', '6'], ids: ['r-3', 'down-6'], className: 'remainder second-target' },
      { digits: ['3', '6'], ids: ['line-3-0', 'line-3-1'], className: 'product second-product' },
      { separator: true, className: 'separator second-separator' },
      { digits: ['0'], ids: ['line-5-0'], className: 'remainder final-remainder' },
    ],
    visualTitle: '筆算の流れ',
    visual: { type: 'flow', note: '見る → たてる → かける → ひく → おろす。筆算はこのくり返しです。' },
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Digit({ id, children, focusIds, previewIds }) {
  return <span className={cx('digit', previewIds.includes(id) && 'preview', focusIds.includes(id) && 'spotlight')}>{children}</span>;
}

function LongDivision({ step }) {
  const focusIds = step.focus;
  const previewIds = step.preview ?? [];
  return (
    <div className="spotlight-stage">
      <div className="long-division" aria-label="156 ÷ 12 の筆算">
        <div className="quotient-row">
          <span></span>
          <Digit id="q-1" focusIds={focusIds} previewIds={previewIds}>{step.quotient[0]}</Digit>
          <Digit id="q-3" focusIds={focusIds} previewIds={previewIds}>{step.quotient[1]}</Digit>
        </div>
        <div className="bar-row"><span></span><span className="bar"></span></div>
        <div className="problem-row">
          <span className="divisor">12</span>
          <span className="bracket">)</span>
          <Digit id="dividend-1" focusIds={focusIds} previewIds={previewIds}>1</Digit>
          <Digit id="dividend-5" focusIds={focusIds} previewIds={previewIds}>5</Digit>
          <Digit id="down-6" focusIds={focusIds} previewIds={previewIds}>6</Digit>
        </div>
        <div className="work-area">
          {step.lines.map((line, index) => {
            if (line.separator) return <div key={index} className={cx('work-line', line.className)}><span className="subbar"></span></div>;
            return (
              <div key={index} className={cx('work-line', line.className)}>
                {line.digits.map((d, i) => <Digit key={`${d}-${i}`} id={line.ids?.[i] ?? `line-${index}-${i}`} focusIds={focusIds} previewIds={previewIds}>{d}</Digit>)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Blocks({ total, group, remainder, count }) {
  const groups = count ?? Math.floor(total / group);
  const remain = remainder ?? total % group;
  return (
    <div className="blocks" aria-label={`${total}個のブロック`}>
      {Array.from({ length: groups }).map((_, groupIndex) => (
        <div className="block-group" key={groupIndex}>
          {Array.from({ length: group }).map((_, i) => <span className="block" key={i} />)}
        </div>
      ))}
      {remain > 0 && <div className="block-group remainder-blocks">{Array.from({ length: remain }).map((_, i) => <span className="block" key={i} />)}</div>}
    </div>
  );
}

function Visual({ visual }) {
  if (visual.type === 'blocks') return <><Blocks total={visual.total} group={visual.group} remainder={visual.remainder} /><p>{visual.note}</p></>;
  if (visual.type === 'groups') return <><Blocks total={visual.total} group={visual.group} count={visual.count} /><p>{visual.note}</p></>;
  if (visual.type === 'combine') return <><div className="combine strong-combine"><span>{visual.left}</span><span>＋</span><span>{visual.right}</span><span>→</span><strong>{visual.result}</strong></div><p>{visual.note}</p></>;
  if (visual.type === 'flow') return <><div className="flow"><span>見る</span><span>たてる</span><span>かける</span><span>ひく</span><span>おろす</span></div><p>{visual.note}</p></>;
  return <p>{visual.note}</p>;
}

function EyeQuiz({ quiz }) {
  const [choice, setChoice] = useState(null);
  const selected = quiz.options.find((option) => option.value === choice);
  const isCorrect = choice === quiz.answer;

  return (
    <section className="card quiz-card">
      <p className="step-label">視線クイズ</p>
      <h2>{quiz.question}</h2>
      <div className="quiz-options">
        {quiz.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cx('quiz-option', choice === option.value && (isCorrect ? 'correct' : 'wrong'))}
            onClick={() => setChoice(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {selected && <p className={cx('quiz-message', isCorrect ? 'correct-text' : 'hint-text')}>{selected.message}</p>}
    </section>
  );
}

function App() {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const progress = useMemo(() => Math.round(((index + 1) / steps.length) * 100), [index]);

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">算数デコーダー MVP</p>
        <h1>見えない考え方を、見える形に。</h1>
        <p>3桁÷2桁の筆算で「いま、どこを見るのか」をスポットライトで示します。</p>
      </header>

      <section className="card lesson-card">
        <div className="lesson-head">
          <div>
            <p className="step-label">STEP {index + 1} / {steps.length} ・ {step.label}</p>
            <h2>{step.title}</h2>
          </div>
          <div className="progress" aria-label={`進捗 ${progress}%`}><span style={{ width: `${progress}%` }} /></div>
        </div>

        <div className="lesson-grid">
          <div className="paper-panel"><LongDivision step={step} /></div>
          <div className="explain-panel">
            <h3>いま考えること</h3>
            <p>{step.explanation}</p>
            <div className="next-hint"><strong>次に見るところ</strong><span>{step.nextHint}</span></div>
          </div>
        </div>
      </section>

      {step.quiz && <EyeQuiz quiz={step.quiz} />}

      <section className="card visual-card">
        <p className="step-label">ビジュアル補助</p>
        <h2>{step.visualTitle}</h2>
        <Visual visual={step.visual} />
      </section>

      <nav className="actions" aria-label="ステップ操作">
        <button type="button" onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={index === 0}>前へ</button>
        <button type="button" className="primary" onClick={() => setIndex((v) => Math.min(steps.length - 1, v + 1))} disabled={index === steps.length - 1}>次へ</button>
        <button type="button" onClick={() => setIndex(0)}>最初から</button>
      </nav>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
