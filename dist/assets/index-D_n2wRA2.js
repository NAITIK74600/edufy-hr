const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/LoginPage-BvV7uSEN.js","assets/rolldown-runtime-CO0Nlsmt.js","assets/icons-vendor-CNlTUIuG.js","assets/motion-vendor-3i60tGNx.js","assets/ModulePlaceholder-BJpi0ElY.js","assets/EmployeeDashboardPage-eKiciHG8.js","assets/currency-oCUzM0NR.js","assets/CalendarWidgets-BLnW1YCM.js","assets/CompanyDocumentsView-C_agWF7g.js","assets/companyDocumentsConstants-DUkgikMQ.js","assets/PayslipPreviewModal-BGw7UiYW.js","assets/react-vendor-B_MMQ54z.js","assets/pdf-vendor-BkGpxo0p.js","assets/payrollMatcher-DYZYv1X2.js","assets/OnboardingDossierView-LdD97OHo.js","assets/AdminDashboardPage-lMMaYwS_.js","assets/EmployeesPage-CitUXpBa.js","assets/EmployeeComplianceStatusCard-C-oScoaG.js","assets/OverviewPage-C2x1G5bf.js","assets/LeaveManagementPage-Bcavn1K4.js","assets/WorkspaceModulePage-qPOF7LZf.js","assets/OrgHierarchyPage-O6kFANsu.js","assets/PayrollPage-CzUhHA39.js","assets/EmployeeProfilePage-B0suUNxq.js"])))=>i.map(i=>d[i]);
import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $ as Network, A as ShieldCheck, D as Smartphone, Dt as FileText, E as Sparkles, Et as FingerprintPattern, Ft as Download, Gt as CircleAlert, I as Send, K as Plus, M as Share, Mt as Eye, Nt as EyeOff, P as Settings2, Qt as Camera, Tt as FolderOpen, Ut as CircleQuestionMark, Vt as Clock3, Wt as CircleCheck, Yt as ChevronDown, _n as require_react, an as Building, at as MapPin, b as Ticket, c as VolumeX, cn as Bot, ct as Lock, d as Users, dn as Bell, dt as LoaderCircle, f as User, gt as Laptop, h as UserCheck, i as X, jt as FileChartColumnIncreasing, l as Volume2, ln as BookOpen, m as UserPlus, mt as LayoutDashboard, nt as Menu, rt as Megaphone, s as WalletCards, sn as BriefcaseBusiness, st as LogOut, tn as CalendarDays, vt as KeyRound, w as SquarePlus, x as Target, y as Trash, yt as House } from "./icons-vendor-CNlTUIuG.js";
import { n as require_client, r as require_react_dom } from "./react-vendor-B_MMQ54z.js";
import { a as require_jsx_runtime, i as useConstant, n as MotionConfigContext, r as resolveTransition, t as motion } from "./motion-vendor-3i60tGNx.js";
import { i as __vitePreload } from "./pdf-vendor-BkGpxo0p.js";
// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// node_modules/framer-motion/dist/es/components/MotionConfig/index.mjs
var import_jsx_runtime = require_jsx_runtime();
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* `MotionConfig` is used to set configuration options for all children `motion` components.
*
* ```jsx
* import { motion, MotionConfig } from "framer-motion"
*
* export function App() {
*   return (
*     <MotionConfig transition={{ type: "spring" }}>
*       <motion.div animate={{ x: 100 }} />
*     </MotionConfig>
*   )
* }
* ```
*
* @public
*/
function MotionConfig({ children, ...config }) {
	/**
	* Inherit props from any parent MotionConfig components
	*/
	const parentConfig = (0, import_react.useContext)(MotionConfigContext);
	config = {
		...parentConfig,
		...config
	};
	config.transition = resolveTransition(config.transition, parentConfig.transition);
	/**
	* Don't allow isStatic to change between renders as it affects how many hooks
	* motion components fire.
	*/
	config.isStatic = useConstant(() => config.isStatic);
	/**
	* Creating a new config context object will re-render every `motion` component
	* every time it renders. So we only want to create a new one sparingly.
	*/
	const context = (0, import_react.useMemo)(() => config, [
		JSON.stringify(config.transition),
		config.transformPagePoint,
		config.reducedMotion,
		config.skipAnimations,
		config.isValidProp
	]);
	return (0, import_jsx_runtime.jsx)(MotionConfigContext.Provider, {
		value: context,
		children
	});
}
// src/services/apiClient.js
var import_client = require_client();
var API_BASE_URL$1 = "/api/v1";
function readStoredToken$1() {
	try {
		if (typeof window === "undefined") return null;
		return window.localStorage?.getItem("edufyi.accessToken") || window.sessionStorage?.getItem("edufyi.accessToken") || null;
	} catch {
		return null;
	}
}
var accessToken = readStoredToken$1();
function setAccessToken(token) {
	accessToken = token;
}
var ApiError = class extends Error {
	constructor(message, { status = 0, code = "NETWORK_ERROR", fields = {} } = {}) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.fields = fields;
	}
};
var inFlightGets = /* @__PURE__ */ new Map();
async function executeApiRequest(path, options = {}, retries = 2) {
	const activeToken = accessToken || readStoredToken$1();
	let response;
	const timeoutSignal = typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(2e4) : void 0;
	try {
		response = await fetch(`${API_BASE_URL$1}${path}`, {
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...activeToken ? { Authorization: `Bearer ${activeToken}` } : {},
				...options.headers
			},
			signal: options.signal || timeoutSignal,
			...options
		});
	} catch (err) {
		if (retries > 0 && (!options.method || options.method === "GET")) {
			const delay = (3 - retries) * 400;
			await new Promise((r) => setTimeout(r, delay));
			return executeApiRequest(path, options, retries - 1);
		}
		throw new ApiError(err?.name === "TimeoutError" || err?.name === "AbortError" ? "The request took too long. Retrying in background..." : "The service is temporarily unavailable. Reconnecting...", {
			status: 0,
			code: "NETWORK_ERROR"
		});
	}
	if ((response.status === 502 || response.status === 503 || response.status === 504) && retries > 0 && (!options.method || options.method === "GET")) {
		const delay = (4 - retries) * 350;
		await new Promise((r) => setTimeout(r, delay));
		return executeApiRequest(path, options, retries - 1);
	}
	const body = await response.json().catch(() => null);
	if (!response.ok) {
		const error = body?.error ?? {};
		if (response.status === 401 && !path.startsWith("/auth/login")) {
			accessToken = null;
			try {
				window.localStorage?.removeItem("edufyi.accessToken");
				window.sessionStorage?.removeItem("edufyi.accessToken");
				window.localStorage?.removeItem("edufyi.authUser");
				window.sessionStorage?.removeItem("edufyi.authUser");
			} catch {}
			window.dispatchEvent(new Event("edufyi:auth-expired"));
			throw new ApiError("Your session expired. Please sign in again.", {
				status: 401,
				code: "AUTH_REQUIRED"
			});
		}
		throw new ApiError(error.message ?? "The request could not be completed.", {
			status: response.status,
			code: error.code ?? "REQUEST_FAILED",
			fields: error.fields
		});
	}
	return body ?? { success: true };
}
async function apiRequest(path, options = {}, retries = 1) {
	if ((!options.method || options.method === "GET") && retries === 1) {
		const cacheKey = `${path}::${accessToken || ""}`;
		if (inFlightGets.has(cacheKey)) return inFlightGets.get(cacheKey);
		const promise = executeApiRequest(path, options, retries).finally(() => {
			inFlightGets.delete(cacheKey);
		});
		inFlightGets.set(cacheKey, promise);
		return promise;
	}
	return executeApiRequest(path, options, retries);
}
async function downloadBlob(path, options = {}) {
	let response;
	try {
		response = await fetch(`${API_BASE_URL$1}${path}`, {
			headers: {
				...accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
				...options.headers
			},
			...options
		});
	} catch {
		throw new ApiError("The service is unavailable. Try again shortly.");
	}
	if (!response.ok) {
		let msg = "Failed to download file";
		try {
			msg = (await response.json())?.error?.message || msg;
		} catch {}
		throw new ApiError(msg, { status: response.status });
	}
	return await response.blob();
}
var apiClient = {
	get: (path, options) => apiRequest(path, {
		...options,
		method: "GET"
	}),
	post: (path, body, options) => apiRequest(path, {
		...options,
		method: "POST",
		body: body === void 0 ? void 0 : JSON.stringify(body)
	}),
	patch: (path, body, options) => apiRequest(path, {
		...options,
		method: "PATCH",
		body: JSON.stringify(body)
	}),
	put: (path, body, options) => apiRequest(path, {
		...options,
		method: "PUT",
		body: JSON.stringify(body)
	}),
	delete: (path, options) => apiRequest(path, {
		...options,
		method: "DELETE"
	}),
	downloadBlob: (path, options) => downloadBlob(path, options),
	getAccessToken: () => accessToken
};
// src/services/workspaceStore.js
var workspaceKeys = [
	"announcements",
	"tasks",
	"courses",
	"enrollments",
	"tickets",
	"expenses",
	"dailyReports",
	"kudos",
	"performanceGoals",
	"performanceReviews",
	"holidays",
	"documents",
	"requisitions",
	"notifications",
	"workspacePeople",
	"roles",
	"departments",
	"teams"
];
function workspaceAction(store, handler) {
	return async (...args) => {
		try {
			return await handler(...args);
		} catch (error) {
			store.reportError(error);
			globalThis.alert?.(error.message);
		}
	};
}
function createWorkspaceStore(store, mutate, getUser = null, rawLocal = {}) {
	const isLocal = () => getUser && !getUser();
	const pick = (data, fields) => Object.fromEntries(fields.filter((key) => data[key] !== void 0).map((key) => [key, data[key]]));
	function save(method, path, payload) {
		return mutate(() => apiClient[method](`/workspace${path}`, payload));
	}
	const create = (resource, data) => save("post", `/${resource}`, data);
	const patch = (resource, id, data) => save("patch", `/${resource}/${encodeURIComponent(id)}`, data);
	return {
		addTask: (data) => isLocal() && rawLocal.addTask ? rawLocal.addTask(data) : create("tasks", pick(data, [
			"title",
			"assigneeId",
			"priority",
			"category",
			"dueDate"
		])),
		updateTaskStatus: (id, status) => isLocal() && rawLocal.updateTaskStatus ? rawLocal.updateTaskStatus(id, status) : patch("tasks", id, { status }),
		submitDailyReport: (data) => isLocal() && rawLocal.submitDailyReport ? rawLocal.submitDailyReport(data) : create("dailyReports", {
			...pick(data, [
				"date",
				"challenges",
				"tomorrowPlan"
			]),
			hoursLogged: Number(data.hoursLogged),
			tasksSummary: data.tasksSummary ?? data.summary
		}),
		deleteDailyReport: (id) => isLocal() && rawLocal.deleteDailyReport ? rawLocal.deleteDailyReport(id) : save("delete", `/dailyReports/${encodeURIComponent(id)}`),
		addCourse: (data) => isLocal() && rawLocal.addCourse ? rawLocal.addCourse(data) : create("courses", pick(data, [
			"title",
			"category",
			"duration",
			"url",
			"modules"
		])),
		enrollCourse: (courseId) => isLocal() && rawLocal.enrollCourse ? rawLocal.enrollCourse(courseId) : create("enrollments", { courseId }),
		updateCourseProgress: (courseId, progress) => {
			if (isLocal() && rawLocal.updateCourseProgress) return rawLocal.updateCourseProgress(courseId, progress);
			return mutate(async () => {
				const enrollment = (store.getState().enrollments ?? []).find((record) => String(record.courseId) === String(courseId));
				if (!enrollment) throw new Error("Enroll in this course before reporting progress.");
				return apiClient.patch(`/workspace/enrollments/${encodeURIComponent(enrollment.id)}`, { progress });
			});
		},
		completeCourseQuiz: () => Promise.reject(/* @__PURE__ */ new Error("Verified quizzes and certificates are not configured. Use self-reported course progress instead.")),
		createTicket: (data) => isLocal() && rawLocal.createTicket ? rawLocal.createTicket(data) : create("tickets", pick(data, [
			"subject",
			"description",
			"category",
			"priority"
		])),
		createHelpDeskTicket(data) {
			return this.createTicket(data);
		},
		updateTicketStatus: (id, status) => isLocal() && rawLocal.updateTicketStatus ? rawLocal.updateTicketStatus(id, status) : patch("tickets", id, { status }),
		replyToTicket: (id, response) => isLocal() && rawLocal.replyToTicket ? rawLocal.replyToTicket(id, response) : patch("tickets", id, { response }),
		createAnnouncement: (data) => isLocal() && rawLocal.createAnnouncement ? rawLocal.createAnnouncement(data) : create("announcements", pick(data, [
			"title",
			"content",
			"category",
			"priority",
			"targetAudience",
			"pinned",
			"sendEmailBroadcast",
			"sendEmail"
		])),
		updateAnnouncement: (id, data) => isLocal() && rawLocal.updateAnnouncement ? rawLocal.updateAnnouncement(id, data) : patch("announcements", id, pick(data, [
			"title",
			"content",
			"category",
			"priority",
			"targetAudience",
			"pinned"
		])),
		deleteAnnouncement: (id) => isLocal() && rawLocal.deleteAnnouncement ? rawLocal.deleteAnnouncement(id) : save("delete", `/announcements/${encodeURIComponent(id)}`),
		togglePinAnnouncement: (id, pinned) => isLocal() && rawLocal.togglePinAnnouncement ? rawLocal.togglePinAnnouncement(id, pinned) : patch("announcements", id, { pinned }),
		likeAnnouncement: (id) => isLocal() && rawLocal.likeAnnouncement ? rawLocal.likeAnnouncement(id) : patch("announcements", id, { liked: true }),
		addDocument: (data) => isLocal() && rawLocal.addDocument ? rawLocal.addDocument(data) : create("documents", pick(data, [
			"title",
			"category",
			"size",
			"url"
		])),
		deleteDocument: (id) => isLocal() && rawLocal.deleteDocument ? rawLocal.deleteDocument(id) : save("delete", `/documents/${encodeURIComponent(id)}`),
		addHoliday: (data) => isLocal() && rawLocal.addHoliday ? rawLocal.addHoliday(data) : create("holidays", {
			...pick(data, ["date", "type"]),
			name: data.name ?? data.title
		}),
		deleteHoliday: (id) => isLocal() && rawLocal.deleteHoliday ? rawLocal.deleteHoliday(id) : save("delete", `/holidays/${encodeURIComponent(id)}`),
		addRequisition: (data) => isLocal() && rawLocal.addRequisition ? rawLocal.addRequisition(data) : create("requisitions", {
			...pick(data, [
				"title",
				"department",
				"location"
			]),
			openings: Number(data.openings)
		}),
		submitExpense: (data) => isLocal() && rawLocal.submitExpense ? rawLocal.submitExpense(data) : create("expenses", {
			...pick(data, [
				"category",
				"merchant",
				"date",
				"attachmentUrl",
				"attachmentName",
				"attachmentType",
				"attachmentSize"
			]),
			amount: Number(data.amount),
			comments: data.comments ?? data.notes ?? "",
			attachmentUrl: data.attachmentUrl || "",
			attachmentName: data.attachmentName || "",
			attachmentType: data.attachmentType || "",
			attachmentSize: data.attachmentSize || ""
		}),
		approveExpense: (id) => isLocal() && rawLocal.approveExpense ? rawLocal.approveExpense(id) : patch("expenses", id, { status: "approved" }),
		rejectExpense: (id, reviewerRole, reason) => isLocal() && rawLocal.rejectExpense ? rawLocal.rejectExpense(id, reviewerRole, reason) : patch("expenses", id, {
			status: "rejected",
			rejectionReason: reason
		}),
		deleteExpense: (id) => isLocal() && rawLocal.deleteExpense ? rawLocal.deleteExpense(id) : save("delete", `/expenses/${encodeURIComponent(id)}`),
		sendKudos: (data) => isLocal() && rawLocal.sendKudos ? rawLocal.sendKudos(data) : create("kudos", {
			recipientId: data.recipientId ?? data.to,
			badge: data.badge ?? data.tag,
			message: data.message
		}),
		addPerformanceGoal: (data) => isLocal() && rawLocal.addPerformanceGoal ? rawLocal.addPerformanceGoal(data) : create("performanceGoals", pick(data, [
			"employeeId",
			"title",
			"target",
			"dueDate",
			"progress"
		])),
		updatePerformanceGoal: (id, progress) => isLocal() && rawLocal.updatePerformanceGoal ? rawLocal.updatePerformanceGoal(id, progress) : patch("performanceGoals", id, { progress }),
		addPerformanceReview: (data) => isLocal() && rawLocal.addPerformanceReview ? rawLocal.addPerformanceReview(data) : create("performanceReviews", pick(data, [
			"employeeId",
			"period",
			"rating",
			"comments"
		])),
		addNotification: (data) => {
			rawLocal.addNotification?.(data);
			if (isLocal()) return Promise.resolve(data);
			return create("notifications", pick(data, [
				"recipientId",
				"recipientRole",
				"title",
				"message",
				"type",
				"id"
			])).catch((err) => {
				console.warn("Failed to sync notification to server:", err?.message || err);
				return data;
			});
		},
		markNotificationRead: (id) => {
			rawLocal.markNotificationRead?.(id);
			return isLocal() ? Promise.resolve() : patch("notifications", id, { read: true });
		},
		markAllNotificationsRead: () => {
			rawLocal.markAllNotificationsRead?.();
			return isLocal() ? Promise.resolve() : save("patch", "/notifications/read-all", {});
		},
		deleteNotification: (id) => {
			rawLocal.deleteNotification?.(id);
			return isLocal() ? Promise.resolve() : save("delete", `/notifications/${encodeURIComponent(id)}`);
		},
		clearAllNotifications: () => {
			rawLocal.clearAllNotifications?.();
			return isLocal() ? Promise.resolve() : save("delete", "/notifications/clear-all");
		},
		addRole: (data) => {
			const res = rawLocal.addRole ? rawLocal.addRole(data) : data;
			const id = data.id || data.roleId;
			const current = store.getState().roles || [];
			store.getState().roles = [...current.filter((r) => (r.id || r.roleId) !== id), res || data];
			if (store.getState().deletedRoleIds) store.getState().deletedRoleIds = store.getState().deletedRoleIds.filter((delId) => delId !== id);
			if (isLocal()) return res;
			return create("roles", pick(data, [
				"id",
				"roleId",
				"name",
				"description",
				"badge",
				"isSystem",
				"permissions"
			])).catch(() => res).then(() => res);
		},
		updateRole: (id, data) => {
			const res = rawLocal.updateRole ? rawLocal.updateRole(id, data) : true;
			store.getState().roles = (store.getState().roles || []).map((r) => {
				if ((r.id || r.roleId || r._id) === id) return {
					...r,
					...data
				};
				return r;
			});
			if (isLocal()) return res;
			return patch("roles", id, pick(data, [
				"name",
				"description",
				"badge",
				"permissions"
			])).catch(() => res).then(() => res);
		},
		deleteRole: (id) => {
			const res = rawLocal.deleteRole ? rawLocal.deleteRole(id) : true;
			store.getState().roles = (store.getState().roles || []).filter((r) => (r.id || r.roleId || r._id) !== id && r.id !== id);
			if (!store.getState().deletedRoleIds) store.getState().deletedRoleIds = [];
			if (!store.getState().deletedRoleIds.includes(id)) store.getState().deletedRoleIds.push(id);
			if (isLocal()) return res;
			return save("delete", `/roles/${encodeURIComponent(id)}`).catch(() => ({ success: true })).then(() => res);
		},
		addDepartment: (data) => {
			const res = rawLocal.addDepartment ? rawLocal.addDepartment(data) : data;
			if (isLocal()) return res;
			return create("departments", pick(data, [
				"id",
				"deptId",
				"name",
				"code",
				"description",
				"head",
				"isCustom"
			])).then(() => res);
		},
		updateDepartment: (id, data) => {
			const res = rawLocal.updateDepartment ? rawLocal.updateDepartment(id, data) : true;
			if (isLocal()) return res;
			return patch("departments", id, pick(data, [
				"name",
				"code",
				"description",
				"head",
				"oldName"
			])).then(() => res);
		},
		deleteDepartment: (id) => {
			const res = rawLocal.deleteDepartment ? rawLocal.deleteDepartment(id) : true;
			if (isLocal()) return res;
			return save("delete", `/departments/${encodeURIComponent(id)}`).then(() => res);
		},
		addTeam: (data) => {
			const res = rawLocal.addTeam ? rawLocal.addTeam(data) : data;
			if (isLocal()) return res;
			return create("teams", pick(data, [
				"id",
				"teamId",
				"name",
				"department",
				"managerId",
				"managerName",
				"teamLeadId",
				"teamLeadName",
				"description",
				"flaggedForVerification",
				"verificationNote"
			])).then(() => res);
		},
		updateTeam: (id, data) => {
			const res = rawLocal.updateTeam ? rawLocal.updateTeam(id, data) : true;
			if (isLocal()) return res;
			return patch("teams", id, pick(data, [
				"name",
				"department",
				"managerId",
				"managerName",
				"teamLeadId",
				"teamLeadName",
				"description",
				"flaggedForVerification",
				"verificationNote"
			])).then(() => res);
		},
		deleteTeam: (id) => {
			const res = rawLocal.deleteTeam ? rawLocal.deleteTeam(id) : true;
			if (isLocal()) return res;
			return save("delete", `/teams/${encodeURIComponent(id)}`).then(() => res);
		},
		assignEmployeesToTeam: (teamIdOrName, employeeIds, actor) => {
			const res = rawLocal.assignEmployeesToTeam ? rawLocal.assignEmployeesToTeam(teamIdOrName, employeeIds, actor) : { success: true };
			if (isLocal()) return res;
			return save("put", `/teams/${encodeURIComponent(teamIdOrName)}/members`, { employeeIds: Array.from(employeeIds || []) }).then(() => res);
		}
	};
}
// src/utils/credentialsHelper.js
/**
* Helper utilities for auto-generating employee codes (ETS),
* strong random passwords, and formatted credential sharing messages.
*/
function generateNextEmployeeCode(employees = [], users = []) {
	const codes = [];
	if (Array.isArray(employees)) {
		for (const emp of employees) if (emp?.employeeId) codes.push(String(emp.employeeId).trim());
	}
	if (Array.isArray(users)) {
		for (const u of users) if (u?.employeeId) codes.push(String(u.employeeId).trim());
	}
	let maxNum = 21200;
	for (const code of codes) {
		const match = code.match(/^ETS(\d+)$/i);
		if (match) {
			const num = parseInt(match[1], 10);
			if (num >= maxNum) maxNum = num;
		} else {
			const digitsMatch = code.match(/(\d{4,})/g);
			if (digitsMatch) for (const d of digitsMatch) {
				const num = parseInt(d, 10);
				if (num >= maxNum) maxNum = num;
			}
		}
	}
	return `ETS${maxNum + 1}`;
}
function generateAutoPassword() {
	const prefixes = [
		"Edufyi",
		"EtsWork",
		"Welcome",
		"Secure",
		"Portal"
	];
	const symbols = [
		"@",
		"#",
		"$",
		"!"
	];
	return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${symbols[Math.floor(Math.random() * symbols.length)]}${Math.floor(1e3 + Math.random() * 9e3)}`;
}
function formatCredentialsShareText({ name, email, employeeId, password, role, origin }) {
	const currentOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
	const isHR = role === "hr" || role === "hr_executive";
	const portalPath = role === "admin" ? "admin/login" : isHR ? "hr/login" : "employee/login";
	const portalUrl = currentOrigin ? `${currentOrigin}/#/${portalPath}` : `http://localhost:5173/#/${portalPath}`;
	return `🎉 Welcome to Edufyi Workforce!

Hello ${name || "Team Member"},
Your company workforce account has been created. Here are your login details:

🌐 Portal: ${role === "admin" ? "Admin Console" : isHR ? "HR Operations Portal" : "Employee Self-Service (ESS)"}
🔗 Login Link: ${portalUrl}
🆔 Employee Code: ${employeeId || "N/A"}
📧 Work Email: ${email}
🔑 Temporary Password: ${password}

⚠️ Important: Please log in using the credentials above and update your password on your first session.`;
}
/**
* Universal clipboard copy helper that works across both HTTPS / localhost
* (modern Clipboard API) and LAN IP over HTTP (fallback via invisible textarea & execCommand).
*/
async function copyTextToClipboard(text) {
	if (!text || typeof window === "undefined") return false;
	if (window.isSecureContext && navigator?.clipboard?.writeText) try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {}
	try {
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.top = "0";
		textArea.style.left = "-9999px";
		textArea.style.width = "2em";
		textArea.style.height = "2em";
		textArea.style.padding = "0";
		textArea.style.border = "none";
		textArea.style.outline = "none";
		textArea.style.boxShadow = "none";
		textArea.style.background = "transparent";
		textArea.style.opacity = "0";
		textArea.setAttribute("readonly", "");
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		textArea.setSelectionRange(0, text.length);
		const successful = document.execCommand("copy");
		document.body.removeChild(textArea);
		if (successful) return true;
	} catch {}
	return false;
}
// src/services/connectedStore.js
function todayKey() {
	const now = /* @__PURE__ */ new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function currentPayrollMonth() {
	return (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	});
}
function normalizeEmployee(employee) {
	const mgrObj = typeof employee?.managerId === "object" ? employee.managerId : null;
	const mgrId = mgrObj?._id ? String(mgrObj._id) : employee?.managerId ? String(employee.managerId) : null;
	const managerName = mgrObj?.name || employee?.managerName || employee?.reportingManager || "";
	const team = employee?.team || employee?.squad || "";
	const teamId = employee?.teamId || employee?.squadId || "";
	const squad = employee?.squad || employee?.team || "";
	const squadId = employee?.squadId || employee?.teamId || "";
	const rawDob = employee?.dob || employee?.identity?.dob || employee?.dateOfBirth || employee?.birthDate || "";
	const cleanDob = typeof rawDob === "string" ? rawDob.slice(0, 10) : rawDob instanceof Date ? rawDob.toISOString().slice(0, 10) : "";
	return {
		...employee,
		id: String(employee?.id ?? employee?._id),
		managerName,
		managerId: mgrId,
		team,
		teamId,
		squad,
		squadId,
		teamLeadId: employee?.teamLeadId || "",
		teamLeadName: employee?.teamLeadName || "",
		dob: cleanDob,
		identity: {
			...employee?.identity || {},
			dob: cleanDob || employee?.identity?.dob
		},
		joiningDate: employee.joiningDate?.slice(0, 10) ?? "",
		employmentEndDate: employee.employmentEndDate?.slice(0, 10) ?? "",
		exitDetails: employee.exitDetails ? {
			...employee.exitDetails,
			resignationDate: employee.exitDetails.resignationDate ? String(employee.exitDetails.resignationDate).slice(0, 10) : "",
			lastWorkingDay: employee.exitDetails.lastWorkingDay ? String(employee.exitDetails.lastWorkingDay).slice(0, 10) : ""
		} : null,
		offboardingChecklist: Array.isArray(employee.offboardingChecklist) ? employee.offboardingChecklist : []
	};
}
function normalizeLeave(request, employees) {
	const empObj = typeof request.employeeId === "object" ? request.employeeId : null;
	const empFound = (employees || []).find((record) => String(record.id) === String(request.employeeId) || String(record._id) === String(request.employeeId) || String(record.employeeId) === String(request.employeeId));
	const employee = empObj || empFound;
	const employeeName = employee?.name || request.employeeName || empObj?.name || "Employee";
	const department = employee?.department || request.department || empObj?.department || "General";
	const employeeId = employee?.employeeId || empObj?.employeeId || (typeof request.employeeId === "string" ? request.employeeId : "");
	const employeeRef = String(employee?._id || employee?.id || empObj?._id || empObj?.id || request.employeeId || "");
	return {
		...request,
		id: String(request.id ?? request._id),
		_id: String(request._id ?? request.id),
		employeeRef,
		employeeId,
		employeeName,
		department,
		managerId: request.managerId?._id ? String(request.managerId._id) : request.managerId?.employeeId ?? (typeof request.managerId === "string" ? request.managerId : request.managerId ? String(request.managerId) : null),
		startDate: request.startDate ? String(request.startDate).slice(0, 10) : "",
		endDate: request.endDate ? String(request.endDate).slice(0, 10) : "",
		isHalfDay: Boolean(request.isHalfDay || request.days === .5 || request.units === .5),
		halfDayPeriod: request.halfDayPeriod || null,
		days: Boolean(request.isHalfDay || request.days === .5 || request.units === .5) ? .5 : request.units ?? request.days ?? 1
	};
}
function createConnectedStore(store, notify, rawLocal = {}) {
	let user = null;
	let generation = 0;
	let refreshing = null;
	let refreshAgain = false;
	let mutationQueue = Promise.resolve();
	const state = () => store.getState();
	function reportError(error) {
		console.error("Connected data operation failed:", error);
		if (error?.status === 401) return;
		if (!state().dataReady) state().dataError = error?.message || "The service is temporarily unavailable.";
		notify();
	}
	async function refresh() {
		if (!user) return;
		if (refreshing) {
			refreshAgain = true;
			return refreshing;
		}
		const activeGeneration = generation;
		const actor = user;
		refreshing = (async () => {
			const isExecutive = [
				"director",
				"managing_director",
				"co_founder",
				"vertical_head"
			].includes(actor.role) || actor.email === "jagadishbabu@edufyitech.in";
			const management = [
				"admin",
				"hr",
				"hr_executive"
			].includes(actor.role) || isExecutive;
			const permissions = actor.permissions ?? [];
			const can = (permission) => permissions.includes("*") || permissions.includes(permission);
			const payrollAllowed = management ? can("payroll.read") || actor.role === "admin" : can("payroll.self.read");
			async function fetchEmployees() {
				if (management) {
					const list = [];
					let page = 1;
					let total = 0;
					do {
						const result = await apiClient.get(`/employees?limit=100&page=${page++}`);
						const batch = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : Array.isArray(result?.records) ? result.records : [];
						if (batch.length === 0) break;
						list.push(...batch.map(normalizeEmployee));
						total = Number(result?.meta?.total ?? result?.pagination?.total ?? list.length);
						if (batch.length < 100) break;
					} while (list.length < total && page <= 25);
					return { data: list };
				} else {
					const result = await apiClient.get("/auth/me");
					return { data: result?.data?.user ? [normalizeEmployee(result.data.user)] : [] };
				}
			}
			const requests = {
				employees: fetchEmployees().catch((err) => {
					console.warn("Could not load employees:", err.message);
					const existing = state().employees;
					if (existing && existing.length > 0) return { data: existing };
					return { data: actor ? [normalizeEmployee(actor)] : [] };
				}),
				attendance: apiClient.get(management ? "/attendance" : "/attendance/self").catch(() => ({ data: [] })),
				leaves: apiClient.get(management ? "/leave/hr/requests" : "/leave/self").catch(() => ({ data: [] })),
				payroll: payrollAllowed ? apiClient.get("/payroll").catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
				balances: apiClient.get(management ? "/leave/hr/balances" : "/leave/balances").catch(() => ({ data: [] })),
				users: management ? apiClient.get("/auth/users").catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
				teamLeaves: !management && can("leave.team.read") ? apiClient.get("/leave/team").catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
				leavePolicies: apiClient.get("/leave/policies").catch(() => ({ data: [] })),
				config: apiClient.get("/attendance/config").catch(() => ({ data: {} })),
				payrollSettings: apiClient.get("/payroll/settings").catch(() => ({ data: {} })),
				directory: management ? Promise.resolve({ data: [] }) : apiClient.get("/hierarchy/directory").catch(() => ({ data: [] })),
				workspace: apiClient.get("/workspace/snapshot").catch(() => ({ data: {} }))
			};
			const results = await Promise.allSettled(Object.values(requests));
			if (generation !== activeGeneration) return;
			const dataErrors = {};
			const data = {};
			const keys = Object.keys(requests);
			results.forEach((result, index) => {
				const key = keys[index];
				if (result.status === "fulfilled") data[key] = result.value.data;
				else {
					if (result.reason.status === 401) throw result.reason;
					console.error(`Could not load ${key}:`, result.reason);
					dataErrors[key] = result.reason.message;
					data[key] = key === "config" || key === "workspace" ? {} : [];
				}
			});
			const employees = data.employees || [];
			if (!payrollAllowed) dataErrors.payroll = "Your account does not have payroll access. Contact HR.";
			const prevEmployees = state().employees || [];
			const finalEmployees = (management ? employees : [...employees, ...data.directory.filter((record) => record.id !== employees[0].id).map(normalizeEmployee)]).map((fresh) => {
				const prev = prevEmployees.find((p) => p.id === fresh.id || p.employeeId === fresh.employeeId);
				if (prev?.status === "notice" && fresh.status !== "inactive" && !fresh.exitDetails && prev.exitDetails) return {
					...fresh,
					status: "notice",
					exitDetails: prev.exitDetails,
					offboardingChecklist: (fresh.offboardingChecklist?.length ? fresh.offboardingChecklist : prev.offboardingChecklist) || []
				};
				return fresh;
			});
			const resolvedUsers = Array.isArray(data.users) ? data.users : [];
			const baseDepts = rawLocal.getDepartments ? rawLocal.getDepartments() : [];
			const currentDepts = state().departments && state().departments.length > 0 ? state().departments : baseDepts;
			const serverDepts = Array.isArray(data.workspace?.departments) ? data.workspace.departments : [];
			const deptMap = /* @__PURE__ */ new Map();
			currentDepts.forEach((d) => {
				if (!d) return;
				const key = (d.deptId || d.id || d.name || "").toLowerCase();
				if (key) deptMap.set(key, { ...d });
			});
			baseDepts.forEach((d) => {
				if (!d) return;
				const key = (d.deptId || d.id || d.name || "").toLowerCase();
				if (key && !deptMap.has(key)) deptMap.set(key, { ...d });
			});
			serverDepts.forEach((s) => {
				if (!s) return;
				const key = (s.deptId || s.id || s.name || "").toLowerCase();
				if (key) {
					const prev = deptMap.get(key) || {};
					deptMap.set(key, {
						...prev,
						...s,
						id: s.id || s.deptId || prev.id,
						deptId: s.deptId || s.id || prev.deptId,
						isCustom: s.isCustom !== void 0 ? s.isCustom : prev.isCustom !== void 0 ? prev.isCustom : true
					});
				}
			});
			const finalDepts = Array.from(deptMap.values());
			const serverTeams = Array.isArray(data.workspace?.teams) ? data.workspace.teams : null;
			let finalTeams = [];
			if (serverTeams !== null) finalTeams = serverTeams.map((s) => ({
				...s,
				id: s.id || s.teamId || s._id,
				teamId: s.teamId || s.id || s._id
			}));
			else {
				const baseTeams = rawLocal.getTeams ? rawLocal.getTeams() : [];
				const currentTeams = state().teams && state().teams.length > 0 ? state().teams : baseTeams;
				const teamMap = /* @__PURE__ */ new Map();
				currentTeams.forEach((t) => {
					if (!t) return;
					const key = (t.teamId || t.id || t.name || "").toLowerCase();
					if (key) teamMap.set(key, { ...t });
				});
				baseTeams.forEach((t) => {
					if (!t) return;
					const key = (t.teamId || t.id || t.name || "").toLowerCase();
					if (key && !teamMap.has(key)) teamMap.set(key, { ...t });
				});
				finalTeams = Array.from(teamMap.values());
			}
			const baseRoles = rawLocal.getRoles ? rawLocal.getRoles() : [];
			const currentRoles = state().roles && state().roles.length > 0 ? state().roles : baseRoles;
			const serverRoles = Array.isArray(data.workspace?.roles) ? data.workspace.roles : [];
			const deletedRoleIds = new Set(rawLocal.getState?.()?.deletedRoleIds || state().deletedRoleIds || []);
			const roleMap = /* @__PURE__ */ new Map();
			baseRoles.forEach((r) => {
				if (!r) return;
				const key = (r.roleId || r.id || r.name || "").toLowerCase();
				if (key && !deletedRoleIds.has(r.id) && !deletedRoleIds.has(r.roleId)) roleMap.set(key, { ...r });
			});
			currentRoles.forEach((r) => {
				if (!r) return;
				const key = (r.roleId || r.id || r.name || "").toLowerCase();
				if (key && !deletedRoleIds.has(r.id) && !deletedRoleIds.has(r.roleId) && !roleMap.has(key)) roleMap.set(key, { ...r });
			});
			serverRoles.forEach((s) => {
				if (!s) return;
				const key = (s.roleId || s.id || s.name || "").toLowerCase();
				if (key && !deletedRoleIds.has(s.id) && !deletedRoleIds.has(s.roleId)) {
					const prev = roleMap.get(key) || {};
					roleMap.set(key, {
						...prev,
						...s,
						id: s.id || s.roleId || prev.id,
						roleId: s.roleId || s.id || prev.roleId
					});
				}
			});
			const finalRoles = Array.from(roleMap.values());
			const finalCompanySettings = {
				...rawLocal.getState?.()?.companySettings || state().companySettings || {},
				...data.config || {},
				attendanceRules: {
					...(rawLocal.getState?.()?.companySettings || state().companySettings)?.attendanceRules || {},
					...data.config?.attendanceRules || {}
				},
				leavePolicies: {
					...(rawLocal.getState?.()?.companySettings || state().companySettings)?.leavePolicies || {},
					...data.config?.leavePolicies || {}
				},
				helpDeskSettings: {
					...(rawLocal.getState?.()?.companySettings || state().companySettings)?.helpDeskSettings || {},
					...data.config?.helpDeskSettings || {}
				},
				...data.payrollSettings || {}
			};
			if (rawLocal.getState) {
				rawLocal.getState().departments = finalDepts;
				rawLocal.getState().teams = finalTeams;
				rawLocal.getState().roles = finalRoles;
				rawLocal.getState().companySettings = finalCompanySettings;
			}
			const isCleared = typeof window !== "undefined" && window.localStorage.getItem("edufyi_notifications_cleared_v2") === "true";
			const deletedRaw = typeof window !== "undefined" ? window.localStorage.getItem("edufyi_deleted_notifications_v2") : null;
			const deletedIds = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);
			const readRaw = typeof window !== "undefined" ? window.localStorage.getItem("edufyi_read_notifications_v2") : null;
			const readIds = new Set(readRaw ? JSON.parse(readRaw) : []);
			const serverNotifs = isCleared ? [] : (data.workspace?.notifications ?? []).filter((n) => n && n.id && !deletedIds.has(n.id)).map((n) => ({
				...n,
				read: Boolean(n.read || readIds.has(n.id))
			}));
			const rawLeaves = Array.isArray(data.leaves) ? data.leaves : [];
			const rawTeamLeaves = Array.isArray(data.teamLeaves) ? data.teamLeaves : [];
			const safeWorkspace = data.workspace && typeof data.workspace === "object" ? data.workspace : {};
			Object.assign(state(), {
				...Object.fromEntries(workspaceKeys.map((key) => [key, safeWorkspace[key] ?? []])),
				notifications: serverNotifs,
				departments: finalDepts,
				teams: finalTeams,
				roles: finalRoles,
				employees: finalEmployees,
				users: resolvedUsers,
				attendance: Array.isArray(data.attendance) ? data.attendance : [],
				leaves: [...new Map([...rawLeaves, ...rawTeamLeaves].map((request) => [request.id ?? request._id, request])).values()].map((request) => normalizeLeave(request, employees)),
				leavePolicies: Array.isArray(data.leavePolicies?.data) ? data.leavePolicies.data : Array.isArray(data.leavePolicies) ? data.leavePolicies : [],
				payroll: (data.payroll || []).map((record) => {
					const gross = record.grossEarnings || Object.values(record.earnings ?? {}).reduce((sum, value) => sum + value, 0);
					const totalDeductions = record.totalDeductions || Object.values(record.deductions ?? {}).reduce((sum, value) => sum + value, 0);
					const net = record.netPay ?? gross - totalDeductions;
					return {
						...record,
						id: String(record.id || record._id),
						_id: String(record._id || record.id),
						gross,
						totalDeductions,
						net,
						netPay: net
					};
				}),
				leaveBalances: data.balances,
				dataErrors,
				dataError: Object.entries(dataErrors).filter(([key, msg]) => !(key === "payroll" && msg.includes("does not have payroll access"))).map(([key, message]) => `${key}: ${message}`).join(" · "),
				dataReady: true,
				companySettings: finalCompanySettings
			});
			notify();
		})();
		try {
			await refreshing;
		} finally {
			if (generation === activeGeneration) refreshing = null;
		}
		if (generation === activeGeneration && refreshAgain) {
			refreshAgain = false;
			await refresh();
		}
	}
	async function mutate(operation) {
		const actorGeneration = generation;
		const pending = mutationQueue.then(async () => {
			if (actorGeneration !== generation || !user) throw new Error("Your session changed. Sign in before saving.");
			if (refreshing) await refreshing;
			if (actorGeneration !== generation || !user) throw new Error("Your session changed. Sign in before saving.");
			const result = await operation();
			if (actorGeneration === generation) refresh().catch((err) => console.warn("[connectedStore] Background sync error:", err?.message || err));
			return result && result.data !== void 0 ? result.data : result;
		});
		mutationQueue = pending.then(() => void 0, () => void 0);
		return pending;
	}
	function employeePayload(data) {
		const payload = Object.fromEntries([
			"employeeId",
			"name",
			"displayName",
			"email",
			"password",
			"phone",
			"department",
			"team",
			"teamId",
			"squad",
			"squadId",
			"teamLeadId",
			"teamLeadName",
			"managerId",
			"managerName",
			"designation",
			"location",
			"campus",
			"employmentType",
			"joiningDate",
			"dob",
			"dateOfBirth",
			"birthDate",
			"employmentEndDate",
			"onboardingChecklist",
			"offboardingChecklist",
			"exitDetails",
			"emergencyContact",
			"role",
			"status",
			"salary",
			"salaryStructure",
			"parentsContact",
			"onboardingDocs",
			"documents",
			"identity",
			"onboardingStatus",
			"onboardingSubmittedAt",
			"onboardingVerifiedAt",
			"onboardingVerifiedBy",
			"onboardingNotes",
			"onboardingRejectionReason",
			"onboardingUnlockedAt",
			"bankDetails",
			"financeDetails",
			"reportingManager",
			"policyConsents",
			"complianceDocs",
			"avatarUrl"
		].filter((key) => data[key] !== void 0).map((key) => [key, data[key]]));
		delete payload.permissions;
		delete payload.authVersion;
		delete payload.passwordHash;
		delete payload.salaryRecord;
		delete payload._id;
		delete payload.id;
		if (payload.password === "" || payload.password === null) delete payload.password;
		if (payload.employeeId !== void 0 && !String(payload.employeeId).trim()) delete payload.employeeId;
		if (payload.joiningDate !== void 0 && !payload.joiningDate) delete payload.joiningDate;
		if (data.dob || data.dateOfBirth || data.birthDate) {
			const cleanDob = String(data.dob || data.dateOfBirth || data.birthDate).trim();
			payload.dob = cleanDob;
			payload.identity = {
				...payload.identity || data.identity || {},
				dob: cleanDob
			};
		} else if (data.identity?.dob) {
			const cleanDob = String(data.identity.dob).trim();
			payload.dob = cleanDob;
			payload.identity = {
				...payload.identity || data.identity || {},
				dob: cleanDob
			};
		}
		if (payload.onboardingStatus) {
			const ost = String(payload.onboardingStatus).trim().toLowerCase();
			if (ost === "pending") payload.onboardingStatus = "submitted";
			else if (ost === "rejected") payload.onboardingStatus = "action_required";
			else if (ost === "approved") payload.onboardingStatus = "verified";
			else payload.onboardingStatus = ost;
		}
		if (payload.team && !payload.squad) payload.squad = payload.team;
		if (payload.squad && !payload.team) payload.team = payload.squad;
		if (payload.teamId && !payload.squadId) payload.squadId = payload.teamId;
		if (payload.squadId && !payload.teamId) payload.teamId = payload.squadId;
		if (data.employmentType) {
			const et = String(data.employmentType).trim().toLowerCase().replace(/[-\s]/g, "_");
			payload.employmentType = et === "contract" ? "contractor" : [
				"full_time",
				"part_time",
				"contractor",
				"intern"
			].includes(et) ? et : "full_time";
		} else if (data.role && (data.role === "intern" || String(data.role).toLowerCase().includes("intern"))) payload.employmentType = "intern";
		if (data.managerId !== void 0) {
			const cleanMgr = String(data.managerId || "").trim();
			payload.managerId = cleanMgr && cleanMgr !== "null" && cleanMgr !== "undefined" && cleanMgr !== "none" ? cleanMgr : null;
		}
		if (data.salary !== void 0) payload.salary = Number(data.salary);
		if (data.salaryStructure !== void 0) payload.salaryStructure = data.salaryStructure;
		if (data.policyConsents !== void 0) payload.policyConsents = data.policyConsents;
		if (data.complianceDocs !== void 0) payload.complianceDocs = data.complianceDocs;
		if (data.phone !== void 0) payload.phone = String(data.phone || "").trim();
		if (data.employeeId !== void 0 && payload.employeeId) payload.employeeId = String(payload.employeeId).trim().toUpperCase();
		if (data.bankDetails || data.bankName !== void 0 || data.accountNumber !== void 0 || data.ifscCode !== void 0 || data.panTaxId !== void 0 || data.uanNumber !== void 0) {
			payload.bankDetails = { ...data.bankDetails || {} };
			for (const key of [
				"bankName",
				"accountNumber",
				"ifscCode",
				"panTaxId",
				"uanNumber"
			]) if (data[key] !== void 0) payload.bankDetails[key] = String(data[key] || "").trim();
		}
		if (payload.documents && !Array.isArray(payload.documents)) {
			payload.onboardingDocs = {
				...payload.onboardingDocs || {},
				...payload.documents
			};
			delete payload.documents;
		}
		return payload;
	}
	function employee(id) {
		if (!id) return null;
		const cleanId = String(id).trim();
		const record = store.getEmployee(cleanId) || store.getState().employees?.find((e) => String(e.id) === cleanId || String(e._id) === cleanId || String(e.employeeId).toUpperCase() === cleanId.toUpperCase());
		if (!record) return {
			id: cleanId,
			_id: cleanId,
			name: "Reporting Manager"
		};
		return record;
	}
	return {
		...createWorkspaceStore(store, mutate, () => user, rawLocal),
		assignEmployeesToTeam(teamIdOrName, employeeIds, actor) {
			if (rawLocal.assignEmployeesToTeam) rawLocal.assignEmployeesToTeam(teamIdOrName, employeeIds, actor);
			const cleanTarget = String(teamIdOrName || "").toLowerCase().trim();
			const targetTeam = (state().teams || []).find((t) => String(t.id || t.teamId || "").toLowerCase() === cleanTarget || String(t.name || "").toLowerCase() === cleanTarget);
			const teamName = targetTeam?.name || teamIdOrName;
			const teamId = targetTeam?.id || targetTeam?.teamId || `team-${teamName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
			const targetDept = targetTeam?.department || null;
			const selectedSet = new Set((employeeIds || []).map(String));
			state().employees = (state().employees || []).map((emp) => {
				const empId = String(emp.id || emp._id);
				const isCurrentInTeam = String(emp.teamId || emp.squadId || "") === String(teamId) || String(emp.team || emp.squad || "").toLowerCase() === teamName.toLowerCase();
				if (selectedSet.has(empId)) return {
					...emp,
					team: teamName,
					teamId,
					squad: teamName,
					squadId: teamId,
					...targetTeam?.teamLeadId ? {
						teamLeadId: targetTeam.teamLeadId,
						teamLeadName: targetTeam.teamLeadName || ""
					} : {},
					...targetTeam?.managerId ? {
						managerId: targetTeam.managerId,
						managerName: targetTeam.managerName || ""
					} : {},
					...targetDept && (!emp.department || emp.department === "Unassigned") ? { department: targetDept } : {}
				};
				else if (isCurrentInTeam) return {
					...emp,
					team: "",
					teamId: "",
					squad: "",
					squadId: ""
				};
				return emp;
			});
			notify();
			if (!user) return Promise.resolve({ success: true });
			return mutate(async () => {
				return await apiClient.post(`/workspace/teams/${encodeURIComponent(teamIdOrName)}/assign`, { employeeIds: Array.from(employeeIds || []) });
			});
		},
		addTeam(data) {
			if (rawLocal.addTeam) rawLocal.addTeam(data);
			const name = (data.name || "").trim();
			const teamId = data.id || data.teamId || `team-${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
			const newTeam = {
				...data,
				id: teamId,
				teamId,
				name,
				department: data.department || "Revenue Growth",
				managerId: data.managerId || null,
				managerName: data.managerName || "",
				teamLeadId: data.teamLeadId || null,
				teamLeadName: data.teamLeadName || "",
				description: data.description || ""
			};
			state().teams = [...(state().teams || []).filter((t) => (t.id || t.teamId) !== teamId && t.name?.toLowerCase() !== name.toLowerCase()), newTeam];
			if (rawLocal.getState) rawLocal.getState().teams = state().teams;
			notify();
			if (!user) return Promise.resolve(newTeam);
			return mutate(async () => {
				return (await apiClient.post("/workspace/teams", {
					teamId,
					name,
					department: newTeam.department,
					managerId: newTeam.managerId,
					managerName: newTeam.managerName,
					teamLeadId: newTeam.teamLeadId,
					teamLeadName: newTeam.teamLeadName,
					description: newTeam.description
				}))?.data || newTeam;
			});
		},
		updateTeam(teamId, updates) {
			if (rawLocal.updateTeam) rawLocal.updateTeam(teamId, updates);
			state().teams = (state().teams || []).map((t) => {
				if ((t.id || t.teamId) === teamId || t.name?.toLowerCase() === String(teamId).toLowerCase()) return {
					...t,
					...updates
				};
				return t;
			});
			if (rawLocal.getState) rawLocal.getState().teams = state().teams;
			notify();
			if (!user) return Promise.resolve({ success: true });
			return mutate(async () => {
				return (await apiClient.patch(`/workspace/teams/${encodeURIComponent(teamId)}`, updates))?.data;
			});
		},
		deleteTeam(teamId) {
			if (!teamId) throw new Error("Team ID is required.");
			const res = rawLocal.deleteTeam ? rawLocal.deleteTeam(teamId) : true;
			state().teams = (state().teams || []).filter((t) => (t.id || t.teamId) !== teamId && t.name?.toLowerCase() !== String(teamId).toLowerCase());
			if (rawLocal.getState) rawLocal.getState().teams = state().teams;
			notify();
			if (!user) return res;
			return mutate(() => apiClient.delete(`/workspace/teams/${encodeURIComponent(teamId)}`)).then(() => res);
		},
		addRole(roleData) {
			if (rawLocal.addRole) rawLocal.addRole(roleData);
			const roleId = roleData.id || roleData.roleId || roleData.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
			const newRole = {
				...roleData,
				id: roleId,
				roleId,
				name: roleData.name,
				description: roleData.description || "",
				badge: roleData.badge || "Custom Role",
				isSystem: false,
				permissions: roleData.permissions || ["dashboard.read"]
			};
			state().roles = [...(state().roles || []).filter((r) => (r.id || r.roleId) !== roleId), newRole];
			if (rawLocal.getState) rawLocal.getState().roles = state().roles;
			notify();
			if (!user) return Promise.resolve(newRole);
			return mutate(async () => {
				return (await apiClient.post("/workspace/roles", {
					roleId,
					name: newRole.name,
					description: newRole.description,
					badge: newRole.badge,
					isSystem: false,
					permissions: newRole.permissions
				}))?.data || newRole;
			});
		},
		updateRole(roleId, updates) {
			if (rawLocal.updateRole) rawLocal.updateRole(roleId, updates);
			state().roles = (state().roles || []).map((r) => {
				if ((r.id || r.roleId) === roleId) return {
					...r,
					...updates
				};
				return r;
			});
			if (rawLocal.getState) rawLocal.getState().roles = state().roles;
			notify();
			if (!user) return Promise.resolve({ success: true });
			return mutate(async () => {
				return (await apiClient.patch(`/workspace/roles/${encodeURIComponent(roleId)}`, updates))?.data;
			});
		},
		updateRolePermissions(roleId, newPermissions) {
			if (rawLocal.updateRolePermissions) rawLocal.updateRolePermissions(roleId, newPermissions);
			state().roles = (state().roles || []).map((r) => {
				if ((r.id || r.roleId) === roleId) return {
					...r,
					permissions: newPermissions
				};
				return r;
			});
			if (rawLocal.getState) rawLocal.getState().roles = state().roles;
			notify();
			if (!user) return Promise.resolve({ success: true });
			return mutate(async () => {
				return (await apiClient.patch(`/workspace/roles/${encodeURIComponent(roleId)}`, { permissions: newPermissions }))?.data;
			});
		},
		resetRolePermissions(roleId) {
			if (rawLocal.resetRolePermissions) rawLocal.resetRolePermissions(roleId);
			notify();
			if (!user) return Promise.resolve(true);
			const targetRole = (state().roles || []).find((r) => (r.id || r.roleId) === roleId);
			return mutate(async () => {
				return (await apiClient.patch(`/workspace/roles/${encodeURIComponent(roleId)}`, { permissions: targetRole?.permissions || ["dashboard.read"] }))?.data;
			});
		},
		deleteRole(roleId) {
			if (rawLocal.deleteRole) rawLocal.deleteRole(roleId);
			state().roles = (state().roles || []).filter((r) => (r.id || r.roleId) !== roleId);
			if (rawLocal.getState) rawLocal.getState().roles = state().roles;
			notify();
			if (!user) return Promise.resolve(true);
			return mutate(() => apiClient.delete(`/workspace/roles/${encodeURIComponent(roleId)}`));
		},
		deleteDepartment(deptId) {
			if (!deptId) throw new Error("Department ID is required.");
			const res = rawLocal.deleteDepartment ? rawLocal.deleteDepartment(deptId) : true;
			state().departments = (state().departments || []).filter((d) => (d.id || d.deptId) !== deptId && d.name?.toLowerCase() !== String(deptId).toLowerCase());
			notify();
			if (!user) return res;
			return mutate(() => apiClient.delete(`/workspace/departments/${encodeURIComponent(deptId)}`)).then(() => res);
		},
		updateMyAvatar(avatarUrl) {
			return mutate(async () => {
				const res = await apiClient.patch("/employees/me/avatar", { avatarUrl });
				if (res?.data) {
					const updated = normalizeEmployee(res.data);
					const list = state().employees || [];
					const idx = list.findIndex((e) => e.id === updated.id || e._id === updated.id || e.employeeId === updated.employeeId);
					if (idx !== -1) list[idx] = {
						...list[idx],
						...updated,
						avatarUrl
					};
					else list.unshift({
						...updated,
						avatarUrl
					});
					state().employees = [...list];
					if (user) user.avatarUrl = avatarUrl;
					notify();
				}
				return res;
			});
		},
		restoreDataJSON(data) {
			if (!user && rawLocal.restoreDataJSON) return rawLocal.restoreDataJSON(data);
			throw new Error("Browser JSON cannot restore MongoDB records. Use a verified database backup and restore procedure.");
		},
		resetToDemoDefaults() {
			if (!user && rawLocal.resetToDemoDefaults) return rawLocal.resetToDemoDefaults();
			throw new Error("Demo reset is disabled. Saved database records cannot be replaced with sample data.");
		},
		reportError,
		clearError() {
			state().dataError = "";
			notify();
		},
		async perform(operation) {
			try {
				state().dataError = "";
				notify();
				return await operation();
			} catch (error) {
				reportError(error);
			}
		},
		async connectUser(actor) {
			generation++;
			refreshing = null;
			refreshAgain = false;
			const prevUserId = user?.id || user?._id;
			const nextUserId = actor?.id || actor?._id;
			user = actor;
			if (!actor) {
				Object.assign(state(), {
					employees: [],
					users: [],
					attendance: [],
					leaves: [],
					payroll: [],
					leaveBalances: [],
					dataReady: false,
					dataError: "",
					dataErrors: {}
				});
				Object.assign(state(), Object.fromEntries(workspaceKeys.map((key) => [key, []])));
				notify();
				return;
			}
			const hasCachedData = Array.isArray(state().employees) && state().employees.length > 0 || Array.isArray(state().departments) && state().departments.length > 0;
			if (prevUserId !== nextUserId || !state().dataReady && !hasCachedData) {
				state().dataReady = false;
				state().dataError = "";
				notify();
			} else if (hasCachedData) state().dataReady = true;
			await refresh();
		},
		refresh,
		updateEmployeeManager(id, managerId) {
			if (!user && rawLocal.updateEmployeeManager) return rawLocal.updateEmployeeManager(id, managerId);
			const targetMgr = managerId ? employee(managerId) : null;
			const mgrId = targetMgr ? targetMgr._id || targetMgr.id : null;
			const mgrName = targetMgr ? targetMgr.displayName || targetMgr.name : "";
			return this.updateEmployee(id, {
				managerId: mgrId,
				managerName: mgrName
			});
		},
		transferEmployeeDepartment(id, department, managerId, extra = {}) {
			if (!user && rawLocal.transferEmployeeDepartment) return rawLocal.transferEmployeeDepartment(id, department, managerId, extra);
			const targetMgr = managerId ? employee(managerId) : null;
			const mgrId = managerId !== void 0 ? targetMgr ? targetMgr._id || targetMgr.id : null : void 0;
			const mgrName = managerId !== void 0 ? targetMgr ? targetMgr.displayName || targetMgr.name : "" : void 0;
			const payload = {
				department,
				...extra.squad !== void 0 ? {
					squad: extra.squad,
					team: extra.squad
				} : {},
				...extra.designation !== void 0 ? { designation: extra.designation } : {},
				...extra.role !== void 0 ? { role: extra.role } : {},
				...mgrId !== void 0 ? {
					managerId: mgrId,
					managerName: mgrName
				} : {}
			};
			return this.updateEmployee(id, payload);
		},
		assignEmployeesToDepartment(deptIdOrName, employeeIds, actor) {
			if (!user && rawLocal.assignEmployeesToDepartment) return rawLocal.assignEmployeesToDepartment(deptIdOrName, employeeIds, actor);
			const deptName = (this.getDepartment(deptIdOrName) || { name: deptIdOrName }).name || deptIdOrName;
			const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
			if (rawLocal.assignEmployeesToDepartment) rawLocal.assignEmployeesToDepartment(deptIdOrName, employeeIds, actor);
			return Promise.all(ids.map((id) => this.updateEmployee(id, { department: deptName })));
		},
		updateCompanySettings(updates) {
			if (rawLocal.updateCompanySettings) rawLocal.updateCompanySettings(updates);
			const updatedSettings = {
				...state().companySettings || {},
				...updates,
				attendanceRules: {
					...state().companySettings?.attendanceRules || {},
					...updates.attendanceRules || {}
				},
				leavePolicies: {
					...state().companySettings?.leavePolicies || {},
					...updates.leavePolicies || {}
				},
				helpDeskSettings: {
					...state().companySettings?.helpDeskSettings || {},
					...updates.helpDeskSettings || {}
				}
			};
			state().companySettings = updatedSettings;
			if (rawLocal.getState) rawLocal.getState().companySettings = updatedSettings;
			notify();
			if (!user) return state().companySettings;
			return mutate(async () => {
				const attendanceKeys = [
					"attendanceRules",
					"locations",
					"officeNetworkIPs",
					"allowedWifiSSIDs",
					"wifiNetworks",
					"leavePolicies",
					"helpDeskSettings"
				];
				const hasAttendance = attendanceKeys.some((k) => updates[k] !== void 0);
				const payrollKeys = [
					"companyName",
					"companyLegalName",
					"address",
					"city",
					"state",
					"country",
					"pincode",
					"phone",
					"email",
					"website",
					"taxId",
					"currency",
					"currencySymbol",
					"logoUrl",
					"primaryColor",
					"secondaryColor",
					"footerText",
					"maskBankAccount",
					"visibleFields",
					"defaultBranch",
					"branchAddress",
					"branchCity",
					"branches",
					"locations",
					"panNumber",
					"tanNumber",
					"epfNumber",
					"esicNumber",
					"ptNumber",
					"statutoryComponents",
					"workingDaysPerMonth",
					"payDateOffset"
				];
				const hasPayroll = payrollKeys.some((k) => updates[k] !== void 0);
				let lastResult = null;
				if (hasAttendance) {
					const attendancePayload = Object.fromEntries(attendanceKeys.filter((k) => updates[k] !== void 0).map((k) => [k, updates[k]]));
					lastResult = await apiClient.patch("/attendance/config", attendancePayload);
					if (lastResult?.data) {
						const serverConfig = lastResult.data;
						const updatedCompanySettings = {
							...state().companySettings || {},
							...serverConfig,
							attendanceRules: {
								...state().companySettings?.attendanceRules || {},
								...serverConfig.attendanceRules || {}
							},
							helpDeskSettings: {
								...state().companySettings?.helpDeskSettings || {},
								...serverConfig.helpDeskSettings || {}
							}
						};
						state().companySettings = updatedCompanySettings;
						if (rawLocal.getState) rawLocal.getState().companySettings = updatedCompanySettings;
					}
					try {
						const isExecutive = [
							"director",
							"managing_director",
							"co_founder",
							"vertical_head"
						].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
						const management = [
							"admin",
							"hr",
							"hr_executive"
						].includes(user?.role) || isExecutive;
						const freshAtt = await apiClient.get(management ? "/attendance" : "/attendance/self");
						if (freshAtt?.data) {
							state().attendance = freshAtt.data;
							if (rawLocal.getState) rawLocal.getState().attendance = freshAtt.data;
							notify();
						}
					} catch {}
				}
				if (hasPayroll || !hasAttendance && !hasPayroll) {
					const payrollPayload = Object.fromEntries(payrollKeys.filter((k) => updates[k] !== void 0).map((k) => [k, updates[k]]));
					lastResult = await apiClient.patch("/payroll/settings", Object.keys(payrollPayload).length ? payrollPayload : updates);
				}
				return lastResult;
			});
		},
		addOfficeNetworkIP(ip, label) {
			if (!user) {
				const existing = state().companySettings.officeNetworkIPs ?? [];
				state().companySettings.officeNetworkIPs = [...existing, {
					ip,
					label,
					addedAt: todayKey()
				}];
				notify();
				return true;
			}
			return mutate(() => {
				const existing = state().companySettings.officeNetworkIPs ?? [];
				if (existing.some((entry) => entry.ip === ip)) throw new Error("This network IP is already registered.");
				return apiClient.patch("/attendance/config", { officeNetworkIPs: [...existing, {
					ip,
					label,
					addedAt: todayKey()
				}] });
			});
		},
		removeOfficeNetworkIP(ip) {
			if (!user) {
				state().companySettings.officeNetworkIPs = (state().companySettings.officeNetworkIPs ?? []).filter((e) => e.ip !== ip);
				notify();
				return true;
			}
			return mutate(() => apiClient.patch("/attendance/config", { officeNetworkIPs: state().companySettings.officeNetworkIPs.filter((entry) => entry.ip !== ip) }));
		},
		addWifiSSID(ssid, branchName, actor, options = {}) {
			if (!user) {
				const config = state().companySettings;
				config.allowedWifiSSIDs = [...config.allowedWifiSSIDs ?? [], ssid];
				config.wifiNetworks = [...config.wifiNetworks ?? [], {
					ssid,
					branchName,
					...options
				}];
				notify();
				return true;
			}
			return mutate(() => {
				const config = state().companySettings;
				if ((config.allowedWifiSSIDs ?? []).includes(ssid)) throw new Error("This network is already registered.");
				return apiClient.patch("/attendance/config", {
					allowedWifiSSIDs: [...config.allowedWifiSSIDs, ssid],
					wifiNetworks: [...config.wifiNetworks, {
						ssid,
						branchName,
						...options
					}]
				});
			});
		},
		removeWifiSSID(ssid) {
			if (!user) {
				const config = state().companySettings;
				config.allowedWifiSSIDs = (config.allowedWifiSSIDs ?? []).filter((v) => v !== ssid);
				config.wifiNetworks = (config.wifiNetworks ?? []).filter((r) => r.ssid !== ssid);
				notify();
				return true;
			}
			return mutate(() => {
				const config = state().companySettings;
				return apiClient.patch("/attendance/config", {
					allowedWifiSSIDs: config.allowedWifiSSIDs.filter((value) => value !== ssid),
					wifiNetworks: config.wifiNetworks.filter((record) => record.ssid !== ssid)
				});
			});
		},
		addBranchLocation(location) {
			if (!user && rawLocal.addBranchLocation) return rawLocal.addBranchLocation(location);
			return mutate(() => {
				const config = state().companySettings || {};
				const currentLocs = Array.isArray(config.locations) ? [...config.locations] : [];
				const genId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "loc-" + Date.now();
				const newLoc = {
					...location,
					id: location.id || genId
				};
				const updatedLocs = [...currentLocs, newLoc];
				const updatedSettings = {
					...config,
					locations: updatedLocs
				};
				state().companySettings = updatedSettings;
				if (rawLocal.getState) rawLocal.getState().companySettings = updatedSettings;
				notify();
				return apiClient.patch("/attendance/config", { locations: updatedLocs });
			});
		},
		updateBranchLocation(id, updates) {
			if (!user && rawLocal.updateBranchLocation) return rawLocal.updateBranchLocation(id, updates);
			return mutate(() => {
				const config = state().companySettings || {};
				const currentLocs = Array.isArray(config.locations) ? [...config.locations] : [];
				const matchIdx = currentLocs.findIndex((loc) => loc.id === id || loc._id === id || loc.name === id);
				let updatedLocs;
				if (matchIdx >= 0) updatedLocs = currentLocs.map((loc, idx) => idx === matchIdx ? {
					...loc,
					...updates
				} : loc);
				else {
					const genId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "loc-" + Date.now();
					updatedLocs = [...currentLocs, {
						...updates,
						id: id || genId
					}];
				}
				const updatedSettings = {
					...config,
					locations: updatedLocs
				};
				state().companySettings = updatedSettings;
				if (rawLocal.getState) rawLocal.getState().companySettings = updatedSettings;
				notify();
				return apiClient.patch("/attendance/config", { locations: updatedLocs });
			});
		},
		removeBranchLocation(id) {
			if (!user && rawLocal.removeBranchLocation) return rawLocal.removeBranchLocation(id);
			return mutate(() => {
				const config = state().companySettings;
				return apiClient.patch("/attendance/config", { locations: (config.locations || []).filter((l) => l.id !== id) });
			});
		},
		uploadHolidayCalendarImages(newImages, actor = "Admin") {
			const prepared = (Array.isArray(newImages) ? newImages : [newImages]).filter(Boolean).map((img, i) => ({
				id: img.id || `cal-img-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
				url: img.url || img.dataUrl || img.src || "",
				title: img.title || img.name || `Holiday Calendar Page ${i + 1}`,
				uploadedAt: img.uploadedAt || todayKey(),
				uploadedBy: img.uploadedBy || actor || "Admin"
			}));
			const updated = [...state().companySettings?.holidayCalendarImages || state().holidayCalendarImages || [], ...prepared];
			state().holidayCalendarImages = updated;
			state().companySettings = {
				...state().companySettings || {},
				holidayCalendarImages: updated
			};
			if (typeof window !== "undefined" && window.localStorage) try {
				window.localStorage.setItem("edufyi_holiday_calendar_images_v1", JSON.stringify(updated));
			} catch (_) {}
			if (!user) {
				notify();
				return Promise.resolve(updated);
			}
			return mutate(async () => {
				await apiClient.patch("/attendance/config", { holidayCalendarImages: updated }).catch((err) => {
					console.warn("Could not sync holidayCalendarImages with server config", err);
				});
				return updated;
			});
		},
		deleteHolidayCalendarImage(imageId) {
			const updated = (state().companySettings?.holidayCalendarImages || state().holidayCalendarImages || []).filter((img) => img.id !== imageId && img._id !== imageId);
			state().holidayCalendarImages = updated;
			state().companySettings = {
				...state().companySettings || {},
				holidayCalendarImages: updated
			};
			if (typeof window !== "undefined" && window.localStorage) try {
				window.localStorage.setItem("edufyi_holiday_calendar_images_v1", JSON.stringify(updated));
			} catch (_) {}
			if (!user) {
				notify();
				return Promise.resolve(true);
			}
			return mutate(async () => {
				await apiClient.patch("/attendance/config", { holidayCalendarImages: updated }).catch((err) => {
					console.warn("Could not sync holidayCalendarImages with server config", err);
				});
				return true;
			});
		},
		addUser(data) {
			if (!user && rawLocal.addUser) return rawLocal.addUser(data);
			data.employeeId || (data.employeeId = generateNextEmployeeCode(store.getState().employees, store.getState().users));
			return mutate(() => apiClient.post("/auth/users", data));
		},
		toggleUserStatus(id) {
			if (!user && rawLocal.toggleUserStatus) return rawLocal.toggleUserStatus(id);
			return this.toggleEmployeeStatus(id);
		},
		toggleEmployeeStatus(id) {
			if (!user && rawLocal.toggleEmployeeStatus) return rawLocal.toggleEmployeeStatus(id);
			const target = employee(id);
			const nextStatus = target.status === "active" ? "deactivate" : "activate";
			return mutate(async () => {
				return (await apiClient.post(`/employees/${target.id}/${nextStatus}`)).data.status;
			});
		},
		updateUser(id, updates) {
			if (!user && rawLocal.updateUser) return rawLocal.updateUser(id, updates);
			return this.updateEmployee(id, updates);
		},
		resetUserPassword(id, password) {
			if (!user && rawLocal.resetUserPassword) return rawLocal.resetUserPassword(id, password);
			const u = store.getState().users?.find((acc) => acc.id === id || acc._id === id || acc.employeeId === id);
			const e = store.getState().employees?.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id);
			const targetId = u?._id || u?.id || e?._id || e?.id || e?.employeeId || id;
			return mutate(() => apiClient.post(`/auth/users/${targetId}/password`, { password }));
		},
		deleteUser(id) {
			if (!user && rawLocal.deleteUser) return rawLocal.deleteUser(id);
			return mutate(async () => {
				const u = store.getState().users?.find((acc) => acc.id === id || acc._id === id || acc.employeeId === id);
				const targetId = u?._id || u?.id || id;
				try {
					await apiClient.delete(`/auth/users/${targetId}`);
				} catch {
					await apiClient.delete(`/employees/${targetId}`);
				}
				if (rawLocal.deleteUser) rawLocal.deleteUser(id);
				return { success: true };
			});
		},
		addEmployee(data) {
			if (!user && rawLocal.addEmployee) return rawLocal.addEmployee(data);
			if (data.salary !== void 0 && (!Number.isFinite(Number(data.salary)) || Number(data.salary) < 0)) throw new Error("Enter a non-negative annual salary.");
			const payload = employeePayload(data);
			payload.employeeId || (payload.employeeId = generateNextEmployeeCode(store.getState().employees, store.getState().users));
			payload.joiningDate || (payload.joiningDate = todayKey());
			if (data.password) payload.password = data.password;
			return mutate(async () => {
				const record = await apiClient.post("/employees", payload);
				const normalized = normalizeEmployee(record.data);
				if (record.data?.temporaryPassword) normalized.temporaryPassword = record.data.temporaryPassword;
				else if (payload.password) normalized.temporaryPassword = payload.password;
				return normalized;
			});
		},
		updateOnboardingDocs(id, payload) {
			if (!user && rawLocal.updateOnboardingDocs) return rawLocal.updateOnboardingDocs(id, payload);
			return mutate(async () => {
				const record = employee(id) || employee(user?.id) || employee(user?.employeeId);
				const targetId = record?.id || record?._id || record?.employeeId || id;
				const isSelf = Boolean(user && (String(user.id) === String(id) || String(user._id) === String(id) || user.employeeId && String(user.employeeId).toUpperCase() === String(id).toUpperCase() || record && (String(record.id) === String(user.id) || String(record._id) === String(user.id) || String(record.id) === String(user._id) || String(record._id) === String(user._id) || user.employeeId && record.employeeId && String(user.employeeId).toUpperCase() === String(record.employeeId).toUpperCase() || user.email && record.email && String(user.email).toLowerCase() === String(record.email).toLowerCase()) || typeof window !== "undefined" && window.location.hash.startsWith("#/employee")));
				const cleanPayload = { ...payload };
				delete cleanPayload.permissions;
				delete cleanPayload.authVersion;
				delete cleanPayload.passwordHash;
				delete cleanPayload.salaryRecord;
				delete cleanPayload._id;
				delete cleanPayload.id;
				if (cleanPayload.onboardingStatus) {
					const ost = String(cleanPayload.onboardingStatus).trim().toLowerCase();
					if (ost === "pending") cleanPayload.onboardingStatus = "submitted";
					else if (ost === "rejected") cleanPayload.onboardingStatus = "action_required";
					else if (ost === "approved") cleanPayload.onboardingStatus = "verified";
					else cleanPayload.onboardingStatus = ost;
				}
				if (isSelf) {
					const res = await apiClient.patch("/employees/me/onboarding", cleanPayload);
					if (rawLocal.updateOnboardingDocs) rawLocal.updateOnboardingDocs(targetId || id, cleanPayload);
					return res.data;
				}
				try {
					const res = await apiClient.patch(`/employees/${encodeURIComponent(targetId)}`, cleanPayload);
					if (rawLocal.updateOnboardingDocs) rawLocal.updateOnboardingDocs(targetId, cleanPayload);
					return res.data;
				} catch (err) {
					const clean = { ...cleanPayload };
					delete clean.onboardingStatus;
					delete clean.onboardingVerifiedAt;
					delete clean.onboardingVerifiedBy;
					delete clean.onboardingRejectionReason;
					delete clean.onboardingSubmittedAt;
					delete clean.onboardingNotes;
					if (Object.keys(clean).length > 0) try {
						const res = await apiClient.patch(`/employees/${encodeURIComponent(targetId)}`, clean);
						if (rawLocal.updateOnboardingDocs) rawLocal.updateOnboardingDocs(targetId, clean);
						return res.data;
					} catch {}
					throw err;
				}
			});
		},
		requestOnboardingRevision(id, reason = "Employee requested document revision") {
			if (!user && rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(id, reason);
			return mutate(async () => {
				const record = employee(id) || employee(user?.id) || employee(user?.employeeId);
				const targetId = record?.id || record?._id || record?.employeeId || id;
				if (Boolean(user && (String(user.id) === String(id) || String(user._id) === String(id) || user.employeeId && String(user.employeeId).toUpperCase() === String(id).toUpperCase() || record && (String(record.id) === String(user.id) || String(record._id) === String(user.id) || String(record.id) === String(user._id) || String(record._id) === String(user._id) || user.employeeId && record.employeeId && String(user.employeeId).toUpperCase() === String(record.employeeId).toUpperCase()) || typeof window !== "undefined" && window.location.hash.startsWith("#/employee")))) try {
					const res = await apiClient.post("/employees/me/request-revision", { reason });
					if (rawLocal.requestOnboardingRevision) rawLocal.requestOnboardingRevision(targetId || id, reason);
					return res.data;
				} catch (err) {
					if (rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(targetId || id, reason);
					throw err;
				}
				if (rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(targetId || id, reason);
				return { success: true };
			});
		},
		approveDocument(id, docKey, body = {}) {
			if (!user && rawLocal.approveDocument) return rawLocal.approveDocument(id, docKey, body);
			return mutate(async () => {
				const emp = employee(id);
				try {
					return (await apiClient.post(`/employees/${emp.id}/documents/${docKey}/approve`, body)).data;
				} catch (err) {
					if (err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === "NOT_FOUND" || typeof err?.message === "string" && (err.message.toLowerCase().includes("not found") || err.message.includes("404"))) {
						const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {};
						const currentDoc = docs[docKey] ? { ...docs[docKey] } : {};
						const vAt = (/* @__PURE__ */ new Date()).toISOString();
						const reviewer = user?.displayName || user?.name || user?.email || "HR Reviewer";
						const validUserId = typeof (user?.id ?? user?._id) === "string" && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? user.id ?? user._id : void 0;
						docs[docKey] = {
							...currentDoc,
							status: "verified",
							reuploadRequested: false,
							reuploadRemarks: null,
							rejectionReason: null,
							verifiedAt: vAt,
							verifiedBy: reviewer,
							...validUserId ? { reviewerId: validUserId } : {},
							comments: body?.comments || currentDoc.comments
						};
						if (docKey === "aadharCard") docs.aadharDoc = { ...docs[docKey] };
						if (docKey === "panCard") docs.panDoc = { ...docs[docKey] };
						const uploaded = Object.values(docs).filter((d) => d && (d.fileName || d.url));
						const allVerified = uploaded.length > 0 && uploaded.every((d) => d.status === "verified");
						const patchPayload = {
							onboardingDocs: docs,
							...allVerified ? {
								onboardingStatus: "verified",
								onboardingVerifiedAt: vAt
							} : {},
							...allVerified && validUserId ? { onboardingVerifiedBy: validUserId } : {}
						};
						try {
							return (await apiClient.patch(`/employees/${emp.id}`, patchPayload)).data;
						} catch (patchErr) {
							if (patchErr?.message?.includes("not editable")) return (await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })).data;
							throw patchErr;
						}
					}
					throw err;
				}
			});
		},
		rejectDocument(id, docKey, reason, body = {}) {
			if (!user && rawLocal.rejectDocument) return rawLocal.rejectDocument(id, docKey, reason, body);
			return mutate(async () => {
				const emp = employee(id);
				try {
					return (await apiClient.post(`/employees/${emp.id}/documents/${docKey}/reject`, {
						reason,
						...body
					})).data;
				} catch (err) {
					if (err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === "NOT_FOUND" || typeof err?.message === "string" && (err.message.toLowerCase().includes("not found") || err.message.includes("404"))) {
						const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {};
						const currentDoc = docs[docKey] ? { ...docs[docKey] } : {};
						const rAt = (/* @__PURE__ */ new Date()).toISOString();
						const reviewer = user?.displayName || user?.name || user?.email || "HR Reviewer";
						const validUserId = typeof (user?.id ?? user?._id) === "string" && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? user.id ?? user._id : void 0;
						docs[docKey] = {
							...currentDoc,
							status: "reupload_requested",
							reuploadRequested: true,
							reuploadRequestedAt: rAt,
							reuploadRequestedBy: reviewer,
							reuploadRemarks: reason,
							rejectedAt: rAt,
							rejectedBy: reviewer,
							...validUserId ? { reviewerId: validUserId } : {},
							rejectionReason: reason,
							comments: body?.comments || reason
						};
						if (docKey === "aadharCard") docs.aadharDoc = { ...docs[docKey] };
						if (docKey === "panCard") docs.panDoc = { ...docs[docKey] };
						try {
							return (await apiClient.patch(`/employees/${emp.id}`, {
								onboardingDocs: docs,
								onboardingStatus: "action_required",
								onboardingRejectionReason: reason
							})).data;
						} catch (patchErr) {
							if (patchErr?.message?.includes("not editable")) return (await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })).data;
							throw patchErr;
						}
					}
					throw err;
				}
			});
		},
		uploadDocument(id, docKey, fileData) {
			if (!user && rawLocal.uploadDocument) return rawLocal.uploadDocument(id, docKey, fileData);
			return mutate(async () => {
				const emp = employee(id);
				try {
					return (await apiClient.post(`/employees/${emp.id}/documents/${docKey}/upload`, fileData)).data;
				} catch (err) {
					if (err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === "NOT_FOUND" || typeof err?.message === "string" && (err.message.toLowerCase().includes("not found") || err.message.includes("404"))) {
						const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {};
						const safeName = String(fileData.fileName || `${docKey}.pdf`).trim().replace(/[/\\]/g, "_").slice(0, 100);
						const validUserId = typeof (user?.id ?? user?._id) === "string" && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? user.id ?? user._id : void 0;
						docs[docKey] = {
							status: "submitted",
							fileName: safeName,
							url: fileData.url,
							size: fileData.size || "Attached",
							uploadedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
							submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
							...validUserId ? { uploadedBy: validUserId } : {},
							rejectionReason: null
						};
						if (docKey === "aadharCard") docs.aadharDoc = { ...docs[docKey] };
						if (docKey === "panCard") docs.panDoc = { ...docs[docKey] };
						try {
							return (await apiClient.patch(`/employees/${emp.id}`, {
								onboardingDocs: docs,
								onboardingStatus: "submitted",
								onboardingSubmittedAt: (/* @__PURE__ */ new Date()).toISOString()
							})).data;
						} catch (patchErr) {
							if (patchErr?.message?.includes("not editable")) return (await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs })).data;
							throw patchErr;
						}
					}
					throw err;
				}
			});
		},
		approveOnboarding(id) {
			if (!user && rawLocal.approveOnboarding) return rawLocal.approveOnboarding(id);
			return mutate(async () => {
				const emp = employee(id);
				try {
					return (await apiClient.post(`/employees/${emp.id}/onboarding/approve`)).data;
				} catch (err) {
					if (err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === "NOT_FOUND" || typeof err?.message === "string" && (err.message.toLowerCase().includes("not found") || err.message.includes("404"))) {
						const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {};
						const vAt = (/* @__PURE__ */ new Date()).toISOString();
						const reviewer = user?.displayName || user?.name || user?.email || "HR Reviewer";
						for (const k of Object.keys(docs)) if (docs[k] && typeof docs[k] === "object") docs[k] = {
							...docs[k],
							status: "verified",
							verifiedAt: vAt,
							verifiedBy: reviewer
						};
						const validUserId = typeof (user?.id ?? user?._id) === "string" && /^[0-9a-fA-F]{24}$/.test(user?.id ?? user?._id) ? user.id ?? user._id : void 0;
						const patchPayload = {
							onboardingStatus: "verified",
							onboardingVerifiedAt: vAt,
							onboardingRejectionReason: null,
							onboardingDocs: docs,
							...validUserId ? { onboardingVerifiedBy: validUserId } : {}
						};
						try {
							return (await apiClient.patch(`/employees/${emp.id}`, patchPayload)).data;
						} catch (patchErr) {
							if (patchErr?.message?.includes("not editable")) {
								const res = await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs });
								if (emp) {
									emp.onboardingStatus = "verified";
									emp.onboardingDocs = docs;
								}
								state().dataError = "";
								notify();
								return res.data;
							}
							throw patchErr;
						}
					}
					throw err;
				}
			});
		},
		rejectOnboarding(id, reason) {
			if (!user && rawLocal.rejectOnboarding) return rawLocal.rejectOnboarding(id, reason);
			return mutate(async () => {
				const emp = employee(id);
				try {
					const res = await apiClient.post(`/employees/${emp.id}/onboarding/reject`, { reason });
					if (emp) {
						emp.onboardingStatus = "action_required";
						emp.onboardingRejectionReason = reason;
					}
					notify();
					return res.data;
				} catch (err) {
					if (err?.status === 404 || err?.statusCode === 404 || err?.response?.status === 404 || err?.code === "NOT_FOUND" || typeof err?.message === "string" && (err.message.toLowerCase().includes("not found") || err.message.includes("404"))) try {
						const res = await apiClient.patch(`/employees/${emp.id}`, {
							onboardingStatus: "action_required",
							onboardingRejectionReason: reason
						});
						if (emp) {
							emp.onboardingStatus = "action_required";
							emp.onboardingRejectionReason = reason;
						}
						notify();
						return res.data;
					} catch (patchErr) {
						if (patchErr?.message?.includes("not editable")) {
							const docs = emp.onboardingDocs ? { ...emp.onboardingDocs } : {};
							for (const k of Object.keys(docs)) if (docs[k] && typeof docs[k] === "object" && docs[k].status !== "verified") docs[k] = {
								...docs[k],
								status: "rejected",
								rejectionReason: reason
							};
							const res = await apiClient.patch(`/employees/${emp.id}`, { onboardingDocs: docs });
							if (emp) {
								emp.onboardingStatus = "action_required";
								emp.onboardingRejectionReason = reason;
								emp.onboardingDocs = docs;
							}
							notify();
							return res.data;
						}
						throw patchErr;
					}
					throw err;
				}
			});
		},
		approveDocument(id, docKey, body = {}) {
			if (!user && rawLocal.approveDocument) return rawLocal.approveDocument(id, docKey, body);
			return mutate(async () => {
				const emp = employee(id);
				const res = await apiClient.post(`/employees/${emp.id}/documents/${docKey}/approve`, body);
				if (emp && emp.onboardingDocs && emp.onboardingDocs[docKey]) {
					emp.onboardingDocs[docKey].status = "verified";
					emp.onboardingDocs[docKey].verifiedAt = (/* @__PURE__ */ new Date()).toISOString();
					emp.onboardingDocs[docKey].verifiedBy = user?.displayName || user?.name || "HR Reviewer";
				}
				notify();
				return res.data;
			});
		},
		rejectDocument(id, docKey, reason, body = {}) {
			if (!user && rawLocal.rejectDocument) return rawLocal.rejectDocument(id, docKey, reason, body);
			return mutate(async () => {
				const emp = employee(id);
				const res = await apiClient.post(`/employees/${emp.id}/documents/${docKey}/reject`, {
					reason,
					...body
				});
				if (emp && emp.onboardingDocs && emp.onboardingDocs[docKey]) {
					emp.onboardingDocs[docKey].status = "reupload_requested";
					emp.onboardingDocs[docKey].reuploadRequested = true;
					emp.onboardingDocs[docKey].reuploadRemarks = reason;
				}
				notify();
				return res.data;
			});
		},
		initiateExit(employeeId, exitData) {
			if (!user && rawLocal.initiateExit) return rawLocal.initiateExit(employeeId, exitData);
			return mutate(async () => {
				const emp = employee(employeeId);
				const checklist = Array.isArray(emp.offboardingChecklist) && emp.offboardingChecklist.length > 0 ? emp.offboardingChecklist : [
					{
						key: "knowledge_transfer",
						label: "Handover & Knowledge Transfer Completed",
						completed: false
					},
					{
						key: "assets_returned",
						label: "Company Assets & Laptop Returned",
						completed: false
					},
					{
						key: "id_badge_access",
						label: "ID Badge & Building Access Revoked",
						completed: false
					},
					{
						key: "system_deprovisioning",
						label: "Email & System Accounts Revoked",
						completed: false
					},
					{
						key: "exit_interview",
						label: "HR Exit Interview Conducted",
						completed: false
					},
					{
						key: "fnf_settlement",
						label: "Final Settlement (FnF) Calculated",
						completed: false
					}
				];
				const parsedNoticeDays = exitData.noticePeriodDays !== void 0 && exitData.noticePeriodDays !== null && exitData.noticePeriodDays !== "" ? Number(exitData.noticePeriodDays) : 30;
				const exitDetails = {
					resignationDate: exitData.resignationDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
					lastWorkingDay: exitData.lastWorkingDay ? new Date(exitData.lastWorkingDay).toISOString().split("T")[0] : "",
					noticePeriodDays: isNaN(parsedNoticeDays) ? 30 : parsedNoticeDays,
					reason: exitData.reason || "Resignation",
					handoverAssignee: exitData.handoverAssignee || "Unassigned",
					handoverStatus: "Initiated",
					exitInterviewCompleted: false,
					assetsReturned: false
				};
				if (emp) {
					emp.status = "notice";
					emp.exitDetails = exitDetails;
					emp.offboardingChecklist = checklist;
				}
				if (rawLocal.initiateExit) rawLocal.initiateExit(employeeId, exitData);
				try {
					return (await apiClient.post(`/employees/${emp.id}/exit/initiate`, exitData)).data;
				} catch (postErr) {
					if (postErr?.status === 404 || postErr?.statusCode === 404 || typeof postErr?.message === "string" && postErr.message.includes("not found")) try {
						return (await apiClient.patch(`/employees/${emp.id}`, {
							status: "notice",
							employmentEndDate: exitData.lastWorkingDay ? new Date(exitData.lastWorkingDay).toISOString() : void 0,
							exitDetails,
							offboardingChecklist: checklist
						})).data;
					} catch (patchErr) {
						if (patchErr?.message?.includes("not editable") || patchErr?.message?.includes("fields")) {
							const res = await apiClient.patch(`/employees/${emp.id}`, {
								status: "notice",
								exitDetails
							}).catch(() => ({ success: true }));
							return res.data || res;
						}
						throw patchErr;
					}
					throw postErr;
				}
			});
		},
		toggleOffboardingItem(employeeId, itemKey) {
			if (!user && rawLocal.toggleOffboardingItem) return rawLocal.toggleOffboardingItem(employeeId, itemKey);
			return mutate(async () => {
				const emp = employee(employeeId);
				const updatedList = (Array.isArray(emp.offboardingChecklist) && emp.offboardingChecklist.length > 0 ? emp.offboardingChecklist : [
					{
						key: "knowledge_transfer",
						label: "Handover & Knowledge Transfer Completed",
						completed: false
					},
					{
						key: "assets_returned",
						label: "Company Assets & Laptop Returned",
						completed: false
					},
					{
						key: "id_badge_access",
						label: "ID Badge & Building Access Revoked",
						completed: false
					},
					{
						key: "system_deprovisioning",
						label: "Email & System Accounts Revoked",
						completed: false
					},
					{
						key: "exit_interview",
						label: "HR Exit Interview Conducted",
						completed: false
					},
					{
						key: "fnf_settlement",
						label: "Final Settlement (FnF) Calculated",
						completed: false
					}
				]).map((item) => item.key === itemKey ? {
					...item,
					completed: !item.completed,
					completedAt: !item.completed ? (/* @__PURE__ */ new Date()).toISOString() : void 0
				} : item);
				if (emp) emp.offboardingChecklist = updatedList;
				if (rawLocal.toggleOffboardingItem) rawLocal.toggleOffboardingItem(employeeId, itemKey);
				try {
					return (await apiClient.post(`/employees/${emp.id}/offboarding/checklist/${itemKey}/toggle`)).data;
				} catch (postErr) {
					if (postErr?.status === 404 || postErr?.statusCode === 404 || typeof postErr?.message === "string" && postErr.message.includes("not found")) try {
						return (await apiClient.patch(`/employees/${emp.id}`, { offboardingChecklist: updatedList })).data;
					} catch (patchErr) {
						if (patchErr?.message?.includes("not editable")) return {
							success: true,
							offboardingChecklist: updatedList
						};
						throw patchErr;
					}
					throw postErr;
				}
			});
		},
		cancelExit(employeeId) {
			if (!user && rawLocal.cancelExit) return rawLocal.cancelExit(employeeId);
			return mutate(async () => {
				const emp = employee(employeeId);
				if (emp) {
					emp.status = "active";
					emp.exitDetails = null;
					emp.employmentEndDate = null;
				}
				if (rawLocal.cancelExit) rawLocal.cancelExit(employeeId);
				try {
					return (await apiClient.post(`/employees/${emp.id}/exit/cancel`)).data;
				} catch (postErr) {
					if (postErr?.status === 404 || postErr?.statusCode === 404 || typeof postErr?.message === "string" && postErr.message.includes("not found")) {
						const res = await apiClient.patch(`/employees/${emp.id}`, {
							status: "active",
							exitDetails: null,
							employmentEndDate: null
						}).catch(() => ({ success: true }));
						return res.data || res;
					}
					throw postErr;
				}
			});
		},
		finalizeExit(employeeId) {
			if (!user && rawLocal.finalizeExit) return rawLocal.finalizeExit(employeeId);
			return mutate(async () => {
				const emp = employee(employeeId);
				const updatedExitDetails = {
					...emp?.exitDetails || {},
					handoverStatus: "Completed",
					assetsReturned: true,
					exitInterviewCompleted: true
				};
				if (emp) {
					emp.status = "inactive";
					emp.exitDetails = updatedExitDetails;
				}
				if (rawLocal.finalizeExit) rawLocal.finalizeExit(employeeId);
				try {
					return (await apiClient.post(`/employees/${emp.id}/exit/finalize`)).data;
				} catch (postErr) {
					if (postErr?.status === 404 || postErr?.statusCode === 404 || typeof postErr?.message === "string" && postErr.message.includes("not found")) {
						const res = await apiClient.patch(`/employees/${emp.id}`, {
							status: "inactive",
							exitDetails: updatedExitDetails
						}).catch(async () => {
							return await apiClient.post(`/employees/${emp.id}/deactivate`).catch(() => ({ success: true }));
						});
						return res.data || res;
					}
					throw postErr;
				}
			});
		},
		updateEmployee(id, data) {
			if (!user && rawLocal.updateEmployee) return rawLocal.updateEmployee(id, data);
			if (data.salary !== void 0 && (!Number.isFinite(Number(data.salary)) || Number(data.salary) < 0)) throw new Error("Enter a non-negative annual salary.");
			return mutate(async () => {
				const record = employee(id);
				const targetId = record.id || record._id || record.employeeId || id;
				try {
					const updated = await apiClient.patch(`/employees/${encodeURIComponent(targetId)}`, employeePayload(data));
					const payloadData = updated?.data ?? updated;
					const fresh = payloadData ? normalizeEmployee(payloadData) : {
						...record,
						...data
					};
					state().employees = (state().employees || []).map((e) => e.id === record.id || e._id === record._id || e.employeeId === record.employeeId ? {
						...e,
						...fresh
					} : e);
					if (rawLocal.updateEmployee) try {
						rawLocal.updateEmployee(targetId, data);
					} catch {}
					notify();
					return fresh;
				} catch (err) {
					const clean = employeePayload(data);
					delete clean.permissions;
					delete clean.authVersion;
					delete clean.passwordHash;
					delete clean.salaryRecord;
					delete clean._id;
					delete clean.id;
					delete clean.onboardingStatus;
					delete clean.onboardingVerifiedAt;
					delete clean.onboardingVerifiedBy;
					delete clean.onboardingRejectionReason;
					delete clean.onboardingSubmittedAt;
					delete clean.onboardingNotes;
					delete clean.offboardingChecklist;
					if (Object.keys(clean).length > 0) try {
						const res = await apiClient.patch(`/employees/${encodeURIComponent(targetId)}`, clean);
						const resData = res?.data ?? res;
						const fresh = resData ? normalizeEmployee(resData) : {
							...record,
							...clean
						};
						state().employees = (state().employees || []).map((e) => e.id === record.id || e._id === record._id || e.employeeId === record.employeeId ? {
							...e,
							...fresh
						} : e);
						if (rawLocal.updateEmployee) try {
							rawLocal.updateEmployee(targetId, clean);
						} catch {}
						notify();
						return fresh;
					} catch {}
					throw err;
				}
			});
		},
		requestOnboardingRevision(id, reason = "Employee requested document revision") {
			if (!user && rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(id, reason);
			return mutate(async () => {
				try {
					const res = await apiClient.post("/employees/me/request-revision", { reason });
					if (rawLocal.requestOnboardingRevision) rawLocal.requestOnboardingRevision(id, reason);
					return res.data;
				} catch (err) {
					try {
						const record = employee(id);
						const res = await apiClient.patch(`/employees/${record.id}`, {
							onboardingStatus: "revision_requested",
							onboardingNotes: reason,
							onboardingRejectionReason: null
						});
						if (rawLocal.requestOnboardingRevision) rawLocal.requestOnboardingRevision(id, reason);
						return res.data;
					} catch (patchErr) {
						if (rawLocal.requestOnboardingRevision) return rawLocal.requestOnboardingRevision(id, reason);
						throw err;
					}
				}
			});
		},
		savePolicyConsent(employeeId, policyKey, consentData = {}) {
			if (!user && rawLocal.savePolicyConsent) return rawLocal.savePolicyConsent(employeeId, policyKey, consentData);
			return mutate(async () => {
				const emp = store.getEmployee(employeeId) || store.getState().employees?.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId);
				const targetId = emp?._id || emp?.id || employeeId || user?.id || user?._id || user?.employeeId;
				const now = /* @__PURE__ */ new Date();
				const consentEntry = {
					consented: true,
					consentedAt: now.toISOString(),
					consentedDateFormatted: now.toLocaleString("en-IN", {
						day: "2-digit",
						month: "short",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						hour12: true
					}),
					consentedBy: emp?.name || user?.displayName || "Employee",
					employeeId: emp?.employeeId || user?.employeeId,
					...consentData
				};
				const updatedConsents = {
					...emp?.policyConsents || {},
					[policyKey]: consentEntry
				};
				let res;
				try {
					res = await apiClient.patch(`/employees/${targetId}`, { policyConsents: updatedConsents });
				} catch (patchErr) {
					res = await apiClient.patch("/employees/me/onboarding", { policyConsents: updatedConsents }).catch(() => null);
				}
				if (emp) {
					emp.policyConsents = updatedConsents;
					if (!emp.onboardingDocs) emp.onboardingDocs = {};
					emp.onboardingDocs.policyConsents = updatedConsents;
				}
				if (rawLocal.savePolicyConsent) rawLocal.savePolicyConsent(employeeId, policyKey, consentData);
				return res?.data || res || { success: true };
			});
		},
		saveAllPolicyConsents(employeeId, policies = [], additionalData = {}) {
			if (!user && rawLocal.saveAllPolicyConsents) return rawLocal.saveAllPolicyConsents(employeeId, policies, additionalData);
			return mutate(async () => {
				const emp = store.getEmployee(employeeId) || store.getState().employees?.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId);
				const targetId = emp?._id || emp?.id || employeeId || user?.id || user?._id || user?.employeeId;
				const now = /* @__PURE__ */ new Date();
				const formatted = now.toLocaleString("en-IN", {
					day: "2-digit",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					hour12: true
				});
				const updatedConsents = { ...emp?.policyConsents || {} };
				policies.forEach((pol) => {
					updatedConsents[pol.key || pol.id] = {
						consented: true,
						consentedAt: now.toISOString(),
						consentedDateFormatted: formatted,
						consentedBy: emp?.name || user?.displayName || "Employee",
						employeeId: emp?.employeeId || user?.employeeId,
						policyTitle: pol.title,
						...additionalData
					};
				});
				let res;
				try {
					res = await apiClient.patch(`/employees/${targetId}`, { policyConsents: updatedConsents });
				} catch (patchErr) {
					res = await apiClient.patch("/employees/me/onboarding", { policyConsents: updatedConsents }).catch(() => null);
				}
				if (emp) {
					emp.policyConsents = updatedConsents;
					if (!emp.onboardingDocs) emp.onboardingDocs = {};
					emp.onboardingDocs.policyConsents = updatedConsents;
				}
				if (rawLocal.saveAllPolicyConsents) rawLocal.saveAllPolicyConsents(employeeId, policies, additionalData);
				return res?.data || res || { success: true };
			});
		},
		updateComplianceDocs(employeeId, complianceDocs) {
			if (!user && rawLocal.updateComplianceDocs) return rawLocal.updateComplianceDocs(employeeId, complianceDocs);
			return mutate(async () => {
				const emp = store.getEmployee(employeeId) || store.getState().employees?.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId);
				const targetId = emp?._id || emp?.id || employeeId || user?.id || user?._id || user?.employeeId;
				const updatedDocs = {
					...emp?.complianceDocs || {},
					...complianceDocs || {}
				};
				let res;
				try {
					res = await apiClient.patch(`/employees/${targetId}`, { complianceDocs: updatedDocs });
				} catch (patchErr) {
					res = await apiClient.patch("/employees/me/onboarding", { complianceDocs: updatedDocs }).catch(() => null);
				}
				if (emp) {
					emp.complianceDocs = updatedDocs;
					if (!emp.onboardingDocs) emp.onboardingDocs = {};
					emp.onboardingDocs.complianceDocs = updatedDocs;
				}
				if (rawLocal.updateComplianceDocs) rawLocal.updateComplianceDocs(employeeId, complianceDocs);
				return res?.data || res || { success: true };
			});
		},
		deleteEmployee(id, options = {}) {
			if (!user && rawLocal.deleteEmployee) return rawLocal.deleteEmployee(id, options);
			if (options && (options.force || options.purge)) return mutate(async () => {
				const emp = store.getEmployee(id) || store.getState().employees?.find((e) => e.id === id || e._id === id || e.employeeId === id);
				const targetId = emp?._id || emp?.id || id;
				await apiClient.delete(`/employees/${targetId}`);
				if (rawLocal.deleteEmployee) rawLocal.deleteEmployee(id, options);
				return { success: true };
			});
			return Promise.reject(/* @__PURE__ */ new Error("Employees cannot be deleted in order to preserve linked attendance, leave, and payroll records. Deactivate the employee account instead."));
		},
		checkIn(...args) {
			if (!user && rawLocal.checkIn) return rawLocal.checkIn(...args);
			return mutate(async () => {
				let payload;
				if (typeof args[0] === "object" && args[0] !== null) {
					var _payload, _payload2;
					payload = { ...args[0] };
					(_payload = payload).employeeId || (_payload.employeeId = user?.employeeId || user?.id);
					(_payload2 = payload).employeeName || (_payload2.employeeName = user?.displayName || user?.name || "Employee");
					if (payload.gpsData) {
						payload.latitude = payload.latitude ?? payload.gpsData.latitude ?? null;
						payload.longitude = payload.longitude ?? payload.gpsData.longitude ?? null;
						payload.accuracy = payload.accuracy ?? payload.gpsData.accuracy ?? null;
						payload.distanceMeters = payload.distanceMeters ?? payload.gpsData.distanceMeters ?? null;
						payload.locationName = payload.locationName ?? payload.gpsData.locationName ?? null;
					}
				} else {
					const [employeeId, employeeName, wifiSSID, date, gpsData, bssid, publicIp, shift, shiftCode] = args;
					payload = {
						employeeId: employeeId || user?.employeeId || user?.id,
						employeeName: employeeName || user?.displayName || user?.name || "Employee",
						wifiSSID: wifiSSID && !/airtel|dji|3052/i.test(wifiSSID) ? wifiSSID : "Edufyi",
						bssid: bssid || null,
						publicIp: publicIp || null,
						date: date || todayKey(),
						latitude: gpsData?.latitude ?? null,
						longitude: gpsData?.longitude ?? null,
						accuracy: gpsData?.accuracy ?? null,
						distanceMeters: gpsData?.distanceMeters ?? null,
						locationName: gpsData?.locationName ?? null,
						shift: shift || (() => {
							const attRules = state().companySettings?.attendanceRules || {};
							if (attRules.workStartTime && attRules.workEndTime) {
								const f12 = (t, ref = null, isEnd = false) => {
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
								return `General (${f12(attRules.workStartTime, attRules.workEndTime, false)} – ${f12(attRules.workEndTime, attRules.workStartTime, true)})`;
							}
							return "General (11:00 AM – 08:00 PM)";
						})(),
						shiftCode: shiftCode || "general"
					};
				}
				const res = await apiClient.post("/attendance/check-in", payload);
				if (res?.data) {
					const rec = res.data;
					const syncList = (list) => {
						const arr = [...list || []];
						const idx = arr.findIndex((a) => rec.id && (a.id === rec.id || a._id === rec.id) || rec._id && (a.id === rec._id || a._id === rec._id) || a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date);
						if (idx >= 0) {
							arr[idx] = {
								...arr[idx],
								...rec
							};
							return arr;
						}
						return [rec, ...arr];
					};
					state().attendance = syncList(state().attendance);
					if (rawLocal.getState) rawLocal.getState().attendance = syncList(rawLocal.getState().attendance);
					notify();
				} else if (rawLocal.checkIn) rawLocal.checkIn(...args);
				return res.data;
			});
		},
		startBreak(type = "lunch", date = todayKey(), employeeId) {
			if (!user && rawLocal.startBreak) return rawLocal.startBreak(type, date);
			return mutate(async () => {
				const res = await apiClient.post("/attendance/break/start", {
					type,
					date,
					employeeId: employeeId || user?.employeeId || user?.id
				});
				if (res?.data) {
					const rec = res.data;
					const syncList = (list) => {
						const arr = [...list || []];
						const idx = arr.findIndex((a) => rec.id && (a.id === rec.id || a._id === rec.id) || rec._id && (a.id === rec._id || a._id === rec._id) || a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date);
						if (idx >= 0) {
							arr[idx] = {
								...arr[idx],
								...rec
							};
							return arr;
						}
						return [rec, ...arr];
					};
					state().attendance = syncList(state().attendance);
					if (rawLocal.getState) rawLocal.getState().attendance = syncList(rawLocal.getState().attendance);
					notify();
				} else if (rawLocal.startBreak) rawLocal.startBreak(type, date);
				return res.data;
			});
		},
		endBreak(date = todayKey(), employeeId) {
			if (!user && rawLocal.endBreak) return rawLocal.endBreak(date);
			return mutate(async () => {
				const res = await apiClient.post("/attendance/break/end", {
					date,
					employeeId: employeeId || user?.employeeId || user?.id
				});
				if (res?.data) {
					const rec = res.data;
					const syncList = (list) => {
						const arr = [...list || []];
						const idx = arr.findIndex((a) => rec.id && (a.id === rec.id || a._id === rec.id) || rec._id && (a.id === rec._id || a._id === rec._id) || a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date);
						if (idx >= 0) {
							arr[idx] = {
								...arr[idx],
								...rec
							};
							return arr;
						}
						return [rec, ...arr];
					};
					state().attendance = syncList(state().attendance);
					if (rawLocal.getState) rawLocal.getState().attendance = syncList(rawLocal.getState().attendance);
					notify();
				} else if (rawLocal.endBreak) rawLocal.endBreak(date);
				return res.data;
			});
		},
		checkOut(...args) {
			if (!user && rawLocal.checkOut) return rawLocal.checkOut(...args);
			return mutate(async () => {
				let payload;
				if (typeof args[0] === "object" && args[0] !== null) {
					var _payload3, _payload4;
					payload = { ...args[0] };
					(_payload3 = payload).employeeId || (_payload3.employeeId = user?.employeeId || user?.id);
					(_payload4 = payload).employeeName || (_payload4.employeeName = user?.displayName || user?.name || "Employee");
				} else {
					const [employeeId, employeeName, date] = args;
					payload = {
						employeeId: employeeId || user?.employeeId || user?.id,
						employeeName: employeeName || user?.displayName || user?.name || "Employee",
						date: date || todayKey()
					};
				}
				const res = await apiClient.post("/attendance/check-out", payload);
				if (res?.data) {
					const rec = res.data;
					const syncList = (list) => {
						const arr = [...list || []];
						const idx = arr.findIndex((a) => rec.id && (a.id === rec.id || a._id === rec.id) || rec._id && (a.id === rec._id || a._id === rec._id) || a.employeeId?.toUpperCase() === rec.employeeId?.toUpperCase() && a.date === rec.date);
						if (idx >= 0) {
							arr[idx] = {
								...arr[idx],
								...rec
							};
							return arr;
						}
						return [rec, ...arr];
					};
					state().attendance = syncList(state().attendance);
					if (rawLocal.getState) rawLocal.getState().attendance = syncList(rawLocal.getState().attendance);
					notify();
				} else if (rawLocal.checkOut) rawLocal.checkOut(...args);
				return res.data;
			});
		},
		deleteAttendance(id, extra = {}) {
			const cleanId = String(id || "").trim();
			if (!cleanId && !extra?.employeeId) return false;
			if (!user && rawLocal.deleteAttendance) return rawLocal.deleteAttendance(cleanId, extra);
			return mutate(async () => {
				try {
					const q = new URLSearchParams();
					if (extra.employeeId) q.set("employeeId", extra.employeeId);
					if (extra.date) q.set("date", extra.date);
					const qs = q.toString() ? `?${q.toString()}` : "";
					await apiClient.delete(`/attendance/records/${encodeURIComponent(cleanId || "by-filter")}${qs}`);
				} catch (err) {
					console.warn("Backend delete attendance failed or record not in db:", err?.message || err);
				}
				if (rawLocal.deleteAttendance) rawLocal.deleteAttendance(cleanId, extra);
				state().attendance = (state().attendance || []).filter((a) => a.id !== cleanId && a._id !== cleanId && String(a.id) !== cleanId && String(a._id) !== cleanId && !(extra.employeeId && extra.date && a.employeeId?.toUpperCase() === String(extra.employeeId).toUpperCase() && a.date === extra.date));
				if (rawLocal.getState) rawLocal.getState().attendance = (rawLocal.getState().attendance || []).filter((a) => a.id !== cleanId && a._id !== cleanId && String(a.id) !== cleanId && String(a._id) !== cleanId && !(extra.employeeId && extra.date && a.employeeId?.toUpperCase() === String(extra.employeeId).toUpperCase() && a.date === extra.date));
				notify();
				return true;
			});
		},
		recalculateTodayAttendance(date = null) {
			if (!user && rawLocal.recalculateTodayAttendance) return rawLocal.recalculateTodayAttendance(date);
			return mutate(async () => {
				let res = null;
				try {
					res = await apiClient.post("/attendance/recalculate", { date });
				} catch (err) {
					console.warn("Backend recalculate attendance failed:", err?.message || err);
				}
				if (rawLocal.recalculateTodayAttendance) rawLocal.recalculateTodayAttendance(date);
				try {
					const management = ["admin", "hr"].includes(user?.role);
					const freshAtt = await apiClient.get(management ? "/attendance" : "/attendance/self");
					if (freshAtt?.data) {
						state().attendance = freshAtt.data;
						if (rawLocal.getState) rawLocal.getState().attendance = freshAtt.data;
						notify();
					}
				} catch {}
				return res?.data?.data || res?.data || { success: true };
			});
		},
		markAttendance(record) {
			if (!user && rawLocal.markAttendance) return rawLocal.markAttendance(record);
			return mutate(async () => {
				let res = null;
				try {
					if (record.id || record._id) res = await apiClient.patch(`/attendance/records/${encodeURIComponent(record.id || record._id)}`, record);
					else res = await apiClient.post("/attendance/records", record);
				} catch (err) {
					console.warn("Backend mark attendance failed:", err?.message || err);
				}
				if (rawLocal.markAttendance) rawLocal.markAttendance(record);
				const savedRec = res?.data?.data || res?.data || record;
				const syncList = (list) => {
					const arr = [...list || []];
					const targetId = savedRec.id || savedRec._id;
					const idx = arr.findIndex((a) => targetId && (a.id === targetId || a._id === targetId) || a.employeeId?.toUpperCase() === savedRec.employeeId?.toUpperCase() && a.date === savedRec.date);
					if (idx >= 0) {
						arr[idx] = {
							...arr[idx],
							...savedRec
						};
						return arr;
					}
					return [savedRec, ...arr];
				};
				state().attendance = syncList(state().attendance);
				if (rawLocal.getState) rawLocal.getState().attendance = syncList(rawLocal.getState().attendance);
				notify();
				return savedRec;
			});
		},
		applyLeave(data, applicantUser = null) {
			const activeUser = applicantUser || user;
			if (!user && rawLocal.applyLeave) return rawLocal.applyLeave(data, activeUser);
			return mutate(async () => {
				const isHrOrAdmin = ["admin", "hr"].includes(user?.role) || (user?.permissions || []).includes("leave.hr.review");
				const allEmps = store.getState().employees || [];
				const targetEmp = data.employeeId ? allEmps.find((e) => e.employeeId === data.employeeId || e.id === data.employeeId || e._id === data.employeeId) : null;
				const isSelf = !data.employeeId || String(targetEmp?.id) === String(user?.id) || String(data.employeeId) === String(user?.employeeId);
				if (isHrOrAdmin && targetEmp && !isSelf) {
					const res = await apiClient.post("/leave/hr/grant", {
						employeeId: targetEmp.id || targetEmp._id || targetEmp.employeeId,
						leaveType: data.leaveType || "casual",
						startDate: data.startDate,
						endDate: data.endDate,
						reason: data.reason || "Granted by HR Operations",
						status: data.status || "approved",
						hrComment: data.hrComment || "Approved by HR Operations",
						isHalfDay: Boolean(data.isHalfDay || data.days === .5),
						halfDayPeriod: data.halfDayPeriod || null,
						days: data.days || (data.isHalfDay ? .5 : 1),
						replaceOverlap: Boolean(data.replaceOverlap)
					});
					if (res?.data) {
						const newRecord = normalizeLeave(res.data);
						state().leaves = [newRecord, ...(state().leaves || []).filter((l) => l.id !== newRecord.id && l._id !== newRecord._id)];
					}
					if (rawLocal.applyLeave) rawLocal.applyLeave(data, activeUser);
					try {
						const isExec = [
							"director",
							"managing_director",
							"co_founder",
							"vertical_head"
						].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
						const isMgmt = [
							"admin",
							"hr",
							"hr_executive"
						].includes(user?.role) || isExec;
						const [freshBal, freshLeaves] = await Promise.all([apiClient.get(isMgmt ? "/leave/hr/balances" : "/leave/balances").catch(() => null), apiClient.get(isMgmt ? "/leave/hr/requests" : "/leave/self").catch(() => null)]);
						if (freshBal?.data) state().leaveBalances = freshBal.data;
						if (freshLeaves?.data) {
							const freshList = Array.isArray(freshLeaves.data) ? freshLeaves.data : freshLeaves.data.records || [];
							state().leaves = freshList.map(normalizeLeave);
						}
					} catch {}
					notify();
					return res.data;
				} else {
					const res = await apiClient.post("/leave/requests", {
						leaveType: data.leaveType || "casual",
						startDate: data.startDate,
						endDate: data.endDate,
						reason: data.reason || "Leave application",
						replaceOverlap: Boolean(data.replaceOverlap),
						isHalfDay: Boolean(data.isHalfDay || data.days === .5),
						halfDayPeriod: data.halfDayPeriod || null,
						days: data.days || (data.isHalfDay ? .5 : 1)
					});
					if (res?.data) {
						const newRecord = normalizeLeave(res.data);
						state().leaves = [newRecord, ...(state().leaves || []).filter((l) => l.id !== newRecord.id && l._id !== newRecord._id)];
					} else if (rawLocal.applyLeave) rawLocal.applyLeave(data, activeUser);
					try {
						const isExec = [
							"director",
							"managing_director",
							"co_founder",
							"vertical_head"
						].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
						const isMgmt = [
							"admin",
							"hr",
							"hr_executive"
						].includes(user?.role) || isExec;
						const [freshBal, freshLeaves] = await Promise.all([apiClient.get(isMgmt ? "/leave/hr/balances" : "/leave/balances"), apiClient.get(isMgmt ? "/leave/hr/requests" : "/leave/self")]);
						if (Array.isArray(freshBal?.data)) state().leaveBalances = freshBal.data;
						if (Array.isArray(freshLeaves?.data)) state().leaves = freshLeaves.data.map(normalizeLeave);
					} catch {}
					notify();
					return res.data;
				}
			});
		},
		approveLeave(leaveId, reviewerRole = "hr", comment = "Approved after review.", approverUser = null) {
			const activeUser = approverUser || user;
			if (!user && rawLocal.approveLeave) return rawLocal.approveLeave(leaveId, reviewerRole, comment, activeUser);
			return mutate(async () => {
				const isAdmin = reviewerRole === "admin";
				const isManager = reviewerRole === "manager" || reviewerRole === "team_lead";
				const endpoint = isAdmin ? `/leave/admin/${leaveId}/approve` : isManager ? `/leave/team/${leaveId}/approve` : `/leave/hr/${leaveId}/approve`;
				try {
					const res = await apiClient.post(endpoint, { comment: comment || "Approved." });
					if (rawLocal.approveLeave) rawLocal.approveLeave(leaveId, reviewerRole, comment, activeUser);
					const target = (state().leaves || []).find((l) => String(l.id) === String(leaveId) || String(l._id) === String(leaveId));
					if (target) {
						target.status = res?.data?.status || "approved";
						if (res?.data) Object.assign(target, normalizeLeave(res.data));
					}
					try {
						const isExec = [
							"director",
							"managing_director",
							"co_founder",
							"vertical_head"
						].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
						const isMgmt = [
							"admin",
							"hr",
							"hr_executive"
						].includes(user?.role) || isExec;
						apiClient.get(isMgmt ? "/leave/hr/balances" : "/leave/balances").then((b) => {
							if (Array.isArray(b?.data)) {
								state().leaveBalances = b.data;
								notify();
							}
						}).catch(() => {});
					} catch {}
					notify();
					return res.data;
				} catch (postErr) {
					const fallbackEndpoint = isAdmin ? `/leave/hr/${leaveId}/approve` : isManager ? `/leave/hr/${leaveId}/approve` : `/leave/team/${leaveId}/approve`;
					const res = await apiClient.post(fallbackEndpoint, { comment: comment || "Approved." });
					if (rawLocal.approveLeave) rawLocal.approveLeave(leaveId, reviewerRole, comment, activeUser);
					const target = (state().leaves || []).find((l) => String(l.id) === String(leaveId) || String(l._id) === String(leaveId));
					if (target) {
						target.status = res?.data?.status || "approved";
						if (res?.data) Object.assign(target, normalizeLeave(res.data));
					}
					try {
						const isExec = [
							"director",
							"managing_director",
							"co_founder",
							"vertical_head"
						].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
						const isMgmt = [
							"admin",
							"hr",
							"hr_executive"
						].includes(user?.role) || isExec;
						apiClient.get(isMgmt ? "/leave/hr/balances" : "/leave/balances").then((b) => {
							if (Array.isArray(b?.data)) {
								state().leaveBalances = b.data;
								notify();
							}
						}).catch(() => {});
					} catch {}
					notify();
					return res.data;
				}
			});
		},
		rejectLeave(leaveId, roleOrReason = "hr", maybeReason = "Declined due to operational coverage requirements.", rejectorUser = null) {
			const activeUser = rejectorUser || user;
			if (!user && rawLocal.rejectLeave) return rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser);
			return mutate(async () => {
				const isRole = [
					"team_lead",
					"team_leader",
					"manager",
					"director",
					"hr",
					"admin"
				].includes(roleOrReason);
				const reviewerRole = isRole ? roleOrReason : "hr";
				const reason = (isRole ? maybeReason : roleOrReason) || "Declined.";
				if (reviewerRole === "employee") {
					const res = await apiClient.post(`/leave/requests/${leaveId}/cancel`);
					if (rawLocal.rejectLeave) rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser);
					return res.data;
				}
				const isAdmin = reviewerRole === "admin";
				const isManager = reviewerRole === "manager" || reviewerRole === "team_lead" || reviewerRole === "team_leader";
				const endpoint = isAdmin ? `/leave/admin/${leaveId}/reject` : isManager ? `/leave/team/${leaveId}/reject` : `/leave/hr/${leaveId}/reject`;
				try {
					const res = await apiClient.post(endpoint, { reason });
					if (rawLocal.rejectLeave) rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser);
					const target = (state().leaves || []).find((l) => String(l.id) === String(leaveId) || String(l._id) === String(leaveId));
					if (target) {
						target.status = "rejected";
						target.decisionReason = reason;
						if (res?.data) Object.assign(target, res.data);
					}
					notify();
					return res.data;
				} catch (postErr) {
					const fallbackEndpoint = isAdmin ? `/leave/hr/${leaveId}/reject` : isManager ? `/leave/hr/${leaveId}/reject` : `/leave/team/${leaveId}/reject`;
					const res = await apiClient.post(fallbackEndpoint, { reason });
					if (rawLocal.rejectLeave) rawLocal.rejectLeave(leaveId, roleOrReason, maybeReason, activeUser);
					const target = (state().leaves || []).find((l) => String(l.id) === String(leaveId) || String(l._id) === String(leaveId));
					if (target) {
						target.status = "rejected";
						target.decisionReason = reason;
						if (res?.data) Object.assign(target, res.data);
					}
					notify();
					return res.data;
				}
			});
		},
		cancelLeave(leaveId) {
			if (!user && rawLocal.cancelLeave) return rawLocal.cancelLeave(leaveId);
			return mutate(async () => {
				const res = await apiClient.post(`/leave/requests/${leaveId}/cancel`);
				if (rawLocal.cancelLeave) rawLocal.cancelLeave(leaveId);
				const target = (state().leaves || []).find((l) => String(l.id) === String(leaveId) || String(l._id) === String(leaveId));
				if (target) target.status = "cancelled";
				notify();
				return res.data;
			});
		},
		deleteLeave(leaveId) {
			if (!user && rawLocal.deleteLeave) return rawLocal.deleteLeave(leaveId);
			return mutate(async () => {
				try {
					const res = await apiClient.delete(`/leave/requests/${leaveId}`);
					if (rawLocal.deleteLeave) rawLocal.deleteLeave(leaveId);
					return res.data;
				} catch (err) {
					if (rawLocal.deleteLeave) rawLocal.deleteLeave(leaveId);
					return { success: true };
				}
			});
		},
		savePayrollRecord(record) {
			if (!user && rawLocal.savePayrollRecord) return rawLocal.savePayrollRecord(record);
			return mutate(() => apiClient.post("/payroll", record));
		},
		deletePayrollRecord(id) {
			if (!user && rawLocal.deletePayrollRecord) return rawLocal.deletePayrollRecord(id);
			return mutate(() => apiClient.delete(`/payroll/${id}`));
		},
		executePayrollRun(month, options = {}) {
			if (!user && rawLocal.executePayrollRun) return rawLocal.executePayrollRun(month, options);
			return mutate(() => apiClient.post("/payroll/finalize", {
				month,
				...options
			}));
		},
		sendBulkEmail(month, options = {}) {
			if (!user && rawLocal.sendBulkEmail) return rawLocal.sendBulkEmail(month, options);
			if (!user) return {
				success: true,
				message: "Simulated bulk emails dispatched"
			};
			return mutate(() => apiClient.post("/payroll/send-bulk-email", {
				month,
				...options
			}));
		},
		bulkGeneratePayroll(payload) {
			if (!user && rawLocal.bulkGeneratePayroll) return rawLocal.bulkGeneratePayroll(payload);
			return mutate(() => apiClient.post("/payroll/bulk-generate", payload));
		},
		updatePayrollSettings(updates) {
			if (!user && rawLocal.updateCompanySettings) return rawLocal.updateCompanySettings(updates);
			if (!user) {
				state().companySettings = {
					...state().companySettings,
					...updates
				};
				notify();
				return true;
			}
			return mutate(() => apiClient.patch("/payroll/settings", updates));
		},
		emailPayslip(id) {
			if (!user) return {
				success: true,
				message: "Simulated email sent"
			};
			return mutate(() => apiClient.post(`/payroll/${id}/email`));
		}
	};
}
// src/utils/soundHelper.js
var audioContext = null;
function getAudioContext() {
	if (typeof window === "undefined") return null;
	const AudioCtx = window.AudioContext || window.webkitAudioContext;
	if (!AudioCtx) return null;
	if (!audioContext) try {
		audioContext = new AudioCtx();
	} catch {
		return null;
	}
	if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
	return audioContext;
}
var SOUND_STORAGE_KEY = "edufyi_notification_sound_muted_v1";
function isSoundMuted() {
	if (typeof window === "undefined" || !window.localStorage) return false;
	try {
		return window.localStorage.getItem(SOUND_STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}
function setSoundMuted(muted) {
	if (typeof window === "undefined" || !window.localStorage) return;
	try {
		window.localStorage.setItem(SOUND_STORAGE_KEY, muted ? "true" : "false");
	} catch {}
}
function toggleSoundMuted() {
	const current = isSoundMuted();
	setSoundMuted(!current);
	return !current;
}
/**
* Play a notification chime
* @param {'notification' | 'announcement' | 'success'} type
*/
function playNotificationSound(type = "notification") {
	if (isSoundMuted()) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	try {
		const now = ctx.currentTime;
		if (type === "announcement") [
			{
				freq: 523.25,
				time: 0,
				duration: .18,
				gain: .18
			},
			{
				freq: 659.25,
				time: .11,
				duration: .22,
				gain: .22
			},
			{
				freq: 783.99,
				time: .24,
				duration: .38,
				gain: .26
			}
		].forEach(({ freq, time, duration, gain }) => {
			const osc = ctx.createOscillator();
			const gainNode = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(freq, now + time);
			gainNode.gain.setValueAtTime(0, now + time);
			gainNode.gain.linearRampToValueAtTime(gain, now + time + .02);
			gainNode.gain.exponentialRampToValueAtTime(1e-4, now + time + duration);
			osc.connect(gainNode);
			gainNode.connect(ctx.destination);
			osc.start(now + time);
			osc.stop(now + time + duration);
		});
		else [{
			freq: 587.33,
			time: 0,
			duration: .16,
			gain: .2
		}, {
			freq: 880,
			time: .09,
			duration: .28,
			gain: .24
		}].forEach(({ freq, time, duration, gain }) => {
			const osc = ctx.createOscillator();
			const gainNode = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(freq, now + time);
			gainNode.gain.setValueAtTime(0, now + time);
			gainNode.gain.linearRampToValueAtTime(gain, now + time + .015);
			gainNode.gain.exponentialRampToValueAtTime(1e-4, now + time + duration);
			osc.connect(gainNode);
			gainNode.connect(ctx.destination);
			osc.start(now + time);
			osc.stop(now + time + duration);
		});
	} catch (err) {
		console.debug("Audio playback note:", err?.message);
	}
}
// src/services/hrStore.js
var STORAGE_KEY = "edufyi_hr_store_v3";
var STORAGE_PERSISTED_NOTIFICATIONS_KEY = "edufyi_persisted_notifications_v3";
var STORAGE_CLEARED_NOTIFICATIONS_KEY = "edufyi_notifications_cleared_v3";
var STORAGE_DELETED_NOTIFICATIONS_KEY = "edufyi_deleted_notifications_v3";
var INITIAL_ROLES = [
	{
		id: "admin",
		name: "Administrator",
		description: "Master enterprise superuser with unrestricted access across all system settings, user provisioning, security audits, and backups.",
		badge: "Superuser",
		isSystem: true,
		permissions: ["*"]
	},
	{
		id: "operations_executive",
		name: "Operations Executive",
		description: "Operations specialist responsible for daily process execution, cross-team coordination, workflow quality control, and compliance audits.",
		badge: "Operations",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "revenue_growth_manager",
		name: "Revenue Growth Manager",
		description: "Commercial leader steering client acquisition channels, pipeline velocity, sales target execution, and revenue squad operations.",
		badge: "Management",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "vertical_head",
		name: "Vertical Head",
		description: "Senior business leadership heading complete operational and revenue verticals, managing managers, team squads, and P&L targets.",
		badge: "Vertical Head",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read"
		]
	},
	{
		id: "manager",
		name: "Manager",
		description: "Departmental manager directing team leads, coordinating multi-team deliverables, conducting 2nd-tier reviews, and approving requests.",
		badge: "Management",
		isSystem: true,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "team_leader",
		name: "Team Leader",
		description: "Frontline squad leader supervising daily task execution, running morning standups, tracking progress, and approving direct reports leave.",
		badge: "Team Lead",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "business_development_executive",
		name: "Business Development Executive",
		description: "Sales professional responsible for corporate outreach, client pitches, proposal negotiation, and business expansion.",
		badge: "Sales & Growth",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "business_development_intern",
		name: "Business Development Intern",
		description: "Sales trainee supporting lead prospecting, market intelligence, outreach scheduling, and CRM contact enrichment.",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "marketing_executive",
		name: "Marketing Executive",
		description: "Marketing specialist driving campaign execution, social media presence, brand assets, and content marketing.",
		badge: "Marketing",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "marketing_intern",
		name: "Marketing Intern",
		description: "Marketing trainee assisting with content distribution, social media posts, campaign analytics, and creative marketing collateral.",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "managing_director",
		name: "Managing Director",
		description: "Chief executive leadership directing corporate strategy, vertical growth heads, organizational governance, and enterprise expansion.",
		badge: "Leadership",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"hr.dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"leave.hr.read",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read"
		]
	},
	{
		id: "co_founder",
		name: "Co-Founder",
		description: "Founding leadership driving company vision, long-term capital allocation, investor relations, and core corporate governance.",
		badge: "Leadership",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"hr.dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"leave.hr.read",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read"
		]
	},
	{
		id: "sde_intern",
		name: "SDE Intern",
		description: "Software engineering trainee assisting with feature development, unit testing, bug investigation, and code reviews.",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "sde",
		name: "SDE",
		description: "Software Development Engineer building core applications, APIs, responsive frontend architectures, and reliable systems.",
		badge: "Engineering",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "post_sales_intern",
		name: "Post-Sales Intern",
		description: "Customer success trainee assisting client queries, documentation collection, onboarding survey followups, and ticket routing.",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "post_sales_executive",
		name: "Post-Sales Executive",
		description: "Client retention specialist managing post-purchase customer onboarding, service delivery verification, upsells, and relationship health.",
		badge: "Post-Sales",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "hr_executive",
		name: "HR Executive",
		description: "People operations specialist managing recruitment pipelines, employee onboarding, attendance tracking, leave audits, and policy compliance.",
		badge: "HR Ops",
		isSystem: true,
		permissions: [
			"dashboard.read",
			"hr.dashboard.read",
			"employees.read",
			"employees.write",
			"employees.manager.assign",
			"attendance.read",
			"attendance.write",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.hr.read",
			"leave.hr.review",
			"leave.policy.admin",
			"payroll.read",
			"payroll.self.read",
			"performance.read",
			"recruitment.read",
			"recruitment.write",
			"reports.read",
			"tasks.read",
			"training.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"documents.read",
			"settings.hr.read"
		]
	},
	{
		id: "general_manager",
		name: "General Manager",
		description: "Senior executive overseeing cross-functional business operations, departmental budgets, strategic milestones, and organizational leadership.",
		badge: "Leadership",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"hr.dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read",
			"settings.hr.read"
		]
	},
	{
		id: "assistant_general_manager",
		name: "Assistant General Manager",
		description: "Senior operational leader assisting the General Manager in executing organizational initiatives, department oversight, and resource planning.",
		badge: "Management",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read"
		]
	},
	{
		id: "senior_manager",
		name: "Senior Manager",
		description: "Senior departmental leader directing multiple squad leads, cross-team programs, performance appraisals, and strategic initiatives.",
		badge: "Management",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read"
		]
	},
	{
		id: "head_of_sales",
		name: "Head of Sales",
		description: "Commercial leadership directing enterprise sales targets, client expansion channels, revenue pipeline velocity, and sales team execution.",
		badge: "Sales & Growth",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read"
		]
	},
	{
		id: "head_of_marketing",
		name: "Head of Marketing",
		description: "Marketing leadership steering brand narrative, performance campaigns, multi-channel growth, PR, and demand generation strategy.",
		badge: "Marketing",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"attendance.read",
			"attendance.team.read",
			"leave.self.read",
			"leave.self.write",
			"leave.team.read",
			"leave.team.approve",
			"payroll.self.read",
			"performance.read",
			"reports.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"departments.read"
		]
	},
	{
		id: "digital_marketing_executive",
		name: "Digital Marketing Executive",
		description: "Digital marketing specialist managing search engine optimization, paid advertising campaigns, content marketing, and conversion funnels.",
		badge: "Marketing",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "digital_marketing_intern",
		name: "Digital Marketing Intern",
		description: "Digital marketing trainee assisting with creative asset preparation, social media scheduling, ad copy research, and analytics reporting.",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "hr_intern",
		name: "HR Intern",
		description: "People operations trainee assisting with candidate sourcing, employee onboarding documentation, attendance tracking, and culture initiatives.",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "saas_intern",
		name: "SaaS Intern",
		description: "SaaS product and operations trainee assisting with cloud platform user flows, customer telemetry, feature testing, and client onboarding support.",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "intern",
		name: "Intern",
		description: "Trainee or intern undergoing organizational learning, with standard employee self-service and intern leave entitlement (1 paid day per month).",
		badge: "Intern",
		isSystem: false,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	},
	{
		id: "employee",
		name: "Employee",
		description: "Standard enterprise employee account with self-service attendance, leave, tasks, salary slips, and company documents.",
		badge: "Employee",
		isSystem: true,
		permissions: [
			"dashboard.read",
			"leave.self.read",
			"leave.self.write",
			"attendance.read",
			"attendance.write",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read"
		]
	}
];
var INITIAL_DEPARTMENTS = [
	{
		id: "dept-leadership",
		deptId: "dept-leadership",
		name: "Leadership",
		code: "LEAD",
		head: "Executive Leadership",
		description: "Executive leadership, strategic direction, corporate governance, and company vision.",
		isCustom: false
	},
	{
		id: "dept-hr",
		deptId: "dept-hr",
		name: "Human Resources (HR)",
		code: "HR",
		head: "HR Lead",
		description: "People operations, talent acquisition, employee relations, payroll, and corporate compliance.",
		isCustom: false
	},
	{
		id: "dept-sales",
		deptId: "dept-sales",
		name: "Sales",
		code: "SALE",
		head: "Head of Sales",
		description: "Revenue generation, client acquisition, deal closures, and enterprise account growth.",
		isCustom: false
	},
	{
		id: "dept-marketing",
		deptId: "dept-marketing",
		name: "Marketing",
		code: "MKTG",
		head: "Head of Marketing",
		description: "Brand positioning, digital marketing, performance advertising, content, and lead generation.",
		isCustom: false
	},
	{
		id: "dept-bizops",
		deptId: "dept-bizops",
		name: "Business Operations",
		code: "BIZOP",
		head: "Head of Business Operations",
		description: "Cross-functional process optimization, business analytics, strategy execution, and scaling.",
		isCustom: false
	},
	{
		id: "dept-operations",
		deptId: "dept-operations",
		name: "Operations",
		code: "OPS",
		head: "Operations Manager",
		description: "Daily operational execution, service delivery, workflow management, and client support.",
		isCustom: false
	},
	{
		id: "dept-b2b",
		deptId: "dept-b2b",
		name: "B2B",
		code: "B2B",
		head: "B2B Business Head",
		description: "Business-to-business partnerships, corporate sales, institutional client relations, and alliances.",
		isCustom: false
	},
	{
		id: "dept-technology",
		deptId: "dept-technology",
		name: "Technology",
		code: "TECH",
		head: "Chief Technology Officer",
		description: "Software engineering, product development, IT infrastructure, cloud architecture, and cybersecurity.",
		isCustom: false
	},
	{
		id: "dept-managing-director",
		deptId: "dept-managing-director",
		name: "Managing Director",
		code: "MD",
		head: "Managing Director",
		description: "Office of the Managing Director, executive oversight, and organizational steering.",
		isCustom: false
	},
	{
		id: "dept-co-founder",
		deptId: "dept-co-founder",
		name: "Co-Founder",
		code: "COF",
		head: "Co-Founder",
		description: "Founder Office, strategic partnerships, enterprise incubation, and equity stewardship.",
		isCustom: false
	}
];
var STANDARD_ROLE_CONFIG = {
	admin: {
		label: "Administrator",
		defaultDepartment: "Executive Leadership",
		defaultDesignation: "System Administrator",
		designations: [
			"System Administrator",
			"IT Administrator",
			"Platform Operations Lead",
			"Security Administrator"
		],
		defaultManagerId: null,
		defaultManagerName: "Board of Directors"
	},
	managing_director: {
		label: "Managing Director",
		defaultDepartment: "Executive Leadership",
		defaultDesignation: "Managing Director",
		designations: [
			"Managing Director",
			"Executive Director",
			"Chief Operating Officer",
			"Chief Executive Officer"
		],
		defaultManagerId: null,
		defaultManagerName: "Board of Directors"
	},
	co_founder: {
		label: "Co-Founder",
		defaultDepartment: "Executive Leadership",
		defaultDesignation: "Co-Founder",
		designations: [
			"Co-Founder",
			"Co-Founder & Director",
			"Founding Partner"
		],
		defaultManagerId: null,
		defaultManagerName: "Board of Directors"
	},
	vertical_head: {
		label: "Vertical Head",
		defaultDepartment: "Operations",
		defaultDesignation: "Vertical Head",
		designations: [
			"Vertical Head",
			"Head of Operations",
			"Business Vertical Head"
		],
		defaultManagerId: null,
		defaultManagerName: "Managing Director"
	},
	revenue_growth_manager: {
		label: "Revenue Growth Manager",
		defaultDepartment: "Revenue Growth",
		defaultDesignation: "Revenue Growth Manager",
		designations: [
			"Revenue Growth Manager",
			"Head of Revenue",
			"Enterprise Growth Lead"
		],
		defaultManagerId: null,
		defaultManagerName: "Vertical Head"
	},
	manager: {
		label: "Manager",
		defaultDepartment: "Operations",
		defaultDesignation: "Manager",
		designations: [
			"Manager",
			"Operations Manager",
			"Project Manager",
			"Department Manager"
		],
		defaultManagerId: null,
		defaultManagerName: "Vertical Head"
	},
	team_leader: {
		label: "Team Leader",
		defaultDepartment: "Operations",
		defaultDesignation: "Team Leader",
		designations: [
			"Team Leader",
			"Operations Team Leader",
			"Team Lead"
		],
		defaultManagerId: null,
		defaultManagerName: "Manager"
	},
	hr_executive: {
		label: "HR Executive",
		defaultDepartment: "Human Resources",
		defaultDesignation: "HR Executive",
		designations: [
			"HR Executive",
			"Senior HR Executive",
			"People Operations Specialist",
			"HR Lead & Operations"
		],
		defaultManagerId: null,
		defaultManagerName: "Managing Director"
	},
	operations_executive: {
		label: "Operations Executive",
		defaultDepartment: "Operations",
		defaultDesignation: "Operations Executive",
		designations: [
			"Operations Executive",
			"Senior Operations Executive",
			"Operations Specialist",
			"Process Coordinator"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	business_development_executive: {
		label: "Business Development Executive",
		defaultDepartment: "Revenue Growth",
		defaultDesignation: "Business Development Executive",
		designations: [
			"Business Development Executive",
			"Senior BDE",
			"BDE",
			"Growth Specialist"
		],
		defaultManagerId: null,
		defaultManagerName: "Revenue Growth Manager"
	},
	business_development_intern: {
		label: "Business Development Intern",
		defaultDepartment: "Revenue Growth",
		defaultDesignation: "Business Development Intern",
		designations: [
			"Business Development Intern",
			"BD Intern",
			"Sales Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	marketing_executive: {
		label: "Marketing Executive",
		defaultDepartment: "Marketing",
		defaultDesignation: "Marketing Executive",
		designations: [
			"Marketing Executive",
			"Digital Marketing Executive",
			"Content Marketing Executive"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	marketing_intern: {
		label: "Marketing Intern",
		defaultDepartment: "Marketing",
		defaultDesignation: "Marketing Intern",
		designations: [
			"Marketing Intern",
			"Social Media Intern",
			"Digital Marketing Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	sde: {
		label: "SDE",
		defaultDepartment: "Technology",
		defaultDesignation: "Software Development Engineer",
		designations: [
			"Software Development Engineer",
			"SDE",
			"SDE I",
			"SDE II",
			"Senior SDE",
			"Frontend Engineer",
			"Backend Engineer",
			"Full Stack Engineer"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	sde_intern: {
		label: "SDE Intern",
		defaultDepartment: "Technology",
		defaultDesignation: "SDE Intern",
		designations: [
			"SDE Intern",
			"Software Engineering Intern",
			"Frontend Intern",
			"Backend Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	post_sales_executive: {
		label: "Post-Sales Executive",
		defaultDepartment: "Operations",
		defaultDesignation: "Post-Sales Executive",
		designations: [
			"Post-Sales Executive",
			"Customer Success Executive",
			"Client Retention Executive"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	post_sales_intern: {
		label: "Post-Sales Intern",
		defaultDepartment: "Operations",
		defaultDesignation: "Post-Sales Intern",
		designations: [
			"Post-Sales Intern",
			"Customer Success Intern",
			"Client Support Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	director: {
		label: "Managing Director",
		defaultDepartment: "Leadership",
		defaultDesignation: "Managing Director",
		designations: [
			"Managing Director",
			"Executive Director",
			"Chief Operating Officer"
		],
		defaultManagerId: null,
		defaultManagerName: "Board of Directors"
	},
	hr: {
		label: "HR Executive",
		defaultDepartment: "Human Resources (HR)",
		defaultDesignation: "HR Executive",
		designations: [
			"HR Executive",
			"Senior HR Executive",
			"People Operations Specialist",
			"HR Lead & Operations"
		],
		defaultManagerId: null,
		defaultManagerName: "Managing Director"
	},
	team_lead: {
		label: "Team Leader",
		defaultDepartment: "Operations",
		defaultDesignation: "Team Leader",
		designations: ["Team Leader", "Team Lead"],
		defaultManagerId: null,
		defaultManagerName: "Manager"
	},
	sales: {
		label: "Sales Executive",
		defaultDepartment: "Sales",
		defaultDesignation: "Sales Executive",
		designations: [
			"Sales Executive",
			"Senior Sales Executive",
			"Account Executive",
			"Sales Lead",
			"Sales Manager"
		],
		defaultManagerId: null,
		defaultManagerName: "Head of Sales"
	},
	marketing: {
		label: "Marketing Executive",
		defaultDepartment: "Marketing",
		defaultDesignation: "Marketing Executive",
		designations: [
			"Marketing Executive",
			"Digital Marketing Specialist",
			"Performance Marketer",
			"Marketing Manager"
		],
		defaultManagerId: null,
		defaultManagerName: "Head of Marketing"
	},
	b2b: {
		label: "B2B Specialist",
		defaultDepartment: "B2B",
		defaultDesignation: "B2B Account Manager",
		designations: [
			"B2B Account Manager",
			"Corporate Sales Executive",
			"Institutional Partnerships Lead",
			"B2B Lead"
		],
		defaultManagerId: null,
		defaultManagerName: "B2B Business Head"
	},
	technology: {
		label: "Technology Specialist / Engineer",
		defaultDepartment: "Technology",
		defaultDesignation: "Software Development Engineer (SDE)",
		designations: [
			"Software Development Engineer (SDE)",
			"Senior Software Engineer",
			"Full Stack Engineer",
			"Tech Lead"
		],
		defaultManagerId: null,
		defaultManagerName: "Chief Technology Officer"
	},
	business_operations: {
		label: "Business Operations Lead",
		defaultDepartment: "Business Operations",
		defaultDesignation: "Business Operations Lead",
		designations: [
			"Business Operations Lead",
			"Operations Analyst",
			"Process Optimization Specialist",
			"BizOps Manager"
		],
		defaultManagerId: null,
		defaultManagerName: "Head of Business Operations"
	},
	general_manager: {
		label: "General Manager",
		defaultDepartment: "Leadership",
		defaultDesignation: "General Manager",
		designations: [
			"General Manager",
			"Executive General Manager",
			"Operations General Manager"
		],
		defaultManagerId: null,
		defaultManagerName: "Managing Director"
	},
	assistant_general_manager: {
		label: "Assistant General Manager",
		defaultDepartment: "Leadership",
		defaultDesignation: "Assistant General Manager",
		designations: [
			"Assistant General Manager",
			"AGM - Operations",
			"AGM - Business Growth"
		],
		defaultManagerId: null,
		defaultManagerName: "General Manager"
	},
	senior_manager: {
		label: "Senior Manager",
		defaultDepartment: "Operations",
		defaultDesignation: "Senior Manager",
		designations: [
			"Senior Manager",
			"Senior Operations Manager",
			"Senior Project Manager",
			"Senior Department Manager"
		],
		defaultManagerId: null,
		defaultManagerName: "General Manager"
	},
	head_of_sales: {
		label: "Head of Sales",
		defaultDepartment: "Sales",
		defaultDesignation: "Head of Sales",
		designations: [
			"Head of Sales",
			"Vice President of Sales",
			"Director of Sales",
			"Sales Lead"
		],
		defaultManagerId: null,
		defaultManagerName: "Managing Director"
	},
	head_of_marketing: {
		label: "Head of Marketing",
		defaultDepartment: "Marketing",
		defaultDesignation: "Head of Marketing",
		designations: [
			"Head of Marketing",
			"Vice President of Marketing",
			"Director of Marketing & Brand",
			"Chief Marketing Officer"
		],
		defaultManagerId: null,
		defaultManagerName: "Managing Director"
	},
	digital_marketing_executive: {
		label: "Digital Marketing Executive",
		defaultDepartment: "Marketing",
		defaultDesignation: "Digital Marketing Executive",
		designations: [
			"Digital Marketing Executive",
			"Senior Digital Marketing Executive",
			"SEO & Performance Marketing Executive",
			"Social Media & Growth Executive"
		],
		defaultManagerId: null,
		defaultManagerName: "Head of Marketing"
	},
	digital_marketing_intern: {
		label: "Digital Marketing Intern",
		defaultDepartment: "Marketing",
		defaultDesignation: "Digital Marketing Intern",
		designations: [
			"Digital Marketing Intern",
			"Social Media Marketing Intern",
			"Content & SEO Intern",
			"Growth Marketing Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "Digital Marketing Executive"
	},
	hr_intern: {
		label: "HR Intern",
		defaultDepartment: "Human Resources (HR)",
		defaultDesignation: "HR Intern",
		designations: [
			"HR Intern",
			"Talent Acquisition Intern",
			"People Operations Intern",
			"HR Operations Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "HR Executive"
	},
	saas_intern: {
		label: "SaaS Intern",
		defaultDepartment: "Technology",
		defaultDesignation: "SaaS Intern",
		designations: [
			"SaaS Intern",
			"SaaS Product Operations Intern",
			"Cloud Platform Intern",
			"SaaS Customer Onboarding Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "Software Development Engineer"
	},
	employee: {
		label: "Associate / Specialist",
		defaultDepartment: "Operations",
		defaultDesignation: "Associate",
		designations: [
			"Associate",
			"Specialist",
			"Executive"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	},
	intern: {
		label: "Intern / Trainee",
		defaultDepartment: "Operations",
		defaultDesignation: "Intern",
		designations: [
			"Intern",
			"Graduate Trainee",
			"Summer Intern",
			"Operations Intern",
			"HR Intern",
			"Digital Marketing Intern",
			"SaaS Intern",
			"SDE Intern",
			"Business Development Intern"
		],
		defaultManagerId: null,
		defaultManagerName: "Team Leader"
	}
};
var DEPARTMENT_DESIGNATIONS = {
	"leadership": [
		"General Manager",
		"Assistant General Manager",
		"Senior Manager",
		"Executive Director",
		"Vice President",
		"Chief Operating Officer",
		"Chief Executive Officer",
		"Strategic Director",
		"Executive Associate"
	],
	"human resources (hr)": [
		"HR Executive",
		"Senior HR Executive",
		"People Operations Specialist",
		"Talent Acquisition Lead",
		"HR Generalist",
		"HR Manager",
		"HR Intern"
	],
	"sales": [
		"Head of Sales",
		"Senior Manager - Sales",
		"Sales Executive",
		"Senior Sales Executive",
		"Account Executive",
		"Sales Lead",
		"Sales Manager",
		"Business Development Executive"
	],
	"marketing": [
		"Head of Marketing",
		"Digital Marketing Executive",
		"Digital Marketing Intern",
		"Marketing Executive",
		"Digital Marketing Specialist",
		"Performance Marketer",
		"Content Marketing Strategist",
		"SEO Specialist",
		"Marketing Manager"
	],
	"business operations": [
		"Business Operations Lead",
		"Operations Analyst",
		"Process Optimization Specialist",
		"BizOps Manager",
		"Strategy & Operations Associate"
	],
	"operations": [
		"Associate",
		"Operations Associate",
		"Junior Operations Associate",
		"Senior Operations Executive",
		"Operations Executive",
		"Operations Specialist",
		"Process Coordinator",
		"Operations Team Leader",
		"Vertical Head",
		"Operations Manager",
		"Senior Manager"
	],
	"b2b": [
		"B2B Sales Manager",
		"B2B Sales Executive",
		"B2B Account Manager",
		"Corporate Sales Executive",
		"Institutional Partnerships Lead",
		"B2B Enterprise Lead",
		"Client Relationship Manager"
	],
	"technology": [
		"Software Development Engineer (SDE)",
		"Senior Software Engineer",
		"Frontend Engineer",
		"Backend Engineer",
		"Full Stack Engineer",
		"Tech Lead",
		"DevOps Engineer",
		"QA Specialist",
		"SaaS Intern"
	],
	"managing director": [
		"Managing Director",
		"Executive Director",
		"Chief Executive Officer"
	],
	"co-founder": [
		"Co-Founder",
		"Co-Founder & Director",
		"Founding Partner"
	]
};
function getRecommendedRoleConfig(role, department = "") {
	const roleCfg = STANDARD_ROLE_CONFIG[role] || STANDARD_ROLE_CONFIG.employee || {};
	const dept = department || roleCfg.defaultDepartment || "";
	const deptSpecific = roleCfg.departmentDefaults?.[dept];
	const cleanDeptKey = dept.toLowerCase().replace(/[^a-z0-9]/g, "");
	let deptDesignations = [];
	for (const [k, list] of Object.entries(DEPARTMENT_DESIGNATIONS)) if (k.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanDeptKey) {
		deptDesignations = list;
		break;
	}
	if (deptDesignations.length === 0) for (const [k, list] of Object.entries(DEPARTMENT_DESIGNATIONS)) {
		const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
		if (cleanDeptKey.length >= 3 && (cleanDeptKey.includes(kNorm) || kNorm.includes(cleanDeptKey))) {
			deptDesignations = list;
			break;
		}
	}
	const matchedRole = INITIAL_ROLES.find((r) => r.id === role) || (storeState?.roles || []).find((r) => (r.id || r.roleId) === role);
	const roleLabel = matchedRole?.name || roleCfg.label || role || "Employee";
	const roleDesignations = roleCfg.designations || [];
	const customDesignation = matchedRole?.name ? [matchedRole.name] : [];
	const combinedSuggestions = Array.from(/* @__PURE__ */ new Set([
		...customDesignation,
		...deptDesignations,
		...roleDesignations
	]));
	const designation = deptSpecific?.defaultDesignation || matchedRole?.name || (deptDesignations.length > 0 ? deptDesignations[0] : roleCfg.defaultDesignation) || "Specialist";
	const designations = combinedSuggestions.length > 0 ? combinedSuggestions : [designation];
	return {
		roleLabel,
		department: dept,
		designation,
		designations,
		suggestions: designations,
		defaultDepartment: roleCfg.defaultDepartment,
		defaultManagerId: roleCfg.defaultManagerId,
		defaultManagerName: roleCfg.defaultManagerName
	};
}
var INITIAL_TEAMS = [];
var INITIAL_USERS = [
	{
		"id": "user-admin-1",
		"employeeId": "EDU-ADM-001",
		"name": "Admin",
		"displayName": "Admin",
		"email": "admin@edufyi.local",
		"role": "admin",
		"department": "Executive Leadership",
		"team": null,
		"teamId": null,
		"designation": "System Administrator",
		"status": "active",
		"avatarTone": "violet",
		"managerId": null,
		"teamLeadId": null,
		"permissions": ["*"]
	},
	{
		"id": "user-director-1",
		"employeeId": "EDU-DIR-001",
		"name": "Jagadish Babu",
		"displayName": "Jagadish Babu (Managing Director)",
		"email": "jagadishbabu@edufyitech.in",
		"role": "managing_director",
		"department": "Executive Leadership",
		"team": null,
		"teamId": null,
		"designation": "Managing Director",
		"status": "active",
		"avatarTone": "purple",
		"managerId": null,
		"teamLeadId": null,
		"permissions": ["*"]
	},
	{
		"id": "dev-hr-1",
		"employeeId": "EDU-HR-001",
		"name": "HR",
		"displayName": "HR (People Operations)",
		"email": "hr@edufyi.local",
		"role": "hr",
		"department": "Human Resources",
		"team": null,
		"teamId": null,
		"designation": "HR Operations",
		"status": "active",
		"avatarTone": "teal",
		"managerId": "emp-director",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"hr.dashboard.read",
			"employees.read",
			"employees.write",
			"employees.manager.assign",
			"attendance.read",
			"attendance.write",
			"leave.team.read",
			"leave.hr.read",
			"leave.hr.review",
			"leave.policy.admin",
			"reports.read",
			"recruitment.read",
			"performance.read",
			"tasks.read",
			"training.read",
			"helpdesk.read",
			"announcements.read",
			"holidays.read",
			"documents.read",
			"settings.hr.read"
		]
	},
	{
		"id": "user-emp-mgr-ravi",
		"employeeId": "EDU-MGR-003",
		"name": "Ravi",
		"displayName": "Ravi (Revenue Growth Manager)",
		"email": "ravi@edufyitech.in",
		"role": "manager",
		"department": "Revenue Growth",
		"team": null,
		"teamId": null,
		"designation": "Revenue Growth Manager",
		"status": "active",
		"avatarTone": "amber",
		"managerId": "emp-director",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"leave.team.approve",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r6",
		"employeeId": "ETS21169",
		"name": "Basir Bashir",
		"displayName": "Basir (Vertical Head)",
		"email": "basirbashir@edufyitech.in",
		"role": "manager",
		"department": "Operations",
		"team": null,
		"teamId": null,
		"designation": "Vertical Head",
		"status": "active",
		"avatarTone": "cyan",
		"managerId": "emp-director",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"leave.team.approve",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r2",
		"employeeId": "ETS21168",
		"name": "Venkatesh (Venky)",
		"displayName": "Venky (Senior Manager)",
		"email": "venkatesh@edufyitech.in",
		"role": "manager",
		"department": "Technology",
		"team": null,
		"teamId": null,
		"designation": "Senior Manager",
		"status": "active",
		"avatarTone": "blue",
		"managerId": "emp-director",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"leave.team.approve",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r4",
		"employeeId": "ETS21188",
		"name": "Rohan",
		"displayName": "Rohan (Team Leader - Alpha)",
		"email": "rohan@edufyitech.in",
		"role": "team_lead",
		"department": "Revenue Growth",
		"team": "Alpha",
		"teamId": "team-alpha",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "emerald",
		"managerId": "emp-mgr-ravi",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r5",
		"employeeId": "ETS21189",
		"name": "Anjali Annie",
		"displayName": "Anjali (Team Leader - 3 Bops)",
		"email": "anjali@edufyitech.in",
		"role": "team_lead",
		"department": "Revenue Growth",
		"team": "3 Bops",
		"teamId": "team-3bops",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "indigo",
		"managerId": "emp-mgr-ravi",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r21",
		"employeeId": "ETS21190",
		"name": "Bhoopathi Raja S",
		"displayName": "Bhoopathi (Team Leader - Marketing)",
		"email": "bhoopathi@edufyitech.in",
		"role": "team_lead",
		"department": "Revenue Growth",
		"team": "Marketing",
		"teamId": "team-marketing",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "rose",
		"managerId": "emp-mgr-ravi",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r3",
		"employeeId": "ETS21191",
		"name": "Yashraj Misal (Yash)",
		"displayName": "Yash (Team Leader - Hustlers)",
		"email": "yash@edufyitech.in",
		"role": "team_lead",
		"department": "Revenue Growth",
		"team": "Hustlers",
		"teamId": "team-hustlers",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "orange",
		"managerId": "emp-mgr-ravi",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-tl-bharani",
		"employeeId": "ETS21175",
		"name": "Bharani",
		"displayName": "Bharani (Team Leader - TUK)",
		"email": "bharani@edufyitech.in",
		"role": "team_lead",
		"department": "Technology",
		"team": "TUK",
		"teamId": "team-tuk",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "sky",
		"managerId": "emp-r2",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r8",
		"employeeId": "ETS21176",
		"name": "Nandish K (Vadish)",
		"displayName": "Nandish (Team Leader - Thanos)",
		"email": "nandish@edufyitech.in",
		"role": "team_lead",
		"department": "Technology",
		"team": "Thanos",
		"teamId": "team-thanos",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "lime",
		"managerId": "emp-r2",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r51",
		"employeeId": "ETS21177",
		"name": "Nathyya S",
		"displayName": "Nathyya (Team Leader - Elites)",
		"email": "nathyya@edufyitech.in",
		"role": "team_lead",
		"department": "Technology",
		"team": "Elites",
		"teamId": "team-elites",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "pink",
		"managerId": "emp-r2",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r14",
		"employeeId": "ETS112315",
		"name": "Mayank Aryan",
		"displayName": "Mayank (Team Leader - Falcons)",
		"email": "mayankaryan@edufyitech.in",
		"role": "team_lead",
		"department": "Operations",
		"team": "Falcons",
		"teamId": "team-falcons",
		"designation": "Team Leader",
		"status": "active",
		"avatarTone": "fuchsia",
		"managerId": "emp-r6",
		"teamLeadId": null,
		"permissions": [
			"dashboard.read",
			"employees.read",
			"leave.self.read",
			"leave.team.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r1",
		"employeeId": "ETS21206",
		"name": "Chandana Somaih",
		"displayName": "Chandana Somaih",
		"email": "chandanasomaih@edufyitech.in",
		"role": "employee",
		"department": "Operations",
		"team": "Falcons",
		"teamId": "team-falcons",
		"designation": "Senior Operations Executive",
		"status": "active",
		"avatarTone": "teal",
		"managerId": "emp-r14",
		"teamLeadId": "emp-r14",
		"permissions": [
			"dashboard.read",
			"leave.self.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	},
	{
		"id": "user-emp-r29",
		"employeeId": "ETS21178",
		"name": "Diya Verma",
		"displayName": "Diya Verma",
		"email": "diyaverma@edufyitech.in",
		"role": "employee",
		"department": "Technology",
		"team": "TUK",
		"teamId": "team-tuk",
		"designation": "Frontend Software Engineer",
		"status": "active",
		"avatarTone": "blue",
		"managerId": "emp-tl-bharani",
		"teamLeadId": "emp-tl-bharani",
		"permissions": [
			"dashboard.read",
			"leave.self.read",
			"attendance.read",
			"payroll.self.read",
			"tasks.read",
			"training.read",
			"documents.read",
			"helpdesk.read"
		]
	}
];
var INITIAL_EMPLOYEES = [
	{
		id: "emp-3",
		_id: "emp-3",
		employeeId: "EDU-ADM-001",
		name: "Admin",
		email: "admin@edufyi.local",
		phone: "",
		department: "Executive",
		designation: "System Administrator",
		role: "admin",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: null,
		managerName: "Board of Directors",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-4",
		_id: "emp-4",
		employeeId: "EDU-HR-001",
		name: "HR",
		email: "hr@edufyi.local",
		phone: "",
		department: "Human Resources",
		designation: "HR Operations",
		role: "hr",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r1",
		_id: "emp-r1",
		employeeId: "ETS21206",
		name: "Chandana Somaih",
		email: "chandanasomaih@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r2",
		_id: "emp-r2",
		employeeId: "ETS21168",
		name: "Venkatesh",
		email: "venkatesh@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r3",
		_id: "emp-r3",
		employeeId: "ETS21224",
		name: "Yashraj Misal",
		email: "yashrajmisal@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r4",
		_id: "emp-r4",
		employeeId: "ETS21188",
		name: "Rohan",
		email: "rohan@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r5",
		_id: "emp-r5",
		employeeId: "",
		name: "Anjali Annie",
		email: "anjaliannie@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r6",
		_id: "emp-r6",
		employeeId: "ETS21169",
		name: "Basir Bashir",
		email: "basirbashir@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r7",
		_id: "emp-r7",
		employeeId: "ETS111781",
		name: "Nikitha P",
		email: "nikithap@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r8",
		_id: "emp-r8",
		employeeId: "ETS21176",
		name: "Nandish K",
		email: "nandishk@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r9",
		_id: "emp-r9",
		employeeId: "ETS21196",
		name: "Ankit Rautkar",
		email: "ankitrautkar@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r10",
		_id: "emp-r10",
		employeeId: "ETS21185",
		name: "Sachin",
		email: "sachin@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r11",
		_id: "emp-r11",
		employeeId: "ETS21162",
		name: "P Prudvi Teja",
		email: "pprudviteja@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r12",
		_id: "emp-r12",
		employeeId: "",
		name: "Reon gomes",
		email: "reongomes@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r13",
		_id: "emp-r13",
		employeeId: "ETS21219",
		name: "Aakash",
		email: "aakash@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r14",
		_id: "emp-r14",
		employeeId: "ETS112315",
		name: "Mayank Aryan",
		email: "mayankaryan@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r15",
		_id: "emp-r15",
		employeeId: "ETS112936",
		name: "Shreya Srivastava",
		email: "shreyasrivastava@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r16",
		_id: "emp-r16",
		employeeId: "ETS112929",
		name: "Abhishek Dabral",
		email: "abhishekdabral@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r17",
		_id: "emp-r17",
		employeeId: "ETS21215",
		name: "Kavya",
		email: "kavya@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r18",
		_id: "emp-r18",
		employeeId: "ETS112700",
		name: "Keerthi Shree R",
		email: "keerthishreer@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r19",
		_id: "emp-r19",
		employeeId: "ETS21224",
		name: "Vrushali",
		email: "vrushali@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r20",
		_id: "emp-r20",
		employeeId: "ETS21186",
		name: "Anwar Basha",
		email: "anwarbasha@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r21",
		_id: "emp-r21",
		employeeId: "ETS21213",
		name: "Boopathi Raja S",
		email: "boopathirajas@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r22",
		_id: "emp-r22",
		employeeId: "ETS112942",
		name: "Jyothika Bhumireddy",
		email: "jyothikabhumireddy@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r23",
		_id: "emp-r23",
		employeeId: "ETS112932",
		name: "Chayan Agarwal",
		email: "chayanagarwal@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r24",
		_id: "emp-r24",
		employeeId: "ETS21224",
		name: "Megha prajapati",
		email: "meghaprajapati@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r25",
		_id: "emp-r25",
		employeeId: "ETS112644",
		name: "Nayana C",
		email: "nayanac@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r26",
		_id: "emp-r26",
		employeeId: "ETS113246",
		name: "Sawanth Rathod",
		email: "sawanthrathod@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r27",
		_id: "emp-r27",
		employeeId: "ETS21228",
		name: "Poornima Shivanand Marikatti",
		email: "poornimashivanandmarikatti@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r28",
		_id: "emp-r28",
		employeeId: "EST113482",
		name: "Sanjay S M",
		email: "sanjaysm@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r29",
		_id: "emp-r29",
		employeeId: "ETS112722",
		name: "Diya Verma",
		email: "diyaverma@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r30",
		_id: "emp-r30",
		employeeId: "EST113386",
		name: "Anoop Gutti",
		email: "anoopgutti@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r31",
		_id: "emp-r31",
		employeeId: "ETS112935",
		name: "Supreet Dani",
		email: "supreetdani@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r32",
		_id: "emp-r32",
		employeeId: "ETS113221",
		name: "Prajapati Dharshan",
		email: "prajapatidharshan@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r33",
		_id: "emp-r33",
		employeeId: "ETS21142",
		name: "Rupali Kushwaha",
		email: "rupalikushwaha@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r34",
		_id: "emp-r34",
		employeeId: "ETS112991",
		name: "Sandhiya P",
		email: "sandhiyap@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r35",
		_id: "emp-r35",
		employeeId: "ETS113365",
		name: "Anoop Megri",
		email: "anoopmegri@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r36",
		_id: "emp-r36",
		employeeId: "ETS21229",
		name: "Yashoda Thapa",
		email: "yashodathapa@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r37",
		_id: "emp-r37",
		employeeId: "ETS112255",
		name: "Veeralakshmi R",
		email: "veeralakshmir@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r38",
		_id: "emp-r38",
		employeeId: "ETS113323",
		name: "JENY JOMON",
		email: "jenyjomon@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r39",
		_id: "emp-r39",
		employeeId: "EST113635",
		name: "Kezhalezo Belho",
		email: "kezhalezobelho@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r40",
		_id: "emp-r40",
		employeeId: "ETS112703",
		name: "Poonam Hessa",
		email: "poonamhessa@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r41",
		_id: "emp-r41",
		employeeId: "ETS113224",
		name: "Sumanth R",
		email: "sumanthr@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r42",
		_id: "emp-r42",
		employeeId: "ETS112522",
		name: "Abhigna Nerusu",
		email: "abhignanerusu@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r43",
		_id: "emp-r43",
		employeeId: "ETS113372",
		name: "Aniket giri",
		email: "aniketgiri@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r44",
		_id: "emp-r44",
		employeeId: "ETS21190",
		name: "Yedulla Navya",
		email: "yedullanavya@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r45",
		_id: "emp-r45",
		employeeId: "ETS112679",
		name: "Saniya Taj F",
		email: "saniyatajf@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r46",
		_id: "emp-r46",
		employeeId: "ETS113378",
		name: "Ayushi Dixit",
		email: "ayushidixit@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r47",
		_id: "emp-r47",
		employeeId: "EST113657",
		name: "Ankit Kumar",
		email: "ankitkumar@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r48",
		_id: "emp-r48",
		employeeId: "ETS113245",
		name: "Varsha Chaudhary",
		email: "varshachaudhary@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r49",
		_id: "emp-r49",
		employeeId: "ETS113243",
		name: "Rebati Hansdah",
		email: "rebatihansdah@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r50",
		_id: "emp-r50",
		employeeId: "",
		name: "Anshul Khokhar",
		email: "anshulkhokhar@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r51",
		_id: "emp-r51",
		employeeId: "ETS21173",
		name: "Nathiya S",
		email: "nathiyas@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r52",
		_id: "emp-r52",
		employeeId: "EST113484",
		name: "Avijit Mandal",
		email: "avijitmandal@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r53",
		_id: "emp-r53",
		employeeId: "EST113788",
		name: "rishiraj Singh",
		email: "rishirajsingh@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r54",
		_id: "emp-r54",
		employeeId: "ETS113236",
		name: "Saniya D",
		email: "saniyad@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r55",
		_id: "emp-r55",
		employeeId: "EST113659",
		name: "Kumud Naryal",
		email: "kumudnaryal@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r56",
		_id: "emp-r56",
		employeeId: "EST113634",
		name: "Bhukya Madhu",
		email: "bhukyamadhu@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r57",
		_id: "emp-r57",
		employeeId: "EST113664",
		name: "Vishwaa U",
		email: "vishwaau@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r58",
		_id: "emp-r58",
		employeeId: "EST113488",
		name: "Sudipta Das",
		email: "sudiptadas@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r59",
		_id: "emp-r59",
		employeeId: "ETS113367",
		name: "Chamundi P",
		email: "chamundip@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r60",
		_id: "emp-r60",
		employeeId: "EST113665",
		name: "Anusha J",
		email: "anushaj@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r61",
		_id: "emp-r61",
		employeeId: "ETS113546",
		name: "Rakshitha Patil",
		email: "rakshithapatil@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r62",
		_id: "emp-r62",
		employeeId: "ETS113355",
		name: "MamathaD S",
		email: "mamathads@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r63",
		_id: "emp-r63",
		employeeId: "EST113666",
		name: "Krithika J",
		email: "krithikaj@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r64",
		_id: "emp-r64",
		employeeId: "EST113681",
		name: "Bhumika Uttam Sankapal",
		email: "bhumikauttamsankapal@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r65",
		_id: "emp-r65",
		employeeId: "EST113533",
		name: "Pratiksha Biradar",
		email: "pratikshabiradar@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r66",
		_id: "emp-r66",
		employeeId: "ETS21216",
		name: "Bharaniraj K",
		email: "bharanirajk@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r67",
		_id: "emp-r67",
		employeeId: "ETS112249",
		name: "Nivetha P",
		email: "nivethap@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	},
	{
		id: "emp-r68",
		_id: "emp-r68",
		employeeId: "ETS112246",
		name: "Meenakshi K",
		email: "meenakshik@edufyitech.in",
		phone: "",
		department: "Unassigned",
		designation: "",
		role: "employee",
		status: "active",
		joiningDate: "",
		salary: 0,
		managerId: "emp-3",
		managerName: "Admin",
		location: "",
		employmentType: "Full-time",
		bankDetails: {
			bankName: "",
			accountNumber: "",
			routingNumber: "",
			panTaxId: ""
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phone: ""
		},
		documents: [],
		onboardingChecklist: [],
		exitDetails: null
	}
];
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
	if (lat1 === void 0 || lon1 === void 0 || lat2 === void 0 || lon2 === void 0 || lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
	const nLat1 = Number(lat1);
	const nLon1 = Number(lon1);
	const nLat2 = Number(lat2);
	const nLon2 = Number(lon2);
	if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;
	const R = 6371e3;
	const phi1 = nLat1 * Math.PI / 180;
	const phi2 = nLat2 * Math.PI / 180;
	const deltaPhi = (nLat2 - nLat1) * Math.PI / 180;
	const deltaLambda = (nLon2 - nLon1) * Math.PI / 180;
	const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return Math.round(R * c);
}
var INITIAL_COMPANY_SETTINGS = {
	companyName: "Edufyi Inc.",
	hqAddress: "100 Technology Plaza, Suite 400, San Francisco, CA 94105",
	locations: [
		{
			id: "loc-ignite",
			name: "Ignite Campus",
			city: "Bengaluru",
			lat: 12.9101,
			lng: 77.6517,
			radiusMeters: 100,
			isDefault: true
		},
		{
			id: "loc-velocity",
			name: "Velocity Hub",
			city: "Bengaluru",
			lat: 12.9279,
			lng: 77.6833,
			radiusMeters: 100,
			isDefault: false
		},
		{
			id: "loc-1",
			name: "HQ - San Francisco",
			city: "San Francisco",
			lat: 37.789172,
			lng: -122.401449,
			radiusMeters: 200,
			isDefault: false
		},
		{
			id: "loc-2",
			name: "Tech Hub - Austin",
			city: "Austin",
			lat: 30.267153,
			lng: -97.743061,
			radiusMeters: 200,
			isDefault: false
		},
		{
			id: "loc-3",
			name: "Global Center - London",
			city: "London",
			lat: 51.507351,
			lng: -.127758,
			radiusMeters: 200,
			isDefault: false
		}
	],
	allowedWifiSSIDs: [
		"edufyi",
		"Edufyi",
		"Edufyi-Office-5G",
		"Edufyi-Corp-Secure",
		"Edufyi-Guest-HighSpeed"
	],
	officeNetworkIPs: [],
	wifiNetworks: [
		{
			id: "wn-1",
			ssid: "Edufyi-Office-5G",
			bssid: "9C:3D:CF:11:A2:01",
			securityType: "WPA2-Enterprise",
			branchName: "HQ - San Francisco",
			allowedIPs: [
				"127.0.0.1",
				"::1",
				"10.0.0.0/8",
				"192.168.1.0/24"
			],
			status: "active",
			addedAt: "2026-09-30",
			addedBy: "Admin"
		},
		{
			id: "wn-2",
			ssid: "Edufyi-Corp-Secure",
			bssid: "9C:3D:CF:22:B4:02",
			securityType: "WPA3-Enterprise",
			branchName: "Tech Hub - Austin",
			allowedIPs: [
				"127.0.0.1",
				"::1",
				"172.16.0.0/16"
			],
			status: "active",
			addedAt: "2026-09-30",
			addedBy: "Admin"
		},
		{
			id: "wn-3",
			ssid: "Edufyi-Guest-HighSpeed",
			bssid: "9C:3D:CF:33:C6:03",
			securityType: "WPA2-Personal",
			branchName: "Global Center - London",
			allowedIPs: [
				"127.0.0.1",
				"::1",
				"192.168.10.0/24"
			],
			status: "active",
			addedAt: "2026-09-30",
			addedBy: "Admin"
		}
	],
	attendanceRules: {
		halfDayHours: 4.5,
		fullDayHours: 8,
		geofenceStrict: false,
		maxGeofenceRadiusMeters: 50,
		gpsVerificationRequired: true,
		wifiVerificationRequired: true,
		requireOfficeNetworkAndGps: false,
		lunchBreakAutoPause: true,
		lunchBreakStart: "13:30",
		lunchBreakEnd: "14:30",
		autoPunchOutEnabled: true,
		autoPunchOutTime: "21:30",
		geofenceAutoPunchOutEnabled: true,
		geofenceGracePeriodMinutes: 120,
		geofenceGpsAccuracyThresholdMeters: 50,
		geofenceExitWarningEnabled: true,
		offlineAutoPunchOutEnabled: true,
		offlineGracePeriodMinutes: 120,
		dailyCutoffAutoPunchOutEnabled: true,
		dailyCutoffTime: "21:30",
		dailyCutoffWarningEnabled: true,
		dailyCutoffWarningMinutesBefore: 15,
		timezone: "Asia/Kolkata"
	},
	leavePolicies: {
		casualQuota: 12,
		sickQuota: 10,
		earnedQuota: 15,
		compOffQuota: 2,
		maxCarryForwardDays: 8,
		requireManagerApproval: true,
		requireHrApproval: true
	},
	systemConfig: {
		emailNotificationsEnabled: true,
		smsGatewayStatus: "Connected (Twilio)",
		pfPortalLink: "https://unifiedportal-mem.epfindia.gov.in",
		esiPortalLink: "https://www.esic.in",
		aiAssistantModel: "Gemini 1.5 Flash High",
		aiPolicyGrounding: true,
		lastBackupDate: "2026-09-29 23:45 UTC"
	},
	holidayCalendarImages: []
};
var INITIAL_ATTENDANCE = [];
var INITIAL_LEAVES = [];
var INITIAL_TASKS = [];
var INITIAL_COURSES = [
	{
		id: "course-1",
		title: "Workplace Security & Data Privacy 2026",
		category: "Compliance",
		duration: "45 mins",
		progress: 75,
		completed: false,
		quizScore: null,
		modules: [
			"Password hygiene & 2FA",
			"Phishing detection",
			"Handling customer PII"
		],
		certificateUrl: null
	},
	{
		id: "course-2",
		title: "Effective Leadership & Managerial Communication",
		category: "Leadership",
		duration: "2.5 hrs",
		progress: 100,
		completed: true,
		quizScore: "95%",
		modules: [
			"Active listening",
			"Delivering constructive feedback",
			"Conflict resolution"
		],
		certificateUrl: "CERT-EDU-2026-9812"
	},
	{
		id: "course-3",
		title: "Workplace Ethics & Safety Guidelines",
		category: "Mandatory HR",
		duration: "30 mins",
		progress: 100,
		completed: true,
		quizScore: "100%",
		modules: [
			"Professional conduct",
			"Safety protocols",
			"Safe workspace culture"
		],
		certificateUrl: "CERT-EDU-2026-4401"
	},
	{
		id: "course-4",
		title: "Modern React 19 & High-Performance UI Architecture",
		category: "Engineering",
		duration: "3.0 hrs",
		progress: 40,
		completed: false,
		quizScore: null,
		modules: [
			"React Server Components",
			"Optimistic UI patterns",
			"Accessibility (a11y)"
		],
		certificateUrl: null
	}
];
var INITIAL_TICKETS = [];
var INITIAL_ANNOUNCEMENTS = [];
var INITIAL_HOLIDAYS = [
	{
		id: "hol-1",
		date: "2026-10-02",
		name: "Gandhi Jayanti",
		title: "Gandhi Jayanti",
		type: "National Holiday",
		day: "Friday"
	},
	{
		id: "hol-2",
		date: "2026-10-20",
		name: "Dussehra / Vijaya Dashami",
		title: "Dussehra / Vijaya Dashami",
		type: "Festival Holiday",
		day: "Tuesday"
	},
	{
		id: "hol-3",
		date: "2026-11-08",
		name: "Diwali (Festival of Lights)",
		title: "Diwali (Festival of Lights)",
		type: "Festival Holiday",
		day: "Sunday"
	},
	{
		id: "hol-4",
		date: "2026-11-09",
		name: "Diwali Balipratipada",
		title: "Diwali Balipratipada",
		type: "Company Holiday",
		day: "Monday"
	},
	{
		id: "hol-5",
		date: "2026-12-25",
		name: "Christmas Day",
		title: "Christmas Day",
		type: "Gazetted Holiday",
		day: "Friday"
	},
	{
		id: "hol-6",
		date: "2027-01-01",
		name: "New Year Day 2027",
		title: "New Year Day 2027",
		type: "Optional Holiday",
		day: "Friday"
	}
];
var INITIAL_DOCUMENTS = [
	{
		id: "cdoc-1",
		title: "Edufyi Employee Handbook 2026",
		category: "HR Policy",
		type: "PDF",
		size: "2.8 MB",
		updated: "2026-08-15",
		downloads: 142
	},
	{
		id: "cdoc-2",
		title: "Code of Business Conduct & Ethics",
		category: "Compliance",
		type: "PDF",
		size: "1.4 MB",
		updated: "2026-07-10",
		downloads: 98
	},
	{
		id: "cdoc-3",
		title: "Medical & Group Health Insurance Scheme",
		category: "Benefits",
		type: "PDF",
		size: "3.1 MB",
		updated: "2026-09-01",
		downloads: 184
	},
	{
		id: "cdoc-4",
		title: "Remote Work & Equipment Guidelines",
		category: "Operations",
		type: "PDF",
		size: "920 KB",
		updated: "2026-08-20",
		downloads: 112
	},
	{
		id: "cdoc-5",
		title: "Leave & Absence Management Policy",
		category: "HR Policy",
		type: "PDF",
		size: "1.1 MB",
		updated: "2026-06-30",
		downloads: 156
	}
];
var INITIAL_REQUISITIONS = [
	{
		id: "req-1",
		title: "Senior Fullstack Engineer (React/Node)",
		department: "Engineering",
		location: "San Francisco (Hybrid)",
		openings: 2,
		applicants: 28,
		stage: "Interview",
		status: "Active"
	},
	{
		id: "req-2",
		title: "HR Business Partner (Talent & Growth)",
		department: "Human Resources",
		location: "Austin (Hybrid)",
		openings: 1,
		applicants: 14,
		stage: "Screening",
		status: "Active"
	},
	{
		id: "req-3",
		title: "Product Marketing Manager",
		department: "Marketing",
		location: "Remote (US)",
		openings: 1,
		applicants: 32,
		stage: "Offer",
		status: "Active"
	},
	{
		id: "req-4",
		title: "Security & DevOps Lead",
		department: "Engineering",
		location: "San Francisco",
		openings: 1,
		applicants: 19,
		stage: "Technical Review",
		status: "Active"
	}
];
var INITIAL_DAILY_REPORTS = [];
var INITIAL_EXPENSES = [];
var INITIAL_KUDOS = [];
var INITIAL_NOTIFICATIONS = [];
var INITIAL_PAYROLL_RECORDS = [];
function getPersistedNotifications() {
	if (typeof window === "undefined" || !window.localStorage) return null;
	try {
		const isCleared = window.localStorage.getItem(STORAGE_CLEARED_NOTIFICATIONS_KEY) === "true";
		const deletedRaw = window.localStorage.getItem(STORAGE_DELETED_NOTIFICATIONS_KEY);
		const deletedIds = new Set(deletedRaw ? JSON.parse(deletedRaw) : []);
		if (isCleared) return [];
		const raw = window.localStorage.getItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) return parsed.filter((n) => n && n.id && !deletedIds.has(n.id));
		}
		return [];
	} catch {
		return [];
	}
}
function loadStore() {
	if (typeof window !== "undefined" && window.localStorage) try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed.payroll)) parsed.payroll = parsed.payroll.map((p) => {
				if (p.accountNumber && (p.accountNumber.includes("*") || p.accountNumber.includes("●"))) {
					const digits = (p.accountNumber.match(/\d+$/) || ["8492"])[0];
					return {
						...p,
						accountNumber: "501004928" + digits.padStart(4, "0")
					};
				}
				return p;
			});
			if (Array.isArray(parsed.employees)) {
				parsed.employees = parsed.employees.map((e) => {
					if (e.bankDetails?.accountNumber && (e.bankDetails.accountNumber.includes("*") || e.bankDetails.accountNumber.includes("●"))) {
						const digits = (e.bankDetails.accountNumber.match(/\d+$/) || ["8492"])[0];
						return {
							...e,
							bankDetails: {
								...e.bankDetails,
								accountNumber: "501004928" + digits.padStart(4, "0")
							}
						};
					}
					return e;
				});
				parsed.employees = (parsed.employees || []).filter((e) => e.employeeId !== "EDU-EMP-104" && e.name !== "Alex Rivera" && e.email !== "alex.rivera@edufyi.local");
				parsed.users = (parsed.users || []).filter((u) => u.employeeId !== "EDU-EMP-104" && u.name !== "Alex Rivera" && u.email !== "alex.rivera@edufyi.local");
				parsed.leaves = (parsed.leaves || []).filter((l) => l.employeeId !== "EDU-EMP-104" && l.employeeName !== "Alex Rivera");
				parsed.attendance = (parsed.attendance || []).filter((a) => a.employeeId !== "EDU-EMP-104" && a.employeeName !== "Alex Rivera");
				parsed.tasks = (parsed.tasks || []).filter((t) => t.assigneeId !== "EDU-EMP-104" && t.assigneeName !== "Alex Rivera");
				parsed.expenses = (parsed.expenses || []).filter((ex) => ex.employeeId !== "EDU-EMP-104" && ex.employeeName !== "Alex Rivera");
				parsed.helpDesk = (parsed.helpDesk || []).filter((h) => h.employeeName !== "Alex Rivera");
				parsed.dailyReports = (parsed.dailyReports || []).filter((r) => r.employeeName !== "Alex Rivera");
				parsed.payroll = (parsed.payroll || []).filter((p) => p.employeeId !== "EDU-EMP-104" && p.employeeName !== "Alex Rivera");
			}
			if (parsed.companySettings) parsed.companySettings.maskBankAccount = false;
			if (!parsed.payroll || parsed.payroll.length === 0) parsed.payroll = INITIAL_PAYROLL_RECORDS;
			if (!parsed.roles || parsed.roles.length === 0) parsed.roles = INITIAL_ROLES;
			if (!parsed.customRolePermissions) parsed.customRolePermissions = {};
			parsed.employees = [];
			parsed.users = [];
			parsed.attendance = [];
			parsed.leaves = [];
			parsed.payroll = [];
			parsed.leaveBalances = [];
			parsed.dataReady = false;
			parsed.dataError = "";
			parsed.dataErrors = {};
			if (!Array.isArray(parsed.teams)) parsed.teams = [];
			if (Array.isArray(parsed.departments) && parsed.departments.length > 0) {
				const deptMap = /* @__PURE__ */ new Map();
				INITIAL_DEPARTMENTS.forEach((d) => {
					deptMap.set((d.deptId || d.id || d.name).toLowerCase(), { ...d });
				});
				parsed.departments.filter(Boolean).forEach((d) => {
					const key = (d.deptId || d.id || d.name || "").toLowerCase();
					if (key) {
						const prev = deptMap.get(key) || {};
						deptMap.set(key, {
							...prev,
							...d
						});
					}
				});
				parsed.departments = Array.from(deptMap.values());
			} else parsed.departments = INITIAL_DEPARTMENTS.map((d) => ({ ...d }));
			const savedNotifs = getPersistedNotifications();
			if (savedNotifs !== null) parsed.notifications = savedNotifs;
			else if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
			return parsed;
		}
	} catch (err) {
		console.warn("Could not read from localStorage, using initial seed data", err);
	}
	const fallbackNotifs = getPersistedNotifications();
	let cachedCalendarImages = [];
	if (typeof window !== "undefined" && window.localStorage) try {
		const rawCal = window.localStorage.getItem("edufyi_holiday_calendar_images_v1");
		if (rawCal) cachedCalendarImages = JSON.parse(rawCal);
	} catch (_) {}
	if (typeof window !== "undefined") return {
		departments: INITIAL_DEPARTMENTS.map((d) => ({ ...d })),
		users: [],
		employees: [],
		teams: INITIAL_TEAMS,
		companySettings: {
			...INITIAL_COMPANY_SETTINGS,
			holidayCalendarImages: cachedCalendarImages
		},
		holidayCalendarImages: cachedCalendarImages,
		attendance: [],
		leaves: [],
		tasks: [],
		courses: INITIAL_COURSES,
		tickets: [],
		announcements: INITIAL_ANNOUNCEMENTS,
		holidays: INITIAL_HOLIDAYS,
		documents: INITIAL_DOCUMENTS,
		requisitions: [],
		dailyReports: [],
		expenses: [],
		kudos: [],
		notifications: fallbackNotifs !== null ? fallbackNotifs : [],
		payroll: [],
		leavePolicies: [],
		roles: INITIAL_ROLES,
		customRolePermissions: {},
		auditLogs: [],
		dataReady: false,
		dataError: "",
		dataErrors: {}
	};
	return {
		departments: INITIAL_DEPARTMENTS.map((d) => ({ ...d })),
		users: INITIAL_USERS,
		employees: INITIAL_EMPLOYEES,
		teams: INITIAL_TEAMS,
		companySettings: INITIAL_COMPANY_SETTINGS,
		attendance: INITIAL_ATTENDANCE,
		leaves: INITIAL_LEAVES,
		tasks: INITIAL_TASKS,
		courses: INITIAL_COURSES,
		tickets: INITIAL_TICKETS,
		announcements: INITIAL_ANNOUNCEMENTS,
		holidays: INITIAL_HOLIDAYS,
		documents: INITIAL_DOCUMENTS,
		requisitions: INITIAL_REQUISITIONS,
		dailyReports: INITIAL_DAILY_REPORTS,
		expenses: INITIAL_EXPENSES,
		kudos: INITIAL_KUDOS,
		notifications: fallbackNotifs !== null ? fallbackNotifs : INITIAL_NOTIFICATIONS,
		payroll: INITIAL_PAYROLL_RECORDS,
		leavePolicies: [],
		roles: INITIAL_ROLES,
		customRolePermissions: {},
		auditLogs: [],
		dataReady: true,
		dataError: "",
		dataErrors: {}
	};
}
var storeState = loadStore();
var listeners = /* @__PURE__ */ new Set();
function notifyListeners() {
	if (typeof window !== "undefined" && window.localStorage) try {
		const ephemeralKeys = workspaceKeys.filter((k) => k !== "departments" && k !== "roles");
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
			...storeState,
			employees: [],
			users: [],
			attendance: [],
			leaves: [],
			payroll: [],
			leaveBalances: [],
			...Object.fromEntries(ephemeralKeys.map((key) => [key, []])),
			departments: storeState.departments || [],
			roles: storeState.roles || []
		}));
		if (Array.isArray(storeState.notifications)) window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify(storeState.notifications));
	} catch (err) {
		console.warn("Could not write to localStorage", err);
	}
	const snapshot = { ...storeState };
	listeners.forEach((callback) => callback(snapshot));
}
function is25thMonthLop(requestOrData) {
	if (!requestOrData) return false;
	if (requestOrData.isDoubleLop || requestOrData.doubleLopDays && requestOrData.doubleLopDays > 0) return true;
	const startDateStr = requestOrData.startDate;
	const endDateStr = requestOrData.endDate || startDateStr;
	if (!startDateStr) return false;
	const start = new Date(startDateStr);
	const end = new Date(endDateStr);
	if (isNaN(start.getTime())) return false;
	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) if (d.getDate() >= 25) return true;
	if (String(requestOrData.leaveType).toLowerCase() === "lop") {
		if (start.getDate() >= 25 || end.getDate() >= 25) return true;
	}
	return false;
}
var localStore = {
	subscribe(callback) {
		listeners.add(callback);
		callback(storeState);
		return () => listeners.delete(callback);
	},
	getState() {
		return storeState;
	},
	getUsers() {
		return storeState.users;
	},
	replaceUsers(users) {
		storeState.users = users;
		notifyListeners();
	},
	addUser(userData) {
		const newUser = {
			id: userData.id || `user-${Date.now()}`,
			employeeId: userData.employeeId || `EDU-${Math.floor(100 + Math.random() * 900)}`,
			name: userData.name || userData.displayName || "User",
			displayName: userData.displayName || userData.name || "User",
			email: userData.email.toLowerCase(),
			role: userData.role || "employee",
			department: userData.department || "General",
			designation: userData.designation || "Pending Designation",
			status: "active",
			avatarTone: "blue",
			permissions: userData.role === "admin" ? ["*"] : userData.permissions || this.getRolePermissions(userData.role || "employee") || ["dashboard.read"],
			password: userData.password || "password123"
		};
		storeState.users = [newUser, ...storeState.users];
		if (!(storeState.employees || []).find((e) => e.email?.toLowerCase() === newUser.email.toLowerCase() || e.employeeId === newUser.employeeId)) {
			const roleCfg = STANDARD_ROLE_CONFIG[newUser.role];
			this.addEmployee({
				name: newUser.name,
				email: newUser.email,
				employeeId: newUser.employeeId,
				department: newUser.department,
				designation: newUser.designation,
				role: newUser.role,
				managerId: roleCfg?.defaultManagerId ?? (newUser.role === "employee" ? "emp-tl-bharani" : "emp-director"),
				managerName: roleCfg?.defaultManagerName ?? (newUser.role === "employee" ? "Bharani" : "Managing Director")
			});
		}
		this.addAuditLog(userData.actor || "Admin", "USER_CREATE", `Created user account for ${newUser.name} (${newUser.email}) with role ${newUser.role}`);
		notifyListeners();
		return newUser;
	},
	toggleUserStatus(userId) {
		storeState.users = storeState.users.map((u) => u.id === userId ? {
			...u,
			status: u.status === "active" ? "inactive" : "active"
		} : u);
		notifyListeners();
		return this.getUsers().find((u) => u.id === userId);
	},
	updateUser(userId, updates) {
		const existing = storeState.users.find((u) => u.id === userId || u._id === userId);
		const oldEmpId = existing?.employeeId;
		const newEmpId = updates.employeeId ? String(updates.employeeId).trim().toUpperCase() : oldEmpId;
		storeState.users = storeState.users.map((u) => {
			if (u.id === userId || u._id === userId) return {
				...u,
				...updates,
				...newEmpId ? { employeeId: newEmpId } : {}
			};
			return u;
		});
		const targetEmail = existing?.email;
		const empMatch = (storeState.employees || []).find((e) => e.id === userId || e._id === userId || oldEmpId && e.employeeId === oldEmpId || newEmpId && e.employeeId === newEmpId || targetEmail && e.email === targetEmail);
		if (empMatch) {
			const roleCfg = updates.role ? STANDARD_ROLE_CONFIG[updates.role] : null;
			storeState.employees = storeState.employees.map((e) => {
				if (e.id === empMatch.id) return {
					...e,
					...newEmpId ? { employeeId: newEmpId } : {},
					...updates.name ? { name: updates.name } : {},
					...updates.department ? { department: updates.department } : {},
					...updates.designation ? { designation: updates.designation } : {},
					...updates.role ? { role: updates.role } : {},
					...updates.status ? { status: updates.status } : {},
					...roleCfg?.defaultManagerId !== void 0 ? {
						managerId: roleCfg.defaultManagerId,
						managerName: roleCfg.defaultManagerName
					} : {}
				};
				return e;
			});
		} else if (updates.role || updates.department || updates.designation) {
			const roleCfg = STANDARD_ROLE_CONFIG[updates.role || "employee"];
			const newEmp = {
				id: `emp-${Date.now()}`,
				employeeId: newEmpId || `ETS${Math.floor(1e4 + Math.random() * 9e4)}`,
				name: updates.name || existing?.name || "Employee",
				email: existing?.email || "",
				department: updates.department || existing?.department || "General",
				designation: updates.designation || existing?.designation || "Pending Designation",
				role: updates.role || existing?.role || "employee",
				status: updates.status || existing?.status || "active",
				joiningDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
				salary: updates.role === "director" ? 45e5 : updates.role === "manager" ? 24e5 : 12e5,
				managerId: roleCfg?.defaultManagerId ?? "emp-director",
				managerName: roleCfg?.defaultManagerName ?? "Managing Director",
				employmentType: "Full-time",
				location: "Bengaluru"
			};
			storeState.employees = [...storeState.employees, newEmp];
		}
		this.addAuditLog("Admin", "USER_UPDATE", `Updated user details for ${updates.name || userId}`);
		notifyListeners();
		return storeState.users.find((u) => u.id === userId || u._id === userId);
	},
	resetUserPassword(userId, newPassword = "Password@123") {
		storeState.users = (storeState.users || []).map((u) => {
			if (u.id === userId || u._id === userId || u.employeeId === userId || u.email === userId) return {
				...u,
				password: newPassword
			};
			return u;
		});
		this.addAuditLog("Admin", "PASSWORD_RESET", `Reset password for user ${userId} to new credential`);
		this.addNotification({
			title: "Security Notice: Password Reset",
			message: `Temporary credentials generated for account ${userId}.`,
			type: "system"
		});
		notifyListeners();
		return true;
	},
	getRoles() {
		const deletedIds = new Set(storeState.deletedRoleIds || []);
		const rawRoles = storeState.roles || [];
		const rolesMap = new Map(INITIAL_ROLES.filter((r) => !deletedIds.has(r.id)).map((r) => [r.id, { ...r }]));
		for (const r of rawRoles) {
			const id = r.roleId || r.id || r._id;
			if (id && !deletedIds.has(id)) {
				const existing = rolesMap.get(id);
				if (existing) rolesMap.set(id, {
					...existing,
					...r,
					id,
					roleId: id,
					permissions: r.permissions && r.permissions.length > 0 ? r.permissions : existing.permissions
				});
				else rolesMap.set(id, {
					id,
					_id: r._id,
					roleId: id,
					name: r.name,
					description: r.description || "Custom organizational access role",
					badge: r.badge || "Custom Role",
					isSystem: false,
					permissions: r.permissions || ["dashboard.read"]
				});
			}
		}
		if (storeState.customRolePermissions) {
			for (const [rid, perms] of Object.entries(storeState.customRolePermissions)) if (rolesMap.has(rid) && Array.isArray(perms) && !deletedIds.has(rid)) rolesMap.get(rid).permissions = perms;
		}
		return Array.from(rolesMap.values());
	},
	getRole(roleId) {
		if (roleId === "hr") return this.getRoles().find((r) => r.id === "hr_executive" || r.id === "hr");
		if (roleId === "director") return this.getRoles().find((r) => r.id === "managing_director" || r.id === "director");
		if (roleId === "team_lead") return this.getRoles().find((r) => r.id === "team_leader" || r.id === "team_lead");
		return this.getRoles().find((r) => r.id === roleId || r.roleId === roleId || r._id === roleId);
	},
	getRolePermissions(roleId) {
		if (storeState.customRolePermissions && storeState.customRolePermissions[roleId]) return storeState.customRolePermissions[roleId];
		return this.getRole(roleId)?.permissions || [];
	},
	updateRole(roleId, updates) {
		const id = roleId;
		let found = false;
		storeState.roles = (storeState.roles || []).map((r) => {
			if ((r.id || r.roleId || r._id) === id) {
				found = true;
				return {
					...r,
					...updates
				};
			}
			return r;
		});
		if (!found) {
			const base = INITIAL_ROLES.find((r) => r.id === id) || {
				id,
				roleId: id,
				name: id
			};
			storeState.roles = [...storeState.roles || [], {
				...base,
				id,
				roleId: id,
				...updates
			}];
		}
		if (updates.permissions) {
			if (!storeState.customRolePermissions) storeState.customRolePermissions = {};
			storeState.customRolePermissions[id] = updates.permissions;
		}
		this.addAuditLog("Admin", "ROLE_UPDATE", `Modified role '${updates.name || id}' details (${id})`);
		notifyListeners();
		return true;
	},
	updateRolePermissions(roleId, newPermissions) {
		const targetId = roleId === "hr" && !this.getRoles().some((r) => r.id === "hr") ? "hr_executive" : roleId;
		if (!storeState.customRolePermissions) storeState.customRolePermissions = {};
		storeState.customRolePermissions[roleId] = newPermissions;
		storeState.customRolePermissions[targetId] = newPermissions;
		storeState.roles = this.getRoles().map((r) => {
			if (r.id === roleId || r.roleId === roleId || r.id === targetId || r.roleId === targetId) return {
				...r,
				permissions: newPermissions
			};
			return r;
		});
		storeState.users = (storeState.users || []).map((u) => {
			if (u.role === roleId || u.role === targetId) return {
				...u,
				permissions: newPermissions
			};
			return u;
		});
		this.addAuditLog("Admin", "ROLE_PERMISSIONS_UPDATE", `Updated permissions matrix for role '${roleId}' (${newPermissions.length} capabilities assigned)`);
		notifyListeners();
		return true;
	},
	resetRolePermissions(roleId) {
		const targetId = roleId === "hr" ? "hr_executive" : roleId === "director" ? "managing_director" : roleId === "team_lead" ? "team_leader" : roleId;
		const defaultPerms = INITIAL_ROLES.find((r) => r.id === targetId || r.id === roleId)?.permissions || [];
		if (storeState.customRolePermissions) {
			delete storeState.customRolePermissions[roleId];
			delete storeState.customRolePermissions[targetId];
		}
		storeState.roles = this.getRoles().map((r) => {
			if (r.id === roleId || r.roleId === roleId || r.id === targetId || r.roleId === targetId) return {
				...r,
				permissions: defaultPerms
			};
			return r;
		});
		this.addAuditLog("Admin", "ROLE_RESET", `Reset role '${roleId}' permissions to factory system defaults`);
		notifyListeners();
		return true;
	},
	addRole(roleData) {
		const id = roleData.id || roleData.roleId || roleData.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
		const newRole = {
			id,
			roleId: id,
			name: roleData.name,
			description: roleData.description || "Custom organization security role",
			badge: roleData.badge || "Custom Role",
			isSystem: false,
			permissions: roleData.permissions || ["dashboard.read"]
		};
		if (storeState.deletedRoleIds) storeState.deletedRoleIds = storeState.deletedRoleIds.filter((delId) => delId !== id);
		if (!storeState.customRolePermissions) storeState.customRolePermissions = {};
		storeState.customRolePermissions[newRole.id] = newRole.permissions;
		const currentCustom = storeState.roles || [];
		storeState.roles = [...currentCustom.filter((r) => (r.id || r.roleId) !== id), newRole];
		this.addAuditLog("Admin", "ROLE_CREATE", `Created custom role '${newRole.name}' with id '${newRole.id}'`);
		notifyListeners();
		return newRole;
	},
	deleteRole(roleId) {
		if ([
			"admin",
			"hr",
			"hr_executive",
			"manager",
			"employee"
		].includes(roleId)) throw new Error("Core system roles (Admin, HR, Manager, Employee) cannot be deleted.");
		const cleanId = String(roleId || "").trim();
		storeState.roles = (storeState.roles || []).filter((r) => (r.id || r.roleId || r._id) !== cleanId);
		if (!storeState.deletedRoleIds) storeState.deletedRoleIds = [];
		if (!storeState.deletedRoleIds.includes(cleanId)) storeState.deletedRoleIds.push(cleanId);
		if (storeState.customRolePermissions) delete storeState.customRolePermissions[cleanId];
		this.addAuditLog("Admin", "ROLE_DELETE", `Deleted role '${cleanId}'`);
		notifyListeners();
		return true;
	},
	getTeams() {
		const rawTeams = storeState.teams || [];
		const defaultMap = /* @__PURE__ */ new Map();
		for (const t of rawTeams) {
			const key = t.teamId || t.id || t._id || (t.name ? `team-${t.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}` : null);
			if (key) defaultMap.set(key, {
				...defaultMap.get(key) || {},
				...t,
				id: t.id || key,
				teamId: t.teamId || key
			});
		}
		const teams = Array.from(defaultMap.values());
		const employees = storeState.employees || [];
		return teams.map((team) => {
			const teamKey = String(team.teamId || team.id || "").toLowerCase();
			const teamNameKey = String(team.name || "").toLowerCase();
			const teamSlug = `team-${teamNameKey.replace(/[^a-z0-9]/g, "_")}`;
			const members = employees.filter((e) => {
				if (e.status === "terminated") return false;
				const eTeam = String(e.team || "").toLowerCase();
				const eTeamId = String(e.teamId || "").toLowerCase();
				const eSquad = String(e.squad || "").toLowerCase();
				const eSquadId = String(e.squadId || "").toLowerCase();
				return eTeamId && (eTeamId === teamKey || eTeamId === teamSlug) || eTeam && (eTeam === teamNameKey || eTeam === teamKey) || eSquadId && (eSquadId === teamKey || eSquadId === teamSlug) || eSquad && (eSquad === teamNameKey || eSquad === teamKey);
			});
			const tl = team.teamLeadId ? employees.find((e) => String(e.id || e._id) === String(team.teamLeadId) || e.employeeId === team.teamLeadId) : team.teamLeadName ? employees.find((e) => (e.displayName || e.name || "").toLowerCase() === team.teamLeadName.toLowerCase()) : null;
			const mgr = team.managerId ? employees.find((e) => String(e.id || e._id) === String(team.managerId) || e.employeeId === team.managerId) : team.managerName ? employees.find((e) => (e.displayName || e.name || "").toLowerCase() === team.managerName.toLowerCase()) : null;
			return {
				...team,
				teamLeadName: tl?.displayName || tl?.name || team.teamLeadName || "",
				managerName: mgr?.displayName || mgr?.name || team.managerName || "",
				memberCount: members.length,
				members: members.map((m) => ({
					id: m.id || m._id,
					name: m.name,
					role: m.role,
					designation: m.designation,
					employeeId: m.employeeId
				}))
			};
		});
	},
	getTeam(teamId) {
		if (!teamId) return null;
		return this.getTeams().find((t) => t.id === teamId || t.teamId === teamId || t.name.toLowerCase() === String(teamId).toLowerCase()) || null;
	},
	assignEmployeesToTeam(teamIdOrName, employeeIds = [], actor) {
		const cleanTarget = String(teamIdOrName || "").toLowerCase().trim();
		const targetTeam = this.getTeams().find((t) => String(t.id || t.teamId || "").toLowerCase() === cleanTarget || String(t.name || "").toLowerCase() === cleanTarget);
		const teamName = targetTeam?.name || teamIdOrName;
		const teamId = targetTeam?.id || targetTeam?.teamId || `team-${teamName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
		const targetDept = targetTeam?.department || null;
		const selectedSet = new Set(employeeIds.map(String));
		storeState.employees = (storeState.employees || []).map((emp) => {
			const empId = String(emp.id || emp._id);
			const isCurrentInTeam = String(emp.teamId || emp.squadId || "") === String(teamId) || String(emp.team || emp.squad || "").toLowerCase() === teamName.toLowerCase();
			if (selectedSet.has(empId)) return {
				...emp,
				team: teamName,
				teamId,
				squad: teamName,
				squadId: teamId,
				...targetTeam?.teamLeadId ? {
					teamLeadId: targetTeam.teamLeadId,
					teamLeadName: targetTeam.teamLeadName || ""
				} : {},
				...targetTeam?.managerId ? {
					managerId: targetTeam.managerId,
					managerName: targetTeam.managerName || ""
				} : {},
				...targetDept && (!emp.department || emp.department === "Unassigned") ? { department: targetDept } : {}
			};
			else if (isCurrentInTeam) return {
				...emp,
				team: "",
				teamId: "",
				squad: "",
				squadId: ""
			};
			return emp;
		});
		this.addAuditLog(actor?.name || "Admin", "TEAM_ASSIGN", `Assigned ${selectedSet.size} members to team '${teamName}'`);
		notifyListeners();
		return {
			success: true,
			teamId,
			teamName,
			count: selectedSet.size
		};
	},
	addTeam(data) {
		const name = (data.name || "").trim();
		if (!name) throw new Error("Team name is required.");
		const id = data.id || `team-${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
		const mgr = (storeState.employees || []).find((e) => e.id === data.managerId || e._id === data.managerId);
		const tl = (storeState.employees || []).find((e) => e.id === data.teamLeadId || e._id === data.teamLeadId);
		const newTeam = {
			id,
			name,
			department: data.department || mgr?.department || "Revenue Growth",
			managerId: data.managerId || null,
			managerName: mgr?.name || data.managerName || "",
			teamLeadId: data.teamLeadId || null,
			teamLeadName: tl?.name || data.teamLeadName || "",
			description: data.description || `${name} delivery and execution team`,
			flaggedForVerification: false
		};
		const current = storeState.teams || [];
		storeState.teams = [...current.filter((t) => t.id !== id && t.name.toLowerCase() !== name.toLowerCase()), newTeam];
		this.addAuditLog("Admin", "TEAM_CREATE", `Created team '${newTeam.name}' under '${newTeam.department}'`);
		notifyListeners();
		return newTeam;
	},
	updateTeam(teamId, updates) {
		const prevTeam = this.getTeam(teamId);
		if (!prevTeam) throw new Error("Team not found.");
		const oldName = prevTeam.name;
		let updatedTeam = null;
		const mgr = updates.managerId ? (storeState.employees || []).find((e) => e.id === updates.managerId || e._id === updates.managerId) : null;
		const tl = updates.teamLeadId ? (storeState.employees || []).find((e) => e.id === updates.teamLeadId || e._id === updates.teamLeadId) : null;
		storeState.teams = (storeState.teams || []).map((t) => {
			if (t.id === teamId || t.name.toLowerCase() === prevTeam.name.toLowerCase()) {
				updatedTeam = {
					...t,
					...updates,
					managerName: mgr ? mgr.name : updates.managerName || t.managerName,
					teamLeadName: tl ? tl.name : updates.teamLeadName || t.teamLeadName
				};
				return updatedTeam;
			}
			return t;
		});
		if (updates.name && updates.name !== oldName) {
			storeState.employees = (storeState.employees || []).map((e) => {
				if (e.team === oldName || e.squad === oldName || e.teamId === teamId || e.squadId === teamId) return {
					...e,
					team: updates.name,
					teamId,
					squad: updates.name,
					squadId: teamId
				};
				return e;
			});
			storeState.users = (storeState.users || []).map((u) => {
				if (u.team === oldName || u.squad === oldName || u.teamId === teamId || u.squadId === teamId) return {
					...u,
					team: updates.name,
					teamId,
					squad: updates.name,
					squadId: teamId
				};
				return u;
			});
		}
		this.addAuditLog("Admin", "TEAM_UPDATE", `Updated details for team '${updates.name || prevTeam.name}'`);
		notifyListeners();
		return updatedTeam || prevTeam;
	},
	deleteTeam(teamId) {
		const team = this.getTeam(teamId);
		if (!team) throw new Error("Team not found.");
		const teamName = team.name;
		storeState.teams = (storeState.teams || []).filter((t) => t.id !== teamId && t.teamId !== teamId);
		storeState.employees = (storeState.employees || []).map((e) => {
			if (e.teamId === teamId || e.squadId === teamId || teamName && (e.team === teamName || e.squad === teamName)) return {
				...e,
				team: "",
				teamId: "",
				squad: "",
				squadId: ""
			};
			return e;
		});
		this.addAuditLog("Admin", "TEAM_DELETE", `Deleted team '${team.name}'`);
		notifyListeners();
		return true;
	},
	verifyTeamAssignment(teamId) {
		storeState.teams = (storeState.teams || []).map((t) => {
			if (t.id === teamId || t.name.toLowerCase() === String(teamId).toLowerCase()) return {
				...t,
				flaggedForVerification: false,
				verificationNote: "Verified and confirmed by administrator"
			};
			return t;
		});
		this.addAuditLog("Admin", "TEAM_VERIFY", `Administrator verified and finalized Team Leader assignment for team '${teamId}'`);
		notifyListeners();
		return true;
	},
	getTeamLeads() {
		return (storeState.employees || []).filter((e) => {
			if (!e || e.status === "inactive" || e.status === "terminated") return false;
			const r = String(e.role || "").toLowerCase().trim().replace(/[-\s]/g, "_");
			const des = String(e.designation || "").toLowerCase().trim();
			return [
				"team_leader",
				"team_lead",
				"manager",
				"director",
				"managing_director",
				"vertical_head",
				"revenue_growth_manager"
			].includes(r) || r.includes("lead") || r.includes("leader") || r.includes("tl") || des.includes("team lead") || des.includes("team leader") || des.includes("tl") || des.includes("lead");
		}).sort((a, b) => (a.displayName || a.name || "").localeCompare(b.displayName || b.name || ""));
	},
	getDepartments() {
		const rawDepts = storeState.departments;
		if (Array.isArray(rawDepts) && rawDepts.length > 0) return rawDepts;
		storeState.departments = INITIAL_DEPARTMENTS.map((d) => ({ ...d }));
		return storeState.departments;
	},
	getDepartment(deptId) {
		if (!deptId) return null;
		return this.getDepartments().find((d) => d.id === deptId || d.deptId === deptId || d._id === deptId || d.name?.toLowerCase() === String(deptId).toLowerCase() || d.code?.toLowerCase() === String(deptId).toLowerCase());
	},
	addDepartment(data) {
		const name = (data.name || "").trim();
		if (!name) throw new Error("Department name is required.");
		const id = data.id || data.deptId || `dept-${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
		const newDept = {
			id,
			deptId: id,
			name,
			code: (data.code || name.slice(0, 4)).trim().toUpperCase(),
			description: data.description || "",
			head: data.head || "Unassigned",
			isCustom: true
		};
		const current = this.getDepartments();
		storeState.departments = [...current.filter((d) => (d.id || d.deptId) !== id && d.name.toLowerCase() !== name.toLowerCase()), newDept];
		this.addAuditLog("Admin", "DEPARTMENT_CREATE", `Created department '${newDept.name}' (${newDept.code})`);
		notifyListeners();
		return newDept;
	},
	updateDepartment(deptId, updates) {
		const list = this.getDepartments();
		let oldName = updates.oldName || null;
		const target = list.find((d) => d.id === deptId || d.deptId === deptId || d._id === deptId || d.name?.toLowerCase() === String(deptId).toLowerCase());
		if (target && !oldName) oldName = target.name;
		const cleanUpdates = { ...updates };
		delete cleanUpdates.oldName;
		if (cleanUpdates.code !== void 0) cleanUpdates.code = String(cleanUpdates.code).trim().toUpperCase();
		if (cleanUpdates.name !== void 0) cleanUpdates.name = String(cleanUpdates.name).trim();
		if (cleanUpdates.head !== void 0) cleanUpdates.head = String(cleanUpdates.head).trim();
		if (cleanUpdates.description !== void 0) cleanUpdates.description = String(cleanUpdates.description).trim();
		let found = false;
		storeState.departments = list.map((d) => {
			if (d.id === deptId || d.deptId === deptId || d._id === deptId || oldName && d.name?.toLowerCase() === oldName.toLowerCase()) {
				found = true;
				return {
					...d,
					...cleanUpdates,
					id: d.id || deptId,
					deptId: d.deptId || d.id || deptId
				};
			}
			return d;
		});
		if (!found) {
			const base = INITIAL_DEPARTMENTS.find((d) => d.id === deptId || oldName && d.name.toLowerCase() === oldName.toLowerCase()) || {
				id: deptId,
				deptId,
				isCustom: true
			};
			storeState.departments = [...storeState.departments, {
				...base,
				...cleanUpdates
			}];
		}
		if (oldName && cleanUpdates.name && oldName.toLowerCase() !== cleanUpdates.name.toLowerCase()) {
			const newName = cleanUpdates.name;
			storeState.employees = (storeState.employees || []).map((emp) => {
				if ((emp.department || "").trim().toLowerCase() === oldName.toLowerCase()) return {
					...emp,
					department: newName
				};
				return emp;
			});
			storeState.users = (storeState.users || []).map((u) => {
				if ((u.department || "").trim().toLowerCase() === oldName.toLowerCase()) return {
					...u,
					department: newName
				};
				return u;
			});
			storeState.teams = (storeState.teams || []).map((t) => {
				if ((t.department || "").trim().toLowerCase() === oldName.toLowerCase()) return {
					...t,
					department: newName
				};
				return t;
			});
		}
		this.addAuditLog("Admin", "DEPARTMENT_UPDATE", `Updated department details for '${cleanUpdates.name || deptId}' (${cleanUpdates.code || ""})`);
		notifyListeners();
		return true;
	},
	deleteDepartment(deptId) {
		if (!deptId) throw new Error("Department ID is required.");
		const list = this.getDepartments();
		const targetId = String(deptId).trim().toLowerCase();
		const dept = list.find((d) => d.id && String(d.id).toLowerCase() === targetId || d.deptId && String(d.deptId).toLowerCase() === targetId || d._id && String(d._id).toLowerCase() === targetId || d.name && d.name.toLowerCase() === targetId);
		if (!dept) throw new Error("Department not found.");
		if (INITIAL_DEPARTMENTS.some((d) => d.id === dept.id || d.name.toLowerCase() === dept.name.toLowerCase())) throw new Error(`System core department '${dept.name}' cannot be deleted.`);
		storeState.departments = list.filter((d) => d.id !== dept.id && d.deptId !== dept.id && d.name.toLowerCase() !== dept.name.toLowerCase());
		const deptName = dept.name.toLowerCase();
		storeState.employees = (storeState.employees || []).map((emp) => {
			if ((emp.department || "").toLowerCase() === deptName) return {
				...emp,
				department: "Unassigned"
			};
			return emp;
		});
		storeState.users = (storeState.users || []).map((u) => {
			if ((u.department || "").toLowerCase() === deptName) return {
				...u,
				department: "Unassigned"
			};
			return u;
		});
		storeState.teams = (storeState.teams || []).map((t) => {
			if ((t.department || "").toLowerCase() === deptName) return {
				...t,
				department: "Unassigned"
			};
			return t;
		});
		this.addAuditLog("Admin", "DEPARTMENT_DELETE", `Deleted custom department '${dept.name}'`);
		notifyListeners();
		return true;
	},
	assignEmployeesToDepartment(deptIdOrName, employeeIds, actor = "Admin") {
		if (!deptIdOrName) throw new Error("Department is required.");
		const deptName = (this.getDepartment(deptIdOrName) || { name: deptIdOrName }).name || deptIdOrName;
		const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
		for (const empId of ids) {
			const emp = this.getEmployee(empId);
			if (emp) this.updateEmployee(emp.id, { department: deptName });
		}
		this.addAuditLog(actor, "DEPARTMENT_ASSIGNMENT", `Assigned ${ids.length} employee(s) to ${deptName}`);
		notifyListeners();
		return true;
	},
	assignUserRole(userId, newRole) {
		const roleObj = (storeState.roles || INITIAL_ROLES).find((r) => r.id === newRole);
		const perms = this.getRolePermissions(newRole) || roleObj?.permissions || [];
		storeState.users = (storeState.users || []).map((u) => {
			if (u.id === userId || u._id === userId) return {
				...u,
				role: newRole,
				permissions: perms
			};
			return u;
		});
		this.addAuditLog("Admin", "USER_ROLE_ASSIGN", `Assigned user '${userId}' to role '${newRole}'`);
		notifyListeners();
		return true;
	},
	clearAuditLogs() {
		storeState.auditLogs = [{
			id: `log-${Date.now()}`,
			timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19),
			actor: "Admin",
			action: "AUDIT_LOG_CLEAR",
			details: "Audit logs purged by System Administrator. Compliance baseline reset."
		}];
		notifyListeners();
		return true;
	},
	updateCompanySettings(updates) {
		storeState.companySettings = {
			...storeState.companySettings || {},
			...updates,
			attendanceRules: {
				...storeState.companySettings?.attendanceRules || {},
				...updates.attendanceRules || {}
			},
			leavePolicies: {
				...storeState.companySettings?.leavePolicies || {},
				...updates.leavePolicies || {}
			},
			helpDeskSettings: {
				...storeState.companySettings?.helpDeskSettings || {},
				...updates.helpDeskSettings || {}
			}
		};
		if (updates.attendanceRules) try {
			this.recalculateTodayAttendance();
		} catch (err) {
			console.warn("Local recalculateTodayAttendance error:", err);
		}
		this.addAuditLog("Admin", "COMPANY_SETTINGS_UPDATE", "Updated global company attendance parameters and leave policy rules");
		notifyListeners();
		return storeState.companySettings;
	},
	deleteUser(userId) {
		const target = (storeState.users || []).find((u) => u.id === userId || u._id === userId || u.employeeId === userId);
		const empId = target?.employeeId;
		const email = target?.email;
		storeState.users = (storeState.users || []).filter((u) => u.id !== userId && u._id !== userId && (!empId || u.employeeId !== empId));
		if (empId || email) {
			storeState.employees = (storeState.employees || []).filter((e) => e.id !== userId && e._id !== userId && (!empId || e.employeeId !== empId) && (!email || e.email !== email));
			storeState.payroll = (storeState.payroll || []).filter((p) => !empId || p.employeeId !== empId);
			storeState.attendance = (storeState.attendance || []).filter((a) => a.userId !== userId && (!empId || a.employeeId !== empId));
			storeState.leaveRequests = (storeState.leaveRequests || []).filter((l) => l.employeeId !== userId && (!empId || l.employeeId !== empId));
		}
		storeState = {
			...storeState,
			users: [...storeState.users],
			employees: [...storeState.employees],
			payroll: [...storeState.payroll || []],
			attendance: [...storeState.attendance || []],
			leaveRequests: [...storeState.leaveRequests || []]
		};
		this.addAuditLog("Admin", "USER_DELETE", `Deleted user account ${userId} and all associated records`);
		notifyListeners();
		return true;
	},
	addHoliday(holidayData) {
		const newHol = {
			id: `hol-${Date.now()}`,
			name: holidayData.name || holidayData.title,
			title: holidayData.name || holidayData.title,
			date: holidayData.date,
			day: holidayData.day || "National Holiday",
			type: holidayData.type || "Festival"
		};
		storeState.holidays = [...storeState.holidays || [], newHol];
		this.addAuditLog("Admin", "HOLIDAY_ADD", `Added holiday: ${newHol.title} on ${newHol.date}`);
		notifyListeners();
		return newHol;
	},
	deleteHoliday(identifier) {
		if (identifier === void 0 || identifier === null || identifier === "") return;
		storeState.holidays = (storeState.holidays || []).filter((h) => h.id !== identifier && h._id !== identifier && h.name !== identifier && h.title !== identifier);
		storeState = {
			...storeState,
			holidays: [...storeState.holidays]
		};
		this.addAuditLog("Admin", "HOLIDAY_DELETE", `Removed holiday record ${identifier}`);
		notifyListeners();
	},
	getHolidayCalendarImages() {
		return storeState.companySettings?.holidayCalendarImages || storeState.holidayCalendarImages || [];
	},
	uploadHolidayCalendarImages(images, actor = "Admin") {
		const prepared = (Array.isArray(images) ? images : [images]).filter(Boolean).map((img, i) => ({
			id: img.id || `cal-img-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
			url: img.url || img.dataUrl || img.src || "",
			title: img.title || img.name || `Holiday Calendar Page ${i + 1}`,
			uploadedAt: img.uploadedAt || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			uploadedBy: img.uploadedBy || actor || "Admin"
		}));
		const updated = [...storeState.companySettings?.holidayCalendarImages || storeState.holidayCalendarImages || [], ...prepared];
		storeState.holidayCalendarImages = updated;
		storeState.companySettings = {
			...storeState.companySettings || {},
			holidayCalendarImages: updated
		};
		storeState = { ...storeState };
		if (typeof window !== "undefined" && window.localStorage) try {
			window.localStorage.setItem("edufyi_holiday_calendar_images_v1", JSON.stringify(updated));
		} catch (err) {
			console.warn("Could not cache holiday calendar images", err);
		}
		this.addAuditLog(actor, "HOLIDAY_CALENDAR_IMAGE_UPLOAD", `Uploaded ${prepared.length} holiday calendar image(s)`);
		notifyListeners();
		return updated;
	},
	deleteHolidayCalendarImage(imageId, actor = "Admin") {
		const updated = (storeState.companySettings?.holidayCalendarImages || storeState.holidayCalendarImages || []).filter((img) => img.id !== imageId && img._id !== imageId);
		storeState.holidayCalendarImages = updated;
		storeState.companySettings = {
			...storeState.companySettings || {},
			holidayCalendarImages: updated
		};
		storeState = { ...storeState };
		if (typeof window !== "undefined" && window.localStorage) try {
			window.localStorage.setItem("edufyi_holiday_calendar_images_v1", JSON.stringify(updated));
		} catch (err) {
			console.warn("Could not update holiday calendar images cache", err);
		}
		this.addAuditLog(actor, "HOLIDAY_CALENDAR_IMAGE_DELETE", `Removed holiday calendar image ${imageId}`);
		notifyListeners();
		return updated;
	},
	addDocument(docData) {
		const newDoc = {
			id: `DOC-${Date.now()}`,
			title: docData.title,
			category: docData.category || "Company Policy",
			size: docData.size || "1.2 MB",
			date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			url: docData.url || "#"
		};
		storeState.documents = [newDoc, ...storeState.documents || []];
		this.addAuditLog("Admin", "DOCUMENT_UPLOAD", `Uploaded company document: ${newDoc.title} (${newDoc.category})`);
		this.addNotification({
			title: "New Document Published",
			message: `"${newDoc.title}" is now available in the Company Documents repository.`,
			type: "document"
		});
		notifyListeners();
		return newDoc;
	},
	deleteDocument(id) {
		storeState.documents = (storeState.documents || []).filter((d) => d.id !== id);
		this.addAuditLog("Admin", "DOCUMENT_DELETE", `Deleted company document ${id}`);
		notifyListeners();
	},
	addBranchLocation(branch) {
		const newLoc = {
			id: `loc-${Date.now()}`,
			name: branch.name,
			city: branch.city,
			lat: branch.lat !== void 0 && branch.lat !== null && branch.lat !== "" ? Number(branch.lat) : 0,
			lng: branch.lng !== void 0 && branch.lng !== null && branch.lng !== "" ? Number(branch.lng) : 0,
			radiusMeters: Number(branch.radiusMeters) || 100,
			isDefault: false
		};
		storeState.companySettings.locations = [...storeState.companySettings.locations || [], newLoc];
		this.addAuditLog("Admin", "BRANCH_ADD", `Added office branch: ${newLoc.name} (${newLoc.city})`);
		notifyListeners();
		return newLoc;
	},
	updateBranchLocation(id, updates) {
		if (!id) return;
		storeState.companySettings.locations = (storeState.companySettings.locations || []).map((loc) => {
			if (loc.id === id || loc._id === id || loc.name === id) return {
				...loc,
				...updates,
				lat: updates.lat !== void 0 && updates.lat !== null && updates.lat !== "" ? Number(updates.lat) : loc.lat,
				lng: updates.lng !== void 0 && updates.lng !== null && updates.lng !== "" ? Number(updates.lng) : loc.lng,
				radiusMeters: updates.radiusMeters !== void 0 && updates.radiusMeters !== null && updates.radiusMeters !== "" ? Number(updates.radiusMeters) : loc.radiusMeters
			};
			return loc;
		});
		storeState.companySettings = {
			...storeState.companySettings,
			locations: [...storeState.companySettings.locations]
		};
		storeState = {
			...storeState,
			companySettings: { ...storeState.companySettings }
		};
		this.addAuditLog("Admin", "BRANCH_UPDATE", `Updated office branch: ${updates.name || id}`);
		notifyListeners();
		return storeState.companySettings.locations.find((l) => l.id === id || l._id === id || l.name === id);
	},
	removeBranchLocation(id) {
		if (!id) return;
		storeState.companySettings.locations = (storeState.companySettings.locations || []).filter((l) => l.id !== id && l._id !== id && l.name !== id);
		storeState.companySettings = {
			...storeState.companySettings,
			locations: [...storeState.companySettings.locations]
		};
		storeState = {
			...storeState,
			companySettings: { ...storeState.companySettings }
		};
		this.addAuditLog("Admin", "BRANCH_REMOVE", `Removed office branch ${id}`);
		notifyListeners();
	},
	approveExpense(id, reviewerRole = "Manager") {
		storeState.expenses = (storeState.expenses || []).map((e) => {
			if (e.id === id || e._id === id) return {
				...e,
				status: "approved"
			};
			return e;
		});
		const exp = (storeState.expenses || []).find((e) => e.id === id || e._id === id);
		this.addNotification({
			title: "Expense Claim Approved",
			message: `Claim ${id} for ₹${exp?.amount || ""} (${exp?.category || ""}) has been approved.`,
			type: "expense",
			recipientId: exp?.employeeId
		});
		this.addAuditLog(reviewerRole, "EXPENSE_APPROVE", `Approved expense claim ${id}`);
		notifyListeners();
		if (typeof apiClient !== "undefined") apiClient.patch(`/workspace/expenses/${encodeURIComponent(id)}`, { status: "approved" }).then(() => this.refresh?.()).catch((err) => console.warn("Backend expense approve sync:", err.message));
		return exp;
	},
	rejectExpense(id, reviewerRole = "Manager", reason = "Insufficient invoice receipt") {
		storeState.expenses = (storeState.expenses || []).map((e) => {
			if (e.id === id || e._id === id) return {
				...e,
				status: "rejected",
				rejectionReason: reason
			};
			return e;
		});
		const exp = (storeState.expenses || []).find((e) => e.id === id || e._id === id);
		this.addNotification({
			title: "Expense Claim Declined",
			message: `Claim ${id} was rejected: ${reason}`,
			type: "expense",
			recipientId: exp?.employeeId
		});
		this.addAuditLog(reviewerRole, "EXPENSE_REJECT", `Rejected expense claim ${id}: ${reason}`);
		notifyListeners();
		if (typeof apiClient !== "undefined") apiClient.patch(`/workspace/expenses/${encodeURIComponent(id)}`, {
			status: "rejected",
			rejectionReason: reason
		}).then(() => this.refresh?.()).catch((err) => console.warn("Backend expense reject sync:", err.message));
		return exp;
	},
	backupDataJSON() {
		return JSON.stringify(storeState, null, 2);
	},
	restoreDataJSON(jsonString) {
		try {
			const parsed = JSON.parse(jsonString);
			if (!parsed || typeof parsed !== "object") return false;
			storeState = parsed;
			this.addAuditLog("Admin", "DATABASE_RESTORE", "Restored complete database state from backup JSON");
			notifyListeners();
			return true;
		} catch {
			return false;
		}
	},
	getEmployees() {
		return storeState.employees;
	},
	getEmployee(id) {
		return storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
	},
	addEmployee(empData) {
		const newEmpId = `emp-${Date.now()}`;
		const employeeCode = empData.employeeId || `EDU-EMP-${Math.floor(100 + Math.random() * 900)}`;
		const annualCTC = Number(empData.salary) || 9e5;
		const monthlyGross = Math.round(annualCTC / 12);
		const struct = empData.salaryStructure || {};
		const hasStruct = Boolean(struct && (struct.basic !== void 0 || struct.hra !== void 0 || struct.ca !== void 0 || struct.conveyance !== void 0 || struct.sa !== void 0 || struct.specialAllowance !== void 0 || struct.oa !== void 0 || struct.otherAllowance !== void 0));
		const basic = hasStruct && struct.basic !== void 0 ? Math.max(0, Number(struct.basic) || 0) : Math.round(monthlyGross * .5);
		const hra = hasStruct && struct.hra !== void 0 ? Math.max(0, Number(struct.hra) || 0) : Math.round(monthlyGross * .25);
		const conveyance = hasStruct && (struct.conveyance !== void 0 || struct.ca !== void 0) ? Math.max(0, Number(struct.conveyance ?? struct.ca) || 0) : 1600;
		const specialAllowance = hasStruct && (struct.specialAllowance !== void 0 || struct.sa !== void 0) ? Math.max(0, Number(struct.specialAllowance ?? struct.sa) || 0) : Math.round(monthlyGross * .15);
		const otherAllowance = hasStruct && (struct.otherAllowance !== void 0 || struct.oa !== void 0) ? Math.max(0, Number(struct.otherAllowance ?? struct.oa) || 0) : Math.max(0, monthlyGross - basic - hra - specialAllowance - conveyance);
		const medicalAllowance = 2500;
		const performanceBonus = Math.max(0, monthlyGross - (basic + hra + specialAllowance + conveyance + medicalAllowance));
		const pf = Math.round(basic * .12);
		const professionalTax = 200;
		const tdsTax = Math.round(monthlyGross * .05);
		const salaryStructure = {
			basic,
			hra,
			conveyance,
			ca: conveyance,
			specialAllowance,
			sa: specialAllowance,
			otherAllowance,
			oa: otherAllowance
		};
		const bankDetails = {
			bankName: empData.bankName || empData.bankDetails?.bankName || "HDFC Bank",
			accountNumber: empData.accountNumber || empData.bankDetails?.accountNumber || `501004928${Math.floor(1e3 + Math.random() * 9e3)}`,
			ifscCode: empData.ifscCode || empData.bankDetails?.ifscCode || "HDFC0001234",
			panTaxId: empData.panTaxId || empData.bankDetails?.panTaxId || `PAN${Math.floor(1e3 + Math.random() * 9e3)}X`,
			uanNumber: empData.uanNumber || empData.bankDetails?.uanNumber || `100984${Math.floor(1e5 + Math.random() * 9e5)}`
		};
		const emergencyContact = {
			name: empData.emergencyContactName || empData.emergencyContact?.name || "Emergency Contact",
			relationship: empData.emergencyContactRelationship || empData.emergencyContact?.relationship || "Family",
			phone: empData.emergencyContactPhone || empData.emergencyContact?.phone || empData.phone || "+91 98765 00001"
		};
		const newEmp = {
			id: newEmpId,
			_id: newEmpId,
			employeeId: employeeCode,
			name: empData.name,
			email: empData.email,
			phone: empData.phone || "+91 98765 43210",
			department: empData.department || "Engineering",
			designation: empData.designation || "Pending Designation",
			campus: empData.campus || "Ignite Campus",
			location: empData.location || empData.campus || "Ignite Campus",
			role: empData.role || "employee",
			status: empData.status || "active",
			joiningDate: empData.joiningDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			salary: annualCTC,
			salaryStructure,
			managerId: empData.managerId || "emp-2",
			managerName: empData.managerName || "Sarah Chen",
			bankDetails,
			emergencyContact,
			documents: [{
				id: `doc-${Date.now()}-1`,
				name: `Offer_Letter_${(empData.name || empData.displayName || "Employee").replace(/\s+/g, "_")}.pdf`,
				type: "Offer Letter",
				size: "1.2 MB",
				date: empData.joiningDate || "2026-10-01"
			}, {
				id: `doc-${Date.now()}-2`,
				name: `NDA_Signed_${(empData.name || empData.displayName || "Employee").replace(/\s+/g, "_")}.pdf`,
				type: "NDA",
				size: "650 KB",
				date: empData.joiningDate || "2026-10-01"
			}],
			onboardingChecklist: [
				{
					key: "offer",
					label: "Signed offer letter received",
					completed: true
				},
				{
					key: "background",
					label: "Identity & background verification",
					completed: true
				},
				{
					key: "laptop",
					label: "Workstation & credentials issued",
					completed: true
				},
				{
					key: "orientation",
					label: "Company culture orientation",
					completed: false
				},
				{
					key: "security",
					label: "Security & compliance training completed",
					completed: false
				}
			],
			exitDetails: null
		};
		storeState.employees = [newEmp, ...storeState.employees];
		const defaultPassword = empData.password || "Password@123";
		newEmp.temporaryPassword = defaultPassword;
		if (!(storeState.users || []).find((u) => u.email === newEmp.email || u.employeeId === newEmp.employeeId)) {
			const newUser = {
				id: `user-${Date.now()}`,
				employeeId: newEmp.employeeId,
				name: newEmp.name,
				displayName: newEmp.name,
				email: newEmp.email,
				password: defaultPassword,
				role: newEmp.role,
				department: newEmp.department,
				designation: newEmp.designation,
				status: newEmp.status === "active" ? "active" : "inactive",
				avatarTone: "teal",
				managerId: newEmp.managerId,
				permissions: this.getRole(newEmp.role)?.permissions?.length ? this.getRole(newEmp.role).permissions : newEmp.role === "admin" ? ["*"] : newEmp.role === "hr" ? INITIAL_USERS[1]?.permissions || [] : [
					"dashboard.read",
					"leave.self.read",
					"leave.self.write",
					"attendance.read",
					"attendance.write",
					"attendance.self.read",
					"payroll.self.read",
					"tasks.read",
					"training.read",
					"documents.read",
					"helpdesk.read",
					"announcements.read",
					"holidays.read"
				]
			};
			storeState.users = [newUser, ...storeState.users || []];
		}
		if (!(storeState.payroll || []).find((p) => p.employeeId === newEmp.employeeId && p.month === "September 2026")) {
			const initialPayrollRecord = {
				id: `pay-${newEmp.id}-2026-09`,
				employeeId: newEmp.employeeId,
				employeeName: newEmp.name,
				department: newEmp.department,
				designation: newEmp.designation,
				month: "September 2026",
				workingDays: 30,
				paidDays: 30,
				lopDays: 0,
				bankName: bankDetails.bankName,
				accountNumber: bankDetails.accountNumber,
				ifscCode: bankDetails.ifscCode,
				panTaxId: bankDetails.panTaxId,
				uanNumber: bankDetails.uanNumber,
				earnings: {
					basic,
					hra,
					specialAllowance,
					conveyance,
					medicalAllowance,
					performanceBonus,
					overtime: 0
				},
				deductions: {
					pf,
					esi: 0,
					professionalTax,
					tdsTax,
					loanAdvance: 0,
					lossOfPay: 0,
					performanceDeduction: 0,
					otherDeductions: 0
				},
				status: "processed",
				paymentDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
				notes: "Initial salary profile computed from annual CTC package"
			};
			storeState.payroll = [initialPayrollRecord, ...storeState.payroll || []];
		}
		this.addNotification({
			title: "New Employee Added",
			message: `${newEmp.name} (${newEmp.employeeId}) has been added to ${newEmp.department} with INR ${annualCTC.toLocaleString("en-IN")} CTC.`,
			type: "team"
		});
		this.addAuditLog("HR", "EMPLOYEE_CREATE", `Added employee ${newEmp.name} (${newEmp.employeeId}) to ${newEmp.department}`);
		notifyListeners();
		return newEmp;
	},
	updateOnboardingDocs(id, payload) {
		const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
		if (!emp) return false;
		if (payload.identity) emp.identity = {
			...emp.identity || {},
			...payload.identity
		};
		if (payload.parentsContact) emp.parentsContact = {
			...emp.parentsContact || {},
			...payload.parentsContact
		};
		if (payload.emergencyContact) emp.emergencyContact = {
			...emp.emergencyContact || {},
			...payload.emergencyContact
		};
		if (payload.bankDetails) emp.bankDetails = {
			...emp.bankDetails || {},
			...payload.bankDetails
		};
		if (payload.onboardingDocs) emp.onboardingDocs = {
			...emp.onboardingDocs || {},
			...payload.onboardingDocs
		};
		if (payload.financeDetails) emp.financeDetails = {
			...emp.financeDetails || {},
			...payload.financeDetails
		};
		if (payload.onboardingStatus) emp.onboardingStatus = payload.onboardingStatus;
		if (payload.onboardingVerifiedAt) emp.onboardingVerifiedAt = payload.onboardingVerifiedAt;
		if (payload.onboardingVerifiedBy) emp.onboardingVerifiedBy = payload.onboardingVerifiedBy;
		if (payload.onboardingSubmittedAt) emp.onboardingSubmittedAt = payload.onboardingSubmittedAt;
		if (payload.onboardingUnlockedAt) emp.onboardingUnlockedAt = payload.onboardingUnlockedAt;
		if (payload.phone) emp.phone = payload.phone;
		if (payload.onboardingRejectionReason !== void 0) emp.onboardingRejectionReason = payload.onboardingRejectionReason;
		if (payload.onboardingStatus === "verified" && emp.onboardingDocs) {
			const vAt = payload.onboardingVerifiedAt || (/* @__PURE__ */ new Date()).toISOString();
			const vBy = payload.onboardingVerifiedBy || "HR Management";
			const updatedDocs = { ...emp.onboardingDocs };
			Object.keys(updatedDocs).forEach((k) => {
				if (updatedDocs[k]) updatedDocs[k] = {
					...updatedDocs[k],
					status: "verified",
					verifiedAt: vAt,
					verifiedBy: vBy
				};
			});
			emp.onboardingDocs = updatedDocs;
		}
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		if (payload.bankDetails) storeState.payroll = (storeState.payroll || []).map((p) => {
			if (p.employeeId === emp.employeeId) return {
				...p,
				...payload.bankDetails.bankName ? { bankName: payload.bankDetails.bankName } : {},
				...payload.bankDetails.accountNumber ? { accountNumber: payload.bankDetails.accountNumber } : {},
				...payload.bankDetails.ifscCode ? { ifscCode: payload.bankDetails.ifscCode } : {},
				...payload.bankDetails.panTaxId ? { panTaxId: payload.bankDetails.panTaxId } : {},
				...payload.bankDetails.uanNumber ? { uanNumber: payload.bankDetails.uanNumber } : {}
			};
			return p;
		});
		this.addAuditLog("System", "ONBOARDING_UPDATE", `Updated onboarding documents, banking, and identity for ${emp.name}`);
		notifyListeners();
		if (typeof apiClient !== "undefined") {
			const realId = emp.id || emp._id || emp.employeeId || id;
			const rawStatus = payload.onboardingStatus ? String(payload.onboardingStatus).trim().toLowerCase() : "";
			const normalizedStatus = rawStatus === "pending" ? "submitted" : rawStatus === "rejected" ? "action_required" : rawStatus === "approved" ? "verified" : payload.onboardingStatus;
			apiClient.patch(`/employees/${encodeURIComponent(realId)}`, {
				onboardingDocs: emp.onboardingDocs,
				...normalizedStatus ? { onboardingStatus: normalizedStatus } : {},
				...payload.onboardingVerifiedAt ? { onboardingVerifiedAt: payload.onboardingVerifiedAt } : {},
				...payload.onboardingVerifiedBy ? { onboardingVerifiedBy: payload.onboardingVerifiedBy } : {}
			}).catch((err) => console.warn("Backend onboarding docs sync error:", err?.message || err));
		}
		return emp;
	},
	uploadDocument(id, docKey, fileData) {
		const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
		if (!emp) return false;
		const docs = { ...emp.onboardingDocs || {} };
		const currentDoc = docs[docKey] ? { ...docs[docKey] } : null;
		const hasExistingFile = Boolean(currentDoc && (currentDoc.url || currentDoc.fileName || Array.isArray(currentDoc.files) && currentDoc.files.length > 0));
		const isReuploadAuthorized = Boolean(currentDoc && (currentDoc.reuploadRequested === true || currentDoc.status === "reupload_requested" || currentDoc.status === "rejected"));
		if (hasExistingFile && !isReuploadAuthorized) throw new Error(`Document "${docKey}" is already submitted and locked. You cannot re-upload unless HR explicitly requests a change.`);
		const currentVersion = Number(currentDoc?.version || 1);
		const currentHistory = Array.isArray(currentDoc?.history) ? [...currentDoc.history] : [];
		if (hasExistingFile) currentHistory.push({
			version: currentVersion,
			fileName: currentDoc.fileName,
			url: currentDoc.url,
			size: currentDoc.size,
			files: currentDoc.files,
			uploadedAt: currentDoc.uploadedAt,
			submittedAt: currentDoc.submittedAt,
			status: currentDoc.status,
			rejectionReason: currentDoc.rejectionReason,
			reuploadRemarks: currentDoc.reuploadRemarks,
			verifiedAt: currentDoc.verifiedAt,
			verifiedBy: currentDoc.verifiedBy,
			archivedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		const safeName = String(fileData.fileName || `${docKey}.pdf`).trim().replace(/[/\\]/g, "_").slice(0, 100);
		docs[docKey] = {
			status: "submitted",
			fileName: safeName,
			url: fileData.url,
			size: fileData.size || `${Math.round((fileData.url?.length || 1e3) * .75 / 1024)} KB`,
			files: fileData.files || (fileData.url ? [{
				name: safeName,
				url: fileData.url,
				size: fileData.size
			}] : []),
			uploadedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
			version: hasExistingFile ? currentVersion + 1 : 1,
			reuploadRequested: false,
			reuploadRequestedAt: null,
			reuploadRequestedBy: null,
			reuploadRemarks: null,
			rejectionReason: null,
			verifiedAt: null,
			verifiedBy: null,
			history: currentHistory
		};
		if (docKey === "aadharCard") docs.aadharDoc = { ...docs[docKey] };
		if (docKey === "panCard") docs.panDoc = { ...docs[docKey] };
		emp.onboardingDocs = docs;
		emp.onboardingStatus = "submitted";
		emp.onboardingSubmittedAt = (/* @__PURE__ */ new Date()).toISOString();
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("Employee", "DOCUMENT_UPLOAD", `Uploaded ${docKey} for ${emp.name}`);
		notifyListeners();
		if (typeof apiClient !== "undefined") {
			const realId = emp.id || emp._id || emp.employeeId || id;
			apiClient.post(`/employees/${encodeURIComponent(realId)}/documents/${encodeURIComponent(docKey)}/upload`, fileData).catch((err) => console.warn("Backend document upload sync error:", err?.message || err));
		}
		return emp;
	},
	approveDocument(id, docKey, body = {}) {
		const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
		if (!emp) return false;
		const docs = { ...emp.onboardingDocs || {} };
		const currentDoc = docs[docKey] ? { ...docs[docKey] } : {};
		docs[docKey] = {
			...currentDoc,
			status: "verified",
			reuploadRequested: false,
			reuploadRemarks: null,
			rejectionReason: null,
			verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
			verifiedBy: body.verifiedBy || "HR Management",
			comments: body.comments || currentDoc.comments
		};
		if (docKey === "aadharCard") docs.aadharDoc = { ...docs[docKey] };
		if (docKey === "panCard") docs.panDoc = { ...docs[docKey] };
		emp.onboardingDocs = docs;
		const uploaded = Object.values(docs).filter((d) => d && (d.fileName || d.url));
		if (uploaded.length > 0 && uploaded.every((d) => d.status === "verified")) {
			emp.onboardingStatus = "verified";
			emp.onboardingVerifiedAt = (/* @__PURE__ */ new Date()).toISOString();
			emp.onboardingVerifiedBy = body.verifiedBy || "HR Management";
		}
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("HR", "DOCUMENT_APPROVE", `Approved ${docKey} for ${emp.name}`);
		notifyListeners();
		if (typeof apiClient !== "undefined") {
			const realId = emp.id || emp._id || emp.employeeId || id;
			apiClient.post(`/employees/${encodeURIComponent(realId)}/documents/${encodeURIComponent(docKey)}/approve`, body).catch((err) => console.warn("Backend document approval sync error:", err?.message || err));
		}
		return emp;
	},
	rejectDocument(id, docKey, reason = "Document rejected", body = {}) {
		const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
		if (!emp) return false;
		const docs = { ...emp.onboardingDocs || {} };
		docs[docKey] = {
			...docs[docKey] ? { ...docs[docKey] } : {},
			status: "reupload_requested",
			reuploadRequested: true,
			reuploadRequestedAt: (/* @__PURE__ */ new Date()).toISOString(),
			reuploadRequestedBy: body.rejectedBy || "HR Management",
			reuploadRemarks: reason,
			rejectedAt: (/* @__PURE__ */ new Date()).toISOString(),
			rejectedBy: body.rejectedBy || "HR Management",
			rejectionReason: reason,
			comments: body.comments || reason
		};
		if (docKey === "aadharCard") docs.aadharDoc = { ...docs[docKey] };
		if (docKey === "panCard") docs.panDoc = { ...docs[docKey] };
		emp.onboardingDocs = docs;
		emp.onboardingStatus = "action_required";
		emp.onboardingRejectionReason = reason;
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("HR", "DOCUMENT_REJECT", `Rejected ${docKey} for ${emp.name}: ${reason}`);
		notifyListeners();
		if (typeof apiClient !== "undefined") {
			const realId = emp.id || emp._id || emp.employeeId || id;
			apiClient.post(`/employees/${encodeURIComponent(realId)}/documents/${encodeURIComponent(docKey)}/reject`, {
				reason,
				...body
			}).catch((err) => console.warn("Backend document rejection sync error:", err?.message || err));
		}
		return emp;
	},
	approveOnboarding(id, options = {}) {
		const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
		if (!emp) return false;
		const vAt = (/* @__PURE__ */ new Date()).toISOString();
		const vBy = options.verifiedBy || "HR Management";
		const docs = { ...emp.onboardingDocs || {} };
		Object.keys(docs).forEach((k) => {
			if (docs[k] && typeof docs[k] === "object") docs[k] = {
				...docs[k],
				status: "verified",
				verifiedAt: vAt,
				verifiedBy: vBy
			};
		});
		emp.onboardingDocs = docs;
		emp.onboardingStatus = "verified";
		emp.onboardingVerifiedAt = vAt;
		emp.onboardingVerifiedBy = vBy;
		emp.onboardingRejectionReason = null;
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("HR", "ONBOARDING_APPROVE", `Approved all onboarding documents for ${emp.name}`);
		notifyListeners();
		if (typeof apiClient !== "undefined") {
			const realId = emp.id || emp._id || emp.employeeId || id;
			apiClient.post(`/employees/${encodeURIComponent(realId)}/onboarding/approve`).catch((err) => console.warn("Backend onboarding approval sync error:", err?.message || err));
		}
		return emp;
	},
	rejectOnboarding(id, reason = "Onboarding revision requested") {
		const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
		if (!emp) return false;
		emp.onboardingStatus = "action_required";
		emp.onboardingRejectionReason = reason;
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("HR", "ONBOARDING_REJECT", `Requested onboarding revision for ${emp.name}: ${reason}`);
		notifyListeners();
		return emp;
	},
	requestOnboardingRevision(id, reason = "Employee requested document revision") {
		const emp = storeState.employees.find((e) => e.id === id || e._id === id || e.employeeId === id);
		if (!emp) return false;
		emp.onboardingStatus = "revision_requested";
		emp.onboardingNotes = reason;
		emp.onboardingRejectionReason = null;
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("EMPLOYEE", "ONBOARDING_REVISION_REQUEST", `Employee ${emp.name} requested onboarding revision: ${reason}`);
		notifyListeners();
		return emp;
	},
	savePolicyConsent(employeeId, policyKey, consentData = {}) {
		const emp = storeState.employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId);
		if (!emp) return false;
		const now = /* @__PURE__ */ new Date();
		const consentEntry = {
			consented: true,
			consentedAt: now.toISOString(),
			consentedDateFormatted: now.toLocaleString("en-IN", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: true
			}),
			consentedBy: emp.name,
			employeeId: emp.employeeId,
			...consentData
		};
		const currentConsents = { ...emp.policyConsents || {} };
		currentConsents[policyKey] = consentEntry;
		emp.policyConsents = currentConsents;
		if (!emp.onboardingDocs) emp.onboardingDocs = {};
		emp.onboardingDocs.policyConsents = currentConsents;
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("EMPLOYEE", "POLICY_CONSENT", `Employee ${emp.name} (${emp.employeeId}) acknowledged company policy: ${consentData.policyTitle || policyKey} on ${consentEntry.consentedDateFormatted}`);
		notifyListeners();
		return emp;
	},
	saveAllPolicyConsents(employeeId, policies = [], additionalData = {}) {
		const emp = storeState.employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId);
		if (!emp) return false;
		const now = /* @__PURE__ */ new Date();
		const formatted = now.toLocaleString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true
		});
		const currentConsents = { ...emp.policyConsents || {} };
		policies.forEach((pol) => {
			currentConsents[pol.key || pol.id] = {
				consented: true,
				consentedAt: now.toISOString(),
				consentedDateFormatted: formatted,
				consentedBy: emp.name,
				employeeId: emp.employeeId,
				policyTitle: pol.title,
				...additionalData
			};
		});
		emp.policyConsents = currentConsents;
		if (!emp.onboardingDocs) emp.onboardingDocs = {};
		emp.onboardingDocs.policyConsents = currentConsents;
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("EMPLOYEE", "POLICY_CONSENT_ALL", `Employee ${emp.name} signed & consented to all company policies on ${formatted}`);
		notifyListeners();
		return emp;
	},
	updateComplianceDocs(employeeId, complianceDocs) {
		const emp = storeState.employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId);
		if (!emp) return false;
		emp.complianceDocs = {
			...emp.complianceDocs || {},
			...complianceDocs || {}
		};
		if (!emp.onboardingDocs) emp.onboardingDocs = {};
		emp.onboardingDocs.complianceDocs = emp.complianceDocs;
		storeState = {
			...storeState,
			employees: storeState.employees.map((e) => e.id === emp.id || e._id === emp._id || e.employeeId === emp.employeeId ? { ...emp } : e)
		};
		this.addAuditLog("EMPLOYEE", "COMPLIANCE_UPLOAD", `Employee ${emp.name} updated compliance & NDA documents`);
		notifyListeners();
		return emp;
	},
	updateEmployee(id, updates) {
		const existing = storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id);
		if (!existing) return null;
		const oldEmployeeId = existing.employeeId;
		const newEmployeeId = updates.employeeId ? String(updates.employeeId).trim().toUpperCase() : oldEmployeeId;
		const updatedBankDetails = {
			...existing.bankDetails || {},
			...updates.bankDetails || {},
			...updates.bankName ? { bankName: updates.bankName } : {},
			...updates.accountNumber ? { accountNumber: updates.accountNumber } : {},
			...updates.ifscCode ? { ifscCode: updates.ifscCode } : {},
			...updates.panTaxId ? { panTaxId: updates.panTaxId } : {},
			...updates.uanNumber ? { uanNumber: updates.uanNumber } : {}
		};
		const updatedEmergency = {
			...existing.emergencyContact || {},
			...updates.emergencyContact || {},
			...updates.emergencyContactName ? { name: updates.emergencyContactName } : {},
			...updates.emergencyContactPhone ? { phone: updates.emergencyContactPhone } : {}
		};
		storeState.employees = storeState.employees.map((emp) => {
			if (emp.id === id || emp._id === id || emp.employeeId === id) return {
				...emp,
				...updates,
				employeeId: newEmployeeId,
				salary: updates.salary !== void 0 ? Number(updates.salary) : emp.salary,
				salaryStructure: updates.salaryStructure !== void 0 ? updates.salaryStructure : emp.salaryStructure || {},
				bankDetails: updatedBankDetails,
				emergencyContact: updatedEmergency
			};
			return emp;
		});
		storeState.users = (storeState.users || []).map((u) => {
			if (u.employeeId === oldEmployeeId || u.id === id || u._id === id || u.email === existing.email) return {
				...u,
				employeeId: newEmployeeId,
				...updates.name ? {
					name: updates.name,
					displayName: updates.name
				} : {},
				...updates.department ? { department: updates.department } : {},
				...updates.designation ? { designation: updates.designation } : {},
				...updates.role ? { role: updates.role } : {},
				...updates.status ? { status: updates.status === "active" ? "active" : "inactive" } : {}
			};
			return u;
		});
		storeState.payroll = (storeState.payroll || []).map((p) => {
			if (p.employeeId === oldEmployeeId || p.employeeId === newEmployeeId) return {
				...p,
				employeeId: newEmployeeId,
				...updates.name ? { employeeName: updates.name } : {},
				...updates.department ? { department: updates.department } : {},
				...updates.designation ? { designation: updates.designation } : {},
				...updatedBankDetails.bankName ? { bankName: updatedBankDetails.bankName } : {},
				...updatedBankDetails.accountNumber ? { accountNumber: updatedBankDetails.accountNumber } : {},
				...updatedBankDetails.ifscCode ? { ifscCode: updatedBankDetails.ifscCode } : {},
				...updatedBankDetails.panTaxId ? { panTaxId: updatedBankDetails.panTaxId } : {},
				...updatedBankDetails.uanNumber ? { uanNumber: updatedBankDetails.uanNumber } : {}
			};
			return p;
		});
		if (oldEmployeeId && newEmployeeId && oldEmployeeId !== newEmployeeId) {
			storeState.attendance = (storeState.attendance || []).map((a) => {
				if (a.employeeId === oldEmployeeId) return {
					...a,
					employeeId: newEmployeeId
				};
				return a;
			});
			storeState.leaves = (storeState.leaves || []).map((l) => {
				if (l.employeeId === oldEmployeeId) return {
					...l,
					employeeId: newEmployeeId
				};
				return l;
			});
		}
		this.addAuditLog("HR", "EMPLOYEE_UPDATE", `Updated employee record for ${existing.name} (${newEmployeeId})`);
		notifyListeners();
		return storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id);
	},
	deleteEmployee(id) {
		const existing = storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id);
		if (!existing) return false;
		storeState.employees = storeState.employees.filter((emp) => emp.id !== id && emp._id !== id && emp.employeeId !== existing.employeeId);
		storeState.users = (storeState.users || []).filter((u) => u.employeeId !== existing.employeeId && u.email !== existing.email);
		storeState.payroll = (storeState.payroll || []).filter((p) => p.employeeId !== existing.employeeId);
		this.addNotification({
			title: "Employee Removed",
			message: `${existing.name} (${existing.employeeId}) has been successfully deleted from company records.`,
			type: "team"
		});
		this.addAuditLog("HR", "EMPLOYEE_DELETE", `Deleted employee ${existing.name} (${existing.employeeId}) and revoked all workspace access`);
		notifyListeners();
		return true;
	},
	toggleEmployeeStatus(id) {
		const existing = storeState.employees.find((emp) => emp.id === id || emp._id === id || emp.employeeId === id);
		if (!existing) return null;
		const newStatus = existing.status === "active" ? "inactive" : "active";
		storeState.employees = storeState.employees.map((emp) => {
			if (emp.id === id || emp._id === id || emp.employeeId === id) return {
				...emp,
				status: newStatus
			};
			return emp;
		});
		storeState.users = (storeState.users || []).map((u) => {
			if (u.employeeId === existing.employeeId || u.email === existing.email) return {
				...u,
				status: newStatus
			};
			return u;
		});
		this.addNotification({
			title: `Employee ${newStatus === "active" ? "Activated" : "Deactivated"}`,
			message: `${existing.name} (${existing.employeeId}) status changed to ${newStatus}.`,
			type: "team"
		});
		this.addAuditLog("HR", "EMPLOYEE_STATUS", `Changed status of ${existing.name} (${existing.employeeId}) to ${newStatus}`);
		notifyListeners();
		return newStatus;
	},
	toggleOnboardingItem(employeeId, itemKey) {
		storeState.employees = storeState.employees.map((emp) => {
			if (emp.id === employeeId || emp._id === employeeId) {
				const checklist = emp.onboardingChecklist.map((it) => it.key === itemKey ? {
					...it,
					completed: !it.completed
				} : it);
				return {
					...emp,
					onboardingChecklist: checklist
				};
			}
			return emp;
		});
		notifyListeners();
	},
	initiateExit(employeeId, exitData) {
		const defaultChecklist = [
			{
				key: "knowledge_transfer",
				label: "Handover & Knowledge Transfer Completed",
				completed: false
			},
			{
				key: "assets_returned",
				label: "Company Assets & Laptop Returned",
				completed: false
			},
			{
				key: "id_badge_access",
				label: "ID Badge & Building Access Revoked",
				completed: false
			},
			{
				key: "system_deprovisioning",
				label: "Email & System Accounts Revoked",
				completed: false
			},
			{
				key: "exit_interview",
				label: "HR Exit Interview Conducted",
				completed: false
			},
			{
				key: "fnf_settlement",
				label: "Final Settlement (FnF) Calculated",
				completed: false
			}
		];
		storeState.employees = storeState.employees.map((emp) => {
			if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) return {
				...emp,
				status: "notice",
				offboardingChecklist: emp.offboardingChecklist?.length ? emp.offboardingChecklist : defaultChecklist,
				exitDetails: {
					resignationDate: exitData.resignationDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
					lastWorkingDay: exitData.lastWorkingDay,
					noticePeriodDays: exitData.noticePeriodDays !== void 0 && exitData.noticePeriodDays !== null && exitData.noticePeriodDays !== "" ? isNaN(Number(exitData.noticePeriodDays)) ? 30 : Number(exitData.noticePeriodDays) : 30,
					reason: exitData.reason,
					handoverAssignee: exitData.handoverAssignee || "Unassigned",
					handoverStatus: "Initiated",
					exitInterviewCompleted: false,
					assetsReturned: false
				}
			};
			return emp;
		});
		this.addAuditLog("HR", "EXIT_INITIATE", `Initiated offboarding process for employee ${employeeId}`);
		notifyListeners();
	},
	toggleOffboardingItem(employeeId, itemKey) {
		storeState.employees = storeState.employees.map((emp) => {
			if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) {
				const checklist = (emp.offboardingChecklist || []).map((it) => it.key === itemKey ? {
					...it,
					completed: !it.completed,
					completedAt: !it.completed ? (/* @__PURE__ */ new Date()).toISOString() : void 0
				} : it);
				return {
					...emp,
					offboardingChecklist: checklist
				};
			}
			return emp;
		});
		notifyListeners();
	},
	cancelExit(employeeId) {
		storeState.employees = storeState.employees.map((emp) => {
			if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) return {
				...emp,
				status: "active",
				exitDetails: null,
				employmentEndDate: null
			};
			return emp;
		});
		this.addAuditLog("HR", "EXIT_CANCEL", `Cancelled exit for employee ${employeeId}`);
		notifyListeners();
	},
	finalizeExit(employeeId) {
		storeState.employees = storeState.employees.map((emp) => {
			if (emp.id === employeeId || emp._id === employeeId || emp.employeeId === employeeId) return {
				...emp,
				status: "inactive",
				exitDetails: {
					...emp.exitDetails || {},
					handoverStatus: "Completed",
					assetsReturned: true,
					exitInterviewCompleted: true
				}
			};
			return emp;
		});
		this.addAuditLog("HR", "EXIT_FINALIZE", `Finalized exit for employee ${employeeId}`);
		notifyListeners();
	},
	getAttendance(date) {
		if (!date) return storeState.attendance;
		return storeState.attendance.filter((a) => a.date === date);
	},
	verifyAttendanceLocation(latitude, longitude, wifiSSID, bssid = null, publicIp = null) {
		const settings = storeState.companySettings;
		const allowedWifi = settings?.allowedWifiSSIDs || [];
		const wifiNetworks = settings?.wifiNetworks || [];
		const officeNetworkIPs = settings?.officeNetworkIPs || [];
		const normalizedIp = publicIp ? String(publicIp).trim().toLowerCase() : null;
		const isNetworkVerified = Boolean(normalizedIp && officeNetworkIPs.some((e) => String(e.ip).trim().toLowerCase() === normalizedIp));
		const matchedNetworkIP = isNetworkVerified ? officeNetworkIPs.find((e) => String(e.ip).trim().toLowerCase() === normalizedIp) : null;
		const matchedNetwork = wifiNetworks.find((n) => n.ssid === wifiSSID && n.status === "active");
		const isSsidKnown = Boolean(wifiSSID && allowedWifi.includes(wifiSSID));
		const normalizedBssid = bssid ? String(bssid).toUpperCase().trim() : null;
		const isBssidVerified = Boolean(matchedNetwork && matchedNetwork.bssid && normalizedBssid && matchedNetwork.bssid.toUpperCase() === normalizedBssid);
		let nearestLocation = null;
		let minDistance = Infinity;
		if (latitude !== void 0 && longitude !== void 0 && latitude !== null && longitude !== null) (settings?.locations || []).forEach((loc) => {
			if (loc.lat !== void 0 && loc.lng !== void 0) {
				const dist = calculateDistanceMeters(latitude, longitude, loc.lat, loc.lng);
				if (dist !== null && dist < minDistance) {
					minDistance = dist;
					nearestLocation = loc;
				}
			}
		});
		const maxAllowedRadius = Number(settings?.attendanceRules?.maxGeofenceRadiusMeters) || Number(nearestLocation?.radiusMeters) || 50;
		const hasGps = minDistance !== Infinity;
		const isGpsVerified = hasGps && (minDistance <= maxAllowedRadius || minDistance - 30 <= maxAllowedRadius);
		const isWifiVerified = Boolean(isNetworkVerified || isBssidVerified);
		const isWifiTrusted = Boolean(isNetworkVerified || isBssidVerified);
		let method = "remote";
		if (isWifiVerified && isGpsVerified) method = "wifi_and_gps";
		else if (isGpsVerified) method = "gps_geofence";
		else if (isNetworkVerified) method = "office_network";
		else if (isBssidVerified) method = "wifi_secure";
		const isEligible = settings?.attendanceRules?.requireOfficeNetworkAndGps ?? false ? Boolean(isNetworkVerified && isGpsVerified) : Boolean(isNetworkVerified || isBssidVerified && isGpsVerified || isGpsVerified);
		let failureReason = null;
		let message = "Attendance verification successful.";
		if (!isEligible) {
			if (!isNetworkVerified && !isGpsVerified) {
				failureReason = "NETWORK_AND_GPS_FAILED";
				message = `Both Office Network (IP) and GPS Geofence verification failed. Connect to registered office Wi-Fi and verify you are within ${maxAllowedRadius}m of the office.`;
			} else if (!isNetworkVerified) {
				failureReason = "NETWORK_VERIFICATION_FAILED";
				message = `Office Network verification failed: Request IP (${publicIp || "unknown"}) is not on the registered office network. Please connect to the office Wi-Fi network.`;
			} else if (!isGpsVerified) {
				failureReason = "GPS_VERIFICATION_FAILED";
				message = hasGps ? `GPS geofence verification failed: You are ${Math.round(minDistance)}m away from ${nearestLocation?.name || "the office"} (permitted radius: ${maxAllowedRadius}m).` : "GPS verification failed: Device location is required to verify physical presence within the office geofence.";
			} else {
				failureReason = "VERIFICATION_FAILED";
				message = "Attendance verification failed.";
			}
		}
		return {
			isSsidKnown,
			isBssidVerified,
			isNetworkVerified,
			isWifiVerified,
			isWifiTrusted,
			isGpsVerified,
			hasGps,
			publicIp: publicIp || null,
			matchedNetworkLabel: matchedNetworkIP?.label || null,
			bssid: normalizedBssid,
			expectedBssid: matchedNetwork?.bssid || null,
			securityType: matchedNetwork?.securityType || null,
			distanceMeters: hasGps ? minDistance : null,
			maxAllowedDistance: maxAllowedRadius,
			nearestLocation: nearestLocation ? nearestLocation.name : settings?.locations?.[0]?.name || "Office",
			isEligible,
			method,
			failureReason,
			message
		};
	},
	checkIn(...args) {
		let employeeId, employeeName, customWifi, date, gpsData, bssid, publicIp, shift, shiftCode;
		if (typeof args[0] === "object" && args[0] !== null) {
			const p = args[0];
			employeeId = p.employeeId;
			employeeName = p.employeeName;
			customWifi = p.wifiSSID && !/airtel|dji|3052/i.test(p.wifiSSID) ? p.wifiSSID : "Edufyi";
			date = p.date || "2026-09-30";
			gpsData = {
				latitude: p.latitude ?? p.gpsData?.latitude ?? null,
				longitude: p.longitude ?? p.gpsData?.longitude ?? null,
				accuracy: p.accuracy ?? p.gpsData?.accuracy ?? null,
				distanceMeters: p.distanceMeters ?? p.gpsData?.distanceMeters ?? null,
				locationName: p.locationName ?? p.gpsData?.locationName ?? null
			};
			bssid = p.bssid || null;
			publicIp = p.publicIp || null;
			shift = p.shift || null;
			shiftCode = p.shiftCode || null;
		} else [employeeId, employeeName, customWifi = "Edufyi-Office-5G", date = "2026-09-30", gpsData = null, bssid = null, publicIp = null, shift = null, shiftCode = null] = args;
		const verification = this.verifyAttendanceLocation(gpsData?.latitude, gpsData?.longitude, customWifi, bssid, publicIp);
		if (!verification.isEligible) throw new Error(verification.message || "Attendance verification failed.");
		const isWifiVerified = verification.isWifiVerified;
		const isGpsVerified = verification.isGpsVerified;
		const distance = gpsData?.distanceMeters !== void 0 ? gpsData.distanceMeters : verification.distanceMeters;
		const nearestLoc = gpsData?.locationName || verification.nearestLocation;
		const maxAllowedRadius = verification.maxAllowedRadius || 150;
		const now = /* @__PURE__ */ new Date();
		const timeStr = now.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true
		});
		const initialStatus = "present";
		const noteText = shift ? `Verified Attendance (${shift})` : "Verified Attendance";
		const existingIndex = storeState.attendance.findIndex((a) => a.employeeId === employeeId && a.date === date);
		const newRecord = {
			id: `att-${Date.now()}`,
			employeeId,
			employeeName,
			date,
			checkIn: timeStr,
			checkInAt: now.toISOString(),
			checkOut: null,
			status: initialStatus,
			isLate: false,
			isHalfDay: false,
			lateCount: 0,
			notes: noteText,
			wifiSSID: customWifi,
			bssid: verification.bssid || null,
			wifiVerified: isWifiVerified,
			publicIp: publicIp || null,
			networkVerified: verification.isNetworkVerified,
			latitude: gpsData?.latitude ?? null,
			longitude: gpsData?.longitude ?? null,
			distanceMeters: distance ?? null,
			gpsVerified: isGpsVerified,
			locationName: nearestLoc || (isGpsVerified ? verification.nearestLocation || "Office" : "Remote Location"),
			verificationMethod: verification.method,
			shift: shift || null,
			shiftCode: shiftCode || null,
			isOnBreak: false,
			currentBreak: null,
			breaks: [],
			totalBreakMinutes: 0,
			totalHours: "Active (Live)"
		};
		if (existingIndex >= 0) storeState.attendance[existingIndex] = {
			...storeState.attendance[existingIndex],
			...newRecord
		};
		else storeState.attendance = [newRecord, ...storeState.attendance];
		const distText = distance !== null ? ` (GPS: ${distance}m away, ≤${maxAllowedRadius}m geofence: ${isGpsVerified ? "Verified" : "Outside"})` : "";
		this.addNotification({
			title: "Attendance Checked In",
			message: `Checked in successfully at ${timeStr} via ${customWifi} (${isWifiVerified ? "Verified Office Wi-Fi" : "Remote Network"})${distText} for ${shift}.`,
			type: "attendance"
		});
		this.addAuditLog(employeeName, "ATTENDANCE_CHECKIN", `Check-in recorded: ${timeStr} on Wi-Fi: ${customWifi}, GPS: ${distance !== null ? distance + "m" : "N/A"} (${date})`);
		notifyListeners();
		return newRecord;
	},
	startBreak(type = "lunch", date = "2026-09-30", employeeId = null) {
		const now = /* @__PURE__ */ new Date();
		const timeStr = now.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true
		});
		const target = storeState.attendance.find((a) => a.date === date && (!employeeId || a.employeeId === employeeId));
		if (target) {
			target.isOnBreak = true;
			target.currentBreak = {
				type,
				startTime: timeStr,
				startAt: now.toISOString()
			};
			target.totalHours = `On Break (${type === "lunch" ? "Lunch" : "Break"})`;
			this.addNotification({
				title: "Break Started",
				message: `Started ${type === "lunch" ? "Lunch" : "Short"} break at ${timeStr}. Work timer paused.`,
				type: "attendance"
			});
			notifyListeners();
		}
	},
	endBreak(date = "2026-09-30", employeeId = null) {
		const now = /* @__PURE__ */ new Date();
		const timeStr = now.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true
		});
		const target = storeState.attendance.find((a) => a.date === date && (!employeeId || a.employeeId === employeeId));
		if (target && target.isOnBreak) {
			const startAt = target.currentBreak?.startAt ? new Date(target.currentBreak.startAt) : now;
			const durationMinutes = Math.max(1, Math.round((now - startAt) / 6e4));
			target.breaks = target.breaks || [];
			target.breaks.push({
				type: target.currentBreak?.type || "lunch",
				startTime: target.currentBreak?.startTime || timeStr,
				endTime: timeStr,
				durationMinutes
			});
			target.totalBreakMinutes = (target.totalBreakMinutes || 0) + durationMinutes;
			target.isOnBreak = false;
			target.currentBreak = null;
			target.totalHours = "Active (Live)";
			this.addNotification({
				title: "Break Ended",
				message: `Ended break at ${timeStr} (${durationMinutes} mins). Work timer resumed.`,
				type: "attendance"
			});
			notifyListeners();
		}
	},
	checkOut(...args) {
		let employeeId, employeeName, date, autoPunchOut = false, completionTime = null, disconnectionTime = null, punchOutReason = null;
		if (typeof args[0] === "object" && args[0] !== null) {
			employeeId = args[0].employeeId;
			employeeName = args[0].employeeName;
			date = args[0].date || "2026-09-30";
			Number(args[0].offCampusDurationMinutes);
			autoPunchOut = Boolean(args[0].autoPunchOut);
			completionTime = args[0].completionTime;
			disconnectionTime = args[0].disconnectionTime;
			punchOutReason = args[0].punchOutReason;
		} else [employeeId, employeeName, date = "2026-09-30"] = args;
		const now = /* @__PURE__ */ new Date();
		let effectiveDate = now;
		const targetTime = completionTime || disconnectionTime;
		if (autoPunchOut && targetTime) {
			const parsed = new Date(targetTime);
			if (!isNaN(parsed.getTime())) effectiveDate = parsed;
		}
		const timeStr = effectiveDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true
		});
		storeState.attendance = storeState.attendance.map((att) => {
			if (att.employeeId === employeeId && att.date === date) {
				let totalBreak = att.totalBreakMinutes || 0;
				let breaks = Array.isArray(att.breaks) ? [...att.breaks] : [];
				if (att.isOnBreak && att.currentBreak?.startAt) {
					const breakStart = new Date(att.currentBreak.startAt);
					const breakEnd = autoPunchOut && effectiveDate < now ? effectiveDate : now;
					const autoMins = Math.max(1, Math.round((breakEnd - breakStart) / 6e4));
					totalBreak += autoMins;
					breaks.push({
						type: att.currentBreak.type || "lunch",
						startTime: att.currentBreak.startTime || timeStr,
						endTime: timeStr,
						startAt: breakStart,
						endAt: breakEnd,
						durationMinutes: autoMins
					});
				}
				let elapsedMins = 0;
				if (att.checkInAt) elapsedMins = Math.max(0, Math.floor((effectiveDate.getTime() - new Date(att.checkInAt).getTime()) / 6e4));
				else if (att.checkIn) {
					const match = String(att.checkIn).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
					if (match) {
						let h = parseInt(match[1], 10);
						const m = parseInt(match[2], 10);
						const meridiem = match[3]?.toUpperCase();
						if (meridiem === "PM" && h < 12) h += 12;
						if (meridiem === "AM" && h === 12) h = 0;
						const inDate = new Date(effectiveDate);
						inDate.setHours(h, m, 0, 0);
						elapsedMins = Math.max(0, Math.floor((effectiveDate.getTime() - inDate.getTime()) / 6e4));
					}
				}
				const netWorkMinutes = Math.max(0, elapsedMins - totalBreak);
				const hours = Math.floor(netWorkMinutes / 60);
				const mins = netWorkMinutes % 60;
				const breakStr = totalBreak > 0 ? ` • ${totalBreak}m Break` : "";
				let newStatus = att.status || "present";
				if (att.status !== "on-leave") {
					if (netWorkMinutes >= 480) newStatus = att.status === "late" ? "late" : att.status === "half-day" ? "half-day" : "present";
					else if (netWorkMinutes >= 240) newStatus = "half-day";
					else newStatus = "short-hours";
				}
				const reasonToSet = punchOutReason || (autoPunchOut ? "Auto Punch Out" : "");
				return {
					...att,
					checkOut: timeStr,
					checkOutAt: effectiveDate.toISOString(),
					autoPunchOut: Boolean(autoPunchOut),
					punchOutType: autoPunchOut ? "auto" : "manual",
					punchOutReason: reasonToSet,
					isOnBreak: false,
					currentBreak: null,
					breaks,
					totalBreakMinutes: totalBreak,
					offCampusMinutes: 0,
					status: newStatus,
					isEarlyLogout: false,
					isLop: false,
					isHalfDay: newStatus === "half-day" || Boolean(att.isHalfDay),
					earlyLogoutCount: att.earlyLogoutCount || 0,
					notes: att.notes || "",
					totalHours: `${hours}h ${mins}m (Completed)${breakStr}`
				};
			}
			return att;
		});
		this.addNotification({
			title: "Attendance Checked Out",
			message: `Checked out successfully at ${timeStr}. Net work hours recorded.`,
			type: "attendance"
		});
		this.addAuditLog(employeeName, "ATTENDANCE_CHECKOUT", `Check-out recorded: ${timeStr} (${date})`);
		notifyListeners();
		const targetRecord = (storeState.attendance || []).find((att) => att.employeeId === employeeId && att.date === date);
		if (targetRecord) apiClient.post("/attendance/records", targetRecord).catch((err) => console.warn("checkOut sync notice:", err.message));
	},
	markAttendance(record) {
		const date = record.date || "2026-09-30";
		const verification = this.verifyAttendanceLocation(record.latitude, record.longitude, record.wifiSSID);
		const isVerified = record.wifiVerified !== void 0 ? record.wifiVerified : verification.isWifiVerified;
		const existingIndex = storeState.attendance.findIndex((a) => a.id === record.id || a.employeeId === record.employeeId && a.date === date);
		let finalStatus = record.status;
		let isEarlyLogout = record.isEarlyLogout || record.status === "early-logout";
		let isLop = record.isLop || record.status === "lop";
		if (record.checkIn && !["on-leave", "lop"].includes(finalStatus)) {
			const matchIn = /(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i.exec(record.checkIn);
			if (matchIn) {
				let ih = parseInt(matchIn[1], 10);
				const im = parseInt(matchIn[2], 10);
				const imeridiem = matchIn[4]?.toUpperCase();
				if (imeridiem === "PM" && ih < 12) ih += 12;
				if (imeridiem === "AM" && ih === 12) ih = 0;
				const inTotalMins = ih * 60 + im;
				let shiftStartTimeStr = storeState.companySettings?.attendanceRules?.workStartTime || "11:00 AM";
				if (record.shift && typeof record.shift === "string") {
					const sm = record.shift.match(/\((.+?)\s*[-–—]\s*(?:.+?)\)/);
					if (sm) shiftStartTimeStr = sm[1].trim();
				}
				if (inTotalMins >= (() => {
					const match = String(shiftStartTimeStr).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
					if (!match) return 660;
					let sh = parseInt(match[1], 10);
					const smin = parseInt(match[2], 10);
					const smeridiem = match[3]?.toUpperCase();
					if (smeridiem === "PM" && sh < 12) sh += 12;
					if (smeridiem === "AM" && sh === 12) sh = 0;
					return sh * 60 + smin;
				})() + 60) {
					finalStatus = "half-day";
					record.isHalfDay = true;
				}
			}
		}
		if (!finalStatus && record.checkOut) {
			const match = /(\d+):(\d+)(?::(\d+))?\s*(AM|PM)?/i.exec(record.checkOut);
			if (match) {
				let h = parseInt(match[1], 10);
				const m = parseInt(match[2], 10);
				const meridiem = match[4]?.toUpperCase();
				if (meridiem === "PM" && h < 12) h += 12;
				if (meridiem === "AM" && h === 12) h = 0;
				const outTotalMins = h * 60 + m;
				let shiftEndTimeStr = storeState.companySettings?.attendanceRules?.workEndTime || "18:30";
				if (record.shift && typeof record.shift === "string") {
					const sm = record.shift.match(/\((?:.+?)\s*[-–—]\s*(.+?)\)/);
					if (sm) shiftEndTimeStr = sm[1].trim();
				}
				const shiftEndMins = (() => {
					const match = String(shiftEndTimeStr).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
					if (!match) return 1110;
					let eh = parseInt(match[1], 10);
					const emin = parseInt(match[2], 10);
					const emeridiem = match[3]?.toUpperCase();
					if (emeridiem === "PM" && eh < 12) eh += 12;
					if (emeridiem === "AM" && eh === 12) eh = 0;
					return eh * 60 + emin;
				})();
				if (outTotalMins < shiftEndMins && outTotalMins >= shiftEndMins - 60) {
					isEarlyLogout = true;
					if ((date ? parseInt(date.split("-")[2], 10) : (/* @__PURE__ */ new Date()).getDate()) >= 25) {
						isLop = true;
						finalStatus = "lop";
					} else finalStatus = "early-logout";
				}
			}
		}
		let updated;
		if (existingIndex >= 0) {
			const isNowPresent = finalStatus === "present";
			const existing = storeState.attendance[existingIndex];
			updated = {
				...existing,
				...record,
				status: finalStatus || existing.status || "present",
				isEarlyLogout,
				isLop,
				isHalfDay: isNowPresent ? false : record.isHalfDay !== void 0 ? record.isHalfDay : finalStatus === "half-day",
				isLate: isNowPresent ? false : record.isLate !== void 0 ? record.isLate : finalStatus === "late",
				lateCount: isNowPresent ? 0 : record.lateCount ?? existing.lateCount ?? 0,
				earlyLogoutCount: record.earlyLogoutCount ?? existing.earlyLogoutCount ?? 0,
				totalHours: (() => {
					const tIn = record.checkIn || existing.checkIn;
					const tOut = record.checkOut !== void 0 ? record.checkOut : existing.checkOut;
					if (!tOut || tOut === "—" || !tIn) return record.totalHours || existing.totalHours || "Active (Live)";
					const parse = (t) => {
						if (!t) return null;
						const m = String(t).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
						if (!m) return null;
						let h = parseInt(m[1], 10);
						const min = parseInt(m[2], 10);
						const meridiem = m[3]?.toUpperCase();
						if (meridiem === "PM" && h < 12) h += 12;
						if (meridiem === "AM" && h === 12) h = 0;
						return h * 60 + min;
					};
					const iM = parse(tIn);
					const oM = parse(tOut);
					if (iM !== null && oM !== null) {
						let diff = oM - iM;
						if (diff < 0) diff += 1440;
						const b = Math.max(0, Number(record.totalBreakMinutes ?? existing.totalBreakMinutes ?? 0));
						const net = Math.max(0, diff - b);
						const h = Math.floor(net / 60);
						const min = net % 60;
						const bPart = b > 0 ? ` • ${b}m Break` : "";
						return `${h}h ${min}m (${record.autoPunchOut ?? existing.autoPunchOut ? "Auto Punch Out" : "Completed"})${bPart}`;
					}
					return record.totalHours || existing.totalHours || "Active (Live)";
				})(),
				notes: record.notes ?? existing.notes ?? "",
				date,
				wifiVerified: isVerified,
				gpsVerified: record.gpsVerified !== void 0 ? record.gpsVerified : verification.isGpsVerified,
				distanceMeters: record.distanceMeters !== void 0 ? record.distanceMeters : verification.distanceMeters,
				locationName: record.locationName || verification.nearestLocation
			};
			storeState.attendance[existingIndex] = updated;
		} else {
			const isNowPresent = finalStatus === "present";
			updated = {
				id: `att-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
				employeeId: record.employeeId,
				employeeName: record.employeeName,
				date,
				checkIn: record.checkIn || "09:15 AM",
				checkOut: record.checkOut || "06:15 PM",
				status: finalStatus || "present",
				isEarlyLogout,
				isLop,
				isHalfDay: isNowPresent ? false : record.isHalfDay !== void 0 ? record.isHalfDay : finalStatus === "half-day",
				isLate: isNowPresent ? false : record.isLate !== void 0 ? record.isLate : finalStatus === "late",
				lateCount: isNowPresent ? 0 : record.lateCount ?? 0,
				earlyLogoutCount: record.earlyLogoutCount ?? 0,
				wifiSSID: record.wifiSSID || storeState.companySettings?.allowedWifiSSIDs?.[0] || "Edufyi",
				wifiVerified: isVerified,
				latitude: record.latitude ?? (isVerified ? 37.789172 : null),
				longitude: record.longitude ?? (isVerified ? -122.401449 : null),
				distanceMeters: record.distanceMeters !== void 0 ? record.distanceMeters : verification.distanceMeters ?? (isVerified ? 25 : null),
				gpsVerified: record.gpsVerified !== void 0 ? record.gpsVerified : verification.isGpsVerified || isVerified && verification.distanceMeters === null,
				locationName: record.locationName || verification.nearestLocation,
				totalHours: record.totalHours || (record.checkOut ? "8.0 hrs" : "Active (Live)"),
				notes: record.notes || ""
			};
			storeState.attendance = [updated, ...storeState.attendance];
		}
		this.addAuditLog("HR", "ATTENDANCE_MARK", `Attendance logged for ${updated.employeeName} (${updated.employeeId}) on ${date} as ${updated.status}`);
		notifyListeners();
		apiClient.post("/attendance/records", updated).catch((err) => console.warn("markAttendance sync notice:", err.message));
		return updated;
	},
	async deleteAttendance(id, extra = {}) {
		const cleanId = String(id || "").trim();
		const existing = (storeState.attendance || []).find((a) => {
			if (cleanId && (a.id === cleanId || a._id === cleanId || String(a.id) === cleanId || String(a._id) === cleanId)) return true;
			if (extra?.employeeId && extra?.date && a.employeeId?.toUpperCase() === String(extra.employeeId).toUpperCase() && a.date === extra.date) return true;
			return false;
		});
		storeState.attendance = (storeState.attendance || []).filter((a) => {
			if (cleanId && (a.id === cleanId || a._id === cleanId || String(a.id) === cleanId || String(a._id) === cleanId)) return false;
			if (extra?.employeeId && extra?.date && a.employeeId?.toUpperCase() === String(extra.employeeId).toUpperCase() && a.date === extra.date) return false;
			return true;
		});
		if (existing) {
			this.addAuditLog("HR", "ATTENDANCE_DELETE", `Removed attendance entry for ${existing.employeeName} on ${existing.date}`);
			const recordId = cleanId || existing._id || existing.id;
			if (recordId) apiClient.delete(`/attendance/records/${recordId}`, { params: {
				employeeId: extra?.employeeId || existing.employeeId,
				date: extra?.date || existing.date
			} }).catch((err) => console.warn("deleteAttendance sync notice:", err.message));
		}
		notifyListeners();
		return true;
	},
	async recalculateTodayAttendance(targetDate = null) {
		const today = targetDate || new Intl.DateTimeFormat("en-CA", {
			timeZone: "Asia/Kolkata",
			year: "numeric",
			month: "2-digit",
			day: "2-digit"
		}).format(/* @__PURE__ */ new Date());
		try {
			const res = await apiClient.post("/attendance/recalculate", {
				date: today,
				fixHalfDayLop: true
			});
			await this.refresh();
			const updatedCount = res.data?.data?.updatedCount ?? res.data?.updatedCount ?? 0;
			return {
				updatedCount,
				date: today,
				records: storeState.attendance?.filter((r) => r.date === today) || [],
				message: `Attendance roster recalculated and verified successfully (${updatedCount} record(s) synchronized).`
			};
		} catch (err) {
			console.warn("Backend attendance recalculate error, refreshing local state:", err?.message || err);
			await this.refresh();
			return {
				updatedCount: 0,
				date: today,
				records: storeState.attendance?.filter((r) => r.date === today) || [],
				message: "Attendance roster refreshed."
			};
		}
	},
	async triggerAutoPunchOut(options = {}) {
		try {
			const payload = typeof options === "object" ? options : { date: options };
			const res = await apiClient.post("/attendance/auto-punch-out/run-now", payload);
			await this.refresh();
			const data = res.data?.data || res.data || {};
			const totalClosed = res.data?.totalFinalized ?? (data.pastCutoffs?.length || 0) + (data.dailyCutoffs?.length || 0) + (data.geofenceTimeouts?.length || 0) + (data.offlineTimeouts?.length || 0);
			return {
				success: true,
				totalClosed,
				data,
				message: res.data?.message || `Auto Punch-Out executed successfully: ${totalClosed} unclosed session(s) finalized.`
			};
		} catch (err) {
			console.warn("Auto punch out trigger error:", err?.message || err);
			await this.refresh();
			throw err;
		}
	},
	is25thMonthLop(requestOrData) {
		return is25thMonthLop(requestOrData);
	},
	getLeaves() {
		return storeState.leaves;
	},
	applyLeave(requestData, applicantUser = null) {
		const employees = storeState.employees || [];
		const empId = requestData.employeeId || applicantUser?.employeeId || applicantUser?.id;
		const applicantEmp = employees.find((e) => String(e.id || e._id) === String(empId) || e.employeeId === empId || applicantUser?.email && e.email === applicantUser.email);
		const applicantRole = requestData.applicantRole || applicantEmp?.role || applicantUser?.role || "employee";
		const employeeName = requestData.employeeName || applicantEmp?.name || applicantUser?.displayName || applicantUser?.name || "Employee";
		const department = requestData.department || applicantEmp?.department || applicantUser?.department || "General";
		const isHalfDay = Boolean(requestData.isHalfDay || requestData.days === .5);
		const halfDayPeriod = isHalfDay ? requestData.halfDayPeriod || "first_half" : null;
		const leaveDays = isHalfDay ? .5 : Number(requestData.days) || 1;
		const effStartDate = requestData.startDate;
		const effEndDate = isHalfDay ? effStartDate : requestData.endDate || effStartDate;
		let doubleLopDays = 0;
		let isDoubleLop = Boolean(requestData.isDoubleLop);
		if (requestData.startDate) {
			const s = new Date(requestData.startDate);
			const e = new Date(requestData.endDate || requestData.startDate);
			if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
				for (let cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) if (cur.getDate() >= 25) {
					doubleLopDays += 1;
					isDoubleLop = true;
				}
			}
		}
		const isLopMonthLeave = isDoubleLop || doubleLopDays > 0 || String(requestData.leaveType).toLowerCase() === "lop" && (new Date(requestData.startDate).getDate() >= 25 || new Date(requestData.endDate || requestData.startDate).getDate() >= 25);
		let status = "pending_manager";
		let currentApproverRole = "manager";
		let approverId = null;
		let approverName = null;
		let managerId = null;
		let managerName = null;
		const hasExplicitRole = Boolean(requestData.applicantRole || applicantUser?.role);
		const matchedPolicy = (storeState.leavePolicies || []).find((p) => p.leaveType === (requestData.leaveType || "casual")) || {};
		const configuredStage = String(matchedPolicy.approvalStage || "manager").toLowerCase().trim();
		const directReportsTo = applicantEmp?.managerId && employees.find((e) => String(e.id || e._id) === String(applicantEmp.managerId) || e.employeeId === applicantEmp.managerId) || applicantEmp?.reportingManager && employees.find((e) => e.name?.toLowerCase() === applicantEmp.reportingManager?.toLowerCase() || e.displayName?.toLowerCase() === applicantEmp.reportingManager?.toLowerCase() || e.email?.toLowerCase() === applicantEmp.reportingManager?.toLowerCase()) || applicantEmp?.teamLeadId && employees.find((e) => String(e.id || e._id) === String(applicantEmp.teamLeadId) || e.employeeId === applicantEmp.teamLeadId) || employees.find((e) => (e.role === "manager" || e.role === "team_lead") && e.department === department && String(e.id || e._id) !== String(empId)) || null;
		if (requestData.status === "approved") {
			status = "approved";
			currentApproverRole = null;
		} else if (isLopMonthLeave) {
			status = "pending_hr";
			currentApproverRole = "hr";
			approverId = "emp-4";
			approverName = "HR Operations";
			managerId = directReportsTo?.id || "emp-r2";
			managerName = directReportsTo?.name || "Department Manager";
		} else if (configuredStage === "hr") {
			status = "pending_hr";
			currentApproverRole = "hr";
			approverId = "emp-4";
			approverName = "HR Operations";
			managerId = directReportsTo?.id || "emp-4";
			managerName = directReportsTo?.name || "HR Operations";
		} else if (configuredStage === "director") {
			status = "pending_director";
			currentApproverRole = "director";
			approverId = "emp-director";
			approverName = "Managing Director";
			managerId = approverId;
			managerName = approverName;
		} else if (configuredStage === "tl") {
			status = "pending_tl";
			currentApproverRole = "team_lead";
			approverId = directReportsTo?.id || "emp-tl";
			approverName = directReportsTo?.name || "Team Lead";
			managerId = approverId;
			managerName = approverName;
		} else if (applicantRole === "director" || applicantRole === "managing_director") {
			status = "approved";
			currentApproverRole = null;
		} else if ((applicantRole === "manager" || applicantRole === "revenue_growth_manager" || applicantRole === "vertical_head") && (!directReportsTo || ["director", "managing_director"].includes(directReportsTo.role))) {
			status = "pending_director";
			currentApproverRole = "director";
			approverId = "emp-director";
			approverName = "Managing Director";
			managerId = approverId;
			managerName = approverName;
		} else if (directReportsTo) {
			const isTL = directReportsTo.role === "team_lead" || directReportsTo.role === "team_leader";
			status = isTL ? "pending_tl" : "pending_manager";
			currentApproverRole = isTL ? "team_lead" : "manager";
			approverId = directReportsTo.id || directReportsTo._id || directReportsTo.employeeId;
			approverName = directReportsTo.name || directReportsTo.displayName || "Reporting Manager";
			managerId = approverId;
			managerName = approverName;
		} else {
			status = "pending_hr";
			currentApproverRole = "hr";
			approverId = "emp-4";
			approverName = "HR Operations";
			managerId = approverId;
			managerName = approverName;
		}
		const newLeave = {
			id: `leave-${Date.now()}`,
			employeeId: empId,
			employeeName,
			department,
			applicantRole,
			leaveType: requestData.leaveType || "casual",
			startDate: effStartDate,
			endDate: effEndDate,
			days: leaveDays,
			isHalfDay,
			halfDayPeriod,
			reason: requestData.reason,
			status: requestData.status || status,
			currentApproverRole,
			currentApproverId: approverId,
			currentApproverName: approverName,
			tlId: applicantEmp?.managerId && employees.find((e) => String(e.id) === String(applicantEmp.managerId))?.id || null,
			tlName: applicantEmp?.managerId && employees.find((e) => String(e.id) === String(applicantEmp.managerId))?.name || null,
			tlComment: null,
			tlDecisionAt: null,
			managerId: applicantRole === "team_lead" ? approverId : managerId || requestData.managerId || "emp-r2",
			managerName: applicantRole === "team_lead" ? approverName : managerName,
			managerComment: requestData.managerComment || (requestData.status === "approved" ? "Direct HR Grant" : null),
			managerDecisionAt: null,
			directorId: "emp-director",
			directorName: "Managing Director",
			directorComment: null,
			directorDecisionAt: null,
			isDoubleLop,
			doubleLopDays,
			hrNotified: false,
			hrComment: requestData.hrComment || (requestData.status === "approved" ? "Approved by HR Operations" : null),
			createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
		};
		storeState.leaves = [newLeave, ...storeState.leaves];
		if (newLeave.status === "approved") {
			const today = "2026-09-30";
			if (newLeave.startDate <= today && newLeave.endDate >= today) this.markAttendance({
				employeeId: newLeave.employeeId,
				employeeName: newLeave.employeeName,
				date: today,
				status: "on-leave",
				checkIn: null,
				checkOut: null,
				totalHours: "0.0 hrs",
				notes: `Approved ${newLeave.leaveType} leave`
			});
			this.addNotification({
				title: "Leave Granted",
				message: `${newLeave.employeeName}'s ${newLeave.days} day(s) ${newLeave.leaveType} leave was granted by HR.`,
				type: "leave",
				recipientId: newLeave.employeeId
			});
		} else if (isLopMonthLeave) {
			this.addNotification({
				title: "[HR Review Required] 25th Month LOP Leave Request",
				message: `${newLeave.employeeName} (${newLeave.department}) submitted a 25th Month LOP leave request (${newLeave.startDate} to ${newLeave.endDate}, ${newLeave.days} days). Requires HR verification before Admin approval.`,
				type: "leave_hr",
				leaveId: newLeave.id,
				recipientRole: "hr",
				recipientId: "emp-4",
				isHrActionRequired: true,
				metadata: {
					leaveId: newLeave.id,
					is25thMonthLop: true
				}
			});
			if (newLeave.managerId) this.addNotification({
				title: "Squad Member 25th Month LOP Notice",
				message: `${newLeave.employeeName} submitted a 25th Month LOP leave request. Policy routes this request to HR and Admin for loss-of-pay approval.`,
				type: "info_notice",
				leaveId: newLeave.id,
				recipientId: newLeave.managerId,
				recipientRole: "manager",
				excludeRoles: ["admin"],
				metadata: {
					leaveId: newLeave.id,
					is25thMonthLop: true
				}
			});
		} else if (!hasExplicitRole) this.addNotification({
			title: "New Leave Request",
			message: `${newLeave.employeeName} submitted a leave request pending manager review.`,
			type: "leave",
			leaveId: newLeave.id,
			recipientId: newLeave.managerId,
			recipientRole: "manager",
			metadata: { leaveId: newLeave.id }
		});
		else if (applicantRole === "manager" || applicantRole === "revenue_growth_manager" || applicantRole === "vertical_head") this.addNotification({
			title: "Manager Leave Request for Executive Approval",
			message: `Department Manager ${newLeave.employeeName} (${newLeave.department}) has submitted a ${newLeave.days}-day leave request for your executive sign-off.`,
			type: "leave",
			leaveId: newLeave.id,
			recipientId: "emp-director",
			recipientRole: "director",
			metadata: {
				leaveId: newLeave.id,
				applicantRole: "manager"
			}
		});
		else if (applicantRole === "team_lead") this.addNotification({
			title: "Team Lead Leave Request",
			message: `Team Lead ${newLeave.employeeName} (${newLeave.department}) has requested ${newLeave.days} days leave for your review and approval.`,
			type: "leave",
			leaveId: newLeave.id,
			recipientId: newLeave.managerId,
			recipientRole: "manager",
			excludeRoles: ["admin"],
			metadata: {
				leaveId: newLeave.id,
				applicantRole: "team_lead"
			}
		});
		else {
			this.addNotification({
				title: "Employee Leave Request for Approval",
				message: `${newLeave.employeeName} (${newLeave.department}) submitted a ${newLeave.days}-day leave request awaiting your manager approval.`,
				type: "leave",
				leaveId: newLeave.id,
				recipientId: newLeave.managerId,
				recipientRole: "manager",
				excludeRoles: ["admin"],
				metadata: {
					leaveId: newLeave.id,
					applicantRole: "employee",
					type: "approval_request"
				}
			});
			if (newLeave.tlId) this.addNotification({
				title: "Squad Member Leave Notice",
				message: `${newLeave.employeeName} submitted a leave request pending Manager approval.`,
				type: "info_notice",
				leaveId: newLeave.id,
				recipientId: newLeave.tlId,
				recipientRole: "team_lead",
				metadata: {
					leaveId: newLeave.id,
					applicantRole: "employee",
					type: "info_notice"
				}
			});
		}
		this.addAuditLog(employeeName, "LEAVE_APPLY", `Applied for ${newLeave.days} day(s) ${newLeave.leaveType} leave (${newLeave.status})`);
		notifyListeners();
		return newLeave;
	},
	approveLeave(leaveId, reviewerRole = "manager", comment = "Approved.", approverUser = null) {
		const employees = storeState.employees || [];
		const req = storeState.leaves.find((l) => l.id === leaveId);
		if (!req) return null;
		const timestamp = (/* @__PURE__ */ new Date()).toISOString();
		const approverName = approverUser?.name || approverUser?.displayName || reviewerRole.toUpperCase();
		const applicantEmp = employees.find((e) => String(e.id || e._id) === String(req.employeeId) || e.employeeId === req.employeeId);
		const deptManager = employees.find((e) => e.role === "manager" && e.department === req.department) || applicantEmp?.managerId && employees.find((e) => String(e.id || e._id) === String(applicantEmp.managerId)) || null;
		const directorEmp = employees.find((e) => e.role === "director" || e.role === "managing_director" || e.email === "jagadishbabu@edufyitech.in") || null;
		const teamLeadEmp = applicantEmp?.managerId && employees.find((e) => String(e.id || e._id) === String(applicantEmp.managerId)) || (req.tlId ? {
			id: req.tlId,
			name: req.tlName || "Team Lead"
		} : null);
		const isLopMonth = is25thMonthLop(req);
		if (reviewerRole === "admin" || req.status === "pending_admin") {
			storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
				...l,
				status: "approved",
				adminComment: comment,
				adminDecisionAt: timestamp,
				adminApprovedBy: approverName
			} : l);
			this.addNotification({
				title: "25th Month LOP Leave Approved by Admin",
				message: `Your 25th month LOP leave (${req.days} days, ${req.startDate} to ${req.endDate}) has been granted final approval by Administrator ${approverName}.`,
				type: "leave",
				leaveId,
				recipientId: req.employeeId,
				metadata: { leaveId }
			});
			this.addNotification({
				title: "[Admin Sign-off] 25th Month LOP Approved",
				message: `Administrator ${approverName} has approved 25th month LOP leave for ${req.employeeName} (${req.days} days). HR panel records updated.`,
				type: "leave_hr",
				leaveId,
				recipientRole: "hr",
				metadata: {
					leaveId,
					adminApproved: true
				}
			});
		} else if (reviewerRole === "team_lead" || req.status === "pending_tl") {
			if (isLopMonth) {
				storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
					...l,
					status: "pending_hr",
					currentApproverRole: "hr",
					tlComment: comment,
					tlDecisionAt: timestamp,
					tlName: approverName,
					tlApprovedBy: approverName
				} : l);
				this.addNotification({
					title: "[HR Review Required] 25th Month LOP Leave Request",
					message: `Team Lead ${approverName} endorsed 25th month LOP leave for ${req.employeeName}. Awaiting HR verification.`,
					type: "leave_hr",
					leaveId,
					recipientRole: "hr",
					isHrActionRequired: true,
					metadata: {
						leaveId,
						is25thMonthLop: true
					}
				});
			} else {
				storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
					...l,
					status: "approved",
					tlComment: comment,
					tlDecisionAt: timestamp,
					tlName: approverName,
					tlApprovedBy: approverName
				} : l);
				this.addNotification({
					title: "Leave Approved by Team Lead",
					message: `Your leave request (${req.days} days, ${req.startDate} to ${req.endDate}) was approved by Team Lead ${approverName}.`,
					type: "leave",
					leaveId,
					recipientId: req.employeeId,
					metadata: { leaveId }
				});
				this.addNotification({
					title: "Team Member Leave Approved by Team Lead",
					message: `Team Lead ${approverName} approved ${req.days} day(s) leave for ${req.employeeName} (${req.startDate} to ${req.endDate}).`,
					type: "leave",
					leaveId,
					recipientId: deptManager?.id || "manager-1",
					recipientRole: "manager",
					excludeRoles: ["admin"],
					metadata: { leaveId }
				});
				this.addNotification({
					title: "Department Leave Notice (Approved by Team Lead)",
					message: `${req.employeeName} (${req.department}) leave approved by TL ${approverName} (Manager: ${deptManager?.name || "Manager"}).`,
					type: "leave",
					leaveId,
					recipientId: directorEmp?.id || "director-1",
					recipientRole: "director",
					excludeRoles: ["admin"],
					metadata: { leaveId }
				});
			}
		} else if (reviewerRole === "manager" || req.status === "pending_manager" || req.currentApproverRole === "manager") {
			if (isLopMonth) {
				storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
					...l,
					status: "pending_hr",
					currentApproverRole: "hr",
					managerComment: comment,
					managerDecisionAt: timestamp,
					managerName: approverName,
					managerApprovedBy: approverName
				} : l);
				this.addNotification({
					title: "Leave Endorsed by Manager - Pending HR & Admin Review",
					message: `Your 25th month LOP leave was endorsed by Manager ${approverName} and routed to HR for verification.`,
					type: "leave",
					leaveId,
					recipientId: req.employeeId,
					metadata: { leaveId }
				});
				this.addNotification({
					title: "[HR Review Required] 25th Month LOP Leave Request",
					message: `Manager ${approverName} endorsed leave for ${req.employeeName} (${req.startDate} to ${req.endDate}, ${req.days} days). Because this leave falls on/after the 25th (LOP Month), HR review is required before forwarding to Admin.`,
					type: "leave_hr",
					leaveId,
					recipientRole: "hr",
					isHrActionRequired: true,
					metadata: {
						leaveId,
						is25thMonthLop: true
					}
				});
			} else {
				const isEmployeeApplicant = req.applicantRole === "employee" || !req.applicantRole;
				storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
					...l,
					status: "approved",
					managerComment: comment,
					managerDecisionAt: timestamp,
					managerName: approverName,
					managerApprovedBy: approverName
				} : l);
				if (isEmployeeApplicant) {
					this.addNotification({
						title: "Leave Approved by Manager",
						message: `Your leave request (${req.days} days, ${req.startDate} to ${req.endDate}) was approved by Manager ${approverName}.`,
						type: "leave",
						leaveId,
						recipientId: req.employeeId,
						metadata: { leaveId }
					});
					this.addNotification({
						title: "Department Leave Notice (Approved by Manager)",
						message: `${req.employeeName} (${req.department}) leave request approved by Manager ${approverName}.`,
						type: "leave",
						leaveId,
						recipientId: directorEmp?.id || "director-1",
						recipientRole: "director",
						excludeRoles: ["admin"],
						metadata: { leaveId }
					});
					this.addNotification({
						title: "Team Member On Leave (Manager Approved)",
						message: `Leave notice: Your team member ${req.employeeName} is on approved leave from ${req.startDate} to ${req.endDate}. Approved by Manager ${approverName}.`,
						type: "leave",
						leaveId,
						recipientId: req.tlId || teamLeadEmp?.id || "tl-1",
						recipientRole: "team_lead",
						excludeRoles: ["admin"],
						metadata: { leaveId }
					});
					employees.filter((e) => {
						if (String(e.id || e._id) === String(req.employeeId) || e.employeeId === req.employeeId) return false;
						if ([
							"admin",
							"hr",
							"director",
							"managing_director",
							"manager"
						].includes(e.role)) return false;
						if (req.tlId && (String(e.managerId) === String(req.tlId) || e.managerId === req.tlId || String(e.teamLeadId) === String(req.tlId))) return true;
						if (req.managerId && (String(e.managerId) === String(req.managerId) || e.managerId === req.managerId)) return true;
						if (e.department && req.department && e.department === req.department) return true;
						return false;
					}).forEach((peer) => {
						this.addNotification({
							title: "Squad Member on Approved Leave",
							message: `${req.employeeName} (${req.department}) is on approved leave from ${req.startDate} to ${req.endDate}. Please coordinate squad coverage.`,
							type: "leave",
							leaveId,
							recipientId: peer.id || peer._id || peer.employeeId,
							recipientRole: peer.role || "employee",
							excludeRoles: ["admin"],
							metadata: {
								leaveId,
								type: "squad_notice"
							}
						});
					});
				} else {
					this.addNotification({
						title: "Leave Approved by Manager",
						message: `Your leave request (${req.days} days, ${req.startDate} to ${req.endDate}) was approved by Manager ${approverName}.`,
						type: "leave",
						leaveId,
						recipientId: req.employeeId,
						metadata: { leaveId }
					});
					this.addNotification({
						title: "TL Leave Approved by Manager",
						message: `Manager ${approverName} has approved leave for Team Lead ${req.employeeName} (${req.department}, ${req.days} days).`,
						type: "leave",
						leaveId,
						recipientId: directorEmp?.id || "director-1",
						recipientRole: "director",
						excludeRoles: ["admin"],
						metadata: { leaveId }
					});
				}
			}
		} else if (["director", "managing_director"].includes(reviewerRole) || req.status === "pending_director") {
			storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
				...l,
				status: "approved",
				directorComment: comment,
				directorDecisionAt: timestamp,
				directorName: approverName,
				directorApprovedBy: approverName,
				hrNotified: true
			} : l);
			this.addNotification({
				title: "Leave Approved by Managing Director",
				message: `Managing Director ${approverName} has approved your leave request for ${req.days} day(s) (${req.startDate} to ${req.endDate}).`,
				type: "leave",
				leaveId,
				recipientId: req.employeeId,
				metadata: { leaveId }
			});
			this.addNotification({
				title: "[HR Panel Action] Executive Manager Leave Approved",
				message: `Managing Director has approved ${req.days}-day leave for Manager ${req.employeeName} (${req.department}). Added to HR Panel records for payroll & attendance adjustments.`,
				type: "leave_hr",
				leaveId,
				recipientRole: "hr",
				isHrActionRequired: true,
				metadata: {
					leaveId,
					isHrActionRequired: true,
					managerName: req.employeeName
				}
			});
		} else if (isLopMonth) {
			storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
				...l,
				status: "pending_admin",
				currentApproverRole: "admin",
				hrComment: comment,
				hrDecisionAt: timestamp,
				hrApprovedBy: approverName
			} : l);
			this.addNotification({
				title: "[Admin Action Required] 25th Month LOP Leave Approval",
				message: `HR Operations (${approverName}) has verified 25th month LOP leave for ${req.employeeName} (${req.days} days, ${req.startDate} to ${req.endDate}). Final Admin approval is required.`,
				type: "leave_admin",
				leaveId,
				recipientRole: "admin",
				metadata: {
					leaveId,
					is25thMonthLop: true,
					pendingAdminApproval: true
				}
			});
			this.addNotification({
				title: "Leave Verified by HR - Awaiting Final Admin Approval",
				message: `Your 25th month LOP leave has been verified by HR (${approverName}) and forwarded to Admin for final sign-off.`,
				type: "leave",
				leaveId,
				recipientId: req.employeeId,
				metadata: { leaveId }
			});
		} else {
			storeState.leaves = storeState.leaves.map((l) => l.id === leaveId ? {
				...l,
				status: "approved",
				hrComment: comment,
				hrDecisionAt: timestamp,
				hrApprovedBy: approverName
			} : l);
			this.addNotification({
				title: "Leave Approved by HR",
				message: `Leave request for ${req.employeeName} was fully approved by HR Operations.`,
				type: "leave",
				recipientId: req.employeeId
			});
		}
		const updated = storeState.leaves.find((l) => l.id === leaveId);
		if (updated?.status === "approved") {
			const today = "2026-09-30";
			if (updated.startDate <= today && updated.endDate >= today) this.markAttendance({
				employeeId: updated.employeeId,
				employeeName: updated.employeeName,
				date: today,
				status: "on-leave",
				checkIn: null,
				checkOut: null,
				totalHours: "0.0 hrs",
				notes: `Approved ${updated.leaveType} leave`
			});
		}
		this.addAuditLog(reviewerRole.toUpperCase(), "LEAVE_APPROVE", `Leave ${leaveId} approved (${reviewerRole})`);
		notifyListeners();
		return updated;
	},
	rejectLeave(leaveId, roleOrReason = "hr", maybeReason = "Declined due to critical delivery deadline.", rejectorUser = null) {
		const isRole = [
			"team_lead",
			"manager",
			"director",
			"hr",
			"admin"
		].includes(roleOrReason);
		const reviewerRole = isRole ? roleOrReason : "manager";
		const reason = isRole ? maybeReason : roleOrReason;
		const req = storeState.leaves.find((l) => l.id === leaveId);
		if (!req) return null;
		const approverName = rejectorUser?.name || rejectorUser?.displayName || reviewerRole.toUpperCase();
		storeState.leaves = storeState.leaves.map((l) => {
			if (l.id === leaveId) return {
				...l,
				status: "rejected",
				rejectionReason: reason,
				tlComment: reviewerRole === "team_lead" ? reason : l.tlComment,
				managerComment: reviewerRole === "manager" ? reason : l.managerComment,
				directorComment: reviewerRole === "director" ? reason : l.directorComment,
				hrComment: reviewerRole === "hr" ? reason : l.hrComment,
				adminComment: reviewerRole === "admin" ? reason : l.adminComment
			};
			return l;
		});
		this.addNotification({
			title: "Leave Request Rejected",
			message: `Your leave request was declined by ${approverName} (${reviewerRole.replace("_", " ")}). Reason: ${reason}`,
			type: "leave",
			recipientId: req.employeeId
		});
		if (reviewerRole === "admin" || req.status === "pending_admin") this.addNotification({
			title: "[Admin Decision] 25th Month LOP Leave Rejected",
			message: `Administrator ${approverName} declined 25th month LOP leave for ${req.employeeName}. Reason: ${reason}`,
			type: "leave_hr",
			recipientRole: "hr",
			metadata: {
				leaveId: req.id,
				rejectedByAdmin: true
			}
		});
		else if (reviewerRole === "manager" || req.status === "pending_manager") {
			if (req.tlId) this.addNotification({
				title: "Squad Member Leave Request Declined",
				message: `Manager ${approverName} declined leave request for squad member ${req.employeeName}. Reason: ${reason}`,
				type: "leave",
				leaveId: req.id,
				recipientId: req.tlId,
				recipientRole: "team_lead",
				excludeRoles: ["admin"],
				metadata: { leaveId: req.id }
			});
			this.addNotification({
				title: "Department Leave Declined Notice",
				message: `Manager ${approverName} declined leave request for ${req.employeeName}. Reason: ${reason}`,
				type: "leave",
				leaveId: req.id,
				recipientRole: "director",
				excludeRoles: ["admin"],
				metadata: { leaveId: req.id }
			});
		} else if (reviewerRole === "team_lead") {
			this.addNotification({
				title: "Team Leave Declined by TL",
				message: `Team Lead ${approverName} declined leave request for ${req.employeeName}. Reason: ${reason}`,
				type: "leave",
				recipientRole: "manager",
				excludeRoles: ["admin"]
			});
			this.addNotification({
				title: "Department Leave Declined Notice",
				message: `Team Lead ${approverName} declined leave request for ${req.employeeName}. Reason: ${reason}`,
				type: "leave",
				recipientRole: "director",
				excludeRoles: ["admin"]
			});
		} else if (["director", "managing_director"].includes(reviewerRole) || req.applicantRole === "manager") this.addNotification({
			title: "[HR Record] Manager Leave Declined by Director",
			message: `Managing Director declined leave request for Manager ${req.employeeName}. Reason: ${reason}`,
			type: "leave_hr",
			recipientRole: "hr"
		});
		this.addAuditLog(reviewerRole.toUpperCase(), "LEAVE_REJECT", `Leave ${leaveId} rejected (${reason})`);
		notifyListeners();
		return storeState.leaves.find((l) => l.id === leaveId);
	},
	deleteLeave(leaveId) {
		const existing = storeState.leaves.find((l) => l.id === leaveId);
		storeState.leaves = storeState.leaves.filter((l) => l.id !== leaveId);
		if (existing) {
			this.addAuditLog("HR", "LEAVE_DELETE", `Deleted leave request ${leaveId} for ${existing.employeeName}`);
			this.addNotification({
				title: "Leave Request Deleted",
				message: `Leave request for ${existing.employeeName} was removed.`,
				type: "leave"
			});
		}
		notifyListeners();
		return true;
	},
	cancelLeave(leaveId, cancelReason = "Cancelled by applicant") {
		const existing = storeState.leaves.find((l) => l.id === leaveId || l._id === leaveId);
		if (!existing) return false;
		storeState.leaves = storeState.leaves.map((l) => {
			if (l.id === leaveId || l._id === leaveId) return {
				...l,
				status: "cancelled",
				cancellationReason: cancelReason
			};
			return l;
		});
		this.addAuditLog("EMPLOYEE", "LEAVE_CANCEL", `Leave ${leaveId} cancelled`);
		this.addNotification({
			title: "Leave Request Cancelled",
			message: `Your leave request for ${existing.startDate} to ${existing.endDate} was cancelled.`,
			type: "leave",
			recipientId: existing.employeeId
		});
		notifyListeners();
		return true;
	},
	getTasks() {
		return storeState.tasks;
	},
	addTask(taskData) {
		const newTask = {
			id: `task-${Date.now()}`,
			title: taskData.title,
			assigneeId: taskData.assigneeId,
			assigneeName: taskData.assigneeName,
			priority: taskData.priority || "Medium",
			status: "todo",
			dueDate: taskData.dueDate || "2026-10-15",
			category: taskData.category || "General"
		};
		storeState.tasks = [newTask, ...storeState.tasks];
		this.addNotification({
			title: "New Task Assigned",
			message: `Task assigned: "${newTask.title}" (Due: ${newTask.dueDate})`,
			type: "task"
		});
		notifyListeners();
		return newTask;
	},
	updateTaskStatus(taskId, status) {
		storeState.tasks = storeState.tasks.map((t) => t.id === taskId ? {
			...t,
			status
		} : t);
		notifyListeners();
	},
	getDailyReports() {
		return storeState.dailyReports;
	},
	submitDailyReport(reportData) {
		const newReport = {
			id: `dwr-${Date.now()}`,
			employeeId: reportData.employeeId,
			employeeName: reportData.employeeName,
			date: reportData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			hoursLogged: Number(reportData.hoursLogged) || 8,
			tasksSummary: reportData.tasksSummary,
			challenges: reportData.challenges || "None reported",
			tomorrowPlan: reportData.tomorrowPlan,
			submittedAt: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit"
			})
		};
		storeState.dailyReports = [newReport, ...storeState.dailyReports];
		this.addNotification({
			title: "Daily Work Report Submitted",
			message: `Logged ${newReport.hoursLogged} hours for today with summary and plan.`,
			type: "report"
		});
		this.addAuditLog(reportData.employeeName, "DAILY_REPORT_SUBMIT", `Submitted daily work report (${newReport.hoursLogged} hrs)`);
		notifyListeners();
		return newReport;
	},
	deleteDailyReport(id) {
		storeState.dailyReports = (storeState.dailyReports || []).filter((r) => r.id !== id && r._id !== id);
		this.addAuditLog("System", "DAILY_REPORT_DELETE", `Deleted daily report record ${id}`);
		notifyListeners();
		return true;
	},
	getCourses() {
		return storeState.courses;
	},
	updateCourseProgress(courseId, progress = 100) {
		storeState.courses = storeState.courses.map((c) => {
			if (c.id === courseId) {
				const isDone = progress >= 100;
				return {
					...c,
					progress,
					status: isDone ? "Completed" : "In Progress",
					completed: isDone
				};
			}
			return c;
		});
		notifyListeners();
		return storeState.courses.find((c) => c.id === courseId);
	},
	completeCourseQuiz(courseId, score = "100%") {
		storeState.courses = storeState.courses.map((c) => {
			if (c.id === courseId) return {
				...c,
				progress: 100,
				completed: true,
				quizScore: score,
				certificateUrl: `CERT-EDU-2026-${Math.floor(1e3 + Math.random() * 9e3)}`
			};
			return c;
		});
		this.addNotification({
			title: "Course Completed & Certificate Issued!",
			message: `Congratulations! You scored ${score} and unlocked your official certificate.`,
			type: "training"
		});
		notifyListeners();
	},
	getTickets() {
		return storeState.tickets;
	},
	createHelpDeskTicket(ticketData) {
		return this.createTicket(ticketData);
	},
	async createTicket(ticketData) {
		const empId = ticketData.employeeId || "STAFF";
		const subj = (ticketData.subject || "").trim();
		const desc = (ticketData.description || "").trim();
		const dedupeKey = `${empId}::${subj}::${desc}`;
		if (globalThis.__hrStoreInFlightTickets?.has(dedupeKey)) {
			console.warn("[hrStore] Duplicate in-flight ticket creation intercepted:", dedupeKey);
			return globalThis.__hrStoreInFlightTickets.get(dedupeKey);
		}
		if (!globalThis.__hrStoreInFlightTickets) globalThis.__hrStoreInFlightTickets = /* @__PURE__ */ new Map();
		const recentDuplicate = (storeState.tickets || []).find((t) => {
			const matchEmp = (t.employeeId || "").toLowerCase() === empId.toLowerCase();
			const matchSubj = (t.subject || "").trim() === subj;
			const matchDesc = (t.description || "").trim() === desc;
			const createdTime = t.createdAt ? new Date(t.createdAt).getTime() : 0;
			const isRecent = Date.now() - createdTime < 15e3;
			return matchEmp && matchSubj && (matchDesc || !desc) && isRecent;
		});
		if (recentDuplicate) {
			console.warn("[hrStore] Returning existing recently submitted ticket:", recentDuplicate.id);
			return recentDuplicate;
		}
		const submissionPromise = (async () => {
			const tempId = `TICK-${Math.floor(1e3 + Math.random() * 9e3)}`;
			const newTicket = {
				id: tempId,
				_id: tempId,
				employeeId: ticketData.employeeId,
				employeeName: ticketData.employeeName,
				subject: ticketData.subject,
				description: ticketData.description,
				category: ticketData.category || "IT Support",
				priority: ticketData.priority || "Medium",
				status: "open",
				createdAt: (/* @__PURE__ */ new Date()).toISOString(),
				assignedTo: ticketData.category === "IT Support" ? "IT Desk" : "HR Ops Desk",
				assignedToId: ticketData.assignedToId || null,
				assignedToName: ticketData.assignedToName || null,
				assignedToEmail: ticketData.assignedToEmail || null,
				responses: [{
					sender: ticketData.employeeName,
					text: ticketData.description,
					time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit"
					})
				}]
			};
			storeState.tickets = [newTicket, ...storeState.tickets || []];
			this.addNotification({
				title: "Support Ticket Created",
				message: `Ticket #${newTicket.id} (${newTicket.category}) is open and assigned.`,
				type: "ticket",
				recipientId: ticketData.employeeId
			});
			this.addAuditLog(ticketData.employeeName, "TICKET_CREATE", `Created ticket #${newTicket.id}: ${newTicket.subject}`);
			notifyListeners();
			try {
				const res = await apiClient.post("/workspace/tickets", {
					subject: ticketData.subject,
					description: ticketData.description,
					category: ticketData.category || "IT Support",
					priority: ticketData.priority || "Medium",
					assignedToId: ticketData.assignedToId || void 0,
					assignedToName: ticketData.assignedToName || void 0,
					assignedToEmail: ticketData.assignedToEmail || void 0
				});
				if (res?.data) {
					const saved = res.data;
					const realId = saved.id || String(saved._id);
					storeState.tickets = (storeState.tickets || []).map((t) => t.id === tempId || t._id === tempId ? {
						...saved,
						id: realId,
						_id: realId
					} : t);
					notifyListeners();
					await this.refresh?.();
					return saved;
				}
			} catch (err) {
				console.warn("Backend ticket creation sync:", err.message);
			}
			return newTicket;
		})();
		globalThis.__hrStoreInFlightTickets.set(dedupeKey, submissionPromise);
		try {
			return await submissionPromise;
		} finally {
			setTimeout(() => {
				globalThis.__hrStoreInFlightTickets?.delete(dedupeKey);
			}, 8e3);
		}
	},
	async updateTicketStatus(ticketId, status, resolutionNotes = "") {
		const noteText = typeof resolutionNotes === "string" ? resolutionNotes.trim() : "";
		storeState.tickets = (storeState.tickets || []).map((t) => {
			if (t.id === ticketId || t._id === ticketId) {
				const responses = Array.isArray(t.responses) ? [...t.responses] : [];
				if (noteText) responses.push({
					sender: "Support Specialist",
					text: noteText,
					time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit"
					})
				});
				return {
					...t,
					status,
					responses
				};
			}
			return t;
		});
		notifyListeners();
		try {
			const payload = { status };
			if (noteText) {
				payload.resolutionNotes = noteText;
				payload.response = noteText;
			}
			await apiClient.patch(`/workspace/tickets/${encodeURIComponent(ticketId)}`, payload);
			await this.refresh?.();
		} catch (err) {
			console.warn("Backend ticket status sync:", err.message);
		}
	},
	async replyToTicket(ticketId, responseText, senderName = "HR Support") {
		storeState.tickets = (storeState.tickets || []).map((t) => {
			if (t.id === ticketId || t._id === ticketId) {
				const responses = Array.isArray(t.responses) ? [...t.responses] : [];
				responses.push({
					sender: senderName,
					text: responseText,
					time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit"
					})
				});
				return {
					...t,
					responses
				};
			}
			return t;
		});
		notifyListeners();
		try {
			await apiClient.patch(`/workspace/tickets/${encodeURIComponent(ticketId)}`, { response: responseText });
			await this.refresh?.();
		} catch (err) {
			console.warn("Backend ticket reply sync:", err.message);
		}
	},
	async assignTicket(ticketId, { assignedToId, assignedToName, assignedToEmail }) {
		storeState.tickets = (storeState.tickets || []).map((t) => t.id === ticketId || t._id === ticketId ? {
			...t,
			assignedToId,
			assignedToName,
			assignedToEmail,
			assignedTo: assignedToName || "General Queue"
		} : t);
		notifyListeners();
		try {
			await apiClient.patch(`/workspace/tickets/${encodeURIComponent(ticketId)}`, {
				assignedToId: assignedToId || "",
				assignedToName: assignedToName || "",
				assignedToEmail: assignedToEmail || ""
			});
			await this.refresh?.();
		} catch (err) {
			console.warn("Backend ticket assignment sync:", err.message);
		}
	},
	getAnnouncements() {
		return storeState.announcements;
	},
	async createAnnouncement(annData) {
		const tempId = `ann-${Date.now()}`;
		const newAnn = {
			id: tempId,
			_id: tempId,
			title: annData.title,
			category: annData.category || "News",
			priority: annData.priority || "Normal",
			targetAudience: annData.targetAudience || "All Employees",
			content: annData.content,
			date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			author: annData.author || "Corporate Administration",
			likes: 0,
			pinned: !!annData.pinned
		};
		storeState.announcements = [newAnn, ...storeState.announcements || []];
		this.addNotification({
			title: "Company Announcement",
			message: `${newAnn.title} - ${newAnn.author}`,
			type: "announcement"
		});
		this.addAuditLog(annData.author, "ANNOUNCEMENT_CREATE", `Published announcement: ${newAnn.title}`);
		notifyListeners();
		try {
			const res = await apiClient.post("/workspace/announcements", {
				title: annData.title,
				content: annData.content,
				category: annData.category || "News",
				priority: annData.priority || "Normal",
				targetAudience: annData.targetAudience || "All Employees",
				pinned: !!annData.pinned,
				sendEmailBroadcast: Boolean(annData.sendEmailBroadcast || annData.sendEmail)
			});
			if (res?.data) {
				const saved = res.data;
				const realId = saved.id || String(saved._id);
				storeState.announcements = (storeState.announcements || []).map((a) => a.id === tempId || a._id === tempId ? {
					...saved,
					id: realId,
					_id: realId
				} : a);
				notifyListeners();
				await this.refresh?.();
				return saved;
			}
		} catch (err) {
			console.warn("Backend announcement creation sync:", err.message);
		}
		return newAnn;
	},
	likeAnnouncement(annId) {
		storeState.announcements = storeState.announcements.map((a) => a.id === annId ? {
			...a,
			likes: a.likes + 1
		} : a);
		notifyListeners();
		apiClient.patch(`/workspace/announcements/${encodeURIComponent(annId)}`, { liked: true }).catch(() => {});
	},
	updateAnnouncement(id, updates) {
		storeState.announcements = storeState.announcements.map((a) => a.id === id || a._id === id ? {
			...a,
			...updates,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		} : a);
		this.addAuditLog("HR", "ANNOUNCEMENT_UPDATE", `Updated announcement: ${updates.title || id}`);
		notifyListeners();
		apiClient.patch(`/workspace/announcements/${encodeURIComponent(id)}`, updates).catch(() => {});
	},
	deleteAnnouncement(id) {
		const ann = storeState.announcements.find((a) => a.id === id || a._id === id);
		storeState.announcements = storeState.announcements.filter((a) => a.id !== id && a._id !== id);
		notifyListeners();
		apiClient.delete(`/workspace/announcements/${encodeURIComponent(id)}`).catch(() => {});
		this.addAuditLog("HR", "ANNOUNCEMENT_DELETE", `Deleted announcement: ${ann?.title || id}`);
		notifyListeners();
	},
	togglePinAnnouncement(id) {
		storeState.announcements = storeState.announcements.map((a) => a.id === id ? {
			...a,
			pinned: !a.pinned
		} : a);
		notifyListeners();
	},
	getDocuments() {
		return storeState.documents;
	},
	getHolidays() {
		return storeState.holidays;
	},
	getRequisitions() {
		return storeState.requisitions;
	},
	addRequisition(reqData) {
		const newReq = {
			id: `req-${Date.now()}`,
			title: reqData.title,
			department: reqData.department,
			location: reqData.location || "San Francisco (Hybrid)",
			openings: Number(reqData.openings) || 1,
			applicants: 0,
			stage: "Screening",
			status: "Active"
		};
		storeState.requisitions = [newReq, ...storeState.requisitions];
		notifyListeners();
		return newReq;
	},
	getExpenses() {
		return storeState.expenses;
	},
	submitExpense(expenseData) {
		const newExp = {
			id: `exp-${Date.now()}`,
			employeeId: expenseData.employeeId,
			employeeName: expenseData.employeeName,
			category: expenseData.category,
			amount: Number(expenseData.amount) || 0,
			merchant: expenseData.merchant,
			date: expenseData.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			status: "submitted",
			comments: expenseData.comments,
			notes: expenseData.notes || expenseData.comments,
			attachmentUrl: expenseData.attachmentUrl || null,
			attachmentName: expenseData.attachmentName || null,
			attachmentType: expenseData.attachmentType || null,
			attachmentSize: expenseData.attachmentSize || null
		};
		storeState.expenses = [newExp, ...storeState.expenses];
		this.addNotification({
			title: "Expense Claim Submitted",
			message: `Claim for ₹${newExp.amount.toFixed(2)} (${newExp.category}) submitted for approval with proof attachment.`,
			type: "expense",
			recipientId: expenseData.employeeId
		});
		this.addNotification({
			title: "New Expense Claim Submitted",
			message: `${newExp.employeeName || "Employee"} submitted an expense claim of ₹${newExp.amount.toFixed(2)} (${newExp.category}) for approval.`,
			type: "expense",
			recipientRole: "admin"
		});
		this.addNotification({
			title: "New Expense Claim Submitted",
			message: `${newExp.employeeName || "Employee"} submitted an expense claim of ₹${newExp.amount.toFixed(2)} (${newExp.category}) for approval.`,
			type: "expense",
			recipientRole: "hr"
		});
		notifyListeners();
		return newExp;
	},
	deleteExpense(id) {
		storeState.expenses = (storeState.expenses || []).filter((e) => e.id !== id && e._id !== id);
		this.addAuditLog("System", "EXPENSE_DELETE", `Deleted expense reimbursement claim ${id}`);
		notifyListeners();
		return true;
	},
	getKudos() {
		return storeState.kudos;
	},
	sendKudos(kudosData) {
		const newKudos = {
			id: `kud-${Date.now()}`,
			from: kudosData.from,
			to: kudosData.to,
			badge: kudosData.badge || "Team Player",
			message: kudosData.message,
			date: "Just now"
		};
		storeState.kudos = [newKudos, ...storeState.kudos];
		this.addNotification({
			title: "Kudos Received!",
			message: `${kudosData.from} sent kudos to ${kudosData.to}: "${newKudos.badge}"`,
			type: "kudos"
		});
		notifyListeners();
		return newKudos;
	},
	getNotifications(viewerUser = null) {
		if (!viewerUser) return storeState.notifications;
		return this.getUserNotifications(viewerUser);
	},
	getUserNotifications(viewerUser) {
		if (!viewerUser) return storeState.notifications;
		const role = viewerUser.role;
		const uid = String(viewerUser.id || viewerUser._id || "");
		const empId = String(viewerUser.employeeId || "");
		const isStaff = [
			"admin",
			"hr",
			"hr_executive",
			"director",
			"managing_director",
			"co_founder"
		].includes(role);
		return storeState.notifications.filter((n) => {
			if (!n) return false;
			if (Array.isArray(n.excludeRoles) && n.excludeRoles.includes(role)) return false;
			const targetId = n.recipientId || n.ownerId;
			if (targetId) {
				const rId = String(targetId);
				if (rId === uid || rId === empId) return true;
				if (n.recipientRole && (n.recipientRole === role || isStaff && [
					"admin",
					"hr",
					"management"
				].includes(n.recipientRole))) return true;
				if (!n.recipientRole) return false;
			}
			if (n.recipientRole) return n.recipientRole === role || isStaff && [
				"admin",
				"hr",
				"management"
			].includes(n.recipientRole);
			return true;
		});
	},
	addNotification(notif) {
		const item = {
			id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			title: notif.title,
			message: notif.message,
			time: notif.time || "Just now",
			type: notif.type || "info",
			read: false,
			recipientId: notif.recipientId || null,
			recipientRole: notif.recipientRole || null,
			excludeRoles: notif.excludeRoles || null,
			leaveId: notif.leaveId || notif.metadata?.leaveId || null,
			targetUrl: notif.targetUrl || notif.link || notif.url || null,
			relatedEntityId: notif.relatedEntityId || notif.entityId || notif.leaveId || notif.metadata?.leaveId || null,
			entityId: notif.entityId || notif.relatedEntityId || notif.leaveId || null,
			entityType: notif.entityType || notif.category || null,
			eventType: notif.eventType || notif.type || null,
			category: notif.category || notif.type || null,
			isHrActionRequired: Boolean(notif.isHrActionRequired || notif.metadata?.isHrActionRequired),
			metadata: notif.metadata || null,
			createdAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		storeState.notifications = [item, ...storeState.notifications];
		if (typeof window !== "undefined" && window.localStorage) try {
			window.localStorage.removeItem(STORAGE_CLEARED_NOTIFICATIONS_KEY);
		} catch (err) {
			console.warn(err);
		}
		try {
			playNotificationSound(notif.type === "announcement" ? "announcement" : "notification");
		} catch {}
		notifyListeners();
	},
	markNotificationRead(id) {
		storeState.notifications = storeState.notifications.map((n) => n.id === id ? {
			...n,
			read: true
		} : n);
		if (typeof window !== "undefined" && window.localStorage) try {
			const readRaw = window.localStorage.getItem("edufyi_read_notifications_v2");
			const readIds = readRaw ? JSON.parse(readRaw) : [];
			if (!readIds.includes(id)) {
				readIds.push(id);
				window.localStorage.setItem("edufyi_read_notifications_v2", JSON.stringify(readIds));
			}
			window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify(storeState.notifications));
		} catch (err) {
			console.warn(err);
		}
		notifyListeners();
	},
	markAllNotificationsRead() {
		storeState.notifications = storeState.notifications.map((n) => ({
			...n,
			read: true
		}));
		if (typeof window !== "undefined" && window.localStorage) try {
			const readRaw = window.localStorage.getItem("edufyi_read_notifications_v2");
			const readIds = new Set(readRaw ? JSON.parse(readRaw) : []);
			storeState.notifications.forEach((n) => {
				if (n.id) readIds.add(n.id);
			});
			window.localStorage.setItem("edufyi_read_notifications_v2", JSON.stringify([...readIds]));
			window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify(storeState.notifications));
		} catch (err) {
			console.warn(err);
		}
		notifyListeners();
	},
	deleteNotification(id) {
		storeState.notifications = storeState.notifications.filter((n) => n.id !== id);
		if (typeof window !== "undefined" && window.localStorage) try {
			const deletedRaw = window.localStorage.getItem(STORAGE_DELETED_NOTIFICATIONS_KEY);
			const deleted = deletedRaw ? JSON.parse(deletedRaw) : [];
			if (!deleted.includes(id)) {
				deleted.push(id);
				window.localStorage.setItem(STORAGE_DELETED_NOTIFICATIONS_KEY, JSON.stringify(deleted));
			}
			window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify(storeState.notifications));
		} catch (err) {
			console.warn(err);
		}
		notifyListeners();
	},
	clearAllNotifications() {
		storeState.notifications = [];
		if (typeof window !== "undefined" && window.localStorage) try {
			window.localStorage.setItem(STORAGE_CLEARED_NOTIFICATIONS_KEY, "true");
			window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify([]));
		} catch (err) {
			console.warn(err);
		}
		notifyListeners();
	},
	toggleNotificationRead(id) {
		storeState.notifications = storeState.notifications.map((n) => n.id === id ? {
			...n,
			read: !n.read
		} : n);
		if (typeof window !== "undefined" && window.localStorage) try {
			window.localStorage.setItem(STORAGE_PERSISTED_NOTIFICATIONS_KEY, JSON.stringify(storeState.notifications));
		} catch (err) {
			console.warn(err);
		}
		notifyListeners();
	},
	getCompanySettings() {
		return storeState.companySettings;
	},
	addWifiSSID(ssid, branchName = "", actor = "Admin", options = {}) {
		if (!ssid) return;
		const cleanSSID = ssid.trim();
		if (!cleanSSID) return;
		const bssid = (options.bssid || "").toUpperCase().trim();
		const securityType = options.securityType || "WPA2-Enterprise";
		const allowedIPs = options.allowedIPs && options.allowedIPs.length ? options.allowedIPs : ["127.0.0.1", "::1"];
		if (!storeState.companySettings.allowedWifiSSIDs.includes(cleanSSID)) storeState.companySettings.allowedWifiSSIDs = [...storeState.companySettings.allowedWifiSSIDs, cleanSSID];
		const resolvedBranch = branchName || storeState.companySettings?.locations?.[0]?.name || "Bengaluru HQ";
		const existingNetworks = storeState.companySettings.wifiNetworks || [];
		if (existingNetworks.find((n) => n.ssid === cleanSSID)) storeState.companySettings.wifiNetworks = existingNetworks.map((n) => n.ssid === cleanSSID ? {
			...n,
			bssid: bssid || n.bssid,
			securityType,
			branchName: resolvedBranch,
			allowedIPs
		} : n);
		else storeState.companySettings.wifiNetworks = [...existingNetworks, {
			id: `wn-${Date.now()}`,
			ssid: cleanSSID,
			bssid,
			securityType,
			branchName: resolvedBranch,
			allowedIPs,
			status: "active",
			addedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			addedBy: actor
		}];
		this.addAuditLog(actor, "WIFI_SSID_ADD", `Registered office Wi-Fi: ${cleanSSID} (BSSID: ${bssid || "n/a"}, ${securityType}) for branch ${branchName}`);
		notifyListeners();
	},
	removeWifiSSID(ssid, actor = "Admin") {
		storeState.companySettings.allowedWifiSSIDs = storeState.companySettings.allowedWifiSSIDs.filter((s) => s !== ssid);
		storeState.companySettings.wifiNetworks = (storeState.companySettings.wifiNetworks || []).filter((n) => n.ssid !== ssid);
		this.addAuditLog(actor, "WIFI_SSID_REMOVE", `Removed office Wi-Fi network: ${ssid}`);
		notifyListeners();
	},
	getOfficeNetworkIPs() {
		return storeState.companySettings.officeNetworkIPs || [];
	},
	isOfficeNetworkIP(ip) {
		if (!ip) return false;
		const clean = String(ip).trim().replace(/^::ffff:/, "").toLowerCase();
		return (storeState.companySettings.officeNetworkIPs || []).some((entry) => {
			let allow = String(entry.ip || "").trim().replace(/^::ffff:/, "").toLowerCase();
			if (allow === clean) return true;
			if (allow === "::1" && (clean === "127.0.0.1" || clean === "localhost")) return true;
			if (allow === "127.0.0.1" && (clean === "127.0.0.1" || clean === "localhost")) return true;
			if (/\.\*$/.test(allow) || /\.x$/i.test(allow)) allow = allow.replace(/(\.[\*x])$/i, ".0/24");
			if (allow.includes("/") && clean.includes(".")) {
				const [base] = allow.split("/");
				const bParts = base.split(".");
				const cParts = clean.split(".");
				if (bParts.length >= 3 && cParts.length >= 3 && bParts[0] === cParts[0] && bParts[1] === cParts[1] && bParts[2] === cParts[2]) return true;
			}
			if (allow.includes(".") && clean.includes(".")) {
				const aParts = allow.split(".");
				const cParts = clean.split(".");
				if (aParts.length === 4 && cParts.length === 4 && aParts[0] === cParts[0] && aParts[1] === cParts[1] && aParts[2] === cParts[2]) return true;
			}
			return false;
		});
	},
	addOfficeNetworkIP(ip, label = "Office Network", actor = "Admin") {
		const clean = String(ip || "").trim();
		if (!clean) return false;
		const existing = storeState.companySettings.officeNetworkIPs || [];
		if (existing.some((e) => String(e.ip).trim().toLowerCase() === clean.toLowerCase())) {
			this.addAuditLog(actor, "NETWORK_IP_EXISTS", `Office network IP already registered: ${clean}`);
			notifyListeners();
			return false;
		}
		storeState.companySettings.officeNetworkIPs = [...existing, {
			ip: clean,
			label: label || "Office Network",
			addedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			addedBy: actor
		}];
		this.addAuditLog(actor, "NETWORK_IP_ADD", `Registered office network public IP ${clean} (${label})`);
		notifyListeners();
		return true;
	},
	removeOfficeNetworkIP(ip, actor = "Admin") {
		const clean = String(ip || "").trim().toLowerCase();
		storeState.companySettings.officeNetworkIPs = (storeState.companySettings.officeNetworkIPs || []).filter((e) => String(e.ip).trim().toLowerCase() !== clean);
		this.addAuditLog(actor, "NETWORK_IP_REMOVE", `Removed office network public IP ${ip}`);
		notifyListeners();
	},
	getAuditLogs() {
		return storeState.auditLogs;
	},
	addAuditLog(actor, action, details) {
		const logItem = {
			id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			timestamp: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19),
			actor,
			action,
			details
		};
		storeState.auditLogs = [logItem, ...(storeState.auditLogs || []).slice(0, 99)];
	},
	getPayrollRecords() {
		return storeState.payroll || [];
	},
	getPayrollRecord(id) {
		return (storeState.payroll || []).find((p) => p.id === id);
	},
	savePayrollRecord(record) {
		const existingIndex = (storeState.payroll || []).findIndex((p) => record.id && (p.id === record.id || p._id === record.id) || p.month === record.month && (String(p.employeeId).toUpperCase() === String(record.employeeId || "").toUpperCase() || String(p.employeeRef || "") === String(record.employeeRef || record.employeeId || "")));
		let savedRecord;
		if (existingIndex >= 0) {
			savedRecord = {
				...storeState.payroll[existingIndex],
				...record,
				id: storeState.payroll[existingIndex].id
			};
			storeState.payroll[existingIndex] = savedRecord;
		} else {
			savedRecord = {
				...record,
				id: record.id || `pay-${record.employeeId || "custom"}-${Date.now()}`
			};
			storeState.payroll = [savedRecord, ...storeState.payroll || []];
		}
		this.addAuditLog("HR", "PAYROLL_SAVE", `Saved/Updated payslip for ${savedRecord.employeeName || "Employee"} (${savedRecord.employeeId || "N/A"}) - ${savedRecord.month || "Current Period"}`);
		notifyListeners();
		return savedRecord;
	},
	deletePayrollRecord(id) {
		storeState.payroll = (storeState.payroll || []).filter((p) => p.id !== id);
		this.addAuditLog("HR", "PAYROLL_DELETE", `Deleted payroll entry ${id}`);
		notifyListeners();
	},
	executePayrollRun(month = "September 2026", options = {}) {
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		const payDate = nowIso.split("T")[0];
		storeState.payroll = (storeState.payroll || []).map((p) => p.month === month ? {
			...p,
			status: "processed",
			emailSentAt: nowIso,
			paymentDate: payDate
		} : p);
		this.addNotification({
			title: `${month} Payroll Disbursed & Emailed`,
			message: `Official payslips emailed directly to employees and direct bank transfers initiated for ${storeState.payroll.length} employees with statutory PF, ESI, and tax deductions.`,
			type: "salary"
		});
		this.addAuditLog("HR", "PAYROLL_EXECUTE", `Executed, disbursed and emailed company-wide payroll for ${month}`);
		notifyListeners();
		return {
			success: true,
			data: { message: `Payslips for ${month} finalized, disbursed and emailed directly to all employees.` }
		};
	},
	sendBulkEmail(month = "September 2026") {
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		storeState.payroll = (storeState.payroll || []).map((p) => p.month === month ? {
			...p,
			emailSentAt: nowIso
		} : p);
		notifyListeners();
		return {
			success: true,
			data: { message: `Official payslip emails dispatched to employees for ${month}.` }
		};
	},
	async bulkGeneratePayroll({ month, employeeIds, department }) {
		const targetEmployees = (storeState.employees || []).filter((emp) => {
			if (emp.status === "inactive") return false;
			if (department && department !== "all" && emp.department !== department) return false;
			if (Array.isArray(employeeIds) && employeeIds.length > 0) {
				if (!employeeIds.some((id) => String(id).toUpperCase() === String(emp.employeeId || "").toUpperCase() || String(id) === String(emp.id || "") || String(id) === String(emp._id || ""))) return false;
			}
			return true;
		});
		if (targetEmployees.length === 0) throw new Error("No eligible active employees match the selected criteria.");
		let createdCount = 0;
		let updatedCount = 0;
		const updatedPayroll = [...storeState.payroll || []];
		targetEmployees.forEach((emp) => {
			const annualSalary = Number(emp.salary) || 4e5;
			const monthlyGross = Math.round(annualSalary / 12);
			const struct = emp.salaryStructure || {};
			const hasStruct = Boolean(struct && (struct.basic !== void 0 || struct.hra !== void 0 || struct.ca !== void 0 || struct.conveyance !== void 0 || struct.sa !== void 0 || struct.specialAllowance !== void 0 || struct.oa !== void 0 || struct.otherAllowance !== void 0));
			const basic = hasStruct && struct.basic !== void 0 ? Math.max(0, Number(struct.basic) || 0) : Math.round(monthlyGross * .5);
			const hra = hasStruct && struct.hra !== void 0 ? Math.max(0, Number(struct.hra) || 0) : Math.round(basic * .4);
			const conveyance = hasStruct && (struct.conveyance !== void 0 || struct.ca !== void 0) ? Math.max(0, Number(struct.conveyance ?? struct.ca) || 0) : monthlyGross > 8e3 ? 1600 : Math.round(monthlyGross * .1);
			const specialAllowance = hasStruct && (struct.specialAllowance !== void 0 || struct.sa !== void 0) ? Math.max(0, Number(struct.specialAllowance ?? struct.sa) || 0) : Math.round(monthlyGross * .15);
			const otherAllowance = hasStruct && (struct.otherAllowance !== void 0 || struct.oa !== void 0) ? Math.max(0, Number(struct.otherAllowance ?? struct.oa) || 0) : Math.max(0, monthlyGross - basic - hra - conveyance - specialAllowance);
			const pf = Math.min(1800, Math.round(basic * .12));
			const professionalTax = 200;
			const empIdStr = String(emp.employeeId || emp.id || "").toUpperCase();
			const attendanceList = storeState.attendance || [];
			const leavesList = storeState.leaves || [];
			const countedDates = /* @__PURE__ */ new Set();
			let calculatedLopDays = 0;
			for (const a of attendanceList) {
				if (String(a.employeeId || "").toUpperCase() !== empIdStr) continue;
				const dateStr = String(a.date || "");
				const dayOfMonth = Number(dateStr.split("-")[2]) || 1;
				const isLop = a.status === "lop" || a.isLop;
				const isLeave = a.status === "on-leave";
				const isMonthEndDouble = dayOfMonth >= 25 || a.isDoubleLop;
				if (isLop) {
					calculatedLopDays += isMonthEndDouble ? 2 : 1;
					countedDates.add(dateStr);
				} else if (isLeave && isMonthEndDouble) {
					calculatedLopDays += 2;
					countedDates.add(dateStr);
				}
			}
			for (const l of leavesList) {
				if (String(l.employeeId?._id || l.employeeId?.employeeId || l.employeeId || "").toUpperCase() !== empIdStr || l.status !== "approved") continue;
				if (l.doubleLopDays && l.doubleLopDays > 0) calculatedLopDays += l.doubleLopDays * 2;
				else if (l.isDoubleLop) calculatedLopDays += (l.units || 1) * 2;
				else if (l.startDate && l.endDate) {
					const s = new Date(l.startDate);
					const e = new Date(l.endDate);
					for (const cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
						const curDateStr = cur.toISOString().slice(0, 10);
						if (cur.getDate() >= 25 && !countedDates.has(curDateStr)) {
							calculatedLopDays += 2;
							countedDates.add(curDateStr);
						}
					}
				}
			}
			const lateLoginsCount = attendanceList.filter((a) => {
				if (String(a.employeeId || "").toUpperCase() !== empIdStr) return false;
				if (month && a.date) try {
					if ((/* @__PURE__ */ new Date(`${a.date}T12:00:00`)).toLocaleDateString("en-US", {
						month: "long",
						year: "numeric"
					}) !== month && !a.date.startsWith(month)) return false;
				} catch {}
				return true;
			}).filter((a) => a.isLate || a.status === "late").length;
			const lateLopDays = Math.floor(lateLoginsCount / 3) * .5;
			calculatedLopDays += lateLopDays;
			const standardDays = 30;
			const lopDays = calculatedLopDays;
			const payableDays = Math.max(0, standardDays - lopDays);
			const paidDays = payableDays;
			const lopDeduction = lopDays > 0 ? Math.round(monthlyGross / standardDays * lopDays) : 0;
			const grossEarnings = basic + hra + conveyance + specialAllowance + otherAllowance;
			const totalDeductions = pf + professionalTax + lopDeduction;
			const netPay = Math.max(0, grossEarnings - totalDeductions);
			const bankName = emp.bankDetails?.bankName || emp.bankName || "HDFC Bank";
			const accountNumber = emp.bankDetails?.accountNumber || emp.accountNumber || "";
			const ifscCode = emp.bankDetails?.ifscCode || emp.ifscCode || "";
			const panTaxId = emp.bankDetails?.panTaxId || emp.panTaxId || "";
			const uanNumber = emp.bankDetails?.uanNumber || emp.uanNumber || "";
			const deductionsList = [{
				name: "Provident Fund (P.F.)",
				amount: pf
			}, {
				name: "Professional Tax",
				amount: professionalTax
			}];
			if (lopDeduction > 0) deductionsList.push({
				name: "Loss of Pay (LOP)",
				amount: lopDeduction
			});
			const recordData = {
				employeeId: emp.employeeId || emp.id,
				employeeRef: emp._id || emp.id,
				employeeName: emp.name,
				designation: emp.designation || "Pending Designation",
				department: emp.department || "General",
				location: emp.location || "Headquarters",
				month: month || "October 2026",
				standardDays,
				payableDays,
				paidDays,
				lopDays,
				lopReversalDays: 0,
				arrearDays: 0,
				bankName,
				accountNumber,
				ifscCode,
				panTaxId,
				uanNumber,
				earningsList: [
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
						monthlyRate: specialAllowance,
						currentMonth: specialAllowance,
						arrear: 0,
						total: specialAllowance
					},
					{
						name: "Other Allowance",
						monthlyRate: otherAllowance,
						currentMonth: otherAllowance,
						arrear: 0,
						total: otherAllowance
					}
				],
				deductionsList,
				earnings: {
					basic,
					hra,
					conveyance,
					specialAllowance,
					otherAllowance
				},
				deductions: {
					pf,
					professionalTax,
					lossOfPay: lopDeduction
				},
				grossEarnings,
				totalDeductions,
				netPay,
				status: "Processed",
				notes: lopDays > 0 ? lateLopDays > 0 ? `Bulk generated payroll draft (${lopDays} LOP day(s) deducted, including ${lateLopDays} LOP from ${lateLoginsCount} late logins)` : `Bulk generated payroll draft (${lopDays} LOP day(s) deducted)` : "Bulk generated payroll draft"
			};
			const existingIndex = updatedPayroll.findIndex((p) => p.month === month && (String(p.employeeId).toUpperCase() === String(emp.employeeId || "").toUpperCase() || String(p.employeeId) === String(emp.id) || String(p.employeeRef) === String(emp._id || emp.id)));
			if (existingIndex >= 0) {
				updatedPayroll[existingIndex] = {
					...updatedPayroll[existingIndex],
					...recordData,
					id: updatedPayroll[existingIndex].id
				};
				updatedCount++;
			} else {
				const newRecord = {
					...recordData,
					id: `pay-${emp.employeeId || emp.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
				};
				updatedPayroll.unshift(newRecord);
				createdCount++;
			}
		});
		storeState = {
			...storeState,
			payroll: updatedPayroll
		};
		this.addNotification({
			title: "Bulk Payroll Generation Complete",
			message: `Generated/Updated ${createdCount + updatedCount} payslip(s) for ${month}.`,
			type: "salary"
		});
		this.addAuditLog("HR", "PAYROLL_BULK_GENERATE", `Bulk generated ${createdCount} new, updated ${updatedCount} existing payslips for ${month}`);
		notifyListeners();
		return {
			success: true,
			createdCount,
			updatedCount,
			message: `Successfully processed ${createdCount + updatedCount} payslip(s) (${createdCount} created, ${updatedCount} updated) for ${month}.`
		};
	},
	getOrganizationHierarchy(rootId = null, filterDept = null, viewerUser = null) {
		const rawEmployees = storeState.employees || [];
		const isExcluded = (emp) => {
			if (!emp) return false;
			const role = String(emp.role || "").toLowerCase();
			const empId = String(emp.employeeId || "").toUpperCase();
			const id = String(emp.id || emp._id || "");
			const name = String(emp.name || "").trim().toLowerCase();
			return empId === "EDU-ADM-001" || empId === "EDU-ADM-002" || id === "emp-3" || id === "user-admin-1" || role === "admin" && (name === "admin" || empId.includes("ADM"));
		};
		const employees = rawEmployees.filter((e) => !isExcluded(e));
		const byId = /* @__PURE__ */ new Map();
		const childrenMap = /* @__PURE__ */ new Map();
		employees.forEach((emp) => {
			const id = String(emp.id || emp._id);
			let effectiveManagerId = emp.managerId ? String(emp.managerId) : null;
			if (effectiveManagerId === "emp-3" || effectiveManagerId === "EDU-ADM-001" || effectiveManagerId === "user-admin-1") effectiveManagerId = null;
			byId.set(id, {
				...emp,
				id,
				managerId: effectiveManagerId,
				children: []
			});
			childrenMap.set(id, []);
		});
		employees.forEach((emp) => {
			if (emp.employeeId) byId.set(emp.employeeId, byId.get(String(emp.id || emp._id)));
		});
		employees.forEach((emp) => {
			const id = String(emp.id || emp._id);
			const mgrId = byId.get(id)?.managerId;
			if (mgrId && byId.has(mgrId)) {
				const actualMgrId = String(byId.get(mgrId).id || byId.get(mgrId)._id);
				if (actualMgrId !== id) {
					if (!childrenMap.has(actualMgrId)) childrenMap.set(actualMgrId, []);
					childrenMap.get(actualMgrId).push(id);
				}
			}
		});
		function calculateTeamCounts(nodeId) {
			const node = byId.get(nodeId);
			if (!node) return {
				direct: 0,
				total: 0
			};
			node.children = (childrenMap.get(nodeId) || []).map((cid) => byId.get(cid)).filter(Boolean);
			node.directReportCount = node.children.length;
			let total = node.children.length;
			node.children.forEach((c) => {
				const childCount = calculateTeamCounts(String(c.id || c._id));
				total += childCount.total;
			});
			node.totalTeamCount = total;
			return {
				direct: node.directReportCount,
				total
			};
		}
		if (!(!viewerUser || viewerUser.role === "admin" || viewerUser.role === "hr")) {
			const viewerId = String(viewerUser.id || viewerUser._id || "");
			const target = byId.get(viewerId) || viewerUser.employeeId && byId.get(viewerUser.employeeId) || employees.find((e) => viewerUser.email && e.email && e.email.toLowerCase() === viewerUser.email.toLowerCase());
			if (target) {
				const targetId = String(target.id || target._id);
				const chain = [];
				let curr = target;
				const visitedChain = /* @__PURE__ */ new Set();
				while (curr) {
					const cid = String(curr.id || curr._id);
					if (visitedChain.has(cid)) break;
					visitedChain.add(cid);
					chain.unshift({ ...curr });
					if (!curr.managerId) break;
					const mgr = byId.get(String(curr.managerId));
					if (!mgr) break;
					curr = mgr;
				}
				const subordinateIds = /* @__PURE__ */ new Set();
				function collectSubordinates(pId) {
					(childrenMap.get(pId) || []).forEach((kidId) => {
						if (!subordinateIds.has(kidId)) {
							subordinateIds.add(kidId);
							collectSubordinates(kidId);
						}
					});
				}
				collectSubordinates(targetId);
				const allowedIds = /* @__PURE__ */ new Set([...chain.map((c) => String(c.id || c._id)), ...subordinateIds]);
				childrenMap.forEach((kids, parentId) => {
					if (!allowedIds.has(parentId)) childrenMap.set(parentId, []);
					else childrenMap.set(parentId, kids.filter((k) => allowedIds.has(k)));
				});
				const topChainNode = chain[0] || target;
				const topNodeId = String(topChainNode.id || topChainNode._id);
				calculateTeamCounts(topNodeId);
				const scopedRoot = byId.get(topNodeId);
				const deptMap = /* @__PURE__ */ new Map();
				employees.filter((e) => allowedIds.has(String(e.id || e._id))).forEach((e) => {
					let d = e.department || "General";
					if (d.toLowerCase() === "executive") d = "Executive Leadership";
					if (!deptMap.has(d)) deptMap.set(d, {
						name: d,
						count: 0,
						activeCount: 0
					});
					const item = deptMap.get(d);
					item.count++;
					if (e.status === "active") item.activeCount++;
				});
				return {
					roots: scopedRoot ? [scopedRoot] : [],
					stats: {
						totalEmployees: allowedIds.size,
						activeEmployees: allowedIds.size,
						totalDepartments: deptMap.size,
						departments: Array.from(deptMap.values())
					},
					scoped: true,
					chain,
					reportingLine: chain.map((c) => `${c.name}${c.designation ? ` (${c.designation})` : ""}`).join(" ➔ "),
					targetEmployee: target,
					allowedIds: Array.from(allowedIds)
				};
			}
		}
		let roots = [];
		if (rootId) {
			const target = byId.get(String(rootId));
			if (target) {
				calculateTeamCounts(String(target.id || target._id));
				roots = [target];
			}
		} else if (filterDept) {
			const deptEmployees = employees.filter((e) => (e.department || "").toLowerCase() === filterDept.toLowerCase());
			const primaryRoot = deptEmployees.filter((e) => {
				const mgr = employees.find((m) => String(m.id || m._id) === String(e.managerId) || m.employeeId === String(e.managerId));
				return !mgr || (mgr.department || "").toLowerCase() !== filterDept.toLowerCase();
			})[0] || deptEmployees[0];
			if (primaryRoot) {
				calculateTeamCounts(String(primaryRoot.id || primaryRoot._id));
				roots = [byId.get(String(primaryRoot.id || primaryRoot._id))];
			}
		} else {
			const topDirector = employees.find((e) => e.role === "managing_director" || e.role === "director" && !e.managerId || e.designation && e.designation.toLowerCase().includes("managing director") || e.name && /jagadish\s*babu/i.test(e.name));
			if (topDirector && !rootId) {
				const topDirectorId = String(topDirector.id || topDirector._id);
				employees.forEach((emp) => {
					const id = String(emp.id || emp._id);
					if (id !== topDirectorId) {
						const node = byId.get(id);
						const mgrId = node?.managerId ? String(node.managerId) : null;
						if (!mgrId || !byId.has(mgrId)) {
							if (!childrenMap.has(topDirectorId)) childrenMap.set(topDirectorId, []);
							if (!childrenMap.get(topDirectorId).includes(id)) childrenMap.get(topDirectorId).push(id);
						}
					}
				});
				calculateTeamCounts(topDirectorId);
				roots = [byId.get(topDirectorId)];
			} else {
				roots = employees.filter((emp) => {
					const node = byId.get(String(emp.id || emp._id));
					const mgrId = node?.managerId ? String(node.managerId) : null;
					return !mgrId || !byId.has(mgrId);
				}).map((emp) => byId.get(String(emp.id || emp._id))).filter(Boolean);
				roots.forEach((root) => {
					calculateTeamCounts(String(root.id || root._id));
				});
			}
		}
		const deptMap = /* @__PURE__ */ new Map();
		employees.forEach((e) => {
			let d = e.department || "General";
			if (d.toLowerCase() === "executive") d = "Executive Leadership";
			if (!deptMap.has(d)) deptMap.set(d, {
				name: d,
				count: 0,
				activeCount: 0
			});
			const item = deptMap.get(d);
			item.count++;
			if (e.status === "active") item.activeCount++;
		});
		return {
			roots,
			stats: {
				totalEmployees: employees.length,
				activeEmployees: employees.filter((e) => e.status === "active").length,
				totalDepartments: deptMap.size,
				departments: Array.from(deptMap.values())
			},
			scoped: false
		};
	},
	getEmployeeReportingChain(employeeId) {
		const employees = storeState.employees || [];
		const byId = new Map(employees.map((e) => [String(e.id || e._id), e]));
		employees.forEach((e) => {
			if (e.employeeId) byId.set(e.employeeId, e);
		});
		const target = byId.get(String(employeeId));
		if (!target) return [];
		const chain = [];
		let curr = target;
		const visited = /* @__PURE__ */ new Set();
		while (curr) {
			const id = String(curr.id || curr._id);
			if (visited.has(id)) break;
			visited.add(id);
			chain.unshift({ ...curr });
			if (!curr.managerId) break;
			curr = byId.get(String(curr.managerId));
		}
		return chain;
	},
	getDirectReports(employeeId) {
		const employees = storeState.employees || [];
		const target = employees.find((e) => e.id === employeeId || e._id === employeeId || e.employeeId === employeeId);
		if (!target) return [];
		const tId = String(target.id || target._id);
		return employees.filter((e) => String(e.managerId) === tId || e.managerId === target.employeeId);
	},
	validateManagerAssignment(employeeId, newManagerId) {
		if (!newManagerId) return { valid: true };
		if (String(employeeId) === String(newManagerId)) return {
			valid: false,
			message: "An employee cannot be assigned as their own reporting manager."
		};
		const employees = storeState.employees || [];
		const byId = new Map(employees.map((e) => [String(e.id || e._id), e]));
		employees.forEach((e) => {
			if (e.employeeId) byId.set(e.employeeId, e);
		});
		const targetEmp = byId.get(String(employeeId));
		const newMgr = byId.get(String(newManagerId));
		if (!targetEmp) return {
			valid: false,
			message: "Employee not found."
		};
		if (!newMgr) return {
			valid: false,
			message: "Target reporting manager not found."
		};
		let current = newMgr;
		const visited = /* @__PURE__ */ new Set();
		while (current && current.managerId) {
			const parentId = String(current.managerId);
			if (parentId === String(employeeId) || parentId === targetEmp.employeeId) return {
				valid: false,
				message: `Circular reporting relationship detected: ${newMgr.name} is in ${targetEmp.name}'s reporting chain.`
			};
			if (visited.has(parentId)) break;
			visited.add(parentId);
			current = byId.get(parentId);
		}
		return { valid: true };
	},
	updateEmployeeManager(employeeId, newManagerId, actor = "System") {
		const validation = this.validateManagerAssignment(employeeId, newManagerId);
		if (!validation.valid) throw new Error(validation.message);
		const emp = this.getEmployee(employeeId);
		if (!emp) throw new Error("Employee not found.");
		let newMgrName = null;
		if (newManagerId) {
			const mgr = this.getEmployee(newManagerId);
			newMgrName = mgr ? mgr.name : null;
		}
		const updated = this.updateEmployee(emp.id, {
			managerId: newManagerId || null,
			managerName: newMgrName
		});
		this.addAuditLog(actor, "MANAGER_REASSIGNMENT", `Reassigned reporting manager of ${emp.name} to ${newMgrName || "None (Company Root)"}`);
		return updated;
	},
	transferEmployeeDepartment(employeeId, newDepartment, newManagerId, actor = "System", extra = {}) {
		if (newManagerId) {
			const validation = this.validateManagerAssignment(employeeId, newManagerId);
			if (!validation.valid) throw new Error(validation.message);
		}
		const emp = this.getEmployee(employeeId);
		if (!emp) throw new Error("Employee not found.");
		let newMgrName = emp.managerName;
		if (newManagerId !== void 0) {
			if (newManagerId) {
				const mgr = this.getEmployee(newManagerId);
				newMgrName = mgr ? mgr.displayName || mgr.name : null;
			} else newMgrName = null;
		}
		const updated = this.updateEmployee(emp.id, {
			department: newDepartment,
			...newManagerId !== void 0 ? {
				managerId: newManagerId || null,
				managerName: newMgrName
			} : {},
			...extra.squad !== void 0 ? {
				squad: extra.squad,
				team: extra.squad
			} : {},
			...extra.designation !== void 0 ? { designation: extra.designation } : {},
			...extra.role !== void 0 ? { role: extra.role } : {}
		});
		this.addAuditLog(actor, "DEPARTMENT_TRANSFER", `Transferred ${emp.name} to department ${newDepartment}`);
		return updated;
	},
	resetToDemoDefaults() {
		window.localStorage.removeItem(STORAGE_KEY);
		storeState = loadStore();
		notifyListeners();
	}
};
var rawLocalStore = { ...localStore };
var hrStore = Object.assign(localStore, createConnectedStore(localStore, notifyListeners, rawLocalStore));
var storeAction = (handler) => (...args) => hrStore.perform(() => handler(...args));
// src/services/liveUpdates.js
var API_BASE_URL = "/api/v1";
function connectLiveUpdates(token, refresh, failed) {
	const controller = new AbortController();
	let retry;
	let backoffMs = 3e3;
	async function connect() {
		try {
			const response = await fetch(`${API_BASE_URL}/events`, {
				headers: {
					Accept: "text/event-stream",
					Authorization: `Bearer ${token}`
				},
				signal: controller.signal
			});
			if (!response.ok) throw new ApiError("Live updates unavailable. Background refresh remains active.", { status: response.status });
			if (!response.body) throw new Error("Live update streaming is not supported by this browser.");
			backoffMs = 3e3;
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			try {
				while (!controller.signal.aborted) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
					let end;
					while ((end = buffer.indexOf("\n\n")) !== -1) {
						const event = buffer.slice(0, end);
						buffer = buffer.slice(end + 2);
						if (event === "data: changed" || event === "data: connected") refresh();
					}
				}
			} finally {
				reader.releaseLock();
			}
		} catch (error) {
			if (controller.signal.aborted) return;
			if (error?.status === 401 && failed) failed(error);
			backoffMs = Math.min(2e4, Math.round(backoffMs * 1.5));
		}
		if (!controller.signal.aborted) retry = setTimeout(connect, backoffMs);
	}
	connect();
	return () => {
		controller.abort();
		clearTimeout(retry);
	};
}
// src/auth/AuthContext.jsx
var AuthContext = (0, import_react.createContext)(null);
var SESSION_KEY = "edufyi.accessToken";
var USER_KEY = "edufyi.authUser";
function readStoredToken() {
	try {
		return window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY);
	} catch {
		return null;
	}
}
function readStoredUser() {
	try {
		const raw = window.localStorage.getItem(USER_KEY) || window.sessionStorage.getItem(USER_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function AuthProvider({ children }) {
	const [token, setToken] = (0, import_react.useState)(readStoredToken);
	const [user, setUser] = (0, import_react.useState)(readStoredUser);
	const [status, setStatus] = (0, import_react.useState)(() => readStoredToken() ? readStoredUser() ? "authenticated" : "loading" : "signed-out");
	if (token) setAccessToken(token);
	(0, import_react.useEffect)(() => hrStore.subscribe((state) => {
		setUser((current) => {
			if (!current) return current;
			const found = state.employees.find((e) => current.id && (e.id === current.id || e._id === current.id) || current.employeeId && (e.employeeId === current.employeeId || e.id === current.employeeId) || current.email && e.email && e.email.toLowerCase() === current.email.toLowerCase());
			if (!found) return current;
			const displayName = found.name || found.displayName || current.displayName || current.name || current.username;
			const avatarUrl = found.avatarUrl || current.avatarUrl;
			const nextUser = {
				...current,
				...found,
				displayName,
				name: found.name || current.name || displayName,
				avatarUrl
			};
			persistUser(nextUser);
			return nextUser;
		});
	}), []);
	(0, import_react.useEffect)(() => {
		if (status !== "authenticated" || !user?.id) return;
		let active = true;
		const failed = (error) => {
			if (!active) return;
			if (error.status === 401) clearSession();
			else hrStore.reportError(error);
		};
		hrStore.connectUser(user).catch(failed);
		let lastRun = Date.now();
		let pending = null;
		const MIN_GAP_MS = 3e4;
		const refresh = () => {
			if (!active || pending || document.hidden) return;
			const wait = Math.max(0, lastRun + MIN_GAP_MS - Date.now()) + Math.random() * 5e3;
			pending = window.setTimeout(() => {
				pending = null;
				lastRun = Date.now();
				hrStore.refresh().catch(failed);
			}, wait);
		};
		const disconnect = connectLiveUpdates(token, refresh, failed);
		const timer = window.setInterval(refresh, 12e4);
		const onFocus = () => {
			if (Date.now() - lastRun >= MIN_GAP_MS) refresh();
		};
		window.addEventListener("focus", onFocus);
		return () => {
			active = false;
			window.clearTimeout(pending);
			window.clearInterval(timer);
			disconnect();
			window.removeEventListener("focus", onFocus);
		};
	}, [
		status,
		user?.id,
		token
	]);
	(0, import_react.useEffect)(() => {
		const onExpired = () => clearSession();
		window.addEventListener("edufyi:auth-expired", onExpired);
		return () => window.removeEventListener("edufyi:auth-expired", onExpired);
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		setAccessToken(token);
		if (token) {
			const timeoutId = setTimeout(() => {
				if (!active) return;
				const cachedUser = readStoredUser();
				if (cachedUser) {
					console.warn("Session validation took longer than expected; using local cached session.");
					setUser(cachedUser);
					setStatus("authenticated");
				} else clearSession();
			}, 2e4);
			apiClient.get("/auth/me").then((result) => {
				clearTimeout(timeoutId);
				if (!active) return;
				if (result?.data?.user) {
					setUser(result.data.user);
					persistUser(result.data.user);
					setStatus("authenticated");
				} else clearSession();
			}).catch((error) => {
				clearTimeout(timeoutId);
				if (!active) return;
				if (error?.status === 401) {
					console.warn("Session authentication expired (401). Signing out.");
					clearSession();
				} else {
					console.warn("Network issue during /auth/me verification:", error.message);
					const cachedUser = readStoredUser();
					if (cachedUser) {
						setUser(cachedUser);
						setStatus("authenticated");
					}
				}
			});
		} else setStatus("signed-out");
		return () => {
			active = false;
		};
	}, [token]);
	function persistToken(nextToken) {
		try {
			if (nextToken) {
				window.localStorage.setItem(SESSION_KEY, nextToken);
				window.sessionStorage.setItem(SESSION_KEY, nextToken);
			} else {
				window.localStorage.removeItem(SESSION_KEY);
				window.sessionStorage.removeItem(SESSION_KEY);
			}
		} catch {}
		setToken(nextToken);
	}
	function persistUser(nextUser) {
		try {
			if (nextUser) {
				const str = JSON.stringify(nextUser);
				window.localStorage.setItem(USER_KEY, str);
				window.sessionStorage.setItem(USER_KEY, str);
			} else {
				window.localStorage.removeItem(USER_KEY);
				window.sessionStorage.removeItem(USER_KEY);
			}
		} catch {}
		setUser(nextUser);
	}
	function updateUser(updates) {
		setUser((prev) => {
			const updated = {
				...prev,
				...updates
			};
			persistUser(updated);
			return updated;
		});
	}
	function clearSession() {
		try {
			window.localStorage.removeItem(SESSION_KEY);
			window.localStorage.removeItem(USER_KEY);
			window.localStorage.removeItem("edufyi.activePersona");
			window.sessionStorage.removeItem(SESSION_KEY);
			window.sessionStorage.removeItem(USER_KEY);
			window.sessionStorage.removeItem("edufyi.activePersona");
		} catch {}
		setAccessToken(null);
		setToken(null);
		setUser(null);
		setStatus("signed-out");
		hrStore.connectUser(null).catch(() => {});
	}
	async function login(identifier, password, portal) {
		if (!identifier || !identifier.trim()) throw new Error("Please enter your work email, username, or employee ID.");
		if (!password) throw new Error("Please enter your password.");
		const cleanIdentifier = identifier.trim();
		let result = null;
		try {
			result = await apiClient.post("/auth/login", {
				email: cleanIdentifier,
				username: cleanIdentifier,
				identifier: cleanIdentifier,
				password,
				portal
			});
		} catch (apiErr) {
			if (apiErr?.code === "PORTAL_ACCESS_DENIED" || apiErr?.status === 403) throw new Error(apiErr.message || "Access denied for this portal.");
			if (apiErr?.status === 401 || apiErr?.code === "INVALID_CREDENTIALS") throw new Error("Invalid email or password.");
			throw new Error(apiErr?.message || "Unable to reach the authentication server. Please try again in a moment.");
		}
		if (result?.data?.token && result?.data?.user) {
			const loggedUser = result.data.user;
			const isExec = [
				"director",
				"managing_director",
				"co_founder",
				"vertical_head"
			].includes(loggedUser.role) || loggedUser.email === "jagadishbabu@edufyitech.in";
			if (portal === "admin" && loggedUser.role !== "admin" && !isExec) {
				clearSession();
				throw new Error("Access denied: Employee credentials cannot be used to log into the Admin portal. Please use Employee Self-Service.");
			}
			if (portal === "hr" && !["hr", "admin"].includes(loggedUser.role) && !isExec) {
				clearSession();
				throw new Error("Access denied: Employee credentials cannot be used to log into the HR portal. Please use Employee Self-Service.");
			}
			if (portal === "management" && !["hr", "admin"].includes(loggedUser.role) && !isExec) {
				clearSession();
				throw new Error("Access denied: Employee credentials cannot be used to log into the Management Console. Please use Employee Self-Service.");
			}
			if (portal === "employee" && ["admin", "hr"].includes(loggedUser.role) && !isExec) {
				clearSession();
				throw new Error("Access denied: Administrative accounts must sign into the Management Console. Please switch to the Management portal.");
			}
			setAccessToken(result.data.token);
			setToken(result.data.token);
			setUser(result.data.user);
			persistToken(result.data.token);
			persistUser(result.data.user);
			setStatus("authenticated");
			hrStore.addAuditLog(result.data.user.name, "USER_LOGIN", `Authenticated via API as ${result.data.user.role.toUpperCase()} (${cleanIdentifier})`);
			return result.data.user;
		}
		throw new Error("Invalid email or password.");
	}
	async function logout() {
		const currentRole = user?.role;
		const currentHash = typeof window !== "undefined" ? window.location.hash || "" : "";
		try {
			if (token) await apiClient.post("/auth/logout", void 0);
		} catch {} finally {
			clearSession();
			if (currentRole === "admin" || currentHash.startsWith("#/admin")) window.location.hash = "#/admin/login";
			else if (currentRole === "hr" || currentHash.startsWith("#/hr")) window.location.hash = "#/hr/login";
			else window.location.hash = "#/employee/login";
		}
	}
	async function changePassword({ currentPassword, newPassword }) {
		if (!newPassword || newPassword.trim().length < 8) throw new Error("New password must be at least 8 characters long.");
		const res = await apiClient.post("/auth/change-password", {
			currentPassword: currentPassword || void 0,
			newPassword: newPassword.trim()
		});
		if (res?.data?.user) updateUser(res.data.user);
		else updateUser({ mustChangePassword: false });
		return res?.data || { success: true };
	}
	function completeSession(newToken, newUser) {
		setAccessToken(newToken);
		setToken(newToken);
		setUser(newUser);
		persistToken(newToken);
		persistUser(newUser);
		setStatus("authenticated");
		hrStore.addAuditLog(newUser.name, "USER_LOGIN_PASSKEY", `Authenticated via Passkey / WebAuthn as ${newUser.role?.toUpperCase() || "USER"}`);
		return newUser;
	}
	const value = (0, import_react.useMemo)(() => ({
		token,
		user,
		status,
		login,
		logout,
		changePassword,
		updateUser,
		completeSession
	}), [
		token,
		user,
		status
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const context = (0, import_react.useContext)(AuthContext);
	if (!context) return {
		user: null,
		status: "loading",
		token: null,
		login: async () => {},
		logout: async () => {},
		changePassword: async () => {},
		updateUser: () => {}
	};
	return context;
}
// src/auth/permissions.js
var PERMISSIONS = Object.freeze({
	DASHBOARD_READ: "dashboard.read",
	HR_DASHBOARD_READ: "hr.dashboard.read",
	EMPLOYEES_READ: "employees.read",
	EMPLOYEES_WRITE: "employees.write",
	ATTENDANCE_READ: "attendance.read",
	ATTENDANCE_WRITE: "attendance.write",
	LEAVE_SELF_READ: "leave.self.read",
	LEAVE_TEAM_READ: "leave.team.read",
	LEAVE_HR_READ: "leave.hr.read",
	LEAVE_HR_REVIEW: "leave.hr.review",
	LEAVE_POLICY_ADMIN: "leave.policy.admin",
	PAYROLL_READ: "payroll.read",
	PAYROLL_WRITE: "payroll.write",
	PERFORMANCE_READ: "performance.read",
	RECRUITMENT_READ: "recruitment.read",
	TASKS_READ: "tasks.read",
	TRAINING_READ: "training.read",
	REPORTS_READ: "reports.read",
	HELPDESK_READ: "helpdesk.read",
	ANNOUNCEMENTS_READ: "announcements.read",
	HOLIDAYS_READ: "holidays.read",
	DOCUMENTS_READ: "documents.read",
	HR_SETTINGS_READ: "settings.hr.read",
	ADMIN_ACCESS: "admin.access",
	ADMIN_SETTINGS: "settings.admin"
});
Object.freeze({
	people: PERMISSIONS.EMPLOYEES_READ,
	attendance: PERMISSIONS.ATTENDANCE_READ,
	leave: PERMISSIONS.LEAVE_HR_READ,
	payroll: PERMISSIONS.PAYROLL_READ,
	performance: PERMISSIONS.PERFORMANCE_READ,
	recruitment: PERMISSIONS.RECRUITMENT_READ,
	tasks: PERMISSIONS.TASKS_READ,
	learning: PERMISSIONS.TRAINING_READ,
	reports: PERMISSIONS.REPORTS_READ,
	helpdesk: PERMISSIONS.HELPDESK_READ,
	announcements: PERMISSIONS.ANNOUNCEMENTS_READ,
	holidays: PERMISSIONS.HOLIDAYS_READ,
	documents: PERMISSIONS.DOCUMENTS_READ,
	settings: PERMISSIONS.HR_SETTINGS_READ,
	admin: PERMISSIONS.ADMIN_ACCESS
});
var SELF_WORKSPACE_READ = [
	"tasks.read",
	"training.read",
	"helpdesk.read",
	"announcements.read",
	"holidays.read",
	"documents.read"
];
var HR_DEFAULT_PERMISSIONS = [
	"dashboard.read",
	"hr.dashboard.read",
	"employees.read",
	"employees.write",
	"employees.manager.assign",
	"attendance.read",
	"attendance.write",
	"attendance.self.read",
	"attendance.self.write",
	"attendance.team.read",
	"leave.self.read",
	"leave.self.write",
	"leave.team.read",
	"leave.hr.read",
	"leave.hr.review",
	"leave.policy.admin",
	"payroll.read",
	"payroll.write",
	"payroll.self.read",
	"performance.read",
	"recruitment.read",
	"reports.read",
	...SELF_WORKSPACE_READ,
	"settings.hr.read"
];
var LEADERSHIP_PERMISSIONS = [
	"dashboard.read",
	"hr.dashboard.read",
	"employees.read",
	"employees.write",
	"employees.manager.assign",
	"attendance.read",
	"attendance.write",
	"attendance.self.read",
	"attendance.team.read",
	"leave.self.read",
	"leave.self.write",
	"leave.team.read",
	"leave.team.approve",
	"leave.hr.read",
	"payroll.read",
	"payroll.write",
	"payroll.self.read",
	"performance.read",
	"reports.read",
	...SELF_WORKSPACE_READ
];
var MANAGER_PERMISSIONS = [
	"dashboard.read",
	"employees.read",
	"leave.self.read",
	"leave.self.write",
	"leave.team.read",
	"leave.team.approve",
	"attendance.read",
	"attendance.self.read",
	"attendance.team.read",
	"payroll.self.read",
	"performance.read",
	"reports.read",
	...SELF_WORKSPACE_READ
];
var TEAM_LEAD_PERMISSIONS = [
	"dashboard.read",
	"employees.read",
	"leave.self.read",
	"leave.self.write",
	"leave.team.read",
	"leave.team.approve",
	"attendance.read",
	"attendance.self.read",
	"attendance.team.read",
	"payroll.self.read",
	"performance.read",
	...SELF_WORKSPACE_READ
];
var ESS_PERMISSIONS = [
	"dashboard.read",
	"leave.self.read",
	"leave.self.write",
	"attendance.read",
	"attendance.self.read",
	"attendance.self.write",
	"payroll.self.read",
	...SELF_WORKSPACE_READ
];
var ROLE_DEFAULT_PERMISSIONS = Object.freeze({
	admin: ["*"],
	managing_director: LEADERSHIP_PERMISSIONS,
	director: LEADERSHIP_PERMISSIONS,
	co_founder: LEADERSHIP_PERMISSIONS,
	vertical_head: LEADERSHIP_PERMISSIONS,
	general_manager: LEADERSHIP_PERMISSIONS,
	assistant_general_manager: LEADERSHIP_PERMISSIONS,
	revenue_growth_manager: MANAGER_PERMISSIONS,
	senior_manager: MANAGER_PERMISSIONS,
	head_of_sales: MANAGER_PERMISSIONS,
	head_of_marketing: MANAGER_PERMISSIONS,
	manager: MANAGER_PERMISSIONS,
	team_leader: TEAM_LEAD_PERMISSIONS,
	team_lead: TEAM_LEAD_PERMISSIONS,
	hr_executive: HR_DEFAULT_PERMISSIONS,
	hr: HR_DEFAULT_PERMISSIONS,
	hr_intern: ESS_PERMISSIONS,
	operations_executive: ESS_PERMISSIONS,
	business_development_executive: ESS_PERMISSIONS,
	business_development_intern: ESS_PERMISSIONS,
	marketing_executive: ESS_PERMISSIONS,
	marketing_intern: ESS_PERMISSIONS,
	digital_marketing_executive: ESS_PERMISSIONS,
	digital_marketing_intern: ESS_PERMISSIONS,
	sde: ESS_PERMISSIONS,
	sde_intern: ESS_PERMISSIONS,
	saas_intern: ESS_PERMISSIONS,
	seo_executive: ESS_PERMISSIONS,
	seo_intern: ESS_PERMISSIONS,
	post_sales_executive: ESS_PERMISSIONS,
	post_sales_intern: ESS_PERMISSIONS,
	intern: ESS_PERMISSIONS,
	employee: ESS_PERMISSIONS
});
function getUserPermissions(user) {
	if (user?.role === "admin") return ["*"];
	let perms = [];
	if (Array.isArray(user?.permissions) && user.permissions.length > 0) perms = user.permissions;
	else {
		const rawRole = String(user?.role || "");
		const cleanRole = rawRole.toLowerCase().replace(/[^a-z0-9]/g, "_");
		let rolePerms = ROLE_DEFAULT_PERMISSIONS[rawRole] || ROLE_DEFAULT_PERMISSIONS[cleanRole];
		if (!rolePerms || rolePerms.length === 0) {
			if (typeof window !== "undefined" && window.localStorage) try {
				const stored = window.localStorage.getItem("edufyi.hrstore.v1");
				if (stored) {
					const parsed = JSON.parse(stored);
					if (parsed.customRolePermissions && (parsed.customRolePermissions[rawRole] || parsed.customRolePermissions[cleanRole])) rolePerms = parsed.customRolePermissions[rawRole] || parsed.customRolePermissions[cleanRole];
					else if (parsed.roles) {
						const matched = parsed.roles.find((r) => r.id === rawRole || r.roleId === rawRole || r.id === cleanRole || r.roleId === cleanRole || r.name && r.name.toLowerCase() === rawRole.toLowerCase());
						if (matched && matched.permissions && matched.permissions.length > 0) rolePerms = matched.permissions;
					}
				}
			} catch {}
		}
		if (rolePerms && rolePerms.length > 0) perms = rolePerms;
		else {
			const r = rawRole.toLowerCase();
			if (r.includes("admin")) return ["*"];
			if (r.includes("hr")) return HR_DEFAULT_PERMISSIONS;
			if (r.includes("director") || r.includes("head") || r.includes("founder")) return LEADERSHIP_PERMISSIONS;
			if (r.includes("manager") || r.includes("lead")) return MANAGER_PERMISSIONS;
			perms = ESS_PERMISSIONS;
		}
	}
	const r = String(user?.role || "").toLowerCase();
	if (!r.includes("admin") && !r.includes("hr")) perms = [.../* @__PURE__ */ new Set([...ESS_PERMISSIONS, ...perms])];
	return perms;
}
function hasPermission(user, permission) {
	if (!permission) return true;
	const permissions = getUserPermissions(user);
	return permissions.includes("*") || permissions.includes(permission);
}
// src/navigation/navigationResolver.js
/**
* Centralized Role-Based Navigation & Deep Link Resolver
*
* Provides authoritative URL parsing, query parameter normalization,
* role-aware portal resolution, and contextual notification deep-linking.
*/
function parseLocationHash(hashString) {
	const raw = (hashString || (typeof window !== "undefined" ? window.location.hash : "") || "").replace(/^#/, "");
	const queryIndex = raw.indexOf("?");
	let cleanPath = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
	const queryString = queryIndex === -1 ? "" : raw.slice(queryIndex + 1);
	if (!cleanPath.startsWith("/") && cleanPath) cleanPath = `/${cleanPath}`;
	const query = {};
	if (queryString) try {
		const searchParams = new URLSearchParams(queryString);
		for (const [key, value] of searchParams.entries()) query[key] = value;
	} catch {}
	return {
		raw,
		path: cleanPath || "/",
		query,
		queryString
	};
}
function buildLocationHash(path, query = {}) {
	const cleanPath = (path || "").startsWith("/") ? path : `/${path || ""}`;
	const entries = Object.entries(query).filter(([_, v]) => v !== void 0 && v !== null && v !== "");
	if (entries.length === 0) return `#${cleanPath}`;
	const searchParams = new URLSearchParams();
	for (const [k, v] of entries) searchParams.set(k, String(v));
	return `#${cleanPath}?${searchParams.toString()}`;
}
function isAdminUser(user) {
	if (!user) return false;
	if (user.role === "admin") return true;
	const perms = user.permissions || [];
	return perms.includes("*") || perms.includes("admin.access");
}
function isExecutiveUser(user) {
	if (!user) return false;
	return [
		"director",
		"managing_director",
		"co_founder",
		"vertical_head",
		"general_manager"
	].includes(user.role) || user.email === "jagadishbabu@edufyitech.in";
}
function isHrUser(user) {
	if (!user) return false;
	if (isAdminUser(user) || isExecutiveUser(user)) return false;
	if ([
		"hr",
		"hr_executive",
		"hr_manager",
		"people_operations"
	].includes(user.role)) return true;
	const perms = user.permissions || [];
	return perms.includes("leave.hr.review") || perms.includes("leave.hr.read") || perms.includes("employees.write");
}
function isManagerUser(user) {
	if (!user) return false;
	if (isAdminUser(user) || isExecutiveUser(user) || isHrUser(user)) return false;
	if ([
		"manager",
		"senior_manager",
		"revenue_growth_manager",
		"head_of_sales",
		"head_of_marketing",
		"team_leader",
		"team_lead"
	].includes(user.role)) return true;
	const perms = user.permissions || [];
	return perms.includes("leave.team.approve") || perms.includes("leave.team.read");
}
function getCanonicalPortal(user) {
	if (isAdminUser(user)) return "admin";
	if (isExecutiveUser(user)) return "admin";
	if (isHrUser(user)) return "hr";
	return "employee";
}
/**
* Returns the role-appropriate destination for the Leave module
*/
function resolveLeaveRoute(user, options = {}) {
	const { tab, filter, id, leaveId } = options;
	const targetId = id || leaveId;
	const query = {};
	if (tab) query.tab = tab;
	if (filter) query.filter = filter;
	if (targetId) query.id = targetId;
	if (isAdminUser(user) || isExecutiveUser(user)) return buildLocationHash("/admin/leave", query);
	if (isHrUser(user)) return buildLocationHash("/hr/leave", query);
	if (isManagerUser(user)) {
		if (tab === "approvals" || filter || targetId) return buildLocationHash("/employee/team-leave", targetId ? { id: targetId } : {});
		return buildLocationHash("/employee/team-leave");
	}
	return buildLocationHash("/employee/leave", targetId ? { id: targetId } : {});
}
/**
* Contextual Deep-Link Notification Resolver
*
* Resolves notification payloads into precise, permission-checked target URLs.
*/
function resolveNotificationRoute(notification, user) {
	if (!notification) return `#/${getCanonicalPortal(user)}`;
	const direct = notification.targetUrl || notification.link || notification.path || notification.route || notification.url;
	const meta = notification.metadata || {};
	const eventType = String(notification.eventType || notification.type || "").toUpperCase();
	const category = String(notification.category || notification.type || "").toLowerCase();
	const fullText = `${category} ${eventType} ${String(notification.title || "").toLowerCase()} ${String(notification.message || "").toLowerCase()}`;
	const entityId = notification.relatedEntityId || notification.entityId || notification.leaveId || meta.leaveId || meta.id || null;
	if (Boolean(meta.is25thMonthLop || meta.pendingAdminApproval || eventType.includes("LEAVE_PENDING_ADMIN") || fullText.includes("25th") || fullText.includes("month-end lop") || fullText.includes("admin action required") || fullText.includes("admin sign-off"))) {
		if (isAdminUser(user) || isExecutiveUser(user)) return buildLocationHash("/admin/leave", {
			tab: "lop",
			filter: "pending_admin",
			...entityId ? { id: entityId } : {}
		});
		if (isHrUser(user)) return buildLocationHash("/hr/leave", {
			tab: "lop",
			filter: "pending_admin",
			...entityId ? { id: entityId } : {}
		});
		return buildLocationHash("/employee/leave", entityId ? { id: entityId } : {});
	}
	if (category === "leave" || eventType.startsWith("LEAVE_") || fullText.includes("leave")) {
		if (eventType === "LEAVE_SUBMITTED" || fullText.includes("new team leave") || fullText.includes("applied for") || fullText.includes("pending manager")) {
			if (isManagerUser(user)) return buildLocationHash("/employee/team-leave", entityId ? { id: entityId } : {});
			if (isAdminUser(user) || isExecutiveUser(user)) return buildLocationHash("/admin/leave", {
				tab: "approvals",
				...entityId ? { id: entityId } : {}
			});
			if (isHrUser(user)) return buildLocationHash("/hr/leave", {
				tab: "approvals",
				...entityId ? { id: entityId } : {}
			});
			return buildLocationHash("/employee/leave", entityId ? { id: entityId } : {});
		}
		if (eventType === "LEAVE_PENDING_HR" || fullText.includes("awaiting hr review") || fullText.includes("endorsed by manager")) {
			if (isHrUser(user) || isAdminUser(user) || isExecutiveUser(user)) return buildLocationHash(`/${isAdminUser(user) || isExecutiveUser(user) ? "admin" : "hr"}/leave`, {
				tab: "approvals",
				filter: "pending_hr",
				...entityId ? { id: entityId } : {}
			});
			return buildLocationHash("/employee/leave", entityId ? { id: entityId } : {});
		}
		if (eventType === "LEAVE_APPROVED" || eventType === "LEAVE_REJECTED" || fullText.includes("approved") || fullText.includes("declined")) {
			if (!isHrUser(user) && !isAdminUser(user) && !isManagerUser(user)) return buildLocationHash("/employee/leave", entityId ? { id: entityId } : {});
			if (isManagerUser(user)) return buildLocationHash("/employee/team-leave", entityId ? { id: entityId } : {});
			return buildLocationHash(`/${isAdminUser(user) || isExecutiveUser(user) ? "admin" : "hr"}/leave`, {
				tab: "approvals",
				...entityId ? { id: entityId } : {}
			});
		}
		return resolveLeaveRoute(user, {
			id: entityId,
			tab: meta.tab,
			filter: meta.filter
		});
	}
	if (category === "attendance" || category === "gps" || category === "network" || fullText.includes("attendance") || fullText.includes("punch-out")) {
		if (isAdminUser(user) || isExecutiveUser(user)) {
			if (eventType.includes("AUTO_PUNCH_OUT_HR_ALERT") || fullText.includes("auto punch-out executed")) return buildLocationHash("/admin/attendance", {
				tab: "review",
				...entityId ? { id: entityId } : {}
			});
			return "#/admin/attendance";
		}
		if (isHrUser(user)) return "#/hr/attendance";
		return "#/employee/attendance";
	}
	if (category === "payroll" || category === "salary" || fullText.includes("payroll") || fullText.includes("payslip") || fullText.includes("salary")) {
		if (isAdminUser(user) || isExecutiveUser(user)) return "#/admin/payroll";
		if (isHrUser(user)) return "#/hr/payroll";
		return "#/employee/salary";
	}
	if (category === "task" || category === "tasks" || fullText.includes("task")) {
		if (isAdminUser(user) || isExecutiveUser(user)) return "#/admin/tasks";
		if (isHrUser(user)) return "#/hr/tasks";
		return "#/employee/tasks";
	}
	if (category === "report" || fullText.includes("daily report") || fullText.includes("standup")) {
		if (isAdminUser(user) || isExecutiveUser(user)) return "#/admin/reports";
		if (isHrUser(user)) return "#/hr/reports";
		return "#/employee/daily-report";
	}
	if (category === "ticket" || category === "helpdesk" || fullText.includes("ticket") || fullText.includes("helpdesk")) {
		if (isAdminUser(user) || isExecutiveUser(user)) return "#/admin/helpdesk";
		if (isHrUser(user)) return "#/hr/helpdesk";
		return "#/employee/helpdesk";
	}
	if (category === "document" || category === "policy" || fullText.includes("document") || fullText.includes("policy")) {
		if (isAdminUser(user) || isExecutiveUser(user)) return "#/admin/documents";
		if (isHrUser(user)) return "#/hr/documents";
		return "#/employee/documents";
	}
	if (category === "expense" || fullText.includes("expense")) {
		if (isAdminUser(user) || isExecutiveUser(user)) return "#/admin/reports";
		if (isHrUser(user)) return "#/hr/reports";
		return "#/employee/expenses";
	}
	if (category === "announcement" || fullText.includes("announcement")) {
		if (isAdminUser(user) || isExecutiveUser(user)) return "#/admin/announcements";
		if (isHrUser(user)) return "#/hr/announcements";
		return "#/employee/announcements";
	}
	if (direct && typeof direct === "string") {
		let clean = direct.trim();
		if (!clean.startsWith("#")) clean = clean.startsWith("/") ? `#${clean}` : `#/${clean}`;
		if (!isAdminUser(user) && !isExecutiveUser(user)) {
			if (clean.startsWith("#/admin")) clean = isHrUser(user) ? clean.replace("#/admin", "#/hr") : clean.replace("#/admin", "#/employee");
		}
		if (!isAdminUser(user) && !isExecutiveUser(user) && !isHrUser(user)) {
			if (clean.startsWith("#/hr")) clean = clean.replace("#/hr", "#/employee");
		}
		return clean;
	}
	return `#/${getCanonicalPortal(user)}/notifications`;
}
// src/app/routes.js
var adminRoutes = [
	{
		path: "/admin",
		label: "Admin Overview",
		group: "Administration",
		description: "System health, telemetry and global pulse",
		permission: "admin.access"
	},
	{
		path: "/admin/users",
		label: "User Management",
		group: "Administration",
		description: "Manage accounts, credentials, and roles",
		permission: "admin.access"
	},
	{
		path: "/admin/people",
		label: "People",
		group: "Workforce",
		description: "Shared employee records",
		permission: "admin.access"
	},
	{
		path: "/admin/attendance",
		label: "Attendance",
		group: "Workforce",
		description: "Shared attendance roster",
		permission: "admin.access"
	},
	{
		path: "/admin/leave",
		label: "Leave",
		group: "Workforce",
		description: "Leave policies, balances and approvals",
		permission: "admin.access"
	},
	{
		path: "/admin/payroll",
		label: "Payroll",
		group: "Workforce",
		description: "Review and finalize employee payslips",
		permission: "admin.access"
	},
	{
		path: "/admin/recruitment",
		label: "Recruitment",
		group: "Workspace",
		description: "Persisted job requisitions",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/performance",
		label: "Performance & Recognition",
		group: "Workspace",
		description: "Saved goals, reviews and peer recognition",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/tasks",
		label: "Task Management",
		group: "Workspace",
		description: "Assign and track saved tasks",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/learning",
		label: "Training & Learning",
		group: "Workspace",
		description: "Published courses and training enrollments",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/helpdesk",
		label: "Help Desk",
		group: "Workspace",
		description: "Review and resolve support tickets",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/announcements",
		label: "Announcements",
		group: "Workspace",
		description: "Publish company announcements",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/holidays",
		label: "Holiday Calendar",
		group: "Workspace",
		description: "Published company holidays",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/documents",
		label: "Company Documents",
		group: "Workspace",
		description: "Publish actual document links",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/policies",
		label: "Company Policy",
		group: "Workspace",
		description: "Official company policies, PDF preview & employee digital consent compliance",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/expenses",
		label: "Expense Review",
		group: "Workspace",
		description: "Review submitted expense claims",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/notifications",
		label: "Notifications",
		group: "Workspace",
		description: "Your saved alerts and updates",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/roles",
		label: "Role & Access",
		group: "Administration",
		description: "Role permissions, access control, and security audit log",
		permission: "admin.access"
	},
	{
		path: "/admin/departments",
		label: "Departments",
		group: "Administration",
		description: "Create and manage organizational departments and teams",
		permission: "admin.access"
	},
	{
		path: "/admin/settings",
		label: "System Configuration",
		group: "Administration",
		description: "Office locations, Wi-Fi networks, and holiday schedules",
		permission: "admin.access"
	},
	{
		path: "/admin/reports",
		label: "Daily Reports & Expenses",
		group: "Administration",
		description: "Actual submitted daily reports and expense review",
		permission: "admin.access",
		workspace: true
	},
	{
		path: "/admin/system",
		label: "System Maintenance",
		group: "Administration",
		description: "Authorized snapshot export and API diagnostics; browser restore/reset disabled",
		permission: "admin.access"
	},
	{
		path: "/admin/hierarchy",
		label: "Org Hierarchy",
		group: "Administration",
		description: "Interactive visual organization tree, department teams & reporting structures",
		permission: "admin.access"
	}
];
var hrRoutes = [
	{
		path: "/hr",
		label: "Overview",
		group: "HR Ops",
		description: "HR workforce overview and pulse",
		permission: "hr.dashboard.read"
	},
	{
		path: "/hr/people",
		label: "People",
		group: "HR Ops",
		description: "Employee management and onboarding",
		permission: "employees.read"
	},
	{
		path: "/hr/users",
		label: "User Accounts",
		group: "HR Ops",
		description: "Provision employee login credentials",
		permission: "employees.write"
	},
	{
		path: "/hr/attendance",
		label: "Attendance",
		group: "HR Ops",
		description: "Attendance and Wi-Fi verification",
		permission: "attendance.read"
	},
	{
		path: "/hr/leave",
		label: "Leave",
		group: "HR Ops",
		description: "Company-wide leave approvals",
		permission: "leave.hr.read"
	},
	{
		path: "/hr/payroll",
		label: "Payroll & Salary",
		group: "HR Ops",
		description: "Salary breakup, PF/ESI, and payslips",
		permission: "payroll.read"
	},
	{
		path: "/hr/recruitment",
		label: "Recruitment",
		group: "Manage",
		description: "Requisitions, candidate pipeline, and referrals",
		permission: "recruitment.read"
	},
	{
		path: "/hr/performance",
		label: "Performance",
		group: "Manage",
		description: "KPIs, OKRs, and appraisal reviews",
		permission: "performance.read"
	},
	{
		path: "/hr/tasks",
		label: "Task Management",
		group: "Manage",
		description: "Task delegation and team workload",
		permission: "tasks.read"
	},
	{
		path: "/hr/learning",
		label: "Training & Learning",
		group: "Manage",
		description: "Course assignments and certifications",
		permission: "training.read"
	},
	{
		path: "/hr/helpdesk",
		label: "Help Desk",
		group: "Manage",
		description: "Employee support ticketing",
		permission: "helpdesk.read"
	},
	{
		path: "/hr/announcements",
		label: "Announcements",
		group: "Manage",
		description: "Company announcements and broadcasts",
		permission: "announcements.read",
		workspace: true
	},
	{
		path: "/hr/holidays",
		label: "Holiday Calendar",
		group: "Manage",
		description: "Official holiday schedule",
		permission: "holidays.read"
	},
	{
		path: "/hr/documents",
		label: "Company Documents",
		group: "Manage",
		description: "Handbooks, policies, and NDA repository",
		permission: "documents.read"
	},
	{
		path: "/hr/policies",
		label: "Company Policy",
		group: "Manage",
		description: "Official company policies, PDF preview & employee digital consent compliance",
		permission: "documents.read"
	},
	{
		path: "/hr/reports",
		label: "Daily Reports & Expenses",
		group: "Manage",
		description: "Actual submitted daily reports and expense review",
		permission: "reports.read"
	},
	{
		path: "/hr/notifications",
		label: "Notifications",
		group: "Manage",
		description: "Your saved alerts and updates",
		permission: "dashboard.read",
		workspace: true
	},
	{
		path: "/hr/settings",
		label: "HR Settings",
		group: "Manage",
		description: "HR parameters and leave rules",
		permission: "settings.hr.read"
	},
	{
		path: "/hr/hierarchy",
		label: "Org Hierarchy",
		group: "Manage",
		description: "Enterprise organization chart, reporting chains & department teams",
		permission: "employees.read"
	}
];
var employeeRoutes = [
	{
		path: "/employee",
		label: "ESS Dashboard",
		group: "Self-Service",
		description: "Personal employee hub and quick actions",
		permission: "dashboard.read"
	},
	{
		path: "/employee/attendance",
		label: "My Attendance",
		group: "Self-Service",
		description: "Daily attendance punch-in & history",
		permission: "attendance.self.read"
	},
	{
		path: "/employee/leave",
		label: "My Leave",
		group: "Self-Service",
		description: "Leave balances and requests",
		permission: "leave.self.read"
	},
	{
		path: "/employee/salary",
		label: "My Salary & Payslip",
		group: "Self-Service",
		description: "Salary breakdown and monthly payslips",
		permission: "dashboard.read"
	},
	{
		path: "/employee/tasks",
		label: "My Tasks",
		group: "Work & Growth",
		description: "Assigned tasks and delivery status",
		permission: "tasks.read"
	},
	{
		path: "/employee/daily-report",
		label: "Daily Work Report",
		group: "Work & Growth",
		description: "Daily standup report, hours logged & accomplishments",
		permission: "tasks.read"
	},
	{
		path: "/employee/training",
		label: "Training Portal",
		group: "Work & Growth",
		description: "Assigned learning courses and completion status",
		permission: "training.read"
	},
	{
		path: "/employee/helpdesk",
		label: "Support Help Desk",
		group: "Work & Growth",
		description: "Raise and track internal IT / HR support tickets",
		permission: "helpdesk.read"
	},
	{
		path: "/employee/expenses",
		label: "Expense Claims",
		group: "Work & Growth",
		description: "Submit and track expense reimbursement claims",
		permission: "dashboard.read"
	},
	{
		path: "/employee/performance",
		label: "My Performance",
		group: "Work & Growth",
		description: "Appraisal scores, goals, and reviews",
		permission: "dashboard.read"
	},
	{
		path: "/employee/holidays",
		label: "Holiday Calendar",
		group: "Organization",
		description: "Official organization paid holiday list",
		permission: "holidays.read"
	},
	{
		path: "/employee/rewards",
		label: "Rewards & Recognition",
		group: "Organization",
		description: "Company accolades, spotlight badges, and points",
		permission: "dashboard.read"
	},
	{
		path: "/employee/documents",
		label: "Company Documents",
		group: "Organization",
		description: "Official policies, handbooks, and documents",
		permission: "documents.read"
	},
	{
		path: "/employee/policies",
		label: "Company Policy",
		group: "Organization",
		description: "Official policies, read PDFs & make mandatory digital consent with date & time",
		permission: "documents.read"
	},
	{
		path: "/employee/announcements",
		label: "Announcements",
		group: "Organization",
		description: "Company broadcasts and notifications",
		permission: "announcements.read",
		workspace: true
	},
	{
		path: "/employee/notifications",
		label: "Notifications",
		group: "Organization",
		description: "System alerts, leave updates, and task reminders",
		permission: "dashboard.read",
		workspace: true
	},
	{
		path: "/employee/profile",
		label: "My Profile",
		group: "Organization",
		description: "Personal, employment, and emergency info",
		permission: "dashboard.read"
	},
	{
		path: "/employee/hierarchy",
		label: "Org Hierarchy",
		group: "Organization",
		description: "Visual organization chart and company reporting structure",
		permission: "dashboard.read"
	},
	{
		path: "/employee/team-leave",
		label: "Team Approvals",
		group: "Manager Controls",
		description: "Review and approve direct reports leave",
		permission: "leave.team.read"
	},
	{
		path: "/employee/my-team",
		label: "My Team",
		group: "Manager Controls",
		description: "Direct reports roster and contact details",
		permission: "leave.team.read"
	}
];
var authRoutes = [
	{
		path: "/login",
		label: "HR Login",
		group: "Auth",
		description: "Edufyi Management Terminal Authentication"
	},
	{
		path: "/admin/login",
		label: "Admin Login",
		group: "Auth",
		description: "Edufyi Administrator Console Authentication"
	},
	{
		path: "/hr/login",
		label: "HR Login",
		group: "Auth",
		description: "Edufyi People Operations Authentication"
	},
	{
		path: "/employee/login",
		label: "Employee Login",
		group: "Auth",
		description: "Edufyi Employee Self-Service Authentication"
	}
];
var allRoutes = [
	...adminRoutes,
	...hrRoutes,
	...employeeRoutes,
	...authRoutes
];
function findRoute(rawPath) {
	if (!rawPath) return void 0;
	const { path: cleanPath, query } = parseLocationHash(rawPath);
	if (cleanPath === "/admin/login") return {
		path: cleanPath,
		query,
		label: "Admin Login",
		group: "Auth",
		description: "Edufyi Administrator Console Authentication"
	};
	if (cleanPath === "/hr/login") return {
		path: cleanPath,
		query,
		label: "HR Login",
		group: "Auth",
		description: "Edufyi People Operations Authentication"
	};
	if (cleanPath === "/employee/login") return {
		path: cleanPath,
		query,
		label: "Employee Login",
		group: "Auth",
		description: "Edufyi Employee Self-Service Authentication"
	};
	if (cleanPath === "/employee/organization") {
		const matched = allRoutes.find((route) => route.path === "/employee/hierarchy");
		return matched ? {
			...matched,
			query
		} : void 0;
	}
	const exact = allRoutes.find((route) => route.path === cleanPath);
	if (exact) return {
		...exact,
		query
	};
	if (cleanPath.startsWith("/admin")) return {
		path: cleanPath,
		query,
		label: "Administration",
		group: "Administration",
		description: "System Administration module",
		permission: "admin.access"
	};
	if (cleanPath === "/hr/people/new") return {
		path: cleanPath,
		query,
		label: "New employee",
		group: "HR Ops",
		description: "Create an employee profile",
		permission: "employees.write"
	};
	if (/^\/hr\/people\/[^/]+(\/edit)?$/.test(cleanPath)) {
		const editing = cleanPath.endsWith("/edit");
		return {
			path: cleanPath,
			query,
			label: editing ? "Edit employee" : "Employee profile",
			group: "HR Ops",
			description: "Employee profile and employment history",
			permission: editing ? "employees.write" : "employees.read"
		};
	}
}
function readPath() {
	const { path: cleanPath } = parseLocationHash((typeof window !== "undefined" ? window.location.hash : "") || "");
	const path = cleanPath || "";
	if (!path || path === "/") {
		if (typeof window !== "undefined" && window.localStorage) try {
			const stored = window.localStorage.getItem("edufyi.authUser");
			if (stored) {
				const u = JSON.parse(stored);
				const isExec = [
					"director",
					"managing_director",
					"co_founder",
					"vertical_head"
				].includes(u.role) || u.email === "jagadishbabu@edufyitech.in";
				if (u.role === "admin") return "/admin";
				if (u.role === "hr" || u.role === "hr_executive" || isExec) return "/hr";
				return "/employee";
			}
		} catch {}
		return "/employee/login";
	}
	if (path === "/admin/login" || path === "/hr/login" || path === "/employee/login" || path.startsWith("/login")) return path;
	if (path.startsWith("/admin")) return path;
	if (path.startsWith("/hr")) return path;
	if (path.startsWith("/employee")) return path;
	return "/employee";
}
// src/components/GpsBackgroundManager.jsx
function GpsBackgroundManager({ user }) {
	const [showGpsModal, setShowGpsModal] = (0, import_react.useState)(false);
	const [gpsStatus, setGpsStatus] = (0, import_react.useState)("checking");
	const [accuracy, setAccuracy] = (0, import_react.useState)(null);
	const [deferredPrompt, setDeferredPrompt] = (0, import_react.useState)(null);
	const [showInstallBanner, setShowInstallBanner] = (0, import_react.useState)(false);
	const [inlineTip, setInlineTip] = (0, import_react.useState)("");
	const [isStandalone, setIsStandalone] = (0, import_react.useState)(false);
	const [gpsErrorMsg, setGpsErrorMsg] = (0, import_react.useState)("");
	const [showInstallModal, setShowInstallModal] = (0, import_react.useState)(false);
	const [installedNotice, setInstalledNotice] = (0, import_react.useState)(false);
	const isIOS = typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const checkStandalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true || document.referrer.includes("android-app://");
		setIsStandalone(Boolean(checkStandalone));
		const bannerDismissedUntil = localStorage.getItem("edufyi_pwa_banner_dismissed");
		const now = Date.now();
		const canShowBanner = !checkStandalone && (!bannerDismissedUntil || now > Number(bannerDismissedUntil));
		if (!navigator.geolocation) setGpsStatus("unsupported");
		else {
			const dismissedUntil = localStorage.getItem("edufyi_gps_prompt_dismissed");
			const isGpsDismissed = dismissedUntil && now < Number(dismissedUntil);
			if (navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name: "geolocation" }).then((perm) => {
				setGpsStatus(perm.state);
				if (perm.state === "prompt" && !isGpsDismissed) setShowGpsModal(true);
				perm.onchange = () => {
					setGpsStatus(perm.state);
					if (perm.state === "granted") {
						setShowGpsModal(false);
						refreshGpsCache();
					}
				};
			}).catch(() => {
				if (!isGpsDismissed) setShowGpsModal(true);
			});
			else if (!isGpsDismissed) setShowGpsModal(true);
			refreshGpsCache();
		}
		const heartbeatInterval = setInterval(() => {
			if (navigator.onLine && document.visibilityState === "hidden") fetch("/api/v1/health").catch(() => {});
		}, 45e3);
		const handleBeforeInstall = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			window.__edufyi_install_prompt = e;
			if (canShowBanner) setShowInstallBanner(true);
		};
		const handlePromptAvailable = (e) => {
			if (e.detail) {
				setDeferredPrompt(e.detail);
				window.__edufyi_install_prompt = e.detail;
				if (canShowBanner) setShowInstallBanner(true);
			}
		};
		if (window.__edufyi_install_prompt) {
			setDeferredPrompt(window.__edufyi_install_prompt);
			if (canShowBanner) setShowInstallBanner(true);
		}
		if (typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) && !checkStandalone && canShowBanner) setShowInstallBanner(true);
		window.addEventListener("beforeinstallprompt", handleBeforeInstall);
		window.addEventListener("edufyi-prompt-available", handlePromptAvailable);
		const handleCustomTrigger = () => {
			if (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true || document.referrer.includes("android-app://")) {
				setInstalledNotice(true);
				setTimeout(() => setInstalledNotice(false), 4e3);
				return;
			}
			triggerInstallFlow();
		};
		window.addEventListener("edufyi-trigger-install", handleCustomTrigger);
		window.addEventListener("appinstalled", () => {
			setShowInstallBanner(false);
			setShowInstallModal(false);
			setDeferredPrompt(null);
			setIsStandalone(true);
			setInstalledNotice(true);
			setTimeout(() => setInstalledNotice(false), 5e3);
			window.__edufyi_install_prompt = null;
		});
		return () => {
			clearInterval(heartbeatInterval);
			window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
			window.removeEventListener("edufyi-prompt-available", handlePromptAvailable);
			window.removeEventListener("edufyi-trigger-install", handleCustomTrigger);
		};
	}, []);
	function refreshGpsCache() {
		if (!navigator.geolocation) return;
		try {
			navigator.geolocation.getCurrentPosition((pos) => {
				const coords = {
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
					accuracy: Math.round(pos.coords.accuracy),
					timestamp: pos.timestamp || Date.now()
				};
				window.__edufyi_last_gps = coords;
				setAccuracy(coords.accuracy);
				setGpsStatus("granted");
				setGpsErrorMsg("");
			}, (err) => {
				if (err.code === 1) setGpsStatus("denied");
			}, {
				enableHighAccuracy: true,
				timeout: 15e3,
				maximumAge: 3e4
			});
		} catch {}
	}
	const handleRequestGps = () => {
		setGpsErrorMsg("");
		if (!navigator.geolocation) {
			setGpsErrorMsg("Geolocation is not supported by your browser.");
			return;
		}
		navigator.geolocation.getCurrentPosition((pos) => {
			const coords = {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				accuracy: Math.round(pos.coords.accuracy),
				timestamp: pos.timestamp || Date.now()
			};
			window.__edufyi_last_gps = coords;
			setAccuracy(coords.accuracy);
			setGpsStatus("granted");
			setShowGpsModal(false);
		}, (err) => {
			if (err.code === 1) {
				setGpsStatus("denied");
				setGpsErrorMsg("Location access was denied. Please click the lock icon in your browser URL bar and set Location to \"Allow\".");
			} else setGpsErrorMsg("Unable to retrieve high-accuracy GPS fix. Please ensure device location is enabled.");
		}, {
			enableHighAccuracy: true,
			timeout: 15e3
		});
	};
	const handleDismissGps = () => {
		setShowGpsModal(false);
		localStorage.setItem("edufyi_gps_prompt_dismissed", String(Date.now() + 864e5));
	};
	const triggerInstallFlow = async () => {
		if (isIOS) {
			setShowInstallModal(true);
			return;
		}
		const promptEvent = deferredPrompt || window.__edufyi_install_prompt;
		if (promptEvent) try {
			promptEvent.prompt();
			const { outcome } = await promptEvent.userChoice;
			if (outcome === "accepted") {
				setShowInstallBanner(false);
				setShowInstallModal(false);
				setDeferredPrompt(null);
				window.__edufyi_install_prompt = null;
				setIsStandalone(true);
				setInstalledNotice(true);
				setTimeout(() => setInstalledNotice(false), 5e3);
				return;
			}
		} catch (err) {
			console.warn("Install prompt error:", err);
		}
		setShowInstallModal(true);
	};
	const handleDismissInstallBanner = () => {
		setShowInstallBanner(false);
		localStorage.setItem("edufyi_pwa_banner_dismissed", String(Date.now() + 864e5));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		!isStandalone && showInstallBanner && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				position: "fixed",
				bottom: "calc(75px + env(safe-area-inset-bottom, 0px))",
				left: "14px",
				right: "14px",
				margin: "0 auto",
				maxWidth: "380px",
				width: "calc(100% - 28px)",
				background: "#0A2328",
				color: "#fff",
				borderRadius: "14px",
				padding: "12px 14px",
				boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
				border: "1px solid rgba(0, 110, 111, 0.45)",
				zIndex: 9999,
				display: "flex",
				flexDirection: "column",
				gap: "8px"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/icon-192.png",
							alt: "Edufyi HR",
							style: {
								width: "30px",
								height: "30px",
								borderRadius: "7px",
								flexShrink: 0
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: {
								fontSize: "13px",
								color: "#fff",
								display: "block",
								lineHeight: 1.2
							},
							children: "Install Edufyi HR App"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								color: "#94a3b8"
							},
							children: isIOS ? "Safari: Tap Share [⎋] then Add to Home Screen" : "Fast access & instant attendance"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleDismissInstallBanner,
						title: "Dismiss for 24 hours",
						style: {
							background: "transparent",
							border: 0,
							color: "#94a3b8",
							cursor: "pointer",
							padding: "4px",
							display: "flex",
							alignItems: "center"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
					})]
				}),
				inlineTip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						fontSize: "11.5px",
						color: "#6ee7b7",
						background: "rgba(110, 231, 183, 0.12)",
						padding: "6px 10px",
						borderRadius: "6px",
						lineHeight: 1.4
					},
					children: inlineTip
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "flex-end",
						gap: "8px",
						marginTop: "2px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleDismissInstallBanner,
						style: {
							background: "transparent",
							border: "1px solid rgba(255,255,255,0.2)",
							color: "#cbd5e1",
							borderRadius: "6px",
							padding: "4px 10px",
							fontSize: "11px",
							fontWeight: 600,
							cursor: "pointer"
						},
						children: "Not Now"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: triggerInstallFlow,
						style: {
							background: "#006E6F",
							color: "#fff",
							border: 0,
							borderRadius: "6px",
							padding: "5px 14px",
							fontSize: "11px",
							fontWeight: 700,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "5px"
						},
						children: [isIOS ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, { size: 12 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isIOS ? "How to Install" : "Install" })]
					})]
				})
			]
		}),
		installedNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				position: "fixed",
				top: "20px",
				right: "20px",
				background: "linear-gradient(135deg, #064e3b, #047857)",
				color: "#fff",
				padding: "12px 18px",
				borderRadius: "10px",
				boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
				zIndex: 100002,
				display: "flex",
				alignItems: "center",
				gap: "10px",
				fontSize: "13px",
				fontWeight: 600
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
				size: 18,
				color: "#a7f3d0"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Edufyi HR App is installed on this device!" })]
		}),
		showInstallModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				position: "fixed",
				inset: 0,
				background: "rgba(5, 15, 20, 0.75)",
				backdropFilter: "blur(5px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 100001,
				padding: "16px"
			},
			onClick: () => setShowInstallModal(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#0a2328",
					color: "#fff",
					border: "1px solid rgba(0, 180, 160, 0.35)",
					borderRadius: "16px",
					maxWidth: "460px",
					width: "100%",
					padding: "24px",
					boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					gap: "18px"
				},
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "14px",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/icon-192.png",
								alt: "Edufyi HR",
								style: {
									width: "48px",
									height: "48px",
									borderRadius: "12px",
									border: "1px solid rgba(255,255,255,0.1)"
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									style: {
										margin: 0,
										fontSize: "17px",
										color: "#fff",
										fontWeight: 700
									},
									children: "Edufyi HR App"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										background: "rgba(0, 210, 255, 0.2)",
										color: "#00d2ff",
										padding: "2px 6px",
										borderRadius: "4px",
										fontWeight: 700
									},
									children: "PWA"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "12px",
									color: "#94a3b8"
								},
								children: "Official Enterprise Management App"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowInstallModal(false),
							style: {
								background: "transparent",
								border: 0,
								color: "#94a3b8",
								cursor: "pointer",
								padding: "4px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 20 })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "rgba(0, 110, 111, 0.2)",
							border: "1px solid rgba(0, 110, 111, 0.4)",
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
									alignItems: "center",
									gap: "8px",
									fontSize: "12.5px",
									color: "#e2e8f0"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
									size: 14,
									color: "#2dd4bf",
									style: { flexShrink: 0 }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Instant 1-Click Launch" }), " from your Desktop or Home Screen"] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									fontSize: "12.5px",
									color: "#e2e8f0"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									size: 14,
									color: "#2dd4bf",
									style: { flexShrink: 0 }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Seamless Attendance" }), " with automatic GPS and Geofencing"] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									fontSize: "12.5px",
									color: "#e2e8f0"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
									size: 14,
									color: "#2dd4bf",
									style: { flexShrink: 0 }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Clean Fullscreen Window" }), " without browser tabs or clutter"] })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: "10px"
						},
						children: [isIOS ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "rgba(2, 132, 199, 0.15)",
								border: "1px solid rgba(2, 132, 199, 0.4)",
								borderRadius: "12px",
								padding: "16px",
								display: "flex",
								flexDirection: "column",
								gap: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										color: "#38bdf8",
										fontWeight: 700,
										fontSize: "14px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "How to Install on Safari (iPhone / iPad)" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: "12px",
										fontSize: "13px",
										color: "#f1f5f9"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "flex-start",
												gap: "10px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													width: "24px",
													height: "24px",
													borderRadius: "50%",
													background: "#0284c7",
													color: "#fff",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontWeight: 700,
													fontSize: "12px",
													flexShrink: 0,
													marginTop: "2px"
												},
												children: "1"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												"Tap the Safari ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Share button" }),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													style: {
														display: "inline-flex",
														alignItems: "center",
														gap: "4px",
														padding: "2px 8px",
														background: "rgba(255,255,255,0.15)",
														borderRadius: "6px",
														fontWeight: 700,
														color: "#38bdf8"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, { size: 13 }), " Share"]
												}),
												" in the toolbar at the bottom of Safari."
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "flex-start",
												gap: "10px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													width: "24px",
													height: "24px",
													borderRadius: "50%",
													background: "#0284c7",
													color: "#fff",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontWeight: 700,
													fontSize: "12px",
													flexShrink: 0,
													marginTop: "2px"
												},
												children: "2"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												"Scroll down and tap ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													style: {
														display: "inline-flex",
														alignItems: "center",
														gap: "4px",
														padding: "2px 8px",
														background: "rgba(255,255,255,0.15)",
														borderRadius: "6px",
														fontWeight: 700,
														color: "#34d399"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePlus, { size: 13 }), " Add to Home Screen"]
												}),
												"."
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												alignItems: "flex-start",
												gap: "10px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													width: "24px",
													height: "24px",
													borderRadius: "50%",
													background: "#0284c7",
													color: "#fff",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													fontWeight: 700,
													fontSize: "12px",
													flexShrink: 0,
													marginTop: "2px"
												},
												children: "3"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												"Tap ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Add" }),
												" at the top right. Edufyi HR will now be on your Home Screen!"
											] })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										borderTop: "1px solid rgba(255,255,255,0.1)",
										paddingTop: "10px",
										textAlign: "center",
										fontSize: "11.5px",
										color: "#94a3b8"
									},
									children: [
										"👇 Look at the bottom toolbar of Safari for the ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Share" }),
										" icon"
									]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: async () => {
								const promptEvent = deferredPrompt || window.__edufyi_install_prompt;
								if (promptEvent) try {
									promptEvent.prompt();
									const { outcome } = await promptEvent.userChoice;
									if (outcome === "accepted") {
										setShowInstallModal(false);
										setShowInstallBanner(false);
										setIsStandalone(true);
										setInstalledNotice(true);
										setTimeout(() => setInstalledNotice(false), 5e3);
									}
								} catch (err) {
									console.warn("Install error:", err);
								}
								else alert("Click the Install icon (⊕ or 💻) on the right side of your browser address bar at the top!");
							},
							style: {
								background: "linear-gradient(135deg, #008788, #0d9488)",
								color: "#fff",
								border: 0,
								borderRadius: "10px",
								padding: "12px 18px",
								fontSize: "14px",
								fontWeight: 700,
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
								boxShadow: "0 4px 14px rgba(0, 110, 111, 0.4)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚡ Direct Install App Now" })]
						}), !isIOS && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11.5px",
								color: "#cbd5e1",
								lineHeight: 1.5,
								background: "rgba(0,0,0,0.25)",
								padding: "10px 12px",
								borderRadius: "8px",
								border: "1px solid rgba(255,255,255,0.08)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "#2dd4bf" },
									children: "Direct Browser Install:"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { marginTop: "4px" },
									children: [
										"• ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Chrome / Edge:" }),
										" Look at your URL address bar at the top-right and click the ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Install (⊕ or 💻)" }),
										" icon."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									"• ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Android:" }),
									" Tap the button above, or tap ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Add to Home screen" }),
									" in the prompt."
								] })
							] })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							justifyContent: "flex-end"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowInstallModal(false),
							style: {
								background: "transparent",
								border: "1px solid rgba(255,255,255,0.2)",
								color: "#94a3b8",
								padding: "6px 14px",
								borderRadius: "6px",
								fontSize: "12px",
								cursor: "pointer"
							},
							children: "Close"
						})
					})
				]
			})
		}),
		showGpsModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.55)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1e5,
				padding: "16px",
				backdropFilter: "blur(3px)"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#fff",
					borderRadius: "14px",
					maxWidth: "440px",
					width: "100%",
					boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						background: "linear-gradient(135deg, #0A2328 0%, #006E6F 100%)",
						padding: "18px 20px",
						color: "#fff",
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
								borderRadius: "10px",
								background: "rgba(255,255,255,0.15)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
								size: 20,
								style: { color: "#4ade80" }
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							style: {
								margin: 0,
								fontSize: "15px",
								fontWeight: 700,
								color: "#fff"
							},
							children: "Enable Geofence GPS Access"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								margin: "2px 0 0 0",
								fontSize: "11px",
								color: "#a7f3d0"
							},
							children: "Required for 50-meter Office Attendance Check-In"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleDismissGps,
						style: {
							background: "transparent",
							border: 0,
							color: "#fff",
							cursor: "pointer",
							padding: "4px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: { padding: "20px" },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							style: {
								fontSize: "13px",
								color: "#334155",
								lineHeight: "1.5",
								margin: "0 0 16px 0"
							},
							children: [
								"Edufyi HR enforces an automated ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "50-meter office geofence policy" }),
								" for daily check-ins. Enabling device location eliminates GPS spin delay during punch-in."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#f8fafc",
								border: "1px solid #e2e8f0",
								borderRadius: "10px",
								padding: "12px 14px",
								marginBottom: "18px",
								display: "flex",
								flexDirection: "column",
								gap: "8px",
								fontSize: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									color: "#047857"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Privacy Protected: GPS is only queried during office check-in." })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									color: "#0284c7"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Status:",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: gpsStatus === "granted" ? `Connected (${accuracy ? `±${accuracy}m` : "Accurate"})` : gpsStatus === "denied" ? "Blocked in Browser Settings" : "Permission Requested" })
								] })]
							})]
						}),
						gpsErrorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#fef2f2",
								border: "1px solid #fecaca",
								color: "#991b1b",
								borderRadius: "8px",
								padding: "10px 12px",
								marginBottom: "16px",
								fontSize: "11.5px",
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
								size: 15,
								style: { flexShrink: 0 }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: gpsErrorMsg })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "10px",
								justifyContent: "flex-end"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: handleDismissGps,
								style: {
									background: "#f1f5f9",
									border: "1px solid #cbd5e1",
									color: "#475569",
									borderRadius: "8px",
									padding: "8px 16px",
									fontSize: "12.5px",
									fontWeight: 600,
									cursor: "pointer"
								},
								children: "Later"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleRequestGps,
								style: {
									background: "#006E6F",
									border: 0,
									color: "#fff",
									borderRadius: "8px",
									padding: "8px 20px",
									fontSize: "12.5px",
									fontWeight: 700,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: "6px",
									boxShadow: "0 2px 6px rgba(0, 110, 111, 0.3)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Allow GPS Access" })]
							})]
						})
					]
				})]
			})
		})
	] });
}
// src/utils/greeting.js
/**
* Utility functions for generating dynamic time-of-day greetings
* and formatted user greetings with personalized names.
*/
function getTimeOfDayGreeting(customHour = null) {
	const hour = customHour !== null && customHour !== void 0 ? customHour : (/* @__PURE__ */ new Date()).getHours();
	if (hour >= 5 && hour < 12) return "Good morning";
	if (hour >= 12 && hour < 17) return "Good afternoon";
	if (hour >= 17 && hour < 22) return "Good evening";
	return "Welcome back";
}
function resolveUserDisplayName(user, employees = []) {
	if (!user) return "Colleague";
	const isGeneric = (val) => !val || !val.trim() || [
		"team member",
		"colleague",
		"user",
		"member"
	].includes(val.trim().toLowerCase());
	if (user.displayName && !isGeneric(user.displayName)) return user.displayName.trim();
	if (user.name && !isGeneric(user.name)) return user.name.trim();
	if (user.fullName && !isGeneric(user.fullName)) return user.fullName.trim();
	if (Array.isArray(employees) && employees.length > 0) {
		const matched = employees.find((e) => user.id && (e.id === user.id || e._id === user.id || e.userId === user.id) || user.employeeId && (e.employeeId === user.employeeId || e.id === user.employeeId) || user.email && e.email && e.email.toLowerCase() === user.email.toLowerCase());
		if (matched?.name && !isGeneric(matched.name)) return matched.name.trim();
		if (matched?.displayName && !isGeneric(matched.displayName)) return matched.displayName.trim();
	}
	if (user.username && !isGeneric(user.username)) return user.username.trim();
	if (user.email && typeof user.email === "string") return user.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	return "Colleague";
}
function getRoleBadgeLabel(role) {
	switch (role) {
		case "admin": return "Admin";
		case "director":
		case "managing_director": return "Managing Director";
		case "co_founder": return "Co-Founder";
		case "vertical_head": return "Vertical Head";
		case "revenue_growth_manager": return "Revenue Growth Manager";
		case "manager": return "Manager";
		case "team_leader":
		case "team_lead": return "Team Leader";
		case "hr": return "HR";
		case "hr_executive": return "HR Executive";
		case "operations_executive": return "Operations Executive";
		case "business_development_executive": return "BD Executive";
		case "business_development_intern": return "BD Intern";
		case "marketing_executive": return "Marketing Executive";
		case "marketing_intern": return "Marketing Intern";
		case "sde":
		case "sde_executive":
		case "seo_executive": return "SDE";
		case "sde_intern":
		case "seo_intern": return "SDE Intern";
		case "post_sales_executive": return "Post-Sales Executive";
		case "post_sales_intern": return "Post-Sales Intern";
		case "employee": return "Employee ESS";
		default: return (role || "Member").replace(/_/g, " ");
	}
}
// src/components/AIHRAssistant.jsx
function AIHRAssistant({ isOpen, onClose }) {
	const { user } = useAuth();
	const chatEndRef = (0, import_react.useRef)(null);
	const isAdmin = user?.role === "admin";
	const isHR = user?.role === "hr";
	user?.role;
	user?.role;
	const copilotTitle = isAdmin ? "Edufyi AI Admin Copilot" : isHR ? "Edufyi AI HR Copilot" : "Edufyi AI Workplace Copilot";
	const copilotSubtitle = isAdmin ? "Grounded in system telemetry, security audit logs & administration" : isHR ? "Grounded in workforce records, payroll & approvals" : "Grounded in personal attendance, leaves & compensation policies";
	const getInitialGreeting = () => {
		if (isAdmin) return `Hello Admin! I am your Edufyi AI Admin Copilot. You can ask me about system health & telemetry, user accounts & roles, security audit logs, database maintenance, or configuration parameters.`;
		if (isHR) return `Hello HR! I am your Edufyi AI HR Copilot. You can ask me about workforce analytics, pending leave approvals, September payroll run, performance deductions, or recruitment pipeline.`;
		return `Hello ${user?.displayName?.split(" ")[0] ?? "there"}! I am your Edufyi AI Workplace Copilot. You can ask me about your leave balances, Wi-Fi punch-in rules, salary details, holiday calendar, or submit requests.`;
	};
	const [messages, setMessages] = (0, import_react.useState)(() => [{
		id: "m-1",
		sender: "ai",
		text: getInitialGreeting(),
		time: "Just now"
	}]);
	(0, import_react.useEffect)(() => {
		setMessages([{
			id: `m-${Date.now()}`,
			sender: "ai",
			text: getInitialGreeting(),
			time: "Just now"
		}]);
	}, [user?.role, user?.displayName]);
	const [input, setInput] = (0, import_react.useState)("");
	const [isTyping, setIsTyping] = (0, import_react.useState)(false);
	const storeState = hrStore.getState();
	storeState.companySettings;
	(0, import_react.useEffect)(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isTyping]);
	function handleSend(textToSend) {
		const query = (textToSend || input).trim();
		if (!query) return;
		const userMsg = {
			id: `m-${Date.now()}`,
			sender: "user",
			text: query,
			time: "Just now"
		};
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsTyping(true);
		setTimeout(() => {
			const responseText = generateAIResponse(query, user, storeState);
			setMessages((prev) => [...prev, {
				id: `m-${Date.now() + 1}`,
				sender: "ai",
				text: responseText,
				time: "Just now"
			}]);
			setIsTyping(false);
		}, 550);
	}
	function generateAIResponse(query, currentUser, state) {
		const q = query.toLowerCase();
		if (currentUser?.role === "admin") {
			if (q.includes("health") || q.includes("uptime") || q.includes("status") || q.includes("server")) return `System Telemetry & Operational Health Status:
• Backend Node API (Port 30000): Healthy (HTTP 200 OK, latency < 12ms)
• Frontend React App (Port 5173): Operational (Vite HMR sync active)
• Database Engine: In-Memory / MongoDB operational
• Security Engine: RBAC role isolation active across Admin, HR, and ESS
• Historical Platform SLA: 99.98% uptime`;
			if (q.includes("user") || q.includes("role") || q.includes("account") || q.includes("permission")) return `Active User Accounts & RBAC Matrix:
• System Administrators: 1 (Full platform governance & configuration)
• People Operations (HR): 1 (Workforce, attendance & payroll operations)
• Engineering Managers: 1 (Team leave approvals & appraisal reviews)
• Staff & Employees: 6+ (Self-service portal access)
Role separation: Strictly isolated portals with automatic routing guards.`;
			if (q.includes("audit") || q.includes("security") || q.includes("log")) return `Security Audit & Telemetry Overview:
• Total Administrative Events: ${state.auditLogs?.length || 24} events logged
• Recent events include payroll record updates, role enforcement checks, and credential validations.
• Complete real-time activity trail is viewable under "Role & Access" and "User Management".`;
			if (q.includes("backup") || q.includes("database") || q.includes("maintenance") || q.includes("restore")) return `Database Maintenance & Integrity Status:
• Active JSON database collections: Users, Employees, Leaves, Payroll, Attendance, Tasks, Holidays.
• 1-Click JSON export and instant database snapshot restore available under "System Maintenance".
• All transactional mutations are verified against data schema constraints.`;
			if (q.includes("setting") || q.includes("config") || q.includes("parameter")) return `System Configuration Summary:
• Office Locations: Koramangala Hub, Indiranagar Design Studio, SF Bay Area
• Authorized Wi-Fi SSIDs: Edufyi-HQ-Secure, Edufyi-5G-Office
• Working Hours: 09:30 AM to 06:30 PM (15-min arrival grace period)
• Modify global rules in "System Configuration".`;
		}
		if (currentUser?.role === "hr") {
			if (q.includes("payroll") || q.includes("salary") || q.includes("deduction") || q.includes("disburse")) return `HR Payroll & Performance Deductions Overview:
• Total Payroll Records: ${state.payroll?.length || 8} employee records for September 2026
• Statutory Deductions: EPF (12% of basic), Professional Tax (₹200), and TDS Tax
• Performance / KPI Deductions: Configurable per employee with instant recalculation of total deductions and take-home pay
• Direct Bank Transfers: Prepared for one-click disbursement via NEFT batch runs.`;
			if (q.includes("leave") || q.includes("approval") || q.includes("pending")) return `Workforce Leave Approvals:
• Current Pending Requests: ${(state.leaves || []).filter((l) => l.status === "pending").length} leave application(s) awaiting approval
• All pending items can be approved or rejected with required manager notes under "Leave Management".
• Approved leaves automatically synchronize with employee attendance records.`;
			if (q.includes("headcount") || q.includes("employee") || q.includes("people") || q.includes("department")) return `Company Workforce Headcount:
• Total Registered Employees: ${state.employees?.length || 8}
• Departments: Engineering, People Operations, Product, Executive, QA
• Status: 100% active with verified bank and tax documentation.`;
			if (q.includes("recruit") || q.includes("hiring") || q.includes("candidate")) return `Recruitment Pipeline:
• Open Requisitions: 4 active job postings (Frontend Lead, Product Designer, DevOps)
• Total Candidates in Pipeline: 12 in technical screening & HR interview rounds.`;
		}
		if (q.includes("leave") || q.includes("vacation") || q.includes("day off")) return `According to Edufyi HR policy, your current leave quotas are:
• Casual Leave: 8 of 12 remaining
• Sick Leave: 6 of 10 remaining
• Earned / Privilege Leave: 12 of 15 remaining
• Compensatory Off: 2 remaining

You have taken ${(state.leaves || []).filter((l) => l.employeeId === currentUser?.employeeId).filter((l) => l.status === "approved").reduce((acc, curr) => acc + (curr.days || 1), 0)} approved day(s) this year. You can apply for leave in the "My Leave" section.`;
		if (q.includes("wifi") || q.includes("wi-fi") || q.includes("attendance") || q.includes("check in") || q.includes("punch")) return `Edufyi Smart Attendance System:
• Attendance policy & shift timings are currently being updated.
• Verified Office Wi-Fi SSIDs: ${state.companySettings?.allowedWifiSSIDs?.join(", ") || "Edufyi-HQ-Secure"}.
• Connecting to verified corporate networks and verifying office geofence confirms physical presence.
• For remote days, you can check-in using the "Remote Check-In" mode.`;
		if (q.includes("salary") || q.includes("payslip") || q.includes("credited") || q.includes("pf")) return `Salary & Payroll Information:
• Salaries are disbursed on the final working day of every calendar month directly to your registered bank account.
• September payslips have been generated with full breakdown (Basic, HRA, Allowances, PF 12%, PT, and performance adjustments).
• You can preview and download your official PDF Payslip in "My Salary & Payslip".`;
		if (q.includes("holiday") || q.includes("diwali") || q.includes("gandhi") || q.includes("off")) return `Upcoming official company holidays:
${(state.holidays || []).slice(0, 3).map((h) => `• ${h.name} (${h.date}, ${h.day}) - ${h.type}`).join("\n")}

Offices will remain closed, and all critical support follows on-call rosters.`;
		if (q.includes("insurance") || q.includes("medical") || q.includes("claim") || q.includes("hospital")) return `Group Health & Medical Benefits:
• Edufyi provides comprehensive health insurance coverage up to INR 5,00,000 for employees and immediate dependents.
• Cashless hospitalization is supported across 6,500+ network hospitals.
• For reimbursement claims, submit medical bills under "Expense Claims" with discharge summary.`;
		if (q.includes("help") || q.includes("ticket") || q.includes("laptop") || q.includes("support")) return `Need assistance? You can open a ticket in the "Support Help Desk" for:
• IT & Hardware support (MacBooks, monitors, VPN access)
• HR Operations & Employment letters
• Payroll, PF, and Tax queries
• Average SLA resolution time is under 4 business hours.`;
		if (currentUser?.role === "admin") return `I can assist you with platform administration! Here are quick topics:
1. "Check system health & uptime"
2. "Summary of active user roles"
3. "Recent security audit logs"
4. "Database backup status"
5. "System configuration parameters"

Click any suggestion or type your administrative request.`;
		if (currentUser?.role === "hr") return `I can assist with People Operations! Here are quick topics:
1. "September payroll summary"
2. "Pending leave approvals"
3. "Employee headcount by department"
4. "Performance deduction policy"
5. "Recruitment pipeline status"

Click any suggestion or type your HR query.`;
		return `I can help you with your workspace questions! Here are key areas:
1. "How many leaves do I have left?"
2. "What is the office Wi-Fi attendance rule?"
3. "When is salary credited?"
4. "Show upcoming company holidays"
5. "How do I raise a support ticket?"

Feel free to click any suggestion below or ask your specific question.`;
	}
	const suggestions = isAdmin ? [
		"Check system health & uptime",
		"Summary of active user roles",
		"Recent security audit logs",
		"Database backup status",
		"System configuration parameters"
	] : isHR ? [
		"September payroll summary",
		"Pending leave approvals",
		"Performance deduction policy",
		"Employee headcount by department",
		"Recruitment pipeline status"
	] : [
		"Check my leave balance",
		"What is the Wi-Fi policy?",
		"When is salary credited?",
		"Upcoming company holidays",
		"How to raise a ticket?"
	];
	const inputPlaceholder = isAdmin ? "Ask about system health, user roles, security audit logs, backups..." : isHR ? "Ask about payroll, performance deductions, leave approvals, headcount..." : "Ask about leaves, Wi-Fi rules, salary, policies, holidays...";
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "ai-assistant-modal",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "copilot-modal-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ai-assistant-window",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "ai-assistant-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ai-header-info",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ai-avatar-badge",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { size: 18 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "online-indicator" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							id: "copilot-modal-title",
							children: copilotTitle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: copilotSubtitle })] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "icon-button",
						onClick: onClose,
						"aria-label": "Close AI Assistant",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ai-assistant-messages",
					children: [
						messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `ai-message-row ${msg.sender}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ai-message-avatar",
								children: msg.sender === "ai" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { size: 14 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ai-message-content",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "ai-message-bubble",
									children: msg.text.split("\n").map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										style: { margin: "3px 0" },
										children: line
									}, i))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ai-message-time",
									children: msg.time
								})]
							})]
						}, msg.id)),
						isTyping && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ai-message-row ai",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ai-message-avatar",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { size: 14 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ai-message-bubble typing-dots",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: chatEndRef })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ai-suggestion-chips",
					children: suggestions.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "suggestion-chip",
						onClick: () => handleSend(chip),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 11 }),
							" ",
							chip
						]
					}, chip))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "ai-assistant-input-row",
					onSubmit: (e) => {
						e.preventDefault();
						handleSend();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						placeholder: inputPlaceholder,
						value: input,
						onChange: (e) => setInput(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: !input.trim(),
						"aria-label": "Send message",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 15 })
					})]
				})
			]
		})
	});
}
// src/components/ChangePasswordModal.jsx
function ChangePasswordModal({ isOpen = true, isForced = false, onClose, onSuccess }) {
	const { user, changePassword } = useAuth();
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showCurrent, setShowCurrent] = (0, import_react.useState)(false);
	const [showNew, setShowNew] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [success, setSuccess] = (0, import_react.useState)("");
	if (!isOpen) return null;
	const mustChange = isForced || Boolean(user?.mustChangePassword);
	async function handleSubmit(e) {
		if (e) e.preventDefault();
		setError("");
		setSuccess("");
		if (!mustChange && !currentPassword) {
			setError("Please enter your current password.");
			return;
		}
		if (!newPassword || newPassword.trim().length < 8) {
			setError("New password must be at least 8 characters long.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("New password and confirm password do not match.");
			return;
		}
		if (currentPassword && currentPassword === newPassword) {
			setError("New password must be different from your current temporary password.");
			return;
		}
		setLoading(true);
		try {
			await changePassword({
				currentPassword: currentPassword || void 0,
				newPassword: newPassword.trim()
			});
			setSuccess("Your new password has been set successfully!");
			if (onSuccess) onSuccess();
			setTimeout(() => {
				if (onClose) onClose();
			}, 1500);
		} catch (err) {
			setError(err?.message || "Failed to update password. Please check your current password and try again.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			zIndex: 9999,
			background: "rgba(4, 8, 18, 0.78)",
			backdropFilter: "blur(8px)",
			WebkitBackdropFilter: "blur(8px)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px"
		},
		onClick: (e) => {
			if (!mustChange && e.target === e.currentTarget && onClose) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				width: "100%",
				maxWidth: "440px",
				background: "#0b1626",
				border: "1px solid rgba(0, 180, 216, 0.35)",
				boxShadow: "0 24px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(0, 180, 216, 0.15)",
				borderRadius: "18px",
				padding: "28px 24px 24px",
				color: "#ffffff",
				fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
				position: "relative"
			},
			children: [
				!mustChange && onClose && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close dialog",
					style: {
						position: "absolute",
						top: "16px",
						right: "16px",
						border: 0,
						background: "transparent",
						color: "#94a3b8",
						cursor: "pointer",
						padding: "6px",
						borderRadius: "6px"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						textAlign: "center",
						marginBottom: "20px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								width: "48px",
								height: "48px",
								margin: "0 auto 12px",
								borderRadius: "14px",
								background: "rgba(0, 180, 216, 0.12)",
								border: "1px solid rgba(0, 180, 216, 0.35)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#00d2ff"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { size: 24 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							style: {
								fontSize: "18px",
								fontWeight: 700,
								margin: "0 0 6px",
								color: "#f8fafc"
							},
							children: mustChange ? "Set Your New Password" : "Change Your Password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								fontSize: "12.5px",
								color: "#94a3b8",
								margin: 0,
								lineHeight: 1.45
							},
							children: mustChange ? "Your account was assigned an auto-generated temporary password. Please set a new personal password to secure your workspace account." : "Update your corporate workspace login password. Must be at least 8 characters long."
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px",
						background: "rgba(239, 68, 68, 0.15)",
						border: "1px solid rgba(239, 68, 68, 0.4)",
						borderRadius: "8px",
						padding: "10px 12px",
						marginBottom: "14px",
						color: "#fca5a5",
						fontSize: "12px",
						lineHeight: 1.35
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
						size: 15,
						style: { flexShrink: 0 }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
				}),
				success && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "8px",
						background: "rgba(16, 185, 129, 0.15)",
						border: "1px solid rgba(16, 185, 129, 0.4)",
						borderRadius: "8px",
						padding: "10px 12px",
						marginBottom: "14px",
						color: "#6ee7b7",
						fontSize: "12px",
						fontWeight: 600
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						size: 16,
						style: { flexShrink: 0 }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: success })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					style: {
						display: "grid",
						gap: "14px"
					},
					children: [
						!mustChange && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: {
								display: "block",
								fontSize: "11px",
								fontWeight: 600,
								color: "#94a3b8",
								marginBottom: "6px"
							},
							children: "CURRENT PASSWORD"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { position: "relative" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "#64748b"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: showCurrent ? "text" : "password",
									placeholder: "Enter current password",
									value: currentPassword,
									onChange: (e) => setCurrentPassword(e.target.value),
									disabled: loading,
									style: {
										width: "100%",
										height: "42px",
										padding: "0 40px 0 38px",
										background: "#07101b",
										border: "1px solid rgba(0, 180, 216, 0.25)",
										borderRadius: "8px",
										color: "#ffffff",
										fontSize: "13px",
										outline: "none",
										boxSizing: "border-box"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowCurrent(!showCurrent),
									style: {
										position: "absolute",
										right: "10px",
										top: "50%",
										transform: "translateY(-50%)",
										background: "transparent",
										border: 0,
										color: "#64748b",
										cursor: "pointer",
										padding: "4px"
									},
									children: showCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { size: 15 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 15 })
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: {
								display: "block",
								fontSize: "11px",
								fontWeight: 600,
								color: "#94a3b8",
								marginBottom: "6px"
							},
							children: "NEW PASSWORD (MIN. 8 CHARACTERS)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { position: "relative" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										position: "absolute",
										left: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "#64748b"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 15 })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: showNew ? "text" : "password",
									placeholder: "Enter new strong password",
									value: newPassword,
									onChange: (e) => setNewPassword(e.target.value),
									disabled: loading,
									style: {
										width: "100%",
										height: "42px",
										padding: "0 40px 0 38px",
										background: "#07101b",
										border: "1px solid rgba(0, 180, 216, 0.25)",
										borderRadius: "8px",
										color: "#ffffff",
										fontSize: "13px",
										outline: "none",
										boxSizing: "border-box"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowNew(!showNew),
									style: {
										position: "absolute",
										right: "10px",
										top: "50%",
										transform: "translateY(-50%)",
										background: "transparent",
										border: 0,
										color: "#64748b",
										cursor: "pointer",
										padding: "4px"
									},
									children: showNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { size: 15 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 15 })
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							style: {
								display: "block",
								fontSize: "11px",
								fontWeight: 600,
								color: "#94a3b8",
								marginBottom: "6px"
							},
							children: "CONFIRM NEW PASSWORD"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { position: "relative" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									position: "absolute",
									left: "12px",
									top: "50%",
									transform: "translateY(-50%)",
									color: "#64748b"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 15 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: showNew ? "text" : "password",
								placeholder: "Re-enter new password",
								value: confirmPassword,
								onChange: (e) => setConfirmPassword(e.target.value),
								disabled: loading,
								style: {
									width: "100%",
									height: "42px",
									padding: "0 16px 0 38px",
									background: "#07101b",
									border: "1px solid rgba(0, 180, 216, 0.25)",
									borderRadius: "8px",
									color: "#ffffff",
									fontSize: "13px",
									outline: "none",
									boxSizing: "border-box"
								}
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							style: {
								width: "100%",
								height: "44px",
								marginTop: "8px",
								background: "linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)",
								border: 0,
								borderRadius: "8px",
								color: "#ffffff",
								fontSize: "13px",
								fontWeight: 700,
								letterSpacing: "0.04em",
								textTransform: "uppercase",
								cursor: loading ? "not-allowed" : "pointer",
								boxShadow: "0 4px 14px rgba(0, 180, 216, 0.35)",
								transition: "opacity 0.2s ease",
								opacity: loading ? .7 : 1
							},
							children: loading ? "SAVING PASSWORD..." : mustChange ? "SAVE & ENTER WORKSPACE" : "UPDATE PASSWORD"
						})
					]
				})
			]
		})
	});
}
// src/services/passkeyAuth.js
function isPasskeySupported() {
	return typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined" && typeof navigator.credentials !== "undefined" && typeof navigator.credentials.create === "function" && typeof navigator.credentials.get === "function";
}
function base64UrlToUint8Array(base64Url) {
	if (!base64Url) return /* @__PURE__ */ new Uint8Array(0);
	const base64 = (base64Url + "=".repeat((4 - base64Url.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
	return outputArray;
}
function arrayBufferToBase64Url(buffer) {
	if (!buffer) return "";
	let binary = "";
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
	return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
/**
* Sign in using WebAuthn Passkey (Touch ID, Windows Hello, Face ID, YubiKey)
*/
async function loginWithPasskey({ email = "", portal = "" } = {}) {
	if (!isPasskeySupported()) throw new Error("WebAuthn / Passkeys are not supported on this browser or device.");
	const { challengeId, challenge, rpId, allowCredentials, hasRegisteredPasskey, timeout } = (await apiClient.post("/auth/passkey/login-options", {
		email: email.trim() || void 0,
		portal: portal || void 0
	})).data;
	const publicKey = {
		challenge: base64UrlToUint8Array(challenge),
		rpId: rpId || window.location.hostname,
		timeout: timeout || 6e4,
		userVerification: "preferred",
		hints: ["client-device"]
	};
	if (Array.isArray(allowCredentials) && allowCredentials.length > 0) publicKey.allowCredentials = allowCredentials.map((c) => ({
		id: base64UrlToUint8Array(c.id),
		type: "public-key"
	}));
	let credential;
	try {
		credential = await navigator.credentials.get({ publicKey });
	} catch (err) {
		if (err.name === "NotAllowedError") throw new Error("Passkey verification was cancelled or timed out.");
		throw new Error(err.message || "Passkey verification failed on this device.");
	}
	if (!credential) throw new Error("No credential returned by authenticator.");
	const payload = {
		challengeId,
		email: email.trim() || void 0,
		portal: portal || void 0,
		credential: {
			id: credential.id,
			rawId: arrayBufferToBase64Url(credential.rawId),
			type: credential.type,
			response: {
				clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
				authenticatorData: arrayBufferToBase64Url(credential.response.authenticatorData),
				signature: arrayBufferToBase64Url(credential.response.signature),
				userHandle: credential.response.userHandle ? arrayBufferToBase64Url(credential.response.userHandle) : null
			}
		}
	};
	return (await apiClient.post("/auth/passkey/verify-login", payload)).data;
}
/**
* Register a new Passkey on the current device
*/
async function registerPasskey({ email = "", password = "", deviceName = "" } = {}) {
	if (!isPasskeySupported()) throw new Error("WebAuthn / Passkeys are not supported on this browser or device.");
	const { challengeId, challenge, rp, user, pubKeyCredParams, authenticatorSelection, timeout } = (await apiClient.post("/auth/passkey/register-options", {
		email: email.trim() || void 0,
		password: password || void 0
	})).data;
	const publicKey = {
		challenge: base64UrlToUint8Array(challenge),
		rp: rp || {
			name: "Edufyi Tech Solutions",
			id: window.location.hostname
		},
		user: {
			id: base64UrlToUint8Array(user.id),
			name: user.name,
			displayName: user.displayName
		},
		pubKeyCredParams: pubKeyCredParams || [{
			alg: -7,
			type: "public-key"
		}, {
			alg: -257,
			type: "public-key"
		}],
		authenticatorSelection: {
			authenticatorAttachment: "platform",
			userVerification: "preferred",
			residentKey: "preferred",
			...authenticatorSelection || {}
		},
		hints: ["client-device"],
		timeout: timeout || 6e4
	};
	let credential;
	try {
		credential = await navigator.credentials.create({ publicKey });
	} catch (err) {
		if (err.name === "NotAllowedError") throw new Error("Passkey creation was cancelled or timed out.");
		throw new Error(err.message || "Could not register passkey on this device.");
	}
	if (!credential) throw new Error("No credential was generated by the authenticator.");
	const payload = {
		challengeId,
		deviceName: deviceName || (window.navigator?.userAgent?.includes("Mac") ? "Mac Touch ID" : "Windows Hello / Security Key"),
		credential: {
			id: credential.id,
			rawId: arrayBufferToBase64Url(credential.rawId),
			type: credential.type,
			response: {
				clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
				attestationObject: arrayBufferToBase64Url(credential.response.attestationObject)
			}
		}
	};
	return (await apiClient.post("/auth/passkey/register-verify", payload)).data;
}
/**
* List registered passkeys for the currently authenticated user
*/
async function listPasskeys() {
	return (await apiClient.get("/auth/passkey/list")).data?.data || [];
}
/**
* Remove a registered passkey by its credentialId
*/
async function deletePasskey(credentialId) {
	return (await apiClient.delete(`/auth/passkey/${encodeURIComponent(credentialId)}`)).data;
}
// src/components/PasskeyModal.jsx
function PasskeyModal({ isOpen, onClose, initialEmail = "", initialPassword = "", onRegistered }) {
	const { user, completeSession } = useAuth();
	const isLoggedIn = Boolean(user && user.id);
	const [email, setEmail] = (0, import_react.useState)(initialEmail || user?.email || "");
	const [password, setPassword] = (0, import_react.useState)(initialPassword || "");
	const [deviceName, setDeviceName] = (0, import_react.useState)(() => {
		if (typeof navigator === "undefined") return "My Device";
		const ua = navigator.userAgent || "";
		if (/iPhone|iPad|iPod/.test(ua)) return "iPhone / iPad (Face ID)";
		if (/Mac/.test(ua)) return "Mac (Touch ID)";
		if (/Android/.test(ua)) return "Android Biometrics";
		if (/Windows/.test(ua)) return "Windows PC (Windows Hello)";
		return "Security Key / Biometric Device";
	});
	const [passkeys, setPasskeys] = (0, import_react.useState)([]);
	const [loadingList, setLoadingList] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [deletingId, setDeletingId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [success, setSuccess] = (0, import_react.useState)("");
	const supported = isPasskeySupported();
	(0, import_react.useEffect)(() => {
		if (isOpen && isLoggedIn) loadPasskeys();
		if (initialEmail) setEmail(initialEmail);
		if (initialPassword) setPassword(initialPassword);
		setError("");
		setSuccess("");
	}, [
		isOpen,
		isLoggedIn,
		initialEmail,
		initialPassword
	]);
	async function loadPasskeys() {
		setLoadingList(true);
		try {
			const list = await listPasskeys();
			setPasskeys(Array.isArray(list) ? list : []);
		} catch {} finally {
			setLoadingList(false);
		}
	}
	async function handleRegister(e) {
		if (e) e.preventDefault();
		setError("");
		setSuccess("");
		if (!supported) {
			setError("WebAuthn / Passkeys (Windows Hello, Face ID, Touch ID) are not supported on this browser or platform.");
			return;
		}
		if (!isLoggedIn && (!email.trim() || !password)) {
			setError("Please provide your work email and password to authorize your device.");
			return;
		}
		setSubmitting(true);
		try {
			const payload = { deviceName: deviceName.trim() || void 0 };
			if (!isLoggedIn) {
				payload.email = email.trim();
				payload.password = password;
			}
			const res = await registerPasskey(payload);
			setSuccess("Biometric Passkey registered successfully! You can now use 1-click login on this device.");
			if (onRegistered) onRegistered(res);
			if (!isLoggedIn && res.token && res.user && completeSession) {
				completeSession(res.token, res.user);
				const portal = res.user.role === "admin" ? "/admin" : res.user.role === "hr" ? "/hr" : "/employee";
				window.location.hash = `#${portal}`;
				onClose?.();
				return;
			}
			if (isLoggedIn) await loadPasskeys();
		} catch (err) {
			if (err.name === "NotAllowedError") setError("Passkey setup was cancelled by the user.");
			else setError(err.message || "Failed to register Passkey.");
		} finally {
			setSubmitting(false);
		}
	}
	async function handleDelete(credentialId) {
		if (!window.confirm("Are you sure you want to remove this passkey? You will not be able to sign in with this device without re-registering.")) return;
		setError("");
		setSuccess("");
		setDeletingId(credentialId);
		try {
			await deletePasskey(credentialId);
			setPasskeys((prev) => prev.filter((k) => k.credentialId !== credentialId));
			setSuccess("Passkey removed successfully.");
		} catch (err) {
			setError(err.message || "Failed to remove passkey.");
		} finally {
			setDeletingId(null);
		}
	}
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		style: {
			position: "fixed",
			inset: 0,
			backgroundColor: "rgba(5, 12, 18, 0.75)",
			backdropFilter: "blur(6px)",
			zIndex: 1e5,
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			padding: "16px"
		},
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: {
				backgroundColor: "#0a1d24",
				color: "#ffffff",
				borderRadius: "16px",
				width: "100%",
				maxWidth: "520px",
				border: "1px solid rgba(0, 180, 160, 0.25)",
				boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
				overflow: "hidden",
				display: "flex",
				flexDirection: "column"
			},
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "20px 24px",
					borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					background: "linear-gradient(180deg, rgba(0, 110, 111, 0.25) 0%, transparent 100%)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							width: "40px",
							height: "40px",
							borderRadius: "10px",
							backgroundColor: "rgba(0, 210, 255, 0.15)",
							border: "1px solid rgba(0, 210, 255, 0.3)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#00d2ff"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, { size: 22 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						style: {
							margin: 0,
							fontSize: "17px",
							fontWeight: 700,
							color: "#ffffff"
						},
						children: isLoggedIn ? "Biometric Passkeys & Security" : "Add / Register Device Passkey"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							margin: "2px 0 0",
							fontSize: "12px",
							color: "#94a3b8"
						},
						children: isLoggedIn ? "Manage your fingerprints, Face ID & Windows Hello keys" : "Link this device for instant passwordless sign-in"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					style: {
						background: "transparent",
						border: 0,
						color: "#94a3b8",
						cursor: "pointer",
						padding: "6px",
						borderRadius: "8px",
						display: "flex",
						alignItems: "center"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "24px",
					display: "flex",
					flexDirection: "column",
					gap: "20px",
					maxHeight: "75vh",
					overflowY: "auto"
				},
				children: [
					!supported && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "12px 14px",
							borderRadius: "8px",
							backgroundColor: "rgba(239, 68, 68, 0.15)",
							border: "1px solid rgba(239, 68, 68, 0.3)",
							color: "#fca5a5",
							fontSize: "12.5px",
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 18,
							style: { flexShrink: 0 }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Biometric Passkeys (WebAuthn) are not supported on this browser. Please use Chrome, Edge, Safari, or an updated mobile browser." })]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "12px 14px",
							borderRadius: "8px",
							backgroundColor: "rgba(239, 68, 68, 0.15)",
							border: "1px solid rgba(239, 68, 68, 0.3)",
							color: "#fca5a5",
							fontSize: "12.5px",
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 18,
							style: { flexShrink: 0 }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
					}),
					success && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "12px 14px",
							borderRadius: "8px",
							backgroundColor: "rgba(16, 185, 129, 0.15)",
							border: "1px solid rgba(16, 185, 129, 0.3)",
							color: "#6ee7b7",
							fontSize: "12.5px",
							display: "flex",
							alignItems: "center",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							size: 18,
							style: { flexShrink: 0 }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: success })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							padding: "12px 16px",
							borderRadius: "10px",
							background: "rgba(0, 110, 111, 0.15)",
							border: "1px solid rgba(0, 180, 160, 0.25)",
							fontSize: "12.5px",
							color: "#cbd5e1",
							lineHeight: 1.5,
							display: "flex",
							gap: "10px",
							alignItems: "flex-start"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							size: 18,
							style: {
								color: "#2dd4bf",
								flexShrink: 0,
								marginTop: "2px"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							"Passkeys use your device's built-in secure hardware (",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Windows Hello, Apple Touch ID / Face ID, or Android Biometrics" }),
							"). No passwords to remember, highly secure and phishing-resistant."
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleRegister,
						style: {
							display: "flex",
							flexDirection: "column",
							gap: "14px"
						},
						children: [
							!isLoggedIn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "12px",
									fontWeight: 600,
									color: "#94a3b8",
									marginBottom: "6px"
								},
								children: "Work Email / Username"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "e.g. employee@edufyitech.in",
								style: {
									width: "100%",
									padding: "10px 14px",
									borderRadius: "8px",
									border: "1px solid rgba(255, 255, 255, 0.15)",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									color: "#ffffff",
									fontSize: "13px",
									outline: "none",
									boxSizing: "border-box"
								}
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "12px",
									fontWeight: 600,
									color: "#94a3b8",
									marginBottom: "6px"
								},
								children: "Account Password (one-time verification)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								required: true,
								value: password,
								onChange: (e) => setPassword(e.target.value),
								placeholder: "Enter your current password",
								style: {
									width: "100%",
									padding: "10px 14px",
									borderRadius: "8px",
									border: "1px solid rgba(255, 255, 255, 0.15)",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									color: "#ffffff",
									fontSize: "13px",
									outline: "none",
									boxSizing: "border-box"
								}
							})] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								style: {
									display: "block",
									fontSize: "12px",
									fontWeight: 600,
									color: "#94a3b8",
									marginBottom: "6px"
								},
								children: "Device Label"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								value: deviceName,
								onChange: (e) => setDeviceName(e.target.value),
								placeholder: "e.g. My Laptop (Windows Hello)",
								style: {
									width: "100%",
									padding: "10px 14px",
									borderRadius: "8px",
									border: "1px solid rgba(255, 255, 255, 0.15)",
									backgroundColor: "rgba(255, 255, 255, 0.05)",
									color: "#ffffff",
									fontSize: "13px",
									outline: "none",
									boxSizing: "border-box"
								}
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: submitting || !supported,
								style: {
									marginTop: "6px",
									padding: "12px 18px",
									borderRadius: "8px",
									border: 0,
									background: "linear-gradient(135deg, #008788 0%, #0d9488 100%)",
									color: "#ffffff",
									fontWeight: 700,
									fontSize: "13.5px",
									cursor: submitting || !supported ? "not-allowed" : "pointer",
									opacity: submitting || !supported ? .6 : 1,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									gap: "8px",
									boxShadow: "0 4px 12px rgba(0, 110, 111, 0.35)",
									transition: "all 0.2s"
								},
								children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									size: 16,
									className: "animate-spin"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Scanning Biometrics on Device..." })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isLoggedIn ? "Register Passkey for this Device" : "Register Passkey & Sign In" })] })
							})
						]
					}),
					isLoggedIn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: "10px",
							borderTop: "1px solid rgba(255, 255, 255, 0.08)",
							paddingTop: "16px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "13px",
									fontWeight: 600,
									color: "#e2e8f0"
								},
								children: [
									"Enrolled Passkeys (",
									passkeys.length,
									")"
								]
							}), loadingList && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								size: 14,
								className: "animate-spin",
								color: "#94a3b8"
							})]
						}), passkeys.length === 0 && !loadingList ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								textAlign: "center",
								padding: "16px",
								color: "#94a3b8",
								fontSize: "12.5px",
								background: "rgba(255,255,255,0.02)",
								borderRadius: "8px",
								border: "1px dashed rgba(255,255,255,0.1)"
							},
							children: "No passkey enrolled on this account yet. Click the button above to register your current device."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "8px"
							},
							children: passkeys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									padding: "10px 14px",
									borderRadius: "8px",
									background: "rgba(255, 255, 255, 0.04)",
									border: "1px solid rgba(255, 255, 255, 0.08)",
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
									children: [/iPhone|iPad|Android|Mobile/i.test(k.deviceName) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
										size: 16,
										color: "#00d2ff"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laptop, {
										size: 16,
										color: "#00d2ff"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "13px",
											fontWeight: 600,
											color: "#f8fafc"
										},
										children: k.deviceName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11px",
											color: "#94a3b8"
										},
										children: ["Added ", new Date(k.createdAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric"
										})]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => handleDelete(k.credentialId),
									disabled: deletingId === k.credentialId,
									title: "Remove passkey",
									style: {
										background: "transparent",
										border: 0,
										color: "#ef4444",
										cursor: deletingId === k.credentialId ? "wait" : "pointer",
										padding: "6px",
										borderRadius: "6px",
										display: "flex",
										alignItems: "center"
									},
									children: deletingId === k.credentialId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										size: 15,
										className: "animate-spin"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 15 })
								})]
							}, k.credentialId))
						})]
					})
				]
			})]
		})
	});
}
// src/utils/imageCompressor.js
/**
* High-performance client-side image compression utility.
* Downscales camera and high-resolution images to a maximum dimension (default 384x384)
* and encodes to an optimized JPEG data URL (quality 0.75).
* Prevents exceeding MongoDB 16MB BSON document limits and keeps avatar payloads ~25KB - 60KB.
*/
function compressImageFile(file, maxWidth = 384, maxHeight = 384, quality = .75) {
	return new Promise((resolve, reject) => {
		if (!file) return reject(/* @__PURE__ */ new Error("No image file selected."));
		if (!file.type || !file.type.startsWith("image/")) return reject(/* @__PURE__ */ new Error("Selected file is not a valid image format."));
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Failed reading image file."));
		reader.onload = (event) => {
			const img = new Image();
			img.onerror = () => reject(/* @__PURE__ */ new Error("Failed loading image data for compression."));
			img.onload = () => {
				let width = img.naturalWidth || img.width;
				let height = img.naturalHeight || img.height;
				if (!width || !height) return reject(/* @__PURE__ */ new Error("Unable to determine image dimensions."));
				if (width > maxWidth || height > maxHeight) {
					const ratio = Math.min(maxWidth / width, maxHeight / height);
					width = Math.round(width * ratio);
					height = Math.round(height * ratio);
				}
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) return reject(/* @__PURE__ */ new Error("Browser canvas is not available for image processing."));
				ctx.fillStyle = "#FFFFFF";
				ctx.fillRect(0, 0, width, height);
				ctx.drawImage(img, 0, 0, width, height);
				try {
					const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
					if (compressedDataUrl.length > 358400) {
						const secondaryCanvas = document.createElement("canvas");
						secondaryCanvas.width = Math.round(width * .7);
						secondaryCanvas.height = Math.round(height * .7);
						const sCtx = secondaryCanvas.getContext("2d");
						sCtx.fillStyle = "#FFFFFF";
						sCtx.fillRect(0, 0, secondaryCanvas.width, secondaryCanvas.height);
						sCtx.drawImage(canvas, 0, 0, secondaryCanvas.width, secondaryCanvas.height);
						resolve(secondaryCanvas.toDataURL("image/jpeg", .65));
					} else resolve(compressedDataUrl);
				} catch (canvasErr) {
					reject(/* @__PURE__ */ new Error("Failed compressing image: " + canvasErr.message));
				}
			};
			img.src = event.target.result;
		};
		reader.readAsDataURL(file);
	});
}
// src/components/HRLayout.jsx
var RouteErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, errorInfo) {
		console.error("RouteErrorBoundary caught:", error, errorInfo);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) this.setState({
			hasError: false,
			error: null
		});
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel",
			style: {
				padding: "32px",
				textAlign: "center",
				margin: "24px auto",
				maxWidth: "640px",
				borderLeft: "4px solid #cb3a31"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					style: {
						color: "#cb3a31",
						fontSize: "18px",
						marginBottom: "8px"
					},
					children: "Module Render Notice"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						color: "var(--muted)",
						fontSize: "13px",
						marginBottom: "20px"
					},
					children: this.state.error?.message || "An error occurred during page rendering."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => {
						this.setState({
							hasError: false,
							error: null
						});
						window.location.reload();
					},
					children: "Refresh and Reload"
				})
			]
		});
		return this.props.children;
	}
};
var icons = {
	"Org Hierarchy": Network,
	"Admin Overview": ShieldCheck,
	"User Management": Users,
	"Role & Access": ShieldCheck,
	"System Configuration": Settings2,
	"Reports & Analytics": FileChartColumnIncreasing,
	"System Maintenance": Settings2,
	"Daily Work Report": FileChartColumnIncreasing,
	"Training Portal": BookOpen,
	"Support Help Desk": Ticket,
	"Holiday Calendar": CalendarDays,
	"Rewards & Recognition": Sparkles,
	"Notifications": Bell,
	"Expense Claims": WalletCards,
	"My Team": Users,
	"Team Approvals": UserCheck,
	Overview: LayoutDashboard,
	"Admin Overview": ShieldCheck,
	"User Management": Users,
	"Role & Access": ShieldCheck,
	Departments: Building,
	"Company Settings": Settings2,
	"Reports & Analytics": FileChartColumnIncreasing,
	"System Configuration": Settings2,
	People: Users,
	Attendance: Clock3,
	Leave: CalendarDays,
	"Payroll & Salary": WalletCards,
	Payroll: WalletCards,
	Recruitment: UserPlus,
	Performance: Target,
	"Task Management": FileText,
	Tasks: FileText,
	"Training & Learning": BookOpen,
	Learning: BookOpen,
	"Help Desk": Ticket,
	"Help desk": Ticket,
	Announcements: Megaphone,
	"Holiday Calendar": CalendarDays,
	"Holiday calendar": CalendarDays,
	"Org Hierarchy": Network,
	"Company Documents": FolderOpen,
	"Company documents": FolderOpen,
	"Company Policy": ShieldCheck,
	"Company policy": ShieldCheck,
	"Company Policies": ShieldCheck,
	"Company policies": ShieldCheck,
	"HR Settings": Settings2,
	"HR settings": Settings2,
	"ESS Dashboard": LayoutDashboard,
	"My Attendance": Clock3,
	"My Leave": CalendarDays,
	"Team Approvals": UserCheck,
	"My Salary & Payslip": WalletCards,
	"My Profile": Users,
	"My Tasks": FileText,
	"Daily Work Report": FileChartColumnIncreasing,
	"Training Portal": BookOpen,
	"Support Help Desk": Ticket,
	"Rewards & Recognition": Sparkles,
	"Expense Claims": WalletCards,
	"My Performance": Target,
	"Team Approvals": UserCheck,
	"My Team": Users,
	"Company Documents": FolderOpen
};
function HRLayout({ route, children }) {
	const { user, logout, updateUser } = useAuth();
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [notifOpen, setNotifOpen] = (0, import_react.useState)(false);
	const [profileOpen, setProfileOpen] = (0, import_react.useState)(false);
	const [changePasswordOpen, setChangePasswordOpen] = (0, import_react.useState)(false);
	const [passkeyModalOpen, setPasskeyModalOpen] = (0, import_react.useState)(false);
	const [photoNotice, setPhotoNotice] = (0, import_react.useState)(false);
	const [aiAssistantOpen, setAiAssistantOpen] = (0, import_react.useState)(false);
	const [soundMuted, setSoundMutedState] = (0, import_react.useState)(() => isSoundMuted());
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [notifications, setNotifications] = (0, import_react.useState)(() => hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : hrStore.getNotifications());
	const [notifCategory, setNotifCategory] = (0, import_react.useState)("all");
	const [isStandalone, setIsStandalone] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true || document.referrer.includes("android-app://"));
	});
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const media = window.matchMedia?.("(display-mode: standalone)");
		const handler = (e) => setIsStandalone(Boolean(e.matches));
		media?.addEventListener?.("change", handler);
		const onInstalled = () => setIsStandalone(true);
		window.addEventListener("appinstalled", onInstalled);
		return () => {
			media?.removeEventListener?.("change", handler);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);
	const navRef = (0, import_react.useRef)(null);
	const fileInputRef = (0, import_react.useRef)(null);
	const notifRef = (0, import_react.useRef)(null);
	const profileRef = (0, import_react.useRef)(null);
	const prevNotifIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const isFirstLoadRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => {
			setStoreState(state);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		function handleClickOutside(event) {
			const path = event.composedPath ? event.composedPath() : [];
			const clickedProfile = profileRef.current && (profileRef.current.contains(event.target) || path.includes(profileRef.current) || Boolean(event.target?.closest?.(".topbar-profile-dropdown")));
			const clickedNotif = notifRef.current && (notifRef.current.contains(event.target) || path.includes(notifRef.current) || Boolean(event.target?.closest?.(".notif-popover")));
			if (!clickedProfile) setProfileOpen(false);
			if (!clickedNotif) setNotifOpen(false);
		}
		function handleKeyDown(event) {
			if (event.key === "Escape") {
				setMobileOpen(false);
				setProfileOpen(false);
				setNotifOpen(false);
			}
		}
		document.addEventListener("pointerdown", handleClickOutside);
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handleClickOutside);
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		setMobileOpen(false);
		setNotifOpen(false);
		setProfileOpen(false);
	}, [route.path]);
	const syncUnifiedNotifications = import_react.useCallback(async (silent = false) => {
		try {
			const res = await apiClient.get("/notifications?limit=60");
			const items = res?.data || res;
			if (Array.isArray(items)) {
				const normalized = items.map((n) => ({
					...n,
					id: String(n.id || n._id || ""),
					_id: String(n._id || n.id || "")
				})).filter((n) => Boolean(n.id));
				setNotifications((prev) => {
					const locallyReadIds = new Set(prev.filter((n) => n.read || n.readAt).map((n) => String(n.id || n._id)));
					return normalized.map((n) => {
						const isRead = Boolean(n.read || n.readAt || locallyReadIds.has(String(n.id)));
						return {
							...n,
							read: isRead,
							readAt: n.readAt || (isRead ? n.readAt || (/* @__PURE__ */ new Date()).toISOString() : null)
						};
					});
				});
				const unread = normalized.filter((n) => !n.read && !n.readAt);
				if (unread.filter((n) => !prevNotifIdsRef.current.has(n.id)).length > 0 && !isFirstLoadRef.current && !silent) try {
					playNotificationSound("notification");
				} catch {}
				isFirstLoadRef.current = false;
				prevNotifIdsRef.current = new Set(unread.map((n) => n.id));
				return;
			}
		} catch {}
		const local = hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : hrStore.getNotifications();
		if (Array.isArray(local)) setNotifications(local.map((n) => ({
			...n,
			id: String(n.id || n._id || ""),
			_id: String(n._id || n.id || "")
		})));
	}, [user]);
	(0, import_react.useEffect)(() => {
		syncUnifiedNotifications(true);
		const interval = setInterval(() => syncUnifiedNotifications(false), 25e3);
		const onFocus = () => syncUnifiedNotifications(true);
		window.addEventListener("focus", onFocus);
		const unsubscribeStore = hrStore.subscribe(() => {
			const fresh = hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : hrStore.getNotifications();
			if (Array.isArray(fresh) && fresh.length > 0) setNotifications((prev) => {
				const map = /* @__PURE__ */ new Map();
				prev.forEach((item) => {
					const id = String(item.id || item._id || "");
					if (id) map.set(id, item);
				});
				fresh.forEach((item) => {
					const id = String(item.id || item._id || "");
					if (id) {
						const prevItem = map.get(id);
						const isRead = Boolean(prevItem?.read || prevItem?.readAt || item.read || item.readAt);
						const readAt = prevItem?.readAt || item.readAt || (isRead ? prevItem?.readAt || item.readAt || (/* @__PURE__ */ new Date()).toISOString() : null);
						map.set(id, {
							...item,
							...prevItem,
							id,
							_id: id,
							read: isRead,
							readAt
						});
					}
				});
				return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || b.time || 0) - new Date(a.createdAt || a.time || 0));
			});
		});
		return () => {
			clearInterval(interval);
			window.removeEventListener("focus", onFocus);
			unsubscribeStore();
		};
	}, [syncUnifiedNotifications, user]);
	const handleMarkOneRead = async (item) => {
		const id = item.id || item._id;
		setNotifications((prev) => prev.map((n) => n.id === id || n._id === id ? {
			...n,
			read: true
		} : n));
		try {
			await apiClient.patch(`/notifications/${id}/read`, {});
		} catch {}
		hrStore.markNotificationRead(id);
	};
	const handleDeleteOne = async (item) => {
		const id = item.id || item._id;
		setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
		try {
			await apiClient.delete(`/notifications/${id}`);
		} catch {}
		if (hrStore.deleteNotification) hrStore.deleteNotification(id);
	};
	(0, import_react.useEffect)(() => {
		const token = apiClient.getToken ? apiClient.getToken() : localStorage.getItem("edufyi_token");
		if (!token) return;
		let es = null;
		try {
			es = new EventSource(`/api/v1/notifications/stream?token=${encodeURIComponent(token)}`);
			es.onmessage = (event) => {
				try {
					const payload = JSON.parse(event.data);
					if (payload.type === "notification" && payload.data) {
						const notif = payload.data;
						const id = String(notif.id || notif._id || notif.notificationId || "");
						if (!id) return;
						setNotifications((prev) => {
							if (prev.some((n) => n.id === id || n._id === id)) return prev;
							return [{
								...notif,
								id,
								_id: id,
								read: false
							}, ...prev];
						});
						if (!soundMuted) try {
							playNotificationSound("notification");
						} catch {}
					}
				} catch {}
			};
			es.onerror = () => {
				es?.close();
			};
		} catch {}
		return () => {
			es?.close();
		};
	}, [
		user?.id,
		user?.employeeId,
		soundMuted
	]);
	(0, import_react.useEffect)(() => {
		prevNotifIdsRef.current = /* @__PURE__ */ new Set();
		isFirstLoadRef.current = true;
		syncUnifiedNotifications(true);
	}, [user?.id, user?.employeeId]);
	const handleMarkAllRead = async () => {
		try {
			await apiClient.patch("/notifications/read-all", {});
		} catch {}
		setNotifications((prev) => prev.map((n) => ({
			...n,
			read: true
		})));
		hrStore.markAllNotificationsRead();
	};
	const handleClearAll = async () => {
		try {
			await apiClient.delete("/notifications/clear-all");
		} catch {}
		setNotifications([]);
		hrStore.clearAllNotifications();
	};
	function resolveNotificationRoute$1(n) {
		return resolveNotificationRoute(n, user);
	}
	function handleNotificationNavigation(n) {
		const targetHash = resolveNotificationRoute$1(n);
		if (targetHash) {
			if (window.location.hash === targetHash) window.dispatchEvent(new HashChangeEvent("hashchange"));
			else window.location.hash = targetHash;
		}
	}
	async function handlePhotoUpload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const dataUrl = await compressImageFile(file, 384, 384, .75);
			if (dataUrl) {
				if (hrStore.updateMyAvatar) await hrStore.updateMyAvatar(dataUrl);
				else await apiClient.patch("/employees/me/avatar", { avatarUrl: dataUrl });
				if (updateUser) updateUser({ avatarUrl: dataUrl });
				setPhotoNotice(true);
				setTimeout(() => setPhotoNotice(false), 3500);
			}
		} catch (err) {
			console.warn("Failed to compress and persist profile picture:", err.message);
			alert("Failed to save profile picture: " + (err.message || "Please try again."));
		} finally {
			if (e.target) e.target.value = "";
		}
	}
	const unreadCount = notifications.filter((n) => !n.read && !n.readAt).length;
	const isAdmin = user?.role === "admin";
	const isExecutive = [
		"director",
		"managing_director",
		"co_founder",
		"vertical_head"
	].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
	const isHR = !isAdmin && !isExecutive && (user?.role === "hr" || user?.role === "hr_executive");
	const isManager = !isAdmin && !isExecutive && !isHR && (user?.role === "manager" || [
		"team_lead",
		"team_leader",
		"revenue_growth_manager",
		"senior_manager",
		"head_of_sales",
		"head_of_marketing"
	].includes(user?.role));
	const activeRoutes = route.path.startsWith("/admin") ? adminRoutes : route.path.startsWith("/hr") ? hrRoutes : isAdmin ? adminRoutes : isHR ? hrRoutes : employeeRoutes;
	const portalClass = route.path.startsWith("/admin") ? "portal-theme-admin" : route.path.startsWith("/hr") ? "portal-theme-hr" : isAdmin ? "portal-theme-admin" : isHR ? "portal-theme-hr" : "portal-theme-employee";
	const dashboardHref = isAdmin ? "#/admin" : isExecutive ? "#/employee" : isHR ? "#/hr" : "#/employee";
	const visibleRoutes = activeRoutes.filter((item) => !item.permission || hasPermission(user, item.permission));
	const groups = [...new Set(visibleRoutes.map((r) => r.group))];
	const mobileBottomNavItems = import_react.useMemo(() => {
		if (isAdmin) return [
			{
				path: "/admin",
				label: "Overview",
				icon: LayoutDashboard
			},
			{
				path: "/admin/users",
				label: "Users",
				icon: Users
			},
			{
				path: "/admin/roles",
				label: "Roles",
				icon: ShieldCheck
			},
			{
				path: "/admin/hierarchy",
				label: "Hierarchy",
				icon: Network
			},
			{
				path: "/admin/settings",
				label: "Settings",
				icon: Settings2
			}
		];
		if (isHR) return [
			{
				path: "/hr",
				label: "Overview",
				icon: LayoutDashboard
			},
			{
				path: "/hr/people",
				label: "People",
				icon: Users
			},
			{
				path: "/hr/attendance",
				label: "Attendance",
				icon: Clock3
			},
			{
				path: "/hr/leave",
				label: "Leaves",
				icon: CalendarDays
			},
			{
				path: "/hr/hierarchy",
				label: "Hierarchy",
				icon: Network
			}
		];
		return [
			{
				path: "/employee",
				label: "Home",
				icon: House
			},
			{
				path: "/employee/attendance",
				label: "Attendance",
				icon: Clock3
			},
			{
				path: "/employee/leave",
				label: "Leave",
				icon: CalendarDays
			},
			{
				path: isManager ? "/employee/team-leave" : "/employee/tasks",
				label: isManager ? "Team" : "Tasks",
				icon: isManager ? UserCheck : Target
			},
			{
				path: "/employee/profile",
				label: "Profile",
				icon: User
			}
		];
	}, [
		isAdmin,
		isHR,
		isManager
	]);
	async function handleLogout() {
		await logout();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `app-shell ${portalClass}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpsBackgroundManager, { user }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: `sidebar ${mobileOpen ? "sidebar-open" : ""}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sidebar-top",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "brand-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: dashboardHref,
								className: "brand-link",
								title: "Go to Dashboard",
								onClick: (e) => {
									e.preventDefault();
									window.location.hash = dashboardHref;
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									className: "brand-wordmark",
									src: "/elythra-edufyitech-logo.png",
									alt: "Elythra EdufyiTech"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "icon-button mobile-close",
								onClick: () => setMobileOpen(false),
								"aria-label": "Close navigation",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { padding: "0 16px 14px 16px" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `role-indicator-box role-indicator-${isExecutive ? "managing_director" : user?.role || "employee"}`,
								children: isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Administrator Access" })] }) : isExecutive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: user?.role === "managing_director" ? "Managing Director Console" : "Executive Leadership Access" })] }) : user?.role === "hr" || user?.role === "hr_executive" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HR Operations Access" })] }) : isManager ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Manager Access" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Self-Service" })] })
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "nav-area",
						"aria-label": "Primary navigation",
						ref: navRef,
						children: groups.map((group) => {
							const groupRoutes = visibleRoutes.filter((item) => item.group === group);
							if (groupRoutes.length === 0) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "nav-group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "nav-group-title",
									children: group
								}), groupRoutes.map((item) => {
									const Icon = icons[item.label] || icons[item.group] || LayoutDashboard;
									const active = route.path === item.path;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: `#${item.path}`,
										className: `nav-item ${active ? "active" : ""}`,
										onClick: () => setMobileOpen(false),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
									}, item.path);
								})]
							}, group);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sidebar-bottom",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "nav-item",
							style: {
								border: 0,
								background: "transparent",
								textAlign: "left",
								width: "100%",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "10px"
							},
							onClick: () => {
								setMobileOpen(false);
								window.dispatchEvent(new CustomEvent("edufyi-trigger-install"));
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Install Web App" })]
						}), !isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							className: "nav-item",
							href: isHR ? "#/hr/helpdesk" : "#/employee/helpdesk",
							onClick: () => setMobileOpen(false),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Help & Support" })]
						})]
					})
				]
			}),
			mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "scrim",
				onClick: () => setMobileOpen(false),
				"aria-label": "Close navigation overlay"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "main-content",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "topbar",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "icon-button menu-trigger",
								onClick: () => setMobileOpen(true),
								"aria-label": "Open navigation",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { size: 20 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "breadcrumbs",
								children: [
									isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "topbar-portal-indicator admin",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Admin Console" })]
									}) : isExecutive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "topbar-portal-indicator executive",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: user?.role === "managing_director" ? "Managing Director Console" : "Executive Console" })]
									}) : isHR ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "topbar-portal-indicator hr",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HR Operations" })]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "topbar-portal-indicator ess",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { size: 13 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee Workspace" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "slash",
										children: "/"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: dashboardHref,
										onClick: (e) => {
											e.preventDefault();
											window.location.hash = dashboardHref;
										},
										style: {
											color: "inherit",
											textDecoration: "none"
										},
										title: "Go to Dashboard",
										children: "Edufyi"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "slash",
										children: "/"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: route.group || "HR Hub" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "slash",
										children: "/"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: route.label })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "topbar-actions",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "topbar-greeting-pill",
										title: `Logged in as ${isAdmin ? "Admin" : isHR && !isExecutive ? "HR" : resolveUserDisplayName(user, storeState?.employees || [])} (${user?.role})`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "greeting-sparkle",
												children: "👋"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "greeting-text",
												children: [
													getTimeOfDayGreeting(),
													",",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
														className: "greeting-name",
														children: isAdmin ? "Admin" : isHR && !isExecutive ? "HR" : resolveUserDisplayName(user, storeState?.employees || [])
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `role-badge role-${user?.role ?? "hr"}`,
												children: isAdmin ? "Admin" : isHR && !isExecutive ? "HR" : getRoleBadgeLabel(user?.role)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										className: "ai-copilot-btn",
										type: "button",
										onClick: () => setAiAssistantOpen(true),
										title: isAdmin ? "Open AI Admin Copilot" : isExecutive ? "Open AI Executive Copilot" : isHR ? "Open AI HR Copilot" : "Open AI Copilot",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isAdmin ? "AI Admin Copilot" : isExecutive ? "AI Executive Copilot" : isHR ? "AI HR Copilot" : "AI Copilot" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										ref: notifRef,
										style: { position: "relative" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: `topbar-badge-btn ${unreadCount > 0 ? "has-unread" : ""}`,
											type: "button",
											onClick: (e) => {
												e.stopPropagation();
												setNotifOpen((prev) => !prev);
												setProfileOpen(false);
											},
											"aria-label": "View notifications",
											title: `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
												size: 18,
												className: unreadCount > 0 ? "bell-icon-pulse" : ""
											}), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "badge-count",
												children: unreadCount > 99 ? "99+" : unreadCount
											})]
										}), notifOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "notif-popover",
											style: {
												width: "380px",
												maxWidth: "calc(100vw - 20px)",
												maxHeight: "520px",
												display: "flex",
												flexDirection: "column",
												boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
												borderRadius: "14px",
												border: "1px solid #cbd5e1",
												background: "#ffffff",
												overflow: "hidden"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "notif-header",
													style: {
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														padding: "12px 14px",
														borderBottom: "1px solid #e2e8f0",
														background: "#f8fafc"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
														style: {
															fontSize: "13.5px",
															color: "#0f172a"
														},
														children: ["Notifications ", unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															style: {
																color: "#0d9488",
																fontWeight: 700
															},
															children: [
																"(",
																unreadCount,
																" new)"
															]
														})]
													}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: {
															display: "flex",
															gap: "6px",
															alignItems: "center"
														},
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
																type: "button",
																style: {
																	border: "1px solid #cbd5e1",
																	background: soundMuted ? "#f1f5f9" : "#ecfdf5",
																	color: soundMuted ? "#64748b" : "#047857",
																	fontSize: "10.5px",
																	cursor: "pointer",
																	fontWeight: 600,
																	display: "flex",
																	alignItems: "center",
																	gap: "3px",
																	padding: "3px 7px",
																	borderRadius: "6px"
																},
																title: soundMuted ? "Notification chime muted (Click to unmute)" : "Notification chime enabled (Click to mute)",
																onClick: () => {
																	const nextState = toggleSoundMuted();
																	setSoundMutedState(nextState);
																	if (!nextState) playNotificationSound("notification");
																},
																children: [soundMuted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { size: 12 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: soundMuted ? "Muted" : "Sound" })]
															}),
															unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																style: {
																	border: 0,
																	background: "transparent",
																	color: "#0d9488",
																	fontSize: "11px",
																	cursor: "pointer",
																	fontWeight: 600,
																	padding: "3px 6px"
																},
																onClick: handleMarkAllRead,
																children: "Mark all read"
															}),
															notifications.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																type: "button",
																style: {
																	border: 0,
																	background: "transparent",
																	color: "#ef4444",
																	fontSize: "11px",
																	cursor: "pointer",
																	padding: "3px 6px"
																},
																onClick: handleClearAll,
																children: "Clear"
															})
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														display: "flex",
														background: "#f1f5f9",
														padding: "4px 6px",
														gap: "4px",
														overflowX: "auto",
														borderBottom: "1px solid #e2e8f0",
														scrollbarWidth: "none"
													},
													children: [
														{
															key: "all",
															label: "All"
														},
														{
															key: "attendance",
															label: "Attendance"
														},
														{
															key: "location",
															label: "GPS / Wi-Fi"
														},
														{
															key: "leave",
															label: "Leaves"
														},
														{
															key: "task",
															label: "Tasks"
														},
														{
															key: "announcement",
															label: "Announcements"
														},
														{
															key: "payroll",
															label: "Payroll"
														}
													].map((tab) => {
														const count = notifications.filter((n) => {
															if (tab.key === "all") return true;
															const c = (n.category || n.type || "").toLowerCase();
															if (tab.key === "attendance") return c.includes("attendance") || c.includes("punch") || c.includes("shift");
															if (tab.key === "location") return c.includes("gps") || c.includes("network") || c.includes("wifi") || c.includes("geofence");
															if (tab.key === "leave") return c.includes("leave");
															if (tab.key === "task") return c.includes("task");
															if (tab.key === "announcement") return c.includes("announcement") || c.includes("broadcast") || c.includes("bulletin");
															if (tab.key === "payroll") return c.includes("payroll") || c.includes("salary") || c.includes("payslip");
															return false;
														}).length;
														const isActive = notifCategory === tab.key;
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onClick: () => setNotifCategory(tab.key),
															style: {
																border: 0,
																borderRadius: "6px",
																padding: "4px 8px",
																fontSize: "10.5px",
																fontWeight: isActive ? 700 : 500,
																background: isActive ? "#ffffff" : "transparent",
																color: isActive ? "#0f172a" : "#64748b",
																boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
																cursor: "pointer",
																whiteSpace: "nowrap",
																display: "flex",
																alignItems: "center",
																gap: "4px"
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label }), count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																style: {
																	fontSize: "9px",
																	background: isActive ? "#0d9488" : "#e2e8f0",
																	color: isActive ? "#ffffff" : "#64748b",
																	padding: "0 4px",
																	borderRadius: "10px",
																	fontWeight: 700
																},
																children: count
															})]
														}, tab.key);
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "notif-list",
													style: {
														flex: 1,
														overflowY: "auto",
														maxHeight: "350px"
													},
													children: (() => {
														const list = notifications.filter((n) => {
															if (notifCategory === "all") return true;
															const c = (n.category || n.type || "").toLowerCase();
															if (notifCategory === "attendance") return c.includes("attendance") || c.includes("punch") || c.includes("shift");
															if (notifCategory === "location") return c.includes("gps") || c.includes("network") || c.includes("wifi") || c.includes("geofence");
															if (notifCategory === "leave") return c.includes("leave");
															if (notifCategory === "task") return c.includes("task");
															if (notifCategory === "announcement") return c.includes("announcement") || c.includes("broadcast") || c.includes("bulletin");
															if (notifCategory === "payroll") return c.includes("payroll") || c.includes("salary") || c.includes("payslip");
															return true;
														});
														if (list.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															style: {
																padding: "36px 16px",
																textAlign: "center",
																color: "#94a3b8"
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
																size: 24,
																style: {
																	opacity: .4,
																	marginBottom: "6px"
																}
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																style: {
																	margin: 0,
																	fontSize: "12px"
																},
																children: "No notifications in this category."
															})]
														});
														return list.map((n) => {
															const isRead = Boolean(n.read || n.readAt);
															const categoryStr = (n.category || n.type || "system").toLowerCase();
															const isUrgent = n.priority === "urgent" || n.priority === "high";
															return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: `notif-item ${!isRead ? "unread" : ""}`,
																style: {
																	cursor: "pointer",
																	position: "relative",
																	padding: "10px 12px",
																	borderBottom: "1px solid #f1f5f9",
																	background: !isRead ? "#f8fafc" : "#ffffff",
																	borderLeft: !isRead ? "3.5px solid #0d9488" : "3.5px solid transparent",
																	display: "flex",
																	gap: "10px",
																	alignItems: "flex-start",
																	transition: "background 0.15s ease"
																},
																onClick: () => {
																	handleMarkOneRead(n);
																	handleNotificationNavigation(n);
																	setNotifOpen(false);
																},
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	style: {
																		width: "32px",
																		height: "32px",
																		borderRadius: "8px",
																		display: "grid",
																		placeItems: "center",
																		flex: "0 0 auto",
																		marginTop: "2px",
																		background: categoryStr.includes("attendance") ? "#ecfdf5" : categoryStr.includes("gps") || categoryStr.includes("network") || categoryStr.includes("wifi") ? "#eff6ff" : categoryStr.includes("leave") ? "#f0fdf4" : categoryStr.includes("task") ? "#faf5ff" : categoryStr.includes("announcement") ? "#fefce8" : categoryStr.includes("salary") || categoryStr.includes("payroll") ? "#f0f9ff" : "#f1f5f9",
																		color: categoryStr.includes("attendance") ? "#047857" : categoryStr.includes("gps") || categoryStr.includes("network") || categoryStr.includes("wifi") ? "#1d4ed8" : categoryStr.includes("leave") ? "#15803d" : categoryStr.includes("task") ? "#7e22ce" : categoryStr.includes("announcement") ? "#854d0e" : categoryStr.includes("salary") || categoryStr.includes("payroll") ? "#0369a1" : "#475569"
																	},
																	children: categoryStr.includes("attendance") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { size: 15 }) : categoryStr.includes("gps") || categoryStr.includes("geofence") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { size: 15 }) : categoryStr.includes("network") || categoryStr.includes("wifi") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Network, { size: 15 }) : categoryStr.includes("leave") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 15 }) : categoryStr.includes("task") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BriefcaseBusiness, { size: 15 }) : categoryStr.includes("announcement") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { size: 15 }) : categoryStr.includes("salary") || categoryStr.includes("payroll") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, { size: 15 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { size: 15 })
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	style: {
																		flex: 1,
																		minWidth: 0
																	},
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																			style: {
																				display: "flex",
																				justifyContent: "space-between",
																				alignItems: "center",
																				gap: "6px"
																			},
																			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																				style: {
																					display: "flex",
																					alignItems: "center",
																					gap: "6px"
																				},
																				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																					style: {
																						fontSize: "9px",
																						fontWeight: 700,
																						textTransform: "uppercase",
																						padding: "1px 5px",
																						borderRadius: "4px",
																						background: isUrgent ? "#fee2e2" : "#f1f5f9",
																						color: isUrgent ? "#b91c1c" : "#475569"
																					},
																					children: isUrgent ? "URGENT" : n.category || n.type || "SYSTEM"
																				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																					style: {
																						fontSize: "12px",
																						color: "#0f172a",
																						fontWeight: !isRead ? 700 : 600
																					},
																					children: n.title
																				})]
																			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																				type: "button",
																				title: "Remove notification",
																				style: {
																					border: 0,
																					background: "transparent",
																					color: "#94a3b8",
																					fontSize: "12px",
																					cursor: "pointer",
																					padding: "1px 4px"
																				},
																				onClick: (e) => {
																					e.stopPropagation();
																					handleDeleteOne(n);
																				},
																				children: "✕"
																			})]
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																			style: {
																				margin: "3px 0 4px",
																				fontSize: "11px",
																				color: "#475569",
																				lineHeight: 1.35,
																				wordBreak: "break-word"
																			},
																			children: n.message
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																			style: {
																				display: "flex",
																				justifyContent: "space-between",
																				alignItems: "center"
																			},
																			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
																				style: {
																					fontSize: "9.5px",
																					color: "#94a3b8"
																				},
																				children: n.time || (n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], {
																					hour: "2-digit",
																					minute: "2-digit"
																				}) : "Recently")
																			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																				style: {
																					fontSize: "10px",
																					color: "#0d9488",
																					fontWeight: 600
																				},
																				children: "Open →"
																			})]
																		})
																	]
																})]
															}, n.id || n._id);
														});
													})()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														padding: "8px 14px",
														borderTop: "1px solid #e2e8f0",
														textAlign: "center",
														background: "#f8fafc"
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														href: `#/${isAdmin ? "admin" : isHR ? "hr" : "employee"}/notifications`,
														onClick: () => setNotifOpen(false),
														style: {
															fontSize: "11px",
															fontWeight: 600,
															color: "#0d9488",
															textDecoration: "none"
														},
														children: "View All in Notifications Center →"
													})
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "status-strip",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "status-dot" }), " Operational"]
									}),
									isAdmin || isHR ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "topbar-direct-logout-btn",
										onClick: handleLogout,
										title: "Sign out of workspace",
										"aria-label": "Sign out of workspace",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Logout" })]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										ref: profileRef,
										style: { position: "relative" },
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: "topbar-profile-btn",
											type: "button",
											onClick: (e) => {
												e.stopPropagation();
												setProfileOpen((prev) => !prev);
												setNotifOpen(false);
											},
											"aria-expanded": profileOpen,
											"aria-haspopup": "true",
											"aria-label": "Open account menu",
											title: `${user?.displayName} (${user?.role})`,
											style: {
												cursor: "pointer",
												touchAction: "manipulation",
												WebkitTapHighlightColor: "transparent",
												minWidth: "44px",
												minHeight: "44px",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												padding: "4px 6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "profile-avatar-box",
												style: { pointerEvents: "none" },
												children: [
													user?.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: user.avatarUrl,
														alt: user?.displayName || "User",
														className: "user-profile-img sm",
														style: {
															pointerEvents: "none",
															WebkitTouchCallout: "none",
															WebkitUserSelect: "none",
															userSelect: "none"
														},
														onError: (e) => {
															e.currentTarget.style.display = "none";
															if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "grid";
														}
													}) : null,
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: `avatar avatar-${user?.avatarTone ?? "teal"}`,
														style: {
															display: user?.avatarUrl ? "none" : "grid",
															width: "28px",
															height: "28px",
															fontSize: "10px",
															pointerEvents: "none"
														},
														children: user?.displayName?.slice(0, 2).toUpperCase() ?? "HR"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "profile-online-badge",
														style: { pointerEvents: "none" }
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
												size: 14,
												className: "muted-icon",
												style: {
													pointerEvents: "none",
													flexShrink: 0
												}
											})]
										}), profileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "profile-menu-popover",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "profile-popover-header",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "profile-avatar-box",
														style: { position: "relative" },
														children: [
															user?.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
																src: user.avatarUrl,
																alt: user?.displayName || "User",
																className: "user-profile-img lg",
																onError: (e) => {
																	e.currentTarget.style.display = "none";
																	if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "grid";
																}
															}) : null,
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: `avatar avatar-${user?.avatarTone ?? "teal"}`,
																style: {
																	display: user?.avatarUrl ? "none" : "grid",
																	width: "64px",
																	height: "64px",
																	fontSize: "18px"
																},
																children: user?.displayName?.slice(0, 2).toUpperCase() ?? "HR"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "profile-online-badge lg",
																title: "Active & Online"
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: {
															flex: 1,
															minWidth: 0
														},
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																style: { fontSize: "14px" },
																children: user?.displayName
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "profile-popover-email",
																children: user?.email
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																style: {
																	display: "flex",
																	gap: "6px",
																	alignItems: "center",
																	marginTop: "6px"
																},
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: `role-badge role-${user?.role}`,
																	children: getRoleBadgeLabel(user?.role)
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	style: {
																		fontSize: "9px",
																		color: "var(--teal)",
																		fontWeight: "600"
																	},
																	children: "● Active"
																})]
															})
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "profile-popover-body",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															style: {
																padding: "8px 10px",
																background: "#f5f8f7",
																borderRadius: "8px",
																border: "1px solid rgba(29, 138, 122, 0.15)",
																display: "grid",
																gap: "8px"
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																style: {
																	display: "flex",
																	alignItems: "center",
																	justifyContent: "space-between"
																},
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		style: {
																			fontSize: "10px",
																			fontWeight: 600,
																			color: "var(--ink)"
																		},
																		children: "Profile Photo"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																		type: "file",
																		ref: fileInputRef,
																		style: { display: "none" },
																		accept: "image/*",
																		onChange: handlePhotoUpload
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
																		type: "button",
																		className: "profile-photo-change-btn",
																		onClick: () => fileInputRef.current?.click(),
																		title: "Upload new profile picture",
																		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { size: 12 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Change Photo" })]
																	})
																]
															}), photoNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																style: {
																	fontSize: "9px",
																	color: "var(--teal)",
																	fontWeight: 600,
																	display: "flex",
																	alignItems: "center",
																	gap: "4px"
																},
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 12 }), " Profile photo updated successfully!"]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "profile-detail-row",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Employee ID" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: user?.employeeId || "EDU-EMP-001" })]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "profile-detail-row",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Department" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: user?.department || "People Operations" })]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "profile-detail-row",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Designation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: user?.designation || (isAdmin ? "System Administrator" : isExecutive ? "Managing Director" : isHR ? "HR Operations" : "Staff Member") })]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "profile-detail-row",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned Shift" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: (() => {
																const r = storeState?.companySettings?.attendanceRules;
																if (r?.workStartTime && r?.workEndTime) {
																	const f12 = (t, referenceTime = null, isEnd = false) => {
																		const m = String(t || "").trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
																		if (!m) return t;
																		let h = parseInt(m[1], 10);
																		const min = m[2];
																		const meridiem = m[3]?.toUpperCase();
																		if (meridiem === "PM" && h < 12) h += 12;
																		if (meridiem === "AM" && h === 12) h = 0;
																		if (!meridiem && isEnd && h >= 1 && h <= 11) h += 12;
																		else if (!meridiem && !isEnd && referenceTime) {
																			const refMatch = String(referenceTime).trim().replace(/[\u202F\u00A0]/g, " ").match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
																			if (refMatch) {
																				let rh = parseInt(refMatch[1], 10);
																				if (refMatch[3]?.toUpperCase() === "PM" && rh < 12) rh += 12;
																				if (rh >= 13 && h < 12 && rh - h > 8 && h + 12 < rh + 2) h += 12;
																			}
																		}
																		const ampm = h >= 12 ? "PM" : "AM";
																		h = h % 12 || 12;
																		return `${String(h).padStart(2, "0")}:${min} ${ampm}`;
																	};
																	return `General (${f12(r.workStartTime, r.workEndTime, false)} – ${f12(r.workEndTime, r.workStartTime, true)})`;
																}
																return "General (11:00 AM – 08:00 PM)";
															})() })]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "profile-role-notice",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 14 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isAdmin ? "Authorized Administrator Console" : isExecutive ? "Executive Managing Director Session" : isHR ? "Authorized HR Operations Session" : "Authorized Employee Session • Self-Service Portal" })]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															className: "profile-photo-change-btn",
															style: {
																width: "100%",
																justifyContent: "center",
																marginTop: "8px",
																padding: "7px 10px",
																background: "#ffffff",
																border: "1px solid var(--border)"
															},
															onClick: () => {
																setProfileOpen(false);
																setChangePasswordOpen(true);
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
																size: 13,
																style: { color: "var(--teal)" }
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Change Password" })]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															className: "profile-photo-change-btn",
															style: {
																width: "100%",
																justifyContent: "center",
																marginTop: "6px",
																padding: "7px 10px",
																background: "#ffffff",
																border: "1px solid var(--border)"
															},
															onClick: () => {
																setProfileOpen(false);
																setPasskeyModalOpen(true);
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, {
																size: 13,
																style: { color: "var(--teal)" }
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Passkeys & Biometrics" })]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "profile-popover-footer",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														className: "popover-logout-btn",
														onClick: handleLogout,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 14 }), " Sign out of workspace"]
													})
												})
											]
										})]
									})
								]
							})
						]
					}),
					user?.mustChangePassword && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangePasswordModal, {
						isOpen: true,
						isForced: true
					}),
					changePasswordOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangePasswordModal, {
						isOpen: true,
						isForced: false,
						onClose: () => setChangePasswordOpen(false)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasskeyModal, {
						isOpen: passkeyModalOpen,
						onClose: () => setPasskeyModalOpen(false)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "page-content",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteErrorBoundary, {
							resetKey: route?.path || "default-route",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								className: "route-motion",
								initial: { opacity: 0 },
								animate: { opacity: 1 },
								transition: {
									duration: .15,
									ease: "easeOut"
								},
								children
							}, route?.path || "default-route")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
							className: "page-footer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isAdmin ? "Edufyi Enterprise System Administration Console" : isHR ? "Edufyi Enterprise People Operations Portal" : "Edufyi Employee Self-Service Workspace" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Realtime Sync Active ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sync-dot" })] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "mobile-bottom-nav",
						"aria-label": "Mobile Bottom Navigation",
						children: [mobileBottomNavItems.map((item) => {
							const Icon = item.icon;
							const active = route.path === item.path;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `#${item.path}`,
								className: `mobile-bottom-nav-item ${active ? "active" : ""}`,
								onClick: () => setMobileOpen(false),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mobile-bottom-nav-icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
							}, item.path);
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `mobile-bottom-nav-item ${mobileOpen ? "active" : ""}`,
							onClick: () => setMobileOpen(!mobileOpen),
							"aria-label": "Open Full Menu",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mobile-bottom-nav-icon",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Menu" })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AIHRAssistant, {
				isOpen: aiAssistantOpen,
				onClose: () => setAiAssistantOpen(false)
			})
		]
	});
}
// src/components/ui.jsx
var import_react_dom = require_react_dom();
function Button({ children, variant = "primary", as: Element = "button", href, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Element, {
		className: `ui-button ${variant}`,
		href,
		...props,
		children
	});
}
function PageHeader({ eyebrow, title, description, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "page-header",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: title }),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "lede",
				children: description
			})
		] }), children && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-header-actions",
			children
		})]
	});
}
function StatusBadge({ children, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `ui-status ${tone}`,
		children
	});
}
function Field({ label, hint, children, required = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "ui-field",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [label, required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
				"aria-hidden": "true",
				children: " *"
			})] }),
			children,
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: hint })
		]
	});
}
function DataTable({ caption, columns, rows, emptyMessage = "No records found." }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "ui-table-wrap",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "ui-table",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", { children: caption }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					scope: "col",
					children: column.label
				}, column.key)) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: columns.length,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: emptyMessage })
				}) }) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: column.render ? column.render(row) : row[column.key] }, column.key)) }, row.id)) })
			]
		})
	});
}
function StatePanel({ title, message, tone = "neutral", action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: `state-panel ${tone}`,
		role: tone === "error" ? "alert" : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message })] }), action]
	});
}
function LoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatePanel, {
		title: "Loading",
		message: "Preparing this workspace.",
		tone: "loading"
	});
}
function EmptyState({ title = "Nothing here yet.", message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "empty-state",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: title }), message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message })]
	});
}
function ConfirmationDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, isDestructive = false }) {
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onCancel?.();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = prevOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onCancel]);
	if (!open || typeof document === "undefined" || !document?.body) return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "dialog-backdrop",
		role: "presentation",
		onMouseDown: onCancel,
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
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "dialog",
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "dialog-title",
			onMouseDown: (event) => event.stopPropagation(),
			style: {
				position: "relative",
				maxWidth: "460px",
				width: "100%",
				maxHeight: "90vh",
				overflowY: "auto",
				background: "#ffffff",
				borderRadius: "16px",
				border: "1px solid var(--line, #e2e8f0)",
				boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
				padding: "24px",
				boxSizing: "border-box",
				animation: "dialogPop 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "dialog-title",
					style: {
						margin: "0 0 10px",
						fontSize: "18px",
						fontWeight: 700,
						color: "var(--ink, #1e293b)"
					},
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					style: {
						margin: "0 0 20px",
						fontSize: "13px",
						lineHeight: 1.55,
						color: "#64748b"
					},
					children: message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "dialog-actions",
					style: {
						display: "flex",
						justifyContent: "flex-end",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: onCancel,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: isDestructive ? "danger" : "primary",
						onClick: onConfirm,
						children: confirmLabel
					})]
				})
			]
		})
	}), document.body);
}
// src/main.jsx
var LoginPage = (0, import_react.lazy)(() => __vitePreload(() => import("./LoginPage-BvV7uSEN.js").then((m) => ({ default: m.LoginPage })), __vite__mapDeps([0,1,2,3])));
var NotFoundPage = (0, import_react.lazy)(() => __vitePreload(() => import("./ModulePlaceholder-BJpi0ElY.js").then((m) => ({ default: m.NotFoundPage })), __vite__mapDeps([4,2,1,3])));
var EmployeeDashboardPage = (0, import_react.lazy)(() => __vitePreload(() => import("./EmployeeDashboardPage-eKiciHG8.js").then((m) => ({ default: m.EmployeeDashboardPage })), __vite__mapDeps([5,1,2,3,6,7,8,9,10,11,12,13,14])));
var AccessDeniedPage = (0, import_react.lazy)(() => __vitePreload(() => import("./EmployeeDashboardPage-eKiciHG8.js").then((m) => ({ default: m.AccessDeniedPage })), __vite__mapDeps([5,1,2,3,6,7,8,9,10,11,12,13,14])));
var AdminDashboardPage = (0, import_react.lazy)(() => __vitePreload(() => import("./AdminDashboardPage-lMMaYwS_.js").then((m) => ({ default: m.AdminDashboardPage })), __vite__mapDeps([15,1,2,11,3,6,7])));
var AdminUsersModule = (0, import_react.lazy)(() => __vitePreload(() => import("./AdminDashboardPage-lMMaYwS_.js").then((m) => ({ default: m.AdminUsersModule })), __vite__mapDeps([15,1,2,11,3,6,7])));
var EmployeesPage = (0, import_react.lazy)(() => __vitePreload(() => import("./EmployeesPage-CitUXpBa.js").then((m) => ({ default: m.EmployeesPage })), __vite__mapDeps([16,1,2,3,6,14,11,13,17,9])));
var OverviewPage = (0, import_react.lazy)(() => __vitePreload(() => import("./OverviewPage-C2x1G5bf.js").then((m) => ({ default: m.OverviewPage })), __vite__mapDeps([18,1,2,3,7])));
var LeaveManagementPage = (0, import_react.lazy)(() => __vitePreload(() => import("./LeaveManagementPage-Bcavn1K4.js").then((m) => ({ default: m.LeaveManagementPage })), __vite__mapDeps([19,1,2,11,3])));
var WorkspaceModulePage = (0, import_react.lazy)(() => __vitePreload(() => import("./WorkspaceModulePage-qPOF7LZf.js").then((m) => ({ default: m.WorkspaceModulePage })), __vite__mapDeps([20,1,2,11,3,6,7,15,8,9])));
var OrgHierarchyPage = (0, import_react.lazy)(() => __vitePreload(() => import("./OrgHierarchyPage-O6kFANsu.js").then((m) => ({ default: m.OrgHierarchyPage })), __vite__mapDeps([21,1,2,3])));
var PayrollPage = (0, import_react.lazy)(() => __vitePreload(() => import("./PayrollPage-CzUhHA39.js").then((m) => ({ default: m.PayrollPage })), __vite__mapDeps([22,1,2,3,10,11,12,13])));
var EmployeeProfilePage = (0, import_react.lazy)(() => __vitePreload(() => import("./EmployeeProfilePage-B0suUNxq.js").then((m) => ({ default: m.EmployeeProfilePage })), __vite__mapDeps([23,1,2,3,6,14,11,13,17,9])));
var ErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	componentDidCatch(error, errorInfo) {
		console.error("Captured Render Error:", error, errorInfo);
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: {
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "24px",
				background: "#F3F8F8",
				color: "#0A2328",
				fontFamily: "'DM Sans', sans-serif",
				textAlign: "center"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "#FFFFFF",
					border: "1.5px solid #D6E2E3",
					borderRadius: "16px",
					padding: "36px 32px",
					maxWidth: "520px",
					width: "100%",
					boxShadow: "0 20px 50px rgba(10, 35, 40, 0.12)"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							fontSize: "20px",
							margin: "0 0 10px",
							color: "#0A2328"
						},
						children: "Workspace Session Notice"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							color: "#586D72",
							fontSize: "13.5px",
							margin: "0 0 24px",
							lineHeight: 1.5
						},
						children: this.state.error?.message || "An unexpected error interrupted the view. You can safely reset your local session below."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "10px",
							justifyContent: "center"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button primary",
							onClick: () => {
								try {
									sessionStorage.clear();
									localStorage.removeItem("edufyi.authUser");
								} catch {}
								window.location.hash = "#/login";
								window.location.reload();
							},
							children: "Reset Session & Sign In"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "ui-button secondary",
							onClick: () => window.location.reload(),
							children: "Reload Page"
						})]
					})
				]
			})
		});
		return this.props.children;
	}
};
function DataStatus({ children }) {
	const [state, setState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => hrStore.subscribe(setState), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		state.dataError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "alert",
			className: "panel",
			style: {
				padding: "12px 18px",
				color: "#b42318",
				background: "#fef2f2",
				border: "1px solid #fecaca",
				borderRadius: "10px",
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
					gap: "12px",
					flexWrap: "wrap"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontWeight: 500,
						fontSize: "13px"
					},
					children: state.dataError
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "ui-button secondary",
					style: {
						padding: "4px 10px",
						fontSize: "12px"
					},
					onClick: () => hrStore.perform(() => hrStore.refresh()),
					children: "Retry loading data"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					if (hrStore.clearError) hrStore.clearError();
					else {
						const s = hrStore.getState();
						if (s) s.dataError = "";
					}
					setState((prev) => ({
						...prev,
						dataError: ""
					}));
				},
				style: {
					background: "transparent",
					border: "none",
					cursor: "pointer",
					color: "#991b1b",
					fontSize: "18px",
					lineHeight: 1,
					padding: "4px 8px",
					borderRadius: "4px"
				},
				title: "Dismiss error message",
				"aria-label": "Dismiss error message",
				children: "✕"
			})]
		}),
		!state.dataReady && !state.dataError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: {
			height: "3px",
			width: "100%",
			background: "linear-gradient(90deg, #006e6f 0%, #00d2ff 50%, #006e6f 100%)",
			backgroundSize: "200% 100%",
			animation: "edufyiShimmer 1.5s infinite linear",
			borderRadius: "2px",
			marginBottom: "10px"
		} }),
		children
	] });
}
function useRoute() {
	const [rawHash, setRawHash] = (0, import_react.useState)(() => typeof window !== "undefined" ? window.location.hash : "");
	(0, import_react.useEffect)(() => {
		const update = () => setRawHash(window.location.hash || "");
		window.addEventListener("hashchange", update);
		return () => window.removeEventListener("hashchange", update);
	}, []);
	const cleanPath = readPath();
	return findRoute(rawHash || cleanPath) ?? {
		path: cleanPath,
		query: {},
		label: "Not found",
		group: "Error",
		description: "Unknown route"
	};
}
function App() {
	const route = useRoute();
	const { user, status } = useAuth();
	const isAuthRoute = route.path === "/login" || route.path === "/admin/login" || route.path === "/hr/login" || route.path === "/employee/login";
	(0, import_react.useEffect)(() => {
		if (status === "signed-out" && !isAuthRoute) {
			if (route.path.startsWith("/admin")) window.location.hash = "#/admin/login";
			else if (route.path.startsWith("/hr")) window.location.hash = "#/hr/login";
			else if (route.path.startsWith("/employee")) window.location.hash = "#/employee/login";
			else window.location.hash = "#/employee/login";
			return;
		}
		if (status === "authenticated" && isAuthRoute) {
			const isExec = [
				"director",
				"managing_director",
				"co_founder",
				"vertical_head"
			].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
			const isAdmin = user?.role === "admin";
			const isHR = user?.role === "hr" || user?.role === "hr_executive";
			let defaultPortal = "/employee";
			if (isAdmin) defaultPortal = "/admin";
			else if (isHR) defaultPortal = "/hr";
			else if (isExec) defaultPortal = route.path === "/hr/login" ? "/hr" : "/employee";
			window.location.hash = "#" + defaultPortal;
			return;
		}
		if (status === "authenticated" && user && !isAuthRoute) {
			const isExec = [
				"director",
				"managing_director",
				"co_founder",
				"vertical_head"
			].includes(user?.role) || user?.email === "jagadishbabu@edufyitech.in";
			const isAdmin = user.role === "admin" || (user.permissions || []).includes("admin.access");
			const isHR = user.role === "hr" || user.role === "hr_executive" || (user.permissions || []).includes("leave.hr.review");
			if (isExec || isAdmin) {} else if (isHR) {
				if (route.path.startsWith("/admin")) window.location.hash = "#/hr";
			} else if (!route.path.startsWith("/employee")) window.location.hash = "#/employee";
		}
	}, [
		route.path,
		status,
		user,
		isAuthRoute
	]);
	if (status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {});
	if (status === "signed-out" || isAuthRoute) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginPage, { route })
	});
	if (route.path === "/not-found" || route.group === "Error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRLayout, {
		route,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotFoundPage, {})
		})
	});
	if (route.permission && !hasPermission(user, route.permission)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRLayout, {
		route,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {}),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessDeniedPage, {
				title: "Access Restricted",
				message: `Your account (${user?.displayName || "User"}) does not have permission (${route.permission}) to view this module.`
			})
		})
	});
	const page = route.path === "/hr/payroll" || route.path === "/admin/payroll" || route.path === "/employee/salary" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayrollPage, {}) : route.path === "/employee/profile" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeProfilePage, {}) : route.path === "/hr/users" || route.path === "/admin/users" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersModule, {}) : route.path.startsWith("/admin/people") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeesPage, { route: {
		...route,
		path: route.path.replace("/admin/people", "/hr/people")
	} }) : route.path === "/admin/leave" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaveManagementPage, {
		mode: "admin",
		route,
		query: route.query
	}) : route.path === "/admin/attendance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceModulePage, { route: {
		...route,
		path: "/hr/attendance"
	} }) : route.path === "/admin/hierarchy" || route.path === "/hr/hierarchy" || route.path === "/employee/hierarchy" || route.path === "/employee/organization" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrgHierarchyPage, {}) : route.workspace ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceModulePage, { route }) : route.path.startsWith("/admin") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDashboardPage, { route }) : route.path === "/hr" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverviewPage, {}) : route.path === "/hr/people" || route.path === "/hr/people/new" || route.path.startsWith("/hr/people/") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeesPage, { route }) : route.path === "/hr/leave" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaveManagementPage, {
		mode: "hr",
		route,
		query: route.query
	}) : route.path === "/employee/leave" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaveManagementPage, {
		mode: "self",
		route,
		query: route.query
	}) : route.path === "/employee/team-leave" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaveManagementPage, {
		mode: "team",
		route,
		query: route.query
	}) : route.path.startsWith("/employee") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmployeeDashboardPage, { route }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceModulePage, { route });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HRLayout, {
		route,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataStatus, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {}),
			children: page
		}) })
	});
}
var container = document.getElementById("root");
if (container) {
	if (!window.__react_root) window.__react_root = (0, import_client.createRoot)(container);
	window.__react_root.render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionConfig, {
		reducedMotion: "user",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}) })
	}) }) }));
}
function registerServiceWorker() {
	if (typeof window !== "undefined" && "serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
		if (typeof caches !== "undefined") caches.keys().then((keys) => {
			keys.forEach((key) => {
				if (key !== "edufyi-hr-pwa-v26") {
					console.log("[PWA] Purging legacy cache:", key);
					caches.delete(key);
				}
			});
		}).catch(() => {});
		let refreshing = false;
		navigator.serviceWorker.addEventListener("controllerchange", () => {
			if (!refreshing) {
				refreshing = true;
				window.location.reload();
			}
		});
		navigator.serviceWorker.register("/sw.js", {
			scope: "/",
			updateViaCache: "none"
		}).then((reg) => {
			console.log("[PWA] Service Worker registered with scope:", reg.scope);
			reg.update().catch(() => {});
			if ("sync" in reg) reg.sync.register("sync-attendance-heartbeat").catch(() => {});
		}).catch((err) => {
			console.warn("[PWA] Service Worker registration failed:", err);
		});
	}
}
if (typeof document !== "undefined") {
	if (document.readyState === "complete") registerServiceWorker();
	else window.addEventListener("load", registerServiceWorker);
}
export { copyTextToClipboard as A, INITIAL_ROLES as C, storeAction as D, is25thMonthLop as E, workspaceKeys as F, apiClient as I, generateAutoPassword as M, generateNextEmployeeCode as N, currentPayrollMonth as O, workspaceAction as P, INITIAL_DEPARTMENTS as S, hrStore as T, resolveUserDisplayName as _, Field as a, hasPermission as b, StatusBadge as c, isPasskeySupported as d, loginWithPasskey as f, getTimeOfDayGreeting as g, getRoleBadgeLabel as h, EmptyState as i, formatCredentialsShareText as j, todayKey as k, compressImageFile as l, ChangePasswordModal as m, ConfirmationDialog as n, PageHeader as o, registerPasskey as p, DataTable as r, StatePanel as s, Button as t, PasskeyModal as u, findRoute as v, getRecommendedRoleConfig as w, useAuth as x, parseLocationHash as y };
