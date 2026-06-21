import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const problems = [
  { id:'156-12', label:'156 ÷ 12', level:'3桁÷2桁', divisor:'12', dividend:'156', answer:'13', firstTarget:'15', firstQ:'1', firstProduct:'12', firstRemainder:'3', secondTarget:'36', secondQ:'3', secondProduct:'36' },
  { id:'168-12', label:'168 ÷ 12', level:'3桁÷2桁 応用', divisor:'12', dividend:'168', answer:'14', firstTarget:'16', firstQ:'1', firstProduct:'12', firstRemainder:'4', secondTarget:'48', secondQ:'4', secondProduct:'48' },
  { id:'1152-24', label:'1152 ÷ 24', level:'4桁÷2桁', divisor:'24', dividend:'1152', answer:'48', firstTarget:'115', firstQ:'4', firstProduct:'96', firstRemainder:'19', secondTarget:'192', secondQ:'8', secondProduct:'192' },
];

function n(v){ return Number(v); }
function cx(...classes){ return classes.filter(Boolean).join(' '); }
function firstEnd(p){ return p.firstTarget.length - 1; }
function xPositions(p){ return p.dividend.length === 4 ? [118,163,208,253] : [142,187,232]; }
function digitCoords(p, value, endIndex){
  const xs = xPositions(p);
  const start = endIndex - value.length + 1;
  return value.split('').map((digit, i) => ({ digit, x: xs[start + i] }));
}
function secondStart(p){ return firstEnd(p) - p.firstRemainder.length + 1; }

function makeOptions(correct, labels){
  return labels.map(([value, label, message]) => ({ value:String(value), label, message }));
}

