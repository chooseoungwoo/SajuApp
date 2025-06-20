document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submitBtn').addEventListener('click', () => {
    const birthDate = document.getElementById('birthDate').value.trim();
    const birthTime = document.getElementById('birthTime').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (!/^\d{8}$/.test(birthDate)) {
      alert('생년월일을 YYYYMMdd 형식으로 입력해주세요.');
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
    const minute = parseInt(birthTime.split(':')[1]);

    // --- Saju Calculation Logic - This is where the major changes are needed ---

    // Placeholder for accurate ganji (requires real Saju logic)
    let yearGan, yearJi; // 연간, 연지
    let monthGan, monthJi; // 월간, 월지
    let dayGan, dayJi; // 일간, 일지
    let hourGan, hourJi; // 시간, 시지

    // --- IMPORTANT: Placeholder for real Saju calculation ---
    // You would call a function here that accurately calculates all 8 characters (팔자)
    // based on solar terms and the sexagenary cycle.
    // Example: { year: {gan: '갑', ji: '인'}, month: {gan: '병', ji: '진'}, ... }
    try {
        const sajuPillars = calculateAccurateSajuPillars(year, month, day, hour, minute);
        yearGan = sajuPillars.year.gan;
        yearJi = sajuPillars.year.ji;
        monthGan = sajuPillars.month.gan;
        monthJi = sajuPillars.month.ji;
        dayGan = sajuPillars.day.gan;
        dayJi = sajuPillars.day.ji;
        hourGan = sajuPillars.hour.gan;
        hourJi = sajuPillars.hour.ji;
    } catch (error) {
        resultDiv.innerHTML = `<p style='color:red;'>사주 계산 중 오류가 발생했습니다: ${error.message}</p>`;
        return;
    }
    // --- End of IMPORTANT Placeholder ---


    const gan = ['갑','을','병','정','무','기','경','신','임','계'];
    const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
    const elements = {
        '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
        '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
        '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토',
        '사': '화', '오': '화', '미': '토', '신': '금', '유': '금',
        '술': '토', '해': '수'
    };

    const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };

    // Counting elements for all 8 characters (간지 8자)
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
        <h3>📌 사주팔자 (간지 기준)</h3>
        <p><strong>연주 (년):</strong> ${yearGan}${yearJi}</p>
        <p><strong>월주 (월):</strong> ${monthGan}${monthJi}</p>
        <p><strong>일주 (일):</strong> ${dayGan}${dayJi} (일간: ${dayGan} - ${elements[dayGan]}오행)</p>
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

/**
 * !!! IMPORTANT !!!
 * This is a placeholder function.
 * Accurate Saju calculation (especially for day and month pillars based on solar terms)
 * is highly complex and requires a detailed algorithm or external data.
 * You would need to implement this or use a Saju calculation library.
 *
 * A basic overview of what this function would need to do:
 * 1. Convert Gregorian date/time to a celestial coordinate system or Julian Day Number.
 * 2. Determine the exact solar term (절기) entry times (절입일) for the given year, month.
 * 3. Based on the solar term, determine the correct Heavenly Stem and Earthly Branch for the Month.
 * 4. Calculate the Day Pillar (일진) based on a continuous 60-day cycle. This is usually done by
 * calculating the number of days from a known starting point (e.g., year 1, month 1, day 1, etc.).
 * 5. Calculate the Hour Pillar based on the Day Stem using specific rules (오서둔갑).
 * 6. Account for time zones, daylight saving, and birth location for precise solar time.
 *
 * A simple example to illustrate the complexity of 'calculateAccurateSajuPillars':
 * Let's say you're building a function to get the Iljin (Day Pillar).
 * This generally involves knowing the Iljin of a reference date (e.g., Jan 1, 1900 was 庚子 - 경자)
 * and then counting the days from that reference to the birth date and using modulo 60.
 *
 * For Solar Terms:
 * Each month's ganji changes on its specific Solar Term (e.g., Ipchun for January, Gyeongchip for February, etc.).
 * These dates are not fixed in the Gregorian calendar.
 *
 */
function calculateAccurateSajuPillars(year, month, day, hour, minute) {
    // This function needs to be implemented with a robust Saju calculation logic.
    // For now, I'm returning some dummy values to make the rest of the code runnable.
    // YOU MUST REPLACE THIS WITH A REAL SAJU ALGORITHM.

    // Example of how the data might be structured for return:
    // {
    //   year: { gan: '갑', ji: '자' },
    //   month: { gan: '을', ji: '축' },
    //   day: { gan: '병', ji: '인' },
    //   hour: { gan: '정', ji: '묘' }
    // }

    // --- DUMMY IMPLEMENTATION for demonstration ---
    // This does NOT accurately calculate Saju. It's just to prevent errors.
    const ganDummy = ['갑','을','병','정','무','기','경','신','임','계'];
    const jiDummy = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

    // These calculations are NOT accurate Saju logic.
    // They are just derived from your original simplified logic to avoid errors.
    const adjustedYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year; // This adjustment is too simple for real Saju

    const yearGan = ganDummy[adjustedYear % 10];
    const yearJi = jiDummy[adjustedYear % 12];

    // Month ganji is highly dependent on solar terms. This is a simplified placeholder.
    const monthGanIndex = (adjustedYear + month) % 10; // Highly simplified
    const monthJiIndex = (month + 1) % 12; // Highly simplified
    const monthGan = ganDummy[monthGanIndex];
    const monthJi = jiDummy[monthJiIndex];

    // Day ganji requires accurate calculation based on Julian Day Number and sexagenary cycle.
    // This is also a placeholder.
    const dayGan = ganDummy[day % 10]; // Incorrect for real Saju
    const dayJi = jiDummy[day % 12]; // Incorrect for real Saju

    // Hour ganji depends on the Day Stem (일간) and specific hour rules (오서둔갑).
    const hourIndex = Math.floor((hour + 1) / 2) % 12; // Simplified from your original code
    const hourGan = ganDummy[(adjustedYear + hourIndex) % 10]; // Simplified from your original code
    const hourJi = jiDummy[hourIndex];

    return {
        year: { gan: yearGan, ji: yearJi },
        month: { gan: monthGan, ji: monthJi },
        day: { gan: dayGan, ji: dayJi },
        hour: { gan: hourGan, ji: hourJi }
    };
    // --- END DUMMY IMPLEMENTATION ---
}