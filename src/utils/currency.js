// Indian Rupee (INR) Currency and Number-in-words formatter

export function formatINR(value) {
  const num = Math.round(Number(value) || 0)
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num)
  } catch {
    return `₹${num.toLocaleString('en-IN')}`
  }
}

export function formatINRRaw(value) {
  const num = Math.round(Number(value) || 0)
  try {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(num)
  } catch {
    return num.toLocaleString('en-IN')
  }
}

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
]

function convertBelowThousand(n) {
  let str = ''
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred `
    n %= 100
  }
  if (n >= 20) {
    str += `${TENS[Math.floor(n / 10)]} `
    n %= 10
  }
  if (n > 0) {
    str += `${ONES[n]} `
  }
  return str.trim()
}

export function amountInWordsINR(amount) {
  const num = Math.round(Number(amount) || 0)
  if (num === 0) return 'Rupees Zero Only'
  if (num < 0) return `Minus ${amountInWordsINR(Math.abs(num))}`

  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const remainder = num % 1000

  let parts = []

  if (crore > 0) {
    parts.push(`${convertBelowThousand(crore)} Crore`)
  }
  if (lakh > 0) {
    parts.push(`${convertBelowThousand(lakh)} Lakh`)
  }
  if (thousand > 0) {
    parts.push(`${convertBelowThousand(thousand)} Thousand`)
  }
  if (remainder > 0) {
    parts.push(convertBelowThousand(remainder))
  }

  return `Rupees ${parts.join(' ').replace(/\s+/g, ' ').trim()} Only`
}
