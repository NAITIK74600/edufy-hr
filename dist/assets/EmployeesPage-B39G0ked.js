import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { A as ShieldCheck, Bt as Clock, Dt as FileText, G as Power, K as Plus, L as Search, Pt as ExternalLink, Rt as Copy, V as RefreshCw, Wt as CircleCheck, X as PenLine, Xt as Check, _ as TriangleAlert, _n as require_react, d as Users, h as UserCheck, hn as ArrowLeft, kt as FileCheck, m as UserPlus, nn as Calculator, ot as Mail, p as UserX, rn as Cake, y as Trash } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { A as copyTextToClipboard, C as INITIAL_ROLES, D as storeAction, I as apiClient, M as generateAutoPassword, N as generateNextEmployeeCode, T as hrStore, a as Field, b as hasPermission, c as StatusBadge, h as getRoleBadgeLabel, i as EmptyState, j as formatCredentialsShareText, n as ConfirmationDialog, o as PageHeader, r as DataTable, s as StatePanel, t as Button, w as getRecommendedRoleConfig, x as useAuth } from "./index-DmErKaMp.js";
import { n as formatINR } from "./currency-oCUzM0NR.js";
import { t as OnboardingDossierView } from "./OnboardingDossierView-BIpVkiT1.js";
import { t as EmployeeComplianceStatusCard } from "./EmployeeComplianceStatusCard-BYmLeJVn.js";
// src/utils/salaryCalculator.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Standard Salary Structure Calculator & Synchronizer
* Handles Basic Pay, HRA, CA (Conveyance), SA (Special Allowance), OA (Other Allowance)
*/
function calculateComponentsFromCTC(annualCTC) {
	const annual = Math.max(0, Number(annualCTC) || 0);
	const monthlyGross = Math.round(annual / 12);
	if (monthlyGross === 0) return {
		basic: 0,
		hra: 0,
		ca: 0,
		conveyance: 0,
		sa: 0,
		specialAllowance: 0,
		oa: 0,
		otherAllowance: 0,
		monthlyGross: 0,
		annualCTC: 0
	};
	const basic = Math.round(monthlyGross * .5);
	const hra = Math.round(basic * .4);
	const conveyance = monthlyGross > 8e3 ? 1600 : Math.round(monthlyGross * .1);
	const specialAllowance = Math.round(monthlyGross * .15);
	const otherAllowance = Math.max(0, monthlyGross - basic - hra - conveyance - specialAllowance);
	return {
		basic,
		hra,
		ca: conveyance,
		conveyance,
		sa: specialAllowance,
		specialAllowance,
		oa: otherAllowance,
		otherAllowance,
		monthlyGross,
		annualCTC: monthlyGross * 12
	};
}
function calculateCTCFromComponents(structure = {}) {
	const basic = Math.max(0, Number(structure.basic) || 0);
	const hra = Math.max(0, Number(structure.hra) || 0);
	const conveyance = Math.max(0, Number(structure.conveyance ?? structure.ca) || 0);
	const specialAllowance = Math.max(0, Number(structure.specialAllowance ?? structure.sa) || 0);
	const otherAllowance = Math.max(0, Number(structure.otherAllowance ?? structure.oa) || 0);
	const monthlyGross = basic + hra + conveyance + specialAllowance + otherAllowance;
	return {
		basic,
		hra,
		ca: conveyance,
		conveyance,
		sa: specialAllowance,
		specialAllowance,
		oa: otherAllowance,
		otherAllowance,
		monthlyGross,
		annualCTC: monthlyGross * 12
	};
}
function normalizeSalaryStructure(emp) {
	if (!emp) return calculateComponentsFromCTC(0);
	const existingStruct = emp.salaryStructure || {};
	if (existingStruct.basic !== void 0 || existingStruct.hra !== void 0 || existingStruct.ca !== void 0 || existingStruct.conveyance !== void 0 || existingStruct.sa !== void 0 || existingStruct.specialAllowance !== void 0 || existingStruct.oa !== void 0 || existingStruct.otherAllowance !== void 0) return calculateCTCFromComponents(existingStruct);
	return calculateComponentsFromCTC(Number(emp.salary || emp.baseSalary || 0));
}
// src/components/common/SalaryBreakdownFields.jsx
var import_jsx_runtime = require_jsx_runtime();
/**
* Reusable Salary Structure Editor Component
* Manages Annual CTC and its breakdown:
* - Basic Pay
* - HRA (House Rent Allowance)
* - CA (Conveyance Allowance)
* - SA (Special Allowance)
* - OA (Other Allowance)
* 
* Supports both props: `salary` or `annualCtc`.
* Emits both in onChange: `{ salary, annualCtc, salaryStructure }`.
*/
function SalaryBreakdownFields({ salary, annualCtc, value, salaryStructure = {}, onChange, disabled = false, showTitle = true, sectionTitle }) {
	const currentSalary = salary !== void 0 && salary !== null ? salary : annualCtc !== void 0 && annualCtc !== null ? annualCtc : value !== void 0 && value !== null ? value : "";
	const currentBasic = salaryStructure?.basic ?? "";
	const currentHra = salaryStructure?.hra ?? "";
	const currentCa = salaryStructure?.conveyance ?? salaryStructure?.ca ?? "";
	const currentSa = salaryStructure?.specialAllowance ?? salaryStructure?.sa ?? "";
	const currentOa = salaryStructure?.otherAllowance ?? salaryStructure?.oa ?? "";
	const numBasic = Number(currentBasic) || 0;
	const numHra = Number(currentHra) || 0;
	const numCa = Number(currentCa) || 0;
	const numSa = Number(currentSa) || 0;
	const numOa = Number(currentOa) || 0;
	const monthlyGross = numBasic + numHra + numCa + numSa + numOa;
	const effectiveAnnual = monthlyGross > 0 ? monthlyGross * 12 : Number(currentSalary) || 0;
	const emitUpdate = (newAnnual, newStruct) => {
		const annualStr = newAnnual === "" || newAnnual === null || newAnnual === void 0 ? "" : String(newAnnual);
		onChange?.({
			salary: annualStr,
			annualCtc: annualStr,
			annualSalary: annualStr,
			salaryStructure: {
				basic: newStruct.basic === "" ? 0 : Number(newStruct.basic) || 0,
				hra: newStruct.hra === "" ? 0 : Number(newStruct.hra) || 0,
				conveyance: newStruct.conveyance === "" ? 0 : Number(newStruct.conveyance) || 0,
				ca: newStruct.conveyance === "" ? 0 : Number(newStruct.conveyance) || 0,
				specialAllowance: newStruct.specialAllowance === "" ? 0 : Number(newStruct.specialAllowance) || 0,
				sa: newStruct.specialAllowance === "" ? 0 : Number(newStruct.specialAllowance) || 0,
				otherAllowance: newStruct.otherAllowance === "" ? 0 : Number(newStruct.otherAllowance) || 0,
				oa: newStruct.otherAllowance === "" ? 0 : Number(newStruct.otherAllowance) || 0
			}
		});
	};
	const handleComponentChange = (key, val) => {
		const rawVal = val === "" ? "" : Math.max(0, Number(val) || 0);
		const newStructure = {
			basic: key === "basic" ? rawVal : salaryStructure?.basic ?? "",
			hra: key === "hra" ? rawVal : salaryStructure?.hra ?? "",
			conveyance: key === "ca" ? rawVal : salaryStructure?.conveyance ?? salaryStructure?.ca ?? "",
			specialAllowance: key === "sa" ? rawVal : salaryStructure?.specialAllowance ?? salaryStructure?.sa ?? "",
			otherAllowance: key === "oa" ? rawVal : salaryStructure?.otherAllowance ?? salaryStructure?.oa ?? ""
		};
		const calc = calculateCTCFromComponents(newStructure);
		emitUpdate(calc.annualCTC > 0 ? String(calc.annualCTC) : "", newStructure);
	};
	const handleAnnualSalaryChange = (newAnnual) => {
		if (newAnnual === "" || newAnnual === null || newAnnual === void 0) {
			emitUpdate("", {
				basic: "",
				hra: "",
				conveyance: "",
				ca: "",
				specialAllowance: "",
				sa: "",
				otherAllowance: "",
				oa: ""
			});
			return;
		}
		const split = calculateComponentsFromCTC(Math.max(0, Number(newAnnual) || 0));
		emitUpdate(newAnnual, {
			basic: split.basic,
			hra: split.hra,
			conveyance: split.conveyance,
			ca: split.conveyance,
			specialAllowance: split.specialAllowance,
			sa: split.specialAllowance,
			otherAllowance: split.otherAllowance,
			oa: split.otherAllowance
		});
	};
	const handleAutoSplit = () => {
		const split = calculateComponentsFromCTC(Number(currentSalary) || effectiveAnnual || 36e4);
		emitUpdate(String(split.annualCTC), {
			basic: split.basic,
			hra: split.hra,
			conveyance: split.conveyance,
			ca: split.conveyance,
			specialAllowance: split.specialAllowance,
			sa: split.specialAllowance,
			otherAllowance: split.otherAllowance,
			oa: split.otherAllowance
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			background: "#f8fafc",
			border: "1px solid #e2e8f0",
			borderRadius: "10px",
			padding: "14px",
			marginTop: "10px"
		},
		children: [
			showTitle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "10px",
					flexWrap: "wrap",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						fontSize: "13px",
						fontWeight: 700,
						color: "#1e293b",
						display: "flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, {
						size: 15,
						style: { color: "var(--teal)" }
					}), sectionTitle || "Compensation & Salary Structure (Basic, HRA, CA, SA, OA)"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: "11px",
						color: "#64748b"
					},
					children: "Fill components to auto-reflect in Annual CTC. Directly used in single and bulk payslip generation."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleAutoSplit,
					disabled,
					className: "ui-button secondary",
					style: {
						fontSize: "11px",
						padding: "4px 10px",
						background: "#ffffff",
						borderColor: "#cbd5e1",
						color: "var(--teal)"
					},
					title: "Auto-calculate standard 50% Basic, HRA, CA, SA, and OA from Annual CTC",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 11 }), " Auto-Split Standard Structure"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: "12px",
					marginBottom: "14px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					style: {
						display: "block",
						fontSize: "11.5px",
						fontWeight: 700,
						color: "#334155",
						marginBottom: "4px"
					},
					children: "Annual Salary / CTC (₹) *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "number",
					min: "0",
					step: "1",
					required: true,
					disabled,
					value: currentSalary,
					onChange: (e) => handleAnnualSalaryChange(e.target.value),
					onFocus: (e) => {
						if (String(e.target.value) === "0") e.target.select();
					},
					style: {
						width: "100%",
						padding: "8px 10px",
						borderRadius: "6px",
						border: "1px solid #cbd5e1",
						fontSize: "13px",
						fontWeight: 600,
						boxSizing: "border-box"
					},
					placeholder: "e.g. 480000"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#f0fdfa",
						border: "1px solid #ccfbf1",
						borderRadius: "8px",
						padding: "8px 12px",
						display: "flex",
						justifyContent: "space-around",
						alignItems: "center"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "10px",
								fontWeight: 600,
								color: "#0d9488",
								textTransform: "uppercase"
							},
							children: "Monthly Gross"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "15px",
								fontWeight: 700,
								color: "#0f766e"
							},
							children: formatINR(monthlyGross > 0 ? monthlyGross : Math.round((Number(currentSalary) || 0) / 12))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
							width: "1px",
							height: "28px",
							background: "#99f6e4"
						} }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "10px",
								fontWeight: 600,
								color: "#0d9488",
								textTransform: "uppercase"
							},
							children: "Annual CTC"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "15px",
								fontWeight: 700,
								color: "#0f766e"
							},
							children: formatINR(effectiveAnnual)
						})] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
					gap: "10px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#ffffff",
							padding: "8px 10px",
							borderRadius: "6px",
							border: "1px solid #e2e8f0"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "11px",
									fontWeight: 700,
									color: "#1e293b",
									marginBottom: "3px"
								},
								children: "Basic Pay (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								disabled,
								value: currentBasic,
								onChange: (e) => handleComponentChange("basic", e.target.value),
								onFocus: (e) => {
									if (String(e.target.value) === "0") e.target.select();
								},
								style: {
									width: "100%",
									padding: "6px 8px",
									borderRadius: "4px",
									border: "1px solid #cbd5e1",
									fontSize: "12px",
									fontWeight: 600,
									boxSizing: "border-box"
								},
								placeholder: "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "#64748b"
								},
								children: "50% standard"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#ffffff",
							padding: "8px 10px",
							borderRadius: "6px",
							border: "1px solid #e2e8f0"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "11px",
									fontWeight: 700,
									color: "#1e293b",
									marginBottom: "3px"
								},
								children: "HRA (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								disabled,
								value: currentHra,
								onChange: (e) => handleComponentChange("hra", e.target.value),
								onFocus: (e) => {
									if (String(e.target.value) === "0") e.target.select();
								},
								style: {
									width: "100%",
									padding: "6px 8px",
									borderRadius: "4px",
									border: "1px solid #cbd5e1",
									fontSize: "12px",
									fontWeight: 600,
									boxSizing: "border-box"
								},
								placeholder: "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "#64748b"
								},
								children: "House Rent"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#ffffff",
							padding: "8px 10px",
							borderRadius: "6px",
							border: "1px solid #e2e8f0"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "11px",
									fontWeight: 700,
									color: "#1e293b",
									marginBottom: "3px"
								},
								children: "CA (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								disabled,
								value: currentCa,
								onChange: (e) => handleComponentChange("ca", e.target.value),
								onFocus: (e) => {
									if (String(e.target.value) === "0") e.target.select();
								},
								style: {
									width: "100%",
									padding: "6px 8px",
									borderRadius: "4px",
									border: "1px solid #cbd5e1",
									fontSize: "12px",
									fontWeight: 600,
									boxSizing: "border-box"
								},
								placeholder: "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "#64748b"
								},
								children: "Conveyance"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#ffffff",
							padding: "8px 10px",
							borderRadius: "6px",
							border: "1px solid #e2e8f0"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "11px",
									fontWeight: 700,
									color: "#1e293b",
									marginBottom: "3px"
								},
								children: "SA (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								disabled,
								value: currentSa,
								onChange: (e) => handleComponentChange("sa", e.target.value),
								onFocus: (e) => {
									if (String(e.target.value) === "0") e.target.select();
								},
								style: {
									width: "100%",
									padding: "6px 8px",
									borderRadius: "4px",
									border: "1px solid #cbd5e1",
									fontSize: "12px",
									fontWeight: 600,
									boxSizing: "border-box"
								},
								placeholder: "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "#64748b"
								},
								children: "Special"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#ffffff",
							padding: "8px 10px",
							borderRadius: "6px",
							border: "1px solid #e2e8f0"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "11px",
									fontWeight: 700,
									color: "#1e293b",
									marginBottom: "3px"
								},
								children: "OA (₹)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								disabled,
								value: currentOa,
								onChange: (e) => handleComponentChange("oa", e.target.value),
								onFocus: (e) => {
									if (String(e.target.value) === "0") e.target.select();
								},
								style: {
									width: "100%",
									padding: "6px 8px",
									borderRadius: "4px",
									border: "1px solid #cbd5e1",
									fontSize: "12px",
									fontWeight: 600,
									boxSizing: "border-box"
								},
								placeholder: "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "#64748b"
								},
								children: "Other / Flexi"
							})
						]
					})
				]
			})
		]
	});
}
// src/pages/EmployeesPage.jsx
var emptyFilters = {
	search: "",
	department: "",
	designation: "",
	campus: "",
	employmentType: "",
	status: "",
	page: 1,
	limit: 10
};
var CAMPUSES = ["Ignite Campus", "Velocity Hub"];
var EMPLOYMENT_TYPES = [{
	id: "full_time",
	label: "Full-Time Staff"
}, {
	id: "intern",
	label: "Intern / Trainee"
}];
var statusLabels = {
	invited: "Invited",
	active: "Active",
	inactive: "Inactive",
	onboarding: "Onboarding",
	notice: "Notice Period"
};
var DEPARTMENTS = {
	map: (...args) => hrStore.getDepartments().map((d) => d.name).map(...args),
	filter: (...args) => hrStore.getDepartments().map((d) => d.name).filter(...args),
	includes: (...args) => hrStore.getDepartments().map((d) => d.name).includes(...args),
	forEach: (...args) => hrStore.getDepartments().map((d) => d.name).forEach(...args),
	get length() {
		return hrStore.getDepartments().length;
	},
	[Symbol.iterator]: function* () {
		yield* hrStore.getDepartments().map((d) => d.name);
	}
};
var BANKS = [
	"HDFC Bank",
	"ICICI Bank",
	"State Bank of India",
	"Axis Bank",
	"Kotak Mahindra Bank",
	"Punjab National Bank",
	"Bank of Baroda"
];
function EmployeeAvatar({ name, avatarUrl, size = 32 }) {
	const [imgError, setImgError] = (0, import_react.useState)(false);
	const initial = String(name ?? "?").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
	if (avatarUrl && !imgError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: avatarUrl,
		alt: name || "Employee",
		style: {
			width: `${size}px`,
			height: `${size}px`,
			borderRadius: "50%",
			objectFit: "cover",
			border: "1.5px solid var(--teal, #006E6F)",
			flexShrink: 0,
			display: "inline-block"
		},
		onError: () => setImgError(true)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "avatar avatar-teal",
		style: {
			width: `${size}px`,
			height: `${size}px`,
			fontSize: `${Math.max(9, Math.round(size * .38))}px`,
			display: "grid",
			placeItems: "center",
			flexShrink: 0
		},
		children: initial
	});
}
var workforcePath = (suffix) => `#/${window.location.hash.startsWith("#/admin") ? "admin" : "hr"}${suffix}`;
function EmployeeDirectory({ route } = {}) {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = (0, import_react.useState)("directory");
	const [filters, setFilters] = (0, import_react.useState)(emptyFilters);
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [feedbackMessage, setFeedbackMessage] = (0, import_react.useState)("");
	const [showAddModal, setShowAddModal] = (0, import_react.useState)(false);
	const [modalActiveTab, setModalActiveTab] = (0, import_react.useState)("basic");
	const allEmployees = storeState.employees || [];
	const allRoleOptions = (0, import_react.useMemo)(() => {
		const PROTECTED_ROLES = /* @__PURE__ */ new Set([
			"admin",
			"hr",
			"hr_executive",
			"manager",
			"employee",
			"intern",
			"team_lead",
			"team_leader",
			"director",
			"managing_director",
			"sde",
			"operations_executive",
			"marketing_executive",
			"business_development_executive"
		]);
		const rawDeleted = storeState.deletedRoleIds || hrStore.getState?.()?.deletedRoleIds || [];
		const deletedIds = new Set(rawDeleted.filter((id) => !PROTECTED_ROLES.has(id)));
		const hrRoles = hrStore.getRoles ? hrStore.getRoles() : [];
		const storeRoles = storeState.roles || [];
		const roleMap = /* @__PURE__ */ new Map();
		INITIAL_ROLES.forEach((r) => {
			if (r?.id && !deletedIds.has(r.id)) roleMap.set(r.id, {
				id: r.id,
				name: r.name || r.label || r.id
			});
		});
		hrRoles.forEach((r) => {
			const id = r.id || r.roleId;
			if (id && !deletedIds.has(id)) roleMap.set(id, {
				id,
				name: r.name || r.label || id
			});
		});
		storeRoles.forEach((r) => {
			const id = r.id || r.roleId;
			if (id && !deletedIds.has(id)) roleMap.set(id, {
				id,
				name: r.name || r.label || id
			});
		});
		if (roleMap.size < 5) INITIAL_ROLES.forEach((r) => {
			if (r?.id) roleMap.set(r.id, {
				id: r.id,
				name: r.name || r.label || r.id
			});
		});
		return Array.from(roleMap.values());
	}, [storeState.roles, storeState.deletedRoleIds]);
	const defaultNewForm = {
		employeeId: "",
		name: "",
		email: "",
		phone: "",
		password: "",
		campus: "Ignite Campus",
		employmentType: "full_time",
		department: "Technology",
		team: "",
		teamId: "",
		squad: "",
		squadId: "",
		teamLeadId: "",
		teamLeadName: "",
		designation: "",
		role: "employee",
		status: "active",
		salary: "",
		salaryStructure: {
			basic: "",
			hra: "",
			conveyance: "",
			ca: "",
			specialAllowance: "",
			sa: "",
			otherAllowance: "",
			oa: ""
		},
		joiningDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		dob: "",
		managerId: "",
		managerName: "",
		bankName: "",
		accountNumber: "",
		ifscCode: "",
		panTaxId: "",
		hasExistingUan: false,
		uanNumber: ""
	};
	const [newEmpForm, setNewEmpForm] = (0, import_react.useState)(defaultNewForm);
	const [createdCredentials, setCreatedCredentials] = (0, import_react.useState)(null);
	const [copySuccess, setCopySuccess] = (0, import_react.useState)(false);
	const [sendingEmail, setSendingEmail] = (0, import_react.useState)(false);
	const [emailStatus, setEmailStatus] = (0, import_react.useState)(null);
	const [emailMessage, setEmailMessage] = (0, import_react.useState)("");
	const [modalError, setModalError] = (0, import_react.useState)("");
	function openAddModal() {
		setModalError("");
		const nextCode = generateNextEmployeeCode(allEmployees, storeState.users);
		const autoPass = generateAutoPassword();
		setNewEmpForm({
			...defaultNewForm,
			employeeId: nextCode,
			password: autoPass
		});
		setModalActiveTab("basic");
		setShowAddModal(true);
	}
	(0, import_react.useEffect)(() => {
		if (route?.path?.endsWith("/new") || typeof window !== "undefined" && window.location.hash.includes("/people/new")) openAddModal();
	}, [route?.path]);
	const [editingEmployee, setEditingEmployee] = (0, import_react.useState)(null);
	const [employeeToDelete, setEmployeeToDelete] = (0, import_react.useState)(null);
	const [rejectingEmp, setRejectingEmp] = (0, import_react.useState)(null);
	const [rejectionReasonInput, setRejectionReasonInput] = (0, import_react.useState)("");
	const [showExitModal, setShowExitModal] = (0, import_react.useState)(false);
	const defaultExitForm = {
		employeeId: "",
		reason: "Career Growth & Better Opportunity",
		noticePeriodDays: "30",
		lastWorkingDay: (() => {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() + 30);
			return d.toISOString().split("T")[0];
		})(),
		handoverAssignee: "",
		comments: ""
	};
	const [exitForm, setExitForm] = (0, import_react.useState)(defaultExitForm);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	(0, import_react.useEffect)(() => {
		if (!storeState.employees || storeState.employees.length === 0) hrStore.refresh().catch(() => {});
	}, []);
	function showFeedback(msg) {
		setFeedbackMessage(msg);
		setTimeout(() => setFeedbackMessage(""), 4500);
	}
	const updateFilter = (field, value) => setFilters((current) => ({
		...current,
		[field]: value,
		page: 1
	}));
	const availableManagers = allEmployees.filter((e) => {
		if (!e || e.status === "inactive" || e.status === "terminated") return false;
		const r = String(e.role || "").toLowerCase().trim().replace(/[-\s]/g, "_");
		const des = String(e.designation || "").toLowerCase().trim();
		return [
			"director",
			"manager",
			"admin",
			"hr",
			"team_lead",
			"team_leader",
			"senior_manager",
			"general_manager",
			"assistant_general_manager",
			"head_of_sales",
			"head_of_marketing",
			"vertical_head",
			"managing_director",
			"co_founder"
		].includes(r) || r.includes("lead") || r.includes("leader") || r.includes("manager") || r.includes("director") || r.includes("head") || des.includes("lead") || des.includes("leader") || des.includes("manager") || des.includes("tl") || des.includes("head");
	});
	const filteredEmployees = allEmployees.filter((emp) => {
		if (filters.search) {
			const q = filters.search.toLowerCase();
			if (!emp.name.toLowerCase().includes(q) && !emp.email.toLowerCase().includes(q) && !emp.employeeId.toLowerCase().includes(q) && !(emp.team || emp.squad || "").toLowerCase().includes(q)) return false;
		}
		if (filters.status === "notice" ? !emp.exitDetails || emp.status === "inactive" : filters.status && emp.status !== filters.status) return false;
		if (filters.department && !String(emp.department ?? "").toLowerCase().includes(filters.department.toLowerCase())) return false;
		if (filters.designation && !String(emp.designation ?? "").toLowerCase().includes(filters.designation.toLowerCase())) return false;
		if (filters.campus && (emp.campus || "Ignite Campus") !== filters.campus) return false;
		if (filters.employmentType) {
			const isIntern = String(emp.employmentType || "").toLowerCase().includes("intern") || String(emp.role || "").toLowerCase().includes("intern") || String(emp.designation || "").toLowerCase().includes("intern");
			if (filters.employmentType === "intern" && !isIntern) return false;
			if (filters.employmentType === "full_time" && isIntern) return false;
		}
		return true;
	});
	const onboardingEmployees = allEmployees.filter((e) => e.status === "invited" || e.onboardingChecklist && e.onboardingChecklist.some((it) => !it.completed));
	const exitEmployees = allEmployees.filter((e) => e.status === "notice" || e.exitDetails);
	const pendingApprovalEmployees = allEmployees.filter((e) => {
		if (e.onboardingStatus === "verified") return false;
		if (e.onboardingStatus === "action_required" || e.onboardingStatus === "revision_requested") return false;
		if (e.onboardingStatus === "submitted" || e.onboardingStatus === "in_review") return true;
		if (e.onboardingDocs && typeof e.onboardingDocs === "object") {
			if (Object.values(e.onboardingDocs).some((d) => d && typeof d === "object" && (d.fileName || d.url || d.submittedAt) && d.status !== "verified" && d.status !== "rejected")) return true;
		}
		return false;
	});
	const handleCreateEmployee = storeAction(async (e) => {
		e.preventDefault();
		setModalError("");
		const rec = getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department);
		const designation = (newEmpForm.designation || "").trim() || rec.designation || "Employee";
		const missing = [];
		if (!newEmpForm.name?.trim()) missing.push("Full Name");
		if (!newEmpForm.email?.trim()) missing.push("Work Email");
		if (!newEmpForm.phone?.trim()) missing.push("Phone Number");
		if (!newEmpForm.joiningDate) missing.push("Joining Date");
		if (missing.length) {
			setModalActiveTab("basic");
			setModalError(`Please fill: ${missing.join(", ")}.`);
			return;
		}
		const finalEmpCode = newEmpForm.employeeId && newEmpForm.employeeId.trim() ? newEmpForm.employeeId.trim().toUpperCase() : generateNextEmployeeCode(allEmployees, storeState.users);
		const finalPassword = newEmpForm.password && newEmpForm.password.trim().length >= 8 ? newEmpForm.password.trim() : generateAutoPassword();
		const mgr = allEmployees.find((m) => m.id === newEmpForm.managerId || m.employeeId === newEmpForm.managerId);
		const empData = {
			...newEmpForm,
			team: newEmpForm.team || newEmpForm.squad || "",
			teamId: newEmpForm.teamId || newEmpForm.squadId || "",
			squad: newEmpForm.squad || newEmpForm.team || "",
			squadId: newEmpForm.squadId || newEmpForm.teamId || "",
			designation,
			campus: newEmpForm.campus || "Ignite Campus",
			location: newEmpForm.campus || newEmpForm.location || "Ignite Campus",
			employmentType: newEmpForm.employmentType || (newEmpForm.role?.includes("intern") ? "intern" : "full_time"),
			employeeId: finalEmpCode,
			password: finalPassword,
			managerName: mgr?.name || "",
			salary: Number(newEmpForm.salary) || 0,
			salaryStructure: newEmpForm.salaryStructure || {},
			bankDetails: {
				bankName: newEmpForm.bankName,
				accountNumber: newEmpForm.accountNumber,
				ifscCode: newEmpForm.ifscCode,
				panTaxId: newEmpForm.panTaxId,
				uanNumber: newEmpForm.hasExistingUan ? newEmpForm.uanNumber : ""
			},
			onboardingStatus: "draft"
		};
		try {
			const created = await hrStore.addEmployee(empData);
			setShowAddModal(false);
			setNewEmpForm(defaultNewForm);
			setModalActiveTab("basic");
			setCopySuccess(false);
			setSendingEmail(false);
			setEmailStatus("success");
			setEmailMessage(`Official credentials email automatically dispatched directly to ${created?.email || empData.email}!`);
			setCreatedCredentials({
				name: created?.name || empData.name,
				email: created?.email || empData.email,
				employeeId: created?.employeeId || finalEmpCode,
				role: created?.role || empData.role || "employee",
				password: created?.temporaryPassword || finalPassword
			});
			showFeedback(`Successfully registered ${created?.name || empData.name} (${created?.employeeId || finalEmpCode}). Welcome email dispatched directly.`);
		} catch (err) {
			const details = err?.fields ? ` (${Object.entries(err.fields).map(([k, v]) => `${k}: ${v}`).join(", ")})` : "";
			setModalError(`Failed to add employee: ${err.message}${details}`);
		}
	});
	function startEditEmployee(emp) {
		setModalError("");
		const isDir = emp.role === "director" || emp.role === "managing_director" || emp.email === "jagadishbabu@edufyitech.in" || emp.email === "director@edufyitech.in";
		const cleanDept = isDir ? "Executive" : emp.department || "Executive";
		getRecommendedRoleConfig(emp.role, cleanDept);
		const isInternEmp = String(emp.employmentType || "").toLowerCase().includes("intern") || String(emp.role || "").toLowerCase().includes("intern") || String(emp.designation || "").toLowerCase().includes("intern");
		setEditingEmployee({
			...emp,
			team: emp.team || emp.squad || "",
			teamId: emp.teamId || emp.squadId || "",
			squad: emp.squad || emp.team || "",
			squadId: emp.squadId || emp.teamId || "",
			teamLeadId: emp.teamLeadId || "",
			teamLeadName: emp.teamLeadName || "",
			campus: emp.campus || "Ignite Campus",
			employmentType: emp.employmentType || (isInternEmp ? "intern" : "full_time"),
			department: cleanDept,
			designation: isDir ? emp.designation && emp.designation.toLowerCase().includes("director") ? emp.designation : "Managing Director" : emp.designation || "Pending Designation",
			dob: emp.dob ? String(emp.dob).slice(0, 10) : emp.identity?.dob ? String(emp.identity.dob).slice(0, 10) : "",
			emergencyContactName: emp.emergencyContact?.name || "",
			emergencyContactRelationship: emp.emergencyContact?.relationship || "",
			emergencyContactPhone: emp.emergencyContact?.phone || "",
			fatherName: emp.parentsContact?.fatherName || "",
			motherName: emp.parentsContact?.motherName || "",
			parentPhone: emp.parentsContact?.parentPhone || emp.parentsContact?.phone || "",
			parentAddress: emp.parentsContact?.address || "",
			bankName: emp.bankDetails?.bankName || "",
			accountNumber: emp.bankDetails?.accountNumber || "",
			ifscCode: emp.bankDetails?.ifscCode || "",
			panTaxId: emp.bankDetails?.panTaxId || "",
			uanNumber: emp.bankDetails?.uanNumber || "",
			salary: emp.salary ?? "",
			salaryStructure: normalizeSalaryStructure(emp)
		});
	}
	const handleUpdateEmployee = storeAction(async (e) => {
		e.preventDefault();
		if (!editingEmployee || !editingEmployee.name || !editingEmployee.email) return;
		const mgr = allEmployees.find((m) => String(m.id || m._id) === String(editingEmployee.managerId) || String(m.employeeId).toUpperCase() === String(editingEmployee.managerId).toUpperCase());
		const targetId = editingEmployee.id || editingEmployee._id || editingEmployee.employeeId;
		const validManagerId = mgr ? mgr.id || mgr._id || mgr.employeeId : null;
		const normEt = String(editingEmployee.employmentType || "").toLowerCase().trim().replace(/[-\s]/g, "_");
		const validEt = [
			"full_time",
			"part_time",
			"contractor",
			"intern"
		].includes(normEt) ? normEt : normEt === "contract" ? "contractor" : editingEmployee.role?.includes("intern") ? "intern" : "full_time";
		const updates = {
			...editingEmployee,
			managerId: validManagerId,
			managerName: mgr ? mgr.displayName || mgr.name : "",
			team: editingEmployee.team || editingEmployee.squad || "",
			teamId: editingEmployee.teamId || editingEmployee.squadId || "",
			squad: editingEmployee.squad || editingEmployee.team || "",
			squadId: editingEmployee.squadId || editingEmployee.teamId || "",
			teamLeadId: editingEmployee.teamLeadId || "",
			teamLeadName: editingEmployee.teamLeadName || "",
			campus: editingEmployee.campus || "Ignite Campus",
			location: editingEmployee.campus || editingEmployee.location || "Ignite Campus",
			employmentType: validEt,
			salary: Number(editingEmployee.salary) || 0,
			salaryStructure: editingEmployee.salaryStructure || {},
			phone: editingEmployee.phone ? String(editingEmployee.phone).trim() : "",
			employeeId: editingEmployee.employeeId ? String(editingEmployee.employeeId).trim().toUpperCase() : "",
			bankDetails: {
				...editingEmployee.bankDetails || {},
				bankName: editingEmployee.bankName || "",
				accountNumber: String(editingEmployee.accountNumber || "").trim(),
				ifscCode: String(editingEmployee.ifscCode || "").trim().toUpperCase(),
				panTaxId: String(editingEmployee.panTaxId || "").trim().toUpperCase(),
				uanNumber: String(editingEmployee.uanNumber || "").trim()
			},
			emergencyContact: {
				name: String(editingEmployee.emergencyContactName || "").trim(),
				relationship: String(editingEmployee.emergencyContactRelationship || "").trim(),
				phone: String(editingEmployee.emergencyContactPhone || "").replace(/[^0-9+\s\-()]/g, "").trim()
			},
			parentsContact: {
				fatherName: String(editingEmployee.fatherName || "").trim(),
				motherName: String(editingEmployee.motherName || "").trim(),
				parentPhone: String(editingEmployee.parentPhone || "").replace(/[^0-9+\s\-()]/g, "").trim(),
				phone: String(editingEmployee.parentPhone || "").replace(/[^0-9+\s\-()]/g, "").trim(),
				address: String(editingEmployee.parentAddress || "").trim()
			}
		};
		delete updates.permissions;
		delete updates.authVersion;
		delete updates.passwordHash;
		delete updates.salaryRecord;
		delete updates._id;
		delete updates.__v;
		if (updates.onboardingStatus === "pending") updates.onboardingStatus = "submitted";
		setModalError("");
		try {
			await hrStore.updateEmployee(targetId, updates);
			setEditingEmployee(null);
			showFeedback(`Updated profile for ${editingEmployee.name} (${editingEmployee.employeeId}).`);
		} catch (err) {
			const details = err?.fields ? ` (${Object.entries(err.fields).map(([k, v]) => `${k}: ${v}`).join(", ")})` : "";
			setModalError(`Failed to save: ${err?.message || "Unexpected error"}${details}`);
		}
	});
	const handleDeleteEmployee = storeAction(async () => {
		if (!employeeToDelete) return;
		const empName = employeeToDelete.name;
		const empCode = employeeToDelete.employeeId;
		await hrStore.deleteEmployee(employeeToDelete.id, {
			force: true,
			purge: true
		});
		setEmployeeToDelete(null);
		showFeedback(`Permanently deleted ${empName} (${empCode}) and all of their linked records.`);
	});
	const handleRejectOnboarding = storeAction(async (e) => {
		e.preventDefault();
		if (!rejectingEmp || !rejectionReasonInput.trim()) {
			showFeedback("Please provide a specific rejection reason.");
			return;
		}
		const targetId = rejectingEmp.id || rejectingEmp._id || rejectingEmp.employeeId;
		try {
			if (hrStore.rejectOnboarding) await hrStore.rejectOnboarding(targetId, rejectionReasonInput.trim());
			else await hrStore.updateOnboardingDocs(targetId, {
				onboardingStatus: "action_required",
				onboardingRejectionReason: rejectionReasonInput.trim()
			});
		} catch {
			await hrStore.updateOnboardingDocs(targetId, {
				onboardingStatus: "action_required",
				onboardingRejectionReason: rejectionReasonInput.trim()
			});
		}
		showFeedback(`Requested onboarding revisions for ${rejectingEmp.name}: "${rejectionReasonInput.trim()}".`);
		setRejectingEmp(null);
		setRejectionReasonInput("");
	});
	const handleToggleStatus = storeAction(async (emp) => {
		const newStatus = await hrStore.toggleEmployeeStatus(emp.id);
		showFeedback(`Changed status for ${emp.name} to "${statusLabels[newStatus] || newStatus}".`);
	});
	const handleInitiateExit = storeAction(async (e) => {
		e.preventDefault();
		if (!exitForm.employeeId) return;
		const emp = allEmployees.find((x) => x.id === exitForm.employeeId || x._id === exitForm.employeeId || x.employeeId === exitForm.employeeId);
		await hrStore.initiateExit(exitForm.employeeId, exitForm);
		setShowExitModal(false);
		setExitForm(defaultExitForm);
		setActiveTab("exit");
		showFeedback(`Exit process recorded in database for ${emp?.name || "employee"}. Notice period and clearance tasks are now active.`);
	});
	const handleCancelExit = storeAction(async (emp) => {
		if (!confirm(`Cancel the exit process for ${emp.name}? This will reinstate them as an Active employee.`)) return;
		await hrStore.cancelExit(emp.id);
		showFeedback(`Cancelled exit process. ${emp.name} is reinstated as Active.`);
	});
	const handleFinalizeExit = storeAction(async (emp) => {
		if (!confirm(`Finalize departure for ${emp.name}? This will complete offboarding and mark the employee as Inactive/Exited.`)) return;
		await hrStore.finalizeExit(emp.id);
		showFeedback(`Finalized offboarding for ${emp.name}. Profile is now marked Exited (Inactive).`);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Workforce Operations",
			title: "Employee Management",
			description: "Manage employee profiles, corporate hierarchy, designations, and payroll compensation.",
			children: hasPermission(user, "employees.write") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: openAddModal,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Add Employee"]
			})
		}),
		feedbackMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				alignItems: "center",
				gap: "10px",
				background: "var(--soft-teal)",
				border: "1px solid rgba(29, 138, 122, 0.3)",
				borderRadius: "9px",
				padding: "11px 16px",
				marginBottom: "18px",
				color: "var(--teal)",
				fontSize: "11px",
				fontWeight: 600,
				animation: "fadeUp 0.3s ease"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: { flex: 1 },
					children: feedbackMessage
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFeedbackMessage(""),
					style: {
						border: 0,
						background: "transparent",
						cursor: "pointer",
						color: "var(--teal)",
						fontSize: "13px"
					},
					children: "✕"
				})
			]
		}),
		pendingApprovalEmployees.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: "16px",
				background: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.12) 100%)",
				border: "1px solid rgba(249, 115, 22, 0.35)",
				borderRadius: "10px",
				padding: "14px 18px",
				marginBottom: "18px",
				boxShadow: "0 2px 8px rgba(249, 115, 22, 0.08)",
				flexWrap: "wrap"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						width: "38px",
						height: "38px",
						borderRadius: "8px",
						background: "#ea580c",
						color: "#ffffff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { size: 20 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						style: {
							fontSize: "14px",
							color: "#9a3412"
						},
						children: "Document Approval Required"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							background: "#ea580c",
							color: "#ffffff",
							padding: "2px 8px",
							borderRadius: "12px",
							fontSize: "11px",
							fontWeight: 700
						},
						children: [pendingApprovalEmployees.length, " Pending"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "4px 0 0",
						fontSize: "12px",
						color: "#7c2d12",
						opacity: .95
					},
					children: pendingApprovalEmployees.length === 1 ? `${pendingApprovalEmployees[0].name} has submitted onboarding verification documents awaiting HR approval.` : `${pendingApprovalEmployees.length} employees have submitted onboarding verification documents awaiting HR approval.`
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					gap: "10px",
					alignItems: "center"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => setActiveTab("approvals"),
					style: {
						background: "#ea580c",
						borderColor: "#ea580c",
						color: "#fff",
						fontWeight: 600,
						fontSize: "12px",
						padding: "8px 16px",
						cursor: "pointer",
						borderRadius: "7px"
					},
					children: [
						"Review Documents (",
						pendingApprovalEmployees.length,
						")"
					]
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "subnav-tabs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `subnav-tab ${activeTab === "directory" ? "active" : ""}`,
					onClick: () => setActiveTab("directory"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Directory" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: allEmployees.length
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `subnav-tab ${activeTab === "approvals" ? "active" : ""}`,
					onClick: () => setActiveTab("approvals"),
					style: { position: "relative" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Document Approvals" }),
						pendingApprovalEmployees.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								background: "#ea580c",
								color: "#ffffff",
								padding: "1px 7px",
								borderRadius: "10px",
								fontSize: "10px",
								fontWeight: 700,
								marginLeft: "6px"
							},
							children: pendingApprovalEmployees.length
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: "0"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `subnav-tab ${activeTab === "onboarding" ? "active" : ""}`,
					onClick: () => setActiveTab("onboarding"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Onboarding Pipeline" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: onboardingEmployees.length
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `subnav-tab ${activeTab === "exit" ? "active" : ""}`,
					onClick: () => setActiveTab("exit"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Exit & Offboarding" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: exitEmployees.length
						})
					]
				})
			]
		}),
		activeTab === "directory" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "employee-toolbar panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "employee-search",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					"aria-label": "Search employees",
					placeholder: "Search by employee name, email, or ID...",
					value: filters.search,
					onChange: (event) => updateFilter("search", event.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "employee-filters",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						"aria-label": "Filter by status",
						value: filters.status,
						onChange: (event) => updateFilter("status", event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "active",
								children: "Active"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "invited",
								children: "Invited"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "notice",
								children: "Notice Period"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "inactive",
								children: "Inactive"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						"aria-label": "Filter by department",
						placeholder: "Department (e.g. Engineering)",
						value: filters.department,
						onChange: (event) => updateFilter("department", event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						"aria-label": "Filter by designation",
						placeholder: "Designation",
						value: filters.designation,
						onChange: (event) => updateFilter("designation", event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						"aria-label": "Filter by campus",
						value: filters.campus,
						onChange: (event) => updateFilter("campus", event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All campuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Ignite Campus",
								children: "Ignite Campus"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "Velocity Hub",
								children: "Velocity Hub"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						"aria-label": "Filter by employment type",
						value: filters.employmentType,
						onChange: (event) => updateFilter("employmentType", event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All Types (Full-Time & Interns)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "full_time",
								children: "Full-Time Staff"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "intern",
								children: "🎓 Interns Only"
							})
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel employee-table-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Roster"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [filteredEmployees.length, " Registered Employees"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button secondary",
							style: {
								padding: "4px 10px",
								fontSize: "11.5px",
								height: "28px",
								display: "flex",
								alignItems: "center",
								gap: "5px"
							},
							onClick: () => hrStore.perform(() => hrStore.refresh()),
							title: "Reload employee roster from database",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 12 }), " Sync Roster"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StatusBadge, {
							tone: "info",
							children: [
								"Live Synced (",
								allEmployees.length,
								" total)"
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "employee-cards-mobile",
					style: {
						display: "none",
						gap: "12px",
						marginTop: "14px"
					},
					children: filteredEmployees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No employees found",
						message: "Try clearing your search or filters."
					}) : filteredEmployees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#ffffff",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "14px",
							display: "flex",
							flexDirection: "column",
							gap: "10px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
										name: emp.name,
										avatarUrl: emp.avatarUrl || emp.onboardingDocs?.passportPhoto?.url
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											fontSize: "13px",
											display: "block"
										},
										children: emp.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											color: "var(--muted)",
											fontSize: "11px"
										},
										children: emp.email
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: emp.status === "active" ? "info" : emp.status === "notice" ? "warning" : emp.status === "onboarding" ? "info" : "neutral",
									children: statusLabels[emp.status] ?? emp.status
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "6px",
									fontSize: "11px",
									background: "var(--surface-sunken)",
									padding: "8px 10px",
									borderRadius: "6px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "ID: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emp.employeeId })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Campus: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "var(--teal)" },
										children: emp.campus || "Ignite Campus"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Dept: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emp.department })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Designation: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emp.designation || "Pending Designation" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Role: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { textTransform: "capitalize" },
										children: getRoleBadgeLabel(emp.role)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Type: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: emp.employmentType === "intern" || String(emp.role || "").includes("intern") || String(emp.designation || "").toLowerCase().includes("intern") ? "#0284c7" : "inherit" },
										children: emp.employmentType === "intern" || String(emp.role || "").includes("intern") || String(emp.designation || "").toLowerCase().includes("intern") ? "🎓 Intern" : "Full-Time"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "CTC: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "var(--teal)" },
										children: formatINR(emp.salary ?? 0)
									})] }),
									(emp.team || emp.squad) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: { gridColumn: "span 2" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: { color: "var(--muted)" },
											children: "Squad: "
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "#7e22ce" },
											children: emp.team || emp.squad
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "6px",
									flexWrap: "wrap",
									borderTop: "1px solid var(--line)",
									paddingTop: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									className: "emp-action-btn view",
									href: workforcePath(`/people/${emp._id ?? emp.id}`),
									style: {
										flex: "1 1 auto",
										justifyContent: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 }), " View"]
								}), hasPermission(user, "employees.write") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "emp-action-btn edit",
									onClick: () => startEditEmployee(emp),
									style: {
										flex: "1 1 auto",
										justifyContent: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 12 }), " Edit"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "emp-action-btn status-toggle",
									onClick: () => handleToggleStatus(emp),
									style: {
										flex: "1 1 auto",
										justifyContent: "center"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { size: 12 }),
										" ",
										emp.status === "active" ? "Deactivate" : "Activate"
									]
								})] })]
							})
						]
					}, emp.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "employee-table-desktop",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						caption: "Employee directory",
						columns: [
							{
								key: "employee",
								label: "Employee",
								render: (employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									className: "employee-link",
									href: workforcePath(`/people/${employee._id ?? employee.id}`),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
										name: employee.name,
										avatarUrl: employee.avatarUrl || employee.onboardingDocs?.passportPhoto?.url
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: employee.email })] })]
								})
							},
							{
								key: "employeeId",
								label: "Employee ID"
							},
							{
								key: "department",
								label: "Department"
							},
							{
								key: "team",
								label: "Squad / Team",
								render: (employee) => {
									const squadName = employee.team || employee.squad;
									if (!squadName) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "11px"
										},
										children: "—"
									});
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											padding: "2px 8px",
											borderRadius: "10px",
											fontSize: "11px",
											fontWeight: 600,
											background: "#f3e8ff",
											color: "#7e22ce",
											border: "1px solid #e9d5ff",
											whiteSpace: "nowrap"
										},
										children: squadName
									});
								}
							},
							{
								key: "designation",
								label: "Designation",
								render: (employee) => {
									const isIntern = employee.employmentType === "intern" || String(employee.role || "").toLowerCase().includes("intern") || String(employee.designation || "").toLowerCase().includes("intern");
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "6px",
											flexWrap: "wrap"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: employee.designation }), isIntern && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												display: "inline-flex",
												alignItems: "center",
												padding: "1px 6px",
												borderRadius: "10px",
												fontSize: "10px",
												fontWeight: 700,
												background: "#e0f2fe",
												color: "#0284c7",
												border: "1px solid #bae6fd",
												whiteSpace: "nowrap"
											},
											children: "🎓 Intern"
										})]
									});
								}
							},
							{
								key: "campus",
								label: "Campus",
								render: (e) => {
									const isVelocity = (e.campus || "").toLowerCase().includes("velocity");
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "4px",
											padding: "2px 8px",
											borderRadius: "12px",
											fontSize: "11px",
											fontWeight: 600,
											background: isVelocity ? "#eff6ff" : "#f0fdf4",
											color: isVelocity ? "#1d4ed8" : "#15803d",
											border: `1px solid ${isVelocity ? "#bfdbfe" : "#bbf7d0"}`,
											whiteSpace: "nowrap"
										},
										children: e.campus || "Ignite Campus"
									});
								}
							},
							{
								key: "salary",
								label: "Annual CTC",
								render: (e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "var(--teal)" },
									children: formatINR(e.salary ?? 0)
								})
							},
							{
								key: "onboardingDocs",
								label: "Onboarding / Documents",
								render: (emp) => {
									const isVerified = emp.onboardingStatus === "verified";
									const isSubmitted = emp.onboardingStatus === "submitted" || emp.onboardingStatus === "in_review";
									if (isVerified) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "5px",
											background: "#ecfdf5",
											color: "#047857",
											border: "1px solid #a7f3d0",
											padding: "3px 8px",
											borderRadius: "12px",
											fontSize: "11px",
											fontWeight: 600
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 12 }), " Verified"]
									});
									if (isSubmitted) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: workforcePath(`/people/${emp._id ?? emp.id}`),
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "5px",
											background: "#fff7ed",
											color: "#c2410c",
											border: "1px solid #fed7aa",
											padding: "3px 8px",
											borderRadius: "12px",
											fontSize: "11px",
											fontWeight: 700,
											textDecoration: "none"
										},
										title: "Click to review submitted documents",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 12 }), " Needs Approval"]
									});
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "4px",
											background: "#f8fafc",
											color: "#64748b",
											border: "1px solid #e2e8f0",
											padding: "3px 8px",
											borderRadius: "12px",
											fontSize: "11px"
										},
										children: "Pending Upload"
									});
								}
							},
							{
								key: "status",
								label: "Status",
								render: (employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: employee.status === "active" ? "info" : employee.status === "notice" ? "warning" : employee.status === "onboarding" ? "info" : "neutral",
									children: statusLabels[employee.status] ?? employee.status
								})
							},
							{
								key: "actions",
								label: "Actions",
								render: (emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "emp-action-group",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										className: "emp-action-btn view",
										href: workforcePath(`/people/${emp._id ?? emp.id}`),
										title: "View Full Profile",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 }), " View"]
									}), hasPermission(user, "employees.write") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn edit",
											onClick: () => startEditEmployee(emp),
											title: "Edit Employee",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 12 }), " Edit"]
										}),
										emp.status === "notice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn edit",
											style: {
												color: "#d97706",
												borderColor: "#fde68a"
											},
											onClick: () => setActiveTab("exit"),
											title: "View Exit & Clearance details",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { size: 12 }), " Notice"]
										}) : emp.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn edit",
											onClick: () => {
												setExitForm({
													...defaultExitForm,
													employeeId: emp.id
												});
												setShowExitModal(true);
											},
											title: "Initiate Exit / Offboarding",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { size: 12 }), " Exit"]
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn status-toggle",
											onClick: () => handleToggleStatus(emp),
											title: emp.status === "active" ? "Deactivate Employee" : "Activate Employee",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { size: 12 }),
												" ",
												emp.status === "active" ? "Deactivate" : "Activate"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn delete",
											onClick: () => setEmployeeToDelete(emp),
											title: "Permanently delete employee and linked records",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), " Delete"]
										})
									] })]
								})
							}
						],
						rows: filteredEmployees,
						emptyMessage: allEmployees.length === 0 ? "Syncing employees from database... If not loaded, click Sync Roster above." : "No employees match these filters."
					})
				})
			]
		})] }),
		activeTab === "approvals" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			style: { padding: "24px" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					style: { marginBottom: "16px" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "HR Compliance & Verification"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								size: 22,
								style: { color: "var(--teal)" }
							}),
							"Onboarding Document Approvals (",
							pendingApprovalEmployees.length,
							" Pending)"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: pendingApprovalEmployees.length > 0 ? "warning" : "info",
						children: pendingApprovalEmployees.length > 0 ? `${pendingApprovalEmployees.length} Awaiting Review` : "All Verified"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "foundation-copy",
					style: { marginBottom: "20px" },
					children: "Review official identification proofs, educational certificates, and statutory submissions provided by employees. Approving verifies the documents and locks the profile from unauthorized employee modifications."
				}),
				pendingApprovalEmployees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						textAlign: "center",
						padding: "48px 24px",
						background: "#f8fafc",
						border: "1px dashed #cbd5e1",
						borderRadius: "12px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							size: 44,
							style: {
								color: "var(--teal)",
								margin: "0 auto 12px"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 6px",
								fontSize: "16px",
								color: "#0f172a"
							},
							children: "All Onboarding Documents Verified"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: 0,
								fontSize: "13px",
								color: "#64748b"
							},
							children: "There are no pending employee document approval requests at this time."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => setActiveTab("directory"),
							style: { marginTop: "16px" },
							children: "Return to Employee Directory"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gap: "16px"
					},
					children: pendingApprovalEmployees.map((emp) => {
						const uploadedDocs = (emp.onboardingDocs ? Object.keys(emp.onboardingDocs) : []).filter((k) => emp.onboardingDocs[k]?.fileName || emp.onboardingDocs[k]?.url);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								border: "1px solid #fed7aa",
								background: "#fffbf5",
								borderRadius: "12px",
								padding: "18px 20px",
								display: "flex",
								flexDirection: "column",
								gap: "14px",
								boxShadow: "0 2px 6px rgba(234, 88, 12, 0.05)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
									flexWrap: "wrap",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "14px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
										name: emp.name,
										avatarUrl: emp.avatarUrl || emp.onboardingDocs?.passportPhoto?.url
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "15px",
												color: "#0f172a"
											},
											children: emp.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "11px",
												color: "var(--muted)",
												background: "#f1f5f9",
												padding: "1px 6px",
												borderRadius: "4px"
											},
											children: emp.employeeId
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "12px",
											color: "#64748b",
											marginTop: "2px"
										},
										children: [
											emp.designation || "Pending Designation",
											" · ",
											emp.department,
											" · ",
											emp.email
										]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "4px",
											background: "#ffedd5",
											color: "#9a3412",
											border: "1px solid #fed7aa",
											padding: "4px 10px",
											borderRadius: "12px",
											fontSize: "11px",
											fontWeight: 700
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 12 }), " Awaiting HR Approval"]
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									background: "#fff",
									border: "1px solid #f1f5f9",
									borderRadius: "8px",
									padding: "10px 14px",
									flexWrap: "wrap",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "12px",
										color: "#334155"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [uploadedDocs.length, " Documents Submitted"] }),
										uploadedDocs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												color: "#64748b",
												marginLeft: "6px"
											},
											children: [
												"(",
												uploadedDocs.slice(0, 3).join(", "),
												uploadedDocs.length > 3 ? ` +${uploadedDocs.length - 3} more` : "",
												")"
											]
										}),
										emp.onboardingSubmittedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "11px",
												color: "#94a3b8",
												marginTop: "2px"
											},
											children: ["Submitted on: ", new Date(emp.onboardingSubmittedAt).toLocaleString()]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										className: "ui-button secondary",
										href: workforcePath(`/people/${emp._id ?? emp.id}`),
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "6px",
											fontSize: "12px",
											padding: "6px 12px",
											textDecoration: "none"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 13 }), " Review Full Dossier"]
									}), hasPermission(user, "employees.write") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											onClick: () => {
												setRejectingEmp(emp);
												setRejectionReasonInput("");
											},
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: "6px",
												fontSize: "12px",
												padding: "6px 12px",
												borderColor: "#fca5a5",
												color: "#b91c1c",
												cursor: "pointer"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { size: 13 }), " Reject / Request Revision"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button primary",
											onClick: storeAction(async () => {
												const targetId = emp.id || emp._id || emp.employeeId;
												try {
													if (hrStore.approveOnboarding) await hrStore.approveOnboarding(targetId);
													else await hrStore.updateOnboardingDocs(targetId, {
														onboardingStatus: "verified",
														onboardingVerifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
														onboardingVerifiedBy: user?.name || "HR Lead"
													});
												} catch {
													const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {};
													for (const k of Object.keys(docs)) if (docs[k] && typeof docs[k] === "object") docs[k] = {
														...docs[k],
														status: "verified",
														verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
														verifiedBy: user?.name || "HR Lead"
													};
													await hrStore.updateOnboardingDocs(targetId, { onboardingDocs: docs }).catch(() => {});
												}
												hrStore.clearError?.();
												showFeedback(`Approved and verified all onboarding documents for ${emp.name}. Dossier is now marked verified.`);
											}),
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: "6px",
												fontSize: "12px",
												padding: "6px 14px",
												background: "var(--teal)",
												borderColor: "var(--teal)",
												color: "#fff",
												fontWeight: 600,
												cursor: "pointer"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }), " Quick Approve & Verify"]
										})]
									})]
								})]
							})]
						}, emp.id);
					})
				}),
				rejectingEmp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						position: "fixed",
						inset: 0,
						zIndex: 100005,
						background: "rgba(15, 23, 42, 0.75)",
						backdropFilter: "blur(4px)",
						display: "grid",
						placeItems: "center",
						padding: "20px"
					},
					onClick: () => setRejectingEmp(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: {
							width: "92%",
							maxWidth: "520px",
							padding: "24px",
							background: "#ffffff",
							borderRadius: "14px",
							boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
						},
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								marginBottom: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										width: "36px",
										height: "36px",
										borderRadius: "50%",
										background: "#fee2e2",
										color: "#ef4444",
										display: "grid",
										placeItems: "center"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { size: 20 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: 0,
										fontSize: "16px",
										fontWeight: 700,
										color: "#0f172a"
									},
									children: "Request Onboarding Revisions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									style: {
										margin: "2px 0 0",
										fontSize: "12px",
										color: "#64748b"
									},
									children: [
										"Employee: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: rejectingEmp.name }),
										" (",
										rejectingEmp.employeeId,
										")"
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setRejectingEmp(null),
								style: {
									background: "#f1f5f9",
									border: "1px solid #cbd5e1",
									borderRadius: "8px",
									cursor: "pointer"
								},
								children: "✕"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleRejectOnboarding,
							style: {
								display: "grid",
								gap: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: {
									display: "grid",
									gap: "6px",
									fontSize: "12px",
									fontWeight: 600
								},
								children: ["Specific Rejection / Revision Reason *", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 4,
									className: "ui-input",
									style: {
										width: "100%",
										resize: "vertical",
										fontFamily: "inherit"
									},
									value: rejectionReasonInput,
									onChange: (e) => setRejectionReasonInput(e.target.value),
									placeholder: "e.g. Aadhar card scan is missing back side. Please upload both sides in high resolution.",
									required: true,
									autoFocus: true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: "10px",
									marginTop: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: () => setRejectingEmp(null),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "ui-button primary",
									style: {
										background: "#dc2626",
										borderColor: "#dc2626",
										color: "#fff",
										fontWeight: 600
									},
									disabled: !rejectionReasonInput.trim(),
									children: "Confirm & Notify Employee"
								})]
							})]
						})]
					})
				})
			]
		}),
		activeTab === "onboarding" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "New Hires"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
						"Onboarding Tracker (",
						onboardingEmployees.length,
						" active)"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "info",
						children: "Workflow Active"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "foundation-copy",
					style: { margin: "10px 0 20px" },
					children: "Track every new hire’s readiness before their day 1. Check off completed items directly to advance their status."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gap: "16px"
					},
					children: onboardingEmployees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No active onboarding tasks",
						message: "All active employees have completed orientation."
					}) : onboardingEmployees.map((emp) => {
						const checklist = emp.onboardingChecklist || [];
						const completedCount = checklist.filter((i) => i.completed).length;
						const progressPct = checklist.length ? Math.round(completedCount / checklist.length * 100) : 100;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								border: "1px solid var(--line)",
								borderRadius: "10px",
								padding: "16px",
								background: "#fffefa"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
										name: emp.name,
										avatarUrl: emp.avatarUrl || emp.onboardingDocs?.passportPhoto?.url
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emp.name }),
										" •",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
											style: { color: "var(--muted)" },
											children: [
												emp.designation,
												" (",
												emp.department,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "10px",
												color: "var(--teal)",
												marginTop: "2px"
											},
											children: ["Joining Date: ", emp.joiningDate]
										})
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: { textAlign: "right" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StatusBadge, {
										tone: progressPct === 100 ? "info" : "warning",
										children: [
											completedCount,
											"/",
											checklist.length,
											" Completed (",
											progressPct,
											"%)"
										]
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "repeat(2, 1fr)",
									gap: "10px",
									marginTop: "12px"
								},
								children: checklist.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										fontSize: "11px",
										background: item.completed ? "#f0f8f5" : "#f7f6f2",
										padding: "8px 12px",
										borderRadius: "7px",
										cursor: "pointer"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: item.completed,
										onChange: storeAction(() => hrStore.toggleOnboardingItem(emp.id, item.key))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											textDecoration: item.completed ? "line-through" : "none",
											color: item.completed ? "var(--teal)" : "var(--ink)"
										},
										children: item.label
									})]
								}, item.key))
							})]
						}, emp.id);
					})
				})
			]
		}),
		activeTab === "exit" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Offboarding"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Exit Management & Departures" })] }), hasPermission(user, "employees.write") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setExitForm(defaultExitForm);
							setShowExitModal(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { size: 15 }), " Initiate Exit Process"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "foundation-copy",
					style: { margin: "10px 0 20px" },
					children: "Manage resignations, notice period commitments, handover task assignments, exit interviews, and clearance."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gap: "16px"
					},
					children: exitEmployees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No active exit processes",
						message: "Employees serving notice period will appear here."
					}) : exitEmployees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "16px",
							background: "#fffefa"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
										name: emp.name,
										avatarUrl: emp.avatarUrl || emp.onboardingDocs?.passportPhoto?.url
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emp.name }),
										" •",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
											style: { color: "var(--muted)" },
											children: [
												emp.designation,
												" (",
												emp.department,
												")"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "10px",
												color: "var(--coral)",
												marginTop: "2px"
											},
											children: [
												"Status: ",
												emp.status === "inactive" ? "Exited" : "Notice Period",
												" (Last Working Day: ",
												emp.exitDetails?.lastWorkingDay || "Not configured",
												")"
											]
										})
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										flexWrap: "wrap"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											tone: emp.status === "inactive" ? "danger" : "warning",
											children: emp.status === "inactive" ? "Exited / Inactive" : "Notice Period"
										}),
										emp.status !== "inactive" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "ui-button primary",
												style: {
													padding: "4px 10px",
													fontSize: "11px",
													display: "inline-flex",
													alignItems: "center",
													gap: "4px"
												},
												onClick: () => handleFinalizeExit(emp),
												title: "Complete offboarding and mark as Inactive",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { size: 12 }), " Finalize Departure"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button secondary",
												style: {
													padding: "4px 10px",
													fontSize: "11px"
												},
												onClick: () => {
													setExitForm({
														...defaultExitForm,
														employeeId: emp.id,
														reason: emp.exitDetails?.reason || defaultExitForm.reason,
														noticePeriodDays: String(emp.exitDetails?.noticePeriodDays !== void 0 && emp.exitDetails?.noticePeriodDays !== null ? emp.exitDetails.noticePeriodDays : "0"),
														lastWorkingDay: emp.exitDetails?.lastWorkingDay || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
														handoverAssignee: emp.exitDetails?.handoverAssignee || "",
														comments: emp.exitDetails?.comments || ""
													});
													setShowExitModal(true);
												},
												title: "Edit exit details, notice period or last working day",
												children: "Edit Details"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button secondary",
												style: {
													padding: "4px 10px",
													fontSize: "11px"
												},
												onClick: () => handleCancelExit(emp),
												title: "Cancel exit and reinstate as Active",
												children: "Cancel Exit"
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn delete",
											onClick: () => setEmployeeToDelete(emp),
											title: "Permanently delete employee and linked records",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), " Delete"]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#f8f7f2",
									padding: "12px 14px",
									borderRadius: "8px",
									fontSize: "11px",
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
									gap: "12px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "9px",
											textTransform: "uppercase",
											letterSpacing: "0.04em"
										},
										children: "Reason"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											color: "var(--ink)",
											marginTop: "2px"
										},
										children: emp.exitDetails?.reason || "Resignation"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "9px",
											textTransform: "uppercase",
											letterSpacing: "0.04em"
										},
										children: "Reporting Manager"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											color: "var(--ink)",
											marginTop: "2px"
										},
										children: emp.managerName || emp.reportingManager || "Not assigned"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "9px",
											textTransform: "uppercase",
											letterSpacing: "0.04em"
										},
										children: "Handover Assignee"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											color: "var(--ink)",
											marginTop: "2px"
										},
										children: emp.exitDetails?.handoverAssignee || "Unassigned"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "9px",
											textTransform: "uppercase",
											letterSpacing: "0.04em"
										},
										children: "Notice Period"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											color: "var(--ink)",
											marginTop: "2px"
										},
										children: emp.exitDetails?.noticePeriodDays !== void 0 && emp.exitDetails?.noticePeriodDays !== null ? Number(emp.exitDetails.noticePeriodDays) === 0 ? "Immediate / 0 Days" : `${emp.exitDetails.noticePeriodDays} Days` : "30 Days"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "9px",
											textTransform: "uppercase",
											letterSpacing: "0.04em"
										},
										children: "Last Working Day"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											color: "var(--coral)",
											marginTop: "2px"
										},
										children: emp.exitDetails?.lastWorkingDay || emp.employmentEndDate?.slice(0, 10) || "Not configured"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "9px",
											textTransform: "uppercase",
											letterSpacing: "0.04em"
										},
										children: "Exit Clearance"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											color: "var(--teal)",
											marginTop: "2px"
										},
										children: emp.offboardingChecklist?.length ? `${emp.offboardingChecklist.filter((item) => item.completed).length}/${emp.offboardingChecklist.length} completed (${Math.round(emp.offboardingChecklist.filter((item) => item.completed).length / emp.offboardingChecklist.length * 100)}%)` : "Clearance active"
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									marginTop: "14px",
									paddingTop: "12px",
									borderTop: "1px dashed var(--line)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "var(--ink)"
										},
										children: "Exit Clearance Tasks"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											color: "var(--muted)",
											fontSize: "10px"
										},
										children: "Click tasks to record completed department handovers directly in database"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
										gap: "8px"
									},
									children: (emp.offboardingChecklist && emp.offboardingChecklist.length > 0 ? emp.offboardingChecklist : [
										{
											key: "knowledge_transfer",
											label: "Handover & Knowledge Transfer Completed"
										},
										{
											key: "assets_returned",
											label: "Company Assets & Laptop Returned"
										},
										{
											key: "id_badge_access",
											label: "ID Badge & Building Access Revoked"
										},
										{
											key: "system_deprovisioning",
											label: "Email & System Accounts Revoked"
										},
										{
											key: "exit_interview",
											label: "HR Exit Interview Conducted"
										},
										{
											key: "fnf_settlement",
											label: "Final Settlement (FnF) Calculated"
										}
									]).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											display: "flex",
											alignItems: "flex-start",
											gap: "8px",
											fontSize: "11px",
											background: item.completed ? "#f0fdf4" : "#f8fafc",
											border: `1px solid ${item.completed ? "#bbf7d0" : "var(--line)"}`,
											padding: "8px 10px",
											borderRadius: "6px",
											cursor: "pointer",
											transition: "all 0.15s ease"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: Boolean(item.completed),
											onChange: storeAction(async () => {
												await hrStore.toggleOffboardingItem(emp.id, item.key);
												showFeedback(`Updated clearance for "${item.label}" in database.`);
											}),
											style: { marginTop: "2px" }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												flexDirection: "column",
												flex: 1
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													textDecoration: item.completed ? "line-through" : "none",
													color: item.completed ? "#15803d" : "var(--ink)",
													fontWeight: item.completed ? 600 : 400
												},
												children: item.label
											}), item.completed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													fontSize: "9px",
													color: "#16a34a",
													marginTop: "2px"
												},
												children: [
													"✓ Recorded by ",
													item.completedBy || "HR",
													" ",
													item.completedAt ? `• ${new Date(item.completedAt).toLocaleDateString()}` : ""
												]
											})]
										})]
									}, item.key))
								})]
							})
						]
					}, emp.id))
				})
			]
		}),
		showAddModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setShowAddModal(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				style: {
					width: "min(100%, 720px)",
					maxHeight: "92vh",
					display: "flex",
					flexDirection: "column"
				},
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-header",
						style: {
							padding: "16px 20px",
							borderBottom: "1px solid var(--border)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								margin: 0,
								fontSize: "18px",
								color: "#0f172a"
							},
							children: "Add New Employee Profile"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							style: {
								color: "var(--muted)",
								fontSize: "11px",
								marginTop: "2px",
								display: "block"
							},
							children: "Official Employment & Payroll Setup. Personal records, education certificates, and family information are submitted directly by the employee in the Onboarding Portal."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "icon-button",
							onClick: () => setShowAddModal(false),
							children: "✕"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							gap: "4px",
							background: "#f1f5f9",
							padding: "6px 16px",
							borderBottom: "1px solid var(--border)"
						},
						children: [{
							key: "basic",
							label: "1. Employment & Role"
						}, {
							key: "bank",
							label: "2. Banking & Statutory Payroll"
						}].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setModalActiveTab(t.key),
							style: {
								padding: "7px 16px",
								fontSize: "12px",
								fontWeight: modalActiveTab === t.key ? 700 : 500,
								borderRadius: "6px",
								border: 0,
								background: modalActiveTab === t.key ? "#fff" : "transparent",
								color: modalActiveTab === t.key ? "var(--teal, #0284c7)" : "#64748b",
								boxShadow: modalActiveTab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
								cursor: "pointer",
								whiteSpace: "nowrap"
							},
							children: t.label
						}, t.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						noValidate: true,
						onSubmit: handleCreateEmployee,
						style: {
							display: "flex",
							flexDirection: "column",
							overflow: "hidden"
						},
						children: [
							modalError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "alert",
								style: {
									margin: "12px 20px 0",
									padding: "10px 12px",
									background: "#fef2f2",
									border: "1px solid #fecaca",
									color: "#b91c1c",
									borderRadius: "6px",
									fontSize: "13px"
								},
								children: modalError
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hr-modal-body",
								style: {
									flex: 1,
									overflowY: "auto",
									padding: "20px"
								},
								children: [modalActiveTab === "basic" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "form-section-title",
										children: "Official Employment & Contact Information"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Employee Code (ETS ID)",
											hint: "Auto-generated sequentially. Locked permanently once created.",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													placeholder: "e.g. ETS21207",
													value: newEmpForm.employeeId,
													onChange: (e) => setNewEmpForm({
														...newEmpForm,
														employeeId: e.target.value.toUpperCase()
													}),
													style: {
														fontWeight: 600,
														letterSpacing: "0.04em"
													}
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10px",
														color: "var(--teal)",
														fontWeight: 700,
														background: "rgba(0,110,111,0.1)",
														padding: "5px 8px",
														borderRadius: "4px",
														whiteSpace: "nowrap"
													},
													children: "Auto ETS"
												})]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Full Name",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												required: true,
												placeholder: "e.g. Rachel Adams",
												value: newEmpForm.name,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													name: e.target.value
												})
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px",
											marginTop: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Corporate Work Email",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "email",
												required: true,
												placeholder: "rachel.adams@edufyi.local",
												value: newEmpForm.email,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													email: e.target.value
												})
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Work Phone Number",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "tel",
												required: true,
												placeholder: "+91 98765 43210",
												value: newEmpForm.phone,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													phone: e.target.value
												})
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px",
											marginTop: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Joining Date",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "date",
												required: true,
												value: newEmpForm.joiningDate,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													joiningDate: e.target.value
												})
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Date of Birth (DOB)",
											hint: "Statutory identification record (as per official identity documents).",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "date",
												value: newEmpForm.dob || "",
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													dob: e.target.value
												})
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: { marginTop: "12px" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Initial Login Password",
											hint: "Auto-generated credentials for first sign-in (min 8 chars).",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													required: true,
													minLength: 8,
													placeholder: "e.g. Edufyi@4821",
													value: newEmpForm.password || "",
													onChange: (e) => setNewEmpForm({
														...newEmpForm,
														password: e.target.value
													}),
													style: {
														fontWeight: 600,
														letterSpacing: "0.04em"
													}
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: "ui-button secondary",
													style: {
														fontSize: "11px",
														padding: "6px 10px",
														whiteSpace: "nowrap"
													},
													onClick: () => setNewEmpForm({
														...newEmpForm,
														password: generateAutoPassword()
													}),
													children: "Auto"
												})]
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "form-section-title",
										style: { marginTop: "18px" },
										children: "Role & Organization"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Role Level",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: newEmpForm.role,
												onChange: (e) => {
													const newRole = e.target.value;
													const rec = getRecommendedRoleConfig(newRole, newEmpForm.department);
													const shouldSwitchDept = [
														"director",
														"admin",
														"hr"
													].includes(newRole) || !newEmpForm.department || newRole === "director" && newEmpForm.department !== "Executive";
													const isInternRole = newRole === "intern" || newRole.includes("intern");
													setNewEmpForm({
														...newEmpForm,
														role: newRole,
														employmentType: isInternRole ? "intern" : newEmpForm.employmentType === "intern" ? "full_time" : newEmpForm.employmentType,
														department: shouldSwitchDept ? rec.department : newEmpForm.department,
														designation: rec.designation
													});
												},
												children: allRoleOptions.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: r.id,
													children: r.name
												}, r.id))
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Department",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: newEmpForm.department,
												onChange: (e) => {
													const newDept = e.target.value;
													const rec = getRecommendedRoleConfig(newEmpForm.role, newDept);
													setNewEmpForm({
														...newEmpForm,
														department: newDept,
														designation: rec.designation
													});
												},
												children: DEPARTMENTS.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: dept,
													children: dept
												}, dept))
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px",
											marginTop: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Assigned Campus",
											hint: "Office campus for geofence & attendance",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: newEmpForm.campus || "Ignite Campus",
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													campus: e.target.value
												}),
												children: CAMPUSES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: c,
													children: c
												}, c))
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Employment Type",
											hint: "Determines leave quota policy (Full-Time: 2 days, Intern: 1 day)",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: newEmpForm.employmentType || "full_time",
												onChange: (e) => {
													const et = e.target.value;
													setNewEmpForm({
														...newEmpForm,
														employmentType: et,
														role: et === "intern" && newEmpForm.role === "employee" ? "intern" : newEmpForm.role
													});
												},
												children: EMPLOYMENT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: t.id,
													children: t.label
												}, t.id))
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px",
											marginTop: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
											label: "Designation",
											required: true,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												required: true,
												list: "new-emp-designations",
												placeholder: "e.g. Managing Director",
												value: newEmpForm.designation,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													designation: e.target.value
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
												id: "new-emp-designations",
												children: getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department).suggestions.map((sug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sug }, sug))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Reporting Manager",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: newEmpForm.managerId,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													managerId: e.target.value
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "No reporting manager"
												}), availableManagers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: m.id,
													children: [
														m.displayName || m.name,
														" (",
														m.designation || m.role,
														")"
													]
												}, m.id))]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px",
											marginTop: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Assigned Team / Squad",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: newEmpForm.teamId || newEmpForm.squadId || "",
												onChange: (e) => {
													const selectedTeamId = e.target.value;
													const teamObj = hrStore.getTeam(selectedTeamId);
													if (teamObj) {
														const targetMgr = allEmployees.find((m) => String(m.id || m._id) === String(teamObj.managerId) || String(m.employeeId).toUpperCase() === String(teamObj.managerId).toUpperCase());
														const targetTL = allEmployees.find((m) => String(m.id || m._id) === String(teamObj.teamLeadId) || String(m.employeeId).toUpperCase() === String(teamObj.teamLeadId).toUpperCase());
														setNewEmpForm({
															...newEmpForm,
															teamId: teamObj.id,
															team: teamObj.name,
															squadId: teamObj.id,
															squad: teamObj.name,
															department: teamObj.department || newEmpForm.department,
															managerId: targetMgr ? targetMgr.id || targetMgr._id || targetMgr.employeeId : newEmpForm.managerId || "",
															managerName: targetMgr ? targetMgr.displayName || targetMgr.name : newEmpForm.managerName || "",
															teamLeadId: targetTL ? targetTL.id || targetTL._id || targetTL.employeeId : newEmpForm.teamLeadId || "",
															teamLeadName: targetTL ? targetTL.displayName || targetTL.name : newEmpForm.teamLeadName || ""
														});
													} else setNewEmpForm({
														...newEmpForm,
														teamId: "",
														team: "",
														squadId: "",
														squad: ""
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "-- No Specific Team / General --"
												}), hrStore.getTeams().map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: t.id,
													children: [
														t.name,
														" (",
														t.department,
														" • TL: ",
														t.teamLeadName || "Unassigned",
														")"
													]
												}, t.id))]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Team Leader (TL)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: newEmpForm.teamLeadId || "",
												onChange: (e) => {
													const tl = hrStore.getTeamLeads().find((x) => String(x.id || x._id || x.employeeId) === String(e.target.value));
													setNewEmpForm({
														...newEmpForm,
														teamLeadId: e.target.value,
														teamLeadName: tl ? tl.displayName || tl.name : ""
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "-- No Team Leader Assigned --"
												}), hrStore.getTeamLeads().map((tl) => {
													const tlId = tl.id || tl._id || tl.employeeId;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
														value: tlId,
														children: [
															tl.displayName || tl.name,
															" (",
															tl.team ? `Team ${tl.team}` : tl.designation || tl.role,
															")"
														]
													}, tlId);
												})]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: { marginTop: "4px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "10.5px",
												color: "var(--muted)",
												fontWeight: 600,
												display: "block",
												marginBottom: "4px"
											},
											children: [
												"Recommended for ",
												getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department).roleLabel,
												":"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												display: "flex",
												flexWrap: "wrap",
												gap: "4px"
											},
											children: getRecommendedRoleConfig(newEmpForm.role, newEmpForm.department).suggestions.map((sug) => {
												const isSelected = (newEmpForm.designation || "").trim().toLowerCase() === sug.trim().toLowerCase();
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => setNewEmpForm({
														...newEmpForm,
														designation: sug
													}),
													style: {
														background: isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.08)",
														color: isSelected ? "#ffffff" : "var(--primary)",
														border: "1px solid " + (isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.2)"),
														borderRadius: "12px",
														padding: "2px 8px",
														fontSize: "10.5px",
														fontWeight: 600,
														cursor: "pointer"
													},
													children: [isSelected ? "✓ " : "", sug]
												}, sug);
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalaryBreakdownFields, {
										salary: newEmpForm.salary,
										annualCtc: newEmpForm.salary,
										salaryStructure: newEmpForm.salaryStructure,
										onChange: ({ salary, annualCtc, salaryStructure }) => {
											setNewEmpForm({
												...newEmpForm,
												salary: annualCtc !== void 0 ? annualCtc : salary,
												salaryStructure
											});
										},
										sectionTitle: "Compensation & Salary Breakdown (₹ INR)"
									})
								] }), modalActiveTab === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "form-section-title",
										children: "Official Bank Account for Payroll Transfer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Bank Name",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: newEmpForm.bankName,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													bankName: e.target.value
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "Select Bank"
												}), BANKS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: b,
													children: b
												}, b))]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Bank Account Number",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "e.g. 5010049281923",
												value: newEmpForm.accountNumber,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													accountNumber: e.target.value
												})
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr",
											gap: "12px",
											marginTop: "12px"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "IFSC Code",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "e.g. HDFC0001234",
												value: newEmpForm.ifscCode,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													ifscCode: e.target.value.toUpperCase()
												})
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "form-section-title",
										style: { marginTop: "20px" },
										children: "Statutory Tax & PF Identifiers (HR Payroll Setup)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "PAN Card Number (TDS)",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "10-digit PAN (e.g. ABCDE1234F)",
												value: newEmpForm.panTaxId,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													panTaxId: e.target.value.toUpperCase()
												})
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Existing UAN / EPF Number",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "12-digit UAN (e.g. 100902847123)",
												value: newEmpForm.uanNumber,
												onChange: (e) => setNewEmpForm({
													...newEmpForm,
													uanNumber: e.target.value,
													hasExistingUan: Boolean(e.target.value)
												})
											})
										}) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											marginTop: "16px",
											padding: "12px 14px",
											background: "#f8fafc",
											border: "1px solid #e2e8f0",
											borderRadius: "8px",
											fontSize: "11px",
											color: "#64748b"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Employee Onboarding Self-Service:" }), " Educational degrees, marksheets, personal Aadhar verification, and family details will be uploaded directly by the employee in their dedicated onboarding dashboard."]
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hr-modal-footer",
								style: {
									padding: "14px 20px",
									borderTop: "1px solid var(--border)",
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "6px"
									},
									children: [modalActiveTab === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "secondary",
										onClick: () => setModalActiveTab("basic"),
										children: "← Previous: Employment & Role"
									}), modalActiveTab === "basic" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "secondary",
										onClick: () => setModalActiveTab("bank"),
										children: "Next: Banking & Statutory →"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "secondary",
										onClick: () => setShowAddModal(false),
										children: "Cancel"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										children: "Complete & Onboard Employee"
									})]
								})]
							})
						]
					})
				]
			})
		}),
		createdCredentials && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setCreatedCredentials(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				style: {
					width: "min(100%, 540px)",
					padding: "0",
					overflow: "hidden"
				},
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "20px 24px",
						background: "var(--teal, #006E6F)",
						color: "#fff"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									width: "36px",
									height: "36px",
									borderRadius: "50%",
									background: "rgba(255,255,255,0.2)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									size: 20,
									color: "#fff"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: 0,
									fontSize: "17px",
									fontWeight: 700,
									color: "#fff"
								},
								children: "Employee Login Credentials"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: "2px 0 0",
									fontSize: "12px",
									opacity: .9
								},
								children: "Login account provisioned & ready for employee sign-in"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCreatedCredentials(null),
							style: {
								background: "transparent",
								border: "none",
								color: "#fff",
								fontSize: "20px",
								cursor: "pointer",
								opacity: .8
							},
							children: "✕"
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { padding: "24px" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								fontSize: "13px",
								color: "#475569",
								marginBottom: "16px",
								lineHeight: 1.5
							},
							children: [
								"Share these official login credentials with ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: createdCredentials.name }),
								" so they can log in to the employee portal."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#f8fafc",
								border: "1px solid #e2e8f0",
								borderRadius: "10px",
								padding: "16px",
								display: "grid",
								gap: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderBottom: "1px solid #edf2f7",
										paddingBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: "#64748b",
											fontWeight: 500
										},
										children: "Full Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "13px",
											color: "#0f172a",
											fontWeight: 700
										},
										children: createdCredentials.name
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderBottom: "1px solid #edf2f7",
										paddingBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: "#64748b",
											fontWeight: 500
										},
										children: "Work Email (Login ID)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "13px",
											color: "#0f172a",
											fontWeight: 700
										},
										children: createdCredentials.email
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderBottom: "1px solid #edf2f7",
										paddingBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: "#64748b",
											fontWeight: 500
										},
										children: "Employee Code"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										style: {
											background: "#e0f2fe",
											color: "#0369a1",
											padding: "3px 8px",
											borderRadius: "4px",
											fontWeight: 700,
											fontSize: "12.5px"
										},
										children: createdCredentials.employeeId
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderBottom: "1px solid #edf2f7",
										paddingBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: "#64748b",
											fontWeight: 500
										},
										children: "Assigned Role"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											textTransform: "capitalize",
											fontWeight: 600,
											color: "#0f172a"
										},
										children: createdCredentials.role
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderBottom: "1px solid #edf2f7",
										paddingBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: "#64748b",
											fontWeight: 500
										},
										children: "Login Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										style: {
											background: "#fff1f2",
											color: "#e11d48",
											border: "1px solid #fecdd3",
											padding: "4px 10px",
											borderRadius: "6px",
											fontWeight: 700,
											fontSize: "14px",
											letterSpacing: "0.04em"
										},
										children: createdCredentials.password
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: "#64748b",
											fontWeight: 500
										},
										children: "Login Portal URL"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: `${window.location.origin}/#/${createdCredentials.role === "admin" ? "admin/login" : createdCredentials.role === "hr" ? "hr/login" : "employee/login"}`,
										target: "_blank",
										rel: "noreferrer",
										style: {
											fontSize: "12px",
											color: "var(--teal, #006E6F)",
											fontWeight: 600,
											textDecoration: "none",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: ["Open Login Portal ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
									})]
								})
							]
						}),
						copySuccess && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: "14px",
								padding: "10px 14px",
								background: "#e6fffa",
								border: "1px solid #b2f5ea",
								borderRadius: "8px",
								color: "#006E6F",
								fontSize: "12.5px",
								fontWeight: 600,
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), " All login credentials copied to clipboard! Ready to share with employee."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								marginTop: "20px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								flexWrap: "wrap",
								gap: "10px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button primary",
										onClick: async () => {
											const text = formatCredentialsShareText({
												name: createdCredentials.name,
												email: createdCredentials.email,
												employeeId: createdCredentials.employeeId,
												password: createdCredentials.password,
												role: createdCredentials.role,
												origin: window.location.origin
											});
											if (await copyTextToClipboard(text)) {
												setCopySuccess(true);
												setTimeout(() => setCopySuccess(false), 4500);
											} else window.prompt("Copy credentials:", text);
										},
										children: [copySuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											size: 14,
											style: { marginRight: "6px" }
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
											size: 14,
											style: { marginRight: "6px" }
										}), copySuccess ? "Copied to Clipboard!" : "Copy All Login Details"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button secondary",
										disabled: sendingEmail,
										onClick: async () => {
											try {
												setSendingEmail(true);
												setEmailStatus(null);
												setEmailMessage("");
												const rolePath = createdCredentials.role === "admin" ? "admin/login" : createdCredentials.role === "hr" ? "hr/login" : "employee/login";
												const portalUrl = `${window.location.origin}/#/${rolePath}`;
												const res = await apiClient.post("/mail/welcome", {
													employee: {
														name: createdCredentials.name,
														email: createdCredentials.email,
														employeeId: createdCredentials.employeeId,
														designation: createdCredentials.designation || "Pending Designation",
														department: "Workforce"
													},
													temporaryPassword: createdCredentials.password,
													loginUrl: portalUrl
												});
												setEmailStatus("success");
												setEmailMessage(res?.data?.message || `Credentials email successfully dispatched to ${createdCredentials.email}!`);
											} catch (err) {
												console.error("Failed to dispatch welcome email:", err);
												setEmailStatus("error");
												setEmailMessage(err?.message || "Failed to dispatch email. Check SMTP settings.");
											} finally {
												setSendingEmail(false);
											}
										},
										children: [sendingEmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
											size: 14,
											className: "spinning",
											style: { marginRight: "6px" }
										}) : emailStatus === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											size: 14,
											style: {
												marginRight: "6px",
												color: "#059669"
											}
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
											size: 14,
											style: { marginRight: "6px" }
										}), sendingEmail ? "Sending Email..." : emailStatus === "success" ? "Email Sent (Resend)" : "Send via Email"]
									})]
								}),
								emailMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "10px 14px",
										borderRadius: "8px",
										fontSize: "12px",
										fontWeight: 500,
										marginTop: "12px",
										background: emailStatus === "success" ? "#ECFDF5" : "#FEF2F2",
										color: emailStatus === "success" ? "#065F46" : "#991B1B",
										border: `1px solid ${emailStatus === "success" ? "#A7F3D0" : "#FECACA"}`,
										display: "flex",
										alignItems: "center",
										gap: "8px"
									},
									children: [emailStatus === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: emailMessage })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									onClick: () => setCreatedCredentials(null),
									children: "Done"
								})
							]
						})
					]
				})]
			})
		}),
		editingEmployee && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setEditingEmployee(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				style: { width: "min(100%, 680px)" },
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: ["Edit Employee: ", editingEmployee.name] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						style: {
							color: "var(--muted)",
							fontSize: "11px"
						},
						children: "Update workforce profile, designation, CTC compensation, or bank details."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: () => setEditingEmployee(null),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					noValidate: true,
					onSubmit: handleUpdateEmployee,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hr-modal-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "form-section-title",
									children: "Official Employment & Contact Info"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Employee Code",
										required: true,
										hint: "Unique workforce code used for login, attendance, and payroll.",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											required: true,
											value: editingEmployee.employeeId || "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												employeeId: e.target.value.toUpperCase()
											}),
											placeholder: "e.g. ETS26210",
											style: {
												fontWeight: 600,
												textTransform: "uppercase"
											}
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Full Name",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											required: true,
											value: editingEmployee.name || "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												name: e.target.value
											})
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Work Email",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "email",
											required: true,
											value: editingEmployee.email || "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												email: e.target.value
											})
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Phone Number",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "tel",
											required: true,
											value: editingEmployee.phone || "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												phone: e.target.value
											})
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Date of Birth (DOB)",
										hint: "Statutory identification record (as per official identity documents).",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "date",
											value: editingEmployee.dob ? String(editingEmployee.dob).slice(0, 10) : "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												dob: e.target.value
											})
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Status",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: editingEmployee.status || "active",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												status: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "active",
													children: "Active"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "invited",
													children: "Invited"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "inactive",
													children: "Inactive"
												})
											]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "form-section-title",
									children: "Role & Organization"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Role Level",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: editingEmployee.role || "employee",
											onChange: (e) => {
												const newRole = e.target.value;
												const rec = getRecommendedRoleConfig(newRole, editingEmployee.department);
												const shouldSwitchDept = [
													"director",
													"admin",
													"hr"
												].includes(newRole) || !editingEmployee.department || newRole === "director" && editingEmployee.department !== "Executive";
												const isInternRole = newRole === "intern" || newRole.includes("intern");
												setEditingEmployee({
													...editingEmployee,
													role: newRole,
													employmentType: isInternRole ? "intern" : editingEmployee.employmentType === "intern" ? "full_time" : editingEmployee.employmentType,
													department: shouldSwitchDept ? rec.department : editingEmployee.department,
													designation: rec.designation
												});
											},
											children: allRoleOptions.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: r.id,
												children: r.name
											}, r.id))
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Department",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: editingEmployee.department || "Executive",
											onChange: (e) => {
												const newDept = e.target.value;
												const rec = getRecommendedRoleConfig(editingEmployee.role, newDept);
												setEditingEmployee({
													...editingEmployee,
													department: newDept,
													designation: rec.designation
												});
											},
											children: DEPARTMENTS.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: dept,
												children: dept
											}, dept))
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Assigned Campus",
										hint: "Office campus for geofence & attendance",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: editingEmployee.campus || "Ignite Campus",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												campus: e.target.value
											}),
											children: CAMPUSES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: c,
												children: c
											}, c))
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Employment Type",
										hint: "Determines leave quota policy (Full-Time: 2 days, Intern: 1 day)",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: editingEmployee.employmentType || "full_time",
											onChange: (e) => {
												const et = e.target.value;
												setEditingEmployee({
													...editingEmployee,
													employmentType: et,
													role: et === "intern" && editingEmployee.role === "employee" ? "intern" : editingEmployee.role
												});
											},
											children: EMPLOYMENT_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: t.id,
												children: t.label
											}, t.id))
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
										label: "Designation",
										required: true,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											required: true,
											list: "edit-emp-designations",
											placeholder: "e.g. Managing Director",
											value: editingEmployee.designation || "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												designation: e.target.value
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
											id: "edit-emp-designations",
											children: getRecommendedRoleConfig(editingEmployee.role, editingEmployee.department).suggestions.map((sug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sug }, sug))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Reporting Manager",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: editingEmployee.managerId || "",
											onChange: (e) => {
												const m = allEmployees.find((x) => x.id === e.target.value);
												setEditingEmployee({
													...editingEmployee,
													managerId: e.target.value,
													managerName: m ? m.name : editingEmployee.managerName
												});
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "No reporting manager"
											}), availableManagers.filter((manager) => manager.id !== editingEmployee.id).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: m.id,
												children: [
													m.name,
													" (",
													m.designation,
													")"
												]
											}, m.id))]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px",
										marginTop: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Assigned Team / Squad",
										children: (() => {
											const allTeams = hrStore.getTeams();
											const currentVal = editingEmployee.teamId || editingEmployee.squadId || "";
											const matchingTeam = allTeams.find((t) => currentVal && (t.id === currentVal || t.slug === currentVal) || editingEmployee.team && t.name.toLowerCase() === editingEmployee.team.toLowerCase() || editingEmployee.squad && t.name.toLowerCase() === editingEmployee.squad.toLowerCase());
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: matchingTeam ? matchingTeam.id : currentVal,
												onChange: (e) => {
													const selectedTeamId = e.target.value;
													const teamObj = hrStore.getTeam(selectedTeamId);
													if (teamObj) {
														const targetMgr = allEmployees.find((m) => String(m.id || m._id) === String(teamObj.managerId) || String(m.employeeId).toUpperCase() === String(teamObj.managerId).toUpperCase());
														const targetTL = allEmployees.find((m) => String(m.id || m._id) === String(teamObj.teamLeadId) || String(m.employeeId).toUpperCase() === String(teamObj.teamLeadId).toUpperCase());
														setEditingEmployee({
															...editingEmployee,
															teamId: teamObj.id,
															team: teamObj.name,
															squadId: teamObj.id,
															squad: teamObj.name,
															department: teamObj.department || editingEmployee.department,
															managerId: targetMgr ? targetMgr.id || targetMgr._id || targetMgr.employeeId : editingEmployee.managerId || null,
															managerName: targetMgr ? targetMgr.displayName || targetMgr.name : editingEmployee.managerName || "",
															teamLeadId: targetTL ? targetTL.id || targetTL._id || targetTL.employeeId : editingEmployee.teamLeadId || "",
															teamLeadName: targetTL ? targetTL.displayName || targetTL.name : editingEmployee.teamLeadName || ""
														});
													} else setEditingEmployee({
														...editingEmployee,
														teamId: "",
														team: "",
														squadId: "",
														squad: ""
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "-- No Specific Team / General --"
												}), allTeams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: t.id,
													children: [
														t.name,
														" (",
														t.department,
														" • TL: ",
														t.teamLeadName || "Unassigned",
														")"
													]
												}, t.id))]
											});
										})()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Team Leader (TL)",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: editingEmployee.teamLeadId || "",
											onChange: (e) => {
												const tl = hrStore.getTeamLeads().find((x) => String(x.id || x._id || x.employeeId) === String(e.target.value));
												setEditingEmployee({
													...editingEmployee,
													teamLeadId: e.target.value,
													teamLeadName: tl ? tl.displayName || tl.name : ""
												});
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "-- No Team Leader Assigned --"
											}), hrStore.getTeamLeads().filter((tl) => String(tl.id || tl._id || tl.employeeId) !== String(editingEmployee.id || editingEmployee._id || editingEmployee.employeeId)).map((tl) => {
												const tlId = tl.id || tl._id || tl.employeeId;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: tlId,
													children: [
														tl.displayName || tl.name,
														" (",
														tl.team ? `Team ${tl.team}` : tl.designation || tl.role,
														")"
													]
												}, tlId);
											})]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { marginTop: "4px" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											fontWeight: 600,
											display: "block",
											marginBottom: "4px"
										},
										children: [
											"Recommended for ",
											getRecommendedRoleConfig(editingEmployee.role, editingEmployee.department).roleLabel,
											":"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											display: "flex",
											flexWrap: "wrap",
											gap: "4px"
										},
										children: getRecommendedRoleConfig(editingEmployee.role, editingEmployee.department).suggestions.map((sug) => {
											const isSelected = (editingEmployee.designation || "").trim().toLowerCase() === sug.trim().toLowerCase();
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setEditingEmployee({
													...editingEmployee,
													designation: sug
												}),
												style: {
													background: isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.08)",
													color: isSelected ? "#ffffff" : "var(--primary)",
													border: "1px solid " + (isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.2)"),
													borderRadius: "12px",
													padding: "2px 8px",
													fontSize: "10.5px",
													fontWeight: 600,
													cursor: "pointer"
												},
												children: [isSelected ? "✓ " : "", sug]
											}, sug);
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalaryBreakdownFields, {
									salary: editingEmployee.salary,
									annualCtc: editingEmployee.salary,
									salaryStructure: editingEmployee.salaryStructure,
									onChange: ({ salary, annualCtc, salaryStructure }) => {
										setEditingEmployee({
											...editingEmployee,
											salary: annualCtc !== void 0 ? annualCtc : salary,
											salaryStructure
										});
									},
									sectionTitle: "Compensation & Salary Breakdown (₹ INR)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "form-section-title",
									children: "Bank & Statutory Information"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Bank Name",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: editingEmployee.bankName || "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												bankName: e.target.value
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Not configured"
											}), BANKS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: b,
												children: b
											}, b))]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Bank Account Number",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											value: editingEmployee.accountNumber || "",
											onChange: (e) => setEditingEmployee({
												...editingEmployee,
												accountNumber: e.target.value
											})
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr",
										gap: "12px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "IFSC Code",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												value: editingEmployee.ifscCode || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													ifscCode: e.target.value.toUpperCase()
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "PAN Card Number",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												value: editingEmployee.panTaxId || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													panTaxId: e.target.value.toUpperCase()
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "UAN / PF Number",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												value: editingEmployee.uanNumber || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													uanNumber: e.target.value
												})
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "form-section-title",
									style: { marginTop: "16px" },
									children: "Emergency & Family Contacts"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
										gap: "12px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Emergency Contact Name",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "e.g. Rajesh Kumar",
												value: editingEmployee.emergencyContactName || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													emergencyContactName: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Relationship",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "e.g. Brother, Father, Spouse",
												value: editingEmployee.emergencyContactRelationship || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													emergencyContactRelationship: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Emergency Contact Phone",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "tel",
												inputMode: "tel",
												placeholder: "e.g. +91 98765 43210 (Digits only)",
												value: editingEmployee.emergencyContactPhone || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													emergencyContactPhone: e.target.value.replace(/[^0-9+\s\-()]/g, "")
												})
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
										gap: "12px",
										marginTop: "10px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Father's Name",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "Father's Name",
												value: editingEmployee.fatherName || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													fatherName: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Mother's Name",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "text",
												placeholder: "Mother's Name",
												value: editingEmployee.motherName || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													motherName: e.target.value
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Parents' Phone",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "tel",
												inputMode: "tel",
												placeholder: "e.g. +91 98765 43210 (Digits only)",
												value: editingEmployee.parentPhone || "",
												onChange: (e) => setEditingEmployee({
													...editingEmployee,
													parentPhone: e.target.value.replace(/[^0-9+\s\-()]/g, "")
												})
											})
										})
									]
								})
							]
						}),
						modalError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "alert",
							style: {
								margin: "0 20px 12px",
								padding: "10px 12px",
								background: "#fef2f2",
								border: "1px solid #fecaca",
								color: "#b91c1c",
								borderRadius: "6px",
								fontSize: "13px"
							},
							children: modalError
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hr-modal-footer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setEditingEmployee(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Save Changes"
							})]
						})
					]
				})]
			})
		}),
		showExitModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setShowExitModal(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Initiate Employee Offboarding" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: () => setShowExitModal(false),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleInitiateExit,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-body",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Select Resigning Employee",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: exitForm.employeeId,
									onChange: (e) => setExitForm({
										...exitForm,
										employeeId: e.target.value
									}),
									required: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "-- Choose employee --"
									}), allEmployees.filter((e) => e.status !== "notice" && e.status !== "inactive").map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: e.id,
										children: [
											e.name,
											" (",
											e.designation,
											" - ",
											e.department,
											")"
										]
									}, e.id))]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Primary Reason for Departure",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: exitForm.reason,
									onChange: (e) => setExitForm({
										...exitForm,
										reason: e.target.value
									}),
									required: true,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Career Growth & Better Opportunity",
											children: "Career Growth & Better Opportunity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Higher Education / Studies",
											children: "Higher Education / Studies"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Relocation / Moving Abroad",
											children: "Relocation / Moving Abroad"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Personal / Family Reasons",
											children: "Personal / Family Reasons"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Health / Medical",
											children: "Health / Medical"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Career Break / Sabbatical",
											children: "Career Break / Sabbatical"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Retirement",
											children: "Retirement"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Compensation & Benefits",
											children: "Compensation & Benefits"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Other",
											children: "Other"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Notice Period Duration",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: exitForm.noticePeriodDays ?? "30",
										onChange: (e) => {
											const days = Number(e.target.value) || 0;
											const d = /* @__PURE__ */ new Date();
											d.setDate(d.getDate() + days);
											setExitForm({
												...exitForm,
												noticePeriodDays: e.target.value,
												lastWorkingDay: d.toISOString().split("T")[0]
											});
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "0",
												children: "Immediate / None (0 days)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "15",
												children: "15 Days"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "30",
												children: "Standard 30 Days"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "60",
												children: "60 Days"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "90",
												children: "90 Days"
											})
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Last Working Day",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										required: true,
										value: exitForm.lastWorkingDay,
										onChange: (e) => setExitForm({
											...exitForm,
											lastWorkingDay: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Handover Assignee (Knowledge Transfer Lead)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: exitForm.handoverAssignee,
									onChange: (e) => setExitForm({
										...exitForm,
										handoverAssignee: e.target.value
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "-- Unassigned / To be decided --"
									}), allEmployees.filter((e) => e.id !== exitForm.employeeId && e.status === "active").map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: e.name,
										children: [
											e.name,
											" (",
											e.designation,
											" - ",
											e.department,
											")"
										]
									}, e.id))]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Handover Notes / Transition Summary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 2,
									placeholder: "Key deliverables, projects handover notes, or departure details...",
									value: exitForm.comments || "",
									onChange: (e) => setExitForm({
										...exitForm,
										comments: e.target.value
									})
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-footer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setShowExitModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Confirm & Start Handover"
						})]
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationDialog, {
			open: Boolean(employeeToDelete),
			title: `Remove Employee: ${employeeToDelete?.name}`,
			message: `Permanently delete ${employeeToDelete?.name} (${employeeToDelete?.employeeId})? This removes their profile, login, attendance, leave, and payroll records. This cannot be undone. Use Deactivate instead to keep history.`,
			confirmLabel: "Delete Permanently",
			isDestructive: true,
			onConfirm: handleDeleteEmployee,
			onCancel: () => setEmployeeToDelete(null)
		})
	] });
}
function EmployeeDetail({ id }) {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [employee, setEmployee] = (0, import_react.useState)(null);
	const [editingEmployee, setEditingEmployee] = (0, import_react.useState)(null);
	const [employeeToDelete, setEmployeeToDelete] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const unsub = hrStore.subscribe((state) => {
			setStoreState(state);
			const found = state.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
			setEmployee((prev) => prev && (prev.id === id || prev._id === id || prev.employeeId === id) && prev.onboardingDocs ? {
				...found,
				...prev
			} : found || null);
		});
		if (id) apiClient.get(`/employees/${id}`).then((res) => {
			if (res?.data) setEmployee((prev) => ({
				...prev || {},
				...res.data
			}));
		}).catch(() => {});
		return unsub;
	}, [id]);
	if (!employee) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatePanel, {
		title: storeState.dataReady ? "Employee not found" : "Loading employee",
		message: storeState.dataError || (storeState.dataReady ? "Return to People and select an existing employee." : "Fetching employee record."),
		tone: storeState.dataReady ? "error" : "loading"
	});
	const handleDeleteEmployee = storeAction(async () => {
		await hrStore.deleteEmployee(employee.id, {
			force: true,
			purge: true
		});
		setEmployeeToDelete(null);
		window.location.hash = workforcePath("/people");
	});
	const handleUpdateEmployee = storeAction(async (e) => {
		e.preventDefault();
		if (!editingEmployee || !editingEmployee.name || !editingEmployee.email) return;
		const targetId = editingEmployee.id || editingEmployee._id || editingEmployee.employeeId;
		const updates = {
			...editingEmployee,
			salary: Number(editingEmployee.salary) || 0
		};
		delete updates.permissions;
		delete updates.authVersion;
		delete updates.passwordHash;
		delete updates.salaryRecord;
		delete updates._id;
		delete updates.__v;
		if (updates.onboardingStatus === "pending") updates.onboardingStatus = "submitted";
		await hrStore.updateEmployee(targetId, updates);
		setEditingEmployee(null);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Employee profile",
			title: employee.name,
			description: `${employee.designation || "Pending Designation"} · ${employee.department} · ${employee.employeeId}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "profile-actions-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					as: "a",
					href: workforcePath("/people"),
					variant: "secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 15 }), " Back to Directory"]
				}), hasPermission(user, "employees.write") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: () => setEditingEmployee({
							...employee,
							bankName: employee.bankDetails?.bankName || "",
							accountNumber: employee.bankDetails?.accountNumber || "",
							ifscCode: employee.bankDetails?.ifscCode || "",
							panTaxId: employee.bankDetails?.panTaxId || "",
							uanNumber: employee.bankDetails?.uanNumber || "",
							salary: employee.salary ?? 0
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 15 }), " Edit Profile"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: storeAction(() => hrStore.toggleEmployeeStatus(employee.id)),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, { size: 15 }),
							" ",
							employee.status === "active" ? "Deactivate" : "Activate"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "danger",
						onClick: () => setEmployeeToDelete(employee),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { size: 15 }), " Deactivate Employee"]
					})
				] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "employee-detail-grid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel profile-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "profile-heading",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeAvatar, {
							name: employee.name,
							avatarUrl: employee.avatarUrl || employee.onboardingDocs?.passportPhoto?.url,
							size: 54
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: employee.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: employee.email })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: employee.status === "active" ? "info" : employee.status === "notice" ? "warning" : "neutral",
							children: statusLabels[employee.status] ?? employee.status
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "detail-fields",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee ID" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.employeeId })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.phone || "Not configured" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.department })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Designation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.designation })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Role / Permissions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { textTransform: "uppercase" },
							children: employee.role || "employee"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Annual CTC (INR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "var(--teal)" },
							children: formatINR(employee.salary ?? 0)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Joining Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.joiningDate })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date of Birth" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, {
								size: 13,
								style: { color: "#ec4899" }
							}), employee.dob ? new Date(employee.dob).toLocaleDateString("en-GB", {
								day: "numeric",
								month: "long",
								year: "numeric"
							}) : employee.identity?.dob ? new Date(employee.identity.dob).toLocaleDateString("en-GB", {
								day: "numeric",
								month: "long",
								year: "numeric"
							}) : "Not configured"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reporting Manager" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.managerName || "Not assigned" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.bankDetails?.bankName || "Not configured" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Account Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.bankDetails?.accountNumber || "Not configured" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "IFSC Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.bankDetails?.ifscCode || "Not configured" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PAN Card Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee.bankDetails?.panTaxId || "Not configured" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Emergency Contact" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
							employee.emergencyContact?.name || "Emergency Contact",
							" (",
							employee.emergencyContact?.phone || employee.phone,
							")"
						] })] })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel detail-side-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Vault"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Employee Documents" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
						size: 18,
						className: "muted-icon"
					})]
				}), (employee.documents || []).length > 0 ? employee.documents.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "document-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 15 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: doc.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							doc.type,
							" • ",
							doc.size
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 14 })
					]
				}, doc.id || doc.name)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "16px 0",
						fontSize: "11px",
						color: "var(--muted)"
					},
					children: "No employee documents have been saved."
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeComplianceStatusCard, { employee }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			style: {
				padding: "20px",
				marginTop: "20px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
				style: {
					margin: "0 0 16px",
					fontSize: "15px",
					fontWeight: 700,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
					size: 18,
					style: { color: "var(--teal)" }
				}), " Onboarding Verification & Submitted Documents"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingDossierView, {
				employee,
				canEdit: false,
				canVerify: true
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationDialog, {
			open: Boolean(employeeToDelete),
			title: `Remove Employee: ${employee?.name}`,
			message: `Deactivate ${employee?.name} (${employee?.employeeId})? Login will be disabled and linked history preserved.`,
			confirmLabel: "Deactivate Employee",
			isDestructive: true,
			onConfirm: handleDeleteEmployee,
			onCancel: () => setEmployeeToDelete(null)
		}),
		editingEmployee && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setEditingEmployee(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				style: { width: "min(100%, 680px)" },
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Edit Employee Profile" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: () => setEditingEmployee(null),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleUpdateEmployee,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-body",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "form-section-title",
								children: "Personal & Contact Info"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Employee Code",
									required: true,
									hint: "Unique workforce code.",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										value: editingEmployee.employeeId || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											employeeId: e.target.value.toUpperCase()
										}),
										placeholder: "e.g. ETS26210",
										style: {
											fontWeight: 600,
											textTransform: "uppercase"
										}
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Full Name",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										value: editingEmployee.name || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											name: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px",
									marginTop: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Work Email",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "email",
										required: true,
										value: editingEmployee.email || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											email: e.target.value
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Phone Number",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "tel",
										required: true,
										value: editingEmployee.phone || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											phone: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px",
									marginTop: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Date of Birth (DOB)",
									hint: "Statutory identification record (as per official identity documents).",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										value: editingEmployee.dob ? String(editingEmployee.dob).slice(0, 10) : "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											dob: e.target.value
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Status",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: editingEmployee.status || "active",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											status: e.target.value
										}),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "active",
												children: "Active"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "invited",
												children: "Invited"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "inactive",
												children: "Inactive"
											})
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "form-section-title",
								children: "Organization & CTC Compensation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Department",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: editingEmployee.department || "Engineering",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											department: e.target.value
										}),
										children: DEPARTMENTS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: d,
											children: d
										}, d))
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Designation",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										value: editingEmployee.designation || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											designation: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr",
									gap: "12px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Reporting Manager",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: editingEmployee.managerId || "",
										onChange: (event) => setEditingEmployee({
											...editingEmployee,
											managerId: event.target.value
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "No reporting manager"
										}), storeState.employees.filter((manager) => manager.id !== employee.id && manager.status === "active" && [
											"director",
											"managing_director",
											"admin",
											"hr",
											"vertical_head",
											"revenue_growth_manager",
											"manager",
											"team_lead",
											"team_leader"
										].includes(String(manager.role || "").toLowerCase().trim().replace(/[-\s]/g, "_"))).map((manager) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: manager.id || manager._id || manager.employeeId,
											children: [
												manager.name,
												" (",
												manager.employeeId,
												")"
											]
										}, manager.id || manager._id || manager.employeeId))]
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalaryBreakdownFields, {
								salary: editingEmployee.salary,
								annualCtc: editingEmployee.salary,
								salaryStructure: editingEmployee.salaryStructure,
								onChange: ({ salary, annualCtc, salaryStructure }) => {
									setEditingEmployee({
										...editingEmployee,
										salary: annualCtc !== void 0 ? annualCtc : salary,
										salaryStructure
									});
								},
								sectionTitle: "Compensation & Salary Breakdown (₹ INR)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "form-section-title",
								children: "Bank & Statutory Details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Bank Name",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: editingEmployee.bankName || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											bankName: e.target.value
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Not configured"
										}), BANKS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: b,
											children: b
										}, b))]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Bank Account Number",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: editingEmployee.accountNumber || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											accountNumber: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "IFSC Code",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: editingEmployee.ifscCode || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											ifscCode: e.target.value.toUpperCase()
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "PAN Card Number",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: editingEmployee.panTaxId || "",
										onChange: (e) => setEditingEmployee({
											...editingEmployee,
											panTaxId: e.target.value.toUpperCase()
										})
									})
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-footer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setEditingEmployee(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Save Changes"
						})]
					})]
				})]
			})
		})
	] });
}
function EmployeeForm({ id }) {
	const editing = Boolean(id);
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [form, setForm] = (0, import_react.useState)({
		employeeId: `EDU-EMP-${crypto.randomUUID()}`,
		name: "",
		email: "",
		phone: "",
		department: "Engineering",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
		dob: "",
		salary: "0",
		managerId: "",
		managerName: "",
		bankName: "",
		accountNumber: "",
		ifscCode: "",
		panTaxId: "",
		uanNumber: ""
	});
	const [showDeleteModal, setShowDeleteModal] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let initialized = false;
		return hrStore.subscribe((state) => {
			setStoreState(state);
			const emp = state.employees.find((employee) => employee.id === id || employee.employeeId === id);
			if (editing && emp && !initialized) {
				initialized = true;
				setForm({
					...emp,
					phone: emp.phone || "",
					dob: emp.dob ? String(emp.dob).slice(0, 10) : emp.identity?.dob ? String(emp.identity.dob).slice(0, 10) : "",
					emergencyContactName: emp.emergencyContact?.name || "",
					emergencyContactRelationship: emp.emergencyContact?.relationship || "",
					emergencyContactPhone: emp.emergencyContact?.phone || "",
					fatherName: emp.parentsContact?.fatherName || "",
					motherName: emp.parentsContact?.motherName || "",
					parentPhone: emp.parentsContact?.parentPhone || emp.parentsContact?.phone || "",
					parentAddress: emp.parentsContact?.address || "",
					bankName: emp.bankDetails?.bankName || "",
					accountNumber: emp.bankDetails?.accountNumber || "",
					ifscCode: emp.bankDetails?.ifscCode || "",
					panTaxId: emp.bankDetails?.panTaxId || "",
					uanNumber: emp.bankDetails?.uanNumber || "",
					salary: String(emp.salary ?? 0),
					salaryStructure: emp.salaryStructure || {}
				});
			}
		});
	}, [id, editing]);
	const submit = storeAction(async (e) => {
		e.preventDefault();
		if (editing) await hrStore.updateEmployee(id, {
			...form,
			salary: Number(form.salary),
			salaryStructure: form.salaryStructure || {}
		});
		else await hrStore.addEmployee({
			...form,
			salary: Number(form.salary),
			salaryStructure: form.salaryStructure || {}
		});
		window.location.hash = workforcePath("/people");
	});
	const confirmDelete = storeAction(async () => {
		await hrStore.updateEmployee(id, { status: "inactive" });
		setShowDeleteModal(false);
		window.location.hash = workforcePath("/people");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Employee management",
			title: editing ? `Edit Employee: ${form.name || form.employeeId}` : "Add New Employee",
			description: editing ? "Update this employee’s profile, compensation package, and banking records." : "Create a database-backed employee profile. Provision login through User Accounts; HR reviews payroll separately.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					as: "a",
					href: workforcePath("/people"),
					variant: "secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 15 }), " Cancel"]
				}), editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "danger",
					onClick: () => setShowDeleteModal(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { size: 15 }), " Deactivate Employee"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "panel employee-form",
			onSubmit: submit,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "form-section-title",
						children: "Personal & Contact Details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Employee ID",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.employeeId,
							readOnly: editing,
							onChange: (e) => setForm({
								...form,
								employeeId: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Full name",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.name,
							placeholder: "e.g. Jordan Miller",
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Work email",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							placeholder: "jordan.miller@edufyi.local",
							value: form.email,
							onChange: (e) => setForm({
								...form,
								email: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Phone number",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "tel",
							placeholder: "+91 98765 43210",
							value: form.phone,
							onChange: (e) => setForm({
								...form,
								phone: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "form-section-title",
						children: "Organization & Role"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Department",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: form.department,
							onChange: (e) => setForm({
								...form,
								department: e.target.value
							}),
							children: DEPARTMENTS.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: dept,
								children: dept
							}, dept))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Designation",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.designation,
							placeholder: "e.g. Senior Frontend Engineer",
							onChange: (e) => setForm({
								...form,
								designation: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Role Level",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.role || "employee",
							disabled: ["admin", "hr"].includes(form.role),
							onChange: (e) => setForm({
								...form,
								role: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "employee",
									children: "Employee"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "manager",
									children: "Manager"
								}),
								["admin", "hr"].includes(form.role) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: form.role,
									children: form.role.toUpperCase()
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.status || "active",
							onChange: (e) => setForm({
								...form,
								status: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "active",
									children: "Active"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "invited",
									children: "Invited"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "inactive",
									children: "Inactive"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Joining date",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: form.joiningDate,
							onChange: (e) => setForm({
								...form,
								joiningDate: e.target.value
							}),
							required: true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Date of Birth (DOB)",
						hint: "Statutory identification record (as per official identity documents).",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							value: form.dob || "",
							onChange: (e) => setForm({
								...form,
								dob: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Reporting Manager",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.managerId || "",
							onChange: (event) => setForm({
								...form,
								managerId: event.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "No reporting manager"
							}), storeState.employees.filter((employee) => employee.id !== id && employee.status === "active" && [
								"director",
								"managing_director",
								"admin",
								"hr",
								"vertical_head",
								"revenue_growth_manager",
								"manager",
								"team_lead",
								"team_leader"
							].includes(String(employee.role || "").toLowerCase().trim().replace(/[-\s]/g, "_"))).map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: employee.id || employee._id || employee.employeeId,
								children: [
									employee.name,
									" (",
									employee.employeeId,
									")"
								]
							}, employee.id || employee._id || employee.employeeId))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { gridColumn: "span 2" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalaryBreakdownFields, {
							salary: form.salary,
							annualCtc: form.salary,
							salaryStructure: form.salaryStructure,
							onChange: ({ salary, annualCtc, salaryStructure }) => {
								setForm({
									...form,
									salary: annualCtc !== void 0 ? annualCtc : salary,
									salaryStructure
								});
							},
							sectionTitle: "Compensation & Salary Breakdown (₹ INR)"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "form-section-title",
						children: "Bank & Statutory Details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Bank Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.bankName,
							onChange: (e) => setForm({
								...form,
								bankName: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Not configured"
							}), BANKS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: b,
								children: b
							}, b))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Account Number",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "5010049281923",
							value: form.accountNumber,
							onChange: (e) => setForm({
								...form,
								accountNumber: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "IFSC Code",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "HDFC0001234",
							value: form.ifscCode,
							onChange: (e) => setForm({
								...form,
								ifscCode: e.target.value.toUpperCase()
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "PAN Card Number",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "ABCDE1234F",
							value: form.panTaxId,
							onChange: (e) => setForm({
								...form,
								panTaxId: e.target.value.toUpperCase()
							})
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					as: "a",
					href: workforcePath("/people"),
					variant: "secondary",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: editing ? "Save Changes" : "Create & Onboard Employee"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationDialog, {
			open: showDeleteModal,
			title: `Deactivate Employee: ${form.name}`,
			message: `Disable login for ${form.name} (${form.employeeId}) while preserving attendance, leave, and payroll history?`,
			confirmLabel: "Deactivate Employee",
			isDestructive: true,
			onConfirm: confirmDelete,
			onCancel: () => setShowDeleteModal(false)
		})
	] });
}
function EmployeesPage({ route } = {}) {
	const currentPath = route?.path || (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "/hr/people");
	const parts = currentPath.replace(/^#/, "").split("/").filter(Boolean);
	if (parts[parts.length - 1] === "new") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeForm, {});
	if (parts[parts.length - 1] === "edit" && parts.length >= 3) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeForm, { id: parts[parts.length - 2] });
	let targetId = null;
	if (parts.length >= 3 && (parts[0] === "hr" || parts[0] === "admin") && parts[1] === "people") targetId = parts[2];
	else if (parts.length >= 2 && parts[0] === "people") targetId = parts[1];
	if (targetId && targetId !== "new" && targetId !== "edit") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeDetail, { id: targetId });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeDirectory, { route: route || { path: currentPath } });
}
export { EmployeesPage };
