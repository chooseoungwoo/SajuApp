document.getElementById('submit-btn').addEventListener('click', function () {
  const birthdate = document.getElementById('birthdate').value;
  const birthtime = document.getElementById('birthtime').value;

  if (!birthdate || !birthtime) {
    alert("생년월일과 출생 시각을 모두 입력해주세요.");
    return;
  }

  const resultCard = document.getElementById('result');
  resultCard.style.display = 'block';
});
