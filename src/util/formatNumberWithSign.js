export function formatNumberWithSign(n) {
    if (isNaN(n)) return ''
    return (n >= 0 ? '+' : '') + n;
}