function stepsFor(p){
  const digits = p.dividend.split('');
  const end = firstEnd(p);
  const downDigit = digits[end + 1];
  const firstWrongHigh = String(Math.max(2, n(p.firstQ)+1));
  const secondLow = String(Math.max(1, n(p.secondQ)-1));
  const secondHigh = String(n(p.secondQ)+1);
  return [
    { label:'見る', title:`まず「${p.firstTarget}」を見る`, focus:['d0',`d${end}`], preview:['q1'], q1:'', q2:'', show1:false, showR:false, show2:false, showP2:false, show0:false,
      explanation:`${p.divisor}が入る、左から一番小さいまとまりを探します。${digits[0]}だけでは${p.divisor}より小さいので、${p.firstTarget}を見ます。`, nextHint:`次は、${p.firstTarget}の中に${p.divisor}が何回入るかを考えます。`, visualTitle:`${p.firstTarget}の中に${p.divisor}は何回入る？`, visual:{type:'blocks', total:n(p.firstTarget), group:n(p.divisor), remainder:n(p.firstRemainder), note:`${p.divisor}が${p.firstQ}回入って、${p.firstRemainder}が残ります。`}, check:{question:'最初に見るのはどこ？', answer:p.firstTarget, options:makeOptions(p.firstTarget, [[digits[0],`${digits[0]}だけ`,`${digits[0]}だけだと${p.divisor}より小さいので、まだ割れません。`],[p.firstTarget,p.firstTarget,`正解。${p.divisor}が入る最小のまとまりです。`],[p.dividend,`${p.dividend}全部`,'全部を一気に見なくても大丈夫です。']])}},
    { label:'たてる', title:`${p.firstQ}回入るので「${p.firstQ}」を上に書く`, focus:['q1'], preview:['p1a'], q1:p.firstQ, q2:'', show1:false, showR:false, show2:false, showP2:false, show0:false,
      explanation:`${p.firstTarget}の中に${p.divisor}は${p.firstQ}回入ります。だから、${digits[end]}の上に${p.firstQ}を書きます。`, nextHint:`次は、入った分の${p.firstProduct}を書きます。`, visualTitle:`${p.firstQ}回ぶんを上に記録する`, visual:{type:'simple', note:'上に書く数字は「答えの一部」ではなく、まずは「何回入ったか」です。'}, check:{question:`${p.firstTarget}の中に${p.divisor}は何回入る？`, answer:p.firstQ, options:makeOptions(p.firstQ, [['0','0回','まだ入ります。0回ではありません。'],[p.firstQ,`${p.firstQ}回`,`正解。${p.divisor}が${p.firstQ}回入ります。`],[firstWrongHigh,`${firstWrongHigh}回`,`${p.divisor}×${firstWrongHigh}=${n(p.divisor)*n(firstWrongHigh)}で、大きすぎます。`]])}},
    { label:'かける', title:`${p.firstQ} × ${p.divisor} = ${p.firstProduct} を書く`, focus:['p1a','p1b','p1c'], preview:['r0'], q1:p.firstQ, q2:'', show1:true, showR:false, show2:false, showP2:false, show0:false,
      explanation:`${p.firstQ}回入ったので、入った分の${p.firstProduct}を書きます。これは後で引くためです。`, nextHint:`次は、${p.firstTarget}から${p.firstProduct}を引いて残りを見ます。`, visualTitle:'入った分を見えるようにする', visual:{type:'simple', note:`${p.divisor}×${p.firstQ}=${p.firstProduct}。この${p.firstProduct}を下に書きます。`}, check:{question:`${p.firstQ}回入った分はいくつ？`, answer:p.firstProduct, options:makeOptions(p.firstProduct, [[p.firstQ,p.firstQ,`${p.firstQ}は回数です。入った分ではありません。`],[p.firstProduct,p.firstProduct,`正解。${p.divisor}×${p.firstQ}=${p.firstProduct}です。`],[p.firstTarget,p.firstTarget,`${p.firstTarget}は今見ているまとまりです。`]])}},
    { label:'ひく', title:`${p.firstTarget} − ${p.firstProduct} = ${p.firstRemainder}`, focus:['r0','r1'], preview:[`d${end+1}`], q1:p.firstQ, q2:'', show1:true, showR:true, show2:false, showP2:false, show0:false,
      explanation:`${p.firstTarget}から、入った分の${p.firstProduct}を引きます。残りは${p.firstRemainder}です。`, nextHint:`次は、まだ使っていない${downDigit}を見ます。`, visualTitle:`残りは${p.firstRemainder}`, visual:{type:'simple', note:`残った${p.firstRemainder}は、次の数字${downDigit}と組み合わせます。`}, check:{question:`この「${p.firstRemainder}」はどうする？`, answer:'combine', options:makeOptions('combine', [['answer','答えにする',`まだ右に${downDigit}が残っています。ここでは答えにしません。`],['combine',`次の${downDigit}と合わせる`,`正解。${p.firstRemainder}と${downDigit}を合わせて${p.secondTarget}にします。`],['ignore','使わない',`${p.firstRemainder}は次に使います。`]])}},
    { label:'おろす', title:`余り${p.firstRemainder}と${downDigit}を合わせて、${p.secondTarget}を見る`, focus:['r0','r1',`d${end+1}`], preview:['q2'], q1:p.firstQ, q2:'', show1:true, showR:false, show2:true, showP2:false, show0:false,
      explanation:`「${downDigit}を下ろす」は、余り${p.firstRemainder}と次の数字${downDigit}を合わせて${p.secondTarget}という新しいまとまりを作ることです。`, nextHint:`次は、${p.secondTarget}の中に${p.divisor}が何回入るかを考えます。`, visualTitle:`${p.firstRemainder} + ${downDigit} → ${p.secondTarget}`, visual:{type:'combine', left:p.firstRemainder, right:downDigit, result:p.secondTarget, note:`足し算ではなく、${p.firstRemainder}の右に${downDigit}をつけて${p.secondTarget}として見ます。`}, check:{question:`${p.firstRemainder}と${downDigit}を合わせると？`, answer:p.secondTarget, options:makeOptions(p.secondTarget, [[String(n(p.firstRemainder)+n(downDigit)),String(n(p.firstRemainder)+n(downDigit)),'足し算ではありません。右に数字をつけます。'],[p.secondTarget,p.secondTarget,`正解。次に見るまとまりは${p.secondTarget}です。`],[downDigit,downDigit,`${downDigit}だけではなく、残り${p.firstRemainder}と合わせます。`]])}},
    { label:'見る', title:`${p.secondTarget}の中に${p.divisor}は何回入る？`, focus:['r0','r1',`d${end+1}`], preview:['q2'], q1:p.firstQ, q2:'', show1:true, showR:false, show2:true, showP2:false, show0:false,
      explanation:`ここで止まって考えます。${p.divisor}×${secondLow}=${n(p.divisor)*n(secondLow)}、${p.divisor}×${p.secondQ}=${p.secondTarget}。だから${p.secondTarget}の中に${p.divisor}は${p.secondQ}回入ります。`, nextHint:`次は、${p.secondQ}回入ったことを上に書きます。`, visualTitle:`${p.secondTarget}を${p.divisor}ずつ分ける`, visual:{type:'groups', total:n(p.secondTarget), group:n(p.divisor), count:n(p.secondQ), note:`${p.divisor}が${p.secondQ}回入ります。かけ算で確かめます。`}, check:{question:`${p.secondTarget}の中に${p.divisor}は何回入る？`, answer:p.secondQ, options:makeOptions(p.secondQ, [[secondLow,`${secondLow}回`,`${p.divisor}×${secondLow}=${n(p.divisor)*n(secondLow)}。まだ足りません。`],[p.secondQ,`${p.secondQ}回`,`正解。${p.divisor}×${p.secondQ}=${p.secondTarget}です。`],[secondHigh,`${secondHigh}回`,`${p.divisor}×${secondHigh}=${n(p.divisor)*n(secondHigh)}。超えてしまいます。`]])}},
    { label:'たてる', title:`${p.secondQ}回入るので「${p.secondQ}」を上に書く`, focus:['q2'], preview:['p2a'], q1:p.firstQ, q2:p.secondQ, show1:true, showR:false, show2:true, showP2:false, show0:false,
      explanation:`${p.secondTarget}の中に${p.divisor}は${p.secondQ}回入るので、${downDigit}の上に${p.secondQ}を書きます。`, nextHint:`最後に、入った分の${p.secondProduct}を書いて引きます。`, visualTitle:`${p.secondQ}回ぶんを上に記録する`, visual:{type:'simple', note:`ここまでで答えの形が${p.answer}になります。`}, check:{question:`${downDigit}の上に書く数字は？`, answer:p.secondQ, options:makeOptions(p.secondQ, [[p.firstQ,p.firstQ,`${p.firstQ}は最初の${p.firstTarget}に入った回数です。`],[p.secondQ,p.secondQ,`正解。${p.secondTarget}に${p.divisor}が${p.secondQ}回入ります。`],[downDigit,downDigit,`${downDigit}は下ろした数字です。上に書くのは回数です。`]])}},
    { label:'完成', title:`${p.dividend} ÷ ${p.divisor} = ${p.answer}`, focus:['q1','q2'], preview:[], q1:p.firstQ, q2:p.secondQ, show1:true, showR:false, show2:true, showP2:true, show0:true,
      explanation:`${p.divisor}が${p.firstQ}回、次に${p.secondQ}回入りました。答えは${p.answer}です。`, nextHint:'筆算は、見る場所を決めることから始まります。', visualTitle:'筆算の流れ', visual:{type:'flow', note:'見る → たてる → かける → ひく → おろす。筆算はこのくり返しです。'}, check:null},
  ];
}

