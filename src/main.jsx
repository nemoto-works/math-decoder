import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './estimate-hint.css';

const problems = [
  { id: '156-12', label: '156 ÷ 12', level: '3桁÷2桁', divisor: 12, dividend: '156', answer: '13', firstTarget: '15', firstQ: '1', firstProduct: '12', firstRemainder: '3', secondTarget: '36', secondQ: '3', secondProduct: '36' },
  { id: '168-12', label: '168 ÷ 12', level: '3桁÷2桁 応用', divisor: 12, dividend: '168', answer: '14', firstTarget: '16', firstQ: '1', firstProduct: '12', firstRemainder: '4', secondTarget: '48', secondQ: '4', secondProduct: '48' },
  { id: '180-15', label: '180 ÷ 15', level: '3桁÷2桁 応用', divisor: 15, dividend: '180', answer: '12', firstTarget: '18', firstQ: '1', firstProduct: '15', firstRemainder: '3', secondTarget: '30', secondQ: '2', secondProduct: '30' },
  { id: '1152-24', label: '1152 ÷ 24', level: '4桁÷2桁', divisor: 24, dividend: '1152', answer: '48', firstTarget: '115', firstQ: '4', firstProduct: '96', firstRemainder: '19', secondTarget: '192', secondQ: '8', secondProduct: '192' },
  { id: '10368-24', label: '10368 ÷ 24', level: '5桁÷2桁', divisor: 24, dividend: '10368' },
];

const cx = (...classes) => classes.filter(Boolean).join(' ');
const toNumber = (value) => Number(value);
const options = (items) => items.map(([value, label, message]) => ({ value: String(value), label, message }));
const firstEnd = (problem) => problem.firstTarget.length - 1;
const digitFocusRange = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => `d${from + index}`);
const xPositions = (problem) => problem.dividend.length === 4 ? [104, 150, 196, 242] : [132, 184, 236];
const cycleLabels = ['見る', 'たてる', 'かける', 'ひく', 'おろす'];
const cycleLabelFor = (label) => cycleLabels.includes(label) ? label : label === 'あたり' ? '見る' : label === '完成' ? 'ひく' : '見る';
const digitCoords = (problem, value, endIndex) => {
  const xs = xPositions(problem);
  const start = endIndex - value.length + 1;
  return value.split('').map((digit, index) => ({ digit, x: xs[start + index] }));
};
const secondStart = (problem) => firstEnd(problem) - problem.firstRemainder.length + 1;
const baseState = { q1: '', q2: '', show1: false, showR: false, show2: false, showP2: false, show0: false };

const validateDivisionInput = (dividend, divisor) => {
  if (!/^\d+$/.test(dividend) || !/^\d+$/.test(divisor)) return '整数だけを入力してください。';
  if (dividend.length < 3 || dividend.length > 5) return '割られる数は3〜5桁で入力してください。';
  if (Number(divisor) === 0) return '0では割れません。';
  if (divisor.length !== 2 || Number(divisor) < 10) return '割る数は2桁で入力してください。';
  if (Number(dividend) < Number(divisor)) return '割られる数は割る数以上にしてください。';
  return '';
};

function buildDivisionProblem(dividendText, divisorText) {
  const error = validateDivisionInput(dividendText, divisorText);
  if (error) return { error };
  const digits = dividendText.split('').map(Number);
  const divisor = Number(divisorText);
  const rows = [];
  let remainder = 0;
  let quotient = '';
  let started = false;

  digits.forEach((digit, index) => {
    const target = remainder * 10 + digit;
    if (!started && target < divisor && index < digits.length - 1) {
      remainder = target;
      return;
    }
    started = true;
    const q = Math.floor(target / divisor);
    const product = q * divisor;
    const nextRemainder = target - product;
    quotient += String(q);
    rows.push({ digitIndex: index, target: String(target), q: String(q), product: String(product), remainder: String(nextRemainder), downDigit: dividendText[index + 1] ?? '' });
    remainder = nextRemainder;
  });

  return {
    id: `${dividendText}-${divisorText}`,
    label: `${dividendText} ÷ ${divisorText}`,
    level: `${dividendText.length}桁÷${divisorText.length}桁`,
    dividend: dividendText,
    divisor,
    answer: remainder ? `${Number(quotient)} あまり ${remainder}` : String(Number(quotient)),
    quotient: String(Number(quotient)),
    remainder: String(remainder),
    rows,
  };
}

