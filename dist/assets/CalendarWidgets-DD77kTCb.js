import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $t as Calendar, B as Repeat, Bt as Clock, E as Sparkles, Ft as Download, Gt as CircleAlert, Ht as CircleX, Jt as ChevronLeft, K as Plus, L as Search, Ot as FileSpreadsheet, Pt as ExternalLink, Rt as Copy, Ut as CircleQuestionMark, Wt as CircleCheck, Xt as Check, Y as Pen, _n as require_react, at as MapPin, d as Users, dn as Bell, en as CalendarRange, fn as Award, ft as List, g as Upload, ht as Layers, i as X, n as ZoomIn, qt as ChevronRight, rn as Cake, t as ZoomOut, tn as CalendarDays, u as Video, x as Target, xt as Grid3x3, y as Trash } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { I as apiClient, T as hrStore, a as Field, t as Button } from "./index-ByLK1Fqy.js";
// src/utils/dobHelper.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Frontend DOB parsing and extraction utility for Edufyi HR Calendar & Celebration widgets.
*/
function parseDobToMonthDay(rawDob) {
	if (!rawDob) return null;
	if (rawDob instanceof Date && !isNaN(rawDob.getTime())) {
		try {
			const parts = new Intl.DateTimeFormat("en-IN", {
				timeZone: "Asia/Kolkata",
				day: "2-digit",
				month: "2-digit"
			}).formatToParts(rawDob);
			const dayPart = parts.find((p) => p.type === "day")?.value;
			const monthPart = parts.find((p) => p.type === "month")?.value;
			if (dayPart && monthPart) return {
				month: parseInt(monthPart, 10),
				day: dayPart.padStart(2, "0")
			};
		} catch {}
		return {
			month: rawDob.getUTCMonth() + 1,
			day: String(rawDob.getUTCDate()).padStart(2, "0")
		};
	}
	const str = String(rawDob).trim();
	if (!str) return null;
	if (str.includes("T")) {
		const d = new Date(str);
		if (!isNaN(d.getTime())) try {
			const parts = new Intl.DateTimeFormat("en-IN", {
				timeZone: "Asia/Kolkata",
				day: "2-digit",
				month: "2-digit"
			}).formatToParts(d);
			const dayPart = parts.find((p) => p.type === "day")?.value;
			const monthPart = parts.find((p) => p.type === "month")?.value;
			if (dayPart && monthPart) return {
				month: parseInt(monthPart, 10),
				day: dayPart.padStart(2, "0")
			};
		} catch {}
	}
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
	if (!isNaN(d.getTime())) {
		try {
			const parts = new Intl.DateTimeFormat("en-IN", {
				timeZone: "Asia/Kolkata",
				day: "2-digit",
				month: "2-digit"
			}).formatToParts(d);
			const dayPart = parts.find((p) => p.type === "day")?.value;
			const monthPart = parts.find((p) => p.type === "month")?.value;
			if (dayPart && monthPart) return {
				month: parseInt(monthPart, 10),
				day: dayPart.padStart(2, "0")
			};
		} catch {}
		return {
			month: d.getUTCMonth() + 1,
			day: String(d.getUTCDate()).padStart(2, "0")
		};
	}
	return null;
}
function extractEmployeeDob(emp) {
	if (!emp || typeof emp !== "object") return null;
	return parseDobToMonthDay(emp.dob || emp.identity?.dob || emp.dateOfBirth || emp.birthDate || emp.personalDetails?.dob || emp.personalDetails?.dateOfBirth);
}
// src/services/calendarService.js
var calendarService = {
	/**
	* Fetch merged stream of holidays, birthdays, work anniversaries, leaves, and custom events.
	*/
	async getEvents({ year, month, category = "all", department = "all", search = "" } = {}) {
		const params = new URLSearchParams();
		if (year) params.set("year", year);
		if (month) params.set("month", month);
		if (category && category !== "all") params.set("category", category);
		if (department && department !== "all") params.set("department", department);
		if (search) params.set("search", search);
		try {
			return (await apiClient.get(`/calendar/events?${params.toString()}`)).data || [];
		} catch (err) {
			console.warn("Backend calendar events failed, falling back to local store:", err.message);
			const state = hrStore.getState();
			const holidays = state.holidays || [];
			const leaves = state.leaves || [];
			const employees = state.employees || [];
			const targetYear = parseInt(year, 10) || (/* @__PURE__ */ new Date()).getFullYear();
			const events = [];
			holidays.forEach((h) => {
				if (!h.date) return;
				const hYear = parseInt(h.date.slice(0, 4), 10);
				const hMonth = parseInt(h.date.slice(5, 7), 10);
				if (!h.isRecurring && hYear !== targetYear) return;
				if (month && hMonth !== parseInt(month, 10)) return;
				events.push({
					id: String(h.id || h._id),
					entityId: String(h.id || h._id),
					title: h.name || h.title,
					name: h.name || h.title,
					date: h.isRecurring ? `${targetYear}-${h.date.slice(5)}` : h.date,
					endDate: h.endDate ? h.isRecurring ? `${targetYear}-${h.endDate.slice(5)}` : h.endDate : h.date,
					day: h.day,
					category: h.category || h.type || "Company Holiday",
					type: "holiday",
					isPaid: h.isPaid !== false,
					location: h.location || "All Locations",
					applicableDepartments: h.applicableDepartments || ["All"],
					description: h.description || "",
					bannerUrl: h.bannerUrl || null,
					canManage: true
				});
			});
			employees.forEach((emp) => {
				const dobInfo = extractEmployeeDob(emp);
				if (!dobInfo) return;
				const m = dobInfo.month;
				const day = dobInfo.day;
				if (month && m !== parseInt(month, 10)) return;
				const bDate = `${targetYear}-${String(m).padStart(2, "0")}-${day}`;
				events.push({
					id: `bday-${emp.id || emp._id}`,
					title: `${emp.displayName || emp.name}'s Birthday`,
					name: emp.displayName || emp.name,
					date: bDate,
					endDate: bDate,
					allDay: true,
					category: "Employee Birthday",
					type: "birthday",
					department: emp.department || "General",
					isCelebration: true
				});
			});
			employees.forEach((emp) => {
				if (!emp.joiningDate) return;
				const j = new Date(emp.joiningDate);
				if (isNaN(j.getTime())) return;
				const jYear = j.getUTCFullYear();
				const completedYears = targetYear - jYear;
				if (completedYears <= 0) return;
				const m = j.getUTCMonth() + 1;
				const day = String(j.getUTCDate()).padStart(2, "0");
				if (month && m !== parseInt(month, 10)) return;
				const aDate = `${targetYear}-${String(m).padStart(2, "0")}-${day}`;
				events.push({
					id: `anniv-${emp.id || emp._id}`,
					title: `${emp.displayName || emp.name} (${completedYears} Year${completedYears > 1 ? "s" : ""})`,
					name: emp.displayName || emp.name,
					date: aDate,
					endDate: aDate,
					category: "Work Anniversary",
					type: "anniversary",
					completedYears,
					department: emp.department || "General",
					isCelebration: true
				});
			});
			leaves.forEach((l) => {
				if (!l.startDate) return;
				if (l.status && !["approved", "Approved"].includes(l.status)) return;
				if (month) {
					if (parseInt(l.startDate.slice(5, 7), 10) !== parseInt(month, 10)) return;
				}
				events.push({
					id: `leave-${l.id || l._id}`,
					title: `${l.employeeName || "Employee"} (${l.leaveType || "Leave"})`,
					name: l.employeeName,
					date: l.startDate,
					endDate: l.endDate || l.startDate,
					category: "Leave",
					type: "leave",
					status: l.status,
					department: l.department || "General"
				});
			});
			return events.filter((ev) => {
				if (category && category !== "all" && (ev.category || "").toLowerCase() !== category.toLowerCase() && (ev.type || "").toLowerCase() !== category.toLowerCase()) return false;
				if (department && department !== "all") {
					const dept = (ev.department || "").toLowerCase();
					const appDepts = (ev.applicableDepartments || []).map((d) => d.toLowerCase());
					if (dept !== department.toLowerCase() && !appDepts.includes("all") && !appDepts.includes(department.toLowerCase())) return false;
				}
				if (search) {
					const term = search.toLowerCase();
					const matchTitle = (ev.title || "").toLowerCase().includes(term);
					const matchName = (ev.name || "").toLowerCase().includes(term);
					const matchDate = (ev.date || "").includes(term);
					if (!matchTitle && !matchName && !matchDate) return false;
				}
				return true;
			});
		}
	},
	/**
	* Fetch paginated holidays list.
	*/
	async getHolidays(query = {}) {
		const params = new URLSearchParams();
		Object.entries(query).forEach(([k, v]) => {
			if (v !== void 0 && v !== null && v !== "") params.set(k, v);
		});
		try {
			return await apiClient.get(`/calendar/holidays?${params.toString()}`);
		} catch {
			const state = hrStore.getState();
			return {
				success: true,
				data: state.holidays || [],
				total: (state.holidays || []).length
			};
		}
	},
	/**
	* Add a new holiday.
	*/
	async createHoliday(holidayData) {
		const res = await apiClient.post("/calendar/holidays", holidayData);
		if (res.data) hrStore.addHoliday(res.data);
		return res;
	},
	/**
	* Update an existing holiday.
	*/
	async updateHoliday(id, updates) {
		const res = await apiClient.put(`/calendar/holidays/${encodeURIComponent(id)}`, updates);
		const updated = (hrStore.getState().holidays || []).map((h) => String(h.id || h._id) === String(id) ? {
			...h,
			...updates
		} : h);
		hrStore.setState?.({ holidays: updated });
		return res;
	},
	/**
	* Delete a holiday.
	*/
	async deleteHoliday(id) {
		const res = await apiClient.delete(`/calendar/holidays/${encodeURIComponent(id)}`);
		hrStore.deleteHoliday(id);
		return res;
	},
	/**
	* Duplicate a holiday to a new year or date.
	*/
	async duplicateHoliday(id, data) {
		const res = await apiClient.post(`/calendar/holidays/${encodeURIComponent(id)}/duplicate`, data);
		if (res.data) hrStore.addHoliday(res.data);
		return res;
	},
	/**
	* Bulk import holidays.
	*/
	async bulkImportHolidays(rows, dryRun = false) {
		return apiClient.post("/calendar/holidays/bulk-import", {
			rows,
			dryRun
		});
	},
	/**
	* Download CSV or ICS file with offline/local fallback.
	*/
	async downloadExport(format = "csv", year = (/* @__PURE__ */ new Date()).getFullYear()) {
		try {
			const blob = await apiClient.downloadBlob(`/calendar/export?format=${format}&year=${year}`);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `edufyi_holidays_${year}.${format}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.warn("API export failed, generating client-side export fallback:", err.message);
			const holidays = (hrStore.getState().holidays || []).filter((h) => {
				if (!h.date) return false;
				const hYear = parseInt(h.date.slice(0, 4), 10);
				return h.isRecurring || hYear === parseInt(year, 10);
			}).sort((a, b) => a.date.localeCompare(b.date));
			if (format === "ics") {
				const ics = [
					"BEGIN:VCALENDAR",
					"VERSION:2.0",
					"PRODID:-//Edufyi HR//Official Holiday Calendar//EN",
					"CALSCALE:GREGORIAN",
					"METHOD:PUBLISH",
					`X-WR-CALNAME:Edufyi HR Holidays ${year}`,
					"X-WR-TIMEZONE:Asia/Kolkata"
				];
				for (const h of holidays) {
					const dateClean = (h.date || "").replace(/-/g, "");
					const nextDay = new Date(h.endDate || h.date);
					nextDay.setDate(nextDay.getDate() + 1);
					const nextDayClean = nextDay.toISOString().split("T")[0].replace(/-/g, "");
					ics.push("BEGIN:VEVENT", `UID:holiday-${h.id || h._id || Math.random().toString(36).slice(2)}@edufyitech.in`, `DTSTAMP:${(/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`, `DTSTART;VALUE=DATE:${dateClean}`, `DTEND;VALUE=DATE:${nextDayClean}`, `SUMMARY:${(h.name || h.title || "Holiday").replace(/,/g, "\\,")}`, `DESCRIPTION:${(h.description || h.category || "Official Holiday").replace(/,/g, "\\,")}`, `LOCATION:${(h.location || "All Offices").replace(/,/g, "\\,")}`, "STATUS:CONFIRMED", "TRANSP:TRANSPARENT", "END:VEVENT");
				}
				ics.push("END:VCALENDAR");
				const blob = new Blob([ics.join("\r\n")], { type: "text/calendar;charset=utf-8" });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `edufyi_holidays_${year}.ics`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			} else {
				const csvRows = [[
					"Holiday Name",
					"Date",
					"End Date",
					"Category",
					"Location",
					"Departments",
					"Paid/Unpaid",
					"Description"
				].join(",")];
				holidays.forEach((h) => {
					const row = [
						`"${(h.name || h.title || "").replace(/"/g, "\"\"")}"`,
						`"${h.date || ""}"`,
						`"${h.endDate || h.date || ""}"`,
						`"${(h.category || h.type || "Company Holiday").replace(/"/g, "\"\"")}"`,
						`"${(h.location || "All Locations").replace(/"/g, "\"\"")}"`,
						`"${(Array.isArray(h.applicableDepartments) ? h.applicableDepartments.join("; ") : "All").replace(/"/g, "\"\"")}"`,
						`"${h.isPaid !== false ? "Paid" : "Unpaid"}"`,
						`"${(h.description || "").replace(/"/g, "\"\"")}"`
					];
					csvRows.push(row.join(","));
				});
				const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8" });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `edufyi_holidays_${year}.csv`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}
		}
	},
	/**
	* Fetch calendar dashboard widgets.
	*/
	async getWidgets() {
		try {
			return (await apiClient.get("/calendar/widgets")).data;
		} catch {
			return null;
		}
	},
	/**
	* Fetch audit logs.
	*/
	async getAuditLogs(limit = 50) {
		try {
			return (await apiClient.get(`/calendar/audit-logs?limit=${limit}`)).data || [];
		} catch {
			return [];
		}
	},
	/**
	* Create a new smart calendar event (meetings, interviews, deadlines, training, etc.)
	*/
	async createEvent(eventData) {
		return (await apiClient.post("/calendar/events", eventData)).data;
	},
	/**
	* Update an existing event (scope: 'this' | 'series')
	*/
	async updateEvent(eventId, updates, scope = "this") {
		return (await apiClient.put(`/calendar/events/${encodeURIComponent(eventId)}?scope=${scope}`, updates)).data;
	},
	/**
	* Drag-and-drop or quick reschedule
	*/
	async rescheduleEvent(eventId, { date, startTime, endTime }) {
		return (await apiClient.patch(`/calendar/events/${encodeURIComponent(eventId)}`, {
			date,
			startTime,
			endTime
		})).data;
	},
	/**
	* Cancel or soft delete an event
	*/
	async deleteEvent(eventId, reason = "") {
		return await apiClient.delete(`/calendar/events/${encodeURIComponent(eventId)}`, { data: { reason } });
	},
	/**
	* Respond to invitation (RSVP: accepted, declined, tentative)
	*/
	async respondToInvitation(eventId, { status, note = "" }) {
		return (await apiClient.post(`/calendar/events/${encodeURIComponent(eventId)}/respond`, {
			status,
			note
		})).data;
	},
	/**
	* Generate or refresh Google Meet link for an event
	*/
	async generateMeetLink(eventId) {
		return (await apiClient.post(`/calendar/events/${encodeURIComponent(eventId)}/meet`)).data;
	},
	/**
	* Fetch upcoming agenda feed
	*/
	async getUpcomingEvents(limit = 10, scope = "all") {
		try {
			return (await apiClient.get(`/calendar/upcoming?limit=${limit}&scope=${scope}`)).data || [];
		} catch {
			return [];
		}
	},
	/**
	* Fetch calendar scheduling analytics & metrics
	*/
	async getAnalytics() {
		try {
			return (await apiClient.get("/calendar/analytics")).data || null;
		} catch {
			return null;
		}
	},
	/**
	* Fetch user calendar preferences
	*/
	async getPreferences() {
		try {
			return (await apiClient.get("/calendar/preferences")).data || null;
		} catch {
			return null;
		}
	},
	/**
	* Update user calendar preferences
	*/
	async updatePreferences(prefs) {
		return (await apiClient.put("/calendar/preferences", prefs)).data;
	},
	/**
	* Check Google Calendar & Meet integration status
	*/
	async getIntegrations() {
		try {
			return (await apiClient.get("/calendar/integrations")).data || {
				googleConfigured: false,
				isConnected: false
			};
		} catch {
			return {
				googleConfigured: false,
				isConnected: false
			};
		}
	},
	/**
	* Connect Google Calendar / Meet
	*/
	async connectGoogle() {
		return await apiClient.post("/calendar/google/connect");
	},
	/**
	* Disconnect Google Calendar
	*/
	async disconnectGoogle() {
		return await apiClient.post("/calendar/google/disconnect");
	},
	/**
	* Trigger on-demand HR lifecycle sync
	*/
	async syncHRLifecycle(year) {
		return (await apiClient.post("/calendar/sync", { year })).data;
	},
	/**
	* Google Places Autocomplete search
	*/
	async searchPlaces(input) {
		if (!input || input.trim().length < 2) return [];
		try {
			return (await apiClient.get(`/calendar/maps/autocomplete?input=${encodeURIComponent(input.trim())}`)).data || [];
		} catch {
			return [];
		}
	}
};
// src/components/calendar/EventDetailModal.jsx
var import_jsx_runtime = require_jsx_runtime();
function EventDetailModal({ event, onClose, onEdit, onDeleted, onRsvpUpdated, user = null, canManage = false, categoryStyles = {} }) {
	if (!event) return null;
	const [isCopied, setIsCopied] = (0, import_react.useState)(false);
	const [isRsvping, setIsRsvping] = (0, import_react.useState)(false);
	const [rsvpFeedback, setRsvpFeedback] = (0, import_react.useState)("");
	const [showCancelPrompt, setShowCancelPrompt] = (0, import_react.useState)(false);
	const [cancelReason, setCancelReason] = (0, import_react.useState)("");
	const actorId = String(user?.id || user?.employeeId || user?._id || "");
	const isOwner = event.isOwner || event.ownerId === actorId || event.organizer?.employeeId === actorId;
	const hasEditRights = canManage || isOwner;
	const participants = Array.isArray(event.participants) ? event.participants : [];
	const myParticipantRecord = participants.find((p) => p.employeeId === actorId);
	const currentRsvp = myParticipantRecord?.rsvpStatus || event.userRsvp || "none";
	const styleInfo = categoryStyles[event.category] || {
		bg: "#eff6ff",
		text: "#1d4ed8",
		border: "#bfdbfe"
	};
	const handleRsvp = async (status) => {
		setIsRsvping(true);
		try {
			await calendarService.respondToInvitation(event.entityId || event.id, { status });
			setRsvpFeedback(`RSVP marked as ${status.toUpperCase()}!`);
			onRsvpUpdated?.();
			setTimeout(() => setRsvpFeedback(""), 3e3);
		} catch (err) {
			setRsvpFeedback("Failed to update RSVP: " + err.message);
		} finally {
			setIsRsvping(false);
		}
	};
	const handleConfirmCancel = async () => {
		try {
			await calendarService.deleteEvent(event.entityId || event.id, cancelReason);
			onDeleted?.();
			onClose();
		} catch (err) {
			alert("Could not cancel event: " + err.message);
		}
	};
	const handleCopyDetails = () => {
		const meetStr = event.meetingLink?.url ? `\nMeeting Link: ${event.meetingLink.url}` : "";
		const locStr = event.location?.name ? `\nLocation: ${event.location.name} (${event.location.address || ""})` : "";
		const text = `${event.title}\nDate: ${event.date} (${event.startTime || "All Day"})\nCategory: ${event.category}${locStr}${meetStr}\n\n${event.description || ""}`;
		navigator.clipboard?.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2e3);
	};
	const getGCalUrl = () => {
		if (!event.date) return "#";
		const title = encodeURIComponent(event.title || "Event");
		const start = (event.date || "").replace(/-/g, "");
		const d = new Date(event.endDate || event.date);
		d.setDate(d.getDate() + 1);
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${d.toISOString().split("T")[0].replace(/-/g, "")}&details=${encodeURIComponent(`${event.description || ""}\n${event.meetingLink?.url ? "Join Video Call: " + event.meetingLink.url : ""}`)}&location=${encodeURIComponent(event.location?.formattedAddress || event.location?.name || "")}`;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			background: "rgba(15, 23, 42, 0.65)",
			backdropFilter: "blur(4px)",
			zIndex: 1e3,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			style: {
				width: "100%",
				maxWidth: "560px",
				background: "var(--card-bg, #ffffff)",
				borderRadius: "16px",
				padding: "24px",
				boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
				border: "1px solid var(--border, #e2e8f0)",
				maxHeight: "90vh",
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				gap: "16px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							flexWrap: "wrap"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 800,
									textTransform: "uppercase",
									padding: "3px 8px",
									borderRadius: "6px",
									background: styleInfo.bg,
									color: styleInfo.text,
									border: `1px solid ${styleInfo.border}`
								},
								children: event.category
							}),
							event.priority && event.priority !== "normal" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									fontWeight: 700,
									textTransform: "uppercase",
									padding: "2px 6px",
									borderRadius: "4px",
									background: event.priority === "urgent" ? "#fee2e2" : "#fef3c7",
									color: event.priority === "urgent" ? "#b91c1c" : "#b45309"
								},
								children: event.priority
							}),
							event.status === "cancelled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									fontWeight: 700,
									padding: "2px 6px",
									borderRadius: "4px",
									background: "#fee2e2",
									color: "#b91c1c"
								},
								children: "CANCELLED"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: "8px 0 0",
							fontSize: "18px",
							fontWeight: 800,
							color: "var(--ink, #0f172a)"
						},
						children: event.title
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						style: {
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "#64748b",
							padding: "4px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
					})]
				}),
				rsvpFeedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "8px 12px",
						background: "#ecfdf5",
						color: "#065f46",
						borderRadius: "8px",
						fontSize: "12px",
						fontWeight: 600
					},
					children: rsvpFeedback
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px",
						padding: "12px",
						background: "#f8fafc",
						borderRadius: "10px",
						fontSize: "13px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								color: "var(--ink, #0f172a)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
								size: 16,
								color: "var(--teal, #006E6F)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Date:" }),
								" ",
								event.date,
								" ",
								event.endDate && event.endDate !== event.date ? `to ${event.endDate}` : "",
								" (",
								event.day || "",
								")"
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								color: "var(--ink, #0f172a)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
								size: 16,
								color: "var(--teal, #006E6F)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Time:" }),
								" ",
								event.allDay ? "All Day Event" : `${event.startTime12 || event.startTime || "10:00 AM"} - ${event.endTime12 || event.endTime || "11:00 AM"}`
							] })]
						}),
						event.organizer?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								color: "#64748b",
								fontSize: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Organizer: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: event.organizer.name }),
								" (",
								event.organizer.department || "Edufyi",
								")"
							] })]
						})
					]
				}),
				event.meetingLink?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "14px 16px",
						borderRadius: "12px",
						background: "#f0fdf4",
						border: "1px solid #bbf7d0",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "12px",
						flexWrap: "wrap"
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
								borderRadius: "8px",
								background: "#059669",
								color: "#ffffff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 18 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "13px",
								fontWeight: 800,
								color: "#065f46"
							},
							children: event.meetingLink.provider === "google_meet" ? "Google Meet Video Call" : "Online Video Conference"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								color: "#047857"
							},
							children: event.meetingLink.meetCode ? `Code: ${event.meetingLink.meetCode}` : "Ready to connect"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: event.meetingLink.url,
						target: "_blank",
						rel: "noopener noreferrer",
						style: {
							padding: "8px 16px",
							borderRadius: "8px",
							background: "#059669",
							color: "#ffffff",
							textDecoration: "none",
							fontSize: "12px",
							fontWeight: 700,
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Join Call" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
					})]
				}),
				event.location?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "12px 14px",
						borderRadius: "10px",
						background: "#f8fafc",
						border: "1px solid #e2e8f0",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
							size: 16,
							color: "var(--teal, #006E6F)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "13px",
								fontWeight: 700
							},
							children: event.location.name
						}), event.location.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								color: "#64748b"
							},
							children: event.location.address
						})] })]
					}), event.location.mapsUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: event.location.mapsUrl,
						target: "_blank",
						rel: "noopener noreferrer",
						style: {
							fontSize: "11px",
							color: "#0284c7",
							fontWeight: 700,
							textDecoration: "none",
							display: "inline-flex",
							alignItems: "center",
							gap: "3px"
						},
						children: ["Maps ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 11 })]
					})]
				}),
				event.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: "11px",
						fontWeight: 700,
						color: "#64748b",
						textTransform: "uppercase",
						marginBottom: "4px"
					},
					children: "Agenda / Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						padding: "10px 12px",
						background: "#f8fafc",
						borderRadius: "8px",
						fontSize: "12.5px",
						lineHeight: 1.5,
						color: "#334155"
					},
					children: event.description
				})] }),
				participants.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						fontSize: "11px",
						fontWeight: 700,
						color: "#64748b",
						textTransform: "uppercase",
						marginBottom: "6px"
					},
					children: [
						"Participants & RSVPs (",
						participants.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexWrap: "wrap",
						gap: "6px",
						maxHeight: "120px",
						overflowY: "auto"
					},
					children: participants.map((p) => {
						const rsvpColor = p.rsvpStatus === "accepted" ? {
							bg: "#ecfdf5",
							text: "#059669",
							icon: CircleCheck
						} : p.rsvpStatus === "declined" ? {
							bg: "#fee2e2",
							text: "#b91c1c",
							icon: CircleX
						} : p.rsvpStatus === "tentative" ? {
							bg: "#fef3c7",
							text: "#b45309",
							icon: CircleQuestionMark
						} : {
							bg: "#f1f5f9",
							text: "#64748b",
							icon: Clock
						};
						const RsvpIcon = rsvpColor.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "4px 8px",
								borderRadius: "6px",
								background: rsvpColor.bg,
								color: rsvpColor.text,
								fontSize: "11px",
								fontWeight: 600,
								display: "inline-flex",
								alignItems: "center",
								gap: "4px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RsvpIcon, { size: 12 }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.name }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "9px",
										opacity: .8
									},
									children: [
										"(",
										p.rsvpStatus || "pending",
										")"
									]
								})
							]
						}, p.employeeId);
					})
				})] }),
				myParticipantRecord && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "12px 14px",
						borderRadius: "10px",
						background: "#f8fafc",
						border: "1px solid #cbd5e1"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							fontSize: "12px",
							fontWeight: 700,
							marginBottom: "8px",
							color: "#1e293b"
						},
						children: ["Your RSVP Status: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								textTransform: "uppercase",
								color: "var(--teal, #006E6F)"
							},
							children: currentRsvp
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "8px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleRsvp("accepted"),
								disabled: isRsvping,
								style: {
									flex: 1,
									padding: "7px 10px",
									borderRadius: "6px",
									border: currentRsvp === "accepted" ? "2px solid #059669" : "1px solid #cbd5e1",
									background: currentRsvp === "accepted" ? "#ecfdf5" : "#ffffff",
									color: "#059669",
									fontSize: "12px",
									fontWeight: 700,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }), " Accept"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleRsvp("tentative"),
								disabled: isRsvping,
								style: {
									flex: 1,
									padding: "7px 10px",
									borderRadius: "6px",
									border: currentRsvp === "tentative" ? "2px solid #d97706" : "1px solid #cbd5e1",
									background: currentRsvp === "tentative" ? "#fffbeb" : "#ffffff",
									color: "#d97706",
									fontSize: "12px",
									fontWeight: 700,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { size: 13 }), " Tentative"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleRsvp("declined"),
								disabled: isRsvping,
								style: {
									flex: 1,
									padding: "7px 10px",
									borderRadius: "6px",
									border: currentRsvp === "declined" ? "2px solid #dc2626" : "1px solid #cbd5e1",
									background: currentRsvp === "declined" ? "#fef2f2" : "#ffffff",
									color: "#dc2626",
									fontSize: "12px",
									fontWeight: 700,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { size: 13 }), " Decline"]
							})
						]
					})]
				}),
				showCancelPrompt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "14px",
						borderRadius: "10px",
						background: "#fee2e2",
						border: "1px solid #fecaca"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "12px",
								fontWeight: 700,
								color: "#b91c1c",
								marginBottom: "6px"
							},
							children: "Confirm Event Cancellation:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							className: "ui-input",
							placeholder: "Reason for cancellation (optional)...",
							value: cancelReason,
							onChange: (e) => setCancelReason(e.target.value),
							style: { marginBottom: "8px" }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setShowCancelPrompt(false),
								style: {
									fontSize: "11px",
									padding: "4px 10px"
								},
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: handleConfirmCancel,
								style: {
									color: "#b91c1c",
									fontSize: "11px",
									padding: "4px 10px"
								},
								children: "Confirm Cancellation"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "8px",
						borderTop: "1px solid var(--border, #e2e8f0)",
						paddingTop: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: getGCalUrl(),
							target: "_blank",
							rel: "noopener noreferrer",
							style: {
								padding: "6px 12px",
								borderRadius: "6px",
								border: "1px solid #cbd5e1",
								background: "#ffffff",
								fontSize: "11px",
								fontWeight: 600,
								color: "#0284c7",
								textDecoration: "none",
								display: "inline-flex",
								alignItems: "center",
								gap: "4px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 }), " Add to G-Cal"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleCopyDetails,
							style: {
								padding: "6px 12px",
								borderRadius: "6px",
								border: "1px solid #cbd5e1",
								background: "#ffffff",
								fontSize: "11px",
								fontWeight: 600,
								color: "#475569",
								cursor: "pointer",
								display: "inline-flex",
								alignItems: "center",
								gap: "4px"
							},
							children: [isCopied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								size: 12,
								color: "#059669"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isCopied ? "Copied" : "Copy" })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [hasEditRights && event.status !== "cancelled" && event.sourceType !== "holiday" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setShowCancelPrompt(true),
							style: {
								color: "#ef4444",
								fontSize: "11px",
								padding: "6px 12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 }), " Cancel Event"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "primary",
							onClick: () => {
								onEdit?.(event);
								onClose();
							},
							style: {
								fontSize: "11px",
								padding: "6px 14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { size: 13 }), " Edit"]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: onClose,
							style: {
								fontSize: "11px",
								padding: "6px 12px"
							},
							children: "Close"
						})]
					})]
				})
			]
		})
	});
}
// src/components/calendar/EventFormModal.jsx
var EVENT_CATEGORIES = [
	"Company Meeting",
	"Department Meeting",
	"Individual Meeting",
	"Client Meeting",
	"Employee Birthday",
	"Work Anniversary",
	"Company Holiday",
	"Training Session",
	"Interview",
	"Performance Review",
	"Project Deadline",
	"Employee Onboarding",
	"Contract Expiry",
	"Probation Completion",
	"Office Event",
	"Custom Event"
];
function EventFormModal({ isOpen, onClose, onSaved, initialEvent = null, employees = [], departments = [], user = null, defaultDate = null }) {
	if (!isOpen) return null;
	const isEditing = Boolean(initialEvent?.id || initialEvent?._id);
	const [activeTab, setActiveTab] = (0, import_react.useState)("details");
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const [errorMessage, setErrorMessage] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)(initialEvent?.title || "");
	const [description, setDescription] = (0, import_react.useState)(initialEvent?.description || "");
	const [category, setCategory] = (0, import_react.useState)(initialEvent?.category || "Company Meeting");
	const [priority, setPriority] = (0, import_react.useState)(initialEvent?.priority || "normal");
	const [visibility, setVisibility] = (0, import_react.useState)(initialEvent?.visibility || "public");
	const [department, setDepartment] = (0, import_react.useState)(initialEvent?.department || "All");
	const todayKey = defaultDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const [date, setDate] = (0, import_react.useState)(initialEvent?.date || todayKey);
	const [endDate, setEndDate] = (0, import_react.useState)(initialEvent?.endDate || initialEvent?.date || todayKey);
	const [startTime, setStartTime] = (0, import_react.useState)(initialEvent?.startTime || "10:00");
	const [endTime, setEndTime] = (0, import_react.useState)(initialEvent?.endTime || "11:00");
	const [allDay, setAllDay] = (0, import_react.useState)(Boolean(initialEvent?.allDay));
	const [recurrencePattern, setRecurrencePattern] = (0, import_react.useState)(initialEvent?.recurrence?.pattern || "none");
	const [recurrenceInterval, setRecurrenceInterval] = (0, import_react.useState)(initialEvent?.recurrence?.interval || 1);
	const [recurrenceEndDate, setRecurrenceEndDate] = (0, import_react.useState)(initialEvent?.recurrence?.endDate || "");
	const [locationName, setLocationName] = (0, import_react.useState)(initialEvent?.location?.name || "Head Office");
	const [locationAddress, setLocationAddress] = (0, import_react.useState)(initialEvent?.location?.address || "");
	const [locationFormattedAddress, setLocationFormattedAddress] = (0, import_react.useState)(initialEvent?.location?.formattedAddress || "");
	const [latitude, setLatitude] = (0, import_react.useState)(initialEvent?.location?.latitude || null);
	const [longitude, setLongitude] = (0, import_react.useState)(initialEvent?.location?.longitude || null);
	const [isPhysicalLocation, setIsPhysicalLocation] = (0, import_react.useState)(Boolean(initialEvent?.location?.isPhysical));
	const [placeQuery, setPlaceQuery] = (0, import_react.useState)("");
	const [placeSuggestions, setPlaceSuggestions] = (0, import_react.useState)([]);
	const [isSearchingPlaces, setIsSearchingPlaces] = (0, import_react.useState)(false);
	const [meetingUrl, setMeetingUrl] = (0, import_react.useState)(initialEvent?.meetingLink?.url || "");
	const [meetingProvider, setMeetingProvider] = (0, import_react.useState)(initialEvent?.meetingLink?.provider || "none");
	const [autoCreateMeet, setAutoCreateMeet] = (0, import_react.useState)(false);
	const [participants, setParticipants] = (0, import_react.useState)(() => {
		if (Array.isArray(initialEvent?.participants) && initialEvent.participants.length > 0) return initialEvent.participants;
		return [];
	});
	const [participantSearch, setParticipantSearch] = (0, import_react.useState)("");
	const [selectedReminders, setSelectedReminders] = (0, import_react.useState)(() => {
		if (Array.isArray(initialEvent?.reminders) && initialEvent.reminders.length > 0) return initialEvent.reminders.map((r) => r.minutesBefore);
		return [15, 60];
	});
	(0, import_react.useEffect)(() => {
		if (!placeQuery || placeQuery.trim().length < 2) {
			setPlaceSuggestions([]);
			return;
		}
		const timer = setTimeout(async () => {
			setIsSearchingPlaces(true);
			try {
				const results = await calendarService.searchPlaces(placeQuery);
				setPlaceSuggestions(results);
			} catch {
				setPlaceSuggestions([]);
			} finally {
				setIsSearchingPlaces(false);
			}
		}, 300);
		return () => clearTimeout(timer);
	}, [placeQuery]);
	const handleSelectPlace = (place) => {
		setLocationName(place.name || place.mainText || "Meeting Venue");
		setLocationAddress(place.address || place.formattedAddress || "");
		setLocationFormattedAddress(place.formattedAddress || place.description || "");
		if (place.latitude) setLatitude(place.latitude);
		if (place.longitude) setLongitude(place.longitude);
		setIsPhysicalLocation(true);
		setPlaceQuery("");
		setPlaceSuggestions([]);
	};
	const handleAddParticipant = (emp) => {
		const empId = String(emp.employeeId || emp.id || emp._id);
		if (participants.some((p) => p.employeeId === empId)) return;
		setParticipants([...participants, {
			employeeId: empId,
			name: emp.displayName || emp.name,
			email: emp.email || "",
			department: emp.department || "General",
			avatarUrl: emp.avatarUrl || null,
			role: "required",
			rsvpStatus: "pending"
		}]);
		setParticipantSearch("");
	};
	const handleRemoveParticipant = (empId) => {
		setParticipants(participants.filter((p) => p.employeeId !== empId));
	};
	const handleToggleParticipantRole = (empId) => {
		setParticipants(participants.map((p) => {
			if (p.employeeId !== empId) return p;
			return {
				...p,
				role: p.role === "required" ? "optional" : "required"
			};
		}));
	};
	const handleGenerateGoogleMeet = () => {
		setAutoCreateMeet(true);
		setMeetingProvider("google_meet");
		const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
		setMeetingUrl(`https://meet.google.com/${randomCode}`);
	};
	const toggleReminder = (mins) => {
		if (selectedReminders.includes(mins)) setSelectedReminders(selectedReminders.filter((m) => m !== mins));
		else setSelectedReminders([...selectedReminders, mins]);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!title.trim()) {
			setErrorMessage("Please enter an event title.");
			setActiveTab("details");
			return;
		}
		if (!date) {
			setErrorMessage("Please select an event date.");
			setActiveTab("schedule");
			return;
		}
		setErrorMessage("");
		setIsSubmitting(true);
		try {
			const payload = {
				title: title.trim(),
				description: description.trim(),
				category,
				priority,
				visibility,
				department,
				date,
				startDate: date,
				endDate: endDate || date,
				startTime: allDay ? null : startTime,
				endTime: allDay ? null : endTime,
				allDay,
				recurrence: {
					pattern: recurrencePattern,
					interval: Number(recurrenceInterval) || 1,
					endDate: recurrenceEndDate || null
				},
				location: {
					name: locationName,
					address: locationAddress,
					formattedAddress: locationFormattedAddress,
					latitude,
					longitude,
					isPhysical: isPhysicalLocation
				},
				isPhysicalLocation,
				meetingLink: {
					url: meetingUrl.trim(),
					provider: meetingProvider
				},
				meetingUrl: meetingUrl.trim(),
				meetingProvider,
				autoCreateMeet,
				participants,
				reminders: selectedReminders.map((mins) => ({
					minutesBefore: mins,
					channel: "both",
					sent: false
				}))
			};
			if (isEditing) await calendarService.updateEvent(initialEvent.id || initialEvent._id, payload);
			else await calendarService.createEvent(payload);
			onSaved?.();
			onClose();
		} catch (err) {
			setErrorMessage(err.message || "Failed to save event.");
		} finally {
			setIsSubmitting(false);
		}
	};
	const filteredEmployees = employees.filter((emp) => {
		const q = participantSearch.toLowerCase();
		const name = (emp.displayName || emp.name || "").toLowerCase();
		const empId = (emp.employeeId || emp.id || "").toLowerCase();
		const dept = (emp.department || "").toLowerCase();
		return name.includes(q) || empId.includes(q) || dept.includes(q);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			background: "rgba(15, 23, 42, 0.65)",
			backdropFilter: "blur(4px)",
			zIndex: 1e3,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px",
			overflowY: "auto"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			style: {
				width: "100%",
				maxWidth: "720px",
				background: "var(--card-bg, #ffffff)",
				borderRadius: "16px",
				boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
				border: "1px solid var(--border, #e2e8f0)",
				display: "flex",
				flexDirection: "column",
				maxHeight: "90vh",
				overflow: "hidden"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "18px 24px",
						borderBottom: "1px solid var(--border, #e2e8f0)",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						background: "var(--bg, #f8fafc)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: 0,
							fontSize: "18px",
							fontWeight: 800,
							color: "var(--ink, #0f172a)"
						},
						children: isEditing ? "Edit Calendar Event" : "Create Smart Calendar Event"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "12px",
							color: "var(--muted, #64748b)",
							marginTop: "2px"
						},
						children: "Schedule meetings, training, deadlines, or company announcements with automated reminders."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						style: {
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "#64748b",
							padding: "4px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						borderBottom: "1px solid var(--border, #e2e8f0)",
						background: "#ffffff",
						padding: "0 16px",
						overflowX: "auto"
					},
					children: [
						{
							id: "details",
							label: "1. Event Details",
							icon: Calendar
						},
						{
							id: "schedule",
							label: "2. Timing & Recurrence",
							icon: Clock
						},
						{
							id: "location",
							label: "3. Location & Meet",
							icon: MapPin
						},
						{
							id: "participants",
							label: `4. Participants (${participants.length})`,
							icon: Users
						},
						{
							id: "reminders",
							label: "5. Reminders & Notes",
							icon: Bell
						}
					].map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActiveTab(tab.id),
							style: {
								padding: "12px 14px",
								border: "none",
								background: "none",
								fontSize: "12px",
								fontWeight: isActive ? 700 : 500,
								color: isActive ? "var(--teal, #006E6F)" : "var(--muted, #64748b)",
								borderBottom: isActive ? "2px solid var(--teal, #006E6F)" : "2px solid transparent",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								whiteSpace: "nowrap"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })]
						}, tab.id);
					})
				}),
				errorMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "10px 20px",
						background: "#fee2e2",
						color: "#b91c1c",
						fontSize: "12px",
						fontWeight: 600,
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: errorMessage })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					style: {
						display: "flex",
						flexDirection: "column",
						flex: 1,
						overflowY: "auto"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "24px",
							flex: 1
						},
						children: [
							activeTab === "details" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "16px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Event Title",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "ui-input",
											placeholder: "e.g. Q4 Strategy Review, Client Demo, Team Standup",
											value: title,
											onChange: (e) => setTitle(e.target.value),
											required: true
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
											gap: "14px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Category",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												className: "ui-select",
												value: category,
												onChange: (e) => setCategory(e.target.value),
												children: EVENT_CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: c,
													children: c
												}, c))
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Department",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												className: "ui-select",
												value: department,
												onChange: (e) => setDepartment(e.target.value),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "All",
													children: "All Departments"
												}), departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: d.name || d,
													children: d.name || d
												}, d.name || d))]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
											gap: "14px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Priority",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												className: "ui-select",
												value: priority,
												onChange: (e) => setPriority(e.target.value),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "low",
														children: "Low Priority"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "normal",
														children: "Normal"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "high",
														children: "High Priority"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "urgent",
														children: "🚨 Urgent Priority"
													})
												]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Visibility",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												className: "ui-select",
												value: visibility,
												onChange: (e) => setVisibility(e.target.value),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "public",
														children: "Public (Visible to All)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "department",
														children: "Department Only"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "participants_only",
														children: "Participants Only"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "private",
														children: "Private"
													})
												]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Description & Agenda",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											className: "ui-textarea",
											rows: 3,
											placeholder: "Meeting objectives, dial-in guidelines, or agenda notes...",
											value: description,
											onChange: (e) => setDescription(e.target.value)
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											padding: "14px 16px",
											borderRadius: "12px",
											background: meetingUrl ? "#f0fdf4" : "#f8fafc",
											border: meetingUrl ? "1.5px solid #86efac" : "1px dashed #cbd5e1",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											flexWrap: "wrap",
											gap: "12px"
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
													background: meetingUrl ? "#059669" : "#e2e8f0",
													color: meetingUrl ? "#ffffff" : "#64748b",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexShrink: 0
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 18 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: "13px",
													fontWeight: 700,
													color: meetingUrl ? "#065f46" : "var(--ink, #1e293b)"
												},
												children: meetingUrl ? "Google Meet Video Call Attached" : "Google Meet Video Conference"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: "11px",
													color: meetingUrl ? "#047857" : "var(--muted, #64748b)"
												},
												children: meetingUrl ? meetingUrl : "Attach a 1-click Google Meet video link for all participants"
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												gap: "8px",
												alignItems: "center"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: handleGenerateGoogleMeet,
												style: {
													padding: "6px 14px",
													background: "#059669",
													color: "#ffffff",
													border: "none",
													borderRadius: "6px",
													fontSize: "12px",
													fontWeight: 700,
													cursor: "pointer",
													display: "inline-flex",
													alignItems: "center",
													gap: "6px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 13 }), meetingUrl ? "Regenerate Meet" : "Add Google Meet"]
											}), meetingUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => {
													setMeetingUrl("");
													setMeetingProvider("none");
													setAutoCreateMeet(false);
												},
												style: {
													padding: "6px 10px",
													background: "#fee2e2",
													color: "#b91c1c",
													border: "none",
													borderRadius: "6px",
													fontSize: "11px",
													fontWeight: 700,
													cursor: "pointer"
												},
												children: "Remove"
											})]
										})]
									})
								]
							}),
							activeTab === "schedule" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "16px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px",
											padding: "10px 14px",
											background: "#f8fafc",
											borderRadius: "10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											id: "allDayCheckbox",
											checked: allDay,
											onChange: (e) => setAllDay(e.target.checked),
											style: {
												width: "16px",
												height: "16px",
												cursor: "pointer"
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "allDayCheckbox",
											style: {
												fontSize: "13px",
												fontWeight: 600,
												cursor: "pointer"
											},
											children: "All-day event (no specific start/end time)"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
											gap: "14px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Event Date (Start)",
											required: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "date",
												className: "ui-input",
												value: date,
												onChange: (e) => {
													setDate(e.target.value);
													if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
												},
												required: true
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "End Date",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "date",
												className: "ui-input",
												value: endDate,
												min: date,
												onChange: (e) => setEndDate(e.target.value)
											})
										})]
									}),
									!allDay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
											gap: "14px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Start Time",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												className: "ui-input",
												value: startTime,
												onChange: (e) => setStartTime(e.target.value)
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "End Time",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												className: "ui-input",
												value: endTime,
												onChange: (e) => setEndTime(e.target.value)
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											borderTop: "1px solid var(--border, #e2e8f0)",
											paddingTop: "16px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "8px",
												marginBottom: "12px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, {
												size: 16,
												color: "var(--teal, #006E6F)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "13px",
													fontWeight: 700,
													color: "var(--ink, #0f172a)"
												},
												children: "Recurring Schedule"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "grid",
												gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
												gap: "14px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Repeats",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													className: "ui-select",
													value: recurrencePattern,
													onChange: (e) => setRecurrencePattern(e.target.value),
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "none",
															children: "Does not repeat"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "daily",
															children: "Daily"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "weekly",
															children: "Weekly"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "monthly",
															children: "Monthly"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "yearly",
															children: "Yearly"
														})
													]
												})
											}), recurrencePattern !== "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Recurrence End Date",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "date",
													className: "ui-input",
													value: recurrenceEndDate,
													min: date,
													onChange: (e) => setRecurrenceEndDate(e.target.value)
												})
											})]
										})]
									})
								]
							}),
							activeTab === "location" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "20px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "16px",
										borderRadius: "12px",
										background: "#f0fdf4",
										border: "1px solid #bbf7d0"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "12px",
												flexWrap: "wrap",
												gap: "8px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
													size: 18,
													color: "#059669"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													style: {
														fontSize: "13px",
														color: "#065f46"
													},
													children: "Video Conference (Google Meet)"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: handleGenerateGoogleMeet,
												style: {
													padding: "6px 12px",
													background: "#059669",
													color: "#ffffff",
													border: "none",
													borderRadius: "6px",
													fontSize: "11px",
													fontWeight: 700,
													cursor: "pointer",
													display: "flex",
													alignItems: "center",
													gap: "5px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: meetingUrl ? "Regenerate Meet" : "Generate Google Meet" })]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Meeting Link / URL",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "url",
												className: "ui-input",
												placeholder: "https://meet.google.com/xxx-xxxx-xxx or Zoom / Teams link",
												value: meetingUrl,
												onChange: (e) => {
													setMeetingUrl(e.target.value);
													if (e.target.value.includes("meet.google.com")) setMeetingProvider("google_meet");
													else if (e.target.value.includes("zoom.us")) setMeetingProvider("zoom");
													else if (e.target.value.includes("teams.microsoft.com")) setMeetingProvider("teams");
													else if (e.target.value) setMeetingProvider("custom");
													else setMeetingProvider("none");
												}
											})
										}),
										meetingUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												marginTop: "8px",
												display: "flex",
												alignItems: "center",
												gap: "8px"
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: meetingUrl,
												target: "_blank",
												rel: "noopener noreferrer",
												style: {
													fontSize: "12px",
													color: "#0284c7",
													fontWeight: 600,
													display: "inline-flex",
													alignItems: "center",
													gap: "4px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 13 }), " Test Meeting Link"]
											})
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "16px",
										borderRadius: "12px",
										background: "#f8fafc",
										border: "1px solid #e2e8f0"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "8px",
												marginBottom: "12px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												size: 18,
												color: "var(--teal, #006E6F)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: {
													fontSize: "13px",
													color: "var(--ink, #0f172a)"
												},
												children: "Physical Meeting Location & Google Maps"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												position: "relative",
												marginBottom: "14px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Search Location / Places",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													className: "ui-input",
													placeholder: "Search office campuses, conference halls, hotels, client locations...",
													value: placeQuery,
													onChange: (e) => setPlaceQuery(e.target.value)
												})
											}), placeSuggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													position: "absolute",
													top: "100%",
													left: 0,
													right: 0,
													background: "#ffffff",
													borderRadius: "8px",
													boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
													border: "1px solid #e2e8f0",
													zIndex: 10,
													maxHeight: "220px",
													overflowY: "auto"
												},
												children: placeSuggestions.map((place, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													onClick: () => handleSelectPlace(place),
													style: {
														padding: "10px 14px",
														cursor: "pointer",
														borderBottom: "1px solid #f1f5f9",
														fontSize: "12px"
													},
													onMouseEnter: (e) => e.currentTarget.style.background = "#f8fafc",
													onMouseLeave: (e) => e.currentTarget.style.background = "#ffffff",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															fontWeight: 700,
															color: "var(--ink, #0f172a)"
														},
														children: place.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															fontSize: "11px",
															color: "var(--muted, #64748b)"
														},
														children: place.address
													})]
												}, idx))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "grid",
												gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
												gap: "14px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Venue Name",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													className: "ui-input",
													value: locationName,
													onChange: (e) => {
														setLocationName(e.target.value);
														setIsPhysicalLocation(true);
													},
													placeholder: "e.g. Ignite Campus Boardroom"
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Address",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "text",
													className: "ui-input",
													value: locationAddress,
													onChange: (e) => {
														setLocationAddress(e.target.value);
														setIsPhysicalLocation(true);
													},
													placeholder: "Street, Landmark, City"
												})
											})]
										}),
										(locationAddress || locationName) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: { marginTop: "10px" },
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: calendarService.searchPlaces ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locationName}, ${locationAddress}`)}` : "#",
												target: "_blank",
												rel: "noopener noreferrer",
												style: {
													fontSize: "12px",
													color: "#0284c7",
													fontWeight: 600,
													display: "inline-flex",
													alignItems: "center",
													gap: "4px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 13 }), " Open in Google Maps"]
											})
										})
									]
								})]
							}),
							activeTab === "participants" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "16px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Search & Add Participants",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "ui-input",
											placeholder: "Search employee by name, ID, or department...",
											value: participantSearch,
											onChange: (e) => setParticipantSearch(e.target.value)
										})
									}),
									participantSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											maxHeight: "180px",
											overflowY: "auto",
											border: "1px solid var(--border, #e2e8f0)",
											borderRadius: "8px",
											background: "#ffffff"
										},
										children: filteredEmployees.slice(0, 8).map((emp) => {
											const empId = String(emp.employeeId || emp.id || emp._id);
											const isAdded = participants.some((p) => p.employeeId === empId);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												onClick: () => !isAdded && handleAddParticipant(emp),
												style: {
													padding: "8px 12px",
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
													borderBottom: "1px solid #f1f5f9",
													cursor: isAdded ? "default" : "pointer",
													opacity: isAdded ? .5 : 1
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													style: { fontSize: "12px" },
													children: emp.displayName || emp.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														fontSize: "10px",
														color: "#64748b"
													},
													children: [
														emp.employeeId,
														" • ",
														emp.department || "General"
													]
												})] }), isAdded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "11px",
														color: "#059669",
														fontWeight: 600
													},
													children: "Added"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "11px",
														color: "var(--teal, #006E6F)",
														fontWeight: 700
													},
													children: "+ Add"
												})]
											}, empId);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "12px",
											fontWeight: 700,
											color: "var(--muted, #64748b)",
											marginBottom: "8px"
										},
										children: [
											"Scheduled Participants (",
											participants.length,
											")"
										]
									}), participants.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											padding: "20px",
											textAlign: "center",
											color: "#94a3b8",
											fontSize: "12px",
											border: "1px dashed #cbd5e1",
											borderRadius: "8px"
										},
										children: "No participants added yet. Use the search bar above to invite team members."
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											display: "flex",
											flexDirection: "column",
											gap: "8px"
										},
										children: participants.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												padding: "8px 12px",
												borderRadius: "8px",
												background: "#f8fafc",
												border: "1px solid #e2e8f0",
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: "12px",
													fontWeight: 700
												},
												children: p.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													fontSize: "10px",
													color: "#64748b"
												},
												children: [
													p.employeeId,
													" • ",
													p.department
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleToggleParticipantRole(p.employeeId),
													style: {
														padding: "2px 8px",
														borderRadius: "4px",
														border: "1px solid #cbd5e1",
														background: p.role === "required" ? "#e0f2fe" : "#f1f5f9",
														color: p.role === "required" ? "#0369a1" : "#475569",
														fontSize: "10px",
														fontWeight: 700,
														cursor: "pointer"
													},
													children: p.role === "required" ? "Required" : "Optional"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => handleRemoveParticipant(p.employeeId),
													style: {
														background: "none",
														border: "none",
														color: "#ef4444",
														cursor: "pointer"
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 15 })
												})]
											})]
										}, p.employeeId))
									})] })
								]
							}),
							activeTab === "reminders" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "16px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "13px",
										fontWeight: 700,
										color: "var(--ink, #0f172a)",
										display: "block",
										marginBottom: "8px"
									},
									children: "Automated Event Reminders (Email & In-App)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
										gap: "10px"
									},
									children: [
										{
											mins: 5,
											label: "5 minutes before"
										},
										{
											mins: 15,
											label: "15 minutes before"
										},
										{
											mins: 30,
											label: "30 minutes before"
										},
										{
											mins: 60,
											label: "1 hour before"
										},
										{
											mins: 1440,
											label: "1 day before"
										}
									].map((rem) => {
										const isChecked = selectedReminders.includes(rem.mins);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											onClick: () => toggleReminder(rem.mins),
											style: {
												padding: "10px 14px",
												borderRadius: "8px",
												border: `1px solid ${isChecked ? "var(--teal, #006E6F)" : "#e2e8f0"}`,
												background: isChecked ? "#f0fdfa" : "#ffffff",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "8px",
												fontSize: "12px",
												fontWeight: isChecked ? 700 : 500,
												color: isChecked ? "var(--teal, #006E6F)" : "var(--ink, #0f172a)"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: isChecked,
												onChange: () => {},
												style: { cursor: "pointer" }
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: rem.label })]
										}, rem.mins);
									})
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "14px",
										borderRadius: "10px",
										background: "#f8fafc",
										border: "1px solid #e2e8f0",
										fontSize: "12px",
										color: "#64748b"
									},
									children: [
										"💡 ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Smart Notification Rule:" }),
										" Reminders are dispatched in the background with idempotency guarantees to prevent duplicate emails and bell alerts."
									]
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "16px 24px",
							borderTop: "1px solid var(--border, #e2e8f0)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							background: "var(--bg, #f8fafc)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "8px"
							},
							children: [activeTab !== "details" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => {
									const tabs = [
										"details",
										"schedule",
										"location",
										"participants",
										"reminders"
									];
									const prevIdx = tabs.indexOf(activeTab) - 1;
									if (prevIdx >= 0) setActiveTab(tabs[prevIdx]);
								},
								style: {
									fontSize: "12px",
									padding: "6px 14px"
								},
								children: "Back"
							}), activeTab !== "reminders" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => {
									const tabs = [
										"details",
										"schedule",
										"location",
										"participants",
										"reminders"
									];
									const nextIdx = tabs.indexOf(activeTab) + 1;
									if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx]);
								},
								style: {
									fontSize: "12px",
									padding: "6px 14px"
								},
								children: "Next Step"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								onClick: onClose,
								style: {
									fontSize: "12px",
									padding: "6px 14px"
								},
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "primary",
								disabled: isSubmitting,
								style: {
									fontSize: "12px",
									padding: "8px 18px",
									fontWeight: 700
								},
								children: isSubmitting ? "Saving..." : isEditing ? "Update Event" : "Create Event"
							})]
						})]
					})]
				})
			]
		})
	});
}
// src/components/calendar/UpcomingEventsView.jsx
function UpcomingEventsView({ events = [], onSelectEvent, categoryStyles = {} }) {
	const toLocalDateStr = (d = /* @__PURE__ */ new Date()) => {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	};
	const todayStr = toLocalDateStr(/* @__PURE__ */ new Date());
	const tomorrow = /* @__PURE__ */ new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowStr = toLocalDateStr(tomorrow);
	const sevenDaysAhead = /* @__PURE__ */ new Date();
	sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);
	const sevenDaysAheadStr = toLocalDateStr(sevenDaysAhead);
	const upcomingList = events.filter((e) => e.date >= todayStr && e.status !== "cancelled").sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""));
	const todayEvents = upcomingList.filter((e) => e.date === todayStr);
	const tomorrowEvents = upcomingList.filter((e) => e.date === tomorrowStr);
	const thisWeekEvents = upcomingList.filter((e) => e.date > tomorrowStr && e.date <= sevenDaysAheadStr);
	const futureEvents = upcomingList.filter((e) => e.date > sevenDaysAheadStr);
	const renderEventCard = (ev) => {
		const styleInfo = categoryStyles[ev.category] || {
			bg: "#eff6ff",
			text: "#1d4ed8",
			border: "#bfdbfe"
		};
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: () => onSelectEvent(ev),
			style: {
				padding: "16px",
				borderRadius: "12px",
				background: "#ffffff",
				border: "1px solid var(--border, #e2e8f0)",
				boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
				cursor: "pointer",
				transition: "all 0.2s ease",
				display: "flex",
				flexDirection: "column",
				gap: "10px"
			},
			onMouseEnter: (e) => {
				e.currentTarget.style.borderColor = "var(--teal, #006E6F)";
				e.currentTarget.style.transform = "translateY(-2px)";
			},
			onMouseLeave: (e) => {
				e.currentTarget.style.borderColor = "var(--border, #e2e8f0)";
				e.currentTarget.style.transform = "none";
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px",
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10px",
								fontWeight: 800,
								textTransform: "uppercase",
								padding: "2px 7px",
								borderRadius: "4px",
								background: styleInfo.bg,
								color: styleInfo.text,
								border: `1px solid ${styleInfo.border}`
							},
							children: ev.category
						}), ev.priority === "urgent" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "9px",
								fontWeight: 800,
								padding: "2px 5px",
								borderRadius: "4px",
								background: "#fee2e2",
								color: "#b91c1c"
							},
							children: "URGENT"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							fontWeight: 700,
							color: "var(--teal, #006E6F)"
						},
						children: ev.allDay ? "All Day" : ev.startTime12 || ev.startTime || "Scheduled"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					style: {
						margin: "0 0 4px",
						fontSize: "14px",
						fontWeight: 700,
						color: "var(--ink, #0f172a)"
					},
					children: ev.title
				}), ev.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: 0,
						fontSize: "12px",
						color: "#64748b",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap"
					},
					children: ev.description
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						fontSize: "11px",
						color: "#64748b",
						borderTop: "1px solid #f1f5f9",
						paddingTop: "8px",
						flexWrap: "wrap",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
							size: 13,
							color: "var(--teal, #006E6F)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							ev.date,
							" (",
							ev.day || "",
							")"
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [ev.meetingLink?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								color: "#059669",
								fontWeight: 700,
								display: "inline-flex",
								alignItems: "center",
								gap: "3px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 13 }), " Video Call"]
						}), ev.location?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								color: "#0284c7",
								display: "inline-flex",
								alignItems: "center",
								gap: "3px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 13 }),
								" ",
								ev.location.name
							]
						})]
					})]
				})
			]
		}, ev.id || ev._id);
	};
	const renderGroup = (title, items, badgeColor) => {
		if (items.length === 0) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: "12px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: "13px",
						fontWeight: 800,
						color: "var(--ink, #0f172a)",
						letterSpacing: "0.02em"
					},
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: "11px",
						fontWeight: 700,
						padding: "1px 7px",
						borderRadius: "9999px",
						background: badgeColor.bg,
						color: badgeColor.text
					},
					children: items.length
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
					gap: "14px"
				},
				children: items.map(renderEventCard)
			})]
		});
	};
	if (upcomingList.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			padding: "48px 24px",
			textAlign: "center",
			background: "#ffffff",
			borderRadius: "14px",
			border: "1px solid #e2e8f0"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
				size: 36,
				color: "#94a3b8",
				style: { margin: "0 auto 12px" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				style: {
					margin: "0 0 6px",
					fontSize: "16px",
					fontWeight: 700,
					color: "var(--ink, #0f172a)"
				},
				children: "No Upcoming Events Scheduled"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				style: {
					margin: 0,
					fontSize: "13px",
					color: "#64748b"
				},
				children: "Your schedule is clear! Click \"+ Schedule Event\" above to plan a meeting, interview, or team session."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "24px"
		},
		children: [
			renderGroup("Happening Today", todayEvents, {
				bg: "#fee2e2",
				text: "#b91c1c"
			}),
			renderGroup("Tomorrow", tomorrowEvents, {
				bg: "#fef3c7",
				text: "#b45309"
			}),
			renderGroup("This Week (Next 7 Days)", thisWeekEvents, {
				bg: "#e0f2fe",
				text: "#0369a1"
			}),
			renderGroup("Upcoming Later", futureEvents, {
				bg: "#f1f5f9",
				text: "#475569"
			})
		]
	});
}
// src/components/calendar/WeeklyCalendarView.jsx
var HOURS$1 = [
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20
];
function formatHour$1(hour) {
	const ampm = hour >= 12 ? "PM" : "AM";
	return `${hour % 12 || 12} ${ampm}`;
}
function WeeklyCalendarView({ currentDate, events = [], onSelectEvent, onQuickCreate, categoryStyles = {} }) {
	const curr = new Date(currentDate);
	const day = curr.getDay();
	const sunday = new Date(curr);
	sunday.setDate(curr.getDate() - day);
	const toLocalDateStr = (d) => {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	};
	const todayStr = toLocalDateStr(/* @__PURE__ */ new Date());
	const weekDays = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(sunday);
		d.setDate(sunday.getDate() + i);
		const dateStr = toLocalDateStr(d);
		return {
			date: d,
			dateStr,
			dayNum: d.getDate(),
			dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
			isToday: dateStr === todayStr
		};
	});
	const eventsByDate = /* @__PURE__ */ new Map();
	events.forEach((ev) => {
		if (!ev.date) return;
		if (!eventsByDate.has(ev.date)) eventsByDate.set(ev.date, []);
		eventsByDate.get(ev.date).push(ev);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			background: "#ffffff",
			borderRadius: "14px",
			border: "1px solid var(--border, #e2e8f0)",
			overflowX: "auto",
			boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				minWidth: "750px",
				display: "flex",
				flexDirection: "column"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "70px repeat(7, 1fr)",
						borderBottom: "1px solid #e2e8f0",
						background: "#f8fafc"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: "12px 8px",
							fontSize: "11px",
							fontWeight: 700,
							color: "#64748b",
							textAlign: "center"
						},
						children: "Time"
					}), weekDays.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "10px 8px",
							textAlign: "center",
							borderLeft: "1px solid #e2e8f0",
							background: d.isToday ? "#f0fdfa" : "transparent"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								fontWeight: 700,
								color: d.isToday ? "var(--teal, #006E6F)" : "#64748b",
								textTransform: "uppercase"
							},
							children: d.dayName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								width: "26px",
								height: "26px",
								borderRadius: "50%",
								background: d.isToday ? "var(--teal, #006E6F)" : "transparent",
								color: d.isToday ? "#ffffff" : "var(--ink, #0f172a)",
								fontWeight: 800,
								fontSize: "13px",
								marginTop: "2px"
							},
							children: d.dayNum
						})]
					}, d.dateStr))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "70px repeat(7, 1fr)",
						borderBottom: "2px solid #e2e8f0",
						minHeight: "36px",
						background: "#fafafa"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: "8px",
							fontSize: "10px",
							fontWeight: 700,
							color: "#94a3b8",
							textAlign: "center"
						},
						children: "All-Day"
					}), weekDays.map((d) => {
						const dayEvents = (eventsByDate.get(d.dateStr) || []).filter((e) => e.allDay || !e.startTime);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								borderLeft: "1px solid #e2e8f0",
								padding: "4px",
								display: "flex",
								flexDirection: "column",
								gap: "3px"
							},
							children: dayEvents.map((ev) => {
								const styleInfo = categoryStyles[ev.category] || {
									bg: "#eff6ff",
									text: "#1d4ed8",
									border: "#bfdbfe"
								};
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									onClick: () => onSelectEvent(ev),
									style: {
										padding: "2px 5px",
										borderRadius: "4px",
										background: styleInfo.bg,
										color: styleInfo.text,
										border: `1px solid ${styleInfo.border}`,
										fontSize: "10px",
										fontWeight: 700,
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis",
										cursor: "pointer"
									},
									title: ev.title,
									children: ev.title
								}, ev.id || ev._id);
							})
						}, d.dateStr);
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { position: "relative" },
					children: HOURS$1.map((hour) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "70px repeat(7, 1fr)",
							borderBottom: "1px solid #f1f5f9",
							minHeight: "52px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "6px 8px",
								fontSize: "10px",
								color: "#94a3b8",
								fontWeight: 600,
								textAlign: "center"
							},
							children: formatHour$1(hour)
						}), weekDays.map((d) => {
							const hourEvents = (eventsByDate.get(d.dateStr) || []).filter((e) => {
								if (e.allDay || !e.startTime) return false;
								const [h] = e.startTime.split(":").map(Number);
								return h === hour;
							});
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								onClick: () => onQuickCreate?.(d.dateStr, `${String(hour).padStart(2, "0")}:00`),
								style: {
									borderLeft: "1px solid #f1f5f9",
									padding: "2px 4px",
									display: "flex",
									flexDirection: "column",
									gap: "3px",
									cursor: "pointer"
								},
								children: hourEvents.map((ev) => {
									const styleInfo = categoryStyles[ev.category] || {
										bg: "#eff6ff",
										text: "#1d4ed8",
										border: "#bfdbfe"
									};
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: (e) => {
											e.stopPropagation();
											onSelectEvent(ev);
										},
										style: {
											padding: "4px 6px",
											borderRadius: "5px",
											background: styleInfo.bg,
											color: styleInfo.text,
											border: `1px solid ${styleInfo.border}`,
											fontSize: "11px",
											fontWeight: 700,
											lineHeight: 1.2,
											cursor: "pointer",
											boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
										},
										title: `${ev.title} (${ev.startTime || ""})`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												gap: "4px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap"
												},
												children: ev.title
											}), ev.meetingLink?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 10 })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "9px",
												opacity: .8,
												marginTop: "2px"
											},
											children: ev.startTime12 || ev.startTime
										})]
									}, ev.id || ev._id);
								})
							}, d.dateStr);
						})]
					}, hour))
				})
			]
		})
	});
}
// src/components/calendar/DailyCalendarView.jsx
var HOURS = [
	8,
	9,
	10,
	11,
	12,
	13,
	14,
	15,
	16,
	17,
	18,
	19,
	20
];
function formatHour(hour) {
	const ampm = hour >= 12 ? "PM" : "AM";
	return `${hour % 12 || 12}:00 ${ampm}`;
}
function DailyCalendarView({ selectedDate, events = [], onSelectEvent, onQuickCreate, categoryStyles = {} }) {
	const toLocalDateStr = (d = /* @__PURE__ */ new Date()) => {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	};
	const isToday = selectedDate === toLocalDateStr(/* @__PURE__ */ new Date());
	const currentHour = (/* @__PURE__ */ new Date()).getHours();
	const dayEvents = events.filter((ev) => ev.date === selectedDate && ev.status !== "cancelled");
	const allDayEvents = dayEvents.filter((ev) => ev.allDay || !ev.startTime);
	const timedEvents = dayEvents.filter((ev) => !ev.allDay && ev.startTime);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			background: "#ffffff",
			borderRadius: "14px",
			border: "1px solid var(--border, #e2e8f0)",
			boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
			overflow: "hidden",
			display: "flex",
			flexDirection: "column"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "16px 20px",
					background: isToday ? "#f0fdfa" : "#f8fafc",
					borderBottom: "1px solid #e2e8f0",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
						size: 20,
						color: "var(--teal, #006E6F)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: 0,
							fontSize: "16px",
							fontWeight: 800,
							color: "var(--ink, #0f172a)"
						},
						children: (() => {
							const [y, m, d] = (selectedDate || "").split("-").map(Number);
							return (y && m && d ? new Date(y, m - 1, d) : /* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
								weekday: "long",
								month: "long",
								day: "numeric",
								year: "numeric"
							});
						})()
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "12px",
							color: isToday ? "var(--teal, #006E6F)" : "#64748b",
							fontWeight: 600
						},
						children: [
							isToday ? "Today" : "Daily Schedule",
							" • ",
							dayEvents.length,
							" Event(s)"
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "primary",
					onClick: () => onQuickCreate?.(selectedDate, "10:00"),
					style: {
						fontSize: "12px",
						padding: "6px 14px",
						display: "inline-flex",
						alignItems: "center",
						gap: "5px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), " Schedule on this Day"]
				})]
			}),
			allDayEvents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "12px 20px",
					background: "#fafafa",
					borderBottom: "1px solid #e2e8f0",
					display: "flex",
					flexDirection: "column",
					gap: "6px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: "11px",
						fontWeight: 700,
						color: "#64748b",
						textTransform: "uppercase"
					},
					children: "All-Day Events & Holidays"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexWrap: "wrap",
						gap: "8px"
					},
					children: allDayEvents.map((ev) => {
						const styleInfo = categoryStyles[ev.category] || {
							bg: "#eff6ff",
							text: "#1d4ed8",
							border: "#bfdbfe"
						};
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: () => onSelectEvent(ev),
							style: {
								padding: "6px 12px",
								borderRadius: "6px",
								background: styleInfo.bg,
								color: styleInfo.text,
								border: `1px solid ${styleInfo.border}`,
								fontSize: "12px",
								fontWeight: 700,
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ev.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "10px",
									opacity: .8
								},
								children: [
									"(",
									ev.category,
									")"
								]
							})]
						}, ev.id || ev._id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: { position: "relative" },
				children: HOURS.map((hour) => {
					const matchingEvents = timedEvents.filter((ev) => {
						const [h] = ev.startTime.split(":").map(Number);
						return h === hour;
					});
					const isCurrentHourSlot = isToday && currentHour === hour;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "90px 1fr",
							borderBottom: "1px solid #f1f5f9",
							minHeight: "64px",
							background: isCurrentHourSlot ? "#f0fdfa" : "transparent"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "12px 14px",
								fontSize: "11px",
								color: isCurrentHourSlot ? "var(--teal, #006E6F)" : "#94a3b8",
								fontWeight: isCurrentHourSlot ? 800 : 600,
								textAlign: "right",
								borderRight: "1px solid #e2e8f0"
							},
							children: formatHour(hour)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							onClick: () => onQuickCreate?.(selectedDate, `${String(hour).padStart(2, "0")}:00`),
							style: {
								padding: "8px 16px",
								display: "flex",
								flexDirection: "column",
								gap: "6px",
								cursor: "pointer"
							},
							children: matchingEvents.map((ev) => {
								const styleInfo = categoryStyles[ev.category] || {
									bg: "#eff6ff",
									text: "#1d4ed8",
									border: "#bfdbfe"
								};
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									onClick: (e) => {
										e.stopPropagation();
										onSelectEvent(ev);
									},
									style: {
										padding: "10px 14px",
										borderRadius: "8px",
										background: styleInfo.bg,
										color: styleInfo.text,
										border: `1px solid ${styleInfo.border}`,
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: "12px",
										cursor: "pointer",
										boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "13px",
											fontWeight: 800
										},
										children: ev.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11px",
											opacity: .85,
											marginTop: "2px",
											display: "flex",
											alignItems: "center",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											ev.startTime12 || ev.startTime,
											" - ",
											ev.endTime12 || ev.endTime || "End"
										] }), ev.location?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["• 📍 ", ev.location.name] })]
									})] }), ev.meetingLink?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: ev.meetingLink.url,
										target: "_blank",
										rel: "noopener noreferrer",
										onClick: (e) => e.stopPropagation(),
										style: {
											padding: "4px 10px",
											borderRadius: "6px",
											background: "#059669",
											color: "#ffffff",
											textDecoration: "none",
											fontSize: "11px",
											fontWeight: 700,
											display: "inline-flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 12 }), " Join Call"]
									})]
								}, ev.id || ev._id);
							})
						})]
					}, hour);
				})
			})
		]
	});
}
// src/components/calendar/EnterpriseCalendar.jsx
function formatLocation(loc) {
	if (!loc) return "";
	if (typeof loc === "string") return loc;
	if (typeof loc === "object") return loc.name || loc.formattedAddress || loc.address || "Office";
	return String(loc);
}
var CATEGORY_COLORS = {
	"National Holiday": {
		bg: "#e0f2fe",
		text: "#0369a1",
		border: "#bae6fd",
		badge: "info"
	},
	"Public Holiday": {
		bg: "#e0f2fe",
		text: "#0284c7",
		border: "#bae6fd",
		badge: "info"
	},
	"Regional Holiday": {
		bg: "#ede9fe",
		text: "#6d28d9",
		border: "#ddd6fe",
		badge: "neutral"
	},
	"Festival": {
		bg: "#fef3c7",
		text: "#b45309",
		border: "#fde68a",
		badge: "warning"
	},
	"Company Holiday": {
		bg: "#ccfbf1",
		text: "#0f766e",
		border: "#99f6e4",
		badge: "success"
	},
	"Optional Holiday": {
		bg: "#f1f5f9",
		text: "#475569",
		border: "#e2e8f0",
		badge: "neutral"
	},
	"Restricted Holiday": {
		bg: "#ffedd5",
		text: "#c2410c",
		border: "#fed7aa",
		badge: "warning"
	},
	"Special Holiday": {
		bg: "#fae8ff",
		text: "#a21caf",
		border: "#f5d0fe",
		badge: "neutral"
	},
	"Emergency Holiday": {
		bg: "#fee2e2",
		text: "#b91c1c",
		border: "#fecaca",
		badge: "danger"
	},
	"Birthday": {
		bg: "#fdf2f8",
		text: "#db2777",
		border: "#fbcfe8",
		badge: "warning"
	},
	"Employee Birthday": {
		bg: "#fdf2f8",
		text: "#db2777",
		border: "#fbcfe8",
		badge: "warning"
	},
	"Work Anniversary": {
		bg: "#fffbeb",
		text: "#d97706",
		border: "#fef3c7",
		badge: "warning"
	},
	"Leave": {
		bg: "#f5f3ff",
		text: "#7c3aed",
		border: "#ddd6fe",
		badge: "neutral"
	},
	"Event": {
		bg: "#ecfdf5",
		text: "#059669",
		border: "#a7f3d0",
		badge: "success"
	},
	"Meeting": {
		bg: "#eff6ff",
		text: "#1d4ed8",
		border: "#bfdbfe",
		badge: "info"
	},
	"Company Meeting": {
		bg: "#eff6ff",
		text: "#1d4ed8",
		border: "#bfdbfe",
		badge: "info"
	},
	"Department Meeting": {
		bg: "#e0e7ff",
		text: "#4338ca",
		border: "#c7d2fe",
		badge: "info"
	},
	"Individual Meeting": {
		bg: "#f0fdf4",
		text: "#15803d",
		border: "#bbf7d0",
		badge: "success"
	},
	"Client Meeting": {
		bg: "#fdf4ff",
		text: "#a21caf",
		border: "#f5d0fe",
		badge: "neutral"
	},
	"Training": {
		bg: "#f0fdf4",
		text: "#15803d",
		border: "#bbf7d0",
		badge: "success"
	},
	"Training Session": {
		bg: "#f0fdf4",
		text: "#15803d",
		border: "#bbf7d0",
		badge: "success"
	},
	"Interview": {
		bg: "#fff7ed",
		text: "#c2410c",
		border: "#ffedd5",
		badge: "warning"
	},
	"Performance Review": {
		bg: "#f5f3ff",
		text: "#6d28d9",
		border: "#ddd6fe",
		badge: "neutral"
	},
	"Project Deadline": {
		bg: "#fef2f2",
		text: "#dc2626",
		border: "#fecaca",
		badge: "danger"
	},
	"Employee Onboarding": {
		bg: "#f0fdfa",
		text: "#0d9488",
		border: "#99f6e4",
		badge: "success"
	},
	"Office Event": {
		bg: "#ecfdf5",
		text: "#059669",
		border: "#a7f3d0",
		badge: "success"
	},
	"Custom Event": {
		bg: "#f8fafc",
		text: "#334155",
		border: "#e2e8f0",
		badge: "neutral"
	},
	"Announcement": {
		bg: "#f8fafc",
		text: "#334155",
		border: "#e2e8f0",
		badge: "neutral"
	}
};
var ALL_CATEGORIES = [
	"National Holiday",
	"Public Holiday",
	"Regional Holiday",
	"Festival",
	"Company Holiday",
	"Optional Holiday",
	"Restricted Holiday",
	"Special Holiday",
	"Emergency Holiday"
];
var MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
var DAY_NAMES = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
function EnterpriseCalendar({ canManage = false, user = null, defaultView = "month" }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const getLocalDateStr = (d = /* @__PURE__ */ new Date()) => {
		const dateObj = typeof d === "string" ? new Date(d) : d;
		if (isNaN(dateObj.getTime())) return "";
		return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;
	};
	const formatDateKey = (y, m1, d) => `${y}-${String(m1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
	const [currentDate, setCurrentDate] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(() => {
		const now = /* @__PURE__ */ new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
	});
	const [widgetsData, setWidgetsData] = (0, import_react.useState)(null);
	const [viewMode, setViewMode] = (0, import_react.useState)(defaultView);
	const [categoryFilter, setCategoryFilter] = (0, import_react.useState)("all");
	const [departmentFilter, setDepartmentFilter] = (0, import_react.useState)("all");
	const [scopeFilter, setScopeFilter] = (0, import_react.useState)("all");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [events, setEvents] = (0, import_react.useState)([]);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [showLeaves, setShowLeaves] = (0, import_react.useState)(true);
	const [copiedNotice, setCopiedNotice] = (0, import_react.useState)(false);
	const syncCalendarDate = (targetYear, targetMonthIndex, preferredDay = null) => {
		const targetMonth1 = targetMonthIndex + 1;
		const daysInTargetMonth = new Date(targetYear, targetMonth1, 0).getDate();
		const currentSelectedDay = preferredDay !== null ? preferredDay : parseInt((selectedDate || "").split("-")[2], 10) || 1;
		const clampedDay = Math.min(Math.max(1, currentSelectedDay), daysInTargetMonth);
		const newCurrentDate = new Date(targetYear, targetMonthIndex, clampedDay);
		const newSelectedDate = formatDateKey(targetYear, targetMonth1, clampedDay);
		setCurrentDate(newCurrentDate);
		setSelectedDate(newSelectedDate);
	};
	(0, import_react.useEffect)(() => {
		calendarService.getWidgets().then((res) => {
			if (res) setWidgetsData(res);
		}).catch(() => {});
	}, [currentDate.getFullYear()]);
	const [isMobile, setIsMobile] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		const w = window.innerWidth || (window.screen ? window.screen.width : 0);
		const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
		return w < 1024 || isTouch && w < 1200 || window.matchMedia && window.matchMedia("(max-width: 1024px)").matches;
	});
	const [isSmallScreen, setIsSmallScreen] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		return (window.innerWidth || (window.screen ? window.screen.width : 0)) < 640 || window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
	});
	(0, import_react.useEffect)(() => {
		const handleResize = () => {
			if (typeof window === "undefined") return;
			const w = window.innerWidth || (window.screen ? window.screen.width : 0);
			const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
			const mobileQuery = window.matchMedia ? window.matchMedia("(max-width: 1024px)").matches : false;
			const smallQuery = window.matchMedia ? window.matchMedia("(max-width: 640px)").matches : false;
			setIsMobile(w < 1024 || isTouch && w < 1200 || mobileQuery);
			setIsSmallScreen(w < 640 || smallQuery);
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		window.addEventListener("orientationchange", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("orientationchange", handleResize);
		};
	}, []);
	const [selectedEvent, setSelectedEvent] = (0, import_react.useState)(null);
	const [isAddModalOpen, setIsAddModalOpen] = (0, import_react.useState)(false);
	const [isEditModalOpen, setIsEditModalOpen] = (0, import_react.useState)(false);
	const [isDuplicateModalOpen, setIsDuplicateModalOpen] = (0, import_react.useState)(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = (0, import_react.useState)(false);
	const [isImportModalOpen, setIsImportModalOpen] = (0, import_react.useState)(false);
	const [isGoogleSyncModalOpen, setIsGoogleSyncModalOpen] = (0, import_react.useState)(false);
	const [isEventModalOpen, setIsEventModalOpen] = (0, import_react.useState)(false);
	const [editingEventData, setEditingEventData] = (0, import_react.useState)(null);
	const [googleIntegration, setGoogleIntegration] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		calendarService.getIntegrations().then(setGoogleIntegration).catch(() => {});
	}, []);
	const [holidayForm, setHolidayForm] = (0, import_react.useState)({
		name: "",
		date: "",
		endDate: "",
		category: "Company Holiday",
		location: "All Locations",
		applicableDepartments: ["All"],
		applicableEmploymentTypes: ["All"],
		isPaid: true,
		isRecurring: false,
		description: ""
	});
	const [duplicateTargetYear, setDuplicateTargetYear] = (0, import_react.useState)((/* @__PURE__ */ new Date()).getFullYear() + 1);
	const [duplicateTargetDate, setDuplicateTargetDate] = (0, import_react.useState)("");
	const [importRows, setImportRows] = (0, import_react.useState)([]);
	const [importPreview, setImportPreview] = (0, import_react.useState)(null);
	const [isImporting, setIsImporting] = (0, import_react.useState)(false);
	const [flyerIndex, setFlyerIndex] = (0, import_react.useState)(0);
	const [isFlyerLightbox, setIsFlyerLightbox] = (0, import_react.useState)(false);
	const [zoomScale, setZoomScale] = (0, import_react.useState)(1);
	const flyerInputRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const flyerImages = storeState.companySettings?.holidayCalendarImages || storeState.holidayCalendarImages || [];
	(0, import_react.useEffect)(() => {
		setZoomScale(1);
	}, [flyerIndex, isFlyerLightbox]);
	(0, import_react.useEffect)(() => {
		if (!isFlyerLightbox) return;
		const handleKeyDown = (e) => {
			if (e.key === "Escape") setIsFlyerLightbox(false);
			if (e.key === "ArrowRight" && flyerImages.length > 1) setFlyerIndex((prev) => (prev + 1) % flyerImages.length);
			if (e.key === "ArrowLeft" && flyerImages.length > 1) setFlyerIndex((prev) => (prev - 1 + flyerImages.length) % flyerImages.length);
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isFlyerLightbox, flyerImages.length]);
	const getGoogleCalendarUrl = (ev) => {
		if (!ev?.date) return "#";
		const title = encodeURIComponent(ev.title || ev.name || "Company Holiday");
		const start = (ev.date || "").replace(/-/g, "");
		const endDateObj = new Date(ev.endDate || ev.date);
		endDateObj.setDate(endDateObj.getDate() + 1);
		const end = endDateObj.toISOString().split("T")[0].replace(/-/g, "");
		const locText = formatLocation(ev.location) || "All Offices";
		return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${encodeURIComponent(`${ev.description ? ev.description + "\n\n" : ""}Category: ${ev.category || "Holiday"}\nLocation: ${locText}\nEdufyi HR Portal`)}&location=${encodeURIComponent(locText || "Edufyi Technologies")}`;
	};
	const isLongWeekend = (dateStr) => {
		if (!dateStr) return false;
		const [y, m, d] = dateStr.split("-").map(Number);
		if (!y || !m || !d) return false;
		const day = new Date(y, m - 1, d).getDay();
		return day === 1 || day === 5;
	};
	const getDaysUntil = (dateStr) => {
		if (!dateStr) return null;
		const [y, m, d] = (dateStr || "").split("-").map(Number);
		if (!y || !m || !d) return null;
		const today = /* @__PURE__ */ new Date();
		today.setHours(0, 0, 0, 0);
		const target = new Date(y, m - 1, d);
		target.setHours(0, 0, 0, 0);
		const diffTime = target.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / 864e5);
		if (diffDays === 0) return {
			label: "Today",
			tone: "success",
			days: 0
		};
		if (diffDays === 1) return {
			label: "Tomorrow",
			tone: "info",
			days: 1
		};
		if (diffDays > 1 && diffDays <= 7) return {
			label: `In ${diffDays} days`,
			tone: "info",
			days: diffDays
		};
		if (diffDays > 7 && diffDays <= 30) return {
			label: `In ${diffDays} days`,
			tone: "neutral",
			days: diffDays
		};
		if (diffDays > 30) return {
			label: `In ${diffDays} days`,
			tone: "neutral",
			days: diffDays
		};
		return {
			label: "Past",
			tone: "muted",
			days: diffDays
		};
	};
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;
	const loadEvents = async () => {
		setIsLoading(true);
		try {
			const data = await calendarService.getEvents({
				year: currentYear,
				month: viewMode === "year" || viewMode === "agenda" ? null : currentMonth,
				category: categoryFilter,
				department: departmentFilter,
				search: searchQuery
			});
			setEvents(data);
		} catch (err) {
			console.warn("Failed loading events:", err.message);
		} finally {
			setIsLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		loadEvents();
	}, [
		currentYear,
		currentMonth,
		categoryFilter,
		departmentFilter,
		searchQuery,
		viewMode
	]);
	const handlePrev = () => {
		if (viewMode === "year" || viewMode === "agenda") syncCalendarDate(currentYear - 1, currentDate.getMonth());
		else if (viewMode === "week") {
			const d = new Date(currentDate);
			d.setDate(d.getDate() - 7);
			syncCalendarDate(d.getFullYear(), d.getMonth(), d.getDate());
		} else if (viewMode === "day") {
			const d = new Date(currentDate);
			d.setDate(d.getDate() - 1);
			syncCalendarDate(d.getFullYear(), d.getMonth(), d.getDate());
		} else {
			const d = new Date(currentYear, currentDate.getMonth() - 1, 1);
			syncCalendarDate(d.getFullYear(), d.getMonth());
		}
	};
	const handleNext = () => {
		if (viewMode === "year" || viewMode === "agenda") syncCalendarDate(currentYear + 1, currentDate.getMonth());
		else if (viewMode === "week") {
			const d = new Date(currentDate);
			d.setDate(d.getDate() + 7);
			syncCalendarDate(d.getFullYear(), d.getMonth(), d.getDate());
		} else if (viewMode === "day") {
			const d = new Date(currentDate);
			d.setDate(d.getDate() + 1);
			syncCalendarDate(d.getFullYear(), d.getMonth(), d.getDate());
		} else {
			const d = new Date(currentYear, currentDate.getMonth() + 1, 1);
			syncCalendarDate(d.getFullYear(), d.getMonth());
		}
	};
	const handleToday = () => {
		const today = /* @__PURE__ */ new Date();
		syncCalendarDate(today.getFullYear(), today.getMonth(), today.getDate());
	};
	const showNotice = (msg, duration = 4e3) => {
		setNotice(msg);
		setTimeout(() => setNotice(""), duration);
	};
	const handleDropOnDate = async (e, targetDate) => {
		e.preventDefault();
		try {
			const dataStr = e.dataTransfer.getData("text/plain");
			if (!dataStr) return;
			const payload = JSON.parse(dataStr);
			if (!payload?.id) return;
			const res = await calendarService.rescheduleEvent(payload.id, { date: targetDate });
			if (res?.success) {
				showNotice(`Rescheduled "${payload.title || "Event"}" to ${targetDate}`);
				loadEvents();
			} else showNotice(res?.message || "Failed to reschedule event.");
		} catch (err) {
			console.warn("Drag-and-drop reschedule notice:", err);
		}
	};
	const openAddModal = (dateStr = null) => {
		const defaultDate = dateStr || selectedDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		setHolidayForm({
			name: "",
			date: defaultDate,
			endDate: defaultDate,
			category: "Company Holiday",
			location: "All Locations",
			applicableDepartments: ["All"],
			applicableEmploymentTypes: ["All"],
			isPaid: true,
			isRecurring: false,
			description: ""
		});
		setIsAddModalOpen(true);
	};
	const openEditModal = (ev) => {
		setHolidayForm({
			id: ev.entityId || ev.id,
			name: ev.name || ev.title,
			date: ev.date,
			endDate: ev.endDate || ev.date,
			category: ev.category || "Company Holiday",
			location: ev.location || "All Locations",
			applicableDepartments: ev.applicableDepartments || ["All"],
			applicableEmploymentTypes: ev.applicableEmploymentTypes || ["All"],
			isPaid: ev.isPaid !== false,
			isRecurring: Boolean(ev.isRecurring),
			description: ev.description || ""
		});
		setIsEditModalOpen(true);
		setSelectedEvent(null);
	};
	const openDuplicateModal = (ev) => {
		setSelectedEvent(ev);
		const nextYear = parseInt(ev.date.slice(0, 4), 10) + 1;
		setDuplicateTargetYear(nextYear);
		setDuplicateTargetDate(`${nextYear}-${ev.date.slice(5)}`);
		setIsDuplicateModalOpen(true);
	};
	const handleCreateHoliday = async (e) => {
		e.preventDefault();
		if (!holidayForm.name || !holidayForm.date) {
			showNotice("Holiday name and date are required.");
			return;
		}
		try {
			const res = await calendarService.createHoliday(holidayForm);
			if (res.success) {
				showNotice(`Holiday "${holidayForm.name}" created successfully!`);
				setIsAddModalOpen(false);
				loadEvents();
			} else showNotice(res.message || "Failed to create holiday.");
		} catch (err) {
			showNotice(err.message || "Error creating holiday.");
		}
	};
	const handleUpdateHoliday = async (e) => {
		e.preventDefault();
		if (!holidayForm.id || !holidayForm.name || !holidayForm.date) return;
		try {
			const res = await calendarService.updateHoliday(holidayForm.id, holidayForm);
			if (res.success) {
				showNotice(`Holiday "${holidayForm.name}" updated successfully!`);
				setIsEditModalOpen(false);
				loadEvents();
			} else showNotice(res.message || "Failed to update holiday.");
		} catch (err) {
			showNotice(err.message || "Error updating holiday.");
		}
	};
	const handleDeleteHoliday = async () => {
		if (!selectedEvent) return;
		const id = selectedEvent.entityId || selectedEvent.id;
		try {
			const res = await calendarService.deleteHoliday(id);
			if (res.success) {
				showNotice(`Holiday "${selectedEvent.title}" deleted.`);
				setIsDeleteModalOpen(false);
				setSelectedEvent(null);
				loadEvents();
			} else showNotice(res.message || "Failed to delete holiday.");
		} catch (err) {
			showNotice(err.message || "Error deleting holiday.");
		}
	};
	const handleDuplicateHoliday = async (e) => {
		e.preventDefault();
		if (!selectedEvent) return;
		const id = selectedEvent.entityId || selectedEvent.id;
		try {
			const res = await calendarService.duplicateHoliday(id, {
				targetYear: duplicateTargetYear,
				targetDate: duplicateTargetDate
			});
			if (res.success) {
				showNotice(`Holiday duplicated to ${duplicateTargetDate || duplicateTargetYear}!`);
				setIsDuplicateModalOpen(false);
				setSelectedEvent(null);
				loadEvents();
			} else showNotice(res.message || "Failed to duplicate holiday.");
		} catch (err) {
			showNotice(err.message || "Error duplicating holiday.");
		}
	};
	const handleCsvFileUpload = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = async (evt) => {
			const text = evt.target?.result;
			if (!text) return;
			const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
			if (lines.length < 2) {
				showNotice("CSV must contain a header row and at least one data row.");
				return;
			}
			const headers = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
			const rows = [];
			for (let i = 1; i < lines.length; i++) {
				const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
				const rowObj = {};
				headers.forEach((h, idx) => {
					rowObj[h] = (values[idx] || "").replace(/^["']|["']$/g, "").trim();
				});
				rows.push(rowObj);
			}
			setImportRows(rows);
			try {
				const preview = await calendarService.bulkImportHolidays(rows, true);
				setImportPreview(preview);
			} catch (err) {
				showNotice("CSV preview validation error: " + err.message);
			}
		};
		reader.readAsText(file);
	};
	const handleCommitImport = async () => {
		if (!importRows || importRows.length === 0) return;
		setIsImporting(true);
		try {
			const res = await calendarService.bulkImportHolidays(importRows, false);
			if (res.success) {
				showNotice(`Import complete! ${res.summary?.importedCount || 0} holidays added.`);
				setIsImportModalOpen(false);
				setImportRows([]);
				setImportPreview(null);
				loadEvents();
			} else showNotice(res.message || "Import failed.");
		} catch (err) {
			showNotice("Import failed: " + err.message);
		} finally {
			setIsImporting(false);
		}
	};
	const handleDownloadSampleCsv = () => {
		const blob = new Blob([`Holiday Name,Date,End Date,Category,Location,Departments,Paid/Unpaid,Description\n"New Year Day","2027-01-01","2027-01-01","National Holiday","All Locations","All","Paid","Official company holiday welcoming 2027"\n"Republic Day","2027-01-26","2027-01-26","National Holiday","All Locations","All","Paid","Honoring the Indian Constitution"\n"Independence Day","2027-08-15","2027-08-15","National Holiday","All Locations","All","Paid","National independence celebration"\n"Diwali Celebration","2027-11-08","2027-11-09","Festival","All Locations","All","Paid","Festival of Lights holidays"`], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "edufyi_holiday_template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};
	const monthCalendarDays = (0, import_react.useMemo)(() => {
		const year = currentYear;
		const month = currentDate.getMonth();
		const todayLocalStr = getLocalDateStr(/* @__PURE__ */ new Date());
		const firstDayIndex = new Date(year, month, 1).getDay();
		const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();
		const days = [];
		for (let i = firstDayIndex - 1; i >= 0; i--) {
			const dayNum = daysInPrevMonth - i;
			const prevDate = new Date(year, month - 1, dayNum);
			const dateStr = formatDateKey(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate());
			days.push({
				dateStr,
				dayNum,
				isCurrentMonth: false,
				isPrevMonth: true
			});
		}
		for (let i = 1; i <= daysInCurrentMonth; i++) {
			const dateStr = formatDateKey(year, month + 1, i);
			days.push({
				dateStr,
				dayNum: i,
				isCurrentMonth: true,
				isToday: dateStr === todayLocalStr
			});
		}
		const remaining = (7 - days.length % 7) % 7;
		for (let i = 1; i <= remaining; i++) {
			const nextDate = new Date(year, month + 1, i);
			const dateStr = formatDateKey(nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate());
			days.push({
				dateStr,
				dayNum: i,
				isCurrentMonth: false,
				isNextMonth: true
			});
		}
		return days;
	}, [currentYear, currentDate]);
	const scopedEvents = (0, import_react.useMemo)(() => {
		if (scopeFilter === "all") return events;
		const currentUserId = user?.id || user?._id || user?.employeeId;
		const currentUserEmail = (user?.email || "").toLowerCase();
		const userDept = user?.department || "";
		if (scopeFilter === "my") return events.filter((ev) => {
			if (ev.isOwner) return true;
			if (ev.organizer && (ev.organizer.id === currentUserId || ev.organizer.email && ev.organizer.email.toLowerCase() === currentUserEmail)) return true;
			if (Array.isArray(ev.participants) && ev.participants.some((p) => p.employeeId === currentUserId || p.email && p.email.toLowerCase() === currentUserEmail)) return true;
			if (ev.type === "leave" && (ev.employeeId === currentUserId || ev.employeeEmail && ev.employeeEmail.toLowerCase() === currentUserEmail)) return true;
			if ((ev.type === "birthday" || ev.category === "Birthday" || ev.category === "Employee Birthday") && (ev.employeeId === currentUserId || user?.name && ev.title?.toLowerCase().includes(user.name.toLowerCase()))) return true;
			return false;
		});
		if (scopeFilter === "team") return events.filter((ev) => {
			if (!ev.department || ev.department === "all" || ev.department === "Company-wide") return true;
			if (userDept && ev.department.toLowerCase() === userDept.toLowerCase()) return true;
			return false;
		});
		return events;
	}, [
		events,
		scopeFilter,
		user
	]);
	const eventsByDate = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		scopedEvents.forEach((ev) => {
			if (ev.endDate && ev.endDate !== ev.date) {
				const start = new Date(ev.date);
				const end = new Date(ev.endDate);
				for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
					const key = formatDateKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
					if (!map.has(key)) map.set(key, []);
					map.get(key).push(ev);
				}
			} else {
				const key = ev.date;
				if (!map.has(key)) map.set(key, []);
				map.get(key).push(ev);
			}
		});
		return map;
	}, [scopedEvents]);
	const selectedDateEvents = (0, import_react.useMemo)(() => {
		return (eventsByDate.get(selectedDate) || []).filter((e) => showLeaves || e.type !== "leave");
	}, [
		eventsByDate,
		selectedDate,
		showLeaves
	]);
	const holidaysList = (0, import_react.useMemo)(() => {
		return scopedEvents.filter((e) => e.type === "holiday" || e.category && ![
			"Birthday",
			"Employee Birthday",
			"Work Anniversary",
			"Leave"
		].includes(e.category));
	}, [scopedEvents]);
	const nextUpcomingHoliday = (0, import_react.useMemo)(() => {
		return holidaysList.filter((h) => (h.date || "") >= selectedDate).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
	}, [holidaysList, selectedDate])[0] || holidaysList[0] || null;
	const birthdaysList = (0, import_react.useMemo)(() => {
		return scopedEvents.filter((e) => e.type === "birthday" || e.category === "Birthday" || e.category === "Employee Birthday");
	}, [scopedEvents]);
	const nextBirthday = (0, import_react.useMemo)(() => {
		return birthdaysList.filter((b) => (b.date || "") >= selectedDate).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
	}, [birthdaysList, selectedDate])[0] || birthdaysList[0] || null;
	const anniversariesList = (0, import_react.useMemo)(() => {
		return scopedEvents.filter((e) => e.type === "anniversary" || e.category === "Work Anniversary");
	}, [scopedEvents]);
	const nextAnniversary = (0, import_react.useMemo)(() => {
		return anniversariesList.filter((a) => (a.date || "") >= selectedDate).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
	}, [anniversariesList, selectedDate])[0] || anniversariesList[0] || null;
	const meetingsList = (0, import_react.useMemo)(() => {
		return scopedEvents.filter((e) => e.type === "meeting" || e.category && e.category.toLowerCase().includes("meeting") || Boolean(e.meetingLink?.url));
	}, [scopedEvents]);
	const nextMeeting = (0, import_react.useMemo)(() => {
		return meetingsList.filter((m) => (m.date || "") >= selectedDate).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
	}, [meetingsList, selectedDate])[0] || meetingsList[0] || null;
	const companyEventsList = (0, import_react.useMemo)(() => {
		return scopedEvents.filter((e) => e.type === "event" || [
			"Project Deadline",
			"Training",
			"Training Session",
			"Interview",
			"Performance Review",
			"Employee Onboarding",
			"Office Event",
			"Event",
			"Custom Event",
			"Announcement"
		].includes(e.category));
	}, [scopedEvents]);
	const nextCompanyEvent = (0, import_react.useMemo)(() => {
		return companyEventsList.filter((ev) => (ev.date || "") >= selectedDate).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
	}, [companyEventsList, selectedDate])[0] || companyEventsList[0] || null;
	const currentActorId = user?.id || user?._id || user?.employeeId;
	const pendingInvitationsCount = (0, import_react.useMemo)(() => {
		return scopedEvents.filter((ev) => {
			if (Array.isArray(ev.participants)) {
				const p = ev.participants.find((part) => part.employeeId === currentActorId);
				if (p && p.rsvpStatus === "pending") return true;
			}
			return false;
		}).length || widgetsData?.pendingInvitationsCount || widgetsData?.pendingActionsCount || 0;
	}, [
		scopedEvents,
		currentActorId,
		widgetsData
	]);
	const groupedAgendaEvents = (0, import_react.useMemo)(() => {
		const filtered = scopedEvents.filter((ev) => {
			if (!showLeaves && ev.type === "leave") return false;
			return true;
		}).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
		const groups = {};
		filtered.forEach((ev) => {
			if (!ev.date) return;
			const yearMonth = ev.date.slice(0, 7);
			if (!groups[yearMonth]) groups[yearMonth] = [];
			groups[yearMonth].push(ev);
		});
		return groups;
	}, [events, showLeaves]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "enterprise-calendar-module",
		style: {
			display: "flex",
			flexDirection: "column",
			gap: "20px"
		},
		children: [
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "12px",
					padding: "12px 18px",
					background: "#ecfdf5",
					color: "#065f46",
					borderRadius: "10px",
					border: "1px solid #a7f3d0",
					fontSize: "13px",
					fontWeight: 600,
					boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						size: 17,
						color: "#059669"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notice })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setNotice(""),
					style: {
						background: "none",
						border: "none",
						cursor: "pointer",
						color: "#065f46"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 15 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: isSmallScreen ? "repeat(2, 1fr)" : isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
					gap: isSmallScreen ? "8px" : "12px"
				},
				className: "calendar-stats-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `panel hover-card ${categoryFilter === "Company Holiday" ? "active-stat-card" : ""}`,
						onClick: () => {
							const nextCat = categoryFilter === "Company Holiday" ? "all" : "Company Holiday";
							setCategoryFilter(nextCat);
							setViewMode("month");
							if (nextCat === "Company Holiday" && nextUpcomingHoliday?.date) {
								setSelectedDate(nextUpcomingHoliday.date);
								const [y, m, d] = nextUpcomingHoliday.date.split("-").map(Number);
								if (y && m && d) setCurrentDate(new Date(y, m - 1, d));
							}
						},
						title: "Click to view official company holidays",
						style: {
							padding: isSmallScreen ? "10px 12px" : "14px 16px",
							borderRadius: "12px",
							border: categoryFilter === "Company Holiday" ? "2px solid #0284c7" : "1px solid var(--border, #e2e8f0)",
							background: "var(--card-bg, #ffffff)",
							display: "flex",
							alignItems: "center",
							gap: isSmallScreen ? "8px" : "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: isSmallScreen ? "32px" : "40px",
								height: isSmallScreen ? "32px" : "40px",
								borderRadius: "10px",
								background: "#e0f2fe",
								color: "#0284c7",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, { size: isSmallScreen ? 18 : 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: isSmallScreen ? "15px" : "18px",
										fontWeight: 800,
										color: "var(--ink, #0f172a)",
										lineHeight: 1.1
									},
									children: [
										holidaysList.length,
										" ",
										holidaysList.length === 1 ? "Day" : "Days"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink, #334155)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: "Holidays"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "10px",
										color: "var(--muted, #64748b)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: nextUpcomingHoliday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Next: ", nextUpcomingHoliday.title || nextUpcomingHoliday.name] }) : "None scheduled"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `panel hover-card ${categoryFilter === "Employee Birthday" ? "active-stat-card" : ""}`,
						onClick: () => {
							const nextCat = categoryFilter === "Employee Birthday" ? "all" : "Employee Birthday";
							setCategoryFilter(nextCat);
							setViewMode("month");
							if (nextCat === "Employee Birthday" && nextBirthday?.date) {
								setSelectedDate(nextBirthday.date);
								const [y, m, d] = nextBirthday.date.split("-").map(Number);
								if (y && m && d) setCurrentDate(new Date(y, m - 1, d));
							}
						},
						title: "Click to view employee birthdays",
						style: {
							padding: isSmallScreen ? "10px 12px" : "14px 16px",
							borderRadius: "12px",
							border: categoryFilter === "Employee Birthday" ? "2px solid #db2777" : "1px solid var(--border, #e2e8f0)",
							background: "var(--card-bg, #ffffff)",
							display: "flex",
							alignItems: "center",
							gap: isSmallScreen ? "8px" : "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: isSmallScreen ? "32px" : "40px",
								height: isSmallScreen ? "32px" : "40px",
								borderRadius: "10px",
								background: "#fdf2f8",
								color: "#db2777",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: isSmallScreen ? 18 : 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: isSmallScreen ? "15px" : "18px",
										fontWeight: 800,
										color: "var(--ink, #0f172a)",
										lineHeight: 1.1
									},
									children: birthdaysList.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink, #334155)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: "Birthdays 🎂"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "10px",
										color: "var(--muted, #64748b)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: nextBirthday ? `Next: ${nextBirthday.name}` : `In ${MONTH_NAMES[currentDate.getMonth()]}`
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `panel hover-card ${categoryFilter === "Work Anniversary" ? "active-stat-card" : ""}`,
						onClick: () => {
							const nextCat = categoryFilter === "Work Anniversary" ? "all" : "Work Anniversary";
							setCategoryFilter(nextCat);
							setViewMode("month");
							if (nextCat === "Work Anniversary" && nextAnniversary?.date) {
								setSelectedDate(nextAnniversary.date);
								const [y, m, d] = nextAnniversary.date.split("-").map(Number);
								if (y && m && d) setCurrentDate(new Date(y, m - 1, d));
							}
						},
						title: "Click to view work anniversaries",
						style: {
							padding: isSmallScreen ? "10px 12px" : "14px 16px",
							borderRadius: "12px",
							border: categoryFilter === "Work Anniversary" ? "2px solid #d97706" : "1px solid var(--border, #e2e8f0)",
							background: "var(--card-bg, #ffffff)",
							display: "flex",
							alignItems: "center",
							gap: isSmallScreen ? "8px" : "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: isSmallScreen ? "32px" : "40px",
								height: isSmallScreen ? "32px" : "40px",
								borderRadius: "10px",
								background: "#fffbeb",
								color: "#d97706",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { size: isSmallScreen ? 18 : 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: isSmallScreen ? "15px" : "18px",
										fontWeight: 800,
										color: "var(--ink, #0f172a)",
										lineHeight: 1.1
									},
									children: anniversariesList.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink, #334155)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: "Anniversaries 🎖️"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "10px",
										color: "var(--muted, #64748b)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: nextAnniversary ? `Next: ${nextAnniversary.name}` : "Milestones"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `panel hover-card ${categoryFilter === "Company Meeting" ? "active-stat-card" : ""}`,
						onClick: () => {
							setCategoryFilter(categoryFilter === "Company Meeting" ? "all" : "Company Meeting");
							setViewMode("agenda");
						},
						title: "Click to view scheduled meetings",
						style: {
							padding: isSmallScreen ? "10px 12px" : "14px 16px",
							borderRadius: "12px",
							border: categoryFilter === "Company Meeting" ? "2px solid #1d4ed8" : "1px solid var(--border, #e2e8f0)",
							background: "var(--card-bg, #ffffff)",
							display: "flex",
							alignItems: "center",
							gap: isSmallScreen ? "8px" : "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: isSmallScreen ? "32px" : "40px",
								height: isSmallScreen ? "32px" : "40px",
								borderRadius: "10px",
								background: "#eff6ff",
								color: "#1d4ed8",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: isSmallScreen ? 18 : 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: isSmallScreen ? "15px" : "18px",
										fontWeight: 800,
										color: "var(--ink, #0f172a)",
										lineHeight: 1.1
									},
									children: meetingsList.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink, #334155)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: "Meetings"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "10px",
										color: "var(--muted, #64748b)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: nextMeeting ? `${nextMeeting.title}` : "Google Meet Ready"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `panel hover-card ${categoryFilter === "Project Deadline" ? "active-stat-card" : ""}`,
						onClick: () => {
							setCategoryFilter(categoryFilter === "Project Deadline" ? "all" : "Project Deadline");
							setViewMode("upcoming");
						},
						title: "Click to view company events & deadlines",
						style: {
							padding: isSmallScreen ? "10px 12px" : "14px 16px",
							borderRadius: "12px",
							border: categoryFilter === "Project Deadline" ? "2px solid #0f766e" : "1px solid var(--border, #e2e8f0)",
							background: "var(--card-bg, #ffffff)",
							display: "flex",
							alignItems: "center",
							gap: isSmallScreen ? "8px" : "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: isSmallScreen ? "32px" : "40px",
								height: isSmallScreen ? "32px" : "40px",
								borderRadius: "10px",
								background: "#ccfbf1",
								color: "#0f766e",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: isSmallScreen ? 18 : 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: isSmallScreen ? "15px" : "18px",
										fontWeight: 800,
										color: "var(--ink, #0f172a)",
										lineHeight: 1.1
									},
									children: companyEventsList.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink, #334155)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: "Company Events"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "10px",
										color: "var(--muted, #64748b)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: nextCompanyEvent ? `${nextCompanyEvent.title}` : "Deadlines & Training"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `panel hover-card ${scopeFilter === "my" ? "active-stat-card" : ""}`,
						onClick: () => {
							setScopeFilter(scopeFilter === "my" ? "all" : "my");
							setViewMode("agenda");
						},
						title: "Click to view personal invitations & actions",
						style: {
							padding: isSmallScreen ? "10px 12px" : "14px 16px",
							borderRadius: "12px",
							border: scopeFilter === "my" ? "2px solid #7c3aed" : "1px solid var(--border, #e2e8f0)",
							background: "var(--card-bg, #ffffff)",
							display: "flex",
							alignItems: "center",
							gap: isSmallScreen ? "8px" : "12px",
							boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
							cursor: "pointer",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: isSmallScreen ? "32px" : "40px",
								height: isSmallScreen ? "32px" : "40px",
								borderRadius: "10px",
								background: "#f5f3ff",
								color: "#7c3aed",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: isSmallScreen ? 18 : 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: isSmallScreen ? "15px" : "18px",
										fontWeight: 800,
										color: "var(--ink, #0f172a)",
										lineHeight: 1.1
									},
									children: pendingInvitationsCount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink, #334155)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: "Pending RSVPs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "10px",
										color: "var(--muted, #64748b)",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									children: pendingInvitationsCount > 0 ? `${pendingInvitationsCount} response(s) needed` : "All responded"
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel calendar-control-panel",
				style: {
					padding: isSmallScreen ? "12px 10px" : "18px 20px",
					display: "flex",
					flexDirection: "column",
					gap: isSmallScreen ? "12px" : "16px",
					background: "var(--card-bg, #ffffff)",
					borderRadius: "14px",
					border: "1px solid var(--border, #e2e8f0)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "calendar-header-top",
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: isSmallScreen ? "10px" : "14px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "10px",
							flexWrap: "wrap",
							width: isSmallScreen ? "100%" : "auto"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									width: isSmallScreen ? "34px" : "40px",
									height: isSmallScreen ? "34px" : "40px",
									borderRadius: "10px",
									background: "var(--teal-soft, #e6f4f1)",
									color: "var(--teal, #006E6F)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { size: isSmallScreen ? 18 : 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								style: {
									margin: 0,
									fontSize: isSmallScreen ? "18px" : "22px",
									fontWeight: 800,
									color: "var(--ink, #0f172a)",
									lineHeight: 1.2
								},
								children: viewMode === "year" ? `${currentYear}` : `${MONTH_NAMES[currentDate.getMonth()]} ${currentYear}`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: 0,
									fontSize: isSmallScreen ? "10.5px" : "12px",
									color: "var(--muted, #64748b)"
								},
								children: "Enterprise Smart Calendar & Workforce Operations"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "4px",
								marginLeft: isSmallScreen ? "auto" : 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: handlePrev,
									title: "Previous",
									style: { padding: isSmallScreen ? "4px 6px" : "6px 10px" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: isSmallScreen ? 16 : 18 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: handleToday,
									style: {
										fontWeight: 600,
										padding: isSmallScreen ? "4px 10px" : "6px 14px",
										fontSize: isSmallScreen ? "11.5px" : "13px"
									},
									children: "Today"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									onClick: handleNext,
									title: "Next",
									style: { padding: isSmallScreen ? "4px 6px" : "6px 10px" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: isSmallScreen ? 16 : 18 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "month",
									value: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
									onChange: (e) => {
										if (!e.target.value) return;
										const [y, m] = e.target.value.split("-").map(Number);
										syncCalendarDate(y, m - 1);
									},
									title: "Jump to specific month and year",
									style: {
										padding: "4px 8px",
										borderRadius: "8px",
										border: "1px solid var(--border, #cbd5e1)",
										fontSize: "11px",
										color: "var(--ink, #334155)",
										background: "var(--card-bg, #ffffff)",
										cursor: "pointer",
										marginLeft: "4px"
									}
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							flexWrap: "wrap",
							width: isSmallScreen ? "100%" : "auto",
							justifyContent: isSmallScreen ? "space-between" : "flex-end"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "inline-flex",
									background: "var(--surface-hover, #f1f5f9)",
									padding: "3px",
									borderRadius: "8px",
									border: "1px solid var(--border, #e2e8f0)"
								},
								children: [
									{
										id: "all",
										label: "Company"
									},
									{
										id: "team",
										label: "Team"
									},
									{
										id: "my",
										label: "My Calendar"
									}
								].map((s) => {
									const active = scopeFilter === s.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setScopeFilter(s.id),
										style: {
											padding: "4px 10px",
											fontSize: "11.5px",
											fontWeight: active ? 700 : 500,
											color: active ? "#ffffff" : "var(--ink, #475569)",
											background: active ? "var(--teal, #006E6F)" : "transparent",
											border: "none",
											borderRadius: "6px",
											cursor: "pointer",
											transition: "all 0.15s ease",
											whiteSpace: "nowrap"
										},
										children: s.label
									}, s.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "calendar-view-switcher",
								style: {
									display: "inline-flex",
									background: "var(--surface-hover, #f1f5f9)",
									padding: "3px",
									borderRadius: "8px",
									border: "1px solid var(--border, #e2e8f0)",
									overflowX: "auto",
									maxWidth: "100%",
									WebkitOverflowScrolling: "touch",
									scrollbarWidth: "none"
								},
								children: [
									{
										id: "month",
										label: "Month",
										icon: CalendarDays
									},
									{
										id: "week",
										label: "Week",
										icon: Clock
									},
									{
										id: "day",
										label: "Day",
										icon: Calendar
									},
									{
										id: "agenda",
										label: "Schedule",
										icon: List
									},
									{
										id: "upcoming",
										label: "Upcoming",
										icon: Target
									},
									{
										id: "year",
										label: "Year",
										icon: Grid3x3
									},
									{
										id: "gallery",
										label: "Flyers",
										icon: Layers
									}
								].map((v) => {
									const Icon = v.icon;
									const active = viewMode === v.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setViewMode(v.id),
										style: {
											display: "flex",
											alignItems: "center",
											gap: "4px",
											padding: isSmallScreen ? "5px 8px" : "6px 12px",
											fontSize: isSmallScreen ? "11px" : "12px",
											fontWeight: active ? 700 : 500,
											color: active ? "#ffffff" : "var(--ink, #334155)",
											background: active ? "var(--teal, #006E6F)" : "transparent",
											border: "none",
											borderRadius: "6px",
											cursor: "pointer",
											transition: "all 0.15s ease",
											whiteSpace: "nowrap",
											flexShrink: 0
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: v.label })]
									}, v.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "6px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => calendarService.downloadExport("csv", currentYear),
										title: "Download CSV",
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											padding: isSmallScreen ? "6px 8px" : "7px 12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden-mobile",
											children: "CSV"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => calendarService.downloadExport("ics", currentYear),
										title: "Export to iCalendar / Outlook / Google Calendar",
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											padding: isSmallScreen ? "6px 8px" : "7px 12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarRange, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden-mobile",
											children: "iCal (ICS)"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => setIsGoogleSyncModalOpen(true),
										title: "Google Calendar & Meet Video Call Integration",
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											padding: isSmallScreen ? "6px 8px" : "7px 12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
											size: 14,
											color: "#059669"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden-mobile",
											children: "Google Sync"
										})]
									}),
									flyerImages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => setViewMode("gallery"),
										title: "View printed official holiday flyer poster",
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											padding: isSmallScreen ? "6px 8px" : "7px 12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
											size: 14,
											color: "#0284c7"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden-mobile",
											children: "Official Flyer"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "primary",
								onClick: () => {
									setEditingEventData(null);
									setIsEventModalOpen(true);
								},
								style: {
									display: "flex",
									alignItems: "center",
									gap: "6px",
									padding: isSmallScreen ? "6px 10px" : "7px 14px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Schedule Event" })]
							}),
							canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => setIsImportModalOpen(true),
									title: "Bulk Import Holidays via CSV",
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px",
										padding: isSmallScreen ? "6px 8px" : "7px 12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden-mobile",
										children: "Import"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => openAddModal(),
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px",
										padding: isSmallScreen ? "6px 10px" : "7px 12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden-mobile",
										children: "Holiday"
									})]
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "calendar-filter-bar",
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: isSmallScreen ? "10px" : "12px",
						paddingTop: "12px",
						borderTop: "1px solid var(--border, #f1f5f9)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "calendar-category-pills",
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px",
							overflowX: "auto",
							paddingBottom: "4px",
							maxWidth: "100%",
							width: isSmallScreen ? "100%" : "auto",
							WebkitOverflowScrolling: "touch",
							scrollbarWidth: "none",
							flexWrap: "nowrap"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 800,
									color: "var(--muted, #64748b)",
									textTransform: "uppercase",
									marginRight: "4px",
									flexShrink: 0
								},
								children: "Category:"
							}),
							[
								{
									id: "all",
									label: "All Events"
								},
								{
									id: "Company Meeting",
									label: "💼 Meetings"
								},
								{
									id: "Company Holiday",
									label: "🌴 Holidays"
								},
								{
									id: "Employee Birthday",
									label: "🎂 Birthdays"
								},
								{
									id: "Work Anniversary",
									label: "🎖️ Anniversaries"
								},
								{
									id: "Project Deadline",
									label: "🎯 Deadlines"
								},
								{
									id: "Training Session",
									label: "🎓 Training"
								},
								{
									id: "leave",
									label: "🏖️ Leaves"
								}
							].map((cat) => {
								const active = categoryFilter === cat.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setCategoryFilter(cat.id),
									style: {
										padding: isSmallScreen ? "3px 8px" : "4px 10px",
										fontSize: isSmallScreen ? "11px" : "12px",
										fontWeight: active ? 700 : 500,
										borderRadius: "20px",
										border: active ? "1px solid var(--teal, #006E6F)" : "1px solid var(--border, #e2e8f0)",
										background: active ? "var(--teal-soft, #e6f4f1)" : "transparent",
										color: active ? "var(--teal, #006E6F)" : "var(--ink, #475569)",
										cursor: "pointer",
										whiteSpace: "nowrap",
										flexShrink: 0
									},
									children: cat.label
								}, cat.id);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: "5px",
									padding: isSmallScreen ? "3px 8px" : "4px 10px",
									borderRadius: "20px",
									border: showLeaves ? "1px solid #c4b5fd" : "1px solid var(--border, #e2e8f0)",
									background: showLeaves ? "#f5f3ff" : "transparent",
									color: showLeaves ? "#6d28d9" : "var(--ink, #475569)",
									fontSize: isSmallScreen ? "11px" : "12px",
									fontWeight: showLeaves ? 700 : 500,
									cursor: "pointer",
									whiteSpace: "nowrap",
									userSelect: "none",
									flexShrink: 0
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showLeaves,
									onChange: (e) => setShowLeaves(e.target.checked),
									style: {
										cursor: "pointer",
										margin: 0
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🏖️ Team Leaves" })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "calendar-search-filters",
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							flexWrap: "wrap",
							width: isSmallScreen ? "100%" : "auto"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: departmentFilter,
							onChange: (e) => setDepartmentFilter(e.target.value),
							style: {
								padding: "6px 10px",
								borderRadius: "8px",
								border: "1px solid var(--border, #cbd5e1)",
								fontSize: "12px",
								color: "var(--ink, #334155)",
								background: "var(--card-bg, #ffffff)",
								flex: isSmallScreen ? "1 1 100%" : "0 0 auto",
								width: isSmallScreen ? "100%" : "auto"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Departments"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Engineering",
									children: "Engineering"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Product",
									children: "Product"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Human Resources",
									children: "Human Resources"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Marketing",
									children: "Marketing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Sales",
									children: "Sales"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Finance",
									children: "Finance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Operations",
									children: "Operations"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								position: "relative",
								minWidth: isSmallScreen ? "100%" : "180px",
								width: isSmallScreen ? "100%" : "auto",
								flex: isSmallScreen ? "1 1 100%" : "1 1 auto"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									size: 14,
									style: {
										position: "absolute",
										left: "10px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--muted, #94a3b8)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "Search event or person...",
									value: searchQuery,
									onChange: (e) => setSearchQuery(e.target.value),
									style: {
										width: "100%",
										padding: "6px 10px 6px 30px",
										borderRadius: "8px",
										border: "1px solid var(--border, #cbd5e1)",
										fontSize: "12px",
										outline: "none",
										background: "var(--card-bg, #ffffff)",
										boxSizing: "border-box"
									}
								}),
								searchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setSearchQuery(""),
									style: {
										position: "absolute",
										right: "8px",
										top: "50%",
										transform: "translateY(-50%)",
										background: "none",
										border: "none",
										cursor: "pointer",
										color: "#94a3b8"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 13 })
								})
							]
						})]
					})]
				})]
			}),
			viewMode === "month" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `calendar-grid-layout ${isMobile ? "is-mobile-layout" : ""}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel calendar-month-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "calendar-day-headers",
						children: DAY_NAMES.map((day, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "calendar-day-header",
							style: { color: idx === 0 || idx === 6 ? "#ef4444" : "var(--muted, #64748b)" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "day-name-full",
								children: day.slice(0, 3)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "day-name-micro",
								children: day.slice(0, 1)
							})]
						}, day))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "calendar-days-grid",
						children: monthCalendarDays.map((cell) => {
							const cellEvents = (eventsByDate.get(cell.dateStr) || []).filter((e) => showLeaves || e.type !== "leave");
							const isSelected = selectedDate === cell.dateStr;
							const maxVisible = 2;
							const hiddenCount = cellEvents.length - maxVisible;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `calendar-day-cell ${isSelected ? "is-selected" : ""} ${cell.isToday ? "is-today" : ""} ${!cell.isCurrentMonth ? "is-other-month" : ""}`,
								onClick: () => {
									setSelectedDate(cell.dateStr);
									const [y, m, d] = cell.dateStr.split("-").map(Number);
									if (y !== currentYear || m !== currentMonth) setCurrentDate(new Date(y, m - 1, d));
								},
								onDragOver: (e) => {
									e.preventDefault();
									e.dataTransfer.dropEffect = "move";
								},
								onDrop: (e) => handleDropOnDate(e, cell.dateStr),
								onDoubleClick: () => {
									if (cell.isCurrentMonth) {
										setEditingEventData({ date: cell.dateStr });
										setIsEventModalOpen(true);
									}
								},
								style: {
									border: isSelected ? "2px solid var(--teal, #006E6F)" : cell.isToday ? "2px solid #38bdf8" : "1px solid var(--border, #f1f5f9)",
									background: isSelected ? "var(--teal-soft, #f0fdfa)" : cell.isToday ? "#f0f9ff" : cell.isCurrentMonth ? "var(--card-bg, #ffffff)" : "var(--surface-hover, #f8fafc)",
									opacity: cell.isCurrentMonth ? 1 : .45,
									cursor: "pointer",
									transition: "all 0.15s ease",
									boxShadow: isSelected ? "0 4px 12px rgba(0, 110, 111, 0.14)" : "none"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "calendar-day-header-inner",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "calendar-day-number",
												style: {
													fontWeight: cell.isToday || isSelected ? 800 : 600,
													color: cell.isToday ? "#0284c7" : isSelected ? "var(--teal, #006E6F)" : "var(--ink, #1e293b)",
													background: cell.isToday ? "#e0f2fe" : isSelected ? "#ccfbf1" : "transparent"
												},
												children: cell.dayNum
											}),
											cellEvents.some((e) => e.type === "birthday" || e.category === "Birthday" || e.category === "Employee Birthday") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												title: "Employee birthdays on this day",
												style: {
													fontSize: "11px",
													lineHeight: 1
												},
												children: "🎂"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "calendar-day-count-badge hidden-mobile",
												style: {
													fontSize: "10px",
													fontWeight: 700,
													padding: "1px 5px",
													borderRadius: "10px",
													background: "#f1f5f9",
													color: "#475569",
													display: cellEvents.length > 0 ? "inline" : "none"
												},
												children: cellEvents.length
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "calendar-day-dots",
										children: [cellEvents.slice(0, 3).map((ev) => {
											const isBday = ev.type === "birthday" || ev.category === "Birthday" || ev.category === "Employee Birthday";
											const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS["Company Holiday"];
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												title: `${ev.title} (${ev.category})`,
												style: {
													width: isBday ? "7px" : "5px",
													height: isBday ? "7px" : "5px",
													borderRadius: "50%",
													background: isBday ? "#db2777" : styleInfo.text || "#006E6F",
													display: "inline-block",
													flexShrink: 0
												}
											}, ev.id);
										}), cellEvents.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "8px",
												fontWeight: 800,
												color: "var(--teal, #006E6F)",
												lineHeight: 1
											},
											children: ["+", cellEvents.length - 3]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "calendar-day-pills",
										children: [cellEvents.slice(0, maxVisible).map((ev) => {
											const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS["Company Holiday"];
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												draggable: Boolean(canManage || ev.isOwner),
												onDragStart: (e) => {
													e.dataTransfer.setData("text/plain", JSON.stringify({
														id: ev.entityId || ev.id,
														title: ev.title
													}));
												},
												onClick: (e) => {
													e.stopPropagation();
													setSelectedEvent(ev);
													setSelectedDate(cell.dateStr);
												},
												title: `${ev.title} (${ev.category})`,
												style: {
													padding: "2px 5px",
													borderRadius: "4px",
													fontSize: "10px",
													fontWeight: 600,
													background: styleInfo.bg,
													color: styleInfo.text,
													border: `1px solid ${styleInfo.border}`,
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
													display: "flex",
													alignItems: "center",
													gap: "4px"
												},
												children: [
													(ev.type === "birthday" || ev.category === "Birthday" || ev.category === "Employee Birthday") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: 10 }),
													(ev.type === "anniversary" || ev.category === "Work Anniversary") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { size: 10 }),
													ev.meetingLink?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
														size: 10,
														color: "#059669"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ev.title })
												]
											}, ev.id);
										}), hiddenCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "10px",
												fontWeight: 600,
												color: "var(--teal, #006E6F)",
												padding: "1px 4px"
											},
											children: [
												"+",
												hiddenCount,
												" more"
											]
										})]
									})
								]
							}, cell.dateStr);
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel calendar-agenda-panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							style: {
								fontSize: "11px",
								color: "var(--teal, #006E6F)",
								fontWeight: 700
							},
							children: "Selected Date Agenda"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "2px 0 0",
								fontSize: "16px",
								fontWeight: 800,
								color: "var(--ink, #0f172a)"
							},
							children: (() => {
								const [y, m, d] = (selectedDate || "").split("-").map(Number);
								if (!y || !m || !d) return selectedDate;
								return new Date(y, m - 1, d).toLocaleDateString("en-US", {
									weekday: "short",
									month: "short",
									day: "numeric",
									year: "numeric"
								});
							})()
						})] }), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => openAddModal(selectedDate),
							title: "Add event on this date",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 })
						})]
					}), selectedDateEvents.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: "10px"
						},
						children: selectedDateEvents.map((ev) => {
							const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS["Company Holiday"];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => setSelectedEvent(ev),
								style: {
									padding: "12px",
									borderRadius: "10px",
									border: `1px solid ${styleInfo.border}`,
									background: styleInfo.bg,
									color: styleInfo.text,
									cursor: "pointer",
									transition: "transform 0.1s ease"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											marginBottom: "4px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "11px",
												fontWeight: 700,
												textTransform: "uppercase",
												letterSpacing: "0.04em"
											},
											children: ev.category
										}), ev.isPaid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												background: "rgba(255,255,255,0.7)",
												padding: "1px 6px",
												borderRadius: "4px",
												fontWeight: 700
											},
											children: "Paid Off"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontWeight: 800,
											fontSize: "14px",
											marginBottom: "4px"
										},
										children: ev.title
									}),
									ev.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: {
											margin: "0 0 6px",
											fontSize: "12px",
											opacity: .9,
											lineHeight: 1.4
										},
										children: ev.description
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "10px",
											fontSize: "11px",
											opacity: .85,
											flexWrap: "wrap"
										},
										children: [ev.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "3px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 11 }),
												" ",
												formatLocation(ev.location)
											]
										}), ev.department && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "3px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 11 }),
												" ",
												ev.department
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginTop: "8px",
											paddingTop: "6px",
											borderTop: "1px solid rgba(0,0,0,0.06)"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "8px"
											},
											children: [ev.meetingLink?.url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: ev.meetingLink.url,
												target: "_blank",
												rel: "noopener noreferrer",
												onClick: (e) => e.stopPropagation(),
												style: {
													padding: "3px 8px",
													borderRadius: "5px",
													background: "#059669",
													color: "#ffffff",
													fontSize: "11px",
													fontWeight: 700,
													textDecoration: "none",
													display: "inline-flex",
													alignItems: "center",
													gap: "4px"
												},
												title: "Join Google Meet Video Call",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 11 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Join Meet" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: getGoogleCalendarUrl(ev),
												target: "_blank",
												rel: "noopener noreferrer",
												style: {
													fontSize: "11px",
													fontWeight: 700,
													color: styleInfo.text,
													textDecoration: "none",
													display: "inline-flex",
													alignItems: "center",
													gap: "4px"
												},
												onClick: (e) => e.stopPropagation(),
												title: "Add event to Google Calendar",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add to G-Cal" })]
											})]
										}), isLongWeekend(ev.date) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												fontWeight: 800,
												color: "#b45309"
											},
											children: "🎉 3-Day Weekend"
										})]
									})
								]
							}, ev.id);
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "24px 16px",
							textAlign: "center",
							background: "var(--surface-hover, #f8fafc)",
							borderRadius: "10px",
							color: "var(--muted, #64748b)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
								size: 28,
								style: {
									margin: "0 auto 6px",
									opacity: .4
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: 0,
									fontSize: "13px",
									fontWeight: 600
								},
								children: "No official events scheduled."
							}),
							canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => openAddModal(selectedDate),
								style: {
									marginTop: "8px",
									background: "none",
									border: "none",
									color: "var(--teal, #006E6F)",
									fontSize: "12px",
									fontWeight: 700,
									cursor: "pointer"
								},
								children: "+ Schedule holiday on this day"
							}),
							birthdaysList.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									marginTop: "16px",
									padding: "12px",
									borderRadius: "10px",
									background: "#fdf2f8",
									border: "1px solid #fbcfe8",
									textAlign: "left"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "11px",
											fontWeight: 800,
											color: "#db2777",
											textTransform: "uppercase",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: 13 }),
											" ",
											MONTH_NAMES[currentDate.getMonth()],
											" Birthdays (",
											birthdaysList.length,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											fontWeight: 700,
											color: "#db2777",
											background: "#ffffff",
											padding: "1px 6px",
											borderRadius: "8px"
										},
										children: "Birthdays"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: "6px"
									},
									children: [birthdaysList.slice(0, 5).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => {
											if (b.date) {
												setSelectedDate(b.date);
												const [y, m, d] = b.date.split("-").map(Number);
												if (y && m && d) setCurrentDate(new Date(y, m - 1, d));
											}
										},
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											fontSize: "11.5px",
											color: "#9d174d",
											cursor: "pointer",
											padding: "4px 8px",
											borderRadius: "6px",
											background: "#ffffff",
											border: "1px solid #fce7f3",
											transition: "all 0.15s ease"
										},
										title: `Click to jump to ${b.date}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontWeight: 700,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap"
											},
											children: ["🎂 ", b.name]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "10.5px",
												fontWeight: 700,
												color: "#be185d",
												flexShrink: 0,
												marginLeft: "6px"
											},
											children: [b.date ? b.date.slice(5) : "", " →"]
										})]
									}, b.id)), birthdaysList.length > 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10px",
											color: "#db2777",
											fontWeight: 700,
											textAlign: "center",
											marginTop: "2px"
										},
										children: [
											"+",
											birthdaysList.length - 5,
											" more birthdays this month"
										]
									})]
								})]
							})
						]
					})]
				})]
			}),
			viewMode === "agenda" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				style: {
					padding: "24px",
					borderRadius: "14px",
					border: "1px solid var(--border, #e2e8f0)",
					background: "var(--card-bg, #ffffff)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "20px",
						flexWrap: "wrap",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						style: {
							fontSize: "11px",
							color: "var(--teal, #006E6F)",
							fontWeight: 700
						},
						children: "Chronological Schedule & Holidays"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						style: {
							margin: "4px 0 0",
							fontSize: "20px",
							fontWeight: 800,
							color: "var(--ink, #0f172a)"
						},
						children: [
							"Upcoming Holidays & Company Events (",
							Object.values(groupedAgendaEvents).flat().length,
							")"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "primary",
							onClick: () => openAddModal(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Add Holiday"]
						})
					})]
				}), Object.keys(groupedAgendaEvents).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "24px"
					},
					children: Object.keys(groupedAgendaEvents).sort().map((groupKey) => {
						const [yStr, mStr] = groupKey.split("-");
						const monthTitle = `${MONTH_NAMES[parseInt(mStr, 10) - 1]} ${yStr}`;
						const groupItems = groupedAgendaEvents[groupKey];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									paddingBottom: "8px",
									borderBottom: "2px solid var(--border, #f1f5f9)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: 0,
										fontSize: "16px",
										fontWeight: 800,
										color: "var(--ink, #1e293b)"
									},
									children: monthTitle
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--muted, #64748b)",
										background: "#f1f5f9",
										padding: "2px 8px",
										borderRadius: "12px"
									},
									children: [
										groupItems.length,
										" Event",
										groupItems.length > 1 ? "s" : ""
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "10px"
								},
								children: groupItems.map((ev) => {
									const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS["Company Holiday"];
									const countdown = getDaysUntil(ev.date);
									const longWeekend = isLongWeekend(ev.date);
									const isPast = countdown?.label === "Past";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											padding: "14px 18px",
											borderRadius: "12px",
											border: `1px solid ${styleInfo.border}`,
											background: isPast ? "#fafafa" : styleInfo.bg,
											opacity: isPast ? .75 : 1,
											flexWrap: "wrap",
											gap: "14px",
											transition: "all 0.15s ease",
											boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "16px",
												minWidth: "240px",
												flex: 1
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													minWidth: "58px",
													textAlign: "center",
													padding: "8px 10px",
													borderRadius: "10px",
													background: "#ffffff",
													border: `1px solid ${styleInfo.border}`,
													boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															fontSize: "10px",
															fontWeight: 800,
															color: styleInfo.text,
															textTransform: "uppercase"
														},
														children: MONTH_NAMES[parseInt(ev.date.slice(5, 7), 10) - 1]?.slice(0, 3)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															fontSize: "20px",
															fontWeight: 900,
															color: "var(--ink, #0f172a)",
															lineHeight: 1.1
														},
														children: ev.date.slice(8, 10)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															fontSize: "10px",
															fontWeight: 600,
															color: "var(--muted, #64748b)"
														},
														children: ev.day?.slice(0, 3) || "Day"
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													flexDirection: "column",
													gap: "4px"
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: {
															display: "flex",
															alignItems: "center",
															gap: "8px",
															flexWrap: "wrap"
														},
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																style: {
																	fontSize: "10px",
																	fontWeight: 800,
																	textTransform: "uppercase",
																	letterSpacing: "0.04em",
																	padding: "2px 8px",
																	borderRadius: "6px",
																	background: "#ffffff",
																	color: styleInfo.text,
																	border: `1px solid ${styleInfo.border}`
																},
																children: ev.category
															}),
															countdown && !isPast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																style: {
																	fontSize: "10px",
																	fontWeight: 700,
																	padding: "2px 8px",
																	borderRadius: "10px",
																	background: countdown.tone === "success" ? "#dcfce7" : countdown.tone === "info" ? "#e0f2fe" : "#f1f5f9",
																	color: countdown.tone === "success" ? "#166534" : countdown.tone === "info" ? "#0369a1" : "#64748b"
																},
																children: countdown.label
															}),
															longWeekend && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																style: {
																	fontSize: "10px",
																	fontWeight: 700,
																	padding: "2px 8px",
																	borderRadius: "10px",
																	background: "#fef3c7",
																	color: "#b45309"
																},
																children: "🎉 3-Day Weekend"
															}),
															ev.isPaid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																style: {
																	fontSize: "10px",
																	fontWeight: 600,
																	color: "#059669"
																},
																children: "• Paid Day Off"
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
														style: {
															margin: 0,
															fontSize: "16px",
															fontWeight: 800,
															color: "var(--ink, #0f172a)"
														},
														children: ev.title
													}),
													ev.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														style: {
															margin: "2px 0 0",
															fontSize: "12px",
															color: "var(--muted, #475569)",
															lineHeight: 1.4
														},
														children: ev.description
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: {
															display: "flex",
															alignItems: "center",
															gap: "12px",
															fontSize: "11px",
															color: "var(--muted, #64748b)",
															marginTop: "2px"
														},
														children: [ev.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															style: {
																display: "flex",
																alignItems: "center",
																gap: "3px"
															},
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 11 }),
																" ",
																formatLocation(ev.location)
															]
														}), ev.department && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															style: {
																display: "flex",
																alignItems: "center",
																gap: "3px"
															},
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 11 }),
																" ",
																ev.department
															]
														})]
													})
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "8px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
													href: getGoogleCalendarUrl(ev),
													target: "_blank",
													rel: "noopener noreferrer",
													style: {
														padding: "6px 12px",
														borderRadius: "6px",
														border: "1px solid var(--border, #cbd5e1)",
														background: "#ffffff",
														fontSize: "12px",
														fontWeight: 600,
														color: "#0284c7",
														textDecoration: "none",
														display: "inline-flex",
														alignItems: "center",
														gap: "5px"
													},
													title: "Add event to Google Calendar",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Add to G-Cal" })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "outline",
													onClick: () => setSelectedEvent(ev),
													style: {
														fontSize: "12px",
														padding: "6px 12px"
													},
													children: "Details"
												}),
												canManage && ev.type === "holiday" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														onClick: () => openEditModal(ev),
														title: "Edit Holiday",
														style: { padding: "6px" },
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { size: 14 })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														onClick: () => openDuplicateModal(ev),
														title: "Duplicate Holiday",
														style: { padding: "6px" },
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 14 })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														onClick: () => {
															setSelectedEvent(ev);
															setIsDeleteModalOpen(true);
														},
														title: "Delete Holiday",
														style: {
															color: "#ef4444",
															padding: "6px"
														},
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 14 })
													})
												] })
											]
										})]
									}, ev.id);
								})
							})]
						}, groupKey);
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "40px",
						textAlign: "center",
						color: "var(--muted, #64748b)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
							size: 40,
							style: {
								margin: "0 auto 10px",
								opacity: .3
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							style: {
								margin: "0 0 4px",
								fontSize: "15px",
								fontWeight: 700
							},
							children: "No holidays or events found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: 0,
								fontSize: "13px"
							},
							children: "Try clearing your search query or filters."
						})
					]
				})]
			}),
			viewMode === "upcoming" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingEventsView, {
				events: scopedEvents,
				onSelectEvent: setSelectedEvent,
				onCreateEvent: () => {
					setEditingEventData(null);
					setIsEventModalOpen(true);
				},
				canManage
			}),
			viewMode === "week" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyCalendarView, {
				currentDate,
				events: scopedEvents,
				onSelectDate: (d) => {
					setSelectedDate(d);
					setViewMode("day");
				},
				onSelectEvent: setSelectedEvent,
				onCreateEvent: (d) => {
					setEditingEventData({ date: d });
					setIsEventModalOpen(true);
				},
				isSmallScreen
			}),
			viewMode === "day" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DailyCalendarView, {
				selectedDate,
				events: scopedEvents,
				onSelectEvent: setSelectedEvent,
				onCreateEvent: (d) => {
					setEditingEventData({ date: d });
					setIsEventModalOpen(true);
				},
				canManage
			}),
			viewMode === "year" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				style: {
					padding: isSmallScreen ? "14px 10px" : "24px",
					borderRadius: "14px",
					border: "1px solid var(--border, #e2e8f0)",
					background: "var(--card-bg, #ffffff)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: isSmallScreen ? "1fr" : isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(240px, 1fr))",
						gap: isSmallScreen ? "12px" : "20px"
					},
					children: MONTH_NAMES.map((monthName, mIdx) => {
						const daysInM = new Date(currentYear, mIdx + 1, 0).getDate();
						const firstDay = new Date(currentYear, mIdx, 1).getDay();
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							onClick: () => {
								setCurrentDate(new Date(currentYear, mIdx, 1));
								setViewMode("month");
							},
							style: {
								padding: "12px",
								borderRadius: "10px",
								border: "1px solid var(--border, #e2e8f0)",
								cursor: "pointer",
								transition: "all 0.15s ease"
							},
							className: "hover-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontWeight: 800,
										fontSize: "14px",
										color: "var(--ink, #0f172a)",
										marginBottom: "8px",
										textAlign: "center"
									},
									children: monthName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(7, 1fr)",
										gap: "2px",
										textAlign: "center",
										fontSize: "9px",
										fontWeight: 700,
										color: "var(--muted, #94a3b8)",
										marginBottom: "4px"
									},
									children: [
										"S",
										"M",
										"T",
										"W",
										"T",
										"F",
										"S"
									].map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d }, i))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(7, 1fr)",
										gap: "2px",
										textAlign: "center",
										fontSize: "10px"
									},
									children: [Array.from({ length: firstDay }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}, `empty-${i}`)), Array.from({ length: daysInM }).map((_, i) => {
										const dayNum = i + 1;
										const dateStr = `${currentYear}-${String(mIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
										const dayEvents = eventsByDate.get(dateStr) || [];
										const hasHoliday = dayEvents.some((e) => e.type === "holiday");
										const hasCelebration = dayEvents.some((e) => e.isCelebration);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												padding: "3px 0",
												borderRadius: "4px",
												fontWeight: dayEvents.length > 0 ? 800 : 500,
												background: hasHoliday ? "#e0f2fe" : hasCelebration ? "#fef3c7" : "transparent",
												color: hasHoliday ? "#0369a1" : hasCelebration ? "#b45309" : "inherit"
											},
											children: dayNum
										}, dayNum);
									})]
								})
							]
						}, monthName);
					})
				})
			}),
			viewMode === "gallery" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				style: {
					padding: "24px",
					borderRadius: "14px",
					border: "1px solid var(--border, #e2e8f0)",
					background: "var(--card-bg, #ffffff)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "18px",
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						style: {
							fontSize: "11px",
							color: "var(--teal, #006E6F)",
							fontWeight: 700
						},
						children: "Visual Calendar Gallery"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							margin: "4px 0 0",
							fontSize: "20px",
							fontWeight: 800,
							color: "var(--ink, #0f172a)"
						},
						children: "Official Printed Holiday Schedules & Flyers"
					})] }), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: flyerInputRef,
						type: "file",
						multiple: true,
						accept: "image/*",
						style: { display: "none" },
						onChange: async (e) => {
							const files = e.target.files;
							if (!files || files.length === 0) return;
							const newItems = [];
							for (let i = 0; i < files.length; i++) {
								const file = files[i];
								const reader = new FileReader();
								const dataUrl = await new Promise((res) => {
									reader.onload = (ev) => res(ev.target.result);
									reader.readAsDataURL(file);
								});
								newItems.push({
									id: `flyer-${Date.now()}-${i}`,
									url: dataUrl,
									title: file.name.replace(/\.[^/.]+$/, ""),
									uploadedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
								});
							}
							hrStore.uploadHolidayCalendarImages(newItems, user?.name || "Admin");
							showNotice(`Uploaded ${newItems.length} calendar posters!`);
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "primary",
						onClick: () => flyerInputRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 15 }), " Upload Calendar Flyer"]
					})] })]
				}), flyerImages.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
						gap: "18px"
					},
					children: flyerImages.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							borderRadius: "12px",
							border: "1px solid var(--border, #e2e8f0)",
							overflow: "hidden",
							background: "#f8fafc"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: img.url,
							alt: img.title || "Calendar",
							style: {
								width: "100%",
								height: "220px",
								objectFit: "cover",
								cursor: "pointer"
							},
							onClick: () => {
								setFlyerIndex(idx);
								setIsFlyerLightbox(true);
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "12px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontWeight: 700,
									fontSize: "13px"
								},
								children: img.title || `Calendar Flyer ${idx + 1}`
							}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => hrStore.deleteHolidayCalendarImage(img.id, user?.name || "Admin"),
								style: { color: "#ef4444" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 14 })
							})]
						})]
					}, img.id || idx))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "40px",
						textAlign: "center",
						color: "var(--muted, #64748b)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, {
						size: 36,
						style: {
							margin: "0 auto 10px",
							opacity: .4
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "14px",
							fontWeight: 600
						},
						children: "No visual flyers uploaded yet."
					})]
				})]
			}),
			isFlyerLightbox && flyerImages[flyerIndex] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					position: "fixed",
					inset: 0,
					zIndex: 99999,
					background: "rgba(10, 15, 29, 0.95)",
					backdropFilter: "blur(10px)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					padding: "16px 24px"
				},
				onClick: () => setIsFlyerLightbox(false),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							width: "100%",
							zIndex: 10
						},
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										background: "rgba(255, 255, 255, 0.2)",
										color: "#ffffff",
										fontSize: "12px",
										fontWeight: 700,
										padding: "4px 12px",
										borderRadius: "16px"
									},
									children: [
										"Sheet ",
										flyerIndex + 1,
										" of ",
										flyerImages.length
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										color: "#ffffff",
										fontSize: "16px",
										fontWeight: 700
									},
									children: flyerImages[flyerIndex].title || `Holiday Calendar Poster ${flyerIndex + 1}`
								}),
								flyerImages[flyerIndex].uploadedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										color: "rgba(255, 255, 255, 0.6)",
										fontSize: "12px"
									},
									children: ["Uploaded ", flyerImages[flyerIndex].uploadedAt]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "10px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setZoomScale((s) => Math.max(.6, s - .25)),
									title: "Zoom Out",
									style: {
										background: "rgba(255, 255, 255, 0.15)",
										border: "1px solid rgba(255, 255, 255, 0.2)",
										color: "#ffffff",
										borderRadius: "6px",
										padding: "8px",
										cursor: "pointer"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomOut, { size: 16 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										color: "#ffffff",
										fontSize: "12px",
										minWidth: "45px",
										textAlign: "center",
										fontWeight: 600
									},
									children: [Math.round(zoomScale * 100), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setZoomScale((s) => Math.min(3, s + .25)),
									title: "Zoom In",
									style: {
										background: "rgba(255, 255, 255, 0.15)",
										border: "1px solid rgba(255, 255, 255, 0.2)",
										color: "#ffffff",
										borderRadius: "6px",
										padding: "8px",
										cursor: "pointer"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomIn, { size: 16 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setZoomScale(1),
									title: "Reset Zoom",
									style: {
										background: "rgba(255, 255, 255, 0.15)",
										border: "1px solid rgba(255, 255, 255, 0.2)",
										color: "#ffffff",
										borderRadius: "6px",
										padding: "8px 12px",
										fontSize: "12px",
										cursor: "pointer"
									},
									children: "100%"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: (e) => {
										e.stopPropagation();
										const img = flyerImages[flyerIndex];
										if (!img?.url) return;
										const a = document.createElement("a");
										a.href = img.url;
										a.download = `${img.title || "company-holiday-calendar"}.png`;
										document.body.appendChild(a);
										a.click();
										document.body.removeChild(a);
									},
									title: "Download Original High-Res Image",
									style: {
										background: "rgba(255, 255, 255, 0.18)",
										border: "1px solid rgba(255, 255, 255, 0.25)",
										color: "#ffffff",
										borderRadius: "6px",
										padding: "8px 12px",
										fontSize: "12px",
										fontWeight: 600,
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save Poster" })]
								}),
								canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: (e) => {
										e.stopPropagation();
										const img = flyerImages[flyerIndex];
										if (window.confirm(`Delete calendar flyer "${img.title || "Sheet"}"?`)) {
											hrStore.deleteHolidayCalendarImage(img.id, user?.name || "Admin");
											showNotice("Calendar flyer removed.");
											if (flyerIndex > 0) setFlyerIndex(flyerIndex - 1);
											else setIsFlyerLightbox(false);
										}
									},
									title: "Delete this flyer",
									style: {
										background: "rgba(239, 68, 68, 0.25)",
										border: "1px solid rgba(239, 68, 68, 0.4)",
										color: "#fca5a5",
										borderRadius: "6px",
										padding: "8px 12px",
										fontSize: "12px",
										fontWeight: 600,
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setIsFlyerLightbox(false),
									title: "Close Fullscreen (Esc)",
									style: {
										background: "rgba(239, 68, 68, 0.35)",
										border: "1px solid rgba(239, 68, 68, 0.5)",
										color: "#ffffff",
										borderRadius: "6px",
										padding: "8px 12px",
										fontSize: "13px",
										fontWeight: 600,
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: "6px",
										marginLeft: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Close" })]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							position: "relative",
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							overflow: "auto",
							padding: "16px"
						},
						onClick: (e) => e.stopPropagation(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: flyerImages[flyerIndex].url,
							alt: flyerImages[flyerIndex].title || "Official Holiday Calendar Fullscreen",
							style: {
								maxWidth: "96vw",
								maxHeight: "84vh",
								objectFit: "contain",
								transform: `scale(${zoomScale})`,
								transition: "transform 0.15s ease-out",
								borderRadius: "8px",
								boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"
							}
						}), flyerImages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFlyerIndex((prev) => (prev - 1 + flyerImages.length) % flyerImages.length),
							title: "Previous sheet (Left Arrow)",
							style: {
								position: "fixed",
								left: "24px",
								top: "50%",
								transform: "translateY(-50%)",
								width: "52px",
								height: "52px",
								borderRadius: "50%",
								background: "rgba(15, 23, 42, 0.85)",
								border: "1px solid rgba(255, 255, 255, 0.3)",
								color: "#ffffff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
								zIndex: 20
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 28 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFlyerIndex((prev) => (prev + 1) % flyerImages.length),
							title: "Next sheet (Right Arrow)",
							style: {
								position: "fixed",
								right: "24px",
								top: "50%",
								transform: "translateY(-50%)",
								width: "52px",
								height: "52px",
								borderRadius: "50%",
								background: "rgba(15, 23, 42, 0.85)",
								border: "1px solid rgba(255, 255, 255, 0.3)",
								color: "#ffffff",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
								boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
								zIndex: 20
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 28 })
						})] })]
					}),
					flyerImages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							gap: "12px",
							zIndex: 10,
							padding: "8px 0"
						},
						onClick: (e) => e.stopPropagation(),
						children: flyerImages.map((img, idx) => {
							const isActive = idx === flyerIndex;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setFlyerIndex(idx),
								style: {
									width: "64px",
									height: "42px",
									borderRadius: "4px",
									overflow: "hidden",
									padding: 0,
									border: isActive ? "2px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.25)",
									opacity: isActive ? 1 : .6,
									cursor: "pointer",
									background: "#0f172a"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: img.url,
									alt: "",
									style: {
										width: "100%",
										height: "100%",
										objectFit: "cover"
									}
								})
							}, img.id || idx);
						})
					})
				]
			}),
			selectedEvent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventDetailModal, {
				event: selectedEvent,
				onClose: () => setSelectedEvent(null),
				onEdit: (ev) => {
					if (ev.type === "holiday") openEditModal(ev);
					else {
						setEditingEventData(ev);
						setIsEventModalOpen(true);
					}
				},
				onDeleted: () => {
					loadEvents();
					setSelectedEvent(null);
				},
				onRsvpUpdated: () => {
					loadEvents();
				},
				user,
				canManage,
				categoryStyles: CATEGORY_COLORS
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventFormModal, {
				isOpen: isEventModalOpen,
				onClose: () => {
					setIsEventModalOpen(false);
					setEditingEventData(null);
				},
				onSaved: () => {
					loadEvents();
					setIsEventModalOpen(false);
					setEditingEventData(null);
				},
				initialEvent: editingEventData,
				employees: (storeState?.employees || []).map((emp) => ({
					id: emp.id || emp.employeeId || emp._id,
					name: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.workEmail || "Staff",
					email: emp.email || emp.workEmail || "",
					department: emp.department || "",
					role: emp.role || emp.designation || "",
					avatar: emp.avatar || null
				})),
				departments: Array.isArray(storeState?.departments) ? storeState.departments.map((d) => typeof d === "string" ? d : d.name) : [
					"All",
					"Engineering",
					"Human Resources",
					"Design",
					"Marketing",
					"Sales",
					"Operations",
					"Finance"
				],
				user,
				defaultDate: editingEventData?.date || selectedDate
			}),
			(isAddModalOpen || isEditModalOpen) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					background: "rgba(15, 23, 42, 0.6)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1e3,
					padding: "16px",
					backdropFilter: "blur(3px)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						width: "100%",
						maxWidth: "560px",
						background: "var(--card-bg, #ffffff)",
						borderRadius: "16px",
						padding: "24px",
						boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
						border: "1px solid var(--border, #e2e8f0)",
						maxHeight: "90vh",
						overflowY: "auto"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "16px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: 0,
								fontSize: "18px",
								fontWeight: 800
							},
							children: isEditModalOpen ? "Edit Holiday Record" : "Schedule Official Company Holiday"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setIsAddModalOpen(false);
								setIsEditModalOpen(false);
							},
							style: {
								background: "none",
								border: "none",
								cursor: "pointer",
								color: "#64748b"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: isEditModalOpen ? handleUpdateHoliday : handleCreateHoliday,
						style: {
							display: "flex",
							flexDirection: "column",
							gap: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Holiday Name / Title *",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									required: true,
									placeholder: "e.g. Gandhi Jayanti, Diwali, Annual Offsite",
									value: holidayForm.name,
									onChange: (e) => setHolidayForm({
										...holidayForm,
										name: e.target.value
									}),
									style: {
										width: "100%",
										padding: "9px 12px",
										borderRadius: "8px",
										border: "1px solid var(--border, #cbd5e1)"
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Start Date *",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										required: true,
										value: holidayForm.date,
										onChange: (e) => setHolidayForm({
											...holidayForm,
											date: e.target.value,
											endDate: holidayForm.endDate || e.target.value
										}),
										style: {
											width: "100%",
											padding: "9px 12px",
											borderRadius: "8px",
											border: "1px solid var(--border, #cbd5e1)"
										}
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "End Date (for multi-day)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										value: holidayForm.endDate,
										onChange: (e) => setHolidayForm({
											...holidayForm,
											endDate: e.target.value
										}),
										style: {
											width: "100%",
											padding: "9px 12px",
											borderRadius: "8px",
											border: "1px solid var(--border, #cbd5e1)"
										}
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
									label: "Holiday Category",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: holidayForm.category,
										onChange: (e) => setHolidayForm({
											...holidayForm,
											category: e.target.value
										}),
										style: {
											width: "100%",
											padding: "9px 12px",
											borderRadius: "8px",
											border: "1px solid var(--border, #cbd5e1)"
										},
										children: ALL_CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: cat,
											children: cat
										}, cat))
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Applicable Location",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: holidayForm.location,
										onChange: (e) => setHolidayForm({
											...holidayForm,
											location: e.target.value
										}),
										placeholder: "All Locations / Ignite Campus",
										style: {
											width: "100%",
											padding: "9px 12px",
											borderRadius: "8px",
											border: "1px solid var(--border, #cbd5e1)"
										}
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Applicable Departments (comma separated, or 'All')",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: Array.isArray(holidayForm.applicableDepartments) ? holidayForm.applicableDepartments.join(", ") : "All",
									onChange: (e) => setHolidayForm({
										...holidayForm,
										applicableDepartments: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
									}),
									placeholder: "All or Engineering, Marketing, HR",
									style: {
										width: "100%",
										padding: "9px 12px",
										borderRadius: "8px",
										border: "1px solid var(--border, #cbd5e1)"
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "20px",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										fontSize: "13px",
										fontWeight: 600,
										cursor: "pointer"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: holidayForm.isPaid,
										onChange: (e) => setHolidayForm({
											...holidayForm,
											isPaid: e.target.checked
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paid Holiday" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										fontSize: "13px",
										fontWeight: 600,
										cursor: "pointer"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: holidayForm.isRecurring,
										onChange: (e) => setHolidayForm({
											...holidayForm,
											isRecurring: e.target.checked
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Annual Recurring Holiday" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Description / Observance Details",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 3,
									value: holidayForm.description,
									onChange: (e) => setHolidayForm({
										...holidayForm,
										description: e.target.value
									}),
									placeholder: "Details regarding holiday observance, offices affected, celebration rules...",
									style: {
										width: "100%",
										padding: "9px 12px",
										borderRadius: "8px",
										border: "1px solid var(--border, #cbd5e1)"
									}
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: "10px",
									marginTop: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									onClick: () => {
										setIsAddModalOpen(false);
										setIsEditModalOpen(false);
									},
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "primary",
									children: isEditModalOpen ? "Save Changes" : "Create Holiday"
								})]
							})
						]
					})]
				})
			}),
			isDuplicateModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					background: "rgba(15, 23, 42, 0.6)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1e3,
					padding: "16px",
					backdropFilter: "blur(3px)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						width: "100%",
						maxWidth: "440px",
						background: "var(--card-bg, #ffffff)",
						borderRadius: "16px",
						padding: "24px",
						boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 12px",
								fontSize: "18px",
								fontWeight: 800
							},
							children: "Duplicate Holiday"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								margin: "0 0 16px",
								fontSize: "13px",
								color: "var(--muted, #64748b)"
							},
							children: [
								"Duplicate ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
									"\"",
									selectedEvent?.title,
									"\""
								] }),
								" to another year or custom date."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleDuplicateHoliday,
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Target Date (YYYY-MM-DD)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									required: true,
									value: duplicateTargetDate,
									onChange: (e) => setDuplicateTargetDate(e.target.value),
									style: {
										width: "100%",
										padding: "9px 12px",
										borderRadius: "8px",
										border: "1px solid var(--border, #cbd5e1)"
									}
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									onClick: () => setIsDuplicateModalOpen(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "primary",
									children: "Duplicate Holiday"
								})]
							})]
						})
					]
				})
			}),
			isDeleteModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					background: "rgba(15, 23, 42, 0.6)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1e3,
					padding: "16px",
					backdropFilter: "blur(3px)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						width: "100%",
						maxWidth: "420px",
						background: "var(--card-bg, #ffffff)",
						borderRadius: "16px",
						padding: "24px",
						boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "10px",
								color: "#b91c1c",
								marginBottom: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 24 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: 0,
									fontSize: "18px",
									fontWeight: 800
								},
								children: "Confirm Holiday Deletion"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								margin: "0 0 20px",
								fontSize: "13px",
								color: "var(--ink, #334155)",
								lineHeight: 1.5
							},
							children: [
								"Are you sure you want to remove ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
									"\"",
									selectedEvent?.title,
									"\""
								] }),
								" on ",
								selectedEvent?.date,
								"? This administrative action will be recorded in the audit log."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								onClick: () => setIsDeleteModalOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								onClick: handleDeleteHoliday,
								style: {
									background: "#ef4444",
									color: "#ffffff",
									border: "none"
								},
								children: "Yes, Delete Holiday"
							})]
						})
					]
				})
			}),
			isImportModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					background: "rgba(15, 23, 42, 0.6)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					zIndex: 1e3,
					padding: "16px",
					backdropFilter: "blur(3px)"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						width: "100%",
						maxWidth: "680px",
						background: "var(--card-bg, #ffffff)",
						borderRadius: "16px",
						padding: "24px",
						maxHeight: "90vh",
						overflowY: "auto",
						boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: 0,
									fontSize: "18px",
									fontWeight: 800
								},
								children: "Bulk Import Holidays via CSV"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: "2px 0 0",
									fontSize: "12px",
									color: "var(--muted, #64748b)"
								},
								children: "Upload a spreadsheet to bulk-register annual holidays with duplicate prevention."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setIsImportModalOpen(false),
								style: {
									background: "none",
									border: "none",
									cursor: "pointer"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "16px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: handleDownloadSampleCsv,
								style: { fontSize: "12px" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { size: 14 }), " Download Sample CSV Template"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								border: "2px dashed var(--border, #cbd5e1)",
								borderRadius: "12px",
								padding: "30px",
								textAlign: "center",
								background: "#f8fafc",
								cursor: "pointer",
								marginBottom: "16px"
							},
							onClick: () => document.getElementById("csv-file-input")?.click(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
									size: 32,
									style: {
										margin: "0 auto 10px",
										color: "var(--teal, #006E6F)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: 0,
										fontSize: "13px",
										fontWeight: 600
									},
									children: "Click to select or drag and drop CSV file"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: "4px 0 0",
										fontSize: "11px",
										color: "var(--muted, #94a3b8)"
									},
									children: "Accepted columns: Holiday Name, Date, End Date, Category, Location, Departments, Paid/Unpaid, Description"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "csv-file-input",
									type: "file",
									accept: ".csv",
									style: { display: "none" },
									onChange: handleCsvFileUpload
								})
							]
						}),
						importPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { marginBottom: "16px" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "14px",
									marginBottom: "10px",
									fontSize: "12px",
									fontWeight: 700
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: { color: "#059669" },
									children: [
										"✔ ",
										importPreview.summary?.validCount || 0,
										" Valid Rows"
									]
								}), importPreview.summary?.invalidCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: { color: "#dc2626" },
									children: [
										"✖ ",
										importPreview.summary?.invalidCount,
										" Invalid/Duplicate Rows"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									maxHeight: "180px",
									overflowY: "auto",
									border: "1px solid var(--border, #e2e8f0)",
									borderRadius: "8px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									style: {
										width: "100%",
										borderCollapse: "collapse",
										fontSize: "11px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										style: {
											background: "#f1f5f9",
											position: "sticky",
											top: 0
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												style: {
													padding: "6px",
													textAlign: "left"
												},
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												style: {
													padding: "6px",
													textAlign: "left"
												},
												children: "Holiday Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												style: {
													padding: "6px",
													textAlign: "left"
												},
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												style: {
													padding: "6px",
													textAlign: "left"
												},
												children: "Category"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [(importPreview.validPreview || []).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										style: { borderBottom: "1px solid #f1f5f9" },
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: {
													padding: "6px",
													color: "#059669",
													fontWeight: 700
												},
												children: "✔ Valid"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: { padding: "6px" },
												children: row.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: { padding: "6px" },
												children: row.date
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: { padding: "6px" },
												children: row.category
											})
										]
									}, i)), (importPreview.invalidRows || []).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										style: {
											borderBottom: "1px solid #fee2e2",
											background: "#fef2f2"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: {
													padding: "6px",
													color: "#dc2626",
													fontWeight: 700
												},
												children: "✖ Error"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: { padding: "6px" },
												children: row.data?.name || row.data?.["Holiday Name"] || "Row " + row.rowNumber
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: { padding: "6px" },
												children: row.data?.date || "-"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												style: {
													padding: "6px",
													color: "#b91c1c"
												},
												children: row.reason
											})
										]
									}, `inv-${i}`))] })]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setIsImportModalOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								disabled: !importPreview || importPreview.summary?.validCount === 0 || isImporting,
								onClick: handleCommitImport,
								children: isImporting ? "Importing..." : `Commit Import (${importPreview?.summary?.validCount || 0} holidays)`
							})]
						})
					]
				})
			}),
			isGoogleSyncModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					position: "fixed",
					inset: 0,
					background: "rgba(15, 23, 42, 0.65)",
					backdropFilter: "blur(4px)",
					zIndex: 1e3,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "16px"
				},
				onClick: () => setIsGoogleSyncModalOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "#ffffff",
						borderRadius: "16px",
						maxWidth: "520px",
						width: "100%",
						padding: "24px",
						boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
						position: "relative"
					},
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
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
										borderRadius: "10px",
										background: "#e0f2fe",
										color: "#0284c7",
										display: "flex",
										alignItems: "center",
										justifyContent: "center"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, {
										size: 22,
										color: "#059669"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: 0,
										fontSize: "17px",
										fontWeight: 800,
										color: "var(--ink, #0f172a)"
									},
									children: "Google Calendar & Meet Integration"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "12px",
										color: "#64748b"
									},
									children: "Video conferences, calendar sync, and meeting links"
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setIsGoogleSyncModalOpen(false),
								style: {
									background: "none",
									border: "none",
									cursor: "pointer",
									color: "#64748b"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "14px",
								marginBottom: "20px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "14px",
										borderRadius: "10px",
										background: "#f0fdf4",
										border: "1px solid #bbf7d0",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "13px",
											fontWeight: 700,
											color: "#065f46",
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
											width: "8px",
											height: "8px",
											borderRadius: "50%",
											background: "#10b981",
											display: "inline-block"
										} }), "Google Meet Video Call Engine"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "11.5px",
											color: "#047857",
											marginTop: "2px"
										},
										children: "Auto-generates room codes (`meet.google.com/xxx-yyyy-zzz`) for meetings and interviews."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: "https://meet.google.com/new",
										target: "_blank",
										rel: "noopener noreferrer",
										style: {
											padding: "6px 12px",
											borderRadius: "6px",
											background: "#059669",
											color: "#ffffff",
											fontSize: "11px",
											fontWeight: 700,
											textDecoration: "none",
											display: "inline-flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { size: 12 }), " Test Meet"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "14px",
										borderRadius: "10px",
										background: "#eff6ff",
										border: "1px solid #bfdbfe",
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "13px",
											fontWeight: 700,
											color: "#1e40af",
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
											width: "8px",
											height: "8px",
											borderRadius: "50%",
											background: "#3b82f6",
											display: "inline-block"
										} }), "Personal & Team Google Calendar Sync"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "11.5px",
											color: "#1d4ed8",
											marginTop: "2px"
										},
										children: "1-Click \"Add to Google Calendar\" active on all holidays, team meetings, and deadlines."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										onClick: () => calendarService.downloadExport("ics", currentYear),
										style: {
											fontSize: "11px",
											padding: "5px 10px"
										},
										children: "Export .ICS"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "14px",
										borderRadius: "10px",
										background: "#f8fafc",
										border: "1px solid #e2e8f0"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "12.5px",
												fontWeight: 700,
												color: "#1e293b",
												marginBottom: "4px"
											},
											children: "Enterprise Google Workspace OAuth"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											style: {
												margin: "0 0 10px",
												fontSize: "11.5px",
												color: "#64748b",
												lineHeight: 1.4
											},
											children: "Connect your company's official Google Workspace to directly synchronize events with employees' primary Google Calendar accounts."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												flexWrap: "wrap",
												gap: "8px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "11px",
													color: googleIntegration?.isConnected ? "#059669" : "#64748b",
													fontWeight: 600
												},
												children: googleIntegration?.isConnected ? `Connected: ${googleIntegration.accountEmail}` : "Status: Ready (Direct Meet & G-Cal Links Active)"
											}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: async () => {
													try {
														const res = await calendarService.connectGoogle();
														if (res.authUrl) window.open(res.authUrl, "_blank");
														else showNotice(res.message || "Google OAuth credentials not configured in environment variables.");
													} catch (err) {
														showNotice(err.message || "Google OAuth not configured in server .env.");
													}
												},
												style: {
													padding: "5px 12px",
													background: "#ffffff",
													border: "1px solid #cbd5e1",
													borderRadius: "6px",
													fontSize: "11px",
													fontWeight: 700,
													color: "#0284c7",
													cursor: "pointer"
												},
												children: "Connect Google Workspace"
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								onClick: () => setIsGoogleSyncModalOpen(false),
								children: "Done"
							})
						})
					]
				})
			})
		]
	});
}
// src/components/HolidayCalendarShowcase.jsx
function HolidayCalendarShowcase(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnterpriseCalendar, { ...props });
}
// src/components/calendar/CalendarWidgets.jsx
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
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	const allBirthdays = (0, import_react.useMemo)(() => {
		const todayDateObj = /* @__PURE__ */ new Date();
		todayDateObj.setHours(0, 0, 0, 0);
		return (storeState.employees || []).map((e) => {
			const dobInfo = extractEmployeeDob(e);
			if (!dobInfo) return null;
			const m = dobInfo.month;
			const d = parseInt(dobInfo.day, 10);
			let nextYear = currentYear;
			if (new Date(currentYear, m - 1, d) < todayDateObj) nextYear = currentYear + 1;
			const nextDate = new Date(nextYear, m - 1, d);
			const daysRemaining = Math.max(0, Math.ceil((nextDate - todayDateObj) / 864e5));
			return {
				id: e.id || e._id,
				employeeId: e.employeeId,
				name: e.displayName || e.name || "Team Member",
				department: e.department || "General",
				designation: e.designation || "Team Member",
				avatarUrl: e.avatarUrl || null,
				month: m,
				day: d,
				formattedDate: `${d} ${monthNames[m - 1]}`,
				date: `${nextYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
				daysRemaining,
				isThisMonth: m === currentMonth
			};
		}).filter(Boolean).sort((a, b) => a.daysRemaining - b.daysRemaining);
	}, [
		storeState.employees,
		currentYear,
		currentMonth,
		todayStr
	]);
	const birthdaysThisMonth = widgetsData?.birthdaysThisMonth?.length ? widgetsData.birthdaysThisMonth : allBirthdays.filter((b) => b.isThisMonth);
	const upcomingBirthdays = widgetsData?.upcomingBirthdays?.length ? widgetsData.upcomingBirthdays : allBirthdays;
	const nextUpcomingBirthday = upcomingBirthdays[0] || allBirthdays[0] || null;
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
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cake, { size: 13 }),
							" ",
							birthdaysThisMonth.length > 0 ? "Birthdays This Month" : "Upcoming Birthdays"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							background: "#fdf2f8",
							color: "#db2777",
							padding: "2px 8px",
							borderRadius: "12px",
							fontWeight: 700
						},
						children: birthdaysThisMonth.length > 0 ? `${birthdaysThisMonth.length} Birthdays` : nextUpcomingBirthday ? `Next: ${nextUpcomingBirthday.formattedDate || nextUpcomingBirthday.date?.slice(5)}` : "0 on record"
					})]
				}), birthdaysThisMonth.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "6px"
					},
					children: birthdaysThisMonth.slice(0, 3).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								b.formattedDate || (b.date ? b.date.slice(5) : ""),
								" (",
								b.department,
								")"
							]
						})]
					}, b.id))
				}) : upcomingBirthdays.length > 0 && nextUpcomingBirthday ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							margin: "0 0 2px",
							fontSize: "11.5px",
							color: "var(--muted, #64748b)"
						},
						children: [
							"Next up: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "#db2777" },
								children: nextUpcomingBirthday.name
							}),
							" (",
							nextUpcomingBirthday.formattedDate || nextUpcomingBirthday.date?.slice(5),
							")",
							nextUpcomingBirthday.daysRemaining === 0 ? " — Today! 🎂" : ` in ${nextUpcomingBirthday.daysRemaining} days`
						]
					}), upcomingBirthdays.slice(0, 2).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							fontSize: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontWeight: 600,
								color: "var(--ink, #1e293b)"
							},
							children: ["🎂 ", b.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								color: "var(--muted, #64748b)",
								fontSize: "11px"
							},
							children: [
								b.formattedDate || (b.date ? b.date.slice(5) : ""),
								" (",
								b.department,
								")"
							]
						})]
					}, b.id))]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: 0,
						fontSize: "12px",
						color: "var(--muted, #64748b)"
					},
					children: "No dates of birth on record. Add statutory birth dates in Employee Directory."
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
						children: ["Corporate Calendar ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 14 })]
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
export { HolidayCalendarShowcase as n, CalendarWidgets as t };
