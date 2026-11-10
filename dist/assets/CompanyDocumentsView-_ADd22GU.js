import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $t as Calendar, A as ShieldCheck, At as FileCheckCorner, Bt as Clock, Dt as FileText, Ft as Download, Gt as CircleAlert, H as Receipt, L as Search, Mt as Eye, Pt as ExternalLink, Q as Paperclip, Vt as Clock3, Wt as CircleCheck, _n as require_react, ct as Lock, dn as Bell, g as Upload, i as X, in as BuildingComplex, ln as BookOpen, pt as LifeBuoy, rt as Megaphone, s as WalletCards, tn as CalendarDays, v as TrendingUp, y as Trash } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { I as apiClient, P as workspaceAction, T as hrStore, a as Field, o as PageHeader, r as DataTable, t as Button, x as useAuth } from "./index-h6RiD0DV.js";
import { n as formatINR } from "./currency-oCUzM0NR.js";
import { n as OFFICIAL_COMPANY_DOCUMENTS, r as COMPANY_POLICIES, t as COMPLIANCE_AND_NDA_TEMPLATES } from "./companyDocumentsConstants-DUkgikMQ.js";
// src/components/WorkspaceRecords.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function useWorkspaceState() {
	const [state, setState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => hrStore.subscribe(setState), []);
	return state;
}
var action = (handler) => workspaceAction(hrStore, handler);
function PerformanceWorkspace() {
	const state = useWorkspaceState();
	const { user } = useAuth();
	const management = ["admin", "hr"].includes(user?.role);
	const [goal, setGoal] = (0, import_react.useState)({
		employeeId: "",
		title: "",
		target: "",
		dueDate: "",
		progress: 0
	});
	const [review, setReview] = (0, import_react.useState)({
		employeeId: "",
		period: "",
		rating: "",
		comments: ""
	});
	const [notice, setNotice] = (0, import_react.useState)("");
	const publishGoal = action(async (event) => {
		event.preventDefault();
		await hrStore.addPerformanceGoal({
			...goal,
			progress: Number(goal.progress)
		});
		setGoal({
			employeeId: "",
			title: "",
			target: "",
			dueDate: "",
			progress: 0
		});
		setNotice("Performance goal saved.");
	});
	const publishReview = action(async (event) => {
		event.preventDefault();
		await hrStore.addPerformanceReview({
			...review,
			rating: Number(review.rating)
		});
		setReview({
			employeeId: "",
			period: "",
			rating: "",
			comments: ""
		});
		setNotice("Performance review saved.");
	});
	function employeeField(value, onChange) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "Employee",
			required: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				required: true,
				value,
				onChange,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "Choose employee"
				}), (state.workspacePeople ?? []).map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: person.id,
					children: person.name
				}, person.id))]
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "18px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "People Development",
				title: "Performance & Recognition",
				description: "Actual saved goals, performance reviews, and peer recognition. No default ratings or appraisal cycles."
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: notice
			}),
			management && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "panel",
					onSubmit: publishGoal,
					style: {
						padding: "16px",
						display: "grid",
						gap: "10px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Create performance goal" }),
						employeeField(goal.employeeId, (event) => setGoal({
							...goal,
							employeeId: event.target.value
						})),
						[
							"title",
							"target",
							"dueDate",
							"progress"
						].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: key,
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: key === "dueDate" ? "date" : key === "progress" ? "number" : "text",
								min: 0,
								max: 100,
								required: true,
								value: goal[key],
								onChange: (event) => setGoal({
									...goal,
									[key]: event.target.value
								})
							})
						}, key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Save goal"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "panel",
					onSubmit: publishReview,
					style: {
						padding: "16px",
						display: "grid",
						gap: "10px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Record performance review" }),
						employeeField(review.employeeId, (event) => setReview({
							...review,
							employeeId: event.target.value
						})),
						[
							"period",
							"rating",
							"comments"
						].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: key,
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: key === "rating" ? "number" : "text",
								min: 1,
								max: 5,
								step: .1,
								required: true,
								value: review[key],
								onChange: (event) => setReview({
									...review,
									[key]: event.target.value
								})
							})
						}, key)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Save review"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				caption: "Performance goals",
				columns: [
					{
						key: "employeeName",
						label: "Employee"
					},
					{
						key: "title",
						label: "Goal"
					},
					{
						key: "target",
						label: "Target"
					},
					{
						key: "dueDate",
						label: "Due"
					},
					{
						key: "progress",
						label: "Progress",
						render: (record) => management ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": `Progress for ${record.title}`,
							type: "number",
							min: 0,
							max: 100,
							defaultValue: record.progress,
							onBlur: action((event) => Number(event.target.value) === record.progress ? void 0 : hrStore.updatePerformanceGoal(record.id, Number(event.target.value)))
						}, `${record.id}-${record.progress}`) : `${record.progress}%`
					}
				],
				rows: state.performanceGoals ?? []
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				caption: "Performance reviews",
				columns: [
					{
						key: "employeeName",
						label: "Employee"
					},
					{
						key: "period",
						label: "Period"
					},
					{
						key: "rating",
						label: "Rating / 5"
					},
					{
						key: "comments",
						label: "Review"
					},
					{
						key: "reviewerName",
						label: "Reviewer"
					}
				],
				rows: state.performanceReviews ?? []
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				caption: "Peer recognition",
				columns: [
					{
						key: "from",
						label: "From"
					},
					{
						key: "to",
						label: "Recipient"
					},
					{
						key: "badge",
						label: "Recognition"
					},
					{
						key: "message",
						label: "Message"
					},
					{
						key: "date",
						label: "Date"
					}
				],
				rows: state.kudos ?? []
			})
		]
	});
}
function WorkspaceReports() {
	const state = useWorkspaceState();
	const { user } = useAuth();
	const isAdmin = user?.role === "admin";
	const [activeTab, setActiveTab] = (0, import_react.useState)("dailyReports");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [expenseFilter, setExpenseFilter] = (0, import_react.useState)("all");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [viewingReceiptModal, setViewingReceiptModal] = (0, import_react.useState)(null);
	const showNotice = (msg) => {
		setNotice(msg);
		setTimeout(() => setNotice(""), 4e3);
	};
	const dailyReports = state.dailyReports ?? [];
	const expenses = state.expenses ?? [];
	const totalReports = dailyReports.length;
	const totalHours = dailyReports.reduce((sum, r) => sum + (Number(r.hoursLogged) || 0), 0);
	const totalClaimed = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
	const pendingClaims = expenses.filter((e) => (e.status || "submitted") === "submitted").length;
	const pendingAmount = expenses.filter((e) => (e.status || "submitted") === "submitted").reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
	const filteredReports = dailyReports.filter((r) => {
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase();
			const matchEmp = (r.employeeName || "").toLowerCase().includes(q);
			const matchSummary = (r.tasksSummary || r.summary || "").toLowerCase().includes(q);
			const matchChallenges = (r.challenges || "").toLowerCase().includes(q);
			const matchDate = (r.date || "").toLowerCase().includes(q);
			if (!matchEmp && !matchSummary && !matchChallenges && !matchDate) return false;
		}
		return true;
	});
	const filteredExpenses = expenses.filter((e) => {
		const s = (e.status || "submitted").toLowerCase();
		if (expenseFilter === "submitted" && s !== "submitted") return false;
		if (expenseFilter === "approved" && s !== "approved" && s !== "reimbursed") return false;
		if (expenseFilter === "rejected" && s !== "rejected") return false;
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase();
			const matchEmp = (e.employeeName || "").toLowerCase().includes(q);
			const matchMerchant = (e.merchant || "").toLowerCase().includes(q);
			const matchCategory = (e.category || "").toLowerCase().includes(q);
			const matchNotes = (e.comments || e.notes || "").toLowerCase().includes(q);
			if (!matchEmp && !matchMerchant && !matchCategory && !matchNotes) return false;
		}
		return true;
	});
	const handleDeleteDailyReport = action(async (id) => {
		if (!window.confirm("Are you sure you want to delete this daily work report entry? This cannot be undone.")) return;
		await hrStore.deleteDailyReport(id);
		showNotice("Daily work report deleted successfully.");
	});
	const handleDeleteExpense = action(async (id) => {
		if (!isAdmin) {
			alert("Only administrators have access to delete expense claims.");
			return;
		}
		if (!window.confirm("Are you sure you want to delete this expense claim? This cannot be undone.")) return;
		await hrStore.deleteExpense(id);
		showNotice("Expense claim record deleted successfully.");
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Workforce Reports & Compliance",
				title: "Daily Reports & Expense Review",
				description: "Review actual submitted work logs, task accomplishments, blockers, and process staff reimbursement claims."
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "11px 16px",
					background: "#eaf4f1",
					color: "var(--teal)",
					border: "1px solid #c7ded7",
					borderRadius: "8px",
					fontSize: "12px",
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: { flex: 1 },
						children: notice
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setNotice(""),
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "metric-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#eef2f6",
								color: "var(--blue)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Daily Reports" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [totalReports, " Submissions"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Across active departments" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#eaf4f1",
								color: "var(--teal)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Workforce Hours Logged" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [totalHours, " hrs"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Logged productive time" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#fbf3e6",
								color: "#b97926"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Claims Awaiting Audit" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
									pendingClaims,
									" Claims (",
									formatINR(pendingAmount),
									")"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Ready for review" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#faf9f5",
								color: "var(--ink)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Claims Value" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(totalClaimed) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [expenses.length, " claims submitted"] })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: "8px",
					borderBottom: "1px solid var(--line)",
					paddingBottom: "2px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setActiveTab("dailyReports");
						setSearchTerm("");
					},
					style: {
						padding: "8px 16px",
						fontSize: "13px",
						fontWeight: 700,
						border: 0,
						background: "transparent",
						cursor: "pointer",
						color: activeTab === "dailyReports" ? "var(--teal)" : "var(--muted)",
						borderBottom: activeTab === "dailyReports" ? "3px solid var(--teal)" : "3px solid transparent",
						marginBottom: "-2px",
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Daily Work Reports (",
						dailyReports.length,
						")"
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setActiveTab("expenses");
						setSearchTerm("");
					},
					style: {
						padding: "8px 16px",
						fontSize: "13px",
						fontWeight: 700,
						border: 0,
						background: "transparent",
						cursor: "pointer",
						color: activeTab === "expenses" ? "var(--teal)" : "var(--muted)",
						borderBottom: activeTab === "expenses" ? "3px solid var(--teal)" : "3px solid transparent",
						marginBottom: "-2px",
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Expense Claims Review (",
						expenses.length,
						")"
					] })]
				})]
			}),
			activeTab === "dailyReports" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					style: {
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Operational Logs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Submitted Daily Work Reports" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { position: "relative" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							size: 13,
							style: {
								position: "absolute",
								left: "10px",
								top: "9px",
								color: "var(--muted)"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							className: "text-input",
							placeholder: "Search employee, tasks, date...",
							value: searchTerm,
							onChange: (e) => setSearchTerm(e.target.value),
							style: {
								width: "220px",
								paddingLeft: "28px",
								fontSize: "11.5px",
								height: "32px"
							}
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "16px",
						overflowX: "auto"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Hours" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Tasks Summary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Blockers / Challenges" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Tomorrow's Plan" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "right" },
								children: "Action"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredReports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							colSpan: 7,
							style: {
								textAlign: "center",
								padding: "36px",
								color: "var(--muted)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									size: 28,
									style: {
										opacity: .4,
										margin: "0 auto 8px",
										display: "block"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "13px",
										display: "block",
										color: "var(--ink)"
									},
									children: "No daily work reports found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { fontSize: "11.5px" },
									children: "Team reports will appear here as employees log their daily progress."
								})
							]
						}) }) : filteredReports.map((r, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: {
									color: "var(--ink)",
									display: "block"
								},
								children: r.employeeName || "Staff"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10.5px",
									color: "var(--muted)"
								},
								children: r.employeeId
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.date ? new Date(r.date).toLocaleDateString() : "Recent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "role-badge",
								style: {
									fontSize: "10px",
									background: "var(--soft-teal)",
									color: "var(--teal)",
									fontWeight: 700
								},
								children: [r.hoursLogged || 8, " hrs"]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { maxWidth: "280px" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: 0,
										fontSize: "12px",
										color: "var(--ink)",
										lineHeight: 1.45,
										whiteSpace: "pre-wrap"
									},
									children: r.tasksSummary || r.summary
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.challenges && r.challenges.toLowerCase() !== "none" && r.challenges.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									background: "#fef3e2",
									color: "#b45309",
									padding: "2px 8px",
									borderRadius: "4px",
									fontSize: "11px",
									fontWeight: 600,
									display: "inline-block"
								},
								children: r.challenges
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "11px"
								},
								children: "None reported"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									maxWidth: "200px",
									fontSize: "11.5px",
									color: "var(--ink)"
								},
								children: r.tomorrowPlan || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { textAlign: "right" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "icon-button",
									onClick: () => handleDeleteDailyReport(r.id || r._id),
									title: "Delete Report Record",
									style: {
										color: "var(--coral)",
										background: "rgba(220, 38, 38, 0.08)",
										borderRadius: "6px",
										padding: "4px 8px",
										border: 0,
										cursor: "pointer",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px",
										fontSize: "11px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
								})
							})
						] }, r.id || r._id || idx)) })]
					})
				})]
			}),
			activeTab === "expenses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					style: {
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Reimbursements Queue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Expense Claims for Audit & Approval" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "10px",
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { position: "relative" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								size: 13,
								style: {
									position: "absolute",
									left: "10px",
									top: "9px",
									color: "var(--muted)"
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								className: "text-input",
								placeholder: "Search employee, merchant...",
								value: searchTerm,
								onChange: (e) => setSearchTerm(e.target.value),
								style: {
									width: "190px",
									paddingLeft: "28px",
									fontSize: "11.5px",
									height: "32px"
								}
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								gap: "4px",
								background: "#f1f5f9",
								padding: "3px",
								borderRadius: "8px"
							},
							children: [
								{
									key: "all",
									label: "All"
								},
								{
									key: "submitted",
									label: "Pending"
								},
								{
									key: "approved",
									label: "Approved"
								},
								{
									key: "rejected",
									label: "Rejected"
								}
							].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setExpenseFilter(tab.key),
								style: {
									padding: "4px 10px",
									fontSize: "11px",
									fontWeight: 600,
									borderRadius: "6px",
									border: 0,
									cursor: "pointer",
									background: expenseFilter === tab.key ? "#fff" : "transparent",
									color: expenseFilter === tab.key ? "var(--teal)" : "var(--muted)",
									boxShadow: expenseFilter === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
								},
								children: tab.label
							}, tab.key))
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "16px",
						overflowX: "auto"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Merchant" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Amount" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Justification / Notes" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Proof / Receipt" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "right" },
								children: "Review Actions"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredExpenses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							colSpan: 9,
							style: {
								textAlign: "center",
								padding: "36px",
								color: "var(--muted)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {
									size: 28,
									style: {
										opacity: .4,
										margin: "0 auto 8px",
										display: "block"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "13px",
										display: "block",
										color: "var(--ink)"
									},
									children: "No expense claims found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { fontSize: "11.5px" },
									children: "Submitted employee claims will appear here for audit."
								})
							]
						}) }) : filteredExpenses.map((e, idx) => {
							const s = (e.status || "submitted").toLowerCase();
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										color: "var(--ink)",
										display: "block"
									},
									children: e.employeeName || "Employee"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10.5px",
										color: "var(--muted)"
									},
									children: e.employeeId
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.date ? new Date(e.date).toLocaleDateString() : "Recent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "role-badge",
									style: { fontSize: "9.5px" },
									children: e.category || "General"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "var(--ink)" },
									children: e.merchant || "—"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "13px",
										color: "var(--teal)"
									},
									children: formatINR(e.amount)
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									style: {
										maxWidth: "200px",
										fontSize: "11.5px",
										color: "var(--ink)"
									},
									title: e.comments || e.notes,
									children: [e.comments || e.notes || "—", e.rejectionReason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											display: "block",
											color: "#dc2626",
											fontSize: "10px",
											marginTop: "2px"
										},
										children: ["Reason: ", e.rejectionReason]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.attachmentUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setViewingReceiptModal(e),
									style: {
										display: "inline-flex",
										alignItems: "center",
										gap: "4px",
										padding: "3px 8px",
										borderRadius: "6px",
										background: "#eaf4f1",
										border: "1px solid #c7ded7",
										color: "var(--teal)",
										fontSize: "11px",
										fontWeight: 600,
										cursor: "pointer"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View Proof" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										color: "var(--muted)"
									},
									children: "No proof"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										textTransform: "uppercase",
										padding: "2px 7px",
										borderRadius: "4px",
										background: s === "approved" || s === "reimbursed" ? "#eaf4f1" : s === "rejected" ? "#fdf2f2" : "#fef3e2",
										color: s === "approved" || s === "reimbursed" ? "var(--teal)" : s === "rejected" ? "#dc2626" : "#b45309"
									},
									children: s === "submitted" ? "pending review" : s
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: { textAlign: "right" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [s === "submitted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "ui-button primary",
											onClick: action(async () => {
												await hrStore.approveExpense(e.id);
												showNotice(`Approved claim for ${e.employeeName} (${formatINR(e.amount)})`);
											}),
											style: {
												padding: "3px 8px",
												fontSize: "11px",
												height: "26px"
											},
											children: "Approve"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "ui-button secondary",
											onClick: action(async () => {
												const reason = globalThis.prompt("Reason for rejecting this claim:");
												if (reason?.trim()) {
													await hrStore.rejectExpense(e.id, void 0, reason.trim());
													showNotice(`Rejected claim for ${e.employeeName}`);
												}
											}),
											style: {
												padding: "3px 8px",
												fontSize: "11px",
												height: "26px"
											},
											children: "Reject"
										})] }), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "icon-button",
											onClick: () => handleDeleteExpense(e.id),
											title: "Delete Expense Record (Admin Only)",
											style: {
												color: "var(--coral)",
												background: "rgba(220, 38, 38, 0.08)",
												borderRadius: "6px",
												padding: "4px 7px",
												border: 0,
												cursor: "pointer",
												display: "inline-flex",
												alignItems: "center",
												gap: "3px",
												fontSize: "11px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
										})]
									})
								})
							] }, e.id || idx);
						}) })]
					})
				})]
			}),
			viewingReceiptModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setViewingReceiptModal(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: {
						maxWidth: "640px",
						width: "92%"
					},
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-header-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "modal-title-group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "modal-icon-badge",
									style: {
										background: "#eaf4f1",
										color: "var(--teal)"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 20 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "modal-title-text",
									children: ["Proof of Expense: ", viewingReceiptModal.merchant || viewingReceiptModal.category]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "modal-subtitle-text",
									children: [
										"Claimed by ",
										viewingReceiptModal.employeeName,
										" (",
										viewingReceiptModal.employeeId,
										") • ",
										formatINR(viewingReceiptModal.amount)
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setViewingReceiptModal(null),
								"aria-label": "Close modal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							style: {
								maxHeight: "70vh",
								overflowY: "auto"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "12px",
										background: "#f8fafc",
										padding: "10px 14px",
										borderRadius: "8px",
										fontSize: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "File: " }),
										" ",
										viewingReceiptModal.attachmentName || "Receipt Document",
										viewingReceiptModal.attachmentSize && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												color: "var(--muted)",
												marginLeft: "6px"
											},
											children: [
												"(",
												viewingReceiptModal.attachmentSize,
												")"
											]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: viewingReceiptModal.attachmentUrl,
										download: viewingReceiptModal.attachmentName || "expense_receipt",
										target: "_blank",
										rel: "noreferrer",
										className: "ui-button secondary",
										style: {
											padding: "4px 10px",
											fontSize: "11.5px",
											height: "28px",
											textDecoration: "none"
										},
										children: "Open Full Size"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										textAlign: "center",
										background: "#f1f5f9",
										borderRadius: "8px",
										padding: "12px",
										minHeight: "200px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center"
									},
									children: viewingReceiptModal.attachmentType?.includes("pdf") || viewingReceiptModal.attachmentUrl?.startsWith("data:application/pdf") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
										src: viewingReceiptModal.attachmentUrl,
										title: "Receipt PDF",
										style: {
											width: "100%",
											height: "480px",
											border: 0,
											borderRadius: "6px"
										}
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: viewingReceiptModal.attachmentUrl,
										alt: "Expense Proof",
										style: {
											maxWidth: "100%",
											maxHeight: "480px",
											objectFit: "contain",
											borderRadius: "6px",
											boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
										}
									})
								}),
								viewingReceiptModal.comments && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: "14px",
										padding: "10px 12px",
										background: "#fff",
										border: "1px solid var(--line)",
										borderRadius: "8px",
										fontSize: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											color: "var(--muted)",
											fontSize: "10.5px",
											textTransform: "uppercase",
											marginBottom: "4px"
										},
										children: "Justification / Notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: viewingReceiptModal.comments || viewingReceiptModal.notes })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "modal-footer-premium",
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "8px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: () => setViewingReceiptModal(null),
								children: "Close"
							})
						})
					]
				})
			})
		]
	});
}
function WorkspaceNotifications() {
	const state = useWorkspaceState();
	const { user } = useAuth();
	const notifications = hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : state.notifications ?? [];
	const [filterType, setFilterType] = (0, import_react.useState)("all");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [feedback, setFeedback] = (0, import_react.useState)("");
	const portal = user?.role === "admin" ? "admin" : user?.role === "hr" ? "hr" : "employee";
	const showNotice = (msg) => {
		setFeedback(msg);
		setTimeout(() => setFeedback(""), 3500);
	};
	const unreadCount = notifications.filter((n) => !n.read).length;
	const announcementCount = notifications.filter((n) => n.type === "announcement").length;
	const salaryCount = notifications.filter((n) => n.type === "salary").length;
	const approvalCount = notifications.filter((n) => n.type === "onboarding" || n.type === "onboarding_submitted" || n.type === "onboarding_verified").length;
	const leaveCount = notifications.filter((n) => n.type === "leave" || n.type === "leave_hr").length;
	const expenseCount = notifications.filter((n) => n.type === "expense" || n.type === "expenses").length;
	const ticketCount = notifications.filter((n) => n.type === "ticket" || n.type === "tickets" || n.type === "helpdesk").length;
	const filtered = notifications.filter((n) => {
		if (filterType === "unread" && n.read) return false;
		if (filterType === "announcement" && n.type !== "announcement") return false;
		if (filterType === "salary" && n.type !== "salary") return false;
		if (filterType === "approval" && ![
			"onboarding",
			"onboarding_submitted",
			"onboarding_verified"
		].includes(n.type)) return false;
		if (filterType === "leave" && n.type !== "leave" && n.type !== "leave_hr") return false;
		if (filterType === "expense" && n.type !== "expense" && n.type !== "expenses") return false;
		if (filterType === "ticket" && n.type !== "ticket" && n.type !== "tickets" && n.type !== "helpdesk") return false;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			return n.title && n.title.toLowerCase().includes(q) || n.message && n.message.toLowerCase().includes(q);
		}
		return true;
	});
	const getTargetUrl = (n) => {
		if (!n) return null;
		const direct = n.link || n.url || n.path || n.route || n.targetUrl || n.target;
		if (direct && typeof direct === "string") {
			if (direct.startsWith("#")) return direct;
			if (direct.startsWith("/")) return `#${direct}`;
			return `#/${direct}`;
		}
		const type = (n.type || "").toLowerCase();
		const text = `${type} ${(n.title || "").toLowerCase()} ${(n.message || "").toLowerCase()}`;
		if (type === "salary" || text.includes("salary") || text.includes("payslip") || text.includes("payroll") || text.includes("disbursement")) return portal === "employee" ? "#/employee/salary" : `#/${portal}/payroll`;
		if (portal === "employee" && (type === "team_leave" || text.includes("team lead leave") || text.includes("manager approval") || text.includes("approval request") || n.metadata?.type === "approval_request")) return "#/employee/team-leave";
		if (type === "leave" || type === "leave_hr" || text.includes("leave") || text.includes("vacation")) return `#/${portal}/leave`;
		if (type === "attendance" || text.includes("attendance") || text.includes("punch") || text.includes("clock-in") || text.includes("geofence")) return `#/${portal}/attendance`;
		if (text.includes("daily report") || text.includes("standup")) return portal === "employee" ? "#/employee/daily-report" : portal === "admin" ? "#/admin/reports" : "#/hr/reports";
		if (type === "task" || type === "tasks" || text.includes("task")) return `#/${portal}/tasks`;
		if (type === "announcement" || text.includes("announcement")) return `#/${portal}/announcements`;
		if (type === "ticket" || type === "tickets" || type === "helpdesk" || text.includes("ticket") || text.includes("support ticket")) return `#/${portal}/helpdesk`;
		if (type === "expense" || type === "expenses" || text.includes("expense")) return portal === "employee" ? "#/employee/expenses" : portal === "admin" ? "#/admin/reports" : "#/hr/reports";
		if (type === "training" || type === "learning" || type === "course" || text.includes("training") || text.includes("certificate")) return portal === "employee" ? "#/employee/training" : `#/${portal}/learning`;
		if (type === "performance" || text.includes("performance") || text.includes("appraisal")) return `#/${portal}/performance`;
		if (type.startsWith("onboarding") || text.includes("onboarding")) return portal === "employee" ? "#/employee/profile" : `#/${portal}/people`;
		if (type === "document" || type === "policy" || text.includes("policy") || text.includes("nda")) return `#/${portal}/policies`;
		if (type === "holiday" || text.includes("holiday")) return `#/${portal}/holidays`;
		if (type === "user" || type === "users" || text.includes("credential")) return portal === "employee" ? "#/employee/profile" : `#/${portal}/users`;
		return `#/${portal}/notifications`;
	};
	const getNotificationIcon = (type) => {
		switch (type) {
			case "salary": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, {
				size: 18,
				style: { color: "#0284c7" }
			});
			case "announcement": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, {
				size: 18,
				style: { color: "#ea580c" }
			});
			case "onboarding":
			case "onboarding_submitted":
			case "onboarding_verified": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
				size: 18,
				style: { color: "#16a34a" }
			});
			case "leave":
			case "leave_hr": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
				size: 18,
				style: { color: "#9333ea" }
			});
			case "expense":
			case "expenses": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {
				size: 18,
				style: { color: "#d97706" }
			});
			case "ticket":
			case "tickets":
			case "helpdesk": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeBuoy, {
				size: 18,
				style: { color: "#4f46e5" }
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
				size: 18,
				style: { color: "var(--teal)" }
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "20px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Communication Center",
				title: "Notifications & System Alerts",
				description: "Stay updated with official broadcasts, salary disbursements, leave requests, document approvals, expense claims, and support tickets.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						onClick: action(async () => {
							try {
								await apiClient.patch("/notifications/read-all", {});
							} catch {}
							hrStore.markAllNotificationsRead();
							showNotice("All notifications marked as read.");
						}),
						disabled: unreadCount === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 14 }), " Mark all read"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "danger",
						onClick: action(async () => {
							if (window.confirm("Are you sure you want to clear all notifications?")) {
								try {
									await apiClient.delete("/notifications/clear-all");
								} catch {}
								hrStore.clearAllNotifications();
								showNotice("All notifications cleared.");
							}
						}),
						disabled: notifications.length === 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 14 }), " Clear All"]
					})]
				})
			}),
			feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					padding: "10px 14px",
					background: "#ecfdf5",
					color: "#047857",
					border: "1px solid #a7f3d0",
					borderRadius: "8px",
					fontSize: "12px",
					fontWeight: 600
				},
				children: feedback
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				style: {
					padding: "14px 18px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						gap: "6px",
						flexWrap: "wrap"
					},
					children: [
						{
							key: "all",
							label: `All (${notifications.length})`
						},
						{
							key: "unread",
							label: `Unread (${unreadCount})`
						},
						{
							key: "expense",
							label: `Expense Claims (${expenseCount})`
						},
						{
							key: "ticket",
							label: `Help Desk (${ticketCount})`
						},
						{
							key: "announcement",
							label: `Announcements (${announcementCount})`
						},
						{
							key: "salary",
							label: `Salary & Payroll (${salaryCount})`
						},
						{
							key: "approval",
							label: `Approvals (${approvalCount})`
						},
						{
							key: "leave",
							label: `Leave (${leaveCount})`
						}
					].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilterType(tab.key),
						style: {
							padding: "6px 12px",
							fontSize: "11px",
							fontWeight: filterType === tab.key ? 700 : 500,
							borderRadius: "6px",
							border: 0,
							background: filterType === tab.key ? "var(--teal)" : "#f1f5f9",
							color: filterType === tab.key ? "#fff" : "#475569",
							cursor: "pointer"
						},
						children: tab.label
					}, tab.key))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						position: "relative",
						width: "min(100%, 260px)"
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
						placeholder: "Search alerts & updates...",
						value: searchQuery,
						onChange: (e) => setSearchQuery(e.target.value),
						style: {
							width: "100%",
							padding: "6px 10px 6px 30px",
							fontSize: "11px",
							border: "1px solid var(--border)",
							borderRadius: "6px"
						}
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gap: "10px"
				},
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						textAlign: "center",
						padding: "48px 20px",
						background: "#ffffff",
						border: "1px dashed var(--line)",
						borderRadius: "12px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
							size: 40,
							style: {
								color: "var(--muted)",
								margin: "0 auto 12px",
								opacity: .6
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 6px",
								fontSize: "15px",
								color: "#0f172a"
							},
							children: "No notifications found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: 0,
								fontSize: "12px",
								color: "#64748b"
							},
							children: searchQuery ? "No alerts matched your search query." : "You have no notifications in this category."
						})
					]
				}) : filtered.map((item) => {
					const targetUrl = getTargetUrl(item);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between",
							padding: "14px 18px",
							background: item.read ? "#ffffff" : "#f0fdf4",
							border: item.read ? "1px solid var(--line)" : "1px solid #bbf7d0",
							borderRadius: "10px",
							gap: "14px",
							transition: "all 0.15s ease",
							boxShadow: item.read ? "none" : "0 1px 4px rgba(22, 163, 74, 0.06)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "flex-start",
								gap: "14px",
								flex: 1
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									width: "36px",
									height: "36px",
									borderRadius: "50%",
									background: item.read ? "#f8fafc" : "#ffffff",
									border: "1px solid #e2e8f0",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
									marginTop: "2px"
								},
								children: getNotificationIcon(item.type)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: { flex: 1 },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px",
											flexWrap: "wrap"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: {
													fontSize: "13px",
													color: "#0f172a"
												},
												children: item.title
											}),
											!item.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													background: "#16a34a",
													color: "#fff",
													fontSize: "9px",
													fontWeight: 700,
													padding: "1px 6px",
													borderRadius: "10px"
												},
												children: "NEW"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "11px",
													color: "var(--muted)",
													marginLeft: "auto"
												},
												children: item.time
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: {
											margin: "4px 0 0",
											fontSize: "12px",
											color: "#334155",
											lineHeight: 1.45
										},
										children: item.message
									}),
									targetUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: { marginTop: "8px" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: targetUrl,
											onClick: action(() => hrStore.markNotificationRead(item.id)),
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: "4px",
												fontSize: "11px",
												fontWeight: 600,
												color: "var(--teal)",
												textDecoration: "none"
											},
											children: ["View Related Record ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 11 })]
										})
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: action(() => {
									hrStore.toggleNotificationRead(item.id);
									showNotice(item.read ? "Marked alert as unread." : "Marked alert as read.");
								}),
								style: {
									background: "#f1f5f9",
									border: "1px solid #cbd5e1",
									borderRadius: "6px",
									padding: "5px 10px",
									fontSize: "10px",
									fontWeight: 600,
									color: "#475569",
									cursor: "pointer",
									whiteSpace: "nowrap"
								},
								children: item.read ? "Mark Unread" : "Mark Read"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								title: "Delete alert",
								onClick: action(() => {
									hrStore.deleteNotification(item.id);
									showNotice("Notification removed.");
								}),
								style: {
									background: "transparent",
									border: 0,
									color: "#94a3b8",
									cursor: "pointer",
									padding: "4px",
									borderRadius: "4px"
								},
								onMouseEnter: (e) => e.currentTarget.style.color = "#ef4444",
								onMouseLeave: (e) => e.currentTarget.style.color = "#94a3b8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 14 })
							})]
						})]
					}, item.id);
				})
			})
		]
	});
}
// src/components/CompanyPoliciesView.jsx
function CompanyPoliciesView({ employee: propEmployee, isEmbedded = false, onConsentUpdated }) {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [activePdfModal, setActivePdfModal] = (0, import_react.useState)(null);
	const [agreeingState, setAgreeingState] = (0, import_react.useState)({});
	const [agreeAllModal, setAgreeAllModal] = (0, import_react.useState)(false);
	const [feedback, setFeedback] = (0, import_react.useState)("");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [selectedCategory, setSelectedCategory] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => hrStore.subscribe(setStoreState), []);
	const currentEmployee = propEmployee ? storeState.employees?.find((e) => e.id === propEmployee.id || e._id === propEmployee.id || e.employeeId === propEmployee.employeeId) || propEmployee : storeState.employees?.find((e) => e.id === user?.id || e._id === user?.id || e.employeeId === user?.employeeId || user?.email && e.email && e.email.toLowerCase() === user.email.toLowerCase()) || user;
	[
		"admin",
		"hr",
		"superadmin"
	].includes(String(user?.role || "").toLowerCase().trim());
	const isViewingSelf = Boolean(!propEmployee || currentEmployee?.id === user?.id || currentEmployee?._id === user?.id || currentEmployee?.employeeId === user?.employeeId || user?.email && currentEmployee?.email && user.email.toLowerCase() === currentEmployee.email.toLowerCase());
	const validKeys = COMPANY_POLICIES.map((p) => p.key || p.id);
	const rawConsents = currentEmployee?.policyConsents || currentEmployee?.onboardingDocs?.policyConsents || {};
	const consents = Object.fromEntries(Object.entries(rawConsents).filter(([k]) => validKeys.includes(k)));
	const totalPolicies = COMPANY_POLICIES.length;
	const consentedCount = COMPANY_POLICIES.filter((p) => consents[p.key]?.consented || consents[p.id]?.consented).length;
	const allConsented = consentedCount === totalPolicies;
	const handleSingleConsent = async (policy) => {
		const policyKey = policy.key || policy.id;
		setAgreeingState((prev) => ({
			...prev,
			[policyKey]: true
		}));
		try {
			const now = /* @__PURE__ */ new Date();
			const formatted = now.toLocaleString("en-IN", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: true
			});
			const consentPayload = {
				policyTitle: policy.title,
				policyFileName: policy.fileName,
				consentedAt: now.toISOString(),
				consentedDateFormatted: formatted,
				consentedBy: currentEmployee?.name || user?.displayName || "Employee",
				employeeId: currentEmployee?.employeeId || user?.employeeId
			};
			if (hrStore.savePolicyConsent) await hrStore.savePolicyConsent(currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId, policyKey, consentPayload);
			else {
				const updated = {
					...consents,
					[policyKey]: {
						consented: true,
						...consentPayload
					}
				};
				await hrStore.updateEmployee(currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId, { policyConsents: updated });
			}
			setFeedback(`Successfully recorded your digital consent for "${policy.title}" with timestamp: ${formatted}`);
			setTimeout(() => setFeedback(""), 6e3);
			if (onConsentUpdated) onConsentUpdated();
		} catch (err) {
			console.error("Failed to save policy consent:", err);
			alert("Failed to record policy consent. Please try again.");
		} finally {
			setAgreeingState((prev) => ({
				...prev,
				[policyKey]: false
			}));
		}
	};
	const handleConsentAll = async () => {
		setAgreeingState((prev) => ({
			...prev,
			all: true
		}));
		try {
			const now = /* @__PURE__ */ new Date();
			const formatted = now.toLocaleString("en-IN", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: true
			});
			if (hrStore.saveAllPolicyConsents) await hrStore.saveAllPolicyConsents(currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId, COMPANY_POLICIES, { consentedDateFormatted: formatted });
			else {
				const bulk = { ...consents };
				COMPANY_POLICIES.forEach((p) => {
					bulk[p.key || p.id] = {
						consented: true,
						consentedAt: now.toISOString(),
						consentedDateFormatted: formatted,
						consentedBy: currentEmployee?.name || user?.displayName || "Employee",
						employeeId: currentEmployee?.employeeId || user?.employeeId,
						policyTitle: p.title,
						policyFileName: p.fileName
					};
				});
				await hrStore.updateEmployee(currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId, { policyConsents: bulk });
			}
			setAgreeAllModal(false);
			setFeedback(`All ${totalPolicies} company policies acknowledged and signed with timestamp: ${formatted}`);
			setTimeout(() => setFeedback(""), 6e3);
			if (onConsentUpdated) onConsentUpdated();
		} catch (err) {
			console.error("Failed to sign all policies:", err);
			alert("Failed to record consents. Please try again.");
		} finally {
			setAgreeingState((prev) => ({
				...prev,
				all: false
			}));
		}
	};
	const filteredPolicies = COMPANY_POLICIES.filter((p) => {
		const matchCat = selectedCategory === "all" || p.category === selectedCategory;
		const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase());
		return matchCat && matchSearch;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "20px"
		},
		children: [
			!isEmbedded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "24px",
					borderRadius: "14px",
					background: "linear-gradient(135deg, #0A2E33 0%, #004D50 100%)",
					color: "#ffffff",
					boxShadow: "0 10px 25px rgba(10, 46, 51, 0.15)",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							background: "rgba(255,255,255,0.15)",
							padding: "4px 10px",
							borderRadius: "12px",
							fontSize: "11px",
							fontWeight: 600,
							marginBottom: "8px",
							letterSpacing: "0.5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 13 }), " OFFICIAL COMPLIANCE REPOSITORY"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: "0 0 6px",
							fontSize: "22px",
							fontWeight: 700,
							color: "#ffffff"
						},
						children: "Company Policies & Mandatory Employee Consent"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "13px",
							color: "#c5e2e4",
							maxWidth: "680px",
							lineHeight: 1.5
						},
						children: "All employees are required to review each official company policy document and record their digital acknowledgment with verified date and time."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-end",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "rgba(255,255,255,0.12)",
							padding: "10px 16px",
							borderRadius: "10px",
							textAlign: "right",
							border: "1px solid rgba(255,255,255,0.2)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								color: "#b2d9dc",
								textTransform: "uppercase",
								letterSpacing: "0.5px",
								fontWeight: 600
							},
							children: "Compliance Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "18px",
								fontWeight: 700,
								color: allConsented ? "#86efac" : "#fde047",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								justifyContent: "flex-end"
							},
							children: [
								allConsented ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 18 }),
								consentedCount,
								" of ",
								totalPolicies,
								" Acknowledged"
							]
						})]
					}), isViewingSelf && !allConsented && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ui-button primary",
						onClick: () => setAgreeAllModal(true),
						style: {
							background: "#059669",
							borderColor: "#059669",
							color: "#ffffff",
							fontWeight: 600,
							fontSize: "12px",
							padding: "6px 14px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { size: 14 }), " Sign & Consent to All"]
					})]
				})]
			}),
			isEmbedded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "16px 20px",
					borderRadius: "12px",
					background: allConsented ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
					border: allConsented ? "1px solid #86efac" : "1px solid #cbd5e1",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px",
						marginBottom: "4px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							fontWeight: 700,
							padding: "3px 10px",
							borderRadius: "12px",
							background: allConsented ? "#15803d" : "#0284c7",
							color: "#ffffff",
							display: "inline-flex",
							alignItems: "center",
							gap: "4px"
						},
						children: [allConsented ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 12 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 12 }), allConsented ? "100% POLICIES ACKNOWLEDGED" : "MANDATORY ONBOARDING COMPLIANCE"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "12px",
							color: "#475569",
							fontWeight: 600
						},
						children: [
							consentedCount,
							" / ",
							totalPolicies,
							" Consented"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: 0,
						fontSize: "12px",
						color: "#64748b"
					},
					children: "During onboarding, review each official PDF policy below and confirm your digital acceptance. Each consent is saved with your identity and exact timestamp."
				})] }), isViewingSelf && !allConsented && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => setAgreeAllModal(true),
					style: {
						background: "var(--teal)",
						borderColor: "var(--teal)",
						color: "#ffffff",
						fontWeight: 600,
						fontSize: "12px",
						padding: "6px 14px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { size: 14 }), " Sign & Consent to All"]
				})]
			}),
			feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "12px 16px",
					background: "#ecfdf5",
					color: "#065f46",
					border: "1px solid #a7f3d0",
					borderRadius: "10px",
					fontSize: "12px",
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					size: 16,
					style: {
						color: "#059669",
						flexShrink: 0
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: feedback })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: "12px",
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						gap: "10px",
						alignItems: "center",
						flex: 1,
						minWidth: "240px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							position: "relative",
							width: "100%",
							maxWidth: "340px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							size: 14,
							style: {
								position: "absolute",
								left: "10px",
								top: "50%",
								transform: "translateY(-50%)",
								color: "#94a3b8"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							className: "ui-input",
							placeholder: "Search policies by title or description...",
							value: searchTerm,
							onChange: (e) => setSearchTerm(e.target.value),
							style: {
								width: "100%",
								paddingLeft: "32px",
								fontSize: "12px"
							}
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: "12px",
						color: "#64748b"
					},
					children: [
						"Showing ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: filteredPolicies.length }),
						" official company policies"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
					gap: "16px"
				},
				children: filteredPolicies.map((policy) => {
					const policyKey = policy.key || policy.id;
					const consent = consents[policyKey] || consents[policy.id] || {};
					const hasConsented = Boolean(consent?.consented);
					const isAgreeing = Boolean(agreeingState[policyKey]);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: {
							padding: "20px",
							borderRadius: "12px",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							gap: "16px",
							border: hasConsented ? "1px solid #86efac" : "1px solid #cbd5e1",
							background: hasConsented ? "#fbfdfb" : "#ffffff",
							boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
							transition: "all 0.2s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									gap: "8px",
									marginBottom: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										padding: "2px 8px",
										borderRadius: "6px",
										background: "#fee2e2",
										color: "#b91c1c",
										letterSpacing: "0.4px"
									},
									children: [
										policy.fileType,
										" • ",
										policy.sizeLabel
									]
								}), hasConsented ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										padding: "3px 8px",
										borderRadius: "6px",
										background: "#dcfce7",
										color: "#15803d",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 11 }), " CONSENT RECORDED"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										padding: "3px 8px",
										borderRadius: "6px",
										background: "#fef3c7",
										color: "#b45309",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 11 }), " PENDING CONSENT"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								style: {
									margin: "0 0 8px",
									fontSize: "15px",
									fontWeight: 700,
									color: "#0f172a",
									display: "flex",
									alignItems: "flex-start",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
									size: 18,
									style: {
										color: hasConsented ? "#16a34a" : "var(--teal)",
										flexShrink: 0,
										marginTop: "2px"
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: policy.title })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: "0 0 12px",
									fontSize: "12px",
									color: "#64748b",
									lineHeight: 1.5
								},
								children: policy.description
							}),
							hasConsented ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "10px 12px",
									background: "#f0fdf4",
									border: "1px solid #bbf7d0",
									borderRadius: "8px",
									fontSize: "11px",
									color: "#166534",
									display: "grid",
									gap: "4px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											fontWeight: 700
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
											size: 13,
											style: { color: "#16a34a" }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Legally Acknowledged & Accepted" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											color: "#15803d"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Timestamp: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: consent.consentedDateFormatted || new Date(consent.consentedAt).toLocaleString() })] })]
									}),
									consent.consentedBy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "10.5px",
											color: "#166534"
										},
										children: [
											"Signed By: ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: consent.consentedBy }),
											" ",
											consent.employeeId ? `(${consent.employeeId})` : ""
										]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "10px 12px",
									background: "#fffbeb",
									border: "1px solid #fde68a",
									borderRadius: "8px",
									fontSize: "11px",
									color: "#92400e",
									display: "flex",
									alignItems: "center",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
									size: 13,
									style: {
										color: "#d97706",
										flexShrink: 0
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Please read the PDF document in full before giving your digital consent." })]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gap: "8px",
								paddingTop: "10px",
								borderTop: "1px solid #f1f5f9"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									gap: "8px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setActivePdfModal(policy),
									className: "ui-button secondary",
									style: {
										flex: 1,
										fontSize: "11.5px",
										padding: "8px 12px",
										justifyContent: "center",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 13 }), " Read Official Policy"]
								})
							}), isViewingSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: hasConsented ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									width: "100%",
									padding: "7px 12px",
									background: "#f8fafc",
									border: "1px solid #e2e8f0",
									borderRadius: "6px",
									fontSize: "11px",
									color: "#64748b",
									textAlign: "center",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 12 }), " Consent Locked & Verified"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleSingleConsent(policy),
								disabled: isAgreeing,
								className: "ui-button primary",
								style: {
									width: "100%",
									fontSize: "12px",
									padding: "8px 14px",
									justifyContent: "center",
									background: "var(--teal)",
									borderColor: "var(--teal)",
									color: "#ffffff",
									fontWeight: 600,
									display: "inline-flex",
									alignItems: "center",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 14 }), isAgreeing ? "Saving Consent..." : "I Agree & Consent to this Policy"]
							}) })]
						})]
					}, policy.id);
				})
			}),
			activePdfModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					zIndex: 100010,
					background: "rgba(15, 23, 42, 0.85)",
					backdropFilter: "blur(4px)",
					display: "grid",
					placeItems: "center",
					padding: "20px"
				},
				onClick: () => setActivePdfModal(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						width: "94%",
						maxWidth: "960px",
						height: "90vh",
						display: "flex",
						flexDirection: "column",
						background: "#ffffff",
						borderRadius: "14px",
						overflow: "hidden",
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)"
					},
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "14px 20px",
								background: "#0f172a",
								color: "#ffffff",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
									size: 20,
									style: { color: "#38bdf8" }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: 0,
										fontSize: "15px",
										fontWeight: 700,
										color: "#ffffff"
									},
									children: activePdfModal.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "11px",
										color: "#94a3b8"
									},
									children: [
										activePdfModal.fileName,
										" • ",
										activePdfModal.sizeLabel
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setActivePdfModal(null),
									className: "icon-button",
									style: {
										background: "rgba(255,255,255,0.15)",
										border: "none",
										color: "#ffffff",
										borderRadius: "8px",
										cursor: "pointer",
										padding: "6px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								flex: 1,
								background: "#525659",
								position: "relative"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								src: `${activePdfModal.downloadUrl}#toolbar=0&navpanes=0`,
								title: activePdfModal.title,
								style: {
									width: "100%",
									height: "100%",
									border: "none"
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "12px 20px",
								background: "#f8fafc",
								borderTop: "1px solid #e2e8f0",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								flexWrap: "wrap",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "12px",
									color: "#64748b"
								},
								children: consents[activePdfModal.key || activePdfModal.id]?.consented ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										color: "#15803d",
										fontWeight: 600,
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }),
										" Acknowledged on ",
										consents[activePdfModal.key || activePdfModal.id]?.consentedDateFormatted
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ensure you have read all pages before acknowledging this policy." })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: () => setActivePdfModal(null),
									children: "Close Viewer"
								}), isViewingSelf && !consents[activePdfModal.key || activePdfModal.id]?.consented && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button primary",
									style: {
										background: "var(--teal)",
										borderColor: "var(--teal)",
										color: "#fff",
										fontWeight: 600
									},
									onClick: () => {
										handleSingleConsent(activePdfModal);
									},
									disabled: agreeingState[activePdfModal.key || activePdfModal.id],
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 14 }), " I Have Read & Agree to this Policy"]
								})]
							})]
						})
					]
				})
			}),
			agreeAllModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					zIndex: 100010,
					background: "rgba(15, 23, 42, 0.75)",
					backdropFilter: "blur(4px)",
					display: "grid",
					placeItems: "center",
					padding: "20px"
				},
				onClick: () => setAgreeAllModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						width: "92%",
						maxWidth: "540px",
						padding: "24px",
						background: "#ffffff",
						borderRadius: "14px",
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
					},
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								marginBottom: "16px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										width: "40px",
										height: "40px",
										borderRadius: "50%",
										background: "#dcfce7",
										color: "#15803d",
										display: "grid",
										placeItems: "center"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { size: 22 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: 0,
										fontSize: "17px",
										fontWeight: 700,
										color: "#0f172a"
									},
									children: "Sign & Acknowledge All Policies"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									style: {
										margin: "2px 0 0",
										fontSize: "12px",
										color: "#64748b"
									},
									children: [
										"Confirm digital acceptance for all ",
										totalPolicies,
										" official Edufyi policies."
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setAgreeAllModal(false),
								style: {
									background: "#f1f5f9",
									border: "1px solid #cbd5e1",
									borderRadius: "8px",
									cursor: "pointer"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#f8fafc",
								border: "1px solid #e2e8f0",
								borderRadius: "8px",
								padding: "12px 14px",
								marginBottom: "16px",
								fontSize: "12px",
								color: "#334155",
								display: "grid",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 600,
									color: "#0f172a"
								},
								children: "Policies covered by this consent:"
							}), COMPANY_POLICIES.map((p, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "6px",
									fontSize: "11.5px",
									color: "#475569"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
									size: 13,
									style: {
										color: "#059669",
										flexShrink: 0
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [idx + 1, "."] }),
									" ",
									p.title
								] })]
							}, p.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								margin: "0 0 20px",
								fontSize: "12px",
								color: "#64748b",
								lineHeight: 1.5
							},
							children: [
								"By confirming, you certify that you have accessed and reviewed each of the 4 official policy documents (Company Policies & Code of Conduct, Attendance Policy, Sales Policy, and Zero Tolerance Policy), and you consent to adhere strictly to all terms and standards. Your full name (",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: currentEmployee?.name || user?.displayName }),
								"), employee ID (",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: currentEmployee?.employeeId || user?.employeeId }),
								"), and the current date and time will be recorded in the official compliance audit log."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: () => setAgreeAllModal(false),
								disabled: agreeingState.all,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ui-button primary",
								style: {
									background: "#059669",
									borderColor: "#059669",
									color: "#ffffff",
									fontWeight: 600
								},
								onClick: handleConsentAll,
								disabled: agreeingState.all,
								children: agreeingState.all ? "Signing Consents..." : "I Agree & Confirm Digital Signature"
							})]
						})
					]
				})
			})
		]
	});
}
// src/utils/attendanceUtils.js
/**
* Utilities for formatting attendance statuses and grace occurrence options
*/
function parseTimeToMinutes(timeStr) {
	if (!timeStr || typeof timeStr !== "string") return null;
	const match = timeStr.trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
	if (!match) return null;
	let hours = parseInt(match[1], 10);
	const minutes = parseInt(match[2], 10);
	const meridiem = match[3]?.toUpperCase();
	if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes < 0 || minutes > 59) return null;
	if (meridiem === "PM" && hours < 12) hours += 12;
	if (meridiem === "AM" && hours === 12) hours = 0;
	if (hours < 0 || hours > 23) return null;
	return hours * 60 + minutes;
}
/**
* Returns clean daily status dynamically evaluated against active shift rules:
* - On-Time (punch in within on-time or grace period)
* - Half Day (worked minimum 4 hrs)
* - Absent (worked less than 4 hrs)
* - Early Logout (worked 6 hr 30 min / early window)
* - Late (punch-in after grace period)
* - On Leave (approved leave)
* - Loss of Pay (explicit LOP)
*/
function getDailyAttendanceStatus(r, attendanceRules = null, allLeaves = []) {
	if (!r || !r.checkIn && r.status !== "on-leave" && r.status !== "holiday") {
		if (r?.status === "on-leave") return {
			label: "On Leave",
			tone: "neutral"
		};
		if (r?.status === "holiday") return {
			label: "Holiday",
			tone: "info"
		};
		return {
			label: "Absent",
			tone: "danger"
		};
	}
	if (r.status === "on-leave") return {
		label: "On Leave",
		tone: "neutral"
	};
	let approvedLeave = r?.approvedLeave;
	if (!approvedLeave && Array.isArray(allLeaves) && allLeaves.length > 0 && r?.employeeId) {
		const empCode = String(r.employeeId).toUpperCase();
		const targetDate = r.date || "";
		const matched = allLeaves.find((l) => {
			if (l.status !== "approved") return false;
			const lEmpCode = String(l.employeeCode || l.employeeId?.employeeId || l.employeeId?._id || l.employeeId || "").toUpperCase();
			const lEmpName = String(l.employeeName || l.employeeId?.name || "").toUpperCase();
			const rEmpName = String(r.employeeName || "").toUpperCase();
			if (!(lEmpCode && lEmpCode === empCode || lEmpName && rEmpName && (lEmpName === rEmpName || lEmpName.includes(rEmpName) || rEmpName.includes(lEmpName)))) return false;
			const s = typeof l.startDate === "string" ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10);
			const e = typeof l.endDate === "string" ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10);
			const inRange = targetDate >= s && targetDate <= e;
			const inBreakdown = Array.isArray(l.dayBreakdown) && l.dayBreakdown.some((d) => d.date === targetDate);
			return inRange || inBreakdown;
		});
		if (matched) approvedLeave = {
			id: matched.id || matched._id,
			leaveType: matched.leaveType,
			isHalfDay: Boolean(matched.isHalfDay || matched.units === .5 || matched.days === .5),
			halfDayPeriod: matched.halfDayPeriod || (matched.isHalfDay ? "first_half" : null),
			isPaid: matched.paidUnits > 0 || matched.leaveType !== "lop" && matched.leaveType !== "double_lop"
		};
	}
	if (!Boolean(approvedLeave && approvedLeave.isHalfDay && approvedLeave.isPaid) && (r.status === "lop" || r.isLop)) return {
		label: "Loss of Pay",
		tone: "danger"
	};
	const occ = r.policyEvaluation?.occurrence || r.policyEvaluation?.punch?.occurrence || r.occurrence;
	const isFirstHalfLeave = r.halfDayPeriod === "first_half" || approvedLeave?.halfDayPeriod === "first_half" || occ === "half_day_leave_on_time";
	const isSecondHalfLeave = r.halfDayPeriod === "second_half" || approvedLeave?.halfDayPeriod === "second_half" || occ === "half_day_leave_checkout";
	const isApprovedHalfDay = isFirstHalfLeave || isSecondHalfLeave || Boolean(approvedLeave?.isHalfDay);
	let isFirstHalfOnTimeArrival = false;
	if (isFirstHalfLeave && r.checkIn) {
		const inM = parseTimeToMinutes(r.checkIn);
		const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660;
		const endM = attendanceRules?.workEndTime ? parseTimeToMinutes(attendanceRules.workEndTime) : 1200;
		const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0 ? Number(attendanceRules.gracePeriodMinutes) : 30;
		const midShiftM = startM + Math.round((endM - startM) / 2);
		if (inM !== null && inM <= midShiftM + grace) isFirstHalfOnTimeArrival = true;
	}
	const isHalfDayOnTime = occ === "half_day_leave_on_time" || isFirstHalfOnTimeArrival || isFirstHalfLeave && (r.isLate === false || r.status === "half-day" || !r.isLate);
	const isHalfDayCheckout = occ === "half_day_leave_checkout" || isSecondHalfLeave && !r.isEarlyLogout;
	let isPunchLate = isHalfDayOnTime ? false : Boolean(r.isLate || r.status === "late");
	let isPunchHalfDay = Boolean(r.isHalfDay || r.status === "half-day" || isApprovedHalfDay);
	if (r.checkIn && !isFirstHalfLeave) {
		const checkInM = parseTimeToMinutes(r.checkIn);
		const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660;
		const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0 ? Number(attendanceRules.gracePeriodMinutes) : 30;
		if (checkInM !== null && startM !== null) {
			isPunchLate = checkInM > startM + grace;
			if (checkInM >= startM + 60) isPunchHalfDay = true;
		}
	}
	let workedHours = null;
	const hasCheckedOut = Boolean(r.checkOut && r.checkOut !== "—" && r.checkOut !== "-" && !String(r.checkOut).includes("Active"));
	if (r.checkIn && hasCheckedOut) {
		const inM = parseTimeToMinutes(r.checkIn);
		const outM = parseTimeToMinutes(r.checkOut);
		if (inM !== null && outM !== null) {
			let diff = outM - inM;
			if (diff < 0) diff += 1440;
			workedHours = Math.max(0, diff - (Number(r.totalBreakMinutes) || 0)) / 60;
		}
	}
	if (hasCheckedOut && workedHours !== null) {
		if (isApprovedHalfDay || isHalfDayCheckout) {
			if (workedHours >= 3.5 || isHalfDayCheckout) return {
				label: "1/2 Day (Approved)",
				tone: "info"
			};
			return {
				label: "Absent",
				tone: "danger"
			};
		}
		if (workedHours < 4) return {
			label: "Absent",
			tone: "danger"
		};
		if (isPunchHalfDay || workedHours < 6.5) return {
			label: "Half Day",
			tone: "warning"
		};
		if (workedHours < 8) return {
			label: "Early Logout",
			tone: "warning"
		};
		return isPunchLate ? {
			label: "Late",
			tone: "warning"
		} : {
			label: "On-Time",
			tone: "info"
		};
	}
	if (r.checkIn) {
		if (isApprovedHalfDay) {
			if (isPunchLate && !isHalfDayOnTime) return {
				label: "Late (2nd Half)",
				tone: "warning"
			};
			return {
				label: "Present (1/2 Day Leave)",
				tone: "info"
			};
		}
		if (isPunchLate) return {
			label: "Late",
			tone: "warning"
		};
		return {
			label: "On-Time",
			tone: "info"
		};
	}
	if (r.status === "absent") return {
		label: "Absent",
		tone: "danger"
	};
	return {
		label: "Absent",
		tone: "danger"
	};
}
/**
* Returns late & early logout occurrence count for the month and corresponding LOP day deduction:
* - Policy: Late Login and Early Logout are combined together
* - Every 3 occurrences (e.g. 2 early logout + 1 late login = 3) = 0.5 LOP day
* - 6 occurrences = 1.0 LOP day
*/
function getLateCountInfo(r, allAttendance = [], targetDate = "", attendanceRules = null, allLeaves = []) {
	if (!r) return {
		count: 0,
		lopDays: 0,
		lateCount: 0,
		earlyLogoutCount: 0,
		isLate: false,
		isEarlyLogout: false
	};
	const empCode = String(r.employeeId || "").toUpperCase();
	const dateStr = r.date || targetDate || "";
	const monthPrefix = dateStr.slice(0, 7);
	const resolveLeaveForRec = (record) => {
		if (record?.approvedLeave) return record.approvedLeave;
		if (!Array.isArray(allLeaves) || allLeaves.length === 0 || !record?.employeeId) return null;
		const code = String(record.employeeId).toUpperCase();
		const recDate = record.date || targetDate || "";
		const matched = allLeaves.find((l) => {
			if (l.status !== "approved") return false;
			const lEmpCode = String(l.employeeCode || l.employeeId?.employeeId || l.employeeId?._id || l.employeeId || "").toUpperCase();
			const lEmpName = String(l.employeeName || l.employeeId?.name || "").toUpperCase();
			const rEmpName = String(record.employeeName || "").toUpperCase();
			if (!(lEmpCode && lEmpCode === code || lEmpName && rEmpName && (lEmpName === rEmpName || lEmpName.includes(rEmpName) || rEmpName.includes(lEmpName)))) return false;
			const s = typeof l.startDate === "string" ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10);
			const e = typeof l.endDate === "string" ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10);
			const inRange = recDate >= s && recDate <= e;
			const inBreakdown = Array.isArray(l.dayBreakdown) && l.dayBreakdown.some((d) => d.date === recDate);
			return inRange || inBreakdown;
		});
		if (matched) return {
			id: matched.id || matched._id,
			leaveType: matched.leaveType,
			isHalfDay: Boolean(matched.isHalfDay || matched.units === .5 || matched.days === .5),
			halfDayPeriod: matched.halfDayPeriod || (matched.isHalfDay ? "first_half" : null),
			isPaid: matched.paidUnits > 0 || matched.leaveType !== "lop" && matched.leaveType !== "double_lop"
		};
		return null;
	};
	const isRecordLate = (record) => {
		const recLeave = resolveLeaveForRec(record);
		const occ = record.policyEvaluation?.occurrence || record.policyEvaluation?.punch?.occurrence || record.occurrence;
		const isFirstHalf = record.halfDayPeriod === "first_half" || recLeave?.halfDayPeriod === "first_half";
		if (occ === "half_day_leave_on_time" || isFirstHalf && !record.isLate) return false;
		if (isFirstHalf) {
			if (record.checkIn) {
				const inM = parseTimeToMinutes(record.checkIn);
				const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660;
				const endM = attendanceRules?.workEndTime ? parseTimeToMinutes(attendanceRules.workEndTime) : 1200;
				const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0 ? Number(attendanceRules.gracePeriodMinutes) : 30;
				const midShiftM = startM + Math.round((endM - startM) / 2);
				if (inM !== null && inM <= midShiftM + grace) return false;
			}
			return Boolean(record.isLate);
		}
		if (record.isLate || record.status === "late") return true;
		if (record.checkIn) {
			const inM = parseTimeToMinutes(record.checkIn);
			const startM = attendanceRules?.workStartTime ? parseTimeToMinutes(attendanceRules.workStartTime) : 660;
			const grace = Number.isFinite(Number(attendanceRules?.gracePeriodMinutes)) && Number(attendanceRules.gracePeriodMinutes) >= 0 ? Number(attendanceRules.gracePeriodMinutes) : 30;
			if (inM !== null && startM !== null) return inM > startM + grace;
		}
		return false;
	};
	const isRecordEarlyLogout = (record) => {
		const recLeave = resolveLeaveForRec(record);
		const occ = record.policyEvaluation?.occurrence || record.policyEvaluation?.checkout?.occurrence || record.occurrence;
		const isSecondHalf = record.halfDayPeriod === "second_half" || recLeave?.halfDayPeriod === "second_half";
		if (occ === "half_day_leave_checkout" || isSecondHalf && !record.isEarlyLogout) return false;
		if (record.isEarlyLogout || record.status === "early-logout") return true;
		if (record.checkIn && record.checkOut && record.checkOut !== "—" && record.checkOut !== "-" && !String(record.checkOut).includes("Active")) {
			const inM = parseTimeToMinutes(record.checkIn);
			const outM = parseTimeToMinutes(record.checkOut);
			if (inM !== null && outM !== null) {
				let diff = outM - inM;
				if (diff < 0) diff += 1440;
				const workedHours = Math.max(0, diff - (Number(record.totalBreakMinutes) || 0)) / 60;
				if (workedHours >= 6.5 && workedHours < 8) return true;
			}
			if (outM !== null && attendanceRules?.workEndTime) {
				const endM = parseTimeToMinutes(attendanceRules.workEndTime);
				if (endM !== null && outM < endM && outM >= endM - 90) return true;
			}
		}
		return false;
	};
	const isCurrentLate = isRecordLate(r);
	const isCurrentEarly = isRecordEarlyLogout(r);
	if (!isCurrentLate && !isCurrentEarly) return {
		count: 0,
		lopDays: 0,
		lateCount: 0,
		earlyLogoutCount: 0,
		isLate: false,
		isEarlyLogout: false
	};
	const empMonthRecords = (allAttendance || []).filter((a) => String(a.employeeId || "").toUpperCase() === empCode && a.date && a.date.startsWith(monthPrefix) && a.date <= dateStr);
	let lateCount = 0;
	let earlyLogoutCount = 0;
	for (const a of empMonthRecords) {
		if (isRecordLate(a)) lateCount++;
		if (isRecordEarlyLogout(a)) earlyLogoutCount++;
	}
	const totalInfractions = lateCount + earlyLogoutCount;
	const lopDays = totalInfractions > 0 ? Math.floor(totalInfractions / 3) * .5 : 0;
	return {
		count: Math.max(1, totalInfractions),
		totalInfractions,
		lateCount,
		earlyLogoutCount,
		lopDays,
		isLate: isCurrentLate,
		isEarlyLogout: isCurrentEarly
	};
}
// src/components/CompanyDocumentsView.jsx
/**
* Company Documents & Compliance / NDA Suite
* Features 2 clear sections:
* 1. Company Documents (MCA, Udyam, Startup India, Incorporation/PAN)
* 2. Compliance & NDA (Download blank template, Sign, Re-upload signed copy)
*/
function CompanyDocumentsView({ employee: propEmployee, user: propUser }) {
	const { user: authUser } = useAuth();
	const user = propUser || authUser;
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [activeSection, setActiveSection] = (0, import_react.useState)("company_docs");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [viewingPdf, setViewingPdf] = (0, import_react.useState)(null);
	const [uploadingKey, setUploadingKey] = (0, import_react.useState)(null);
	const [feedback, setFeedback] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const userRoleNormalized = String(user?.role || "").toLowerCase().trim().replace(/[\s-]+/g, "_");
	const isStaffRole = [
		"hr",
		"admin",
		"superadmin"
	].includes(userRoleNormalized);
	const currentEmployee = propEmployee || storeState.employees.find((emp) => user?.id && (emp.id === user.id || emp._id === user.id || emp.userId === user.id) || user?.employeeId && (emp.employeeId === user.employeeId || emp.id === user.employeeId) || user?.email && emp.email && String(user.email).trim().toLowerCase() === String(emp.email).trim().toLowerCase()) || (!isStaffRole ? storeState.employees[0] : null);
	const canUploadSigned = Boolean(currentEmployee && user && (user.id && (currentEmployee.id === user.id || currentEmployee._id === user.id || currentEmployee.userId === user.id) || user.employeeId && (currentEmployee.employeeId === user.employeeId || currentEmployee.id === user.employeeId) || user.email && currentEmployee.email && String(user.email).trim().toLowerCase() === String(currentEmployee.email).trim().toLowerCase())) || !isStaffRole;
	const complianceDocs = currentEmployee?.complianceDocs || currentEmployee?.onboardingDocs?.complianceDocs || {};
	const totalNdaTemplates = COMPLIANCE_AND_NDA_TEMPLATES.length;
	const uploadedNdaCount = COMPLIANCE_AND_NDA_TEMPLATES.filter((t) => {
		const doc = complianceDocs[t.key];
		return Boolean(doc?.url || doc?.fileName || doc?.status === "submitted");
	}).length;
	const allNdaCompleted = uploadedNdaCount === totalNdaTemplates;
	const handleUploadSignedDoc = async (template, file) => {
		if (!canUploadSigned || !currentEmployee) {
			setFeedback("Only the employee or account owner can upload signed compliance copies.");
			return;
		}
		if (!file) return;
		setUploadingKey(template.key);
		setFeedback("");
		try {
			const fileData = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (e) => resolve({
					name: file.name,
					fileName: file.name,
					url: e.target.result,
					size: (file.size / 1024).toFixed(1) + " KB",
					type: file.type || "application/pdf",
					uploadedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					uploadedDateFormatted: (/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
						day: "2-digit",
						month: "short",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						hour12: true
					})
				});
				reader.onerror = reject;
				reader.readAsDataURL(file);
			});
			const empId = currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId;
			const newDocEntry = {
				...fileData,
				status: "submitted",
				title: template.title,
				templateFileName: template.fileName,
				submittedBy: currentEmployee?.name || user?.displayName || "Employee",
				employeeId: currentEmployee?.employeeId || user?.employeeId
			};
			const updatedComplianceDocs = {
				...complianceDocs,
				[template.key]: newDocEntry
			};
			if (hrStore.updateComplianceDocs) await hrStore.updateComplianceDocs(empId, updatedComplianceDocs);
			else await hrStore.updateEmployee(empId, { complianceDocs: updatedComplianceDocs });
			try {
				await hrStore.addNotification?.({
					id: `notif-compliance-${Date.now()}`,
					recipientRole: "hr",
					recipientId: empId,
					type: "compliance_uploaded",
					title: `Signed Agreement Uploaded: ${template.title}`,
					message: `${currentEmployee?.name || "Employee"} uploaded signed copy of ${template.title}.`,
					time: "Just now",
					read: false
				});
			} catch (notifErr) {
				console.warn("Audit notification skipped:", notifErr);
			}
			setFeedback(`✓ Successfully uploaded signed copy of "${template.title}"!`);
			setTimeout(() => setFeedback(""), 5e3);
		} catch (err) {
			console.error("Failed to upload signed compliance document:", err);
			setFeedback("Failed to upload document. Please try again.");
		} finally {
			setUploadingKey(null);
		}
	};
	const filteredCompanyDocs = OFFICIAL_COMPANY_DOCUMENTS.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
	const filteredNdaTemplates = COMPLIANCE_AND_NDA_TEMPLATES.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "20px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "24px",
					borderRadius: "14px",
					background: "linear-gradient(135deg, #0A2E33 0%, #004D50 100%)",
					color: "#ffffff",
					boxShadow: "0 10px 25px rgba(10, 46, 51, 0.15)",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							background: "rgba(255,255,255,0.15)",
							padding: "4px 10px",
							borderRadius: "12px",
							fontSize: "11px",
							fontWeight: 600,
							marginBottom: "8px",
							letterSpacing: "0.5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingComplex, { size: 13 }), " OFFICIAL CORPORATE REPOSITORY"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: "0 0 6px",
							fontSize: "22px",
							fontWeight: 700,
							color: "#ffffff"
						},
						children: "Company Documents & Compliance / NDA Suite"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "13px",
							color: "#c5e2e4",
							maxWidth: "680px",
							lineHeight: 1.5
						},
						children: "Access official company registration certificates, download mandatory compliance and NDA templates, and upload executed signed copies."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "rgba(255,255,255,0.12)",
						padding: "10px 16px",
						borderRadius: "10px",
						textAlign: "right",
						border: "1px solid rgba(255,255,255,0.2)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "11px",
							color: "#b2d9dc",
							textTransform: "uppercase",
							letterSpacing: "0.5px",
							fontWeight: 600
						},
						children: "Compliance Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: "17px",
							fontWeight: 700,
							color: allNdaCompleted ? "#86efac" : "#fde047",
							display: "flex",
							alignItems: "center",
							gap: "6px",
							justifyContent: "flex-end"
						},
						children: [
							allNdaCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 17 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 17 }),
							uploadedNdaCount,
							" of ",
							totalNdaTemplates,
							" NDA / Compliance Uploaded"
						]
					})]
				})]
			}),
			feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "12px 16px",
					background: "#ecfdf5",
					color: "#065f46",
					border: "1px solid #a7f3d0",
					borderRadius: "10px",
					fontSize: "12px",
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					size: 16,
					style: {
						color: "#059669",
						flexShrink: 0
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: feedback })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "12px",
					borderBottom: "1px solid #e2e8f0",
					paddingBottom: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveSection("company_docs"),
						style: {
							padding: "10px 18px",
							borderRadius: "8px",
							fontSize: "13px",
							fontWeight: 700,
							cursor: "pointer",
							border: activeSection === "company_docs" ? "1px solid var(--teal)" : "1px solid #cbd5e1",
							background: activeSection === "company_docs" ? "var(--teal)" : "#ffffff",
							color: activeSection === "company_docs" ? "#ffffff" : "#334155",
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							boxShadow: activeSection === "company_docs" ? "0 2px 8px rgba(0, 110, 111, 0.25)" : "none",
							transition: "all 0.15s ease"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingComplex, { size: 15 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1. Company Documents" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "10px",
									padding: "2px 6px",
									borderRadius: "10px",
									background: activeSection === "company_docs" ? "rgba(255,255,255,0.25)" : "#e2e8f0",
									color: activeSection === "company_docs" ? "#ffffff" : "#475569"
								},
								children: [OFFICIAL_COMPANY_DOCUMENTS.length, " Official"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveSection("compliance_nda"),
						style: {
							padding: "10px 18px",
							borderRadius: "8px",
							fontSize: "13px",
							fontWeight: 700,
							cursor: "pointer",
							border: activeSection === "compliance_nda" ? "1px solid var(--teal)" : "1px solid #cbd5e1",
							background: activeSection === "compliance_nda" ? "var(--teal)" : "#ffffff",
							color: activeSection === "compliance_nda" ? "#ffffff" : "#334155",
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							boxShadow: activeSection === "compliance_nda" ? "0 2px 8px rgba(0, 110, 111, 0.25)" : "none",
							transition: "all 0.15s ease"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { size: 15 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2. Compliance & NDA" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "10px",
									padding: "2px 6px",
									borderRadius: "10px",
									background: activeSection === "compliance_nda" ? allNdaCompleted ? "#15803d" : "rgba(255,255,255,0.25)" : allNdaCompleted ? "#dcfce7" : "#fee2e2",
									color: activeSection === "compliance_nda" ? "#ffffff" : allNdaCompleted ? "#166534" : "#991b1b"
								},
								children: [
									uploadedNdaCount,
									" / ",
									totalNdaTemplates,
									" Attached"
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						position: "relative",
						width: "260px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
						size: 14,
						style: {
							position: "absolute",
							left: "10px",
							top: "50%",
							transform: "translateY(-50%)",
							color: "#94a3b8"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						className: "ui-input",
						placeholder: "Search documents by name...",
						value: searchTerm,
						onChange: (e) => setSearchTerm(e.target.value),
						style: {
							width: "100%",
							paddingLeft: "32px",
							fontSize: "12px"
						}
					})]
				})]
			}),
			activeSection === "company_docs" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gap: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#f8fafc",
						padding: "14px 18px",
						borderRadius: "10px",
						border: "1px solid #e2e8f0",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: "0 0 4px",
							fontSize: "15px",
							fontWeight: 700,
							color: "#0f172a"
						},
						children: "Official Corporate Registration & Legal Filings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "12px",
							color: "#64748b"
						},
						children: "Statutory registration certificates issued by the Ministry of Corporate Affairs, MSME, Startup India, and Income Tax Department."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							fontWeight: 600,
							color: "var(--teal)",
							background: "#f0fdfa",
							padding: "4px 10px",
							borderRadius: "8px",
							border: "1px solid #ccfbf1"
						},
						children: "Verified Corporate Records"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gap: "16px"
					},
					children: filteredCompanyDocs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: {
							padding: "20px",
							borderRadius: "12px",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							gap: "16px",
							border: "1px solid #cbd5e1",
							background: "#ffffff",
							boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									gap: "8px",
									marginBottom: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										padding: "2px 8px",
										borderRadius: "6px",
										background: "#fee2e2",
										color: "#b91c1c"
									},
									children: [
										doc.fileType,
										" • ",
										doc.sizeLabel
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										padding: "2px 8px",
										borderRadius: "6px",
										background: "#f1f5f9",
										color: "#475569"
									},
									children: doc.badge
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
								style: {
									margin: "0 0 8px",
									fontSize: "15px",
									fontWeight: 700,
									color: "#0f172a",
									display: "flex",
									alignItems: "flex-start",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuildingComplex, {
									size: 18,
									style: {
										color: "var(--teal)",
										flexShrink: 0,
										marginTop: "2px"
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: doc.title })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: 0,
									fontSize: "12px",
									color: "#64748b",
									lineHeight: 1.5
								},
								children: doc.description
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								gap: "10px",
								paddingTop: "12px",
								borderTop: "1px solid #f1f5f9"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setViewingPdf({
									...doc,
									isCompanyDoc: true
								}),
								className: "ui-button secondary",
								style: {
									flex: 1,
									fontSize: "11.5px",
									padding: "8px 12px",
									justifyContent: "center",
									display: "inline-flex",
									alignItems: "center",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 13 }), " Read / Preview Document"]
							})
						})]
					}, doc.id))
				})]
			}),
			activeSection === "compliance_nda" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gap: "16px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "16px 20px",
						borderRadius: "12px",
						background: allNdaCompleted ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
						border: allNdaCompleted ? "1px solid #86efac" : "1px solid #cbd5e1",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "12px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								marginBottom: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: "5px",
									fontSize: "11px",
									fontWeight: 700,
									padding: "3px 10px",
									borderRadius: "12px",
									background: allNdaCompleted ? "#15803d" : "#0284c7",
									color: "#ffffff",
									letterSpacing: "0.3px"
								},
								children: [allNdaCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 12 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, { size: 12 }), allNdaCompleted ? "ALL COMPLIANCE & NDA ATTACHED" : "MANDATORY EMPLOYEE EXECUTION"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "12px",
									color: "#475569",
									fontWeight: 600
								},
								children: [
									uploadedNdaCount,
									" of ",
									totalNdaTemplates,
									" Agreements Uploaded"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: {
								margin: "0 0 4px",
								fontSize: "15px",
								fontWeight: 700,
								color: "#0f172a"
							},
							children: "Download Agreement Templates, Sign, and Re-upload Signed Copies"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: 0,
								fontSize: "12px",
								color: "#475569",
								maxWidth: "780px",
								lineHeight: "1.5"
							},
							children: "Download each official blank agreement template below, review the clauses, physically or digitally sign the document, and re-upload your executed signed copy. Each attached agreement is verified and permanently secured in your employee compliance locker."
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
						gap: "16px"
					},
					children: filteredNdaTemplates.map((template) => {
						const uploadedDoc = complianceDocs[template.key];
						const isUploaded = Boolean(uploadedDoc?.url || uploadedDoc?.fileName || uploadedDoc?.status === "submitted");
						const isUploading = uploadingKey === template.key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComplianceNdaCard, {
							template,
							uploadedDoc,
							isUploaded,
							isUploading,
							canUpload: canUploadSigned,
							onViewTemplate: () => setViewingPdf(template),
							onViewUploaded: () => setViewingPdf({
								...uploadedDoc,
								title: `Signed: ${template.title}`
							}),
							onUploadFile: (file) => handleUploadSignedDoc(template, file)
						}, template.key);
					})
				})]
			}),
			viewingPdf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					zIndex: 100010,
					background: "rgba(15, 23, 42, 0.85)",
					backdropFilter: "blur(4px)",
					display: "grid",
					placeItems: "center",
					padding: "20px"
				},
				onClick: () => setViewingPdf(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						width: "94%",
						maxWidth: "960px",
						height: "90vh",
						display: "flex",
						flexDirection: "column",
						background: "#ffffff",
						borderRadius: "14px",
						overflow: "hidden",
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)"
					},
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "14px 20px",
								background: "#0f172a",
								color: "#ffffff",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									size: 20,
									style: { color: "#38bdf8" }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: 0,
										fontSize: "15px",
										fontWeight: 700,
										color: "#ffffff"
									},
									children: viewingPdf.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "11px",
										color: "#94a3b8"
									},
									children: [
										viewingPdf.fileName || "Document Viewer",
										" • ",
										viewingPdf.sizeLabel || viewingPdf.size || "PDF"
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px"
								},
								children: [viewingPdf.downloadUrl && activeSection !== "company_docs" && !viewingPdf.isCompanyDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: viewingPdf.downloadUrl,
									download: viewingPdf.fileName,
									target: "_blank",
									rel: "noopener noreferrer",
									className: "ui-button secondary",
									style: {
										background: "rgba(255,255,255,0.15)",
										borderColor: "rgba(255,255,255,0.25)",
										color: "#ffffff",
										fontSize: "11.5px",
										padding: "6px 12px",
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
										textDecoration: "none"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 13 }), " Download"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setViewingPdf(null),
									className: "icon-button",
									style: {
										background: "rgba(255,255,255,0.15)",
										border: "none",
										color: "#ffffff",
										borderRadius: "8px",
										cursor: "pointer",
										padding: "6px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								flex: 1,
								background: "#525659",
								position: "relative"
							},
							children: viewingPdf.url && viewingPdf.url.startsWith("data:image/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									width: "100%",
									height: "100%",
									overflow: "auto",
									display: "grid",
									placeItems: "center",
									padding: "20px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: viewingPdf.url,
									alt: viewingPdf.title,
									style: {
										maxWidth: "100%",
										maxHeight: "100%",
										objectFit: "contain"
									}
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								src: `${viewingPdf.url || viewingPdf.downloadUrl}#toolbar=${activeSection === "company_docs" || viewingPdf.isCompanyDoc ? "0" : "1"}&navpanes=0`,
								title: viewingPdf.title,
								style: {
									width: "100%",
									height: "100%",
									border: "none"
								}
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "12px 20px",
								background: "#f8fafc",
								borderTop: "1px solid #e2e8f0",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "12px",
									color: "#64748b"
								},
								children: "Official compliance record of Elythra Edufyi Tech Solutions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: () => setViewingPdf(null),
								children: "Close Viewer"
							})]
						})
					]
				})
			})
		]
	});
}
/**
* Individual Card for each Compliance & NDA agreement
* Implements the Download Blank -> Sign -> Re-upload workflow
*/
function ComplianceNdaCard({ template, uploadedDoc, isUploaded, isUploading, onViewTemplate, onViewUploaded, onUploadFile, canUpload = true }) {
	const fileInputRef = (0, import_react.useRef)(null);
	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) onUploadFile(file);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel",
		style: {
			padding: "20px",
			borderRadius: "12px",
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			gap: "16px",
			border: isUploaded ? "1px solid #86efac" : "1px solid #cbd5e1",
			background: isUploaded ? "#fbfdfb" : "#ffffff",
			boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
			transition: "all 0.2s ease"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: "8px",
					marginBottom: "10px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						fontSize: "10px",
						fontWeight: 700,
						padding: "2px 8px",
						borderRadius: "6px",
						background: "#fee2e2",
						color: "#b91c1c",
						letterSpacing: "0.4px"
					},
					children: [
						template.fileType,
						" • ",
						template.sizeLabel
					]
				}), isUploaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						fontSize: "10px",
						fontWeight: 700,
						padding: "3px 8px",
						borderRadius: "6px",
						background: "#dcfce7",
						color: "#15803d",
						display: "inline-flex",
						alignItems: "center",
						gap: "4px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 11 }), " SIGNED & ATTACHED"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						fontSize: "10px",
						fontWeight: 700,
						padding: "3px 8px",
						borderRadius: "6px",
						background: "#fef3c7",
						color: "#b45309",
						display: "inline-flex",
						alignItems: "center",
						gap: "4px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 11 }), " PENDING SIGNED UPLOAD"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
				style: {
					margin: "0 0 8px",
					fontSize: "15px",
					fontWeight: 700,
					color: "#0f172a",
					display: "flex",
					alignItems: "flex-start",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheckCorner, {
					size: 18,
					style: {
						color: isUploaded ? "#16a34a" : "var(--teal)",
						flexShrink: 0,
						marginTop: "2px"
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: template.title })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					margin: "0 0 14px",
					fontSize: "12px",
					color: "#64748b",
					lineHeight: 1.5
				},
				children: template.description
			}),
			isUploaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 12px",
					background: "#f0fdf4",
					border: "1px solid #bbf7d0",
					borderRadius: "8px",
					fontSize: "11px",
					color: "#166534",
					display: "grid",
					gap: "4px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px",
							fontWeight: 700
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							size: 13,
							style: { color: "#16a34a" }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Signed Copy Uploaded & Secured" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: "10.5px",
							color: "#15803d"
						},
						children: [
							"File: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: uploadedDoc?.fileName || "Signed Agreement" }),
							" (",
							uploadedDoc?.size || "Attached",
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: "10px",
							color: "#166534"
						},
						children: ["Uploaded on: ", uploadedDoc?.uploadedDateFormatted || uploadedDoc?.uploadedAt || "Recently"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 12px",
					background: "#fffbeb",
					border: "1px solid #fde68a",
					borderRadius: "8px",
					fontSize: "11px",
					color: "#92400e",
					display: "flex",
					alignItems: "center",
					gap: "6px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					size: 13,
					style: {
						color: "#d97706",
						flexShrink: 0
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Step 1: Download blank template below. Step 2: Sign and re-upload completed copy." })]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "grid",
				gap: "8px",
				paddingTop: "10px",
				borderTop: "1px solid #f1f5f9"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onViewTemplate,
						className: "ui-button secondary",
						style: {
							flex: 1,
							fontSize: "11.5px",
							padding: "7px 10px",
							justifyContent: "center",
							display: "inline-flex",
							alignItems: "center",
							gap: "5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 13 }), " View Template"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: template.downloadUrl,
						download: template.fileName,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "ui-button secondary",
						style: {
							flex: 1,
							fontSize: "11.5px",
							padding: "7px 10px",
							justifyContent: "center",
							display: "inline-flex",
							alignItems: "center",
							gap: "5px",
							textDecoration: "none"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 13 }), " Download Blank"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileInputRef,
					type: "file",
					accept: ".pdf,image/*",
					style: { display: "none" },
					onChange: handleFileChange
				}),
				isUploaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onViewUploaded,
						className: "ui-button secondary",
						style: {
							flex: 1,
							fontSize: "11.5px",
							padding: "7px 10px",
							justifyContent: "center",
							display: "inline-flex",
							alignItems: "center",
							gap: "5px",
							background: "#ecfdf5",
							borderColor: "#a7f3d0",
							color: "#065f46",
							fontWeight: 600
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 13 }), " View Signed Copy"]
					}), canUpload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => fileInputRef.current?.click(),
						disabled: isUploading,
						className: "ui-button secondary",
						style: {
							fontSize: "11.5px",
							padding: "7px 12px",
							justifyContent: "center",
							display: "inline-flex",
							alignItems: "center",
							gap: "5px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 13 }),
							" ",
							isUploading ? "Uploading..." : "Re-upload"
						]
					})]
				}) : canUpload ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => fileInputRef.current?.click(),
					disabled: isUploading,
					className: "ui-button primary",
					style: {
						width: "100%",
						fontSize: "12px",
						padding: "8px 14px",
						justifyContent: "center",
						background: "var(--teal)",
						borderColor: "var(--teal)",
						color: "#ffffff",
						fontWeight: 600,
						display: "inline-flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 14 }), isUploading ? "Attaching Document..." : "Upload Signed Copy"]
				}) : null
			]
		})]
	});
}
export { PerformanceWorkspace as a, CompanyPoliciesView as i, getDailyAttendanceStatus as n, WorkspaceNotifications as o, getLateCountInfo as r, WorkspaceReports as s, CompanyDocumentsView as t };
