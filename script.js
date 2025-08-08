
(function(){
  // ==========================
  // Constants & Maps
  // ==========================
  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const stemElem = {"갑":"목","을":"목","병":"화","정":"화","무":"토","기":"토","경":"금","신":"금","임":"수","계":"수"};
  const branchElem = {"자":"수","축":"토","인":"목","묘":"목","진":"토","사":"화","오":"화","미":"토","신":"금","유":"금","술":"토","해":"수"};

  // ==========================
  // Julian Day & Time helpers
  // ==========================
  function toJulianDay(y,m,d){
    const a = Math.floor((14-m)/12);
    const y2 = y + 4800 - a;
    const m2 = m + 12*a - 3;
    return d + Math.floor((153*m2+2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
  }
  function jdFromDate(dt){ // dt is Date in UTC
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth()+1;
    const d = dt.getUTCDate();
    const h = dt.getUTCHours();
    const min = dt.getUTCMinutes();
    const s = dt.getUTCSeconds() + dt.getUTCMilliseconds()/1000;
    const JD0 = toJulianDay(y,m,d);
    return JD0 + (h + (min + s/60)/60)/24;
  }
  function dateFromJD(jd){
    // Inverse (approx) to get UTC Date from JD
    // Algorithm per Fliegel-Van Flandern inverse
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

  // ==========================
  // Solar longitude (approx)
  // ==========================
  // Low-precision Meeus-style algorithm for Sun's apparent longitude (~0.01-0.02 rad accuracy),
  // good enough to locate solar term crossings within hour-scale for 1900-2100.
  function sunEclipticLongitude(jd){
    const T = (jd - 2451545.0)/36525.0;
    const L0 = (280.46646 + 36000.76983*T + 0.0003032*T*T) % 360; // mean longitude
    const M  = (357.52911 + 35999.05029*T - 0.0001537*T*T) * Math.PI/180; // anomaly (rad)
    const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(M)
            + (0.019993 - 0.000101*T)*Math.sin(2*M)
            + 0.000289*Math.sin(3*M);
    let lam = L0 + C; // true longitude (deg)
    // aberration & nutation small; add -0.00569 - 0.00478*sin(Ω) for apparent longitude
    const Omega = (125.04 - 1934.136*T) * Math.PI/180;
    lam = lam - 0.00569 - 0.00478*Math.sin(Omega)*180/Math.PI;
    lam = (lam % 360 + 360) % 360;
    return lam; // degrees
  }

  // ==========================
  // 24 Solar terms
  // ==========================
  // Terms (centered on ecliptic longitude L = 0°,15°,30°,...,345°). We'll use the "중기/절기" set.
  // For month boundaries we need the 12 "절" (15°,45°,75°,...,345°). 寅月 starts at 315° (立春).
  const termNames = [
    "소한","대한","입춘","우수","경칩","춘분","청명","곡우",
    "입하","소만","망종","하지","소서","대서","입추","처서",
    "백로","추분","한로","상강","입동","소설","대설","동지"
  ];
  // target longitudes for each index (0..23) starting from 小寒 at 285° then step +15°
  function termLongitudeDeg(idx){
    return (285 + 15*idx) % 360; // 小寒 285°, 大寒 300°, 立春 315°, ...
  }

  // Find time when sun longitude crosses target between two JDs via binary search
  function findTermTimeJD(yearUTC, idx){
    // initial guess window: from mid of previous month to mid of this month
    // We'll bracket around each month roughly (15 days span)
    // Compute rough month center near expected date: each term ~ 15.2184 days apart
    const approxDaysFromJan = idx*15.2184; // from Jan 1
    const jdJan1 = toJulianDay(yearUTC,1,1) - 0.5; // 0h UTC
    let lo = jdJan1 + approxDaysFromJan - 10;
    let hi = jdJan1 + approxDaysFromJan + 10;
    const target = termLongitudeDeg(idx);

    // normalize function to measure signed delta in degrees (-180..180)
    function delta(lon){
      let d = lon - target;
      d = ((d + 180) % 360 + 360) % 360 - 180;
      return d;
    }
    // Binary search
    for (let k=0;k<60;k++){
      const mid = (lo+hi)/2;
      const dmid = delta(sunEclipticLongitude(mid));
      const dlo = delta(sunEclipticLongitude(lo));
      if (Math.abs(hi-lo) < 1e-6) return mid;
      if (dlo===0) return lo;
      if ((dlo<0 && dmid>0) || (dlo>0 && dmid<0)) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    return (lo+hi)/2;
  }

  // Get all term times for a year in UTC Date[]
  function solarTermsForYear(yearUTC){
    const arr = [];
    for (let i=0;i<24;i++){
      const jd = findTermTimeJD(yearUTC, i);
      arr.push(dateFromJD(jd)); // UTC
    }
    return arr;
  }

  // Given local Date and tz offset hours, compute year pillar boundary at 입춘 (315°) and month pillar via 12 절
  // 寅월(입춘, 315°)부터 시작: 寅,卯,辰,巳,午,未,申,酉,戌,亥,子,丑
  function monthBySolarTerms(local, tzHours){
    const yUTC = local.getUTCFullYear();
    const termsUTC = solarTermsForYear(yUTC);
    // Convert to tz local
    const termsLocal = termsUTC.map(dt => new Date(dt.getTime() + tzHours*3600*1000));

    // Build "절" indices: 立春 idx=2, then every +2 is a 절 (2,4,6,...,22)
    const jeolIdxs = [2,4,6,8,10,12,14,16,18,20,22,0]; // note wrap: 24->0 next year
    // Build local times for these; for idx=0 (소한 of next year), fetch next year's 0
    const nextTermsUTC = solarTermsForYear(yUTC+1);
    const nextTermsLocal = nextTermsUTC.map(dt => new Date(dt.getTime() + tzHours*3600*1000));
    const jeolTimes = jeolIdxs.map(i => i===0 ? nextTermsLocal[0] : termsLocal[i]);

    // Month order names & branches
    const monthBranches = ["인","묘","진","사","오","미","신","유","술","해","자","축"];
    // Find which interval local time is in: [立春, next 절) -> 寅월, etc.
    let mIndex = 12; // default before 입춘 -> 丑월
    for (let i=0;i<jeolTimes.length;i++){
      const cur = jeolTimes[i];
      const nxt = jeolTimes[(i+1)%jeolTimes.length];
      // handle wrap at year end
      if (i<jeolTimes.length-1){
        if (local >= cur && local < nxt){ mIndex = i+1; break; }
      } else {
        // last interval (between next year's 소한 and 다음 입춘)
        const first = jeolTimes[0]; // next year's 소한
        if (local >= cur || local < first){ mIndex = 12; }
      }
    }
    const mBranch = monthBranches[(mIndex-1)%12];

    // Month stem depends on current year's stem (year pillar based on 입춘)
    const [yStem] = yearPillarByLichun(local, tzHours);
    const firstStemMap = {"갑":"병","기":"병","을":"무","경":"무","병":"경","신":"경","정":"임","임":"임","무":"갑","계":"갑"};
    const first = firstStemMap[yStem];
    const add = (mIndex-1);
    const idxFirst = stems.indexOf(first);
    const mStem = stems[(idxFirst + add) % 10];
    return [mStem, mBranch];
  }

  function yearPillarByLichun(local, tzHours){
    // Use 입춘 time to switch year pillar
    const yUTC = local.getUTCFullYear();
    const termsUTC = solarTermsForYear(yUTC);
    const lichunUTC = termsUTC[2]; // idx 2 = 입춘
    const lichunLocal = new Date(lichunUTC.getTime() + tzHours*3600*1000);
    const baseYear = (local >= lichunLocal) ? yUTC : (yUTC-1);
    const stemIdx = ((baseYear - 1984) % 10 + 10) % 10;
    const branchIdx = ((baseYear - 1984) % 12 + 12) % 12;
    return [stems[stemIdx], branches[branchIdx]];
  }

  // ==========================
  // Day/Hour Pillars
  // ==========================
  function dayPillar(dateLocal){
    // day pillar uses local date for midnight boundary
    const jd = toJulianDay(dateLocal.getFullYear(), dateLocal.getMonth()+1, dateLocal.getDate());
    // Reference 1984-02-02 (local) as 甲子
    const jdRef = toJulianDay(1984,2,2);
    const diff = jd - jdRef;
    const stem = stems[(diff % 10 + 10) % 10];
    const branch = branches[(diff % 12 + 12) % 12];
    return [stem, branch];
  }
  function hourBranchByLocalHour(h){
    const mapping = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
    if (h===23) return "자";
    return mapping[Math.floor(((h+1)%24)/2)];
  }
  function hourStem(dayStem, hBranch){
    const dIdx = stems.indexOf(dayStem);
    const hbIdx = ["자","축","인","묘","진","사","오","미","신","유","술","해"].indexOf(hBranch);
    return stems[((dIdx % 5) * 2 + hbIdx) % 10];
  }

  // ==========================
  // Coarse (fallback) mode
  // ==========================
  function coarseMonthPillar(local){
    // Previous coarse logic fallback
    function solarBoundaries(year){
      return [
        new Date(year, 0, 5),
        new Date(year, 1, 4),
        new Date(year, 2, 6),
        new Date(year, 3, 5),
        new Date(year, 4, 6),
        new Date(year, 5, 6),
        new Date(year, 6, 7),
        new Date(year, 7, 8),
        new Date(year, 8, 8),
        new Date(year, 9, 8),
        new Date(year,10, 7),
        new Date(year,11, 7),
      ];
    }
    const yr = local.getFullYear();
    const bounds = solarBoundaries(yr);
    let mIndex = 12;
    if (local < bounds[0]) {
      mIndex = 12;
    } else {
      let i=0;
      for (; i<bounds.length-1; i++){
        if (local >= bounds[i] && local < bounds[i+1]) break;
      }
      const order = [12,1,2,3,4,5,6,7,8,9,10,11,12];
      mIndex = order[i+1];
    }
    const monthBranches = ["인","묘","진","사","오","미","신","유","술","해","자","축"];
    const mBranch = monthBranches[(mIndex-1)%12];
    const [yStem] = yearPillarByLichun(local, 0);
    const firstStemMap = {"갑":"병","기":"병","을":"무","경":"무","병":"경","신":"경","정":"임","임":"임","무":"갑","계":"갑"};
    const first = firstStemMap[yStem];
    const add = (mIndex-1);
    const idxFirst = stems.indexOf(first);
    const mStem = stems[(idxFirst + add) % 10];
    return [mStem, mBranch];
  }

  // ==========================
  // UI & Compute
  // ==========================
  function countElements(gzList){
    const counts = {"목":0,"화":0,"토":0,"금":0,"수":0};
    gzList.forEach(([g,z])=>{
      counts[stemElem[g]] += 1;
      counts[branchElem[z]] += 1;
    });
    return counts;
  }
  function formatGZ(g,z){ return g+z + ` (${stemElem[g]}/${branchElem[z]})`; }

  function compute(){
    const errEl = document.getElementById('error');
    errEl.style.display='none'; errEl.textContent='';
    const bd = (document.getElementById('birthdate').value||'').trim();
    const bt = (document.getElementById('birthtime').value||'').trim();
    const tzOffset = parseInt(document.getElementById('tz').value,10);
    const precise = (document.getElementById('precisionMode').value === 'precise');

    if (!bd || !bt){
      errEl.style.display='block';
      errEl.textContent = '생년월일과 출생 시각을 모두 입력해주세요. (정통 기준상 시각은 필수)';
      return;
    }
    const [Y,M,D] = bd.split('-').map(Number);
    const [h,m] = bt.split(':').map(Number);

    // Build "local time" in given tz as JS Date in UTC internally
    const dtUTC = new Date(Date.UTC(Y, M-1, D, h - tzOffset, m, 0));

    // For pillars we operate in local time of the chosen tz by simply shifting the UTC date
    const local = new Date(dtUTC.getTime() + tzOffset*3600*1000);
    // Year
    const [yG, yZ] = yearPillarByLichun(local, tzOffset);
    // Month
    const [mG, mZ] = precise ? monthBySolarTerms(local, tzOffset) : coarseMonthPillar(local);
    // Day
    const [dG, dZ] = dayPillar(local);
    // Hour
    const hZ = hourBranchByLocalHour(local.getHours());
    const hG = hourStem(dG, hZ);

    document.getElementById('y_gz').textContent = formatGZ(yG,yZ);
    document.getElementById('m_gz').textContent = formatGZ(mG,mZ);
    document.getElementById('d_gz').textContent = formatGZ(dG,dZ);
    document.getElementById('h_gz').textContent = formatGZ(hG,hZ);

    const counts = countElements([[yG,yZ],[mG,mZ],[dG,dZ],[hG,hZ]]);
    const elUL = document.getElementById('elements');
    elUL.innerHTML = '';
    ["목","화","토","금","수"].forEach(k=>{
      const li = document.createElement('li');
      li.textContent = `${k}: ${counts[k]}`;
      elUL.appendChild(li);
    });

    const notes = document.getElementById('notes');
    notes.innerHTML = precise
      ? `<b>정밀 모드:</b> 24절기 <u>천문 절입시각</u>을 실시간 계산해 월·연 경계를 판정했습니다.`
      : `<b>간이 모드:</b> 절기 경계를 고정 날짜로 적용했습니다. 경계일 출생은 정밀 모드 사용을 권장합니다.`;

    document.getElementById('result').style.display='block';
  }

  document.getElementById('compute').addEventListener('click', compute);
})();
