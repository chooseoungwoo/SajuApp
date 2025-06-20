window.addEventListener('DOMContentLoaded', () => {
    // 상대방 생일 입력창 자동 추가
    const inputGroup = document.querySelector('.input-group');
    const partnerGroup = document.createElement('div');
    partnerGroup.className = 'input-group';
    partnerGroup.innerHTML = `
        <label for="partnerDate">상대 생년월일 입력 (yyyyMMdd):</label>
        <input type="text" id="partnerDate" placeholder="예: 19920123">
    `;
    inputGroup.after(partnerGroup);
});

document.getElementById('submitBtn').addEventListener('click', function () {
    const birthDate = document.getElementById('birthDate').value.trim();
    const partnerDate = document.getElementById('partnerDate').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (!/^\d{8}$/.test(birthDate)) {
        alert("본인 생년월일을 yyyyMMdd 형식으로 입력해주세요.");
        return;
    }

    const userInfo = getSajuInfo(birthDate);
    let resultHTML = `<h2>🔮 [본인 사주 분석]</h2>`;
    resultHTML += `<p><strong>출생 연도 간지:</strong> ${userInfo.ganji}</p>`;
    resultHTML += `<p><strong>일간 성향:</strong> ${getPersonality(userInfo.day)}</p>`;

    if (/^\d{8}$/.test(partnerDate)) {
        const partnerInfo = getSajuInfo(partnerDate);
        const score = getCompatibility(userInfo.day, partnerInfo.day);

        resultHTML += `<hr><h2>❤️ [궁합 분석]</h2>`;
        resultHTML += `<p><strong>상대 간지:</strong> ${partnerInfo.ganji}</p>`;
        resultHTML += `<p><strong>궁합 점수:</strong> ${score}점 / 100</p>`;
        resultHTML += `<p><strong>상대 성향:</strong> ${getPersonality(partnerInfo.day)}</p>`;
    }

    resultDiv.innerHTML = resultHTML;
});

function getSajuInfo(yyyymmdd) {
    const year = parseInt(yyyymmdd.slice(0, 4));
    const day = parseInt(yyyymmdd.slice(6, 8));
    const gan = ['갑','을','병','정','무','기','경','신','임','계'];
    const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
    const ganji = gan[year % 10] + ji[year % 12];
    const dayStem = gan[day % 10];  // 단순히 '일간'으로 사용
    return { year, ganji, day: dayStem };
}

function getPersonality(dayStem) {
    const traits = {
        '갑': '진취적이고 외향적. 리더 기질.',
        '을': '섬세하고 배려심 깊음. 다정다감.',
        '병': '자신감 있고 열정적. 자존심 강함.',
        '정': '지적이고 감성적. 예술적 재능.',
        '무': '신중하고 실리적. 책임감 강함.',
        '기': '감성적이고 공감력 높음. 중재자.',
        '경': '냉철하고 전략적. 추진력 있음.',
        '신': '변화추구형. 유연하고 재치 있음.',
        '임': '이성적이고 분석적. 계획형.',
        '계': '내성적이지만 깊이 있는 사고력.'
    };
    return traits[dayStem] || '불명확';
}

function getCompatibility(day1, day2) {
    const goodPairs = ['갑을','을갑','병정','정병','무기','기무','경신','신경','임계','계임'];
    const badPairs = ['갑경','을신','병임','정계','무갑','기을','경병','신정','임무','계기'];

    const pair = day1 + day2;
    if (goodPairs.includes(pair)) return 85;
    if (badPairs.includes(pair)) return 45;
    return 60; // 보통
}
