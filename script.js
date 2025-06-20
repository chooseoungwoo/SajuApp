// 정통 사주 일주 계산 (정확한 일진력 기반)
// 기준일: 1900-01-01 (경자일)

function getIljuFromDate(year, month, day) {
  const baseDate = new Date(1900, 0, 1); // 1900-01-01
  const targetDate = new Date(year, month - 1, day);

  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const index = diffDays % 60;

  const gan = ['갑','을','병','정','무','기','경','신','임','계'];
  const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  const dayGan = gan[index % 10];
  const dayJi = ji[index % 12];

  return dayGan + dayJi;
}

// 월주 계산 (정확한 절입일 기반은 아님 - 기본 보정)
function getWolju(year, month, day) {
  // 24절기 기준 간이 보정: 2월 4일 입춘 이전은 전년도 12월로 간주
  const gan = ['갑','을','병','정','무','기','경','신','임','계'];
  const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

  let adjustedYear = month === 1 || (month === 2 && day < 4) ? year - 1 : year;
  const yearGanIndex = adjustedYear % 10;

  // 월간 보정 간지 인덱스 표 (연간에 따라 달라짐)
  const monthGanOffset = [2, 4, 6, 8, 0]; // 연간 index 0~9 별 월간 시작 offset
  const offset = monthGanOffset[Math.floor(yearGanIndex / 2)];
  const monthGan = gan[(offset + month - 1) % 10];
  const monthJi = ji[(month + 1) % 12];
  return monthGan + monthJi;
}

// 시주 계산 (일간 기준으로 시간지 계산)
function getSiju(dayGan, hour) {
  const gan = ['갑','을','병','정','무','기','경','신','임','계'];
  const ji = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourJi = ji[hourIndex];

  const offsetTable = {
    '갑': 0, '을': 2, '병': 4, '정': 6, '무': 8,
    '기': 0, '경': 2, '신': 4, '임': 6, '계': 8
  };
  const hourGan = gan[(offsetTable[dayGan] + hourIndex) % 10];
  return hourGan + hourJi;
}

// 사용 예시
const y = 1985;
const m = 2;
const d = 9;
const h = 1; // 오전 1시 40분 → 축시

const ilju = getIljuFromDate(y, m, d);
const wolju = getWolju(y, m, d);
const siju = getSiju(ilju[0], h);

console.log('일주:', ilju);
console.log('월주:', wolju);
console.log('시주:', siju);
