document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submitBtn').addEventListener('click', () => {
    const birthDate = document.getElementById('birthDate').value.trim();
    const birthTime = document.getElementById('birthTime').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (!/^\d{8}$/.test(birthDate)) {
      alert('생년월일을 yyyyMMdd 형식으로 입력해주세요.');
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

    const dayStem = gan[day % 10];
    const elements = { '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토', '경': '금', '신': '금', '임': '수', '계': '수' };

    const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    count[elements[gan[adjustedYear % 10]]]++;
    count[elements[dayStem]]++;
    count[elements[gan[(adjustedYear + hourIndex) % 10]]]++;

    let chartHTML = "<div class='card'><h3>사주팔자 (간지 기준)</h3>";
    chartHTML += "<p><strong>연주:</strong> " + yearGanji + "</p>";
    chartHTML += "<p><strong>시주:</strong> " + hourGanji + "</p>";
    chartHTML += "<p><strong>일간:</strong> " + dayStem + " (" + elements[dayStem] + "오행)</p></div>";

    chartHTML += "<div class='card'><h3>🌿 오행 구성</h3><ul>";
    for (const key in count) {
      chartHTML += "<li>" + key + ": " + count[key] + "개</li>";
    }
    chartHTML += "</ul></div>";

    resultDiv.innerHTML = chartHTML;
  });
});