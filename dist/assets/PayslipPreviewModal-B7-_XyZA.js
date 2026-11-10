import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { Dt as FileText, Ft as Download, W as Printer, _n as require_react, i as X, n as ZoomIn, ot as Mail, t as ZoomOut, z as RotateCcw } from "./icons-vendor-CNlTUIuG.js";
import { r as require_react_dom, t as require_server_browser } from "./react-vendor-B_MMQ54z.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { n as require_html2canvas, t as E } from "./pdf-vendor-BkGpxo0p.js";
import { I as apiClient } from "./index-BlmAerQ0.js";
import { r as unmaskBankAccount } from "./payrollMatcher-DYZYv1X2.js";
// src/utils/numberToWords.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = require_react_dom();
var units = [
	"",
	"ONE",
	"TWO",
	"THREE",
	"FOUR",
	"FIVE",
	"SIX",
	"SEVEN",
	"EIGHT",
	"NINE",
	"TEN",
	"ELEVEN",
	"TWELVE",
	"THIRTEEN",
	"FOURTEEN",
	"FIFTEEN",
	"SIXTEEN",
	"SEVENTEEN",
	"EIGHTEEN",
	"NINETEEN"
];
var tens = [
	"",
	"",
	"TWENTY",
	"THIRTY",
	"FORTY",
	"FIFTY",
	"SIXTY",
	"SEVENTY",
	"EIGHTY",
	"NINETY"
];
function twoDigits(n) {
	if (n < 20) return units[n];
	const t = Math.floor(n / 10);
	const u = n % 10;
	return (tens[t] + (u ? " " + units[u] : "")).trim();
}
function threeDigits(n) {
	const h = Math.floor(n / 100);
	const rem = n % 100;
	const parts = [];
	if (h) parts.push(units[h] + " HUNDRED");
	if (rem) parts.push(twoDigits(rem));
	return parts.join(" ").trim();
}
function numberToWordsINR(amount, currencyName = "RUPEES") {
	const raw = Number(amount) || 0;
	const isNegative = raw < 0;
	const val = Math.abs(raw);
	const integerPart = Math.floor(val);
	const decimalPart = Math.round((val - integerPart) * 100);
	if (integerPart === 0 && decimalPart === 0) return `${currencyName.toUpperCase()} ZERO ONLY`;
	let n = integerPart;
	const parts = [];
	const crores = Math.floor(n / 1e7);
	n %= 1e7;
	if (crores) parts.push(threeDigits(crores) + " CRORE");
	const lakhs = Math.floor(n / 1e5);
	n %= 1e5;
	if (lakhs) parts.push(twoDigits(lakhs) + " LAKH");
	const thousands = Math.floor(n / 1e3);
	n %= 1e3;
	if (thousands) parts.push(twoDigits(thousands) + " THOUSAND");
	if (n) parts.push(threeDigits(n));
	let result = `${currencyName.toUpperCase()} ${parts.join(" ")}`.trim();
	if (decimalPart > 0) result += ` AND ${twoDigits(decimalPart)} PAISE`;
	result += " ONLY";
	return isNegative ? `MINUS ${result}` : result;
}
// src/components/payroll/PayslipDocument.jsx
var import_jsx_runtime = require_jsx_runtime();
function formatINR(val) {
	return Math.round(Number(val) || 0).toLocaleString("en-IN");
}
function PayslipDocument({ record, employee, settings, scale = 1, id = "printable-payslip" }) {
	const emp = record?.employeeRef && typeof record.employeeRef === "object" ? record.employeeRef : employee || {};
	const company = settings || {};
	const companyName = company.companyName || "Elythra Edufyi Tech Solutions Pvt Ltd";
	const companyAddress = company.branchAddress || company.address || "Third Floor, 7 Hills, #424, 10th Cross, 27th Main, Sector 1, HSR Layout, Bengaluru, Karnataka 560102";
	const companyContacts = [
		company.phone || "+91 80 4567 8900",
		company.email || "hr@edufyitech.in",
		company.website || "https://edufyitech.in"
	].filter(Boolean).join(" | ");
	const logoUrl = company.logoUrl || "/elythra-edufyitech-logo.png";
	const primaryColor = company.primaryColor || "#087E9E";
	const secondaryColor = company.secondaryColor || "#0B3155";
	const currency = company.currency || "INR";
	const employeeCode = record?.employeeId || emp?.employeeId || "-";
	const employeeName = emp?.name || record?.employeeName || "Employee";
	const rawLoc = record?.branch || record?.location || emp?.location || emp?.branch || company.defaultBranch;
	const location = !rawLoc || [
		"bengaluru",
		"ignite campus",
		"ignite campus (bengaluru)",
		"bengaluru hq"
	].includes(String(rawLoc).toLowerCase()) ? "Bengaluru HQ" : rawLoc;
	const designation = emp?.designation || record?.designation || "Staff";
	const department = emp?.department || record?.department || "Operations";
	const rawBankAcc = record?.accountNumber || emp?.bankDetails?.accountNumber || emp?.accountNumber || emp?.bankAccount || "";
	const displayBankAccount = unmaskBankAccount(rawBankAcc, "-");
	const bankName = record?.bankName || emp?.bankDetails?.bankName || emp?.bankName || "-";
	record?.ifscCode || emp?.bankDetails?.ifscCode || emp?.ifscCode;
	const joinDate = emp?.joiningDate ? typeof emp.joiningDate === "string" && emp.joiningDate.includes("-") ? emp.joiningDate.slice(0, 10).split("-").reverse().join("/") : new Date(emp.joiningDate).toLocaleDateString("en-GB") : "-";
	const dob = emp?.dob ? new Date(emp.dob).toLocaleDateString("en-GB") : emp?.identity?.dob ? new Date(emp.identity.dob).toLocaleDateString("en-GB") : "-";
	const gender = emp?.gender || emp?.identity?.gender || "-";
	const pan = record?.panTaxId || emp?.identity?.panNumber || emp?.bankDetails?.panTaxId || emp?.panTaxId || "-";
	const pfNo = record?.pfNumber || emp?.identity?.pfNumber || emp?.pfNumber || "-";
	const uan = record?.uanNumber || emp?.identity?.uanNumber || emp?.bankDetails?.uanNumber || emp?.uanNumber || "-";
	const standardDays = record?.standardDays ?? record?.workingDays ?? 31;
	const payableDays = record?.payableDays ?? record?.paidDays ?? standardDays - (record?.lopDays ?? 0);
	const lopDays = record?.lopDays ?? 0;
	const lopReversalDays = record?.lopReversalDays ?? 0;
	const arrearDays = record?.arrearDays ?? 0;
	let earningsList = [];
	if (Array.isArray(record?.earningsList) && record.earningsList.length > 0) earningsList = record.earningsList.map((e) => ({
		name: (e.name || "").toUpperCase(),
		monthlyRate: Number(e.monthlyRate) || Number(e.total) || 0,
		currentMonth: Number(e.currentMonth) || Number(e.total) || 0,
		arrear: Number(e.arrear) || 0,
		total: Number(e.total) || (Number(e.currentMonth) || 0) + (Number(e.arrear) || 0)
	}));
	else if (record?.earnings && typeof record.earnings === "object") {
		const e = record.earnings;
		earningsList = [
			{
				key: "basic",
				label: "BASIC"
			},
			{
				key: "hra",
				label: "HOUSE RENT ALLOWANCE (HRA)"
			},
			{
				key: "conveyance",
				label: "CONVEYANCE ALLOWANCE"
			},
			{
				key: "otherAllowance",
				label: "OTHER ALLOWANCE"
			},
			{
				key: "specialAllowance",
				label: "SPECIAL ALLOWANCE"
			},
			{
				key: "medicalAllowance",
				label: "MEDICAL ALLOWANCE"
			},
			{
				key: "performanceBonus",
				label: "BONUS"
			},
			{
				key: "overtime",
				label: "OVERTIME"
			}
		].filter((m) => (e[m.key] || 0) > 0 || ["basic", "hra"].includes(m.key)).map((m) => ({
			name: m.label,
			monthlyRate: e[m.key] || 0,
			currentMonth: e[m.key] || 0,
			arrear: 0,
			total: e[m.key] || 0
		}));
	}
	if (earningsList.length === 0) earningsList = [
		{
			name: "BASIC",
			monthlyRate: 16265,
			currentMonth: 16265,
			arrear: 0,
			total: 16265
		},
		{
			name: "HOUSE RENT ALLOWANCE (HRA)",
			monthlyRate: 9759,
			currentMonth: 9759,
			arrear: 0,
			total: 9759
		},
		{
			name: "CONVEYANCE ALLOWANCE",
			monthlyRate: 1600,
			currentMonth: 1600,
			arrear: 0,
			total: 1600
		},
		{
			name: "OTHER ALLOWANCE",
			monthlyRate: 2500,
			currentMonth: 2500,
			arrear: 0,
			total: 2500
		},
		{
			name: "SPECIAL ALLOWANCE",
			monthlyRate: 3775,
			currentMonth: 3775,
			arrear: 0,
			total: 3775
		}
	];
	let deductionsList = [];
	if (Array.isArray(record?.deductionsList) && record.deductionsList.length > 0) deductionsList = record.deductionsList.map((d) => ({
		name: (d.name || "").toUpperCase(),
		amount: Number(d.amount) || 0
	}));
	else if (record?.deductions && typeof record.deductions === "object") {
		const d = record.deductions;
		deductionsList = [
			{
				key: "pf",
				label: "P.F."
			},
			{
				key: "professionalTax",
				label: "PROFESSIONAL TAX"
			},
			{
				key: "esi",
				label: "ESI"
			},
			{
				key: "tdsTax",
				label: "TDS"
			},
			{
				key: "loanAdvance",
				label: "LOAN DEDUCTION"
			},
			{
				key: "lossOfPay",
				label: "LOSS OF PAY"
			},
			{
				key: "performanceDeduction",
				label: "PERFORMANCE DEDUCTION"
			},
			{
				key: "otherDeductions",
				label: "OTHER DEDUCTION"
			}
		].filter((m) => (d[m.key] || 0) > 0).map((m) => ({
			name: m.label,
			amount: d[m.key] || 0
		}));
	}
	if (deductionsList.length === 0) deductionsList = [{
		name: "P.F.",
		amount: 1952
	}, {
		name: "PROFESSIONAL TAX",
		amount: 200
	}];
	const grossRate = earningsList.reduce((acc, curr) => acc + (curr.monthlyRate || 0), 0);
	const grossCurrent = earningsList.reduce((acc, curr) => acc + (curr.currentMonth || 0), 0);
	const grossArrear = earningsList.reduce((acc, curr) => acc + (curr.arrear || 0), 0);
	const grossTotal = earningsList.reduce((acc, curr) => acc + (curr.total || 0), 0);
	const totalDeductions = deductionsList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
	const netPay = Math.max(0, grossTotal - totalDeductions);
	const netPayInWords = numberToWordsINR(netPay, currency === "INR" ? "RUPEES" : currency);
	const maxRows = Math.max(earningsList.length, deductionsList.length, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id,
		className: "payslip-a4-sheet",
		style: {
			width: "210mm",
			minHeight: "297mm",
			padding: "14mm 16mm",
			margin: "0 auto",
			backgroundColor: "#ffffff",
			boxSizing: "border-box",
			color: "#1a202c",
			fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Arial, sans-serif",
			fontSize: "11px",
			lineHeight: 1.4,
			position: "relative",
			display: "flex",
			flexDirection: "column",
			transform: scale !== 1 ? `scale(${scale})` : void 0,
			transformOrigin: "top center",
			boxShadow: scale !== 1 ? "none" : "0 4px 20px rgba(0,0,0,0.1)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "20px",
					marginBottom: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { flex: "0 0 auto" },
					children: logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: logoUrl,
						alt: "Company Logo",
						style: {
							maxHeight: "60px",
							maxWidth: "190px",
							objectFit: "contain",
							display: "block"
						},
						onError: (e) => {
							e.currentTarget.style.display = "none";
						}
					}) : null
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						textAlign: "center",
						paddingRight: "20px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							style: {
								margin: 0,
								fontSize: "19px",
								fontWeight: 800,
								color: primaryColor,
								letterSpacing: "-0.01em"
							},
							children: companyName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "10.5px",
								color: "#4a5568",
								marginTop: "2px",
								lineHeight: 1.35
							},
							children: companyAddress
						}),
						companyContacts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "10px",
								color: "#718096",
								marginTop: "2px"
							},
							children: companyContacts
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "baseline",
					marginBottom: "8px",
					padding: "0 2px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						textAlign: "center",
						paddingLeft: "80px",
						fontSize: "13.5px",
						fontWeight: 700,
						color: secondaryColor
					},
					children: ["Payslip for the month of ", record?.month || "MAY 2024"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: "10px",
						fontWeight: 500,
						color: "#4a5568"
					},
					children: ["All amounts in ", currency]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					border: "1px solid #a4d3df",
					borderRadius: "4px",
					padding: "8px 14px",
					marginBottom: "8px",
					background: "#ffffff"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						columnGap: "32px",
						rowGap: "3px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Emp Code",
							val: employeeCode
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Emp Name",
							val: employeeName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Location",
							val: location
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Designation",
							val: designation
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Department",
							val: department
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Bank AC No",
							val: displayBankAccount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Bank AC Name",
							val: bankName
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Join Date",
							val: joinDate
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "DOB",
							val: dob
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "Gender",
							val: gender
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "PAN",
							val: pan
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "PF No",
							val: pfNo
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoRow, {
							label: "PF UAN",
							val: uan
						})
					] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#e1f3f8",
					border: "1px solid #a4d3df",
					borderRadius: "4px",
					padding: "5px 12px",
					marginBottom: "8px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					fontSize: "10.5px",
					fontWeight: 600,
					color: secondaryColor
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Standard Days: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontWeight: 700 },
						children: standardDays
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Payable Days: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontWeight: 700 },
						children: typeof payableDays === "number" ? payableDays.toFixed(2) : payableDays
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Loss of Pay Days: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontWeight: 700 },
						children: typeof lopDays === "number" ? lopDays.toFixed(2) : lopDays
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["LOP Reversal Days: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontWeight: 700 },
						children: typeof lopReversalDays === "number" ? lopReversalDays.toFixed(2) : lopReversalDays
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Arrear Days: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontWeight: 700 },
						children: typeof arrearDays === "number" ? arrearDays.toFixed(2) : arrearDays
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					border: `1.5px solid ${primaryColor}`,
					borderRadius: "3px",
					overflow: "hidden",
					marginBottom: "8px"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					style: {
						width: "100%",
						borderCollapse: "collapse",
						fontSize: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: {
								background: primaryColor,
								color: "#ffffff",
								fontWeight: 700,
								fontSize: "10px",
								padding: "6px 8px",
								textAlign: "left",
								width: "28%",
								border: `1px solid ${primaryColor}`
							},
							children: "EARNINGS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: {
								background: primaryColor,
								color: "#ffffff",
								fontWeight: 700,
								fontSize: "10px",
								padding: "6px 8px",
								textAlign: "right",
								width: "14%",
								border: `1px solid ${primaryColor}`
							},
							children: "MONTHLY RATE"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: {
								background: primaryColor,
								color: "#ffffff",
								fontWeight: 700,
								fontSize: "10px",
								padding: "6px 8px",
								textAlign: "right",
								width: "14%",
								border: `1px solid ${primaryColor}`
							},
							children: "CURRENT MONTH"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: {
								background: primaryColor,
								color: "#ffffff",
								fontWeight: 700,
								fontSize: "10px",
								padding: "6px 8px",
								textAlign: "right",
								width: "12%",
								border: `1px solid ${primaryColor}`
							},
							children: "ARREAR (+/-)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: {
								background: primaryColor,
								color: "#ffffff",
								fontWeight: 700,
								fontSize: "10px",
								padding: "6px 8px",
								textAlign: "right",
								width: "14%",
								border: `1px solid ${primaryColor}`,
								borderRight: `1.5px solid ${primaryColor}`
							},
							children: "TOTAL"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: {
								background: primaryColor,
								color: "#ffffff",
								fontWeight: 700,
								fontSize: "10px",
								padding: "6px 8px",
								textAlign: "left",
								width: "22%",
								border: `1px solid ${primaryColor}`
							},
							children: "DEDUCTIONS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							style: {
								background: primaryColor,
								color: "#ffffff",
								fontWeight: 700,
								fontSize: "10px",
								padding: "6px 8px",
								textAlign: "right",
								width: "14%",
								border: `1px solid ${primaryColor}`
							},
							children: "TOTAL"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [Array.from({ length: maxRows }).map((_, idx) => {
						const earn = earningsList[idx];
						const ded = deductionsList[idx];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "4px 8px",
									border: "1px solid #d2eaf1",
									fontWeight: 500
								},
								children: earn?.name || ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "4px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right"
								},
								children: earn ? formatINR(earn.monthlyRate) : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "4px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right"
								},
								children: earn ? formatINR(earn.currentMonth) : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "4px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right"
								},
								children: earn ? formatINR(earn.arrear) : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "4px 8px",
									border: "1px solid #d2eaf1",
									borderRight: `1.5px solid ${primaryColor}`,
									textAlign: "right",
									fontWeight: 600
								},
								children: earn ? formatINR(earn.total) : ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "4px 8px",
									border: "1px solid #d2eaf1",
									fontWeight: 500
								},
								children: ded?.name || ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "4px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right",
									fontWeight: 600
								},
								children: ded ? formatINR(ded.amount) : ""
							})
						] }, idx);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						style: {
							background: "#e1f3f8",
							fontWeight: 800,
							color: secondaryColor,
							borderTop: `1.5px solid ${primaryColor}`
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "6px 8px",
									border: "1px solid #d2eaf1",
									fontWeight: 800
								},
								children: "GROSS EARNINGS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "6px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right",
									fontWeight: 800
								},
								children: formatINR(grossRate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "6px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right",
									fontWeight: 800
								},
								children: formatINR(grossCurrent)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "6px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right",
									fontWeight: 800
								},
								children: formatINR(grossArrear)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "6px 8px",
									border: "1px solid #d2eaf1",
									borderRight: `1.5px solid ${primaryColor}`,
									textAlign: "right",
									fontWeight: 800
								},
								children: formatINR(grossTotal)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "6px 8px",
									border: "1px solid #d2eaf1",
									fontWeight: 800
								},
								children: "TOTAL DEDUCTIONS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									padding: "6px 8px",
									border: "1px solid #d2eaf1",
									textAlign: "right",
									fontWeight: 800
								},
								children: formatINR(totalDeductions)
							})
						]
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					border: `1.5px solid ${primaryColor}`,
					borderRadius: "4px",
					background: "#f4fbfe",
					padding: "8px 14px",
					marginBottom: "14px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "4px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "14px",
							fontWeight: 800,
							color: secondaryColor,
							letterSpacing: "0.02em"
						},
						children: "NET PAY"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "17px",
							fontWeight: 800,
							color: secondaryColor,
							letterSpacing: "-0.01em"
						},
						children: formatINR(netPay)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: "10.5px",
						fontWeight: 700,
						color: "#1a202c",
						letterSpacing: "0.01em"
					},
					children: [
						"(",
						netPayInWords,
						")"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					marginTop: "auto",
					paddingTop: "12px",
					textAlign: "center"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
						height: "2px",
						background: primaryColor,
						width: "100%",
						marginBottom: "8px"
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "9.5px",
							color: "#4a5568",
							lineHeight: 1.4
						},
						children: company.footerText || "This Computer generated document, No signature is required. This document contains confidential information."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: "8.5px",
							color: "#a0aec0",
							marginTop: "4px"
						},
						children: ["Confidential - Payroll Document · Generated: ", (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")]
					})
				]
			})
		]
	});
}
function InfoRow({ label, val }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			fontSize: "10.5px",
			lineHeight: 1.45
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				style: {
					width: "105px",
					flexShrink: 0,
					color: "#1a202c",
					fontWeight: 600
				},
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				style: {
					width: "14px",
					textAlign: "center",
					color: "#4a5568",
					flexShrink: 0
				},
				children: ":"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				style: {
					flex: 1,
					color: "#1a202c",
					fontWeight: 500,
					wordBreak: "break-word"
				},
				children: val || "N/A"
			})
		]
	});
}
// src/utils/payslipExport.jsx
var import_server_browser = require_server_browser();
var import_html2canvas = /* @__PURE__ */ __toESM(require_html2canvas(), 1);
/**
* High-fidelity print utility for corporate A4 payslips.
* Creates an isolated, clean iframe containing only the A4 document
* and triggers window.print() with exact colors and zero UI modal interference.
*/
function printPayslipDocument(record, employee, settings) {
	try {
		const markup = (0, import_server_browser.renderToStaticMarkup)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayslipDocument, {
			record,
			employee,
			settings
		}));
		const empName = record?.employeeName || employee?.name || "Employee";
		const month = record?.month || "Period";
		const title = `Payslip-${empName.replace(/\s+/g, "_")}-${month.replace(/\s+/g, "_")}`;
		const iframe = document.createElement("iframe");
		iframe.style.position = "fixed";
		iframe.style.left = "-9999px";
		iframe.style.top = "0";
		iframe.style.width = "210mm";
		iframe.style.height = "297mm";
		iframe.style.border = "none";
		iframe.style.zIndex = "-99999";
		document.body.appendChild(iframe);
		const doc = iframe.contentWindow.document;
		doc.open();
		doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            * {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .payslip-a4-sheet {
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              margin: 0 auto !important;
              padding: 8mm 10mm !important;
              box-shadow: none !important;
              transform: none !important;
            }
          </style>
        </head>
        <body>
          ${markup}
        </body>
      </html>
    `);
		doc.close();
		setTimeout(() => {
			try {
				iframe.contentWindow.focus();
				iframe.contentWindow.print();
			} catch (err) {
				console.error("Print iframe execution failed:", err);
				window.print();
			}
			setTimeout(() => {
				try {
					document.body.removeChild(iframe);
				} catch {}
			}, 4e3);
		}, 350);
	} catch (err) {
		console.error("Failed to generate print markup:", err);
		window.print();
	}
}
/**
* Downloads the payslip as a genuine high-resolution A4 PDF.
* Uses html2canvas + jsPDF client-side rendering for instant, zero-latency PDF downloads.
* Gracefully falls back to standalone document or server endpoint if needed.
*/
async function downloadPayslipDocument(record, employee, settings) {
	const empCode = record?.employeeId || employee?.employeeId || record?.id || "EMP";
	record?.employeeName || employee?.name;
	const baseFilename = `Payslip-${empCode}-${(record?.month || "Period").replace(/\s+/g, "_")}`;
	let targetElem = document.getElementById("printable-payslip-modal") || document.getElementById("printable-payslip");
	let createdTemp = false;
	if (!targetElem) {
		createdTemp = true;
		const tempContainer = document.createElement("div");
		tempContainer.style.position = "fixed";
		tempContainer.style.left = "-9999px";
		tempContainer.style.top = "0";
		tempContainer.style.width = "210mm";
		tempContainer.style.zIndex = "-99999";
		tempContainer.style.backgroundColor = "#ffffff";
		tempContainer.innerHTML = (0, import_server_browser.renderToStaticMarkup)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayslipDocument, {
			record,
			employee,
			settings
		}));
		document.body.appendChild(tempContainer);
		targetElem = tempContainer.querySelector(".payslip-a4-sheet") || tempContainer;
	}
	try {
		const canvas = await (0, import_html2canvas.default)(targetElem, {
			scale: 2,
			useCORS: true,
			allowTaint: true,
			backgroundColor: "#ffffff",
			logging: false,
			windowWidth: 1200
		});
		if (createdTemp && targetElem?.parentNode) document.body.removeChild(targetElem.parentNode);
		const imgData = canvas.toDataURL("image/png");
		const pdf = new E({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
			compress: true
		});
		const pdfWidth = 210;
		const pdfHeight = canvas.height * pdfWidth / canvas.width;
		pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(297, pdfHeight), void 0, "FAST");
		pdf.save(`${baseFilename}.pdf`);
		return true;
	} catch (canvasErr) {
		console.warn("html2canvas/jsPDF client export failed, trying alternative:", canvasErr);
		if (createdTemp && targetElem?.parentNode) try {
			document.body.removeChild(targetElem.parentNode);
		} catch {}
		const id = record?._id || record?.id;
		if (id && id !== "draft" && !String(id).startsWith("pay-")) try {
			const blob = await apiClient.downloadBlob(`/payroll/${id}/pdf`);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${baseFilename}.pdf`;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				try {
					document.body.removeChild(a);
				} catch {}
				window.URL.revokeObjectURL(url);
			}, 500);
			return true;
		} catch (serverErr) {
			console.warn("Server PDF download failed:", serverErr);
		}
		try {
			const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${baseFilename}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      display: flex;
      justify-content: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; background: #fff; }
    }
  </style>
