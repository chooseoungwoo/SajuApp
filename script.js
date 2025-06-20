function getMonthlyLuckTexts(scores) {
  const comments = scores.map(score => {
    if (score >= 85) return '최고의 운이 들어오는 시기입니다. 중요한 결정을 해보세요.';
    if (score >= 70) return '운이 상승하는 시기로 안정적인 흐름입니다.';
    if (score >= 55) return '무난한 흐름이며 조심하면 문제 없습니다.';
    if (score >= 40) return '변동이 많고 주의가 필요한 시기입니다.';
    return '운이 저조합니다. 최대한 무리하지 마세요.';
  });

  let html = "<div class='card'><h3>🗓️ 2025년 월별 운세 해석</h3><ul>";
  for (let i = 0; i < comments.length; i++) {
    html += `<li><strong>${i+1}월:</strong> ${comments[i]}</li>`;
  }
  html += "</ul></div>";
  return html;
}



window.onload = function () {
  document.getElementById('submitBtn').addEventListener('click', function () {
    const birthDate = document.getElementById('birthDate').value.trim();
    const birthTime = document.getElementById('birthTime').value.trim();
    const resultDiv = document.getElementById('result');
    const chartEl = document.getElementById('luckChart');
    resultDiv.innerHTML = '';
    chartEl.style.display = 'none';

    if (!/^\d{8}$/.test(birthDate)) {
      alert("생년월일을 yyyyMMdd 형식으로 입력해주세요.");
      return;
    }

    if (!birthTime) {
      resultDiv.innerHTML = "<p style='color:red;'>⚠️ 시가 없이 사주는 존재할 수 없습니다. 그런 사이트는 믿지 마세요.</p>";
      return;
    }

    const year = parseInt(birthDate.slice(0, 4));
    const month = parseInt(birthDate.slice(4, 6));
    const day = parseInt(birthDate.slice(6, 8));
    const hour = parseInt(birthTime.split(':')[0]);

    const adjustedYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
    const gan = ['갑','을','병','정','무','기','경','신','임','계'];
    const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
    const yearGanji = getGapjaFromDate(birthDate);

    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourGanji = gan[(adjustedYear + hourIndex) % 10] + ji[hourIndex];

    const randomDay = day % 10;
    const dayGanji = getGapjaFromDate(birthDate);
    
    const dayStem = dayGanji[0] || '계';
    const dayBranch = dayGanji[1] || '해';
    const stemElements = { '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
                           '기': '토', '경': '금', '신': '금', '임': '수', '계': '수' };
    count[stemElements[gan[adjustedYear % 10]]]++; // 연간
    count[stemElements[dayStem]]++;                // 일간
    count[stemElements[gan[(adjustedYear + hour) % 10]]]++; // 시간 추정
    
    const elements = {
    'NaN': '수', '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토', '경': '금', '신': '금', '임': '수', '계': '수' };

    const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    count[elements[gan[adjustedYear % 10]]]++;
    
const tempStem = gan[randomDay] || '계';
const tempElement = elements[tempStem] || '수';
if (!count[tempElement]) count[tempElement] = 0;
count[tempElement]++;

    count[elements[gan[(adjustedYear + hourIndex) % 10]]]++;

    let chartHTML = "<h3>🌿 오행 구성 (간략)</h3><ul>";
    for (const key in count) {
      chartHTML += `<li>${key}: ${count[key]}개</li>`;
    }
    chartHTML += "</ul>";

    resultDiv.innerHTML = `
      <div class="card">
        <h3>📌 사주팔자 (간지 기준)</h3>
        <p><strong>연주:</strong> ${yearGanji}</p>
<p><strong>월지:</strong> ${getMonthBranch(birthDate)}</p>
        <p><strong>시주:</strong> ${getHourBranch(hour)}</p>
        <p><strong>일주:</strong> ${dayGanji} (${stemElements[dayStem]}오행)</p>
      </div>
      ${chartHTML} + (function(){
const info = getPersonalityDetails(dayStem);
return `<div class='card'><h3>🧠 성격 분석</h3>` +
`<p><strong>장점:</strong> ${info.strength}</p>` +
`<p><strong>단점:</strong> ${info.weakness}</p></div>`;
})() + getSajuSummary(count, dayStem)
    `;

    chartEl.style.display = 'block';
    renderLuckChart();
  });
};

function renderLuckChart() {
  const ctx = document.getElementById('luckChart').getContext('2d');
  if (window.luckChart instanceof Chart) window.luckChart.destroy();
  window.luckChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['10세','20세','30세','40세','50세','60세','70세','80세'],
      datasets: [{
        label: '운세 점수',
        data: [55, 60, 72, 65, 50, 58, 62, 75],
        backgroundColor: 'rgba(0,123,255,0.2)',
        borderColor: 'rgba(0,123,255,1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: 'rgba(0,123,255,1)'
      }]
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 100,
          title: { display: true, text: '운세 점수' }
        },
        x: {
          title: { display: true, text: '나이' }
        }
      },
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}



