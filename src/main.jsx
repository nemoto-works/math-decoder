import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const problems = [
  { id: '156-12', label: '156 ÷ 12', level: '3桁÷2桁', divisor: 12, dividend: '156', answer: '13', firstTarget: '15', firstQ: '1', firstProduct: '12', firstRemainder: '3', secondTarget: '36', secondQ: '3', secondProduct: '36' },
  { id: '168-12', label: '168 ÷ 12', level: '3桁÷2桁 応用', divisor: 12, dividend: '168', answer: '14', firstTarget: '16', firstQ: '1', firstProduct: '12', firstRemainder: '4', secondTarget: '48', secondQ: '4', secondProduct: '48' },
  { id: '1152-24', label: '1152 ÷ 24', level: '4桁÷2桁', divisor: 24, dividend: '1152', answer: '48', firstTarget: '115', firstQ: '4', firstProduct: '96', firstRemainder: '19', secondTarget: '192', secondQ: '8', secondProduct: '192', estimate: { nearDivisor: '25', nearProduct: '100', tooMuchQ: '5', tooMuchProduct: '120' } },
];

const cx = (...classes) => classes.filter(Boolean).join(' ');
const toNumber = (value) => Number(value);
const options = (items) => items.map(([value, label, message]) => ({ value: String(value), label, message }));
const firstEnd = (problem) => problem.firstTarget.length - 1;
const digitFocusRange = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => `d${from + index}`);
const xPositions = (problem) => problem.dividend.length === 4 ? [104, 150, 196, 242] : [132, 184, 236];
const digitCoords = (problem, value, endIndex) => {
  const xs = xPositions(problem);
  const start = endIndex - value.length + 1;
  return value.split('').map((digit, index) => ({ digit, x: xs[start + index] }));
};
const secondStart = (problem) => firstEnd(problem) - problem.firstRemainder.length + 1;
const baseState = { q1: '', q2: '', show1: false, showR: false, show2: false, showP2: false, show0: false };

function makeStep(overrides) {
  return { ...baseState, focus: [], preview: [], check: null, ...overrides };
}