const rowFocus = (row, prefix) => String(row[prefix]).split('').map((_, index) => `${prefix}-${row.digitIndex}-${index}`);
const targetFocus = (row) => digitFocusRange(Math.max(0, row.digitIndex - row.target.length + 1), row.digitIndex);
const quotientSoFar = (problem, rowIndex) => problem.rows.slice(0, rowIndex + 1).map((row) => row.q).join('');


const roundDivisorForEstimate = (divisor) => {
  if (divisor < 10) return divisor;
  const unit = divisor < 100 ? 5 : 10;
  return Math.max(unit, Math.round(divisor / unit) * unit);
};

function buildEstimateComparison({ divisor, target }) {
  const nearDivisor = roundDivisorForEstimate(Number(divisor));
  const targetNumber = Number(target);
  const safeCount = Math.max(0, Math.floor(targetNumber / nearDivisor));
  const overCount = safeCount + 1;
  return {
    divisor: Number(divisor),
    target: targetNumber,
    nearDivisor,
    safeCount,
    safeProduct: nearDivisor * safeCount,
    overCount,
    overProduct: nearDivisor * overCount,
  };
}

function EstimateComparisonCard({ divisor, target }) {
  const estimate = buildEstimateComparison({ divisor, target });
  return <section className="estimate-hint-card in-flow" aria-label="あたりの比較カード">
    <p className="step-label">あたりをくらべる</p>
    <h3>{estimate.target}を超えない回数を探そう</h3>
    <div className="estimate-steps">
      <div className="estimate-near"><strong>{estimate.divisor}≒{estimate.nearDivisor}</strong><span>{estimate.divisor}を近い数にして、暗算しやすくします。</span></div>
      <div className="estimate-row safe"><strong>{estimate.nearDivisor}×{estimate.safeCount}={estimate.safeProduct}</strong><span>← まだ{estimate.target}を超えていない</span></div>
      <div className="estimate-row over"><strong>{estimate.nearDivisor}×{estimate.overCount}={estimate.overProduct}</strong><span>← {estimate.target}を超えている</span></div>
      <div className="estimate-answer"><strong>だから{estimate.safeCount}回</strong><span>大きくなりすぎる1つ前を選びます。</span></div>
    </div>
  </section>;
}


function makeStep(overrides) {
  return { ...baseState, focus: [], preview: [], check: null, ...overrides };
}

