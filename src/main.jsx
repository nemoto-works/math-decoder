import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const problemDefs = [
  {
    id: '156-12',
    label: '156 ÷ 12',
    level: '3桁÷2桁',
    dividend: ['1', '5', '6'],
    divisor: '12',
    firstTarget: '15',
    firstRemainder: '3',
    secondTarget: '36',
    secondCount: '3',
    answer: '13',
    secondProduct: '36',
  },
  {
    id: '168-12',
    label: '168 ÷ 12',
    level: '3桁÷2桁 応用',
    dividend: ['1', '6', '8'],
    divisor: '12',
    firstTarget: '16',
    firstRemainder: '4',
    secondTarget: '48',
    secondCount: '4',
    answer: '14',
    secondProduct: '48',
  },
];

function makeSteps(problem) {
  const [d1, d2, d3] = problem.dividend;
  const q1 = problem.answer[0];
  const q2 = problem.answer[1];
  const [secondA, secondB] = problem.secondTarget;
  const [productA, productB] = problem.secondProduct;

  return [
    {
      label: '見る',
      title: `まず「${problem.firstTarget}」を見る`,
      explanation: `${problem.divisor}が入る、左から一番小さいまとまりを探します。${d1}だけでは${problem.divisor}より小さいので、${problem.firstTarget}を見ます。`,
      nextHint: `次は、${problem.firstTarget}の中に${problem.divisor}が何回入るかを考えます。`,
      focus: ['d1', 'd2'], preview: ['q1'], q1: '', q2: '', showFirstProduct: false, showRemainder: false, showSecondTarget: false, showSecondProduct: false, show0: false,
      visualTitle: `${problem.firstTarget}の中に${problem.divisor}は何回入る？`,
      visual: { type: 'blocks', total: Number(problem.firstTarget), group: Number(problem.divisor), remainder: Number(problem.firstRemainder), note: `${problem.divisor}が${q1}回入って、${problem.firstRemainder}が残ります。` },
      check: { question: '最初に見るのはどこ？', answer: problem.firstTarget, options: [
        { value: d1, label: `${d1}だけ`, message: `${d1}だけだと${problem.divisor}より小さいので、まだ割れません。` },
        { value: problem.firstTarget, label: problem.firstTarget, message: `正解。左から見て、${problem.divisor}が入る最小のまとまりです。` },
        { value: problem.dividend.join(''), label: `${problem.dividend.join('')}全部`, message: '全部を一気に見なくても大丈夫です。' },
      ]},
    },
    {
      label: 'たてる',
      title: `${q1}回入るので「${q1}」を上に書く`,
      explanation: `${problem.firstTarget}の中に${problem.divisor}は${q1}回入ります。だから、${d2}の上に${q1}を書きます。`,
      nextHint: `次は、入った分の${problem.divisor}を書きます。`,
      focus: ['q1'], preview: ['m1', 'm2'], q1, q2: '', showFirstProduct: false, showRemainder: false, showSecondTarget: false, showSecondProduct: false, show0: false,
      visualTitle: `${q1}回ぶんを上に記録する`,
      visual: { type: 'simple', note: '「何回入ったか」を上に書くのが、筆算の「たてる」です。' },
      check: { question: `${problem.firstTarget}の中に${problem.divisor}は何回入る？`, answer: q1, options: [
        { value: '0', label: '0回', message: `${problem.firstTarget}は${problem.divisor}より大きいので、0回ではありません。` },
        { value: q1, label: `${q1}回`, message: `正解。${problem.divisor}が${q1}回入ります。` },
        { value: '2', label: '2回', message: `${problem.divisor}が2回だと${Number(problem.divisor) * 2}で、${problem.firstTarget}を超えます。` },
      ]},
    },
    {
      label: 'かける',
      title: `${q1} × ${problem.divisor} = ${problem.divisor} を書く`,
      explanation: `${q1}回入ったので、入った分の${problem.divisor}を書きます。これは後で引くためです。`,
      nextHint: `次は、${problem.firstTarget}から${problem.divisor}を引いて残りを見ます。`,
      focus: ['m1', 'm2'], preview: ['r1'], q1, q2: '', showFirstProduct: true, showRemainder: false, showSecondTarget: false, showSecondProduct: false, show0: false,
      visualTitle: '入った分を見えるようにする',
      visual: { type: 'blocks', total: Number(problem.firstTarget), group: Number(problem.divisor), remainder: Number(problem.firstRemainder), note: `${problem.firstTarget}のうち、使った${problem.divisor}を書きます。` },
      check: { question: `${q1}回入った分はいくつ？`, answer: problem.divisor, options: [
        { value: q1, label: q1, message: `${q1}は回数です。入った分は${problem.divisor}です。` },
        { value: problem.divisor, label: problem.divisor, message: `正解。${q1}回ぶんの${problem.divisor}を書きます。` },
        { value: problem.firstTarget, label: problem.firstTarget, message: `${problem.firstTarget}は今見ているまとまりです。` },
      ]},
    },
    {
      label: 'ひく',
      title: `${problem.firstTarget} − ${problem.divisor} = ${problem.firstRemainder}`,
      explanation: `${problem.firstTarget}から、入った分の${problem.divisor}を引きます。残りは${problem.firstRemainder}です。`,
      nextHint: `次は、まだ使っていない${d3}を見ます。`,
      focus: ['r1'], preview: ['d3'], q1, q2: '', showFirstProduct: true, showRemainder: true, showSecondTarget: false, showSecondProduct: false, show0: false,
      visualTitle: `残りは${problem.firstRemainder}`,
      visual: { type: 'blocks', total: Number(problem.firstTarget), group: Number(problem.divisor), remainder: Number(problem.firstRemainder), note: `残った${problem.firstRemainder}は、次の数字と組み合わせます。` },
      check: { question: `この「${problem.firstRemainder}」はどうする？`, answer: 'combine', options: [
        { value: 'answer', label: '答えにする', message: `まだ右に${d3}が残っています。ここでは答えにしません。` },
        { value: 'combine', label: `次の${d3}と合わせる`, message: `正解。${problem.firstRemainder}と${d3}を合わせて${problem.secondTarget}にします。` },
        { value: 'ignore', label: '使わない', message: `${problem.firstRemainder}は大事な残りです。次に使います。` },
      ]},
    },
    {
      label: 'おろす',
      title: `余り${problem.firstRemainder}と${d3}を合わせて、${problem.secondTarget}を見る`,
      explanation: `「${d3}を下ろす」は、余り${problem.firstRemainder}と次の数字${d3}を合わせて${problem.secondTarget}という新しいまとまりを作ることです。`,
      nextHint: `次は、${problem.secondTarget}の中に${problem.divisor}が何回入るかを考えます。`,
      focus: ['r1', 'd3'], preview: ['q2'], q1, q2: '', showFirstProduct: true, showRemainder: false, showSecondTarget: true, showSecondProduct: false, show0: false,
      visualTitle: `${problem.firstRemainder} + ${d3} → ${problem.secondTarget}`,
      visual: { type: 'combine', left: problem.firstRemainder, right: d3, result: problem.secondTarget, note: `足し算ではなく、${problem.firstRemainder}の右に${d3}をつけて${problem.secondTarget}として見ます。` },
      check: { question: `${problem.firstRemainder}と${d3}を合わせると？`, answer: problem.secondTarget, options: [
        { value: String(Number(problem.firstRemainder) + Number(d3)), label: String(Number(problem.firstRemainder) + Number(d3)), message: '足し算ではなく、筆算では右に数字をつけます。' },
        { value: problem.secondTarget, label: problem.secondTarget, message: `正解。次に見るまとまりは${problem.secondTarget}です。` },
        { value: d3, label: d3, message: `${d3}だけではなく、残り${problem.firstRemainder}と合わせます。` },
      ]},
    },
    {
      label: '見る',
      title: `${problem.secondTarget}の中に${problem.divisor}は何回入る？`,
      explanation: `ここで止まって考えます。${problem.divisor}×1=${Number(problem.divisor)}、${problem.divisor}×2=${Number(problem.divisor) * 2}、${problem.divisor}×${q2}=${problem.secondTarget}。だから${problem.secondTarget}の中に${problem.divisor}は${q2}回入ります。`,
      nextHint: `次は、${q2}回入ったことを上に書きます。`,
      focus: ['r1', 'd3'], preview: ['q2'], q1, q2: '', showFirstProduct: true, showRemainder: false, showSecondTarget: true, showSecondProduct: false, show0: false,
      visualTitle: `${problem.secondTarget}を${problem.divisor}ずつ分ける`,
      visual: { type: 'groups', total: Number(problem.secondTarget), group: Number(problem.divisor), count: Number(q2), note: `${problem.divisor}が${q2}回入ります。${problem.divisor}、${Number(problem.divisor) * 2}、${problem.secondTarget}と数えると分かりやすいです。` },
      check: { question: `${problem.secondTarget}の中に${problem.divisor}は何回入る？`, answer: q2, options: [
        { value: String(Number(q2) - 1), label: `${Number(q2) - 1}回`, message: `${problem.divisor}×${Number(q2) - 1}=${Number(problem.divisor) * (Number(q2) - 1)}。まだ足りません。` },
        { value: q2, label: `${q2}回`, message: `正解。${problem.divisor}×${q2}=${problem.secondTarget}です。` },
        { value: String(Number(q2) + 1), label: `${Number(q2) + 1}回`, message: `${problem.divisor}×${Number(q2) + 1}=${Number(problem.divisor) * (Number(q2) + 1)}。超えてしまいます。` },
      ]},
    },
    {
      label: 'たてる',
      title: `${q2}回入るので「${q2}」を上に書く`,
      explanation: `${problem.secondTarget}の中に${problem.divisor}は${q2}回入るので、${d3}の上に${q2}を書きます。`,
      nextHint: `最後に、入った分の${problem.secondProduct}を書いて引きます。`,
      focus: ['q2'], preview: ['p1', 'p2'], q1, q2, showFirstProduct: true, showRemainder: false, showSecondTarget: true, showSecondProduct: false, show0: false,
      visualTitle: `${q2}回ぶんを上に記録する`,
      visual: { type: 'simple', note: `ここまでで答えの形が${problem.answer}になります。` },
      check: { question: `${d3}の上に書く数字は？`, answer: q2, options: [
        { value: q1, label: q1, message: `${q1}は最初の${problem.firstTarget}に入った回数です。` },
        { value: q2, label: q2, message: `正解。${problem.secondTarget}に${problem.divisor}が${q2}回入ります。` },
        { value: d3, label: d3, message: `${d3}は下ろした数字です。上に書くのは回数です。` },
      ]},
    },
    {
      label: '完成',
      title: `${problem.dividend.join('')} ÷ ${problem.divisor} = ${problem.answer}`,
      explanation: `${problem.divisor}が${q1}回、次に${q2}回入りました。答えは${problem.answer}です。`,
      nextHint: '筆算は、見る場所を決めることから始まります。',
      focus: ['q1', 'q2'], preview: [], q1, q2, showFirstProduct: true, showRemainder: false, showSecondTarget: true, showSecondProduct: true, show0: true,
      visualTitle: '筆算の流れ',
      visual: { type: 'flow', note: '見る → たてる → かける → ひく → おろす。筆算はこのくり返しです。' },
      check: null,
    },
  ];
}