function stepsFor(problem) {
  const digits = problem.dividend.split('');
  const end = firstEnd(problem);
  const downDigit = digits[end + 1];
  const firstFocus = digitFocusRange(0, end);
  const secondFocus = [...problem.firstRemainder.split('').map((_, index) => `r${index}`), `d${end + 1}`];
  const secondLow = String(Math.max(1, toNumber(problem.secondQ) - 1));
  const secondHigh = String(toNumber(problem.secondQ) + 1);

  const steps = [
    makeStep({
      label: '見る',
      title: `まず「${problem.firstTarget}」を見る`,
      focus: firstFocus,
      preview: ['q1'],
      explanation: `${problem.divisor}が入る、左から一番小さいまとまりを探します。${digits[0]}だけでは${problem.divisor}より小さいので、${problem.firstTarget}を見ます。`,
      nextHint: `次は、${problem.firstTarget}の中に${problem.divisor}が何回入るかを考えます。`,
      visualTitle: `${problem.firstTarget}の中に${problem.divisor}は何回入る？`,
      visual: { type: 'blocks', total: toNumber(problem.firstTarget), group: problem.divisor, remainder: toNumber(problem.firstRemainder), note: `${problem.divisor}が${problem.firstQ}回入って、${problem.firstRemainder}が残ります。` },
      check: { question: '最初に見るのはどこ？', answer: problem.firstTarget, options: options([[digits[0], `${digits[0]}だけ`, `${digits[0]}だけだと${problem.divisor}より小さいので、まだ割れません。`], [problem.firstTarget, problem.firstTarget, `正解。${problem.divisor}が入る最小のまとまりです。`], [problem.dividend, `${problem.dividend}全部`, '全部を一気に見なくても大丈夫です。']]) },
    }),
  ];

  if (problem.estimate) {
    steps.push(
      makeStep({
        label: 'あたり',
        title: `${problem.divisor}はだいたい${problem.estimate.nearDivisor}と見る`,
        focus: firstFocus,
        preview: ['q1'],
        explanation: `いきなり${problem.firstQ}を当てなくて大丈夫です。${problem.divisor}をだいたい${problem.estimate.nearDivisor}として見ると、考えやすくなります。`,
        nextHint: `次は、${problem.estimate.nearDivisor}×${problem.firstQ}を確かめます。`,
        visualTitle: 'あたりのつけ方',
        visual: { type: 'estimate', problem },
        check: { question: `${problem.divisor}は、だいたい何として見る？`, answer: problem.estimate.nearDivisor, options: options([['20', '20', '小さく見すぎです。'], [problem.estimate.nearDivisor, problem.estimate.nearDivisor, `正解。${problem.divisor}はだいたい${problem.estimate.nearDivisor}として見ます。`], ['30', '30', '少し大きく見すぎです。']]) },
      }),
      makeStep({
        label: 'あたり',
        title: `${problem.estimate.nearDivisor}×${problem.firstQ}=${problem.estimate.nearProduct} を確かめる`,
        focus: firstFocus,
        preview: ['q1'],
        explanation: `${problem.estimate.nearDivisor}を${problem.firstQ}回ぶんにすると${problem.estimate.nearProduct}です。${problem.firstTarget}に近いので、${problem.firstQ}回くらい入りそうです。`,
        nextHint: `次は、${problem.estimate.tooMuchQ}回だと大きすぎることを確かめます。`,
        visualTitle: `${problem.estimate.nearDivisor}×${problem.firstQ}を使って考える`,
        visual: { type: 'estimate', problem },
        check: { question: `${problem.estimate.nearDivisor}×${problem.firstQ} はいくつ？`, answer: problem.estimate.nearProduct, options: options([['75', '75', 'もう少し大きいです。'], [problem.estimate.nearProduct, problem.estimate.nearProduct, `正解。${problem.estimate.nearDivisor}×${problem.firstQ}=${problem.estimate.nearProduct}です。`], ['125', '125', '大きすぎます。']]) },
      }),
      makeStep({
        label: 'あたり',
        title: `${problem.divisor}×${problem.estimate.tooMuchQ}=${problem.estimate.tooMuchProduct} は大きすぎる`,
        focus: firstFocus,
        preview: ['q1'],
        explanation: `${problem.divisor}が${problem.estimate.tooMuchQ}回入ると${problem.estimate.tooMuchProduct}です。${problem.firstTarget}より大きいので、${problem.estimate.tooMuchQ}回は入りません。だから${problem.firstQ}回です。`,
        nextHint: `次は、${problem.firstQ}回入ったことを上に書きます。`,
        visualTitle: '大きすぎる候補を消す',
        visual: { type: 'estimate', problem },
        check: { question: `${problem.estimate.tooMuchProduct} は ${problem.firstTarget} を超える？`, answer: 'yes', options: options([['yes', '超える', `正解。${problem.estimate.tooMuchProduct}は${problem.firstTarget}より大きいです。`], ['no', '超えない', 'もう一度比べてみましょう。'], ['same', '同じ', '同じではありません。']]) },
      })
    );
  }

  steps.push(
    makeStep({
      label: 'たてる',
      title: `${problem.firstQ}回入るので「${problem.firstQ}」を上に書く`,
      focus: ['q1'],
      preview: ['p1a'],
      q1: problem.firstQ,
      explanation: `${problem.firstTarget}の中に${problem.divisor}は${problem.firstQ}回入ります。だから、${digits[end]}の上に${problem.firstQ}を書きます。`,
      nextHint: `次は、入った分の${problem.firstProduct}を書きます。`,
      visualTitle: `${problem.firstQ}回ぶんを上に記録する`,
      visual: { type: 'simple', note: '上に書く数字は、まずは「何回入ったか」です。' },
      check: { question: `${problem.firstTarget}の中に${problem.divisor}は何回入る？`, answer: problem.firstQ, options: options([['0', '0回', 'まだ入ります。0回ではありません。'], [problem.firstQ, `${problem.firstQ}回`, `正解。${problem.divisor}が${problem.firstQ}回入ります。`], [String(toNumber(problem.firstQ) + 1), `${toNumber(problem.firstQ) + 1}回`, `${problem.divisor}×${toNumber(problem.firstQ) + 1}=${problem.divisor * (toNumber(problem.firstQ) + 1)}で、大きすぎます。`]]) },
    }),
    makeStep({
      label: 'かける',
      title: `${problem.firstQ} × ${problem.divisor} = ${problem.firstProduct} を書く`,
      focus: ['p1a', 'p1b', 'p1c'],
      preview: ['r0'],
      q1: problem.firstQ,
      show1: true,
      explanation: `${problem.firstQ}回入ったので、入った分の${problem.firstProduct}を書きます。これは後で引くためです。`,
      nextHint: `次は、${problem.firstTarget}から${problem.firstProduct}を引いて残りを見ます。`,
      visualTitle: '入った分を見えるようにする',
      visual: { type: 'simple', note: `${problem.divisor}×${problem.firstQ}=${problem.firstProduct}。この${problem.firstProduct}を下に書きます。` },
      check: { question: `${problem.firstQ}回入った分はいくつ？`, answer: problem.firstProduct, options: options([[problem.firstQ, problem.firstQ, `${problem.firstQ}は回数です。入った分ではありません。`], [problem.firstProduct, problem.firstProduct, `正解。${problem.divisor}×${problem.firstQ}=${problem.firstProduct}です。`], [problem.firstTarget, problem.firstTarget, `${problem.firstTarget}は今見ているまとまりです。`]]) },
    }),
    makeStep({
      label: 'ひく',
      title: `${problem.firstTarget} − ${problem.firstProduct} = ${problem.firstRemainder}`,
      focus: problem.firstRemainder.split('').map((_, index) => `r${index}`),
      preview: [`d${end + 1}`],
      q1: problem.firstQ,
      show1: true,
      showR: true,
      explanation: `${problem.firstTarget}から、入った分の${problem.firstProduct}を引きます。残りは${problem.firstRemainder}です。`,
      nextHint: `次は、まだ使っていない${downDigit}を見ます。`,
      visualTitle: `残りは${problem.firstRemainder}`,
      visual: { type: 'simple', note: `残った${problem.firstRemainder}は、次の数字${downDigit}と組み合わせます。` },
      check: { question: `この「${problem.firstRemainder}」はどうする？`, answer: 'combine', options: options([['answer', '答えにする', `まだ右に${downDigit}が残っています。ここでは答えにしません。`], ['combine', `次の${downDigit}と合わせる`, `正解。${problem.firstRemainder}と${downDigit}を合わせて${problem.secondTarget}にします。`], ['ignore', '使わない', `${problem.firstRemainder}は次に使います。`]]) },
    }),
    makeStep({
      label: 'おろす',
      title: `余り${problem.firstRemainder}と${downDigit}を合わせて、${problem.secondTarget}を見る`,
      focus: secondFocus,
      preview: ['q2'],
      q1: problem.firstQ,
      show1: true,
      show2: true,
      explanation: `「${downDigit}を下ろす」は、余り${problem.firstRemainder}と次の数字${downDigit}を合わせて${problem.secondTarget}という新しいまとまりを作ることです。`,
      nextHint: `次は、${problem.secondTarget}の中に${problem.divisor}が何回入るかを考えます。`,
      visualTitle: `${problem.firstRemainder} + ${downDigit} → ${problem.secondTarget}`,
      visual: { type: 'combine', left: problem.firstRemainder, right: downDigit, result: problem.secondTarget, note: `足し算ではなく、${problem.firstRemainder}の右に${downDigit}をつけて${problem.secondTarget}として見ます。` },
      check: { question: `${problem.firstRemainder}と${downDigit}を合わせると？`, answer: problem.secondTarget, options: options([[String(toNumber(problem.firstRemainder) + toNumber(downDigit)), String(toNumber(problem.firstRemainder) + toNumber(downDigit)), '足し算ではありません。右に数字をつけます。'], [problem.secondTarget, problem.secondTarget, `正解。次に見るまとまりは${problem.secondTarget}です。`], [downDigit, downDigit, `${downDigit}だけではなく、残り${problem.firstRemainder}と合わせます。`]]) },
    }),
    makeStep({
      label: '見る',
      title: `${problem.secondTarget}の中に${problem.divisor}は何回入る？`,
      focus: secondFocus,
      preview: ['q2'],
      q1: problem.firstQ,
      show1: true,
      show2: true,
      explanation: `ここで止まって考えます。${problem.divisor}×${secondLow}=${problem.divisor * toNumber(secondLow)}、${problem.divisor}×${problem.secondQ}=${problem.secondTarget}。だから${problem.secondTarget}の中に${problem.divisor}は${problem.secondQ}回入ります。`,
      nextHint: `次は、${problem.secondQ}回入ったことを上に書きます。`,
      visualTitle: `${problem.secondTarget}を${problem.divisor}ずつ分ける`,
      visual: { type: 'groups', total: toNumber(problem.secondTarget), group: problem.divisor, count: toNumber(problem.secondQ), note: `${problem.divisor}が${problem.secondQ}回入ります。かけ算で確かめます。` },
      check: { question: `${problem.secondTarget}の中に${problem.divisor}は何回入る？`, answer: problem.secondQ, options: options([[secondLow, `${secondLow}回`, `${problem.divisor}×${secondLow}=${problem.divisor * toNumber(secondLow)}。まだ足りません。`], [problem.secondQ, `${problem.secondQ}回`, `正解。${problem.divisor}×${problem.secondQ}=${problem.secondTarget}です。`], [secondHigh, `${secondHigh}回`, `${problem.divisor}×${secondHigh}=${problem.divisor * toNumber(secondHigh)}。超えてしまいます。`]]) },
    }),
    makeStep({
      label: 'たてる',
      title: `${problem.secondQ}回入るので「${problem.secondQ}」を上に書く`,
      focus: ['q2'],
      preview: ['p2a'],
      q1: problem.firstQ,
      q2: problem.secondQ,
      show1: true,
      show2: true,
      explanation: `${problem.secondTarget}の中に${problem.divisor}は${problem.secondQ}回入るので、${downDigit}の上に${problem.secondQ}を書きます。`,
      nextHint: `最後に、入った分の${problem.secondProduct}を書いて引きます。`,
      visualTitle: `${problem.secondQ}回ぶんを上に記録する`,
      visual: { type: 'simple', note: `ここまでで答えの形が${problem.answer}になります。` },
      check: { question: `${downDigit}の上に書く数字は？`, answer: problem.secondQ, options: options([[problem.firstQ, problem.firstQ, `${problem.firstQ}は最初の${problem.firstTarget}に入った回数です。`], [problem.secondQ, problem.secondQ, `正解。${problem.secondTarget}に${problem.divisor}が${problem.secondQ}回入ります。`], [downDigit, downDigit, `${downDigit}は下ろした数字です。上に書くのは回数です。`]]) },
    }),
    makeStep({
      label: '完成',
      title: `${problem.dividend} ÷ ${problem.divisor} = ${problem.answer}`,
      focus: ['q1', 'q2'],
      q1: problem.firstQ,
      q2: problem.secondQ,
      show1: true,
      show2: true,
      showP2: true,
      show0: true,
      explanation: `${problem.divisor}が${problem.firstQ}回、次に${problem.secondQ}回入りました。答えは${problem.answer}です。`,
      nextHint: '筆算は、見る場所を決めることから始まります。',
      visualTitle: '筆算の流れ',
      visual: { type: 'flow', note: '見る → たてる → かける → ひく → おろす。筆算はこのくり返しです。' },
    })
  );

  return steps;
}

