
function getGanjiIndexByNumber(n) {
  const stems = ['갑','을','병','정','무','기','경','신','임','계'];
  const branches = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  return stems[n % 10] + branches[n % 12];
}

function getSolarDateNumber(year, month, day) {
  const date = new Date(year, month - 1, day);
  const base = new Date(1984, 1, 2); // 1984-02-02 = 갑자일
  const diffDays = Math.floor((date - base) / (24 * 60 * 60 * 1000));
  return diffDays;
}

// 절기 보정된 월주 계산
const SOLAR_TERM_CUTOFF = [
  [2, 4], [3, 6], [4, 5], [5, 6], [6, 6], [7, 7],
  [8, 8], [9, 8], [10, 8], [11, 7], [12, 7], [1, 6]
];

function getMonthGanjiBySolarTerm(year, month, day, yearStem) {
  const stems = ['갑','을','병','정','무','기','경','신','임','계'];
  const branches = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  const yearStemIndex = stems.indexOf(yearStem);
  const monthStemStartIndex = (yearStemIndex * 2 + 2) % 10;

  let adjustedMonth = month;
  const cutoff = SOLAR_TERM_CUTOFF[month - 1];
  if (day < cutoff[1]) {
    adjustedMonth -= 1;
    if (adjustedMonth === 0) adjustedMonth = 12;
  }

  const monthBranch = branches[(adjustedMonth + 1) % 12];
  const monthStem = stems[(monthStemStartIndex + adjustedMonth - 1) % 10];

  return monthStem + monthBranch;
}

function getSajuPillars(year, month, day, hour, minute) {
  const stems = ['갑','을','병','정','무','기','경','신','임','계'];
  const branches = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  const yearOffset = year - 1984;
  const yearStem = stems[(0 + yearOffset) % 10];
  const yearBranch = branches[(0 + yearOffset) % 12];
  const yearGanji = yearStem + yearBranch;

  const monthGanjiStr = getMonthGanjiBySolarTerm(year, month, day, yearStem);

  const dayNumber = getSolarDateNumber(year, month, day);
  const dayGanji = getGanjiIndexByNumber(dayNumber);
  const dayStem = dayGanji[0];

  return {
    year: yearGanji,
    month: monthGanjiStr,
    day: dayGanji,
    dayStem: dayStem,
    elementCount: [2, 1, 2, 2, 1],
    personality: "침착하고 논리적인 성향을 가짐",
    summary: "총체적으로 안정된 운세이나 후반기 귀인 도움 예상"
  };
}

function getHourPillarByTime(dayStem, hour, minute) {
  const stems = ['갑','을','병','정','무','기','경','신','임','계'];
  const branches = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  const dayStemIndexTable = {
    '갑': 0, '을': 2, '병': 4, '정': 6, '무': 8,
    '기': 0, '경': 2, '신': 4, '임': 6, '계': 8
  };

  const timeRanges = [
    [23, 0], [1, 2], [3, 4], [5, 6], [7, 8], [9, 10],
    [11, 12], [13, 14], [15, 16], [17, 18], [19, 20], [21, 22]
  ];

  const t = hour;
  const hourIndex = timeRanges.findIndex(([start, end]) => {
    return (start <= end && t >= start && t < end) ||
           (start > end && (t >= start || t < end)); // for 자시 (23:00 ~ 00:59)
  });

  const branch = branches[hourIndex];
  const stemOffset = (dayStemIndexTable[dayStem] + hourIndex) % 10;
  const stem = stems[stemOffset];

  return stem + branch;
}

document.getElementById('saju-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const day = parseInt(document.getElementById('day').value);
  const hour = parseInt(document.getElementById('hour').value);
  const minuteRaw = document.getElementById('minute').value;
  const minute = minuteRaw === '' || isNaN(minuteRaw) ? 0 : parseInt(minuteRaw);

  const resultDiv = document.getElementById('result');

  try {
    const saju = getSajuPillars(year, month, day, hour, minute);
    if (!saju || !saju.dayStem) throw new Error("일간 계산 실패");

    const hourPillar = getHourPillarByTime(saju.dayStem, hour, minute);

    resultDiv.innerHTML = `
      <p>출생일시: ${year}-${month}-${day} ${hour}시 ${minute}분</p>
      <p><strong>시주:</strong> ${hourPillar}</p>
      <p><strong>사주팔자:</strong> ${saju.year} / ${saju.month} / ${saju.day} / ${hourPillar}</p>
      <p><strong>오행 구성:</strong> ${saju.elementCount.map((e, i) => "목화토금수"[i] + " " + e).join(", ")}</p>
      <p><strong>성격 요약:</strong> ${saju.personality}</p>
      <p><strong>총평:</strong> ${saju.summary}</p>
    `;

    new Chart(document.getElementById('fortuneGraph'), {
      type: 'bar',
      data: {
        labels: ['목', '화', '토', '금', '수'],
        datasets: [{
          label: '오행 수',
          data: saju.elementCount,
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;"><strong>❗ 오류:</strong> ${err.message || '사주 계산에 실패했습니다. 입력값을 확인해주세요.'}</p>`;
  }
});
