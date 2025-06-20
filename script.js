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
    const yearGanji = gan[adjustedYear % 10] + ji[adjustedYear % 12];

    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourGanji = gan[(adjustedYear + hourIndex) % 10] + ji[hourIndex];

    const randomDay = day % 10;
    const dayStem = gan[randomDay] || '계';
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
        <p><strong>시주:</strong> ${hourGanji}</p>
        <p><strong>일간:</strong> ${dayStem} (${elements[dayStem]}오행)</p>
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