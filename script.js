
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('submitBtn').addEventListener('click', () => {
    const birthDate = document.getElementById('birthDate').value;
    const birthTime = document.getElementById('birthTime').value;
    const result = document.getElementById('result');
    result.innerHTML = '<p>⏳ 정통 사주 계산 반영 중... 잠시만 기다려주세요.</p>';
  });
});
