
document.getElementById('saju-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const year = parseInt(document.getElementById('year').value);
  const month = parseInt(document.getElementById('month').value);
  const day = parseInt(document.getElementById('day').value);
  const hour = parseInt(document.getElementById('hour').value);
  const minute = parseInt(document.getElementById('minute').value);

  const saju = getSajuPillars(year, month, day, hour, minute);
  const hourPillar = getHourPillarByTime(saju.dayStem, hour, minute);

  const resultDiv = document.getElementById('result');
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
});