function stepsFor(problem) {
  return problem.rows.flatMap((row, rowIndex) => {
    const focus = targetFocus(row);
    const estimate = buildEstimateComparison({ divisor: problem.divisor, target: row.target });
    const qSoFar = quotientSoFar(problem, rowIndex);
    const isLast = rowIndex === problem.rows.length - 1;
    const nextTarget = !isLast ? problem.rows[rowIndex + 1].target : '';
    const low = String(Math.max(0, Number(row.q) - 1));
    const high = String(Number(row.q) + 1);
    const previousQ = problem.rows.slice(0, rowIndex).map((item) => item.q).join('');
    const common = { rowIndex, qSoFar };
    const beforeQuotientStep = { rowIndex, qSoFar: previousQ };
    return [
      makeStep({ ...beforeQuotientStep, label: '見る', title: `「${row.target}」を見る`, focus, explanation: `${problem.divisor}が入る、左から一番小さいまとまりを見ます。ここでは${row.target}を見ます。`, nextHint: `次は、${row.target}の中に${problem.divisor}が何回入るかを考えます。`, visualTitle: `${row.target}の中に${problem.divisor}は何回入る？`, visual: { type: 'simple', note: `まずは${row.target}だけを見ます。かける・ひくの結果は次のステップで確認します。` }, check: { question: 'いま見るまとまりは？', answer: row.target, options: options([[problem.dividend[row.digitIndex], `${problem.dividend[row.digitIndex]}だけ`, '一つの数字だけとは限りません。'], [row.target, row.target, '正解。いま割るまとまりです。'], [problem.dividend, `${problem.dividend}全部`, '全部を一気に見なくても大丈夫です。']]) } }),
      makeStep({ ...beforeQuotientStep, label: 'あたり', title: `${problem.divisor}をだいたい${estimate.nearDivisor}として比べる`, focus, explanation: `${problem.divisor}をだいたい${estimate.nearDivisor}として見ると、${estimate.nearDivisor}×${estimate.safeCount}=${estimate.safeProduct}、${estimate.nearDivisor}×${estimate.overCount}=${estimate.overProduct}です。大きくなりすぎない回数を選びます。`, nextHint: `次は、正しい回数を上に書きます。`, visualTitle: 'あたりの比較', visual: { type: 'estimate', divisor: problem.divisor, target: row.target }, check: { question: `${row.target}を超えない最大の回数は？`, answer: row.q, options: options([[low, `${low}回`, `${problem.divisor}×${low}=${problem.divisor * Number(low)}。まだ増やせるか確認しましょう。`], [row.q, `${row.q}回`, `正解。${problem.divisor}×${row.q}=${row.product}です。`], [high, `${high}回`, `${problem.divisor}×${high}=${problem.divisor * Number(high)}で大きすぎます。`]]) } }),
      makeStep({ ...common, label: 'たてる', title: `${row.q}回入るので「${row.q}」を上に書く`, focus: [`q${row.digitIndex}`], preview: rowFocus(row, 'product'), explanation: `${row.target}の中に${problem.divisor}は${row.q}回入ります。だから、見ているまとまりの一番右の数字の上に${row.q}を書きます。`, nextHint: `次は、入った分の${row.product}を書きます。`, visualTitle: `${row.q}回ぶんを上に記録する`, visual: { type: 'simple', note: `答えはここまでで${qSoFar}です。` }, check: { question: `上に書く数字は？`, answer: row.q, options: options([[low, low], [row.q, row.q, '正解。'], [high, high]]) } }),
      makeStep({ ...common, label: 'かける', title: `${row.q} × ${problem.divisor} = ${row.product} を書く`, focus: rowFocus(row, 'product'), explanation: `入った分の${row.product}を書きます。これは次に引くためです。`, nextHint: `次は、${row.target}から${row.product}を引きます。`, visualTitle: '入った分を見えるようにする', visual: { type: 'simple', note: `${problem.divisor}×${row.q}=${row.product}` }, check: { question: `${row.q}回入った分はいくつ？`, answer: row.product, options: options([[row.q, row.q], [row.product, row.product, '正解。'], [row.target, row.target]]) } }),
      makeStep({ ...common, label: 'ひく', title: `${row.target} − ${row.product} = ${row.remainder}`, focus: rowFocus(row, 'remainder'), explanation: `${row.target}から、入った分の${row.product}を引きます。残りは${row.remainder}です。`, nextHint: isLast ? 'これで最後まで計算できました。' : `次は、まだ使っていない${row.downDigit}をおろします。`, visualTitle: `残りは${row.remainder}`, visual: { type: 'simple', note: isLast ? `最終的な余りは${row.remainder}です。` : `残った${row.remainder}は、次の数字${row.downDigit}と組み合わせます。` }, check: isLast ? undefined : { question: `次におろす数字は？`, answer: row.downDigit, options: options([[problem.dividend[row.digitIndex], problem.dividend[row.digitIndex]], [row.downDigit, row.downDigit, '正解。'], [row.remainder, row.remainder]]) } }),
      ...(!isLast ? [makeStep({ ...common, rowIndex: rowIndex + 1, label: 'おろす', title: `余り${row.remainder}と${row.downDigit}を合わせて、${nextTarget}を見る`, focus: targetFocus(problem.rows[rowIndex + 1]), explanation: `「${row.downDigit}を下ろす」は、余り${row.remainder}の右に次の数字をつけて${nextTarget}という新しいまとまりを作ることです。`, nextHint: `次は、${nextTarget}の中に${problem.divisor}が何回入るかを考えます。`, visualTitle: `${row.remainder} + ${row.downDigit} → ${nextTarget}`, visual: { type: 'combine', left: row.remainder, right: row.downDigit, result: nextTarget, note: '足し算ではなく、右に数字をつけます。' } })] : [makeStep({ ...common, label: '完成', title: `${problem.dividend} ÷ ${problem.divisor} = ${problem.answer}`, focus: problem.rows.map((item) => `q${item.digitIndex}`), explanation: `答えは${problem.answer}です。`, nextHint: '別の問題も入力して試してみましょう。', visualTitle: '筆算の流れ', visual: { type: 'flow', note: '見る → あたり → たてる → かける → ひく → おろす。筆算はこのくり返しです。' } })]),
    ];
  });
}

