
(function(){
  // ========= util: safe selector =========
  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function findButtonByText(txt){
    const btns = $all('button, input[type="button"], input[type="submit"]');
    return btns.find(b => (b.textContent||b.value||'').trim().includes(txt));
  }

  // ========= stems/branches, elements =========
  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const stemElem = {"갑":"목","을":"목","병":"화","정":"화","무":"토","기":"토","경":"금","신":"금","임":"수","계":"수"};
  const branchElem = {"자":"수","축":"토","인":"목","묘":"목","진":"토","사":"화","오":"화","미":"토","신":"금","유":"금","술":"토","해":"수"};

  // ========= JD helpers =========
  function toJulianDay(y,m,d){
    const a = Math.floor((14-m)/12);
    const y2 = y + 4800 - a;
    const m2 = m + 12*a - 3;
    return d + Math.floor((153*m2+2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
  }
  function jdFromDateUTC(dt){
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth()+1, d = dt.getUTCDate();
    const h = dt.getUTCHours(), min = dt.getUTCMinutes(), s = dt.getUTCSeconds() + dt.getUTCMilliseconds()/1000;
    const JD0 = toJulianDay(y,m,d);
    return JD0 + (h + (min + s/60)/60)/24;
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

  // ========= Sun ecliptic longitude (approx) =========
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

  // ========= Pillars =========
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
    const termsUTC = solarTermsForYear(yUTC);
    const termsLocal = termsUTC.map(dt => new Date(dt.getTime() + tzHours*3600*1000));
    const nextTermsLocal = solarTermsForYear(yUTC+1).map(dt => new Date(dt.getTime() + tzHours*3600*1000));
    const jeolIdxs = [2,4,6,8,10,12,14,16,18,20,22,0];
    const jeolTimes = jeolIdxs.map(i => i===0 ? nextTermsLocal[0] : termsLocal[i]);
    const monthBranches = ["인","묘","진","사","오","미","신","유","술","해","자","축"];
    let mIndex = 12;
    for (let i=0;i<jeolTimes.length;i++){
      const cur = jeolTimes[i];
      const nxt = jeolTimes[(i+1)%jeolTimes.length];
      if (i<jeolTimes.length-1){
        if (local >= cur && local < nxt){ mIndex = i+1; break; }
      } else {
        const first = jeolTimes[0];
        if (local >= cur || local < first){ mIndex = 12; }
      }
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
    const jdRef = toJulianDay(1984,2,2); // 甲子일
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
  function countElements(gzList){
    const counts = {"목":0,"화":0,"토":0,"금":0,"수":0};
    gzList.forEach(([g,z])=>{
      counts[stemElem[g]] += 1;
      counts[branchElem[z]] += 1;
    });
    return counts;
  }

  // ========= Bind UI generically =========
  function detectInputs(){
    // date: prefer [type=date], else placeholder yyyymmdd, else first input
    let dateEl = $('input[type="date"]') || $all('input').find(i => /yyyy?[-/ ]?mm[-/ ]?dd|yyyymmdd|예:\s*1985/i.test(i.placeholder||''));
    if (!dateEl) dateEl = $all('input')[0];
    // time: prefer [type=time], else placeholder HH:mm, else second input
    let timeEl = $('input[type="time"]') || $all('input').find(i => /(hh:?\s?mm|HH:?\s?mm)/i.test(i.placeholder||''));
    if (!timeEl) timeEl = $all('input')[1];
    // button
    let btn = findButtonByText('사주 보기') || findButtonByText('보기') || $('button');
    return {dateEl, timeEl, btn};
  }
  function ensureResultBox(){
    let box = document.getElementById('saju-result-box');
    if (!box){
      box = document.createElement('div');
      box.id = 'saju-result-box';
      box.style.marginTop = '16px';
      box.style.padding = '16px';
      box.style.borderRadius = '12px';
      box.style.background = 'rgba(255,255,255,0.86)';
      box.style.border = '1px solid #dbeafe';
      document.body.appendChild(box);
    }
    return box;
  }
  function renderResult(box, data){
    const {yG,yZ,mG,mZ,dG,dZ,hG,hZ,counts} = data;
    box.innerHTML = `
      <h3 style="margin:0 0 8px 0">📌 사주 결과</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
        <div><b>연주</b><div>${yG}${yZ} (${stemElem[yG]}/${branchElem[yZ]})</div></div>
        <div><b>월주</b><div>${mG}${mZ} (${stemElem[mG]}/${branchElem[mZ]})</div></div>
        <div><b>일주</b><div>${dG}${dZ} (${stemElem[dG]}/${branchElem[dZ]})</div></div>
        <div><b>시주</b><div>${hG}${hZ} (${stemElem[hG]}/${branchElem[hZ]})</div></div>
      </div>
      <h4 style="margin:12px 0 6px">🌿 오행 구성</h4>
      <div>목:${counts["목"]} · 화:${counts["화"]} · 토:${counts["토"]} · 금:${counts["금"]} · 수:${counts["수"]}</div>
      <div style="margin-top:8px;color:#334155;font-size:.92rem;">※ 연·월주는 24절기 <u>천문 절입시각</u> 기준, 일주는 1984-02-02 甲子일 기준, 시주는 자시 체계를 적용했습니다.</div>
    `;
  }
  function parseYyyymmdd(val){
    const s = (val||'').replace(/\D/g,'');
    if (s.length===8){
      return {Y:+s.slice(0,4), M:+s.slice(4,6), D:+s.slice(6,8)};
    }
    return null;
  }

  function onCompute(){
    const {dateEl, timeEl} = detectInputs();
    const valDate = dateEl?.value || dateEl?.valueAsDate ? null : null;
    let YMD = null;
    if (dateEl && dateEl.type==='date' && dateEl.value){
      const d = new Date(dateEl.value);
      YMD = {Y:d.getFullYear(), M:d.getMonth()+1, D:d.getDate()};
    } else if (dateEl){
      YMD = parseYyyymmdd(dateEl.value);
    }
    if (!YMD){ alert('생년월일을 yyyymmdd 또는 date 필드로 입력해주세요.'); return; }

    let HH=0, MM=0;
    if (timeEl && timeEl.type==='time' && timeEl.value){
      const [h,m]=timeEl.value.split(':'); HH=+h; MM=+m;
    } else if (timeEl && timeEl.value){
      const m = timeEl.value.match(/(\d{1,2})\D(\d{1,2})/);
      if (m){ HH=+m[1]; MM=+m[2]; } else { alert('출생 시각은 HH:mm 형식으로 입력해주세요.'); return; }
    } else { alert('출생 시각은 HH:mm 형식으로 입력해주세요.'); return; }

    // Assume KST (UTC+9) if not specified elsewhere
    const tzHours = 9;
    // construct UTC date from KST components
    const dtUTC = new Date(Date.UTC(YMD.Y, YMD.M-1, YMD.D, HH - tzHours, MM, 0));
    const local = new Date(dtUTC.getTime() + tzHours*3600*1000);

    const [yG,yZ] = yearPillarByLichun(local, tzHours);
    const [mG,mZ] = monthBySolarTerms(local, tzHours);
    const [dG,dZ] = dayPillar(local);
    const hZ = hourBranchByLocalHour(local.getHours());
    const hG = hourStem(dG, hZ);
    const counts = (function(gz){ const c={"목":0,"화":0,"토":0,"금":0,"수":0}; gz.forEach(([g,z])=>{ c[stemElem[g]]++; c[branchElem[z]]++;}); return c;})([[yG,yZ],[mG,mZ],[dG,dZ],[hG,hZ]]);

    renderResult(ensureResultBox(), {yG,yZ,mG,mZ,dG,dZ,hG,hZ,counts});
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const {btn} = detectInputs();
    if (btn){
      btn.addEventListener('click', (e)=>{ e.preventDefault(); onCompute(); });
    } else {
      console.warn('사주 보기 버튼을 찾지 못했습니다. 버튼 텍스트를 "사주 보기"로 해주세요.');
    }
  });
})();
