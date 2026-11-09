import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $t as Calendar, A as ShieldCheck, Bt as Clock, C as Sun, Dt as FileText, E as Sparkles, Ft as Download, Gt as CircleAlert, I as Send, Jt as ChevronLeft, K as Plus, L as Search, Mt as Eye, N as Settings, R as Save, S as Table, V as RefreshCw, Vt as Clock3, Wt as CircleCheck, Xt as Check, Y as Pen, Yt as ChevronDown, _n as require_react, bt as Heart, d as Users, et as Moon, gn as Activity, ht as Layers, i as X, j as ShieldAlert, on as Briefcase, qt as ChevronRight, tn as CalendarDays, wt as Funnel, y as Trash } from "./icons-vendor-CNlTUIuG.js";
import { r as require_react_dom } from "./react-vendor-B_MMQ54z.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { D as storeAction, E as is25thMonthLop, I as apiClient, T as hrStore, a as Field, c as StatusBadge, i as EmptyState, k as todayKey, n as ConfirmationDialog, o as PageHeader, r as DataTable, t as Button, x as useAuth, y as parseLocationHash } from "./index-DPfPlI3e.js";
// src/pages/LeavePolicySettings.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = require_react_dom();
var import_jsx_runtime = require_jsx_runtime();
var LEAVE_TYPE_META = {
	casual: {
		name: "Casual Leave",
		code: "CL",
		icon: Calendar,
		color: "#0284c7",
		bg: "#f0f9ff",
		desc: "Short-term personal time off and urgent personal commitments.",
		defaultWorkflow: "manager"
	},
	sick: {
		name: "Sick Leave",
		code: "SL",
		icon: Activity,
		color: "#10b981",
		bg: "#ecfdf5",
		desc: "Medical absence for illness, health recovery, and appointments.",
		defaultWorkflow: "manager"
	},
	earned: {
		name: "Earned / Privilege Leave",
		code: "EL",
		icon: Briefcase,
		color: "#8b5cf6",
		bg: "#f5f3ff",
		desc: "Accrued annual privilege leave for vacations and planned rest.",
		defaultWorkflow: "manager"
	},
	comp_off: {
		name: "Compensatory Off",
		code: "CO",
		icon: Clock,
		color: "#f59e0b",
		bg: "#fffbeb",
		desc: "Compensatory off earned for working on weekends or holidays.",
		defaultWorkflow: "manager_hr"
	},
	maternity: {
		name: "Maternity / Paternity Leave",
		code: "ML",
		icon: Heart,
		color: "#ec4899",
		bg: "#fdf2f8",
		desc: "Extended parental leave for mothers and fathers welcoming a child.",
		defaultWorkflow: "hr"
	},
	lop: {
		name: "Loss of Pay (LOP) / Unpaid",
		code: "LOP",
		icon: CircleAlert,
		color: "#ef4444",
		bg: "#fef2f2",
		desc: "Unpaid time off requested when paid leave quotas are fully exhausted.",
		defaultWorkflow: "manager_hr"
	}
};
var WORKFLOW_LABELS = {
	hr: "HR Review",
	manager: "Assigned Manager Review",
	manager_hr: "Manager then HR Review"
};
function LeavePolicySettings({ employees = [], onSwitchTab, allRequests }) {
	const [policies, setPolicies] = (0, import_react.useState)([]);
	const [policy, setPolicy] = (0, import_react.useState)({
		leaveType: "casual",
		label: "Casual Leave",
		approvalStage: "manager",
		countWeekends: false,
		countHolidays: false,
		holidayDates: [],
		requiresReason: true,
		configured: true
	});
	const [balance, setBalance] = (0, import_react.useState)({
		employeeId: "",
		leaveType: "casual",
		allowance: 12
	});
	const [allInOneOpen, setAllInOneOpen] = (0, import_react.useState)(false);
	const [editingPolicy, setEditingPolicy] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [noticeType, setNoticeType] = (0, import_react.useState)("success");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useRef)(null);
	const load = async () => {
		try {
			const result = await apiClient.get("/leave/policies");
			if (Array.isArray(result.data) && result.data.length > 0) {
				setPolicies(result.data);
				setPolicy((prev) => {
					const match = result.data.find((p) => p.leaveType === prev.leaveType);
					return match ? { ...match } : prev;
				});
			}
		} catch (err) {
			hrStore.reportError(err);
		}
	};
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	const configuredTypesCount = policies.length || 6;
	const activePoliciesCount = policies.filter((p) => p.configured !== false).length || configuredTypesCount;
	const pendingRequestsCount = (allRequests || hrStore.getState().leaveRequests || []).filter((r) => r.status === "pending").length;
	const coveredEmployeesCount = employees.length || (hrStore.getState().employees || []).length;
	function handleSelectPolicy(targetPolicy) {
		setEditingPolicy({
			...targetPolicy,
			holidayDates: Array.isArray(targetPolicy.holidayDates) ? [...targetPolicy.holidayDates] : []
		});
	}
	const handleSavePolicyModal = storeAction(async (updatedPolicy) => {
		setBusy(true);
		try {
			await apiClient.put(`/leave/policies/${updatedPolicy.leaveType}`, updatedPolicy);
			await load();
			setNotice(`Leave policy for "${updatedPolicy.label || updatedPolicy.leaveType}" updated and saved successfully!`);
			setNoticeType("success");
			setTimeout(() => setNotice(""), 4500);
			setEditingPolicy(null);
		} catch (err) {
			setNotice(err.response?.data?.error?.message || err.message || "Failed to save leave policy.");
			setNoticeType("error");
		} finally {
			setBusy(false);
		}
	});
	storeAction(async (event) => {
		if (event?.preventDefault) event.preventDefault();
		setBusy(true);
		try {
			await apiClient.put(`/leave/policies/${policy.leaveType}`, policy);
			await load();
			setNotice(`Leave policy for "${policy.label || policy.leaveType}" saved successfully!`);
			setNoticeType("success");
			setTimeout(() => setNotice(""), 5e3);
		} catch (err) {
			setNotice(err.response?.data?.error?.message || err.message || "Failed to save leave policy.");
			setNoticeType("error");
		} finally {
			setBusy(false);
		}
	});
	const saveBalance = storeAction(async (event) => {
		if (event?.preventDefault) event.preventDefault();
		if (!balance.employeeId) {
			setNotice("Please select an employee.");
			setNoticeType("error");
			return;
		}
		setBusy(true);
		try {
			const targetEmp = (employees || []).find((e) => (e._id || e.id || e.employeeId) === balance.employeeId);
			const targetId = String(targetEmp?._id || targetEmp?.id || balance.employeeId);
			const targetAllowance = Number(balance.allowance ?? 0);
			await apiClient.put(`/leave/hr/balances/${targetId}/${balance.leaveType}`, { allowance: targetAllowance });
			const existing = (hrStore.getState().leaveBalances || []).find((b) => {
				const bEmpId = typeof b.employeeId === "object" ? b.employeeId?._id || b.employeeId?.id : b.employeeId;
				return String(bEmpId) === targetId && b.leaveType === balance.leaveType;
			});
			if (existing) existing.allowance = targetAllowance;
			hrStore.notify?.();
			hrStore.refresh().catch(() => {});
			setNotice("Employee leave entitlement quota saved successfully.");
			setNoticeType("success");
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			setNotice(err.response?.data?.error?.message || err.message || "Failed to save employee allowance.");
			setNoticeType("error");
		} finally {
			setBusy(false);
		}
	});
	const displayPolicies = [
		"casual",
		"sick",
		"earned",
		"comp_off",
		"maternity",
		"lop"
	].map((key) => {
		const found = policies.find((p) => p.leaveType === key);
		if (found) return found;
		const meta = LEAVE_TYPE_META[key];
		return {
			leaveType: key,
			label: meta.name,
			approvalStage: meta.defaultWorkflow,
			countWeekends: false,
			countHolidays: false,
			holidayDates: [],
			configured: true
		};
	});
	(LEAVE_TYPE_META[policy.leaveType] || LEAVE_TYPE_META.casual).icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "20px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					flexWrap: "wrap",
					gap: "12px"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					style: {
						margin: 0,
						fontSize: "18px",
						fontWeight: 800,
						color: "var(--ink, #0f172a)",
						letterSpacing: "-0.02em",
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
						size: 20,
						color: "var(--teal, #006E6F)"
					}), "Leave Management"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "4px 0 0",
						fontSize: "12.5px",
						color: "var(--muted, #64748b)"
					},
					children: "Manage leave policies, employee entitlements, approvals, and holiday rules."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-summary-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-summary-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "leave-summary-icon-wrap",
							style: {
								background: "#f0f9ff",
								color: "#0284c7"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leave-summary-info",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-label",
									children: "Configured Types"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "leave-summary-value",
									children: configuredTypesCount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-sub",
									children: "Leave categories live"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-summary-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "leave-summary-icon-wrap",
							style: {
								background: "#ecfdf5",
								color: "#10b981"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leave-summary-info",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-label",
									children: "Active Policies"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "leave-summary-value",
									children: activePoliciesCount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-sub",
									children: "Governed rules active"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-summary-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "leave-summary-icon-wrap",
							style: {
								background: pendingRequestsCount ? "#fffbeb" : "#f8fafc",
								color: pendingRequestsCount ? "#d97706" : "#64748b"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leave-summary-info",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-label",
									children: "Pending Requests"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "leave-summary-value",
									style: { color: pendingRequestsCount ? "#d97706" : "inherit" },
									children: pendingRequestsCount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-sub",
									children: pendingRequestsCount ? "Action required in queue" : "All queues cleared"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-summary-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "leave-summary-icon-wrap",
							style: {
								background: "#f5f3ff",
								color: "#8b5cf6"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leave-summary-info",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-label",
									children: "Covered Workforce"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "leave-summary-value",
									children: coveredEmployeesCount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-summary-sub",
									children: "Staff members enrolled"
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-action-toolbar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "leave-toolbar-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "12px",
								fontWeight: 700,
								color: "var(--ink)"
							},
							children: "Quick Navigation:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => handleSelectPolicy(displayPolicies[0]),
							style: {
								padding: "6px 12px",
								fontSize: "11px",
								display: "inline-flex",
								alignItems: "center",
								gap: "5px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 13 }), " Edit Policies Directly"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => {
								const hash = window.location.hash.includes("/admin") ? "#/admin/holidays" : "#/hr/holidays";
								window.location.hash = hash;
							},
							style: {
								padding: "6px 12px",
								fontSize: "11px",
								display: "inline-flex",
								alignItems: "center",
								gap: "5px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 13 }), " Manage Holidays"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "leave-toolbar-right",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ui-button primary",
						onClick: () => {
							if (onSwitchTab) onSwitchTab("approvals");
							else {
								const hash = window.location.hash.includes("/admin") ? "#/admin/leave" : "#/hr/leave";
								window.location.hash = hash;
							}
						},
						style: {
							padding: "6px 14px",
							fontSize: "11px",
							display: "inline-flex",
							alignItems: "center",
							gap: "5px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 13 }),
							" View Leave Requests (",
							pendingRequestsCount,
							" Pending)"
						]
					})
				})]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "12px",
					padding: "12px 16px",
					borderRadius: "10px",
					fontSize: "12.5px",
					fontWeight: 600,
					background: noticeType === "error" ? "#fef2f2" : noticeType === "info" ? "#f0f9ff" : "#e6fffa",
					border: noticeType === "error" ? "1px solid #fecaca" : noticeType === "info" ? "1px solid #bae6fd" : "1px solid #b2f5ea",
					color: noticeType === "error" ? "#dc2626" : noticeType === "info" ? "#0369a1" : "#006E6F",
					animation: "fadeUp 0.25s ease"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [noticeType === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notice })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setNotice(""),
					style: {
						border: 0,
						background: "transparent",
						cursor: "pointer",
						color: "inherit",
						padding: "2px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 15 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					style: {
						fontSize: "15px",
						fontWeight: 700,
						margin: 0,
						color: "var(--ink)"
					},
					children: "Configured Leave Categories"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						fontSize: "12px",
						color: "var(--muted)",
						margin: "2px 0 0 0"
					},
					children: "Select a category card to edit its entitlement rules, approval workflows, and holiday calculations."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						fontSize: "11px",
						color: "var(--muted)",
						fontWeight: 600
					},
					children: [displayPolicies.length, " Categories"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "leave-type-cards-grid",
				children: displayPolicies.map((rec) => {
					const isSelected = policy.leaveType === rec.leaveType;
					const meta = LEAVE_TYPE_META[rec.leaveType] || LEAVE_TYPE_META.casual;
					const Icon = meta.icon;
					const workflowLabel = WORKFLOW_LABELS[rec.approvalStage] || "Manager Review";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `leave-type-card-item ${isSelected ? "selected" : ""}`,
						onClick: () => handleSelectPolicy(rec),
						role: "button",
						tabIndex: 0,
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === " ") handleSelectPolicy(rec);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-type-card-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "leave-type-card-icon-box",
									style: {
										background: meta.bg,
										color: meta.color
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "3px",
											fontSize: "10px",
											fontWeight: 700,
											color: "var(--teal)",
											background: "rgba(0, 110, 111, 0.1)",
											padding: "2px 8px",
											borderRadius: "999px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 11 }), " Selected"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "leave-policy-pill",
										children: meta.code
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "leave-type-card-title",
								children: rec.label || meta.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "leave-type-card-desc",
								children: meta.desc
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "leave-type-card-footer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "leave-workflow-pill",
								title: `Approval Flow: ${workflowLabel}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 11 }),
									" ",
									workflowLabel
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontWeight: 700,
									color: "var(--teal)",
									display: "inline-flex",
									alignItems: "center",
									gap: "2px"
								},
								children: ["Edit Policy ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 13 })]
							})]
						})]
					}, rec.leaveType);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "policy-overview-table-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "16px",
						flexWrap: "wrap",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						style: {
							fontSize: "15px",
							fontWeight: 700,
							margin: 0,
							color: "var(--ink)",
							display: "flex",
							alignItems: "center",
							gap: "7px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
							size: 16,
							style: { color: "var(--teal)" }
						}), " All Configured Leave Policies Overview"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "11.5px",
							color: "var(--muted)",
							margin: "2px 0 0 0"
						},
						children: "Summary matrix of leave calculation rules, approval chains, and holiday inclusions."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							color: "var(--muted)"
						},
						children: [
							"Showing ",
							displayPolicies.length,
							" Categories"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table",
						style: {
							width: "100%",
							minWidth: "600px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "left" },
								children: "Leave Type"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "left" },
								children: "Policy Label"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "left" },
								children: "Approval Workflow"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "center" },
								children: "Weekend Rule"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "center" },
								children: "Holiday Rule"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "right" },
								children: "Actions"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: displayPolicies.map((rec) => {
							const meta = LEAVE_TYPE_META[rec.leaveType] || LEAVE_TYPE_META.casual;
							const Icon = meta.icon;
							const isSelected = policy.leaveType === rec.leaveType;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								style: {
									background: isSelected ? "rgba(0, 110, 111, 0.04)" : "transparent",
									transition: "background 0.15s ease"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												width: "26px",
												height: "26px",
												borderRadius: "6px",
												background: meta.bg,
												color: meta.color,
												display: "grid",
												placeItems: "center"
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 14 })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "12px" },
											children: meta.code
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "10px",
												color: "var(--muted)",
												fontFamily: "monospace"
											},
											children: rec.leaveType
										})] })]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontWeight: 600,
											fontSize: "12.5px",
											color: "var(--ink)"
										},
										children: rec.label || meta.name
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "leave-workflow-pill",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 11 }),
											" ",
											WORKFLOW_LABELS[rec.approvalStage] || "Manager Review"
										]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { textAlign: "center" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "11px",
												fontWeight: 600,
												padding: "2px 8px",
												borderRadius: "6px",
												background: rec.countWeekends ? "#fef2f2" : "#f0fdf4",
												color: rec.countWeekends ? "#dc2626" : "#16a34a"
											},
											children: rec.countWeekends ? "Counted" : "Excluded"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { textAlign: "center" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "11px",
												fontWeight: 600,
												padding: "2px 8px",
												borderRadius: "6px",
												background: rec.countHolidays ? "#fef2f2" : "#f0fdf4",
												color: rec.countHolidays ? "#dc2626" : "#16a34a"
											},
											children: [rec.countHolidays ? "Counted" : "Excluded", rec.holidayDates?.length > 0 && ` (${rec.holidayDates.length} exempt)`]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { textAlign: "right" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											onClick: () => handleSelectPolicy(rec),
											style: {
												padding: "5px 12px",
												fontSize: "11.5px",
												display: "inline-flex",
												alignItems: "center",
												gap: "5px",
												fontWeight: 600
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { size: 12 }), " Edit Policy"]
										})
									})
								]
							}, rec.leaveType);
						}) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { padding: "20px 24px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						flexWrap: "wrap",
						gap: "10px",
						marginBottom: "14px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						style: {
							fontSize: "15px",
							fontWeight: 700,
							margin: 0,
							color: "var(--ink)",
							display: "flex",
							alignItems: "center",
							gap: "7px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
							size: 16,
							style: { color: "var(--teal)" }
						}), " Individual Employee Leave Allowance"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							margin: "3px 0 0 0"
						},
						children: "Assign explicit annual leave quotas for specific team members. Used and reserved leave days are automatically preserved."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ui-button secondary",
						onClick: () => setAllInOneOpen(true),
						style: {
							fontSize: "11px",
							padding: "6px 12px",
							display: "inline-flex",
							alignItems: "center",
							gap: "5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							size: 12,
							style: { color: "var(--teal)" }
						}), " Set All Quotas in One Page (CL, SL, EL, CO, ML, LOP)"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: saveBalance,
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
						gap: "14px",
						alignItems: "flex-end"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Target Employee",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								required: true,
								value: balance.employeeId,
								onChange: (event) => {
									const newEmpId = event.target.value;
									const empBal = (hrStore.getState().leaveBalances || []).find((b) => {
										const bEmpId = typeof b.employeeId === "object" ? b.employeeId?._id || b.employeeId?.id || b.employeeId?.employeeId : b.employeeId;
										return String(bEmpId).toLowerCase() === String(newEmpId).toLowerCase() && b.leaveType === balance.leaveType;
									});
									setBalance({
										...balance,
										employeeId: newEmpId,
										allowance: empBal ? empBal.allowance : balance.allowance
									});
								},
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid var(--line)",
									background: "#fff",
									fontSize: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Choose employee…"
								}), employees.filter(Boolean).map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: employee.id || employee._id || employee.employeeId,
									children: [
										employee.name,
										" (",
										employee.employeeId || "No Code",
										")"
									]
								}, employee.id || employee._id || employee.employeeId))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Configured Leave Type",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: balance.leaveType,
								onChange: (event) => {
									const newType = event.target.value;
									const empBal = (hrStore.getState().leaveBalances || []).find((b) => {
										const bEmpId = typeof b.employeeId === "object" ? b.employeeId?._id || b.employeeId?.id || b.employeeId?.employeeId : b.employeeId;
										return String(bEmpId).toLowerCase() === String(balance.employeeId).toLowerCase() && b.leaveType === newType;
									});
									setBalance({
										...balance,
										leaveType: newType,
										allowance: empBal ? empBal.allowance : balance.allowance
									});
								},
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid var(--line)",
									background: "#fff",
									fontSize: "12px"
								},
								children: displayPolicies.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: record.leaveType,
									children: record.label || record.leaveType
								}, record.leaveType))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Total Annual Allowance (Days)",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								type: "number",
								min: "0",
								step: "0.5",
								value: balance.allowance !== void 0 && balance.allowance !== null ? balance.allowance : "",
								onChange: (event) => {
									const v = event.target.value;
									setBalance({
										...balance,
										allowance: v === "" ? "" : Number(v)
									});
								},
								onBlur: () => {
									setBalance((prev) => ({
										...prev,
										allowance: Number(prev.allowance || 0)
									}));
								},
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid var(--line)",
									background: "#fff",
									fontSize: "12px",
									fontWeight: 600
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: busy || !balance.employeeId,
							onClick: saveBalance,
							style: {
								width: "100%",
								height: "38px",
								fontSize: "12px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), " Save Employee Allowance"]
						}) })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllInOneQuotaModal, {
				open: allInOneOpen,
				onClose: () => setAllInOneOpen(false),
				employees,
				defaults: getDefaultCompanyQuotas(),
				onSuccess: (msg) => {
					setNotice(msg);
					setNoticeType("success");
					setTimeout(() => setNotice(""), 4500);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditPolicyModal, {
				open: Boolean(editingPolicy),
				policy: editingPolicy,
				onClose: () => setEditingPolicy(null),
				onSave: handleSavePolicyModal,
				busy
			})
		]
	});
}
function EditPolicyModal({ open, policy, onClose, onSave, busy }) {
	const [form, setForm] = (0, import_react.useState)(policy ? { ...policy } : null);
	(0, import_react.useEffect)(() => {
		if (policy) setForm({
			...policy,
			holidayDates: Array.isArray(policy.holidayDates) ? [...policy.holidayDates] : []
		});
	}, [policy, open]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);
	if (!open || !form) return null;
	const meta = LEAVE_TYPE_META[form.leaveType] || LEAVE_TYPE_META.casual;
	const Icon = meta.icon;
	const handleResetDefaults = () => {
		setForm((prev) => ({
			...prev,
			label: meta.name || prev.label,
			approvalStage: meta.defaultWorkflow || "manager",
			countWeekends: false,
			countHolidays: false,
			holidayDates: []
		}));
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(form);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "hr-modal-backdrop",
		onClick: onClose,
		style: {
			zIndex: 1100,
			display: "grid",
			placeItems: "center",
			padding: "16px"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hr-modal",
			style: {
				maxWidth: "620px",
				width: "100%",
				maxHeight: "90vh",
				overflowY: "auto",
				padding: "24px",
				background: "#ffffff",
				borderRadius: "14px",
				border: "1px solid var(--line)",
				boxShadow: "0 24px 60px rgba(0,0,0,0.2)"
			},
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					borderBottom: "1px solid var(--line)",
					paddingBottom: "14px",
					marginBottom: "18px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "38px",
							height: "38px",
							borderRadius: "8px",
							background: meta.bg,
							color: meta.color,
							display: "grid",
							placeItems: "center",
							flexShrink: 0
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 20 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						style: {
							margin: 0,
							fontSize: "16px",
							fontWeight: 800,
							color: "var(--ink)"
						},
						children: ["Edit Leave Policy: ", form.label || meta.name]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							color: "var(--muted)"
						},
						children: [
							"System Key: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								style: {
									background: "#f1f5f9",
									padding: "1px 5px",
									borderRadius: "4px"
								},
								children: form.leaveType
							}),
							" • Code: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: meta.code })
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "icon-button",
					style: {
						border: "none",
						background: "transparent",
						cursor: "pointer",
						padding: "4px",
						borderRadius: "6px"
					},
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				style: {
					display: "grid",
					gap: "16px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							style: {
								fontSize: "12px",
								fontWeight: 700,
								color: "var(--ink)"
							},
							children: ["Policy Display Label ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "#dc2626" },
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							required: true,
							value: form.label || "",
							onChange: (e) => setForm({
								...form,
								label: e.target.value
							}),
							placeholder: "e.g. Casual Leave",
							style: {
								width: "100%",
								padding: "9px 12px",
								borderRadius: "8px",
								border: "1px solid var(--line)",
								background: "#fff",
								fontSize: "12.5px"
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "5px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "12px",
									fontWeight: 700,
									color: "var(--ink)"
								},
								children: "Authorizing Review Stage / Approval Workflow"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.approvalStage || "manager",
								onChange: (e) => setForm({
									...form,
									approvalStage: e.target.value
								}),
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid var(--line)",
									background: "#fff",
									fontSize: "12px",
									fontWeight: 600
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "hr",
										children: "HR review (Direct HR approval only)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "manager",
										children: "Assigned manager review (Direct supervisor approval)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "manager_hr",
										children: "Manager then HR review (Two-stage sequential sign-off)"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: "Determines the approval authorization path before leave days are deducted from employee balances."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "12px",
								fontWeight: 700,
								color: "var(--ink)"
							},
							children: "Calendar & Leave Calculation Rules"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: `policy-rule-toggle-box ${form.countWeekends ? "active" : ""}`,
								style: {
									margin: 0,
									padding: "12px 14px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										flex: 1,
										minWidth: 0
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											fontSize: "12px",
											color: "var(--ink)",
											marginBottom: "2px"
										},
										children: "Count weekends as leave"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "11px",
											color: "var(--muted)",
											lineHeight: 1.35,
											display: "block"
										},
										children: "Saturdays & Sundays inside the leave period consume balance days."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: Boolean(form.countWeekends),
									onChange: (e) => setForm({
										...form,
										countWeekends: e.target.checked
									}),
									style: {
										width: "18px",
										height: "18px",
										accentColor: "var(--teal)",
										cursor: "pointer"
									}
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: `policy-rule-toggle-box ${form.countHolidays ? "active" : ""}`,
								style: {
									margin: 0,
									padding: "12px 14px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										flex: 1,
										minWidth: 0
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											fontSize: "12px",
											color: "var(--ink)",
											marginBottom: "2px"
										},
										children: "Count holidays as leave"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "11px",
											color: "var(--muted)",
											lineHeight: 1.35,
											display: "block"
										},
										children: "Declared holidays falling within leave duration count as taken."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: Boolean(form.countHolidays),
									onChange: (e) => setForm({
										...form,
										countHolidays: e.target.checked
									}),
									style: {
										width: "18px",
										height: "18px",
										accentColor: "var(--teal)",
										cursor: "pointer"
									}
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "5px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "12px",
									fontWeight: 700,
									color: "var(--ink)"
								},
								children: "Excluded Holiday Dates (Exemptions)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: (form.holidayDates ?? []).map((date) => String(date).slice(0, 10)).join(", "),
								onChange: (e) => setForm({
									...form,
									holidayDates: e.target.value.split(",").map((date) => date.trim()).filter(Boolean)
								}),
								placeholder: "e.g. 2026-01-26, 2026-08-15, 2026-10-02",
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid var(--line)",
									background: "#fff",
									fontSize: "12px",
									fontFamily: "monospace"
								}
							}),
							Array.isArray(form.holidayDates) && form.holidayDates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									flexWrap: "wrap",
									gap: "5px",
									marginTop: "4px"
								},
								children: form.holidayDates.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "holiday-chip",
									style: { fontSize: "10.5px" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 10 }),
										" ",
										String(d).slice(0, 10)
									]
								}, i))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							borderTop: "1px solid var(--line)",
							paddingTop: "14px",
							marginTop: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: handleResetDefaults,
							disabled: busy,
							style: {
								fontSize: "11px",
								padding: "6px 12px"
							},
							children: "Reset Defaults"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: onClose,
								disabled: busy,
								style: {
									fontSize: "12px",
									padding: "6px 14px"
								},
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: busy,
								style: {
									fontSize: "12px",
									padding: "6px 16px",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 13 }),
									" ",
									busy ? "Saving…" : "Save Policy"
								]
							})]
						})]
					})
				]
			})]
		})
	});
}
var FULLTIME_MONTHLY_QUOTAS = {
	casual: 1,
	sick: 1,
	earned: 0,
	comp_off: 0,
	maternity: 0,
	lop: 0
};
var INTERN_MONTHLY_QUOTAS = {
	casual: 0,
	sick: 1,
	earned: 0,
	comp_off: 0,
	maternity: 0,
	lop: 0
};
var STANDARD_DEFAULT_QUOTAS = {
	casual: 1,
	sick: 1,
	earned: 0,
	comp_off: 0,
	maternity: 0,
	lop: 0
};
function isInternEmployee(emp) {
	if (!emp) return false;
	const type = String(emp.employmentType || "").toLowerCase().replace(/[-\s]/g, "_");
	const desig = String(emp.designation || "").toLowerCase();
	const role = String(emp.role || "").toLowerCase();
	return type === "intern" || desig.includes("intern") || role.includes("intern");
}
var STORAGE_DEFAULT_QUOTAS_KEY = "edufyi_default_leave_quotas";
function getDefaultCompanyQuotas() {
	try {
		const raw = localStorage.getItem(STORAGE_DEFAULT_QUOTAS_KEY);
		if (raw) return {
			...STANDARD_DEFAULT_QUOTAS,
			...JSON.parse(raw)
		};
	} catch {}
	return { ...STANDARD_DEFAULT_QUOTAS };
}
function saveDefaultCompanyQuotas(quotas) {
	try {
		localStorage.setItem(STORAGE_DEFAULT_QUOTAS_KEY, JSON.stringify(quotas));
	} catch {}
}
function AllInOneQuotaModal({ open, onClose, targetEmployee, employees = [], defaults, onSuccess }) {
	const [empId, setEmpId] = (0, import_react.useState)("");
	const [quotas, setQuotas] = (0, import_react.useState)(() => ({ ...defaults || getDefaultCompanyQuotas() }));
	const [showExtra, setShowExtra] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)("");
	const targetId = targetEmployee?.id || targetEmployee?._id || targetEmployee?.employeeId || "";
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setErrorMsg("");
		const target = targetEmployee || (employees.length > 0 ? employees[0] : null);
		const chosenId = target?._id || target?.id || target?.employeeId || "";
		setEmpId(chosenId);
		const isIntern = isInternEmployee(target);
		const baseDefaults = defaults || (isIntern ? INTERN_MONTHLY_QUOTAS : FULLTIME_MONTHLY_QUOTAS);
		if (target && target.balances) {
			setQuotas({
				casual: target.balances.casual?.allowance ?? (isIntern ? 0 : 1),
				sick: target.balances.sick?.allowance ?? 1,
				earned: target.balances.earned?.allowance ?? 0,
				comp_off: target.balances.comp_off?.allowance ?? 0,
				maternity: target.balances.maternity?.allowance ?? 0,
				lop: target.balances.lop?.allowance ?? 0
			});
			const hasExtra = target.balances.earned?.allowance > 0 || target.balances.comp_off?.allowance > 0 || target.balances.maternity?.allowance > 0 || target.balances.lop?.allowance > 0;
			setShowExtra(Boolean(hasExtra));
		} else {
			setQuotas({ ...baseDefaults });
			setShowExtra(false);
		}
	}, [open, targetId]);
	if (!open) return null;
	const activeEmp = employees.find((e) => (e.id || e._id || e.employeeId) === empId) || targetEmployee;
	const handleSubmit = async (e) => {
		if (e?.preventDefault) e.preventDefault();
		if (!empId) {
			setErrorMsg("Please select an employee.");
			return;
		}
		setBusy(true);
		setErrorMsg("");
		try {
			const types = [
				"casual",
				"sick",
				"earned",
				"comp_off",
				"maternity",
				"lop"
			];
			const targetEmpRecord = employees.find((e) => (e._id || e.id || e.employeeId) === empId) || targetEmployee;
			const finalEmpId = String(targetEmpRecord?._id || targetEmpRecord?.id || empId);
			for (const type of types) {
				const raw = quotas[type];
				const val = Math.max(0, Number(raw === "" || raw === void 0 ? 0 : raw));
				await apiClient.put(`/leave/hr/balances/${finalEmpId}/${type}`, { allowance: val });
			}
			const storeBals = hrStore.getState().leaveBalances || [];
			for (const type of types) {
				const val = Math.max(0, Number(quotas[type] || 0));
				const existing = storeBals.find((b) => {
					const bEmpId = typeof b.employeeId === "object" ? b.employeeId?._id || b.employeeId?.id : b.employeeId;
					return String(bEmpId) === finalEmpId && b.leaveType === type;
				});
				if (existing) existing.allowance = val;
			}
			hrStore.notify?.();
			hrStore.refresh().catch(() => {});
			if (onSuccess) onSuccess(`All leave quotas for ${activeEmp?.name || "employee"} saved successfully!`);
			onClose();
		} catch (err) {
			setErrorMsg(err.response?.data?.error?.message || err.message || "Failed to save all leave quotas.");
		} finally {
			setBusy(false);
		}
	};
	const primaryKeys = ["casual", "sick"];
	const extraKeys = [
		"earned",
		"comp_off",
		"maternity",
		"lop"
	];
	const renderQuotaBox = (key) => {
		const meta = LEAVE_TYPE_META[key];
		const Icon = meta.icon;
		const currBalance = activeEmp?.balances?.[key];
		const used = currBalance?.used || 0;
		const reserved = currBalance?.reserved || 0;
		const minAllowed = used + reserved;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "quota-input-box",
			style: {
				background: "#fff",
				border: "1px solid var(--line)",
				borderRadius: "10px",
				padding: "12px"
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
							gap: "6px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								width: "24px",
								height: "24px",
								borderRadius: "6px",
								background: meta.bg,
								color: meta.color,
								display: "grid",
								placeItems: "center"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 13 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "12.5px",
								fontWeight: 700,
								color: "var(--ink)"
							},
							children: meta.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "10.5px",
							fontWeight: 800,
							padding: "2px 7px",
							borderRadius: "4px",
							background: meta.bg,
							color: meta.color
						},
						children: meta.code
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px",
						marginTop: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: minAllowed,
						step: "0.5",
						required: true,
						value: quotas[key] !== void 0 && quotas[key] !== null ? quotas[key] : "",
						onChange: (e) => {
							const v = e.target.value;
							setQuotas((prev) => ({
								...prev,
								[key]: v === "" ? "" : Number(v)
							}));
						},
						onBlur: () => {
							setQuotas((prev) => ({
								...prev,
								[key]: Math.max(minAllowed, Number(prev[key] || 0))
							}));
						},
						style: {
							flex: 1,
							padding: "8px 12px",
							borderRadius: "6px",
							border: "1px solid var(--line)",
							fontSize: "14px",
							fontWeight: 700,
							textAlign: "right"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							fontWeight: 600
						},
						children: "Days"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						fontSize: "10.5px",
						color: "var(--muted)",
						marginTop: "4px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Used: ",
						used,
						"d | Reserved: ",
						reserved,
						"d"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Min: ",
						minAllowed,
						"d"
					] })]
				})
			]
		}, key);
	};
	const modalContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "quota-modal-backdrop",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "quota-modal-dialog",
			onClick: (e) => e.stopPropagation(),
			style: { maxWidth: "580px" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "quota-modal-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: 0,
						fontSize: "16px",
						fontWeight: 800,
						color: "var(--ink)"
					},
					children: "Configure Employee Leave Quotas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "3px 0 0",
						fontSize: "12px",
						color: "var(--muted)"
					},
					children: activeEmp ? `Configuring quotas for ${activeEmp.name}` : "Assign monthly leave quotas"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-button",
					onClick: onClose,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				style: {
					display: "flex",
					flexDirection: "column",
					flex: 1,
					minHeight: 0,
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "quota-modal-body",
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "14px"
					},
					children: [
						errorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "10px 14px",
								borderRadius: "8px",
								background: "#fef2f2",
								border: "1px solid #fecaca",
								color: "#dc2626",
								fontSize: "12px",
								fontWeight: 600
							},
							children: errorMsg
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: {
								display: "block",
								fontSize: "12px",
								fontWeight: 700,
								color: "var(--ink)",
								marginBottom: "5px"
							},
							children: "Target Employee"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: empId,
							onChange: (e) => {
								const newId = e.target.value;
								setEmpId(newId);
								const chosen = employees.find((x) => (x.id || x._id || x.employeeId) === newId);
								const isIntern = isInternEmployee(chosen);
								const baseDefaults = defaults || (isIntern ? INTERN_MONTHLY_QUOTAS : FULLTIME_MONTHLY_QUOTAS);
								if (chosen && chosen.balances) setQuotas({
									casual: chosen.balances.casual?.allowance ?? (isIntern ? 0 : 1),
									sick: chosen.balances.sick?.allowance ?? 1,
									earned: chosen.balances.earned?.allowance ?? 0,
									comp_off: chosen.balances.comp_off?.allowance ?? 0,
									maternity: chosen.balances.maternity?.allowance ?? 0,
									lop: chosen.balances.lop?.allowance ?? 0
								});
								else setQuotas({ ...baseDefaults });
							},
							disabled: Boolean(targetEmployee),
							style: {
								width: "100%",
								padding: "9px 12px",
								borderRadius: "8px",
								border: "1px solid var(--line)",
								background: targetEmployee ? "#f1f5f9" : "#fff",
								fontSize: "13px"
							},
							children: employees.filter(Boolean).map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: emp._id || emp.id || emp.employeeId,
								children: [
									emp.name,
									" (",
									emp.employeeId || "ID",
									" - ",
									emp.department || "General",
									")"
								]
							}, emp._id || emp.id || emp.employeeId))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setQuotas({ ...FULLTIME_MONTHLY_QUOTAS }),
								style: {
									padding: "10px 12px",
									borderRadius: "8px",
									border: "1.5px solid #bfdbfe",
									background: "#eff6ff",
									color: "#1d4ed8",
									fontSize: "12px",
									fontWeight: 700,
									cursor: "pointer",
									textAlign: "left",
									display: "flex",
									flexDirection: "column",
									gap: "2px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "💼 Full-Time Policy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 500,
										color: "#3b82f6"
									},
									children: "2 Days (1 CL + 1 SL)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setQuotas({ ...INTERN_MONTHLY_QUOTAS }),
								style: {
									padding: "10px 12px",
									borderRadius: "8px",
									border: "1.5px solid #a7f3d0",
									background: "#ecfdf5",
									color: "#047857",
									fontSize: "12px",
									fontWeight: 700,
									cursor: "pointer",
									textAlign: "left",
									display: "flex",
									flexDirection: "column",
									gap: "2px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🎓 Intern Policy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 500,
										color: "#10b981"
									},
									children: "1 Day (1 SL)"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "12px",
								fontWeight: 700,
								color: "var(--ink)",
								marginBottom: "8px"
							},
							children: "Monthly Active Quotas:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "10px"
							},
							children: primaryKeys.map(renderQuotaBox)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								borderTop: "1px dashed var(--line)",
								paddingTop: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setShowExtra(!showExtra),
								style: {
									border: "none",
									background: "transparent",
									color: "var(--teal)",
									fontSize: "12px",
									fontWeight: 700,
									cursor: "pointer",
									padding: "4px 0",
									display: "flex",
									alignItems: "center",
									gap: "6px"
								},
								children: showExtra ? "▲ Hide Advanced Categories" : "+ Show Advanced Categories (Privilege, Comp-Off, Maternity, LOP)"
							}), showExtra && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "10px",
									marginTop: "10px"
								},
								children: extraKeys.map(renderQuotaBox)
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "quota-modal-footer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							color: "var(--muted)"
						},
						children: "Values persist immediately across payroll and ESS attendance calculations."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: onClose,
							disabled: busy,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "ui-button primary",
							disabled: busy,
							onClick: handleSubmit,
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
								size: 14,
								className: "spin-slow"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), busy ? "Saving Quotas…" : "Save All Quotas"]
						})]
					})]
				})]
			})]
		})
	});
	return typeof document !== "undefined" && document?.body ? (0, import_react_dom.createPortal)(modalContent, document.body) : modalContent;
}
function CompanyDefaultsModal({ open, onClose, currentDefaults, employees = [], onSaveDefaults, onBulkApply }) {
	const [form, setForm] = (0, import_react.useState)({ ...currentDefaults });
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [confirmBulk, setConfirmBulk] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) {
			setForm({ ...currentDefaults });
			setConfirmBulk(false);
		}
	}, [open]);
	if (!open) return null;
	const handleSave = (e) => {
		if (e?.preventDefault) e.preventDefault();
		onSaveDefaults(form);
		onClose();
	};
	const handleApplyAll = async () => {
		setBusy(true);
		try {
			await onBulkApply(form);
			onClose();
		} catch (err) {
			alert(err.message || "Failed to bulk apply defaults.");
		} finally {
			setBusy(false);
		}
	};
	const modalContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "quota-modal-backdrop",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "quota-modal-dialog",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "quota-modal-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: 0,
						fontSize: "16px",
						fontWeight: 800,
						color: "var(--ink)"
					},
					children: "Configure Default Company Leave Quotas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "3px 0 0",
						fontSize: "12px",
						color: "var(--muted)"
					},
					children: "Define standard default leave allowances for the organization."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-button",
					onClick: onClose,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSave,
				style: {
					display: "flex",
					flexDirection: "column",
					flex: 1,
					minHeight: 0,
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "quota-modal-body",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "quota-inputs-grid",
						children: [
							"casual",
							"sick",
							"earned",
							"comp_off",
							"maternity",
							"lop"
						].map((key) => {
							const meta = LEAVE_TYPE_META[key];
							const Icon = meta.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "quota-input-box",
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
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													width: "22px",
													height: "22px",
													borderRadius: "6px",
													background: meta.bg,
													color: meta.color,
													display: "grid",
													placeItems: "center"
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 12 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "12px",
													fontWeight: 700,
													color: "var(--ink)"
												},
												children: meta.name
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												fontWeight: 800,
												padding: "1px 6px",
												borderRadius: "4px",
												background: meta.bg,
												color: meta.color
											},
											children: meta.code
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px",
											marginTop: "4px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "0",
											step: "0.5",
											required: true,
											value: form[key] !== void 0 && form[key] !== null ? form[key] : "",
											onChange: (e) => {
												const v = e.target.value;
												setForm((prev) => ({
													...prev,
													[key]: v === "" ? "" : Number(v)
												}));
											},
											onBlur: () => {
												setForm((prev) => ({
													...prev,
													[key]: Math.max(0, Number(prev[key] || 0))
												}));
											},
											style: {
												flex: 1,
												padding: "7px 10px",
												borderRadius: "6px",
												border: "1px solid var(--line)",
												fontSize: "13px",
												fontWeight: 700,
												textAlign: "right"
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "12px",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Days"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											color: "var(--muted)",
											marginTop: "2px"
										},
										children: "Default annual entitlement"
									})
								]
							}, key);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							background: "#f8fafc",
							border: "1px dashed var(--line)",
							borderRadius: "10px",
							padding: "12px 16px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								flexWrap: "wrap",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								style: {
									fontSize: "12.5px",
									color: "var(--ink)",
									display: "block"
								},
								children: [
									"Bulk Apply Defaults to All Employees (",
									employees.length,
									" Staff)"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: "Overwrites or initializes all employees with these default quotas."
							})] }), !confirmBulk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: () => setConfirmBulk(true),
								style: {
									fontSize: "11px",
									padding: "5px 12px"
								},
								children: "⚡ Apply to All Staff"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button primary",
									disabled: busy,
									onClick: handleApplyAll,
									style: {
										fontSize: "11px",
										padding: "5px 12px",
										background: "#dc2626"
									},
									children: busy ? "Applying…" : "Confirm Bulk Apply"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: () => setConfirmBulk(false),
									style: {
										fontSize: "11px",
										padding: "5px 8px"
									},
									children: "Cancel"
								})]
							})]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "quota-modal-footer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							color: "var(--muted)"
						},
						children: "Saved default quotas will be suggested for all employee configurations."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: onClose,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "ui-button primary",
							onClick: handleSave,
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { size: 14 }), " Save Company Defaults"]
						})]
					})]
				})]
			})]
		})
	});
	return typeof document !== "undefined" && document?.body ? (0, import_react_dom.createPortal)(modalContent, document.body) : modalContent;
}
function LeaveBalanceTable({ balances = [], employees = [], onSwitchTab }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const [selectedDept, setSelectedDept] = (0, import_react.useState)("all");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [expandedEmpIds, setExpandedEmpIds] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [modalEmployee, setModalEmployee] = (0, import_react.useState)(null);
	const [allInOneOpen, setAllInOneOpen] = (0, import_react.useState)(false);
	const [defaultsModalOpen, setDefaultsModalOpen] = (0, import_react.useState)(false);
	const [companyDefaults, setCompanyDefaults] = (0, import_react.useState)(() => getDefaultCompanyQuotas());
	const [notice, setNotice] = (0, import_react.useState)("");
	const [noticeType, setNoticeType] = (0, import_react.useState)("success");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [liveStoreState, setLiveStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => hrStore.subscribe(setLiveStoreState), []);
	const rawEmployees = employees.length > 0 ? employees : liveStoreState.employees || hrStore.getState().employees || [];
	const matchBalance = (b, emp) => {
		if (!b || !emp) return false;
		const empIdStr = String(emp.id || emp._id || "").trim().toLowerCase();
		const empCode = String(emp.employeeId || "").trim().toLowerCase();
		if (typeof b.employeeId === "object" && b.employeeId !== null) {
			const bObjId = String(b.employeeId._id || b.employeeId.id || "").trim().toLowerCase();
			const bObjCode = String(b.employeeId.employeeId || "").trim().toLowerCase();
			if (bObjId && empIdStr && bObjId === empIdStr) return true;
			if (bObjCode && empCode && bObjCode === empCode) return true;
			if (bObjId && empCode && bObjId === empCode) return true;
			if (bObjCode && empIdStr && bObjCode === empIdStr) return true;
		} else if (b.employeeId) {
			const bStr = String(b.employeeId).trim().toLowerCase();
			if (empIdStr && bStr === empIdStr) return true;
			if (empCode && bStr === empCode) return true;
		}
		return false;
	};
	const employeeMap = /* @__PURE__ */ new Map();
	for (const emp of (rawEmployees || []).filter(Boolean)) {
		const key = emp?.id || emp?._id || emp?.employeeId;
		if (key) {
			const cleanName = emp.name && emp.name !== "Employee" ? emp.name : emp.displayName || emp.name || emp.username || (emp.email ? emp.email.split("@")[0] : "Staff Member");
			employeeMap.set(String(key), {
				id: emp._id || emp.id || key,
				_id: emp._id || emp.id || key,
				name: cleanName,
				employeeId: emp.employeeId || "",
				department: emp.department || "General",
				designation: emp.designation || "Pending Designation",
				employmentType: emp.employmentType || "",
				avatar: emp.avatar || "",
				balances: {}
			});
		}
	}
	for (const b of balances) {
		let matchedKey = null;
		for (const [key, emp] of employeeMap.entries()) if (matchBalance(b, emp)) {
			matchedKey = key;
			break;
		}
		if (!matchedKey) {
			const empObj = typeof b.employeeId === "object" && b.employeeId !== null ? b.employeeId : null;
			if (!empObj) continue;
			const realId = String(empObj._id || empObj.id || empObj.employeeId || "");
			if (!realId) continue;
			const cleanObjName = empObj.name && empObj.name !== "Employee" ? empObj.name : empObj.displayName || empObj.name || empObj.username || (empObj.email ? empObj.email.split("@")[0] : "Staff Member");
			const empEntry = {
				id: realId,
				_id: String(empObj._id || empObj.id || realId),
				name: cleanObjName,
				employeeId: empObj.employeeId || "",
				department: empObj.department || "General",
				designation: empObj.designation || "Pending Designation",
				employmentType: empObj.employmentType || "",
				avatar: empObj.avatar || empObj.avatarUrl || "",
				balances: {}
			};
			employeeMap.set(realId, empEntry);
			matchedKey = realId;
		}
		const emp = employeeMap.get(matchedKey);
		if (emp && b.leaveType) {
			const allowance = Number(b.allowance || 0);
			const used = Number(b.used || 0);
			const reserved = Number(b.reserved || 0);
			emp.balances[b.leaveType.toLowerCase()] = {
				allowance,
				used,
				reserved,
				available: allowance - used - reserved,
				_id: b._id
			};
		}
	}
	const allStaffList = Array.from(employeeMap.values()).map((emp) => {
		const leaveKeys = [
			"casual",
			"sick",
			"earned",
			"comp_off",
			"maternity",
			"lop"
		];
		const isIntern = isInternEmployee(emp);
		const hasConfigured = Object.entries(emp.balances || {}).filter(([_, b]) => b?.allowance !== void 0 && b?.allowance !== null && Number(b.allowance) > 0).length > 0;
		let isAutoFilled = false;
		if (!hasConfigured) {
			isAutoFilled = true;
			const defaultCasual = isIntern ? 0 : 1;
			const defaultSick = 1;
			emp.balances.casual = {
				allowance: defaultCasual,
				used: 0,
				reserved: 0,
				available: defaultCasual
			};
			emp.balances.sick = {
				allowance: defaultSick,
				used: 0,
				reserved: 0,
				available: defaultSick
			};
			for (const k of [
				"earned",
				"comp_off",
				"maternity",
				"lop"
			]) if (!emp.balances[k]) emp.balances[k] = {
				allowance: 0,
				used: 0,
				reserved: 0,
				available: 0
			};
		} else {
			if (!emp.balances.casual) emp.balances.casual = {
				allowance: isIntern ? 0 : 1,
				used: 0,
				reserved: 0,
				available: isIntern ? 0 : 1
			};
			if (!emp.balances.sick) emp.balances.sick = {
				allowance: 1,
				used: 0,
				reserved: 0,
				available: 1
			};
			for (const k of [
				"earned",
				"comp_off",
				"maternity",
				"lop"
			]) if (!emp.balances[k]) emp.balances[k] = {
				allowance: 0,
				used: 0,
				reserved: 0,
				available: 0
			};
		}
		let totalAllowance = 0;
		let totalUsed = 0;
		let totalReserved = 0;
		let totalAvailable = 0;
		for (const k of leaveKeys) {
			const item = emp.balances[k];
			if (item) {
				totalAllowance += item.allowance;
				totalUsed += item.used;
				totalReserved += item.reserved;
				totalAvailable += item.available;
			}
		}
		return {
			...emp,
			isIntern,
			isAutoFilled,
			totalAllowance,
			totalUsed,
			totalReserved,
			totalAvailable
		};
	});
	const departments = Array.from(new Set(allStaffList.map((e) => e.department).filter(Boolean)));
	const filteredStaff = allStaffList.filter((emp) => {
		if (selectedDept !== "all" && emp.department !== selectedDept) return false;
		if (typeFilter === "intern" && !emp.isIntern) return false;
		if (typeFilter === "full_time" && emp.isIntern) return false;
		if (!search.trim()) return true;
		const q = search.toLowerCase().trim();
		return emp.name.toLowerCase().includes(q) || emp.employeeId.toLowerCase().includes(q) || emp.department.toLowerCase().includes(q);
	});
	const toggleExpand = (empId) => {
		setExpandedEmpIds((prev) => {
			const next = new Set(prev);
			if (next.has(empId)) next.delete(empId);
			else next.add(empId);
			return next;
		});
	};
	const toggleExpandAll = () => {
		if (expandedEmpIds.size === filteredStaff.length && filteredStaff.length > 0) setExpandedEmpIds(/* @__PURE__ */ new Set());
		else setExpandedEmpIds(new Set(filteredStaff.filter(Boolean).map((e) => e?.id || e?._id || e?.employeeId).filter(Boolean)));
	};
	const handleEditEmployeeQuotas = (emp, e) => {
		if (e) e.stopPropagation();
		setModalEmployee(emp);
		setAllInOneOpen(true);
	};
	const handleApplyPolicyToAll = async () => {
		setBusy(true);
		try {
			const res = await apiClient.post("/leave/hr/balances/auto-fill-policies");
			await hrStore.refresh();
			setNotice(res.data?.message || `Successfully applied standard policy to all ${allStaffList.length} employees (Full-Time: 2 days, Intern: 1 day)!`);
			setNoticeType("success");
			setTimeout(() => setNotice(""), 5e3);
		} catch {
			try {
				for (const emp of allStaffList.filter(Boolean)) {
					const empId = emp?.id || emp?._id || emp?.employeeId;
					if (!empId) continue;
					const isIntern = isInternEmployee(emp);
					await apiClient.put(`/leave/hr/balances/${empId}/casual`, { allowance: isIntern ? 0 : 1 });
					await apiClient.put(`/leave/hr/balances/${empId}/sick`, { allowance: 1 });
				}
				await hrStore.refresh();
				setNotice(`Successfully applied standard monthly policy to all ${allStaffList.length} employees!`);
				setNoticeType("success");
				setTimeout(() => setNotice(""), 5e3);
			} catch (fallbackErr) {
				setNotice(fallbackErr.message || "Failed to auto-apply policy.");
				setNoticeType("error");
				setTimeout(() => setNotice(""), 5e3);
			}
		} finally {
			setBusy(false);
		}
	};
	const handleApplyPolicyToSingleEmployee = async (emp, e) => {
		if (e) e.stopPropagation();
		const empId = String(emp._id || emp.id || emp.employeeId || "");
		const isIntern = isInternEmployee(emp);
		try {
			await apiClient.put(`/leave/hr/balances/${empId}/casual`, { allowance: isIntern ? 0 : 1 });
			await apiClient.put(`/leave/hr/balances/${empId}/sick`, { allowance: 1 });
			const storeBals = hrStore.getState().leaveBalances || [];
			for (const [k, val] of Object.entries({
				casual: isIntern ? 0 : 1,
				sick: 1
			})) {
				const existing = storeBals.find((b) => {
					const bEmpId = typeof b.employeeId === "object" ? b.employeeId?._id || b.employeeId?.id : b.employeeId;
					return String(bEmpId) === empId && b.leaveType === k;
				});
				if (existing) existing.allowance = val;
			}
			hrStore.notify?.();
			hrStore.refresh().catch(() => {});
			setNotice(`Applied ${isIntern ? "Intern Policy (1 SL)" : "Full-Time Policy (1 CL + 1 SL)"} to ${emp.name}!`);
			setNoticeType("success");
			setTimeout(() => setNotice(""), 4e3);
		} catch (err) {
			setNotice(err.message || "Failed to apply policy.");
			setNoticeType("error");
			setTimeout(() => setNotice(""), 4e3);
		}
	};
	const handleSaveCompanyDefaults = (newDefaults) => {
		saveDefaultCompanyQuotas(newDefaults);
		setCompanyDefaults(newDefaults);
		setNotice("Company default leave quotas saved successfully!");
		setNoticeType("success");
		setTimeout(() => setNotice(""), 4e3);
	};
	const handleBulkApply = async (newDefaults) => {
		try {
			const res = await apiClient.post("/leave/hr/balances/bulk-apply", { defaults: newDefaults });
			await hrStore.refresh();
			setNotice(res?.data?.message || res?.message || `Successfully applied default quotas to all employees!`);
			setNoticeType("success");
		} catch (bulkErr) {
			console.warn("Batch bulk-apply error, trying batch fallback:", bulkErr.message);
			const types = [
				"casual",
				"sick",
				"earned",
				"comp_off",
				"maternity",
				"lop"
			];
			for (const emp of allStaffList) {
				const empId = emp.id || emp._id || emp.employeeId;
				for (const t of types) try {
					await apiClient.put(`/leave/hr/balances/${empId}/${t}`, { allowance: newDefaults[t] });
				} catch (e) {
					console.warn(`Allowance skip for ${empId}/${t}:`, e.message);
				}
			}
			await hrStore.refresh();
			setNotice(`Applied default quotas to ${allStaffList.length} employees!`);
			setNoticeType("success");
		}
		setTimeout(() => setNotice(""), 5e3);
	};
	const totalStaffCount = allStaffList.length;
	const totalAllocatedAll = allStaffList.reduce((sum, e) => sum + e.totalAllowance, 0);
	const totalUsedAll = allStaffList.reduce((sum, e) => sum + e.totalUsed, 0);
	const totalAvailableAll = allStaffList.reduce((sum, e) => sum + e.totalAvailable, 0);
	const leaveKeys = [
		"casual",
		"sick",
		"earned",
		"comp_off",
		"maternity",
		"lop"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel",
		style: { padding: "24px" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					flexWrap: "wrap",
					gap: "14px",
					marginBottom: "18px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					style: {
						fontSize: "18px",
						fontWeight: 800,
						margin: 0,
						color: "var(--ink)",
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
						size: 18,
						style: { color: "var(--teal)" }
					}), " Leave Balances & Quotas"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						fontSize: "12.5px",
						color: "var(--muted)",
						margin: "3px 0 0 0"
					},
					children: "Monthly allocations. Unconfigured employees are automatically assigned policy leaves (Full-Time: 2 days, Interns: 1 day)."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "10px",
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button primary",
							onClick: handleApplyPolicyToAll,
							disabled: busy,
							style: {
								fontSize: "12px",
								padding: "8px 16px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
								size: 13,
								className: "spin-slow"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 13 }), "⚡ Auto-Fill All by Policy"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => {
								setModalEmployee(null);
								setAllInOneOpen(true);
							},
							style: {
								fontSize: "12px",
								padding: "8px 14px",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }), " Custom Quota"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => setDefaultsModalOpen(true),
							style: {
								fontSize: "12px",
								padding: "8px 12px",
								display: "inline-flex",
								alignItems: "center",
								gap: "5px"
							},
							title: "Configure advanced templates",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 13 }), " Defaults"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
					gap: "10px",
					marginBottom: "18px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f0fdf4",
							border: "1px solid #bbf7d0",
							borderRadius: "10px",
							padding: "10px 14px",
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: "32px",
								height: "32px",
								borderRadius: "8px",
								background: "#dcfce7",
								color: "#15803d",
								display: "grid",
								placeItems: "center",
								fontSize: "15px",
								flexShrink: 0
							},
							children: "💼"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "12.5px",
								fontWeight: 800,
								color: "#166534"
							},
							children: "Full-Time: 2 Paid Days / mo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								color: "#15803d"
							},
							children: "1 Casual Leave (CL) + 1 Sick Leave (SL)"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f0f9ff",
							border: "1px solid #bae6fd",
							borderRadius: "10px",
							padding: "10px 14px",
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: "32px",
								height: "32px",
								borderRadius: "8px",
								background: "#e0f2fe",
								color: "#0369a1",
								display: "grid",
								placeItems: "center",
								fontSize: "15px",
								flexShrink: 0
							},
							children: "🎓"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "12.5px",
								fontWeight: 800,
								color: "#075985"
							},
							children: "Interns: 1 Paid Day / mo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								color: "#0284c7"
							},
							children: "1 Sick Leave (SL) • Monthly refresh"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fffbeb",
							border: "1px solid #fde68a",
							borderRadius: "10px",
							padding: "10px 14px",
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: "32px",
								height: "32px",
								borderRadius: "8px",
								background: "#fef3c7",
								color: "#b45309",
								display: "grid",
								placeItems: "center",
								fontSize: "15px",
								flexShrink: 0
							},
							children: "⚠️"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "12.5px",
								fontWeight: 800,
								color: "#92400e"
							},
							children: "Month-End Rule (25th+)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								color: "#b45309"
							},
							children: "Leaves from 25th onwards = Double LOP"
						})] })]
					})
				]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "12px",
					padding: "12px 16px",
					borderRadius: "10px",
					fontSize: "12.5px",
					fontWeight: 600,
					marginBottom: "16px",
					background: noticeType === "error" ? "#fef2f2" : "#e6fffa",
					border: noticeType === "error" ? "1px solid #fecaca" : "1px solid #b2f5ea",
					color: noticeType === "error" ? "#dc2626" : "#006E6F",
					animation: "fadeUp 0.2s ease"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [noticeType === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notice })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setNotice(""),
					style: {
						border: 0,
						background: "transparent",
						cursor: "pointer",
						color: "inherit"
					},
					children: "✕"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: "12px",
					marginBottom: "20px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fafbfc",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "12px 16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									color: "var(--muted)",
									textTransform: "uppercase",
									letterSpacing: "0.04em"
								},
								children: "Covered Workforce"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "20px",
									fontWeight: 800,
									color: "var(--ink)",
									marginTop: "2px"
								},
								children: [totalStaffCount, " Staff"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: "Active enrolled team"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fafbfc",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "12px 16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									color: "var(--muted)",
									textTransform: "uppercase",
									letterSpacing: "0.04em"
								},
								children: "Monthly Quota Pool"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "20px",
									fontWeight: 800,
									color: "#0284c7",
									marginTop: "2px"
								},
								children: [totalAllocatedAll, " Days"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: "Standard monthly entitlement"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fafbfc",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "12px 16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									color: "var(--muted)",
									textTransform: "uppercase",
									letterSpacing: "0.04em"
								},
								children: "Total Leave Taken"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "20px",
									fontWeight: 800,
									color: totalUsedAll > 0 ? "#d97706" : "var(--muted)",
									marginTop: "2px"
								},
								children: [totalUsedAll, " Days"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: "Approved leaves this month"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fafbfc",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "12px 16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									color: "var(--muted)",
									textTransform: "uppercase",
									letterSpacing: "0.04em"
								},
								children: "Available Remaining"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "20px",
									fontWeight: 800,
									color: "#006E6F",
									marginTop: "2px"
								},
								children: [totalAvailableAll, " Days"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: "Remaining company pool"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: "12px",
					marginBottom: "16px",
					flexWrap: "wrap",
					background: "#fafbfc",
					padding: "10px 14px",
					borderRadius: "10px",
					border: "1px solid var(--line)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "10px",
						flex: "1 1 260px",
						maxWidth: "420px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							position: "relative",
							width: "100%"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							size: 14,
							style: {
								position: "absolute",
								left: "10px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "var(--muted)"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "Search employee by name, ID, or department…",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							style: {
								width: "100%",
								padding: "7px 10px 7px 32px",
								borderRadius: "8px",
								border: "1px solid var(--line)",
								fontSize: "12.5px",
								background: "#fff"
							}
						})]
					}), search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-button",
						onClick: () => setSearch(""),
						style: {
							fontSize: "11px",
							padding: "4px 8px"
						},
						children: "Clear"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "10px",
						flexWrap: "wrap"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: typeFilter,
							onChange: (e) => setTypeFilter(e.target.value),
							style: {
								padding: "6px 10px",
								borderRadius: "8px",
								border: "1px solid var(--line)",
								fontSize: "12px",
								background: "#fff"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Roles (Full-Time & Interns)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "full_time",
									children: "💼 Full-Time Only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "intern",
									children: "🎓 Interns Only"
								})
							]
						}),
						departments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, {
								size: 13,
								style: { color: "var(--muted)" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: selectedDept,
								onChange: (e) => setSelectedDept(e.target.value),
								style: {
									padding: "6px 10px",
									borderRadius: "8px",
									border: "1px solid var(--line)",
									fontSize: "12px",
									background: "#fff"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Departments"
								}), departments.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: dept,
									children: dept
								}, dept))]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: toggleExpandAll,
							style: {
								fontSize: "11px",
								padding: "6px 12px"
							},
							children: expandedEmpIds.size === filteredStaff.length && filteredStaff.length > 0 ? "Collapse All" : "Expand All"
						})
					]
				})]
			}),
			filteredStaff.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "40px 20px",
					textAlign: "center",
					color: "var(--muted)",
					background: "#fafbfc",
					borderRadius: "12px",
					border: "1px dashed var(--line)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
						size: 28,
						style: {
							color: "#cbd5e1",
							marginBottom: "8px"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontWeight: 600,
							fontSize: "14px",
							color: "var(--ink)"
						},
						children: "No matching employees found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { fontSize: "12px" },
						children: search ? "Try clearing or modifying your search filter." : "Add employees to assign leave quotas."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: filteredStaff.filter(Boolean).map((emp) => {
				const empKey = emp?.id || emp?._id || emp?.employeeId || "staff";
				const isExpanded = expandedEmpIds.has(empKey);
				const activeLeaveTypes = leaveKeys.filter((k) => {
					const bal = emp.balances[k];
					return bal && Number(bal.allowance) > 0;
				});
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `emp-balance-row-card ${isExpanded ? "expanded" : ""}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "emp-balance-header-row",
						onClick: () => toggleExpand(empKey),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "12px",
								minWidth: "240px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										color: isExpanded ? "var(--teal)" : "var(--muted)",
										transition: "transform 0.2s ease",
										transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 18 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										width: "38px",
										height: "38px",
										borderRadius: "50%",
										background: emp.isIntern ? "linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(2, 132, 199, 0.05))" : "linear-gradient(135deg, rgba(0, 110, 111, 0.15), rgba(0, 110, 111, 0.05))",
										color: emp.isIntern ? "#0284c7" : "var(--teal)",
										display: "grid",
										placeItems: "center",
										fontWeight: 800,
										fontSize: "13px",
										border: emp.isIntern ? "1px solid rgba(2, 132, 199, 0.2)" : "1px solid rgba(0, 110, 111, 0.2)",
										flexShrink: 0
									},
									children: emp.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										flexWrap: "wrap"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "13.5px",
												color: "var(--ink)"
											},
											children: emp.name
										}),
										emp.employeeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10.5px",
												fontWeight: 700,
												padding: "1px 6px",
												borderRadius: "4px",
												background: "#f1f5f9",
												color: "#475569"
											},
											children: emp.employeeId
										}),
										emp.isIntern ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												fontWeight: 700,
												padding: "2px 8px",
												borderRadius: "999px",
												background: "#e0f2fe",
												color: "#0369a1",
												border: "1px solid #bae6fd"
											},
											children: "🎓 Intern"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												fontWeight: 700,
												padding: "2px 8px",
												borderRadius: "999px",
												background: "#dcfce7",
												color: "#15803d",
												border: "1px solid #bbf7d0"
											},
											children: "💼 Full-Time"
										}),
										emp.isAutoFilled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "9.5px",
												fontWeight: 600,
												padding: "1px 6px",
												borderRadius: "4px",
												background: "#f8fafc",
												color: "#64748b",
												border: "1px solid #e2e8f0"
											},
											title: "Automatically initialized from company monthly policy",
											children: "⚡ Auto-Policy"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "11px",
										color: "var(--muted)",
										marginTop: "2px",
										display: "block"
									},
									children: [
										emp.department,
										" • ",
										emp.designation
									]
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "14px",
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										gap: "6px",
										flexWrap: "wrap",
										alignItems: "center"
									},
									children: activeLeaveTypes.length > 0 ? activeLeaveTypes.map((k) => {
										const bal = emp.balances[k];
										const meta = LEAVE_TYPE_META[k];
										if (!bal || !meta) return null;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "11px",
												fontWeight: 700,
												padding: "2px 8px",
												borderRadius: "6px",
												background: meta.bg,
												border: `1px solid ${meta.color}33`,
												color: meta.color
											},
											children: [
												meta.code,
												": ",
												bal.allowance,
												"d"
											]
										}, k);
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "11px",
											color: "#94a3b8",
											fontStyle: "italic"
										},
										children: "No active quota"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										textAlign: "right",
										minWidth: "130px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											display: "inline-block",
											fontSize: "12px",
											fontWeight: 800,
											padding: "3px 12px",
											borderRadius: "999px",
											background: emp.totalAvailable > 0 ? "#ecfdf5" : "#fef2f2",
											color: emp.totalAvailable > 0 ? "#047857" : "#dc2626",
											border: emp.totalAvailable > 0 ? "1px solid #a7f3d0" : "1px solid #fecaca"
										},
										children: [
											emp.totalAvailable,
											" ",
											emp.totalAvailable === 1 ? "Day" : "Days",
											" Available"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											marginTop: "2px"
										},
										children: [
											"Quota: ",
											emp.totalAllowance,
											"d | Used: ",
											emp.totalUsed,
											"d"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: (e) => handleEditEmployeeQuotas(emp, e),
									style: {
										fontSize: "11px",
										padding: "5px 12px",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { size: 11 }), " Edit Quotas"]
								})
							]
						})]
					}), isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "emp-balance-details-drawer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "12px",
								flexWrap: "wrap",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "12.5px",
									fontWeight: 700,
									color: "var(--ink)"
								},
								children: [
									"Detailed Leave Category Quotas for ",
									emp.name,
									":"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px",
									flexWrap: "wrap"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: (e) => handleApplyPolicyToSingleEmployee(emp, e),
									style: {
										fontSize: "11px",
										padding: "5px 12px",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
											size: 11,
											style: { color: "var(--teal)" }
										}),
										"Apply ",
										emp.isIntern ? "Intern Policy (1 SL)" : "Full-Time Policy (1 CL + 1 SL)"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button primary",
									onClick: (e) => handleEditEmployeeQuotas(emp, e),
									style: {
										fontSize: "11px",
										padding: "5px 12px",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { size: 11 }), " Customize Quotas"]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "emp-leave-breakdown-grid",
							children: leaveKeys.map((key) => {
								const meta = LEAVE_TYPE_META[key];
								const Icon = meta.icon;
								const record = emp.balances[key];
								const allowance = record ? record.allowance : 0;
								const used = record ? record.used : 0;
								const reserved = record ? record.reserved : 0;
								const available = allowance - used - reserved;
								const percentUsed = allowance > 0 ? Math.min(100, Math.round(used / allowance * 100)) : 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "emp-leave-item-card",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											marginBottom: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													width: "22px",
													height: "22px",
													borderRadius: "6px",
													background: meta.bg,
													color: meta.color,
													display: "grid",
													placeItems: "center"
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 12 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "11.5px",
													fontWeight: 700,
													color: "var(--ink)"
												},
												children: meta.name
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												fontWeight: 800,
												padding: "1px 5px",
												borderRadius: "4px",
												background: meta.bg,
												color: meta.color
											},
											children: meta.code
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: { marginTop: "8px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "18px",
												fontWeight: 800,
												color: available > 0 ? "#006E6F" : "#dc2626"
											},
											children: [
												available,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "11px",
														fontWeight: 600,
														color: "var(--muted)"
													},
													children: "Days Rem."
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "11px",
												color: "var(--muted)",
												marginTop: "2px",
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Allowance: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [allowance, "d"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button secondary",
												onClick: (e) => handleEditEmployeeQuotas(emp, e),
												style: {
													fontSize: "10px",
													padding: "1px 6px",
													height: "auto",
													lineHeight: "1.4"
												},
												children: "Change"
											})]
										})]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: { marginTop: "10px" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												width: "100%",
												height: "5px",
												background: "#e2e8f0",
												borderRadius: "999px",
												overflow: "hidden",
												marginBottom: "4px"
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
												width: `${percentUsed}%`,
												height: "100%",
												background: percentUsed > 80 ? "#dc2626" : "var(--teal)",
												borderRadius: "999px"
											} })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												fontSize: "10px",
												color: "var(--muted)"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Used: ",
												used,
												"d"
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Res: ",
												reserved,
												"d"
											] })]
										})]
									})]
								}, key);
							})
						})]
					})]
				}, empKey);
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllInOneQuotaModal, {
				open: allInOneOpen,
				onClose: () => {
					setAllInOneOpen(false);
					setModalEmployee(null);
				},
				targetEmployee: modalEmployee,
				employees: allStaffList,
				defaults: companyDefaults,
				onSuccess: (msg) => {
					setNotice(msg);
					setNoticeType("success");
					setTimeout(() => setNotice(""), 4500);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyDefaultsModal, {
				open: defaultsModalOpen,
				onClose: () => setDefaultsModalOpen(false),
				currentDefaults: companyDefaults,
				employees: allStaffList,
				onSaveDefaults: handleSaveCompanyDefaults,
				onBulkApply: handleBulkApply
			})
		]
	});
}
// src/pages/LeaveManagementPage.jsx
var labels = {
	pending_tl: "Pending TL Approval",
	pending_manager: "Pending Manager Approval",
	pending_director: "Pending Director Sign-Off",
	pending_hr: "Pending HR Review",
	pending_admin: "Pending Admin Approval (LOP)",
	approved: "Approved",
	rejected: "Rejected",
	cancelled: "Cancelled"
};
var leaveTypeLabels = {
	casual: "Casual Leave (CL)",
	sick: "Sick / Medical Leave (SL)",
	earned: "Earned / Privilege Leave (EL)",
	comp_off: "Compensatory Off",
	maternity: "Maternity / Paternity Leave",
	lop: "Loss of Pay (LOP) / Unpaid"
};
function formatDate(value) {
	if (!value) return "—";
	return new Date(value).toLocaleDateString([], {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
function RequestStatus({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
		tone: status === "approved" ? "info" : status === "rejected" || status === "cancelled" ? "warning" : status === "pending_admin" ? "danger" : status === "pending_director" ? "purple" : status === "pending_manager" ? "blue" : status === "pending_tl" ? "teal" : status === "pending_hr" ? "warning" : "neutral",
		children: labels[status] ?? status
	});
}
function RequestCard({ request, onSelect, selected, onQuickApprove, onQuickReject, onDeleteRequest }) {
	if (!request) return null;
	const cardRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (selected && cardRef.current) cardRef.current.scrollIntoView({
			behavior: "smooth",
			block: "nearest"
		});
	}, [selected]);
	const employee = request.employeeName || request.employeeId?.name || "Employee";
	const empCode = request.employeeCode || (typeof request.employeeId === "object" ? request.employeeId?.employeeId : "") || "";
	const isHalfDay = Boolean(request.isHalfDay || request.days === .5 || request.units === .5);
	const isPending = request.status === "pending_tl" || request.status === "pending_manager" || request.status === "pending_director" || request.status === "pending_hr" || request.status === "pending_admin";
	const initials = (employee || "E").split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
	const hue = (employee || "A").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: cardRef,
		className: `leave-request-card ${selected ? "selected" : ""}`,
		onClick: () => onSelect(request),
		style: {
			cursor: "pointer",
			position: "relative",
			display: "flex",
			flexDirection: "column",
			gap: "10px",
			padding: "13px 15px",
			borderRadius: "11px",
			border: selected ? "1.5px solid var(--teal, #006e6f)" : "1px solid var(--line)",
			background: selected ? "rgba(0, 110, 111, 0.03)" : "#ffffff",
			boxShadow: selected ? "0 4px 14px rgba(0, 110, 111, 0.08)" : "0 2px 6px rgba(35, 38, 35, 0.02)",
			transition: "all 0.18s ease",
			flex: "0 0 auto",
			flexShrink: 0,
			flexGrow: 0,
			minHeight: "102px",
			height: "auto",
			overflow: "visible",
			width: "100%",
			boxSizing: "border-box"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				alignItems: "flex-start",
				gap: "11px",
				width: "100%"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					width: "36px",
					height: "36px",
					borderRadius: "9px",
					background: `hsl(${hue}, 65%, 92%)`,
					color: `hsl(${hue}, 80%, 28%)`,
					display: "grid",
					placeItems: "center",
					fontSize: "12.5px",
					fontWeight: 700,
					flexShrink: 0,
					border: `1px solid hsl(${hue}, 50%, 82%)`
				},
				children: initials
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					minWidth: 0,
					flex: 1
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px",
							minWidth: 0
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: {
								fontSize: "12.5px",
								fontWeight: 600,
								color: "var(--ink)",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap"
							},
							children: employee
						}), empCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "9.5px",
								color: "var(--muted)",
								background: "#f3f4f6",
								padding: "1px 5px",
								borderRadius: "4px",
								fontWeight: 500,
								flexShrink: 0
							},
							children: empCode
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: { flexShrink: 0 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { status: request.status })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "6px",
						rowGap: "4px",
						flexWrap: "wrap",
						marginTop: "5px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "#4b5563",
								fontWeight: 500
							},
							children: isHalfDay ? formatDate(request.startDate) : `${formatDate(request.startDate)} → ${formatDate(request.endDate)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "9.5px",
								padding: "1px 5px",
								borderRadius: "4px",
								background: "#f1f5f9",
								color: "#334155",
								fontWeight: 600
							},
							children: isHalfDay ? "0.5 Day" : `${request.days || request.units || 1}d`
						}),
						isHalfDay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "half-day-badge",
							style: { fontSize: "9.5px" },
							children: request.halfDayPeriod === "second_half" ? "2nd Half" : "1st Half"
						}),
						Boolean(request.isDoubleLop || request.doubleLopDays > 0 || request.doubleLopUnits > 0 || request.leaveType === "double_lop") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								background: "#fee2e2",
								color: "#b91c1c",
								border: "1px solid #fca5a5",
								fontSize: "9.5px",
								padding: "1px 6px",
								borderRadius: "4px",
								fontWeight: 700
							},
							children: "Double LOP (25th+)"
						}) : Boolean(request.normalLopUnits > 0 || request.leaveType === "lop" || request.unpaidUnits > 0 && !request.isDoubleLop) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								background: "#fef3c7",
								color: "#b45309",
								border: "1px solid #fcd34d",
								fontSize: "9.5px",
								padding: "1px 6px",
								borderRadius: "4px",
								fontWeight: 700
							},
							children: "Normal LOP"
						}) : Boolean(request.casualLeaveUnits > 0 && request.sickLeaveUnits > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								background: "#ecfdf5",
								color: "#047857",
								border: "1px solid #a7f3d0",
								fontSize: "9.5px",
								padding: "1px 6px",
								borderRadius: "4px",
								fontWeight: 700
							},
							children: "CL + SL (Paid)"
						}) : Boolean(request.casualLeaveUnits > 0 || request.leaveType === "casual") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								background: "#ecfdf5",
								color: "#047857",
								border: "1px solid #a7f3d0",
								fontSize: "9.5px",
								padding: "1px 6px",
								borderRadius: "4px",
								fontWeight: 700
							},
							children: "Casual Leave (Paid)"
						}) : Boolean(request.sickLeaveUnits > 0 || request.leaveType === "sick") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								background: "#f0fdfa",
								color: "#0f766e",
								border: "1px solid #99f6e4",
								fontSize: "9.5px",
								padding: "1px 6px",
								borderRadius: "4px",
								fontWeight: 700
							},
							children: "Sick Leave (Paid)"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								background: "#f8fafc",
								color: "#475569",
								border: "1px solid #e2e8f0",
								fontSize: "9.5px",
								padding: "1px 6px",
								borderRadius: "4px",
								fontWeight: 600
							},
							children: leaveTypeLabels[request.leaveType] || request.leaveType
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				width: "100%",
				gap: "8px",
				paddingTop: "6px",
				borderTop: "1px solid #f3f4f6"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				style: {
					minWidth: 0,
					flex: 1,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					fontSize: "11px",
					color: "#64748b"
				},
				title: request.reason,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						style: { color: "#334155" },
						children: "Note:"
					}),
					" ",
					request.reason || "No justification specified"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "emp-action-group",
				onClick: (e) => e.stopPropagation(),
				style: {
					marginLeft: "auto",
					flexShrink: 0,
					display: "flex",
					alignItems: "center",
					gap: "6px"
				},
				children: [
					isPending && onQuickApprove && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "emp-action-btn view",
						onClick: () => onQuickApprove(request),
						title: "Quick Approve",
						style: {
							padding: "3px 8px",
							fontSize: "10.5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 11 }), " Approve"]
					}),
					isPending && onQuickReject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "emp-action-btn delete",
						onClick: () => onQuickReject(request),
						title: "Quick Reject",
						style: {
							padding: "3px 8px",
							fontSize: "10.5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 11 }), " Reject"]
					}),
					onDeleteRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "emp-action-btn delete",
						onClick: () => onDeleteRequest(request),
						title: "Delete Leave Request",
						style: {
							padding: "3px 7px",
							fontSize: "10.5px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 11 })
					})
				]
			})]
		})]
	});
}
function RequestDetail({ request, mode, onRefresh, onDeleteRequest, onPromptReject }) {
	const { user } = useAuth();
	const [decisionReason, setDecisionReason] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [localStatus, setLocalStatus] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setLocalStatus(null);
	}, [request?.id, request?.status]);
	if (!request) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "leave-detail-empty",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 26 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Select a Leave Request" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Choose a request from the list or table to review employee details, notes, and approval timeline." })
		]
	});
	const currentStatus = localStatus || request?.status;
	const isAdmin = user?.role === "admin" || (user?.permissions || []).includes("admin.access");
	const isDirector = [
		"director",
		"managing_director",
		"co_founder",
		"vertical_head"
	].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
	const isManager = [
		"manager",
		"revenue_growth_manager",
		"senior_manager"
	].includes(user?.role);
	const isTeamLead = ["team_lead", "team_leader"].includes(user?.role);
	const isHrOrAdmin = mode === "hr" || mode === "admin" || [
		"admin",
		"hr",
		"director",
		"managing_director"
	].includes(user?.role) || (user?.permissions || []).includes("leave.hr.review");
	const userCandIds = [
		user?.id,
		user?._id,
		user?.employeeId
	].filter(Boolean).map(String);
	const reqMgrId = request?.managerId?._id || request?.managerId?.id || request?.managerId;
	const isAssignedManagerOfThisRequest = Boolean(reqMgrId && userCandIds.includes(String(reqMgrId)));
	const reqEmpId = request?.employeeId?._id || request?.employeeId?.id || request?.employeeId;
	const reqEmpCode = request?.employeeId?.employeeId || (typeof request?.employeeId === "string" ? request?.employeeId : null);
	const isOwnRequest = Boolean(userCandIds.includes(String(reqEmpId)) || reqEmpCode && userCandIds.includes(String(reqEmpCode)));
	const canManagerDecide = (isManager || isDirector || isHrOrAdmin || isAssignedManagerOfThisRequest) && (currentStatus === "pending_manager" || currentStatus === "pending_tl" || request.currentApproverRole === "manager" || request.currentApproverRole === "team_lead");
	const canDirectorDecide = (isDirector || isHrOrAdmin) && (currentStatus === "pending_director" || request.currentApproverRole === "director");
	const canAdminDecide = isAdmin && (currentStatus === "pending_admin" || request.currentApproverRole === "admin");
	const canHrDecide = isHrOrAdmin && [
		"pending_hr",
		"pending_manager",
		"pending_director"
	].includes(currentStatus);
	const canDecide = canAdminDecide || canManagerDecide || canDirectorDecide || canHrDecide;
	const canCancel = isOwnRequest && mode === "ess" && [
		"pending_tl",
		"pending_manager",
		"pending_director",
		"pending_hr",
		"pending_admin"
	].includes(currentStatus);
	async function handleApprove() {
		setBusy(true);
		setError("");
		try {
			let role = "hr";
			if (canAdminDecide || isAdmin && currentStatus === "pending_admin") role = "admin";
			else if (isAssignedManagerOfThisRequest && !isHrOrAdmin) role = isTeamLead ? "team_lead" : "manager";
			else if (canManagerDecide && !isHrOrAdmin) role = "manager";
			else if (canDirectorDecide && !isHrOrAdmin) role = "director";
			else if (isDirector) role = "director";
			else if (currentStatus === "pending_tl") role = "team_lead";
			else if (currentStatus === "pending_manager") role = "manager";
			else if (currentStatus === "pending_director") role = "director";
			else if (currentStatus === "pending_admin") role = "admin";
			await hrStore.approveLeave(request.id, role, decisionReason || "Approved after review", user);
			setLocalStatus("approved");
			setDecisionReason("");
			onRefresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}
	async function handleReject() {
		if (!decisionReason.trim()) {
			if (onPromptReject) {
				onPromptReject(request);
				return;
			}
			setError("A decision comment or reason is required to reject a leave request.");
			return;
		}
		setBusy(true);
		setError("");
		try {
			let role = "hr";
			if (canAdminDecide || isAdmin && currentStatus === "pending_admin") role = "admin";
			else if (isAssignedManagerOfThisRequest && !isHrOrAdmin) role = isTeamLead ? "team_lead" : "manager";
			else if (canManagerDecide && !isHrOrAdmin) role = "manager";
			else if (canDirectorDecide && !isHrOrAdmin) role = "director";
			else if (isDirector) role = "director";
			else if (currentStatus === "pending_tl") role = "team_lead";
			else if (currentStatus === "pending_manager") role = "manager";
			else if (currentStatus === "pending_director") role = "director";
			else if (currentStatus === "pending_admin") role = "admin";
			await hrStore.rejectLeave(request.id, role, decisionReason, user);
			setLocalStatus("rejected");
			setDecisionReason("");
			onRefresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel leave-detail-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				style: {
					paddingBottom: "12px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "10px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Leave Dossier"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					style: { margin: 0 },
					children: leaveTypeLabels[request.leaveType] || request.leaveType?.toUpperCase()
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { status: currentStatus }), onDeleteRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "emp-action-btn delete",
						onClick: () => onDeleteRequest(request),
						title: "Delete Leave Request",
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "5px",
							padding: "5px 10px",
							fontSize: "11px",
							fontWeight: 600,
							borderRadius: "7px",
							cursor: "pointer"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
					})]
				})]
			}),
			canDecide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-top-decision-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10px",
								fontWeight: 800,
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								color: "#047857",
								background: "#d1fae5",
								padding: "2px 7px",
								borderRadius: "4px"
							},
							children: "⚡ Action Required"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: {
								fontSize: "12px",
								color: "#064e3b"
							},
							children: currentStatus === "pending_admin" ? "Month-End (25th+) LOP Sign-Off" : currentStatus === "pending_director" ? "Director Executive Sign-Off" : currentStatus === "pending_hr" ? "HR Operations Authorization" : "Management Authorization"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "8px",
							alignItems: "center"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								disabled: busy,
								onClick: handleApprove,
								style: {
									background: "#059669",
									color: "#ffffff",
									border: "1px solid #047857",
									padding: "6px 14px",
									fontSize: "11.5px",
									fontWeight: 700,
									boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }), currentStatus === "pending_admin" ? "Approve LOP" : currentStatus === "pending_hr" && (request.isDoubleLop || request.doubleLopDays > 0 || new Date(request.startDate).getDate() >= 25 || new Date(request.endDate).getDate() >= 25) ? "Advance to Admin" : "Approve"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "danger",
								disabled: busy,
								onClick: handleReject,
								style: {
									padding: "6px 14px",
									fontSize: "11.5px",
									fontWeight: 700
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 }), " Reject"]
							}),
							onDeleteRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "emp-action-btn delete",
								style: {
									padding: "6px 10px",
									fontSize: "11px"
								},
								onClick: () => onDeleteRequest(request),
								title: "Remove Request",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 })
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						gap: "8px",
						alignItems: "center"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						value: decisionReason,
						onChange: (e) => setDecisionReason(e.target.value),
						placeholder: "Enter decision remarks or note (optional for approval, required for rejection)...",
						style: {
							width: "100%",
							padding: "7px 11px",
							border: "1px solid #a7f3d0",
							borderRadius: "7px",
							fontSize: "11px",
							background: "#ffffff",
							color: "#0f172a"
						}
					})
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#fef2f2",
					border: "1px solid #fecaca",
					borderRadius: "8px",
					padding: "8px 12px",
					color: "#dc2626",
					fontSize: "11px",
					display: "flex",
					alignItems: "center",
					gap: "6px",
					marginBottom: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-detail-summary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Dates" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: Boolean(request.isHalfDay || request.days === .5 || request.units === .5) ? formatDate(request.startDate) : `${formatDate(request.startDate)} – ${formatDate(request.endDate)}` }),
						Boolean(request.isHalfDay || request.days === .5 || request.units === .5) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								display: "block",
								color: "var(--teal)",
								fontSize: "10px",
								fontWeight: 600,
								marginTop: "2px"
							},
							children: request.halfDayPeriod === "second_half" ? "Second Half (Afternoon Session)" : "First Half (Morning Session)"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Duration" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: Boolean(request.isHalfDay || request.days === .5 || request.units === .5) ? "0.5 Working Day (Half Day)" : `${request.days || request.units || 1} Working Day(s)` }),
						(request.isDoubleLop || request.doubleLopDays > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								display: "block",
								color: "#b91c1c",
								fontSize: "10px",
								fontWeight: 700,
								marginTop: "2px"
							},
							children: "⚠️ Double LOP Applied (25th+ Month-End)"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: request.employeeName || request.employeeId?.name || "Employee" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
							style: {
								color: "var(--muted)",
								fontSize: "9px"
							},
							children: [
								(typeof request.employeeId === "object" ? request.employeeId?.employeeId : request.employeeId) || request.employeeCode || "N/A",
								" · ",
								request.department || "General",
								" ",
								request.applicantRole && `(${request.applicantRole.replace("_", " ")})`
							]
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-detail-section",
				style: {
					background: "#f8fafc",
					border: "1px solid #e2e8f0",
					borderRadius: "10px",
					padding: "14px",
					marginBottom: "14px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-section-title",
						style: {
							marginBottom: "8px",
							color: "#0f172a",
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
							size: 15,
							color: "#475569"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Leave Policy & Balance Breakdown" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
							gap: "8px",
							marginBottom: "10px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#ffffff",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
									padding: "8px 10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "#64748b",
										display: "block"
									},
									children: "Working Days"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: {
										fontSize: "14px",
										color: "#0f172a"
									},
									children: [request.units || request.days || 1, " day(s)"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#ecfdf5",
									border: "1px solid #a7f3d0",
									borderRadius: "8px",
									padding: "8px 10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "#065f46",
										display: "block"
									},
									children: "CL Used"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: {
										fontSize: "14px",
										color: "#047857"
									},
									children: [request.casualLeaveUnits ?? (request.leaveType === "casual" ? request.paidUnits || request.units || 0 : 0), " day(s)"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#f0fdfa",
									border: "1px solid #99f6e4",
									borderRadius: "8px",
									padding: "8px 10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "#115e59",
										display: "block"
									},
									children: "SL Used"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: {
										fontSize: "14px",
										color: "#0f766e"
									},
									children: [request.sickLeaveUnits ?? (request.leaveType === "sick" ? request.paidUnits || request.units || 0 : 0), " day(s)"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#fffbeb",
									border: "1px solid #fde68a",
									borderRadius: "8px",
									padding: "8px 10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "#92400e",
										display: "block"
									},
									children: "Normal LOP"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: {
										fontSize: "14px",
										color: "#b45309"
									},
									children: [request.normalLopUnits ?? (request.leaveType === "lop" && !request.isDoubleLop ? request.units || 0 : 0), " day(s)"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#fef2f2",
									border: "1px solid #fecaca",
									borderRadius: "8px",
									padding: "8px 10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "#991b1b",
										display: "block"
									},
									children: "Double LOP (25th+)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: {
										fontSize: "14px",
										color: "#b91c1c"
									},
									children: [request.doubleLopUnits ?? request.doubleLopDays ?? (request.isDoubleLop ? request.units || 0 : 0), " day(s)"]
								})]
							})
						]
					}),
					Array.isArray(request.dayBreakdown) && request.dayBreakdown.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { marginTop: "8px" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								fontWeight: 600,
								color: "#475569",
								display: "block",
								marginBottom: "6px"
							},
							children: "Date-by-Date Evaluation:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								gap: "6px"
							},
							children: request.dayBreakdown.map((d, idx) => {
								const isDbl = d.isDoubleLop || d.leaveCategory === "double_lop";
								const isNorm = d.leaveCategory === "normal_lop";
								const bg = isDbl ? "#fee2e2" : isNorm ? "#fef3c7" : "#dcfce7";
								const col = isDbl ? "#b91c1c" : isNorm ? "#92400e" : "#15803d";
								const border = isDbl ? "#fca5a5" : isNorm ? "#fde047" : "#86efac";
								const label = isDbl ? "Double LOP (2x)" : isNorm ? "Normal LOP (1x)" : d.leaveCategory ? d.leaveCategory.toUpperCase() : "Paid";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										background: bg,
										color: col,
										border: `1px solid ${border}`,
										fontSize: "10px",
										padding: "3px 8px",
										borderRadius: "6px",
										fontWeight: 600
									},
									children: [
										d.date,
										": ",
										label
									]
								}, idx);
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-reason",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reason for Leave" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: request.reason || "No specific notes entered by employee." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-detail-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "detail-section-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Approval Timeline & Audit Trail" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "leave-timeline",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "timeline-item",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Request Submitted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
								formatDate(request.createdAt),
								" • By ",
								request.employeeName || "Employee",
								" ",
								request.applicantRole && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										textTransform: "capitalize",
										color: "var(--primary)",
										fontWeight: 600
									},
									children: [
										"(",
										request.applicantRole.replace("_", " "),
										")"
									]
								})
							] })] })]
						}),
						request.tlComment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "timeline-item",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Team Lead Review" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Reviewed by ", request.tlName || "Team Lead"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: request.tlComment })
							] })]
						}),
						request.managerComment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "timeline-item",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Department Manager Review" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Reviewed by ", request.managerName || "Manager"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: request.managerComment })
							] })]
						}),
						request.directorComment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "timeline-item",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Managing Director Sign-off" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Executive Approval by ", request.directorName || "Managing Director"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: request.directorComment })
							] })]
						}),
						(request.hrNotified || request.hrComment) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "timeline-item",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "HR Panel Verification" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: currentStatus === "approved" ? "Synced to HR Panel for Payroll & Leave Balance Deductions" : currentStatus === "pending_admin" ? "Verified by HR Operations — Escalated to Admin for 25th Month LOP Approval" : "HR Operations Review" }),
								request.hrComment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: request.hrComment })
							] })]
						}),
						(request.adminComment || request.adminApprovedBy || request.adminDecisionAt) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "timeline-item",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "timeline-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Admin LOP Approval Sign-off" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Executive LOP Authorization by ", request.adminApprovedBy || "Administrator"] }),
								request.adminComment && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: request.adminComment })
							] })]
						})
					]
				})]
			}),
			canDecide && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "decision-box",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: "11px",
						fontWeight: 600
					},
					children: "Decision Remarks & Notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: decisionReason,
					onChange: (event) => setDecisionReason(event.target.value),
					placeholder: canAdminDecide ? "Add Administrator remarks for 25th Month LOP approval..." : mode === "hr" || user?.role === "hr" ? "Add HR remarks / resolution comments..." : isDirector && currentStatus === "pending_director" ? "Add Managing Director remarks (Approved request will sync to HR Panel)..." : canManagerDecide ? "Add Manager remarks (Director will be notified; not Admin)..." : "Add official resolution comments...",
					rows: 2
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "detail-actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: busy,
							onClick: handleApprove,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }), currentStatus === "pending_admin" ? "Approve LOP (Admin Sign-off)" : currentStatus === "pending_hr" && (request.isDoubleLop || request.doubleLopDays > 0 || new Date(request.startDate).getDate() >= 25 || new Date(request.endDate).getDate() >= 25) ? "Verify & Advance to Admin" : "Approve Request"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							disabled: busy,
							onClick: handleReject,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 }), " Reject Request"]
						}),
						onDeleteRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "emp-action-btn delete",
							style: {
								marginLeft: "auto",
								padding: "7px 12px"
							},
							onClick: () => onDeleteRequest(request),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 }), " Remove"]
						})
					]
				})]
			}),
			(isHrOrAdmin || mode === "hr" || mode === "admin") && !canHrDecide && onDeleteRequest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					marginTop: "16px",
					display: "flex",
					justifyContent: "flex-end"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "emp-action-btn delete",
					style: { padding: "7px 12px" },
					onClick: () => onDeleteRequest(request),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 }), " Delete Record"]
				})
			}),
			canCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "decision-box",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						fontSize: "11px",
						margin: 0,
						color: "var(--muted)"
					},
					children: "Your request is currently under review. You may cancel it if your plans have changed."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: storeAction(async () => {
						await hrStore.cancelLeave(request.id);
						onRefresh();
					}),
					children: "Cancel Leave Request"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "inline-error",
				children: error
			})
		]
	});
}
function LeaveDateRangePicker({ startDate, endDate, days, onChange, required = false }) {
	const todayStr = todayKey();
	const [currentMonth, setCurrentMonth] = (0, import_react.useState)(() => {
		if (startDate) {
			const d = new Date(startDate);
			if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
		}
		const t = /* @__PURE__ */ new Date();
		return new Date(t.getFullYear(), t.getMonth(), 1);
	});
	const [hoverDate, setHoverDate] = (0, import_react.useState)("");
	const [showCalendar, setShowCalendar] = (0, import_react.useState)(true);
	const handlePrevMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};
	const handleNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};
	const applyPreset = (presetKey) => {
		const today = /* @__PURE__ */ new Date();
		let s = new Date(today);
		let e = new Date(today);
		if (presetKey === "today") {} else if (presetKey === "tomorrow") {
			s.setDate(s.getDate() + 1);
			e.setDate(e.getDate() + 1);
		} else if (presetKey === "2days") e.setDate(e.getDate() + 1);
		else if (presetKey === "3days") e.setDate(e.getDate() + 2);
		else if (presetKey === "rest_of_week") {
			const diffToFriday = 5 - today.getDay();
			if (diffToFriday > 0) e.setDate(today.getDate() + diffToFriday);
			else e.setDate(today.getDate() + 1);
		} else if (presetKey === "next_week") {
			const daysUntilNextMon = (8 - today.getDay()) % 7 || 7;
			s.setDate(today.getDate() + daysUntilNextMon);
			e = new Date(s);
			e.setDate(s.getDate() + 4);
		}
		const sStr = s.toISOString().split("T")[0];
		const eStr = e.toISOString().split("T")[0];
		onChange({
			startDate: sStr,
			endDate: eStr,
			days: Math.max(1, Math.round((new Date(eStr) - new Date(sStr)) / 864e5) + 1)
		});
		setCurrentMonth(new Date(s.getFullYear(), s.getMonth(), 1));
	};
	const handleDayClick = (dayStr) => {
		if (!startDate || startDate && endDate && startDate !== endDate) onChange({
			startDate: dayStr,
			endDate: dayStr,
			days: 1
		});
		else if (startDate && (!endDate || startDate === endDate)) {
			if (dayStr > startDate) onChange({
				startDate,
				endDate: dayStr,
				days: Math.max(1, Math.round((new Date(dayStr) - new Date(startDate)) / 864e5) + 1)
			});
			else onChange({
				startDate: dayStr,
				endDate: dayStr,
				days: 1
			});
		} else onChange({
			startDate: dayStr,
			endDate: dayStr,
			days: 1
		});
	};
	const year = currentMonth.getFullYear();
	const month = currentMonth.getMonth();
	const monthName = currentMonth.toLocaleString("default", {
		month: "long",
		year: "numeric"
	});
	const firstDayIndex = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const blanks = Array.from({ length: firstDayIndex });
	const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
		const d = i + 1;
		const mm = String(month + 1).padStart(2, "0");
		const dd = String(d).padStart(2, "0");
		return `${year}-${mm}-${dd}`;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "leave-range-picker-wrap",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
						size: 14,
						style: { color: "var(--teal)" }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "12px",
							fontWeight: 700,
							color: "var(--ink)"
						},
						children: "Date Range & Working Days"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setShowCalendar((v) => !v),
					style: {
						background: "none",
						border: "none",
						color: "var(--teal)",
						fontSize: "11px",
						fontWeight: 600,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						gap: "4px"
					},
					children: showCalendar ? "Hide Visual Calendar" : "📅 Open Range Calendar"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "leave-range-presets-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "10.5px",
							color: "var(--muted)",
							fontWeight: 600
						},
						children: "Quick Range:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `leave-range-preset-btn ${startDate === todayStr && endDate === todayStr ? "active" : ""}`,
						onClick: () => applyPreset("today"),
						children: "Today (1d)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "leave-range-preset-btn",
						onClick: () => applyPreset("tomorrow"),
						children: "Tomorrow (1d)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "leave-range-preset-btn",
						onClick: () => applyPreset("2days"),
						children: "2 Days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "leave-range-preset-btn",
						onClick: () => applyPreset("3days"),
						children: "3 Days"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "leave-range-preset-btn",
						onClick: () => applyPreset("rest_of_week"),
						children: "Rest of Week"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "leave-range-preset-btn",
						onClick: () => applyPreset("next_week"),
						children: "Next Week (Mon-Fri)"
					})
				]
			}),
			showCalendar && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "range-calendar-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "range-calendar-header",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: handlePrevMonth,
								style: { padding: "3px 8px" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 16 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: {
									fontSize: "13px",
									color: "var(--ink)"
								},
								children: monthName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: handleNextMonth,
								style: { padding: "3px 8px" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 16 })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "range-calendar-grid",
						children: [
							[
								"Su",
								"Mo",
								"Tu",
								"We",
								"Th",
								"Fr",
								"Sa"
							].map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "range-cal-weekday",
								children: w
							}, w)),
							blanks.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, `blank-${i}`)),
							monthDays.map((dateStr) => {
								const dayNum = parseInt(dateStr.slice(8), 10);
								const isPast = dateStr < todayStr;
								const isToday = dateStr === todayStr;
								const isStart = dateStr === startDate;
								const isEnd = dateStr === endDate;
								const isInRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
								const isHovered = startDate && (!endDate || startDate === endDate) && hoverDate && hoverDate > startDate && dateStr > startDate && dateStr <= hoverDate;
								let dayClass = "range-cal-day";
								if (isPast) dayClass += " disabled";
								if (isToday) dayClass += " today";
								if (isStart && isEnd) dayClass += " single-selected";
								else if (isStart) dayClass += " selected-start";
								else if (isEnd) dayClass += " selected-end";
								else if (isInRange) dayClass += " in-range";
								else if (isHovered) dayClass += " hover-range";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: dayClass,
									onClick: () => !isPast && handleDayClick(dateStr),
									onMouseEnter: () => !isPast && setHoverDate(dateStr),
									onMouseLeave: () => setHoverDate(""),
									title: dateStr,
									children: dayNum
								}, dateStr);
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: "8px",
							fontSize: "11px",
							color: "var(--muted)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "6px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Click any date for 1-day leave, or click a 2nd date to select a range." }), startDate && endDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								color: "var(--teal)",
								fontWeight: 700
							},
							children: [
								"✓ ",
								days,
								" Day(s) Selected (",
								startDate,
								startDate !== endDate ? ` to ${endDate}` : "",
								")"
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					style: {
						display: "block",
						fontSize: "11px",
						fontWeight: 600,
						color: "var(--muted)",
						marginBottom: "4px"
					},
					children: "From Date"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					value: startDate,
					min: todayStr,
					required,
					onChange: (e) => {
						const newStart = e.target.value;
						let newEnd = endDate;
						if (newEnd && newEnd < newStart) newEnd = newStart;
						const diff = newEnd ? Math.max(1, Math.round((new Date(newEnd) - new Date(newStart)) / 864e5) + 1) : 1;
						onChange({
							startDate: newStart,
							endDate: newEnd,
							days: diff
						});
					},
					style: {
						width: "100%",
						padding: "8px 10px",
						borderRadius: "8px",
						border: "1px solid var(--line)",
						fontSize: "12px",
						background: "#fff"
					}
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					style: {
						display: "block",
						fontSize: "11px",
						fontWeight: 600,
						color: "var(--muted)",
						marginBottom: "4px"
					},
					children: "To Date (Cannot be earlier than From Date)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "date",
					value: endDate,
					min: startDate || todayStr,
					required,
					onChange: (e) => {
						const newEnd = e.target.value;
						if (startDate && newEnd < startDate) return;
						const diff = Math.max(1, Math.round((new Date(newEnd) - new Date(startDate || newEnd)) / 864e5) + 1);
						onChange({
							startDate: startDate || newEnd,
							endDate: newEnd,
							days: diff
						});
					},
					style: {
						width: "100%",
						padding: "8px 10px",
						borderRadius: "8px",
						border: "1px solid var(--line)",
						fontSize: "12px",
						background: "#fff"
					}
				})] })]
			}),
			startDate && endDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "8px 12px",
					borderRadius: "8px",
					background: "#e6fffa",
					border: "1px solid #b2f5ea",
					color: "#006E6F",
					fontSize: "11.5px",
					fontWeight: 700
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"✨ ",
					days,
					" Day(s) Range: ",
					startDate,
					" to ",
					endDate
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange({
						startDate: "",
						endDate: "",
						days: 1
					}),
					style: {
						background: "none",
						border: "none",
						color: "#dc2626",
						fontSize: "11px",
						fontWeight: 700,
						cursor: "pointer"
					},
					children: "Clear Range"
				})]
			})
		]
	});
}
function ApplyLeaveSelf({ onSubmitted }) {
	const { user } = useAuth();
	const [isHalfDay, setIsHalfDay] = (0, import_react.useState)(false);
	const [halfDayPeriod, setHalfDayPeriod] = (0, import_react.useState)("first_half");
	const [form, setForm] = (0, import_react.useState)({
		leaveType: "casual",
		startDate: todayKey(),
		endDate: todayKey(),
		days: 1,
		reason: ""
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [overlapInfo, setOverlapInfo] = (0, import_react.useState)(null);
	const [success, setSuccess] = (0, import_react.useState)(false);
	const storeLeaves = hrStore.getState().leaves || [];
	const balances = hrStore.getState().leaveBalances || [];
	const userEmpId = user?.employeeId;
	const userId = user?.id || user?._id;
	const userEmpCode = String(userEmpId || "").trim();
	const userIdentifier = String(userId || "").trim();
	const userBalances = balances.filter((b) => {
		if (!b) return false;
		const bEmpObj = typeof b.employeeId === "object" && b.employeeId !== null ? b.employeeId : null;
		const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === "string" ? b.employeeId : "")).trim();
		const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === "string" ? b.employeeId : "")).trim();
		return userEmpCode && (bEmpCode === userEmpCode || bEmpId === userEmpCode) || userIdentifier && (bEmpId === userIdentifier || bEmpCode === userIdentifier);
	});
	const myPendingLeaves = storeLeaves.filter((l) => {
		return (userEmpId && (l.employeeId === userEmpId || l.employeeRef === userEmpId) || userId && (l.employeeRef === userId || l.employeeId === userId)) && [
			"pending_tl",
			"pending_manager",
			"pending_director",
			"pending_hr",
			"pending_admin"
		].includes(l.status);
	});
	const getAvailDays = (type) => {
		const match = userBalances.find((b) => (b.leaveType || "").toLowerCase() === type.toLowerCase());
		if (!match) return null;
		return (match.allowance || 0) - (match.used || 0) - (match.reserved || 0);
	};
	function handleRangeChange({ startDate, endDate, days }) {
		setForm((current) => ({
			...current,
			startDate,
			endDate,
			days: days || 1
		}));
		if (overlapInfo) setOverlapInfo(null);
	}
	function update(field, value) {
		setForm((current) => {
			const updated = {
				...current,
				[field]: value
			};
			if (updated.startDate && updated.endDate) {
				if (updated.endDate < updated.startDate) updated.endDate = updated.startDate;
				const start = new Date(updated.startDate);
				const end = new Date(updated.endDate);
				const diffDays = Math.max(1, Math.round((end - start) / 864e5) + 1);
				if (!isNaN(diffDays)) updated.days = diffDays;
			}
			return updated;
		});
	}
	async function submit(event) {
		event?.preventDefault?.();
		if (!form.startDate || !form.endDate) {
			setError("Please select both a Start Date and an End Date.");
			return;
		}
		if (form.endDate < form.startDate) {
			setError("To Date cannot be earlier than From Date.");
			return;
		}
		setBusy(true);
		setError("");
		setOverlapInfo(null);
		try {
			await hrStore.applyLeave({
				...form,
				startDate: form.startDate,
				endDate: isHalfDay ? form.startDate : form.endDate,
				days: isHalfDay ? .5 : form.days,
				isHalfDay,
				halfDayPeriod: isHalfDay ? halfDayPeriod : null,
				employeeId: user?.employeeId || user?.id,
				employeeName: user?.displayName || user?.name,
				department: user?.department,
				applicantRole: user?.role
			}, user);
			setSuccess(true);
			setOverlapInfo(null);
			setTimeout(() => setSuccess(false), 4500);
			setForm({
				leaveType: "casual",
				startDate: "",
				endDate: "",
				days: 1,
				reason: ""
			});
			setIsHalfDay(false);
			setHalfDayPeriod("first_half");
			onSubmitted();
		} catch (requestError) {
			setError(requestError.message);
			if (requestError.code === "LEAVE_OVERLAP" || requestError.fields?.canCancelExisting) setOverlapInfo(requestError.fields || { canCancelExisting: true });
		} finally {
			setBusy(false);
		}
	}
	async function handleReplaceAndSubmit() {
		setBusy(true);
		setError("");
		try {
			await hrStore.applyLeave({
				...form,
				startDate: form.startDate,
				endDate: isHalfDay ? form.startDate : form.endDate,
				days: isHalfDay ? .5 : form.days,
				isHalfDay,
				halfDayPeriod: isHalfDay ? halfDayPeriod : null,
				replaceOverlap: true,
				employeeId: user?.employeeId || user?.id,
				employeeName: user?.displayName || user?.name,
				department: user?.department,
				applicantRole: user?.role
			}, user);
			setSuccess(true);
			setOverlapInfo(null);
			setTimeout(() => setSuccess(false), 4500);
			setForm({
				leaveType: "casual",
				startDate: "",
				endDate: "",
				days: 1,
				reason: ""
			});
			setIsHalfDay(false);
			setHalfDayPeriod("first_half");
			onSubmitted();
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}
	async function handleCancelExisting(reqId) {
		const targetId = reqId || overlapInfo?.overlappingRequestId;
		if (!targetId) return;
		setBusy(true);
		setError("");
		try {
			await hrStore.cancelLeave(targetId);
			setOverlapInfo(null);
			setError("");
			onSubmitted();
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}
	const cl = getAvailDays("casual");
	const sl = getAvailDays("sick");
	const el = getAvailDays("earned");
	const co = getAvailDays("comp_off");
	const ml = getAvailDays("maternity");
	const lop = getAvailDays("lop");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel apply-leave-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Self Service"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Apply for Leave" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					size: 18,
					className: "muted-icon"
				})]
			}),
			myPendingLeaves.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					background: "var(--soft-blue, #eff6ff)",
					border: "1px solid var(--blue-border, #bfdbfe)",
					borderRadius: "8px",
					padding: "10px 14px",
					marginBottom: "14px",
					fontSize: "12px"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
								size: 15,
								color: "var(--blue, #2563eb)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "var(--blue, #1d4ed8)" },
								children: "Your Active Pending Leave:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: myPendingLeaves.map((l) => `${leaveTypeLabels[l.leaveType] || l.leaveType} (${formatDate(l.startDate)} to ${formatDate(l.endDate)})`).join("; ") })
						]
					}), myPendingLeaves.map((l, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn btn-secondary",
						style: {
							fontSize: "11px",
							padding: "4px 10px",
							height: "auto",
							lineHeight: "1.2"
						},
						onClick: () => handleCancelExisting(l?.id || l?._id),
						disabled: busy,
						children: "Withdraw / Cancel"
					}, l?.id || l?._id || idx))]
				})
			}),
			success && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "var(--soft-teal)",
					color: "var(--teal)",
					padding: "10px 14px",
					borderRadius: "8px",
					fontSize: "11px",
					display: "flex",
					alignItems: "center",
					gap: "8px",
					margin: "14px 0"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: user?.role === "manager" ? "Leave request submitted! Routed to Managing Director for executive approval (approved request automatically syncs to HR Panel)." : user?.role === "team_lead" ? "Leave request submitted! Routed to Department Manager for approval (Director will be notified; not to Admin)." : "Leave request submitted! Routed to Manager for approval (Team Lead, Squad, and Director will be notified; not to Admin)." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "leave-form",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Leave Type", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: form.leaveType,
						onChange: (event) => update("leaveType", event.target.value),
						required: true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "casual",
								children: [
									"Casual Leave (",
									cl !== null ? `${cl} available` : "1 available",
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "sick",
								children: [
									"Sick / Medical Leave (",
									sl !== null ? `${sl} available` : "1 available",
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "earned",
								children: [
									"Earned / Privilege Leave (",
									el !== null ? `${el} available` : "0 available",
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "comp_off",
								children: [
									"Compensatory Off (",
									co !== null ? `${co} available` : "0 available",
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "maternity",
								children: [
									"Maternity / Paternity Leave (",
									ml !== null ? `${ml} available` : "Available",
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: "lop",
								children: [
									"Loss of Pay (LOP) / Unpaid (",
									lop !== null ? `${lop} days` : "Allowed",
									")"
								]
							})
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						style: {
							display: "block",
							marginBottom: "6px",
							fontSize: "11px",
							fontWeight: 600,
							color: "var(--ink)"
						},
						children: "Leave Duration Option"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-mode-toggle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `leave-mode-btn ${!isHalfDay ? "active" : ""}`,
							onClick: () => {
								setIsHalfDay(false);
								setForm((prev) => ({
									...prev,
									days: prev.startDate && prev.endDate && prev.startDate !== prev.endDate ? Math.max(1, Math.round((new Date(prev.endDate) - new Date(prev.startDate)) / 864e5) + 1) : 1
								}));
							},
							children: "Full Day Leave"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `leave-mode-btn ${isHalfDay ? "active" : ""}`,
							onClick: () => {
								setIsHalfDay(true);
								const d = form.startDate || todayKey();
								setForm((prev) => ({
									...prev,
									startDate: d,
									endDate: d,
									days: .5
								}));
							},
							children: "Half Day Leave (0.5 Day)"
						})]
					})] }),
					isHalfDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "14px",
							background: "#f8faf9",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									color: "var(--ink)",
									display: "block",
									marginBottom: "8px"
								},
								children: "Select Half Day Session"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "half-day-options",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `half-day-card ${halfDayPeriod === "first_half" ? "selected" : ""}`,
									onClick: () => setHalfDayPeriod("first_half"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
										size: 16,
										color: halfDayPeriod === "first_half" ? "var(--teal)" : "var(--muted)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											fontSize: "12px"
										},
										children: "First Half (Morning Session)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											color: "var(--muted)",
											fontSize: "10px"
										},
										children: "09:30 AM – 01:30 PM"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `half-day-card ${halfDayPeriod === "second_half" ? "selected" : ""}`,
									onClick: () => setHalfDayPeriod("second_half"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
										size: 16,
										color: halfDayPeriod === "second_half" ? "var(--teal)" : "var(--muted)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											fontSize: "12px"
										},
										children: "Second Half (Afternoon Session)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											color: "var(--muted)",
											fontSize: "10px"
										},
										children: "02:00 PM – 06:30 PM"
									})] })]
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 600
								},
								children: "Date of Half Day Leave"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: form.startDate || todayKey(),
								min: todayKey(),
								onChange: (e) => setForm((prev) => ({
									...prev,
									startDate: e.target.value,
									endDate: e.target.value,
									days: .5
								})),
								required: true,
								style: {
									width: "100%",
									padding: "10px",
									border: "1px solid var(--line)",
									borderRadius: "8px",
									background: "#fff",
									fontSize: "12px"
								}
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									fontSize: "11.5px",
									color: "var(--teal)",
									fontWeight: 500
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Applying for ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "0.5 Day (Half Day)" }),
									" on ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDate(form.startDate || todayKey()) }),
									" (",
									halfDayPeriod === "second_half" ? "Second Half / Afternoon" : "First Half / Morning",
									"). Only 0.5 quota will be deducted."
								] })]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaveDateRangePicker, {
						startDate: form.startDate,
						endDate: form.endDate,
						days: form.days,
						onChange: handleRangeChange,
						required: true
					}),
					(() => {
						if (!form.startDate) return false;
						const s = new Date(form.startDate);
						const e = form.endDate ? new Date(form.endDate) : s;
						for (const cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) if (cur.getDate() >= 25) return true;
						return false;
					})() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fff7ed",
							border: "1px solid #fdba74",
							borderRadius: "8px",
							padding: "10px 14px",
							margin: "8px 0 12px",
							display: "flex",
							alignItems: "flex-start",
							gap: "8px",
							fontSize: "11.5px",
							color: "#9a3412"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 16,
							style: {
								flexShrink: 0,
								marginTop: "2px",
								color: "#ea580c"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Month-End Policy (From 25th):" }),
							" Any leave on or after the 25th of the month is considered ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Double LOP" }),
							" (2 days salary deduction per day in payroll)."
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Reason for Absence", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: form.reason,
						onChange: (event) => update("reason", event.target.value),
						placeholder: "Explain the purpose of your time off...",
						required: true
					})] }),
					error && !overlapInfo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "inline-error",
						children: error
					}),
					overlapInfo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fffbeb",
							border: "1px solid #f59e0b",
							borderRadius: "8px",
							padding: "12px 14px",
							margin: "8px 0 14px",
							display: "flex",
							flexDirection: "column",
							gap: "8px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									color: "#b45309",
									fontWeight: 600,
									fontSize: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									overlapInfo.overlappingStatus === "approved" ? "Existing Approved Leave" : "Existing Active Leave Request",
									": ",
									overlapInfo.overlappingStartDate || "selected dates",
									" to ",
									overlapInfo.overlappingEndDate || "selected dates"
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: 0,
									fontSize: "11px",
									color: "#78350f"
								},
								children: overlapInfo.canCancelExisting ? `You already have ${overlapInfo.overlappingStatus === "approved" ? "an approved leave" : "a pending leave request"}${overlapInfo.overlappingReason ? ` ("${overlapInfo.overlappingReason}")` : ""} covering these dates. Click "Replace Previous & Submit New Range" to replace it with this new ${form.days}-day request, or cancel the previous request.` : "This date range conflicts with an active leave request."
							}),
							overlapInfo.canCancelExisting && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px",
									flexWrap: "wrap",
									marginTop: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									onClick: handleReplaceAndSubmit,
									disabled: busy,
									style: {
										fontSize: "11px",
										padding: "6px 14px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 13 }), " Replace Previous & Submit New Range"]
								}), overlapInfo.overlappingRequestId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "secondary",
									onClick: () => handleCancelExisting(overlapInfo.overlappingRequestId),
									disabled: busy,
									style: {
										fontSize: "11px",
										padding: "6px 14px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 13 }), " Cancel Previous Request Only"]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: busy || !form.leaveType,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 15 }), " Submit Leave Request"]
					})
				]
			})
		]
	});
}
function GrantLeaveHR({ employees, onGranted, preselectedEmpId }) {
	const [form, setForm] = (0, import_react.useState)({
		employeeId: preselectedEmpId || "",
		leaveType: "casual",
		startDate: todayKey(),
		endDate: todayKey(),
		days: 1,
		status: "approved",
		reason: "",
		hrComment: "Granted directly by HR Operations with manager alignment."
	});
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [success, setSuccess] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [overlapConflict, setOverlapConflict] = (0, import_react.useState)(false);
	const allBalances = hrStore.getState().leaveBalances || [];
	const selectedEmp = employees.find((x) => x && (x.employeeId === form.employeeId || x.id === form.employeeId || x._id === form.employeeId));
	const empBalances = (0, import_react.useMemo)(() => {
		if (!selectedEmp) return null;
		const empId = String(selectedEmp.employeeId || selectedEmp.id || selectedEmp._id || "").trim();
		const rawBal = allBalances.filter((b) => {
			if (!b) return false;
			const bEmpObj = typeof b.employeeId === "object" && b.employeeId !== null ? b.employeeId : null;
			const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === "string" ? b.employeeId : "")).trim();
			const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === "string" ? b.employeeId : "")).trim();
			return empId && (bEmpCode === empId || bEmpId === empId);
		});
		const casual = rawBal.find((b) => b.leaveType === "casual");
		const sick = rawBal.find((b) => b.leaveType === "sick");
		const earned = rawBal.find((b) => b.leaveType === "earned" || b.leaveType === "paid");
		return {
			casual: Math.max(0, (casual?.allowance ?? 1) - (casual?.used ?? 0) - (casual?.reserved ?? 0)),
			sick: Math.max(0, (sick?.allowance ?? 1) - (sick?.used ?? 0) - (sick?.reserved ?? 0)),
			earned: Math.max(0, (earned?.allowance ?? 0) - (earned?.used ?? 0) - (earned?.reserved ?? 0))
		};
	}, [selectedEmp, allBalances]);
	(0, import_react.useEffect)(() => {
		if (preselectedEmpId) setForm((f) => ({
			...f,
			employeeId: preselectedEmpId
		}));
	}, [preselectedEmpId]);
	function update(field, value) {
		setError("");
		setOverlapConflict(false);
		setForm((current) => {
			const updated = {
				...current,
				[field]: value
			};
			if (field === "startDate") {
				if (updated.endDate && updated.endDate < value) updated.endDate = value;
			} else if (field === "endDate") {
				if (updated.startDate && value < updated.startDate) updated.endDate = updated.startDate;
			}
			if (updated.startDate && updated.endDate) {
				const start = new Date(updated.startDate);
				const end = new Date(updated.endDate);
				const diffDays = Math.max(1, Math.round((end - start) / 864e5) + 1);
				if (!isNaN(diffDays)) updated.days = diffDays;
			}
			return updated;
		});
	}
	const handleSubmit = storeAction(async (e, forceOverride = false) => {
		if (e && e.preventDefault) e.preventDefault();
		const emp = employees.find((x) => x && (x.employeeId === form.employeeId || x.id === form.employeeId || x._id === form.employeeId));
		if (!emp) return;
		setBusy(true);
		setError("");
		setOverlapConflict(false);
		try {
			await hrStore.applyLeave({
				...form,
				isHalfDay: Boolean(form.isHalfDay),
				halfDayPeriod: form.isHalfDay ? form.halfDayPeriod || "first_half" : null,
				days: form.isHalfDay ? .5 : form.days,
				endDate: form.isHalfDay ? form.startDate : form.endDate,
				employeeId: emp.employeeId,
				employeeName: emp.name,
				department: emp.department,
				replaceOverlap: forceOverride || Boolean(overlapConflict)
			});
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3500);
			setForm({
				employeeId: "",
				leaveType: "casual",
				isHalfDay: false,
				halfDayPeriod: "first_half",
				startDate: todayKey(),
				endDate: todayKey(),
				days: 1,
				status: "approved",
				reason: "",
				hrComment: "Granted directly by HR Operations with manager alignment."
			});
			onGranted();
		} catch (err) {
			console.error("HR Grant Leave failed:", err);
			const msg = err.message || "The leave request could not be granted.";
			setError(msg);
			if (msg.toLowerCase().includes("overlap") || msg.toLowerCase().includes("conflict") || msg.toLowerCase().includes("already has") || msg.toLowerCase().includes("existing")) setOverlapConflict(true);
		} finally {
			setBusy(false);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel",
		style: {
			maxWidth: "880px",
			margin: "0 auto 24px",
			borderRadius: "14px",
			border: "1px solid var(--line)",
			boxShadow: "0 4px 20px rgba(35, 38, 35, 0.04)"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel-heading",
				style: {
					paddingBottom: "16px",
					borderBottom: "1px solid var(--line)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "section-kicker",
					style: {
						display: "flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						size: 13,
						color: "var(--teal)"
					}), " HR Administrative Authority"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					style: {
						fontSize: "18px",
						fontWeight: 700,
						margin: "2px 0 0"
					},
					children: "Grant / Record Leave on Behalf of Employee"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "foundation-copy",
				style: {
					margin: "14px 0 18px",
					fontSize: "11.5px",
					color: "#64748b"
				},
				children: "HR Operations and Admin leadership can authorize and log approved leaves directly. Instant grants automatically synchronize with daily attendance logs and payroll deductions."
			}),
			success && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#ecfdf5",
					color: "#065f46",
					border: "1px solid #a7f3d0",
					padding: "12px 16px",
					borderRadius: "10px",
					fontSize: "11.5px",
					display: "flex",
					alignItems: "center",
					gap: "8px",
					marginBottom: "18px",
					animation: "fadeUp 0.3s ease"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					size: 16,
					color: "#059669"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Success!" }), " Leave record granted successfully and synchronized with attendance records."] })]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#fef2f2",
					border: "1px solid #fecaca",
					borderRadius: "10px",
					padding: "13px 16px",
					color: "#991b1b",
					fontSize: "11.5px",
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					marginBottom: "18px",
					animation: "fadeUp 0.3s ease"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px",
						fontWeight: 600
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
						size: 16,
						color: "#dc2626",
						style: { flexShrink: 0 }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Unable to Record Leave: ", error] })]
				}), overlapConflict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: "10px",
						marginTop: "4px",
						paddingTop: "8px",
						borderTop: "1px solid #fee2e2"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							color: "#b91c1c",
							flex: 1,
							minWidth: "220px"
						},
						children: "A pending or existing leave overlaps with this date range. You can perform an administrative force override to supersede conflicting records."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "danger",
						disabled: busy,
						onClick: () => handleSubmit(null, true),
						style: {
							padding: "5px 12px",
							fontSize: "11px",
							fontWeight: 700
						},
						children: "Force Override & Grant"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => handleSubmit(e, false),
				style: {
					display: "grid",
					gap: "16px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Select Employee",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: form.employeeId,
							onChange: (e) => update("employeeId", e.target.value),
							required: true,
							style: {
								width: "100%",
								padding: "10px 14px",
								border: "1px solid var(--line)",
								borderRadius: "9px",
								background: "#fff",
								fontSize: "12px",
								color: "var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "-- Choose employee to grant leave --"
							}), employees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: emp.employeeId,
								children: [
									emp.name,
									" (",
									emp.employeeId,
									" · ",
									emp.department || "Operations",
									")"
								]
							}, emp.employeeId))]
						})
					}),
					empBalances && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "10px",
							padding: "10px 14px",
							background: "rgba(0, 110, 111, 0.04)",
							borderRadius: "9px",
							border: "1px solid rgba(0, 110, 111, 0.12)",
							fontSize: "11px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontWeight: 600,
									color: "var(--ink)"
								},
								children: "Employee Available Balances:"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									padding: "2px 8px",
									borderRadius: "6px",
									background: "#ecfdf5",
									color: "#047857",
									border: "1px solid #a7f3d0",
									fontWeight: 700
								},
								children: [
									"CL: ",
									empBalances.casual,
									"d"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									padding: "2px 8px",
									borderRadius: "6px",
									background: "#f0fdfa",
									color: "#0f766e",
									border: "1px solid #99f6e4",
									fontWeight: 700
								},
								children: [
									"SL: ",
									empBalances.sick,
									"d"
								]
							}),
							empBalances.earned > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									padding: "2px 8px",
									borderRadius: "6px",
									background: "#eff6ff",
									color: "#1d4ed8",
									border: "1px solid #bfdbfe",
									fontWeight: 700
								},
								children: [
									"EL: ",
									empBalances.earned,
									"d"
								]
							}),
							empBalances.casual === 0 && empBalances.sick === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "#b45309",
									fontWeight: 600,
									marginLeft: "auto"
								},
								children: "⚠️ Paid balance exhausted (will be recorded as LOP)"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
							gap: "14px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Leave Classification",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.leaveType,
								onChange: (e) => update("leaveType", e.target.value),
								style: {
									width: "100%",
									padding: "10px 14px",
									border: "1px solid var(--line)",
									borderRadius: "9px",
									background: "#fff",
									fontSize: "11.5px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "casual",
										children: "Casual Leave (CL)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "sick",
										children: "Sick / Medical Leave (SL)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "earned",
										children: "Earned / Privilege Leave (EL)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "comp_off",
										children: "Compensatory Off"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "maternity",
										children: "Maternity / Paternity Leave"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "lop",
										children: "Loss of Pay (LOP) / Unpaid"
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Grant Status",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.status,
								onChange: (e) => update("status", e.target.value),
								style: {
									width: "100%",
									padding: "10px 14px",
									border: "1px solid var(--line)",
									borderRadius: "9px",
									background: "#fff",
									fontSize: "11.5px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "approved",
									children: "Direct HR Approval (Instant Grant)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "pending_hr",
									children: "Submit as Pending HR Review"
								})]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						style: {
							display: "block",
							marginBottom: "6px",
							fontSize: "11px",
							fontWeight: 600,
							color: "var(--ink)"
						},
						children: "Leave Duration Option"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-mode-toggle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `leave-mode-btn ${!form.isHalfDay ? "active" : ""}`,
							onClick: () => {
								update("isHalfDay", false);
								const s = form.startDate;
								const e = form.endDate && form.endDate >= s ? form.endDate : s;
								update("days", s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / 864e5) + 1) : 1);
							},
							children: "Full Day Leave"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `leave-mode-btn ${form.isHalfDay ? "active" : ""}`,
							onClick: () => {
								update("isHalfDay", true);
								update("endDate", form.startDate || todayKey());
								update("days", .5);
							},
							children: "Half Day Leave (0.5 Day)"
						})]
					})] }),
					form.isHalfDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "14px",
							background: "#f8faf9",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									color: "var(--ink)",
									display: "block",
									marginBottom: "8px"
								},
								children: "Select Half Day Session"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "half-day-options",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `half-day-card ${form.halfDayPeriod !== "second_half" ? "selected" : ""}`,
									onClick: () => update("halfDayPeriod", "first_half"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
										size: 16,
										color: form.halfDayPeriod !== "second_half" ? "var(--teal)" : "var(--muted)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											fontSize: "12px"
										},
										children: "First Half (Morning Session)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											color: "var(--muted)",
											fontSize: "10px"
										},
										children: "09:30 AM – 01:30 PM"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `half-day-card ${form.halfDayPeriod === "second_half" ? "selected" : ""}`,
									onClick: () => update("halfDayPeriod", "second_half"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
										size: 16,
										color: form.halfDayPeriod === "second_half" ? "var(--teal)" : "var(--muted)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											fontSize: "12px"
										},
										children: "Second Half (Afternoon Session)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											color: "var(--muted)",
											fontSize: "10px"
										},
										children: "02:00 PM – 06:30 PM"
									})] })]
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Date of Half Day Leave",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: form.startDate || todayKey(),
									onChange: (e) => {
										update("startDate", e.target.value);
										update("endDate", e.target.value);
										update("days", .5);
									},
									required: true,
									style: {
										width: "100%",
										padding: "10px 14px",
										border: "1px solid var(--line)",
										borderRadius: "9px",
										background: "#fff",
										fontSize: "12px"
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									fontSize: "11.5px",
									color: "var(--teal)",
									fontWeight: 500
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Recording ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "0.5 Day (Half Day)" }),
									" on ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatDate(form.startDate || todayKey()) }),
									" (",
									form.halfDayPeriod === "second_half" ? "Second Half / Afternoon" : "First Half / Morning",
									")."
								] })]
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
							gap: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Start Date",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: form.startDate,
									onChange: (e) => update("startDate", e.target.value),
									required: true,
									style: {
										width: "100%",
										padding: "10px 14px",
										border: "1px solid var(--line)",
										borderRadius: "9px",
										background: "#fff",
										fontSize: "11.5px"
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "End Date",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: form.endDate,
									min: form.startDate || todayKey(),
									onChange: (e) => update("endDate", e.target.value),
									required: true,
									style: {
										width: "100%",
										padding: "10px 14px",
										border: "1px solid var(--line)",
										borderRadius: "9px",
										background: "#fff",
										fontSize: "11.5px"
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Duration (Days)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									step: "1",
									value: form.days,
									onChange: (e) => update("days", Math.max(1, parseInt(e.target.value, 10) || 1)),
									style: {
										width: "100%",
										padding: "10px 14px",
										border: "1px solid var(--line)",
										borderRadius: "9px",
										background: "#fff",
										fontSize: "11.5px"
									}
								})
							})
						]
					}),
					(() => {
						if (!form.startDate) return false;
						const s = new Date(form.startDate);
						const e = form.endDate ? new Date(form.endDate) : s;
						for (const cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) if (cur.getDate() >= 25) return true;
						return false;
					})() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fff7ed",
							border: "1px solid #fdba74",
							borderRadius: "9px",
							padding: "11px 15px",
							display: "flex",
							alignItems: "flex-start",
							gap: "10px",
							fontSize: "11.5px",
							color: "#9a3412"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 16,
							style: {
								flexShrink: 0,
								marginTop: "2px",
								color: "#ea580c"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Month-End Policy Alert (From 25th):" }),
							" This date range includes days on or after the 25th of the month. Under company policy, these are treated as ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Double LOP" }),
							" (2 days loss of pay deduction per day in payroll)."
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Reason / Administrative Justification",
						required: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: form.reason,
							onChange: (e) => update("reason", e.target.value),
							placeholder: "e.g. Urgent family emergency, scheduled health check-up, pre-approved earned leave...",
							rows: 2,
							required: true,
							style: {
								width: "100%",
								padding: "10px 14px",
								border: "1px solid var(--line)",
								borderRadius: "9px",
								background: "#fff",
								fontSize: "11.5px"
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "HR Operations Remarks",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: form.hrComment,
							onChange: (e) => update("hrComment", e.target.value),
							placeholder: "Official resolution note...",
							style: {
								width: "100%",
								padding: "10px 14px",
								border: "1px solid var(--line)",
								borderRadius: "9px",
								background: "#fff",
								fontSize: "11.5px"
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							gap: "12px",
							marginTop: "6px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: busy || !form.employeeId,
							style: {
								padding: "10px 22px",
								fontSize: "12px",
								fontWeight: 600
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), " Grant & Record Leave"]
						})
					})
				]
			})
		]
	});
}
function isDoubleLopLeave(r) {
	if (!r) return false;
	return Boolean(r.status === "pending_admin" || r.isDoubleLop || r.doubleLopDays && r.doubleLopDays > 0 || r.doubleLopUnits && r.doubleLopUnits > 0 || r.leaveType === "double_lop" || r.leaveCategory === "double_lop" || r.isPost25thLop || is25thMonthLop(r) || r.dates && Array.isArray(r.dates) && r.dates.some((d) => d.isDoubleLop || d.leaveCategory === "double_lop"));
}
function LeaveManagementPage({ mode = "self", route, query: propQuery }) {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const isManagement = mode === "hr" || mode === "admin";
	const isSelf = mode === "self";
	const getHashInfo = () => {
		const hash = (typeof window !== "undefined" ? window.location.hash : "") || "";
		const { query = {} } = parseLocationHash(hash);
		const effectiveQuery = {
			...propQuery || {},
			...query
		};
		let tab = effectiveQuery.tab || "";
		if (!tab) {
			if (hash.includes("tab=policy")) tab = "policy";
			else if (hash.includes("tab=grant")) tab = "grant";
			else if (hash.includes("tab=quotas")) tab = "quotas";
			else if (hash.includes("tab=lop")) tab = "lop";
			else if (hash.includes("tab=approvals")) tab = "approvals";
			else tab = "approvals";
		}
		const filterVal = effectiveQuery.filter || "";
		const idVal = effectiveQuery.id || effectiveQuery.leaveId || "";
		return {
			tab,
			filter: filterVal,
			id: idVal
		};
	};
	const initialInfo = getHashInfo();
	const [activeTab, setActiveTab] = (0, import_react.useState)(initialInfo.tab || "approvals");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)(initialInfo.filter || "");
	const [targetEntityId, setTargetEntityId] = (0, import_react.useState)(initialInfo.id || "");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [viewMode, setViewMode] = (0, import_react.useState)("split");
	const [refreshKey, setRefreshKey] = (0, import_react.useState)(0);
	const [feedbackNotice, setFeedbackNotice] = (0, import_react.useState)("");
	const [leaveToDelete, setLeaveToDelete] = (0, import_react.useState)(null);
	const [rejectingLeave, setRejectingLeave] = (0, import_react.useState)(null);
	const [rejectReason, setRejectReason] = (0, import_react.useState)("");
	const [preselectedEmpId, setPreselectedEmpId] = (0, import_react.useState)("");
	const navigateToTab = (newTab, newFilter = "") => {
		setActiveTab(newTab);
		setFilter(newFilter);
		if (typeof window !== "undefined") {
			const basePath = window.location.hash.split("?")[0] || (mode === "admin" ? "#/admin/leave" : "#/hr/leave");
			const params = new URLSearchParams();
			if (newTab && newTab !== "approvals") params.set("tab", newTab);
			if (newFilter) params.set("filter", newFilter);
			const queryStr = params.toString();
			const newHash = queryStr ? `${basePath}?${queryStr}` : basePath;
			if (window.location.hash !== newHash) window.history.replaceState(null, "", newHash);
		}
	};
	const updateFilter = (newFilter) => {
		setFilter(newFilter);
		if (typeof window !== "undefined") {
			const basePath = window.location.hash.split("?")[0] || (mode === "admin" ? "#/admin/leave" : "#/hr/leave");
			const params = new URLSearchParams();
			if (activeTab && activeTab !== "approvals") params.set("tab", activeTab);
			if (newFilter) params.set("filter", newFilter);
			const queryStr = params.toString();
			const newHash = queryStr ? `${basePath}?${queryStr}` : basePath;
			if (window.location.hash !== newHash) window.history.replaceState(null, "", newHash);
		}
	};
	(0, import_react.useEffect)(() => {
		if (!storeState.employees?.length) hrStore.refresh().catch(() => {});
		return hrStore.subscribe((state) => {
			setStoreState(state);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const syncFromHash = () => {
			const hash = window.location.hash || "";
			const { query = {} } = parseLocationHash(hash);
			const effectiveQuery = {
				...propQuery || {},
				...query
			};
			if (effectiveQuery.tab) setActiveTab(effectiveQuery.tab);
			else setActiveTab("approvals");
			if (effectiveQuery.filter !== void 0) setFilter(effectiveQuery.filter);
			else setFilter("");
			if (effectiveQuery.id || effectiveQuery.leaveId) setTargetEntityId(effectiveQuery.id || effectiveQuery.leaveId);
		};
		window.addEventListener("hashchange", syncFromHash);
		return () => window.removeEventListener("hashchange", syncFromHash);
	}, [propQuery]);
	(0, import_react.useEffect)(() => {
		if (targetEntityId && storeState.leaves?.length) {
			const matched = storeState.leaves.find((l) => (l.id || l._id) === targetEntityId);
			if (matched) setSelected(matched);
		}
	}, [targetEntityId, storeState.leaves]);
	function showFeedback(msg) {
		setFeedbackNotice(msg);
		setTimeout(() => setFeedbackNotice(""), 4e3);
	}
	const allLeaves = storeState.leaves || [];
	const allEmployees = storeState.employees || [];
	let filteredRequests = activeTab === "lop" ? allDoubleLopLeaves : allLeaves;
	if (mode === "self") {
		const userEmpId = user?.employeeId;
		const userId = user?.id || user?._id;
		const userRef = user?.employeeRef;
		filteredRequests = filteredRequests.filter((l) => {
			if (userEmpId && (l.employeeId === userEmpId || l.employeeRef === userEmpId)) return true;
			if (userId && (l.employeeRef === userId || l.employeeId === userId)) return true;
			if (userRef && (l.employeeRef === userRef || l.employeeId === userRef)) return true;
			return false;
		});
	} else if (mode === "team") {
		const userEmpId = String(user?.employeeId || "");
		const userId = String(user?.id || user?._id || "");
		const userRole = user?.role;
		const candidateIds = [userId, userEmpId].filter(Boolean);
		const directReportIds = new Set(allEmployees.filter((e) => {
			const mgrId = String(e.managerId?._id || e.managerId?.id || e.managerId || "");
			return candidateIds.includes(mgrId);
		}).map((e) => String(e.id || e._id || e.employeeId || "")).filter(Boolean));
		filteredRequests = filteredRequests.filter((l) => {
			const lMgrId = String(l.managerId?._id || l.managerId?.id || l.managerId || "");
			const lEmpId = String(l.employeeId?._id || l.employeeId?.id || l.employeeId || l.employeeRef || "");
			const isDirectReport = candidateIds.includes(lMgrId) || directReportIds.has(lEmpId);
			if ([
				"director",
				"managing_director",
				"co_founder",
				"vertical_head"
			].includes(userRole) || user?.email === "jagadishbabu@edufyitech.in") return isDirectReport || l.status === "pending_director" || l.status === "pending_manager" || l.applicantRole === "manager";
			if ([
				"manager",
				"revenue_growth_manager",
				"senior_manager"
			].includes(userRole) || isDirectReport) return isDirectReport || l.status === "pending_manager" || user?.department && l.department === user.department;
			if (userRole === "team_lead" || userRole === "team_leader") return isDirectReport || userEmpId && (l.tlId === userEmpId || l.managerId === userEmpId) || userId && (l.tlId === userId || l.managerId === userId) || user?.department && l.department === user.department;
			return isDirectReport || candidateIds.includes(lMgrId);
		});
	}
	filteredRequests = filteredRequests.filter((r) => {
		if (activeTab === "lop") {
			if (filter === "pending_admin") {
				if (r.status !== "pending_admin") return false;
			} else if (filter === "pending_all") {
				if (![
					"pending_tl",
					"pending_manager",
					"pending_director",
					"pending_hr",
					"pending_admin"
				].includes(r.status)) return false;
			} else if (filter === "approved") {
				if (r.status !== "approved") return false;
			}
		} else if (filter === "pending_all") {
			if (!(r.status === "pending_tl" || r.status === "pending_manager" || r.status === "pending_director" || r.status === "pending_hr" || r.status === "pending_admin")) return false;
		} else if (filter === "pending_admin") {
			if (r.status !== "pending_admin") return false;
		} else if (filter && r.status !== filter) return false;
		if (typeFilter !== "all" && r.leaveType !== typeFilter) return false;
		if (search) {
			const q = search.toLowerCase();
			const name = (r.employeeName || "").toLowerCase();
			const id = (r.employeeId || "").toLowerCase();
			const reason = (r.reason || "").toLowerCase();
			if (!name.includes(q) && !id.includes(q) && !reason.includes(q)) return false;
		}
		return true;
	});
	filteredRequests.sort((a, b) => {
		const isPendingA = [
			"pending_tl",
			"pending_manager",
			"pending_director",
			"pending_hr",
			"pending_admin"
		].includes(a.status) ? 1 : 0;
		const isPendingB = [
			"pending_tl",
			"pending_manager",
			"pending_director",
			"pending_hr",
			"pending_admin"
		].includes(b.status) ? 1 : 0;
		if (isPendingA !== isPendingB) return isPendingB - isPendingA;
		const dateA = new Date(a.createdAt || a.startDate || 0);
		return new Date(b.createdAt || b.startDate || 0) - dateA;
	});
	(0, import_react.useEffect)(() => {
		if (targetEntityId) {
			const targetMatch = filteredRequests.find((r) => (r.id || r._id) === targetEntityId);
			if (targetMatch) {
				setSelected(targetMatch);
				return;
			}
		}
		const latest = filteredRequests.find((request) => request?.id === selected?.id) ?? filteredRequests[0] ?? null;
		if (latest !== selected) setSelected(latest);
	}, [filteredRequests, targetEntityId]);
	const allDoubleLopLeaves = (0, import_react.useMemo)(() => {
		return allLeaves.filter(isDoubleLopLeave);
	}, [allLeaves]);
	const totalRequests = allLeaves.length;
	const pendingAdminCount = allLeaves.filter((l) => l.status === "pending_admin").length;
	const pendingDoubleLopCount = allLeaves.filter((l) => isDoubleLopLeave(l) && [
		"pending_tl",
		"pending_manager",
		"pending_director",
		"pending_hr",
		"pending_admin"
	].includes(l.status)).length;
	const approvedDoubleLopCount = allLeaves.filter((l) => isDoubleLopLeave(l) && l.status === "approved").length;
	const pendingCount = allLeaves.filter((l) => l.status === "pending_manager" || l.status === "pending_director" || l.status === "pending_hr" || l.status === "pending_admin").length;
	const approvedCount = allLeaves.filter((l) => l.status === "approved").length;
	const today = todayKey();
	const onLeaveToday = allLeaves.filter((l) => l.status === "approved" && l.startDate <= today && l.endDate >= today);
	const handleQuickApprove = storeAction(async (request) => {
		let role = "hr";
		if (user?.role === "admin" || request.status === "pending_admin") role = "admin";
		else if ([
			"director",
			"managing_director",
			"co_founder"
		].includes(user?.role) || request.status === "pending_director") role = "director";
		else if (["manager", "revenue_growth_manager"].includes(user?.role) || request.status === "pending_manager") role = "manager";
		await hrStore.approveLeave(request.id, role, "Approved after review", user);
		showFeedback(`Approved ${leaveTypeLabels[request.leaveType] || request.leaveType} for ${request.employeeName}.`);
	});
	function handleQuickRejectPrompt(request) {
		setRejectingLeave(request);
		setRejectReason("");
	}
	(0, import_react.useEffect)(() => {
		if (!rejectingLeave) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const handleKeyDown = (e) => {
			if (e.key === "Escape") setRejectingLeave(null);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [rejectingLeave]);
	const handleConfirmReject = storeAction(async () => {
		if (!rejectingLeave) return;
		const reason = rejectReason.trim() || "Declined due to operational coverage requirements.";
		let role = "hr";
		if (user?.role === "admin" || rejectingLeave.status === "pending_admin") role = "admin";
		else if ([
			"director",
			"managing_director",
			"co_founder"
		].includes(user?.role) || rejectingLeave.status === "pending_director") role = "director";
		else if (["manager", "revenue_growth_manager"].includes(user?.role) || rejectingLeave.status === "pending_manager") role = "manager";
		await hrStore.rejectLeave(rejectingLeave?.id, role, reason, user);
		setRejectingLeave(null);
		setRejectReason("");
		showFeedback(`Declined leave request for ${rejectingLeave?.employeeName || "employee"}.`);
	});
	const handleDeleteLeave = storeAction(async () => {
		if (!leaveToDelete?.id) return;
		await hrStore.deleteLeave(leaveToDelete.id);
		setLeaveToDelete(null);
		showFeedback("Leave record removed from system.");
	});
	function handleExportCSV() {
		const headers = [
			"Leave ID",
			"Employee ID",
			"Employee Name",
			"Department",
			"Leave Type",
			"Start Date",
			"End Date",
			"Days",
			"Status",
			"Reason",
			"Manager Comment",
			"HR Comment",
			"Created Date"
		];
		const rows = filteredRequests.map((l) => [
			l?.id || l?._id || "",
			l?.employeeId || "",
			l?.employeeName || "",
			l?.department || "General",
			l?.leaveType || "",
			l?.startDate || "",
			l?.endDate || "",
			l?.days || 1,
			l?.status || "",
			`"${(l?.reason || "").replace(/"/g, "\"\"")}"`,
			`"${(l?.managerComment || "").replace(/"/g, "\"\"")}"`,
			`"${(l?.hrComment || "").replace(/"/g, "\"\"")}"`,
			l?.createdAt || ""
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `edufyi_leaves_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		showFeedback("Exported leave requests to CSV successfully.");
	}
	const balancesRaw = storeState.leaveBalances ?? [];
	const userEmpId = String(user?.employeeId || "").trim();
	const userId = String(user?.id || user?._id || "").trim();
	const defaultFallbackBalances = [{
		leaveType: "casual",
		allowance: String(user?.role || "").toLowerCase().includes("intern") || String(user?.designation || "").toLowerCase().includes("intern") ? 0 : 1,
		used: 0,
		reserved: 0
	}, {
		leaveType: "sick",
		allowance: 1,
		used: 0,
		reserved: 0
	}];
	const myBalances = balancesRaw.filter((b) => {
		if (!b) return false;
		const bEmpObj = typeof b.employeeId === "object" && b.employeeId !== null ? b.employeeId : null;
		const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === "string" ? b.employeeId : "")).trim();
		const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === "string" ? b.employeeId : "")).trim();
		return userEmpId && (bEmpCode === userEmpId || bEmpId === userEmpId) || userId && (bEmpId === userId || bEmpCode === userId);
	});
	const balancesSelf = (myBalances.length > 0 ? myBalances : defaultFallbackBalances).map((balance) => ({
		leaveType: balance?.leaveType || "General Leave",
		available: Math.max(0, (balance?.allowance || 0) - (balance?.used || 0) - (balance?.reserved || 0)),
		total: balance?.allowance || 0,
		used: balance?.used || 0,
		reserved: balance?.reserved || 0
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "leave-management-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageHeader, {
				eyebrow: isSelf ? "Employee Self-Service" : mode === "admin" ? "Admin Executive Authority" : mode === "team" ? "Direct Reports Governance" : "Workforce Governance",
				title: isSelf ? "My Leave & Time Off" : mode === "team" ? "Team Leave Approvals" : mode === "admin" ? "Admin Leave Management" : "HR Leave Management",
				description: isSelf ? "Monitor leave balances, apply for time off, and follow the approval workflow." : mode === "team" ? "Review and endorse leave requests for your direct engineering reports." : mode === "admin" ? "Review workforce leave approvals, sign off on Month-End (25th+) LOP escalations, and manage organizational quotas." : "Manage leave policies, employee entitlements, approvals, and holiday rules.",
				children: [isManagement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: handleExportCSV,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 15 }), " Export CSV"]
				}), isManagement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setActiveTab("grant"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " Grant Leave"]
				})]
			}),
			feedbackNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "10px",
					background: "var(--soft-teal)",
					border: "1px solid rgba(29, 138, 122, 0.3)",
					borderRadius: "9px",
					padding: "11px 16px",
					marginBottom: "16px",
					color: "var(--teal)",
					fontSize: "11px",
					fontWeight: 600,
					animation: "fadeUp 0.3s ease"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { flex: 1 },
						children: feedbackNotice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFeedbackNotice(""),
						style: {
							border: 0,
							background: "transparent",
							cursor: "pointer",
							color: "var(--teal)"
						},
						children: "✕"
					})
				]
			}),
			isManagement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "leave-kpi-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-kpi-card pending",
						onClick: () => {
							if (pendingAdminCount > 0) navigateToTab("lop", "pending_admin");
							else navigateToTab("approvals", "pending_all");
						},
						title: "Click to filter pending requests",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-title",
									children: pendingAdminCount > 0 ? "Pending Admin LOP" : "Pending Approvals"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "leave-kpi-icon-wrap pending",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 15 })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-value",
								children: [pendingAdminCount > 0 ? pendingAdminCount : pendingCount, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-unit",
									children: "Requests"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "leave-kpi-sub",
								children: pendingAdminCount > 0 ? `${pendingAdminCount} LOP request(s) awaiting Admin sign-off` : pendingCount ? `${pendingCount} leave request(s) awaiting review` : "All leave queues cleared"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-kpi-card approved",
						onClick: () => navigateToTab("approvals", "approved"),
						title: "Click to filter approved leaves",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-title",
									children: "Approved Leaves (YTD)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "leave-kpi-icon-wrap approved",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-value",
								children: [approvedCount, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-unit",
									children: "Records"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "leave-kpi-sub",
								children: "Authorized workforce absences"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-kpi-card on-leave",
						onClick: () => {
							setActiveTab("approvals");
							setFilter("approved");
						},
						title: "Click to filter approved records",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-title",
									children: "Staff On Leave Today"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "leave-kpi-icon-wrap on-leave",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 15 })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-value",
								style: { color: onLeaveToday.length ? "var(--blue)" : "inherit" },
								children: [onLeaveToday.length, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-unit",
									children: "Staff"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "leave-kpi-sub",
								title: onLeaveToday.length ? onLeaveToday.map((x) => x.employeeName).join(", ") : "Full on-site coverage",
								children: onLeaveToday.length ? onLeaveToday.map((x) => x.employeeName).join(", ") : "Full on-site coverage"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-kpi-card total",
						onClick: () => navigateToTab("approvals", ""),
						title: "Click to view all requests",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-title",
									children: "Total Requests"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "leave-kpi-icon-wrap total",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 15 })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "leave-kpi-value",
								children: [totalRequests, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "leave-kpi-unit",
									children: "Total"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "leave-kpi-sub",
								children: "All-time company requests"
							})
						]
					})
				]
			}),
			isManagement && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "subnav-tabs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${activeTab === "approvals" ? "active" : ""}`,
						onClick: () => navigateToTab("approvals", ""),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 14 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Leave Requests & Approvals" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge-pill",
								children: pendingCount ? `${pendingCount} Pending` : totalRequests
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${activeTab === "lop" ? "active" : ""}`,
						onClick: () => navigateToTab("lop", pendingAdminCount > 0 ? "pending_admin" : ""),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
								size: 14,
								style: { color: pendingAdminCount > 0 ? "#ef4444" : "inherit" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "25th+ Month-End LOP Sign-Offs" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge-pill",
								style: pendingAdminCount > 0 ? {
									background: "#ef4444",
									color: "#fff",
									fontWeight: 700
								} : {},
								children: pendingAdminCount > 0 ? `${pendingAdminCount} Awaiting` : `${allDoubleLopLeaves.length} Records`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${activeTab === "grant" ? "active" : ""}`,
						onClick: () => navigateToTab("grant", ""),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Grant / Record Leave" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${activeTab === "quotas" ? "active" : ""}`,
						onClick: () => navigateToTab("quotas", ""),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 14 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Leave Balances & Quotas" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "badge-pill",
								children: [allEmployees.length, " Staff"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${activeTab === "policy" ? "active" : ""}`,
						onClick: () => navigateToTab("policy", ""),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 14 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Leave Policies & Holidays" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge-pill",
								children: "2026 Rules"
							})
						]
					})
				]
			}),
			isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "leave-balance-grid",
				children: balancesSelf.map((b) => {
					const isCasual = b.leaveType.toLowerCase().includes("casual");
					const isSick = b.leaveType.toLowerCase().includes("sick");
					const isEarned = b.leaveType.toLowerCase().includes("earned") || b.leaveType.toLowerCase().includes("privilege");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leave-balance-card",
						style: {
							background: isCasual ? "linear-gradient(135deg, rgba(209, 250, 229, 0.4) 0%, #ffffff 100%)" : isSick ? "linear-gradient(135deg, rgba(204, 251, 241, 0.4) 0%, #ffffff 100%)" : isEarned ? "linear-gradient(135deg, rgba(219, 234, 254, 0.4) 0%, #ffffff 100%)" : "linear-gradient(135deg, rgba(243, 244, 246, 0.5) 0%, #ffffff 100%)",
							borderTop: `3px solid ${isCasual ? "#10b981" : isSick ? "#0d9488" : isEarned ? "#3b82f6" : "#6366f1"}`
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.leaveType }), isCasual ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
									size: 15,
									color: "#059669"
								}) : isSick ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
									size: 15,
									color: "#0d9488"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
									size: 15,
									color: "#3b82f6"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
								typeof b.available === "number" ? b.available % 1 === 0 ? b.available : b.available.toFixed(1) : b.available,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "13px",
										fontWeight: 500,
										color: "var(--muted)"
									},
									children: "Days"
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
								style: { color: "#4b5563" },
								children: [
									"Used: ",
									typeof b.used === "number" ? b.used % 1 === 0 ? b.used : b.used.toFixed(1) : b.used,
									"d · Reserved: ",
									typeof b.reserved === "number" ? b.reserved % 1 === 0 ? b.reserved : b.reserved.toFixed(1) : b.reserved,
									"d"
								]
							})
						]
					}, b.leaveType);
				})
			}),
			isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplyLeaveSelf, { onSubmitted: () => {
				hrStore.refresh().catch(() => {});
				setRefreshKey((k) => k + 1);
			} }),
			(activeTab === "approvals" || activeTab === "lop") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				activeTab === "lop" && (pendingAdminCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#fef2f2",
						border: "1px solid #fecaca",
						borderRadius: "10px",
						padding: "12px 16px",
						marginBottom: "16px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
							size: 18,
							style: {
								color: "#ef4444",
								flexShrink: 0
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								color: "#991b1b",
								fontSize: "12.5px"
							},
							children: [
								"Action Required: ",
								pendingAdminCount,
								" Month-End (25th+) LOP Request(s) Awaiting Admin Sign-off"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								color: "#b91c1c",
								fontSize: "11px",
								marginTop: "2px"
							},
							children: "HR Operations has verified these 25th+ month-end loss of pay leaves and forwarded them for final administrative sign-off."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ui-button secondary",
						style: {
							padding: "4px 10px",
							fontSize: "11.5px"
						},
						onClick: () => navigateToTab("approvals", ""),
						children: "← Back to All Requests"
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#f0fdf4",
						border: "1px solid #bbf7d0",
						borderRadius: "10px",
						padding: "12px 16px",
						marginBottom: "16px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							size: 18,
							style: {
								color: "#16a34a",
								flexShrink: 0
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								color: "#166534",
								fontSize: "12.5px"
							},
							children: [
								"25th+ Month-End LOP & Double LOP Records (",
								allDoubleLopLeaves.length,
								" Total)"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								color: "#15803d",
								fontSize: "11px",
								marginTop: "2px"
							},
							children: "All administrative sign-off queues are cleared (0 awaiting admin sign-off)."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "ui-button secondary",
						style: {
							padding: "4px 10px",
							fontSize: "11.5px"
						},
						onClick: () => navigateToTab("approvals", ""),
						children: "← Back to All Requests"
					})]
				})),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "10px",
						marginBottom: "16px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "12px",
							width: "100%"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "10px",
								alignItems: "center",
								flexWrap: "wrap",
								flex: "1 1 auto",
								minWidth: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "module-search",
									style: {
										flex: "1 1 240px",
										minWidth: "200px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										placeholder: "Search employee name, ID, or reason...",
										value: search,
										onChange: (e) => setSearch(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "leave-filter",
									value: filter,
									onChange: (event) => setFilter(event.target.value),
									style: { minWidth: "150px" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "All statuses"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: "pending_all",
											children: [
												"⚡ All Pending Action (",
												pendingCount,
												")"
											]
										}),
										Object.entries(labels).map(([val, lbl]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: val,
											children: lbl
										}, val))
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "leave-filter",
									value: typeFilter,
									onChange: (event) => setTypeFilter(event.target.value),
									style: { minWidth: "150px" },
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "All leave types"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "casual",
											children: "Casual Leave (CL)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "sick",
											children: "Sick Leave (SL)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "earned",
											children: "Earned Leave (EL)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "comp_off",
											children: "Compensatory Off"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "maternity",
											children: "Maternity/Paternity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "lop",
											children: "Loss of Pay (LOP)"
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "view-mode-toggle",
							style: { flexShrink: 0 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `view-mode-btn ${viewMode === "split" ? "active" : ""}`,
								onClick: () => setViewMode("split"),
								title: "Split Review View",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { size: 13 }), " Split View"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `view-mode-btn ${viewMode === "table" ? "active" : ""}`,
								onClick: () => setViewMode("table"),
								title: "Data Table View",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Table, { size: 13 }), " Table View"]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							gap: "8px",
							alignItems: "center",
							flexWrap: "wrap"
						},
						children: activeTab === "lop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `leave-pill-btn ${!filter || filter === "all_lop" ? "active" : ""}`,
								onClick: () => updateFilter(""),
								children: [
									"All 25th+ / Double LOP (",
									allDoubleLopLeaves.length,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `leave-pill-btn ${filter === "pending_admin" ? "active" : ""}`,
								onClick: () => updateFilter(filter === "pending_admin" ? "" : "pending_admin"),
								style: pendingAdminCount > 0 ? {
									borderColor: "#ef4444",
									color: filter === "pending_admin" ? "#ffffff" : "#b91c1c",
									background: filter === "pending_admin" ? "#ef4444" : "#fee2e2",
									fontWeight: 700
								} : {},
								children: [
									"⚡ Awaiting Admin Sign-Off (",
									pendingAdminCount,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `leave-pill-btn ${filter === "pending_all" ? "active" : ""}`,
								onClick: () => updateFilter(filter === "pending_all" ? "" : "pending_all"),
								children: [
									"In Review Pipeline (",
									pendingDoubleLopCount,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `leave-pill-btn ${filter === "approved" ? "active" : ""}`,
								onClick: () => updateFilter(filter === "approved" ? "" : "approved"),
								children: [
									"Approved (",
									approvedDoubleLopCount,
									")"
								]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `leave-pill-btn ${!filter ? "active" : ""}`,
								onClick: () => updateFilter(""),
								children: [
									"All Requests (",
									totalRequests,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `leave-pill-btn ${filter === "pending_all" ? "active" : ""}`,
								onClick: () => updateFilter(filter === "pending_all" ? "" : "pending_all"),
								style: pendingCount > 0 ? {
									borderColor: "#f59e0b",
									color: filter === "pending_all" ? "#ffffff" : "#b45309",
									background: filter === "pending_all" ? "#f59e0b" : "#fef3c7",
									fontWeight: 700
								} : {},
								children: [
									"⚡ Pending Review (",
									pendingCount,
									")"
								]
							}),
							pendingAdminCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "leave-pill-btn",
								onClick: () => navigateToTab("lop", "pending_admin"),
								style: {
									borderColor: "#ef4444",
									color: "#b91c1c",
									background: "#fee2e2",
									fontWeight: 700
								},
								children: [
									"🛡️ 25th+ Admin Sign-Off (",
									pendingAdminCount,
									")"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `leave-pill-btn ${filter === "approved" ? "active" : ""}`,
								onClick: () => updateFilter(filter === "approved" ? "" : "approved"),
								children: [
									"Approved (",
									approvedCount,
									")"
								]
							})
						] })
					})]
				}),
				viewMode === "split" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "leave-workspace-grid",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel leave-list-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Queue & History"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: mode === "team" ? "Direct Reports" : isManagement ? activeTab === "lop" ? filter === "pending_admin" ? "Pending Admin LOP Requests" : "25th+ Month-End LOP & Double LOP Requests" : filter === "pending_all" ? "Pending Approvals" : filter === "approved" ? "Approved Leaves" : "All Company Requests" : "My Requests" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)",
									fontWeight: 600
								},
								children: [filteredRequests.length, " record(s)"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "leave-request-list",
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "12px",
								maxHeight: "calc(100vh - 260px)",
								minHeight: "420px",
								overflowY: "auto",
								overflowX: "hidden",
								paddingRight: "6px",
								width: "100%",
								boxSizing: "border-box"
							},
							children: filteredRequests.length ? filteredRequests.map((request, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestCard, {
								request,
								selected: selected?.id === request?.id,
								onSelect: setSelected,
								onQuickApprove: isManagement ? handleQuickApprove : null,
								onQuickReject: isManagement ? handleQuickRejectPrompt : null,
								onDeleteRequest: isManagement ? setLeaveToDelete : null
							}, request?.id || request?._id || idx)) : activeTab === "lop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "24px 16px",
									textAlign: "center",
									background: "#f8fafc",
									borderRadius: "10px",
									border: "1px dashed #cbd5e1"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
										size: 28,
										style: {
											color: "#16a34a",
											margin: "0 auto 8px",
											display: "block"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											fontSize: "12.5px",
											color: "#1e293b",
											display: "block",
											marginBottom: "4px"
										},
										children: filter === "pending_admin" ? "No Pending Admin LOP Approvals" : "No 25th+ Month-End LOP Records"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											color: "#64748b",
											fontSize: "11px",
											display: "block",
											marginBottom: "10px"
										},
										children: filter === "pending_admin" ? "No month-end (25th+) loss of pay requests are currently awaiting Admin sign-off." : "No employee leave requests have been classified under 25th+ month-end LOP."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "8px",
											justifyContent: "center"
										},
										children: [filter && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											style: {
												padding: "4px 10px",
												fontSize: "11px"
											},
											onClick: () => updateFilter(""),
											children: [
												"Show All Double LOP Records (",
												allDoubleLopLeaves.length,
												")"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button",
											style: {
												padding: "4px 10px",
												fontSize: "11px"
											},
											onClick: () => navigateToTab("approvals", ""),
											children: [
												"← View All Company Requests (",
												totalRequests,
												")"
											]
										})]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								title: "No matching leave requests",
								message: "Adjust filters or search criteria to view requests."
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestDetail, {
						request: selected,
						mode,
						onRefresh: () => setRefreshKey((k) => k + 1),
						onDeleteRequest: setLeaveToDelete,
						onPromptReject: isManagement ? handleQuickRejectPrompt : null
					})]
				}),
				viewMode === "table" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "panel",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						caption: "Company leave management queue",
						columns: [
							{
								key: "employee",
								label: "Employee",
								render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r.employeeName || "Employee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "9px",
										color: "var(--muted)"
									},
									children: [
										(typeof r.employeeId === "object" ? r.employeeId?.employeeId : r.employeeId) || "N/A",
										" · ",
										r.department || "General"
									]
								})] })
							},
							{
								key: "leaveType",
								label: "Leave Type",
								render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { fontWeight: 600 },
									children: leaveTypeLabels[r.leaveType] || r.leaveType
								})
							},
							{
								key: "dates",
								label: "Date Range",
								render: (r) => `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`
							},
							{
								key: "days",
								label: "Days",
								render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: Boolean(r.isHalfDay || r.days === .5 || r.units === .5) ? "0.5 d (Half)" : `${r.days || 1} d` })
							},
							{
								key: "reason",
								label: "Reason",
								render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										maxWidth: "180px",
										display: "inline-block",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										color: "var(--muted)"
									},
									children: r.reason
								})
							},
							{
								key: "status",
								label: "Status",
								render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestStatus, { status: r.status })
							},
							{
								key: "actions",
								label: "Actions",
								render: (r) => {
									const isPending = (r.status === "pending_hr" || r.status === "pending_manager" || r.status === "pending_director" || r.status === "pending_admin") && user?.role !== "team_lead";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "emp-action-group",
										children: [
											isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "emp-action-btn view",
												onClick: () => handleQuickApprove(r),
												title: "Quick Approve",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 12 }), " Approve"]
											}),
											isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "emp-action-btn delete",
												onClick: () => handleQuickRejectPrompt(r),
												title: "Quick Reject",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 12 }), " Reject"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "emp-action-btn edit",
												onClick: () => {
													setSelected(r);
													setViewMode("split");
												},
												title: "View Full Details",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 12 }), " View"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "emp-action-btn delete",
												onClick: () => setLeaveToDelete(r),
												title: "Delete Request",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 })
											})
										]
									});
								}
							}
						],
						rows: filteredRequests,
						emptyMessage: "No leave records matching the selected filters."
					})
				})
			] }),
			activeTab === "grant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrantLeaveHR, {
				employees: allEmployees,
				preselectedEmpId,
				onGranted: () => {
					setActiveTab("approvals");
					setPreselectedEmpId("");
					showFeedback("Leave granted and recorded successfully.");
				}
			}),
			activeTab === "quotas" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaveBalanceTable, {
				balances: storeState.leaveBalances ?? [],
				employees: allEmployees,
				onSwitchTab: setActiveTab
			}),
			activeTab === "policy" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeavePolicySettings, {
				employees: allEmployees,
				allRequests: allLeaves,
				onSwitchTab: setActiveTab
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationDialog, {
				open: Boolean(leaveToDelete),
				title: "Delete Leave Request",
				message: `Are you sure you want to permanently remove the leave record for ${leaveToDelete?.employeeName} (${leaveToDelete?.leaveType}, ${formatDate(leaveToDelete?.startDate)} to ${formatDate(leaveToDelete?.endDate)})?`,
				confirmLabel: "Yes, Delete Record",
				isDestructive: true,
				onConfirm: handleDeleteLeave,
				onCancel: () => setLeaveToDelete(null)
			}),
			rejectingLeave && typeof document !== "undefined" && (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "reject-modal-backdrop",
				onClick: () => setRejectingLeave(null),
				style: {
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					width: "100vw",
					height: "100vh",
					zIndex: 999999,
					display: "grid",
					placeItems: "center",
					background: "rgba(15, 23, 42, 0.65)",
					backdropFilter: "blur(4px)",
					padding: "20px",
					boxSizing: "border-box"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "reject-modal",
					onClick: (e) => e.stopPropagation(),
					style: {
						position: "relative",
						margin: "auto",
						width: "min(100%, 480px)",
						background: "#ffffff",
						border: "1px solid var(--line, #e2e8f0)",
						borderRadius: "14px",
						padding: "24px",
						boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.35)",
						boxSizing: "border-box",
						animation: "dialogPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								style: {
									margin: 0,
									fontSize: "15px",
									fontWeight: 700
								},
								children: ["Decline Leave Request: ", rejectingLeave.employeeName]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setRejectingLeave(null),
								children: "✕"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								margin: "0 0 14px"
							},
							children: [
								"Please provide the official reason for declining ",
								rejectingLeave.employeeName,
								"'s ",
								leaveTypeLabels[rejectingLeave.leaveType] || rejectingLeave.leaveType,
								" request (",
								rejectingLeave.days || 1,
								" day(s))."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Rejection Reason",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: rejectReason,
								onChange: (e) => setRejectReason(e.target.value),
								placeholder: "e.g. Critical project sprint milestone, overlapping team members on leave, delivery deadline...",
								rows: 3,
								style: {
									width: "100%",
									padding: "9px 12px",
									borderRadius: "8px",
									border: "1px solid var(--line)",
									fontSize: "11px"
								},
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								marginTop: "16px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setRejectingLeave(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								onClick: handleConfirmReject,
								children: "Confirm Rejection"
							})]
						})
					]
				})
			}), document.body)
		]
	});
}
export { LeaveManagementPage };
