import { n as __toESM } from "./rolldown-runtime-CO0Nlsmt.js";
import { $t as Calendar, A as ShieldCheck, Bt as Clock, Dt as FileText, F as Server, Ft as Download, Gt as CircleAlert, It as DollarSign, K as Plus, Kt as ChevronUp, L as Search, Mt as Eye, Nt as EyeOff, Ot as FileSpreadsheet, Pt as ExternalLink, Rt as Copy, St as Globe, T as SquarePen, V as RefreshCw, Wt as CircleCheck, Xt as Check, Yt as ChevronDown, _n as require_react, _t as Key, a as Wifi, an as Building, at as MapPin, ct as Lock, d as Users, fn as Award, g as Upload, gn as Activity, gt as Laptop, h as UserCheck, ht as Layers, i as X, j as ShieldAlert, k as Shield, m as UserPlus, mn as ArrowRight, on as Briefcase, ot as Mail, y as Trash, z as RotateCcw } from "./icons-vendor-CNlTUIuG.js";
import { r as require_react_dom } from "./react-vendor-B_MMQ54z.js";
import { a as require_jsx_runtime } from "./motion-vendor-3i60tGNx.js";
import { A as copyTextToClipboard, D as storeAction, F as workspaceKeys, I as apiClient, M as generateAutoPassword, N as generateNextEmployeeCode, P as workspaceAction, S as INITIAL_DEPARTMENTS, T as hrStore, c as StatusBadge, h as getRoleBadgeLabel, i as EmptyState, j as formatCredentialsShareText, k as todayKey, o as PageHeader, t as Button, w as getRecommendedRoleConfig, x as useAuth } from "./index-CdIjzjfh.js";
import { n as formatINR } from "./currency-oCUzM0NR.js";
import { n as HolidayCalendarShowcase, t as CalendarWidgets } from "./CalendarWidgets-Ds8RnXF5.js";
// src/pages/AdminDashboardPage.jsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_react_dom = require_react_dom();
var import_jsx_runtime = require_jsx_runtime();
function AdminModalPortal({ children }) {
	if (typeof document === "undefined" || !document?.body) return null;
	return (0, import_react_dom.createPortal)(children, document.body);
}
function AdminOverviewModule({ onNavigate }) {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState({
			...state,
			companySettings: {
				...state.companySettings || {},
				locations: [...state.companySettings?.locations || []]
			},
			holidays: [...state.holidays || []]
		}));
	}, []);
	const users = storeState.users || [];
	const employees = storeState.employees || [];
	const audits = (storeState.auditLogs || []).slice(0, 8);
	const wifiList = [...new Set((storeState.companySettings?.allowedWifiSSIDs || []).map((s) => /airtel|dji|3052/i.test(s) ? "Edufyi" : s))].filter(Boolean);
	const locations = storeState.companySettings?.locations || [];
	const roles = hrStore.getRoles();
	const departments = hrStore.getDepartments();
	const pendingAdminLeaves = (storeState.leaves || []).filter((l) => l.status === "pending_admin");
	const todayStr = todayKey();
	const todayAttendance = (storeState.attendance || []).filter((a) => a.date === todayStr);
	const activeEmployees = employees.filter((e) => e.status === "active" || e.status === "onboarding").length;
	const punchedInCount = todayAttendance.filter((a) => Boolean(a.checkIn) && !a.checkOut).length;
	const punchedOutCount = todayAttendance.filter((a) => Boolean(a.checkIn) && Boolean(a.checkOut)).length;
	const checkedInEmpIds = new Set(todayAttendance.filter((a) => Boolean(a.checkIn)).map((a) => String(a.employeeId || "").toUpperCase()));
	const notPunchedInCount = Math.max(0, activeEmployees - checkedInEmpIds.size);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "System Administration",
				title: "Admin Control Center",
				description: "Comprehensive organizational governance, role-based access control, security audits, and global infrastructure parameters.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						gap: "8px",
						alignItems: "center"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "role-badge",
						style: {
							background: "#f6eff7",
							color: "#88438e",
							border: "1px solid #e5cde7",
							fontWeight: 600
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							size: 12,
							style: {
								display: "inline",
								marginRight: "4px"
							}
						}), "Superadmin Session Active"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/admin/users",
						className: "ui-button secondary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 13 }), " Manage System Users"]
					})]
				})
			}),
			pendingAdminLeaves.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
					border: "1px solid #f87171",
					borderRadius: "12px",
					padding: "14px 18px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					boxShadow: "0 2px 8px rgba(239, 68, 68, 0.08)"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						alignItems: "center",
						gap: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							background: "#ef4444",
							color: "#fff",
							borderRadius: "8px",
							padding: "8px",
							display: "flex"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { size: 20 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
						style: {
							color: "#991b1b",
							fontSize: "13px",
							display: "block"
						},
						children: [
							"Action Required: ",
							pendingAdminLeaves.length,
							" Month-End (25th+) LOP Leave Request(s) Awaiting Admin Sign-off"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						style: {
							color: "#b91c1c",
							fontSize: "11px"
						},
						children: "HR Operations has verified these 25th month LOP requests and escalated them to the Admin Panel for final administrative authorization."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#/admin/leave?tab=lop&filter=pending_admin",
					className: "ui-button",
					style: {
						background: "#b91c1c",
						color: "#ffffff",
						border: "none",
						padding: "8px 16px",
						borderRadius: "8px",
						fontSize: "12px",
						fontWeight: 600,
						textDecoration: "none",
						whiteSpace: "nowrap",
						display: "inline-flex",
						alignItems: "center",
						gap: "6px"
					},
					children: ["Review LOP Approvals ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 13 })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "overview-hero",
				style: { gridTemplateColumns: "1fr" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hero-card main-hero",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hero-card-header",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Operational Health"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Workforce Overview & Stability" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: "info",
									children: "Live Sync"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#/admin/attendance",
									className: "ui-button",
									style: {
										fontSize: "11px",
										padding: "5px 12px",
										textDecoration: "none"
									},
									children: ["View Timesheets ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
								gap: "14px",
								margin: "20px 0 16px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: "var(--surface-sunken)",
										border: "1px solid var(--border)",
										borderRadius: "10px",
										padding: "14px 16px",
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
												size: 16,
												style: { color: "var(--primary)" }
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												font: "700 30px \"Space Grotesk\", sans-serif",
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
											children: "Registered employees"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#/admin/attendance",
									title: "Click to view employees working now",
									style: {
										textDecoration: "none",
										background: "rgba(16, 185, 129, 0.08)",
										border: "1px solid rgba(16, 185, 129, 0.3)",
										borderRadius: "10px",
										padding: "14px 16px",
										display: "flex",
										flexDirection: "column",
										gap: "4px",
										cursor: "pointer"
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
												font: "700 30px \"Space Grotesk\", sans-serif",
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
											children: "Working on-site now → View roster"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#/admin/attendance",
									title: "Click to view employees who punched out",
									style: {
										textDecoration: "none",
										background: "rgba(2, 132, 199, 0.08)",
										border: "1px solid rgba(2, 132, 199, 0.3)",
										borderRadius: "10px",
										padding: "14px 16px",
										display: "flex",
										flexDirection: "column",
										gap: "4px",
										cursor: "pointer"
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
												size: 16,
												style: { color: "#0284c7" }
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												font: "700 30px \"Space Grotesk\", sans-serif",
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
											children: "Shift completed today → View roster"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#/admin/attendance",
									title: "Click to view employees not checked in",
									style: {
										textDecoration: "none",
										background: "var(--surface-sunken)",
										border: "1px solid var(--border)",
										borderRadius: "10px",
										padding: "14px 16px",
										display: "flex",
										flexDirection: "column",
										gap: "4px",
										cursor: "pointer"
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
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
												size: 16,
												style: { color: "var(--muted)" }
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												font: "700 30px \"Space Grotesk\", sans-serif",
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
											children: "Pending punch or off → View roster"
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hero-footnote",
							style: {
								borderTop: "1px solid var(--border)",
								paddingTop: "12px",
								marginTop: "12px",
								display: "flex",
								justifyContent: "space-between",
								flexWrap: "wrap",
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
								size: 13,
								style: {
									color: "#10b981",
									display: "inline",
									marginRight: "4px"
								}
							}), " Real-time Office Wi-Fi & GPS Geofence Synchronized"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
									size: 13,
									style: {
										color: "#0284c7",
										display: "inline",
										marginRight: "4px"
									}
								}),
								" Attendance Rate Today: ",
								activeEmployees > 0 ? Math.round((punchedInCount + punchedOutCount) / activeEmployees * 100) : 0,
								"% (",
								punchedInCount + punchedOutCount,
								" of ",
								activeEmployees,
								" checked in)"
							] })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				style: { margin: "18px 0 22px" },
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
						children: "Calendar & Workforce Milestones"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11.5px",
							color: "var(--muted, #64748b)"
						},
						children: "Holidays, employee birthdays, team anniversaries, and Google Meet video conferences"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#/admin/settings",
						style: {
							fontSize: "12px",
							fontWeight: 700,
							color: "var(--teal, #006E6F)",
							textDecoration: "none"
						},
						children: "Manage Calendar →"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarWidgets, { user: { role: "admin" } })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "metric-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/admin/users",
						className: "metric-card metric-link",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "metric-icon",
								style: {
									background: "#eef2f6",
									color: "var(--blue)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 20 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "System Users" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [users.length, " Registered"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [users.filter((u) => u.status === "active").length, " Active Accounts"] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "metric-link-icon"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/admin/roles",
						className: "metric-card metric-link",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "metric-icon",
								style: {
									background: "#eaf4f1",
									color: "var(--teal)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { size: 20 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Access Control" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [roles.length, " RBAC Roles"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
										roles.filter((r) => !r.isSystem).length,
										" Custom • ",
										roles.filter((r) => r.isSystem).length,
										" System"
									] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "metric-link-icon"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/admin/departments",
						className: "metric-card metric-link",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "metric-icon",
								style: {
									background: "#fef3e7",
									color: "#c25e00"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { size: 20 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Departments" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [departments.length, " Teams"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Workforce Organizational Units" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "metric-link-icon"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/admin/settings",
						className: "metric-card metric-link",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "metric-icon",
								style: {
									background: "#fbf3e6",
									color: "#b97926"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 20 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Office Wi-Fi Networks" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [wifiList.length, " Verified SSIDs"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [locations.length, " Global Branch Locations"] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "metric-link-icon"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/admin/system",
						className: "metric-card metric-link",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "metric-icon",
								style: {
									background: "#f5fbf9",
									color: "var(--teal)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, { size: 20 })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "System Health" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "var(--teal)" },
										children: "100% Operational"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "MongoDB Atlas & API in sync" })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 14,
								className: "metric-link-icon"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "foundation-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel foundation-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "User Governance"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "User Management" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: { fontSize: "10px" },
								children: "Active"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "foundation-copy",
							children: "Provision employee access credentials, assign hierarchical roles, update account metadata, reset lost passwords, and enforce security deactivation."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "primitive-list",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#/admin/users",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 13 }),
										" Add & Provision Users ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#/admin/roles",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { size: 13 }),
										" Role & Access Control ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#/admin/departments",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { size: 13 }),
										" Departments & Teams ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel foundation-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-heading",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Configuration"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Company Settings & Rules" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: { fontSize: "10px" },
								children: "Global"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "foundation-copy",
							children: "Manage enterprise Wi-Fi SSIDs for attendance punch verification, maintain the official 2026 holiday calendar, and define annual leave allowances."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "primitive-list",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#/admin/settings",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { size: 13 }),
									" Manage Verified Wi-Fi SSIDs ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#/admin/reports",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { size: 13 }),
									" Analytics & CSV Export ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })
								]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Security Pulse"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "System Audit Log" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#/admin/roles",
						className: "panel-footer-link",
						children: ["View full audit logs ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 12 })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: {
						marginTop: "14px",
						overflowX: "auto"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table compact",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Timestamp" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Actor" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action Type" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Audit Details" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: audits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							style: {
								textAlign: "center",
								color: "var(--muted)",
								padding: "16px"
							},
							children: "No audit records logged yet."
						}) }) : audits.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									fontSize: "11px",
									whiteSpace: "nowrap"
								},
								children: a.timestamp
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: {
									fontSize: "9px",
									background: "#f5f8f7"
								},
								children: a.actor
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: a.action }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									fontSize: "11px",
									color: "var(--ink)"
								},
								children: a.details
							})
						] }, a.id)) })]
					})
				})]
			})
		]
	});
}
function AdminUsersModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [search, setSearch] = (0, import_react.useState)("");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)("all");
	const [campusFilter, setCampusFilter] = (0, import_react.useState)("all");
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [editUser, setEditUser] = (0, import_react.useState)(null);
	const [resetUser, setResetUser] = (0, import_react.useState)(null);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [linkedEmployeeId, setLinkedEmployeeId] = (0, import_react.useState)("");
	const [createdCredentials, setCreatedCredentials] = (0, import_react.useState)(null);
	const [copySuccess, setCopySuccess] = (0, import_react.useState)(false);
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [sendingEmail, setSendingEmail] = (0, import_react.useState)(false);
	const [emailStatus, setEmailStatus] = (0, import_react.useState)(null);
	const [emailMessage, setEmailMessage] = (0, import_react.useState)("");
	const [formName, setFormName] = (0, import_react.useState)("");
	const [formEmail, setFormEmail] = (0, import_react.useState)("");
	const [formEmpId, setFormEmpId] = (0, import_react.useState)("");
	const [formRole, setFormRole] = (0, import_react.useState)("employee");
	const [formDept, setFormDept] = (0, import_react.useState)("Technology");
	const [formDesignation, setFormDesignation] = (0, import_react.useState)("Specialist");
	const [formPassword, setFormPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState({
			...state,
			companySettings: {
				...state.companySettings || {},
				locations: [...state.companySettings?.locations || []]
			},
			holidays: [...state.holidays || []]
		}));
	}, []);
	const rawUsers = storeState.users || [];
	const userEmails = new Set(rawUsers.map((u) => u.email?.toLowerCase()).filter(Boolean));
	const userEmpIds = new Set(rawUsers.map((u) => u.employeeId).filter(Boolean));
	const users = [...rawUsers, ...(storeState.employees || []).filter((emp) => !userEmails.has(emp.email?.toLowerCase()) && !userEmpIds.has(emp.employeeId)).map((emp) => ({
		id: emp.id || emp._id,
		employeeId: emp.employeeId,
		name: emp.name,
		displayName: emp.name,
		email: emp.email,
		role: emp.role || "employee",
		department: emp.department || "General",
		designation: emp.designation || "Pending Designation",
		status: emp.status || "active",
		avatarTone: "teal"
	}))];
	const availableRoles = hrStore.getRoles();
	const availableDepartments = hrStore.getDepartments();
	const availableProfiles = (storeState.employees || []).filter((employee) => !employee.hasLogin && !users.some((account) => account.id === employee.id));
	const usersLoaded = storeState.dataReady && !storeState.dataErrors?.users;
	function handleRoleChange(newRole) {
		setFormRole(newRole);
		const rec = getRecommendedRoleConfig(newRole, formDept);
		if ([
			"director",
			"admin",
			"hr"
		].includes(newRole) || !formDept) {
			setFormDept(rec.department);
			setFormDesignation(rec.designation);
		} else setFormDesignation(rec.designation);
	}
	function handleDeptChange(newDept) {
		setFormDept(newDept);
		const rec = getRecommendedRoleConfig(formRole, newDept);
		setFormDesignation(rec.designation);
	}
	function handleEditRoleChange(newRole) {
		if (!editUser) return;
		const rec = getRecommendedRoleConfig(newRole, editUser.department);
		const shouldSwitchDept = [
			"director",
			"admin",
			"hr"
		].includes(newRole) || !editUser.department || newRole === "director" && editUser.department !== "Executive";
		setEditUser({
			...editUser,
			role: newRole,
			department: shouldSwitchDept ? rec.department : editUser.department,
			designation: rec.designation
		});
	}
	function handleEditDeptChange(newDept) {
		if (!editUser) return;
		const rec = getRecommendedRoleConfig(editUser.role, newDept);
		setEditUser({
			...editUser,
			department: newDept,
			designation: rec.designation
		});
	}
	function startEditUser(u) {
		const isDir = u.role === "director" || u.role === "managing_director" || u.email === "jagadishbabu@edufyitech.in" || u.email === "director@edufyitech.in";
		const cleanDept = isDir ? "Executive" : u.department || "Executive";
		getRecommendedRoleConfig(u.role, cleanDept);
		setEditUser({
			...u,
			department: cleanDept,
			designation: isDir ? u.designation && u.designation.toLowerCase().includes("director") ? u.designation : "Managing Director" : u.designation || "Pending Designation"
		});
	}
	function openCreateModal() {
		setNotice("");
		setLinkedEmployeeId("");
		setFormName("");
		setFormEmail("");
		const nextCode = generateNextEmployeeCode(storeState.employees, users);
		const autoPassword = generateAutoPassword();
		setFormEmpId(nextCode);
		setFormPassword(autoPassword);
		setFormRole("employee");
		const rec = getRecommendedRoleConfig("employee", "Technology");
		setFormDept(rec.department);
		setFormDesignation(rec.designation);
		setShowPassword(false);
		setModalOpen(true);
	}
	function selectProfile(id) {
		setLinkedEmployeeId(id);
		if (!id) {
			setFormName("");
			setFormEmail("");
			const nextCode = generateNextEmployeeCode(storeState.employees, users);
			setFormEmpId(nextCode);
			setFormRole("employee");
			const rec = getRecommendedRoleConfig("employee", "Technology");
			setFormDept(rec.department);
			setFormDesignation(rec.designation);
			return;
		}
		const employee = availableProfiles.find((record) => record.id === id);
		setFormName(employee?.name ?? "");
		setFormEmail(employee?.email ?? "");
		setFormEmpId(employee?.employeeId ?? "");
		setFormRole(employee?.role ?? "employee");
		setFormDept(employee?.department ?? "");
		setFormDesignation(employee?.designation ?? "");
	}
	const empMap = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		(storeState.employees || []).forEach((e) => {
			if (e.employeeId) map.set(e.employeeId.toUpperCase(), e);
			if (e.email) map.set(e.email.toLowerCase(), e);
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
	const filteredUsers = users.filter((u) => {
		const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.employeeId?.toLowerCase().includes(search.toLowerCase());
		const matchesRole = roleFilter === "all" || u.role === roleFilter;
		const emp = empMap.get(u.employeeId?.toUpperCase()) || empMap.get(u.email?.toLowerCase());
		const userCamp = u.campus || emp?.campus || emp?.location || emp?.branch || "Ignite Campus";
		const matchesCampus = campusFilter === "all" || userCamp.toLowerCase() === campusFilter.toLowerCase();
		return matchesSearch && matchesRole && matchesCampus;
	});
	async function handleCreateUser(e) {
		e.preventDefault();
		if (saving) return;
		if (!formName.trim() || !formEmail.trim()) return;
		const finalEmpCode = formEmpId && formEmpId.trim() ? formEmpId.trim().toUpperCase() : generateNextEmployeeCode(storeState.employees, users);
		const finalPassword = formPassword && formPassword.trim() ? formPassword.trim() : generateAutoPassword();
		const payload = {
			name: formName.trim(),
			displayName: formName.trim(),
			email: formEmail.trim().toLowerCase(),
			employeeId: finalEmpCode,
			password: finalPassword,
			role: formRole,
			department: formDept,
			designation: formDesignation
		};
		let createdResult;
		setSaving(true);
		try {
			createdResult = await hrStore.addUser(payload);
			if (createdResult) setStoreState((prev) => {
				const prevUsers = prev.users || [];
				const existingIdx = prevUsers.findIndex((u) => u.email && u.email.toLowerCase() === payload.email.toLowerCase() || u.employeeId && u.employeeId === finalEmpCode || u.id && u.id === createdResult.id);
				let updated;
				if (existingIdx >= 0) {
					updated = [...prevUsers];
					updated[existingIdx] = {
						...updated[existingIdx],
						...createdResult
					};
				} else updated = [createdResult, ...prevUsers];
				return {
					...prev,
					users: updated
				};
			});
		} catch (err) {
			setNotice(`Could not provision login for ${formName}: ${err?.message || "server error"}`);
			setTimeout(() => setNotice(""), 5e3);
			return;
		} finally {
			setSaving(false);
		}
		setModalOpen(false);
		setFormName("");
		setFormEmail("");
		setFormEmpId("");
		setFormPassword("");
		setLinkedEmployeeId("");
		setCopySuccess(false);
		setSendingEmail(false);
		setEmailStatus("success");
		setEmailMessage(`Official credentials email automatically dispatched directly to ${payload.email}!`);
		setCreatedCredentials({
			name: payload.name,
			email: payload.email,
			employeeId: createdResult?.employeeId || finalEmpCode,
			password: finalPassword,
			role: createdResult?.role || payload.role
		});
	}
	async function handleSaveEdit(e) {
		e.preventDefault();
		if (!editUser) return;
		if (saving) return;
		setSaving(true);
		try {
			await hrStore.updateUser(editUser.id, {
				name: editUser.name,
				department: editUser.department,
				designation: editUser.designation,
				role: editUser.role,
				...editUser.employeeId ? { employeeId: String(editUser.employeeId).trim().toUpperCase() } : {}
			});
		} catch (error) {
			setNotice(`Could not update account: ${error.message}`);
			return;
		} finally {
			setSaving(false);
		}
		setEditUser(null);
		setNotice("User record updated successfully!");
		setTimeout(() => setNotice(""), 4e3);
	}
	async function handleExecutePasswordReset(e) {
		e.preventDefault();
		if (!resetUser || !newPassword) return;
		if (saving) return;
		setSaving(true);
		try {
			const targetId = resetUser.id || resetUser._id || resetUser.employeeId;
			await hrStore.resetUserPassword(targetId, newPassword);
		} catch (error) {
			setNotice(`Could not reset password: ${error.message}`);
			return;
		} finally {
			setSaving(false);
		}
		setResetUser(null);
		setNewPassword("");
		setNotice(`Password successfully reset for ${resetUser.name}!`);
		setTimeout(() => setNotice(""), 4e3);
	}
	async function handleToggleStatus(account) {
		if (saving) return;
		setSaving(true);
		try {
			const status = await hrStore.toggleUserStatus(account.id);
			setNotice(`${account.name} is now ${status}. The linked People record was updated.`);
		} catch (error) {
			setNotice(`Could not change status: ${error.message}`);
		} finally {
			setSaving(false);
		}
	}
	async function handleDeleteUser(account) {
		if (saving) return;
		if (!window.confirm(`Permanently delete account for ${account.name}? This removes their login and all linked records and cannot be undone.`)) return;
		setSaving(true);
		try {
			await hrStore.deleteUser(account.id);
			setNotice(`Account for ${account.name} deleted successfully!`);
			setStoreState((prev) => ({
				...prev,
				users: (prev.users || []).filter((u) => u.id !== account.id && u._id !== account.id && u.employeeId !== account.employeeId),
				employees: (prev.employees || []).filter((e) => e.id !== account.id && e._id !== account.id && e.employeeId !== account.employeeId)
			}));
		} catch (error) {
			setNotice(`Could not delete account: ${error.message}`);
		} finally {
			setSaving(false);
		}
		setTimeout(() => setNotice(""), 4e3);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "User Management",
				title: "Users & Accounts Directory",
				description: "Manage corporate user accounts, login credentials, and system access.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					disabled: !usersLoaded,
					onClick: openCreateModal,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 14 }), " Add New User"]
				})
			}),
			storeState.dataErrors?.users && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				children: ["Could not load accounts: ", storeState.dataErrors.users]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 14px",
					background: notice.startsWith("✕") ? "#fee2e2" : "#eaf4f1",
					color: notice.startsWith("✕") ? "#b91c1c" : "var(--teal)",
					border: notice.startsWith("✕") ? "1px solid #fca5a5" : "1px solid #c7ded7",
					borderRadius: "8px",
					fontSize: "12px",
					fontWeight: 600
				},
				children: [notice.startsWith("✕") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					size: 13,
					style: {
						display: "inline",
						marginRight: "6px"
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					size: 13,
					style: {
						display: "inline",
						marginRight: "6px"
					}
				}), notice]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: "10px",
					flexWrap: "wrap",
					alignItems: "center"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						className: "text-input",
						placeholder: "Search by name, email, or employee ID...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						style: {
							width: "260px",
							padding: "6px 10px",
							fontSize: "11px"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "select-control",
						value: campusFilter,
						onChange: (e) => setCampusFilter(e.target.value),
						style: {
							padding: "6px 10px",
							fontSize: "11px",
							minWidth: "130px"
						},
						"aria-label": "Filter by campus",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All Campuses"
						}), availableCampuses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c,
							children: c
						}, c))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "select-control",
						value: roleFilter,
						onChange: (e) => setRoleFilter(e.target.value),
						style: {
							padding: "6px 10px",
							fontSize: "11px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All Roles"
						}), availableRoles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: r.id || r.roleId,
							children: r.name
						}, r.id || r.roleId))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "11px",
							color: "var(--muted)",
							marginLeft: "auto"
						},
						children: [
							"Showing ",
							filteredUsers.length,
							" of ",
							users.length,
							" users"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "attendance-cards-mobile",
					style: {
						display: "none",
						gap: "10px"
					},
					children: filteredUsers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No users found",
						message: "Try searching with a different name or role."
					}) : filteredUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "10px"
									},
									children: [
										u.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: u.avatarUrl,
											alt: u.name || "User",
											style: {
												width: "32px",
												height: "32px",
												borderRadius: "50%",
												objectFit: "cover",
												border: "1.5px solid var(--teal)"
											},
											onError: (e) => {
												e.currentTarget.style.display = "none";
												if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "grid";
											}
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `avatar avatar-${u.avatarTone || "teal"}`,
											style: {
												display: u.avatarUrl ? "none" : "grid",
												width: "32px",
												height: "32px",
												fontSize: "11px"
											},
											children: u.name?.slice(0, 2).toUpperCase() || "U"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "13px" },
											children: u.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "10px",
												color: "var(--muted)"
											},
											children: u.email
										})] })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: u.status === "active" ? "success" : "neutral",
									children: u.status === "active" ? "Active" : "Inactive"
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
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: u.employeeId })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Role: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `role-badge role-${u.role}`,
										style: { fontSize: "9px" },
										children: getRoleBadgeLabel(u.role)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Campus: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { color: "#047857" },
										children: u.campus || empMap.get(u.employeeId?.toUpperCase())?.campus || empMap.get(u.email?.toLowerCase())?.campus || empMap.get(u.employeeId?.toUpperCase())?.location || "Ignite Campus"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: { color: "var(--muted)" },
										children: "Dept: "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: u.department })] })
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
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button secondary",
										style: {
											flex: "1 1 auto",
											fontSize: "11px",
											padding: "5px 8px",
											justifyContent: "center"
										},
										onClick: () => startEditUser(u),
										disabled: saving || u.role === "admin" && u.email === "admin@edufyitech.in",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 11 }), " Edit"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button secondary",
										style: {
											flex: "1 1 auto",
											fontSize: "11px",
											padding: "5px 8px",
											justifyContent: "center"
										},
										onClick: () => setResetUser(u),
										disabled: saving || u.role === "admin" && u.email === "admin@edufyitech.in",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { size: 11 }), " Reset Pass"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "ui-button secondary",
										style: {
											flex: "1 1 auto",
											fontSize: "11px",
											padding: "5px 8px",
											justifyContent: "center",
											color: u.status === "active" ? "#cb3a31" : "var(--teal)"
										},
										onClick: () => handleToggleStatus(u),
										disabled: saving || u.role === "admin",
										children: u.status === "active" ? "Deactivate" : "Activate"
									})
								]
							})
						]
					}, u.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "attendance-table-desktop",
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "User" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee Code" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Campus" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Department" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Assigned Role" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { textAlign: "right" },
								children: "Actions"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "10px",
									alignItems: "center"
								},
								children: [
									u.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: u.avatarUrl,
										alt: u.name || "User",
										style: {
											width: "32px",
											height: "32px",
											borderRadius: "50%",
											objectFit: "cover",
											border: "1.5px solid var(--teal)"
										},
										onError: (e) => {
											e.currentTarget.style.display = "none";
											if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "grid";
										}
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `avatar avatar-${u.avatarTone || "teal"}`,
										style: {
											display: u.avatarUrl ? "none" : "grid",
											width: "32px",
											height: "32px",
											fontSize: "11px"
										},
										children: u.name?.slice(0, 2).toUpperCase() || "U"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: u.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "10px",
											color: "var(--muted)"
										},
										children: u.email
									})] })
								]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: u.employeeId }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: "4px",
									background: "#f0fdf4",
									color: "#166534",
									border: "1px solid #bbf7d0",
									padding: "2px 8px",
									borderRadius: "5px",
									fontSize: "11px",
									fontWeight: 600
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
										size: 10,
										style: { color: "#16a34a" }
									}),
									" ",
									u.campus || empMap.get(u.employeeId?.toUpperCase())?.campus || empMap.get(u.email?.toLowerCase())?.campus || empMap.get(u.employeeId?.toUpperCase())?.location || "Ignite Campus"
								]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: u.department }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `role-badge role-${u.role}`,
								children: getRoleBadgeLabel(u.role)
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								tone: u.status === "active" ? "success" : "neutral",
								children: u.status === "active" ? "Active" : "Inactive"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: { textAlign: "right" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "flex-end",
										gap: "6px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											style: {
												fontSize: "10px",
												padding: "3px 8px"
											},
											onClick: () => startEditUser(u),
											disabled: saving || u.role === "admin" && u.email === "admin@edufyitech.in",
											title: "Edit user details",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 11 }), " Edit"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											style: {
												fontSize: "10px",
												padding: "3px 8px"
											},
											onClick: () => setResetUser(u),
											disabled: saving || u.role === "admin" && u.email === "admin@edufyitech.in",
											title: "Reset user password",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { size: 11 }), " Reset Pass"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "ui-button secondary",
											style: {
												fontSize: "10px",
												padding: "3px 8px",
												color: u.status === "active" ? "#cb3a31" : "var(--teal)"
											},
											onClick: () => handleToggleStatus(u),
											disabled: saving || u.role === "admin",
											title: u.status === "active" ? "Deactivate user" : "Activate user",
											children: u.status === "active" ? "Deactivate" : "Activate"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											style: {
												fontSize: "10px",
												padding: "3px 8px",
												color: "#cb3a31"
											},
											onClick: () => handleDeleteUser(u),
											title: u.role !== "admin" ? "Delete user" : "Admin account cannot be deleted here",
											disabled: saving || u.role === "admin",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 11 }), " Delete"]
										})
									]
								})
							})
						] }, u.id)) })]
					})
				})]
			}),
			modalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setModalOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "540px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Provision New System User"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: "Configure credentials, employee linkage, and access tier"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setModalOpen(false),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateUser,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									style: {
										margin: 0,
										padding: "10px 14px",
										borderRadius: "8px",
										background: "#FEF3E2",
										color: "#B45309",
										fontSize: "12px"
									},
									children: notice
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "profile-link-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "form-label-premium",
												style: { marginBottom: 0 },
												children: "Employee Profile Target"
											}), linkedEmployeeId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10.5px",
													fontWeight: 700,
													color: "var(--primary)",
													background: "rgba(0, 110, 111, 0.1)",
													padding: "2px 8px",
													borderRadius: "999px"
												},
												children: "Linked to existing record"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "select-control",
											"aria-label": "Employee profile",
											value: linkedEmployeeId,
											onChange: (event) => selectProfile(event.target.value),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Create a new employee and account"
											}), availableProfiles.map((employee) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: employee.id,
												children: [
													employee.name,
													" (",
													employee.employeeId || "No ID",
													") — ",
													employee.department || "General"
												]
											}, employee.id))]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "form-hint",
											children: linkedEmployeeId ? "Connects login to this existing employee profile." : "Creates a new employee profile and system account."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Full Legal Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Rachel Adams",
									value: formName,
									readOnly: Boolean(linkedEmployeeId),
									onChange: (e) => setFormName(e.target.value),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Corporate Work Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "email",
									className: "text-input",
									placeholder: "rachel.adams@edufyi.local",
									value: formEmail,
									readOnly: Boolean(linkedEmployeeId),
									onChange: (e) => setFormEmail(e.target.value),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "form-label-premium",
												style: { margin: 0 },
												children: "Employee Code"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--teal)",
													fontWeight: 700,
													background: "rgba(0,110,111,0.1)",
													padding: "2px 7px",
													borderRadius: "4px"
												},
												children: "Auto ETS"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "text-input",
											placeholder: "e.g. ETS21207",
											value: formEmpId,
											readOnly: Boolean(linkedEmployeeId),
											onChange: (e) => setFormEmpId(e.target.value.toUpperCase()),
											style: {
												fontWeight: 600,
												letterSpacing: "0.04em"
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "form-hint",
											children: linkedEmployeeId ? "Inherited from profile." : "Auto-generated sequentially (ETS). Locked permanently once created."
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Role Access"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "select-control",
										value: formRole,
										disabled: Boolean(linkedEmployeeId),
										onChange: (e) => handleRoleChange(e.target.value),
										children: availableRoles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: r.id || r.roleId,
											children: [
												r.name,
												" ",
												!r.isSystem ? "(Custom)" : ""
											]
										}, r.id || r.roleId))
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "select-control",
										value: formDept,
										disabled: Boolean(linkedEmployeeId),
										onChange: (e) => handleDeptChange(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "-- Select Department --"
										}), availableDepartments.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: dept.name,
											children: [
												dept.name,
												" (",
												dept.code,
												")"
											]
										}, dept.id || dept.deptId || dept.name))]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "form-label-premium",
												style: { margin: 0 },
												children: "Designation"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--teal)",
													fontWeight: 600
												},
												children: getRecommendedRoleConfig(formRole, formDept)?.roleLabel || "Designation"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "text-input",
											placeholder: "e.g. Managing Director",
											list: "create-user-designations",
											value: formDesignation,
											readOnly: Boolean(linkedEmployeeId),
											onChange: (e) => setFormDesignation(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
											id: "create-user-designations",
											children: (getRecommendedRoleConfig(formRole, formDept)?.suggestions || getRecommendedRoleConfig(formRole, formDept)?.designations || []).map((sug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sug }, sug))
										})
									] })]
								}),
								!linkedEmployeeId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { marginTop: "-4px" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											fontWeight: 600,
											display: "block",
											marginBottom: "5px"
										},
										children: [
											"Recommended for ",
											getRecommendedRoleConfig(formRole, formDept)?.roleLabel || "Role",
											":"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											display: "flex",
											flexWrap: "wrap",
											gap: "5px"
										},
										children: (getRecommendedRoleConfig(formRole, formDept)?.suggestions || getRecommendedRoleConfig(formRole, formDept)?.designations || []).map((sug) => {
											const isSelected = (formDesignation || "").trim().toLowerCase() === sug.trim().toLowerCase();
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setFormDesignation(sug),
												style: {
													background: isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.08)",
													color: isSelected ? "#ffffff" : "var(--primary)",
													border: "1px solid " + (isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.2)"),
													borderRadius: "12px",
													padding: "2px 8px",
													fontSize: "11px",
													fontWeight: 600,
													cursor: "pointer",
													transition: "all 0.15s ease"
												},
												children: [isSelected ? "✓ " : "", sug]
											}, sug);
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "form-label-premium",
											style: { margin: 0 },
											children: "Account Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setFormPassword(generateAutoPassword()),
											style: {
												background: "none",
												border: "none",
												cursor: "pointer",
												color: "var(--primary)",
												fontSize: "11px",
												fontWeight: 600,
												display: "flex",
												alignItems: "center",
												gap: "4px",
												padding: "2px 6px",
												borderRadius: "4px"
											},
											title: "Generate another secure password",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { size: 11 }), " Generate New"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											position: "relative",
											display: "flex",
											alignItems: "center"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: showPassword ? "text" : "password",
											className: "text-input",
											placeholder: "Automatic secure password",
											value: formPassword,
											onChange: (e) => setFormPassword(e.target.value),
											required: true,
											minLength: 8,
											style: {
												paddingRight: "40px",
												fontFamily: showPassword ? "inherit" : "monospace",
												fontWeight: 600
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setShowPassword(!showPassword),
											style: {
												position: "absolute",
												right: "10px",
												background: "none",
												border: "none",
												cursor: "pointer",
												color: "var(--muted)",
												padding: "4px",
												display: "flex",
												alignItems: "center"
											},
											title: showPassword ? "Hide password" : "Show password",
											"aria-label": showPassword ? "Hide password" : "Show password",
											children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { size: 15 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { size: 15 })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "form-hint",
										children: "⚡ Auto-generated automatically so HR doesn't need to manually create passwords. You can copy & share complete login credentials with 1-click after creation."
									})
								] })
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
								disabled: saving,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 15 }),
									" ",
									saving ? "Provisioning Account..." : "Create Account"
								]
							})]
						})]
					})]
				})
			}) }),
			editUser && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setEditUser(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "480px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Edit System User"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: editUser.email
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setEditUser(null),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSaveEdit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									style: {
										margin: 0,
										padding: "10px 14px",
										borderRadius: "8px",
										background: "#FEF3E2",
										color: "#B45309",
										fontSize: "12px"
									},
									children: notice
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Full Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									value: editUser.name,
									onChange: (e) => setEditUser({
										...editUser,
										name: e.target.value
									}),
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
											className: "form-label-premium",
											style: {
												margin: 0,
												display: "flex",
												alignItems: "center",
												gap: "5px"
											},
											children: "Employee Code"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Unique ID"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										className: "text-input",
										value: editUser.employeeId || "",
										onChange: (e) => setEditUser({
											...editUser,
											employeeId: e.target.value.toUpperCase()
										}),
										placeholder: "e.g. ETS26210",
										required: true,
										style: {
											fontWeight: 600,
											textTransform: "uppercase"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "form-hint",
										children: "Unique workforce code for login, attendance, and payroll."
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Role Access"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "select-control",
									value: editUser.role,
									onChange: (e) => handleEditRoleChange(e.target.value),
									children: availableRoles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: r.id || r.roleId,
										children: [
											r.name,
											" ",
											!r.isSystem ? "(Custom)" : ""
										]
									}, r.id || r.roleId))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "select-control",
										value: editUser.department || "",
										onChange: (e) => handleEditDeptChange(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "-- Select Department --"
										}), availableDepartments.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: dept.name,
											children: [
												dept.name,
												" (",
												dept.code,
												")"
											]
										}, dept.id || dept.deptId || dept.name))]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "form-label-premium",
												style: { margin: 0 },
												children: "Designation"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--teal)",
													fontWeight: 600
												},
												children: getRecommendedRoleConfig(editUser.role, editUser.department)?.roleLabel || "Designation"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "text-input",
											list: "edit-user-designations",
											value: editUser.designation || "",
											placeholder: "e.g. Managing Director",
											onChange: (e) => setEditUser({
												...editUser,
												designation: e.target.value
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
											id: "edit-user-designations",
											children: (getRecommendedRoleConfig(editUser.role, editUser.department)?.suggestions || getRecommendedRoleConfig(editUser.role, editUser.department)?.designations || []).map((sug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: sug }, sug))
										})
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: { marginTop: "-4px" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											fontWeight: 600,
											display: "block",
											marginBottom: "5px"
										},
										children: [
											"Recommended for ",
											getRecommendedRoleConfig(editUser.role, editUser.department)?.roleLabel || "Role",
											":"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											display: "flex",
											flexWrap: "wrap",
											gap: "5px"
										},
										children: (getRecommendedRoleConfig(editUser.role, editUser.department)?.suggestions || getRecommendedRoleConfig(editUser.role, editUser.department)?.designations || []).map((sug) => {
											const isSelected = (editUser.designation || "").trim().toLowerCase() === sug.trim().toLowerCase();
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setEditUser({
													...editUser,
													designation: sug
												}),
												style: {
													background: isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.08)",
													color: isSelected ? "#ffffff" : "var(--primary)",
													border: "1px solid " + (isSelected ? "var(--primary)" : "rgba(0, 110, 111, 0.2)"),
													borderRadius: "12px",
													padding: "2px 8px",
													fontSize: "11px",
													fontWeight: 600,
													cursor: "pointer",
													transition: "all 0.15s ease"
												},
												children: [isSelected ? "✓ " : "", sug]
											}, sug);
										})
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setEditUser(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: saving,
								children: "Save Changes"
							})]
						})]
					})]
				})
			}) }),
			createdCredentials && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setCreatedCredentials(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "540px" },
					onClick: (e) => e.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-header-premium",
							style: {
								background: "linear-gradient(135deg, #0A2328 0%, #006E6F 100%)",
								color: "#fff",
								borderRadius: "16px 16px 0 0",
								padding: "20px 24px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "modal-title-group",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "modal-icon-badge",
									style: {
										background: "rgba(255,255,255,0.2)",
										color: "#fff"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 22 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "modal-title-text",
									style: {
										color: "#fff",
										fontSize: "18px",
										margin: 0
									},
									children: "Account Created Successfully!"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "modal-subtitle-text",
									style: {
										color: "rgba(255,255,255,0.85)",
										fontSize: "12px",
										margin: "4px 0 0"
									},
									children: ["Login credentials ready to copy and send to ", createdCredentials.name]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								style: { color: "#fff" },
								onClick: () => setCreatedCredentials(null),
								"aria-label": "Close modal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							style: { padding: "24px" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#F8FAFC",
									border: "1px solid #E2E8F0",
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
											justifyContent: "space-between",
											alignItems: "center",
											borderBottom: "1px solid #EDF2F7",
											paddingBottom: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "12px",
												color: "#64748B",
												fontWeight: 500
											},
											children: "Employee Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "13px",
												color: "#0F172A"
											},
											children: createdCredentials.name
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											borderBottom: "1px solid #EDF2F7",
											paddingBottom: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "12px",
												color: "#64748B",
												fontWeight: 500
											},
											children: "Employee Code (Locked)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: "6px",
												background: "#E6FFFA",
												color: "#006E6F",
												padding: "3px 9px",
												borderRadius: "6px",
												fontWeight: 700,
												fontSize: "12.5px"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { size: 12 }),
												" ",
												createdCredentials.employeeId
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											borderBottom: "1px solid #EDF2F7",
											paddingBottom: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "12px",
												color: "#64748B",
												fontWeight: 500
											},
											children: "Work Email / Login ID"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "13px",
												color: "#0F172A"
											},
											children: createdCredentials.email
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											borderBottom: "1px solid #EDF2F7",
											paddingBottom: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "12px",
												color: "#64748B",
												fontWeight: 500
											},
											children: "Auto-Generated Password"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											style: {
												background: "#FFF5F5",
												color: "#E53E3E",
												border: "1px solid #FED7D7",
												padding: "4px 10px",
												borderRadius: "6px",
												fontWeight: 700,
												fontSize: "13.5px",
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
												color: "#64748B",
												fontWeight: 500
											},
											children: "Login Portal URL"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: `${window.location.origin}/#/${createdCredentials.role === "admin" ? "admin/login" : createdCredentials.role === "hr" ? "hr/login" : "employee/login"}`,
											target: "_blank",
											rel: "noreferrer",
											style: {
												fontSize: "12px",
												color: "var(--primary)",
												fontWeight: 600,
												textDecoration: "none",
												display: "flex",
												alignItems: "center",
												gap: "4px"
											},
											children: ["Open Portal ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
										})]
									})
								]
							}), copySuccess && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									marginTop: "14px",
									padding: "10px 14px",
									background: "#E6FFFA",
									border: "1px solid #B2F5EA",
									borderRadius: "8px",
									color: "#006E6F",
									fontSize: "12.5px",
									fontWeight: 600,
									display: "flex",
									alignItems: "center",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), " All login credentials copied to clipboard! Ready to paste into WhatsApp, Slack, or Email."]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							style: {
								padding: "16px 24px",
								borderTop: "1px solid #E2E8F0",
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "primary",
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
										children: [
											copySuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 14 }),
											" ",
											copySuccess ? "Copied to Clipboard!" : "Copy All Login Details"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "secondary",
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
														designation: createdCredentials.role ? createdCredentials.role.toUpperCase() : "Staff Member",
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
											className: "spinning"
										}) : emailStatus === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											size: 14,
											style: { color: "#059669" }
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 14 }), sendingEmail ? "Sending Email..." : emailStatus === "success" ? "Email Sent (Resend)" : "Send via Email"]
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
									children: [emailStatus === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { size: 16 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: emailMessage })]
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
				})
			}) }),
			resetUser && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setResetUser(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "440px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								style: {
									background: "#FEF3E2",
									color: "#D97706"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Reset Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "modal-subtitle-text",
								children: [
									resetUser.name,
									" (",
									resetUser.email,
									")"
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setResetUser(null),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleExecutePasswordReset,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "alert",
									style: {
										margin: 0,
										padding: "10px 14px",
										borderRadius: "8px",
										background: "#FEF3E2",
										color: "#B45309",
										fontSize: "12px"
									},
									children: notice
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									style: {
										margin: 0,
										fontSize: "12.5px",
										color: "var(--muted)",
										lineHeight: 1.45
									},
									children: [
										"Set a secure temporary password for ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: resetUser.name }),
										". The user can log in immediately with this credential."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "New Temporary Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "password",
									className: "text-input",
									placeholder: "e.g. TempPass#2026",
									value: newPassword,
									minLength: 8,
									onChange: (e) => setNewPassword(e.target.value),
									required: true
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setResetUser(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: saving,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { size: 14 }), " Update Password"]
							})]
						})]
					})]
				})
			}) })
		]
	});
}
var PERMISSION_GROUPS = [
	{
		category: "Workforce & Directory Management",
		icon: Users,
		items: [
			{
				key: "employees.read",
				label: "View Employee Directory & Profiles",
				desc: "Browse staff roster, department lists, and employee details."
			},
			{
				key: "employees.write",
				label: "Create & Onboard Employees",
				desc: "Add new hires, update profiles, and manage employee lifecycle."
			},
			{
				key: "employees.manager.assign",
				label: "Assign Reporting Managers",
				desc: "Designate department heads and reporting hierarchy."
			}
		]
	},
	{
		category: "Attendance",
		icon: Clock,
		items: [
			{
				key: "attendance.read",
				label: "View Attendance Timesheets",
				desc: "Access daily attendance logs, hours worked, and Wi-Fi audits."
			},
			{
				key: "attendance.write",
				label: "Punch In/Out & Verify Attendance",
				desc: "Perform office Wi-Fi verified check-in and checkout."
			},
			{
				key: "attendance.team.read",
				label: "Inspect Team Attendance Timesheets",
				desc: "Review check-in status and attendance history of direct reports."
			}
		]
	},
	{
		category: "Leave Management",
		icon: Calendar,
		items: [
			{
				key: "leave.self.read",
				label: "Personal Leave Applications",
				desc: "Submit and view status of own leave requests."
			},
			{
				key: "leave.self.write",
				label: "Apply & Cancel Leaves",
				desc: "Submit new leave applications and manage personal requests."
			},
			{
				key: "leave.team.read",
				label: "View Team Leave Requests",
				desc: "Review leave applications submitted by squad and department members."
			},
			{
				key: "leave.team.approve",
				label: "Approve Direct Reports Leave",
				desc: "Review and approve/reject leave requests from team members."
			},
			{
				key: "leave.hr.read",
				label: "Company-Wide Leave Roster",
				desc: "Access organizational leave calendar and utilization metrics."
			},
			{
				key: "leave.hr.review",
				label: "HR Final Review & Approvals",
				desc: "Grant final HR approval on all employee leave requests."
			},
			{
				key: "leave.policy.admin",
				label: "Administer Leave Policies",
				desc: "Configure annual leave quotas and rollover rules."
			}
		]
	},
	{
		category: "Payroll",
		icon: DollarSign,
		items: [
			{
				key: "payroll.self.read",
				label: "View Personal Payslips",
				desc: "Inspect own salary breakdown and download payslip PDFs."
			},
			{
				key: "payroll.read",
				label: "View Organization Payroll & Salaries",
				desc: "Inspect salary components, deductions, and payslip vouchers."
			},
			{
				key: "payroll.write",
				label: "Execute & Manage Company Payroll",
				desc: "Run monthly payroll, apply performance deductions, and disburse."
			}
		]
	},
	{
		category: "Departments & Teams",
		icon: Building,
		items: [
			{
				key: "departments.read",
				label: "View Department Breakdown",
				desc: "Browse departments, headcounts, assigned heads, and team squads."
			},
			{
				key: "departments.write",
				label: "Manage Departments & Teams",
				desc: "Create, update, or configure organization departments and teams."
			},
			{
				key: "teams.lead.assign",
				label: "Assign Team Leaders",
				desc: "Designate and update Team Leaders for operational squads."
			}
		]
	},
	{
		category: "Recruitment",
		icon: Briefcase,
		items: [{
			key: "recruitment.read",
			label: "Job Openings & Candidate Pipeline",
			desc: "Track requisitions, interview stages, and referrals."
		}, {
			key: "recruitment.write",
			label: "Manage Candidates & Stage Offers",
			desc: "Advance applicants, schedule interviews, and extend offers."
		}]
	},
	{
		category: "Reports & Documents",
		icon: FileText,
		items: [
			{
				key: "reports.read",
				label: "Organizational Reports & Analytics",
				desc: "Access workforce headcount, attendance metrics, and audit summaries."
			},
			{
				key: "documents.read",
				label: "Company Policy Documents",
				desc: "Access official handbook, policies, and agreements."
			},
			{
				key: "announcements.read",
				label: "Company Announcements & Broadcasts",
				desc: "Read and publish organization-wide broadcasts."
			},
			{
				key: "holidays.read",
				label: "Official Holiday Calendar",
				desc: "View recognized company holiday schedule."
			},
			{
				key: "tasks.read",
				label: "Task Management & Delegation",
				desc: "Assign tasks, monitor deadlines, and submit daily reports."
			},
			{
				key: "training.read",
				label: "Training Portal & Courses",
				desc: "Access assigned LMS modules and compliance certifications."
			},
			{
				key: "helpdesk.read",
				label: "Help Desk & IT Support",
				desc: "Raise support tickets and manage resolution queues."
			},
			{
				key: "performance.read",
				label: "KPIs, OKRs & Performance Reviews",
				desc: "Monitor appraisal cycles, review ratings, and goals."
			}
		]
	},
	{
		category: "System Administration",
		icon: ShieldCheck,
		items: [
			{
				key: "admin.access",
				label: "Master Administration Console",
				desc: "Unrestricted access to system configuration and user accounts."
			},
			{
				key: "settings.admin",
				label: "Security & Wi-Fi Configuration",
				desc: "Manage verified Wi-Fi SSIDs, branches, and database backups."
			},
			{
				key: "settings.hr.read",
				label: "HR Parameter Settings",
				desc: "Configure company working hours and departmental policies."
			}
		]
	}
];
function getRoleVisualMeta(roleId) {
	switch (roleId) {
		case "admin": return {
			icon: ShieldAlert,
			color: "#b91c1c",
			bg: "#fef2f2",
			border: "#fecaca",
			tag: "Superuser"
		};
		case "director":
		case "managing_director":
		case "co_founder": return {
			icon: Award,
			color: "#6d28d9",
			bg: "#f5f3ff",
			border: "#ddd6fe",
			tag: "Leadership"
		};
		case "vertical_head": return {
			icon: Award,
			color: "#7c3aed",
			bg: "#f5f3ff",
			border: "#ddd6fe",
			tag: "Vertical Head"
		};
		case "revenue_growth_manager":
		case "manager": return {
			icon: Briefcase,
			color: "#1d4ed8",
			bg: "#eff6ff",
			border: "#bfdbfe",
			tag: "Management"
		};
		case "team_lead":
		case "team_leader": return {
			icon: Users,
			color: "#0f766e",
			bg: "#f0fdfa",
			border: "#a7f3d0",
			tag: "Team Lead"
		};
		case "hr":
		case "hr_executive": return {
			icon: UserCheck,
			color: "#006e6f",
			bg: "#e6f7f5",
			border: "#99f6e4",
			tag: "HR Ops"
		};
		case "operations_executive": return {
			icon: Layers,
			color: "#0284c7",
			bg: "#f0f9ff",
			border: "#bae6fd",
			tag: "Operations"
		};
		case "business_development_executive": return {
			icon: Briefcase,
			color: "#059669",
			bg: "#ecfdf5",
			border: "#a7f3d0",
			tag: "Sales"
		};
		case "business_development_intern": return {
			icon: Briefcase,
			color: "#10b981",
			bg: "#ecfdf5",
			border: "#a7f3d0",
			tag: "Intern"
		};
		case "marketing_executive": return {
			icon: Globe,
			color: "#ea580c",
			bg: "#fff7ed",
			border: "#fed7aa",
			tag: "Marketing"
		};
		case "marketing_intern": return {
			icon: Globe,
			color: "#f97316",
			bg: "#fff7ed",
			border: "#fed7aa",
			tag: "Intern"
		};
		case "sde":
		case "sde_executive":
		case "seo_executive": return {
			icon: Laptop,
			color: "#0284c7",
			bg: "#f0f9ff",
			border: "#bae6fd",
			tag: "Engineering"
		};
		case "sde_intern":
		case "seo_intern": return {
			icon: Laptop,
			color: "#0ea5e9",
			bg: "#f0f9ff",
			border: "#bae6fd",
			tag: "Intern"
		};
		case "post_sales_executive": return {
			icon: CircleCheck,
			color: "#4f46e5",
			bg: "#eef2ff",
			border: "#c7d2fe",
			tag: "Post-Sales"
		};
		case "post_sales_intern": return {
			icon: CircleCheck,
			color: "#6366f1",
			bg: "#eef2ff",
			border: "#c7d2fe",
			tag: "Intern"
		};
		case "employee": return {
			icon: Laptop,
			color: "#475569",
			bg: "#f8fafc",
			border: "#e2e8f0",
			tag: "Employee"
		};
		default: return {
			icon: Key,
			color: "#b45309",
			bg: "#fffbeb",
			border: "#fde68a",
			tag: "Custom"
		};
	}
}
function AdminRolesModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [selectedRoleId, setSelectedRoleId] = (0, import_react.useState)("operations_executive");
	const [currentPermissions, setCurrentPermissions] = (0, import_react.useState)([]);
	const [collapsedGroups, setCollapsedGroups] = (0, import_react.useState)({});
	const [auditSearch, setAuditSearch] = (0, import_react.useState)("");
	const [auditFilter, setAuditFilter] = (0, import_react.useState)("all");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [addRoleModal, setAddRoleModal] = (0, import_react.useState)(false);
	const [newRoleName, setNewRoleName] = (0, import_react.useState)("");
	const [newRoleDesc, setNewRoleDesc] = (0, import_react.useState)("");
	const [newRoleClone, setNewRoleClone] = (0, import_react.useState)("employee");
	const [editRoleModal, setEditRoleModal] = (0, import_react.useState)(false);
	const [editingRole, setEditingRole] = (0, import_react.useState)(null);
	const [editRoleName, setEditRoleName] = (0, import_react.useState)("");
	const [editRoleBadge, setEditRoleBadge] = (0, import_react.useState)("");
	const [editRoleDesc, setEditRoleDesc] = (0, import_react.useState)("");
	const [isSavingRole, setIsSavingRole] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => {
			setStoreState(state);
		});
	}, []);
	const rawRoles = hrStore.getRoles();
	const uniqueRolesMap = /* @__PURE__ */ new Map();
	rawRoles.forEach((r) => {
		if (r && r.id && !uniqueRolesMap.has(r.id)) uniqueRolesMap.set(r.id, r);
	});
	const roles = Array.from(uniqueRolesMap.values());
	const allPeople = storeState.employees && storeState.employees.length > 0 ? storeState.employees : storeState.users || [];
	const auditLogs = storeState.auditLogs || [];
	const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];
	(0, import_react.useEffect)(() => {
		if (activeRole) {
			const perms = hrStore.getRolePermissions(activeRole.id);
			setCurrentPermissions(perms || []);
		}
	}, [selectedRoleId, storeState]);
	const assignedUsers = allPeople.filter((u) => u.role === activeRole?.id);
	function handleTogglePermission(permKey) {
		if (activeRole?.id === "admin") {
			alert("The Administrator role inherently maintains wildcard (*) root system privileges.");
			return;
		}
		setCurrentPermissions((prev) => {
			if (prev.includes(permKey)) return prev.filter((p) => p !== permKey);
			else return [...prev, permKey];
		});
	}
	function handleToggleGroup(group, selectAll) {
		if (activeRole?.id === "admin") return;
		const groupKeys = group.items.map((i) => i.key);
		setCurrentPermissions((prev) => {
			if (selectAll) {
				const merged = /* @__PURE__ */ new Set([...prev, ...groupKeys]);
				return Array.from(merged);
			} else return prev.filter((k) => !groupKeys.includes(k));
		});
	}
	function toggleGroupCollapse(category) {
		setCollapsedGroups((prev) => ({
			...prev,
			[category]: !prev[category]
		}));
	}
	function handleExpandAll() {
		setCollapsedGroups({});
	}
	function handleCollapseAll() {
		const all = {};
		PERMISSION_GROUPS.forEach((g) => {
			all[g.category] = true;
		});
		setCollapsedGroups(all);
	}
	async function handleSavePermissions() {
		try {
			hrStore.updateRolePermissions(activeRole.id, currentPermissions);
			if (hrStore.updateRole) await hrStore.updateRole(activeRole.id, {
				name: activeRole.name,
				permissions: currentPermissions,
				description: activeRole.description,
				badge: activeRole.badge
			});
			setNotice(`Permissions for role '${activeRole.name}' saved and synchronized across all active sessions!`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to save role permissions.");
		}
	}
	function handleResetPermissions() {
		if (window.confirm(`Reset permissions for '${activeRole.name}' back to system factory defaults?`)) {
			hrStore.resetRolePermissions(activeRole.id);
			const perms = hrStore.getRolePermissions(activeRole.id);
			setCurrentPermissions(perms);
			setNotice(`Role '${activeRole.name}' permissions restored to defaults.`);
			setTimeout(() => setNotice(""), 4e3);
		}
	}
	function openEditRole(roleToEdit) {
		const target = roleToEdit || activeRole;
		if (!target) return;
		setEditingRole(target);
		setEditRoleName(target.name || "");
		setEditRoleBadge(target.badge || "");
		setEditRoleDesc(target.description || "");
		setEditRoleModal(true);
	}
	async function handleSaveRoleEdit(e) {
		e.preventDefault();
		if (!editingRole) return;
		const trimmedName = editRoleName.trim();
		if (!trimmedName) {
			alert("Role name cannot be empty.");
			return;
		}
		setIsSavingRole(true);
		try {
			const updates = {
				name: trimmedName,
				badge: editRoleBadge.trim() || "Role",
				description: editRoleDesc.trim()
			};
			hrStore.updateRole(editingRole.id, updates);
			try {
				await apiClient.patch(`/workspace/roles/${encodeURIComponent(editingRole.id)}`, updates);
			} catch (apiErr) {
				console.warn("Backend roles sync fallback:", apiErr.message);
			}
			setEditRoleModal(false);
			setEditingRole(null);
			setNotice(`Role '${trimmedName}' details updated and synchronized!`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to update role details.");
		} finally {
			setIsSavingRole(false);
		}
	}
	async function handleCreateRole(e) {
		e.preventDefault();
		if (!newRoleName.trim()) return;
		const templatePerms = hrStore.getRolePermissions(newRoleClone) || ["dashboard.read"];
		const roleId = newRoleName.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
		try {
			const created = await hrStore.addRole({
				id: roleId,
				roleId,
				name: newRoleName.trim(),
				description: newRoleDesc.trim() || "Custom organizational access role",
				badge: "Custom Role",
				isSystem: false,
				permissions: templatePerms
			});
			setAddRoleModal(false);
			setNewRoleName("");
			setNewRoleDesc("");
			setSelectedRoleId(created?.id || created?.roleId || roleId);
			setNotice(`New custom role '${created?.name || newRoleName}' created and saved to database!`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to create role.");
		}
	}
	async function handleDeleteRole() {
		if ([
			"admin",
			"hr",
			"hr_executive",
			"manager",
			"employee"
		].includes(activeRole?.id)) {
			alert("Built-in system roles (Admin, HR, Manager, Employee) cannot be removed.");
			return;
		}
		if (window.confirm(`Are you sure you want to delete role '${activeRole.name}'?`)) try {
			await hrStore.deleteRole(activeRole.id);
			setSelectedRoleId("hr");
			setNotice(`Role '${activeRole.name}' deleted.`);
			setTimeout(() => setNotice(""), 4e3);
		} catch (err) {
			alert(err.message || "Failed to delete role.");
		}
	}
	async function handleReassignUser(userId, newRole) {
		try {
			hrStore.assignUserRole(userId, newRole);
			if (hrStore.updateUser) await hrStore.updateUser(userId, { role: newRole });
			setNotice(`User role re-assigned to '${newRole}'.`);
			setTimeout(() => setNotice(""), 3500);
		} catch (err) {
			alert(err.message || "Failed to reassign user role.");
		}
	}
	function exportAuditLogsCSV() {
		const headers = [
			"Timestamp",
			"Actor",
			"Action",
			"Details"
		];
		const rows = auditLogs.map((l) => [
			l.timestamp,
			l.actor,
			l.action,
			l.details
		]);
		const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(","))].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", `security_audit_logs_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	function handleClearAudit() {
		if (window.confirm("Are you sure you want to clear historical audit logs? An initial compliance baseline record will be retained.")) {
			hrStore.clearAuditLogs();
			setNotice("Audit log history cleared and compliance reset.");
			setTimeout(() => setNotice(""), 4e3);
		}
	}
	const filteredLogs = auditLogs.filter((a) => {
		const matchesSearch = a.action?.toLowerCase().includes(auditSearch.toLowerCase()) || a.actor?.toLowerCase().includes(auditSearch.toLowerCase()) || a.details?.toLowerCase().includes(auditSearch.toLowerCase());
		let matchesFilter = true;
		if (auditFilter === "user") matchesFilter = a.action?.startsWith("USER_") || a.action?.startsWith("PASSWORD_");
		if (auditFilter === "role") matchesFilter = a.action?.startsWith("ROLE_");
		if (auditFilter === "attendance") matchesFilter = a.action?.startsWith("ATTENDANCE_");
		if (auditFilter === "leave") matchesFilter = a.action?.startsWith("LEAVE_");
		if (auditFilter === "settings") matchesFilter = a.action?.startsWith("WIFI_") || a.action?.startsWith("SETTINGS_") || a.action?.startsWith("HOLIDAY_");
		if (auditFilter === "payroll") matchesFilter = a.action?.startsWith("PAYROLL_");
		return matchesSearch && matchesFilter;
	});
	const totalAvailablePerms = PERMISSION_GROUPS.reduce((acc, g) => acc + g.items.length, 0);
	const activePermsCount = activeRole?.id === "admin" ? totalAvailablePerms : PERMISSION_GROUPS.reduce((acc, g) => acc + g.items.filter((item) => currentPermissions.includes("*") || currentPermissions.includes(item.key)).length, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "16px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
        .roles-grid-responsive {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .roles-grid-responsive {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .roles-grid-responsive {
            grid-template-columns: 1fr;
          }
        }
        .perm-items-subgrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        @media (max-width: 768px) {
          .perm-items-subgrid {
            grid-template-columns: 1fr;
          }
        }
        .role-access-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-bottom: 4px;
        }
        @media (max-width: 640px) {
          .role-access-page-header {
            flex-direction: column;
            align-items: stretch;
          }
        }
      ` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "role-access-page-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px",
							marginBottom: "2px"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								color: "var(--teal, #006e6f)"
							},
							children: "Access Control & Governance"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						style: {
							fontSize: "22px",
							fontWeight: 800,
							margin: "0 0 3px 0",
							letterSpacing: "-0.02em",
							color: "var(--ink, #0A2328)"
						},
						children: "Role & Access Management"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "13px",
							color: "var(--muted, #586D72)",
							margin: 0
						},
						children: "Manage roles and permissions across your organization."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => setAddRoleModal(true),
					style: {
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "8px",
						padding: "9px 16px",
						fontSize: "13px",
						fontWeight: 700,
						borderRadius: "8px",
						backgroundColor: "var(--teal, #006e6f)",
						color: "#ffffff",
						border: "none",
						boxShadow: "0 2px 6px rgba(0, 110, 111, 0.2)",
						cursor: "pointer"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 15 }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Create Custom Role" })
					]
				})]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 14px",
					background: "#eaf4f1",
					color: "var(--teal, #006e6f)",
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					style: {
						fontSize: "12px",
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: "0.04em",
						color: "var(--muted, #586D72)"
					},
					children: [
						"Select Organization Role (",
						roles.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					style: {
						fontSize: "11px",
						color: "var(--muted, #586D72)"
					},
					children: "Click card to inspect or customize access permissions"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "roles-grid-responsive",
				children: roles.map((r) => {
					const isSelected = r.id === selectedRoleId;
					const count = allPeople.filter((u) => u.role === r.id).length;
					const meta = getRoleVisualMeta(r.id);
					const IconComponent = meta.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onClick: () => setSelectedRoleId(r.id),
						style: {
							cursor: "pointer",
							padding: "13px 15px",
							borderRadius: "10px",
							border: isSelected ? "1.5px solid var(--teal, #006e6f)" : "1px solid var(--line, #e2e8f0)",
							backgroundColor: isSelected ? "#f0fdfa" : "#ffffff",
							boxShadow: isSelected ? "0 2px 8px rgba(0, 110, 111, 0.1), 0 0 0 1px var(--teal, #006e6f)" : "0 1px 3px rgba(0, 0, 0, 0.03)",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							minHeight: "130px",
							position: "relative",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: "8px",
									marginBottom: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "7px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											width: "26px",
											height: "26px",
											borderRadius: "6px",
											display: "grid",
											placeItems: "center",
											backgroundColor: meta.bg,
											color: meta.color,
											border: `1px solid ${meta.border}`,
											flexShrink: 0
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { size: 14 })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											fontWeight: 700,
											textTransform: "uppercase",
											letterSpacing: "0.04em",
											padding: "2px 6px",
											borderRadius: "4px",
											backgroundColor: meta.bg,
											color: meta.color,
											whiteSpace: "nowrap"
										},
										children: r.badge || meta.tag
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "5px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "11px",
											fontWeight: 600,
											color: "var(--muted, #586D72)",
											backgroundColor: "var(--surface-sunken, #E9F2F3)",
											padding: "2px 7px",
											borderRadius: "10px",
											whiteSpace: "nowrap"
										},
										children: [
											count,
											" ",
											count === 1 ? "member" : "members"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: (e) => {
											e.stopPropagation();
											setSelectedRoleId(r.id);
											openEditRole(r);
										},
										title: `Edit ${r.name} details`,
										style: {
											border: "none",
											background: "transparent",
											color: "var(--muted, #586D72)",
											cursor: "pointer",
											padding: "3px 4px",
											borderRadius: "4px",
											display: "flex",
											alignItems: "center",
											justifyContent: "center"
										},
										onMouseEnter: (e) => {
											e.currentTarget.style.color = "var(--teal, #006e6f)";
											e.currentTarget.style.background = "#e6f7f5";
										},
										onMouseLeave: (e) => {
											e.currentTarget.style.color = "var(--muted, #586D72)";
											e.currentTarget.style.background = "transparent";
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 13 })
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								style: {
									margin: "0 0 4px 0",
									fontSize: "13.5px",
									fontWeight: 700,
									color: isSelected ? "var(--teal, #006e6f)" : "var(--ink, #0A2328)",
									letterSpacing: "-0.01em",
									lineHeight: "1.3"
								},
								children: r.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: 0,
									fontSize: "11.5px",
									color: "var(--muted, #586D72)",
									lineHeight: "1.4",
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									textOverflow: "ellipsis",
									minHeight: "32px"
								},
								title: r.description,
								children: r.description
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								borderTop: "1px solid var(--line, #e2e8f0)",
								paddingTop: "8px",
								marginTop: "8px",
								fontSize: "11px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "10px",
									color: "var(--muted, #586D72)",
									fontWeight: 500
								},
								children: r.isSystem ? "System Standard" : "Custom Organization Role"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: (e) => {
										e.stopPropagation();
										setSelectedRoleId(r.id);
										openEditRole(r);
									},
									style: {
										border: "none",
										background: "transparent",
										color: "var(--teal, #006e6f)",
										fontSize: "11px",
										fontWeight: 600,
										cursor: "pointer",
										display: "inline-flex",
										alignItems: "center",
										gap: "3px",
										padding: "1px 4px"
									},
									title: `Edit ${r.name} details`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 11 }), " Modify"]
								}), isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										display: "inline-flex",
										alignItems: "center",
										gap: "3px",
										color: "var(--teal, #006e6f)",
										fontWeight: 700,
										fontSize: "11px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 12 }), " Selected"]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										display: "inline-flex",
										alignItems: "center",
										gap: "2px",
										color: "var(--muted, #586D72)",
										fontSize: "11px",
										fontWeight: 500
									},
									children: ["Configure ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 11 })]
								})]
							})]
						})]
					}, r.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: {
					borderLeft: "4px solid var(--teal, #006e6f)",
					padding: "18px 20px"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: "12px",
							paddingBottom: "14px",
							borderBottom: "1px solid var(--line, #e2e8f0)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "section-kicker",
										style: { margin: 0 },
										children: "Role Permissions Editor"
									}),
									activeRole?.isSystem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											background: "#eef2f6",
											color: "var(--blue, #006e6f)",
											padding: "2px 6px",
											borderRadius: "4px",
											fontWeight: 700
										},
										children: "System Standard"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											background: "#fbf3e6",
											color: "#b97926",
											padding: "2px 6px",
											borderRadius: "4px",
											fontWeight: 700
										},
										children: "Custom Role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: {
											fontSize: "11px",
											color: "var(--teal, #006e6f)",
											background: "#e6f7f5",
											padding: "2px 8px",
											borderRadius: "12px",
											fontWeight: 600
										},
										children: [
											activePermsCount,
											" of ",
											totalAvailablePerms,
											" capabilities active"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								style: {
									fontSize: "17px",
									fontWeight: 800,
									margin: "4px 0 2px 0",
									color: "var(--ink, #0A2328)"
								},
								children: ["Configuring: ", activeRole?.name]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: 0,
									fontSize: "12px",
									color: "var(--muted, #586D72)"
								},
								children: activeRole?.description
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "8px",
								alignItems: "center",
								flexWrap: "wrap"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: () => openEditRole(activeRole),
									style: {
										fontSize: "11px",
										padding: "6px 12px",
										display: "inline-flex",
										alignItems: "center",
										gap: "5px"
									},
									title: "Edit or modify role name, badge tag, and description",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 12 }), " Edit Role Details"]
								}),
								activeRole?.id !== "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleExpandAll,
									style: {
										fontSize: "11px",
										fontWeight: 600,
										padding: "6px 10px",
										borderRadius: "6px",
										border: "1px solid var(--line, #e2e8f0)",
										background: "#ffffff",
										color: "var(--ink, #0A2328)",
										cursor: "pointer"
									},
									children: "Expand All"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleCollapseAll,
									style: {
										fontSize: "11px",
										fontWeight: 600,
										padding: "6px 10px",
										borderRadius: "6px",
										border: "1px solid var(--line, #e2e8f0)",
										background: "#ffffff",
										color: "var(--ink, #0A2328)",
										cursor: "pointer"
									},
									children: "Collapse All"
								})] }),
								![
									"admin",
									"hr",
									"hr_executive",
									"manager",
									"employee"
								].includes(activeRole?.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: handleDeleteRole,
									style: {
										color: "#cb3a31",
										fontSize: "11px",
										padding: "6px 10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), " Delete Role"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: handleResetPermissions,
									style: {
										fontSize: "11px",
										padding: "6px 12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 12 }), " Reset Defaults"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button primary",
									onClick: handleSavePermissions,
									style: {
										fontSize: "11px",
										padding: "6px 14px",
										backgroundColor: "var(--teal, #006e6f)",
										color: "#ffffff"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }), " Save Role Permissions"]
								})
							]
						})]
					}),
					activeRole?.id === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							padding: "18px 20px",
							background: "#f0fdfa",
							borderRadius: "8px",
							margin: "16px 0",
							border: "1px solid #99f6e4"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
								size: 26,
								color: "var(--teal, #006e6f)",
								style: { flexShrink: 0 }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								style: {
									fontSize: "13.5px",
									color: "var(--teal, #006e6f)"
								},
								children: "Administrator Root Wildcard Access Active (*)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								style: {
									margin: "4px 0 0 0",
									fontSize: "12px",
									color: "var(--ink, #0A2328)",
									lineHeight: 1.45
								},
								children: "The Administrator account holds absolute unrestricted permissions across the entire organization, database, and system configurations. No individual capabilities can be restricted for this root superuser."
							})] })]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							marginTop: "16px",
							display: "grid",
							gap: "10px"
						},
						children: PERMISSION_GROUPS.map((group) => {
							const isCollapsed = Boolean(collapsedGroups[group.category]);
							const groupActiveCount = group.items.filter((item) => currentPermissions.includes("*") || currentPermissions.includes(item.key)).length;
							const allChecked = groupActiveCount === group.items.length;
							const noneChecked = groupActiveCount === 0;
							const GroupIcon = group.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									border: "1px solid var(--line, #e2e8f0)",
									borderRadius: "8px",
									backgroundColor: "#ffffff",
									overflow: "hidden",
									transition: "all 0.15s ease"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									onClick: () => toggleGroupCollapse(group.category),
									style: {
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										padding: "11px 14px",
										backgroundColor: isCollapsed ? "#fafafa" : "#f8fbfb",
										cursor: "pointer",
										userSelect: "none"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "10px",
											minWidth: 0
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													width: "26px",
													height: "26px",
													borderRadius: "6px",
													display: "grid",
													placeItems: "center",
													backgroundColor: groupActiveCount > 0 ? "#e6f7f5" : "#f1f5f9",
													color: groupActiveCount > 0 ? "var(--teal, #006e6f)" : "var(--muted, #586D72)",
													flexShrink: 0
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupIcon, { size: 14 })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "13px",
													fontWeight: 700,
													color: "var(--ink, #0A2328)"
												},
												children: group.category
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "11px",
													fontWeight: 600,
													padding: "2px 7px",
													borderRadius: "10px",
													backgroundColor: allChecked ? "#e6f4ea" : noneChecked ? "#f1f5f9" : "#e6f7f5",
													color: allChecked ? "#137333" : noneChecked ? "#64748b" : "var(--teal, #006e6f)"
												},
												children: allChecked ? `All ${group.items.length} enabled` : `${groupActiveCount} of ${group.items.length} enabled`
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "12px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: (e) => {
												e.stopPropagation();
												handleToggleGroup(group, !allChecked);
											},
											style: {
												fontSize: "11px",
												fontWeight: 600,
												color: allChecked ? "#cb3a31" : "var(--teal, #006e6f)",
												background: "transparent",
												border: "none",
												cursor: "pointer",
												padding: "2px 6px"
											},
											children: allChecked ? "Clear Group" : "Enable All"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												color: "var(--muted, #586D72)",
												display: "grid",
												placeItems: "center"
											},
											children: isCollapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { size: 16 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { size: 16 })
										})]
									})]
								}), !isCollapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										padding: "12px 14px",
										borderTop: "1px solid var(--line, #e2e8f0)",
										backgroundColor: "#ffffff"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "perm-items-subgrid",
										children: group.items.map((item) => {
											const isChecked = currentPermissions.includes("*") || currentPermissions.includes(item.key);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												style: {
													display: "flex",
													alignItems: "flex-start",
													gap: "10px",
													padding: "8px 10px",
													borderRadius: "6px",
													background: isChecked ? "#f0fdfa" : "#fafafa",
													border: isChecked ? "1px solid #99f6e4" : "1px solid #f1f5f9",
													cursor: "pointer",
													transition: "all 0.15s ease"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: isChecked,
													onChange: () => handleTogglePermission(item.key),
													style: {
														marginTop: "2px",
														accentColor: "var(--teal, #006e6f)",
														cursor: "pointer"
													}
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														flex: 1,
														minWidth: 0
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															style: {
																fontSize: "12px",
																fontWeight: 600,
																color: isChecked ? "var(--ink, #0A2328)" : "#475569"
															},
															children: item.label
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															style: {
																fontSize: "11px",
																color: "var(--muted, #586D72)",
																marginTop: "1px",
																lineHeight: "1.35"
															},
															children: item.desc
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
															style: {
																fontSize: "9.5px",
																color: isChecked ? "var(--teal, #006e6f)" : "#64748b",
																background: isChecked ? "#e6f7f5" : "#f1f5f9",
																padding: "1px 5px",
																borderRadius: "3px",
																marginTop: "3px",
																display: "inline-block",
																fontFamily: "monospace"
															},
															children: item.key
														})
													]
												})]
											}, item.key);
										})
									})
								})]
							}, group.category);
						})
					}),
					activeRole?.id !== "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: "12px",
							marginTop: "16px",
							padding: "12px 16px",
							borderRadius: "8px",
							backgroundColor: "#f8fbfb",
							border: "1px solid var(--line, #e2e8f0)"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "12px",
										fontWeight: 600,
										color: "var(--ink, #0A2328)"
									},
									children: ["Role: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activeRole?.name })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: { color: "var(--line, #e2e8f0)" },
									children: "•"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									style: {
										fontSize: "11.5px",
										color: "var(--muted, #586D72)"
									},
									children: [activePermsCount, " total capabilities enabled"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								gap: "8px",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "ui-button secondary",
								onClick: handleResetPermissions,
								style: {
									fontSize: "11px",
									padding: "6px 12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 12 }), " Reset Defaults"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "ui-button primary",
								onClick: handleSavePermissions,
								style: {
									fontSize: "11px",
									padding: "6px 14px",
									backgroundColor: "var(--teal, #006e6f)",
									color: "#ffffff"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }), " Save Role Permissions"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							marginTop: "22px",
							borderTop: "1px solid var(--line, #e2e8f0)",
							paddingTop: "16px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								style: {
									margin: 0,
									fontSize: "13.5px",
									fontWeight: 700,
									color: "var(--ink, #0A2328)"
								},
								children: [
									"Assigned Members to ",
									activeRole?.name,
									" (",
									assignedUsers.length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted, #586D72)"
								},
								children: "Change role assignment on the fly"
							})]
						}), assignedUsers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								padding: "14px",
								textAlign: "center",
								color: "var(--muted, #586D72)",
								fontSize: "12px",
								background: "#faf9f5",
								borderRadius: "6px"
							},
							children: [
								"No accounts currently assigned to role '",
								activeRole?.name,
								"'."
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: { overflowX: "auto" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "ui-table compact",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "User" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee ID" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Department" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										style: { textAlign: "right" },
										children: "Reassign Role"
									})
								] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: assignedUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px"
										},
										children: [
											u.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: u.avatarUrl,
												alt: u.name || "User",
												style: {
													width: "24px",
													height: "24px",
													borderRadius: "50%",
													objectFit: "cover",
													border: "1.5px solid var(--teal)"
												},
												onError: (e) => {
													e.currentTarget.style.display = "none";
													if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = "grid";
												}
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `avatar avatar-${u.avatarTone || "teal"}`,
												style: {
													display: u.avatarUrl ? "none" : "grid",
													width: "24px",
													height: "24px",
													fontSize: "10px"
												},
												children: u.name?.slice(0, 2).toUpperCase() || "U"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: u.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													fontSize: "10px",
													color: "var(--muted, #586D72)"
												},
												children: u.email
											})] })
										]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: u.employeeId }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: u.department }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										tone: u.status === "active" ? "success" : "neutral",
										children: u.status === "active" ? "Active" : "Inactive"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: { textAlign: "right" },
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "select-control",
											value: u.role,
											onChange: (e) => handleReassignUser(u.id, e.target.value),
											style: {
												padding: "3px 8px",
												fontSize: "11px"
											},
											children: roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: r.id,
												children: r.name
											}, r.id))
										})
									})
								] }, u.id)) })]
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { padding: "16px 20px" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					style: {
						flexWrap: "wrap",
						gap: "10px",
						marginBottom: "12px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						style: { margin: 0 },
						children: "Compliance Audit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						style: {
							fontSize: "16px",
							margin: "2px 0 0 0"
						},
						children: "Immutable Security Audit Trail"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							gap: "8px",
							flexWrap: "wrap",
							alignItems: "center"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								className: "text-input",
								placeholder: "Search action or actor...",
								value: auditSearch,
								onChange: (e) => setAuditSearch(e.target.value),
								style: {
									width: "180px",
									padding: "5px 8px",
									fontSize: "11px"
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "select-control",
								value: auditFilter,
								onChange: (e) => setAuditFilter(e.target.value),
								style: {
									padding: "5px 8px",
									fontSize: "11px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: "All Action Types"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "user",
										children: "User Accounts"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "role",
										children: "Roles & Permissions"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "attendance",
										children: "Attendance & Wi-Fi"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "leave",
										children: "Leave Approvals"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "settings",
										children: "Settings & Policies"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "payroll",
										children: "Payroll & Salary"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "ui-button secondary",
								style: {
									fontSize: "11px",
									padding: "5px 8px"
								},
								onClick: exportAuditLogsCSV,
								title: "Download audit logs in CSV format",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 12 }), " Export CSV"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "ui-button secondary",
								style: {
									fontSize: "11px",
									padding: "5px 8px",
									color: "#cb3a31"
								},
								onClick: handleClearAudit,
								title: "Clear historical audit logs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), " Clear Logs"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					style: { overflowX: "auto" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table compact",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Timestamp" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Actor" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Action" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Audit Details" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 4,
							style: {
								textAlign: "center",
								color: "var(--muted, #586D72)",
								padding: "16px"
							},
							children: "No audit records match the current filter."
						}) }) : filteredLogs.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									fontSize: "11px",
									whiteSpace: "nowrap"
								},
								children: l.timestamp
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "role-badge",
								style: {
									fontSize: "9px",
									background: "#f5f8f7"
								},
								children: l.actor
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: l.action }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								style: {
									fontSize: "11px",
									color: "var(--ink, #0A2328)"
								},
								children: l.details
							})
						] }, l.id)) })]
					})
				})]
			}),
			addRoleModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setAddRoleModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "480px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Provision Organization Role"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: "Define access matrix, scope, and system privileges"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setAddRoleModal(false),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateRole,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Role Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Finance Auditor, Senior Recruiter",
									value: newRoleName,
									onChange: (e) => setNewRoleName(e.target.value),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Role Purpose & Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Audits payroll records and expense reimbursement claims",
									value: newRoleDesc,
									onChange: (e) => setNewRoleDesc(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Clone Initial Permissions From"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select-control",
									value: newRoleClone,
									onChange: (e) => setNewRoleClone(e.target.value),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "employee",
											children: "Standard Employee (Self-Service)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "manager",
											children: "Team Manager (Direct Reports)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "hr",
											children: "HR Operations Lead (Full Ops)"
										})
									]
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setAddRoleModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { size: 14 }), " Create Role"]
							})]
						})]
					})]
				})
			}) }),
			editRoleModal && editingRole && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setEditRoleModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "520px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								style: {
									backgroundColor: "#e6f7f5",
									color: "var(--teal, #006e6f)"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Edit / Modify Role"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: "Customize role display title, category badge tag, and functional description"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setEditRoleModal(false),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSaveRoleEdit,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "System Role Identifier (Fixed Key)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										className: "text-input",
										value: editingRole.id || editingRole.roleId || "",
										disabled: true,
										style: {
											backgroundColor: "#f1f5f9",
											cursor: "not-allowed",
											color: "#64748b"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted, #586D72)",
											marginTop: "3px",
											display: "block"
										},
										children: "Immutable internal security identifier used across permissions, assignments, and audit logs."
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Role Display Title *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. SDE, SDE Intern, Operations Executive",
									value: editRoleName,
									onChange: (e) => setEditRoleName(e.target.value),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Badge / Category Tag"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Engineering, Tech, Operations, Leadership, Intern",
									value: editRoleBadge,
									onChange: (e) => setEditRoleBadge(e.target.value)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Role Description & Responsibilities"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "text-input",
									rows: 3,
									placeholder: "Describe key responsibilities and operational scope...",
									value: editRoleDesc,
									onChange: (e) => setEditRoleDesc(e.target.value),
									style: {
										resize: "vertical",
										minHeight: "75px",
										fontFamily: "inherit"
									}
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setEditRoleModal(false),
								disabled: isSavingRole,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: isSavingRole,
								children: [isSavingRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
									size: 14,
									className: "spin"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }), " Save Modifications"]
							})]
						})]
					})]
				})
			}) })
		]
	});
}
function AdminDepartmentsModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [activeTab, setActiveTab] = (0, import_react.useState)("departments");
	const [search, setSearch] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [addDeptModal, setAddDeptModal] = (0, import_react.useState)(false);
	const [editDept, setEditDept] = (0, import_react.useState)(null);
	const [formName, setFormName] = (0, import_react.useState)("");
	const [formCode, setFormCode] = (0, import_react.useState)("");
	const [formHead, setFormHead] = (0, import_react.useState)("");
	const [formDesc, setFormDesc] = (0, import_react.useState)("");
	const [assignDept, setAssignDept] = (0, import_react.useState)(null);
	const [assignSelectedIds, setAssignSelectedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [assignSearch, setAssignSearch] = (0, import_react.useState)("");
	const [assignFilter, setAssignFilter] = (0, import_react.useState)("all");
	const [assignSaving, setAssignSaving] = (0, import_react.useState)(false);
	const [assignTeam, setAssignTeam] = (0, import_react.useState)(null);
	const [assignTeamSelectedIds, setAssignTeamSelectedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [assignTeamSearch, setAssignTeamSearch] = (0, import_react.useState)("");
	const [assignTeamFilter, setAssignTeamFilter] = (0, import_react.useState)("all");
	const [assignTeamSaving, setAssignTeamSaving] = (0, import_react.useState)(false);
	const [addTeamModal, setAddTeamModal] = (0, import_react.useState)(false);
	const [editTeam, setEditTeam] = (0, import_react.useState)(null);
	const [teamFormName, setTeamFormName] = (0, import_react.useState)("");
	const [teamFormDept, setTeamFormDept] = (0, import_react.useState)("Revenue Growth");
	const [teamFormManagerId, setTeamFormManagerId] = (0, import_react.useState)("");
	const [teamFormLeadId, setTeamFormLeadId] = (0, import_react.useState)("");
	const [teamFormDesc, setTeamFormDesc] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => {
			setStoreState(state);
		});
	}, []);
	const departments = hrStore.getDepartments();
	const teams = hrStore.getTeams();
	const employees = storeState.employees || [];
	const isDesignationLead = (d) => {
		const clean = String(d || "").toLowerCase().trim();
		return clean.includes("team lead") || clean.includes("team leader") || clean.includes("tl") || clean.includes("lead") || clean.includes("leader");
	};
	const availableManagers = (employees || []).filter((e) => {
		if (!e || e.status === "inactive" || e.status === "terminated") return false;
		const r = String(e.role || "").toLowerCase().trim().replace(/[-\s]/g, "_");
		return [
			"director",
			"managing_director",
			"co_founder",
			"vertical_head",
			"revenue_growth_manager",
			"general_manager",
			"senior_manager",
			"manager",
			"admin"
		].includes(r) || r.includes("manager") || r.includes("director") || r.includes("head");
	}).sort((a, b) => (a.displayName || a.name || "").localeCompare(b.displayName || b.name || ""));
	const availableLeads = (employees || []).filter((e) => {
		if (!e || e.status === "inactive" || e.status === "terminated") return false;
		return true;
	}).sort((a, b) => {
		const aIsTL = ["team_leader", "team_lead"].includes(String(a.role || "").toLowerCase().trim().replace(/[-\s]/g, "_")) || isDesignationLead(a.designation);
		const bIsTL = ["team_leader", "team_lead"].includes(String(b.role || "").toLowerCase().trim().replace(/[-\s]/g, "_")) || isDesignationLead(b.designation);
		if (aIsTL && !bIsTL) return -1;
		if (!aIsTL && bIsTL) return 1;
		return (a.displayName || a.name || "").localeCompare(b.displayName || b.name || "");
	});
	function isEmployeeInDept(emp, dept) {
		if (!emp || !dept) return false;
		const rawEmpDept = (emp.department || "").trim().toLowerCase();
		if (!rawEmpDept || rawEmpDept === "unassigned") return false;
		const dName = (dept.name || "").trim().toLowerCase();
		const dId = (dept.id || dept.deptId || "").trim().toLowerCase();
		const dCode = (dept.code || "").trim().toLowerCase();
		if (rawEmpDept === dName || rawEmpDept === dId || rawEmpDept === dCode) return true;
		const norm = (str) => str.replace(/[^a-z0-9]/g, "");
		const nEmp = norm(rawEmpDept);
		const nDept = norm(dName);
		if (nEmp && nDept && (nEmp === nDept || nDept.includes(nEmp) || nEmp.includes(nDept))) return true;
		if ([
			"leadership",
			"executive",
			"executiveleadership",
			"management"
		].includes(nEmp) && [
			"leadership",
			"executiveleadership",
			"lead"
		].includes(nDept)) return true;
		if ([
			"humanresources",
			"hr",
			"humanresourceshr",
			"peopleoperations"
		].includes(nEmp) && [
			"humanresourceshr",
			"humanresources",
			"hr"
		].includes(nDept)) return true;
		if ([
			"businessoperations",
			"bizops",
			"businessops",
			"bizop"
		].includes(nEmp) && ["businessoperations", "bizop"].includes(nDept)) return true;
		if ([
			"managingdirector",
			"md",
			"executivedirector"
		].includes(nEmp) && ["managingdirector", "md"].includes(nDept)) return true;
		if ([
			"cofounder",
			"founder",
			"foundingpartner"
		].includes(nEmp) && ["cofounder", "cof"].includes(nDept)) return true;
		if ([
			"technology",
			"tech",
			"it",
			"engineering",
			"sde"
		].includes(nEmp) && ["technology", "tech"].includes(nDept)) return true;
		if ([
			"sales",
			"revenuegrowth",
			"businessdevelopment",
			"bd"
		].includes(nEmp) && ["sales", "sale"].includes(nDept)) return true;
		if (["operations", "ops"].includes(nEmp) && ["operations", "ops"].includes(nDept)) return true;
		if (["b2b", "corporatepartnerships"].includes(nEmp) && ["b2b"].includes(nDept)) return true;
		if ([
			"marketing",
			"mktg",
			"growth"
		].includes(nEmp) && ["marketing", "mktg"].includes(nDept)) return true;
		return false;
	}
	function getDeptMembers(dept) {
		if (!dept) return [];
		return employees.filter((emp) => isEmployeeInDept(emp, dept));
	}
	const deptEmployeeMap = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const d of departments) map.set(d.name.toLowerCase(), []);
		for (const emp of employees) {
			let matched = false;
			for (const d of departments) if (isEmployeeInDept(emp, d)) {
				map.get(d.name.toLowerCase()).push(emp);
				matched = true;
				break;
			}
			if (!matched) {
				if (!map.has("unassigned")) map.set("unassigned", []);
				map.get("unassigned").push(emp);
			}
		}
		return map;
	}, [departments, employees]);
	const filteredDepts = departments.filter((d) => {
		const q = search.toLowerCase();
		return d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q) || d.head?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
	});
	const filteredTeams = teams.filter((t) => {
		const q = search.toLowerCase();
		return t.name?.toLowerCase().includes(q) || t.department?.toLowerCase().includes(q) || t.managerName?.toLowerCase().includes(q) || t.teamLeadName?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
	});
	const flaggedTeams = teams.filter((t) => t.flaggedForVerification);
	const totalEmployeesAssigned = employees.filter((e) => {
		const d = (e.department || "").trim().toLowerCase();
		return d && d !== "unassigned" && departments.some((dept) => isEmployeeInDept(e, dept));
	}).length;
	const unassignedCount = Math.max(0, employees.length - totalEmployeesAssigned);
	const largestDept = (0, import_react.useMemo)(() => {
		let top = null;
		let max = 0;
		for (const d of departments) {
			const count = (deptEmployeeMap.get(d.name.toLowerCase()) || []).length;
			if (count >= max) {
				max = count;
				top = {
					name: d.name,
					count
				};
			}
		}
		return top || {
			name: "None",
			count: 0
		};
	}, [departments, deptEmployeeMap]);
	const filteredAssignEmployees = (0, import_react.useMemo)(() => {
		if (!assignDept) return [];
		const q = assignSearch.toLowerCase().trim();
		return employees.filter((emp) => {
			if (q) {
				const nameMatch = (emp.displayName || emp.name || "").toLowerCase().includes(q);
				const idMatch = (emp.employeeId || "").toLowerCase().includes(q);
				const roleMatch = (emp.role || "").toLowerCase().includes(q);
				const deptMatch = (emp.department || "").toLowerCase().includes(q);
				const desigMatch = (emp.designation || "").toLowerCase().includes(q);
				if (!nameMatch && !idMatch && !roleMatch && !deptMatch && !desigMatch) return false;
			}
			const isSelected = assignSelectedIds.has(String(emp.id || emp._id));
			const isHere = isEmployeeInDept(emp, assignDept);
			const isUnassigned = !departments.some((d) => isEmployeeInDept(emp, d)) || (emp.department || "").toLowerCase() === "unassigned";
			if (assignFilter === "assigned") return isSelected || isHere;
			if (assignFilter === "unassigned") return isUnassigned;
			if (assignFilter === "other") return !isHere && !isUnassigned;
			return true;
		});
	}, [
		employees,
		assignDept,
		assignSearch,
		assignFilter,
		assignSelectedIds,
		departments
	]);
	const totalTeamMembers = teams.reduce((acc, t) => acc + (t.memberCount || 0), 0);
	const uniqueTeamManagers = (0, import_react.useMemo)(() => {
		return Array.from(new Set(teams.map((t) => t.managerName).filter(Boolean)));
	}, [teams]);
	const teamManagerSummary = (0, import_react.useMemo)(() => {
		if (uniqueTeamManagers.length === 0) return "No managers assigned";
		return uniqueTeamManagers.map((mName) => {
			const count = teams.filter((t) => t.managerName === mName).length;
			return `${mName} (${count} ${count === 1 ? "Team" : "Teams"})`;
		}).join(" • ");
	}, [teams, uniqueTeamManagers]);
	function isEmployeeInTeam(emp, team) {
		if (!emp || !team) return false;
		const teamId = String(team.teamId || team.id || team._id || "").trim().toLowerCase();
		const teamName = String(team.name || "").trim().toLowerCase();
		const teamSlug = `team-${teamName.replace(/[^a-z0-9]/g, "_")}`;
		const empTeam = String(emp.team || "").trim().toLowerCase();
		const empTeamId = String(emp.teamId || "").trim().toLowerCase();
		const empSquad = String(emp.squad || "").trim().toLowerCase();
		const empSquadId = String(emp.squadId || "").trim().toLowerCase();
		return Boolean(empTeamId && (empTeamId === teamId || empTeamId === teamSlug) || empTeam && (empTeam === teamName || empTeam === teamId) || empSquadId && (empSquadId === teamId || empSquadId === teamSlug) || empSquad && (empSquad === teamName || empSquad === teamId));
	}
	function getTeamMembersList(team) {
		if (!team) return [];
		return employees.filter((e) => isEmployeeInTeam(e, team));
	}
	const filteredAssignTeamEmployees = (0, import_react.useMemo)(() => {
		if (!assignTeam) return [];
		return employees.filter((emp) => {
			if (emp.status === "terminated") return false;
			if (assignTeamSearch.trim()) {
				const q = assignTeamSearch.toLowerCase().trim();
				const nameMatch = (emp.displayName || emp.name || "").toLowerCase().includes(q);
				const idMatch = (emp.employeeId || "").toLowerCase().includes(q);
				const roleMatch = (emp.role || "").toLowerCase().includes(q);
				const deptMatch = (emp.department || "").toLowerCase().includes(q);
				const teamMatch = (emp.team || emp.squad || "").toLowerCase().includes(q);
				const desigMatch = (emp.designation || "").toLowerCase().includes(q);
				if (!nameMatch && !idMatch && !roleMatch && !deptMatch && !teamMatch && !desigMatch) return false;
			}
			const isSelected = assignTeamSelectedIds.has(String(emp.id || emp._id));
			const isHere = isEmployeeInTeam(emp, assignTeam);
			const isUnassigned = !emp.team && !emp.teamId && !emp.squad && !emp.squadId;
			if (assignTeamFilter === "assigned") return isSelected || isHere;
			if (assignTeamFilter === "unassigned") return isUnassigned;
			if (assignTeamFilter === "other") return !isHere && !isUnassigned;
			return true;
		});
	}, [
		employees,
		assignTeam,
		assignTeamSearch,
		assignTeamFilter,
		assignTeamSelectedIds
	]);
	function openAssignTeamModal(team) {
		setAssignTeam(team);
		setAssignTeamSearch("");
		setAssignTeamFilter("all");
		const members = getTeamMembersList(team);
		setAssignTeamSelectedIds(new Set(members.map((e) => String(e.id || e._id))));
	}
	function toggleAssignTeamEmployee(empId) {
		const next = new Set(assignTeamSelectedIds);
		const strId = String(empId);
		if (next.has(strId)) next.delete(strId);
		else next.add(strId);
		setAssignTeamSelectedIds(next);
	}
	function handleSelectAllTeamUnassigned() {
		const next = new Set(assignTeamSelectedIds);
		for (const emp of employees) if (emp.status !== "terminated" && !emp.team && !emp.teamId && !emp.squad && !emp.squadId) next.add(String(emp.id || emp._id));
		setAssignTeamSelectedIds(next);
	}
	async function handleSaveTeamAssignments() {
		if (!assignTeam || assignTeamSaving) return;
		setAssignTeamSaving(true);
		try {
			const teamIdOrName = assignTeam.teamId || assignTeam.id || assignTeam.name;
			await hrStore.assignEmployeesToTeam(teamIdOrName, Array.from(assignTeamSelectedIds), user);
			setStoreState(hrStore.getState());
			setNotice(`Updated squad roster for ${assignTeam.name}: ${assignTeamSelectedIds.size} members assigned successfully.`);
			setAssignTeam(null);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to update squad assignments.");
		} finally {
			setAssignTeamSaving(false);
		}
	}
	function openAssignModal(dept) {
		setAssignDept(dept);
		setAssignSearch("");
		setAssignFilter("all");
		const members = getDeptMembers(dept);
		setAssignSelectedIds(new Set(members.map((e) => String(e.id || e._id))));
	}
	function toggleAssignEmployee(empId) {
		const next = new Set(assignSelectedIds);
		const strId = String(empId);
		if (next.has(strId)) next.delete(strId);
		else next.add(strId);
		setAssignSelectedIds(next);
	}
	function handleSelectAllUnassigned() {
		const next = new Set(assignSelectedIds);
		for (const emp of employees) if (!departments.some((d) => isEmployeeInDept(emp, d)) || (emp.department || "").toLowerCase() === "unassigned") next.add(String(emp.id || emp._id));
		setAssignSelectedIds(next);
	}
	async function handleSaveAssignments() {
		if (!assignDept || assignSaving) return;
		setAssignSaving(true);
		try {
			const deptName = assignDept.name;
			const currentMembers = getDeptMembers(assignDept);
			const currentIds = new Set(currentMembers.map((e) => String(e.id || e._id)));
			const toAdd = employees.filter((e) => assignSelectedIds.has(String(e.id || e._id)) && !currentIds.has(String(e.id || e._id)));
			const toRemove = employees.filter((e) => currentIds.has(String(e.id || e._id)) && !assignSelectedIds.has(String(e.id || e._id)));
			for (const emp of toAdd) await hrStore.updateEmployee(emp.id, { department: deptName });
			for (const emp of toRemove) await hrStore.updateEmployee(emp.id, { department: "Unassigned" });
			setNotice(`Updated workforce for ${deptName}: +${toAdd.length} added, -${toRemove.length} removed. Headcount is now ${assignSelectedIds.size}!`);
			setAssignDept(null);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to update department assignments.");
		} finally {
			setAssignSaving(false);
		}
	}
	function handleNameChange(val) {
		setFormName(val);
		if (!formCode || formCode === formName.slice(0, 4).toUpperCase()) setFormCode(val.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase());
	}
	async function handleCreateDepartment(e) {
		e.preventDefault();
		if (saving) return;
		const name = formName.trim();
		if (!name) return;
		setSaving(true);
		try {
			const code = (formCode.trim() || name.slice(0, 4)).toUpperCase();
			const deptId = `dept-${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
			await hrStore.addDepartment({
				id: deptId,
				deptId,
				name,
				code,
				head: formHead.trim() || "Unassigned",
				description: formDesc.trim()
			});
			setAddDeptModal(false);
			setFormName("");
			setFormCode("");
			setFormHead("");
			setFormDesc("");
			setStoreState(hrStore.getState());
			setNotice(`Department '${name}' created and saved! You can now assign employees to it.`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to create department.");
		} finally {
			setSaving(false);
		}
	}
	async function handleUpdateDepartment(e) {
		e.preventDefault();
		if (saving || !editDept) return;
		const name = (editDept.name || "").trim();
		if (!name) return;
		setSaving(true);
		try {
			const id = editDept.id || editDept.deptId;
			const newHead = editDept.head?.trim() || "Unassigned";
			const newCode = (editDept.code || name.slice(0, 4)).trim().toUpperCase();
			const oldName = (editDept.originalName || editDept.name || "").trim();
			await hrStore.updateDepartment(id, {
				name,
				code: newCode,
				head: newHead,
				description: editDept.description || "",
				oldName
			});
			if (newHead && newHead !== "Unassigned") {
				const headEmp = employees.find((e) => (e.displayName || e.name) === newHead || e.name?.toLowerCase() === newHead.toLowerCase());
				if (headEmp && headEmp.department !== name) await hrStore.updateEmployee(headEmp.id, { department: name });
			}
			setStoreState(hrStore.getState());
			setEditDept(null);
			setNotice(`Department '${name}' (${newCode}) updated successfully!`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to update department.");
		} finally {
			setSaving(false);
		}
	}
	async function handleDeleteDepartment(dept) {
		if (INITIAL_DEPARTMENTS.some((d) => d.id === dept.id || d.name.toLowerCase() === dept.name.toLowerCase())) {
			alert(`System Core Department '${dept.name}' is essential to company workflows and cannot be deleted.`);
			return;
		}
		const assigned = (deptEmployeeMap.get(dept.name.toLowerCase()) || []).length;
		if (assigned > 0) {
			if (!window.confirm(`Warning: There are ${assigned} active employee(s) currently assigned to '${dept.name}'. Are you sure you want to delete this department?`)) return;
		} else if (!window.confirm(`Are you sure you want to delete department '${dept.name}'?`)) return;
		try {
			await hrStore.deleteDepartment(dept.id || dept.deptId);
			setStoreState(hrStore.getState());
			setNotice(`Department '${dept.name}' deleted.`);
			setTimeout(() => setNotice(""), 4e3);
		} catch (err) {
			alert(err.message || "Failed to delete department.");
		}
	}
	async function handleCreateTeam(e) {
		e.preventDefault();
		if (saving) return;
		const name = teamFormName.trim();
		if (!name) return;
		setSaving(true);
		try {
			const mgr = (employees || []).find((m) => String(m.id || m._id || m.employeeId) === String(teamFormManagerId));
			const tl = (employees || []).find((m) => String(m.id || m._id || m.employeeId) === String(teamFormLeadId));
			await hrStore.addTeam({
				name,
				department: teamFormDept,
				managerId: teamFormManagerId || null,
				managerName: mgr?.displayName || mgr?.name || "",
				teamLeadId: teamFormLeadId || null,
				teamLeadName: tl?.displayName || tl?.name || "",
				description: teamFormDesc.trim()
			});
			setStoreState(hrStore.getState());
			setAddTeamModal(false);
			setTeamFormName("");
			setTeamFormDept("Revenue Growth");
			setTeamFormManagerId("");
			setTeamFormLeadId("");
			setTeamFormDesc("");
			setNotice(`Team '${name}' successfully created and linked!`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to create team.");
		} finally {
			setSaving(false);
		}
	}
	async function handleUpdateTeam(e) {
		e.preventDefault();
		if (saving || !editTeam) return;
		const name = (editTeam.name || "").trim();
		if (!name) return;
		setSaving(true);
		try {
			const mgr = (employees || []).find((m) => String(m.id || m._id || m.employeeId) === String(editTeam.managerId));
			const tl = (employees || []).find((m) => String(m.id || m._id || m.employeeId) === String(editTeam.teamLeadId));
			await hrStore.updateTeam(editTeam.id, {
				name,
				department: editTeam.department,
				managerId: editTeam.managerId,
				managerName: mgr?.displayName || mgr?.name || editTeam.managerName || "",
				teamLeadId: editTeam.teamLeadId,
				teamLeadName: tl?.displayName || tl?.name || editTeam.teamLeadName || "",
				description: editTeam.description || "",
				flaggedForVerification: Boolean(editTeam.flaggedForVerification),
				verificationNote: editTeam.verificationNote || ""
			});
			setStoreState(hrStore.getState());
			setEditTeam(null);
			setNotice(`Team '${name}' settings updated successfully!`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to update team.");
		} finally {
			setSaving(false);
		}
	}
	async function handleDeleteTeam(team) {
		if (!window.confirm(`Are you sure you want to delete team '${team.name}'? This will unassign all squad members.`)) return;
		try {
			await hrStore.deleteTeam(team.id);
			setStoreState(hrStore.getState());
			setNotice(`Team '${team.name}' deleted.`);
			setTimeout(() => setNotice(""), 4e3);
		} catch (err) {
			alert(err.message || "Failed to delete team.");
		}
	}
	async function handleVerifyTeam(teamId) {
		try {
			await hrStore.verifyTeamAssignment(teamId);
			setNotice(`Team assignment verified and finalized!`);
			setTimeout(() => setNotice(""), 4500);
		} catch (err) {
			alert(err.message || "Failed to verify team.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Organizational Governance",
				title: "Departments & Teams Management",
				description: "Configure corporate departments, operational squads, assign team leads and managers, and manage organizational units across the company.",
				children: activeTab === "departments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => {
						setFormName("");
						setFormCode("");
						setFormHead("");
						setFormDesc("");
						setAddDeptModal(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), " Add Department"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: () => {
						setTeamFormName("");
						setTeamFormDept("Revenue Growth");
						setTeamFormManagerId(availableManagers[0]?.id || "");
						setTeamFormLeadId(availableLeads[0]?.id || "");
						setTeamFormDesc("");
						setAddTeamModal(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }), " Add Team"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					gap: "10px",
					borderBottom: "1px solid var(--border)",
					paddingBottom: "12px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `ui-button ${activeTab === "departments" ? "primary" : "secondary"}`,
					onClick: () => {
						setActiveTab("departments");
						setSearch("");
					},
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						fontWeight: 600
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { size: 14 }),
						" Corporate Departments (",
						departments.length,
						")"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `ui-button ${activeTab === "teams" ? "primary" : "secondary"}`,
					onClick: () => {
						setActiveTab("teams");
						setSearch("");
					},
					style: {
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						fontWeight: 600
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 14 }),
						" Teams & Squads (",
						teams.length,
						")",
						flaggedTeams.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								background: "#dd6b20",
								color: "#fff",
								fontSize: "10px",
								fontWeight: 700,
								borderRadius: "10px",
								padding: "1px 6px",
								marginLeft: "4px"
							},
							children: [flaggedTeams.length, " Review"]
						})
					]
				})]
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 16px",
					background: "#eaf4f1",
					border: "1px solid #cce8e0",
					borderRadius: "6px",
					color: "#135c4a",
					fontSize: "13px",
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 16 }), notice]
			}),
			activeTab === "departments" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "metric-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "metric-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "metric-icon",
							style: {
								background: "#fef3e7",
								color: "#c25e00"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Departments" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [departments.length, " Units"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: departments.length > 0 ? `${departments.length} active departments` : "No departments configured yet" })
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned Workforce" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [totalEmployeesAssigned, " Employees"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: unassignedCount > 0 ? `${unassignedCount} unassigned` : "All employees assigned" })
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { size: 20 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-copy",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Largest Department" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { fontSize: "15px" },
									children: largestDept.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [largestDept.count, " Assigned Members"] })
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "16px",
						flexWrap: "wrap",
						gap: "10px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							position: "relative",
							width: "320px"
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
							className: "text-input",
							style: {
								width: "100%",
								paddingLeft: "32px",
								fontSize: "12px"
							},
							placeholder: "Search by department name, code, or head...",
							value: search,
							onChange: (e) => setSearch(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						style: {
							fontSize: "12px",
							color: "var(--muted)"
						},
						children: [
							"Showing ",
							filteredDepts.length,
							" of ",
							departments.length,
							" departments"
						]
					})]
				}), filteredDepts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No departments found",
					message: search ? "No departments match your search query." : "No departments configured yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "table-responsive",
					style: {
						overflowX: "auto",
						width: "100%",
						WebkitOverflowScrolling: "touch"
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "ui-table",
						style: {
							minWidth: "860px",
							width: "100%"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { minWidth: "190px" },
								children: "Department & Code"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { minWidth: "150px" },
								children: "Department Head"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { minWidth: "140px" },
								children: "Headcount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: { minWidth: "240px" },
								children: "Description"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								style: {
									minWidth: "180px",
									textAlign: "right"
								},
								children: "Actions"
							})
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredDepts.map((d) => {
							const assignedCount = (deptEmployeeMap.get(d.name.toLowerCase()) || []).length;
							const isCore = INITIAL_DEPARTMENTS.some((item) => item.id === d.id || item.name.toLowerCase() === d.name.toLowerCase());
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										flexWrap: "wrap"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontWeight: 600,
												color: "var(--ink)"
											},
											children: d.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "role-badge",
											style: {
												fontSize: "10px",
												padding: "1px 6px",
												background: "#f0f4f8",
												color: "#334e68"
											},
											children: d.code
										}),
										isCore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "role-badge",
											style: {
												fontSize: "9px",
												padding: "1px 5px",
												background: "#f5fbf9",
												color: "var(--teal)"
											},
											children: "Core"
										})
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											width: "22px",
											height: "22px",
											borderRadius: "50%",
											background: "#eef2f6",
											color: "var(--blue)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "10px",
											fontWeight: 600,
											flexShrink: 0
										},
										children: d.head && d.head !== "Unassigned" ? d.head.charAt(0).toUpperCase() : "?"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: d.head && d.head !== "Unassigned" ? "var(--ink)" : "var(--muted)",
											whiteSpace: "nowrap"
										},
										children: d.head || "Unassigned"
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: { cursor: "pointer" },
									onClick: () => openAssignModal(d),
									title: `Click to assign or reallocate members to ${d.name}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "role-badge",
											style: {
												fontSize: "11px",
												background: assignedCount > 0 ? "#eaf4f1" : "#fff1f2",
												color: assignedCount > 0 ? "var(--teal)" : "#be123c",
												display: "inline-flex",
												alignItems: "center",
												gap: "4px",
												padding: "3px 8px",
												borderRadius: "12px",
												fontWeight: 600,
												whiteSpace: "nowrap"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
													size: 11,
													style: { marginRight: "2px" }
												}),
												assignedCount,
												" ",
												assignedCount === 1 ? "member" : "members"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												color: "var(--teal)",
												fontWeight: 600,
												textDecoration: "underline",
												whiteSpace: "nowrap"
											},
											children: "Manage →"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "dept-description-cell",
									style: {
										minWidth: "220px",
										maxWidth: "360px",
										fontSize: "12px",
										color: "var(--muted)",
										wordBreak: "break-word",
										overflowWrap: "break-word",
										lineHeight: "1.5",
										whiteSpace: "normal"
									},
									children: d.description || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									style: {
										textAlign: "right",
										whiteSpace: "nowrap"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "inline-flex",
											gap: "6px",
											alignItems: "center",
											justifyContent: "flex-end"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "ui-button primary",
												style: {
													padding: "4px 9px",
													fontSize: "11px",
													display: "inline-flex",
													alignItems: "center",
													gap: "4px"
												},
												onClick: () => openAssignModal(d),
												title: `Assign or reallocate members to ${d.name}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 12 }), " Assign"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "ui-button secondary",
												style: {
													padding: "4px 8px",
													fontSize: "11px"
												},
												onClick: () => setEditDept({
													...d,
													originalName: d.name
												}),
												title: "Edit Department",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 12 }), " Edit"]
											}),
											!isCore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "ui-button secondary",
												style: {
													padding: "4px 8px",
													fontSize: "11px",
													color: "#c53030"
												},
												onClick: () => handleDeleteDepartment(d),
												title: "Delete Department",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), " Delete"]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10px",
													color: "var(--muted)",
													padding: "4px 6px"
												},
												children: "System Core"
											})
										]
									})
								})
							] }, d.id || d.deptId || d.name);
						}) })]
					})
				})]
			})] }),
			activeTab === "teams" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				flaggedTeams.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						padding: "14px 18px",
						background: "#fffaf0",
						border: "1px solid #feebc8",
						borderRadius: "8px",
						color: "#9c4221",
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
							size: 22,
							color: "#dd6b20"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
							style: { fontSize: "13px" },
							children: "Administrator Verification Required"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "12px",
								marginTop: "2px",
								color: "#7b341e"
							},
							children: flaggedTeams.map((t) => `${t.name} (Proposed TL: ${t.teamLeadName}): ${t.verificationNote || "Flagged for review before finalizing."}`).join(" | ")
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "flex",
							gap: "8px"
						},
						children: flaggedTeams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ui-button primary",
							style: {
								fontSize: "11px",
								padding: "6px 12px",
								background: "#c05621",
								borderColor: "#c05621"
							},
							onClick: () => handleVerifyTeam(t.id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { size: 13 }),
								" Verify & Confirm ",
								t.name,
								" Assignment"
							]
						}, t.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "metric-grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "metric-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "metric-icon",
								style: {
									background: "#f3e8ff",
									color: "#7e22ce"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Active Squads" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [teams.length, " Teams"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: teams.length > 0 ? `${teams.length} configured squads` : "No squads created yet" })
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
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Reporting Scope" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										uniqueTeamManagers.length,
										" ",
										uniqueTeamManagers.length === 1 ? "Manager" : "Managers"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: teamManagerSummary })
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
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "metric-copy",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned Workforce" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [totalTeamMembers, " Members"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: flaggedTeams.length > 0 ? `${flaggedTeams.length} team pending verification` : totalTeamMembers > 0 ? "All team assignments verified" : "No members assigned" })
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "16px",
							flexWrap: "wrap",
							gap: "10px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								position: "relative",
								width: "320px"
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
								className: "text-input",
								style: {
									width: "100%",
									paddingLeft: "32px",
									fontSize: "12px"
								},
								placeholder: "Search by team name, TL, manager, or department...",
								value: search,
								onChange: (e) => setSearch(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							style: {
								fontSize: "12px",
								color: "var(--muted)"
							},
							children: [
								"Showing ",
								filteredTeams.length,
								" of ",
								teams.length,
								" teams"
							]
						})]
					}), filteredTeams.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No teams found",
						message: search ? "No teams match your search query." : "No teams configured yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "table-responsive",
						style: {
							overflowX: "auto",
							width: "100%",
							WebkitOverflowScrolling: "touch"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "ui-table",
							style: {
								minWidth: "880px",
								width: "100%"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { minWidth: "160px" },
									children: "Team Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { minWidth: "140px" },
									children: "Department"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { minWidth: "160px" },
									children: "Reporting Manager"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { minWidth: "160px" },
									children: "Team Leader (TL)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { minWidth: "120px" },
									children: "Headcount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: { minWidth: "160px" },
									children: "Verification Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									style: {
										minWidth: "150px",
										textAlign: "right"
									},
									children: "Actions"
								})
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredTeams.map((t) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { color: "var(--ink)" },
											children: t.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "role-badge",
											style: {
												fontSize: "9px",
												padding: "1px 5px",
												background: "#f3e8ff",
												color: "#7e22ce"
											},
											children: "Squad"
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "12px",
											color: "var(--muted)"
										},
										children: t.department
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												width: "22px",
												height: "22px",
												borderRadius: "50%",
												background: "#eef2f6",
												color: "var(--blue)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: "10px",
												fontWeight: 600
											},
											children: t.managerName ? t.managerName.charAt(0).toUpperCase() : "?"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "12px",
												fontWeight: 500,
												color: "var(--ink)"
											},
											children: t.managerName || "Unassigned"
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												width: "22px",
												height: "22px",
												borderRadius: "50%",
												background: "#eaf4f1",
												color: "var(--teal)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: "10px",
												fontWeight: 600
											},
											children: t.teamLeadName ? t.teamLeadName.charAt(0).toUpperCase() : "?"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "12px",
												fontWeight: 600,
												color: "var(--ink)"
											},
											children: t.teamLeadName || "Unassigned"
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "role-badge",
										style: {
											fontSize: "11px",
											background: t.memberCount > 0 ? "#eaf4f1" : "#f8f9fa",
											color: t.memberCount > 0 ? "var(--teal)" : "var(--muted)"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
												size: 11,
												style: { marginRight: "4px" }
											}),
											t.memberCount || 0,
											" ",
											t.memberCount === 1 ? "member" : "members"
										]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: t.flaggedForVerification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "role-badge",
										style: {
											fontSize: "10px",
											background: "#feebc8",
											color: "#c05621",
											border: "1px solid #fbd38d"
										},
										children: "⚠️ Verification Pending"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "role-badge",
										style: {
											fontSize: "10px",
											background: "#d1fae5",
											color: "#047857",
											border: "1px solid #a7f3d0"
										},
										children: "✓ Verified Active"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										style: {
											textAlign: "right",
											whiteSpace: "nowrap"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "inline-flex",
												gap: "6px",
												alignItems: "center",
												justifyContent: "flex-end"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "ui-button secondary",
													style: {
														padding: "4px 8px",
														fontSize: "11px",
														color: "var(--teal)",
														borderColor: "var(--teal)"
													},
													onClick: () => openAssignTeamModal(t),
													title: "Assign / Remove Squad Members",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 12 }), " Assign Members"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "ui-button secondary",
													style: {
														padding: "4px 8px",
														fontSize: "11px"
													},
													onClick: () => setEditTeam({ ...t }),
													title: "Edit Team Settings & Reporting Lines",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 12 }), " Edit"]
												}),
												t.flaggedForVerification && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "ui-button primary",
													style: {
														padding: "4px 8px",
														fontSize: "11px",
														background: "#c05621",
														borderColor: "#c05621"
													},
													onClick: () => handleVerifyTeam(t.id),
													title: "Confirm assignment",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 12 }), " Verify"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													className: "ui-button secondary",
													style: {
														padding: "4px 8px",
														fontSize: "11px",
														color: "#c53030"
													},
													onClick: () => handleDeleteTeam(t),
													title: "Delete Team",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 12 }), " Delete"]
												})
											]
										})
									})
								] }, t.id || t.name);
							}) })]
						})
					})]
				})
			] }),
			addDeptModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setAddDeptModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "480px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Create Department"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: "Structure operational business units and department leads"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setAddDeptModal(false),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateDepartment,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Department Name *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Artificial Intelligence / Customer Success",
									value: formName,
									onChange: (e) => handleNameChange(e.target.value),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department Code *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										className: "text-input",
										style: { textTransform: "uppercase" },
										placeholder: "e.g. AI / CS",
										value: formCode,
										onChange: (e) => setFormCode(e.target.value.toUpperCase()),
										maxLength: 10,
										required: true
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department Head"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "select-control",
										value: formHead,
										onChange: (e) => setFormHead(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Unassigned",
											children: "-- Select Employee --"
										}), employees.filter((e) => e.status === "active").map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: e.displayName || e.name,
											children: [
												e.displayName || e.name,
												" (",
												e.designation || e.role || "Staff",
												")"
											]
										}, e.id || e._id))]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Description & Mandate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "text-input",
									placeholder: "Define the team mandate, focus areas, and functional responsibilities...",
									value: formDesc,
									onChange: (e) => setFormDesc(e.target.value)
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setAddDeptModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: saving,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }),
									" ",
									saving ? "Creating..." : "Create Department"
								]
							})]
						})]
					})]
				})
			}) }),
			editDept && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setEditDept(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "480px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Edit Department"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "modal-subtitle-text",
								children: [
									editDept.name,
									" (",
									editDept.code,
									")"
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setEditDept(null),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleUpdateDepartment,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Department Name *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									value: editDept.name,
									onChange: (e) => setEditDept({
										...editDept,
										name: e.target.value
									}),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department Code *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										className: "text-input",
										style: { textTransform: "uppercase" },
										value: editDept.code || "",
										onChange: (e) => setEditDept({
											...editDept,
											code: e.target.value.toUpperCase()
										}),
										maxLength: 10,
										required: true
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department Head"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "select-control",
										value: editDept.head || "Unassigned",
										onChange: (e) => setEditDept({
											...editDept,
											head: e.target.value
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Unassigned",
											children: "Unassigned"
										}), employees.filter((e) => e.status === "active").map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: e.displayName || e.name,
											children: [
												e.displayName || e.name,
												" (",
												e.designation || e.role || "Staff",
												")"
											]
										}, e.id || e._id))]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Description & Mandate"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "text-input",
									value: editDept.description || "",
									onChange: (e) => setEditDept({
										...editDept,
										description: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: "12px",
										padding: "12px",
										background: "#f8fafc",
										borderRadius: "8px",
										border: "1px solid #e2e8f0",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											fontSize: "12px",
											fontWeight: 600,
											color: "var(--ink)"
										},
										children: "Department Workforce"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											fontSize: "11px",
											color: "var(--muted)"
										},
										children: [(deptEmployeeMap.get(editDept.name.toLowerCase()) || []).length, " assigned members"]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button secondary",
										style: {
											fontSize: "11px",
											padding: "4px 10px",
											display: "inline-flex",
											alignItems: "center",
											gap: "4px"
										},
										onClick: () => {
											const target = { ...editDept };
											setEditDept(null);
											openAssignModal(target);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 12 }), " Assign Members"]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setEditDept(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: saving,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }),
									" ",
									saving ? "Saving..." : "Save Changes"
								]
							})]
						})]
					})]
				})
			}) }),
			assignDept && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setAssignDept(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: {
						maxWidth: "640px",
						width: "95%"
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
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { size: 20 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "modal-title-text",
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px"
									},
									children: [
										"Assign Members: ",
										assignDept.name,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "role-badge",
											style: {
												fontSize: "11px",
												background: "#f0f4f8",
												color: "#334e68"
											},
											children: assignDept.code
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "modal-subtitle-text",
									children: [
										"Select employees to assign to ",
										assignDept.name,
										". Headcount updates dynamically in real-time."
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setAssignDept(null),
								"aria-label": "Close modal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							style: {
								gap: "14px",
								maxHeight: "68vh",
								overflowY: "auto"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(3, 1fr)",
										gap: "10px",
										background: "#f8fafc",
										padding: "12px",
										borderRadius: "8px",
										border: "1px solid #e2e8f0"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												textTransform: "uppercase",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Selected Headcount"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "18px",
												fontWeight: 700,
												color: "var(--teal)"
											},
											children: [
												assignSelectedIds.size,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "12px",
														fontWeight: 500,
														color: "var(--ink)"
													},
													children: "Members"
												})
											]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												textTransform: "uppercase",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Department Head"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "12px",
												fontWeight: 600,
												color: "var(--ink)",
												marginTop: "4px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap"
											},
											children: assignDept.head || "Unassigned"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												textTransform: "uppercase",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Unassigned In Org"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "18px",
												fontWeight: 700,
												color: unassignedCount > 0 ? "#dd6b20" : "var(--muted)"
											},
											children: [
												unassignedCount,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "12px",
														fontWeight: 500,
														color: "var(--ink)"
													},
													children: "Available"
												})
											]
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "8px",
										flexWrap: "wrap",
										alignItems: "center",
										justifyContent: "space-between"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											position: "relative",
											flex: "1 1 220px"
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
											className: "text-input",
											style: {
												width: "100%",
												paddingLeft: "32px",
												fontSize: "12px",
												height: "34px"
											},
											placeholder: "Search employees by name, ID, role, or department...",
											value: assignSearch,
											onChange: (e) => setAssignSearch(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											display: "flex",
											gap: "6px"
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "ui-button secondary",
											style: {
												fontSize: "11px",
												padding: "4px 8px",
												height: "34px"
											},
											onClick: handleSelectAllUnassigned,
											title: "Select all staff currently without any department",
											children: [
												"+ Add All Unassigned (",
												unassignedCount,
												")"
											]
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "flex",
										gap: "6px",
										borderBottom: "1px solid #e2e8f0",
										paddingBottom: "8px"
									},
									children: [
										{
											id: "all",
											label: `All Staff (${employees.length})`
										},
										{
											id: "assigned",
											label: `Assigned Here (${assignSelectedIds.size})`
										},
										{
											id: "unassigned",
											label: `Unassigned (${unassignedCount})`
										},
										{
											id: "other",
											label: `Other Depts`
										}
									].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setAssignFilter(f.id),
										style: {
											fontSize: "11px",
											padding: "4px 10px",
											borderRadius: "14px",
											border: "1px solid",
											borderColor: assignFilter === f.id ? "var(--teal)" : "#cbd5e1",
											background: assignFilter === f.id ? "var(--teal)" : "#fff",
											color: assignFilter === f.id ? "#fff" : "var(--ink)",
											fontWeight: assignFilter === f.id ? 600 : 500,
											cursor: "pointer"
										},
										children: f.label
									}, f.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										display: "grid",
										gap: "6px",
										maxHeight: "360px",
										overflowY: "auto",
										paddingRight: "4px"
									},
									children: filteredAssignEmployees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											textAlign: "center",
											padding: "30px 10px",
											color: "var(--muted)",
											fontSize: "13px"
										},
										children: "No employees match your search or filter."
									}) : filteredAssignEmployees.map((emp) => {
										const isSelected = assignSelectedIds.has(String(emp.id || emp._id));
										const isAlreadyHere = isEmployeeInDept(emp, assignDept);
										const empDept = emp.department || "Unassigned";
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											onClick: () => toggleAssignEmployee(emp.id || emp._id),
											style: {
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												padding: "10px 12px",
												borderRadius: "8px",
												border: "1px solid",
												borderColor: isSelected ? "var(--teal)" : "#e2e8f0",
												background: isSelected ? "#f0fdfa" : "#fff",
												cursor: "pointer",
												transition: "all 0.15s ease"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "10px"
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														checked: isSelected,
														onChange: () => {},
														style: {
															cursor: "pointer",
															width: "16px",
															height: "16px",
															accentColor: "var(--teal)"
														}
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														style: {
															width: "32px",
															height: "32px",
															borderRadius: "50%",
															background: isSelected ? "#ccfbf1" : "#f1f5f9",
															color: isSelected ? "var(--teal)" : "#475569",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															fontSize: "12px",
															fontWeight: 700
														},
														children: emp.name ? emp.name.charAt(0).toUpperCase() : "?"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: {
															fontSize: "13px",
															fontWeight: 600,
															color: "var(--ink)",
															display: "flex",
															alignItems: "center",
															gap: "6px"
														},
														children: [emp.displayName || emp.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															style: {
																fontSize: "10px",
																color: "var(--muted)",
																fontWeight: 500
															},
															children: ["#", emp.employeeId || "ID-TBD"]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														style: {
															fontSize: "11px",
															color: "var(--muted)",
															display: "flex",
															alignItems: "center",
															gap: "6px",
															marginTop: "2px"
														},
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: emp.designation || emp.role || "Staff" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																style: { textTransform: "capitalize" },
																children: emp.role?.replace(/_/g, " ") || "employee"
															})
														]
													})] })
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "8px"
												},
												children: [isAlreadyHere ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "role-badge",
													style: {
														fontSize: "10px",
														background: "#dcfce7",
														color: "#15803d",
														padding: "2px 8px"
													},
													children: "Currently Here"
												}) : empDept.toLowerCase() === "unassigned" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "role-badge",
													style: {
														fontSize: "10px",
														background: "#fef3c7",
														color: "#b45309",
														padding: "2px 8px"
													},
													children: "Unassigned"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "role-badge",
													style: {
														fontSize: "10px",
														background: "#f1f5f9",
														color: "#475569",
														padding: "2px 8px"
													},
													children: ["In ", empDept]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													className: `ui-button ${isSelected ? "secondary" : "primary"}`,
													style: {
														fontSize: "11px",
														padding: "3px 10px",
														height: "28px"
													},
													onClick: (e) => {
														e.stopPropagation();
														toggleAssignEmployee(emp.id || emp._id);
													},
													children: isSelected ? "Remove" : "+ Assign"
												})]
											})]
										}, emp.id || emp._id);
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							style: {
								justifyContent: "space-between",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									fontSize: "12px",
									color: "var(--ink)"
								},
								children: ["Staged Headcount: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [assignSelectedIds.size, " employees"] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									onClick: () => setAssignDept(null),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									disabled: assignSaving,
									onClick: handleSaveAssignments,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }),
										" ",
										assignSaving ? "Updating..." : `Save ${assignSelectedIds.size} Assignments`
									]
								})]
							})]
						})
					]
				})
			}) }),
			assignTeam && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setAssignTeam(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: {
						maxWidth: "640px",
						width: "95%"
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
										background: "#f3e8ff",
										color: "#7e22ce"
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 20 })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
									className: "modal-title-text",
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px"
									},
									children: [
										"Assign Squad Members: ",
										assignTeam.name,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "role-badge",
											style: {
												fontSize: "11px",
												background: "#f3e8ff",
												color: "#7e22ce"
											},
											children: assignTeam.department || "Squad"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "modal-subtitle-text",
									children: "Assign employees to this squad. Squad members will sync team lead & manager reporting lines."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: () => setAssignTeam(null),
								"aria-label": "Close modal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							style: {
								gap: "14px",
								maxHeight: "68vh",
								overflowY: "auto"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(3, 1fr)",
										gap: "10px",
										background: "#f8fafc",
										padding: "12px",
										borderRadius: "8px",
										border: "1px solid #e2e8f0"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												textTransform: "uppercase",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Squad Members"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												fontSize: "18px",
												fontWeight: 700,
												color: "#7e22ce"
											},
											children: [
												assignTeamSelectedIds.size,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "12px",
														fontWeight: 500,
														color: "var(--ink)"
													},
													children: "Assigned"
												})
											]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												textTransform: "uppercase",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Team Lead"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "12px",
												fontWeight: 600,
												color: "var(--ink)",
												marginTop: "4px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap"
											},
											children: assignTeam.teamLeadName || "Unassigned"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												textTransform: "uppercase",
												color: "var(--muted)",
												fontWeight: 600
											},
											children: "Manager"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												fontSize: "12px",
												fontWeight: 600,
												color: "var(--ink)",
												marginTop: "4px",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap"
											},
											children: assignTeam.managerName || "Unassigned"
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "8px",
										flexWrap: "wrap",
										alignItems: "center"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "input-group",
										style: {
											flex: 1,
											minWidth: "180px",
											margin: 0
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
											size: 14,
											className: "input-icon"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "ui-input",
											style: {
												paddingLeft: "32px",
												fontSize: "12.5px",
												height: "36px"
											},
											placeholder: "Search by name, ID, role, department...",
											value: assignTeamSearch,
											onChange: (e) => setAssignTeamSearch(e.target.value)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											display: "inline-flex",
											background: "#f1f5f9",
											borderRadius: "6px",
											padding: "2px"
										},
										children: [
											{
												key: "all",
												label: "All"
											},
											{
												key: "assigned",
												label: `In Squad (${assignTeamSelectedIds.size})`
											},
											{
												key: "unassigned",
												label: "Unassigned"
											}
										].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setAssignTeamFilter(f.key),
											style: {
												border: "none",
												background: assignTeamFilter === f.key ? "#fff" : "transparent",
												color: assignTeamFilter === f.key ? "#7e22ce" : "var(--muted)",
												fontWeight: assignTeamFilter === f.key ? 700 : 500,
												fontSize: "11px",
												padding: "5px 9px",
												borderRadius: "4px",
												cursor: "pointer",
												boxShadow: assignTeamFilter === f.key ? "0 1px 2px rgba(0,0,0,0.06)" : "none"
											},
											children: f.label
										}, f.key))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										fontSize: "11.5px",
										padding: "4px 2px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										style: { color: "var(--muted)" },
										children: [
											"Showing ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: filteredAssignTeamEmployees.length }),
											" matching employees"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "8px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "link-button",
												style: {
													fontSize: "11.5px",
													color: "#7e22ce"
												},
												onClick: handleSelectAllTeamUnassigned,
												children: "+ Add All Unassigned"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: { color: "#cbd5e1" },
												children: "|"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "link-button",
												style: {
													fontSize: "11.5px",
													color: "var(--muted)"
												},
												onClick: () => setAssignTeamSelectedIds(/* @__PURE__ */ new Set()),
												children: "Clear All"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										border: "1px solid #e2e8f0",
										borderRadius: "8px",
										maxHeight: "360px",
										overflowY: "auto"
									},
									children: filteredAssignTeamEmployees.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										style: {
											padding: "30px",
											textAlign: "center",
											color: "var(--muted)",
											fontSize: "12.5px"
										},
										children: "No employees match your search or filter."
									}) : filteredAssignTeamEmployees.map((emp) => {
										const empId = String(emp.id || emp._id);
										const isSelected = assignTeamSelectedIds.has(empId);
										const currentTeam = emp.team || emp.squad || "Unassigned";
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "10px",
												padding: "9px 12px",
												borderBottom: "1px solid #f1f5f9",
												cursor: "pointer",
												background: isSelected ? "#fbf8ff" : "#fff",
												transition: "background 0.15s"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: isSelected,
												onChange: () => toggleAssignTeamEmployee(empId),
												style: {
													accentColor: "#7e22ce",
													width: "15px",
													height: "15px"
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													flex: 1,
													minWidth: 0
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														display: "flex",
														alignItems: "center",
														gap: "6px"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
														style: {
															fontSize: "12.5px",
															color: isSelected ? "#7e22ce" : "var(--ink)"
														},
														children: emp.displayName || emp.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														style: {
															fontSize: "10.5px",
															color: "var(--muted)"
														},
														children: [
															"(",
															emp.employeeId || "N/A",
															")"
														]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														fontSize: "11px",
														color: "var(--muted)",
														display: "flex",
														gap: "8px",
														marginTop: "1px"
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: emp.designation || emp.role }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Dept: ", emp.department || "General"] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															style: { color: currentTeam === assignTeam.name ? "#7e22ce" : "#64748b" },
															children: ["Current: ", currentTeam]
														})
													]
												})]
											})]
										}, empId);
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							style: { justifyContent: "space-between" },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "12px",
									color: "var(--muted)"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: assignTeamSelectedIds.size }),
									" members will be in ",
									assignTeam.name
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									onClick: () => setAssignTeam(null),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									disabled: assignTeamSaving,
									onClick: handleSaveTeamAssignments,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }),
										" ",
										assignTeamSaving ? "Saving..." : `Save ${assignTeamSelectedIds.size} Members`
									]
								})]
							})]
						})
					]
				})
			}) }),
			addTeamModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setAddTeamModal(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "480px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								style: {
									background: "#f3e8ff",
									color: "#7e22ce"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { size: 20 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Create Team / Squad"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "modal-subtitle-text",
								children: "Configure operational squad name, reporting manager, and team leader"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setAddTeamModal(false),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateTeam,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Team Name *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Alpha / Hustlers / Falcons",
									value: teamFormName,
									onChange: (e) => setTeamFormName(e.target.value),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "select-control",
										value: teamFormDept,
										onChange: (e) => setTeamFormDept(e.target.value),
										required: true,
										children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: d.name,
											children: d.name
										}, d.id || d.name))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Reporting Manager"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "select-control",
										value: teamFormManagerId,
										onChange: (e) => setTeamFormManagerId(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "-- Select Manager --"
										}), availableManagers.map((m) => {
											const mId = m.id || m._id || m.employeeId;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: mId,
												children: [
													m.displayName || m.name,
													" (",
													m.designation,
													")"
												]
											}, mId);
										})]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Assigned Team Leader (TL)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select-control",
									value: teamFormLeadId,
									onChange: (e) => setTeamFormLeadId(e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "-- Select Team Leader --"
									}), availableLeads.map((tl) => {
										const tlId = tl.id || tl._id || tl.employeeId;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: tlId,
											children: [
												tl.displayName || tl.name,
												" (",
												tl.employeeId ? `${tl.employeeId} • ` : "",
												tl.designation || tl.role || "Employee",
												")"
											]
										}, tlId);
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Squad Description & Objective"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "text-input",
									placeholder: "Describe delivery goals, business scope, or project assignments...",
									value: teamFormDesc,
									onChange: (e) => setTeamFormDesc(e.target.value)
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setAddTeamModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: saving,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 14 }),
									" ",
									saving ? "Creating..." : "Create Team"
								]
							})]
						})]
					})]
				})
			}) }),
			editTeam && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				onClick: () => setEditTeam(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					style: { maxWidth: "480px" },
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "modal-header-premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-title-group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "modal-icon-badge",
								style: {
									background: "#f3e8ff",
									color: "#7e22ce"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { size: 18 })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "modal-title-text",
								children: "Edit Team / Squad"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "modal-subtitle-text",
								children: [
									editTeam.name,
									" (",
									editTeam.department,
									")"
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-button",
							onClick: () => setEditTeam(null),
							"aria-label": "Close modal",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 16 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleUpdateTeam,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-body-premium",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Team Name *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									value: editTeam.name || "",
									onChange: (e) => setEditTeam({
										...editTeam,
										name: e.target.value
									}),
									required: true
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "form-row-2col",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Department *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "select-control",
										value: editTeam.department || "",
										onChange: (e) => setEditTeam({
											...editTeam,
											department: e.target.value
										}),
										required: true,
										children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: d.name,
											children: d.name
										}, d.id || d.name))
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "form-label-premium",
										children: "Reporting Manager"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "select-control",
										value: editTeam.managerId || "",
										onChange: (e) => {
											const m = availableManagers.find((x) => String(x.id || x._id || x.employeeId) === String(e.target.value));
											setEditTeam({
												...editTeam,
												managerId: e.target.value,
												managerName: m ? m.displayName || m.name : editTeam.managerName
											});
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "-- Select Manager --"
										}), availableManagers.map((m) => {
											const mId = m.id || m._id || m.employeeId;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: mId,
												children: [
													m.displayName || m.name,
													" (",
													m.designation,
													")"
												]
											}, mId);
										})]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Team Leader (TL)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									className: "select-control",
									value: editTeam.teamLeadId || "",
									onChange: (e) => {
										const tl = availableLeads.find((x) => String(x.id || x._id || x.employeeId) === String(e.target.value));
										setEditTeam({
											...editTeam,
											teamLeadId: e.target.value,
											teamLeadName: tl ? tl.displayName || tl.name : editTeam.teamLeadName
										});
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "-- Select Team Leader --"
									}), availableLeads.map((tl) => {
										const tlId = tl.id || tl._id || tl.employeeId;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: tlId,
											children: [
												tl.displayName || tl.name,
												" (",
												tl.employeeId ? `${tl.employeeId} • ` : "",
												tl.designation || tl.role || "Employee",
												")"
											]
										}, tlId);
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px",
										padding: "10px 12px",
										background: "#faf9f5",
										borderRadius: "6px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										id: "team-verification-checkbox",
										checked: Boolean(editTeam.flaggedForVerification),
										onChange: (e) => setEditTeam({
											...editTeam,
											flaggedForVerification: e.target.checked
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "team-verification-checkbox",
										style: {
											fontSize: "12px",
											color: "var(--ink)",
											cursor: "pointer"
										},
										children: "Flag assignment for administrator verification / review before finalization"
									})]
								}),
								editTeam.flaggedForVerification && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Verification Note / Reason"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Proposed Team Leader flagged for admin confirmation",
									value: editTeam.verificationNote || "",
									onChange: (e) => setEditTeam({
										...editTeam,
										verificationNote: e.target.value
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "form-label-premium",
									children: "Squad Description & Objective"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									className: "text-input",
									value: editTeam.description || "",
									onChange: (e) => setEditTeam({
										...editTeam,
										description: e.target.value
									})
								})] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "modal-footer-premium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setEditTeam(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: saving,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 }),
									" ",
									saving ? "Saving..." : "Save Changes"
								]
							})]
						})]
					})]
				})
			}) })
		]
	});
}
function AdminSettingsModule({ user: propUser }) {
	const auth = useAuth();
	const user = propUser || auth?.user;
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [newSSID, setNewSSID] = (0, import_react.useState)("");
	const [newBSSID, setNewBSSID] = (0, import_react.useState)("");
	const [newSecurityType, setNewSecurityType] = (0, import_react.useState)("WPA2-Enterprise");
	const [wifiBranch, setWifiBranch] = (0, import_react.useState)(() => hrStore.getState().companySettings?.locations?.[0]?.name || "Office");
	const [branchName, setBranchName] = (0, import_react.useState)("");
	const [branchCity, setBranchCity] = (0, import_react.useState)("");
	const [branchLatitude, setBranchLatitude] = (0, import_react.useState)("");
	const [branchLongitude, setBranchLongitude] = (0, import_react.useState)("");
	const [branchRadius, setBranchRadius] = (0, import_react.useState)("50");
	const [holidayTitle, setHolidayTitle] = (0, import_react.useState)("");
	const [holidayDate, setHolidayDate] = (0, import_react.useState)("");
	const [detectingOfficeGps, setDetectingOfficeGps] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [myPublicIp, setMyPublicIp] = (0, import_react.useState)(null);
	const [ipLoading, setIpLoading] = (0, import_react.useState)(true);
	const [newIpLabel, setNewIpLabel] = (0, import_react.useState)("");
	const [manualIp, setManualIp] = (0, import_react.useState)("");
	const [activeConfigTab, setActiveConfigTab] = (0, import_react.useState)("all");
	const [editingCampus, setEditingCampus] = (0, import_react.useState)(null);
	const [editingName, setEditingName] = (0, import_react.useState)("");
	const [editingCity, setEditingCity] = (0, import_react.useState)("");
	const [editingRadius, setEditingRadius] = (0, import_react.useState)(50);
	const [editingLat, setEditingLat] = (0, import_react.useState)("");
	const [editingLng, setEditingLng] = (0, import_react.useState)("");
	const [editingWifiSSID, setEditingWifiSSID] = (0, import_react.useState)("");
	const [editingWifiBSSID, setEditingWifiBSSID] = (0, import_react.useState)("");
	const [detectingEditGps, setDetectingEditGps] = (0, import_react.useState)(false);
	const [campusSaving, setCampusSaving] = (0, import_react.useState)(false);
	const initialRules = storeState.companySettings?.attendanceRules || {};
	const [globalGeofenceRadius, setGlobalGeofenceRadius] = (0, import_react.useState)(initialRules.maxGeofenceRadiusMeters || 50);
	const [strictGeofenceRequired, setStrictGeofenceRequired] = (0, import_react.useState)(initialRules.strictGeofenceRequired ?? true);
	const [requireOfficeNetworkAndGps, setRequireOfficeNetworkAndGps] = (0, import_react.useState)(initialRules.requireOfficeNetworkAndGps ?? true);
	const [globalGeofenceSaving, setGlobalGeofenceSaving] = (0, import_react.useState)(false);
	const initialLeave = storeState.companySettings?.leavePolicies || {};
	const [casualQuota, setCasualQuota] = (0, import_react.useState)(initialLeave.casualQuota ?? 12);
	const [sickQuota, setSickQuota] = (0, import_react.useState)(initialLeave.sickQuota ?? 10);
	const [earnedQuota, setEarnedQuota] = (0, import_react.useState)(initialLeave.earnedQuota ?? 15);
	const [maxCarry, setMaxCarry] = (0, import_react.useState)(initialLeave.maxCarryForwardDays ?? 8);
	const [approvalWorkflow, setApprovalWorkflow] = (0, import_react.useState)(initialLeave.approvalWorkflow || "manager_hr");
	const [recalculating, setRecalculating] = (0, import_react.useState)(false);
	const initialShift = storeState.companySettings?.attendanceRules || {};
	const [shiftStartTime, setShiftStartTime] = (0, import_react.useState)(initialShift.workStartTime || "");
	const [shiftEndTime, setShiftEndTime] = (0, import_react.useState)(initialShift.workEndTime || "");
	const [shiftGracePeriod, setShiftGracePeriod] = (0, import_react.useState)(initialShift.gracePeriodMinutes ?? 30);
	const [lunchBreakAutoPause, setLunchBreakAutoPause] = (0, import_react.useState)(initialShift.lunchBreakAutoPause ?? true);
	const [lunchBreakStart, setLunchBreakStart] = (0, import_react.useState)(initialShift.lunchBreakStart || "13:30");
	const [lunchBreakEnd, setLunchBreakEnd] = (0, import_react.useState)(initialShift.lunchBreakEnd || "14:30");
	const [autoPunchOutEnabled, setAutoPunchOutEnabled] = (0, import_react.useState)(initialShift.autoPunchOutEnabled ?? true);
	const [autoPunchOutTime, setAutoPunchOutTime] = (0, import_react.useState)(initialShift.autoPunchOutTime || "21:30");
	const [geofenceAutoPunchOutEnabled, setGeofenceAutoPunchOutEnabled] = (0, import_react.useState)(initialShift.geofenceAutoPunchOutEnabled ?? true);
	const [geofenceGracePeriodMinutes, setGeofenceGracePeriodMinutes] = (0, import_react.useState)(initialShift.geofenceGracePeriodMinutes ?? 120);
	const [geofenceGpsAccuracyThresholdMeters, setGeofenceGpsAccuracyThresholdMeters] = (0, import_react.useState)(initialShift.geofenceGpsAccuracyThresholdMeters ?? 50);
	const [geofenceExitWarningEnabled, setGeofenceExitWarningEnabled] = (0, import_react.useState)(initialShift.geofenceExitWarningEnabled ?? true);
	const [offlineAutoPunchOutEnabled, setOfflineAutoPunchOutEnabled] = (0, import_react.useState)(initialShift.offlineAutoPunchOutEnabled ?? true);
	const [offlineGracePeriodMinutes, setOfflineGracePeriodMinutes] = (0, import_react.useState)(initialShift.offlineGracePeriodMinutes ?? 120);
	const [dailyCutoffWarningEnabled, setDailyCutoffWarningEnabled] = (0, import_react.useState)(initialShift.dailyCutoffWarningEnabled ?? true);
	const [dailyCutoffWarningMinutesBefore, setDailyCutoffWarningMinutesBefore] = (0, import_react.useState)(initialShift.dailyCutoffWarningMinutesBefore ?? 15);
	const [attendanceTimezone, setAttendanceTimezone] = (0, import_react.useState)(initialShift.timezone || "Asia/Kolkata");
	const [shiftSaving, setShiftSaving] = (0, import_react.useState)(false);
	const [executingAutoPunch, setExecutingAutoPunch] = (0, import_react.useState)(false);
	const [autoPunchFeedback, setAutoPunchFeedback] = (0, import_react.useState)(null);
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
	const [helpDeskSaving, setHelpDeskSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const lp = storeState.companySettings?.leavePolicies;
		if (lp) {
			if (lp.casualQuota !== void 0) setCasualQuota(lp.casualQuota);
			if (lp.sickQuota !== void 0) setSickQuota(lp.sickQuota);
			if (lp.earnedQuota !== void 0) setEarnedQuota(lp.earnedQuota);
			if (lp.maxCarryForwardDays !== void 0) setMaxCarry(lp.maxCarryForwardDays);
			if (lp.approvalWorkflow) setApprovalWorkflow(lp.approvalWorkflow);
		}
		const ar = storeState.companySettings?.attendanceRules;
		if (ar) {
			if (ar.workStartTime) setShiftStartTime(ar.workStartTime);
			if (ar.workEndTime) setShiftEndTime(ar.workEndTime);
			if (ar.gracePeriodMinutes !== void 0) setShiftGracePeriod(ar.gracePeriodMinutes);
			if (ar.maxGeofenceRadiusMeters !== void 0) setGlobalGeofenceRadius(ar.maxGeofenceRadiusMeters);
			if (ar.strictGeofenceRequired !== void 0) setStrictGeofenceRequired(ar.strictGeofenceRequired);
			if (ar.requireOfficeNetworkAndGps !== void 0) setRequireOfficeNetworkAndGps(ar.requireOfficeNetworkAndGps);
			if (ar.lunchBreakAutoPause !== void 0) setLunchBreakAutoPause(Boolean(ar.lunchBreakAutoPause));
			if (ar.lunchBreakStart) setLunchBreakStart(ar.lunchBreakStart);
			if (ar.lunchBreakEnd) setLunchBreakEnd(ar.lunchBreakEnd);
			if (ar.autoPunchOutEnabled !== void 0) setAutoPunchOutEnabled(Boolean(ar.autoPunchOutEnabled));
			if (ar.autoPunchOutTime) setAutoPunchOutTime(ar.autoPunchOutTime);
			if (ar.geofenceAutoPunchOutEnabled !== void 0) setGeofenceAutoPunchOutEnabled(Boolean(ar.geofenceAutoPunchOutEnabled));
			if (ar.geofenceGracePeriodMinutes !== void 0) setGeofenceGracePeriodMinutes(Number(ar.geofenceGracePeriodMinutes) || 120);
			if (ar.geofenceGpsAccuracyThresholdMeters !== void 0) setGeofenceGpsAccuracyThresholdMeters(Number(ar.geofenceGpsAccuracyThresholdMeters) || 50);
			if (ar.geofenceExitWarningEnabled !== void 0) setGeofenceExitWarningEnabled(Boolean(ar.geofenceExitWarningEnabled));
			if (ar.offlineAutoPunchOutEnabled !== void 0) setOfflineAutoPunchOutEnabled(Boolean(ar.offlineAutoPunchOutEnabled));
			if (ar.offlineGracePeriodMinutes !== void 0) setOfflineGracePeriodMinutes(Number(ar.offlineGracePeriodMinutes) || 120);
			if (ar.dailyCutoffWarningEnabled !== void 0) setDailyCutoffWarningEnabled(Boolean(ar.dailyCutoffWarningEnabled));
			if (ar.dailyCutoffWarningMinutesBefore !== void 0) setDailyCutoffWarningMinutesBefore(Number(ar.dailyCutoffWarningMinutesBefore) || 15);
			if (ar.timezone) setAttendanceTimezone(ar.timezone);
		}
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
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState({
			...state,
			companySettings: {
				...state.companySettings || {},
				locations: [...state.companySettings?.locations || []]
			},
			holidays: [...state.holidays || []]
		}));
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		setIpLoading(true);
		apiClient.get("/attendance/config").then((result) => {
			if (active) setMyPublicIp(result.data.clientIp);
		}).catch((error) => {
			if (active) setNotice(error.message);
		}).finally(() => {
			if (active) setIpLoading(false);
		});
		return () => {
			active = false;
		};
	}, []);
	const settings = storeState.companySettings || {};
	const rawWifiList = settings.allowedWifiSSIDs || [];
	const wifiList = [...new Set(rawWifiList.map((s) => /airtel|dji|3052/i.test(s) ? "Edufyi" : s))].filter(Boolean);
	const wifiNetworks = (settings.wifiNetworks || []).map((n) => ({
		...n,
		ssid: /airtel|dji|3052/i.test(n.ssid || "") ? "Edufyi" : n.ssid
	}));
	const locations = settings.locations || [];
	storeState.holidays;
	const officeNetworkIPs = (settings.officeNetworkIPs || []).map((entry) => ({
		...entry,
		label: /airtel|dji|3052/i.test(entry.label || "") ? "Edufyi (IGNITE CAMPUS)" : entry.label
	}));
	async function handleRefreshMyIP() {
		setIpLoading(true);
		const result = await apiClient.get("/attendance/config");
		setMyPublicIp(result.data.clientIp);
		setIpLoading(false);
	}
	const handleDeleteBranch = (loc) => {
		const locId = loc.id || loc._id || loc.name;
		hrStore.removeBranchLocation(locId);
		setStoreState((prev) => ({
			...prev,
			companySettings: {
				...prev.companySettings || {},
				locations: (prev.companySettings?.locations || []).filter((l) => l.id !== locId && l._id !== locId && l.name !== locId)
			}
		}));
		setNotice(`Removed branch location "${loc.name}"!`);
		setTimeout(() => setNotice(""), 3500);
	};
	const mySubnet = (0, import_react.useMemo)(() => {
		if (!myPublicIp) return null;
		const clean = myPublicIp.replace(/^::ffff:/, "").trim();
		if (clean.includes(".")) {
			const parts = clean.split(".");
			if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
		}
		if (clean.includes(":")) {
			const parts = clean.split(":").filter(Boolean);
			if (parts.length >= 4) return `${parts.slice(0, 4).join(":")}::/64`;
		}
		return null;
	}, [myPublicIp]);
	const handleRegisterSubnet = storeAction(async () => {
		if (!mySubnet) return;
		const ok = await hrStore.addOfficeNetworkIP(mySubnet, newIpLabel.trim() || "Office Wi-Fi Subnet", "Admin");
		setNotice(ok ? `Registered office Wi-Fi subnet (${mySubnet})! All devices connected to this router will authenticate automatically.` : `This subnet (${mySubnet}) is already registered.`);
		setNewIpLabel("");
		setTimeout(() => setNotice(""), 5e3);
	});
	const handleRegisterCurrentIP = storeAction(async () => {
		if (!myPublicIp) {
			setNotice("Could not detect your public IP. Check your internet connection and try “Re-check”.");
			setTimeout(() => setNotice(""), 4500);
			return;
		}
		const ok = await hrStore.addOfficeNetworkIP(myPublicIp, newIpLabel.trim() || "Office Network", "Admin");
		setNotice(ok ? `Registered this network (${myPublicIp}). Under strict policy, employees also need accurate GPS inside a configured office geofence.` : `This network (${myPublicIp}) is already registered as an office network.`);
		setNewIpLabel("");
		setTimeout(() => setNotice(""), 5e3);
	});
	const handleRegisterManualIP = storeAction(async (e) => {
		e?.preventDefault?.();
		let cleanIp = manualIp.trim();
		if (!cleanIp) return;
		if (/\.\*$/.test(cleanIp) || /\.x$/i.test(cleanIp)) cleanIp = cleanIp.replace(/(\.[\*x])$/i, ".0/24");
		const ok = await hrStore.addOfficeNetworkIP(cleanIp, newIpLabel.trim() || "Office Gateway", "Admin");
		setNotice(ok ? `Registered office network IP/Subnet (${cleanIp}) successfully.` : `Network IP (${cleanIp}) is already registered.`);
		setManualIp("");
		setNewIpLabel("");
		setTimeout(() => setNotice(""), 5e3);
	});
	const handleAddWifi = storeAction(async (e) => {
		e.preventDefault();
		const bssid = newBSSID.trim().toUpperCase();
		if (bssid && !/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(bssid)) {
			setNotice("Enter a valid router BSSID (MAC address) in the format AA:BB:CC:DD:EE:FF or leave empty.");
			setTimeout(() => setNotice(""), 5e3);
			return;
		}
		await hrStore.addWifiSSID(newSSID.trim(), wifiBranch, "Admin", {
			bssid: bssid || null,
			securityType: newSecurityType
		});
		setNotice(`Saved Wi-Fi "${newSSID.trim()}" for branch ${wifiBranch}.`);
		setNewSSID("");
		setNewBSSID("");
		setTimeout(() => setNotice(""), 4500);
	});
	const handleAddBranch = storeAction(async (e) => {
		e.preventDefault();
		if (!branchName.trim() || !branchCity.trim()) return;
		if (branchLatitude === "" || branchLongitude === "" || !Number.isFinite(Number(branchLatitude)) || !Number.isFinite(Number(branchLongitude))) throw new Error("Enter the actual office latitude and longitude.");
		const radiusNum = Number(branchRadius) || 50;
		await hrStore.addBranchLocation({
			name: branchName.trim(),
			city: branchCity.trim(),
			lat: Number(branchLatitude),
			lng: Number(branchLongitude),
			radiusMeters: radiusNum
		});
		setBranchName("");
		setBranchCity("");
		setBranchLatitude("");
		setBranchLongitude("");
		setBranchRadius("50");
		setNotice(`✓ Added office campus "${branchName.trim()}" with ${radiusNum}m geofence radius!`);
		setTimeout(() => setNotice(""), 4500);
	});
	const handleStartEditCampus = (loc) => {
		setEditingCampus(loc);
		setEditingName(loc.name || "");
		setEditingCity(loc.city || "");
		setEditingRadius(loc.radiusMeters || 50);
		setEditingLat(loc.lat !== void 0 && loc.lat !== null ? String(loc.lat) : "");
		setEditingLng(loc.lng !== void 0 && loc.lng !== null ? String(loc.lng) : "");
		setEditingWifiSSID("");
		setEditingWifiBSSID("");
	};
	const handleSaveCampusEdit = async (e) => {
		e.preventDefault();
		if (!editingCampus) return;
		const latNum = Number(editingLat);
		const lngNum = Number(editingLng);
		const radiusNum = Number(editingRadius) || 50;
		if (editingLat !== "" && editingLng !== "" && (!Number.isFinite(latNum) || !Number.isFinite(lngNum))) {
			setNotice("✕ Please enter valid decimal numbers for latitude and longitude.");
			setTimeout(() => setNotice(""), 4500);
			return;
		}
		setCampusSaving(true);
		try {
			const campusId = editingCampus.id || editingCampus._id || editingCampus.name;
			const updates = {
				name: editingName.trim() || editingCampus.name,
				city: editingCity.trim() || editingCampus.city,
				radiusMeters: radiusNum,
				lat: Number.isFinite(latNum) ? latNum : editingCampus.lat,
				lng: Number.isFinite(lngNum) ? lngNum : editingCampus.lng
			};
			await hrStore.updateBranchLocation(campusId, updates);
			if (editingWifiSSID.trim()) {
				const bssid = editingWifiBSSID.trim().toUpperCase();
				await hrStore.addWifiSSID(editingWifiSSID.trim(), updates.name, "Admin", {
					bssid: bssid || null,
					securityType: "WPA2-Enterprise"
				});
			}
			setNotice(`✓ Updated campus "${updates.name}"! Geofence radius: ${radiusNum}m, Coordinates: ${updates.lat}, ${updates.lng}.`);
			setTimeout(() => setNotice(""), 5500);
			setEditingCampus(null);
		} catch (err) {
			setNotice(`✕ Failed to update campus: ${err.message || "Please try again."}`);
			setTimeout(() => setNotice(""), 5500);
		} finally {
			setCampusSaving(false);
		}
	};
	const handleDetectEditCoords = () => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setNotice("✕ Geolocation not supported by this browser.");
			setTimeout(() => setNotice(""), 4e3);
			return;
		}
		setDetectingEditGps(true);
		navigator.geolocation.getCurrentPosition((pos) => {
			setEditingLat(pos.coords.latitude.toFixed(6));
			setEditingLng(pos.coords.longitude.toFixed(6));
			setDetectingEditGps(false);
			setNotice(`📍 Captured live coordinates: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
			setTimeout(() => setNotice(""), 4e3);
		}, (err) => {
			setDetectingEditGps(false);
			setNotice(`✕ Could not get location: ${err.message}`);
			setTimeout(() => setNotice(""), 4500);
		}, {
			enableHighAccuracy: true,
			timeout: 8e3
		});
	};
	const handleSaveGlobalGeofence = async (e) => {
		e.preventDefault();
		setGlobalGeofenceSaving(true);
		try {
			await hrStore.updateCompanySettings({ attendanceRules: {
				maxGeofenceRadiusMeters: Number(globalGeofenceRadius) || 50,
				strictGeofenceRequired: Boolean(strictGeofenceRequired),
				requireOfficeNetworkAndGps: Boolean(requireOfficeNetworkAndGps)
			} });
			setNotice(`✓ Global geofence rules saved! Standard radius: ${globalGeofenceRadius}m, Strict: ${strictGeofenceRequired ? "ON" : "OFF"}`);
			setTimeout(() => setNotice(""), 5e3);
		} catch (err) {
			setNotice(`✕ Failed to save geofence rules: ${err.message}`);
			setTimeout(() => setNotice(""), 5e3);
		} finally {
			setGlobalGeofenceSaving(false);
		}
	};
	const handleAutoDetectOfficeCoords = () => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setNotice("Geolocation not supported by this browser.");
			return;
		}
		setDetectingOfficeGps(true);
		navigator.geolocation.getCurrentPosition((pos) => {
			setBranchLatitude(pos.coords.latitude.toFixed(6));
			setBranchLongitude(pos.coords.longitude.toFixed(6));
			setDetectingOfficeGps(false);
			setNotice(`Captured location: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
			setTimeout(() => setNotice(""), 4e3);
		}, (err) => {
			setDetectingOfficeGps(false);
			setNotice(`Could not get location: ${err.message}`);
			setTimeout(() => setNotice(""), 4500);
		}, {
			enableHighAccuracy: true,
			timeout: 8e3
		});
	};
	const handleSavePolicies = async (e) => {
		e.preventDefault();
		try {
			await hrStore.updateCompanySettings({ leavePolicies: {
				casualQuota: Number(casualQuota),
				sickQuota: Number(sickQuota),
				earnedQuota: Number(earnedQuota),
				maxCarryForwardDays: Number(maxCarry),
				approvalWorkflow,
				requireManagerApproval: approvalWorkflow === "manager" || approvalWorkflow === "manager_hr",
				requireHrApproval: approvalWorkflow === "hr" || approvalWorkflow === "manager_hr"
			} });
			try {
				await hrStore.recalculateTodayAttendance();
			} catch (recalcErr) {
				console.warn("[LeavePoliciesSave] Recalculate notice:", recalcErr?.message || recalcErr);
			}
			setNotice(`✓ Saved policies! Annual leave quotas and approval rules updated.`);
			setTimeout(() => setNotice(""), 5500);
		} catch (err) {
			setNotice(`✕ Failed to save settings: ${err.message || "Please check your connection and try again."}`);
			setTimeout(() => setNotice(""), 6e3);
		}
	};
	const handleRecalculateAttendance = async () => {
		setRecalculating(true);
		try {
			const res = await hrStore.recalculateTodayAttendance();
			const count = res?.updatedCount ?? res?.count ?? 0;
			setNotice(`⚡ Recalculated today's presence roster! Verified ${count} attendance records. All records marked on-time with zero late penalties.`);
			setTimeout(() => setNotice(""), 6e3);
		} catch (err) {
			setNotice(`✕ Recalculation failed: ${err.message || "Unknown error"}`);
			setTimeout(() => setNotice(""), 6e3);
		} finally {
			setRecalculating(false);
		}
	};
	const handleSaveShiftSettings = async (e) => {
		e.preventDefault();
		if (!shiftStartTime || !shiftEndTime) {
			setNotice("✕ Please set both Work Start Time and Work End Time.");
			setTimeout(() => setNotice(""), 5e3);
			return;
		}
		setShiftSaving(true);
		try {
			await hrStore.updateCompanySettings({ attendanceRules: {
				workStartTime: shiftStartTime,
				workEndTime: shiftEndTime,
				gracePeriodMinutes: Number(shiftGracePeriod) || 0,
				lunchBreakAutoPause: Boolean(lunchBreakAutoPause),
				lunchBreakStart: lunchBreakStart || "13:30",
				lunchBreakEnd: lunchBreakEnd || "14:30",
				autoPunchOutEnabled: Boolean(autoPunchOutEnabled),
				autoPunchOutTime: autoPunchOutTime || "21:30",
				geofenceAutoPunchOutEnabled: Boolean(geofenceAutoPunchOutEnabled),
				geofenceGracePeriodMinutes: Number(geofenceGracePeriodMinutes) || 120,
				geofenceGpsAccuracyThresholdMeters: Number(geofenceGpsAccuracyThresholdMeters) || 50,
				geofenceExitWarningEnabled: Boolean(geofenceExitWarningEnabled),
				offlineAutoPunchOutEnabled: Boolean(offlineAutoPunchOutEnabled),
				offlineGracePeriodMinutes: Number(offlineGracePeriodMinutes) || 120,
				dailyCutoffAutoPunchOutEnabled: Boolean(autoPunchOutEnabled),
				dailyCutoffTime: autoPunchOutTime || "21:30",
				dailyCutoffWarningEnabled: Boolean(dailyCutoffWarningEnabled),
				dailyCutoffWarningMinutesBefore: Number(dailyCutoffWarningMinutesBefore) || 15,
				timezone: attendanceTimezone || "Asia/Kolkata"
			} });
			try {
				await hrStore.recalculateTodayAttendance();
			} catch (recalcErr) {
				console.warn("[ShiftSave] Background recalculate notification:", recalcErr?.message || recalcErr);
			}
			setNotice(`✓ Shift timings saved! Work hours: ${shiftStartTime} – ${shiftEndTime}, Grace: ${shiftGracePeriod} min. Today's attendance updated.`);
			setTimeout(() => setNotice(""), 6e3);
		} catch (err) {
			setNotice(`✕ Failed to save shift settings: ${err.message || "Please try again."}`);
			setTimeout(() => setNotice(""), 6e3);
		} finally {
			setShiftSaving(false);
		}
	};
	const handleSaveHelpDeskSettings = async (e) => {
		e.preventDefault();
		setHelpDeskSaving(true);
		try {
			await hrStore.updateCompanySettings({ helpDeskSettings: {
				itSupportEmail: itSupportEmail.trim(),
				itSupportEmployeeId,
				itSupportEmployeeName,
				itSupportEmployeeEmail,
				generalSupportEmail: generalSupportEmail.trim(),
				generalSupportEmployeeId,
				generalSupportEmployeeName,
				generalSupportEmployeeEmail,
				supportEmail: generalSupportEmail.trim(),
				defaultPriority,
				autoAssignToManager: Boolean(autoAssignToManager),
				emailNotificationsEnabled: Boolean(emailNotificationsEnabled)
			} });
			setNotice(`✓ Dedicated support team & email routing saved!`);
			setTimeout(() => setNotice(""), 5500);
		} catch (err) {
			setNotice(`✕ Failed to save help desk settings: ${err.message || "Please try again."}`);
			setTimeout(() => setNotice(""), 6e3);
		} finally {
			setHelpDeskSaving(false);
		}
	};
	workspaceAction(hrStore, async (e) => {
		e.preventDefault();
		if (!holidayTitle.trim() || !holidayDate) return;
		await hrStore.addHoliday({
			title: holidayTitle.trim(),
			date: holidayDate
		});
		setHolidayTitle("");
		setHolidayDate("");
		setNotice("Added official holiday to calendar!");
		setTimeout(() => setNotice(""), 3500);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Organization Parameters",
				title: "Company Settings & Policies",
				description: "Configure verified corporate Wi-Fi SSIDs, global office branches, official holiday schedules, and shift rules."
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "10px 14px",
					background: notice.startsWith("✕") ? "#fee2e2" : "#eaf4f1",
					color: notice.startsWith("✕") ? "#b91c1c" : "var(--teal)",
					border: notice.startsWith("✕") ? "1px solid #fca5a5" : "1px solid #c7ded7",
					borderRadius: "8px",
					fontSize: "12px",
					fontWeight: 600
				},
				children: [notice.startsWith("✕") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					size: 13,
					style: {
						display: "inline",
						marginRight: "6px"
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
					size: 13,
					style: {
						display: "inline",
						marginRight: "6px"
					}
				}), notice]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					gap: "8px",
					overflowX: "auto",
					paddingBottom: "4px",
					borderBottom: "2px solid var(--line, #e2e8f0)",
					marginBottom: "16px"
				},
				children: [
					{
						id: "all",
						label: "All Settings",
						icon: Globe
					},
					{
						id: "campuses",
						label: `Campuses & Geofencing (${locations.length})`,
						icon: MapPin
					},
					{
						id: "networks",
						label: `Office Networks & Wi-Fi (${wifiList.length})`,
						icon: Wifi
					},
					{
						id: "shifts",
						label: "Shift Timings & Grace",
						icon: Clock
					},
					{
						id: "helpdesk",
						label: "Help Desk Routing",
						icon: Mail
					},
					{
						id: "policies",
						label: "Leave Quotas & Holidays",
						icon: Calendar
					}
				].map((tab) => {
					const Icon = tab.icon;
					const isActive = activeConfigTab === tab.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setActiveConfigTab(tab.id),
						style: {
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							padding: "10px 18px",
							fontSize: "13px",
							fontWeight: isActive ? 700 : 500,
							borderRadius: "8px 8px 0 0",
							border: "none",
							borderBottom: isActive ? "3px solid var(--teal, #006e6f)" : "3px solid transparent",
							backgroundColor: isActive ? "rgba(0, 110, 111, 0.08)" : "transparent",
							color: isActive ? "var(--teal, #006e6f)" : "var(--muted, #586D72)",
							cursor: "pointer",
							whiteSpace: "nowrap",
							transition: "all 0.15s ease"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 15 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })]
					}, tab.id);
				})
			}),
			(activeConfigTab === "all" || activeConfigTab === "campuses") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { borderLeft: "4px solid #0d9488" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Geofence & Centers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							"Office Campuses & Geofence Centers (",
							locations.length,
							")"
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: locations.length ? "success" : "warning",
							children: locations.length ? `${locations.length} Active Campuses` : "No Campus"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							margin: "8px 0 16px"
						},
						children: "Manage separate geofence perimeters, GPS coordinates, and assigned Wi-Fi routers for each office campus. When employees punch in, their GPS distance is verified against their campus radius."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f0fdfa",
							border: "1px solid #99f6e4",
							borderRadius: "10px",
							padding: "16px",
							marginBottom: "20px"
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
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
									size: 18,
									color: "#0d9488"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "13.5px",
										color: "#134e4a"
									},
									children: "Global Geofence & Boundary Policy"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "11px",
									background: "#ccfbf1",
									color: "#115e59",
									padding: "2px 8px",
									borderRadius: "12px",
									fontWeight: 600
								},
								children: [
									"Default: ",
									globalGeofenceRadius,
									"m Radius"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleSaveGlobalGeofence,
							style: {
								display: "grid",
								gap: "14px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
									gap: "14px",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "11.5px",
											fontWeight: 600,
											display: "block",
											color: "var(--ink)",
											marginBottom: "4px"
										},
										children: "Default Fallback Radius (meters):"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "8px",
											alignItems: "center"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "1",
											max: "1000",
											value: globalGeofenceRadius,
											onChange: (e) => setGlobalGeofenceRadius(e.target.value),
											className: "text-input",
											style: {
												width: "110px",
												padding: "6px 10px",
												fontSize: "13px",
												fontWeight: 600
											},
											required: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												display: "flex",
												gap: "4px"
											},
											children: [
												30,
												50,
												100,
												200
											].map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setGlobalGeofenceRadius(preset),
												style: {
													padding: "4px 8px",
													fontSize: "11px",
													borderRadius: "6px",
													border: "1px solid #99f6e4",
													background: Number(globalGeofenceRadius) === preset ? "#0d9488" : "#fff",
													color: Number(globalGeofenceRadius) === preset ? "#fff" : "#0d9488",
													cursor: "pointer",
													fontWeight: 600
												},
												children: [preset, "m"]
											}, preset))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											marginTop: "4px",
											display: "block"
										},
										children: "Applies to any branch that does not specify an individual radius override."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gap: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px",
											fontSize: "12px",
											cursor: "pointer"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: strictGeofenceRequired,
											onChange: (e) => setStrictGeofenceRequired(e.target.checked),
											style: { cursor: "pointer" }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Strict Geofence Enforcement:" }), " Reject punch-ins if employee is outside geofence"] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											display: "flex",
											alignItems: "center",
											gap: "8px",
											fontSize: "12px",
											cursor: "pointer"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: requireOfficeNetworkAndGps,
											onChange: (e) => setRequireOfficeNetworkAndGps(e.target.checked),
											style: { cursor: "pointer" }
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Dual Verification:" }), " Require Office Network IP + GPS for on-site presence"] })]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									disabled: globalGeofenceSaving,
									style: {
										height: "34px",
										fontSize: "12px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }),
										" ",
										globalGeofenceSaving ? "Saving Policy..." : "Save Global Geofence Policy"
									]
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: { marginBottom: "20px" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "10px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
								style: {
									fontSize: "13px",
									color: "var(--ink)"
								},
								children: [
									"Configured Campus Centers (",
									locations.length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									fontSize: "11px",
									color: "var(--muted)"
								},
								children: "Click \"Configure Campus\" to edit radius, GPS coordinates, or Wi-Fi"
							})]
						}), locations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								padding: "20px",
								textAlign: "center",
								background: "#faf9f5",
								border: "1px solid var(--line)",
								borderRadius: "8px",
								color: "var(--muted)",
								fontSize: "12.5px"
							},
							children: "No office campuses configured yet. Add your main office campus below."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
								gap: "12px"
							},
							children: locations.map((loc) => {
								const linkedWifis = wifiNetworks.filter((w) => w.branchName === loc.name);
								const radius = loc.radiusMeters || globalGeofenceRadius || 50;
								const hasCoords = loc.lat !== void 0 && loc.lat !== null && loc.lng !== void 0 && loc.lng !== null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: "#ffffff",
										border: "1.5px solid #e2e8f0",
										borderRadius: "10px",
										padding: "14px 16px",
										display: "flex",
										flexDirection: "column",
										justifyContent: "space-between",
										gap: "12px",
										boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "flex-start",
												gap: "8px",
												marginBottom: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, {
													size: 16,
													color: "var(--teal)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													style: {
														fontSize: "14px",
														color: "var(--ink)"
													},
													children: loc.name
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "11px",
													color: "var(--muted)",
													marginLeft: "22px"
												},
												children: loc.city || "Office Center"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													fontSize: "11px",
													fontWeight: 700,
													padding: "2px 8px",
													borderRadius: "12px",
													background: "#ecfdf5",
													color: "#065f46",
													border: "1px solid #a7f3d0",
													whiteSpace: "nowrap"
												},
												children: [
													"📍 ",
													radius,
													"m Radius"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												background: "#f8fafc",
												border: "1px solid #f1f5f9",
												borderRadius: "8px",
												padding: "8px 10px",
												marginTop: "8px",
												fontSize: "11px",
												display: "grid",
												gap: "4px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													style: {
														color: "var(--muted)",
														display: "flex",
														alignItems: "center",
														gap: "4px"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
														size: 11,
														color: "#0d9488"
													}), " GPS Center:"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontFamily: "monospace",
														fontWeight: 600,
														color: "var(--ink)"
													},
													children: hasCoords ? `${Number(loc.lat).toFixed(6)}, ${Number(loc.lng).toFixed(6)}` : "⚠ No coordinates set"
												})]
											}), hasCoords && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: { textAlign: "right" },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
													href: `https://www.google.com/maps?q=${loc.lat},${loc.lng}`,
													target: "_blank",
													rel: "noreferrer",
													style: {
														fontSize: "10.5px",
														color: "var(--teal)",
														textDecoration: "none",
														fontWeight: 600,
														display: "inline-flex",
														alignItems: "center",
														gap: "3px"
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View on Map" }),
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 10 })
													]
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												marginTop: "8px",
												fontSize: "11px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												style: {
													color: "var(--muted)",
													fontSize: "10.5px",
													display: "flex",
													alignItems: "center",
													gap: "4px",
													marginBottom: "4px"
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
														size: 11,
														color: "var(--teal)"
													}),
													" Linked Wi-Fi Routers (",
													linkedWifis.length,
													"):"
												]
											}), linkedWifis.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												style: {
													display: "flex",
													flexWrap: "wrap",
													gap: "4px"
												},
												children: linkedWifis.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10px",
														background: "#e0f2fe",
														color: "#0369a1",
														padding: "2px 6px",
														borderRadius: "4px",
														fontFamily: "monospace",
														border: "1px solid #bae6fd"
													},
													children: w.ssid
												}, w.ssid))
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													color: "var(--muted)",
													fontSize: "10px",
													fontStyle: "italic"
												},
												children: "No dedicated Wi-Fi router linked yet"
											})]
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "8px",
											borderTop: "1px solid #f1f5f9",
											paddingTop: "10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => handleStartEditCampus(loc),
											style: {
												flex: 1,
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												gap: "6px",
												padding: "6px 12px",
												fontSize: "11.5px",
												fontWeight: 600,
												borderRadius: "6px",
												border: "1px solid #cbd5e1",
												background: "#f8fafc",
												color: "var(--ink)",
												cursor: "pointer"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, {
												size: 12,
												color: "var(--teal)"
											}), " Configure Campus & Geofence"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => handleDeleteBranch(loc),
											title: "Remove Campus",
											style: {
												padding: "6px 10px",
												borderRadius: "6px",
												border: "1px solid #fecaca",
												background: "#fef2f2",
												color: "#dc2626",
												cursor: "pointer"
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 })
										})]
									})]
								}, loc.id || loc._id || loc.name);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							background: "#f8fafc",
							border: "1px solid #e2e8f0",
							borderRadius: "10px",
							padding: "16px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
							style: {
								fontSize: "13px",
								display: "flex",
								alignItems: "center",
								gap: "6px",
								marginBottom: "12px",
								color: "var(--ink)"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								size: 14,
								color: "var(--teal)"
							}), " Add New Office Campus & Geofence Center"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleAddBranch,
							style: {
								display: "grid",
								gap: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
									gap: "10px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											display: "block",
											marginBottom: "3px"
										},
										children: "Campus / Branch Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										className: "text-input",
										placeholder: "e.g. IGNITE CAMPUS or Bengaluru Tech Park",
										value: branchName,
										onChange: (e) => setBranchName(e.target.value),
										style: {
											width: "100%",
											padding: "7px 10px",
											fontSize: "12px",
											background: "#fff"
										},
										required: true
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											display: "block",
											marginBottom: "3px"
										},
										children: "City / Region"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										className: "text-input",
										placeholder: "e.g. Bengaluru",
										value: branchCity,
										onChange: (e) => setBranchCity(e.target.value),
										style: {
											width: "100%",
											padding: "7px 10px",
											fontSize: "12px",
											background: "#fff"
										},
										required: true
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											display: "block",
											marginBottom: "3px"
										},
										children: "Geofence Radius (meters)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "6px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "1",
											max: "1000",
											className: "text-input",
											placeholder: "e.g. 50",
											value: branchRadius,
											onChange: (e) => setBranchRadius(e.target.value),
											style: {
												width: "80px",
												padding: "7px 10px",
												fontSize: "12px",
												background: "#fff",
												fontWeight: 600
											},
											required: true
										}), [
											30,
											50,
											100,
											200
										].map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setBranchRadius(String(preset)),
											style: {
												padding: "3px 6px",
												fontSize: "10px",
												borderRadius: "4px",
												border: "1px solid #cbd5e1",
												background: branchRadius === String(preset) ? "var(--teal)" : "#fff",
												color: branchRadius === String(preset) ? "#fff" : "var(--ink)",
												cursor: "pointer",
												fontWeight: 600
											},
											children: [preset, "m"]
										}, preset))]
									})] })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr auto auto",
									gap: "10px",
									alignItems: "flex-end"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											display: "block",
											marginBottom: "3px"
										},
										children: "Latitude"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										"aria-label": "Office latitude",
										placeholder: "e.g. 12.909980",
										min: "-90",
										max: "90",
										step: "any",
										required: true,
										value: branchLatitude,
										onChange: (event) => setBranchLatitude(event.target.value),
										style: {
											width: "100%",
											padding: "7px 10px",
											fontSize: "12px",
											background: "#fff"
										}
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											display: "block",
											marginBottom: "3px"
										},
										children: "Longitude"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										"aria-label": "Office longitude",
										placeholder: "e.g. 77.651740",
										min: "-180",
										max: "180",
										step: "any",
										required: true,
										value: branchLongitude,
										onChange: (event) => setBranchLongitude(event.target.value),
										style: {
											width: "100%",
											padding: "7px 10px",
											fontSize: "12px",
											background: "#fff"
										}
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button secondary",
										onClick: handleAutoDetectOfficeCoords,
										disabled: detectingOfficeGps,
										title: "Detect current location and autofill latitude and longitude",
										style: {
											height: "36px",
											fontSize: "11px",
											display: "flex",
											alignItems: "center",
											gap: "4px",
											whiteSpace: "nowrap"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 12 }),
											" ",
											detectingOfficeGps ? "Detecting…" : "Use My GPS"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "submit",
										style: {
											height: "36px",
											whiteSpace: "nowrap"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }), " Add Campus"]
									})
								]
							})]
						})]
					})
				]
			}),
			(activeConfigTab === "all" || activeConfigTab === "networks") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Geofencing & Network"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							"Office Network Verification (",
							officeNetworkIPs.length,
							")"
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: officeNetworkIPs.length ? "success" : "warning",
							children: officeNetworkIPs.length ? "Live" : "Not configured"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							margin: "8px 0 14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Understanding Office Wi-Fi & Gateway IPs:" }),
							" On any local office Wi-Fi router, each device (phones, laptops, tablets) receives a unique device IP where only the last digits differ (e.g. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "192.168.1.15" }),
							" vs ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "192.168.1.18" }),
							"), but all share the exact same ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "gateway subnet (/24)" }),
							". Registering your office Wi-Fi subnet (e.g. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "192.168.1.0/24" }),
							") or exact IP authorizes all employees connected to this router."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
							gap: "12px",
							marginBottom: "16px"
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								alignItems: "flex-end",
								gap: "10px",
								background: "#f5f8f7",
								border: "1px solid rgba(29, 138, 122, 0.25)",
								borderRadius: "8px",
								padding: "12px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gap: "3px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											style: {
												fontSize: "10px",
												fontWeight: 700,
												color: "var(--muted)"
											},
											children: "CURRENT DEVICE IP"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontFamily: "monospace",
												fontSize: "14px"
											},
											children: ipLoading ? "Detecting…" : myPublicIp || "Unavailable"
										}),
										mySubnet && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "10px",
												color: "var(--teal)",
												fontWeight: 600
											},
											children: ["Gateway Subnet: ", mySubnet]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: handleRefreshMyIP,
									disabled: ipLoading,
									style: {
										height: "34px",
										fontSize: "11px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
										size: 12,
										className: ipLoading ? "animate-spin" : ""
									}), " Re-check"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gap: "3px",
										flex: 1,
										minWidth: "130px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										style: {
											fontSize: "10px",
											fontWeight: 700,
											color: "var(--muted)"
										},
										children: "LABEL"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: newIpLabel,
										onChange: (e) => setNewIpLabel(e.target.value),
										placeholder: "e.g. Office Gateway Subnet",
										style: {
											padding: "6px 8px",
											fontSize: "11px",
											borderRadius: "6px",
											border: "1px solid var(--line)",
											background: "#fff"
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										gap: "6px",
										flexWrap: "wrap"
									},
									children: [mySubnet && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "ui-button primary",
										onClick: handleRegisterSubnet,
										disabled: ipLoading || !mySubnet,
										title: "Authorizes all phones, laptops, and devices on this Wi-Fi router (recommended)",
										style: {
											height: "34px",
											fontSize: "11px"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 12 }),
											" Register Wi-Fi Subnet (",
											mySubnet,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "ui-button secondary",
										onClick: handleRegisterCurrentIP,
										disabled: ipLoading || !myPublicIp,
										title: "Authorizes this exact IP address",
										style: {
											height: "34px",
											fontSize: "11px"
										},
										children: "Register Exact IP"
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleRegisterManualIP,
							style: {
								display: "flex",
								flexWrap: "wrap",
								alignItems: "flex-end",
								gap: "10px",
								background: "#faf9f5",
								border: "1px solid var(--line)",
								borderRadius: "8px",
								padding: "12px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gap: "3px",
									flex: 1,
									minWidth: "150px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "10px",
										fontWeight: 700,
										color: "var(--muted)"
									},
									children: "MANUAL OFFICE IP / CIDR / WILDCARD"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: manualIp,
									onChange: (e) => setManualIp(e.target.value),
									placeholder: "e.g. 192.168.1.0/24 or 192.168.1.* or 203.0.113.10",
									style: {
										padding: "6px 8px",
										fontSize: "11px",
										borderRadius: "6px",
										border: "1px solid var(--line)",
										background: "#fff",
										fontFamily: "monospace"
									},
									required: true
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "submit",
								className: "ui-button secondary",
								disabled: !manualIp.trim(),
								style: {
									height: "34px",
									fontSize: "11px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 12 }), " Add IP / Subnet"]
							})]
						})]
					}),
					officeNetworkIPs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							fontSize: "12px",
							color: "#92400e",
							background: "#fffbeb",
							border: "1px solid #fde68a",
							borderRadius: "8px",
							padding: "10px 12px"
						},
						children: "No office networks registered yet. Connect to your office Wi-Fi and click “Register this network”. Until then, attendance relies on the GPS geofence only."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: "8px"
						},
						children: officeNetworkIPs.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "10px 12px",
								background: "#faf9f5",
								border: "1px solid var(--line)",
								borderRadius: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "10px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
									size: 15,
									color: "var(--teal)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: {
										fontSize: "13px",
										fontFamily: "monospace"
									},
									children: entry.ip
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										marginTop: "2px"
									},
									children: [
										entry.label || "Office Network",
										" • added ",
										entry.addedAt || "—",
										myPublicIp === entry.ip ? " • this is your current network" : ""
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-button",
								onClick: storeAction(() => hrStore.removeOfficeNetworkIP(entry.ip, "Admin")),
								title: "Remove office network",
								style: { color: "#cb3a31" },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 })
							})]
						}, entry.ip))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Geofencing & Network"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
							"Verified Office Wi-Fi Networks (",
							wifiList.length,
							")"
						] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: "success",
							children: "Active for All Employees"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							margin: "8px 0 14px"
						},
						children: "Register the office network IP and actual office GPS coordinates. Browsers cannot read router SSID or BSSID; these names are descriptive metadata, not authentication. Strict punch-in requires both network and GPS checks."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						style: {
							display: "grid",
							gap: "8px",
							marginBottom: "16px"
						},
						children: wifiList.map((ssid) => {
							const matchedNetwork = wifiNetworks.find((n) => n.ssid === ssid);
							const branchLabel = matchedNetwork?.branchName || locations?.[0]?.name || "Office";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									padding: "10px 12px",
									background: "#faf9f5",
									border: "1px solid var(--line)",
									borderRadius: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "8px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
											size: 15,
											color: "var(--teal)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontSize: "13px" },
											children: ssid
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "wifi-verified-badge",
											style: { fontSize: "9px" },
											children: matchedNetwork?.securityType || "WPA2"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										fontSize: "10px",
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
										branchLabel,
										" (≤",
										storeState.companySettings?.attendanceRules?.maxGeofenceRadiusMeters || 50,
										"m) • BSSID: ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: { fontFamily: "monospace" },
											children: matchedNetwork?.bssid || "⚠ not set"
										})
									] })]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-button",
									onClick: storeAction(() => hrStore.removeWifiSSID(ssid, "Admin")),
									title: "Remove Wi-Fi Network",
									style: { color: "#cb3a31" },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { size: 13 })
								})]
							}, ssid);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleAddWifi,
						style: {
							background: "#f5f8f7",
							border: "1px solid rgba(29, 138, 122, 0.25)",
							borderRadius: "8px",
							padding: "12px",
							display: "grid",
							gap: "10px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								style: {
									fontSize: "11px",
									fontWeight: 700,
									color: "var(--teal)",
									display: "flex",
									alignItems: "center",
									gap: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 13 }), " Register New Office Router"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										display: "block",
										marginBottom: "2px"
									},
									children: "Wi-Fi SSID Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "e.g. Edufyi-Floor2-5G",
									value: newSSID,
									onChange: (e) => setNewSSID(e.target.value),
									style: {
										width: "100%",
										padding: "6px 10px",
										fontSize: "12px",
										background: "#fff"
									},
									required: true
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										display: "block",
										marginBottom: "2px"
									},
									children: "Router BSSID (MAC) - Optional"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									placeholder: "Optional (e.g. AA:BB:CC:DD:EE:FF)",
									value: newBSSID,
									onChange: (e) => setNewBSSID(e.target.value),
									style: {
										width: "100%",
										padding: "6px 10px",
										fontSize: "12px",
										background: "#fff",
										fontFamily: "monospace"
									}
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "8px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										display: "block",
										marginBottom: "2px"
									},
									children: "Security Type"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: newSecurityType,
									onChange: (e) => setNewSecurityType(e.target.value),
									style: {
										width: "100%",
										padding: "6px 8px",
										fontSize: "11px",
										borderRadius: "6px",
										border: "1px solid var(--line)",
										background: "#fff"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "WPA3-Enterprise",
											children: "WPA3-Enterprise"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "WPA2-Enterprise",
											children: "WPA2-Enterprise"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "WPA3-Personal",
											children: "WPA3-Personal"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "WPA2-Personal",
											children: "WPA2-Personal"
										})
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "10px",
										color: "var(--muted)",
										display: "block",
										marginBottom: "2px"
									},
									children: "Assign to Branch"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: wifiBranch,
									onChange: (e) => setWifiBranch(e.target.value),
									style: {
										width: "100%",
										padding: "6px 8px",
										fontSize: "11px",
										borderRadius: "6px",
										border: "1px solid var(--line)",
										background: "#fff"
									},
									children: [locations.map((loc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
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
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									marginTop: "2px"
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }), " Register & Activate for All"]
								})
							})
						]
					})
				]
			})] }),
			(activeConfigTab === "all" || activeConfigTab === "shifts") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { borderLeft: "4px solid #6366f1" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Attendance Policy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Shift Timing & Grace Period" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "role-badge",
							style: {
								fontSize: "10px",
								background: shiftStartTime && shiftEndTime ? "#dcfce7" : "#fef3c7",
								color: shiftStartTime && shiftEndTime ? "#166534" : "#92400e"
							},
							children: shiftStartTime && shiftEndTime ? "✓ Configured" : "⚠ Not Set"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							margin: "8px 0 16px"
						},
						children: [
							"Configure the default work shift timings for all employees. Attendance will be marked as ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Late" }),
							" if an employee punches in after the Work Start Time + Grace Period. These settings apply to all employees who do not have a specific shift assignment."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSaveShiftSettings,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								maxWidth: "720px",
								marginBottom: "16px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										background: "#f5f3ff",
										border: "1px solid #e0e7ff",
										borderRadius: "8px",
										padding: "16px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											style: {
												fontSize: "13.5px",
												display: "block",
												marginBottom: "12px"
											},
											children: "Default Shift Configuration"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "grid",
												gap: "12px",
												gridTemplateColumns: "1fr 1fr"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													style: {
														fontSize: "11px",
														display: "block",
														color: "var(--muted)",
														marginBottom: "3px"
													},
													children: "Work Start Time"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "time",
													className: "text-input",
													value: shiftStartTime,
													onChange: (e) => setShiftStartTime(e.target.value),
													style: {
														width: "100%",
														padding: "8px 10px",
														fontSize: "13px"
													},
													required: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10px",
														color: "var(--muted)",
														marginTop: "2px",
														display: "block"
													},
													children: shiftStartTime ? `Set to ${shiftStartTime}` : "e.g. 11:00 for 11:00 AM"
												})
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													style: {
														fontSize: "11px",
														display: "block",
														color: "var(--muted)",
														marginBottom: "3px"
													},
													children: "Work End Time"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "time",
													className: "text-input",
													value: shiftEndTime,
													onChange: (e) => setShiftEndTime(e.target.value),
													style: {
														width: "100%",
														padding: "8px 10px",
														fontSize: "13px"
													},
													required: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10px",
														color: "var(--muted)",
														marginTop: "2px",
														display: "block"
													},
													children: shiftEndTime ? `Set to ${shiftEndTime}` : "e.g. 20:00 for 8:00 PM"
												})
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: { marginTop: "12px" },
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													style: {
														fontSize: "11px",
														display: "block",
														color: "var(--muted)",
														marginBottom: "3px"
													},
													children: "Grace Period (minutes)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "number",
													min: "0",
													max: "120",
													className: "text-input",
													value: shiftGracePeriod,
													onChange: (e) => setShiftGracePeriod(e.target.value),
													style: {
														width: "120px",
														padding: "8px 10px",
														fontSize: "13px"
													}
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													style: {
														fontSize: "10px",
														color: "var(--muted)",
														marginTop: "2px",
														display: "block"
													},
													children: [
														"Employees arriving within ",
														shiftGracePeriod || 0,
														" minute(s) after start time will NOT be marked late."
													]
												})
											]
										}),
										shiftStartTime && shiftEndTime && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												marginTop: "14px",
												padding: "10px 12px",
												background: "#ede9fe",
												borderRadius: "6px",
												fontSize: "12px",
												color: "#4c1d95"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Preview:" }),
												" Shift ",
												shiftStartTime,
												" – ",
												shiftEndTime,
												" | Late after ",
												shiftStartTime ? (() => {
													const [h, m] = shiftStartTime.split(":").map(Number);
													const total = h * 60 + m + (Number(shiftGracePeriod) || 0);
													const newH = Math.floor(total / 60) % 24;
													const newM = total % 60;
													return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
												})() : "--:--",
												" (",
												shiftGracePeriod || 0,
												" min grace)"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: "16px",
										background: "#fffbeb",
										border: "1px solid #fde68a",
										borderRadius: "8px",
										padding: "16px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "10px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: {
													fontSize: "13.5px",
													color: "#92400e",
													display: "flex",
													alignItems: "center",
													gap: "6px"
												},
												children: "🍱 Automatic Lunch Break & Timer Pause"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													fontSize: "12px",
													fontWeight: 600,
													color: "#92400e",
													cursor: "pointer"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: lunchBreakAutoPause,
													onChange: (e) => setLunchBreakAutoPause(e.target.checked),
													style: {
														accentColor: "#d97706",
														width: "15px",
														height: "15px",
														cursor: "pointer"
													}
												}), "Enable Auto-Pause"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											style: {
												fontSize: "11.5px",
												color: "#78350f",
												margin: "0 0 12px"
											},
											children: "When enabled, the employee active work timer automatically pauses during the scheduled lunch window and resumes automatically. Attendance records will deduct this break without requiring employees to manually start/end breaks."
										}),
										lunchBreakAutoPause && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "grid",
												gap: "12px",
												gridTemplateColumns: "1fr 1fr"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													style: {
														fontSize: "11px",
														display: "block",
														color: "#92400e",
														marginBottom: "3px",
														fontWeight: 600
													},
													children: "Lunch Break Start Time"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "time",
													className: "text-input",
													value: lunchBreakStart,
													onChange: (e) => setLunchBreakStart(e.target.value),
													style: {
														width: "100%",
														padding: "8px 10px",
														fontSize: "13px",
														background: "#fff"
													},
													required: lunchBreakAutoPause
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10px",
														color: "#b45309",
														marginTop: "2px",
														display: "block"
													},
													children: "Default: 13:30 (1:30 PM)"
												})
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													style: {
														fontSize: "11px",
														display: "block",
														color: "#92400e",
														marginBottom: "3px",
														fontWeight: 600
													},
													children: "Lunch Break End Time"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "time",
													className: "text-input",
													value: lunchBreakEnd,
													onChange: (e) => setLunchBreakEnd(e.target.value),
													style: {
														width: "100%",
														padding: "8px 10px",
														fontSize: "13px",
														background: "#fff"
													},
													required: lunchBreakAutoPause
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													style: {
														fontSize: "10px",
														color: "#b45309",
														marginTop: "2px",
														display: "block"
													},
													children: "Default: 14:30 (2:30 PM)"
												})
											] })]
										}),
										lunchBreakAutoPause && lunchBreakStart && lunchBreakEnd && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												marginTop: "12px",
												padding: "8px 12px",
												background: "#fef3c7",
												borderRadius: "6px",
												fontSize: "12px",
												color: "#b45309",
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🍱" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Configured Lunch Window:" }),
												" ",
												(() => {
													const fmt = (t) => {
														const [h, m] = (t || "").split(":").map(Number);
														if (isNaN(h)) return t;
														const p = h >= 12 ? "PM" : "AM";
														return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;
													};
													const [sH, sM] = lunchBreakStart.split(":").map(Number);
													const [eH, eM] = lunchBreakEnd.split(":").map(Number);
													const diffMins = eH * 60 + eM - (sH * 60 + sM);
													return `${fmt(lunchBreakStart)} – ${fmt(lunchBreakEnd)} (${diffMins > 0 ? diffMins : 0} minutes auto-pause)`;
												})()
											] })]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: "16px",
										background: "#eff6ff",
										border: "1px solid #bfdbfe",
										borderRadius: "8px",
										padding: "16px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "10px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: {
													fontSize: "13.5px",
													color: "#1e40af",
													display: "flex",
													alignItems: "center",
													gap: "6px"
												},
												children: "📍 Engine A: Geofence Exit & Offline Auto Punch-Out"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													fontSize: "12px",
													fontWeight: 600,
													color: "#1e40af",
													cursor: "pointer"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: geofenceAutoPunchOutEnabled,
													onChange: (e) => setGeofenceAutoPunchOutEnabled(e.target.checked),
													style: {
														accentColor: "#2563eb",
														width: "15px",
														height: "15px",
														cursor: "pointer"
													}
												}), "Enable Geofence Monitoring"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											style: {
												fontSize: "11.5px",
												color: "#1e3a8a",
												margin: "0 0 12px"
											},
											children: "When an employee exits the authorized campus geofence, a 2-hour server grace period starts and a warning notification is sent. If they return inside within 2 hours, the session continues normally. If they do not return, the system automatically closes their shift."
										}),
										geofenceAutoPunchOutEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "grid",
												gap: "12px",
												gridTemplateColumns: "1fr 1fr"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														style: {
															fontSize: "11px",
															display: "block",
															color: "#1e40af",
															marginBottom: "3px",
															fontWeight: 600
														},
														children: "Geofence Grace Period (minutes)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "number",
														min: "15",
														max: "360",
														className: "text-input",
														value: geofenceGracePeriodMinutes,
														onChange: (e) => setGeofenceGracePeriodMinutes(e.target.value),
														style: {
															width: "100%",
															padding: "8px 10px",
															fontSize: "13px",
															background: "#fff"
														}
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: {
															fontSize: "10px",
															color: "#3b82f6",
															marginTop: "2px",
															display: "block"
														},
														children: "Default: 120 minutes (2 hours)"
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														style: {
															fontSize: "11px",
															display: "block",
															color: "#1e40af",
															marginBottom: "3px",
															fontWeight: 600
														},
														children: "GPS Accuracy Threshold (meters)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "number",
														min: "10",
														max: "200",
														className: "text-input",
														value: geofenceGpsAccuracyThresholdMeters,
														onChange: (e) => setGeofenceGpsAccuracyThresholdMeters(e.target.value),
														style: {
															width: "100%",
															padding: "8px 10px",
															fontSize: "13px",
															background: "#fff"
														}
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: {
															fontSize: "10px",
															color: "#3b82f6",
															marginTop: "2px",
															display: "block"
														},
														children: "Readings coarser than this (e.g. indoor drift) will not trigger false exit. Default: 50m"
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													style: {
														gridColumn: "span 2",
														display: "flex",
														gap: "20px",
														marginTop: "4px"
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														style: {
															display: "flex",
															alignItems: "center",
															gap: "6px",
															fontSize: "12px",
															color: "#1e40af",
															cursor: "pointer"
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: geofenceExitWarningEnabled,
															onChange: (e) => setGeofenceExitWarningEnabled(e.target.checked),
															style: { accentColor: "#2563eb" }
														}), "Send Warning Notification to Employee upon Geofence Exit"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														style: {
															display: "flex",
															alignItems: "center",
															gap: "6px",
															fontSize: "12px",
															color: "#1e40af",
															cursor: "pointer"
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: offlineAutoPunchOutEnabled,
															onChange: (e) => setOfflineAutoPunchOutEnabled(e.target.checked),
															style: { accentColor: "#2563eb" }
														}), "Enable Fallback Auto Punch-Out for Inactive/Offline Devices"]
													})]
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										marginTop: "16px",
										background: "#f0fdf4",
										border: "1px solid #bbf7d0",
										borderRadius: "8px",
										padding: "16px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "10px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: {
													fontSize: "13.5px",
													color: "#166534",
													display: "flex",
													alignItems: "center",
													gap: "6px"
												},
												children: "⏰ Engine B: Scheduled Daily Cut-Off Auto Punch-Out"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													fontSize: "12px",
													fontWeight: 600,
													color: "#166534",
													cursor: "pointer"
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: autoPunchOutEnabled,
													onChange: (e) => setAutoPunchOutEnabled(e.target.checked),
													style: {
														accentColor: "#16a34a",
														width: "15px",
														height: "15px",
														cursor: "pointer"
													}
												}), "Enable Daily Cut-Off"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											style: {
												fontSize: "11.5px",
												color: "#14532d",
												margin: "0 0 12px"
											},
											children: "A daily server safety mechanism. If an employee forgets to punch out manually, the system automatically closes their shift at the cut-off time (default: 09:30 PM). Active working hours are never interrupted during the day."
										}),
										autoPunchOutEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												display: "grid",
												gap: "12px",
												gridTemplateColumns: "1fr 1fr"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														style: {
															fontSize: "11px",
															display: "block",
															color: "#166534",
															marginBottom: "3px",
															fontWeight: 600
														},
														children: "Auto Punch-Out Cut-off Time"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "time",
														className: "text-input",
														value: autoPunchOutTime,
														onChange: (e) => setAutoPunchOutTime(e.target.value),
														style: {
															width: "100%",
															padding: "8px 10px",
															fontSize: "13px",
															background: "#fff"
														},
														required: autoPunchOutEnabled
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: {
															fontSize: "10px",
															color: "#15803d",
															marginTop: "2px",
															display: "block"
														},
														children: "Default: 21:30 (9:30 PM IST)"
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														style: {
															fontSize: "11px",
															display: "block",
															color: "#166534",
															marginBottom: "3px",
															fontWeight: 600
														},
														children: "Organization Timezone"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "text",
														className: "text-input",
														value: attendanceTimezone,
														onChange: (e) => setAttendanceTimezone(e.target.value),
														style: {
															width: "100%",
															padding: "8px 10px",
															fontSize: "13px",
															background: "#fff"
														},
														placeholder: "Asia/Kolkata"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														style: {
															fontSize: "10px",
															color: "#15803d",
															marginTop: "2px",
															display: "block"
														},
														children: "Used for accurate server-side time calculation (Default: Asia/Kolkata)"
													})
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													style: {
														gridColumn: "span 2",
														display: "flex",
														gap: "20px",
														marginTop: "4px"
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														style: {
															display: "flex",
															alignItems: "center",
															gap: "6px",
															fontSize: "12px",
															color: "#166534",
															cursor: "pointer"
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: dailyCutoffWarningEnabled,
															onChange: (e) => setDailyCutoffWarningEnabled(e.target.checked),
															style: { accentColor: "#16a34a" }
														}), "Send Advance Reminder Notification (15 min before cut-off)"]
													})
												})
											]
										}),
										autoPunchOutEnabled && autoPunchOutTime && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												marginTop: "12px",
												padding: "8px 12px",
												background: "#dcfce7",
												borderRadius: "6px",
												fontSize: "12px",
												color: "#15803d",
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⏰" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Cut-off Rule:" }),
												" Any employee who has checked in today and has not punched out by ",
												(() => {
													const [h, m] = (autoPunchOutTime || "21:30").split(":").map(Number);
													if (isNaN(h)) return autoPunchOutTime;
													const p = h >= 12 ? "PM" : "AM";
													return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${p}`;
												})(),
												" will be automatically punched out."
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												marginTop: "14px",
												paddingTop: "12px",
												borderTop: "1px dashed #bbf7d0",
												display: "flex",
												alignItems: "center",
												justifyContent: "space-between",
												flexWrap: "wrap",
												gap: "8px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "11.5px",
													color: "#166534",
													fontWeight: 700,
													display: "block"
												},
												children: "On-Demand / Catch-Up Auto Punch-Out"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												style: {
													fontSize: "10.5px",
													color: "#15803d"
												},
												children: "Immediately finalizes unclosed past sessions (e.g. yesterday) and executes scheduled cut-off on demand."
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												disabled: executingAutoPunch,
												onClick: async () => {
													try {
														setExecutingAutoPunch(true);
														setAutoPunchFeedback(null);
														const res = await hrStore.triggerAutoPunchOut();
														setAutoPunchFeedback({
															type: "success",
															text: res?.message || "Auto punch-out executed successfully."
														});
													} catch (err) {
														setAutoPunchFeedback({
															type: "error",
															text: `Execution failed: ${err.message}`
														});
													} finally {
														setExecutingAutoPunch(false);
													}
												},
												style: {
													fontSize: "11.5px",
													fontWeight: 600,
													padding: "6px 14px",
													borderRadius: "6px",
													background: "#166534",
													color: "#ffffff",
													border: "none",
													cursor: executingAutoPunch ? "not-allowed" : "pointer",
													display: "inline-flex",
													alignItems: "center",
													gap: "6px",
													opacity: executingAutoPunch ? .7 : 1
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚡" }),
													" ",
													executingAutoPunch ? "Running Cut-Off Sweep..." : "Execute Auto Punch-Out Now"
												]
											})]
										}),
										autoPunchFeedback && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												marginTop: "8px",
												padding: "8px 12px",
												borderRadius: "6px",
												fontSize: "11.5px",
												fontWeight: 600,
												background: autoPunchFeedback.type === "success" ? "#dcfce7" : "#fee2e2",
												color: autoPunchFeedback.type === "success" ? "#166534" : "#991b1b",
												border: `1px solid ${autoPunchFeedback.type === "success" ? "#86efac" : "#fca5a5"}`
											},
											children: autoPunchFeedback.text
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								alignItems: "center"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: shiftSaving,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }),
									" ",
									shiftSaving ? "Saving Shift..." : "Save Shift Settings"
								]
							})
						})]
					})
				]
			}),
			(activeConfigTab === "all" || activeConfigTab === "helpdesk") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { borderLeft: "4px solid #0284c7" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Support Infrastructure"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Help Desk Configuration & Ticket Routing" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
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
						onSubmit: handleSaveHelpDeskSettings,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								maxWidth: "720px",
								marginBottom: "16px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#f0f9ff",
									border: "1px solid #bae6fd",
									borderRadius: "8px",
									padding: "16px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: {
											fontSize: "13.5px",
											color: "#0369a1"
										},
										children: "Department Support Routing Emails"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "#/admin/helpdesk",
										style: {
											fontSize: "11px",
											color: "#0284c7",
											textDecoration: "none",
											fontWeight: 600
										},
										children: "View Help Desk Queue →"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gap: "16px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											style: {
												background: "#fff",
												border: "1px solid #bfdbfe",
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
														children: "IT CHANNEL"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
														style: {
															fontSize: "13px",
															color: "#0f172a"
														},
														children: "Dedicated IT Support Assignment"
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
															children: "Dispatch SMTP Address:"
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
												paddingTop: "12px",
												marginTop: "4px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												style: {
													fontSize: "12.5px",
													color: "#0369a1",
													display: "block",
													marginBottom: "10px"
												},
												children: "Ticket Workflow & Automation Rules"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												style: {
													display: "grid",
													gap: "10px"
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														style: {
															fontSize: "11px",
															display: "block",
															color: "var(--muted)",
															marginBottom: "3px"
														},
														children: "Default Ticket Priority"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
														className: "text-input",
														value: defaultPriority,
														onChange: (e) => setDefaultPriority(e.target.value),
														style: {
															width: "100%",
															padding: "6px 10px",
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
															id: "autoAssignManager",
															checked: autoAssignToManager,
															onChange: (e) => setAutoAssignToManager(e.target.checked),
															style: { cursor: "pointer" }
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
															htmlFor: "autoAssignManager",
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
															id: "emailNotifs",
															checked: emailNotificationsEnabled,
															onChange: (e) => setEmailNotificationsEnabled(e.target.checked),
															style: { cursor: "pointer" }
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
															htmlFor: "emailNotifs",
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
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								alignItems: "center"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: helpDeskSaving,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }),
									" ",
									helpDeskSaving ? "Saving Help Desk..." : "Save Help Desk Settings"
								]
							})
						})]
					})
				]
			}),
			(activeConfigTab === "all" || activeConfigTab === "policies") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { borderLeft: "4px solid var(--teal)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Operating Policies"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Annual Leave Quotas & Approval Rules" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "role-badge",
							style: { fontSize: "10px" },
							children: "Global Defaults"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							margin: "8px 0 16px"
						},
						children: "Define enterprise-wide annual employee paid leave entitlements and multi-tier approval workflows."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSavePolicies,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							style: {
								maxWidth: "720px",
								marginBottom: "16px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#faf9f5",
									border: "1px solid var(--line)",
									borderRadius: "8px",
									padding: "16px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "12px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										style: { fontSize: "13.5px" },
										children: "Annual Leave Quotas & Approval Rules"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "#/admin/leave",
										style: {
											fontSize: "11px",
											color: "var(--teal)",
											textDecoration: "none",
											fontWeight: 600
										},
										children: "Advanced Leave Engine →"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gap: "10px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											style: {
												fontSize: "11px",
												display: "block",
												color: "var(--muted)",
												marginBottom: "3px"
											},
											children: "Casual Leave (CL) Quota / Year"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "0",
											max: "60",
											className: "text-input",
											value: casualQuota,
											onChange: (e) => setCasualQuota(e.target.value),
											style: {
												width: "100%",
												padding: "5px 8px",
												fontSize: "12px"
											},
											required: true
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											style: {
												fontSize: "11px",
												display: "block",
												color: "var(--muted)",
												marginBottom: "3px"
											},
											children: "Sick Leave (SL) Quota / Year"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "0",
											max: "60",
											className: "text-input",
											value: sickQuota,
											onChange: (e) => setSickQuota(e.target.value),
											style: {
												width: "100%",
												padding: "5px 8px",
												fontSize: "12px"
											},
											required: true
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											style: {
												fontSize: "11px",
												display: "block",
												color: "var(--muted)",
												marginBottom: "3px"
											},
											children: "Earned / Paid Leave (EL/PL) Quota / Year"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "0",
											max: "60",
											className: "text-input",
											value: earnedQuota,
											onChange: (e) => setEarnedQuota(e.target.value),
											style: {
												width: "100%",
												padding: "5px 8px",
												fontSize: "12px"
											},
											required: true
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											style: {
												fontSize: "11px",
												display: "block",
												color: "var(--muted)",
												marginBottom: "3px"
											},
											children: "Max Carry-Forward Days to Next Year"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "0",
											max: "30",
											className: "text-input",
											value: maxCarry,
											onChange: (e) => setMaxCarry(e.target.value),
											style: {
												width: "100%",
												padding: "5px 8px",
												fontSize: "12px"
											},
											required: true
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											style: {
												fontSize: "11px",
												display: "block",
												color: "var(--muted)",
												marginBottom: "3px"
											},
											children: "Leave Approval Workflow"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "text-input",
											value: approvalWorkflow,
											onChange: (e) => setApprovalWorkflow(e.target.value),
											style: {
												width: "100%",
												padding: "5px 8px",
												fontSize: "12px",
												background: "#fff"
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "manager_hr",
													children: "Assigned Manager then HR Review"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "manager",
													children: "Assigned Manager Review Only"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "hr",
													children: "HR Operations Review Only"
												})
											]
										})] })
									]
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								justifyContent: "flex-end",
								gap: "10px",
								alignItems: "center"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "btn btn-secondary",
								disabled: recalculating,
								onClick: handleRecalculateAttendance,
								style: {
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									padding: "8px 14px",
									fontSize: "12px",
									fontWeight: 600,
									background: "#fef3c7",
									border: "1px solid #fde68a",
									color: "#92400e",
									borderRadius: "8px",
									cursor: recalculating ? "wait" : "pointer"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "⚡" }),
									" ",
									recalculating ? "Recalculating Roster..." : "Recalculate Today's Attendance"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }), " Save Organization Policies"]
							})]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HolidayCalendarShowcase, {
				canManage: true,
				user
			})] }),
			editingCampus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModalPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "payslip-voucher-overlay",
				style: {
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: "rgba(15, 23, 42, 0.75)",
					backdropFilter: "blur(4px)",
					zIndex: 99999,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "16px"
				},
				onClick: () => setEditingCampus(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "payslip-voucher",
					onClick: (e) => e.stopPropagation(),
					style: {
						maxWidth: "580px",
						width: "100%",
						maxHeight: "90vh",
						overflowY: "auto",
						borderRadius: "16px",
						background: "#ffffff",
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
						padding: "24px"
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								gap: "8px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, {
								size: 18,
								color: "var(--teal)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
								style: {
									margin: 0,
									fontSize: "17px",
									fontWeight: 700,
									color: "var(--ink)"
								},
								children: ["Configure Campus: ", editingCampus.name]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setEditingCampus(null),
							style: {
								border: "none",
								background: "transparent",
								cursor: "pointer",
								color: "var(--muted)"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSaveCampusEdit,
						style: {
							display: "grid",
							gap: "16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: "12px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										color: "var(--ink)",
										display: "block",
										marginBottom: "4px"
									},
									children: "Campus Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									value: editingName,
									onChange: (e) => setEditingName(e.target.value),
									style: {
										width: "100%",
										padding: "8px 10px",
										fontSize: "13px"
									},
									required: true
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									style: {
										fontSize: "11.5px",
										fontWeight: 600,
										color: "var(--ink)",
										display: "block",
										marginBottom: "4px"
									},
									children: "City / Region"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									className: "text-input",
									value: editingCity,
									onChange: (e) => setEditingCity(e.target.value),
									style: {
										width: "100%",
										padding: "8px 10px",
										fontSize: "13px"
									},
									required: true
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#f0fdfa",
									border: "1px solid #99f6e4",
									borderRadius: "10px",
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
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											style: {
												fontSize: "12px",
												fontWeight: 700,
												color: "#134e4a",
												display: "flex",
												alignItems: "center",
												gap: "6px"
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
												size: 14,
												color: "#0d9488"
											}), " Campus Geofence Radius (meters)"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											style: {
												fontSize: "11px",
												fontWeight: 700,
												color: "#0d9488",
												background: "#ccfbf1",
												padding: "2px 8px",
												borderRadius: "10px"
											},
											children: [editingRadius, "m Radius"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "flex",
											gap: "8px",
											alignItems: "center",
											marginBottom: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											min: "1",
											max: "1000",
											className: "text-input",
											value: editingRadius,
											onChange: (e) => setEditingRadius(e.target.value),
											style: {
												width: "120px",
												padding: "7px 10px",
												fontSize: "13px",
												fontWeight: 700
											},
											required: true
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											style: {
												display: "flex",
												gap: "5px",
												flexWrap: "wrap"
											},
											children: [
												30,
												50,
												100,
												200,
												500
											].map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setEditingRadius(preset),
												style: {
													padding: "4px 10px",
													fontSize: "11px",
													borderRadius: "6px",
													border: "1px solid #99f6e4",
													background: Number(editingRadius) === preset ? "#0d9488" : "#fff",
													color: Number(editingRadius) === preset ? "#fff" : "#0d9488",
													cursor: "pointer",
													fontWeight: 600
												},
												children: [preset, "m"]
											}, preset))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
										style: {
											fontSize: "10.5px",
											color: "#115e59",
											display: "block",
											lineHeight: 1.3
										},
										children: [
											"Employees within ",
											editingRadius,
											"m of this campus center will be verified as ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "ON-SITE" }),
											"."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#faf9f5",
									border: "1px solid var(--line)",
									borderRadius: "10px",
									padding: "14px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										marginBottom: "8px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "12px",
											fontWeight: 700,
											color: "var(--ink)"
										},
										children: "Campus Center GPS Coordinates"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: handleDetectEditCoords,
										disabled: detectingEditGps,
										style: {
											display: "inline-flex",
											alignItems: "center",
											gap: "4px",
											padding: "4px 10px",
											fontSize: "11px",
											fontWeight: 600,
											borderRadius: "6px",
											border: "1px solid var(--teal)",
											background: "#eaf4f1",
											color: "var(--teal)",
											cursor: detectingEditGps ? "wait" : "pointer"
										},
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { size: 11 }),
											" ",
											detectingEditGps ? "Capturing GPS…" : "Capture Live GPS"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "10px"
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											display: "block",
											marginBottom: "2px"
										},
										children: "Latitude"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										step: "any",
										min: "-90",
										max: "90",
										className: "text-input",
										placeholder: "e.g. 12.909980",
										value: editingLat,
										onChange: (e) => setEditingLat(e.target.value),
										style: {
											width: "100%",
											padding: "7px 10px",
											fontSize: "12.5px",
											fontFamily: "monospace"
										},
										required: true
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										style: {
											fontSize: "10.5px",
											color: "var(--muted)",
											display: "block",
											marginBottom: "2px"
										},
										children: "Longitude"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										step: "any",
										min: "-180",
										max: "180",
										className: "text-input",
										placeholder: "e.g. 77.651740",
										value: editingLng,
										onChange: (e) => setEditingLng(e.target.value),
										style: {
											width: "100%",
											padding: "7px 10px",
											fontSize: "12.5px",
											fontFamily: "monospace"
										},
										required: true
									})] })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#f8fafc",
									border: "1px solid #e2e8f0",
									borderRadius: "10px",
									padding: "14px"
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										style: {
											fontSize: "12px",
											fontWeight: 700,
											color: "var(--ink)",
											display: "flex",
											alignItems: "center",
											gap: "6px",
											marginBottom: "8px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, {
											size: 14,
											color: "var(--teal)"
										}), " Link Office Wi-Fi Router (Optional)"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										style: {
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "10px"
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "text-input",
											placeholder: "Wi-Fi SSID (e.g. Edufyi-Campus-5G)",
											value: editingWifiSSID,
											onChange: (e) => setEditingWifiSSID(e.target.value),
											style: {
												width: "100%",
												padding: "7px 10px",
												fontSize: "12px"
											}
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "text",
											className: "text-input",
											placeholder: "Router BSSID / MAC (Optional)",
											value: editingWifiBSSID,
											onChange: (e) => setEditingWifiBSSID(e.target.value),
											style: {
												width: "100%",
												padding: "7px 10px",
												fontSize: "12px",
												fontFamily: "monospace"
											}
										}) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
										style: {
											fontSize: "10px",
											color: "var(--muted)",
											marginTop: "4px",
											display: "block"
										},
										children: "Leaving this blank will preserve already linked Wi-Fi networks."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									display: "flex",
									justifyContent: "flex-end",
									gap: "10px",
									marginTop: "6px"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "ui-button secondary",
									onClick: () => setEditingCampus(null),
									style: {
										padding: "8px 16px",
										fontSize: "12px"
									},
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									disabled: campusSaving,
									style: {
										padding: "8px 18px",
										fontSize: "12px"
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 13 }),
										" ",
										campusSaving ? "Saving Campus..." : "Save Campus Settings"
									]
								})]
							})
						]
					})]
				})
			}) })
		]
	});
}
function AdminReportsModule() {
	const [storeState, setStoreState] = (0, import_react.useState)(() => hrStore.getState());
	const [reportType, setReportType] = (0, import_react.useState)("attendance");
	(0, import_react.useEffect)(() => {
		return hrStore.subscribe((state) => setStoreState({
			...state,
			companySettings: {
				...state.companySettings || {},
				locations: [...state.companySettings?.locations || []]
			},
			holidays: [...state.holidays || []]
		}));
	}, []);
	const attendance = storeState.attendance || [];
	const leaves = storeState.leaves || [];
	const payroll = storeState.payroll || [];
	const expenses = storeState.expenses || [];
	function exportCSV() {
		let headers = [];
		let rows = [];
		let filename = `edufyi_${reportType}_report_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
		if (reportType === "attendance") {
			headers = [
				"Date",
				"Employee ID",
				"Employee Name",
				"Check In",
				"Check Out",
				"Total Hours",
				"Wi-Fi Network",
				"Status"
			];
			rows = attendance.map((a) => [
				a.date,
				a.employeeId,
				a.employeeName,
				a.checkIn || "-",
				a.checkOut || "-",
				a.totalHours || "-",
				a.customWifi || "Office-5G",
				a.status
			]);
		} else if (reportType === "leave") {
			headers = [
				"Leave ID",
				"Employee ID",
				"Employee Name",
				"Leave Type",
				"Start Date",
				"End Date",
				"Days",
				"Status"
			];
			rows = leaves.map((l) => [
				l.id,
				l.employeeId,
				l.employeeName,
				l.leaveType,
				l.startDate,
				l.endDate,
				l.days || 1,
				l.status
			]);
		} else if (reportType === "salary") {
			headers = [
				"Record ID",
				"Employee ID",
				"Employee Name",
				"Month",
				"Gross (INR)",
				"Deductions (INR)",
				"Net (INR)",
				"Status"
			];
			rows = payroll.map((p) => [
				p.id,
				p.employeeId,
				p.employeeName,
				p.month,
				p.gross,
				p.totalDeductions,
				p.net,
				p.status
			]);
		} else if (reportType === "expenses") {
			headers = [
				"Claim ID",
				"Employee Name",
				"Category",
				"Merchant",
				"Amount (INR)",
				"Date",
				"Status"
			];
			rows = expenses.map((e) => [
				e.id,
				e.employeeName,
				e.category,
				e.merchant,
				e.amount,
				e.date,
				e.status
			]);
		}
		const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(","))].join("\n");
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Intelligence & Audits",
				title: "Reports & Analytics Hub",
				description: "Comprehensive reports on workforce attendance, leave utilization, company payroll disbursements, and expense reimbursements.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "ui-button primary",
					onClick: exportCSV,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), " Export to CSV"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					display: "flex",
					gap: "8px",
					borderBottom: "1px solid var(--line)",
					paddingBottom: "12px"
				},
				children: [
					{
						id: "attendance",
						label: "Attendance Timesheets"
					},
					{
						id: "leave",
						label: "Leave Utilization"
					},
					{
						id: "salary",
						label: "Payroll & Compensation"
					},
					{
						id: "expenses",
						label: "Expense Claims"
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `ui-button ${reportType === t.id ? "primary" : "secondary"}`,
					style: { fontSize: "11px" },
					onClick: () => setReportType(t.id),
					children: t.label
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Dataset"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						style: { textTransform: "capitalize" },
						children: [reportType, " Master Dataset"]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "11px",
							color: "var(--muted)"
						},
						children: "Live Reactive Data"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						marginTop: "16px",
						overflowX: "auto"
					},
					children: [
						reportType === "attendance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "ui-table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Date" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Check In" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Check Out" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total Hours" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Wi-Fi Network" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: attendance.slice(0, 15).map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.date }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: a.employeeName }),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", {
										style: { color: "var(--muted)" },
										children: [
											"(",
											a.employeeId,
											")"
										]
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.checkIn || "-" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.checkOut || "-" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: a.totalHours || "8h 00m" }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.customWifi || "Edufyi-Office-5G" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: a.status === "present" ? "success" : "warning",
									children: a.status
								}) })
							] }, i)) })]
						}),
						reportType === "leave" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "ui-table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Leave ID" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Dates" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Days" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: leaves.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: l.id }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.employeeName }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "role-badge",
									style: { fontSize: "9px" },
									children: l.leaveType
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
									l.startDate,
									" – ",
									l.endDate
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [l.days || 1, " Days"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: l.status === "approved" ? "success" : l.status === "rejected" ? "danger" : "warning",
									children: l.status
								}) })
							] }, l.id)) })]
						}),
						reportType === "salary" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "ui-table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Slip ID" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Month" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Gross Pay" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Deductions" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Net Salary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: payroll.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.id }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.employeeName || "Staff Member" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.month }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatINR(p.gross) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatINR(p.totalDeductions) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									style: { color: "var(--teal)" },
									children: formatINR(p.net)
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: "success",
									children: p.status
								}) })
							] }, p.id)) })]
						}),
						reportType === "expenses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "ui-table",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Claim ID" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Employee" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Category" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Merchant" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Amount" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" })
							] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: expenses.map((e, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: e.id }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.employeeName }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.category }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.merchant }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: formatINR(e.amount) }) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									tone: e.status === "approved" ? "success" : "warning",
									children: e.status
								}) })
							] }, idx)) })]
						})
					]
				})]
			})
		]
	});
}
function AdminSystemModule() {
	const [backupNotice, setBackupNotice] = (0, import_react.useState)("");
	const [pingLatency, setPingLatency] = (0, import_react.useState)(null);
	const [dbLatency, setDbLatency] = (0, import_react.useState)(null);
	const [pinging, setPinging] = (0, import_react.useState)(false);
	async function testBackendPing() {
		setPinging(true);
		try {
			await fetch("/api/v1/health", { cache: "no-store" }).catch(() => {});
			const start = performance.now();
			const res = await fetch("/api/v1/health", { cache: "no-store" });
			const end = performance.now();
			const ms = Math.round(end - start);
			setPingLatency(ms);
			if (res.ok) {
				const dbMs = (await res.json().catch(() => ({})))?.data?.dbPingMs ?? 0;
				setDbLatency(dbMs);
				setBackupNotice(`Database Health: OK (HTTP 200) • Direct DB Ping: ${dbMs}ms • Network RTT: ${ms}ms`);
			} else setBackupNotice(`Database Ping Warning: HTTP ${res.status} • Network RTT: ${ms}ms`);
		} catch {
			setBackupNotice("Database ping note: Connection timed out or unreachable.");
		} finally {
			setPinging(false);
			setTimeout(() => setBackupNotice(""), 6e3);
		}
	}
	const handleExportSnapshot = workspaceAction(hrStore, async () => {
		await hrStore.refresh();
		const state = hrStore.getState();
		if (!state.dataReady || state.dataError) throw new Error(state.dataError || "Load authorized data before exporting a snapshot.");
		const keys = [
			"employees",
			"users",
			"attendance",
			"leaves",
			"payroll",
			"leaveBalances",
			"companySettings",
			...workspaceKeys
		];
		const jsonStr = JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			data: Object.fromEntries(keys.map((key) => [key, state[key]]))
		}, null, 2);
		const blob = new Blob([jsonStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", `edufyi_authorized_snapshot_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		setBackupNotice("Exported authorized data snapshot. This is not a database backup and cannot be restored through the browser.");
		setTimeout(() => setBackupNotice(""), 4e3);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: {
			display: "grid",
			gap: "22px"
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Infrastructure & Resilience",
				title: "System Configuration & Snapshot Export",
				description: "Statutory government portal links and export of data authorized for your current session. Database backup and recovery require server-side tools."
			}),
			backupNotice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
				}), backupNotice]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				style: { borderLeft: "4px solid var(--teal)" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "section-kicker",
							children: "Data Store Engine"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Live Database & API Connectivity" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontSize: "11px",
								padding: "3px 8px",
								borderRadius: "999px",
								background: "var(--soft-teal)",
								color: "var(--teal)",
								fontWeight: 700
							},
							children: "● Real Database Engine Active"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						style: {
							fontSize: "12px",
							color: "var(--muted)",
							margin: "8px 0 14px"
						},
						children: "Backend REST API on port 30000 connected to persistent store engine (MongoDB / Local JSON Database). Real-time synchronized across all admin and HR modules."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
							gap: "12px",
							marginBottom: "16px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#faf9f5",
									padding: "12px",
									borderRadius: "6px",
									border: "1px solid var(--line)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										textTransform: "uppercase",
										color: "var(--muted)",
										fontWeight: 700
									},
									children: "Service URL"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "13px",
										fontWeight: 600,
										color: "var(--ink)",
										marginTop: "2px"
									},
									children: "/api/v1 (Port 30000)"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#faf9f5",
									padding: "12px",
									borderRadius: "6px",
									border: "1px solid var(--line)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										textTransform: "uppercase",
										color: "var(--muted)",
										fontWeight: 700
									},
									children: "Database Engine"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "13px",
										fontWeight: 600,
										color: "var(--teal)",
										marginTop: "2px"
									},
									children: "Persistent MongoDB"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#faf9f5",
									padding: "12px",
									borderRadius: "6px",
									border: "1px solid var(--line)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										textTransform: "uppercase",
										color: "var(--muted)",
										fontWeight: 700
									},
									children: "DB Engine Latency"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "13px",
										fontWeight: 600,
										color: "var(--teal)",
										marginTop: "2px"
									},
									children: dbLatency !== null ? `${dbLatency} ms (Direct)` : "< 1 ms (Ready)"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#faf9f5",
									padding: "12px",
									borderRadius: "6px",
									border: "1px solid var(--line)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										textTransform: "uppercase",
										color: "var(--muted)",
										fontWeight: 700
									},
									children: "Network Latency (RTT)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "13px",
										fontWeight: 600,
										color: pingLatency ? pingLatency < 150 ? "var(--teal)" : "#b45309" : "#666",
										marginTop: "2px"
									},
									children: pingLatency !== null ? `${pingLatency} ms (Verified)` : "Ready to Test"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								style: {
									background: "#faf9f5",
									padding: "12px",
									borderRadius: "6px",
									border: "1px solid var(--line)"
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									style: {
										fontSize: "9px",
										textTransform: "uppercase",
										color: "var(--muted)",
										fontWeight: 700
									},
									children: "Collections Active"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									style: {
										fontSize: "13px",
										fontWeight: 600,
										color: "var(--ink)",
										marginTop: "2px"
									},
									children: "Users, Employees, Payroll, Leaves"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "ui-button secondary",
						onClick: testBackendPing,
						disabled: pinging,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { size: 13 }),
							" ",
							pinging ? "Pinging Real Database API..." : "Ping Live Database Engine"
						]
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
							children: "Government Portals"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Statutory Compliance Links" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							tone: "info",
							children: "Live"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						style: {
							display: "grid",
							gap: "10px",
							marginTop: "14px"
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
								target: "_blank",
								rel: "noreferrer",
								className: "panel-footer-link",
								style: { justifyContent: "space-between" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "EPFO Member & Employer Portal (EPF)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://www.esic.in/ESICInsurancePortal/PortalLogin.aspx",
								target: "_blank",
								rel: "noreferrer",
								className: "panel-footer-link",
								style: { justifyContent: "space-between" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ESIC Corporate Health Insurance Portal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "https://www.incometax.gov.in/iec/foportal/",
								target: "_blank",
								rel: "noreferrer",
								className: "panel-footer-link",
								style: { justifyContent: "space-between" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Income Tax TDS & Form 16 e-Filing Hub" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { size: 12 })]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "panel-heading",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "section-kicker",
								children: "Data Integrity"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Authorized Snapshot Export" })] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							style: {
								fontSize: "12px",
								color: "var(--muted)",
								margin: "8px 0 16px"
							},
							children: "Export freshly loaded records authorized for this session. This export is not a database backup. Browser JSON restore and demo reset are disabled; use controlled server-side database backup and recovery procedures."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								gap: "8px"
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button primary",
									onClick: handleExportSnapshot,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 13 }), " Export Authorized Snapshot"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									disabled: true,
									title: "Browser restore is disabled. Use server-side database recovery tools.",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 13 }), " Browser Restore Disabled"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "ui-button secondary",
									style: { color: "#cb3a31" },
									disabled: true,
									title: "Demo reset is disabled for persisted API data.",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { size: 13 }), " Demo Reset Disabled"]
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "section-kicker",
						children: "Live Telemetry"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "System Engine Status" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						style: {
							fontSize: "10px",
							color: "var(--teal)",
							fontWeight: 600
						},
						children: "● Active Cluster: node-1 (Local)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
						gap: "12px",
						marginTop: "14px",
						fontSize: "11px"
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px",
								borderRadius: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase"
								},
								children: "Memory Allocation"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "64.2 MB RSS"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px",
								borderRadius: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase"
								},
								children: "API Latency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									marginTop: "2px",
									color: "var(--teal)"
								},
								children: "12 ms avg"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px",
								borderRadius: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase"
								},
								children: "JWT Secret Rotation"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "Active (HS256)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: {
								background: "#faf9f5",
								padding: "12px",
								borderRadius: "6px"
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								style: {
									color: "var(--muted)",
									fontSize: "9px",
									textTransform: "uppercase"
								},
								children: "Vite Proxy Port"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								style: {
									fontSize: "14px",
									fontWeight: 600,
									marginTop: "2px"
								},
								children: "30000 ➔ 5173"
							})]
						})
					]
				})]
			})
		]
	});
}
function AdminDashboardPage({ route }) {
	const user = useAuth()?.user;
	const p = route?.path || "/admin";
	if (p === "/admin/users") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersModule, {});
	if (p === "/admin/roles") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminRolesModule, {});
	if (p === "/admin/departments") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDepartmentsModule, {});
	if (p === "/admin/settings") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSettingsModule, { user });
	if (p === "/admin/reports") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminReportsModule, {});
	if (p === "/admin/system" || p === "/admin/logs") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSystemModule, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminOverviewModule, {});
}
export { AdminDashboardPage, AdminUsersModule };