function CycleBar({ active }) {
  return <div className="cycle-bar" aria-label="筆算のサイクル">{cycleLabels.map((label) => <span key={label} className={cx('cycle-step', label === active ? 'active' : 'dimmed')} aria-current={label === active ? 'step' : undefined}>{label}</span>)}</div>;
}

function MultiplicationCard({ divisor, currentQ, target }) {
  const activeQ = Number(currentQ);
  return <section className="times-finder-card" aria-label={`${divisor}の段カード`}>
    <p className="step-label">{divisor}の段で探す</p>
    <h3>{target ? `${target}は${divisor}の何回ぶん？` : `${divisor}の段カード`}</h3>
    <div className="times-finder-list">
      {Array.from({ length: 9 }, (_, index) => {
        const q = index + 1;
        const product = divisor * q;
        const active = q === activeQ;
        return <div key={q} className={cx(active && 'times-finder-answer')} aria-current={active ? 'true' : undefined}>
          <strong>{divisor}×{q}={product}</strong>
          <span>{active ? `いまの候補。だから${q}回` : target ? (product < Number(target) ? 'まだ足りない' : product > Number(target) ? '大きすぎる' : `ぴったり。だから${q}回`) : '候補'}</span>
        </div>;
      })}
    </div>
  </section>;
}

const fiveSteps = [
  { label: '見る', t: 'まず103を見る', q: '', f: ['d0', 'd1', 'd2'], rows: [], ask: '最初に見るのは？', a: '103', c: ['10', '103', '10368'], note: '10だけでは24より小さいので、103を見ます。24≒25、25×4=100なので4回くらいです。' },
  { label: 'たてる', t: '103の中に24は4回', q: '4', f: ['q0'], rows: ['96'], ask: '24×4はいくつ？', a: '96', c: ['72', '96', '120'], note: '24×4=96。24×5=120は103を超えるので、4回です。' },
  { label: 'おろす', t: '103−96=7、6をおろして76', q: '4', f: ['row2-0', 'd3'], rows: ['96', '7', '76'], ask: '7と6を合わせると？', a: '76', c: ['13', '76', '6'], note: '足し算ではなく、7の右に6をつけて76として見ます。' },
  { label: 'かける', t: '76の中に24は3回', q: '43', f: ['q1'], rows: ['96', '7', '76', '72', '4'], ask: '24×3はいくつ？', a: '72', c: ['48', '72', '96'], note: '24×3=72。24×4=96は76を超えるので、3回です。' },
  { label: 'ひく', t: '48の中に24は2回、完成', q: '432', f: ['q2'], rows: ['96', '7', '76', '72', '4', '48', '48', '0'], ask: '答えは？', a: '432', c: ['423', '432', '442'], note: '同じ流れを3回くり返しました。10368÷24=432です。' },
];

