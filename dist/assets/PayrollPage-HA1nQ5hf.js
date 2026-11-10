import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $t as Calendar, Dt as FileText, Ft as Download, It as DollarSign, Jt as ChevronLeft, K as Plus, L as Search, Mt as Eye, N as Settings, O as SlidersHorizontal, W as Printer, Wt as CircleCheck, _n as require_react, d as Users, in as BuildingComplex, ot as Mail, qt as ChevronRight, v as TrendingUp, y as Trash } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { I as apiClient, O as currentPayrollMonth, T as hrStore, c as StatusBadge, o as PageHeader, x as useAuth } from "./index-Dt67Jwkc.js";
import { a as numberToWordsINR, i as formatINR, n as downloadPayslipDocument, r as printPayslipDocument, t as PayslipPreviewModal } from "./PayslipPreviewModal-CurQB-CI.js";
import { n as findEmployeeForUser, r as unmaskBankAccount, t as doesPayrollMatchUser } from "./payrollMatcher-DYZYv1X2.js";
// src/components/payroll/CompanySettingsModal.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var labelStyle$1 = {
	display: "block",
	fontSize: "11.5px",
	fontWeight: 700,
	color: "#334155",
	marginBottom: "4px"
};
var inputStyle$1 = {
	width: "100%",
	padding: "8px 12px",
	borderRadius: "5px",
	border: "1px solid #cbd5e1",
	fontSize: "13px",
	boxSizing: "border-box"
};
function CompanySettingsModal({ settings = {}, onSave, onClose }) {
	const [form, setForm] = (0, import_react.useState)({
		companyName: settings.companyName || "Elythra Edufyi Tech Solutions Pvt Ltd",
		companyLegalName: settings.companyLegalName || "Elythra Edufyi Tech Solutions Pvt Ltd",
		address: settings.address || "Third Floor, 7 Hills, #424, 10th Cross, 27th Main, Sector 1, HSR Layout, Bengaluru, Karnataka 560102",
		phone: settings.phone || "+91 80 4567 8900",
		email: settings.email || "hr@edufyitech.in",
		website: settings.website || "https://edufyitech.in",
		taxId: settings.taxId || "29AABCE1234F1Z5",
		currency: settings.currency || "INR",
		currencySymbol: settings.currencySymbol || "₹",
		logoUrl: settings.logoUrl || "/elythra-edufyitech-logo.png",
		primaryColor: settings.primaryColor || "#087E9E",
		secondaryColor: settings.secondaryColor || "#0B3155",
		footerText: settings.footerText || "This Computer generated document, No signature is required. This document contains confidential information.",
		maskBankAccount: Boolean(settings.maskBankAccount === true),
		defaultBranch: settings.defaultBranch === "IGNITE CAMPUS" || !settings.defaultBranch ? "Bengaluru HQ" : settings.defaultBranch,
		branchAddress: settings.branchAddress || "",
		branchCity: settings.branchCity || "Bengaluru"
	});
	const availableBranches = Array.from(new Set([
		"Bengaluru HQ",
		...Array.isArray(settings.branches) ? settings.branches.filter((b) => ![
			"IGNITE CAMPUS",
			"Delhi NCR Branch",
			"Hyderabad Tech Hub",
			"Mumbai Regional Office",
			"Remote / Distributed",
			"Bengaluru"
		].includes(b)) : [],
		...Array.isArray(settings.locations) ? settings.locations.map((l) => typeof l === "string" ? l : l.name).filter((b) => ![
			"IGNITE CAMPUS",
			"Delhi NCR Branch",
			"Hyderabad Tech Hub",
			"Mumbai Regional Office",
			"Remote / Distributed",
			"Bengaluru"
		].includes(b)) : []
	].filter(Boolean)));
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const handleLogoUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setForm((prev) => ({
				...prev,
				logoUrl: reader.result
			}));
		};
		reader.readAsDataURL(file);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			await onSave(form);
			onClose();
		} catch (err) {
			setError(err.message || "Failed to update company settings.");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			zIndex: 99999,
			backgroundColor: "rgba(0, 0, 0, 0.65)",
			backdropFilter: "blur(3px)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "20px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				background: "#ffffff",
				borderRadius: "8px",
				width: "100%",
				maxWidth: "680px",
				maxHeight: "90vh",
				overflow: "auto",
				boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
				padding: "24px",
				color: "#1a202c"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "16px",
						borderBottom: "1px solid #e2e8f0",
						paddingBottom: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: 0,
							fontSize: "18px",
							fontWeight: 800,
							color: "#0B3155"
						},
						children: "Company Branding & Payslip Configuration"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "12px",
							color: "#64748b"
						},
						children: "Changes will dynamically reflect on all generated payslip headers and vouchers."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						style: {
							background: "none",
							border: "none",
							fontSize: "20px",
							cursor: "pointer",
							color: "#94a3b8"
						},
						children: "✕"
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						background: "#fef2f2",
						border: "1px solid #f87171",
						color: "#991b1b",
						padding: "10px 14px",
						borderRadius: "6px",
						marginBottom: "16px",
						fontSize: "13px"
					},
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					style: {
						display: "grid",
						gap: "16px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								border: "1px solid #e2e8f0",
								borderRadius: "6px",
								padding: "14px",
								background: "#f8fafc"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "12px",
									fontWeight: 700,
									marginBottom: "6px",
									color: "#334155"
								},
								children: "Company Logo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "16px",
									flexWrap: "wrap"
								},
								children: [form.logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										padding: "6px",
										background: "#fff",
										border: "1px solid #cbd5e1",
										borderRadius: "4px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: form.logoUrl,
										alt: "Logo Preview",
										style: {
											maxHeight: "48px",
											maxWidth: "140px",
											objectFit: "contain",
											display: "block"
										}
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { flex: 1 },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											accept: "image/*",
											onChange: handleLogoUpload,
											style: { fontSize: "12px" }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "11px",
												color: "#64748b",
												marginTop: "4px"
											},
											children: "Or enter logo image URL:"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: form.logoUrl,
											onChange: (e) => setForm({
												...form,
												logoUrl: e.target.value
											}),
											placeholder: "/elythra-edufyitech-logo.png",
											style: inputStyle$1
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Company Trade Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								value: form.companyName,
								onChange: (e) => setForm({
									...form,
									companyName: e.target.value
								}),
								style: inputStyle$1
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Company Legal / Registered Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								value: form.companyLegalName,
								onChange: (e) => setForm({
									...form,
									companyLegalName: e.target.value
								}),
								style: inputStyle$1
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Complete Registered Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							required: true,
							rows: 2,
							value: form.address,
							onChange: (e) => setForm({
								...form,
								address: e.target.value
							}),
							style: {
								...inputStyle$1,
								resize: "vertical"
							}
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								border: "1px solid #cbd5e1",
								borderRadius: "6px",
								padding: "14px",
								background: "#f8fafc"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "12px",
											fontWeight: 700,
											color: "#0B3155",
											margin: 0
										},
										children: "🏢 Default Office Branch & Payroll Location"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "11px",
											color: "#64748b"
										},
										children: "Applies to company salary slips & vouchers"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											style: labelStyle$1,
											children: "Branch Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: availableBranches.includes(form.defaultBranch) ? form.defaultBranch : "__custom__",
											onChange: (e) => {
												if (e.target.value !== "__custom__") setForm({
													...form,
													defaultBranch: e.target.value
												});
												else setForm({
													...form,
													defaultBranch: ""
												});
											},
											style: inputStyle$1,
											children: [availableBranches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: b,
												children: b
											}, b)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "__custom__",
												children: "+ Enter Custom Branch..."
											})]
										}),
										(!availableBranches.includes(form.defaultBranch) || form.defaultBranch === "") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											placeholder: "Enter custom branch name...",
											value: form.defaultBranch,
											onChange: (e) => setForm({
												...form,
												defaultBranch: e.target.value
											}),
											style: {
												...inputStyle$1,
												marginTop: "6px"
											}
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: labelStyle$1,
										children: "Branch City / State"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "e.g. Bengaluru, Karnataka",
										value: form.branchCity,
										onChange: (e) => setForm({
											...form,
											branchCity: e.target.value
										}),
										style: inputStyle$1
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { marginTop: "10px" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: labelStyle$1,
										children: "Branch Specific Address (Optional override on payslip vouchers)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "Leave blank to use main registered address",
										value: form.branchAddress,
										onChange: (e) => setForm({
											...form,
											branchAddress: e.target.value
										}),
										style: inputStyle$1
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
								gap: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Contact Phone"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: form.phone,
									onChange: (e) => setForm({
										...form,
										phone: e.target.value
									}),
									style: inputStyle$1
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Payroll / HR Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "email",
									value: form.email,
									onChange: (e) => setForm({
										...form,
										email: e.target.value
									}),
									style: inputStyle$1
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Official Website"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: form.website,
									onChange: (e) => setForm({
										...form,
										website: e.target.value
									}),
									style: inputStyle$1
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
								gap: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "GST / PAN / Tax ID"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: form.taxId,
									onChange: (e) => setForm({
										...form,
										taxId: e.target.value
									}),
									style: inputStyle$1
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Currency Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: form.currency,
									onChange: (e) => setForm({
										...form,
										currency: e.target.value
									}),
									style: inputStyle$1
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle$1,
									children: "Currency Symbol"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: form.currencySymbol,
									onChange: (e) => setForm({
										...form,
										currencySymbol: e.target.value
									}),
									style: inputStyle$1
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Primary Color (Tables, Headers)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "color",
									value: form.primaryColor,
									onChange: (e) => setForm({
										...form,
										primaryColor: e.target.value
									}),
									style: {
										width: "40px",
										height: "36px",
										padding: "2px",
										cursor: "pointer"
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: form.primaryColor,
									onChange: (e) => setForm({
										...form,
										primaryColor: e.target.value
									}),
									style: inputStyle$1
								})]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: labelStyle$1,
								children: "Secondary Color (Subheaders, Text)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "color",
									value: form.secondaryColor,
									onChange: (e) => setForm({
										...form,
										secondaryColor: e.target.value
									}),
									style: {
										width: "40px",
										height: "36px",
										padding: "2px",
										cursor: "pointer"
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: form.secondaryColor,
									onChange: (e) => setForm({
										...form,
										secondaryColor: e.target.value
									}),
									style: inputStyle$1
								})]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								...labelStyle$1,
								display: "flex",
								alignItems: "center",
								gap: "8px",
								cursor: "pointer"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.maskBankAccount,
								onChange: (e) => setForm({
									...form,
									maskBankAccount: e.target.checked
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mask bank account numbers on payslip vouchers (e.g. ●●●●●●●●7650)" })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: labelStyle$1,
							children: "Payslip Footer Disclaimer Text"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: form.footerText,
							onChange: (e) => setForm({
								...form,
								footerText: e.target.value
							}),
							style: inputStyle$1
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								marginTop: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onClose,
								style: {
									padding: "8px 18px",
									borderRadius: "6px",
									border: "1px solid #cbd5e1",
									background: "#f8fafc",
									color: "#475569",
									fontWeight: 600,
									cursor: "pointer"
								},
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: saving,
								style: {
									padding: "8px 20px",
									borderRadius: "6px",
									border: "none",
									background: "#087E9E",
									color: "#ffffff",
									fontWeight: 700,
									cursor: "pointer"
								},
								children: saving ? "Saving..." : "Save Settings"
							})]
						})
					]
				})
			]
		})
	});
}
// src/utils/monthHelper.js
/**
* Comprehensive utilities for payroll months, calendars, and date conversions
*/
function formatToMonthYear(date) {
	if (!date || isNaN(new Date(date).getTime())) date = /* @__PURE__ */ new Date();
	return new Date(date).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	});
}
function formatMonthInputToLabel(yearMonthStr) {
	if (!yearMonthStr) return "";
	const parts = yearMonthStr.split("-");
	if (parts.length < 2) return yearMonthStr;
	const y = parseInt(parts[0], 10);
	const m = parseInt(parts[1], 10);
	if (isNaN(y) || isNaN(m)) return yearMonthStr;
	return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	});
}
function formatLabelToMonthInput(label) {
	if (!label || label === "all") return "";
	const parts = label.trim().split(/\s+/);
	if (parts.length === 2) {
		const d = /* @__PURE__ */ new Date(`${parts[0]} 1, ${parts[1]}`);
		if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	}
	const d = new Date(label);
	if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	return "";
}
function getDaysInMonth(label) {
	const ym = formatLabelToMonthInput(label);
	if (!ym) return 30;
	const [y, m] = ym.split("-").map(Number);
	return new Date(y, m, 0).getDate();
}
function offsetMonth(label, offset = 1) {
	const ym = formatLabelToMonthInput(label);
	const base = ym ? new Date(Number(ym.split("-")[0]), Number(ym.split("-")[1]) - 1, 1) : /* @__PURE__ */ new Date();
	base.setMonth(base.getMonth() + offset);
	return formatToMonthYear(base);
}
function getPayrollMonthOptions(existingRecords = []) {
	const set = /* @__PURE__ */ new Set();
	const now = /* @__PURE__ */ new Date();
	set.add(formatToMonthYear(now));
	if (Array.isArray(existingRecords)) existingRecords.forEach((r) => {
		if (r?.month) set.add(r.month);
	});
	for (let offset = -1; offset >= -24; offset--) {
		const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
		set.add(formatToMonthYear(d));
	}
	return Array.from(set).sort((a, b) => {
		const ymA = formatLabelToMonthInput(a);
		return formatLabelToMonthInput(b).localeCompare(ymA);
	});
}
// src/components/payroll/PayrollMonthPicker.jsx
/**
* Interactive Payroll Month Picker with dropdown, calendar picker, and step controls
*/
function PayrollMonthPicker({ value, onChange, allowAll = false, allLabel = "All Months", existingRecords = [], showPresets = true, showSteppers = true, className = "", style = {}, label }) {
	const dateInputRef = (0, import_react.useRef)(null);
	const rawOptions = getPayrollMonthOptions(existingRecords);
	const currentMonthLabel = formatToMonthYear(/* @__PURE__ */ new Date());
	const nextMonthLabel = offsetMonth(currentMonthLabel, 1);
	const displayOptions = value && value !== "all" && !rawOptions.includes(value) ? [value, ...rawOptions].sort((a, b) => {
		const ymA = formatLabelToMonthInput(a);
		return formatLabelToMonthInput(b).localeCompare(ymA);
	}) : rawOptions;
	const handleDateInputChange = (e) => {
		const raw = e.target.value;
		if (!raw) return;
		const formatted = formatMonthInputToLabel(raw);
		if (formatted) onChange(formatted);
	};
	const handleStep = (step) => {
		if (!value || value === "all") {
			onChange(currentMonthLabel);
			return;
		}
		onChange(offsetMonth(value, step));
	};
	const handleCalendarClick = () => {
		if (dateInputRef.current) {
			try {
				if (typeof dateInputRef.current.showPicker === "function") {
					dateInputRef.current.showPicker();
					return;
				}
			} catch {}
			try {
				dateInputRef.current.focus();
				dateInputRef.current.click();
			} catch {}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `payroll-month-picker-root ${className}`,
		style: {
			display: "grid",
			gap: "6px",
			...style
		},
		children: [
			label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				style: {
					fontSize: "11.5px",
					fontWeight: 600,
					color: "var(--ink, #0A2328)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: "10.5px",
						color: "var(--muted, #586D72)",
						fontWeight: 400
					},
					children: "Pick from calendar or list"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "6px",
					flexWrap: "wrap"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							position: "relative",
							display: "flex",
							alignItems: "center",
							flex: "1",
							minWidth: "170px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value,
							onChange: (e) => {
								if (e.target.value === "__open_calendar__") handleCalendarClick();
								else onChange(e.target.value);
							},
							className: "payroll-select",
							style: {
								width: "100%",
								minHeight: "36px",
								paddingLeft: "32px",
								paddingRight: "12px",
								fontSize: "12.5px",
								fontWeight: 500,
								background: "#ffffff",
								border: "1px solid var(--line, #D6E2E3)",
								borderRadius: "8px",
								color: "var(--ink, #0A2328)",
								cursor: "pointer"
							},
							children: [
								allowAll && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: allLabel
								}),
								displayOptions.map((m) => {
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: m,
										children: [
											m,
											" ",
											m === currentMonthLabel ? "• (Current)" : ""
										]
									}, m);
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "__open_calendar__",
									children: "📅 Pick from Calendar..."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
							size: 14,
							style: {
								position: "absolute",
								left: "10px",
								color: "var(--teal, #006E6F)",
								pointerEvents: "none"
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { position: "relative" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleCalendarClick,
							className: "payroll-icon-btn",
							style: {
								width: "36px",
								height: "36px",
								borderRadius: "8px",
								border: "1px solid var(--line, #D6E2E3)",
								background: "#f8fafc",
								color: "var(--teal, #006E6F)",
								cursor: "pointer",
								display: "grid",
								placeItems: "center"
							},
							title: "Open Calendar Month Picker",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 15 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: dateInputRef,
							type: "month",
							value: formatLabelToMonthInput(value),
							onChange: handleDateInputChange,
							style: {
								position: "absolute",
								bottom: 0,
								left: 0,
								width: "1px",
								height: "1px",
								opacity: 0,
								pointerEvents: "none",
								border: 0,
								padding: 0
							},
							tabIndex: -1,
							"aria-hidden": "true"
						})]
					}),
					showSteppers && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "inline-flex",
							gap: "3px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => handleStep(-1),
							className: "payroll-icon-btn",
							style: {
								width: "36px",
								height: "36px",
								borderRadius: "8px",
								border: "1px solid var(--line, #D6E2E3)",
								background: "#f8fafc",
								color: "#475569",
								cursor: "pointer"
							},
							title: "Previous Month",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 15 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => handleStep(1),
							className: "payroll-icon-btn",
							style: {
								width: "36px",
								height: "36px",
								borderRadius: "8px",
								border: "1px solid var(--line, #D6E2E3)",
								background: "#f8fafc",
								color: "#475569",
								cursor: "pointer"
							},
							title: "Next Month",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 15 })
						})]
					})
				]
			}),
			showPresets && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: "6px",
					alignItems: "center",
					flexWrap: "wrap",
					marginTop: "2px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(currentMonthLabel),
					style: {
						fontSize: "10.5px",
						padding: "3px 8px",
						borderRadius: "6px",
						border: value === currentMonthLabel ? "1px solid var(--teal, #006E6F)" : "1px solid var(--line, #D6E2E3)",
						background: value === currentMonthLabel ? "var(--soft-teal, #E1F1F0)" : "#f8fafc",
						color: value === currentMonthLabel ? "var(--teal, #006E6F)" : "#64748b",
						fontWeight: 600,
						cursor: "pointer"
					},
					children: [
						"Current (",
						currentMonthLabel.split(" ")[0],
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(nextMonthLabel),
					style: {
						fontSize: "10.5px",
						padding: "3px 8px",
						borderRadius: "6px",
						border: value === nextMonthLabel ? "1px solid var(--teal, #006E6F)" : "1px solid var(--line, #D6E2E3)",
						background: value === nextMonthLabel ? "var(--soft-teal, #E1F1F0)" : "#f8fafc",
						color: value === nextMonthLabel ? "var(--teal, #006E6F)" : "#64748b",
						fontWeight: 600,
						cursor: "pointer"
					},
					children: [
						"Next Month (",
						nextMonthLabel.split(" ")[0],
						")"
					]
				})]
			})
		]
	});
}
// src/components/payroll/BulkGenerateModal.jsx
var labelStyle = {
	display: "block",
	fontSize: "11.5px",
	fontWeight: 700,
	color: "#334155",
	marginBottom: "4px"
};
var inputStyle = {
	width: "100%",
	padding: "8px 12px",
	borderRadius: "5px",
	border: "1px solid #cbd5e1",
	fontSize: "13px",
	boxSizing: "border-box"
};
function BulkGenerateModal({ employees = [], onGenerate, onClose }) {
	const [month, setMonth] = (0, import_react.useState)(currentPayrollMonth);
	const [selectedDept, setSelectedDept] = (0, import_react.useState)("all");
	const [selectedBranch, setSelectedBranch] = (0, import_react.useState)("all");
	const [selectedIds, setSelectedIds] = (0, import_react.useState)(() => employees.filter((e) => e.status === "active").map((e) => e.employeeId || e._id || e.id).filter(Boolean));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const departments = ["all", ...new Set(employees.map((e) => e.department).filter(Boolean))];
	const branches = ["all", ...new Set(employees.map((e) => {
		const loc = e.location || e.branch;
		if (!loc || [
			"bengaluru",
			"ignite campus",
			"ignite campus (bengaluru)",
			"bengaluru hq"
		].includes(String(loc).toLowerCase())) return "Bengaluru HQ";
		return loc;
	}).filter(Boolean))];
	const filteredEmployees = employees.filter((e) => {
		if (e.status !== "active") return false;
		if (selectedDept !== "all" && e.department !== selectedDept) return false;
		if (selectedBranch !== "all") {
			const loc = e.location || e.branch;
			if ((!loc || [
				"bengaluru",
				"ignite campus",
				"ignite campus (bengaluru)",
				"bengaluru hq"
			].includes(String(loc).toLowerCase()) ? "Bengaluru HQ" : loc) !== selectedBranch) return false;
		}
		return true;
	});
	const handleToggleAll = (e) => {
		if (e.target.checked) setSelectedIds(filteredEmployees.map((emp) => emp.employeeId || emp._id || emp.id).filter(Boolean));
		else setSelectedIds([]);
	};
	const handleToggleOne = (empId) => {
		setSelectedIds((prev) => prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]);
	};
	const handleRun = async () => {
		if (selectedIds.length === 0) {
			setError("Please select at least one employee.");
			return;
		}
		setBusy(true);
		setError(null);
		setResult(null);
		try {
			const res = await onGenerate({
				month: typeof month === "function" ? month() : typeof month === "string" && month ? month : currentPayrollMonth(),
				employeeIds: selectedIds.map(String).filter(Boolean),
				department: selectedDept,
				branch: selectedBranch
			});
			setResult(res?.message || res?.data?.message || `Successfully generated bulk payroll drafts for ${selectedIds.length} employee(s).`);
		} catch (err) {
			setError(err?.response?.data?.message || err?.message || "Bulk generation failed.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			zIndex: 99999,
			backgroundColor: "rgba(0, 0, 0, 0.65)",
			backdropFilter: "blur(3px)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "20px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				background: "#ffffff",
				borderRadius: "8px",
				width: "100%",
				maxWidth: "640px",
				maxHeight: "90vh",
				overflow: "auto",
				boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
				padding: "24px",
				color: "#1a202c"
			},
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "16px",
						borderBottom: "1px solid #e2e8f0",
						paddingBottom: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: 0,
							fontSize: "18px",
							fontWeight: 800,
							color: "#0B3155"
						},
						children: "Bulk Payroll Generation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "12px",
							color: "#64748b"
						},
						children: "Create reviewed draft payslips for multiple employees simultaneously."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						style: {
							background: "none",
							border: "none",
							fontSize: "20px",
							cursor: "pointer",
							color: "#94a3b8"
						},
						children: "✕"
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						background: "#fef2f2",
						border: "1px solid #f87171",
						color: "#991b1b",
						padding: "10px 14px",
						borderRadius: "6px",
						marginBottom: "16px",
						fontSize: "13px"
					},
					children: error
				}),
				result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						background: "#f0fdf4",
						border: "1px solid #4ade80",
						color: "#166534",
						padding: "10px 14px",
						borderRadius: "6px",
						marginBottom: "16px",
						fontSize: "13px",
						fontWeight: 600
					},
					children: result
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: "16px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr 1fr",
								gap: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayrollMonthPicker, {
									label: "Payroll Period *",
									value: typeof month === "function" ? month() : month,
									onChange: setMonth,
									showPresets: true,
									showSteppers: true
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle,
									children: "Filter Department"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: selectedDept,
									onChange: (e) => {
										setSelectedDept(e.target.value);
										const dept = e.target.value;
										const matching = employees.filter((emp) => {
											if (emp.status !== "active") return false;
											if (dept !== "all" && emp.department !== dept) return false;
											if (selectedBranch !== "all" && (emp.location || emp.branch) !== selectedBranch) return false;
											return true;
										});
										setSelectedIds(matching.map((emp) => emp.employeeId));
									},
									style: inputStyle,
									children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: d,
										children: d === "all" ? "All Departments" : d
									}, d))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: labelStyle,
									children: "Filter Office Branch"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: selectedBranch,
									onChange: (e) => {
										setSelectedBranch(e.target.value);
										const branch = e.target.value;
										const matching = employees.filter((emp) => {
											if (emp.status !== "active") return false;
											if (selectedDept !== "all" && emp.department !== selectedDept) return false;
											if (branch !== "all" && (emp.location || emp.branch) !== branch) return false;
											return true;
										});
										setSelectedIds(matching.map((emp) => emp.employeeId));
									},
									style: inputStyle,
									children: branches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: b,
										children: b === "all" ? "All Branches" : b
									}, b))
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: {
									...labelStyle,
									marginBottom: 0
								},
								children: [
									"Employees to Process (",
									selectedIds.length,
									" of ",
									filteredEmployees.length,
									" selected)"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: {
									fontSize: "12px",
									display: "flex",
									alignItems: "center",
									gap: "6px",
									cursor: "pointer",
									color: "#087E9E",
									fontWeight: 600
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0,
									onChange: handleToggleAll
								}), "Select All"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								border: "1px solid #cbd5e1",
								borderRadius: "6px",
								maxHeight: "240px",
								overflowY: "auto",
								padding: "6px"
							},
							children: filteredEmployees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									padding: "16px",
									textAlign: "center",
									color: "#94a3b8",
									fontSize: "12px"
								},
								children: "No active employees found matching the filters."
							}) : filteredEmployees.map((emp) => {
								const empKey = emp.employeeId || emp._id || emp.id;
								const isChecked = selectedIds.includes(empKey);
								const loc = emp.location || emp.branch;
								const empBranch = !loc || [
									"bengaluru",
									"ignite campus",
									"ignite campus (bengaluru)",
									"bengaluru hq"
								].includes(String(loc).toLowerCase()) ? "Bengaluru HQ" : loc;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "6px 10px",
										borderRadius: "4px",
										cursor: "pointer",
										background: isChecked ? "#f0f9ff" : "transparent",
										borderBottom: "1px solid #f1f5f9"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: isChecked,
											onChange: () => handleToggleOne(empKey)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "12.5px",
												fontWeight: 600,
												color: "#1e293b"
											},
											children: emp.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "10.5px",
												color: "#64748b"
											},
											children: [
												emp.employeeId,
												" · ",
												emp.department || "General",
												" · ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													style: {
														color: "#087E9E",
														fontWeight: 600
													},
													children: ["📍 ", empBranch]
												})
											]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "#087E9E"
										},
										children: [
											"CTC: ₹",
											(emp.salary || 4e5).toLocaleString("en-IN"),
											"/yr"
										]
									})]
								}, empKey);
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								marginTop: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: onClose,
								style: {
									padding: "8px 18px",
									borderRadius: "6px",
									border: "1px solid #cbd5e1",
									background: "#f8fafc",
									color: "#475569",
									fontWeight: 600,
									cursor: "pointer"
								},
								children: "Close"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy || selectedIds.length === 0,
								onClick: handleRun,
								style: {
									padding: "8px 20px",
									borderRadius: "6px",
									border: "none",
									background: "#087E9E",
									color: "#ffffff",
									fontWeight: 700,
									cursor: "pointer",
									opacity: busy || selectedIds.length === 0 ? .6 : 1
								},
								children: busy ? "Processing..." : `Generate ${selectedIds.length} Payslip(s)`
							})]
						})
					]
				})
			]
		})
	});
}
// src/pages/PayrollPage.jsx
var DEFAULT_EARNINGS = [
	{
		name: "Basic Salary",
		monthlyRate: 18e3,
		currentMonth: 18e3,
		arrear: 0,
		total: 18e3
	},
	{
		name: "House Rent Allowance",
		monthlyRate: 9e3,
		currentMonth: 9e3,
		arrear: 0,
		total: 9e3
	},
	{
		name: "Conveyance Allowance",
		monthlyRate: 1600,
		currentMonth: 1600,
		arrear: 0,
		total: 1600
	},
	{
		name: "Special Allowance",
		monthlyRate: 4e3,
		currentMonth: 4e3,
		arrear: 0,
		total: 4e3
	},
	{
		name: "Other Allowance",
		monthlyRate: 1e3,
		currentMonth: 1e3,
		arrear: 0,
		total: 1e3
	},
	{
		name: "Bonus",
		monthlyRate: 0,
		currentMonth: 0,
		arrear: 0,
		total: 0
	},
	{
		name: "Overtime",
		monthlyRate: 0,
		currentMonth: 0,
		arrear: 0,
		total: 0
	}
];
var DEFAULT_DEDUCTIONS = [
	{
		name: "Provident Fund (P.F.)",
		amount: 1800
	},
	{
		name: "Professional Tax",
		amount: 200
	},
	{
		name: "ESI",
		amount: 0
	},
	{
		name: "TDS / Income Tax",
		amount: 0
	}
];
function normalizeBranch(b) {
	if (!b) return "Bengaluru HQ";
	const trimmed = String(b).trim();
	if ([
		"bengaluru",
		"ignite campus",
		"ignite campus (bengaluru)",
		"bengaluru hq"
	].includes(trimmed.toLowerCase())) return "Bengaluru HQ";
	return trimmed;
}
function calculateEmpAttendanceContext(emp, monthStr, attendanceList = [], leavesList = []) {
	if (!emp) return {
		lopDays: 0,
		attendanceDays: 0,
		lateCount: 0
	};
	const empId = String(emp.employeeId || emp.code || "").toUpperCase();
	const empObjId = String(emp._id || emp.id || "");
	const records = (attendanceList || []).filter((a) => {
		const aEmp = String(a.employeeId || a.employeeRef || "").toUpperCase();
		return empId && aEmp === empId || empObjId && aEmp === empObjId.toUpperCase();
	});
	const counted = /* @__PURE__ */ new Set();
	let lop = 0;
	for (const r of records) {
		const dateStr = String(r.date || "");
		const day = Number(dateStr.split("-")[2]) || 1;
		const isLop = r.status === "lop" || r.isLop || r.status === "absent";
		const isHalf = r.status === "half-day" || r.isHalfDay;
		const isDouble = day >= 25 || r.isDoubleLop || r.doubleLopStatus === "approved";
		if (isLop) {
			lop += isDouble ? 2 : 1;
			counted.add(dateStr);
		} else if (isHalf) {
			if (!(leavesList || []).some((l) => {
				const lEmp = String(l.employeeId?._id || l.employeeId?.employeeId || l.employeeId || "").toUpperCase();
				if (!(empId && lEmp === empId || empObjId && lEmp === empObjId.toUpperCase())) return false;
				if (l.status !== "approved" || !l.isHalfDay) return false;
				const sStr = typeof l.startDate === "string" ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10);
				const eStr = typeof l.endDate === "string" ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10);
				if (dateStr < sStr || dateStr > eStr) return false;
				return l.paidUnits > 0 || l.leaveType !== "lop" && l.leaveType !== "double_lop";
			})) lop += .5;
			counted.add(dateStr);
		}
	}
	for (const l of leavesList || []) {
		const lEmp = String(l.employeeId?._id || l.employeeId?.employeeId || l.employeeId || "").toUpperCase();
		if (empId && lEmp === empId || empObjId && lEmp === empObjId.toUpperCase()) {
			if (l.status === "approved") {
				if (l.doubleLopDays && l.doubleLopDays > 0) lop += l.doubleLopDays * 2;
				else if (l.isDoubleLop) lop += (l.units || 1) * 2;
				else if (String(l.leaveType).toLowerCase() === "lop") lop += l.units || 1;
			}
		}
	}
	if (monthStr && typeof monthStr === "string") {
		const cleanMonth = monthStr.trim();
		let y = 0;
		let m = 0;
		const yyyymm = /^(\d{4})-(\d{1,2})$/.exec(cleanMonth);
		if (yyyymm) {
			y = Number(yyyymm[1]);
			m = Number(yyyymm[2]);
		} else {
			const parsed = /* @__PURE__ */ new Date(`${cleanMonth} 1, 2026`);
			if (!isNaN(parsed.getTime())) {
				y = parsed.getFullYear();
				m = parsed.getMonth() + 1;
			}
		}
		if (y && m) {
			const daysInMonth = new Date(y, m, 0).getDate();
			const today = /* @__PURE__ */ new Date();
			const limitDay = today.getFullYear() === y && today.getMonth() + 1 === m ? today.getDate() : daysInMonth;
			for (let d = 1; d <= limitDay; d++) {
				const dStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
				const dayOfWeek = new Date(y, m - 1, d).getDay();
				if (dayOfWeek !== 0 && dayOfWeek !== 6 && !counted.has(dStr)) {
					if (!(leavesList || []).some((l) => {
						const lEmp = String(l.employeeId?._id || l.employeeId?.employeeId || l.employeeId || "").toUpperCase();
						if (!(empId && lEmp === empId || empObjId && lEmp === empObjId.toUpperCase())) return false;
						if (l.status !== "approved") return false;
						const sStr = typeof l.startDate === "string" ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10);
						const eStr = typeof l.endDate === "string" ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10);
						return dStr >= sStr && dStr <= eStr;
					})) {
						lop += d >= 25 ? 2 : 1;
						counted.add(dStr);
					}
				}
			}
		}
	}
	const late = records.filter((r) => {
		return !(r.occurrence === "half_day_leave_on_time" || r.approvedLeave?.halfDayPeriod === "first_half" && !r.isLate) && (r.isLate || r.status === "late");
	}).length;
	const early = records.filter((r) => {
		return !(r.occurrence === "half_day_leave_checkout" || r.approvedLeave?.halfDayPeriod === "second_half" && !r.isEarlyLogout) && (r.isEarlyLogout || r.status === "early-logout");
	}).length;
	lop += Math.floor((late + early) / 3) * .5;
	return {
		lopDays: lop,
		attendanceDays: records.length,
		lateCount: late
	};
}
function PayrollPage() {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((next) => setStoreState(next));
	}, []);
	const employees = storeState.employees || [];
	const payrollRecords = storeState.payroll || [];
	const companySettings = storeState.companySettings || {};
	const isEmployeeRole = user?.role === "employee" || typeof window !== "undefined" && window.location.hash?.includes("/employee/salary");
	const [activeTab, setActiveTab] = (0, import_react.useState)(isEmployeeRole ? "my_payslips" : "records");
	const [selectedMonth, setSelectedMonth] = (0, import_react.useState)(isEmployeeRole ? "all" : currentPayrollMonth());
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [departmentFilter, setDepartmentFilter] = (0, import_react.useState)("all");
	const [branchFilter, setBranchFilter] = (0, import_react.useState)("all");
	const [previewRecord, setPreviewRecord] = (0, import_react.useState)(null);
	const [showSettingsModal, setShowSettingsModal] = (0, import_react.useState)(false);
	const [showBulkModal, setShowBulkModal] = (0, import_react.useState)(false);
	const [savingNotice, setSavingNotice] = (0, import_react.useState)(null);
	const [actionInProgress, setActionInProgress] = (0, import_react.useState)(false);
	const [editingRecordId, setEditingRecordId] = (0, import_react.useState)(null);
	const [formBankName, setFormBankName] = (0, import_react.useState)("");
	const [formAccountNumber, setFormAccountNumber] = (0, import_react.useState)("");
	const [formIfscCode, setFormIfscCode] = (0, import_react.useState)("");
	const [formPanTaxId, setFormPanTaxId] = (0, import_react.useState)("");
	const [formUanNumber, setFormUanNumber] = (0, import_react.useState)("");
	const [selectedEmpId, setSelectedEmpId] = (0, import_react.useState)("");
	const [formBranch, setFormBranch] = (0, import_react.useState)(() => normalizeBranch(companySettings.defaultBranch));
	const [isCustomBranch, setIsCustomBranch] = (0, import_react.useState)(false);
	const [customBranchInput, setCustomBranchInput] = (0, import_react.useState)("");
	const [userCustomBranches, setUserCustomBranches] = (0, import_react.useState)([]);
	const [formMonth, setFormMonth] = (0, import_react.useState)(currentPayrollMonth());
	const [formStandardDays, setFormStandardDays] = (0, import_react.useState)(30);
	const [formPayableDays, setFormPayableDays] = (0, import_react.useState)(30);
	const [formLopDays, setFormLopDays] = (0, import_react.useState)(0);
	const [formLopReversalDays, setFormLopReversalDays] = (0, import_react.useState)(0);
	const [formArrearDays, setFormArrearDays] = (0, import_react.useState)(0);
	const [formEarnings, setFormEarnings] = (0, import_react.useState)(DEFAULT_EARNINGS);
	const [formDeductions, setFormDeductions] = (0, import_react.useState)(DEFAULT_DEDUCTIONS);
	const filteredRecords = (0, import_react.useMemo)(() => {
		let list = payrollRecords;
		if (isEmployeeRole) list = list.filter((r) => doesPayrollMatchUser(r, user, employees));
		if (selectedMonth && selectedMonth !== "all") list = list.filter((r) => r.month === selectedMonth);
		if (departmentFilter !== "all") list = list.filter((r) => {
			return findEmployeeForUser({
				id: r.employeeId,
				employeeId: r.employeeId,
				name: r.employeeName
			}, employees)?.department === departmentFilter;
		});
		if (branchFilter !== "all") list = list.filter((r) => {
			const emp = findEmployeeForUser({
				id: r.employeeId,
				employeeId: r.employeeId,
				name: r.employeeName
			}, employees);
			return normalizeBranch(r.branch || r.location || emp?.location || emp?.branch || companySettings.defaultBranch) === branchFilter;
		});
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter((r) => {
				const emp = employees.find((e) => String(e._id || e.id) === String(r.employeeId));
				const recBranch = r.branch || r.location || emp?.location || emp?.branch || "";
				return r.month?.toLowerCase().includes(q) || emp?.name?.toLowerCase().includes(q) || emp?.employeeId?.toLowerCase().includes(q) || emp?.department?.toLowerCase().includes(q) || recBranch.toLowerCase().includes(q);
			});
		}
		return list;
	}, [
		payrollRecords,
		isEmployeeRole,
		user,
		selectedMonth,
		departmentFilter,
		branchFilter,
		searchQuery,
		employees
	]);
	const departments = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		employees.forEach((e) => {
			if (e.department) set.add(e.department);
		});
		return Array.from(set).sort();
	}, [employees]);
	const branches = (0, import_react.useMemo)(() => {
		const disallowed = /* @__PURE__ */ new Set([
			"ignite campus",
			"ignite campus (bengaluru)",
			"bengaluru",
			"delhi ncr branch",
			"hyderabad tech hub",
			"mumbai regional office",
			"remote / distributed"
		]);
		const set = /* @__PURE__ */ new Set(["Bengaluru HQ"]);
		if (companySettings?.defaultBranch) {
			const norm = normalizeBranch(companySettings.defaultBranch);
			if (!disallowed.has(norm.toLowerCase())) set.add(norm);
		}
		if (Array.isArray(companySettings?.branches)) companySettings.branches.forEach((b) => {
			if (b && !disallowed.has(String(b).trim().toLowerCase())) set.add(String(b).trim());
		});
		if (Array.isArray(companySettings?.locations)) companySettings.locations.forEach((loc) => {
			const name = typeof loc === "string" ? loc : loc?.name;
			if (name && !disallowed.has(String(name).trim().toLowerCase())) set.add(String(name).trim());
		});
		userCustomBranches.forEach((b) => {
			if (b && !disallowed.has(String(b).trim().toLowerCase())) set.add(String(b).trim());
		});
		return Array.from(set);
	}, [companySettings, userCustomBranches]);
	(0, import_react.useMemo)(() => {
		return getPayrollMonthOptions(payrollRecords);
	}, [payrollRecords]);
	const grossEarnings = (0, import_react.useMemo)(() => {
		return formEarnings.reduce((acc, row) => acc + (Number(row.total) || 0), 0);
	}, [formEarnings]);
	const totalDeductions = (0, import_react.useMemo)(() => {
		return formDeductions.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
	}, [formDeductions]);
	const netPay = Math.max(0, grossEarnings - totalDeductions);
	const netPayInWords = (0, import_react.useMemo)(() => numberToWordsINR(netPay), [netPay]);
	const handleSelectEmployee = (empId) => {
		setSelectedEmpId(empId);
		const emp = employees.find((e) => String(e._id || e.id) === String(empId) || String(e.employeeId) === String(empId));
		if (!emp) return;
		setFormBranch(normalizeBranch(emp.location || emp.branch || companySettings.defaultBranch));
		setFormBankName(emp.bankDetails?.bankName || emp.bankName || "HDFC Bank");
		setFormAccountNumber(emp.bankDetails?.accountNumber || emp.accountNumber || "");
		setFormIfscCode(emp.bankDetails?.ifscCode || emp.ifscCode || "");
		setFormPanTaxId(emp.identity?.panNumber || emp.bankDetails?.panTaxId || emp.panTaxId || "");
		setFormUanNumber(emp.identity?.uanNumber || emp.bankDetails?.uanNumber || emp.uanNumber || "");
		const baseSalary = Number(emp.baseSalary || emp.salary || 3e4);
		const struct = emp.salaryStructure || {};
		const hasStruct = Boolean(struct && (struct.basic !== void 0 || struct.hra !== void 0 || struct.ca !== void 0 || struct.conveyance !== void 0 || struct.sa !== void 0 || struct.specialAllowance !== void 0 || struct.oa !== void 0 || struct.otherAllowance !== void 0));
		const basic = hasStruct && struct.basic !== void 0 ? Math.max(0, Number(struct.basic) || 0) : Math.round(baseSalary * .5);
		const hra = hasStruct && struct.hra !== void 0 ? Math.max(0, Number(struct.hra) || 0) : Math.round(basic * .4);
		const conveyance = hasStruct && (struct.conveyance !== void 0 || struct.ca !== void 0) ? Math.max(0, Number(struct.conveyance ?? struct.ca) || 0) : baseSalary > 8e3 ? 1600 : Math.round(baseSalary * .1);
		const special = hasStruct && (struct.specialAllowance !== void 0 || struct.sa !== void 0) ? Math.max(0, Number(struct.specialAllowance ?? struct.sa) || 0) : Math.max(0, baseSalary - basic - hra - conveyance);
		const other = hasStruct && (struct.otherAllowance !== void 0 || struct.oa !== void 0) ? Math.max(0, Number(struct.otherAllowance ?? struct.oa) || 0) : 0;
		setFormEarnings([
			{
				name: "Basic Salary",
				monthlyRate: basic,
				currentMonth: basic,
				arrear: 0,
				total: basic
			},
			{
				name: "House Rent Allowance",
				monthlyRate: hra,
				currentMonth: hra,
				arrear: 0,
				total: hra
			},
			{
				name: "Conveyance Allowance",
				monthlyRate: conveyance,
				currentMonth: conveyance,
				arrear: 0,
				total: conveyance
			},
			{
				name: "Special Allowance",
				monthlyRate: special,
				currentMonth: special,
				arrear: 0,
				total: special
			},
			{
				name: "Other Allowance",
				monthlyRate: other,
				currentMonth: other,
				arrear: 0,
				total: other
			},
			{
				name: "Bonus",
				monthlyRate: 0,
				currentMonth: 0,
				arrear: 0,
				total: 0
			},
			{
				name: "Overtime",
				monthlyRate: 0,
				currentMonth: 0,
				arrear: 0,
				total: 0
			}
		]);
		const initialDeductions = [
			{
				name: "Provident Fund (P.F.)",
				amount: Math.min(1800, Math.round(basic * .12))
			},
			{
				name: "Professional Tax",
				amount: 200
			},
			{
				name: "ESI",
				amount: 0
			},
			{
				name: "TDS / Income Tax",
				amount: 0
			}
		];
		const localCtx = calculateEmpAttendanceContext(emp, formMonth, storeState.attendance, storeState.leaves);
		const stdDays = Number(formStandardDays) || 30;
		const localLopDays = Number(localCtx.lopDays) || 0;
		setFormLopDays(localLopDays);
		setFormPayableDays(Math.max(0, stdDays - localLopDays));
		if (localLopDays > 0) {
			const lopDeduction = Math.round(baseSalary / stdDays * localLopDays);
			initialDeductions.push({
				name: "Loss of Pay (LOP)",
				amount: lopDeduction
			});
		}
		setFormDeductions(initialDeductions);
		const empCode = emp.employeeId || emp.code || "";
		const empObjId = emp._id || emp.id || "";
		apiClient.get("/payroll/context", { params: {
			employeeId: empCode,
			id: empObjId,
			month: formMonth
		} }).then((res) => {
			const ctx = res.data?.data;
			if (ctx) {
				const liveLopDays = Number(ctx.lopDays ?? localLopDays);
				setFormLopDays(liveLopDays);
				setFormPayableDays(Math.max(0, stdDays - liveLopDays));
				if (liveLopDays > 0) {
					const lopDeduction = Math.round(baseSalary / stdDays * liveLopDays);
					setFormDeductions((prev) => {
						return [...prev.filter((d) => !d.name.toLowerCase().includes("loss of pay") && !d.name.toLowerCase().includes("lop")), {
							name: "Loss of Pay (LOP)",
							amount: lopDeduction
						}];
					});
				} else setFormDeductions((prev) => prev.filter((d) => !d.name.toLowerCase().includes("loss of pay") && !d.name.toLowerCase().includes("lop")));
			}
		}).catch(() => {});
	};
	const handleEditRecord = (record) => {
		setEditingRecordId(record._id || record.id);
		const emp = employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId) === String(record.employeeId));
		setSelectedEmpId(emp?._id || emp?.id || record.employeeId);
		setFormBranch(normalizeBranch(record.branch || record.location || emp?.location || emp?.branch || companySettings.defaultBranch));
		setFormBankName(record.bankName || emp?.bankDetails?.bankName || emp?.bankName || "HDFC Bank");
		setFormAccountNumber(record.accountNumber || emp?.bankDetails?.accountNumber || emp?.accountNumber || "");
		setFormIfscCode(record.ifscCode || emp?.bankDetails?.ifscCode || emp?.ifscCode || "");
		setFormPanTaxId(record.panTaxId || emp?.identity?.panNumber || emp?.bankDetails?.panTaxId || emp?.panTaxId || "");
		setFormUanNumber(record.uanNumber || emp?.identity?.uanNumber || emp?.bankDetails?.uanNumber || emp?.uanNumber || "");
		setFormMonth(record.month || currentPayrollMonth());
		setFormStandardDays(record.standardDays ?? 30);
		setFormPayableDays(record.payableDays ?? record.paidDays ?? 30);
		setFormLopDays(record.lopDays ?? 0);
		setFormLopReversalDays(record.lopReversalDays ?? 0);
		setFormArrearDays(record.arrearDays ?? 0);
		if (Array.isArray(record.earningsList) && record.earningsList.length > 0) setFormEarnings(record.earningsList);
		else if (record.earnings) {
			const e = record.earnings;
			setFormEarnings([
				{
					name: "Basic Salary",
					monthlyRate: e.basic || 0,
					currentMonth: e.basic || 0,
					arrear: 0,
					total: e.basic || 0
				},
				{
					name: "House Rent Allowance",
					monthlyRate: e.hra || 0,
					currentMonth: e.hra || 0,
					arrear: 0,
					total: e.hra || 0
				},
				{
					name: "Special Allowance",
					monthlyRate: e.specialAllowance || 0,
					currentMonth: e.specialAllowance || 0,
					arrear: 0,
					total: e.specialAllowance || 0
				},
				{
					name: "Other Allowance",
					monthlyRate: e.otherAllowances || 0,
					currentMonth: e.otherAllowances || 0,
					arrear: 0,
					total: e.otherAllowances || 0
				}
			]);
		}
		if (Array.isArray(record.deductionsList) && record.deductionsList.length > 0) setFormDeductions(record.deductionsList);
		else if (record.deductions) {
			const d = record.deductions;
			setFormDeductions([
				{
					name: "Provident Fund (P.F.)",
					amount: d.pf || 0
				},
				{
					name: "Professional Tax",
					amount: d.professionalTax || 0
				},
				{
					name: "TDS / Income Tax",
					amount: d.tdsTax || 0
				},
				{
					name: "ESI",
					amount: d.esi || 0
				}
			]);
		}
		setActiveTab("generate");
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const updateEarningRow = (index, field, value) => {
		setFormEarnings((prev) => {
			const next = [...prev];
			const row = {
				...next[index],
				[field]: value
			};
			if (field === "monthlyRate" || field === "currentMonth" || field === "arrear") row.total = (Number(field === "currentMonth" ? value : row.currentMonth) || 0) + (Number(field === "arrear" ? value : row.arrear) || 0);
			next[index] = row;
			return next;
		});
	};
	const addEarningRow = () => {
		setFormEarnings((prev) => [...prev, {
			name: "Other Allowance",
			monthlyRate: 0,
			currentMonth: 0,
			arrear: 0,
			total: 0
		}]);
	};
	const removeEarningRow = (index) => {
		setFormEarnings((prev) => prev.filter((_, i) => i !== index));
	};
	const updateDeductionRow = (index, field, value) => {
		setFormDeductions((prev) => {
			const next = [...prev];
			next[index] = {
				...next[index],
				[field]: value
			};
			return next;
		});
	};
	const addDeductionRow = () => {
		setFormDeductions((prev) => [...prev, {
			name: "Other Deduction",
			amount: 0
		}]);
	};
	const removeDeductionRow = (index) => {
		setFormDeductions((prev) => prev.filter((_, i) => i !== index));
	};
	const handleSavePayslip = async () => {
		if (!selectedEmpId) {
			alert("Please select an employee.");
			return;
		}
		const emp = employees.find((e) => String(e._id || e.id) === String(selectedEmpId) || String(e.employeeId) === String(selectedEmpId));
		const payload = {
			...editingRecordId ? {
				id: editingRecordId,
				_id: editingRecordId
			} : {},
			employeeId: emp?.employeeId || emp?.id || selectedEmpId,
			employeeRef: emp?._id || emp?.id || selectedEmpId,
			employeeName: emp?.name || "Employee",
			designation: emp?.designation || "",
			department: emp?.department || "",
			location: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
			branch: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
			bankName: formBankName,
			accountNumber: formAccountNumber,
			ifscCode: formIfscCode,
			panTaxId: formPanTaxId,
			uanNumber: formUanNumber,
			month: formMonth,
			standardDays: Number(formStandardDays) || 30,
			payableDays: Number(formPayableDays) || 30,
			lopDays: Number(formLopDays) || 0,
			lopReversalDays: Number(formLopReversalDays) || 0,
			arrearDays: Number(formArrearDays) || 0,
			earningsList: formEarnings.map((e) => ({
				name: e.name,
				monthlyRate: Number(e.monthlyRate) || 0,
				currentMonth: Number(e.currentMonth) || 0,
				arrear: Number(e.arrear) || 0,
				total: Number(e.total) || 0
			})),
			deductionsList: formDeductions.map((d) => ({
				name: d.name,
				amount: Number(d.amount) || 0
			})),
			grossEarnings,
			totalDeductions,
			netPay,
			netPayInWords,
			status: "processed"
		};
		try {
			setActionInProgress(true);
			await hrStore.savePayrollRecord(payload);
			setSavingNotice(editingRecordId ? "Payslip successfully updated." : "Payslip successfully generated and saved.");
			setEditingRecordId(null);
			setTimeout(() => setSavingNotice(null), 4e3);
			setActiveTab("records");
		} catch (err) {
			alert(err.message || "Failed to save payslip.");
		} finally {
			setActionInProgress(false);
		}
	};
	const handleDeleteRecord = async (record) => {
		const id = record._id || record.id;
		const name = record.employeeName || "this employee";
		if (!confirm(`Are you sure you want to delete the payslip for ${name} (${record.month})?`)) return;
		try {
			setActionInProgress(true);
			await hrStore.deletePayrollRecord(id);
			setSavingNotice(`Payslip for ${name} deleted successfully.`);
			setTimeout(() => setSavingNotice(null), 4e3);
		} catch (err) {
			alert(err.message || "Failed to delete payslip.");
		} finally {
			setActionInProgress(false);
		}
	};
	const handleFinalizeMonth = async (resendAll = false) => {
		const targetMonth = selectedMonth !== "all" ? selectedMonth : currentPayrollMonth();
		const confirmMsg = resendAll ? `Re-email official payslips (with PDF attachments) to all employees for ${targetMonth}?` : `Finalize and disburse payslips for ${targetMonth}? Once finalized, all employees will receive their official payslip with PDF attachment directly via email and see it in their ESS portal.`;
		if (!confirm(confirmMsg)) return;
		try {
			setActionInProgress(true);
			const res = await hrStore.executePayrollRun(targetMonth, { resendAll });
			setSavingNotice(res?.data?.message || res?.message || `Payslips for ${targetMonth} finalized and emailed to all employees.`);
			setTimeout(() => setSavingNotice(null), 5e3);
		} catch (err) {
			alert(err.message || "Failed to finalize monthly payroll.");
		} finally {
			setActionInProgress(false);
		}
	};
	const handleBulkEmailMonth = async () => {
		const targetMonth = selectedMonth !== "all" ? selectedMonth : currentPayrollMonth();
		if (!confirm(`Email official payslips (with PDF attachments) directly to all employees for ${targetMonth}?`)) return;
		try {
			setActionInProgress(true);
			const res = await (hrStore.sendBulkEmail ? hrStore.sendBulkEmail(targetMonth, { forceAll: true }) : hrStore.executePayrollRun(targetMonth, { resendAll: true }));
			setSavingNotice(res?.data?.message || res?.message || `Official payslips for ${targetMonth} emailed successfully.`);
			setTimeout(() => setSavingNotice(null), 5e3);
		} catch (err) {
			alert(err.message || "Failed to dispatch payslip emails.");
		} finally {
			setActionInProgress(false);
		}
	};
	const handlePreviewCurrentForm = () => {
		if (!selectedEmpId) {
			alert("Please select an employee first.");
			return;
		}
		const emp = employees.find((e) => String(e._id || e.id) === String(selectedEmpId));
		const syntheticRecord = {
			_id: editingRecordId || "draft",
			employeeId: selectedEmpId,
			employeeName: emp?.name || "Employee",
			designation: emp?.designation || "",
			department: emp?.department || "",
			location: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
			branch: normalizeBranch(formBranch || emp?.location || emp?.branch || companySettings.defaultBranch),
			bankName: formBankName,
			accountNumber: formAccountNumber,
			ifscCode: formIfscCode,
			panTaxId: formPanTaxId,
			uanNumber: formUanNumber,
			month: formMonth,
			standardDays: Number(formStandardDays) || 30,
			payableDays: Number(formPayableDays) || 30,
			lopDays: Number(formLopDays) || 0,
			lopReversalDays: Number(formLopReversalDays) || 0,
			arrearDays: Number(formArrearDays) || 0,
			earningsList: formEarnings,
			deductionsList: formDeductions,
			grossEarnings,
			totalDeductions,
			netPay,
			netPayInWords,
			status: "Draft"
		};
		setPreviewRecord({
			record: syntheticRecord,
			employee: emp
		});
	};
	const handlePreviewRecord = (record) => {
		const emp = findEmployeeForUser({
			id: record.employeeId,
			employeeId: record.employeeId,
			name: record.employeeName
		}, employees) || employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId || "").toUpperCase() === String(record.employeeId || "").toUpperCase() || String(e._id || e.id) === String(record.employeeRef)) || employees.find((e) => e.name === record.employeeName) || user;
		setPreviewRecord({
			record,
			employee: emp
		});
	};
	const handleEmailPayslip = async (record) => {
		if (!confirm("Send payslip via email to the employee?")) return;
		try {
			setActionInProgress(true);
			await hrStore.emailPayslip(record._id || record.id);
			alert("Payslip email sent successfully.");
		} catch (err) {
			alert(err.message || "Failed to send email.");
		} finally {
			setActionInProgress(false);
		}
	};
	const handleDownloadPDF = async (record) => {
		const emp = findEmployeeForUser({
			id: record.employeeId,
			employeeId: record.employeeId,
			name: record.employeeName
		}, employees) || employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId || "").toUpperCase() === String(record.employeeId || "").toUpperCase() || String(e._id || e.id) === String(record.employeeRef)) || {};
		try {
			setActionInProgress(true);
			await downloadPayslipDocument(record, emp, companySettings);
		} catch (err) {
			console.error("Download failed, opening preview:", err);
			handlePreviewRecord(record);
		} finally {
			setActionInProgress(false);
		}
	};
	const handlePrintRecord = (record) => {
		const emp = findEmployeeForUser({
			id: record.employeeId,
			employeeId: record.employeeId,
			name: record.employeeName
		}, employees) || employees.find((e) => String(e._id || e.id) === String(record.employeeId) || String(e.employeeId || "").toUpperCase() === String(record.employeeId || "").toUpperCase() || String(e._id || e.id) === String(record.employeeRef)) || {};
		printPayslipDocument(record, emp, companySettings);
	};
	const totalDisbursed = (0, import_react.useMemo)(() => {
		return filteredRecords.reduce((acc, r) => acc + (Number(r.netPay) || Number(r.netSalary) || 0), 0);
	}, [filteredRecords]);
	const totalGross = (0, import_react.useMemo)(() => {
		return filteredRecords.reduce((acc, r) => acc + (Number(r.grossEarnings) || Number(r.grossSalary) || 0), 0);
	}, [filteredRecords]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "payroll-workspace",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: isEmployeeRole ? "Employee Self Service" : "Financial Operations",
				title: isEmployeeRole ? "My Payslips & Compensation" : "Enterprise Payroll & Payslip Generator",
				description: isEmployeeRole ? "Access and download verified monthly corporate salary slips and tax statements" : "Generate, manage, preview and disburse professional A4 corporate payslips",
				children: !isEmployeeRole && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "8px",
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShowSettingsModal(true),
							className: "ui-button secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 14 }), "Company Branding"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setShowBulkModal(true),
							className: "ui-button secondary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 14 }), "Bulk Generate"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setEditingRecordId(null);
								setActiveTab("generate");
							},
							className: "ui-button primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), "Create Payslip"]
						})
					]
				})
			}),
			savingNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#eaf4f1",
					border: "1px solid #c7ded7",
					color: "#1d8a7a",
					padding: "12px 18px",
					borderRadius: "9px",
					display: "flex",
					alignItems: "center",
					gap: "10px",
					fontSize: "12px",
					fontWeight: "600"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: savingNotice })]
			}),
			!isEmployeeRole && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "metric-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#eaf4f1",
								color: "var(--teal)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Net Disbursed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["₹", formatINR(totalDisbursed)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "For selected filter" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#e8eff8",
								color: "var(--blue)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gross Payroll" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["₹", formatINR(totalGross)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Before statutory deductions" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#eaf4f1",
								color: "#16a34a"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Payslips Generated" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: filteredRecords.length }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Records in registry" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#f9f0da",
								color: "var(--gold)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Employees" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employees.filter((e) => e.status !== "inactive").length }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Eligible for payroll" })
							]
						})]
					})
				]
			}),
			!isEmployeeRole && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "payroll-tabs-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActiveTab("records"),
					className: "payroll-tab-btn" + (activeTab === "records" ? " active" : ""),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 14 }),
						"Payslips Registry (",
						payrollRecords.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setActiveTab("generate"),
					className: "payroll-tab-btn" + (activeTab === "generate" ? " active" : ""),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), editingRecordId ? "Edit / Adjust Payslip" : "Create / Adjust Payslip"]
				})]
			}),
			!isEmployeeRole && activeTab === "generate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { padding: "24px" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "20px",
							paddingBottom: "16px",
							borderBottom: "1px solid var(--line)",
							flexWrap: "wrap",
							gap: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								margin: 0,
								fontSize: "18px",
								fontWeight: 700,
								fontFamily: "Space Grotesk, sans-serif"
							},
							children: editingRecordId ? "Update Employee Payslip" : "Generate Corporate Payslip"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: "4px 0 0",
								fontSize: "12px",
								color: "var(--muted)"
							},
							children: "Customize earnings, statutory deductions and attendance parameters before generating the official document"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handlePreviewCurrentForm,
								className: "ui-button secondary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 13 }), "Preview Payslip"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleSavePayslip,
								disabled: actionInProgress,
								className: "ui-button primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }), actionInProgress ? "Saving..." : editingRecordId ? "Save Changes" : "Generate & Save"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "payroll-form-grid",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-form-field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Select Employee *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: selectedEmpId,
									onChange: (e) => handleSelectEmployee(e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "-- Select Employee --"
									}), employees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: emp._id || emp.id,
										children: [
											emp.employeeId || emp.code || "EMP",
											" - ",
											emp.name,
											" (",
											emp.designation || "Pending Designation",
											")"
										]
									}, emp._id || emp.id))]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "payroll-form-field",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayrollMonthPicker, {
									label: "Payroll Month *",
									value: formMonth,
									onChange: (newMonth) => {
										setFormMonth(newMonth);
										const d = getDaysInMonth(newMonth);
										setFormStandardDays(d);
										setFormPayableDays(Math.max(0, d - formLopDays + formLopReversalDays + formArrearDays));
										if (selectedEmpId) {
											const emp = employees.find((e) => String(e._id || e.id) === String(selectedEmpId) || String(e.employeeId) === String(selectedEmpId));
											if (emp) {
												const localCtx = calculateEmpAttendanceContext(emp, newMonth, storeState.attendance, storeState.leaves);
												const localLop = Number(localCtx.lopDays) || 0;
												setFormLopDays(localLop);
												setFormPayableDays(Math.max(0, d - localLop));
												const baseSal = Number(emp.baseSalary || emp.salary || 3e4);
												const localLopDed = localLop > 0 ? Math.round(baseSal / d * localLop) : 0;
												setFormDeductions((prev) => {
													const baseList = prev.filter((item) => !item.name.toLowerCase().includes("loss of pay") && !item.name.toLowerCase().includes("lop"));
													return localLopDed > 0 ? [...baseList, {
														name: "Loss of Pay (LOP)",
														amount: localLopDed
													}] : baseList;
												});
												const empCode = emp.employeeId || emp.code || "";
												const empObjId = emp._id || emp.id || "";
												apiClient.get("/payroll/context", { params: {
													employeeId: empCode,
													id: empObjId,
													month: newMonth
												} }).then((res) => {
													const ctx = res.data?.data;
													if (ctx) {
														const liveLopDays = Number(ctx.lopDays ?? localLop);
														setFormLopDays(liveLopDays);
														setFormPayableDays(Math.max(0, d - liveLopDays));
														const lopDed = liveLopDays > 0 ? Math.round(baseSal / d * liveLopDays) : 0;
														setFormDeductions((prev) => {
															const baseList = prev.filter((item) => !item.name.toLowerCase().includes("loss of pay") && !item.name.toLowerCase().includes("lop"));
															return lopDed > 0 ? [...baseList, {
																name: "Loss of Pay (LOP)",
																amount: lopDed
															}] : baseList;
														});
													}
												}).catch(() => {});
											}
										}
									},
									existingRecords: payrollRecords,
									showPresets: true,
									showSteppers: true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-form-field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Office Branch & Location *" }), !isCustomBranch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "grid",
										gap: "6px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: branches.includes(formBranch) ? formBranch : "__custom__",
										onChange: (e) => {
											if (e.target.value === "__custom__") {
												setIsCustomBranch(true);
												setCustomBranchInput("");
											} else setFormBranch(e.target.value);
										},
										children: [branches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: b,
											children: b
										}, b)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "__custom__",
											children: "+ Custom Branch..."
										})]
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "6px",
											alignItems: "center"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "Enter new custom branch name...",
												value: customBranchInput,
												onChange: (e) => setCustomBranchInput(e.target.value),
												autoFocus: true,
												style: { flex: 1 },
												onKeyDown: (e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														const trimmed = customBranchInput.trim();
														if (trimmed) {
															setUserCustomBranches((prev) => Array.from(/* @__PURE__ */ new Set([...prev, trimmed])));
															setFormBranch(trimmed);
															setIsCustomBranch(false);
															setCustomBranchInput("");
														}
													}
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button primary",
												style: {
													fontSize: "11px",
													padding: "6px 12px",
													whiteSpace: "nowrap"
												},
												onClick: () => {
													const trimmed = customBranchInput.trim();
													if (trimmed) {
														setUserCustomBranches((prev) => Array.from(/* @__PURE__ */ new Set([...prev, trimmed])));
														setFormBranch(trimmed);
														setIsCustomBranch(false);
														setCustomBranchInput("");
													}
												},
												disabled: !customBranchInput.trim(),
												children: "Add"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button secondary",
												style: {
													fontSize: "11px",
													padding: "6px 10px",
													whiteSpace: "nowrap"
												},
												onClick: () => {
													setIsCustomBranch(false);
													setFormBranch(branches[0] || "Bengaluru HQ");
													setCustomBranchInput("");
												},
												children: "Cancel"
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "11px",
											color: "#64748b"
										},
										children: [
											"Type your custom branch name and click ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Add" }),
											" to use it."
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-form-field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Company Profile" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										minHeight: "38px",
										padding: "0 12px",
										background: "#f8fafc",
										border: "1px solid var(--line)",
										borderRadius: "8px",
										fontSize: "12px",
										color: "var(--ink)",
										display: "flex",
										alignItems: "center",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingComplex, {
										size: 14,
										style: { color: "var(--teal)" }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { fontWeight: 600 },
										children: companySettings.companyName || "Default Company"
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "attendance-parameters-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 14 }), "Attendance & Payable Days Parameters"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "attendance-inputs-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Standard Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: formStandardDays,
									onChange: (e) => setFormStandardDays(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Payable Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: formPayableDays,
									onChange: (e) => setFormPayableDays(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Loss of Pay (LOP)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: formLopDays,
									onChange: (e) => setFormLopDays(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "LOP Reversal Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: formLopReversalDays,
									onChange: (e) => setFormLopReversalDays(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Arrear Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: formArrearDays,
									onChange: (e) => setFormArrearDays(e.target.value)
								})] })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "payroll-two-col-grid",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "payroll-table-box",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payroll-table-box-header",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Earnings Components" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: addEarningRow,
										className: "ui-button secondary",
										style: {
											minHeight: "28px",
											padding: "0 10px",
											fontSize: "11px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 12 }), " Add Component"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "payroll-components-wrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-components-list",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-component-header",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Component" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: { textAlign: "right" },
													children: "Rate"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: { textAlign: "right" },
													children: "Current"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: { textAlign: "right" },
													children: "Arrear"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: { textAlign: "right" },
													children: "Total"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
											]
										}), formEarnings.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-component-row",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													value: row.name,
													onChange: (e) => updateEarningRow(idx, "name", e.target.value),
													placeholder: "Component name"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													style: { textAlign: "right" },
													value: row.monthlyRate,
													onChange: (e) => updateEarningRow(idx, "monthlyRate", e.target.value),
													placeholder: "0"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													style: { textAlign: "right" },
													value: row.currentMonth,
													onChange: (e) => updateEarningRow(idx, "currentMonth", e.target.value),
													placeholder: "0"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													style: { textAlign: "right" },
													value: row.arrear,
													onChange: (e) => updateEarningRow(idx, "arrear", e.target.value),
													placeholder: "0"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														textAlign: "right",
														fontWeight: 700,
														fontSize: "11px",
														color: "var(--ink)",
														whiteSpace: "nowrap"
													},
													children: ["₹", formatINR(row.total)]
												}),
												formEarnings.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => removeEarningRow(idx),
													className: "payroll-icon-btn danger",
													style: {
														width: "26px",
														height: "26px",
														flexShrink: 0
													},
													title: "Delete Row",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 })
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "26px" } })
											]
										}, idx))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payroll-total-footer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "#586D72",
											textTransform: "uppercase",
											fontSize: "11px"
										},
										children: "Gross Earnings"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "14px",
											color: "var(--ink)",
											fontFamily: "Space Grotesk, sans-serif"
										},
										children: ["₹", formatINR(grossEarnings)]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "payroll-table-box",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payroll-table-box-header",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Deductions Components" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: addDeductionRow,
										className: "ui-button secondary",
										style: {
											minHeight: "28px",
											padding: "0 10px",
											fontSize: "11px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 12 }), " Add Component"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "payroll-components-wrap",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-components-list deductions-list",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-component-header deduction",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Component" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: { textAlign: "right" },
													children: "Amount"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
											]
										}), formDeductions.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-component-row deduction",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													value: row.name,
													onChange: (e) => updateDeductionRow(idx, "name", e.target.value),
													placeholder: "Deduction name"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													style: { textAlign: "right" },
													value: row.amount,
													onChange: (e) => updateDeductionRow(idx, "amount", e.target.value),
													placeholder: "0"
												}),
												formDeductions.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => removeDeductionRow(idx),
													className: "payroll-icon-btn danger",
													style: {
														width: "26px",
														height: "26px",
														flexShrink: 0
													},
													title: "Delete Row",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 })
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "26px" } })
											]
										}, idx))]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payroll-total-footer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "#586D72",
											textTransform: "uppercase",
											fontSize: "11px"
										},
										children: "Total Deductions"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "14px",
											color: "#DC2E3F",
											fontFamily: "Space Grotesk, sans-serif"
										},
										children: ["₹", formatINR(totalDeductions)]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "payroll-net-banner",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "net-kicker",
								children: "Net Payable Salary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "net-amount",
								children: ["₹", formatINR(netPay)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "net-words",
								children: [
									"(",
									netPayInWords,
									" ONLY)"
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "payroll-net-banner-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handlePreviewCurrentForm,
								className: "ui-button secondary",
								style: {
									background: "rgba(255,255,255,0.15)",
									color: "#ffffff",
									borderColor: "rgba(255,255,255,0.3)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 14 }), " Preview A4 Payslip"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleSavePayslip,
								disabled: actionInProgress,
								className: "ui-button primary",
								style: {
									background: "#7ef0c8",
									color: "#0b3155",
									fontWeight: 700
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 14 }), " Save Record"]
							})]
						})]
					})
				]
			}),
			(isEmployeeRole || activeTab === "records") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: {
					padding: "0",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payroll-filter-toolbar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "payroll-filter-group",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-search-input",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									size: 14,
									style: { color: "#94a3b8" }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: searchQuery,
									onChange: (e) => setSearchQuery(e.target.value),
									placeholder: "Search employee or month..."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayrollMonthPicker, {
								value: selectedMonth,
								onChange: (m) => setSelectedMonth(m),
								allowAll: true,
								allLabel: "All Months",
								existingRecords: payrollRecords,
								showPresets: false,
								showSteppers: true
							}),
							!isEmployeeRole && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: departmentFilter,
								onChange: (e) => setDepartmentFilter(e.target.value),
								className: "payroll-select",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Departments"
								}), departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: d,
									children: d
								}, d))]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: branchFilter,
								onChange: (e) => setBranchFilter(e.target.value),
								className: "payroll-select",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Branches"
								}), branches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: b,
									children: b
								}, b))]
							})] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							flexWrap: "wrap"
						},
						children: [!isEmployeeRole && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => handleFinalizeMonth(false),
							disabled: actionInProgress,
							className: "ui-button primary",
							style: {
								minHeight: "32px",
								padding: "0 12px",
								fontSize: "11px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px"
							},
							title: "Finalize drafts, disburse and email official payslip PDFs directly to all employees",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }),
								"Finalize & Email ",
								selectedMonth !== "all" ? selectedMonth : "Current",
								" Payslips"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleBulkEmailMonth,
							disabled: actionInProgress,
							className: "ui-button secondary",
							style: {
								minHeight: "32px",
								padding: "0 12px",
								fontSize: "11px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px"
							},
							title: "Directly email or re-send payslips with PDF attachments to all employees for this month",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 13 }), "Email All Payslips"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "11px",
								fontWeight: 600,
								color: "var(--muted)"
							},
							children: [
								"Showing ",
								filteredRecords.length,
								" payslip",
								filteredRecords.length === 1 ? "" : "s"
							]
						})]
					})]
				}), filteredRecords.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "48px 20px",
						textAlign: "center"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: "44px",
								height: "44px",
								borderRadius: "50%",
								background: "#f1f5f9",
								color: "#94a3b8",
								display: "grid",
								placeItems: "center",
								margin: "0 auto 12px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 20 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							style: {
								fontSize: "15px",
								fontWeight: 700,
								margin: "0 0 6px",
								color: "var(--ink)"
							},
							children: ["No payslips found ", selectedMonth !== "all" ? `for ${selectedMonth}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								fontSize: "12px",
								color: "var(--muted)",
								maxWidth: "440px",
								margin: "0 auto"
							},
							children: isEmployeeRole ? `No payslips have been generated for your profile ${selectedMonth !== "all" ? `for ${selectedMonth}` : "yet"}.` : `No payslip records match ${selectedMonth !== "all" ? `"${selectedMonth}"` : "the selected filters"}. You can create or bulk generate for this period.`
						}),
						!isEmployeeRole && selectedMonth !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "8px",
								justifyContent: "center",
								marginTop: "16px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setFormMonth(selectedMonth);
									const d = getDaysInMonth(selectedMonth);
									setFormStandardDays(d);
									setFormPayableDays(d);
									setActiveTab("generate");
								},
								className: "ui-button primary",
								style: { fontSize: "12px" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }),
									"Create Payslip for ",
									selectedMonth
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setShowBulkModal(true),
								className: "ui-button secondary",
								style: { fontSize: "12px" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 13 }),
									"Bulk Generate for ",
									selectedMonth
								]
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ui-table-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { width: "28%" },
								children: "Employee"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { width: "16%" },
								children: "Month"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									width: "14%",
									textAlign: "right"
								},
								children: "Gross"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									width: "14%",
									textAlign: "right"
								},
								children: "Deductions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									width: "14%",
									textAlign: "right"
								},
								children: "Net Pay"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									width: "10%",
									textAlign: "center"
								},
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									width: "14%",
									textAlign: "right"
								},
								children: "Actions"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredRecords.map((r) => {
							const emp = findEmployeeForUser({
								id: r.employeeId,
								employeeId: r.employeeId,
								name: r.employeeName
							}, employees) || employees.find((e) => String(e._id || e.id) === String(r.employeeId) || String(e.employeeId || "").toUpperCase() === String(r.employeeId || "").toUpperCase() || String(e._id || e.id) === String(r.employeeRef)) || {};
							const gross = Number(r.grossEarnings || r.grossSalary || 0);
							const deductions = Number(r.totalDeductions || r.totalDeduction || 0);
							const net = Number(r.netPay || r.netSalary || 0);
							const visibleAccount = unmaskBankAccount(r.accountNumber || emp.bankDetails?.accountNumber || emp.accountNumber, "50100488577650");
							const isDraft = String(r.status || "").toLowerCase() === "draft";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontWeight: 600,
											fontSize: "13.5px",
											color: "var(--ink)"
										},
										children: emp?.name || r.employeeName || "Employee"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11.5px",
											color: "var(--muted)",
											marginTop: "2px"
										},
										children: [
											emp?.employeeId || r.employeeId || "EMP",
											" • ",
											emp?.department || r.department || "General"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11px",
											color: "#006E6F",
											fontWeight: 600,
											marginTop: "2px"
										},
										children: ["📍 ", normalizeBranch(r.branch || r.location || emp?.location || emp?.branch || companySettings.defaultBranch)]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11px",
											color: "var(--teal)",
											fontWeight: 600,
											marginTop: "2px"
										},
										children: ["A/C: ", visibleAccount]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										fontWeight: 600,
										fontSize: "13px",
										color: "var(--ink)"
									},
									children: r.month
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: {
										textAlign: "right",
										fontWeight: 500,
										fontSize: "13.5px",
										color: "var(--muted)"
									},
									children: ["₹", formatINR(gross)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: {
										textAlign: "right",
										fontWeight: 500,
										fontSize: "13.5px",
										color: "#e11d48"
									},
									children: ["-₹", formatINR(deductions)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: {
										textAlign: "right",
										fontWeight: 700,
										fontSize: "13.5px",
										color: "var(--ink)"
									},
									children: ["₹", formatINR(net)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: { textAlign: "center" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: isDraft ? "gold" : "teal",
										children: isDraft ? "Draft" : "Disbursed"
									}), r.emailSentAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "10px",
											color: "#16a34a",
											fontWeight: 600,
											marginTop: "3px",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "3px"
										},
										title: `Emailed on ${new Date(r.emailSentAt).toLocaleString("en-IN")}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✉" }), " Emailed"]
									}) : !isDraft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "10px",
											color: "#94a3b8",
											marginTop: "3px"
										},
										children: "Not Emailed"
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: { textAlign: "right" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-action-icons",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => handlePreviewRecord(r),
												title: "Preview A4 Payslip",
												className: "payroll-icon-btn primary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 13 })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => handleDownloadPDF(r),
												title: "Download PDF",
												className: "payroll-icon-btn",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 13 })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => handlePrintRecord(r),
												title: "Print Payslip",
												className: "payroll-icon-btn",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { size: 13 })
											}),
											!isEmployeeRole && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleEmailPayslip(r),
													title: "Email Payslip to Employee",
													className: "payroll-icon-btn",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 13 })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleEditRecord(r),
													title: "Edit / Adjust",
													className: "payroll-icon-btn",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { size: 13 })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleDeleteRecord(r),
													title: "Delete Payslip",
													className: "payroll-icon-btn danger",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 })
												})
											] })
										]
									})
								})
							] }, r._id || r.id);
						}) })]
					})
				})]
			}),
			previewRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayslipPreviewModal, {
				record: previewRecord.record,
				employee: previewRecord.employee,
				settings: companySettings,
				onClose: () => setPreviewRecord(null),
				canEmail: !isEmployeeRole
			}),
			showSettingsModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanySettingsModal, {
				settings: companySettings,
				onSave: async (newSettings) => {
					await hrStore.updateCompanySettings(newSettings);
					setShowSettingsModal(false);
				},
				onClose: () => setShowSettingsModal(false)
			}),
			showBulkModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BulkGenerateModal, {
				employees,
				onGenerate: async (payload) => {
					const res = await hrStore.bulkGeneratePayroll(payload);
					setShowBulkModal(false);
					setSavingNotice(res?.message || "Bulk payslip generation completed successfully.");
					setTimeout(() => setSavingNotice(null), 4500);
					setActiveTab("records");
					return res;
				},
				onClose: () => setShowBulkModal(false)
			})
		]
	});
}
export { PayrollPage };