function cx(...classes) { return classes.filter(Boolean).join(' '); }

function SvgDigit({ id, x, y, children, step }) {
  const active = step.focus.includes(id);
  const preview = step.preview.includes(id);
  return <g className={cx(preview && 'svg-preview', active && 'svg-spotlight')}>{(active || preview) && <rect x={x - 18} y={y - 34} width="36" height="42" rx="8" />}<text x={x} y={y}>{children}</text></g>;
}

function LongDivision({ step, problem }) {
  const [d1, d2, d3] = problem.dividend;
  const [m1, m2] = problem.divisor;
  const [s1, s2] = problem.secondTarget;
  const [p1, p2] = problem.secondProduct;

  return <div className="spotlight-stage"><svg className="division-svg" viewBox="0 0 320 340" role="img" aria-label={`${problem.label} の筆算`}><line className="division-line" x1="132" y1="78" x2="268" y2="78" /><path className="division-line no-fill" d="M122 82 C136 112 136 138 122 168" /><SvgDigit id="q1" x="190" y="54" step={step}>{step.q1}</SvgDigit><SvgDigit id="q2" x="235" y="54" step={step}>{step.q2}</SvgDigit><text className="svg-digit divisor-svg" x="82" y="130">{problem.divisor}</text><SvgDigit id="d1" x="150" y="130" step={step}>{d1}</SvgDigit><SvgDigit id="d2" x="195" y="130" step={step}>{d2}</SvgDigit><SvgDigit id="d3" x="240" y="130" step={step}>{d3}</SvgDigit>{step.showFirstProduct && <><SvgDigit id="m1" x="150" y="178" step={step}>{m1}</SvgDigit><SvgDigit id="m2" x="195" y="178" step={step}>{m2}</SvgDigit><line className="division-line" x1="132" y1="193" x2="215" y2="193" /></>}{step.showRemainder && <SvgDigit id="r1" x="195" y="232" step={step}>{problem.firstRemainder}</SvgDigit>}{step.showSecondTarget && <><SvgDigit id="r1" x="195" y="232" step={step}>{s1}</SvgDigit><SvgDigit id="d3" x="240" y="232" step={step}>{s2}</SvgDigit></>}{step.showSecondProduct && <><SvgDigit id="p1" x="195" y="278" step={step}>{p1}</SvgDigit><SvgDigit id="p2" x="240" y="278" step={step}>{p2}</SvgDigit><line className="division-line" x1="178" y1="293" x2="260" y2="293" /></>}{step.show0 && <SvgDigit id="z0" x="240" y="326" step={step}>0</SvgDigit>}</svg></div>;
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

function ProblemSelector({ currentProblemId, onSelect }) {
  return <section className="problem-selector" aria-label="問題選択"><p className="step-label">問題を選ぶ</p><div className="problem-options">{problemDefs.map((problem) => <button key={problem.id} type="button" className={cx('problem-option', currentProblemId === problem.id && 'selected')} onClick={() => onSelect(problem.id)}><strong>{problem.label}</strong><span>{problem.level}</span></button>)}</div><p className="coming-soon">次に追加予定：84÷3 / 1152÷24</p></section>;
}

function App() {
  const [problemId, setProblemId] = useState(problemDefs[0].id);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const problem = problemDefs.find((item) => item.id === problemId) ?? problemDefs[0];
  const steps = useMemo(() => makeSteps(problem), [problem]);
  const step = steps[index];
  const choice = choices[`${problem.id}-${index}`];
  const canGoNext = !step.check || choice === step.check.answer;
  const progress = useMemo(() => Math.round(((index + 1) / steps.length) * 100), [index, steps.length]);
  const selectProblem = (id) => { setProblemId(id); setIndex(0); };

  return <main className="app"><header className="hero"><p className="eyebrow">算数デコーダー MVP</p><h1>見えない考え方を、見える形に。</h1><p>3桁÷2桁の筆算で「いま、どこを見るのか」をスポットライトで示します。</p></header><ProblemSelector currentProblemId={problem.id} onSelect={selectProblem} /><section className="card lesson-card"><div className="lesson-head"><div><p className="step-label">{problem.label} ・ STEP {index + 1} / {steps.length} ・ {step.label}</p><h2>{step.title}</h2></div><div className="progress"><span style={{ width: `${progress}%` }} /></div></div><div className="paper-panel"><LongDivision step={step} problem={problem} /></div><nav className="actions" aria-label="ステップ操作"><button type="button" onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={index === 0}>前へ</button><button type="button" className="primary" onClick={() => canGoNext && setIndex((v) => Math.min(steps.length - 1, v + 1))} disabled={index === steps.length - 1 || !canGoNext}>次へ</button><button type="button" onClick={() => setIndex(0)}>最初から</button></nav><CheckCard check={step.check} choice={choice} onChoice={(value) => setChoices((prev) => ({ ...prev, [`${problem.id}-${index}`]: value }))} /><div className="explain-panel"><h3>いま考えること</h3><p>{step.explanation}</p><div className="next-hint"><strong>次に見るところ</strong><span>{step.nextHint}</span></div></div></section><section className="card visual-card"><p className="step-label">ビジュアル補助</p><h2>{step.visualTitle}</h2><Visual visual={step.visual} /></section></main>;
}

createRoot(document.getElementById('root')).render(<App />);
