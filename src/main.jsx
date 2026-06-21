import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const steps = [
  {
    label: '見る', title: 'まず「15」を見る',
    explanation: '12が入る、左から一番小さいまとまりを探します。1だけでは12より小さいので、15を見ます。',
    nextHint: '次は、15の中に12が何回入るかを考えます。',
    focus: ['d1', 'd5'], preview: ['q1'], q1: '', q3: '', show12: false, show3: false, show36: false, showSecond36: false, show0: false,
    visualTitle: '15の中に12は何回入る？', visual: { type: 'blocks', total: 15, group: 12, remainder: 3, note: '12が1回入って、3が残ります。' },
    check: { question: '最初に見るのはどこ？', answer: '15', options: [
      { value: '1', label: '1だけ', message: '1だけだと12より小さいので、まだ割れません。' },
      { value: '15', label: '15', message: '正解。左から見て、12が入る最小のまとまりです。' },
      { value: '156', label: '156全部', message: '全部を一気に見なくても大丈夫です。' },
    ]},
  },
  {
    label: 'たてる', title: '1回入るので「1」を上に書く',
    explanation: '15の中に12は1回入ります。だから、5の上に1を書きます。',
    nextHint: '次は、入った分の12を書きます。',
    focus: ['q1'], preview: ['m1', 'm2'], q1: '1', q3: '', show12: false, show3: false, show36: false, showSecond36: false, show0: false,
    visualTitle: '1回ぶんを上に記録する', visual: { type: 'simple', note: '「何回入ったか」を上に書くのが、筆算の「たてる」です。' },
    check: { question: '15の中に12は何回入る？', answer: '1', options: [
      { value: '0', label: '0回', message: '15は12より大きいので、0回ではありません。' },
      { value: '1', label: '1回', message: '正解。12が1回入ります。' },
      { value: '2', label: '2回', message: '12が2回だと24で、15を超えます。' },
    ]},
  },
  {
    label: 'かける', title: '1 × 12 = 12 を書く',
    explanation: '1回入ったので、入った分の12を書きます。これは後で引くためです。',
    nextHint: '次は、15から12を引いて残りを見ます。',
    focus: ['m1', 'm2'], preview: ['r3'], q1: '1', q3: '', show12: true, show3: false, show36: false, showSecond36: false, show0: false,
    visualTitle: '入った分を見えるようにする', visual: { type: 'blocks', total: 15, group: 12, remainder: 3, note: '15のうち、使った12を書きます。' },
    check: { question: '1回入った分はいくつ？', answer: '12', options: [
      { value: '1', label: '1', message: '1は回数です。入った分は12です。' },
      { value: '12', label: '12', message: '正解。1回ぶんの12を書きます。' },
      { value: '15', label: '15', message: '15は今見ているまとまりです。' },
    ]},
  },
  {
    label: 'ひく', title: '15 − 12 = 3',
    explanation: '15から、入った分の12を引きます。残りは3です。',
    nextHint: '次は、まだ使っていない6を見ます。',
    focus: ['r3'], preview: ['d6'], q1: '1', q3: '', show12: true, show3: true, show36: false, showSecond36: false, show0: false,
    visualTitle: '残りは3', visual: { type: 'blocks', total: 15, group: 12, remainder: 3, note: '残った3は、次の数字と組み合わせます。' },
    check: { question: 'この「3」はどうする？', answer: 'combine', options: [
      { value: 'answer', label: '答えにする', message: 'まだ右に6が残っています。ここでは答えにしません。' },
      { value: 'combine', label: '次の6と合わせる', message: '正解。3と6を合わせて36にします。' },
      { value: 'ignore', label: '使わない', message: '3は大事な残りです。次に使います。' },
    ]},
  },
  {
    label: 'おろす', title: '余り3と6を合わせて、36を見る',
    explanation: '「6を下ろす」は、余り3と次の数字6を合わせて36という新しいまとまりを作ることです。',
    nextHint: '次は、36の中に12が何回入るかを考えます。',
    focus: ['r3', 'd6'], preview: ['q3'], q1: '1', q3: '', show12: true, show3: false, show36: true, showSecond36: false, show0: false,
    visualTitle: '3 + 6 → 36', visual: { type: 'combine', left: '3', right: '6', result: '36', note: '単に6が落ちてくるのではなく、残り3と次の6が合体して36になります。' },
    check: { question: '3と6を合わせると？', answer: '36', options: [
      { value: '9', label: '9', message: '足し算ではなく、筆算では3の右に6をつけて36にします。' },
      { value: '36', label: '36', message: '正解。次に見るまとまりは36です。' },
      { value: '6', label: '6', message: '6だけではなく、残り3と合わせます。' },
    ]},
  },
  {
    label: '見る', title: '36の中に12は何回入る？',
    explanation: 'ここで止まって考えます。12×1=12、12×2=24、12×3=36。だから36の中に12は3回入ります。',
    nextHint: '次は、3回入ったことを上に書きます。',
    focus: ['r3', 'd6'], preview: ['q3'], q1: '1', q3: '', show12: true, show3: false, show36: true, showSecond36: false, show0: false,
    visualTitle: '36を12ずつ分ける', visual: { type: 'groups', total: 36, group: 12, count: 3, note: '12が3回入ります。12、24、36と数えると分かりやすいです。' },
    check: { question: '36の中に12は何回入る？', answer: '3', options: [
      { value: '2', label: '2回', message: '12×2=24。まだ36まで足りません。' },
      { value: '3', label: '3回', message: '正解。12×3=36です。' },
      { value: '4', label: '4回', message: '12×4=48。36を超えてしまいます。' },
    ]},
  },
  {
    label: 'たてる', title: '3回入るので「3」を上に書く',
    explanation: '36の中に12は3回入るので、6の上に3を書きます。',
    nextHint: '最後に、入った分の36を書いて引きます。',
    focus: ['q3'], preview: ['p3', 'p6'], q1: '1', q3: '3', show12: true, show3: false, show36: true, showSecond36: false, show0: false,
    visualTitle: '3回ぶんを上に記録する', visual: { type: 'simple', note: 'ここまでで答えの形が13になります。' },
    check: { question: '6の上に書く数字は？', answer: '3', options: [
      { value: '1', label: '1', message: '1は最初の15に入った回数です。' },
      { value: '3', label: '3', message: '正解。36に12が3回入ります。' },
      { value: '6', label: '6', message: '6は下ろした数字です。上に書くのは回数です。' },
    ]},
  },
  {
    label: '完成', title: '156 ÷ 12 = 13',
    explanation: '12が1回、次に3回入りました。答えは13です。',
    nextHint: '筆算は、見る場所を決めることから始まります。',
    focus: ['q1', 'q3'], preview: [], q1: '1', q3: '3', show12: true, show3: false, show36: true, showSecond36: true, show0: true,
    visualTitle: '筆算の流れ', visual: { type: 'flow', note: '見る → たてる → かける → ひく → おろす。筆算はこのくり返しです。' },
    check: null,
  },
];