function SvgDigit({ id, x, y, children, step }){
  const active = step.focus.includes(id), preview = step.preview.includes(id);
  return <g className={cx(preview&&'svg-preview', active&&'svg-spotlight')}>{(active||preview)&&<rect x={x-18} y={y-34} width="36" height="42" rx="8"/>}<text x={x} y={y}>{children}</text></g>;
}

function LongDivision({ step, problem:p }){
  const xs = xPositions(p), end = firstEnd(p), sStart = secondStart(p);
  const q1x = xs[end], q2x = xs[end+1];
  return <div className="spotlight-stage"><svg className="division-svg" viewBox="0 0 320 340" role="img" aria-label={`${p.label} の筆算`}>
    <line className="division-line" x1="112" y1="78" x2="276" y2="78"/><path className="division-line no-fill" d="M103 82 C117 112 117 138 103 168"/>
    <SvgDigit id="q1" x={q1x} y="54" step={step}>{step.q1}</SvgDigit><SvgDigit id="q2" x={q2x} y="54" step={step}>{step.q2}</SvgDigit>
    <text className="svg-digit divisor-svg" x="82" y="130">{p.divisor}</text>{p.dividend.split('').map((d,i)=><SvgDigit key={i} id={`d${i}`} x={xs[i]} y="130" step={step}>{d}</SvgDigit>)}
    {step.show1 && <>{digitCoords(p,p.firstProduct,end).map((c,i)=><SvgDigit key={`p1-${i}`} id={`p1${String.fromCharCode(97+i)}`} x={c.x} y="178" step={step}>{c.digit}</SvgDigit>)}<line className="division-line" x1={xs[end-p.firstProduct.length+1]-18} y1="193" x2={xs[end]+20} y2="193"/></>}
    {step.showR && digitCoords(p,p.firstRemainder,end).map((c,i)=><SvgDigit key={`r-${i}`} id={`r${i}`} x={c.x} y="232" step={step}>{c.digit}</SvgDigit>)}
    {step.show2 && p.secondTarget.split('').map((d,i)=><SvgDigit key={`s-${i}`} id={i<p.firstRemainder.length?`r${i}`:`d${end+1}`} x={xs[sStart+i]} y="232" step={step}>{d}</SvgDigit>)}
    {step.showP2 && <>{p.secondProduct.split('').map((d,i)=><SvgDigit key={`p2-${i}`} id={`p2${String.fromCharCode(97+i)}`} x={xs[sStart+i]} y="278" step={step}>{d}</SvgDigit>)}<line className="division-line" x1={xs[sStart]-18} y1="293" x2={xs[xs.length-1]+20} y2="293"/></>}
    {step.show0 && <SvgDigit id="z0" x={xs[xs.length-1]} y="326" step={step}>0</SvgDigit>}
  </svg></div>;
}

