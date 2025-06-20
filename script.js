document.getElementById('submit-btn').addEventListener('click', function () {
  const birthdate = document.getElementById('birthdate').value;
  const birthtime = document.getElementById('birthtime').value;

  if (!birthdate || !birthtime) {
    alert("생년월일과 출생시각을 모두 입력해주세요.");
    return;
  }

  // 실제로는 사주 계산 로직이 들어가야 함 (지금은 더미값 예시)
  const saju = {
    year: "을축",
    month: "병인",
    day: "기묘",
    time: "경자",
    elements: {
      목: 3,
      화: 1,
      토: 2,
      금: 0,
      수: 2
    }
  };

  // HTML 동적 생성
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <div>
      <div class="section-title">📌 사주팔자 (정통 계산 기반)</div>
      <p><strong>연주 (년):</strong> ${saju.year}</p>
      <p><strong>월주 (월):</strong> ${saju.month}</p>
      <p><strong>일주 (일):</strong> ${saju.day}</p>
      <p><strong>시주 (시):</strong> ${saju.time}</p>
    </div>
    <div>
      <div class="section-title">🌿 오행 구성</div>
      <ul class="element-list">
        <li>목: ${saju.elements["목"]}개</li>
        <li>화: ${saju.elements["화"]}개</li>
        <li>토: ${saju.elements["토"]}개</li>
        <li>금: ${saju.elements["금"]}개</li>
        <li>수: ${saju.elements["수"]}개</li>
      </ul>
    </div>
  `;
  resultDiv.style.display = 'block';
});
