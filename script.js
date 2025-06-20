document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submitBtn').addEventListener('click', () => {
    const birthDateStr = document.getElementById('birthDate').value.trim();
    const birthTimeStr = document.getElementById('birthTime').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    // 유효성 검사
    if (!/^\d{8}$/.test(birthDateStr)) {
      alert('생년월일을 БукмекерларMMDD 형식의 8자리 숫자로 입력해주세요. (예: 19850209)');
      return;
    }
    if (!birthTimeStr) {
      resultDiv.innerHTML = "<p style='color:red;'>⚠️ 시(時) 정보는 사주 분석에 필수적입니다. 출생 시각을 입력해주세요.</p>";
      return;
    }

    const year = parseInt(birthDateStr.slice(0, 4));
    const month = parseInt(birthDateStr.slice(4, 6));
    const day = parseInt(birthDateStr.slice(6, 8));
    const hour = parseInt(birthTimeStr.split(':')[0]);
    // const minute = parseInt(birthTimeStr.split(':')[1]); // 현재 사용되지 않음

    // 간지(干支) 배열
    const gan = ['갑','을','병','정','무','기','경','신','임','계']; // 천간 10
    const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해']; // 지지 12
    const elements = { // 오행 매핑
        '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
        '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
        '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토',
        '사': '화', '오': '화', '미': '토', '신': '금', '유': '금',
        '술': '토', '해': '수'
    };

    // --- 사주 팔자 계산 (간이 계산법 적용 - 정확성 한계 있음) ---
    // 실제 사주 계산은 매우 복잡하며, 정확한 절입일, 일진 등을 계산하는 라이브러리나
    // 천문력 데이터가 필요합니다. 이 코드는 개념적인 이해를 돕기 위한 간이 계산입니다.

    let yearGan, yearJi;
    let monthGan, monthJi;
    let dayGan, dayJi; // 일주 (일간 + 일지)
    let hourGan, hourJi;

    try {
        const sajuPillars = calculateSimplifiedSajuPillars(year, month, day, hour);
        yearGan = sajuPillars.year.gan;
        yearJi = sajuPillars.year.ji;
        monthGan = sajuPillars.month.gan;
        monthJi = sajuPillars.month.ji;
        dayGan = sajuPillars.day.gan;
        dayJi = sajuPillars.day.ji;
        hourGan = sajuPillars.hour.gan;
        hourJi = sajuPillars.hour.ji;
    } catch (error) {
        resultDiv.innerHTML = `<p style='color:red;'>사주 기본 정보 계산 중 오류가 발생했습니다: ${error.message}</p>`;
        return;
    }

    // 오행 개수 세기 (8글자 모두 포함)
    const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    count[elements[yearGan]]++;
    count[elements[yearJi]]++;
    count[elements[monthGan]]++;
    count[elements[monthJi]]++;
    count[elements[dayGan]]++;
    count[elements[dayJi]]++;
    count[elements[hourGan]]++;
    count[elements[hourJi]]++;

    let resultHTML = `
      <div class="card">
        <h3>📌 사주팔자 (간이 계산 기반)</h3>
        <p><strong>연주 (년):</strong> ${yearGan}${yearJi}</p>
        <p><strong>월주 (월):</b> ${monthGan}${monthJi} <span class="note">(월주 간이는 절입일 영향으로 실제와 다를 수 있습니다.)</span></p>
        <p><strong>일주 (일):</strong> ${dayGan}${dayJi} (일간: ${dayGan} - ${elements[dayGan]}오행) <span class="note">(일주 간지는 일진력 기준이므로 실제와 다를 수 있습니다.)</span></p>
        <p><strong>시주 (시):</strong> ${hourGan}${hourJi}</p>
      </div>
      <div class="card">
        <h3>🌿 오행 구성</h3>
        <ul>
          <li>목: ${count['목']}개</li>
          <li>화: ${count['화']}개</li>
          <li>토: ${count['토']}개</li>
          <li>금: ${count['금']}개</li>
          <li>수: ${count['수']}개</li>
        </ul>
      </div>
    `;
    resultDiv.innerHTML = resultHTML;

    // --- 육십갑자 주기 그래프 그리기 ---
    const ganjiCycle = [];
    for (let i = 0; i < 60; i++) {
        ganjiCycle.push(gan[i % 10] + ji[i % 12]);
    }

    const currentYearGanJi = yearGan + yearJi; // 계산된 연주 간지

    const ctx = document.getElementById('sixtyYearCycleChart').getContext('2d');
    if (window.sixtyYearCycleChartInstance) {
        window.sixtyYearCycleChartInstance.destroy(); // 기존 차트 인스턴스 파괴
    }

    const backgroundColors = ganjiCycle.map(gj => {
        return gj === currentYearGanJi ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.5)';
    });
    const borderColors = ganjiCycle.map(gj => {
        return gj === currentYearGanJi ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)';
    });

    window.sixtyYearCycleChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ganjiCycle, // 육십갑자 라벨
            datasets: [{
                label: '육십갑자 주기',
                data: Array(60).fill(1), // 각 간지를 동일한 높이로 표시
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    display: false
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 90,
                        minRotation: 90,
                        font: {
                            size: 8
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return `간지: ${context[0].label}`;
                        },
                        label: function(context) {
                            // 여기서는 단순한 바 차트이므로 추가 정보 없음
                            return '';
                        }
                    }
                }
            }
        }
    });
  });
});