function cx(...classes) { return classes.filter(Boolean).join(' '); }

function SvgDigit({ id, x, y, children, step }) {
  const active = step.focus.includes(id);
  const preview = step.preview.includes(id);
  return <g className={cx(preview && 'svg-preview', active && 'svg-spotlight')}>{(active || preview) && <rect x={x - 18} y={y - 34} width="36" height="42" rx="8" />}<text x={x} y={y}>{children}</text></g>;
}

function LongDivision({ step }) {
  return <div className="spotlight-stage"><svg className="division-svg" viewBox="0 0 320 340" role="img" aria-label="156 ÷ 12 の筆算"><line className="division-line" x1="132" y1="78" x2="268" y2="78" /><path className="division-line no-fill" d="M122 82 C136 112 136 138 122 168" /><SvgDigit id="q1" x="190" y="54" step={step}>{step.q1}</SvgDigit><SvgDigit id="q3" x="235" y="54" step={step}>{step.q3}</SvgDigit><text className="svg-digit divisor-svg" x="82" y="130">12</text><SvgDigit id="d1" x="150" y="130" step={step}>1</SvgDigit><SvgDigit id="d5" x="195" y="130" step={step}>5</SvgDigit><SvgDigit id="d6" x="240" y="130" step={step}>6</SvgDigit>{step.show12 && <><SvgDigit id="m1" x="150" y="178" step={step}>1</SvgDigit><SvgDigit id="m2" x="195" y="178" step={step}>2</SvgDigit><line className="division-line" x1="132" y1="193" x2="215" y2="193" /></>}{step.show3 && <SvgDigit id="r3" x="195" y="232" step={step}>3</SvgDigit>}{step.show36 && <><SvgDigit id="r3" x="195" y="232" step={step}>3</SvgDigit><SvgDigit id="d6" x="240" y="232" step={step}>6</SvgDigit></>}{step.showSecond36 && <><SvgDigit id="p3" x="195" y="278" step={step}>3</SvgDigit><SvgDigit id="p6" x="240" y="278" step={step}>6</SvgDigit><line className="division-line" x1="178" y1="293" x2="260" y2="293" /></>}{step.show0 && <SvgDigit id="z0" x="240" y="326" step={step}>0</SvgDigit>}</svg></div>;
}