function SvgDigit({ id, x, y, children, step }) {
  const active = step.focus.includes(id);
  const preview = step.preview.includes(id);
  return <g className={cx(preview && 'svg-preview', active && 'svg-spotlight')}>{(active || preview) && <rect x={x - 18} y={y - 34} width="36" height="42" rx="8" />}<text x={x} y={y}>{children}</text></g>;
}

function LongDivision({ step, problem }) {
  const xs = xPositions(problem);
  const end = firstEnd(problem);
  const sStart = secondStart(problem);
  const bandX = xs[0] - 21;
  const bandW = xs[end] - xs[0] + 42;
  return <div className="spotlight-stage"><svg className="division-svg" viewBox="0 0 320 340" role="img" aria-label={`${problem.label} の筆算`}>
    {step.focus[0] === 'd0' && step.focus.includes(`d${end}`) && <rect className="target-band" x={bandX} y="94" width={bandW} height="48" rx="12" />}
    <line className="division-line" x1="102" y1="78" x2="274" y2="78" />
    <path className="division-line no-fill" d="M94 82 C108 112 108 138 94 168" />
    <SvgDigit id="q1" x={xs[end]} y="54" step={step}>{step.q1}</SvgDigit>
    <SvgDigit id="q2" x={xs[end + 1]} y="54" step={step}>{step.q2}</SvgDigit>
    <text className="svg-digit divisor-svg" x="76" y="130">{problem.divisor}</text>
    {problem.dividend.split('').map((digit, index) => <SvgDigit key={index} id={`d${index}`} x={xs[index]} y="130" step={step}>{digit}</SvgDigit>)}
    {step.show1 && <>{digitCoords(problem, problem.firstProduct, end).map((coord, index) => <SvgDigit key={index} id={`p1${String.fromCharCode(97 + index)}`} x={coord.x} y="178" step={step}>{coord.digit}</SvgDigit>)}<line className="division-line" x1={xs[end - problem.firstProduct.length + 1] - 18} y1="193" x2={xs[end] + 20} y2="193" /></>}
    {step.showR && digitCoords(problem, problem.firstRemainder, end).map((coord, index) => <SvgDigit key={index} id={`r${index}`} x={coord.x} y="232" step={step}>{coord.digit}</SvgDigit>)}
    {step.show2 && problem.secondTarget.split('').map((digit, index) => <SvgDigit key={index} id={index < problem.firstRemainder.length ? `r${index}` : `d${end + 1}`} x={xs[sStart + index]} y="232" step={step}>{digit}</SvgDigit>)}
    {step.showP2 && <>{problem.secondProduct.split('').map((digit, index) => <SvgDigit key={index} id={`p2${String.fromCharCode(97 + index)}`} x={xs[sStart + index]} y="278" step={step}>{digit}</SvgDigit>)}<line className="division-line" x1={xs[sStart] - 18} y1="293" x2={xs[xs.length - 1] + 20} y2="293" /></>}
    {step.show0 && <SvgDigit id="z0" x={xs[xs.length - 1]} y="326" step={step}>0</SvgDigit>}
  </svg></div>;
}

