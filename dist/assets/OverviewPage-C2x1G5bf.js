import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { Dt as FileText, E as Sparkles, H as Receipt, Ut as CircleQuestionMark, Vt as Clock3, Wt as CircleCheck, Zt as ChartColumn, _n as require_react, d as Users, m as UserPlus, mn as ArrowRight, mt as LayoutDashboard, pn as ArrowUpRight, r as Zap, s as WalletCards, sn as BriefcaseBusiness, tn as CalendarDays, un as BellRing, v as TrendingUp } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { O as currentPayrollMonth, T as hrStore, _ as resolveUserDisplayName, b as hasPermission, c as StatusBadge, g as getTimeOfDayGreeting, k as todayKey, o as PageHeader, t as Button, v as findRoute, x as useAuth } from "./index-D_n2wRA2.js";
import { t as CalendarWidgets } from "./CalendarWidgets-BLnW1YCM.js";
// src/pages/OverviewPage.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var metricIcons = {
	activeHeadcount: Users,
	onLeaveToday: CalendarDays,
	pendingLeave: CalendarDays,
	attendanceExceptions: Clock3,
	upcomingHolidays: CalendarDays,
	openHelpdeskTickets: CircleQuestionMark,
	pendingExpenses: Receipt
};
var metricTones = {
	activeHeadcount: "teal",
	onLeaveToday: "coral",
	pendingLeave: "gold",
	attendanceExceptions: "blue",
	upcomingHolidays: "gold",
	openHelpdeskTickets: "teal",
	pendingExpenses: "coral"
};
function MetricCard({ metric, user }) {
	const Icon = metricIcons[metric.key] ?? FileText;
	const route = findRoute(metric.href);
	const canOpen = route && (!route.permission || hasPermission(user, route.permission));
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `metric-icon ${metricTones[metric.key] ?? "teal"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "metric-copy",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: metric.label }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: metric.value }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: metric.detail })
			]
		}),
		canOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
			className: "metric-link-icon",
			size: 16
		})
	] });
	return canOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		className: "metric-card metric-link",
		href: `#${metric.href}`,
		"aria-label": `Open ${metric.label}`,
		children: content
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: "metric-card",
		children: content
	});
}
function LiveClockWidget({ storeState }) {
	const [now, setNow] = (0, import_react.useState)(/* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 1e3);
		return () => window.clearInterval(timer);
	}, []);
	const time = now.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true
	});
	const dateLabel = now.toLocaleDateString([], {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric"
	});
	const presentCount = storeState.attendance.filter((a) => a.date === todayKey() && (a.status === "present" || a.status === "late")).length;
	const totalEmployees = storeState.employees.filter((employee) => employee.status === "active").length;
	const presencePercent = totalEmployees ? Math.round(presentCount / totalEmployees * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "clock-widget",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "clock-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Operational Clock"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "live-pill",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot" }), " Online"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "clock-display",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "clock-time",
					children: time
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "clock-date",
					children: dateLabel
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "clock-stats",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Presence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [presencePercent, "%"] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Staff" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
					presentCount,
					" / ",
					totalEmployees
				] })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "activity-ticker",
				"aria-label": "Live HR updates",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Database-backed attendance records" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Configured leave approval workflow" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Payroll requires HR review" })
				]
			})
		]
	});
}
function DashboardWidgets({ storeState }) {
	const [range, setRange] = (0, import_react.useState)("Week");
	const ranges = {
		Week: [
			85,
			92,
			88,
			95,
			90,
			78,
			86
		],
		Month: [
			80,
			84,
			87,
			89,
			91,
			88,
			92
		],
		Quarter: [
			76,
			82,
			85,
			88,
			90,
			93,
			94
		]
	};
	const chartValues = ranges[range];
	const headcount = storeState.employees.length;
	const onboardingCount = storeState.employees.filter((e) => e.status === "onboarding").length;
	const noticeCount = storeState.employees.filter((e) => e.status === "notice").length;
	const activeCount = storeState.employees.filter((e) => e.status === "active").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "widget-board",
		"aria-label": "HR insights and actions",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel rhythm-widget",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Presence Analytics"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Attendance Rhythm" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "range-tabs",
							role: "tablist",
							"aria-label": "Attendance range",
							children: Object.keys(ranges).map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								role: "tab",
								"aria-selected": range === option,
								className: range === option ? "selected" : "",
								onClick: () => setRange(option),
								children: option
							}, option))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rhythm-summary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "88.4%" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 13 }),
							" +3.2% vs last ",
							range.toLowerCase(),
							" (Wi-Fi Verified)"
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rhythm-chart",
						"aria-label": `${range} attendance chart`,
						children: chartValues.map((value, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rhythm-column",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rhythm-value",
									children: [value, "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rhythm-track",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { height: `${value}%` } })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: [
									"Mon",
									"Tue",
									"Wed",
									"Thu",
									"Fri",
									"Sat",
									"Sun"
								][index] })
							]
						}, index))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel pipeline-widget",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "People Pipeline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Workforce Movement" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {
							size: 18,
							className: "muted-icon"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pipeline-total",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: headcount }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total personnel in roster" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pipeline-list",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "pipeline-dot teal" }), " Active & Engaged"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeCount }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { style: { width: `${activeCount / headcount * 100}%` } }) })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "pipeline-dot blue" }), " In Onboarding"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: onboardingCount }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { style: { width: `${onboardingCount / headcount * 100}%` } }) })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "pipeline-dot gold" }), " Notice / Transition"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: noticeCount }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { style: { width: `${noticeCount / headcount * 100}%` } }) })
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						className: "widget-link",
						href: "#/hr/people",
						children: ["Manage workforce directory ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel command-widget",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Command Center"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Workforce Actions" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
						size: 18,
						className: "muted-icon"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "command-actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#/hr/people",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "command-icon teal",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Add New Employee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Onboard profile & documents" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 14 })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#/hr/leave",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "command-icon coral",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Review Leave Approvals" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [storeState.leaves.filter((l) => l.status.startsWith("pending")).length, " requests pending review"] })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 14 })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#/hr/payroll",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "command-icon blue",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Run Monthly Payroll" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Salary breakup & PDF payslips" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 14 })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#/hr/attendance",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "command-icon gold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Verify Wi-Fi Attendance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Check-in logs & geofence" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 14 })
							]
						})
					]
				})]
			})
		]
	});
}
function TodayAttendancePulseWidget({ storeState }) {
	const [pulseTab, setPulseTab] = (0, import_react.useState)("working");
	const todayStr = todayKey();
	const todayAttendance = (storeState?.attendance || []).filter((a) => a.date === todayStr);
	const workingStaff = todayAttendance.filter((a) => Boolean(a.checkIn) && !a.checkOut);
	const punchedOutStaff = todayAttendance.filter((a) => Boolean(a.checkIn) && Boolean(a.checkOut));
	const checkedInEmpIds = new Set(todayAttendance.filter((a) => Boolean(a.checkIn)).flatMap((a) => [
		String(a.employeeId || "").toUpperCase(),
		String(a.employeeName || "").toLowerCase(),
		String(a.id || a._id || "").toLowerCase()
	]));
	const notPunchedStaff = (storeState?.employees || []).filter((emp) => {
		if (emp.status !== "active") return false;
		const code = String(emp.employeeId || "").toUpperCase();
		const name = String(emp.name || "").toLowerCase();
		const id = String(emp.id || emp._id || "").toLowerCase();
		return !checkedInEmpIds.has(code) && !checkedInEmpIds.has(name) && !checkedInEmpIds.has(id);
	});
	const activeList = pulseTab === "working" ? workingStaff : pulseTab === "not_punched" ? notPunchedStaff : punchedOutStaff;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "panel",
		style: {
			marginTop: "16px",
			marginBottom: "16px",
			border: "1px solid var(--line)"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel-heading",
			style: {
				flexWrap: "wrap",
				gap: "10px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "section-kicker",
				children: "Live Workforce Attendance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
				"Today's Attendance Pulse (",
				todayStr,
				")"
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: "8px",
					flexWrap: "wrap"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ui-button",
						onClick: () => setPulseTab("working"),
						style: {
							fontSize: "11.5px",
							fontWeight: 700,
							padding: "6px 14px",
							background: pulseTab === "working" ? "#047857" : "#ecfdf5",
							color: pulseTab === "working" ? "#fff" : "#047857",
							border: "1px solid #a7f3d0",
							borderRadius: "8px"
						},
						children: [
							"🟢 Punched In / Working (",
							workingStaff.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ui-button",
						onClick: () => setPulseTab("not_punched"),
						style: {
							fontSize: "11.5px",
							fontWeight: 700,
							padding: "6px 14px",
							background: pulseTab === "not_punched" ? "#b91c1c" : "#fef2f2",
							color: pulseTab === "not_punched" ? "#fff" : "#b91c1c",
							border: "1px solid #fecaca",
							borderRadius: "8px"
						},
						children: [
							"🔴 Not Punched In (",
							notPunchedStaff.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ui-button",
						onClick: () => setPulseTab("punched_out"),
						style: {
							fontSize: "11.5px",
							fontWeight: 700,
							padding: "6px 14px",
							background: pulseTab === "punched_out" ? "#1d4ed8" : "#eff6ff",
							color: pulseTab === "punched_out" ? "#fff" : "#1d4ed8",
							border: "1px solid #bfdbfe",
							borderRadius: "8px"
						},
						children: [
							"🔵 Punched Out (",
							punchedOutStaff.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#/hr/attendance",
						className: "ui-button secondary",
						style: {
							fontSize: "11.5px",
							padding: "6px 14px",
							textDecoration: "none",
							display: "inline-flex",
							alignItems: "center",
							gap: "4px"
						},
						children: "Full Attendance Roster →"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: { padding: "14px 16px" },
			children: [activeList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					textAlign: "center",
					padding: "24px 10px",
					color: "var(--muted)",
					fontSize: "12px"
				},
				children: pulseTab === "not_punched" ? "🎉 All active employees have punched in today!" : pulseTab === "working" ? "No staff currently checked-in without checkout." : "No completed check-outs yet today."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
					gap: "10px"
				},
				children: activeList.slice(0, 12).map((item) => {
					const isEmpRecord = pulseTab === "not_punched";
					const name = isEmpRecord ? item.name : item.employeeName;
					const code = isEmpRecord ? item.employeeId : item.employeeId;
					const dept = isEmpRecord ? item.department : item.department || "General";
					const initials = String(name || "E").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f8fafc",
							border: "1px solid var(--line)",
							borderRadius: "8px",
							padding: "10px 12px",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "10px",
								minWidth: 0
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									width: "32px",
									height: "32px",
									borderRadius: "50%",
									background: pulseTab === "working" ? "#dcfce7" : pulseTab === "not_punched" ? "#fee2e2" : "#dbeafe",
									color: pulseTab === "working" ? "#15803d" : pulseTab === "not_punched" ? "#b91c1c" : "#1d4ed8",
									display: "grid",
									placeItems: "center",
									fontWeight: 800,
									fontSize: "11px",
									flexShrink: 0
								},
								children: initials
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: { minWidth: 0 },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "12.5px",
										color: "var(--ink)",
										display: "block",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										display: "block"
									},
									children: [
										code,
										" · ",
										dept
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								textAlign: "right",
								flexShrink: 0
							},
							children: pulseTab === "working" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 700,
									color: "#15803d"
								},
								children: item.checkIn || "In"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								style: {
									display: "block",
									fontSize: "9px",
									color: "var(--muted)"
								},
								children: "Checked In"
							})] }) : pulseTab === "not_punched" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									fontWeight: 700,
									color: "#b91c1c",
									background: "#fee2e2",
									padding: "2px 6px",
									borderRadius: "4px"
								},
								children: "Absent / Not In"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 700,
									color: "#1d4ed8"
								},
								children: item.checkOut || "Done"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								style: {
									display: "block",
									fontSize: "9px",
									color: "var(--muted)"
								},
								children: "Punched Out"
							})] })
						})]
					}, isEmpRecord ? item.id || item._id || item.employeeId : item.id || item._id);
				})
			}), activeList.length > 12 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					textAlign: "center",
					marginTop: "10px"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#/hr/attendance",
					style: {
						fontSize: "11.5px",
						color: "var(--teal)",
						fontWeight: 600,
						textDecoration: "none"
					},
					children: [
						"+ View all ",
						activeList.length,
						" staff in Attendance Module →"
					]
				})
			})]
		})]
	});
}
function OverviewPage() {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((newState) => {
			setStoreState(newState);
		});
	}, []);
	const activeEmployees = storeState.employees.filter((e) => e.status === "active" || e.status === "onboarding").length;
	const pendingLeaves = storeState.leaves.filter((l) => l.status === "pending_hr" || l.status === "pending_manager").length;
	const todayStr = todayKey();
	const todayAttendance = (storeState.attendance || []).filter((a) => a.date === todayStr);
	const punchedInCount = todayAttendance.filter((a) => Boolean(a.checkIn) && !a.checkOut).length;
	const punchedOutCount = todayAttendance.filter((a) => Boolean(a.checkIn) && Boolean(a.checkOut)).length;
	const checkedInEmpIds = new Set(todayAttendance.filter((a) => Boolean(a.checkIn)).map((a) => String(a.employeeId || "").toUpperCase()));
	const notPunchedInCount = Math.max(0, activeEmployees - checkedInEmpIds.size);
	const lateAttendance = 0;
	const onLeaveToday = new Set(storeState.leaves.filter((leave) => leave.status === "approved" && leave.startDate <= todayKey() && leave.endDate >= todayKey()).map((leave) => leave.employeeId)).size;
	const openTickets = (storeState.tickets || []).filter((t) => (t.status || "open") !== "resolved" && t.status !== "closed").length;
	const pendingExpenses = (storeState.expenses || []).filter((e) => (e.status || "submitted") === "submitted" || e.status === "pending").length;
	const upcomingHolidays = storeState.holidays.length;
	const nextHoliday = (storeState.holidays || []).filter((h) => h.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date))[0];
	const nextHolidayDetail = nextHoliday ? `Next: ${nextHoliday.name || nextHoliday.title} (${nextHoliday.date})` : "Company annual calendar";
	const metrics = [
		{
			key: "activeHeadcount",
			label: "Active headcount",
			value: `${activeEmployees} Staff`,
			detail: "Full-time & contracted",
			href: "/hr/people"
		},
		{
			key: "onLeaveToday",
			label: "On leave today",
			value: `${onLeaveToday} Out`,
			detail: "Scheduled absence",
			href: "/hr/leave"
		},
		{
			key: "pendingLeave",
			label: "Pending leave requests",
			value: `${pendingLeaves} Requests`,
			detail: "Needs HR approval",
			href: "/hr/leave"
		},
		{
			key: "attendanceExceptions",
			label: "Attendance exceptions",
			value: `${lateAttendance} Late`,
			detail: "Grace period flagged",
			href: "/hr/attendance"
		},
		{
			key: "upcomingHolidays",
			label: "Upcoming holidays",
			value: `${upcomingHolidays} Days`,
			detail: nextHolidayDetail,
			href: "/hr/holidays"
		},
		{
			key: "openHelpdeskTickets",
			label: "Open help-desk tickets",
			value: `${openTickets} Tickets`,
			detail: "IT & Payroll queries",
			href: "/hr/helpdesk"
		},
		{
			key: "pendingExpenses",
			label: "Pending expenses",
			value: `${pendingExpenses} Claims`,
			detail: "Reimbursement queue",
			href: "/hr/reports"
		}
	];
	const isAdmin = user?.role === "admin";
	const isExecutive = [
		"director",
		"managing_director",
		"co_founder",
		"vertical_head"
	].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
	const greetingName = isAdmin ? "Admin" : isExecutive ? user?.displayName || user?.name || resolveUserDisplayName(user, storeState?.employees || []) || "Jagadish Babu" : user?.role === "hr" || user?.role === "hr_executive" ? "HR" : resolveUserDisplayName(user, storeState?.employees || []);
	const currentMonth = currentPayrollMonth();
	const pendingDocReviews = (storeState.employees || []).filter((e) => {
		if (e.onboardingStatus === "verified") return false;
		if (e.onboardingStatus === "submitted" || e.onboardingStatus === "in_review") return true;
		if (e.onboardingDocs && typeof e.onboardingDocs === "object") return Object.values(e.onboardingDocs).some((d) => d && typeof d === "object" && (d.fileName || d.url) && d.status !== "verified" && d.status !== "rejected");
		return false;
	});
	const onboardingEmployees = (storeState.employees || []).filter((e) => e.status === "onboarding" || e.status === "invited");
	const monthPayrollRecords = (storeState.payroll || []).filter((p) => (p.month || p.payPeriod || "").toLowerCase() === currentMonth.toLowerCase());
	const urgentTasks = (storeState.tasks || []).filter((t) => t.status !== "completed" && (t.priority === "Urgent" || t.priority === "High"));
	const dailyPriorities = [];
	if (pendingDocReviews.length > 0) {
		const first = pendingDocReviews[0];
		dailyPriorities.push({
			id: "p-docs",
			icon: Users,
			tone: "coral",
			title: `${pendingDocReviews.length} Document Verification${pendingDocReviews.length > 1 ? "s" : ""}`,
			detail: `${first.name} (${first.department || "Staff"}) submitted onboarding documents requiring HR review.`,
			actionLabel: "Review",
			href: "#/hr/people"
		});
	} else if (onboardingEmployees.length > 0) {
		const first = onboardingEmployees[0];
		dailyPriorities.push({
			id: "p-onboarding",
			icon: Users,
			tone: "teal",
			title: "Active Onboarding Candidates",
			detail: `${onboardingEmployees.length} personnel in pipeline. Next: ${first.name} (${first.department || "Staff"}).`,
			actionLabel: "Track",
			href: "#/hr/people"
		});
	} else dailyPriorities.push({
		id: "p-team",
		icon: Users,
		tone: "teal",
		title: "Workforce Onboarding",
		detail: `All ${activeEmployees} team members active with verified compliance records.`,
		actionLabel: "Directory",
		href: "#/hr/people"
	});
	if (pendingLeaves > 0) {
		const firstLeave = storeState.leaves.find((l) => l.status === "pending_hr" || l.status === "pending_manager");
		const applicant = firstLeave?.employeeName || "Staff member";
		dailyPriorities.push({
			id: "p-leaves",
			icon: CalendarDays,
			tone: "coral",
			title: `${pendingLeaves} Pending Leave Request${pendingLeaves > 1 ? "s" : ""}`,
			detail: `${applicant} requested ${firstLeave?.leaveType ? firstLeave.leaveType.toUpperCase() + " leave" : "leave"} awaiting approval.`,
			actionLabel: "Approve",
			href: "#/hr/leave"
		});
	} else dailyPriorities.push({
		id: "p-leaves-clear",
		icon: CalendarDays,
		tone: "teal",
		title: "Leave Approvals Current",
		detail: `${onLeaveToday} staff on approved leave today. No leave approvals pending.`,
		actionLabel: "Calendar",
		href: "#/hr/leave"
	});
	if (monthPayrollRecords.length > 0) dailyPriorities.push({
		id: "p-payroll",
		icon: WalletCards,
		tone: "teal",
		title: `${currentMonth} Payroll Generated`,
		detail: `${monthPayrollRecords.length} payslip(s) calculated with tax, PF, and net disbursements.`,
		actionLabel: "View Run",
		href: "#/hr/payroll"
	});
	else dailyPriorities.push({
		id: "p-payroll-pending",
		icon: WalletCards,
		tone: "blue",
		title: `${currentMonth} Payroll Cycle`,
		detail: `Monthly salary calculation, PF, and statutory tax deductions ready to generate.`,
		actionLabel: "Generate",
		href: "#/hr/payroll"
	});
	if (urgentTasks.length > 0) {
		const firstTask = urgentTasks[0];
		dailyPriorities.push({
			id: "p-task",
			icon: Zap,
			tone: "coral",
			title: `Urgent Task: ${firstTask.title}`,
			detail: `Assigned to ${firstTask.assigneeName || "HR"} due ${firstTask.dueDate || "today"} (${firstTask.category || "Operations"}).`,
			actionLabel: "Open",
			href: "#/hr/tasks"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: isAdmin ? "Executive Administration" : isExecutive ? "Executive Leadership Console" : "Enterprise HR Operations",
			title: `${getTimeOfDayGreeting()}, ${greetingName} ${isAdmin ? "🛡️" : isExecutive ? "👔" : "✦"}`,
			description: isExecutive ? "Executive overview of workforce operations, attendance rhythm, and organizational analytics." : isAdmin ? "Centralized administration, user account provisioning, office Wi-Fi security parameters, and live workforce telemetry." : "Comprehensive workforce management, real-time presence verification, automated payroll, and employee self-service.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				as: "a",
				href: isAdmin ? "#/admin/users" : isExecutive ? "#/hr/people" : "#/hr/people",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 16 }),
					" ",
					isAdmin ? "Manage System Users" : "View Employee Directory"
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "overview-hero",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hero-card main-hero",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-card-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Operational Health"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Workforce Overview & Stability" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: "info",
							children: "Live Sync"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
							gap: "12px",
							margin: "20px 0 16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "var(--surface-sunken)",
									border: "1px solid var(--border)",
									borderRadius: "10px",
									padding: "12px 14px",
									display: "flex",
									flexDirection: "column",
									gap: "4px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "var(--muted)",
												textTransform: "uppercase",
												letterSpacing: "0.08em",
												fontWeight: 700
											},
											children: "Active Personnel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
											size: 14,
											style: { color: "var(--primary)" }
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											font: "700 28px \"Space Grotesk\", sans-serif",
											color: "var(--foreground)",
											lineHeight: 1.1
										},
										children: activeEmployees
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											fontSize: "11px",
											color: "var(--muted)"
										},
										children: "Registered staff"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "rgba(16, 185, 129, 0.08)",
									border: "1px solid rgba(16, 185, 129, 0.3)",
									borderRadius: "10px",
									padding: "12px 14px",
									display: "flex",
									flexDirection: "column",
									gap: "4px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "#047857",
												textTransform: "uppercase",
												letterSpacing: "0.08em",
												fontWeight: 700
											},
											children: "Punched In"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: "4px",
												fontSize: "10px",
												color: "#059669",
												fontWeight: 700
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
												width: "6px",
												height: "6px",
												borderRadius: "50%",
												background: "#10b981",
												display: "inline-block"
											} }), " Live"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											font: "700 28px \"Space Grotesk\", sans-serif",
											color: "#047857",
											lineHeight: 1.1
										},
										children: punchedInCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											fontSize: "11px",
											color: "#059669"
										},
										children: "Working on-site now"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "rgba(2, 132, 199, 0.08)",
									border: "1px solid rgba(2, 132, 199, 0.3)",
									borderRadius: "10px",
									padding: "12px 14px",
									display: "flex",
									flexDirection: "column",
									gap: "4px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "#0284c7",
												textTransform: "uppercase",
												letterSpacing: "0.08em",
												fontWeight: 700
											},
											children: "Punched Out"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
											size: 14,
											style: { color: "#0284c7" }
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											font: "700 28px \"Space Grotesk\", sans-serif",
											color: "#0369a1",
											lineHeight: 1.1
										},
										children: punchedOutCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											fontSize: "11px",
											color: "#0284c7"
										},
										children: "Shift completed today"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "var(--surface-sunken)",
									border: "1px solid var(--border)",
									borderRadius: "10px",
									padding: "12px 14px",
									display: "flex",
									flexDirection: "column",
									gap: "4px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "var(--muted)",
												textTransform: "uppercase",
												letterSpacing: "0.08em",
												fontWeight: 700
											},
											children: "Not Checked In"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
											size: 14,
											style: { color: "var(--muted)" }
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											font: "700 28px \"Space Grotesk\", sans-serif",
											color: "var(--muted)",
											lineHeight: 1.1
										},
										children: notPunchedInCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											fontSize: "11px",
											color: "var(--muted)"
										},
										children: "Pending punch or off"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mini-bars",
						"aria-label": "Department health chart",
						children: [
							78,
							88,
							92,
							85,
							90,
							94,
							96
						].map((height, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { height: `${height}%` } }, index))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-footnote",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }), " Wi-Fi Attendance Verification Active"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 13 }),
							" ",
							punchedInCount + punchedOutCount,
							" / ",
							activeEmployees,
							" Punched Today (",
							activeEmployees > 0 ? Math.round((punchedInCount + punchedOutCount) / activeEmployees * 100) : 0,
							"%)"
						] })]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hero-stack",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveClockWidget, { storeState }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-card compact-card accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "compact-icon",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 16 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "card-label",
								children: "Office Wi-Fi Presence"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Edufyi-Office-5G" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Auto-verified device attendance" })
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-card compact-card neutral",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "compact-icon",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 16 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "card-label",
								children: "Leave Approvals"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [pendingLeaves, " Actionable"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Click to review and approve" })
						] })]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "metric-grid",
			"aria-label": "HR dashboard summary",
			children: metrics.map((metric) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricCard, {
				metric,
				user
			}, metric.key))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TodayAttendancePulseWidget, { storeState }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardWidgets, { storeState }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			style: { margin: "18px 0 6px" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					marginBottom: "10px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					style: {
						margin: 0,
						fontSize: "15px",
						fontWeight: 800,
						color: "var(--ink, #0f172a)"
					},
					children: "Calendar & Workforce Celebrations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: "11.5px",
						color: "var(--muted, #64748b)"
					},
					children: "Holidays, employee birthdays, team anniversaries, and Google Meet video conferences"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#/hr/holidays",
					style: {
						fontSize: "12px",
						fontWeight: 700,
						color: "var(--teal, #006E6F)",
						textDecoration: "none"
					},
					children: "Open Full Calendar →"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarWidgets, { user })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "advanced-grid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel insight-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "HR Operational Focus"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Daily HR Priorities" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "neutral",
						children: "Today"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "focus-list",
					children: dailyPriorities.slice(0, 4).map((item) => {
						const IconComp = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "focus-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `focus-icon ${item.tone}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComp, { size: 14 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.detail })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => window.location.hash = item.href,
									children: item.actionLabel
								})
							]
						}, item.id);
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel action-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Live Feed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Recent System Audit" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "info",
						children: "Live Stream"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "priority-list",
					children: (storeState.auditLogs || []).slice(0, 4).map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dot teal" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { flex: 1 },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [log.actor, ": "] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { fontSize: "10px" },
								children: log.details
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							style: {
								color: "var(--muted)",
								fontSize: "9px"
							},
							children: log.timestamp.split(" ")[1]
						})
					] }, log.id))
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel quick-links-panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Quick Navigation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "All HR Panel Modules" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, {
					size: 18,
					className: "muted-icon"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "quick-links",
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "10px",
					marginTop: "14px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/people",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Directory & Onboarding" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/attendance",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Attendance & Wi-Fi Tracking" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/leave",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Leave Approvals & Calendar" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/payroll",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Payroll & Payslip Generator" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/recruitment",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recruitment & Referrals" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/performance",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Performance & OKRs" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/tasks",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Task Delegation Board" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/learning",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Training & Certifications" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/hr/helpdesk",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { size: 16 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Help Desk" }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { size: 14 })
						]
					})
				]
			})]
		})
	] });
}
export { OverviewPage };
