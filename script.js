
function getSajuPillars(year, month, day, hour) {
  const heavenlyStems = ['갑','을','병','정','무','기','경','신','임','계'];
  const earthlyBranches = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  const baseYear = 1984;
  const diff = year - baseYear;
  const yearStem = heavenlyStems[diff % 10];
  const yearBranch = earthlyBranches[diff % 12];

  const monthStem = heavenlyStems[(diff * 2 + month) % 10];
  const monthBranch = earthlyBranches[(month + 1) % 12];

  const dayStem = heavenlyStems[(year + month + day) % 10];
  const dayBranch = earthlyBranches[(year + month + day) % 12];

  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourStem = heavenlyStems[(dayStem.charCodeAt(0) + hourIndex) % 10];
  const hourBranch = earthlyBranches[hourIndex];

  return {
    year: yearStem + yearBranch,
    month: monthStem + monthBranch,
    day: dayStem + dayBranch,
    hour: hourStem + hourBranch,
    dayStem,
    stems: [yearStem, monthStem, dayStem, hourStem],
    branches: [yearBranch, monthBranch, dayBranch, hourBranch]
  };
}

function getElementCounts(stems, branches) {
  const elementMap = {
    '갑': '목', '을': '목', '인': '목', '묘': '목',
    '병': '화', '정': '화', '사': '화', '오': '화',
    '무': '토', '기': '토', '진': '토', '술': '토', '미': '토',
    '경': '금', '신': '금', '유': '금',
    '임': '수', '계': '수', '자': '수', '해': '수', '축': '수'
  };

  const all = stems.concat(branches);
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  all.forEach(ch => {
    const el = elementMap[ch];
    if (el) counts[el]++;
  });
  return counts;
}

function getPersonalityByDayStem(dayStem) {
  const personalityMap = {
    '갑': '직선적이고 리더십이 강한 성향. 개척자 스타일.',
    '을': '섬세하고 유연하며 참을성이 많음. 외유내강형.',
    '병': '열정적이고 존재감이 강하며 표현력이 뛰어남.',
    '정': '지적이고 차분하며 정돈된 성격. 예술적 기질.',
    '무': '묵직하고 책임감 강함. 신뢰받는 리더 스타일.',
    '기': '현실적이고 실용적이며 계산적인 성향.',
    '경': '냉철하고 판단력이 뛰어남. 승부사적 기질.',
    '신': '세련되고 외향적. 기획/전략에 능함.',
    '임': '자유롭고 유머러스. 창의적인 생각을 즐김.',
    '계': '신중하고 분석적이며 내면이 깊음.'
  };
  return personalityMap[dayStem] || '성격 정보 없음';
}

document.getElementById('saju-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const day = parseInt(document.getElementById('day').value);
  const hour = parseInt(document.getElementById('hour').value);

  const saju = getSajuPillars(year, month, day, hour);
  const elementCounts = getElementCounts(saju.stems, saju.branches);
  const personality = getPersonalityByDayStem(saju.dayStem);

  const resultDiv = document.getElementById('result');
  
  let totalSummary = '';
  const maxEl = Object.entries(elementCounts).sort((a,b)=>b[1]-a[1])[0][0];
  const minEl = Object.entries(elementCounts).sort((a,b)=>a[1]-b[1])[0][0];

  totalSummary += '<strong>총평:</strong> ';
  totalSummary += `당신은 <strong>${saju.dayStem}</strong>일주로, ${personality} `;
  totalSummary += `올해는 <strong>${maxEl}</strong> 기운이 강하고 <strong>${minEl}</strong> 기운이 부족합니다. `;
  if (elementCounts['목'] + elementCounts['화'] > elementCounts['금'] + elementCounts['수']) {
    totalSummary += '상반기보다 하반기 운세 흐름이 더 안정될 것으로 보입니다. ';
  } else {
    totalSummary += '초반 운이 비교적 강하므로 1~4월을 잘 활용해야 합니다. ';
  }
  totalSummary += '전체적으로 균형 잡힌 사고와 감정 조절이 관건이며, 감정적 반응보다는 신중한 태도가 필요한 해입니다.';

  resultDiv.innerHTML = `

    <h3>사주 결과</h3>
    <p>출생일시: ${year}-${month}-${day} ${hour}시</p>
    <p><strong>사주팔자:</strong> ${saju.year} / ${saju.month} / ${saju.day} / ${saju.hour}</p>
    <p><strong>오행 구성:</strong> 
      목 ${elementCounts['목']}, 
      화 ${elementCounts['화']}, 
      토 ${elementCounts['토']}, 
      금 ${elementCounts['금']}, 
      수 ${elementCounts['수']}</p>
    <p><strong>성격 요약:</strong> ${personality}</p>
    <p><strong>2025년 월별 운세:</strong> 아래 그래프 및 설명 참고</p>
  <ul style="text-align:left; margin:auto; max-width:500px;">
    <li><strong>1월:</strong> 조심스럽게 출발해야 하는 시기. 무리 금물.</li>
    <li><strong>2월:</strong> 기회가 슬며시 다가옴. 준비 태세 필요.</li>
    <li><strong>3월:</strong> 인간관계 호조, 연애운 상승 가능.</li>
    <li><strong>4월:</strong> 성과의 싹이 보임. 작은 성취 있음.</li>
    <li><strong>5월:</strong> 재정적으로 안정감 생기는 달.</li>
    <li><strong>6월:</strong> 피로 누적, 휴식이 필요한 시점.</li>
    <li><strong>7월:</strong> 갈등 주의. 말조심이 복을 부른다.</li>
    <li><strong>8월:</strong> 좋은 제안이 들어올 가능성 있음.</li>
    <li><strong>9월:</strong> 판단력 향상, 중요한 결단에 유리.</li>
    <li><strong>10월:</strong> 귀인의 도움이 들어오는 달.</li>
    <li><strong>11월:</strong> 일 처리 속도 개선. 체감 성과 존재.</li>
    <li><strong>12월:</strong> 한 해 정리와 내년 준비에 좋음.</li>
  </ul><p style='margin-top:20px;'>${totalSummary}</p>
  `;

  const ctx = document.getElementById('fortuneGraph').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      datasets: [{
        label: '2025년 운세 지수',
        data: [55, 60, 72, 80, 65, 50, 40, 45, 60, 70, 75, 85],
        fill: false,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
});
