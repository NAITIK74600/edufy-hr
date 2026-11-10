import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { A as ShieldCheck, Bt as Clock, Dt as FileText, E as Sparkles, Ft as Download, Gt as CircleAlert, H as Receipt, I as Send, J as Phone, K as Plus, Kt as ChevronUp, L as Search, Mt as Eye, Q as Paperclip, U as Radio, Ut as CircleQuestionMark, V as RefreshCw, Vt as Clock3, Wt as CircleCheck, Xt as Check, Yt as ChevronDown, Z as Pause, _ as TriangleAlert, _n as require_react, a as Wifi, at as MapPin, b as Ticket, bt as Heart, d as Users, f as User, fn as Award, g as Upload, h as UserCheck, i as X, j as ShieldAlert, k as Shield, kt as FileCheck, mn as ArrowRight, o as Wallet, q as Play, s as WalletCards, sn as BriefcaseBusiness, st as LogOut, tn as CalendarDays, tt as MessageSquare, ut as LocateFixed, v as TrendingUp, y as Trash, zt as Coffee } from "./icons-vendor-CNlTUIuG.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { I as apiClient, O as currentPayrollMonth, P as workspaceAction, T as hrStore, _ as resolveUserDisplayName, c as StatusBadge, g as getTimeOfDayGreeting, h as getRoleBadgeLabel, i as EmptyState, k as todayKey, o as PageHeader, t as Button, x as useAuth } from "./index-BlmAerQ0.js";
import { n as formatINR } from "./currency-oCUzM0NR.js";
import { n as HolidayCalendarShowcase, t as CalendarWidgets } from "./CalendarWidgets-COCKtmZW.js";
import { a as PerformanceWorkspace, i as CompanyPoliciesView, n as getDailyAttendanceStatus, r as getLateCountInfo, t as CompanyDocumentsView } from "./CompanyDocumentsView-C2RlL8al.js";
import { t as PayslipPreviewModal } from "./PayslipPreviewModal-B7-_XyZA.js";
import { n as findEmployeeForUser, r as unmaskBankAccount, t as doesPayrollMatchUser } from "./payrollMatcher-DYZYv1X2.js";
import { t as OnboardingDossierView } from "./OnboardingDossierView-CZnVwrzf.js";
// src/services/liveGpsTracker.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* LiveGpsTracker - Authoritative Singleton GPS & Presence Tracker
* 
* Guarantees:
* 1. Exactly ONE geolocation watchPosition across the entire portal.
* 2. Starts ONLY when employee is actively checked in; terminates immediately upon punch-out.
* 3. Handles Page Visibility API (resumes GPS refresh when app returns to foreground).
* 4. Buffers offline updates and rejects outdated coordinates (>5 minutes) upon reconnect.
* 5. Accurately reports states: IDLE, LIVE, BACKGROUND_PAUSED, STALE, OFFLINE, LOCATION_UNAVAILABLE, UNCERTAIN.
*/
var LiveGpsTracker = class {
	constructor() {
		this.isRunning = false;
		this.employeeId = null;
		this.employeeName = null;
		this.status = "IDLE";
		this.lastCoords = null;
		this.lastSyncAt = null;
		this.lastServerVerification = null;
		this.watchId = null;
		this.syncTimer = null;
		this.offlineQueue = [];
		this.listeners = /* @__PURE__ */ new Set();
		this.handlePosition = this.handlePosition.bind(this);
		this.handlePositionError = this.handlePositionError.bind(this);
		this.handleOnline = this.handleOnline.bind(this);
		this.handleOffline = this.handleOffline.bind(this);
		this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
	}
	getState() {
		return {
			isRunning: this.isRunning,
			employeeId: this.employeeId,
			employeeName: this.employeeName,
			status: this.status,
			lastCoords: this.lastCoords,
			lastSyncAt: this.lastSyncAt,
			lastServerVerification: this.lastServerVerification,
			offlineQueueLength: this.offlineQueue.length
		};
	}
	subscribe(listener) {
		this.listeners.add(listener);
		listener(this.getState());
		return () => {
			this.listeners.delete(listener);
		};
	}
	notify() {
		const state = this.getState();
		for (const listener of this.listeners) try {
			listener(state);
		} catch (err) {
			console.warn("[LiveGpsTracker] Subscriber error:", err);
		}
	}
	start({ employeeId, employeeName }) {
		if (typeof window === "undefined") return;
		if (this.isRunning && this.employeeId === employeeId) return;
		if (this.isRunning) this.stop();
		this.isRunning = true;
		this.employeeId = employeeId;
		this.employeeName = employeeName;
		if (!navigator.onLine) this.status = "OFFLINE";
		else if (!navigator.geolocation) this.status = "LOCATION_UNAVAILABLE";
		else this.status = "LIVE";
		window.addEventListener("online", this.handleOnline);
		window.addEventListener("offline", this.handleOffline);
		document.addEventListener("visibilitychange", this.handleVisibilityChange);
		if (navigator.geolocation) {
			try {
				this.watchId = navigator.geolocation.watchPosition(this.handlePosition, this.handlePositionError, {
					enableHighAccuracy: true,
					maximumAge: 1e4,
					timeout: 2e4
				});
			} catch (err) {
				console.warn("[LiveGpsTracker] watchPosition failed to start:", err);
			}
			navigator.geolocation.getCurrentPosition(this.handlePosition, this.handlePositionError, {
				enableHighAccuracy: true,
				maximumAge: 5e3,
				timeout: 1e4
			});
		}
		this.syncTimer = setInterval(() => {
			if (this.isRunning && navigator.onLine && document.visibilityState === "visible") this.syncWithServer();
		}, 25e3);
		console.log(`[LiveGpsTracker] Started tracking for employee: ${employeeId}`);
		this.notify();
	}
	stop() {
		if (!this.isRunning) return;
		console.log(`[LiveGpsTracker] Stopping tracking for employee: ${this.employeeId}`);
		if (this.watchId !== null && typeof navigator !== "undefined" && navigator.geolocation) {
			try {
				navigator.geolocation.clearWatch(this.watchId);
			} catch {}
			this.watchId = null;
		}
		if (this.syncTimer) {
			clearInterval(this.syncTimer);
			this.syncTimer = null;
		}
		if (typeof window !== "undefined") {
			window.removeEventListener("online", this.handleOnline);
			window.removeEventListener("offline", this.handleOffline);
			document.removeEventListener("visibilitychange", this.handleVisibilityChange);
		}
		this.isRunning = false;
		this.employeeId = null;
		this.employeeName = null;
		this.status = "IDLE";
		this.offlineQueue = [];
		this.notify();
	}
	handlePosition(pos) {
		if (!this.isRunning) return;
		const coords = {
			latitude: pos.coords.latitude,
			longitude: pos.coords.longitude,
			accuracy: Math.round(pos.coords.accuracy),
			timestamp: pos.timestamp || Date.now()
		};
		this.lastCoords = coords;
		if (typeof window !== "undefined") window.__edufyi_last_gps = coords;
		if (!navigator.onLine) {
			this.offlineQueue.push({
				...coords,
				capturedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			if (this.offlineQueue.length > 10) this.offlineQueue.shift();
			this.status = "OFFLINE";
			this.notify();
			return;
		}
		if (document.visibilityState === "hidden") this.status = "BACKGROUND_PAUSED";
		else if (coords.accuracy > 100) this.status = "UNCERTAIN";
		else this.status = "LIVE";
		const now = Date.now();
		if (!this.lastSyncAt || now - this.lastSyncAt >= 15e3) this.syncWithServer(coords);
		else this.notify();
	}
	handlePositionError(err) {
		if (!this.isRunning) return;
		if (err?.code === 1) this.status = "LOCATION_UNAVAILABLE";
		else if (err?.code === 2 || err?.code === 3) {
			if (!this.lastCoords) this.status = "LOCATION_UNAVAILABLE";
			else if ((Date.now() - (this.lastCoords.timestamp || 0)) / 1e3 > 300) this.status = "STALE";
		}
		this.notify();
	}
	handleOnline() {
		if (!this.isRunning) return;
		console.log("[LiveGpsTracker] Network reconnected. Verifying and synchronizing buffered updates...");
		const fiveMinutesAgo = Date.now() - 3e5;
		const validBuffered = this.offlineQueue.filter((item) => {
			return (item.capturedAt ? new Date(item.capturedAt).getTime() : 0) >= fiveMinutesAgo;
		});
		const droppedCount = this.offlineQueue.length - validBuffered.length;
		if (droppedCount > 0) console.log(`[LiveGpsTracker] Discarded ${droppedCount} outdated offline coordinates (>5m old)`);
		this.offlineQueue = [];
		this.status = "LIVE";
		this.notify();
		if (typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => {
			this.handlePosition(pos);
			this.syncWithServer(this.lastCoords, { reconnected: true });
		}, () => {
			if (validBuffered.length > 0) this.syncWithServer(validBuffered[validBuffered.length - 1], { reconnected: true });
		}, {
			enableHighAccuracy: true,
			timeout: 1e4,
			maximumAge: 0
		});
	}
	handleOffline() {
		if (!this.isRunning) return;
		console.log("[LiveGpsTracker] Network disconnected. Pausing live server sync and buffering fixes.");
		this.status = "OFFLINE";
		this.notify();
	}
	handleVisibilityChange() {
		if (!this.isRunning) return;
		if (document.visibilityState === "hidden") {
			this.status = "BACKGROUND_PAUSED";
			this.notify();
		} else if (document.visibilityState === "visible") {
			console.log("[LiveGpsTracker] Page visible. Resuming active monitoring and refreshing GPS fix...");
			this.status = "LIVE";
			this.notify();
			if (typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => {
				this.handlePosition(pos);
				this.syncWithServer(this.lastCoords, { resumedFromBackground: true });
			}, () => {
				this.syncWithServer(this.lastCoords, { resumedFromBackground: true });
			}, {
				enableHighAccuracy: true,
				timeout: 1e4,
				maximumAge: 0
			});
		}
	}
	async syncWithServer(coordsOverride = null, meta = {}) {
		if (!this.isRunning || !this.employeeId || !navigator.onLine) return;
		const coords = coordsOverride || this.lastCoords;
		const hasCoords = Boolean(coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude));
		let isStale = false;
		if (coords?.timestamp) {
			if (Date.now() - coords.timestamp > 3e5) isStale = true;
		}
		const payload = {
			...hasCoords ? {
				latitude: coords.latitude,
				longitude: coords.longitude,
				accuracy: coords.accuracy
			} : {},
			deviceCapturedAt: coords?.timestamp ? new Date(coords.timestamp).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
			locationPermission: hasCoords ? "granted" : this.status === "LOCATION_UNAVAILABLE" ? "denied" : "unknown",
			networkType: typeof navigator !== "undefined" && navigator.connection?.effectiveType ? navigator.connection.effectiveType : "unknown",
			isStale,
			...meta
		};
		try {
			const res = await apiClient.post("/attendance/presence", payload);
			const data = res.data?.data || res.data || {};
			this.lastSyncAt = Date.now();
			this.lastServerVerification = data;
			if (isStale) this.status = "STALE";
			else if (coords?.accuracy > 100) this.status = "UNCERTAIN";
			else if (document.visibilityState === "hidden") this.status = "BACKGROUND_PAUSED";
			else this.status = "LIVE";
			this.notify();
			return data;
		} catch (err) {
			console.warn("[LiveGpsTracker] Server presence sync notice:", err.message);
			return null;
		}
	}
};
var liveGpsTracker = new LiveGpsTracker();
// src/pages/EmployeeDashboardPage.jsx
var import_jsx_runtime = require_jsx_runtime();
function formatTimerSeconds(totalSecs) {
	if (!totalSecs || totalSecs < 0) totalSecs = 0;
	const h = Math.floor(totalSecs / 3600);
	const m = Math.floor(totalSecs % 3600 / 60);
	const s = totalSecs % 60;
	return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}
function format12Hour(timeStr) {
	if (!timeStr) return "";
	const [h, m] = String(timeStr).split(":").map(Number);
	if (isNaN(h) || isNaN(m)) return timeStr;
	const period = h >= 12 ? "PM" : "AM";
	return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
}
function GPSAttendanceStation({ user, todayRecord, onPunch, onStartBreak, onEndBreak, currentTime }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const settings = storeState.companySettings;
	settings?.officeNetworkIPs;
	const empKey = user?.employeeId || user?.id || "STAFF";
	const todayDate = todayRecord?.date || todayKey();
	const cachedCoordsKey = `att_cached_coords_${empKey}`;
	const [customCoords, setCustomCoords] = (0, import_react.useState)(() => {
		if (todayRecord?.latitude && todayRecord?.longitude) {
			const lat = Number(todayRecord.latitude);
			const lng = Number(todayRecord.longitude);
			if (!isNaN(lat) && !isNaN(lng)) return {
				latitude: lat,
				longitude: lng,
				accuracy: Number(todayRecord.accuracy) || 10
			};
		}
		if (typeof sessionStorage !== "undefined") try {
			const raw = sessionStorage.getItem(cachedCoordsKey);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (parsed && typeof parsed.latitude === "number" && typeof parsed.longitude === "number") return parsed;
			}
		} catch (_) {}
		return null;
	});
	const updateCustomCoords = (coords) => {
		setCustomCoords(coords);
		if (coords && typeof coords.latitude === "number" && typeof sessionStorage !== "undefined") try {
			sessionStorage.setItem(cachedCoordsKey, JSON.stringify(coords));
		} catch (_) {}
	};
	const [gpsLive, setGpsLive] = (0, import_react.useState)(() => Boolean(customCoords?.latitude));
	const [detectingGps, setDetectingGps] = (0, import_react.useState)(false);
	const [isPunching, setIsPunching] = (0, import_react.useState)(false);
	const [isBreaking, setIsBreaking] = (0, import_react.useState)(false);
	const [gpsError, setGpsError] = (0, import_react.useState)("");
	const [permissionStatus, setPermissionStatus] = (0, import_react.useState)("prompt");
	const [publicIp, setPublicIp] = (0, import_react.useState)(null);
	const [ipLoading, setIpLoading] = (0, import_react.useState)(true);
	const [serverVerification, setServerVerification] = (0, import_react.useState)(null);
	const [disconnectedMinutes, setDisconnectedMinutes] = (0, import_react.useState)(0);
	const [isAutoPunchedOut, setIsAutoPunchedOut] = (0, import_react.useState)(false);
	const [diagnosticsOpen, setDiagnosticsOpen] = (0, import_react.useState)(false);
	const [trackingStatus, setTrackingStatus] = (0, import_react.useState)(() => liveGpsTracker.getState().status);
	const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
	const isCompleted = !!todayRecord?.checkIn && !!todayRecord?.checkOut;
	const isOnBreak = Boolean(todayRecord?.isOnBreak);
	const currentBreak = todayRecord?.currentBreak;
	const hasAutoPunchedOut = Boolean(isAutoPunchedOut || todayRecord?.autoPunchOut || todayRecord?.punchOutType === "auto" || todayRecord?.totalHours?.includes("Auto Punch Out") || todayRecord?.notes?.includes("Auto Punch Out"));
	(0, import_react.useEffect)(() => {
		if (typeof navigator !== "undefined" && navigator.permissions?.query) navigator.permissions.query({ name: "geolocation" }).then((status) => {
			setPermissionStatus(status.state);
			status.onchange = () => setPermissionStatus(status.state);
		}).catch(() => {});
		else if (typeof navigator !== "undefined" && !navigator.geolocation) setPermissionStatus("unsupported");
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		setIpLoading(true);
		if (typeof window !== "undefined" && window.__edufyi_last_gps) {
			updateCustomCoords(window.__edufyi_last_gps);
			setGpsLive(true);
			setPermissionStatus("granted");
		}
		if (typeof navigator !== "undefined" && navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => {
			if (!active) return;
			const coords = {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				accuracy: Math.ceil(pos.coords.accuracy)
			};
			updateCustomCoords(coords);
			setGpsLive(true);
			setPermissionStatus("granted");
		}, () => {}, {
			enableHighAccuracy: true,
			timeout: 1e4,
			maximumAge: 15e3
		});
		return () => {
			active = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (isCheckedIn && !isCompleted) liveGpsTracker.start({
			employeeId: user?.employeeId || user?.id,
			employeeName: user?.displayName || "Employee"
		});
		else liveGpsTracker.stop();
		const unsubscribe = liveGpsTracker.subscribe((state) => {
			setTrackingStatus(state.status);
			if (state.lastCoords) {
				updateCustomCoords(state.lastCoords);
				setGpsLive(state.status === "LIVE" || state.status === "UNCERTAIN");
				setPermissionStatus("granted");
			} else if (state.status === "LOCATION_UNAVAILABLE") setPermissionStatus("denied");
			if (state.lastServerVerification) {
				setServerVerification(state.lastServerVerification);
				if (state.lastServerVerification.clientIp) setPublicIp(state.lastServerVerification.clientIp);
			}
		});
		return () => {
			unsubscribe();
		};
	}, [
		isCheckedIn,
		isCompleted,
		user?.employeeId,
		user?.id,
		user?.displayName
	]);
	const assignedCampus = user?.campus || user?.location || "IGNITE CAMPUS";
	const primaryWifiSSID = (settings?.allowedWifiSSIDs || []).find((w) => !/airtel|dji|3052/i.test(w) && /edufyi/i.test(w)) || "Edufyi";
	const matchedNetwork = (settings?.wifiNetworks || []).find((n) => n.ssid?.toLowerCase() === primaryWifiSSID.toLowerCase() && !/san francisco|austin|london/i.test(n.branchName || ""));
	const targetBranch = assignedCampus || matchedNetwork?.branchName || "IGNITE CAMPUS";
	async function handleRefreshNetwork(coordsOverride) {
		setIpLoading(true);
		try {
			const coords = coordsOverride || customCoords;
			const result = await apiClient.post("/attendance/verify", { ...coords });
			setPublicIp(result.data.clientIp);
			setServerVerification(result.data);
			setGpsError("");
			return result.data;
		} catch (error) {
			setServerVerification(null);
			setGpsError(error.message);
			return null;
		} finally {
			setIpLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		let active = true;
		setIpLoading(true);
		apiClient.post("/attendance/verify", { ...customCoords }).then((result) => {
			if (active) {
				setServerVerification(result.data);
				setPublicIp(result.data.clientIp);
			}
		}).catch((error) => {
			if (active) {
				setServerVerification(null);
				setGpsError(error.message);
			}
		}).finally(() => {
			if (active) setIpLoading(false);
		});
		return () => {
			active = false;
		};
	}, [customCoords, settings]);
	const matchedOfficeNet = { label: serverVerification?.matchedNetworkLabel };
	const isRealOfficeIp = Boolean(serverVerification?.isIpVerified);
	const isRealOfficeWifi = Boolean(serverVerification?.isWifiVerified);
	const isOnOfficeNetwork = isRealOfficeIp || isRealOfficeWifi;
	const rawNetLabel = matchedOfficeNet?.label || "";
	const cleanNetLabel = /airtel|dji/i.test(rawNetLabel) ? null : rawNetLabel;
	const networkLabel = isOnOfficeNetwork ? cleanNetLabel || `${primaryWifiSSID} (${targetBranch})` : publicIp ? "External Network" : ipLoading ? "Detecting…" : "Unknown Network";
	const verification = serverVerification ?? {};
	const isGpsInside = Boolean(verification.isGpsVerified);
	const hasGps = Boolean(verification.hasGps);
	const distance = verification.distanceMeters;
	const distanceLabel = distance != null ? `${distance}m` : "—";
	const isWifiVerified = isOnOfficeNetwork;
	settings?.locations?.[0];
	const rawNearest = verification.nearestLocation;
	const nearestOfficeName = /san francisco|austin|london/i.test(rawNearest || "") || !rawNearest ? assignedCampus : rawNearest;
	const maxGeofenceRadius = Number(settings?.attendanceRules?.maxGeofenceRadiusMeters) || Number(verification?.maxAllowedRadius) || 50;
	const isCheckInVerified = Boolean(todayRecord?.gpsVerified || todayRecord?.wifiVerified);
	const isDistanceInside = distance != null && distance <= maxGeofenceRadius;
	Boolean(isOnOfficeNetwork || verification.isGpsVerified || verification.isWifiVerified || verification.isIpVerified || isDistanceInside || isCheckInVerified && !hasGps);
	const isOutsideCampus = Boolean(isCheckedIn && !isCompleted && !isOnOfficeNetwork && hasGps && distance != null && distance > maxGeofenceRadius);
	const offCampusAccumKey = `att_offcampus_accum_${empKey}_${todayDate}`;
	const offCampusStartKey = `att_offcampus_start_${empKey}_${todayDate}`;
	(0, import_react.useEffect)(() => {
		if (typeof localStorage !== "undefined") try {
			localStorage.removeItem(offCampusStartKey);
			localStorage.removeItem(offCampusAccumKey);
		} catch {}
	}, [offCampusStartKey, offCampusAccumKey]);
	const FULL_DAY_SECS = 28800;
	const HALF_DAY_SECS = 14400;
	const checkInEpoch = (0, import_react.useMemo)(() => {
		if (todayRecord?.checkInAt) {
			const parsed = new Date(todayRecord.checkInAt).getTime();
			if (!isNaN(parsed) && parsed > 0) return parsed;
		}
		if (!todayRecord?.checkIn) return null;
		try {
			const match = String(todayRecord.checkIn).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
			if (match) {
				let h = parseInt(match[1], 10);
				const m = parseInt(match[2], 10);
				const meridiem = match[3]?.toUpperCase();
				if (meridiem === "PM" && h < 12) h += 12;
				if (meridiem === "AM" && h === 12) h = 0;
				const d = /* @__PURE__ */ new Date();
				d.setHours(h, m, 0, 0);
				return d.getTime();
			}
		} catch {}
		return null;
	}, [todayRecord?.checkIn, todayRecord?.checkInAt]);
	const completedBreaksDurationSec = (0, import_react.useMemo)(() => {
		return (todayRecord?.breaks || []).reduce((sum, b) => sum + Number(b.durationMinutes || 0) * 60, 0);
	}, [todayRecord?.breaks]);
	const currentBreakStartEpoch = (0, import_react.useMemo)(() => {
		if (!isOnBreak) return null;
		if (currentBreak?.startAt) {
			const parsed = new Date(currentBreak.startAt).getTime();
			if (!isNaN(parsed)) return parsed;
		}
		return currentTime.getTime();
	}, [
		isOnBreak,
		currentBreak?.startAt,
		currentTime
	]);
	const attendanceRules = settings?.attendanceRules || {};
	const lunchBreakAutoPause = attendanceRules.lunchBreakAutoPause ?? true;
	const lunchBreakStart = attendanceRules.lunchBreakStart || "13:30";
	const lunchBreakEnd = attendanceRules.lunchBreakEnd || "14:30";
	const { isAutoLunchActive, autoLunchBreakSec } = (0, import_react.useMemo)(() => {
		if (!lunchBreakAutoPause || !checkInEpoch) return {
			isAutoLunchActive: false,
			autoLunchBreakSec: 0
		};
		const [startH, startM] = (lunchBreakStart || "13:30").split(":").map(Number);
		const [endH, endM] = (lunchBreakEnd || "14:30").split(":").map(Number);
		const nowD = currentTime || /* @__PURE__ */ new Date();
		const lStart = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate(), startH, startM, 0, 0).getTime();
		const lEnd = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate(), endH, endM, 0, 0).getTime();
		if (lEnd <= lStart) return {
			isAutoLunchActive: false,
			autoLunchBreakSec: 0
		};
		const nowEpoch = nowD.getTime();
		const isActive = isCheckedIn && !isCompleted && !isOnBreak && nowEpoch >= lStart && nowEpoch < lEnd;
		const shiftEndEpoch = isCompleted && todayRecord?.checkOutAt ? new Date(todayRecord.checkOutAt).getTime() : nowEpoch;
		const effectiveStart = Math.max(checkInEpoch, lStart);
		const effectiveEnd = Math.min(shiftEndEpoch, lEnd);
		let lunchSec = 0;
		if (effectiveEnd > effectiveStart) lunchSec = Math.floor((effectiveEnd - effectiveStart) / 1e3);
		const manualBreaks = Array.isArray(todayRecord?.breaks) ? todayRecord.breaks : [];
		let manualLunchOverlapSec = 0;
		for (const b of manualBreaks) {
			if (b.isAutoLunch) continue;
			if (b.startAt && b.endAt) {
				const bStart = new Date(b.startAt).getTime();
				const bEnd = new Date(b.endAt).getTime();
				const oStart = Math.max(bStart, lStart);
				const oEnd = Math.min(bEnd, lEnd);
				if (oEnd > oStart) manualLunchOverlapSec += Math.floor((oEnd - oStart) / 1e3);
			}
		}
		return {
			isAutoLunchActive: isActive,
			autoLunchBreakSec: Math.max(0, lunchSec - manualLunchOverlapSec)
		};
	}, [
		lunchBreakAutoPause,
		lunchBreakStart,
		lunchBreakEnd,
		checkInEpoch,
		currentTime,
		isCheckedIn,
		isCompleted,
		isOnBreak,
		todayRecord?.checkOutAt,
		todayRecord?.breaks
	]);
	const netWorkSeconds = (0, import_react.useMemo)(() => {
		if (!checkInEpoch) return 0;
		if (isCompleted && (todayRecord?.checkOut || todayRecord?.checkOutAt)) {
			let endEpoch = null;
			if (todayRecord.checkOutAt) {
				const parsed = new Date(todayRecord.checkOutAt).getTime();
				if (!isNaN(parsed) && parsed > 0) endEpoch = parsed;
			}
			if (!endEpoch && todayRecord.checkOut) try {
				const match = String(todayRecord.checkOut).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
				if (match) {
					let h = parseInt(match[1], 10);
					const m = parseInt(match[2], 10);
					const meridiem = match[3]?.toUpperCase();
					if (meridiem === "PM" && h < 12) h += 12;
					if (meridiem === "AM" && h === 12) h = 0;
					const d = new Date(checkInEpoch);
					d.setHours(h, m, 0, 0);
					endEpoch = d.getTime();
				}
			} catch {}
			if (endEpoch) return Math.max(0, Math.floor((endEpoch - checkInEpoch) / 1e3) - completedBreaksDurationSec - autoLunchBreakSec);
		}
		if (isOnBreak && currentBreakStartEpoch) return Math.max(0, Math.floor((currentBreakStartEpoch - checkInEpoch) / 1e3) - completedBreaksDurationSec - autoLunchBreakSec);
		return Math.max(0, Math.floor((currentTime.getTime() - checkInEpoch) / 1e3) - completedBreaksDurationSec - autoLunchBreakSec);
	}, [
		checkInEpoch,
		isCompleted,
		todayRecord?.checkOut,
		todayRecord?.checkOutAt,
		isOnBreak,
		currentBreakStartEpoch,
		currentTime,
		completedBreaksDurationSec,
		autoLunchBreakSec
	]);
	const isFullDayQualified = netWorkSeconds >= FULL_DAY_SECS;
	const isHalfDayQualified = netWorkSeconds >= HALF_DAY_SECS && netWorkSeconds < FULL_DAY_SECS;
	const isApprovedHalfDayLeave = Boolean(todayRecord?.approvedLeave?.isHalfDay || todayRecord?.halfDayPeriod || todayRecord?.isHalfDay);
	const isHalfDayTargetMet = netWorkSeconds >= 12600;
	const currentBreakSeconds = (0, import_react.useMemo)(() => {
		if (!isOnBreak || !currentBreakStartEpoch) return 0;
		return Math.max(0, Math.floor((currentTime.getTime() - currentBreakStartEpoch) / 1e3));
	}, [
		isOnBreak,
		currentBreakStartEpoch,
		currentTime
	]);
	function getFreshCoordinates() {
		return new Promise((resolve, reject) => {
			if (typeof navigator === "undefined" || !navigator.geolocation) return reject(/* @__PURE__ */ new Error("Geolocation is not supported by your browser or environment."));
			navigator.geolocation.getCurrentPosition((pos) => {
				resolve({
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
					accuracy: Math.ceil(pos.coords.accuracy)
				});
			}, (err) => {
				if (err.code === 1) {
					setPermissionStatus("denied");
					return reject(/* @__PURE__ */ new Error("Location permission was denied. Please allow location access in your browser settings."));
				}
				navigator.geolocation.getCurrentPosition((pos2) => {
					resolve({
						latitude: pos2.coords.latitude,
						longitude: pos2.coords.longitude,
						accuracy: Math.ceil(pos2.coords.accuracy)
					});
				}, (err2) => {
					if (customCoords?.latitude && customCoords?.longitude) return resolve(customCoords);
					if (todayRecord?.latitude && todayRecord?.longitude) return resolve({
						latitude: Number(todayRecord.latitude),
						longitude: Number(todayRecord.longitude),
						accuracy: 50
					});
					let msg = "Unable to acquire location.";
					if (err2.code === 1) {
						msg = "Location permission was denied. Please allow location access in your browser settings.";
						setPermissionStatus("denied");
					} else if (err2.code === 2) msg = "Location unavailable. Ensure device GPS / Location Services is turned on.";
					else if (err2.code === 3) msg = "Location request timed out. Please retry or connect to office Wi-Fi.";
					reject(new Error(msg));
				}, {
					enableHighAccuracy: false,
					timeout: 8e3,
					maximumAge: 6e4
				});
			}, {
				enableHighAccuracy: true,
				timeout: 7e3,
				maximumAge: 15e3
			});
		});
	}
	async function handleDetectRealGPS() {
		setDetectingGps(true);
		setGpsError("");
		try {
			const coords = await getFreshCoordinates();
			updateCustomCoords(coords);
			setGpsLive(true);
			setPermissionStatus("granted");
			const verifyData = await handleRefreshNetwork(coords);
			const dist = verifyData?.distanceMeters;
			const maxR = Number(settings?.attendanceRules?.maxGeofenceRadiusMeters) || Number(verifyData?.maxAllowedRadius) || maxGeofenceRadius || 50;
			if (verifyData?.isGpsVerified || verifyData?.isWifiVerified || verifyData?.isIpVerified || dist != null && dist <= maxR) {
				if (typeof localStorage !== "undefined") localStorage.removeItem(offCampusStartKey);
			}
		} catch (err) {
			setGpsError(err.message);
		} finally {
			setDetectingGps(false);
		}
	}
	async function handlePunchClick() {
		if (isPunching || isCompleted) return;
		setIsPunching(true);
		setGpsError("");
		if (isCheckedIn) {
			try {
				liveGpsTracker.stop();
				await onPunch({ offCampusDurationMinutes: 0 });
			} catch (error) {
				setGpsError(error.message);
			} finally {
				setIsPunching(false);
			}
			return;
		}
		let currentCoords = null;
		if (typeof navigator !== "undefined" && navigator.geolocation) try {
			currentCoords = await getFreshCoordinates();
			setCustomCoords(currentCoords);
			setGpsLive(true);
			setPermissionStatus("granted");
		} catch (err) {
			setGpsError(err.message);
			setIsPunching(false);
			return;
		}
		else {
			setGpsError("Real-time geolocation is required to authenticate punch attendance.");
			setIsPunching(false);
			return;
		}
		try {
			const latestVerification = (await apiClient.post("/attendance/verify", { ...currentCoords })).data;
			setServerVerification(latestVerification);
			if (!latestVerification.isEligible) {
				setGpsError(latestVerification.message || "Attendance verification failed: You must be connected to the registered office network and inside the office GPS geofence.");
				setIsPunching(false);
				return;
			}
			await Promise.resolve(onPunch({
				wifiSSID: isOnOfficeNetwork ? primaryWifiSSID : "External Network",
				bssid: null,
				publicIp,
				shift: todayRecord?.shift || null,
				shiftCode: todayRecord?.shiftCode || null,
				latitude: currentCoords?.latitude ?? null,
				longitude: currentCoords?.longitude ?? null,
				accuracy: currentCoords?.accuracy ?? null,
				distanceMeters: latestVerification.distanceMeters,
				locationName: /san francisco|austin|london/i.test(latestVerification.nearestLocation || "") || !latestVerification.nearestLocation ? assignedCampus : latestVerification.nearestLocation,
				gpsData: {
					latitude: currentCoords?.latitude ?? null,
					longitude: currentCoords?.longitude ?? null,
					accuracy: currentCoords?.accuracy ?? null,
					distanceMeters: latestVerification.distanceMeters,
					locationName: /san francisco|austin|london/i.test(latestVerification.nearestLocation || "") || !latestVerification.nearestLocation ? assignedCampus : latestVerification.nearestLocation
				}
			}));
		} catch (err) {
			const serverMsg = err.response?.data?.error?.message || err.message || "Error recording attendance. Please try again.";
			setGpsError(serverMsg);
		} finally {
			setIsPunching(false);
		}
	}
	async function handleResumeFromBreak() {
		if (!onEndBreak || isBreaking) return;
		setIsBreaking(true);
		setGpsError("");
		try {
			await onEndBreak();
		} catch (err) {
			setGpsError(err.message || "Failed to end break");
		} finally {
			setIsBreaking(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "ess-attendance-card",
		"aria-label": "GPS & Wi-Fi Attendance Station",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ess-station-status-strip",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ess-station-title-group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `ess-live-pulse-dot ${isOnBreak ? "warning" : isCheckedIn ? "" : "neutral"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "ess-station-heading",
						children: isOnBreak ? "On Break" : isCheckedIn ? "Active Work Shift" : "Attendance Station"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ess-status-chips-wrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `ess-chip ${isWifiVerified ? "ess-chip-success" : "ess-chip-neutral"}`,
							title: publicIp ? `Public IP: ${publicIp}` : "Detecting network…",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 11 }),
								" ",
								networkLabel
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `ess-chip ${isGpsInside ? "ess-chip-success" : "ess-chip-warning"}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 11 }),
								" GPS: ",
								hasGps ? `${distanceLabel} (${isGpsInside ? `≤${maxGeofenceRadius}m Verified` : "Outside Geofence"})` : "Not detected"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `ess-chip ${permissionStatus === "granted" ? "ess-chip-success" : permissionStatus === "denied" ? "ess-chip-danger" : "ess-chip-neutral"}`,
							title: "Browser Geolocation Permission Status",
							children: ["GPS: ", permissionStatus.toUpperCase()]
						}),
						hasAutoPunchedOut && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ess-chip ess-chip-warning",
							children: "Auto Punched Out"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ess-live-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ess-live-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ess-clock-block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ess-block-label",
								children: "Current Time"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-clock-digits",
								children: currentTime.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ess-location-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									currentTime.toLocaleDateString("en-US", {
										weekday: "short",
										month: "short",
										day: "numeric",
										year: "numeric"
									}),
									" • Office: ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: nearestOfficeName })
								] })]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ess-punch-summary-row",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ess-punch-time-tag",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--muted)" },
									children: "Punch In:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: todayRecord?.checkIn || "–" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ess-punch-time-tag",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Punch Out:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: todayRecord?.checkOut || "–" }),
									hasAutoPunchedOut && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ess-chip ess-chip-warning",
										style: {
											fontSize: "9px",
											padding: "1px 5px"
										},
										children: "Auto Out"
									})
								]
							}),
							todayRecord?.totalBreakMinutes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ess-punch-time-tag",
								style: { color: "#b45309" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Breaks:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [todayRecord.totalBreakMinutes, "m"] })]
							}) : null
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ess-live-right",
					children: [
						isCheckedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `ess-timer-box ${isOnBreak ? "paused-break" : isAutoLunchActive ? "paused-break" : "active"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ess-timer-header",
								children: [isOnBreak ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 13 }) : isAutoLunchActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, { size: 13 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isOnBreak ? "Active Work (Paused — Manual Break)" : isAutoLunchActive ? `Active Work (Paused — Lunch Break ${format12Hour(lunchBreakStart)} – ${format12Hour(lunchBreakEnd)})` : "Active Net Work Time" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-timer-digits",
								children: formatTimerSeconds(netWorkSeconds)
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-timer-box idle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ess-timer-header",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shift Ready" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-timer-digits",
								children: "00h 00m 00s"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-qualification-box",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ess-qualification-header",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontWeight: 700,
											textTransform: "uppercase",
											letterSpacing: "0.04em"
										},
										children: isApprovedHalfDayLeave ? "Approved 1/2 Day Shift" : "Shift Qualification"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											fontWeight: 700,
											padding: "2px 8px",
											borderRadius: "6px",
											background: isApprovedHalfDayLeave ? isHalfDayTargetMet ? "#dcfce7" : "#fef3c7" : isFullDayQualified ? "#dcfce7" : isHalfDayQualified ? "#fef3c7" : "#fee2e2",
											color: isApprovedHalfDayLeave ? isHalfDayTargetMet ? "#15803d" : "#b45309" : isFullDayQualified ? "#15803d" : isHalfDayQualified ? "#b45309" : "#b91c1c",
											border: `1px solid ${isApprovedHalfDayLeave ? isHalfDayTargetMet ? "#86efac" : "#fde68a" : isFullDayQualified ? "#86efac" : isHalfDayQualified ? "#fde68a" : "#fca5a5"}`
										},
										children: isApprovedHalfDayLeave ? isHalfDayTargetMet ? "1/2 Day Target Met (3.5+ hrs)" : "In Progress (Target: 3.5h – 4h)" : isFullDayQualified ? "Full Day Qualified (8+ hrs)" : isHalfDayQualified ? "Half Day Qualified (4+ hrs)" : "Below Min Half Day (<4 hrs)"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "ess-qualification-track",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "ess-qualification-fill",
										style: {
											width: `${Math.min(100, Math.round(netWorkSeconds / (isApprovedHalfDayLeave ? HALF_DAY_SECS : FULL_DAY_SECS) * 100))}%`,
											background: isApprovedHalfDayLeave ? isHalfDayTargetMet ? "#16a34a" : "#f59e0b" : isFullDayQualified ? "#16a34a" : isHalfDayQualified ? "#f59e0b" : "#ef4444"
										}
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ess-qualification-footer",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Min Half Day: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: isApprovedHalfDayLeave ? "3.5h" : "4h" })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Progress: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [Math.min(100, Math.round(netWorkSeconds / (isApprovedHalfDayLeave ? HALF_DAY_SECS : FULL_DAY_SECS) * 100)), "%"] })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
											isApprovedHalfDayLeave ? "Shift Target:" : "Full Day:",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: isApprovedHalfDayLeave ? "4h (Approved Leave)" : "8h" })
										] })
									]
								})
							]
						}),
						isOnBreak && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "8px 12px",
								background: "#fef3c7",
								border: "1px solid #f59e0b",
								borderRadius: "8px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "6px",
									fontSize: "11px",
									fontWeight: 700,
									color: "#92400e"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Current Break:" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontFamily: "monospace",
									fontSize: "16px",
									fontWeight: 800,
									color: "#b45309"
								},
								children: formatTimerSeconds(currentBreakSeconds)
							})]
						})
					]
				})]
			}),
			isAutoLunchActive && !isOnBreak && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#fffbeb",
					border: "1px solid #fde68a",
					color: "#92400e",
					padding: "10px 14px",
					borderRadius: "10px",
					fontSize: "12px",
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, {
					size: 16,
					style: {
						color: "#d97706",
						flexShrink: 0
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						"Company Lunch Break (",
						format12Hour(lunchBreakStart),
						" – ",
						format12Hour(lunchBreakEnd),
						"):"
					] }),
					" Active work timer is automatically paused for scheduled lunch break and will automatically resume at ",
					format12Hour(lunchBreakEnd),
					"."
				] })]
			}),
			isOnBreak && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#fffbeb",
					border: "1px solid #fde68a",
					color: "#92400e",
					padding: "10px 14px",
					borderRadius: "10px",
					fontSize: "12px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "10px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Break in Progress:" }),
						" Work timer is paused. Click ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Resume Work" }),
						" when you return."
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: handleResumeFromBreak,
					disabled: isBreaking,
					style: {
						padding: "6px 12px",
						borderRadius: "8px",
						background: "#059669",
						color: "#fff",
						border: 0,
						fontWeight: 700,
						fontSize: "11px",
						cursor: "pointer",
						flexShrink: 0
					},
					children: "Resume Work"
				})]
			}),
			hasAutoPunchedOut && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#f0fdf4",
					border: "1px solid #bbf7d0",
					color: "#166534",
					padding: "10px 14px",
					borderRadius: "10px",
					fontSize: "12px",
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					size: 16,
					style: {
						flexShrink: 0,
						color: "#16a34a"
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Full Day Completed (Auto Punched Out):" }),
					" Completed 8 working hours. Attendance automatically closed at ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: todayRecord?.checkOut || "end of 8h shift" }),
					"."
				] })]
			}),
			isCheckedIn && !isCompleted && (isOutsideCampus || serverVerification?.geofenceStatus === "outside") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#fff7ed",
					border: "1px solid #fed7aa",
					color: "#9a3412",
					padding: "12px 14px",
					borderRadius: "10px",
					fontSize: "12px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "10px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
						size: 18,
						style: {
							flexShrink: 0,
							color: "#ea580c"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Outside Office Geofence:" }),
						" Your device appears outside ",
						nearestOfficeName || "office campus",
						" (",
						distanceLabel,
						" away).",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "11px",
								marginTop: "2px",
								color: "#c2410c"
							},
							children: [
								"⏳ ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "2-Hour Grace Period Active" }),
								" ",
								serverVerification?.remainingGraceMinutes ? `(${serverVerification.remainingGraceMinutes}m remaining)` : "",
								". Return to campus to continue your session, otherwise auto punch-out is scheduled."
							]
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleDetectRealGPS,
					disabled: detectingGps,
					style: {
						flexShrink: 0,
						padding: "6px 12px",
						borderRadius: "8px",
						background: "#ea580c",
						color: "#fff",
						border: 0,
						fontWeight: 700,
						fontSize: "11px",
						cursor: "pointer",
						display: "inline-flex",
						alignItems: "center",
						gap: "5px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
							size: 12,
							className: detectingGps ? "animate-spin" : ""
						}),
						" ",
						detectingGps ? "Detecting…" : "Re-verify GPS"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ess-actions-row",
				children: [isCheckedIn && !isCompleted && isOnBreak && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ess-action-btn resume",
					onClick: handleResumeFromBreak,
					disabled: isBreaking,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { size: 16 }), " Resume Work"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `ess-action-btn ${isCompleted ? "neutral" : isCheckedIn ? "danger" : "primary"}`,
					onClick: handlePunchClick,
					disabled: isCompleted || isPunching || detectingGps,
					children: isCompleted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), " Punched Out Today"] }) : isPunching ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
						size: 16,
						className: "animate-spin"
					}), " Verifying..."] }) : isCheckedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 16 }), " Punch Out"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 16 }), " Punch In"] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					marginTop: "4px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ess-diagnostics-toggle",
					onClick: () => setDiagnosticsOpen(!diagnosticsOpen),
					"aria-expanded": diagnosticsOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "6px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							size: 14,
							color: isGpsInside && isWifiVerified ? "var(--teal)" : "var(--muted)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Office Network & Geofence Diagnostics" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `ess-chip ${isGpsInside && isWifiVerified ? "ess-chip-success" : "ess-chip-warning"}`,
							style: {
								fontSize: "10px",
								padding: "2px 7px"
							},
							children: isGpsInside && isWifiVerified ? "Dual Verified" : "Check Required"
						}), diagnosticsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 14 })]
					})]
				}), diagnosticsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ess-diagnostics-body",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "var(--surface-sunken)",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "12px",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink)",
										display: "flex",
										alignItems: "center",
										gap: "5px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
										size: 13,
										color: isOnOfficeNetwork ? "var(--teal)" : "var(--coral)"
									}), " Office Network Security"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleRefreshNetwork(),
									disabled: ipLoading,
									style: {
										display: "inline-flex",
										alignItems: "center",
										gap: "4px",
										fontSize: "10px",
										fontWeight: 600,
										color: "var(--teal)",
										background: "transparent",
										border: 0,
										cursor: "pointer"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
											size: 11,
											className: ipLoading ? "animate-spin" : ""
										}),
										" ",
										ipLoading ? "Checking…" : "Re-check"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									fontSize: "11px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--muted)" },
									children: "Device IP"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { fontFamily: "monospace" },
									children: ipLoading ? "Detecting…" : publicIp || "Unavailable"
								})]
							}),
							publicIp && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									fontSize: "11px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--muted)" },
									children: "Office Gateway Subnet"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontFamily: "monospace",
										color: isOnOfficeNetwork ? "var(--teal)" : "var(--muted)"
									},
									children: serverVerification?.gatewaySubnet || (publicIp.includes(".") ? `${publicIp.split(".").slice(0, 3).join(".")}.* (/24)` : "—")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "10px",
									fontWeight: 600,
									padding: "4px 8px",
									borderRadius: "6px",
									background: isOnOfficeNetwork ? "rgba(0, 110, 111, 0.08)" : "#fef2f2",
									color: isOnOfficeNetwork ? "var(--teal)" : "#991b1b",
									border: isOnOfficeNetwork ? "1px solid rgba(0, 110, 111, 0.2)" : "1px solid #fecaca"
								},
								children: isOnOfficeNetwork ? `✓ Authenticated Office Network: ${networkLabel}` : `✕ Office Network Verification Failed: Connect to registered office Wi-Fi.`
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "var(--surface-sunken)",
							border: "1px solid var(--line)",
							borderRadius: "10px",
							padding: "12px",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "11px",
										fontWeight: 700,
										color: "var(--ink)",
										display: "flex",
										alignItems: "center",
										gap: "5px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
											size: 13,
											color: isGpsInside ? "var(--teal)" : "#c25e00"
										}),
										" GPS Geofence (Max ",
										maxGeofenceRadius,
										"m)",
										isCheckedIn && !isCompleted && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `freshness-badge ${trackingStatus === "LIVE" ? "live" : trackingStatus === "BACKGROUND_PAUSED" ? "background-paused" : trackingStatus === "STALE" ? "stale" : trackingStatus === "OFFLINE" ? "offline" : trackingStatus === "UNCERTAIN" ? "uncertain" : "unavailable"}`,
											style: { marginLeft: "4px" },
											title: `Presence Status: ${trackingStatus}`,
											children: [trackingStatus === "LIVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-dot" }), trackingStatus === "LIVE" ? "LIVE" : trackingStatus === "BACKGROUND_PAUSED" ? "BACKGROUND PAUSED" : trackingStatus === "STALE" ? "STALE" : trackingStatus === "OFFLINE" ? "OFFLINE" : trackingStatus === "UNCERTAIN" ? "UNCERTAIN" : "LOCATION UNAVAILABLE"]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleDetectRealGPS,
									disabled: detectingGps || isPunching,
									style: {
										display: "inline-flex",
										alignItems: "center",
										gap: "4px",
										fontSize: "10px",
										fontWeight: 600,
										color: "var(--teal)",
										background: "transparent",
										border: 0,
										cursor: "pointer"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
											size: 11,
											className: detectingGps ? "animate-spin" : ""
										}),
										" ",
										detectingGps ? "Locating..." : "GPS Detect"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									padding: "6px 8px",
									fontSize: "11px",
									borderRadius: "6px",
									border: "1px solid var(--line)",
									background: "#fff",
									color: "var(--muted)"
								},
								children: gpsLive && customCoords ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"📍 ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										style: { color: "var(--ink)" },
										children: [
											customCoords.latitude.toFixed(5),
											"°, ",
											customCoords.longitude.toFixed(5),
											"°"
										]
									}),
									" (±",
									customCoords.accuracy || 10,
									"m)"
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "Tap “GPS Detect” to acquire real device coordinates." })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "10px",
									fontWeight: 600,
									padding: "4px 8px",
									borderRadius: "6px",
									background: isGpsInside ? "rgba(0, 110, 111, 0.08)" : "#fff7ed",
									color: isGpsInside ? "var(--teal)" : "#c2410c",
									border: isGpsInside ? "1px solid rgba(0, 110, 111, 0.2)" : "1px solid #fed7aa"
								},
								children: isGpsInside ? `✓ GPS Geofence Verified: ${distanceLabel} (Within ${maxGeofenceRadius}m limit)` : `✕ GPS Geofence: ${distanceLabel} (Outside ${maxGeofenceRadius}m zone)`
							}),
							gpsError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "10px",
									color: "#b91c1c",
									display: "flex",
									alignItems: "center",
									gap: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: gpsError })]
							})
						]
					})]
				})]
			})
		]
	});
}
function ESSOverview({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [currentTime, setCurrentTime] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [punchNotice, setPunchNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => setCurrentTime(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const empId = user?.employeeId;
	const todayStr = todayKey();
	const todayAttendance = storeState.attendance.find((a) => {
		const aEmp = String(a.employeeId || "").toUpperCase();
		const uEmp = String(empId || "").toUpperCase();
		const uId = String(user?.id || "").toUpperCase();
		const aUser = String(a.userId || "").toUpperCase();
		return (uEmp && (aEmp === uEmp || aUser === uEmp) || uId && (aUser === uId || aEmp === uId)) && a.date === todayStr;
	});
	const recentUserLogs = (storeState.attendance || []).filter((a) => {
		const aEmp = String(a.employeeId || "").toUpperCase();
		const uEmp = String(empId || "").toUpperCase();
		const uId = String(user?.id || "").toUpperCase();
		const aUser = String(a.userId || "").toUpperCase();
		return uEmp && (aEmp === uEmp || aUser === uEmp) || uId && (aUser === uId || aEmp === uId) || user?.email && a.email?.toLowerCase() === user.email.toLowerCase();
	}).sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 5);
	const isCheckedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;
	const isCompleted = !!todayAttendance?.checkIn && !!todayAttendance?.checkOut;
	async function handlePunch(opts = {}) {
		const wifi = opts.wifiSSID && !/airtel|dji|3052/i.test(opts.wifiSSID) ? opts.wifiSSID : "Edufyi";
		const bssid = opts.bssid || null;
		const publicIp = opts.publicIp || null;
		const gps = opts.gpsData;
		const shift = todayAttendance?.shift || null;
		const shiftCode = todayAttendance?.shiftCode || null;
		if (!isCheckedIn && !isCompleted) {
			const rec = await hrStore.checkIn({
				employeeId: empId,
				employeeName: user?.displayName || "Employee",
				wifiSSID: wifi,
				bssid,
				publicIp,
				date: todayStr,
				latitude: gps?.latitude ?? null,
				longitude: gps?.longitude ?? null,
				accuracy: gps?.accuracy ?? null,
				distanceMeters: gps?.distanceMeters ?? null,
				locationName: gps?.locationName ?? null,
				shift,
				shiftCode
			});
			setPunchNotice(`Successfully punched in at ${rec?.checkIn || "now"}! (${rec?.ipVerified ? "Office network verified" : rec?.gpsVerified ? "GPS Geofence verified" : "Recorded"})`);
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem(`att_disc_since_${todayStr}_${empId}`);
				localStorage.removeItem(`att_disc_since_${empId}`);
			}
		} else if (isCheckedIn) {
			const isAuto = Boolean(opts.autoPunchOut);
			if (isAuto) {
				let checkInMs = todayAttendance?.checkInAt ? new Date(todayAttendance.checkInAt).getTime() : null;
				if (!checkInMs && todayAttendance?.checkIn) {
					const timeMatch = /(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i.exec(todayAttendance.checkIn);
					if (timeMatch) {
						let h = parseInt(timeMatch[1], 10);
						const m = parseInt(timeMatch[2], 10);
						const mer = timeMatch[4]?.toUpperCase();
						if (mer === "PM" && h < 12) h += 12;
						if (mer === "AM" && h === 12) h = 0;
						const d = /* @__PURE__ */ new Date();
						d.setHours(h, m, 0, 0);
						checkInMs = d.getTime();
					}
				}
				if (checkInMs && Date.now() - checkInMs < 72e5) {
					console.warn("[AutoPunchOut] Suppressed: Less than 120 minutes elapsed since check-in");
					return;
				}
			}
			let effectiveCheckOutTime = null;
			if (isAuto && opts.disconnectionTime) {
				const d = new Date(opts.disconnectionTime);
				if (!isNaN(d.getTime())) effectiveCheckOutTime = d.toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
					hour12: true
				});
			}
			liveGpsTracker.stop();
			await hrStore.checkOut({
				employeeId: empId,
				employeeName: user?.displayName || "Employee",
				date: todayStr,
				autoPunchOut: isAuto,
				disconnectionTime: opts.disconnectionTime || null,
				punchOutReason: opts.punchOutReason || (isAuto ? "Auto Punch Out (GPS & WiFi disconnected for 2 hrs)" : null)
			});
			if (typeof localStorage !== "undefined") localStorage.removeItem(`att_disc_since_${empId}`);
			setPunchNotice(isAuto ? `Full Day Completed: Successfully auto punched out after completing 8 working hours at ${effectiveCheckOutTime || (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			})}.` : "Successfully punched out at " + (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			}));
		}
		setTimeout(() => setPunchNotice(""), 6e3);
	}
	async function handleStartBreak(type = "lunch") {
		try {
			await hrStore.startBreak(type, todayStr, empId);
			setPunchNotice(`Break started (${type === "lunch" ? "Lunch Break" : "Short Break"}). Work timer is paused.`);
			setTimeout(() => setPunchNotice(""), 5500);
		} catch (err) {
			setPunchNotice(`Break error: ${err.message}`);
			setTimeout(() => setPunchNotice(""), 5500);
		}
	}
	async function handleEndBreak() {
		try {
			await hrStore.endBreak(todayStr, empId);
			setPunchNotice("Break ended. Net work timer resumed!");
			setTimeout(() => setPunchNotice(""), 5500);
		} catch (err) {
			setPunchNotice(`Break error: ${err.message}`);
			setTimeout(() => setPunchNotice(""), 5500);
		}
	}
	const myEmployee = (storeState.employees || []).find((e) => user?.id && (String(e.id) === String(user.id) || String(e._id) === String(user.id)) || empId && (e.employeeId === empId || e.id === empId || e._id === empId) || user?.email && e.email && e.email.toLowerCase() === user.email.toLowerCase());
	const currentEmpId = empId || user?.employeeId || myEmployee?.employeeId || "";
	const currentUserId = String(user?.id || user?._id || "");
	const currentEmpRef = String(myEmployee?._id || myEmployee?.id || currentUserId);
	const currentUserName = (user?.displayName || user?.name || myEmployee?.name || "").toLowerCase();
	const myTasks = (storeState.tasks || []).filter((t) => {
		if (!t) return false;
		const matchRef = t.assigneeRef && (String(t.assigneeRef) === currentUserId || String(t.assigneeRef) === currentEmpRef);
		const matchId = t.assigneeId && currentEmpId && String(t.assigneeId).toUpperCase() === String(currentEmpId).toUpperCase();
		const matchName = t.assigneeName && currentUserName && String(t.assigneeName).toLowerCase() === currentUserName;
		const matchOwner = !t.assigneeRef && !t.assigneeId && String(t.ownerId) === currentUserId;
		return Boolean(matchRef || matchId || matchName || matchOwner);
	});
	const pendingTasks = myTasks.filter((t) => t.status !== "completed");
	const completedTasks = myTasks.filter((t) => t.status === "completed");
	const uEmailLower = String(user?.email || "").trim().toLowerCase();
	const hdConfig = storeState.companySettings?.helpDeskSettings || {};
	const isItStaff = Boolean(uEmailLower === "itsupport@edufyitech.in" || user?.role === "it" || user?.department && /it|tech|support/i.test(user.department) || hdConfig.itSupportEmployeeId && [
		currentUserId,
		String(user?._id),
		String(currentEmpId)
	].map((s) => String(s || "").toUpperCase()).includes(String(hdConfig.itSupportEmployeeId).toUpperCase()) || hdConfig.itSupportEmployeeEmail && uEmailLower === String(hdConfig.itSupportEmployeeEmail).trim().toLowerCase());
	const myTickets = (storeState.tickets || []).filter((t) => {
		if (!t) return false;
		const tEmp = String(t.employeeId || "").toUpperCase();
		const uEmp = String(currentEmpId).toUpperCase();
		const tOwner = String(t.ownerId || "");
		const tName = String(t.employeeName || "").toLowerCase();
		const isOwner = uEmp && tEmp === uEmp || currentUserId && tOwner === currentUserId || currentUserName && tName === currentUserName;
		const isAssigned = Boolean(t.assignedToId && [
			currentUserId,
			String(user?._id),
			uEmp
		].filter(Boolean).map(String).includes(String(t.assignedToId)) || t.assignedToEmail && uEmailLower && String(t.assignedToEmail).trim().toLowerCase() === uEmailLower || t.assignedToName && currentUserName && String(t.assignedToName).trim().toLowerCase() === currentUserName || t.assignedTo && currentUserName && String(t.assignedTo).trim().toLowerCase() === currentUserName || t.assignedTo && uEmp && String(t.assignedTo).toUpperCase() === uEmp || isItStaff && /it/i.test(t.category || ""));
		return isOwner || isAssigned;
	});
	const openTickets = myTickets.filter((t) => (t.status || "open") !== "resolved" && t.status !== "closed");
	const assignedOpenCount = myTickets.filter((t) => {
		const uEmp = String(currentEmpId).toUpperCase();
		return Boolean(t.assignedToId && [
			currentUserId,
			String(user?._id),
			uEmp
		].filter(Boolean).map(String).includes(String(t.assignedToId)) || t.assignedToEmail && uEmailLower && String(t.assignedToEmail).trim().toLowerCase() === uEmailLower || t.assignedToName && currentUserName && String(t.assignedToName).trim().toLowerCase() === currentUserName || t.assignedTo && currentUserName && String(t.assignedTo).trim().toLowerCase() === currentUserName || t.assignedTo && uEmp && String(t.assignedTo).toUpperCase() === uEmp || isItStaff && /it/i.test(t.category || ""));
	}).filter((t) => (t.status || "open") !== "resolved" && t.status !== "closed").length;
	const myExpenses = (storeState.expenses || []).filter((e) => {
		if (!e) return false;
		const eEmp = String(e.employeeId || "").toUpperCase();
		const uEmp = String(currentEmpId).toUpperCase();
		const eOwner = String(e.ownerId || "");
		const eName = String(e.employeeName || "").toLowerCase();
		return uEmp && eEmp === uEmp || currentUserId && eOwner === currentUserId || currentUserName && eName === currentUserName;
	});
	const pendingExpenses = myExpenses.filter((e) => (e.status || "submitted") === "submitted" || e.status === "pending");
	const totalPendingExpense = pendingExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
	const latestAnnouncements = (storeState.announcements || []).slice(0, 3);
	const holidays = (storeState.holidays || []).slice(0, 3);
	const myAttendance = storeState.attendance.filter((record) => record.employeeId === empId && record.date.startsWith(todayKey().slice(0, 7)));
	const presentDays = myAttendance.filter((record) => [
		"present",
		"late",
		"half-day"
	].includes(record.status)).length;
	const myLeaveBalances = (storeState.leaveBalances ?? []).filter((b) => {
		if (!b) return false;
		if (!b.employeeId) return true;
		const bEmp = typeof b.employeeId === "object" ? String(b.employeeId.employeeId || b.employeeId._id || b.employeeId.id || "").toUpperCase() : String(b.employeeId).toUpperCase();
		const matchEmp = currentEmpId && (bEmp === String(currentEmpId).toUpperCase() || typeof b.employeeId === "object" && String(b.employeeId.employeeId || "").toUpperCase() === String(currentEmpId).toUpperCase());
		const matchUser = currentUserId && (bEmp === currentUserId || bEmp === currentEmpRef || typeof b.employeeId === "object" && String(b.employeeId._id || b.employeeId.id || "") === currentUserId);
		return Boolean(matchEmp || matchUser);
	});
	const availableLeave = myLeaveBalances.length ? myLeaveBalances.reduce((sum, b) => sum + Math.max(0, (Number(b.allowance) || 0) - (Number(b.used) || 0) - (Number(b.reserved) || 0)), 0) : 0;
	const latestPayslip = (0, import_react.useMemo)(() => {
		return (storeState.payroll || []).filter((r) => doesPayrollMatchUser(r, user, storeState.employees));
	}, [
		storeState.payroll,
		user,
		storeState.employees
	])[0] || null;
	let netSalary = null;
	let salarySubtitle = "No finalized payslip available";
	if (latestPayslip) {
		const rawNet = Number(latestPayslip.netPay ?? latestPayslip.netSalary);
		if (Number.isFinite(rawNet) && rawNet > 0) netSalary = rawNet;
		else if (latestPayslip.earnings) netSalary = Object.values(latestPayslip.earnings).reduce((sum, value) => sum + (Number(value) || 0), 0) - Object.values(latestPayslip.deductions || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
		salarySubtitle = `Finalized • ${latestPayslip.month || "Current Cycle"}`;
	} else if (myEmployee?.salary) {
		const annualCtc = Number(myEmployee.salary);
		if (annualCtc > 0) {
			const grossMonthly = Math.round(annualCtc / 12);
			netSalary = Math.round(grossMonthly * .92);
			salarySubtitle = `Estimated Monthly (CTC: ${formatINR(annualCtc)}/yr)`;
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "ess-overview-root",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ess-header-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ess-header-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-header-meta",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ess-badge-pill",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 11 }), " Employee Self-Service (ESS)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ess-date-indicator",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 12 }),
									" ",
									currentTime.toLocaleDateString("en-US", {
										weekday: "short",
										month: "short",
										day: "numeric"
									}),
									" • ",
									user?.campus || user?.location || "Ignite Campus"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "ess-header-title",
							children: [
								getTimeOfDayGreeting(),
								", ",
								resolveUserDisplayName(user, storeState.employees),
								" 👋"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "ess-header-subtitle",
							children: "Welcome to your personal work portal. Track daily attendance, shift qualification, salary breakdown, and pending tasks."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ess-header-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ess-role-badge",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getRoleBadgeLabel(user?.role) })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/profile",
						className: "ess-profile-button",
						title: "View & Edit Profile",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 13 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "My Profile" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSAttendanceStation, {
				user,
				todayRecord: todayAttendance,
				onPunch: handlePunch,
				onStartBreak: handleStartBreak,
				onEndBreak: handleEndBreak,
				currentTime
			}),
			punchNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#eaf4f1",
					border: "1px solid #c7ded7",
					color: "var(--teal)",
					padding: "12px 16px",
					borderRadius: "10px",
					fontSize: "12px",
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: punchNotice })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "ess-metrics-grid",
				"aria-label": "Employee Quick Metrics",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/attendance",
						className: "ess-metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-metric-icon",
								style: {
									background: "#E1F1F0",
									color: "var(--teal)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "ess-metric-arrow"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-label",
									children: "Attendance Rate"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "ess-metric-value",
									children: myAttendance.length ? `${Math.round(presentDays / myAttendance.length * 100)}%` : "–"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ess-metric-caption",
									children: [
										presentDays,
										" / ",
										myAttendance.length,
										" days recorded this month"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/leave",
						className: "ess-metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-metric-icon",
								style: {
									background: "#EEF2F6",
									color: "var(--blue)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "ess-metric-arrow"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-label",
									children: "Leave Balance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "ess-metric-value",
									children: [availableLeave, " Days"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-caption",
									children: "Available leave balance"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/tasks",
						className: "ess-metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-metric-icon",
								style: {
									background: "#FEF3E2",
									color: "#B45309"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "ess-metric-arrow"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-label",
									children: "Active Tasks"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "ess-metric-value",
									children: [pendingTasks.length, " Pending"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ess-metric-caption",
									children: [
										completedTasks.length,
										" done • ",
										myTasks.length,
										" total assigned"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/salary",
						className: "ess-metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-metric-icon",
								style: {
									background: "#F6EFF7",
									color: "#88438E"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "ess-metric-arrow"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-label",
									children: "Net Monthly Salary"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "ess-metric-value",
									children: netSalary === null ? "Pending" : formatINR(netSalary)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-caption",
									children: salarySubtitle
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/helpdesk",
						className: "ess-metric-card",
						style: assignedOpenCount > 0 ? {
							borderColor: "#60A5FA",
							background: "#F8FAFC"
						} : {},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-metric-icon",
								style: {
									background: assignedOpenCount > 0 ? "#DBEAFE" : "#E1F1F0",
									color: assignedOpenCount > 0 ? "#1D4ED8" : "var(--teal)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "ess-metric-arrow"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ess-metric-label",
									children: ["Help Desk ", assignedOpenCount > 0 ? `(${assignedOpenCount} Assigned)` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "ess-metric-value",
									style: assignedOpenCount > 0 ? { color: "#1D4ED8" } : {},
									children: [openTickets.length, " Open"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ess-metric-caption",
									children: [
										assignedOpenCount > 0 ? `${assignedOpenCount} assigned to you • ` : "",
										myTickets.length - openTickets.length,
										" resolved"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/expenses",
						className: "ess-metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-top",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-metric-icon",
								style: {
									background: "#FEF3E7",
									color: "#C25E00"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "ess-metric-arrow"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ess-metric-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-label",
									children: "Expense Claims"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "ess-metric-value",
									children: [pendingExpenses.length, " Pending"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ess-metric-caption",
									children: totalPendingExpense > 0 ? `₹${totalPendingExpense.toLocaleString("en-IN")} review` : `${myExpenses.length} submitted`
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ess-shortcuts-bar",
				"aria-label": "Quick Action Shortcuts",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/leave",
						className: "ess-shortcut-chip",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
							size: 13,
							style: { color: "var(--teal)" }
						}), " Apply for Leave"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/expenses",
						className: "ess-shortcut-chip",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {
							size: 13,
							style: { color: "#C25E00" }
						}), " Submit Expense"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/helpdesk",
						className: "ess-shortcut-chip",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ticket, {
							size: 13,
							style: { color: "var(--teal)" }
						}), " Support Ticket"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/salary",
						className: "ess-shortcut-chip",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
							size: 13,
							style: { color: "#88438E" }
						}), " View Latest Payslip"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/employee/documents",
						className: "ess-shortcut-chip",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, {
							size: 13,
							style: { color: "#30A06A" }
						}), " Company Policies & NDA"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					marginTop: "6px",
					marginBottom: "14px"
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarWidgets, { user })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "ess-workspace-grid",
				"aria-label": "Employee Workspace Panels",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel ess-panel-tasks",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Deliverables"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "My Active Tasks" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#/employee/tasks",
								className: "panel-footer-link",
								children: ["View all tasks ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ess-panel-content",
							style: {
								display: "grid",
								gap: "8px",
								marginTop: "14px"
							},
							children: myTasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "24px 16px",
									textAlign: "center",
									background: "#faf9f5",
									borderRadius: "8px",
									color: "var(--muted)",
									fontSize: "12px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
										size: 24,
										style: {
											color: "var(--teal)",
											margin: "0 auto 8px",
											display: "block"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "No active tasks pending" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: {
											margin: "4px 0 0",
											fontSize: "11px"
										},
										children: "You have no pending tasks assigned at this moment."
									})
								]
							}) : myTasks.slice(0, 5).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "task-row-card",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px",
										minWidth: 0,
										flex: 1
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: `task-check-circle ${t.status === "completed" ? "checked" : ""}`,
										onClick: workspaceAction(hrStore, () => hrStore.updateTaskStatus(t.id, t.status === "completed" ? "in_progress" : "completed")),
										title: "Toggle task completion",
										children: t.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 12 })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											minWidth: 0,
											flex: 1
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "13px",
												textDecoration: t.status === "completed" ? "line-through" : "none",
												color: t.status === "completed" ? "var(--muted)" : "var(--ink)",
												display: "block",
												overflowWrap: "anywhere",
												wordBreak: "break-word"
											},
											children: t.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "10px",
												color: "var(--muted)",
												display: "flex",
												flexWrap: "wrap",
												gap: "6px",
												marginTop: "2px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Due: ", t.dueDate || "This week"] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Assigned by ", t.assignedBy || "Manager"] })
											]
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "neutral",
									children: t.priority || "Normal"
								})]
							}, t.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel ess-panel-announcements",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Company Pulse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Announcements" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#/employee/announcements",
								className: "panel-footer-link",
								children: ["All bulletins ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ess-panel-content",
							style: {
								display: "grid",
								gap: "12px",
								marginTop: "14px"
							},
							children: latestAnnouncements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "announcement-mini-card",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "flex-start",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "12px",
												overflowWrap: "anywhere",
												wordBreak: "break-word"
											},
											children: a.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "9px",
												color: "var(--muted)",
												whiteSpace: "nowrap",
												flexShrink: 0
											},
											children: a.date
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										style: {
											fontSize: "11px",
											color: "var(--muted)",
											margin: "4px 0 6px",
											lineHeight: 1.4,
											overflowWrap: "anywhere",
											wordBreak: "break-word"
										},
										children: [a.content?.slice(0, 100), "..."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "role-badge",
											style: {
												fontSize: "9px",
												background: "#f5f8f7",
												color: "var(--teal)"
											},
											children: a.category || "Company"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "announcement-like-btn",
											onClick: workspaceAction(hrStore, () => hrStore.likeAnnouncement(a.id)),
											title: "Cheer this announcement",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
												size: 11,
												fill: a.likes > 0 ? "#e05345" : "none",
												color: a.likes > 0 ? "#e05345" : "currentColor"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a.likes || 0 })]
										})]
									})
								]
							}, a.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel ess-panel-attendance",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Log History"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Recent Attendance Records" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#/employee/attendance",
								className: "panel-footer-link",
								children: ["Full attendance sheet ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ess-table-container",
							style: {
								marginTop: "14px",
								width: "100%",
								overflowX: "auto",
								WebkitOverflowScrolling: "touch"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "ui-table compact",
								style: {
									width: "100%",
									minWidth: "460px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Punch In" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Punch Out" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Hours" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: recentUserLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									style: {
										textAlign: "center",
										padding: "24px 12px",
										color: "var(--muted)",
										fontSize: "12px"
									},
									children: "No attendance records logged yet. Use the Punch In button above to record your attendance."
								}) }) : recentUserLogs.map((log) => {
									const statusInfo = getDailyAttendanceStatus(log, storeState.companySettings?.attendanceRules, storeState.leaves);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: log.date }) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: log.checkIn || "–" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: log.checkOut || "–" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: log.totalHours || "–" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											tone: statusInfo.tone,
											children: statusInfo.label
										}) })
									] }, log.id || log._id || log.date);
								}) })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel ess-panel-holidays",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Calendar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Upcoming Holidays" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: { fontSize: "10px" },
								children: "2026 Schedule"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ess-panel-content",
							style: {
								display: "grid",
								gap: "8px",
								marginTop: "12px"
							},
							children: holidays.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									padding: "8px 10px",
									background: "#faf9f5",
									borderRadius: "6px",
									fontSize: "11px",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										minWidth: 0,
										flex: 1
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											display: "block",
											overflowWrap: "anywhere",
											wordBreak: "break-word"
										},
										children: h.name || h.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "9px",
											color: "var(--muted)"
										},
										children: h.day || "National Holiday"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontWeight: 600,
										color: "var(--teal)",
										whiteSpace: "nowrap",
										flexShrink: 0
									},
									children: h.date
								})]
							}, i))
						})]
					})
				]
			})
		]
	});
}
function ESSAttendanceView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [selectedMonth, setSelectedMonth] = (0, import_react.useState)(currentPayrollMonth);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [currentTime, setCurrentTime] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	const [punchNotice, setPunchNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => setCurrentTime(/* @__PURE__ */ new Date()), 1e3);
		return () => clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const empId = user?.employeeId;
	const todayStr = todayKey();
	const todayRecord = storeState.attendance.find((a) => a.employeeId === empId && a.date === todayStr);
	const isCheckedIn = !!todayRecord?.checkIn && !todayRecord?.checkOut;
	const isCompleted = !!todayRecord?.checkIn && !!todayRecord?.checkOut;
	async function handlePunch(opts = {}) {
		const wifi = opts.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || "Edufyi";
		const bssid = opts.bssid || null;
		const publicIp = opts.publicIp || null;
		const gps = opts.gpsData;
		const shift = opts.shift || todayRecord?.shift || null;
		const shiftCode = opts.shiftCode || todayRecord?.shiftCode || null;
		if (!isCheckedIn && !isCompleted) {
			const rec = await hrStore.checkIn({
				employeeId: empId,
				employeeName: user?.displayName || "Employee",
				wifiSSID: wifi,
				bssid,
				publicIp,
				date: todayStr,
				latitude: gps?.latitude ?? null,
				longitude: gps?.longitude ?? null,
				accuracy: gps?.accuracy ?? null,
				distanceMeters: gps?.distanceMeters ?? null,
				locationName: gps?.locationName ?? null,
				shift,
				shiftCode
			});
			setPunchNotice(`Successfully punched in at ${rec?.checkIn || "now"}! (${rec?.ipVerified ? "Office network verified" : rec?.gpsVerified ? "GPS Geofence verified" : "Recorded"}${rec?.shift ? `, Shift: ${rec.shift}` : ""})`);
		} else if (isCheckedIn) {
			const offCampusMinutes = Number(opts.offCampusDurationMinutes) || 0;
			liveGpsTracker.stop();
			await hrStore.checkOut({
				employeeId: empId,
				employeeName: user?.displayName || "Employee",
				date: todayStr,
				offCampusDurationMinutes: offCampusMinutes
			});
			setPunchNotice("Successfully punched out at " + (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			}));
		}
		setTimeout(() => setPunchNotice(""), 5500);
	}
	async function handleStartBreak(type = "lunch") {
		try {
			await hrStore.startBreak(type, todayStr, empId);
			setPunchNotice(`Break started (${type === "lunch" ? "Lunch Break" : "Short Break"}). Work timer is paused.`);
			setTimeout(() => setPunchNotice(""), 5500);
		} catch (err) {
			setPunchNotice(`Break error: ${err.message}`);
			setTimeout(() => setPunchNotice(""), 5500);
		}
	}
	async function handleEndBreak() {
		try {
			await hrStore.endBreak(todayStr, empId);
			setPunchNotice("Break ended. Net work timer resumed!");
			setTimeout(() => setPunchNotice(""), 5500);
		} catch (err) {
			setPunchNotice(`Break error: ${err.message}`);
			setTimeout(() => setPunchNotice(""), 5500);
		}
	}
	const monthlyLogs = storeState.attendance.filter((record) => record.employeeId === empId && record.date.startsWith(todayKey().slice(0, 7))).map((record) => ({
		...record,
		date: record.date,
		day: (/* @__PURE__ */ new Date(`${record.date}T12:00:00`)).toLocaleDateString("en-US", { weekday: "long" }),
		shift: record.shift || "—",
		in: record.checkIn || "-",
		out: record.checkOut || "-",
		hours: (() => {
			if (record.checkIn && !record.checkOut) {
				let liveMins = 0;
				if (record.checkInAt) liveMins = Math.max(0, Math.floor((Date.now() - new Date(record.checkInAt).getTime()) / 6e4));
				else {
					const match = String(record.checkIn).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
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
				const bMins = Number(record.totalBreakMinutes) || 0;
				const netM = Math.max(0, liveMins - bMins);
				const hh = Math.floor(netM / 60);
				const mm = netM % 60;
				return `${hh}h ${String(mm).padStart(2, "0")}m (Active Live)`;
			}
			return record.totalHours || "-";
		})(),
		wifi: record.ipVerified ? "Server-verified network" : record.wifiSSID || "-",
		breaks: record.totalBreakMinutes ? `${record.totalBreakMinutes}m` : record.breaks?.length ? `${record.breaks.length} breaks` : "–",
		isOnBreak: record.isOnBreak,
		currentBreak: record.currentBreak,
		status: record.status,
		notes: record.notes,
		isHalfDay: record.isHalfDay,
		lateCount: record.lateCount,
		earlyLogoutCount: record.earlyLogoutCount
	}));
	const completedDurations = monthlyLogs.map((record) => /^(\d+)h (\d+)m/.exec(record.hours)).filter(Boolean).map((match) => Number(match[1]) * 60 + Number(match[2]));
	const averageMinutes = completedDurations.length ? Math.round(completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length) : null;
	const approvedRequests = (storeState.leaves || []).filter((leave) => leave && leave.employeeId === empId && leave.status === "approved" && (leave.startDate || "").slice(0, 7) <= todayKey().slice(0, 7) && (leave.endDate || "").slice(0, 7) >= todayKey().slice(0, 7));
	const filteredLogs = monthlyLogs.filter((log) => {
		if (statusFilter === "all") return true;
		return log.status === statusFilter;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Attendance & Shift Logs",
				title: "My Attendance Tracker",
				description: "Punch in/out with automatic corporate Wi-Fi authentication and GPS Geofencing, review monthly timesheets, and view shift metrics."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GPSAttendanceStation, {
				user,
				todayRecord,
				onPunch: handlePunch,
				onStartBreak: handleStartBreak,
				onEndBreak: handleEndBreak,
				currentTime
			}),
			punchNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#eaf4f1",
					border: "1px solid #c7ded7",
					color: "var(--teal)",
					padding: "10px 14px",
					borderRadius: "8px",
					fontSize: "12px",
					fontWeight: 600,
					display: "flex",
					alignItems: "center",
					gap: "6px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: punchNotice })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Days Present" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [monthlyLogs.filter((record) => ["present", "late"].includes(record.status)).length, " Days"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Recorded this month" })
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Late / Early Out" }), (() => {
								const lCount = monthlyLogs.filter((r) => r.status === "late" || r.isLate).length;
								const eCount = monthlyLogs.filter((r) => r.status === "early-logout" || r.isEarlyLogout).length;
								const total = lCount + eCount;
								const halfLop = Math.floor(total / 3) * .5;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
									total,
									" Times ",
									halfLop > 0 ? `(${halfLop} LOP)` : ""
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
									lCount,
									" late, ",
									eCount,
									" early (",
									total > 0 && total % 3 === 0 ? `${halfLop} LOP applied` : `${3 - total % 3} to next 0.5 LOP`,
									")"
								] })] });
							})()]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#fcf0f0",
								color: "#cb3a31"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Approved Leaves" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [approvedRequests.length, " Requests"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Approved leave overlapping this month" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#eef2f6",
								color: "var(--blue)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Avg Working Hours" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: averageMinutes === null ? "-" : `${Math.floor(averageMinutes / 60)}h ${averageMinutes % 60}m` }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Completed punches this month" })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Timesheet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Monthly Attendance Log" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								gap: "8px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								value: statusFilter,
								onChange: (e) => setStatusFilter(e.target.value),
								style: {
									padding: "4px 8px",
									fontSize: "11px",
									borderRadius: "6px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "All Statuses"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "present",
										children: "Present (Full Day 8h+)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "late",
										children: "Late In (Full Day 8h+)"
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
										children: "Half Day (Min 4h)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "short-hours",
										children: "Short Hours (<4h)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "on-leave",
										children: "On Leave"
									})
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "attendance-cards-mobile",
						style: {
							display: "none",
							gap: "10px",
							marginTop: "14px"
						},
						children: filteredLogs.map((row, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								(() => {
									const statusInfo = getDailyAttendanceStatus({
										...row,
										checkIn: row.in,
										checkOut: row.out
									}, storeState.companySettings?.attendanceRules, storeState.leaves);
									const lateInfo = getLateCountInfo(row, storeState.attendance, row.date, storeState.companySettings?.attendanceRules, storeState.leaves);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "13px" },
											children: row.date
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "11px",
												color: "var(--muted)",
												marginLeft: "6px"
											},
											children: [
												"(",
												row.day,
												")"
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
												tone: statusInfo.tone,
												children: statusInfo.label
											}), lateInfo.count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													fontSize: "11px",
													color: "#dc2626",
													fontWeight: 600
												},
												children: [
													"#",
													lateInfo.count,
													lateInfo.lopDays > 0 ? ` (${lateInfo.lopDays} LOP)` : ""
												]
											})]
										})]
									});
								})(),
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
											children: "In"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.in })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												display: "block",
												fontSize: "10px"
											},
											children: "Out"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.out })] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												display: "block",
												fontSize: "10px"
											},
											children: "Hours"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "var(--teal)" },
											children: row.hours
										})] })
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
									children: [row.breaks !== "–" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											color: "#b45309",
											fontWeight: 600
										},
										children: ["☕ Break: ", row.breaks]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), row.wifi !== "–" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "wifi-verified-badge",
										style: {
											fontSize: "9px",
											padding: "2px 6px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 10 }),
											" ",
											row.wifi
										]
									})]
								})
							]
						}, idx))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "attendance-table-desktop",
						style: {
							marginTop: "16px",
							overflowX: "auto"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "ui-table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Day" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Punch In" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Punch Out" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total Work Hours" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Break Taken" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Network Verification" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Late / Early Count" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 9,
								style: {
									textAlign: "center",
									padding: "24px 12px",
									color: "var(--muted)",
									fontSize: "12px"
								},
								children: "No attendance records found for this period."
							}) }) : filteredLogs.map((row, idx) => {
								const statusInfo = getDailyAttendanceStatus({
									...row,
									checkIn: row.in,
									checkOut: row.out
								}, storeState.companySettings?.attendanceRules, storeState.leaves);
								const lateInfo = getLateCountInfo(row, storeState.attendance, row.date, storeState.companySettings?.attendanceRules, storeState.leaves);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.date }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.day }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.in }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.out }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.hours }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "11px",
											color: row.breaks !== "–" ? "#b45309" : "var(--muted)",
											fontWeight: row.breaks !== "–" ? 600 : 400
										},
										children: row.breaks
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.wifi !== "–" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "wifi-verified-badge",
										style: {
											fontSize: "9px",
											padding: "2px 6px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 10 }),
											" ",
											row.wifi
										]
									}) : "–" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: statusInfo.tone,
										children: statusInfo.label
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: lateInfo.count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "11px",
											color: "#dc2626",
											fontWeight: 600
										},
										children: [
											"#",
											lateInfo.count,
											lateInfo.lopDays > 0 ? ` (${lateInfo.lopDays} LOP)` : ""
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "var(--muted)",
											fontSize: "12px"
										},
										children: "—"
									}) })
								] }, idx);
							}) })]
						})
					})
				]
			})
		]
	});
}
function ESSSalaryView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [selectedPayslip, setSelectedPayslip] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const employee = (0, import_react.useMemo)(() => {
		return findEmployeeForUser(user, storeState.employees) || user;
	}, [storeState.employees, user]);
	const userPayrollRecords = (0, import_react.useMemo)(() => {
		return (storeState.payroll || []).filter((r) => doesPayrollMatchUser(r, user, storeState.employees));
	}, [
		storeState.payroll,
		user,
		storeState.employees
	]);
	const ctcAnnual = 12e5;
	const grossMonthly = 1e5;
	const deductionsMonthly = 15800;
	const netMonthly = 84200;
	const fbGross = employee?.salary ? Math.round(employee.salary / 12) : 1e5;
	const fbDed = Math.round(fbGross * .158);
	const fbNet = fbGross - fbDed;
	const fallbackPayslips = [
		{
			id: `PS-${employee?.employeeId || "ETS21206"}-2026-10`,
			month: "October 2026",
			gross: fbGross,
			deductions: fbDed,
			net: fbNet,
			payDate: "Oct 31, 2026",
			status: "Processed",
			accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, "50100488577650")
		},
		{
			id: `PS-${employee?.employeeId || "ETS21206"}-2026-09`,
			month: "September 2026",
			gross: fbGross,
			deductions: fbDed,
			net: fbNet,
			payDate: "Sep 30, 2026",
			status: "Disbursed",
			accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, "50100488577650")
		},
		{
			id: `PS-${employee?.employeeId || "ETS21206"}-2026-08`,
			month: "August 2026",
			gross: fbGross,
			deductions: fbDed,
			net: fbNet,
			payDate: "Aug 31, 2026",
			status: "Disbursed",
			accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, "50100488577650")
		},
		{
			id: `PS-${employee?.employeeId || "ETS21206"}-2026-07`,
			month: "July 2026",
			gross: fbGross,
			deductions: fbDed,
			net: fbNet,
			payDate: "Jul 31, 2026",
			status: "Disbursed",
			accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, "50100488577650")
		},
		{
			id: `PS-${employee?.employeeId || "ETS21206"}-2026-06`,
			month: "June 2026",
			gross: fbGross,
			deductions: fbDed,
			net: fbNet,
			payDate: "Jun 30, 2026",
			status: "Disbursed",
			accountNumber: unmaskBankAccount(employee?.bankDetails?.accountNumber, "50100488577650")
		}
	];
	const displayList = userPayrollRecords.length > 0 ? userPayrollRecords : fallbackPayslips;
	const handleOpenPayslip = (ps) => {
		const rawAcc = ps.accountNumber || employee?.bankDetails?.accountNumber || "50100488577650";
		const cleanAcc = unmaskBankAccount(rawAcc, "50100488577650");
		if (ps.earningsList || ps.earnings) {
			setSelectedPayslip({
				...ps,
				accountNumber: cleanAcc,
				employeeName: ps.employeeName || employee?.name
			});
			return;
		}
		const basicAmount = Math.round((ps.gross || fbGross) * .5);
		const hraAmount = Math.round((ps.gross || fbGross) * .25);
		const specialAmount = Math.round((ps.gross || fbGross) * .2);
		const conveyanceAmount = (ps.gross || fbGross) - basicAmount - hraAmount - specialAmount;
		const pfAmount = Math.min(1800, Math.round(basicAmount * .12));
		const ptAmount = 200;
		const tdsAmount = Math.max(0, (ps.deductions || fbDed) - pfAmount - ptAmount);
		const synthetic = {
			_id: ps.id || "PS-ESS",
			id: ps.id || "PS-ESS",
			month: ps.month || "October 2026",
			employeeId: employee?.employeeId || user?.employeeId || "ETS21206",
			employeeName: employee?.name || user?.displayName || "Employee",
			department: employee?.department || "Operations",
			designation: employee?.designation || "Pending Designation",
			bankName: employee?.bankDetails?.bankName || "HDFC Bank Limited",
			accountNumber: cleanAcc,
			ifscCode: employee?.bankDetails?.ifscCode || "HDFC0001234",
			panTaxId: employee?.identity?.panNumber || employee?.bankDetails?.panTaxId || "BROPJ5764Q",
			uanNumber: employee?.identity?.uanNumber || employee?.bankDetails?.uanNumber || "101595355837",
			standardDays: 30,
			payableDays: 30,
			lopDays: 0,
			lopReversalDays: 0,
			arrearDays: 0,
			grossEarnings: ps.gross || fbGross,
			totalDeductions: ps.deductions || fbDed,
			netPay: ps.net || fbNet,
			earningsList: [
				{
					name: "Basic Salary",
					monthlyRate: basicAmount,
					currentMonth: basicAmount,
					arrear: 0,
					total: basicAmount
				},
				{
					name: "House Rent Allowance",
					monthlyRate: hraAmount,
					currentMonth: hraAmount,
					arrear: 0,
					total: hraAmount
				},
				{
					name: "Special Allowance",
					monthlyRate: specialAmount,
					currentMonth: specialAmount,
					arrear: 0,
					total: specialAmount
				},
				{
					name: "Conveyance Allowance",
					monthlyRate: conveyanceAmount,
					currentMonth: conveyanceAmount,
					arrear: 0,
					total: conveyanceAmount
				}
			],
			deductionsList: [
				{
					name: "Provident Fund (EPF)",
					amount: pfAmount
				},
				{
					name: "Professional Tax (PT)",
					amount: ptAmount
				},
				{
					name: "TDS / Income Tax",
					amount: tdsAmount
				}
			],
			status: ps.status || "Disbursed"
		};
		setSelectedPayslip(synthetic);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Compensation & Benefits",
				title: "My Salary & Payslips",
				description: "Review your monthly CTC structure, statutory PF/ESI deductions, and download official corporate salary slips.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => handleOpenPayslip(displayList[0]),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 14 }), " View Latest Payslip Voucher"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Annual CTC" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(ctcAnnual) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Gross Cost-to-Company" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#eef2f6",
								color: "var(--blue)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Monthly Gross" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(grossMonthly) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Fixed monthly component" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#fcf0f0",
								color: "#cb3a31"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Monthly Deductions" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(deductionsMonthly) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "PF, PT, TDS & Insurance" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						style: {
							borderColor: "rgba(29, 138, 122, 0.4)",
							background: "#f5fbf9"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "var(--teal)",
								color: "#fff"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Net Take-Home Pay" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "var(--teal)" },
									children: formatINR(netMonthly)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Credited directly to bank A/C" })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "foundation-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Earnings Component"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Monthly Earnings (Gross)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StatusBadge, {
							tone: "success",
							children: [formatINR(grossMonthly), " / mo"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "8px",
							marginTop: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Basic Salary (50%)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(5e4) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "House Rent Allowance (HRA 25%)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(25e3) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Special Allowance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(2e4) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Conveyance Allowance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(5e3) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									padding: "10px 0 0",
									borderTop: "1px solid var(--line)",
									fontWeight: 700
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Monthly Earnings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--teal)" },
									children: formatINR(grossMonthly)
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Statutory & Taxes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Deductions & Retentions" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StatusBadge, {
							tone: "neutral",
							children: [formatINR(deductionsMonthly), " / mo"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "8px",
							marginTop: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Provident Fund (EPF 12% on Basic)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(6e3) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Professional Tax (PT Karnataka)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(200) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Tax Deducted at Source (TDS / Income Tax)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(9600) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									padding: "10px 0 0",
									borderTop: "1px solid var(--line)",
									fontWeight: 700
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Deductions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "#cb3a31" },
									children: formatINR(deductionsMonthly)
								})]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Disbursal Account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Banking & Statutory Identification" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "info",
						children: "Direct Deposit Active"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
						gap: "14px",
						marginTop: "16px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px 14px",
								borderRadius: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									textTransform: "uppercase"
								},
								children: "Bank Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "HDFC Bank Limited"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px 14px",
								borderRadius: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									textTransform: "uppercase"
								},
								children: "Account Number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "•••• •••• •••• 4819"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px 14px",
								borderRadius: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									textTransform: "uppercase"
								},
								children: "IFSC Code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "HDFC0001234"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px 14px",
								borderRadius: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									textTransform: "uppercase"
								},
								children: "Permanent Account No. (PAN)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "ABCDE1234F"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px 14px",
								borderRadius: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted)",
									textTransform: "uppercase"
								},
								children: "Universal Account No. (UAN)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "100987654321"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel-heading",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Disbursals"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Historical Payslips Archive" })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "attendance-cards-mobile",
						style: {
							display: "none",
							gap: "10px",
							marginTop: "14px"
						},
						children: displayList.map((ps) => {
							const gross = ps.grossEarnings || ps.grossSalary || ps.gross || 0;
							const deductions = ps.totalDeductions || ps.deductions || 0;
							const net = ps.netPay || ps.netSalary || ps.net || 0;
							const id = ps._id || ps.id || "PS";
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
											alignItems: "center"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "13px" },
											children: ps.month
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "10px",
												color: "var(--muted)",
												display: "block"
											},
											children: ["Ref: ", id]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											tone: "success",
											children: ps.status || "Disbursed"
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
												children: "Gross"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(gross) })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "var(--muted)",
													display: "block",
													fontSize: "10px"
												},
												children: "Deductions"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "#cb3a31" },
												children: formatINR(deductions)
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "var(--muted)",
													display: "block",
													fontSize: "10px"
												},
												children: "Net Pay"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: { color: "var(--teal)" },
												children: formatINR(net)
											})] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											borderTop: "1px solid var(--line)",
											paddingTop: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "10px",
												color: "var(--muted)"
											},
											children: ["Paid: ", ps.paymentDate || ps.payDate || "On-schedule"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											style: {
												fontSize: "11px",
												padding: "4px 10px"
											},
											onClick: () => handleOpenPayslip(ps),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 12 }), " View Slip"]
										})]
									})
								]
							}, id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "attendance-table-desktop",
						style: {
							marginTop: "16px",
							overflowX: "auto"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "ui-table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Payslip ID" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Month" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Gross Pay" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total Deductions" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Net Disbursed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Payment Date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: displayList.map((ps) => {
								const gross = ps.grossEarnings || ps.grossSalary || ps.gross || 0;
								const deductions = ps.totalDeductions || ps.deductions || 0;
								const net = ps.netPay || ps.netSalary || ps.net || 0;
								const id = ps._id || ps.id || "PS";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: id }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10px",
											color: "var(--teal)",
											display: "block",
											fontWeight: 600
										},
										children: ["A/C: ", unmaskBankAccount(ps.accountNumber || employee?.bankDetails?.accountNumber, "50100488577650")]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ps.month }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatINR(gross) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatINR(deductions) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "var(--teal)" },
										children: formatINR(net)
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: ps.paymentDate || ps.payDate || "On-schedule" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: "success",
										children: ps.status || "Disbursed"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button secondary",
										style: {
											fontSize: "10px",
											padding: "3px 8px"
										},
										onClick: () => handleOpenPayslip(ps),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 11 }), " View Slip"]
									}) })
								] }, id);
							}) })]
						})
					})
				]
			}),
			selectedPayslip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayslipPreviewModal, {
				record: selectedPayslip,
				employee,
				settings: storeState.companySettings,
				onClose: () => setSelectedPayslip(null),
				canEmail: false
			})
		]
	});
}
function ESSTasksView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [activeTab, setActiveTab] = (0, import_react.useState)("all");
	const [reportText, setReportText] = (0, import_react.useState)("");
	const [reportHours, setReportHours] = (0, import_react.useState)("8");
	const [reportNotice, setReportNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const tasks = storeState.tasks || [];
	const filteredTasks = tasks.filter((t) => {
		if (activeTab === "all") return true;
		return t.status === activeTab;
	});
	const handleDailyReportSubmit = workspaceAction(hrStore, async (e) => {
		e.preventDefault();
		if (!reportText.trim()) return;
		await hrStore.submitDailyReport({
			employeeId: user?.employeeId || user?.id || "",
			employeeName: user?.displayName || user?.name || user?.email?.split("@")[0] || "Employee",
			date: todayKey(),
			hoursLogged: reportHours,
			summary: reportText
		});
		setReportNotice("Daily work report logged successfully!");
		setReportText("");
		setTimeout(() => setReportNotice(""), 4e3);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Work & Execution",
				title: "My Tasks & Daily Reports",
				description: "Review assigned sprint tasks, manage delivery progress, and submit daily work accomplishment logs."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					gap: "8px",
					borderBottom: "1px solid var(--line)",
					paddingBottom: "12px"
				},
				children: [
					"all",
					"todo",
					"in_progress",
					"completed"
				].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `ui-button ${activeTab === tab ? "primary" : "secondary"}`,
					style: {
						fontSize: "11px",
						textTransform: "capitalize"
					},
					onClick: () => setActiveTab(tab),
					children: [
						tab.replace("_", " "),
						" (",
						tab === "all" ? tasks.length : tasks.filter((t) => t.status === tab).length,
						")"
					]
				}, tab))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gap: "12px"
					},
					children: filteredTasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							title: "No tasks found",
							message: "You have no deliverables in this category."
						})
					}) : filteredTasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel",
						style: { padding: "18px" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								gap: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "6px",
										alignItems: "center",
										marginBottom: "4px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StatusBadge, {
										tone: task.priority === "High" ? "danger" : task.priority === "Medium" ? "warning" : "neutral",
										children: [task.priority, " Priority"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10px",
											color: "var(--muted)"
										},
										children: ["Due: ", task.dueDate]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: "0 0 6px",
										fontSize: "15px"
									},
									children: task.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: 0,
										fontSize: "12px",
										color: "var(--muted)",
										lineHeight: 1.5
									},
									children: task.category
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								tone: task.status === "completed" ? "success" : task.status === "in_progress" ? "info" : "neutral",
								children: task.status?.replace("_", " ")
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginTop: "14px",
								paddingTop: "12px",
								borderTop: "1px solid var(--line)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted)"
								},
								children: ["Assigned by: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: task.assignedBy })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "6px"
								},
								children: [task.status !== "in_progress" && task.status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button secondary",
									style: {
										fontSize: "10px",
										padding: "3px 8px"
									},
									onClick: workspaceAction(hrStore, () => hrStore.updateTaskStatus(task.id, "in_progress")),
									children: "Start Task"
								}), task.status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button primary",
									style: {
										fontSize: "10px",
										padding: "3px 8px"
									},
									onClick: workspaceAction(hrStore, () => hrStore.updateTaskStatus(task.id, "completed")),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 11 }), " Complete"]
								})]
							})]
						})]
					}, task.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						position: "sticky",
						top: "90px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel-heading",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Standup"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Log Daily Work Report" })] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleDailyReportSubmit,
						style: {
							display: "grid",
							gap: "12px",
							marginTop: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									display: "block",
									marginBottom: "4px"
								},
								children: "Hours Logged Today"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								value: reportHours,
								onChange: (e) => setReportHours(e.target.value),
								style: { width: "100%" },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "4",
										children: "4 Hours (Half Day)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "8",
										children: "8 Hours (Full Shift)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "9",
										children: "9 Hours (Full Shift + Overtime)"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									display: "block",
									marginBottom: "4px"
								},
								children: "Work Done & Key Accomplishments"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "text-input",
								rows: 4,
								value: reportText,
								onChange: (e) => setReportText(e.target.value),
								placeholder: "Outline key deliverables completed today, client deliverables pushed, or any sprint blockers...",
								style: {
									width: "100%",
									fontSize: "12px",
									padding: "8px"
								},
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								style: { width: "100%" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 13 }), " Submit Daily Work Log"]
							}),
							reportNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "11px",
									color: "var(--teal)",
									fontWeight: 600,
									display: "flex",
									alignItems: "center",
									gap: "4px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 12 }),
									" ",
									reportNotice
								]
							})
						]
					})]
				}) })]
			})
		]
	});
}
function ESSExpensesView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [claimCategory, setClaimCategory] = (0, import_react.useState)("Travel & Cab");
	const [claimAmount, setClaimAmount] = (0, import_react.useState)("");
	const [claimMerchant, setClaimMerchant] = (0, import_react.useState)("");
	const [claimDate, setClaimDate] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [claimNotes, setClaimNotes] = (0, import_react.useState)("");
	const [claimAttachment, setClaimAttachment] = (0, import_react.useState)(null);
	const [attachmentError, setAttachmentError] = (0, import_react.useState)("");
	const [previewAttachmentModal, setPreviewAttachmentModal] = (0, import_react.useState)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const [statusTab, setStatusTab] = (0, import_react.useState)("all");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [feedback, setFeedback] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 8388608) {
			setAttachmentError("Attachment size must be under 8MB.");
			return;
		}
		setAttachmentError("");
		const reader = new FileReader();
		reader.onload = () => {
			setClaimAttachment({
				name: file.name,
				type: file.type,
				size: (file.size / 1024).toFixed(1) + " KB",
				url: reader.result
			});
		};
		reader.readAsDataURL(file);
	};
	const myExpenses = (storeState.expenses || []).filter((e) => {
		if (!user) return true;
		if (["admin", "hr"].includes(user.role)) return true;
		return e.ownerId === user.id || e.ownerId === user._id || e.employeeId === user.employeeId || e.employeeId === user.id || e.employeeName === user.displayName || e.employeeName === user.name;
	});
	const filteredExpenses = myExpenses.filter((e) => {
		const s = (e.status || "submitted").toLowerCase();
		if (statusTab === "submitted" && s !== "submitted" && s !== "pending") return false;
		if (statusTab === "approved" && s !== "approved" && s !== "reimbursed") return false;
		if (statusTab === "rejected" && s !== "rejected") return false;
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase();
			const matchMerchant = (e.merchant || "").toLowerCase().includes(q);
			const matchCategory = (e.category || "").toLowerCase().includes(q);
			const matchId = (e.id || "").toLowerCase().includes(q);
			const matchNotes = (e.comments || e.notes || "").toLowerCase().includes(q);
			if (!matchMerchant && !matchCategory && !matchId && !matchNotes) return false;
		}
		return true;
	});
	const totalClaimed = myExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
	const approvedTotal = myExpenses.filter((e) => e.status === "approved" || e.status === "reimbursed").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
	const pendingTotal = myExpenses.filter((e) => e.status === "submitted" || e.status === "pending").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
	const rejectedCount = myExpenses.filter((e) => e.status === "rejected").length;
	const handleClaimSubmit = workspaceAction(hrStore, async (e) => {
		e.preventDefault();
		if (!claimAmount || Number(claimAmount) <= 0) return;
		await hrStore.submitExpense({
			employeeId: user?.employeeId || user?.id || "STAFF",
			employeeName: user?.displayName || user?.name || user?.email?.split("@")[0] || "Employee",
			category: claimCategory,
			amount: Number(claimAmount),
			merchant: claimMerchant.trim(),
			date: claimDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			comments: claimNotes.trim(),
			notes: claimNotes.trim(),
			status: "submitted",
			attachmentUrl: claimAttachment?.url || "",
			attachmentName: claimAttachment?.name || "",
			attachmentType: claimAttachment?.type || "",
			attachmentSize: claimAttachment?.size || ""
		});
		setModalOpen(false);
		setClaimAmount("");
		setClaimMerchant("");
		setClaimNotes("");
		setClaimAttachment(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
		setFeedback("Reimbursement claim submitted successfully with proof attachment! Assigned to finance review queue.");
		setTimeout(() => setFeedback(""), 4500);
	});
	const isAdmin = user?.role === "admin";
	const handleDeleteExpense = workspaceAction(hrStore, async (expenseId) => {
		if (!isAdmin) {
			alert("Only administrators have access to delete expense claims.");
			return;
		}
		if (!window.confirm("Are you sure you want to delete this expense claim record? This action cannot be undone.")) return;
		await hrStore.deleteExpense(expenseId);
		setFeedback("Expense reimbursement claim deleted successfully.");
		setTimeout(() => setFeedback(""), 4e3);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Reimbursements & Claims",
				title: "Expense Claims & Travel",
				description: "Submit and track official reimbursement claims for client visits, hardware accessories, travel, and broadband allowances.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => setModalOpen(true),
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " Submit Expense Claim"]
				})
			}),
			feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Claimed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(totalClaimed) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [myExpenses.length, " total claims filed"] })
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Approved & Reimbursed" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(approvedTotal) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Processed by finance desk" })
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pending Audit" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(pendingTotal) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Awaiting manager/HR review" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#fdf2f2",
								color: "#dc2626"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rejected Claims" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [rejectedCount, " Claims"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Requires clarification" })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					style: {
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Claims Archive"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "My Expense Reimbursements" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								placeholder: "Search merchant, category...",
								value: searchTerm,
								onChange: (e) => setSearchTerm(e.target.value),
								style: {
									width: "190px",
									paddingLeft: "28px",
									fontSize: "11px",
									height: "30px"
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
								onClick: () => setStatusTab(tab.key),
								style: {
									padding: "4px 10px",
									fontSize: "11px",
									fontWeight: 600,
									borderRadius: "6px",
									border: 0,
									cursor: "pointer",
									background: statusTab === tab.key ? "#fff" : "transparent",
									color: statusTab === tab.key ? "var(--teal)" : "var(--muted)",
									boxShadow: statusTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Claim ID" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Merchant" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Amount" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Justification" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Proof Receipt" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "right" },
								children: "Action"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredExpenses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							colSpan: isAdmin ? 9 : 8,
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
									children: "Click \"Submit Expense Claim\" above to log a new reimbursement."
								})
							]
						}) }) : filteredExpenses.map((exp, idx) => {
							const s = (exp.status || "submitted").toLowerCase();
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									style: { color: "var(--teal)" },
									children: ["#", exp.id || `EXP-${idx + 101}`]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: exp.date ? new Date(exp.date).toLocaleDateString() : "Recent" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "role-badge",
									style: { fontSize: "9.5px" },
									children: exp.category || "General"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "var(--ink)" },
									children: exp.merchant || "Merchant"
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "13px",
										color: "var(--ink)"
									},
									children: formatINR(exp.amount)
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										maxWidth: "200px",
										whiteSpace: "nowrap",
										overflow: "hidden",
										textOverflow: "ellipsis"
									},
									title: exp.comments || exp.notes,
									children: exp.comments || exp.notes || "No description provided"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: exp.attachmentUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setPreviewAttachmentModal(exp),
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: s === "approved" || s === "reimbursed" ? "success" : s === "rejected" ? "danger" : "warning",
									children: s === "submitted" ? "pending review" : s
								}) }),
								isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: { textAlign: "right" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "icon-button",
										onClick: () => handleDeleteExpense(exp.id),
										title: "Delete Claim",
										style: {
											color: "var(--coral)",
											background: "rgba(220, 38, 38, 0.08)",
											borderRadius: "6px",
											padding: "4px 7px",
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
							] }, exp.id || idx);
						}) })]
					})
				})]
			}),
			modalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setModalOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: {
						maxWidth: "540px",
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
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "File Expense Claim"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: "Submit an official reimbursement claim with proof bill or receipt"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setModalOpen(false),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleClaimSubmit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										color: "var(--ink)",
										display: "block",
										marginBottom: "6px"
									},
									children: "Expense Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select-control",
									style: {
										width: "100%",
										height: "42px",
										borderRadius: "10px"
									},
									value: claimCategory,
									onChange: (e) => setClaimCategory(e.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Travel & Cab",
											children: "🚕 Travel & Cab / Fuel"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Client Hospitality",
											children: "🍽️ Client Hospitality & Meals"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Tech Peripherals",
											children: "💻 Tech Peripherals & Hardware"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Books & Learning",
											children: "📚 Books & Professional Certification"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Internet / Phone",
											children: "📶 Home Office Internet / Phone"
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
											children: "Claim Amount (₹)"
										}), claimAmount && Number(claimAmount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10.5px",
												fontWeight: 700,
												color: "var(--teal)"
											},
											children: formatINR(Number(claimAmount))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										step: "0.01",
										className: "text-input",
										placeholder: "e.g. 1850",
										value: claimAmount,
										onChange: (e) => setClaimAmount(e.target.value),
										required: true
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11.5px",
											fontWeight: 600,
											color: "var(--ink)",
											display: "block",
											marginBottom: "6px"
										},
										children: "Expense Date"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "date",
										className: "text-input",
										value: claimDate,
										onChange: (e) => setClaimDate(e.target.value),
										required: true
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
									children: "Merchant / Vendor Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g., Uber India, Amazon, Chroma Electronics...",
									value: claimMerchant,
									onChange: (e) => setClaimMerchant(e.target.value),
									required: true
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
										children: "Business Justification"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											color: "var(--muted)"
										},
										children: claimNotes.length > 0 ? `${claimNotes.length} characters` : "Reason for expense"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "text-input",
									rows: 3,
									placeholder: "Explain the purpose of the business expenditure (e.g. Travel to client site for deployment demo)...",
									value: claimNotes,
									onChange: (e) => setClaimNotes(e.target.value),
									style: {
										width: "100%",
										minHeight: "70px",
										maxHeight: "140px",
										resize: "vertical",
										fontSize: "12.5px"
									},
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
											children: "Proof / Receipt Attachment"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "var(--muted)"
											},
											children: "Bill, receipt or invoice (JPG, PNG, PDF up to 8MB)"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: fileInputRef,
										type: "file",
										accept: "image/png,image/jpeg,image/webp,application/pdf",
										onChange: handleFileChange,
										style: { display: "none" },
										id: "employee-claim-file-upload"
									}),
									claimAttachment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											padding: "10px 14px",
											background: "#f8fafc",
											border: "1px solid #e2e8f0",
											borderRadius: "10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "10px",
												overflow: "hidden"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													width: "32px",
													height: "32px",
													borderRadius: "6px",
													background: "#eaf4f1",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													color: "var(--teal)",
													flexShrink: 0
												},
												children: claimAttachment.type?.includes("pdf") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { size: 18 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { size: 18 })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: { overflow: "hidden" },
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													style: {
														fontSize: "12px",
														display: "block",
														textOverflow: "ellipsis",
														overflow: "hidden",
														whiteSpace: "nowrap",
														maxWidth: "240px",
														color: "var(--ink)"
													},
													children: claimAttachment.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10.5px",
														color: "var(--muted)"
													},
													children: claimAttachment.size
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												setClaimAttachment(null);
												if (fileInputRef.current) fileInputRef.current.value = "";
											},
											style: {
												border: 0,
												background: "transparent",
												color: "#dc2626",
												cursor: "pointer",
												fontSize: "11.5px",
												fontWeight: 600,
												padding: "4px 8px"
											},
											children: "Remove"
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										htmlFor: "employee-claim-file-upload",
										style: {
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											justifyContent: "center",
											padding: "16px",
											border: "2px dashed #cbd5e1",
											borderRadius: "10px",
											cursor: "pointer",
											background: "#f8fafc",
											transition: "border-color 0.2s",
											textAlign: "center",
											gap: "4px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
												size: 20,
												style: {
													color: "var(--teal)",
													marginBottom: "2px"
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "12px",
													fontWeight: 600,
													color: "var(--ink)"
												},
												children: "Click to upload bill / receipt"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10.5px",
													color: "var(--muted)"
												},
												children: "Supports PNG, JPG, JPEG, WEBP or PDF"
											})
										]
									}),
									attachmentError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											color: "#dc2626",
											fontSize: "11px",
											display: "block",
											marginTop: "4px"
										},
										children: attachmentError
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px",
										padding: "10px 14px",
										background: "#F0F9F8",
										border: "1px solid #D1EBE9",
										borderRadius: "10px",
										fontSize: "11.5px",
										color: "var(--teal)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {
										size: 15,
										style: { flexShrink: 0 }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Receipt proof will be verified by HR and Accounts before reimbursement is disbursed." })]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setModalOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: !claimAmount || Number(claimAmount) <= 0 || !claimMerchant.trim(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { size: 13 }), " Submit Claim"]
							})]
						})]
					})]
				})
			}),
			previewAttachmentModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setPreviewAttachmentModal(null),
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
									children: ["Proof of Expense: ", previewAttachmentModal.merchant || previewAttachmentModal.category]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "modal-subtitle-text",
									children: [
										"Amount: ",
										formatINR(previewAttachmentModal.amount),
										" • Date: ",
										previewAttachmentModal.date ? new Date(previewAttachmentModal.date).toLocaleDateString() : "Recent"
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setPreviewAttachmentModal(null),
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
										previewAttachmentModal.attachmentName || "Receipt Document",
										previewAttachmentModal.attachmentSize && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												color: "var(--muted)",
												marginLeft: "6px"
											},
											children: [
												"(",
												previewAttachmentModal.attachmentSize,
												")"
											]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: previewAttachmentModal.attachmentUrl,
										download: previewAttachmentModal.attachmentName || "expense_receipt",
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
									children: previewAttachmentModal.attachmentType?.includes("pdf") || previewAttachmentModal.attachmentUrl?.startsWith("data:application/pdf") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
										src: previewAttachmentModal.attachmentUrl,
										title: "Receipt PDF",
										style: {
											width: "100%",
											height: "480px",
											border: 0,
											borderRadius: "6px"
										}
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: previewAttachmentModal.attachmentUrl,
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
								previewAttachmentModal.comments && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
										children: "Justification"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: previewAttachmentModal.comments || previewAttachmentModal.notes })]
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
								onClick: () => setPreviewAttachmentModal(null),
								children: "Close"
							})
						})
					]
				})
			})
		]
	});
}
function ESSDocumentsView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const employee = findEmployeeForUser(storeState.employees, user);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyDocumentsView, {
		user,
		employee
	});
}
function ESSAnnouncementsView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const announcements = storeState.announcements || [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Company Newsfeed",
			title: "Announcements & Bulletins",
			description: "Stay informed with executive updates, festival schedules, product milestones, and internal events."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "grid",
				gap: "16px"
			},
			children: announcements.map((ann) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				style: { padding: "20px" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "8px",
								alignItems: "center",
								marginBottom: "6px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: ann.priority === "urgent" ? "danger" : "info",
									children: ann.category || "Company"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "11px",
										color: "var(--muted)"
									},
									children: ann.date
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "11px",
										color: "var(--muted)"
									},
									children: ["• By ", ann.author || "HR Operations"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								margin: "0 0 10px",
								fontSize: "17px"
							},
							children: ann.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: 0,
								fontSize: "13px",
								color: "var(--ink)",
								lineHeight: 1.6
							},
							children: ann.content
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "announcement-like-btn",
						style: {
							padding: "6px 12px",
							fontSize: "12px"
						},
						onClick: workspaceAction(hrStore, () => hrStore.likeAnnouncement(ann.id)),
						title: "Cheer announcement",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
							size: 14,
							fill: ann.likes > 0 ? "#e05345" : "none",
							color: ann.likes > 0 ? "#e05345" : "currentColor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [ann.likes || 0, " Likes"] })]
					})]
				})
			}, ann.id))
		})]
	});
}
function ESSProfileView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [profileTab, setProfileTab] = (0, import_react.useState)("personal");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe(setStoreState);
	}, []);
	const employee = (0, import_react.useMemo)(() => {
		const list = storeState.employees || [];
		return list.find((e) => String(e.id || e._id || e.employeeId) === String(user?.employeeId || user?._id || user?.id)) || list.find((e) => e.email?.toLowerCase() === user?.email?.toLowerCase()) || user || {};
	}, [storeState.employees, user]);
	const bank = employee?.bankDetails || {};
	const identity = employee?.identity || {};
	const emergency = employee?.emergencyContact || {};
	const parents = employee?.parentsContact || {};
	const isVerified = employee?.onboardingStatus === "verified";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Identity & Records",
				title: "My Employee Profile",
				description: "Manage your verified personal details, organizational hierarchy, bank information, and statutory credentials."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				style: {
					padding: "20px",
					display: "flex",
					alignItems: "center",
					gap: "16px",
					flexWrap: "wrap"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "profile-avatar-box",
						children: [user?.avatarUrl || employee?.avatarUrl || employee?.onboardingDocs?.passportPhoto?.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: user?.avatarUrl || employee?.avatarUrl || employee?.onboardingDocs?.passportPhoto?.url,
							alt: employee?.name || user?.displayName || "User",
							className: "user-profile-img lg",
							style: {
								width: "60px",
								height: "60px",
								borderRadius: "50%",
								objectFit: "cover",
								border: "2px solid var(--teal)"
							},
							onError: (e) => {
								e.currentTarget.style.display = "none";
								if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "grid";
							}
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "avatar avatar-teal",
							style: {
								width: "60px",
								height: "60px",
								fontSize: "18px",
								display: user?.avatarUrl || employee?.avatarUrl || employee?.onboardingDocs?.passportPhoto?.url ? "none" : "grid",
								borderRadius: "50%"
							},
							children: (employee?.name || user?.displayName || user?.name || user?.email?.split("@")[0] || "EM").slice(0, 2).toUpperCase()
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							flex: 1,
							minWidth: "200px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									style: {
										margin: 0,
										fontSize: "18px",
										letterSpacing: "-0.3px"
									},
									children: employee?.name || user?.displayName || user?.name || user?.email?.split("@")[0] || "Employee"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: "success",
									children: "Active ESS"
								}),
								isVerified ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "10px",
										background: "#dcfce7",
										color: "#15803d",
										padding: "2px 8px",
										borderRadius: "12px",
										fontWeight: 600,
										border: "1px solid #86efac",
										display: "inline-flex",
										alignItems: "center",
										gap: "4px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 12 }), " Verified by HR"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										background: "#fef3c7",
										color: "#b45309",
										padding: "2px 8px",
										borderRadius: "12px",
										fontWeight: 600,
										border: "1px solid #fde68a"
									},
									children: "Onboarding Pending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "role-badge",
									style: { fontSize: "9px" },
									children: employee?.employeeId || user?.employeeId || "ETS21206"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								margin: "4px 0 0",
								color: "var(--muted)",
								fontSize: "12px"
							},
							children: [
								employee?.designation || user?.designation || "Pending Designation",
								" • ",
								employee?.department || user?.department || "Operations"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							textAlign: "right",
							fontSize: "12px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									display: "block"
								},
								children: "Annual CTC Compensation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								style: {
									fontSize: "16px",
									color: "var(--teal)"
								},
								children: ["₹", formatINR(employee?.salary || 12e5)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								style: {
									color: "var(--muted)",
									display: "block",
									fontSize: "10px"
								},
								children: "Linked to Monthly Payslips"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "subnav-tabs",
				style: { overflowX: "auto" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${profileTab === "personal" ? "active" : ""}`,
						onClick: () => setProfileTab("personal"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Personal Info" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${profileTab === "employment" ? "active" : ""}`,
						onClick: () => setProfileTab("employment"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employment Record" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${profileTab === "verification" ? "active" : ""}`,
						onClick: () => setProfileTab("verification"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verification" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${profileTab === "onboarding" ? "active" : ""}`,
						onClick: () => setProfileTab("onboarding"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Documents & Dossier" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${profileTab === "bank" ? "active" : ""}`,
						onClick: () => setProfileTab("bank"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Banking & Statutory" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: `subnav-tab ${profileTab === "emergency" ? "active" : ""}`,
						onClick: () => setProfileTab("emergency"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Emergency Contacts" })]
					})
				]
			}),
			profileTab === "personal" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Personal Dossier"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Personal Information" })] }), isVerified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "success",
						children: "Verified"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "warning",
						children: "Pending Verification"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: "8px",
						marginTop: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Full Legal Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.name || user?.name || user?.displayName || user?.email?.split("@")[0] || "Employee" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Work Email Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.email || user?.email || "-" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.phone || "+91 98765 43210" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date of Birth" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.dob ? new Date(employee.dob).toLocaleDateString("en-GB", {
								day: "numeric",
								month: "short",
								year: "numeric"
							}) : identity.dob ? new Date(identity.dob).toLocaleDateString("en-GB", {
								day: "numeric",
								month: "short",
								year: "numeric"
							}) : "Not provided" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Residential Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parents.address || employee?.address || "#42, 4th Cross, Indiranagar, Bengaluru, KA 560038" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Father's Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parents.fatherName || "Not recorded" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mother's Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parents.motherName || "Not recorded" })]
						})
					]
				})]
			}),
			profileTab === "employment" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Job Profile"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Employment Record" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						tone: "info",
						children: "Active"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: "8px",
						marginTop: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.employeeId || user?.employeeId || "ETS21206" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Designation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.designation || user?.designation || "Pending Designation" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.department || user?.department || "Design & User Experience" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reporting Manager" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.managerName || "Operations Executive" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Joining Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString("en-GB") : "01 February 2024" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Work Location" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: employee?.location || "Bengaluru HQ" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employment Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { textTransform: "capitalize" },
								children: employee?.employmentType?.replace("_", " ") || "Full time"
							})]
						})
					]
				})]
			}),
			profileTab === "verification" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "panel",
				style: { padding: "20px" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingDossierView, {
					employee,
					canEdit: true,
					canVerify: false,
					initialTab: "verification"
				})
			}),
			profileTab === "onboarding" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "panel",
				style: { padding: "20px" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingDossierView, {
					employee,
					canEdit: true,
					canVerify: false
				})
			}),
			profileTab === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Banking & Tax"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Official Remittance Account & Statutory Identifiers" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "var(--teal)",
								background: "rgba(0, 110, 111, 0.08)",
								padding: "3px 8px",
								borderRadius: "10px",
								fontWeight: 600
							},
							children: "⚡ Auto-linked to Monthly Payslip"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "8px",
							marginTop: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: bank.bankName || "HDFC Bank Limited" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank Account No. (Visible)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontFamily: "monospace",
										letterSpacing: "0.5px",
										color: "var(--teal)",
										fontSize: "13px"
									},
									children: unmaskBankAccount(bank.accountNumber, "50100488577650")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bank IFSC Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { fontFamily: "monospace" },
									children: bank.ifscCode || "HDFC0001234"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Permanent Account Number (PAN)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { fontFamily: "monospace" },
									children: identity.panNumber || bank.panTaxId || "BROPJ5764Q"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Universal Account Number (PF UAN)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { fontFamily: "monospace" },
									children: identity.uanNumber || bank.uanNumber || "101595355837"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "profile-detail-row",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aadhaar Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { fontFamily: "monospace" },
									children: identity.aadharNumber || "•••• •••• 9821"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: "16px",
							padding: "12px 14px",
							background: "#f8fafc",
							border: "1px solid var(--line)",
							borderRadius: "8px",
							fontSize: "12px",
							color: "var(--muted)"
						},
						children: [
							"ℹ ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "HR & Admin Note:" }),
							" Banking credentials above are automatically pulled whenever official payslips are generated. If updates are required, update your details in the Onboarding tab or request an adjustment from HR."
						]
					})
				]
			}),
			profileTab === "emergency" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "panel-heading",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Safety & Next of Kin"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Emergency Contacts" })] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gap: "8px",
						marginTop: "14px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Primary Contact Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emergency.name || "Elena Rivera" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Relationship" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emergency.relationship || "Spouse" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact Number" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: emergency.phone || "+91 98765 11223" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "profile-detail-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Parents Phone Contact" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parents.parentPhone || parents.phone || "+91 98450 99887" })]
						})
					]
				})]
			})
		]
	});
}
function ESSTeamView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const allEmployees = storeState.employees || [];
	const currentEmp = allEmployees.find((e) => e.id === user?.id || e._id === user?.id || e.employeeId === user?.employeeId || user?.email && e.email && e.email.toLowerCase() === user.email.toLowerCase());
	const userTeams = hrStore.getTeams().filter((t) => t.managerId === currentEmp?.id || t.managerName?.toLowerCase() === currentEmp?.name?.toLowerCase() || t.teamLeadId === currentEmp?.id || t.teamLeadName?.toLowerCase() === currentEmp?.name?.toLowerCase());
	const teamMembers = (0, import_react.useMemo)(() => {
		if (!currentEmp) return [];
		if ([
			"director",
			"managing_director",
			"admin",
			"hr",
			"co_founder",
			"vertical_head"
		].includes(currentEmp.role)) return allEmployees.filter((e) => e.id !== currentEmp.id && e.role !== "admin");
		if (currentEmp.role === "manager") {
			const teamNames = new Set(userTeams.map((t) => t.name.toLowerCase()));
			const teamIds = new Set(userTeams.map((t) => t.id));
			return allEmployees.filter((e) => {
				if (e.id === currentEmp.id) return false;
				if (e.managerId === currentEmp.id) return true;
				if (e.team && (teamNames.has(e.team.toLowerCase()) || teamIds.has(e.teamId))) return true;
				return false;
			});
		}
		if (currentEmp.role === "team_lead" || currentEmp.role === "team_leader" || /lead|leader|tl/i.test(currentEmp.role) || /team\s*lead|team\s*leader|\btl\b/i.test(currentEmp.designation)) {
			const myTeam = userTeams[0] || hrStore.getTeam(currentEmp.teamId || currentEmp.team);
			return allEmployees.filter((e) => {
				if (e.id === currentEmp.id) return false;
				if (e.teamLeadId === currentEmp.id) return true;
				if (myTeam && (e.teamId === myTeam.id || e.team && e.team.toLowerCase() === myTeam.name.toLowerCase())) return true;
				return false;
			});
		}
		if (currentEmp.team) return allEmployees.filter((e) => e.id !== currentEmp.id && e.team && e.team.toLowerCase() === currentEmp.team.toLowerCase());
		return [];
	}, [
		allEmployees,
		currentEmp,
		userTeams
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Leadership Controls",
			title: "My Team Roster",
			description: "Direct reports overview, real-time daily attendance, shift logs, and team leave approvals.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "#/employee/team-leave",
				className: "ui-button primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { size: 14 }), " Review Team Leave Requests"]
			})
		}), teamMembers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No Team Members Assigned Yet",
			message: "Your team does not have any direct reporting members assigned yet. Administrators can assign employees through the Employee Management directory."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
				gap: "14px"
			},
			children: teamMembers.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel",
				style: { padding: "18px" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "12px",
							alignItems: "center",
							marginBottom: "12px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "avatar avatar-teal",
							style: {
								width: "42px",
								height: "42px",
								fontSize: "14px"
							},
							children: (m.displayName || m.name || "?").slice(0, 2).toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { fontSize: "14px" },
							children: m.displayName || m.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								fontSize: "11px",
								color: "var(--muted)"
							},
							children: [
								m.designation || m.role,
								" • ",
								m.department,
								m.team && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										marginLeft: "6px",
										color: "#7e22ce",
										fontWeight: 600
									},
									children: [
										"(",
										m.team,
										")"
									]
								})
							]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "6px",
							fontSize: "11px",
							background: "#faf9f5",
							padding: "10px",
							borderRadius: "6px",
							marginBottom: "12px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Code:" }),
								" ",
								m.employeeId || m.id
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Email:" }),
								" ",
								m.email || "—"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Phone:" }),
								" ",
								m.phone || "—"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									marginTop: "4px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: m.status === "active" ? "var(--teal)" : "#cb3a31" },
									children: m.status === "active" ? "Active" : m.status
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end",
							gap: "6px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#/employee/team-leave",
							className: "ui-button secondary",
							style: {
								fontSize: "10px",
								padding: "3px 8px"
							},
							children: "View Leave Requests"
						})
					})
				]
			}, m.id || m.employeeId))
		})]
	});
}
function ESSDailyReportView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [reportDate, setReportDate] = (0, import_react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
	const [hours, setHours] = (0, import_react.useState)("8");
	const [accomplishments, setAccomplishments] = (0, import_react.useState)("");
	const [challenges, setChallenges] = (0, import_react.useState)("");
	const [tomorrowPlan, setTomorrowPlan] = (0, import_react.useState)("");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const empId = user?.employeeId || user?.id || "STAFF";
	const myReports = (storeState.dailyReports || []).filter((r) => {
		if (!user) return true;
		if (["admin", "hr"].includes(user.role)) return true;
		return r.ownerId === user.id || r.ownerId === user._id || r.employeeId === empId || r.employeeId === user?.id || r.employeeName === user?.displayName || r.employeeName === user?.name;
	});
	const filteredReports = myReports.filter((r) => {
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase();
			const matchSummary = (r.tasksSummary || r.summary || "").toLowerCase().includes(q);
			const matchChallenges = (r.challenges || "").toLowerCase().includes(q);
			const matchDate = (r.date || "").toLowerCase().includes(q);
			const matchPlan = (r.tomorrowPlan || "").toLowerCase().includes(q);
			if (!matchSummary && !matchChallenges && !matchDate && !matchPlan) return false;
		}
		return true;
	});
	const totalHours = myReports.reduce((sum, r) => sum + (Number(r.hoursLogged) || 0), 0);
	const avgHours = myReports.length > 0 ? (totalHours / myReports.length).toFixed(1) : "0.0";
	const blockersCount = myReports.filter((r) => r.challenges && r.challenges.toLowerCase() !== "none" && r.challenges.trim()).length;
	const handleSubmit = workspaceAction(hrStore, async (e) => {
		e.preventDefault();
		if (!accomplishments.trim()) return;
		await hrStore.submitDailyReport({
			employeeId: empId,
			employeeName: user?.displayName || user?.name || user?.email?.split("@")[0] || "Employee",
			date: reportDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			hoursLogged: Number(hours) || 8,
			summary: accomplishments.trim(),
			tasksSummary: accomplishments.trim(),
			challenges: challenges.trim() || "None",
			tomorrowPlan: tomorrowPlan.trim()
		});
		setAccomplishments("");
		setChallenges("");
		setTomorrowPlan("");
		setNotice("Daily work report logged and submitted to manager review queue!");
		setTimeout(() => setNotice(""), 4500);
	});
	const handleDeleteReport = workspaceAction(hrStore, async (reportId) => {
		if (!window.confirm("Are you sure you want to delete this daily work report entry? This cannot be undone.")) return;
		await hrStore.deleteDailyReport(reportId);
		setNotice("Daily work report record deleted successfully.");
		setTimeout(() => setNotice(""), 4e3);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Work Logs & Standup",
				title: "Daily Work Report",
				description: "Submit your daily deliverables, time allocation, blockers, and tomorrow's delivery plan for team review."
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
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reports Logged" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [myReports.length, " Reports"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Active standup history" })
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Hours Logged" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [totalHours, " hrs"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Cumulated project effort" })
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Average Shift Pace" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [avgHours, " hrs/day"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Standard workday average" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: blockersCount > 0 ? "#fdf2f2" : "#eaf4f1",
								color: blockersCount > 0 ? "#dc2626" : "var(--teal)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Blockers / Roadblocks" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [blockersCount, " Logged"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: blockersCount > 0 ? "Requires attention" : "Smooth progress" })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Today's Entry"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Log Daily Work Summary" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "var(--teal)",
								fontWeight: 600,
								background: "var(--soft-teal)",
								padding: "2px 8px",
								borderRadius: "4px"
							},
							children: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						style: {
							display: "grid",
							gap: "14px",
							marginTop: "16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "form-row-2col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										display: "block",
										marginBottom: "6px",
										color: "var(--ink)"
									},
									children: "Work Date"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "date",
									className: "text-input",
									value: reportDate,
									onChange: (e) => setReportDate(e.target.value),
									style: { width: "100%" },
									required: true
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										display: "block",
										marginBottom: "6px",
										color: "var(--ink)"
									},
									children: "Hours Spent Today"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select-control",
									value: hours,
									onChange: (e) => setHours(e.target.value),
									style: {
										width: "100%",
										height: "42px",
										borderRadius: "10px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "4",
											children: "4 Hours (Half Day Shift)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "8",
											children: "8 Hours (Full Standard Shift)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "9",
											children: "9 Hours (Full Shift + 1h Overtime)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "10",
											children: "10 Hours (Extended Delivery)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "12",
											children: "12 Hours (Sprint Critical Delivery)"
										})
									]
								})] })]
							}),
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
									children: "Key Deliverables & Accomplishments"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										color: "var(--muted)"
									},
									children: accomplishments.length > 0 ? `${accomplishments.length} characters` : "Required"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "text-input",
								rows: 4,
								value: accomplishments,
								onChange: (e) => setAccomplishments(e.target.value),
								placeholder: "What did you complete today?\n• Built and audited navigation routes\n• Resolved QA tickets #412 and #418\n• Pushed pull request for team review...",
								style: {
									width: "100%",
									minHeight: "96px",
									maxHeight: "180px",
									resize: "vertical",
									fontSize: "12.5px",
									lineHeight: "1.45"
								},
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: {
									fontSize: "11.5px",
									fontWeight: 600,
									display: "block",
									marginBottom: "6px",
									color: "var(--ink)"
								},
								children: ["Challenges & Roadblocks ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontWeight: 400,
										color: "var(--muted)",
										fontSize: "10px"
									},
									children: "(Optional)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								className: "text-input",
								value: challenges,
								onChange: (e) => setChallenges(e.target.value),
								placeholder: "Any dependencies, blocked API endpoints, or waiting on reviews?",
								style: { width: "100%" }
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								style: {
									fontSize: "11.5px",
									fontWeight: 600,
									display: "block",
									marginBottom: "6px",
									color: "var(--ink)"
								},
								children: ["Tomorrow's Delivery Plan ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontWeight: 400,
										color: "var(--muted)",
										fontSize: "10px"
									},
									children: "(Optional)"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								className: "text-input",
								value: tomorrowPlan,
								onChange: (e) => setTomorrowPlan(e.target.value),
								placeholder: "Top goals planned for next business day...",
								style: { width: "100%" }
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: !accomplishments.trim(),
								style: { marginTop: "4px" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 13 }), " Submit Daily Work Report"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						style: {
							flexWrap: "wrap",
							gap: "8px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "History"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Previous Work Reports" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								placeholder: "Search history...",
								value: searchTerm,
								onChange: (e) => setSearchTerm(e.target.value),
								style: {
									width: "160px",
									paddingLeft: "28px",
									fontSize: "11px",
									height: "30px"
								}
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: "12px",
							marginTop: "14px",
							maxHeight: "580px",
							overflowY: "auto",
							paddingRight: "4px"
						},
						children: filteredReports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								textAlign: "center",
								padding: "36px 16px",
								color: "var(--muted)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									size: 26,
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
									children: "No work reports found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { fontSize: "11.5px" },
									children: "Submit today's summary using the form on the left."
								})
							]
						}) : filteredReports.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#FCFDFD",
								border: "1px solid var(--line)",
								borderLeft: "3.5px solid var(--teal)",
								borderRadius: "10px",
								padding: "14px",
								fontSize: "11.5px",
								boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "12px",
												color: "var(--ink)"
											},
											children: r.date ? new Date(r.date).toLocaleDateString(void 0, {
												weekday: "short",
												month: "short",
												day: "numeric",
												year: "numeric"
											}) : "Recent"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "role-badge",
											style: {
												fontSize: "9.5px",
												background: "var(--soft-teal)",
												color: "var(--teal)",
												fontWeight: 700
											},
											children: [r.hoursLogged || 8, " hrs logged"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "icon-button",
										onClick: () => handleDeleteReport(r.id || r._id),
										title: "Delete Report Entry",
										style: {
											color: "var(--coral)",
											background: "rgba(220, 38, 38, 0.08)",
											borderRadius: "6px",
											padding: "3px 6px",
											border: 0,
											cursor: "pointer",
											display: "inline-flex",
											alignItems: "center",
											gap: "3px",
											fontSize: "10.5px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Delete" })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									style: {
										margin: "0 0 8px",
										color: "var(--ink)",
										lineHeight: 1.5,
										whiteSpace: "pre-wrap"
									},
									children: r.tasksSummary || r.summary
								}),
								r.challenges && r.challenges.toLowerCase() !== "none" && r.challenges.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "6px 10px",
										background: "#fef3e2",
										border: "1px solid #fbd38d",
										borderRadius: "6px",
										color: "#b45309",
										marginBottom: "6px",
										fontSize: "11px",
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
										size: 13,
										style: { flexShrink: 0 }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Blocker:" }),
										" ",
										r.challenges
									] })]
								}),
								r.tomorrowPlan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										padding: "6px 10px",
										background: "#f0f9f8",
										border: "1px solid #d1ebe9",
										borderRadius: "6px",
										color: "var(--teal)",
										fontSize: "11px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tomorrow's Plan:" }),
										" ",
										r.tomorrowPlan
									]
								})
							]
						}, r.id || r._id || i))
					})]
				})]
			})
		]
	});
}
function ESSTrainingView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const courses = storeState.courses ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Learning & Development",
				title: "Training & Certifications Portal",
				description: "Enroll in published courses and report your learning progress. Completion is self-reported, not a verified assessment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
					gap: "14px"
				},
				children: courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						padding: "18px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: {
									fontSize: "9px",
									background: "#f5f8f7",
									color: "var(--teal)"
								},
								children: c.category || "Skill"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "9px",
									color: "var(--muted)"
								},
								children: c.duration
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: "0 0 6px",
								fontSize: "14px"
							},
							children: c.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								margin: "10px 0 4px",
								display: "flex",
								justifyContent: "space-between",
								fontSize: "10px",
								color: "var(--muted)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Progress" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [c.progress, "%"] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "ess-progress-bar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ess-progress-fill",
								style: { width: `${c.progress}%` }
							})
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginTop: "16px",
							paddingTop: "10px",
							borderTop: "1px solid var(--line)"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: c.url,
								target: "_blank",
								rel: "noopener noreferrer",
								children: "Open course"
							}),
							!c.enrolled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: workspaceAction(hrStore, () => hrStore.enrollCourse(c.id)),
								children: "Enroll"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								"aria-label": `Progress for ${c.title}`,
								value: c.progress,
								onChange: workspaceAction(hrStore, (event) => hrStore.updateCourseProgress(c.id, Number(event.target.value))),
								children: [
									0,
									25,
									50,
									75,
									100
								].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value,
									children: [value, "% self-reported"]
								}, value))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: c.completed ? "var(--teal)" : "var(--muted)",
									fontWeight: 600
								},
								children: c.status
							})
						]
					})]
				}, c.id))
			}),
			courses.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No training courses have been published." })
		]
	});
}
function ESSHelpDeskView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [selectedTicket, setSelectedTicket] = (0, import_react.useState)(null);
	const [employeeReply, setEmployeeReply] = (0, import_react.useState)("");
	const [ticketSubject, setTicketSubject] = (0, import_react.useState)("");
	const [ticketCat, setTicketCat] = (0, import_react.useState)("IT Support");
	const [ticketPriority, setTicketPriority] = (0, import_react.useState)("Medium");
	const [ticketDesc, setTicketDesc] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [statusTab, setStatusTab] = (0, import_react.useState)("all");
	const [ticketViewTab, setTicketViewTab] = (0, import_react.useState)("all");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [resolvingTicket, setResolvingTicket] = (0, import_react.useState)(null);
	const [resolutionNotes, setResolutionNotes] = (0, import_react.useState)("");
	const [isResolving, setIsResolving] = (0, import_react.useState)(false);
	const [isSubmittingTicket, setIsSubmittingTicket] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => {
			setStoreState(state);
			if (selectedTicket) {
				const targetId = selectedTicket.id || selectedTicket._id;
				const updated = (state.tickets || []).find((t) => t.id === targetId || t._id === targetId);
				if (updated) setSelectedTicket(updated);
			}
		});
	}, [selectedTicket]);
	const uId = String(user?.id || "");
	const uMongoId = String(user?._id || "");
	const uEmp = String(user?.employeeId || "").toUpperCase();
	const uEmail = String(user?.email || "").trim().toLowerCase();
	const uName = String(user?.displayName || user?.name || "").trim().toLowerCase();
	const isTicketAssignedToMe = (t) => {
		if (!user || !t) return false;
		return Boolean(t.assignedToId && [
			uId,
			uMongoId,
			uEmp
		].filter(Boolean).includes(String(t.assignedToId).toUpperCase()) || t.assignedToEmail && uEmail && String(t.assignedToEmail).trim().toLowerCase() === uEmail || t.assignedToName && uName && String(t.assignedToName).trim().toLowerCase() === uName || t.assignedTo && uName && String(t.assignedTo).trim().toLowerCase() === uName || t.assignedTo && uEmp && String(t.assignedTo).toUpperCase() === uEmp);
	};
	const isTicketCreatedByMe = (t) => {
		if (!user || !t) return false;
		return Boolean(t.ownerId && [uId, uMongoId].includes(String(t.ownerId)) || t.employeeId && uEmp && String(t.employeeId).toUpperCase() === uEmp || t.employeeName && uName && String(t.employeeName).trim().toLowerCase() === uName);
	};
	const hd = storeState.companySettings?.helpDeskSettings || {};
	const isItSpecialist = Boolean(uEmail === "itsupport@edufyitech.in" || user?.role === "it" || user?.department && /it|tech|support/i.test(user.department) || hd.itSupportEmployeeId && [
		uId,
		uMongoId,
		uEmp
	].includes(String(hd.itSupportEmployeeId).toUpperCase()) || hd.itSupportEmployeeEmail && uEmail && String(hd.itSupportEmployeeEmail).trim().toLowerCase() === uEmail || hd.itSupportEmail && uEmail && String(hd.itSupportEmail).trim().toLowerCase() === uEmail);
	const isGeneralSpecialist = Boolean(uEmail === "admin@edufyitech.in" || uEmail === "hr@edufyitech.in" || user?.department && /hr/i.test(user.department) || hd.generalSupportEmployeeId && [
		uId,
		uMongoId,
		uEmp
	].includes(String(hd.generalSupportEmployeeId).toUpperCase()) || hd.generalSupportEmployeeEmail && uEmail && String(hd.generalSupportEmployeeEmail).trim().toLowerCase() === uEmail || hd.generalSupportEmail && uEmail && String(hd.generalSupportEmail).trim().toLowerCase() === uEmail);
	const myTickets = (storeState.tickets || []).filter((t) => {
		if (!user) return true;
		if (["admin", "hr"].includes(user.role)) return true;
		const isOwner = isTicketCreatedByMe(t);
		const isAssigned = isTicketAssignedToMe(t);
		const isSpecialistForTicket = isItSpecialist && /it/i.test(t.category || "") || isGeneralSpecialist && !/it/i.test(t.category || "");
		return isOwner || isAssigned || isSpecialistForTicket;
	});
	const filteredTickets = myTickets.filter((t) => {
		if (ticketViewTab === "assigned" && !isTicketAssignedToMe(t)) return false;
		if (ticketViewTab === "created" && !isTicketCreatedByMe(t)) return false;
		const s = (t.status || "open").toLowerCase();
		if (statusTab === "open" && s !== "open") return false;
		if (statusTab === "in_progress" && s !== "in_progress") return false;
		if (statusTab === "resolved" && s !== "resolved" && s !== "closed") return false;
		if (searchTerm.trim()) {
			const q = searchTerm.toLowerCase();
			const matchSubject = (t.subject || "").toLowerCase().includes(q);
			const matchId = (t.id || "").toLowerCase().includes(q);
			const matchCat = (t.category || "").toLowerCase().includes(q);
			if (!matchSubject && !matchId && !matchCat) return false;
		}
		return true;
	});
	const openCount = myTickets.filter((t) => (t.status || "open").toLowerCase() === "open").length;
	const inProgressCount = myTickets.filter((t) => (t.status || "").toLowerCase() === "in_progress").length;
	const resolvedCount = myTickets.filter((t) => (t.status || "").toLowerCase() === "resolved" || (t.status || "").toLowerCase() === "closed").length;
	const totalAssignedCount = myTickets.filter(isTicketAssignedToMe).length;
	const totalCreatedCount = myTickets.filter(isTicketCreatedByMe).length;
	const handleCreateTicket = workspaceAction(hrStore, async (e) => {
		e.preventDefault();
		if (isSubmittingTicket) return;
		if (!ticketSubject.trim() || !ticketDesc.trim()) return;
		setIsSubmittingTicket(true);
		try {
			await hrStore.createTicket({
				employeeId: user?.employeeId || user?.id || "STAFF",
				employeeName: user?.displayName || user?.name || user?.email?.split("@")[0] || "Employee",
				subject: ticketSubject.trim(),
				category: ticketCat,
				priority: ticketPriority,
				description: ticketDesc.trim(),
				status: "open",
				createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
			});
			setModalOpen(false);
			setTicketSubject("");
			setTicketDesc("");
			setTicketPriority("Medium");
			setNotice("Help desk ticket submitted successfully! The support team has been assigned.");
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			setNotice(err?.message || "Failed to submit ticket. Please try again.");
			setTimeout(() => setNotice(""), 4500);
		} finally {
			setIsSubmittingTicket(false);
		}
	});
	const handleSendEmployeeReply = workspaceAction(hrStore, async () => {
		if (!employeeReply.trim() || !selectedTicket) return;
		const tId = selectedTicket.id || selectedTicket._id;
		await hrStore.replyToTicket(tId, employeeReply.trim(), user?.displayName || user?.name || "Employee");
		setEmployeeReply("");
		setNotice("Your message has been posted to the ticket thread.");
		setTimeout(() => setNotice(""), 4e3);
	});
	const handleResolveSubmit = async (e) => {
		e?.preventDefault?.();
		if (!resolvingTicket) return;
		setIsResolving(true);
		try {
			const ticketId = resolvingTicket.id || resolvingTicket._id;
			await hrStore.updateTicketStatus(ticketId, "resolved", resolutionNotes.trim());
			setNotice("Ticket resolved and resolution notes emailed to requester!");
			setTimeout(() => setNotice(""), 4500);
			setResolvingTicket(null);
			setResolutionNotes("");
		} catch (err) {
			setNotice("Error resolving ticket: " + (err.message || "Unknown error"));
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
		setNotice(`Ticket assigned to you (${payload.assignedToName}).`);
		setTimeout(() => setNotice(""), 3500);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Support & Ticketing",
				title: "Employee Help Desk",
				description: "Submit support requests for IT hardware, HR inquiries, payroll clarifications, and workplace facilities.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => setModalOpen(true),
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: "6px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }), " Raise Support Ticket"]
				})
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
					gap: "14px"
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
							children: "My Tickets"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: 0,
								fontSize: "22px",
								fontWeight: 700,
								color: "var(--ink)"
							},
							children: myTickets.length
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
							children: "Awaiting Support"
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					style: {
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "My Inquiries"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Support Tickets Track Record" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							flexWrap: "wrap"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "3px",
									background: "#f1f5f9",
									padding: "3px",
									borderRadius: "8px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setTicketViewTab("all"),
										style: {
											padding: "4px 9px",
											fontSize: "11px",
											fontWeight: 600,
											borderRadius: "6px",
											border: 0,
											cursor: "pointer",
											background: ticketViewTab === "all" ? "#fff" : "transparent",
											color: ticketViewTab === "all" ? "var(--teal)" : "var(--muted)",
											boxShadow: ticketViewTab === "all" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
										},
										children: [
											"All (",
											myTickets.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setTicketViewTab("assigned"),
										style: {
											padding: "4px 9px",
											fontSize: "11px",
											fontWeight: 600,
											borderRadius: "6px",
											border: 0,
											cursor: "pointer",
											background: ticketViewTab === "assigned" ? "#2563eb" : "transparent",
											color: ticketViewTab === "assigned" ? "#fff" : totalAssignedCount > 0 ? "#1d4ed8" : "var(--muted)",
											boxShadow: ticketViewTab === "assigned" ? "0 1px 3px rgba(37,99,235,0.25)" : "none",
											display: "flex",
											alignItems: "center",
											gap: "4px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned to Me" }), totalAssignedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "9px",
												background: ticketViewTab === "assigned" ? "rgba(255,255,255,0.3)" : "#dbeafe",
												color: ticketViewTab === "assigned" ? "#fff" : "#1e40af",
												padding: "1px 5px",
												borderRadius: "10px",
												fontWeight: 700
											},
											children: totalAssignedCount
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setTicketViewTab("created"),
										style: {
											padding: "4px 9px",
											fontSize: "11px",
											fontWeight: 600,
											borderRadius: "6px",
											border: 0,
											cursor: "pointer",
											background: ticketViewTab === "created" ? "#fff" : "transparent",
											color: ticketViewTab === "created" ? "var(--teal)" : "var(--muted)",
											boxShadow: ticketViewTab === "created" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
										},
										children: [
											"Raised by Me (",
											totalCreatedCount,
											")"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
									placeholder: "Search tickets...",
									value: searchTerm,
									onChange: (e) => setSearchTerm(e.target.value),
									style: {
										width: "150px",
										paddingLeft: "28px",
										fontSize: "11px",
										height: "30px"
									}
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									gap: "3px",
									background: "#f1f5f9",
									padding: "3px",
									borderRadius: "8px"
								},
								children: [
									"all",
									"open",
									"in_progress",
									"resolved"
								].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setStatusTab(tab),
									style: {
										padding: "4px 8px",
										fontSize: "11px",
										fontWeight: 600,
										borderRadius: "6px",
										border: 0,
										cursor: "pointer",
										background: statusTab === tab ? "#fff" : "transparent",
										color: statusTab === tab ? "var(--teal)" : "var(--muted)",
										boxShadow: statusTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
										textTransform: "capitalize"
									},
									children: tab.replace("_", " ")
								}, tab))
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "16px",
						overflowX: "auto"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Ticket ID" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Subject" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Priority" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Created Date" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "right" },
								children: "Action"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredTickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							colSpan: 7,
							style: {
								textAlign: "center",
								padding: "36px",
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
									children: "No support tickets found"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { fontSize: "11.5px" },
									children: "Click \"Raise Support Ticket\" to submit a new inquiry."
								})
							]
						}) }) : filteredTickets.map((t, idx) => {
							const p = (t.priority || "Medium").toLowerCase();
							const s = (t.status || "open").toLowerCase();
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								onClick: () => setSelectedTicket(t),
								style: {
									cursor: "pointer",
									transition: "background 0.15s ease"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										style: { color: "var(--teal)" },
										children: ["#", t.id || `TCK-${idx + 101}`]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontWeight: 600,
											color: "var(--ink)"
										},
										children: t.subject || t.title
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											flexDirection: "column",
											gap: "3px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "role-badge",
											style: { fontSize: "9.5px" },
											children: t.category || "General"
										}), isTicketAssignedToMe(t) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "8.5px",
												background: "#dbeafe",
												color: "#1e40af",
												padding: "1px 5px",
												borderRadius: "4px",
												fontWeight: 700,
												width: "fit-content"
											},
											children: "Assigned to You"
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "9.5px",
											fontWeight: 700,
											textTransform: "uppercase",
											padding: "2px 7px",
											borderRadius: "4px",
											background: p === "urgent" || p === "high" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
											color: p === "urgent" || p === "high" ? "#dc2626" : "#d97706"
										},
										children: t.priority || "Medium"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Recent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: s === "resolved" || s === "closed" ? "success" : s === "in_progress" ? "info" : "warning",
										children: s.replace("_", " ")
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { textAlign: "right" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "secondary",
											onClick: (e) => {
												e.stopPropagation();
												setSelectedTicket(t);
											},
											style: {
												padding: "3px 8px",
												fontSize: "11px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 12 }), " View Thread"]
										})
									})
								]
							}, t.id || idx);
						}) })]
					})
				})]
			}),
			selectedTicket && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setSelectedTicket(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: {
						maxWidth: "620px",
						width: "94%"
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
										background: "linear-gradient(135deg, #E1F1F0 0%, #CEEAE8 100%)",
										color: "var(--teal)"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { size: 20 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "11px",
											color: "var(--muted)",
											fontWeight: 700
										},
										children: ["#", selectedTicket.id || "TCK"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: (selectedTicket.status || "").toLowerCase() === "resolved" || (selectedTicket.status || "").toLowerCase() === "closed" ? "success" : (selectedTicket.status || "").toLowerCase() === "in_progress" ? "info" : "warning",
										children: (selectedTicket.status || "open").replace("_", " ")
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "modal-title-text",
									style: {
										fontSize: "16px",
										marginTop: "2px"
									},
									children: selectedTicket.subject
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setSelectedTicket(null),
								"aria-label": "Close modal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							style: {
								maxHeight: "68vh",
								overflowY: "auto"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(3, 1fr)",
										gap: "10px",
										background: "#F8FAF9",
										padding: "12px 14px",
										borderRadius: "12px",
										fontSize: "11.5px",
										border: "1px solid var(--line)"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												fontSize: "9.5px",
												textTransform: "uppercase",
												fontWeight: 600,
												display: "block",
												marginBottom: "2px"
											},
											children: "Category"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "var(--ink)" },
											children: selectedTicket.category || "General"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												fontSize: "9.5px",
												textTransform: "uppercase",
												fontWeight: 600,
												display: "block",
												marginBottom: "2px"
											},
											children: "Priority"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: (selectedTicket.priority || "").toLowerCase() === "urgent" ? "#dc2626" : (selectedTicket.priority || "").toLowerCase() === "high" ? "#ea580c" : "var(--ink)" },
											children: selectedTicket.priority || "Medium"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												color: "var(--muted)",
												fontSize: "9.5px",
												textTransform: "uppercase",
												fontWeight: 600,
												display: "block",
												marginBottom: "2px"
											},
											children: "Logged Date"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "var(--ink)" },
											children: selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : "Recent"
										})] })
									]
								}),
								user && (["admin", "hr"].includes(user.role) || isTicketAssignedToMe(selectedTicket) || isItSpecialist && /it/i.test(selectedTicket.category || "") || isGeneralSpecialist && !/it/i.test(selectedTicket.category || "")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										background: "#f0fdf4",
										border: "1px solid #bbf7d0",
										padding: "8px 12px",
										borderRadius: "8px",
										flexWrap: "wrap",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "11px",
											color: "#166534",
											fontWeight: 600
										},
										children: "Specialist Resolution Controls:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "6px",
											flexWrap: "wrap",
											alignItems: "center"
										},
										children: [
											!isTicketAssignedToMe(selectedTicket) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button secondary",
												onClick: () => handleAssignToMe(selectedTicket),
												style: {
													padding: "3px 8px",
													fontSize: "11px",
													background: "#eff6ff",
													borderColor: "#bfdbfe",
													color: "#1d4ed8"
												},
												children: "🙋 Assign to Me"
											}),
											selectedTicket.status !== "in_progress" && selectedTicket.status !== "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button secondary",
												onClick: async () => {
													const tId = selectedTicket.id || selectedTicket._id;
													await hrStore.updateTicketStatus(tId, "in_progress");
													setNotice("Ticket marked as In Progress.");
													setTimeout(() => setNotice(""), 3e3);
												},
												style: {
													padding: "3px 8px",
													fontSize: "11px"
												},
												children: "Mark In Progress"
											}),
											selectedTicket.status !== "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button primary",
												onClick: () => {
													setResolvingTicket(selectedTicket);
													setResolutionNotes("");
												},
												style: {
													padding: "3px 8px",
													fontSize: "11px",
													background: "#16a34a",
													borderColor: "#16a34a"
												},
												children: "Resolve Ticket"
											}),
											selectedTicket.status === "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "ui-button secondary",
												onClick: async () => {
													const tId = selectedTicket.id || selectedTicket._id;
													await hrStore.updateTicketStatus(tId, "open");
													setNotice("Ticket reopened.");
													setTimeout(() => setNotice(""), 3e3);
												},
												style: {
													padding: "3px 8px",
													fontSize: "11px"
												},
												children: "Reopen Ticket"
											})
										]
									})]
								}),
								selectedTicket.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: "#FCFDFD",
										border: "1px solid var(--line)",
										borderLeft: "3.5px solid var(--teal)",
										padding: "12px 14px",
										borderRadius: "10px",
										fontSize: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											fontWeight: 700,
											textTransform: "uppercase",
											color: "var(--teal)",
											display: "block",
											marginBottom: "4px",
											letterSpacing: "0.04em"
										},
										children: "Initial Inquiry Summary"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: {
											margin: 0,
											color: "var(--ink)",
											lineHeight: 1.55,
											whiteSpace: "pre-wrap"
										},
										children: selectedTicket.description
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										style: {
											fontSize: "12px",
											color: "var(--ink)"
										},
										children: [
											"Official Conversation Thread (",
											Array.isArray(selectedTicket.responses) ? selectedTicket.responses.length : 0,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)"
										},
										children: "Official support audit"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "grid",
										gap: "8px",
										maxHeight: "200px",
										overflowY: "auto",
										paddingRight: "4px"
									},
									children: !Array.isArray(selectedTicket.responses) || selectedTicket.responses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											padding: "16px",
											background: "#fafaf9",
											border: "1px dashed var(--line)",
											borderRadius: "10px",
											textAlign: "center",
											color: "var(--muted)",
											fontSize: "11.5px"
										},
										children: "Awaiting response from Support Team. Responses will appear here."
									}) : selectedTicket.responses.map((resp, i) => {
										const isSupport = resp.sender?.toLowerCase().includes("it") || resp.sender?.toLowerCase().includes("hr") || resp.sender?.toLowerCase().includes("support") || resp.sender?.toLowerCase().includes("admin");
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												background: isSupport ? "#f0f9f8" : "#f8fafc",
												border: "1px solid var(--line)",
												borderLeft: isSupport ? "3.5px solid var(--teal)" : "3.5px solid #64748b",
												padding: "10px 12px",
												borderRadius: "8px",
												fontSize: "11.5px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													marginBottom: "3px"
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
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										borderTop: "1px solid var(--line)",
										paddingTop: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11.5px",
											fontWeight: 600,
											color: "var(--ink)",
											display: "block",
											marginBottom: "6px"
										},
										children: "Send Message to Support Desk"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											rows: 2,
											className: "text-input",
											style: {
												width: "100%",
												padding: "10px 12px",
												fontSize: "12px",
												resize: "vertical",
												minHeight: "64px"
											},
											placeholder: "Provide additional details or reply to support team...",
											value: employeeReply,
											onChange: (e) => setEmployeeReply(e.target.value)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												display: "flex",
												justifyContent: "flex-end",
												gap: "8px"
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												onClick: handleSendEmployeeReply,
												disabled: !employeeReply.trim(),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 13 }), " Send Reply"]
											})
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "modal-footer-premium",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setSelectedTicket(null),
								children: "Close"
							})
						})
					]
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
								children: "Specialist Resolution"
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
			}),
			modalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setModalOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: {
						maxWidth: "540px",
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
								children: "Raise Support Ticket"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: "Submit an inquiry to IT, HR, Payroll, or Workplace teams"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setModalOpen(false),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateTicket,
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
										children: "Ticket Subject"
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
									placeholder: "Brief summary of inquiry (e.g. VPN Disconnected / Salary Query)...",
									value: ticketSubject,
									onChange: (e) => setTicketSubject(e.target.value),
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
										value: ticketCat,
										onChange: (e) => setTicketCat(e.target.value),
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
												children: "🏢 Workplace & Desk"
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
										value: ticketPriority,
										onChange: (e) => setTicketPriority(e.target.value),
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
										children: "Issue Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											color: "var(--muted)"
										},
										children: ticketDesc.length > 0 ? `${ticketDesc.length} characters` : "Provide complete context"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "text-input",
									rows: 4,
									placeholder: "Provide complete details to help support resolve quickly:\n• What problem are you experiencing?\n• Steps to reproduce or affected equipment...",
									value: ticketDesc,
									onChange: (e) => setTicketDesc(e.target.value),
									style: {
										width: "100%",
										minHeight: "96px",
										maxHeight: "180px",
										resize: "vertical",
										fontSize: "12.5px",
										lineHeight: "1.45"
									},
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px",
										padding: "10px 14px",
										background: "#F0F9F8",
										border: "1px solid #D1EBE9",
										borderRadius: "10px",
										fontSize: "11.5px",
										color: "var(--teal)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, {
										size: 15,
										style: { flexShrink: 0 }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Our dedicated support desk reviews new inquiries during operating hours. Tickets are tracked with full audit history." })]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => !isSubmittingTicket && setModalOpen(false),
								disabled: isSubmittingTicket,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: isSubmittingTicket || !ticketSubject.trim() || !ticketDesc.trim(),
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
			})
		]
	});
}
function ESSHolidaysView() {
	const { user } = useAuth();
	const canManage = Boolean(user && (user.role === "admin" || user.role === "hr" || user.role === "operations_executive"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: "Company Schedule",
			title: "Holiday Calendar (2026)",
			description: "Official company holiday schedule with published flyers, national observances, and festival calendar gallery."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HolidayCalendarShowcase, {
			canManage,
			user
		})]
	});
}
function ESSRewardsView({ user }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [recipient, setRecipient] = (0, import_react.useState)("");
	const [tag, setTag] = (0, import_react.useState)("Team Collaboration");
	const [kudosNote, setKudosNote] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const kudos = storeState.kudos || [];
	const handleSendKudos = workspaceAction(hrStore, async (e) => {
		e.preventDefault();
		if (!kudosNote.trim()) return;
		await hrStore.sendKudos({
			fromName: user?.displayName || user?.name || user?.email?.split("@")[0] || "Employee",
			recipientId: recipient,
			tag,
			message: kudosNote.trim(),
			date: "Just now"
		});
		setModalOpen(false);
		setKudosNote("");
		setNotice(`Kudos sent to ${recipient}!`);
		setTimeout(() => setNotice(""), 4e3);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Culture & Badges",
				title: "Rewards & Recognition",
				description: "Send and view saved peer recognition. Points and leaderboards are not configured.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => setModalOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { size: 14 }), " Send Peer Kudos"]
				})
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 14px",
					background: "#eaf4f1",
					color: "var(--teal)",
					border: "1px solid #c7ded7",
					borderRadius: "8px",
					fontSize: "12px",
					fontWeight: 600
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					size: 13,
					style: {
						display: "inline",
						marginRight: "6px"
					}
				}), notice]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "metric-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#fbf3e6",
								color: "#b97926"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recognition Points" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Not configured" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "No points program configured" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#f5fbf9",
								color: "var(--teal)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Badges Earned" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [new Set(kudos.filter((k) => k.recipientId === user?.id).map((k) => k.badge)).size, " Badges"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "From received recognition" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#eef2f6",
								color: "var(--blue)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kudos Received" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [kudos.filter((k) => k.recipientId === user?.id).length, " Kudos"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Recorded peer recognition" })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#f6eff7",
								color: "#88438e"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Company Rank" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Not configured" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "No leaderboard configured" })
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "panel-heading",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Peer Recognition"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Company Kudos Wall" })] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
						gap: "14px",
						marginTop: "16px"
					},
					children: kudos.map((k, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#faf9f5",
							border: "1px solid var(--line)",
							borderRadius: "8px",
							padding: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginBottom: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "role-badge",
									style: {
										fontSize: "9px",
										background: "#fff",
										color: "var(--teal)"
									},
									children: k.tag || "Excellence"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										color: "var(--muted)"
									},
									children: k.date
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								style: {
									margin: "0 0 10px",
									fontSize: "12px",
									color: "var(--ink)",
									lineHeight: 1.5
								},
								children: [
									"\"",
									k.message,
									"\""
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "11px",
									color: "var(--muted)",
									borderTop: "1px solid var(--line)",
									paddingTop: "6px"
								},
								children: [
									"From ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: k.fromName || "Colleague" }),
									" to ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: k.toName || "Team Member" })
								]
							})
						]
					}, idx))
				})]
			}),
			modalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setModalOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "440px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							borderBottom: "1px solid var(--line)",
							paddingBottom: "10px",
							marginBottom: "14px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: 0,
								fontSize: "16px"
							},
							children: "Send Peer Recognition"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setModalOpen(false),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSendKudos,
						style: {
							display: "grid",
							gap: "12px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									display: "block",
									marginBottom: "4px"
								},
								children: "Select Colleague"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								style: { width: "100%" },
								value: recipient,
								onChange: (e) => setRecipient(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Select colleague"
								}), (storeState.workspacePeople ?? []).filter((person) => person.id !== user?.id).map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: person.id,
									children: person.name
								}, person.id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									display: "block",
									marginBottom: "4px"
								},
								children: "Recognition Core Value"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								style: { width: "100%" },
								value: tag,
								onChange: (e) => setTag(e.target.value),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Team Collaboration",
										children: "Team Collaboration & Support"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Product Excellence",
										children: "Product Excellence & Craft"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Customer Obsession",
										children: "Customer Empathy & Delivery"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Innovation & Speed",
										children: "Innovation & Speed"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									fontSize: "11px",
									fontWeight: 600,
									display: "block",
									marginBottom: "4px"
								},
								children: "Appreciation Message"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "text-input",
								rows: 3,
								placeholder: "Share what makes this person's contribution remarkable...",
								value: kudosNote,
								onChange: (e) => setKudosNote(e.target.value),
								style: {
									width: "100%",
									padding: "8px",
									fontSize: "12px"
								},
								required: true
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: "8px",
									marginTop: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									onClick: () => setModalOpen(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { size: 13 }), " Send Kudos"]
								})]
							})
						]
					})]
				})
			})
		]
	});
}
function ESSNotificationsView() {
	const { user } = useAuth();
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [filterType, setFilterType] = (0, import_react.useState)("all");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState(state));
	}, []);
	const filteredNotifs = (hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : storeState.notifications || []).filter((n) => {
		if (filterType === "all") return true;
		return n.type === filterType;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Communications",
				title: "Notifications Center",
				description: "Stay updated with leave approvals, monthly salary credits, company broadcasts, and organizational alerts.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button secondary",
					onClick: workspaceAction(hrStore, () => hrStore.markAllNotificationsRead()),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }), " Mark All as Read"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					gap: "8px",
					borderBottom: "1px solid var(--line)",
					paddingBottom: "10px"
				},
				children: [
					"all",
					"leave",
					"salary",
					"announcement",
					"system"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `ui-button ${filterType === t ? "primary" : "secondary"}`,
					style: {
						fontSize: "11px",
						textTransform: "capitalize"
					},
					onClick: () => setFilterType(t),
					children: t
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "grid",
					gap: "10px"
				},
				children: filteredNotifs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "panel",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No notifications",
						message: "You have no notifications in this category."
					})
				}) : filteredNotifs.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					style: {
						padding: "16px 20px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						background: n.read ? "#ffffff" : "#f5fbf9",
						borderColor: n.read ? "var(--line)" : "rgba(29, 138, 122, 0.3)"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "8px",
							alignItems: "center",
							marginBottom: "4px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: {
									fontSize: "9px",
									textTransform: "capitalize"
								},
								children: n.type || "Notice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: { fontSize: "13px" },
								children: n.title
							}),
							!n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
								width: "6px",
								height: "6px",
								borderRadius: "50%",
								background: "var(--teal)"
							} })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: 0,
							fontSize: "12px",
							color: "var(--muted)"
						},
						children: n.message
					})] }), !n.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-button",
						onClick: workspaceAction(hrStore, () => hrStore.markNotificationRead(n.id)),
						title: "Mark as read",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 })
					})]
				}, n.id))
			})
		]
	});
}
function EmployeeDashboardPage({ route }) {
	const { user } = useAuth();
	const p = route?.path || "/employee";
	if (p === "/employee/attendance") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSAttendanceView, { user });
	if (p === "/employee/salary") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSSalaryView, { user });
	if (p === "/employee/tasks") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSTasksView, { user });
	if (p === "/employee/daily-report") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSDailyReportView, { user });
	if (p === "/employee/training") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSTrainingView, { user });
	if (p === "/employee/helpdesk") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSHelpDeskView, { user });
	if (p === "/employee/holidays") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSHolidaysView, {});
	if (p === "/employee/rewards") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSRewardsView, { user });
	if (p === "/employee/notifications") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSNotificationsView, {});
	if (p === "/employee/expenses") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSExpensesView, { user });
	if (p === "/employee/performance") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PerformanceWorkspace, {});
	if (p === "/employee/documents") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSDocumentsView, { user });
	if (p === "/employee/policies" || p.includes("policies")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanyPoliciesView, {});
	if (p === "/employee/announcements") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSAnnouncementsView, { user });
	if (p === "/employee/profile") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSProfileView, { user });
	if (p === "/employee/my-team") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSTeamView, { user });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ESSOverview, { user });
}
function AccessDeniedPage({ title, message }) {
	const { user, logout } = useAuth();
	const defaultTitle = user?.role === "hr" ? "Administrator Privileges Required" : "Access Restricted";
	const defaultMessage = user?.role === "hr" ? `Signed in as ${user?.displayName || "HR Lead"} (HR Operations). HR accounts do not have administrative privileges and cannot access System Administration modules.` : `Hello ${user?.displayName || "User"}, your account does not have permission to view this module.`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel access-denied-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "access-denied-icon",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { size: 34 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: title || defaultTitle }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message || defaultMessage }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "access-denied-user-info",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Authenticated Session" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						user?.displayName || "User",
						" (",
						getRoleBadgeLabel(user?.role),
						")"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: user?.email })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "access-denied-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: () => {
						window.location.hash = user?.role === "employee" ? "#/employee" : "#/hr";
					},
					children: ["Return to ", user?.role === "employee" ? "My ESS Dashboard" : "HR Portal"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: logout,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 14 }), " Sign Out & Switch Account"]
				})]
			})
		]
	});
}
export { AccessDeniedPage, EmployeeDashboardPage };