function FiveSvgDigit({ id, x, y, value, step }) {
  const active = step.f.includes(id);
  const preview = id[0] === 'q' && value;
  return <g className={cx(active && 'spot', !active && preview && 'preview')}>{(active || preview) && <rect x={x - 17} y={y - 33} width="34" height="40" rx="8" />}<text x={x} y={y}>{value}</text></g>;
}

function FiveSvgRow({ value, y, end, rowIndex, step, xs }) {
  const start = end - value.length + 1;
  return value.split('').map((number, index) => <FiveSvgDigit key={`${rowIndex}-${index}`} id={`row${rowIndex}-${index}`} x={xs[start + index]} y={y} value={number} step={step} />);
}

function FiveSvg({ step }) {
  const xs = [116, 156, 196, 236, 276];
  const ys = [178, 224, 270, 316, 362, 408, 454, 500];
  const ends = [2, 2, 3, 3, 3, 4, 4, 4];
  return <svg className="five-lite-svg" viewBox="0 0 340 530" role="img" aria-label="10368 ÷ 24 の筆算"><line x1="104" y1="78" x2="304" y2="78" /><path d="M96 82 C110 112 110 138 96 168" /><text className="divisor" x="80" y="130">24</text>{['q0', 'q1', 'q2'].map((id, index) => <FiveSvgDigit key={id} id={id} x={xs[index + 2]} y="54" value={step.q[index] || ''} step={step} />)}{'10368'.split('').map((value, index) => <FiveSvgDigit key={index} id={`d${index}`} x={xs[index]} y="130" value={value} step={step} />)}{step.rows.map((rowValue, index) => <FiveSvgRow key={index} value={rowValue} y={ys[index]} end={ends[index]} rowIndex={index} step={step} xs={xs} />)}{step.rows.length >= 1 && <line x1="152" y1="194" x2="216" y2="194" />}{step.rows.length >= 4 && <line x1="152" y1="332" x2="256" y2="332" />}{step.rows.length >= 7 && <line x1="192" y1="470" x2="296" y2="470" />}</svg>;
}

function FiveDigitLesson({ onBack }) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const step = fiveSteps[index];
  const chosen = choices[index];
  const ok = chosen === step.a;
  return <main className="five-lite"><header className="hero"><p className="eyebrow">算数デコーダー 5桁</p><h1>10368 ÷ 24</h1><p>筆算は同じ考え方のくり返しです。</p></header><section className="five-lite-card"><p className="step-label">STEP {index + 1} / {fiveSteps.length} ・ {step.label}</p><CycleBar active={cycleLabelFor(step.label)} /><h2>{step.t}</h2><FiveSvg step={step} />{index === 0 && <EstimateComparisonCard divisor={24} target={103} />}<nav className="five-lite-actions"><button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>前へ</button><button type="button" className="primary" onClick={() => ok && setIndex((value) => Math.min(fiveSteps.length - 1, value + 1))} disabled={index === fiveSteps.length - 1 || !ok}>次へ</button><button type="button" onClick={() => { setChoices({}); setIndex(0); }}>最初から</button></nav><MultiplicationCard divisor={24} currentQ={step.q.slice(-1)} target={step.ask.includes('24×') ? step.a : undefined} /><section className="five-lite-check"><p className="step-label">確認してから次へ</p><h3>{step.ask}</h3><div className="five-lite-choices">{step.c.map((choice) => <button key={choice} type="button" className={cx('five-lite-choice', chosen === choice && (choice === step.a ? 'ok' : 'ng'))} onClick={() => setChoices((previous) => ({ ...previous, [index]: choice }))}>{choice}</button>)}</div>{chosen && <p>{ok ? '正解です。' : 'もう一度見てみましょう。'}</p>}</section><section className="five-lite-note"><h3>考え方</h3><p>{step.note}</p></section><button type="button" className="five-lite-back" onClick={onBack}>問題選択へ戻る</button></section></main>;
}

