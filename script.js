// ===== 정통 사주 코어 (자시=23:00 일교, 24절기 실입시각) =====
const stems = ["갑","을","병","정","무","기","경","신","임","계"];
const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
const stemElem = {"갑":"목","을":"목","병":"화","정":"화","무":"토","기":"토","경":"금","신":"금","임":"수","계":"수"};
const branchElem = {"자":"수","축":"토","인":"목","묘":"목","진":"토","사":"화","오":"화","미":"토","신":"금","유":"금","술":"토","해":"수"};

// JD helpers
function toJulianDay(y,m,d){ const a=Math.floor((14-m)/12); const y2=y+4800-a; const m2=m+12*a-3;
  return d + Math.floor((153*m2+2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045; }
function dateFromJD(jd){ const Z=Math.floor(jd+0.5), F=(jd+0.5)-Z; let A=Z;
  if (Z>=2299161){ const alpha=Math.floor((Z-1867216.25)/36524.25); A=Z+1+alpha-Math.floor(alpha/4); }
  const B=A+1524, C=Math.floor((B-122.1)/365.25), D=Math.floor(365.25*C), E=Math.floor((B-D)/30.6001);
  const day=B-D-Math.floor(30.6001*E)+F, month=(E<14)?E-1:E-13, year=(month>2)?C-4716:C-4715;
  const di=Math.floor(day); let frac=day-di; const hh=Math.floor(frac*24); frac=frac*24-hh; const mm=Math.floor(frac*60); frac=frac*60-mm; const ss=Math.floor(frac*60);
  return new Date(Date.UTC(year,month-1,di,hh,mm,ss,0));
}
// 태양 황경(근사)
function sunEclipticLongitude(jd){
  const T=(jd-2451545)/36525, L0=(280.46646+36000.76983*T+0.0003032*T*T)%360;
  const M=(357.52911+35999.05029*T-0.0001537*T*T)*Math.PI/180;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M);
  let lam=L0+C; const Om=(125.04-1934.136*T)*Math.PI/180; lam=lam-0.00569-0.00478*Math.sin(Om)*180/Math.PI;
  return (lam%360+360)%360;
}
function termLongitudeDeg(i){ return (285+15*i)%360; } // 소한285, 대한300, 입춘315...
function findTermTimeJD(yearUTC, idx){
  const jdJan1=toJulianDay(yearUTC,1,1)-0.5, approx=idx*15.2184; let lo=jdJan1+approx-10, hi=jdJan1+approx+10;
  const target=termLongitudeDeg(idx);
  const delta=lon=>{ let d=lon-target; d=((d+180)%360+360)%360-180; return d; };
  for(let k=0;k<60;k++){ const mid=(lo+hi)/2, dmid=delta(sunEclipticLongitude(mid)), dlo=delta(sunEclipticLongitude(lo));
    if(Math.abs(hi-lo)<1e-6) return mid; if((dlo<0&&dmid>0)||(dlo>0&&dmid<0)) hi=mid; else lo=mid; }
  return (lo+hi)/2;
}
function solarTermsLocal(yearUTC, tz){ const out=[]; for(let i=0;i<24;i++){ const jd=findTermTimeJD(yearUTC,i); const utc=dateFromJD(jd); out.push(new Date(utc.getTime()+tz*3600*1000)); } return out; }

// Year pillar (입춘)
function yearPillar(local, tz){
  const yUTC=local.getUTCFullYear(), lichun=solarTermsLocal(yUTC,tz)[2];
  const base=(local>=lichun)?yUTC:(yUTC-1);
  return [stems[((base-1984)%10+10)%10], branches[((base-1984)%12+12)%12]];
}
// Month pillar (12절 기준)
function monthPillar(local, tz){
  const yUTC=local.getUTCFullYear(), tThis=solarTermsLocal(yUTC,tz), tNext=solarTermsLocal(yUTC+1,tz);
  const idx=[2,4,6,8,10,12,14,16,18,20,22,0], jeol=idx.map(i=>i===0?tNext[0]:tThis[i]);
  const brs=["인","묘","진","사","오","미","신","유","술","해","자","축"]; let mIndex=12;
  for(let i=0;i<jeol.length;i++){ const cur=jeol[i], nxt=jeol[(i+1)%jeol.length];
    if(i<jeol.length-1){ if(local>=cur && local<nxt){ mIndex=i+1; break; } } else { const first=jeol[0]; if(local>=cur || local<first){ mIndex=12; } } }
  const mBranch=brs[(mIndex-1)%12];
  const [yStem]=yearPillar(local,tz);
  const firstStemMap={"갑":"병","기":"병","을":"무","경":"무","병":"경","신":"경","정":"임","임":"임","무":"갑","계":"갑"};
  const mStem=stems[(stems.indexOf(firstStemMap[yStem])+(mIndex-1))%10];
  return [mStem,mBranch,jeol];
}
// Day/Hour (자시=23:00 시작)
function dayHourPillars(local){
  const d=new Date(local.getTime()); if(local.getHours()<23) d.setDate(d.getDate()-1);
  const diff = toJulianDay(d.getFullYear(),d.getMonth()+1,d.getDate()) - toJulianDay(1984,2,2);
  const dStem=stems[(diff%10+10)%10], dBranch=branches[(diff%12+12)%12];
  const h=local.getHours();
  const mapping=["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const hBranch=(h===23)?"자":mapping[Math.floor(((h+1)%24)/2)];
  const hbIdx=mapping.indexOf(hBranch);
  const hStem=stems[((stems.indexOf(dStem)%5)*2+hbIdx)%10];
  return [dStem,dBranch,hStem,hBranch];
}
// 오행 카운트
function fiveCounts([yG,yZ],[mG,mZ],[dG,dZ],[hG,hZ]){
  const c={"목":0,"화":0,"토":0,"금":0,"수":0};
  [[yG,yZ],[mG,mZ],[dG,dZ],[hG,hZ]].forEach(([g,z])=>{ c[stemElem[g]]++; c[branchElem[z]]++; });
  return c;
}
// 해당 연도 12개월 간지
function monthlyPillarsForYear(year, tz){
  const terms=solarTermsLocal(year,tz), next0=solarTermsLocal(year+1,tz)[0];
  const idx=[2,4,6,8,10,12,14,16,18,20,22,0], times=idx.map(i=>i===0?next0:terms[i]);
  const labels=["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
  const [yStem]=yearPillar(new Date(terms[2].getTime()+1), tz);
  const map={"갑":"병","기":"병","을":"무","경":"무","병":"경","신":"경","정":"임","임":"임","무":"갑","계":"갑"};
  const first=map[yStem];
  const list=[];
  for(let i=0;i<12;i++){
    const mStem=stems[(stems.indexOf(first)+i)%10], mBranch=labels[i];
    list.push({index:i+1, gz:mStem+mBranch, elem:[stemElem[mStem], branchElem[mBranch]]});
  }
  return list;
}
// 점수 (편중 보정)
const weights={"목":-1,"화":2,"토":-1,"금":2,"수":2};
const scoreForMonth=(g,b)=>(weights[stemElem[g]]||0)+(weights[branchElem[b]]||0);
const scoreForYear=(y,tz)=>monthlyPillarsForYear(y,tz).reduce((s,m)=>s+scoreForMonth(m.gz[0],m.gz[1]),0);

// 캔버스 바 차트(밝은 색상)
function drawBarChart(canvas, labels, values){
  const ctx=canvas.getContext('2d'), w=canvas.width, h=canvas.height;
  ctx.clearRect(0,0,w,h); ctx.fillStyle="#fff"; ctx.strokeStyle="#fff"; ctx.font="12px system-ui,-apple-system,sans-serif";
  const pad=40, maxV=Math.max(...values,1), minV=Math.min(...values,0), yMax=Math.ceil(maxV/5)*5, yMin=Math.floor(minV/5)*5;
  const range=yMax-yMin||10, plotW=w-pad*2, plotH=h-pad*2;
  ctx.beginPath(); ctx.moveTo(pad,pad); ctx.lineTo(pad,h-pad); ctx.lineTo(w-pad,h-pad); ctx.stroke();
  const n=values.length, step=plotW/n, barW=step*0.6;
  for(let i=0;i<n;i++){ const x=pad+i*step+(step-barW)/2, v=values[i], y=h-pad-((v-yMin)/range)*plotH;
    ctx.fillRect(x,y,barW,(h-pad)-y); ctx.fillText(labels[i],x,h-pad+14); ctx.fillText(String(v),x,y-4); }
}

// 시간 파싱(24h 또는 오전/오후)
function parseTimeFlexible(s){
  s=(s||"").trim(); const pm=/오후|PM/i.test(s), am=/오전|AM/i.test(s); s=s.replace(/오전|오후|AM|PM/ig,'').trim();
  const m=s.match(/(\d{1,2})\D(\d{1,2})/); if(!m) return null;
  let h=+m[1], mm=+m[2]; if(pm&&h<12)h+=12; if(am&&h===12)h=0; return {h, m:mm};
}

function fmtGZ(g,z){ return `${g}${z} (${stemElem[g]}/${branchElem[z]})`; }

function run(){
  const bd=document.getElementById('birthdate').value;
  const btRaw=document.getElementById('birthtime').value;
  const tz=parseInt(document.getElementById('tz').value,10);
  let startYear=parseInt(document.getElementById('startYear').value,10);
  if(!startYear||startYear<1900){ startYear=new Date().getFullYear(); document.getElementById('startYear').value=startYear; }
  if(!bd||!btRaw){ alert('생년월일/시각을 입력하세요.'); return; }
  const [Y,M,D]=bd.split('-').map(Number); const parsed=parseTimeFlexible(btRaw);
  if(!parsed){ alert('시각은 HH:MM 또는 오전/오후 HH:MM 형식으로 입력하세요.'); return; }
  const {h,m}=parsed;

  // 로컬시
  const dtUTC=new Date(Date.UTC(Y,M-1,D,h - tz,m,0));
  const local=new Date(dtUTC.getTime()+tz*3600*1000);

  const YP=yearPillar(local,tz), MP=monthPillar(local,tz);
  const [dG,dZ,hG,hZ]=(()=>{ const a=dayHourPillars(local); return [a[0],a[1],a[2],a[3]]; })();
  const counts=fiveCounts(YP,[MP[0],MP[1]],[dG,dZ],[hG,hZ]);

  // 표시
  document.getElementById('Y').textContent=fmtGZ(YP[0],YP[1]);
  document.getElementById('M').textContent=fmtGZ(MP[0],MP[1]);
  document.getElementById('D').textContent=fmtGZ(dG,dZ);
  document.getElementById('H').textContent=fmtGZ(hG,hZ);
  document.getElementById('eMok').textContent=`목: ${counts["목"]}`;
  document.getElementById('eHwa').textContent=`화: ${counts["화"]}`;
  document.getElementById('eTo').textContent=`토: ${counts["토"]}`;
  document.getElementById('eGeum').textContent=`금: ${counts["금"]}`;
  document.getElementById('eSu').textContent=`수: ${counts["수"]}`;

  // 10년 그래프
  const labels=[], values=[];
  for(let y=startYear; y<startYear+10; y++){ labels.push(String(y)); values.push(scoreForYear(y,tz)); }
  drawBarChart(document.getElementById('chart'), labels, values);

  // 표
  const tbody=document.querySelector('#yearly tbody'); tbody.innerHTML='';
  for(let i=0;i<labels.length;i++){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${labels[i]}</td><td>${values[i]}</td>`; tbody.appendChild(tr); }

  document.getElementById('result').style.display='block';
}
document.getElementById('btnCalc').addEventListener('click', run);
window.addEventListener('DOMContentLoaded', ()=>{ const now=new Date().getFullYear(); document.getElementById('startYear').value=now; run(); });
