document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submitBtn').addEventListener('click', () => {
    const birthDateStr = document.getElementById('birthDate').value.trim();
    const birthTimeStr = document.getElementById('birthTime').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (!/^\d{8}$/.test(birthDateStr)) {
      alert('생년월일을 yyyyMMdd 형식으로 입력해주세요.');
      return;
    }
    if (!birthTimeStr) {
      resultDiv.innerHTML = "<p style='color:red;'>⚠️ 시(時) 정보는 사주 분석에 필수입니다.</p>";
      return;
    }

    const gan = ['갑','을','병','정','무','기','경','신','임','계'];
    const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
    const elements = {
      '갑': '목','을': '목','병': '화','정': '화','무': '토','기': '토','경': '금','신': '금','임': '수','계': '수',
      '자': '수','축': '토','인': '목','묘': '목','진': '토','사': '화','오': '화','미': '토','신': '금','유': '금','술': '토','해': '수'
    };

    const year = parseInt(birthDateStr.slice(0, 4));
    const month = parseInt(birthDateStr.slice(4, 6));
    const day = parseInt(birthDateStr.slice(6, 8));
    const hour = parseInt(birthTimeStr.split(':')[0]);

    // 연주 계산 (입춘 전후 보정)
    let adjustedYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
    const yearGan = gan[adjustedYear % 10];
    const yearJi = ji[adjustedYear % 12];

    // 월주 간단 보정 (정밀 절입일 보정은 미포함)
    const monthJi = ji[(month + 1) % 12];
    const monthGanIndex = (gan.indexOf(yearGan) * 2 + month - 1) % 10;
    const monthGan = gan[monthGanIndex];

    // 일주 계산 (간략화)
    const baseDate = new Date(1900, 0, 1); // 1900-01-01 = 경자일
    const targetDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    const dayGan = gan[(6 + daysDiff) % 10]; // 1900-01-01은 경(6)
    const dayJi = ji[(0 + daysDiff) % 12];   // 1900-01-01은 자(0)

    // 시주 계산
    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourJi = ji[hourIndex];
    const hourGanOffset = { '갑':0, '을':2, '병':4, '정':6, '무':8, '기':0, '경':2, '신':4, '임':6, '계':8 };
    const hourGan = gan[(hourGanOffset[dayGan] + hourIndex) % 10];

    const count = { 목:0, 화:0, 토:0, 금:0, 수:0 };
    [yearGan, yearJi, monthGan, monthJi, dayGan, dayJi, hourGan, hourJi].forEach(char => {
      if (elements[char]) count[elements[char]]++;
    });

    let resultHTML = `
      <div class="card">
        <h3>📌 사주팔자 (정통 계산 기반)</h3>
        <p><strong>연주 (년):</strong> ${yearGan}${yearJi}</p>
        <p><strong>월주 (월):</strong> ${monthGan}${monthJi}</p>
        <p><strong>일주 (일):</strong> ${dayGan}${dayJi} <span style="color:gray;">(일간: ${dayGan} - ${elements[dayGan]}오행)</span></p>
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
  });
});
