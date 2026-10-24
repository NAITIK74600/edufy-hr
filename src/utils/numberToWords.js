const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN']
const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY']

function twoDigits(n) {
  if (n < 20) return units[n]
  const t = Math.floor(n / 10)
  const u = n % 10
  return (tens[t] + (u ? ' ' + units[u] : '')).trim()
}

function threeDigits(n) {
  const h = Math.floor(n / 100)
  const rem = n % 100
  const parts = []
  if (h) parts.push(units[h] + ' HUNDRED')
  if (rem) parts.push(twoDigits(rem))
  return parts.join(' ').trim()
}

export function numberToWordsINR(amount, currencyName = 'RUPEES') {
  const raw = Number(amount) || 0
  const isNegative = raw < 0
  const val = Math.abs(raw)
  const integerPart = Math.floor(val)
  const decimalPart = Math.round((val - integerPart) * 100)

  if (integerPart === 0 && decimalPart === 0) {
    return `${currencyName.toUpperCase()} ZERO ONLY`
  }

  let n = integerPart
  const parts = []

  const crores = Math.floor(n / 10000000)
  n %= 10000000
  if (crores) parts.push(threeDigits(crores) + ' CRORE')

  const lakhs = Math.floor(n / 100000)
  n %= 100000
  if (lakhs) parts.push(twoDigits(lakhs) + ' LAKH')

  const thousands = Math.floor(n / 1000)
  n %= 1000
  if (thousands) parts.push(twoDigits(thousands) + ' THOUSAND')

  if (n) parts.push(threeDigits(n))

  let result = `${currencyName.toUpperCase()} ${parts.join(' ')}`.trim()
  if (decimalPart > 0) {
    result += ` AND ${twoDigits(decimalPart)} PAISE`
  }
  result += ' ONLY'

  return isNegative ? `MINUS ${result}` : result
}

export default numberToWordsINR