function Blocks({ total, group, remainder, count }) {
  if (total > 72) return <div className="times-list">{Array.from({ length: count ?? Math.floor(total / group) }).map((_, index) => <span key={index}>{group}×{index + 1}={group * (index + 1)}</span>)}</div>;
  const groups = count ?? Math.floor(total / group);
  const remain = remainder ?? total % group;
  return <div className="blocks">{Array.from({ length: groups }).map((_, groupIndex) => <div className="block-group" key={groupIndex}>{Array.from({ length: group }).map((_, index) => <span className="block" key={index} />)}</div>)}{remain > 0 && <div className="block-group remainder-blocks">{Array.from({ length: remain }).map((_, index) => <span className="block" key={index} />)}</div>}</div>;
}

function Visual({ visual }) {
  if (visual.type === 'estimate') {
    const problem = visual.problem;
    return <div className="estimate-hint-card in-flow"><div className="estimate-steps"><div><strong>{problem.divisor}</strong><span>は、だいたい</span><strong>{problem.estimate.nearDivisor}</strong></div><div><strong>{problem.estimate.nearDivisor} × {problem.firstQ} = {problem.estimate.nearProduct}</strong><span>{problem.firstQ}回くらい入りそう</span></div><div><strong>{problem.divisor} × {problem.estimate.tooMuchQ} = {problem.estimate.tooMuchProduct}</strong><span>{problem.firstTarget}を超える</span></div><div className="estimate-answer"><strong>だから{problem.firstQ}回</strong></div></div></div>;
  }
  if (visual.type === 'blocks') return <><Blocks total={visual.total} group={visual.group} remainder={visual.remainder} /><p>{visual.note}</p></>;
  if (visual.type === 'groups') return <><Blocks total={visual.total} group={visual.group} count={visual.count} /><p>{visual.note}</p></>;
  if (visual.type === 'combine') return <><div className="combine strong-combine"><span>{visual.left}</span><span>＋</span><span>{visual.right}</span><span>→</span><strong>{visual.result}</strong></div><p>{visual.note}</p></>;
  if (visual.type === 'flow') return <><div className="flow"><span>見る</span><span>たてる</span><span>かける</span><span>ひく</span><span>おろす</span></div><p>{visual.note}</p></>;
  return <p>{visual.note}</p>;
}