function Blocks({ total, group, remainder, count }){
  if (total > 72) return <div className="times-list">{Array.from({length: count ?? Math.floor(total/group)}).map((_,i)=><span key={i}>{group}×{i+1}={group*(i+1)}</span>)}</div>;
  const groups = count ?? Math.floor(total/group), remain = remainder ?? total%group;
  return <div className="blocks">{Array.from({length:groups}).map((_,g)=><div className="block-group" key={g}>{Array.from({length:group}).map((_,i)=><span className="block" key={i}/>)}</div>)}{remain>0&&<div className="block-group remainder-blocks">{Array.from({length:remain}).map((_,i)=><span className="block" key={i}/>)}</div>}</div>;
}
function Visual({ visual }){
  if(visual.type==='blocks') return <><Blocks total={visual.total} group={visual.group} remainder={visual.remainder}/><p>{visual.note}</p></>;
  if(visual.type==='groups') return <><Blocks total={visual.total} group={visual.group} count={visual.count}/><p>{visual.note}</p></>;
  if(visual.type==='combine') return <><div className="combine strong-combine"><span>{visual.left}</span><span>＋</span><span>{visual.right}</span><span>→</span><strong>{visual.result}</strong></div><p>{visual.note}</p></>;
  if(visual.type==='flow') return <><div className="flow"><span>見る</span><span>たてる</span><span>かける</span><span>ひく</span><span>おろす</span></div><p>{visual.note}</p></>;
  return <p>{visual.note}</p>;
}
function CheckCard({ check, choice, onChoice }){
  if(!check) return null; const selected = check.options.find(o=>o.value===choice), ok = choice===check.answer;
  return <section className="check-card"><p className="step-label">確認してから次へ</p><h3>{check.question}</h3><div className="check-options">{check.options.map(o=><button key={o.value} type="button" className={cx('check-option', choice===o.value&&(ok?'correct':'wrong'))} onClick={()=>onChoice(o.value)}>{o.label}</button>)}</div>{selected&&<p className={cx('check-message', ok?'correct-text':'hint-text')}>{selected.message}</p>}</section>;
}
function ProblemSelector({ currentProblemId, onSelect }){
  return <section className="problem-selector"><p className="step-label">問題を選ぶ</p><div className="problem-options">{problems.map(p=><button key={p.id} type="button" className={cx('problem-option', currentProblemId===p.id&&'selected')} onClick={()=>onSelect(p.id)}><strong>{p.label}</strong><span>{p.level}</span></button>)}</div><p className="coming-soon">次に追加予定：84÷3 / 5桁÷2桁</p></section>;
}
function App(){
  const [problemId,setProblemId]=useState(problems[0].id), [index,setIndex]=useState(0), [choices,setChoices]=useState({});
  const problem = problems.find(p=>p.id===problemId) ?? problems[0];
  const steps = useMemo(()=>stepsFor(problem),[problem]);
  const step = steps[index], key = `${problem.id}-${index}`, choice = choices[key], canGoNext = !step.check || choice === step.check.answer;
  const progress = Math.round(((index+1)/steps.length)*100);
  function selectProblem(id){ setProblemId(id); setIndex(0); }
  return <main className="app"><header className="hero"><p className="eyebrow">算数デコーダー MVP</p><h1>見えない考え方を、見える形に。</h1><p>筆算で「いま、どこを見るのか」をスポットライトで示します。</p></header><ProblemSelector currentProblemId={problem.id} onSelect={selectProblem}/><section className="card lesson-card"><div className="lesson-head"><div><p className="step-label">{problem.label} ・ STEP {index+1} / {steps.length} ・ {step.label}</p><h2>{step.title}</h2></div><div className="progress"><span style={{width:`${progress}%`}}/></div></div><div className="paper-panel"><LongDivision step={step} problem={problem}/></div><nav className="actions"><button type="button" onClick={()=>setIndex(v=>Math.max(0,v-1))} disabled={index===0}>前へ</button><button type="button" className="primary" onClick={()=>canGoNext&&setIndex(v=>Math.min(steps.length-1,v+1))} disabled={index===steps.length-1||!canGoNext}>次へ</button><button type="button" onClick={()=>setIndex(0)}>最初から</button></nav><CheckCard check={step.check} choice={choice} onChoice={(value)=>setChoices(prev=>({...prev,[key]:value}))}/><div className="explain-panel"><h3>いま考えること</h3><p>{step.explanation}</p><div className="next-hint"><strong>次に見るところ</strong><span>{step.nextHint}</span></div></div></section><section className="card visual-card"><p className="step-label">ビジュアル補助</p><h2>{step.visualTitle}</h2><Visual visual={step.visual}/></section></main>;
}

createRoot(document.getElementById('root')).render(<App/>);