function Blocks({ total, group, remainder, count }) {
  const groups = count ?? Math.floor(total / group);
  const remain = remainder ?? total % group;
  return <div className="blocks">{Array.from({ length: groups }).map((_, groupIndex) => <div className="block-group" key={groupIndex}>{Array.from({ length: group }).map((_, i) => <span className="block" key={i} />)}</div>)}{remain > 0 && <div className="block-group remainder-blocks">{Array.from({ length: remain }).map((_, i) => <span className="block" key={i} />)}</div>}</div>;
}

function Visual({ visual }) {
  if (visual.type === 'blocks') return <><Blocks total={visual.total} group={visual.group} remainder={visual.remainder} /><p>{visual.note}</p></>;
  if (visual.type === 'groups') return <><Blocks total={visual.total} group={visual.group} count={visual.count} /><p>{visual.note}</p></>;
  if (visual.type === 'combine') return <><div className="combine strong-combine"><span>{visual.left}</span><span>＋</span><span>{visual.right}</span><span>→</span><strong>{visual.result}</strong></div><p>{visual.note}</p></>;
  if (visual.type === 'flow') return <><div className="flow"><span>見る</span><span>たてる</span><span>かける</span><span>ひく</span><span>おろす</span></div><p>{visual.note}</p></>;
  return <p>{visual.note}</p>;
}

function CheckCard({ check, choice, onChoice }) {
  if (!check) return null;
  const selected = check.options.find((option) => option.value === choice);
  const isCorrect = choice === check.answer;
  return <section className="check-card"><p className="step-label">確認してから次へ</p><h3>{check.question}</h3><div className="check-options">{check.options.map((option) => <button key={option.value} type="button" className={cx('check-option', choice === option.value && (isCorrect ? 'correct' : 'wrong'))} onClick={() => onChoice(option.value)}>{option.label}</button>)}</div>{selected && <p className={cx('check-message', isCorrect ? 'correct-text' : 'hint-text')}>{selected.message}</p>}</section>;
}

function App() {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const step = steps[index];
  const choice = choices[index];
  const canGoNext = !step.check || choice === step.check.answer;
  const progress = useMemo(() => Math.round(((index + 1) / steps.length) * 100), [index]);
  return <main className="app"><header className="hero"><p className="eyebrow">算数デコーダー MVP</p><h1>見えない考え方を、見える形に。</h1><p>3桁÷2桁の筆算で「いま、どこを見るのか」をスポットライトで示します。</p></header><section className="card lesson-card"><div className="lesson-head"><div><p className="step-label">STEP {index + 1} / {steps.length} ・ {step.label}</p><h2>{step.title}</h2></div><div className="progress"><span style={{ width: `${progress}%` }} /></div></div><div className="paper-panel"><LongDivision step={step} /></div><nav className="actions" aria-label="ステップ操作"><button type="button" onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={index === 0}>前へ</button><button type="button" className="primary" onClick={() => canGoNext && setIndex((v) => Math.min(steps.length - 1, v + 1))} disabled={index === steps.length - 1 || !canGoNext}>次へ</button><button type="button" onClick={() => setIndex(0)}>最初から</button></nav><CheckCard check={step.check} choice={choice} onChoice={(value) => setChoices((prev) => ({ ...prev, [index]: value }))} /><div className="explain-panel"><h3>いま考えること</h3><p>{step.explanation}</p><div className="next-hint"><strong>次に見るところ</strong><span>{step.nextHint}</span></div></div></section><section className="card visual-card"><p className="step-label">ビジュアル補助</p><h2>{step.visualTitle}</h2><Visual visual={step.visual} /></section></main>;
}

createRoot(document.getElementById('root')).render(<App />);