function SvgDigit({ id, x, y, children, step }) {
  const active = step.focus.includes(id);
  const preview = step.preview.includes(id);
  return <g className={cx(preview && 'svg-preview', active && 'svg-spotlight')}>{(active || preview) && <rect x={x - 18} y={y - 34} width="36" height="42" rx="8" />}<text x={x} y={y}>{children}</text></g>;
}

function LongDivision({ step, problem }) {
  const digitGap = 42;
  const leftPad = 78;
  const width = Math.max(320, leftPad + problem.dividend.length * digitGap + 48);
  const xs = problem.dividend.split('').map((_, index) => leftPad + index * digitGap);
  const rowY = (rowIndex, offset = 0) => 178 + rowIndex * 104 + offset;
  const height = Math.max(340, 220 + problem.rows.length * 104);
  const currentRowIndex = step.rowIndex ?? 0;
  const visibleRows = problem.rows.slice(0, currentRowIndex + 1);
  const visibleQuotient = step.qSoFar ?? '';
  const qStart = problem.rows[0]?.digitIndex - visibleQuotient.length + 1;
  const currentRowWork = step.label === 'かける' ? 'product' : step.label === 'ひく' || step.label === '完成' ? 'remainder' : 'none';
  const visibleWorkForRow = (rowIndex) => {
    if (rowIndex < currentRowIndex) return 'remainder';
    return currentRowWork;
  };
  return <div className="spotlight-stage"><svg className="division-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${problem.label} の筆算`}>
    <line className="division-line" x1={leftPad - 20} y1="78" x2={xs[xs.length - 1] + 34} y2="78" />
    <path className="division-line no-fill" d={`M${leftPad - 28} 82 C${leftPad - 14} 112 ${leftPad - 14} 138 ${leftPad - 28} 168`} />
    {visibleQuotient.split('').map((digit, index) => <SvgDigit key={`q-${index}`} id={`q${problem.rows[index]?.digitIndex ?? qStart + index}`} x={xs[qStart + index]} y="54" step={step}>{digit}</SvgDigit>)}
    <text className="svg-digit divisor-svg" x={leftPad - 46} y="130">{problem.divisor}</text>
    {problem.dividend.split('').map((digit, index) => <SvgDigit key={index} id={`d${index}`} x={xs[index]} y="130" step={step}>{digit}</SvgDigit>)}
    {visibleRows.map((row, index) => {
      const productStart = row.digitIndex - row.product.length + 1;
      const remStart = row.digitIndex - row.remainder.length + 1;
      const visibleWork = visibleWorkForRow(index);
      const showProduct = visibleWork === 'product' || visibleWork === 'remainder';
      const showRemainder = visibleWork === 'remainder';
      return <g key={`${row.digitIndex}-${index}`}>
        {showProduct && row.product.split('').map((digit, digitIndex) => <SvgDigit key={`p-${digitIndex}`} id={`product-${row.digitIndex}-${digitIndex}`} x={xs[productStart + digitIndex]} y={rowY(index)} step={step}>{digit}</SvgDigit>)}
        {showRemainder && <line className="division-line" x1={xs[Math.max(0, productStart)] - 18} y1={rowY(index, 15)} x2={xs[row.digitIndex] + 20} y2={rowY(index, 15)} />}
        {showRemainder && row.remainder.split('').map((digit, digitIndex) => <SvgDigit key={`r-${digitIndex}`} id={`remainder-${row.digitIndex}-${digitIndex}`} x={xs[Math.max(0, remStart + digitIndex)]} y={rowY(index, 54)} step={step}>{digit}</SvgDigit>)}
      </g>;
    })}
  </svg></div>;
}