function CheckCard({ check, choice, onChoice }) {
  if (!check) return null;
  const selected = check.options.find((option) => option.value === choice);
  const ok = choice === check.answer;
  return <section className="check-card"><p className="step-label">確認してから次へ</p><h3>{check.question}</h3><div className="check-options">{check.options.map((option) => <button key={option.value} type="button" className={cx('check-option', choice === option.value && (ok ? 'correct' : 'wrong'))} onClick={() => onChoice(option.value)}>{option.label}</button>)}</div>{selected && <p className={cx('check-message', ok ? 'correct-text' : 'hint-text')}>{selected.message}</p>}</section>;
}

function ProblemSelector({ currentProblemId, onSelect }) {
  return <section className="problem-selector"><p className="step-label">問題を選ぶ</p><div className="problem-options">{problems.map((problem) => <button key={problem.id} type="button" className={cx('problem-option', currentProblemId === problem.id && 'selected')} onClick={() => onSelect(problem.id)}><strong>{problem.label}</strong><span>{problem.level}</span></button>)}</div><p className="coming-soon">次に追加予定：84÷3 / 5桁÷2桁</p></section>;
}

function App() {
  const [problemId, setProblemId] = useState(problems[0].id);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const problem = problems.find((item) => item.id === problemId) ?? problems[0];
  const steps = useMemo(() => stepsFor(problem), [problem]);
  const step = steps[index];
  const key = `${problem.id}-${index}`;
  const choice = choices[key];
  const canGoNext = !step.check || choice === step.check.answer;
  const progress = Math.round(((index + 1) / steps.length) * 100);

  function selectProblem(id) {
    setProblemId(id);
    setIndex(0);
  }

  return <main className="app"><header className="hero"><p className="eyebrow">算数デコーダー MVP</p><h1>見えない考え方を、見える形に。</h1><p>筆算で「いま、どこを見るのか」をスポットライトで示します。</p></header><ProblemSelector currentProblemId={problem.id} onSelect={selectProblem} /><section className="card lesson-card"><div className="lesson-head"><div><p className="step-label">{problem.label} ・ STEP {index + 1} / {steps.length} ・ {step.label}</p><h2>{step.title}</h2></div><div className="progress"><span style={{ width: `${progress}%` }} /></div></div><div className="paper-panel"><LongDivision step={step} problem={problem} /></div><nav className="actions"><button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>前へ</button><button type="button" className="primary" onClick={() => canGoNext && setIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={index === steps.length - 1 || !canGoNext}>次へ</button><button type="button" onClick={() => setIndex(0)}>最初から</button></nav><CheckCard check={step.check} choice={choice} onChoice={(value) => setChoices((previous) => ({ ...previous, [key]: value }))} /><div className="explain-panel"><h3>いま考えること</h3><p>{step.explanation}</p><div className="next-hint"><strong>次に見るところ</strong><span>{step.nextHint}</span></div></div></section><section className="card visual-card"><p className="step-label">ビジュアル補助</p><h2>{step.visualTitle}</h2><Visual visual={step.visual} /></section></main>;
}

createRoot(document.getElementById('root')).render(<App />);
