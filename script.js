// 버튼 클릭 시 사주 계산
document.getElementById("submitBtn").addEventListener("click", function() {
    var birthDate = document.getElementById("birthDate").value;
    var resultElement = document.getElementById("result");

    if (birthDate.length !== 8 || isNaN(birthDate)) {
        resultElement.innerHTML = "올바른 생년월일을 입력해주세요 (yyyyMMdd 형식)";
        return;
    }

    var year = parseInt(birthDate.substring(0, 4));

    // 간단한 예시: 생년월일의 마지막 숫자에 따라 결과 다르게 표시
    if (year % 2 === 0) {
        resultElement.innerHTML = "귀하의 사주는 '평온'합니다.";
    } else {
        resultElement.innerHTML = "귀하의 사주는 '불안정'합니다.";
    }
});
