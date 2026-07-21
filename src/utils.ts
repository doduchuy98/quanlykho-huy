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
  if (diffMs < 0) return '00:00:00';
  
  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
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
