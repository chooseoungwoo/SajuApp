
(function(){
  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function findButton(){
    const btns = $all('button, input[type="button"], input[type="submit"]');
    const cand = btns.find(b => ((b.textContent||b.value||'').replace(/\s+/g,'').includes('사주보기')));
    return cand || btns[0] || null;
  }
  function findInputByLabel(keyword){
    const labels = $all('label');
    for (const lb of labels){
      if ((lb.textContent||'').includes(keyword)){
        const forId = lb.getAttribute('for');
        if (forId){
          const el = document.getElementById(forId);
          if (el) return el;
        }
        const el = lb.parentElement.querySelector('input');
        if (el) return el;
      }
    }
    return null;
  }
  function findDateInput(){
    return $('input[type="date"]')
        || findInputByLabel('생년월일')
        || $all('input').find(i => /yyyymmdd|yyyyMM?dd/i.test(i.placeholder||''))
        || $all('input')[0];
  }
  function findTimeInput(){
    return $('input[type="time"]')
        || findInputByLabel('출생 시각')
        || $all('input').find(i => /(HH:?\s?mm|hh:?\s?mm)/i.test(i.placeholder||''))
        || $all('input')[1];
  }

  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const stemElem = {"갑":"목","을":"목","병":"화","정":"화","무":"토","기":"토","경":"금","신":"금","임":"수","계":"수"};
  const branchElem = {"자":"수","축":"토","인":"목","묘":"목","진":"토","사":"화","오":"화","미":"토","신":"금","유":"금","술":"토","해":"수"};

  function toJulianDay(y,m,d){
    const a = Math.floor((14-m)/12);
    const y2 = y + 4800 - a;
    const m2 = m + 12*a - 3;
    return d + Math.floor((153*m2+2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
  }
  function dateFromJD(jd){
    const Z = Math.floor(jd + 0.5);
    const F = (jd + 0.5) - Z;
    let A = Z;
    if (Z >= 2299161){
      const alpha = Math.floor((Z - 1867216.25)/36524.25);
      A = Z + 1 + alpha - Math.floor(alpha/4);
    }
    const B = A + 1524;
    const C = Math.floor((B - 122.1)/365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D)/30.6001);
    const day = B - D - Math.floor(30.6001*E) + F;
    const month = (E < 14) ? (E - 1) : (E - 13);
    const year = (month > 2) ? (C - 4716) : (C - 4715);
    const dayInt = Math.floor(day);
    let frac = day - dayInt;
    const hours = Math.floor(frac*24); frac = frac*24 - hours;
    const minutes = Math.floor(frac*60); frac = frac*60 - minutes;
    const seconds = Math.floor(frac*60);
    const ms = Math.round((frac*60 - seconds)*1000);
    return new Date(Date.UTC(year, month-1, dayInt, hours, minutes, seconds, ms));
  }
  function sunEclipticLongitude(jd){
    const T = (jd - 2451545.0)/36525.0;
    const L0 = (280.46646 + 36000.76983*T + 0.0003032*T*T) % 360;
    const M  = (357.52911 + 35999.05029*T - 0.0001537*T*T) * Math.PI/180;
    const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(M)
            + (0.019993 - 0.000101*T)*Math.sin(2*M)
            + 0.000289*Math.sin(3*M);
    let lam = L0 + C;
    const Omega = (125.04 - 1934.136*T) * Math.PI/180;
    lam = lam - 0.00569 - 0.00478*Math.sin(Omega)*180/Math.PI;
    lam = (lam % 360 + 360) % 360;
    return lam;
  }
  function termLongitudeDeg(idx){ return (285 + 15*idx) % 360; }
  function findTermTimeJD(yearUTC, idx){
    const approxDaysFromJan = idx*15.2184;
    const jdJan1 = toJulianDay(yearUTC,1,1) - 0.5;
    let lo = jdJan1 + approxDaysFromJan - 10;
    let hi = jdJan1 + approxDaysFromJan + 10;
    const target = termLongitudeDeg(idx);
    function delta(lon){
      let d = lon - target;
      d = ((d + 180) % 360 + 360) % 360 - 180;
      return d;
    }
    for (let k=0;k<60;k++){
      const mid = (lo+hi)/2;
      const dmid = delta(sunEclipticLongitude(mid));
      const dlo = delta(sunEclipticLongitude(lo));
      if (Math.abs(hi-lo) < 1e-6) return mid;
      if ((dlo<0 && dmid>0) || (dlo>0 && dmid<0)) hi = mid; else lo = mid;
    }
    return (lo+hi)/2;
  }
  function solarTermsForYear(yearUTC){ const arr=[]; for(let i=0;i<24;i++){ arr.push(dateFromJD(findTermTimeJD(yearUTC,i))); } return arr; }

  function yearPillarByLichun(local, tzHours){
    const yUTC = local.getUTCFullYear();
    const lichunUTC = solarTermsForYear(yUTC)[2];
    const lichunLocal = new Date(lichunUTC.getTime() + tzHours*3600*1000);
    const baseYear = (local >= lichunLocal) ? yUTC : (yUTC-1);
    const stemIdx = ((baseYear - 1984) % 10 + 10) % 10;
    const branchIdx = ((baseYear - 1984) % 12 + 12) % 12;
    return [stems[stemIdx], branches[branchIdx]];
  }
  function monthBySolarTerms(local, tzHours){
    const yUTC = local.getUTCFullYear();
    const termsLocal = solarTermsForYear(yUTC).map(dt => new Date(dt.getTime() + tzHours*3600*1000));
    const nextTermsLocal = solarTermsForYear(yUTC+1).map(dt => new Date(dt.getTime() + tzHours*3600*1000));
    const jeolIdxs = [2,4,6,8,10,12,14,16,18,20,22,0];
    const jeolTimes = jeolIdxs.map(i => i===0 ? nextTermsLocal[0] : termsLocal[i]);
    const monthBranches = ["인","묘","진","사","오","미","신","유","술","해","자","축"];
    let mIndex = 12;
    for (let i=0;i<jeolTimes.length;i++){
      const cur = jeolTimes[i], nxt = jeolTimes[(i+1)%jeolTimes.length];
      if (i<jeolTimes.length-1){ if (local >= cur && local < nxt){ mIndex = i+1; break; } }
      else { const first = jeolTimes[0]; if (local >= cur || local < first){ mIndex = 12; } }
    }
    const mBranch = monthBranches[(mIndex-1)%12];
    const [yStem] = yearPillarByLichun(local, tzHours);
    const firstStemMap = {"갑":"병","기":"병","을":"무","경":"무","병":"경","신":"경","정":"임","임":"임","무":"갑","계":"갑"};
    const first = firstStemMap[yStem];
    const add = (mIndex-1);
    const idxFirst = stems.indexOf(first);
    const mStem = stems[(idxFirst + add) % 10];
    return [mStem, mBranch];
  }
  function dayPillar(local){
    const jd = toJulianDay(local.getFullYear(), local.getMonth()+1, local.getDate());
    const jdRef = toJulianDay(1984,2,2);
    const diff = jd - jdRef;
    const stem = stems[(diff % 10 + 10) % 10];
    const branch = branches[(diff % 12 + 12) % 12];
    return [stem, branch];
  }
  function hourBranchByLocalHour(h){
    if (h===23) return "자";
    const mapping = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
    return mapping[Math.floor(((h+1)%24)/2)];
  }
  function hourStem(dayStem, hBranch){
    const dIdx = stems.indexOf(dayStem);
    const hbIdx = ["자","축","인","묘","진","사","오","미","신","유","술","해"].indexOf(hBranch);
    return stems[((dIdx % 5) * 2 + hbIdx) % 10];
  }
  function countsOf(list){
    const c={"목":0,"화":0,"토":0,"금":0,"수":0};
    list.forEach(([g,z])=>{ c[stemElem[g]]++; c[branchElem[z]]++; });
    return c;
  }

  function ensureResultBox(){
    let box = document.getElementById('saju-result-box');
    if (!box){
      box = document.createElement('div');
      box.id='saju-result-box';
      box.style.marginTop='16px'; box.style.padding='16px'; box.style.border='1px solid #dbeafe';
      box.style.borderRadius='12px'; box.style.background='rgba(255,255,255,.9)';
      const form = document.querySelector('.card') || document.body;
      form.parentNode.insertBefore(box, form.nextSibling);
    }
    return box;
  }
  function render(box, yG,yZ,mG,mZ,dG,dZ,hG,hZ,c){
    box.innerHTML = `
    <h3 style="margin:0 0 8px">📌 사주 결과</h3>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
      <div><b>연주</b><div>${yG}${yZ} (${stemElem[yG]}/${branchElem[yZ]})</div></div>
      <div><b>월주</b><div>${mG}${mZ} (${stemElem[mG]}/${branchElem[mZ]})</div></div>
      <div><b>일주</b><div>${dG}${dZ} (${stemElem[dG]}/${branchElem[dZ]})</div></div>
      <div><b>시주</b><div>${hG}${hZ} (${stemElem[hG]}/${branchElem[hZ]})</div></div>
    </div>
    <div style="margin-top:10px">🌿 오행: 목 ${c["목"]} · 화 ${c["화"]} · 토 ${c["토"]} · 금 ${c["금"]} · 수 ${c["수"]}</div>
    <div style="margin-top:8px;color:#334155;font-size:.9rem">※ 연·월주: 24절기 <u>천문 절입시각</u>, 일주: 1984-02-02 甲子, 시주: 자시 체계</div>`;
  }

  function parseDateInput(el){
    if (!el) return null;
    if (el.type === 'date' && el.value){
      const d = new Date(el.value);
      return {Y:d.getFullYear(), M:d.getMonth()+1, D:d.getDate()};
    }
    const s = (el.value||'').replace(/\D/g,'');
    if (s.length===8) return {Y:+s.slice(0,4), M:+s.slice(4,6), D:+s.slice(6,8)};
    return null;
  }
  function parseTimeInput(el){
    if (!el) return null;
    let v = (el.value||'').trim();
    if (!v) return null;
    let pm = /오후|PM/i.test(v);
    let am = /오전|AM/i.test(v);
    v = v.replace(/오전|오후|AM|PM/ig,'').trim();
    const m = v.match(/(\d{1,2})\D(\d{1,2})/);
    if (!m) return null;
    let h = +m[1], mm = +m[2];
    if (pm && h < 12) h += 12;
    if (am && h === 12) h = 0;
    return {H:h, M:mm};
  }

  function compute(){
    const dateEl = findDateInput();
    const timeEl = findTimeInput();
    const ymd = parseDateInput(dateEl);
    const hm = parseTimeInput(timeEl);
    if (!ymd){ alert('생년월일을 yyyyMMdd 또는 date로 입력해주세요.'); return; }
    if (!hm){ alert('출생 시각을 HH:mm 형식으로 입력해주세요.'); return; }
    const tzHours = 9;
    const dtUTC = new Date(Date.UTC(ymd.Y, ymd.M-1, ymd.D, hm.H - tzHours, hm.M, 0));
    const local = new Date(dtUTC.getTime() + tzHours*3600*1000);
    const [yG,yZ] = yearPillarByLichun(local, tzHours);
    const [mG,mZ] = monthBySolarTerms(local, tzHours);
    const [dG,dZ] = dayPillar(local);
    const hZ = hourBranchByLocalHour(local.getHours());
    const hG = hourStem(dG, hZ);
    const c = countsOf([[yG,yZ],[mG,mZ],[dG,dZ],[hG,hZ]]);
    render(ensureResultBox(), yG,yZ,mG,mZ,dG,dZ,hG,hZ,c);
  }

  function bind(){
    const btn = findButton();
    if (btn){ btn.addEventListener('click', (e)=>{ e.preventDefault(); compute(); }); }
    [findDateInput(), findTimeInput()].forEach(el=>{
      if (el){ el.addEventListener('keydown', (e)=>{ if (e.key==='Enter'){ e.preventDefault(); compute(); } }); }
    });
  }

  document.addEventListener('DOMContentLoaded', bind);
})();
