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
        <p><strong>일주:</strong> ${dayGanji} (${elements[dayStem]}오행)</p>
      </div>
      ${chartHTML}
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


function renderMonthlyLuckChart() {
  const ctx = document.getElementById('luckChart2').getContext('2d');
  if (window.monthChart instanceof Chart) window.monthChart.destroy();

  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const scores = [55, 58, 62, 67, 70, 65, 60, 63, 66, 72, 75, 78]; // 예시 점수

  window.monthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: '2025년 월별 운세 점수',
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
        <p><strong>일주:</strong> ${dayGanji} (${elements[dayStem]}오행)</p>
      </div>
      ${chartHTML}
    `;

    renderLuckChart();
    renderMonthlyLuckChart();
  });
};