/**
 * calculateSimplifiedSajuPillars: 사주 팔자를 간이 계산합니다.
 * !!! 중요: 이 함수는 정확한 사주 계산 로직이 아닙니다. !!!
 * 특히 월주와 일주는 절입일 및 일진력 계산이 매우 복잡하므로,
 * 여기서는 대략적인 규칙만을 적용했습니다.
 * 실제 정확한 사주를 원하시면 전문 라이브러리나 데이터를 사용해야 합니다.
 *
 * @param {number} year - 출생년도 (YYYY)
 * @param {number} month - 출생월 (MM)
 * @param {number} day - 출생일 (DD)
 * @param {number} hour - 출생시 (HH)
 * @returns {object} 연주, 월주, 일주, 시주의 간지 정보를 담은 객체
 */
function calculateSimplifiedSajuPillars(year, month, day, hour) {
    const gan = ['갑','을','병','정','무','기','경','신','임','계'];
    const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

    // 1. 연주 (年柱) 계산 - 입춘(立春) 기준 간이 계산
    // 양력 2월 4일 경을 기준으로 연도가 바뀐다고 가정 (정확한 절입일 아님)
    let adjustedYear = year;
    // 사주에서 연도는 입춘(보통 2월 4일경) 기준으로 바뀜.
    // 2월 4일 이전 출생자는 전년도 간지 적용 (정확한 절입일 계산이 아니므로 참고용)
    if (month < 2 || (month === 2 && day < 4)) {
        adjustedYear = year - 1;
    }
    const yearGan = gan[adjustedYear % 10];
    const yearJi = ji[adjustedYear % 12];


    // 2. 월주 (月柱) 계산 - 연간과 월에 따른 간이 계산 (정확한 절입일 아님)
    // 월주는 연간(年干)에 따라 시작 간지가 달라지고, 절입일에 따라 바뀝니다.
    // 여기서는 매우 간략화된 월별 간지를 가정 (정확도 낮음)
    const monthGanStartOffset = {
        '갑': 2, '을': 4, '병': 6, '정': 8, '무': 0, // 간이 계산 위한 임의 오프셋
        '기': 2, '경': 4, '신': 6, '임': 8, '계': 0
    };
    const simplifiedMonthGanOffsets = [
        0, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2 // 대략적인 월별 천간 오프셋 (정확도 낮음)
    ];

    // 월 천간 계산 (간이) - 연간에 따른 시작 오프셋 + 월별 오프셋
    let monthGanIndex = (gan.indexOf(yearGan) + simplifiedMonthGanOffsets[month - 1]) % 10;
    const monthGan = gan[monthGanIndex];

    // 월 지지 계산 (정확한 절입일 기준이어야 함. 여기서는 월 번호에 따른 간이 계산)
    const monthJiIndex = (month + 1) % 12; // 1월:축(1), 2월:인(2) ... 12월:자(0) - 간이 계산
    const monthJi = ji[monthJiIndex];


    // 3. 일주 (日柱) 계산 - 일진력 기반 (매우 복잡하므로 간이 계산)
    // 일주는 매일 달라지는 육십갑자 중 해당 날짜의 간지입니다.
    // 이는 특정 기준일로부터의 일수 계산이 필요하며, 매우 복잡합니다.
    // 여기서는 생일 숫자에 따른 간이 계산을 적용합니다. (정확도 매우 낮음)
    const dayGan = gan[day % 10]; // 일간은 생일의 일의 자리로 간이 계산
    const dayJi = ji[day % 12]; // 일지는 생일의 십의 자리+일의 자리 합 % 12 등으로 간이 계산 (정확도 매우 낮음)
                               // 실제는 특정 기준일(예: 0001년 1월 1일)부터 생일까지의 총 일수를 60으로 나눈 나머지로 계산

    // 4. 시주 (時柱) 계산 - 오서둔갑(五鼠遁甲) 규칙 기반 (간이 계산)
    // 시주는 일간(日干)에 따라 시작 시지(子時)의 천간이 달라집니다.
    // 자시(子時: 23:30~01:29), 축시(01:30~03:29) ... 해시(21:30~23:29)
    const hourBranchMapping = [ // 자(23:30), 축(01:30), 인(03:30) ... 해(21:30)
        '자','축','인','묘','진','사','오','미','신','유','술','해'
    ];
    // 출생 시각에 따른 시지 결정 (정확한 사주 시는 2시간 단위)
    const hourJi = hourBranchMapping[Math.floor((hour + 1) / 2) % 12]; // 00~01시 -> 자시(해당하는 0번째 지지)

    // 일간(dayGan)에 따른 시천간(時干) 오서둔갑 규칙 (간이화)
    const hourGanOffset = {
        '갑': 0, '을': 2, '병': 4, '정': 6, '무': 8, // 자시(子時) 천간 오프셋
        '기': 0, '경': 2, '신': 4, '임': 6, '계': 8
    };
    // 시천간 계산: (일간의 오프셋 + 시지의 인덱스) % 10
    const hourGan = gan[(gan.indexOf(dayGan) + Math.floor((hour + 1) / 2)) % 10];


    return {
        year: { gan: yearGan, ji: yearJi },
        month: { gan: monthGan, ji: monthJi },
        day: { gan: dayGan, ji: dayJi },
        hour: { gan: hourGan, ji: hourJi }
    };
}