function Blocks({ total, group, remainder, count }) {
  if (total > 72) return <div className="times-list">{Array.from({ length: count ?? Math.floor(total / group) }).map((_, index) => <span key={index}>{group}×{index + 1}={group * (index + 1)}</span>)}</div>;
  const groups = count ?? Math.floor(total / group);
  const remain = remainder ?? total % group;
  return <div className="blocks">{Array.from({ length: groups }).map((_, groupIndex) => <div className="block-group" key={groupIndex}>{Array.from({ length: group }).map((_, index) => <span className="block" key={index} />)}</div>)}{remain > 0 && <div className="block-group remainder-blocks">{Array.from({ length: remain }).map((_, index) => <span className="block" key={index} />)}</div>}</div>;
}

function Visual({ visual }) {
  if (visual.type === 'estimate') return <EstimateComparisonCard divisor={visual.divisor} target={visual.target} />;
  if (visual.type === 'blocks') return <><Blocks total={visual.total} group={visual.group} remainder={visual.remainder} /><p>{visual.note}</p></>;
  if (visual.type === 'groups') return <><Blocks total={visual.total} group={visual.group} count={visual.count} /><p>{visual.note}</p></>;
  if (visual.type === 'combine') return <><div className="combine strong-combine"><span>{visual.left}</span><span>＋</span><span>{visual.right}</span><span>→</span><strong>{visual.result}</strong></div><p>{visual.note}</p></>;
  if (visual.type === 'flow') return <><div className="flow"><span>見る</span><span>たてる</span><span>かける</span><span>ひく</span><span>おろす</span></div><p>{visual.note}</p></>;
  return <p>{visual.note}</p>;
}

function currentQuotientFor(step, problem) {
  if (step.label === '見る' || step.label === 'あたり') {
    return problem.rows[step.rowIndex ?? 0]?.q ?? '';
  }
  if (step.check?.question.includes('何回')) return step.check.answer;
  if (step.qSoFar) return step.qSoFar.slice(-1);
  return '';
}

function targetForStep(step, problem) {
  return problem.rows[step.rowIndex ?? 0]?.target;
}

function CheckCard({ check, choice, onChoice }) {
  if (!check) return null;
  const selected = check.options.find((option) => option.value === choice);
  const ok = choice === check.answer;
  return <section className="check-card"><p className="step-label">確認してから次へ</p><h3>{check.question}</h3><div className="check-options">{check.options.map((option) => <button key={option.value} type="button" className={cx('check-option', choice === option.value && (ok ? 'correct' : 'wrong'))} onClick={() => onChoice(option.value)}>{option.label}</button>)}</div>{selected && <p className={cx('check-message', ok ? 'correct-text' : 'hint-text')}>{selected.message}</p>}</section>;
}

function ProblemSelector({ currentProblemId, onSelect, dividendInput, divisorInput, onDividendInput, onDivisorInput, onStart, inputError }) {
  return <section className="problem-selector"><p className="step-label">任意の問題を入力</p><form className="custom-problem-form" onSubmit={(event) => { event.preventDefault(); onStart(); }}>
    <label>割られる数<input inputMode="numeric" pattern="[0-9]*" value={dividendInput} onChange={(event) => onDividendInput(event.target.value.replace(/\D/g, ''))} placeholder="1152" /></label>
    <label>割る数<input inputMode="numeric" pattern="[0-9]*" value={divisorInput} onChange={(event) => onDivisorInput(event.target.value.replace(/\D/g, ''))} placeholder="24" /></label>
    <button type="submit" className="primary">問題を作成</button>
  </form>{inputError && <p className="input-error" role="alert">{inputError}</p>}<p className="coming-soon">3桁÷2桁、4桁÷2桁、5桁÷2桁に対応。余りがある問題も同じサイクルで生成します。</p><p className="step-label">サンプルから始める</p><div className="problem-options">{problems.map((problem) => <button key={problem.id} type="button" className={cx('problem-option', currentProblemId === problem.id && 'selected')} onClick={() => onSelect(problem.id)}><strong>{problem.label}</strong><span>{problem.level}</span></button>)}</div></section>;
}