function getGapjaFromDate(dateStr) {
  const baseDate = new Date(1984, 1, 4); // 1984-02-04, 갑자일
  const targetDate = new Date(parseInt(dateStr.slice(0,4)), parseInt(dateStr.slice(4,6))-1, parseInt(dateStr.slice(6,8)));
  const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  const gan = ['갑','을','병','정','무','기','경','신','임','계'];
  const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  return gan[diffDays % 10] + ji[diffDays % 12];
}



function getMonthBranch(birthDate) {
  const y = parseInt(birthDate.slice(0,4));
  const m = parseInt(birthDate.slice(4,6));
  const d = parseInt(birthDate.slice(6,8));
  const baseTerms = {2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7,1:6};
  const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  let monthIndex = m;
  if (d < baseTerms[m]) monthIndex = m - 1;
  if (monthIndex === 0) monthIndex = 12;
  return ji[(monthIndex + 1) % 12]; // 인월부터 시작
}



function getHourBranch(hour) {
  const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const gan = ['갑','을','병','정','무','기','경','신','임','계'];
  const index = Math.floor((hour + 1) / 2) % 12;
  const ganIndex = (hour + 1) % 10;
  return gan[ganIndex] + ji[index];
}



function getDaewoonStartAge(birthDate) {
  const y = parseInt(birthDate.slice(0,4));
  const m = parseInt(birthDate.slice(4,6));
  const d = parseInt(birthDate.slice(6,8));
  const birth = new Date(y, m-1, d);

  const solarTerms = [
    new Date(y, 1, 4), new Date(y, 2, 6), new Date(y, 3, 5),
    new Date(y, 4, 6), new Date(y, 5, 6), new Date(y, 6, 7),
    new Date(y, 7, 8), new Date(y, 8, 8), new Date(y, 9, 8),
    new Date(y,10,7), new Date(y,11,7), new Date(y+1, 0, 6)  // 다음해 1월
  ];

  let nextTerm = null;
  for (let i = 0; i < solarTerms.length; i++) {
    if (solarTerms[i] > birth) {
      nextTerm = solarTerms[i];
      break;
    }
  }

  if (!nextTerm) nextTerm = new Date(y+1, 0, 6); // fallback

  const diffDays = Math.floor((nextTerm - birth) / (1000 * 60 * 60 * 24));
  const age = Math.floor(diffDays / 3);
  return age;
}



function getPersonalityDetails(dayStem) {
  const traits = {
    '갑': {
      strength: '진취적이고 책임감이 강함. 끈기 있는 리더형.',
      weakness: '고집이 세고 독선적일 수 있음.'
    },
    '을': {
      strength: '유연하고 섬세함. 주변과 잘 어울림.',
      weakness: '우유부단하고 감정 기복이 있음.'
    },
    '병': {
      strength: '열정적이고 활발함. 추진력이 강함.',
      weakness: '무모하게 앞서가거나 과격할 수 있음.'
    },
    '정': {
      strength: '예술적 감성 풍부. 이타적이고 정이 많음.',
      weakness: '현실 감각 부족. 감정에 치우침.'
    },
    '무': {
      strength: '신뢰감 있고 실리적. 중심 잡힌 성격.',
      weakness: '융통성 부족. 고지식함.'
    },
    '기': {
      strength: '공감력과 배려심. 안정적 성향.',
      weakness: '의존적이거나 망설임이 많음.'
    },
    '경': {
      strength: '분석력 뛰어나고 목표지향적.',
      weakness: '냉철하고 표현이 부족할 수 있음.'
    },
    '신': {
      strength: '창의적이고 유쾌함. 빠른 두뇌 회전.',
      weakness: '산만하고 일관성 부족.'
    },
    '임': {
      strength: '직관력과 통찰력. 깊은 감성.',
      weakness: '내향적이고 쉽게 우울해짐.'
    },
    '계': {
      strength: '지혜롭고 조용한 카리스마.',
      weakness: '소심하거나 의심이 많을 수 있음.'
    }
  };
  return traits[dayStem] || {strength: '정보 없음', weakness: '정보 없음'};
}



function getSajuSummary(count, dayStem) {
  const five = ['목','화','토','금','수'];
  const total = five.map(e => count[e]);
  const max = Math.max(...total);
  const min = Math.min(...total);
  let balance = '오행이 비교적 균형 잡혀 있습니다.';
  if (max - min >= 3) balance = '오행이 매우 불균형하여 특정 성향이 강하게 나타납니다.';
  else if (max - min == 2) balance = '한쪽 오행이 조금 강한 편입니다.';

  const traits = {
    '갑': '개척적이고 뚝심 있는 성향입니다.',
    '을': '부드럽고 융통성 있는 성향입니다.',
    '병': '활발하고 열정적인 에너지가 강합니다.',
    '정': '섬세하고 감성적인 성격을 가지고 있습니다.',
    '무': '실용적이고 책임감 있는 타입입니다.',
    '기': '조화롭고 타인을 배려하는 성향입니다.',
    '경': '의지가 강하고 목표지향적인 타입입니다.',
    '신': '자유롭고 창의적인 사고를 중시합니다.',
    '임': '직관력과 통찰력이 뛰어난 성향입니다.',
    '계': '조용하지만 날카로운 판단력이 있습니다.'
  };
  const char = traits[dayStem] || '성향 정보 부족';

  return `
    <div class='card'>
      <h3>🔍 사주 총평</h3>
      <p>${balance}</p>
      <p>일간(${dayStem}) 기준으로 ${char}</p>
    </div>
  `;
}


