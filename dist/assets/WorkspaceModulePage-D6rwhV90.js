import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { Dt as FileText, Ft as Download, Gt as CircleAlert, I as Send, K as Plus, L as Search, P as Settings2, Rt as Copy, U as Radio, V as RefreshCw, Vt as Clock3, W as Printer, Wt as CircleCheck, X as PenLine, Xt as Check, Zt as ChartColumn, _n as require_react, a as Wifi, at as MapPin, b as Ticket, bt as Heart, d as Users, hn as ArrowLeft, i as X, nn as Calculator, ot as Mail, rt as Megaphone, s as WalletCards, y as Trash } from "./icons-vendor-CNlTUIuG.js";
import { r as require_react_dom } from "./react-vendor-B_MMQ54z.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { D as storeAction, P as workspaceAction, T as hrStore, a as Field, c as StatusBadge, i as EmptyState, k as todayKey, n as ConfirmationDialog, o as PageHeader, r as DataTable, t as Button, x as useAuth } from "./index-_IeDfSQA.js";
import { n as formatINR, t as amountInWordsINR } from "./currency-oCUzM0NR.js";
import { n as HolidayCalendarShowcase } from "./CalendarWidgets-D5g7OMHx.js";
import { AdminUsersModule } from "./AdminDashboardPage-BxBCs1CI.js";
import { a as PerformanceWorkspace, i as CompanyPoliciesView, n as getDailyAttendanceStatus, o as WorkspaceNotifications, r as getLateCountInfo, s as WorkspaceReports, t as CompanyDocumentsView } from "./CompanyDocumentsView-CnElIGDt.js";
// src/utils/attendancePresence.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = require_react_dom();
/**
* Centralized Attendance Presence & Geofence Resolver
* Resolves accuracy-aware physical presence, separates network type from physical location,
* and tracks authoritative live location freshness badges:
* - LIVE (fresh GPS fix)
* - STALE (last fix > threshold)
* - OFFLINE (device disconnected)
* - LOCATION UNAVAILABLE (GPS disabled / permission denied)
* - UNCERTAIN (low GPS accuracy > 100m)
*/
function resolveAttendancePresence(r, maxGeofenceRadius = 50) {
	const live = r?.liveLocation || {};
	const punch = r?.punchInLocation || {};
	const effectiveGeofenceStatus = live.geofenceStatus || r?.geofenceStatus || "unknown";
	const dist = live.distanceMeters !== void 0 && live.distanceMeters !== null ? live.distanceMeters : r?.distanceMeters !== void 0 && r?.distanceMeters !== null ? r.distanceMeters : null;
	const acc = live.accuracy !== void 0 && live.accuracy !== null ? live.accuracy : r?.accuracy !== void 0 && r?.accuracy !== null ? r.accuracy : null;
	const gpsVerified = Boolean(live.gpsVerified ?? r?.gpsVerified);
	const wifiVerified = Boolean(live.wifiVerified ?? r?.wifiVerified);
	const tolerance = acc ? Math.min(Math.max(0, acc * .35), 35) : 0;
	const isDistanceInside = dist !== null && (dist <= maxGeofenceRadius || dist - tolerance <= maxGeofenceRadius);
	const isInside = effectiveGeofenceStatus === "inside" || gpsVerified || wifiVerified || isDistanceInside;
	const isUncertain = !isInside && (effectiveGeofenceStatus === "uncertain" || acc !== null && acc > 100);
	const isOutside = !isInside && !isUncertain && (effectiveGeofenceStatus === "outside" || dist !== null && dist > maxGeofenceRadius);
	const rawSsid = live.wifiSSID || r?.wifiSSID || "";
	const displaySsid = /airtel|dji|3052/i.test(rawSsid) ? "Edufyi" : /^edufyi$/i.test(rawSsid) ? "Edufyi" : rawSsid || (wifiVerified ? "Edufyi" : "");
	let networkLabel = "Office Wi-Fi";
	let networkTone = "verified";
	if (wifiVerified) {
		networkLabel = "Office Wi-Fi";
		networkTone = "verified";
	} else if (isInside) {
		networkLabel = "Mobile Data • On-Site";
		networkTone = "on-site";
	} else {
		networkLabel = "External / Remote";
		networkTone = "remote";
	}
	const rawFreshness = live.locationFreshness || (r?.checkOut ? "offline" : "live");
	let statusBadge = {
		key: "live",
		label: "LIVE",
		tone: "live"
	};
	if (r?.checkOut || live.connectivityStatus === "offline" || r?.isOnline === false || rawFreshness === "offline") statusBadge = {
		key: "offline",
		label: "OFFLINE",
		tone: "offline"
	};
	else if (live.locationPermission === "denied" || effectiveGeofenceStatus === "location_unavailable" || rawFreshness === "unavailable" || !live.latitude && !gpsVerified && !wifiVerified) statusBadge = {
		key: "unavailable",
		label: "LOCATION UNAVAILABLE",
		tone: "unavailable"
	};
	else if (isUncertain || rawFreshness === "uncertain" || acc !== null && acc > 100) statusBadge = {
		key: "uncertain",
		label: "UNCERTAIN",
		tone: "uncertain"
	};
	else if (rawFreshness === "stale") statusBadge = {
		key: "stale",
		label: "STALE",
		tone: "stale"
	};
	else statusBadge = {
		key: "live",
		label: "LIVE",
		tone: "live"
	};
	return {
		isInside,
		isUncertain,
		isOutside,
		dist,
		acc,
		distText: dist !== null ? `${Math.round(dist)}m` : wifiVerified ? `≤${maxGeofenceRadius}m` : "—",
		accText: acc ? `±${Math.round(acc)}m` : "",
		networkLabel,
		networkTone,
		displaySsid,
		freshness: statusBadge.tone,
		statusBadge,
		locationName: live.locationName || r?.locationName || "Ignite Campus",
		punchInDist: punch.distanceMeters ?? r?.distanceMeters ?? null
	};
}
// src/pages/WorkspaceModulePage.jsx
var import_jsx_runtime = require_jsx_runtime();
var workspaceHandler = (handler) => workspaceAction(hrStore, handler);
function formatShiftDisplay(shiftStr, shiftCode, attendanceRules) {
	if (attendanceRules?.workStartTime && attendanceRules?.workEndTime) {
		const f12 = (t, isEnd = false) => {
			if (!t) return "";
			const m = String(t).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
			if (!m) return t;
			let h = parseInt(m[1], 10);
			const min = m[2];
			const meridiem = m[3]?.toUpperCase();
			if (meridiem === "PM" && h < 12) h += 12;
			if (meridiem === "AM" && h === 12) h = 0;
			if (!meridiem && isEnd && h >= 1 && h <= 11) h += 12;
			const ampm = h >= 12 ? "PM" : "AM";
			h = h % 12 || 12;
			return `${String(h).padStart(2, "0")}:${min} ${ampm}`;
		};
		return `General (${f12(attendanceRules.workStartTime, false)} – ${f12(attendanceRules.workEndTime, true)})`;
	}
	if (!shiftStr || shiftStr.includes("09:30")) return "General (11:00 AM – 08:00 PM)";
	return shiftStr;
}
function AttendanceModule() {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [activeTab, setActiveTab] = (0, import_react.useState)("roster");
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(todayKey);
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [campusFilter, setCampusFilter] = (0, import_react.useState)("all");
	const [presenceViewMode, setPresenceViewMode] = (0, import_react.useState)("all");
	const [showMarkModal, setShowMarkModal] = (0, import_react.useState)(false);
	const [markForm, setMarkForm] = (0, import_react.useState)({
		employeeId: "",
		date: todayKey(),
		status: "present",
		checkIn: "09:15 AM",
		checkOut: "06:15 PM",
		wifiSSID: storeState.companySettings?.allowedWifiSSIDs?.[0] || "Edufyi",
		notes: ""
	});
	const [editingAttendance, setEditingAttendance] = (0, import_react.useState)(null);
	const [attendanceToDelete, setAttendanceToDelete] = (0, import_react.useState)(null);
	const [newWifiSSID, setNewWifiSSID] = (0, import_react.useState)("");
	const branchLocations = storeState.companySettings?.locations || [];
	const [hrWifiBranch, setHrWifiBranch] = (0, import_react.useState)(() => branchLocations[0]?.name || "IGNITE CAMPUS");
	const [exportNotice, setExportNotice] = (0, import_react.useState)(false);
	const [syncSuccess, setSyncSuccess] = (0, import_react.useState)(false);
	const [feedbackNotice, setFeedbackNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (selectedDate !== todayKey()) return;
		const pollInterval = setInterval(() => {
			hrStore.refresh().catch(() => {});
		}, 25e3);
		return () => clearInterval(pollInterval);
	}, [selectedDate]);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => {
			setStoreState(state);
			const locs = state.companySettings?.locations || [];
			if (locs.length > 0) setHrWifiBranch((prev) => !prev || prev === "HQ - San Francisco" ? locs[0].name : prev);
		});
	}, []);
	function showFeedback(msg) {
		setFeedbackNotice(msg);
		setTimeout(() => setFeedbackNotice(""), 4e3);
	}
	const allAttendance = storeState.attendance || [];
	const allEmployees = storeState.employees || [];
	const wifiNetworks = storeState.companySettings?.wifiNetworks || [];
	const maxGeofenceRadius = Number(storeState.companySettings?.attendanceRules?.maxGeofenceRadiusMeters) || 50;
	const monthlyAttendance = allAttendance.filter((record) => record.date.startsWith(selectedDate.slice(0, 7)));
	const calendarDays = new Date(Number(selectedDate.slice(0, 4)), Number(selectedDate.slice(5, 7)), 0).getDate();
	const empMap = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		(storeState.employees || []).forEach((e) => {
			if (e.employeeId) map.set(e.employeeId.toUpperCase(), e);
			if (e.id) map.set(String(e.id), e);
			if (e._id) map.set(String(e._id), e);
		});
		return map;
	}, [storeState.employees]);
	const availableCampuses = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set(["Ignite Campus", "Velocity Hub"]);
		(storeState.companySettings?.locations || []).forEach((l) => {
			if (l.name) set.add(l.name);
		});
		(storeState.employees || []).forEach((e) => {
			const loc = e.campus || e.location || e.branch;
			if (loc) set.add(loc);
		});
		return Array.from(set).filter(Boolean);
	}, [storeState.companySettings?.locations, storeState.employees]);
	const baseDailyAttendance = allAttendance.filter((item) => {
		if (item.date !== selectedDate) return false;
		if (search) {
			const q = search.toLowerCase();
			if (!item.employeeName?.toLowerCase().includes(q) && !item.employeeId?.toLowerCase().includes(q)) return false;
		}
		if (statusFilter !== "all" && item.status !== statusFilter) return false;
		if (campusFilter !== "all") {
			const emp = empMap.get(String(item.employeeId || "").toUpperCase());
			if ((item.campus || item.location || item.branch || emp?.campus || emp?.location || emp?.branch || "Ignite Campus").toLowerCase() !== campusFilter.toLowerCase()) return false;
		}
		return true;
	});
	const dailyAttendance = (0, import_react.useMemo)(() => {
		if (presenceViewMode === "working") return baseDailyAttendance.filter((a) => Boolean(a.checkIn) && !a.checkOut);
		if (presenceViewMode === "punched_out") return baseDailyAttendance.filter((a) => Boolean(a.checkIn) && Boolean(a.checkOut));
		return baseDailyAttendance;
	}, [baseDailyAttendance, presenceViewMode]);
	const summaryEmployees = allEmployees.filter((emp) => {
		if (campusFilter !== "all") {
			if ((emp.campus || emp.location || emp.branch || "Ignite Campus").toLowerCase() !== campusFilter.toLowerCase()) return false;
		}
		return true;
	});
	const dayRecords = allAttendance.filter((a) => a.date === selectedDate);
	const punchedInWorking = (0, import_react.useMemo)(() => {
		return dayRecords.filter((a) => Boolean(a.checkIn) && !a.checkOut);
	}, [dayRecords]);
	const punchedOutList = (0, import_react.useMemo)(() => {
		return dayRecords.filter((a) => Boolean(a.checkIn) && Boolean(a.checkOut));
	}, [dayRecords]);
	const notPunchedInList = (0, import_react.useMemo)(() => {
		const punchedEmpIdSet = new Set(dayRecords.filter((a) => Boolean(a.checkIn)).flatMap((a) => [
			String(a.employeeId || "").toUpperCase(),
			String(a.employeeName || "").toLowerCase(),
			String(a.id || a._id || "").toLowerCase()
		]));
		return summaryEmployees.filter((emp) => {
			if (emp.status !== "active") return false;
			const code = String(emp.employeeId || "").toUpperCase();
			const name = String(emp.name || "").toLowerCase();
			const id = String(emp.id || emp._id || "").toLowerCase();
			if (search) {
				const q = search.toLowerCase();
				if (!name.includes(q) && !code.includes(q)) return false;
			}
			return !punchedEmpIdSet.has(code) && !punchedEmpIdSet.has(name) && !punchedEmpIdSet.has(id);
		});
	}, [
		dayRecords,
		summaryEmployees,
		search
	]);
	const onLeaveEmpIdSet = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		for (const l of storeState.leaves || []) {
			if (l.status !== "approved" || l.isHalfDay) continue;
			const s = typeof l.startDate === "string" ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10);
			const e = typeof l.endDate === "string" ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10);
			if (selectedDate >= s && selectedDate <= e) {
				const empCode = String(l.employeeId?._id || l.employeeId?.employeeId || l.employeeId || "").toUpperCase();
				if (empCode) set.add(empCode);
			}
		}
		return set;
	}, [storeState.leaves, selectedDate]);
	const presentCount = dayRecords.filter((a) => a.status === "present").length;
	const lateCount = dayRecords.filter((a) => a.status === "late").length;
	const halfDayCount = dayRecords.filter((a) => a.status === "half-day").length;
	const onLeaveCount = Math.max(dayRecords.filter((a) => a.status === "on-leave").length, onLeaveEmpIdSet.size);
	const missingPunchesCount = notPunchedInList.filter((emp) => !onLeaveEmpIdSet.has(String(emp.employeeId || "").toUpperCase())).length;
	dayRecords.filter((a) => a.status === "absent").length + missingPunchesCount;
	const totalRoster = allEmployees.length;
	totalRoster && Math.round((presentCount + lateCount + halfDayCount * .5) / totalRoster * 100);
	dayRecords.find((a) => a.employeeId === user?.employeeId || a.employeeName === user?.displayName);
	storeAction(async () => {
		await hrStore.checkIn(user?.employeeId || "EDU-HR-001", user?.displayName || "HR", "Edufyi-Office-5G", selectedDate);
		showFeedback("Check-in saved by the server.");
	});
	storeAction(async () => {
		await hrStore.checkOut(user?.employeeId || "EDU-HR-001", user?.displayName || "HR", selectedDate);
		showFeedback("Check-out saved by the server.");
	});
	const handleSaveAttendance = storeAction(async (e) => {
		e.preventDefault();
		const emp = allEmployees.find((e) => e.employeeId === markForm.employeeId || e.id === markForm.employeeId);
		if (!emp) return;
		await hrStore.markAttendance({
			...markForm,
			employeeName: emp.name,
			employeeId: emp.employeeId,
			date: markForm.date || selectedDate
		});
		setShowMarkModal(false);
		setMarkForm({
			employeeId: "",
			date: selectedDate,
			status: "present",
			checkIn: "09:15 AM",
			checkOut: "06:15 PM",
			wifiSSID: "Edufyi-Office-5G",
			notes: ""
		});
		showFeedback(`Recorded attendance for ${emp.name} as ${markForm.status.toUpperCase()}.`);
	});
	function computeWorkDuration(checkIn, checkOut, totalBreakMinutes = 0, isAutoPunchOut = false) {
		if (!checkIn) return "—";
		if (!checkOut || checkOut === "—" || String(checkOut).trim() === "") return "Active (Live)";
		const parseTime = (timeStr) => {
			if (!timeStr) return null;
			const match = String(timeStr).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
			if (!match) return null;
			let hours = parseInt(match[1], 10);
			const minutes = parseInt(match[2], 10);
			const meridiem = match[3]?.toUpperCase();
			if (meridiem === "PM" && hours < 12) hours += 12;
			if (meridiem === "AM" && hours === 12) hours = 0;
			return hours * 60 + minutes;
		};
		const inMins = parseTime(checkIn);
		const outMins = parseTime(checkOut);
		if (inMins === null || outMins === null) return "Active (Live)";
		let diffMins = outMins - inMins;
		if (diffMins < 0) diffMins += 1440;
		const breaks = Math.max(0, Number(totalBreakMinutes) || 0);
		const netMinutes = Math.max(0, diffMins - breaks);
		const hours = Math.floor(netMinutes / 60);
		const mins = netMinutes % 60;
		const breakStr = breaks > 0 ? ` • ${breaks}m Break` : "";
		return `${hours}h ${mins}m (${isAutoPunchOut ? "Auto Punch Out" : "Completed"})${breakStr}`;
	}
	const handleUpdateAttendance = storeAction(async (e) => {
		e.preventDefault();
		if (!editingAttendance) return;
		const isNowPresent = editingAttendance.status === "present";
		const isCheckOutCleared = !editingAttendance.checkOut || editingAttendance.checkOut.trim() === "" || editingAttendance.checkOut === "—";
		const payload = {
			...editingAttendance,
			checkOut: isCheckOutCleared ? null : editingAttendance.checkOut,
			checkOutAt: isCheckOutCleared ? null : editingAttendance.checkOutAt,
			autoPunchOut: isCheckOutCleared ? false : Boolean(editingAttendance.autoPunchOut),
			punchOutReason: isCheckOutCleared ? "" : editingAttendance.punchOutReason || "",
			punchOutType: isCheckOutCleared ? "manual" : editingAttendance.punchOutType || "manual",
			isLate: isNowPresent ? false : Boolean(editingAttendance.isLate ?? editingAttendance.status === "late"),
			lateCount: isNowPresent ? 0 : editingAttendance.lateCount || 0,
			isHalfDay: isNowPresent ? false : Boolean(editingAttendance.isHalfDay ?? editingAttendance.status === "half-day"),
			isEarlyLogout: isNowPresent ? false : Boolean(editingAttendance.isEarlyLogout ?? editingAttendance.status === "early-logout"),
			isLop: isNowPresent ? false : Boolean(editingAttendance.isLop ?? editingAttendance.status === "lop"),
			totalHours: isCheckOutCleared ? "Active (Live)" : computeWorkDuration(editingAttendance.checkIn, editingAttendance.checkOut, editingAttendance.totalBreakMinutes || 0, Boolean(editingAttendance.autoPunchOut)),
			notes: isNowPresent && typeof editingAttendance.notes === "string" && (editingAttendance.notes.includes("Late") || editingAttendance.notes.includes("Auto Punch Out")) ? "Verified Attendance (General Shift)" : editingAttendance.notes || ""
		};
		await hrStore.markAttendance(payload);
		setEditingAttendance(null);
		showFeedback(`Updated attendance record for ${editingAttendance.employeeName}.`);
	});
	const handleDeleteAttendance = storeAction(async () => {
		if (!attendanceToDelete) return;
		const idToDelete = attendanceToDelete._id || attendanceToDelete.id;
		await hrStore.deleteAttendance(idToDelete, {
			employeeId: attendanceToDelete.employeeId,
			date: attendanceToDelete.date
		});
		setAttendanceToDelete(null);
		showFeedback("Attendance record permanently deleted from database.");
	});
	const handleAddWifi = storeAction(async (e) => {
		e.preventDefault();
		if (!newWifiSSID.trim()) return;
		await hrStore.addWifiSSID(newWifiSSID.trim(), hrWifiBranch, "HR");
		showFeedback(`Registered Wi-Fi "${newWifiSSID.trim()}" for ${hrWifiBranch}! Active immediately for all employees.`);
		setNewWifiSSID("");
	});
	const handleRemoveWifi = storeAction(async (ssid) => {
		await hrStore.removeWifiSSID(ssid, "HR");
		showFeedback(`Removed ${ssid} from verified office networks.`);
	});
	function handleSyncPayrollAttendance() {
		window.location.hash = `#/${user.role === "admin" ? "admin" : "hr"}/payroll`;
	}
	function handleExportCSV() {
		const headers = [
			"Employee ID",
			"Employee Name",
			"Campus",
			"Date",
			"Check-In",
			"Check-Out",
			"Status",
			"Wi-Fi Network",
			"Office Wi-Fi Verified",
			"Hours",
			"Notes"
		];
		const rows = dailyAttendance.map((a) => {
			const emp = empMap.get(String(a.employeeId || "").toUpperCase());
			const cName = a.campus || a.location || a.branch || emp?.campus || emp?.location || emp?.branch || "Ignite Campus";
			return [
				a.employeeId,
				a.employeeName,
				cName,
				a.date,
				a.checkIn || "N/A",
				(!a.checkOut || a.checkOut === "—" || a.checkOut === "-") && a.date < todayKey() && a.checkIn ? "09:30 PM (Auto)" : a.checkOut || (a.status === "present" || a.status === "late" ? "Active (Live)" : "N/A"),
				a.status,
				a.wifiSSID || "None",
				a.wifiVerified ? "YES" : "NO",
				(!a.checkOut || a.checkOut === "—" || a.checkOut === "-" || typeof a.totalHours === "string" && a.totalHours.includes("Active")) && a.date < todayKey() && a.checkIn ? computeWorkDuration(a.checkIn, "09:30 PM", a.totalBreakMinutes, true) : a.totalHours || "0.0",
				a.notes || ""
			];
		});
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `edufyi_attendance_${selectedDate}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setExportNotice(true);
		setTimeout(() => setExportNotice(false), 3e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageHeader, {
			eyebrow: "Workforce Operations",
			title: "Attendance & Presence Control Center",
			description: "Monitor daily workforce presence, live Wi-Fi SSID geofencing, check-in / check-out actions, and monthly working day summaries.",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: async () => {
						try {
							showFeedback(`Recalculating roster for ${selectedDate}...`);
							showFeedback((await hrStore.recalculateTodayAttendance(selectedDate))?.message || "Attendance roster recalculated successfully.");
						} catch (err) {
							showFeedback(`✕ Failed to recalculate attendance: ${err.message}`);
						}
					},
					title: "Verify and synchronize attendance records status",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚡" }), " Recalculate Roster"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: async () => {
						try {
							showFeedback("Executing Auto Punch-Out sweep...");
							showFeedback((await hrStore.triggerAutoPunchOut({ date: selectedDate }))?.message || "Auto punch-out executed successfully.");
						} catch (err) {
							showFeedback(`✕ Failed to run auto punch-out: ${err.message}`);
						}
					},
					title: "Run Scheduled Daily Cut-Off / Past-Day Auto Punch-Out",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⏰" }), " Auto Punch-Out"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: handleExportCSV,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 15 }), " Export CSV"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowMarkModal(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " Record Attendance"]
				})
			]
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "subnav-tabs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `subnav-tab ${activeTab === "roster" ? "active" : ""}`,
					onClick: () => setActiveTab("roster"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Daily Presence Roster" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: dailyAttendance.length
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `subnav-tab ${activeTab === "summary" ? "active" : ""}`,
					onClick: () => setActiveTab("summary"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Monthly Summary & LOP Tracker" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: allEmployees.length
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `subnav-tab ${activeTab === "wifi" ? "active" : ""}`,
					onClick: () => setActiveTab("wifi"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 14 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Office Wi-Fi & Geofencing" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: storeState.companySettings?.allowedWifiSSIDs?.length || 3
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "module-kpi-grid",
			style: {
				gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
				gap: "12px",
				marginBottom: "16px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					onClick: () => setPresenceViewMode("working"),
					style: {
						cursor: "pointer",
						transition: "all 0.2s ease",
						border: presenceViewMode === "working" ? "2px solid #059669" : "1px solid rgba(5, 150, 105, 0.3)",
						background: presenceViewMode === "working" ? "#ecfdf5" : "rgba(5, 150, 105, 0.05)",
						borderRadius: "10px",
						padding: "14px 16px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10.5px",
								color: "#047857",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em"
							},
							children: "🟢 Working Now (Punched In)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								font: "700 28px \"Space Grotesk\", sans-serif",
								color: "#047857",
								lineHeight: 1.1,
								margin: "4px 0"
							},
							children: [punchedInWorking.length, " Staff"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							style: {
								color: "#059669",
								fontSize: "11px"
							},
							children: "Click to view on-duty staff"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					onClick: () => setPresenceViewMode("punched_out"),
					style: {
						cursor: "pointer",
						transition: "all 0.2s ease",
						border: presenceViewMode === "punched_out" ? "2px solid #0284c7" : "1px solid rgba(2, 132, 199, 0.3)",
						background: presenceViewMode === "punched_out" ? "#eff6ff" : "rgba(2, 132, 199, 0.05)",
						borderRadius: "10px",
						padding: "14px 16px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10.5px",
								color: "#0284c7",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em"
							},
							children: "🔵 Punched Out"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								font: "700 28px \"Space Grotesk\", sans-serif",
								color: "#0369a1",
								lineHeight: 1.1,
								margin: "4px 0"
							},
							children: [punchedOutList.length, " Staff"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							style: {
								color: "#0284c7",
								fontSize: "11px"
							},
							children: "Click to view completed shifts"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					onClick: () => setPresenceViewMode("not_punched"),
					style: {
						cursor: "pointer",
						transition: "all 0.2s ease",
						border: presenceViewMode === "not_punched" ? "2px solid #dc2626" : "1px solid rgba(239, 68, 68, 0.3)",
						background: presenceViewMode === "not_punched" ? "#fef2f2" : "rgba(239, 68, 68, 0.05)",
						borderRadius: "10px",
						padding: "14px 16px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10.5px",
								color: "#dc2626",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em"
							},
							children: "🔴 Not Punched In"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								font: "700 28px \"Space Grotesk\", sans-serif",
								color: "#dc2626",
								lineHeight: 1.1,
								margin: "4px 0"
							},
							children: [notPunchedInList.length, " Staff"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							style: {
								color: "#dc2626",
								fontSize: "11px"
							},
							children: "Click to view missing punches"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					onClick: () => setPresenceViewMode("all"),
					style: {
						cursor: "pointer",
						transition: "all 0.2s ease",
						border: presenceViewMode === "all" ? "2px solid var(--teal)" : "1px solid var(--border)",
						background: presenceViewMode === "all" ? "var(--soft-teal)" : "#fff",
						borderRadius: "10px",
						padding: "14px 16px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10.5px",
								color: "var(--muted)",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em"
							},
							children: "📋 All Logs / On-site"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								font: "700 28px \"Space Grotesk\", sans-serif",
								color: "var(--ink)",
								lineHeight: 1.1,
								margin: "4px 0"
							},
							children: [presentCount, " Present"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
							style: {
								color: "var(--muted)",
								fontSize: "11px"
							},
							children: [onLeaveCount, " on leave · Click to view all"]
						})
					]
				})
			]
		}),
		activeTab === "roster" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Date Roster"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
						"Presence Log (",
						selectedDate,
						")"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "8px",
							alignItems: "center",
							flexWrap: "wrap"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "6px",
									flexWrap: "wrap",
									width: "100%",
									marginBottom: "6px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setPresenceViewMode("all"),
										className: "ui-button",
										style: {
											fontSize: "11px",
											padding: "5px 12px",
											background: presenceViewMode === "all" ? "var(--teal)" : "#fff",
											color: presenceViewMode === "all" ? "#fff" : "var(--ink)",
											border: "1px solid var(--line)",
											borderRadius: "6px",
											fontWeight: 700
										},
										children: [
											"All Logs (",
											baseDailyAttendance.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setPresenceViewMode("working"),
										className: "ui-button",
										style: {
											fontSize: "11px",
											padding: "5px 12px",
											background: presenceViewMode === "working" ? "#047857" : "#ecfdf5",
											color: presenceViewMode === "working" ? "#fff" : "#047857",
											border: "1px solid #a7f3d0",
											borderRadius: "6px",
											fontWeight: 700
										},
										children: [
											"🟢 Working Now (Punched In, No Out) (",
											punchedInWorking.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setPresenceViewMode("not_punched"),
										className: "ui-button",
										style: {
											fontSize: "11px",
											padding: "5px 12px",
											background: presenceViewMode === "not_punched" ? "#b91c1c" : "#fef2f2",
											color: presenceViewMode === "not_punched" ? "#fff" : "#b91c1c",
											border: "1px solid #fecaca",
											borderRadius: "6px",
											fontWeight: 700
										},
										children: [
											"🔴 Not Punched In Today (",
											notPunchedInList.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setPresenceViewMode("punched_out"),
										className: "ui-button",
										style: {
											fontSize: "11px",
											padding: "5px 12px",
											background: presenceViewMode === "punched_out" ? "#1d4ed8" : "#eff6ff",
											color: presenceViewMode === "punched_out" ? "#fff" : "#1d4ed8",
											border: "1px solid #bfdbfe",
											borderRadius: "6px",
											fontWeight: 700
										},
										children: [
											"🔵 Punched Out (",
											punchedOutList.length,
											")"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "6px",
									background: "#f7f6f2",
									border: "1px solid var(--line)",
									borderRadius: "8px",
									padding: "0 10px",
									height: "36px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										fontWeight: 600
									},
									children: "Date:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: selectedDate,
									onChange: (e) => setSelectedDate(e.target.value),
									style: {
										border: 0,
										outline: 0,
										background: "transparent",
										fontSize: "11px",
										color: "var(--ink)"
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "module-search",
								style: { minWidth: "180px" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									placeholder: "Search employee...",
									value: search,
									onChange: (e) => setSearch(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "leave-filter",
								value: campusFilter,
								onChange: (e) => setCampusFilter(e.target.value),
								style: { height: "36px" },
								"aria-label": "Filter attendance by campus",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Campuses"
								}), availableCampuses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c,
									children: c
								}, c))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "leave-filter",
								value: statusFilter,
								onChange: (e) => setStatusFilter(e.target.value),
								style: { height: "36px" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "All statuses"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "present",
										children: "Present (On-Time)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "early-logout",
										children: "Early Logout (6:30–7:30 PM)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "lop",
										children: "Loss of Pay (LOP)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "half-day",
										children: "Half Day (Late >1h / Min 4h)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "on-leave",
										children: "On Leave"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "absent",
										children: "Absent"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: handleExportCSV,
								title: "Export current attendance log to CSV",
								style: {
									height: "36px",
									fontSize: "11px",
									display: "flex",
									alignItems: "center",
									gap: "5px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 13 }), " Export CSV"]
							})
						]
					})]
				}),
				presenceViewMode === "not_punched" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { marginTop: "14px" },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fef2f2",
							border: "1px solid #fecaca",
							borderRadius: "8px",
							padding: "12px 16px",
							marginBottom: "14px",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
								size: 16,
								style: { color: "#dc2626" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								style: {
									fontSize: "12.5px",
									color: "#991b1b"
								},
								children: [
									"Active Employees Not Punched In on ",
									selectedDate,
									" (",
									notPunchedInList.length,
									" Staff)"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "#b91c1c"
							},
							children: "These active team members have not recorded check-in for this work date."
						})]
					}), notPunchedInList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "All active staff have punched in!",
						message: "Every active employee has recorded attendance for this date."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
							gap: "12px"
						},
						children: notPunchedInList.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#fff",
								border: "1px solid #fee2e2",
								borderRadius: "8px",
								padding: "12px 14px",
								display: "flex",
								flexDirection: "column",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
											width: "34px",
											height: "34px",
											borderRadius: "50%",
											background: "#fee2e2",
											color: "#dc2626",
											display: "grid",
											placeItems: "center",
											fontWeight: 800,
											fontSize: "12px"
										},
										children: String(emp.name || "E").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											fontSize: "13px",
											color: "var(--ink)"
										},
										children: emp.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)"
										},
										children: [
											emp.employeeId,
											" · ",
											emp.department || "General"
										]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										padding: "2px 8px",
										borderRadius: "999px",
										background: "#fee2e2",
										color: "#dc2626"
									},
									children: "Not Punched In"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									paddingTop: "6px",
									borderTop: "1px solid #f8fafc",
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Designation: ", emp.designation || "Pending Designation"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button secondary",
									style: {
										fontSize: "10px",
										padding: "3px 8px"
									},
									onClick: () => {
										setMarkForm({
											employeeId: emp.employeeId || emp.id || "",
											date: selectedDate,
											status: "present",
											checkIn: "09:15 AM",
											checkOut: "06:15 PM",
											wifiSSID: storeState.companySettings?.allowedWifiSSIDs?.[0] || "Edufyi",
											notes: "Manually logged by HR"
										});
										setShowMarkModal(true);
									},
									children: "+ Record Punch"
								})]
							})]
						}, emp.id || emp._id || emp.employeeId))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "attendance-cards-mobile",
					style: {
						display: "none",
						gap: "10px",
						marginTop: "14px"
					},
					children: dailyAttendance.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No attendance entries",
						message: `No records for ${selectedDate}. Record actual attendance or wait for employee punches.`
					}) : dailyAttendance.map((r) => {
						const presence = resolveAttendancePresence(r, maxGeofenceRadius) || {};
						presence.isInside !== void 0 ? presence.isInside : r.distanceMeters !== void 0 && r.distanceMeters !== null ? r.distanceMeters : r.gpsVerified;
						presence.distText || (r.distanceMeters !== void 0 && r.distanceMeters !== null ? `${r.distanceMeters}` : r.wifiVerified && `${maxGeofenceRadius}`);
						const statusInfo = getDailyAttendanceStatus(r, storeState.companySettings?.attendanceRules, storeState.leaves);
						const lateInfo = getLateCountInfo(r, storeState.attendance, selectedDate, storeState.companySettings?.attendanceRules, storeState.leaves);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#ffffff",
								border: "1px solid var(--line)",
								borderRadius: "10px",
								padding: "12px 14px",
								display: "flex",
								flexDirection: "column",
								gap: "8px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "flex-start",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { fontSize: "13px" },
										children: r.employeeName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "10px",
											color: "var(--muted)",
											display: "flex",
											gap: "5px",
											alignItems: "center",
											marginTop: "2px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.employeeId }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#047857",
													fontWeight: 600,
													background: "#f0fdf4",
													padding: "1px 5px",
													borderRadius: "4px",
													border: "1px solid #bbf7d0"
												},
												children: r.campus || empMap.get(String(r.employeeId || "").toUpperCase())?.campus || empMap.get(String(r.employeeId || "").toUpperCase())?.location || "Ignite Campus"
											})
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											textAlign: "right",
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											tone: statusInfo.tone,
											children: statusInfo.label
										}), lateInfo.count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												display: "inline-flex",
												alignItems: "center",
												padding: "2px 6px",
												borderRadius: "4px",
												fontSize: "10px",
												fontWeight: 700,
												background: lateInfo.count >= 3 ? "#fee2e2" : "#fef3c7",
												color: lateInfo.count >= 3 ? "#b91c1c" : "#b45309",
												border: `1px solid ${lateInfo.count >= 3 ? "#fca5a5" : "#fde68a"}`
											},
											children: [
												"#",
												lateInfo.count,
												lateInfo.lopDays > 0 ? ` (${lateInfo.lopDays} LOP)` : ""
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr",
										gap: "6px",
										fontSize: "11px",
										background: "var(--surface-sunken)",
										padding: "8px 10px",
										borderRadius: "6px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												display: "block",
												fontSize: "10px"
											},
											children: "Check In"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r.checkIn || "—" })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												display: "block",
												fontSize: "10px"
											},
											children: "Check Out"
										}), (() => {
											const todayStr = todayKey();
											const isPast = r.date && r.date < todayStr;
											const isUnclosed = !r.checkOut || r.checkOut === "—" || r.checkOut === "-";
											const displayOut = !isUnclosed ? r.checkOut : isPast && r.checkIn ? "09:30 PM" : r.status === "present" ? "Active" : "—";
											const isAuto = Boolean(r.autoPunchOut || r.punchOutType === "auto" || r.totalHours?.includes("Auto Punch Out") || isPast && r.checkIn && isUnclosed);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: displayOut }), isAuto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												title: r.punchOutReason || "Auto punched out: Scheduled daily cut-off",
												style: {
													display: "inline-block",
													marginLeft: "4px",
													fontSize: "8.5px",
													fontWeight: 700,
													textTransform: "uppercase",
													padding: "1px 4px",
													borderRadius: "3px",
													background: "#fef3e2",
													color: "#b45309",
													border: "1px solid #fbd38d"
												},
												children: "Auto Out"
											})] });
										})()] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												display: "block",
												fontSize: "10px"
											},
											children: "Duration"
										}), (() => {
											const todayStr = todayKey();
											const isPast = r.date && r.date < todayStr;
											const isUnclosed = !r.checkOut || r.checkOut === "—" || r.checkOut === "-" || typeof r.totalHours === "string" && r.totalHours.includes("Active");
											let dur = r.totalHours;
											if (isPast && r.checkIn && isUnclosed) dur = computeWorkDuration(r.checkIn, "09:30 PM", r.totalBreakMinutes, true);
											else if (isUnclosed && !isPast) dur = "Active (Live)";
											else if (!dur) dur = "—";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "var(--teal)" },
												children: dur
											});
										})()] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										fontSize: "10px",
										color: "var(--muted)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Shift: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatShiftDisplay(r.shift, r.shiftCode, storeState.companySettings?.attendanceRules) })] }), r.isOnBreak ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											color: "#b45309",
											fontWeight: 700
										},
										children: [
											"⏸️ On Break (",
											r.currentBreak?.type || "lunch",
											")"
										]
									}) : r.totalBreakMinutes > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: { color: "#b45309" },
										children: [
											"☕ ",
											r.totalBreakMinutes,
											"m break"
										]
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										flexWrap: "wrap",
										gap: "6px",
										alignItems: "center",
										fontSize: "10px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `wifi-badge ${presence?.networkTone || "remote"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 10 }),
												" ",
												presence?.networkLabel || "External / Remote",
												" ",
												presence?.displaySsid ? `(${presence.displaySsid})` : ""
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `gps-verified-badge ${presence?.isInside ? "in-range" : presence?.isUncertain ? "uncertain" : "out-range"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 10 }),
												" ",
												presence?.isInside ? `GPS ≤${maxGeofenceRadius}m (${presence?.distText || "—"})` : presence?.isUncertain ? `GPS Uncertain (${presence?.distText || "—"})` : `GPS Out (${presence?.distText || "—"})`
											]
										}),
										presence?.statusBadge && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `freshness-badge ${presence.statusBadge.tone}`,
											title: `Location Status: ${presence.statusBadge.label}`,
											children: [presence.statusBadge.tone === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-dot" }), presence.statusBadge.label]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "6px",
										borderTop: "1px solid var(--line)",
										paddingTop: "8px"
									},
									children: [
										!r.checkOut && (r.status === "present" || r.status === "late" || r.status === "half-day") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn edit",
											onClick: storeAction(() => hrStore.checkOut(r.employeeId, r.employeeName, selectedDate)),
											style: {
												flex: "1 1 auto",
												justifyContent: "center"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 12 }), " Punch Out"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn edit",
											onClick: () => setEditingAttendance(r),
											style: {
												flex: "1 1 auto",
												justifyContent: "center"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 12 }), " Edit"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn delete",
											onClick: () => setAttendanceToDelete(r),
											style: {
												flex: "1 1 auto",
												justifyContent: "center"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), " Delete"]
										})
									]
								})
							]
						}, r.id);
					})
				}),
				presenceViewMode !== "not_punched" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "attendance-table-desktop",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
						caption: "Daily attendance log",
						columns: [
							{
								key: "employeeName",
								label: "Employee & Campus",
								render: (r) => {
									const emp = empMap.get(String(r.employeeId || "").toUpperCase());
									const cName = r.campus || r.location || r.branch || emp?.campus || emp?.location || emp?.branch || "Ignite Campus";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r.employeeName }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "9px",
											color: "var(--muted)",
											display: "flex",
											gap: "5px",
											alignItems: "center",
											marginTop: "2px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.employeeId }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "#047857",
													fontWeight: 600,
													background: "#f0fdf4",
													padding: "1px 5px",
													borderRadius: "4px",
													border: "1px solid #bbf7d0"
												},
												children: cName
											})
										]
									})] });
								}
							},
							{
								key: "shift",
								label: "Shift",
								render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 600,
										color: "var(--ink)"
									},
									children: formatShiftDisplay(r.shift, r.shiftCode, storeState.companySettings?.attendanceRules)
								})
							},
							{
								key: "checkIn",
								label: "Check-In",
								render: (r) => r.checkIn || "—"
							},
							{
								key: "checkOut",
								label: "Check-Out",
								render: (r) => {
									const todayStr = todayKey();
									const isPast = r.date && r.date < todayStr;
									const isUnclosed = !r.checkOut || r.checkOut === "—" || r.checkOut === "-";
									const effectiveOut = !isUnclosed ? r.checkOut : isPast && r.checkIn ? "09:30 PM" : null;
									const isAuto = Boolean(r.autoPunchOut || r.punchOutType === "auto" || r.totalHours?.includes("Auto Punch Out") || isPast && r.checkIn && isUnclosed);
									if (effectiveOut) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: effectiveOut }), isAuto && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											title: r.punchOutReason || "Auto Punch Out (Scheduled daily system cut-off)",
											style: {
												fontSize: "9px",
												fontWeight: 700,
												textTransform: "uppercase",
												padding: "2px 5px",
												borderRadius: "4px",
												background: "#fef3e2",
												color: "#b45309",
												border: "1px solid #fbd38d",
												whiteSpace: "nowrap"
											},
											children: "Auto Punch Out"
										})]
									});
									return r.status === "present" || r.status === "late" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--teal)",
											fontWeight: 600
										},
										children: "Active (Live)"
									}) : "—";
								}
							},
							{
								key: "totalHours",
								label: "Work Duration / Breaks",
								render: (r) => {
									const todayStr = todayKey();
									const isPast = r.date && r.date < todayStr;
									const isLateStatus = r.status === "late";
									let displayHours = r.totalHours || "—";
									const isUnclosed = !r.checkOut || r.checkOut === "—" || r.checkOut === "-" || typeof displayHours === "string" && displayHours.includes("Active");
									if (isPast && r.checkIn && isUnclosed) displayHours = computeWorkDuration(r.checkIn, "09:30 PM", r.totalBreakMinutes, true);
									else if (isUnclosed && !isPast) {
										let liveMins = 0;
										if (r.checkInAt) liveMins = Math.max(0, Math.floor((Date.now() - new Date(r.checkInAt).getTime()) / 6e4));
										else if (r.checkIn) {
											const match = String(r.checkIn).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
											if (match) {
												let h = parseInt(match[1], 10);
												const m = parseInt(match[2], 10);
												const meridiem = match[3]?.toUpperCase();
												if (meridiem === "PM" && h < 12) h += 12;
												if (meridiem === "AM" && h === 12) h = 0;
												const inDate = /* @__PURE__ */ new Date();
												inDate.setHours(h, m, 0, 0);
												liveMins = Math.max(0, Math.floor((Date.now() - inDate.getTime()) / 6e4));
											}
										}
										const bMins = Number(r.totalBreakMinutes) || 0;
										const netM = Math.max(0, liveMins - bMins);
										const hh = Math.floor(netM / 60);
										const mm = netM % 60;
										displayHours = `${hh}h ${String(mm).padStart(2, "0")}m (Active)`;
									} else if (r.checkIn && r.checkOut && (displayHours === "0h 0m" || String(displayHours).startsWith("0h 0m") || displayHours === "8.0 hrs" || displayHours === "—")) displayHours = computeWorkDuration(r.checkIn, r.checkOut, r.totalBreakMinutes, r.autoPunchOut);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: r.isOnBreak ? "#b45309" : displayHours === "Active (Live)" ? "var(--teal)" : isLateStatus ? "#dc2626" : "var(--teal)" },
										children: r.isOnBreak ? `⏸️ On ${r.currentBreak?.type === "tea" ? "Tea Break" : "Lunch Break"}` : displayHours
									}), r.totalBreakMinutes > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "10px",
											color: "#b45309"
										},
										children: [
											"☕ ",
											r.totalBreakMinutes,
											"m Break Taken"
										]
									})] });
								}
							},
							{
								key: "wifi",
								label: "Network Verification",
								render: (r) => {
									const presence = resolveAttendancePresence(r, maxGeofenceRadius);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
												size: 13,
												style: { color: presence.networkTone === "verified" ? "var(--teal)" : presence.networkTone === "on-site" ? "#0284c7" : "var(--muted)" }
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `wifi-badge ${presence.networkTone}`,
												children: presence.networkLabel
											}),
											presence.displaySsid && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
												style: {
													color: "var(--muted)",
													fontSize: "9px"
												},
												children: [
													"(",
													presence.displaySsid,
													")"
												]
											})
										]
									});
								}
							},
							{
								key: "geofence",
								label: `GPS Geofence (≤ ${maxGeofenceRadius}m)`,
								render: (r) => {
									const presence = resolveAttendancePresence(r, maxGeofenceRadius);
									const tone = presence.isInside ? "in-range" : presence.isUncertain ? "uncertain" : "out-range";
									const label = presence.isInside ? `≤${maxGeofenceRadius}m (${presence.distText}${presence.accText ? `, ${presence.accText}` : ""})` : presence.isUncertain ? `Uncertain (${presence.distText}, ${presence.accText})` : `Outside (${presence.distText})`;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px",
											whiteSpace: "nowrap"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												size: 13,
												style: {
													color: presence.isInside ? "var(--teal)" : presence.isUncertain ? "#a16207" : "#c25e00",
													flexShrink: 0
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `gps-verified-badge ${tone}`,
												children: label
											}),
											presence.statusBadge && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `freshness-badge ${presence.statusBadge.tone}`,
												title: `Location Status: ${presence.statusBadge.label}`,
												children: [presence.statusBadge.tone === "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-dot" }), presence.statusBadge.label]
											}),
											r.locationName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
												style: {
													color: "var(--muted)",
													fontSize: "9px"
												},
												children: r.locationName
											})
										]
									});
								}
							},
							{
								key: "status",
								label: "Status",
								render: (r) => {
									const statusInfo = getDailyAttendanceStatus(r, storeState.companySettings?.attendanceRules, storeState.leaves);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: statusInfo.tone,
										children: statusInfo.label
									});
								}
							},
							{
								key: "lateCount",
								label: "Late / Early Count",
								render: (r) => {
									const info = getLateCountInfo(r, storeState.attendance, selectedDate, storeState.companySettings?.attendanceRules, storeState.leaves);
									if (!info || info.count <= 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "12px"
										},
										children: "—"
									});
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												padding: "2px 8px",
												borderRadius: "6px",
												fontSize: "11px",
												fontWeight: 700,
												background: info.count >= 3 ? "#fee2e2" : "#fef3c7",
												color: info.count >= 3 ? "#b91c1c" : "#b45309",
												border: `1px solid ${info.count >= 3 ? "#fca5a5" : "#fde68a"}`
											},
											title: `Combined: ${info.count} (${info.lateCount} Late, ${info.earlyLogoutCount} Early Logout)`,
											children: ["#", info.count]
										}), info.lopDays > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "10.5px",
												fontWeight: 700,
												color: "#dc2626",
												whiteSpace: "nowrap",
												background: "#fef2f2",
												padding: "1px 5px",
												borderRadius: "4px",
												border: "1px solid #fecaca"
											},
											children: [info.lopDays, " LOP"]
										})]
									});
								}
							},
							{
								key: "actions",
								label: "Actions",
								render: (r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "emp-action-group",
									children: [
										!r.checkOut && (r.status === "present" || r.status === "late" || r.status === "half-day") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn edit",
											onClick: storeAction(() => hrStore.checkOut(r.employeeId, r.employeeName, selectedDate)),
											title: "Punch Out",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 12 }), " Out"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "emp-action-btn edit",
											onClick: () => setEditingAttendance(r),
											title: "Edit Punch Details",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 12 }), " Edit"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "emp-action-btn delete",
											onClick: () => setAttendanceToDelete(r),
											title: "Delete Record",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 })
										})
									]
								})
							}
						],
						rows: dailyAttendance,
						emptyMessage: `No attendance entries recorded for ${selectedDate}. Click "Auto-Fill Shift" or "Record Attendance" above to log punches.`
					})
				})
			]
		}),
		activeTab === "summary" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Payroll Impact"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
						"Attendance & Payroll Review (",
						selectedDate.slice(0, 7),
						")"
					] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "10px",
							alignItems: "center",
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "leave-filter",
							value: campusFilter,
							onChange: (e) => setCampusFilter(e.target.value),
							style: { height: "36px" },
							"aria-label": "Filter monthly summary by campus",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "all",
								children: "All Campuses"
							}), availableCampuses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c,
								children: c
							}, c))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: handleSyncPayrollAttendance,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 14 }), " Review linked payroll"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "foundation-copy",
					style: { margin: "10px 0 20px" },
					children: "Attendance and approved leave are linked to each employee's payroll review. HR reviews earnings, paid days, and deductions before finalizing; nothing is automatically deducted."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
					caption: "Monthly attendance calculation",
					columns: [
						{
							key: "employee",
							label: "Employee & Campus",
							render: (emp) => {
								const cName = emp.campus || emp.location || emp.branch || "Ignite Campus";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emp.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "9px",
										color: "var(--muted)",
										display: "flex",
										gap: "4px",
										alignItems: "center",
										marginTop: "2px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: emp.employeeId }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: emp.department }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "#047857",
												fontWeight: 600
											},
											children: cName
										})
									]
								})] });
							}
						},
						{
							key: "totalDays",
							label: "Calendar Days",
							render: () => calendarDays
						},
						{
							key: "presentDays",
							label: "Days Present",
							render: (emp) => {
								const pCount = monthlyAttendance.filter((a) => a.employeeId === emp.employeeId && (a.status === "present" || a.status === "late")).length;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "var(--teal)" },
									children: pCount
								});
							}
						},
						{
							key: "lateDays",
							label: "Late Check-ins",
							render: (emp) => {
								return monthlyAttendance.filter((a) => a.employeeId === emp.employeeId && (a.status === "late" || a.isLate)).length;
							}
						},
						{
							key: "earlyDays",
							label: "Early Logouts",
							render: (emp) => {
								return monthlyAttendance.filter((a) => a.employeeId === emp.employeeId && (a.status === "early-logout" || a.isEarlyLogout)).length;
							}
						},
						{
							key: "combinedInfractions",
							label: "Late + Early (Total)",
							render: (emp) => {
								const total = monthlyAttendance.filter((a) => {
									const isHalfDayOnTime = a.occurrence === "half_day_leave_on_time" || a.approvedLeave?.halfDayPeriod === "first_half" && !a.isLate;
									return a.employeeId === emp.employeeId && !isHalfDayOnTime && (a.status === "late" || a.isLate);
								}).length + monthlyAttendance.filter((a) => {
									const isHalfDayCheckout = a.occurrence === "half_day_leave_checkout" || a.approvedLeave?.halfDayPeriod === "second_half" && !a.isEarlyLogout;
									return a.employeeId === emp.employeeId && !isHalfDayCheckout && (a.status === "early-logout" || a.isEarlyLogout);
								}).length;
								const halfLop = Math.floor(total / 3) * .5;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: total }), halfLop > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10.5px",
											fontWeight: 700,
											color: "#dc2626",
											background: "#fef2f2",
											padding: "1px 5px",
											borderRadius: "4px",
											border: "1px solid #fecaca"
										},
										children: [halfLop, " LOP"]
									}) : total > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10px",
											color: "#b45309"
										},
										children: [
											"(",
											3 - total % 3,
											" left to 0.5 LOP)"
										]
									}) : null]
								});
							}
						},
						{
							key: "leaves",
							label: "Approved Leaves",
							render: (emp) => {
								return (storeState.leaves || []).filter((l) => l.employeeId === emp.employeeId && l.status === "approved").reduce((sum, l) => sum + (l.days || 1), 0);
							}
						},
						{
							key: "lop",
							label: "LOP (Unpaid)",
							render: (emp) => {
								const absents = monthlyAttendance.filter((a) => a.employeeId === emp.employeeId && a.status === "absent").length;
								const lCount = monthlyAttendance.filter((a) => {
									const isHalfDayOnTime = a.occurrence === "half_day_leave_on_time" || a.approvedLeave?.halfDayPeriod === "first_half" && !a.isLate;
									return a.employeeId === emp.employeeId && !isHalfDayOnTime && (a.status === "late" || a.isLate);
								}).length;
								const eCount = monthlyAttendance.filter((a) => {
									const isHalfDayCheckout = a.occurrence === "half_day_leave_checkout" || a.approvedLeave?.halfDayPeriod === "second_half" && !a.isEarlyLogout;
									return a.employeeId === emp.employeeId && !isHalfDayCheckout && (a.status === "early-logout" || a.isEarlyLogout);
								}).length;
								const infractionLop = Math.floor((lCount + eCount) / 3) * .5;
								const totalLop = absents + infractionLop;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: { color: totalLop > 0 ? "var(--coral)" : "inherit" },
									children: [totalLop, " days"]
								}), infractionLop > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "9.5px",
										color: "#dc2626",
										fontWeight: 600
									},
									children: [
										"(",
										infractionLop,
										"d from 3x late/early)"
									]
								})] });
							}
						},
						{
							key: "payableDays",
							label: "Payable Days",
							render: (emp) => {
								const record = storeState.payroll.find((payroll) => payroll.employeeId === emp.employeeId && payroll.month === (/* @__PURE__ */ new Date(`${selectedDate}T12:00:00`)).toLocaleDateString("en-US", {
									month: "long",
									year: "numeric"
								}));
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: record ? `${record.paidDays} / ${record.workingDays}` : "Not reviewed" });
							}
						},
						{
							key: "status",
							label: "Status",
							render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								tone: "info",
								children: "Eligible for Full Salary"
							})
						}
					],
					rows: summaryEmployees,
					emptyMessage: "No employees registered."
				})
			]
		}),
		activeTab === "wifi" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "grid",
				gap: "20px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Network Security"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							"Office Wi-Fi SSID Whitelist (",
							storeState.companySettings?.allowedWifiSSIDs?.length || 0,
							")"
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: "success",
							children: "Active for All Employees"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "foundation-copy",
						style: { margin: "10px 0 20px" },
						children: "Employees connected to any of these corporate wireless networks are automatically verified as physically on-site without requiring manual biometric devices."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleAddWifi,
						style: {
							background: "#f5f8f7",
							border: "1px solid rgba(29, 138, 122, 0.25)",
							borderRadius: "10px",
							padding: "14px",
							marginBottom: "20px",
							display: "grid",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: "12px",
								fontWeight: 700,
								color: "var(--teal)",
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), " Register & Link Office Wi-Fi Network"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1.2fr 1fr auto",
								gap: "10px",
								alignItems: "flex-end"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11px",
										color: "var(--muted)",
										display: "block",
										marginBottom: "3px"
									},
									children: "Wi-Fi SSID Name *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "e.g. Edufyi-Floor2-5G, MyOffice-WiFi...",
									value: newWifiSSID,
									onChange: (e) => setNewWifiSSID(e.target.value),
									style: {
										width: "100%",
										border: "1px solid var(--line)",
										borderRadius: "8px",
										padding: "8px 12px",
										fontSize: "12px",
										background: "#fff"
									},
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11px",
										color: "var(--muted)",
										display: "block",
										marginBottom: "3px"
									},
									children: "Target Branch *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: hrWifiBranch,
									onChange: (e) => setHrWifiBranch(e.target.value),
									style: {
										width: "100%",
										border: "1px solid var(--line)",
										borderRadius: "8px",
										padding: "8px 10px",
										fontSize: "12px",
										background: "#fff"
									},
									children: [branchLocations.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: loc.name,
										children: [
											loc.name,
											" (",
											loc.city,
											")"
										]
									}, loc.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "All Company Branches",
										children: "All Company Branches (Global)"
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }), " Register Network"]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: "10px"
						},
						children: (storeState.companySettings?.allowedWifiSSIDs || []).map((ssid) => {
							const matched = wifiNetworks.find((n) => n.ssid === ssid);
							const branchLabel = matched?.branchName && matched.branchName !== "HQ - San Francisco" ? matched.branchName : branchLocations[0]?.name || "IGNITE CAMPUS";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									padding: "14px 18px",
									background: "#fffefa",
									border: "1px solid var(--line)",
									borderRadius: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
											background: "var(--soft-teal)",
											color: "var(--teal)",
											display: "grid",
											placeItems: "center"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 18 })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "13px" },
											children: ssid
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "wifi-verified-badge",
											style: { fontSize: "9px" },
											children: "✓ Verified"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11px",
											color: "var(--muted)",
											marginTop: "2px",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
											size: 11,
											color: "var(--teal)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											"Branch: ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: branchLabel }),
											" • Geofence: ≤",
											maxGeofenceRadius,
											"m"
										] })]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "emp-action-btn delete",
									onClick: () => handleRemoveWifi(ssid),
									title: "Remove from Whitelist",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 }), " Remove"]
								})]
							}, ssid);
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Geographic Coordinates"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							"Office GPS Geofence Perimeters (≤",
							maxGeofenceRadius,
							"m Distance)"
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "gps-verified-badge in-range",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { size: 12 }),
								" Geofence Rule: ≤",
								maxGeofenceRadius,
								"m"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "foundation-copy",
						style: { margin: "10px 0 16px" },
						children: [
							"Employees punching attendance from mobile devices or laptops must be physically located within ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [maxGeofenceRadius, " meters"] }),
							" of any registered office coordinates to obtain automatic in-office GPS verification."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
							gap: "12px"
						},
						children: (storeState.companySettings?.locations || []).map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "14px 16px",
								background: "#fffefa",
								border: "1px solid var(--line)",
								borderRadius: "10px",
								display: "flex",
								flexDirection: "column",
								gap: "8px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
											size: 15,
											color: "var(--teal)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "13px" },
											children: loc.name
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "role-badge",
										style: {
											fontSize: "9px",
											background: "var(--soft-teal)",
											color: "var(--teal)"
										},
										children: [
											"Radius: ",
											loc.radiusMeters || maxGeofenceRadius,
											"m"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "11px",
										color: "var(--muted)",
										display: "grid",
										gap: "3px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["City: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "var(--ink)" },
											children: loc.city
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Latitude: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", { children: [loc.lat ?? "37.789172", "°"] })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Longitude: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", { children: [loc.lng ?? "-122.401449", "°"] })] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										borderTop: "1px solid var(--line)",
										paddingTop: "6px",
										fontSize: "10px",
										color: "var(--teal)",
										fontWeight: 600,
										display: "flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 11 }),
										" ",
										loc.radiusMeters || maxGeofenceRadius,
										"m Geofence Active"
									]
								})
							]
						}, loc.id))
					})
				]
			})]
		}),
		showMarkModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setShowMarkModal(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Record Attendance Entry" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: () => setShowMarkModal(false),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSaveAttendance,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-body",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Select Employee",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: markForm.employeeId,
									onChange: (e) => setMarkForm({
										...markForm,
										employeeId: e.target.value
									}),
									required: true,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "-- Choose employee --"
									}), allEmployees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: emp.employeeId,
										children: [
											emp.name,
											" (",
											emp.employeeId,
											" · ",
											emp.department,
											")"
										]
									}, emp.employeeId))]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Date",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										value: markForm.date,
										onChange: (e) => setMarkForm({
											...markForm,
											date: e.target.value
										}),
										required: true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Attendance Status",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: markForm.status,
										onChange: (e) => {
											const nextStatus = e.target.value;
											setMarkForm({
												...markForm,
												status: nextStatus,
												lateCount: 0,
												notes: "Verified Attendance (General Shift)"
											});
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "present",
												children: "Present (On-Time)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "early-logout",
												children: "Early Logout (6:30–7:30 PM)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "lop",
												children: "Loss of Pay (LOP)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "half-day",
												children: "Half Day (Late >1h / Min 4h)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "on-leave",
												children: "On Leave"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "absent",
												children: "Absent / Unpaid"
											})
										]
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
									label: "Check-In Time",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "e.g. 09:15 AM",
										value: markForm.checkIn,
										onChange: (e) => setMarkForm({
											...markForm,
											checkIn: e.target.value
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Check-Out Time",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										placeholder: "e.g. 06:15 PM",
										value: markForm.checkOut,
										onChange: (e) => setMarkForm({
											...markForm,
											checkOut: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Wi-Fi Network / SSID Verification",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: markForm.wifiSSID,
									onChange: (e) => setMarkForm({
										...markForm,
										wifiSSID: e.target.value
									}),
									children: [
										(storeState.companySettings?.allowedWifiSSIDs || []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: s,
											children: [s, " (Office Geofence Verified)"]
										}, s)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Home-Fiber-WiFi",
											children: "Home-Fiber-WiFi (Remote Work)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Cellular-Hotspot",
											children: "Cellular-Hotspot (Client Site)"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Notes / Reason",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									placeholder: "e.g. On-site client meeting",
									value: markForm.notes,
									onChange: (e) => setMarkForm({
										...markForm,
										notes: e.target.value
									})
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-footer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setShowMarkModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Verify & Save Attendance"
						})]
					})]
				})]
			})
		}),
		editingAttendance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setEditingAttendance(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: ["Edit Attendance: ", editingAttendance.employeeName] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: () => setEditingAttendance(null),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleUpdateAttendance,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-body",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Date",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										value: editingAttendance.date,
										onChange: (e) => setEditingAttendance({
											...editingAttendance,
											date: e.target.value
										}),
										required: true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Status",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: editingAttendance.status,
										onChange: (e) => {
											const nextStatus = e.target.value;
											let updates = {
												...editingAttendance,
												status: nextStatus
											};
											if (nextStatus === "present" || nextStatus === "late") {
												updates.isLate = false;
												updates.lateCount = 0;
												updates.isHalfDay = false;
												updates.isEarlyLogout = false;
												updates.isLop = false;
												updates.notes = "Verified Attendance (General Shift)";
												if (typeof updates.totalHours === "string" && updates.totalHours.includes("Late")) updates.totalHours = updates.checkOut ? "8.0 hrs" : "Active (Live)";
											} else if (nextStatus === "half-day") {
												updates.isHalfDay = true;
												updates.isLate = false;
											} else if (nextStatus === "early-logout") updates.isEarlyLogout = true;
											else if (nextStatus === "lop") updates.isLop = true;
											setEditingAttendance(updates);
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "present",
												children: "Present (On-Time)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "early-logout",
												children: "Early Logout (6:30–7:30 PM)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "lop",
												children: "Loss of Pay (LOP)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "half-day",
												children: "Half Day (Late >1h / Min 4h)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "on-leave",
												children: "On Leave"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "absent",
												children: "Absent"
											})
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
								label: "Shift Timings",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: editingAttendance.shift || "",
									placeholder: formatShiftDisplay(null, null, storeState.companySettings?.attendanceRules),
									onChange: (e) => setEditingAttendance({
										...editingAttendance,
										shift: e.target.value
									}),
									style: {
										background: "#fff",
										color: "var(--ink)"
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
									style: {
										color: "var(--muted)",
										fontSize: "10px",
										marginTop: "2px",
										display: "block"
									},
									children: [
										"Active Org Shift: ",
										formatShiftDisplay(null, null, storeState.companySettings?.attendanceRules),
										" (configured in System Configuration)"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Check-In Time",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: editingAttendance.checkIn || "",
										onChange: (e) => setEditingAttendance({
											...editingAttendance,
											checkIn: e.target.value
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Check-Out Time",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: editingAttendance.checkOut || "",
										onChange: (e) => setEditingAttendance({
											...editingAttendance,
											checkOut: e.target.value
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Wi-Fi SSID",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: editingAttendance.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || "Edufyi",
									onChange: (e) => setEditingAttendance({
										...editingAttendance,
										wifiSSID: e.target.value
									}),
									children: [
										(storeState.companySettings?.allowedWifiSSIDs || []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: s,
											children: [s, " (Office Geofence Verified)"]
										}, s)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Home-Fiber-WiFi",
											children: "Home-Fiber-WiFi (Remote Work)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Cellular-Hotspot",
											children: "Cellular-Hotspot"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Notes / Comments",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									value: editingAttendance.notes || "",
									onChange: (e) => setEditingAttendance({
										...editingAttendance,
										notes: e.target.value
									})
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-footer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setEditingAttendance(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Update Record"
						})]
					})]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationDialog, {
			open: Boolean(attendanceToDelete),
			title: `Delete Attendance Entry`,
			message: `Are you sure you want to remove the attendance punch for ${attendanceToDelete?.employeeName} on ${attendanceToDelete?.date}?`,
			confirmLabel: "Yes, Delete Record",
			isDestructive: true,
			onConfirm: handleDeleteAttendance,
			onCancel: () => setAttendanceToDelete(null)
		})
	] });
}
function PayrollModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [selectedPayslip, setSelectedPayslip] = (0, import_react.useState)(null);
	const [payrollEditor, setPayrollEditor] = (0, import_react.useState)(null);
	const [runningPayroll, setRunningPayroll] = (0, import_react.useState)(false);
	const [payrollSuccess, setPayrollSuccess] = (0, import_react.useState)(false);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!selectedPayslip) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const handleKey = (e) => {
			if (e.key === "Escape") setSelectedPayslip(null);
		};
		window.addEventListener("keydown", handleKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", handleKey);
		};
	}, [selectedPayslip]);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const payrollList = storeState.payroll || [];
	const employees = storeState.employees || [];
	const filteredList = payrollList.filter((p) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return p.employeeName && p.employeeName.toLowerCase().includes(q) || p.employeeId && p.employeeId.toLowerCase().includes(q) || p.department && p.department.toLowerCase().includes(q);
	});
	const totalGross = payrollList.reduce((acc, p) => {
		const e = p.earnings || {};
		return acc + (Number(e.basic) || 0) + (Number(e.hra) || 0) + (Number(e.specialAllowance) || 0) + (Number(e.conveyance) || 0) + (Number(e.medicalAllowance) || 0) + (Number(e.performanceBonus) || 0) + (Number(e.overtime) || 0);
	}, 0);
	const totalDeductions = payrollList.reduce((acc, p) => {
		const d = p.deductions || {};
		return acc + (Number(d.pf) || 0) + (Number(d.esi) || 0) + (Number(d.professionalTax) || 0) + (Number(d.tdsTax) || 0) + (Number(d.loanAdvance) || 0) + (Number(d.lossOfPay) || 0) + (Number(d.otherDeductions) || 0);
	}, 0);
	const totalNet = Math.max(0, totalGross - totalDeductions);
	function runPayroll() {
		setRunningPayroll(true);
		setTimeout(() => {
			setRunningPayroll(false);
			setPayrollSuccess(true);
			hrStore.executePayrollRun("September 2026");
			setTimeout(() => setPayrollSuccess(false), 4500);
		}, 1e3);
	}
	function handleOpenNewPayslip() {
		const defaultEmp = storeState.employees[0] || {};
		const basic = 45e3;
		const hra = Math.round(basic * .5);
		const special = 12500;
		const conveyance = 3e3;
		const medical = 2500;
		const gross = 85500;
		const pf = Math.round(basic * .12);
		const profTax = 200;
		const tds = Math.round(gross * .05);
		setPayrollEditor({
			id: `pay-${Date.now()}`,
			employeeId: defaultEmp.employeeId || "",
			employeeName: defaultEmp.name || "Employee",
			department: defaultEmp.department || "Operations",
			designation: defaultEmp.designation || "Pending Designation",
			month: "September 2026",
			workingDays: 30,
			paidDays: 30,
			lopDays: 0,
			bankName: defaultEmp.bankDetails?.bankName || "HDFC Bank",
			accountNumber: defaultEmp.bankDetails?.accountNumber || "5010049288492",
			ifscCode: "HDFC0001234",
			panTaxId: defaultEmp.bankDetails?.panTaxId || "ALX-9821-R",
			uanNumber: "100984120982",
			earnings: {
				basic,
				hra,
				specialAllowance: special,
				conveyance,
				medicalAllowance: medical,
				performanceBonus: 0,
				overtime: 0
			},
			deductions: {
				pf,
				esi: 0,
				professionalTax: profTax,
				tdsTax: tds,
				loanAdvance: 0,
				lossOfPay: 0,
				otherDeductions: 0
			},
			status: "processed",
			paymentDate: "2026-09-30",
			notes: "Monthly compensation in INR (₹) with statutory deductions"
		});
	}
	function handleEditPayslip(record) {
		setPayrollEditor({
			...record,
			earnings: { ...record.earnings || {} },
			deductions: { ...record.deductions || {} }
		});
	}
	function handleEmployeeSelectChange(empId) {
		const foundEmp = storeState.employees.find((e) => e.employeeId === empId || e.id === empId);
		if (!foundEmp) return;
		setPayrollEditor((prev) => {
			prev.earnings?.basic;
			return {
				...prev,
				employeeId: foundEmp.employeeId,
				employeeName: foundEmp.name,
				department: foundEmp.department,
				designation: foundEmp.designation,
				bankName: foundEmp.bankDetails?.bankName || "HDFC Bank",
				accountNumber: foundEmp.bankDetails?.accountNumber || "5010049288492",
				panTaxId: foundEmp.bankDetails?.panTaxId || "PAN-9821-X"
			};
		});
	}
	function handleSaveEditor(e) {
		e.preventDefault();
		if (!payrollEditor) return;
		hrStore.savePayrollRecord(payrollEditor);
		if (selectedPayslip && selectedPayslip.id === payrollEditor.id) setSelectedPayslip(payrollEditor);
		setPayrollEditor(null);
		setPayrollSuccess(true);
		setTimeout(() => setPayrollSuccess(false), 3500);
	}
	function getRecordTotals(record) {
		const e = record.earnings || {};
		const d = record.deductions || {};
		const basic = Number(e.basic) || 0;
		const hra = Number(e.hra) || 0;
		const special = Number(e.specialAllowance) || 0;
		const conveyance = Number(e.conveyance) || 0;
		const medical = Number(e.medicalAllowance) || 0;
		const bonus = Number(e.performanceBonus) || 0;
		const overtime = Number(e.overtime) || 0;
		const gross = basic + hra + special + conveyance + medical + bonus + overtime;
		const pf = Number(d.pf) || 0;
		const esi = Number(d.esi) || 0;
		const pt = Number(d.professionalTax) || 0;
		const tds = Number(d.tdsTax) || 0;
		const loan = Number(d.loanAdvance) || 0;
		const lop = Number(d.lossOfPay) || 0;
		const performanceDeduction = Number(d.performanceDeduction) || 0;
		const other = Number(d.otherDeductions) || 0;
		const totalDed = pf + esi + pt + tds + loan + lop + performanceDeduction + other;
		return {
			gross,
			totalDed,
			net: Math.max(0, gross - totalDed),
			basic,
			hra,
			special,
			conveyance,
			medical,
			bonus,
			overtime,
			pf,
			esi,
			pt,
			tds,
			loan,
			lop,
			performanceDeduction,
			other
		};
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Compensation & Benefits",
			title: "Salary & Payroll Workspace (INR ₹)",
			description: "Organize employee payroll in Indian Rupees (₹), manually configure earnings and statutory deductions (PF, ESI, PT, TDS), and generate official payslips.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: "8px",
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: handleOpenNewPayslip,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " Fill / Add Employee Payslip"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: runPayroll,
					disabled: runningPayroll,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { size: 16 }),
						" ",
						runningPayroll ? "Processing Direct Bank Runs..." : "Disburse September Payroll"
					]
				})]
			})
		}),
		payrollSuccess && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				background: "var(--soft-teal)",
				color: "var(--teal)",
				padding: "12px 16px",
				borderRadius: "8px",
				fontSize: "11px",
				display: "flex",
				alignItems: "center",
				gap: "8px",
				marginBottom: "16px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), " Payroll & Payslips updated successfully! All deductions and earnings computed in INR (₹)."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "module-kpi-grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Current Pay Cycle" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "September 2026" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Disbursement: 30 Sep 2026 • INR (₹)" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Monthly Gross" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "var(--ink)" },
							children: formatINR(totalGross)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [payrollList.length, " Active employee payslips"] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Statutory Deductions" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "var(--coral)" },
							children: formatINR(totalDeductions)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "EPF (12%), ESIC, PT (₹200), TDS" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel module-kpi",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Disbursed Take-Home" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "var(--teal)" },
							children: formatINR(totalNet)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Direct NEFT/RTGS Bank Transfers" })
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				style: {
					flexWrap: "wrap",
					gap: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Indian Payroll Registry"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Employee Salary Breakup & Custom Payslip Generator" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "search-box",
						style: { width: "220px" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: searchQuery,
							onChange: (e) => setSearchQuery(e.target.value),
							placeholder: "Search employee or dept..."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "success",
						children: "INR ₹ Active"
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				caption: "Salary records",
				columns: [
					{
						key: "employee",
						label: "Employee & Department",
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.employeeName }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "9px",
								color: "var(--muted)"
							},
							children: [
								p.employeeId,
								" • ",
								p.department,
								" (",
								p.designation,
								")"
							]
						})] })
					},
					{
						key: "period",
						label: "Period & Days",
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.month || "September 2026" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "9px",
								color: "var(--muted)"
							},
							children: [
								p.paidDays || 30,
								"/",
								p.workingDays || 30,
								" Days",
								Number(p.lopDays) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										color: "var(--coral)",
										marginLeft: "4px"
									},
									children: [
										"(",
										p.lopDays,
										" LOP)"
									]
								})
							]
						})] })
					},
					{
						key: "gross",
						label: "Monthly Gross (₹)",
						render: (p) => {
							const { gross } = getRecordTotals(p);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(gross) });
						}
					},
					{
						key: "deductions",
						label: "Deductions (₹)",
						render: (p) => {
							const { totalDed, performanceDeduction } = getRecordTotals(p);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									color: "var(--coral)",
									fontWeight: 600
								},
								children: ["-", formatINR(totalDed)]
							}), performanceDeduction > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "9px",
									color: "#c0392b",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: [
									"Incl. ",
									formatINR(performanceDeduction),
									" Perf Ded"
								]
							})] });
						}
					},
					{
						key: "net",
						label: "Net Pay (₹)",
						render: (p) => {
							const { net } = getRecordTotals(p);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: {
									color: "var(--teal)",
									fontSize: "12px"
								},
								children: formatINR(net)
							});
						}
					},
					{
						key: "status",
						label: "Disbursement",
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "4px",
								padding: "3px 8px",
								borderRadius: "999px",
								fontSize: "9px",
								fontWeight: 700,
								textTransform: "uppercase",
								background: p.status === "processed" ? "var(--soft-teal)" : "#f0efe9",
								color: p.status === "processed" ? "var(--teal)" : "var(--muted)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 11 }),
								" ",
								p.status || "Processed"
							]
						})
					},
					{
						key: "actions",
						label: "Actions",
						render: (p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => setSelectedPayslip(p),
								title: "View official printable payslip",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 13 }), " View Slip"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "secondary",
								onClick: () => handleEditPayslip(p),
								title: "Manually fill or edit earnings and deductions in INR",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 13 }), " Edit Values"]
							})]
						})
					}
				],
				rows: filteredList
			})]
		}),
		payrollEditor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setPayrollEditor(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "payroll-editor-modal",
				onClick: (e) => e.stopPropagation(),
				"aria-labelledby": "payroll-editor-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						id: "payroll-editor-title",
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calculator, {
							size: 18,
							style: { color: "var(--teal)" }
						}), "Fill & Customize Employee Payslip (INR ₹)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							color: "var(--muted)"
						},
						children: "Manually adjust earnings, statutory EPF/ESIC/PT, and deductions in Indian Rupees."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPayrollEditor(null),
						className: "icon-button",
						"aria-label": "Close editor",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSaveEditor,
					style: {
						display: "grid",
						gap: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "payroll-form-section",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-section-title",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1. Employee & Attendance Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										color: "var(--teal)"
									},
									children: "Auto-populates from directory"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-inputs-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Select Registered Employee" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: payrollEditor.employeeId,
												onChange: (e) => handleEmployeeSelectChange(e.target.value),
												style: { cursor: "pointer" },
												children: storeState.employees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: emp.employeeId,
													children: [
														emp.name,
														" (",
														emp.employeeId,
														") — ",
														emp.department
													]
												}, emp.employeeId || emp.id))
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Employee Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.employeeName || "",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													employeeName: e.target.value
												}),
												required: true
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Employee ID" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.employeeId || "",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													employeeId: e.target.value
												}),
												required: true
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Department & Designation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: `${payrollEditor.department || ""} - ${payrollEditor.designation || ""}`,
												onChange: (e) => {
													const parts = e.target.value.split("-");
													setPayrollEditor({
														...payrollEditor,
														department: parts[0]?.trim() || "",
														designation: parts[1]?.trim() || ""
													});
												}
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Pay Month / Period" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.month || "September 2026",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													month: e.target.value
												}),
												required: true
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Total Working Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "1",
												max: "31",
												value: payrollEditor.workingDays ?? 30,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													workingDays: Number(e.target.value) || 0
												})
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Paid Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												max: "31",
												value: payrollEditor.paidDays ?? 30,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													paidDays: Number(e.target.value) || 0
												})
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loss of Pay (LOP) Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "payroll-calc-chip",
											onClick: () => {
												const lopDays = Number(payrollEditor.lopDays) || 0;
												const perDay = (Number(payrollEditor.earnings?.basic) || 0) / (Number(payrollEditor.workingDays) || 30);
												const lopDeduction = Math.round(perDay * lopDays);
												setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														lossOfPay: lopDeduction
													}
												});
											},
											children: "Auto Calc LOP"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												max: "31",
												value: payrollEditor.lopDays ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													lopDays: Number(e.target.value) || 0
												})
											})
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "payroll-form-section",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-section-title",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2. Bank & Statutory Identifiers" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										color: "var(--muted)"
									},
									children: "Indian Banking & Compliance"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-inputs-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Bank Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.bankName || "",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													bankName: e.target.value
												}),
												placeholder: "e.g. HDFC Bank, ICICI Bank, SBI"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Account Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.accountNumber || "",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													accountNumber: e.target.value
												}),
												placeholder: "5010049288492"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "IFSC Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.ifscCode || "",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													ifscCode: e.target.value
												}),
												placeholder: "HDFC0001234"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "PAN Card Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.panTaxId || "",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													panTaxId: e.target.value
												}),
												placeholder: "ABCDE1234F"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "PF UAN Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												value: payrollEditor.uanNumber || "",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													uanNumber: e.target.value
												}),
												placeholder: "100984120982"
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Disbursement Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "payroll-input-wrapper",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: payrollEditor.status || "processed",
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													status: e.target.value
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "processed",
													children: "Processed (Paid)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "draft",
													children: "Draft (Review Pending)"
												})]
											})
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "payroll-form-section",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-section-title",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--teal)" },
									children: "3. Monthly Earnings Breakdown (INR ₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "payroll-calc-chip",
									onClick: () => {
										const basic = Number(payrollEditor.earnings?.basic) || 5e4;
										const hra = Math.round(basic * .5);
										const special = Math.round(basic * .3);
										setPayrollEditor({
											...payrollEditor,
											earnings: {
												...payrollEditor.earnings,
												basic,
												hra,
												specialAllowance: special
											}
										});
									},
									children: "Apply 50% Basic + 50% HRA"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-inputs-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Basic Salary (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.earnings?.basic ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													earnings: {
														...payrollEditor.earnings || {},
														basic: Number(e.target.value) || 0
													}
												}),
												required: true
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "House Rent Allowance - HRA (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.earnings?.hra ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													earnings: {
														...payrollEditor.earnings || {},
														hra: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Special Allowance (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.earnings?.specialAllowance ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													earnings: {
														...payrollEditor.earnings || {},
														specialAllowance: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Conveyance Allowance (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.earnings?.conveyance ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													earnings: {
														...payrollEditor.earnings || {},
														conveyance: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Medical Allowance (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.earnings?.medicalAllowance ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													earnings: {
														...payrollEditor.earnings || {},
														medicalAllowance: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Performance Bonus / Incentive (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.earnings?.performanceBonus ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													earnings: {
														...payrollEditor.earnings || {},
														performanceBonus: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Overtime / Extra Earnings (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.earnings?.overtime ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													earnings: {
														...payrollEditor.earnings || {},
														overtime: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "var(--soft-teal)",
											padding: "10px 14px",
											borderRadius: "8px",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "11px",
												fontWeight: 600,
												color: "var(--teal)"
											},
											children: "Total Gross Earnings"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "15px",
												color: "var(--teal)"
											},
											children: formatINR(getRecordTotals(payrollEditor).gross)
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "payroll-form-section",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-section-title",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--coral)" },
									children: "4. Deductions Breakdown (Manual & Statutory ₹)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "6px",
										flexWrap: "wrap"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "payroll-calc-chip",
											onClick: () => {
												setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														performanceDeduction: 2500
													}
												});
											},
											title: "Quick apply ₹2,500 Performance / KPI deduction",
											children: "+ Perf Ded ₹2.5k"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "payroll-calc-chip",
											onClick: () => {
												const basic = Number(payrollEditor.earnings?.basic) || 0;
												const pf = Math.round(basic * .12);
												setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														pf
													}
												});
											},
											children: "Calc 12% PF"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "payroll-calc-chip",
											onClick: () => {
												setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														professionalTax: 200
													}
												});
											},
											children: "Set PT ₹200"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-inputs-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employees' Provident Fund - EPF (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
											style: {
												color: "var(--muted)",
												fontSize: "9px"
											},
											children: "12% of Basic"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.pf ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														pf: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ESIC (Employee State Insurance) (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
											style: {
												color: "var(--muted)",
												fontSize: "9px"
											},
											children: "0.75% of Gross"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.esi ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														esi: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Professional Tax - PT (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
											style: {
												color: "var(--muted)",
												fontSize: "9px"
											},
											children: "Standard ₹200"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.professionalTax ?? 200,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														professionalTax: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tax Deducted at Source - TDS / Income Tax (₹)" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.tdsTax ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														tdsTax: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Salary Advance / Loan Recovery (₹)" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.loanAdvance ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														loanAdvance: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loss of Pay (LOP) Deduction (₹)" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.lossOfPay ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														lossOfPay: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Performance / KPI Deduction (₹)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
											style: {
												color: "var(--muted)",
												fontSize: "10px"
											},
											children: "Shortfall, SLA breach, or performance penalty deduction"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.performanceDeduction ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														performanceDeduction: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payroll-input-row",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Other Manual Deductions (₹)" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "payroll-input-wrapper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "₹" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "number",
												min: "0",
												value: payrollEditor.deductions?.otherDeductions ?? 0,
												onChange: (e) => setPayrollEditor({
													...payrollEditor,
													deductions: {
														...payrollEditor.deductions || {},
														otherDeductions: Number(e.target.value) || 0
													}
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "var(--soft-coral)",
											padding: "10px 14px",
											borderRadius: "8px",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "11px",
												fontWeight: 600,
												color: "var(--coral)"
											},
											children: "Total Monthly Deductions"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
											style: {
												fontSize: "15px",
												color: "var(--coral)"
											},
											children: ["-", formatINR(getRecordTotals(payrollEditor).totalDed)]
										})]
									})
								]
							})]
						}),
						(() => {
							const totals = getRecordTotals(payrollEditor);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payroll-summary-banner",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payroll-summary-cols",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												opacity: .8,
												fontSize: "10px",
												textTransform: "uppercase"
											},
											children: "Gross Earnings:"
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(totals.gross) })
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												opacity: .8,
												fontSize: "10px",
												textTransform: "uppercase"
											},
											children: "Total Deductions:"
										}),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
											style: { color: "#ffb3a7" },
											children: ["-", formatINR(totals.totalDed)]
										})
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payroll-summary-net",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											textTransform: "uppercase",
											letterSpacing: "0.08em"
										},
										children: "Net Take-Home Salary (₹)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "payroll-summary-words",
										children: amountInWordsINR(totals.net)
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(totals.net) })]
								})]
							});
						})(),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hr-modal-footer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setPayrollEditor(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 }), " Save & Apply Payslip"]
							})]
						})
					]
				})]
			})
		}),
		selectedPayslip && typeof document !== "undefined" && document?.body && (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setSelectedPayslip(null),
			style: {
				zIndex: 2147483647,
				backgroundColor: "rgba(11, 23, 39, 0.85)",
				backdropFilter: "blur(5px)",
				position: "fixed",
				inset: 0,
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "20px 16px 60px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: (e) => {
						e.stopPropagation();
						setSelectedPayslip(null);
					},
					title: "Close Payslip (Esc)",
					"aria-label": "Close",
					style: {
						position: "fixed",
						top: "12px",
						right: "16px",
						zIndex: 2147483647,
						width: "42px",
						height: "42px",
						borderRadius: "50%",
						backgroundColor: "#e11d48",
						color: "#ffffff",
						border: "2px solid #ffffff",
						cursor: "pointer",
						fontSize: "20px",
						fontWeight: 900,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
						transition: "transform 0.15s ease"
					},
					onMouseEnter: (e) => e.currentTarget.style.transform = "scale(1.08)",
					onMouseLeave: (e) => e.currentTarget.style.transform = "scale(1)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						size: 20,
						strokeWidth: 3
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: (e) => e.stopPropagation(),
					style: {
						width: "100%",
						maxWidth: "760px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "10px 16px",
						marginBottom: "16px",
						background: "#002D33",
						borderRadius: "8px",
						color: "#ffffff",
						boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedPayslip(null),
							style: {
								background: "rgba(255,255,255,0.15)",
								border: "1px solid rgba(255,255,255,0.3)",
								color: "#ffffff",
								borderRadius: "6px",
								padding: "5px 12px",
								fontSize: "12px",
								fontWeight: 700,
								cursor: "pointer",
								display: "inline-flex",
								alignItems: "center",
								gap: "5px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 13 }), " Back"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: "13px",
								fontWeight: 700
							},
							children: [
								"Payslip: ",
								selectedPayslip.employeeName,
								" (",
								selectedPayslip.month || "September 2026",
								")"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedPayslip(null),
						style: {
							background: "#e11d48",
							color: "#ffffff",
							border: "none",
							borderRadius: "6px",
							padding: "5px 14px",
							fontSize: "12px",
							fontWeight: 700,
							cursor: "pointer",
							display: "inline-flex",
							alignItems: "center",
							gap: "5px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 }), " Close (Esc)"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hr-modal",
					style: {
						maxWidth: "760px",
						width: "100%",
						position: "relative"
					},
					onClick: (e) => e.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "payslip-sheet",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payslip-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payslip-brand",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: "/edufyi%20logo.jpg.jpeg",
										alt: "Edufyi Logo"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "edufy" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "11px",
												color: "#555",
												fontWeight: 600
											},
											children: "Edufyi Technologies Pvt. Ltd. • People Operations & Payroll Cell"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "9px",
												color: "#777"
											},
											children: "Registered Office: Bengaluru & San Francisco • Corporate ID: U72200KA2024PTC189021"
										})
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "payslip-title-block",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: ["Payslip for ", selectedPayslip.month || "September 2026"] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "#666",
												display: "block"
											},
											children: "Strictly Private & Confidential"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "9px",
												color: "var(--teal)",
												fontWeight: 700
											},
											children: ["Status: ", selectedPayslip.status?.toUpperCase() || "PROCESSED"]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "payslip-info-grid",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.employeeName })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee ID" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.employeeId })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.department })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Designation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.designation })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.bankName || "HDFC Bank" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Account No." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.accountNumber || employees.find((e) => String(e.id || e._id || e.employeeId) === String(selectedPayslip.employeeId))?.bankDetails?.accountNumber || "Pending Account Linking" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "IFSC Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.ifscCode || "HDFC0001234" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PAN Card Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.panTaxId || "ALX-9821-R" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PF UAN Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedPayslip.uanNumber || "100984120982" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Working Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [selectedPayslip.workingDays || 30, " Days"] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paid Days" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [selectedPayslip.paidDays || 30, " Days"] })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loss of Pay (LOP)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										style: { color: Number(selectedPayslip.lopDays) > 0 ? "var(--coral)" : "#111" },
										children: [selectedPayslip.lopDays || 0, " Days"]
									})] })
								]
							}),
							(() => {
								const b = getRecordTotals(selectedPayslip);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payslip-table-grid",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											style: {
												margin: "0 0 8px",
												fontSize: "11px",
												color: "var(--teal)",
												textTransform: "uppercase",
												letterSpacing: "0.05em"
											},
											children: "Earnings (₹ INR)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "payslip-table",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Component" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												style: { textAlign: "right" },
												children: "Amount (₹)"
											})] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Basic Salary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.basic)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "House Rent Allowance (HRA)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.hra)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Special Allowance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.special)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Conveyance Allowance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.conveyance)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Medical Allowance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.medical)
												})] }),
												b.bonus > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Performance Bonus" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.bonus)
												})] }),
												b.overtime > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Overtime / Extra" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.overtime)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													style: {
														fontWeight: 700,
														background: "#f5f7f6",
														borderTop: "2px solid #ccc"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Total Gross Earnings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														style: {
															textAlign: "right",
															color: "var(--teal)"
														},
														children: formatINR(b.gross)
													})]
												})
											] })]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											style: {
												margin: "0 0 8px",
												fontSize: "11px",
												color: "var(--coral)",
												textTransform: "uppercase",
												letterSpacing: "0.05em"
											},
											children: "Deductions (₹ INR)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "payslip-table",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Component" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												style: { textAlign: "right" },
												children: "Amount (₹)"
											})] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Provident Fund (EPF 12%)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.pf)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "ESIC Contribution" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.esi)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Professional Tax (PT)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.pt)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Income Tax (TDS)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.tds)
												})] }),
												b.loan > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Loan / Advance Recovery" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.loan)
												})] }),
												b.lop > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Loss of Pay (LOP)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.lop)
												})] }),
												b.performanceDeduction > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													style: { background: "#fff5f5" },
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														style: {
															color: "#c0392b",
															fontWeight: 600
														},
														children: "Performance / KPI Deduction"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														style: {
															textAlign: "right",
															color: "#c0392b",
															fontWeight: 700
														},
														children: ["-", formatINR(b.performanceDeduction)]
													})]
												}),
												b.other > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Other Deductions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													style: { textAlign: "right" },
													children: formatINR(b.other)
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													style: {
														fontWeight: 700,
														background: "#fcf6f5",
														borderTop: "2px solid #ccc"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: "Total Deductions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														style: {
															textAlign: "right",
															color: "var(--coral)"
														},
														children: ["-", formatINR(b.totalDed)]
													})]
												})
											] })]
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "payslip-net-box",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Take-Home Salary Payable (INR)" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													fontSize: "11px",
													opacity: .9,
													marginTop: "2px"
												},
												children: ["In Words: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: amountInWordsINR(b.net) })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
												style: {
													display: "block",
													opacity: .8,
													fontSize: "9px",
													marginTop: "4px"
												},
												children: [
													"Remitted via NEFT to ",
													selectedPayslip.bankName || "HDFC Bank",
													" (A/C:",
													" ",
													selectedPayslip.accountNumber || employees.find((e) => String(e.id || e._id || e.employeeId) === String(selectedPayslip.employeeId))?.bankDetails?.accountNumber || "Pending Link",
													")"
												]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "26px" },
											children: formatINR(b.net)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											marginTop: "20px",
											paddingTop: "14px",
											borderTop: "1px dashed #ccc",
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											fontSize: "9px",
											color: "#777"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "• This is a system-generated electronic payslip and does not require a physical signature." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Authorized by Edufyi Technologies Pvt. Ltd. HR Operations" })]
									})
								] });
							})(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "no-print",
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: "10px",
									marginTop: "22px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										onClick: () => setSelectedPayslip(null),
										style: { color: "#e11d48" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 14 }), " Close"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "secondary",
										onClick: () => {
											const slipToEdit = selectedPayslip;
											setSelectedPayslip(null);
											handleEditPayslip(slipToEdit);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 14 }), " Edit This Payslip"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => window.print(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { size: 15 }), " Print / Save PDF"]
									})
								]
							})
						]
					})
				})
			]
		}), document.body)
	] });
}
function RecruitmentModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [showAddJob, setShowAddJob] = (0, import_react.useState)(false);
	const [jobForm, setJobForm] = (0, import_react.useState)({
		title: "",
		department: "",
		location: "",
		openings: 1
	});
	const candidateList = [];
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const handleCreateJob = workspaceHandler(async (e) => {
		e.preventDefault();
		await hrStore.addRequisition(jobForm);
		setShowAddJob(false);
		setJobForm({
			title: "",
			department: "",
			location: "",
			openings: 1
		});
	});
	function advanceCandidate(candidateId) {
		return candidateId;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Talent Acquisition",
			title: "Recruitment & Referral Command Center",
			description: "Track active job requisitions, candidate interview pipelines, and employee referral bonus rewards.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setShowAddJob(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Post Job Requisition"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "grid",
				gridTemplateColumns: "repeat(4, 1fr)",
				gap: "14px",
				marginBottom: "22px"
			},
			children: storeState.requisitions.map((req) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				style: { padding: "16px" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "9px",
							textTransform: "uppercase",
							color: "var(--teal)",
							fontWeight: 700
						},
						children: req.department
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: "6px 0 4px",
							fontSize: "13px"
						},
						children: req.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							margin: "0 0 12px",
							fontSize: "10px",
							color: "var(--muted)"
						},
						children: [
							req.location,
							" • ",
							req.openings,
							" opening(s)"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							borderTop: "1px solid var(--line)",
							paddingTop: "10px",
							fontSize: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Applicant tracking not configured" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: "info",
							children: req.status
						})]
					})
				]
			}, req.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Interactive Kanban"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Candidate Interview Pipeline" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StatusBadge, {
					tone: "info",
					children: [candidateList.length, " Active Candidates"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "kanban-board",
				children: [
					"Applied",
					"Screening",
					"Technical Interview",
					"Offer"
				].map((col) => {
					const candidates = candidateList.filter((c) => c.stage === col);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "kanban-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "kanban-col-header",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: col }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "badge-pill",
								children: candidates.length
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "kanban-cards",
							children: [candidates.map((cand) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "kanban-card",
								onClick: () => advanceCandidate(cand.id),
								title: "Click to advance stage",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: cand.name }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										cand.role,
										" • ",
										cand.experience
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "kanban-card-footer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Score: ", cand.rating] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--teal)",
												fontWeight: 600
											},
											children: "Advance Stage →"
										})]
									})
								]
							}, cand.id)), candidates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									color: "var(--muted)",
									fontSize: "10px",
									textAlign: "center",
									padding: "24px 0"
								},
								children: ["No candidates in ", col]
							})]
						})]
					}, col);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			style: { marginTop: "18px" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Incentive Program"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Employee Referral Bonus Tracker" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						color: "var(--muted)",
						fontSize: "11px"
					},
					children: "Referral payments not configured"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				caption: "Referral program",
				columns: [
					{
						key: "referrer",
						label: "Referring Employee",
						render: (row) => row.referrer || "-"
					},
					{
						key: "candidate",
						label: "Candidate Referred",
						render: (row) => row.candidate || "-"
					},
					{
						key: "role",
						label: "Applied Role",
						render: (row) => row.role || "-"
					},
					{
						key: "bonus",
						label: "Referral Bonus",
						render: (row) => row.bonus ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { color: "var(--teal)" },
							children: row.bonus
						}) : "-"
					},
					{
						key: "status",
						label: "Bonus Status",
						render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: "info",
							children: row.status || "Under Review"
						})
					}
				],
				rows: []
			})]
		}),
		showAddJob && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setShowAddJob(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Post New Job Requisition" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: () => setShowAddJob(false),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreateJob,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-body",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Job Title",
							required: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								placeholder: "e.g. Lead Mobile Engineer",
								value: jobForm.title,
								onChange: (e) => setJobForm({
									...jobForm,
									title: e.target.value
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Department",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: jobForm.department,
									onChange: (e) => setJobForm({
										...jobForm,
										department: e.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Engineering",
											children: "Engineering"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Product",
											children: "Product"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Design",
											children: "Design"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Human Resources",
											children: "Human Resources"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Marketing",
											children: "Marketing"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Open Positions",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: jobForm.openings,
									onChange: (e) => setJobForm({
										...jobForm,
										openings: e.target.value
									})
								})
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-footer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setShowAddJob(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Publish Job Requisition"
						})]
					})]
				})]
			})
		})
	] });
}
function TasksModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [showAddModal, setShowAddModal] = (0, import_react.useState)(false);
	const [taskForm, setTaskForm] = (0, import_react.useState)({
		title: "",
		assigneeId: "",
		priority: "Medium",
		dueDate: "",
		category: "General"
	});
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const handleCreateTask = workspaceHandler(async (e) => {
		e.preventDefault();
		const emp = storeState.employees.find((e) => e.employeeId === taskForm.assigneeId);
		await hrStore.addTask({
			...taskForm,
			assigneeName: emp?.name || "Assigned Staff"
		});
		setShowAddModal(false);
		setTaskForm({
			title: "",
			assigneeId: "",
			priority: "Medium",
			dueDate: "",
			category: "General"
		});
	});
	const advanceTask = workspaceHandler(async (taskId, currentStatus) => {
		const nextStatus = currentStatus === "todo" ? "in_progress" : currentStatus === "in_progress" ? "completed" : "todo";
		await hrStore.updateTaskStatus(taskId, nextStatus);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Workforce Execution",
			title: "Task Management & Delegation",
			description: "Coordinate team duties, set priorities, manage deadlines, and balance operational workload.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setShowAddModal(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Create Task"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "kanban-board",
			children: [
				{
					key: "todo",
					label: "To Do"
				},
				{
					key: "in_progress",
					label: "In Progress"
				},
				{
					key: "completed",
					label: "Completed"
				}
			].map((col) => {
				const colTasks = storeState.tasks.filter((t) => t.status === col.key);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "kanban-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "kanban-col-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: col.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "badge-pill",
							children: colTasks.length
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "kanban-cards",
						children: colTasks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "kanban-card",
							onClick: () => advanceTask(t.id, t.status),
							title: "Click to advance status",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "9px",
										textTransform: "uppercase",
										color: t.priority === "Urgent" ? "var(--coral)" : "var(--teal)",
										fontWeight: 700
									},
									children: [
										t.priority,
										" • ",
										t.category
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: t.title }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Assignee: ", t.assigneeName] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "kanban-card-footer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Due: ", t.dueDate] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--teal)",
											fontWeight: 600
										},
										children: "Update Status →"
									})]
								})
							]
						}, t.id))
					})]
				}, col.key);
			})
		}),
		showAddModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "hr-modal-backdrop",
			onClick: () => setShowAddModal(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hr-modal",
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Assign New Team Task" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: () => setShowAddModal(false),
						children: "✕"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreateTask,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-body",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Task Description",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									required: true,
									placeholder: "e.g. Verify employee tax declarations for Q3",
									value: taskForm.title,
									onChange: (e) => setTaskForm({
										...taskForm,
										title: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Assignee",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: taskForm.assigneeId,
										onChange: (e) => setTaskForm({
											...taskForm,
											assigneeId: e.target.value
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select employee"
										}), storeState.employees.map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: emp.employeeId,
											children: emp.name
										}, emp.employeeId))]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Priority",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: taskForm.priority,
										onChange: (e) => setTaskForm({
											...taskForm,
											priority: e.target.value
										}),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Urgent",
												children: "Urgent"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "High",
												children: "High"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Medium",
												children: "Medium"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Low",
												children: "Low"
											})
										]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Due Date",
								required: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									value: taskForm.dueDate,
									onChange: (e) => setTaskForm({
										...taskForm,
										dueDate: e.target.value
									}),
									required: true
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-footer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setShowAddModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Assign Task"
						})]
					})]
				})]
			})
		})
	] });
}
function LearningModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [courseForm, setCourseForm] = (0, import_react.useState)({
		title: "",
		category: "",
		duration: "",
		url: ""
	});
	const publishCourse = workspaceHandler(async (event) => {
		event.preventDefault();
		await hrStore.addCourse({
			...courseForm,
			modules: []
		});
		setCourseForm({
			title: "",
			category: "",
			duration: "",
			url: ""
		});
	});
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Skill Development",
			title: "Training & Certification Portal",
			description: "Publish actual course links and track persisted enrollment and self-reported learning progress."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "panel",
			onSubmit: publishCourse,
			style: {
				padding: "16px",
				marginBottom: "16px",
				display: "grid",
				gap: "10px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Publish training course" }),
				[
					"title",
					"category",
					"duration",
					"url"
				].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: key,
					required: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: key === "url" ? "url" : "text",
						required: true,
						value: courseForm[key],
						onChange: (event) => setCourseForm({
							...courseForm,
							[key]: event.target.value
						})
					})
				}, key)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Publish course"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "grid",
				gridTemplateColumns: "repeat(2, 1fr)",
				gap: "16px",
				marginBottom: "22px"
			},
			children: storeState.courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				style: { padding: "20px" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: "9px",
								textTransform: "uppercase",
								color: "var(--teal)",
								fontWeight: 700
							},
							children: [
								course.category,
								" • ",
								course.duration
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: course.completed ? "info" : "warning",
							children: course.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: "0 0 10px",
							fontSize: "14px"
						},
						children: course.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							height: "6px",
							background: "#eee",
							borderRadius: "99px",
							overflow: "hidden",
							marginBottom: "14px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
							width: `${course.progress}%`,
							height: "100%",
							background: "var(--teal)"
						} })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted)"
								},
								children: [
									"Modules: ",
									course.modules.length,
									" lessons"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: course.url,
								target: "_blank",
								rel: "noopener noreferrer",
								children: "Open course"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: workspaceHandler(() => course.enrolled ? hrStore.updateCourseProgress(course.id, 100) : hrStore.enrollCourse(course.id)),
								children: course.enrolled ? "Report completion" : "Enroll"
							})
						]
					})
				]
			}, course.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Completion is self-reported; verified assessments and certificates are not configured." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
			caption: "Training enrollments",
			columns: [
				{
					key: "ownerId",
					label: "Employee",
					render: (record) => (storeState.workspacePeople ?? []).find((person) => person.id === record.ownerId)?.name ?? record.ownerId
				},
				{
					key: "courseId",
					label: "Course",
					render: (record) => storeState.courses.find((course) => course.id === record.courseId)?.title ?? record.courseId
				},
				{
					key: "progress",
					label: "Self-reported progress",
					render: (record) => `${record.progress}%`
				},
				{
					key: "completedAt",
					label: "Completion reported at"
				}
			],
			rows: storeState.enrollments ?? []
		})
	] });
}
function HelpDeskModule() {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [selectedTicketId, setSelectedTicketId] = (0, import_react.useState)(null);
	const [replyText, setReplyText] = (0, import_react.useState)("");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [categoryFilter, setCategoryFilter] = (0, import_react.useState)("all");
	const [showCreateModal, setShowCreateModal] = (0, import_react.useState)(false);
	const [feedback, setFeedback] = (0, import_react.useState)("");
	const [activeTab, setActiveTab] = (0, import_react.useState)("queue");
	const [resolvingTicket, setResolvingTicket] = (0, import_react.useState)(null);
	const [resolutionNotes, setResolutionNotes] = (0, import_react.useState)("");
	const [isResolving, setIsResolving] = (0, import_react.useState)(false);
	const initialHelpDesk = storeState.companySettings?.helpDeskSettings || {};
	const [itSupportEmail, setItSupportEmail] = (0, import_react.useState)(initialHelpDesk.itSupportEmail || "itsupport@edufyitech.in");
	const [itSupportEmployeeId, setItSupportEmployeeId] = (0, import_react.useState)(initialHelpDesk.itSupportEmployeeId || "");
	const [itSupportEmployeeName, setItSupportEmployeeName] = (0, import_react.useState)(initialHelpDesk.itSupportEmployeeName || "");
	const [itSupportEmployeeEmail, setItSupportEmployeeEmail] = (0, import_react.useState)(initialHelpDesk.itSupportEmployeeEmail || "");
	const [generalSupportEmail, setGeneralSupportEmail] = (0, import_react.useState)(initialHelpDesk.generalSupportEmail || initialHelpDesk.supportEmail || "admin@edufyitech.in");
	const [generalSupportEmployeeId, setGeneralSupportEmployeeId] = (0, import_react.useState)(initialHelpDesk.generalSupportEmployeeId || "");
	const [generalSupportEmployeeName, setGeneralSupportEmployeeName] = (0, import_react.useState)(initialHelpDesk.generalSupportEmployeeName || "");
	const [generalSupportEmployeeEmail, setGeneralSupportEmployeeEmail] = (0, import_react.useState)(initialHelpDesk.generalSupportEmployeeEmail || "");
	const [defaultPriority, setDefaultPriority] = (0, import_react.useState)(initialHelpDesk.defaultPriority || "Medium");
	const [autoAssignToManager, setAutoAssignToManager] = (0, import_react.useState)(initialHelpDesk.autoAssignToManager ?? true);
	const [emailNotificationsEnabled, setEmailNotificationsEnabled] = (0, import_react.useState)(initialHelpDesk.emailNotificationsEnabled ?? true);
	const [configSaving, setConfigSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const hd = storeState.companySettings?.helpDeskSettings;
		if (hd) {
			if (hd.itSupportEmail !== void 0) setItSupportEmail(hd.itSupportEmail);
			if (hd.itSupportEmployeeId !== void 0) setItSupportEmployeeId(hd.itSupportEmployeeId);
			if (hd.itSupportEmployeeName !== void 0) setItSupportEmployeeName(hd.itSupportEmployeeName);
			if (hd.itSupportEmployeeEmail !== void 0) setItSupportEmployeeEmail(hd.itSupportEmployeeEmail);
			if (hd.generalSupportEmail !== void 0) setGeneralSupportEmail(hd.generalSupportEmail);
			else if (hd.supportEmail !== void 0) setGeneralSupportEmail(hd.supportEmail);
			if (hd.generalSupportEmployeeId !== void 0) setGeneralSupportEmployeeId(hd.generalSupportEmployeeId);
			if (hd.generalSupportEmployeeName !== void 0) setGeneralSupportEmployeeName(hd.generalSupportEmployeeName);
			if (hd.generalSupportEmployeeEmail !== void 0) setGeneralSupportEmployeeEmail(hd.generalSupportEmployeeEmail);
			if (hd.defaultPriority !== void 0) setDefaultPriority(hd.defaultPriority);
			if (hd.autoAssignToManager !== void 0) setAutoAssignToManager(hd.autoAssignToManager);
			if (hd.emailNotificationsEnabled !== void 0) setEmailNotificationsEnabled(hd.emailNotificationsEnabled);
		}
	}, [storeState.companySettings]);
	const handleSaveConfig = async (e) => {
		e.preventDefault();
		setConfigSaving(true);
		try {
			await hrStore.updateCompanySettings({ helpDeskSettings: {
				itSupportEmail: itSupportEmail.trim() || "itsupport@edufyitech.in",
				itSupportEmployeeId,
				itSupportEmployeeName,
				itSupportEmployeeEmail,
				generalSupportEmail: generalSupportEmail.trim() || "admin@edufyitech.in",
				generalSupportEmployeeId,
				generalSupportEmployeeName,
				generalSupportEmployeeEmail,
				supportEmail: generalSupportEmail.trim() || "admin@edufyitech.in",
				defaultPriority,
				autoAssignToManager: Boolean(autoAssignToManager),
				emailNotificationsEnabled: Boolean(emailNotificationsEnabled)
			} });
			setFeedback("✓ Help desk & support routing configuration saved successfully!");
			setTimeout(() => setFeedback(""), 5e3);
		} catch (err) {
			setFeedback(`✕ Failed to save configuration: ${err.message || "Please try again."}`);
			setTimeout(() => setFeedback(""), 5e3);
		} finally {
			setConfigSaving(false);
		}
	};
	const [isSubmittingTicket, setIsSubmittingTicket] = (0, import_react.useState)(false);
	const [newTicket, setNewTicket] = (0, import_react.useState)({
		subject: "",
		category: "IT Support",
		priority: "Medium",
		description: "",
		employeeId: "",
		employeeName: ""
	});
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => {
			setStoreState(state);
		});
	}, []);
	const allTickets = storeState.tickets || [];
	(0, import_react.useEffect)(() => {
		if (!selectedTicketId && allTickets.length > 0) setSelectedTicketId(allTickets[0].id);
	}, [allTickets, selectedTicketId]);
	const selectedTicket = allTickets.find((t) => t.id === selectedTicketId) || null;
	const filteredTickets = allTickets.filter((ticket) => {
		const status = (ticket.status || "open").toLowerCase();
		if (statusFilter === "open" && status !== "open") return false;
		if (statusFilter === "in_progress" && status !== "in_progress") return false;
		if (statusFilter === "resolved" && status !== "resolved" && status !== "closed") return false;
		if (categoryFilter !== "all" && ticket.category !== categoryFilter) return false;
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase();
			const matchSubject = (ticket.subject || "").toLowerCase().includes(q);
			const matchId = (ticket.id || "").toLowerCase().includes(q);
			const matchName = (ticket.employeeName || "").toLowerCase().includes(q);
			const matchCat = (ticket.category || "").toLowerCase().includes(q);
			if (!matchSubject && !matchId && !matchName && !matchCat) return false;
		}
		return true;
	});
	const openCount = allTickets.filter((t) => (t.status || "open") === "open").length;
	const inProgressCount = allTickets.filter((t) => t.status === "in_progress").length;
	const resolvedCount = allTickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
	const sendReply = workspaceHandler(async () => {
		if (!replyText.trim() || !selectedTicket) return;
		await hrStore.replyToTicket(selectedTicket.id, replyText.trim(), user?.displayName || user?.name || "HR Operations Desk");
		setReplyText("");
		setFeedback("Resolution response posted to ticket thread.");
		setTimeout(() => setFeedback(""), 3500);
	});
	const updateStatus = workspaceHandler(async (ticketId, nextStatus) => {
		await hrStore.updateTicketStatus(ticketId, nextStatus);
		setFeedback(`Ticket status updated to ${nextStatus.replace("_", " ").toUpperCase()}.`);
		setTimeout(() => setFeedback(""), 3500);
	});
	const handleResolveSubmit = async (e) => {
		e?.preventDefault?.();
		if (!resolvingTicket) return;
		setIsResolving(true);
		try {
			const ticketId = resolvingTicket.id || resolvingTicket._id;
			await hrStore.updateTicketStatus(ticketId, "resolved", resolutionNotes.trim());
			setFeedback("Ticket successfully resolved and resolution notes dispatched to requester!");
			setTimeout(() => setFeedback(""), 4500);
			setResolvingTicket(null);
			setResolutionNotes("");
		} catch (err) {
			setFeedback("Error resolving ticket: " + (err.message || "Unknown error"));
		} finally {
			setIsResolving(false);
		}
	};
	const handleAssignToMe = async (ticket) => {
		if (!ticket) return;
		const ticketId = ticket.id || ticket._id;
		const payload = {
			assignedToId: user?.employeeId || user?.id || user?._id || "",
			assignedToName: user?.displayName || user?.name || "Support Specialist",
			assignedToEmail: user?.email || ""
		};
		await hrStore.assignTicket(ticketId, payload);
		setFeedback(`Ticket assigned to you (${payload.assignedToName}).`);
		setTimeout(() => setFeedback(""), 3500);
	};
	const handleCreateTicketSubmit = workspaceHandler(async (e) => {
		e.preventDefault();
		if (isSubmittingTicket) return;
		if (!newTicket.subject.trim() || !newTicket.description.trim()) return;
		setIsSubmittingTicket(true);
		try {
			const emp = (storeState.employees || []).find((e) => e.id === newTicket.employeeId || e.employeeId === newTicket.employeeId);
			await hrStore.createTicket({
				subject: newTicket.subject.trim(),
				category: newTicket.category,
				priority: newTicket.priority,
				description: newTicket.description.trim(),
				employeeId: emp?.employeeId || emp?.id || user?.employeeId || "STAFF",
				employeeName: emp?.name || newTicket.employeeName || user?.displayName || "Internal Staff"
			});
			setShowCreateModal(false);
			setNewTicket({
				subject: "",
				category: "IT Support",
				priority: "Medium",
				description: "",
				employeeId: "",
				employeeName: ""
			});
			setFeedback("New support ticket raised and dispatched to service queue.");
			setTimeout(() => setFeedback(""), 3500);
		} catch (err) {
			setFeedback("Failed to log ticket: " + (err.message || "Please try again."));
			setTimeout(() => setFeedback(""), 3500);
		} finally {
			setIsSubmittingTicket(false);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageHeader, {
			eyebrow: "Employee Support",
			title: "Help Desk & Ticket Resolution",
			description: "Triage employee inquiries, hardware/IT requests, payroll questions, and maintain service SLAs.",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "ui-button secondary",
				onClick: () => setActiveTab(activeTab === "config" ? "queue" : "config"),
				style: {
					display: "inline-flex",
					alignItems: "center",
					gap: "6px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { size: 14 }),
					" ",
					activeTab === "config" ? "View Ticket Queue" : "Help Desk Configuration"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "ui-button primary",
				onClick: () => setShowCreateModal(true),
				style: {
					display: "inline-flex",
					alignItems: "center",
					gap: "6px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " Raise Support Ticket"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "subnav-tabs",
			style: { marginBottom: "18px" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `subnav-tab ${activeTab === "queue" ? "active" : ""}`,
				onClick: () => setActiveTab("queue"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { size: 14 }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Support Tickets Queue" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "badge-pill",
						children: allTickets.length
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `subnav-tab ${activeTab === "config" ? "active" : ""}`,
				onClick: () => setActiveTab("config"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Help Desk Configuration & SLAs" })]
			})]
		}),
		feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "flex",
				alignItems: "center",
				gap: "10px",
				background: "#eaf4f1",
				color: "var(--teal)",
				border: "1px solid #c7ded7",
				borderRadius: "8px",
				padding: "10px 16px",
				marginBottom: "16px",
				fontSize: "12px",
				fontWeight: 600
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: { flex: 1 },
					children: feedback
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFeedback(""),
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
		activeTab === "config" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			style: { borderLeft: "4px solid #0284c7" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Support Infrastructure"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Help Desk Configuration & Department Routing" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "role-badge",
						style: {
							fontSize: "10px",
							background: "#e0f2fe",
							color: "#0369a1",
							border: "1px solid #bae6fd"
						},
						children: "Multi-Tier SLA Engine"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						fontSize: "12px",
						color: "var(--muted)",
						margin: "8px 0 16px"
					},
					children: "Configure enterprise support ticket routing emails, manager escalation protocols, and automated notification triggers for employee IT, HR, Payroll, and Facilities requests."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSaveConfig,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							maxWidth: "780px",
							marginBottom: "16px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#f0f9ff",
								border: "1px solid #bae6fd",
								borderRadius: "8px",
								padding: "18px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: {
									fontSize: "14px",
									color: "#0369a1",
									display: "block",
									marginBottom: "14px"
								},
								children: "Department Support Routing & Dispatch Emails"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gap: "14px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#fff",
											border: "1px solid #bae6fd",
											borderRadius: "8px",
											padding: "14px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "8px",
													marginBottom: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														background: "#0284c7",
														color: "#fff",
														fontSize: "11px",
														fontWeight: 700,
														padding: "2px 8px",
														borderRadius: "4px"
													},
													children: "IT SUPPORT"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													style: {
														fontSize: "13px",
														color: "#0f172a"
													},
													children: "IT & Hardware Assignment"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												style: {
													fontSize: "11.5px",
													display: "block",
													color: "var(--muted)",
													marginBottom: "5px",
													fontWeight: 600
												},
												children: "Select Support Employee for IT Issues (All hardware & IT tickets route to this person):"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												className: "select-control",
												value: itSupportEmployeeId,
												onChange: (e) => {
													const selId = e.target.value;
													setItSupportEmployeeId(selId);
													const emp = (storeState.employees || []).find((x) => String(x.id || x._id || x.employeeId) === selId);
													if (emp) {
														setItSupportEmployeeName(emp.name || emp.displayName || "");
														setItSupportEmployeeEmail(emp.email || "");
													} else {
														setItSupportEmployeeName("");
														setItSupportEmployeeEmail("");
													}
												},
												style: {
													width: "100%",
													padding: "8px 10px",
													fontSize: "12.5px",
													borderRadius: "6px",
													border: "1px solid #cbd5e1",
													marginBottom: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "-- Choose Dedicated IT Support Employee from Staff List --"
												}), (storeState.employees || []).map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: String(emp.id || emp._id || emp.employeeId),
													children: [
														emp.name,
														" (",
														emp.employeeId || "STAFF",
														") — ",
														emp.designation || "Pending Designation"
													]
												}, emp.id || emp._id))]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "grid",
													gridTemplateColumns: "1fr 1fr",
													gap: "10px",
													fontSize: "11px",
													background: "#f8fafc",
													padding: "8px 12px",
													borderRadius: "6px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: { color: "var(--muted)" },
														children: "Assigned Employee:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: itSupportEmployeeName ? `${itSupportEmployeeName} (${itSupportEmployeeEmail || "No email"})` : "None selected" })
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: { color: "var(--muted)" },
														children: "Dedicated IT Email Channel:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
														style: { color: "#0284c7" },
														children: itSupportEmail || "itsupport@edufyitech.in"
													})
												] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													fontSize: "10.5px",
													color: "var(--muted)",
													marginTop: "6px",
													display: "block"
												},
												children: [
													"When an employee submits an IT inquiry, it arrives on ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "itsupport@edufyitech.in" }),
													" and directly in this employee's portal queue. When resolved, an email response is sent from ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "itsupport@edufyitech.in" }),
													" to the requester."
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											background: "#fff",
											border: "1px solid #bbf7d0",
											borderRadius: "8px",
											padding: "14px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "8px",
													marginBottom: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														background: "#16a34a",
														color: "#fff",
														fontSize: "11px",
														fontWeight: 700,
														padding: "2px 8px",
														borderRadius: "4px"
													},
													children: "GENERAL SUPPORT"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													style: {
														fontSize: "13px",
														color: "#0f172a"
													},
													children: "HR, Payroll & Facilities Assignment"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												style: {
													fontSize: "11.5px",
													display: "block",
													color: "var(--muted)",
													marginBottom: "5px",
													fontWeight: 600
												},
												children: "Select Support Employee for HR, Payroll & Facilities:"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												className: "select-control",
												value: generalSupportEmployeeId,
												onChange: (e) => {
													const selId = e.target.value;
													setGeneralSupportEmployeeId(selId);
													const emp = (storeState.employees || []).find((x) => String(x.id || x._id || x.employeeId) === selId);
													if (emp) {
														setGeneralSupportEmployeeName(emp.name || emp.displayName || "");
														setGeneralSupportEmployeeEmail(emp.email || "");
													} else {
														setGeneralSupportEmployeeName("");
														setGeneralSupportEmployeeEmail("");
													}
												},
												style: {
													width: "100%",
													padding: "8px 10px",
													fontSize: "12.5px",
													borderRadius: "6px",
													border: "1px solid #cbd5e1",
													marginBottom: "8px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "-- Choose Dedicated General Support Employee from Staff List --"
												}), (storeState.employees || []).map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: String(emp.id || emp._id || emp.employeeId),
													children: [
														emp.name,
														" (",
														emp.employeeId || "STAFF",
														") — ",
														emp.designation || "Pending Designation"
													]
												}, emp.id || emp._id))]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "grid",
													gridTemplateColumns: "1fr 1fr",
													gap: "10px",
													fontSize: "11px",
													background: "#f8fafc",
													padding: "8px 12px",
													borderRadius: "6px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: { color: "var(--muted)" },
														children: "Assigned Employee:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: generalSupportEmployeeName ? `${generalSupportEmployeeName} (${generalSupportEmployeeEmail || "No email"})` : "None selected" })
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: { color: "var(--muted)" },
														children: "Unified Gateway Address:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
														style: { color: "#16a34a" },
														children: generalSupportEmail || "admin@edufyitech.in"
													})
												] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													fontSize: "10.5px",
													color: "var(--muted)",
													marginTop: "6px",
													display: "block"
												},
												children: [
													"HR Policies & Payroll tickets route to ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "hr@edufyitech.in" }),
													" and Workplace & Facilities tickets route to ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "admin@edufyitech.in" }),
													"."
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											borderTop: "1px solid #e0f2fe",
											paddingTop: "14px",
											marginTop: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "13px",
												color: "#0369a1",
												display: "block",
												marginBottom: "12px"
											},
											children: "Ticket Workflow & Automation Rules"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "grid",
												gap: "12px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													style: {
														fontSize: "11px",
														display: "block",
														color: "var(--muted)",
														marginBottom: "3px",
														fontWeight: 600
													},
													children: "Default Ticket Priority Level"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													className: "text-input",
													value: defaultPriority,
													onChange: (e) => setDefaultPriority(e.target.value),
													style: {
														width: "100%",
														padding: "8px 10px",
														fontSize: "12px",
														background: "#fff"
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Low",
															children: "Low — Non-urgent query"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Medium",
															children: "Medium — Standard SLA (24 hrs)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "High",
															children: "High — Critical blocker"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
															value: "Urgent",
															children: "Urgent — Immediate intervention"
														})
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														alignItems: "center",
														gap: "8px"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														id: "autoAssignManagerHelp",
														checked: autoAssignToManager,
														onChange: (e) => setAutoAssignToManager(e.target.checked),
														style: {
															cursor: "pointer",
															width: "16px",
															height: "16px"
														}
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														htmlFor: "autoAssignManagerHelp",
														style: {
															fontSize: "12px",
															cursor: "pointer"
														},
														children: "Auto-assign & notify direct reporting manager when employee raises a ticket"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														alignItems: "center",
														gap: "8px"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														id: "emailNotifsHelp",
														checked: emailNotificationsEnabled,
														onChange: (e) => setEmailNotificationsEnabled(e.target.checked),
														style: {
															cursor: "pointer",
															width: "16px",
															height: "16px"
														}
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														htmlFor: "emailNotifsHelp",
														style: {
															fontSize: "12px",
															cursor: "pointer"
														},
														children: "Enable automatic email notifications for ticket status transitions and replies"
													})]
												})
											]
										})]
									})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-start",
							gap: "10px",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "ui-button primary",
							disabled: configSaving,
							style: {
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
								padding: "10px 20px",
								fontSize: "13px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }),
								" ",
								configSaving ? "Saving Help Desk Configuration..." : "Save Help Desk Configuration"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => setActiveTab("queue"),
							style: {
								fontSize: "12px",
								padding: "10px 16px"
							},
							children: "Back to Ticket Queue"
						})]
					})]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
				gap: "14px",
				marginBottom: "18px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						padding: "14px 18px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: "0 0 4px",
							fontSize: "11px",
							color: "var(--muted)",
							textTransform: "uppercase",
							fontWeight: 600
						},
						children: "All Tickets"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: 0,
							fontSize: "22px",
							fontWeight: 700,
							color: "var(--ink)"
						},
						children: allTickets.length
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "40px",
							height: "40px",
							borderRadius: "10px",
							background: "rgba(10,35,40,0.06)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "var(--ink)"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { size: 20 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						padding: "14px 18px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderLeft: "4px solid #f59e0b"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: "0 0 4px",
							fontSize: "11px",
							color: "#b45309",
							textTransform: "uppercase",
							fontWeight: 600
						},
						children: "Awaiting Response"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: 0,
							fontSize: "22px",
							fontWeight: 700,
							color: "#b45309"
						},
						children: openCount
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "40px",
							height: "40px",
							borderRadius: "10px",
							background: "rgba(245,158,11,0.12)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#b45309"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 20 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						padding: "14px 18px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderLeft: "4px solid #0284c7"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: "0 0 4px",
							fontSize: "11px",
							color: "#0369a1",
							textTransform: "uppercase",
							fontWeight: 600
						},
						children: "In Progress"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: 0,
							fontSize: "22px",
							fontWeight: 700,
							color: "#0369a1"
						},
						children: inProgressCount
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "40px",
							height: "40px",
							borderRadius: "10px",
							background: "rgba(2,132,199,0.12)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#0284c7"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 20 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						padding: "14px 18px",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderLeft: "4px solid #10b981"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: "0 0 4px",
							fontSize: "11px",
							color: "#047857",
							textTransform: "uppercase",
							fontWeight: 600
						},
						children: "Resolved"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: 0,
							fontSize: "22px",
							fontWeight: 700,
							color: "#047857"
						},
						children: resolvedCount
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "40px",
							height: "40px",
							borderRadius: "10px",
							background: "rgba(16,185,129,0.12)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#10b981"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 20 })
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "leave-workspace-grid",
			style: { minHeight: "560px" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel leave-list-panel",
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						style: {
							flexWrap: "wrap",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Queue"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							"Support Tickets (",
							filteredTickets.length,
							")"
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								gap: "6px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: {
									fontSize: "10px",
									padding: "3px 8px"
								},
								children: statusFilter === "all" ? "All Status" : statusFilter.toUpperCase()
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "8px",
							padding: "10px 0",
							borderBottom: "1px solid var(--line)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { position: "relative" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									size: 14,
									style: {
										position: "absolute",
										left: "10px",
										top: "10px",
										color: "var(--muted)"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "Search subject, requester, or ID...",
									value: searchTerm,
									onChange: (e) => setSearchTerm(e.target.value),
									style: {
										width: "100%",
										paddingLeft: "32px",
										fontSize: "11.5px",
										height: "34px"
									}
								}),
								searchTerm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setSearchTerm(""),
									style: {
										position: "absolute",
										right: "10px",
										top: "9px",
										border: 0,
										background: "transparent",
										cursor: "pointer",
										color: "var(--muted)",
										fontSize: "12px"
									},
									children: "✕"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								value: statusFilter,
								onChange: (e) => setStatusFilter(e.target.value),
								style: {
									fontSize: "11px",
									height: "32px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "Status: All"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: "open",
										children: [
											"Status: Open (",
											openCount,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: "in_progress",
										children: [
											"Status: In Progress (",
											inProgressCount,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: "resolved",
										children: [
											"Status: Resolved (",
											resolvedCount,
											")"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								value: categoryFilter,
								onChange: (e) => setCategoryFilter(e.target.value),
								style: {
									fontSize: "11px",
									height: "32px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "Category: All"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "IT Support",
										children: "IT & Hardware"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "HR Policies",
										children: "HR & Policies"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Payroll",
										children: "Payroll"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Facilities",
										children: "Workplace/Facilities"
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: "8px",
							marginTop: "12px",
							flex: 1,
							overflowY: "auto",
							maxHeight: "520px"
						},
						children: filteredTickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "36px 16px",
								textAlign: "center",
								color: "var(--muted)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, {
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
									children: "No tickets found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { fontSize: "11.5px" },
									children: "Try clearing filters or raise a new inquiry."
								})
							]
						}) : filteredTickets.map((ticket) => {
							const isSelected = selectedTicket?.id === ticket.id;
							const p = (ticket.priority || "Medium").toLowerCase();
							const s = (ticket.status || "open").toLowerCase();
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `leave-request-card ${isSelected ? "selected" : ""}`,
								onClick: () => setSelectedTicketId(ticket.id),
								style: {
									cursor: "pointer",
									borderLeft: isSelected ? "4px solid var(--teal)" : s === "resolved" ? "4px solid #10b981" : p === "urgent" || p === "high" ? "4px solid #ef4444" : "4px solid #f59e0b",
									padding: "12px 14px",
									borderRadius: "8px",
									background: isSelected ? "#f0f9f8" : "#fff",
									transition: "all 0.15s ease"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "leave-request-top",
									style: { marginBottom: "6px" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											minWidth: 0,
											flex: 1
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "6px",
												flexWrap: "wrap"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: {
													fontSize: "12.5px",
													color: "var(--ink)"
												},
												children: ticket.employeeName || "Staff"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													fontSize: "10px",
													color: "var(--muted)"
												},
												children: ["#", ticket.id]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "11px",
												color: "var(--muted)",
												display: "block",
												marginTop: "2px"
											},
											children: [
												ticket.category || "General",
												" • ",
												ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "Recent"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: s === "resolved" || s === "closed" ? "success" : s === "in_progress" ? "info" : "warning",
										children: s.replace("_", " ")
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "leave-request-bottom",
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											fontWeight: 500,
											color: "var(--ink)",
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											maxWidth: "200px"
										},
										children: ticket.subject
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "9.5px",
											fontWeight: 700,
											textTransform: "uppercase",
											padding: "2px 6px",
											borderRadius: "4px",
											background: p === "urgent" || p === "high" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
											color: p === "urgent" || p === "high" ? "#dc2626" : "#d97706"
										},
										children: ticket.priority || "Medium"
									})]
								})]
							}, ticket.id);
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel leave-detail-panel",
				style: {
					display: "flex",
					flexDirection: "column"
				},
				children: selectedTicket ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						style: {
							borderBottom: "1px solid var(--line)",
							paddingBottom: "12px",
							marginBottom: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								minWidth: 0,
								flex: 1
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "section-kicker",
								children: ["Ticket #", selectedTicket.id]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								style: {
									fontSize: "17px",
									margin: "2px 0 0",
									color: "var(--ink)"
								},
								children: selectedTicket.subject
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								tone: selectedTicket.status === "resolved" || selectedTicket.status === "closed" ? "success" : selectedTicket.status === "in_progress" ? "info" : "warning",
								children: (selectedTicket.status || "open").replace("_", " ")
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							background: "#f8fafc",
							padding: "8px 12px",
							borderRadius: "8px",
							marginBottom: "14px",
							border: "1px solid var(--line)",
							flexWrap: "wrap",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								fontWeight: 600
							},
							children: "Triage & Status Actions:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "6px",
								flexWrap: "wrap",
								alignItems: "center"
							},
							children: [
								selectedTicket.assignedToId !== (user?.employeeId || user?.id || user?._id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									onClick: () => handleAssignToMe(selectedTicket),
									style: {
										padding: "4px 10px",
										fontSize: "11px",
										background: "#eff6ff",
										borderColor: "#bfdbfe",
										color: "#1d4ed8"
									},
									children: "🙋 Assign to Me"
								}),
								selectedTicket.status !== "in_progress" && selectedTicket.status !== "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => updateStatus(selectedTicket.id || selectedTicket._id, "in_progress"),
									style: {
										padding: "4px 10px",
										fontSize: "11px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 12 }), " Mark In Progress"]
								}),
								selectedTicket.status !== "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "primary",
									onClick: () => {
										setResolvingTicket(selectedTicket);
										setResolutionNotes("");
									},
									style: {
										padding: "4px 10px",
										fontSize: "11px",
										background: "#10b981",
										borderColor: "#10b981"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 12 }), " Resolve Ticket"]
								}),
								selectedTicket.status === "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => updateStatus(selectedTicket.id || selectedTicket._id, "open"),
									style: {
										padding: "4px 10px",
										fontSize: "11px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 12 }), " Reopen Ticket"]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f8f7f2",
							padding: "12px 14px",
							borderRadius: "8px",
							marginBottom: "14px",
							fontSize: "11px",
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
							gap: "10px",
							border: "1px solid rgba(0,0,0,0.04)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase",
									display: "block",
									marginBottom: "2px"
								},
								children: "Requester"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "var(--ink)" },
								children: selectedTicket.employeeName || "Staff Member"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase",
									display: "block",
									marginBottom: "2px"
								},
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "var(--ink)" },
								children: selectedTicket.category || "IT Support"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase",
									display: "block",
									marginBottom: "2px"
								},
								children: "Assigned Specialist"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: selectedTicket.assignedToId || "",
								onChange: async (e) => {
									const val = e.target.value;
									const emp = (storeState.employees || []).find((em) => String(em.employeeId || em.id || em._id) === val);
									const payload = {
										assignedToId: emp ? emp.employeeId || emp.id || emp._id : "",
										assignedToName: emp ? emp.name : "General Queue",
										assignedToEmail: emp ? emp.email || "" : ""
									};
									const tId = selectedTicket.id || selectedTicket._id;
									await hrStore.assignTicket(tId, payload);
									setFeedback(`Ticket assigned to ${payload.assignedToName}.`);
									setTimeout(() => setFeedback(""), 3500);
								},
								style: {
									fontSize: "11px",
									padding: "2px 4px",
									borderRadius: "4px",
									border: "1px solid #cbd5e1",
									background: "#fff",
									color: "#0284c7",
									fontWeight: 600,
									maxWidth: "135px",
									cursor: "pointer"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "General Queue"
								}), (storeState.employees || []).map((em) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: em.employeeId || em.id || em._id,
									children: [
										em.name,
										" (",
										em.employeeId || em.department || "Staff",
										")"
									]
								}, em.employeeId || em.id || em._id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase",
									display: "block",
									marginBottom: "2px"
								},
								children: "Priority"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontWeight: 700,
									color: (selectedTicket.priority || "").toLowerCase() === "urgent" ? "#dc2626" : "#d97706"
								},
								children: selectedTicket.priority || "Medium"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase",
									display: "block",
									marginBottom: "2px"
								},
								children: "Created"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: { color: "var(--ink)" },
								children: selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : "Recent"
							})] })
						]
					}),
					selectedTicket.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#fff",
							border: "1px solid var(--line)",
							padding: "12px 14px",
							borderRadius: "8px",
							marginBottom: "14px",
							fontSize: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "10px",
								fontWeight: 700,
								textTransform: "uppercase",
								color: "var(--teal)",
								display: "block",
								marginBottom: "4px"
							},
							children: "Initial Inquiry Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: 0,
								color: "var(--ink)",
								lineHeight: 1.5,
								whiteSpace: "pre-wrap"
							},
							children: selectedTicket.description
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							flex: 1,
							overflowY: "auto",
							maxHeight: "280px",
							marginBottom: "14px",
							paddingRight: "4px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								fontSize: "12px",
								display: "block",
								marginBottom: "10px",
								color: "var(--ink)"
							},
							children: [
								"Resolution Thread (",
								Array.isArray(selectedTicket.responses) ? selectedTicket.responses.length : 0,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gap: "10px"
							},
							children: !Array.isArray(selectedTicket.responses) || selectedTicket.responses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									padding: "16px",
									background: "#fafaf9",
									border: "1px dashed var(--line)",
									borderRadius: "8px",
									textAlign: "center",
									color: "var(--muted)",
									fontSize: "11.5px"
								},
								children: "No responses posted yet. Type a reply below to communicate with the employee."
							}) : selectedTicket.responses.map((resp, i) => {
								const isSupport = resp.sender?.toLowerCase().includes("it") || resp.sender?.toLowerCase().includes("hr") || resp.sender?.toLowerCase().includes("support") || resp.sender?.toLowerCase().includes("admin");
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: isSupport ? "#f0f9f8" : "#fff",
										border: "1px solid var(--line)",
										borderLeft: isSupport ? "3px solid var(--teal)" : "3px solid #64748b",
										padding: "10px 12px",
										borderRadius: "8px",
										fontSize: "11.5px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "4px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: isSupport ? "var(--teal)" : "#334155" },
												children: resp.sender || "Staff"
											}), isSupport && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "9px",
													background: "var(--soft-teal)",
													color: "var(--teal)",
													padding: "1px 5px",
													borderRadius: "3px",
													fontWeight: 600
												},
												children: "Support Desk"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
											style: {
												color: "var(--muted)",
												fontSize: "10px"
											},
											children: resp.time ? resp.time.length > 20 ? new Date(resp.time).toLocaleString([], {
												dateStyle: "short",
												timeStyle: "short"
											}) : resp.time : "Recent"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: {
											margin: 0,
											color: "var(--ink)",
											lineHeight: 1.45,
											whiteSpace: "pre-wrap"
										},
										children: resp.text
									})]
								}, i);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							borderTop: "1px solid var(--line)",
							paddingTop: "12px",
							marginTop: "auto"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 2,
								className: "text-input",
								style: {
									width: "100%",
									padding: "8px 12px",
									fontSize: "12px",
									resize: "vertical"
								},
								placeholder: "Type official HR / IT resolution response...",
								value: replyText,
								onChange: (e) => setReplyText(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
										e.preventDefault();
										sendReply();
									}
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10.5px",
										color: "var(--muted)"
									},
									children: "Tip: Press Ctrl+Enter to send response"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										gap: "8px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: sendReply,
										disabled: !replyText.trim(),
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "5px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 13 }), " Send Response"]
									})
								})]
							})]
						})
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "leave-detail-empty",
					style: { margin: "auto" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, {
							size: 32,
							style: {
								opacity: .4,
								margin: "0 auto 10px",
								display: "block"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: {
								fontSize: "14px",
								color: "var(--ink)",
								display: "block",
								marginBottom: "4px"
							},
							children: "Select a Support Ticket"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "12px",
								color: "var(--muted)"
							},
							children: "Choose an inquiry from the queue to view full thread and submit resolution."
						})
					]
				})
			})]
		})] }),
		showCreateModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "payslip-voucher-overlay",
			onClick: () => setShowCreateModal(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "payslip-voucher",
				style: {
					maxWidth: "560px",
					width: "92%"
				},
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-header-premium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-title-group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "modal-icon-badge",
							style: {
								background: "linear-gradient(135deg, #E1F1F0 0%, #CEEAE8 100%)",
								color: "var(--teal)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "modal-title-text",
							children: "Log Support Desk Ticket"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "modal-subtitle-text",
							children: "Create and assign a ticket on behalf of staff or departmental queues"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-button",
						onClick: () => setShowCreateModal(false),
						"aria-label": "Close modal",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleCreateTicketSubmit,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-body-premium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										color: "var(--ink)"
									},
									children: "Subject / Inquiry Summary"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										fontWeight: 500
									},
									children: "Required"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								className: "text-input",
								placeholder: "e.g., VPN Access Disconnected / Salary Slip Query...",
								value: newTicket.subject,
								onChange: (e) => setNewTicket({
									...newTicket,
									subject: e.target.value
								}),
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-row-2col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										color: "var(--ink)",
										display: "block",
										marginBottom: "6px"
									},
									children: "Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select-control",
									style: {
										width: "100%",
										height: "42px",
										borderRadius: "10px"
									},
									value: newTicket.category,
									onChange: (e) => setNewTicket({
										...newTicket,
										category: e.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "IT Support",
											children: "💻 IT & Hardware"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "HR Policies",
											children: "👥 HR & People Policy"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Payroll",
											children: "💰 Payroll & Compensation"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Facilities",
											children: "🏢 Workplace & Facilities"
										})
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										color: "var(--ink)",
										display: "block",
										marginBottom: "6px"
									},
									children: "Priority Level"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select-control",
									style: {
										width: "100%",
										height: "42px",
										borderRadius: "10px"
									},
									value: newTicket.priority,
									onChange: (e) => setNewTicket({
										...newTicket,
										priority: e.target.value
									}),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Low",
											children: "🟢 Low Priority"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Medium",
											children: "🟡 Medium Priority"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "High",
											children: "🟠 High Priority"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Urgent",
											children: "🔴 Urgent Priority"
										})
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "11.5px",
									fontWeight: 600,
									color: "var(--ink)",
									display: "block",
									marginBottom: "6px"
								},
								children: "Assign Requester Employee"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								style: {
									width: "100%",
									height: "42px",
									borderRadius: "10px"
								},
								value: newTicket.employeeId,
								onChange: (e) => {
									const emp = (storeState.employees || []).find((x) => x.id === e.target.value || x.employeeId === e.target.value);
									setNewTicket({
										...newTicket,
										employeeId: e.target.value,
										employeeName: emp?.name || ""
									});
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select Employee..."
								}), (storeState.employees || []).map((emp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: emp.id,
									children: [
										emp.name,
										" (",
										emp.employeeId,
										") • ",
										emp.department
									]
								}, emp.id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										color: "var(--ink)"
									},
									children: "Detailed Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "var(--muted)"
									},
									children: newTicket.description?.length > 0 ? `${newTicket.description.length} characters` : "Troubleshooting context"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "text-input",
								rows: 4,
								placeholder: "Provide all relevant details to help the support desk troubleshoot effectively:\n• Root cause or problem details...\n• Hardware asset ID or relevant application...",
								value: newTicket.description,
								onChange: (e) => setNewTicket({
									...newTicket,
									description: e.target.value
								}),
								style: {
									width: "100%",
									minHeight: "96px",
									maxHeight: "180px",
									resize: "vertical",
									fontSize: "12.5px",
									lineHeight: "1.45"
								},
								required: true
							})] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-footer-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => !isSubmittingTicket && setShowCreateModal(false),
							disabled: isSubmittingTicket,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: isSubmittingTicket || !newTicket.subject.trim() || !newTicket.description.trim(),
							style: {
								opacity: isSubmittingTicket ? .75 : 1,
								pointerEvents: isSubmittingTicket ? "none" : "auto"
							},
							children: [isSubmittingTicket ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
								size: 13,
								className: "spin"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 13 }), isSubmittingTicket ? "Submitting Ticket..." : "Submit Ticket"]
						})]
					})]
				})]
			})
		}),
		resolvingTicket && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "payslip-voucher-overlay",
			onClick: () => !isResolving && setResolvingTicket(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "payslip-voucher",
				style: {
					maxWidth: "520px",
					width: "92%"
				},
				onClick: (e) => e.stopPropagation(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "modal-header-premium",
					style: {
						background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
						borderBottom: "1px solid #bbf7d0"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-title-group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "section-kicker",
							style: { color: "#16a34a" },
							children: "Help Desk Resolution"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "modal-title-text",
							style: {
								fontSize: "16px",
								color: "#14532d",
								display: "flex",
								alignItems: "center",
								gap: "6px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									size: 18,
									style: { color: "#16a34a" }
								}),
								"Resolve Ticket #",
								resolvingTicket.id || resolvingTicket._id
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-button",
						onClick: () => !isResolving && setResolvingTicket(null),
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleResolveSubmit,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-body-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#f8fafc",
								border: "1px solid #e2e8f0",
								borderRadius: "8px",
								padding: "10px 12px",
								marginBottom: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: {
									fontSize: "13px",
									color: "var(--ink)",
									display: "block",
									marginBottom: "3px"
								},
								children: resolvingTicket.subject
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: [
									"Requester: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: resolvingTicket.employeeName || "Staff" }),
									" • Category: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: resolvingTicket.category || "Support" })
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "12px",
										fontWeight: 600,
										color: "var(--ink)"
									},
									children: "Resolution Notes / Solution Steps"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10.5px",
										color: "#16a34a",
										fontWeight: 600
									},
									children: "Sent via Email to Employee"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "text-input",
								rows: 4,
								placeholder: "Describe how the problem was resolved (e.g. Configured WiFi profile, replaced faulty adapter, reset credentials)...",
								value: resolutionNotes,
								onChange: (e) => setResolutionNotes(e.target.value),
								style: {
									width: "100%",
									minHeight: "100px",
									resize: "vertical",
									fontSize: "12.5px",
									lineHeight: "1.45"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)",
									marginTop: "4px",
									display: "block"
								},
								children: [
									"💡 Marking this resolved updates the ticket status and sends an automated completion email to ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: resolvingTicket.employeeName || "the requester" }),
									" with these notes."
								]
							})
						] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-footer-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => setResolvingTicket(null),
							disabled: isResolving,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: isResolving,
							style: {
								background: "#16a34a",
								borderColor: "#16a34a",
								color: "#fff"
							},
							children: [isResolving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
								size: 13,
								className: "spin"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }), isResolving ? "Resolving..." : "Confirm Resolution"]
						})]
					})]
				})]
			})
		})
	] });
}
function AnnouncementsModule() {
	const { user } = useAuth();
	const isManagerOrAdmin = ["admin", "hr"].includes(user?.role);
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [showCreateModal, setShowCreateModal] = (0, import_react.useState)(false);
	const [editingAnnouncement, setEditingAnnouncement] = (0, import_react.useState)(null);
	const [announcementToDelete, setAnnouncementToDelete] = (0, import_react.useState)(null);
	const [feedback, setFeedback] = (0, import_react.useState)("");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [categoryFilter, setCategoryFilter] = (0, import_react.useState)("all");
	const [audienceFilter, setAudienceFilter] = (0, import_react.useState)("all");
	const [annForm, setAnnForm] = (0, import_react.useState)({
		title: "",
		category: "News",
		targetAudience: "All Employees",
		content: "",
		priority: "Normal",
		pinned: false,
		sendEmailBroadcast: true
	});
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const departments = storeState.departments?.length ? storeState.departments : hrStore.getDepartments ? hrStore.getDepartments() : [];
	const showNotice = (msg) => {
		setFeedback(msg);
		setTimeout(() => setFeedback(""), 4e3);
	};
	const handleCreate = workspaceHandler(async (e) => {
		e.preventDefault();
		if (!annForm.title.trim() || !annForm.content.trim()) return;
		const willEmail = Boolean(annForm.sendEmailBroadcast);
		await hrStore.createAnnouncement({
			...annForm,
			title: annForm.title.trim(),
			content: annForm.content.trim(),
			author: user?.displayName || user?.name || "HR Operations",
			sendEmailBroadcast: willEmail
		});
		setShowCreateModal(false);
		setAnnForm({
			title: "",
			category: "News",
			targetAudience: "All Employees",
			content: "",
			priority: "Normal",
			pinned: false,
			sendEmailBroadcast: true
		});
		showNotice(willEmail ? "✓ Announcement published & broadcast email sent from Admin (admin@edufyitech.in)!" : "✓ Announcement published to enterprise feed.");
	});
	const handleUpdate = workspaceHandler(async (e) => {
		e.preventDefault();
		if (!editingAnnouncement?.id || !editingAnnouncement.title?.trim() || !editingAnnouncement.content?.trim()) return;
		await hrStore.updateAnnouncement(editingAnnouncement.id, {
			title: editingAnnouncement.title.trim(),
			content: editingAnnouncement.content.trim(),
			category: editingAnnouncement.category,
			priority: editingAnnouncement.priority || "Normal",
			targetAudience: editingAnnouncement.targetAudience || "All Employees",
			pinned: Boolean(editingAnnouncement.pinned)
		});
		setEditingAnnouncement(null);
		showNotice("Announcement updated successfully.");
	});
	const handleDelete = workspaceHandler(async () => {
		if (!announcementToDelete?.id) return;
		await hrStore.deleteAnnouncement(announcementToDelete.id);
		setAnnouncementToDelete(null);
		showNotice("Announcement permanently removed.");
	});
	const handleTogglePin = workspaceHandler(async (id, currentPinned) => {
		await hrStore.togglePinAnnouncement(id, !currentPinned);
		showNotice(currentPinned ? "Announcement unpinned." : "Announcement pinned to top of feed.");
	});
	const handleLike = workspaceHandler(async (id) => {
		await hrStore.likeAnnouncement(id);
	});
	const handleRecreate = (ann) => {
		setAnnForm({
			title: ann.title?.startsWith("[Re]") ? ann.title : `[Re] ${ann.title}`,
			category: ann.category || "News",
			targetAudience: ann.targetAudience || "All Employees",
			content: ann.content || "",
			priority: ann.priority || "Normal",
			pinned: Boolean(ann.pinned)
		});
		setShowCreateModal(true);
		showNotice(`Loaded "${ann.title}" into creator. Adjust details and broadcast.`);
	};
	const rawAnnouncements = storeState.announcements || [];
	const totalCount = rawAnnouncements.length;
	const pinnedCount = rawAnnouncements.filter((a) => a.pinned).length;
	const newsCount = rawAnnouncements.filter((a) => a.category === "News" || a.category === "Company News").length;
	const urgentCount = rawAnnouncements.filter((a) => a.priority === "High" || a.priority === "Urgent").length;
	const filteredAnnouncements = [...rawAnnouncements].sort((a, b) => {
		if (a.pinned && !b.pinned) return -1;
		if (!a.pinned && b.pinned) return 1;
		return (b.date || "").localeCompare(a.date || "");
	}).filter((ann) => {
		if (categoryFilter !== "all" && ann.category !== categoryFilter) return false;
		if (audienceFilter !== "all" && ann.targetAudience !== audienceFilter && ann.targetAudience !== "All Employees") return false;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			return ann.title?.toLowerCase().includes(q) || ann.content?.toLowerCase().includes(q) || ann.author?.toLowerCase().includes(q);
		}
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "20px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Internal Communications",
				title: "Company Announcements & Broadcasts",
				description: "Share official news, policy updates, cultural events, townhalls, and holiday notices across the enterprise.",
				children: isManagerOrAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setShowCreateModal(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), " Create Announcement"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
					gap: "14px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: {
							padding: "16px 20px",
							borderLeft: "4px solid #0284c7"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								textTransform: "uppercase",
								fontWeight: 600
							},
							children: "Total Broadcasts"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "24px",
								fontWeight: 700,
								color: "#0f172a",
								marginTop: "4px"
							},
							children: totalCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: {
							padding: "16px 20px",
							borderLeft: "4px solid #f59e0b"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								textTransform: "uppercase",
								fontWeight: 600
							},
							children: "Pinned by Leadership"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "24px",
								fontWeight: 700,
								color: "#d97706",
								marginTop: "4px"
							},
							children: pinnedCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: {
							padding: "16px 20px",
							borderLeft: "4px solid #10b981"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								textTransform: "uppercase",
								fontWeight: 600
							},
							children: "Company News"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "24px",
								fontWeight: 700,
								color: "#059669",
								marginTop: "4px"
							},
							children: newsCount
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: {
							padding: "16px 20px",
							borderLeft: "4px solid #ef4444"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								textTransform: "uppercase",
								fontWeight: 600
							},
							children: "Urgent Notices"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "24px",
								fontWeight: 700,
								color: "#dc2626",
								marginTop: "4px"
							},
							children: urgentCount
						})]
					})
				]
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "10px",
						flexWrap: "wrap",
						alignItems: "center"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: categoryFilter,
							onChange: (e) => setCategoryFilter(e.target.value),
							style: {
								padding: "6px 12px",
								fontSize: "11px",
								border: "1px solid var(--border)",
								borderRadius: "6px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Categories"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "News",
									children: "Company News"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Policy",
									children: "Policy & Compliance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Event",
									children: "Event & Townhall"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Holiday",
									children: "Holiday Notice"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "General",
									children: "General Office Notice"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Celebration",
									children: "Celebration & Milestones"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: audienceFilter,
							onChange: (e) => setAudienceFilter(e.target.value),
							style: {
								padding: "6px 12px",
								fontSize: "11px",
								border: "1px solid var(--border)",
								borderRadius: "6px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "All Audiences"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "All Employees",
									children: "All Employees"
								}),
								departments.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: dept.name,
									children: dept.name
								}, dept.id || dept.deptId || dept.name)),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Managers",
									children: "People Managers"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: "11px",
								color: "var(--muted)"
							},
							children: [
								"Showing ",
								filteredAnnouncements.length,
								" of ",
								rawAnnouncements.length,
								" broadcasts"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						position: "relative",
						width: "min(100%, 280px)"
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
						placeholder: "Search announcements...",
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
					gap: "16px"
				},
				children: filteredAnnouncements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						textAlign: "center",
						padding: "48px 20px",
						background: "#ffffff",
						border: "1px dashed var(--line)",
						borderRadius: "12px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, {
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
							children: "No announcements found"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: 0,
								fontSize: "12px",
								color: "#64748b"
							},
							children: searchQuery ? "Try clearing your search query or filters." : "No company announcements have been broadcasted yet."
						})
					]
				}) : filteredAnnouncements.map((ann) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						padding: "22px",
						position: "relative",
						border: ann.pinned ? "1px solid var(--teal)" : "1px solid var(--line)",
						boxShadow: ann.pinned ? "0 3px 12px rgba(2, 132, 199, 0.08)" : "none"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "10px",
								flexWrap: "wrap",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									flexWrap: "wrap"
								},
								children: [
									ann.pinned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											background: "#0284c7",
											color: "#ffffff",
											fontSize: "10px",
											fontWeight: 700,
											padding: "2px 8px",
											borderRadius: "12px",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: "📌 Pinned by Leadership"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: ann.category === "Holiday" ? "warning" : ann.category === "Policy" ? "danger" : "info",
										children: ann.category
									}),
									ann.priority === "High" || ann.priority === "Urgent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											background: "#fee2e2",
											color: "#dc2626",
											fontSize: "10px",
											fontWeight: 700,
											padding: "2px 8px",
											borderRadius: "12px"
										},
										children: ["🔥 ", ann.priority]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "11px",
											color: "var(--muted)"
										},
										children: [
											"Target: ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ann.targetAudience }),
											" • ",
											ann.date || "Recent"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleLike(ann.id),
									style: {
										border: "1px solid var(--line)",
										background: "#fff",
										borderRadius: "999px",
										padding: "4px 12px",
										display: "flex",
										alignItems: "center",
										gap: "5px",
										fontSize: "11px",
										cursor: "pointer",
										transition: "all 0.15s ease"
									},
									title: "Like this announcement",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
										size: 13,
										style: {
											color: ann.likes > 0 || ann.liked ? "#ef4444" : "var(--muted)",
											fill: ann.likes > 0 || ann.liked ? "#ef4444" : "transparent"
										}
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ann.likes || 0 })]
								}), isManagerOrAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => handleRecreate(ann),
										style: {
											border: "1px solid var(--line)",
											background: "#fff",
											color: "#0284c7",
											borderRadius: "6px",
											padding: "4px 8px",
											fontSize: "11px",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										title: "Re-create / Duplicate this announcement",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Re-create" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => handleTogglePin(ann.id, Boolean(ann.pinned)),
										style: {
											border: "1px solid var(--line)",
											background: ann.pinned ? "#e0f2fe" : "#fff",
											color: ann.pinned ? "#0284c7" : "#64748b",
											borderRadius: "6px",
											padding: "4px 8px",
											fontSize: "11px",
											cursor: "pointer"
										},
										title: ann.pinned ? "Unpin announcement" : "Pin to top of feed",
										children: ann.pinned ? "Unpin" : "📌 Pin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setEditingAnnouncement({ ...ann }),
										style: {
											border: "1px solid var(--line)",
											background: "#fff",
											color: "#475569",
											borderRadius: "6px",
											padding: "4px 8px",
											fontSize: "11px",
											cursor: "pointer"
										},
										title: "Edit announcement",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { size: 13 })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setAnnouncementToDelete(ann),
										style: {
											border: "1px solid var(--line)",
											background: "#fff",
											color: "#ef4444",
											borderRadius: "6px",
											padding: "4px 8px",
											fontSize: "11px",
											cursor: "pointer"
										},
										title: "Delete announcement",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 })
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 8px",
								fontSize: "17px",
								color: "#0f172a"
							},
							children: ann.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: "0 0 14px",
								fontSize: "13px",
								color: "#334155",
								lineHeight: 1.6,
								whiteSpace: "pre-line"
							},
							children: ann.content
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "11px",
								color: "var(--muted)",
								borderTop: "1px solid var(--line)",
								paddingTop: "10px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Broadcasted by: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { color: "#0f172a" },
								children: ann.author || "HR Management"
							})] }), ann.updatedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: { fontSize: "10px" },
								children: ["Edited on ", new Date(ann.updatedAt).toLocaleDateString()]
							})]
						})
					]
				}, ann.id))
			}),
			showCreateModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hr-modal-backdrop",
				onClick: () => setShowCreateModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal",
					style: { width: "min(100%, 640px)" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Post Company Announcement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "icon-button",
							onClick: () => setShowCreateModal(false),
							children: "✕"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreate,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hr-modal-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Announcement Title",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										placeholder: "e.g. Q4 All-Hands Meeting & Awards Ceremony",
										value: annForm.title,
										onChange: (e) => setAnnForm({
											...annForm,
											title: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Category",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: annForm.category,
											onChange: (e) => setAnnForm({
												...annForm,
												category: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "News",
													children: "Company News"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Policy",
													children: "Policy & Compliance"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Event",
													children: "Event & Townhall"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Holiday",
													children: "Holiday Notice"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "General",
													children: "General Office Notice"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Celebration",
													children: "Celebration & Milestones"
												})
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Target Audience",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: annForm.targetAudience,
											onChange: (e) => setAnnForm({
												...annForm,
												targetAudience: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "All Employees",
													children: "All Employees (Company-Wide)"
												}),
												departments.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: dept.name,
													children: [dept.name, " Department"]
												}, dept.id || dept.deptId || dept.name)),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Managers",
													children: "People Managers & Team Leads"
												})
											]
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
										label: "Priority Level",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: annForm.priority,
											onChange: (e) => setAnnForm({
												...annForm,
												priority: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Normal",
													children: "Normal Priority"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "High",
													children: "High Priority"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Urgent",
													children: "Urgent / Action Required"
												})
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Leadership Pin",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "8px",
												height: "38px",
												cursor: "pointer",
												fontSize: "12px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: annForm.pinned,
												onChange: (e) => setAnnForm({
													...annForm,
													pinned: e.target.checked
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pin to top of feed" })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										background: "#f0fdf4",
										border: "1px solid #bbf7d0",
										borderRadius: "8px",
										padding: "12px 14px",
										marginBottom: "8px"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											display: "flex",
											alignItems: "flex-start",
											gap: "10px",
											cursor: "pointer"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											style: {
												marginTop: "3px",
												cursor: "pointer",
												accentColor: "#059669"
											},
											checked: annForm.sendEmailBroadcast ?? true,
											onChange: (e) => setAnnForm({
												...annForm,
												sendEmailBroadcast: e.target.checked
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
											style: {
												fontSize: "13px",
												color: "#166534",
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
												size: 15,
												color: "#16a34a"
											}), " Send Notification Email from Admin (admin@edufyitech.in)"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											style: {
												margin: "3px 0 0",
												fontSize: "11.5px",
												color: "#14532d",
												lineHeight: 1.4
											},
											children: [
												"Delivers an official email broadcast with full announcement text and direct portal link to all employees in ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: annForm.targetAudience }),
												"."
											]
										})] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Announcement Content",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 5,
										required: true,
										placeholder: "Write detailed announcement message for employees...",
										value: annForm.content,
										onChange: (e) => setAnnForm({
											...annForm,
											content: e.target.value
										})
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hr-modal-footer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setShowCreateModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Broadcast Announcement"
							})]
						})]
					})]
				})
			}),
			editingAnnouncement && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hr-modal-backdrop",
				onClick: () => setEditingAnnouncement(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hr-modal",
					style: { width: "min(100%, 640px)" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hr-modal-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Edit Company Announcement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "icon-button",
							onClick: () => setEditingAnnouncement(null),
							children: "✕"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleUpdate,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hr-modal-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Announcement Title",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										required: true,
										value: editingAnnouncement.title,
										onChange: (e) => setEditingAnnouncement({
											...editingAnnouncement,
											title: e.target.value
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Category",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: editingAnnouncement.category,
											onChange: (e) => setEditingAnnouncement({
												...editingAnnouncement,
												category: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "News",
													children: "Company News"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Policy",
													children: "Policy & Compliance"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Event",
													children: "Event & Townhall"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Holiday",
													children: "Holiday Notice"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "General",
													children: "General Office Notice"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Celebration",
													children: "Celebration & Milestones"
												})
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Target Audience",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: editingAnnouncement.targetAudience,
											onChange: (e) => setEditingAnnouncement({
												...editingAnnouncement,
												targetAudience: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "All Employees",
													children: "All Employees (Company-Wide)"
												}),
												departments.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
													value: dept.name,
													children: [dept.name, " Department"]
												}, dept.id || dept.deptId || dept.name)),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Managers",
													children: "People Managers & Team Leads"
												})
											]
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
										label: "Priority Level",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: editingAnnouncement.priority || "Normal",
											onChange: (e) => setEditingAnnouncement({
												...editingAnnouncement,
												priority: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Normal",
													children: "Normal Priority"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "High",
													children: "High Priority"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Urgent",
													children: "Urgent / Action Required"
												})
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Leadership Pin",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "8px",
												height: "38px",
												cursor: "pointer",
												fontSize: "12px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: Boolean(editingAnnouncement.pinned),
												onChange: (e) => setEditingAnnouncement({
													...editingAnnouncement,
													pinned: e.target.checked
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pin to top of feed" })]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Announcement Content",
									required: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 5,
										required: true,
										value: editingAnnouncement.content,
										onChange: (e) => setEditingAnnouncement({
											...editingAnnouncement,
											content: e.target.value
										})
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hr-modal-footer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setEditingAnnouncement(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Save Changes"
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationDialog, {
				open: Boolean(announcementToDelete),
				title: "Delete Announcement",
				message: `Are you sure you want to permanently delete "${announcementToDelete?.title}"? This cannot be undone.`,
				confirmLabel: "Delete Broadcast",
				isDestructive: true,
				onConfirm: handleDelete,
				onCancel: () => setAnnouncementToDelete(null)
			})
		]
	});
}
function HolidaysModule() {
	const { user } = useAuth();
	const canManage = Boolean(user && (user.role === "admin" || user.role === "hr" || user.role === "operations_executive"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Time Off Schedules",
		title: "Company Holiday Calendar",
		description: "Official company holiday schedule with published flyers, national observances, and festival calendar gallery."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HolidayCalendarShowcase, {
		canManage,
		user
	})] });
}
function DocumentsModule() {
	const { user } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyDocumentsView, { user });
}
function SettingsModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [newSsid, setNewSsid] = (0, import_react.useState)("");
	const [savedNotice, setSavedNotice] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const addSsid = storeAction(async (e) => {
		e.preventDefault();
		if (!newSsid.trim()) return;
		await hrStore.addWifiSSID(newSsid.trim());
		setNewSsid("");
		setSavedNotice(true);
		setTimeout(() => setSavedNotice(false), 3e3);
	});
	const removeSsid = storeAction(async (ssid) => {
		await hrStore.removeWifiSSID(ssid);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "System Configuration",
			title: "HR Policy & Attendance Wi-Fi Setup",
			description: "Configure verified office Wi-Fi networks for seamless attendance authentication, shift rules, and leave quotas."
		}),
		savedNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				background: "var(--soft-teal)",
				color: "var(--teal)",
				padding: "10px 14px",
				borderRadius: "8px",
				fontSize: "11px",
				display: "flex",
				alignItems: "center",
				gap: "8px",
				marginBottom: "16px"
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), " Office Wi-Fi settings updated! Employees on this network will auto-verify presence."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			style: { marginBottom: "18px" },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Geofence & Network"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Office Wi-Fi SSID Verification Setup" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "info",
						children: "Active Guard"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "foundation-copy",
					style: { margin: "8px 0 16px" },
					children: "When employees connect to any of these configured Wi-Fi networks and click \"Check-In\", their physical office attendance is verified automatically without manual approvals."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: addSsid,
					style: {
						display: "flex",
						gap: "8px",
						marginBottom: "16px",
						maxWidth: "480px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						placeholder: "Add new office SSID (e.g. Edufyi-Bangalore-5G)",
						value: newSsid,
						onChange: (e) => setNewSsid(e.target.value),
						style: {
							flex: 1,
							border: "1px solid var(--line)",
							borderRadius: "8px",
							padding: "8px 12px",
							fontSize: "11px"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " Add Wi-Fi SSID"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: "10px"
					},
					children: storeState.companySettings.allowedWifiSSIDs.map((ssid) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							padding: "10px 14px",
							background: "#f8f7f2",
							border: "1px solid var(--line)",
							borderRadius: "8px",
							fontSize: "11px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
								size: 14,
								style: { color: "var(--teal)" }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ssid })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => removeSsid(ssid),
							style: {
								border: 0,
								background: "transparent",
								color: "var(--coral)",
								cursor: "pointer"
							},
							title: "Remove network",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 })
						})]
					}, ssid))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "panel",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-kicker",
					children: "Policy Quotas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Workforce Operating Parameters" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
					tone: "neutral",
					children: "Enforced"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "16px",
					marginTop: "16px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f8f7f2",
							padding: "14px",
							borderRadius: "8px",
							fontSize: "11px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase"
								},
								children: "Attendance Policy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								style: { margin: "4px 0" },
								children: "Policy Update Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								style: { color: "var(--teal)" },
								children: "Shift & punch rules pending replacement policy configuration"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f8f7f2",
							padding: "14px",
							borderRadius: "8px",
							fontSize: "11px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase"
								},
								children: "Annual Leave Quota"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								style: { margin: "4px 0" },
								children: "27 Days Total"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								style: { color: "var(--teal)" },
								children: "12 Casual • 10 Sick • 15 Earned"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f8f7f2",
							padding: "14px",
							borderRadius: "8px",
							fontSize: "11px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase"
								},
								children: "Audit Logs Retention"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								style: { margin: "4px 0" },
								children: "365 Days Rolling"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								style: { color: "var(--teal)" },
								children: "SOC-2 & ISO 27001 Compliant"
							})
						]
					})
				]
			})]
		})
	] });
}
function WorkspaceModulePage({ route }) {
	const p = route.path;
	if (p === "/hr/users" || p === "/admin/users" || p.includes("users")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersModule, {});
	if (p === "/hr/attendance" || p.includes("attendance")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttendanceModule, {});
	if (p === "/hr/payroll" || p.includes("payroll") || p.includes("salary")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayrollModule, {});
	if (p === "/hr/recruitment" || p.includes("recruitment")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecruitmentModule, {});
	if (p === "/hr/performance" || p.includes("performance")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceWorkspace, {});
	if (p.includes("reports") || p.includes("expenses")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceReports, {});
	if (p.includes("notifications")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceNotifications, {});
	if (p === "/hr/tasks" || p.includes("tasks")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TasksModule, {});
	if (p === "/hr/learning" || p.includes("learning") || p.includes("training")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LearningModule, {});
	if (p === "/hr/helpdesk" || p.includes("helpdesk")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpDeskModule, {});
	if (p === "/hr/announcements" || p.includes("announcements")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnouncementsModule, {});
	if (p === "/hr/holidays" || p.includes("holidays")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HolidaysModule, {});
	if (p === "/hr/documents" || p.includes("documents")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentsModule, {});
	if (p.includes("policies")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyPoliciesView, {});
	if (p === "/hr/settings" || p.includes("settings")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsModule, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "HR Workspace",
		title: route.label,
		description: route.description
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: `${route.label} is fully active`,
			message: "This module is integrated with the central HR store."
		})
	})] });
}
export { WorkspaceModulePage };
