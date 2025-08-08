
(function(){
  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
  const stemElem = {"갑":"목","을":"목","병":"화","정":"화","무":"토","기":"토","경":"금","신":"금","임":"수","계":"수"};
  const branchElem = {"자":"수","축":"토","인":"목","묘":"목","진":"토","사":"화","오":"화","미":"토","신":"금","유":"금","술":"토","해":"수"};

  // Fixed solar term boundaries (approx, local calendar)
  function solarBoundaries(year){
    // months are 1-12. return Date objects in local time.
    // Boundaries are when new solar month starts:
    // 1: 小寒 1/5, 2: 立春 2/4, 3: 惊蛰 3/6, 4: 清明 4/5, 5: 立夏 5/6, 6: 芒种 6/6,
    // 7: 小暑 7/7, 8: 立秋 8/8, 9: 白露 9/8, 10: 寒露 10/8, 11: 立冬 11/7, 12: 大雪 12/7
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

  // Year pillar: change at LiChun (Feb 4 approx)
  function yearPillar(date){
    const yr = date.getFullYear();
    const [xiaoHan, liChun] = solarBoundaries(yr);
    const baseYear = (date >= liChun) ? yr : (yr-1);
    // 1984 is 甲子 year
    const stemIdx = ((baseYear - 1984) % 10 + 10) % 10;
    const branchIdx = ((baseYear - 1984) % 12 + 12) % 12;
    return [stems[stemIdx], branches[branchIdx]];
  }

  // Month pillar: 寅月 starts at LiChun (around Feb 4)
  function monthPillar(date){
    const yr = date.getFullYear();
    const bounds = solarBoundaries(yr);
    // Determine month index from 寅月=1 ... 丑月=12
    // If date<1/5 (小寒) => previous year's 11th or 12th month; handle by shifting date by -1 day until we hit >=1/5.
    let refDate = new Date(date.getTime());
    if (refDate < bounds[0]) {
      // treat as previous year's 12th solar month (丑月), and year pillar for month uses previous year
      // We'll compute month index by moving to previous year boundaries
      const prevBounds = solarBoundaries(yr-1);
      // if date >= prevBounds[10](11/7) and < prevBounds[11](12/7) => 11th (子月)
      // if date >= prevBounds[11](12/7) => 12th (丑月)
      if (refDate >= prevBounds[10] && refDate < prevBounds[11]) {
        var mIndex = 11; // 子月
      } else {
        var mIndex = 12; // 丑月
      }
      var yStem = yearPillar(new Date(yr-1,1,4))[0]; // year stem for months
    } else {
      // find index i where bounds[i] <= date < bounds[i+1]
      let i=0;
      for (; i<bounds.length-1; i++){
        if (refDate >= bounds[i] && refDate < bounds[i+1]) break;
      }
      // month order from 寅(1) at 2/4 boundary
      // mapping: bounds[1] -> 寅(1), [2]->卯(2), ..., [11]->丑(12), [0]->丑월 이전 구간은 작년 처리
      const order = [12,1,2,3,4,5,6,7,8,9,10,11,12]; // index by boundary slot i (0..11)
      var mIndex = order[i+1]; // because i is boundary start
      var yStem = yearPillar(refDate)[0];
    }
    // Month branch index: 寅=2 in branches array (0-based -> 2)
    const monthBranchIdxFromYin = (mIndex-1 + 2) % 12; // 0-based
    const mBranch = branches[monthBranchIdxFromYin];

    // Month stem depends on year's stem group:
    const firstStemMap = {
      // 寅월의 천간
      "갑":"병","기":"병",
      "을":"무","경":"무",
      "병":"경","신":"경",
      "정":"임","임":"임",
      "무":"갑","계":"갑"
    };
    const first = firstStemMap[yStem];
    const add = (mIndex-1); // advance from 寅월
    const idxFirst = stems.indexOf(first);
    const mStem = stems[(idxFirst + add) % 10];
    return [mStem, mBranch];
  }

  // Day pillar using 1984-02-02 as JiaZi day
  function toJulianDay(y,m,d){
    // Fliegel–Van Flandern algorithm
    const a = Math.floor((14 - m)/12);
    const y2 = y + 4800 - a;
    const m2 = m + 12*a - 3;
    return d + Math.floor((153*m2 + 2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
  }
  function dayPillar(date){
    const jd = toJulianDay(date.getFullYear(), date.getMonth()+1, date.getDate());
    const jdRef = toJulianDay(1984,2,2); // JiaZi
    const diff = jd - jdRef;
    const stem = stems[(diff % 10 + 10) % 10];
    const branch = branches[(diff % 12 + 12) % 12];
    return [stem, branch];
  }

  // Hour pillar
  function hourBranch(h){
    // 子:23~00:59, 丑:01~02:59, 寅:03~04:59, ... (KST or given tz applied before)
    // We'll map by hour only assuming minute boundaries.
    const slots = [
      ["자",23,24],["자",0,1],
      ["축",1,3],["인",3,5],["묘",5,7],["진",7,9],["사",9,11],
      ["오",11,13],["미",13,15],["신",15,17],["유",17,19],["술",19,21],["해",21,23]
    ];
    // simpler: compute 2-hour slot starting at 23
    let idx;
    if (h===23) idx=0;
    else idx = Math.floor(((h+1) % 24)/2) + 1; // 0..11+1 -> 1..12
    const mapping = ["자","축","인","묘","진","사","오","미","신","유","술","해"];
    return mapping[idx%12];
  }
  function hourStem(dayStem, hBranch){
    // hour stem index = ( (dayStemIdx %5) *2 + hBranchIdx ) %10
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

  function formatGZ(g,z){
    return g+z + ` (${stemElem[g]}/${branchElem[z]})`;
  }

  function compute(){
    const errEl = document.getElementById('error');
    errEl.style.display='none'; errEl.textContent='';
    const bd = (document.getElementById('birthdate').value||'').trim();
    const bt = (document.getElementById('birthtime').value||'').trim();
    const tzOffset = parseInt(document.getElementById('tz').value,10);

    if (!bd || !bt){
      errEl.style.display='block';
      errEl.textContent = '생년월일과 출생 시각을 모두 입력해주세요. (정통 기준상 시각은 필수)';
      return;
    }
    const [Y,M,D] = bd.split('-').map(Number);
    const [h,m] = bt.split(':').map(Number);
    // Apply timezone offset to local Date object by constructing in UTC then shifting
    const dateUTC = new Date(Date.UTC(Y, M-1, D, h - tzOffset, m, 0));
    // For pillar calculations we want local time in the given tz; transform to that local
    const local = new Date(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate(), dateUTC.getUTCHours(), dateUTC.getUTCMinutes());

    // Calculate pillars
    const [yG, yZ] = yearPillar(local);
    const [mG, mZ] = monthPillar(local);
    const [dG, dZ] = dayPillar(local);
    const hZ = hourBranch(local.getHours());
    const hG = hourStem(dG, hZ);

    // Populate UI
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
    notes.innerHTML = `<b>알림:</b> 월주 계산은 절기 경계를 <u>고정 날짜(간이)</u>로 적용했습니다. 실제 절입 시각은 연도별로 수 시간~하루 차이가 날 수 있으니, 경계일 주변 출생은 전문가 교차검증을 권합니다.`;

    document.getElementById('result').style.display='block';
  }

  document.getElementById('compute').addEventListener('click', compute);
})();