</head>
<body>
  ${(0, import_server_browser.renderToStaticMarkup)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayslipDocument, {
				record,
				employee,
				settings
			}))}
  <script>
    window.onload = function() {
      if (window.location.search.includes('print=true')) {
        window.print();
      }
    };
  <\/script>
</body>
</html>`;
			const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${baseFilename}.html`;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				try {
					document.body.removeChild(a);
				} catch {}
				window.URL.revokeObjectURL(url);
			}, 500);
			return true;
		} catch (err) {
			console.error("All download methods failed, falling back to print:", err);
			printPayslipDocument(record, employee, settings);
		}
	}
}
// src/components/payroll/PayslipPreviewModal.jsx
var btnStyle = {
	background: "transparent",
	border: "none",
	color: "#D4E1E2",
	fontSize: "11px",
	cursor: "pointer",
	padding: "4px 6px",
	borderRadius: "4px",
	display: "inline-flex",
	alignItems: "center"
};
var actionBtnStyle = {
	border: "none",
	color: "#ffffff",
	fontSize: "12px",
	fontWeight: 600,
	cursor: "pointer",
	padding: "6px 14px",
	borderRadius: "6px",
	display: "inline-flex",
	alignItems: "center",
	gap: "6px"
};
function PayslipPreviewModal({ record, employee, settings, onClose, canEmail = false }) {
	const [zoom, setZoom] = (0, import_react.useState)(100);
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	const [emailing, setEmailing] = (0, import_react.useState)(false);
	const [emailNotice, setEmailNotice] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (typeof document === "undefined") return;
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				if (onClose) onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);
	const empName = record?.employeeName || employee?.name || "Employee";
	const month = record?.month || "Period";
	const handlePrint = () => {
		printPayslipDocument(record, employee, settings);
	};
	const handleDownloadPdf = async () => {
		setDownloading(true);
		try {
			await downloadPayslipDocument(record, employee, settings);
		} catch (err) {
			console.error("Download failed, using print dialog:", err);
			printPayslipDocument(record, employee, settings);
		} finally {
			setDownloading(false);
		}
	};
	const handleEmail = async () => {
		if (!record?.id && !record?._id) {
			setEmailNotice("Please save the payslip draft first before sending via email.");
			return;
		}
		setEmailing(true);
		setEmailNotice(null);
		try {
			const id = record.id || record._id;
			const res = await apiClient.post(`/payroll/${id}/email`);
			setEmailNotice(res?.data?.message || "Payslip emailed successfully!");
		} catch (err) {
			setEmailNotice(err.message || "Failed to email payslip. Check email configuration.");
		} finally {
			setEmailing(false);
		}
	};
	const modalNode = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "payslip-preview-overlay",
		style: {
			position: "fixed",
			inset: 0,
			zIndex: 2147483647,
			backgroundColor: "rgba(11, 23, 39, 0.85)",
			backdropFilter: "blur(5px)",
			WebkitBackdropFilter: "blur(5px)",
			display: "flex",
			flexDirection: "column",
			width: "100vw",
			height: "100vh",
			overflow: "hidden"
		},
		onClick: onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "payslip-modal-toolbar",
				style: {
					flex: "0 0 auto",
					position: "sticky",
					top: 0,
					zIndex: 2147483646,
					backgroundColor: "#002D33",
					color: "#ffffff",
					padding: "10px 20px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: "12px",
					boxShadow: "0 3px 14px rgba(0,0,0,0.3)",
					borderBottom: "1px solid rgba(255,255,255,0.12)"
				},
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: "36px",
								height: "36px",
								borderRadius: "8px",
								background: "rgba(45, 212, 191, 0.15)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#2dd4bf"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "15px",
								fontWeight: 700,
								color: "#F4FCFC",
								letterSpacing: "-0.2px"
							},
							children: ["Payslip Voucher: ", empName]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "11px",
								color: "#94a3b8"
							},
							children: [month, " · Official A4 Corporate Document"]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							background: "rgba(255,255,255,0.08)",
							padding: "4px 10px",
							borderRadius: "6px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								style: btnStyle,
								onClick: () => setZoom((z) => Math.max(50, z - 10)),
								title: "Zoom Out",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, {
									size: 13,
									style: {
										verticalAlign: "middle",
										marginRight: "3px"
									}
								}), "Zoom -"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "12px",
									fontWeight: 600,
									minWidth: "45px",
									textAlign: "center",
									color: "#F4FCFC"
								},
								children: [zoom, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								style: btnStyle,
								onClick: () => setZoom((z) => Math.min(150, z + 10)),
								title: "Zoom In",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, {
									size: 13,
									style: {
										verticalAlign: "middle",
										marginRight: "3px"
									}
								}), "Zoom +"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								style: {
									...btnStyle,
									opacity: zoom === 100 ? .7 : 1
								},
								onClick: () => setZoom(100),
								title: "Reset to 100%",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									size: 12,
									style: {
										verticalAlign: "middle",
										marginRight: "3px"
									}
								}), "Fit 100%"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [
							canEmail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								style: {
									...actionBtnStyle,
									background: "#006E6F"
								},
								onClick: handleEmail,
								disabled: emailing,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 14 }), emailing ? "Sending..." : "Email"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								style: {
									...actionBtnStyle,
									background: downloading ? "#586D72" : "#006E6F"
								},
								onClick: handleDownloadPdf,
								disabled: downloading,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), downloading ? "Generating PDF..." : "Download PDF"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								style: {
									...actionBtnStyle,
									background: "#F0A13E",
									color: "#0A2328"
								},
								onClick: handlePrint,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { size: 14 }), "Print"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								style: {
									...actionBtnStyle,
									background: "#dc2626",
									color: "#ffffff",
									border: "1px solid rgba(255,255,255,0.3)",
									padding: "7px 18px",
									fontWeight: 700,
									cursor: "pointer",
									boxShadow: "0 2px 8px rgba(220,38,38,0.4)",
									marginLeft: "4px"
								},
								onClick: onClose,
								title: "Close (Esc)",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									size: 16,
									strokeWidth: 2.5
								}), "Close"]
							})
						]
					})
				]
			}),
			emailNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					background: "#006E6F",
					color: "#F4FCFC",
					padding: "8px 20px",
					fontSize: "12px",
					textAlign: "center",
					fontWeight: 600
				},
				children: emailNotice
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					flex: 1,
					overflow: "auto",
					padding: "28px 16px 80px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					background: "#0f172a",
					WebkitOverflowScrolling: "touch"
				},
				onClick: onClose,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					onClick: (e) => e.stopPropagation(),
					style: {
						transform: zoom !== 100 ? `scale(${zoom / 100})` : void 0,
						transformOrigin: "top center",
						transition: "transform 0.15s ease-out",
						margin: "0 auto"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayslipDocument, {
						id: "printable-payslip-modal",
						record,
						employee,
						settings,
						scale: 1
					})
				})
			})
		]
	});
	return typeof document !== "undefined" && document?.body ? (0, import_react_dom.createPortal)(modalNode, document.body) : modalNode;
}
export { numberToWordsINR as a, formatINR as i, downloadPayslipDocument as n, printPayslipDocument as r, PayslipPreviewModal as t };
