// src/utils/currency.js
function formatINR(value) {
	const num = Math.round(Number(value) || 0);
	try {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			maximumFractionDigits: 0
		}).format(num);
	} catch {
		return `₹${num.toLocaleString("en-IN")}`;
	}
}
var ONES = [
	"",
	"One",
	"Two",
	"Three",
	"Four",
	"Five",
	"Six",
	"Seven",
	"Eight",
	"Nine",
	"Ten",
	"Eleven",
	"Twelve",
	"Thirteen",
	"Fourteen",
	"Fifteen",
	"Sixteen",
	"Seventeen",
	"Eighteen",
	"Nineteen"
];
var TENS = [
	"",
	"",
	"Twenty",
	"Thirty",
	"Forty",
	"Fifty",
	"Sixty",
	"Seventy",
	"Eighty",
	"Ninety"
];
function convertBelowThousand(n) {
	let str = "";
	if (n >= 100) {
		str += `${ONES[Math.floor(n / 100)]} Hundred `;
		n %= 100;
	}
	if (n >= 20) {
		str += `${TENS[Math.floor(n / 10)]} `;
		n %= 10;
	}
	if (n > 0) str += `${ONES[n]} `;
	return str.trim();
}
function amountInWordsINR(amount) {
	const num = Math.round(Number(amount) || 0);
	if (num === 0) return "Rupees Zero Only";
	if (num < 0) return `Minus ${amountInWordsINR(Math.abs(num))}`;
	const crore = Math.floor(num / 1e7);
	const lakh = Math.floor(num % 1e7 / 1e5);
	const thousand = Math.floor(num % 1e5 / 1e3);
	const remainder = num % 1e3;
	let parts = [];
	if (crore > 0) parts.push(`${convertBelowThousand(crore)} Crore`);
	if (lakh > 0) parts.push(`${convertBelowThousand(lakh)} Lakh`);
	if (thousand > 0) parts.push(`${convertBelowThousand(thousand)} Thousand`);
	if (remainder > 0) parts.push(convertBelowThousand(remainder));
	return `Rupees ${parts.join(" ").replace(/\s+/g, " ").trim()} Only`;
}
export { formatINR as n, amountInWordsINR as t };
