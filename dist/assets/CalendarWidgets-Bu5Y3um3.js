import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $t as Calendar, Bt as Clock, _n as require_react, fn as Award, qt as ChevronRight, rn as Cake, u as Video } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { T as hrStore } from "./index-DPfPlI3e.js";
import { n as calendarService } from "./HolidayCalendarShowcase-BqNjKE64.js";
// src/utils/dobHelper.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Frontend DOB parsing and extraction utility for Edufyi HR Calendar & Celebration widgets.
*/
function parseDobToMonthDay(rawDob) {
	if (!rawDob) return null;
	if (rawDob instanceof Date && !isNaN(rawDob.getTime())) return {
		month: rawDob.getUTCMonth() + 1,
		day: String(rawDob.getUTCDate()).padStart(2, "0")
	};
	const str = String(rawDob).trim();
	if (!str) return null;
	const ymdMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
	if (ymdMatch) {
		const month = parseInt(ymdMatch[2], 10);
		const day = String(parseInt(ymdMatch[3], 10)).padStart(2, "0");
		if (month >= 1 && month <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) return {
			month,
			day
		};
	}
	const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
	if (dmyMatch) {
		const day = String(parseInt(dmyMatch[1], 10)).padStart(2, "0");
		const month = parseInt(dmyMatch[2], 10);
		if (month >= 1 && month <= 12 && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31) return {
			month,
			day
		};
	}
	const d = new Date(str);
	if (!isNaN(d.getTime())) return {
		month: d.getUTCMonth() + 1,
		day: String(d.getUTCDate()).padStart(2, "0")
	};
	return null;
}
function extractEmployeeDob(emp) {
	if (!emp || typeof emp !== "object") return null;
	return parseDobToMonthDay(emp.dob || emp.identity?.dob || emp.dateOfBirth || emp.birthDate || emp.personalDetails?.dob || emp.personalDetails?.dateOfBirth);
}
// src/components/calendar/CalendarWidgets.jsx
var import_jsx_runtime = require_jsx_runtime();
function CalendarWidgets({ user = null }) {
	const [widgetsData, setWidgetsData] = (0, import_react.useState)(null);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		calendarService.getWidgets().then((data) => {
			if (mounted && data) {
				setWidgetsData(data);
				setIsLoading(false);
			}
		}).catch(() => {
			if (mounted) setIsLoading(false);
		});
		return () => {
			mounted = false;
		};
	}, []);
	const portal = user?.role === "admin" ? "admin" : user?.role === "employee" ? "employee" : "hr";
	const storeState = hrStore.getState();
	const toLocalDateStr = (d = /* @__PURE__ */ new Date()) => {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	};
	const todayStr = toLocalDateStr(/* @__PURE__ */ new Date());
	const currentMonth = (/* @__PURE__ */ new Date()).getMonth() + 1;
	const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
	const nextHoliday = (widgetsData?.upcomingHolidays || (storeState.holidays || []).filter((h) => h.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4))[0];
	const daysLeft = nextHoliday?.daysRemaining !== void 0 && nextHoliday?.daysRemaining !== null ? nextHoliday.daysRemaining : nextHoliday?.date ? Math.ceil((new Date(nextHoliday.date).setHours(0, 0, 0, 0) - (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0)) / 864e5) : null;
	const isLongWeekend = (dateStr) => {
		if (!dateStr) return false;
		const d = /* @__PURE__ */ new Date(`${dateStr}T00:00:00Z`);
		if (isNaN(d.getTime())) return false;
		const day = d.getUTCDay();
		return day === 1 || day === 5;
	};
	const getGoogleCalendarUrl = (h) => {
		if (!h?.date) return "#";
		const title = encodeURIComponent(h.name || h.title || "Holiday");
		const start = (h.date || "").replace(/-/g, "");
		const d = new Date(h.endDate || h.date);
		d.setDate(d.getDate() + 1);
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${d.toISOString().split("T")[0].replace(/-/g, "")}&details=${encodeURIComponent(`${h.category || "Official Holiday"} - Edufyi HR Calendar`)}`;
	};
	const birthdays = widgetsData?.birthdaysThisMonth || (storeState.employees || []).map((e) => {
		const dobInfo = extractEmployeeDob(e);
		if (!dobInfo || dobInfo.month !== currentMonth) return null;
		return {
			id: e.id || e._id,
			name: e.displayName || e.name,
			department: e.department || "General",
			date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-${dobInfo.day}`
		};
	}).filter(Boolean);
	const anniversaries = widgetsData?.anniversariesThisMonth || (storeState.employees || []).filter((e) => {
		if (!e.joiningDate) return false;
		const d = new Date(e.joiningDate);
		return !isNaN(d.getTime()) && d.getUTCMonth() + 1 === currentMonth && currentYear - d.getUTCFullYear() > 0;
	}).map((e) => {
		const d = new Date(e.joiningDate);
		return {
			id: e.id || e._id,
			name: e.displayName || e.name,
			department: e.department || "General",
			completedYears: currentYear - d.getUTCFullYear(),
			date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
		};
	});
	const upcomingMeetings = widgetsData?.upcomingMeetings || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
			gap: "16px",
			width: "100%",
			boxSizing: "border-box"
		},
		className: "calendar-widgets-container",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel hover-card",
				style: {
					padding: "16px",
					borderRadius: "12px",
					border: "1px solid var(--border, #e2e8f0)",
					background: "var(--card-bg, #ffffff)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							fontWeight: 700,
							color: "var(--teal, #006E6F)",
							textTransform: "uppercase",
							display: "flex",
							alignItems: "center",
							gap: "4px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: 13 }), " Upcoming Holiday"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							background: "#e0f2fe",
							color: "#0369a1",
							padding: "2px 8px",
							borderRadius: "12px",
							fontWeight: 700
						},
						children: [widgetsData?.totalHolidaysThisYear || storeState.holidays?.length || 0, " This Year"]
					})]
				}), nextHoliday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "6px",
						flexWrap: "wrap",
						marginBottom: "4px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: {
								margin: 0,
								fontSize: "15px",
								fontWeight: 800,
								color: "var(--ink, #0f172a)"
							},
							children: nextHoliday.name || nextHoliday.title
						}),
						daysLeft !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10px",
								fontWeight: 700,
								padding: "2px 7px",
								borderRadius: "12px",
								background: daysLeft <= 2 ? "#dcfce7" : "#e0f2fe",
								color: daysLeft <= 2 ? "#166534" : "#0369a1"
							},
							children: daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `In ${daysLeft} days`
						}),
						isLongWeekend(nextHoliday.date) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10px",
								fontWeight: 700,
								padding: "2px 7px",
								borderRadius: "12px",
								background: "#fef3c7",
								color: "#b45309"
							},
							children: "🎉 3-Day Weekend"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "6px",
						fontSize: "12px",
						color: "var(--muted, #64748b)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						nextHoliday.date,
						" (",
						nextHoliday.day || "Day",
						")"
					] })]
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: 0,
						fontSize: "12.5px",
						color: "var(--muted, #64748b)"
					},
					children: "No upcoming company holidays scheduled soon."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginTop: "12px",
						paddingTop: "10px",
						borderTop: "1px solid var(--border, #f1f5f9)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `#/${portal}/holidays`,
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
							fontSize: "12px",
							fontWeight: 700,
							color: "var(--teal, #006E6F)",
							textDecoration: "none"
						},
						children: ["View Calendar ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })]
					}), nextHoliday && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: getGoogleCalendarUrl(nextHoliday),
						target: "_blank",
						rel: "noopener noreferrer",
						style: {
							fontSize: "11px",
							fontWeight: 600,
							color: "#0284c7",
							textDecoration: "none",
							display: "inline-flex",
							alignItems: "center",
							gap: "3px"
						},
						title: "Add this holiday to Google Calendar",
						children: "+ G-Cal"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel hover-card",
				style: {
					padding: "16px",
					borderRadius: "12px",
					border: "1px solid var(--border, #e2e8f0)",
					background: "var(--card-bg, #ffffff)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							fontWeight: 700,
							color: "#db2777",
							textTransform: "uppercase",
							display: "flex",
							alignItems: "center",
							gap: "4px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: 13 }), " Birthdays This Month"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							background: "#fdf2f8",
							color: "#db2777",
							padding: "2px 8px",
							borderRadius: "12px",
							fontWeight: 700
						},
						children: [birthdays.length, " Celebrations"]
					})]
				}), birthdays.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "6px"
					},
					children: birthdays.slice(0, 3).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							fontSize: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontWeight: 700,
								color: "var(--ink, #1e293b)"
							},
							children: ["🎂 ", b.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								color: "var(--muted, #64748b)",
								fontSize: "11px"
							},
							children: [
								b.date ? b.date.slice(5) : "",
								" (",
								b.department,
								")"
							]
						})]
					}, b.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: 0,
						fontSize: "12.5px",
						color: "var(--muted, #64748b)"
					},
					children: "No employee birthdays this month."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "12px",
						paddingTop: "10px",
						borderTop: "1px solid var(--border, #f1f5f9)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `#/${portal}/holidays`,
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
							fontSize: "12px",
							fontWeight: 700,
							color: "#db2777",
							textDecoration: "none"
						},
						children: ["Celebrations Board ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel hover-card",
				style: {
					padding: "16px",
					borderRadius: "12px",
					border: "1px solid var(--border, #e2e8f0)",
					background: "var(--card-bg, #ffffff)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							fontWeight: 700,
							color: "#d97706",
							textTransform: "uppercase",
							display: "flex",
							alignItems: "center",
							gap: "4px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { size: 13 }), " Work Anniversaries"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							background: "#fef3c7",
							color: "#b45309",
							padding: "2px 8px",
							borderRadius: "12px",
							fontWeight: 700
						},
						children: [anniversaries.length, " Milestones"]
					})]
				}), anniversaries.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "6px"
					},
					children: anniversaries.slice(0, 3).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							fontSize: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontWeight: 700,
								color: "var(--ink, #1e293b)"
							},
							children: ["🎖️ ", a.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								color: "#b45309",
								fontWeight: 700,
								fontSize: "11px"
							},
							children: [
								a.completedYears,
								" Year",
								a.completedYears > 1 ? "s" : ""
							]
						})]
					}, a.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: 0,
						fontSize: "12.5px",
						color: "var(--muted, #64748b)"
					},
					children: "No employment anniversaries this month."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "12px",
						paddingTop: "10px",
						borderTop: "1px solid var(--border, #f1f5f9)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `#/${portal}/holidays`,
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
							fontSize: "12px",
							fontWeight: 700,
							color: "#d97706",
							textDecoration: "none"
						},
						children: ["Celebrate Milestones ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel hover-card",
				style: {
					padding: "16px",
					borderRadius: "12px",
					border: "1px solid var(--border, #e2e8f0)",
					background: "var(--card-bg, #ffffff)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							fontWeight: 700,
							color: "#059669",
							textTransform: "uppercase",
							display: "flex",
							alignItems: "center",
							gap: "4px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 13 }), " Team Meetings & Meet"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							background: "#ecfdf5",
							color: "#047857",
							padding: "2px 8px",
							borderRadius: "12px",
							fontWeight: 700
						},
						children: [upcomingMeetings.length, " Scheduled"]
					})]
				}), upcomingMeetings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px"
					},
					children: upcomingMeetings.slice(0, 2).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							fontSize: "12px",
							background: "#f8fafc",
							padding: "6px 8px",
							borderRadius: "6px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1,
								marginRight: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 700,
									color: "var(--ink, #1e293b)",
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis"
								},
								children: m.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "10.5px",
									color: "var(--muted, #64748b)"
								},
								children: [
									m.date,
									" ",
									m.startTime ? `• ${m.startTime}` : ""
								]
							})]
						}), m.meetingLink?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: m.meetingLink.url,
							target: "_blank",
							rel: "noopener noreferrer",
							style: {
								padding: "4px 8px",
								background: "#059669",
								color: "#ffffff",
								borderRadius: "5px",
								fontSize: "11px",
								fontWeight: 700,
								textDecoration: "none",
								display: "inline-flex",
								alignItems: "center",
								gap: "4px",
								flexShrink: 0
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 11 }), " Join"]
						})]
					}, m.id || m._id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: 0,
						fontSize: "12.5px",
						color: "var(--muted, #64748b)"
					},
					children: "No meetings scheduled. Click below to schedule a session with Google Meet."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginTop: "12px",
						paddingTop: "10px",
						borderTop: "1px solid var(--border, #f1f5f9)"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `#/${portal}/holidays`,
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
							fontSize: "12px",
							fontWeight: 700,
							color: "#059669",
							textDecoration: "none"
						},
						children: ["+ Schedule Session ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })]
					})
				})]
			})
		]
	});
}
export { CalendarWidgets as t };
