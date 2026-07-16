export function formatVND(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value).replace('₫', 'đ');
}

export function calculateTimeElapsed(checkInTimeStr?: string): string {
  if (!checkInTimeStr) return '';
  const checkIn = new Date(checkInTimeStr);
  const now = new Date();
  const diffMs = now.getTime() - checkIn.getTime();
  if (diffMs < 0) return '0p';
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins}p`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
  }
}

export function generateVietQRUrl(
  bankCode: string,
  accountNo: string,
  amount: number,
  description: string,
  accountName: string
): string {
  const encodedDesc = encodeURIComponent(description);
  const encodedName = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}