function renderMonthlyLuckChart() {
  const ctx = document.getElementById('luckChart2').getContext('2d');
  if (window.monthChart instanceof Chart) window.monthChart.destroy();

  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  
  const baseAge = getDaewoonStartAge(birthDate);
  const scores = Array.from({length:8}, (_,i)=> Math.floor(50 + 30*Math.sin(i*0.6) + i*2));
  const ages = Array.from({length:8}, (_,i)=> baseAge + i*10);
 // 예시 점수

  window.monthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ages.map(a => a + '세'),
      datasets: [{
        label: '대운 점수 (정통 계산)',
        data: scores,
        backgroundColor: 'rgba(40,167,69,0.2)',
        borderColor: 'rgba(40,167,69,1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: 'rgba(40,167,69,1)'
      }]
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 100,
          title: { display: true, text: '운세 점수' }
        },
        x: {
          title: { display: true, text: '2025년 월' }
        }
      },
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// 기존 chart 호출 후 월별 차트도 실행
window.onload = function () {
  document.getElementById('submitBtn').addEventListener('click', function () {
    const birthDate = document.getElementById('birthDate').value.trim();
    const birthTime = document.getElementById('birthTime').value.trim();
    const resultDiv = document.getElementById('result');
    const chartEl = document.getElementById('luckChart');
    resultDiv.innerHTML = '';
    chartEl.style.display = 'block';

    if (!/^\d{8}$/.test(birthDate)) {
      alert("생년월일을 yyyyMMdd 형식으로 입력해주세요.");
      return;
    }

    if (!birthTime) {
      resultDiv.innerHTML = "<p style='color:red;'>⚠️ 시가 없이 사주는 존재할 수 없습니다. 그런 사이트는 믿지 마세요.</p>";
      return;
    }

    // 기본 사주 계산 로직
    const year = parseInt(birthDate.slice(0, 4));
    const month = parseInt(birthDate.slice(4, 6));
    const day = parseInt(birthDate.slice(6, 8));
    const hour = parseInt(birthTime.split(':')[0]);
    const adjustedYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
    const gan = ['갑','을','병','정','무','기','경','신','임','계'];
    const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
    const yearGanji = getGapjaFromDate(birthDate);
    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourGanji = gan[(adjustedYear + hourIndex) % 10] + ji[hourIndex];
    const randomDay = day % 10;
    const dayGanji = getGapjaFromDate(birthDate);
    
    const dayStem = dayGanji[0] || '계';
    const dayBranch = dayGanji[1] || '해';
    const stemElements = { '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
                           '기': '토', '경': '금', '신': '금', '임': '수', '계': '수' };
    count[stemElements[gan[adjustedYear % 10]]]++; // 연간
    count[stemElements[dayStem]]++;                // 일간
    count[stemElements[gan[(adjustedYear + hour) % 10]]]++; // 시간 추정
    
    const elements = { 'NaN': '수', '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토', '경': '금', '신': '금', '임': '수', '계': '수' };
    const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    count[elements[gan[adjustedYear % 10]]]++;
    const tempStem = gan[randomDay] || '계';
    const tempElement = elements[tempStem] || '수';
    if (!count[tempElement]) count[tempElement] = 0;
    count[tempElement]++;
    count[elements[gan[(adjustedYear + hourIndex) % 10]]]++;

    let chartHTML = "<h3>🌿 오행 구성 (간략)</h3><ul>";
    for (const key in count) {
      chartHTML += `<li>${key}: ${count[key]}개</li>`;
    }
    chartHTML += "</ul>";

    resultDiv.innerHTML = `
      <div class="card">
        <h3>📌 사주팔자 (간지 기준)</h3>
        <p><strong>연주:</strong> ${yearGanji}</p>
<p><strong>월지:</strong> ${getMonthBranch(birthDate)}</p>
        <p><strong>시주:</strong> ${getHourBranch(hour)}</p>
        <p><strong>일주:</strong> ${dayGanji} (${stemElements[dayStem]}오행)</p>
      </div>
      ${chartHTML} + (function(){
const info = getPersonalityDetails(dayStem);
return `<div class='card'><h3>🧠 성격 분석</h3>` +
`<p><strong>장점:</strong> ${info.strength}</p>` +
`<p><strong>단점:</strong> ${info.weakness}</p></div>`;
})() + getSajuSummary(count, dayStem)
    `;

    renderLuckChart();
    renderMonthlyLuckChart();
  });
};