function App() {
  const [problemId, setProblemId] = useState(problems[0].id);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState({});
  const [dividendInput, setDividendInput] = useState(problems[0].dividend);
  const [divisorInput, setDivisorInput] = useState(String(problems[0].divisor));
  const [inputError, setInputError] = useState('');
  const selectedProblem = problems.find((item) => item.id === problemId) ?? problems[0];
  const problem = useMemo(() => problemId === 'custom' ? buildDivisionProblem(dividendInput, divisorInput) : buildDivisionProblem(selectedProblem.dividend, String(selectedProblem.divisor)), [dividendInput, divisorInput, problemId, selectedProblem]);
  const steps = useMemo(() => problem.error ? [] : stepsFor(problem), [problem]);
  const displayError = inputError || problem.error;

  const step = steps[index];
  const key = `${problem.id}-${index}`;
  const choice = choices[key];
  const canGoNext = step && (!step.check || choice === step.check.answer);
  const progress = steps.length ? Math.round(((index + 1) / steps.length) * 100) : 0;

  function selectProblem(id) {
    const sample = problems.find((item) => item.id === id);
    if (sample) {
      setDividendInput(sample.dividend);
      setDivisorInput(String(sample.divisor));
    }
    setInputError('');
    setProblemId(id);
    setChoices({});
    setIndex(0);
  }

  function startCustomProblem() {
    const error = validateDivisionInput(dividendInput, divisorInput);
    setInputError(error);
    if (!error) {
      setProblemId('custom');
      setChoices({});
      setIndex(0);
    }
  }

  return <main className={cx('app', problem.dividend?.length === 4 && 'four-digit-active')}><header className="hero"><p className="eyebrow">算数デコーダー MVP</p><h1>見えない考え方を、見える形に。</h1><p>筆算で「いま、どこを見るのか」をスポットライトで示します。</p></header><ProblemSelector currentProblemId={problemId === 'custom' && problem.id ? problem.id : problemId} onSelect={selectProblem} dividendInput={dividendInput} divisorInput={divisorInput} onDividendInput={setDividendInput} onDivisorInput={setDivisorInput} onStart={startCustomProblem} inputError={displayError} />{step && <><section className="card lesson-card"><div className="lesson-head"><div><p className="step-label">{problem.label} ・ STEP {index + 1} / {steps.length} ・ {step.label}</p><h2>{step.title}</h2></div><div className="progress"><span style={{ width: `${progress}%` }} /></div></div><CycleBar active={cycleLabelFor(step.label)} /><div className="paper-panel"><LongDivision step={step} problem={problem} /></div><nav className="actions"><button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0}>前へ</button><button type="button" className="primary" onClick={() => canGoNext && setIndex((value) => Math.min(steps.length - 1, value + 1))} disabled={index === steps.length - 1 || !canGoNext}>次へ</button><button type="button" onClick={() => setIndex(0)}>最初から</button></nav><MultiplicationCard divisor={problem.divisor} currentQ={currentQuotientFor(step, problem)} target={targetForStep(step, problem)} /><CheckCard check={step.check} choice={choice} onChoice={(value) => setChoices((previous) => ({ ...previous, [key]: value }))} /><div className="explain-panel"><h3>いま考えること</h3><p>{step.explanation}</p><div className="next-hint"><strong>次に見るところ</strong><span>{step.nextHint}</span></div></div></section><section className="card visual-card"><p className="step-label">ビジュアル補助</p><h2>{step.visualTitle}</h2><Visual visual={step.visual} /></section></>}</main>;
}

createRoot(document.getElementById('root')).render(<App />);
